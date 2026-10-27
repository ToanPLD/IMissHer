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

// Particle color based on radius & composition (silver-blue, platinum, icy white, pale champagne, subtle amber)
vec3 getRingColor(float t, float density) {
  vec3 colSilverBlue  = vec3(0.86, 0.92, 0.98); // Delicate silver-blue filaments
  vec3 colPlatinum    = vec3(0.92, 0.94, 0.96); // Luminous platinum
  vec3 colIcyWhite    = vec3(0.98, 0.99, 1.00); // Brilliant crystalline icy white
  vec3 colChampagne   = vec3(0.96, 0.91, 0.82); // Pale champagne gold
  vec3 colWarmAmber   = vec3(0.86, 0.72, 0.54); // Subtle warm amber resonance

  if (t < 0.22) {
    // Inner C & D rings: translucent silver-blue with faint amber dust
    return mix(colSilverBlue, colWarmAmber, t / 0.22);
  } else if (t < 0.68) {
    // Main dense B ring: luminous platinum to brilliant icy white
    return mix(colPlatinum, colIcyWhite, (t - 0.22) / 0.46);
  } else if (t < 0.74) {
    // Cassini division gap: deep cold slate-blue
    return colSilverBlue * 0.42;
  } else if (t < 0.95) {
    // Outer A ring: icy white with champagne gold rim
    return mix(colIcyWhite, colChampagne, (t - 0.74) / 0.21);
  } else {
    // F ringlet: delicate silver-blue filament
    return mix(colChampagne, colSilverBlue, (t - 0.95) / 0.05);
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

  // 2. Anisotropic Light Scattering on Ring Particles (Forward Mie Scattering)
  float cosPhase = dot(V, -L);
  float forwardScatter = pow(max(0.0, cosPhase), 3.2) * 2.9;
  float backScatter = pow(max(0.0, -cosPhase), 2.2) * 0.65;
  float scatter = 0.32 + forwardScatter + backScatter;

  // 3. Multi-tone Palette blending & Golden Crystalline Sparks
  vec3 ringBaseColor = getRingColor(tRadius, density);
  float crystallineGlint = pow(max(0.0, sin(streamPhase * 160.0 + r * 45.0)), 12.0) * 0.28;
  vec3 goldenSpark = vec3(1.0, 0.92, 0.74) * crystallineGlint;
  vec3 illuminatedColor = (ringBaseColor * uSunColor * scatter + goldenSpark) * planetShadow;

  // Outer & inner edge soft taper
  float edgeFade = smoothstep(uRingInner, uRingInner + 0.25, r) * (1.0 - smoothstep(uRingOuter - 0.45, uRingOuter, r));
  float alpha = clamp(density * 1.25 * edgeFade, 0.0, 0.98);

  gl_FragColor = vec4(illuminatedColor, alpha);
}
