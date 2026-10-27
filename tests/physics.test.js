import { describe, it, expect } from 'vitest';
import {
  calculateSchwarzschildRadius,
  calculatePhotonSphereRadius,
  calculateISCO,
  calculateDopplerFactor,
  calculateGravitationalRedshift,
  calculateKeplerianAngularVelocity
} from '../src/utils/physics.js';

describe('Astrophysics Relativistic Utilities', () => {
  it('calculates Schwarzschild radius proportional to mass', () => {
    // For standard reference mass 10 solar masses, Rs = 2.0
    expect(calculateSchwarzschildRadius(10)).toBeCloseTo(2.0, 4);
    expect(calculateSchwarzschildRadius(20)).toBeCloseTo(4.0, 4);
    expect(calculateSchwarzschildRadius(5)).toBeCloseTo(1.0, 4);
  });

  it('calculates Photon Sphere radius as 1.5 * Rs', () => {
    const rs = 2.0;
    expect(calculatePhotonSphereRadius(rs)).toBeCloseTo(3.0, 4);
  });

  it('calculates ISCO radius based on spin parameter', () => {
    const rs = 2.0;
    // For non-rotating Schwarzschild black hole (spin = 0), ISCO = 3 * Rs = 6.0
    expect(calculateISCO(rs, 0.0)).toBeCloseTo(6.0, 2);
    // For spinning Kerr black hole (spin > 0), ISCO shrinks closer to horizon
    const iscoSpinning = calculateISCO(rs, 0.9);
    expect(iscoSpinning).toBeLessThan(6.0);
    expect(iscoSpinning).toBeGreaterThan(rs);
  });

  it('calculates relativistic Doppler boosting factor', () => {
    // When emitter approaches observer (cosTheta = 1.0) with beta = 0.5
    // gamma = 1 / sqrt(1 - 0.25) = 1.1547
    // delta = 1 / (gamma * (1 - 0.5)) = sqrt(0.75) / 0.5 = 1.73205
    const delta = calculateDopplerFactor(0.5, 1.0);
    expect(delta).toBeCloseTo(1.732, 2);

    // When emitter recedes from observer (cosTheta = -1.0) with beta = 0.5
    // delta = 1 / (gamma * (1 - (-0.5))) = sqrt(0.75) / 1.5 = 0.57735
    const deltaReceding = calculateDopplerFactor(0.5, -1.0);
    expect(deltaReceding).toBeCloseTo(0.577, 2);
  });

  it('calculates gravitational redshift correctly for r > Rs', () => {
    const rs = 2.0;
    // At r = 4.0 (2 * Rs), 1 + z = 1 / sqrt(1 - 0.5) = sqrt(2) = 1.4142
    const factor = calculateGravitationalRedshift(4.0, rs);
    expect(factor).toBeCloseTo(Math.SQRT2, 4);

    // Clamped inside or at horizon
    expect(calculateGravitationalRedshift(2.0, rs)).toBe(Infinity);
  });

  it('calculates Keplerian orbital angular velocity according to Kepler 3rd Law (r^-1.5)', () => {
    // For r = 1, omega = 1.0
    expect(calculateKeplerianAngularVelocity(1.0, 1.0)).toBeCloseTo(1.0, 4);

    // For r = 4, omega = 4^(-1.5) = 1/8 = 0.125
    expect(calculateKeplerianAngularVelocity(4.0, 1.0)).toBeCloseTo(0.125, 4);

    // Inner ring (r = 8.4) rotates faster than outer ring (r = 24.8)
    const omegaInner = calculateKeplerianAngularVelocity(8.4, 4.0);
    const omegaOuter = calculateKeplerianAngularVelocity(24.8, 4.0);
    expect(omegaInner).toBeGreaterThan(omegaOuter);
    expect(omegaInner / omegaOuter).toBeCloseTo(Math.pow(24.8 / 8.4, 1.5), 3);

    // Edge cases
    expect(calculateKeplerianAngularVelocity(0, 1.0)).toBe(0.0);
    expect(calculateKeplerianAngularVelocity(-5, 1.0)).toBe(0.0);
  });
});
