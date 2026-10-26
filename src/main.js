import './style.css';
import { StateManager } from './core/StateManager.js';
import { SceneManager } from './core/SceneManager.js';
import { CosmicAudioController } from './utils/cosmicAudio.js';

// Global instances
const stateManager = new StateManager();
const audioController = new CosmicAudioController();

const canvas = document.getElementById('webgl-canvas');
const sceneManager = new SceneManager(canvas);

// Make available for debugging in dev
window.__APP = {
  stateManager,
  sceneManager,
  audioController
};

console.log("Black Hole Explorer core initialized successfully.");
