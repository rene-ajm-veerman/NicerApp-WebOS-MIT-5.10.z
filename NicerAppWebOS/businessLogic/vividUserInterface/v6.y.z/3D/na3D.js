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
        var t = this;
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

        /*
         *        na.m.waitForCondition ('na3D.js : t.itemsInitialized?', function () {
            return t.itemsInitialized;
        }, function () {
            na.apps.loaded.threed_fileExplorer = t;
            debugger;
            t.graph = ForceGraph3D({
                rendererConfig: { antialias: true, alpha: true }
            })(t.el)

            .backgroundColor('rgba(0,0,0,0.3)')   // ← changed for visibility
            .width(t.el.clientWidth || 1000)
            .height(t.el.clientHeight || 700)
            .dagMode('radialout')
            .nodeId('id')           // ← tell the library which field is the ID
            .linkSource('source')
            .linkTarget('target')
            .graphData(t.forcegraph3d_data)   // { nodes: [...], links: [...] }

            .nodeLabel(null)
            .nodeOpacity(0.9)
            .linkOpacity(0.1)
            .linkColor('#FFF')
            .nodeColor(n => {
                const ancestors = t.getAllAncestors(n);
                const descendants = t.getAllDescendants(t, n);
                const highlightedNodes = new Set([...ancestors, ...descendants, n.id || n]);
                const defaultColor = 'rgba(255,255,255,0.55)';

                const sourceAncestors = t.getAllAncestors(n);
                if (sourceAncestors.size===0) return defaultColor;
                var sourceDepth = t.items[Array.from(sourceAncestors)[sourceAncestors.size-1]].level ?? 0;
                sourceDepth = Math.round(sourceDepth / 2) + 1;

                const targetAncestors = t.getAllAncestors(n);
                if (targetAncestors.size===0) return defaultColor;
                var targetDepth = t.items[Array.from(targetAncestors)[targetAncestors.size-1]].level ?? 0;
                targetDepth = Math.round(targetDepth / 2) + 1;

                const isAncestorLink =  ancestors.has(n.id);
                const isDescendantLink = descendants.has(n.id);


                if (isAncestorLink) {
                    return t.getHierarchicalColor(t,sourceDepth);
                }
                // Direct children
                if (isDescendantLink) {
                    return t.getHierarchicalColor(t,targetDepth);
                }

                return defaultColor;

            })
            .warmupTicks(100)
            .cooldownTicks(0)

            // === Custom Nodes & Links ===
            .nodeThreeObjectExtend(true)
            .nodeThreeObject(node => {
                const text = node.name;//`${node.item.filepath}/${pp}/${node.name}`;
                const sprite = new SpriteText(text);
                node.sprite = sprite;
                sprite.color = 'rgba(255,255,255,0.7)';
                sprite.textHeight = 5;
                sprite.fontFace = 'Arial';
                sprite.position.set(0, 18, 0);

                // Optional: make sure it renders in front
                sprite.material.depthWrite = false;
                sprite.material.depthTest = false;

                t.graph.scene().add(sprite);
                return sprite;

            })

            // Custom Link Labels
            .linkThreeObjectExtend(false)
            .linkThreeObject(null)
            // === INTERACTIONS ===
            .onNodeHover(node => {
                t.currentHoverNode = node;

                // Remove old hover label
                if (t.hoverLabel) {
                    t.graph.scene().remove(t.hoverLabel);
                };

                if (node) {
                    // Big hover label
                    node.sprite.visibile = false;

                    const text = (node.item?.filepath || '') + '/' + node.name;
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

                    // Get all nodes to highlight
                    const ancestors = t.getAllAncestors(node);
                    const descendants = t.getAllDescendants(t, node);
                    const highlightedNodes = new Set([...ancestors, ...descendants, node.id || node]);

                    t.graph
                    .nodeColor(n => {
                    if (n === node) return '#ffff44';                    // hovered node

                    var depth = n.item?.level ?? n.depth ?? 0;
                    depth = depth / 2 + 1;
                    if (highlightedNodes.has(n.id || n)) return t.getHierarchicalColor(t,depth);
                    return 'rgba(150,150,150,0.5)';

                    })
                    .linkColor(link => {
                        const defaultColor = 'rgba(255,255,255,0.2)'
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
                else {
                    // Reset when hover ends
                    t.graph.nodeColor(n => {
                        n.sprite.visibile = true;
                        var depth = n.item?.level ?? n.depth ?? 0;
                        depth = depth / 2 + 1;
                        return t.getHierarchicalColor(t,depth);
                    });

                    t.graph.linkColor(() => '#555555')
                    .linkOpacity(0.35)
                    .linkWidth(1.2);


                }
            })

            .onNodeClick(node => {
                if (!node) return;
                console.log('Clicked node:', node.name);

                // Camera focus
                const distance = 180;
                const distRatio = 1 + distance / Math.hypot(node.x||0, node.y||0, node.z||0);

                t.graph.cameraPosition(
                    {
                        x: (node.x||0) * distRatio,
                                        y: (node.y||0) * distRatio,
                                        z: (node.z||0) * distRatio
                    },
                    node,
                    1600
                );

                // Your existing file listing logic
                if (typeof t.onclick_node === 'function') {
                    t.onclick_node(t, node);
                }
            })

            .nodeRelSize(7)
            .numDimensions(3);

            t.graph.d3Force('charge').strength(-130);
            t.graph.d3Force('link').distance(link => 90 + Math.random() * 150);
            // t.graph
            // .d3Force('charge').strength(null);   // stronger repulsion
        });
        */

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
            if (cit.data.files) var f = cit.data.files.sort(); else var f = cit.parent.data.folders[n].files.sort();
            for (var i=0; i<f.length; i++) {
                var file = f[i];
                if (file.match(/\.mp3$/)) {
                    var
                    path = cit.filepath
                        .replace(/\/0\/filesAtRoot\/folders/, "")
                        .replace(/\/folders/g,"")
                        .replace(/\/\//g,'/')
                        .replace(/\'/g, '\\'),
                    file2 = file
                        .replace(/\-[\-\w]+\.mp3/, ".mp3")
                        .replace('.mp3', '');

                    html += '<div id="'+t.fid+'_'+j+'" class="vividButton" style="position:relative; font-size:small;" filepath="'+path+'/'+file+'"><a href="javascript:na.threeD.play($(\'#'+t.fid+'_'+j+'\'), \''+na.m.encodeUnicodePath(path+'/'+n+'/'+file.replace(/\'/g, '\\\''))+'\')"><span>'+path+'/'+n+'/'+file2+'</span></a></div>';
                    j++;
                }
            };
            t.fid++;
            $("#fileListing").html(html).delay(50);
            na.site.startUIvisuals('fileListing');
            done = true;
        }
    }

    async initializeItems_old_withoutProgressbar (t) {
        var p = { t : t, ld2 : {} };
        t.s2 = [];
        na.m.walkArray (t.data[0]['filesAtRoot'], t.data[0]['filesAtRoot'], t.initializeItems_walkKey, t.initializeItems_walkValue, false, p);
        t.itemsInitialized = true;

        var innerWidth = $("#siteContent .vividDialogContent").width();
        var innerHeight = $("#siteContent .vividDialogContent").height();// - $("#header").position().top - $("#header").height();
        t.renderer.setSize(innerWidth, innerHeight);
    }
    async initializeItems(t) {
        var p = { t: t, ld2: {} };
        t.s2 = [];

        t._progressCallback(10, "Walking file tree...");

        // Walk the array with progress
        na.m.walkArray(
            t.data[0]['filesAtRoot'],
            t.data[0]['filesAtRoot'],
            t.initializeItems_walkKey,
            t.initializeItems_walkValue,
            false,
            p
        );

        t._progressCallback(45, "Building graph data...");

        // This can be heavy for large trees
        t.forcegraph3d_data = await t.itemsToGraphData(t);

        t._progressCallback(75, "Creating progressive 3D visualization...");
        //await t.createProgressiveGraph(t);
        await t.createGraph(t)

        // Let the browser breathe before heavy ForceGraph creation
        t.itemsInitialized = true;
        await new Promise(r => setTimeout(r, 50));


        // ... rest of your existing code (renderer size etc.)
        var innerWidth = $("#siteContent .vividDialogContent").width();
        var innerHeight = $("#siteContent .vividDialogContent").height();
        t.renderer.setSize(innerWidth, innerHeight);

        t._progressCallback(100, "Done!");

        // Hide progress bar after a short delay
        setTimeout(() => {
            const progressContainer = document.getElementById('na3D_progress');
            if (progressContainer) progressContainer.style.display = 'none';
        }, 800);
    }

    initializeItems_walkKey (cd) {
        var ps = cd.path.split("/");
        if (ps[ps.length-1]=="files") {
            //console.log ("initializeItems_walkKey", "files", cd);
        } else if (ps[ps.length-1]=="folders") {

            var path = cd.path.replace(/\/folders/g, '');
            if (path.substr(0,1)!=='/') path = '/'+path;

            var
            lastParent = cd.params.t.items[0],
            pk = cd.path.replace(/\/folders/g,'');
            if (!cd.params.ld2[pk]) cd.params.ld2[pk] = { levelIdx : 0 };
            var modded = false;
            cd.params.idxPath2 = '';
            for (var i=0; i<cd.params.t.items.length; i++) {
                var it2 = cd.params.t.items[i];
                if (it2.filepath+"/"+(it2 && it2.name!==parseInt(it2.name) ? it2.name : it2.data) === pk) {
                    lastParent = it2;
                    cd.params.idxPath2  = it2.idxPath;
                    modded = true;
                    //debugger;
                }
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
            function () { return na.d.s.animating === false && t.resizing === false; },
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

        na.m.waitForCondition("onresize_do_phase2()", function() {
            /*
            for (var i=0; i<t.ld4.length; i++) {
                if (!t.ld3[t.ld4[i]].colorList) return false;
            };
            */
            //var r = t.items.length > 2;// && !t.started && !t.started4;
            //debugger;
            return t.itemsInitialized;
        }, function() {
            //debugger;
            na.m.log (1555, fncn+' : END coloring');
            t.onresize_do_phase2 (t, callback);
        }, 25);

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

        /*
        const container = t.el;
        if (!container) return;

        const data = t.forcegraph3d_data;
        if (!data?.nodes?.length) return;

        // === STRICT FILTER ===
        // Clean broken links
        const iterator = data.nodes.keys();//(n && n.item && n.item.parent ? n.item.parent.idx : n.id)));
        const nodeIds2 = [];
        for (var key in data.nodes) {
            nodeIds2.push (data.nodes[key].id);
        }
        const nodeIds = new Set(nodeIds2);//(n && n.item && n.item.parent ? n.item.parent.idx : n.id)));
        const validLinks = data.links.filter(link => {
            const src = link.source?.id ?? link.source;
            const tgt = link.target?.id ?? link.target;
            const r = (
                nodeIds.has(src) && nodeIds.has(tgt)
            ) || (
              nodeIds2[tgt] == src
            );
            //if (r) debugger;
            return r;
        });
        debugger;
        */

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


        // Pre-cache depth + color on each node
        data.nodes.forEach(node => {
            const ancestors = t.getAllAncestors(node.item);
            const deepest = Array.from(ancestors)[ancestors.size - 1];
            node._depth = Math.round((t.items[deepest]?.level ?? 0) / 2) + 1;
            node._color = t.getHierarchicalColor(t, node._depth);
        });

        // Pre-build child map for fast descendant lookup
        // Build parent->children map and nodeMap (same as before)
        const childMap = new Map();
        const parentMap = new Map();
        validLinks.forEach(link => {
            const src = typeof link.source === 'object' ? link.source.id : link.source;
            const tgt = typeof link.target === 'object' ? link.target.id : link.target;
            if (!childMap.has(src)) childMap.set(src, []);
            childMap.get(src).push(tgt);
            parentMap.set(tgt, src);
        });

        const nodeMap = new Map(data.nodes.map(n => [n.id, n]));

        // Find root
        const targetIds = new Set(validLinks.map(l => typeof l.target === 'object' ? l.target.id : l.target));
        const rootNode = data.nodes.find(n => !targetIds.has(n.id));
        const rootId = rootNode?.id ?? 0;

        const root = nodeMap.get(rootId);
        if (root) { root.x = 0; root.y = 0; root.z = 0; }

        // Give root children initial directions using Fibonacci sphere
        const rootChildren = childMap.get(rootId) || [];
        rootChildren.forEach((childId, i) => {
            const node = nodeMap.get(childId);
            if (!node) return;
            const goldenRatio = (1 + Math.sqrt(5)) / 2;
            const phi   = Math.acos(1 - 2 * (i + 0.5) / rootChildren.length);
            const theta = 2 * Math.PI * i / goldenRatio;
            // Store direction vector on node for children to inherit
            node._dir = {
                x: Math.sin(phi) * Math.cos(theta),
                             y: Math.sin(phi) * Math.sin(theta),
                             z: Math.cos(phi)
            };
            const r = 400;
            node.x = r * node._dir.x;
            node.y = r * node._dir.y;
            node.z = r * node._dir.z;
        });

        // BFS outward — each node's children spread in a small sphere
        // around the parent's outward direction point
        const levelStep = 500;      // how far each level steps outward — tune this
        const siblingSpread = 100;  // radius of sibling sphere around direction point — tune this

        const visited = new Set([rootId]);
        let queue = rootChildren.slice();
        queue.forEach(id => visited.add(id));

        while (queue.length > 0) {
            const nextQueue = [];

            queue.forEach(parentId => {
                const parentNode = nodeMap.get(parentId);
                if (!parentNode) return;

                const children = (childMap.get(parentId) || []).filter(id => !visited.has(id));
                if (children.length === 0) return;

                // Parent's outward direction (normalised)
                const dir = parentNode._dir || { x: 0, y: 1, z: 0 };
                const len = Math.sqrt(dir.x**2 + dir.y**2 + dir.z**2) || 1;
                const nd = { x: dir.x/len, y: dir.y/len, z: dir.z/len };

                // Centre point for this group of siblings — one step further out
                const cx = parentNode.x + nd.x * levelStep;
                const cy = parentNode.y + nd.y * levelStep;
                const cz = parentNode.z + nd.z * levelStep;

                // Distribute siblings in a Fibonacci sphere around that centre point
                children.forEach((childId, i) => {
                    const node = nodeMap.get(childId);
                    if (!node) return;

                    visited.add(childId);
                    nextQueue.push(childId);

                    const count = children.length;
                    const goldenRatio = (1 + Math.sqrt(5)) / 2;
                    const phi   = count > 1 ? Math.acos(1 - 2 * (i + 0.5) / count) : 0;
                    const theta = 2 * Math.PI * i / goldenRatio;

                    // Spread radius shrinks slightly with more siblings so clusters stay tight
                    const spread = Math.min(siblingSpread, siblingSpread * Math.sqrt(10 / Math.max(count, 10)));

                    const ox = spread * Math.sin(phi) * Math.cos(theta);
                    const oy = spread * Math.sin(phi) * Math.sin(theta);
                    const oz = spread * Math.cos(phi);

                    node.x = cx + ox;
                    node.y = cy + oy;
                    node.z = cz + oz;

                    // Inherit parent's direction so grandchildren continue outward
                    node._dir = { x: nd.x + ox * 0.01, y: nd.y + oy * 0.01, z: nd.z + oz * 0.01 };
                });
            });

            queue = nextQueue;
        }

        t.graph = ForceGraph3D();
        t.graph(container);  // mount to DOM immediately

        t.graph
        .backgroundColor('rgba(0,0,0,0.22)')   // ← changed for visibility
        .width(t.el.clientWidth || 1000)
        .height(t.el.clientHeight || 700)
        .dagMode('radialout')
        .nodeId('id')           // ← tell the library which field is the ID
        .linkSource('source')
        .linkTarget('target')
        //.graphData({nodes : data.nodes, links : validLinks})   // { nodes: [...], links: [...] }
        .graphData({ nodes: [], links: [] })

        .nodeLabel(null)
        .nodeOpacity(0.4)
        .linkOpacity(0.3)
        .linkColor('#FFF')
        .warmupTicks(2)
        .cooldownTicks(2)
        .nodeId('id')
        .linkSource('source')
        .linkTarget('target')
        .nodeLabel('data')
        .linkWidth(2)
        .linkColor(() => 'rgba(180, 220, 255, 0.6)')
        .nodeColor(n => {
            const depth = (n.item?.level ?? 0) / 2 + 1;
            return t.getHierarchicalColor(t, depth);
        })
        .nodeRelSize(10)           // slightly bigger nodes so they don't get lost
        .d3AlphaDecay(0.5)        // slower cooling = more final spread
        // === Custom Nodes & Links ===
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

            if (node) {
                // Big hover label
                //node.sprite.visibile = false;

                //debugger;
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
                    const defaultColor = 'rgba(255,255,255,0.7)'
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
            else {
                // Reset when hover ends
                t.graph.nodeColor(n => {
                    var depth = n?.item?.level ?? n.item.level ?? 0;
                    depth = depth / 2 + 1;
                    return t.getHierarchicalColor(t,depth);
                });

            }
        })

        .onNodeClick(node => {
            if (!node) return;

            const distance = 180;
            const nodeDistance = Math.hypot(node.x || 0, node.y || 0, node.z || 0);

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

            if (typeof t.onclick_node === 'function') t.onclick_node(t, node);
        })

        .numDimensions(3);

        // === BATCH LOADING ===
        const batchSize = 333;          // tune to taste
        const sorted = [...data.nodes.sort((a,b)=>{return b.level - a.level;})]; // preserve original order, or sort if you want
        let j = 0;

        /*
        const loadBatch = () => {
            const end = Math.min(j + batchSize, data.nodes.length);
            const currentNodes = sorted.slice(0, end);

            // Only include links where both endpoints are already loaded
            const loadedIds = new Set(currentNodes.map(n => n.id));
            const currentLinks = validLinks.filter(link => {
                const src = typeof link.source === 'object' ? link.source.id : link.source;
                const tgt = typeof link.target === 'object' ? link.target.id : link.target;
                return loadedIds.has(src) && loadedIds.has(tgt);
            });

            t.graph.graphData({ nodes: currentNodes, links: currentLinks });

            t._progressCallback?.(
                75 + Math.round((end / data.nodes.length) * 24),
                                  `Loading graph: ${end} / ${data.nodes.length} nodes`
            );

            j = end;

            if (j < data.nodes.length) {
                setTimeout(loadBatch, 16);   // ~30fps cadence, tune down for faster load
            } else {
                t._progressCallback?.(100, 'Done!');
                setTimeout(() => {
                    t.graph.d3Force('charge').strength(-4000);
                    t.graph.d3Force('link').distance(800);
                    t.graph.zoomToFit(1200, 1000);
                }, 1600);
            }
        };
        */
        const loadedIds = new Set();
        const loadBatch = () => {
            const end = Math.min(j + batchSize, data.nodes.length);
            sorted.slice(j, end).forEach(n => loadedIds.add(n.id));  // incremental, not rebuilt

            const currentNodes = sorted.slice(0, end);
            const currentLinks = validLinks.filter(link => {
                const src = typeof link.source === 'object' ? link.source.id : link.source;
                const tgt = typeof link.target === 'object' ? link.target.id : link.target;
                return loadedIds.has(src) && loadedIds.has(tgt);
            });
            t.graph.pauseAnimation();



            // Find any links referencing ids not in nodes
            const nodeIdSet = new Set(data.nodes.map(n => n.id));
            const phantomSources = new Set();
            const phantomTargets = new Set();
            data.links.forEach(link => {
                if (!nodeIdSet.has(link.source)) phantomSources.add(link.source);
                if (!nodeIdSet.has(link.target)) phantomTargets.add(link.target);
            });
                console.log('Phantom source ids (not in nodes):', [...phantomSources].slice(0, 20));
                console.log('Phantom target ids (not in nodes):', [...phantomTargets].slice(0, 20));
                console.log('Total bad links:', phantomSources.size + phantomTargets.size);





            t.graph.graphData({ nodes: currentNodes, links: currentLinks });

            t._progressCallback?.(
                75 + Math.round((end / data.nodes.length) * 24),
                                  `Loading graph: ${end} / ${data.nodes.length} nodes`
            );

            j = end;

            if (j < data.nodes.length) {
                setTimeout(loadBatch, 50);   // no delay needed since we're not animating
            } else {
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

                const levelRadius = 400;  // distance per level — tune this

                // BFS: collect nodes level by level
                const levels = [];
                const visited = new Set();
                let currentLevel = [rootId];
                visited.add(rootId);

                while (currentLevel.length > 0) {
                    levels.push(currentLevel);
                    const nextLevel = [];
                    currentLevel.forEach(id => {
                        (childMap.get(id) || []).forEach(childId => {
                            if (!visited.has(childId)) {
                                visited.add(childId);
                                nextLevel.push(childId);
                            }
                        });
                    });
                    currentLevel = nextLevel;
                }

                // Position root at origin
                const root = nodeMap.get(rootId);
                if (root) { root.x = 0; root.y = 0; root.z = 0; }

                // For each subsequent level, distribute nodes on a sphere shell
                // using Fibonacci sphere for even 3D spread
                levels.forEach((levelNodes, levelIdx) => {
                    if (levelIdx === 0) return;

                    const count = levelNodes.length;

                    // Scale radius to node count — denser levels get bigger shells
                    // minRadius ensures even single nodes aren't at the origin
                    const minRadius = levelIdx * 50;   // minimum spacing between levels
                    const r = Math.max(minRadius, Math.sqrt(count) * 40);  // tune the 80

                    levelNodes.forEach((nodeId, i) => {
                        const node = nodeMap.get(nodeId);
                        if (!node) return;

                        const goldenRatio = (1 + Math.sqrt(5)) / 2;
                        const phi   = Math.acos(1 - 2 * (i + 0.5) / count);
                        const theta = 2 * Math.PI * i / goldenRatio;

                        node.x = r * Math.sin(phi) * Math.cos(theta);
                        node.y = r * Math.sin(phi) * Math.sin(theta);
                        node.z = r * Math.cos(phi);
                    });
                });

                t.setupFlightControls(t);
                t.graph.resumeAnimation();

                setTimeout(() => {
                    t.graph.d3Force('charge').strength(-2000);
                    t.graph.d3Force('link').distance(500);
                    t.graph.zoomToFit(3300, 5000);
                    t._progressCallback?.(100, 'Done!');
                }, 100);
            }
        };

        loadBatch();   // kick off
    }


    setupFlightControls(t) {
        const container = t.el;
        let flyInterval = null;
        let mouseButton = null;
        let holdTimer = null;
        const HOLD_THRESHOLD = 300;  // ms before long-click activates
        const FLY_SPEED = 80;        // units per tick — tune this

        const getForwardVector = () => {
            const camera = t.graph.camera();
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
                t.graph.cameraPosition({
                    x: pos.x + delta.x,
                    y: pos.y + delta.y,
                    z: pos.z + delta.z
                });
            }, 16);  // ~60fps
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
            const camera = t.graph.camera();
            const forward = getForwardVector();
            const speed = Math.abs(e.deltaY) * 1.5;  // tune sensitivity
            const delta = forward.multiplyScalar(speed * direction);
            const pos = t.graph.cameraPosition();
            t.graph.cameraPosition({
                x: pos.x + delta.x,
                y: pos.y + delta.y,
                z: pos.z + delta.z
            });
        }, { passive: false });

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

