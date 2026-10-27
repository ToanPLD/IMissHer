# Proposal: Cinematic 4K Space Shot & Physics-Based Celestial Motion

## Why

The current space scene features high-quality static assets and click-based camera transitions, but lacks continuous, director-level camera choreography and realistic astrophysical fluid dynamics. To achieve the visual power of a Hollywood space epic, the scene requires a slow cinematic push-in camera trajectory, Keplerian differential motion across the glowing dust rings, twinkling stellar scintillation, and dynamic starflare occlusion.

## What Changes

- **Continuous Cinematic Camera Push-In**: Implement an automated, ultra-smooth slow dolly-in camera motion from distant establishing range ($Z \approx 34$) to intimate ring-grazing range ($Z \approx 14$), with subtle gimbal inertia drift and seamless transition into an infinite ambient orbital track.
- **Keplerian Dust Ring Dynamics**: Update planetary ring shaders and particle flow so inner ring sections orbit faster than outer sections following Kepler's Third Law ($\omega(r) \propto r^{-1.5}$), replacing rigid-body ring rotation with fluid celestial motion.
- **Twinkling Starfield Scintillation**: Add multi-frequency starlight shimmer and scintillation shader effects to background stars, creating an active, living cosmic backdrop.
- **Dynamic Solar Flare & Corona Occlusion**: Calculate real-time line-of-sight occlusion between the camera, planetary rim, and distant star to dynamically flare and bloom anamorphic light streaks.
- **4K High-DPI Rendering Polish**: Optimize pixel ratio, sub-pixel antialiasing on thin ringlet divisions, and performance capping for ultra-crisp 4K displays.

## Capabilities

### New Capabilities
- `cinematic-space-view`: Defines requirements for automated cinematic camera choreography (slow push-in, inertia damping, anamorphic FOV, 4K resolution) and physical celestial motion (Keplerian differential dust rings, realistic moon drift, twinkling stars, and dynamic flare occlusion).

### Modified Capabilities
None.

## Impact

- `src/core/SceneManager.js`: Enhanced with continuous dolly push-in tracking, camera state interpolation, and dynamic 4K DPR handling.
- `src/objects/CelestialSystem.js`: Updated with Keplerian time integration for ring particles and moon orbital paths.
- `src/shaders/ring.frag.glsl`: Shader modified with radial-velocity phase offset for differential dust streaming.
- `src/ui/CinematicHUD.js`: Keyboard control for pausing/resuming auto-pilot camera push-in (`Space` key).
