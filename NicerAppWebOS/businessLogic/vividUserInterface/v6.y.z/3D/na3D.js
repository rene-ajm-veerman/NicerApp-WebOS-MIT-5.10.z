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


        // === Before creating t.graph ===
        const maxLevels = 12; // adjust based on your deepest hierarchy
        t.dagLevelDistances = new Array(maxLevels).fill(0).map((_, level) => {
            return 100 + (level * 40) + Math.random() * 380;
        });


        t.maxLevel = 0;
        for (var i=0; i<t.items.length; i++) {
            if (it.level > t.maxLevel) t.maxLevel = it.level;
        }

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
                   if (highlightedNodes.has(n.id || n)) return t.getHierarchicalColor(depth);
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
                })
            }
            else {
                // Reset when hover ends
                t.graph.nodeColor(n => {
                    n.sprite.visibile = true;
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

        .nodeRelSize(7)
        .numDimensions(3);

        t.graph.d3Force('charge').strength(-130);
        t.graph.d3Force('link').distance(link => 90 + Math.random() * 150);
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
                    html += '<div id="'+t.fid+'_'+j+'" class="vividButton" style="position:relative; font-size:small;" filepath="'+path+'/'+file+'"><a href="javascript:na.threeD.play($(\'#'+t.fid+'_'+j+'\'), \''+path+'/'+node.item.name+'/'+file+'\')"><span>'+path+'/'+node.item.name+'/'+file2+'</span></a></div>';
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
        if (!node || !node.item?.idxPath) return new Set();

        const ancestors = new Set();
        ancestors.add(0); // don't forget to add the innermost root folder
        const path = node.item.idxPath;

        if (node.name!=='music' && typeof path === 'string') {
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

        t.graph
        .width(width)
        .height(height);

        t.resizing = false;

        if (!t.started4) {
            t.started4 = true;
        };
        if (typeof callback=="function") callback(t);
    }

    getHierarchicalColor(depth) {
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
        fullPath = document.location.origin+'/NicerAppWebOS/apps/NicerAppWebOS/applications/2D/musicPlayer.fancy.latest.2D/music/'+relPath;
        fullPath = new URL(fullPath).pathname;
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

