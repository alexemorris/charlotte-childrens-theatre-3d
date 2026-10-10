import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { ProductionSetBuilderContext, ProductionSetModule } from './types.ts';

export const matildaSet: ProductionSetModule = {
  spec: {
    id: 'matilda',
    title: 'Matilda The Musical',
    subtitle: 'Crunchem Hall Alphabet Portals & Library Towers',
    playwrightOrComposer: 'Dennis Kelly & Tim Minchin · Mainstage Musical',
    ageRecommendation: 'Ages 6+ · Mainstage Musical',
    description:
      'Monolithic scrambled alphabet-cube proscenium portals, sliding floor-to-ceiling library book towers, revolving classroom desk turntable at Center Stage, and flown school chalkboard.',
    scenicNotes:
      'Alphabet portal legs narrow the effective proscenium opening to 10.4m—verify lateral sightlines from Lower Balcony Left/Right Box Wings to the upstage library towers.',
    cycTopColor: 0x0d2838,
    cycBottomColor: 0x1a5668,
    stageWashColor: 0xd8f0ff,
    stageSpotColor: 0xffc864,
    apronWashColor: 0xffe0a8,
    elements: [
      {
        id: 'matilda-alphabet-portal',
        name: 'Scrambled Alphabet-Block Portal & Header',
        category: 'portal',
        battenLine: 2,
        defaultVisible: true,
        dimensionsLabel: '11.8m W × 6.8m H',
      },
      {
        id: 'matilda-library-towers',
        name: 'Mrs. Phelps Library Bookcase Towers (USL/USR)',
        category: 'backdrop',
        battenLine: 4,
        defaultVisible: true,
        dimensionsLabel: '2 × (3.2m W × 5.6m H)',
      },
      {
        id: 'matilda-desk-turntable',
        name: 'Revolving Classroom Turntable & Student Desks',
        category: 'wagon',
        defaultVisible: true,
        dimensionsLabel: '5.6m Diameter Turntable',
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

  build({ registerElement, textures }: ProductionSetBuilderContext): THREE.Group {
    const matildaGroup = new THREE.Group();
    matildaGroup.name = 'Prod_matilda';

    // 1. Scrambled Alphabet-Block Portal
    const alphabetPortal = new THREE.Group();
    alphabetPortal.position.set(0, 0, -2.2);
    matildaGroup.add(alphabetPortal);
    registerElement('matilda-alphabet-portal', alphabetPortal, 2);

    const cubePalette = [0xb82e38, 0x29689c, 0xd89b28, 0x3b7a52, 0x623b7a];
    for (const side of [-1, 1]) {
      for (let h = 0; h < 6; h++) {
        const cube = new THREE.Mesh(
          new RoundedBoxGeometry(1.05, 1.05, 0.65, 1, 0.04),
          new THREE.MeshStandardMaterial({
            color:
              cubePalette[(h + (side < 0 ? 0 : 2)) % cubePalette.length] ?? 0xb82e38,
            roughness: 0.5,
          })
        );
        cube.position.set(
          side * 5.15 + ((h % 2) - 0.5) * 0.18,
          0.55 + h * 1.06,
          ((h * 3) % 2) * 0.12
        );
        cube.rotation.y = ((h % 3) - 1) * 0.15;
        cube.castShadow = true;
        alphabetPortal.add(cube);
      }
    }

    // 2. Library Bookcase Towers
    const libraryTowers = new THREE.Group();
    libraryTowers.position.set(0, 0, -5.8);
    matildaGroup.add(libraryTowers);
    registerElement('matilda-library-towers', libraryTowers, 4);

    const bookMat = new THREE.MeshStandardMaterial({
      map: textures.libraryBooksTex,
      roughness: 0.68,
    });
    for (const side of [-1, 1]) {
      const tower = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 5.4, 0.75),
        bookMat
      );
      tower.position.set(side * 2.8, 2.7, 0);
      tower.rotation.y = side * -0.22;
      tower.castShadow = true;
      libraryTowers.add(tower);
    }

    // 3. Revolving Classroom Turntable & Desks
    const deskTurntable = new THREE.Group();
    deskTurntable.position.set(0, 0, -2.8);
    matildaGroup.add(deskTurntable);
    registerElement('matilda-desk-turntable', deskTurntable);

    const turntableDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(2.75, 2.85, 0.16, 32),
      new THREE.MeshStandardMaterial({ map: textures.yellowBrickTex, roughness: 0.6 })
    );
    turntableDisc.position.y = 0.08;
    turntableDisc.receiveShadow = true;
    deskTurntable.add(turntableDisc);

    const deskWoodMat = new THREE.MeshStandardMaterial({
      color: 0x7c4e2e,
      roughness: 0.6,
    });
    for (let d = 0; d < 6; d++) {
      const angle = (d / 6) * Math.PI * 2;
      const dx = Math.cos(angle) * 1.65;
      const dz = Math.sin(angle) * 1.65;
      const desk = new THREE.Mesh(
        new RoundedBoxGeometry(0.75, 0.68, 0.52, 1, 0.03),
        deskWoodMat
      );
      desk.position.set(dx, 0.5, dz);
      desk.rotation.y = -angle + Math.PI / 2;
      desk.castShadow = true;
      deskTurntable.add(desk);
    }

    return matildaGroup;
  },
};
