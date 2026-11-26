// Tornasol · fragmento
// Iridiscencia, como una pompa de jabón o un ópalo: el color depende del ángulo
// con que miras cada cara. Encima, un brillo especular y destellos que titilan.

uniform float uTiempo;
varying vec3 vPosMundo;
varying float vAltura;

void main() {
  vec3 n = normalize(cross(dFdx(vPosMundo), dFdy(vPosMundo)));
  vec3 v = normalize(cameraPosition - vPosMundo);
  if (dot(n, v) < 0.0) n = -n;
  float canto = 1.0 - max(dot(n, v), 0.0);

  // un número por pixel → un degradado completo con la paleta de coseno
  float t = canto * 1.4 + vAltura * 0.5 + dot(n, vec3(0.4, 0.6, 0.2)) * 0.6 + uTiempo * 0.06;
  vec3 iris = paleta(t, vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.0, 0.33, 0.67));

  vec3 luz = normalize(vec3(0.4, 0.9, 0.5));
  float brillo = pow(max(dot(reflect(-luz, n), v), 0.0), 48.0);
  float chispa = step(0.995, azar(floor(vPosMundo * 70.0) + floor(uTiempo * 4.0)));

  vec3 color = mix(vec3(0.03, 0.03, 0.06), iris, 0.25 + canto * 1.1);
  color += brillo * 2.5 + chispa * 3.0;
  gl_FragColor = vec4(color, 1.0);
}
