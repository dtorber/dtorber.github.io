//Escena cubo
import * as THREE from '../lib/three.module.js';

//Variables globals

//escena
var scene = new THREE.Scene();
scene.background = new THREE.Color(0x220044);

//camera
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

//renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight); //el contexte i la finestra tindran les mateixes dimensions

//ara enllacem el canvas al renderer
document.body.appendChild(renderer.domElement);

//cub
var geometry = new THREE.BoxGeometry();
var material = new THREE.MeshBasicMaterial({color: "rgb(180,20,70)", wireframe: true});
var cub = new THREE.Mesh(geometry, material);
cub.position.x = -1;
scene.add(cub);

//Posició de la càmera perquè inicialment està en l'origen
camera.position.z = 5;
camera.position.y = -1;

//Render
renderer.render(scene, camera);

//crear animació
var animate = function() {
    requestAnimationFrame(animate);
    cub.rotation.x += 0.01;
    // cub.rotation.y += 0.01;
    scene.rotation.y += 0.01;

    renderer.render(scene, camera);
}

animate();