<?php
require_once __DIR__ . '/../boot.php';
require_once __DIR__ . '/../businessLogic/class.screenshots.php';

global $naWebOS;
$uDB2 = $naWebOS->dbsAdmin;

echo "=== DEBUG: what is \$naWebOS->dbsAdmin? ===\n";
var_dump(get_class($uDB2));
echo "\n";

$manager = new naScreenshots($uDB2);

echo "=== DEBUG: after constructing naScreenshots ===\n";

// Temporary public debug method – add this to the class for now
if (method_exists($manager, 'debugState')) {
    $manager->debugState();
} else {
    echo "Please add the debugState() method shown below to the class.\n";
}

$comments = new class_naComments();
$report = $comments->enqueueScreenshotsFromAllComments([
    'retain' => 86400 * 14,
    'force'  => false,
    'limit'  => 3
]);
print_r($report);

$workerId = 'worker-' . gethostname() . '-' . getmypid();
$summary = $manager->runWorker($workerId, maxJobs: 20, sleepSeconds: 1);
print_r($summary);
echo "Done.\n";
