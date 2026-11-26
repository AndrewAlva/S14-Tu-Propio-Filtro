// Magma · fragmento
// Costra negra con venas de lava que fluyen hacia arriba.
// El truco es deformar el ruido con otro ruido (domain warping): así parece líquido.

uniform float uTiempo;
varying vec3 vPosMundo;
varying vec3 vPosLocal;
varying float vAltura;
varying float vBurbuja;

void main() {
  vec3 n = normalize(cross(dFdx(vPosMundo), dFdy(vPosMundo)));
  vec3 v = normalize(cameraPosition - vPosMundo);
  if (dot(n, v) < 0.0) n = -n;

  vec3 q = vPosLocal * 2.0 + vec3(0.0, -uTiempo * 0.35, 0.0);
  float deformar = fbm(q * 1.3 + uTiempo * 0.15);
  float flujo = fbm(q + deformar * 1.8);
  float venas = 1.0 - smoothstep(0.0, 0.045, abs(flujo - 0.5));   // una línea donde el flujo cruza 0.5

  float calor = smoothstep(0.5, 0.8, vBurbuja) * 0.35 + venas;
  calor *= 0.8 + 0.2 * sin(uTiempo * 3.0 + vAltura * 10.0);      // late

  vec3 luz = normalize(vec3(0.3, 1.0, 0.4));
  vec3 costra = vec3(0.06, 0.035, 0.03) * (0.4 + 0.6 * max(dot(n, luz), 0.0));
  vec3 fuego = mix(vec3(0.9, 0.12, 0.01), vec3(1.0, 0.7, 0.2), venas) * 2.2;
  vec3 color = mix(costra, fuego, clamp(calor, 0.0, 1.0));
  color += vec3(1.0, 0.3, 0.05) * pow(1.0 - max(dot(n, v), 0.0), 3.0) * 0.5;   // halo de calor en los cantos
  gl_FragColor = vec4(color, 1.0);
}
