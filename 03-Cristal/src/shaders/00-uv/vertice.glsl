// UV · vértice
// No mueve nada: solo pasa el uv al fragmento.
// Con uDesenvolver en 1, cada vértice se va a su (u, v) sobre un plano que mira
// a la cámara: el cristal se abre como en el UV Editor de Blender.

uniform float uDesenvolver;   // 0 = el cristal, 1 = el mapa abierto
uniform float uLadoMapa;      // cuánto mide el mapa abierto, en unidades de la escena
uniform float uSubirMapa;     // lo sube para que el montículo no lo tape
uniform float uAcercarMapa;   // y lo acerca a la cámara
varying vec2 vUv;
varying vec3 vPosMundo;

void main() {
  vUv = uv;
  vec4 mundo = modelMatrix * vec4(position, 1.0);

  // Los ejes de la cámara son los renglones de la matriz de vista:
  // así el plano siempre queda de frente, aunque gires alrededor.
  vec3 derecha = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
  vec3 arriba = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
  vec3 haciaCamara = vec3(viewMatrix[0][2], viewMatrix[1][2], viewMatrix[2][2]);
  vec3 origen = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;   // el pie del cristal
  float escala = length(modelMatrix[0].xyz);

  // u va a la derecha, v hacia arriba: el mismo cuadro de 0 a 1 del mapa
  vec3 esquina = origen + arriba * uSubirMapa + haciaCamara * uAcercarMapa;   // dónde cae (0, 0)
  vec3 plano = esquina + (derecha * (uv.x - 0.5) + arriba * uv.y) * uLadoMapa * escala;
  if (escala < 0.9) plano = origen;   // los chicos se encogen a su pie: solo se abre el grande

  mundo.xyz = mix(mundo.xyz, plano, uDesenvolver);
  vPosMundo = mundo.xyz;
  gl_Position = projectionMatrix * viewMatrix * mundo;
}
