// El mapa UV del cristal (los siete comparten geometría, así que es el mismo), en un canvas 2D encima de la escena.
// Es el UV Editor de Blender: el cuadro de 0 a 1 y, encima, cada triángulo
// dibujado donde dicen sus uv (los saca de la geometría real, no de un dibujo).
// Cada frame agrega lo que también pinta el shader: el barrido y el mouse.

const CARAS = 6;      // columnas: los lados del prisma (LatheGeometry con 6 segmentos)
const ANILLOS = 61;   // renglones: los tramos del perfil (62 puntos)
const M = { izq: 30, arr: 14, der: 66, aba: 28 };   // márgenes para los rótulos
const LADO = 236;     // el cuadro de 0 a 1, en píxeles CSS
const AMARILLO = '#f0ff42';

export class MapaUV {
  constructor({ geometria }) {
    this.el = document.createElement('aside');
    this.el.className = 'mapa-uv';
    this.el.hidden = true;
    this.el.innerHTML = '<p class="rotulo">Mapa UV · el mismo en los siete</p><canvas aria-hidden="true"></canvas><p class="mapa-uv__lectura"></p>';
    document.body.append(this.el);
    this.lienzo = this.el.querySelector('canvas');
    this.lectura = this.el.querySelector('.mapa-uv__lectura');

    this.dpr = Math.min(devicePixelRatio || 1, 2);
    this.ancho = M.izq + LADO + M.der;
    this.alto = M.arr + LADO + M.aba;
    this.lienzo.style.width = `${this.ancho}px`;
    this.lienzo.style.height = `${this.alto}px`;
    this.lienzo.width = Math.round(this.ancho * this.dpr);
    this.lienzo.height = Math.round(this.alto * this.dpr);
    this.g = this.lienzo.getContext('2d');
    this.fondo = this.dibujarFondo(geometria);
  }

  // de (u, v) a píxeles: v crece hacia arriba, el canvas hacia abajo
  x(u) { return M.izq + u * LADO; }
  y(v) { return M.arr + (1 - v) * LADO; }

  // Lo que no cambia: el degradado, los cuadros, los triángulos y los rótulos.
  dibujarFondo(geometria) {
    const c = document.createElement('canvas');
    c.width = this.lienzo.width; c.height = this.lienzo.height;
    const g = c.getContext('2d');
    g.scale(this.dpr, this.dpr);

    // el mismo color que el shader: u → rojo, v → verde, 6 × 12 cuadros
    const n = Math.round(LADO * this.dpr);
    const img = g.createImageData(n, n);
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const u = (i + 0.5) / n, v = 1 - (j + 0.5) / n;
        const cuadro = (Math.floor(u * 6) + Math.floor(v * 12)) % 2;
        const k = (0.55 + 0.45 * cuadro) * 0.75;
        const p = (j * n + i) * 4;
        img.data[p] = 255 * Math.pow(u * k, 1 / 2.2);   // de luz a pantalla, aproximado
        img.data[p + 1] = 255 * Math.pow(v * k, 1 / 2.2);
        img.data[p + 2] = 255 * Math.pow(0.3 * k, 1 / 2.2);
        img.data[p + 3] = 255;
      }
    }
    g.putImageData(img, Math.round(M.izq * this.dpr), Math.round(M.arr * this.dpr));

    // los triángulos, en su lugar del mapa
    const uv = geometria.attributes.uv;
    g.strokeStyle = 'rgba(0, 0, 0, .35)';
    g.lineWidth = 0.6;
    g.beginPath();
    for (let t = 0; t < uv.count; t += 3) {
      g.moveTo(this.x(uv.getX(t)), this.y(uv.getY(t)));
      g.lineTo(this.x(uv.getX(t + 1)), this.y(uv.getY(t + 1)));
      g.lineTo(this.x(uv.getX(t + 2)), this.y(uv.getY(t + 2)));
      g.closePath();
    }
    g.stroke();

    // la costura: la orilla izquierda y la derecha son la misma arista del cristal
    g.strokeStyle = AMARILLO;
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(this.x(0), this.y(0)); g.lineTo(this.x(0), this.y(1));
    g.moveTo(this.x(1), this.y(0)); g.lineTo(this.x(1), this.y(1));
    g.stroke();

    g.font = '500 10px ui-monospace, Menlo, monospace';
    g.fillStyle = '#6f7d6c';
    g.fillText('(0,0)', this.x(0) - 4, this.y(0) + 14);
    g.fillText('(1,1)', this.x(1) - 26, this.y(1) - 3);
    g.fillStyle = '#d8e3d4';
    g.fillText('u →', this.x(0.5) - 10, this.y(0) + 14);
    g.save(); g.translate(this.x(0) - 10, this.y(0.5) + 10); g.rotate(-Math.PI / 2); g.fillText('v →', 0, 0); g.restore();

    // a lo alto, v cuenta puntos del perfil, no distancia: por eso el pie
    // (todo el disco de la base) cabe en un renglón delgado
    const tramos = [['punta', 45, 61], ['cuerpo', 1, 45], ['pie', 0, 1]];
    for (const [nombre, a, b] of tramos) {
      const y0 = this.y(a / ANILLOS), y1 = this.y(b / ANILLOS);
      g.strokeStyle = '#6f7d6c'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(this.x(1) + 8, y0 - 1); g.lineTo(this.x(1) + 12, y0 - 1); g.lineTo(this.x(1) + 12, y1 + 1); g.lineTo(this.x(1) + 8, y1 + 1); g.stroke();
      g.fillStyle = '#d8e3d4';
      g.fillText(nombre, this.x(1) + 17, (y0 + y1) / 2 + 3);
    }
    g.fillStyle = AMARILLO;
    g.fillText('costura', this.x(1) + 17, this.y(0) + 14);
    return c;
  }

  // punto = { u, v } o null; barrido = la v de la línea blanca
  actualizar(punto, barrido) {
    if (this.el.hidden) return;
    const g = this.g;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, this.lienzo.width, this.lienzo.height);
    g.drawImage(this.fondo, 0, 0);
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    g.strokeStyle = '#fff'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(this.x(0), this.y(barrido)); g.lineTo(this.x(1), this.y(barrido)); g.stroke();

    if (punto) {
      // la celda: una cara a lo ancho, un tramo del perfil a lo alto (dos triángulos)
      const cara = Math.min(CARAS - 1, Math.floor(punto.u * CARAS));
      const anillo = Math.min(ANILLOS - 1, Math.floor(punto.v * ANILLOS));
      g.fillStyle = 'rgba(255, 255, 255, .45)';
      g.fillRect(this.x(cara / CARAS), this.y((anillo + 1) / ANILLOS), LADO / CARAS, LADO / ANILLOS);
      // el mismo anillo que pinta el shader: radio 0.05 en UV
      g.strokeStyle = '#fff'; g.lineWidth = 1.5;
      g.beginPath(); g.arc(this.x(punto.u), this.y(punto.v), 0.05 * LADO, 0, Math.PI * 2); g.stroke();
      g.fillStyle = '#fff';
      g.beginPath(); g.arc(this.x(punto.u), this.y(punto.v), 2.5, 0, Math.PI * 2); g.fill();
      this.lectura.textContent = `uv (${punto.u.toFixed(2)}, ${punto.v.toFixed(2)}) · cara ${cara + 1} de ${CARAS} · tramo ${anillo + 1} de ${ANILLOS}`;
    } else {
      this.lectura.textContent = 'Pasa el mouse sobre un cristal.';
    }
  }

  mostrar(si) { this.el.hidden = !si; }

  liberar() { this.el.remove(); }
}
