import * as THREE from '../lib/three.module.js';
import {OrbitControls} from "../lib/OrbitControls.module.js";
import crearRobotSuelo from "../js/RobotCreator.js";

//Variables estandard
let renderer, scene, camera;

//Otras globales
let angulo = 0;
const material = new THREE.MeshBasicMaterial({color:'red', wireframe: true});

//Accions
init();
loadScene();
render();

function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("container").appendChild(renderer.domElement);

    //Instanciar el node arrel de l'escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0.5, 0.5, 0.5);

    //Instanciar la càmera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(200,200,200);
    camera.lookAt(0,1,0);

    //Afegir controls:
    const controls = new OrbitControls(camera, renderer.domElement);
    //Limitem els controls perquè no es puga acostar massa ni allunyar-se massa
    controls.minDistance = 1;
    controls.maxDistance = 1000;
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
    renderer.render(scene, camera);
}