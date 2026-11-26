import * as THREE from 'three';

// El escenario: el montículo de musgo, la luz verde de los cristales y polvo flotando.
// Todo con materiales normales de Three.js: el protagonista es el cristal.

export class Monticulo {
  constructor({ escena, calidad }) {
    this.grupo = new THREE.Group();
    escena.add(this.grupo);

    this.roca = new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}textures/roca.jpg`);
    this.roca.colorSpace = THREE.SRGBColorSpace;
    this.roca.wrapS = this.roca.wrapT = THREE.RepeatWrapping;
    this.roca.repeat.set(3, 2);
    this.base = new THREE.Mesh(
      new THREE.SphereGeometry(3.6, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x4d6b38, roughness: 1, map: this.roca }),
    );
    this.base.scale.y = 0.32;
    this.base.position.y = -0.9;
    this.grupo.add(this.base);

    this.luz = new THREE.PointLight(0x3dff95, 12, 16, 1.6);
    this.luz.position.set(1.8, 3.6, 2.6);   // arriba y al frente: que ilumine sin quemar la punta
    this.grupo.add(this.luz, new THREE.HemisphereLight(0x3d6a52, 0x050806, 1.4));

    // polvo: puntos que suben despacio, como en el haz de la cueva
    const cuantos = calidad.lento ? 150 : 500;
    const p = new Float32Array(cuantos * 3);
    for (let i = 0; i < cuantos; i++) p.set([(Math.random() - 0.5) * 9, Math.random() * 6 - 1, (Math.random() - 0.5) * 9], i * 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    this.polvo = new THREE.Points(g, new THREE.PointsMaterial({
      color: 0x9dffc8, size: 0.03, transparent: true, opacity: 0.6,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    this.grupo.add(this.polvo);
  }

  actualizar(dt, t) {
    this.polvo.position.y = (t * 0.08) % 1;   // sube y vuelve a empezar
    this.luz.intensity = 12 + Math.sin(t * 1.7) * 1.5;
  }

  liberar() {
    this.base.geometry.dispose(); this.base.material.dispose(); this.roca.dispose();
    this.polvo.geometry.dispose(); this.polvo.material.dispose();
    this.grupo.removeFromParent();
  }
}
