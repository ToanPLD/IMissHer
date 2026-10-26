uniform vec3 uCamPos;
uniform float uRs;               // Schwarzschild radius
uniform float uSpin;             // Kerr spin parameter a in [0.0, 0.998]
uniform float uAccretionDensity; // Accretion disk density multiplier
uniform float uDopplerEnabled;   // 1.0 or 0.0
uniform float uCutawayEnabled;   // 1.0 or 0.0
uniform float uTime;
uniform vec2 uResolution;

varying vec3 vWorldPosition;
varying vec3 vRayDirection;

#define PI 3.14159265359
#define MAX_STEPS 160
#define ESCAPE_RADIUS 30.0

// Procedural hash & noise
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float hash3(vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
}

// 2D Simplex/Value noise for disk textures
float noise2d(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

// Fractional Brownian Motion for plasma clouds
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  vec2 shift = vec2(100.0);
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 4; ++i) {
    v += a * noise2d(p);
    p = rot * p * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

// Background starfield with lensed stars & subtle nebula
vec3 getBackgroundSky(vec3 dir) {
  // Normalize
  vec3 d = normalize(dir);
  
  // Star generation via 3D grid hash
  vec3 p = d * 180.0;
  float n = hash3(floor(p));
  float star = step(0.985, n) * pow(hash3(floor(p) + 0.1), 16.0) * 2.5;

  // Cosmic nebula gradient
  float nebulaNoise = fbm(vec2(atan(d.z, d.x) * 3.0, d.y * 3.0));
  vec3 nebulaCol = mix(vec3(0.01, 0.02, 0.06), vec3(0.08, 0.03, 0.12), nebulaNoise);

  return nebulaCol + vec3(star);
}

void main() {
  vec3 rayOrigin = uCamPos;
  vec3 rayDir = normalize(vRayDirection);

  vec3 pos = rayOrigin;
  vec3 dir = rayDir;

  vec4 accumColor = vec4(0.0);
  float rs = max(0.2, uRs);

  // ISCO inner boundary depends on spin
  float rIsco = rs * mix(3.0, 1.2, uSpin);
  float rDiskOut = rs * 10.5;

  // Step variables
  float minDistanceToCenter = 999.0;
  bool hitHorizon = false;

  for (int i = 0; i < MAX_STEPS; i++) {
    float r = length(pos);
    minDistanceToCenter = min(minDistanceToCenter, r);

    // 1. Check Event Horizon Absorption
    if (r <= rs) {
      // Cutaway check: if cutaway is enabled, open a 90-degree quadrant (x > 0 && z > 0)
      if (uCutawayEnabled > 0.5 && pos.x > 0.0 && pos.z > 0.0) {
        // Interior visual: Spacetime funnel grid & glowing singularity core
        float grid = abs(sin(r * 15.0)) * abs(cos(atan(pos.z, pos.x) * 12.0));
        vec3 interiorCol = mix(vec3(0.02, 0.08, 0.2), vec3(0.0, 0.9, 1.0), pow(grid, 4.0));
        
        // Singularity at r -> 0
        float sing = exp(-r * 8.0);
        interiorCol += vec3(1.0, 0.9, 0.8) * sing * 4.0;
        
        accumColor.rgb += interiorCol * (1.0 - accumColor.a) * 0.4;
        accumColor.a += 0.4 * (1.0 - accumColor.a);
      } else {
        hitHorizon = true;
        break;
      }
    }

    // 2. Check Escape boundary
    if (r > ESCAPE_RADIUS) {
      break;
    }

    // 3. Adaptive Step Size
    // Smaller steps near the photon sphere (1.5 * Rs) and event horizon
    float dt = clamp((r - rs * 0.95) * 0.15, 0.03, 0.45);

    // 4. Sample Accretion Disk (Equatorial plane y ~ 0)
    float diskHalfHeight = 0.035 * r;
    if (abs(pos.y) < diskHalfHeight && r >= rIsco && r <= rDiskOut) {
      // Cylindrical coordinates
      float phi = atan(pos.z, pos.x);
      
      // Differential Keplerian rotation: inner rotates faster than outer
      float omega = 1.8 / pow(r / rs, 1.5);
      float rotPhi = phi + omega * uTime * 1.5;

      // Sample multi-scale turbulence
      vec2 diskUV = vec2(r * 2.0, rotPhi * 4.0);
      float pattern = fbm(diskUV);
      float subPattern = noise2d(diskUV * 3.5 + uTime * 0.5);
      float density = smoothstep(rIsco, rIsco + 0.3 * rs, r) *
                      smoothstep(rDiskOut, rDiskOut - 1.5 * rs, r) *
                      pow(pattern * 0.7 + subPattern * 0.3, 1.4);

      // Height attenuation
      float verticalFalloff = 1.0 - abs(pos.y) / diskHalfHeight;
      density *= pow(verticalFalloff, 1.5) * uAccretionDensity * 0.25;

      if (density > 0.001) {
        // Temperature gradient: inner disk is hot electric white-cyan-amber, outer is deep red
        float tempNorm = clamp((r - rIsco) / (rDiskOut - rIsco), 0.0, 1.0);
        vec3 hotColor = vec3(1.0, 0.92, 0.75);
        vec3 midColor = vec3(1.0, 0.55, 0.1);
        vec3 coldColor = vec3(0.7, 0.15, 0.02);
        vec3 emitColor = mix(mix(hotColor, midColor, smoothstep(0.0, 0.4, tempNorm)), coldColor, smoothstep(0.4, 1.0, tempNorm));

        // Relativistic Doppler Beaming
        if (uDopplerEnabled > 0.5) {
          // Tangential orbital velocity vector in xz-plane
          vec3 vOrb = normalize(vec3(-sin(phi), 0.0, cos(phi)));
          float beta = min(0.65, sqrt(0.5 * rs / r)); // Relativistic speed
          float cosTheta = dot(vOrb, -dir);
          float gamma = 1.0 / sqrt(max(0.01, 1.0 - beta * beta));
          float dopplerFactor = 1.0 / (gamma * (1.0 - beta * cosTheta));
          
          // Doppler beaming boosts intensity ~ delta^3.5 and blue-shifts emission
          float boost = clamp(pow(dopplerFactor, 3.5), 0.1, 4.5);
          emitColor *= boost;
          if (dopplerFactor > 1.2) {
            emitColor = mix(emitColor, vec3(0.8, 0.95, 1.2), (dopplerFactor - 1.2) * 0.6);
          }
        }

        // Gravitational Redshift
        float gravFactor = sqrt(max(0.05, 1.0 - rs / r));
        emitColor *= gravFactor;

        // Front-to-back alpha blending
        float alpha = clamp(density * 1.5, 0.0, 0.95);
        accumColor.rgb += emitColor * alpha * (1.0 - accumColor.a);
        accumColor.a += alpha * (1.0 - accumColor.a);

        if (accumColor.a > 0.98) break;
      }
    }

    // 5. Gravitational Ray Bending (Schwarzschild Geodesic Acceleration)
    // a = -1.5 * Rs / r^5 * (pos x (dir x pos))
    vec3 crossDirPos = cross(dir, pos);
    vec3 accel = -1.5 * rs * cross(pos, crossDirPos) / pow(r, 5.0);

    dir = normalize(dir + accel * dt);
    pos += dir * dt;
  }

  // 6. Photon Ring Glow enhancement
  float photonSphereRadius = 1.5 * rs;
  float photonDist = abs(minDistanceToCenter - photonSphereRadius);
  float photonRing = exp(-photonDist * 16.0 / rs) * 0.8;
  vec3 photonColor = vec3(1.0, 0.85, 0.5) * photonRing;
  accumColor.rgb += photonColor * (1.0 - accumColor.a);

  // 7. Event Horizon Black Shadow or Background
  if (hitHorizon) {
    // Pitch black shadow of the event horizon
    gl_FragColor = vec4(accumColor.rgb, 1.0);
  } else {
    // Add lensed background starfield
    vec3 skyColor = getBackgroundSky(dir);
    vec3 finalColor = accumColor.rgb + skyColor * (1.0 - accumColor.a);
    gl_FragColor = vec4(finalColor, 1.0);
  }
}
