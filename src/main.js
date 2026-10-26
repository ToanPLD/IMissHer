import './style.css';
import { StateManager } from './core/StateManager.js';
import { SceneManager } from './core/SceneManager.js';
import { CosmicAudioController } from './utils/cosmicAudio.js';
import { BlackHole } from './objects/BlackHole.js';

// Global instances
const stateManager = new StateManager();
const audioController = new CosmicAudioController();

const canvas = document.getElementById('webgl-canvas');
const sceneManager = new SceneManager(canvas);

// Instantiate Black Hole object and add to scene
const blackHole = new BlackHole(sceneManager.camera);
sceneManager.scene.add(blackHole.mesh);

// Register updatable in render loop
sceneManager.addUpdatable({
  update: (time, delta) => {
    blackHole.update(time, stateManager.getState());
  }
});

// Make available for debugging in dev
window.__APP = {
  stateManager,
  sceneManager,
  audioController,
  blackHole
};

console.log("Black Hole simulation initialized with custom raymarching shader.");
