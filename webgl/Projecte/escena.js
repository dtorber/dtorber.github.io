import * as THREE from "../lib/three.module.js";
import { OrbitControls } from "../lib/OrbitControls.module.js";
import {
  nom_planetes,
  tempsTraslacio,
  tempsRotacioLlunes,
  distancies,
} from "./Dades.js";
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
  menu_velocidad,
  menu_info,
  effectController;
let isMuted = false;
const musica = false; //flag per a desactivar la musica durant el desenvolupament
const animacioTraslacioPlanetes = {};
const animacioRotacioLlunes = {};
let planetes;
const mouse = new THREE.Vector2();
const rayo = new THREE.Raycaster();

let ultimPlanetaVisible;
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
  document.addEventListener("mousemove", updateMousePosition);
  renderer.domElement.addEventListener("click", listenerClick);
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
  controls.maxDistance = 19000;
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
  GrafEscena.getEscena().then((resposta) => {
    const escena = resposta["escena"];
    planetes = resposta["planetes"];
    scene.add(escena);
    if (musica) {
      afegirMusica().then(() => {
        render();
        aplicarMovimentsPlanetes();
      });
    } else {
      render();
      aplicarMovimentsPlanetes();
    }
  });
  loadBackground();
}

//Funció que carrega el fons estrellat
//ENCARA NO FUNCIONA, ESPERAR A LA 3a PRÀCTICA
function loadBackground() {
  const loader = new THREE.TextureLoader();
  const geometriaFons = new THREE.SphereGeometry(20000, 100, 100);
  const materialFons = new THREE.MeshBasicMaterial({
    map: loader.load("../textures/fons_estrellat3.jpg"),
    side: THREE.DoubleSide, //la textura es mostra en ambdós costats
  });
  const fons = new THREE.Mesh(geometriaFons, materialFons);
  scene.add(fons);
}

function update() {}

function render() {
  requestAnimationFrame(render);
  // update();
  renderer.clear();
  renderer.render(scene, camera);
  //Actualitzem les estadístiques dels FPS
  stats.update();
}

//Funció llançadera per fer tots els moviments dels planetes
function aplicarMovimentsPlanetes() {
  aplicarTraslacions();
  // aplicarRotacionsLlunes();
  // aplicarRotacionsPlanetes();
}

///Funció per a fer les traslacions dels planetes al voltant del sol
function aplicarTraslacions() {
  const animate = (t) => {
    TWEEN.update(t);
    window.requestAnimationFrame(animate);
  };
  animate();

  for (let nom_planeta of nom_planetes) {
    if (nom_planeta === "Sol") continue; //el sol no rota
    const planeta = scene.getObjectByName(nom_planeta);
    const rotacio = new TWEEN.Tween({ y: 0 })
      .to({ y: Math.PI * 2 }, tempsTraslacio[nom_planeta])
      .repeat(Infinity)
      .onUpdate((coords) => {
        // menu.controllers[2].setValue((coords.y * 180) / Math.PI);
        planeta.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), coords.y);
      })
      .start();
    animacioTraslacioPlanetes[nom_planeta] = rotacio;
    //Este codi és per fer la traslació de les llunes perquè acompanyen al planeta en cas qeu no siga un fill de la jerarquia
    // for (let lluna of planetes[nom_planeta].llunes) {
    //   const llunaObjecte = scene.getObjectByName(lluna.nom);
    //   const rotacioLluna = new TWEEN.Tween({ y: 0 })
    //     .to({ y: Math.PI * 2 }, tempsTraslacio[nom_planeta])
    //     .repeat(Infinity)
    //     .onUpdate((coords) => {
    //       // menu.controllers[2].setValue((coords.y * 180) / Math.PI);
    //       llunaObjecte.setRotationFromAxisAngle(
    //         new THREE.Vector3(0, 1, 0),
    //         coords.y
    //       );
    //     })
    //     .start();
    //   animacioTraslacioPlanetes[lluna.nom] = rotacioLluna;
    // }
  }
}

//Funció per a fer les rotacions de les llunes al voltant dels planetes
function aplicarRotacionsLlunes() {
  for (let planeta of Object.values(planetes)) {
    for (let lluna of planeta.llunes) {
      const objecteLluna = scene.getObjectByName(lluna.nom);
      const rotacio = new TWEEN.Tween({ y: 0 })
        .to({ y: Math.PI * 2 }, 10000)
        .repeat(Infinity)
        .onUpdate((coords) => {
          // menu.controllers[2].setValue((coords.y * 180) / Math.PI);
          objecteLluna.position.x = Math.cos(coords.y) * lluna.posX;
          objecteLluna.position.z = Math.sin(coords.y) * lluna.posX;
        })
        .start();
      animacioRotacioLlunes[lluna.nom] = rotacio;
    }
  }
}

//Funció per a fer les rotacions dels planetes sobre ells mateixos
function aplicarRotacionsPlanetes() {}

function modificarVelocitatTraslacio(nom_planeta, factorReduccio) {
  animacioTraslacioPlanetes[nom_planeta].duration(
    tempsTraslacio[nom_planeta] / factorReduccio
  );
  //les llunes han d'anar traslladant-se al voltant del sol igual que el seu planeta
  //este codi es en cas que no afegim les llunes com a filles del planeta en la jerarquia
  // for (let lluna of planetes[nom_planeta].llunes) {
  //   animacioTraslacioPlanetes[lluna.nom].duration(
  //     tempsTraslacio[nom_planeta] / factorReduccio
  //   );
  // }
}

function modificarVelocitatRotacioLluna(nom_lluna, factorReduccio) {
  animacioTraslacioPlanetes[nom_lluna].duration(
    tempsRotacioLlunes[nom_lluna] / factorReduccio
  );
}

function setupGUI() {
  // Definicion de los controles
  effectController = {
    velocidad: 1,
    showInfoSol: showInfo("Sol"),
    showInfoMercuri: showInfo("Mercuri"),
    showInfoVenus: showInfo("Venus"),
    showInfoTerra: showInfo("Terra"),
    showInfoMarte: showInfo("Marte"),
    showInfoJupiter: showInfo("Jupiter"),
    showInfoSaturn: showInfo("Saturn"),
    showInfoUrano: showInfo("Urà"),
    showInfoNeptu: showInfo("Neptú"),
  };

  // Creacion interfaz
  gui = new GUI();
  gui.domElement.style.position = "absolute";
  gui.domElement.style.right = "2px"; // Cambia la distancia desde la derecha
  gui.domElement.style.top = "50px"; // Cambia la distancia desde la parte superior
  // Construccion del menu´
  menu_velocidad = gui.addFolder("Control velocidades");
  menu_velocidad
    .add(effectController, "velocidad", 0, 1000, 0.1)
    .name("Factor de velocidad")
    .onChange((factor_reduccio) => {
      for (let nom_planeta of nom_planetes) {
        if (nom_planeta === "Sol") continue; //el sol no rota
        //encara que siga 0, no passa res perquè no es fa res, serà infinit i aleshores anirà massa lent i punt
        modificarVelocitatTraslacio(nom_planeta, factor_reduccio);
        // for (let lluna of planetes[nom_planeta].llunes) {
        //   modificarVelocitatRotacioLluna(lluna.nom, factor_reduccio);
        // }
      }
    });

  menu_info = gui.addFolder("Mostrar información");
  menu_info.add(effectController, "showInfoSol").name("Sol");
  menu_info.add(effectController, "showInfoMercuri").name("Mercurio");
  menu_info.add(effectController, "showInfoVenus").name("Venus");
  menu_info.add(effectController, "showInfoTerra").name("Tierra");
  menu_info.add(effectController, "showInfoMarte").name("Marte");
  menu_info.add(effectController, "showInfoJupiter").name("Jupiter");
  menu_info.add(effectController, "showInfoSaturn").name("Saturno");
  menu_info.add(effectController, "showInfoUrano").name("Urano");
  menu_info.add(effectController, "showInfoNeptu").name("Neptuno");
}

//Funció per capturar la posició del mouse per poder aplicar més endavant el Hover
function updateMousePosition(event) {
  // Convierte las coordenadas del mouse a un sistema de coordenadas entre -1 y 1
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  rayo.setFromCamera(mouse, camera);

  for (let nom_planeta of nom_planetes) {
    const objecte = scene.getObjectByName(nom_planeta);
    const interseccion = rayo.intersectObjects(objecte.children, true);
    if (interseccion.length > 0) {
      document.body.style.cursor = "pointer";
      //NO FUNCIONA AMB LINEWIDTH, S'HAN DE CREAR SHADERS!!!!!
      //busque de tots els fills del planeta en la jerarquia el que siga la línia i incremente el seu gruix
      // for (let children of objecte.children) {
      //   if (children.type === "Line") {
      //     children.material = new THREE.LineBasicMaterial({
      //       color: children.material.color,
      //       linewidth: 40,
      //     });
      //     console.log(children);
      //     break;
      //   }
      // }
      break;
    } else {
      document.body.style.cursor = "default";
      // for (let children of objecte.children) {
      //   if (children.type === "Line") {
      //     children.material.linewidth = 1;
      //   }
      // }
    }
  }
}

//Funció per a la gestió del click sobre un planeta que mostrarà informació sobre ell
function listenerClick(event) {
  let x = (event.clientX / window.innerWidth) * 2 - 1;
  let y = -(event.clientY / window.innerHeight) * 2 + 1;
  rayo.setFromCamera(new THREE.Vector2(x, y), camera);
  let hiHaInterseccio = false;
  for (let nom_planeta of nom_planetes) {
    const objecte = scene.getObjectByName(nom_planeta);
    //el true és per fer-ho recursiu de manera que si cliquem en l'órbita, el nom del planeta o les llunes, també es detecte
    const interseccion = rayo.intersectObjects(objecte.children, true);
    if (interseccion.length > 0) {
      showInfo(nom_planeta)();
      hiHaInterseccio = true;
      break;
    }
  }
  //si no hi ha cap intersecció, aleshores hem d'amagar el div de la informació del planeta
  if (!hiHaInterseccio) {
    if (ultimPlanetaVisible !== undefined)
      document.getElementById(ultimPlanetaVisible).style.display = "none";
    document.getElementById("info").style.display = "none";
  }
}

//funció per amagar tota la informació menys la del planeta que volem mostrar
function showInfo(nom_planeta) {
  return () => {
    if (ultimPlanetaVisible !== undefined)
      document.getElementById(ultimPlanetaVisible).style.display = "none";
    document.getElementById("info").style.display = "block";
    document.getElementById(nom_planeta).style.display = "block";
    ultimPlanetaVisible = nom_planeta;
  };
}

//Accions
init();
loadScene();
setupGUI();
