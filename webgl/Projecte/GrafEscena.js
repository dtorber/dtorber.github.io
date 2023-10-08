import * as THREE from "../lib/three.module.js";
import { nom_planetes, distancies, radis, velocitatsRotacio } from "./Dades.js";
import Planeta from "./Planeta.js";
export default class GrafEscena {
  constructor() {}

  //Construeix l'escena i retorna l'arrel
  static getEscena() {
    //Crearem una arrel i d'ella penjara tot el que vaja en l'escena
    const root = new THREE.Object3D();
    for (let nom_planeta of nom_planetes) {
      const radi = radis[nom_planeta];
      const velocitatRotacio = velocitatsRotacio[nom_planeta];
      const posX = distancies[nom_planeta]; //com volem col·locar-los tots en l'origen i desplaçats la seua distància només cal fer això
      const planeta = new Planeta(
        nom_planeta,
        radi,
        velocitatRotacio,
        posX * 10,
        0,
        0
      );
      const objecte = new THREE.Object3D();
      objecte.add(planeta.getMesh());
      objecte.name = nom_planeta;
      root.add(objecte);
    }
    return root;
  }
}
