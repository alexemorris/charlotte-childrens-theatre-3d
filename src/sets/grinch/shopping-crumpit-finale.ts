import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { drawSeussianDisplayText } from '../../engine/procedural-textures.ts';
import {
  createGrinchCharacter,
  createMaxDogCharacter,
  createSculptedIcicleDrip,
  createSeussianIcicleValance,
  createWhoCharacter,
} from '../shared-scenic-helpers.ts';

/**
 * Helper to generate a procedural Seussian shop sign texture on a high-res 512×192 canvas
 * with scalloped Seussian gold/green borders and authentic bouncy Seussian wedge lettering
 * via `drawSeussianDisplayText` (zero standard Times New Roman / Georgia `ctx.fillText`).
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
    // Rich painted crimson/berry gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, bgColorHex);
    bgGrad.addColorStop(1, '#7c1222');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle Seussian cross-hatch ink texture strokes
    ctx.strokeStyle = 'rgba(20, 12, 28, 0.16)';
    ctx.lineWidth = 2;
    for (let x = 12; x < canvas.width; x += 22) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x - 10, canvas.height);
      ctx.stroke();
    }

    // Scalloped lime-green & gold Seussian outer border
    ctx.strokeStyle = borderColorHex;
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

    // Scalloped gold inner festoon loops around the perimeter
    ctx.strokeStyle = '#d8b428';
    ctx.lineWidth = 3.5;
    for (let sx = 24; sx <= canvas.width - 24; sx += 32) {
      ctx.beginPath();
      ctx.arc(sx, 14, 10, 0, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(sx, canvas.height - 14, 10, Math.PI, Math.PI * 2);
      ctx.stroke();
    }

    ctx.strokeStyle = '#1b1424';
    ctx.lineWidth = 3;
    ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

    // Corner holly/star medallions
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

    // Authentic bouncy Seussian wedge lettering for Main Shop Title
    const mainFontSize = mainTitle.length > 17 ? 26 : 30;
    drawSeussianDisplayText(ctx, mainTitle, canvas.width / 2, 68, {
      fontSize: mainFontSize,
      fillTopColor: '#d8d4c8',
      fillBottomColor: '#c8b898',
      bevelHighlightColor: 'rgba(255, 250, 230, 0.65)',
      outlineColor: '#181020',
      shadowColor: '#100816',
      bounceAmp: 2.8,
      tiltAmp: 0.08,
      archCurvature: -0.05,
      letterSpacing: mainFontSize * 0.62,
    });

    // Authentic bouncy Seussian wedge lettering for Whoville Sub-Title
    drawSeussianDisplayText(ctx, subTitle, canvas.width / 2, 134, {
      fontSize: 21,
      fillTopColor: '#d8c448',
      fillBottomColor: '#c48c20',
      bevelHighlightColor: 'rgba(255, 245, 200, 0.6)',
      outlineColor: '#181020',
      shadowColor: '#100816',
      bounceAmp: 2.2,
      tiltAmp: 0.09,
      archCurvature: 0.04,
      letterSpacing: 13.5,
    });
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
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
 * - DSR Wagon (`x = -2.65m, z = -1.12m`) · "WHO DEPT. STORE" ("NEEDS-A-MAWOOZIS")
 * - Center Wagon (`x = 0.0m, z = -1.25m`) · "TINSEL & TRIMMINGS" ("WHATCH-A-MA-WHO")
 * - DSL Wagon (`x = +2.65m, z = -1.12m`) · "FLOO-FLOOBERS & TOYS" ("FUZZ-A-MA-WUMPUS")
 * Positioned downstage with >0.65m clearance from the Center Christmas Tree Turntable
 * (`z = -3.55m`, front edge `-2.40m`) and the 3 Pink Whoville Houses (`z <= -2.45m`).
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
  const iceGlazeMat = new THREE.MeshStandardMaterial({
    color: 0x8eb8dc,
    roughness: 0.56,
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
      x: -2.65,
      z: -1.12,
      rotY: 0.16,
      mainTitle: 'WHO DEPT. STORE',
      subTitle: 'NEEDS-A-MAWOOZIS',
      clerkColor: 0xc82848,
      shopperColor: 0x2884c8,
      registerColor: 0xc42438,
      boxPalette: [0xd42c44, 0xd4a828, 0x3298d4] as const,
    },
    {
      x: 0.0,
      z: -1.25,
      rotY: 0.03,
      mainTitle: 'TINSEL & TRIMMINGS',
      subTitle: 'WHATCH-A-MA-WHO',
      clerkColor: 0x2e9448,
      shopperColor: 0xb83894,
      registerColor: 0x2484b8,
      boxPalette: [0x8838c8, 0xd42848, 0x38b468] as const,
    },
    {
      x: 2.65,
      z: -1.12,
      rotY: -0.16,
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
      new RoundedBoxGeometry(1.92, 0.08, 0.62, 2, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x1e2432, roughness: 0.7 })
    );
    wagonCasterDeck.position.set(0, 0.04, 0);
    unit.add(wagonCasterDeck);

    // 2. Curved multi-segment Seussian counter front with recessed center arch niche
    for (const side of [-1, 1] as const) {
      const pier = new THREE.Mesh(
        new RoundedBoxGeometry(0.55, 0.76, 0.54, 3, 0.08),
        counterBlueMat
      );
      pier.position.set(side * 0.61, 0.46, 0.01);
      pier.rotation.y = side * -0.1;
      pier.castShadow = true;
      pier.receiveShadow = true;
      unit.add(pier);

      // Molded turquoise front relief panel (offset +0.04m in Z to avoid coplanarity)
      const reliefPanel = new THREE.Mesh(
        new RoundedBoxGeometry(0.41, 0.54, 0.045, 2, 0.04),
        counterTurquoiseMat
      );
      reliefPanel.position.set(side * 0.61, 0.46, 0.305);
      reliefPanel.rotation.y = side * -0.1;
      unit.add(reliefPanel);
    }

    // Center upper arch bridge of the counter
    const archBridge = new THREE.Mesh(
      new RoundedBoxGeometry(0.74, 0.28, 0.52, 2, 0.06),
      counterBlueMat
    );
    archBridge.position.set(0, 0.7, 0);
    archBridge.castShadow = true;
    unit.add(archBridge);

    // Recessed dark arched display niche in the front center of the counter
    const nicheBacking = new THREE.Mesh(
      new THREE.CylinderGeometry(0.33, 0.35, 0.5, 16, 1, false, 0, Math.PI),
      darkRecessMat
    );
    nicheBacking.rotation.x = Math.PI / 2;
    nicheBacking.position.set(0, 0.12, 0.21);
    unit.add(nicheBacking);

    // Turquoise arch molding rim around the center cutout
    const archRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.34, 0.04, 10, 20, Math.PI),
      counterTurquoiseMat
    );
    archRim.position.set(0, 0.12, 0.305);
    unit.add(archRim);

    // 3. Snowy white-ice curved counter top slab + sculpted Seussian icicle valance
    const counterTopCenter = new THREE.Mesh(
      new RoundedBoxGeometry(1.96, 0.09, 0.6, 3, 0.04),
      snowCounterTopMat
    );
    counterTopCenter.position.set(0, 0.88, 0.02);
    counterTopCenter.castShadow = true;
    counterTopCenter.receiveShadow = true;
    unit.add(counterTopCenter);

    // Sculpted Seussian snow-drip valance along the front counter edge (no ConeGeometry!)
    const counterIcicleValance = createSeussianIcicleValance(
      1.86,
      0.16,
      11,
      snowCounterTopMat,
      iceGlazeMat,
      0.045,
      bIdx + 10
    );
    counterIcicleValance.position.set(0, 0.85, 0.345);
    unit.add(counterIcicleValance);

    // Individual sculpted icicle drips at the two outer corners of the counter top
    for (const side of [-1, 1] as const) {
      const cornerDrip = createSculptedIcicleDrip(
        0.22,
        0.042,
        snowCounterTopMat,
        side * 0.025
      );
      cornerDrip.position.set(side * 0.91, 0.85, 0.31);
      unit.add(cornerDrip);
    }

    // 4. Tall red-and-white spiral candy-cane side posts + crooked lime-green Seussian branch arms
    for (const side of [-1, 1] as const) {
      const postGroup = new THREE.Group();
      postGroup.position.set(side * 0.76, 0.92, 0.05);

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

      // Side sprout arm with hanging ornament & sculpted icicle drip
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
    signGroup.position.set(0, 2.08, 0.08);
    signGroup.rotation.z = bIdx === 1 ? -0.04 : bIdx === 0 ? 0.05 : -0.05;

    const limeSignFrame = new THREE.Mesh(
      new RoundedBoxGeometry(1.68, 0.56, 0.04, 3, 0.08),
      limeFrameMat
    );
    limeSignFrame.position.set(0, 0, -0.035);
    limeSignFrame.castShadow = true;
    signGroup.add(limeSignFrame);

    for (let sc = -3; sc <= 3; sc++) {
      const scallop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.11, 0.04, 12),
        limeFrameMat
      );
      scallop.rotation.x = Math.PI / 2;
      scallop.position.set(sc * 0.22, -0.27, -0.035);
      signGroup.add(scallop);
    }

    // High-res 512×192 Seussian signboard rendered with `drawSeussianDisplayText`
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

    // Snow bolster + sculpted icicle drips hanging from top corners of the shop sign
    for (const side of [-1, 1] as const) {
      const signDrip = createSculptedIcicleDrip(
        0.19,
        0.036,
        snowCounterTopMat,
        side * 0.02
      );
      signDrip.position.set(side * 0.76, -0.24, 0.03);
      signGroup.add(signDrip);
    }

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

    // 6. Countertop Merchandise: Seussian Cash Register, Tiered Hatboxes, & Gift Stacks
    const cashRegister = createSeussianCashRegister(spec.registerColor);
    cashRegister.position.set(-0.52, 0.92, 0.02);
    cashRegister.rotation.y = 0.22;
    unit.add(cashRegister);

    const giftStackRight = createMerchandiseGiftStack(spec.boxPalette, 0xd4b828);
    giftStackRight.position.set(0.48, 0.92, 0.03);
    giftStackRight.rotation.y = -0.18;
    unit.add(giftStackRight);

    // Colorful tiered Seussian display domes/spools on counter center
    const displayColors = [0xd42838, 0xd4a824, 0x2884d4, 0x34a848];
    for (let c = 0; c < 3; c++) {
      const displayStand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.082, 0.22 + (c % 2) * 0.06, 12),
        new THREE.MeshStandardMaterial({
          color: displayColors[(bIdx + c) % displayColors.length] ?? 0xd42838,
          roughness: 0.55,
        })
      );
      displayStand.position.set(-0.14 + c * 0.18, 1.03, 0.06 + (c % 2) * 0.04);
      displayStand.rotation.z = (c - 1) * 0.08;
      displayStand.castShadow = true;
      unit.add(displayStand);
    }

    // 7. Expressive Who Store Clerk behind counter (`z = -0.58m` local) & Who Shopper in front (`z = +0.88m` local)
    const clerk = createWhoCharacter({
      heightM: 1.54,
      coatColorHex: spec.clerkColor,
      hatColorHex: 0x2e9448,
      trimColorHex: 0xd4d8de,
    });
    clerk.position.set(0.0, 0, -0.58);
    unit.add(clerk);

    const shopper = createWhoCharacter({
      heightM: 1.42,
      coatColorHex: spec.shopperColor,
      hatColorHex: 0xd42848,
      hasBraids: bIdx === 1,
      holdingGift: true,
    });
    shopper.position.set(bIdx === 2 ? -0.32 : 0.32, 0, 0.88);
    shopper.rotation.y = bIdx === 2 ? 2.85 : -2.85;
    unit.add(shopper);

    shoppingGroup.add(unit);
  }

  shoppingGroup.visible = false;
  return shoppingGroup;
}

/**
 * Helper to build the DSR Pink Whoville Round House wagon that remains onstage
 * during Scene 1F (`model_1F_mt_crumpit_sleigh.jpg` & `plan_1F_cave2_crumpit.jpg`),
 * upgraded with `createSeussianIcicleValance` and `createSculptedIcicleDrip` eaves!
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
  const iceGlazeMat = new THREE.MeshStandardMaterial({
    color: 0x86b2dc,
    roughness: 0.56,
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

  // Continuous sculpted Seussian snow-drip valance along the roof eaves (replaces ConeGeometry!)
  const eavesValance = createSeussianIcicleValance(
    widthM * 0.92,
    0.34,
    9,
    snowRoofMat,
    iceGlazeMat,
    0.055,
    17
  );
  eavesValance.position.set(0, heightM * 0.65, 0.37);
  g.add(eavesValance);

  // Additional organic fluted icicle drips flanking the eaves corners
  for (const side of [-1, 1] as const) {
    const cornerIcicle = createSculptedIcicleDrip(
      0.36,
      0.058,
      snowRoofMat,
      side * 0.035
    );
    cornerIcicle.position.set(side * (widthM * 0.45), heightM * 0.64, 0.35);
    g.add(cornerIcicle);
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
 * 2. SCENE 1F — MT. CRUMPIT SLEIGH CLIFF WAGON (`'grinch-mt-crumpit-sleigh'`)
 *
 * Recreates Scene 1F from `model_1F_mt_crumpit_sleigh.jpg` and `plan_1F_cave2_crumpit.jpg`:
 * - DSR Pink Whoville House at `x = -3.35m, z = -3.05m` (matching Scene 1B)
 * - Steep, jagged icy-blue Mt. Crumpit precipice wagon at DSL (`x = +2.35m, z = -2.25m`)
 *   with stepped rock strata, overhanging snow ledges, and sculpted `createSeussianIcicleValance`
 *   & `createSculptedIcicleDrip` icicles
 * - Tilted sleigh runners resting 100% flush on the upper snow ledge (zero floating, zero penetration)
 * - `createGrinchCharacter({ heightM: 1.82, santaDisguise: true })` and
 *   `createMaxDogCharacter({ withAntler: true })` standing firmly on horizontal snow-ledge
 *   steps of the cliff wagon with their base discs at the exact surface Y height of those ledges!
 */
export function buildGrinchMtCrumpitSleigh(
  rockTex: THREE.CanvasTexture
): THREE.Group {
  const crumpitSleighGroup = new THREE.Group();
  crumpitSleighGroup.name = 'Element_grinch-mt-crumpit-sleigh';

  // 1. DSR Pink Whoville House at x = -3.35m, z = -3.05m (matching Scene 1B)
  const dsrHouse1F = buildDsrWhovilleHouseFor1F(rockTex);
  dsrHouse1F.position.set(-3.35, 0, -3.05);
  dsrHouse1F.rotation.y = 0.18;
  crumpitSleighGroup.add(dsrHouse1F);

  // 2. Steep Jagged Icy-Blue Mt. Crumpit Precipice Wagon at DSL (x = +2.35m, z = -2.25m)
  const cliffWagon = new THREE.Group();
  cliffWagon.name = 'MtCrumpitCliffWagon';
  cliffWagon.position.set(2.35, 0, -2.25);

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

  // Rolling steel wagon base frame
  const wagonFrame = new THREE.Mesh(
    new RoundedBoxGeometry(2.85, 0.12, 1.48, 2, 0.02),
    new THREE.MeshStandardMaterial({ color: 0x202838, roughness: 0.7 })
  );
  wagonFrame.position.set(0, 0.06, 0);
  cliffWagon.add(wagonFrame);

  // Stepped jagged rock strata ascending toward the DSL precipice crest:
  // Strata #0 and #1 sit directly underneath the downstage snow steps (top Y < step top Y),
  // while Strata #2 sits in the upstage plane (z = -0.32m) supporting the summit sleigh ramp!
  const strataSpecs = [
    { x: -1.16, y: 0.34, z: 0.38, w: 0.72, h: 0.48, d: 0.58, rotZ: 0.0, mat: iceRockLowerMat },
    { x: -0.52, y: 0.50, z: 0.44, w: 0.72, h: 0.76, d: 0.58, rotZ: 0.0, mat: iceRockUpperMat },
    { x: 0.56, y: 0.96, z: -0.32, w: 1.48, h: 1.48, d: 0.72, rotZ: 0.24, mat: iceRockLowerMat },
  ] as const;

  for (let sIdx = 0; sIdx < strataSpecs.length; sIdx++) {
    const st = strataSpecs[sIdx];
    if (!st) continue;

    const rockBlock = new THREE.Mesh(
      new RoundedBoxGeometry(st.w, st.h, st.d, 3, 0.08),
      st.mat
    );
    rockBlock.position.set(st.x, st.y, st.z);
    rockBlock.rotation.z = st.rotZ;
    rockBlock.castShadow = true;
    rockBlock.receiveShadow = true;
    cliffWagon.add(rockBlock);
  }

  // Horizontal Snow-Ledge Step #1 (Lower Left Terrace for Max the Dog):
  // Centered at (x = -1.16, y = 0.62, z = 0.40), height = 0.12m -> exact top surface Y = 0.68m!
  const lowerSnowStep = new THREE.Mesh(
    new RoundedBoxGeometry(0.76, 0.12, 0.64, 2, 0.04),
    snowLedgeMat
  );
  lowerSnowStep.position.set(-1.16, 0.62, 0.40);
  lowerSnowStep.castShadow = true;
  lowerSnowStep.receiveShadow = true;
  cliffWagon.add(lowerSnowStep);

  const lowerValance = createSeussianIcicleValance(
    0.68,
    0.20,
    6,
    snowLedgeMat,
    icicleMat,
    0.04,
    31
  );
  lowerValance.position.set(-1.16, 0.56, 0.74);
  cliffWagon.add(lowerValance);

  // Horizontal Snow-Ledge Step #2 (Mid Terrace for the Grinch):
  // Centered at (x = -0.52, y = 0.94, z = 0.46), height = 0.12m -> exact top surface Y = 1.00m!
  const midSnowStep = new THREE.Mesh(
    new RoundedBoxGeometry(0.74, 0.12, 0.64, 2, 0.04),
    snowLedgeMat
  );
  midSnowStep.position.set(-0.52, 0.94, 0.46);
  midSnowStep.castShadow = true;
  midSnowStep.receiveShadow = true;
  cliffWagon.add(midSnowStep);

  const midValance = createSeussianIcicleValance(
    0.66,
    0.22,
    6,
    snowLedgeMat,
    icicleMat,
    0.04,
    37
  );
  midValance.position.set(-0.52, 0.88, 0.80);
  cliffWagon.add(midValance);

  // Upper Tilted Summit Snow Ramp Ledge (for the Grinch's Sleigh):
  // Positioned in the upstage plane (z = -0.32m, depth = 0.76m -> z ∈ [-0.70m, +0.06m])
  // so it sits cleanly behind the Grinch & Max on the downstage ledges (z >= +0.22m)!
  const sleighTiltRad = 0.24;
  const upperLedgeCenterX = 0.58;
  const upperLedgeCenterY = 1.72;
  const upperLedgeCenterZ = -0.32;
  const upperLedgeHalfThick = 0.08;

  const upperSummitLedge = new THREE.Mesh(
    new RoundedBoxGeometry(1.56, upperLedgeHalfThick * 2, 0.76, 2, 0.04),
    snowLedgeMat
  );
  upperSummitLedge.position.set(
    upperLedgeCenterX,
    upperLedgeCenterY,
    upperLedgeCenterZ
  );
  upperSummitLedge.rotation.z = sleighTiltRad;
  upperSummitLedge.castShadow = true;
  upperSummitLedge.receiveShadow = true;
  cliffWagon.add(upperSummitLedge);

  // Sculpted Seussian icicle valance + organic fluted icicle drips hanging under the summit ledge
  const summitValance = createSeussianIcicleValance(
    1.46,
    0.32,
    9,
    snowLedgeMat,
    icicleMat,
    0.045,
    43
  );
  summitValance.position.set(
    upperLedgeCenterX,
    upperLedgeCenterY - 0.04,
    upperLedgeCenterZ + 0.41
  );
  summitValance.rotation.z = sleighTiltRad;
  cliffWagon.add(summitValance);

  for (let dIdx = -2; dIdx <= 2; dIdx++) {
    const drip = createSculptedIcicleDrip(
      0.30 + (Math.abs(dIdx) % 2) * 0.08,
      0.044,
      icicleMat,
      dIdx * 0.015
    );
    const localX = dIdx * 0.3;
    drip.position.set(
      upperLedgeCenterX + localX * Math.cos(sleighTiltRad),
      upperLedgeCenterY + localX * Math.sin(sleighTiltRad) - 0.08,
      upperLedgeCenterZ + 0.38
    );
    cliffWagon.add(drip);
  }

  // Upstage technician access steps behind the cliff flat (drawn on plan_1F_cave2_crumpit.jpg)
  for (let step = 0; step < 4; step++) {
    const tread = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.05, 0.48),
      new THREE.MeshStandardMaterial({ color: 0x2c3446, roughness: 0.72 })
    );
    tread.position.set(-0.65 + step * 0.38, 0.28 + step * 0.28, -0.82);
    cliffWagon.add(tread);
  }

  // 3. The Grinch's Crooked Sleigh & Colossal Overstuffed Sack Resting Flush on the Summit Ledge!
  const sleighSurfaceX =
    upperLedgeCenterX - Math.sin(sleighTiltRad) * upperLedgeHalfThick;
  const sleighSurfaceY =
    upperLedgeCenterY + Math.cos(sleighTiltRad) * upperLedgeHalfThick;

  const sleighGroup = new THREE.Group();
  sleighGroup.name = 'GrinchPrecariousSleighAndSack';
  sleighGroup.position.set(sleighSurfaceX, sleighSurfaceY, upperLedgeCenterZ);
  sleighGroup.rotation.z = sleighTiltRad;

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

  // Curved steel runners resting flush on `y = 0` (tube radius 0.028 -> centerline at y = 0.028)
  const runnerRadius = 0.028;
  for (const rz of [-0.28, 0.28] as const) {
    const runnerCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.88, 0.28, rz),
      new THREE.Vector3(-0.96, 0.14, rz),
      new THREE.Vector3(-0.72, runnerRadius, rz),
      new THREE.Vector3(-0.35, runnerRadius, rz),
      new THREE.Vector3(0.35, runnerRadius, rz),
      new THREE.Vector3(0.72, runnerRadius + 0.02, rz),
    ]);
    const runnerMesh = new THREE.Mesh(
      new THREE.TubeGeometry(runnerCurve, 32, runnerRadius, 10, false),
      steelRunnerMat
    );
    runnerMesh.castShadow = true;
    sleighGroup.add(runnerMesh);

    // Vertical runner stanchions connecting runners to sleigh hull
    for (const sx of [-0.48, 0.0, 0.48] as const) {
      const strut = new THREE.Mesh(
        new THREE.CylinderGeometry(0.022, 0.022, 0.2, 8),
        steelRunnerMat
      );
      strut.position.set(sx, 0.12, rz);
      sleighGroup.add(strut);
    }
  }

  // Sleigh wooden deck floorboard
  const sleighFloor = new THREE.Mesh(
    new RoundedBoxGeometry(1.38, 0.06, 0.54, 2, 0.02),
    sleighWoodMat
  );
  sleighFloor.position.set(-0.04, 0.23, 0);
  sleighFloor.castShadow = true;
  sleighGroup.add(sleighFloor);

  // Crooked crimson sleigh side panels (separated in Z at ±0.29m)
  for (const side of [-1, 1] as const) {
    const sideWall = new THREE.Mesh(
      new RoundedBoxGeometry(1.32, 0.34, 0.05, 2, 0.06),
      sleighCrimsonMat
    );
    sideWall.position.set(-0.02, 0.39, side * 0.29);
    sideWall.castShadow = true;
    sleighGroup.add(sideWall);

    const scrollTrim = new THREE.Mesh(
      new RoundedBoxGeometry(1.18, 0.045, 0.02, 1, 0.01),
      goldTrimMat
    );
    scrollTrim.position.set(-0.02, 0.45, side * 0.325);
    sleighGroup.add(scrollTrim);
  }

  // Curved front dashboard & high flared back tailboard
  const dashboard = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.3, 0.58, 14, 1, false, 0, Math.PI * 0.75),
    sleighCrimsonMat
  );
  dashboard.rotation.x = Math.PI / 2;
  dashboard.rotation.z = Math.PI * 0.65;
  dashboard.position.set(-0.66, 0.43, 0);
  sleighGroup.add(dashboard);

  const tailboard = new THREE.Mesh(
    new RoundedBoxGeometry(0.12, 0.52, 0.58, 2, 0.04),
    sleighCrimsonMat
  );
  tailboard.position.set(0.64, 0.47, 0);
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
    new THREE.CylinderGeometry(0.062, 0.018, 0.11, 12, 1, true),
    goldTrimMat
  );
  hornBell.rotation.z = Math.PI / 2 + 0.2;
  hornBell.position.set(-0.96, 0.84, 0.26);
  sleighGroup.add(hornBell);

  // 4. COLOSSAL OVERSTUFFED CRIMSON SACK OF STOLEN WHOVILLE PRESENTS!
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

  // Gathered tied sack neck + flared cloth ruffle top
  const sackNeck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.36, 0.34, 16),
    sackCrimsonMat
  );
  sackNeck.position.set(0.18, 1.48, 0);
  sackNeck.rotation.z = -0.16;
  sleighGroup.add(sackNeck);

  const sackRuffle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.18, 0.26, 14),
    sackHighlightMat
  );
  sackRuffle.position.set(0.22, 1.68, 0);
  sackRuffle.rotation.z = -0.16;
  sleighGroup.add(sackRuffle);

  const ropeCinch = new THREE.Mesh(
    new THREE.TorusGeometry(0.21, 0.032, 10, 20),
    new THREE.MeshStandardMaterial({ color: 0xc49a48, roughness: 0.65 })
  );
  ropeCinch.rotation.x = Math.PI / 2;
  ropeCinch.rotation.y = -0.16;
  ropeCinch.position.set(0.2, 1.56, 0);
  sleighGroup.add(ropeCinch);

  // 5. Protruding Stolen Whoville Treasures bursting out of the top of the sack!
  const stolenTreeMat = new THREE.MeshStandardMaterial({
    color: 0x1e8a3e,
    roughness: 0.58,
  });
  for (let tier = 0; tier < 2; tier++) {
    const foliageTier = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.22 - tier * 0.06, 0.32, 10),
      stolenTreeMat
    );
    foliageTier.position.set(0.14 - tier * 0.04, 1.88 + tier * 0.18, 0.04);
    foliageTier.rotation.z = 0.24;
    sleighGroup.add(foliageTier);
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

  const stockingBoot = new THREE.Mesh(
    new RoundedBoxGeometry(0.12, 0.28, 0.06, 2, 0.02),
    new THREE.MeshStandardMaterial({ color: 0x28a448, roughness: 0.58 })
  );
  stockingBoot.position.set(-0.34, 1.24, 0.36);
  stockingBoot.rotation.z = 0.28;
  sleighGroup.add(stockingBoot);

  cliffWagon.add(sleighGroup);

  // 6. The Grinch & Max the Dog standing firmly on the horizontal snow-ledge steps
  //    with their base discs at the exact surface Y height of those ledges (zero clipping!)
  const grinch = createGrinchCharacter({
    heightM: 1.82,
    santaDisguise: true,
  });
  // Mid snow step top surface is at `y = 1.00m` (`x = -0.52, z = 0.46`)
  grinch.position.set(-0.52, 1.0, 0.46);
  grinch.rotation.y = 0.32;
  cliffWagon.add(grinch);

  const maxDog = createMaxDogCharacter({
    withAntler: true,
  });
  // Lower snow step top surface is at `y = 0.68m` (`x = -1.16, z = 0.40`)
  maxDog.position.set(-1.16, 0.68, 0.4);
  maxDog.rotation.y = -0.35;
  cliffWagon.add(maxDog);

  crumpitSleighGroup.add(cliffWagon);

  crumpitSleighGroup.visible = false;
  return crumpitSleighGroup;
}

/**
 * 3. SCENE 1G — FINALE CHRISTMAS FEAST IN WHOVILLE (`'grinch-finale-banquet'`)
 *
 * Recreates the curved Whoville Feast Banquet Table (`width = 4.5m`) positioned downstage at
 * `x = 0.0m, z = -1.18m` (gently curving only `0.42m` in Z so `z ∈ [-1.60m, -0.95m]`),
 * completely clear of the Center Whoville Christmas Tree Turntable (`z = -3.55m`, front edge `-2.40m`)
 * and the Pink Whoville Houses (`z <= -2.45m`).
 * Populated with `createGrinchCharacter({ heightM: 1.82, santaDisguise: true, carvingKnife: true })`
 * at `(0, 0, -1.78)`, flanked by `createWhoCharacter` figures (Cindy-Lou Who, Papa Who, Mama Who,
 * Grandpa Who) and `createMaxDogCharacter({ withAntler: false, sitting: true })` at `(2.45, 0, -1.15)`.
 */
export function buildGrinchFinaleBanquet(): THREE.Group {
  const finaleBanquetGroup = new THREE.Group();
  finaleBanquetGroup.name = 'Element_grinch-finale-banquet';

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

  // 1. Multi-segment curved Banquet Table Arc positioned downstage at `x = 0.0m, z = -1.18m`
  //    Width = 4.5m (`x ∈ [-2.25m, +2.25m]`), gently curving 0.42m in Z so `z ∈ [-1.60m, -0.95m]`!
  const tableArcGroup = new THREE.Group();
  tableArcGroup.name = 'WhovilleFeastBanquetTableArc';
  finaleBanquetGroup.add(tableArcGroup);

  const segmentCount = 12;
  const totalWidthM = 4.5;
  const curveDepthM = 0.22; // Centerline z goes from -1.15m at x=0 to -1.37m at x=±2.06m -> total Z bounds [-1.60m, -0.95m]

  for (let i = 0; i < segmentCount; i++) {
    const u = (i + 0.5) / segmentCount - 0.5; // -0.4583 .. +0.4583
    const normU = u * 2.0; // -0.916 .. +0.916
    const segX = u * (totalWidthM - 0.38);
    const segZ = -1.15 - normU * normU * curveDepthM;
    const tangentAngle = Math.atan2(2 * normU * curveDepthM, totalWidthM * 0.5) * 0.65;

    const segGroup = new THREE.Group();
    segGroup.position.set(segX, 0, segZ);
    segGroup.rotation.y = u < 0 ? -tangentAngle : tangentAngle;

    // Royal-blue lower table apron column (depth 0.40m -> z_local ∈ [-0.20, +0.20])
    const blueBaseBlock = new THREE.Mesh(
      new RoundedBoxGeometry(0.42, 0.72, 0.4, 2, 0.04),
      royalBlueArchMat
    );
    blueBaseBlock.position.set(0, 0.36, 0);
    blueBaseBlock.castShadow = true;
    blueBaseBlock.receiveShadow = true;
    segGroup.add(blueBaseBlock);

    // 4 Sculpted Arched Cutouts along the front face (matching model_1G_finale.jpg!)
    if (i % 3 === 1) {
      const archRecess = new THREE.Mesh(
        new THREE.CylinderGeometry(0.21, 0.23, 0.34, 14, 1, false, 0, Math.PI),
        deepBlueShadowMat
      );
      archRecess.rotation.x = Math.PI / 2;
      archRecess.position.set(0, 0.02, 0.18);
      segGroup.add(archRecess);

      const archTrim = new THREE.Mesh(
        new THREE.TorusGeometry(0.21, 0.024, 8, 16, Math.PI),
        goldFestoonMat
      );
      archTrim.position.set(0, 0.08, 0.235);
      segGroup.add(archTrim);
    }

    // White scalloped overhanging tablecloth top slab (`color: 0xcfd4d8, roughness: 0.58`)
    const clothTop = new THREE.Mesh(
      new RoundedBoxGeometry(0.45, 0.09, 0.44, 2, 0.03),
      whiteTableclothMat
    );
    clothTop.position.set(0, 0.76, 0);
    clothTop.castShadow = true;
    clothTop.receiveShadow = true;
    segGroup.add(clothTop);

    // Scalloped front tablecloth skirt overhang (offset at z = +0.245m)
    const scallopDrop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.19, 0.16, 0.13, 12),
      whiteTableclothMat
    );
    scallopDrop.rotation.x = Math.PI / 2;
    scallopDrop.scale.set(1.0, 0.26, 0.65);
    scallopDrop.position.set(0, 0.68, 0.245);
    segGroup.add(scallopDrop);

    // Royal-blue & gold festooned swags with red bows along the front skirt (offset at z = +0.28m)
    const swagCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.19, 0.68, 0.28),
      new THREE.Vector3(0, 0.57, 0.29),
      new THREE.Vector3(0.19, 0.68, 0.28),
    ]);
    const goldSwag = new THREE.Mesh(
      new THREE.TubeGeometry(swagCurve, 14, 0.016, 8, false),
      goldFestoonMat
    );
    segGroup.add(goldSwag);

    const redBow = new THREE.Mesh(
      new RoundedBoxGeometry(0.08, 0.055, 0.028, 1, 0.01),
      crimsonBowMat
    );
    redBow.position.set(-0.19, 0.69, 0.315);
    segGroup.add(redBow);

    // Festive pine garland runner + golden goblets on top of the banquet table
    const garlandCluster = new THREE.Mesh(
      new RoundedBoxGeometry(0.4, 0.05, 0.08, 2, 0.02),
      pineGarlandMat
    );
    garlandCluster.position.set(0, 0.83, 0.1);
    segGroup.add(garlandCluster);

    if (i % 2 === 0) {
      const goblet = new THREE.Group();
      goblet.position.set(0.06, 0.81, -0.05);
      const cup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.032, 0.012, 0.085, 10),
        goldFestoonMat
      );
      cup.position.y = 0.045;
      goblet.add(cup);
      segGroup.add(goblet);
    }

    tableArcGroup.add(segGroup);
  }

  // 2. Centerpiece: Grand Silver Domed Roast Beast Carving Platter at Center of Table (`x = 0, y = 0.81, z = -1.15`)
  const roastBeastGroup = new THREE.Group();
  roastBeastGroup.name = 'RoastBeastCarvingPlatter';
  roastBeastGroup.position.set(0, 0.81, -1.15);

  const silverTray = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.28, 0.04, 24),
    silverPlatterMat
  );
  silverTray.scale.set(1.3, 1.0, 0.72);
  silverTray.position.set(0, 0.02, 0);
  roastBeastGroup.add(silverTray);

  const roastHaunch = new THREE.Mesh(
    new THREE.SphereGeometry(0.19, 18, 14),
    roastBeastMat
  );
  roastHaunch.scale.set(1.32, 0.82, 0.85);
  roastHaunch.position.set(-0.03, 0.15, 0);
  roastHaunch.castShadow = true;
  roastBeastGroup.add(roastHaunch);

  for (const bz of [-0.06, 0.06] as const) {
    const boneFrill = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.016, 0.14, 8),
      whiteTableclothMat
    );
    boneFrill.rotation.z = Math.PI / 2 - 0.25;
    boneFrill.position.set(0.23, 0.18, bz);
    roastBeastGroup.add(boneFrill);
  }

  const silverCloche = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.5),
    silverPlatterMat
  );
  silverCloche.scale.set(1.25, 0.92, 0.78);
  silverCloche.position.set(-0.16, 0.26, -0.04);
  silverCloche.rotation.z = 0.52;
  silverCloche.castShadow = true;
  roastBeastGroup.add(silverCloche);

  finaleBanquetGroup.add(roastBeastGroup);

  // 3. Tiered Seussian Who-Pudding Stands & Golden Candelabras along the banquet arc
  for (const side of [-1, 1] as const) {
    const puddingStand = new THREE.Group();
    puddingStand.position.set(side * 0.88, 0.81, -1.2);

    const standStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.055, 0.26, 12),
      silverPlatterMat
    );
    standStem.position.y = 0.13;
    puddingStand.add(standStem);

    for (let tier = 0; tier < 2; tier++) {
      const plate = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16 - tier * 0.04, 0.14 - tier * 0.04, 0.02, 16),
        silverPlatterMat
      );
      plate.position.y = 0.11 + tier * 0.13;
      puddingStand.add(plate);

      const puddingCake = new THREE.Mesh(
        new THREE.SphereGeometry(0.1 - tier * 0.028, 14, 10),
        new THREE.MeshStandardMaterial({
          color: tier === 0 ? 0xc84878 : 0xd49838,
          roughness: 0.55,
        })
      );
      puddingCake.scale.set(1.0, 0.72, 1.0);
      puddingCake.position.y = 0.16 + tier * 0.13;
      puddingStand.add(puddingCake);
    }
    finaleBanquetGroup.add(puddingStand);

    const candelabra = new THREE.Group();
    candelabra.position.set(side * 1.62, 0.81, -1.29);

    const candBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.065, 0.24, 12),
      goldFestoonMat
    );
    candBase.position.y = 0.12;
    candelabra.add(candBase);

    for (const cx of [-0.075, 0, 0.075] as const) {
      const candle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.013, 0.013, 0.13, 8),
        whiteTableclothMat
      );
      candle.position.set(cx, 0.26 + (cx === 0 ? 0.035 : 0), 0);
      candelabra.add(candle);

      const flame = new THREE.Mesh(
        new THREE.SphereGeometry(0.018, 8, 8),
        new THREE.MeshStandardMaterial({
          color: 0xd8b838,
          emissive: 0xd88818,
          emissiveIntensity: 0.9,
          roughness: 0.55,
        })
      );
      flame.scale.set(0.75, 1.6, 0.75);
      flame.position.set(cx, 0.345 + (cx === 0 ? 0.035 : 0), 0);
      candelabra.add(flame);
    }
    finaleBanquetGroup.add(candelabra);
  }

  // 4. Transformed Grinch at Center-Back `(0, 0, -1.78)` + Who Family & Max in Open Floor Space!
  const redeemedGrinch = createGrinchCharacter({
    heightM: 1.82,
    santaDisguise: true,
    carvingKnife: true,
  });
  redeemedGrinch.position.set(0, 0, -1.78);
  finaleBanquetGroup.add(redeemedGrinch);

  // Cindy-Lou Who, Papa Who, Mama Who, and Grandpa Who standing behind/beside the banquet table
  // with zero clipping into the tablecloth (`z <= -1.60m` or `|x| >= 2.35m`) and well clear of the tree (`z = -2.40m`)
  const cindyLou = createWhoCharacter({
    heightM: 1.14,
    coatColorHex: 0xd44888,
    hairColorHex: 0xd8b438,
    hasBraids: true,
  });
  cindyLou.position.set(0.64, 0, -1.8);
  cindyLou.rotation.y = -0.14;
  finaleBanquetGroup.add(cindyLou);

  const papaWho = createWhoCharacter({
    heightM: 1.66,
    coatColorHex: 0x2878c8,
    hatColorHex: 0xd4a828,
  });
  papaWho.position.set(-0.68, 0, -1.82);
  papaWho.rotation.y = 0.16;
  finaleBanquetGroup.add(papaWho);

  const mamaWho = createWhoCharacter({
    heightM: 1.56,
    coatColorHex: 0xc82848,
    hairColorHex: 0xd48428,
    hasBraids: true,
  });
  mamaWho.position.set(-1.38, 0, -1.88);
  mamaWho.rotation.y = 0.26;
  finaleBanquetGroup.add(mamaWho);

  const grandpaWho = createWhoCharacter({
    heightM: 1.6,
    coatColorHex: 0x2e9448,
    hatColorHex: 0xc82238,
    hairColorHex: 0xcfd4d8,
  });
  grandpaWho.position.set(1.38, 0, -1.88);
  grandpaWho.rotation.y = -0.26;
  finaleBanquetGroup.add(grandpaWho);

  // Additional Who townspeople flanking the outer left & right ends of the banquet arc
  const outerLeftWho = createWhoCharacter({
    heightM: 1.48,
    coatColorHex: 0x8e38b8,
    hatColorHex: 0xd4a828,
  });
  outerLeftWho.position.set(-2.52, 0, -1.32);
  outerLeftWho.rotation.y = 0.55;
  finaleBanquetGroup.add(outerLeftWho);

  // Max the Dog sitting happily at `(2.45, 0, -1.15)` in open floor space at the right end of the feast
  const feastMax = createMaxDogCharacter({
    withAntler: false,
    sitting: true,
  });
  feastMax.position.set(2.45, 0, -1.15);
  feastMax.rotation.y = -0.58;
  finaleBanquetGroup.add(feastMax);

  finaleBanquetGroup.visible = false;
  return finaleBanquetGroup;
}

/**
 * Helper to create a raised backstage spike-tape rectangle outline (`y = 0.038m` so it is
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
  const yPos = 0.038;

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
      new THREE.BoxGeometry(
        stripThickness,
        stripHeight,
        depthM - stripThickness * 2
      ),
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

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.022, 1.95, 10),
    blackSteelMat
  );
  pole.position.set(0, 1.02, 0);
  stand.add(pole);

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

  // A. UPSTAGE RIGHT (USR) WING STORAGE BAYS
  const usrFridgeBay = new THREE.Group();
  usrFridgeBay.position.set(-5.85, 0, -7.65);

  const fridgeSpike = createSpikeTapeOutlineBay(1.35, 0.95, 0xd4b828);
  usrFridgeBay.add(fridgeSpike);

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
    new THREE.CylinderGeometry(0.05, 0.34, 1.45, 10),
    new THREE.MeshStandardMaterial({ color: 0x1e843e, roughness: 0.6 })
  );
  spareTree.position.y = 0.84;
  spareTree.rotation.z = -0.12;
  ovalTreeProp.add(spareTree);
  usrFridgeBay.add(ovalTreeProp);

  offstageStorageGroup.add(usrFridgeBay);

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

  // B. STAGE LEFT (SL) WING STORAGE BAYS
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

  const uslCurvedCounterParked = new THREE.Mesh(
    new RoundedBoxGeometry(1.42, 0.82, 0.56, 3, 0.08),
    royalBluePropMat
  );
  uslCurvedCounterParked.position.set(-1.35, 0.45, -0.92);
  uslCurvedCounterParked.rotation.y = -0.25;
  ulFireplaceBay.add(uslCurvedCounterParked);

  offstageStorageGroup.add(ulFireplaceBay);

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

  // C. BACKSTAGE WORK-LIGHT STANDS
  const usrWorkLight = createBackstageWorkLightStand();
  usrWorkLight.position.set(-6.85, 0, -6.45);
  offstageStorageGroup.add(usrWorkLight);

  const slWorkLight = createBackstageWorkLightStand();
  slWorkLight.position.set(7.25, 0, -5.25);
  offstageStorageGroup.add(slWorkLight);

  offstageStorageGroup.visible = true;
  return offstageStorageGroup;
}
