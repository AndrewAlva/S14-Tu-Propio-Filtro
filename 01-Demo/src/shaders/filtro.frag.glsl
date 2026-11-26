// ============================================================================
//  DEMO · versión resuelta · SOLUCIÓN DOCENTE (referencia de la meta)
// ============================================================================
// Tu filtro · la viñeta
// Esta función corre una vez por cada pixel de la pantalla, en cada frame.
// Recibe la escena ya dibujada (tDiffuse) y en qué punto de la pantalla está (vUv).
// Devuelve un color. Es una capa de ajuste de After Effects escrita a mano.

uniform sampler2D tDiffuse;   // la escena ya dibujada (con bloom)
uniform float uVineta;        // 0 = sin viñeta, 1 = esquinas negras
uniform float uAspecto;       // extensión 1 · ancho ÷ alto de la pantalla

varying vec2 vUv;             // 0,0 abajo a la izquierda · 1,1 arriba a la derecha

void main() {
  vec4 escena = texture2D(tDiffuse, vUv);

  vec2 centro = vUv - 0.5;                            // el 0 en medio de la pantalla
  centro.x *= uAspecto;                               // extensión 1: redonda, no ovalada
  float distancia = length(centro);                   // qué tan lejos del centro
  float vineta = smoothstep(0.85, 0.25, distancia);   // 1 en el centro, 0 en las orillas

  vec3 color = escena.rgb * mix(1.0, vineta, uVineta);

  // Conserva el alfa de la escena: si tu canvas es transparente (HTML detrás),
  // escribir 1.0 aquí lo taparía con negro.
  gl_FragColor = vec4(color, escena.a);
}
