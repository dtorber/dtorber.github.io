/**
 * En este fitxer es guardaran dades com velocitats de rotació, distàncies, òrbites, etc.
 */

//Llistat de tos els planetes (i sol) amb els que treballem
const nom_planetes = [
  "Sol",
  "Mercuri",
  "Venus",
  "Terra",
  "Marte",
  "Jupiter",
  "Saturn",
  "Urà",
  "Neptú",
];

//Distancies de cada planeta al sol (en unitats astronòmiques: la Terra té distància 1)
const distancies = {
  Sol: 0,
  Mercuri: 0.39,
  Venus: 0.72,
  Terra: 1,
  Marte: 1.52,
  Jupiter: 5.2,
  Saturn: 9.54,
  Urà: 19.2,
  Neptú: 30.06,
};

//Proporció de radis de cada planeta en funció de la Terra, com les distàncies al sol
const radis = {
  Sol: 109.08 / 2,
  Mercuri: 0.38,
  Venus: 0.95,
  Terra: 1.0,
  Marte: 0.53,
  Jupiter: 11.21,
  Saturn: 9.45,
  Urà: 4.01,
  Neptú: 3.88,
};

//Velocitats de rotacions dels planetes, en funció de la terra novament, així tots tindran un determinat ritme i bastarà multiplicar
//per la velocitat a la que volem que vaja la Terra, i després per fer lo de accelerar les rotacions sera mes facil
let velocitatsRotacio = {
  Sol: 0,
  Mercuri: 0.006880559085133418,
  Venus: 0.004142312579415501,
  Terra: 1,
  Marte: 0.5501905972045743,
  Jupiter: 28.95997458703939,
  Saturn: 23.40533672172808,
  Urà: 9.398983481575604,
  Neptú: 6.174714104193138,
};

export { nom_planetes, distancies, radis, velocitatsRotacio };
