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

  // Masterpiece Hollywood Color Palette:
  // Golden-brown mineral tones, pale champagne, rich bronze, copper, pearl-white storm rifts, midnight-blue shadows
  vec3 colChampagne = vec3(0.97, 0.92, 0.84); // Champagne gold clouds
  vec3 colBronze    = vec3(0.84, 0.70, 0.52); // Warm bronze mineral band
  vec3 colCopper    = vec3(0.72, 0.54, 0.38); // Pale copper / deep ochre
  vec3 colShadow    = vec3(0.06, 0.08, 0.16); // Deep midnight-blue shadow base
  vec3 colWhiteRift = vec3(1.00, 0.98, 0.95); // Luminous white cloud rift

  vec3 surfaceColor = mix(colBronze, colChampagne, fineBand);
  surfaceColor = mix(surfaceColor, colCopper, smoothstep(0.55, 0.88, stormNoise));
  surfaceColor = mix(surfaceColor, colWhiteRift, smoothstep(0.82, 0.96, stormNoise * fineBand));

  // 2. Direct Sunlight (Diffuse with soft penumbra)
  float NdotL = dot(N, L);
  float diff = smoothstep(-0.12, 0.28, NdotL);

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
  vec3 ringshineColor = vec3(0.35, 0.30, 0.24) * ringshineAngle * 0.45 * nightside;
  vec3 midnightBlueShadow = colShadow * (1.0 - diff);

  // 5. Atmospheric Rayleigh Scattering & Golden-White Rim Grazing
  float fresnel = 1.0 - max(0.0, dot(N, V));
  float rim = pow(fresnel, 3.4);
  float forwardScatter = pow(max(0.0, dot(V, -L)), 2.2) * 0.85 + max(0.0, NdotL) * 0.55;
  vec3 atmosphereGlow = vec3(1.0, 0.90, 0.72) * rim * forwardScatter * 3.2;

  // 6. Combine Cinematic Illumination
  vec3 litSurface = surfaceColor * uSunColor * diff * ringShadow;
  vec3 finalColor = litSurface + ringshineColor + midnightBlueShadow + atmosphereGlow;

  gl_FragColor = vec4(finalColor, 1.0);
}
