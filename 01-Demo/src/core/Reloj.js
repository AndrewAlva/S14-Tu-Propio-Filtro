// Un solo requestAnimationFrame para todo el sitio.
// Cada pieza que necesita animarse se inscribe con Reloj.agregar(fn).
// Primero corre toda la lógica; al final, una sola vez, se dibuja.
// Ningún componente crea su propio requestAnimationFrame.

const inscritos = [];
let mundo = null;
let ultimo = 0;
let ultimoDibujo = 0;

export const Reloj = {
  fps: 0,

  iniciar(m) {
    mundo = m;
    ultimo = ultimoDibujo = performance.now();
    requestAnimationFrame(frame);
  },

  agregar(fn) {
    if (!inscritos.includes(fn)) inscritos.push(fn);
  },

  quitar(fn) {
    const i = inscritos.indexOf(fn);
    if (i >= 0) inscritos.splice(i, 1);
  },
};

function frame(ahora) {
  requestAnimationFrame(frame);

  // límite de fps (tier 0): si todavía no toca, este frame no se trabaja
  const limite = mundo.calidad.limiteFps;
  if (limite && ahora - ultimoDibujo < 1000 / limite - 1) return;
  ultimoDibujo = ahora;

  // delta con tope: al volver de otra pestaña nada salta de golpe
  const dt = Math.min((ahora - ultimo) / 1000, 0.2);
  ultimo = ahora;
  const t = ahora / 1000;

  // 1 · lógica, en el orden en que se inscribieron
  for (const fn of [...inscritos]) fn(dt, t);

  // 2 · dibujo, una sola vez
  mundo.render();

  if (dt > 0) Reloj.fps += (1 / dt - Reloj.fps) * 0.05;   // promedio suave, para leerlo en pantalla
}
