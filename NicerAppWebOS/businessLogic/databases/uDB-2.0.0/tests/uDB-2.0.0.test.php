<?php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/**
 * uDB2 Test Suite
 * Tests both SQL (ADOdb) and CouchDB backends
 */
final class uDB2Test extends TestCase
{
    private ?uDB2 $dbSQL = null;
    private ?uDB2 $dbCouch = null;

    protected function setUp(): void
    {
        // === SQL Backend (Test Database) ===
        $sqlConfig = [
            'driver'     => 'mysqli',
            'host'       => '127.0.0.1',
            'user'       => 'root',           // Change for CI / your env
            'password'   => '',
            'database'   => 'nicerapp_test',
            'tablePrefix'=> 'test_'
        ];

        $this->dbSQL = uDB2::createFromConfig($sqlConfig);

        // === CouchDB Backend ===
        $couchConfig = [
            'driver'     => 'couchdb',
            'host'       => '127.0.0.1',
            'port'       => 5984,
            'user'       => 'admin',
            'password'   => 'password',
            'database'   => 'nicerapp_test'
        ];

        $this->dbCouch = uDB2::createFromConfig($couchConfig);
    }

    protected function tearDown(): void
    {
        // Optional: clean up test data
        if ($this->dbSQL) {
            $this->dbSQL->setTable('users')->deleteMany([]);
        }
        if ($this->dbCouch) {
            $this->dbCouch->setTable('users')->deleteMany([]);
        }
    }

    // ====================== BASIC FUNCTIONALITY ======================

    public function testCanCreateInstance(): void
    {
        $this->assertInstanceOf(uDB2::class, $this->dbSQL);
        $this->assertInstanceOf(uDB2::class, $this->dbCouch);
    }

    public function testBackendDetection(): void
    {
        $this->assertFalse($this->dbSQL->isCouch());   // assuming you add this helper
        $this->assertTrue($this->dbCouch->isCouch());
    }

    // ====================== CRUD TESTS ======================

    public function testInsertAndFind(): void
    {
        $user = [
            '_id'    => 'user_test_001',   // CouchDB friendly
            'name'   => 'John Doe',
            'email'  => 'john@example.com',
            'age'    => 34,
            'active' => true,
            'tags'   => ['developer', 'tester']
        ];

        // Test SQL
        $this->dbSQL->setTable('users');
        $this->dbSQL->insert($user);                    // you'll need to implement insert()

        $found = $this->dbSQL->find(['email' => 'john@example.com']);
        $this->assertCount(1, $found);
        $this->assertEquals('John Doe', $found[0]['name']);

        // Test CouchDB
        $this->dbCouch->setTable('users');
        $this->dbCouch->insert($user);

        $foundCouch = $this->dbCouch->find(['email' => 'john@example.com']);
        $this->assertCount(1, $foundCouch);
        $this->assertEquals('John Doe', $foundCouch[0]->name ?? $foundCouch[0]['name']);
    }

    public function testUpdateMany(): void
    {
        $this->seedTestUsers();

        $this->dbSQL->setTable('users');
        $updated = $this->dbSQL->updateMany(
            ['age' => ['$gt' => 30]],
            ['$set' => ['active' => false]]
        );

        $this->assertGreaterThan(0, $updated);

        // Verify
        $inactive = $this->dbSQL->find(['active' => false]);
        $this->assertNotEmpty($inactive);
    }

    public function testDeleteMany(): void
    {
        $this->seedTestUsers();

        $this->dbCouch->setTable('users');
        $deleted = $this->dbCouch->deleteMany(['tags' => 'developer']);

        $this->assertGreaterThan(0, $deleted);

        $remaining = $this->dbCouch->find([]);
        $this->assertCount(0, $remaining); // if all were developers
    }

    // ====================== QUERY FEATURES ======================

    public function testComplexQuery(): void
    {
        $this->seedTestUsers();

        $results = $this->dbSQL->find([
            '$and' => [
                ['age' => ['$gte' => 25]],
                ['active' => true]
            ]
        ], [
            'limit' => 10,
            'sort'  => ['age' => -1]
        ]);

        $this->assertIsArray($results);
    }

    public function testMangoQueryOnCouchDB(): void
    {
        $this->seedTestUsers();

        $results = $this->dbCouch->find([
            'age' => ['$gt' => 30],
            'tags' => 'developer'
        ], [
            'fields' => ['name', 'email', 'age'],
            'limit'  => 5
        ]);

        $this->assertIsArray($results);
    }

    // ====================== HELPER METHODS ======================

    private function seedTestUsers(): void
    {
        $users = [
            ['_id' => 'u1', 'name' => 'Alice',  'age' => 28, 'active' => true,  'tags' => ['developer']],
            ['_id' => 'u2', 'name' => 'Bob',    'age' => 35, 'active' => true,  'tags' => ['tester']],
            ['_id' => 'u3', 'name' => 'Carol',  'age' => 22, 'active' => false, 'tags' => ['developer', 'designer']],
        ];

        foreach ([$this->dbSQL, $this->dbCouch] as $db) {
            $db->setTable('users');
            $db->deleteMany([]); // clear previous data
            foreach ($users as $user) {
                $db->insert($user);
            }
        }
    }
}
