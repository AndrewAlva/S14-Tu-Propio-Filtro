import * as THREE from 'three';
import vertice from './vertice.glsl?raw';
import fragmento from './fragmento.glsl?raw';

export default {
  nombre: 'Holograma',
  idea: 'Un cristal que no está ahí: luz que se suma a lo de atrás y una señal que a veces falla.',
  textos: {
    vertice: 'Franjas al azar que se corren de lado: el glitch.',
    fragmento: 'Fresnel, líneas que suben, escaneo y parpadeo.',
  },
  vertice,
  fragmento,
  opciones: { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending },
};
