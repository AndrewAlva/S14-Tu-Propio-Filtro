import vertice from './vertice.glsl?raw';
import fragmento from './fragmento.glsl?raw';

export default {
  nombre: 'Desintegrar',
  idea: 'Se deshace en ceniza desde la punta y se vuelve a armar. Cada triángulo vuela por su cuenta.',
  textos: {
    vertice: 'Cada triángulo gira, se encoge y vuela según uProgreso.',
    fragmento: 'Brasa al soltarse; discard cuando ya es polvo.',
  },
  vertice,
  fragmento,
  opciones: {},
};
