import * as THREE from 'three';

// Copia este archivo para empezar un componente nuevo. No se usa directo.
// Todos los componentes tienen los mismos cinco métodos, aunque algunos los dejen vacíos:
// así la vista los trata igual sin saber qué hay adentro.
//
// La receta para agregar uno:
//   1. Copia este archivo a components/TuComponente.js y cambia el nombre de la clase.
//   2. Si tiene assets, agrégalos en config/assets.js: ¿críticos o diferidos?
//   3. Si tiene una perilla, va en config/calidad.js, no escrita a mano.
//   4. Regístralo en la vista que lo usa: una línea en la lista de componentes.
//   5. Libera lo que creaste en liberar().

export class Plantilla {
  constructor({ escena, calidad }) {
    this.grupo = new THREE.Group();   // todo lo tuyo vive aquí
    this.calidad = calidad;
    escena.add(this.grupo);
  }

  async cargar(cargador) {}           // sus propios assets
  actualizar(dt, t) {}                // cada frame; lo llama la vista
  redimensionar(ancho, alto) {}       // cuando cambia la ventana

  liberar() {                         // geometrías, materiales,
    this.grupo.removeFromParent();    // texturas y listeners
  }
}
