import { Reloj } from '../core/Reloj.js';

// El telón. Mientras está arriba, el código hace el trabajo caro detrás.
// El número nunca salta ni retrocede: persigue al progreso real con suavidad.

const VELOCIDAD_MAX = 0.8;   // fracción del 100 % por segundo, como máximo

export class PantallaCarga {
  constructor() {
    console.log('[arranque] 2 · telón arriba');
    this.objetivo = 0;
    this.mostrado = 0;

    this.el = document.createElement('div');
    this.el.className = 'telon';
    this.el.innerHTML = '<p>ahuecando la roca… <span>000</span>%</p>';
    this.numero = this.el.querySelector('span');
    document.body.append(this.el);

    this.actualizar = this.actualizar.bind(this);
    Reloj.agregar(this.actualizar);   // no tiene su propio requestAnimationFrame
  }

  progreso(p) {
    this.objetivo = Math.max(this.objetivo, Math.min(1, p));
  }

  actualizar(dt) {
    const falta = this.objetivo - this.mostrado;
    this.mostrado += Math.min(falta * (1 - Math.exp(-6 * dt)) + 0.02 * dt, VELOCIDAD_MAX * dt, falta);
    this.numero.textContent = String(Math.round(this.mostrado * 100)).padStart(3, '0');
    if (this.mostrado >= 0.999 && this.alLlegar) this.alLlegar();
  }

  // Espera a que el número llegue a 100, desvanece y se destruye.
  async salir() {
    await new Promise((r) => { this.alLlegar = r; });
    this.el.classList.add('fuera');
    await Promise.race([
      new Promise((r) => this.el.addEventListener('transitionend', r, { once: true })),
      new Promise((r) => setTimeout(r, 2000)),   // por si no hay transición (movimiento reducido)
    ]);
    this.liberar();
    console.log('[arranque] 6 · sube el telón');
  }

  liberar() {
    Reloj.quitar(this.actualizar);
    this.el.remove();
  }
}
