// La lista de shaders del cristal. Un shader = una carpeta con su vértice,
// su fragmento y un index.js que lo describe. Para agregar el sexto,
// copia una carpeta y agrégala aquí: los botones se arman solos.

import holograma from './01-holograma/index.js';
import tornasol from './02-tornasol/index.js';
import magma from './03-magma/index.js';
import desintegrar from './04-desintegrar/index.js';
import escaner from './05-escaner/index.js';
import uvs from './00-uv/index.js';

export const shaders = [holograma, tornasol, magma, desintegrar, escaner];
export const carpetas = ['01-holograma', '02-tornasol', '03-magma', '04-desintegrar', '05-escaner'];

// El ayudante de UV va aparte (tecla 0): no es un efecto, es una herramienta para ver.
export const ayudante = { ...uvs, carpeta: '00-uv' };
