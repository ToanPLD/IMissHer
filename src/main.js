import './style.css';
import { StateManager } from './core/StateManager.js';
import { SceneManager } from './core/SceneManager.js';
import { CosmicAudioController } from './utils/cosmicAudio.js';
import { BlackHole } from './objects/BlackHole.js';
import { StarCollapse } from './objects/StarCollapse.js';

// Global instances
const stateManager = new StateManager();
const audioController = new CosmicAudioController();

const canvas = document.getElementById('webgl-canvas');
const sceneManager = new SceneManager(canvas);

// Instantiate 3D Entities
const blackHole = new BlackHole(sceneManager.camera);
sceneManager.scene.add(blackHole.mesh);

const starCollapse = new StarCollapse(sceneManager.scene, audioController);

// Register updatables in render loop
sceneManager.addUpdatable({
  update: (time, delta) => {
    const state = stateManager.getState();
    blackHole.update(time, state);
    starCollapse.update(time, state);
  }
});

// Make available for debugging in dev
window.__APP = {
  stateManager,
  sceneManager,
  audioController,
  blackHole,
  starCollapse
};

console.log("Black Hole simulation initialized with custom raymarching shader.");
