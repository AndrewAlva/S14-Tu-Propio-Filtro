import * as THREE from 'three';

// La roca que rodea la cámara mientras bajas: el túnel y la bóveda donde desemboca.
// Las dos son geometría "volteada" (BackSide): las ves desde adentro.
// La roca no se modela: se deforma una forma simple con ruido.

export class Pasillo {
  constructor({ escena, camara, calidad, recorrido }) {
    this.grupo = new THREE.Group();
    this.calidad = calidad;
    escena.add(this.grupo);

    // una sola material para toda la roca: un shader, un programa en la GPU
    this.material = new THREE.MeshStandardMaterial({
      color: 0x8c9a8c,
      roughness: 0.95,
      metalness: 0,
      bumpScale: 0.8,
      side: THREE.BackSide,
    });

    // --- el túnel ---
    const tunel = new THREE.TubeGeometry(recorrido.curvaTunel, calidad.segmentosTunel, 2.4, 22, false);
    deformar(tunel, (p) => 0.3 + ruido(p, 0.35) * 1.1 + ruido(p, 1.3) * 0.25);
    escalarUV(tunel, 8, 3);   // ~45 m de largo y ~15 de vuelta: mosaicos de ~5 m. La vuelta va en entero o se ve la costura
    this.grupo.add(new THREE.Mesh(tunel, this.material));

    // --- la bóveda ---
    const boveda = new THREE.IcosahedronGeometry(recorrido.radio, calidad.detalleCamara);
    aplanarPiso(boveda, recorrido.radio);
    deformar(boveda, (p) => ruido(p, 0.18) * 2.4 + ruido(p, 0.7) * 0.6);
    proyectarUV(boveda, 0.16);   // un mosaico cada ~6 m, igual que en el túnel
    boveda.translate(recorrido.centro.x, recorrido.centro.y, recorrido.centro.z);
    this.grupo.add(new THREE.Mesh(boveda, this.material));

    // una luz tenue que viaja con quien mira: sin ella el pasillo sería negro
    this.mirada = new THREE.PointLight(0xffd9a8, 14, 18, 1.3);
    this.mirada.position.set(0, 0.4, 0);
    camara.add(this.mirada);
    this.grupo.add(new THREE.AmbientLight(0x1b2a24, 0.6));
  }

  async cargar(cargador) {
    // Crítica: llega antes de que suba el telón. La comparten varios componentes,
    // por eso la escala vive en las UV de cada geometría y no en roca.repeat.
    const roca = await cargador.textura('roca');
    this.material.map = roca;
    this.material.bumpMap = roca;
    this.material.needsUpdate = true;
  }

  actualizar(dt, t) {
    this.mirada.intensity = 14 + Math.sin(t * 2.3) * 0.5;   // respira, apenas
  }

  redimensionar(ancho, alto) {}

  liberar() {
    this.grupo.traverse((o) => o.geometry?.dispose());
    this.material.map?.dispose();
    this.material.dispose();
    this.mirada.removeFromParent();
    this.grupo.removeFromParent();
  }
}

// --- herramientas de forma (solo las usa este componente) ---

// Empuja cada vértice a lo largo de su normal original. El túnel y la bóveda traen
// normales radiales (hacia afuera): un número positivo agranda el hueco.
// Se usan las de fábrica y no unas recalculadas: si dos vértices están en el mismo
// punto, tienen que moverse igual o se abre una grieta.
function deformar(geometria, cuanto) {
  const pos = geometria.attributes.position;
  const nor = geometria.attributes.normal;
  const p = new THREE.Vector3(), n = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i);
    n.fromBufferAttribute(nor, i);
    p.addScaledVector(n, cuanto(p));
    pos.setXYZ(i, p.x, p.y, p.z);
  }
  geometria.computeVertexNormals();
}

function escalarUV(geometria, u, v) {
  const uv = geometria.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * u, uv.getY(i) * v);
}

// Las UV de una esfera se juntan en los polos: justo en el piso, la textura se estira
// como estrella. Aquí cada triángulo se proyecta desde el lado al que mira (como el
// "box mapping" de Blender o C4D): el piso desde arriba, las paredes desde el costado.
function proyectarUV(geometria, escala) {
  const pos = geometria.attributes.position;
  const uv = geometria.attributes.uv;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  const n = new THREE.Vector3();
  for (let i = 0; i < pos.count; i += 3) {
    a.fromBufferAttribute(pos, i); b.fromBufferAttribute(pos, i + 1); c.fromBufferAttribute(pos, i + 2);
    n.subVectors(c, b).cross(a.clone().sub(b));
    const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
    for (let k = 0; k < 3; k++) {
      const v = [a, b, c][k];
      if (ay >= ax && ay >= az) uv.setXY(i + k, v.x * escala, v.z * escala);
      else if (ax >= az)        uv.setXY(i + k, v.z * escala, v.y * escala);
      else                      uv.setXY(i + k, v.x * escala, v.y * escala);
    }
  }
}

// El fondo de la bóveda se aplana para que haya un piso donde poner los cristales.
function aplanarPiso(geometria, radio) {
  const pos = geometria.attributes.position;
  const piso = -radio * 0.62;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y < piso) pos.setY(i, piso + (y - piso) * 0.15);
  }
}

// Ruido de valor en 3D con dos octavas. Mismo punto, mismo valor:
// por eso los vértices repetidos se mueven igual y no se abren grietas.
function ruido(p, escala) {
  return (valor(p.x * escala, p.y * escala, p.z * escala) * 0.7
        + valor(p.x * escala * 2.1, p.y * escala * 2.1, p.z * escala * 2.1) * 0.3) * 2 - 1;
}

function valor(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = suave(x - xi), yf = suave(y - yi), zf = suave(z - zi);
  const h = (a, b, c) => {
    const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const l = (a, b, k) => a + (b - a) * k;
  return l(
    l(l(h(xi, yi, zi), h(xi + 1, yi, zi), xf), l(h(xi, yi + 1, zi), h(xi + 1, yi + 1, zi), xf), yf),
    l(l(h(xi, yi, zi + 1), h(xi + 1, yi, zi + 1), xf), l(h(xi, yi + 1, zi + 1), h(xi + 1, yi + 1, zi + 1), xf), yf),
    zf,
  );
}

function suave(k) {
  return k * k * (3 - 2 * k);
}
