import * as THREE from "../lib/three.module.js";
import { OrbitControls } from "../lib/OrbitControls.module.js";
import { nom_planetes, tempsTraslacio } from "./Dades.js";
import GrafEscena from "./GrafEscena.js";
import Stats from "../lib/stats.module.js";
import { TWEEN } from "../lib/tween.module.min.js";
import { GUI } from "../lib/lil-gui.module.min.js";

//Variables estandar
let renderer,
  scene,
  camera,
  stats,
  backgroundSound,
  gui,
  menu,
  effectController;
let isMuted = false;
const musica = false; //flag per a desactivar la musica durant el desenvolupament
const animacioRotacioPlanetes = {};

const material = new THREE.MeshBasicMaterial({
  color: 0x0000ff,
  wireframe: true,
});
function init() {
  crearRenderer();
  scene = new THREE.Scene();
  crearCamera();
  crearControls();
  crearFPS();
  //Per a que les càmeres es redimensionen amb la finestra
  const ar = window.innerWidth / window.innerHeight;
  //Captura d'esdeveniments
  window.addEventListener("resize", updateAspectRatio);
  document.getElementById("mute-unmute-music").addEventListener("click", () => {
    muteMusica();
  });
}

function crearFPS() {
  stats = new Stats();
  document.body.appendChild(stats.dom);
}

function crearRenderer() {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xaaaaaa);
  renderer.autoClear = false;
  document.getElementById("container").appendChild(renderer.domElement);
}

function crearCamera() {
  //Instanciar la càmera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    100000
  );
  camera.position.set(0.5, 200, 100);
  camera.lookAt(0, 1, 0);
}

function crearControls() {
  //Per a poder moure la càmera amb el ratolí
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 1;
  controls.maxDistance = 1000000;
}

function afegirMusica() {
  return new Promise((resolve, reject) => {
    const listener = new THREE.AudioListener();
    camera.add(listener);

    const audioLoader = new THREE.AudioLoader();
    backgroundSound = new THREE.Audio(listener);
    audioLoader.load("../sounds/interstellar.mp3", function (buffer) {
      backgroundSound.setBuffer(buffer);
      backgroundSound.setLoop(true);
      backgroundSound.setVolume(0.25);
      backgroundSound.play();
      //resolem la promesa una vegada s'ha carregat la música
      resolve();
    });
  });
}

function muteMusica() {
  //eliminar tots els fills que tinga el div container
  isMuted = !isMuted;
  if (!isMuted) {
    document.getElementById("mute-button").innerHTML =
      "<i class='fas fa-volume-mute' id='mute-unmute-music''></i>";
    backgroundSound.setVolume(0.25);
  } else {
    document.getElementById("mute-button").innerHTML =
      "<i class='fas fa-volume-up' id='mute-unmute-music''></i>";
    backgroundSound.setVolume(0);
  }
  document.getElementById("mute-unmute-music").addEventListener("click", () => {
    muteMusica();
  });
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
  const suelo_geometria = new THREE.PlaneGeometry(10000, 10000, 100, 100);
  suelo_geometria.name = "suelo";
  const suelo = new THREE.Mesh(suelo_geometria, material); //es 1000x1000 de tamany i gasta 100 meridians i 100 paral·lels
  suelo.rotation.x = -Math.PI / 2;
  return suelo;
}

function loadScene() {
  scene.add(crearSuelo());
  GrafEscena.getEscena().then((escena) => {
    scene.add(escena);
    if (musica) {
      afegirMusica().then(() => {
        render();
        aplicarRotacions();
      });
    } else {
      render();
      aplicarRotacions();
    }
  });
  loadBackground();
}

//Funció que carrega el fons estrellat
//ENCARA NO FUNCIONA, ESPERAR A LA 3a PRÀCTICA
function loadBackground() {
  const loader = new THREE.TextureLoader();
  const texturaFons = loader.load("../textures/fons_estrellat2.jpg");
  scene.background = texturaFons;
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
  //Actualitzem les estadístiques dels FPS
  stats.update();
}

///Funció per a fer les rotacions
function aplicarRotacions() {
  //s'haurà de fer l'animació amb TWEEN de manera que cadascun dels moviments vaja a una velocitat
  //així es configura una animació.
  //Fer-ho en intervals que ens interesse per exemple perquè no es veja la pinça mirant cap avall
  //Per a això deuríem no de cridar a les funcions directament, si no fer un change dels elements del gui
  const animate = (t) => {
    TWEEN.update(t);
    window.requestAnimationFrame(animate);
  };
  animate();

  for (let nom_planeta of nom_planetes) {
    if (nom_planeta === "Sol") continue; //el sol no rota
    const planeta = scene.getObjectByName(nom_planeta);
    // const velocitatRotacio = velocitatsRotacio[nom_planeta];
    // //velocitatsRotacio estan en funció de la velocitat de la terra, per tant multipliquem per la seua velocitat real
    // const velocitatReal = velocitatRotacio * VELOCITAT_ROTACIO_TERRA;
    // //i ara cal que calculem la distància que ha de recórrer que és el diàmetre de l'orbita que descriu, com la distància al sol
    // // està en funció de la de la terra, cal que multipliquem per la distància de la terra
    // const tempsRotacioCompleta =
    //   (2 * Math.PI * distancies[nom_planeta] * DISTANCIA_TERRA_SOL) /
    //   velocitatReal; //2 * PI * distancia_real / velocitat dona el temps de descriure una órbita completa
    // console.log(nom_planeta + ":" + tempsRotacioCompleta);
    const rotacio = new TWEEN.Tween({ y: 0 })
      .to({ y: Math.PI * 2 }, tempsTraslacio[nom_planeta])
      .repeat(Infinity)
      .onUpdate((coords) => {
        // menu.controllers[2].setValue((coords.y * 180) / Math.PI);
        planeta.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), coords.y);
      })
      .start();
    animacioRotacioPlanetes[nom_planeta] = rotacio;
  }
}

function modificarVelocitatRotacio(nom_planeta, factorReduccio) {
  animacioRotacioPlanetes[nom_planeta].duration(
    tempsTraslacio[nom_planeta] / factorReduccio
  );
}

function setupGUI() {
  // Definicion de los controles
  effectController = {
    mensaje: "Controles de la aplicación",
    velocidad: 1,
  };

  // Creacion interfaz
  gui = new GUI();
  gui.domElement.style.position = "absolute";
  gui.domElement.style.right = "2px"; // Cambia la distancia desde la derecha
  gui.domElement.style.top = "50px"; // Cambia la distancia desde la parte superior
  // Construccion del menu´
  menu = gui.addFolder("Control velocidades");
  menu.add(effectController, "mensaje").name("Aplicacion");
  menu
    .add(effectController, "velocidad", 0, 1000, 0.1)
    .name("Factor de velocidad")
    .onChange((factor_reduccio) => {
      for (let nom_planeta of nom_planetes) {
        if (nom_planeta === "Sol") continue; //el sol no rota
        //encara que siga 0, no passa res perquè no es fa res, serà infinit i aleshores anirà massa lent i punt
        modificarVelocitatRotacio(nom_planeta, factor_reduccio);
      }
    });
}

//Accions
init();
loadScene();
setupGUI();
