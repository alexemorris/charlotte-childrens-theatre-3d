import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {
  createProsceniumCheckerTexture,
  createQuiltedDiamondTexture,
  drawSeussianDisplayText,
} from '../engine/procedural-textures.ts';
import { PROSCENIUM_HEIGHT_M, PROSCENIUM_WIDTH_M } from '../theatre/seating-layout.ts';
import { createHumanScaleFigure } from './shared-scenic-helpers.ts';
import type { ProductionSetBuilderContext, ProductionSetModule } from './types.ts';

/**
 * Generates a whimsical oversized Wonderland pocket-watch clock face texture
 * using bold display typography and ornamental vector hands.
 */
function createWonderlandPocketWatchTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const bg = ctx.createRadialGradient(128, 128, 12, 128, 128, 122);
    bg.addColorStop(0, '#fffdf4');
    bg.addColorStop(0.75, '#f8ecc8');
    bg.addColorStop(1, '#e2c478');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = '#c89628';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(128, 128, 118, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#221832';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(128, 128, 102, 0, Math.PI * 2);
    ctx.stroke();

    // Whimsical display hour numerals around the dial
    const numerals = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
    ctx.fillStyle = '#241438';
    ctx.font = '900 22px "Fredoka", "Luckiest Guy", "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    numerals.forEach((num, idx) => {
      const ang = (idx / 12) * Math.PI * 2 - Math.PI / 2;
      const nx = 128 + Math.cos(ang) * 82;
      const ny = 128 + Math.sin(ang) * 82;
      ctx.fillText(num, nx, ny);
    });

    drawSeussianDisplayText(ctx, 'TEA TIME', 128, 92, {
      fontSize: 16,
      fillTopColor: '#ff4081',
      fillBottomColor: '#b81448',
      outlineColor: '#1e1028',
      bounceAmp: 1.2,
      tiltAmp: 0.06,
      letterSpacing: 10,
    });

    // Perpetual 6 o'clock Tea-Time ornate hands
    ctx.strokeStyle = '#1a1228';
    ctx.lineCap = 'round';
    ctx.lineWidth = 6.5;
    ctx.beginPath();
    ctx.moveTo(128, 128);
    ctx.lineTo(128, 184); // Hour hand at 6
    ctx.stroke();

    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(128, 128);
    ctx.lineTo(128, 50); // Minute hand at 12
    ctx.stroke();

    ctx.fillStyle = '#d41e36';
    ctx.beginPath();
    ctx.arc(128, 128, 8.5, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates the Mad Hatter's iconic "IN THIS STYLE 10/6" hatband price tag texture
 * using bold custom Seussian/Wonderland display typography.
 */
function createHatterPriceCardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#fbf6e6';
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = '#24182e';
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, 240, 240);

    drawSeussianDisplayText(ctx, '10/6', 128, 138, {
      fontSize: 82,
      fillTopColor: '#2c1838',
      fillBottomColor: '#140a1c',
      bevelHighlightColor: 'rgba(255, 240, 200, 0.45)',
      outlineColor: '#fbf6e6',
      shadowColor: '#c8b898',
      bounceAmp: 3,
      tiltAmp: 0.08,
      letterSpacing: 46,
    });
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Builds a curved S-shaped Wonderland cabriole leg with a ball foot and gold ankle ring.
 */
function buildCabrioleLeg(
  heightM: number,
  woodMat: THREE.Material,
  goldMat: THREE.Material
): THREE.Group {
  const legGroup = new THREE.Group();

  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.03, 0),
    new THREE.Vector3(0.035, heightM * 0.32, 0.035),
    new THREE.Vector3(-0.025, heightM * 0.72, -0.02),
    new THREE.Vector3(0, heightM, 0),
  ]);
  const legTube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 12, 0.026, 8, false),
    woodMat
  );
  legTube.castShadow = true;
  legGroup.add(legTube);

  const footBall = new THREE.Mesh(
    new THREE.SphereGeometry(0.034, 10, 8),
    goldMat
  );
  footBall.position.set(0, 0.03, 0);
  legGroup.add(footBall);

  return legGroup;
}

/**
 * Builds a whimsical tilted porcelain teapot using LatheGeometry for the bellied body,
 * plus curved S-spout, C-handle, and domed finial lid.
 */
function buildWhimsicalTeapot(
  colorHex: number,
  goldMat: THREE.Material,
  tiltZ: number
): THREE.Group {
  const potGroup = new THREE.Group();
  potGroup.rotation.z = tiltZ;

  const porcelainMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    roughness: 0.22,
    metalness: 0.12,
  });

  // Lathe profile for a plump Wonderland teapot body
  const points: THREE.Vector2[] = [
    new THREE.Vector2(0.001, 0.0),
    new THREE.Vector2(0.065, 0.0),
    new THREE.Vector2(0.115, 0.06),
    new THREE.Vector2(0.125, 0.12),
    new THREE.Vector2(0.085, 0.19),
    new THREE.Vector2(0.062, 0.21),
  ];
  const body = new THREE.Mesh(
    new THREE.LatheGeometry(points, 16),
    porcelainMat
  );
  body.castShadow = true;
  potGroup.add(body);

  // Gold belly band (stepped +0.01m proud of max radius)
  const goldBand = new THREE.Mesh(
    new THREE.TorusGeometry(0.126, 0.008, 8, 18),
    goldMat
  );
  goldBand.rotation.x = Math.PI / 2;
  goldBand.position.y = 0.11;
  potGroup.add(goldBand);

  // Domed lid & gold finial
  const lid = new THREE.Mesh(
    new THREE.SphereGeometry(0.064, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
    porcelainMat
  );
  lid.position.y = 0.20;
  potGroup.add(lid);

  const finial = new THREE.Mesh(
    new THREE.SphereGeometry(0.018, 8, 8),
    goldMat
  );
  finial.position.y = 0.27;
  potGroup.add(finial);

  // Curved S-shaped pouring spout
  const spoutCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.095, 0.08, 0),
    new THREE.Vector3(0.165, 0.13, 0),
    new THREE.Vector3(0.185, 0.22, 0),
    new THREE.Vector3(0.215, 0.24, 0),
  ]);
  const spout = new THREE.Mesh(
    new THREE.TubeGeometry(spoutCurve, 10, 0.018, 8, false),
    porcelainMat
  );
  potGroup.add(spout);

  // Curved C-shaped ear handle
  const handleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.085, 0.18, 0),
    new THREE.Vector3(-0.165, 0.17, 0),
    new THREE.Vector3(-0.165, 0.07, 0),
    new THREE.Vector3(-0.095, 0.05, 0),
  ]);
  const handle = new THREE.Mesh(
    new THREE.TubeGeometry(handleCurve, 10, 0.014, 8, false),
    goldMat
  );
  potGroup.add(handle);

  return potGroup;
}

/**
 * Builds a multi-tiered crooked Unbirthday cake on a pedestal stand topped with glowing candles.
 */
function buildCrookedUnbirthdayCake(
  tierColors: readonly [number, number, number],
  goldMat: THREE.Material
): THREE.Group {
  const cakeGroup = new THREE.Group();
  const creamMat = new THREE.MeshStandardMaterial({ color: 0xfff8ee, roughness: 0.4 });

  // Silver/gold cake pedestal stand
  const standBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.12, 0.08, 14),
    goldMat
  );
  standBase.position.y = 0.04;
  cakeGroup.add(standBase);

  const platter = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.20, 0.022, 18),
    goldMat
  );
  platter.position.y = 0.09;
  cakeGroup.add(platter);

  // 3 crooked tiers stacked at opposing jaunt angles
  const tierSpecs = [
    { r: 0.17, h: 0.12, y: 0.16, rotZ: 0.09, col: tierColors[0] },
    { r: 0.125, h: 0.11, y: 0.27, rotZ: -0.14, col: tierColors[1] },
    { r: 0.085, h: 0.10, y: 0.37, rotZ: 0.16, col: tierColors[2] },
  ] as const;

  for (const t of tierSpecs) {
    const tierMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(t.r * 0.95, t.r, t.h, 16),
      new THREE.MeshStandardMaterial({ color: t.col, roughness: 0.38 })
    );
    tierMesh.position.y = t.y;
    tierMesh.rotation.z = t.rotZ;
    tierMesh.castShadow = true;
    cakeGroup.add(tierMesh);

    // Whipped-cream icing ring at top of tier
    const icingRing = new THREE.Mesh(
      new THREE.TorusGeometry(t.r * 0.94, 0.014, 8, 16),
      creamMat
    );
    icingRing.rotation.x = Math.PI / 2;
    icingRing.rotation.y = t.rotZ;
    icingRing.position.y = t.y + t.h / 2;
    cakeGroup.add(icingRing);
  }

  // 3 crooked birthday candles with glowing golden flames on the top tier
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xffd54f, toneMapped: false });
  for (const [cx, cz, tilt] of [
    [-0.035, 0.02, 0.18],
    [0.0, -0.025, -0.12],
    [0.038, 0.015, -0.22],
  ] as const) {
    const candle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.085, 8),
      creamMat
    );
    candle.position.set(cx, 0.455, cz);
    candle.rotation.z = tilt;
    cakeGroup.add(candle);

    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.014, 0.036, 8),
      flameMat
    );
    flame.position.set(cx - Math.sin(tilt) * 0.045, 0.51, cz);
    cakeGroup.add(flame);
  }

  return cakeGroup;
}

/**
 * Helper to create a curved padded armrest tube at a given X offset.
 */
function createArmrestTubeGeometry(xOffset: number): THREE.TubeGeometry {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(xOffset, 0.68, -0.20),
    new THREE.Vector3(xOffset * 1.08, 0.72, 0.0),
    new THREE.Vector3(xOffset * 1.04, 0.66, 0.20),
    new THREE.Vector3(xOffset, 0.48, 0.21),
  ]);
  return new THREE.TubeGeometry(curve, 12, 0.038, 8, false);
}

/**
 * Builds a mismatched crooked Wonderland chair (either the Mad Hatter's towering high-back
 * velvet throne armchair or one of the 4 quirky tea-party guest chairs).
 */
function buildWonderlandChair(
  backHeightM: number,
  upholsteryHex: number,
  frameHex: number,
  goldMat: THREE.Material,
  isWingbackThrone: boolean,
  crookedTiltZ: number
): THREE.Group {
  const chair = new THREE.Group();

  const fabricMat = new THREE.MeshStandardMaterial({
    color: upholsteryHex,
    roughness: 0.62,
    metalness: 0.08,
  });
  const frameMat = new THREE.MeshStandardMaterial({
    color: frameHex,
    roughness: 0.45,
    metalness: 0.15,
  });

  // 4 curved cabriole legs
  const legW = isWingbackThrone ? 0.26 : 0.20;
  for (const lx of [-legW, legW]) {
    for (const lz of [-0.20, 0.20]) {
      const leg = buildCabrioleLeg(0.44, frameMat, goldMat);
      leg.position.set(lx, 0, lz);
      chair.add(leg);
    }
  }

  // Plush cushioned seat (y = 0.46m)
  const seatW = isWingbackThrone ? 0.64 : 0.48;
  const seat = new THREE.Mesh(
    new RoundedBoxGeometry(seatW, 0.09, 0.48, 2, 0.025),
    fabricMat
  );
  seat.position.set(0, 0.46, 0);
  seat.castShadow = true;
  chair.add(seat);

  // Crooked backrest assembly
  const backGroup = new THREE.Group();
  backGroup.position.set(0, 0.50, -0.21);
  backGroup.rotation.z = crookedTiltZ;
  backGroup.rotation.x = -0.08;

  const backCushion = new THREE.Mesh(
    new RoundedBoxGeometry(seatW * 0.92, backHeightM, 0.08, 2, 0.025),
    fabricMat
  );
  backCushion.position.set(0, backHeightM / 2, 0);
  backCushion.castShadow = true;
  backGroup.add(backCushion);

  // Carved wooden side stiles & scrolled crest rail (stepped cleanly outside cushion)
  for (const sx of [-seatW * 0.48, seatW * 0.48]) {
    const stile = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.022, backHeightM + 0.12, 10),
      frameMat
    );
    stile.position.set(sx, backHeightM / 2 + 0.04, 0);
    backGroup.add(stile);

    const finial = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 10, 8),
      goldMat
    );
    finial.position.set(sx, backHeightM + 0.12, 0);
    backGroup.add(finial);
  }

  const topCrest = new THREE.Mesh(
    new RoundedBoxGeometry(seatW * 1.06, 0.12, 0.11, 2, 0.03),
    frameMat
  );
  topCrest.position.set(0, backHeightM + 0.04, 0);
  backGroup.add(topCrest);

  if (isWingbackThrone) {
    // Wingback side cheek scrolls & rolled velvet armrests for the Mad Hatter's throne
    for (const wx of [-0.32, 0.32]) {
      const wing = new THREE.Mesh(
        new RoundedBoxGeometry(0.08, backHeightM * 0.65, 0.26, 2, 0.02),
        fabricMat
      );
      wing.position.set(wx, backHeightM * 0.62, 0.11);
      wing.rotation.y = wx < 0 ? 0.22 : -0.22;
      backGroup.add(wing);

      const armrest = new THREE.Mesh(
        createArmrestTubeGeometry(wx),
        fabricMat
      );
      chair.add(armrest);
    }

    // Gold diamond tufting buttons on the throne back (stepped +0.055m forward of cushion center)
    for (const ty of [0.32, 0.64, 0.96, 1.24]) {
      for (const tx of [-0.12, 0.12]) {
        const button = new THREE.Mesh(
          new THREE.SphereGeometry(0.018, 8, 8),
          goldMat
        );
        button.position.set(tx, ty, 0.055);
        backGroup.add(button);
      }
    }
  }

  chair.add(backGroup);
  return chair;
}

/**
 * Builds an oversized sculpted golden curtain tassel using LatheGeometry.
 */
function buildSculptedGoldTassel(goldMat: THREE.Material): THREE.Group {
  const tassel = new THREE.Group();

  const profile: THREE.Vector2[] = [
    new THREE.Vector2(0.02, 0.42),
    new THREE.Vector2(0.075, 0.36),
    new THREE.Vector2(0.05, 0.29),
    new THREE.Vector2(0.085, 0.25),
    new THREE.Vector2(0.135, 0.04),
    new THREE.Vector2(0.11, 0.0),
    new THREE.Vector2(0.001, 0.0),
  ];
  const body = new THREE.Mesh(
    new THREE.LatheGeometry(profile, 18),
    goldMat
  );
  body.position.y = -0.21;
  body.castShadow = true;
  tassel.add(body);

  return tassel;
}

export const aliceInWonderlandSet: ProductionSetModule = {
  spec: {
    id: 'alice-in-wonderland',
    title: 'Alice in Wonderland',
    subtitle: "Mad Hatter's Tea Party (Reference Photo Set)",
    playwrightOrComposer: 'Adapted from Lewis Carroll · McColl Mainstage',
    ageRecommendation: 'Ages 5+ · Family Mainstage',
    description:
      'Recreated directly from the McColl Family Theatre reference photograph: postmodern geometric proscenium frieze with racing-checker fan and quilted diamond relief, forced-perspective gothic stained-glass window with pointed lancet arch tracery and multi-swag crimson velvet drapery, radiating geometric stage floor, and the Mad Hatter banquet table with crooked chairs, Unbirthday cakes, teapots, giant pocket watch, and overhead paper lanterns.',
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
        dimensionsLabel: '6.8m W × 6.5m H Lancet Tracery + Multi-Swag',
      },
      {
        id: 'alice-tea-table',
        name: "Mad Hatter's Banquet Table & Tea Service",
        category: 'furniture',
        defaultVisible: true,
        dimensionsLabel: '2.9m W Table + 5 Crooked Chairs + Cakes & Lanterns',
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
          'Alice tumbles onto the radiating geometric ray floor cloth framed by the postmodern checkerboard proscenium frieze as the gothic lancet stained-glass window descends from the fly tower.',
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
          'Full reference photo configuration: Postmodern proscenium frieze with racing-checker fan, forced-perspective gothic stained-glass window with pointed lancet tracery & crimson velvet swag curtain in-trim, radiating geometric stage floor, and the Mad Hatter banquet table with crooked chairs, Unbirthday cakes, teapots, giant pocket watch, and overhead lanterns.',
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

    // ========================================================================
    // 1. FORCED-PERSPECTIVE GOTHIC STAINED-GLASS WINDOW, LANCET ARCH TRACERY,
    //    LEAD CAME MULLIONS & MULTI-SWAG CRIMSON VELVET DRAPERY ('alice-window-backdrop')
    // ========================================================================
    const aliceWindowGroup = new THREE.Group();
    aliceWindowGroup.position.set(0.35, 0, -4.65);
    aliceWindowGroup.rotation.y = -0.18; // Angled just like in photo stage_proscenium_alice.jpg
    aliceGroup.add(aliceWindowGroup);
    registerElement('alice-window-backdrop', aliceWindowGroup, 3);

    // Raked sub-container tilted by -0.09 rad so all internal Z planes are strictly parallel and non-coplanar
    const rakedWindowFrame = new THREE.Group();
    rakedWindowFrame.position.set(0, 3.35, 0);
    rakedWindowFrame.rotation.z = -0.09;
    aliceWindowGroup.add(rakedWindowFrame);

    const purpleFrameMat = new THREE.MeshStandardMaterial({
      color: 0x4b3869,
      roughness: 0.52,
      metalness: 0.12,
    });
    const deepJambMat = new THREE.MeshStandardMaterial({
      color: 0x35254d,
      roughness: 0.58,
      metalness: 0.1,
    });
    const leadCameMat = new THREE.MeshStandardMaterial({
      color: 0x86789e,
      roughness: 0.42,
      metalness: 0.35,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf5c438,
      roughness: 0.28,
      metalness: 0.76,
    });

    // 1a. Back shadowbox backing (z ∈ [-0.22, -0.08])
    const winFrameBack = new THREE.Mesh(
      new THREE.BoxGeometry(6.64, 6.18, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x161024, roughness: 0.85 })
    );
    winFrameBack.position.set(0, 0, -0.15);
    rakedWindowFrame.add(winFrameBack);

    // 1b. Glowing Stained-Glass Panes (z ∈ [-0.03, +0.03]) + Radiating Sunburst Rays from Upper-Left
    const paneColors = [
      0x4e2d6e, 0x8e4466, 0xd48838, 0x8a2846, 0x342454,
      0x342c5c, 0x6c3264, 0xb2544c, 0x762b4c, 0x3e2d5c,
      0x36285e, 0x563268, 0x86425c, 0x964c4c, 0x4c3a64,
      0x48386c, 0x6c4c72, 0x9c727a, 0xc2a2a6, 0xe0d2d4,
    ];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 5; c++) {
        const colHex = paneColors[r * 5 + c] ?? 0x483566;
        const paneMat = new THREE.MeshStandardMaterial({
          color: colHex,
          emissive: colHex,
          emissiveIntensity: 0.52,
          roughness: 0.28,
        });
        const pane = new THREE.Mesh(
          new THREE.BoxGeometry(1.14, 1.26, 0.06),
          paneMat
        );
        const lx = (c - 2) * 1.22;
        const ly = 1.82 - r * 1.34;
        pane.position.set(lx, ly, 0.0);
        rakedWindowFrame.add(pane);
      }
    }

    // 1c. Decorative Lead Came Mullions & Transoms (stepped at z = +0.065m, front at +0.085m)
    for (let c = -2; c <= 2; c++) {
      const mullion = new THREE.Mesh(
        new THREE.BoxGeometry(0.065, 5.52, 0.04),
        leadCameMat
      );
      mullion.position.set(c * 1.22 - 0.61, -0.18, 0.065);
      rakedWindowFrame.add(mullion);
    }
    for (let r = -1; r <= 2; r++) {
      const transom = new THREE.Mesh(
        new THREE.BoxGeometry(6.24, 0.065, 0.04),
        leadCameMat
      );
      transom.position.set(0, r * 1.34 - 0.19, 0.065);
      rakedWindowFrame.add(transom);
    }

    // Radiating Gothic Sunburst Tracery Spokes emanating from upper-left window quadrant (matching photo!)
    for (let ray = 0; ray < 7; ray++) {
      const angle = -0.12 - ray * 0.22;
      const spoke = new THREE.Mesh(
        new THREE.BoxGeometry(2.65, 0.036, 0.03),
        leadCameMat
      );
      spoke.position.set(
        -1.22 + Math.cos(angle) * 1.25,
        1.82 + Math.sin(angle) * 1.25,
        0.105 // Stepped +0.04m in front of vertical/horizontal mullions
      );
      spoke.rotation.z = angle;
      rakedWindowFrame.add(spoke);
    }

    // 1d. Pointed Gothic Lancet Arch Tracery & Rose Medallions at Top of Window
    for (const lx of [-1.82, -0.61, 0.61]) {
      const lancetCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(lx - 0.56, 1.85, 0.115),
        new THREE.Vector3(lx - 0.36, 2.38, 0.115),
        new THREE.Vector3(lx, 2.68, 0.115),
        new THREE.Vector3(lx + 0.36, 2.38, 0.115),
        new THREE.Vector3(lx + 0.56, 1.85, 0.115),
      ]);
      const lancetArch = new THREE.Mesh(
        new THREE.TubeGeometry(lancetCurve, 16, 0.036, 8, false),
        purpleFrameMat
      );
      rakedWindowFrame.add(lancetArch);

      // Trefoil rose ring tucked inside each lancet peak
      const roseRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.18, 0.024, 8, 16),
        leadCameMat
      );
      roseRing.position.set(lx, 2.22, 0.115);
      rakedWindowFrame.add(roseRing);
    }

    // 1e. Deeper Forced-Perspective Jamb Reveals, Colonnettes, Header & Sill (z centered at +0.14m..+0.20m)
    for (const side of [-1, 1]) {
      // Deep outer architectural jamb post
      const outerJamb = new THREE.Mesh(
        new THREE.BoxGeometry(0.34, 6.26, 0.36),
        purpleFrameMat
      );
      outerJamb.position.set(side * 3.25, 0, 0.10);
      outerJamb.castShadow = true;
      rakedWindowFrame.add(outerJamb);

      // Stepped inner reveal casing (offset inward and deeper in Z)
      const innerReveal = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 5.88, 0.28),
        deepJambMat
      );
      innerReveal.position.set(side * 2.98, -0.06, 0.08);
      rakedWindowFrame.add(innerReveal);

      // Gothic colonnette shaft on front face of jamb (stepped at z = +0.32m)
      const colonnette = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.055, 5.75, 12),
        leadCameMat
      );
      colonnette.position.set(side * 3.22, -0.05, 0.32);
      rakedWindowFrame.add(colonnette);
    }

    // Heavy Forced-Perspective Top Cornice Header & Stepped Bottom Sill
    const topHeaderBeam = new THREE.Mesh(
      new THREE.BoxGeometry(6.95, 0.46, 0.42),
      purpleFrameMat
    );
    topHeaderBeam.position.set(0, 2.92, 0.14);
    topHeaderBeam.castShadow = true;
    rakedWindowFrame.add(topHeaderBeam);

    const bottomSill = new THREE.Mesh(
      new THREE.BoxGeometry(6.88, 0.36, 0.38),
      creamEdgeMat
    );
    bottomSill.position.set(0, -2.96, 0.12);
    rakedWindowFrame.add(bottomSill);

    // Ornate Gothic Pierced Scrollwork Spandrels in Upper-Left & Lower-Right Corners (matching reference photo!)
    for (const [sx, sy] of [
      [-2.48, 2.25],
      [-2.62, 1.75],
      [2.15, -2.45],
      [1.68, -2.58],
    ] as const) {
      const scrollRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.22, 0.032, 8, 16),
        sx < 0 ? purpleFrameMat : creamEdgeMat
      );
      scrollRing.position.set(sx, sy, 0.16);
      rakedWindowFrame.add(scrollRing);
    }

    // 1f. Multi-Swag Sculpted Crimson Velvet Drapery, Gold Bullion Fringe & Oversized Tassel
    const swagMat = new THREE.MeshStandardMaterial({
      map: textures.redVelourTex,
      roughness: 0.68,
      metalness: 0.06,
    });
    const deepVelvetMat = new THREE.MeshStandardMaterial({
      color: 0x7a121d,
      roughness: 0.72,
      metalness: 0.06,
    });

    // 4 sculpted catenary swags sweeping from top-center-right down to the right tieback knot
    // Each swag is offset in Z by >= 0.045m so folds never intersect coplanarly
    const swagLoops = [
      { x0: 0.15, y0: 2.82, xm: 1.55, ym: 1.85, x1: 2.95, y1: 0.45, z: 0.32, r: 0.22 },
      { x0: 0.55, y0: 2.75, xm: 1.78, ym: 1.42, x1: 2.98, y1: 0.05, z: 0.37, r: 0.20 },
      { x0: 0.98, y0: 2.68, xm: 2.02, ym: 0.98, x1: 3.02, y1: -0.35, z: 0.42, r: 0.18 },
      { x0: 1.42, y0: 2.60, xm: 2.28, ym: 0.56, x1: 3.05, y1: -0.72, z: 0.47, r: 0.16 },
    ] as const;

    for (const s of swagLoops) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(s.x0, s.y0, s.z),
        new THREE.Vector3(s.xm, s.ym, s.z + 0.06),
        new THREE.Vector3(s.x1, s.y1, s.z),
      ]);
      const swagTube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 20, s.r, 12, false),
        swagMat
      );
      swagTube.castShadow = true;
      rakedWindowFrame.add(swagTube);
    }

    // Gold bullion fringe along the lower catenary edge of the drapery valance
    const fringeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.38, 2.42, 0.53),
      new THREE.Vector3(2.24, 0.38, 0.58),
      new THREE.Vector3(3.04, -0.88, 0.53),
    ]);
    const bullionRope = new THREE.Mesh(
      new THREE.TubeGeometry(fringeCurve, 18, 0.032, 8, false),
      goldMat
    );
    rakedWindowFrame.add(bullionRope);

    for (let f = 0; f <= 12; f++) {
      const pt = fringeCurve.getPoint(f / 12);
      const drop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.018, 0.12, 6),
        goldMat
      );
      drop.position.set(pt.x, pt.y - 0.07, pt.z);
      rakedWindowFrame.add(drop);
    }

    // Deeply pleated vertical cascade tail falling to the stage floor on the right side
    const cascadePleats = [
      { dx: 2.78, dz: 0.30, rTop: 0.14, rBot: 0.22, h: 5.5, mat: deepVelvetMat },
      { dx: 2.94, dz: 0.36, rTop: 0.16, rBot: 0.26, h: 5.6, mat: swagMat },
      { dx: 3.10, dz: 0.42, rTop: 0.15, rBot: 0.24, h: 5.5, mat: deepVelvetMat },
      { dx: 3.24, dz: 0.34, rTop: 0.13, rBot: 0.20, h: 5.4, mat: swagMat },
    ] as const;
    for (const p of cascadePleats) {
      const pleatCol = new THREE.Mesh(
        new THREE.CylinderGeometry(p.rTop, p.rBot, p.h, 14),
        p.mat
      );
      pleatCol.position.set(p.dx, -0.42, p.dz);
      pleatCol.castShadow = true;
      rakedWindowFrame.add(pleatCol);
    }

    // Braided gold tieback ropeloop & oversized LatheGeometry gold tassel
    const tiebackLoop = new THREE.Mesh(
      new THREE.TorusGeometry(0.28, 0.038, 10, 20),
      goldMat
    );
    tiebackLoop.position.set(2.98, -0.48, 0.44);
    tiebackLoop.rotation.x = 0.45;
    tiebackLoop.rotation.y = 0.32;
    rakedWindowFrame.add(tiebackLoop);

    const tassel = buildSculptedGoldTassel(goldMat);
    tassel.position.set(2.88, -0.78, 0.62);
    rakedWindowFrame.add(tassel);

    // ========================================================================
    // 2. MAD HATTER'S BANQUET TABLE, CABRIOLE LEGS, 5 CROOKED WONDERLAND CHAIRS,
    //    UNBIRTHDAY CAKES, TEAPOTS, POCKET WATCH & OVERHEAD LANTERNS ('alice-tea-table')
    // ========================================================================
    const teaTableGroup = new THREE.Group();
    teaTableGroup.position.set(-0.25, 0, -2.05);
    teaTableGroup.rotation.y = -0.15;
    aliceGroup.add(teaTableGroup);
    registerElement('alice-tea-table', teaTableGroup);

    const whiteDamaskMat = new THREE.MeshStandardMaterial({
      color: 0xf4f2ec,
      roughness: 0.72,
    });
    const darkWoodMat = new THREE.MeshStandardMaterial({
      color: 0x4a2c1d,
      roughness: 0.5,
    });

    // 2a. 6 Whimsical Curved Cabriole Table Legs peeking beneath the damask skirt
    for (const lx of [-1.28, 0, 1.28]) {
      for (const lz of [-0.36, 0.36]) {
        const leg = buildCabrioleLeg(0.32, darkWoodMat, goldMat);
        leg.position.set(lx, 0, lz);
        teaTableGroup.add(leg);
      }
    }

    // 2b. White Damask Table Skirt (x ∈ [-1.42, 1.42], z ∈ [-0.45, 0.45])
    const whiteSkirt = new THREE.Mesh(
      new RoundedBoxGeometry(2.84, 0.62, 0.90, 2, 0.03),
      whiteDamaskMat
    );
    whiteSkirt.position.y = 0.47;
    whiteSkirt.castShadow = true;
    whiteSkirt.receiveShadow = true;
    teaTableGroup.add(whiteSkirt);

    // Scalloped damask pleat swags along the lower front & side hems (stepped +0.035m proud)
    for (let s = 0; s < 10; s++) {
      const sx = -1.26 + s * 0.28;
      const scallop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.14, 0.04, 12, 1, false, 0, Math.PI),
        whiteDamaskMat
      );
      scallop.rotation.x = Math.PI / 2;
      scallop.rotation.z = Math.PI;
      scallop.position.set(sx, 0.18, 0.465);
      teaTableGroup.add(scallop);
    }

    // 2c. Rich Crimson Velvet Over-Drape Runner with Scalloped Gold Bullion Trim (x ∈ [-1.49, 1.49], z ∈ [-0.50, 0.50])
    const redRunner = new THREE.Mesh(
      new RoundedBoxGeometry(2.98, 0.32, 1.00, 2, 0.04),
      swagMat
    );
    redRunner.position.y = 0.70;
    redRunner.castShadow = true;
    teaTableGroup.add(redRunner);

    for (let g = 0; g < 12; g++) {
      const gx = -1.32 + g * 0.24;
      const tasselDrop = new THREE.Mesh(
        new THREE.ConeGeometry(0.022, 0.075, 8),
        goldMat
      );
      tasselDrop.rotation.z = Math.PI;
      tasselDrop.position.set(gx, 0.52, 0.52);
      teaTableGroup.add(tasselDrop);
    }

    // 2d. Towering Mismatched High-Back Velvet Throne for Mad Hatter + 4 Crooked Wonderland Chairs
    //     Positioned cleanly outside the cast standing positions so there is zero chair/character intersection!
    const hatterThrone = buildWonderlandChair(
      1.38,
      0x68246e,
      0xd49b24,
      goldMat,
      true,
      -0.14
    );
    hatterThrone.position.set(2.14, 0, 0.08);
    hatterThrone.rotation.y = -1.25;
    teaTableGroup.add(hatterThrone);

    // Alice's royal-blue crooked armchair at Stage-Right head of table (behind Alice at x = -1.72)
    const aliceChair = buildWonderlandChair(
      0.86,
      0x246eb8,
      0xe6dcd2,
      goldMat,
      false,
      0.12
    );
    aliceChair.position.set(-2.12, 0, 0.08);
    aliceChair.rotation.y = 1.25;
    teaTableGroup.add(aliceChair);

    // 3 Crooked Upstage Chairs pushed back to z = -0.94m (behind March Hare, Dormouse & White Rabbit at z = -0.58m)
    const upstageChairs = [
      { x: -0.82, z: -0.94, rotY: 0.14, h: 1.08, uph: 0x1e8278, frm: 0x5c3422, tilt: 0.16 },
      { x: -0.12, z: -0.94, rotY: -0.08, h: 0.74, uph: 0xc83248, frm: 0xd8a428, tilt: -0.11 },
      { x: 0.58, z: -0.94, rotY: -0.18, h: 1.02, uph: 0x8ea824, frm: 0x4a2c1d, tilt: 0.15 },
    ] as const;
    for (const uc of upstageChairs) {
      const ch = buildWonderlandChair(
        uc.h,
        uc.uph,
        uc.frm,
        goldMat,
        false,
        uc.tilt
      );
      ch.position.set(uc.x, 0, uc.z);
      ch.rotation.y = uc.rotY;
      teaTableGroup.add(ch);
    }

    // 2e. 2 Multi-Tiered Crooked Unbirthday Cakes with Lit Candles on the Table
    const cakeLeft = buildCrookedUnbirthdayCake(
      [0xff7eb6, 0x5ce0d8, 0xffd84a],
      goldMat
    );
    cakeLeft.position.set(-0.68, 0.86, 0.04);
    teaTableGroup.add(cakeLeft);

    const cakeRight = buildCrookedUnbirthdayCake(
      [0xa682ff, 0xff9468, 0x62e8b8],
      goldMat
    );
    cakeRight.scale.setScalar(0.88);
    cakeRight.position.set(0.66, 0.86, -0.06);
    teaTableGroup.add(cakeRight);

    // 2f. 4 Tilted Porcelain Teapots with Curved Spouts & Handles
    const teapotConfigs = [
      { x: -1.12, z: 0.12, col: 0x48d2d8, tilt: 0.18, rotY: 0.4 },
      { x: -0.28, z: -0.12, col: 0xffc838, tilt: -0.22, rotY: -0.5 },
      { x: 0.34, z: 0.14, col: 0xe8488a, tilt: 0.16, rotY: 0.8 },
      { x: 1.08, z: 0.08, col: 0x5c7cfa, tilt: -0.19, rotY: -0.3 },
    ] as const;
    for (const tp of teapotConfigs) {
      const pot = buildWhimsicalTeapot(tp.col, goldMat, tp.tilt);
      pot.position.set(tp.x, 0.86, tp.z);
      pot.rotation.y = tp.rotY;
      teaTableGroup.add(pot);
    }

    // 2g. Precariously Stacked Teacups & Saucers + 2 Three-Arm Golden Candelabras
    const porcelainColors = [0xffd84a, 0x5ce0d8, 0xff7eb6, 0xffffff, 0xa682ff];
    const stackLocations = [
      { x: -0.92, z: -0.16, count: 4 },
      { x: -0.45, z: 0.18, count: 3 },
      { x: 0.02, z: 0.16, count: 5 },
      { x: 0.48, z: -0.18, count: 3 },
      { x: 0.90, z: -0.14, count: 4 },
      { x: 1.24, z: 0.16, count: 3 },
    ] as const;

    stackLocations.forEach((loc, sIdx) => {
      let curY = 0.86;
      for (let c = 0; c < loc.count; c++) {
        const colHex = porcelainColors[(sIdx + c) % porcelainColors.length] ?? 0xffffff;
        const cupMat = new THREE.MeshStandardMaterial({ color: colHex, roughness: 0.22 });

        // Saucer disc
        const saucer = new THREE.Mesh(
          new THREE.CylinderGeometry(0.085, 0.055, 0.016, 14),
          cupMat
        );
        saucer.position.set(
          loc.x + (c % 2 === 0 ? 0.008 : -0.008),
          curY + 0.008,
          loc.z
        );
        teaTableGroup.add(saucer);

        // Teacup bell
        const cup = new THREE.Mesh(
          new THREE.CylinderGeometry(0.058, 0.038, 0.068, 12),
          cupMat
        );
        cup.position.set(
          loc.x + (c % 2 === 0 ? 0.012 : -0.012),
          curY + 0.052,
          loc.z
        );
        cup.rotation.z = ((c % 2) - 0.5) * 0.22;
        teaTableGroup.add(cup);

        // Tiny gold loop handle
        const ear = new THREE.Mesh(
          new THREE.TorusGeometry(0.022, 0.005, 6, 10),
          goldMat
        );
        ear.position.set(loc.x + 0.065, curY + 0.052, loc.z);
        teaTableGroup.add(ear);

        curY += 0.082;
      }
    });

    // 3-Arm Golden Candelabras
    for (const cx of [-0.08, 0.82]) {
      const candGroup = new THREE.Group();
      candGroup.position.set(cx, 0.86, -0.04);

      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.09, 0.36, 12),
        goldMat
      );
      stem.position.y = 0.18;
      candGroup.add(stem);

      const arms = new THREE.Mesh(
        new THREE.TorusGeometry(0.12, 0.012, 8, 14, Math.PI),
        goldMat
      );
      arms.rotation.z = Math.PI;
      arms.position.y = 0.32;
      candGroup.add(arms);

      for (const ax of [-0.12, 0, 0.12]) {
        const taper = new THREE.Mesh(
          new THREE.CylinderGeometry(0.009, 0.011, 0.12, 8),
          whiteDamaskMat
        );
        taper.position.set(ax, 0.38, 0);
        candGroup.add(taper);
      }
      teaTableGroup.add(candGroup);
    }

    // 2h. Giant Golden Wonderland Pocket Watch propped on the Table
    const watchTex = createWonderlandPocketWatchTexture();
    const watchGroup = new THREE.Group();
    watchGroup.position.set(-1.26, 1.02, -0.05);
    watchGroup.rotation.y = 0.42;
    watchGroup.rotation.x = -0.35;

    const watchCase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.05, 20),
      goldMat
    );
    watchCase.rotation.x = Math.PI / 2;
    watchGroup.add(watchCase);

    const watchDial = new THREE.Mesh(
      new THREE.CircleGeometry(0.155, 20),
      new THREE.MeshBasicMaterial({ map: watchTex })
    );
    watchDial.position.z = 0.032; // Stepped cleanly +0.007m proud of watchCase front (+0.025m)
    watchGroup.add(watchDial);

    const watchCrown = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.024, 0.045, 10),
      goldMat
    );
    watchCrown.position.set(0, 0.20, 0);
    watchGroup.add(watchCrown);

    const watchBow = new THREE.Mesh(
      new THREE.TorusGeometry(0.048, 0.009, 8, 16),
      goldMat
    );
    watchBow.position.set(0, 0.24, 0);
    watchGroup.add(watchBow);
    teaTableGroup.add(watchGroup);

    // 2i. Glowing Whimsical Paper Lanterns suspended overhead above the Tea Party Table
    const lanternSpecs = [
      { x: -1.15, y: 3.35, z: 0.15, r: 0.22, col: 0xffb74d },
      { x: -0.45, y: 3.68, z: -0.18, r: 0.26, col: 0xff4081 },
      { x: 0.25, y: 3.45, z: 0.12, r: 0.24, col: 0x40c4ff },
      { x: 0.92, y: 3.75, z: -0.12, r: 0.25, col: 0xe040fb },
      { x: 1.48, y: 3.42, z: 0.18, r: 0.21, col: 0xffd740 },
    ] as const;

    for (const l of lanternSpecs) {
      const lanternGroup = new THREE.Group();
      lanternGroup.position.set(l.x, l.y, l.z);

      const cord = new THREE.Mesh(
        new THREE.CylinderGeometry(0.005, 0.005, 1.4, 6),
        darkEdgeMat
      );
      cord.position.y = 0.7 + l.r;
      lanternGroup.add(cord);

      const globe = new THREE.Mesh(
        new THREE.SphereGeometry(l.r, 16, 12),
        new THREE.MeshStandardMaterial({
          color: l.col,
          emissive: l.col,
          emissiveIntensity: 0.78,
          roughness: 0.35,
        })
      );
      globe.scale.set(1, 0.88, 1);
      lanternGroup.add(globe);

      for (const capY of [-l.r * 0.86, l.r * 0.86]) {
        const cap = new THREE.Mesh(
          new THREE.CylinderGeometry(l.r * 0.42, l.r * 0.42, 0.03, 12),
          goldMat
        );
        cap.position.y = capY;
        lanternGroup.add(cap);
      }

      const tasselTail = new THREE.Mesh(
        new THREE.ConeGeometry(0.025, 0.16, 8),
        goldMat
      );
      tasselTail.rotation.z = Math.PI;
      tasselTail.position.y = -l.r * 0.86 - 0.09;
      lanternGroup.add(tasselTail);

      teaTableGroup.add(lanternGroup);
    }

    // ========================================================================
    // 3. EXPRESSIVE CAST BLOCKING FIGURES AROUND THE TABLE
    //    (Alice, March Hare, Dormouse, White Rabbit, Mad Hatter — 'alice-characters')
    //    Positioned cleanly between the table perimeter and the 5 Wonderland chairs!
    // ========================================================================
    const aliceCastGroup = new THREE.Group();
    aliceCastGroup.position.copy(teaTableGroup.position);
    aliceCastGroup.rotation.copy(teaTableGroup.rotation);
    aliceGroup.add(aliceCastGroup);
    registerElement('alice-characters', aliceCastGroup);

    // 1. Alice (Stage-Right table end at x = -1.72, z = 0.08, between table x = -1.49 and chair x = -2.12)
    const aliceFig = createHumanScaleFigure(1.38, 0x4aa8f0, 0, 0, false, {
      hasApron: true,
      hairColorHex: 0xf4d048,
      trimColorHex: 0xffffff,
      pantsColorHex: 0xf5f5fa,
      armPose: 'presenting',
    });
    aliceFig.position.set(-1.72, 0, 0.08);
    aliceFig.rotation.y = 0.55;
    aliceCastGroup.add(aliceFig);

    // 2. March Hare (Upstage Right at x = -0.82, z = -0.60, between table z = -0.50 and chair z = -0.94)
    const hareFig = createHumanScaleFigure(1.68, 0x9c4252, 0, 0, true, {
      hairColorHex: 0x8c4a28,
      pantsColorHex: 0x3b2328,
      trimColorHex: 0xf5d468,
      armPose: 'cheering',
    });
    hareFig.position.set(-0.82, 0, -0.60);
    hareFig.rotation.y = 0.12;
    aliceCastGroup.add(hareFig);

    // 3. Dormouse (Upstage Center at x = -0.12, z = -0.60, between table z = -0.50 and chair z = -0.94)
    const dormouseFig = createHumanScaleFigure(1.42, 0xd85c2a, 0.18, 0xc43c24, false, {
      hairColorHex: 0x6e3b1e,
      pantsColorHex: 0x422618,
      trimColorHex: 0xf5e6c8,
      armPose: 'relaxed',
    });
    dormouseFig.position.set(-0.12, 0, -0.60);
    aliceCastGroup.add(dormouseFig);

    // 4. White Rabbit (Upstage Left at x = 0.58, z = -0.60, between table z = -0.50 and chair z = -0.94)
    const rabbitFig = createHumanScaleFigure(1.62, 0xc81e2e, 0, 0, true, {
      hairColorHex: 0xf5f2eb,
      pantsColorHex: 0xded8ce,
      trimColorHex: 0xf5c842,
      armPose: 'presenting',
    });
    rabbitFig.position.set(0.58, 0, -0.60);
    rabbitFig.rotation.y = -0.14;
    aliceCastGroup.add(rabbitFig);

    // 5. Mad Hatter (Stage-Left table head at x = 1.72, z = 0.08, between table x = +1.49 and throne x = +2.14)
    const hatterFig = createHumanScaleFigure(1.78, 0xd88a28, 0.46, 0xe8b928, false, {
      hairColorHex: 0xe85c24,
      pantsColorHex: 0x48245c,
      trimColorHex: 0xff4081,
      armPose: 'presenting',
    });
    hatterFig.position.set(1.72, 0, 0.08);
    hatterFig.rotation.y = -0.55;

    // Custom hand-lettered "10/6" price card tucked into the Hatter's top hat band
    const hatPriceCardTex = createHatterPriceCardTexture();
    const hatPriceCard = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.14, 0.016),
      new THREE.MeshBasicMaterial({ map: hatPriceCardTex })
    );
    hatPriceCard.position.set(0.15, 1.92, 0.09);
    hatPriceCard.rotation.z = -0.22;
    hatterFig.add(hatPriceCard);

    aliceCastGroup.add(hatterFig);

    return aliceGroup;
  },
};
