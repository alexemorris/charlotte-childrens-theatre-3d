import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { createHumanScaleFigure } from './shared-scenic-helpers.ts';
import type { ProductionSetBuilderContext, ProductionSetModule } from './types.ts';

export const maryPoppinsSet: ProductionSetModule = {
  spec: {
    id: 'mary-poppins',
    title: 'Mary Poppins',
    subtitle: '17 Cherry Tree Lane, London Rooftops & High-Fly Rig',
    playwrightOrComposer: 'Sherman Brothers / Julian Fellowes · Musical Spectacular',
    ageRecommendation: 'Ages 6+ · Broadway Musical',
    description:
      'Showcases the McColl Family Theatre’s single-purchase fly tower and over-stage actor flying track: Victorian chimney rooftops, telescoping Banks family house, and Mary Poppins flying at +4.9m above the stage.',
    scenicNotes:
      'Critical vertical sightline test: check Rows K–P under the Lower Balcony overhang and Rows CC–DD under the Upper Balcony overhang as Mary Poppins ascends to +4.9m.',
    cycTopColor: 0x101c3b,
    cycBottomColor: 0x3b4d7a,
    stageWashColor: 0xdce8ff,
    stageSpotColor: 0xffdf9e,
    apronWashColor: 0xffd6a0,
    elements: [
      {
        id: 'poppins-fly-performer',
        name: 'Flying Mary Poppins Figure on Overhead Track (+4.9m)',
        category: 'fly-rig',
        battenLine: 2,
        defaultVisible: true,
        dimensionsLabel: 'Trim Height +4.9m above Deck',
      },
      {
        id: 'poppins-cherry-tree-house',
        name: '17 Cherry Tree Lane 2-Story House Unit',
        category: 'wagon',
        defaultVisible: true,
        dimensionsLabel: '5.8m W × 5.4m H',
      },
      {
        id: 'poppins-chimney-rooftops',
        name: 'Victorian London Chimney Sweeps Rooftop Wings',
        category: 'portal',
        battenLine: 3,
        defaultVisible: true,
        dimensionsLabel: 'Left & Right Stepped Chimney Towers',
      },
      {
        id: 'black-velour-masking',
        name: 'Black Velour Legs & Borders',
        category: 'masking',
        battenLine: 1,
        defaultVisible: true,
        dimensionsLabel: '3 Pairs Soft Legs',
      },
    ],
  },

  build({ registerElement }: ProductionSetBuilderContext): THREE.Group {
    const poppinsGroup = new THREE.Group();
    poppinsGroup.name = 'Prod_mary-poppins';

    // 1. Flying Mary Poppins Silhouette at y = +4.85m above Center-Downstage
    const poppinsFlyGroup = new THREE.Group();
    poppinsFlyGroup.position.set(0.4, 4.85, -1.55);
    poppinsGroup.add(poppinsFlyGroup);
    registerElement('poppins-fly-performer', poppinsFlyGroup, 2);

    const poppinsFig = createHumanScaleFigure(1.72, 0x1d2b4c, 0.12, 0x1d2b4c);
    poppinsFig.rotation.z = 0.12;
    poppinsFlyGroup.add(poppinsFig);

    const umbrella = new THREE.Mesh(
      new THREE.ConeGeometry(0.68, 0.32, 16, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0x181a22,
        emissive: 0x385288,
        emissiveIntensity: 0.35,
        side: THREE.DoubleSide,
      })
    );
    umbrella.position.set(0.35, 2.15, 0);
    umbrella.rotation.z = -0.18;
    poppinsFlyGroup.add(umbrella);

    // 2. 17 Cherry Tree Lane 2-Story Victorian House Unit
    const cherryHouseGroup = new THREE.Group();
    cherryHouseGroup.position.set(0, 0, -4.9);
    poppinsGroup.add(cherryHouseGroup);
    registerElement('poppins-cherry-tree-house', cherryHouseGroup);

    const brickFacade = new THREE.Mesh(
      new RoundedBoxGeometry(5.6, 5.2, 1.4, 1, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x6e352c, roughness: 0.76 })
    );
    brickFacade.position.y = 2.6;
    brickFacade.castShadow = true;
    cherryHouseGroup.add(brickFacade);

    const warmWinMat = new THREE.MeshStandardMaterial({
      color: 0xfff0b8,
      emissive: 0xffbf52,
      emissiveIntensity: 1.35,
      toneMapped: false,
    });
    for (const wy of [1.45, 3.65]) {
      for (const wx of [-1.55, 0, 1.55]) {
        const win = new THREE.Mesh(
          new THREE.BoxGeometry(0.85, 1.25, 0.08),
          warmWinMat
        );
        win.position.set(wx, wy, 0.72);
        cherryHouseGroup.add(win);
      }
    }

    // 3. Victorian London Chimney Rooftop Wings
    const chimneysGroup = new THREE.Group();
    chimneysGroup.position.set(0, 0, -3.1);
    poppinsGroup.add(chimneysGroup);
    registerElement('poppins-chimney-rooftops', chimneysGroup, 3);

    const slateMat = new THREE.MeshStandardMaterial({ color: 0x2c323d, roughness: 0.7 });
    const terracottaMat = new THREE.MeshStandardMaterial({
      color: 0x9e4832,
      roughness: 0.65,
    });
    for (const side of [-1, 1]) {
      const roofTower = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 3.8, 1.4),
        slateMat
      );
      roofTower.position.set(side * 4.5, 1.9, 0);
      roofTower.castShadow = true;
      chimneysGroup.add(roofTower);

      for (const cx of [-0.55, 0, 0.55]) {
        const pot = new THREE.Mesh(
          new THREE.CylinderGeometry(0.14, 0.18, 0.65, 12),
          terracottaMat
        );
        pot.position.set(side * 4.5 + cx, 4.1, 0);
        chimneysGroup.add(pot);
      }
    }

    return poppinsGroup;
  },
};
