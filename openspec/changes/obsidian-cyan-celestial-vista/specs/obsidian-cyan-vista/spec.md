# Spec Delta: Obsidian Cyan Vista

## Purpose

Provides real-time photorealistic rendering of an obsidian-cyan colossal gas giant with electric-cyan rim scattering, silvery-platinum rings, and a dense river of Keplerian golden stardust across 21:9, 16:9, and 9:16 viewports.

## ADDED Requirements

### Requirement: Obsidian Gas Giant Surface Rendering
The system SHALL render the primary planet surface in deep midnight-navy and obsidian black tones with low-contrast atmospheric banding and faint bioluminescent surface accents.

#### Scenario: Deep shadow surface shading
- **WHEN** the primary planet is rendered under backlight illumination
- **THEN** the unlit planetary hemisphere maintains rich obsidian-blue darks without becoming flat black or washing out subtle surface cloud structures.

### Requirement: Electric-Cyan Atmospheric Rim Backlight
The system SHALL render a thin, razor-sharp electric-cyan atmospheric limb along the upper-right planetary curvature driven by directional backlight scattering.

#### Scenario: Limb Fresnel grazing glow
- **WHEN** starlight grazes the upper-right horizon of the planet
- **THEN** an intense electric-cyan rim glow is generated with rapid exponential falloff, separating the planetary silhouette cleanly from the black cosmos.

### Requirement: Silvery-Platinum Ring Re-Grading
The planetary ring shader SHALL render concentric grooved bands with cold platinum, icy white, and silver-blue tones alongside distinct Cassini and Encke divisions.

#### Scenario: Concentric ring band striation
- **WHEN** the camera views the illuminated sections of the planetary rings
- **THEN** the rings exhibit high forward Mie scattering, crisp dark division gaps, and alternating silver-platinum reflectance.

### Requirement: Dense Golden Cosmic Dust River
The system SHALL render a dense stream of 12,000 or more golden-champagne particles orbiting with Keplerian differential velocity and flowing across the ring plane in front of the dark hemisphere.

#### Scenario: Golden stardust river flow
- **WHEN** frames are rendered over time
- **THEN** the golden particle stream flows smoothly along the equatorial plane in front of the dark planet with radial angular velocity inversely proportional to the 1.5 power of orbital distance.

### Requirement: Aspect Ratio Viewport Adaptations
The system SHALL provide responsive camera framing and letterbox adaptations for 21:9 ultrawide, 16:9 widescreen, and 9:16 mobile portrait aspect ratios.

#### Scenario: Multi-device framing consistency
- **WHEN** the viewport aspect ratio changes or a display preset is selected
- **THEN** the camera distance and field of view automatically adjust to preserve the primary planet and ring sweep within the visible frame without distortion.
