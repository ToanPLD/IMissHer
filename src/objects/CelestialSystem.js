import * as THREE from 'three';
import planetFragShader from '../shaders/planet.frag.glsl?raw';
import ringFragShader from '../shaders/ring.frag.glsl?raw';
import atmosphereFragShader from '../shaders/atmosphere.frag.glsl?raw';

const vertexCommon = `
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec2 vUv;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

/**
 * Complete Cinematic Romantic Space System (Ringed Planet, Ring, Moons, Asteroids, Sun, Galaxy)
 */
export class CelestialSystem {
  /**
   * @param {THREE.Scene} scene
   * @param {THREE.Camera} camera
   */
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    this.group = new THREE.Group();
    this.group.name = "CelestialSystem";

    // Sun light configuration (Top-Right as in reference image)
    this.sunPosition = new THREE.Vector3(75.0, 36.0, -55.0);
    this.sunDirection = this.sunPosition.clone().normalize();
    this.sunColor = new THREE.Vector3(1.0, 0.92, 0.78); // Warm Champagne Sunlight

    // Planet & Ring dimensional parameters
    this.planetRadius = 6.0;
    this.ringInner = 8.2;
    this.ringOuter = 23.5;

    // Build all elements
    this.initPlanetAndRing();
    this.initSisterPlanet();
    this.initCompanionMoons();
    this.initForegroundAsteroids();
    this.initSunAndFlares();
    this.initGalacticCore();

    this.scene.add(this.group);
  }

  initPlanetAndRing() {
    this.planetGroup = new THREE.Group();
    this.planetGroup.name = "MainPlanetGroup";

    // Tilt the entire planetary system dramatically (~26 deg) like in the photo
    this.planetGroup.rotation.z = -0.38;
    this.planetGroup.rotation.x = 0.22;
    this.planetGroup.rotation.y = -0.15;

    // 1. Planet Body
    const planetGeo = new THREE.SphereGeometry(this.planetRadius, 128, 128);
    this.planetUniforms = {
      uSunDirection: { value: this.sunDirection },
      uSunColor: { value: this.sunColor },
      uTime: { value: 0.0 },
      uRingInner: { value: this.ringInner },
      uRingOuter: { value: this.ringOuter },
      uAtmosphereThickness: { value: 0.25 }
    };

    this.planetMat = new THREE.ShaderMaterial({
      vertexShader: vertexCommon,
      fragmentShader: planetFragShader,
      uniforms: this.planetUniforms
    });

    this.planetMesh = new THREE.Mesh(planetGeo, this.planetMat);
    this.planetGroup.add(this.planetMesh);

    // 2. Atmosphere Glow Rim
    const atmoGeo = new THREE.SphereGeometry(this.planetRadius * 1.025, 96, 96);
    this.atmoUniforms = {
      uSunDirection: { value: this.sunDirection },
      uAtmosphereColor: { value: new THREE.Vector3(0.95, 0.82, 0.60) },
      uSunColor: { value: this.sunColor }
    };
    this.atmoMat = new THREE.ShaderMaterial({
      vertexShader: vertexCommon,
      fragmentShader: atmosphereFragShader,
      uniforms: this.atmoUniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false
    });
    this.atmoMesh = new THREE.Mesh(atmoGeo, this.atmoMat);
    this.planetGroup.add(this.atmoMesh);

    // 3. Multi-Layered Planetary Rings
    // Rotate ring to lie in XZ plane
    const ringGeo = new THREE.RingGeometry(this.ringInner, this.ringOuter, 256, 16);
    ringGeo.rotateX(-Math.PI / 2);

    this.ringUniforms = {
      uSunDirection: { value: this.sunDirection },
      uSunColor: { value: this.sunColor },
      uPlanetRadius: { value: this.planetRadius },
      uRingInner: { value: this.ringInner },
      uRingOuter: { value: this.ringOuter },
      uTime: { value: 0.0 }
    };

    this.ringMat = new THREE.ShaderMaterial({
      vertexShader: vertexCommon,
      fragmentShader: ringFragShader,
      uniforms: this.ringUniforms,
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: true
    });

    this.ringMesh = new THREE.Mesh(ringGeo, this.ringMat);
    this.planetGroup.add(this.ringMesh);

    this.group.add(this.planetGroup);
  }

  initSisterPlanet() {
    // Distant ringed planet on the mid-left
    this.sisterGroup = new THREE.Group();
    this.sisterGroup.position.set(-27.0, 7.2, -38.0);
    this.sisterGroup.rotation.z = -0.45;
    this.sisterGroup.rotation.x = 0.28;

    const r = 1.7;
    const bodyGeo = new THREE.SphereGeometry(r, 64, 64);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xe6cdb5,
      roughness: 0.65,
      metalness: 0.1
    });
    const sisterBody = new THREE.Mesh(bodyGeo, bodyMat);
    this.sisterGroup.add(sisterBody);

    // Sister rings
    const sisterRingGeo = new THREE.RingGeometry(r * 1.35, r * 2.8, 128);
    sisterRingGeo.rotateX(-Math.PI / 2);
    const sisterRingMat = new THREE.MeshBasicMaterial({
      color: 0xdec6ab,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75
    });
    const sisterRing = new THREE.Mesh(sisterRingGeo, sisterRingMat);
    this.sisterGroup.add(sisterRing);

    this.group.add(this.sisterGroup);
  }

  initCompanionMoons() {
    this.moons = [];

    // Crescent Moon Shader Material helper
    const createMoonMaterial = (baseColorHex, roughness = 0.8) => {
      return new THREE.MeshStandardMaterial({
        color: baseColorHex,
        roughness: roughness,
        metalness: 0.05
      });
    };

    // 1. Foreground Titan Moon (Bottom-Left in reference image)
    const moon1Geo = new THREE.SphereGeometry(1.85, 64, 64);
    const moon1 = new THREE.Mesh(moon1Geo, createMoonMaterial(0xd8c8b4, 0.75));
    moon1.position.set(-14.5, -9.0, 11.5);
    moon1.name = "TitanMoon";
    this.group.add(moon1);
    this.moons.push({ mesh: moon1, speed: 0.015, orbitRadius: 18.0, angle: 3.8 });

    // 2. Shepherd Moon near outer ring
    const moon2Geo = new THREE.SphereGeometry(0.55, 32, 32);
    const moon2 = new THREE.Mesh(moon2Geo, createMoonMaterial(0xedd8c0, 0.6));
    moon2.position.set(12.5, 1.2, 5.0);
    this.group.add(moon2);
    this.moons.push({ mesh: moon2, speed: 0.03, orbitRadius: 13.5, angle: 0.6 });

    // 3. Ring Plane Inner Moon
    const moon3Geo = new THREE.SphereGeometry(0.42, 32, 32);
    const moon3 = new THREE.Mesh(moon3Geo, createMoonMaterial(0xcbb59e, 0.8));
    moon3.position.set(-8.5, -2.8, -7.0);
    this.group.add(moon3);
    this.moons.push({ mesh: moon3, speed: 0.045, orbitRadius: 11.0, angle: 2.4 });

    // 4. Distant Moon near Upper Sun
    const moon4Geo = new THREE.SphereGeometry(0.8, 32, 32);
    const moon4 = new THREE.Mesh(moon4Geo, createMoonMaterial(0xe8dcd0, 0.7));
    moon4.position.set(22.0, 13.5, -30.0);
    this.group.add(moon4);
    this.moons.push({ mesh: moon4, speed: 0.012, orbitRadius: 38.0, angle: 1.1 });
  }

  initForegroundAsteroids() {
    // 180 tumbling rocky ice asteroids floating in near camera view (bottom-right & bottom)
    this.asteroidCount = 180;
    
    // Multiple varied geometric shapes
    const geoA = new THREE.DodecahedronGeometry(0.45, 1);
    const geoB = new THREE.IcosahedronGeometry(0.35, 0);

    const mat = new THREE.MeshStandardMaterial({
      color: 0xbaa490,
      roughness: 0.85,
      metalness: 0.15
    });

    this.asteroidsMeshA = new THREE.InstancedMesh(geoA, mat, Math.floor(this.asteroidCount * 0.6));
    this.asteroidsMeshB = new THREE.InstancedMesh(geoB, mat, Math.floor(this.asteroidCount * 0.4));

    this.asteroidData = [];

    const dummy = new THREE.Object3D();
    let indexA = 0;
    let indexB = 0;

    for (let i = 0; i < this.asteroidCount; i++) {
      // Place in foreground curved belt
      const u = Math.random();
      const x = (Math.random() * 32.0) - 16.0;
      const y = -7.5 - Math.random() * 7.0;
      const z = 4.0 + Math.random() * 16.0;

      const scale = 0.35 + Math.random() * 1.1;
      dummy.position.set(x, y, z);
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      dummy.scale.set(scale, scale * (0.8 + Math.random() * 0.4), scale);
      dummy.updateMatrix();

      const rotSpeed = new THREE.Vector3(
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4
      );

      this.asteroidData.push({
        position: dummy.position.clone(),
        rotation: dummy.rotation.clone(),
        rotSpeed,
        scale: dummy.scale.clone(),
        isA: i % 2 === 0
      });

      if (i % 2 === 0 && indexA < this.asteroidsMeshA.count) {
        this.asteroidsMeshA.setMatrixAt(indexA++, dummy.matrix);
      } else if (indexB < this.asteroidsMeshB.count) {
        this.asteroidsMeshB.setMatrixAt(indexB++, dummy.matrix);
      }
    }

    this.asteroidsMeshA.instanceMatrix.needsUpdate = true;
    this.asteroidsMeshB.instanceMatrix.needsUpdate = true;

    this.group.add(this.asteroidsMeshA);
    this.group.add(this.asteroidsMeshB);
  }

  initSunAndFlares() {
    this.sunGroup = new THREE.Group();
    this.sunGroup.position.copy(this.sunPosition);

    // Directional light from Sun
    const sunLight = new THREE.DirectionalLight(0xfff3db, 3.2);
    sunLight.position.copy(this.sunPosition);
    this.scene.add(sunLight);

    // Soft ambient light representing cosmic starlight & nebulae
    const ambientLight = new THREE.AmbientLight(0x181e32, 0.55);
    this.scene.add(ambientLight);

    // Sun Core Sprite (Golden Flare)
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255, 255, 240, 1.0)');
    grad.addColorStop(0.2, 'rgba(255, 215, 140, 0.85)');
    grad.addColorStop(0.5, 'rgba(255, 160, 60, 0.35)');
    grad.addColorStop(1.0, 'rgba(255, 140, 40, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      blending: THREE.AdditiveBlending,
      color: 0xffeedd,
      transparent: true,
      depthWrite: false
    });

    const sunSprite = new THREE.Sprite(spriteMat);
    sunSprite.scale.set(38.0, 38.0, 1.0);
    this.sunGroup.add(sunSprite);

    // Anamorphic horizontal flare streak
    const streakCanvas = document.createElement('canvas');
    streakCanvas.width = 256;
    streakCanvas.height = 32;
    const sCtx = streakCanvas.getContext('2d');
    const sGrad = sCtx.createRadialGradient(128, 16, 0, 128, 16, 128);
    sGrad.addColorStop(0, 'rgba(255, 240, 200, 0.9)');
    sGrad.addColorStop(0.3, 'rgba(255, 180, 80, 0.4)');
    sGrad.addColorStop(1, 'rgba(255, 160, 50, 0.0)');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 256, 32);

    const streakTex = new THREE.CanvasTexture(streakCanvas);
    const streakMat = new THREE.SpriteMaterial({
      map: streakTex,
      blending: THREE.AdditiveBlending,
      color: 0xffe0b0,
      transparent: true,
      depthWrite: false
    });
    const streakSprite = new THREE.Sprite(streakMat);
    streakSprite.scale.set(95.0, 9.5, 1.0);
    this.sunGroup.add(streakSprite);

    this.group.add(this.sunGroup);
  }

  initGalacticCore() {
    // 1. High density Milky Way starfield & Diagonal Nebula Arm
    this.starCount = 14000;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.starCount * 3);
    const colors = new Float32Array(this.starCount * 3);
    const sizes = new Float32Array(this.starCount);

    const palette = [
      new THREE.Color(0xffffff), // Diamond white
      new THREE.Color(0xffeedb), // Champagne gold
      new THREE.Color(0xbcdcff), // Sirius blue
      new THREE.Color(0xffcca0), // Golden dwarf
      new THREE.Color(0x99c2ff)  // Deep blue cluster
    ];

    for (let i = 0; i < this.starCount; i++) {
      // 65% of stars concentrated along the diagonal Galactic Ribbon
      const isMilkyWay = Math.random() < 0.65;
      let x, y, z;

      if (isMilkyWay) {
        // Diagonal galactic arm running from top-left to bottom-right in background
        const t = (Math.random() * 2.0 - 1.0) * 350.0;
        const widthScatter = (Math.random() - 0.5) * 85.0;
        x = t * 0.85 + widthScatter;
        y = t * 0.55 + (Math.random() - 0.5) * 75.0;
        z = -280.0 + (Math.random() - 0.5) * 90.0;
      } else {
        // Universal background sphere
        const radius = 350.0 + Math.random() * 100.0;
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        x = radius * Math.sin(phi) * Math.cos(theta);
        y = radius * Math.sin(phi) * Math.sin(theta);
        z = radius * Math.cos(phi);
      }

      positions[i * 3 + 0] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3 + 0] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      // Realistic magnitude variation
      sizes[i] = Math.random() < 0.05 ? 3.5 : (1.0 + Math.random() * 2.0);
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const starMat = new THREE.PointsMaterial({
      size: 1.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.galaxyPoints = new THREE.Points(geo, starMat);
    this.group.add(this.galaxyPoints);
  }

  /**
   * Updates all animations (planet spin, rings, moons, drifting asteroids)
   * @param {number} elapsedTime
   * @param {number} delta
   */
  update(elapsedTime, delta) {
    // 1. Planet slow rotation
    if (this.planetMesh) {
      this.planetMesh.rotation.y = elapsedTime * 0.025;
      this.planetUniforms.uTime.value = elapsedTime;
    }
    if (this.ringUniforms) {
      this.ringUniforms.uTime.value = elapsedTime;
    }

    // 2. Sister planet rotation
    if (this.sisterGroup) {
      this.sisterGroup.rotation.y = elapsedTime * 0.015;
    }

    // 3. Moons orbital drift
    this.moons.forEach(m => {
      m.angle += m.speed * delta;
      // Soft floating animation
      m.mesh.position.y += Math.sin(elapsedTime * 0.8 + m.angle) * 0.003;
    });

    // 4. Foreground Asteroids tumbling
    if (this.asteroidData && this.asteroidsMeshA && this.asteroidsMeshB) {
      const dummy = new THREE.Object3D();
      let idxA = 0;
      let idxB = 0;

      for (let i = 0; i < this.asteroidData.length; i++) {
        const item = this.asteroidData[i];
        item.rotation.x += item.rotSpeed.x * delta;
        item.rotation.y += item.rotSpeed.y * delta;
        item.rotation.z += item.rotSpeed.z * delta;

        // Slow ambient orbital drift
        item.position.x += Math.sin(elapsedTime * 0.2 + i) * 0.002;

        dummy.position.copy(item.position);
        dummy.rotation.copy(item.rotation);
        dummy.scale.copy(item.scale);
        dummy.updateMatrix();

        if (item.isA && idxA < this.asteroidsMeshA.count) {
          this.asteroidsMeshA.setMatrixAt(idxA++, dummy.matrix);
        } else if (idxB < this.asteroidsMeshB.count) {
          this.asteroidsMeshB.setMatrixAt(idxB++, dummy.matrix);
        }
      }
      this.asteroidsMeshA.instanceMatrix.needsUpdate = true;
      this.asteroidsMeshB.instanceMatrix.needsUpdate = true;
    }

    // 5. Galaxy slow rotation
    if (this.galaxyPoints) {
      this.galaxyPoints.rotation.y = elapsedTime * 0.002;
    }
  }

  dispose() {
    this.scene.remove(this.group);
  }
}
