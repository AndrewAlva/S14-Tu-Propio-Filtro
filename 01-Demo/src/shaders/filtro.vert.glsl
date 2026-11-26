// Filtro · vértices
// Un pase de post-proceso dibuja un solo triángulo que cubre toda la pantalla.
// Este archivo no se toca: solo le pasa al fragmento en qué punto de la pantalla está (vUv, de 0 a 1).

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
