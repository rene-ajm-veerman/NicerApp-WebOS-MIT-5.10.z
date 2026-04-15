<?php
    require_once (dirname(__FILE__).'/../../NicerAppWebOS/boot.php');
    global $naWebOS;
    global $naDate;
    require_once ($naWebOS->basePath.'/NicerAppWebOS/businessLogic/class.NicerAppWebOS.diaries.php');
    $diaries = new naDiaries();
?>
<script type="text/javascript" src="/NicerAppWebOS/3rd-party/jQuery/jquery-3.7.0.min.js?c=20250817_120652"></script>
<script src="https://code.jquery.com/jquery-3.7.1.js" integrity="sha256-eKhayi8LEQwp4NKxN+CfCh+3qOVUtJn3QNZ0TciWLP4=" crossorigin="anonymous"></script>
<div style="background:rgba(0,0,50,0.007)">
    <style>
    body {
        background : url(/siteMedia/backgrounds/Tiled/Grey/background.jpg);
    }
    </style>
    <link type="text/css" rel="StyleSheet" href="NicerEnterprises--company--base.css?c=NOW">
    <link type="text/css" rel="StyleSheet" href="NicerEnterprises--company--moods-print.css?c=NOW">


    <div>
    <p class="backdropped naComments_onTheSide">
    <a href="https://nicer.app" target="naHP">https://nicer.app</a>, <a href="https://said.by" target="sbHP">https://said.by</a>, <a href="https://zoned.at" target="zAt">https://zoned.at</a>, <a href="https://github.com/Rene-AJM-Veerman" target="githubNicerEnterprises">https://github.com/Rene-AJM-Veerman</a>, <br/>in addition to ALL of the content listed at the social media URLs below, <br/>are ENTIRELY
    Copyrighted (C) 2002-2025 and are 100% Owned by <a href="mailto:rene.veerman.netherlands@gmail.com" target="_new" class="nomod noPushState">Rene A.J.M. Veerman &lt;rene.veerman.netherlands@gmail.com&gt;</a>.
    </p>

    <h2>Going commercial</h2>

    <p class="backdropped naComments_onTheSide">
    The entire Copyright (C) and All Rights Reserved (R) status of this Software and the domain names said.by, zoned.at and nicer.app are on sale for 75 million euro.<br/>
    Email me for more details. I'd be willing to become a remote working employee of the buyer too. :-)
    </p>

    <h2>Business plan</h2>

    <p class="backdropped naComments_onTheSide">
    I will keep NicerApp WebOS (https://nicer.app) MIT-licensed open source that can even be used commercially for free for at least 2026 too, but without warranty and you'll need your own full stack http://kubuntu.com web-development team to work with it.
    </p>


    <h2>Executives</h2>

    <div class="backdropped naComments_onTheSide">
    <div class="backdropped naComments_onTheSide">Owner, Founder, Senior Coder : <a href="https://www.youtube.com/watch?v=nO5KNu-Qwcs" target="naReneMemoires" class="nomod noPushState">Rene A.J.M. Veerman</a><br/>[ rene.veerman.netherlands@gmail.com ]<br/>


    That's a 70W speaker for my smartphone draped around my shoulder,<br/>not a 'gay bag'. :p<br/>
    i'm straight, but i can not date any military or intelligence women.<br/>
    Both of my parents are Leos in the western zodiac, and therefore i can't be with an overly assertive woman.<br/>
    Sorry, but that's just the way it is.</div>
    <img src="https://nicer.app/NicerAppWebOS/documentation/selfies/rene-ajm-veerman/IMG_20251109_145323_1.jpg" style="width:95%;"/><br/>
    </div>
    <p class="backdropped naComments_onTheSide">
    Should I unexpectedly die for some strange reason, for instance by long standing <a href="https://said.by/Refirenda?pw=inS3rvice0fHumanity">"dissident" disputes</a> (In addition to a software and graphics developer, i'm also an assertive peace activist who is not without the ability to look at his own ranks with criticism) suddenly becoming lethal in some way, I want my belongings donated to my parents initially, and to the Amsterdam.NL stedelijk museum after their eventual death, who may all do with it all as they please, on condition of keeping copies of https://nicer.app plus https://said.by up and running.<br/>
    After my death, I'd also like my one creditor re-imbursed : 730 Euro to GVB.NL.<br/>
    My protective custody agent's details are well engraved in medical records at https://mentrum.nl<br/>
    </p>


    <h2>Political views</h2>
    <p class="backdropped naComments_onTheSide">
    It is my firm belief that humanity should not allow itself to be ever again goaded into conventional war after conventional war by the ruling classes.
    </p>


    <?php
    /*
     < h*2>Rene AJM Veerman's personal diaries</h2>
     <?php //echo $diaries->getDiary('Rene AJM Veerman');?>
     <?php echo $diaries->getDiary('aivd.nl.juniorJudge-Gavan.PURAD.Hoverswell');?>
     <h3></h3>
     <iframe style="margin:40px;border:1px solid silver;background:rgba(0,0,255,0.555);width:calc(100% - 80px);height:1080px;" src="https://said.by/Rene/on/frontpage"></iframe>
     */
    ?>


    </div>
</div>
<script type="text/javascript">
    $('.naDiaryWebPage p').addClass('backdropped');

    $('.naDiaryDaySegmentHeader').each(function(idx,el){
        var fp = $('.naFilePath',$(el).parent()).html();
        $(el).attr('title', fp);
    });
    $('.naDiaryEntryHeader').each(function(idx,el){
        var fp = $('.naFilePath',$(el).parent()).html();
        $(el).attr('title', fp);
    });
    $('.naDiaryDayHeader')
        .on('click', function (evt) {
            var pn = $(evt.currentTarget).next()[0];
            debugger;
            while ($(pn).is('.naDiaryEntry,.naDiaryDay,.naDiaryDaySegment')) {
                if ($(evt.currentTarget).is('.shown')) {
                    $('.naFilePath,ol,ul,.naDiaryEntry,.naDiaryDay,.naDiaryDaySegment',pn).add(pn).hide('slow');
                } else {
                    $('.naFilePath,ol,ul,.naDiaryEntry,.naDiaryDay,.naDiaryDaySegment',pn).add(pn).show('slow');
                }
                pn = $(pn).next()[0];
            }
            if ($(evt.currentTarget).is('.shown')) {
                $(evt.currentTarget).removeClass('shown');
            } else {
                $(evt.currentTarget).addClass('shown');
            }
        });
    $('.naDiaryDaySegmentHeader')
        .on('click', function (evt) {
            var pn = $(evt.currentTarget).next()[0];
            debugger;
            while ($(pn).is('.naDiaryEntry,.naDiaryDay,.naDiaryDaySegment')) {
                if ($(evt.currentTarget).is('.shown')) {
                    $('.naFilePath,ol,ul,.naDiaryEntry,.naDiaryDay,.naDiaryDaySegment',pn).add(pn).hide('slow');
                } else {
                    $('.naFilePath,ol,ul,.naDiaryEntry,.naDiaryDay,.naDiaryDaySegment',pn).add(pn).show('slow');
                }
                pn = $(pn).next()[0];
            }
            if ($(evt.currentTarget).is('.shown')) {
                $(evt.currentTarget).removeClass('shown');
            } else {
                $(evt.currentTarget).addClass('shown');
            }
        });
    $('.naDiaryDaySegmentHeader, .naDiaryDayHeader').css({cursor:'hand'}).removeClass('todoList').removeClass('active');
    $('.naDiaryDaySegment, .naDiaryEntry').hide();
</script>
