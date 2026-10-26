import * as THREE from 'three';

/**
 * Procedural Starfield & Celestial Dust Background
 */
export class Starfield {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = "Starfield";

    this.starCount = 6000;
    this.geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(this.starCount * 3);
    const colors = new Float32Array(this.starCount * 3);
    const sizes = new Float32Array(this.starCount);

    const tempColor = new THREE.Color();
    const starPalette = [
      new THREE.Color(0xffffff), // Bright white
      new THREE.Color(0x99ccff), // Blue-white
      new THREE.Color(0xffeedd), // Warm white
      new THREE.Color(0xffaa77), // Red-orange dwarf
      new THREE.Color(0x00f0ff)  // Cyan giant
    ];

    for (let i = 0; i < this.starCount; i++) {
      // Place on large sphere radius 450 - 600
      const radius = 450.0 + Math.random() * 150.0;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);

      positions[i * 3 + 0] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const picked = starPalette[Math.floor(Math.random() * starPalette.length)];
      colors[i * 3 + 0] = picked.r;
      colors[i * 3 + 1] = picked.g;
      colors[i * 3 + 2] = picked.b;

      sizes[i] = 1.0 + Math.random() * 2.5;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    this.material = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.group.add(this.points);
  }

  /**
   * Slowly rotates the celestial sphere
   * @param {number} elapsedTime
   */
  update(elapsedTime) {
    this.group.rotation.y = elapsedTime * 0.005;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
