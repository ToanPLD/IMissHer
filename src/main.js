import './style.css';
import { SceneManager } from './core/SceneManager.js';
import { CelestialSystem } from './objects/CelestialSystem.js';
import { RomanticAudioController } from './utils/romanticAudio.js';
import { CinematicHUD } from './ui/CinematicHUD.js';

// 1. Initialize Core Managers
const canvas = document.getElementById('webgl-canvas');
const hudRoot = document.getElementById('cinematic-hud-root');

const sceneManager = new SceneManager(canvas);
const celestialSystem = new CelestialSystem(sceneManager.scene, sceneManager.camera);
const audioController = new RomanticAudioController();

// 2. Initialize Luxury Cinematic HUD
const cinematicHUD = new CinematicHUD(hudRoot, sceneManager, celestialSystem, audioController);

// 3. Register Animation Loop
sceneManager.addUpdatable({
  update: (time, delta) => {
    celestialSystem.update(time, delta);
  }
});

// Expose globals for inspection
window.__APP = {
  sceneManager,
  celestialSystem,
  audioController,
  cinematicHUD
};

console.log("IMissHer: Cinematic Romantic Space Vista loaded successfully.");
