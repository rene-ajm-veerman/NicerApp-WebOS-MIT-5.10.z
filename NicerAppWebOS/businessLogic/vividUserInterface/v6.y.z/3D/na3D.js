/*--- LICENSE : https://opensource.org/licenses/MIT
----- Copyright 2020-2026 by Rene AJM Veerman (rene.veerman.netherlands@gmail.com), https://grok.com and https://claude.ai/chat
---*/

import * as three from '/NicerAppWebOS/3rd-party/3D/libs/three.js/build/three.module.js';
import * as THREE from '/NicerAppWebOS/3rd-party/3D/libs/three.js/build/three.module.js';
import { Stats } from "/NicerAppWebOS/3rd-party/3D/libs/three.js/examples/jsm/libs/stats.module.js";
import { GLTFLoader } from "/NicerAppWebOS/3rd-party/3D/libs/three.js/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "/NicerAppWebOS/3rd-party/3D/libs/three.js/examples/jsm/loaders/FBXLoader.js";
import { KTX2Loader } from "/NicerAppWebOS/3rd-party/3D/libs/three.js/examples/jsm/loaders/KTX2Loader.js";
import { DRACOLoader } from "/NicerAppWebOS/3rd-party/3D/libs/three.js/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "/NicerAppWebOS/3rd-party/3D/libs/three.js/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "/NicerAppWebOS/3rd-party/3D/libs/three.js/examples/jsm/loaders/RGBELoader.js";
import { DragControls } from "/NicerAppWebOS/3rd-party/3D/libs/three.js/examples/jsm/controls/DragControls.js";
import { FlyControls } from "/NicerAppWebOS/3rd-party/3D/libs/three.js/examples/jsm/controls/FlyControls.js";
import { FirstPersonControls } from "/NicerAppWebOS/3rd-party/3D/libs/three.js/examples/jsm/controls/FirstPersonControls.js";
import gsap from "https://unpkg.com/gsap@3.12.2/index.js";
import { CameraControls, approxZero } from '/NicerAppWebOS/3rd-party/3D/libs/three.js/camera-controls-dev/dist/camera-controls.module.js';// with {type:"module"};

import { EffectComposer, BloomEffect, EffectPass, RenderPass }  from "https://esm.sh/postprocessing@latest";
/*-- OPTIONAL : */
//import { CSS2DRenderer, CSS2DObject } from 'https://esm.sh/three/examples/jsm/renderers/CSS2DRenderer.js';
//import { UnrealBloomPass } from 'https://esm.sh/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import SpriteText from "https://esm.sh/three-spritetext";

/*
  import {
    CSS2DRenderer,
    CSS2DObject,
  } from "https://unpkg.com/three@0.125.2/examples/jsm/renderers/CSS2DRenderer.js";
*/

export class na3D_fileBrowser {
    constructor(el, parent, parameters) {
        var t = window.threed = this;
        t.me = 'na3D.js::na3D_fileBrowser';
        var fncn = t.me + '::constructor(el,parent,parameters)';

        t.debug = true;
        
        t.autoRotate = false;
        t.showLines = false;
        t.showFiles = false;
        t.animationDuration = 20;
        t.useCameraControls = true;
        t.controlsEnabled = true;

        t.p = parent;
        t.el = el;
        t.t = $(t.el).attr("theme");
        t.settings = { parameters : parameters };
        t.data = parameters.views[0];
        t.fid = 1; // (int) folder id in #fileListing
        t.loading = false;
        t.resizing = false;
        t.lights = [];
        t.folders = [];
        t.ld1 = {}; //levelDataOne
        t.ld2 = {}; //levelDataTwo
        t.items = [];
        t.itemsFolders = [];
        t.meshLength = 150;
        t.wireframe = false;
        window.totaldelta = 0;

        // Show progress
        const progressContainer = document.getElementById('na3D_progress');
        if (progressContainer) progressContainer.style.display = 'block';

        let currentProgress = 5;
        const updateProgress = (percent, text) => {
            currentProgress = Math.max(currentProgress, percent);
            const bar = document.getElementById('na3D_progressBar');
            const txt = document.getElementById('na3D_progressText');
            if (bar) bar.style.width = `${currentProgress}%`;
            if (txt) txt.textContent = text || `${Math.round(currentProgress)}%`;
        };

        t._progressCallback = updateProgress;

        //na.d.s.visibleDivs.push ("#siteToolbarLeft");
        //na.d.s.visibleDivs.push ("#siteToolbarRight");
        //na.desktop.resize();

        var it = {
            id : 1,
            name : "music",
            data : 'music',
            idx : 0,
            levelIdx : 0,
            level : 0,
            offsetY : 0,
            offsetX : 0,
            offsetZ : 0,
            column : 0,
            row : 0,
            depth : 0,
            pos : {x : 0, y : 0, z : 0},
            columnCount : 1,
            rowCount : 1,
            depthCount : 1,
            columnField : 0,
            rowField : 0,
            idxPath : "/0",
            filepath : "/0/filesAtRoot/folders",
            leftRight : 0,
            upDown : 0,
            backForth : 0,
            columnOffsetValue : 0,
            rowOffsetValue : 0,
            depthOffsetValue : 0,
            parentRowOffset : 0,
            parentColumOffset : 0,
            model : { position : { x : 0, y : 0, z : 0 } }
        }, fit = {
            id : 1,
            type : "naFolder",
            text : "music",
            parent : "#",
            idx : 0,
            idxPath : "/0",
            state : { opened : true }
        };
        t.items.push (it);
        t.itemsFolders.push (fit);


        t.lines = []; // onhover lines only in here
        t.permaLines = []; // permanent lines, the lines that show all of the parent-child connections.
        t.s2 = []; // search array filled with the files and folders three.js models, used by raycaster.intersectObjects()

        var 
        c = $.cookie("3DFDM_lineColors");
        if (typeof c=="string" && c!=="") {
            t.lineColors = JSON.parse(c);
        }
        
        /*t.scene = new THREE.Scene();
        t.scene.add(cube)
        t.scene.add(new THREE.AxesHelper(5000))
        t.camera = new THREE.PerspectiveCamera( 90  , $(el).width() / $(el).height(), 0.01, 100*1000 );

        t.camera.rotation.order = 'YXZ';
        */

        t.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, logarithmicDepthBuffer: true});
        t.renderer.physicallyCorrectLights = true;
        t.renderer.outputEncoding = THREE.sRGBEncoding;
        t.renderer.setSize( $(parent).width()-20, $(parent).height()-20);
        t.renderer.setPixelRatio (window.devicePixelRatio);
        t.renderer.toneMappingExposure = 1.0;

        var innerWidth = $("#siteContent .vividDialogContent").width();
        var innerHeight = $("#siteContent .vividDialogContent").height();
        t.renderer.setSize(innerWidth, innerHeight);

        t.container = el;
        t.wglcanvas = document.getElementById("wglcanvas");
        t.controls = null;
        t.lock = null;
        t.speedx = 0;
        t.speedy = 1;
        t.speedz = 0;
        t.key = 0;
        t.paused = false;
        t.reqid = null;
        t.ctrlid = null;
        t.cup = null;
        t.clock = new THREE.Clock();
        t.delta = 0;
        t.aclock = new THREE.Clock();
        t.adelta = 0;
        t.radius = 250;
        t.eye = 6.62 * t.radius;
        t.fov = 17;
        t.near = 0.000001;
        t.far = 144000000 * t.radius;
        t.v = { controls : 4 };
        t.maxcontrols = 10;

        t.mouse = new THREE.Vector2();
        t.mouse.x = 0;
        t.mouse.y = 0;

        na.threeD = t;

        t.initializeItems (t);
    }

    onclick_node (t, node) {
        var cit = t.items[node.id], done = false;

        while (cit && !done) {
            var html = "", j = 0;
            if (cit.name!=parseInt(cit.name)) {
                var n = cit.name;
            } else {
                var n = cit.data;
            }
            if (cit.data.files) var f = cit.data.files.sort();
                else if (cit.data.folders) var f = cit.data.folders[n].files.sort();
                    else if (cit.parent?.data?.folders) var f = cit.parent.data.folders[n].files.sort();
                        else return false;
            for (var i=0; i<f.length; i++) {
                var file = ''+f[i];
                if (file.match(/\.mp3$/)) {
                    var
                    path = cit.filepath
                        .replace(/\/0\/filesAtRoot\/folders/, "")
                        .replace(/\/folders/g,"")
                        .replace('\/filesAtRoot','')
                        .replace(/\/\//g,'/')
                        .replace(/\'/g, '\\'),
                    file2 = file
                        .replace(/\-[\-\w]+\.mp3/, ".mp3")
                        .replace('.mp3', '');
                        html += '<div id="'+t.fid+'_'+j+'" class="vividButton" style="position:relative; font-size:small;" ><a href="#"><span>'+path+'/'+n+'/'+file2+'</span></a></div>';
                    j++;
                }
            };

            $('#fileListing').html(html).delay(500);
            na.site.startUIvisuals('fileListing');

            j = 0;
            for (var i=0; i<f.length; i++) {
                var file = ''+f[i];
                if (file.match(/\.mp3$/)) {
                    var
                    path = cit.filepath
                        .replace(/\/0\/filesAtRoot\/folders/, "")
                        .replace(/\/folders/g,"")
                        .replace('\/filesAtRoot','')
                        .replace(/\/\//g,'/')
                        .replace(/\'/g, '\\'),
                    id = '#'+t.fid+'_'+j,
                    el = $('a',$(id)[0])[0];

                    el.dataset.path =
                        path.replace(/'/g, '%27')+'/'
                        +n.replace(/'/g, '%27')+'/'
                        +file.replace(/'/g, '%27');  // store raw, no escaping needed
                    el.addEventListener('click', (evt) => {
                        na.threeD.play($(evt.currentTarget).parents('.vividButton'), evt.currentTarget.dataset.path);
                    });
                }
                j++;
            };

            t.fid++;
            done = true;
        }
    }

    async initializeItems(t) {
        const p = { t, ld2: {} };
        t.s2 = [];
        t._itemsByPath = new Map();
        // seed the map with root item
        t._itemsByPath.set(t.items[0].filepath + "/" + t.items[0].name, t.items[0]);

        t._progressCallback(10, "Walking file tree...");

        // Instead of na.m.walkArray (synchronous), do a chunked async walk:
        await t.createGraph(t);

        console.time('timed 1_walk');
        await t._chunkedWalkArray(t, p);
        console.timeEnd('timed 1_walk');

        console.time('timed 2_itemsToGraphData');
        t._progressCallback(45, "Building graph data...");
        t.forcegraph3d_data = await t.itemsToGraphData(t);
        console.timeEnd('timed 2_itemsToGraphData');

        console.time('timed 3_createGraph');
        t._progressCallback(75, "Creating visualization...");
        await t.createGraph(t);
        console.timeEnd('timed 3_createGraph');
        t.itemsInitialized = true;

        await new Promise(r => setTimeout(r, 0));
        t._progressCallback(100, "Done!");

        // Hide progress bar after a short delay
        setTimeout(() => {
            const progressContainer = document.getElementById('na3D_progress');
            if (progressContainer) progressContainer.style.display = 'none';
        }, 4000);
    }

    _flattenFolderEntries(filesAtRoot) {
        const result = [];

        // Mirrors what na.m.walkArray does when it hits a "folders" key:
        // cd = { path, k, at, level, params }
        function recurse(node, path, level) {
            if (!node || !node.folders) return;

            for (const k in node.folders) {
                if (!node.folders.hasOwnProperty(k)) continue;

                const childPath = path + '/folders';
                result.push({
                    path  : childPath,   // the path TO the folders object (parent key)
                k     : k,           // the folder name
                at    : node.folders, // the object containing k
                level : level,
                params: null         // filled in by _chunkedWalkArray before calling walkKey
                });

                recurse(node.folders[k], path + '/' + k, level + 2);
            }
        }

        recurse(filesAtRoot, 'filesAtRoot', 2); // level 2 matches original walkArray behaviour
        return result;
    }
    async _chunkedWalkArray(t, p) {
        const CHUNK = 200;
        const entries = t._flattenFolderEntries(t.data[0]['filesAtRoot']);

        for (let i = 0; i < entries.length; i += CHUNK) {
            const batch = entries.slice(i, i + CHUNK);
            for (const cd of batch) {
                cd.params = p;           // inject shared params (contains t, ld2, etc.)
                t.initializeItems_walkKey(cd);
            }
            const pct = 10 + 35 * (i / entries.length);
            t._progressCallback(pct, `Processing folders… ${i + batch.length}/${entries.length}`);
            await new Promise(r => setTimeout(r, 0)); // yield to browser paint
        }
    }

    initializeItems_walkKey (cd) {
        var ps = cd.path.split("/");
        if (ps[ps.length-1]=="files") {
            //console.log ("initializeItems_walkKey", "files", cd);
        } else if (ps[ps.length-1]=="folders") {

            var path = cd.path.replace(/\/folders/g, '');
            if (path.substr(0,1)!=='/') path = '/'+path;

            var
            //lastParent = it1a?it1a:it?it:null;//cd.params.t.items[0],
            pk = cd.path.replace(/\/folders/g,'');
            if (!cd.params.ld2[pk]) cd.params.ld2[pk] = { levelIdx : 0 };
            var modded = false;
            cd.params.idxPath2 = '';
            /*for (var i=0; i<cd.params.t.items.length; i++) {
             *                var it2 = cd.params.t.items[i];
             *                if (it2.filepath+"/"+(it2 && it2.name!==parseInt(it2.name) ? it2.name : it2.data) === pk) {
             *                    lastParent = it2;
             *                    cd.params.idxPath2  = it2.idxPath;
             *                    modded = true;
             *                    //debugger;
        }
        }*/


            cd.params.t._itemsByPath = new Map();
            var it = cd.params.t.items[0];
            cd.params.t._itemsByPath.set(it.filepath.replace('/filesAtRoot','') + "/" + it.name, it); // for root item

            // Then in initializeItems_walkKey, replace the O(n) loop with:
            const lastParent = cd.params.t._itemsByPath.get(pk) ?? cd.params.t.items[0];
            if (lastParent !== cd.params.t.items[0]) {
                cd.params.idxPath2 = lastParent.idxPath;
                modded = true;
            }




            /*
            if (cd.level < 3) {
                cd.params.idxPath = "/0";// + cd.params.t.items.length;
            } else {
                var
                il1 = (cd.level - 4) / 2,
                il2 = cd.params.idxPath.split("/"),
                il3 = null,
                j = il2.length;


                for (var i=0; i<j; i++) {
                    if (parseInt(il2[i])===lastParent.idx) il3 = lastParent.idx;
                    if (il3) il2.pop();
                }

                cd.params.idxPath = il2.join("/") + "/" + lastParent.idx;
                cd.params.idxPath2 = cd.params.idxPath;
            };
            */

            if (!cd.params.idxPath2) cd.params.idxPath2='';
            //sif (!modded) cd.params.idxPath2 += '/' + it2.idx;
            //cd.params.idxPath = (cd.params.it&&cd.params.it?cd.params.it.idxPath:'') + '/' + cd.params.t.items.length;
            if (!modded) cd.params.idxPath = cd.params.idxPath2; else cd.params.idxPath = '';// + '/' + cd.params.t.items.length;
            //debugger;



            var
            it = {
                level : cd.level,
                name : cd.k,
                idx : cd.params.t.items.length,
                idxPath : cd.params.idxPath2 + '/' + cd.params.t.items.length,
                filepath : path,
                levelIdx : ++cd.params.ld2[pk].levelIdx,
                parent : lastParent,
                leftRight : 0,
                upDown : 0,
                columnOffsetValue : 1000,
                rowOffsetValue : 1000,
                model : { position : new THREE.Vector3(0,0,0) },
                data : cd.at[cd.k]
            };
            //if (!modded) cd.params.idxPath = it.idxPath;
            //if (!cd.k.match(/\/.mp3$/)) {
                //debugger;
                //console.log ("t779", it.filepath + "/" + it.data, it);
            //};

            if (!cd.params.t.ld3) cd.params.t.ld3 = {};
            if (!cd.params.t.ld3[it.idxPath]) cd.params.t.ld3[it.idxPath] = { itemCount : 0, folderCount : 0, items : [] };
            if (!cd.params.t.ld3[it.idxPath].folderCount) cd.params.t.ld3[it.idxPath].folderCount = 0;
            cd.params.t.ld3[it.idxPath].folderCount++;
            cd.params.t.ld3[it.idxPath].itemCount++;
            cd.params.t.ld3[it.idxPath].items.push (it);
            //cd.params.idxPath2 = cd.params.idxPath + "/" + it1a.idx;
            cd.params.t.items.push (it);
            cd.params.t._itemsByPath.set(it.filepath.replace('/filesAtRoot','') + "/" + it.name, it);
            cd.params.it = it;
            //console.log ('initializeFolderView_walkKey() : '+cd.params.t.items.length+' items initialized.')

            cd.params.ld2[cd.path] = { levelIdx : 1 };

            // display files :
            /*
            if (cd.params.t.showFiles && it.data.files)
            for (var fkey in it.data.files) {
                //if (fkey.match(/\.mp3$/)) {
                    var p = null;

                    /*var ps2 = $.extend([],ps);
                    delete ps2[ps2.length-1];
                    var ps2Str = ps2.join("/");
                    var parent = it.parent;//na.m.chaseToPath (cd.root, ps2Str+"/files/"+fkey, false);* /
                    //var level = lastParent.level/2;//ps2.length;


                    var
                    pk = cd.path,//+"/"+cd.k+"/"+fkey,
                    it1a = {
                        data : it.data.files[fkey],
                        level : cd.level+1,
                        name : fkey,
                        idx : cd.params.t.items.length,
                        idxPath : cd.params.idxPath + '/' + cd.params.t.items.length,
                        filepath : path+"/"+cd.k,
                        levelIdx : ++cd.params.ld2[pk].levelIdx,
                        parent : it,
                        leftRight : 0,
                        upDown : 0,
                        columnOffsetValue : 1000,
                        rowOffsetValue : 1000,
                        model : { position : new THREE.Vector3(0,0,0) }
                    };

                    if (!cd.params.t.ld3) cd.params.t.ld3 = {};
                    if (!cd.params.t.ld3[it1a.idxPath]) cd.params.t.ld3[it1a.idxPath] = { itemCount : 0, items : [] };
                    cd.params.t.ld3[it1a.idxPath].itemCount++;
                    cd.params.t.ld3[it1a.idxPath].items.push (it1a);
                    //cd.params.idxPath2 = cd.params.idxPath + "/" + it1a.idx;
                    cd.params.t.items.push (it1a);
                }
            //}
            */
                    if (it.data && it.data.files) {
                        const files = it.data.files;
                        const totalFiles = Object.keys(files).length;
                        let processedFiles = 0;

                        for (var fkey in files) {
                            if (files.hasOwnProperty(fkey)) {
                                const file = files[fkey];

                                var
                                pk = cd.path,//+"/"+cd.k+"/"+fkey,
                                it1a = {
                                    data : it.data.files[fkey],
                                    level : cd.level+1,
                                    name : fkey,
                                    idx : cd.params.t.items.length,
                                    idxPath : cd.params.idxPath + '/' + cd.params.t.items.length,
                                    filepath : path+"/"+cd.k,
                                    levelIdx : ++cd.params.ld2[pk].levelIdx,
                                    parent : it,
                                    leftRight : 0,
                                    upDown : 0,
                                    columnOffsetValue : 1000,
                                    rowOffsetValue : 1000,
                                    model : { position : new THREE.Vector3(0,0,0) }
                                };

                                if (!cd.params.t.ld3) cd.params.t.ld3 = {};
                                if (!cd.params.t.ld3[it1a.idxPath]) cd.params.t.ld3[it1a.idxPath] = { itemCount : 0, items : [] };
                                cd.params.t.ld3[it1a.idxPath].itemCount++;
                                cd.params.t.ld3[it1a.idxPath].items.push (it1a);
                                //cd.params.idxPath2 = cd.params.idxPath + "/" + it1a.idx;
                                cd.params.t.items.push (it1a);

                                cd.params.t._itemsByPath.set(it1a.filepath + "/" + it1a.name, it1a);

                                processedFiles++;

                                // === Progress update (throttled for performance) ===
                                if (totalFiles > 30 && (processedFiles % Math.max(1, Math.floor(totalFiles / 25)) === 0 || processedFiles === totalFiles)) {
                                    const progressPercent = 10 + Math.round((processedFiles / totalFiles) * 35); // e.g. 10% → 45%

                                    if (p && p._progressCallback) {
                                        p._progressCallback(
                                            progressPercent,
                                            `Scanning files: ${processedFiles}/${totalFiles} (${key})`
                                        );
                                    }
                                }
                            }
                        }
                    }
        }
        //debugger;
    }
    initializeItems_walkValue (cd) {
        //console.log ("initializeItems_walkValue", "cd", cd);
    }

   onresize (t, levels) {
        var t = this;
        //debugger;
        //t.onresize_do (t, levels);
        na.m.waitForCondition ("waiting for other onresize commands to finish",
            function () { return na.d.s.animating === false },
            function () { t.onresize_do (t, levels); },
            50
        );
    }


    onresize_do(t, callback) {
        t.resizing = true;
        t.overlaps = [];

        let
        fncn = 'na3D.js::onresize_do()',
        c = {};

        t.ld4 = [];
        t.s2 = [];

        $('.na3D').css({
            width : $("#siteContent .vividDialogContent").width(),
            height : $("#siteContent .vividDialogContent").height()
        });

        t.onresize_do_phase2 (t, callback);

    }


    // Returns all ancestor IDs up to the root
    getAllAncestors (node) {
        if (!node || !node?.item?.idxPath) return new Set();

        const ancestors = new Set();
        ancestors.add(0); // don't forget to add the innermost root folder
        const path = node.item.idxPath;


        if (typeof path === 'string') {
            const parts = path.substr(1,path.length-1).split('/');
            for (let i = 0; i < parts.length; i++) {
                var current_t_items_N_idx = parseInt(parts[i]);
                ancestors.add(current_t_items_N_idx);           // add partial paths
            }
        }

        // Also add the node itself
        ancestors.add(node.id);

        return ancestors;
    }

    getAllDescendants (t, node) {
        if (!node) return new Set();

        const descendants = new Set();
        const queue = [node];

        while (queue.length > 0) {
            const current = queue.shift();
            const id = current.id || current;

            if (descendants.has(id)) continue;
            descendants.add(id);

            // Find all direct children
            t.graph.graphData().links.forEach(link => {
                const sourceId = link.source?.id ?? link.source;
                const targetId = link.target?.id ?? link.target;

                if (sourceId === id) {
                    queue.push(link.target);
                }
            });
        }

        return descendants;
    }

    onresize_do_phase2(t, callback) {
        let fncn = 'na3D.js::onresize_do_phase2()';
        // NEW: After all meshes added, start recursive projection from root
        //t.projectHierarchy(t, t.items[0], 10*1000); // Start radius ~5000; adjust as needed

        var textures = {};


        // Polyfill for libraries that expect Node.js globals
        window.process = window.process || {};
        window.process.env = window.process.env || {};
        window.process.env.NODE_ENV = 'production';   // or 'development'


        $('#fileListing, #playlist').css({overflowY:'auto'});
        t.initialized = true;
        var x = t.items;
        t.onresize_postDo(t, true);
    }

    onresize_postDo (t, animate=false) {
        //t.drawLines(t);
        //t.controls._camera.lookAt (t.s2[0].position);

        const width = t.el.clientWidth;
        const height = t.el.clientHeight;

        if (t.graph) t.graph
        .width(width)
        .height(height);

        t.resizing = false;

        if (!t.started4) {
            t.started4 = true;
        };
        if (typeof callback=="function") callback(t);
    }

    getHierarchicalColor(t, depth) {
        const colors = [
            '#4dabf7',   // 0 - root / top level (blue)
            '#51cf66',   // 1 - light green
            '#ffd43b',   // 2 - yellow
            '#ff922b',   // 3 - orange
            '#ffbbdd',   // 4 - pink
            '#9775fa',   // 5 - purple
            '#74c0fc',   // 6
            '#63e6be',
            'lime',
            'cyan',
            'red',
            '#f06595', // PINK
            'grey',
            'white',
            'ivory'
        ];
        const maxDepth = t.maxLevel;

        if (depth <= 0 || maxDepth <= 0) return colors[0];

        // Linear relative mapping - Recommended
        // Spreads colors evenly from depth 0 to maxDepth
        const relativeIndex = Math.floor((depth / maxDepth) * (colors.length - 1));
        return colors[Math.min(relativeIndex, colors.length - 1)];

/*
        var y = Math.min(depth, colors.length - 1);
        var x = colors[y] || '#aaaaaa';
        //return x;
        //return colors[Math.min(Math.abs(colors.length*depth/100), colors.length - 1)] || '#aaaaaa';
        return colors[depth % colors.length]*/
    }

    play(btn, relPath) {
        let
        fullPath = document.location.origin+'/NicerAppWebOS/apps/NicerAppWebOS/applications/2D/musicPlayer.fancy.latest.2D/music/'+relPath;
        fullPath = new URL(fullPath).pathname;
        $('#audioTag')[0].src = na.m.encodeUnicodePath(fullPath);
        $('#audioTag')[0].play();
        $('#fileListing .vividButtonSelected').removeClass('vividButtonSelected').addClass('vividButton');
        $(btn).addClass('vividButtonSelected');
        let
        i = $('#playlist li').length,
        html = '<li style="margin-right:10px;"><div id="playList_'+i+'" class="vividButton" style="position:relative;"><a href="javascript:na.apps.loaded.threed_fileExplorer.play($(\'#filesList_'+i+'\')[0], \''+fullPath+'\')" style="font-size:medium">'+relPath+'</a></div></li>';
        $('#playlist ul').append(html);
        $("#playlist li div, #fileListing li div").css({lineHeight:'1em'});

        na.site.startUIvisuals();
    }

    getChildren(item) {
        return this.items.filter(it => it.parent === item && (this.showFiles || it.name.indexOf('.')===-1));
    }

    async createGraph(t) {
        if (t.graph) {
            t.graph._destructor?.();
            t.graph = null;
        }
        // === Before creating t.graph ===
        const maxLevels = 12; // adjust based on your deepest hierarchy
        t.dagLevelDistances = new Array(maxLevels).fill(0).map((_, level) => {
            return 100 + (level * 40) + Math.random() * 380;
        });
        t.maxLevel = 0;
        for (var i=0; i<t.items.length; i++) {
            var it = t.items[i];
            if (it.level > t.maxLevel) t.maxLevel = it.level;
        }

        const container = t.el;
        if (!container) return;

        const data = t.forcegraph3d_data;
        if (!data?.nodes?.length) return;

        const nodeIds = new Set(data.nodes.map(n => n.id));
        const validLinks = data.links.filter(link => {
            let src = typeof link.source === 'object' ? link.source.id : link.source;
            let tgt = typeof link.target === 'object' ? link.target.id : link.target;
            return nodeIds.has(src) && nodeIds.has(tgt);
        });

        // All data loaded — now assign positions, THEN start simulation
        // Build parent->children map
        const childMap = new Map();
        validLinks.forEach(link => {
            const src = typeof link.source === 'object' ? link.source.id : link.source;
            const tgt = typeof link.target === 'object' ? link.target.id : link.target;
            if (!childMap.has(src)) childMap.set(src, []);
            childMap.get(src).push(tgt);
        });

        const nodeMap = new Map(data.nodes.map(n => [n.id, n]));

        // Find root
        const targetIds = new Set(validLinks.map(l => typeof l.target === 'object' ? l.target.id : l.target));
        const rootNode = data.nodes.find(n => !targetIds.has(n.id));
        const rootId = rootNode?.id ?? 0;

        const levelRadius = 50;  // distance per level — tune this

        // BFS: collect nodes level by level
        const levels = [];
        const visited2 = new Set();
        let currentLevel = [rootId];
        visited2.add(rootId);
        while (currentLevel.length > 0) {
            levels.push(currentLevel);
            const nextLevel = [];
            currentLevel.forEach(id => {
                (childMap.get(id) || []).forEach(childId => {
                    if (!visited2.has(childId)) {
                        visited2.add(childId);
                        nextLevel.push(childId);
                    }
                });
            });
            currentLevel = nextLevel;
        }

        // Position root at origin
        const root = nodeMap.get(rootId);
        if (root) { root.x = root.fx = 0; root.y = root.fy = 0; root.z = root.fz = 0; }

        const goldenRatio = (1 + Math.sqrt(5)) / 2;

        // Level-1 nodes define the cap centers for ALL their descendants
        const level1Nodes = levels[1] ?? [];
        const level1Count = level1Nodes.length;
        const nodeSectorCenter = new Map();

        level1Nodes.forEach((childId, i) => {
            const phi   = Math.acos(1 - 2 * (i + 0.5) / level1Count);
            const theta = 2 * Math.PI * i / goldenRatio;
            const dir = {
                x: Math.sin(phi) * Math.cos(theta),
                            y: Math.sin(phi) * Math.sin(theta),
                            z: Math.cos(phi),
            };
            // Stamp this direction as cap center for the level-1 node and ALL descendants
            nodeSectorCenter.set(childId, dir);
            const queue = [...(childMap.get(childId) || [])];
            while (queue.length) {
                const id = queue.shift();
                nodeSectorCenter.set(id, dir);
                (childMap.get(id) || []).forEach(c => queue.push(c));
            }
        });

        // Cap angle based on number of level-1 sectors
        const capAngle = Math.PI / Math.sqrt(Math.max(level1Count, 1));

        // Position each level as Fibonacci caps
        levels.forEach((levelNodes, levelIdx) => {
            if (levelIdx === 0) return;

            const totalCount = levelNodes.length;
            //const r = Math.max(levelIdx * 25, Math.sqrt(totalCount) * 40);

            // Use the item's actual level as distance from center
            const itemLevel = levelNodes[0].item?.level ?? levelIdx;
            const r = itemLevel * 750;  // tune the 250 to taste

            // Group by sector center
            const bySector = new Map();
            levelNodes.forEach(nodeId => {
                const center = nodeSectorCenter.get(nodeId);
                if (!center) return;
                const key = `${center.x.toFixed(3)}_${center.y.toFixed(3)}`;
                if (!bySector.has(key)) bySector.set(key, { center, nodes: [] });
                bySector.get(key).nodes.push(nodeId);
            });

            bySector.forEach(({ center, nodes }) => {
                // Sort alphabetically within sector
                nodes.sort((a, b) =>
                (nodeMap.get(a)?.name ?? '').localeCompare(nodeMap.get(b)?.name ?? '')
                );

                const count = nodes.length;
                const cosCapAngle = Math.cos(capAngle);

                // Two axes perpendicular to center for rotating Fibonacci onto cap
                const right = normalize(cross(
                    center,
                    Math.abs(center.z) < 0.9 ? { x: 0, y: 0, z: 1 } : { x: 1, y: 0, z: 0 }
                ));
                const up = normalize(cross(right, center));

                nodes.forEach((nodeId, i) => {
                    const node = nodeMap.get(nodeId);
                    if (!node) return;

                    // Fibonacci on spherical cap — phi spans [0, capAngle]
                    const phi   = Math.acos(1 - (1 - cosCapAngle) * (i + 0.5) / count);
                    const theta = 2 * Math.PI * i / goldenRatio;

                    const sinPhi = Math.sin(phi);
                    const cosPhi = Math.cos(phi);

                    // Rotate Fibonacci point onto cap centered at `center`
                    const dir = {
                        x: center.x * cosPhi + (Math.cos(theta) * right.x + Math.sin(theta) * up.x) * sinPhi,
                              y: center.y * cosPhi + (Math.cos(theta) * right.y + Math.sin(theta) * up.y) * sinPhi,
                              z: center.z * cosPhi + (Math.cos(theta) * right.z + Math.sin(theta) * up.z) * sinPhi,
                    };

                    node.x = node.fx = r * dir.x;
                    node.y = node.fy = r * dir.y;
                    node.z = node.fz = r * dir.z;
                });
            });
        });

        function cross(a, b) {
            return {
                x: a.y * b.z - a.z * b.y,
                y: a.z * b.x - a.x * b.z,
                z: a.x * b.y - a.y * b.x,
            };
        }
        function normalize(v) {
            const len = Math.sqrt(v.x**2 + v.y**2 + v.z**2);
            return len === 0 ? { x: 0, y: 1, z: 0 } : { x: v.x/len, y: v.y/len, z: v.z/len };
        }



        t.graph = window.graph = ForceGraph3D();
        t.graph(container);  // mount to DOM immediately

        console.time('timed 4_simulation_settle');

        t.graph.d3Force('charge', null);
        t.graph.d3Force('center', null);

        t.graph
        .pauseAnimation()
        .backgroundColor('rgba(0,0,0,0.22)')   // ← changed for visibility
        .width(t.el.clientWidth || 1000)
        .height(t.el.clientHeight || 700)
        .dagMode('radialout')
        //.dagLevelDistance(1000)
        .nodeId('id')           // ← tell the library which field is the ID
        .linkSource('source')
        .linkTarget('target')

        .nodeLabel(null)
        .nodeOpacity(0.55)
        .warmupTicks(0)
        .cooldownTicks(0)
        .cooldownTime(1000)
        .nodeId('id')
        .linkSource('source')
        .linkTarget('target')
        .nodeLabel('data')
        .linkWidth(2)
        .linkColor(() => 'rgba(200, 200, 255, 0.4)')
        .nodeColor(n => {
            const depth = (n.item?.level ?? 0) / 2 + 1;
            return t.getHierarchicalColor(t, depth);
        })
        .nodeRelSize(10)           // slightly bigger nodes so they don't get lost
        .d3AlphaDecay(0.05)        // slower cooling = more final spread
        // === Custom Nodes & Links ===
        /*
         .nodeThreeObjectExtend(true)
         .nodeThreeObject(node => {
        //     //debugger;
        //

             const text = node.name != parseInt(node.name) ? node.name : node.data;//`${node.filepath.replace(/\/\//g, '/')}/${node.data}`;
             const sprite = new SpriteText(text);
             node.sprite = sprite;
             sprite.color = 'rgba(255,255,255,0.7)';
             sprite.textHeight = 5;
             sprite.fontFace = 'Arial';
             sprite.position.set(0, 18, 0);
        //
        //     // Optional: make sure it renders in front
             sprite.material.depthWrite = false;
             sprite.material.depthTest = false;
        //
        //     //t.graph.scene().add(sprite);
             return sprite;

         })
         */
        .nodeThreeObjectExtend(false)
        .nodeThreeObject(null)

        // Custom Link Labels
        .linkThreeObjectExtend(false)
        .linkThreeObject(null)
        // === INTERACTIONS ===
        .onNodeHover(node => {
            t.currentHoverNode = node;

            // Remove old hover label
            if (t.hoverLabel) {
                t.graph.scene().remove(t.hoverLabel);
                t.hoverLabel.material.dispose();  // ← add this
                t.hoverLabel = null;
            };

            if (!node) {
                tooltip.style.display = 'none';
                // Reset when hover ends
                t.graph.nodeColor(n => {
                    var depth = n?.item?.level ?? n.item.level ?? 0;
                    depth = depth / 2 + 1;
                    return t.getHierarchicalColor(t,depth);
                });
            } else {

                var path = node.filepath
                .replace(/\/0\/filesAtRoot\/folders/, "")
                .replace(/\/folders/g,"")
                .replace('\/filesAtRoot','')
                .replace(/\/\//g,'/')
                .replace(/\'/g, '\\');

                // Fill content
                tooltip.innerHTML = `
                <div class="na-tooltip-icon">📁</div>
                <div class="na-tooltip-name">${node.data}</div>
                <div class="na-tooltip-path">${path ?? ''}</div>
                `;

                tooltip.style.display = 'block';

                // Big hover label
                //node.sprite.visibile = false;

                //debugger;
                /*
                const text = (node.data!=parseInt(node.data)?node.data:node.name);//('.'+(node?.item?.filepath.replace(/\/\//g,'./') || '') + '/' + node.name).replace('..','.');
                t.hoverLabel = new SpriteText(text);
                t.hoverLabel.color = '#ffff88';
                t.hoverLabel.textHeight = 5;
                t.hoverLabel.fontFace = 'Arial';
                t.hoverLabel.fontWeight = 'bold';
                t.hoverLabel.position.set(node.x, node.y + 18, node.z);
                t.hoverLabel.material.depthWrite = false;
                t.hoverLabel.material.depthTest = false;
                t.graph.scene().add(t.hoverLabel);
                // t.graph.refresh();
                */

                // Get all nodes to highlight
                const ancestors = t.getAllAncestors(node);
                const descendants = t.getAllDescendants(t, node);
                const highlightedNodes = new Set([...ancestors, ...descendants, node.id || node]);

                t.graph
                .nodeColor(n => {
                    if (n === node) return '#ffff44';                    // hovered node

                    var depth = n?.item?.level ?? n.item.level;
                    depth = depth / 2 + 1;
                    if (highlightedNodes.has(n.id)) { return t.getHierarchicalColor(t,depth); };
                    return 'rgba(150,150,150,0.5)';

                })
                .linkColor(link => {
                    const defaultColor = 'rgba(200,200,255,0.4)'
                    const hovered = t.currentHoverNode;
                    if (!hovered) return defaultColor;

                    const hoveredAncestors = t.getAllAncestors(hovered);
                    const sourceAncestors = t.getAllAncestors(link.source);
                    if (sourceAncestors.size===0) return defaultColor;
                    var sourceDepth = t.items[Array.from(sourceAncestors)[sourceAncestors.size-1]].level ?? 0;
                    sourceDepth = Math.round(sourceDepth / 2) + 1;

                    const targetAncestors = t.getAllAncestors(link.target);
                    if (targetAncestors.size===0) return defaultColor;
                    var targetDepth = t.items[Array.from(targetAncestors)[targetAncestors.size-1]].level ?? 0;
                    targetDepth = Math.round(targetDepth / 2) + 1;

                    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                    const targetId = typeof link.target === 'object' ? link.target.id : link.target;


                    const isAncestorLink =  ancestors.has(sourceId) && ancestors.has(targetId);
                    const isDescendantLink = descendants.has(sourceId) && descendants.has(targetId);


                    if (ancestors.has(sourceId) && ancestors.has(targetId)) {
                        return t.getHierarchicalColor(t,sourceDepth);
                    }
                    // Direct children
                    if (isDescendantLink) {
                        return t.getHierarchicalColor(t,targetDepth);
                    }

                    //debugger;
                    return defaultColor;

                })
                .linkWidth(link => {
                    const hovered = t.currentHoverNode;
                    if (!hovered) return 1;

                    const sourceId = link.source?.id ?? link.source;
                    const targetId = link.target?.id ?? link.target;
                    const hoverId  = hovered.id ?? hovered;
                    const allRelated = new Set([...ancestors, ...descendants, hoverId]);

                    if (allRelated.has(sourceId) && allRelated.has(targetId)) {
                        return 4;
                    } else {
                        return 1;
                    }
                })
            }
        })

        .onNodeClick(node => {
            if (!node) return;
            t.currentNode = node;

            const distance = 180;
            const nodeDistance = Math.hypot(node.x || 0, node.y || 0, node.z || 0);
            window.saveHistoryState(`Node clicked (1) : ${node.data}`);

            // If node is at/near origin, approach from current camera direction
            if (nodeDistance < 1) {
                t.graph.cameraPosition(
                    { x: distance, y: distance, z: distance },
                    { x: 0, y: 0, z: 0 },
                    1600
                );
            } else {
                const distRatio = 1 + distance / nodeDistance;
                t.graph.cameraPosition(
                    {
                        x: (node.x || 0) * distRatio,
                                       y: (node.y || 0) * distRatio,
                                       z: (node.z || 0) * distRatio
                    },
                    node,
                    1600
                );
            }

            setTimeout (function(node) {
                window.saveHistoryState(`Node clicked (2) : ${node.data}`);
            }, 1700, node);
            if (typeof t.onclick_node === 'function') t.onclick_node(t, node);
        })
        .nodeLabel('')           // disable built-in tooltip entirely

        .graphData({ nodes: data.nodes, links: validLinks })

        .onEngineStop(() => {
            console.timeEnd('timed 4_simulation_settle');
        })
        .numDimensions(3);

        t.graph

        // Move tooltip on mousemove — offset ABOVE the cursor
        const tooltip = document.createElement('div');
        tooltip.className = 'na-node-tooltip';
        tooltip.style.display = 'none';
        document.body.appendChild(tooltip);

        document.addEventListener('mousemove', e => {
            if (tooltip.style.display === 'none') return;
            const w = tooltip.offsetWidth;
            const h = tooltip.offsetHeight;
            // Position above and horizontally centered on cursor
            tooltip.style.left = (e.clientX - w / 2) + 'px';
            tooltip.style.top  = (e.clientY - h - 24) + 'px';  // 24px above cursor tip
        });

        // Access the underlying d3 simulation and stop it cold after 1 tick
        const sim = t.graph.d3Force('charge')?.strength ? t.graph : null;
        t.graph.d3Force('charge', null);
        t.graph.d3Force('center', null);
        //t.graph.d3ReheatSimulation();

        window.currentCamera = t.graph.camera();
        t.setupFlightControls(t);

        console.time('timed 5_resumeAnimation');
        t.graph.resumeAnimation();
        console.timeEnd('timed 5_resumeAnimation');

        console.log('stats : dagMode:', t.graph.dagMode());
        console.log('stats : charge force:', t.graph.d3Force('charge'));
    }


    setupFlightControls(t) {
        const container = t.el;
        let flyInterval = null;
        let mouseButton = null;
        let holdTimer = null;
        const HOLD_THRESHOLD = 2000;  // ms before long-click activates
        const FLY_SPEED = 25;        // units per tick — tune this

        const getForwardVector = window.getForwardVector = () => {
            const camera = window.currentCamera = t.graph.camera();
            const dir = new THREE.Vector3();
            camera.getWorldDirection(dir);  // normalised forward direction
            return dir;
        };

        const startFlying = (direction) => {
            if (flyInterval) return;
            flyInterval = setInterval(() => {
                const camera = t.graph.camera();
                const forward = getForwardVector();
                const delta = forward.multiplyScalar(FLY_SPEED * direction);
                const pos = t.graph.cameraPosition();

                // Move both camera AND its look target together
                // so OrbitControls doesn't snap back
                t.graph.cameraPosition(
                    { x: pos.x + delta.x, y: pos.y + delta.y, z: pos.z + delta.z },
                    { x: (pos.lookAt?.x ?? 0) + delta.x, y: (pos.lookAt?.y ?? 0) + delta.y, z: (pos.lookAt?.z ?? 0) + delta.z }
                    // no duration = instant
                );
            }, 16);
        };

        const stopFlying = () => {
            if (flyInterval) {
                clearInterval(flyInterval);
                flyInterval = null;
            }
            if (holdTimer) {
                clearTimeout(holdTimer);
                holdTimer = null;
            }
            mouseButton = null;
        };

        container.addEventListener('mousedown', (e) => {
            // Ignore if over a node (ForceGraph handles that)
            if (e.target !== container.querySelector('canvas')) return;

            if (e.button === 0) {
                // Left button — wait for long press
                mouseButton = 0;
                holdTimer = setTimeout(() => {
                    if (mouseButton === 0) startFlying(1);  // forward
                }, HOLD_THRESHOLD);
            } else if (e.button === 2) {
                // Right button — immediate backward (or also long-press if preferred)
                e.preventDefault();
                mouseButton = 2;
                holdTimer = setTimeout(() => {
                    if (mouseButton === 2) startFlying(-1);  // backward
                }, HOLD_THRESHOLD);
            }
        });

        container.addEventListener('mouseup', stopFlying);
        container.addEventListener('mouseleave', stopFlying);

        // Prevent context menu on right click
        container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Optional: scroll wheel also flies (smoother than zoom)
        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const direction = e.deltaY < 0 ? 1 : -1;
            const forward = getForwardVector();
            const speed = Math.abs(e.deltaY) * 1.5;
            const delta = forward.multiplyScalar(speed * direction);
            const pos = t.graph.cameraPosition();
            t.graph.cameraPosition(
                { x: pos.x + delta.x, y: pos.y + delta.y, z: pos.z + delta.z },
                { x: (pos.lookAt?.x ?? 0) + delta.x, y: (pos.lookAt?.y ?? 0) + delta.y, z: (pos.lookAt?.z ?? 0) + delta.z }
            );
        }, { passive: false });

        // After graph is created, unlock the internal OrbitControls
        const internalControls = t.graph.controls();
        if (internalControls) {
            internalControls.minDistance = 0;       // can fly right through
            internalControls.maxDistance = Infinity; // no outer wall
            internalControls.minPolarAngle = 0;      // no vertical clamping
            internalControls.maxPolarAngle = Math.PI;
            internalControls.enablePan = true;
            internalControls.screenSpacePanning = true;
        }

        // Also push the camera far plane out so distant nodes don't clip
        const camera = t.graph.camera();
        if (camera) {
            camera.far = 10000000;
            camera.near = 0.1;
            camera.updateProjectionMatrix();
        }

        console.log('Flight controls ready — long left-click: fly forward, long right-click: fly backward, scroll: fly in/out');
    }


    itemsToGraphData(t) {
        const nodes = [];
        var links = [];

        const seen = new Set();
        const visibleItems = t.items.filter(it => {
            // Always exclude mp3 files unless showFiles is on

            if (!t.showFiles) {
                if (typeof it.name === 'string' && it.name.match(/\.mp3$/i)) return false;
                if (typeof it.data === 'string' && it.data.match(/\.mp3$/i)) return false;
            }

            if (seen.has(it.idx)) return false;  // hard dedup

            const r = t.showFiles || it.idx === 0 || it.idx === 1 || (
                (typeof it.data === 'string' && it.data.indexOf('.') === -1 && it.data != parseInt(it.data))
                || (
                    (typeof it.name === 'string' && it.name.indexOf('.') === -1 && it.name != parseInt(it.name))
                    && it.data && (it.data.files || it.data.folders)
                )
            );

            if (r) seen.add(it.idx);
            if (it.name.match(/\.mp3$/i)) debugger;
            return r;
        });

        // Build a Set of visible idx values so we can check parent validity
        const visibleIdxSet = new Set(visibleItems.map(it => it.idx));

        visibleItems.forEach(item => {
            nodes.push({
                id: item.idx,
                name: item.name,
                data: item.data && typeof item.data === 'string' ? item.data : item.name,
                type: 'folder',
                item: item,
                level: item.level,
                filepath: item.filepath,
                idxPath: item.idxPath,
                idx: item.idx,
            });

            // Only create link if parent is also visible
            /*if (item.parent && item.parent.idx !== undefined && visibleIdxSet.has(item.parent.idx)) {
                links.push({
                    source: item.parent.idx,
                    target: item.idx
                });
            }
            // If parent is NOT visible, walk up until we find one that is
            else if (item.parent && item.parent.idx !== undefined && !visibleIdxSet.has(item.parent.idx)) {
                let ancestor = item.parent.parent;
                while (ancestor) {
                    if (visibleIdxSet.has(ancestor.idx)) {
                        links.push({ source: ancestor.idx, target: item.idx });
                        break;
                    }
                    ancestor = ancestor.parent;
                }
            }*/

            if (item.parent?.idx !== undefined) {
                // Walk up until we hit a visible ancestor
                let p = item.parent;
                while (p && !visibleIdxSet.has(p.idx)) {
                    p = p.parent;
                }
                if (p && visibleIdxSet.has(p.idx)) {
                    links.push({ source: p.idx, target: item.idx });
                }
                // If no visible ancestor found, node becomes a root — no link added
            }
        });





        // After visibleItems is built:
        console.log('Total t.items:', t.items.length);
        console.log('Visible items:', visibleItems.length);

        // Check for duplicate idx in visibleItems
        const idxCount = new Map();
        visibleItems.forEach(it => {
            idxCount.set(it.idx, (idxCount.get(it.idx) || 0) + 1);
        });
        const dupeIdx = [...idxCount.entries()].filter(([,v]) => v > 1);
        console.log('Duplicate idx in visibleItems:', dupeIdx);

        // Check for duplicate names
        const nameCount = new Map();
        visibleItems.forEach(it => {
            const key = (it.filepath || '') + '/' + (it.name || it.data);
            nameCount.set(key, (nameCount.get(key) || 0) + 1);
        });
        const dupeNames = [...nameCount.entries()].filter(([,v]) => v > 1);
        console.log('Duplicate paths in visibleItems:', dupeNames.slice(0, 20));

        // Also check t.items itself
        const rawIdxCount = new Map();
        t.items.forEach(it => rawIdxCount.set(it.idx, (rawIdxCount.get(it.idx) || 0) + 1));
        const rawDupes = [...rawIdxCount.entries()].filter(([,v]) => v > 1);
        console.log('Duplicate idx in raw t.items:', rawDupes);



        const nodeIdSet = new Set(nodes.map(n => n.id));
        // Final safety net
        links = links.filter(l => visibleIdxSet.has(l.source) && visibleIdxSet.has(l.target));

        return { nodes, links: links };

        //return { nodes, links };
    }

    toggleShowLines () {
        var t = this;
        t.showLines = !t.showLines;
        if (t.showLines) {
            t.drawLines(t);
            $("#showLines").removeClass("vividButton").addClass("vividButtonSelected");
        } else {
            for (var i=0; i<t.permaLines.length; i++) {
                var l = t.permaLines[i];
                t.scene.remove (l.line);
                l.geometry.dispose();
                l.material.dispose();
            }
            t.permaLines = [];
            $("#showLines").removeClass("vividButtonSelected").addClass("vividButton");
        }
    }
    
}



export class na3D_demo_models {
    constructor(el, parent, data) {
        var t = this;
        t.p = parent;
        t.el = el;
        t.t = $(t.el).attr("theme");
        
        t.data = data;
        
        t.lights = [];
        t.folders = [];
   
        t.items = [];
        

        t.scene = new THREE.Scene();
        t.camera = new THREE.PerspectiveCamera( 75, $(el).width() / $(el).height(), 0.1, 1000 );
        

        t.renderer = new THREE.WebGLRenderer({alpha:true, antialias : true});
        t.renderer.physicallyCorrectLights = true;
        t.renderer.outputEncoding = sRGBEncoding;
        t.renderer.setPixelRatio (window.devicePixelRatio);
        t.renderer.setSize( $(el).width()-20, $(el).height()-20 );
        
        t.renderer.toneMappingExposure = 1.0;
        
        el.appendChild( t.renderer.domElement );
        
        t.controls = new OrbitControls( t.camera, t.renderer.domElement );
        //t.controls.listenToKeyEvents( window ); // optional
        
        t.loader = new GLTFLoader();
        
        t.loader.load( "/NicerAppWebOS/3rd-party/3D/models/human armor/scene.gltf", function ( gltf ) {
            gltf.scene.position.x = -150;
            gltf.scene.scale.setScalar (10);
            t.cube = gltf.scene;
            t.scene.add (t.cube);
            
            t.updateTextureEncoding(t, t.cube);
        }, function ( xhr ) {
            console.log( "model 'human armor' : " + ( xhr.loaded / xhr.total * 100 ) + "% loaded" );
        }, function ( error ) {
            console.error( error );
        } );
        t.loader.load( "/NicerAppWebOS/3rd-party/3D/models/photoCamera/scene.gltf", function ( gltf ) {
            gltf.scene.position.x = 200;
            t.cube2 = gltf.scene;
            t.scene.add (t.cube2);
            
            t.updateTextureEncoding(t, t.cube2);
            
        }, function ( xhr ) {
            console.log( "model 'photoCamera' : " + ( xhr.loaded / xhr.total * 100 ) + "% loaded" );
        }, function ( error ) {
            console.error( error );
        } );
        
        const light1  = new AmbientLight(0xFFFFFF, 0.3);
        light1.name = "ambient_light";
        light1.intensity = 0.3;
        light1.color = 0xFFFFFF;
        t.camera.add( t.light1 );
        t.camera.add( t.light2 );

        const light2  = new DirectionalLight(0xFFFFFF, 0.8 * Math.PI);
        light2.position.set(0.5, 0, 0.866); // ~60º
        light2.name = "main_light";
        light2.intensity = 0.8 * Math.PI;
        light2.color = 0xFFFFFF;
        //t.camera.add( light2 );

        t.lights.push(light1, light2);
        
        t.pmremGenerator = new PMREMGenerator( t.renderer );
        t.pmremGenerator.compileEquirectangularShader();
        
        t.updateEnvironment(this);
        
        el.addEventListener("mousemove", function() { t.onMouseMove (event, t) });
        el.addEventListener("pointerup", function() { t.onPointerUp (event, t) });

        t.raycaster = new THREE.Raycaster();
        t.mouse = new THREE.Vector2();
        t.mouse.x = 0;
        t.mouse.y = 0;

        //t.animate(this);
    }
    
    /*
    animate(t) {
        requestAnimationFrame( function() { t.st) } );
        
        t.raycaster.setFromCamera (t.mouse, t.camera);

        const intersects = t.raycaster.intersectObjects (t.scene.children, true);
        if (intersects[0] && t.cube && t.cube2) {
            t.cube.rotation.x += 0.015;
            t.cube.rotation.y += 0.02;
            t.cube2.rotation.x += 0.015;
            t.cube2.rotation.y += 0.02;
            //t.cube2.rotation.y += 0.02;
        }
        
        t.renderer.render( t.scene, t.camera );
    }*/
    
    
    updateTextureEncoding (t, content) {
        /*const encoding = t.state.textureEncoding === "sRGB"
        ? sRGBEncoding
        : LinearEncoding;*/
        const encoding = sRGBEncoding;
        t.traverseMaterials(content, (material) => {
            if (material.map) material.map.encoding = encoding;
            if (material.emissiveMap) material.emissiveMap.encoding = encoding;
            if (material.map || material.emissiveMap) material.needsUpdate = true;
        });
    }
    
    traverseMaterials (object, callback) {
        object.traverse((node) => {
            if (!node.isMesh) return;
            const materials = Array.isArray(node.material)
                ? node.material
                : [node.material];
            materials.forEach(callback);
        });
    }
    
    updateEnvironment (t) {

        const environment = {
            id: "venice-sunset",
            name: "Venice Sunset",
            path: "/NicerAppWebOS/3rd-party/3D/assets/environment/venice_sunset_1k.hdr",
            format: ".hdr"
        };
        /*
        const environment = {
            id: "footprint-court",
            name: "Footprint Court (HDR Labs)",
            path: "/NicerAppWebOS/3rd-party/3D/assets/environment/footprint_court_2k.hdr",
            format: ".hdr"
        }*/

        t.getCubeMapTexture( environment ).then(( { envMap } ) => {

            /*
            if (!envMap || !t.state.background) && t.activeCamera === t.defaultCamera) {
                t.scene.add(t.vignette);
            } else {
                t.scene.remove(t.vignette);
            }*/
            t.scene.add(t.vignette);

            t.scene.environment = envMap;
            //t.scene.background = envMap;//t.state.background ? envMap : null;

        });

    }    
    
    getCubeMapTexture ( environment ) {
        const { path } = environment;

        // no envmap
        if ( ! path ) return Promise.resolve( { envMap: null } );

        return new Promise( ( resolve, reject ) => {
            new RGBELoader()
                //.setDataType( UnsignedByteType )
                .load( path, ( texture ) => {

                    const envMap = t.pmremGenerator.fromEquirectangular( texture ).texture;
                    t.pmremGenerator.dispose();

                    resolve( { envMap } );

                }, undefined, reject );
        });
    }

    
    onMouseMove(event, t) {
        if (!t.renderer || !t.renderer.domElement) return;

        const rect = t.renderer.domElement.getBoundingClientRect();

        // Correct normalized coordinates (this was sometimes broken)
        t.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        t.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        t.mouse.layerX = event.layerX;
        t.mouse.layerY = event.layerY;
        t.mouse.clientX = event.clientX;
        t.mouse.clientY = event.clientY;
        t.mouse.event = event;
        t.evt = event;

        // THIS IS THE CRITICAL LINE that was missing after refactor
        t.camera.updateMatrixWorld(true);
        t.raycaster.setFromCamera(t.mouse, t.camera);
        const intersects = t.raycaster.intersectObjects(t.s2);

        console.log('Intersects:', intersects.length, intersects[0] ? intersects[0].object.it?.name : null);
    }
    
    onMouseWheel( event, t ) {
        debugger;
    }
}

na3D_fileBrowser.prototype.history = {
    stack: [],
    redoStack: [],
    maxSize: 50
};

na3D_fileBrowser.prototype.pushHistory = function(state) {
    this.history.stack.push(JSON.parse(JSON.stringify(state))); // deep clone
    if (this.history.stack.length > this.history.maxSize) this.history.stack.shift();
    this.history.redoStack = []; // clear redo on new action
};

na3D_fileBrowser.prototype.undo = function() {
    if (this.history.stack.length === 0) return;

    const currentState = this.history.stack.pop();
    this.history.redoStack.push(currentState);

    const previousState = this.history.stack[this.history.stack.length - 1];
    if (previousState) this.restoreState(previousState);
};

na3D_fileBrowser.prototype.redo = function() {
    if (this.history.redoStack.length === 0) return;

    const state = this.history.redoStack.pop();
    this.history.stack.push(state);
    this.restoreState(state);
};

na3D_fileBrowser.prototype.restoreState = function(state) {
    // Restore camera position, selected nodes, current folder, graph data, etc.
    // Example:
    this.graph.cameraPosition(state.cameraPos);
    // ... other restorations
};

// Keyboard handler
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
            na.apps.loaded.threed_fileExplorer.redo();
        } else {
            na.apps.loaded.threed_fileExplorer.undo();
        }
    }
});





export class na3D_demo_cube {
    constructor(el,parent) {
        t.p = parent;
        t.el = el;
        t.t = $(t.el).attr("theme");
        
        t.scene = new THREE.Scene();
        t.camera = new THREE.PerspectiveCamera( 75, $(el).width() / $(el).height(), 0.1, 1000 );

        t.renderer = new THREE.WebGLRenderer({ alpha : true });
        t.renderer.setSize( $(el).width()-20, $(el).height()-20 );
        el.appendChild( t.renderer.domElement );
        
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        var materials = [
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("/siteMedia/backgrounds/tiled/blue/4a065201509c0fc50e7341ce04cf7902--twitter-backgrounds-blue-backgrounds.jpg")
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("/siteMedia/backgrounds/tiled/blue/blue170.jpg")
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("/siteMedia/backgrounds/tiled/blue/abstract_water_texture-seamless.jpg")
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("/siteMedia/backgrounds/tiled/orange/467781133_4f4354223e.jpg")
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("/siteMedia/backgrounds/tiled/green/dgren051.jpg")
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("/siteMedia/backgrounds/tiled/green/leaves007.jpg")
            })
        ];
        t.cube = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 1 ), materials );
        t.scene.add( t.cube );
        var t = this;
        $(el).bind("mousemove", function() { t.onMouseMove (event, t) });
        
        t.raycaster = new THREE.Raycaster();
        t.mouse = new THREE.Vector2();

        t.camera.position.z = 5;
        t.cube.rotation.x = 0.3;
        t.cube.rotation.y = 0.4;
        t.animate(this);
    }
    
    onMouseMove( event, t ) {
        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        //t.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        //t.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        var rect = t.renderer.domElement.getBoundingClientRect();
        t.mouse.x = ( ( event.clientX - rect.left ) / ( rect.width - rect.left ) ) * 2 - 1;
        t.mouse.y = - ( ( event.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1;        
        t.raycaster.setFromCamera(t.mouse, t.camera);
    }
    

    /*
    animate(t) {
        requestAnimationFrame( function() { t.animate (t) } );
        //t.cube.rotation.x += 0.02;
        //t.cube.rotation.y += 0.02;
        t.raycaster.setFromCamera (t.mouse, t.camera);
        const intersects = t.raycaster.intersectObjects (t.scene.children, true);
        for (var i=0; i<intersects.length; i++) {
            intersects[i].object.rotation.x += 0.02;
            intersects[i].object.rotation.y += 0.02;
        }
        t.renderer.render( t.scene, t.camera );
    }*/
}

