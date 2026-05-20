/*--- LICENSE : https://opensource.org/licenses/MIT
----- Copyright 2020-2026 by Rene AJM Veerman (rene.veerman.netherlands@gmail.com) and https://grok.com
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

        //na.d.s.visibleDivs.push ("#siteToolbarLeft");
        //na.d.s.visibleDivs.push ("#siteToolbarRight");
        //na.desktop.resize();

        var it = {
            id : na.m.randomString(),
            name : "music",
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
            id : na.m.randomString(),
            type : "naFolder",
            text : "music",
            parent : "#",
            idx : 0,
            idxPath : "/0",
            state : { opened : true }
        };
        t.items.push (it);
        t.itemsFolders.push (fit);


        var sideLength = t.meshLength, length = sideLength, width = sideLength;
        var
        materials2 = [
            new THREE.MeshBasicMaterial({
                color : it.color ? it.color : "rgb(0,0,255)",
                opacity : 0.5,
                wireframe : t.wireframe,
                transparent : true
            }),
            new THREE.MeshBasicMaterial({
                color : it.color ? it.color : "rgb(0,0,255)",
                opacity : 0.5,
                wireframe : t.wireframe,
                transparent : true
            }),
            new THREE.MeshBasicMaterial({
                color : it.color ? it.color : "rgb(0,0,255)",
                opacity : 0.5,
                wireframe : t.wireframe,
                transparent : true
            }),
            new THREE.MeshBasicMaterial({
                color : it.color ? it.color : "rgb(0,0,255)",
                opacity : 0.5,
                wireframe : t.wireframe,
                transparent : true
            }),
            new THREE.MeshBasicMaterial({
                color : it.color ? it.color : "rgb(0,0,255)",
                opacity : 0.5,
                wireframe : t.wireframe,
                transparent : true
            }),
            new THREE.MeshBasicMaterial({
                color : it.color ? it.color : "rgb(0,0,255)",
                opacity : 0.5,
                wireframe : t.wireframe,
                transparent : true
            })

        ];
        var cube = new THREE.Mesh( new THREE.BoxGeometry( t.meshLength, t.meshLength, t.meshLength ), materials2 );
        it.model = cube;
        
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

        t.forcegraph3d_data = t.d = t.itemsToGraphData(t);
        na.apps.loaded.threed_fileExplorer = t;
        t.graph = ForceGraph3D({
            rendererConfig: { antialias: true, alpha: true }
        })(t.el)

        .backgroundColor('rgba(0,0,0,0.3)')   // ← changed for visibility
        .width(t.el.clientWidth || 1000)
        .height(t.el.clientHeight || 700)
        .dagMode('radialout')
        .graphData(t.forcegraph3d_data)   // { nodes: [...], links: [...] }
        //.forceEngine('ngraph')

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
                return t.getHierarchicalColor(sourceDepth);
            }
            // Direct children
            if (isDescendantLink) {
                return t.getHierarchicalColor(targetDepth);
            }

            return defaultColor;

        })
        .warmupTicks(500)      // or more
        .cooldownTicks(0)

        // === Custom Nodes & Links ===
        .nodeThreeObjectExtend(true)
        .linkThreeObjectExtend(true)

        // Custom Link Labels
        .linkThreeObject(link => {
            const targetItem = t.items[parseInt(link.target)];
            if (!targetItem) return false;

            const text = targetItem ? targetItem.filepath + '/' + targetItem.name : link.target;
            const sprite = new SpriteText(text);
            sprite.color = '#aaaaaa';
            sprite.textHeight = 2.8;
            sprite.fontFace = 'Arial';
            return sprite;
        })

        // === INTERACTIONS ===
        .onNodeHover(node => {
            t.currentHoverNode = node;

            // Remove old hover label
            if (t.hoverLabel) {
                t.graph.scene().remove(t.hoverLabel);
            }

            if (node) {
                // Big hover label
                const text = (node.item?.filepath || '') + '/' + node.name;
                t.hoverLabel = new SpriteText(text);
                t.hoverLabel.color = '#ffff88';
                t.hoverLabel.textHeight = 4.8;
                t.hoverLabel.fontFace = 'Arial';
                t.hoverLabel.fontWeight = 'bold';
                t.hoverLabel.position.set(node.x, node.y + 18, node.z);
                t.graph.scene().add(t.hoverLabel);

                // Get all nodes to highlight
                const ancestors = t.getAllAncestors(node);
                const descendants = t.getAllDescendants(t, node);
                const highlightedNodes = new Set([...ancestors, ...descendants, node.id || node]);

                t.graph
                .nodeColor(n => {
                   if (n === node) return '#ffff44';                    // hovered node

                   var depth = n.item?.level ?? n.depth ?? 0;
                   depth = depth / 2 + 1;
                   if (highlightedNodes.has(n.id || n)) return t.getHierarchicalColor(depth);
                   return '#aaffff'; // connected nodes

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
                        return t.getHierarchicalColor(sourceDepth);
                    }
                    // Direct children
                    if (isDescendantLink) {
                        return t.getHierarchicalColor(targetDepth);
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
                });
            }
            else {
                // Reset when hover ends
                t.graph.nodeColor(n => {
                    var depth = n.item?.level ?? n.depth ?? 0;
                    depth = depth / 2 + 1;
                    return t.getHierarchicalColor(depth);
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

        .onBackgroundClick(() => {
            t.graph.nodeColor(null); // reset highlights
        })
        .dagLevelDistance(200)           // ← Increase spacing between hierarchy levels
        .nodeRelSize(7)
        //.forceEngine('ngraph')           // often better for >1k nodes
        .numDimensions(3)

        // t.graph
        // .d3Force('charge').strength(null);   // stronger repulsion

    }

    onclick_node (t, node) {
        var cit = node, done = false, p = cit.item.parent, pp = cit.item.name+'/';

        while (p && p.name!=='music') {
            pp += p.name+'/';
            p = p.parent;
        };

        while (cit && !done) {
            var html = "", j = 0;
            for (var i=0; i<cit.item.data.files.length; i++) {
                var file = cit.item.data.files[i];
                if (file.match(/\.mp3$/)) {
                    var
                    path = cit.item.filepath.replace(/\/0\/filesAtRoot\/folders/, "").replace(/\/folders/g,""),
                    file2 = file.replace(/\-[\-\w]+\.mp3/, ".mp3");
                    html += '<div id="'+t.fid+'_'+j+'" class="vividButton" style="position:relative; font-size:small;" filepath="'+path+'/'+file+'"><a href="javascript:na.threeD.play($(\'#'+t.fid+'_'+j+'\'), \''+path+'/'+node.item.name+'/'+file2+'\')"><span>'+file2+'</span></a></div>';
                    j++;
                }
            };
            t.fid++;
            $("#fileListing").html(html).delay(50);
            na.site.startUIvisuals('fileListing');
            done = true;
        }
    }

    async initializeItems (t) {
        var p = { t : t, ld2 : {} };
        t.s2 = [];
        na.m.walkArray (t.data[0]['filesAtRoot'], t.data[0]['filesAtRoot'], t.initializeItems_walkKey, t.initializeItems_walkValue, false, p);
        t.itemsInitialized = true;

        var innerWidth = $("#siteContent .vividDialogContent").width();
        var innerHeight = $("#siteContent .vividDialogContent").height();// - $("#header").position().top - $("#header").height();
        t.renderer.setSize(innerWidth, innerHeight);
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
                if (it2.filepath+"/"+it2.name === pk) {
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
                //console.log ("t779", it.filepath + "/" + it.name, it);
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
            if (cd.params.t.showFiles && it.data.files)
            for (var fkey in it.data.files) {
                //if (fkey.match(/\.mp3$/)) {
                    var p = null;

                    /*var ps2 = $.extend([],ps);
                    delete ps2[ps2.length-1];
                    var ps2Str = ps2.join("/");
                    var parent = it.parent;//na.m.chaseToPath (cd.root, ps2Str+"/files/"+fkey, false);*/
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
        }
        //debugger;
    }
    initializeItems_walkValue (cd) {
        //console.log ("initializeItems_walkValue", "cd", cd);
    }

    initializeFolderList (t, data) {
        var p = { t : t, ld2 : {}, data2 : t.itemsFolders };
        na.m.walkArray (data, data, t.initializeFolderView_walkKey, null, false, p);
        t.initializeFolderView (t, p.data2);
    }

    initializeFolderView_walkKey (cd) {
        var ps = cd.path.split("/");
        if (ps[ps.length-1]=="files") {
            //console.log ("initializeItems_walkKey", "files", cd);
        } else if (ps[ps.length-1]=="folders") {
            var
            lastParent = cd.params.t.itemsFolders[0],
            pk = cd.path;
            if (!cd.params.ld2[pk]) cd.params.ld2[pk] = { levelIdx : 0 };
            for (var i=0; i<cd.params.t.itemsFolders.length; i++) {
                var it2 = cd.params.t.itemsFolders[i];
                if (it2.filepath+"/"+it2.name+"/folders" === cd.path) {
                    lastParent = it2;
                }
            }


            //debugger;
            if (cd.level <= 4) {
                cd.params.idxPath = "/0";// + cd.params.t.itemsFolders.length;
            } else {
                var
                il1 = (cd.level - 4) / 2,
                il2 = cd.params.idxPath.split("/"),
                il3 = null,
                j = il2.length;

                for (var i=0; i<j; i++) {
                    if (parseInt(il2[i])===lastParent.idx) il3 = lastParent.idx;
                    if (typeof il3=="number") il2.pop();
                }

                cd.params.idxPath = il2.join("/") + "/" + lastParent.idx;
                cd.params.idxPath2 = cd.params.idxPath;
            };
            //debugger;
            var fit = {
                type : "naFolder",
                id : na.m.randomString(),
                parent : lastParent.id,
                text : cd.k,
                idx : cd.params.t.itemsFolders.length - 1,
                idxPath : cd.params.idxPath
            };

            if (!cd.params.t.fd3) cd.params.t.fd3 = {};
            if (!cd.params.t.fd3[fit.idxPath]) cd.params.t.fd3[fit.idxPath] = { itemCount : 0, itemsFolders : [] };
            cd.params.t.fd3[fit.idxPath].itemCount++;
            cd.params.t.fd3[fit.idxPath].itemsFolders.push (fit);
            //cd.params.idxPath2 = cd.params.idxPath + "/" + it1a.idx;
            cd.params.t.itemsFolders.push (fit);

            cd.params.data2.push (fit);
        }
    }
    
    initializeFolderView(t, foldersListForJStree) {
        var fv = $(".naFoldersList");
        if (!fv.is(".jstree"))
            fv.jstree ({
                core : {
                    data : foldersListForJStree,
                    check_callback : true
                },
                types : {
                    "naSystemFolder" : {
                        "icon" : "/siteMedia/na.view.tree.naSystemFolder.png",
                        "valid_children" : []
                    },
                    "naUserRootFolder" : {
                        "max_depth" : 14,
                        "icon" : "/siteMedia/na.view.tree.naUserRootFolder.png",
                        "valid_children" : ["naFolder", "naMediaAlbum", "naDocument"]
                    },
                    "naGroupRootFolder" : {
                        "max_depth" : 14,
                        "icon" : "/siteMedia/na.view.tree.naGroupRootFolder.png",
                        "valid_children" : ["naFolder", "naMediaAlbum", "naDocument"]
                    },
                    "naFolder" : {
                        "icon" : "/siteMedia/na.view.tree.naFolder.png",
                        "valid_children" : ["naFolder", "naMediaAlbum", "naDocument"]
                    },
                    "naDialog" : {
                        "icon" : "/siteMedia/na.view.tree.naSettings.png",
                        "valid_children" : []
                    },
                    "naSettings" : {
                        "icon" : "/siteMedia/na.view.tree.naSettings.png",
                        "valid_children" : []
                    },
                    "naTheme" : {
                        "icon" : "/siteMedia/na.view.tree.naVividThemes.png",
                        "valid_children" : []
                    },
                    "naVividThemes" : {
                        "icon" : "/siteMedia/na.view.tree.naVividThemes.png",
                        "valid_children" : []
                    },
                    "naMediaAlbum" : {
                        "icon" : "/siteMedia/na.view.tree.naMediaAlbum.png",
                        "valid_children" : [ "naMediaAlbum" ]
                    },
                    "naDocument" : {
                        "icon" : "/siteMedia/na.view.tree.naDocument.png",
                        "valid_children" : []
                    },
                    "saApp" : {
                        "icon" : "/siteMedia/na.view.tree.naApp.png",
                        "valid_children" : []
                    }
                },
                plugins : [
                    "contextmenu", "dnd", "search", "state", "types", "wholerow"
                ]
            }).on("ready.jstree", function (e, data) {
                var tree = $(".naFoldersList").jstree(true);
                for (var i=0; i<tree.settings.core.data.length; i++) {
                    var it = tree.settings.core.data[i];
                    if (it.state && it.state.selected) tree.select_node(it._id);
                }
            }).on("open_node.jstree", function (e, data) {
                na.cms.onchange_folderStatus_openOrClosed(e, data);

            }).on("close_node.jstree", function (e, data) {
                na.cms.onchange_folderStatus_openOrClosed(e, data);

            }).on("rename_node.jstree", function (e, data) {
                na.cms.onchange_rename_node(e, data);

            }).on("changed.jstree", function (e, data) {

                if (
                    //data.action!=="ready"
                    //&&
                    /*data.action!=="model"
                    && */data.action!=="select_node"
                ) return false;

                $("#siteContent .vividTabPage").fadeOut("fast");
                clearTimeout(na.cms.settings.timeout_changed);
                na.cms.settings.timeout_changed = setTimeout (function(data) {
                    var l = data.selected.length, rec = null;
                    for (var i=0; i<l; i++) {
                        var d = data.selected[i], rec2 = data.instance.get_node(d);
                        if (rec2 && rec1.original) rec = rec2;
                    }

                    if (
                        na.cms.settings.current.selectedTreeNode
                        && rec
                        && na.cms.settings.current.selectedTreeNode.id!==rec.id
                        && na.cms.settings.current.selectedTreeNode.type=="naDocument"
                    ) na.cms.saveEditorContent(na.cms.settings.current.selectedTreeNode, function(){
                        na.cms.settings.current.selectedTreeNode = rec;
                        //na.cms.onchange_selectedNode (settings, data, rec, function() {
                            //na.cms.refresh(function() {
                        //      na.cms.onchange_jsTreeNode(settings, data,rec);
                            //});
                        //});
                    })
                    else if (rec) na.cms.onchange_jsTreeNode(settings, data, rec);

                    if (rec && rec.type=="naDocument") $("#document").fadeIn("slow");
                    if (rec && rec.type=="naMediaAlbum") $("#upload").fadeIn("slow");
                    if (
                        rec
                        && (
                            rec.type=="naDocument"
                            || rec.type=="naMediaAlbum"
                        )
                    ) {
                        if ($(window).width() < 400) {
                            na.cms.settings.current.activeDialog = "#siteContent";
                            arrayRemove(na.desktop.settings.visibleDivs, "#siteToolbarLeft");
                            arrayRemove(na.desktop.settings.visibleDivs, "#siteContent");
                            na.desktop.settings.visibleDivs.push("#siteContent");
                            na.desktop.resize();
                        } else {
                            na.cms.settings.current.activeDialog = "#siteContent";
                            arrayRemove(na.desktop.settings.visibleDivs, "#siteToolbarLeft");
                            arrayRemove(na.desktop.settings.visibleDivs, "#siteContent");
                            na.desktop.settings.visibleDivs.push("#siteToolbarLeft");
                            na.desktop.settings.visibleDivs.push("#siteContent");
                            na.desktop.resize();
                        };
                    }

                    na.site.settings.buttons["#btnAddUser"].disable();
                    na.site.settings.buttons["#btnAddGroup"].disable();
                    na.site.settings.buttons["#btnAddFolder"].disable();
                    na.site.settings.buttons["#btnAddDocument"].disable();
                    na.site.settings.buttons["#btnAddMediaAlbum"].disable();
                    na.site.settings.buttons["#btnDeleteRecord"].disable();

                    if (rec && rec.type=="naSystemFolder" && rec.text=="Users")
                        na.site.settings.buttons["#btnAddUser"].enable();


                    if (rec && rec.type=="naSystemFolder" && rec.text=="Groups")
                        na.site.settings.buttons["#btnAddGroup"].enable();


                    if (rec &&
                        (
                            rec.type=="naUserRootFolder"
                            || rec.type=="naGroupRootFolder"
                            || rec.type=="naFolder"
                        )
                    ) na.site.settings.buttons["#btnAddFolder"].enable();


                    if (rec &&
                        (
                            rec.type=="naFolder"
                        )
                    ) {
                        na.site.settings.buttons["#btnAddDocument"].enable();
                        na.site.settings.buttons["#btnAddMediaAlbum"].enable();
                    }

                    if (rec &&
                        (
                            rec.type=="naFolder"
                            || rec.type=="naDocument"
                            || rec.type=="naMediaAlbum"
                        )
                    ) na.site.settings.buttons["#btnDeleteRecord"].enable();
                }, 500, data);

                //clearTimeout (na.cms.settings.current.timeoutRefresh);
                //na.cms.settings.current.timeoutRefresh = setTimeout(na.cms.refresh,1000);

            }).on("move_node.jstree", function (e, data) {

                var
                tree = $("#jsTree").jstree(true),
                oldPath = na.cms.currentPath(tree.get_node(data.old_parent)),
                newPath = na.cms.currentPath(tree.get_node(data.parent)),
                url2 = "/NicerAppWebOS/apps/NicerAppWebOS/content-management-systems/NicerAppWebOS/cmsManager/ajax_moveNode.php",
                ac = {
                    type : "POST",
                    url : url2,
                    data : {
                        database : data.node.original.database,
                        oldParent : data.old_parent,
                        oldPath : oldPath,
                        newParent : data.parent,
                        newPath : newPath,
                        target : data.node.original._id || original.id
                    },
                    success : function (data, ts, xhr) {
                    },
                    error : function (xhr, textStatus, errorThrown) {
                        na.site.ajaxFail(fncn, url2, xhr, textStatus, errorThrown);
                    }
                };
                $.ajax(ac);

            });

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

        na.m.log (1555, fncn+' : BEGIN coloring');
        for (var path in t.ld3) {
            t.ld4.push(path);
        }
        for (var i=0; i<t.ld4.length; i++) {
            var p1 = t.ld4[i].substr(1).split("/");

            //setTimeout (function(p1, i) {
                var colorGradientScheme = {
                    themeName: "naColorgradientScheme_custom__"+p1.join("_"),
                    cssGeneration: {
                        colorTitle : "yellow",
                        colorLegend : "#00BBBB",
                        colorLegendHREF : "#00EEEE",
                        colorStatus : "goldenrod",
                        colorStatusHREF : "yellow",
                        colorLevels: {
                        0: {
                            background: "#7A95FF",
                            color: "rgb("
                                +(50+Math.random()*205)+","
                                +(50+Math.random()*205)+","
                                +(50+Math.random()*205)+")"
                        },
                        100: {
                            background: "white",
                            color: "rgb("
                                +(50+Math.random()*205)+","
                                +(50+Math.random()*205)+","
                                +(50+Math.random()*205)+")"
                        }
                        }
                    },
                    htmlTopLevelTableProps: ' cellspacing="5"',
                    htmlSubLevelTableProps: ' cellspacing="5"',
                    showFooter: true,
                    showArrayKeyValueHeader: false,
                    showArrayStats: true,
                    showArrayPath: true,
                    showArraySiblings: true,
                    jQueryScrollTo: {
                        duration: 900
                    }
                    }

                var list = naCG.generateList_basic (colorGradientScheme, p1.length);
                t.ld3[t.ld4[i]].colorList = list;

                /*t.ld3[t.ld4[i]].color =
                    "rgb("
                        +Math.round(50+Math.random()*205)+","
                        +Math.round(50+Math.random()*205)+","
                        +Math.round(50+Math.random()*205)+")";
                */
                t.ld3[t.ld4[i]].p1 = p1;
                //debugger;
            //}, i + (Math.random() * 200), p1, i);
        }
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

    projectChildrenOnSphere = function(t,parentMesh, childMeshes, radius, offset = 0) {
        const numChildren = childMeshes.length;
        if (numChildren === 0) return;

        const center = parentMesh.position;
        const goldenRatio = (1 + Math.sqrt(5)) / 2;
        const increment = Math.PI * (3 - Math.sqrt(5)); // Golden angle in radians

        childMeshes.forEach((child, i) => {
            // Fibonacci sphere algorithm for uniform distribution
            const y = (i * (2 / numChildren)) - 1 + (1 / numChildren); // from -1 to +1
            const r = Math.sqrt(1 - y * y);
            const phi = (i * increment) % (Math.PI * 2);

            const x = Math.cos(phi) * r;
            const z = Math.sin(phi) * r;

            const direction = new THREE.Vector3(x, y, z).normalize();

            // Position on sphere surface
            child.position.copy(center).add(direction.multiplyScalar(radius));

            // Optional outward offset to avoid clipping
            if (offset > 0) {
                child.position.add(direction.multiplyScalar(offset));
            }

            // Orient child to face radially outward
            const outwardTarget = center.clone().add(direction.multiplyScalar(radius * 2));
            //child.lookAt(outwardTarget);

            // Optional: lock "up" direction to world Y to prevent unwanted roll
            // child.up.set(0, 1, 0);
            // child.lookAt(outwardTarget); // re-apply if using custom up

            // Add as child of parent (or scene.add(child) if you want world space)
            //parentMesh.add(child);
            t.scene.add(child);
        });
    }

    projectHierarchy(t, item, radius, radiusFromParent) {
        const parentMesh = item.model;
        const childrenItems = t.getChildren(item);
        if (childrenItems.length === 0) return;
        if (!radiusFromParent) radiusFromParent = radius * 3;

        const childMeshes = childrenItems.map(it => it.model);

        // Project direct children around this parent (your Fibonacci logic)
        const numChildren = childMeshes.length;
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));

        for (let i = 0; i < numChildren; i++) {
            const phi = Math.acos(1 - 2 * (i + 0.5) / numChildren);
            const theta = goldenAngle * i;

            const x = Math.cos(theta) * Math.sin(phi);
            const y = Math.sin(theta) * Math.sin(phi);
            const z = Math.cos(phi);

            const direction = new THREE.Vector3(x, y, z);
            const center = parentMesh.position.clone();

            const child = childMeshes[i];
            child.position.copy(center).add(direction.multiplyScalar(radius));

            // Orient outward (uncomment if needed)
            // const outwardTarget = center.clone().add(direction.multiplyScalar(radius * 2));
            // child.lookAt(outwardTarget);
        }

        // Recurse: For each child, project ITS children around ITS new position
        const clv = (
            (childrenItems.length/100) > 0.5
            ? (childrenItems.length/100)
            : 0.5
        )
        const childRadius = (radius / 1.5) * clv; // Scale down for sub-levels; adjust factor (e.g., /2 for tighter nesting)
        for (let childItem of childrenItems) {
            t.projectHierarchy(t, childItem, childRadius);
        }
    }

    // Returns all ancestor IDs up to the root
    getAllAncestors (node) {
        if (!node || !node.item?.idxPath) return new Set();

        const ancestors = new Set();
        const path = node.item.idxPath;

        if (typeof path === 'string') {
            const parts = path.substr(1,path.length-2).split('/');
            for (let i = 0; i < parts.length; i++) {
                var current_t_items_N_idx = parseInt(parts[i]);
                ancestors.add(current_t_items_N_idx);           // add partial paths
            }
        }

        // Also add the node itself
        ancestors.add(node.id || node.item?.idx);

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


        /* does not preserve
        background transparency :
            // not a good idea for dense trees :
            const bloomPass = new UnrealBloomPass();
            bloomPass.strength = 2;
            bloomPass.radius = 1;
            bloomPass.threshold = 0;
            Graph.postProcessingComposer().addPass(bloomPass);
            */
            // Instead of three.js EffectComposer + UnrealBloomPass

            // const composer = new EffectComposer(t.renderer);
            // composer.addPass(new RenderPass(t.scene, t.camera));
            //
            // const bloom = new BloomEffect({
            //     intensity: 1.2,           // ≈ strength
            //     luminanceThreshold: 0.9,  // ≈ threshold
            //     luminanceSmoothing: 0.1,
            //     // radius is not directly there, but mipmapBlur + scale approximates it
            //     mipmapBlur: true,
            //     // levels, kernelSize etc. for tuning blur spread
            // });
            // composer.addPass(new EffectPass(t.camera, bloom));

            // const Graph = ForceGraph3D()
            // .backgroundColor('rgba(0,0,0,0)')
            // .nodeLabel('name')
            // .nodeAutoColorBy('id')
            // .enablePointerInteraction(true)
            // .onNodeHover(node => console.log('hover:', node ? node.name : 'none'))
            // .graphData(dat2)(t.el)
            // .onNodeClick(node => {
            //     // Aim at node from outside it
            //     const distance = 100;
            //     const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);
            //
            //     const newPos = node.x || node.y || node.z
            //     ? { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }
            //     : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)
            //
            // Graph.cameraPosition(
            //     newPos, // new position
            //     node, // lookAt ({ x, y, z })
            // 3000  // ms transition duration
            // );
            //
            // node.item.data.files.sort();
            // debugger;
            // let html = '';
            // for (let i=0; i<node.item.data.files.length; i++) {
            //     let it = node.item.data.files[i];
            //     if (it.match(/.mp3$/)) {
            //         let path =
            //         node.item.filepath.replace(/'/g, '\\\'').replace(/#/g,'\\#').replace(/&amp;/g,'&')
            //         +'/'+node.item.name.replace(/'/g, '\\\'').replace(/#/g,'\\#').replace(/&amp;/g,'&')
            //         +'/'+it.replace(/'/g, '\\\'').replace(/#/g,'\\#').replace(/&amp;/g,'&');
            //         html += '<li style="margin-right:10px;"><div id="filesList_'+i+'" class="vividButton" style="position:relative;"><a href="javascript:na.apps.loaded.threed_fileExplorer.play($(\'#filesList_'+i+'\')[0], \''+path+'\')" style="font-size:medium">'+it+'</a></div></li>';
            //     }
            // }
            // $('#fileListing').append(html);
            $('#fileListing, #playlist').css({overflowY:'auto'});
            // $("#playlist li div, #fileListing li div").css({lineHeight:'1em'});
            //
            // na.site.startUIvisuals();
            // $( "#fileListing li" ).draggable({
            //     connectToSortable: "#playlist",
            //     helper: "clone",
            //     revert: "invalid"
            // });
            // $( "#playlist, #playlist li, #fileListing, #fileListing li" ).disableSelection();
            //
            //
            // });;

            /*

        const Graph = ForceGraph3D(t.el, {
            dagMode : 'radialout',
            nodeLabel : 'name',
            nodeAutoColorBy : 'type',
            nodeOpacity : 0.5,
            linkOpacity : 0.3,
            rendererConfig : {
                antialias: true,
                alpha: true
            }
        });
        Graph.graphData(dat2);*/

        t.initialized = true;
        var x = t.items;
        t.onresize_postDo(t, true);
    }

    getHierarchicalColor(depth) {
        const colors = [
            '#4dabf7',   // 0 - root / top level (blue)
            '#51cf66',   // 1 - light green
            '#ffd43b',   // 2 - yellow
            '#ff922b',   // 3 - orange
            '#f06595',   // 4 - pink
            '#9775fa',   // 5 - purple
            '#74c0fc',   // 6
            '#63e6be',
            'lime',
            'cyan',
            'red',
            'white',
            'ivory',
            'grey'
        ];

        var y = Math.min(depth, colors.length - 1);
        var x = colors[y] || '#aaaaaa';
        return x;
        //return colors[Math.min(Math.abs(colors.length/depth), colors.length - 1)] || '#aaaaaa';
    }

    play (btn, relPath) {
        let
        fullPath = '/NicerAppWebOS/apps/NicerAppWebOS/applications/2D/musicPlayer.fancy.latest.2D/music/'+relPath;
        $('#audioTag')[0].src = fullPath;
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
        return this.items.filter(it => it.parent === item && (this.showFiles || !it.name.endsWith('.mp3')));
    }

    itemsToGraphData(t) {
        const nodes = [];
        const links = [];

        // Filter out items you don't want to show (optional)
        const visibleItems = t.items.filter(it =>
            t.showFiles || !it.name.endsWith('.mp3')
        );

        // Create nodes
        visibleItems.forEach(item => {
            nodes.push({
                id: item.idx,                  // Must be unique — your idx is perfect
                name: item.name,
                type: item.name.endsWith('.mp3') ? 'file' : 'folder',
                item: item,                    // Optional: keep reference to original
                // Add any other data you want (color, size, etc.)
                color: item.color || (item.name.endsWith('.mp3') ? '#ff6666' : '#66ccff')
            });

            // Create link if it has a parent
            if (item.parent && item.parent.idx !== undefined) {
                links.push({
                    source: item.parent.idx,   // parent's id
                    target: item.idx           // child's id
                });
            }
        });

        return { nodes, links };
    }

    onresize_do_phase2_OLDnBUGGY(t, callback) {
        let fncn = 'na3D.js::onresize_do_phase2_OLDnBUGGY()';
        na.m.log (1555, fncn+' : BEGIN .pos calculations');

        for (var path in t.ld3) {
            path = path.replace(/\/.*?/,'');
            var ld3 = t.ld3['/'+path];

            // calculate x,y,z as grid positions in the scene,
            // to be translated later in this function into scene coordinates.
            if (path!=="") {
                for (var i=0; i<ld3.items.length; i++) {
                    var
                    it = t.items[ld3.items[i].idx];

                    ld3.rowColumnCount = Math.floor(Math.sqrt(ld3.itemCount));
                    ld3.cubeSideLengthCount = Math.floor(Math.cbrt(ld3.itemCount));
                    ld3.rowColumnCount = Math.floor(Math.sqrt(ld3.cubeSideLengthCount));

                    var
                    pos = { x : 0, xField : 0, y : 0, yField : 0, z : 0 },

                    // 2D view
                    columnField = 0,
                    rowField = 0,

                    // 3D view
                    column = 0,
                    row = 0,
                    depth = 0;

                    //if (it.filepath=="siteMedia/backgrounds/tiled/active") debugger;
                    for (var j=0; j<ld3.items.length; j++) {
                        var it2 = t.items[ld3.items[j].idx];
                        if (
                            (it.parent ? it.parent.idx === it2.parent.idx : false)
                            && it2.levelIdx <= it.levelIdx
                        ) {
                            if (
                                column >= ld3.cubeSideLengthCount
                                && row >= ld3.cubeSideLengthCount
                            ) {
                                pos.z++;
                                depth++;

                                column = 0;
                                row = 0;
                            } else if (row >= ld3.cubeSideLengthCount) {
                                pos.z++;
                                depth++;

                                column = 0;
                                row = 0;

                                pos.y = 0;
                                pos.x++;
                            } else if (column >= ld3.cubeSideLengthCount) {
                                pos.y++;
                                pos.x = 0;
                                row++;
                                column = 0;
                            } else {
                                column++;
                                pos.x++;
                            }

                            if (columnField >= ld3.cubeSideLengthCount) {
                                pos.yField++;
                                pos.xField = 0;
                                rowField++;
                                columnField = 0;
                            } else {
                                columnField++;
                                pos.xField++;
                            }

                        }

                    };

                    // do NOT move this finalized code...
                    it.rowField = rowField;
                    it.columnField = columnField;
                    it.row = row;
                    it.column = column;
                    it.depth = depth;
                    it.pos = pos;
                    it.ld3 = ld3;
                    //console.log ('t334', it.filepath.replace('/0/filesAtRoot/folders','').replace(/\/folders/g,'')+'/'+it.name, columnField, rowField, column, row, depth, pos);
                    //if (it.name=="gull" || it.name=="owl") debugger;
                }
            }
            //debugger;
        }
        na.m.log (1555, fncn+' : END .pos calculations');

        var
        its = $.extend( [], t.items ),
        its2 = [],
        compare = function (a, b) {
            return a.parent-b.parent;
        },
        compare1 = function (a, b) {
            if (a.it && b.it) {
                return a.it.level-b.it.level;
            } else return 0;
        };

        its.sort (compare1);


        var
        maxLevel = 0;

        na.m.log (1555, fncn+' : BEGIN scene items position calculations');
        for (var i=0; i<its.length; i++) {
            if (!t.showFiles && its[i].name.substr(its[i].name.length-4,4)=='.mp3') continue;
            if (maxLevel < its[i].level) maxLevel = its[i].level;
            for (var j=0; j<its.length; j++) {

                var
                name = "",
                parent = t.hovered || t.items[0];

                while (parent) {
                    //$("#site3D_label")[0].textContent =
                    //  t.hovered.object.it.name.replace(/-\s*[\w]+\.mp3/, ".mp3");
                    /*
                    var li =
                        parent.object.it.filepath
                            .replace("/0/filesAtRoot/folders/","")
                            .replace("/0/filesAtRoot/folders","");
                    if (li!=="") li+= "/";
                    li += parent.object.it.name.replace(/\s*-\s*[-_\w]+\.mp3$/,".mp3")
                    //l += " ("+parent.object.it.parent.rndz+")";
                    li = li.replace(/folders\//g, "");
                    */
                    var li = its[i].filepath + '/' + its[i].name;

                    /*
                    var lj =
                        its[j].filepath
                            .replace("/0/filesAtRoot/folders/","")
                            .replace("/0/filesAtRoot/folders","");
                    if (lj!=="") lj+= "/";
                    lj += its[j].name.replace(/\s*\-\s*[-_\w]+\.mp3$/,".mp3");
                    //l += " ("+parent.object.it.parent.rndz+")";
                    lj = lj.replace(/folders\//g, "");
                    */
                    var lj = its[j].filepath + '/' + its[j].name;

                    parent = parent.parent;
                }

                if (
                    //its[i].idxPath+"/"+its[i].idx === its[j].idxPath+"/"+its[j].idx
                    //its[i].idxPath === its[j].idxPath
                    //its[i].filepath === its[j].filepath
                    //&& its[i].name === its[j].name
                    /*
                    its[i].pos.x === its[j].pos.x
                    && its[i].pos.y === its[j].pos.y
                    && its[i].pos.z === its[j].pos.z*/
                    li === lj
                ) {
                    //console.log ('t780', li);
                    var
                    ita = {
                        level: its[i].level,
                        maxColumn : Math.max( its[i].columnField, its[j].columnField ),
                        maxRow : Math.max( its[i].rowField, its[j].rowField ),
                        maxDepth : Math.max ( its[i].depth, its[j].depth )
                    };
                    if (ita.maxColumn === its[i].columnField) ita.maxColumnIt = its[i]; else ita.maxColumnIt = its[j];
                    if (ita.maxRow === its[i].rowField) ita.maxRowIt = its[i]; else ita.maxRowIt = its[j];
                    if (ita.maxDepth === its[i].depth) ita.maxDepthIt = its[i]; else ita.maxDepthIt = its[j];
                    its[i].ita = ita;
                    its[j].ita = ita;
                    break;
                    /*
                    its[i].maxColumnIta = ita;
                    its[i].maxRowIta = ita;
                    its[i].maxDepthIta = ita;
                    its[j].maxColumnIta = ita;
                    its[j].maxRowIta = ita;
                    its[j].maxDepthIta = ita;
                    */
                    //if (!its2.includes(ita)) its2.push (ita);
                }
                if (its[i].ita) continue;
            }
        }
        na.m.log (1555, fncn+' : END scene items position calculations');

        var
        /*
        compare2 = function (a,b) {
            var x = b.maxColumn - a.maxColumn;
            if (x === 0) return b.maxRow - a.maxRow; else return x;
        },
        compare3 = function(a,b) {
            return a.name < b.name;
        },
        */
        its2 = its;

        // calculate directional offset values
        // from cube/sphere XYZ grouping field
        var pp = null;
        var pox = {}, poy = {}, poz = {}, pd = {};
        var prevIt = null;
        //if (t.initialized) //EVUL

        na.m.log (1555, fncn+' : Do final position calculations for '+t.items.length+' scene items.');
        debugger;
        var r = 1.0;
        for (var i=0; i<t.items.length; i++) {
            if (!t.showFiles && t.items[i].name.substr(t.items[i].name.length-4,4)=='.mp3') continue;

            var
            offsetXY = 200,
            it = t.items[i],
            p = (it.parent ? it.parent : null);
            //p1 = (it.parent && it.parent.parent ? it.parent.parent : null),

            //rndMax = (it.ld3 ? (it.ld3.rowColumnCount * 1000) : 0);
            //rndMax = (p && p.ld3 ? (p.ld3.cubeSideLengthCount * 1000) : 0);

            /*
             * /*if (!prevMax)* / var prevMax = rndMax;

            r = .75 + Math.random()/4;
            //var r = Math.random();
            //while (r < .75) r = Math.random();
            if (p && !pox[p.idx]) pox[p.idx] = Math.abs(r * prevMax);

            r = .75 + Math.random()/4;
            //r = Math.random();
            //while (r < .75) r = Math.random();
            if (p && !poy[p.idx]) poy[p.idx] = Math.abs(r * prevMax);

            r = .75 + Math.random()/4;
            //while (r < .75) r = Math.random();
            if (p && !poz[p.idx]) poz[p.idx] = Math.abs(r * prevMax);

            //if (p && !pox[p.idx]) pox[p.idx] = it.level * p.columnOffsetValue;
            //if (p && !poy[p.idx]) poy[p.idx] = it.level * p.rowOffsetValue;
            //if (p && !poz[p.idx]) poz[p.idx] = it.level * 1000;

            if (p) var rndx = pox[p.idx]; else var rndx = 0;
            if (p) var rndy = poy[p.idx]; else var rndy = 0;
            if (p) var rndz = poz[p.idx]; else var rndz = 0;
            it.rndx = rndx;
            it.rndy = rndy;
            it.rndz = rndz;
            */

            /*if (p) {
                var
                itmaxc = it.maxColumnIta.maxColumn,
                itmaxr = it.maxRowIta.maxRow,
                itmaxd = it.maxRowIta.maxDepth,
                itmaxc2 = Math.floor(itmaxc/2),
                itmaxr2 = Math.floor(itmaxr/2),
                itLeftRight = /*p.leftRight * * /(
                    it.column-1 == itmaxc / 2
                    ? 0
                    : itmaxc===1
                        ? 0
                        : itmaxc - it.column == it.column -1
                            ? 0
                            : itmaxc - it.column < it.column - 1
                                ? 1
                                : -1
                            ),
                itUpDown = /*p.upDown * * /(
                    it.row-1 == itmaxr/2
                    ? 0
                    : itmaxr===1
                        ? 0
                        : itmaxr - it.row == it.row - 1
                            ? 0
                            : itmaxr - it.row < it.row - 1
                                ? 1
                                : -1
                            ),
                itBackForth = /*p.backForth * * /(
                    it.depth-1 == itmaxd/2
                    ? 0
                    : itmaxd===1
                        ? 0
                        : itmaxd - it.depth == it.depth - 1
                            ? 0
                            : itmaxr - it.depth < it.depth - 1
                                ? 1
                                : -1
                            ),
                itc = (itmaxc - 1 - it.columnField),
                itr = (itmaxr - 1 - it.rowField),
                itd = (itmaxd - 1 - it.depth);
                it.columnOffsetValue = itc;//Math.floor(itc);
                it.rowOffsetValue = itr;//Math.floor(itr);
                it.depthOffsetValue = itd;//Math.floor(itr);
                it.leftRight = itLeftRight;
                it.upDown = itUpDown;
                it.backForth = itBackForth;

            } else {*/
                var
                itmaxc = it.ita.maxColumn,
                itmaxr = it.ita.maxRow,
                itmaxd = it.ita.maxDepth,
                itLeftRight = (
                    it.column-1 == itmaxc / 2
                    ? 0
                    : itmaxc===1
                        ? 0
                        : itmaxc - it.column == it.column -1
                            ? 0
                            : itmaxc - it.column < it.column - 1
                                ? 1
                                : -1
                            ),
                itUpDown = (
                    it.row-1 == itmaxr/2
                    ? 0
                    : itmaxr===1
                        ? 0
                        : itmaxr - it.row == it.row - 1
                            ? 0
                            : itmaxr - it.row < it.row - 1
                                ? 1
                                : -1
                            ),
                itBackForth = (
                    it.depth-1 == itmaxd/2
                    ? 0
                    : itmaxd===1
                        ? 0
                        : itmaxd - it.depth == it.depth - 1
                            ? 0
                            : itmaxr - it.depth < it.depth - 1
                                ? 1
                                : -1
                            ),
                itc = (itmaxc - 1 - it.columnField),
                itr = (itmaxr - 1 - it.rowField),
                itd = (itmaxd - 1 - it.depth);

                it.columnOffsetValue = itc;//Math.floor(itc);
                it.rowOffsetValue = itr;//Math.floor(itr);
                it.depthOffsetValue = itd;//Math.floor(itr);
                it.leftRight = itLeftRight;
                it.upDown = itUpDown;
                it.backForth = itBackForth;
                //if (it.name=="landscape") debugger;
            //};



            /*
            var
            z = (it.level/4) * 1000,//(it.level < 2 ? 1 : it.level-2) * 200 / 2,
            //z = -1 * it.depthOffsetValue * 2500,
            //plc = p.columnOffsetValue === 0 ? 0.01 : p.columnOffsetValue,
            //plr = p.rowOffsetValue === 0 ? 0.01 : p.rowOffsetValue,
            m = 10 * 1000,
            ilc = (p?p.columnOffsetValue * m:it.column*m), //it.leftRight * it.column,// * p.columnOffsetValue,
            ilr = (p?p.rowOffsetValue * m:it.column*m),//it.upDown * it.row,// * p.rowOffsetValue,

            min = 2, m0 = (it.level-2) < 5 ? it.level-2 : 4, m1 = 500, m2 = 500, m1a = 500, m2a =  500, m3a = 500, m3b = 500, m3c = 1000, m3d = 2500, n = 0.5, n1 = 500, n2 = 500, o = 1, s = 1,
            u = 1 * (p && p.leftRight===0?ilc:(p?p.leftRight:it.leftRight)),
            v = 1,
            w = 1 * (p && p.upDown===0?ilr:(p?p.upDown:it.upDown)),
            x = 1,
            u2 = (p?p.columnOffsetValue:it.columnOffsetValue),
            v2 = (p?p.rowOffsetValue:it.rowOffsetValue),
            w2 = (p?p.depthOffsetValue:it.depthOffsetValue),
            u2a = it.column,
            v2a = it.row,
            w2a = it.depth,
            divider = 1;
            if (it.name.match(/delinquentes/i)) debugger;
            */
            let divider = 1;

            /*
            if (p) {
                u = p.leftRight;
                w = p.upDown;
                u2 = -1 * p.columnOffsetValue;
                v2 = -1 * p.rowOffsetValue;
                w2 = -1 * p.depthOffsetValue;
                u2 = p.columnField;
                v2 = p.rowField;
                w2 = p.depth;
            }
*/

            if (!it.sPos) it.sPos = {};

//if (it.name.match(/becoming insane/i)) debugger;
            //if (it.model) {
                if (p) {
                    if (!t.ld3[p.idxPath]) t.ld3[p.idxPath] = {};
                    if (!t.ld3[p.idxPath].level) t.ld3[p.idxPath].level = 1;
                    var
                    radius = 20,
                    m = p.levelIdx - (p.row * (ld3.cubeSideLengthCount) - p.column);
                    if (m<1) m=1;

                    p.c1 = {
                        a : 0,
                        b : (360 / m) //* (p.levelIdx+1)
                    };
                    p.c1.c = jsem.math.xy.pointOnCircle_angleInDegrees (0,0,radius,p.c1.b);

                    p.c2 = {
                        a : 0,
                        b : (360 / t.ld3[it.idxPath].itemCount - m) //* (it.levelIdx+1)
                    };
                    p.c2.c = jsem.math.xy.pointOnCircle_angleInDegrees (0, 0, radius, p.c2.b);
                }


                if (!mx) var mx = 1;
                if (!my) var my = 1;
                if (!mz) var mz = 1;
                var
                mpx = 800, mpy = 800, mpz = 800,
                mrx = 15, mry = 15, mrz = 15,
                msx = 400, msy = 400, msz = 400;
                //if (!rx)
                    var rx = 1;
                //if (!ry)
                    var ry = 1;
                //if (!rz)
                    var rz = 1;
                if (!prx) var prx = rx;
                if (!pry) var pry = ry;
                if (!prz) var prz = rz;
                if (!px) var px = 0;
                if (!py) var py = 0;
                if (!pz) var pz = 0;
                if (!rax) var rax = 0;
                if (!ray) var ray = 0;
                if (!raz) var raz = 0;

                if (it.name=='gregorian') debugger;
                if (it.name=='gregoriano') debugger;
                /*if (it && it.parent && it.parent.px) {
                    px = it.parent.px;
                    py = it.parent.py;
                    pz = it.parent.pz;
                } else */if (it && it.parent && !it.parent.px && p/*&& prevIt && prevIt.parent && it.parent.idx!==prevIt.parent.idx*/) {
                    px = p.sPos.x
                        //+ (p.column*mpx*p.c1.c.x)
                        + (p.level * mpx);
                    py = p.sPos.y
                        //+ (p.row*mpy*p.c1.c.y)
                        + (p.level * mpy);
                    pz = p.sPos.z
                        //+ (p.depth*mpz*p.c2.c.y)
                        + (p.level * mpz);

                    it.parent.px = px;
                    it.parent.py = py;
                    it.parent.pz = pz;
                    /*rx += 2 * mrx * c1.c.x;
                    ry += 2 * mry * c1.c.y;
                    rz += 2 * mrz * c1.c.y;*/
                    rx += p.c1.c.x;
                    ry += p.c1.c.y;
                    rz += p.c2.c.y;

                    rax = 2* mpx * Math.random();
                    ray = 2 * mpy * Math.random();
                    raz = 2 * mpz * Math.random();


                } else if (it && it.parent){
                    px = it.parent.px || px;
                    py = it.parent.py || py;
                    pz = it.parent.pz || pz;

                    it.parent.px = px;
                    it.parent.py = py;
                    it.parent.pz = pz;

                    px = it.parent.rax || rax;
                    py = it.parent.ray || ray;
                    pz = it.parent.raz || raz;

                    rx += p.c1.c.x;
                    ry += p.c1.c.y;
                    rz += p.c2.c.y;

                    it.parent.rax = rax;
                    it.parent.ray = ray;
                    it.parent.raz = raz;
                };


                prevIt = it;
                mx = 1; my = 1; mz = 1;
                var mplier = 1.5;





                // calculate folders' and files' x,y,z position in the scene
                /*if (!t.showFiles || it.name.substr(it.name.length-4,4)=='.mp3') {
                } else*/ if (it.model && p) {
                    it.sPos.x = //Math.round( (
                        mx * (
                            px
                            + (p.column * mpx * mplier)
                            //+ ( (it.level+1) * rx )
                            + (it.level+1) * 5 * rx
                            //+ rx
                            //+ rax
                            //+ (p.column * p.c1.c.x)
                            //+ -1 * (Math.sin(it.column) * Math.cos(it.row) * it.depth)
                            //+ -1 * (Math.sin(it.column) * it.depth)
                            //+ (mpx * c1.c.x)
                            //+ mpx
                            + (it.column * msx)
                            //+ (it.columnOffsetValue * mpx)
                        )

                    //) / divider);
                    it.sPos.y = // Math.round( (
                        my * (
                            py
                            + (p.row * mpy * mplier)
                            //+ ( (it.level+1) * ry)
                            + (it.level+1) * 5 * ry
                            //+ ry
                            //+ ray
                            //+ (p.row * p.c1.c.y)
                            //+ Math.cos(it.column) * Math.cos(it.row) * it.depth
                            //+ Math.cos(it.row) * it.depth
                            //+ (mpy * c1.c.y)
                            //+ mpy
                            + (it.row * msy)
                            //+ (it.rowOffsetValue * mpy)
                        )
                    //) / divider);
                    it.sPos.z = // Math.round( (
                        mz * (
                            pz
                            + ( p.depth * mpz * mplier)
                            //+ ( (it.level+1) * rz )
                            + (it.level+1) * 5 * rz
                            //+ rz
                            //+ raz
                            //+ Math.cos(it.column) * Math.sin(it.row) * it.depth
                            //+ (it.level * mpz)
                            //+ msz
                            //+ (mpz * c1.c.y)
                            + (it.depth * msz)
                            //+ (it.depthOffsetValue * mpz)
                        )
                    //) / divider;
                        if (it.name=='Garbage') debugger;
                        if (it.name=='') debugger;

                    //console.log (fncn+' : adding mesh : ', it.filepath + "/" + it.name, it.column, it.row, it.depth, it.sPos, p.sPos);

                } else if (it.model) {
                    /*
                    it.sPos.x = it.columnOffsetValue * mpx;
                    it.sPos.y = it.rowOffsetValue * mpy;
                    it.sPos.z = it.depthOffsetValue * mpz;

                    it.sPos.x = it.column * mpx * c1.c.x;
                    it.sPos.y = it.row * mpy * c1.c.y;
                    it.sPos.z = it.depth * mpz * c1.c.z;
                    */

                    it.sPos.x = it.column * mpx;
                    it.sPos.y = it.row * mpy;
                    it.sPos.z = it.depth * mpz;

                }
                if (false) {
                    it.sPos.x = Math.abs(it.sPos.x);
                    it.sPos.y = Math.abs(it.sPos.y);
                    it.sPos.z = Math.abs(it.sPos.z);
                }
        //    }

            if (it.model) {
                var dbg = {
                    x : it.sPos.x,
                    y : it.sPos.y,
                    z : it.sPos.z,
                    p : p,
                    it : it
                };
                console.log ('onresize_do_phase2() : '+it.filepath+'/'+it.name, dbg);
            }

        }

        var
        sideLength = 300,
        length = sideLength,
        width = sideLength,
        shape = new THREE.Shape();
        shape.moveTo( 0,0 );
        shape.lineTo( 0, width );
        shape.lineTo( length, width );
        shape.lineTo( length, 0 );
        shape.lineTo( 0, 0 );

        var extrudeSettings = {
        steps: 40,
        depth: sideLength,
        bevelEnabled: true,
        bevelThickness: 40,
        bevelSize: 40,
        bevelOffset: 0,
        bevelSegments: 40
        };

        na.m.log (1555, fncn+' : Add scene items to scene.');
        for (var j=0; j<t.items.length; j++) {
            var p7a = t.items[j].idxPath;

            if (false) {
                var p7b = p7a.substr(1).split("/");
                p7b.pop();
                var p7a1 = '/'+p7b.join('/');
                if (p7a1==='/') p7a1 = p7a;
            } else {
                var p7a1 = p7a;
            }

            if (t.ld3 && t.ld3[p7a1]) {
                var
                color = t.ld3[p7a1].color,
                list = t.ld3[p7a1].colorList,
                p1 = t.ld3[p7a1].p1,
                it = t.items[j];
                if (it && !it.name.match(/\/.mp3$/)) {
                    //if (it.name.match(/SABATON/)) debugger;
                    if (color) it.color = color; else {
                        if (it.parent && it.parent) {
                            for (var k=0; k<list.length; k++) {
                                if (p1[k]==it.parent.idx) {
                                    it.color = list[k].color;
                                }
                            }
                        }
                        if (!it.color && list) {
                            for (var k=0; k<list.length; k++) {
                                if (p1[k]==it.idx)
                                    it.color = list[k].color;
                            }
                        }
                        if (!it.color) {
                            it.color = "rgb(0,0,255)";
                        }
                    }

                    //console.log ("t321", it.name, it.color);

                    var sideLength = 300, length = sideLength, width = sideLength, oc = 0.555;
                    var
                    materials2 = [
                        new THREE.MeshBasicMaterial({
                            color : it.color ? it.color : "rgb(0,0,255)",
                            opacity : oc,
                            wireframe : t.wireframe,
                            transparent : true
                        }),
                        new THREE.MeshBasicMaterial({
                            color : it.color ? it.color : "rgb(0,0,255)",
                            opacity : oc,
                            wireframe : t.wireframe,
                            transparent : true
                        }),
                        new THREE.MeshBasicMaterial({
                            color : it.color ? it.color : "rgb(0,0,255)",
                            opacity : oc,
                            wireframe : t.wireframe,
                            transparent : true
                        }),
                        new THREE.MeshBasicMaterial({
                            color : it.color ? it.color : "rgb(0,0,255)",
                            opacity : oc,
                            wireframe : t.wireframe,
                            transparent : true
                        }),
                        new THREE.MeshBasicMaterial({
                            color : it.color ? it.color : "rgb(0,0,255)",
                            opacity : oc,
                            wireframe : t.wireframe,
                            transparent : true
                        }),
                        new THREE.MeshBasicMaterial({
                            color : it.color ? it.color : "rgb(0,0,255)",
                            opacity : oc,
                            wireframe : t.wireframe,
                            transparent : true
                        })

                    ];
                    if (it.parent) {
                        // parent/current folder :
                        if (it.name.substr(it.name.length-4,4)=='.mp3') {
                            if (t.showFiles)
                            var cube = t.createSphere (t.meshLength * 3, it.color);
                        } else {
                            var cube = new THREE.Mesh( new THREE.BoxGeometry( t.meshLength, t.meshLength, t.meshLength ), materials2 );
                        }
                        if (it.sPos)
                        if (!t.showFiles || it.name.substr(it.name.length-4,4)!=='.mp3') {
                            cube.it = it;
                            cube.position.x = it.sPos.x;
                            cube.position.y = it.sPos.y;
                            cube.position.z = it.sPos.z;
                            t.scene.remove(it.model);
                            //if (it.name.match("SABATON")) debugger;
                            it.model = cube;
                            t.scene.add( cube );
                            //t.items.push (it);
                        }
                        t.s2.push(cube);
                    } else {
                        var cube = new THREE.Mesh( new THREE.BoxGeometry( t.meshLength, t.meshLength, t.meshLength ), materials2 );
                        cube.it = it;
                        cube.position.x = it.sPos.x;
                        cube.position.y = it.sPos.y;
                        cube.position.z = it.sPos.z;
                        it.model = cube;
                        t.scene.add( cube );
                        t.s2.push(cube);
                    }
                }
            }
        }

        // Assuming the na3D instance is accessible (often on window or via na. namespace)
        const threeInst = t;/* find your instance, e.g. na3D_instance or similar */;
        debugger;
        if (threeInst) {
            const canvas = threeInst.renderer.domElement;
            $(canvas).off('mousemove click'); // remove old bindings

            $(canvas).on('mousemove', function(e) {
                threeInst.onMouseMove(e, threeInst);
                console.log('mousemove captured');
            });

            $(canvas).on('click', function(e) {
                console.log('click captured, detail:', e.detail);
                threeInst.onclick(threeInst, e);
            });

            console.log('Re-bound events. t.s2 length:', threeInst.s2 ? threeInst.s2.length : 0);
        }



        t.initialized = true;
        var x = t.items;
        t.onresize_postDo(t, true);
    }

    createSphere (size, color) {
        const geometry = new THREE.SphereGeometry( size/3, size/3, size/3 );
        const material = new THREE.MeshBasicMaterial( { color: color } );
        const sphere = new THREE.Mesh( geometry, material );

        return sphere;
    }


    createDodecahedron (size, color) {
        var g = new THREE.DodecahedronGeometry(size);

        const base = new THREE.Vector2(0, 0.5);
        const center = new THREE.Vector2();
        const angle = THREE.MathUtils.degToRad(72);
        var baseUVs = [
            base.clone().rotateAround(center, angle * 1).addScalar(0.5),
            base.clone().rotateAround(center, angle * 2).addScalar(0.5),
            base.clone().rotateAround(center, angle * 3).addScalar(0.5),
            base.clone().rotateAround(center, angle * 4).addScalar(0.5),
            base.clone().rotateAround(center, angle * 0).addScalar(0.5)
        ];

        var uvs = [];
        var sides = [];
        for (var i = 0; i < 12; i++) {
            uvs.push(
                baseUVs[1].x, baseUVs[1].y,
                baseUVs[2].x, baseUVs[2].y,
                baseUVs[0].x, baseUVs[0].y,

                baseUVs[2].x, baseUVs[2].y,
                baseUVs[3].x, baseUVs[3].y,
                baseUVs[0].x, baseUVs[0].y,

                baseUVs[3].x, baseUVs[3].y,
                baseUVs[4].x, baseUVs[4].y,
                baseUVs[0].x, baseUVs[0].y
            );
            sides.push(i, i, i, i, i, i, i, i, i);
        };
        g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
        g.setAttribute("sides", new THREE.Float32BufferAttribute(sides, 1));

        var m = new THREE.MeshStandardMaterial({
            roughness: 0.25,
            metalness: 0.75,
            color : (color?color:"#0000FF"),
            emissive : (color?color:"#00FF00"),
            opacity : 0.5,
            transparent : true
        });
        var o = new THREE.Mesh(g, m);
        return o;
    }

    createTexture(){
        let c = document.createElement("canvas");
        let step = 250;
        c.width = step * 16;
        c.height = step;
        let ctx = c.getContext("2d");
        ctx.fillStyle = "#7f7f7f";
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "aqua";
        ctx.textBaseline = "middle";
        for (let i = 0; i < 12; i++){
            ctx.fillText(i + 1, step * 0.5 + step * i, step * 0.5);
        }

        return new THREE.CanvasTexture(c);
    }

    onresize_postDo (t, animate=false) {
        //t.drawLines(t);
        //t.controls._camera.lookAt (t.s2[0].position);

        const width = t.el.clientWidth;
        const height = t.el.clientHeight;

        t.graph
            .width(width)
            .height(height);

        t.resizing = false;

        if (!t.started4) {
            t.started4 = true;
            //t.onresize(t);
        };
        if (typeof callback=="function") callback(t);
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
    
    drawLines (t) {
        //debugger;
        if (!t.showLines) return false;
        for (var i=0; i<t.permaLines.length; i++) {
            var l = t.permaLines[i];
            t.scene.remove(l.line);
            l.geometry.dispose();
            l.material.dispose();
        };
        t.lineColors = {};
        for (var i=1; i<t.items.length; i++) {
            var 
            it = t.items[i];

//            debugger;
            if (it.parent) {
                var
                parent = it.parent,
                haveThisLineAlready = false;

                if (it.name.match(/\.mp3$/)) continue;
                if (!it.model) continue;

                for (var j=0; j<t.permaLines.length; j++) {
                    if (t.permaLines[j].it === it) {
                        haveThisLineAlready = true;
                        break;
                    }
                };

                for (var p1 in t.ld3) {
                    if (p1==it.idxPath) {
                        var p1s = p1.split("/");
                        var idx = p1s[p1s.length-2];
                        if (typeof idx=="number") var color = t.items[parseInt(idx)].color; else var color = null;
                    }
                }

                var
                p1 = it.model.position,
                p2 = parent.model.position;

                //if (p1.x===0 && p1.y===0 && p1.z===0) continue;
                //if (p2.x===0 && p2.y===0 && p2.z===0) continue;

                const points = [];
                points.push( new THREE.Vector3( p1.x, p1.y, p1.z ) );
                points.push( new THREE.Vector3( p2.x, p2.y, p2.z ) );

                var
                geometry = new THREE.BufferGeometry().setFromPoints (points);
                if (!t.lineColors) t.lineColors = {};
                if (!t.lineColors[it.parent.idx] && color) {
                    t.lineColors[it.parent.idx] = color;
                } else {
                    var color = t.lineColors[it.parent.idx];
                }

                if (!color) color = "rgb(255,255,255)";

                var
                material = new THREE.LineBasicMaterial({ color: color, linewidth :1, opacity : 0.5, transparent : true }),
                line = new THREE.Line( geometry, material );
                t.scene.add(line);

                t.permaLines.push ({
                    line : line,
                    geometry : geometry,
                    material : material,
                    it : it
                });
            }
        }
        //$.cookie("3DFDM_lineColors", JSON.stringify(t.lineColors), na.m.cookieOptions());
    }
    
    useNewArrangement () {
        var t = this;
        t.onresize_do(t, t.posDataToDatabase);
    }
    
    useNewColors () {
        var t = this;
        for (var i=0; i<t.permaLines.length; i++) {
            t.scene.remove (t.permaLines[i].line);
            t.permaLines[i].geometry.dispose();
            t.permaLines[i].material.dispose();
        }
        t.permaLines = [];
        delete t.lineColors;
        setTimeout (function () {
            t.drawLines (t);
        }, 500);
    }
    
    toggleAutoRotate () {
        var t = this;
        t.controls.autoRotate = !t.controls.autoRotate;
        if (t.controls.autoRotate) $("#autoRotate").removeClass("vividButton").addClass("vividButtonSelected");
        else $("#autoRotate").removeClass("vividButtonSelected").addClass("vividButton");
    }
    
    updateTextureEncoding (t, content) {
        /*const encoding = t.state.textureEncoding === "sRGB"
        ? sRGBEncoding
        : LinearEncoding;*/
        const encoding = LinearEncoding;
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
        /*
        const environment = {
            id: "venice-sunset",
            name: "Venice Sunset",
            path: "/NicerAppWebOS/3rd-party/3D/assets/environment/venice_sunset_1k.hdr",
            format: ".hdr"
        };*/
        const environment = {
            id: "footprint-court",
            name: "Footprint Court (HDR Labs)",
            path: "/NicerAppWebOS/3rd-party/3D/assets/environment/footprint_court_2k.hdr",
            format: ".hdr"
        }

        t.getCubeMapTexture( environment ).then(( { envMap } ) => {

            /*if ((!envMap || !t.state.background) && t.activeCamera === t.defaultCamera) {
                t.scene.add(t.vignette);
            } else {
                t.scene.remove(t.vignette);
            }*/

            t.scene.environment = envMap;
            //t.scene.background = t.state.background ? envMap : null;

        });

    }    
    
    getCubeMapTexture ( environment ) {
        const { path } = environment;

        // no envmap
        if ( ! path ) return Promise.resolve( { envMap: null } );

        return new Promise( ( resolve, reject ) => {
            new RGBELoader()
                .setDataType( UnsignedByteType )
                .load( path, ( texture ) => {

                    const envMap = t.pmremGenerator.fromEquirectangular( texture ).texture;
                    t.pmremGenerator.dispose();

                    resolve( { envMap } );

                }, undefined, reject );
        });
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
        
        el.addEventListener("mousemove", function() { debugger; t.onMouseMove (event, t) });
        el.addEventListener("pointerup", function() { debugger; t.onPointerUp (event, t) });

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
        debugger;
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

        debugger;
            t.raycaster.setFromCamera(t.mouse, t.camera);
            const intersects = t.raycaster.intersectObjects(t.s2);

            console.log('Intersects:', intersects.length, intersects[0] ? intersects[0].object.it?.name : null);
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

