// Holograma · fragmento
// Transparente de frente y brillante de canto (fresnel), con líneas de barrido
// que suben, una franja de escaneo y un parpadeo de vez en cuando.
// Se dibuja con mezcla aditiva: la luz se suma a lo que hay detrás.

uniform float uTiempo;
varying vec3 vPosMundo;
varying float vAltura;

void main() {
  // La normal de cada cara, calculada aquí mismo con derivadas:
  // cuánto cambia la posición entre un pixel y su vecino. Así se ven las facetas.
  vec3 n = normalize(cross(dFdx(vPosMundo), dFdy(vPosMundo)));
  vec3 v = normalize(cameraPosition - vPosMundo);
  float canto = pow(1.0 - abs(dot(n, v)), 2.0);              // fresnel: 0 de frente, 1 de canto

  float lineas = pow(0.5 + 0.5 * sin(vPosMundo.y * 90.0 - uTiempo * 5.0), 6.0);
  float escaneo = 1.0 - smoothstep(0.0, 0.05, abs(fract(vAltura * 0.8 - uTiempo * 0.35) - 0.5));
  float parpadeo = 1.0 - 0.6 * step(0.92, azar(vec3(floor(uTiempo * 14.0), 0.0, 3.0)));

  vec3 cian = vec3(0.15, 0.85, 1.0);
  float luz = (0.07 + canto * 1.2 + lineas * 0.35 + escaneo * 0.9) * parpadeo;
  gl_FragColor = vec4(cian * luz * 1.6, luz);
}
