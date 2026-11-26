// Escáner · vértice
// Un anillo sube por el cristal y empuja la malla hacia afuera a su paso.
// La forma del anillo es una campana: 1 justo en el anillo, 0 lejos de él.

attribute vec3 aBari;     // (1,0,0), (0,1,0) o (0,0,1): qué esquina de su triángulo es

uniform float uTiempo;
uniform float uAlto;
varying vec3 vPosMundo;
varying vec3 vBari;
varying float vAltura;
varying float vAnillo;

void main() {
  vec3 p = position;
  float h = p.y / uAlto;

  float sube = fract(uTiempo * 0.22);                       // dónde va el anillo: sube y vuelve a empezar
  float anillo = exp(-pow((h - sube) * 14.0, 2.0));         // la campana
  p.xz *= 1.0 + anillo * 0.22;

  vec4 mundo = modelMatrix * vec4(p, 1.0);
  vPosMundo = mundo.xyz;
  vBari = aBari;           // al interpolarse, dice qué tan cerca está cada pixel de cada esquina
  vAltura = h;
  vAnillo = anillo;
  gl_Position = projectionMatrix * viewMatrix * mundo;
}
