import * as THREE from '../lib/three.module.js';
import {OrbitControls} from "../lib/OrbitControls.module.js";
import crearRobotSuelo from "../js/RobotCreator.js";

//Variables estandard
let renderer, scene, camera;

//Otras globales
let angulo = 0;
const material = new THREE.MeshNormalMaterial({flatShadig:true, wireframe: false});
let planta; //per a vista de planta
const L = 50;

//Accions
init();
loadScene();
render();

function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xAAAAAA);
    renderer.autoClear = false;
    document.getElementById("container").appendChild(renderer.domElement);

    //Instanciar el node arrel de l'escena
    scene = new THREE.Scene();
    // scene.background = new THREE.Color(0.5, 0.5, 0.5);

    //Instanciar la càmera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(200,200,200);
    camera.lookAt(0,1,0);

    //Afegir controls:
    const controls = new OrbitControls(camera, renderer.domElement);
    //Limitem els controls perquè no es puga acostar massa ni allunyar-se massa
    controls.minDistance = 1;
    controls.maxDistance = 1000;

    //Per a que les càmeres es redimensionen amb la finestra
    const ar = window.innerWidth / window.innerHeight;
    setCameras(ar);
    //Captura d'esdeveniments
    window.addEventListener('resize', updateAspectRatio);    
}   


//Funció per carregar totes les geometries de l'escena
function loadScene() {
    const robot = crearRobotSuelo(material, material);
    scene.add(robot);

    //Crear els eixos de coordenades
    scene.add(new THREE.AxesHelper(3));
}

//Funció per donar animació
function update () {
    //Donem animació al robot perquè vaja girant i així poder veure-ho tot
    // angulo += 0.01;
    // scene.rotation.y = angulo;
}

//Funció render, sense el render no es veuria res, qualsevol modificació que es faça a l'escena s'ha de cridar a render després
function render() {
    requestAnimationFrame(render);
    //update();
    renderer.clear();
    
    let w = window.innerWidth / 2;
    let h = window.innerHeight / 2;

    renderer.setViewport(0,0,2*w,2*h);
    renderer.render(scene, camera);

    const lado = Math.min(window.innerWidth, window.innerHeight) / 4;
    renderer.setViewport(0,lado*3,lado, lado);
    renderer.render(scene, planta);
}

function setCameras (ar) {
    let camaraOrto;
    if (ar > 1) 
        camaraOrto = new THREE.OrthographicCamera(-L*ar, L*ar, L, -L, -20, 300);
    else
        camaraOrto = new THREE.OrthographicCamera(-L, L, L / ar, -L / ar, -20, 300);

    planta = camaraOrto.clone();
    planta.position.set(0,200,0);
    planta.lookAt(new THREE.Vector3(0,0,0));
    planta.up = new THREE.Vector3(0,0,-1);
}

function updateAspectRatio () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    //Nova aspect ratio
    const ar = window.innerWidth / window.innerHeight;
    
    ///perspectiva
    camera.aspect = ar;
    camera.updateProjectionMatrix();
    if (ar > 1) {
        planta.left = -L * ar;
        planta.right = L * ar;
        planta.top = L;
        planta.bottom = -L;
    } else {
        planta.left = -L;
        planta.right = L;
        planta.top = L / ar;
        planta.bottom = -L / ar;
    }

    planta.updateProjectionMatrix();
}