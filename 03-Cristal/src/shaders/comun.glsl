// Herramientas que comparten los cinco shaders.
// GLSL no tiene import: Cristal.js pega este texto antes de cada shader.

// Un número "al azar" entre 0 y 1, siempre el mismo para el mismo punto.
float azar(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

// Ruido suave: el azar de las esquinas de una rejilla, mezclado con easing.
// Es lo que hace que la lava o las nubes no se vean como estática de TV.
float ruido(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);   // smoothstep a mano: la curva entre esquinas
  return mix(
    mix(mix(azar(i), azar(i + vec3(1, 0, 0)), f.x), mix(azar(i + vec3(0, 1, 0)), azar(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(azar(i + vec3(0, 0, 1)), azar(i + vec3(1, 0, 1)), f.x), mix(azar(i + vec3(0, 1, 1)), azar(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}

// fbm: varias capas de ruido, cada una al doble de detalle y la mitad de fuerte.
// Como apilar texturas de nubes en Photoshop con distinta escala.
float fbm(vec3 p) {
  float suma = 0.0, fuerza = 0.5;
  for (int i = 0; i < 5; i++) {
    suma += fuerza * ruido(p);
    p *= 2.03;
    fuerza *= 0.5;
  }
  return suma;
}

// Paletas de coseno (Íñigo Quílez): un número de 0 a 1 se vuelve un degradado entero.
vec3 paleta(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.28318 * (c * t + d));
}

// Girar un punto en 2D (para torcer en x y z alrededor del eje y).
mat2 giro(float angulo) {
  float s = sin(angulo), c = cos(angulo);
  return mat2(c, -s, s, c);
}
