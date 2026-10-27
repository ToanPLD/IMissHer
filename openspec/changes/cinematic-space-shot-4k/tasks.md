# Tasks

## 1. Camera Push-In & Dynamic Choreography

- [x] 1.1 Implement continuous dolly push-in vector in `src/core/SceneManager.js` with momentum damping and verify smooth forward translation over time.
- [x] 1.2 Add seamless user drag override and auto-resume transitions when manual interaction ends.
- [x] 1.3 Add keyboard shortcut toggle (`Space`) in `src/ui/CinematicHUD.js` to pause/resume auto-pilot push-in and verify state changes.

## 2. Keplerian Physics & Dust Ring Shaders

- [x] 2.1 Update `src/shaders/ring.frag.glsl` with radial angular frequency $\omega(r) \propto r^{-1.5}$ and verify differential streaming across ring bands.
- [x] 2.2 Update ice particle stream in `src/objects/CelestialSystem.js` to orbit with Keplerian velocities and verify no visual shearing.

## 3. Optical Scintillation & Solar Flare Occlusion

- [x] 3.1 Implement multi-frequency starlight scintillation in the galactic starfield and verify dynamic twinkling via render tests.
- [x] 3.2 Implement ray-sphere analytical solar occlusion in `src/objects/CelestialSystem.js` to dynamically scale lens flare and corona bloom.
- [x] 3.3 Configure adaptive DPR scaling in `src/core/SceneManager.js` for 4K display crispness and verify 60 FPS stability.

## 4. Verification & Polish

- [x] 4.1 Run unit test suite and production build (`npm test` and `npm run build`) to verify all tests pass and bundle builds cleanly.
