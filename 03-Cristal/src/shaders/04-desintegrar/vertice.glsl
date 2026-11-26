// Desintegrar · vértice
// Cada triángulo es una pieza suelta (por eso la geometría es "no indexada").
// Un frente baja desde la punta: cuando llega a un triángulo, este gira,
// se encoge hacia su centro, sale despedido y sube como ceniza.
// uProgreso (0 = entero, 1 = polvo) lo mueve Cristal.js en un ciclo.

attribute vec3 aCentro;   // el centro de su triángulo
attribute vec3 aCara;     // hacia dónde mira su triángulo
attribute float aAzar;    // un número propio de su triángulo

uniform float uTiempo;
uniform float uAlto;
uniform float uProgreso;
varying vec3 vPosMundo;
varying float vVuelo;
varying float vAviso;

void main() {
  float h = aCentro.y / uAlto;
  float turno = uProgreso * 2.5 - (1.0 - h) * 1.2 - aAzar * 0.3;   // la punta primero, con un poco de azar
  float t = clamp(turno, 0.0, 1.0);

  vec3 local = position - aCentro;                     // el vértice, visto desde el centro de su triángulo
  local.xz = giro(t * 9.0 * (aAzar - 0.5)) * local.xz; // gira
  local *= 1.0 - t;                                    // se encoge
  vec3 vuelo = aCara * t * 1.1                         // sale hacia afuera
             + vec3(0.0, t * t * 2.6, 0.0)             // sube como ceniza
             + vec3(sin(aAzar * 50.0), 0.0, cos(aAzar * 50.0)) * t * 0.5;   // y se dispersa

  vec4 mundo = modelMatrix * vec4(aCentro + local + vuelo, 1.0);
  vPosMundo = mundo.xyz;
  vVuelo = t;
  vAviso = clamp((turno + 0.25) / 0.25, 0.0, 1.0);    // se enciende un instante antes de soltarse
  gl_Position = projectionMatrix * viewMatrix * mundo;
}
