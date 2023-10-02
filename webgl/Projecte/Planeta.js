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

  getMesh() {
    //si no està calculat el creem
    if (!this.mesh) {
      const geometria = new THREE.SphereGeometry(this.radi, 30, 30);
      let textura;
      //en cas que no li hagem passat cap ruta de textura, creem una de normal
      // if (this.rutaTextura)
      //   textura = new THREE.TextureLoader().load(this.rutaTextura);
      // else
      //   textura = new THREE.MeshNormalMaterial({
      //     flatShadig: true,
      //     wireframe: false,
      //   });
      const material = new THREE.MeshNormalMaterial({
        flatShading: true,
        wireframe: false,
      });
      this.mesh = new THREE.Mesh(geometria, material);
      this.mesh.position.set(this.posX, this.posY, this.posZ);
    }
    return this.mesh;
  }

  /**
   *
   * @returns {InfoPlaneta} Retorna un objecte amb la informació del planeta
   */
  getInfo() {
    return;
  }
}
