import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {
  createFabricWeaveNormalTexture,
  createPapierMacheNormalTexture,
  createSeussianRockNormalTexture,
  createStuccoPlasterNormalTexture,
  drawSeussianDisplayText,
  normalizeExtrudeUVs,
} from '../../engine/procedural-textures.ts';
import {
  createGrinchCharacter,
  createMaxDogCharacter,
  createSculptedIcicleDrip,
  createSeussianIcicleValance,
  createWhoCharacter,
  createWhoLandFairyLightStrand,
} from '../shared-scenic-helpers.ts';

/**
 * Generates a Scenic Artist Hand-Painted Timber Wainscot & Trompe-l'oeil Beveled Panel
 * texture (1024×1024) for the Whoville Department Store Counter wagons & Finale Banquet apron:
 * painted vertical woodgrain, faux recessed panel shadow lines, warm gold filigree corners,
 * scenic spatter, and Seussian ink cross-hatching (`model_1D_shopping.jpg` & `model_1G_finale.jpg`).
 */
function createPaintedShopCounterTimberTexture(
  baseHex: string,
  highlightHex: string,
  shadowHex: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, 1024);
    grad.addColorStop(0, highlightHex);
    grad.addColorStop(0.5, baseHex);
    grad.addColorStop(1, shadowHex);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // 1. Mottled sponge-scumble glaze
    for (let i = 0; i < 220; i++) {
      const sx = (i * 179 + 31) % 1024;
      const sy = (i * 251 + 19) % 1024;
      const sr = 28 + (i % 48);
      ctx.fillStyle =
        i % 2 === 0
          ? 'rgba(180, 232, 255, 0.10)'
          : 'rgba(10, 24, 52, 0.14)';
      ctx.beginPath();
      ctx.ellipse(sx, sy, sr * 1.3, sr * 0.75, (i % 6) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Painted vertical timber beadboard planks & wavy Seussian woodgrain streaks
    for (let x = 0; x < 1024; x += 64) {
      ctx.strokeStyle = 'rgba(10, 22, 48, 0.34)';
      ctx.lineWidth = 4.0;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      for (let y = 0; y <= 1024; y += 128) {
        ctx.lineTo(x + Math.sin(y * 0.01 + x * 0.05) * 6, y);
      }
      ctx.stroke();

      ctx.strokeStyle = 'rgba(204, 234, 248, 0.22)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(x + 5, 0);
      for (let y = 0; y <= 1024; y += 128) {
        ctx.lineTo(x + 5 + Math.sin(y * 0.01 + x * 0.05) * 6, y);
      }
      ctx.stroke();
    }

    // 3. Trompe-l'oeil painted recessed wainscot frame & gold pin-stripe with scroll corners
    ctx.strokeStyle = 'rgba(8, 18, 42, 0.52)';
    ctx.lineWidth = 18;
    ctx.strokeRect(56, 64, 912, 896);

    ctx.strokeStyle = 'rgba(202, 234, 248, 0.28)';
    ctx.lineWidth = 5;
    ctx.strokeRect(68, 76, 888, 872);

    ctx.strokeStyle = 'rgba(242, 204, 68, 0.65)';
    ctx.lineWidth = 7;
    ctx.strokeRect(86, 94, 852, 836);

    // Ornate gold corner curls
    ctx.strokeStyle = 'rgba(246, 214, 88, 0.72)';
    ctx.lineWidth = 4.5;
    for (const [cx, cy, sx, sy] of [
      [112, 120, 1, 1],
      [912, 120, -1, 1],
      [112, 904, 1, -1],
      [912, 904, -1, -1],
    ] as const) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(sx, sy);
      ctx.beginPath();
      ctx.arc(18, 18, 18, Math.PI, Math.PI * 2.2);
      ctx.stroke();
      ctx.restore();
    }

    // 4. Seussian charcoal cross-hatching along lower kickplate and corners
    ctx.strokeStyle = 'rgba(12, 18, 34, 0.42)';
    ctx.lineWidth = 2.6;
    for (let i = 0; i < 140; i++) {
      const hx = (i * 89 + 24) % 970;
      const hy = i % 2 === 0 ? 860 + (i % 9) * 14 : 36 + (i % 7) * 14;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx + 28, hy - 14);
      ctx.stroke();
      if (i % 3 === 0) {
        ctx.beginPath();
        ctx.moveTo(hx + 6, hy - 16);
        ctx.lineTo(hx + 22, hy + 8);
        ctx.stroke();
      }
    }

    // 5. Scenic paint spatter
    for (let sp = 0; sp < 360; sp++) {
      const px = (sp * 263 + 17) % 1024;
      const py = (sp * 197 + 43) % 1024;
      ctx.fillStyle =
        sp % 2 === 0
          ? 'rgba(198, 228, 242, 0.22)'
          : 'rgba(10, 22, 46, 0.26)';
      ctx.beginPath();
      ctx.arc(px, py, 1.2 + (sp % 3) * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Hand-painted lime-green & chartreuse Seussian branch bark & sign-frame texture (512×512)
 * with organic woodgrain rings, chartreuse highlight glazes, and charcoal ink hatching.
 */
function createLimeBranchBarkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#3ea832');
    grad.addColorStop(0.5, '#58c842');
    grad.addColorStop(1, '#3ea832');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Chartreuse dry-brush bark rings & Seussian ink contour ticks (periodic across X)
    for (let y = 16; y < 512; y += 32) {
      ctx.strokeStyle = 'rgba(192, 244, 112, 0.28)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 0; x <= 512; x += 32) {
        const u = (x / 512) * Math.PI * 2;
        const wy = y + Math.sin(u * 2 + y * 0.1) * 6;
        if (x === 0) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.stroke();

      ctx.strokeStyle = 'rgba(16, 42, 12, 0.42)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= 512; x += 32) {
        const u = (x / 512) * Math.PI * 2;
        const wy = y + 4 + Math.sin(u * 2 + y * 0.1) * 6;
        if (x === 0) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
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
 * Hand-painted pink stucco & clapboard texture (512×512) for the DSR Whoville House in Scene 1F.
 */
function createDsrHousePinkStuccoTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#b82868');
    grad.addColorStop(0.48, '#e8589a');
    grad.addColorStop(1, '#9e1e58');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Warm blush belly glow
    const belly = ctx.createRadialGradient(256, 256, 24, 256, 256, 240);
    belly.addColorStop(0, 'rgba(255, 184, 218, 0.36)');
    belly.addColorStop(1, 'rgba(140, 24, 76, 0)');
    ctx.fillStyle = belly;
    ctx.fillRect(0, 0, 512, 512);

    // Wavy Seussian clapboards & ink cross-hatching
    for (let y = 36; y < 512; y += 44) {
      ctx.strokeStyle = 'rgba(38, 10, 26, 0.46)';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= 512; x += 48) {
        ctx.lineTo(x, y + Math.sin(x * 0.025 + y) * 6);
      }
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 206, 228, 0.26)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, y + 3);
      for (let x = 0; x <= 512; x += 48) {
        ctx.lineTo(x, y + 3 + Math.sin(x * 0.025 + y) * 6);
      }
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Hand-painted crimson lacquer sleigh wood texture (512×512) with ornate gold Seussian
 * scrollwork filigree, plank grain, and charcoal ink cross-hatching (`model_1F_mt_crumpit_sleigh.jpg`).
 */
function createSleighPaintedWoodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#d42438');
    grad.addColorStop(0.55, '#b4182a');
    grad.addColorStop(1, '#7c0e1c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Horizontal sleigh plank seams & woodgrain
    for (let y = 64; y < 512; y += 64) {
      ctx.strokeStyle = 'rgba(28, 6, 12, 0.48)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    // Gold Seussian scroll border & curlicues
    ctx.strokeStyle = '#eac038';
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, 472, 472);
    ctx.beginPath();
    ctx.arc(84, 84, 34, 0, Math.PI * 1.65);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(428, 84, 34, Math.PI * 1.35, Math.PI * 3);
    ctx.stroke();

    // Charcoal ink cross-hatch shading along lower hull
    ctx.strokeStyle = 'rgba(22, 6, 10, 0.42)';
    ctx.lineWidth = 2;
    for (let x = 24; x < 488; x += 18) {
      ctx.beginPath();
      ctx.moveTo(x, 488);
      ctx.lineTo(x + 14, 456);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Hand-painted overstuffed crimson toy-sack canvas/velvet texture (512×512) with
 * bulging tension creases, patchwork stitches, and Seussian ink cross-hatching.
 */
function createStolenSackFabricTexture(highlightVariant = false): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(220, 200, 30, 256, 256, 280);
    grad.addColorStop(0, highlightVariant ? '#ea384c' : '#dc283c');
    grad.addColorStop(0.6, highlightVariant ? '#c81e32' : '#b41628');
    grad.addColorStop(1, '#780c18');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Coarse burlap/canvas weave
    ctx.strokeStyle = 'rgba(36, 6, 12, 0.16)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 512; i += 10) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }

    // Bulging Seussian tension crease lines & cross-stitched seams
    ctx.strokeStyle = 'rgba(28, 4, 10, 0.52)';
    ctx.lineWidth = 3;
    for (let c = 0; c < 8; c++) {
      const y = 56 + c * 56;
      ctx.beginPath();
      ctx.moveTo(32, y);
      ctx.quadraticCurveTo(256, y - 28, 480, y + 12);
      ctx.stroke();

      // Cross-stitch ticks along every other seam
      if (c % 2 === 1) {
        for (let sx = 64; sx <= 448; sx += 28) {
          ctx.beginPath();
          ctx.moveTo(sx - 5, y - 16);
          ctx.lineTo(sx + 5, y + 4);
          ctx.stroke();
        }
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Hand-painted Toned-Snow Damask Banquet Tablecloth texture (512×512, strictly <= 0xd8)
 * with pleated vertical folds, woven holly-swag damask pattern, royal-blue & gold trim band,
 * and Seussian pen-and-ink cross-hatching (`model_1G_finale.jpg`).
 */
function createBanquetTableclothTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Strictly toned-down snow-linen base (max channel <= 0xd8)
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#cfd4d8');
    grad.addColorStop(0.65, '#c2cad2');
    grad.addColorStop(1, '#aeb8c6');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Vertical pleated fabric fold shadows
    for (let fx = 0; fx < 512; fx += 48) {
      const fGrad = ctx.createLinearGradient(fx, 0, fx + 48, 0);
      fGrad.addColorStop(0, 'rgba(96, 112, 138, 0.22)');
      fGrad.addColorStop(0.5, 'rgba(208, 214, 216, 0.18)');
      fGrad.addColorStop(1, 'rgba(96, 112, 138, 0.22)');
      ctx.fillStyle = fGrad;
      ctx.fillRect(fx, 0, 48, 512);
    }

    // Royal-blue & gold woven border stripes along lower tablecloth hem
    ctx.fillStyle = '#1c6ed0';
    ctx.fillRect(0, 428, 512, 26);
    ctx.fillStyle = '#d4a828';
    ctx.fillRect(0, 418, 512, 8);
    ctx.fillRect(0, 456, 512, 8);

    // Delicate Seussian ink cross-hatching in pleat troughs
    ctx.strokeStyle = 'rgba(34, 44, 68, 0.28)';
    ctx.lineWidth = 1.5;
    for (let x = 16; x < 512; x += 48) {
      for (let y = 360; y < 496; y += 16) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 12, y - 8);
        ctx.stroke();
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Helper to generate a procedural Seussian shop sign texture on a high-res 1024×384 canvas
 * with scalloped Seussian gold/green borders, catenary velvet fold shading, gold polka-dots,
 * and authentic bouncy Seussian wedge lettering via `drawSeussianDisplayText`.
 */
function createSeussianShopSignTexture(
  mainTitle: string,
  subTitle: string,
  bgColorHex: string,
  borderColorHex: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Rich painted crimson/berry gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, bgColorHex);
    bgGrad.addColorStop(0.5, '#d2243c');
    bgGrad.addColorStop(1, '#781020');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Festive gold polka-dots & Seussian cross-hatch ink strokes across background
    for (let p = 0; p < 36; p++) {
      const px = 48 + ((p * 179 + 23) % 928);
      const py = 42 + ((p * 97 + 19) % 300);
      ctx.fillStyle = 'rgba(255, 216, 72, 0.34)';
      ctx.beginPath();
      ctx.arc(px, py, 3.5 + (p % 3), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = 'rgba(20, 12, 28, 0.22)';
    ctx.lineWidth = 2.5;
    for (let x = 24; x < canvas.width; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x - 18, canvas.height);
      ctx.stroke();
    }

    // Scalloped lime-green & gold Seussian outer border
    ctx.strokeStyle = borderColorHex;
    ctx.lineWidth = 16;
    ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

    // Scalloped gold inner festoon loops around the perimeter
    ctx.strokeStyle = '#e6c032';
    ctx.lineWidth = 6;
    for (let sx = 48; sx <= canvas.width - 48; sx += 64) {
      ctx.beginPath();
      ctx.arc(sx, 28, 20, 0, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(sx, canvas.height - 28, 20, Math.PI, Math.PI * 2);
      ctx.stroke();
    }

    ctx.strokeStyle = '#1b1424';
    ctx.lineWidth = 5;
    ctx.strokeRect(32, 32, canvas.width - 64, canvas.height - 64);

    // Corner holly/star medallions with emerald holly leaves & crimson berries
    for (const [cx, cy] of [
      [56, 56],
      [canvas.width - 56, 56],
      [56, canvas.height - 56],
      [canvas.width - 56, canvas.height - 56],
    ] as const) {
      ctx.fillStyle = '#24983e';
      ctx.beginPath();
      ctx.ellipse(cx - 10, cy, 14, 7, 0.4, 0, Math.PI * 2);
      ctx.ellipse(cx + 10, cy, 14, 7, -0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#e8c234';
      ctx.beginPath();
      ctx.arc(cx, cy, 11, 0, Math.PI * 2);
      ctx.fill();
    }

    // Authentic bouncy Seussian wedge lettering for Main Shop Title
    const mainFontSize = mainTitle.length > 17 ? 52 : 60;
    drawSeussianDisplayText(ctx, mainTitle, canvas.width / 2, 136, {
      fontSize: mainFontSize,
      fillTopColor: '#d8d4c8',
      fillBottomColor: '#c8b898',
      bevelHighlightColor: 'rgba(255, 250, 230, 0.65)',
      outlineColor: '#181020',
      shadowColor: '#100816',
      bounceAmp: 5.5,
      tiltAmp: 0.08,
      archCurvature: -0.05,
      letterSpacing: mainFontSize * 0.62,
    });

    // Authentic bouncy Seussian wedge lettering for Whoville Sub-Title
    drawSeussianDisplayText(ctx, subTitle, canvas.width / 2, 268, {
      fontSize: 42,
      fillTopColor: '#e4cc52',
      fillBottomColor: '#c48c20',
      bevelHighlightColor: 'rgba(255, 245, 200, 0.6)',
      outlineColor: '#181020',
      shadowColor: '#100816',
      bounceAmp: 4.4,
      tiltAmp: 0.09,
      archCurvature: 0.04,
      letterSpacing: 27,
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

    // Thin lime-green pinstripe accent & Seussian edge hatch
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
 * Recreates 3 distinct, character-rich Whoville Market & Store Booths inspired by
 * `model_1D_shopping.jpg`, `plan_1D_shopping.jpg`, and the Whoville market reference
 * (`media_1791675835868_1a63c754.jpg`):
 * - Booth 1 (DSR `x = -2.65m, z = -1.12m`) · **"CANDY CANE LANE" Sweet Bakery & Confectionery Stall**:
 *   Mint-turquoise counter with festive evergreen garland & big red bows, scalloped pink-and-red
 *   awning valance, colossal hooked Candy Cane column on the right, tiered wooden bakery shelves
 *   & angled pastry trays (donuts, loaves, gingerbread, peppermint jars), and a towering 7-box
 *   present stack beside the stall.
 * - Booth 2 (Center `x = 0.0m, z = -1.25m`) · **"WHO FOODS" Carved Timber Arch Market & Grocer**:
 *   Warm carved walnut/honey timber facade with flaring pilasters, grand central arch with golden
 *   keystone crest, snow-capped cornice ledge, lobed crimson-and-gold `"WHO FOODS"` sign, side
 *   blue-and-white striped dome awning with snow cap, hanging round `"FRESH PRODUCE"` bracket sign,
 *   and a golden Roast Beast platter + produce baskets on the counter.
 * - Booth 3 (DSL `x = +2.65m, z = -1.12m`) · **"TINSEL & TOYS" Striped Awning Ornament & Tree Chalet**:
 *   Steep pitched red-and-white vertical-striped chalet roof with scalloped trim & 3D gold star
 *   finials, warm timber stall frame displaying rows of hanging gold bells & colorful baubles,
 *   flanked by decorated star-topped Whoville Christmas trees and tabletop toy displays.
 */
export function buildGrinchShoppingCounters(
  rockTex: THREE.CanvasTexture
): THREE.Group {
  const shoppingGroup = new THREE.Group();
  shoppingGroup.name = 'Element_grinch-shopping-counters';

  const candyStripeTex = createCandyCaneStripeTexture();
  const papierMacheNormalTex = createPapierMacheNormalTexture();

  // Shared materials across the market square
  const casterDeckMat = new THREE.MeshStandardMaterial({
    color: 0x1e2432,
    roughness: 0.7,
  });
  const darkRecessMat = new THREE.MeshStandardMaterial({
    color: 0x121826,
    roughness: 0.82,
  });
  const snowCounterTopMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    normalMap: papierMacheNormalTex,
    normalScale: new THREE.Vector2(0.45, 0.45),
    color: 0xcad2dc,
    roughness: 0.58,
  });
  // Crystalline cavemouth-style icicle materials (#a4c4d8 & #6290c8)
  const crystallineIceFrontMat = new THREE.MeshStandardMaterial({
    color: 0xa4c4d8,
    roughness: 0.45,
    metalness: 0.16,
    flatShading: true,
  });
  const crystallineIceBackMat = new THREE.MeshStandardMaterial({
    color: 0x6290c8,
    roughness: 0.48,
    metalness: 0.14,
    flatShading: true,
  });
  const candyCanePostMat = new THREE.MeshStandardMaterial({
    map: candyStripeTex,
    roughness: 0.35,
    metalness: 0.05,
  });
  const pineGarlandMat = new THREE.MeshStandardMaterial({
    map: createLimeBranchBarkTexture(),
    color: 0x269448,
    roughness: 0.62,
  });
  const goldOrnamentMat = new THREE.MeshStandardMaterial({
    color: 0xd4a828,
    roughness: 0.32,
    metalness: 0.68,
  });
  const crimsonOrnamentMat = new THREE.MeshStandardMaterial({
    color: 0xc82238,
    roughness: 0.38,
    metalness: 0.32,
  });
  const turquoiseOrnamentMat = new THREE.MeshStandardMaterial({
    color: 0x28a8c8,
    roughness: 0.35,
    metalness: 0.42,
  });
  const creamAwningMat = new THREE.MeshStandardMaterial({
    color: 0xd6d0ca,
    roughness: 0.56,
  });
  const blushPinkAwningMat = new THREE.MeshStandardMaterial({
    color: 0xd6a6b8,
    roughness: 0.56,
  });
  const crimsonAwningMat = new THREE.MeshStandardMaterial({
    color: 0xc82034,
    roughness: 0.54,
  });
  const blueAwningMat = new THREE.MeshStandardMaterial({
    color: 0x2468b8,
    roughness: 0.54,
  });
  const pastryGoldMat = new THREE.MeshStandardMaterial({
    color: 0xc88232,
    roughness: 0.62,
  });
  const chocolateGlazeMat = new THREE.MeshStandardMaterial({
    color: 0x4e2a18,
    roughness: 0.42,
  });
  const strawberryIcingMat = new THREE.MeshStandardMaterial({
    color: 0xd45888,
    roughness: 0.45,
  });

  // Helper to build a 3D 5-point golden star topper for signs, awnings, and trees
  const createGoldStarFinial = (radiusM: number): THREE.Mesh => {
    const starShape = new THREE.Shape();
    const pts = 5;
    for (let i = 0; i < pts * 2; i++) {
      const r = i % 2 === 0 ? radiusM : radiusM * 0.44;
      const a = (i / (pts * 2)) * Math.PI * 2 - Math.PI * 0.5;
      const sx = Math.cos(a) * r;
      const sy = Math.sin(a) * r;
      if (i === 0) starShape.moveTo(sx, sy);
      else starShape.lineTo(sx, sy);
    }
    starShape.closePath();
    const geo = new THREE.ExtrudeGeometry(starShape, {
      depth: radiusM * 0.28,
      bevelEnabled: true,
      bevelSegments: 1,
      steps: 1,
      bevelSize: radiusM * 0.08,
      bevelThickness: radiusM * 0.08,
    });
    geo.translate(0, 0, -radiusM * 0.14);
    const mesh = new THREE.Mesh(geo, goldOrnamentMat);
    mesh.castShadow = true;
    return mesh;
  };

  // ==========================================================================
  // BOOTH 1 (DSR x = -2.65m, z = -1.12m): "CANDY CANE LANE" SWEET BAKERY STALL
  // ==========================================================================
  {
    const bakeryUnit = new THREE.Group();
    bakeryUnit.name = 'WhovilleShoppingBooth_1_CandyCaneLane';
    bakeryUnit.position.set(-2.65, 0, -1.12);
    bakeryUnit.rotation.y = 0.16;

    const tealCounterMat = new THREE.MeshStandardMaterial({
      map: createPaintedShopCounterTimberTexture('#187e78', '#2ea89e', '#0e4e4a'),
      roughness: 0.55,
      metalness: 0.05,
    });
    const mintTrimMat = new THREE.MeshStandardMaterial({
      map: createPaintedShopCounterTimberTexture('#32b4a8', '#54d0c4', '#1a746c'),
      roughness: 0.52,
      metalness: 0.05,
    });
    const bakeryWoodMat = new THREE.MeshStandardMaterial({
      map: createPaintedShopCounterTimberTexture('#8a5228', '#a86838', '#522e14'),
      roughness: 0.6,
    });

    // 1. Rolling caster deck
    const deck = new THREE.Mesh(
      new RoundedBoxGeometry(1.96, 0.08, 0.66, 2, 0.02),
      casterDeckMat
    );
    deck.position.set(0, 0.04, 0);
    bakeryUnit.add(deck);

    // 2. Mint-Teal Paneled Bakery Counter Body + Festive Garland & Big Red Bows on Front
    const counterBody = new THREE.Mesh(
      new RoundedBoxGeometry(1.86, 0.78, 0.54, 3, 0.05),
      tealCounterMat
    );
    counterBody.position.set(0, 0.47, 0);
    counterBody.castShadow = true;
    counterBody.receiveShadow = true;
    bakeryUnit.add(counterBody);

    for (const px of [-0.58, 0, 0.58] as const) {
      const insetPanel = new THREE.Mesh(
        new RoundedBoxGeometry(0.46, 0.54, 0.04, 2, 0.03),
        mintTrimMat
      );
      insetPanel.position.set(px, 0.47, 0.28);
      bakeryUnit.add(insetPanel);
    }

    // Lush evergreen garland swags + big red bows + blue/white target medallion across counter front
    for (const side of [-1, 1] as const) {
      const frontSwagCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.86, 0.74, 0.31),
        new THREE.Vector3(side * 0.44, 0.52, 0.33),
        new THREE.Vector3(0, 0.72, 0.32),
      ]);
      const frontSwag = new THREE.Mesh(
        new THREE.TubeGeometry(frontSwagCurve, 18, 0.048, 8, false),
        pineGarlandMat
      );
      bakeryUnit.add(frontSwag);
    }
    for (const bowX of [-0.82, 0, 0.82] as const) {
      const redBow = new THREE.Mesh(
        new RoundedBoxGeometry(0.18, 0.12, 0.05, 2, 0.02),
        crimsonOrnamentMat
      );
      redBow.position.set(bowX, 0.74, 0.34);
      bakeryUnit.add(redBow);
    }
    const targetMedallion = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 0.03, 16),
      turquoiseOrnamentMat
    );
    targetMedallion.rotation.x = Math.PI * 0.5;
    targetMedallion.position.set(0, 0.46, 0.33);
    bakeryUnit.add(targetMedallion);

    // Countertop slab + tucked jagged crystalline icicles
    const counterTop = new THREE.Mesh(
      new RoundedBoxGeometry(1.98, 0.09, 0.62, 3, 0.04),
      mintTrimMat
    );
    counterTop.position.set(0, 0.89, 0.02);
    counterTop.castShadow = true;
    bakeryUnit.add(counterTop);

    // 3. Tiered Wooden Bakery Display Shelves at Back of Stall + Angled Pastry Trays on Counter
    const backHutch = new THREE.Mesh(
      new RoundedBoxGeometry(1.56, 1.18, 0.24, 2, 0.03),
      bakeryWoodMat
    );
    backHutch.position.set(-0.08, 1.48, -0.16);
    backHutch.castShadow = true;
    bakeryUnit.add(backHutch);

    for (const [shelfY, rowSeed] of [
      [1.26, 1],
      [1.58, 2],
      [1.86, 3],
    ] as const) {
      const shelfBoard = new THREE.Mesh(
        new RoundedBoxGeometry(1.52, 0.05, 0.32, 1, 0.015),
        mintTrimMat
      );
      shelfBoard.position.set(-0.08, shelfY, -0.08);
      bakeryUnit.add(shelfBoard);

      // Rows of baked loaves, frosted donuts, and peppermint jars on the shelves
      for (let itemIdx = -3; itemIdx <= 3; itemIdx++) {
        const ix = -0.08 + itemIdx * 0.19;
        if (rowSeed === 1 && Math.abs(itemIdx) >= 2) {
          // Candy cane glass jar
          const jar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.055, 0.05, 0.16, 10),
            candyCanePostMat
          );
          jar.position.set(ix, shelfY + 0.1, -0.04);
          bakeryUnit.add(jar);
        } else {
          // Golden baked loaf / pastry mound
          const loaf = new THREE.Mesh(
            new RoundedBoxGeometry(0.14, 0.09, 0.14, 2, 0.035),
            (itemIdx + rowSeed) % 2 === 0 ? pastryGoldMat : strawberryIcingMat
          );
          loaf.position.set(ix, shelfY + 0.065, -0.04);
          bakeryUnit.add(loaf);
        }
      }
    }

    // 3 Angled Wooden Pastry & Donut Trays along the front counter
    for (const trayX of [-0.54, 0.0, 0.52] as const) {
      const trayGroup = new THREE.Group();
      trayGroup.position.set(trayX, 0.98, 0.15);
      trayGroup.rotation.x = 0.32;

      const trayBox = new THREE.Mesh(
        new RoundedBoxGeometry(0.44, 0.05, 0.32, 1, 0.01),
        bakeryWoodMat
      );
      trayGroup.add(trayBox);

      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          const donut = new THREE.Mesh(
            new THREE.TorusGeometry(0.042, 0.02, 8, 12),
            (dx + dz) % 2 === 0 ? strawberryIcingMat : chocolateGlazeMat
          );
          donut.rotation.x = Math.PI * 0.5;
          donut.position.set(dx * 0.12, 0.038, dz * 0.085);
          trayGroup.add(donut);
        }
      }
      bakeryUnit.add(trayGroup);
    }

    // 4. Colossal Hooked Red-and-White Spiral Candy Cane Column on the Right + Left Support Post
    const leftPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.048, 0.052, 1.32, 12),
      candyCanePostMat
    );
    leftPost.position.set(-0.84, 1.54, 0.08);
    bakeryUnit.add(leftPost);

    const giantCaneCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.84, 0.88, 0.10),
      new THREE.Vector3(0.86, 1.48, 0.12),
      new THREE.Vector3(0.88, 2.02, 0.14),
      new THREE.Vector3(0.98, 2.32, 0.16),
      new THREE.Vector3(1.16, 2.26, 0.18),
      new THREE.Vector3(1.22, 2.02, 0.18),
    ]);
    const giantCaneCol = new THREE.Mesh(
      new THREE.TubeGeometry(giantCaneCurve, 32, 0.095, 14, false),
      candyCanePostMat
    );
    giantCaneCol.castShadow = true;
    bakeryUnit.add(giantCaneCol);

    // 5. Scalloped Pink-and-Crimson Striped Bakery Awning Valance + "CANDY CANE LANE" Signboard
    const signGroup = new THREE.Group();
    signGroup.position.set(-0.02, 2.18, 0.12);
    signGroup.rotation.z = 0.03;

    // Scalloped striped awning tabs underneath the sign
    const scallopCount = 9;
    for (let s = 0; s < scallopCount; s++) {
      const sx = -0.84 + s * 0.21;
      const tabMat = s % 2 === 0 ? crimsonAwningMat : blushPinkAwningMat;
      const awningTab = new THREE.Mesh(
        new THREE.CylinderGeometry(0.112, 0.112, 0.18, 14),
        tabMat
      );
      awningTab.rotation.x = Math.PI * 0.5;
      awningTab.position.set(sx, -0.22, 0.02);
      signGroup.add(awningTab);
    }

    // Crimson & gold framed mint-turquoise signboard ("CANDY CANE LANE")
    const outerSignBorder = new THREE.Mesh(
      new RoundedBoxGeometry(1.76, 0.46, 0.05, 2, 0.04),
      crimsonAwningMat
    );
    outerSignBorder.position.set(0, 0.04, 0);
    signGroup.add(outerSignBorder);

    const candyLaneTex = createSeussianShopSignTexture(
      'CANDY CANE LANE',
      'SWEETS & PASTRIES',
      '#28b4a8',
      '#d49828'
    );
    const candyLaneBoard = new THREE.Mesh(
      new RoundedBoxGeometry(1.64, 0.36, 0.04, 2, 0.03),
      new THREE.MeshStandardMaterial({ map: candyLaneTex, roughness: 0.52 })
    );
    candyLaneBoard.position.set(0, 0.04, 0.028);
    signGroup.add(candyLaneBoard);

    // Golden scroll crest + pine garland on top of the Candy Cane Lane sign
    const scrollCrest = new THREE.Mesh(
      new RoundedBoxGeometry(0.52, 0.16, 0.045, 2, 0.05),
      goldOrnamentMat
    );
    scrollCrest.position.set(0, 0.31, 0.01);
    signGroup.add(scrollCrest);

    const topGarland = new THREE.Mesh(
      new RoundedBoxGeometry(1.72, 0.08, 0.08, 2, 0.03),
      pineGarlandMat
    );
    topGarland.position.set(0, 0.28, 0.03);
    signGroup.add(topGarland);

    // Jagged crystalline icicle fangs tucked under the awning corners
    for (const side of [-1, 1] as const) {
      const signDrip = createSculptedIcicleDrip(
        0.21,
        0.036,
        crystallineIceFrontMat,
        side * 0.018
      );
      signDrip.position.set(side * 0.82, -0.22, 0.04);
      signGroup.add(signDrip);
    }

    signGroup.add(
      createWhoLandFairyLightStrand(
        [
          new THREE.Vector3(-0.84, -0.14, 0.12),
          new THREE.Vector3(0, -0.16, 0.13),
          new THREE.Vector3(0.84, -0.14, 0.12),
        ],
        {
          bulbCount: 12,
          bulbRadiusM: 0.028,
          emissiveIntensity: 0.95,
          pointLightCount: 1,
          pointLightIntensity: 0.68,
          pointLightDistance: 2.5,
        }
      )
    );
    bakeryUnit.add(signGroup);

    // 6. Towering 7-Box Christmas Present Stack beside the right Candy Cane column (matching reference photo!)
    const towerStackGroup = new THREE.Group();
    towerStackGroup.position.set(1.12, 0.08, -0.04);
    const towerBoxColors = [
      0xd4283c,
      0x2498d4,
      0x34a848,
      0xd49c24,
      0x9834b8,
      0xd42868,
      0x28b498,
    ] as const;
    let curTowerY = 0;
    for (let tb = 0; tb < towerBoxColors.length; tb++) {
      const bw = 0.28 - tb * 0.014;
      const bh = 0.19 - (tb % 2) * 0.02;
      const boxMesh = new THREE.Mesh(
        new RoundedBoxGeometry(bw, bh, bw, 2, 0.018),
        new THREE.MeshStandardMaterial({
          color: towerBoxColors[tb] ?? 0xd4283c,
          roughness: 0.48,
        })
      );
      boxMesh.position.set(
        (tb % 2 === 0 ? 1 : -1) * 0.018,
        curTowerY + bh * 0.5,
        0
      );
      boxMesh.rotation.y = tb * 0.22;
      boxMesh.rotation.z = (tb % 2 === 0 ? 1 : -1) * 0.05;
      boxMesh.castShadow = true;
      towerStackGroup.add(boxMesh);

      const ribStrip = new THREE.Mesh(
        new THREE.BoxGeometry(bw + 0.014, bh + 0.01, 0.04),
        tb % 2 === 0 ? creamAwningMat : goldOrnamentMat
      );
      ribStrip.position.copy(boxMesh.position);
      ribStrip.rotation.copy(boxMesh.rotation);
      towerStackGroup.add(ribStrip);

      curTowerY += bh;
    }
    bakeryUnit.add(towerStackGroup);

    // 7. Bakery Clerk & Shopper
    const bakeryClerk = createWhoCharacter({
      heightM: 1.52,
      coatColorHex: 0xc82838,
      hatColorHex: 0xd43242,
      trimColorHex: 0xd6d2ce,
    });
    bakeryClerk.position.set(-0.18, 0, -0.58);
    bakeryUnit.add(bakeryClerk);

    const bakeryShopper = createWhoCharacter({
      heightM: 1.44,
      coatColorHex: 0xd43848,
      hatColorHex: 0x249498,
      holdingGift: true,
    });
    bakeryShopper.position.set(0.36, 0, 0.88);
    bakeryShopper.rotation.y = -2.82;
    bakeryUnit.add(bakeryShopper);

    shoppingGroup.add(bakeryUnit);
  }

  // ==========================================================================
  // BOOTH 2 (Center x = 0.0m, z = -1.25m): "WHO FOODS" CARVED TIMBER ARCH MARKET
  // ==========================================================================
  {
    const whoFoodsUnit = new THREE.Group();
    whoFoodsUnit.name = 'WhovilleShoppingBooth_2_WhoFoods';
    whoFoodsUnit.position.set(0.0, 0, -1.25);
    whoFoodsUnit.rotation.y = 0.02;

    const carvedWalnutMat = new THREE.MeshStandardMaterial({
      map: createPaintedShopCounterTimberTexture('#784822', '#9c6434', '#46260e'),
      roughness: 0.58,
      metalness: 0.06,
    });
    const honeyTimberMat = new THREE.MeshStandardMaterial({
      map: createPaintedShopCounterTimberTexture('#986232', '#bc8248', '#5c3818'),
      roughness: 0.54,
      metalness: 0.06,
    });

    // 1. Rolling caster base platform
    const deck = new THREE.Mesh(
      new RoundedBoxGeometry(2.14, 0.08, 0.68, 2, 0.02),
      casterDeckMat
    );
    deck.position.set(0, 0.04, 0);
    whoFoodsUnit.add(deck);

    // 2. Outward-Flaring Carved Walnut Timber Pilasters & Grand Central Arch Portal
    for (const side of [-1, 1] as const) {
      const pilaster = new THREE.Mesh(
        new RoundedBoxGeometry(0.48, 1.98, 0.44, 3, 0.05),
        carvedWalnutMat
      );
      pilaster.position.set(side * 0.78, 1.03, -0.02);
      pilaster.rotation.z = side * -0.055;
      pilaster.castShadow = true;
      pilaster.receiveShadow = true;
      whoFoodsUnit.add(pilaster);

      // Lower honey-timber counter pier with arched relief panel
      const counterPier = new THREE.Mesh(
        new RoundedBoxGeometry(0.58, 0.78, 0.56, 3, 0.05),
        honeyTimberMat
      );
      counterPier.position.set(side * 0.68, 0.47, 0.04);
      counterPier.castShadow = true;
      whoFoodsUnit.add(counterPier);
    }

    // Grand Central Archway Header & Carved Golden Keystone Crest
    const upperEntablature = new THREE.Mesh(
      new RoundedBoxGeometry(2.18, 0.34, 0.52, 3, 0.05),
      carvedWalnutMat
    );
    upperEntablature.position.set(0, 1.96, 0.0);
    upperEntablature.castShadow = true;
    whoFoodsUnit.add(upperEntablature);

    const grandArchRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.56, 0.065, 12, 24, Math.PI),
      honeyTimberMat
    );
    grandArchRim.position.set(0, 1.24, 0.22);
    whoFoodsUnit.add(grandArchRim);

    const keystoneCrest = new THREE.Mesh(
      new RoundedBoxGeometry(0.22, 0.26, 0.09, 2, 0.04),
      goldOrnamentMat
    );
    keystoneCrest.position.set(0, 1.81, 0.26);
    whoFoodsUnit.add(keystoneCrest);

    // Center counter bridge + recessed arched display niche
    const centerCounterBridge = new THREE.Mesh(
      new RoundedBoxGeometry(0.84, 0.76, 0.52, 2, 0.04),
      carvedWalnutMat
    );
    centerCounterBridge.position.set(0, 0.46, 0.02);
    whoFoodsUnit.add(centerCounterBridge);

    const centerNiche = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.34, 0.52, 16, 1, false, 0, Math.PI),
      darkRecessMat
    );
    centerNiche.rotation.x = Math.PI * 0.5;
    centerNiche.position.set(0, 0.14, 0.22);
    whoFoodsUnit.add(centerNiche);

    // Snowy counter top + jagged crystalline cavemouth-style icicle valance tucked under edge
    const counterTop = new THREE.Mesh(
      new RoundedBoxGeometry(2.08, 0.09, 0.62, 3, 0.04),
      snowCounterTopMat
    );
    counterTop.position.set(0, 0.88, 0.04);
    counterTop.castShadow = true;
    whoFoodsUnit.add(counterTop);

    const counterValance = createSeussianIcicleValance(
      1.92,
      0.18,
      11,
      crystallineIceFrontMat,
      crystallineIceBackMat,
      0.038,
      21
    );
    counterValance.position.set(0, 0.86, 0.31);
    whoFoodsUnit.add(counterValance);

    // 3. Left Blue-and-White Striped Dome Awning with Snow Cap & Right "FRESH PRODUCE" Bracket Sign
    const sideAwningGroup = new THREE.Group();
    sideAwningGroup.position.set(-0.78, 1.46, 0.24);
    for (let seg = 0; seg < 5; seg++) {
      const segMesh = new THREE.Mesh(
        new RoundedBoxGeometry(0.088, 0.22, 0.22, 2, 0.03),
        seg % 2 === 0 ? blueAwningMat : creamAwningMat
      );
      segMesh.position.set((seg - 2) * 0.086, 0, 0);
      sideAwningGroup.add(segMesh);
    }
    const sideAwningSnow = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
      snowCounterTopMat
    );
    sideAwningSnow.scale.set(1.05, 0.65, 0.58);
    sideAwningSnow.position.set(0, 0.08, 0);
    sideAwningGroup.add(sideAwningSnow);
    whoFoodsUnit.add(sideAwningGroup);

    // Right hanging round "FRESH PRODUCE" sign on scrolled bracket
    const bracketArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.016, 0.34, 8),
      casterDeckMat
    );
    bracketArm.rotation.z = Math.PI * 0.5;
    bracketArm.position.set(1.12, 1.68, 0.12);
    whoFoodsUnit.add(bracketArm);

    const produceDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 0.035, 18),
      crimsonAwningMat
    );
    produceDisc.rotation.x = Math.PI * 0.5;
    produceDisc.position.set(1.22, 1.48, 0.12);
    whoFoodsUnit.add(produceDisc);

    const produceInnerDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.125, 0.125, 0.042, 18),
      creamAwningMat
    );
    produceInnerDisc.rotation.x = Math.PI * 0.5;
    produceInnerDisc.position.set(1.22, 1.48, 0.12);
    whoFoodsUnit.add(produceInnerDisc);

    // 4. Snow-Capped Upper Cornice Ledge + Jagged Crystalline Icicles + Lobed Crimson "WHO FOODS" Sign
    const corniceSnowCap = new THREE.Mesh(
      new RoundedBoxGeometry(2.26, 0.12, 0.58, 3, 0.045),
      snowCounterTopMat
    );
    corniceSnowCap.position.set(0, 2.14, 0.04);
    corniceSnowCap.castShadow = true;
    whoFoodsUnit.add(corniceSnowCap);

    const corniceIcicleValance = createSeussianIcicleValance(
      2.12,
      0.24,
      13,
      crystallineIceFrontMat,
      crystallineIceBackMat,
      0.04,
      29
    );
    corniceIcicleValance.position.set(0, 2.11, 0.28);
    whoFoodsUnit.add(corniceIcicleValance);

    // Lobed crimson-and-gold "WHO FOODS" rooftop sign (matching center building in reference image!)
    const whoFoodsSignGroup = new THREE.Group();
    whoFoodsSignGroup.position.set(0, 2.48, 0.06);

    const goldSignBacking = new THREE.Mesh(
      new RoundedBoxGeometry(1.62, 0.52, 0.05, 3, 0.06),
      goldOrnamentMat
    );
    whoFoodsSignGroup.add(goldSignBacking);

    const topLobeGold = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.32, 0.05, 20),
      goldOrnamentMat
    );
    topLobeGold.rotation.x = Math.PI * 0.5;
    topLobeGold.position.set(0, 0.18, 0);
    whoFoodsSignGroup.add(topLobeGold);

    const topLobeCrimson = new THREE.Mesh(
      new THREE.CylinderGeometry(0.27, 0.27, 0.055, 20),
      crimsonAwningMat
    );
    topLobeCrimson.rotation.x = Math.PI * 0.5;
    topLobeCrimson.position.set(0, 0.18, 0.01);
    whoFoodsSignGroup.add(topLobeCrimson);

    // Golden horn/cornucopia emblem inside the upper sign lobe
    const hornEmblem = new THREE.Mesh(
      new THREE.TorusGeometry(0.09, 0.026, 8, 14, Math.PI * 1.25),
      goldOrnamentMat
    );
    hornEmblem.position.set(0, 0.22, 0.045);
    whoFoodsSignGroup.add(hornEmblem);

    const whoFoodsTex = createSeussianShopSignTexture(
      'WHO FOODS',
      'ROAST BEAST & PRODUCE',
      '#b81c30',
      '#d49a28'
    );
    const whoFoodsBoard = new THREE.Mesh(
      new RoundedBoxGeometry(1.50, 0.42, 0.04, 2, 0.04),
      new THREE.MeshStandardMaterial({ map: whoFoodsTex, roughness: 0.52 })
    );
    whoFoodsBoard.position.set(0, -0.02, 0.025);
    whoFoodsSignGroup.add(whoFoodsBoard);

    whoFoodsUnit.add(whoFoodsSignGroup);

    // Warm fairy light strand along the Who Foods cornice
    whoFoodsUnit.add(
      createWhoLandFairyLightStrand(
        [
          new THREE.Vector3(-1.04, 2.06, 0.31),
          new THREE.Vector3(-0.52, 1.98, 0.32),
          new THREE.Vector3(0, 2.05, 0.33),
          new THREE.Vector3(0.52, 1.98, 0.32),
          new THREE.Vector3(1.04, 2.06, 0.31),
        ],
        {
          bulbCount: 15,
          bulbRadiusM: 0.03,
          emissiveIntensity: 0.95,
          pointLightCount: 1,
          pointLightIntensity: 0.72,
          pointLightDistance: 2.6,
        }
      )
    );

    // 5. Countertop Merchandise: Golden Roast Beast Platter, Wicker Produce Baskets, & Grocer Register
    const grocerRegister = createSeussianCashRegister(0x227848);
    grocerRegister.position.set(-0.62, 0.92, 0.04);
    grocerRegister.rotation.y = 0.2;
    whoFoodsUnit.add(grocerRegister);

    // Silver platter + Golden Roast Beast centerpiece
    const platter = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.21, 0.03, 18),
      new THREE.MeshStandardMaterial({
        color: 0xc2ccd6,
        roughness: 0.28,
        metalness: 0.75,
      })
    );
    platter.scale.set(1.25, 1, 0.85);
    platter.position.set(0.02, 0.94, 0.08);
    whoFoodsUnit.add(platter);

    const roastBeast = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 14, 12),
      pastryGoldMat
    );
    roastBeast.scale.set(1.35, 0.92, 0.95);
    roastBeast.position.set(0.02, 1.04, 0.08);
    roastBeast.castShadow = true;
    whoFoodsUnit.add(roastBeast);

    // Wicker produce baskets filled with colorful Who-fruits on right side of counter
    for (const [bx, bz] of [
      [0.48, 0.10],
      [0.74, -0.02],
    ] as const) {
      const basket = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.10, 0.12, 12),
        honeyTimberMat
      );
      basket.position.set(bx, 0.98, bz);
      whoFoodsUnit.add(basket);

      for (let f = 0; f < 5; f++) {
        const fruit = new THREE.Mesh(
          new THREE.SphereGeometry(0.042, 8, 8),
          f % 2 === 0 ? crimsonOrnamentMat : goldOrnamentMat
        );
        fruit.position.set(
          bx + Math.cos(f * 1.25) * 0.055,
          1.06 + (f % 2) * 0.025,
          bz + Math.sin(f * 1.25) * 0.055
        );
        whoFoodsUnit.add(fruit);
      }
    }

    // 6. Grocer Clerk & Shopper
    const grocerClerk = createWhoCharacter({
      heightM: 1.56,
      coatColorHex: 0x2e8844,
      hatColorHex: 0xc82438,
      trimColorHex: 0xd4d8de,
    });
    grocerClerk.position.set(0.0, 0, -0.58);
    whoFoodsUnit.add(grocerClerk);

    const grocerShopper = createWhoCharacter({
      heightM: 1.45,
      coatColorHex: 0x2484c8,
      hatColorHex: 0xd49828,
      hasBraids: true,
      holdingGift: true,
    });
    grocerShopper.position.set(-0.34, 0, 0.88);
    grocerShopper.rotation.y = 2.85;
    whoFoodsUnit.add(grocerShopper);

    shoppingGroup.add(whoFoodsUnit);
  }

  // ==========================================================================
  // BOOTH 3 (DSL x = +2.65m, z = -1.12m): RED & WHITE STRIPED AWNING ORNAMENT
  //                                       & CHRISTMAS TREE CHALET STALL
  // ==========================================================================
  {
    const chaletUnit = new THREE.Group();
    chaletUnit.name = 'WhovilleShoppingBooth_3_StripedOrnamentChalet';
    chaletUnit.position.set(2.65, 0, -1.12);
    chaletUnit.rotation.y = -0.16;

    const chaletTimberMat = new THREE.MeshStandardMaterial({
      map: createPaintedShopCounterTimberTexture('#58341c', '#784828', '#361e0e'),
      roughness: 0.58,
      metalness: 0.05,
    });
    const crimsonPanelMat = new THREE.MeshStandardMaterial({
      map: createPaintedShopCounterTimberTexture('#981c2e', '#be283e', '#5e101c'),
      roughness: 0.54,
      metalness: 0.05,
    });

    // 1. Rolling caster base platform
    const deck = new THREE.Mesh(
      new RoundedBoxGeometry(1.96, 0.08, 0.66, 2, 0.02),
      casterDeckMat
    );
    deck.position.set(0, 0.04, 0);
    chaletUnit.add(deck);

    // 2. Warm Timber & Festive Crimson Chalet Counter Base + Corner Posts
    const chaletCounter = new THREE.Mesh(
      new RoundedBoxGeometry(1.84, 0.78, 0.54, 3, 0.04),
      chaletTimberMat
    );
    chaletCounter.position.set(0, 0.47, 0);
    chaletCounter.castShadow = true;
    chaletCounter.receiveShadow = true;
    chaletUnit.add(chaletCounter);

    for (const px of [-0.56, 0, 0.56] as const) {
      const crimsonInset = new THREE.Mesh(
        new RoundedBoxGeometry(0.46, 0.54, 0.04, 2, 0.03),
        crimsonPanelMat
      );
      crimsonInset.position.set(px, 0.47, 0.28);
      chaletUnit.add(crimsonInset);
    }

    const counterTop = new THREE.Mesh(
      new RoundedBoxGeometry(1.96, 0.09, 0.62, 3, 0.04),
      snowCounterTopMat
    );
    counterTop.position.set(0, 0.88, 0.02);
    counterTop.castShadow = true;
    chaletUnit.add(counterTop);

    const chaletCounterValance = createSeussianIcicleValance(
      1.82,
      0.16,
      11,
      crystallineIceFrontMat,
      crystallineIceBackMat,
      0.038,
      33
    );
    chaletCounterValance.position.set(0, 0.86, 0.30);
    chaletUnit.add(chaletCounterValance);

    // Timber chalet support posts & hanging ornament/bell display rack in the upper opening
    for (const side of [-1, 1] as const) {
      const post = new THREE.Mesh(
        new RoundedBoxGeometry(0.11, 1.28, 0.11, 2, 0.02),
        chaletTimberMat
      );
      post.position.set(side * 0.82, 1.52, 0.04);
      post.castShadow = true;
      chaletUnit.add(post);
    }

    // 3 horizontal rows of hanging golden bells & colorful baubles inside the chalet stall (matching right stall in reference photo!)
    for (const [rodY, rowIdx] of [
      [1.36, 0],
      [1.62, 1],
      [1.86, 2],
    ] as const) {
      const displayRod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.014, 0.014, 1.56, 8),
        chaletTimberMat
      );
      displayRod.rotation.z = Math.PI * 0.5;
      displayRod.position.set(0, rodY, -0.02);
      chaletUnit.add(displayRod);

      for (let b = -4; b <= 4; b++) {
        const bx = b * 0.17;
        const isBell = (Math.abs(b) + rowIdx) % 2 === 0;
        if (isBell) {
          const bellOrn = new THREE.Mesh(
            new THREE.CylinderGeometry(0.018, 0.042, 0.075, 10),
            goldOrnamentMat
          );
          bellOrn.position.set(bx, rodY - 0.05, -0.02);
          chaletUnit.add(bellOrn);
        } else {
          const baubleMat =
            b % 3 === 0
              ? crimsonOrnamentMat
              : b % 3 === 1 || b % 3 === -1
                ? turquoiseOrnamentMat
                : goldOrnamentMat;
          const bauble = new THREE.Mesh(
            new THREE.SphereGeometry(0.038, 10, 10),
            baubleMat
          );
          bauble.position.set(bx, rodY - 0.05, -0.02);
          chaletUnit.add(bauble);
        }
      }
    }

    // 3. Steep Pitched Red-and-White Vertical-Striped Chalet Awning Roof + Scalloped Valance + 3D Gold Stars
    const awningGroup = new THREE.Group();
    awningGroup.position.set(0, 2.22, 0.08);

    const stripeCount = 11;
    const stripeW = 1.98 / stripeCount;
    for (let s = 0; s < stripeCount; s++) {
      const sx = -0.99 + (s + 0.5) * stripeW;
      const stripeMat = s % 2 === 0 ? crimsonAwningMat : creamAwningMat;

      // Steep pitched roof stripe panel
      const roofPanel = new THREE.Mesh(
        new RoundedBoxGeometry(stripeW + 0.006, 0.68, 0.06, 2, 0.015),
        stripeMat
      );
      roofPanel.position.set(sx, 0.14, 0.02);
      roofPanel.rotation.x = -0.42;
      roofPanel.castShadow = true;
      awningGroup.add(roofPanel);

      // Matching scalloped tab along the bottom edge of the striped awning
      const scallopTab = new THREE.Mesh(
        new THREE.CylinderGeometry(stripeW * 0.52, stripeW * 0.52, 0.06, 12),
        stripeMat
      );
      scallopTab.rotation.x = Math.PI * 0.5;
      scallopTab.position.set(sx, -0.17, 0.15);
      awningGroup.add(scallopTab);
    }

    // 3D Golden Star finials perched on the left/right awning peaks (matching reference photo!)
    for (const side of [-1, 1] as const) {
      const cornerStar = createGoldStarFinial(0.13);
      cornerStar.position.set(side * 0.92, 0.52, -0.06);
      cornerStar.rotation.z = side * -0.18;
      awningGroup.add(cornerStar);
    }

    // Warm fairy light strand along the scalloped awning edge
    awningGroup.add(
      createWhoLandFairyLightStrand(
        [
          new THREE.Vector3(-0.94, -0.18, 0.19),
          new THREE.Vector3(-0.46, -0.22, 0.20),
          new THREE.Vector3(0, -0.18, 0.20),
          new THREE.Vector3(0.46, -0.22, 0.20),
          new THREE.Vector3(0.94, -0.18, 0.19),
        ],
        {
          bulbCount: 14,
          bulbRadiusM: 0.028,
          emissiveIntensity: 0.95,
          pointLightCount: 1,
          pointLightIntensity: 0.7,
          pointLightDistance: 2.5,
        }
      )
    );
    chaletUnit.add(awningGroup);

    // 4. Flanking Decorated Whoville Christmas Trees on Left & Right of the Stall (matching reference photo!)
    for (const side of [-1, 1] as const) {
      const sideTreeGroup = new THREE.Group();
      sideTreeGroup.position.set(side * 1.12, 0.04, 0.08);

      for (let tier = 0; tier < 4; tier++) {
        const tierCone = new THREE.Mesh(
          new THREE.ConeGeometry(0.36 - tier * 0.065, 0.48, 14),
          pineGarlandMat
        );
        tierCone.position.set(
          side * (tier * 0.02),
          0.32 + tier * 0.32,
          0
        );
        tierCone.rotation.z = side * -0.04 * tier;
        tierCone.castShadow = true;
        sideTreeGroup.add(tierCone);

        // Ornaments around each tree tier
        for (let o = 0; o < 4; o++) {
          const oa = (o / 4) * Math.PI * 2 + tier * 0.6;
          const orad = 0.28 - tier * 0.05;
          const orn = new THREE.Mesh(
            new THREE.SphereGeometry(0.036, 8, 8),
            (o + tier) % 3 === 0
              ? crimsonOrnamentMat
              : (o + tier) % 3 === 1
                ? goldOrnamentMat
                : turquoiseOrnamentMat
          );
          orn.position.set(
            Math.cos(oa) * orad,
            0.22 + tier * 0.32,
            Math.sin(oa) * orad
          );
          sideTreeGroup.add(orn);
        }
      }

      const treeTopStar = createGoldStarFinial(0.11);
      treeTopStar.position.set(side * 0.06, 1.62, 0);
      sideTreeGroup.add(treeTopStar);

      chaletUnit.add(sideTreeGroup);
    }

    // 5. Countertop Merchandise: Toy Train Engine, Toy Drum, Gift Boxes & Register
    const toyRegister = createSeussianCashRegister(0x8e32b8);
    toyRegister.position.set(-0.56, 0.92, 0.04);
    toyRegister.rotation.y = 0.18;
    chaletUnit.add(toyRegister);

    // Seussian Toy Train Engine on countertop
    const trainGroup = new THREE.Group();
    trainGroup.position.set(0.02, 0.94, 0.08);
    trainGroup.rotation.y = -0.15;
    const boiler = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.065, 0.22, 12),
      crimsonOrnamentMat
    );
    boiler.rotation.z = Math.PI * 0.5;
    boiler.position.set(0, 0.08, 0);
    trainGroup.add(boiler);
    const cab = new THREE.Mesh(
      new RoundedBoxGeometry(0.11, 0.16, 0.13, 2, 0.015),
      turquoiseOrnamentMat
    );
    cab.position.set(-0.08, 0.11, 0);
    trainGroup.add(cab);
    const smokestack = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.02, 0.09, 10),
      goldOrnamentMat
    );
    smokestack.position.set(0.07, 0.16, 0);
    trainGroup.add(smokestack);
    chaletUnit.add(trainGroup);

    const giftStackRight = createMerchandiseGiftStack(
      [0x288cd4, 0xd48424, 0xc82864] as const,
      0xd4b828
    );
    giftStackRight.position.set(0.52, 0.92, 0.04);
    giftStackRight.rotation.y = -0.18;
    chaletUnit.add(giftStackRight);

    // 6. Chalet Clerk & Shopper
    const chaletClerk = createWhoCharacter({
      heightM: 1.54,
      coatColorHex: 0x7c38b8,
      hatColorHex: 0xc82238,
      trimColorHex: 0xd4d8de,
    });
    chaletClerk.position.set(0.0, 0, -0.58);
    chaletUnit.add(chaletClerk);

    const chaletShopper = createWhoCharacter({
      heightM: 1.42,
      coatColorHex: 0xd47828,
      hatColorHex: 0x2484c8,
      holdingGift: true,
    });
    chaletShopper.position.set(-0.32, 0, 0.88);
    chaletShopper.rotation.y = 2.85;
    chaletUnit.add(chaletShopper);

    shoppingGroup.add(chaletUnit);
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

  const stuccoNormalTex = createStuccoPlasterNormalTexture();
  const papierMacheNormalTex = createPapierMacheNormalTexture();
  const pinkMat = new THREE.MeshStandardMaterial({
    map: createDsrHousePinkStuccoTexture(),
    normalMap: stuccoNormalTex,
    normalScale: new THREE.Vector2(0.42, 0.42),
    roughness: 0.56,
    metalness: 0.04,
  });
  const snowRoofMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    normalMap: papierMacheNormalTex,
    normalScale: new THREE.Vector2(0.48, 0.48),
    color: 0xbed0d8,
    roughness: 0.62,
  });
  const crystallineIceFrontMat = new THREE.MeshStandardMaterial({
    color: 0xa4c4d8,
    roughness: 0.45,
    metalness: 0.16,
    flatShading: true,
  });
  const crystallineIceBackMat = new THREE.MeshStandardMaterial({
    color: 0x6290c8,
    roughness: 0.48,
    metalness: 0.14,
    flatShading: true,
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

  // Continuous jagged cavemouth-style crystalline icicle valance tucked under the roof eaves
  const eavesValance = createSeussianIcicleValance(
    widthM * 0.9,
    0.34,
    9,
    crystallineIceFrontMat,
    crystallineIceBackMat,
    0.042,
    17
  );
  eavesValance.position.set(0, heightM * 0.66, 0.34);
  g.add(eavesValance);

  // Additional sharp crystalline icicle fangs flanking the eaves corners
  for (const side of [-1, 1] as const) {
    const cornerIcicle = createSculptedIcicleDrip(
      0.36,
      0.048,
      crystallineIceFrontMat,
      side * 0.024
    );
    cornerIcicle.position.set(side * (widthM * 0.44), heightM * 0.66, 0.33);
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

  const rockNormalTex = createSeussianRockNormalTexture();
  const papierMacheNormalTex = createPapierMacheNormalTexture();

  const iceRockLowerMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    normalMap: rockNormalTex,
    normalScale: new THREE.Vector2(0.85, 0.85),
    color: 0x5c6878,
    roughness: 0.72,
    metalness: 0.06,
    flatShading: true,
  });
  const iceRockUpperMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    normalMap: rockNormalTex,
    normalScale: new THREE.Vector2(0.82, 0.82),
    color: 0x6e7c8e,
    roughness: 0.68,
    metalness: 0.06,
    flatShading: true,
  });
  const rockOchreLedgeMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    normalMap: rockNormalTex,
    normalScale: new THREE.Vector2(0.8, 0.8),
    color: 0x7e766c,
    roughness: 0.74,
    metalness: 0.05,
    flatShading: true,
  });
  const snowLedgeMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    normalMap: papierMacheNormalTex,
    normalScale: new THREE.Vector2(0.48, 0.48),
    color: 0xc8d2d8,
    roughness: 0.58,
  });
  const icicleMat = new THREE.MeshStandardMaterial({
    color: 0xa4c4d8,
    roughness: 0.45,
    metalness: 0.16,
    flatShading: true,
  });
  const icicleGlazeBackMat = new THREE.MeshStandardMaterial({
    color: 0x6290c8,
    roughness: 0.48,
    metalness: 0.14,
    flatShading: true,
  });

  // Rolling steel wagon base frame
  const wagonFrame = new THREE.Mesh(
    new RoundedBoxGeometry(2.85, 0.12, 1.48, 2, 0.02),
    new THREE.MeshStandardMaterial({ color: 0x202838, roughness: 0.7 })
  );
  wagonFrame.position.set(0, 0.06, 0);
  cliffWagon.add(wagonFrame);

  // Helper to build a jagged, stepped, multi-faceted vertical rock cliff block
  const createJaggedCliffPillar = (
    w: number,
    h: number,
    d: number,
    mat: THREE.Material,
    seed: number
  ): THREE.Mesh => {
    const hw = w * 0.5;
    const hh = h * 0.5;
    const s = new THREE.Shape();
    s.moveTo(-hw, -hh);
    s.lineTo(-hw - 0.05, -hh + h * 0.28);
    s.lineTo(-hw + 0.03, -hh + h * 0.34);
    s.lineTo(-hw - 0.06, -hh + h * 0.68);
    s.lineTo(-hw + 0.02, hh);
    s.lineTo(hw - 0.02, hh);
    s.lineTo(hw + 0.06, -hh + h * 0.72);
    s.lineTo(hw - 0.04, -hh + h * 0.64);
    s.lineTo(hw + 0.05, -hh + h * 0.32);
    s.lineTo(hw, -hh);
    s.closePath();

    const geo = new THREE.ExtrudeGeometry(s, {
      depth: d,
      bevelEnabled: true,
      bevelSegments: 1,
      steps: 1,
      bevelSize: 0.016,
      bevelThickness: 0.016,
    });
    geo.translate(0, 0, -d * 0.5);
    // Chisel front rock vertices into angular craggy facets
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const vz = pos.getZ(i);
      if (vz > 0 && Math.abs(vy) < hh - 0.04) {
        const stepOff =
          Math.sin(vy * 9.5 + seed) * 0.028 +
          Math.cos(vx * 7.2 - seed) * 0.022;
        pos.setZ(i, vz + stepOff);
      }
    }
    normalizeExtrudeUVs(geo, 'fit');
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };

  // Stepped jagged rock cliff pillars ascending toward the DSL precipice crest:
  // Pillar #0 and #1 sit directly underneath the downstage snow steps (top Y < step top Y),
  // while Pillar #2 sits in the upstage plane (z = -0.32m) supporting the summit sleigh ramp!
  const strataSpecs = [
    { x: -1.16, y: 0.34, z: 0.38, w: 0.72, h: 0.48, d: 0.58, rotZ: 0.0, mat: iceRockLowerMat, seed: 1 },
    { x: -0.52, y: 0.50, z: 0.44, w: 0.72, h: 0.76, d: 0.58, rotZ: 0.0, mat: iceRockUpperMat, seed: 2 },
    { x: 0.56, y: 0.96, z: -0.32, w: 1.48, h: 1.48, d: 0.72, rotZ: 0.24, mat: iceRockLowerMat, seed: 3 },
  ] as const;

  for (let sIdx = 0; sIdx < strataSpecs.length; sIdx++) {
    const st = strataSpecs[sIdx];
    if (!st) continue;

    const rockBlock = createJaggedCliffPillar(st.w, st.h, st.d, st.mat, st.seed);
    rockBlock.position.set(st.x, st.y, st.z);
    rockBlock.rotation.z = st.rotZ;
    cliffWagon.add(rockBlock);

    // Protruding horizontal fractured limestone/slate rock strata bands across the cliff face
    for (const bandFrac of [-0.18, 0.16] as const) {
      const bandMesh = new THREE.Mesh(
        new THREE.BoxGeometry(st.w * 0.96, 0.07, st.d + 0.05),
        rockOchreLedgeMat
      );
      bandMesh.position.set(
        st.x - Math.sin(st.rotZ) * (st.h * bandFrac),
        st.y + Math.cos(st.rotZ) * (st.h * bandFrac),
        st.z + 0.015
      );
      bandMesh.rotation.z = st.rotZ + (bandFrac > 0 ? -0.03 : 0.03);
      cliffWagon.add(bandMesh);
    }
  }

  // Horizontal Snow-Ledge Step #1 (Lower Left Terrace for Max the Dog):
  // Centered at (x = -1.16, y = 0.62, z = 0.40), height = 0.12m -> exact top surface Y = 0.68m!
  const lowerSnowStep = new THREE.Mesh(
    new RoundedBoxGeometry(0.78, 0.12, 0.64, 1, 0.025),
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
    icicleMat,
    icicleGlazeBackMat,
    0.038,
    31
  );
  lowerValance.position.set(-1.16, 0.60, 0.68);
  cliffWagon.add(lowerValance);

  // Horizontal Snow-Ledge Step #2 (Mid Terrace for the Grinch):
  // Centered at (x = -0.52, y = 0.94, z = 0.46), height = 0.12m -> exact top surface Y = 1.00m!
  const midSnowStep = new THREE.Mesh(
    new RoundedBoxGeometry(0.76, 0.12, 0.64, 1, 0.025),
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
    icicleMat,
    icicleGlazeBackMat,
    0.038,
    37
  );
  midValance.position.set(-0.52, 0.92, 0.74);
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
    new RoundedBoxGeometry(1.58, upperLedgeHalfThick * 2, 0.76, 1, 0.025),
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

  // Jagged cavemouth-style crystalline icicle valance + fangs tucked cleanly under the summit ledge
  const summitValance = createSeussianIcicleValance(
    1.46,
    0.32,
    9,
    icicleMat,
    icicleGlazeBackMat,
    0.042,
    43
  );
  summitValance.position.set(
    upperLedgeCenterX,
    upperLedgeCenterY - 0.02,
    upperLedgeCenterZ + 0.34
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
      upperLedgeCenterY + localX * Math.sin(sleighTiltRad) - 0.05,
      upperLedgeCenterZ + 0.32
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

  // 3. The Grinch's Crooked Sleigh & Colossal Box-Stuffed Sack Resting Flush on the Summit Ledge!
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
    map: createSleighPaintedWoodTexture(),
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

  // 4. COLOSSAL OVERSTUFFED CRIMSON SACK STUFFED WITH SQUARE & RECTANGULAR PRESENT BOXES OF RANDOM SIZES!
  // Instead of a spherical ball, the crimson sack fabric is stretched tightly over 16 randomly sized,
  // tilted square and rectangular gift boxes pressing their flat sides & sharp corners outward!
  const fabricNormalTex = createFabricWeaveNormalTexture();
  const sackCrimsonMat = new THREE.MeshStandardMaterial({
    map: createStolenSackFabricTexture(false),
    normalMap: fabricNormalTex,
    normalScale: new THREE.Vector2(0.55, 0.55),
    roughness: 0.55,
    metalness: 0.05,
  });
  const sackHighlightMat = new THREE.MeshStandardMaterial({
    map: createStolenSackFabricTexture(true),
    normalMap: fabricNormalTex,
    normalScale: new THREE.Vector2(0.5, 0.5),
    roughness: 0.56,
  });

  const sackBoxCluster = new THREE.Group();
  sackBoxCluster.name = 'BoxStuffedCrimsonSack';
  sleighGroup.add(sackBoxCluster);

  const internalStuffedBoxes = [
    // Lower tier of large & medium square/rectangular boxes inside the sack
    { x: -0.24, y: 0.62, z: 0.08, w: 0.58, h: 0.48, d: 0.52, rx: 0.14, ry: 0.22, rz: -0.12, hi: false },
    { x: 0.26, y: 0.64, z: -0.06, w: 0.64, h: 0.54, d: 0.56, rx: -0.16, ry: -0.28, rz: 0.18, hi: true },
    { x: -0.46, y: 0.68, z: -0.12, w: 0.42, h: 0.44, d: 0.40, rx: 0.28, ry: -0.35, rz: 0.24, hi: true },
    { x: 0.54, y: 0.72, z: 0.12, w: 0.46, h: 0.42, d: 0.44, rx: -0.24, ry: 0.38, rz: -0.22, hi: false },
    { x: 0.02, y: 0.58, z: 0.22, w: 0.48, h: 0.38, d: 0.42, rx: 0.22, ry: 0.14, rz: -0.18, hi: true },
    // Mid tier of varied square & rectangular boxes jutting out at sharp angles
    { x: -0.34, y: 0.96, z: 0.16, w: 0.48, h: 0.46, d: 0.44, rx: -0.28, ry: 0.44, rz: 0.22, hi: true },
    { x: 0.14, y: 0.98, z: 0.18, w: 0.54, h: 0.50, d: 0.48, rx: 0.18, ry: -0.32, rz: -0.16, hi: false },
    { x: 0.48, y: 1.02, z: -0.14, w: 0.52, h: 0.44, d: 0.46, rx: 0.32, ry: 0.26, rz: -0.28, hi: true },
    { x: -0.12, y: 1.04, z: -0.18, w: 0.50, h: 0.52, d: 0.44, rx: -0.22, ry: -0.42, rz: 0.19, hi: false },
    { x: -0.52, y: 0.92, z: -0.04, w: 0.34, h: 0.36, d: 0.36, rx: 0.36, ry: 0.18, rz: 0.32, hi: true },
    { x: 0.64, y: 0.94, z: 0.06, w: 0.36, h: 0.34, d: 0.38, rx: -0.32, ry: -0.22, rz: -0.34, hi: false },
    // Upper tier of smaller & medium square boxes pushing up toward the sack neck
    { x: -0.18, y: 1.28, z: 0.08, w: 0.42, h: 0.38, d: 0.40, rx: 0.26, ry: 0.38, rz: -0.24, hi: true },
    { x: 0.28, y: 1.30, z: -0.06, w: 0.44, h: 0.42, d: 0.38, rx: -0.28, ry: -0.34, rz: 0.22, hi: false },
    { x: 0.08, y: 1.36, z: 0.14, w: 0.32, h: 0.34, d: 0.32, rx: 0.34, ry: -0.24, rz: 0.28, hi: true },
    { x: 0.44, y: 1.26, z: 0.12, w: 0.30, h: 0.30, d: 0.34, rx: -0.18, ry: 0.48, rz: -0.26, hi: true },
    { x: -0.36, y: 1.22, z: -0.10, w: 0.28, h: 0.32, d: 0.28, rx: 0.22, ry: -0.36, rz: 0.30, hi: false },
  ] as const;

  for (const bx of internalStuffedBoxes) {
    const boxMesh = new THREE.Mesh(
      new RoundedBoxGeometry(bx.w, bx.h, bx.d, 2, 0.032),
      bx.hi ? sackHighlightMat : sackCrimsonMat
    );
    boxMesh.position.set(bx.x, bx.y, bx.z);
    boxMesh.rotation.set(bx.rx, bx.ry, bx.rz);
    boxMesh.castShadow = true;
    boxMesh.receiveShadow = true;
    sackBoxCluster.add(boxMesh);
  }

  // Gathered polygonal tied sack neck + flared cloth ruffle top
  const sackNeck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.42, 0.28, 8),
    sackCrimsonMat
  );
  sackNeck.position.set(0.14, 1.52, 0.02);
  sackNeck.rotation.z = -0.14;
  sleighGroup.add(sackNeck);

  const sackRuffle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.24, 0.22, 8),
    sackHighlightMat
  );
  sackRuffle.position.set(0.18, 1.68, 0.02);
  sackRuffle.rotation.z = -0.14;
  sleighGroup.add(sackRuffle);

  const ropeCinch = new THREE.Mesh(
    new THREE.TorusGeometry(0.26, 0.032, 8, 16),
    new THREE.MeshStandardMaterial({ color: 0xc49a48, roughness: 0.65 })
  );
  ropeCinch.rotation.x = Math.PI / 2;
  ropeCinch.rotation.y = -0.14;
  ropeCinch.position.set(0.16, 1.58, 0.02);
  sleighGroup.add(ropeCinch);

  // 5. DOZENS OF WRAPPED SQUARE & RECTANGULAR GIFT BOXES OF RANDOM SIZES BURSTING OUT OF THE SACK!
  const giftBoxSpecs = [
    { x: -0.04, y: 1.74, z: 0.12, w: 0.28, h: 0.26, d: 0.28, rx: 0.24, ry: 0.35, rz: 0.28, col: 0x2484d8, rib: 0xd4b228 },
    { x: 0.26, y: 1.76, z: -0.10, w: 0.22, h: 0.32, d: 0.22, rx: -0.28, ry: -0.42, rz: -0.22, col: 0x28a448, rib: 0xd82838 },
    { x: 0.12, y: 1.88, z: 0.02, w: 0.19, h: 0.19, d: 0.19, rx: 0.36, ry: 0.18, rz: -0.32, col: 0xd4a624, rib: 0x2468c8 },
    { x: 0.38, y: 1.68, z: 0.14, w: 0.16, h: 0.16, d: 0.24, rx: -0.18, ry: 0.52, rz: -0.36, col: 0x8e38c8, rib: 0xd8c238 },
    { x: -0.22, y: 1.66, z: -0.08, w: 0.24, h: 0.18, d: 0.22, rx: 0.32, ry: -0.26, rz: 0.38, col: 0xd42c58, rib: 0xd8d4cc },
    { x: 0.02, y: 1.98, z: -0.06, w: 0.14, h: 0.15, d: 0.14, rx: -0.34, ry: 0.44, rz: 0.24, col: 0x28b0b8, rib: 0xd4a624 },
    { x: 0.28, y: 1.92, z: 0.08, w: 0.15, h: 0.13, d: 0.17, rx: 0.22, ry: -0.38, rz: -0.28, col: 0xd86824, rib: 0x289844 },
    // Corner gift boxes poking through the side seams of the overstuffed sack
    { x: -0.58, y: 1.12, z: 0.18, w: 0.24, h: 0.24, d: 0.24, rx: 0.42, ry: 0.28, rz: 0.48, col: 0x2484d8, rib: 0xd4b228 },
    { x: 0.68, y: 1.16, z: -0.12, w: 0.21, h: 0.26, d: 0.21, rx: -0.38, ry: -0.32, rz: -0.44, col: 0xd4a624, rib: 0xc82238 },
    { x: 0.18, y: 1.18, z: 0.36, w: 0.20, h: 0.18, d: 0.22, rx: 0.46, ry: -0.22, rz: 0.18, col: 0x28a448, rib: 0xd8d4cc },
  ] as const;

  for (const gb of giftBoxSpecs) {
    const giftGrp = new THREE.Group();
    giftGrp.position.set(gb.x, gb.y, gb.z);
    giftGrp.rotation.set(gb.rx, gb.ry, gb.rz);

    const box = new THREE.Mesh(
      new RoundedBoxGeometry(gb.w, gb.h, gb.d, 1, 0.012),
      new THREE.MeshStandardMaterial({ color: gb.col, roughness: 0.48 })
    );
    box.castShadow = true;
    giftGrp.add(box);

    const ribMat = new THREE.MeshStandardMaterial({
      color: gb.rib,
      roughness: 0.38,
      metalness: 0.25,
    });
    const ribA = new THREE.Mesh(
      new THREE.BoxGeometry(gb.w + 0.012, gb.h + 0.012, gb.d * 0.18),
      ribMat
    );
    giftGrp.add(ribA);

    const ribB = new THREE.Mesh(
      new THREE.BoxGeometry(gb.w * 0.18, gb.h + 0.014, gb.d + 0.012),
      ribMat
    );
    giftGrp.add(ribB);

    sleighGroup.add(giftGrp);
  }

  // Protruding stolen Whoville Christmas tree, bicycle wheel, candy cane & stocking
  const stolenTreeMat = new THREE.MeshStandardMaterial({
    color: 0x1e8a3e,
    roughness: 0.58,
  });
  for (let tier = 0; tier < 2; tier++) {
    const foliageTier = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.22 - tier * 0.06, 0.32, 10),
      stolenTreeMat
    );
    foliageTier.position.set(0.14 - tier * 0.04, 2.04 + tier * 0.18, 0.04);
    foliageTier.rotation.z = 0.24;
    sleighGroup.add(foliageTier);
  }
  const treeStar = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.065, 0),
    goldTrimMat
  );
  treeStar.position.set(0.06, 2.38, 0.04);
  sleighGroup.add(treeStar);

  // Protruding stolen bicycle wheel (rim + spokes)
  const wheelGroup = new THREE.Group();
  wheelGroup.position.set(0.46, 1.84, 0.08);
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

  const candyHookCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.28, 1.78, -0.06),
    new THREE.Vector3(0.36, 2.08, -0.08),
    new THREE.Vector3(0.46, 2.14, -0.08),
    new THREE.Vector3(0.52, 2.04, -0.08),
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
  stockingBoot.position.set(-0.38, 1.32, 0.36);
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
    map: createPaintedShopCounterTimberTexture('#1a72d4', '#3892f0', '#0e4488'),
    roughness: 0.55,
    metalness: 0.08,
  });
  const deepBlueShadowMat = new THREE.MeshStandardMaterial({
    color: 0x0e2854,
    roughness: 0.75,
  });
  const fabricNormalTex = createFabricWeaveNormalTexture();
  const whiteTableclothMat = new THREE.MeshStandardMaterial({
    map: createBanquetTableclothTexture(),
    normalMap: fabricNormalTex,
    normalScale: new THREE.Vector2(0.36, 0.36),
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

    // Multi-colored emissive Who-land fairy lights along the banquet table festoon swag
    const banquetFairyStrand = createWhoLandFairyLightStrand(
      [
        new THREE.Vector3(-0.19, 0.68, 0.305),
        new THREE.Vector3(0, 0.57, 0.315),
        new THREE.Vector3(0.19, 0.68, 0.305),
      ],
      {
        bulbCount: 3,
        bulbRadiusM: 0.025,
        emissiveIntensity: 0.95,
        cordColor: 0x1a3b22,
        includePointLight: i % 4 === 2,
        pointLightIntensity: 0.4,
        pointLightDistance: 1.8,
        palette: [
          0xff0c2e,
          0x00e848,
          0x00a8ff,
          0xffc400,
          0xff14b8,
          0xff6200,
          0x8c1eff,
        ].slice((i * 2) % 4),
      }
    );
    segGroup.add(banquetFairyStrand);

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
