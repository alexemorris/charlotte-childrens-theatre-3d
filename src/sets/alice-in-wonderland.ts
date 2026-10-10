import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { createHumanScaleFigure } from './shared-scenic-helpers.ts';
import type { ProductionSetBuilderContext, ProductionSetModule } from './types.ts';

export const aliceInWonderlandSet: ProductionSetModule = {
  spec: {
    id: 'alice-in-wonderland',
    title: 'Alice in Wonderland',
    subtitle: "Mad Hatter's Tea Party (Reference Photo Set)",
    playwrightOrComposer: 'Adapted from Lewis Carroll · McColl Mainstage',
    ageRecommendation: 'Ages 5+ · Family Mainstage',
    description:
      'Recreated directly from the McColl Family Theatre reference photograph: forced-perspective gothic stained-glass window with crimson velvet swag curtain, radiating geometric painted stage floor, and the Mad Hatter banquet table.',
    scenicNotes:
      'Check House Right Wing (Rows A–D) sightlines against the Stage-Left crimson velvet swag curtain, and verify Row M–P under-balcony vertical clearance to the 6.2m window peak.',
    cycTopColor: 0x160d2e,
    cycBottomColor: 0x3b1846,
    stageWashColor: 0xffe4b8,
    stageSpotColor: 0xffc670,
    apronWashColor: 0xffd296,
    elements: [
      {
        id: 'alice-window-backdrop',
        name: 'Forced-Perspective Gothic Window & Red Drape',
        category: 'backdrop',
        battenLine: 3,
        defaultVisible: true,
        dimensionsLabel: '6.8m W × 6.3m H (Raked 9°)',
      },
      {
        id: 'alice-tea-table',
        name: "Mad Hatter's Banquet Table & Tea Service",
        category: 'furniture',
        defaultVisible: true,
        dimensionsLabel: '2.9m W × 0.92m D × 0.82m H',
      },
      {
        id: 'alice-characters',
        name: 'Cast Blocking (Alice, Hatter, Hare, Rabbit)',
        category: 'blocking',
        defaultVisible: true,
        dimensionsLabel: '5 Performers (Child + Adult Scale)',
      },
      {
        id: 'alice-ray-floor',
        name: 'Painted Radiating Ray Floor Cloth',
        category: 'wagon',
        defaultVisible: true,
        dimensionsLabel: '11.6m × 8.4m Deck Cloth',
      },
      {
        id: 'black-velour-masking',
        name: 'Black Velour Legs & Borders (Lines 1–4)',
        category: 'masking',
        battenLine: 1,
        defaultVisible: true,
        dimensionsLabel: '3 Pairs Soft Legs + 3 Borders',
      },
    ],
  },

  build({ registerElement, textures }: ProductionSetBuilderContext): THREE.Group {
    const aliceGroup = new THREE.Group();
    aliceGroup.name = 'Prod_alice-in-wonderland';

    // 1. Forced-Perspective Gothic Stained-Glass Window & Red Velvet Swag Curtain
    const aliceWindowGroup = new THREE.Group();
    aliceWindowGroup.position.set(0.35, 0, -4.65);
    aliceWindowGroup.rotation.y = -0.18; // Angled just like in photo da3a8cf7.jpg
    aliceGroup.add(aliceWindowGroup);
    registerElement('alice-window-backdrop', aliceWindowGroup, 3);

    const purpleFrameMat = new THREE.MeshStandardMaterial({
      color: 0x483566,
      roughness: 0.55,
      metalness: 0.1,
    });

    const winFrameBack = new THREE.Mesh(
      new THREE.BoxGeometry(6.6, 6.1, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x1b132b, roughness: 0.8 })
    );
    winFrameBack.position.set(0, 3.35, -0.08);
    winFrameBack.rotation.z = -0.09; // Forced-perspective tilt!
    aliceWindowGroup.add(winFrameBack);

    const paneColors = [
      0x38245c, 0x6e3b6e, 0xb87638, 0x7a2442, 0x2d244c,
      0x292b52, 0x5c2c5d, 0x964c4c, 0x6b2848, 0x3b2c54,
      0x322658, 0x4e2d62, 0x7c3e58, 0x8e4848, 0x48385c,
      0x443668, 0x64486c, 0x946c74, 0xb89a9e, 0xd8c8ca,
    ];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 5; c++) {
        const colHex = paneColors[r * 5 + c] ?? 0x483566;
        const paneMat = new THREE.MeshStandardMaterial({
          color: colHex,
          emissive: colHex,
          emissiveIntensity: 0.52,
          roughness: 0.3,
        });
        const pane = new THREE.Mesh(new THREE.BoxGeometry(1.12, 1.24, 0.06), paneMat);
        const lx = (c - 2) * 1.22;
        const ly = 5.15 - r * 1.34 + lx * -0.09;
        pane.position.set(lx, ly, 0.02);
        pane.rotation.z = -0.09;
        aliceWindowGroup.add(pane);
      }
    }

    for (const side of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.32, 6.2, 0.24), purpleFrameMat);
      post.position.set(side * 3.25, 3.35 + side * -0.28, 0.05);
      aliceWindowGroup.add(post);
    }
    const topHeaderBeam = new THREE.Mesh(
      new THREE.BoxGeometry(6.8, 0.42, 0.26),
      purpleFrameMat
    );
    topHeaderBeam.position.set(0, 6.2, 0.06);
    topHeaderBeam.rotation.z = -0.09;
    aliceWindowGroup.add(topHeaderBeam);

    // Gathered Crimson Velvet Swag Curtain on the right side of the window (photo da3a8cf7.jpg)
    const swagMat = new THREE.MeshStandardMaterial({
      map: textures.redVelourTex,
      roughness: 0.72,
      metalness: 0.06,
    });
    const swagTop = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.35, 0.28), swagMat);
    swagTop.position.set(1.65, 5.15, 0.18);
    swagTop.rotation.z = -0.52;
    aliceWindowGroup.add(swagTop);

    const swagColumn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.42, 5.4, 16),
      swagMat
    );
    swagColumn.position.set(2.95, 2.7, 0.22);
    swagColumn.castShadow = true;
    aliceWindowGroup.add(swagColumn);

    const tassel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.11, 0.38, 12),
      new THREE.MeshStandardMaterial({ color: 0xf2c138, roughness: 0.3, metalness: 0.6 })
    );
    tassel.position.set(2.85, 2.95, 0.48);
    aliceWindowGroup.add(tassel);

    // 2. Mad Hatter's Tea Party Banquet Table (Center Stage in photo da3a8cf7.jpg)
    const teaTableGroup = new THREE.Group();
    teaTableGroup.position.set(-0.25, 0, -2.05);
    teaTableGroup.rotation.y = -0.15;
    aliceGroup.add(teaTableGroup);
    registerElement('alice-tea-table', teaTableGroup);

    const whiteSkirt = new THREE.Mesh(
      new RoundedBoxGeometry(2.85, 0.74, 0.92, 1, 0.03),
      new THREE.MeshStandardMaterial({ color: 0xf4f2ec, roughness: 0.75 })
    );
    whiteSkirt.position.y = 0.37;
    whiteSkirt.castShadow = true;
    whiteSkirt.receiveShadow = true;
    teaTableGroup.add(whiteSkirt);

    const redRunner = new THREE.Mesh(
      new RoundedBoxGeometry(2.96, 0.34, 1.0, 1, 0.04),
      swagMat
    );
    redRunner.position.y = 0.68;
    redRunner.castShadow = true;
    teaTableGroup.add(redRunner);

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf5c438,
      roughness: 0.3,
      metalness: 0.7,
    });
    const porcelainColors = [0xffd84a, 0x5ce0d8, 0xff7eb6, 0xffffff, 0xa682ff];
    for (let i = 0; i < 9; i++) {
      const tx = (i - 4) * 0.28;
      const tz = ((i * 17) % 3 - 1) * 0.14;
      const cupStackH = 0.14 + (i % 3) * 0.08;
      const cup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.06, cupStackH, 12),
        new THREE.MeshStandardMaterial({
          color: porcelainColors[i % porcelainColors.length] ?? 0xffffff,
          roughness: 0.25,
        })
      );
      cup.position.set(tx, 0.85 + cupStackH / 2, tz);
      cup.rotation.z = ((i % 2) - 0.5) * 0.18;
      teaTableGroup.add(cup);
    }
    const candelabra = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.12, 0.44, 12),
      goldMat
    );
    candelabra.position.set(0.1, 1.05, 0);
    teaTableGroup.add(candelabra);

    // 3. Cast Blocking Figures around the Table (Alice, March Hare, Dormouse, White Rabbit, Mad Hatter)
    const aliceCastGroup = new THREE.Group();
    aliceCastGroup.position.copy(teaTableGroup.position);
    aliceCastGroup.rotation.copy(teaTableGroup.rotation);
    aliceGroup.add(aliceCastGroup);
    registerElement('alice-characters', aliceCastGroup);

    const aliceFig = createHumanScaleFigure(1.36, 0x62b4f5);
    aliceFig.position.set(-1.52, 0, 0.05);
    aliceFig.rotation.y = 0.45;
    aliceCastGroup.add(aliceFig);

    const hareFig = createHumanScaleFigure(1.68, 0x9c4252, 0, 0, true);
    hareFig.position.set(-0.78, 0, -0.58);
    aliceCastGroup.add(hareFig);

    const dormouseFig = createHumanScaleFigure(1.42, 0xd85c2a, 0.18, 0xc43c24);
    dormouseFig.position.set(-0.12, 0, -0.56);
    aliceCastGroup.add(dormouseFig);

    const rabbitFig = createHumanScaleFigure(1.62, 0xded8ce, 0, 0, true);
    rabbitFig.position.set(0.52, 0, -0.58);
    aliceCastGroup.add(rabbitFig);

    const hatterFig = createHumanScaleFigure(1.78, 0xd88a28, 0.46, 0xe8b928);
    hatterFig.position.set(1.28, 0, -0.35);
    hatterFig.rotation.y = -0.35;
    aliceCastGroup.add(hatterFig);

    return aliceGroup;
  },
};
