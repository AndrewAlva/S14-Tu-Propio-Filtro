// Haz de sol · color
// Un cono no se ve como luz si tiene bordes duros. Tres trucos lo vuelven aire iluminado:
//   1. donde lo miras de frente brilla; en la silueta se desvanece
//   2. arriba es intenso y se apaga hacia el piso
//   3. unas bandas lentas sugieren polvo flotando

uniform float uTiempo;
uniform float uIntensidad;
uniform vec3 uColor;

varying vec2 vUv;
varying vec3 vNormalVista;
varying vec3 vPosVista;

void main() {
  float frente = abs(dot(normalize(vNormalVista), normalize(-vPosVista)));
  float borde = pow(frente, 2.5);

  float caida = smoothstep(0.0, 1.0, vUv.y);   // en el cilindro, vUv.y = 1 es arriba

  float bandas = 0.82 + 0.18 * sin(vUv.y * 16.0 - uTiempo * 0.5 + sin(vUv.x * 30.0 + uTiempo * 0.2) * 0.9);

  float a = borde * caida * bandas * uIntensidad;
  gl_FragColor = vec4(uColor * a, a);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
