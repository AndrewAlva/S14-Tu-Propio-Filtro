// Tornasol · vértice
// El cristal se tuerce como una toalla (la punta gira más que la base)
// y respira: una onda que sube por el cuerpo y lo ensancha.

uniform float uTiempo;
uniform float uAlto;
varying vec3 vPosMundo;
varying float vAltura;

void main() {
  vec3 p = position;
  float h = p.y / uAlto;

  p.xz = giro(sin(uTiempo * 0.8) * 0.9 * h) * p.xz;         // torsión: más ángulo mientras más alto
  p.xz *= 1.0 + 0.05 * sin(uTiempo * 2.2 - h * 7.0);         // respiración: una onda que sube

  vec4 mundo = modelMatrix * vec4(p, 1.0);
  vPosMundo = mundo.xyz;
  vAltura = h;
  gl_Position = projectionMatrix * viewMatrix * mundo;
}
