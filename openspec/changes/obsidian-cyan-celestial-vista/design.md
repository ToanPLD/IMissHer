# Design: Obsidian & Electric-Cyan Celestial Vista

## Context

The simulation features a real-time WebGL rendering pipeline using Three.js, custom GLSL shaders (`planet.frag.glsl`, `atmosphere.frag.glsl`, `ring.frag.glsl`), post-processing bloom, and Keplerian orbital dynamics. Current coloring is calibrated for warm amber/champagne tones. See `proposal.md` for the motivation to overhaul this into a high-contrast Hollywood IMAX sci-fi aesthetic.

## Goals / Non-Goals

**Goals:**
- Shift planetary surface albedo to deep obsidian black and midnight navy with subtle bioluminescent cyan veins.
- Implement an electric-cyan / icy-blue atmospheric rim with high-exponent Fresnel falloff and forward Mie scattering.
- Map the ring shader palette to cold platinum, silver-white filaments, and pale champagne highlights while preserving Keplerian differential velocity.
- Create an illuminated `GoldenStardustStream` particle cloud (6,000+ points) drifting in zero-gravity along the ring plane.
- Support selectable cinematic aspect ratio viewports (21:9 Ultrawide IMAX, 16:9 Standard, 9:16 Mobile).

**Non-Goals:**
- External bitmap texture downloads (all surfaces and atmospheres remain 100% procedural GPU shaders).
- Intrusive UI widgets (viewport remains pristine and zero-UI by default).

## Decisions

### 1. Deep Obsidian & Subsurface Cyan Luminescence in `planet.frag.glsl`
- **Decision:** Lower the planet's base albedo to midnight-navy (`vec3(0.012, 0.022, 0.055)`), sharpen the cosine terminator, and introduce subtle procedural Voronoi/curl storm vortices with faint electric-blue luminescence (`vec3(0.1, 0.45, 0.85)`).
- **Rationale:** Delivers the imposing, silent, ancient presence described in the prompt without looking like a flat black cutout.
- **Alternatives Considered:** Flat unlit sphere (too plain, lacks scale) or high-contrast swirling bands (too colorful, resembles Jupiter rather than deep space).

### 2. High-Exponent Fresnel Limb Halo in `atmosphere.frag.glsl`
- **Decision:** Upgrade Fresnel calculation to `pow(1.0 - dot(N, V), 6.0)` combined with an intense forward-scatter factor `pow(max(0.0, dot(V, -L)), 3.5)` modulated with electric-cyan tones (`vec3(0.18, 0.78, 1.25)`).
- **Rationale:** Ensures a thin, razor-sharp electric-blue halo that sharply outlines the planetary silhouette against the deep cosmos without cartoonish outlines.
- **Alternatives Considered:** Post-processing edge detection (creates artificial stroke artifacts; physically based shader scattering is superior).

### 3. Silver-Platinum & Pale Champagne Palette in `ring.frag.glsl`
- **Decision:** Replace the warm copper/bronze ramp with cold silver-white (`vec3(0.92, 0.95, 0.98)`), platinum (`vec3(0.85, 0.88, 0.92)`), and faint champagne gold highlights (`vec3(0.96, 0.90, 0.78)`).
- **Rationale:** Aligns with the prompt's crystalline ice and platinum aesthetic while preserving differential Keplerian streaming ($\omega \propto r^{-1.5}$).

### 4. GPU-Accelerated `GoldenStardustStream` Particle System
- **Decision:** Construct a dedicated 6,000-particle `THREE.Points` system in `CelestialSystem.js` with individual Keplerian velocities, warm champagne colors (`hsl(42°, 85%, 82%)`), and additive blending.
- **Rationale:** Creates the "celestial river" of golden stardust suspended in zero-g beneath the planet, forming a dramatic warm-vs-cold color tension.

### 5. Multi-Format Viewport Controller in `SceneManager.js` & `CinematicHUD.js`
- **Decision:** Add a viewport aspect ratio controller supporting 21:9 (IMAX 2.39:1 letterbox), 16:9 (standard desktop), and 9:16 (mobile vertical framing with centered planetary composition).
- **Rationale:** Allows users to capture or enjoy the scene as desktop wallpapers, ultrawide cinematic movies, or mobile vertical wallpapers.

## Risks / Trade-offs

- **Risk:** Additional 6,000 stardust particles could reduce performance on low-end mobile devices.
  - **Mitigation:** Use a single `BufferGeometry` with `Float32Array` attributes and additive blending with `depthWrite: false`, maintaining 60 FPS under the adaptive DPR engine.
- **Risk:** Deep obsidian planet surface could obscure planetary shadow on the rings.
  - **Mitigation:** Planetary shadow on the rings is computed analytically via ray-sphere intersection, ensuring sharp shadow casting regardless of planet surface darkness.
