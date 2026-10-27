uniform vec3 uSunDirection;
uniform vec3 uSunColor;
uniform float uPlanetRadius;
uniform float uRingInner;
uniform float uRingOuter;
uniform float uTime;

varying vec3 vWorldPosition;
varying vec3 vLocalPosition;
varying vec2 vUv;

// Procedural high-frequency ring density profile with Keplerian differential streaming
float getRingDensity(float r, float streamPhase) {
  float t = (r - uRingInner) / (uRingOuter - uRingInner);
  if (t < 0.0 || t > 1.0) return 0.0;

  // Concentric divisions: D Ring, C Ring, B Ring, Cassini Division, A Ring (Encke gap, Keeler gap), F Ring
  float baseDensity = 0.0;
  if (t < 0.12) {
    baseDensity = smoothstep(0.01, 0.12, t) * 0.28;
  } else if (t < 0.35) {
    baseDensity = mix(0.40, 0.65, (t - 0.12) / 0.23);
  } else if (t < 0.68) {
    baseDensity = mix(0.88, 1.00, (t - 0.35) / 0.33);
  } else if (t < 0.74) {
    // Cassini division gap
    baseDensity = 0.03;
  } else if (t < 0.95) {
    // A ring
    baseDensity = 0.76;
    // Encke division
    if (t > 0.865 && t < 0.892) {
      baseDensity = 0.06;
    }
    // Keeler gap
    if (t > 0.932 && t < 0.942) {
      baseDensity = 0.08;
    }
  } else if (t > 0.965) {
    // F ringlet
    baseDensity = smoothstep(0.965, 0.982, t) * (1.0 - smoothstep(0.982, 1.0, t)) * 0.95;
  }

  // Keplerian spiral density waves & differential micro-streamers (Kepler's 3rd Law)
  float differentialWaves = sin(streamPhase * 18.0 + r * 16.0) * 0.045
                          + sin(streamPhase * 52.0 - r * 34.0) * 0.025
                          + sin(streamPhase * 110.0 + r * 80.0) * 0.015;

  // Micro-harmonic particulate ripples with Keplerian phase shearing
  float microLines = sin(r * 50.0 + streamPhase * 2.0) * 0.10
                   + sin(r * 130.0 - streamPhase * 4.0) * 0.06
                   + sin(r * 320.0 + streamPhase * 8.0) * 0.03;

  return clamp(baseDensity + microLines + differentialWaves, 0.0, 1.0);
}

// Particle color based on radius & composition (delicate silver-blue filaments, luminous platinum, icy white, pale champagne)
vec3 getRingColor(float t, float density) {
  vec3 colSilverBlue    = vec3(0.72, 0.82, 0.94); // Delicate silver-blue filaments
  vec3 colColdPlatinum  = vec3(0.92, 0.95, 0.98); // Luminous cold platinum
  vec3 colIcyWhite      = vec3(0.98, 0.99, 1.00); // Pure crystalline ice white
  vec3 colPaleChampagne = vec3(0.98, 0.94, 0.85); // Subtle warm champagne highlight

  if (t < 0.25) {
    return mix(colSilverBlue, colColdPlatinum, t / 0.25);
  } else if (t < 0.65) {
    return mix(colColdPlatinum, colIcyWhite, (t - 0.25) / 0.40);
  } else if (t < 0.74) {
    // Cassini division edge tint
    return colSilverBlue * 0.40;
  } else if (t < 0.92) {
    return mix(colIcyWhite, colPaleChampagne, (t - 0.74) / 0.18);
  } else {
    return mix(colPaleChampagne, colSilverBlue, (t - 0.92) / 0.08);
  }
}

void main() {
  vec3 pos = vWorldPosition;
  // Local ring space coordinates (planar disk)
  vec3 localPos = vLocalPosition;
  float r = length(localPos.xz);

  if (r < uRingInner || r > uRingOuter) {
    discard;
  }

  // Keplerian Differential Angular Flow: omega(r) = k * r^(-1.5) (Kepler's 3rd Law)
  float phi = atan(localPos.z, localPos.x);
  float omega = 3.6 * pow(max(r, 0.1), -1.5);
  float streamPhase = phi + omega * uTime;

  float density = getRingDensity(r, streamPhase);
  if (density < 0.01) {
    discard;
  }

  float tRadius = (r - uRingInner) / (uRingOuter - uRingInner);
  vec3 L = normalize(uSunDirection);
  vec3 V = normalize(cameraPosition - vWorldPosition);

  // 1. Calculate Planet's Shadow onto the Ring
  float b = dot(pos, L);
  float c = dot(pos, pos) - (uPlanetRadius * uPlanetRadius);
  float disc = b * b - c;
  
  float planetShadow = 1.0;
  if (disc > 0.0) {
    float t0 = -b - sqrt(disc);
    float t1 = -b + sqrt(disc);
    if (t1 > 0.05 && t0 < 100.0) {
      float dCenter = length(pos - dot(pos, L) * L);
      float penumbra = smoothstep(uPlanetRadius - 0.25, uPlanetRadius + 0.15, dCenter);
      planetShadow = mix(0.015, 1.0, penumbra);
    }
  }

  // 2. Anisotropic Light Scattering on Ring Particles (Enhanced Forward Mie Scattering)
  float cosPhase = dot(V, -L);
  float forwardScatter = pow(max(0.0, cosPhase), 3.6) * 3.6;
  float backScatter = pow(max(0.0, -cosPhase), 2.4) * 0.75;
  float scatter = 0.28 + forwardScatter + backScatter;

  // 3. Multi-tone Palette blending & Crystalline Glints
  vec3 ringBaseColor = getRingColor(tRadius, density);
  float crystallineGlint = pow(max(0.0, sin(streamPhase * 160.0 + r * 45.0)), 12.0) * 0.22;
  vec3 illuminatedColor = ringBaseColor * uSunColor * (scatter + crystallineGlint) * planetShadow;

  // Outer & inner edge soft taper
  float edgeFade = smoothstep(uRingInner, uRingInner + 0.25, r) * (1.0 - smoothstep(uRingOuter - 0.45, uRingOuter, r));
  float alpha = clamp(density * 1.25 * edgeFade, 0.0, 0.98);

  gl_FragColor = vec4(illuminatedColor, alpha);
}
