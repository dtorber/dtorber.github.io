import * as THREE from "../lib/three.module.js";
import {
  nom_planetes,
  distancies,
  radis,
  velocitatsRotacio,
  textures,
  radisOffset,
  colorsOrbites,
} from "./Dades.js";
import Planeta from "./Planeta.js";
export default class GrafEscena {
  constructor() {}

  //Construeix l'escena i retorna l'arrel
  static getEscena() {
    return new Promise((resolve, reject) => {
      //Crearem una arrel i d'ella penjara tot el que vaja en l'escena
      const root = new THREE.Object3D();
      const loader = new THREE.TextureLoader();
      for (let nom_planeta of nom_planetes) {
        let radi = radis[nom_planeta];
        const velocitatRotacio = velocitatsRotacio[nom_planeta];
        let posX = 0;
        //com volem col·locar-los tots en l'origen i desplaçats la seua distància només cal fer això
        if (nom_planeta != "Sol") posX = distancies[nom_planeta] * 50 + 70;
        posX += radisOffset[nom_planeta];
        const planeta = new Planeta(
          nom_planeta,
          radi,
          velocitatRotacio,
          posX,
          0,
          0,
          textures[nom_planeta]
        );
        const objecte = new THREE.Object3D();
        objecte.add(planeta.getMesh(loader));
        objecte.name = nom_planeta;
        //Ací li haurem d'afegir algo de text i l'òrbita
        const curve = new THREE.EllipseCurve(
          0,
          0, // center x, y
          posX,
          posX, // xRadius, yRadius
          0,
          2 * Math.PI // startAngle, endAngle
        );
        const points = curve.getPoints(200);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color: colorsOrbites[nom_planeta],
        });
        const ellipse = new THREE.Line(geometry, material);
        ellipse.rotateX(Math.PI / 2); //per a que estiga en el pla XZ i rote al voltant de l'eix Y
        objecte.add(ellipse);
        root.add(objecte);
      }
      resolve(root);
    });
  }
}