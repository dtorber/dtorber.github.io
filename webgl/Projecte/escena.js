import * as THREE from "../lib/three.module.js";
import { OrbitControls } from "../lib/OrbitControls.module.js";
import {
  nom_planetes,
  tempsTraslacio,
  tempsRotacioLlunes,
  colorsOrbites,
  distancies,
  radis,
} from "./Dades.js";
import GrafEscena from "./GrafEscena.js";
import Stats from "../lib/stats.module.js";
import { TWEEN } from "../lib/tween.module.min.js";
import { GUI } from "../lib/lil-gui.module.min.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { FXAAShader } from "three/addons/shaders/FXAAShader.js";

//Variables estandar
let renderer,
  scene,
  camera,
  stats,
  backgroundSound,
  gui,
  menu_velocitat,
  menu_info,
  menu_tamany,
  effectController,
  controls;
let isMuted = true;
const musica = true; //flag per a desactivar la musica durant el desenvolupament;
const animacioTraslacioPlanetes = {};
const animacioRotacioLlunes = {};
let planetes;

//Per al hover amb mouse
const mouse = new THREE.Vector2();
const rayo = new THREE.Raycaster();
let composer, renderPass, outline, fxaaShader;

let ultimPlanetaVisible;

function init() {
  crearRenderer();
  scene = new THREE.Scene();
  crearCamera();
  crearControls();
  crearHover();
  crearFPS();
  crearLlums();
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
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0xaaaaaa);
  renderer.autoClear = false;
  // renderer.shadowMap.enabled = true;
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
  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 1;
  controls.maxDistance = 19000;
}

function crearHover() {
  composer = new EffectComposer(renderer);
  renderPass = new RenderPass(scene, camera);

  composer.addPass(renderPass);

  outline = new OutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,
    camera
  );
  outline.edgeStrength = 7;
  outline.edgeThickness = 5;
  outline.renderToScreen = true;
  composer.addPass(outline);

  fxaaShader = new ShaderPass(FXAAShader);
  fxaaShader.uniforms["resolution"].value.set(
    1 / window.innerWidth,
    1 / window.innerHeight
  );
  composer.addPass(fxaaShader);
}

function crearLlums() {
  //Llum ambient
  const alight = new THREE.AmbientLight(0x222222);
  scene.add(alight);

  //Llum amb ombres que actua com si fora la llum del sol
  const plight = new THREE.PointLight(0xffffff);
  plight.position.set(0, -20, 0);
  scene.add(plight);

  plight.castShadow = true;
  plight.shadow.camera.left = -500;
  plight.shadow.camera.right = 500;
  plight.shadow.camera.top = 500;
  plight.shadow.camera.bottom = -500;
  plight.shadow.camera.far = 10000;

  // const sunLight = new THREE.DirectionalLight(0xffffff, 1);
  // sunLight.position.set(0, 0, 0); // Coloca la luz en el origen (simulando el sol)
  // sunLight.target.position.set(0, 1, 0); // Establece el objetivo de la luz (apuntando hacia abajo)
  // sunLight.shadow.camera.left = -500;
  // sunLight.shadow.camera.right = 500;
  // sunLight.shadow.camera.top = 500;
  // sunLight.shadow.camera.bottom = -500;
  // sunLight.shadow.camera.far = 10000;
  // sunLight.castShadow = true;

  scene.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });

  const helper = new THREE.CameraHelper(plight.shadow.camera);
  scene.add(helper);
}

function afegirMusica() {
  return new Promise((resolve, reject) => {
    const listener = new THREE.AudioListener();
    camera.add(listener);

    const audioLoader = new THREE.AudioLoader();
    backgroundSound = new THREE.Audio(listener);
    audioLoader.load(
      "../sounds/interstellar_short_short.mp3",
      function (buffer) {
        backgroundSound.setBuffer(buffer);
        backgroundSound.setLoop(true);
        backgroundSound.setVolume(0.25);
        // backgroundSound.play();
        //resolem la promesa una vegada s'ha carregat la música
        resolve();
      }
    );
  });
}

function muteMusica() {
  //eliminar tots els fills que tinga el div container
  isMuted = !isMuted;
  if (!isMuted) {
    document.getElementById("mute-button").innerHTML =
      "<i class='fas fa-volume-mute' id='mute-unmute-music''></i>";
    backgroundSound.setVolume(0.25);
    backgroundSound.play();
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
  composer.setSize(window.innerWidth, window.innerHeight);
  fxaaShader.uniforms["resolution"].value.set(
    1 / window.innerWidth,
    1 / window.innerHeight
  );

  //Nova aspect ratio
  const ar = window.innerWidth / window.innerHeight;

  ///perspectiva
  camera.aspect = ar;
  camera.updateProjectionMatrix();
}

function loadScene() {
  GrafEscena.getEscena(outline).then((resposta) => {
    const escena = resposta["escena"];
    planetes = resposta["planetes"];
    scene.add(escena);
    if (musica) {
      // afegirMusica().then(() => {
      //   render();
      //   aplicarMovimentsPlanetes();
      // });
      afegirMusica();
      render();
      aplicarMovimentsPlanetes();
    } else {
      render();
      aplicarMovimentsPlanetes();
    }
  });
  loadBackground();
  console.log(scene);
}

//Funció que carrega el fons estrellat per a la qual cosa el muntem sobre una esfera
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
  render.autoClear = false;
  // update();
  renderer.clear();
  renderer.setPixelRatio(window.devicePixelRatio);
  // renderer.render(scene, camera);
  composer.render();
  //Actualitzem les estadístiques dels FPS
  stats.update();

  requestAnimationFrame(render);
}

//Funció llançadera per fer tots els moviments dels planetes
function aplicarMovimentsPlanetes() {
  aplicarTraslacions();
  aplicarRotacionsLlunes();
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
    const planeta = scene.getObjectByName("contenidor_" + nom_planeta);
    const rotacio = new TWEEN.Tween({ y: 0 })
      .to({ y: Math.PI * 2 }, tempsTraslacio[nom_planeta])
      .repeat(Infinity)
      .onUpdate((coords) => {
        // menu.controllers[2].setValue((coords.y * 180) / Math.PI);
        planeta.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), coords.y);
        //ho apliquem nomes sobre els fills perquè no s'aplique sobre l'òrbita
        // for (let children of planeta.children) {
        //   if (children.type !== "Line") {
        //     children.position.x =
        //       Math.cos(coords.y) * planetes[nom_planeta].posX;
        //     children.position.z =
        //       Math.sin(coords.y) * planetes[nom_planeta].posX;
        //   }
        // }
      })
      .start();
    animacioTraslacioPlanetes[nom_planeta] = rotacio;
  }
}

//Funció per a fer les rotacions de les llunes al voltant dels planetes
function aplicarRotacionsLlunes() {
  const animate = (t) => {
    TWEEN.update(t);
    window.requestAnimationFrame(animate);
  };
  animate();
  for (let planeta of Object.values(planetes)) {
    for (let lluna of planeta.llunes) {
      const objecteLluna = scene.getObjectByName(lluna.nom);
      const rotacio = new TWEEN.Tween({ y: 0 })
        .to({ y: Math.PI * 2 }, tempsRotacioLlunes[lluna.nom])
        .repeat(Infinity)
        .onUpdate((coords) => {
          // menu.controllers[2].setValue((coords.y * 180) / Math.PI);
          // planeta.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), coords.y);
          objecteLluna.position.x =
            Math.cos(coords.y) * (5 + distancies["Lluna"]) - 20;
          objecteLluna.position.z = Math.sin(coords.y) * distancies["Lluna"];
        })
        .start();
      animacioRotacioLlunes[lluna.nom] = rotacio;
    }
  }
}

//Funció per a fer les rotacions dels planetes sobre ells mateixos
function aplicarRotacionsPlanetes() {
  const animate = (t) => {
    TWEEN.update(t);
    window.requestAnimationFrame(animate);
  };
  animate();
  for (let nom_planeta of nom_planetes) {
    const objecte = scene.getObjectByName(nom_planeta);
    new TWEEN.Tween({ y: 0 })
      .to({ y: Math.PI * 2 }, 10000)
      .repeat(Infinity)
      .onUpdate((coords) => {
        // menu.controllers[2].setValue((coords.y * 180) / Math.PI);
        objecte.rotation.y = coords.y;
      })
      .start();
  }
}

function modificarVelocitatTraslacio(nom_planeta, factorReduccio) {
  if (animacioTraslacioPlanetes[nom_planeta]) {
    animacioTraslacioPlanetes[nom_planeta].duration(
      tempsTraslacio[nom_planeta] / factorReduccio
    );
  }
}

function modificarVelocitatRotacioLluna(nom_lluna, factorReduccio) {
  if (animacioRotacioLlunes[nom_lluna]) {
    animacioRotacioLlunes[nom_lluna].duration(
      tempsRotacioLlunes[nom_lluna] / factorReduccio
    );
  }
}

function modificarTamanyPlaneta(nom_planeta, factor_increment) {
  const planeta = scene.getObjectByName(nom_planeta);
  planeta.scale.set(factor_increment, factor_increment, factor_increment);
}

function setupGUI() {
  // Definicion de los controles
  effectController = {
    velocidad: 1,
    velocitat_mercuri: 1,
    velocitat_venus: 1,
    velocitat_terra: 1,
    velocitat_marte: 1,
    velocitat_jupiter: 1,
    velocitat_saturn: 1,
    velocitat_ura: 1,
    velocitat_neptu: 1,
    tamany: 1,
    tamany_sol: 1,
    tamany_mercuri: 1,
    tamany_venus: 1,
    tamany_terra: 1,
    tamany_marte: 1,
    tamany_jupiter: 1,
    tamany_saturn: 1,
    tamany_ura: 1,
    tamany_neptu: 1,
    showInfoSol: clicPlaneta("Sol"),
    showInfoMercuri: clicPlaneta("Mercuri"),
    showInfoVenus: clicPlaneta("Venus"),
    showInfoTerra: clicPlaneta("Terra"),
    showInfoMarte: clicPlaneta("Marte"),
    showInfoJupiter: clicPlaneta("Jupiter"),
    showInfoSaturn: clicPlaneta("Saturn"),
    showInfoUrano: clicPlaneta("Urà"),
    showInfoNeptu: clicPlaneta("Neptú"),
  };

  // Creacion interfaz
  gui = new GUI();
  gui.domElement.style.position = "absolute";
  gui.domElement.style.right = "2px"; // Cambia la distancia desde la derecha
  gui.domElement.style.top = "50px"; // Cambia la distancia desde la parte superior
  // Construccion del menu´
  menu_velocitat = gui.addFolder("Control velocidades");
  setupMenuVelocitat(menu_velocitat);

  menu_tamany = gui.addFolder("Control tamaño");
  setupMenuTamany();

  menu_info = gui.addFolder("Mostrar información");
  setupMenuInfo();
}

function setupMenuVelocitat() {
  menu_velocitat
    .add(effectController, "velocidad", 1, 1000, 0.1)
    .name("Factor de velocidad global")
    .onChange((factor_reduccio) => {
      for (let i in nom_planetes) {
        if (nom_planetes[i] === "Sol") continue; //el sol no es trasllada al voltant d'ell mateix
        menu_velocitat.controllers[i].setValue(factor_reduccio); //ho canviem en el menu_velocitat i aixi ja ho gestiona cadascun dels planetes
        for (let lluna of planetes[nom_planetes[i]].llunes) {
          modificarVelocitatRotacioLluna(lluna.nom, factor_reduccio);
        }
      }
    });

  menu_velocitat
    .add(effectController, "velocitat_mercuri", 1, 1000, 0.1)
    .name("Factor de velocidad Mercurio")
    .onChange((factor_reduccio) => {
      modificarVelocitatTraslacio("Mercuri", factor_reduccio);
    });

  menu_velocitat
    .add(effectController, "velocitat_venus", 1, 1000, 0.1)
    .name("Factor de velocidad Venus")
    .onChange((factor_reduccio) => {
      modificarVelocitatTraslacio("Venus", factor_reduccio);
    });

  menu_velocitat
    .add(effectController, "velocitat_terra", 1, 1000, 0.1)
    .name("Factor de velocidad Tierra")
    .onChange((factor_reduccio) => {
      modificarVelocitatTraslacio("Terra", factor_reduccio);
    });

  menu_velocitat
    .add(effectController, "velocitat_marte", 1, 1000, 0.1)
    .name("Factor de velocidad Marte")
    .onChange((factor_reduccio) => {
      modificarVelocitatTraslacio("Marte", factor_reduccio);
    });

  menu_velocitat
    .add(effectController, "velocitat_jupiter", 1, 1000, 0.1)
    .name("Factor de velocidad Jupiter")
    .onChange((factor_reduccio) => {
      modificarVelocitatTraslacio("Jupiter", factor_reduccio);
    });

  menu_velocitat
    .add(effectController, "velocitat_saturn", 1, 1000, 0.1)
    .name("Factor de velocidad Saturno")
    .onChange((factor_reduccio) => {
      modificarVelocitatTraslacio("Saturn", factor_reduccio);
    });

  menu_velocitat
    .add(effectController, "velocitat_ura", 1, 1000, 0.1)
    .name("Factor de velocidad Urano")
    .onChange((factor_reduccio) => {
      modificarVelocitatTraslacio("Urà", factor_reduccio);
    });
  menu_velocitat
    .add(effectController, "velocitat_neptu", 1, 1000, 0.1)
    .name("Factor de velocidad Neptuno")
    .onChange((factor_reduccio) => {
      modificarVelocitatTraslacio("Neptú", factor_reduccio);
    });
}

function setupMenuInfo() {
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

function setupMenuTamany() {
  menu_tamany
    .add(effectController, "tamany", 1, 10, 0.1)
    .name("Factor de tamaño global")
    .onChange((factor_increment) => {
      for (let i = 1; i < menu_tamany.controllers.length; i++) {
        menu_tamany.controllers[i].setValue(factor_increment);
      }
    });
  menu_tamany
    .add(effectController, "tamany_sol", 1, 10, 0.1)
    .name("Factor de tamaño Sol")
    .onChange((factor_increment) => {
      modificarTamanyPlaneta("Sol", factor_increment);
    });
  menu_tamany
    .add(effectController, "tamany_mercuri", 1, 10, 0.1)
    .name("Factor de tamaño Mercurio")
    .onChange((factor_increment) => {
      modificarTamanyPlaneta("Mercuri", factor_increment);
    });

  menu_tamany
    .add(effectController, "tamany_venus", 1, 10, 0.1)
    .name("Factor de tamaño Venus")
    .onChange((factor_increment) => {
      modificarTamanyPlaneta("Venus", factor_increment);
    });

  menu_tamany
    .add(effectController, "tamany_terra", 1, 10, 0.1)
    .name("Factor de tamaño Tierra")
    .onChange((factor_increment) => {
      modificarTamanyPlaneta("Terra", factor_increment);
    });

  menu_tamany
    .add(effectController, "tamany_marte", 1, 10, 0.1)
    .name("Factor de tamaño Marte")
    .onChange((factor_increment) => {
      modificarTamanyPlaneta("Marte", factor_increment);
    });

  menu_tamany
    .add(effectController, "tamany_jupiter", 1, 10, 0.1)
    .name("Factor de tamaño Jupiter")
    .onChange((factor_increment) => {
      modificarTamanyPlaneta("Jupiter", factor_increment);
    });

  menu_tamany
    .add(effectController, "tamany_saturn", 1, 10, 0.1)
    .name("Factor de tamaño Saturno")
    .onChange((factor_increment) => {
      modificarTamanyPlaneta("Saturn", factor_increment);
    });

  menu_tamany
    .add(effectController, "tamany_ura", 1, 10, 0.1)
    .name("Factor de tamaño Urano")
    .onChange((factor_increment) => {
      modificarTamanyPlaneta("Urà", factor_increment);
    });
  menu_tamany
    .add(effectController, "tamany_neptu", 1, 10, 0.1)
    .name("Factor de tamaño Neptuno")
    .onChange((factor_increment) => {
      modificarTamanyPlaneta("Neptú", factor_increment);
    });
}

//Funció per capturar la posició del mouse per poder aplicar més endavant el Hover
function updateMousePosition(event) {
  // Convierte las coordenadas del mouse a un sistema de coordenadas entre -1 y 1
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  // intersection();
  rayo.setFromCamera(mouse, camera);
  let hiHaInterseccio = false;
  for (let nom_planeta of nom_planetes) {
    const objecte = scene.getObjectByName(nom_planeta);
    const interseccion = rayo.intersectObjects(objecte.children, true);
    if (interseccion.length > 0) {
      document.body.style.cursor = "pointer";
      const selected = [];
      for (let fill of objecte.children) {
        if (fill.type === "Line" || fill.type === "Mesh") selected.push(fill);
      }
      outline.visibleEdgeColor.set(colorsOrbites[nom_planeta]);
      outline.hiddenEdgeColor.set(colorsOrbites[nom_planeta]);
      outline.selectedObjects = selected;
      hiHaInterseccio = true;
      break;
    }
  }
  if (!hiHaInterseccio) {
    document.body.style.cursor = "default";
    outline.selectedObjects = [];
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
      clicPlaneta(nom_planeta)();
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

//Funció per a quan es clica en un planeta
function clicPlaneta(nom_planeta) {
  //cal que tornem una callback per a poder afegir-ho en el effectController
  return () => {
    showInfo(nom_planeta); //mostrem la informació del planeta en qüestió
    animacioCamera(nom_planeta); //i movem la càmera fins al planeta en qüestió
  };
}

//funció per amagar tota la informació menys la del planeta que volem mostrar
function showInfo(nom_planeta) {
  if (ultimPlanetaVisible !== undefined)
    document.getElementById(ultimPlanetaVisible).style.display = "none";
  document.getElementById("info").style.display = "block";
  document.getElementById(nom_planeta).style.display = "block";
  ultimPlanetaVisible = nom_planeta;
}

function animacioCamera(nom_planeta) {
  const animate = (t) => {
    TWEEN.update(t);
    window.requestAnimationFrame(animate);
  };
  animate();
  const objecte = scene.getObjectByName(nom_planeta).children[0]; //me quede amb el mesh que és el que té la posició realment
  let position = new THREE.Vector3();
  position.getPositionFromMatrix(objecte.matrixWorld);
  new TWEEN.Tween({
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
  })
    .to(
      {
        x: position.x - radis["Sol"] - radis[nom_planeta],
        y: position.y,
        z: position.z,
      },
      3000
    )
    .onUpdate((coords) => {
      camera.position.x = coords.x;
      camera.position.y = coords.y;
      camera.position.z = coords.z;
      camera.lookAt(position);
      controls.target = position;
    })
    .easing(TWEEN.Easing.Quadratic.InOut)
    .start();
}

//Accions
init();
loadScene();
setupGUI();
