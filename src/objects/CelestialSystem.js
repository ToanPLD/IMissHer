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
 * Complete Ultra-Realistic Cinematic Space Vista System
 * Matches $300M Hollywood space epic specifications.
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

    // Sun light configuration (Top-Right as in Hollywood IMAX cinematography)
    this.sunPosition = new THREE.Vector3(80.0, 38.0, -58.0);
    this.sunDirection = this.sunPosition.clone().normalize();
    this.sunColor = new THREE.Vector3(1.0, 0.94, 0.82); // Warm Champagne Sunlight

    // Planet & Ring dimensional parameters
    this.planetRadius = 6.2;
    this.ringInner = 8.4;
    this.ringOuter = 24.8;

    // Build all elements
    this.initPlanetAndRing();
    this.initSilhouettedDarkMoon();
    this.initDistantBluePlanet();
    this.initTinyEclipsedWorld();
    this.initCompanionMoons();
    this.initForegroundAsteroids();
    this.initGlitteringIceParticles();
    this.initSunAndFlares();
    this.initGalacticCore();

    this.scene.add(this.group);
  }

  initPlanetAndRing() {
    this.planetGroup = new THREE.Group();
    this.planetGroup.name = "MainPlanetGroup";

    // Tilt planetary system dramatically (~26 deg)
    this.planetGroup.rotation.z = -0.38;
    this.planetGroup.rotation.x = 0.24;
    this.planetGroup.rotation.y = -0.14;

    // 1. Planet Body
    const planetGeo = new THREE.SphereGeometry(this.planetRadius, 128, 128);
    this.planetUniforms = {
      uSunDirection: { value: this.sunDirection },
      uSunColor: { value: this.sunColor },
      uTime: { value: 0.0 },
      uRingInner: { value: this.ringInner },
      uRingOuter: { value: this.ringOuter },
      uAtmosphereThickness: { value: 0.28 }
    };

    this.planetMat = new THREE.ShaderMaterial({
      vertexShader: vertexCommon,
      fragmentShader: planetFragShader,
      uniforms: this.planetUniforms
    });

    this.planetMesh = new THREE.Mesh(planetGeo, this.planetMat);
    this.planetGroup.add(this.planetMesh);

    // 2. Atmosphere Glow Rim
    const atmoGeo = new THREE.SphereGeometry(this.planetRadius * 1.028, 96, 96);
    this.atmoUniforms = {
      uSunDirection: { value: this.sunDirection },
      uAtmosphereColor: { value: new THREE.Vector3(0.96, 0.86, 0.68) },
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

  /**
   * Specified: "a dark moon partially silhouetted against the glowing rings"
   */
  initSilhouettedDarkMoon() {
    // Positioned so its shadowed hemisphere cuts sharply across the bright glowing rings
    const moonGeo = new THREE.SphereGeometry(1.2, 48, 48);
    const moonMat = new THREE.MeshStandardMaterial({
      color: 0x181618,
      roughness: 0.95,
      metalness: 0.05
    });
    this.silhouettedMoon = new THREE.Mesh(moonGeo, moonMat);
    this.silhouettedMoon.position.set(-6.8, -1.8, 14.5);
    this.silhouettedMoon.name = "SilhouettedDarkMoon";
    this.group.add(this.silhouettedMoon);
  }

  /**
   * Specified: "a distant blue planet with a thin atmospheric edge"
   */
  initDistantBluePlanet() {
    this.bluePlanetGroup = new THREE.Group();
    this.bluePlanetGroup.position.set(-36.0, 12.0, -75.0);

    const r = 2.4;
    // Blue planet body
    const bodyGeo = new THREE.SphereGeometry(r, 64, 64);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1b4b8a, // Deep royal oceanic blue
      roughness: 0.45,
      metalness: 0.1
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    this.bluePlanetGroup.add(bodyMesh);

    // Glowing azure atmospheric edge
    const atmoGeo = new THREE.SphereGeometry(r * 1.04, 48, 48);
    const atmoMat = new THREE.ShaderMaterial({
      vertexShader: vertexCommon,
      fragmentShader: atmosphereFragShader,
      uniforms: {
        uSunDirection: { value: this.sunDirection },
        uAtmosphereColor: { value: new THREE.Vector3(0.25, 0.75, 1.2) }, // Electric cyan-blue
        uSunColor: { value: this.sunColor }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    this.bluePlanetGroup.add(atmoMesh);

    this.group.add(this.bluePlanetGroup);
  }

  /**
   * Specified: "a tiny eclipsed world barely visible in the far distance"
   */
  initTinyEclipsedWorld() {
    this.eclipsedWorldGroup = new THREE.Group();
    // Positioned near sun azimuth in extreme distance
    this.eclipsedWorldGroup.position.set(48.0, 24.0, -85.0);

    const r = 1.0;
    const bodyGeo = new THREE.SphereGeometry(r, 32, 32);
    const bodyMat = new THREE.MeshBasicMaterial({ color: 0x020306 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    this.eclipsedWorldGroup.add(body);

    // Annular golden corona halo
    const coronaGeo = new THREE.RingGeometry(r * 0.98, r * 1.45, 64);
    coronaGeo.lookAt(new THREE.Vector3(0, 0, 1));
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xffd28a,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const corona = new THREE.Mesh(coronaGeo, coronaMat);
    this.eclipsedWorldGroup.add(corona);

    this.group.add(this.eclipsedWorldGroup);
  }

  initCompanionMoons() {
    this.moons = [];

    // Foreground Titan-like Moon (Bottom-Left)
    const moon1Geo = new THREE.SphereGeometry(2.1, 64, 64);
    const moon1Mat = new THREE.MeshStandardMaterial({
      color: 0xd2c2b0,
      roughness: 0.85,
      metalness: 0.05
    });
    const moon1 = new THREE.Mesh(moon1Geo, moon1Mat);
    moon1.position.set(-15.5, -9.8, 12.5);
    moon1.name = "TitanMoon";
    this.group.add(moon1);
    this.moons.push({ mesh: moon1, speed: 0.012, angle: 3.8 });

    // Shepherd Moon near outer ring
    const moon2Geo = new THREE.SphereGeometry(0.55, 32, 32);
    const moon2Mat = new THREE.MeshStandardMaterial({ color: 0xedd8c0, roughness: 0.7 });
    const moon2 = new THREE.Mesh(moon2Geo, moon2Mat);
    moon2.position.set(13.5, 1.2, 5.0);
    this.group.add(moon2);
    this.moons.push({ mesh: moon2, speed: 0.025, angle: 0.6 });
  }

  initForegroundAsteroids() {
    this.asteroidCount = 190;
    const geoA = new THREE.DodecahedronGeometry(0.48, 1);
    const geoB = new THREE.IcosahedronGeometry(0.38, 0);

    const mat = new THREE.MeshStandardMaterial({
      color: 0xb5a08c,
      roughness: 0.88,
      metalness: 0.12
    });

    this.asteroidsMeshA = new THREE.InstancedMesh(geoA, mat, Math.floor(this.asteroidCount * 0.6));
    this.asteroidsMeshB = new THREE.InstancedMesh(geoB, mat, Math.floor(this.asteroidCount * 0.4));

    this.asteroidData = [];
    const dummy = new THREE.Object3D();
    let indexA = 0;
    let indexB = 0;

    for (let i = 0; i < this.asteroidCount; i++) {
      const x = (Math.random() * 34.0) - 17.0;
      const y = -7.8 - Math.random() * 7.5;
      const z = 4.5 + Math.random() * 17.0;

      const scale = 0.35 + Math.random() * 1.15;
      dummy.position.set(x, y, z);
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      dummy.scale.set(scale, scale * (0.8 + Math.random() * 0.4), scale);
      dummy.updateMatrix();

      const rotSpeed = new THREE.Vector3(
        (Math.random() - 0.5) * 0.35,
        (Math.random() - 0.5) * 0.35,
        (Math.random() - 0.5) * 0.35
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

  /**
   * Specified: "crystalline fragments and rocky debris catching tiny flashes of light"
   */
  initGlitteringIceParticles() {
    this.iceParticleCount = 2800;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.iceParticleCount * 3);
    const colors = new Float32Array(this.iceParticleCount * 3);

    const tempColor = new THREE.Color();
    for (let i = 0; i < this.iceParticleCount; i++) {
      // Dispersed in ring plane and near foreground
      const r = this.ringInner + Math.random() * (this.ringOuter - this.ringInner);
      const theta = Math.random() * Math.PI * 2.0;
      const yOffset = (Math.random() - 0.5) * 0.35;

      // Transform into tilted planet coordinate space
      positions[i * 3 + 0] = Math.cos(theta) * r;
      positions[i * 3 + 1] = yOffset;
      positions[i * 3 + 2] = Math.sin(theta) * r;

      // Sparkling colors: diamond white to warm champagne
      tempColor.setHSL(0.12 + Math.random() * 0.08, 0.75, 0.85);
      colors[i * 3 + 0] = tempColor.r;
      colors[i * 3 + 1] = tempColor.g;
      colors[i * 3 + 2] = tempColor.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });

    this.icePoints = new THREE.Points(geo, mat);
    this.planetGroup.add(this.icePoints);
  }

  initSunAndFlares() {
    this.sunGroup = new THREE.Group();
    this.sunGroup.position.copy(this.sunPosition);

    const sunLight = new THREE.DirectionalLight(0xfff5e4, 3.4);
    sunLight.position.copy(this.sunPosition);
    this.scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x0e1428, 0.6);
    this.scene.add(ambientLight);

    // Sun Core Sprite (Golden Flare)
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255, 255, 245, 1.0)');
    grad.addColorStop(0.2, 'rgba(255, 220, 150, 0.85)');
    grad.addColorStop(0.5, 'rgba(255, 165, 70, 0.35)');
    grad.addColorStop(1.0, 'rgba(255, 140, 40, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: texture,
      blending: THREE.AdditiveBlending,
      color: 0xffeedd,
      transparent: true,
      depthWrite: false
    }));
    sunSprite.scale.set(42.0, 42.0, 1.0);
    this.sunGroup.add(sunSprite);

    // Anamorphic horizontal lens flare streak
    const streakCanvas = document.createElement('canvas');
    streakCanvas.width = 256;
    streakCanvas.height = 32;
    const sCtx = streakCanvas.getContext('2d');
    const sGrad = sCtx.createRadialGradient(128, 16, 0, 128, 16, 128);
    sGrad.addColorStop(0, 'rgba(255, 242, 210, 0.95)');
    sGrad.addColorStop(0.3, 'rgba(255, 185, 90, 0.42)');
    sGrad.addColorStop(1, 'rgba(255, 160, 50, 0.0)');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 256, 32);

    const streakSprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(streakCanvas),
      blending: THREE.AdditiveBlending,
      color: 0xffe2b5,
      transparent: true,
      depthWrite: false
    }));
    streakSprite.scale.set(110.0, 11.0, 1.0);
    this.sunGroup.add(streakSprite);

    this.group.add(this.sunGroup);
  }

  initGalacticCore() {
    this.starCount = 16000;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.starCount * 3);
    const colors = new Float32Array(this.starCount * 3);
    const sizes = new Float32Array(this.starCount);

    const palette = [
      new THREE.Color(0xffffff), // Diamond white
      new THREE.Color(0xffeedb), // Champagne gold
      new THREE.Color(0xbcdcff), // Sirius blue
      new THREE.Color(0xffcca0), // Golden dwarf
      new THREE.Color(0x99c2ff), // Deep blue cluster
      new THREE.Color(0xd1b3ff)  // Faint violet-blue nebular star
    ];

    for (let i = 0; i < this.starCount; i++) {
      const isMilkyWay = Math.random() < 0.68;
      let x, y, z;

      if (isMilkyWay) {
        const t = (Math.random() * 2.0 - 1.0) * 380.0;
        const widthScatter = (Math.random() - 0.5) * 90.0;
        x = t * 0.85 + widthScatter;
        y = t * 0.55 + (Math.random() - 0.5) * 80.0;
        z = -300.0 + (Math.random() - 0.5) * 95.0;
      } else {
        const radius = 380.0 + Math.random() * 120.0;
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

      sizes[i] = Math.random() < 0.06 ? 3.8 : (1.0 + Math.random() * 2.2);
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

  update(elapsedTime, delta) {
    if (this.planetMesh) {
      this.planetMesh.rotation.y = elapsedTime * 0.022;
      this.planetUniforms.uTime.value = elapsedTime;
    }
    if (this.ringUniforms) {
      this.ringUniforms.uTime.value = elapsedTime;
    }
    if (this.icePoints) {
      this.icePoints.rotation.y = elapsedTime * 0.018;
    }

    // Moons
    this.moons.forEach(m => {
      m.angle += m.speed * delta;
      m.mesh.position.y += Math.sin(elapsedTime * 0.7 + m.angle) * 0.003;
    });

    // Asteroids
    if (this.asteroidData && this.asteroidsMeshA && this.asteroidsMeshB) {
      const dummy = new THREE.Object3D();
      let idxA = 0;
      let idxB = 0;

      for (let i = 0; i < this.asteroidData.length; i++) {
        const item = this.asteroidData[i];
        item.rotation.x += item.rotSpeed.x * delta;
        item.rotation.y += item.rotSpeed.y * delta;
        item.rotation.z += item.rotSpeed.z * delta;

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

    if (this.galaxyPoints) {
      this.galaxyPoints.rotation.y = elapsedTime * 0.0018;
    }
  }

  dispose() {
    this.scene.remove(this.group);
  }
}
