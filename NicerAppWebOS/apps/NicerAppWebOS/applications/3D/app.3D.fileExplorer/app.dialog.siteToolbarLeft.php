<div id="placesPanel" class="vividPanel" style="width: 240px; height: 100%; overflow-y: auto; padding: 8px; box-sizing: border-box;">
<h3 style="margin: 8px 0 12px 0; padding-left: 8px;">Places</h3>

<div class="places-section">
<div class="places-header">Favorites</div>
<ul id="places-favorites" class="places-list"></ul>
</div>

<div class="places-section">
<div class="places-header">Locations</div>
<ul id="places-locations" class="places-list">
<li data-path="/" class="place-item">🖥️ Root</li>
<li data-path="/music" class="place-item">🎵 Music</li>
<li data-path="/photos" class="place-item">🖼️ Pictures</li>
<li data-path="/videos" class="place-item">🎥 Videos</li>
<li data-path="/documents" class="place-item">📄 Documents</li>
</ul>
</div>

<div class="places-section">
<div class="places-header">Recent</div>
<ul id="places-recent" class="places-list"></ul>
</div>

<div id="historyControls" class="toolbar-section">
    <h4>History</h4>
    <div class="history-buttons">
    <button id="btnUndo" title="Undo (Ctrl+Z)" disabled>↩ Undo</button>
    <button id="btnRedo" title="Redo (Ctrl+Shift+Z)" disabled>↪ Redo</button>
    </div>
    <div id="historyStatus" class="history-status"></div>
</div>
</div>
<style>
.places-section { margin-bottom: 16px; }
.places-header {
    font-weight: bold;
    padding: 4px 8px;
    color: #aaa;
    font-size: 0.9em;
    text-transform: uppercase;
}
.places-list {
    list-style: none;
    padding: 0;
    margin: 0;
}
.places-list li {
    padding: 6px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
}
.places-list li:hover {
    background: rgba(255,255,255,0.1);
}
.place-item.active {
    background: rgba(0, 120, 255, 0.3);
    color: white;
}
#historyControls {
margin-top: 16px;
padding: 8px 12px;
border-top: 1px solid #333;
}

.history-buttons {
    display: flex;
    gap: 8px;
    margin-bottom: 6px;
}

.history-buttons button {
    flex: 1;
    padding: 6px 10px;
    font-size: 0.9rem;
}

.history-status {
    font-size: 0.8rem;
    color: #888;
    text-align: center;
}
</style>
<script type="text/javascript">
    $('#siteToolbarLeft').css({width:'fit-content'});
    na.desktop.settings.visibleDivs.push('#siteToolbarLeft');
    na.desktop.resize();



    // ==================== UNDO / REDO SYSTEM ====================

    let history = [];
    let historyIndex = -1;
    const MAX_HISTORY = 50;

    function saveState(description = "State change") {
        const state = {
            timestamp: Date.now(),
            description: description,

            // Navigation
            scrollY: window.scrollY,
            activeItemId: document.querySelector('.active')?.id || null,

            // Camera (customize these properties to match your viewer)
            camera: window.currentCamera ? {
                x: window.currentCamera.x ?? 0,
                y: window.currentCamera.y ?? 0,
                z: window.currentCamera.z ?? 0,
                zoom: window.currentCamera.zoom ?? 1,
                rotation: window.currentCamera.rotation
                ? {
                    x: window.currentCamera.rotation.x,
                    y: window.currentCamera.rotation.y,
                    z: window.currentCamera.rotation.z,
                    order: window.currentCamera.rotation.order
                }
                : null,
                pos : window.threed.graph.cameraPosition()
            } : null
        };

        // Trim future history if we're not at the end
        history = history.slice(0, historyIndex + 1);
        history.push(state);

        if (history.length > MAX_HISTORY) {
            history.shift();
        }

        historyIndex = history.length - 1;
        updateHistoryUI();
    }

    function restoreState(state) {
        if (!state) return;

        // Restore scroll
        if (typeof state.scrollY === 'number') {
            window.scrollTo({ top: state.scrollY, behavior: 'auto' });
        }

        // Restore camera
        if (state.camera && window.currentCamera) {
            //delete state.camera.rotation;

            if (state.camera) {
                const cam = window.currentCamera;
                const pos = state.camera.pos;
                const forward = window.getForwardVector();
                const delta = forward.multiplyScalar(14);

                if (
                    typeof state.camera.x === 'number'
                    && typeof state.camera.y === 'number'
                    && typeof state.camera.z === 'number'
                ) {
                    window.threed.graph.cameraPosition(
                        state.camera.pos,
                        {
                            x: ((pos.lookAt?.x ?? 0) + delta.x),
                            y: ((pos.lookAt?.y ?? 0) + delta.y),
                            z: ((pos.lookAt?.z ?? 0) + delta.z)
                        },
                        1600
                    );
                }
                if (typeof state.camera.zoom === 'number') cam.zoom = state.camera.zoom;
                if (state.camera.rotation) {
                    cam.rotation.set(
                        state.camera.rotation.x,
                        state.camera.rotation.y,
                        state.camera.rotation.z,
                        state.camera.rotation.order
                    );
                }
            };

            if (typeof window.updateCamera === 'function') {
                window.updateCamera();
            } else if (typeof window.render === 'function') {
                window.render(); // fallback
            } else if (typeof window.currentCamera.updateProjectionMatrix==='function') {
                window.currentCamera.updateProjectionMatrix();
                window.currentCamera.updateMatrixWorld(true);
            }
        }

        // Restore active item
        if (state.activeItemId) {
            document.querySelectorAll('.active').forEach(el => el.classList.remove('active'));
            const activeEl = document.getElementById(state.activeItemId);
            if (activeEl) activeEl.classList.add('active');
        }
    }

    function updateHistoryUI() {
        const btnUndo = document.getElementById('btnUndo');
        const btnRedo = document.getElementById('btnRedo');
        const status = document.getElementById('historyStatus');

        if (btnUndo) btnUndo.disabled = historyIndex <= 0;
        if (btnRedo) btnRedo.disabled = historyIndex >= history.length - 1;

        if (status) {
            status.textContent = `${historyIndex + 1} / ${history.length}`;
        }
    }

    function undo() {
        if (historyIndex <= 0) return;
        historyIndex--;
        restoreState(history[historyIndex]);
    }

    function redo() {
        if (historyIndex >= history.length - 1) return;
        historyIndex++;
        restoreState(history[historyIndex]);
    }

    // ==================== BUTTONS & KEYBOARD ====================

    function initHistoryControls() {
        const btnUndo = document.getElementById('btnUndo');
        const btnRedo = document.getElementById('btnRedo');

        if (btnUndo) btnUndo.addEventListener('click', undo);
        if (btnRedo) btnRedo.addEventListener('click', redo);

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
                redo();
            }
        });
    }

    // Expose for easy calling from onclick_node() etc.
    window.saveHistoryState = saveState;
    window.undo = undo;
    window.redo = redo;

    // Initialize everything
    function initUndoRedo() {
        initHistoryControls();

        // Save initial state
        setTimeout(() => {
            saveState("Initial state");
        }, 300);

        console.log("✅ Undo/Redo system initialized with working buttons");
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUndoRedo);
    } else {
        initUndoRedo();
    }

    // Expose for other modules
    window.historyManager = { saveState, undo, redo };
</script>
