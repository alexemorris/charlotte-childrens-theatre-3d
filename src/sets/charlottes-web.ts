import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { ProductionSetBuilderContext, ProductionSetModule } from './types.ts';

export const charlottesWebSet: ProductionSetModule = {
  spec: {
    id: 'charlottes-web',
    title: "Charlotte's Web",
    subtitle: "Zuckerman's Timber Barn & County Fair",
    playwrightOrComposer: 'E.B. White / Joseph Robinette · CTC Classic',
    ageRecommendation: 'Ages 4+ · All-Ages Favorite',
    description:
      'Weathered red timber-frame gambrel barn portal with functional hayloft platform at +2.4m, glowing silver "SOME PIG" spiderweb in the upper barn frame, Wilbur’s cedar pen, and warm pastoral cyclorama.',
    scenicNotes:
      'The glowing spiderweb is hung at y = +3.8m to +4.9m on the barn header—test rows M–P under the Lower Balcony overhang to ensure 100% web legibility.',
    cycTopColor: 0x264e86,
    cycBottomColor: 0xf4a852,
    stageWashColor: 0xffe0aa,
    stageSpotColor: 0xffcb78,
    apronWashColor: 0xffd89c,
    elements: [
      {
        id: 'barn-timber-portal',
        name: "Zuckerman's Gambrel Barn & Hayloft Platform",
        category: 'portal',
        battenLine: 3,
        defaultVisible: true,
        dimensionsLabel: '8.6m W × 6.4m H (Loft at +2.4m)',
      },
      {
        id: 'charlotte-spiderweb',
        name: 'Illuminated "SOME PIG" Silver Spiderweb',
        category: 'fly-rig',
        battenLine: 2,
        defaultVisible: true,
        dimensionsLabel: '2.2m Diameter Spun Steel Web',
      },
      {
        id: 'wilbur-pen-fencing',
        name: "Wilbur's Cedar Pen, Trough & Hay Bales",
        category: 'furniture',
        defaultVisible: true,
        dimensionsLabel: '4.2m W × 2.4m D',
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
    const charlotteGroup = new THREE.Group();
    charlotteGroup.name = 'Prod_charlottes-web';

    // 1. Zuckerman's Timber-Frame Gambrel Barn & Hayloft
    const barnGroup = new THREE.Group();
    barnGroup.position.set(0, 0, -4.4);
    charlotteGroup.add(barnGroup);
    registerElement('barn-timber-portal', barnGroup, 3);

    const barnWallMat = new THREE.MeshStandardMaterial({
      map: textures.barnWoodTex,
      roughness: 0.78,
    });
    const timberBeamMat = new THREE.MeshStandardMaterial({
      color: 0x6e472b,
      roughness: 0.72,
    });

    for (const side of [-1, 1]) {
      const barnTower = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 5.6, 1.8),
        barnWallMat
      );
      barnTower.position.set(side * 3.4, 2.8, 0);
      barnTower.castShadow = true;
      barnTower.receiveShadow = true;
      barnGroup.add(barnTower);
    }

    const hayloftDeck = new THREE.Mesh(
      new THREE.BoxGeometry(4.6, 0.28, 1.8),
      timberBeamMat
    );
    hayloftDeck.position.set(0, 2.45, 0);
    hayloftDeck.castShadow = true;
    barnGroup.add(hayloftDeck);

    for (const side of [-1, 1]) {
      const roofSlope = new THREE.Mesh(
        new THREE.BoxGeometry(4.8, 0.28, 2.0),
        barnWallMat
      );
      roofSlope.position.set(side * 1.95, 5.75, 0);
      roofSlope.rotation.z = side * -0.42;
      barnGroup.add(roofSlope);
    }

    // 2. Illuminated Silver "SOME PIG" Spiderweb in the Upper Barn Frame (y = +4.15m)
    const webGroup = new THREE.Group();
    webGroup.position.set(-1.35, 4.15, -3.45);
    charlotteGroup.add(webGroup);
    registerElement('charlotte-spiderweb', webGroup, 2);

    const webMat = new THREE.MeshBasicMaterial({
      color: 0xe8f4ff,
      toneMapped: false,
    });
    for (const radius of [0.35, 0.68, 1.02, 1.32]) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(radius, radius + 0.03, 16),
        webMat
      );
      webGroup.add(ring);
    }
    for (let a = 0; a < 8; a++) {
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.025, 0.02), webMat);
      spoke.rotation.z = (a * Math.PI) / 8;
      webGroup.add(spoke);
    }

    // 3. Wilbur's Cedar Pen, Feeding Trough & Golden Hay Bales
    const wilburGroup = new THREE.Group();
    wilburGroup.position.set(-2.2, 0, -1.65);
    charlotteGroup.add(wilburGroup);
    registerElement('wilbur-pen-fencing', wilburGroup);

    const hayMat = new THREE.MeshStandardMaterial({ color: 0xdba838, roughness: 0.88 });
    for (const [hx, hy, hz, rot] of [
      [-1.2, 0.25, -0.4, 0.1],
      [-0.5, 0.25, -0.6, -0.2],
      [-0.85, 0.72, -0.5, 0.05],
      [3.8, 0.25, -0.3, 0.3],
      [4.4, 0.25, -0.5, -0.15],
    ] as const) {
      const bale = new THREE.Mesh(
        new RoundedBoxGeometry(0.85, 0.48, 0.52, 1, 0.04),
        hayMat
      );
      bale.position.set(hx, hy, hz);
      bale.rotation.y = rot;
      bale.castShadow = true;
      wilburGroup.add(bale);
    }

    for (let f = -1; f <= 1; f++) {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.95, 0.12),
        timberBeamMat
      );
      post.position.set(f * 1.45, 0.48, 0.45);
      wilburGroup.add(post);
    }
    for (const ry of [0.35, 0.72]) {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(3.1, 0.09, 0.06),
        timberBeamMat
      );
      rail.position.set(0, ry, 0.45);
      wilburGroup.add(rail);
    }

    return charlotteGroup;
  },
};
