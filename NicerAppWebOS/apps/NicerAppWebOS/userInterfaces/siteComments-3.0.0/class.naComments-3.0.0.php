<?php
// MIT licensed (C) 2026 rene.veerman.netherlands@gmail.com + grok.com

class class_naComments {
    public $cn = 'class_naComments';

    public function getHTMLandCSS ($post = null, $rootItemJSON=null) {

        //return 'The comments feature is experiencing problems right now; sorry.';
        //echo '<pre>'; var_dump ($_SERVER); var_dump ($rootItemJSON); echo '</pre>'; //exit;

        if (is_array($post) && $post!==null) {
            $rootItemJSON = json_encode([
                'url' => $post['url']
            ]);
        } else {
            global $naURL;
            global $naWebOS;
            $u = 'https://'.$naWebOS->domain.$_SERVER['REQUEST_URI'];
            $json = '{"url":"'.$u.'"}';
            if (is_null($rootItemJSON)) $rootItemJSON = $json;//str_replace('\/','/',substr($json,1  ,strlen($json)-2));
        };
        $rootItemJSON = str_replace('\\/', '/', $rootItemJSON);

        global $naWebOS;
        $db = $naWebOS->dbs->findConnection('couchdb');
        $cdb = $db->cdb;
        $in = &$_GET;
        $fields = [ '_id', 'parentID', 'datetimeStr', 'clientDatetime', 'clientTZoffset', 'clientIP', 'clientUsername', 'msgHTML' ];

        $dbName = $db->dataSetName ('cms_comments');
        try {
            $cdb->setDatabase($dbName, true);
        } catch (Exception $e) {
            return $e->getMessage();
        }

        $findCommand = [
            'selector' => [
                'rootItemJSON' => $rootItemJSON//, // unwrap from ajax call's data field
//                'parentID' => '#'
            ],
            'fields' => &$fields,
            'limit' => 200,
            'sort' => [ ['datetimeStr'=>'desc'], ['parentID'=>'desc'] ],
            'use_index' => '_design/20986d30727811fa9067a1e39a306d1b35fcf6d5'
        ];
        //echo '<pre>'; var_dump ($_SERVER); echo '</pre>'; //exit();
        //echo '<pre>'; echo json_encode ($findCommand, JSON_PRETTY_PRINT); echo '</pre>';

        $bm = 'abc';
        $oldBM = 'def';
        $results = [];
        while ($bm!==$oldBM) {
            if ($bm!=='abc') $findCommand['bookmark'] = $bm;
            $call = $cdb->find($findCommand);
            //echo '<pre>'; echo json_encode ($call, JSON_PRETTY_PRINT); echo '</pre>';

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

            $results = array_merge_recursive($results, $this->transformResults_findCommand ($call));
        }
        //exit();

        return
            '<link type="text/css" rel="StyleSheet" href="/NicerAppWebOS/apps/NicerAppWebOS/userInterfaces/siteComments-3.0.0/na.comments.css">'
            .$this->formatHeader()
            .'<div class="naComment_results">'
            .$this->formatResults ($results, $post)
            .'</div>'
            .$this->formatFooter();
    }

    public function transformResults_findCommand ($call) {
        $fncn = $this->cn.'::transformResults_findCommand()';
        if (!is_object($call)) {
            echo '<pre>'; var_dump($call); echo '</pre>';
            trigger_error ($fncn.' : invalid $call');
            exit();
        }
        if (!property_exists($call,'body')) {
            echo '<pre>'; var_dump($call); echo '</pre>';
            trigger_error ($fncn.' : invalid $call->body');
            exit();
        }
        if (!property_exists($call->body,'docs')) return [];
        return json_decode(json_encode($call->body->docs),true);
    }

   public function formatHeader() {
        global $naWebOS;
        $html =
            '<div class="naComment_header_div" style="">'.PHP_EOL
            .'<h2 class="naComments_header">Comments</h2>'.PHP_EOL
            .$naWebOS->html_vividButton (
                1000, 'float:right',

                'btnAddNewComment',
                'vividButton_icon_50x50 grouped', '_50x50', 'grouped',
                '',
                'na.c.onclick_btnAddComment(event);',
                '',
                '',

                1001, 'Add comment',
                null, null,
                'btnCssVividButton.orange1c.png',
                'btnDocument2.png',
                '', 'Add comment', '', ''
            ).PHP_EOL
            .'</div>'.PHP_EOL;
        return $html;
    }

    public function formatResults ($results, $post) {
        // The free help of grok.com was invaluable and quick to get this function to do exactly what I want for now :)
        global $naLAN;
        global $naIP;
        global $naWebOS;
        global $naUsername;
        $html = '';
        global $cr;
        $cr = $results;
        if (is_array($post) && array_key_exists('openIDs',$post)) {
            $openIDs = json_decode($post['openIDs']);
        } else {
            $openIDs = [];
        }

        function buildCommentTree(array $flatComments, string $idField = '_id', string $parentField = 'parentID'): array
        {
            $byId = [];
            $tree  = [];

            // Index by ID + collect root nodes
            foreach ($flatComments as $comment) {
                $id = $comment[$idField];
                $byId[$id] = $comment;
                $byId[$id]['children'] = [];           // prepare children array

                $parentId = $comment[$parentField] ?? null;

                if ($parentId === null || $parentId === '#' || $parentId === 0) {
                    $tree[] = &$byId[$id];
                } else {
                    // We'll attach later if parent exists
                }
            }

            // Attach children
            foreach ($byId as $id => &$comment) {
                $parentId = $comment[$parentField] ?? null;
                if ($parentId !== null && $parentId !== '#' && $parentId !== 0) {
                    if (isset($byId[$parentId])) {
                        $byId[$parentId]['children'][] = &$comment;
                    }
                    // else → orphan → already ignored / can log
                }
            }

            return $tree;
        }

        function sortTreeNewestFirst(array &$nodes): void
        {
            // Sort current level newest → oldest
            usort($nodes, function($a, $b) {
                return $a['datetimeStr'] >= $b['datetimeStr'] ? -1 : 1;
            });

            // Recurse into children
            foreach ($nodes as &$node) {
                if (!empty($node['children'])) {
                    //usort($nodes['children'], fn($a, $b) => $b['datetimeStr'] <=> $a['datetimeStr']);
                    sortTreeNewestFirst($node['children']);
                }
            }
        }
        function sortTreeTopLevelNewestOnly(array &$nodes, int $depth = 0): void {
            if ($depth === 0) {
                // ONLY sort the root level newest → oldest
                usort($nodes, fn($a, $b) => $b['datetimeStr'] <=> $a['datetimeStr']);
            }
            // do NOT sort deeper levels → they stay oldest → newest

            foreach ($nodes as &$node) {
                if (!empty($node['children'])) {
                    sortTreeTopLevelNewestOnly($node['children'], $depth + 1);
                }
            }
        }

        // ────────────────────────────────────────────────
        // Usage in your code:
        $flatList = $results;  // ← from DB or wherever

        $tree = buildCommentTree($flatList, '_id', 'parentID');   // adjust field names if different

        // Now sort the whole structure reverse-chronologically per level
        sortTreeTopLevelNewestOnly($tree);
        //echo '<pre>t777;'; var_dump ($tree); echo '</pre>'; exit();

        function printTree (&$tree, &$openIDs) {
            $html = '';
            foreach ($tree as $idx => $rootItem) {
                $html .= printItem ($rootItem, $openIDs);
                if (count($rootItem['children'])>0) {
                    $html .= printTree ($rootItem['children'], $openIDs);
                }
            }
            return $html;
        };

        function printItem($it, $openIDs) {
            global $naLAN;
            global $naIP;
            global $naWebOS;
            global $naUsername;
            $its_id = $it['_id'];
            if (in_array($its_id,$openIDs)) $style='style="display:block"'; else $style='';
            $html = '<div id="naComment_'.($its_id!=='#'?$its_id:'_').'" class="naComment_entry" '.$style.'>'.PHP_EOL;
                $html .= $naWebOS->html_vividButton(
                    1001, 'float:left',

                    'btnExpandComment',
                    'vividButton_icon_50x50 vbExpandComment', '_50x50', 'vbExpandComment',
                    '',
                    'na.c.onclick_btnExpandComment(event);',
                    '',
                    '',

                    1001, 'Expand comment',
                    null, null,
                    'btnCssVividButton.greenYellow.png',
                    'btnPlus_shaded.png',
                    '', '', '', ''
                ).PHP_EOL;
                if ($it['clientUsername']==$naUsername) $html .= $naWebOS->html_vividButton(
                    1001, 'float:right',

                    'btnRemoveComment',
                    'vividButton_icon_50x50 grouped', '_50x50', 'grouped',
                    '',
                    'na.c.onclick_btnRemoveComment(event);',
                    '',
                    '',

                    1001, 'Remove comment',
                    null, null,
                    'btnCssVividButton.yellow1a.png',
                    'btnTrashcan_red.png',
                    '', '', '', ''
                ).PHP_EOL;
                $html .= "\t".'<div style="display:none">'.PHP_EOL;
                $html .= "\t\t".'<span class="naComment_id">'.$it['_id'].'</span>'.PHP_EOL;
                $html .= "\t\t".'<span class="naComment_parentID">'.$it['parentID'].'</span>'.PHP_EOL;
                $html .= "\t\t".'<span class="naComment_clientIP">'.$it['clientIP'].'</span>'.PHP_EOL;
                $html .= "\t\t".'<span class="naComment_clientDatetime">'.$it['clientDatetime'].'</span>'.PHP_EOL;
                $html .= "\t\t".'<span class="naComment_clientTZoffset">'.$it['clientTZoffset'].'</span>'.PHP_EOL;
                $html .= "\t\t".'<span class="naComment_clientUsername">'.$it['clientUsername'].'</span>'.PHP_EOL;
                $html .= "\t".'</div>'.PHP_EOL;
                $html .= "\t".'<div class="naComment_header">';
                    $html .= "\t".'<span class="naComment_username">'
                        .$it['clientUsername']
                        .'</span>'.PHP_EOL;
                    $html .= "\t".'<span class="naComment_datetime">'
                        .naDateTimeHeader($it['clientDatetime'],$it['clientTZoffset']) // in .../NicerAppWebOS/functions.php
                        .'</span>'.PHP_EOL;
                $html .= "\t".'</div>'.PHP_EOL;

                $html .= "\t".'<div class="naComment_msgHTML">'.$it['msgHTML'].'</div>'.PHP_EOL;
                $html .= "\t".'<div class="naComment_subComments">';
                $html .= "\t".'</div>'.PHP_EOL;
                $html .=
                    "\t".$naWebOS->html_vividButton (
                        1001, 'margin-left:30px;',

                        'btnAddSubComment',
                        'vividButton_icon_50x50 vbAddSubComment', '_50x50', 'vbAddSubComment',
                        '',
                        'na.c.onclick_btnAddComment(event);',
                        '',
                        '',

                        1001, 'Add reply',

                        null,
                        null,
                        'btnCssVividButton.orange1c.png',
                        'btnDocument2.png',

                        '',

                        'Add reply',
                        '', ''
                    ).PHP_EOL;
            $html .= '</div>'.PHP_EOL;
            return $html;
        }

        $html = printTree($tree, $openIDs);

        return $html;
    }

     public function formatFooter() {
        global $naWebOS;
        $html =
            '<div class="naComments_footer">'.PHP_EOL
            .'</div>'.PHP_EOL;
        return $html;
    }

    public function getEditor() {
        $fn = __DIR__.'/htmlSnippet_commentsEditor.php';
        $html = require_return ($fn);
        return $html;
    }

    public function add($in=null) {
        $fncn = $this->cn.'::add($in)';
        global $naWebOS;
        if (!is_array($in)) trigger_error ($fncn.' : !is_array($in)', E_USER_ERROR);
        if (!array_key_exists('rec',$in)) trigger_error ($fncn.' : !array_key_exists("rec",$in)', E_USER_ERROR);
        $rec = json_decode($in['rec'], true);
        $rec['_id'] = randomString(20);
        $rec['datetimeServer'] = time();
        $rec['datetimeStr'] = naDateTimeStr($rec['clientDatetime'], $rec['clientTZoffset']);
        $rec['msgHTML'] = str_replace ('<p><span class="backdropped"', '<p class="backdropped"', $rec['msgHTML']);
        $rec['msgHTML'] = str_replace ('</span>', '', $rec['msgHTML']);
        $rec['msgHTML'] = str_replace ('<p>', '<p class="backdropped">', $rec['msgHTML']);
        $db = $naWebOS->dbs->findConnection('couchdb');
        $cdb = $db->cdb;
        $dbName = $db->dataSetName('cms_comments');
        $cdb->setDatabase ($dbName);
        $cdb->post ($rec);
        $results = [$rec];
        $rec['resultHTML'] = $this->formatResults($results);
        echo json_encode($rec);
    }

    public function remove($in=null) {
        global $naWebOS;
        $fncn = $this->cn.'::add($in)';
        $debug = false;
        if (!is_array($in)) trigger_error ($fncn.' : !is_array($in)', E_USER_ERROR);
        if (!array_key_exists('rec',$in)) trigger_error ($fncn.' : !array_key_exists("rec",$in)', E_USER_ERROR);
        $rec = json_decode($in['rec'], true);

        $db = $naWebOS->dbs->findConnection('couchdb');
        $cdb = $db->cdb;
        $dbName = $db->dataSetName('cms_comments');
        $cdb->setDatabase ($dbName);

        try {
            $call = $cdb->get($rec['id']);
            //echo '<pre>'; var_dump($call); echo '</pre>';
            $ids = [$rec['id']];
            $cdb->delete ($call->body->_id, $call->body->_rev);
            echo '{"deleted" : {"dbName":"'.$dbName.'","ids":'.json_encode($ids).'}}';
        } catch (Exception $e) {
            echo '{"errorHTML" : "Could not delete comment", "couchdbErrorMsg" : "'.$e->getMessage().'"}';
        }
    }

    public function addIndexes() {
        global $naWebOS;
        $debug = false;
        $db = $naWebOS->dbs->findConnection('couchdb');
        $cdb = $db->cdb;
        $dbName = $db->dataSetName('cms_comments');
        $cdb->setDatabase ($dbName);

        $rec = [
            'index' => [
                'fields' => [ 'datetimeStr', 'parentID' ]
            ],
            'name' => 'sortIndex_datetimeStrParentID',
            'type' => 'json'
        ];
        try {
            $cdb->setIndex ($rec);
        } catch (Exception $e) {
            if ($debug) { echo '<pre style="color:red">'; var_dump ($e); echo '</pre>'; exit(); }
        }

        $rec = [
            'index' => [
                'fields' => [ 'clientIP', 'clientDatetime', 'clientTZoffset' ]
            ],
            'name' => 'sortIndex_clientIndexes',
            'type' => 'json'
        ];
        try {
            $cdb->setIndex ($rec);
        } catch (Exception $e) {
            if ($debug) { echo '<pre style="color:red">'; var_dump ($e); echo '</pre>'; exit(); }
        }

    }
}
