import vertice from './vertice.glsl?raw';
import fragmento from './fragmento.glsl?raw';

// El ayudante de UV (tecla 0). No es un efecto: muestra el dato que todos
// los demás podrían usar y no usan. Con U, el cristal se abre en su mapa.
export default {
  nombre: 'UV',
  idea: 'Un ayudante, no un efecto: pinta en el cristal sus coordenadas de textura. u le da la vuelta; v sube del pie a la punta.',
  textos: {
    vertice: 'Pasa uv al fragmento. Con U, pone cada vértice en su (u, v) y el cristal se abre.',
    fragmento: 'u → rojo, v → verde, un cuadro por cara, la costura en amarillo y el mouse.',
  },
  vertice,
  fragmento,
  opciones: {},
};
