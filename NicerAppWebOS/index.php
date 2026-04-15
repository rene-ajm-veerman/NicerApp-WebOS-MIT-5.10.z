<?php
    require_once(dirname(__FILE__).'/boot.php');

    global $naWebOS;
    global $useRememberMe;

    $siteCurrentlyDown = false;
    $debugMe = false;

    if ($siteCurrentlyDown) {
        $debugMe = true;
?>
<div id="siteContent_indexFooter1" class="naVividDialogContent_footer__1">
<h1>Site currently down for maintenance &amp; upgrading of the code &amp; CSS artwork.</h1>
<p><a href="https://x.com/ReneVeerma64021">And I have my entire life under re-arrangement too, folks</a>.</p>
<style>
    pre {
        margin : 10px;
        padding : 5px;
        border-radius : 7px;
        background : rgba(0,0,50,0.7);
        text-shadow : 0px 0px 7px rgba(255,255,255,0.9995), 2px 2px 4px rgba(0,0,0,0.8);
    }
</style>
</div>
<?php
    $useRememberMe = true;
    if ($debugMe) {
        echo '<pre style="color:lime;">'.json_encode($naWebOS->about, JSON_PRETTY_PRINT).'</pre>';
        echo '<pre style="color:skyblue;">'.$naWebOS->basePath.'</pre>';
        echo '<pre style="color:red;">'.$naWebOS->domainFolder.'</pre>';
        // echo '<pre style="color:brown;">'.json_decode(json_encode($_GET),JSON_PRETTY_PRINT).'</pre>';
        // echo '<pre style="color:black;">'.json_decode(json_encode($_POST),JSON_PRETTY_PRINT).'</pre>';
        echo '<pre style="color:white;">'; var_dump($_GET); echo '</pre>';
        echo '<pre style="color:grey;">'; var_dump($_POST); echo '</pre>';
        exit();
    }
    echo $naWebOS->getSite();

} else {
    echo $naWebOS->getSite();
}
?>
<!--
-->
