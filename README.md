# S14-Tu-Propio-Filtro
Introducción a efectos de Post-procesado, GLSL y Shaders en Three.js

Taller de la sesión 14 de **Interacción y Renderizado Web Avanzado** (CC325-21, CENTRO).
Tu primer post-proceso: **bloom y una viñeta escrita por ti en GLSL**, en un solo archivo. Todo sobre **la cueva de la S13**, con la misma estructura que tu proyecto final.

| Carpeta | Para qué | Puerto |
|---|---|---|
| `02-Starter/` | **Aquí trabajas.** La cueva con `Post.js` y `filtro.frag.glsl` en pasos comentados. | `localhost:5173` |
| `01-Demo/` | **La meta.** La versión resuelta, con sus extensiones. Ábrela para ver a dónde vas y para comparar tu código. | `localhost:5174` |
| `03-Cristal/` | **Demo especial.** El cristal de la cueva con cinco shaders (holograma, tornasol, magma, desintegrar y escáner), cada uno con su vertex y su fragment shader. Botones para cambiarlos. | `localhost:5175` |

## Correr las dos

Dos terminales, una por carpeta:

```bash
# terminal 1
cd 02-Starter
npm install
npm run dev
```

```bash
# terminal 2
cd 01-Demo
npm install
npm run dev
```

## En las dos

| Tecla o URL | Qué hace |
|---|---|
| `P` | Apaga y prende el post-proceso. Para comparar y para medir cuánto cuesta |
| `?gpu=0` … `?gpu=3` | Fuerza el tier de calidad. `?gpu=0` simula el equipo más lento (sin bloom) |
| `?lento` | Red simulada lenta, para ver el loader con calma |

Abajo a la izquierda está la lectura en vivo: tier, resolución, fps y si el post está prendido.

Para ver los cinco shaders del cristal, en una tercera terminal:

```bash
cd 03-Cristal
npm install
npm run dev
```

## Qué cambió respecto a la cueva de la S13

Si copiaste `core/` de la cueva a tu carta, esto es lo único de `core/` que cambia:

- `core/Mundo.js` · `this.post = null` en el constructor y un `if` en `render()`: si hay post-proceso, él dibuja.

Lo demás es nuevo y vive donde debe:

- `components/Post.js` · el post-proceso, con el contrato de siempre más un `render()`.
- `shaders/filtro.vert.glsl` · `shaders/filtro.frag.glsl` · la viñeta.
- `config/calidad.js` · una perilla nueva: `bloom`.
- `views/Cueva.js` · registra `Post`, la tecla `P` y avisa a `post.entrar()` al subir el telón.

Las instrucciones del ejercicio están en [`02-Starter/README.md`](02-Starter/README.md).
