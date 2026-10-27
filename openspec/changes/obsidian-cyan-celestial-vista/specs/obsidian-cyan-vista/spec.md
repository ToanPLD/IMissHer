# Spec Delta: Obsidian & Electric-Cyan Vista

## Purpose

Provides a photorealistic, high-contrast IMAX deep-space aesthetic featuring a colossal obsidian gas giant, electric-cyan backlit atmospheric limb, silver-platinum Keplerian rings, and a flowing golden stardust stream.

## ADDED Requirements

### Requirement: Obsidian Midnight Planet Rendering
The system SHALL render the primary celestial gas giant with deep midnight-navy surface shading, subtle swirling cloud bands, faint subsurface blue luminescence, and physical shadow terminator falloff into near-absolute darkness.

#### Scenario: Dark side terminator falloff
- **WHEN** observing the unilluminated hemisphere of the planet
- **THEN** surface tones roll off smoothly into deep obsidian black while retaining subtle midnight-blue cloud contours.

#### Scenario: Subsurface luminescence illumination
- **WHEN** starlight grazes the upper planetary hemisphere
- **THEN** faint deep-blue bioluminescent glow traces become discernible beneath atmospheric storm vortices.

### Requirement: Electric-Cyan Atmospheric Rim Glow
The atmospheric limb shader SHALL render a razor-sharp electric-cyan halo outlining the illuminated edge with exponential Fresnel falloff and forward starlight Mie scattering.

#### Scenario: Backlit rim grazing
- **WHEN** light from the distant star grazes the planetary curvature
- **THEN** a brilliant cyan-to-white luminous rim outlines the upper-right edge of the silhouette without flat artificial outlines.

#### Scenario: Limb electric-blue halo
- **WHEN** viewed against deep space
- **THEN** an ethereal blue-white atmospheric halo smoothly separates the planetary disc from the starry cosmic backdrop.

### Requirement: Silver-Platinum Concentric Planetary Rings
The planetary ring shader SHALL render concentric particulate bands featuring silver-white, platinum, and cold-ice tones with pale champagne highlights, modulated by Keplerian differential streaming.

#### Scenario: Ring tonal variation and gaps
- **WHEN** viewing the ring system across its radial span
- **THEN** translucent silver filaments, dense platinum bands, Cassini divisions, and fine Encke gaps render with high-frequency particulate detail.

#### Scenario: Shadow casting across planet
- **WHEN** the ring plane intersects the illuminated planetary hemisphere
- **THEN** sharp, physically accurate planetary shadows project across the ring surface and onto the planet disc.

### Requirement: Flowing Golden Cosmic Stardust Stream
The celestial particle engine SHALL simulate an illuminated stream of over 5,000 golden-white cosmic dust particles drifting along the ring plane and under the shadowed lower hemisphere.

#### Scenario: Zero-gravity particle drift
- **WHEN** the simulation advances in time
- **THEN** golden-white particles drift along Keplerian trajectories with subtle individual twinkle and forward volumetric scatter.

#### Scenario: Color temperature contrast
- **WHEN** observing the entire composition
- **THEN** the warm golden stardust stream forms a distinct, harmonious color tension against the cold blue-black planet and silver rings.

### Requirement: Multi-Format Cinematic Framing
The rendering engine and HUD SHALL support selectable cinematic viewport framing modes, specifically 21:9 Ultrawide IMAX, 16:9 Standard, and 9:16 Mobile Portrait.

#### Scenario: Aspect ratio switching
- **WHEN** the user selects or triggers an aspect ratio preset
- **THEN** the camera frustum and letterbox geometry adjust smoothly to preserve central planetary composition and 24mm anamorphic perspective.
