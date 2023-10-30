/**
 * En este fitxer es guardaran dades com velocitats de rotació, distàncies, òrbites, etc.
 */

const VELOCITAT_ROTACIO_TERRA = 465.11; //m/s
const RADI_TERRA = 6371; //metres
const DISTANCIA_TERRA_SOL = 149430; //metres
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

const distancies = {
  Sol: 0,
  Mercuri: 1.0,
  Venus: 1.52,
  Terra: 2.3,
  Marte: 3.7,
  Jupiter: 5.2,
  Saturn: 9.54,
  Urà: 19.2,
  Neptú: 30.06,
  Lluna: 15, //distancia de la lluna a la terra
};

const radis = {
  Sol: 109.08 / 2,
  Mercuri: 0.38 * 16,
  Venus: 0.95 * 16,
  Terra: 1.0 * 16,
  Marte: 0.53 * 16,
  Jupiter: 11.21 * 4,
  Saturn: 9.45 * 4,
  Urà: 4.01 * 4,
  Neptú: 3.88 * 4,
  Lluna: 0.33 * 16, //es un terç de la terra
};

const radisOffset = {
  Sol: 0,
  Mercuri: 0,
  Venus: 20,
  Terra: 40,
  Marte: 60,
  Jupiter: 100,
  Saturn: 100,
  Urà: 0,
  Neptú: 0,
};

//Velocitats de rotacions dels planetes, en funció de la terra novament, així tots tindran un determinat ritme i bastarà multiplicar
//per la velocitat a la que volem que vaja la Terra, i després per fer lo de accelerar les rotacions sera mes facil
const velocitatsRotacio = {
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

//en milisegosn que es lo que necessita l'animació però la divisió entre 100000 és perquè siga visible
const tempsTraslacio = {
  Sol: 0,
  Mercuri: (88 * 24 * 3600 * 1000) / 100000,
  Venus: (225 * 24 * 3600 * 1000) / 100000,
  Terra: (365 * 24 * 3600 * 1000) / 100000,
  Marte: (687 * 24 * 3600 * 1000) / 100000,
  Jupiter: ((11 * 365 + 314) * 24 * 3600 * 1000) / 100000,
  Saturn: ((29 * 365 + 168) * 24 * 3600 * 1000) / 100000,
  Urà: ((84 * 365 + 4) * 24 * 3600 * 1000) / 100000,
  Neptú: ((164 * 365 + 298) * 24 * 3600 * 1000) / 100000,
};

//temps de rotacio dels planetes sobre el seu propi eix
const tempsRotacio = {
  Sol: (27 * 24 * 3600 * 1000) / 10000,
  Mercuri: (1408 * 3600 * 1000) / 10000,
  Venus: (5832 * 3600 * 1000) / 10000,
  Terra: (24 * 3600 * 1000) / 10000,
  Marte: (25 * 3600 * 1000) / 10000,
  Jupiter: (10 * 3600 * 1000) / 10000,
  Saturn: (11 * 3600 * 1000) / 10000,
  Urà: (17 * 3600 * 1000) / 10000,
  Neptú: (16 * 3600 * 1000) / 10000,
  Lluna: (27 * 24 * 3600 * 1000) / 10000,
};

//temps de rotacio de les llunes al voltant dels seuss
const tempsRotacioLlunes = {
  Lluna: (27.32 * 24 * 3600 * 1000) / 100000,
};

const textures = {
  Sol: "../textures/sun_texture_2k.jpg",
  Mercuri: "../textures/mercury_texture_2k.jpg",
  Venus: "../textures/venus_texture_2k.jpg",
  Terra: "../textures/earth_texture_2k.jpg",
  Marte: "../textures/mars_texture_2k.jpg",
  Jupiter: "../textures/jupiter_texture_2k.jpg",
  Saturn: "../textures/saturn_texture_2k.jpg",
  Urà: "../textures/uranus_texture_2k.jpg",
  Neptú: "../textures/neptune_texture_2k.jpg",
  Lluna: "../textures/moon_texture_2k.jpg",
  TerraSpec: "../textures/earth_spec_texture.jpg",
  MercuriBump: "../textures/mercury_bump_texture.jpg",
  VenusBump: "../textures/venus_bump_texture.jpg",
  TerraBump: "../textures/earth_bump_texture.jpg",
  MarteBump: "../textures/mars_bump_texture.jpg",
};

const colorsOrbites = {
  Sol: "#f1c40f",
  Mercuri: "#9164a4",
  Venus: "#90651b",
  Terra: "#0292c2",
  Marte: "#9a4e19",
  Jupiter: "#da8b72",
  Saturn: "#b3a374",
  Urà: "#67c9d6",
  Neptú: "#5668a3",
};

const traduccio_ca_es = {
  Sol: "Sol",
  Mercuri: "Mercurio",
  Venus: "Venus",
  Terra: "Tierra",
  Marte: "Marte",
  Jupiter: "Júpiter",
  Saturn: "Saturno",
  Urà: "Urano",
  Neptú: "Neptuno",
  Lluna: "Luna",
};

export {
  nom_planetes,
  distancies,
  radis,
  radisOffset,
  velocitatsRotacio,
  textures,
  colorsOrbites,
  tempsTraslacio,
  tempsRotacio,
  tempsRotacioLlunes,
  traduccio_ca_es,
  VELOCITAT_ROTACIO_TERRA,
  DISTANCIA_TERRA_SOL,
  RADI_TERRA,
};
