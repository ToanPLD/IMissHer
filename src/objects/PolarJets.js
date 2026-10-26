import * as THREE from 'three';

/**
 * Relativistic Polar Jets (Blandford-Znajek mechanism)
 * Collimated plasma beams shooting out from north and south rotation poles.
 */
export class PolarJets {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = "PolarJets";

    // 1. Core beam cylinder geometry
    // Height: 24.0, radiusTop: 0.1, radiusBottom: 1.2
    this.beamGeo = new THREE.CylinderGeometry(1.2, 0.08, 26.0, 32, 1, true);
    // Align base to origin, pointing up +Y
    this.beamGeo.translate(0, 13.0, 0);

    // Custom gradient shader material for soft additive plasma glow
    const jetVertexShader = `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `;

    const jetFragmentShader = `
      uniform float uTime;
      uniform float uIntensity;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        vec3 viewDir = normalize(cameraPosition - vPosition);
        float rim = pow(1.0 - abs(dot(vNormal, viewDir)), 2.2);

        // Vertical attenuation (brighter near black hole, fading out into distance)
        float heightFade = smoothstep(0.0, 0.1, vUv.y) * (1.0 - smoothstep(0.4, 1.0, vUv.y));

        // Moving plasma pulses
        float pulse = sin(vUv.y * 25.0 - uTime * 15.0) * 0.15 + 0.85;

        // Beam gradient: bright electric cyan-white at center, violet at rim
        vec3 coreColor = vec3(0.5, 0.95, 1.0);
        vec3 outerColor = vec3(0.7, 0.2, 1.0);
        vec3 finalCol = mix(outerColor, coreColor, rim) * pulse * 2.5;

        float alpha = rim * heightFade * uIntensity;
        gl_FragColor = vec4(finalCol, alpha);
      }
    `;

    this.uniforms = {
      uTime: { value: 0.0 },
      uIntensity: { value: 1.0 }
    };

    this.beamMat = new THREE.ShaderMaterial({
      vertexShader: jetVertexShader,
      fragmentShader: jetFragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    // North Jet (+Y)
    this.northJet = new THREE.Mesh(this.beamGeo, this.beamMat);
    this.group.add(this.northJet);

    // South Jet (-Y)
    this.southJet = new THREE.Mesh(this.beamGeo, this.beamMat);
    this.southJet.rotation.x = Math.PI;
    this.group.add(this.southJet);

    // Helical particles corkscrewing along the magnetic field lines
    this.initHelicalParticles();
  }

  initHelicalParticles() {
    this.particleCount = 1200;
    this.particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    const phases = new Float32Array(this.particleCount);

    for (let i = 0; i < this.particleCount; i++) {
      const isNorth = i % 2 === 0 ? 1 : -1;
      const t = Math.random();
      const height = t * 24.0 * isNorth;
      const radius = 0.15 + t * 1.4;
      const angle = t * 18.0 + Math.random() * Math.PI * 2.0;

      positions[i * 3 + 0] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      phases[i] = Math.random() * Math.PI * 2.0;
    }

    this.particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particleGeo.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

    this.particleMat = new THREE.PointsMaterial({
      size: 0.14,
      color: 0x00f0ff,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.75,
      depthWrite: false
    });

    this.particleMesh = new THREE.Points(this.particleGeo, this.particleMat);
    this.group.add(this.particleMesh);
  }

  /**
   * Updates polar jets animation and intensity based on spin and mode
   * @param {number} elapsedTime
   * @param {Object} state
   */
  update(elapsedTime, state) {
    if (!state) return;

    this.uniforms.uTime.value = elapsedTime;

    // Jets only activate if black hole is spinning (Kerr) and in appropriate mode
    let targetIntensity = 0.0;
    if (state.mode === 'anatomy') {
      // Scale with spin (a) and accretion density
      const spinFactor = (state.spin ?? 0.9);
      targetIntensity = spinFactor * (state.accretionDensity ?? 1.0) * 0.9;
    } else if (state.mode === 'genesis') {
      // Emerges in Stage 4 (0.80 to 1.0)
      const p = state.timelineProgress ?? 0.0;
      if (p > 0.80) {
        targetIntensity = (p - 0.80) / 0.20;
      }
    }

    this.uniforms.uIntensity.value = THREE.MathUtils.lerp(
      this.uniforms.uIntensity.value,
      targetIntensity,
      0.08
    );

    this.group.visible = this.uniforms.uIntensity.value > 0.01;
    this.particleMat.opacity = this.uniforms.uIntensity.value * 0.8;

    // Rotate helical stream
    this.group.rotation.y = elapsedTime * 0.35;
  }

  dispose() {
    this.beamGeo.dispose();
    this.beamMat.dispose();
    this.particleGeo.dispose();
    this.particleMat.dispose();
  }
}
