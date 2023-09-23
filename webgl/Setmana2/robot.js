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
    camera.position.set(7, 5, 9);
    camera.lookAt(0,1,0);
}

//Funció per carregar totes les geometries de l'escena
function loadScene() {
    //Crear el piso sobre el qual estarà tot ubicat
    const suelo = crear_piso();  
    scene.add(suelo);

    //Crear el robot que serà el pare de tot
    const robot = new THREE.Object3D();
    //Després li afegim la jerarquia a través de cridades i cadascuna ja construeix la seua pròpia jerarquia
    const base_robot = crear_base_robot();
    robot.add(base_robot);
    const brazo_robot = crear_brazo();
    robot.add(brazo_robot);
    robot.scale.set(0.035, 0.035, 0.035);
    scene.add(robot);

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

//Funció per crear el piso sobre el qual estarà tot ubicat
function crear_piso() {
    //Suelo
    const suelo = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 100, 100), material); //es 1000x1000 de tamany i gasta 100 meridians i 100 paral·lels 
    suelo.rotation.x = -Math.PI / 2;
    return suelo;
}

//Funcions que creen cadascuna de les parts del robot

//Funció per crear la base del robot (Que serà un cilindre)
function crear_base_robot () {
    const radi = 50, altura = 15;
    const base = new THREE.CylinderGeometry(radi, radi, altura, 50, 1);
    let base_mesh = new THREE.Mesh(base, material);
    base_mesh.rotation.y = Math.PI / 2;
    return base_mesh;
}

//Funció per crear el braç del robot
function crear_brazo () { 
    //El braç està composat de 3 elements:
    //  - Eix
    //  - Espàrrec
    //  - Ròtula
    //I té també a continuació l'avantbraç
    const brazo = new THREE.Object3D();
    const eix = crear_eix();
    brazo.add(eix);
    const esparrec = crear_esparrec();
    brazo.add(esparrec);
    const rotula = crear_rotula(120);
    brazo.add(rotula);  
    //tot i que realment l'avantbraç no és part del braç, el posem ací perquè penja d'ell en la jerarquia 
    const antebrazo = crear_antebrazo(80);
    antebrazo.position.y = 120;
    brazo.add(antebrazo);
    return brazo;
}  

function crear_eix () {
    const radi = 20, height = 18;
    const eix = new THREE.Mesh(new THREE.CylinderGeometry(radi, radi, height, 50, 1), material);
    eix.rotation.x = - Math.PI / 2;
    return eix
}

//Funció per crear l'espàrrec del braç
function crear_esparrec () {
    //crear un square box de 18x120x12
    const width = 18, height = 120, depth = 12;
    const esparrec = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    //pujar l'esparrec perquè coincidisca amb el centre del cilindre
    esparrec.position.y = height / 2;
    //i el girem perquè coincidisca amb els dos centres dels radis
    esparrec.rotation.y = Math.PI / 2;
    return esparrec;
}

//Funció per crear la rótula del braç
function crear_rotula (altura = 120) { 
    //crear una esfera de radi 20
    const radi = 20;
    const rotula = new THREE.Mesh(new THREE.SphereGeometry(radi), material);
    //fa falta que ho pugem per tal que la rótula estiga enganxada amb l'espàrrec
    rotula.position.y = altura;
    return rotula;
}

//Funció per crear l'avantbraç del robot	
function crear_antebrazo (altura = 80) {
    const ante_brazo = new THREE.Object3D();
    const disc = crear_disc();
    ante_brazo.add(disc);
    const nervis = crear_nervis();
    ante_brazo.add(nervis);
    const monyica = crear_monyica(altura);
    ante_brazo.add(monyica);
    const mano = crear_ma(altura + 10); //li sumem 10 perquè és la meitat de l'altura de la mà
    ante_brazo.add(mano);
    // ante_brazo.position.z = - 120;
    return ante_brazo;
}

//Funció per crear el disc de l'avantbraç
function crear_disc () {
    const radi = 22, altura = 6;
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(radi, radi, altura, 50, 1), material);
    return disc;
}

//Funció per crear els nervis de l'avantbraç
function crear_nervis () {
    const nervis = new THREE.Object3D();
    const width = 4, height = 80, depth = 4;
    const r = 22;
    const posicions = [
        -r / 2, 0,  -r / 2,
        r / 2, 0, -r / 2,
        r / 2, 0, r / 2,
        -r / 2, 0,  r / 2,
    ]
    for (let i = 0; i < 4; i += 1) {
        const nervi = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
        nervi.position.set(posicions[3 * i], posicions[3 * i + 1], posicions[3 * i + 2]);
        nervis.add(nervi);
    }
    //volem pujar els nervis perquè estiguen a la mateixa alçada que el disc
    nervis.position.y = height / 2;
    return nervis;
}

//Funció per crear la monyica del robot
function crear_monyica (altura = 80) {
    const height = 40, radi = 15;
    const monyica = new THREE.Mesh(new THREE.CylinderGeometry(radi, radi, height, 50, 1), material);
    //ho pugem perquè estiga al final del braç
    monyica.position.y = altura;
    monyica.rotation.z = Math.PI / 2;
    return monyica;
}

//Funció per crear la mà del robot
function crear_ma (altura = 80) {
    const mans = new THREE.Object3D();
    const ma_esquerra = crear_ganxo();
    const ma_dreta = crear_ganxo();
    //per tal de posar ambdues mans a la mateixa distància del centre posem una en 11 i l'altra en -11
    //i com el cilindre de la monyica té 40 d'altura, dons cadascu ha d'estar a 10 unitats del centre i del final 
    //però li posem 11 perquè coincidisca amb els nervis
    mans.add(ma_esquerra);
    mans.add(ma_dreta);
    mans.rotation.y = - Math.PI / 2;
    //volem que la mà estiga a la mateixa alçada que la monyica i coincidisca el centre (-10 perquè és la meitat de l'altura de la mà i 15 el radi de la monyica)
    mans.position.y = altura - 25;
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
    // const normals = new Float32Array(triangles.length);
    // for (let i = 0; i < triangles.length; i += 3) {
    //     //anem a cadascun dels triangles i agafem cadascun dels vértexs i traem la seua (x,y,z) amb vertices
    //     const v1 = new THREE.Vector3(vertices[3 * triangles[i]], vertices[3 * triangles[i] + 1], vertices[3 * triangles[i] + 2]);
    //     const v2 = new THREE.Vector3(vertices[3 * triangles[i + 1]], vertices[3 * triangles[i + 1] + 1], vertices[3 * triangles[i + 1] + 2]);
    //     const v3 = new THREE.Vector3(vertices[3 * triangles[i + 2]], vertices[3 * triangles[i + 2] + 1], vertices[3 * triangles[i + 2] + 2]);
    //     //calculem la normal de cada cara amb els 3 vértexs
    //     const normal = calcular_normal(v1, v2, v3);
    //     //i asssignem la normal d'eixa cara
    //     normals[i] = normal.x
    //     normals[i + 1] = normal.y
    //     normals[i + 2] = normal.z;
    // }

    
    //Definir la geometria
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(new THREE.BufferAttribute(triangles, 1));
    // geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geometry.computeVertexNormals();

    //Assignar la geometria
    const ganxo = new THREE.Mesh (geometry, new THREE.MeshBasicMaterial({color:'red', wireframe: true}));
    return ganxo;
}

//Funcions auxiliars
//Funció per calcular les normals -> No la gastem, en lloc d'això fem servir el computeVertexNormals() 
function calcular_normal (v1, v2, v3) {
    const vector1 = new THREE.Vector3();
    const vector2 = new THREE.Vector3();
    vector1.subVectors(v2, v1);
    vector2.subVectors(v3, v1);
    vector1.cross(vector2);
    vector1.normalize();
    return vector1;
}