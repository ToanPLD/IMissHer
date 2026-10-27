import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export const CAMERA_PRESETS = {
  cinematic: {
    name: "Hoàng Kim Vô Tận (Reference View)",
    position: new THREE.Vector3(-3.2, 3.8, 32.0),
    target: new THREE.Vector3(1.2, 0.2, 0.0),
    fov: 42
  },
  ringDrift: {
    name: "Trôi Dạt Vành Băng (Ring Drift)",
    position: new THREE.Vector3(10.5, 0.8, 17.5),
    target: new THREE.Vector3(-1.0, -0.2, 0.0),
    fov: 48
  },
  solarEclipse: {
    name: "Nhật Thực Hoàng Kim (Solar Eclipse)",
    position: new THREE.Vector3(-18.5, -4.5, 26.0),
    target: new THREE.Vector3(0.0, 0.0, 0.0),
    fov: 38
  },
  sisterPlanet: {
    name: "Hành Tinh Song Sinh (Sister World)",
    position: new THREE.Vector3(-19.0, 8.2, -22.0),
    target: new THREE.Vector3(-27.0, 7.2, -38.0),
    fov: 40
  },
  titanMoon: {
    name: "Mặt Trăng Titan (Foreground Moon)",
    position: new THREE.Vector3(-11.5, -7.5, 17.0),
    target: new THREE.Vector3(-14.5, -9.0, 11.5),
    fov: 45
  }
};

export const ASPECT_RATIOS = {
  ultrawide: {
    key: 'ultrawide',
    label: '21:9 IMAX',
    ratio: 21 / 9,
    fovMultiplier: 1.0
  },
  standard: {
    key: 'standard',
    label: '16:9 Cinema',
    ratio: 16 / 9,
    fovMultiplier: 1.05
  },
  portrait: {
    key: 'portrait',
    label: '9:16 Mobile',
    ratio: 9 / 16,
    fovMultiplier: 1.40
  }
};

/**
 * Enhanced SceneManager with Slow Push-in Auto-Pilot, 4K DPR Scaling and Bloom Post-Processing
 */
export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.updatables = new Set();
    this.isDisposed = false;

    // Camera animation & transition state
    this.isTransitioning = false;
    this.transitionProgress = 0.0;
    this.camStartPos = new THREE.Vector3();
    this.camEndPos = new THREE.Vector3();
    this.targetStartPos = new THREE.Vector3();
    this.targetEndPos = new THREE.Vector3();

    // Cinematic Auto-Pilot Push-In state
    this.isAutoPilot = true;
    this.pushInSpeed = 0.015; // Slow cinematic forward glide
    this.minPushInDistance = 13.0; // Stop before intersecting planet/rings
    this.isUserInteracting = false;
    this.userInteractTimer = null;

    // 4K Dynamic DPR Performance management
    this.currentDPR = Math.min(window.devicePixelRatio || 1, 1.75);
    this.lastFrameTime = performance.now();

    // Aspect Ratio & Preset state
    this.currentAspectRatio = 'ultrawide';
    this.activePresetKey = 'cinematic';

    this.init();
  }

  init() {
    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera (24mm anamorphic equivalent horizontal FOV)
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 3000);
    this.camera.position.copy(CAMERA_PRESETS.cinematic.position);

    // 3. Renderer with ACES Filmic Tone Mapping and 4K capability
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(this.currentDPR);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // 4. OrbitControls with user-drag detection
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.04;
    this.controls.minDistance = 6.8;
    this.controls.maxDistance = 140.0;
    this.controls.target.copy(CAMERA_PRESETS.cinematic.target);

    // Detect user manual interaction
    this.controls.addEventListener('start', () => {
      this.isUserInteracting = true;
      if (this.userInteractTimer) clearTimeout(this.userInteractTimer);
    });

    this.controls.addEventListener('end', () => {
      // Resume slow push-in after 3.2s of inactivity
      this.userInteractTimer = setTimeout(() => {
        this.isUserInteracting = false;
      }, 3200);
    });

    // 5. Post-Processing Pipeline (Bloom & Glow)
    this.initPostProcessing(width, height);

    // 6. Window Resize
    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);

    // 7. Render Loop
    this.clock = new THREE.Clock();
    this.animate = this.animate.bind(this);
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  initPostProcessing(width, height) {
    const renderScene = new RenderPass(this.scene, this.camera);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.75, // Strength
      0.45, // Radius
      0.30  // Threshold
    );

    const outputPass = new OutputPass();

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(renderScene);
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(outputPass);
  }

  setBloomStrength(strength) {
    if (this.bloomPass) {
      this.bloomPass.strength = strength;
    }
  }

  toggleAutoPilot() {
    this.isAutoPilot = !this.isAutoPilot;
    return this.isAutoPilot;
  }

  setAutoPilot(state) {
    this.isAutoPilot = !!state;
  }

  setCameraPreset(presetKey) {
    const preset = CAMERA_PRESETS[presetKey];
    if (!preset) return;

    this.activePresetKey = presetKey;
    this.camStartPos.copy(this.camera.position);
    this.camEndPos.copy(preset.position);

    this.targetStartPos.copy(this.controls.target);
    this.targetEndPos.copy(preset.target);

    this.transitionProgress = 0.0;
    this.isTransitioning = true;
  }

  setAspectRatio(ratioKey) {
    if (!ASPECT_RATIOS[ratioKey]) return this.currentAspectRatio;
    this.currentAspectRatio = ratioKey;
    this.onResize();
    return this.currentAspectRatio;
  }

  cycleAspectRatio() {
    const keys = Object.keys(ASPECT_RATIOS);
    const currentIndex = keys.indexOf(this.currentAspectRatio);
    const nextKey = keys[(currentIndex + 1) % keys.length];
    return this.setAspectRatio(nextKey);
  }

  getAspectRatioInfo() {
    return ASPECT_RATIOS[this.currentAspectRatio] || ASPECT_RATIOS.ultrawide;
  }

  addUpdatable(obj) {
    this.updatables.add(obj);
  }

  removeUpdatable(obj) {
    this.updatables.delete(obj);
  }

  onResize() {
    if (!this.canvas || this.isDisposed) return;
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;

    const baseFov = CAMERA_PRESETS[this.activePresetKey]?.fov || 42;
    const aspectInfo = this.getAspectRatioInfo();
    this.camera.fov = baseFov * aspectInfo.fovMultiplier;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height, false);
    if (this.composer) {
      this.composer.setSize(width, height);
    }
  }

  animate() {
    if (this.isDisposed) return;

    const now = performance.now();
    const frameDelta = now - this.lastFrameTime;
    this.lastFrameTime = now;

    // 4K Adaptive DPR: scale back if frame time exceeds 18ms (~55 FPS)
    if (frameDelta > 18.0 && this.currentDPR > 1.1) {
      this.currentDPR = Math.max(1.0, this.currentDPR - 0.05);
      this.renderer.setPixelRatio(this.currentDPR);
    } else if (frameDelta < 14.5 && this.currentDPR < Math.min(window.devicePixelRatio || 1, 1.75)) {
      this.currentDPR = Math.min(Math.min(window.devicePixelRatio || 1, 1.75), this.currentDPR + 0.02);
      this.renderer.setPixelRatio(this.currentDPR);
    }

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Smooth preset transition interpolation
    if (this.isTransitioning) {
      this.transitionProgress += delta * 0.85;
      if (this.transitionProgress >= 1.0) {
        this.transitionProgress = 1.0;
        this.isTransitioning = false;
      }
      const t = 1.0 - Math.pow(1.0 - this.transitionProgress, 3.0);
      this.camera.position.lerpVectors(this.camStartPos, this.camEndPos, t);
      this.controls.target.lerpVectors(this.targetStartPos, this.targetEndPos, t);
    }
    // 2. Continuous Cinematic Push-In Auto-Pilot
    else if (this.isAutoPilot && !this.isUserInteracting) {
      const toTarget = new THREE.Vector3().subVectors(this.controls.target, this.camera.position);
      const dist = toTarget.length();

      if (dist > this.minPushInDistance) {
        // Slow push forward along camera view vector
        const forward = toTarget.clone().normalize();
        this.camera.position.addScaledVector(forward, this.pushInSpeed * delta * 60.0);
        // Subtle vertical breathing drift
        this.camera.position.y += Math.sin(elapsedTime * 0.25) * 0.0018;
      } else {
        // Once within intimate range, transition into infinite gentle orbital orbit
        this.camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.0006 * delta * 60.0);
      }
    }

    this.controls.update();

    this.updatables.forEach(item => {
      if (typeof item.update === 'function') {
        item.update(elapsedTime, delta);
      }
    });

    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }

    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  dispose() {
    this.isDisposed = true;
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('resize', this.onResize);
    this.controls.dispose();
    this.renderer.dispose();
    this.updatables.clear();
  }
}
