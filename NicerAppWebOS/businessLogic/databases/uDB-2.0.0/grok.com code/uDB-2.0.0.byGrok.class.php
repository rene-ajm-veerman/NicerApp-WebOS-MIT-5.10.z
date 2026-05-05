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
    private function translateQueryToWhere(array $query): array
    {
        // Reuse/improve your previous MongoQueryMatcher logic but output SQL instead of PHP matching
        // This is the most complex part — we'll build it carefully
        return ['sql' => '', 'params' => []]; // placeholder
    }

    private function translateProjection(array $projection): string
    {
        if (empty($projection)) return '*';
        // Handle field inclusion + JSON path extraction
        return '*'; // placeholder
    }

    private function prepareDocumentForInsert(array $doc): array
    {
        // Convert nested arrays/objects into JSON strings for storage
        foreach ($doc as $key => $value) {
            if (is_array($value)) {
                $doc[$key] = json_encode($value, JSON_UNESCAPED_SLASHES);
            }
        }
        return $doc;
    }

    // ... more private builders for update, delete, pipeline ...
}
