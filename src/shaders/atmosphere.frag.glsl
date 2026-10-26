uniform vec3 uSunDirection;
uniform vec3 uAtmosphereColor;
uniform vec3 uSunColor;

varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorldPosition);
  vec3 L = normalize(uSunDirection);

  // Atmospheric limb Fresnel
  float fresnel = 1.0 - max(0.0, dot(N, V));
  float rim = pow(fresnel, 4.0);

  // Forward sunlight scattering in atmosphere
  float sunFacing = max(0.0, dot(N, L));
  float forwardGlow = pow(max(0.0, dot(V, -L)), 3.0) * 1.5 + sunFacing;

  vec3 color = mix(uAtmosphereColor, uSunColor, 0.45) * forwardGlow * 2.5;
  float alpha = rim * smoothstep(-0.2, 0.4, dot(N, L));

  gl_FragColor = vec4(color, alpha);
}
