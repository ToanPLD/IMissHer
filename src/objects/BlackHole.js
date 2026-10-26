import * as THREE from 'three';
import vertexShader from '../shaders/blackHole.vert.glsl?raw';
import fragmentShader from '../shaders/blackHole.frag.glsl?raw';
import { calculateSchwarzschildRadius } from '../utils/physics.js';

/**
 * Black Hole Mesh & Raymarching Material wrapper
 */
export class BlackHole {
  /**
   * @param {THREE.Camera} camera
   */
  constructor(camera) {
    this.camera = camera;

    // Create a bounding sphere enclosing the simulation volume
    // Using BackSide so the camera can be anywhere inside without clipping
    this.geometry = new THREE.SphereGeometry(32.0, 48, 48);

    this.uniforms = {
      uCamPos: { value: new THREE.Vector3() },
      uRs: { value: 2.0 },
      uSpin: { value: 0.9 },
      uAccretionDensity: { value: 1.0 },
      uDopplerEnabled: { value: 1.0 },
      uCutawayEnabled: { value: 0.0 },
      uTime: { value: 0.0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    };

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.name = "BlackHole";
  }

  /**
   * Updates shader uniforms every frame
   * @param {number} elapsedTime
   * @param {Object} state - State from StateManager
   */
  update(elapsedTime, state) {
    this.uniforms.uTime.value = elapsedTime;
    this.uniforms.uCamPos.value.copy(this.camera.position);

    if (state) {
      // Calculate Rs dynamically from mass
      const targetRs = calculateSchwarzschildRadius(state.mass || 10.0);
      
      // In Genesis mode, Rs scales with timeline progress (Stage 4)
      if (state.mode === 'genesis') {
        const t = state.timelineProgress;
        if (t < 0.70) {
          this.mesh.visible = false;
        } else {
          this.mesh.visible = true;
          // Emerge smoothly from 0.70 to 1.0
          const emergeFactor = Math.min(1.0, (t - 0.70) / 0.25);
          this.uniforms.uRs.value = targetRs * emergeFactor;
          this.uniforms.uAccretionDensity.value = (state.accretionDensity || 1.0) * emergeFactor;
        }
      } else {
        this.mesh.visible = true;
        this.uniforms.uRs.value = targetRs;
        this.uniforms.uAccretionDensity.value = state.accretionDensity ?? 1.0;
      }

      this.uniforms.uSpin.value = state.spin ?? 0.9;
      this.uniforms.uDopplerEnabled.value = state.dopplerEnabled ? 1.0 : 0.0;
      this.uniforms.uCutawayEnabled.value = state.cutawayEnabled ? 1.0 : 0.0;
    }
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
