import * as THREE from '../lib/three.module.js';
import {GLTFLoader} from "../lib/GLTFLoader.module.js";
import {OrbitControls} from "../lib/OrbitControls.module.js";
//Variables estandar
let renderer, scene, camera;

//Otras globales
let esferaCubo;
let angulo = 0;
//Per a les càmeres
let alzado, planta, perfil;
const L = 5;

function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xAAAAAA);
    renderer.autoClear = false;
    document.getElementById("container").appendChild(renderer.domElement);

    //Instanciar el node arrel de l'escena
    scene = new THREE.Scene();
    //scene.background  = new THREE.Color(0.5, 0.5, 0.5);

    //Instanciar la càmera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100);
    camera.position.set(0.5, 2, 7);
    camera.lookAt(0,1,0);
    //Per a poder moure la càmera amb el ratolí
    const controls = new OrbitControls(camera, renderer.domElement);

    //Per a que les càmeres es redimensionen amb la finestra
    const ar = window.innerWidth / window.innerHeight;
    setCameras(ar);
    //Captura d'esdeveniments
    window.addEventListener('resize', updateAspectRatio);

    //Captura d'esdeveniment per al doble click
    renderer.domElement.addEventListener('dblclick', rotateShape);
}

//Se cridarà cada vegada que redimensione la finestra
function updateAspectRatio () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    //Nova aspect ratio
    const ar = window.innerWidth / window.innerHeight;
    
    ///perspectiva
    camera.aspect = ar;
    camera.updateProjectionMatrix();

    if (ar > 1) {
        alzado.left = planta.left = perfil.left = -L * ar;
        alzado.right = planta.right = perfil.right = L * ar;
        alzado.top = planta.top = perfil.top = L;
        alzado.bottom = planta.bottom = perfil.bottom = -L;
    } else {
        alzado.left = planta.left = perfil.left = -L;
        alzado.right = planta.right = perfil.right = L;
        alzado.top = planta.top = perfil.top = L / ar;
        alzado.bottom = planta.bottom = perfil.bottom = -L / ar;
    }

    alzado.updateProjectionMatrix();
    planta.updateProjectionMatrix();
    perfil.updateProjectionMatrix();
}

function rotateShape (event) {
    //Captura la posició del doble click (S.R. top-left con Y down)
    let x = event.clientX, y = event.clientY;

    let derecha = false, abajo = false;
    let cam = null;

    if (x > window.innerWidth / 2) {
        derecha = true;
        x -= window.innerWidth / 2;
    }
    if (y > window.innerHeight / 2) {
        abajo = true;
        y -= window.innerHeight / 2;
    }

    if (derecha) {
        if (abajo) cam = camera;
        else cam = perfil;
    } else {
        if (abajo) cam = planta;
        else cam = alzado
    }

    //Normalitzar les coordenades de clic al quadrat de 2x2
    //x * 2 / (w/2) -> x * 4 / w
    x = (x * 4) / window.innerWidth - 1;
    y = -(y * 4) / window.innerHeight + 1;

    //Raig i interseccions
    const rayo = new THREE.Raycaster();
    rayo.setFromCamera(new THREE.Vector2(x,y), cam);

    const interseccion = rayo.intersectObjects(scene.getObjectByName('grupoEC').children, false);
    if (interseccion.length > 0) interseccion[0].object.rotation.y += Math.PI / 4;
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
    esferaCub.name = "grupoEC";
    scene.add(esferaCub);

    scene.add(new THREE.AxesHelper(3));
    cub.add(new THREE.AxesHelper(1));

    //Models importats
    const loader = new THREE.ObjectLoader();
    loader.load("../models/soldado/soldado.json",
    function (objeto) {
        cub.add(objeto),
        objeto.position.y = 1;
    });

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

function setCameras(ar) {
    let camaraOrto;

    if (ar > 1) 
        camaraOrto = new THREE.OrthographicCamera(-L*ar, L*ar, L, -L, -10, 100);
    else
        camaraOrto = new THREE.OrthographicCamera(-L, L, L / ar, -L / ar, -10, 100);
    
    alzado = camaraOrto.clone();
    alzado.position.set(0,0,10);
    alzado.lookAt(0,0,0);

    perfil = camaraOrto.clone();
    perfil.position.set(10,0,0);
    perfil.lookAt(0,0,0);

    planta = camaraOrto.clone();
    planta.position.set(0,10,0);
    planta.lookAt(0,0,0);
    planta.up = new THREE.Vector3(0,0,-1);
}

function update () {
    angulo += 0.01;
    scene.rotation.y = angulo;
}

function render() {
    requestAnimationFrame(render);
    //update();
    renderer.clear();
    let w = window.innerWidth / 2;
    let h = window.innerHeight / 2;
    
    //Creem realment les vistes per a les càmeres que hem creat
    //I les assignem a les X,Y que vulguem, es a dir partim el canvas en 4
    renderer.setViewport(0, h, w, h);
    renderer.render(scene, alzado);
    renderer.setViewport(0,0,w,h);
    renderer.render(scene, planta);
    renderer.setViewport(w,h,w,h);
    renderer.render(scene, perfil);
    renderer.setViewport(w,0,w,h);
    renderer.render(scene, camera);
}

//Accions
init();
loadScene();
render();