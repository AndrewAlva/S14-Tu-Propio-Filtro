// Clasifica el equipo por el nombre de su GPU, antes de crear el mundo.
// Es una estimación gruesa a propósito: cuatro escalones bastan para decidir la calidad.
// Para probar el equipo lento sin tenerlo: ?gpu=0 en la URL (0 a 3).

export function detectarTier() {
  const forzado = new URLSearchParams(location.search).get('gpu');
  if (forzado !== null) {
    const tier = Math.max(0, Math.min(3, parseInt(forzado, 10) || 0));
    console.log(`[gpu] forzado por la URL → tier ${tier}`);
    return tier;
  }

  // un contexto de prueba, solo para leer el nombre; se libera enseguida
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  if (!gl) {
    console.warn('[gpu] sin WebGL → tier 0');
    return 0;
  }
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  const nombre = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)).toLowerCase();
  gl.getExtension('WEBGL_lose_context')?.loseContext();

  const movil = /android|iphone|ipad/i.test(navigator.userAgent)
    || (navigator.maxTouchPoints > 1 && /mac/i.test(navigator.platform));   // iPad que dice ser Mac

  let tier = 2;
  if (/swiftshader|llvmpipe|software|basic render/.test(nombre)) tier = 0;
  else if (/(intel).*(hd|uhd) graphics|mali-[gt]\d{2}\b|adreno.*\b[3-5]\d\d\b/.test(nombre)) tier = 1;
  else if (/apple m\d|rtx|radeon rx|geforce gtx 1[0-9]|radeon pro/.test(nombre)) tier = 3;

  if (movil) tier = Math.min(tier, 2);   // en móvil manda la temperatura y la batería

  console.log(`[gpu] "${nombre}" → tier ${tier}`);
  return tier;
}
