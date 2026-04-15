<?php
    global $naWebOS;
    global $naLAN;
    $view = $naWebOS->view;
    require_once (realpath(dirname(__FILE__).'/../../../../..').'/functions.php');

    $rootURL = 'http://localhost';

if (
    $naLAN
    /*|| ((array_key_exists('pw',$_GET)
            && (
                $_GET['pw']=='efv7750'
                || $_GET['pw']=='xmas2025ai-d'
                || $_GET['pw']=='pl-2025-10-24-15-03'
                || $_GET['pw']=='AllahuaAckbar507788'
                || $_GET['pw']=='alwaysXMASohNoes-50s'
                || $_GET['pw']=='alwaysXMASzzz'
            )
        )
    )*/
) {


    if (array_key_exists('inputJSONurl', $_REQUEST)) {
        $inputJSONurl = $_REQUEST['inputJSONurl'];
    } else {
        $inputJSONurl = '/siteMedia/backgrounds';
    }
    //echo '<pre>'; var_dump ($naWebOS->view); die();


    foreach ($view as $k => $rec) {
        break;
    }
    if ($k!=='/NicerAppWebOS/apps/NicerAppWebOS/applications/3D/app.3D.fileExplorer') {
            $views = encode_base64_url(json_encode([
                "misc" => [
                    'folder' => '/NicerAppWebOS/apps/NicerAppWebOS/applications/3D'
                ],
                "apps" => [
                    'app.3D.fileExplorer' => [
                        'parameters' => [
                            'thumbnails' => './thumbs/300'
                        ],
                        'seoValue' => '3D'
                    ]
                ]
            ]));
            $view = json_decode (decode_base64_url($views), true);
    }
    $theme = '{$theme}';
    if ($theme === '{$theme}') $theme = 'dark';
?>
    <script type="text/javascript" id="naWebOS__js_app_3D_fileExplorer__data">

        na.m.waitForCondition('/NicerAppWebOS/apps/NicerAppWebOS/applications/3D/app.3D.fileExplorer/main.js loaded?', function() {
            var r = na.site.settings.na3D && typeof na.site.settings.na3D['#app_3D_fileExplorer'] === 'object';
            return r;
        }, function() {
            na.site.settings.na3D['#app_3D_fileExplorer'].settings.parameters =

                <?php echo json_encode($view, JSON_PRETTY_PRINT); ?>;
                }, 100);
    </script>
    <div id="site3D_backgroundsBrowser" class="na3D" theme="<?php echo $theme;?>">
    </div>
    <div id="site3D_label" class="label" theme="<?php echo $theme;?>"></div>
    <script type="module" src="/NicerAppWebOS/3rd-party/3D/libs/three.js/build/three.module.js"></script>
<!--     <script src="/NicerAppWebOS/businessLogic/vividUserInterface/v6.y.z/3D/3d-force-graph/src/3d-force-graph.js"></script> -->
    <script src="//cdn.jsdelivr.net/npm/3d-force-graph"></script>
<!--     <script src="//cdn.jsdelivr.net/npm/three-spritetext"></script> -->
    <script type="module" src="/NicerAppWebOS/apps/NicerAppWebOS/applications/3D/app.3D.fileExplorer/main.js"></script>
    <!--<script type="module" src="/NicerAppWebOS/businessLogic/ajax/ajax_loadJSmodule.php?file=/NicerAppWebOS/apps/NicerAppWebOS/applications/3D/app.3D.fileExplorer/main.js"></script>-->
<?php
}
?>
