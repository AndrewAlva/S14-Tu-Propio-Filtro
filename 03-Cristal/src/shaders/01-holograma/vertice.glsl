// Holograma · vértice
// Glitch: el cristal está partido en franjas horizontales; unas cuantas,
// al azar, se corren de lado unos milisegundos. Como una señal que se pierde.

uniform float uTiempo;
uniform float uAlto;
varying vec3 vPosMundo;
varying float vAltura;

void main() {
  vec3 p = position;
  float h = p.y / uAlto;                                    // 0 en el pie, 1 en la punta

  float franja = floor(h * 26.0);                            // en qué franja está este vértice
  float momento = floor(uTiempo * 9.0);                      // el azar cambia 9 veces por segundo
  float falla = step(0.9, azar(vec3(franja, momento, 1.0))); // 1 de cada 10 franjas falla
  p.x += falla * (azar(vec3(franja, momento, 2.0)) - 0.5) * 0.4;

  vec4 mundo = modelMatrix * vec4(p, 1.0);
  vPosMundo = mundo.xyz;
  vAltura = h;
  gl_Position = projectionMatrix * viewMatrix * mundo;
}
