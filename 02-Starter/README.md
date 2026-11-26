# Tu propio filtro · Starter · S14

Tu primer post-proceso: **bloom y una viñeta**, sobre la cueva de la S13. Lo que hagas aquí se copia a tu carta: es el mismo `Post.js`.

```bash
npm install
npm run dev      # localhost:5173
```

La meta está en `../01-Demo` (`localhost:5174`). Ábrela al lado.

## El pipeline

La escena ya no se dibuja directo en la pantalla. Se dibuja en una textura, pasa por una cadena de pases y el último sale a la pantalla. Es una capa de ajuste de After Effects encima de todo.

```
RenderPass   la escena, hacia una textura          luz: valores que pueden pasar de 1
Bloom        el brillo que se derrama               trabaja con luz → va ANTES del OutputPass
OutputPass   tone mapping + sRGB                    de luz a colores de pantalla
Tu viñeta    tu shader                              trabaja con lo que ves → va DESPUÉS
```

Tu shader tiene **un solo uniform**: `uVineta` (0 = nada, 1 = esquinas negras).

## Piso

Sigue los pasos en orden. Cada uno está escrito en pseudocódigo dentro del archivo.

| Paso | Archivo | Qué haces |
|---|---|---|
| 1 | `views/Cueva.js` | Importa `Post` y agrégalo al final de la lista de componentes |
| 2 | `components/Post.js` | Crea el `EffectComposer` |
| 3 | `components/Post.js` | Agrega el `RenderPass` |
| 4 | `components/Post.js` | Agrega el `UnrealBloomPass` (si la perilla `bloom` lo permite) |
| 5 | `components/Post.js` | Agrega el `OutputPass` |
| 6 | `components/Post.js` | Crea tu `ShaderPass` con `uVineta` y agrégalo |
| 7 | `components/Post.js` | `mundo.post = this` |
| A | `shaders/filtro.frag.glsl` | Prueba de vida: la cueva en negativo. Luego quítala |
| 8 | `components/Post.js` | `redimensionar`: tamaño del composer |
| B | `shaders/filtro.frag.glsl` | La viñeta |
| 9 | `components/Post.js` | `liberar` |

Lo logras cuando los cristales se derraman de luz al final de la cueva, las orillas se oscurecen, la tecla `P` apaga y prende todo, cambiar el tamaño de la ventana no estira nada y sigues a 60 fps con `?gpu=0`.

## Extensiones

1. **Viñeta redonda.** `vUv` va de 0 a 1 en x y en y, aunque la pantalla sea 16:9: por eso tu viñeta sale ovalada. Agrega un uniform `uAspecto` (ancho ÷ alto, en `redimensionar`) y multiplica `centro.x` por él.
2. **Bloom con criterio.** Mueve fuerza, radio y umbral. Decide qué debe brillar en tu carta y qué no (lo que brilla es lo emisivo o muy iluminado). Compara `?gpu=3` con `?gpu=0`, donde el bloom se apaga.
3. **La viñeta en el tiempo.** Cuando sube el telón, `views/Cueva.js` llama a `post.entrar()`. Escribe ahí un tween de GSAP que anime `uVineta`: la viñeta empieza cerrada y se abre.

¿Quieres ver hasta dónde llega esto? Abre `../03-Cristal`: cinco shaders sobre el cristal de la cueva.

## 60 FPS

Cada pase pinta **todos** los píxeles de la pantalla, en cada frame. El bloom es el más caro: desenfoca la imagen varias veces. Mide en el equipo más lento del grupo con `?gpu=0`, y con `P` compara con y sin filtro.

## Lo que va a fallar (y por qué)

| Síntoma | Causa |
|---|---|
| Los colores se ven lavados o distintos que sin post | Falta el `OutputPass` |
| Cambio `uVineta` y no pasa nada | `ShaderPass` copió los uniforms: escribe en `this.filtro.uniforms` |
| Se ve negro donde antes había HTML detrás | Tu shader escribe `1.0` en el alfa: usa `escena.a` |
| Bordes serruchados | El render target no tiene `samples` |
| El bloom no brilla nada | El umbral está muy alto, o nada en tu escena pasa de 1 |
| Error de shader en la consola | Un número sin punto (`1` en vez de `1.0`), una ñ o un acento en un nombre |
| Todo va más lento después de un rato | `liberar()` no libera |
| El texto de tu landing no se ve afectado | Es correcto: el post solo toca el canvas, no el HTML |

## Preguntas de defensa · 3 de diciembre

Si llevas tu filtro a tu carta, te voy a preguntar:

1. ¿Qué brilla en tu carta, y por qué eso?
2. ¿Qué le hace tu viñeta a la mirada de quien entra?
3. ¿Cuánto cuesta tu post, y cómo lo mediste?
4. ¿Qué ve alguien en el tier bajo?

## Bitácora de IA

| Fecha | Qué consulté | Qué acepté | Qué descarté y por qué |
|---|---|---|---|
| | | | |
