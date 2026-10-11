import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {
  createPapierMacheNormalTexture,
  createStuccoPlasterNormalTexture,
  drawSeussianDisplayText,
  normalizeExtrudeUVs,
} from '../../engine/procedural-textures.ts';
import {
  createSculptedIcicleDrip,
  createSeussianIcicleValance,
  createWhoCharacter,
  createWhoLandFairyLightStrand,
} from '../shared-scenic-helpers.ts';

/**
 * Generates a richly hand-painted 1024×1024 Scenic Artist Seussian pink stucco & kerf-bent
 * timber canvas texture matching `model_1B_whoville.jpg`, `model_1D_shopping.jpg`, and
 * `model_1G_finale.jpg`: warm raspberry-rose to blush-pink vertical ombré washes, whimsical
 * painted curlicue eaves trim, trompe-l'oeil painted brick/stucco plaster cracks with Seussian
 * ink hatching, vertical rib bevels, and multi-pass scenic spatter.
 */
function createWhovilleStuccoTexture(
  baseHex: string,
  bellyHex: string,
  stripeHex: string,
  inkHex: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // 1. Vertical & radial stucco ombré wash (deep raspberry-rose at eaves/base, luminous blush-pink in belly)
    const vGrad = ctx.createLinearGradient(0, 0, 0, 1024);
    vGrad.addColorStop(0, stripeHex);
    vGrad.addColorStop(0.14, baseHex);
    vGrad.addColorStop(0.48, bellyHex);
    vGrad.addColorStop(0.84, baseHex);
    vGrad.addColorStop(1, stripeHex);
    ctx.fillStyle = vGrad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Warm radial belly glow in the center of each facade bay
    for (const bx of [256, 512, 768]) {
      const bellyGlow = ctx.createRadialGradient(bx, 480, 24, bx, 480, 260);
      bellyGlow.addColorStop(0, 'rgba(255, 210, 232, 0.34)');
      bellyGlow.addColorStop(0.65, 'rgba(248, 148, 196, 0.14)');
      bellyGlow.addColorStop(1, 'rgba(180, 36, 102, 0)');
      ctx.fillStyle = bellyGlow;
      ctx.beginPath();
      ctx.ellipse(bx, 480, 260, 310, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Soft scenic plaster wash (toned down for a clean painted finish)
    for (let i = 0; i < 120; i++) {
      const sx = (i * 157) % 1024;
      const sy = (i * 227) % 1024;
      const sr = 26 + (i % 44);
      ctx.fillStyle =
        i % 3 === 0
          ? 'rgba(255, 224, 240, 0.06)'
          : i % 3 === 1
            ? 'rgba(104, 18, 60, 0.05)'
            : 'rgba(236, 98, 162, 0.05)';
      ctx.beginPath();
      ctx.ellipse(sx, sy, sr * 1.45, sr * 0.82, (i % 7) * 0.42, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Subtle painted vertical Seussian rib bevels & seam shading
    for (const rx of [128, 336, 512, 688, 896]) {
      const ribGrad = ctx.createLinearGradient(rx - 28, 0, rx + 28, 0);
      ribGrad.addColorStop(0, 'rgba(68, 12, 42, 0.16)');
      ribGrad.addColorStop(0.45, 'rgba(255, 216, 236, 0.22)');
      ribGrad.addColorStop(1, 'rgba(68, 12, 42, 0.16)');
      ctx.fillStyle = ribGrad;
      ctx.fillRect(rx - 28, 0, 56, 1024);

      ctx.strokeStyle = 'rgba(34, 16, 40, 0.18)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(rx - 20, 0);
      ctx.bezierCurveTo(rx - 12, 340, rx - 28, 680, rx - 18, 1024);
      ctx.stroke();
    }

    // 4. Gentle horizontal Seussian contour bands
    for (let y = 96; y < 960; y += 112) {
      ctx.strokeStyle = stripeHex;
      ctx.lineWidth = 8;
      ctx.globalAlpha = 0.24;
      ctx.beginPath();
      for (let x = 0; x <= 1024; x += 32) {
        const wave = Math.sin((x / 1024) * Math.PI * 4 + y * 0.04) * 10;
        if (x === 0) ctx.moveTo(x, y + wave);
        else ctx.lineTo(x, y + wave);
      }
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 232, 244, 0.20)';
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = 0.45;
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // 5. Upper Eaves Shadow Glaze & subtle Seussian curlicue trim (under snow cap)
    const eaveShadow = ctx.createLinearGradient(0, 0, 0, 200);
    eaveShadow.addColorStop(0, 'rgba(48, 12, 36, 0.42)');
    eaveShadow.addColorStop(0.55, 'rgba(128, 22, 74, 0.18)');
    eaveShadow.addColorStop(1, 'rgba(180, 38, 102, 0)');
    ctx.fillStyle = eaveShadow;
    ctx.fillRect(0, 0, 1024, 200);

    ctx.strokeStyle = 'rgba(42, 14, 36, 0.32)';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    for (let ex = 32; ex < 992; ex += 64) {
      ctx.beginPath();
      ctx.moveTo(ex, 148);
      ctx.bezierCurveTo(ex + 16, 180, ex + 48, 180, ex + 64, 148);
      ctx.stroke();
    }

    // 6. Subtle scenic cross-hatch accents along lower skirt and eaves
    ctx.strokeStyle = inkHex;
    ctx.lineWidth = 2.0;
    ctx.globalAlpha = 0.22;
    for (let i = 0; i < 48; i++) {
      const hx = (i * 67) % 1000;
      const hy = i % 2 === 0 ? 840 + (i % 9) * 16 : 72 + (i % 7) * 18;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx + 28, hy - 12);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates a hand-painted 1024×1024 Seussian Snowy Roof Cap texture matching the
 * 3 Pink Whoville Round Houses in `model_1B_whoville.jpg`:
 * - Toned-down lavender-snow crown (`<= 0xd8`) grading to icy glacier-blue at the eaves
 * - Soft scalloped snow-drift contour lines
 */
function createWhovilleSnowRoofTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Vertical gradient from icy glacier-cyan at eaves (bottom of lathe UV) to toned lavender-snow at crown
    const grad = ctx.createLinearGradient(0, 1024, 0, 0);
    grad.addColorStop(0, '#96bcdb');
    grad.addColorStop(0.28, '#aec8d8');
    grad.addColorStop(0.68, '#c2d0d8');
    grad.addColorStop(1, '#ccd4d8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Soft rosy-lavender stage light bounce washes across the snow dome
    for (let i = 0; i < 16; i++) {
      const px = (i * 173) % 1024;
      const py = (i * 137) % 1024;
      const wash = ctx.createRadialGradient(px, py, 10, px, py, 140);
      wash.addColorStop(
        0,
        i % 2 === 0 ? 'rgba(206, 196, 216, 0.16)' : 'rgba(136, 178, 214, 0.15)'
      );
      wash.addColorStop(1, 'rgba(180, 200, 216, 0)');
      ctx.fillStyle = wash;
      ctx.beginPath();
      ctx.ellipse(px, py, 140, 80, (i % 5) * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Subtle scalloped snow-drift contour lines (toned down so the snow cap reads smooth and pillowy)
    ctx.strokeStyle = 'rgba(42, 62, 98, 0.26)';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let row = 0; row < 6; row++) {
      const y = 160 + row * 140;
      ctx.lineWidth = row > 3 ? 2.4 : 1.8;
      ctx.beginPath();
      for (let x = 0; x <= 1024; x += 64) {
        const scallop = Math.abs(Math.sin((x / 1024) * Math.PI * 6 + row * 0.7)) * 14;
        if (x === 0) ctx.moveTo(x, y + scallop);
        else ctx.lineTo(x, y + scallop);
      }
      ctx.stroke();
    }

    // Soft eave shadow band at bottom rim of snow cap
    ctx.fillStyle = 'rgba(34, 48, 78, 0.38)';
    ctx.fillRect(0, 1002, 1024, 22);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates a hand-painted Seussian Arched Door Leaf texture with warm coral-pink
 * vertical timber planks, trompe-l'oeil recessed arch molding, and charcoal ink hatching
 * matching the 3 Pink Whoville Houses in `model_1B_whoville.jpg`.
 */
function createWhovilleDoorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#f47cb4');
    grad.addColorStop(0.5, '#ea5c9c');
    grad.addColorStop(1, '#c83878');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Vertical hand-painted Seussian plank seams & woodgrain curls
    for (let x = 64; x < 512; x += 64) {
      ctx.strokeStyle = 'rgba(48, 12, 34, 0.48)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.bezierCurveTo(x + 6, 170, x - 6, 340, x, 512);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 220, 238, 0.32)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 4, 0);
      ctx.bezierCurveTo(x + 10, 170, x - 2, 340, x + 4, 512);
      ctx.stroke();
    }

    // Trompe-l'oeil painted inner arch frame & cross-hatch shadow ticks
    ctx.strokeStyle = '#221024';
    ctx.lineWidth = 6;
    ctx.strokeRect(24, 24, 464, 464);

    ctx.lineWidth = 2.6;
    for (let y = 48; y < 464; y += 36) {
      ctx.beginPath();
      ctx.moveTo(24, y);
      ctx.lineTo(42, y - 8);
      ctx.moveTo(488, y);
      ctx.lineTo(470, y - 8);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates a hand-painted Seussian Cream Arch Casing texture with painted stone/timber
 * voussoir joints and black Seussian ink tick-marks (matching the door & window surrounds
 * in `model_1B_whoville.jpg`).
 */
function createWhovilleArchCasingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Toned-down warm cream-blush base (all channels <= 0xd8)
    ctx.fillStyle = '#d6c8ce';
    ctx.fillRect(0, 0, 256, 256);

    // Subtle rosy-cream brushstroke mottling
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle =
        i % 2 === 0 ? 'rgba(216, 196, 206, 0.35)' : 'rgba(168, 138, 154, 0.25)';
      ctx.fillRect((i * 43) % 256, (i * 67) % 256, 36, 18);
    }

    // Crisp black Seussian ink horizontal tick marks along the casing (visible in Model 1B!)
    ctx.strokeStyle = '#1e1424';
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    for (let y = 16; y < 256; y += 28) {
      ctx.beginPath();
      ctx.moveTo(8, y);
      ctx.lineTo(46, y + 4);
      ctx.moveTo(208, y - 2);
      ctx.lineTo(248, y + 3);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates a hand-painted louvered berry-magenta wood shutter texture with
 * trompe-l'oeil slat shadows and Seussian ink outlines.
 */
function createPaintedShutterTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#922258';
    ctx.fillRect(0, 0, 128, 256);

    ctx.strokeStyle = '#1e0e1c';
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, 120, 248);

    // Painted horizontal louver slats with highlight & shadow bevels
    for (let y = 24; y < 232; y += 16) {
      ctx.fillStyle = '#520e30';
      ctx.fillRect(14, y, 100, 6);
      ctx.fillStyle = '#c84884';
      ctx.fillRect(14, y + 6, 100, 4);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates a hand-painted Seussian pine-bough foliage texture with sweeping
 * emerald-to-chartreuse brushstrokes and dark charcoal ink needle cross-hatching
 * for the Whoville Centerpiece Christmas Tree (`model_1B_whoville.jpg`).
 */
function createPaintedPineFoliageTexture(brightVariant: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, brightVariant ? '#38b24e' : '#24923e');
    grad.addColorStop(0.55, brightVariant ? '#228e3c' : '#187430');
    grad.addColorStop(1, '#0e4e20');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Sweeping Seussian pine-needle fan brushstrokes
    ctx.lineCap = 'round';
    for (let i = 0; i < 140; i++) {
      const bx = (i * 79) % 512;
      const by = (i * 113) % 512;
      ctx.strokeStyle =
        i % 3 === 0
          ? 'rgba(136, 224, 92, 0.34)'
          : i % 3 === 1
            ? 'rgba(12, 52, 22, 0.42)'
            : 'rgba(64, 184, 78, 0.28)';
      ctx.lineWidth = 3.5;
      for (let f = -2; f <= 2; f++) {
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(bx + f * 10, by + 18, bx + f * 18, by + 34);
        ctx.stroke();
      }
    }

    // Crisp dark Seussian ink bough-scallop contour lines
    ctx.strokeStyle = 'rgba(10, 28, 14, 0.55)';
    ctx.lineWidth = 2.6;
    for (let row = 42; row < 500; row += 64) {
      ctx.beginPath();
      for (let x = 0; x <= 512; x += 32) {
        const wave = Math.abs(Math.sin((x / 512) * Math.PI * 6 + row)) * 14;
        if (x === 0) ctx.moveTo(x, row + wave);
        else ctx.lineTo(x, row + wave);
      }
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates a diagonal candy-stripe texture for door frames, candy canes, and gift boxes
 * with subtle hand-painted bevel shading and Seussian ink pin-striping.
 */
function createCandyStripeTexture(
  colorA: string,
  colorB: string,
  stripeCount = 8
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = colorA;
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = colorB;
    const step = 256 / stripeCount;
    for (let i = -stripeCount; i < stripeCount * 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * step, 0);
      ctx.lineTo(i * step + step * 0.5, 0);
      ctx.lineTo(i * step + step * 0.5 - 256, 256);
      ctx.lineTo(i * step - 256, 256);
      ctx.closePath();
      ctx.fill();

      // Crisp Seussian ink edge along each candy stripe
      ctx.strokeStyle = 'rgba(28, 14, 24, 0.38)';
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates a warm 512×512 amber-gold interior window texture with cozy radial candle glow,
 * painted diamond lead-came glazing lines, painted Seussian drape silhouettes, and lower
 * sill-shadow hatching matching `model_1B_whoville.jpg`.
 */
function createAmberWindowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(256, 268, 24, 256, 256, 288);
    grad.addColorStop(0, '#fffac8');
    grad.addColorStop(0.45, '#ffdc58');
    grad.addColorStop(0.82, '#f29820');
    grad.addColorStop(1, '#c45c10');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Painted diamond cottage lead-came mullions
    ctx.strokeStyle = 'rgba(112, 48, 14, 0.32)';
    ctx.lineWidth = 5;
    for (let d = -512; d <= 512; d += 88) {
      ctx.beginPath();
      ctx.moveTo(d, 0);
      ctx.lineTo(d + 512, 512);
      ctx.moveTo(d + 512, 0);
      ctx.lineTo(d, 512);
      ctx.stroke();
    }

    // Painted crimson velvet curtain swags & gold fringe in upper corners
    ctx.fillStyle = 'rgba(184, 36, 42, 0.48)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(192, 88, 0, 296);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(512, 0);
    ctx.quadraticCurveTo(320, 88, 512, 296);
    ctx.fill();

    // Bold black Seussian window-pane shadow frame & lower sill tick-marks
    ctx.strokeStyle = 'rgba(28, 16, 24, 0.65)';
    ctx.lineWidth = 10;
    ctx.strokeRect(6, 6, 500, 500);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

interface WhovilleWindowSpec {
  x: number;
  y: number;
  width: number;
  height: number;
  tiltZ: number;
  hasShutters: boolean;
  hasWreath: boolean;
}

interface WhovilleHouseConfig {
  label: string;
  position: THREE.Vector3;
  rotationY: number;
  widthM: number;
  heightM: number;
  depthScale: number;
  basePinkHex: string;
  bellyPinkHex: string;
  stripePinkHex: string;
  ribColor: number;
  doorX: number;
  doorWidth: number;
  doorHeight: number;
  doorTiltZ: number;
  doorFrameStyle: 'candy' | 'olive' | 'cream';
  dormerSide: -1 | 1;
  chimneyLeanX: number;
  chimneyStyle: 't-cap' | 'bulb-pot' | 'keyhole-pot';
  windows: ReadonlyArray<WhovilleWindowSpec>;
}

/**
 * Helper to build a lush 3D pine wreath with pine-needle clusters, holly berries,
 * and a sculpted velvet ribbon bow (with yellow/crimson layered bows as in Model 1B).
 */
function createHolidayWreath(
  radius: number,
  tubeRadius: number,
  wreathMat: THREE.Material,
  bowMat: THREE.Material,
  goldBowMat: THREE.Material
): THREE.Group {
  const wreathGroup = new THREE.Group();

  // Main pine torus ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius, tubeRadius, 12, 24),
    wreathMat
  );
  ring.castShadow = true;
  wreathGroup.add(ring);

  // Sculpted pine-bough puffs & red holly berries around the ring
  const puffCount = 10;
  for (let i = 0; i < puffCount; i++) {
    const angle = (i / puffCount) * Math.PI * 2;
    const puff = new THREE.Mesh(
      new THREE.ConeGeometry(tubeRadius * 0.95, tubeRadius * 2.2, 6),
      wreathMat
    );
    puff.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      tubeRadius * 0.45
    );
    puff.rotation.z = angle - Math.PI * 0.25;
    wreathGroup.add(puff);

    if (i % 2 === 0) {
      const berry = new THREE.Mesh(
        new THREE.SphereGeometry(tubeRadius * 0.36, 8, 8),
        bowMat
      );
      berry.position.set(
        Math.cos(angle + 0.2) * radius,
        Math.sin(angle + 0.2) * radius,
        tubeRadius * 0.95
      );
      wreathGroup.add(berry);
    }
  }

  // Top bow assembly (positioned at top of wreath as in Model Box 1B)
  const bowGroup = new THREE.Group();
  bowGroup.position.set(0, radius * 0.92, tubeRadius * 1.15);

  const knot = new THREE.Mesh(
    new THREE.SphereGeometry(tubeRadius * 0.65, 10, 10),
    goldBowMat
  );
  bowGroup.add(knot);

  for (const side of [-1, 1]) {
    const loop = new THREE.Mesh(
      new THREE.TorusGeometry(tubeRadius * 0.95, tubeRadius * 0.34, 8, 14),
      goldBowMat
    );
    loop.scale.set(1.25, 0.78, 0.7);
    loop.position.set(side * tubeRadius * 1.05, tubeRadius * 0.15, 0);
    loop.rotation.z = side * 0.28;
    bowGroup.add(loop);

    const ribbonTail = new THREE.Mesh(
      new RoundedBoxGeometry(
        tubeRadius * 0.55,
        radius * 0.75,
        tubeRadius * 0.28,
        2,
        0.01
      ),
      bowMat
    );
    ribbonTail.position.set(
      side * tubeRadius * 0.68,
      -radius * 0.36,
      -tubeRadius * 0.18
    );
    ribbonTail.rotation.z = side * -0.22;
    bowGroup.add(ribbonTail);
  }

  wreathGroup.add(bowGroup);
  return wreathGroup;
}

/**
 * Builds a large, glossy red-and-white spiral-striped Whoville Giant Candy Cane
 * (`media_1791675333699_107601fe.jpg`), usable both as a tall street-side candy cane
 * planted in a snowdrift (`includeSnowBase = true`) and as a giant rooftop candy cane
 * arching out of a snowy Whoville roof (`includeSnowBase = false`).
 */
function createGiantWhovilleCandyCane(
  heightM: number,
  tubeRadiusM: number,
  hookRadiusM: number,
  hookDir: -1 | 1,
  candyCaneMat: THREE.Material,
  snowCapMat: THREE.Material,
  includeSnowBase = true
): THREE.Group {
  const caneGroup = new THREE.Group();
  caneGroup.name = 'WhovilleGiantCandyCane';

  const straightTopY = Math.max(0.35, heightM - hookRadiusM);
  const curvePts: THREE.Vector3[] = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(hookDir * -0.025, straightTopY * 0.36, 0.015),
    new THREE.Vector3(hookDir * 0.018, straightTopY * 0.72, -0.01),
    new THREE.Vector3(0, straightTopY, 0),
  ];

  // Smooth 195-degree shepherd's-crook candy cane hook at the top
  const hookSegments = 12;
  for (let i = 1; i <= hookSegments; i++) {
    const t = i / hookSegments;
    const angle = Math.PI - t * Math.PI * 1.12;
    const hx =
      hookDir * (hookRadiusM + Math.cos(angle) * hookRadiusM);
    const hy = straightTopY + Math.sin(angle) * hookRadiusM;
    const hz = Math.sin(t * Math.PI) * 0.025;
    curvePts.push(new THREE.Vector3(hx, hy, hz));
  }

  const caneCurve = new THREE.CatmullRomCurve3(curvePts);
  const caneTubeGeo = new THREE.TubeGeometry(
    caneCurve,
    44,
    tubeRadiusM,
    18,
    false
  );
  const caneMesh = new THREE.Mesh(caneTubeGeo, candyCaneMat);
  caneMesh.castShadow = true;
  caneMesh.receiveShadow = true;
  caneGroup.add(caneMesh);

  // Hemispherical rounded end-cap on the candy cane hook tip
  const tipPoint = curvePts[curvePts.length - 1]!;
  const tipCap = new THREE.Mesh(
    new THREE.SphereGeometry(tubeRadiusM * 0.99, 14, 12),
    candyCaneMat
  );
  tipCap.position.copy(tipPoint);
  tipCap.castShadow = true;
  caneGroup.add(tipCap);

  if (includeSnowBase) {
    // Sculpted snowdrift collar piled around the foot of the street-side candy cane
    const snowBaseMound = new THREE.Mesh(
      new THREE.SphereGeometry(tubeRadiusM * 2.45, 16, 12),
      snowCapMat
    );
    snowBaseMound.scale.set(1.25, 0.58, 1.15);
    snowBaseMound.position.set(0, tubeRadiusM * 0.45, 0);
    snowBaseMound.castShadow = true;
    snowBaseMound.receiveShadow = true;
    caneGroup.add(snowBaseMound);

    const snowSubDrift = new THREE.Mesh(
      new THREE.SphereGeometry(tubeRadiusM * 1.85, 14, 10),
      snowCapMat
    );
    snowSubDrift.scale.set(1.35, 0.52, 1.1);
    snowSubDrift.position.set(
      hookDir * tubeRadiusM * 1.2,
      tubeRadiusM * 0.34,
      tubeRadiusM * 0.5
    );
    snowSubDrift.receiveShadow = true;
    caneGroup.add(snowSubDrift);
  }

  return caneGroup;
}

/**
 * Builds an ultra-detailed Seussian Whoville Round House wagon matching Model Box 1B & CAD Plan 1B.
 */
function buildSingleWhovilleHouse(
  cfg: WhovilleHouseConfig,
  sharedMats: {
    snowCapMat: THREE.MeshStandardMaterial;
    snowShadeMat: THREE.MeshStandardMaterial;
    icicleMat: THREE.MeshStandardMaterial;
    inkMat: THREE.MeshBasicMaterial;
    wagonSteelMat: THREE.MeshStandardMaterial;
    stoneStepMat: THREE.MeshStandardMaterial;
    oliveFrameMat: THREE.MeshStandardMaterial;
    creamFrameMat: THREE.MeshStandardMaterial;
    candyFrameMat: THREE.MeshStandardMaterial;
    giantCandyCaneMat: THREE.MeshStandardMaterial;
    brassMat: THREE.MeshStandardMaterial;
    wreathGreenMat: THREE.MeshStandardMaterial;
    crimsonBowMat: THREE.MeshStandardMaterial;
    goldBowMat: THREE.MeshStandardMaterial;
    windowGlowMat: THREE.MeshStandardMaterial;
    shutterMat: THREE.MeshStandardMaterial;
    doorPanelMat: THREE.MeshStandardMaterial;
  }
): THREE.Group {
  const house = new THREE.Group();
  house.name = `WhovillePinkHouse_${cfg.label}`;
  house.position.copy(cfg.position);
  house.rotation.y = cfg.rotationY;

  const halfW = cfg.widthM * 0.5;
  const frontSurfaceZ = halfW * cfg.depthScale;

  // ==========================================================================
  // 1. ROLLING SNOW-DRIFT WAGON PLINTH & CASTER SKIRT (CAD Plan 1B Footprint)
  // ==========================================================================
  const wagonDeck = new THREE.Mesh(
    new RoundedBoxGeometry(cfg.widthM + 0.32, 0.11, frontSurfaceZ * 2 + 0.28, 2, 0.03),
    sharedMats.wagonSteelMat
  );
  wagonDeck.position.set(0, 0.055, 0);
  wagonDeck.receiveShadow = true;
  house.add(wagonDeck);

  // 4 Recessed Swivel Caster Wheels (drawn as circles at corners of CAD wagon boxes)
  const casterOffsets: ReadonlyArray<[number, number]> = [
    [-halfW * 0.78, -frontSurfaceZ * 0.72],
    [halfW * 0.78, -frontSurfaceZ * 0.72],
    [-halfW * 0.78, frontSurfaceZ * 0.72],
    [halfW * 0.78, frontSurfaceZ * 0.72],
  ];
  for (const [cx, cz] of casterOffsets) {
    const casterWheel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 0.04, 12),
      sharedMats.inkMat
    );
    casterWheel.rotation.z = Math.PI * 0.5;
    casterWheel.position.set(cx, 0.03, cz);
    house.add(casterWheel);
  }

  // Sculpted Snow-Drift Wagon Skirt around the base (offset >= 0.04m outside body base)
  const snowPlinthProfile: THREE.Vector2[] = [
    new THREE.Vector2(0.01, 0.08),
    new THREE.Vector2(halfW * 1.02, 0.08),
    new THREE.Vector2(halfW * 1.06, 0.14),
    new THREE.Vector2(halfW * 0.99, 0.24),
    new THREE.Vector2(halfW * 0.88, 0.28),
    new THREE.Vector2(0.01, 0.28),
  ];
  const snowPlinth = new THREE.Mesh(
    new THREE.LatheGeometry(snowPlinthProfile, 28),
    sharedMats.snowShadeMat
  );
  snowPlinth.scale.set(1.0, 1.0, cfg.depthScale + 0.08);
  snowPlinth.receiveShadow = true;
  house.add(snowPlinth);

  // ==========================================================================
  // 2. BULBOUS PEAR-SHAPED / ONION-DOMED STUCCO BODY (LatheGeometry + Dormer)
  // ==========================================================================
  const stuccoTex = createWhovilleStuccoTexture(
    cfg.basePinkHex,
    cfg.bellyPinkHex,
    cfg.stripePinkHex,
    '#221428'
  );
  const stuccoMat = new THREE.MeshStandardMaterial({
    map: stuccoTex,
    normalMap: createStuccoPlasterNormalTexture(),
    normalScale: new THREE.Vector2(0.55, 0.55),
    roughness: 0.56,
    metalness: 0.03,
  });
  const ribMat = new THREE.MeshStandardMaterial({
    color: cfg.ribColor,
    roughness: 0.52,
  });

  const bodyH = cfg.heightM * 0.78;
  const lathePoints: THREE.Vector2[] = [];
  const profileSteps = 18;
  for (let i = 0; i <= profileSteps; i++) {
    const t = i / profileSteps;
    const y = 0.12 + t * bodyH;
    // Bulbous Seussian pear/onion silhouette: narrow waist at bottom, wide belly at t=0.46, rounded dome top
    const bellyCurve =
      Math.sin(t * Math.PI * 0.88) * 0.24 +
      Math.sin(t * Math.PI * 1.85) * 0.06;
    const baseTaper = 0.82 - t * 0.18;
    const r = Math.max(0.04, halfW * (baseTaper + bellyCurve));
    lathePoints.push(new THREE.Vector2(r, y));
  }
  lathePoints.push(new THREE.Vector2(0.01, 0.12 + bodyH));

  const bodyMesh = new THREE.Mesh(
    new THREE.LatheGeometry(lathePoints, 36),
    stuccoMat
  );
  bodyMesh.scale.set(1.0, 1.0, cfg.depthScale);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  house.add(bodyMesh);

  // Painted Seussian Contour Stripes / 3D Trim Ribs hugging the bulbous body (offset +0.035m)
  const ribAngles = [-0.85, -0.32, 0.28, 0.85];
  for (const ang of ribAngles) {
    const ribPts: THREE.Vector3[] = [];
    for (let i = 1; i <= profileSteps - 2; i++) {
      const pt = lathePoints[i];
      if (!pt) continue;
      const rad = pt.x + 0.035;
      ribPts.push(
        new THREE.Vector3(
          Math.sin(ang) * rad,
          pt.y,
          Math.cos(ang) * rad * cfg.depthScale
        )
      );
    }
    const ribCurve = new THREE.CatmullRomCurve3(ribPts);
    const ribTube = new THREE.Mesh(
      new THREE.TubeGeometry(ribCurve, 18, 0.022, 8, false),
      ribMat
    );
    house.add(ribTube);
  }

  // Sculpted Side Dormer / Alcove bulging out from the outer flank
  const dormerGroup = new THREE.Group();
  dormerGroup.position.set(
    cfg.dormerSide * (halfW * 0.88),
    bodyH * 0.48,
    -0.04
  );
  dormerGroup.rotation.z = cfg.dormerSide * -0.22;

  const dormerBody = new THREE.Mesh(
    new THREE.SphereGeometry(0.36, 18, 14),
    stuccoMat
  );
  dormerBody.scale.set(0.95, 1.25, 0.72);
  dormerBody.castShadow = true;
  dormerGroup.add(dormerBody);

  const dormerSnowCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
    sharedMats.snowCapMat
  );
  dormerSnowCap.scale.set(1.02, 0.85, 0.78);
  dormerSnowCap.position.y = 0.16;
  dormerGroup.add(dormerSnowCap);

  // Sculpted Seussian icicle valance tucked beneath the dormer snow eave
  const dormerValance = createSeussianIcicleValance(
    0.46,
    0.16,
    5,
    sharedMats.snowCapMat,
    sharedMats.snowShadeMat,
    0.04,
    cfg.dormerSide > 0 ? 3 : 7
  );
  dormerValance.position.set(0, 0.14, 0.25);
  dormerGroup.add(dormerValance);

  // Small glowing porthole window on the side dormer (offset +0.04m proud of dormer surface)
  const dormerPortholeFrame = new THREE.Mesh(
    new THREE.TorusGeometry(0.12, 0.024, 10, 18),
    sharedMats.oliveFrameMat
  );
  dormerPortholeFrame.position.set(cfg.dormerSide * 0.12, -0.02, 0.28);
  dormerPortholeFrame.rotation.y = cfg.dormerSide * 0.35;
  dormerGroup.add(dormerPortholeFrame);

  const dormerPortholeGlass = new THREE.Mesh(
    new THREE.CircleGeometry(0.105, 16),
    sharedMats.windowGlowMat
  );
  dormerPortholeGlass.position.set(cfg.dormerSide * 0.13, -0.02, 0.31);
  dormerPortholeGlass.rotation.y = cfg.dormerSide * 0.35;
  dormerGroup.add(dormerPortholeGlass);

  house.add(dormerGroup);

  // ==========================================================================
  // 3. THICK SCALLOPED BLUE-WHITE SNOW ROOF CAP, EAVE DRIP LOBES & ICICLES
  // ==========================================================================
  const eaveY = 0.12 + bodyH * 0.73;
  const roofPeakY = cfg.heightM * 0.95;
  const roofProfile: THREE.Vector2[] = [];
  const roofSteps = 14;
  for (let i = 0; i <= roofSteps; i++) {
    const t = i / roofSteps;
    const y = eaveY + t * (roofPeakY - eaveY);
    // Thick, puffy dome overhang that swells slightly above the eaves then rounds smoothly to the peak
    const domeFactor = Math.cos(t * Math.PI * 0.5);
    const puffBell = Math.sin(t * Math.PI) * 0.12;
    const r = Math.max(0.02, (halfW * 1.07) * domeFactor + halfW * puffBell);
    roofProfile.push(new THREE.Vector2(r, y));
  }
  roofProfile.push(new THREE.Vector2(0.0, roofPeakY));

  const snowRoofCap = new THREE.Mesh(
    new THREE.LatheGeometry(roofProfile, 36),
    sharedMats.snowCapMat
  );
  snowRoofCap.scale.set(1.0, 1.0, cfg.depthScale + 0.07);
  snowRoofCap.castShadow = true;
  snowRoofCap.receiveShadow = true;
  house.add(snowRoofCap);

  // Jagged Cavemouth-Style Crystalline Icicle Valance Segments & Sharp Icicle Fangs
  // Tucked cleanly underneath the overhanging snow roof cap eaves (replaces sphere bulbs!)
  const houseIceGlazeMat = new THREE.MeshStandardMaterial({
    color: 0x6290c8,
    roughness: 0.48,
    metalness: 0.14,
    flatShading: true,
  });
  const houseCrystallineIcicleMat = new THREE.MeshStandardMaterial({
    color: 0xa4c4d8,
    roughness: 0.45,
    metalness: 0.16,
    flatShading: true,
  });

  const eaveValanceSegments = 5;
  for (let s = 0; s < eaveValanceSegments; s++) {
    const u = (s + 0.5) / eaveValanceSegments;
    const angle = (u - 0.5) * Math.PI * 1.06;
    const vx = Math.sin(angle) * (halfW * 0.97);
    const vz = Math.cos(angle) * (halfW * 0.97) * (cfg.depthScale + 0.04);
    const archFollowY = eaveY + Math.cos((u - 0.5) * Math.PI) * 0.08 + 0.02;
    const segWidth = (cfg.widthM * 0.58) / eaveValanceSegments;

    const eaveValance = createSeussianIcicleValance(
      segWidth,
      0.30 + (s % 2) * 0.06,
      5,
      houseCrystallineIcicleMat,
      houseIceGlazeMat,
      0.036,
      s * 7 + 3
    );
    eaveValance.position.set(vx, archFollowY, vz);
    eaveValance.rotation.y = angle * 0.72;
    house.add(eaveValance);
  }

  const fangCount = 15;
  for (let i = 0; i < fangCount; i++) {
    const u = i / (fangCount - 1);
    const angle = (u - 0.5) * Math.PI * 1.14;
    const lx = Math.sin(angle) * (halfW * 0.99);
    const lz = Math.cos(angle) * (halfW * 0.99) * (cfg.depthScale + 0.05);
    const dripLen = 0.24 + ((i * 5 + 3) % 4) * 0.085 + (i === 4 || i === 10 ? 0.1 : 0);
    const dripRad = 0.038 + (i % 3) * 0.008;
    const archFollowY = eaveY + Math.cos((u - 0.5) * Math.PI) * 0.09 + 0.03;
    const bendSign = i % 2 === 0 ? 1 : -1;

    const icicleFang = createSculptedIcicleDrip(
      dripLen,
      dripRad,
      i % 3 === 1 ? houseIceGlazeMat : houseCrystallineIcicleMat,
      bendSign * 0.018
    );
    icicleFang.position.set(lx, archFollowY, lz);
    icicleFang.rotation.y = angle * 0.65;
    house.add(icicleFang);
  }

  // ==========================================================================
  // 4. S-CURVED CROOKED CHIMNEY (TubeGeometry + Tilted Chimney Pot & Snow Puffs)
  // ==========================================================================
  const chimBaseY = roofPeakY - 0.08;
  const lean = cfg.chimneyLeanX;
  const chimCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, chimBaseY - 0.1, 0),
    new THREE.Vector3(lean * 0.45, chimBaseY + 0.18, 0.02),
    new THREE.Vector3(-lean * 0.28, chimBaseY + 0.38, -0.02),
    new THREE.Vector3(lean * 0.85, chimBaseY + 0.62, 0.0),
  ]);

  const chimneyPipe = new THREE.Mesh(
    new THREE.TubeGeometry(chimCurve, 20, 0.115, 12, false),
    sharedMats.snowCapMat
  );
  chimneyPipe.castShadow = true;
  house.add(chimneyPipe);

  // Dark Seussian vertical hatch stripes on the chimney neck (matching Model 1B)
  const chimCollar = new THREE.Mesh(
    new THREE.TorusGeometry(0.145, 0.042, 10, 18),
    sharedMats.snowShadeMat
  );
  chimCollar.rotation.x = Math.PI * 0.5;
  chimCollar.position.set(0, chimBaseY + 0.03, 0);
  house.add(chimCollar);

  const chimTopPos = new THREE.Vector3(lean * 0.85, chimBaseY + 0.62, 0.0);
  const chimTopGroup = new THREE.Group();
  chimTopGroup.position.copy(chimTopPos);
  chimTopGroup.rotation.z = -lean * 0.95;

  if (cfg.chimneyStyle === 't-cap') {
    // Horizontal T-cap snow-topped chimney pot (exact match for DSR house in Model 1B)
    const tBar = new THREE.Mesh(
      new RoundedBoxGeometry(0.46, 0.18, 0.24, 3, 0.06),
      sharedMats.snowCapMat
    );
    tBar.castShadow = true;
    chimTopGroup.add(tBar);

    const snowPuffTop = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 12, 10),
      sharedMats.snowShadeMat
    );
    snowPuffTop.scale.set(1.45, 0.65, 0.9);
    snowPuffTop.position.set(0, 0.1, 0.03);
    chimTopGroup.add(snowPuffTop);
  } else if (cfg.chimneyStyle === 'bulb-pot') {
    // Bulbous Seussian pot with snow puff (exact match for USR house in Model 1B)
    const potBulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 14, 12),
      sharedMats.snowCapMat
    );
    potBulb.scale.set(1.18, 0.88, 0.92);
    chimTopGroup.add(potBulb);

    const potRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.13, 0.038, 10, 16),
      sharedMats.snowShadeMat
    );
    potRim.position.set(0, 0.08, 0.04);
    chimTopGroup.add(potRim);
  } else {
    // Keyhole ring chimney finial with snow puff (exact match for MSL house in Model 1B)
    const ringPot = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.055, 12, 20),
      sharedMats.snowCapMat
    );
    chimTopGroup.add(ringPot);

    const innerHole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.065, 0.08, 12),
      sharedMats.inkMat
    );
    innerHole.rotation.x = Math.PI * 0.5;
    chimTopGroup.add(innerHole);

    const topPuff = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 10, 10),
      sharedMats.snowShadeMat
    );
    topPuff.scale.set(1.3, 0.7, 0.9);
    topPuff.position.set(0, 0.16, 0.02);
    chimTopGroup.add(topPuff);
  }
  house.add(chimTopGroup);

  // ==========================================================================
  // 5. RECESSED ARCHED DOORWAY, CURVED STONE STEPS, CANDY/OLIVE FRAME & WREATH
  // ==========================================================================
  const doorLocalZ =
    Math.sqrt(Math.max(0.05, 1 - Math.pow(cfg.doorX / halfW, 2))) *
    frontSurfaceZ;

  const doorGroup = new THREE.Group();
  doorGroup.position.set(cfg.doorX, 0, doorLocalZ);
  doorGroup.rotation.y = (cfg.doorX / halfW) * 0.22;

  // Curved Stone Front Steps protruding out onto the stage floor (non-coplanar y=0.05 & y=0.13)
  const stepBottom = new THREE.Mesh(
    new THREE.CylinderGeometry(
      cfg.doorWidth * 0.76,
      cfg.doorWidth * 0.84,
      0.08,
      18,
      1,
      false,
      -Math.PI * 0.5,
      Math.PI
    ),
    sharedMats.stoneStepMat
  );
  stepBottom.scale.set(1.0, 1.0, 0.52);
  stepBottom.position.set(0, 0.04, 0.08);
  stepBottom.receiveShadow = true;
  doorGroup.add(stepBottom);

  const stepTop = new THREE.Mesh(
    new THREE.CylinderGeometry(
      cfg.doorWidth * 0.62,
      cfg.doorWidth * 0.68,
      0.08,
      18,
      1,
      false,
      -Math.PI * 0.5,
      Math.PI
    ),
    sharedMats.stoneStepMat
  );
  stepTop.scale.set(1.0, 1.0, 0.42);
  stepTop.position.set(0, 0.12, 0.05);
  stepTop.receiveShadow = true;
  doorGroup.add(stepTop);

  // Arched Doorway Assembly (tilted slightly for Seussian whimsy)
  const doorArchGroup = new THREE.Group();
  doorArchGroup.position.set(0, 0.16, 0);
  doorArchGroup.rotation.z = cfg.doorTiltZ;

  // Helper to create an extrude arch shape
  const makeArchShape = (w: number, h: number): THREE.Shape => {
    const hw = w * 0.5;
    const straightH = Math.max(0.2, h - hw);
    const shape = new THREE.Shape();
    shape.moveTo(-hw, 0);
    shape.lineTo(-hw, straightH);
    shape.absarc(0, straightH, hw, Math.PI, 0, true);
    shape.lineTo(hw, 0);
    shape.closePath();
    return shape;
  };

  // Layer 1: Dark Seussian ink outline backing (z = 0.00 to 0.04)
  const doorInkMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(
      makeArchShape(cfg.doorWidth + 0.14, cfg.doorHeight + 0.08),
      { depth: 0.04, bevelEnabled: false, curveSegments: 20 }
    ),
    sharedMats.inkMat
  );
  doorInkMesh.position.z = 0.0;
  doorArchGroup.add(doorInkMesh);

  // Layer 2: Sculpted White/Cream & Candy/Olive Arch Surround (z = 0.04 to 0.085, +4cm offset)
  const frameMat =
    cfg.doorFrameStyle === 'candy'
      ? sharedMats.candyFrameMat
      : cfg.doorFrameStyle === 'olive'
        ? sharedMats.oliveFrameMat
        : sharedMats.creamFrameMat;

  const doorSurroundGeo = new THREE.ExtrudeGeometry(
    makeArchShape(cfg.doorWidth + 0.08, cfg.doorHeight + 0.04),
    { depth: 0.045, bevelEnabled: false, curveSegments: 20 }
  );
  normalizeExtrudeUVs(doorSurroundGeo, 'fit');
  const doorSurroundMesh = new THREE.Mesh(
    doorSurroundGeo,
    sharedMats.creamFrameMat
  );
  doorSurroundMesh.position.z = 0.04;
  doorArchGroup.add(doorSurroundMesh);

  // Layer 3: Recessed Pink/Coral Arched Door Leaf with Hand-Painted Planks & Swirl Trim (z = 0.085 to 0.125)
  const doorLeafGeo = new THREE.ExtrudeGeometry(
    makeArchShape(cfg.doorWidth - 0.04, cfg.doorHeight - 0.04),
    { depth: 0.04, bevelEnabled: false, curveSegments: 20 }
  );
  normalizeExtrudeUVs(doorLeafGeo, 'fit');
  const doorLeafMesh = new THREE.Mesh(doorLeafGeo, sharedMats.doorPanelMat);
  doorLeafMesh.position.z = 0.085;
  doorArchGroup.add(doorLeafMesh);

  // Layer 4: 3D Curved Arch Molding Tube around the doorway perimeter (z = 0.135)
  const archFramePts: THREE.Vector3[] = [];
  const dhw = cfg.doorWidth * 0.5 + 0.02;
  const dStraightH = cfg.doorHeight - dhw;
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    if (t < 0.25) {
      archFramePts.push(new THREE.Vector3(-dhw, (t / 0.25) * dStraightH, 0.135));
    } else if (t <= 0.75) {
      const a = Math.PI - ((t - 0.25) / 0.5) * Math.PI;
      archFramePts.push(
        new THREE.Vector3(
          Math.cos(a) * dhw,
          dStraightH + Math.sin(a) * dhw,
          0.135
        )
      );
    } else {
      archFramePts.push(
        new THREE.Vector3(dhw, (1 - (t - 0.75) / 0.25) * dStraightH, 0.135)
      );
    }
  }
  const archMoldingTube = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(archFramePts),
      28,
      0.028,
      10,
      false
    ),
    frameMat
  );
  doorArchGroup.add(archMoldingTube);

  // Brass Door Knocker, Escutcheon & Doorknob (z = 0.16, >= 0.035m proud of door leaf)
  const handleSide = cfg.doorX >= 0 ? -1 : 1;
  const doorknob = new THREE.Mesh(
    new THREE.SphereGeometry(0.032, 10, 10),
    sharedMats.brassMat
  );
  doorknob.position.set(
    handleSide * (cfg.doorWidth * 0.32),
    cfg.doorHeight * 0.44,
    0.16
  );
  doorArchGroup.add(doorknob);

  const knockerRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.042, 0.011, 8, 14),
    sharedMats.brassMat
  );
  knockerRing.position.set(0, cfg.doorHeight * 0.36, 0.16);
  doorArchGroup.add(knockerRing);

  // Lush Pine Christmas Wreath with Gold & Crimson Bow on the Door (z = 0.185)
  const doorWreath = createHolidayWreath(
    0.185,
    0.055,
    sharedMats.wreathGreenMat,
    sharedMats.crimsonBowMat,
    sharedMats.goldBowMat
  );
  doorWreath.position.set(0, cfg.doorHeight * 0.64, 0.185);
  doorArchGroup.add(doorWreath);

  doorGroup.add(doorArchGroup);
  house.add(doorGroup);

  // ==========================================================================
  // 6. MULTI-PANE ARCHED GLOWING AMBER WINDOWS, SHUTTERS, SNOW SILLS & SWAGS
  // ==========================================================================
  for (const winSpec of cfg.windows) {
    const winLocalZ =
      Math.sqrt(Math.max(0.08, 1 - Math.pow(winSpec.x / halfW, 2))) *
      frontSurfaceZ;

    const winGroup = new THREE.Group();
    winGroup.position.set(winSpec.x, winSpec.y, winLocalZ);
    winGroup.rotation.y = (winSpec.x / halfW) * 0.25;
    winGroup.rotation.z = winSpec.tiltZ;

    // Layer 1: Dark Ink Surround (z = 0.0 to 0.035)
    const winInk = new THREE.Mesh(
      new THREE.ExtrudeGeometry(
        makeArchShape(winSpec.width + 0.09, winSpec.height + 0.09),
        { depth: 0.035, bevelEnabled: false, curveSegments: 16 }
      ),
      sharedMats.inkMat
    );
    winInk.position.set(0, -winSpec.height * 0.5 - 0.045, 0.0);
    winGroup.add(winInk);

    // Layer 2: Cream Window Casing (z = 0.035 to 0.07)
    const winCasingGeo = new THREE.ExtrudeGeometry(
      makeArchShape(winSpec.width + 0.04, winSpec.height + 0.04),
      { depth: 0.035, bevelEnabled: false, curveSegments: 16 }
    );
    normalizeExtrudeUVs(winCasingGeo, 'fit');
    const winCasing = new THREE.Mesh(winCasingGeo, sharedMats.creamFrameMat);
    winCasing.position.set(0, -winSpec.height * 0.5 - 0.02, 0.035);
    winGroup.add(winCasing);

    // Layer 3: Glowing Amber Glass Pane (z = 0.07 to 0.105)
    const winGlassGeo = new THREE.ExtrudeGeometry(
      makeArchShape(winSpec.width - 0.03, winSpec.height - 0.03),
      { depth: 0.035, bevelEnabled: false, curveSegments: 16 }
    );
    normalizeExtrudeUVs(winGlassGeo, 'fit');
    const winGlass = new THREE.Mesh(winGlassGeo, sharedMats.windowGlowMat);
    winGlass.position.set(0, -winSpec.height * 0.5 + 0.015, 0.07);
    winGroup.add(winGlass);

    // Layer 4: Curved Seussian Muntin Bars (z = 0.14, +3.5cm in front of glass)
    const vMuntinCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -winSpec.height * 0.46, 0.14),
      new THREE.Vector3(0.018, 0, 0.14),
      new THREE.Vector3(0, winSpec.height * 0.46, 0.14),
    ]);
    const vMuntin = new THREE.Mesh(
      new THREE.TubeGeometry(vMuntinCurve, 10, 0.012, 6, false),
      sharedMats.oliveFrameMat
    );
    winGroup.add(vMuntin);

    const hMuntinCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-winSpec.width * 0.44, -0.02, 0.14),
      new THREE.Vector3(0, 0.02, 0.14),
      new THREE.Vector3(winSpec.width * 0.44, -0.02, 0.14),
    ]);
    const hMuntin = new THREE.Mesh(
      new THREE.TubeGeometry(hMuntinCurve, 10, 0.012, 6, false),
      sharedMats.oliveFrameMat
    );
    winGroup.add(hMuntin);

    // Crooked Side Shutters (z = 0.11, offset beside window casing)
    if (winSpec.hasShutters) {
      for (const sSide of [-1, 1]) {
        const shutter = new THREE.Mesh(
          new RoundedBoxGeometry(
            0.095,
            winSpec.height * 0.86,
            0.032,
            2,
            0.012
          ),
          sharedMats.shutterMat
        );
        shutter.position.set(
          sSide * (winSpec.width * 0.5 + 0.085),
          -0.02,
          0.11
        );
        shutter.rotation.y = sSide * -0.24;
        shutter.rotation.z = sSide * 0.09;
        winGroup.add(shutter);
      }
    }

    // Window-Box Snowdrift Sill with Black Hatch Marks (z = 0.145)
    const sillSnow = new THREE.Mesh(
      new RoundedBoxGeometry(winSpec.width + 0.14, 0.095, 0.11, 3, 0.04),
      sharedMats.snowCapMat
    );
    sillSnow.position.set(0, -winSpec.height * 0.5 - 0.04, 0.145);
    winGroup.add(sillSnow);

    // Window Holiday Wreath (z = 0.175, matching the wreaths in every window of Model 1B)
    if (winSpec.hasWreath) {
      const winWreath = createHolidayWreath(
        Math.min(0.115, winSpec.width * 0.34),
        0.036,
        sharedMats.wreathGreenMat,
        sharedMats.crimsonBowMat,
        sharedMats.goldBowMat
      );
      winWreath.position.set(0, 0.03, 0.175);
      winGroup.add(winWreath);
    }

    house.add(winGroup);
  }

  // Festive Pine Garland Swag + Emissive Who-Land Fairy Lights draped between the eaves
  const swagPts: THREE.Vector3[] = [];
  const swagCount = 14;
  for (let i = 0; i <= swagCount; i++) {
    const u = i / swagCount;
    const ang = (u - 0.5) * Math.PI * 0.82;
    const sx = Math.sin(ang) * (halfW * 0.96);
    const sz = Math.cos(ang) * frontSurfaceZ + 0.055;
    const catenarySag = Math.sin(u * Math.PI * 2) * 0.08 - 0.12;
    swagPts.push(new THREE.Vector3(sx, eaveY - 0.18 + catenarySag, sz));
  }
  const swagCurve = new THREE.CatmullRomCurve3(swagPts);
  const garlandSwag = new THREE.Mesh(
    new THREE.TubeGeometry(swagCurve, 24, 0.032, 8, false),
    sharedMats.wreathGreenMat
  );
  house.add(garlandSwag);

  // Emissive Who-Land Fairy Lights woven along the house eave garland + warm doorway light
  const eaveFairyLights = createWhoLandFairyLightStrand(swagPts, {
    bulbCount: 16,
    bulbRadiusM: 0.032,
    emissiveIntensity: 3.0,
    pointLightCount: 1,
    pointLightIntensity: 0.65,
    pointLightDistance: 2.8,
  });
  eaveFairyLights.position.z = 0.028;
  house.add(eaveFairyLights);

  const doorFairyPts = archFramePts.map(
    (p) => new THREE.Vector3(p.x, p.y, p.z + 0.032)
  );
  doorArchGroup.add(
    createWhoLandFairyLightStrand(doorFairyPts, {
      bulbCount: 11,
      bulbRadiusM: 0.025,
      emissiveIntensity: 2.8,
    })
  );

  // ==========================================================================
  // 7. GIANT ROOFTOP CANDY CANE & PORCH-SIDE CANDY CANE (`media_1791675333699_107601fe.jpg`)
  // ==========================================================================
  const caneSide: -1 | 1 = cfg.dormerSide === -1 ? 1 : -1;

  // 7A. Oversized Rooftop Candy Cane sprouting from the snowy roof shoulder & curving over the street
  const rooftopCandyCane = createGiantWhovilleCandyCane(
    1.32,
    0.115,
    0.38,
    caneSide,
    sharedMats.giantCandyCaneMat,
    sharedMats.snowCapMat,
    false
  );
  rooftopCandyCane.position.set(
    caneSide * (halfW * 0.48),
    eaveY + 0.12,
    0.04
  );
  rooftopCandyCane.rotation.z = caneSide * -0.24;
  rooftopCandyCane.rotation.y = caneSide * -0.18;
  house.add(rooftopCandyCane);

  // 7B. Tall Street-Side Candy Cane planted in the snowdrift beside the house facade
  const houseStreetCane = createGiantWhovilleCandyCane(
    2.28,
    0.092,
    0.34,
    caneSide,
    sharedMats.giantCandyCaneMat,
    sharedMats.snowCapMat,
    true
  );
  houseStreetCane.position.set(
    caneSide * (halfW + 0.24),
    0.08,
    frontSurfaceZ * 0.42
  );
  houseStreetCane.rotation.z = caneSide * -0.09;
  houseStreetCane.rotation.y = caneSide * -0.22;
  house.add(houseStreetCane);

  return house;
}

/**
 * 1. Builds the 3 Pink Whoville Round Houses (DSR, USR & MSL Wagons)
 *    for element `'grinch-whoville-houses'`.
 */
export function buildGrinchWhovilleHouses(
  rockTex: THREE.CanvasTexture
): THREE.Group {
  const housesGroup = new THREE.Group();
  housesGroup.name = 'Element_grinch-whoville-houses';

  // Toned-down snow materials (all channels <= 0xd8, roughness >= 0.55 to avoid spotlight overexposure)
  const snowRoofTex = createWhovilleSnowRoofTexture();
  const papierMacheNormalTex = createPapierMacheNormalTexture();
  const snowCapMat = new THREE.MeshStandardMaterial({
    map: snowRoofTex,
    normalMap: papierMacheNormalTex,
    normalScale: new THREE.Vector2(0.65, 0.65),
    color: 0xbcd0d8,
    roughness: 0.62,
    metalness: 0.02,
  });
  const snowShadeMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    normalMap: papierMacheNormalTex,
    normalScale: new THREE.Vector2(0.68, 0.68),
    color: 0x9ab4cc,
    roughness: 0.66,
    metalness: 0.02,
  });
  const icicleMat = new THREE.MeshStandardMaterial({
    color: 0xaec6d6,
    roughness: 0.56,
    metalness: 0.08,
  });
  const inkMat = new THREE.MeshBasicMaterial({ color: 0x181422 });
  const wagonSteelMat = new THREE.MeshStandardMaterial({
    color: 0x242a38,
    roughness: 0.68,
  });
  const stoneStepMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    color: 0x8a929e,
    roughness: 0.72,
  });
  const oliveFrameMat = new THREE.MeshStandardMaterial({
    color: 0x6e8c3a,
    roughness: 0.56,
  });
  const creamFrameMat = new THREE.MeshStandardMaterial({
    map: createWhovilleArchCasingTexture(),
    color: 0xd8d0c4,
    roughness: 0.58,
  });
  const candyFrameMat = new THREE.MeshStandardMaterial({
    map: createCandyStripeTexture('#d8d0c8', '#d4283c', 10),
    roughness: 0.52,
  });
  const giantCandyStripeTex = createCandyStripeTexture('#d8d4d0', '#d81c34', 6);
  giantCandyStripeTex.repeat.set(4.5, 1.5);
  const giantCandyCaneMat = new THREE.MeshStandardMaterial({
    map: giantCandyStripeTex,
    roughness: 0.28,
    metalness: 0.06,
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xe6b832,
    roughness: 0.32,
    metalness: 0.65,
  });
  const wreathGreenMat = new THREE.MeshStandardMaterial({
    map: createPaintedPineFoliageTexture(false),
    roughness: 0.58,
  });
  const crimsonBowMat = new THREE.MeshStandardMaterial({
    color: 0xd42236,
    roughness: 0.48,
  });
  const goldBowMat = new THREE.MeshStandardMaterial({
    color: 0xf2c428,
    roughness: 0.42,
  });
  const windowGlowMat = new THREE.MeshStandardMaterial({
    map: createAmberWindowTexture(),
    color: 0xffe478,
    emissive: 0xffa622,
    emissiveIntensity: 0.68,
    roughness: 0.35,
  });
  const shutterMat = new THREE.MeshStandardMaterial({
    map: createPaintedShutterTexture(),
    roughness: 0.56,
  });
  const doorPanelMat = new THREE.MeshStandardMaterial({
    map: createWhovilleDoorTexture(),
    roughness: 0.48,
  });

  const sharedMats = {
    snowCapMat,
    snowShadeMat,
    icicleMat,
    inkMat,
    wagonSteelMat,
    stoneStepMat,
    oliveFrameMat,
    creamFrameMat,
    candyFrameMat,
    giantCandyCaneMat,
    brassMat,
    wreathGreenMat,
    crimsonBowMat,
    goldBowMat,
    windowGlowMat,
    shutterMat,
    doorPanelMat,
  };

  // DSR House (-3.35, 0, -3.05): Front steps end at z <= -2.46m (behind Papa Who's House at z = -1.98m)
  // and right edge x ≈ -2.05m leaves 0.90m open walking lane from Center Tree Turntable (x = -1.15m)
  const dsrConfig: WhovilleHouseConfig = {
    label: 'DSR',
    position: new THREE.Vector3(-3.35, 0, -3.05),
    rotationY: 0.14,
    widthM: 2.34,
    heightM: 2.76,
    depthScale: 0.38,
    basePinkHex: '#d83e82',
    bellyPinkHex: '#f26aa8',
    stripePinkHex: '#b42464',
    ribColor: 0xc42e72,
    doorX: 0.48,
    doorWidth: 0.62,
    doorHeight: 1.36,
    doorTiltZ: -0.04,
    doorFrameStyle: 'candy',
    dormerSide: -1,
    chimneyLeanX: -0.14,
    chimneyStyle: 't-cap',
    windows: [
      {
        x: -0.7,
        y: 0.94,
        width: 0.34,
        height: 0.48,
        tiltZ: 0.07,
        hasShutters: true,
        hasWreath: true,
      },
      {
        x: -0.14,
        y: 1.08,
        width: 0.38,
        height: 0.56,
        tiltZ: -0.05,
        hasShutters: true,
        hasWreath: true,
      },
    ],
  };

  // USR House (-2.12, 0, -5.02): Cleanly between the Center Tree Turntable (z = -3.55m) and Upstage Hills (z = -5.69m)
  const usrConfig: WhovilleHouseConfig = {
    label: 'USR',
    position: new THREE.Vector3(-2.12, 0, -5.02),
    rotationY: 0.06,
    widthM: 2.04,
    heightM: 2.5,
    depthScale: 0.36,
    basePinkHex: '#ce468c',
    bellyPinkHex: '#ec72b2',
    stripePinkHex: '#a62868',
    ribColor: 0xb83276,
    doorX: 0.22,
    doorWidth: 0.56,
    doorHeight: 1.24,
    doorTiltZ: 0.05,
    doorFrameStyle: 'olive',
    dormerSide: -1,
    chimneyLeanX: 0.16,
    chimneyStyle: 'bulb-pot',
    windows: [
      {
        x: -0.5,
        y: 0.98,
        width: 0.36,
        height: 0.5,
        tiltZ: 0.06,
        hasShutters: true,
        hasWreath: true,
      },
    ],
  };

  // MSL House (+3.25, 0, -3.15): Left edge x ≈ +1.95m leaves 0.80m open walking lane from Center Tree Turntable (x = +1.15m)
  const mslConfig: WhovilleHouseConfig = {
    label: 'MSL',
    position: new THREE.Vector3(3.25, 0, -3.15),
    rotationY: -0.14,
    widthM: 2.3,
    heightM: 2.72,
    depthScale: 0.38,
    basePinkHex: '#dc4286',
    bellyPinkHex: '#f46ea8',
    stripePinkHex: '#b82666',
    ribColor: 0xc83074,
    doorX: -0.46,
    doorWidth: 0.62,
    doorHeight: 1.34,
    doorTiltZ: 0.04,
    doorFrameStyle: 'candy',
    dormerSide: 1,
    chimneyLeanX: -0.18,
    chimneyStyle: 'keyhole-pot',
    windows: [
      {
        x: 0.16,
        y: 0.78,
        width: 0.22,
        height: 0.32,
        tiltZ: -0.06,
        hasShutters: false,
        hasWreath: false,
      },
      {
        x: 0.66,
        y: 1.02,
        width: 0.36,
        height: 0.52,
        tiltZ: -0.07,
        hasShutters: true,
        hasWreath: true,
      },
    ],
  };

  housesGroup.add(buildSingleWhovilleHouse(dsrConfig, sharedMats));
  housesGroup.add(buildSingleWhovilleHouse(usrConfig, sharedMats));
  housesGroup.add(buildSingleWhovilleHouse(mslConfig, sharedMats));

  // Freestanding Oversized Whoville Street Candy Canes planted in snowdrifts along the town square
  // (`media_1791675333699_107601fe.jpg`)
  const townCandyCaneSpecs: ReadonlyArray<{
    x: number;
    z: number;
    heightM: number;
    tubeR: number;
    hookR: number;
    hookDir: -1 | 1;
    rotY: number;
    tiltZ: number;
  }> = [
    // Stage Right street lane between DSR & USR houses
    {
      x: -2.42,
      z: -3.95,
      heightM: 2.58,
      tubeR: 0.105,
      hookR: 0.38,
      hookDir: 1,
      rotY: 0.22,
      tiltZ: -0.08,
    },
    // Stage Left street lane just upstage of MSL house
    {
      x: 2.32,
      z: -4.12,
      heightM: 2.52,
      tubeR: 0.102,
      hookR: 0.37,
      hookDir: -1,
      rotY: -0.24,
      tiltZ: 0.09,
    },
    // Upstage Left avenue candy cane arch
    {
      x: 1.54,
      z: -4.88,
      heightM: 2.24,
      tubeR: 0.094,
      hookR: 0.33,
      hookDir: -1,
      rotY: -0.15,
      tiltZ: 0.07,
    },
    // Upstage Center-Right village lane candy cane
    {
      x: -0.88,
      z: -4.92,
      heightM: 2.18,
      tubeR: 0.09,
      hookR: 0.32,
      hookDir: 1,
      rotY: 0.18,
      tiltZ: -0.06,
    },
    // Far Stage Right avenue candy cane beside DSR house
    {
      x: -3.72,
      z: -4.25,
      heightM: 2.38,
      tubeR: 0.096,
      hookR: 0.35,
      hookDir: 1,
      rotY: 0.32,
      tiltZ: -0.1,
    },
  ];

  for (const spec of townCandyCaneSpecs) {
    const streetCane = createGiantWhovilleCandyCane(
      spec.heightM,
      spec.tubeR,
      spec.hookR,
      spec.hookDir,
      giantCandyCaneMat,
      snowCapMat,
      true
    );
    streetCane.position.set(spec.x, 0, spec.z);
    streetCane.rotation.y = spec.rotY;
    streetCane.rotation.z = spec.tiltZ;
    housesGroup.add(streetCane);
  }

  // 3 Expressive Whoville Carolers / Townspeople standing in open town-square lanes
  // (clear of the Center Tree Turntable, Papa Who's House in Scene 1E, Shopping Booths in 1D, and Finale Banquet in 1G)
  const carolerSR = createWhoCharacter({
    heightM: 1.66,
    coatColorHex: 0x2268d8,
    trimColorHex: 0xd4d8e2,
    hairColorHex: 0x68381c,
    hatColorHex: 0xd82868,
    holdingGift: true,
  });
  carolerSR.position.set(-1.82, 0, -2.58);
  carolerSR.rotation.y = 0.28;
  housesGroup.add(carolerSR);

  const carolerSL = createWhoCharacter({
    heightM: 1.62,
    coatColorHex: 0xd82e78,
    trimColorHex: 0xd8dce4,
    hairColorHex: 0xf0c248,
    hasBraids: true,
  });
  carolerSL.position.set(1.75, 0, -2.68);
  carolerSL.rotation.y = -0.32;
  housesGroup.add(carolerSL);

  const carolerChild = createWhoCharacter({
    heightM: 1.24,
    coatColorHex: 0x4ea42e,
    trimColorHex: 0xd8dce4,
    hairColorHex: 0xe69828,
    hasBraids: true,
    holdingGift: true,
  });
  carolerChild.position.set(-3.12, 0, -4.18);
  carolerChild.rotation.y = 0.24;
  housesGroup.add(carolerChild);

  return housesGroup;
}

/**
 * 2. Builds the Center Whoville Christmas Tree & Presents Turntable (`x = 0.0m, z = -3.55m`)
 *    for element `'grinch-whoville-tree'`.
 */
export function buildGrinchWhovilleTree(
  rockTex: THREE.CanvasTexture
): THREE.Group {
  const treeWagonGroup = new THREE.Group();
  treeWagonGroup.name = 'Element_grinch-whoville-tree';
  treeWagonGroup.position.set(0.0, 0, -3.55);

  // Toned-down snow turntable materials (max hex channel <= 0xd8, roughness >= 0.55)
  const papierMacheNormalTex = createPapierMacheNormalTexture();
  const snowTurntableMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    normalMap: papierMacheNormalTex,
    normalScale: new THREE.Vector2(0.62, 0.62),
    color: 0xbcd0d8,
    roughness: 0.62,
    metalness: 0.02,
  });
  const snowStepMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    normalMap: papierMacheNormalTex,
    normalScale: new THREE.Vector2(0.65, 0.65),
    color: 0xa4bcd2,
    roughness: 0.65,
    metalness: 0.02,
  });
  const deckSteelMat = new THREE.MeshStandardMaterial({
    color: 0x222836,
    roughness: 0.7,
  });

  // ==========================================================================
  // 1. ROUND SNOW TURNTABLE BASE (r = 1.15m with stepped snow rim & front steps)
  // ==========================================================================
  const casterSubDeck = new THREE.Mesh(
    new THREE.CylinderGeometry(1.13, 1.15, 0.06, 32),
    deckSteelMat
  );
  casterSubDeck.position.y = 0.03;
  casterSubDeck.receiveShadow = true;
  treeWagonGroup.add(casterSubDeck);

  const lowerSnowDrum = new THREE.Mesh(
    new THREE.CylinderGeometry(1.08, 1.13, 0.14, 36),
    snowStepMat
  );
  lowerSnowDrum.position.y = 0.13;
  lowerSnowDrum.castShadow = true;
  lowerSnowDrum.receiveShadow = true;
  treeWagonGroup.add(lowerSnowDrum);

  const upperSnowRim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 1.03, 0.12, 36),
    snowTurntableMat
  );
  upperSnowRim.position.y = 0.26;
  upperSnowRim.castShadow = true;
  upperSnowRim.receiveShadow = true;
  treeWagonGroup.add(upperSnowRim);

  // Stepped semi-circular downstage snow steps tucked within the r = 1.15m envelope
  const frontStepLower = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.98,
      1.04,
      0.08,
      24,
      1,
      false,
      -Math.PI * 0.45,
      Math.PI * 0.9
    ),
    snowTurntableMat
  );
  frontStepLower.scale.set(1.0, 1.0, 0.32);
  frontStepLower.position.set(0, 0.04, 0.8);
  frontStepLower.receiveShadow = true;
  treeWagonGroup.add(frontStepLower);

  const frontStepUpper = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.86,
      0.92,
      0.08,
      24,
      1,
      false,
      -Math.PI * 0.42,
      Math.PI * 0.84
    ),
    snowStepMat
  );
  frontStepUpper.scale.set(1.0, 1.0, 0.28);
  frontStepUpper.position.set(0, 0.12, 0.76);
  frontStepUpper.receiveShadow = true;
  treeWagonGroup.add(frontStepUpper);

  // ==========================================================================
  // 2. 7-TIER S-CURVED SEUSSIAN TREE FOLIAGE WITH SCALLOPED BRANCH LOBES
  // ==========================================================================
  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x543622,
    roughness: 0.78,
  });
  const foliageDeepMat = new THREE.MeshStandardMaterial({
    map: createPaintedPineFoliageTexture(false),
    roughness: 0.56,
  });
  const foliageBrightMat = new THREE.MeshStandardMaterial({
    map: createPaintedPineFoliageTexture(true),
    roughness: 0.52,
  });

  // Helper function defining the S-curve spine of the Whoville Christmas Tree (max height <= 4.25m)
  const getSpineOffset = (y: number): { x: number; z: number; tiltZ: number } => {
    const t = Math.max(0, Math.min(1, (y - 0.3) / 3.55));
    const sx = Math.sin(t * Math.PI * 1.85) * 0.13 * (0.4 + t * 0.8);
    const sz = Math.cos(t * Math.PI * 1.4) * 0.045;
    const tiltZ = -Math.cos(t * Math.PI * 1.85) * 0.13;
    return { x: sx, z: sz, tiltZ };
  };

  // Curved wooden trunk at the base
  const trunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.28, 0),
    new THREE.Vector3(0.05, 1.1, 0.02),
    new THREE.Vector3(-0.06, 2.15, -0.02),
    new THREE.Vector3(0.04, 3.4, 0.01),
  ]);
  const trunkMesh = new THREE.Mesh(
    new THREE.TubeGeometry(trunkCurve, 20, 0.14, 10, false),
    trunkMat
  );
  treeWagonGroup.add(trunkMesh);

  // 7 Stacked Foliage Tiers with Scalloped Branch Lobes (spanning y = 0.60m to 3.30m)
  const tierCount = 7;
  for (let tier = 0; tier < tierCount; tier++) {
    const tierFrac = tier / (tierCount - 1);
    const tierY = 0.6 + tier * 0.45;
    const baseRadius = 1.08 - tier * 0.128;
    const tierHeight = 0.78 - tier * 0.04;
    const spine = getSpineOffset(tierY);

    const tierGroup = new THREE.Group();
    tierGroup.position.set(spine.x, tierY, spine.z);
    tierGroup.rotation.z =
      spine.tiltZ + (tier % 2 === 0 ? 1 : -1) * (0.04 + tierFrac * 0.03);

    // Fluted cone body using LatheGeometry with curved concave skirt profile
    const conePts: THREE.Vector2[] = [];
    for (let s = 0; s <= 10; s++) {
      const u = s / 10;
      const flare = Math.pow(1 - u, 1.18) * baseRadius;
      const py = (u - 0.35) * tierHeight;
      conePts.push(new THREE.Vector2(Math.max(0.02, flare), py));
    }
    const tierCone = new THREE.Mesh(
      new THREE.LatheGeometry(conePts, 18),
      tier % 2 === 0 ? foliageDeepMat : foliageBrightMat
    );
    tierCone.castShadow = true;
    tierCone.receiveShadow = true;
    tierGroup.add(tierCone);

    // Ring of sculpted drooping branch-tip lobes around the lower hem of each tier
    const lobeCount = Math.max(7, 13 - tier);
    for (let l = 0; l < lobeCount; l++) {
      const lAngle = (l / lobeCount) * Math.PI * 2 + tier * 0.35;
      const lobeRad = baseRadius * 0.94;
      const branchLobe = new THREE.Mesh(
        new THREE.ConeGeometry(0.17 - tier * 0.013, 0.34 - tier * 0.018, 7),
        tier % 2 === 0 ? foliageBrightMat : foliageDeepMat
      );
      branchLobe.position.set(
        Math.cos(lAngle) * lobeRad,
        -tierHeight * 0.28,
        Math.sin(lAngle) * lobeRad
      );
      branchLobe.rotation.z = -Math.cos(lAngle) * 0.65;
      branchLobe.rotation.x = Math.sin(lAngle) * 0.65;
      branchLobe.castShadow = true;
      tierGroup.add(branchLobe);
    }

    treeWagonGroup.add(tierGroup);
  }

  // ==========================================================================
  // 3. CONTINUOUS 3D SPIRAL GOLD & RED TINSEL GARLAND (Helical CatmullRomCurve3)
  // ==========================================================================
  const goldTinselMat = new THREE.MeshStandardMaterial({
    color: 0xffd028,
    emissive: 0xc87a08,
    emissiveIntensity: 0.28,
    roughness: 0.28,
    metalness: 0.62,
  });
  const redTinselMat = new THREE.MeshStandardMaterial({
    color: 0xe61e32,
    roughness: 0.35,
    metalness: 0.38,
  });

  const goldHelixPts: THREE.Vector3[] = [];
  const redHelixPts: THREE.Vector3[] = [];
  const helixSteps = 72;
  const turns = 5.5;
  for (let i = 0; i <= helixSteps; i++) {
    const t = i / helixSteps;
    const y = 0.58 + t * 2.95;
    const spine = getSpineOffset(y);
    // Offset radially outside the foliage cones (+0.06m) so the garland never clips coplanarly
    const outerRadius = (1.04 - t * 0.84) + Math.sin(t * Math.PI * 12) * 0.035;
    const thetaGold = t * Math.PI * 2 * turns;
    const thetaRed = thetaGold + Math.PI;

    goldHelixPts.push(
      new THREE.Vector3(
        spine.x + Math.cos(thetaGold) * outerRadius,
        y,
        spine.z + Math.sin(thetaGold) * outerRadius
      )
    );
    redHelixPts.push(
      new THREE.Vector3(
        spine.x + Math.cos(thetaRed) * (outerRadius + 0.032),
        y - 0.035,
        spine.z + Math.sin(thetaRed) * (outerRadius + 0.032)
      )
    );
  }

  const goldGarlandMesh = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(goldHelixPts),
      140,
      0.03,
      8,
      false
    ),
    goldTinselMat
  );
  treeWagonGroup.add(goldGarlandMesh);

  const redGarlandMesh = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(redHelixPts),
      140,
      0.022,
      8,
      false
    ),
    redTinselMat
  );
  treeWagonGroup.add(redGarlandMesh);

  // ==========================================================================
  // 4. ORNAMENTS, GOLD BELLS, STARBURSTS, GIANT CANDY CANES & CANDLE-LIGHTS
  // ==========================================================================
  const ornamentColors = [
    0xf21e36,
    0xffc824,
    0x1e78f0,
    0xd82894,
    0x8832e8,
    0xff7818,
  ];
  const ornamentMats = ornamentColors.map(
    (col) =>
      new THREE.MeshStandardMaterial({
        color: col,
        roughness: 0.2,
        metalness: 0.48,
      })
  );

  // 36 Glossy Spherical Ornaments with gold hanger caps
  const totalBaubles = 36;
  for (let b = 0; b < totalBaubles; b++) {
    const t = (b + 0.5) / totalBaubles;
    const y = 0.64 + t * 2.84;
    const spine = getSpineOffset(y);
    const angle = b * 2.39996; // Golden-angle spiral distribution
    const rad = (1.02 - t * 0.8) + 0.045;
    const bRadius = 0.072 - t * 0.02;
    const mat = ornamentMats[b % ornamentMats.length] ?? ornamentMats[0]!;

    const baubleGroup = new THREE.Group();
    baubleGroup.position.set(
      spine.x + Math.cos(angle) * rad,
      y,
      spine.z + Math.sin(angle) * rad
    );

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(bRadius, 12, 12),
      mat
    );
    sphere.castShadow = true;
    baubleGroup.add(sphere);

    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(bRadius * 0.32, bRadius * 0.36, 0.026, 8),
      goldTinselMat
    );
    cap.position.y = bRadius * 0.98;
    baubleGroup.add(cap);

    treeWagonGroup.add(baubleGroup);
  }

  // 8 Sculpted Gold Bell Ornaments & 10 Multi-Point Starburst Ornaments (matching Model 1B)
  const bellProfile: THREE.Vector2[] = [
    new THREE.Vector2(0.01, 0.085),
    new THREE.Vector2(0.042, 0.075),
    new THREE.Vector2(0.056, 0.02),
    new THREE.Vector2(0.098, -0.055),
    new THREE.Vector2(0.084, -0.065),
  ];
  const bellGeo = new THREE.LatheGeometry(bellProfile, 14);

  for (let k = 0; k < 10; k++) {
    const t = (k + 0.6) / 10.5;
    const y = 0.76 + t * 2.6;
    const spine = getSpineOffset(y);
    // Bias toward the downstage face (+z) so they shine prominently like Model 1B
    const angle = (k % 2 === 0 ? 1 : -1) * (0.22 + (k % 3) * 0.35);
    const rad = (1.04 - t * 0.78) + 0.07;

    if (k % 2 === 0) {
      // Multi-point Seussian Starburst / Poinsettia Ornament
      const burstGroup = new THREE.Group();
      burstGroup.position.set(
        spine.x + Math.sin(angle) * rad,
        y,
        spine.z + Math.cos(angle) * rad
      );
      burstGroup.rotation.y = angle;
      const burstMat = ornamentMats[(k * 2) % ornamentMats.length] ?? ornamentMats[0]!;
      for (let ray = 0; ray < 6; ray++) {
        const rayCone = new THREE.Mesh(
          new THREE.ConeGeometry(0.034, 0.2, 5),
          burstMat
        );
        rayCone.rotation.z = (ray / 6) * Math.PI;
        burstGroup.add(rayCone);
      }
      const centerDot = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 8, 8),
        goldTinselMat
      );
      centerDot.position.z = 0.025;
      burstGroup.add(centerDot);
      treeWagonGroup.add(burstGroup);
    } else {
      // Gold Bell Ornament
      const bell = new THREE.Mesh(bellGeo, goldTinselMat);
      bell.position.set(
        spine.x + Math.sin(angle) * rad,
        y,
        spine.z + Math.cos(angle) * rad
      );
      bell.rotation.z = (k % 3 - 1) * 0.24;
      treeWagonGroup.add(bell);
    }
  }

  // 8 Giant Candy Canes hooked onto branches + 12 Warm Candle-Lights
  const candyCaneMat = new THREE.MeshStandardMaterial({
    map: createCandyStripeTexture('#e8e4dc', '#d91e34', 6),
    roughness: 0.38,
  });
  const candleWaxMat = new THREE.MeshStandardMaterial({
    color: 0xf4ecd8,
    roughness: 0.5,
  });
  const flameMat = new THREE.MeshStandardMaterial({
    color: 0xffe864,
    emissive: 0xff9e18,
    emissiveIntensity: 1.15,
    roughness: 0.2,
  });

  const caneHookCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.16, 0),
    new THREE.Vector3(0, 0.07, 0),
    new THREE.Vector3(0.038, 0.14, 0),
    new THREE.Vector3(0.092, 0.11, 0),
    new THREE.Vector3(0.1, 0.045, 0),
  ]);
  const caneGeo = new THREE.TubeGeometry(caneHookCurve, 18, 0.02, 8, false);

  for (let c = 0; c < 8; c++) {
    const t = (c + 0.5) / 8.5;
    const y = 0.8 + t * 2.42;
    const spine = getSpineOffset(y);
    const angle = c * 0.85 - 2.6;
    const rad = (1.02 - t * 0.76) + 0.065;

    const cane = new THREE.Mesh(caneGeo, candyCaneMat);
    cane.position.set(
      spine.x + Math.sin(angle) * rad,
      y,
      spine.z + Math.cos(angle) * rad
    );
    cane.rotation.y = angle;
    cane.rotation.z = (c % 2 === 0 ? 1 : -1) * 0.25;
    treeWagonGroup.add(cane);
  }

  for (let l = 0; l < 12; l++) {
    const t = (l + 0.3) / 12.2;
    const y = 0.68 + t * 2.74;
    const spine = getSpineOffset(y);
    const angle = (l / 12) * Math.PI * 2 + 0.4;
    const rad = (1.06 - t * 0.8) + 0.055;

    const candleGroup = new THREE.Group();
    candleGroup.position.set(
      spine.x + Math.cos(angle) * rad,
      y,
      spine.z + Math.sin(angle) * rad
    );

    const waxStick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.017, 0.1, 8),
      candleWaxMat
    );
    waxStick.position.y = 0.05;
    candleGroup.add(waxStick);

    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.022, 0.06, 8),
      flameMat
    );
    flame.position.y = 0.13;
    candleGroup.add(flame);

    treeWagonGroup.add(candleGroup);
  }

  // Spiraling 68-Bulb Strand of Emissive Who-Land Fairy Lights winding up all 7 tiers of the 3D Showpiece Tree
  const treeFairyHelixPts: THREE.Vector3[] = [];
  const fairyHelixSteps = 56;
  const fairyTurns = 6.2;
  for (let i = 0; i <= fairyHelixSteps; i++) {
    const t = i / fairyHelixSteps;
    const y = 0.62 + t * 2.92;
    const spine = getSpineOffset(y);
    const outerRadius = 1.06 - t * 0.83 + Math.cos(t * Math.PI * 14) * 0.03;
    const theta = t * Math.PI * 2 * fairyTurns + Math.PI * 0.5;
    treeFairyHelixPts.push(
      new THREE.Vector3(
        spine.x + Math.cos(theta) * outerRadius,
        y,
        spine.z + Math.sin(theta) * outerRadius
      )
    );
  }
  const treeFairyStrand = createWhoLandFairyLightStrand(treeFairyHelixPts, {
    bulbCount: 68,
    bulbRadiusM: 0.034,
    emissiveIntensity: 0.95,
    pointLightCount: 3,
    pointLightIntensity: 0.95,
    pointLightDistance: 3.6,
  });
  treeWagonGroup.add(treeFairyStrand);

  // ==========================================================================
  // 5. RADIANT MULTI-POINT 3D GOLD STAR TOPPER WITH WHIMSICAL SEUSSIAN CURL
  //    (Topper apex reaches y = 4.22m <= 4.25m, leaving > 0.70m clearance below banner)
  // ==========================================================================
  const starTopMat = new THREE.MeshStandardMaterial({
    color: 0xffdf48,
    emissive: 0xffb418,
    emissiveIntensity: 1.85,
    roughness: 0.18,
    metalness: 0.45,
    toneMapped: false,
  });

  const topSpine = getSpineOffset(3.74);
  const starGroup = new THREE.Group();
  starGroup.position.set(topSpine.x, 3.74, topSpine.z);
  starGroup.rotation.z = -0.08;

  // Warm radiant PointLight inside the 3D star topper
  const starBeaconLight = new THREE.PointLight(0xffe070, 0.9, 3.5, 1.8);
  starBeaconLight.position.set(0, 0.05, 0.14);
  starGroup.add(starBeaconLight);

  // Central faceted gold star core
  const starCore = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.13, 0),
    starTopMat
  );
  starCore.scale.set(1.0, 1.0, 0.65);
  starGroup.add(starCore);

  // 5 Primary Star Points + 5 Secondary Diagonal Rays
  for (let p = 0; p < 5; p++) {
    const pAngle = (p / 5) * Math.PI * 2;
    const ray = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.31, 4),
      starTopMat
    );
    ray.position.set(
      Math.sin(pAngle) * 0.14,
      Math.cos(pAngle) * 0.14,
      0
    );
    ray.rotation.z = -pAngle;
    starGroup.add(ray);

    const subAngle = pAngle + Math.PI / 5;
    const subRay = new THREE.Mesh(
      new THREE.ConeGeometry(0.042, 0.18, 4),
      starTopMat
    );
    subRay.position.set(
      Math.sin(subAngle) * 0.095,
      Math.cos(subAngle) * 0.095,
      0.02
    );
    subRay.rotation.z = -subAngle;
    starGroup.add(subRay);
  }

  // Whimsical Seussian Spiral Curl at the Top Tip of the Star (reaches y = 4.22m)
  const curlPts: THREE.Vector3[] = [];
  for (let s = 0; s <= 24; s++) {
    const u = s / 24;
    const cAngle = u * Math.PI * 2.6;
    const cRad = (1 - u * 0.72) * 0.088;
    curlPts.push(
      new THREE.Vector3(
        Math.sin(cAngle) * cRad + u * 0.055,
        0.26 + u * 0.2 - Math.cos(cAngle) * cRad * 0.5,
        Math.sin(u * Math.PI) * 0.02
      )
    );
  }
  const starCurl = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(curlPts),
      24,
      0.015,
      8,
      false
    ),
    starTopMat
  );
  starGroup.add(starCurl);

  treeWagonGroup.add(starGroup);

  // ==========================================================================
  // 6. 20 WRAPPED SEUSSIAN GIFT BOXES, HATBOXES, TOY TRAIN & TRICYCLE/DRUM PROPS
  // ==========================================================================
  const giftColors = [
    0xf0243a,
    0xff8a1e,
    0xffcf24,
    0x7e32e6,
    0x1e84f4,
    0xe83892,
  ];
  const ribbonColors = [0xffdf38, 0xffffff, 0x1ee068, 0xf42242];

  const giftBoxMats = giftColors.map(
    (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.42 })
  );
  const giftRibbonMats = ribbonColors.map(
    (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.34 })
  );

  // 20 Gifts arranged in two lush rings within the r = 1.15m snow turntable
  const totalGifts = 20;
  for (let gIdx = 0; gIdx < totalGifts; gIdx++) {
    const isOuterRing = gIdx >= 10;
    const ringIndex = isOuterRing ? gIdx - 10 : gIdx;
    const angle =
      ((ringIndex / 10) - 0.5) * Math.PI * (isOuterRing ? 1.35 : 1.65);
    const radius = isOuterRing
      ? 0.78 + (gIdx % 3) * 0.06
      : 0.5 + (gIdx % 2) * 0.12;
    const gx = Math.sin(angle) * radius;
    const gz = Math.cos(angle) * radius + (isOuterRing ? 0.05 : 0.02);
    const baseSurfaceY = isOuterRing ? 0.21 : 0.32;

    const boxW = 0.19 + (gIdx % 3) * 0.04;
    const boxH = 0.21 + ((gIdx * 3) % 4) * 0.06;
    const boxD = 0.19 + ((gIdx + 1) % 3) * 0.038;
    const isHatbox = gIdx % 4 === 1;

    const gMat = giftBoxMats[gIdx % giftBoxMats.length] ?? giftBoxMats[0]!;
    const rMat =
      giftRibbonMats[(gIdx + 1) % giftRibbonMats.length] ?? giftRibbonMats[0]!;

    const giftGroup = new THREE.Group();
    giftGroup.position.set(gx, baseSurfaceY + boxH * 0.5, gz);
    giftGroup.rotation.y = gIdx * 0.55;
    giftGroup.rotation.z = ((gIdx % 3) - 1) * 0.07;

    if (isHatbox) {
      // Cylindrical Seussian Hatbox with oversized lid & non-coplanar ribbon band
      const cyl = new THREE.Mesh(
        new THREE.CylinderGeometry(boxW * 0.55, boxW * 0.52, boxH, 16),
        gMat
      );
      cyl.castShadow = true;
      giftGroup.add(cyl);

      const lid = new THREE.Mesh(
        new THREE.CylinderGeometry(boxW * 0.6, boxW * 0.6, 0.045, 16),
        rMat
      );
      lid.position.y = boxH * 0.5 + 0.015;
      giftGroup.add(lid);
    } else {
      // Tilted Cube/Rectangular Gift Box with non-coplanar crossed ribbons (+0.016m proud)
      const box = new THREE.Mesh(
        new RoundedBoxGeometry(boxW, boxH, boxD, 2, 0.02),
        gMat
      );
      box.castShadow = true;
      giftGroup.add(box);

      const ribA = new THREE.Mesh(
        new THREE.BoxGeometry(boxW + 0.032, boxH + 0.032, 0.042),
        rMat
      );
      giftGroup.add(ribA);

      const ribB = new THREE.Mesh(
        new THREE.BoxGeometry(0.042, boxH + 0.032, boxD + 0.032),
        rMat
      );
      giftGroup.add(ribB);
    }

    // 3D Multi-Loop Ribbon Bow on top of every gift
    for (const bSide of [-1, 1]) {
      const bowLoop = new THREE.Mesh(
        new THREE.TorusGeometry(0.045, 0.014, 8, 12),
        rMat
      );
      bowLoop.position.set(bSide * 0.035, boxH * 0.5 + 0.045, 0);
      bowLoop.rotation.z = bSide * 0.35;
      giftGroup.add(bowLoop);
    }

    treeWagonGroup.add(giftGroup);
  }

  // Toy Train Track & Miniature Steam Locomotive on the front-left turntable rim
  const trainGroup = new THREE.Group();
  trainGroup.position.set(-0.46, 0.33, 0.72);
  trainGroup.rotation.y = 0.42;

  const trackArc = new THREE.Mesh(
    new THREE.TorusGeometry(0.28, 0.012, 8, 20, Math.PI * 0.75),
    goldTinselMat
  );
  trackArc.rotation.x = Math.PI * 0.5;
  trackArc.position.set(0, -0.01, -0.18);
  trainGroup.add(trackArc);

  const engineBoiler = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 0.18, 12),
    redTinselMat
  );
  engineBoiler.rotation.z = Math.PI * 0.5;
  engineBoiler.position.set(0, 0.065, 0.06);
  trainGroup.add(engineBoiler);

  const engineCab = new THREE.Mesh(
    new RoundedBoxGeometry(0.09, 0.13, 0.1, 2, 0.01),
    ornamentMats[2] ?? redTinselMat
  );
  engineCab.position.set(-0.08, 0.09, 0.06);
  trainGroup.add(engineCab);

  const smokestack = new THREE.Mesh(
    new THREE.ConeGeometry(0.035, 0.08, 10),
    goldTinselMat
  );
  smokestack.rotation.x = Math.PI;
  smokestack.position.set(0.06, 0.14, 0.06);
  trainGroup.add(smokestack);

  treeWagonGroup.add(trainGroup);

  // Miniature Crooked Seussian Tricycle & Parade Drum on the front-right snow step
  const propsGroup = new THREE.Group();
  propsGroup.position.set(0.48, 0.33, 0.74);
  propsGroup.rotation.y = -0.38;

  // Parade Drum
  const drumBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.13, 16),
    redTinselMat
  );
  drumBody.position.set(-0.16, 0.065, 0.04);
  propsGroup.add(drumBody);

  const drumHead = new THREE.Mesh(
    new THREE.CylinderGeometry(0.106, 0.106, 0.025, 16),
    candleWaxMat
  );
  drumHead.position.set(-0.16, 0.135, 0.04);
  propsGroup.add(drumHead);

  // Crooked Seussian Tricycle
  const frontWheel = new THREE.Mesh(
    new THREE.TorusGeometry(0.08, 0.013, 8, 16),
    goldTinselMat
  );
  frontWheel.position.set(0.11, 0.08, 0.04);
  propsGroup.add(frontWheel);

  for (const wSide of [-1, 1]) {
    const rearWheel = new THREE.Mesh(
      new THREE.TorusGeometry(0.052, 0.011, 8, 14),
      goldTinselMat
    );
    rearWheel.position.set(-0.04, 0.052, 0.04 + wSide * 0.08);
    propsGroup.add(rearWheel);
  }

  const trikeFrameCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.04, 0.055, 0.04),
    new THREE.Vector3(0.04, 0.15, 0.04),
    new THREE.Vector3(0.11, 0.08, 0.04),
  ]);
  const trikeFrame = new THREE.Mesh(
    new THREE.TubeGeometry(trikeFrameCurve, 12, 0.014, 8, false),
    redTinselMat
  );
  propsGroup.add(trikeFrame);

  treeWagonGroup.add(propsGroup);

  return treeWagonGroup;
}

/**
 * 3. Builds the Lineset #15 (10'-6") `"MERRY CHRISTMAS WHOVILLE"` Banner (`y = 5.45m, z = -3.15m`)
 *    for element `'grinch-christmas-sign'`.
 */
export function buildGrinchChristmasSign(): THREE.Group {
  const signGroup = new THREE.Group();
  signGroup.name = 'Element_grinch-christmas-sign';

  const bannerCenterY = 5.45;
  const bannerZ = -3.15;
  const bannerWidth = 4.56;
  const bannerHeight = 0.88;
  const halfSpan = bannerWidth * 0.5;

  // Catenary sag helper matching the curved hanging silhouette in Model 1B / 1D / 1G
  const getCatenarySag = (x: number): number => {
    const u = Math.max(-1, Math.min(1, x / halfSpan));
    return -0.18 * (1 - u * u);
  };

  // ==========================================================================
  // 1. HIGH-RESOLUTION SEUSSIAN DISPLAY TYPOGRAPHY (1024×320)
  // ==========================================================================
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 1024;
  signCanvas.height = 320;
  const sCtx = signCanvas.getContext('2d');
  if (sCtx) {
    // Rich crimson theatre-banner velvet gradient
    const bgGrad = sCtx.createLinearGradient(0, 0, 0, 320);
    bgGrad.addColorStop(0, '#8c0e20');
    bgGrad.addColorStop(0.45, '#d82238');
    bgGrad.addColorStop(1, '#7c0c1c');
    sCtx.fillStyle = bgGrad;
    sCtx.fillRect(0, 0, 1024, 320);

    // Trompe-l'oeil vertical catenary fabric fold shadows & highlights across the banner
    for (let fx = 0; fx < 1024; fx += 64) {
      const foldGrad = sCtx.createLinearGradient(fx, 0, fx + 64, 0);
      foldGrad.addColorStop(0, 'rgba(30, 4, 10, 0.22)');
      foldGrad.addColorStop(0.48, 'rgba(255, 110, 130, 0.14)');
      foldGrad.addColorStop(1, 'rgba(30, 4, 10, 0.22)');
      sCtx.fillStyle = foldGrad;
      sCtx.fillRect(fx, 0, 64, 320);
    }

    // Scattered festive gold & cream polka-dots across the crimson velvet field (matching Model 1B)
    for (let p = 0; p < 58; p++) {
      const px = 42 + ((p * 173 + 29) % 940);
      const py = 36 + ((p * 89 + 17) % 248);
      const pr = 3.2 + (p % 3) * 1.4;
      sCtx.fillStyle = p % 4 === 0 ? 'rgba(255, 244, 196, 0.55)' : 'rgba(255, 212, 56, 0.48)';
      sCtx.beginPath();
      sCtx.arc(px, py, pr, 0, Math.PI * 2);
      sCtx.fill();
    }

    // Seussian pen-and-ink cross-hatch vignettes along the top/bottom edges & corners
    sCtx.strokeStyle = 'rgba(22, 6, 12, 0.36)';
    sCtx.lineWidth = 1.6;
    for (let hx = 24; hx < 1000; hx += 16) {
      sCtx.beginPath();
      sCtx.moveTo(hx, 18);
      sCtx.lineTo(hx - 10, 38);
      sCtx.moveTo(hx, 300);
      sCtx.lineTo(hx + 10, 276);
      sCtx.stroke();
    }

    // Double gold border frame with dark ink bevel
    sCtx.strokeStyle = '#1e060c';
    sCtx.lineWidth = 11;
    sCtx.strokeRect(18, 16, 988, 284);
    sCtx.strokeStyle = '#ffd238';
    sCtx.lineWidth = 6.5;
    sCtx.strokeRect(18, 16, 988, 284);

    sCtx.strokeStyle = 'rgba(255, 236, 170, 0.58)';
    sCtx.lineWidth = 3;
    sCtx.setLineDash([14, 10]);
    sCtx.strokeRect(30, 28, 964, 260);
    sCtx.setLineDash([]);

    // Ornate gold filigree scroll corners & painted holly berry clusters
    for (const [cx, cy, sx, sy] of [
      [56, 56, 1, 1],
      [968, 56, -1, 1],
      [56, 260, 1, -1],
      [968, 260, -1, -1],
    ] as const) {
      sCtx.save();
      sCtx.translate(cx, cy);
      sCtx.scale(sx, sy);

      // Gold filigree spiral flourish
      sCtx.strokeStyle = '#ffda48';
      sCtx.lineWidth = 4;
      sCtx.beginPath();
      sCtx.moveTo(0, 38);
      sCtx.bezierCurveTo(0, 8, 8, 0, 48, 0);
      sCtx.bezierCurveTo(26, 18, 18, 26, 28, 34);
      sCtx.stroke();

      // Holly leaves & crimson berries in corner motif with dark Seussian ink outlines
      sCtx.fillStyle = '#24983e';
      sCtx.strokeStyle = '#0c2814';
      sCtx.lineWidth = 2;
      sCtx.beginPath();
      sCtx.ellipse(18, 10, 14, 6, 0.35, 0, Math.PI * 2);
      sCtx.fill();
      sCtx.stroke();
      sCtx.beginPath();
      sCtx.ellipse(10, 18, 14, 6, 1.2, 0, Math.PI * 2);
      sCtx.fill();
      sCtx.stroke();

      sCtx.fillStyle = '#ff283c';
      sCtx.beginPath();
      sCtx.arc(8, 8, 4.5, 0, Math.PI * 2);
      sCtx.arc(16, 6, 4, 0, Math.PI * 2);
      sCtx.arc(6, 16, 4, 0, Math.PI * 2);
      sCtx.fill();

      sCtx.restore();
    }

    // Festive gold stars / dots along the upper and lower border
    sCtx.fillStyle = '#ffd83b';
    for (let dx = 112; dx <= 912; dx += 64) {
      sCtx.beginPath();
      sCtx.arc(dx, 42, 4.8, 0, Math.PI * 2);
      sCtx.arc(dx, 274, 4.8, 0, Math.PI * 2);
      sCtx.fill();
    }

    // Authentic Seussian Display Typography ("MERRY CHRISTMAS" + "WHOVILLE!")
    drawSeussianDisplayText(sCtx, 'MERRY CHRISTMAS', 512, 118, {
      fontSize: 64,
      fillTopColor: '#fff8dc',
      fillBottomColor: '#ffd248',
      outlineColor: '#2a0810',
      shadowColor: '#180408',
      bounceAmp: 5,
      tiltAmp: 0.08,
      archCurvature: -0.05,
      letterSpacing: 40,
    });
    drawSeussianDisplayText(sCtx, 'WHOVILLE!', 512, 208, {
      fontSize: 74,
      fillTopColor: '#98ea44',
      fillBottomColor: '#1e9c34',
      outlineColor: '#0c2810',
      shadowColor: '#061808',
      bounceAmp: 6,
      tiltAmp: 0.09,
      archCurvature: 0.04,
      letterSpacing: 48,
    });
  }

  const signTex = new THREE.CanvasTexture(signCanvas);
  signTex.colorSpace = THREE.SRGBColorSpace;

  const bannerMat = new THREE.MeshStandardMaterial({
    map: signTex,
    roughness: 0.54,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });
  const crimsonFabricMat = new THREE.MeshStandardMaterial({
    color: 0xc81e34,
    roughness: 0.52,
  });
  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xf4c428,
    emissive: 0x9e6808,
    emissiveIntensity: 0.2,
    roughness: 0.32,
    metalness: 0.55,
  });
  const hollyLeafMat = new THREE.MeshStandardMaterial({
    color: 0x187c36,
    roughness: 0.48,
  });
  const hollyBerryMat = new THREE.MeshStandardMaterial({
    color: 0xe6182e,
    roughness: 0.28,
  });
  const steelCableMat = new THREE.MeshStandardMaterial({
    color: 0x8c96a4,
    roughness: 0.4,
    metalness: 0.75,
  });
  const battenPipeMat = new THREE.MeshStandardMaterial({
    color: 0x1e222b,
    roughness: 0.6,
    metalness: 0.5,
  });

  const bannerAssembly = new THREE.Group();
  bannerAssembly.position.set(-0.05, bannerCenterY, bannerZ);

  // ==========================================================================
  // 2. CATENARY CURVED BANNER MESH & 3D SCALLOPED PENNANT TEETH + POM-POMS
  // ==========================================================================
  const bannerGeo = new THREE.PlaneGeometry(bannerWidth, bannerHeight, 36, 8);
  const posAttr = bannerGeo.attributes.position;
  if (posAttr) {
    for (let i = 0; i < posAttr.count; i++) {
      const bx = posAttr.getX(i);
      const by = posAttr.getY(i);
      const sag = getCatenarySag(bx);
      const zBillow = Math.cos((bx / halfSpan) * Math.PI * 0.5) * 0.04;
      posAttr.setY(i, by + sag);
      posAttr.setZ(i, zBillow);
    }
    posAttr.needsUpdate = true;
    bannerGeo.computeVertexNormals();
  }
  const bannerMesh = new THREE.Mesh(bannerGeo, bannerMat);
  bannerMesh.castShadow = true;
  bannerAssembly.add(bannerMesh);

  // 15 3D Pennant-Tooth Scallops & Gold Pom-Poms along the bottom edge (exact match to Model 1B)
  const toothCount = 15;
  for (let tIdx = 0; tIdx < toothCount; tIdx++) {
    const u = (tIdx + 0.5) / toothCount;
    const tx = (u - 0.5) * (bannerWidth * 0.94);
    const ty = -bannerHeight * 0.5 + getCatenarySag(tx);
    const tz = Math.cos((tx / halfSpan) * Math.PI * 0.5) * 0.04 + 0.032;
    const slopeAngle = (tx / halfSpan) * 0.24;

    const toothCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.15, 0.24, 4),
      crimsonFabricMat
    );
    toothCone.rotation.x = Math.PI;
    toothCone.rotation.y = Math.PI * 0.25;
    toothCone.rotation.z = slopeAngle;
    toothCone.scale.set(1.0, 1.0, 0.28);
    toothCone.position.set(tx, ty - 0.09, tz);
    bannerAssembly.add(toothCone);

    // Golden-yellow dot / pom-pom on each pennant tooth
    const goldDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.036, 10, 10),
      goldTrimMat
    );
    goldDot.position.set(tx, ty - 0.06, tz + 0.035);
    bannerAssembly.add(goldDot);
  }

  // ==========================================================================
  // 3. GOLD ROPE TRIM, CURLED 3D SCROLL ENDS & HOLLY CORNER CLUSTERS
  // ==========================================================================
  const topRopePts: THREE.Vector3[] = [];
  const botRopePts: THREE.Vector3[] = [];
  for (let i = 0; i <= 24; i++) {
    const u = i / 24;
    const rx = (u - 0.5) * bannerWidth;
    const sag = getCatenarySag(rx);
    const rz = Math.cos((rx / halfSpan) * Math.PI * 0.5) * 0.04 + 0.035;
    topRopePts.push(new THREE.Vector3(rx, bannerHeight * 0.5 + sag, rz));
    botRopePts.push(new THREE.Vector3(rx, -bannerHeight * 0.5 + sag, rz));
  }

  bannerAssembly.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(topRopePts),
        36,
        0.022,
        8,
        false
      ),
      goldTrimMat
    )
  );
  bannerAssembly.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(botRopePts),
        36,
        0.02,
        8,
        false
      ),
      goldTrimMat
    )
  );

  // Emissive Who-Land Fairy Lights draped along the upper scroll border of the Christmas Banner
  const bannerFairyPts = topRopePts.map(
    (p) => new THREE.Vector3(p.x, p.y - 0.02, p.z + 0.028)
  );
  bannerAssembly.add(
    createWhoLandFairyLightStrand(bannerFairyPts, {
      bulbCount: 18,
      bulbRadiusM: 0.028,
      emissiveIntensity: 3.0,
      pointLightCount: 2,
      pointLightIntensity: 0.55,
      pointLightDistance: 2.6,
    })
  );

  // Curled 3D Scroll Ends + Corner Ribbons + Holly Leaf & Berry Clusters on Left & Right Ends
  for (const side of [-1, 1]) {
    const endX = side * halfSpan;
    const endGroup = new THREE.Group();
    endGroup.position.set(endX, 0, 0.035);
    endGroup.rotation.z = side * -0.18;

    // Rolled vertical scroll cylinder
    const scrollTube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.065, bannerHeight + 0.14, 16),
      crimsonFabricMat
    );
    endGroup.add(scrollTube);

    // Top & bottom gold scroll finials
    for (const vSign of [-1, 1]) {
      const finial = new THREE.Mesh(
        new THREE.SphereGeometry(0.078, 12, 12),
        goldTrimMat
      );
      finial.position.y = vSign * (bannerHeight * 0.5 + 0.08);
      endGroup.add(finial);
    }

    // Upper corner tied crimson ribbon bow + holly leaf & berry cluster (at top scroll corner)
    const cornerCluster = new THREE.Group();
    cornerCluster.position.set(0, bannerHeight * 0.5 + 0.06, 0.05);

    // Tied corner ribbon ears (matching the red corner ties visible in Model 1B)
    for (const earSide of [-1, 1]) {
      const ear = new THREE.Mesh(
        new THREE.ConeGeometry(0.055, 0.18, 6),
        crimsonFabricMat
      );
      ear.position.set(earSide * 0.07, 0.04, 0);
      ear.rotation.z = earSide * -1.1;
      cornerCluster.add(ear);
    }

    // 3 Sculpted Holly Leaves
    for (let h = 0; h < 3; h++) {
      const hAngle = (h - 1) * 0.65 + side * 0.25;
      const leaf = new THREE.Mesh(
        new THREE.ConeGeometry(0.05, 0.16, 4),
        hollyLeafMat
      );
      leaf.scale.set(1.2, 1.0, 0.35);
      leaf.position.set(Math.sin(hAngle) * 0.08, -0.05, 0.035);
      leaf.rotation.z = -hAngle + Math.PI;
      cornerCluster.add(leaf);
    }

    // 3 Glossy Red Holly Berries
    for (let b = 0; b < 3; b++) {
      const berry = new THREE.Mesh(
        new THREE.SphereGeometry(0.028, 8, 8),
        hollyBerryMat
      );
      berry.position.set((b - 1) * 0.028, -0.02 + (b % 2) * 0.022, 0.065);
      cornerCluster.add(berry);
    }

    endGroup.add(cornerCluster);
    bannerAssembly.add(endGroup);

    // ========================================================================
    // 4. VERTICAL STEEL FLY-WIRES EXTENDING UP TO LINESET #15 BATTEN PIPE
    // ========================================================================
    const wireHeight = 1.95;
    const flyWire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, wireHeight, 8),
      steelCableMat
    );
    flyWire.position.set(
      endX,
      bannerHeight * 0.5 + wireHeight * 0.5 + 0.08,
      0.035
    );
    bannerAssembly.add(flyWire);

    const turnbuckle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 0.11, 8),
      steelCableMat
    );
    turnbuckle.position.set(endX, bannerHeight * 0.5 + 0.14, 0.035);
    bannerAssembly.add(turnbuckle);
  }

  // Upper Lineset #15 Steel Batten Pipe
  const battenPipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.028, 0.028, bannerWidth + 0.85, 14),
    battenPipeMat
  );
  battenPipe.rotation.z = Math.PI * 0.5;
  battenPipe.position.set(0, bannerHeight * 0.5 + 2.03, 0.035);
  bannerAssembly.add(battenPipe);

  signGroup.add(bannerAssembly);
  return signGroup;
}
