// Desintegrar · fragmento
// El cristal entero es verde y facetado. Justo antes de soltarse, cada pieza
// se enciende como brasa, y se apaga mientras vuela. Al final, discard: ya no existe.

varying vec3 vPosMundo;
varying float vVuelo;
varying float vAviso;

void main() {
  if (vVuelo > 0.98) discard;                          // polvo: no se dibuja

  vec3 n = normalize(cross(dFdx(vPosMundo), dFdy(vPosMundo)));
  vec3 v = normalize(cameraPosition - vPosMundo);
  if (dot(n, v) < 0.0) n = -n;

  float luzCara = 0.35 + 0.65 * max(dot(n, normalize(vec3(0.3, 1.0, 0.5))), 0.0);
  float canto = pow(1.0 - max(dot(n, v), 0.0), 2.0);
  vec3 cristal = vec3(0.35, 1.0, 0.65) * luzCara * 0.55 + vec3(0.2, 1.0, 0.6) * canto * 0.9;

  vec3 brasa = mix(vec3(0.2, 1.0, 0.75), vec3(1.0, 0.95, 0.65), vVuelo) * 1.8;
  float encendido = vAviso * (1.0 - smoothstep(0.3, 0.95, vVuelo));
  gl_FragColor = vec4(mix(cristal, brasa, encendido), 1.0);
}
