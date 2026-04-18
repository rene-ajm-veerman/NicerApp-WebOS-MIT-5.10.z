na.apps.loaded['/NicerAppWebOS/apps/NicerAppWebOS/userInterfaces/siteComments'] = na.comments = na.c = {
    //settings : { current : { mediaFolderView : 'view' } },
    settings : {
        initialized : false,
        current : { },
		loadedIn : {
			'#siteComments' : {
				onload : function (settings) {
                    if (!na.c.s.initialized) {
                        na.c.onload (settings);
                        $(window).resize(function() {
                            $('#siteCommentsEditor').animate({
                                top : '10%',
                                left : '10%',
                                width : '80%',
                                height : '80%',
                                opacity : 1,
                            }, {
                                duration : 'slow',
                                easing : 'swing',
                                progress : function(a,b) {
                                    na.tinymce.resize(
                                        $('#siteCommentsEditor .tinymce')[0],
                                        $('#siteCommentsEditor')[0]
                                    );
                                },
                                complete : function(a,b) {
                                    na.tinymce.resize(
                                        $('#siteCommentsEditor .tinymce')[0],
                                        $('#siteCommentsEditor')[0]
                                    );
                                }
                            });
                        });
                        setInterval (na.comments.onreload, 60 * 1000);

                        na.c.s.initialized = true;
                    }
				},
                ondestroy : function (settings) {
                },
				onresize : function (settings) {
				}
			}
		}
    },

    openIDs : function() {
        var openIDs = [];
        $('.naComment_entry').each(function(idx,ce){
            if (
                $(ce).css('display')=='block'
                || $(ce).css('display')==''
            ) openIDs.push(ce.id.replace('naComment_',''));
        })
        return JSON.stringify(openIDs);
    },

    onreload : async function () {
        var
        url = '/NicerAppWebOS/apps/NicerAppWebOS/userInterfaces/siteComments-3.0.0/ajax_getNewComments.php',
        fnc = 'na.comments.onreload()',
        data = {
            url : document.location.href.replace(document.location.search,'').replace(/\\\//g, '/')+document.location.search,
            openIDs : na.c.openIDs()
        },
        ac = {
            type : 'POST',
            url : url,
            data : data,
            success : function (data, ts, xhr) {
                $('#siteComments .vividDialogContent').html(data).delay(100);
                na.comments.onload(na.site.startUIvisuals);
            },
            error : function (xhr, ts, errorThrown) {
                na.site.ajaxFail (fncn+' : '+errorThrown);
            }
        };
        $.ajax(ac);
    },

    onload : async function(settings) {
        if (typeof settings=='function') settings = { callback : settings };
        if (typeof settings=='object' && settings!==undefined && settings!==null) {
            na.comments.settings.current.onload = settings;
        } else {
            settings = na.comments.settings.current.onload;
        }


        // Thanks go to grok.com for fixing in 20 seconds what I could not fix in an entire day ;-) lolz

        const childrenOf = {};  // parentID → array of {id, el}

        $('.naComment_entry').each(function(idx, el) {
            let pid = $('.naComment_parentID', el).text().trim();
            const id  = $('.naComment_id', el).text().trim();   // or data-id or whatever you use

            // Normalize root marker (adjust if your root uses something else than '#')
            if (pid === '#' || pid === '' || !pid) pid = 'root';

            if (!childrenOf[pid]) childrenOf[pid] = [];
            childrenOf[pid].push({id, el});
        });

        // Recursive function that computes level + counts
        function processCommentTree(parentID, currentLevel = 0) {
            const children = childrenOf[parentID] || [];

            // For root we usually don't show a count/label
            const isRoot = parentID === 'root';

            let direct = children.length;
            let total  = direct;

            children.forEach(child => {
                const {id, el} = child;

                // ──────────────── Set level on THIS comment ────────────────
                $(el).attr('data-level', currentLevel);           // easiest to read later
                // or: el.dataset.level = currentLevel;
                // or store in a map: levels[id] = currentLevel;
                //if (currentLevel === 0) $(el).css({display:'block'}); else $(el).css({display:'none'});

                // Apply visual indentation (adjust pixel value to taste)
                const marginLeft = currentLevel * 24;   // e.g. 24px per level
                $(el).css('margin-left', marginLeft + 'px');
                $('.naComment_subComments', el).css('margin-left', (20+marginLeft) + 'px');

                // ──────────────── Recurse ────────────────
                const sub = processCommentTree(id, currentLevel + 1);

                total += sub.total;
            });

            // After processing children → update display on THIS comment (if not root)
            if (!isRoot) {
                const parentEl = $('#naComment_' + parentID)[0];
                if (parentEl) {
                    const label =
                        (direct === 1 ? '1 direct reply, ' : direct + ' direct replies, ') +
                        (total  === 1 ? '1 reply total'    : total  + ' replies total');

                    $('.naComment_subComments', parentEl).html(label);
                }
            }

            if (parentID=='root' && settings.callback) settings.callback();
            return { direct, total };
        }

        // Kick off from root
        processCommentTree('root');

        na.tinymce.init (
            $('#siteCommentsEditor .tinymce')[0],
            $('#siteCommentsEditor')[0]
        );
    },

    onclick_btnAddComment : function (event) {
        $('#siteCommentsEditor')[0].latestParentID =
            $('.naComment_id',
                $(event.currentTarget).parents('.naComment_entry')
            ).html();
        $('#siteCommentsEditor').css({
            top : 'calc(50% - 5px)',
            left : 'calc(50% - 5px)',
            width : '10px',
            height : '10px',
            zIndex : 1000000,
            opacity : 0.001,
            display : 'flex',
            position : 'absolute'
        }).animate({
            top : '10%',
            left : '10%',
            width : '80%',
            height : '80%',
            opacity : 1,
        }, {
            duration : 'slow',
            easing : 'swing',
            progress : function(a,b) {
                na.tinymce.resize(
                    $('#siteCommentsEditor .tinymce')[0],
                    $('#siteCommentsEditor')[0]
                );
            },
            complete : function(a,b) {
                na.tinymce.resize(
                    $('#siteCommentsEditor .tinymce')[0],
                    $('#siteCommentsEditor')[0]
                );
            }
        });
    },

    onclick_btnPostComment : function (event) {
        var
        lpid = $('#siteCommentsEditor')[0].latestParentID,
        url = '/NicerAppWebOS/apps/NicerAppWebOS/userInterfaces/siteComments-3.0.0/ajax_addComment.php',
        c = tinymce.get('tinymce3').getContent(),
        dt = new Date(),
        tz = dt.getTimezoneOffset(),
        data = {
            rec : JSON.stringify ({
                parentID : lpid?lpid:'#', // '#' to prepare for the use of 3rd-party/jstree.
                rootItemJSON : JSON.stringify({ url : document.location.href.replace(document.location.search,'') + document.location.search }),
                clientDatetime : dt.getTime(),
                clientTZoffset : tz,
                clientIP : na.site.globals.clientIP,
                clientUsername : na.site.globals.clientUsername,
                msgHTML : c
            })
        },
        ac = {
            type : 'POST',
            url : url,
            data : data,
            success : function (data, ts, xhr) {
                na.c.onclick_btnPostComment_afterDataTransfer(data);
            },
            error : function (xhr, ts, errorThrown) {

            }
        };
        if (
            c.trim()!==''
            && !c.trim().match(/^<p>(\s+|&nbsp;)<\/p>$/)
        ) $.ajax(ac); else na.c.onclick_btnPostComment_afterDataTransfer('[]');
    },

    onclick_btnPostComment_afterDataTransfer(data) {
        // try {
        //     var json = JSON.parse(data);
        //     $('.naComment_results').prepend(json.resultHTML);
        //     na.site.startUIvisuals();
        // } catch (err) {
        //     na.site.ajaxFail (err.message);
        // };
        na.comments.onreload();

        $('#siteCommentsEditor').animate({
            top : ($(window).height()/2)-5,
            left : ($(window).width()/2)-5,
            width : '10px',
            height : '10px',
            opacity : 0.001
        }, {
            duration : 'normal',
            easing : 'swing',
            progress : function(a,b) {
                na.tinymce.resize(
                    $('#siteCommentsEditor .tinymce')[0],
                    $('#siteCommentsEditor')[0]
                );
            },
            complete : function(a,b) {
                na.tinymce.resize(
                    $('#siteCommentsEditor .tinymce')[0],
                    $('#siteCommentsEditor')[0]
                );
            }
        }).fadeOut('normal');
    },

    onclick_btnRemoveComment : function (event) {
        var
        url = '/NicerAppWebOS/apps/NicerAppWebOS/userInterfaces/siteComments-3.0.0/ajax_removeComment.php',
        el = $(event.target).parents('.naComment_entry')[0],
        id = $('.naComment_id',el).html(),
        data = {
            rec : JSON.stringify ({
                id : id
            })
        },
        ac = {
            type : 'POST',
            url : url,
            data : data,
            success : function (data, ts, xhr) {
                na.c.onclick_btnRemoveComment_afterDataTransfer(data, el);
            },
            error : function (xhr, ts, errorThrown) {

            }
        };
        $.ajax(ac);
    },

    onclick_btnRemoveComment_afterDataTransfer(data, el) {
        try {
            var json = JSON.parse(data);
            if (
                json.deleted.ids.includes($('.naComment_id',el).html())
                || json.couchdbErrorMsg.match(/deleted/)
            ) $(el).remove();
        } catch (err) {
            na.site.ajaxFail (err.message);
        };
    },

    onclick_btnExpandComment : function (event) {
        // credit for this one goes to grok.com as well.. :)
        const el        = $(event.target).parents('.naComment_entry')[0];
            const pid       = $('.naComment_id', el).html().trim();
            const isCollapsed = $('.vbExpandComment', el).is('.collapse');

            // Helper to hide/show a comment + all its descendants
            function setVisibleRecursive(entryEl, visible) {
                const id = $('.naComment_id', entryEl).html().trim();

                // Show/hide THIS comment
                if (visible) {
                    $(entryEl).show('normal');
                } else {
                    $(entryEl).hide('normal');
                }

                // Find and recurse on direct children
                $('.naComment_entry', $(entryEl).parent()).each(function(idx, childEl) {
                    const childPid = $('.naComment_parentID', childEl).html().trim();
                    if (childPid === id) {
                        setVisibleRecursive(childEl, visible);
                    }
                });
            }

            if (isCollapsed) {
                // Collapse → hide everything under this comment
                setVisibleRecursive(el, false);

                $('.vbExpandComment', el).removeClass('collapse');
                $('.vividButton_icon_imgButtonIconBG_50x50', el)[0].src = '/siteMedia/btnCssVividButton.greenYellow.png';
                $('.vividButton_icon_imgButtonIcon_50x50', el)[0].src = '/siteMedia/btnPlus_shaded.png';
            } else {
                // Expand → only show direct children (or go recursive if you prefer full expansion)
                // For "natural" behavior, many systems only expand one level at a time
                $('.naComment_entry', $(el).parent()).each(function(idx, el2) {
                    const epid = $('.naComment_parentID', el2).html().trim();
                    if (epid === pid) {
                        $(el2).show('normal');
                        // Optionally recurse here too → setVisibleRecursive(el2, true);
                    }
                });

                $('.vbExpandComment', el).addClass('collapse');
                $('.vividButton_icon_imgButtonIconBG_50x50', el)[0].src = '/siteMedia/btnCssVividButton.green2a.png';
                $('.vividButton_icon_imgButtonIcon_50x50', el)[0].src = '/siteMedia/btnMinusIcon.png';
            }
    }

};
na.c.s = na.c.settings;
na.c.s.c = na.c.s.current;
