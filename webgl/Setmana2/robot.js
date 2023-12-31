import * as THREE from '../lib/three.module.js';
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
    camera.position.set(210,210,210);
    camera.lookAt(0,1,0);
}

//Funció per carregar totes les geometries de l'escena
function loadScene() {
    //Crear el piso sobre el qual estarà tot ubicat
    const robotSuelo = crearRobotSuelo(material, material);
    scene.add(robotSuelo);

    //Crear els eixos de coordenades
    scene.add(new THREE.AxesHelper(3));
}

//Funció per donar animació
function update () {
    //Donem animació al robot perquè vaja girant i així poder veure-ho tot
    angulo += 0.01;
    scene.rotation.y = angulo;
}

//Funció render, sense el render no es veuria res, qualsevol modificació que es faça a l'escena s'ha de cridar a render després
function render() {
    requestAnimationFrame(render);
    update();
    renderer.render(scene, camera);
}