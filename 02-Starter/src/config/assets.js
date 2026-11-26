// Qué se descarga y cuándo. Decidirlo es una decisión de dirección:
// - criticos: el telón no sube hasta que lleguen. Lo que se ve en el primer segundo.
// - diferidos: llegan con el usuario ya adentro. Lo que se ve después de bajar.
// Cada asset tiene un nombre; los componentes lo piden con cargador.textura('nombre').

const base = import.meta.env.BASE_URL;   // funciona igual en localhost y publicado en una subcarpeta

export const assets = {
  criticos: [
    { nombre: 'roca', url: `${base}textures/roca.jpg` },        // paredes del pasillo y de la cámara
  ],
  diferidos: [
    { nombre: 'cristal', url: `${base}textures/cristal.jpg` },  // los cristales están al fondo: hay tiempo
  ],
};
