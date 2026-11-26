import * as THREE from 'three';

// El loader no mide archivos: mide tareas.
// - Cuenta los archivos críticos que van llegando.
// - reservar(n) aparta un pedazo del 100 % para algo que no es un archivo
//   (en main.js: el precalentado). entregar(n) lo entrega cuando termina.
// - despues(lista) descarga en silencio, con el usuario ya adentro.
// - textura(nombre) devuelve una promesa: la reciben los componentes, críticos o diferidos.
//
// Con ?lento en la URL, cada archivo tarda de más, como en una red mala.

const LENTO = new URLSearchParams(location.search).has('lento');
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

export class Cargador {
  constructor(lista, telon) {
    this.telon = telon;
    this.total = lista.length;
    this.hechas = 0;
    this.lector = new THREE.TextureLoader();
    this.texturas = new Map();   // nombre → { promesa, resolver? }

    // los críticos se piden ya, todos a la vez
    this._archivos = Promise.all(lista.map((a) => this.pedir(a).then(() => this.sumar(1))));
  }

  reservar(n = 1) {
    this.total += n;
    this.avisar();
  }

  entregar(n = 1) {
    this.sumar(n);
  }

  archivos() {
    return this._archivos;
  }

  // Un componente puede pedir una textura antes de que alguien la descargue:
  // recibe una promesa que se cumple cuando llegue, sea crítica o diferida.
  textura(nombre) {
    if (!this.texturas.has(nombre)) {
      let resolver;
      const promesa = new Promise((r) => { resolver = r; });
      this.texturas.set(nombre, { promesa, resolver });
    }
    return this.texturas.get(nombre).promesa;
  }

  despues(lista) {
    const t0 = performance.now();
    Promise.all(lista.map((a) => this.pedir(a))).then(() => {
      console.log(`[arranque] 7 · diferidos listos · ${lista.map((a) => a.nombre).join(', ')} · ${Math.round(performance.now() - t0)} ms`);
    });
  }

  // --- interno ---

  pedir({ nombre, url }) {
    const promesa = (async () => {
      if (LENTO) await esperar(900 + Math.random() * 1400);
      const textura = await this.lector.loadAsync(url);
      textura.name = nombre;
      textura.colorSpace = THREE.SRGBColorSpace;
      textura.wrapS = textura.wrapT = THREE.RepeatWrapping;
      console.log(`  · descargado: ${nombre}`);
      return textura;
    })();

    const pendiente = this.texturas.get(nombre);
    if (pendiente?.resolver) promesa.then(pendiente.resolver);   // alguien ya la estaba esperando
    else this.texturas.set(nombre, { promesa });
    return promesa;
  }

  sumar(n) {
    this.hechas += n;
    this.avisar();
  }

  avisar() {
    this.telon?.progreso(this.hechas / this.total);
  }
}
