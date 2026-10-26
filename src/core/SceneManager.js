import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Manages Three.js Scene, Camera, WebGLRenderer and Animation Loop
 */
export class SceneManager {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {Object} [options]
   */
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.options = options;
    this.updatables = new Set();
    this.isDisposed = false;

    // Dynamic resolution scaling
    this.resolutionScale = 1.0;
    this.targetResolutionScale = 1.0;
    this.lastFrameTime = performance.now();

    this.init();
  }

  init() {
    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    this.camera.position.set(0, 3.5, 14.0);

    // 3. Renderer with WebGL2 support
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 2.5; // Prevent entering inside event horizon
    this.controls.maxDistance = 60.0;
    this.controls.target.set(0, 0, 0);

    // 5. Window Resize Event
    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);

    // 6. Start Render Loop
    this.clock = new THREE.Clock();
    this.animate = this.animate.bind(this);
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  /**
   * Registers an object with an update(time, delta) method
   * @param {Object} obj
   */
  addUpdatable(obj) {
    this.updatables.add(obj);
  }

  /**
   * Unregisters an updatable object
   * @param {Object} obj
   */
  removeUpdatable(obj) {
    this.updatables.delete(obj);
  }

  /**
   * Dynamic Resolution Scaling
   * @param {number} scale in [0.5, 1.0]
   */
  setResolutionScale(scale) {
    const clamped = Math.max(0.5, Math.min(1.0, scale));
    if (Math.abs(this.resolutionScale - clamped) > 0.05) {
      this.resolutionScale = clamped;
      this.onResize();
    }
  }

  onResize() {
    if (!this.canvas || this.isDisposed) return;
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    const scaledWidth = Math.floor(width * this.resolutionScale);
    const scaledHeight = Math.floor(height * this.resolutionScale);
    this.renderer.setSize(scaledWidth, scaledHeight, false);
  }

  animate() {
    if (this.isDisposed) return;

    const now = performance.now();
    const frameDelta = now - this.lastFrameTime;
    this.lastFrameTime = now;

    // Dynamic Resolution: degrade slightly if frame drops below 40 FPS (>25ms)
    if (frameDelta > 25.0 && this.resolutionScale > 0.75) {
      this.setResolutionScale(0.75);
    } else if (frameDelta < 18.0 && this.resolutionScale < 1.0) {
      this.setResolutionScale(1.0);
    }

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    this.controls.update();

    // Update all registered entities
    this.updatables.forEach(item => {
      if (typeof item.update === 'function') {
        item.update(elapsedTime, delta);
      }
    });

    this.renderer.render(this.scene, this.camera);
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
