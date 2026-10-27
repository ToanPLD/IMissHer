# Tasks

## 1. Shaders: Obsidian Surface & Electric-Cyan Rim

- [x] 1.1 Update `src/shaders/planet.frag.glsl` with midnight-navy / obsidian palette (`#020611`), subtle low-contrast cloud bands, and micro-bioluminescent glints.
- [x] 1.2 Update `src/shaders/atmosphere.frag.glsl` with razor-sharp electric-cyan limb Fresnel and directional backlight scattering.
- [x] 1.3 Update `src/shaders/ring.frag.glsl` to silvery-platinum icy bands with enhanced Cassini/Encke gaps and forward Mie scattering.

## 2. Particles & Celestial Systems

- [x] 2.1 Expand particle buffer in `src/objects/CelestialSystem.js` to 12,000 golden-champagne particles flowing across the ring plane with Keplerian differential velocity.
- [x] 2.2 Re-position directional light source to upper-right background (`(65.0, 42.0, -70.0)`) for dramatic backlight grazing.

## 3. Viewport & Aspect Ratio Adaptations

- [x] 3.1 Implement aspect-ratio presets (21:9 IMAX, 16:9 desktop, 9:16 mobile) and letterbox adjustments in `src/core/SceneManager.js` and `src/ui/CinematicHUD.js`.
- [x] 3.2 Add aspect-ratio hotkey/toggle and verify camera framing across screen sizes.

## 4. Verification & Testing

- [x] 4.1 Update `tests/cinematic.test.js` to assert obsidian-cyan visual constants and particle buffer scale.
- [x] 4.2 Run test suite (`npm test`) and production build (`npm run build`) to verify zero errors and clean build.
