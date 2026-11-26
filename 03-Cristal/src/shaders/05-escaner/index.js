import vertice from './vertice.glsl?raw';
import fragmento from './fragmento.glsl?raw';

export default {
  nombre: 'Escáner',
  idea: 'Rayos X de neón: se ve la malla de triángulos y un anillo la recorre de abajo hacia arriba.',
  textos: {
    vertice: 'Un anillo con forma de campana empuja la malla al subir.',
    fragmento: 'Líneas con coordenadas baricéntricas y fwidth.',
  },
  vertice,
  fragmento,
  opciones: {},
};
