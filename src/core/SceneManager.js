import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export const CAMERA_PRESETS = {
  cinematic: {
    name: "Hoàng Kim Vô Tận (Reference View)",
    position: new THREE.Vector3(-3.2, 3.8, 28.0),
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

/**
 * Enhanced SceneManager with UnrealBloom Post-Processing and Cinematic Director Cameras
 */
export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.updatables = new Set();
    this.isDisposed = false;

    // Camera animation state
    this.isTransitioning = false;
    this.transitionProgress = 0.0;
    this.camStartPos = new THREE.Vector3();
    this.camEndPos = new THREE.Vector3();
    this.targetStartPos = new THREE.Vector3();
    this.targetEndPos = new THREE.Vector3();

    this.init();
  }

  init() {
    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 3000);
    this.camera.position.copy(CAMERA_PRESETS.cinematic.position);

    // 3. Renderer with ACES Filmic Tone Mapping
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.04;
    this.controls.minDistance = 6.8;
    this.controls.maxDistance = 120.0;
    this.controls.target.copy(CAMERA_PRESETS.cinematic.target);

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

    // UnrealBloomPass: adds that celestial, ethereal glow to rings, stars, and sun
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

  /**
   * Sets bloom intensity
   * @param {number} strength in [0.0, 2.5]
   */
  setBloomStrength(strength) {
    if (this.bloomPass) {
      this.bloomPass.strength = strength;
    }
  }

  /**
   * Smoothly animates camera to a predefined cinematic preset
   * @param {string} presetKey
   */
  setCameraPreset(presetKey) {
    const preset = CAMERA_PRESETS[presetKey];
    if (!preset) return;

    this.camStartPos.copy(this.camera.position);
    this.camEndPos.copy(preset.position);

    this.targetStartPos.copy(this.controls.target);
    this.targetEndPos.copy(preset.target);

    this.transitionProgress = 0.0;
    this.isTransitioning = true;
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

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height, false);
    if (this.composer) {
      this.composer.setSize(width, height);
    }
  }

  animate() {
    if (this.isDisposed) return;

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Smooth camera transition
    if (this.isTransitioning) {
      this.transitionProgress += delta * 0.85;
      if (this.transitionProgress >= 1.0) {
        this.transitionProgress = 1.0;
        this.isTransitioning = false;
      }
      // Cubic smoothstep easing
      const t = 1.0 - Math.pow(1.0 - this.transitionProgress, 3.0);
      this.camera.position.lerpVectors(this.camStartPos, this.camEndPos, t);
      this.controls.target.lerpVectors(this.targetStartPos, this.targetEndPos, t);
    }

    this.controls.update();

    this.updatables.forEach(item => {
      if (typeof item.update === 'function') {
        item.update(elapsedTime, delta);
      }
    });

    // Render through Post-Processing Composer
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
