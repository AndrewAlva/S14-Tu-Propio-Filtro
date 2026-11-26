// Las perillas. Un número entra (el tier de la GPU), decisiones salen.
// Se decide una vez, antes del primer frame, y no se vuelve a tocar:
// cambiar la calidad a media experiencia se ve como un parpadeo.
//
// Si tu componente necesita una perilla (cuántas partículas, qué tan detallado),
// agrégala en esta tabla. No la escribas a mano dentro del componente.
//
// S14 · bloom: el brillo que se derrama. Es el pase más caro de la cadena
// (desenfoca la imagen varias veces): el equipo más lento (tier 0) no lo lleva.

const TABLA = [
  // tier 0 · sin GPU real o equipo muy modesto
  { dpr: 1,    antialias: false, limiteFps: 30,   segmentosTunel: 140, detalleCamara: 28, cristales: 10, bloom: false },
  // tier 1 · gráficos integrados (Intel UHD, móviles de gama media)
  { dpr: 1.25, antialias: false, limiteFps: null, segmentosTunel: 220, detalleCamara: 40, cristales: 16, bloom: true },
  // tier 2 · el caso normal
  { dpr: 1.5,  antialias: true,  limiteFps: null, segmentosTunel: 320, detalleCamara: 56, cristales: 24, bloom: true },
  // tier 3 · GPU dedicada o Apple M
  { dpr: 2,    antialias: true,  limiteFps: null, segmentosTunel: 420, detalleCamara: 72, cristales: 32, bloom: true },
];

export function elegirCalidad(tier) {
  const fila = TABLA[tier];
  const calidad = {
    tier,
    ...fila,
    dpr: Math.min(fila.dpr, window.devicePixelRatio || 1),   // nunca más píxeles de los que tiene la pantalla
  };
  console.log(`[arranque] 1 · calidad · tier ${tier}`, calidad);
  return calidad;
}
