# El cristal de la cueva · Cinco shaders · S14

Una demo para mirar, leer y tomar ideas. El mismo cristal de la cueva (S13), con cinco shaders escritos a mano y un ayudante para ver sus UV. Cada shader tiene su vertex shader (mueve los vértices) y su fragment shader (pinta los píxeles).

```bash
npm install
npm run dev      # localhost:5175
```

## Controles

| Tecla o botón | Qué hace |
|---|---|
| `1` … `5` | Prende ese shader. Si ya estaba prendido, regresa al original |
| `0` | El ayudante de UV, con su mapa a la derecha. Otra vez `0`: el original |
| `U` | Abre el cristal en su mapa UV y lo vuelve a cerrar |
| `Esc` | El cristal original (`MeshStandardMaterial`) |
| `B` | Prende y apaga el bloom |
| Arrastrar · rueda | Girar alrededor del cristal · acercarse |
| `?gpu=0` | El equipo más lento: sin bloom, sin antialiasing, resolución 1 |

## Los cinco

| # | Shader | Vértice | Fragmento | La idea que vale la pena robar |
|---|---|---|---|---|
| 1 | Holograma | Franjas al azar que se corren de lado (glitch) | Fresnel, líneas, escaneo, parpadeo · mezcla aditiva | `step(0.9, azar(...))`: algo que pasa *a veces* |
| 2 | Tornasol | Torsión que crece hacia la punta y una onda que lo ensancha | Color por ángulo de vista con paleta de coseno · brillo · destellos | Un número de 0 a 1 se vuelve un degradado entero |
| 3 | Magma | Ruido que sube y empuja la superficie | Ruido deformado por ruido (domain warping) · venas que laten | `fbm(q + fbm(q))`: lo que hace que algo parezca líquido |
| 4 | Desintegrar | Cada triángulo gira, se encoge y vuela según `uProgreso` | Brasa al soltarse · `discard` cuando ya es polvo | Atributos por triángulo: centro, normal y azar propios |
| 5 | Escáner | Un anillo con forma de campana empuja la malla | Líneas de malla con coordenadas baricéntricas y `fwidth` | El varying interpolado como herramienta de dibujo |

## El ayudante de UV (tecla 0)

No es un efecto: muestra el dato que ningún otro shader usa, el atributo `uv`. Es el checker de prueba que pones en Blender antes de texturizar.

- **El color es la coordenada.** `u` pinta rojo y `v` pinta verde: (0,0) es negro y (1,1) es amarillo. Un cuadro por cara a lo ancho (6) y doce a lo alto.
- **La costura, en amarillo.** Es la arista donde `u` salta de 1 a 0. En el mapa son las orillas izquierda y derecha: dos líneas del mapa, una sola arista del cristal.
- **El barrido.** La línea blanca marca todos los pixeles con la misma `v`. Sube del pie a la punta en el cristal y en el mapa al mismo tiempo.
- **El mouse.** Pasa el mouse por un cristal: el anillo blanco se pinta en la superficie y en el mapa, en el mismo (u, v). Los siete cristales comparten geometría, así que el anillo sale en los siete.
- **Desenvolver (`U`).** El vertex shader pone cada vértice en su (u, v) sobre un plano de frente a la cámara: el cristal se abre como en el UV Editor. Cerrado, el anillo sale estirado; abierto, sale redondo. Esa diferencia es la distorsión del unwrap.
- **`v` cuenta puntos, no distancia.** `LatheGeometry` reparte `v` entre los 62 puntos del perfil. Por eso el pie (todo el disco de la base) cabe en un renglón delgado del mapa y la punta ocupa más de lo que mide.

El mapa de la derecha (`components/MapaUV.js`) dibuja los 732 triángulos con los `uv` reales de la geometría. Sus colores son aproximados: la escena pasa por el tone mapping y el mapa no.

## Dónde está cada cosa

```
src/
├── main.js                  escena, cámara, bloom, botones y el único loop
├── components/
│   ├── Cristal.js           la geometría y el cambio de material
│   ├── MapaUV.js            el mapa UV en 2D, para el ayudante
│   └── Monticulo.js         el musgo, la luz y el polvo
└── shaders/
    ├── comun.glsl           azar, ruido, fbm, paleta, giro (se pega antes de cada shader)
    ├── index.js             la lista: un shader = una carpeta
    ├── 00-uv/               el ayudante: vertice.glsl · fragmento.glsl · index.js
    ├── 01-holograma/        vertice.glsl · fragmento.glsl · index.js
    ├── 02-tornasol/
    ├── 03-magma/
    ├── 04-desintegrar/
    └── 05-escaner/
```

**Para agregar el sexto:** copia una carpeta, cambia sus dos `.glsl` y su `index.js`, y agrégala a `shaders/index.js`. El botón aparece solo.

## Tres detalles de la geometría

1. **Más vértices.** El prisma de la cueva tenía 3 anillos a lo alto. Este tiene 60. El vertex shader solo puede mover vértices que existen: sin anillos, no hay onda.
2. **Triángulos sueltos.** `toNonIndexed()` separa los triángulos para que cada uno tenga sus propios datos (`aCentro`, `aCara`, `aAzar`, `aBari`). Sin eso, la desintegración y el escáner no existen.
3. **Facetas sin normales.** Los shaders calculan la normal de cada cara con `cross(dFdx(pos), dFdy(pos))`. Así se ve facetada aunque el vertex shader la haya deformado.

## 60 FPS

Mira la lectura de arriba a la derecha y prueba `?gpu=0`. Lo caro aquí es el bloom, no los shaders: el cristal tiene 2 196 vértices; la pantalla, millones de píxeles.

## Si tomas una idea

Cítala en tu bitácora: qué tomaste de aquí, qué cambiaste y por qué encaja con tu género.
