import * as THREE from 'three';
import comun from '../shaders/comun.glsl?raw';
import { shaders, ayudante } from '../shaders/index.js';

// El cristal de la cueva: el mismo prisma hexagonal con punta de la S13,
// pero con muchas más divisiones a lo alto para que el vertex shader tenga
// vértices que mover. Uno grande al centro y seis chicos alrededor;
// todos comparten material, así que cambiar el shader los cambia a todos.

const ALTO = 3.1;        // del pie a la punta, en unidades de la escena
// El mapa UV abierto: un cuadro de 3 × 3, un poco arriba y hacia la cámara.
// main.js usa los mismos números para saber qué (u, v) hay bajo el mouse.
export const MAPA = { lado: 3, subir: 0.3, acercar: 0.8 };

export class Cristal {
  constructor({ escena }) {
    this.grupo = new THREE.Group();
    escena.add(this.grupo);
    this.geometria = prismaConPunta();

    // el original: como en la cueva
    this.original = new THREE.MeshStandardMaterial({
      color: 0x8fe0b4, emissive: 0x2dff8a, emissiveIntensity: 0.18,
      roughness: 0.25, metalness: 0.1, flatShading: true,
    });

    // Los cinco shaders. Todos reciben los mismos uniforms base;
    // cada uno puede agregar los suyos en su index.js.
    this.uniforms = {
      uTiempo: { value: 0 },
      uAlto: { value: ALTO },
      uProgreso: { value: 0 },   // lo usa la desintegración
      // los del ayudante de UV
      uDesenvolver: { value: 0 },   // 0 = cristal, 1 = abierto en su mapa
      uLadoMapa: { value: MAPA.lado },
      uSubirMapa: { value: MAPA.subir },
      uAcercarMapa: { value: MAPA.acercar },
      uBarrido: { value: 0 },
      uPunto: { value: new THREE.Vector2() },
      uHayPunto: { value: 0 },
    };
    // los cinco shaders y, al final, el ayudante de UV
    this.materiales = [...shaders, ayudante].map((s) => new THREE.ShaderMaterial({
      vertexShader: comun + s.vertice,
      fragmentShader: comun + s.fragmento,
      uniforms: this.uniforms,
      side: THREE.DoubleSide,
      ...s.opciones,   // transparencia, mezcla aditiva…
    }));

    this.cuerpos = [];
    const sitios = [   // x, z, escala, inclinación
      [0, 0, 1, 0], [1.35, 0.5, 0.42, -0.5], [-1.2, 0.75, 0.5, 0.45], [0.55, -1.25, 0.38, 0.4],
      [-0.7, -1.0, 0.33, -0.35], [1.6, -0.6, 0.28, -0.6], [-1.75, -0.25, 0.3, 0.6],
    ];
    for (const [x, z, s, inclina] of sitios) {
      const m = new THREE.Mesh(this.geometria, this.original);
      m.position.set(x, -0.15 - (1 - s) * 0.2, z);
      m.scale.setScalar(s);
      m.rotation.set(z * 0.25 * Math.sign(inclina), Math.random() * 6, inclina);
      this.grupo.add(m);
      this.cuerpos.push(m);
    }
    this.activo = -1;   // -1 = original
    this.UV = shaders.length;   // el índice del ayudante
    this.abrir = 0;             // a dónde va uDesenvolver
  }

  // i = índice del shader, o -1 para regresar al material original
  usar(i) {
    this.activo = i;
    if (i !== this.UV) { this.abrir = 0; this.uniforms.uDesenvolver.value = 0; }
    const material = i < 0 ? this.original : this.materiales[i];
    for (const m of this.cuerpos) m.material = material;
  }

  get info() {
    const g = this.geometria;
    return { vertices: g.attributes.position.count, triangulos: g.attributes.position.count / 3 };
  }

  actualizar(dt, t) {
    this.uniforms.uTiempo.value = t;
    // La desintegración es un ciclo: entero, se deshace, polvo, se rearma.
    const fase = (t % 7) / 7;
    const ida = THREE.MathUtils.smoothstep(fase, 0.1, 0.48);
    const vuelta = THREE.MathUtils.smoothstep(fase, 0.55, 0.92);
    this.uniforms.uProgreso.value = ida - vuelta;

    // UV: la línea que sube de v = 0 a v = 1, y el cristal que se abre o se cierra
    this.uniforms.uBarrido.value = (t * 0.12) % 1;
    const u = this.uniforms.uDesenvolver;
    u.value += (this.abrir - u.value) * (1 - Math.exp(-3.5 * dt));
    if (Math.abs(this.abrir - u.value) < 0.001) u.value = this.abrir;

    // abierto no gira: así el mapa se queda quieto para leerlo
    this.giro = (this.giro ?? 0) + dt * 0.12 * (1 - u.value);
    this.grupo.rotation.y = this.giro;
  }

  liberar() {
    this.geometria.dispose();
    this.original.dispose();
    for (const m of this.materiales) m.dispose();
    this.grupo.removeFromParent();
  }
}

// Un prisma de 6 lados con punta, hecho con LatheGeometry (el "torno" de Blender):
// se dibuja medio perfil y se gira. 60 anillos a lo alto en vez de 3.
// Después se separan los triángulos (toNonIndexed) para darle a cada uno
// sus propios datos: su centro, un número al azar, su normal y sus coordenadas
// baricéntricas (qué tan cerca está cada pixel de cada esquina del triángulo).
function prismaConPunta() {
  const radio = 0.42, cuerpo = 2.35;
  const perfil = [new THREE.Vector2(0, 0), new THREE.Vector2(radio, 0.04)];
  for (let i = 1; i <= 44; i++) perfil.push(new THREE.Vector2(radio, 0.04 + (cuerpo - 0.04) * (i / 44)));
  for (let i = 1; i <= 16; i++) {
    const k = i / 16;
    perfil.push(new THREE.Vector2(radio * (1 - k), cuerpo + (ALTO - cuerpo) * k));
  }
  const g = new THREE.LatheGeometry(perfil, 6).toNonIndexed();

  const pos = g.attributes.position;
  const n = pos.count;
  const centro = new Float32Array(n * 3), azar = new Float32Array(n), cara = new Float32Array(n * 3), bari = new Float32Array(n * 3);
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), m = new THREE.Vector3(), nc = new THREE.Vector3();
  let semilla = 14;
  const aleatorio = () => ((semilla = (semilla * 16807) % 2147483647) / 2147483647);
  for (let t = 0; t < n; t += 3) {
    a.fromBufferAttribute(pos, t); b.fromBufferAttribute(pos, t + 1); c.fromBufferAttribute(pos, t + 2);
    m.copy(a).add(b).add(c).divideScalar(3);
    nc.subVectors(c, b).cross(a.clone().sub(b)).normalize();
    if (nc.dot(new THREE.Vector3(m.x, 0, m.z)) < 0 && m.y < ALTO - 0.05) nc.negate();   // que apunte hacia afuera
    const r = aleatorio();
    for (let k = 0; k < 3; k++) {
      centro.set([m.x, m.y, m.z], (t + k) * 3);
      cara.set([nc.x, nc.y, nc.z], (t + k) * 3);
      azar[t + k] = r;
      bari.set(k === 0 ? [1, 0, 0] : k === 1 ? [0, 1, 0] : [0, 0, 1], (t + k) * 3);
    }
  }
  g.setAttribute('aCentro', new THREE.BufferAttribute(centro, 3));
  g.setAttribute('aCara', new THREE.BufferAttribute(cara, 3));
  g.setAttribute('aAzar', new THREE.BufferAttribute(azar, 1));
  g.setAttribute('aBari', new THREE.BufferAttribute(bari, 3));
  return g;
}
