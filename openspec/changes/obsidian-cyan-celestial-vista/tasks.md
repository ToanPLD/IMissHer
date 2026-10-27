# Tasks

## 1. Shaders & Visual Surface Palette

- [x] 1.1 Overhaul `src/shaders/planet.frag.glsl` to midnight-navy/obsidian albedo with subsurface cyan luminescence and verify shader compilation in test runner.
- [x] 1.2 Overhaul `src/shaders/atmosphere.frag.glsl` to render high-exponent electric-cyan Fresnel limb halo with forward scattering and verify no visual clipping.
- [x] 1.3 Update `src/shaders/ring.frag.glsl` to silver-white, platinum, and pale champagne palette while maintaining Keplerian differential flow.

## 2. Celestial Dust River & Starlight Alignment

- [x] 2.1 Implement `initGoldenStardustRiver()` in `src/objects/CelestialSystem.js` with 6,000+ illuminated particles in the ring plane and under the lower hemisphere.
- [x] 2.2 Realign distant star backlighting to upper-right rear in `src/objects/CelestialSystem.js` to graze the planetary limb and cast sharp ring shadows.

## 3. Cinematic Viewport & Aspect Ratio Framing

- [x] 3.1 Implement aspect ratio presets (21:9 Ultrawide, 16:9 Standard, 9:16 Mobile) and letterbox controls in `src/core/SceneManager.js` and `src/ui/CinematicHUD.js`.
- [x] 3.2 Add hotkey toggle (`A` key or HUD button) for aspect ratio cycling and verify camera frustum adjustments.

## 4. Verification & Testing

- [x] 4.1 Update `tests/cinematic.test.js` to test aspect ratio configurations and palette parameters, and verify all unit tests pass with `npm test`.
- [x] 4.2 Run `npm run build` to verify clean production build bundle.
