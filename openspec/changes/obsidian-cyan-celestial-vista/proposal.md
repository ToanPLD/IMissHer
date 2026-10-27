# Proposal

## Why

The current celestial scene requires alignment with a new cinematic IMAX visual reference featuring an obsidian midnight-blue gas giant sharply outlined by an electric-cyan atmospheric rim, contrasting against silvery-platinum rings and an immense stream of sparkling golden cosmic dust.

## What Changes

- **Obsidian Planetary Atmosphere**: Shift planet shader from golden-brown minerals to deep midnight-navy / obsidian black (`#020611`) with subtle low-contrast cloud structures and micro-bioluminescent surface accents.
- **Electric-Cyan Rim Backlight**: Implement a razor-sharp electric-cyan (`#00e5ff`) atmospheric limb shader focused on the upper-right horizon, illuminated by a distant backlight star.
- **Silvery-Platinum Ring Re-Grading**: Update ring palette to cold platinum, silver-blue filaments, and high-frequency concentric grooves with distinct Cassini and Encke gravitational gaps.
- **Golden Cosmic Dust River**: Expand particle stream to 12,000+ sparkling golden-champagne particles flowing across the ring plane and curving in front of the dark hemisphere with Keplerian differential orbital motion.
- **Aspect Ratio Optimization**: Configure camera framing presets and letterbox adaptations for 21:9 IMAX ultrawide, 16:9 desktop, and 9:16 mobile viewports.

## Capabilities

### New Capabilities
- `obsidian-cyan-vista`: Real-time rendering of an obsidian-cyan gas giant, electric-cyan atmospheric rim scattering, platinum rings, and a dense river of Keplerian golden stardust.

### Modified Capabilities
*(None - first capability definition)*

## Impact

- Shaders: `src/shaders/planet.frag.glsl`, `src/shaders/atmosphere.frag.glsl`, `src/shaders/ring.frag.glsl`.
- Objects: `src/objects/CelestialSystem.js` (particle counts, palette buffers, light positioning).
- Core & UI: `src/core/SceneManager.js` (camera aspect ratio framing), `src/ui/CinematicHUD.js`.
- Tests: `tests/cinematic.test.js`.
