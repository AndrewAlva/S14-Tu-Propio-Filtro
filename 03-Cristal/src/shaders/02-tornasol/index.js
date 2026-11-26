import vertice from './vertice.glsl?raw';
import fragmento from './fragmento.glsl?raw';

export default {
  nombre: 'Tornasol',
  idea: 'Un ópalo vivo: cambia de color según desde dónde lo mires, y se tuerce al respirar.',
  textos: {
    vertice: 'Torsión que crece hacia la punta y una onda que lo ensancha.',
    fragmento: 'Color por ángulo de vista (paleta de coseno), brillo y destellos.',
  },
  vertice,
  fragmento,
  opciones: {},
};
