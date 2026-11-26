// El cristal de la cueva, con cinco shaders.
// Una demo para mirar, leer y tomar ideas: cada shader vive en su carpeta de src/shaders/.
// Si usas una idea de aquí en tu carta, anótalo en tu bitácora.

import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Cristal, MAPA } from './components/Cristal.js';
import { MapaUV } from './components/MapaUV.js';
import { Monticulo } from './components/Monticulo.js';
import { shaders, carpetas, ayudante } from './shaders/index.js';

// 1 · calidad: ?gpu=0 simula el equipo más lento (sin bloom, resolución 1)
const lento = new URLSearchParams(location.search).get('gpu') === '0';
const calidad = { lento, dpr: lento ? 1 : Math.min(devicePixelRatio, 1.5) };

// 2 · el mundo
const renderer = new THREE.WebGLRenderer({ antialias: !lento, powerPreference: 'high-performance' });
renderer.setPixelRatio(calidad.dpr);
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.domElement.className = 'mundo';
document.body.prepend(renderer.domElement);

const escena = new THREE.Scene();
escena.background = new THREE.Color(0x050806);
escena.fog = new THREE.FogExp2(0x050806, 0.07);
const camara = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 60);
camara.position.set(0, 2.2, 7.2);

// arrastrar para girar, rueda para acercar; con límites para no perderse
const controles = new OrbitControls(camara, renderer.domElement);
controles.target.set(0, 1.1, 0);
controles.enableDamping = true;
controles.enablePan = false;
controles.minDistance = 3.2;
controles.maxDistance = 11;
controles.maxPolarAngle = Math.PI * 0.55;

// 3 · post-proceso: el bloom hace que la luz de los shaders se derrame
const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: lento ? 0 : 4 }));
composer.addPass(new RenderPass(escena, camara));
const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.7, 0.5, 0.8);
composer.addPass(bloom);
composer.addPass(new OutputPass());
let conBloom = !lento;

// 4 · lo que hay en escena
const monticulo = new Monticulo({ escena, calidad });
const cristal = new Cristal({ escena });
const mapa = new MapaUV({ geometria: cristal.geometria });

// 5 · la interfaz: un botón por shader; tocar el activo regresa al original.
// Primero el ayudante de UV (tecla 0), luego los cinco efectos (1 a 5).
const ui = Object.fromEntries([...document.querySelectorAll('[data-ui]')].map((el) => [el.dataset.ui, el]));
const botonUv = document.createElement('button');
botonUv.type = 'button';
botonUv.className = 'ayudante';
botonUv.innerHTML = '<kbd>0</kbd>UV';
botonUv.addEventListener('click', () => elegir(cristal.activo === cristal.UV ? -1 : cristal.UV));
ui.botones.append(botonUv);
const botones = shaders.map((s, i) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.innerHTML = `<kbd>${i + 1}</kbd>${s.nombre}`;
  b.setAttribute('aria-pressed', 'false');
  b.addEventListener('click', () => elegir(cristal.activo === i ? -1 : i));
  ui.botones.append(b);
  return b;
});
const botonBloom = document.createElement('button');
botonBloom.type = 'button';
botonBloom.className = 'extra';
botonBloom.innerHTML = '<kbd>B</kbd>Bloom';
botonBloom.addEventListener('click', () => alternarBloom());
ui.botones.append(botonBloom);
const botonAbrir = document.createElement('button');
botonAbrir.type = 'button';
botonAbrir.className = 'extra';
botonAbrir.innerHTML = '<kbd>U</kbd>Desenvolver';
botonAbrir.hidden = true;   // solo existe en modo UV
botonAbrir.addEventListener('click', () => alternarAbrir());
ui.botones.append(botonAbrir);

function elegir(i) {
  cristal.usar(i);
  const esUv = i === cristal.UV;
  botones.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
  botonUv.setAttribute('aria-pressed', String(esUv));
  botonAbrir.hidden = !esUv;
  botonAbrir.setAttribute('aria-pressed', 'false');
  mapa.mostrar(esUv);
  const s = esUv ? ayudante : shaders[i];
  ui.nombre.textContent = s ? s.nombre : 'Original';
  ui.idea.textContent = s ? s.idea : 'El cristal de la S13: MeshStandardMaterial con emisivo verde. Elige un shader abajo.';
  ui.vertice.textContent = s ? s.textos.vertice : 'El de Three.js: no mueve nada.';
  ui.fragmento.textContent = s ? s.textos.fragmento : 'El de Three.js: luz física y emisivo.';
  ui.archivos.textContent = s ? `src/shaders/${esUv ? ayudante.carpeta : carpetas[i]}/` : 'src/components/Cristal.js';
}
// U: abre el cristal en su mapa (y lo cierra). Si no estabas en UV, te lleva ahí.
function alternarAbrir() {
  if (cristal.activo !== cristal.UV) elegir(cristal.UV);
  cristal.abrir = cristal.abrir ? 0 : 1;
  botonAbrir.setAttribute('aria-pressed', String(!!cristal.abrir));
}
function alternarBloom() {
  conBloom = !conBloom;
  botonBloom.setAttribute('aria-pressed', String(conBloom));
}
botonBloom.setAttribute('aria-pressed', String(conBloom));
elegir(-1);

addEventListener('keydown', (e) => {
  const n = Number(e.key);
  if (n >= 1 && n <= shaders.length) elegir(cristal.activo === n - 1 ? -1 : n - 1);
  if (e.key === '0') elegir(cristal.activo === cristal.UV ? -1 : cristal.UV);
  if (e.key === 'Escape') elegir(-1);
  if (e.key === 'b' || e.key === 'B') alternarBloom();
  if (e.key === 'u' || e.key === 'U') alternarAbrir();
});

// 6 · el mouse en modo UV: ¿qué (u, v) hay debajo?
// Cerrado, lo dice el raycaster (trae el uv del punto que toca).
// Abierto, el cristal ya no está donde dice la geometría: se calcula sobre el plano.
const raton = new THREE.Vector2();
let ratonDentro = false;
renderer.domElement.addEventListener('pointermove', (e) => {
  raton.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ratonDentro = true;
});
renderer.domElement.addEventListener('pointerleave', () => { ratonDentro = false; });
const rayo = new THREE.Raycaster();
const plano = new THREE.Plane(), origen = new THREE.Vector3(), cruce = new THREE.Vector3();
const derecha = new THREE.Vector3(), arriba = new THREE.Vector3(), haciaCamara = new THREE.Vector3();

function uvBajoElRaton() {
  if (!ratonDentro) return null;
  rayo.setFromCamera(raton, camara);
  const abierto = cristal.uniforms.uDesenvolver.value;
  if (abierto === 0) {
    const toque = rayo.intersectObjects(cristal.cuerpos, false)[0];
    return toque ? { u: toque.uv.x, v: toque.uv.y } : null;
  }
  if (abierto < 1) return null;   // a medio abrir no hay respuesta honesta
  camara.matrixWorld.extractBasis(derecha, arriba, haciaCamara);
  cristal.cuerpos[0].getWorldPosition(origen);
  origen.addScaledVector(arriba, MAPA.subir).addScaledVector(haciaCamara, MAPA.acercar);   // la esquina (0, 0), igual que el shader
  plano.setFromNormalAndCoplanarPoint(haciaCamara, origen);
  if (!rayo.ray.intersectPlane(plano, cruce)) return null;
  cruce.sub(origen);
  const u = cruce.dot(derecha) / MAPA.lado + 0.5, v = cruce.dot(arriba) / MAPA.lado;
  return u >= 0 && u <= 1 && v >= 0 && v <= 1 ? { u, v } : null;
}

// 7 · tamaño
function redimensionar() {
  renderer.setSize(innerWidth, innerHeight);
  composer.setPixelRatio(calidad.dpr);
  composer.setSize(innerWidth, innerHeight);
  camara.aspect = innerWidth / innerHeight;
  camara.updateProjectionMatrix();
}
addEventListener('resize', redimensionar);
redimensionar();

// 8 · un solo loop: primero la lógica, al final el dibujo
const reloj = new THREE.Clock();
let fps = 60, cuenta = 0, acumulado = 0;
const { vertices, triangulos } = cristal.info;
renderer.setAnimationLoop(() => {
  const dt = Math.min(reloj.getDelta(), 0.1);
  const t = reloj.elapsedTime;
  controles.update();
  cristal.actualizar(dt, t);
  monticulo.actualizar(dt, t);
  if (cristal.activo === cristal.UV) {
    const punto = uvBajoElRaton();
    cristal.uniforms.uHayPunto.value = punto ? 1 : 0;
    if (punto) cristal.uniforms.uPunto.value.set(punto.u, punto.v);
    mapa.actualizar(punto, cristal.uniforms.uBarrido.value);
  }

  if (conBloom) composer.render();
  else renderer.render(escena, camara);

  cuenta++; acumulado += dt;
  if (acumulado > 0.5) { fps = cuenta / acumulado; cuenta = 0; acumulado = 0; }
  ui.lectura.textContent = `${Math.round(fps)} fps · ${vertices.toLocaleString('es-MX')} vértices · ${triangulos.toLocaleString('es-MX')} triángulos × 7 cristales${lento ? ' · gpu=0' : ''}`;
});
