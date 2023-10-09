import * as THREE from "../lib/three.module.js";

/**
 * @class Planeta
 * Conté tota la informació necessària per representar un planeta
 */
export default class Planeta {
  constructor(
    nom,
    radi,
    velocitatRotacio,
    posX = 0,
    posY = 0,
    posZ = 0,
    rutaTextura,
    infoPlaneta
  ) {
    this.nom = nom;
    this.radi = radi;
    this.velocitatRotacio = velocitatRotacio;
    this.posX = posX;
    this.posY = posY;
    this.posZ = posZ;
    this.rutaTextura = rutaTextura;
    this.mesh = null;
    this.info = infoPlaneta;
  }

  getMesh(loader) {
    //si no està calculat el creem
    if (!this.mesh) {
      const geometria = new THREE.SphereGeometry(this.radi, 30, 30);
      //en cas que no li hagem passat cap ruta de textura, creem una de normal
      let material;
      if (this.rutaTextura) {
        const textura = loader.load(this.rutaTextura);
        textura.wrapS = THREE.RepeatWrapping;
        textura.wrapT = THREE.RepeatWrapping;
        material = new THREE.MeshBasicMaterial({
          map: textura,
          wireframe: false,
        });
      } else {
        material = new THREE.MeshNormalMaterial({
          flatShadig: true,
          wireframe: false,
        });
      }
      this.mesh = new THREE.Mesh(geometria, material);
      this.mesh.position.set(this.posX, this.posY, this.posZ);
      if (this.nom === "Sol") {
        this.mesh.rotateX(Math.PI);
        this.mesh.rotateZ(Math.PI / 2);
      }
    }
    return this.mesh;
  }

  // getMesh(loader) {
  //   return new Promise((resolve, reject) => {
  //     //si no està calculat el creem
  //     if (!this.mesh) {
  //       const geometria = new THREE.SphereGeometry(this.radi, 30, 30);
  //       //en cas que no li hagem passat cap ruta de textura, creem una de normal
  //       loader.load(this.rutaTextura, function (textura) {
  //         textura.wrapS = THREE.RepeatWrapping;
  //         textura.wrapT = THREE.RepeatWrapping;
  //         const material = new THREE.MeshBasicMaterial({
  //           map: textura,
  //           wireframe: false,
  //         });
  //         this.mesh = new THREE.Mesh(geometria, material);
  //         this.mesh.position.set(this.posX, this.posY, this.posZ);
  //         if (this.nom === "Sol") {
  //           this.mesh.rotateX(Math.PI);
  //           this.mesh.rotateZ(Math.PI / 2);
  //         }
  //         resolve(this.mesh);
  //       });
  //     } else resolve(this.mesh);
  //   });
  // }

  /**
   *
   * @returns {InfoPlaneta} Retorna un objecte amb la informació del planeta
   */
  getInfo() {
    return;
  }
}
