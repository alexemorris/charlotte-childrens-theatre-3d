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
  createWhoCharacter,
  createWhoLandFairyLightStrand,
} from '../shared-scenic-helpers.ts';

/**
 * Procedural hand-painted Seussian olive/moss timber & roof texture (1024×1024)
 * matching Andrew Gibbon's model box paint treatment for Papa Who's House (Model 1H & 1E).
 * Includes mossy-green/chartreuse dry-brushing, woodgrain striations, trompe-l'oeil shingle
 * courses, scenic spatter, and bold Dr. Seuss charcoal pen-and-ink cross-hatching.
 */
function createSeussianOliveRoofTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Periodic base gradient (stop 0 === stop 1 so RepeatWrapping has zero seam)
    const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
    grad.addColorStop(0, '#547428');
    grad.addColorStop(0.35, '#688836');
    grad.addColorStop(0.68, '#74943c');
    grad.addColorStop(1, '#547428');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // 1. Painterly mottled chartreuse & deep moss sponge-scumble glazes (toroidal 3x3 wrap)
    for (let i = 0; i < 240; i++) {
      const x = (i * 149 + 31) % 1024;
      const y = (i * 277 + 19) % 1024;
      const r = 24 + (i % 48);
      ctx.fillStyle =
        i % 3 === 0
          ? 'rgba(154, 188, 68, 0.14)'
          : i % 3 === 1
            ? 'rgba(38, 56, 14, 0.16)'
            : 'rgba(116, 148, 52, 0.12)';
      for (const ox of [-1024, 0, 1024]) {
        for (const oy of [-1024, 0, 1024]) {
          if (
            x + ox + r * 2 < 0 ||
            x + ox - r * 2 > 1024 ||
            y + oy + r * 2 < 0 ||
            y + oy - r * 2 > 1024
          ) {
            continue;
          }
          ctx.beginPath();
          ctx.ellipse(
            x + ox,
            y + oy,
            r * 1.5,
            r * 0.72,
            (i % 7) * 0.42,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    }

    // 2. Hand-painted crooked timber grain & wavy shingle courses with integer wave harmonics
    for (let row = 1; row <= 12; row++) {
      const baseY = row * (1024 / 12) - 42;
      // Dark shadow under course
      ctx.strokeStyle = 'rgba(24, 36, 10, 0.34)';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      for (let x = 0; x <= 1024; x += 32) {
        const u = (x / 1024) * Math.PI * 2;
        const wy =
          baseY +
          Math.sin(u * 2 + row * 1.4) * 12 +
          Math.cos(u * 5 - row) * 5;
        if (x === 0) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.stroke();

      // Warm chartreuse dry-brush highlight lip below course
      ctx.strokeStyle = 'rgba(176, 208, 86, 0.24)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 0; x <= 1024; x += 32) {
        const u = (x / 1024) * Math.PI * 2;
        const wy =
          baseY +
          4 +
          Math.sin(u * 2 + row * 1.4) * 12 +
          Math.cos(u * 5 - row) * 5;
        if (x === 0) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.stroke();
    }

    // 3. Subtle organic woodgrain fibers (kept inside interior margin)
    ctx.lineCap = 'round';
    for (let s = 0; s < 56; s++) {
      const sx = 24 + ((s * 179) % 820);
      const sy = 28 + ((s * 107) % 960);
      ctx.strokeStyle =
        s % 4 === 0 ? 'rgba(168, 198, 78, 0.14)' : 'rgba(26, 38, 10, 0.18)';
      ctx.lineWidth = 1.4 + (s % 2) * 0.6;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(
        sx + 48,
        sy - 14,
        sx + 104,
        sy + 16,
        sx + 156,
        sy - 4
      );
      ctx.stroke();
    }

    // 4. Subtle Dr. Seuss pen-and-ink cross-hatch accents
    ctx.strokeStyle = 'rgba(18, 26, 8, 0.22)';
    ctx.lineWidth = 1.6;
    for (let c = 0; c < 18; c++) {
      const cx = 32 + ((c * 211 + 45) % 900);
      const cy = 32 + ((c * 163 + 38) % 900);
      for (let h = 0; h < 4; h++) {
        ctx.beginPath();
        ctx.moveTo(cx + h * 8, cy);
        ctx.quadraticCurveTo(cx + h * 8 + 12, cy + 16, cx + h * 8 + 22, cy + 32);
        ctx.stroke();
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Toned-down warm lavender-cream & dusty-rose plaster & scrim weave texture (1024×1024)
 * with subtle painted Seussian wallpaper stripes, damask swirl motifs, and corner ink
 * hatching so stage spotlights never overexpose the house walls (max channel <= 0xd8).
 */
function createWhoWallPlasterTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Periodic toned base gradient (stop 0 === stop 1, strictly <= 0xd8 across all channels)
    const grad = ctx.createLinearGradient(0, 0, 0, 1024);
    grad.addColorStop(0, '#c4bcd0');
    grad.addColorStop(0.5, '#d4ccd8');
    grad.addColorStop(1, '#c4bcd0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // 1. Subtle hand-painted dusty-rose & lavender vertical wallpaper stripes
    for (let sx = 0; sx < 1024; sx += 64) {
      ctx.fillStyle =
        (sx / 64) % 2 === 0
          ? 'rgba(196, 172, 198, 0.16)'
          : 'rgba(168, 156, 188, 0.14)';
      ctx.fillRect(sx, 0, 32, 1024);

      // Delicate pinstripe border with periodic Seussian hand-drawn wobble
      ctx.strokeStyle = 'rgba(128, 108, 146, 0.18)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let y = 0; y <= 1024; y += 32) {
        const v = (y / 1024) * Math.PI * 2;
        const wx = sx + Math.sin(v * 3 + sx) * 2.5;
        if (y === 0) ctx.moveTo(wx, y);
        else ctx.lineTo(wx, y);
      }
      ctx.stroke();
    }

    // 2. Stenciled Seussian swirl / fleur-de-who wallpaper motifs
    ctx.strokeStyle = 'rgba(142, 118, 158, 0.18)';
    ctx.lineWidth = 2.0;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const cx = col * 128 + (row % 2 === 0 ? 48 : 96);
        const cy = row * 128 + 64;
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 1.65);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + 8, cy - 8, 7, Math.PI * 0.5, Math.PI * 2.1);
        ctx.stroke();
      }
    }

    // 3. Fine sharkstooth scrim gauze weave & vertical plaster brush streaks
    ctx.strokeStyle = 'rgba(98, 86, 114, 0.11)';
    ctx.lineWidth = 1.2;
    for (let x = 0; x < 1024; x += 8) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();
    }
    for (let y = 0; y < 1024; y += 16) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    // 4. Soft warm aging glazes & Seussian ink cross-hatch plaster patches (toroidal wrap)
    for (let i = 0; i < 110; i++) {
      const px = (i * 193 + 29) % 1024;
      const py = (i * 127 + 41) % 1024;
      const pr = 28 + (i % 38);
      ctx.fillStyle =
        i % 2 === 0
          ? 'rgba(208, 196, 214, 0.12)'
          : 'rgba(144, 130, 158, 0.11)';
      for (const ox of [-1024, 0, 1024]) {
        for (const oy of [-1024, 0, 1024]) {
          if (
            px + ox + pr < 0 ||
            px + ox - pr > 1024 ||
            py + oy + pr < 0 ||
            py + oy - pr > 1024
          ) {
            continue;
          }
          ctx.beginPath();
          ctx.arc(px + ox, py + oy, pr, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.strokeStyle = 'rgba(54, 42, 68, 0.24)';
    ctx.lineWidth = 1.5;
    for (let h = 0; h < 36; h++) {
      const hx = 32 + ((h * 269 + 50) % 920);
      const hy = 32 + ((h * 181 + 40) % 920);
      for (let k = 0; k < 5; k++) {
        ctx.beginPath();
        ctx.moveTo(hx + k * 6, hy);
        ctx.lineTo(hx + k * 6 + 14, hy + 22);
        ctx.stroke();
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Hand-painted Seussian fieldstone & chimney masonry texture (512×512) with
 * crooked mortar joints, trompe-l'oeil stone bevel highlights/shadows, warm soot
 * glazing, and Dr. Seuss ink cross-hatching.
 */
function createFireplaceFieldstoneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#787e7c';
    ctx.fillRect(0, 0, 512, 512);

    const stonePalette = [
      '#848c84',
      '#787488',
      '#6c786e',
      '#8c8294',
      '#748278',
      '#8a8478',
    ];
    const rows = 8;
    const rowH = 512 / rows;
    for (let r = 0; r < rows; r++) {
      const y0 = r * rowH;
      const cols = 4 + (r % 2);
      const colW = 512 / cols;
      const offset = (r % 2) * (colW * 0.45);
      for (let c = -1; c <= cols; c++) {
        const x0 = c * colW + offset;
        const w = colW - 8;
        const h = rowH - 8;
        const col =
          stonePalette[(r * 5 + c + 10) % stonePalette.length] ?? '#7c8280';

        // Stone fill
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.roundRect(x0 + 4, y0 + 4, w, h, 12);
        ctx.fill();

        // Trompe-l'oeil top highlight bevel
        ctx.strokeStyle = 'rgba(208, 214, 218, 0.36)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x0 + 10, y0 + 7);
        ctx.lineTo(x0 + w - 6, y0 + 7);
        ctx.stroke();

        // Trompe-l'oeil bottom shadow bevel & dark ink outline
        ctx.strokeStyle = 'rgba(24, 22, 30, 0.58)';
        ctx.lineWidth = 3.0;
        ctx.beginPath();
        ctx.roundRect(x0 + 4, y0 + 4, w, h, 12);
        ctx.stroke();

        // Seussian corner cross-hatch ticks inside stone
        ctx.strokeStyle = 'rgba(26, 24, 32, 0.38)';
        ctx.lineWidth = 1.4;
        for (let k = 0; k < 4; k++) {
          ctx.beginPath();
          ctx.moveTo(x0 + 10 + k * 5, y0 + h - 4);
          ctx.lineTo(x0 + 16 + k * 5, y0 + h - 14);
          ctx.stroke();
        }
      }
    }

    // Scenic spatter
    for (let s = 0; s < 220; s++) {
      const sx = (s * 137 + 19) % 512;
      const sy = (s * 193 + 31) % 512;
      ctx.fillStyle =
        s % 2 === 0 ? 'rgba(204, 210, 216, 0.2)' : 'rgba(28, 24, 34, 0.25)';
      ctx.beginPath();
      ctx.arc(sx, sy, 1.2 + (s % 2), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1.4, 1.8);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Hand-painted Royal-Blue & Pastel-Pink Seussian Kitchen Appliance Enamel
 * & Tufted Velvet Daybed Upholstery textures (512×512).
 */
function createWhoPaintedFurnitureTexture(
  baseHex: string,
  highlightHex: string,
  shadowHex: string,
  tufted = false
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, highlightHex);
    grad.addColorStop(0.55, baseHex);
    grad.addColorStop(1, shadowHex);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    if (tufted) {
      // Diamond button-tufted velvet pattern with Seussian crease lines & gold buttons
      const step = 96;
      for (let y = 0; y <= 512; y += step) {
        for (let x = 0; x <= 512; x += step) {
          const cx = x + ((y / step) % 2 === 0 ? 0 : step * 0.5);
          const cy = y;
          ctx.strokeStyle = 'rgba(12, 24, 58, 0.45)';
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + step * 0.5, cy + step);
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx - step * 0.5, cy + step);
          ctx.stroke();

          // Tuft shadow & gold button highlight
          ctx.fillStyle = '#0a1838';
          ctx.beginPath();
          ctx.arc(cx, cy, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#e8be38';
          ctx.beginPath();
          ctx.arc(cx - 1, cy - 1, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else {
      // Hand-painted Seussian appliance enamel with recessed bevel border & ink hatching
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.lineWidth = 4;
      ctx.strokeRect(24, 24, 464, 464);

      ctx.strokeStyle = 'rgba(16, 18, 32, 0.48)';
      ctx.lineWidth = 3;
      ctx.strokeRect(30, 30, 452, 452);

      // Corner Seussian ink hatching
      ctx.strokeStyle = 'rgba(16, 18, 32, 0.34)';
      ctx.lineWidth = 1.8;
      for (let k = 0; k < 8; k++) {
        ctx.beginPath();
        ctx.moveTo(36 + k * 8, 42);
        ctx.lineTo(36, 42 + k * 8);
        ctx.moveTo(476 - k * 8, 470);
        ctx.lineTo(476, 470 - k * 8);
        ctx.stroke();
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Festive crimson & gold Who-script holiday swag banner texture ("MERRY CHRISTMAS")
 * rendered with authentic Seussian display typography using drawSeussianDisplayText.
 */
function createMantelSwagBannerTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 512, 160);
    grad.addColorStop(0, '#b8182e');
    grad.addColorStop(0.5, '#d6223a');
    grad.addColorStop(1, '#a81428');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 160);

    // Gold & pink scalloped Seussian border
    ctx.strokeStyle = '#e8be42';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, 492, 140);

    ctx.strokeStyle = '#f29cb8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 18; x < 494; x += 28) {
      ctx.moveTo(x, 22);
      ctx.quadraticCurveTo(x + 14, 34, x + 28, 22);
      ctx.moveTo(x, 138);
      ctx.quadraticCurveTo(x + 14, 126, x + 28, 138);
    }
    ctx.stroke();

    drawSeussianDisplayText(ctx, 'MERRY CHRISTMAS', 256, 82, {
      fontSize: 30,
      fillTopColor: '#fff6d6',
      fillBottomColor: '#f2c858',
      outlineColor: '#2a0e16',
      shadowColor: '#18060c',
      bounceAmp: 2.2,
      tiltAmp: 0.07,
      archCurvature: 0.04,
      letterSpacing: 19,
    });
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Helper to create a 3D tube along a CatmullRomCurve3 path.
 */
function createCurvedTimberTube(
  points: ReadonlyArray<THREE.Vector3>,
  radius: number,
  material: THREE.Material,
  tubularSegments = 36,
  radialSegments = 10
): THREE.Mesh {
  const curve = new THREE.CatmullRomCurve3([...points]);
  const geo = new THREE.TubeGeometry(curve, tubularSegments, radius, radialSegments, false);
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * Helper to build a lush Seussian Christmas wreath with pine boughs, holly berries,
 * and a big sculpted ribbon bow on top (as seen on the chimney breast and windows).
 */
function createSeussianHolidayWreath(
  outerRadius: number,
  tubeRadius: number,
  wreathMat: THREE.Material,
  bowMat: THREE.Material,
  berryMat: THREE.Material
): THREE.Group {
  const g = new THREE.Group();

  const mainRing = new THREE.Mesh(
    new THREE.TorusGeometry(outerRadius, tubeRadius, 12, 28),
    wreathMat
  );
  mainRing.scale.set(1.0, 1.06, 0.75);
  mainRing.castShadow = true;
  g.add(mainRing);

  // Clustered evergreen foliage tufts around the ring
  const tuftCount = 12;
  for (let i = 0; i < tuftCount; i++) {
    const angle = (i / tuftCount) * Math.PI * 2;
    const tuft = new THREE.Mesh(
      new THREE.ConeGeometry(tubeRadius * 0.92, tubeRadius * 2.1, 7),
      wreathMat
    );
    tuft.position.set(
      Math.cos(angle) * outerRadius,
      Math.sin(angle) * (outerRadius * 1.06),
      0.015
    );
    tuft.rotation.z = angle - Math.PI / 2 + 0.35;
    g.add(tuft);

    if (i % 2 === 0) {
      const berry = new THREE.Mesh(
        new THREE.SphereGeometry(tubeRadius * 0.32, 8, 8),
        berryMat
      );
      berry.position.set(
        Math.cos(angle + 0.18) * outerRadius,
        Math.sin(angle + 0.18) * (outerRadius * 1.06),
        tubeRadius * 0.78
      );
      g.add(berry);
    }
  }

  // Big Seussian Bow at the top of the wreath (matching model_1H_whos_house_day.jpg)
  const bowGroup = new THREE.Group();
  bowGroup.position.set(0, outerRadius * 1.02, tubeRadius * 0.85);

  const knot = new THREE.Mesh(
    new THREE.SphereGeometry(tubeRadius * 0.65, 10, 10),
    bowMat
  );
  bowGroup.add(knot);

  for (const side of [-1, 1]) {
    const loop = new THREE.Mesh(
      new THREE.TorusGeometry(tubeRadius * 0.95, tubeRadius * 0.36, 8, 14),
      bowMat
    );
    loop.scale.set(1.25, 0.78, 0.65);
    loop.position.set(side * tubeRadius * 1.15, tubeRadius * 0.32, 0);
    loop.rotation.z = side * -0.42;
    bowGroup.add(loop);

    const tail = new THREE.Mesh(
      new RoundedBoxGeometry(tubeRadius * 0.55, tubeRadius * 1.65, tubeRadius * 0.25, 1, 0.02),
      bowMat
    );
    tail.position.set(side * tubeRadius * 0.62, -tubeRadius * 0.75, -0.01);
    tail.rotation.z = side * 0.32;
    bowGroup.add(tail);
  }

  g.add(bowGroup);
  return g;
}

/**
 * Builds a signature round/oval Seussian bullseye window with curved olive timber frame,
 * central bullseye ring, curved cross-muntins, lavender glass pane, snow-draped sill, and holiday wreath.
 */
function createSeussianArchedWindow(
  widthM: number,
  heightM: number,
  tiltRad: number,
  frameMat: THREE.Material,
  glassMat: THREE.Material,
  snowMat: THREE.Material,
  wreathMat: THREE.Material,
  bowMat: THREE.Material,
  berryMat: THREE.Material,
  includeWreath: boolean
): THREE.Group {
  const winGroup = new THREE.Group();
  winGroup.rotation.z = tiltRad;

  const rx = widthM * 0.52;
  const ry = heightM * 0.46;

  // 1. Tinted Circular/Oval Window Glass Pane at z = 0.015m (inside the wall cutout)
  const glassShape = new THREE.Shape();
  glassShape.absellipse(0, 0, rx * 0.94, ry * 0.94, 0, Math.PI * 2, false, 0);
  const glassGeo = new THREE.ExtrudeGeometry(glassShape, {
    depth: 0.018,
    bevelEnabled: false,
    curveSegments: 24,
  });
  normalizeExtrudeUVs(glassGeo, 'fit');
  const glassMesh = new THREE.Mesh(glassGeo, glassMat);
  glassMesh.position.z = 0.01;
  winGroup.add(glassMesh);

  // 2. Sculpted Circular/Oval Outer Window Casing Ring at z = 0.08m
  const outerRingPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    outerRingPts.push(new THREE.Vector3(Math.cos(a) * rx, Math.sin(a) * ry, 0.08));
  }
  winGroup.add(createCurvedTimberTube(outerRingPts, 0.042, frameMat, 36, 10));

  // 3. Curved Seussian Cross-Muntins & Central Bullseye Ring at z = 0.055m
  const vertMullionPts = [
    new THREE.Vector3(-0.015, -ry * 0.92, 0.055),
    new THREE.Vector3(0.025, 0, 0.058),
    new THREE.Vector3(0, ry * 0.92, 0.055),
  ];
  winGroup.add(createCurvedTimberTube(vertMullionPts, 0.02, frameMat, 16, 6));

  const horizMullionPts = [
    new THREE.Vector3(-rx * 0.92, -0.02, 0.055),
    new THREE.Vector3(0, 0.025, 0.058),
    new THREE.Vector3(rx * 0.92, -0.02, 0.055),
  ];
  winGroup.add(createCurvedTimberTube(horizMullionPts, 0.02, frameMat, 16, 6));

  const centerBullseyePts: THREE.Vector3[] = [];
  for (let i = 0; i <= 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    centerBullseyePts.push(
      new THREE.Vector3(Math.cos(a) * rx * 0.34, Math.sin(a) * ry * 0.34, 0.06)
    );
  }
  winGroup.add(createCurvedTimberTube(centerBullseyePts, 0.016, frameMat, 24, 6));

  // 4. Curved Snow-Drift Window Sill hugging the bottom arc of the round window
  const sillCurvePts: THREE.Vector3[] = [];
  for (let s = 0; s <= 12; s++) {
    const a = Math.PI * 1.15 + (s / 12) * Math.PI * 0.7;
    sillCurvePts.push(
      new THREE.Vector3(
        Math.cos(a) * (rx + 0.03),
        Math.sin(a) * (ry + 0.03) - 0.01,
        0.115
      )
    );
  }
  winGroup.add(createCurvedTimberTube(sillCurvePts, 0.038, snowMat, 18, 8));

  // 5. Window Holiday Wreath at z = 0.14m
  if (includeWreath) {
    const wreath = createSeussianHolidayWreath(
      widthM * 0.28,
      0.052,
      wreathMat,
      bowMat,
      berryMat
    );
    wreath.position.set(0, 0, 0.14);
    winGroup.add(wreath);
  }

  return winGroup;
}

/**
 * Helper to build a catenary string of festive multi-colored emissive Who-land
 * holiday fairy lights draped across the wall bays.
 */
function createHolidayLightGarland(
  start: THREE.Vector3,
  mid: THREE.Vector3,
  end: THREE.Vector3,
  _cordMat: THREE.Material,
  bulbCount: number
): THREE.Group {
  return createWhoLandFairyLightStrand([start, mid, end], {
    bulbCount,
    bulbRadiusM: 0.035,
    emissiveIntensity: 0.98,
    cordColor: 0x1a3b22,
    includePointLight: true,
    pointLightIntensity: 0.55,
    pointLightDistance: 2.6,
  });
}

/**
 * Builds Papa Who's House (Lineset #9 at 6'-6", z = -1.98m) in either
 * solid painted wall mode (Scene 1H "Who's House — I Hate Christmas") or
 * translucent backlit scrim mode (Scene 1E "Who's House — He's a Mean One, Mr. Grinch").
 */
export function buildPapaWhosHouseUnit(
  rockTex: THREE.CanvasTexture,
  translucentScrimMode: boolean
): THREE.Group {
  const group = new THREE.Group();
  group.name = translucentScrimMode
    ? 'Element_grinch-papa-whos-scrim-mode'
    : 'Element_grinch-papa-whos-house';

  const oliveRoofTex = createSeussianOliveRoofTexture();
  const plasterTex = createWhoWallPlasterTexture();
  const bannerTex = createMantelSwagBannerTexture();
  const fieldstoneTex = createFireplaceFieldstoneTexture();
  const fridgeBlueTex = createWhoPaintedFurnitureTexture('#1868d8', '#3888f0', '#10489e', false);
  const fridgePinkTex = createWhoPaintedFurnitureTexture('#dca0bc', '#f0bcd4', '#b47494', false);
  const daybedTuftedTex = createWhoPaintedFurnitureTexture('#1868d8', '#3482ec', '#0e4296', true);
  const stuccoNormalTex = createStuccoPlasterNormalTexture();
  const rockNormalTex = createSeussianRockNormalTexture();
  const papierMacheNormalTex = createPapierMacheNormalTexture();
  const fabricNormalTex = createFabricWeaveNormalTexture();

  // Core Scenic Materials (toned down so stage spotlights never overexpose them)
  const oliveTimberMat = new THREE.MeshStandardMaterial({
    map: oliveRoofTex,
    normalMap: rockNormalTex,
    normalScale: new THREE.Vector2(0.32, 0.32),
    color: 0x8ea454,
    roughness: 0.62,
    metalness: 0.04,
  });
  const darkOliveTrimMat = new THREE.MeshStandardMaterial({
    map: oliveRoofTex,
    normalMap: rockNormalTex,
    normalScale: new THREE.Vector2(0.35, 0.35),
    color: 0x6c863b,
    roughness: 0.64,
    metalness: 0.04,
  });
  const roofGreenMat = new THREE.MeshStandardMaterial({
    map: oliveRoofTex,
    normalMap: rockNormalTex,
    normalScale: new THREE.Vector2(0.42, 0.42),
    color: 0x5c7c32,
    roughness: 0.66,
    metalness: 0.04,
    transparent: translucentScrimMode,
    opacity: translucentScrimMode ? 0.88 : 1.0,
  });
  const wallPlasterOrScrimMat = new THREE.MeshStandardMaterial({
    map: plasterTex,
    normalMap: stuccoNormalTex,
    normalScale: new THREE.Vector2(0.38, 0.38),
    color: translucentScrimMode ? 0xc8bfe0 : 0xd6cedc,
    roughness: 0.72,
    metalness: 0.02,
    transparent: true,
    opacity: translucentScrimMode ? 0.24 : 0.96,
    depthWrite: !translucentScrimMode,
    side: THREE.DoubleSide,
  });
  const dadoPanelMat = new THREE.MeshStandardMaterial({
    map: plasterTex,
    normalMap: stuccoNormalTex,
    normalScale: new THREE.Vector2(0.34, 0.34),
    color: translucentScrimMode ? 0xb4accc : 0xc2bcac,
    roughness: 0.74,
    transparent: true,
    opacity: translucentScrimMode ? 0.26 : 0.96,
    depthWrite: !translucentScrimMode,
  });
  const chimneyBreastMat = new THREE.MeshStandardMaterial({
    map: fieldstoneTex,
    normalMap: rockNormalTex,
    normalScale: new THREE.Vector2(0.58, 0.58),
    color: 0x9aa898,
    roughness: 0.74,
    metalness: 0.04,
  });
  const hearthStoneMat = new THREE.MeshStandardMaterial({
    map: fieldstoneTex,
    normalMap: rockNormalTex,
    normalScale: new THREE.Vector2(0.58, 0.58),
    color: 0xb2a8c2,
    roughness: 0.68,
    metalness: 0.05,
  });
  const hearthAccentStoneMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    normalMap: rockNormalTex,
    normalScale: new THREE.Vector2(0.52, 0.52),
    color: 0x7c7290,
    roughness: 0.72,
  });
  const tonedSnowMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    normalMap: papierMacheNormalTex,
    normalScale: new THREE.Vector2(0.48, 0.48),
    color: 0xbacbe2,
    roughness: 0.68,
    metalness: 0.02,
  });
  const windowGlassMat = new THREE.MeshStandardMaterial({
    color: 0xc8aad8,
    emissive: translucentScrimMode ? 0x623888 : 0x482c64,
    emissiveIntensity: translucentScrimMode ? 0.45 : 0.25,
    roughness: 0.35,
    transparent: true,
    opacity: translucentScrimMode ? 0.52 : 0.78,
  });
  const wreathGreenMat = new THREE.MeshStandardMaterial({
    color: 0x1b7c3a,
    roughness: 0.62,
  });
  const goldBowMat = new THREE.MeshStandardMaterial({
    color: 0xe6b828,
    roughness: 0.42,
    metalness: 0.14,
  });
  const crimsonMat = new THREE.MeshStandardMaterial({
    color: 0xc81e34,
    roughness: 0.48,
  });
  const royalBlueMat = new THREE.MeshStandardMaterial({
    map: fridgeBlueTex,
    roughness: 0.46,
    metalness: 0.06,
  });
  const daybedTuftedMat = new THREE.MeshStandardMaterial({
    map: daybedTuftedTex,
    normalMap: fabricNormalTex,
    normalScale: new THREE.Vector2(0.4, 0.4),
    roughness: 0.54,
    metalness: 0.04,
  });
  const deepBlueTrimMat = new THREE.MeshStandardMaterial({
    color: 0x124da8,
    roughness: 0.5,
  });
  const pastelPinkMat = new THREE.MeshStandardMaterial({
    map: fridgePinkTex,
    roughness: 0.5,
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xd8a838,
    roughness: 0.28,
    metalness: 0.72,
  });
  const cordWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xd8d6e2,
    roughness: 0.55,
  });

  // ==========================================================================
  // 1. MAIN HOUSE FRAME (Lineset #9 at 6'-6", z = -1.98m)
  //    Curvy, asymmetrical Seussian gable facade (width ≈ 6.8m, height ≈ 4.9m)
  // ==========================================================================
  const houseFrame = new THREE.Group();
  houseFrame.name = 'PapaWhosHouseFrame_Line9';
  houseFrame.position.set(0, 0, -1.98);
  group.add(houseFrame);

  // --------------------------------------------------------------------------
  // 1A. LEFT & RIGHT WALL BAYS (z = -0.075m to -0.025m) WITH WINDOW CUTOUTS
  //     Solid warm plaster in 1H (opacity 0.96) / Translucent scrim in 1E (opacity 0.24)
  // --------------------------------------------------------------------------
  const leftWallShape = new THREE.Shape();
  leftWallShape.moveTo(-2.96, 0.02);
  leftWallShape.lineTo(-0.74, 0.02);
  leftWallShape.lineTo(-0.74, 3.24);
  leftWallShape.bezierCurveTo(-1.45, 3.22, -2.52, 3.05, -3.52, 2.56);
  leftWallShape.bezierCurveTo(-3.36, 1.75, -3.14, 0.85, -2.96, 0.02);

  // Round/oval bullseye cutout hole for Left Window (centered at x = -1.85m, y = 1.72m)
  const leftWinHole = new THREE.Path();
  leftWinHole.absellipse(-1.85, 1.72, 0.4, 0.54, 0, Math.PI * 2, true, 0);
  leftWallShape.holes.push(leftWinHole);

  const leftWallGeo = new THREE.ExtrudeGeometry(leftWallShape, {
    depth: 0.05,
    bevelEnabled: false,
  });
  normalizeExtrudeUVs(leftWallGeo, 'world', 2.8);
  const leftWallBay = new THREE.Mesh(leftWallGeo, wallPlasterOrScrimMat);
  leftWallBay.position.z = -0.075;
  leftWallBay.castShadow = !translucentScrimMode;
  leftWallBay.receiveShadow = true;
  houseFrame.add(leftWallBay);

  // Lower Left Wainscot / Dado Recessed Panels (z = -0.02m, y = 0.08..0.88m)
  for (const dx of [-2.72, -2.08, -1.38]) {
    const dadoPanel = new THREE.Mesh(
      new RoundedBoxGeometry(0.54, 0.72, 0.025, 2, 0.03),
      dadoPanelMat
    );
    dadoPanel.position.set(dx, 0.48, -0.01);
    dadoPanel.rotation.z = dx * -0.015;
    houseFrame.add(dadoPanel);
  }

  // Right Wall Bay (x = +0.66m to +3.42m, flaring outward toward upper eaves)
  const rightWallShape = new THREE.Shape();
  rightWallShape.moveTo(0.66, 0.02);
  rightWallShape.lineTo(2.68, 0.02);
  rightWallShape.bezierCurveTo(3.04, 0.85, 3.28, 1.82, 3.42, 2.92);
  rightWallShape.bezierCurveTo(2.68, 3.16, 1.95, 3.08, 1.42, 2.76);
  rightWallShape.bezierCurveTo(1.12, 2.86, 0.88, 2.98, 0.66, 3.06);
  rightWallShape.lineTo(0.66, 0.02);

  // Round/oval bullseye cutout hole for Right Window (centered at x = +2.15m, y = 1.68m)
  const rightWinHole = new THREE.Path();
  rightWinHole.absellipse(2.15, 1.68, 0.32, 0.48, 0, Math.PI * 2, true, 0);
  rightWallShape.holes.push(rightWinHole);

  const rightWallGeo = new THREE.ExtrudeGeometry(rightWallShape, {
    depth: 0.05,
    bevelEnabled: false,
  });
  normalizeExtrudeUVs(rightWallGeo, 'world', 2.8);
  const rightWallBay = new THREE.Mesh(rightWallGeo, wallPlasterOrScrimMat);
  rightWallBay.position.z = -0.075;
  rightWallBay.castShadow = !translucentScrimMode;
  rightWallBay.receiveShadow = true;
  houseFrame.add(rightWallBay);

  // --------------------------------------------------------------------------
  // 1B. UPPER ASYMMETRICAL SEUSSIAN GREEN GABLE ROOF (z = -0.04m to +0.02m)
  //     Matches the sweeping olive-green domed gable in model_1H_whos_house_day.jpg
  // --------------------------------------------------------------------------
  const roofGableShape = new THREE.Shape();
  roofGableShape.moveTo(-3.56, 2.52);
  roofGableShape.bezierCurveTo(-3.18, 3.88, -2.18, 4.64, -0.95, 4.58);
  roofGableShape.bezierCurveTo(0.28, 4.52, 1.48, 4.02, 2.48, 3.68);
  roofGableShape.bezierCurveTo(3.12, 3.46, 3.56, 3.22, 3.52, 2.78);
  roofGableShape.bezierCurveTo(2.85, 3.16, 2.02, 3.12, 1.42, 2.76);
  roofGableShape.bezierCurveTo(1.08, 2.88, 0.85, 3.02, 0.66, 3.08);
  roofGableShape.lineTo(-0.74, 3.28);
  roofGableShape.bezierCurveTo(-1.62, 3.24, -2.65, 3.02, -3.56, 2.52);

  const roofGableGeo = new THREE.ExtrudeGeometry(roofGableShape, {
    depth: 0.06,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.015,
    bevelSegments: 2,
  });
  normalizeExtrudeUVs(roofGableGeo, 'world', 3.2);
  const roofGablePanel = new THREE.Mesh(roofGableGeo, roofGreenMat);
  roofGablePanel.position.z = -0.04;
  roofGablePanel.castShadow = true;
  roofGablePanel.receiveShadow = true;
  houseFrame.add(roofGablePanel);

  // Recessed dark-olive decorative roof bay insets (4 contoured roof bays at z = +0.038m)
  const roofInsetSpecs = [
    { x: -2.58, y: 3.32, w: 0.92, h: 0.62, rz: 0.42 },
    { x: -1.18, y: 3.86, w: 1.28, h: 0.82, rz: 0.08 },
    { x: 0.48, y: 3.64, w: 1.32, h: 0.76, rz: -0.22 },
    { x: 2.18, y: 3.28, w: 1.15, h: 0.52, rz: -0.18 },
  ] as const;
  for (const rSpec of roofInsetSpecs) {
    const inset = new THREE.Mesh(
      new RoundedBoxGeometry(rSpec.w, rSpec.h, 0.025, 2, 0.08),
      darkOliveTrimMat
    );
    inset.position.set(rSpec.x, rSpec.y, 0.038);
    inset.rotation.z = rSpec.rz;
    houseFrame.add(inset);
  }

  // --------------------------------------------------------------------------
  // 1C. EXPOSED OLIVE-GREEN SEUSSIAN TIMBER SKELETON (z = +0.07m to +0.12m)
  //     Curved vertical posts, arched collar beams, and radiating fan-like roof ribs
  // --------------------------------------------------------------------------
  const outerRoofArchPts = [
    new THREE.Vector3(-3.62, 2.46, 0.1),
    new THREE.Vector3(-3.12, 3.68, 0.1),
    new THREE.Vector3(-2.15, 4.44, 0.1),
    new THREE.Vector3(-0.95, 4.62, 0.1),
    new THREE.Vector3(0.35, 4.38, 0.1),
    new THREE.Vector3(1.68, 3.92, 0.1),
    new THREE.Vector3(2.88, 3.52, 0.1),
    new THREE.Vector3(3.54, 3.12, 0.1),
    new THREE.Vector3(3.52, 2.74, 0.1),
  ];
  houseFrame.add(createCurvedTimberTube(outerRoofArchPts, 0.068, oliveTimberMat, 56, 10));

  const collarBeamPts = [
    new THREE.Vector3(-3.58, 2.5, 0.11),
    new THREE.Vector3(-2.55, 2.98, 0.11),
    new THREE.Vector3(-1.45, 3.24, 0.11),
    new THREE.Vector3(-0.72, 3.3, 0.11),
    new THREE.Vector3(0.66, 3.06, 0.11),
    new THREE.Vector3(1.42, 2.76, 0.11),
    new THREE.Vector3(2.35, 3.12, 0.11),
    new THREE.Vector3(3.15, 3.08, 0.11),
    new THREE.Vector3(3.5, 2.78, 0.11),
  ];
  houseFrame.add(createCurvedTimberTube(collarBeamPts, 0.058, oliveTimberMat, 52, 10));

  // Radiating Fan-Like Roof Ribs (z = +0.10m) dividing the upper green roof into 5 contoured bays
  const roofRibCurves: ReadonlyArray<ReadonlyArray<THREE.Vector3>> = [
    [
      new THREE.Vector3(-2.15, 3.12, 0.1),
      new THREE.Vector3(-2.35, 3.74, 0.1),
      new THREE.Vector3(-2.55, 4.26, 0.1),
    ],
    [
      new THREE.Vector3(-0.72, 3.3, 0.1),
      new THREE.Vector3(-0.82, 3.96, 0.1),
      new THREE.Vector3(-0.92, 4.58, 0.1),
    ],
    [
      new THREE.Vector3(0.02, 3.2, 0.1),
      new THREE.Vector3(0.08, 3.84, 0.1),
      new THREE.Vector3(0.14, 4.42, 0.1),
    ],
    [
      new THREE.Vector3(1.42, 2.76, 0.1),
      new THREE.Vector3(1.62, 3.34, 0.1),
      new THREE.Vector3(1.88, 3.85, 0.1),
    ],
    [
      new THREE.Vector3(2.68, 3.1, 0.1),
      new THREE.Vector3(2.88, 3.32, 0.1),
      new THREE.Vector3(3.12, 3.44, 0.1),
    ],
  ];
  for (const ribPts of roofRibCurves) {
    houseFrame.add(createCurvedTimberTube(ribPts, 0.052, oliveTimberMat, 20, 8));
  }

  // Bowed Outer Wall Posts & Interior Framing Posts (z = +0.075m)
  const verticalPostCurves: ReadonlyArray<ReadonlyArray<THREE.Vector3>> = [
    [
      new THREE.Vector3(-3.04, 0.02, 0.075),
      new THREE.Vector3(-3.32, 1.25, 0.075),
      new THREE.Vector3(-3.44, 2.52, 0.075),
    ],
    [
      new THREE.Vector3(-2.34, 0.02, 0.075),
      new THREE.Vector3(-2.38, 1.48, 0.075),
      new THREE.Vector3(-2.22, 3.08, 0.075),
    ],
    [
      new THREE.Vector3(-1.38, 0.02, 0.075),
      new THREE.Vector3(-1.34, 1.55, 0.075),
      new THREE.Vector3(-1.42, 3.22, 0.075),
    ],
    [
      new THREE.Vector3(-0.74, 0.02, 0.115),
      new THREE.Vector3(-0.74, 1.65, 0.115),
      new THREE.Vector3(-0.72, 3.28, 0.115),
    ],
    [
      new THREE.Vector3(0.66, 0.02, 0.115),
      new THREE.Vector3(0.66, 1.58, 0.115),
      new THREE.Vector3(0.66, 3.06, 0.115),
    ],
    [
      new THREE.Vector3(1.58, 0.02, 0.075),
      new THREE.Vector3(1.52, 1.45, 0.075),
      new THREE.Vector3(1.42, 2.76, 0.075),
    ],
    [
      new THREE.Vector3(2.74, 0.02, 0.075),
      new THREE.Vector3(3.22, 1.42, 0.075),
      new THREE.Vector3(3.32, 2.9, 0.075),
    ],
  ];
  for (const postPts of verticalPostCurves) {
    houseFrame.add(createCurvedTimberTube(postPts, 0.048, oliveTimberMat, 24, 8));
  }

  // Horizontal & Gently Curved Dado / Chair-Rail Beams & Base Sills (z = +0.068m)
  const dadoBeamCurves: ReadonlyArray<ReadonlyArray<THREE.Vector3>> = [
    [
      new THREE.Vector3(-3.06, 0.06, 0.068),
      new THREE.Vector3(-1.9, 0.06, 0.068),
      new THREE.Vector3(-0.74, 0.06, 0.068),
    ],
    [
      new THREE.Vector3(-3.26, 0.92, 0.068),
      new THREE.Vector3(-2.15, 0.98, 0.068),
      new THREE.Vector3(-0.74, 1.02, 0.068),
    ],
    [
      new THREE.Vector3(-3.36, 1.72, 0.068),
      new THREE.Vector3(-2.85, 1.78, 0.068),
      new THREE.Vector3(-2.36, 1.82, 0.068),
    ],
    [
      new THREE.Vector3(0.66, 0.06, 0.068),
      new THREE.Vector3(1.75, 0.06, 0.068),
      new THREE.Vector3(2.76, 0.06, 0.068),
    ],
    [
      new THREE.Vector3(0.66, 0.94, 0.068),
      new THREE.Vector3(1.85, 0.92, 0.068),
      new THREE.Vector3(3.08, 0.88, 0.068),
    ],
  ];
  for (const beamPts of dadoBeamCurves) {
    houseFrame.add(createCurvedTimberTube(beamPts, 0.036, oliveTimberMat, 20, 8));
  }

  // Decorative Seussian Spiral Scrollwork next to fireplace base (visible in model_1E_mean_one_scrim.jpg)
  for (const scrollSide of [-1, 1]) {
    const sx = scrollSide < 0 ? -0.96 : 0.88;
    const scrollPts: THREE.Vector3[] = [];
    for (let t = 0; t <= 16; t++) {
      const a = (t / 16) * Math.PI * 2.4;
      const r = 0.16 * (1 - (t / 16) * 0.68);
      scrollPts.push(
        new THREE.Vector3(
          sx + scrollSide * Math.cos(a) * r,
          0.42 + Math.sin(a) * r,
          0.068
        )
      );
    }
    houseFrame.add(createCurvedTimberTube(scrollPts, 0.016, oliveTimberMat, 24, 6));
  }

  // --------------------------------------------------------------------------
  // 1D. INTEGRATED SNOWY ROOF EAVE MANTLE, HOLIDAY GARLAND & CHIMNEY
  // --------------------------------------------------------------------------
  const roofCurveForSnow = new THREE.CatmullRomCurve3(outerRoofArchPts);

  // Continuous flush-integrated snow eave mantle along the gable arch
  const snowEaveCrest = new THREE.Mesh(
    new THREE.TubeGeometry(roofCurveForSnow, 56, 0.088, 10, false),
    tonedSnowMat
  );
  snowEaveCrest.scale.set(1.0, 0.92, 1.15);
  snowEaveCrest.position.set(0, 0.06, 0.045);
  snowEaveCrest.castShadow = true;
  houseFrame.add(snowEaveCrest);

  // Evergreen eave garland & red/gold ornaments along the gable arch
  const eaveGarlandMesh = new THREE.Mesh(
    new THREE.TubeGeometry(roofCurveForSnow, 48, 0.036, 8, false),
    wreathGreenMat
  );
  eaveGarlandMesh.position.set(0, -0.02, 0.09);
  houseFrame.add(eaveGarlandMesh);

  const snowLobeCount = 19;
  for (let i = 1; i < snowLobeCount - 1; i += 2) {
    const t = i / (snowLobeCount - 1);
    const pt = roofCurveForSnow.getPoint(t);
    const ornament = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 10, 8),
      i % 4 === 1 ? crimsonMat : goldBowMat
    );
    ornament.position.set(pt.x, pt.y - 0.06, 0.21);
    houseFrame.add(ornament);
  }

  // Multi-colored emissive Who-land fairy light strand along the gable roof eaves
  const roofEaveFairyPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 14; i++) {
    const t = i / 14;
    const pt = roofCurveForSnow.getPoint(t);
    roofEaveFairyPts.push(new THREE.Vector3(pt.x, pt.y + 0.02, 0.23));
  }
  houseFrame.add(
    createWhoLandFairyLightStrand(roofEaveFairyPts, {
      bulbCount: 16,
      bulbRadiusM: 0.032,
      emissiveIntensity: 0.96,
      cordColor: 0x1a3b22,
      includePointLight: true,
      pointLightIntensity: 0.65,
      pointLightDistance: 3.2,
    })
  );

  // Draped Holiday String Lights across Left & Right Wall Bays (z = +0.20m)
  houseFrame.add(
    createHolidayLightGarland(
      new THREE.Vector3(-3.36, 1.92, 0.2),
      new THREE.Vector3(-2.05, 1.78, 0.2),
      new THREE.Vector3(-0.78, 2.15, 0.2),
      cordWhiteMat,
      9
    )
  );
  houseFrame.add(
    createHolidayLightGarland(
      new THREE.Vector3(0.7, 2.12, 0.2),
      new THREE.Vector3(1.92, 1.84, 0.2),
      new THREE.Vector3(3.26, 1.96, 0.2),
      cordWhiteMat,
      9
    )
  );

  // Tall, Crooked S-Bent Chimney rising behind the center roof peak (y = 3.85m–5.32m, z = -0.22m)
  const chimneyStackGroup = new THREE.Group();
  chimneyStackGroup.position.set(0.18, 0, -0.22);
  houseFrame.add(chimneyStackGroup);

  const sBentChimneyCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.12, 3.75, 0),
    new THREE.Vector3(0.16, 4.35, 0),
    new THREE.Vector3(-0.08, 4.88, 0),
    new THREE.Vector3(0.22, 5.26, 0),
  ]);
  const chimneyPipe = new THREE.Mesh(
    new THREE.TubeGeometry(sBentChimneyCurve, 28, 0.34, 14, false),
    hearthStoneMat
  );
  chimneyPipe.scale.set(1.22, 1.0, 0.65);
  chimneyPipe.castShadow = true;
  chimneyStackGroup.add(chimneyPipe);

  // Bulbous Seussian Chimney Crown & Snow-Rimmed Flue Cap at y = 5.28m
  const chimneyCrown = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.13, 12, 22),
    tonedSnowMat
  );
  chimneyCrown.rotation.x = Math.PI / 2;
  chimneyCrown.rotation.y = -0.24;
  chimneyCrown.scale.set(1.2, 0.72, 1.0);
  chimneyCrown.position.set(0.24, 5.28, 0);
  chimneyStackGroup.add(chimneyCrown);

  const flueHole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.24, 0.16, 14),
    new THREE.MeshStandardMaterial({ color: 0x221a28, roughness: 0.85 })
  );
  flueHole.scale.set(1.15, 1.0, 0.68);
  flueHole.position.set(0.24, 5.3, 0);
  flueHole.rotation.z = -0.24;
  chimneyStackGroup.add(flueHole);

  // --------------------------------------------------------------------------
  // 1E. CENTRAL CHIMNEY BREAST & SCULPTED STONE FIREPLACE HEARTH (x = -0.05m)
  // --------------------------------------------------------------------------
  const upperBreastShape = new THREE.Shape();
  upperBreastShape.moveTo(-0.68, 1.32);
  upperBreastShape.lineTo(0.68, 1.32);
  upperBreastShape.lineTo(0.68, 3.06);
  upperBreastShape.lineTo(-0.68, 3.28);
  upperBreastShape.lineTo(-0.68, 1.32);

  const upperBreastGeo = new THREE.ExtrudeGeometry(upperBreastShape, {
    depth: 0.08,
    bevelEnabled: false,
  });
  normalizeExtrudeUVs(upperBreastGeo, 'fit');
  const upperChimneyBreast = new THREE.Mesh(upperBreastGeo, chimneyBreastMat);
  upperChimneyBreast.position.set(-0.04, 0, 0.0);
  upperChimneyBreast.castShadow = true;
  upperChimneyBreast.receiveShadow = true;
  houseFrame.add(upperChimneyBreast);

  // Over-Mantel Evergreen Wreath with Golden-Yellow Bow (x = -0.05m, y = 2.46m, z = +0.18m)
  const mantelWreath = createSeussianHolidayWreath(
    0.31,
    0.075,
    wreathGreenMat,
    goldBowMat,
    crimsonMat
  );
  mantelWreath.position.set(-0.05, 2.46, 0.18);
  houseFrame.add(mantelWreath);

  // Festive Red & Gold Holiday Swag Banner below Wreath (x = -0.05m, y = 1.78m, z = +0.15m)
  const swagBannerGeo = new THREE.PlaneGeometry(1.26, 0.38, 16, 4);
  const swagPos = swagBannerGeo.attributes.position;
  if (swagPos) {
    for (let i = 0; i < swagPos.count; i++) {
      const bx = swagPos.getX(i);
      const by = swagPos.getY(i);
      const sag = -0.08 * (1 - (bx / 0.63) * (bx / 0.63));
      swagPos.setY(i, by + sag);
    }
    swagPos.needsUpdate = true;
  }
  const swagBanner = new THREE.Mesh(
    swagBannerGeo,
    new THREE.MeshStandardMaterial({
      map: bannerTex,
      roughness: 0.52,
      side: THREE.DoubleSide,
    })
  );
  swagBanner.position.set(-0.05, 1.78, 0.15);
  houseFrame.add(swagBanner);

  // Gold Banner Corner Rosettes & Tassels at z = +0.18m
  for (const bSide of [-1, 1]) {
    const rosette = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.03, 0.14, 8),
      goldBowMat
    );
    rosette.position.set(-0.05 + bSide * 0.61, 1.76, 0.18);
    houseFrame.add(rosette);
  }

  // Sculpted Seussian Stone Fireplace Hearth (x = -0.05m, y = 0..1.32m, z ∈ [-2.10m, -1.62m] world)
  const hearthGroup = new THREE.Group();
  hearthGroup.position.set(-0.05, 0, 0);
  houseFrame.add(hearthGroup);

  // Raised Stone Hearth Floor Slab (z = +0.16m local -> world z = -1.82m, depth 0.36m -> world z ∈ [-2.00m, -1.64m])
  const hearthSlab = new THREE.Mesh(
    new RoundedBoxGeometry(1.72, 0.12, 0.36, 2, 0.04),
    hearthStoneMat
  );
  hearthSlab.position.set(0, 0.06, 0.16);
  hearthSlab.receiveShadow = true;
  hearthGroup.add(hearthSlab);

  // Flared Left & Right Stone Jamb Pilasters (z = +0.14m) & Stepped Stone Blocks (z = +0.24m)
  for (const jSide of [-1, 1]) {
    const jamb = new THREE.Mesh(
      new RoundedBoxGeometry(0.32, 1.18, 0.18, 2, 0.05),
      hearthStoneMat
    );
    jamb.position.set(jSide * 0.58, 0.68, 0.14);
    jamb.rotation.z = jSide * -0.06;
    jamb.castShadow = true;
    hearthGroup.add(jamb);

    // 4 stepped Seussian masonry stone blocks on each jamb (z = +0.25m)
    for (let b = 0; b < 4; b++) {
      const stoneBlock = new THREE.Mesh(
        new RoundedBoxGeometry(0.28 + (b % 2) * 0.05, 0.22, 0.06, 2, 0.03),
        b % 2 === 0 ? hearthAccentStoneMat : hearthStoneMat
      );
      stoneBlock.position.set(
        jSide * (0.56 + b * 0.015),
        0.24 + b * 0.27,
        0.25
      );
      stoneBlock.rotation.z = jSide * -0.05;
      hearthGroup.add(stoneBlock);
    }
  }

  // Arched Stone Firebox Lintel Header (y = 1.16m, z = +0.16m)
  const lintelArch = new THREE.Mesh(
    new RoundedBoxGeometry(1.48, 0.22, 0.18, 2, 0.05),
    hearthAccentStoneMat
  );
  lintelArch.position.set(0, 1.16, 0.16);
  hearthGroup.add(lintelArch);

  // Deep Dark-Crimson Firebox Recess (z = +0.06m)
  const fireboxBack = new THREE.Mesh(
    new RoundedBoxGeometry(0.92, 0.98, 0.06, 2, 0.04),
    new THREE.MeshStandardMaterial({
      color: 0x3b0c18,
      emissive: 0x981818,
      emissiveIntensity: 0.45,
      roughness: 0.75,
    })
  );
  fireboxBack.position.set(0, 0.6, 0.06);
  hearthGroup.add(fireboxBack);

  // Wrought-Iron Andirons, Grate & Charred Firewood Logs (z = +0.14m)
  const ironMat = new THREE.MeshStandardMaterial({
    color: 0x1e1a24,
    roughness: 0.48,
    metalness: 0.65,
  });
  for (const ax of [-0.28, 0.28]) {
    const andironPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.028, 0.28, 8),
      ironMat
    );
    andironPost.position.set(ax, 0.26, 0.18);
    hearthGroup.add(andironPost);

    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), brassMat);
    finial.position.set(ax, 0.41, 0.18);
    hearthGroup.add(finial);
  }

  const logMat = new THREE.MeshStandardMaterial({
    color: 0x3e2214,
    emissive: 0x681808,
    emissiveIntensity: 0.35,
    roughness: 0.82,
  });
  for (let l = 0; l < 3; l++) {
    const log = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.06, 0.56, 10),
      logMat
    );
    log.rotation.z = Math.PI / 2 + (l - 1) * 0.14;
    log.position.set((l - 1) * 0.05, 0.22 + (l % 2) * 0.07, 0.14);
    hearthGroup.add(log);
  }

  // Sculpted Glowing Flames inside Firebox (z = +0.17m and +0.20m)
  const flameSpecs = [
    { x: -0.18, y: 0.38, r: 0.09, h: 0.34, z: 0.17, col: 0xff4818 },
    { x: 0.0, y: 0.44, r: 0.12, h: 0.44, z: 0.2, col: 0xff9818 },
    { x: 0.17, y: 0.36, r: 0.085, h: 0.32, z: 0.17, col: 0xff5818 },
    { x: -0.06, y: 0.35, r: 0.07, h: 0.26, z: 0.22, col: 0xffd428 },
  ] as const;
  for (const fSpec of flameSpecs) {
    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(fSpec.r, fSpec.h, 8),
      new THREE.MeshStandardMaterial({
        color: fSpec.col,
        emissive: fSpec.col,
        emissiveIntensity: 0.9,
        roughness: 0.3,
      })
    );
    flame.position.set(fSpec.x, fSpec.y, fSpec.z);
    flame.rotation.z = fSpec.x * -0.4;
    hearthGroup.add(flame);
  }

  // Contoured Mantel Shelf with Sculpted Seussian Molding (y = 1.30m, z = +0.18m -> world z ∈ [-1.96m, -1.64m])
  const mantelShelf = new THREE.Mesh(
    new RoundedBoxGeometry(1.84, 0.11, 0.32, 3, 0.04),
    tonedSnowMat
  );
  mantelShelf.position.set(0, 1.3, 0.18);
  mantelShelf.castShadow = true;
  hearthGroup.add(mantelShelf);

  const mantelMoldingPts = [
    new THREE.Vector3(-0.9, 1.24, 0.31),
    new THREE.Vector3(0, 1.27, 0.33),
    new THREE.Vector3(0.9, 1.24, 0.31),
  ];
  hearthGroup.add(createCurvedTimberTube(mantelMoldingPts, 0.028, oliveTimberMat, 20, 8));

  // 4 Colorful Seussian Christmas Stockings with White Fuzzy Cuffs & Toe Pom-Poms (z = +0.36m -> world z = -1.62m)
  const stockingSpecs = [
    { x: -0.62, col: 0x2898ff, tilt: 0.14 },
    { x: -0.22, col: 0xe62842, tilt: -0.1 },
    { x: 0.2, col: 0xf2b824, tilt: 0.12 },
    { x: 0.6, col: 0x24c468, tilt: -0.15 },
  ] as const;
  const fuzzyWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xdce4f0,
    roughness: 0.78,
  });
  for (const sSpec of stockingSpecs) {
    const stGroup = new THREE.Group();
    stGroup.position.set(sSpec.x, 1.12, 0.36);
    stGroup.rotation.z = sSpec.tilt;

    const stMat = new THREE.MeshStandardMaterial({
      color: sSpec.col,
      roughness: 0.52,
    });

    const cuff = new THREE.Mesh(
      new RoundedBoxGeometry(0.13, 0.065, 0.055, 2, 0.02),
      fuzzyWhiteMat
    );
    cuff.position.set(0, 0.11, 0.015);
    stGroup.add(cuff);

    const leg = new THREE.Mesh(
      new RoundedBoxGeometry(0.105, 0.22, 0.045, 2, 0.02),
      stMat
    );
    stGroup.add(leg);

    const foot = new THREE.Mesh(
      new RoundedBoxGeometry(0.15, 0.085, 0.045, 2, 0.03),
      stMat
    );
    foot.position.set(0.045, -0.09, 0.01);
    foot.rotation.z = 0.25;
    stGroup.add(foot);

    const pomPom = new THREE.Mesh(
      new THREE.SphereGeometry(0.032, 8, 8),
      fuzzyWhiteMat
    );
    pomPom.position.set(0.12, -0.065, 0.02);
    stGroup.add(pomPom);

    hearthGroup.add(stGroup);
  }

  // --------------------------------------------------------------------------
  // 1F. ARCHED WINDOWS (x = -1.85m & x = +2.15m), SECOND WREATH & GREEN WHO DOOR (x = +1.15m)
  // --------------------------------------------------------------------------
  const leftWindow = createSeussianArchedWindow(
    0.82,
    1.28,
    0.06,
    oliveTimberMat,
    windowGlassMat,
    tonedSnowMat,
    wreathGreenMat,
    goldBowMat,
    crimsonMat,
    true
  );
  leftWindow.position.set(-1.85, 1.72, 0);
  houseFrame.add(leftWindow);

  const rightWindow = createSeussianArchedWindow(
    0.66,
    1.12,
    -0.08,
    oliveTimberMat,
    windowGlassMat,
    tonedSnowMat,
    wreathGreenMat,
    goldBowMat,
    crimsonMat,
    false
  );
  rightWindow.position.set(2.15, 1.68, 0);
  houseFrame.add(rightWindow);

  // Third Evergreen Wreath with Yellow Bow on Right Interior Wall Bay (matching model_1H_whos_house_day.jpg)
  const rightBayWreath = createSeussianHolidayWreath(
    0.22,
    0.055,
    wreathGreenMat,
    goldBowMat,
    crimsonMat
  );
  rightBayWreath.position.set(1.15, 2.38, 0.17);
  houseFrame.add(rightBayWreath);

  // Crooked Arched Green Who Front Door on the Right (x = +1.15m, y = 0..2.14m)
  const doorGroup = new THREE.Group();
  doorGroup.position.set(1.15, 0, 0);
  houseFrame.add(doorGroup);

  const doorPanelShape = new THREE.Shape();
  doorPanelShape.moveTo(-0.38, 0.04);
  doorPanelShape.lineTo(0.38, 0.04);
  doorPanelShape.bezierCurveTo(0.44, 0.85, 0.42, 1.55, 0.24, 1.92);
  doorPanelShape.quadraticCurveTo(0, 2.18, -0.26, 1.9);
  doorPanelShape.bezierCurveTo(-0.42, 1.52, -0.42, 0.82, -0.38, 0.04);

  const doorPanelGeo = new THREE.ExtrudeGeometry(doorPanelShape, {
    depth: 0.04,
    bevelEnabled: false,
  });
  normalizeExtrudeUVs(doorPanelGeo, 'fit');
  const doorPanelMesh = new THREE.Mesh(doorPanelGeo, darkOliveTrimMat);
  doorPanelMesh.position.z = 0.015;
  doorPanelMesh.castShadow = true;
  doorGroup.add(doorPanelMesh);

  const doorArchPts = [
    new THREE.Vector3(-0.41, 0.04, 0.095),
    new THREE.Vector3(-0.44, 1.08, 0.095),
    new THREE.Vector3(-0.26, 1.92, 0.095),
    new THREE.Vector3(0.02, 2.14, 0.095),
    new THREE.Vector3(0.28, 1.92, 0.095),
    new THREE.Vector3(0.44, 1.08, 0.095),
    new THREE.Vector3(0.4, 0.04, 0.095),
  ];
  doorGroup.add(createCurvedTimberTube(doorArchPts, 0.042, oliveTimberMat, 32, 8));

  const transomGlass = new THREE.Mesh(
    new THREE.CircleGeometry(0.22, 14, 0, Math.PI),
    windowGlassMat
  );
  transomGlass.position.set(0, 1.72, 0.065);
  doorGroup.add(transomGlass);

  const escutcheon = new THREE.Mesh(
    new RoundedBoxGeometry(0.06, 0.14, 0.02, 1, 0.02),
    brassMat
  );
  escutcheon.position.set(0.26, 0.96, 0.075);
  doorGroup.add(escutcheon);

  const doorknob = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 10), brassMat);
  doorknob.position.set(0.26, 0.98, 0.115);
  doorGroup.add(doorknob);

  // ==========================================================================
  // 2. DOWNSTAGE RIGHT (DSR) WHO KITCHEN WAGON
  //    - DSR Refrigerator at (x = -3.65m, z = -1.38m)
  //    - Prep Table at (x = -2.75m, z = -1.32m)
  //    Clearly separated from the Interior Who Family Christmas Tree (x = -1.75m, z = -1.28m)
  //    and house wall (z = -1.98m).
  // ==========================================================================
  const kitchenWagonGroup = new THREE.Group();
  kitchenWagonGroup.name = 'WhoKitchenWagon_DSR';
  group.add(kitchenWagonGroup);

  // 2A. Bulbous Royal-Blue & Pastel-Pink Seussian Refrigerator at (x = -3.65m, z = -1.38m)
  const fridgeGroup = new THREE.Group();
  fridgeGroup.position.set(-3.65, 0, -1.38);
  fridgeGroup.rotation.y = 0.24;
  fridgeGroup.rotation.z = -0.035;
  kitchenWagonGroup.add(fridgeGroup);

  const fridgeBase = new THREE.Mesh(
    new RoundedBoxGeometry(0.94, 0.16, 0.64, 3, 0.06),
    deepBlueTrimMat
  );
  fridgeBase.position.y = 0.08;
  fridgeBase.castShadow = true;
  fridgeGroup.add(fridgeBase);

  const fridgeBody = new THREE.Mesh(
    new RoundedBoxGeometry(0.86, 1.48, 0.58, 3, 0.15),
    royalBlueMat
  );
  fridgeBody.position.y = 0.88;
  fridgeBody.castShadow = true;
  fridgeBody.receiveShadow = true;
  fridgeGroup.add(fridgeBody);

  const freezerDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.43, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55),
    royalBlueMat
  );
  freezerDome.scale.set(1.0, 0.82, 0.68);
  freezerDome.position.set(0, 1.52, 0);
  freezerDome.castShadow = true;
  fridgeGroup.add(freezerDome);

  for (let slot = -1; slot <= 1; slot++) {
    const louver = new THREE.Mesh(
      new RoundedBoxGeometry(0.15, 0.05, 0.04, 1, 0.015),
      new THREE.MeshStandardMaterial({ color: 0x0b2458, roughness: 0.7 })
    );
    louver.position.set(slot * 0.19, 1.65 - Math.abs(slot) * 0.04, 0.28);
    louver.rotation.z = slot * -0.18;
    fridgeGroup.add(louver);
  }

  const fridgeDoorShape = new THREE.Shape();
  fridgeDoorShape.moveTo(-0.31, 0.18);
  fridgeDoorShape.lineTo(0.31, 0.18);
  fridgeDoorShape.lineTo(0.33, 1.24);
  fridgeDoorShape.quadraticCurveTo(0.33, 1.54, 0, 1.56);
  fridgeDoorShape.quadraticCurveTo(-0.33, 1.54, -0.33, 1.24);
  fridgeDoorShape.lineTo(-0.31, 0.18);

  const fridgeDoorGeo = new THREE.ExtrudeGeometry(fridgeDoorShape, {
    depth: 0.04,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 2,
  });
  normalizeExtrudeUVs(fridgeDoorGeo, 'fit');
  const fridgeDoor = new THREE.Mesh(fridgeDoorGeo, pastelPinkMat);
  fridgeDoor.position.set(0, 0, 0.305);
  fridgeDoor.castShadow = true;
  fridgeGroup.add(fridgeDoor);

  for (const hy of [0.48, 1.18]) {
    const hinge = new THREE.Mesh(
      new RoundedBoxGeometry(0.075, 0.042, 0.028, 1, 0.01),
      brassMat
    );
    hinge.position.set(-0.32, hy, 0.36);
    fridgeGroup.add(hinge);
  }

  const handleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.2, 0.94, 0.36),
    new THREE.Vector3(0.25, 0.84, 0.41),
    new THREE.Vector3(0.17, 0.72, 0.38),
  ]);
  const fridgeHandle = new THREE.Mesh(
    new THREE.TubeGeometry(handleCurve, 16, 0.016, 8, false),
    brassMat
  );
  fridgeGroup.add(fridgeHandle);

  const coilPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 28; i++) {
    const t = i / 28;
    const angle = t * Math.PI * 6;
    const rad = 0.13 * (1 - t * 0.45);
    coilPts.push(
      new THREE.Vector3(
        Math.cos(angle) * rad - 0.07,
        1.86 + t * 0.32,
        Math.sin(angle) * rad - 0.05
      )
    );
  }
  const coolingCoil = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coilPts), 36, 0.015, 8, false),
    brassMat
  );
  fridgeGroup.add(coolingCoil);

  // 2B. Who Kitchen Prep Table at (x = -2.75m, z = -1.32m), Crooked Stools, Mixing Bowls & Roast-Beast Platter
  const prepTableGroup = new THREE.Group();
  prepTableGroup.position.set(-2.75, 0, -1.32);
  prepTableGroup.rotation.y = 0.14;
  kitchenWagonGroup.add(prepTableGroup);

  const tableApron = new THREE.Mesh(
    new RoundedBoxGeometry(0.62, 0.085, 0.44, 2, 0.02),
    royalBlueMat
  );
  tableApron.position.y = 0.68;
  prepTableGroup.add(tableApron);

  const tableTop = new THREE.Mesh(
    new RoundedBoxGeometry(0.68, 0.06, 0.5, 2, 0.03),
    tonedSnowMat
  );
  tableTop.position.y = 0.75;
  tableTop.castShadow = true;
  prepTableGroup.add(tableTop);

  for (const lx of [-0.25, 0.25]) {
    for (const lz of [-0.16, 0.16]) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.022, 0.68, 10),
        royalBlueMat
      );
      leg.position.set(lx, 0.34, lz);
      leg.rotation.z = lx * -0.12;
      leg.rotation.x = lz * 0.08;
      leg.castShadow = true;
      prepTableGroup.add(leg);
    }
  }

  const platterMat = new THREE.MeshStandardMaterial({
    color: 0xc8d2e0,
    roughness: 0.25,
    metalness: 0.78,
  });
  const platter = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.13, 0.025, 16),
    platterMat
  );
  platter.scale.set(1.2, 1.0, 0.85);
  platter.position.set(-0.09, 0.795, 0.02);
  prepTableGroup.add(platter);

  const roastBeast = new THREE.Mesh(
    new THREE.SphereGeometry(0.095, 14, 10),
    new THREE.MeshStandardMaterial({ color: 0x8c3e1e, roughness: 0.55 })
  );
  roastBeast.scale.set(1.25, 0.82, 0.9);
  roastBeast.position.set(-0.09, 0.86, 0.02);
  prepTableGroup.add(roastBeast);

  const mixingBowl = new THREE.Mesh(
    new THREE.SphereGeometry(0.085, 14, 10, 0, Math.PI * 2, Math.PI * 0.35, Math.PI * 0.65),
    pastelPinkMat
  );
  mixingBowl.position.set(0.16, 0.85, -0.03);
  prepTableGroup.add(mixingBowl);

  // Two Crooked Seussian Kitchen Stools tucked cleanly in front/behind the table
  for (const [sx, sz, sCol] of [
    [-0.18, 0.32, 0xe6b828],
    [0.18, -0.28, 0xdca0bc],
  ] as const) {
    const stool = new THREE.Group();
    stool.position.set(sx, 0, sz);
    const seat = new THREE.Mesh(
      new THREE.CylinderGeometry(0.125, 0.115, 0.05, 14),
      new THREE.MeshStandardMaterial({ color: sCol, roughness: 0.48 })
    );
    seat.position.y = 0.44;
    seat.rotation.z = sx * -0.12;
    stool.add(seat);

    for (let sl = 0; sl < 3; sl++) {
      const a = (sl / 3) * Math.PI * 2;
      const sLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.016, 0.013, 0.43, 8),
        royalBlueMat
      );
      sLeg.position.set(Math.cos(a) * 0.07, 0.215, Math.sin(a) * 0.07);
      sLeg.rotation.z = -Math.cos(a) * 0.12;
      stool.add(sLeg);
    }
    prepTableGroup.add(stool);
  }

  // ==========================================================================
  // 3. INTERIOR WHO FAMILY CHRISTMAS TREE (x = -1.75m, z = -1.28m)
  //    + Companion Hearthside Tree at (x = +1.65m, z = -1.42m)
  //    Strictly disjoint from Prep Table (x = -2.75m), Papa Who (x = -1.15m),
  //    Arched Front Door (x = +1.15m), and End-Table (x = +2.35m).
  // ==========================================================================
  const buildPottedWhoChristmasTree = (scaleFactor: number): THREE.Group => {
    const treeGroup = new THREE.Group();
    treeGroup.scale.setScalar(scaleFactor);

    const potBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.16, 0.32, 16),
      crimsonMat
    );
    potBody.position.y = 0.16;
    potBody.castShadow = true;
    treeGroup.add(potBody);

    const potRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.034, 10, 20),
      goldBowMat
    );
    potRim.rotation.x = Math.PI / 2;
    potRim.position.y = 0.32;
    treeGroup.add(potRim);

    const foliageBrightMat = new THREE.MeshStandardMaterial({
      color: 0x388e42,
      roughness: 0.54,
    });
    const trunkBarkMat = new THREE.MeshStandardMaterial({
      color: 0x543622,
      roughness: 0.78,
    });

    // S-curve spine matching the Showpiece Tree
    const getSpineOffset = (y: number): { x: number; z: number; tiltZ: number } => {
      const t = Math.max(0, Math.min(1, (y - 0.32) / 1.88));
      const sx = Math.sin(t * Math.PI * 1.85) * 0.075 * (0.4 + t * 0.8);
      const sz = Math.cos(t * Math.PI * 1.4) * 0.025;
      const tiltZ = -Math.cos(t * Math.PI * 1.85) * 0.12;
      return { x: sx, z: sz, tiltZ };
    };

    const trunkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.28, 0),
      new THREE.Vector3(0.03, 0.78, 0.01),
      new THREE.Vector3(-0.04, 1.38, -0.01),
      new THREE.Vector3(0.03, 2.04, 0.01),
    ]);
    const trunkMesh = new THREE.Mesh(
      new THREE.TubeGeometry(trunkCurve, 16, 0.068, 8, false),
      trunkBarkMat
    );
    treeGroup.add(trunkMesh);

    const branchLobeGeo = new THREE.ConeGeometry(1, 1, 6);
    const tierCount = 6;
    for (let tier = 0; tier < tierCount; tier++) {
      const tierFrac = tier / (tierCount - 1);
      const tierY = 0.52 + tier * 0.28;
      const baseRadius = 0.46 - tier * 0.056;
      const tierHeight = 0.46 - tier * 0.024;
      const spine = getSpineOffset(tierY);

      const tierGroup = new THREE.Group();
      tierGroup.position.set(spine.x, tierY, spine.z);
      tierGroup.rotation.z =
        spine.tiltZ + (tier % 2 === 0 ? 1 : -1) * (0.04 + tierFrac * 0.03);

      // Fluted concave-skirt LatheGeometry matching the Showpiece Tree
      const conePts: THREE.Vector2[] = [];
      for (let s = 0; s <= 10; s++) {
        const u = s / 10;
        const flare = Math.pow(1 - u, 1.18) * baseRadius;
        const py = (u - 0.35) * tierHeight;
        conePts.push(new THREE.Vector2(Math.max(0.015, flare), py));
      }
      const tierCone = new THREE.Mesh(
        new THREE.LatheGeometry(conePts, 14),
        tier % 2 === 0 ? wreathGreenMat : foliageBrightMat
      );
      tierCone.castShadow = true;
      tierCone.receiveShadow = true;
      tierGroup.add(tierCone);

      // Ring of sculpted drooping branch-tip lobes around the lower hem of each tier
      const lobeCount = Math.max(6, 10 - tier);
      const lobeR = 0.082 - tier * 0.007;
      const lobeH = 0.18 - tier * 0.012;
      for (let l = 0; l < lobeCount; l++) {
        const lAngle = (l / lobeCount) * Math.PI * 2 + tier * 0.35;
        const lobeRad = baseRadius * 0.94;
        const branchLobe = new THREE.Mesh(
          branchLobeGeo,
          tier % 2 === 0 ? foliageBrightMat : wreathGreenMat
        );
        branchLobe.scale.set(lobeR, lobeH, lobeR);
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

      treeGroup.add(tierGroup);
    }

    const goldHelixPts: THREE.Vector3[] = [];
    const redHelixPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const y = 0.48 + t * 1.66;
      const spine = getSpineOffset(y);
      const r = (0.45 - t * 0.35) + Math.sin(t * Math.PI * 10) * 0.015;
      const angle = t * Math.PI * 2 * 4.5;
      goldHelixPts.push(
        new THREE.Vector3(
          spine.x + Math.cos(angle) * r,
          y,
          spine.z + Math.sin(angle) * r
        )
      );
      redHelixPts.push(
        new THREE.Vector3(
          spine.x + Math.cos(angle + Math.PI) * (r + 0.016),
          y - 0.02,
          spine.z + Math.sin(angle + Math.PI) * (r + 0.016)
        )
      );
    }
    const spiralGarland = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(goldHelixPts), 56, 0.016, 8, false),
      goldBowMat
    );
    treeGroup.add(spiralGarland);

    const redSpiralGarland = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(redHelixPts), 56, 0.012, 6, false),
      crimsonMat
    );
    treeGroup.add(redSpiralGarland);

    // Multi-colored emissive Who-land fairy lights spiraling up the interior potted tree
    treeGroup.add(
      createWhoLandFairyLightStrand(goldHelixPts, {
        bulbCount: 16,
        bulbRadiusM: 0.026,
        emissiveIntensity: 0.96,
        cordColor: 0x1a3b22,
        includePointLight: true,
        pointLightIntensity: 0.5,
        pointLightDistance: 2.2,
      })
    );

    const ornColors = [0xff2e44, 0xffd228, 0x28a8ff, 0xf258c8];
    const ornMats = ornColors.map(
      (col) =>
        new THREE.MeshStandardMaterial({
          color: col,
          roughness: 0.22,
          metalness: 0.42,
        })
    );
    for (let o = 0; o < 16; o++) {
      const t = (o + 0.5) / 16;
      const y = 0.52 + t * 1.56;
      const spine = getSpineOffset(y);
      const a = o * 2.39996;
      const r = (0.44 - t * 0.34) + 0.02;
      const bRad = 0.036 - t * 0.008;
      const orn = new THREE.Mesh(
        new THREE.SphereGeometry(bRad, 10, 8),
        ornMats[o % ornMats.length] ?? ornMats[0]!
      );
      orn.position.set(
        spine.x + Math.cos(a) * r,
        y,
        spine.z + Math.sin(a) * r
      );
      treeGroup.add(orn);
    }

    // 3D Multi-Point Gold Star Topper with Seussian curled tip
    const topSpine = getSpineOffset(2.18);
    const starGroup = new THREE.Group();
    starGroup.position.set(topSpine.x + 0.04, 2.24, topSpine.z);
    starGroup.rotation.z = -0.18;
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xffd838,
      emissive: 0xffa818,
      emissiveIntensity: 0.75,
      roughness: 0.25,
    });
    const starCore = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 10), starMat);
    starGroup.add(starCore);
    for (let p = 0; p < 5; p++) {
      const pAngle = (p / 5) * Math.PI * 2;
      const ray = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.14, 5), starMat);
      ray.position.set(Math.sin(pAngle) * 0.06, Math.cos(pAngle) * 0.06, 0);
      ray.rotation.z = -pAngle;
      starGroup.add(ray);
    }
    const curlCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.11, 0),
      new THREE.Vector3(0.03, 0.17, 0),
      new THREE.Vector3(0.07, 0.16, 0),
      new THREE.Vector3(0.06, 0.12, 0),
    ]);
    const starCurl = new THREE.Mesh(
      new THREE.TubeGeometry(curlCurve, 10, 0.01, 6, false),
      starMat
    );
    starGroup.add(starCurl);
    treeGroup.add(starGroup);

    const giftColors = [0xd82238, 0x2488e8, 0xe8b824, 0x9838d8];
    for (let g = 0; g < 4; g++) {
      const ga = (g / 4) * Math.PI * 1.4 - 0.2;
      const gift = new THREE.Mesh(
        new RoundedBoxGeometry(0.15, 0.14 + (g % 2) * 0.05, 0.15, 1, 0.02),
        new THREE.MeshStandardMaterial({
          color: giftColors[g % giftColors.length] ?? 0xd82238,
          roughness: 0.45,
        })
      );
      gift.position.set(Math.cos(ga) * 0.26, 0.08, Math.sin(ga) * 0.26 + 0.04);
      gift.rotation.y = g * 0.5;
      treeGroup.add(gift);
    }

    return treeGroup;
  };

  // Primary Interior Who Family Christmas Tree at (x = -1.75m, z = -1.28m)
  const mainWhoTree = buildPottedWhoChristmasTree(0.92);
  mainWhoTree.name = 'WhoFamilyChristmasTree_Main';
  mainWhoTree.position.set(-1.75, 0, -1.28);
  group.add(mainWhoTree);

  // Companion Tree placed cleanly at (x = +1.65m, z = -1.42m) so it never blocks the front door (x = +1.15m)
  const companionWhoTree = buildPottedWhoChristmasTree(0.84);
  companionWhoTree.name = 'WhoFamilyChristmasTree_RightBay';
  companionWhoTree.position.set(1.65, 0, -1.42);
  group.add(companionWhoTree);

  // ==========================================================================
  // 4. DOWNSTAGE LEFT (DSL) CURVY ROYAL-BLUE SEUSSIAN DAYBED (x = +3.25m, z = -1.22m)
  //    & Crooked End-Table at (x = +2.35m, z = -1.38m) — strictly disjoint!
  // ==========================================================================
  const daybedGroup = new THREE.Group();
  daybedGroup.name = 'WhoRoyalBlueDaybed_DSL';
  daybedGroup.position.set(3.25, 0, -1.22);
  daybedGroup.rotation.y = -0.22;
  group.add(daybedGroup);

  const seatDeck = new THREE.Mesh(
    new RoundedBoxGeometry(1.42, 0.28, 0.66, 3, 0.08),
    daybedTuftedMat
  );
  seatDeck.position.set(0, 0.36, 0);
  seatDeck.castShadow = true;
  seatDeck.receiveShadow = true;
  daybedGroup.add(seatDeck);

  const backrestShape = new THREE.Shape();
  backrestShape.moveTo(-0.72, 0.36);
  backrestShape.lineTo(0.72, 0.36);
  backrestShape.quadraticCurveTo(0.78, 0.68, 0.64, 0.82);
  backrestShape.bezierCurveTo(0.24, 0.78, -0.16, 1.06, -0.52, 1.04);
  backrestShape.quadraticCurveTo(-0.78, 1.0, -0.72, 0.36);

  const backrestGeo = new THREE.ExtrudeGeometry(backrestShape, {
    depth: 0.15,
    bevelEnabled: true,
    bevelThickness: 0.028,
    bevelSize: 0.028,
    bevelSegments: 2,
  });
  normalizeExtrudeUVs(backrestGeo, 'fit');
  const backrestMesh = new THREE.Mesh(backrestGeo, daybedTuftedMat);
  backrestMesh.position.set(0, 0, -0.31);
  backrestMesh.castShadow = true;
  daybedGroup.add(backrestMesh);

  const headBolster = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.13, 0.68, 14),
    deepBlueTrimMat
  );
  headBolster.rotation.x = Math.PI / 2;
  headBolster.position.set(-0.66, 0.62, 0);
  daybedGroup.add(headBolster);

  const footBolster = new THREE.Mesh(
    new THREE.CylinderGeometry(0.105, 0.105, 0.66, 14),
    deepBlueTrimMat
  );
  footBolster.rotation.x = Math.PI / 2;
  footBolster.position.set(0.66, 0.51, 0);
  daybedGroup.add(footBolster);

  for (const lx of [-0.62, 0.62]) {
    for (const lz of [-0.24, 0.24]) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.042, 0.026, 0.24, 10),
        brassMat
      );
      leg.position.set(lx, 0.12, lz);
      leg.rotation.z = lx * -0.15;
      daybedGroup.add(leg);
    }
  }

  for (const [px, pCol, prz] of [
    [-0.44, 0xd82238, 0.28],
    [-0.18, 0xe8b824, -0.18],
    [0.42, 0xdca0bc, -0.24],
  ] as const) {
    const pillow = new THREE.Mesh(
      new RoundedBoxGeometry(0.22, 0.2, 0.09, 2, 0.04),
      new THREE.MeshStandardMaterial({ color: pCol, roughness: 0.52 })
    );
    pillow.position.set(px, 0.56, -0.07);
    pillow.rotation.z = prz;
    pillow.rotation.x = -0.25;
    daybedGroup.add(pillow);
  }

  // Crooked Seussian End-Table & Glowing Bell Lamp at (x = +2.35m, z = -1.38m)
  const endTableGroup = new THREE.Group();
  endTableGroup.name = 'WhoEndTable_DSL';
  endTableGroup.position.set(2.35, 0, -1.38);
  group.add(endTableGroup);

  const tableBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.2, 0.048, 14),
    deepBlueTrimMat
  );
  tableBase.position.y = 0.024;
  endTableGroup.add(tableBase);

  const sStemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.05, 0),
    new THREE.Vector3(-0.06, 0.32, 0.025),
    new THREE.Vector3(0.05, 0.58, -0.02),
  ]);
  endTableGroup.add(createCurvedTimberTube(sStemCurve.getPoints(16), 0.024, brassMat, 18, 8));

  const endTableTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.2, 0.042, 16),
    pastelPinkMat
  );
  endTableTop.position.set(0.05, 0.6, -0.02);
  endTableTop.rotation.z = -0.08;
  endTableGroup.add(endTableTop);

  const lampShade = new THREE.Mesh(
    new THREE.ConeGeometry(0.14, 0.19, 14, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0xf4d878,
      emissive: 0xffa824,
      emissiveIntensity: 0.55,
      roughness: 0.38,
      side: THREE.DoubleSide,
    })
  );
  lampShade.position.set(0.07, 0.81, -0.02);
  lampShade.rotation.z = -0.18;
  endTableGroup.add(lampShade);

  // ==========================================================================
  // 5. SCENE-SPECIFIC BLOCKING CHARACTERS
  //    - translucentScrimMode === true (Scene 1E — "He's a Mean One, Mr. Grinch"):
  //      * Grinch in Santa disguise + sack at (0.55, 0, -1.12), rotY = -0.32
  //      * Max the Dog with single antler at (-0.55, 0, -1.08) looking up at the Grinch
  //      * Cindy-Lou Who at (2.05, 0, -1.08) near the DSL daybed
  //    - translucentScrimMode === false (Scene 1H — "I Hate Christmas"):
  //      * Papa Who at (-1.15, 0, -1.05)
  //      * Mama Who at (0.65, 0, -1.05)
  //      * Cindy-Lou Who holding gift at (-0.22, 0, -0.92)
  // ==========================================================================
  if (translucentScrimMode) {
    const grinchFigure = createGrinchCharacter({
      heightM: 1.84,
      santaDisguise: true,
      holdingSack: true,
    });
    grinchFigure.name = 'Figure_Grinch_SantaDisguise_1E';
    grinchFigure.position.set(0.46, 0, -0.84);
    grinchFigure.rotation.y = -0.28;
    group.add(grinchFigure);

    const maxDog = createMaxDogCharacter({
      withAntler: true,
      sitting: false,
    });
    maxDog.name = 'Figure_MaxDog_1E';
    maxDog.position.set(-0.55, 0, -0.92);
    maxDog.rotation.y = 1.38;
    group.add(maxDog);

    const cindyLou1E = createWhoCharacter({
      heightM: 1.12,
      coatColorHex: 0xf49ac2,
      trimColorHex: 0xfff0f5,
      hairColorHex: 0xf6d048,
      hasBraids: true,
    });
    cindyLou1E.name = 'Figure_CindyLouWho_1E';
    cindyLou1E.position.set(1.28, 0, -0.88);
    cindyLou1E.rotation.y = -0.42;
    group.add(cindyLou1E);
  } else {
    const papaWho = createWhoCharacter({
      heightM: 1.74,
      coatColorHex: 0x3b68c8,
      trimColorHex: 0xe8ecf4,
      hairColorHex: 0x8c5828,
    });
    papaWho.name = 'Figure_PapaWho_1H';
    papaWho.position.set(-0.82, 0, -0.92);
    papaWho.rotation.y = 0.24;
    group.add(papaWho);

    const mamaWho = createWhoCharacter({
      heightM: 1.66,
      coatColorHex: 0xd8386c,
      trimColorHex: 0xf4e8ec,
      hairColorHex: 0xd89832,
      hasBraids: true,
    });
    mamaWho.name = 'Figure_MamaWho_1H';
    mamaWho.position.set(0.68, 0, -0.95);
    mamaWho.rotation.y = -0.22;
    group.add(mamaWho);

    const cindyLou1H = createWhoCharacter({
      heightM: 1.12,
      coatColorHex: 0xf49ac2,
      trimColorHex: 0xfff0f5,
      hairColorHex: 0xf6d048,
      hasBraids: true,
      holdingGift: true,
    });
    cindyLou1H.name = 'Figure_CindyLouWho_1H';
    cindyLou1H.position.set(-0.08, 0, -0.82);
    cindyLou1H.rotation.y = 0.08;
    group.add(cindyLou1H);
  }

  return group;
}
