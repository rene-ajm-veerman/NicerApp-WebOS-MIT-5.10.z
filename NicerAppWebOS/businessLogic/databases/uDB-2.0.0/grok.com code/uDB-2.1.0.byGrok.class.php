<?php

declare(strict_types=1);

/**
 * uDB2 - Universal Database 2.0
 * MongoDB-style queries over SQL (MySQL + PostgreSQL + SQLite) via ADOdb
 */
class uDB2
{
    private \ADOConnection $db;
    private string $driver;           // 'mysqli', 'pgsql', 'sqlite3', etc.
    private bool   $useJsonColumns = true;

    public function __construct(\ADOConnection $adodbConnection, string $driver)
    {
        $this->db = $adodbConnection;
        $this->driver = strtolower($driver);

        // Auto-detect JSON support
        if (in_array($this->driver, ['mysqli', 'mysql', 'pgsql', 'sqlite3'])) {
            $this->useJsonColumns = true;
        }
    }

    // ====================== CRUD ======================

    public function find(string $table, array $query = [], array $projection = [], ?int $limit = null, ?int $skip = null): array
    {
        $sql = $this->buildSelectSql($table, $query, $projection, $limit, $skip);
        $rs = $this->db->Execute($sql['sql'], $sql['params'] ?? []);

        return $rs ? $rs->GetRows() : [];
    }

    public function findOne(string $table, array $query = [], array $projection = []): ?array
    {
        $result = $this->find($table, $query, $projection, 1);
        return $result[0] ?? null;
    }

    public function count(string $table, array $query = []): int
    {
        $sql = $this->buildCountSql($table, $query);
        return (int)$this->db->GetOne($sql['sql'], $sql['params'] ?? []);
    }

    public function insert(string $table, array $document): string|int
    {
        // Handle nested documents → JSON columns if needed
        $doc = $this->prepareDocumentForInsert($document);
        $sql = $this->buildInsertSql($table, $doc);

        $this->db->Execute($sql['sql'], $sql['params']);
        return $this->db->Insert_ID() ?: 'inserted';
    }

    public function insertMany(string $table, array $documents): int
    {
        $count = 0;
        foreach ($documents as $doc) {
            $this->insert($table, $doc);
            $count++;
        }
        return $count;
    }

    public function updateMany(string $table, array $query, array $update): int
    {
        $sql = $this->buildUpdateSql($table, $query, $update);
        $rs = $this->db->Execute($sql['sql'], $sql['params'] ?? []);
        return $rs ? $this->db->Affected_Rows() : 0;
    }

    public function deleteMany(string $table, array $query): int
    {
        $sql = $this->buildDeleteSql($table, $query);
        $rs = $this->db->Execute($sql['sql'], $sql['params'] ?? []);
        return $rs ? $this->db->Affected_Rows() : 0;
    }

    // ====================== Aggregation (Phase 1) ======================
    public function aggregate(string $table, array $pipeline): array
    {
        // We'll implement stage by stage: $match, $project, $sort, $limit, $group, etc.
        return $this->executePipeline($table, $pipeline);
    }

    // ====================== Translator Helpers (Core) ======================
    private function buildSelectSql(string $table, array $query, array $projection, ?int $limit, ?int $skip): array
    {
        // This will be the heavy part - Mongo query → SQL WHERE + JSON_EXTRACT / ->> etc.
        $where = $this->translateQueryToWhere($query);
        $fields = $this->translateProjection($projection);

        $sql = "SELECT $fields FROM `$table`";
        if ($where['sql']) {
            $sql .= " WHERE " . $where['sql'];
        }

        if ($skip !== null)  $sql .= " OFFSET " . (int)$skip;
        if ($limit !== null) $sql .= " LIMIT " . (int)$limit;

        return ['sql' => $sql, 'params' => $where['params'] ?? []];
    }

    // More translator methods will go here...
    // ====================== Core Query Translator ======================

    /**
     * Translate MongoDB-style query array into SQL WHERE clause + parameters
     * Supports: $eq, $ne, $gt, $gte, $lt, $lte, $in, $nin, $regex, $exists,
     *           $and, $or, $not, $nor, and nested field access (via JSON)
     */
    private function translateQueryToWhere(array $query): array
    {
        if (empty($query)) {
            return ['sql' => '', 'params' => []];
        }

        $conditions = [];
        $params = [];

        foreach ($query as $field => $value) {
            if (str_starts_with($field, '$')) {
                // Top-level logical operators
                $result = $this->translateLogicalOperator($field, $value);
                if ($result['sql']) {
                    $conditions[] = $result['sql'];
                    $params = array_merge($params, $result['params']);
                }
            } else {
                // Field condition (can be simple value or operator object)
                $result = $this->translateFieldCondition($field, $value);
                if ($result['sql']) {
                    $conditions[] = $result['sql'];
                    $params = array_merge($params, $result['params']);
                }
            }
        }

        $sql = !empty($conditions)
        ? '(' . implode(' AND ', $conditions) . ')'
        : '';

        return ['sql' => $sql, 'params' => $params];
    }

    private function translateFieldCondition(string $field, mixed $value): array
    {
        $conditions = [];
        $params = [];

        // Simple equality: { "status": "active" }
        if (!is_array($value)) {
            $conditions[] = $this->jsonField($field) . ' = ?';
            $params[] = $this->prepareValue($value);
            return ['sql' => implode(' AND ', $conditions), 'params' => $params];
        }

        // Operator-based: { "age": { "$gte": 18, "$lt": 65 } }
        foreach ($value as $op => $opValue) {
            $result = $this->translateOperator($field, $op, $opValue);
            if ($result['sql']) {
                $conditions[] = $result['sql'];
                $params = array_merge($params, $result['params']);
            }
        }

        return [
            'sql' => !empty($conditions) ? implode(' AND ', $conditions) : '',
            'params' => $params
        ];
    }

    private function translateOperator(string $field, string $operator, mixed $value): array
    {
        $col = $this->jsonField($field);
        $params = [];

        switch ($operator) {
            case '$eq':
                return ['sql' => "$col = ?", 'params' => [$this->prepareValue($value)]];

            case '$ne':
                return ['sql' => "$col != ?", 'params' => [$this->prepareValue($value)]];

            case '$gt':
                return ['sql' => "$col > ?", 'params' => [$this->prepareValue($value)]];

            case '$gte':
                return ['sql' => "$col >= ?", 'params' => [$this->prepareValue($value)]];

            case '$lt':
                return ['sql' => "$col < ?", 'params' => [$this->prepareValue($value)]];

            case '$lte':
                return ['sql' => "$col <= ?", 'params' => [$this->prepareValue($value)]];

            case '$in':
                $placeholders = implode(',', array_fill(0, count($value), '?'));
                return ['sql' => "$col IN ($placeholders)", 'params' => array_map([$this, 'prepareValue'], $value)];

            case '$nin':
                $placeholders = implode(',', array_fill(0, count($value), '?'));
                return ['sql' => "$col NOT IN ($placeholders)", 'params' => array_map([$this, 'prepareValue'], $value)];

            case '$regex':
                $pattern = $value['$regex'] ?? $value;
                $flags = $value['$options'] ?? '';
                return $this->translateRegex($col, $pattern, $flags);

            case '$exists':
                return $this->translateExists($field, (bool)$value);

            case '$type':
                // Simplified - you can expand later
                return ['sql' => '', 'params' => []];

            default:
                // Unknown operator → treat as equality (or throw in strict mode)
                return ['sql' => "$col = ?", 'params' => [$this->prepareValue($value)]];
        }
    }

    private function translateLogicalOperator(string $operator, array $conditions): array
    {
        $parts = [];
        $params = [];

        foreach ($conditions as $cond) {
            $result = $this->translateQueryToWhere($cond); // recursive
            if ($result['sql']) {
                $parts[] = $result['sql'];
                $params = array_merge($params, $result['params']);
            }
        }

        if (empty($parts)) {
            return ['sql' => '', 'params' => []];
        }

        switch ($operator) {
            case '$and':
                return ['sql' => '(' . implode(' AND ', $parts) . ')', 'params' => $params];

            case '$or':
            case '$nor':
                $sql = '(' . implode(' OR ', $parts) . ')';
                if ($operator === '$nor') {
                    $sql = "NOT $sql";
                }
                return ['sql' => $sql, 'params' => $params];

            case '$not':
                $sub = $this->translateQueryToWhere($conditions);
                return ['sql' => "NOT ({$sub['sql']})", 'params' => $sub['params']];

            default:
                return ['sql' => '', 'params' => []];
        }
    }

    private function translateRegex(string $column, string $pattern, string $flags = ''): array
    {
        switch ($this->driver) {
            case 'mysqli':
            case 'mysql':
                // MySQL REGEXP is case-insensitive by default
                return ['sql' => "$column REGEXP ?", 'params' => [$pattern]];

            case 'pgsql':
                $op = str_contains($flags, 'i') ? '~*' : '~';
                return ['sql' => "$column $op ?", 'params' => [$pattern]];

            case 'sqlite3':
                // SQLite has limited regex (needs PRAGMA or extension)
                return ['sql' => "$column LIKE ?", 'params' => ['%' . str_replace(['.', '*'], ['_', '%'], $pattern) . '%']];

            default:
                return ['sql' => "$column LIKE ?", 'params' => ["%$pattern%"]];
        }
    }

    private function translateExists(string $field, bool $exists): array
    {
        $col = $this->jsonField($field);
        if ($exists) {
            return ['sql' => "$col IS NOT NULL AND $col != 'null' AND $col != '[]' AND $col != '{}'", 'params' => []];
        } else {
            return ['sql' => "($col IS NULL OR $col = 'null' OR $col = '[]' OR $col = '{}')", 'params' => []];
        }
    }

    /**
     * Returns proper JSON field extraction syntax per database
     */
    private function jsonField(string $field): string
    {
        if (!$this->useJsonColumns || strpos($field, '.') === false) {
            return "`$field`";
        }

        // Handle dotted notation (e.g. "address.city")
        $parts = explode('.', $field);
        $root = array_shift($parts);

        switch ($this->driver) {
            case 'mysqli':
            case 'mysql':
                return "`$root`->>'$." . implode('.', $parts) . "'";

            case 'pgsql':
                return "`$root`->>'" . implode('.', $parts) . "'";

            case 'sqlite3':
                return "json_extract(`$root`, '$." . implode('.', $parts) . "')";

            default:
                return "`$root`";
        }
    }

    private function prepareValue(mixed $value): mixed
    {
        if (is_bool($value)) {
            return $value ? 1 : 0;
        }
        if ($value instanceof DateTime) {
            return $value->format('Y-m-d H:i:s');
        }
        return $value;
    }
    // ... more private builders for update, delete, pipeline ...

    /**
     * Build UPDATE SQL with MongoDB-style update document
     * Supports: $set, $unset, $inc, $mul, $rename, $push, $pull, $addToSet, etc.
     */
    private function buildUpdateSql(array $update, bool $multi = true): array
    {
        if (empty($update)) {
            throw new InvalidArgumentException('Update document cannot be empty');
        }

        $setParts = [];
        $params = [];
        $jsonUpdates = []; // For databases that support JSON merging

        foreach ($update as $op => $fields) {
            if (!str_starts_with($op, '$')) {
                // Direct field assignment (treat as $set)
                $fields = [$op => $fields];
                $op = '$set';
            }

            switch ($op) {
                case '$set':
                    foreach ($fields as $field => $value) {
                        $col = $this->jsonFieldForUpdate($field);
                        $setParts[] = "$col = ?";
                        $params[] = $this->prepareValue($value);
                    }
                    break;

                case '$unset':
                    foreach ((array)$fields as $field) {
                        $col = $this->jsonFieldForUpdate($field);
                        if ($this->driver === 'mysql' || $this->driver === 'mysqli') {
                            $setParts[] = "$col = NULL";
                        } else {
                            $setParts[] = "$col = NULL";
                        }
                    }
                    break;

                case '$inc':
                    foreach ($fields as $field => $value) {
                        $col = $this->jsonFieldForUpdate($field);
                        $setParts[] = "$col = $col + ?";
                        $params[] = (float)$value;
                    }
                    break;

                case '$mul':
                    foreach ($fields as $field => $value) {
                        $col = $this->jsonFieldForUpdate($field);
                        $setParts[] = "$col = $col * ?";
                        $params[] = (float)$value;
                    }
                    break;

                case '$rename':
                    // Limited support - mostly for top-level fields
                    foreach ($fields as $old => $new) {
                        // This is complex for JSON columns, we'll log warning for now
                        error_log("uDB2: \$rename operator is limited for JSON columns");
                    }
                    break;

                case '$push':
                    foreach ($fields as $field => $value) {
                        $this->addJsonArrayOperation($field, 'push', $value, $setParts, $params);
                    }
                    break;

                case '$pull':
                case '$pullAll':
                    foreach ($fields as $field => $value) {
                        $this->addJsonArrayOperation($field, 'pull', $value, $setParts, $params);
                    }
                    break;

                case '$addToSet':
                    // Similar to push but with uniqueness (hard in pure SQL)
                    foreach ($fields as $field => $value) {
                        $this->addJsonArrayOperation($field, 'addToSet', $value, $setParts, $params);
                    }
                    break;

                default:
                    // Unknown operator → treat as $set
                    $setParts[] = $this->jsonFieldForUpdate($op) . " = ?";
                    $params[] = $this->prepareValue($fields);
            }
        }

        $setClause = !empty($setParts) ? 'SET ' . implode(', ', $setParts) : '';

        return [
            'sql' => $setClause,
            'params' => $params
        ];
    }

    /**
     * Helper for JSON array operations ($push, $pull, etc.)
     */
    private function addJsonArrayOperation(string $field, string $operation, mixed $value, array &$setParts, array &$params): void
    {
        $col = $this->jsonFieldForUpdate($field);

        switch ($this->driver) {
            case 'mysql':
            case 'mysqli':
                if ($operation === 'push') {
                    $setParts[] = "$col = JSON_ARRAY_APPEND($col, '$', ?)";
                    $params[] = json_encode($value);
                } elseif ($operation === 'pull') {
                    // MySQL JSON_REMOVE is tricky for arrays - simplified version
                    $setParts[] = "$col = JSON_REMOVE($col, JSON_UNQUOTE(JSON_SEARCH($col, 'one', ?)))";
                    $params[] = json_encode($value);
                }
                break;

            case 'pgsql':
                if ($operation === 'push') {
                    $setParts[] = "$col = COALESCE($col, '[]'::jsonb) || ?::jsonb";
                    $params[] = json_encode([$value]);
                }
                break;

            default:
                // Fallback - just set the whole array (less ideal)
                $setParts[] = "$col = ?";
                $params[] = json_encode($value);
        }
    }

    /**
     * JSON field syntax for UPDATE statements (slightly different in some DBs)
     */
    private function jsonFieldForUpdate(string $field): string
    {
        if (!$this->useJsonColumns || strpos($field, '.') === false) {
            return "`$field`";
        }

        $parts = explode('.', $field);
        $root = array_shift($parts);
        $path = '$."' . implode('"."', $parts) . '"';

        switch ($this->driver) {
            case 'mysqli':
            case 'mysql':
                return "`$root`->'$path'";   // or use JSON_SET for deeper updates

            case 'pgsql':
                return "`$root`";

            case 'sqlite3':
                return "json_extract(`$root`, '$." . implode('.', $parts) . "')";

            default:
                return "`$root`";
        }
    }

    /**
     * Public method: updateMany (MongoDB style)
     */
    public function updateMany(array $filter, array $update): int
    {
        $where = $this->translateQueryToWhere($filter);
        $updateSql = $this->buildUpdateSql($update, true);

        $sql = "UPDATE `{$this->table}`
        {$updateSql['sql']}
        " . ($where['sql'] ? "WHERE {$where['sql']}" : "");

        $params = array_merge($updateSql['params'], $where['params']);

        return $this->execute($sql, $params);
    }

    /**
     * Public method: updateOne
     */
    public function updateOne(array $filter, array $update): int
    {
        $where = $this->translateQueryToWhere($filter);
        $updateSql = $this->buildUpdateSql($update, false);

        $sql = "UPDATE `{$this->table}`
        {$updateSql['sql']}
        " . ($where['sql'] ? "WHERE {$where['sql']}" : "") . "
        LIMIT 1";

        $params = array_merge($updateSql['params'], $where['params']);

        return $this->execute($sql, $params);
    }s
}
