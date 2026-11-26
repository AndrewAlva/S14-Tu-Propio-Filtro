import * as THREE from 'three';
// Las piezas del post-proceso vienen con Three.js, en la carpeta "addons". Ya están importadas.
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import vertice from '../shaders/filtro.vert.glsl?raw';
import fragmento from '../shaders/filtro.frag.glsl?raw';

// Tu filtro: el post-proceso de la carta.
// Piénsalo como una capa de ajuste en After Effects, encima de todo.
// La escena ya no se dibuja directo en la pantalla: se dibuja en una textura,
// esa textura pasa por una cadena de pases, y el último pase sale a la pantalla.
//
//   RenderPass  → dibuja la escena en una textura      (luz: valores que pueden pasar de 1)
//   Bloom       → el brillo que se derrama             (trabaja con luz: va ANTES del OutputPass)
//   OutputPass  → tone mapping + sRGB: de luz a colores de pantalla
//   Viñeta      → tu shader                            (trabaja con lo que ves: va DESPUÉS)
//
// Sigue el contrato de la cueva (cargar, actualizar, redimensionar, liberar)
// y tiene un método más, render(): el Mundo lo llama una vez por frame.
//
// Sigue los PASOS en orden. El PASO 1 está en views/Cueva.js.

export class Post {
  constructor({ mundo, calidad }) {
    this.mundo = mundo;
    this.calidad = calidad;
    this.activo = true;   // la tecla P lo apaga y lo prende, para comparar

    // La textura donde se va a dibujar la escena (ya resuelto):
    //   HalfFloat: guarda luz por encima de 1 (si no, el bloom no tiene qué derramar)
    //   samples: 4 = antialiasing; al dibujar en una textura, el del renderer se pierde
    const objetivo = new THREE.WebGLRenderTarget(1, 1, {
      type: THREE.HalfFloatType,
      samples: calidad.antialias ? 4 : 0,
    });

    // PASO 2 · Crea el composer: la "render queue" que corre los pases en orden.
    //   this.composer = un nuevo EffectComposer que recibe el renderer del mundo y el objetivo
    // this.composer = new EffectComposer(mundo.renderer, objetivo);


    // PASO 3 · Primer pase: dibujar la escena, como siempre, pero hacia la textura.
    //   al composer, agrégale (addPass) un RenderPass con la escena y la cámara del mundo
    // this.renderPass = new RenderPass(mundo.escena, mundo.camara);
    // this.composer.addPass(this.renderPass);


    // PASO 4 · Bloom: solo si la perilla de calidad lo permite (el tier 0 no lo lleva).
    //   si this.calidad.bloom:
    //     this.bloom = un nuevo UnrealBloomPass(new THREE.Vector2(1, 1), 0.6, 0.4, 0.85)
    //                                           resolución, fuerza, radio, umbral
    //     agrégalo al composer
    // if (calidad.bloom) {
    //   //                                   resolución (la ajusta setSize), fuerza, radio, umbral
    //   this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.6, 0.4, 0.85);
    //   this.composer.addPass(this.bloom);
    // }


    // PASO 5 · De luz a colores de pantalla: agrega un OutputPass (no recibe nada).
    //   Sin este pase, los colores se ven lavados o distintos que sin post-proceso.
    // this.composer.addPass(new OutputPass());


    // PASO 6 · Tu viñeta: un ShaderPass con tus shaders y UN uniform.
    //   this.filtro = un nuevo ShaderPass que recibe un objeto con:
    //     uniforms: {
    //       tDiffuse: { value: null },   ← la escena ya dibujada; ShaderPass la llena solo
    //       uVineta:  { value: 0.6 },    ← tu slider: 0 = nada, 1 = esquinas negras
    //     },
    //     vertexShader: vertice,
    //     fragmentShader: fragmento,
    //   agrégalo al composer: el último pase es el que sale a la pantalla
    // this.filtro = new ShaderPass({
    //   uniforms: {
    //     tDiffuse: { value: null },   // la capa de abajo: ShaderPass la llena solo
    //     uVineta:  { value: 1 },
    //     uAspecto: { value: 1 },
    //   },
    //   vertexShader: vertice,
    //   fragmentShader: fragmento,
    // });
    
    //   OJO: ShaderPass COPIA los uniforms. Si después quieres cambiar uVineta,
    //   escribe en this.filtro.uniforms.uVineta.value, no en el objeto que le pasaste.
    // this.composer.addPass(this.filtro);   // el último pase sale a la pantalla


    // PASO 7 · Avísale al mundo que desde ahora dibujas tú.
    //   mundo.post = this
    //   (core/Mundo.js ya sabe qué hacer: si hay post, llama a tu render() en vez del suyo)
    // mundo.post = this;
    // this.redimensionar(innerWidth, innerHeight);
    // console.log(`  · post: ${this.composer.passes.length} pases${this.bloom ? ' (con bloom)' : ''}`);
  }

  async cargar() {}   // no descarga nada

  actualizar() {}     // nada cambia cada frame

  redimensionar(ancho, alto) {
    if (!this.composer) return;   // mientras no exista el PASO 2

    // PASO 8 · Cuando cambia la ventana, el composer cambia de tamaño con ella.
    //   al composer: setPixelRatio con this.calidad.dpr, y setSize con ancho y alto
    // this.composer.setPixelRatio(this.calidad.dpr);
    // this.composer.setSize(ancho, alto);
    // this.filtro.uniforms.uAspecto.value = ancho / alto;   // extensión 1
  }

  render() {
    this.composer.render();
  }

  liberar() {
    // PASO 9 · Al irte, deja todo como estaba.
    //   si mundo.post eres tú, regrésalo a null (el mundo vuelve a dibujar directo)
    //   llama dispose() de cada pase (this.composer.passes) y del composer
    if (this.mundo.post === this) this.mundo.post = null;   // el Mundo vuelve a dibujar directo
    for (const pase of this.composer.passes) pase.dispose?.();
    this.composer.dispose();   // las dos texturas internas
  }

  // EXTENSIÓN 3 · views/Cueva.js llama a post.entrar() cuando sube el telón.
  // Escribe aquí un tween de GSAP que anime this.filtro.uniforms.uVineta
  // (por ejemplo, de 1.6 a 0.6 en 2.5 segundos): la viñeta se abre al entrar.
  // Necesitas importar GSAP arriba: import gsap from 'gsap';
  // entrar() {}
}
