import './style.css';
import { StateManager } from './core/StateManager.js';
import { SceneManager } from './core/SceneManager.js';
import { CosmicAudioController } from './utils/cosmicAudio.js';
import { BlackHole } from './objects/BlackHole.js';
import { StarCollapse } from './objects/StarCollapse.js';
import { PolarJets } from './objects/PolarJets.js';
import { Starfield } from './objects/Starfield.js';
import { HotspotManager } from './anatomy/HotspotManager.js';

// Global instances
const stateManager = new StateManager();
const audioController = new CosmicAudioController();

const canvas = document.getElementById('webgl-canvas');
const hotspotsLayer = document.getElementById('hotspots-layer');
const sceneManager = new SceneManager(canvas);

// Instantiate 3D Entities
const starfield = new Starfield();
sceneManager.scene.add(starfield.group);

const blackHole = new BlackHole(sceneManager.camera);
sceneManager.scene.add(blackHole.mesh);

const polarJets = new PolarJets();
sceneManager.scene.add(polarJets.group);

const starCollapse = new StarCollapse(sceneManager.scene, audioController);

const hotspotManager = new HotspotManager(
  hotspotsLayer,
  sceneManager.camera,
  sceneManager.controls,
  stateManager
);

// Register updatables in render loop
sceneManager.addUpdatable({
  update: (time, delta) => {
    const state = stateManager.getState();
    starfield.update(time);
    blackHole.update(time, state);
    polarJets.update(time, state);
    starCollapse.update(time, state);
    hotspotManager.update(delta, state);
  }
});

// Make available for debugging in dev
window.__APP = {
  stateManager,
  sceneManager,
  audioController,
  blackHole,
  polarJets,
  starCollapse,
  starfield,
  hotspotManager
};

console.log("Black Hole simulation initialized with custom raymarching shader.");
