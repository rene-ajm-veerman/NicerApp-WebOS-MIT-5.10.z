<?php
global $naWebOS;
global $naLAN;
$debugMe = false;
$openToPublic = true;

if (!$openToPublic && !$naLAN) {
    echo '<h1>NicerApp WebOS logs</h1>';
    echo 'This data is unavailable outside nicer.app\'s LAN, sorry.';
    exit();
}
?>

<link rel="StyleSheet" href="/NicerAppWebOS/apps/NicerAppWebOS/applications/2D/logs/naLog.css?m=<?=filemtime(dirname(__FILE__).'/naLog.css')?>"/>
<script type="module" src="/NicerAppWebOS/apps/NicerAppWebOS/applications/2D/logs/naLog.source.js?m=<?=filemtime(dirname(__FILE__).'/naLog.source.js')?>'"></script>
<script type="module">
    var view = <?=json_encode($naWebOS->view);?>;
    import { naLog } from '/NicerAppWebOS/apps/NicerAppWebOS/applications/2D/logs/naLog.source.js';
    na.m.waitForCondition('na initialized?', na.m.HTMLidle, function () { naLog.reload(); }, 500);
</script>
