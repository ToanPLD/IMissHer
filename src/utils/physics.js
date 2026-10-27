/**
 * Astrophysics & Relativistic Physics Utilities
 * Units are normalized for 3D real-time simulation.
 */

// Base scale: 10 solar masses = 2.0 simulation units
const BASE_SOLAR_MASS = 10.0;
const BASE_RS = 2.0;

/**
 * Calculates Schwarzschild Radius Rs = 2GM/c^2
 * @param {number} massInSolarMasses
 * @returns {number}
 */
export function calculateSchwarzschildRadius(massInSolarMasses) {
  if (massInSolarMasses <= 0) return 0.001;
  return (massInSolarMasses / BASE_SOLAR_MASS) * BASE_RS;
}

/**
 * Calculates the Photon Sphere Radius R_ph = 1.5 * Rs
 * (For a non-rotating Schwarzschild black hole)
 * @param {number} rs - Schwarzschild radius
 * @returns {number}
 */
export function calculatePhotonSphereRadius(rs) {
  return 1.5 * rs;
}

/**
 * Calculates the Innermost Stable Circular Orbit (ISCO) radius.
 * For Schwarzschild (spin = 0): R_isco = 3.0 * Rs = 6GM/c^2
 * For Kerr prograde orbit (spin -> 1): R_isco shrinks towards 0.5 * Rs (GM/c^2).
 * @param {number} rs - Schwarzschild radius
 * @param {number} spin - Kerr spin parameter a in [0.0, 0.998]
 * @returns {number}
 */
export function calculateISCO(rs, spin = 0.0) {
  const a = Math.max(0.0, Math.min(0.998, spin));
  // Exact Bardeen-Press-Teukolsky formula for Kerr ISCO
  const Z1 = 1.0 + Math.cbrt(1.0 - a * a) * (Math.cbrt(1.0 + a) + Math.cbrt(1.0 - a));
  const Z2 = Math.sqrt(3.0 * a * a + Z1 * Z1);
  const r_over_M = 3.0 + Z2 - Math.sqrt(Math.max(0.0, (3.0 - Z1) * (3.0 + Z1 + 2.0 * Z2)));
  // In terms of Rs (where Rs = 2M => r = (r_over_M / 2) * Rs):
  return (r_over_M / 2.0) * rs;
}

/**
 * Relativistic Doppler Boosting Factor delta = 1 / (gamma * (1 - beta * cosTheta))
 * where gamma = 1 / sqrt(1 - beta^2)
 * @param {number} velocityBeta - v / c, typically in [0.0, 0.9]
 * @param {number} cosTheta - cosine of angle between emission velocity and observer line-of-sight
 * @returns {number}
 */
export function calculateDopplerFactor(velocityBeta, cosTheta) {
  const beta = Math.max(-0.99, Math.min(0.99, velocityBeta));
  const gamma = 1.0 / Math.sqrt(1.0 - beta * beta);
  const factor = gamma * (1.0 - beta * cosTheta);
  return factor > 0 ? 1.0 / factor : 1.0;
}

/**
 * Calculates Gravitational Redshift factor 1 + z = 1 / sqrt(1 - Rs / r)
 * @param {number} r - Distance from singularity
 * @param {number} rs - Schwarzschild radius
 * @returns {number}
 */
export function calculateGravitationalRedshift(r, rs) {
  if (r <= rs) return Infinity;
  const val = 1.0 - rs / r;
  if (val <= 0.0) return Infinity;
  return 1.0 / Math.sqrt(val);
}

/**
 * Calculates Keplerian orbital angular velocity omega = sqrt(mu / r^3) = r^(-1.5) * sqrt(mu)
 * According to Kepler's Third Law (differential rotation in planetary rings / accretion disks).
 * @param {number} r - Orbital radius
 * @param {number} mu - Standard gravitational parameter (G * M)
 * @returns {number} Angular velocity in rad/s
 */
export function calculateKeplerianAngularVelocity(r, mu = 1.0) {
  if (r <= 0) return 0.0;
  return Math.sqrt(mu) * Math.pow(r, -1.5);
}
