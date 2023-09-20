import * as THREE from '../lib/three.module.js';
//Variables estandar
let renderer, scene, camera;

//Otras globales
let esferaCub;
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
    camera.position.set(0.5, 5, 25);
    camera.lookAt(0,1,0);

    //Variables de dimensions del ganxo

    //Definir els vertexs de la geometria
    const vertices = new Float32Array([

}

function loadScene() {
    //Material senzill
    const material = new THREE.MeshBasicMaterial({color:'red', wireframe: true});
    
    //Suelo
    const suelo = new THREE.Mesh(new THREE.PlaneGeometry(100, 100, 10, 10), material); //es 1000x1000 de tamany i gasta 10 meridians i 10 paral·lels 
    suelo.rotation.x = -Math.PI / 2;
    scene.add(suelo);

}

function update () {
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