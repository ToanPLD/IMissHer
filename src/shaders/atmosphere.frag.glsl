uniform vec3 uSunDirection;
uniform vec3 uAtmosphereColor;
uniform vec3 uSunColor;

varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorldPosition);
  vec3 L = normalize(uSunDirection);

  // 1. Razor-sharp atmospheric limb Fresnel
  float fresnel = 1.0 - max(0.0, dot(N, V));
  float rim = pow(fresnel, 5.2);

  // 2. Forward starlight scattering in atmosphere (brightest where light grazes the edge)
  float forwardGlow = pow(max(0.0, dot(V, -L)), 3.8) * 3.4 + max(0.0, dot(N, L)) * 0.40;

  // 3. Faint blue atmospheric scattering along the lower curved edge
  float lowerLimbScatter = pow(fresnel, 3.4) * 0.14;

  // 4. Electric-cyan & icy-white core halo
  vec3 electricCyan = vec3(0.0, 0.88, 1.0);
  vec3 icyWhite = vec3(0.85, 0.98, 1.0);
  vec3 haloColor = mix(electricCyan, icyWhite, clamp(forwardGlow * 0.32, 0.0, 1.0)) * (forwardGlow * 2.8 + 0.35);

  float alpha = clamp(rim * (forwardGlow * 1.5 + 0.25) + lowerLimbScatter, 0.0, 0.98);

  gl_FragColor = vec4(haloColor, alpha);
}
