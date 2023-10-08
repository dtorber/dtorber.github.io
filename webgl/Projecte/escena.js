import * as THREE from "../lib/three.module.js";
import { GLTFLoader } from "../lib/GLTFLoader.module.js";
import { OrbitControls } from "../lib/OrbitControls.module.js";
import { nom_planetes, distancies, radis, velocitatsRotacio } from "./Dades.js";
import Planeta from "./Planeta.js";
import GrafEscena from "./GrafEscena.js";

//Variables estandar
let renderer, scene, camera;

const material = new THREE.MeshBasicMaterial({
  color: 0x0000ff,
  wireframe: true,
});
function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xaaaaaa);
  renderer.autoClear = false;
  document.getElementById("container").appendChild(renderer.domElement);

  //Instanciar el node arrel de l'escena
  scene = new THREE.Scene();
  //scene.background  = new THREE.Color(0.5, 0.5, 0.5);

  //Afegim un fons estrellat com a fons de l'escena
  //   loadBackground();

  //Instanciar la càmera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(0.5, 2, 7);
  camera.lookAt(0, 1, 0);
  //Per a poder moure la càmera amb el ratolí
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 1;
  controls.maxDistance = 10000;

  //Per a que les càmeres es redimensionen amb la finestra
  const ar = window.innerWidth / window.innerHeight;
  //Captura d'esdeveniments
  window.addEventListener("resize", updateAspectRatio);
}

//Se cridarà cada vegada que redimensione la finestra
function updateAspectRatio() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  //Nova aspect ratio
  const ar = window.innerWidth / window.innerHeight;

  ///perspectiva
  camera.aspect = ar;
  camera.updateProjectionMatrix();
}

function crearSuelo() {
  const suelo_geometria = new THREE.PlaneGeometry(1000, 1000, 100, 100);
  suelo_geometria.name = "suelo";
  const suelo = new THREE.Mesh(suelo_geometria, material); //es 1000x1000 de tamany i gasta 100 meridians i 100 paral·lels
  suelo.rotation.x = -Math.PI / 2;
  return suelo;
}

function loadScene() {
  scene.add(GrafEscena.getEscena());
  scene.add(crearSuelo());
}

//Funció que carrega el fons estrellat
//ENCARA NO FUNCIONA, ESPERAR A LA 3a PRÀCTICA
function loadBackground() {
  const loader = new THREE.TextureLoader();
  const texturaFons = loader.load("../images/fons_estrellat.jpg");
  const geometriaFons = new THREE.SphereGeometry(10, 30, 30);
  const materialFons = new THREE.MeshBasicMaterial({
    map: texturaFons,
    side: THREE.BackSide, //amb aço garantim que es renderitza en la part posterior de l'esfera i aixi servisca de fons
  });
  const fons = new THREE.Mesh(geometriaFons, materialFons);
  scene.add(fons);
}

function update() {
  angulo += 0.01;
  scene.rotation.y = angulo;
}

function render() {
  requestAnimationFrame(render);
  //update();
  renderer.clear();

  renderer.render(scene, camera);
}

//Accions
init();
loadScene();
render();
