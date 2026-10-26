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
  for (int i = 0; i < 4; ++i) {
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

  // 1. Planetary Cloud Bands (Gas Giant Atmosphere)
  float lat = vUv.y * 18.0;
  float bandNoise = fbm(vec2(vUv.x * 24.0 + uTime * 0.015, lat * 0.8));
  float fineBand = sin(lat * 3.14159 * 2.5 + bandNoise * 2.0) * 0.5 + 0.5;

  // Cinematic color palette: champagne, warm bronze, pearl white, deep amber ochre
  vec3 colA = vec3(0.96, 0.90, 0.82); // Pearl champagne
  vec3 colB = vec3(0.82, 0.68, 0.52); // Warm bronze/ochre
  vec3 colC = vec3(0.65, 0.52, 0.40); // Deep shadow band
  vec3 colD = vec3(0.98, 0.95, 0.90); // White storm rift

  vec3 surfaceColor = mix(colB, colA, fineBand);
  surfaceColor = mix(surfaceColor, colC, smoothstep(0.6, 0.9, bandNoise));
  surfaceColor = mix(surfaceColor, colD, smoothstep(0.85, 0.98, bandNoise * fineBand));

  // 2. Direct Sunlight (Diffuse)
  float NdotL = dot(N, L);
  float diff = smoothstep(-0.08, 0.25, NdotL);

  // 3. Ring Shadow Projection onto Planet
  // Cast ray from vWorldPosition towards Sun: P(t) = P + t * L.
  // Intersection with equatorial plane y = 0 occurs when: vWorldPosition.y + t * L.y = 0 => t = -vWorldPosition.y / L.y
  float ringShadow = 1.0;
  if (abs(L.y) > 0.001) {
    float tRing = -vWorldPosition.y / L.y;
    if (tRing > 0.0) {
      vec3 ringHit = vWorldPosition + tRing * L;
      float rRing = length(ringHit.xz);
      if (rRing >= uRingInner && rRing <= uRingOuter) {
        // Shadow density variation across ring gaps
        float gapNoise = sin(rRing * 12.0) * 0.5 + 0.5;
        ringShadow = mix(0.12, 0.45, gapNoise);
      }
    }
  }

  // 4. Nightside Soft Ringshine
  // The illuminated rings above reflect soft ambient light back onto the night side
  float nightside = smoothstep(0.05, -0.4, NdotL);
  float ringshineAngle = abs(N.y); // Strongest near poles/mid-latitudes facing the rings
  vec3 ringshineColor = vec3(0.38, 0.32, 0.25) * ringshineAngle * 0.45 * nightside;

  // 5. Atmospheric Rayleigh Scattering & Golden Rim Glow
  float fresnel = 1.0 - max(0.0, dot(N, V));
  float rim = pow(fresnel, 3.2);
  // Rim is much brighter on the sunward side (forward scattering in atmosphere)
  float forwardScatter = pow(max(0.0, dot(V, -L)), 2.0) * 0.7 + max(0.0, NdotL) * 0.5;
  vec3 atmosphereGlow = vec3(1.0, 0.88, 0.65) * rim * forwardScatter * 2.8;

  // 6. Combine All Lighting
  vec3 litSurface = surfaceColor * uSunColor * diff * ringShadow;
  vec3 finalColor = litSurface + ringshineColor + atmosphereGlow;

  gl_FragColor = vec4(finalColor, 1.0);
}
