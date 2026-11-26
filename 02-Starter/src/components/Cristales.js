import * as THREE from 'three';

// Los cristales del fondo. Están apagados casi todo el recorrido;
// al final se encienden y su luz verde alumbra el resto de la bóveda.
// Son muchos objetos iguales: un solo InstancedMesh, una sola llamada de dibujo.

export class Cristales {
  constructor({ escena, calidad, recorrido }) {
    this.grupo = new THREE.Group();
    this.calidad = calidad;
    this.recorrido = recorrido;
    escena.add(this.grupo);
    this.grupo.position.copy(recorrido.cristales);

    // Truco del estudio: la textura real es diferida (llega después del telón).
    // Mientras tanto usan una de 1×1 px. Así el shader ya se compila CON textura
    // bajo el telón, y cuando llega la real solo hay que subirla, no recompilar.
    this.provisional = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
    this.provisional.needsUpdate = true;

    // el montículo de musgo
    this.monticulo = new THREE.Mesh(
      new THREE.SphereGeometry(3.6, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x4d6b38, roughness: 1 }),
    );
    this.monticulo.scale.y = 0.45;
    this.monticulo.position.y = -0.35;   // hundido un poco, para que no se vea su base plana
    this.grupo.add(this.monticulo);

    // un prisma hexagonal con punta, girado sobre su eje
    const perfil = [
      new THREE.Vector2(0, 0), new THREE.Vector2(0.24, 0.04),
      new THREE.Vector2(0.24, 1), new THREE.Vector2(0, 1.4),
    ];
    const prisma = new THREE.LatheGeometry(perfil, 6);

    this.material = new THREE.MeshStandardMaterial({
      color: 0xa8ffcf,
      emissive: 0x2dff8a,
      emissiveIntensity: 0.12,
      roughness: 0.25,
      metalness: 0.1,
      flatShading: true,
      map: this.provisional,
      emissiveMap: this.provisional,
    });

    this.cuerpos = new THREE.InstancedMesh(prisma, this.material, calidad.cristales);
    colocar(this.cuerpos, calidad.cristales);
    this.grupo.add(this.cuerpos);

    // la luz que se enciende con ellos
    this.luz = new THREE.PointLight(0x3dff95, 0, 34, 1.6);
    this.luz.position.set(0, 2.2, 0);
    this.grupo.add(this.luz);
    this.encendidos = false;
  }

  async cargar(cargador) {
    // El musgo reusa la roca, que es crítica: un mismo archivo, dos componentes.
    const roca = await cargador.textura('roca');
    this.monticulo.material.map = roca;
    this.monticulo.material.needsUpdate = true;

    // No se espera con await: la textura es diferida y no debe detener el telón.
    // Cuando llegue (paso 7), reemplaza a la provisional.
    cargador.textura('cristal').then((textura) => {
      this.material.map = textura;
      this.material.emissiveMap = textura;
      // mismo programa de shader (ya tenía textura), así que no hace falta needsUpdate:
      // la subida a la GPU ocurre en el primer frame que se dibujen. Ahí puede haber un tirón.
    });
  }

  actualizar(dt, t) {
    const encendido = THREE.MathUtils.smoothstep(this.recorrido.progreso, 0.72, 0.97);
    const pulso = 1 + Math.sin(t * 1.7) * 0.06;
    this.material.emissiveIntensity = 0.12 + encendido * 1.5 * pulso;
    this.luz.intensity = encendido * 45 * pulso;

    if (encendido > 0.5 && !this.encendidos) {
      this.encendidos = true;
      console.log('  · cristales encendidos');
    }
  }

  redimensionar(ancho, alto) {}

  liberar() {
    this.cuerpos.geometry.dispose();
    this.cuerpos.dispose();
    this.material.map?.dispose();
    this.material.dispose();
    this.provisional.dispose();
    this.monticulo.geometry.dispose();
    this.monticulo.material.dispose();
    this.grupo.removeFromParent();
  }
}

// Reparte los cristales sobre el montículo: los del centro más altos,
// inclinados hacia afuera como si crecieran desde un mismo núcleo.
function colocar(instancias, cuantos) {
  const azar = semilla(14);   // siempre el mismo acomodo
  const o = new THREE.Object3D();
  for (let i = 0; i < cuantos; i++) {
    const angulo = azar() * Math.PI * 2;
    const distancia = Math.sqrt(azar()) * 2.6;
    const x = Math.cos(angulo) * distancia, z = Math.sin(angulo) * distancia;
    const y = Math.sqrt(Math.max(0, 1 - (distancia / 3.6) ** 2)) * 3.6 * 0.45 - 0.5;
    o.position.set(x, y, z);
    o.rotation.set(z * 0.22 + (azar() - 0.5) * 0.4, azar() * Math.PI, -x * 0.22 + (azar() - 0.5) * 0.4);
    const s = (1 - distancia / 3.2) * 1.6 + 0.5 + azar() * 0.5;
    o.scale.set(s * 0.8, s, s * 0.8);
    o.updateMatrix();
    instancias.setMatrixAt(i, o.matrix);
  }
}

function semilla(n) {
  return () => {
    n = (n * 16807) % 2147483647;
    return n / 2147483647;
  };
}
