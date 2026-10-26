import * as THREE from 'three';
import starFragShader from '../shaders/starPlasma.frag.glsl?raw';
import shockwaveFragShader from '../shaders/shockwave.frag.glsl?raw';

const vertexCommon = `
varying vec3 vNormal;
varying vec3 vPosition;
void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vPosition = worldPos.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

/**
 * Manages the 4 stages of stellar collapse & supernova into a black hole
 */
export class StarCollapse {
  /**
   * @param {THREE.Scene} scene
   * @param {Object} audioController
   */
  constructor(scene, audioController = null) {
    this.scene = scene;
    this.audioController = audioController;
    this.lastTriggeredProgress = 0.0;

    this.group = new THREE.Group();
    this.group.name = "StarCollapseSystem";

    this.initStar();
    this.initShockwave();
    this.initDebrisParticles();

    this.scene.add(this.group);
  }

  initStar() {
    this.starGeo = new THREE.SphereGeometry(3.5, 48, 48);
    this.starUniforms = {
      uTime: { value: 0.0 },
      uColorA: { value: new THREE.Color(0xffaa22) },
      uColorB: { value: new THREE.Color(0x00f0ff) }
    };

    this.starMat = new THREE.ShaderMaterial({
      vertexShader: vertexCommon,
      fragmentShader: starFragShader,
      uniforms: this.starUniforms,
      transparent: true,
      side: THREE.FrontSide
    });

    this.starMesh = new THREE.Mesh(this.starGeo, this.starMat);
    this.group.add(this.starMesh);
  }

  initShockwave() {
    this.shockGeo = new THREE.SphereGeometry(1.0, 32, 32);
    this.shockUniforms = {
      uTime: { value: 0.0 },
      uRadius: { value: 1.0 },
      uIntensity: { value: 0.0 }
    };

    this.shockMat = new THREE.ShaderMaterial({
      vertexShader: vertexCommon,
      fragmentShader: shockwaveFragShader,
      uniforms: this.shockUniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    this.shockMesh = new THREE.Mesh(this.shockGeo, this.shockMat);
    this.shockMesh.visible = false;
    this.group.add(this.shockMesh);
  }

  initDebrisParticles() {
    this.particleCount = 12000;
    this.particleGeo = new THREE.BufferGeometry();
    
    const positions = new Float32Array(this.particleCount * 3);
    const velocities = new Float32Array(this.particleCount * 3);
    const colors = new Float32Array(this.particleCount * 3);

    const tempColor = new THREE.Color();
    for (let i = 0; i < this.particleCount; i++) {
      // Random direction on unit sphere
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.sin(phi);

      const dx = r * Math.cos(theta);
      const dy = r * Math.sin(theta);
      const dz = Math.cos(phi);

      positions[i * 3 + 0] = dx * 3.0;
      positions[i * 3 + 1] = dy * 3.0;
      positions[i * 3 + 2] = dz * 3.0;

      const speed = 4.0 + Math.random() * 8.0;
      velocities[i * 3 + 0] = dx * speed;
      velocities[i * 3 + 1] = dy * speed;
      velocities[i * 3 + 2] = dz * speed;

      // Palette: fiery gold to electric cyan
      tempColor.setHSL(0.08 + Math.random() * 0.45, 0.9, 0.65);
      colors[i * 3 + 0] = tempColor.r;
      colors[i * 3 + 1] = tempColor.g;
      colors[i * 3 + 2] = tempColor.b;
    }

    this.particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particleGeo.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    this.particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.particleMat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });

    this.particlePoints = new THREE.Points(this.particleGeo, this.particleMat);
    this.particlePoints.visible = false;
    this.group.add(this.particlePoints);
  }

  /**
   * Updates star, shockwave and particle states across the timeline
   * @param {number} elapsedTime
   * @param {Object} state - Application state
   */
  update(elapsedTime, state) {
    if (!state) return;

    this.starUniforms.uTime.value = elapsedTime;
    this.shockUniforms.uTime.value = elapsedTime;

    // In Anatomy mode, hide star lifecycle
    if (state.mode === 'anatomy') {
      this.group.visible = false;
      return;
    }

    this.group.visible = true;
    const progress = state.timelineProgress ?? 0.0;

    // Detect supernova trigger for audio
    if (progress >= 0.45 && this.lastTriggeredProgress < 0.45 && this.audioController) {
      this.audioController.triggerSupernovaRumble(1.0);
    }
    this.lastTriggeredProgress = progress;

    // Stage 1: Supergiant Star (0.0 to 0.25)
    if (progress < 0.25) {
      const t = progress / 0.25;
      this.starMesh.visible = true;
      this.starMesh.scale.setScalar(1.0 + Math.sin(elapsedTime * 2.0) * 0.03);
      this.starMat.opacity = 1.0;
      this.starUniforms.uColorA.value.setHex(0xff8811);
      this.starUniforms.uColorB.value.setHex(0x00f0ff);
      this.shockMesh.visible = false;
      this.particlePoints.visible = false;
    }
    // Stage 2: Core Collapse (0.25 to 0.45)
    else if (progress < 0.45) {
      const t = (progress - 0.25) / 0.20; // 0 to 1
      this.starMesh.visible = true;
      // Exponential implosion
      const scale = Math.max(0.08, 1.0 - Math.pow(t, 2.5) * 0.92);
      this.starMesh.scale.setScalar(scale);

      // Color shifts towards dense hot violet/magenta
      this.starUniforms.uColorA.value.lerpColors(new THREE.Color(0xff8811), new THREE.Color(0x9d4edd), t);
      this.starUniforms.uColorB.value.lerpColors(new THREE.Color(0x00f0ff), new THREE.Color(0xffffff), t);
      this.shockMesh.visible = false;
      this.particlePoints.visible = false;
    }
    // Stage 3: Supernova Explosion (0.45 to 0.72)
    else if (progress < 0.72) {
      const t = (progress - 0.45) / 0.27; // 0 to 1
      this.starMesh.visible = (t < 0.15);
      if (t < 0.15) {
        this.starMesh.scale.setScalar(0.08 + t * 4.0);
        this.starMat.opacity = 1.0 - t / 0.15;
      }

      // Expanding Shockwave
      this.shockMesh.visible = true;
      const shockRadius = 0.5 + t * 24.0;
      this.shockMesh.scale.setScalar(shockRadius);
      this.shockUniforms.uRadius.value = shockRadius;
      this.shockUniforms.uIntensity.value = Math.max(0.0, 1.0 - t * 1.1);

      // Expanding debris particles
      this.particlePoints.visible = true;
      this.particleMat.opacity = Math.max(0.0, 1.0 - t * 0.9);
      this.updateParticlesExpansion(t);
    }
    // Stage 4: Black Hole Birth & Accretion (0.72 to 1.0)
    else {
      const t = (progress - 0.72) / 0.28; // 0 to 1
      this.starMesh.visible = false;
      this.shockMesh.visible = false;

      // Remaining debris spirals down into disk
      this.particlePoints.visible = (t < 0.9);
      if (t < 0.9) {
        this.particleMat.opacity = (1.0 - t / 0.9) * 0.5;
        this.updateParticlesInfalling(t);
      }
    }
  }

  updateParticlesExpansion(t) {
    const positions = this.particleGeo.attributes.position.array;
    const velocities = this.particleGeo.attributes.velocity.array;
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      positions[i3 + 0] = velocities[i3 + 0] * t * 2.5;
      positions[i3 + 1] = velocities[i3 + 1] * t * 2.5;
      positions[i3 + 2] = velocities[i3 + 2] * t * 2.5;
    }
    this.particleGeo.attributes.position.needsUpdate = true;
  }

  updateParticlesInfalling(t) {
    const positions = this.particleGeo.attributes.position.array;
    const velocities = this.particleGeo.attributes.velocity.array;
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      // Infalling motion towards equatorial plane
      const currentRadius = 15.0 * (1.0 - t * 0.7);
      const angle = Math.atan2(velocities[i3 + 2], velocities[i3 + 0]) + t * 6.0;
      positions[i3 + 0] = Math.cos(angle) * currentRadius;
      positions[i3 + 1] = velocities[i3 + 1] * (1.0 - t * 0.95);
      positions[i3 + 2] = Math.sin(angle) * currentRadius;
    }
    this.particleGeo.attributes.position.needsUpdate = true;
  }

  dispose() {
    this.starGeo.dispose();
    this.starMat.dispose();
    this.shockGeo.dispose();
    this.shockMat.dispose();
    this.particleGeo.dispose();
    this.particleMat.dispose();
    this.scene.remove(this.group);
  }
}
