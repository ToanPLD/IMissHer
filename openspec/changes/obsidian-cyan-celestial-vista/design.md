# Design: Obsidian Cyan Celestial Vista

## Context

The existing rendering pipeline in `IMissHer` provides high-performance WebGL rendering with bloom, tone mapping, and Keplerian ring kinematics. See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**
- Transition the color grade and lighting to an obsidian-cyan palette with an electric-cyan backlit rim.
- Re-grade planetary ring shaders to platinum and silver-white bands with sharp gap divisions.
- Increase particle density to 12,000+ points to form a dense golden cosmic dust river.
- Add camera framing presets and letterboxing for 21:9, 16:9, and 9:16 viewports.

**Non-Goals:**
- Heavy volumetric raymarching for planetary clouds (all effects remain GPU shader and particle-based for 60 FPS).
- Real-time gravity simulation of 12,000 particles (analytical Keplerian formulas are used).

## Decisions

### 1. Electric-Cyan Atmospheric Rim Shader
- **Decision:** In `atmosphere.frag.glsl`, compute rim intensity using `pow(1.0 - max(0.0, dot(N, V)), 5.2)` combined with directional backlighting `pow(max(0.0, dot(V, -L)), 3.5)`. Color tuned to electric cyan (`#00e5ff`).
- **Rationale:** Recreates the intense, razor-sharp blue crescent along the planetary silhouette from the reference image.
- **Alternatives Considered:** Post-processing edge detection (lacks physical depth and angle-dependent light response).

### 2. Obsidian Surface with Micro-Bioluminescence
- **Decision:** Shift `planet.frag.glsl` base palette to `#020611` with low-contrast atmospheric bands and sparse procedural glints.
- **Rationale:** Preserves the monumental scale and mysterious void feeling without appearing as an unshaded black circle.

### 3. 12,000-Point Golden Stardust Keplerian Stream
- **Decision:** Scale particle buffer in `CelestialSystem.js` to 12,000 points with warm champagne-amber hues (`HSL(0.11, 0.95, 0.75)`) orbiting with $\omega(r) = 2.4 \cdot r^{-1.5}$.
- **Rationale:** Forms the striking "golden river" crossing in front of the dark planet hemisphere as seen in the reference photo.
- **Alternatives Considered:** Particle texture map (lacks parallax depth and individual particle sparkle).

### 4. Aspect Ratio Preset Architecture
- **Decision:** Implement aspect-ratio presets (`21:9`, `16:9`, `9:16`) in `SceneManager.js` that adjust camera field of view, distance, and letterbox heights.
- **Rationale:** Guarantees composition integrity across desktop, ultrawide, and mobile screens.

## Risks / Trade-offs

- **Risk:** 12,000 particles updated on CPU may impact mobile frame rates.
  - **Mitigation:** Update positions via Float32Array batches or GPU time uniform with buffer stride.
- **Risk:** High bloom on electric-cyan rim may wash out the dark hemisphere.
  - **Mitigation:** Clamp rim alpha and tune UnrealBloomPass threshold to 0.35.
