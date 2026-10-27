uniform vec3 uSunDirection;
uniform vec3 uAtmosphereColor;
uniform vec3 uSunColor;

varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorldPosition);
  vec3 L = normalize(uSunDirection);

  // 1. High-exponent atmospheric limb Fresnel (razor-sharp electric-cyan edge)
  float NdotV = max(0.0, dot(N, V));
  float fresnel = 1.0 - NdotV;
  float rim = pow(fresnel, 5.5);

  // 2. Anisotropic forward starlight scattering (Mie & Rayleigh)
  float VdotMinusL = max(0.0, dot(V, -L));
  float forwardGlow = pow(VdotMinusL, 3.8) * 3.4;
  float sunFacing = max(0.0, dot(N, L));

  // Electric-cyan to blue-white core gradient
  vec3 cyanBase = vec3(0.12, 0.75, 1.25);
  vec3 whiteHotCore = vec3(0.85, 0.96, 1.00);
  vec3 rimColor = mix(cyanBase, whiteHotCore, clamp(forwardGlow * 0.30, 0.0, 1.0));

  // Blend with uniform color
  vec3 color = mix(uAtmosphereColor, rimColor, 0.82) * (forwardGlow + sunFacing * 0.75 + 0.15) * 2.8;

  // Luminous alpha: brightest where starlight grazes the upper limb, soft falloff into shadow
  float grazingFactor = smoothstep(-0.35, 0.45, dot(N, L));
  float alpha = rim * (grazingFactor * 0.88 + 0.12);
  alpha = clamp(alpha * 1.4, 0.0, 0.95);

  gl_FragColor = vec4(color, alpha);
}
