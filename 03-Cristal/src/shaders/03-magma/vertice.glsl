// Magma · vértice
// La superficie burbujea: un ruido que sube con el tiempo empuja cada vértice
// hacia afuera o hacia adentro. La base se queda quieta, pegada al musgo.

uniform float uTiempo;
uniform float uAlto;
varying vec3 vPosMundo;
varying vec3 vPosLocal;
varying float vAltura;
varying float vBurbuja;

void main() {
  vec3 p = position;
  float h = p.y / uAlto;
  vec3 haciaAfuera = normalize(vec3(p.x, 0.0, p.z) + 1e-5);

  float burbuja = fbm(p * 2.2 + vec3(0.0, -uTiempo * 0.9, 0.0));
  p += haciaAfuera * (burbuja - 0.45) * 0.28 * smoothstep(0.0, 0.1, h);

  vec4 mundo = modelMatrix * vec4(p, 1.0);
  vPosMundo = mundo.xyz;
  vPosLocal = position;
  vAltura = h;
  vBurbuja = burbuja;                                        // el fragmento sabe dónde está más caliente
  gl_Position = projectionMatrix * viewMatrix * mundo;
}
