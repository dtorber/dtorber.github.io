import * as THREE from "../lib/three.module.js";
import { OrbitControls } from "../lib/OrbitControls.module.js";

const loader = new THREE.TextureLoader();

//Funció per a crear totes les parts del robot
function crearRobotSuelo(materialPiso, materialRobot) {
  const root = new THREE.Object3D();
  //Crear el piso sobre el qual estarà tot ubicat
  const suelo = crear_piso(materialPiso);
  root.add(suelo);

  const habitacio = crear_habitacio();
  root.add(habitacio);

  //Crear el robot que serà el pare de tot
  const robot = new THREE.Object3D();
  robot.name = "robot";
  //Després li afegim la jerarquia a través de cridades i cadascuna ja construeix la seua pròpia jerarquia
  const brazo_robot = crear_brazo(materialRobot);
  const base_robot = crear_base_robot(materialRobot);
  base_robot.add(brazo_robot);
  robot.add(base_robot);
  //Es redueixen les mesures perquè puga cabre en tota la pantalla
  // robot.scale.set(0.035, 0.035, 0.035);
  root.add(robot);
  robot.add(new THREE.AxesHelper(200));
  return root;
}

//Funció per crear el piso sobre el qual estarà tot ubicat
function crear_piso(material) {
  //Suelo
  const suelo_geometria = new THREE.PlaneGeometry(1000, 1000, 100, 100);
  suelo_geometria.name = "suelo";
  material = material.clone();
  loader.load("../textures/iron_floor_3.png", (texture) => {
    material.map = texture;
    material.map.wrapS = THREE.RepeatWrapping;
    material.map.wrapT = THREE.RepeatWrapping;
    material.map.repeat.set(10, 10);
    material.needsUpdate = true;
  });
  const suelo = new THREE.Mesh(suelo_geometria, material); //es 1000x1000 de tamany i gasta 100 meridians i 100 paral·lels
  suelo.rotation.x = -Math.PI / 2;
  return suelo;
}

//Funcions que creen cadascuna de les parts del robot

//Funció per crear la base del robot (Que serà un cilindre)
function crear_base_robot(material) {
  const radi = 50,
    altura = 15;
  const root = new THREE.Object3D();
  root.name = "base";
  const base = new THREE.CylinderGeometry(radi, radi, altura, 50, 1);
  material = new THREE.MeshLambertMaterial();
  loader.load("../textures/bronze_texture.jpg", (texture) => {
    material.map = texture;
    material.needsUpdate = true;
  });
  let base_mesh = new THREE.Mesh(base, material);
  base_mesh.rotation.y = Math.PI / 2;
  root.add(base_mesh);
  return root;
}

//Funció per crear el braç del robot
function crear_brazo(material) {
  //El braç està composat de 3 elements:
  //  - Eix
  //  - Espàrrec
  //  - Ròtula
  //I té també a continuació l'avantbraç
  const brazo = new THREE.Object3D();
  brazo.name = "brazo";
  const eix = crear_eix(material);
  brazo.add(eix);
  const esparrec = crear_esparrec(material);
  brazo.add(esparrec);
  const rotula = crear_rotula(material, 120);
  brazo.add(rotula);
  //tot i que realment l'avantbraç no és part del braç, el posem ací perquè penja d'ell en la jerarquia
  const antebrazo = crear_antebrazo(material, 80);
  antebrazo.position.y = 120;
  brazo.add(antebrazo);
  return brazo;
}

function crear_eix(material) {
  const radi = 20,
    height = 18;
  const root = new THREE.Object3D();
  root.name = "eix";
  const eix_geometria = new THREE.CylinderGeometry(radi, radi, height, 50, 1);
  material = new THREE.MeshLambertMaterial();
  loader.load("../textures/bronze_texture.jpg", (texture) => {
    material.map = texture;
    material.needsUpdate = true;
  });
  const eix = new THREE.Mesh(eix_geometria, material);
  eix.rotation.x = -Math.PI / 2;
  root.add(eix);
  return root;
}

//Funció per crear l'espàrrec del braç
function crear_esparrec(material) {
  //crear un square box de 18x120x12
  const width = 18,
    height = 120,
    depth = 12;
  const root = new THREE.Object3D();
  root.name = "esparrec";
  const esparrec_geometria = new THREE.BoxGeometry(width, height, depth);
  esparrec_geometria.name = "esparrec";
  material = new THREE.MeshLambertMaterial();
  loader.load("../textures/bronze_texture.jpg", (texture) => {
    material.map = texture;
    material.needsUpdate = true;
  });
  const esparrec = new THREE.Mesh(esparrec_geometria, material);
  //pujar l'esparrec perquè coincidisca amb el centre del cilindre
  esparrec.position.y = height / 2;
  //i el girem perquè coincidisca amb els dos centres dels radis
  esparrec.rotation.y = Math.PI / 2;
  root.add(esparrec);
  return root;
}

//Funció per crear la rótula del braç
function crear_rotula(material, altura = 120) {
  //crear una esfera de radi 20
  const radi = 20;
  const root = new THREE.Object3D();
  root.name = "rotula";
  const rotula_geometria = new THREE.SphereGeometry(radi);

  const entorn = [
    "../textures/px.png",
    "../textures/nx.png",
    "../textures/py.png",
    "../textures/ny.png",
    "../textures/pz.png",
    "../textures/nz.png",
  ];
  const texturaRotula = new THREE.CubeTextureLoader().load(entorn);

  material = new THREE.MeshPhongMaterial({
    color: "white",
    specular: 0xffd700,
    shininess: 30,
    envMap: texturaRotula,
  });

  const rotula = new THREE.Mesh(rotula_geometria, material);
  //fa falta que ho pugem per tal que la rótula estiga enganxada amb l'espàrrec
  rotula.position.y = altura;
  root.add(rotula);
  return root;
}

//Funció per crear l'avantbraç del robot
function crear_antebrazo(material, altura = 80) {
  material = new THREE.MeshPhongMaterial({
    color: 0xffd700,
    specular: 0x111111,
    shininess: 100,
    // emissive: new THREE.Color(0xffd700),
    // emissiveIntensity: 0.2,
  });
  const ante_brazo = new THREE.Object3D();
  ante_brazo.name = "antebrazo";
  const disc = crear_disc(material);
  ante_brazo.add(disc);
  const nervis = crear_nervis(material);
  ante_brazo.add(nervis);
  const monyica = crear_monyica(material, altura);
  ante_brazo.add(monyica);
  ante_brazo.add(new THREE.AxesHelper(200));
  // ante_brazo.position.z = - 120;
  return ante_brazo;
}

//Funció per crear el disc de l'avantbraç
function crear_disc(material) {
  const radi = 22,
    altura = 6;
  const root = new THREE.Object3D();
  root.name = "disc";
  const disc_geometria = new THREE.CylinderGeometry(radi, radi, altura, 50, 1);
  material = material.clone();
  loader.load("../textures/gold_texture.jpg", (texture) => {
    material.map = texture;
    material.needsUpdate = true;
  });
  const disc = new THREE.Mesh(disc_geometria, material);
  root.add(disc);
  return root;
}

//Funció per crear els nervis de l'avantbraç
function crear_nervis(material) {
  const nervis = new THREE.Object3D();
  nervis.name = "nervis";
  const width = 4,
    height = 80,
    depth = 4;
  const r = 22;
  const posicions = [
    -r / 2,
    0,
    -r / 2,
    r / 2,
    0,
    -r / 2,
    r / 2,
    0,
    r / 2,
    -r / 2,
    0,
    r / 2,
  ];
  material = material.clone();
  loader.load("../textures/gold_texture.jpg", (texture) => {
    material.map = texture;
    material.needsUpdate = true;
  });
  for (let i = 0; i < 4; i += 1) {
    const nervi = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      material
    );
    nervi.position.set(
      posicions[3 * i],
      posicions[3 * i + 1],
      posicions[3 * i + 2]
    );
    nervis.add(nervi);
  }
  //volem pujar els nervis perquè estiguen a la mateixa alçada que el disc
  nervis.position.y = height / 2;
  return nervis;
}

//Funció per crear la monyica del robot
function crear_monyica(material, altura = 80) {
  const height = 40,
    radi = 15;
  const root = new THREE.Object3D();
  root.name = "monyica";
  const monyica_geometria = new THREE.CylinderGeometry(
    radi,
    radi,
    height,
    50,
    1
  );
  const nouMaterial = material.clone();
  loader.load("../textures/brillante.jpg", (texture) => {
    nouMaterial.map = texture;
    nouMaterial.needsUpdate = true;
  });
  const monyica = new THREE.Mesh(monyica_geometria, nouMaterial);
  //ho pugem perquè estiga al final del braç
  monyica.position.y = altura;
  monyica.rotation.z = Math.PI / 2;
  root.add(monyica);
  const mano = crear_ma(material, altura + 10); //li sumem 10 perquè és la meitat de l'altura de la mà
  root.add(mano);
  root.rotation.y = Math.PI / 2;
  return root;
}

//Funció per crear la mà del robot
function crear_ma(material, altura = 80) {
  material = new THREE.MeshStandardMaterial();
  loader.load("../textures/diamond_texture2.jpg", (texture) => {
    material.map = texture;
    material.needsUpdate = true;
  });
  const mans = new THREE.Object3D();
  mans.name = "mans";
  const ma_esquerra = crear_ganxo(material);
  ma_esquerra.name = "ma_esquerra";
  const ma_dreta = crear_ganxo(material);
  ma_dreta.name = "ma_dreta";
  //per tal de posar ambdues mans a la mateixa distància del centre posem una en 11 i l'altra en -11
  //i com el cilindre de la monyica té 40 d'altura, dons cadascu ha d'estar a 10 unitats del centre i del final
  //però li posem 11 perquè coincidisca amb els nervis
  mans.add(ma_esquerra);
  mans.add(ma_dreta);
  mans.rotation.y = -Math.PI / 2;
  //volem que la mà estiga a la mateixa alçada que la monyica i coincidisca el centre (-10 perquè és la meitat de l'altura de la mà i 15 el radi de la monyica)
  mans.position.y = altura - 20;
  //després les repartim perquè es queden equidistants del centre i els extrems
  ma_esquerra.position.z = 11;
  ma_dreta.position.z = -11;
  //i per últim una de les mans ha de girar perquè estiga a l'altra banda
  ma_dreta.rotation.y = Math.PI;
  ma_dreta.rotation.z = Math.PI;
  ma_dreta.position.y = 20;
  return mans;
}

//Funció per crear el ganxo del robot
function crear_ganxo(material) {
  //Codi per a definir el ganxo del ROBOT

  //Variables de dimensions del ganxo
  const h = 20; //altura
  const w = 18; //amplada
  const G = 4; //profunditat
  const G_prima = 2; //profunditat'

  //Definir els vertexs de la geometria
  const vertices = new Float32Array([
    0,
    0,
    0, // inexistent però per a poder gastar els índexs amb la nomenclatura 1 a 12
    0,
    h,
    0, // v1
    w,
    h,
    0, // v2
    2 * w,
    (3 * h) / 4,
    0, // v3
    2 * w,
    h / 4,
    0, // v4
    w,
    0,
    0, // v5
    0,
    0,
    0, // v6
    0,
    h,
    -G, // v7
    w,
    h,
    -G, // v8
    2 * w,
    (3 * h) / 4,
    -G_prima, // v9
    2 * w,
    h / 4,
    -G_prima, // v10
    w,
    0,
    -G, // v11
    0,
    0,
    -G, // v12
  ]);

  //Definir les cares de la geometria
  const triangles = new Uint8Array([
    //cares de la part rectangular (base)
    1,
    5,
    2, //cara 1
    1,
    6,
    5,
    6,
    11,
    5, //cara 2
    6,
    12,
    11,
    2,
    5,
    11, //cara 3
    2,
    11,
    8,
    7,
    1,
    2, //cara 4
    7,
    2,
    8,
    7,
    12,
    6, //cara 5
    7,
    6,
    1,
    12,
    7,
    8, //cara 6
    12,
    8,
    11,
    //cares de lo que seria la part articulada del ganxo
    2,
    5,
    4, //cara 7
    2,
    4,
    3,
    5,
    11,
    10, //cara 8
    5,
    10,
    4,
    8,
    2,
    3, //cara 9
    8,
    3,
    9,
    3,
    4,
    10, //cara 10
    3,
    10,
    9,
    9,
    10,
    11, //cara 11
    9,
    11,
    8,
  ]);

  //Definir la geometria
  const root = new THREE.Object3D();
  root.name = "ganxo";
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(new THREE.BufferAttribute(triangles, 1));
  // geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geometry.computeVertexNormals();
  //Assignar la geometria
  const ganxo = new THREE.Mesh(geometry, material);
  root.add(ganxo);
  return root;
}

function crear_habitacio() {
  const parets = [];
  parets.push(
    new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      map: new THREE.TextureLoader().load("../textures/px.png"),
    })
  );
  parets.push(
    new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      map: new THREE.TextureLoader().load("../textures/nx.png"),
    })
  );
  parets.push(
    new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      map: new THREE.TextureLoader().load("../textures/py.png"),
    })
  );
  parets.push(
    new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      map: new THREE.TextureLoader().load("../textures/ny.png"),
    })
  );
  parets.push(
    new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      map: new THREE.TextureLoader().load("../textures/pz.png"),
    })
  );
  parets.push(
    new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      map: new THREE.TextureLoader().load("../textures/nz.png"),
    })
  );

  const geomtria = new THREE.BoxGeometry(1000, 1000, 1000, 100, 100, 100);
  return new THREE.Mesh(geomtria, parets);
}

export default crearRobotSuelo;
