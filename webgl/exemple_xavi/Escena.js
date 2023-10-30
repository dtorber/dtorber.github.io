/**
 * Escena.js
 *
 * Escena Básica Planeta
 * @author <jlluch@upv.es>
 *
 *
 */

// Modulos necesarios
import * as THREE from "../lib/three.module.js";
import { OrbitControls } from "../lib/OrbitControls.module.js";

let starsTexture = "./img/stars.jpg";
let sunTexture = "./img/sun.jpg";
let earthTexture = "./img/earth.jpg";
let moonTexture = "./img/moon.jpg";

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(-90, 140, 140);
orbit.update();

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
  starsTexture,
  starsTexture,
  starsTexture,
  starsTexture,
  starsTexture,
  starsTexture,
]);

const textureLoader = new THREE.TextureLoader();

const sunGeo = new THREE.SphereGeometry(16, 30, 30);
const sunMat = new THREE.MeshBasicMaterial({
  map: textureLoader.load(sunTexture),
});
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

function createPlanete(size, texture, position, ring) {
  const geo = new THREE.SphereGeometry(size, 30, 30);
  const mat = new THREE.MeshStandardMaterial({
    map: textureLoader.load(texture),
  });
  const mesh = new THREE.Mesh(geo, mat);
  const obj = new THREE.Object3D();
  obj.add(mesh);
  scene.add(obj);
  mesh.position.x = position;
  return { mesh, obj };
}

const earth = createPlanete(6, earthTexture, 62);
const moon = createPlanete(3, moonTexture, 52);
renderer.shadowMap.enabled = true;

const pointLight = new THREE.PointLight(0xffffff, 2, 300);
pointLight.castShadow = true;
pointLight.shadow.camera.left = -500;
pointLight.shadow.camera.right = 500;
pointLight.shadow.camera.top = 500;
pointLight.shadow.camera.bottom = -500;
pointLight.shadow.camera.far = 10000;
//enxufar totes les llums
earth["mesh"].castShadow = true;
moon["mesh"].castShadow = true;
earth["obj"].castShadow = true;
moon["obj"].castShadow = true;
earth["mesh"].receiveShadow = true;
moon["mesh"].receiveShadow = true;
earth["obj"].receiveShadow = true;
moon["obj"].receiveShadow = true;
sun.receiveShadow = true;

sun.add(pointLight);
scene.add(new THREE.CameraHelper(pointLight.shadow.camera));

function animate() {
  //Self-rotation
  sun.rotateY(0.004);
  earth.mesh.rotateY(0.02);
  //Around-sun-rotation
  earth.obj.rotateY(0.01);
  moon.obj.rotateY(0.01);
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
