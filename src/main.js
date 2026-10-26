import './style.css';
import { StateManager } from './core/StateManager.js';
import { SceneManager } from './core/SceneManager.js';
import { CosmicAudioController } from './utils/cosmicAudio.js';
import { BlackHole } from './objects/BlackHole.js';
import { StarCollapse } from './objects/StarCollapse.js';
import { PolarJets } from './objects/PolarJets.js';
import { Starfield } from './objects/Starfield.js';
import { HotspotManager } from './anatomy/HotspotManager.js';
import { HUD } from './ui/HUD.js';
import { TimelineBar } from './ui/TimelineBar.js';
import { InfoCard } from './ui/InfoCard.js';

// 1. Global Core Managers
const stateManager = new StateManager();
const audioController = new CosmicAudioController();

const canvas = document.getElementById('webgl-canvas');
const hotspotsLayer = document.getElementById('hotspots-layer');
const controlsPanel = document.getElementById('controls-panel');
const infocardContainer = document.getElementById('infocard-container');
const timelineContainer = document.getElementById('timeline-container');

const sceneManager = new SceneManager(canvas);

// 2. 3D Entities
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

// 3. UI Components
const hud = new HUD(controlsPanel, stateManager, sceneManager);
const timelineBar = new TimelineBar(timelineContainer, stateManager);
const infoCard = new InfoCard(infocardContainer, stateManager, hotspotManager);

// 4. Header Controls (Mode Switcher & Audio)
const modeAnatomyBtn = document.getElementById('mode-anatomy-btn');
const modeGenesisBtn = document.getElementById('mode-genesis-btn');
const audioToggleBtn = document.getElementById('audio-toggle-btn');

let audioActive = false;

function setMode(mode) {
  stateManager.setState({
    mode,
    selectedHotspotId: null,
    timelineProgress: mode === 'genesis' ? 0.0 : 1.0
  });

  if (mode === 'anatomy') {
    modeAnatomyBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(0,240,255,0.3)]';
    modeGenesisBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-all';
  } else {
    modeGenesisBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(0,240,255,0.3)]';
    modeAnatomyBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-all';
  }
}

modeAnatomyBtn.addEventListener('click', () => setMode('anatomy'));
modeGenesisBtn.addEventListener('click', () => setMode('genesis'));

audioToggleBtn.addEventListener('click', async () => {
  await audioController.init();
  audioActive = !audioActive;
  stateManager.setState({ audioEnabled: audioActive });

  if (audioActive) {
    audioController.startCosmicDrone();
    audioToggleBtn.classList.add('text-cyan-300', 'border-cyan-400/50', 'shadow-[0_0_12px_rgba(0,240,255,0.3)]');
  } else {
    audioController.stopCosmicDrone();
    audioToggleBtn.classList.remove('text-cyan-300', 'border-cyan-400/50', 'shadow-[0_0_12px_rgba(0,240,255,0.3)]');
  }
});

// Update audio drone pitch whenever mass changes
stateManager.subscribe((state) => {
  if (state.audioEnabled) {
    audioController.updatePitchByMass(state.mass / 10.0);
  }
});

// 5. Animation Loop Registration
sceneManager.addUpdatable({
  update: (time, delta) => {
    const state = stateManager.getState();
    starfield.update(time);
    blackHole.update(time, state);
    polarJets.update(time, state);
    starCollapse.update(time, state);
    hotspotManager.update(delta, state);
    timelineBar.tick(delta);
  }
});

// Expose globals for inspection
window.__APP = {
  stateManager,
  sceneManager,
  audioController,
  blackHole,
  polarJets,
  starCollapse,
  starfield,
  hotspotManager,
  hud,
  timelineBar,
  infoCard
};

console.log("Black Hole Simulation & Anatomy Explorer fully loaded.");
