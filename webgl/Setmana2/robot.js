import * as THREE from '../lib/three.module.js';
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
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100);
    camera.position.set(25, 10, 50);
    camera.lookAt(0,1,0);
}

function loadScene() {
    //crear_base();  
    crear_ganxo();    
}

function update () {

}

function render() {
    requestAnimationFrame(render);
    update();
    renderer.render(scene, camera);
}

function crear_base() {
    //Suelo
    const suelo = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 100, 100), material); //es 1000x1000 de tamany i gasta 100 meridians i 100 paral·lels 
    suelo.rotation.x = -Math.PI / 2;
    scene.add(suelo);
}

//Funcions que creen cadascuna de les parts del robot
function crear_ganxo () {
    //Codi per a definir el ganxo del ROBOT

    //Variables de dimensions del ganxo
    const h = 20; //altura
    const w = 18; //amplada
    const G = 4; //profunditat
    const G_prima = 2; //profunditat'

    //Definir els vertexs de la geometria
    const vertices = new Float32Array([
        0, 0, 0, // inexistent però per a poder gastar els índexs amb la nomenclatura 1 a 12
        0, h, 0, // v1
        w, h, 0, // v2
        2 * w, 3 * h / 4, 0, // v3
        2 * w, h / 4, 0, // v4
        w, 0, 0, // v5
        0, 0, 0, // v6
        0, h, -G, // v7
        w, h, -G, // v8
        2 * w, 3 * h / 4, -G_prima, // v9
        2 * w, h / 4, -G_prima, // v10
        w, 0, -G, // v11
        0, 0, -G, // v12
    ]);

    
    //Definir les cares de la geometria
    const triangles = new Uint8Array([
        //cares de la part rectangular (base)
        1, 5, 2, //cara 1
        1, 6, 5, 
        6, 11, 5, //cara 2
        6, 12, 11, 
        2, 5, 11, //cara 3
        2, 11, 8, 
        7, 1, 2, //cara 4
        7, 2, 8,
        7, 12, 6, //cara 5
        7, 6, 1,
        12, 7, 8, //cara 6
        12, 8, 11,
        //cares de lo que seria la part articulada del ganxo
        2, 5, 4, //cara 7
        2, 4, 3,
        5, 11, 10, //cara 8
        5, 10, 4,
        8, 2, 3, //cara 9
        8, 3, 9,
        3, 4, 10, //cara 10
        3, 10, 9,
        9, 10, 11, //cara 11
        9, 11, 8,   
    ]);

    //Definir les normals de cada triangle
    //Tindrà la mateixa mida que triangles perquè per cada triangle (3 vértexs) hi haurà una normal amb (x, y, z)
    const normals = new Float32Array(triangles.length);
    for (let i = 0; i < triangles.length; i += 3) {
        //anem a cadascun dels triangles i agafem cadascun dels vértexs i traem la seua (x,y,z) amb vertices
        const v1 = new THREE.Vector3(vertices[3 * triangles[i]], vertices[3 * triangles[i] + 1], vertices[3 * triangles[i] + 2]);
        const v2 = new THREE.Vector3(vertices[3 * triangles[i + 1]], vertices[3 * triangles[i + 1] + 1], vertices[3 * triangles[i + 1] + 2]);
        const v3 = new THREE.Vector3(vertices[3 * triangles[i + 2]], vertices[3 * triangles[i + 2] + 1], vertices[3 * triangles[i + 2] + 2]);
        //calculem la normal de cada cara amb els 3 vértexs
        const normal = calcular_normal(v1, v2, v3);
        //i asssignem la normal d'eixa cara
        normals[i] = normal.x
        normals[i + 1] = normal.y
        normals[i + 2] = normal.z;
    }

    
    //Definir la geometria
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(new THREE.BufferAttribute(triangles, 1));
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));

    //Assignar la geometria
    const ganxo = new THREE.Mesh (geometry, new THREE.MeshBasicMaterial({color:'red', wireframe: true}));
    scene.add(ganxo);
}

//Funcions auxiliars
function calcular_normal (v1, v2, v3) {
    const vector1 = new THREE.Vector3();
    const vector2 = new THREE.Vector3();
    vector1.subVectors(v2, v1);
    vector2.subVectors(v3, v1);
    vector1.cross(vector2);
    vector1.normalize();
    return vector1;
}