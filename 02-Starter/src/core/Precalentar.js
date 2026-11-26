import { Reloj } from './Reloj.js';

// Descargar no es lo mismo que tener listo. Antes de que algo se vea por primera vez
// hay que compilar sus shaders y subir sus texturas a la GPU. Si eso pasa frente
// al usuario, ese frame se pierde: se ve como un tirón.
//
// Dos versiones del mismo trabajo:
// - precalentar: todo de una vez. Para usarse bajo el telón, cuando nadie está viendo.
// - precalentarEnRebanadas: un pedazo por frame, con presupuesto de tiempo.
//   Para usarse con el usuario adentro (extensión 3 del ejercicio).

export async function precalentar(mundo, escena) {
  const t0 = performance.now();
  await mundo.renderer.compileAsync(escena, mundo.camara);
  const texturas = texturasDe(escena);
  for (const t of texturas) mundo.renderer.initTexture(t);
  console.log(`[arranque] 5 · precalentado · ${texturas.length} texturas · ${Math.round(performance.now() - t0)} ms`);
}

export function precalentarEnRebanadas(mundo, objeto, presupuestoMs = 1) {
  const { renderer, camara, escena } = mundo;
  const pendientes = [];
  objeto.traverse((o) => {
    if (o.isMesh) pendientes.push(() => renderer.compile(o, camara, escena));
  });
  for (const t of texturasDe(objeto)) pendientes.push(() => renderer.initTexture(t));

  return new Promise((resolve) => {
    const paso = () => {
      const inicio = performance.now();
      while (pendientes.length && performance.now() - inicio < presupuestoMs) pendientes.shift()();
      if (!pendientes.length) {
        Reloj.quitar(paso);
        resolve();
      }
    };
    Reloj.agregar(paso);
  });
}

// Todas las texturas que usan los materiales de un objeto y sus hijos.
function texturasDe(objeto) {
  const encontradas = new Set();
  objeto.traverse((o) => {
    const materiales = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    for (const m of materiales) {
      for (const valor of Object.values(m)) if (valor?.isTexture) encontradas.add(valor);
      for (const u of Object.values(m.uniforms ?? {})) if (u.value?.isTexture) encontradas.add(u.value);
    }
  });
  return [...encontradas];
}
