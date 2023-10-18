import * as THREE from "../lib/three.module.js";
import { OrbitControls } from "../lib/OrbitControls.module.js";
import crearRobotSuelo from "./RobotCreator.js";
import { TWEEN } from "../lib/tween.module.min.js";
import { GUI } from "../lib/lil-gui.module.min.js";

//Variables estandard
let renderer, scene, camera;

//Otras globales
let effectController, gui, menu; //per a la interfície gràfica
let angulo = 0;
const material = new THREE.MeshStandardMaterial({
  flatShadig: true,
  wireframe: false,
});
let planta; //per a vista de planta
const L = 110;

//Accions
init();
loadScene();
setupGUI();
render();

function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xaaaaaa);
  renderer.autoClear = false;
  document.getElementById("container").appendChild(renderer.domElement);

  renderer.antialias = true;
  renderer.shadowMap.enabled = true;

  //Instanciar el node arrel de l'escena
  scene = new THREE.Scene();
  // scene.background = new THREE.Color(0.5, 0.5, 0.5);

  //Instanciar la càmera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(100, 300, 200);
  camera.lookAt(0, 1, 0);

  //Afegir controls:
  const controls = new OrbitControls(camera, renderer.domElement);
  //Limitem els controls perquè no es puga acostar massa ni allunyar-se massa
  controls.minDistance = 1;
  controls.maxDistance = 1000;

  //Per a que les càmeres es redimensionen amb la finestra
  const ar = window.innerWidth / window.innerHeight;
  setCameras(ar);

  crearLlums();
  // activarOmbres(scene);

  //Captura d'esdeveniments
  window.addEventListener("resize", updateAspectRatio);
  //afegir listener per a quan es prema alguna tecla
  window.addEventListener("keydown", onKeyDown);
}

function onKeyDown(event) {
  //vull moure el robot segons la fletxa que s'haja premut
  const tecla = event.keyCode;
  const robot = scene.getObjectByName("robot");
  switch (tecla) {
    case 37: //esquerra
      robot.position.x -= 1;
      break;
    case 38: //amunt
      robot.position.z -= 1;
      break;
    case 39: //dreta
      robot.position.x += 1;
      break;
    case 40: //abaix
      robot.position.z += 1;
      break;
  }
}

function setupGUI() {
  // Definicion de los controles
  effectController = {
    mensaje: "Controls Robot",
    gir_base: 0.0,
    gir_braç: 0.0,
    gir_avantbraçY: 0.0,
    gir_avantbraçZ: 0.0,
    gir_pinça: 0.0,
    separacio_pinça: 0.0,
    alambre: false,
    animar: performAnimation,
  };

  // Creacion interfaz
  gui = new GUI();

  // Construccion del menu´
  menu = gui.addFolder("Control robot");
  menu
    .add(effectController, "gir_base", -180.0, 180.0, 0.025)
    .name("Gir base")
    .onChange((value) => girarBase(value));
  menu
    .add(effectController, "gir_braç", -45.0, 45.0, 0.025)
    .name("Gir braç")
    .onChange((value) => girarBraç(value));
  menu
    .add(effectController, "gir_avantbraçY", -180.0, 180.0, 0.025)
    .name("Gir avantbraç Y")
    .onChange((value) => girarAvantbraçY(value));
  menu
    .add(effectController, "gir_avantbraçZ", -90.0, 90.0, 0.025)
    .name("Gir avantbraç Z")
    .onChange((value) => girarAvantbraçZ(value));
  menu
    .add(effectController, "gir_pinça", -40.0, 220.0, 0.025)
    .name("Gir pinça")
    .onChange((value) => girarPinça(value));
  menu
    .add(effectController, "separacio_pinça", 0.0, 15.0, 0.025)
    .name("Separació pinça")
    .onChange((value) => separarPinça(value));
  //Checkbox alambric vs solid
  menu
    .add(effectController, "alambre")
    .name("Alámbrico")
    .onChange((value) => {
      material.wireframe = value;
    });
  //Ara vull que animar siga un botó
  menu.add(effectController, "animar").name("Animar");
}

//Funció per carregar totes les geometries de l'escena
function loadScene() {
  const robot = crearRobotSuelo(material, material);
  scene.add(robot);

  //Crear els eixos de coordenades
  scene.add(new THREE.AxesHelper(10));

  habilitarLlums();
}

//Funció per donar animació
function update() {
  //Donem animació al robot perquè vaja girant i així poder veure-ho tot
  // angulo += 0.01;
  // scene.rotation.y = angulo;
  TWEEN.update();
}

//Funció render, sense el render no es veuria res, qualsevol modificació que es faça a l'escena s'ha de cridar a render després
function render() {
  requestAnimationFrame(render);
  //update();
  renderer.clear();

  //que ocupe tot l'espai disponible
  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);

  //Per a que ocupe 1/4 de la pantalla me quede amb el mínim entre l'altura i l'amplada i ho dividisc entre 4
  const lado = Math.min(window.innerWidth, window.innerHeight) / 4;
  renderer.setViewport(0, window.innerHeight - lado, lado, lado);
  renderer.render(scene, planta);
}

function setCameras(ar) {
  let camaraOrto;
  if (ar > 1) camaraOrto = new THREE.OrthographicCamera(-L, L, L, -L, -20, 400);
  else camaraOrto = new THREE.OrthographicCamera(-L, L, L, -L, -20, 400);

  planta = camaraOrto.clone();
  planta.position.set(0, 200, 0);
  planta.lookAt(new THREE.Vector3(0, 0, 0));
  planta.rotateZ(-Math.PI / 2); //per a que es veja com en l'enunciat, mirant cap amunt
  planta.up = new THREE.Vector3(0, 0, -1);
}

function updateAspectRatio() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  //Nova aspect ratio
  const ar = window.innerWidth / window.innerHeight;

  ///perspectiva
  camera.aspect = ar;
  camera.updateProjectionMatrix();
  if (ar > 1) {
    planta.left = -L;
    planta.right = L;
    planta.top = L;
    planta.bottom = -L;
  } else {
    planta.left = -L;
    planta.right = L;
    planta.top = L;
    planta.bottom = -L;
  }

  planta.updateProjectionMatrix();
}

function girarBase(angle) {
  angle = (angle * Math.PI) / 180; //ho passem a radians
  const base = scene.getObjectByName("base");
  base.rotation.y = angle;
}

function girarBraç(angle) {
  angle = (angle * Math.PI) / 180; //ho passem a radians
  const braç = scene.getObjectByName("brazo");
  braç.rotation.z = angle;
}

function girarAvantbraçY(angle) {
  angle = (angle * Math.PI) / 180; //ho passem a radians
  const avantbraç = scene.getObjectByName("antebrazo");
  avantbraç.rotation.y = angle;
}

function girarAvantbraçZ(angle) {
  angle = (angle * Math.PI) / 180; //ho passem a radians
  const avantbraç = scene.getObjectByName("antebrazo");
  // const desfer_rotacio_y = new THREE.Matrix4().makeRotationY(-Math.PI / 2);
  // avantbraç.applyMatrix4(desfer_rotacio_y);
  // const aplicar_rotacio_z = new THREE.Matrix4().makeRotationX(angle);
  // avantbraç.applyMatrix4(aplicar_rotacio_z);
  // const tornar_rotacio_y = new THREE.Matrix4().makeRotationY(Math.PI / 2);
  // avantbraç.applyMatrix4(tornar_rotacio_y);
  avantbraç.rotation.z = angle;
}

function girarPinça(angle) {
  angle = (angle * Math.PI) / 180; //ho passem a radians
  const pinça = scene.getObjectByName("mans");
  pinça.rotation.z = angle;
}

function separarPinça(separacio) {
  const ma_esq = scene.getObjectByName("ma_esquerra");
  const ma_dreta = scene.getObjectByName("ma_dreta");
  ma_esq.position.z = -separacio / 2;
  ma_dreta.position.z = separacio / 2;
}

///Funció per a animar el robot
function performAnimation() {
  //s'haurà de fer l'animació amb TWEEN de manera que cadascun dels moviments vaja a una velocitat
  //així es configura una animació.
  //Fer-ho en intervals que ens interesse per exemple perquè no es veja la pinça mirant cap avall
  //Per a això deuríem no de cridar a les funcions directament, si no fer un change dels elements del gui
  const animate = (t) => {
    TWEEN.update(t);
    window.requestAnimationFrame(animate);
  };
  animate();
  animacioBase();
  animacioBrazo();
  animacioAvantbraçZ();
  animacioPinça();
  animacioPinçaSeparacio();
}

function animacioBase() {
  const inici = -Math.PI / 2,
    fi = -(2 * Math.PI) / 3;
  const tween = new TWEEN.Tween({ y: inici })
    .to({ y: fi }, 6000)
    .easing(TWEEN.Easing.Elastic.InOut)
    .interpolation(TWEEN.Interpolation.Linear)
    .onUpdate((coords) => {
      menu.controllers[0].setValue((coords.y * 180) / Math.PI);
    });
  tween.start();

  const tween2 = new TWEEN.Tween({ y: fi })
    .to({ y: inici }, 6000)
    .delay(6000)
    .easing(TWEEN.Easing.Elastic.InOut)
    .interpolation(TWEEN.Interpolation.Linear)
    .onUpdate((coords) => {
      menu.controllers[0].setValue((coords.y * 180) / Math.PI);
    });
  tween2.start();
}

function animacioBrazo() {
  const inici = 0,
    fi = Math.PI / 4;

  const tween = new TWEEN.Tween({ z: inici })
    .to({ z: fi }, 4000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .interpolation(TWEEN.Interpolation.Linear)
    .onUpdate((coords) => {
      menu.controllers[1].setValue((coords.z * 180) / Math.PI);
    });
  tween.start();

  const tween2 = new TWEEN.Tween({ z: fi })
    .to({ z: inici }, 4000)
    .delay(4000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .interpolation(TWEEN.Interpolation.Linear)
    .onUpdate((coords) => {
      menu.controllers[1].setValue((coords.z * 180) / Math.PI);
    });
  tween2.start();
}

function animacioAvantbraçZ() {
  const iniciY = 0,
    fiY = Math.PI / 4;
  const iniciZ = 0,
    fiZ = Math.PI / 4;

  menu.controllers[2].setValue(0); //actualitzem el valor a 0 però realment són 180 graus
  const antebrazo = scene.getObjectByName("antebrazo");
  antebrazo.rotation.y = Math.PI / 2;

  const tween = new TWEEN.Tween({ z: iniciZ })
    .to({ z: fiZ }, 4000)
    .easing(TWEEN.Easing.Sinusoidal.InOut)
    .interpolation(TWEEN.Interpolation.Linear)
    .onUpdate((coords) => {
      // menu.controllers[2].setValue((coords.y * 180) / Math.PI);
      menu.controllers[3].setValue((coords.z * 180) / Math.PI);
    });
  tween.start();

  const tween2 = new TWEEN.Tween({ z: fiZ })
    .to({ z: iniciZ }, 4000)
    .delay(4000)
    .easing(TWEEN.Easing.Sinusoidal.InOut)
    .interpolation(TWEEN.Interpolation.Linear)
    .onUpdate((coords) => {
      // menu.controllers[2].setValue((coords.y * 180) / Math.PI);
      menu.controllers[3].setValue((coords.z * 180) / Math.PI);
    });
  tween2.start();
}

function animacioPinça() {
  const inici = 0,
    fi = Math.PI / 4;
  const tween = new TWEEN.Tween({ z: inici })
    .to({ z: fi }, 3000)
    .easing(TWEEN.Easing.Quartic.Out)
    .interpolation(TWEEN.Interpolation.Linear)
    .onUpdate((coords) => {
      menu.controllers[4].setValue((coords.z * 180) / Math.PI);
    });
  tween.start();

  const tween2 = new TWEEN.Tween({ z: fi })
    .to({ z: inici }, 4000)
    .delay(3000)
    .easing(TWEEN.Easing.Quartic.Out)
    .interpolation(TWEEN.Interpolation.Linear)
    .onUpdate((coords) => {
      menu.controllers[4].setValue((coords.z * 180) / Math.PI);
    });
  tween2.start();
}

function animacioPinçaSeparacio() {
  const inici = 15,
    fi = 0;

  const tween = new TWEEN.Tween({ z: inici })
    .to({ fi: 0 }, 3000)
    .easing(TWEEN.Easing.Cubic.In)
    .interpolation(TWEEN.Interpolation.Linear)
    .onUpdate((coords) => {
      menu.controllers[5].setValue(coords.z);
    });
  tween.start();

  const tween2 = new TWEEN.Tween({ z: fi })
    .to({ z: inici }, 4000)
    .delay(3000)
    .easing(TWEEN.Easing.Cubic.In)
    .interpolation(TWEEN.Interpolation.Linear)
    .onUpdate((coords) => {
      menu.controllers[5].setValue(coords.z);
    });
  tween2.start();
}

function crearLlums() {
  const ambiental = new THREE.AmbientLight(0x222222);
  scene.add(ambiental);

  const puntual = new THREE.PointLight(0xffffff, 0.5);
  puntual.position.set(2, 300, -4);
  scene.add(puntual);

  const puntual2 = new THREE.PointLight(0xffffff, 0.5);
  puntual2.position.set(2, 150, 20);
  scene.add(puntual2);

  const focal = new THREE.SpotLight(0xffffff, 0.3);
  focal.position.set(-300, 500, -50);
  focal.target.position.set(0, 0, 0);
  focal.angle = Math.PI / 7;
  focal.penumbra = 0.3;
  focal.castShadow = true;
  focal.shadow.camera.far = 800;
  focal.shadow.camera.fov = 80;
  scene.add(focal);
  scene.add(new THREE.CameraHelper(focal.shadow.camera));
}

function habilitarLlums() {
  scene.traverse(function (child) {
    if (child.isMesh) {
      child.receiveShadow = true;
      child.castShadow = true;
    }
  });
}
