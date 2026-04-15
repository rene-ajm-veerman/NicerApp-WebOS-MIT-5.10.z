export var naLog = {
    settings : {

    },
    view : function (logData) {
        naLog.data = logData;
        naLog.dataByIP = {};
        naLog.dataByURL = {};
        naLog.dataByCountry = {};
        naLog.dataByDate = {};
        na.m.waitForCondition ('naLog.view() : na.m.desktopIdle()?', na.m.desktopIdle, function() {
            var
            dat = naLog.data,
            d2 = naLog.dataByIP,
            d4 = naLog.dataByCountry,
            d5 = naLog.dataByDate,
            html = '',
            html2 = '';
            for (var i=0; i<dat.length; i++) {
                var
                dit = dat[i],
                date = na.m.dateObj_toDateString(
                    new Date(parseInt(dit.millisecondsSinceEpoch))
                ).match(/\d\d\d\d-\d\d-\d\d/)[0]; // remove that 'match' to get highly detailed time info.

                dit.msgProcessed = naLog.process_msg (dit.msg, dit);

                if (typeof dit.stacktrace=='string')
                    dit.stacktrace = '<pre>'+dit.stacktrace.replace('\\n','\n')+'</pre>';


                if (dit.ipinfo) {
                    dit.ipinfo = JSON.parse(dit.ipinfo[0].ip_info);
                    if (!d2[dit.ip]) d2[dit.ip] = {
                        millisecondsSinceEpoch : dit.millisecondsSinceEpoch,
                        numInits : 0,
                        numPageLoads : 0,
                        numContentLoads : 0,
                        loc : dit.ipinfo.city+', '+dit.ipinfo.region+', '+dit.ipinfo.country
                    };
                    var d2ip = d2[dit.ip];
                    if (!d4[dit.ipinfo.country]) d4[dit.ipinfo.country] = {
                        numContentLoads : 0
                    };
                    var d4tld = d4[dit.ipinfo.country];
                    if (dit.msgProcessed.documentLocation) {
                        var hr = dit.msgProcessed.documentLocation.href;
                        if (!naLog.dataByURL[hr]) naLog.dataByURL[hr] = {
                            numContentLoads : 0
                        }
                        var d2hr = naLog.dataByURL[hr];
                    }
                    if (!d5[date]) d5[date] = {
                        numContentLoads : 0
                    }

                    if (dit.msg.match(/Starting bootup/)) {
                        if (dit.msgProcessed.documentLocation) d2hr.numContentLoads++;
                        d2ip.numInits++;
                        d4tld.numContentLoads++;
                        d5[date].numContentLoads++;
                    };
                    if (dit.msg.match(/Fully booted/)) d2ip.numPageLoads++;
                    if (dit.msg.match(/na.site.stateChange/)) d2ip.numContentLoads++;
                    if (
                        dit.msg.match(/noPushState/)
                        && !dit.msg.match(/javascript:/i)
                    ) {
                        d2ip.numContentLoads++;
                        d4tld.numContentLoads++;
                        d5[date].numContentLoads++;

                        if (dit.msgProcessed.documentLocation) d2hr.numContentLoads++;
                    }

                };

                html +=
                    '<div class="naIPlog_entry '+dit.htmlClasses+'">';
                if (typeof dit.msgProcessed=='string') {
                    var dt = new Date(parseInt(dit.millisecondsSinceEpoch)),
                    dt = dt.format("yyyy-mm-dd HH:MM:ss.l");
                    html +=
                        '<span class="naIPlog_header2" onmouseover="$(\'.naIPlog_stacktrace\',$(this).parent()).show(\'slow\');" onmouseout="$(\'.naIPlog_stacktrace\',$(this).parent()).hide(\'normal\');">'
                            +'<span class="naIPlog_millisecondsSinceEpoch">'+dt+'</span> '
                            +'<span class="naIPlog_timezoneOffset">'+dit.dateTZ+'m</span> '
                            +'<span class="naIPlog_address">'+dit.ip+'</span>'
                        +'</span><br>'
                        +'<span id="naIPlog_msg__'+dit.millisecondsSinceEpoch+'">'+dit.msg+'</span>'
                } else if (dit.msgProcessed.onclickHTML) {
                    var dt = new Date(parseInt(dit.millisecondsSinceEpoch)),
                    dt = dt.format("yyyy-mm-dd HH:MM:ss.l");
                    html +=
                        '<span class="naIPlog_header2" onmouseover="$(\'.naIPlog_stacktrace\',$(this).parent()).stop(true,true,false).show(\'slow\');" onmouseout="$(\'.naIPlog_stacktrace\',$(this).parent()).stop(true,true,false).hide(\'normal\');">'
                            +'<span class="naIPlog_millisecondsSinceEpoch">'+dt+'</span> '
                            +'<span class="naIPlog_timezoneOffset">'+dit.dateTZ+'m</span> '
                            +'<span class="naIPlog_address">'+dit.ip+'</span>'
                            //+'<span class="naIPlog_referrer">referrer : '+dit.referrer+'</span> '
                        +'</span><br>'
                        +'<span id="naIPlog_msg__'+dit.millisecondsSinceEpoch+'" class="naIPlog_backgroundSetTo" onclick="'+dit.msgProcessed.onclickHTML+'">'+dit.msgProcessed.msg+'</span>'

                } else {
                    var dt = new Date(parseInt(dit.millisecondsSinceEpoch)),
                    dt = dt.format("yyyy-mm-dd HH:MM:ss.l");
                    var info3 = $.extend({referrer:dit.referrer, view : naLog.process_location(dit.msgProcessed.documentLocation.href)}, dit.msgProcessed, dit.ipinfo);
                    html +=
                        '<span id="naIPlog_msg__'+dit.millisecondsSinceEpoch+'"></span>'
                            +'<script type="text/javascript" language="javascript">'
                            +'setTimeout(function() {'
                                +'var hms_tst_js = { info : '+JSON.stringify(info3)+'};'
                                +'hm (hms_tst_js, "<div class=\\"naIPlog_header\\">'+dit.msgProcessed.msg+' <span class=\\"naIPlog_address\\">'+dit.ip+'</span> <span class=\\"naIPlog_origin\\">'+d2ip.loc+'</span> <span class=\\"naIPlog_url\\"><a href=\\"'+info3.documentLocation.href+'\\" class=\\"nomod noPushState\\" target=\\"_new\\">'+info3.documentLocation.href+'</a></span></div>", { htmlID : "naIPlog_msg__'+dit.millisecondsSinceEpoch+'", fastInit : true, header : \'minimal\' });'
                                //+'hm (hms_tst_js, "<div class=\\"naIPlog_header\\">'+dit.msgProcessed.msg+' <span class=\\"naIPlog_address\\">'+dit.ip+'</span> <span class=\\"naIPlog_origin\\">'+d2ip.loc+'</span> <pre class=\\"naIPlog_url\\">'+naLog.process_location(dit.msgProcessed.documentLocation.href)+'</pre></div>", { htmlID : "naIPlog_msg__'+dit.millisecondsSinceEpoch+'", fastInit : true, header : \'minimal\' });' // could not get this to work; escaping of " in process_location() prevents display
                            +'},150);'
                            +'</script>';
                }
                html +=
                    '<pre class="naIPlog_stacktrace">'+dit.stacktrace+'</pre>'
                    +'</div>';

            }

            /*
            var c1 = 'uneven';
            for (var ahr in naLog.dataByURL) {
                var d2hr = naLog.dataByURL[ahr];
                c1 = c1 == 'even' ? 'uneven' : 'even';
                html2 += '<div class="'+c1+'"><div><div>'+ahr+'</div><div title="Number of content loads">'+d2hr.numContentLoads+'</div></div></div>';
            }*/

            naLog.dataByDate = d5 = Object.keys(d5).sort().reduce((r, k) => (r[k] = d5[k], r), {});


            html2 += '<div style="height:500px"><canvas id="viewsByDate"></canvas></div>';
            html2 += '<div style="height:500px"><canvas id="viewsByCountry"></canvas></div>';
            html2 += '<div style="height:500px"><canvas id="viewsByPage"></canvas></div>';
            html2 += '<div class="naIPlog_header" style="clear:both;height:fit-content;display:flex;flex-wrap:wrap;">';
            var c1 = 'uneven';
            for (var aip in d2) {
                var dip = d2[aip];
                c1 = c1 == 'even' ? 'uneven' : 'even';
                html2 += '<div class="'+c1+'"><div><div title="IP" alt="IP"><a href="javascript:na.site.scrollContent(event,\'#naIPlog_msg__\'+na.log.dataByIP[\''+aip+'\'].millisecondsSinceEpoch)">'+aip+'</a></div><div title="Number of initializations" alt="Number of initializations">'+dip.numInits+'</div><div title="Number of page loads" alt="Number of page loads">'+dip.numPageLoads+'</div><div title="Number of content loads">'+dip.numContentLoads+'</div><div>'+dip.loc+'</div></div></div>';
            }
            html2 += '</div>';

            $('#siteContent > .vividDialogContent').append(html2 + html).delay(100);
            na.site.startTooltips();

            (async function() {
                const data = [];
                for (var dateStr in naLog.dataByDate) {
                    data[data.length] = { date : dateStr, count : naLog.dataByDate[dateStr].numContentLoads};
                };
                new Chart( document.getElementById('viewsByDate'), {
                    type: 'bar',
                    data: {
                        labels: data.map(row => row.date),
                        datasets: [
                        {
                            label: 'Views by date',
                            data: data.map(row => row.count)
                        }
                        ],
                    },
                    options : { // thanks go to x.com/grok
                        plugins: {
                            colors: {
                            forceOverride: true
                            }
                        },
                        color : 'rgb(255,255,255)',
                        scales: { x: { ticks: { color: 'rgb(255,255,255)' } }, y: { ticks: { color: 'rgb(255,255,255)' } } }
                    }
                });
            })();

            (async function() {
                const data = [];
                for (var atld in naLog.dataByCountry) {
                    data[data.length] = { tld : atld, count : naLog.dataByCountry[atld].numContentLoads};
                };
                new Chart( document.getElementById('viewsByCountry'), {
                    type: 'bar',
                    data: {
                        labels: data.map(row => row.tld),
                        datasets: [
                        {
                            label: 'Views by country',
                            data: data.map(row => row.count)
                        }
                        ],
                    },
                    options : { // thanks go to x.com/grok
                        plugins: {
                            colors: {
                            forceOverride: true
                            }
                        },
                        color : 'rgb(255,255,255)',
                        scales: { x: { ticks: { color: 'rgb(255,255,255)' } }, y: { ticks: { color: 'rgb(255,255,255)' } } }
                    }
                });
            })();

            (async function() {
                const data = [];
                for (var ahr in naLog.dataByURL) {
                    data[data.length] = { url : ahr, count : naLog.dataByURL[ahr].numContentLoads};
                };
                new Chart( document.getElementById('viewsByPage'), {
                    type: 'bar',
                    data: {
                        labels: data.map(row => row.url),
                        datasets: [
                        {
                            label: 'Views by page',
                            data: data.map(row => row.count)
                        }
                        ]
                    },
                    options : { // thanks go to x.com/grok
                        plugins: {
                            colors: {
                            forceOverride: true
                            }
                        },
                        color : 'rgb(255,255,255)',
                        textShadow : '2px 2px 3px rgba(0,0,0,0.8)',
                        scales: { x: { ticks: { color: 'rgb(255,255,255)' } }, y: { ticks: { color: 'rgb(255,255,255)' } } }
                    }
                });
            })();


            na.desktop.settings.visibleDivs.push ('#siteToolbarLeft');
            na.desktop.resize();
            //debugger;
        }, 100);
    },
    process_location : function (href) {
        if (href.match(document.location.origin+'/view/')) {
            var jsonEncoded = href.replace(document.location.origin+'/view/', '');
            var json = JSON.parse(na.m.decode_base64_url(jsonEncoded.replace(/\?.*/,'')));
            return json;//JSON.stringify(json, undefined, 2).replace(/"/g, '\\"');
        };
        return href;
    },
    process_msg : function (msg, dit) {
        var r = '', prefix1 = 'Starting bootup process for ', prefix2 = /Background set to "(.*?)";\s(.*)/, m = [];
        if (msg.indexOf(prefix1)===0) {
            r = { msg : prefix1, documentLocation : JSON.parse(msg.replace(prefix1,'')), ipinfo : dit.ipinfo[0].ip_info, 'ipinfo count' : dit.ipinfo.length}
        } else if (m = msg.match(prefix2)) {
            r = { msg : msg, onclickHTML : na.site.displayWallpaper(m[2])};
        } else r = msg;
        return r;
    },
    reload : function (evt,begin,end) {
        var
        url = '/NicerAppWebOS/apps/NicerAppWebOS/applications/2D/logs/ajax_siteContent.php',
        dat = {

        },
        ac = {
            type : 'GET',
            url : url,
            data : dat,
            success : function (data, ts, xhr) {
                $('#siteContent .vividDialogContent').html(data);
            },
            error : function (xhr, textStatus, errorThrown) {
            }
        };
        $.ajax(ac);
    }
};
na.log = naLog;
