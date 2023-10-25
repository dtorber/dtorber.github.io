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
    rutaBumpTexture,
    rutaSpecTexture
  ) {
    this.nom = nom;
    this.radi = radi;
    this.velocitatRotacio = velocitatRotacio;
    this.posX = posX;
    this.posY = posY;
    this.posZ = posZ;
    this.rutaTextura = rutaTextura;
    this.rutaBumpTexture = rutaBumpTexture;
    this.rutaSpecTexture = rutaSpecTexture;
    this.mesh = null;
    this.llunes = [];
  }

  getMesh(textureLoader, outline) {
    //si no està calculat el creem
    if (!this.mesh) {
      const geometria = new THREE.SphereGeometry(this.radi, 30, 30);
      //en cas que no li hagem passat cap ruta de textura, creem una de normal
      let material;
      if (this.rutaTextura) {
        const textura = textureLoader.load(
          this.rutaTextura,
          function (texture) {
            if (texture) {
              outline.patternTexture = texture;
              texture.wrapS = THREE.RepeatWrapping;
              texture.wrapT = THREE.RepeatWrapping;
            }
          }
        );
        textura.wrapS = THREE.RepeatWrapping;
        textura.wrapT = THREE.RepeatWrapping;
        if (this.nom === "Sol") {
          material = new THREE.MeshStandardMaterial({
            emissive: 0xffd700,
            emissiveIntensity: 1,
            emissiveMap: textura,
            wireframe: false,
          });
        } else if (this.nom === "Lluna") {
          material = new THREE.MeshStandardMaterial({
            map: textura,
            wireframe: false,
            shininess: 0.5,
          });
        } else {
          let specMap, bumpMap;
          if (this.rutaSpecTexture)
            specMap = textureLoader.load(this.rutaSpecTexture);
          if (this.rutaBumpTexture)
            bumpMap = textureLoader.load(this.rutaBumpTexture);
          material = new THREE.MeshStandardMaterial({
            map: textura,
            wireframe: false,
            specularMap: specMap,
            shininess: 0.5,
            bumpMap: bumpMap,
            bumpScale: 0.5,
          });
        }
      } else {
        material = new THREE.MeshStandardMaterial({
          flatShadig: true,
          wireframe: false,
        });
      }
      this.mesh = new THREE.Mesh(geometria, material);
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;
      this.mesh.position.set(this.posX, this.posY, this.posZ);
      if (this.nom === "Sol") {
        this.mesh.rotateX(Math.PI);
        this.mesh.rotateZ(Math.PI / 2);
      }
    }
    return this.mesh;
  }

  afegirLluna(lluna) {
    this.llunes.push(lluna);
  }

  /**
   *
   * @returns {InfoPlaneta} Retorna un objecte amb la informació del planeta
   */
  getInfo() {
    return;
  }
}
