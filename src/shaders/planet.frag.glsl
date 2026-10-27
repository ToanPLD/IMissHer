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
  // Colossal dark gas giant with midnight-blue bands and subsurface cyan luminescence
  vec3 colObsidian      = vec3(0.008, 0.012, 0.024); // Deep obsidian black base
  vec3 colMidnightNavy  = vec3(0.018, 0.035, 0.075); // Subtle deep-navy atmospheric band
  vec3 colSubtleSlate   = vec3(0.038, 0.068, 0.125); // Barely visible swirling cloud structures
  vec3 colCyanLuminescence = vec3(0.14, 0.68, 1.05); // Delicate electric-cyan luminescence beneath dark clouds
  vec3 colShadow        = vec3(0.003, 0.005, 0.012); // Deep vacuum shadow

  vec3 surfaceColor = mix(colObsidian, colMidnightNavy, fineBand);
  surfaceColor = mix(surfaceColor, colSubtleSlate, smoothstep(0.58, 0.90, stormNoise) * 0.65);

  // Subsurface electric-cyan bioluminescent luminescence beneath storm rifts
  float luminescenceMask = pow(smoothstep(0.68, 0.94, stormNoise * (1.0 - fineBand * 0.35)), 2.8);
  vec3 subsurfaceGlow = colCyanLuminescence * luminescenceMask * 0.60;
  surfaceColor += subsurfaceGlow;

  // 2. Direct Sunlight (Diffuse with sharp physical terminator)
  float NdotL = dot(N, L);
  float diff = smoothstep(-0.04, 0.30, NdotL);

  // 3. Ring Shadow Projection onto Planet
  float ringShadow = 1.0;
  if (abs(L.y) > 0.001) {
    float tRing = -vWorldPosition.y / L.y;
    if (tRing > 0.0) {
      vec3 ringHit = vWorldPosition + tRing * L;
      float rRing = length(ringHit.xz);
      if (rRing >= uRingInner && rRing <= uRingOuter) {
        float gapHarmonics = sin(rRing * 14.0) * 0.5 + 0.5;
        ringShadow = mix(0.04, 0.35, gapHarmonics);
      }
    }
  }

  // 4. Nightside Soft Ringshine & Midnight-Navy Ambient
  float nightside = smoothstep(0.05, -0.45, NdotL);
  float ringshineAngle = abs(N.y);
  vec3 ringshineColor = vec3(0.12, 0.20, 0.35) * ringshineAngle * 0.40 * nightside;
  vec3 midnightBlueShadow = colShadow * (1.0 - diff);

  // 5. Atmospheric Rayleigh Scattering & Electric-Cyan Rim Grazing
  float fresnel = 1.0 - max(0.0, dot(N, V));
  float rim = pow(fresnel, 4.2);
  float forwardScatter = pow(max(0.0, dot(V, -L)), 2.8) * 1.10 + max(0.0, NdotL) * 0.45;
  vec3 atmosphereGlow = vec3(0.18, 0.82, 1.25) * rim * forwardScatter * 3.8;

  // 6. Combine Cinematic Illumination
  vec3 litSurface = surfaceColor * uSunColor * diff * ringShadow;
  vec3 finalColor = litSurface + ringshineColor + midnightBlueShadow + atmosphereGlow;

  gl_FragColor = vec4(finalColor, 1.0);
}
