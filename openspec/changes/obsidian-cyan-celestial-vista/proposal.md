# Proposal

## Why

The current celestial scene delivers warm amber and champagne mineral tones, but the creative direction requires an extraordinarily cinematic, high-contrast Hollywood IMAX sci-fi aesthetic: an immense, imposing gas giant draped in midnight-navy and obsidian shadows, illuminated by a razor-sharp electric-cyan atmospheric rim, surrounded by majestic silver-platinum rings, and enveloped by a spectacular river of golden cosmic stardust drifting through deep space. A complete makeover is needed to establish this mood of cosmic isolation, monumental scale, and photorealistic elegance.

## What Changes

- **Obsidian & Midnight-Navy Planet Surface**: Overhaul `planet.frag.glsl` to render a colossal, nearly black gas giant with subtle deep-navy atmospheric bands, faint subsurface blue luminescence, delicate swirling storm structures, and deep physical shadow roll-off.
- **Electric-Cyan / Icy-Blue Atmospheric Halo**: Overhaul `atmosphere.frag.glsl` to generate a thin, brilliant icy-cyan rim grazing the upper-right curvature with high-exponent Fresnel limb falloff and forward starlight scattering.
- **Silver-Platinum & Cold-Ice Ring System**: Update `ring.frag.glsl` palette from warm copper/bronze to luminous platinum, silver-blue filaments, cold crystalline ice, and pale champagne highlights while maintaining Keplerian differential flow.
- **Golden Cosmic Dust River**: Introduce an illuminated stream of 6,000+ golden-white cosmic dust particles in `CelestialSystem.js`, drifting in zero-gravity along the illuminated ring plane and beneath the shadowed lower hemisphere.
- **Dramatic Backlit Starlight Configuration**: Reorient the distant star position to the upper-right rear to graze the planetary horizon, creating intense limb backlighting, long planar ring shadows, and deep shadow contrast.
- **Cinematic Framing & Aspect Ratio Presets**: Add dynamic viewport aspect ratio support (21:9 Ultrawide IMAX, 16:9 Standard, 9:16 Mobile Portrait) with 24mm anamorphic camera geometry and minimal HUD integration.

## Capabilities

### New Capabilities

- `obsidian-cyan-vista`: Colossal dark gas giant with electric-cyan atmospheric rim, silver-platinum Keplerian rings, illuminated golden stardust stream, backlit starlight, and multi-aspect ratio cinematic viewport.

### Modified Capabilities

None.

## Impact

- Shaders: `src/shaders/planet.frag.glsl`, `src/shaders/atmosphere.frag.glsl`, `src/shaders/ring.frag.glsl`.
- Celestial objects: `src/objects/CelestialSystem.js` (stardust particle system, sunlight positioning, material uniform parameters).
- Camera & Viewport: `src/core/SceneManager.js`, `src/ui/CinematicHUD.js`.
- Automated test suites: `tests/cinematic.test.js`.
