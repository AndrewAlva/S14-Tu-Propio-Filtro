// Tu filtro · la viñeta
// Esta función corre una vez por cada pixel de la pantalla, en cada frame.
// Recibe la escena ya dibujada (tDiffuse) y en qué punto de la pantalla está (vUv).
// Devuelve un color en gl_FragColor. Es una capa de ajuste escrita a mano.
//
// Tres palabras que vas a usar:
//   mix(a, b, t)          el lerp de siempre: de a a b según t (0 a 1)
//   smoothstep(a, b, x)   una curva suave de 0 a 1 entre a y b: un easing
//   length(v)             qué tan lejos está v del 0: la distancia al centro
//
// OJO: GLSL no acepta ñ ni acentos (uVineta, no uViñeta),
// y los números con decimales siempre llevan punto: 1.0, no 1.

uniform sampler2D tDiffuse;   // la escena ya dibujada (con bloom)
uniform float uVineta;        // 0 = sin viñeta, 1 = esquinas negras

varying vec2 vUv;             // 0,0 abajo a la izquierda · 1,1 arriba a la derecha

void main() {
  vec4 escena = texture2D(tDiffuse, vUv);
  vec3 color = escena.rgb;

  // PASO A · Prueba de vida. Descomenta la línea de abajo: si la cueva se ve en negativo,
  // tu pase está vivo. Luego vuelve a comentarla.
  // color = 1.0 - color;


  // PASO B · Viñeta: oscurecer según la distancia al centro.
  //   1. (ahora el 0 está en medio de la pantalla)
  // vec2 centro = vUv - 0.5;
  
  //   2. distancia = length(centro)
  // float distancia = length(centro);
  
  //   3. vineta = smoothstep(0.85, 0.25, distancia) → 1 en el centro, 0 en las orillas
  // float vineta = smoothstep(0.5, 0.25, distancia);

  //   4. color *= mix(1.0, vineta, uVineta)         → uVineta decide cuánto se nota
  // color = escena.rgb * mix(1.0, vineta, uVineta);
  // color = mix(escena.rgb, vec3(1., 0., 0.), vineta); // test viñeta roja


  // EXTENSIÓN 1 · ¿Tu viñeta sale ovalada? vUv va de 0 a 1 en x y en y, aunque la pantalla
  // sea 16:9. Agrega un uniform uAspecto (ancho ÷ alto) y multiplica centro.x por él.
  // centro.x *= uAspecto;


  // Conserva el alfa de la escena: si tu canvas es transparente (HTML detrás),
  // escribir 1.0 aquí lo taparía con negro.
  gl_FragColor = vec4(color, escena.a);
  // gl_FragColor = vec4(vec3(vineta), escena.a);
}
