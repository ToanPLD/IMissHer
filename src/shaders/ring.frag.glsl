uniform vec3 uSunDirection;
uniform vec3 uSunColor;
uniform float uPlanetRadius;
uniform float uRingInner;
uniform float uRingOuter;
uniform float uTime;

varying vec3 vWorldPosition;
varying vec2 vUv;

// Procedural high-frequency ring density profile with micro-divisions
float getRingDensity(float r) {
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

  // Micro-harmonic particulate ripples
  float microLines = sin(r * 50.0) * 0.12 + sin(r * 130.0) * 0.07 + sin(r * 320.0) * 0.04;
  return clamp(baseDensity + microLines, 0.0, 1.0);
}

// Particle color based on radius & composition (champagne gold, bronze, copper, silver-white, cold platinum)
vec3 getRingColor(float t, float density) {
  vec3 colSilverWhite = vec3(0.95, 0.96, 0.98); // Cold platinum / silver-white
  vec3 colChampagne   = vec3(0.98, 0.92, 0.80); // Champagne gold
  vec3 colBronze      = vec3(0.82, 0.68, 0.50); // Warm bronze
  vec3 colCopper      = vec3(0.70, 0.52, 0.36); // Pale copper

  if (t < 0.35) {
    return mix(colCopper, colBronze, t / 0.35);
  } else if (t < 0.68) {
    return mix(colBronze, colChampagne, (t - 0.35) / 0.33);
  } else if (t < 0.74) {
    return colCopper * 0.5;
  } else {
    return mix(colChampagne, colSilverWhite, (t - 0.74) / 0.26);
  }
}

void main() {
  vec3 pos = vWorldPosition;
  float r = length(pos.xz);

  if (r < uRingInner || r > uRingOuter) {
    discard;
  }

  float density = getRingDensity(r);
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

  // 3. Multi-tone Palette blending
  vec3 ringBaseColor = getRingColor(tRadius, density);
  vec3 illuminatedColor = ringBaseColor * uSunColor * scatter * planetShadow;

  // Outer & inner edge soft taper
  float edgeFade = smoothstep(uRingInner, uRingInner + 0.25, r) * (1.0 - smoothstep(uRingOuter - 0.45, uRingOuter, r));
  float alpha = clamp(density * 1.25 * edgeFade, 0.0, 0.98);

  gl_FragColor = vec4(illuminatedColor, alpha);
}
