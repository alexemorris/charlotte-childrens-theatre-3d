import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {
  createProsceniumCheckerTexture,
  createQuiltedDiamondTexture,
} from '../engine/procedural-textures.ts';
import { PROSCENIUM_HEIGHT_M, PROSCENIUM_WIDTH_M } from '../theatre/seating-layout.ts';
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
      'Recreated directly from the McColl Family Theatre reference photograph: postmodern geometric proscenium frieze with racing-checker fan and quilted diamond relief, forced-perspective gothic stained-glass window with crimson velvet swag curtain, radiating geometric painted stage floor, and the Mad Hatter banquet table.',
    scenicNotes:
      'Check House Right Wing (Rows A–D) sightlines against the Stage-Left crimson velvet swag curtain, and verify Row M–P under-balcony vertical clearance to the 6.2m window peak and upper proscenium frieze.',
    cycTopColor: 0x160d2e,
    cycBottomColor: 0x3b1846,
    stageWashColor: 0xffe4b8,
    stageSpotColor: 0xffc670,
    apronWashColor: 0xffd296,
    elements: [
      {
        id: 'alice-proscenium-frieze',
        name: 'Postmodern Proscenium Frieze & Checker Relief',
        category: 'portal',
        defaultVisible: true,
        dimensionsLabel: '14.2m W × 2.4m H Stepped Relief + Right Column',
      },
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
    scenes: [
      {
        id: 'alice-scene-1-rabbit-hole',
        sceneNumber: '1A',
        title: 'Down the Rabbit Hole (Hall of Doors)',
        actLabel: 'Scene 1 · Prologue',
        synopsis:
          'Alice tumbles onto the radiating geometric ray floor cloth framed by the postmodern checkerboard proscenium frieze as the gothic stained-glass window descends from the fly tower.',
        visibleElementIds: [
          'alice-proscenium-frieze',
          'alice-window-backdrop',
          'alice-characters',
          'alice-ray-floor',
          'black-velour-masking',
        ],
        battenTrimHeightsM: { 1: 0.0, 2: 0.0, 3: 1.8, 4: 0.0, 5: 0.0 },
        grandDrapeOpenFraction: 1.0,
        stageWashColor: 0xc8b8ff,
        stageSpotColor: 0xe6d4ff,
        cycTopColor: 0x0d0822,
        cycBottomColor: 0x2a1448,
        houseLevel: 0.18,
        modelPhotoUrl: 'reference/stage_proscenium_alice.jpg',
      },
      {
        id: 'alice-scene-2-tea-party',
        sceneNumber: '1B',
        title: "The Mad Hatter's Tea Party",
        actLabel: 'Scene 2 · Mainstage Reference Photo',
        synopsis:
          'Full reference photo configuration: Postmodern proscenium frieze with racing-checker fan, forced-perspective gothic stained-glass window with crimson velvet swag curtain in-trim, radiating geometric stage floor, and the Mad Hatter banquet table at Center Stage.',
        visibleElementIds: [
          'alice-proscenium-frieze',
          'alice-window-backdrop',
          'alice-tea-table',
          'alice-characters',
          'alice-ray-floor',
          'black-velour-masking',
        ],
        battenTrimHeightsM: { 1: 0.0, 2: 0.0, 3: 0.0, 4: 0.0, 5: 0.0 },
        grandDrapeOpenFraction: 1.0,
        stageWashColor: 0xffe4b8,
        stageSpotColor: 0xffc670,
        cycTopColor: 0x160d2e,
        cycBottomColor: 0x3b1846,
        houseLevel: 0.24,
        modelPhotoUrl: 'reference/stage_proscenium_alice.jpg',
      },
      {
        id: 'alice-scene-3-royal-trial',
        sceneNumber: '1C',
        title: "Queen of Hearts' Royal Courtroom",
        actLabel: 'Scene 3 · Finale Trial',
        synopsis:
          'Dramatic crimson courtroom wash illuminates the gothic window, proscenium frieze, and radiating floor rays as Alice confronts the Queen of Hearts.',
        visibleElementIds: [
          'alice-proscenium-frieze',
          'alice-window-backdrop',
          'alice-characters',
          'alice-ray-floor',
          'black-velour-masking',
        ],
        battenTrimHeightsM: { 1: 0.0, 2: 0.0, 3: 0.0, 4: 0.0, 5: 0.0 },
        grandDrapeOpenFraction: 1.0,
        stageWashColor: 0xff98a8,
        stageSpotColor: 0xffe0a8,
        cycTopColor: 0x2e0814,
        cycBottomColor: 0x781428,
        houseLevel: 0.15,
        modelPhotoUrl: 'reference/stage_proscenium_alice.jpg',
      },
    ],
  },

  build({ registerElement, textures }: ProductionSetBuilderContext): THREE.Group {
    const aliceGroup = new THREE.Group();
    aliceGroup.name = 'Prod_alice-in-wonderland';

    // 0. Postmodern Geometric Proscenium Header Frieze & Right Column Relief (from photo da3a8cf7.jpg)
    //    Built with stepped, non-coplanar Z depths so overlapping rotated blocks never z-fight or dither.
    const prosceniumFriezeRoot = new THREE.Group();
    prosceniumFriezeRoot.name = 'AliceProsceniumFriezeAndColumn';
    aliceGroup.add(prosceniumFriezeRoot);
    registerElement('alice-proscenium-frieze', prosceniumFriezeRoot);

    const halfProscW = PROSCENIUM_WIDTH_M / 2; // 6.3m
    const proscH = PROSCENIUM_HEIGHT_M; // 7.2m

    const checkerTex = createProsceniumCheckerTexture();
    const quiltedTex = createQuiltedDiamondTexture();

    const friezeGroup = new THREE.Group();
    // Placed at z = 0.42m so all back faces sit cleanly in front of the proscenium wall (z = 0.325m)
    friezeGroup.position.set(0, proscH + 0.38, 0.42);
    prosceniumFriezeRoot.add(friezeGroup);

    const darkEdgeMat = new THREE.MeshStandardMaterial({
      color: 0x1a1c22,
      roughness: 0.65,
      metalness: 0.06,
    });
    const checkerFaceMat = new THREE.MeshStandardMaterial({
      map: checkerTex,
      roughness: 0.46,
      metalness: 0.06,
    });
    // Apply checkerboard pattern strictly to front (+Z) face; solid dark returns on thin side edges
    const checkerBoxMaterials: THREE.Material[] = [
      darkEdgeMat,
      darkEdgeMat,
      darkEdgeMat,
      darkEdgeMat,
      checkerFaceMat,
      darkEdgeMat,
    ];

    // Left Black-and-White Checkerboard Fan Relief (stepped at distinct Z depths: front faces at +0.26m and +0.15m)
    const checkerTop = new THREE.Mesh(
      new THREE.BoxGeometry(2.15, 1.38, 0.22),
      checkerBoxMaterials
    );
    checkerTop.position.set(-5.35, 0.32, 0.15); // z ∈ [0.04, 0.26]
    checkerTop.rotation.z = 0.26;
    checkerTop.castShadow = true;
    friezeGroup.add(checkerTop);

    const checkerBottom = new THREE.Mesh(
      new THREE.BoxGeometry(1.78, 1.26, 0.14),
      checkerBoxMaterials
    );
    checkerBottom.position.set(-5.08, -0.86, 0.08); // z ∈ [0.01, 0.15] — front & back strictly disjoint from checkerTop
    checkerBottom.rotation.z = -0.32;
    checkerBottom.castShadow = true;
    friezeGroup.add(checkerBottom);

    // Center Angled Color-Block Ribbon — each block has a unique Z depth & thickness so no two planes are ever coplanar
    const colorBlocks: ReadonlyArray<{
      readonly x: number;
      readonly y: number;
      readonly w: number;
      readonly h: number;
      readonly depth: number;
      readonly zCenter: number;
      readonly rotZ: number;
      readonly color: number;
    }> = [
      { x: -3.55, y: 0.15, w: 1.48, h: 0.88, depth: 0.16, zCenter: 0.09, rotZ: 0.12, color: 0xe6b81e }, // Bright yellow (front z = 0.17)
      { x: -2.15, y: 0.28, w: 1.42, h: 0.92, depth: 0.20, zCenter: 0.12, rotZ: 0.14, color: 0x24262e }, // Charcoal (front z = 0.22)
      { x: -0.85, y: 0.32, w: 1.38, h: 0.95, depth: 0.24, zCenter: 0.15, rotZ: 0.12, color: 0x7c1f28 }, // Deep burgundy (front z = 0.27)
      { x: 0.45, y: 0.25, w: 1.48, h: 0.85, depth: 0.18, zCenter: 0.11, rotZ: 0.10, color: 0x1c1e24 }, // Black-slate (front z = 0.20)
      { x: 1.65, y: 0.12, w: 1.44, h: 0.65, depth: 0.14, zCenter: 0.08, rotZ: 0.11, color: 0xe8bc22 }, // Yellow bar (front z = 0.15)
      { x: 2.35, y: 0.68, w: 1.68, h: 0.58, depth: 0.22, zCenter: 0.14, rotZ: 0.09, color: 0x8f242e }, // Upper crimson accent (front z = 0.25)
    ];

    for (const blk of colorBlocks) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(blk.w, blk.h, blk.depth),
        new THREE.MeshStandardMaterial({
          color: blk.color,
          roughness: 0.48,
          metalness: 0.08,
        })
      );
      mesh.position.set(blk.x, blk.y, blk.zCenter);
      mesh.rotation.z = blk.rotZ;
      mesh.castShadow = true;
      friezeGroup.add(mesh);
    }

    // Right White Quilted Diamond Square (front z = 0.30) & Slate Wing (front z = 0.13)
    const quiltedFaceMat = new THREE.MeshStandardMaterial({
      map: quiltedTex,
      roughness: 0.5,
      metalness: 0.06,
    });
    const creamEdgeMat = new THREE.MeshStandardMaterial({
      color: 0xd8d2c6,
      roughness: 0.56,
    });
    const quiltedSquare = new THREE.Mesh(
      new THREE.BoxGeometry(1.62, 1.52, 0.24),
      [
        creamEdgeMat,
        creamEdgeMat,
        creamEdgeMat,
        creamEdgeMat,
        quiltedFaceMat,
        creamEdgeMat,
      ]
    );
    quiltedSquare.position.set(3.85, 0.38, 0.18); // z ∈ [0.06, 0.30]
    quiltedSquare.rotation.z = 0.08;
    quiltedSquare.castShadow = true;
    friezeGroup.add(quiltedSquare);

    const rightGreyWing = new THREE.Mesh(
      new THREE.BoxGeometry(2.28, 1.36, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x8d8c88, roughness: 0.56 })
    );
    rightGreyWing.position.set(5.65, 0.48, 0.07); // z ∈ [0.01, 0.13]
    rightGreyWing.rotation.z = -0.14;
    rightGreyWing.castShadow = true;
    friezeGroup.add(rightGreyWing);

    // Right Vertical Proscenium Column Alternating Red & White Blocks (cleanly proud of right pier at z = 0.44m)
    for (let row = 0; row < 6; row++) {
      const isRed = row % 2 === 0;
      const colBlock = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 1.12, 0.16),
        new THREE.MeshStandardMaterial({
          color: isRed ? 0x9e1f28 : 0xeae6dc,
          roughness: 0.52,
        })
      );
      colBlock.position.set(halfProscW + 0.34, 1.2 + row * 1.18, 0.44);
      colBlock.castShadow = true;
      prosceniumFriezeRoot.add(colBlock);
    }

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
      new THREE.BoxGeometry(6.6, 6.1, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x1b132b, roughness: 0.8 })
    );
    winFrameBack.position.set(0, 3.35, -0.09);
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
          emissiveIntensity: 0.45,
          roughness: 0.3,
        });
        const pane = new THREE.Mesh(new THREE.BoxGeometry(1.12, 1.24, 0.06), paneMat);
        const lx = (c - 2) * 1.22;
        const ly = 5.15 - r * 1.34 + lx * -0.09;
        pane.position.set(lx, ly, 0.04);
        pane.rotation.z = -0.09;
        aliceWindowGroup.add(pane);
      }
    }

    for (const side of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.32, 6.2, 0.22), purpleFrameMat);
      post.position.set(side * 3.25, 3.35 + side * -0.28, 0.06);
      aliceWindowGroup.add(post);
    }
    const topHeaderBeam = new THREE.Mesh(
      new THREE.BoxGeometry(6.8, 0.42, 0.26),
      purpleFrameMat
    );
    topHeaderBeam.position.set(0, 6.2, 0.09);
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
