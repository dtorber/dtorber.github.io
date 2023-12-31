import * as THREE from "../lib/three.module.js";
import {
  nom_planetes,
  distancies,
  radis,
  velocitatsRotacio,
  textures,
  radisOffset,
  colorsOrbites,
  traduccio_ca_es,
} from "./Dades.js";
import { TextGeometry } from "../lib/examples/jsm/geometries/TextGeometry.js";
import { FontLoader } from "../lib/examples/jsm/loaders/FontLoader.js";

import Planeta from "./Planeta.js";
export default class GrafEscena {
  constructor() {}

  //Construeix l'escena i retorna l'arrel
  static getEscena(outline) {
    return new Promise((resolve, reject) => {
      //Crearem una arrel i d'ella penjara tot el que vaja en l'escena
      const root = new THREE.Object3D();
      const loader = new THREE.TextureLoader();
      const planetes = {};
      for (let nom_planeta of nom_planetes) {
        let posX = 0;
        //com volem col·locar-los tots en l'origen i desplaçats la seua distància només cal fer això
        if (nom_planeta != "Sol") posX = distancies[nom_planeta] * 50 + 70;
        posX += radisOffset[nom_planeta];
        const planeta = new Planeta(
          nom_planeta,
          radis[nom_planeta],
          velocitatsRotacio[nom_planeta],
          posX,
          0,
          0,
          textures[nom_planeta],
          textures[nom_planeta + "Bump"],
          textures[nom_planeta + "Spec"]
        );
        const objecte = new THREE.Object3D();
        const meshPlaneta = planeta.getMesh(loader, outline);
        objecte.add(meshPlaneta);
        if (nom_planeta !== "Sol") {
          objecte.castShadow = true;
          objecte.receiveShadow = true;
          meshPlaneta.castShadow = true;
          meshPlaneta.receiveShadow = true;
        }
        objecte.name = nom_planeta;
        if (nom_planeta === "Terra") {
          const lluna = new Planeta(
            "Lluna",
            radis["Lluna"],
            0,
            posX + 20,
            distancies["Lluna"],
            0,
            textures["Lluna"]
          );
          planeta.afegirLluna(lluna);
          const objecte_lluna = new THREE.Object3D();
          objecte_lluna.castShadow = true;
          objecte_lluna.receiveShadow = true;
          const meshLluna = lluna.getMesh(loader, outline);
          meshLluna.castShadow = true;
          meshLluna.receiveShadow = true;
          objecte_lluna.add(meshLluna);
          objecte_lluna.name = "Lluna";
          objecte.add(objecte_lluna);
        }
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
        const ellipse = new THREE.Object3D();
        ellipse.name = "orbita_" + nom_planeta;
        ellipse.add(new THREE.Line(geometry, material));
        ellipse.rotateX(Math.PI / 2); //per a que estiga en el pla XZ i rote al voltant de l'eix Y
        // root.add(ellipse); //per si apliquem una traslació
        objecte.add(ellipse);

        //creem una textura per a text que penge de cada planeta
        const fontLoader = new FontLoader();

        fontLoader.load("../fonts/OpenSans.json", function (font) {
          const geometriaText = new TextGeometry(traduccio_ca_es[nom_planeta], {
            font: font,
            size: 10,
            height: 0.1,
          });
          const malla = new THREE.Mesh(
            geometriaText,
            new THREE.MeshBasicMaterial()
          );
          malla.name = "text_" + nom_planeta;
          malla.position.x = posX;
          malla.position.y = radis[nom_planeta] + 10;
          malla.setRotationFromAxisAngle(
            new THREE.Vector3(0, 1, 0),
            -Math.PI / 2
          );
          objecte.add(malla);
        });
        objecte.receiveShadow = true;
        objecte.castShadow = true;
        root.add(objecte);
        planetes[nom_planeta] = planeta;
      }
      resolve({
        planetes: planetes,
        escena: root,
      });
    });
  }
}
