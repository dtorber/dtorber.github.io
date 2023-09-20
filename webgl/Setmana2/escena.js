import * as THREE from '../lib/three.module.js';
import {GLTFLoader} from "../lib/GLTFLoader.module.js";

//Variables estandar
let renderer, scene, camera;

//Otras globales
let esferaCubo;
let angulo = 0;

function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("container").appendChild(renderer.domElement);

    //Instanciar el node arrel de l'escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0.5, 0.5, 0.5);

    //Instanciar la càmera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100);
    camera.position.set(0.5, 2, 7);
    camera.lookAt(0,1,0);
}

function loadScene() {
    //Material senzill
    const material = new THREE.MeshBasicMaterial({color:'yellow', wireframe: true});
    
    //Suelo
    const suelo = new THREE.Mesh(new THREE.PlaneGeometry(10, 10, 10, 10), material); //es 10x10 de tamany i gasta 10 meridians i 10 paral·lels 
    suelo.rotation.x = -Math.PI/2;
    suelo.position.y = -0.2;
    scene.add(suelo);

    //Esfera i cub
    const esfera = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 20), material);
    const cub = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), material);
    esfera.position.x = 1;
    cub.position.x = -1;
    
    const esferaCub = new THREE.Object3D();
    esferaCub.add(esfera);
    esferaCub.add(cub);
    esferaCub.position.y = 1.5;
    scene.add(esferaCub);

    scene.add(new THREE.AxesHelper(3));
    cub.add(new THREE.AxesHelper(1));

    //Models importats
    const loader = new THREE.ObjectLoader();
    loader.load("../models/soldado/soldado.json",
    function (objeto) {
        cub.add(objeto),
        objeto.position.y = 1;
    });x

    const glloader = new GLTFLoader();
    glloader.load("../models/robota/scene.gltf", 
    function (objeto) {
        esfera.add(objeto.scene);
        objeto.scene.scale.set(0.5,0.5,0.5);
        objeto.scene.position.y = 1;
        objeto.scene.rotation.y = -Math.PI / 2;
        console.log("ROBOT");
        console.log(objeto);
    });
}

function update () {
    angulo += 0.01;
    scene.rotation.y = angulo;
}

function render() {
    requestAnimationFrame(render);
    update();
    renderer.render(scene, camera);
}

//Accions
init();
loadScene();
render();