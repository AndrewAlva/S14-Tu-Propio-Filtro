// UV · fragmento
// Un ayudante, no un efecto: pinta en la superficie las coordenadas de textura.
// Es el checker de prueba que pones en Blender antes de texturizar.

uniform float uDesenvolver;
uniform float uBarrido;    // la v que recorre la línea blanca; el mapa dibuja la misma
uniform vec2 uPunto;       // la (u, v) bajo el mouse
uniform float uHayPunto;   // 1 si el mouse está sobre el cristal
varying vec2 vUv;
varying vec3 vPosMundo;

// 1 sobre x = 0 y 0 lejos de ahí, con el grosor medido en píxeles (fwidth)
float linea(float x, float grosor) {
  return 1.0 - smoothstep(0.0, fwidth(x) * grosor, abs(x));
}

void main() {
  // 1 · u pinta rojo y v pinta verde: (0,0) es negro, (1,1) es amarillo
  vec3 color = vec3(vUv, 0.3) * 0.75;

  // 2 · un cuadro por cara a lo ancho (6) y doce a lo alto
  vec2 rejilla = vUv * vec2(6.0, 12.0);
  float cuadro = mod(floor(rejilla.x) + floor(rejilla.y), 2.0);
  color *= 0.55 + 0.45 * cuadro;
  vec2 orilla = abs(fract(rejilla - 0.5) - 0.5) / fwidth(rejilla);
  color = mix(color, vec3(0.02), (1.0 - min(min(orilla.x, orilla.y), 1.0)) * 0.6);

  // 3 · la costura: la orilla donde u salta de 1 a 0
  float costura = max(linea(vUv.x, 3.0), linea(vUv.x - 1.0, 3.0));
  color = mix(color, vec3(0.94, 1.0, 0.26), costura);

  // 4 · el barrido: todos los pixeles con la misma v, de la base a la punta
  color = mix(color, vec3(1.2), linea(vUv.y - uBarrido, 1.6));

  // 5 · el mouse: un anillo medido en UV. En el cristal sale estirado;
  //     abierto (tecla U), sale redondo. Esa diferencia es la distorsión del unwrap.
  vec2 d = vUv - uPunto;
  d.x -= floor(d.x + 0.5);   // da la vuelta por la costura
  float r = length(d);
  float anillo = max(linea(r - 0.05, 1.5), 1.0 - smoothstep(0.01, 0.01 + fwidth(r), r));
  color = mix(color, vec3(1.0), clamp(anillo, 0.0, 1.0) * uHayPunto);

  // un poco de luz para leer la forma; el mapa abierto va sin sombra
  vec3 n = normalize(cross(dFdx(vPosMundo), dFdy(vPosMundo)));
  float luz = 0.55 + 0.45 * abs(dot(n, normalize(vec3(0.4, 0.8, 0.5))));
  color *= mix(luz, 1.0, uDesenvolver);

  gl_FragColor = vec4(color, 1.0);
}
