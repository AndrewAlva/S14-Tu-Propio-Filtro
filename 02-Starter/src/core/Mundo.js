import * as THREE from 'three';

// El mundo 3D: renderer, escena y cámara. Nada de lo que hay ADENTRO de la cueva
// vive aquí; eso es de las vistas y los componentes.

const FONDO = 0x050806;   // el mismo negro verdoso del sitio original

export class Mundo {
  constructor(calidad) {
    console.log('[arranque] 3 · mundo 3D');
    this.calidad = calidad;
    this.suscritos = [];
    this.post = null;   // S14 · si un componente de post-proceso se registra aquí, él dibuja

    this.renderer = new THREE.WebGLRenderer({
      antialias: calidad.antialias,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(calidad.dpr);
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.domElement.className = 'mundo';
    document.body.prepend(this.renderer.domElement);

    this.escena = new THREE.Scene();
    this.escena.background = new THREE.Color(FONDO);
    this.escena.fog = new THREE.FogExp2(FONDO, 0.045);   // lo lejano se pierde en la oscuridad

    this.camara = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 120);
    this.escena.add(this.camara);   // así los componentes pueden colgarle cosas (una luz)

    addEventListener('resize', () => this.redimensionar());
  }

  // Las vistas se suscriben aquí en vez de escuchar resize cada una por su lado.
  alRedimensionar(fn) {
    this.suscritos.push(fn);
  }

  redimensionar() {
    const ancho = innerWidth, alto = innerHeight;
    this.renderer.setSize(ancho, alto);
    this.camara.aspect = ancho / alto;
    this.camara.updateProjectionMatrix();
    for (const fn of this.suscritos) fn(ancho, alto);
  }

  // S14 · Con post-proceso, el cuadro ya no va directo a la pantalla:
  // la escena se dibuja en una textura, pasa por los filtros y luego sale.
  // Sigue siendo una sola llamada por frame, al final, desde el Reloj.
  render() {
    if (this.post?.activo) this.post.render();
    else this.renderer.render(this.escena, this.camara);
  }
}
