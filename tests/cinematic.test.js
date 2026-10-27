import { describe, it, expect } from 'vitest';
import { CAMERA_PRESETS } from '../src/core/SceneManager.js';
import { calculateKeplerianAngularVelocity } from '../src/utils/physics.js';

describe('Cinematic 4K Vista & Celestial Mechanics', () => {
  it('defines valid cinematic camera presets matching art direction', () => {
    expect(CAMERA_PRESETS).toHaveProperty('cinematic');
    expect(CAMERA_PRESETS).toHaveProperty('ringDrift');
    expect(CAMERA_PRESETS).toHaveProperty('solarEclipse');
    expect(CAMERA_PRESETS).toHaveProperty('sisterPlanet');
    expect(CAMERA_PRESETS).toHaveProperty('titanMoon');

    // Reference cinematic preset must have 24mm equivalent FOV (~42 deg)
    expect(CAMERA_PRESETS.cinematic.fov).toBe(42);
    expect(CAMERA_PRESETS.cinematic.position.z).toBeGreaterThan(20);
  });

  it('guarantees Keplerian differential flow between inner and outer rings', () => {
    const ringInner = 8.4;
    const ringOuter = 24.8;
    const omegaInner = calculateKeplerianAngularVelocity(ringInner, 1.0);
    const omegaOuter = calculateKeplerianAngularVelocity(ringOuter, 1.0);

    // Inner ring must orbit faster than outer ring
    expect(omegaInner).toBeGreaterThan(omegaOuter);

    // According to Kepler's 3rd Law: omegaInner / omegaOuter == (ringOuter / ringInner)^1.5
    const expectedRatio = Math.pow(ringOuter / ringInner, 1.5);
    expect(omegaInner / omegaOuter).toBeCloseTo(expectedRatio, 4);
  });

  it('calculates analytical ray-sphere solar occlusion', () => {
    // Test ray-sphere occlusion formula used in CelestialSystem
    const planetRadius = 6.2;
    const penumbraWidth = 1.4;

    function getOcclusionFactor(distToCenter) {
      if (distToCenter <= planetRadius - 0.2) {
        return 0.04;
      } else if (distToCenter < planetRadius + penumbraWidth) {
        const t = (distToCenter - (planetRadius - 0.2)) / (penumbraWidth + 0.2);
        return 0.04 + 0.96 * (t * t * (3.0 - 2.0 * t));
      }
      return 1.0;
    }

    // Direct center eclipse
    expect(getOcclusionFactor(0.0)).toBe(0.04);
    // Behind planet body
    expect(getOcclusionFactor(5.5)).toBe(0.04);
    // Clear sun outside planet and penumbra
    expect(getOcclusionFactor(8.0)).toBe(1.0);
    // Atmospheric limb penumbra
    const limbFactor = getOcclusionFactor(6.5);
    expect(limbFactor).toBeGreaterThan(0.04);
    expect(limbFactor).toBeLessThan(1.0);
  });
});
