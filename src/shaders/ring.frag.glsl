uniform vec3 uSunDirection;
uniform vec3 uSunColor;
uniform float uPlanetRadius;
uniform float uRingInner;
uniform float uRingOuter;
uniform float uTime;

varying vec3 vWorldPosition;
varying vec2 vUv;

// Procedural high-frequency ring density profile
float getRingDensity(float r) {
  // Normalize radius in [0, 1] across ring width
  float t = (r - uRingInner) / (uRingOuter - uRingInner);
  if (t < 0.0 || t > 1.0) return 0.0;

  // 1. Major Ring Zones
  // D Ring (0.00 - 0.12): very faint
  // C Ring (0.12 - 0.35): semi-translucent crepe ring
  // B Ring (0.35 - 0.68): densest, brightest, highly reflective
  // Cassini Division (0.68 - 0.74): dark, clean gap
  // A Ring (0.74 - 0.95): structured with Encke division around 0.88
  // F Ring (0.97 - 1.00): thin delicate outer ringlet
  
  float baseDensity = 0.0;
  if (t < 0.12) {
    baseDensity = smoothstep(0.02, 0.12, t) * 0.25;
  } else if (t < 0.35) {
    baseDensity = mix(0.35, 0.6, (t - 0.12) / 0.23);
  } else if (t < 0.68) {
    baseDensity = mix(0.85, 0.98, (t - 0.35) / 0.33);
  } else if (t < 0.74) {
    // Cassini division
    baseDensity = 0.04;
  } else if (t < 0.95) {
    // A ring
    baseDensity = 0.72;
    // Encke division
    if (t > 0.87 && t < 0.895) {
      baseDensity = 0.08;
    }
  } else if (t > 0.97) {
    // F ringlet
    baseDensity = smoothstep(0.97, 0.985, t) * (1.0 - smoothstep(0.985, 1.0, t)) * 0.9;
  }

  // 2. Add thousands of fine micro-ringlets (harmonics)
  float microLines = sin(r * 45.0) * 0.12 + sin(r * 110.0) * 0.08 + sin(r * 280.0) * 0.05;
  float density = clamp(baseDensity + microLines, 0.0, 1.0);

  return density;
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

  vec3 L = normalize(uSunDirection);
  vec3 V = normalize(cameraPosition - vWorldPosition);
  vec3 ringNormal = vec3(0.0, 1.0, 0.0);

  // 1. Calculate Planet's Shadow onto the Ring
  // Ray towards Sun: P(t) = pos + t * L, with t > 0.
  // Intersection test with sphere of radius uPlanetRadius at origin (0,0,0):
  // |pos + t*L|^2 = R^2 => t^2 + 2(pos.L)t + (pos.pos - R^2) = 0
  float b = dot(pos, L);
  float c = dot(pos, pos) - (uPlanetRadius * uPlanetRadius);
  float disc = b * b - c;
  
  float planetShadow = 1.0;
  if (disc > 0.0) {
    float t0 = -b - sqrt(disc);
    float t1 = -b + sqrt(disc);
    // If intersection is in direction towards sun (t > 0)
    if (t1 > 0.05 && t0 < 100.0) {
      // Soft penumbra at the edge of the shadow
      float dCenter = length(pos - dot(pos, L) * L);
      float penumbra = smoothstep(uPlanetRadius - 0.25, uPlanetRadius + 0.15, dCenter);
      planetShadow = mix(0.02, 1.0, penumbra);
    }
  }

  // 2. Anisotropic Light Scattering on Ring Particles
  // Forward scattering (when looking towards the sun through the rings, cosAngle ~ 1)
  // makes the icy grains blaze with golden light!
  float cosPhase = dot(V, -L);
  float forwardScatter = pow(max(0.0, cosPhase), 3.5) * 2.8;
  float backScatter = pow(max(0.0, -cosPhase), 2.0) * 0.6;
  float scatter = 0.35 + forwardScatter + backScatter;

  // 3. Ring Color Palette: Champagne gold, bright pearl, soft amber ochre
  vec3 coreColor = mix(vec3(0.78, 0.68, 0.55), vec3(1.0, 0.94, 0.85), density);
  vec3 illuminatedColor = coreColor * uSunColor * scatter * planetShadow;

  // Outer edge soft fade
  float edgeFade = smoothstep(uRingInner, uRingInner + 0.3, r) * (1.0 - smoothstep(uRingOuter - 0.5, uRingOuter, r));
  float alpha = clamp(density * 1.2 * edgeFade, 0.0, 0.96);

  gl_FragColor = vec4(illuminatedColor, alpha);
}
