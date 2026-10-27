# Design: Cinematic 4K Space Shot & Physics-Based Celestial Motion

## Context

The current `IMissHer` codebase implements a photorealistic ringed planet system (`CelestialSystem.js`), a post-processing pipeline with `UnrealBloomPass` (`SceneManager.js`), and a minimal zero-UI HUD (`CinematicHUD.js`). See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**
- Provide a smooth, continuous dolly push-in camera trajectory replicating an IMAX 70mm shot.
- Apply true Keplerian differential velocity ($\omega(r) \propto r^{-1.5}$) across the ring shaders and particle systems.
- Add multi-frequency starlight twinkling (scintillation) to the background starfield.
- Calculate dynamic solar occlusion so flares bloom and fade realistically when passing behind the planet.
- Ensure crisp 4K rendering on high-DPI displays with dynamic performance throttling.

**Non-Goals:**
- Arbitrary N-body gravitational simulations (orbits use analytical Keplerian parameters).
- Heavy offline video playback (everything is 100% real-time GPU WebGL).

## Decisions

### 1. Continuous Camera Push-In Trajectory
- **Decision:** Implement a continuous dolly track vector starting at distant coordinates `(-3.5, 4.2, 34.0)` advancing slowly toward `(0.8, 1.2, 13.5)` at $\approx 0.015\text{ units/s}$.
- **Rationale:** Gives the viewer the sensation of silently gliding through the celestial system.
- **Alternatives Considered:** Keyframe animation tracks (too rigid), fixed OrbitControls target (requires manual user dragging).

### 2. GPU-Driven Keplerian Differential Rotation
- **Decision:** In `ring.frag.glsl`, compute angular coordinate $\phi = \text{atan2}(z, x) + \omega(r) \cdot t$ where $\omega(r) = \frac{k}{r^{1.5}}$.
- **Rationale:** High-performance, zero CPU cost, infinitely smooth dust stream shearing that adheres to real orbital physics.
- **Alternatives Considered:** CPU updating individual ring vertices (unacceptable performance degradation for 4K).

### 3. Star Scintillation via Shader Time-Frequency Phasing
- **Decision:** Enhance `Starfield` shader with a twinkling factor $\sin(\text{phase} + t \cdot \text{freq})$ per star.
- **Rationale:** Stars feel alive and diamond-like without altering buffer geometry every frame.

### 4. Analytical Ray-Sphere Solar Occlusion
- **Decision:** Compute line-of-sight occlusion between the camera and sun center against the planet sphere; scale `sunSprite` scale and `streakSprite` opacity accordingly.
- **Rationale:** Creates dramatic theatrical lighting transitions when the sun dips behind the planetary horizon.

## Risks / Trade-offs

- **Risk:** 4K rendering on high-DPI displays (DPR = 2.0+) may cause GPU frame time spikes.
  - **Mitigation:** Cap default pixel ratio at 1.75 and dynamically downscale to 1.0 if frame delta exceeds 18ms.
- **Risk:** Camera push-in might collide with the planetary surface if left running indefinitely.
  - **Mitigation:** Clamp minimum distance to $12.0$ units, at which point the camera transitions smoothly into an ambient orbital orbit around the world.
