<?php
// Example 1: Simple $set
$db->updateMany(
    ['status' => 'draft'],
    ['$set' => ['status' => 'published', 'publishedAt' => new DateTime()]]
);

// Example 2: Increment + nested field
$db->updateMany(
    ['_id' => $someId],
    [
        '$inc' => ['stats.views' => 1],
        '$set' => ['lastUpdated' => new DateTime()]
    ]
);

// Example 3: Push to array
$db->updateOne(
    ['userId' => 123],
    ['$push' => ['tags' => 'new-tag']]
);
?>
