<?php
declare(strict_types=1);

/**
 * uDB2 - Basic Tests (Revised for setTable())
 * For Gavan / Rene-AJM-Veerman
 */

require_once __DIR__ . '/uDB-2.0.0.byGrok.class.php';

echo "<h2>uDB2 - Basic Tests with setTable()</h2>\n";

try {
    // ====================== CONNECTION ======================
    echo "<h3>Test 1: Connection</h3>";
    $uDB = uDB2::connectToDatabase('Guest');
    echo "✅ Connected successfully (Driver: " . $uDB->getDriver() . ")<br>";

    // ====================== TABLE SETUP ======================
    echo "<h3>Test 2: setTable()</h3>";

    $uDB->setTable('users');                    // Proper way now
    echo "✅ setTable('users') called<br>";

    // Test accessing table
    echo "Current table: " . $uDB->getTable() . "<br>";

    // Deliberate notice test - accessing private property directly
    echo "<br>→ Triggering notice by accessing private property:<br>";
    $dummy = $uDB->table;   // Should trigger __get() notice

    // ====================== FIND TESTS ======================
    echo "<h3>Test 3: find() with setTable()</h3>";

    $result = $uDB->find('users', ['status' => 'active'], [], 10);
    echo "✅ find() executed on 'users' table. Rows: " . count($result) . "<br>";

    // Another table
    $uDB->setTable('logs');
    echo "<br>Switched to table: " . $uDB->getTable() . "<br>";

    // ====================== UPDATE TESTS ======================
    echo "<h3>Test 4: updateOne() + updateMany()</h3>";

    $uDB->setTable('users');

    // Should work now
    $uDB->updateOne(
        ['_id' => 'test123'],
        ['$set' => ['lastTested' => new DateTime(), 'testFlag' => true]]
    );
    echo "✅ updateOne() executed<br>";

    // ====================== DELIBERATE ERRORS & NOTICES ======================
    echo "<h3>Test 5: Deliberate Errors & Notices (for your logger)</h3>";

    // Notice: Empty update document
    echo "→ Testing empty update error:<br>";
    $uDB->updateMany(['status' => 'active'], []);   // Should throw exception

} catch (Throwable $e) {
    echo "<div style='color: #d32f2f; background:#ffebee; padding:15px; border:1px solid #d32f2f; margin:10px 0;'>";
    echo "<b>" . get_class($e) . "</b><br>";
    echo "<b>Message:</b> " . htmlspecialchars($e->getMessage()) . "<br>";
    echo "<b>File:</b> " . basename($e->getFile()) . " (Line " . $e->getLine() . ")";
    echo "</div>";
}

// ====================== MORE NOTICES ======================
echo "<h3>Test 6: Additional Notices</h3>";

trigger_error("uDB2 Test: This is a deliberate E_USER_NOTICE for logging test", E_USER_NOTICE);
trigger_error("uDB2 Test: This is a deliberate E_USER_WARNING", E_USER_WARNING);

// Undefined variable notice
echo "→ Triggering undefined variable notice:<br>";
$undefinedTest = $someNonExistentVariable ?? 'fallback';

echo "<h3 style='color:green;'>✅ All basic tests completed.</h3>";
echo "<p>Your HTML + CSS logging system should now have rich output to work with.</p>";
