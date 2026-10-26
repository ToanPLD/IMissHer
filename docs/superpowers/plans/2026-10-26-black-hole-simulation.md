# Black Hole Simulation & Anatomy Explorer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an interactive 3D WebGL application simulating a realistic black hole (Gargantua-style raymarching with relativistic Doppler beaming and gravitational lensing), an interactive 4-stage stellar collapse/supernova timeline ("how a black hole is created"), and a 3D anatomy inspection system with cutaway view.

**Architecture:** A modular client-side application built with Three.js and custom GLSL raymarching shaders. The core rendering loop dynamically updates shader uniforms (mass, spin, accretion density, relativistic toggles) and manages smooth transitions between the Genesis timeline and Anatomy exploration mode. UI is rendered via a high-performance HUD overlay styled with Tailwind CSS.

**Tech Stack:** Vite, Vanilla JavaScript (ES Modules), Three.js (r160+), Custom GLSL Shaders, Tailwind CSS, Vitest (for physics unit tests), Web Audio API.

**Spec:** `docs/superpowers/specs/2026-10-26-black-hole-simulation-design.md`

## Global Constraints

- **Platform:** Modern web browsers supporting WebGL2 and Web Audio API.
- **Performance:** Target 60 FPS at 1080p using adaptive step sizes and dynamic resolution scaling.
- **Audio:** No external audio media files; synthesized procedurally via Web Audio API.
- **Visual Reference:** Matches the Interstellar Gargantua profile (event horizon, curved halo above and below, asymmetric Doppler brightening).

## Review Focus

- **Shader compilation failure on unsupported WebGL extensions:** Fallback gracefully with error reporting.
- **Performance drop during heavy raymarching on high-DPI displays:** Enforce canvas pixel ratio clamp ($\le 1.5$) and dynamic step degradation when frame time exceeds 20ms.
- **Audio context blocked by browser autoplay policy:** Initialize audio only after first user gesture (click/touch).
- **Timeline scrubber out-of-bounds or non-finite inputs:** Clamp timeline progress strictly to $[0.0, 1.0]$.
- **Camera clipping inside event horizon causing NaN values:** Constrain minimum OrbitControls distance to $1.2 \times R_s$.

---

### Task 1: Project Scaffolding & Setup

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/style.css`

**Interfaces:**
- Produces: Runnable Vite development environment with Three.js, Tailwind CSS, and GLSL import capability.

- [ ] **Step 1: Create `package.json` with scripts and dependencies**
  Dependencies: `three`, `lucide`, `vite`, `tailwindcss`, `postcss`, `autoprefixer`, `vitest`, `vite-plugin-string`.

- [ ] **Step 2: Create `vite.config.js` and `tailwind.config.js`**
  Enable raw string loading for `.glsl` files using `vite-plugin-string` or Vite's `?raw` import syntax.

- [ ] **Step 3: Create `index.html` and `src/style.css`**
  Scaffold canvas root `#webgl-canvas`, HUD container `#hud-overlay`, and dark cosmic background styles.

- [ ] **Step 4: Verify build and test runner**
  Run: `npm install` and `npm run build` or `npx vitest run`.
  Expected: Clean build without errors.

- [ ] **Step 5: Commit**
  ```bash
  git add package.json vite.config.js tailwind.config.js postcss.config.js index.html src/style.css
  git commit -m "chore: scaffold project structure with vite, threejs, and tailwind"
  ```

---

### Task 2: Astrophysics Math & Utility Functions

**Files:**
- Create: `src/utils/physics.js`
- Create: `tests/physics.test.js`

**Interfaces:**
- Produces:
  - `calculateSchwarzschildRadius(massInSolarMasses: number): number`
  - `calculatePhotonSphereRadius(rs: number): number`
  - `calculateISCO(rs: number, spin: number): number`
  - `calculateDopplerFactor(velocityBeta: number, cosTheta: number): number`
  - `calculateGravitationalRedshift(r: number, rs: number): number`

- [ ] **Step 1: Write the failing unit tests for astrophysics equations in `tests/physics.test.js`**
  Test Schwarzschild radius ($R_s = 2GM/c^2$), Photon sphere ($1.5 R_s$), ISCO ($3 R_s$ for $a=0$), and Doppler boosting.

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx vitest run tests/physics.test.js`
  Expected: FAIL with module not found or undefined functions.

- [ ] **Step 3: Implement physics functions in `src/utils/physics.js`**
  Implement exact relativistic formulas using scaled units (where $c=1$, $G=1$, solar mass normalized for 3D visualization).

- [ ] **Step 4: Run test to verify it passes**
  Run: `npx vitest run tests/physics.test.js`
  Expected: PASS all tests.

- [ ] **Step 5: Commit**
  ```bash
  git add src/utils/physics.js tests/physics.test.js
  git commit -m "feat(physics): implement core astrophysics equations and unit tests"
  ```

---

### Task 3: Procedural Cosmic Web Audio Synthesizer

**Files:**
- Create: `src/utils/cosmicAudio.js`
- Create: `tests/audio.test.js`

**Interfaces:**
- Produces:
  - `class CosmicAudioController`
    - `init(): Promise<void>`
    - `setMasterVolume(val: number): void`
    - `startCosmicDrone(): void`
    - `stopCosmicDrone(): void`
    - `triggerSupernovaRumble(intensity: number): void`
    - `updatePitchByMass(massRatio: number): void`

- [ ] **Step 1: Write unit tests verifying class interface in `tests/audio.test.js`**
  Mock Web Audio API (`AudioContext`, `createOscillator`, `createGain`, `createBiquadFilter`).

- [ ] **Step 2: Run test to verify failure**
  Run: `npx vitest run tests/audio.test.js`
  Expected: FAIL with class missing.

- [ ] **Step 3: Implement `CosmicAudioController` in `src/utils/cosmicAudio.js`**
  Create sub-bass binaural drone (42Hz & 55Hz sine waves) and filtered white-noise buffer for explosive cosmic shocks.

- [ ] **Step 4: Run test to verify passing**
  Run: `npx vitest run tests/audio.test.js`
  Expected: PASS.

- [ ] **Step 5: Commit**
  ```bash
  git add src/utils/cosmicAudio.js tests/audio.test.js
  git commit -m "feat(audio): implement procedural cosmic synthesizer with web audio api"
  ```

---

### Task 4: Three.js Scene, Camera, StateManager & Render Loop

**Files:**
- Create: `src/core/StateManager.js`
- Create: `src/core/SceneManager.js`
- Modify: `src/main.js`

**Interfaces:**
- Consumes: Three.js library.
- Produces:
  - `class StateManager`: reactive state holding `{ mode: 'anatomy' | 'genesis', mass: 10, spin: 0.9, accretionDensity: 1.0, dopplerEnabled: true, cutawayEnabled: false, timelineProgress: 0.0, isPlaying: false }`
  - `class SceneManager`: manages Three.js `WebGLRenderer`, `PerspectiveCamera`, `OrbitControls`, window resize handling, and `render(time, delta)` dispatch.

- [ ] **Step 1: Implement `StateManager.js` with pub/sub event listener**
  Methods: `getState()`, `setState(partialState)`, `subscribe(callback)`.

- [ ] **Step 2: Implement `SceneManager.js`**
  Setup WebGL2 context, antialias, pixel ratio clamping ($\le 1.5$), responsive aspect ratio handling, and requestAnimationFrame loop.

- [ ] **Step 3: Connect in `src/main.js` and verify basic render output**
  Run: `npx vite build` to verify syntax and bundling.

- [ ] **Step 4: Commit**
  ```bash
  git add src/core/StateManager.js src/core/SceneManager.js src/main.js
  git commit -m "feat(core): setup scene manager and reactive state manager"
  ```

---

### Task 5: Black Hole GLSL Raymarching Shader & Accretion Disk

**Files:**
- Create: `src/shaders/blackHole.vert.glsl`
- Create: `src/shaders/blackHole.frag.glsl`
- Create: `src/objects/BlackHole.js`

**Interfaces:**
- Consumes: Three.js `ShaderMaterial`, `StateManager`.
- Produces:
  - `class BlackHole`: Three.js Mesh with custom raymarching shader material.
  - Uniforms:
    - `uCamPos`: camera world position.
    - `uRs`: Schwarzschild radius.
    - `uSpin`: Kerr spin parameter $a$.
    - `uAccretionDensity`: density multiplier.
    - `uDopplerEnabled`: boolean flag for relativistic beaming.
    - `uCutawayEnabled`: boolean flag for 90-degree cutaway view.
    - `uTime`: animation time for rotating accretion disk.
    - `uResolution`: canvas resolution for screen-space ray reconstruction.

- [ ] **Step 1: Write Vertex Shader `src/shaders/blackHole.vert.glsl`**
  Pass world position and ray direction vector to fragment shader.

- [ ] **Step 2: Write Fragment Shader `src/shaders/blackHole.frag.glsl`**
  Implement Runge-Kutta / Euler raymarching steps for Schwarzschild geodesic light bending:
  - Event horizon sphere test ($|\mathbf{x}| < R_s$).
  - Accretion disk plane intersection ($|y| < h$ and $R_{in} < r < R_{out}$).
  - 3D simplex noise sampling for dynamic plasma swirls.
  - Relativistic Doppler boosting ($\delta^4$) and gravitational redshift gradient.
  - 90-degree cutaway wedge test when `uCutawayEnabled` is true.

- [ ] **Step 3: Implement `src/objects/BlackHole.js`**
  Wrap shader in `THREE.ShaderMaterial` attached to a bounding volume sphere or screen-aligned box. Expose `update(time, state)`.

- [ ] **Step 4: Verify shader compilation and visual rendering**
  Run: `npx vite build` to verify GLSL syntax and compilation.

- [ ] **Step 5: Commit**
  ```bash
  git add src/shaders/blackHole.vert.glsl src/shaders/blackHole.frag.glsl src/objects/BlackHole.js
  git commit -m "feat(shader): implement relativistic black hole raymarching shader"
  ```

---

### Task 6: Star Collapse & Supernova Shockwave Particle/Shader System

**Files:**
- Create: `src/shaders/starPlasma.frag.glsl`
- Create: `src/shaders/shockwave.frag.glsl`
- Create: `src/objects/StarCollapse.js`

**Interfaces:**
- Consumes: Three.js, `src/utils/cosmicAudio.js`.
- Produces:
  - `class StarCollapse`: controls the visual transition across the 4 Genesis stages:
    - Stage 1 (0-25%): Supergiant Star (pulsing plasma corona).
    - Stage 2 (25-45%): Core Collapse (rapid inward implosion).
    - Stage 3 (45-75%): Supernova Explosion (white flash + expanding particle debris).
    - Stage 4 (75-100%): Black hole birth & accretion disk stabilization.
    - `setProgress(t: number): void`

- [ ] **Step 1: Implement `starPlasma.frag.glsl`**
  Procedural solar convection cells, solar flares, and limb darkening.

- [ ] **Step 2: Implement `shockwave.frag.glsl` and particle cloud**
  Expanding spherical shockwave with 25,000 instanced particle points for glowing ejecta.

- [ ] **Step 3: Implement `StarCollapse.js`**
  Interpolate scale, opacity, shockwave radius, and trigger audio rumble when timeline reaches Stage 3.

- [ ] **Step 4: Verify integration with render loop**
  Run: `npx vite build`.

- [ ] **Step 5: Commit**
  ```bash
  git add src/shaders/starPlasma.frag.glsl src/shaders/shockwave.frag.glsl src/objects/StarCollapse.js
  git commit -m "feat(genesis): build star collapse and supernova shockwave system"
  ```

---

### Task 7: Relativistic Polar Jets & Starfield Background

**Files:**
- Create: `src/objects/PolarJets.js`
- Create: `src/objects/Starfield.js`

**Interfaces:**
- Produces:
  - `class PolarJets`: Two collimated relativistic plasma beams extending from north and south poles.
  - `class Starfield`: High-density cosmic background starfield with Milky Way nebula dust.

- [ ] **Step 1: Implement `PolarJets.js`**
  Cylinder/cone geometry with additive blending, volumetric noise texture, and helical magnetic field particles.

- [ ] **Step 2: Implement `Starfield.js`**
  Cubemap or background spherical particles sampled during raymarching to create realistic Einstein ring deflection.

- [ ] **Step 3: Hook into `SceneManager.js`**
  Add jets and starfield to scene and animate with delta time.

- [ ] **Step 4: Commit**
  ```bash
  git add src/objects/PolarJets.js src/objects/Starfield.js
  git commit -m "feat(vfx): add polar jets and gravitationally lensed background starfield"
  ```

---

### Task 8: Anatomy Data, 3D Hotspot Anchors & Cutaway Explorer

**Files:**
- Create: `src/anatomy/anatomyData.js`
- Create: `src/anatomy/HotspotManager.js`

**Interfaces:**
- Consumes: Three.js Camera, `StateManager`.
- Produces:
  - `anatomyData`: Scientific metadata for 6 components (Singularity, Event Horizon, Photon Sphere, Ergosphere, ISCO, Accretion Disk).
  - `class HotspotManager`: Computes 3D-to-2D screen projection for each component anchor, renders pulsing SVG radar markers, and triggers camera tweening upon click.

- [ ] **Step 1: Define `src/anatomy/anatomyData.js`**
  Structure: `{ id, name, radiusFormula, physicalMeaning, funFact, cameraTargetPosition }`.

- [ ] **Step 2: Implement `HotspotManager.js`**
  Project world vectors: `vector.project(camera)` to screen pixels. Render HTML markers in overlay container. Implement camera glide to target hotspot position using cubic easing.

- [ ] **Step 3: Connect cutaway mode**
  Sync cutaway toggle state with `BlackHole.js` shader uniform to open the 90-degree internal viewing wedge.

- [ ] **Step 4: Commit**
  ```bash
  git add src/anatomy/anatomyData.js src/anatomy/HotspotManager.js
  git commit -m "feat(anatomy): implement 3d hotspot markers and camera navigation"
  ```

---

### Task 9: HUD Control Deck, Timeline Scrubber & Info Cards UI

**Files:**
- Create: `src/ui/HUD.js`
- Create: `src/ui/TimelineBar.js`
- Create: `src/ui/InfoCard.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: `StateManager`, `HotspotManager`, `CosmicAudioController`.
- Produces:
  - Glassmorphism HUD with sliders ($M$, $a$, accretion), toggles (Doppler, Cutaway, Audio), and Mode Switcher (Genesis vs Anatomy).
  - Interactive timeline bar with play/pause and stage markers.
  - Collapsible scientific InfoCard with formatted formulas and facts.

- [ ] **Step 1: Implement `TimelineBar.js`**
  Render scrub bar with 4 stage indicators: "Supergiant", "Core Collapse", "Supernova", "Black Hole". Bind drag/input events to `StateManager.timelineProgress`.

- [ ] **Step 2: Implement `HUD.js`**
  Render sliders with live value display and toggle switches styled with Tailwind CSS.

- [ ] **Step 3: Implement `InfoCard.js`**
  Render animated slide-in panel displaying selected hotspot's scientific details.

- [ ] **Step 4: Connect all UI elements in `src/main.js`**
  Verify state sync between 3D scene and HUD controls.

- [ ] **Step 5: Commit**
  ```bash
  git add src/ui/HUD.js src/ui/TimelineBar.js src/ui/InfoCard.js index.html
  git commit -m "feat(ui): implement glassmorphism hud, timeline scrubber, and info card"
  ```

---

### Task 10: End-to-End Integration, Dynamic Resolution & Polish

**Files:**
- Modify: `src/core/SceneManager.js`
- Modify: `src/objects/BlackHole.js`
- Create: `README.md`

**Interfaces:**
- Produces: Polished, responsive, high-performance web simulation running at steady 60 FPS.

- [ ] **Step 1: Implement Dynamic Resolution Scaling in `SceneManager.js`**
  Monitor render frame time; if $\Delta t > 20\text{ms}$ during camera motion, temporarily scale render buffer to $0.75\times$ and return to $1.0\times$ when stationary.

- [ ] **Step 2: Mobile responsive touch controls and layout adjustments**
  Ensure UI does not obstruct the 3D viewport on smaller screens.

- [ ] **Step 3: Verify all test suites and full build**
  Run: `npm test` and `npm run build`.
  Expected: All unit tests pass, production bundle generates without errors.

- [ ] **Step 4: Create `README.md`**
  Document project background, physics principles, controls guide, and development setup.

- [ ] **Step 5: Commit**
  ```bash
  git add src/core/SceneManager.js src/objects/BlackHole.js README.md
  git commit -m "feat: complete end-to-end integration, performance optimizations, and documentation"
  ```
