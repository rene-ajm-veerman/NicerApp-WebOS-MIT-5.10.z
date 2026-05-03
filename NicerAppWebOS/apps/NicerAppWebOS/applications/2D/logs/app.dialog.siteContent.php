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

global $db;
global $cdb;
$cdbDomain = $naWebOS->domainFolderForDB;//str_replace('.','_',$naWebOS->domainFolder);
$db = $naWebOS->dbsAdmin->findConnection('couchdb');
//echo '<pre>t233:'; var_dump($db->roles); echo '</pre>'; //exit();
$cdb = $db->cdb;
global $dataSetName;
$dataSetName = $cdbDomain.'___analytics';
//echo $dataSetName; exit();
$cdb->setDatabase($dataSetName, false);


foreach ($naWebOS->view as $afn => $as) break;
$naWebOS->view[$afn]['beginDateTime'] = safeHTTPinput ('beginDateTime', (time() * 1000) - (7 * 24 * 3600 * 1000));
$naWebOS->view[$afn]['endDateTime'] = safeHTTPinput ('endDateTime');
//echo '<pre>'; var_dump($naWebOS->view); die();

    function transformResults_findCommand ($call) {
        global $naWebOS;
        global $cdb;
        global $dataSetName;
        $debugMe = false;
        $cdbDomain = $naWebOS->domainFolderForDB;//str_replace('.','_',$naWebOS->domainFolder);
        $dsn = $cdbDomain.'___ipinfo';
        //var_dump($dsn);

        $cdb->setDatabase($dsn);
        $r = [];
        //echo '<pre>'; var_dump($call); echo '</pre>';
        //$b = json_decode(json_encode($call),true);
        foreach ($call->body->docs as $idx => $rec) {
            if ($debugMe) { echo '<pre style="background:rgba(255,0,0,0.555);color:yellow;border-radius:10px;margin:10px;padding:10px;">'; var_dump($rec->_id); echo '</pre>'; };

            //$dat = $cdb->get(urlencode($rec->_id));
            //echo '<pre style="background:rgba(0,50,0,0.555);color:white;border-radius:10px;margin:10px;padding:10px;">'; var_dump($dat); echo '</pre>';

            /*$findCommand = [
                'selector' => [ 'ip' => $rec->ip ],
                'fields' => [ 'ip', 'ip_info' ]
            ];
            $cdb->setDatabase($dsn);
            $call2 = $cdb->find($findCommand);
            //echo '<pre>'; var_dump ($call2); echo '</pre>';
            */

            /*
            if (
                isset($call2)
                && property_exists($call2,'body')
                && property_exists($call2->body, 'docs')
            ) {
                $rec->ipinfo = $call2->body->docs;
            }
            */

            $r[] = $rec;
            if ($debugMe) { echo '<pre style="background:rgba(100,0,0,0.555);color:white;border-radius:10px;margin:10px;padding:10px;">'; var_dump($rec); echo '</pre>'; };
        }

        $cdb->setDatabase($dataSetName);

        return $r;
    }
    function transformResults_getAllDocs ($call) {
        global $naWebOS;
        global $cdb;
        global $dataSetName;
        $debugMe = false;
        $cdbDomain = $naWebOS->domainFolderForDB;//str_replace('.','_',$naWebOS->domainFolder);
        $dsn = $cdbDomain.'___ipinfo';

        $r = [];
        //echo '<pre>'; var_dump($call); echo '</pre>'; return;
        //$b = json_decode(json_encode($call),true);
        foreach ($call->body->rows as $idx => $rec) {
            if ($debugMe) { echo '<pre style="background:rgba(255,0,0,0.555);color:yellow;border-radius:10px;margin:10px;padding:10px;">'; var_dump($rec->id); echo '</pre>'; };
            if (!property_exists($rec, 'id')) continue;
            if (strpos($rec->id,'design/')!==false) continue;

            $cdb->setDatabase($dataSetName);
            $dat = $cdb->get(urlencode($rec->id));
            //echo '<pre style="background:rgba(100,0,0,0.555);color:white;border-radius:10px;margin:10px;padding:10px;">'; var_dump($dat); echo '</pre>';


            $findCommand = [
                'selector' => [ 'ip' => $dat->body->ip ],
                'fields' => [ 'ip', 'ip_info' ]
            ];
            $cdb->setDatabase($dsn);


            $call2 = $cdb->find($findCommand);

            if (
                isset($call2)
                && property_exists($call2,'body')
                && property_exists($call2->body, 'docs')
            ) $dat->body->ipinfo = $call2->body->docs;

            $r1 = json_decode(json_encode($dat->body));
            $r[] = $r1;
            if ($debugMe) { echo '<pre style="background:rgba(100,0,0,0.555);color:white;border-radius:10px;margin:10px;padding:10px;">'; var_dump($r1); echo '</pre>'; };
        }

        $cdb->setDatabase($dataSetName);
        return $r;
    }

$in = &$_GET;
$fields = [ '_id', 'ip', 'millisecondsSinceEpoch', 'msg', 'referrer', 'stacktrace', 'info', 'htmlClasses', 'dateTZ' ];


if (
    $naWebOS->view[$afn]['beginDateTime']
    && $naWebOS->view[$afn]['endDateTime']
) {
    $findCommand = [
        'selector' => [ 'millisecondsSinceEpoch' => [['$gt'=>$naWebOS->view[$afn]['beginDateTime']-1], ['$lt'=>$naWebOS->view[$afn]['endDateTime']+1]]  ],
        'fields' => &$fields,
        'sort' => [['millisecondsSinceEpoch'=>'desc']],
        'limit' => 200, // hardcoded (in couchdb!) max value
        'use_index' => '_design/aced963374ca4616ccb7836945188842be4e9145'
    ];
    //echo '<pre>'; var_dump($findCommand); die();
    $bm = 'abc';
    $oldBM = 'def';
    $results = [];
    while ($bm!==$oldBM) {
        if ($bm!=='abc') $findCommand['bookmark'] = $bm;
        $call = $cdb->find($findCommand);

        $oldBM = $bm;
        if (
            isset($call)
            && property_exists($call,'body')
            && property_exists($call->body, 'bookmark')
            && is_string($call->body->bookmark)
            && $call->body->bookmark !== ''
            && $call->body->bookmark !== 'nil'
        ) {
            $bm = $call->body->bookmark;
        } else {
            $bm = 'abc';
        };

        $results = array_merge_recursive($results, transformResults_findCommand ($call));
    }
} else if ($naWebOS->view[$afn]['beginDateTime']) {
    $findCommand = [
        'selector' => [ 'millisecondsSinceEpoch' => ['$gt' => $naWebOS->view[$afn]['beginDateTime'] - 1] ],
        'fields' => &$fields,
        'sort' => [['millisecondsSinceEpoch'=>'desc']],
        'limit' => 200, // hardcoded (in couchdb!) max value
        'use_index' => '_design/aced963374ca4616ccb7836945188842be4e9145'
    ];
    //echo '<pre>'.json_encode($findCommand,JSON_PRETTY_PRINT); die();
    $bm = 'abc';
    $oldBM = 'def';
    $results = [];
    $i = 0;
    while ($bm!==$oldBM) {
        if ($bm!=='abc') $findCommand['bookmark'] = $bm;
        $call = $cdb->find($findCommand);

        $oldBM = $bm;
        if (
            isset($call)
            && property_exists($call,'body')
            && property_exists($call->body, 'bookmark')
            && is_string($call->body->bookmark)
            && $call->body->bookmark !== ''
            && $call->body->bookmark !== 'nil'
        ) {
            $bm = $call->body->bookmark;
        } else {
            $bm = 'abc';
        };
        /*
        var_dump ($oldBM===$bm);
        var_dump ($oldBM);
        var_dump ($bm); echo '<br/>';PHP_EOL;
        $i++;
        if ($i>4) die();
        */

        $results = array_merge_recursive($results, transformResults_findCommand ($call));

    }
} else if (array_key_exists('end', $in)) {
    $findCommand = [
        'selector' => [ 'millisecondsSinceEpoch' => ['$lt' => $naWebOS->view[$afn]['endDateTime'] + 1] ],
        'fields' => &$fields,
        'sort' => [['millisecondsSinceEpoch'=>'desc']],
        'limit' => 200, // hardcoded (in couchdb!) max value
        'use_index' => '_design/aced963374ca4616ccb7836945188842be4e9145'
    ];
    $bm = 'abc';
    $oldBM = 'def';
    $results = [];
    while ($bm!==$oldBM) {
        if ($bm!=='abc') $findCommand['bookmark'] = $bm;
        $call = $cdb->find($findCommand);

        $oldBM = $bm;
        if (
            isset($call)
            && property_exists($call,'body')
            && property_exists($call->body, 'bookmark')
            && is_string($call->body->bookmark)
            && $call->body->bookmark !== ''
            && $call->body->bookmark !== 'nil'
        ) {
            $bm = $call->body->bookmark;
        } else {
            $bm = 'abc';
        };

        $results = array_merge_recursive($results, transformResults_findCommand ($call));
    }
} else {
    $findCommand = [];
    $bm = 'abc';
    $oldBM = 'def';
    $results = [];
    $i = 0;
    while ($bm!==$oldBM) {
        if ($bm!=='abc') $findCommand['bookmark'] = $bm;
        $call = $cdb->getAllDocs();

        $oldBM = $bm;
        if (
            isset($call)
            && property_exists($call,'body')
            && property_exists($call->body, 'bookmark')
            && is_string($call->body->bookmark)
            && $call->body->bookmark !== ''
            && $call->body->bookmark !== 'nil'
        ) {
            $bm = $call->body->bookmark;
        } else {
            $bm = 'abc';
        };

        $results = array_merge_recursive($results, transformResults_getAllDocs ($call));
    }
}

if ($debugMe) {
    echo '<pre style="background:rgba(0,255,0,0.555);color:yellow;border-radius:10px;margin:10px;padding:10px;">';
    var_dump ($findCommand);
    echo '</pre>';
    echo '<pre style="background:rgba(255,255,255,0.555);color:navy;border-radius:10px;margin:10px;padding:10px;">';
    var_dump ($call);
    echo '</pre>';
    echo '<pre style="background:rgba(0,0,50,0.555);color:lime;border-radius:10px;margin:10px;padding:10px;">';
    var_dump ($results);
    echo '</pre>';
}
?>
<h1><?=$naWebOS->domain?> Logs</h1>
<div>

<?php
if (
    $naWebOS->view[$afn]['beginDateTime']
    && $naWebOS->view[$afn]['endDateTime']
) {
    $msg = 'From '.date('Y-m-d H:i:s', $naWebOS->view[$afn]['beginDateTime'] / 1000).' to '
        .date('Y-m-d H:i:s', $naWebOS->view[$afn]['endDateTime']);
} else if ($naWebOS->view[$afn]['beginDateTime']) {
    $msg = 'Since '.date('Y-m-d H:i:s', $naWebOS->view[$afn]['beginDateTime'] / 1000);
} else if (array_key_exists('end', $in)) {
    $msg = 'Up to '.date('Y-m-d H:i:s', $naWebOS->view[$afn]['endDateTime'] / 1000);
}
?>

    <span class="naIPlog_startDateStr"><?=$msg?></span>
</div>
<link rel="StyleSheet" href="/NicerAppWebOS/apps/NicerAppWebOS/applications/2D/logs/naLog.css?m=<?=filemtime(dirname(__FILE__).'/naLog.css')?>"/>
<script type="module" src="/NicerAppWebOS/apps/NicerAppWebOS/applications/2D/logs/naLog.source.js?m=<?=filemtime(dirname(__FILE__).'/naLog.source.js')?>'"></script>
<script type="module">
    var view = <?=json_encode($naWebOS->view);?>;
    var naLogData = <?=json_encode($results);?>;
    import { naLog } from '/NicerAppWebOS/apps/NicerAppWebOS/applications/2D/logs/naLog.source.js';
    naLog.view(naLogData);
</script>
