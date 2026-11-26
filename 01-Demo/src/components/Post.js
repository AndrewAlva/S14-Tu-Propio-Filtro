// ============================================================================
//  DEMO · versión resuelta · SOLUCIÓN DOCENTE
//  Es la referencia de la meta: léela para entender cada paso, no la copies
//  a tu carta sin poder defender cada línea. El ejercicio está en 02-Starter/.
// ============================================================================

import * as THREE from 'three';
import gsap from 'gsap';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import vertice from '../shaders/filtro.vert.glsl?raw';
import fragmento from '../shaders/filtro.frag.glsl?raw';

// Tu filtro: el post-proceso de la carta. Una capa de ajuste encima de todo.
// La escena ya no se dibuja en la pantalla, sino en una textura;
// esa textura pasa por una cadena de pases y el último sale a la pantalla.
//
//   RenderPass  → dibuja la escena en una textura      (luz: valores que pueden pasar de 1)
//   Bloom       → el brillo que se derrama             (trabaja con luz: va ANTES del OutputPass)
//   OutputPass  → tone mapping + sRGB: luz → colores de pantalla
//   Viñeta      → tu shader                            (trabaja con lo que ves: va DESPUÉS)
//
// Sigue el contrato de la cueva. Además tiene render(): el Mundo lo llama una vez por frame.

export class Post {
  constructor({ mundo, calidad }) {
    this.mundo = mundo;
    this.calidad = calidad;
    this.activo = true;   // la tecla P lo apaga y prende para comparar (views/Cueva.js)

    // La textura donde se dibuja la escena. Dos detalles que la pantalla resolvía sola:
    //   HalfFloat: guarda luz por encima de 1 (si no, el bloom no tiene qué derramar)
    //   samples: 4 = antialiasing; al dibujar en una textura, el del renderer se pierde
    const objetivo = new THREE.WebGLRenderTarget(1, 1, {
      type: THREE.HalfFloatType,
      samples: calidad.antialias ? 4 : 0,
    });
    this.composer = new EffectComposer(mundo.renderer, objetivo);

    // 1 · la escena, como siempre, pero hacia la textura
    this.composer.addPass(new RenderPass(mundo.escena, mundo.camara));

    // 2 · bloom. Solo brilla lo que pasa del umbral: el haz y los cristales encendidos.
    //    Es el pase más caro: el tier 0 no lo lleva (perilla en config/calidad.js).
    if (calidad.bloom) {
      //                                   resolución (la ajusta setSize), fuerza, radio, umbral
      this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.6, 0.4, 0.85);
      this.composer.addPass(this.bloom);
    }

    // 3 · de luz a colores de pantalla
    this.composer.addPass(new OutputPass());

    // 4 · tu viñeta: un solo slider, uVineta. uAspecto es la extensión 1.
    this.filtro = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },   // la capa de abajo: ShaderPass la llena solo
        uVineta:  { value: 0.6 },
        uAspecto: { value: 1 },
      },
      vertexShader: vertice,
      fragmentShader: fragmento,
    });
    // OJO: ShaderPass COPIA los uniforms. Desde aquí se escribe en this.filtro.uniforms.
    this.composer.addPass(this.filtro);   // el último pase sale a la pantalla

    // 5 · desde ahora, el Mundo dibuja a través de nosotros
    mundo.post = this;
    this.redimensionar(innerWidth, innerHeight);
    console.log(`  · post: ${this.composer.passes.length} pases${this.bloom ? ' (con bloom)' : ''}`);
  }

  async cargar() {}   // no descarga nada. Sus shaders se compilan en los primeros frames bajo el telón

  // Extensión 3 · al subir el telón la viñeta empieza cerrada y se abre.
  // GSAP no anima un elemento: anima el valor de un uniform, y el shader lo lee cada frame.
  entrar() {
    gsap.fromTo(this.filtro.uniforms.uVineta, { value: 1.6 }, { value: 0.6, duration: 2.5, ease: 'power2.out' });
  }

  actualizar() {}   // nada cambia cada frame: los uniforms solo cambian al redimensionar o al entrar

  redimensionar(ancho, alto) {
    // la resolución del post sigue a la del renderer: duplicar el DPR cuadruplica los píxeles de cada pase
    this.composer.setPixelRatio(this.calidad.dpr);
    this.composer.setSize(ancho, alto);
    this.filtro.uniforms.uAspecto.value = ancho / alto;   // extensión 1
  }

  render() {
    this.composer.render();
  }

  liberar() {
    if (this.mundo.post === this) this.mundo.post = null;   // el Mundo vuelve a dibujar directo
    for (const pase of this.composer.passes) pase.dispose?.();
    this.composer.dispose();   // las dos texturas internas
  }
}
