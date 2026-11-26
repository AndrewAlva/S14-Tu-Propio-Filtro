// Haz de sol · vértices
// Pasa al fragmento lo que necesita para decidir cuánta luz hay en cada punto del cono.

varying vec2 vUv;
varying vec3 vNormalVista;
varying vec3 vPosVista;

void main() {
  vUv = uv;
  vec4 posVista = modelViewMatrix * vec4(position, 1.0);
  vPosVista = posVista.xyz;
  vNormalVista = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * posVista;
}
