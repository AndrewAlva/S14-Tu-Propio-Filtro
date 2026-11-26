// Punto de entrada. No crea cristales ni escribe shaders:
// llama a cada pieza en orden y espera a que termine.
// Cada await es una fase de la experiencia. Lee solo los comentarios numerados.

import './style.css';
import { assets } from './config/assets.js';
import { elegirCalidad } from './config/calidad.js';
import { detectarTier } from './core/gpu.js';
import { Cargador } from './core/Cargador.js';
import { Mundo } from './core/Mundo.js';
import { Reloj } from './core/Reloj.js';
import { precalentar } from './core/Precalentar.js';
import { PantallaCarga } from './views/PantallaCarga.js';
import { Cueva } from './views/Cueva.js';

const calidad = elegirCalidad(detectarTier());   // 1 · antes de crear nada

const telon = new PantallaCarga();                // 2 · el loader
const cargador = new Cargador(assets.criticos, telon);
cargador.reservar(1);                             // una tarea que no es archivo

const mundo = new Mundo(calidad);                 // 3 · el mundo 3D
Reloj.iniciar(mundo);

const cueva = new Cueva(mundo, calidad);          // 4 · la primera vista
await cargador.archivos();
await cueva.cargar(cargador);

await precalentar(mundo, cueva.escena);           // 5 · todo a la GPU
cargador.entregar(1);                             //     → 100 %

await telon.salir();                              // 6 · sube el telón
cueva.entrar();
cargador.despues(assets.diferidos);               // 7 · lo demás, detrás
