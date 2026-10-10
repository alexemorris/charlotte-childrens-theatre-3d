import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { createHumanScaleFigure } from '../shared-scenic-helpers.ts';

/**
 * Helper to generate a procedural Seussian shop sign texture with whimsical borders,
 * decorative corner ornaments, and hand-lettered department store typography.
 */
function createSeussianShopSignTexture(
  mainTitle: string,
  subTitle: string,
  bgColorHex: string,
  borderColorHex: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Rich painted background
    ctx.fillStyle = bgColorHex;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle Seussian cross-hatch texture strokes
    ctx.strokeStyle = 'rgba(20, 12, 28, 0.16)';
    ctx.lineWidth = 2;
    for (let x = 12; x < canvas.width; x += 22) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x - 10, canvas.height);
      ctx.stroke();
    }

    // Scalloped lime/gold inner border frame
    ctx.strokeStyle = borderColorHex;
    ctx.lineWidth = 7;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    ctx.strokeStyle = '#1b1424';
    ctx.lineWidth = 3;
    ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

    // Corner holly/star dots
    ctx.fillStyle = '#d8b428';
    for (const [cx, cy] of [
      [28, 28],
      [canvas.width - 28, 28],
      [28, canvas.height - 28],
      [canvas.width - 28, canvas.height - 28],
    ] as const) {
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Main store title
    ctx.fillStyle = '#d8d2c4';
    ctx.shadowColor = 'rgba(18, 8, 24, 0.75)';
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.font = 'bold 34px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(mainTitle, canvas.width / 2, 74);

    // Whimsical Seussian sub-label
    ctx.fillStyle = '#d8b834';
    ctx.font = 'italic bold 22px Georgia, serif';
    ctx.fillText(subTitle, canvas.width / 2, 132);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Helper to generate a spiral red-and-white (toned down <= 0xd8) candy-cane stripe texture.
 */
function createCandyCaneStripeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#d4ced6';
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = '#c82238';
    for (let i = -256; i < 512; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 30, 0);
      ctx.lineTo(i + 286, 256);
      ctx.lineTo(i + 256, 256);
      ctx.closePath();
      ctx.fill();
    }

    // Thin lime-green pinstripe accent
    ctx.strokeStyle = '#2e9c48';
    ctx.lineWidth = 4;
    for (let i = -256; i < 512; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i + 34, 0);
      ctx.lineTo(i + 290, 256);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 3);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Helper to build a whimsical Seussian Cash Register with coiled spiral springs,
 * pop-up price flags, bell dome, and gold keys.
 */
function createSeussianCashRegister(accentColorHex: number): THREE.Group {
  const reg = new THREE.Group();
  reg.name = 'SeussianCashRegister';

  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xc89e2e,
    roughness: 0.36,
    metalness: 0.72,
  });
  const bodyMat = new THREE.MeshStandardMaterial({
    color: accentColorHex,
    roughness: 0.48,
    metalness: 0.15,
  });
  const flagFaceMat = new THREE.MeshStandardMaterial({
    color: 0xd4ccb8,
    roughness: 0.6,
  });

  // Base cash drawer box
  const drawer = new THREE.Mesh(
    new RoundedBoxGeometry(0.28, 0.1, 0.24, 2, 0.02),
    brassMat
  );
  drawer.position.set(0, 0.05, 0);
  drawer.castShadow = true;
  reg.add(drawer);

  // Curved upper register cabinet
  const upperBody = new THREE.Mesh(
    new RoundedBoxGeometry(0.24, 0.18, 0.18, 2, 0.04),
    bodyMat
  );
  upperBody.position.set(0, 0.18, -0.02);
  upperBody.rotation.z = 0.06;
  upperBody.castShadow = true;
  reg.add(upperBody);

  // Key buttons on front slope (offset forward so never coplanar)
  for (let row = 0; row < 2; row++) {
    for (let col = -1; col <= 1; col++) {
      const key = new THREE.Mesh(
        new THREE.CylinderGeometry(0.016, 0.016, 0.04, 8),
        brassMat
      );
      key.rotation.x = Math.PI / 3;
      key.position.set(col * 0.055, 0.14 + row * 0.045, 0.095 - row * 0.02);
      reg.add(key);
    }
  }

  // Coiled spiral spring wires rising from top of register with price flags
  for (const side of [-1, 1] as const) {
    const springPoints: THREE.Vector3[] = [];
    const turns = 4.5;
    const steps = 32;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = t * turns * Math.PI * 2;
      const r = 0.022;
      springPoints.push(
        new THREE.Vector3(
          side * 0.06 + Math.cos(angle) * r,
          0.27 + t * 0.16,
          -0.02 + Math.sin(angle) * r
        )
      );
    }
    const springCurve = new THREE.CatmullRomCurve3(springPoints);
    const springGeo = new THREE.TubeGeometry(springCurve, 28, 0.005, 6, false);
    const springMesh = new THREE.Mesh(springGeo, brassMat);
    reg.add(springMesh);

    const flagTab = new THREE.Mesh(
      new THREE.BoxGeometry(0.075, 0.05, 0.012),
      flagFaceMat
    );
    flagTab.position.set(side * 0.065, 0.45, -0.02);
    flagTab.rotation.z = side * -0.18;
    reg.add(flagTab);
  }

  // Top ringing bell dome
  const bell = new THREE.Mesh(
    new THREE.SphereGeometry(0.036, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.6),
    brassMat
  );
  bell.position.set(0, 0.29, -0.02);
  reg.add(bell);

  return reg;
}

/**
 * Helper to build a stack of beribboned Seussian gift boxes and striped round hatboxes.
 */
function createMerchandiseGiftStack(
  boxColors: readonly [number, number, number],
  ribbonColorHex: number
): THREE.Group {
  const stack = new THREE.Group();
  const ribbonMat = new THREE.MeshStandardMaterial({
    color: ribbonColorHex,
    roughness: 0.45,
  });

  // Bottom square gift box
  const box1 = new THREE.Mesh(
    new RoundedBoxGeometry(0.22, 0.16, 0.2, 2, 0.02),
    new THREE.MeshStandardMaterial({ color: boxColors[0], roughness: 0.5 })
  );
  box1.position.set(0, 0.08, 0);
  box1.castShadow = true;
  stack.add(box1);

  const rib1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.235, 0.17, 0.04),
    ribbonMat
  );
  rib1.position.set(0, 0.08, 0);
  stack.add(rib1);

  // Middle round Seussian hatbox tilted jauntily
  const hatBox = new THREE.Mesh(
    new THREE.CylinderGeometry(0.095, 0.09, 0.14, 14),
    new THREE.MeshStandardMaterial({ color: boxColors[1], roughness: 0.5 })
  );
  hatBox.position.set(0.015, 0.23, -0.01);
  hatBox.rotation.z = -0.12;
  hatBox.castShadow = true;
  stack.add(hatBox);

  const hatLid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.105, 0.105, 0.03, 14),
    ribbonMat
  );
  hatLid.position.set(0.022, 0.3, -0.01);
  hatLid.rotation.z = -0.12;
  stack.add(hatLid);

  // Top small tilted gift parcel + bow loops
  const box2 = new THREE.Mesh(
    new RoundedBoxGeometry(0.13, 0.11, 0.13, 2, 0.015),
    new THREE.MeshStandardMaterial({ color: boxColors[2], roughness: 0.48 })
  );
  box2.position.set(-0.01, 0.37, 0);
  box2.rotation.z = 0.16;
  box2.rotation.y = 0.25;
  box2.castShadow = true;
  stack.add(box2);

  for (const side of [-1, 1] as const) {
    const bowLoop = new THREE.Mesh(
      new THREE.TorusGeometry(0.028, 0.009, 8, 12),
      ribbonMat
    );
    bowLoop.position.set(-0.01 + side * 0.025, 0.44, 0.01);
    bowLoop.rotation.z = side * 0.45;
    stack.add(bowLoop);
  }

  return stack;
}

/**
 * 1. SCENE 1D — WHOVILLE DEPARTMENT STORE SHOPPING COUNTERS (`'grinch-shopping-counters'`)
 *
 * Recreates the 3 crooked, curvy blue & turquoise Seussian Department Store Counter Booths
 * from `model_1D_shopping.jpg` and `plan_1D_shopping.jpg`:
 * - DSR Wagon (`x = -2.75, z = -1.65`) · "WHO DEPT. STORE" ("NEEDS-A-MAWOOZIS")
 * - Center Wagon (`x = 0.0, z = -1.85`) · "TINSEL & TRIMMINGS" ("WHATCH-A-MA-WHO")
 * - DSL Wagon (`x = +2.75, z = -1.65`) · "FLOO-FLOOBERS & TOYS" ("FUZZ-A-MA-WUMPUS")
 */
export function buildGrinchShoppingCounters(
  rockTex: THREE.CanvasTexture
): THREE.Group {
  const shoppingGroup = new THREE.Group();
  shoppingGroup.name = 'Element_grinch-shopping-counters';

  const candyStripeTex = createCandyCaneStripeTexture();

  const counterBlueMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    color: 0x1c78d8,
    roughness: 0.56,
    metalness: 0.06,
  });
  const counterTurquoiseMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    color: 0x2698c8,
    roughness: 0.56,
    metalness: 0.06,
  });
  const darkRecessMat = new THREE.MeshStandardMaterial({
    color: 0x10182c,
    roughness: 0.82,
  });
  const snowCounterTopMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    color: 0xcad2dc,
    roughness: 0.6,
  });
  const limeFrameMat = new THREE.MeshStandardMaterial({
    color: 0x42b438,
    roughness: 0.55,
  });
  const candyCanePostMat = new THREE.MeshStandardMaterial({
    map: candyStripeTex,
    roughness: 0.55,
  });
  const pineGarlandMat = new THREE.MeshStandardMaterial({
    color: 0x1c7a3c,
    roughness: 0.65,
  });
  const goldOrnamentMat = new THREE.MeshStandardMaterial({
    color: 0xd4a828,
    roughness: 0.35,
    metalness: 0.68,
  });
  const crimsonOrnamentMat = new THREE.MeshStandardMaterial({
    color: 0xc82238,
    roughness: 0.38,
    metalness: 0.35,
  });

  const boothSpecs = [
    {
      x: -2.75,
      z: -1.65,
      rotY: 0.18,
      mainTitle: 'WHO DEPT. STORE',
      subTitle: 'NEEDS-A-MAWOOZIS',
      clerkColor: 0xc82848,
      shopperColor: 0x2884c8,
      registerColor: 0xc42438,
      boxPalette: [0xd42c44, 0xd4a828, 0x3298d4] as const,
    },
    {
      x: 0.0,
      z: -1.85,
      rotY: 0.04,
      mainTitle: 'TINSEL & TRIMMINGS',
      subTitle: 'WHATCH-A-MA-WHO',
      clerkColor: 0x2e9448,
      shopperColor: 0xb83894,
      registerColor: 0x2484b8,
      boxPalette: [0x8838c8, 0xd42848, 0x38b468] as const,
    },
    {
      x: 2.75,
      z: -1.65,
      rotY: -0.18,
      mainTitle: 'FLOO-FLOOBERS & TOYS',
      subTitle: 'FUZZ-A-MA-WUMPUS',
      clerkColor: 0x7c38b8,
      shopperColor: 0xd47828,
      registerColor: 0x8e32b8,
      boxPalette: [0x288cd4, 0xd48424, 0xc82864] as const,
    },
  ] as const;

  for (let bIdx = 0; bIdx < boothSpecs.length; bIdx++) {
    const spec = boothSpecs[bIdx];
    if (!spec) continue;

    const unit = new THREE.Group();
    unit.name = `WhovilleShoppingBooth_${bIdx + 1}`;
    unit.position.set(spec.x, 0, spec.z);
    unit.rotation.y = spec.rotY;

    // 1. Rolling caster base platform (separated from floor at y = 0.04m)
    const wagonCasterDeck = new THREE.Mesh(
      new RoundedBoxGeometry(1.96, 0.08, 0.68, 2, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x1e2432, roughness: 0.7 })
    );
    wagonCasterDeck.position.set(0, 0.04, 0);
    unit.add(wagonCasterDeck);

    // 2. Curved multi-segment Seussian counter front with recessed center arch niche
    // Left and right curved turquoise/blue counter piers
    for (const side of [-1, 1] as const) {
      const pier = new THREE.Mesh(
        new RoundedBoxGeometry(0.56, 0.76, 0.56, 3, 0.08),
        counterBlueMat
      );
      pier.position.set(side * 0.62, 0.46, 0.02);
      pier.rotation.y = side * -0.12;
      pier.castShadow = true;
      pier.receiveShadow = true;
      unit.add(pier);

      // Molded turquoise front relief panel (offset +0.04m in Z to avoid coplanarity)
      const reliefPanel = new THREE.Mesh(
        new RoundedBoxGeometry(0.42, 0.56, 0.05, 2, 0.04),
        counterTurquoiseMat
      );
      reliefPanel.position.set(side * 0.62, 0.46, 0.31);
      reliefPanel.rotation.y = side * -0.12;
      unit.add(reliefPanel);
    }

    // Center upper arch bridge of the counter
    const archBridge = new THREE.Mesh(
      new RoundedBoxGeometry(0.76, 0.28, 0.54, 2, 0.06),
      counterBlueMat
    );
    archBridge.position.set(0, 0.7, 0);
    archBridge.castShadow = true;
    unit.add(archBridge);

    // Recessed dark arched display niche in the front center of the counter (matching model_1D_shopping.jpg!)
    const nicheBacking = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.36, 0.52, 16, 1, false, 0, Math.PI),
      darkRecessMat
    );
    nicheBacking.rotation.x = Math.PI / 2;
    nicheBacking.position.set(0, 0.12, 0.22);
    unit.add(nicheBacking);

    // Turquoise arch molding rim around the center cutout
    const archRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.35, 0.042, 10, 20, Math.PI),
      counterTurquoiseMat
    );
    archRim.position.set(0, 0.12, 0.31);
    unit.add(archRim);

    // 3. Snowy white-ice curved counter top slab (roughness >= 0.55, color <= 0xd8)
    const counterTopCenter = new THREE.Mesh(
      new RoundedBoxGeometry(1.98, 0.09, 0.64, 3, 0.04),
      snowCounterTopMat
    );
    counterTopCenter.position.set(0, 0.88, 0.03);
    counterTopCenter.castShadow = true;
    counterTopCenter.receiveShadow = true;
    unit.add(counterTopCenter);

    // Curved front apron lip on counter top (offset in Z and Y)
    const counterLip = new THREE.Mesh(
      new RoundedBoxGeometry(2.04, 0.055, 0.12, 2, 0.02),
      counterTurquoiseMat
    );
    counterLip.position.set(0, 0.84, 0.34);
    unit.add(counterLip);

    // 4. Tall red-and-white spiral candy-cane side posts + crooked lime-green Seussian branch arms
    for (const side of [-1, 1] as const) {
      const postGroup = new THREE.Group();
      postGroup.position.set(side * 0.76, 0.92, 0.06);

      // Curved spiral candy-cane post via TubeGeometry
      const postCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(side * -0.06, 0.42, 0.03),
        new THREE.Vector3(side * 0.05, 0.86, -0.02),
        new THREE.Vector3(side * -0.04, 1.28, 0.02),
      ]);
      const candyPost = new THREE.Mesh(
        new THREE.TubeGeometry(postCurve, 24, 0.048, 12, false),
        candyCanePostMat
      );
      candyPost.castShadow = true;
      postGroup.add(candyPost);

      // Lime-green crooked Seussian outer vine/branch post (seen in model_1D_shopping.jpg)
      const branchCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.07, 0, 0.04),
        new THREE.Vector3(side * 0.16, 0.45, 0.06),
        new THREE.Vector3(side * 0.09, 0.92, 0.04),
        new THREE.Vector3(side * 0.18, 1.34, 0.05),
      ]);
      const limeBranch = new THREE.Mesh(
        new THREE.TubeGeometry(branchCurve, 20, 0.036, 10, false),
        limeFrameMat
      );
      limeBranch.castShadow = true;
      postGroup.add(limeBranch);

      // Side sprout arm with hanging ornament
      const sproutArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.028, 0.26, 8),
        limeFrameMat
      );
      sproutArm.position.set(side * 0.22, 0.72, 0.06);
      sproutArm.rotation.z = side * -0.68;
      postGroup.add(sproutArm);

      const hangingBall = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 12, 10),
        side < 0 ? crimsonOrnamentMat : goldOrnamentMat
      );
      hangingBall.position.set(side * 0.3, 0.62, 0.06);
      postGroup.add(hangingBall);

      // Top curled candy-cane finial knob
      const finialKnob = new THREE.Mesh(
        new THREE.SphereGeometry(0.075, 12, 10),
        limeFrameMat
      );
      finialKnob.position.set(side * -0.04, 1.32, 0.02);
      postGroup.add(finialKnob);

      unit.add(postGroup);
    }

    // 5. Crooked scalloped lime-green & crimson Seussian overhead shop sign
    const signGroup = new THREE.Group();
    signGroup.position.set(0, 2.08, 0.1);
    signGroup.rotation.z = bIdx === 1 ? -0.04 : bIdx === 0 ? 0.05 : -0.05;

    // Scalloped lime-green outer frame backing (Z = -0.035m relative to signGroup)
    const limeSignFrame = new THREE.Mesh(
      new RoundedBoxGeometry(1.68, 0.56, 0.04, 3, 0.08),
      limeFrameMat
    );
    limeSignFrame.position.set(0, 0, -0.035);
    limeSignFrame.castShadow = true;
    signGroup.add(limeSignFrame);

    // Top and bottom lime-green Seussian scallops along the sign frame
    for (let sc = -3; sc <= 3; sc++) {
      const scallop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.11, 0.04, 12),
        limeFrameMat
      );
      scallop.rotation.x = Math.PI / 2;
      scallop.position.set(sc * 0.22, -0.27, -0.035);
      signGroup.add(scallop);
    }

    // Canvas-rendered painted signboard (Z = +0.015m relative to signGroup, separated by 0.05m)
    const signTex = createSeussianShopSignTexture(
      spec.mainTitle,
      spec.subTitle,
      '#b81e34',
      '#52c438'
    );
    const signBoard = new THREE.Mesh(
      new RoundedBoxGeometry(1.54, 0.44, 0.04, 2, 0.04),
      new THREE.MeshStandardMaterial({
        map: signTex,
        roughness: 0.56,
      })
    );
    signBoard.position.set(0, 0.01, 0.015);
    signGroup.add(signBoard);

    // Hanging ornaments & pine garland swag under the sign
    for (let o = -2; o <= 2; o++) {
      const swagBead = new THREE.Mesh(
        new THREE.SphereGeometry(0.048, 10, 8),
        pineGarlandMat
      );
      swagBead.scale.set(1.6, 0.85, 0.9);
      swagBead.position.set(
        o * 0.28,
        -0.31 - (1 - Math.abs(o) / 3) * 0.05,
        0.02
      );
      signGroup.add(swagBead);

      if (o % 2 === 0) {
        const dropOrn = new THREE.Mesh(
          new THREE.SphereGeometry(0.042, 10, 10),
          o === 0 ? goldOrnamentMat : crimsonOrnamentMat
        );
        dropOrn.position.set(o * 0.28, -0.41, 0.02);
        signGroup.add(dropOrn);
      }
    }

    unit.add(signGroup);

    // 6. Countertop Merchandise: Seussian Cash Register, Conical Display Trees, & Gift Stacks
    const cashRegister = createSeussianCashRegister(spec.registerColor);
    cashRegister.position.set(-0.52, 0.92, 0.04);
    cashRegister.rotation.y = 0.22;
    unit.add(cashRegister);

    const giftStackLeft = createMerchandiseGiftStack(spec.boxPalette, 0xd4b828);
    giftStackLeft.position.set(0.48, 0.92, 0.05);
    giftStackLeft.rotation.y = -0.18;
    unit.add(giftStackLeft);

    // Colorful tiered conical hats / display trees on counter center (matching model_1D_shopping.jpg!)
    const coneColors = [0xd42838, 0xd4a824, 0x2884d4, 0x34a848];
    for (let c = 0; c < 3; c++) {
      const displayCone = new THREE.Mesh(
        new THREE.ConeGeometry(0.085, 0.24 + (c % 2) * 0.06, 12),
        new THREE.MeshStandardMaterial({
          color: coneColors[(bIdx + c) % coneColors.length] ?? 0xd42838,
          roughness: 0.55,
        })
      );
      displayCone.position.set(-0.14 + c * 0.18, 1.04, 0.08 + (c % 2) * 0.04);
      displayCone.rotation.z = (c - 1) * 0.08;
      displayCone.castShadow = true;
      unit.add(displayCone);
    }

    // 7. Who Store Clerk behind the counter + Who Shopper beside the booth
    const clerk = createHumanScaleFigure(1.52, spec.clerkColor, 0.16, 0x2e9448, false);
    clerk.position.set(0.12, 0, -0.46);
    unit.add(clerk);

    const shopper = createHumanScaleFigure(
      1.38,
      spec.shopperColor,
      0.14,
      0xd42848,
      bIdx === 1
    );
    shopper.position.set(bIdx === 2 ? -1.12 : 1.12, 0, 0.25);
    shopper.rotation.y = bIdx === 2 ? 0.65 : -0.65;
    unit.add(shopper);

    shoppingGroup.add(unit);
  }

  shoppingGroup.visible = false;
  return shoppingGroup;
}

/**
 * Helper to build the DSR Pink Whoville Round House wagon that remains onstage
 * during Scene 1F (`model_1F_mt_crumpit_sleigh.jpg` & `plan_1F_cave2_crumpit.jpg`).
 */
function buildDsrWhovilleHouseFor1F(rockTex: THREE.CanvasTexture): THREE.Group {
  const widthM = 2.35;
  const heightM = 2.75;
  const g = new THREE.Group();
  g.name = 'WhovillePinkHouse_DSR_1F';

  const wagonBase = new THREE.Mesh(
    new THREE.BoxGeometry(widthM + 0.35, 0.12, 1.05),
    new THREE.MeshStandardMaterial({ color: 0x262c3a, roughness: 0.65 })
  );
  wagonBase.position.y = 0.06;
  g.add(wagonBase);

  const pinkMat = new THREE.MeshStandardMaterial({
    color: 0xd44688,
    roughness: 0.56,
    metalness: 0.04,
  });
  const snowRoofMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    color: 0xbed0d8,
    roughness: 0.62,
  });
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x181422 });
  const warmWindowMat = new THREE.MeshStandardMaterial({
    color: 0xd8c058,
    emissive: 0xd89020,
    emissiveIntensity: 0.55,
    roughness: 0.55,
  });
  const wreathGreenMat = new THREE.MeshStandardMaterial({
    color: 0x1d8a42,
    roughness: 0.6,
  });
  const redBowMat = new THREE.MeshStandardMaterial({
    color: 0xc82438,
    roughness: 0.55,
  });

  const body = new THREE.Mesh(
    new RoundedBoxGeometry(widthM, heightM * 0.68, 0.68, 3, 0.26),
    pinkMat
  );
  body.position.y = (heightM * 0.68) / 2 + 0.12;
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  const roof = new THREE.Mesh(
    new THREE.SphereGeometry(
      widthM * 0.54,
      20,
      14,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.56
    ),
    snowRoofMat
  );
  roof.scale.set(1.04, 0.68, 0.58);
  roof.position.set(0, heightM * 0.64, 0);
  roof.castShadow = true;
  g.add(roof);

  const scallopCount = 7;
  for (let i = 0; i < scallopCount; i++) {
    const sx =
      ((i - (scallopCount - 1) / 2) / (scallopCount / 2)) * (widthM * 0.44);
    const drip = new THREE.Mesh(
      new THREE.ConeGeometry(0.14, 0.34, 8),
      snowRoofMat
    );
    drip.rotation.x = Math.PI;
    drip.position.set(sx, heightM * 0.58, 0.38);
    g.add(drip);
  }

  const chimney = new THREE.Mesh(
    new RoundedBoxGeometry(0.28, 0.56, 0.22, 2, 0.06),
    snowRoofMat
  );
  chimney.position.set(0.08, heightM * 0.94, -0.02);
  chimney.rotation.z = -0.18;
  g.add(chimney);

  const doorX = widthM * 0.2;
  const doorFrame = new THREE.Mesh(
    new RoundedBoxGeometry(0.62, 1.32, 0.06, 2, 0.22),
    outlineMat
  );
  doorFrame.position.set(doorX, 0.78, 0.35);
  g.add(doorFrame);

  const doorPanel = new THREE.Mesh(
    new RoundedBoxGeometry(0.54, 1.24, 0.06, 2, 0.2),
    new THREE.MeshStandardMaterial({ color: 0xd870a8, roughness: 0.55 })
  );
  doorPanel.position.set(doorX, 0.78, 0.39);
  g.add(doorPanel);

  const doorWreath = new THREE.Mesh(
    new THREE.TorusGeometry(0.16, 0.055, 10, 18),
    wreathGreenMat
  );
  doorWreath.position.set(doorX, 0.98, 0.45);
  g.add(doorWreath);

  const doorBow = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.09, 0.05),
    redBowMat
  );
  doorBow.position.set(doorX, 1.14, 0.49);
  g.add(doorBow);

  for (const wx of [-widthM * 0.3, -widthM * 0.05]) {
    const win = new THREE.Mesh(
      new RoundedBoxGeometry(0.34, 0.46, 0.06, 2, 0.12),
      warmWindowMat
    );
    win.position.set(wx, 0.98, 0.36);
    g.add(win);

    const winWreath = new THREE.Mesh(
      new THREE.TorusGeometry(0.1, 0.035, 8, 14),
      wreathGreenMat
    );
    winWreath.position.set(wx, 0.98, 0.42);
    g.add(winWreath);
  }

  return g;
}

/**
 * Helper to build faithful Max the Dog with his single oversized reindeer antler tied with a red bow.
 */
function createMaxTheDogWithAntler(): THREE.Group {
  const max = new THREE.Group();
  max.name = 'MaxTheDog';

  const furMat = new THREE.MeshStandardMaterial({
    color: 0xa87242,
    roughness: 0.62,
  });
  const earMat = new THREE.MeshStandardMaterial({
    color: 0x6e4424,
    roughness: 0.65,
  });
  const antlerMat = new THREE.MeshStandardMaterial({
    color: 0xc8b48c,
    roughness: 0.58,
  });
  const redRibbonMat = new THREE.MeshStandardMaterial({
    color: 0xc82238,
    roughness: 0.5,
  });

  // Seated/leaning dog torso
  const body = new THREE.Mesh(
    new RoundedBoxGeometry(0.34, 0.24, 0.2, 2, 0.07),
    furMat
  );
  body.position.set(0, 0.18, 0);
  body.rotation.z = 0.22;
  body.castShadow = true;
  max.add(body);

  // Front and back legs
  for (const [lx, lz] of [
    [-0.12, -0.06],
    [-0.12, 0.06],
    [0.12, -0.06],
    [0.12, 0.06],
  ] as const) {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.028, 0.18, 8),
      furMat
    );
    leg.position.set(lx, 0.09, lz);
    max.add(leg);
  }

  // Head & snout
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), furMat);
  head.position.set(-0.18, 0.34, 0);
  head.castShadow = true;
  max.add(head);

  const snout = new THREE.Mesh(
    new RoundedBoxGeometry(0.12, 0.075, 0.08, 2, 0.025),
    furMat
  );
  snout.position.set(-0.27, 0.32, 0);
  max.add(snout);

  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(0.025, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0x1a1418, roughness: 0.4 })
  );
  nose.position.set(-0.33, 0.34, 0);
  max.add(nose);

  // Floppy ears
  for (const side of [-1, 1] as const) {
    const ear = new THREE.Mesh(
      new RoundedBoxGeometry(0.06, 0.16, 0.03, 1, 0.01),
      earMat
    );
    ear.position.set(-0.16, 0.28, side * 0.1);
    ear.rotation.x = side * 0.25;
    max.add(ear);
  }

  // Red ribbon tied around Max's head
  const headRibbon = new THREE.Mesh(
    new THREE.TorusGeometry(0.095, 0.016, 8, 16),
    redRibbonMat
  );
  headRibbon.rotation.y = Math.PI / 2;
  headRibbon.position.set(-0.18, 0.36, 0);
  max.add(headRibbon);

  // Single oversized crooked reindeer antler tied to the top of Max's head!
  const antlerMainCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.18, 0.44, 0),
    new THREE.Vector3(-0.22, 0.62, 0.02),
    new THREE.Vector3(-0.14, 0.78, -0.02),
    new THREE.Vector3(-0.24, 0.92, 0),
  ]);
  const antlerStem = new THREE.Mesh(
    new THREE.TubeGeometry(antlerMainCurve, 20, 0.022, 8, false),
    antlerMat
  );
  antlerStem.castShadow = true;
  max.add(antlerStem);

  // Antler tines
  for (const [ty, tz, rotZ] of [
    [0.58, 0.02, 0.65],
    [0.72, -0.02, -0.58],
    [0.84, 0.01, 0.52],
  ] as const) {
    const tine = new THREE.Mesh(
      new THREE.ConeGeometry(0.018, 0.16, 8),
      antlerMat
    );
    tine.position.set(-0.19, ty, tz);
    tine.rotation.z = rotZ;
    max.add(tine);
  }

  return max;
}

/**
 * Helper to build the Grinch figure in his stolen Santa Claus coat and hat.
 */
function createGrinchCharacter(withCarvingTools = false): THREE.Group {
  const grinch = new THREE.Group();
  grinch.name = 'TheGrinchFigure';

  const grinchGreenMat = new THREE.MeshStandardMaterial({
    color: 0x52b838,
    roughness: 0.55,
  });
  const santaCoatMat = new THREE.MeshStandardMaterial({
    color: 0xc82238,
    roughness: 0.52,
  });
  const furTrimMat = new THREE.MeshStandardMaterial({
    color: 0xd0d4d8,
    roughness: 0.62,
  });
  const beltMat = new THREE.MeshStandardMaterial({
    color: 0x18161e,
    roughness: 0.45,
  });

  // Green furry legs
  for (const lx of [-0.09, 0.09] as const) {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.052, 0.045, 0.62, 10),
      grinchGreenMat
    );
    leg.position.set(lx, 0.33, 0);
    leg.castShadow = true;
    grinch.add(leg);

    // Curled-toe crimson elf/Santa shoes
    const shoe = new THREE.Mesh(
      new RoundedBoxGeometry(0.11, 0.08, 0.22, 2, 0.03),
      santaCoatMat
    );
    shoe.position.set(lx, 0.04, 0.05);
    grinch.add(shoe);
  }

  // Red Santa coat torso with pear-shaped Seussian posture
  const coatTorso = new THREE.Mesh(
    CylinderGeometryOrRounded(0.24, 0.72),
    santaCoatMat
  );
  coatTorso.position.set(0, 0.94, 0);
  coatTorso.castShadow = true;
  grinch.add(coatTorso);

  // White fur hem & collar (offset outward so no coplanar surfaces)
  const furHem = new THREE.Mesh(
    new THREE.TorusGeometry(0.23, 0.045, 10, 18),
    furTrimMat
  );
  furHem.rotation.x = Math.PI / 2;
  furHem.position.set(0, 0.62, 0);
  grinch.add(furHem);

  const belt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.215, 0.225, 0.08, 16),
    beltMat
  );
  belt.position.set(0, 0.84, 0);
  grinch.add(belt);

  // Green Grinch head with tuft of fur & Santa hat
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.145, 14, 12),
    grinchGreenMat
  );
  head.scale.set(0.95, 1.12, 0.98);
  head.position.set(0, 1.46, 0.02);
  head.castShadow = true;
  grinch.add(head);

  const santaHatTrim = new THREE.Mesh(
    new THREE.TorusGeometry(0.135, 0.036, 8, 16),
    furTrimMat
  );
  santaHatTrim.rotation.x = Math.PI / 2;
  santaHatTrim.position.set(0, 1.56, 0.02);
  grinch.add(santaHatTrim);

  const santaHatCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.13, 0.34, 12),
    santaCoatMat
  );
  santaHatCone.position.set(0.04, 1.72, 0.02);
  santaHatCone.rotation.z = -0.28;
  grinch.add(santaHatCone);

  const hatPom = new THREE.Mesh(
    new THREE.SphereGeometry(0.042, 10, 10),
    furTrimMat
  );
  hatPom.position.set(0.1, 1.88, 0.02);
  grinch.add(hatPom);

  // Arms
  for (const side of [-1, 1] as const) {
    const arm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.04, 0.48, 8),
      santaCoatMat
    );
    arm.position.set(side * 0.26, 1.12, 0.08);
    arm.rotation.z = side * 0.45;
    arm.rotation.x = -0.45;
    grinch.add(arm);

    const hand = new THREE.Mesh(
      new THREE.SphereGeometry(0.048, 8, 8),
      grinchGreenMat
    );
    hand.position.set(side * 0.36, 1.24, 0.22);
    grinch.add(hand);
  }

  if (withCarvingTools) {
    const silverMat = new THREE.MeshStandardMaterial({
      color: 0xc8d0d8,
      roughness: 0.25,
      metalness: 0.85,
    });
    const carvingKnife = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.32, 0.04),
      silverMat
    );
    carvingKnife.position.set(0.38, 1.38, 0.24);
    carvingKnife.rotation.x = 0.25;
    grinch.add(carvingKnife);
  }

  return grinch;
}

function CylinderGeometryOrRounded(
  radius: number,
  height: number
): THREE.BufferGeometry {
  return new THREE.CylinderGeometry(radius * 0.75, radius, height, 14);
}

/**
 * 2. SCENE 1F — MT. CRUMPIT SLEIGH CLIFF WAGON (`'grinch-mt-crumpit-sleigh'`)
 *
 * Recreates Scene 1F from `model_1F_mt_crumpit_sleigh.jpg` and `plan_1F_cave2_crumpit.jpg`:
 * - DSR Pink Whoville House (`x = -2.85, z = -2.45`) remaining onstage
 * - Steep, jagged icy-blue Mt. Crumpit precipice wagon at DSL (`x = +2.45m, z = -2.35m`)
 *   with stepped rock strata, overhanging snow ledges, and icicles
 * - Perched precariously at a dramatic tilt on the cliff crest: the Grinch's crooked wooden &
 *   crimson sleigh with curved steel runners (`TubeGeometry`), dashboard horn, and the
 *   colossal overstuffed crimson sack bursting with stolen Christmas trees, bicycle wheels,
 *   wrapped presents, candy canes, and stockings, plus the Grinch (`0x52b838`) and Max!
 */
export function buildGrinchMtCrumpitSleigh(
  rockTex: THREE.CanvasTexture
): THREE.Group {
  const crumpitSleighGroup = new THREE.Group();
  crumpitSleighGroup.name = 'Element_grinch-mt-crumpit-sleigh';

  // 1. DSR Pink Whoville House remains onstage in Scene 1F (see model_1F_mt_crumpit_sleigh.jpg)
  const dsrHouse1F = buildDsrWhovilleHouseFor1F(rockTex);
  dsrHouse1F.position.set(-2.85, 0, -2.45);
  dsrHouse1F.rotation.y = 0.14;
  crumpitSleighGroup.add(dsrHouse1F);

  // 2. Steep Jagged Icy-Blue Mt. Crumpit Precipice Wagon at DSL (x = +2.45m, z = -2.35m)
  const cliffWagon = new THREE.Group();
  cliffWagon.name = 'MtCrumpitCliffWagon';
  cliffWagon.position.set(2.45, 0, -2.35);

  const iceRockLowerMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    color: 0x6c92c4,
    roughness: 0.62,
    metalness: 0.06,
  });
  const iceRockUpperMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    color: 0x8cb0d8,
    roughness: 0.58,
    metalness: 0.06,
  });
  const snowLedgeMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    color: 0xc8d2d8,
    roughness: 0.6,
  });
  const icicleMat = new THREE.MeshStandardMaterial({
    color: 0xb4cce0,
    roughness: 0.55,
    metalness: 0.12,
  });
  const darkContourMat = new THREE.MeshBasicMaterial({ color: 0x162038 });

  // Rolling steel wagon base frame (drawn as rectangle + stair unit on plan_1F_cave2_crumpit.jpg)
  const wagonFrame = new THREE.Mesh(
    new RoundedBoxGeometry(2.65, 0.12, 1.18, 2, 0.02),
    new THREE.MeshStandardMaterial({ color: 0x202838, roughness: 0.7 })
  );
  wagonFrame.position.set(0, 0.06, 0);
  cliffWagon.add(wagonFrame);

  // Stepped jagged rock strata ascending steeply from stage right (left of wagon) up to the DSL precipice peak
  const strataSpecs = [
    { x: -0.92, y: 0.42, z: -0.04, w: 1.05, h: 0.68, d: 0.88, rotZ: 0.34, mat: iceRockLowerMat },
    { x: -0.32, y: 0.78, z: 0.02, w: 1.28, h: 1.18, d: 0.82, rotZ: 0.38, mat: iceRockUpperMat },
    { x: 0.28, y: 1.16, z: -0.03, w: 1.24, h: 1.62, d: 0.86, rotZ: 0.32, mat: iceRockLowerMat },
    { x: 0.68, y: 1.54, z: 0.03, w: 0.96, h: 1.92, d: 0.78, rotZ: 0.22, mat: iceRockUpperMat },
  ] as const;

  for (let sIdx = 0; sIdx < strataSpecs.length; sIdx++) {
    const st = strataSpecs[sIdx];
    if (!st) continue;

    const rockBlock = new THREE.Mesh(
      new RoundedBoxGeometry(st.w, st.h, st.d, 3, 0.16),
      st.mat
    );
    rockBlock.position.set(st.x, st.y, st.z);
    rockBlock.rotation.z = st.rotZ;
    rockBlock.castShadow = true;
    rockBlock.receiveShadow = true;
    cliffWagon.add(rockBlock);

    // Overhanging snow ledge capping each stepped stratum (separated in Z & Y)
    const snowCap = new THREE.Mesh(
      new RoundedBoxGeometry(st.w * 0.95, 0.18, st.d + 0.1, 2, 0.07),
      snowLedgeMat
    );
    snowCap.position.set(
      st.x - Math.sin(st.rotZ) * (st.h * 0.46),
      st.y + Math.cos(st.rotZ) * (st.h * 0.46),
      st.z + 0.04
    );
    snowCap.rotation.z = st.rotZ * 0.85;
    snowCap.castShadow = true;
    cliffWagon.add(snowCap);

    // Dark Seussian contour border line under the snow ledge (offset +0.05m in Z)
    const contourStrip = new THREE.Mesh(
      new THREE.BoxGeometry(st.w * 0.88, 0.035, 0.04),
      darkContourMat
    );
    contourStrip.position.set(
      snowCap.position.x,
      snowCap.position.y - 0.09,
      st.z + st.d * 0.5 + 0.06
    );
    contourStrip.rotation.z = st.rotZ * 0.85;
    cliffWagon.add(contourStrip);

    // Hanging icicles beneath each overhanging snow ledge
    for (let ic = -2; ic <= 2; ic++) {
      const icicle = new THREE.Mesh(
        new THREE.ConeGeometry(0.055, 0.24 + ((sIdx + ic + 2) % 3) * 0.09, 7),
        icicleMat
      );
      icicle.rotation.x = Math.PI;
      icicle.position.set(
        snowCap.position.x + ic * 0.18,
        snowCap.position.y - 0.18,
        st.z + st.d * 0.5 + 0.03
      );
      cliffWagon.add(icicle);
    }
  }

  // Upstage technician access steps behind the cliff flat (drawn on plan_1F_cave2_crumpit.jpg)
  for (let step = 0; step < 4; step++) {
    const tread = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.05, 0.52),
      new THREE.MeshStandardMaterial({ color: 0x2c3446, roughness: 0.72 })
    );
    tread.position.set(-0.65 + step * 0.38, 0.28 + step * 0.28, -0.58);
    cliffWagon.add(tread);
  }

  // 3. The Grinch's Crooked Sleigh & Colossal Overstuffed Sack perched at a dramatic tilt!
  // Total height reaches ~3.45m at the top of the overstuffed sack & protruding tree!
  const sleighGroup = new THREE.Group();
  sleighGroup.name = 'GrinchPrecariousSleighAndSack';
  sleighGroup.position.set(0.32, 1.98, 0.06);
  sleighGroup.rotation.z = -0.28; // Dramatic downhill/cliff-edge tilt matching model_1F_mt_crumpit_sleigh.jpg!

  const steelRunnerMat = new THREE.MeshStandardMaterial({
    color: 0x3e2a1e,
    roughness: 0.45,
    metalness: 0.65,
  });
  const sleighCrimsonMat = new THREE.MeshStandardMaterial({
    color: 0xb81e32,
    roughness: 0.52,
    metalness: 0.12,
  });
  const sleighWoodMat = new THREE.MeshStandardMaterial({
    color: 0x5c3822,
    roughness: 0.62,
  });
  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xd4a628,
    roughness: 0.35,
    metalness: 0.72,
  });

  // Curved steel runners with curled front scrolls via TubeGeometry
  for (const rz of [-0.28, 0.28] as const) {
    const runnerCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.88, 0.26, rz),
      new THREE.Vector3(-0.98, 0.14, rz),
      new THREE.Vector3(-0.84, 0.02, rz),
      new THREE.Vector3(-0.35, 0.0, rz),
      new THREE.Vector3(0.35, 0.0, rz),
      new THREE.Vector3(0.78, 0.04, rz),
    ]);
    const runnerMesh = new THREE.Mesh(
      new THREE.TubeGeometry(runnerCurve, 32, 0.028, 10, false),
      steelRunnerMat
    );
    runnerMesh.castShadow = true;
    sleighGroup.add(runnerMesh);

    // Vertical runner stanchions connecting runners to sleigh hull
    for (const sx of [-0.48, 0.0, 0.48] as const) {
      const strut = new THREE.Mesh(
        new THREE.CylinderGeometry(0.022, 0.022, 0.22, 8),
        steelRunnerMat
      );
      strut.position.set(sx, 0.11, rz);
      sleighGroup.add(strut);
    }
  }

  // Sleigh wooden deck floorboard
  const sleighFloor = new THREE.Mesh(
    new RoundedBoxGeometry(1.38, 0.06, 0.54, 2, 0.02),
    sleighWoodMat
  );
  sleighFloor.position.set(-0.04, 0.22, 0);
  sleighFloor.castShadow = true;
  sleighGroup.add(sleighFloor);

  // Crooked crimson sleigh side panels (separated in Z at ±0.29m)
  for (const side of [-1, 1] as const) {
    const sideWall = new THREE.Mesh(
      new RoundedBoxGeometry(1.32, 0.34, 0.05, 2, 0.06),
      sleighCrimsonMat
    );
    sideWall.position.set(-0.02, 0.38, side * 0.29);
    sideWall.castShadow = true;
    sleighGroup.add(sideWall);

    // Gold Seussian scroll molding along sleigh side (offset outward by 0.035m)
    const scrollTrim = new THREE.Mesh(
      new RoundedBoxGeometry(1.18, 0.045, 0.02, 1, 0.01),
      goldTrimMat
    );
    scrollTrim.position.set(-0.02, 0.44, side * 0.325);
    sleighGroup.add(scrollTrim);
  }

  // Curved front dashboard & high flared back tailboard
  const dashboard = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.3, 0.58, 14, 1, false, 0, Math.PI * 0.75),
    sleighCrimsonMat
  );
  dashboard.rotation.x = Math.PI / 2;
  dashboard.rotation.z = Math.PI * 0.65;
  dashboard.position.set(-0.66, 0.42, 0);
  sleighGroup.add(dashboard);

  const tailboard = new THREE.Mesh(
    new RoundedBoxGeometry(0.12, 0.52, 0.58, 2, 0.04),
    sleighCrimsonMat
  );
  tailboard.position.set(0.64, 0.46, 0);
  tailboard.rotation.z = -0.28;
  sleighGroup.add(tailboard);

  // Whimsical Seussian brass dashboard horn (coiled bugle + flared bell)
  const hornCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.68, 0.56, 0.24),
    new THREE.Vector3(-0.82, 0.66, 0.28),
    new THREE.Vector3(-0.76, 0.76, 0.22),
    new THREE.Vector3(-0.92, 0.82, 0.26),
  ]);
  const hornTube = new THREE.Mesh(
    new THREE.TubeGeometry(hornCurve, 20, 0.018, 8, false),
    goldTrimMat
  );
  sleighGroup.add(hornTube);

  const hornBell = new THREE.Mesh(
    new THREE.ConeGeometry(0.065, 0.12, 12, 1, true),
    goldTrimMat
  );
  hornBell.rotation.z = Math.PI / 2 + 0.2;
  hornBell.position.set(-0.96, 0.84, 0.26);
  sleighGroup.add(hornBell);

  // 4. COLOSSAL OVERSTUFFED CRIMSON SACK OF STOLEN WHOVILLE PRESENTS!
  // Multi-lobe SphereGeometry cluster matching the huge red teardrop sack in model_1F_mt_crumpit_sleigh.jpg
  const sackCrimsonMat = new THREE.MeshStandardMaterial({
    color: 0xc8182e,
    roughness: 0.55,
    metalness: 0.05,
  });
  const sackHighlightMat = new THREE.MeshStandardMaterial({
    color: 0xd42438,
    roughness: 0.56,
  });

  const mainSackBelly = new THREE.Mesh(
    new THREE.SphereGeometry(0.76, 24, 20),
    sackCrimsonMat
  );
  mainSackBelly.scale.set(1.22, 0.96, 0.82);
  mainSackBelly.position.set(0.14, 0.84, 0);
  mainSackBelly.castShadow = true;
  mainSackBelly.receiveShadow = true;
  sleighGroup.add(mainSackBelly);

  // Secondary bulging lobes for organic overstuffed toys contour
  const lobeSpecs = [
    { x: -0.32, y: 0.78, z: 0.14, r: 0.46 },
    { x: 0.52, y: 0.88, z: -0.1, r: 0.5 },
    { x: 0.18, y: 1.18, z: 0.08, r: 0.48 },
    { x: -0.08, y: 1.06, z: -0.14, r: 0.44 },
  ] as const;

  for (const lb of lobeSpecs) {
    const lobe = new THREE.Mesh(
      new THREE.SphereGeometry(lb.r, 16, 14),
      sackHighlightMat
    );
    lobe.position.set(lb.x, lb.y, lb.z);
    lobe.castShadow = true;
    sleighGroup.add(lobe);
  }

  // Gathered tied sack neck + flared clothruffle top (matching model_1F_mt_crumpit_sleigh.jpg)
  const sackNeck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.36, 0.34, 16),
    sackCrimsonMat
  );
  sackNeck.position.set(0.18, 1.48, 0);
  sackNeck.rotation.z = -0.16;
  sleighGroup.add(sackNeck);

  const sackRuffle = new THREE.Mesh(
    new THREE.ConeGeometry(0.36, 0.28, 14),
    sackHighlightMat
  );
  sackRuffle.rotation.x = Math.PI;
  sackRuffle.position.set(0.22, 1.68, 0);
  sackRuffle.rotation.z = -0.16;
  sleighGroup.add(sackRuffle);

  // Golden rope cinch around the neck of the sack
  const ropeCinch = new THREE.Mesh(
    new THREE.TorusGeometry(0.21, 0.032, 10, 20),
    new THREE.MeshStandardMaterial({ color: 0xc49a48, roughness: 0.65 })
  );
  ropeCinch.rotation.x = Math.PI / 2;
  ropeCinch.rotation.y = -0.16;
  ropeCinch.position.set(0.2, 1.56, 0);
  sleighGroup.add(ropeCinch);

  // 5. Protruding Stolen Whoville Treasures bursting out of the top of the sack!
  // Stolen Christmas tree top with star
  const stolenTreeMat = new THREE.MeshStandardMaterial({
    color: 0x1e8a3e,
    roughness: 0.58,
  });
  for (let tier = 0; tier < 2; tier++) {
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.22 - tier * 0.06, 0.32, 10),
      stolenTreeMat
    );
    cone.position.set(0.14 - tier * 0.04, 1.88 + tier * 0.18, 0.04);
    cone.rotation.z = 0.24;
    sleighGroup.add(cone);
  }
  const treeStar = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.065, 0),
    goldTrimMat
  );
  treeStar.position.set(0.06, 2.22, 0.04);
  sleighGroup.add(treeStar);

  // Protruding stolen bicycle wheel (rim + spokes)
  const wheelGroup = new THREE.Group();
  wheelGroup.position.set(0.42, 1.76, 0.08);
  wheelGroup.rotation.z = -0.35;
  const wheelRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.18, 0.018, 8, 20),
    steelRunnerMat
  );
  wheelGroup.add(wheelRim);
  for (let sp = 0; sp < 6; sp++) {
    const spoke = new THREE.Mesh(
      new THREE.CylinderGeometry(0.005, 0.005, 0.34, 6),
      goldTrimMat
    );
    spoke.rotation.z = (sp * Math.PI) / 6;
    wheelGroup.add(spoke);
  }
  sleighGroup.add(wheelGroup);

  // Protruding wrapped gift boxes, giant candy cane, & Christmas stocking
  const stolenGift = new THREE.Mesh(
    new RoundedBoxGeometry(0.22, 0.22, 0.2, 2, 0.02),
    new THREE.MeshStandardMaterial({ color: 0x2884d4, roughness: 0.55 })
  );
  stolenGift.position.set(0.02, 1.78, -0.1);
  stolenGift.rotation.set(0.25, 0.4, 0.35);
  sleighGroup.add(stolenGift);

  const candyHookCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.28, 1.68, -0.06),
    new THREE.Vector3(0.36, 1.98, -0.08),
    new THREE.Vector3(0.46, 2.04, -0.08),
    new THREE.Vector3(0.52, 1.94, -0.08),
  ]);
  const stolenCandyCane = new THREE.Mesh(
    new THREE.TubeGeometry(candyHookCurve, 20, 0.026, 8, false),
    new THREE.MeshStandardMaterial({
      map: createCandyCaneStripeTexture(),
      roughness: 0.55,
    })
  );
  sleighGroup.add(stolenCandyCane);

  // Stolen Christmas stocking hanging off the side of the sack
  const stockingBoot = new THREE.Mesh(
    new RoundedBoxGeometry(0.12, 0.28, 0.06, 2, 0.02),
    new THREE.MeshStandardMaterial({ color: 0x28a448, roughness: 0.58 })
  );
  stockingBoot.position.set(-0.34, 1.24, 0.36);
  stockingBoot.rotation.z = 0.28;
  sleighGroup.add(stockingBoot);

  // 6. The Grinch (`0x52b838`) & faithful Max the dog with his single tied antler!
  const grinch = createGrinchCharacter(false);
  grinch.scale.setScalar(0.78);
  grinch.position.set(-0.52, 0.24, 0.04);
  grinch.rotation.y = Math.PI * 0.5;
  sleighGroup.add(grinch);

  const maxDog = createMaxTheDogWithAntler();
  maxDog.position.set(-0.98, 0.14, 0);
  sleighGroup.add(maxDog);

  cliffWagon.add(sleighGroup);
  crumpitSleighGroup.add(cliffWagon);

  crumpitSleighGroup.visible = false;
  return crumpitSleighGroup;
}

/**
 * 3. SCENE 1G — FINALE CHRISTMAS FEAST IN WHOVILLE (`'grinch-finale-banquet'`)
 *
 * Recreates the long, curved Whoville Feast Banquet Table (`width ≈ 4.9m`) at Center Stage
 * (`x = 0, z = -1.95m`) from `model_1G_finale.jpg` and `plan_1G_finale.jpg`:
 * - Multi-segment curved arc (`CylinderGeometry` / `ExtrudeGeometry` arc) with 4 sculpted
 *   royal-blue arches (`model_1G_finale.jpg`), white scalloped tablecloth, royal-blue & gold
 *   festooned swags with red bows
 * - Grand silver domed Roast Beast carving platter at center, tiered Who-pudding stands,
 *   golden candelabras, goblets, festive garland runner
 * - Transformed Grinch (`0x52b838`) with carving knife + Who townspeople gathered around the feast.
 */
export function buildGrinchFinaleBanquet(): THREE.Group {
  const finaleBanquetGroup = new THREE.Group();
  finaleBanquetGroup.name = 'Element_grinch-finale-banquet';
  finaleBanquetGroup.position.set(0, 0, -1.95);

  const royalBlueArchMat = new THREE.MeshStandardMaterial({
    color: 0x1a72d4,
    roughness: 0.55,
    metalness: 0.08,
  });
  const deepBlueShadowMat = new THREE.MeshStandardMaterial({
    color: 0x0e2854,
    roughness: 0.75,
  });
  const whiteTableclothMat = new THREE.MeshStandardMaterial({
    color: 0xcfd4d8,
    roughness: 0.58,
  });
  const goldFestoonMat = new THREE.MeshStandardMaterial({
    color: 0xd4a828,
    roughness: 0.36,
    metalness: 0.72,
  });
  const crimsonBowMat = new THREE.MeshStandardMaterial({
    color: 0xc82238,
    roughness: 0.52,
  });
  const silverPlatterMat = new THREE.MeshStandardMaterial({
    color: 0xc6ced8,
    roughness: 0.26,
    metalness: 0.85,
  });
  const roastBeastMat = new THREE.MeshStandardMaterial({
    color: 0x8a4224,
    roughness: 0.56,
  });
  const pineGarlandMat = new THREE.MeshStandardMaterial({
    color: 0x1e843e,
    roughness: 0.62,
  });

  // 1. Multi-segment curved Banquet Table Arc (width ≈ 4.9m across X, curving around Center Stage)
  // Using 12 segments along a sweeping crescent arc (`radiusX = 2.48m, radiusZ = 1.18m`)
  const segmentCount = 12;
  const arcSpan = Math.PI * 0.76; // Sweeps across ~4.9m total width
  const radiusX = 2.62;
  const radiusZ = 1.15;

  for (let i = 0; i < segmentCount; i++) {
    const t = (i + 0.5) / segmentCount - 0.5; // -0.458 .. +0.458
    const angle = t * arcSpan;
    const segX = Math.sin(angle) * radiusX;
    const segZ = (Math.cos(angle) - 1.0) * radiusZ;

    const segGroup = new THREE.Group();
    segGroup.position.set(segX, 0, segZ);
    segGroup.rotation.y = angle * 0.68;

    // Royal-blue lower table apron column
    const blueBaseBlock = new THREE.Mesh(
      new RoundedBoxGeometry(0.48, 0.72, 0.54, 2, 0.04),
      royalBlueArchMat
    );
    blueBaseBlock.position.set(0, 0.36, 0);
    blueBaseBlock.castShadow = true;
    blueBaseBlock.receiveShadow = true;
    segGroup.add(blueBaseBlock);

    // 4 Sculpted Arched Cutouts along the front face (matching the 4 arches in model_1G_finale.jpg!)
    if (i % 3 === 1) {
      const archRecess = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.26, 0.48, 14, 1, false, 0, Math.PI),
        deepBlueShadowMat
      );
      archRecess.rotation.x = Math.PI / 2;
      archRecess.position.set(0, 0.02, 0.25);
      segGroup.add(archRecess);

      // Gold & blue arch trim molding (offset to z = +0.305m so never coplanar)
      const archTrim = new THREE.Mesh(
        new THREE.TorusGeometry(0.24, 0.028, 8, 16, Math.PI),
        goldFestoonMat
      );
      archTrim.position.set(0, 0.08, 0.305);
      segGroup.add(archTrim);
    }

    // White scalloped overhanging tablecloth top slab (`color: 0xcfd4d8, roughness: 0.58`)
    const clothTop = new THREE.Mesh(
      new RoundedBoxGeometry(0.52, 0.09, 0.64, 2, 0.03),
      whiteTableclothMat
    );
    clothTop.position.set(0, 0.76, 0.02);
    clothTop.castShadow = true;
    clothTop.receiveShadow = true;
    segGroup.add(clothTop);

    // Scalloped front tablecloth skirt overhang (offset at z = +0.345m)
    const scallopDrop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.18, 0.14, 12),
      whiteTableclothMat
    );
    scallopDrop.rotation.x = Math.PI / 2;
    scallopDrop.scale.set(1.0, 0.3, 0.65);
    scallopDrop.position.set(0, 0.68, 0.345);
    segGroup.add(scallopDrop);

    // Royal-blue & gold festooned swags with red bows along the front skirt (offset at z = +0.38m)
    const swagCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.22, 0.68, 0.38),
      new THREE.Vector3(0, 0.56, 0.39),
      new THREE.Vector3(0.22, 0.68, 0.38),
    ]);
    const goldSwag = new THREE.Mesh(
      new THREE.TubeGeometry(swagCurve, 14, 0.018, 8, false),
      goldFestoonMat
    );
    segGroup.add(goldSwag);

    const redBow = new THREE.Mesh(
      new RoundedBoxGeometry(0.09, 0.06, 0.03, 1, 0.01),
      crimsonBowMat
    );
    redBow.position.set(-0.22, 0.69, 0.415);
    segGroup.add(redBow);

    // Festive pine garland runner + golden goblets on top of the banquet table
    const garlandCluster = new THREE.Mesh(
      new RoundedBoxGeometry(0.46, 0.055, 0.09, 2, 0.02),
      pineGarlandMat
    );
    garlandCluster.position.set(0, 0.835, 0.14);
    segGroup.add(garlandCluster);

    if (i % 2 === 0) {
      const goblet = new THREE.Group();
      goblet.position.set(0.08, 0.81, -0.06);
      const cup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.012, 0.09, 10),
        goldFestoonMat
      );
      cup.position.y = 0.05;
      goblet.add(cup);
      segGroup.add(goblet);
    }

    finaleBanquetGroup.add(segGroup);
  }

  // 2. Centerpiece: Grand Silver Domed Roast Beast Carving Platter at Center of Table (`x = 0, y = 0.81, z = -0.02`)
  const roastBeastGroup = new THREE.Group();
  roastBeastGroup.name = 'RoastBeastCarvingPlatter';
  roastBeastGroup.position.set(0, 0.81, -0.02);

  // Ornate oval silver platter tray
  const silverTray = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.32, 0.04, 24),
    silverPlatterMat
  );
  silverTray.scale.set(1.35, 1.0, 0.82);
  silverTray.position.set(0, 0.02, 0);
  roastBeastGroup.add(silverTray);

  // Sculpted Roast Beast haunch with bone frills
  const roastHaunch = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 18, 14),
    roastBeastMat
  );
  roastHaunch.scale.set(1.35, 0.82, 0.88);
  roastHaunch.position.set(-0.04, 0.16, 0);
  roastHaunch.castShadow = true;
  roastBeastGroup.add(roastHaunch);

  for (const bz of [-0.07, 0.07] as const) {
    const boneFrill = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.018, 0.16, 8),
      whiteTableclothMat
    );
    boneFrill.rotation.z = Math.PI / 2 - 0.25;
    boneFrill.position.set(0.26, 0.19, bz);
    roastBeastGroup.add(boneFrill);
  }

  // Tilted open silver cloche dome revealing the Roast Beast
  const silverCloche = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.5),
    silverPlatterMat
  );
  silverCloche.scale.set(1.28, 0.95, 0.82);
  silverCloche.position.set(-0.18, 0.28, -0.06);
  silverCloche.rotation.z = 0.52;
  silverCloche.castShadow = true;
  roastBeastGroup.add(silverCloche);

  finaleBanquetGroup.add(roastBeastGroup);

  // 3. Tiered Seussian Who-Pudding Stands & Golden Candelabras along the banquet arc
  for (const side of [-1, 1] as const) {
    // Tiered Who-Pudding Stand
    const puddingStand = new THREE.Group();
    puddingStand.position.set(side * 0.92, 0.81, -0.14);

    const standStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.06, 0.28, 12),
      silverPlatterMat
    );
    standStem.position.y = 0.14;
    puddingStand.add(standStem);

    for (let tier = 0; tier < 2; tier++) {
      const plate = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18 - tier * 0.05, 0.16 - tier * 0.05, 0.02, 16),
        silverPlatterMat
      );
      plate.position.y = 0.12 + tier * 0.14;
      puddingStand.add(plate);

      const puddingCake = new THREE.Mesh(
        new THREE.SphereGeometry(0.11 - tier * 0.03, 14, 10),
        new THREE.MeshStandardMaterial({
          color: tier === 0 ? 0xc84878 : 0xd49838,
          roughness: 0.55,
        })
      );
      puddingCake.scale.set(1.0, 0.72, 1.0);
      puddingCake.position.y = 0.17 + tier * 0.14;
      puddingStand.add(puddingCake);
    }
    finaleBanquetGroup.add(puddingStand);

    // Golden 3-arm Candelabra
    const candelabra = new THREE.Group();
    candelabra.position.set(side * 1.68, 0.81, -0.38);

    const candBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.07, 0.26, 12),
      goldFestoonMat
    );
    candBase.position.y = 0.13;
    candelabra.add(candBase);

    for (const cx of [-0.08, 0, 0.08] as const) {
      const candle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.014, 0.014, 0.14, 8),
        whiteTableclothMat
      );
      candle.position.set(cx, 0.28 + (cx === 0 ? 0.04 : 0), 0);
      candelabra.add(candle);

      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.018, 0.045, 8),
        new THREE.MeshStandardMaterial({
          color: 0xd8b838,
          emissive: 0xd88818,
          emissiveIntensity: 0.9,
          roughness: 0.55,
        })
      );
      flame.position.set(cx, 0.37 + (cx === 0 ? 0.04 : 0), 0);
      candelabra.add(flame);
    }
    finaleBanquetGroup.add(candelabra);
  }

  // 4. Transformed Grinch at the Head of the Feast + Joyful Who Townspeople & Cindy-Lou Who!
  const redeemedGrinch = createGrinchCharacter(true);
  redeemedGrinch.position.set(0, 0, -0.58);
  finaleBanquetGroup.add(redeemedGrinch);

  // Cindy-Lou Who right beside the Grinch
  const cindyLou = createHumanScaleFigure(1.12, 0xd44888, 0.12, 0xc82238, false);
  cindyLou.position.set(0.58, 0, -0.56);
  cindyLou.rotation.y = -0.15;
  finaleBanquetGroup.add(cindyLou);

  // Who family & townspeople gathered along the curved banquet table
  const whoSpecs = [
    { x: -0.68, z: -0.58, rotY: 0.18, h: 1.56, coat: 0x2878c8, hat: 0.18 },
    { x: -1.42, z: -0.78, rotY: 0.32, h: 1.48, coat: 0x389c48, hat: 0.14 },
    { x: 1.38, z: -0.76, rotY: -0.32, h: 1.54, coat: 0x8e38b8, hat: 0.16 },
    { x: -2.08, z: -1.08, rotY: 0.48, h: 1.32, coat: 0xd47828, hat: 0.0 },
    { x: 2.08, z: -1.08, rotY: -0.48, h: 1.44, coat: 0xc82848, hat: 0.15 },
  ] as const;

  for (const wSpec of whoSpecs) {
    const whoFig = createHumanScaleFigure(
      wSpec.h,
      wSpec.coat,
      wSpec.hat,
      0xd4a828,
      false
    );
    whoFig.position.set(wSpec.x, 0, wSpec.z);
    whoFig.rotation.y = wSpec.rotY;
    finaleBanquetGroup.add(whoFig);
  }

  // Max the Dog sitting happily at the right end of the feast
  const feastMax = createMaxTheDogWithAntler();
  feastMax.position.set(0.95, 0, 0.38);
  feastMax.rotation.y = -0.5;
  finaleBanquetGroup.add(feastMax);

  finaleBanquetGroup.visible = false;
  return finaleBanquetGroup;
}

/**
 * Helper to create a raised backstage spike-tape rectangle outline (`y = 0.036m` so it is
 * cleanly separated by >0.03m from the stage deck at `y = 0`).
 */
function createSpikeTapeOutlineBay(
  widthM: number,
  depthM: number,
  tapeColorHex: number
): THREE.Group {
  const bay = new THREE.Group();
  const tapeMat = new THREE.MeshStandardMaterial({
    color: tapeColorHex,
    emissive: tapeColorHex,
    emissiveIntensity: 0.25,
    roughness: 0.58,
  });
  const stripThickness = 0.045;
  const stripHeight = 0.012;
  const yPos = 0.038; // >= 0.03m above floor plane (y = 0)

  for (const sz of [-depthM / 2, depthM / 2] as const) {
    const hBar = new THREE.Mesh(
      new THREE.BoxGeometry(widthM, stripHeight, stripThickness),
      tapeMat
    );
    hBar.position.set(0, yPos, sz);
    bay.add(hBar);
  }
  for (const sx of [-widthM / 2, widthM / 2] as const) {
    const vBar = new THREE.Mesh(
      new THREE.BoxGeometry(stripThickness, stripHeight, depthM - stripThickness * 2),
      tapeMat
    );
    vBar.position.set(sx, yPos, 0);
    bay.add(vBar);
  }

  return bay;
}

/**
 * Helper to build a backstage technical work-light stand (tripod base, vertical mast,
 * safety cage, and amber/blue running light head).
 */
function createBackstageWorkLightStand(): THREE.Group {
  const stand = new THREE.Group();
  stand.name = 'BackstageWorkLightStand';

  const blackSteelMat = new THREE.MeshStandardMaterial({
    color: 0x1c202a,
    roughness: 0.55,
    metalness: 0.65,
  });
  const warmWorkBulbMat = new THREE.MeshStandardMaterial({
    color: 0xd8a848,
    emissive: 0xd88424,
    emissiveIntensity: 0.75,
    roughness: 0.55,
  });

  // Tripod legs
  for (let l = 0; l < 3; l++) {
    const angle = (l * Math.PI * 2) / 3;
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.014, 0.55, 8),
      blackSteelMat
    );
    leg.position.set(Math.cos(angle) * 0.16, 0.22, Math.sin(angle) * 0.16);
    leg.rotation.z = -Math.cos(angle) * 0.48;
    leg.rotation.x = Math.sin(angle) * 0.48;
    stand.add(leg);
  }

  // Vertical telescoping pole
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.022, 1.95, 10),
    blackSteelMat
  );
  pole.position.set(0, 1.02, 0);
  stand.add(pole);

  // Work-light hood & glowing amber lamp cage at top
  const hood = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.13, 0.16, 12),
    blackSteelMat
  );
  hood.rotation.x = Math.PI / 4;
  hood.position.set(0, 2.02, 0.04);
  stand.add(hood);

  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.065, 10, 10),
    warmWorkBulbMat
  );
  bulb.position.set(0, 1.98, 0.08);
  stand.add(bulb);

  return stand;
}

/**
 * 4. CAD OFFSTAGE PROP & WAGON STORAGE BAYS (`'grinch-offstage-storage'`)
 *
 * Recreates the offstage storage bays drawn on the 1/4" CAD Ground Plans (`plan_1A`–`plan_1G`
 * in USR and SL wings) with spike-tape outlines, parked scenic wagons (Refrigerator, Tree,
 * Prop Racks, Daybed, Fireplace, Mt. Crumpit Sleigh Bay), and backstage work-light stands.
 */
export function buildGrinchOffstageStorage(
  rockTex: THREE.CanvasTexture
): THREE.Group {
  const offstageStorageGroup = new THREE.Group();
  offstageStorageGroup.name = 'Element_grinch-offstage-storage';

  const propCrateMat = new THREE.MeshStandardMaterial({
    color: 0x2e384e,
    roughness: 0.65,
    metalness: 0.15,
  });
  const olivePropMat = new THREE.MeshStandardMaterial({
    color: 0x6c883c,
    roughness: 0.58,
  });
  const royalBluePropMat = new THREE.MeshStandardMaterial({
    color: 0x1c70c8,
    roughness: 0.56,
  });
  const iceCaveMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    color: 0x7a9ec8,
    roughness: 0.6,
  });

  // ==========================================================================
  // A. UPSTAGE RIGHT (USR) WING STORAGE BAYS (CAD Sheets 1A–1G)
  // ==========================================================================
  // 1. USR "Refrigerator" & Oval "Tree" / Table Bay (x = -5.85m, z = -7.65m)
  const usrFridgeBay = new THREE.Group();
  usrFridgeBay.position.set(-5.85, 0, -7.65);

  const fridgeSpike = createSpikeTapeOutlineBay(1.35, 0.95, 0xd4b828);
  usrFridgeBay.add(fridgeSpike);

  // Parked Seussian Refrigerator Wagon (matching CAD label "Refrigerator")
  const fridgeBody = new THREE.Mesh(
    new RoundedBoxGeometry(0.92, 1.72, 0.64, 3, 0.12),
    olivePropMat
  );
  fridgeBody.position.set(0, 0.92, 0);
  fridgeBody.rotation.z = 0.05;
  fridgeBody.castShadow = true;
  usrFridgeBay.add(fridgeBody);

  const fridgeDoor = new THREE.Mesh(
    new RoundedBoxGeometry(0.76, 1.42, 0.05, 2, 0.08),
    new THREE.MeshStandardMaterial({ color: 0xc8c2b0, roughness: 0.58 })
  );
  fridgeDoor.position.set(0, 0.92, 0.35);
  usrFridgeBay.add(fridgeDoor);

  // Oval Tree / Prop Turntable parked beside Refrigerator (drawn on CAD plans)
  const ovalTreeProp = new THREE.Group();
  ovalTreeProp.position.set(-0.98, 0, -0.12);
  const ovalBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.45, 0.12, 16),
    propCrateMat
  );
  ovalBase.scale.set(1.2, 1.0, 0.78);
  ovalBase.position.y = 0.06;
  ovalTreeProp.add(ovalBase);

  const spareTree = new THREE.Mesh(
    new THREE.ConeGeometry(0.34, 1.45, 10),
    new THREE.MeshStandardMaterial({ color: 0x1e843e, roughness: 0.6 })
  );
  spareTree.position.y = 0.84;
  spareTree.rotation.z = -0.12;
  ovalTreeProp.add(spareTree);
  usrFridgeBay.add(ovalTreeProp);

  offstageStorageGroup.add(usrFridgeBay);

  // 2. Far Upstage Right "Prop" Racks & Escape Stair Unit (x = -6.35m, z = -9.45m)
  const usrPropRacksGroup = new THREE.Group();
  usrPropRacksGroup.position.set(-6.35, 0, -9.45);

  const propRackSpike = createSpikeTapeOutlineBay(1.85, 1.25, 0x38b4d4);
  usrPropRacksGroup.add(propRackSpike);

  for (const pz of [-0.32, 0.32] as const) {
    const rackFrame = new THREE.Mesh(
      new RoundedBoxGeometry(0.72, 1.55, 0.48, 2, 0.04),
      propCrateMat
    );
    rackFrame.position.set(-0.35, 0.82, pz);
    rackFrame.castShadow = true;
    usrPropRacksGroup.add(rackFrame);

    // Spare holiday gifts & wreaths stored on the prop rack
    const storedBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.24, 0.28),
      new THREE.MeshStandardMaterial({
        color: pz < 0 ? 0xc82438 : 0xd4a828,
        roughness: 0.55,
      })
    );
    storedBox.position.set(-0.35, 1.72, pz);
    usrPropRacksGroup.add(storedBox);
  }
  offstageStorageGroup.add(usrPropRacksGroup);

  // ==========================================================================
  // B. STAGE LEFT (SL) WING STORAGE BAYS (CAD Sheets 1A–1G)
  // ==========================================================================
  // 1. Upstage Left "Daybed" Storage Bay (x = +5.95m, z = -7.35m)
  const ulDaybedBay = new THREE.Group();
  ulDaybedBay.position.set(5.95, 0, -7.35);

  const daybedSpike = createSpikeTapeOutlineBay(1.58, 0.88, 0xd4b828);
  ulDaybedBay.add(daybedSpike);

  const daybedMattress = new THREE.Mesh(
    new RoundedBoxGeometry(1.32, 0.44, 0.64, 2, 0.08),
    royalBluePropMat
  );
  daybedMattress.position.set(0, 0.32, 0);
  daybedMattress.castShadow = true;
  ulDaybedBay.add(daybedMattress);

  for (const side of [-1, 1] as const) {
    const scrollArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.66, 12),
      royalBluePropMat
    );
    scrollArm.rotation.x = Math.PI / 2;
    scrollArm.position.set(side * 0.64, 0.56, 0);
    ulDaybedBay.add(scrollArm);
  }
  offstageStorageGroup.add(ulDaybedBay);

  // 2. Far Upstage Left "Fireplace" & Curved Counter Storage Bay (x = +7.95m, z = -8.65m)
  const ulFireplaceBay = new THREE.Group();
  ulFireplaceBay.position.set(7.95, 0, -8.65);

  const fireplaceSpike = createSpikeTapeOutlineBay(1.35, 1.75, 0xd45838);
  ulFireplaceBay.add(fireplaceSpike);

  const parkedFireplace = new THREE.Mesh(
    new RoundedBoxGeometry(1.02, 2.15, 1.38, 2, 0.06),
    propCrateMat
  );
  parkedFireplace.position.set(0, 1.12, 0);
  parkedFireplace.castShadow = true;
  ulFireplaceBay.add(parkedFireplace);

  // Parked curved counter/banquet unit at USL corner (x = +6.55m, z = -9.55m on CAD plans)
  const uslCurvedCounterParked = new THREE.Mesh(
    new RoundedBoxGeometry(1.42, 0.82, 0.56, 3, 0.08),
    royalBluePropMat
  );
  uslCurvedCounterParked.position.set(-1.35, 0.45, -0.92);
  uslCurvedCounterParked.rotation.y = -0.25;
  ulFireplaceBay.add(uslCurvedCounterParked);

  offstageStorageGroup.add(ulFireplaceBay);

  // 3. Downstage Left Wing "Mt. Crumpit with sleigh" Storage Bay (x = +8.15m, z = -2.35m)
  const dslCrumpitBay = new THREE.Group();
  dslCrumpitBay.position.set(8.15, 0, -2.35);

  const crumpitSpike = createSpikeTapeOutlineBay(1.45, 2.75, 0x38b4d4);
  dslCrumpitBay.add(crumpitSpike);

  const crumpitDockRack = new THREE.Mesh(
    new RoundedBoxGeometry(1.12, 1.58, 2.35, 3, 0.14),
    iceCaveMat
  );
  crumpitDockRack.position.set(0, 0.84, 0);
  crumpitDockRack.castShadow = true;
  dslCrumpitBay.add(crumpitDockRack);

  const crumpitStairDock = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.85, 0.65),
    propCrateMat
  );
  crumpitStairDock.position.set(0, 0.46, 1.48);
  dslCrumpitBay.add(crumpitStairDock);

  offstageStorageGroup.add(dslCrumpitBay);

  // ==========================================================================
  // C. BACKSTAGE WORK-LIGHT STANDS (USR & SL Wings)
  // ==========================================================================
  const usrWorkLight = createBackstageWorkLightStand();
  usrWorkLight.position.set(-6.85, 0, -6.45);
  offstageStorageGroup.add(usrWorkLight);

  const slWorkLight = createBackstageWorkLightStand();
  slWorkLight.position.set(7.25, 0, -5.25);
  offstageStorageGroup.add(slWorkLight);

  offstageStorageGroup.visible = true;
  return offstageStorageGroup;
}
