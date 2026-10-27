uniform vec3 uSunDirection;
uniform vec3 uSunColor;
uniform float uTime;
uniform float uRingInner;
uniform float uRingOuter;
uniform float uAtmosphereThickness;

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec2 vUv;

// Procedural Simplex / Value noise
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  vec2 shift = vec2(100.0);
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 5; ++i) {
    v += a * noise(p);
    p = rot * p * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec3 N = normalize(vNormal);
  vec3 L = normalize(uSunDirection);
  vec3 V = normalize(cameraPosition - vWorldPosition);

  // 1. Planetary Cloud Bands & Swirling Storms
  float lat = vUv.y * 22.0;
  float stormNoise = fbm(vec2(vUv.x * 28.0 + uTime * 0.012, lat * 0.85));
  float microSwirl = noise(vec2(vUv.x * 64.0 - uTime * 0.02, lat * 3.5));
  float fineBand = sin(lat * 3.14159 * 2.2 + stormNoise * 1.8 + microSwirl * 0.3) * 0.5 + 0.5;

  // Masterpiece Obsidian & Midnight-Navy Color Palette:
  // Deep midnight-blue / obsidian black (#020611), subtle dark-navy bands, and micro-bioluminescent specks
  vec3 colObsidian   = vec3(0.008, 0.024, 0.067); // #020611 base obsidian
  vec3 colDeepNavy   = vec3(0.016, 0.042, 0.105); // Subtle midnight-navy atmospheric band
  vec3 colDarkTeal   = vec3(0.022, 0.065, 0.135); // Delicate deep-ocean blue luminescence
  vec3 colGlintCyan  = vec3(0.10, 0.65, 1.0);    // Electric-blue bioluminescent storm nodes

  // Subtle low-contrast atmospheric structure
  vec3 surfaceColor = mix(colObsidian, colDeepNavy, fineBand * 0.40);
  surfaceColor = mix(surfaceColor, colDarkTeal, stormNoise * 0.30);

  // Micro-bioluminescent surface luminescence (subtle cyan/electric-blue clusters on dark hemisphere)
  float glintHash = hash(floor(vUv * vec2(380.0, 190.0)));
  float glintMask = step(0.9982, glintHash);
  float glintPulse = sin(uTime * 1.8 + glintHash * 40.0) * 0.5 + 0.5;
  vec3 bioluminescence = colGlintCyan * glintMask * glintPulse * 3.2;

  // 2. Direct Sunlight (Diffuse with soft penumbra)
  float NdotL = dot(N, L);
  float diff = smoothstep(-0.15, 0.22, NdotL);

  // 3. Ring Shadow Projection onto Planet
  float ringShadow = 1.0;
  if (abs(L.y) > 0.001) {
    float tRing = -vWorldPosition.y / L.y;
    if (tRing > 0.0) {
      vec3 ringHit = vWorldPosition + tRing * L;
      float rRing = length(ringHit.xz);
      if (rRing >= uRingInner && rRing <= uRingOuter) {
        float gapHarmonics = sin(rRing * 14.0) * 0.5 + 0.5;
        ringShadow = mix(0.08, 0.40, gapHarmonics);
      }
    }
  }

  // 4. Nightside Soft Ringshine & Midnight-Navy Ambient
  float nightside = smoothstep(0.05, -0.45, NdotL);
  float ringshineAngle = abs(N.y);
  vec3 ringshineColor = vec3(0.08, 0.16, 0.28) * ringshineAngle * 0.40 * nightside;
  vec3 obsidianShadow = colObsidian * (1.0 - diff);

  // 5. Atmospheric Rayleigh Scattering & Electric-Cyan Rim Grazing
  float fresnel = 1.0 - max(0.0, dot(N, V));
  float rim = pow(fresnel, 4.6);
  float forwardScatter = pow(max(0.0, dot(V, -L)), 3.0) * 1.6 + max(0.0, NdotL) * 0.45;
  vec3 atmosphereGlow = vec3(0.05, 0.82, 1.0) * rim * forwardScatter * 3.8;

  // 6. Combine Cinematic Illumination
  vec3 litSurface = surfaceColor * uSunColor * diff * ringShadow;
  vec3 finalColor = litSurface + ringshineColor + obsidianShadow + atmosphereGlow + bioluminescence;

  gl_FragColor = vec4(finalColor, 1.0);
}
