import * as THREE from 'three';
import { Reloj } from '../core/Reloj.js';
import { Pasillo }   from '../components/Pasillo.js';
import { HazDeSol }  from '../components/HazDeSol.js';
import { Cristales } from '../components/Cristales.js';
import { Post }      from '../components/Post.js';     // S14

// La vista: lo que ve el usuario de principio a fin.
// Es la directora de la escena: decide el recorrido, mueve la cámara con el scroll
// y les pasa a sus componentes lo que necesitan. No dibuja roca ni cristales: eso es de ellos.

export class Cueva {
  constructor(mundo, calidad) {
    console.log('[arranque] 4 · primera vista · Cueva');
    this.mundo = mundo;
    this.escena = mundo.escena;
    this.camara = mundo.camara;
    this.recorrido = crearRecorrido();

    // lo que todos los componentes reciben al nacer
    this.contexto = {
      mundo,        // S14 · Post necesita el renderer, la escena y la cámara
      escena: this.escena,
      camara: this.camara,
      calidad,
      recorrido: this.recorrido,
    };

    this.componentes = [Pasillo, HazDeSol, Cristales, Post]
      .map(C => new C(this.contexto));

    this.crearDOM(calidad);
    this.scroll = 0;   // 0 a 1, lo escribe el evento; el loop lo persigue
    addEventListener('scroll', () => this.leerScroll(), { passive: true });   // el evento solo guarda
    // S14 · P apaga y prende el post-proceso: para comparar y para medir cuánto cuesta
    addEventListener('keydown', (e) => {
      if ((e.key === 'p' || e.key === 'P') && this.mundo.post) this.mundo.post.activo = !this.mundo.post.activo;
    });

    this.actualizar = this.actualizar.bind(this);
    Reloj.agregar(this.actualizar);
    mundo.alRedimensionar((ancho, alto) => {
      for (const c of this.componentes) c.redimensionar(ancho, alto);
    });
    this.colocarCamara(0, 0);
  }

  async cargar(cargador) {
    await Promise.all(this.componentes.map((c) => c.cargar(cargador)));
    console.log(`[arranque] 4 · Cueva lista · ${this.componentes.length} componentes`);
  }

  entrar() {
    document.body.classList.remove('bloqueado');   // ya se puede hacer scroll
    this.mundo.post?.entrar?.();                   // S14 · extensión 3: la viñeta se abre al subir el telón
    this.pista.classList.remove('oculta');
  }

  actualizar(dt, t) {
    // el progreso persigue al scroll: suave aunque la rueda del mouse dé saltos
    this.recorrido.progreso += (this.scroll - this.recorrido.progreso) * (1 - Math.exp(-3 * dt));
    this.colocarCamara(this.recorrido.progreso, t);

    for (const c of this.componentes) c.actualizar(dt, t);

    if (this.recorrido.progreso > 0.02) this.pista.classList.add('oculta');
    this.hud.textContent = `tier ${this.contexto.calidad.tier} · dpr ${this.contexto.calidad.dpr} · ${Math.round(Reloj.fps)} fps · ${Math.round(this.recorrido.progreso * 100)} % · post ${this.mundo.post?.activo ? 'on' : 'off'}`;
  }

  liberar() {
    Reloj.quitar(this.actualizar);
    for (const c of this.componentes) c.liberar();
    this.alto.remove(); this.hud.remove(); this.pista.remove();
  }

  // --- interno ---

  leerScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    this.scroll = max > 0 ? scrollY / max : 0;
  }

  colocarCamara(p, t) {
    const r = this.recorrido;
    r.curvaCamara.getPointAt(p, this.camara.position);
    this.camara.position.x += Math.sin(t * 0.6) * 0.06;   // un leve balanceo: alguien está ahí
    this.camara.position.y += Math.sin(t * 0.9) * 0.04;

    // mira hacia adelante en el camino; al final, voltea hacia los cristales
    r.curvaCamara.getPointAt(Math.min(p + 0.04, 1), _adelante);
    const hacia = THREE.MathUtils.smoothstep(p, 0.6, 0.95);
    _mira.lerpVectors(_adelante, r.cristales, hacia);
    this.camara.lookAt(_mira);
  }

  crearDOM(calidad) {
    this.alto = document.createElement('div');   // da el largo del scroll
    this.alto.className = 'recorrido';
    this.hud = document.createElement('p');
    this.hud.className = 'hud';
    this.pista = document.createElement('p');
    this.pista.className = 'pista oculta';
    this.pista.textContent = 'baja ↓';
    document.body.append(this.alto, this.hud, this.pista);
  }
}

const _adelante = new THREE.Vector3();
const _mira = new THREE.Vector3();

// El plano de la cueva, en metros. Lo comparten la cámara y los componentes.
//   pasillo: baja en curva desde la entrada hasta la pared de la cámara
//   cámara:  una bóveda de radio 12 con un hoyo de luz arriba
//   cristales: en el piso de la cámara, al fondo
function crearRecorrido() {
  const centro = new THREE.Vector3(0, -16, -30);
  const radio = 12;

  // por dónde entra el pasillo a la bóveda: el punto de la pared que mira hacia la entrada
  const antes = new THREE.Vector3(0.4, -7.8, -13);
  const direccion = antes.clone().sub(centro).normalize();
  const entrada = centro.clone().addScaledVector(direccion, radio * 0.95);
  const adentro = centro.clone().addScaledVector(direccion, radio * 0.75);

  const curvaTunel = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 2, 16),   // empieza detrás de la cámara: nunca se ve la boca
    new THREE.Vector3(0, 1.5, 10),
    new THREE.Vector3(1.2, 0, 2),
    new THREE.Vector3(-0.8, -3.8, -6),
    antes,
    entrada,
    adentro,
  ]);

  const cristales = new THREE.Vector3(0, centro.y - radio * 0.6, centro.z - radio * 0.32);

  const curvaCamara = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.5, 10),
    new THREE.Vector3(1.2, 0, 2),
    new THREE.Vector3(-0.8, -3.8, -6),
    antes,
    entrada,
    new THREE.Vector3(0, -14.5, -23),
    new THREE.Vector3(0.3, -18.5, -26.5),
  ]);

  return { progreso: 0, centro, radio, curvaTunel, curvaCamara, cristales };
}
