uniform float uTime;
uniform float uRadius;
uniform float uIntensity;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vec3 norm = normalize(vNormal);
  vec3 viewDir = normalize(cameraPosition - vPosition);

  // Shockwave rim glow
  float fresnel = 1.0 - abs(dot(norm, viewDir));
  float rim = pow(fresnel, 3.0);

  // Chromatic shock colors: electric cyan to violet
  vec3 shockColor = mix(vec3(0.0, 0.95, 1.0), vec3(1.0, 0.4, 0.9), fresnel);

  float alpha = rim * uIntensity;
  gl_FragColor = vec4(shockColor * 1.8, alpha);
}
