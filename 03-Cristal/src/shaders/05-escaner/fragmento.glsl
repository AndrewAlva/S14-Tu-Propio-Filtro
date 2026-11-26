// Escáner · fragmento
// La malla de neón: un pixel está sobre una línea cuando alguna de sus tres
// coordenadas baricéntricas es casi 0 (está pegado a una orilla del triángulo).
// fwidth mide cuánto cambia vBari de un pixel al vecino: así la línea mide
// lo mismo de cerca que de lejos.

uniform float uTiempo;
varying vec3 vPosMundo;
varying vec3 vBari;
varying float vAltura;
varying float vAnillo;

void main() {
  vec3 grosor = fwidth(vBari) * 1.4;
  vec3 a = smoothstep(vec3(0.0), grosor, vBari);
  float linea = 1.0 - min(min(a.x, a.y), a.z);

  vec3 n = normalize(cross(dFdx(vPosMundo), dFdy(vPosMundo)));
  vec3 v = normalize(cameraPosition - vPosMundo);
  float canto = pow(1.0 - abs(dot(n, v)), 2.5);

  vec3 tono = mix(vec3(0.1, 0.9, 1.0), vec3(1.0, 0.15, 0.75), vAltura);   // cian abajo, magenta arriba
  vec3 color = vec3(0.01, 0.015, 0.03) + tono * canto * 0.45;            // el cuerpo, casi negro
  color += tono * linea * (0.22 + vAnillo * 2.4);                         // la malla, más viva en el anillo
  color += vec3(1.0) * linea * vAnillo * 0.6 + tono * vAnillo * 0.15;
  gl_FragColor = vec4(color, 1.0);
}
