# Tu propio filtro · Demo · S14

> **Versión resuelta · solución docente.** Es la referencia de la meta: ábrela para ver a dónde vas y para comparar tu código cuando te atores. No la copies a tu carta sin poder defender cada línea.

```bash
npm install
npm run dev      # localhost:5174
```

## Qué hace

1. **Bloom.** El haz de sol y los cristales encendidos se derraman de luz. El tier 0 no lo lleva (`?gpu=0`).
2. **Viñeta.** Un shader de una sola idea: oscurecer las orillas. Un uniform, `uVineta`.
3. **Extensión 1.** La viñeta es redonda: `uAspecto` corrige la proporción de la pantalla.
4. **Extensión 3.** Al subir el telón, GSAP anima `uVineta` de 1.6 a 0.6: la viñeta se abre.

## Dónde está cada cosa

| Pregunta | Archivo |
|---|---|
| ¿Qué pases hay y en qué orden? | `components/Post.js` |
| ¿Qué le pasa a cada pixel? | `shaders/filtro.frag.glsl` |
| ¿Quién tiene bloom? | `config/calidad.js` |
| ¿Quién llama a `post.render()`? | `core/Mundo.js` · `render()` |
| ¿Quién llama a `post.entrar()`? | `views/Cueva.js` · `entrar()` |

## Para la clase

- `P` apaga y prende el post: la misma cueva, otra película.
- `?gpu=0` contra `?gpu=3`: la misma cueva, sin bloom ni antialiasing.
