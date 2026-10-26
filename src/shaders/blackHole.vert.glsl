varying vec3 vWorldPosition;
varying vec3 vRayDirection;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  vRayDirection = worldPos.xyz - cameraPosition;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
