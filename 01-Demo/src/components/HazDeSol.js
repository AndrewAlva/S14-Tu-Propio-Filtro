import * as THREE from 'three';
import vertice from '../shaders/haz.vert.glsl?raw';
import fragmento from '../shaders/haz.frag.glsl?raw';

// La luz que entra por el techo de la bóveda.
// Son tres piezas que trabajan juntas:
//   - el hoyo: un disco brillante donde está el cielo
//   - el haz: un cono con un shader propio que se suma a lo que hay detrás (aditivo)
//   - la luz real: un SpotLight que ilumina el piso donde cae el haz

export class HazDeSol {
  constructor({ escena, calidad, recorrido }) {
    this.grupo = new THREE.Group();
    this.calidad = calidad;
    escena.add(this.grupo);

    const { centro, radio } = recorrido;
    const techo = centro.y + radio * 0.86;
    const piso = centro.y - radio * 0.62;
    const alto = techo - piso;

    // el hoyo
    this.cielo = new THREE.Mesh(
      new THREE.CircleGeometry(1.3, 32),
      new THREE.MeshBasicMaterial({ color: 0xfff1d0, fog: false }),
    );
    this.cielo.position.set(centro.x, techo + 0.4, centro.z);
    this.cielo.rotation.x = Math.PI / 2;   // mira hacia abajo
    this.grupo.add(this.cielo);

    // el haz: más angosto arriba que abajo, abierto en los extremos
    this.uniforms = {
      uTiempo: { value: 0 },
      uIntensidad: { value: 0.55 },
      uColor: { value: new THREE.Color(0xffe2b0) },
    };
    this.haz = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 3.8, alto, 48, 1, true),
      new THREE.ShaderMaterial({
        vertexShader: vertice,
        fragmentShader: fragmento,
        uniforms: this.uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    );
    this.haz.position.set(centro.x, piso + alto / 2, centro.z);
    this.grupo.add(this.haz);

    // la luz que de verdad toca la roca
    this.sol = new THREE.SpotLight(0xffe2b0, 900, alto * 1.6, 0.32, 0.7, 1.6);
    this.sol.position.set(centro.x, techo, centro.z);
    this.sol.target.position.set(centro.x, piso, centro.z);
    this.grupo.add(this.sol, this.sol.target);
  }

  async cargar(cargador) {}   // no tiene assets: todo es geometría y shader

  actualizar(dt, t) {
    this.uniforms.uTiempo.value = t;
  }

  redimensionar(ancho, alto) {}

  liberar() {
    this.cielo.geometry.dispose(); this.cielo.material.dispose();
    this.haz.geometry.dispose(); this.haz.material.dispose();
    this.grupo.removeFromParent();
  }
}
