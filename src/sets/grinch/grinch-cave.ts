import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {
  createPapierMacheNormalTexture,
  createSeussianRockNormalTexture,
  normalizeExtrudeUVs,
} from '../../engine/procedural-textures.ts';
import {
  createGrinchCharacter,
  createMaxDogCharacter,
  createSculptedIcicleDrip,
  createSeussianIcicleValance,
} from '../shared-scenic-helpers.ts';

/**
 * Creates a custom 1024×1024 seamlessly periodic Seussian pen-and-ink striated
 * ice/rock canvas texture for the Grinch's Cave portal wings and boulders,
 * matching `model_1C_cave_vista.jpg` & `model_1C_cave_closeup.jpg`.
 */
function createCaveStriatedRockTexture(): THREE.CanvasTexture {
  const W = 1024;
  const H = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. Seamlessly periodic glacial slate-blue wash (stop 0 === stop 1)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0.0, '#78a4ce');
    bgGrad.addColorStop(0.25, '#9ec0dc');
    bgGrad.addColorStop(0.55, '#6e9ac8');
    bgGrad.addColorStop(0.8, '#5882b8');
    bgGrad.addColorStop(1.0, '#78a4ce');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Toroidally wrapped lavender-ice, icy-turquoise, and Prussian-blue painterly wash patches
    for (let i = 0; i < 56; i++) {
      const px = (i * 173 + 29) % W;
      const py = (i * 251 + 43) % H;
      const rx = 85 + (i % 6) * 34;
      const ry = 42 + (i % 4) * 26;
      const angle = ((i % 7) - 3) * 0.22;

      for (const ox of [-W, 0, W]) {
        for (const oy of [-H, 0, H]) {
          const cx = px + ox;
          const cy = py + oy;
          if (cx + rx < 0 || cx - rx > W || cy + ry < 0 || cy - ry > H) continue;
          const wash = ctx.createRadialGradient(cx, cy, 8, cx, cy, rx);
          if (i % 4 === 0) {
            wash.addColorStop(0, 'rgba(196, 212, 216, 0.32)');
          } else if (i % 4 === 1) {
            wash.addColorStop(0, 'rgba(42, 84, 148, 0.28)');
          } else if (i % 4 === 2) {
            wash.addColorStop(0, 'rgba(182, 168, 212, 0.24)');
          } else {
            wash.addColorStop(0, 'rgba(112, 184, 214, 0.24)');
          }
          wash.addColorStop(1, 'rgba(110, 152, 202, 0)');
          ctx.fillStyle = wash;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, angle, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 3. Horizontally periodic Seussian charcoal-black ink contour strata (integer harmonics of W)
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let row = 0; row < 20; row++) {
      const baseY = 26 + row * 50;
      const waveAt = (x: number): number => {
        const u = (x / W) * Math.PI * 2;
        return (
          Math.sin(u * 2 + row * 0.85) * 14 +
          Math.cos(u * 5 - row * 1.1) * 7
        );
      };

      // Upper frost highlight lip above each rock seam (toned <= 0xd8)
      ctx.strokeStyle = 'rgba(202, 214, 216, 0.44)';
      ctx.lineWidth = row % 3 === 0 ? 3.4 : 2.2;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 16) {
        const wy = baseY - 3 + waveAt(x);
        if (x === 0) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.stroke();

      // Deep cobalt shadow band immediately below the ink fissure
      ctx.strokeStyle = 'rgba(32, 58, 108, 0.36)';
      ctx.lineWidth = 7.0;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 16) {
        const wy = baseY + 4 + waveAt(x);
        if (x === 0) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.stroke();

      // Charcoal-black Seussian contour line
      ctx.strokeStyle = 'rgba(14, 20, 36, 0.82)';
      ctx.lineWidth = row % 3 === 0 ? 4.4 : 2.8;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 16) {
        const wy = baseY + waveAt(x);
        if (x === 0) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.stroke();

      // Short perpendicular Seussian comb/fringe shadow tick-hatches along strata ledges
      ctx.lineWidth = 2.0;
      const stepX = row % 2 === 0 ? 16 : 24;
      for (let x = 18; x < W - 18; x += stepX + ((row + x) % 10)) {
        const wy = baseY + waveAt(x);
        const tickLen = 11 + ((x * 3 + row * 7) % 18);
        const tilt = ((x % 5) - 2) * 0.15;
        ctx.beginPath();
        ctx.moveTo(x, wy);
        ctx.lineTo(x + Math.sin(tilt) * tickLen, wy + tickLen);
        ctx.stroke();
      }
    }

    // 4. Curved Dr. Seuss cross-hatch clusters in rock hollows (kept inside tile bounds)
    ctx.strokeStyle = 'rgba(16, 24, 42, 0.56)';
    ctx.lineWidth = 1.8;
    for (let c = 0; c < 42; c++) {
      const cx = ((c * 229) % 880) + 52;
      const cy = ((c * 167) % 880) + 52;
      const count = 5 + (c % 4);
      for (let h = 0; h < count; h++) {
        ctx.beginPath();
        ctx.moveTo(cx + h * 7, cy);
        ctx.quadraticCurveTo(cx + h * 7 + 10, cy + 16, cx + h * 7 + 20, cy + 32);
        ctx.stroke();
      }
      for (let h = 0; h < count - 1; h++) {
        ctx.beginPath();
        ctx.moveTo(cx - 4, cy + h * 7 + 5);
        ctx.quadraticCurveTo(cx + 14, cy + h * 7 + 12, cx + 34, cy + h * 7 + 18);
        ctx.stroke();
      }
    }

    // 5. Zig-zag Seussian crag lightning-hatch scribbles & scenic spatter
    ctx.lineWidth = 2.8;
    for (let z = 0; z < 28; z++) {
      const sx = ((z * 137) % 880) + 60;
      const sy = ((z * 193) % 880) + 60;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + 26, sy - 14);
      ctx.lineTo(sx + 12, sy + 8);
      ctx.lineTo(sx + 42, sy - 6);
      ctx.lineTo(sx + 24, sy + 18);
      ctx.stroke();
    }

    for (let sp = 0; sp < 480; sp++) {
      const px = (sp * 283 + 19) % W;
      const py = (sp * 199 + 47) % H;
      const pr = 1.0 + (sp % 3) * 0.85;
      ctx.fillStyle =
        sp % 3 === 0
          ? 'rgba(202, 212, 216, 0.28)'
          : sp % 3 === 1
            ? 'rgba(22, 34, 58, 0.30)'
            : 'rgba(92, 144, 198, 0.25)';
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
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
 * Hand-painted miniature Whoville cottage pink stucco texture (256×256) with
 * wavy clapboards, vertical rib shading, and Seussian ink cross-hatching
 * for the forced-perspective village in `model_1C_cave_closeup.jpg`.
 */
function createMiniCottageWallTexture(baseHex: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const col = new THREE.Color(baseHex);
    const r = Math.round(col.r * 255);
    const g = Math.round(col.g * 255);
    const b = Math.round(col.b * 255);
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, 256, 256);

    // Warm belly highlight
    const belly = ctx.createRadialGradient(128, 128, 12, 128, 128, 120);
    belly.addColorStop(0, 'rgba(255, 196, 224, 0.35)');
    belly.addColorStop(1, 'rgba(120, 24, 68, 0.22)');
    ctx.fillStyle = belly;
    ctx.fillRect(0, 0, 256, 256);

    // Wavy horizontal clapboards & dark Seussian ink lines (periodic in X)
    ctx.strokeStyle = 'rgba(36, 12, 28, 0.55)';
    ctx.lineWidth = 2.0;
    for (let y = 32; y < 256; y += 36) {
      ctx.beginPath();
      for (let x = 0; x <= 256; x += 16) {
        const wy = y + Math.sin((x / 256) * Math.PI * 4 + y) * 4;
        if (x === 0) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.stroke();
    }

    // Eaves shadow & perpendicular feather ticks at top
    ctx.fillStyle = 'rgba(32, 10, 26, 0.35)';
    ctx.fillRect(0, 0, 256, 28);
    for (let x = 8; x < 256; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, 4);
      ctx.lineTo(x - 3, 24);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Helper to extrude a 2D polygon path into a beveled 3D scenic flat or rock slab
 * with normalized scenic UVs so textures never tile on a 1-meter grid.
 */
function createExtrudedRockSlab(
  points: ReadonlyArray<readonly [number, number]>,
  depth: number,
  material: THREE.Material,
  zPos: number,
  bevelSize = 0.015
): THREE.Mesh {
  const shape = new THREE.Shape();
  points.forEach(([x, y], idx) => {
    if (idx === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  });
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevelSize,
    bevelSize,
    bevelSegments: 2,
    curveSegments: 12,
  });
  normalizeExtrudeUVs(geo, 'world', 3.8);
  geo.computeVertexNormals();

  const mesh = new THREE.Mesh(geo, material);
  mesh.position.z = zPos;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * Builds a 3D Seussian ink-fissure ridge or overhanging snow shelf following a
 * polyline on a rock face at an explicit non-coplanar Z coordinate.
 */
function createSeussianStrataLedge(
  pts: ReadonlyArray<readonly [number, number]>,
  thickness: number,
  depth: number,
  zPos: number,
  mat: THREE.Material
): THREE.Group {
  const g = new THREE.Group();
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    if (!p0 || !p1) continue;
    const dx = p1[0] - p0[0];
    const dy = p1[1] - p0[1];
    const len = Math.hypot(dx, dy);
    if (len < 0.02) continue;

    const seg = new THREE.Mesh(
      new RoundedBoxGeometry(
        len + thickness * 0.4,
        thickness,
        depth,
        2,
        thickness * 0.3
      ),
      mat
    );
    seg.position.set((p0[0] + p1[0]) * 0.5, (p0[1] + p1[1]) * 0.5, zPos);
    seg.rotation.z = Math.atan2(dy, dx);
    seg.castShadow = true;
    g.add(seg);
  }
  return g;
}

/**
 * Builds a single forced-perspective miniature Whoville cottage with a plump
 * pink/lavender Seussian belly wall, scalloped snow-cap onion dome roof,
 * crooked chimney finial, and warm glowing amber windows (`model_1C_cave_closeup.jpg`).
 */
function createMiniatureWhoCottage(
  width: number,
  height: number,
  wallColorHex: number,
  roofColorHex: number,
  tiltZ: number,
  rockTex: THREE.CanvasTexture
): THREE.Group {
  const cottage = new THREE.Group();
  cottage.rotation.z = tiltZ;

  const wallMat = new THREE.MeshStandardMaterial({
    map: createMiniCottageWallTexture(wallColorHex),
    roughness: 0.56,
    metalness: 0.04,
  });

  const snowRoofMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    color: roofColorHex,
    roughness: 0.6,
    metalness: 0.04,
  });

  const warmWindowMat = new THREE.MeshStandardMaterial({
    color: 0xffd468,
    emissive: 0xff9e1b,
    emissiveIntensity: 1.15,
    roughness: 0.28,
  });

  const trimDarkMat = new THREE.MeshStandardMaterial({
    color: 0x262038,
    roughness: 0.65,
  });

  // Plump barrel-like Seussian cottage body
  const bodyH = height * 0.58;
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(width * 0.52, width * 0.44, bodyH, 16),
    wallMat
  );
  body.scale.set(1.0, 1.0, 0.58);
  body.position.y = bodyH * 0.5;
  body.castShadow = true;
  cottage.add(body);

  // Scalloped snow-eave collar around top of pink wall
  const eaveCount = 7;
  for (let e = 0; e < eaveCount; e++) {
    const t = e / (eaveCount - 1) - 0.5;
    const lobe = new THREE.Mesh(
      new THREE.SphereGeometry(width * 0.14, 10, 8),
      snowRoofMat
    );
    lobe.scale.set(1.1, 0.85, 0.65);
    lobe.position.set(
      t * width * 0.92,
      bodyH * 0.95 + Math.cos(t * Math.PI) * 0.03,
      width * 0.22
    );
    cottage.add(lobe);
  }

  // Onion-dome snowy roof cap (seen clearly in `model_1C_cave_closeup.jpg`)
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(
      width * 0.54,
      16,
      12,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.62
    ),
    snowRoofMat
  );
  dome.scale.set(1.02, 0.88, 0.6);
  dome.position.set(0, bodyH * 0.88, 0);
  cottage.add(dome);

  // Sculpted Seussian roof spire finial & collar ring
  const spire = new THREE.Mesh(
    new THREE.CylinderGeometry(width * 0.025, width * 0.095, height * 0.24, 10),
    snowRoofMat
  );
  spire.position.set(width * 0.04, bodyH + height * 0.35, 0.02);
  spire.rotation.z = -0.14;
  cottage.add(spire);

  const finialCollar = new THREE.Mesh(
    new THREE.TorusGeometry(width * 0.075, width * 0.02, 8, 12),
    trimDarkMat
  );
  finialCollar.position.set(width * 0.05, bodyH + height * 0.32, 0.02);
  finialCollar.rotation.x = Math.PI * 0.45;
  cottage.add(finialCollar);

  const finialBall = new THREE.Mesh(
    new THREE.SphereGeometry(width * 0.075, 10, 8),
    snowRoofMat
  );
  finialBall.position.set(width * 0.06, bodyH + height * 0.48, 0.02);
  cottage.add(finialBall);

  // Glowing warm amber circular/oval Who windows (staggered well in front of wall)
  for (const [wx, wy, wr] of [
    [-width * 0.2, bodyH * 0.52, width * 0.095],
    [width * 0.18, bodyH * 0.56, width * 0.09],
  ] as const) {
    const winFrame = new THREE.Mesh(
      new THREE.CylinderGeometry(wr * 1.25, wr * 1.25, 0.025, 12),
      trimDarkMat
    );
    winFrame.rotation.x = Math.PI / 2;
    winFrame.position.set(wx, wy, width * 0.31);
    cottage.add(winFrame);

    const winPane = new THREE.Mesh(
      new THREE.CylinderGeometry(wr, wr, 0.025, 12),
      warmWindowMat
    );
    winPane.rotation.x = Math.PI / 2;
    winPane.position.set(wx, wy, width * 0.34);
    cottage.add(winPane);
  }

  // Little arched glowing center Who doorway
  const doorArch = new THREE.Mesh(
    new RoundedBoxGeometry(width * 0.16, bodyH * 0.36, 0.03, 2, 0.02),
    warmWindowMat
  );
  doorArch.position.set(0, bodyH * 0.22, width * 0.33);
  cottage.add(doorArch);

  return cottage;
}

/**
 * Builds the forced-perspective distant Whoville Vista (`z ∈ [-5.88m, -5.05m]`)
 * seen through the Grinch's Cave mouth in `model_1C_cave_vista.jpg` and
 * `model_1C_cave_closeup.jpg`.
 */
function buildDistantWhovilleVista(rockTex: THREE.CanvasTexture): THREE.Group {
  const vistaGroup = new THREE.Group();
  vistaGroup.name = 'GrinchCave_DistantWhovilleVista';

  const papierMacheNormalTex = createPapierMacheNormalTexture();
  const seussianRockNormalTex = createSeussianRockNormalTexture();

  const snowHillFrontMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    normalMap: papierMacheNormalTex,
    normalScale: new THREE.Vector2(0.65, 0.65),
    color: 0xbec6dc,
    roughness: 0.62,
    metalness: 0.03,
  });

  const snowHillMidMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    normalMap: papierMacheNormalTex,
    normalScale: new THREE.Vector2(0.62, 0.62),
    color: 0xb2bed8,
    roughness: 0.6,
    metalness: 0.03,
  });

  const snowMountainFarMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    normalMap: papierMacheNormalTex,
    normalScale: new THREE.Vector2(0.58, 0.58),
    color: 0xc4cce0,
    roughness: 0.58,
    metalness: 0.03,
  });

  const cragBlueMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    normalMap: seussianRockNormalTex,
    normalScale: new THREE.Vector2(0.78, 0.78),
    color: 0x6c9ad4,
    roughness: 0.56,
    metalness: 0.06,
  });

  const inkContourMat = new THREE.MeshStandardMaterial({
    color: 0x1c2236,
    roughness: 0.72,
  });

  // 1. Illuminated Winter Vista Sky Backing Plate (`z = -5.88m`)
  const skyBacking = new THREE.Mesh(
    new THREE.PlaneGeometry(5.6, 3.8),
    new THREE.MeshStandardMaterial({
      color: 0xc8d2e6,
      emissive: 0x7688b8,
      emissiveIntensity: 0.38,
      roughness: 0.75,
    })
  );
  skyBacking.position.set(0, 1.85, -5.88);
  vistaGroup.add(skyBacking);

  // 2. Far Sweeping Snow Mountain Slopes (`z = -5.76m` and `z = -5.66m`)
  const farLeftPeakPts: ReadonlyArray<readonly [number, number]> = [
    [-2.65, 0.0],
    [-2.65, 1.85],
    [-1.45, 2.95],
    [-0.95, 2.55],
    [-0.25, 1.25],
    [0.35, 0.65],
    [0.35, 0.0],
  ];
  const farLeftMountain = createExtrudedRockSlab(
    farLeftPeakPts,
    0.05,
    snowMountainFarMat,
    -5.76,
    0.012
  );
  vistaGroup.add(farLeftMountain);

  const farRightHillPts: ReadonlyArray<readonly [number, number]> = [
    [-0.15, 0.0],
    [-0.15, 0.95],
    [0.45, 1.65],
    [1.15, 2.08],
    [1.78, 2.15],
    [2.55, 1.52],
    [2.55, 0.0],
  ];
  const farRightMountain = createExtrudedRockSlab(
    farRightHillPts,
    0.05,
    snowHillMidMat,
    -5.66,
    0.012
  );
  vistaGroup.add(farRightMountain);

  vistaGroup.add(
    createSeussianStrataLedge(
      [
        [0.05, 1.12],
        [0.55, 1.72],
        [1.18, 2.1],
        [1.78, 2.16],
        [2.35, 1.68],
      ],
      0.032,
      0.025,
      -5.58,
      inkContourMat
    )
  );

  // 3. Signature Blue 3-Fingered Seussian Rock Crag Spire (`z = -5.54m`)
  const blueCragPts: ReadonlyArray<readonly [number, number]> = [
    [-0.48, 0.65],
    [-0.42, 1.45],
    [-0.28, 2.02],
    [-0.14, 2.12],
    [-0.04, 1.98],
    [-0.01, 1.68],
    [0.06, 1.72],
    [0.14, 2.38],
    [0.28, 2.65],
    [0.42, 2.62],
    [0.48, 2.25],
    [0.58, 2.52],
    [0.72, 2.78],
    [0.84, 2.68],
    [0.65, 1.85],
    [0.42, 0.95],
    [0.35, 0.65],
  ];
  const blueCragSpire = createExtrudedRockSlab(
    blueCragPts,
    0.045,
    cragBlueMat,
    -5.54,
    0.012
  );
  vistaGroup.add(blueCragSpire);

  for (const [hx, hy0, hy1] of [
    [-0.22, 1.15, 1.95],
    [-0.12, 1.05, 1.88],
    [0.16, 1.12, 2.32],
    [0.28, 1.08, 2.48],
    [0.38, 1.18, 2.18],
  ] as const) {
    vistaGroup.add(
      createSeussianStrataLedge(
        [
          [hx, hy0],
          [hx + 0.06, hy1],
        ],
        0.024,
        0.02,
        -5.47,
        inkContourMat
      )
    );
  }

  // 4. Mid-Left Snow Shoulder Hill (`z = -5.44m`)
  const midLeftSlopePts: ReadonlyArray<readonly [number, number]> = [
    [-2.55, 0.0],
    [-2.55, 1.68],
    [-1.85, 1.82],
    [-1.18, 1.56],
    [-0.52, 1.02],
    [-0.52, 0.0],
  ];
  vistaGroup.add(
    createExtrudedRockSlab(midLeftSlopePts, 0.035, snowHillMidMat, -5.44, 0.01)
  );
  vistaGroup.add(
    createSeussianStrataLedge(
      [
        [-2.35, 1.72],
        [-1.82, 1.83],
        [-1.18, 1.57],
        [-0.58, 1.06],
      ],
      0.03,
      0.02,
      -5.39,
      inkContourMat
    )
  );

  // 5. Central Whoville Village Snow Hill (`x ≈ -0.15m`, `z = -5.36m`)
  const centralVillageHillPts: ReadonlyArray<readonly [number, number]> = [
    [-1.18, 0.0],
    [-1.08, 0.42],
    [-0.78, 0.72],
    [-0.42, 0.91],
    [-0.12, 0.96],
    [0.22, 0.91],
    [0.58, 0.72],
    [0.88, 0.42],
    [0.98, 0.0],
  ];
  const centralHill = createExtrudedRockSlab(
    centralVillageHillPts,
    0.06,
    snowHillFrontMat,
    -5.36,
    0.015
  );
  vistaGroup.add(centralHill);

  vistaGroup.add(
    createSeussianStrataLedge(
      [
        [-0.95, 0.52],
        [-0.65, 0.78],
        [-0.32, 0.93],
        [-0.08, 0.97],
        [0.24, 0.92],
        [0.56, 0.75],
        [0.82, 0.48],
      ],
      0.028,
      0.02,
      -5.26,
      inkContourMat
    )
  );

  // Winding Snowy Trail curling from Whoville up toward Mt. Crumpit (`z = -5.23m`)
  const trailMat = new THREE.MeshStandardMaterial({
    color: 0xd0d6e4,
    roughness: 0.58,
  });
  const trailPts: ReadonlyArray<readonly [number, number]> = [
    [-0.14, 0.92],
    [-0.04, 0.72],
    [0.14, 0.54],
    [-0.08, 0.36],
    [-0.28, 0.18],
    [-0.12, 0.04],
  ];
  vistaGroup.add(
    createSeussianStrataLedge(trailPts, 0.065, 0.02, -5.23, trailMat)
  );

  // 7 Miniature Pink & Rose-Lavender Onion-Domed Who Cottages arranged along the curved hilltop
  const miniCottageSpecs: ReadonlyArray<{
    readonly x: number;
    readonly y: number;
    readonly z: number;
    readonly w: number;
    readonly h: number;
    readonly wallHex: number;
    readonly roofHex: number;
    readonly tiltZ: number;
  }> = [
    { x: -0.82, y: 0.64, z: -5.33, w: 0.28, h: 0.42, wallHex: 0xd06298, roofHex: 0xbcc6dc, tiltZ: 0.38 },
    { x: -0.62, y: 0.82, z: -5.40, w: 0.26, h: 0.40, wallHex: 0xc2588e, roofHex: 0xb4c0d8, tiltZ: 0.26 },
    { x: -0.44, y: 0.82, z: -5.31, w: 0.32, h: 0.46, wallHex: 0xd86aa2, roofHex: 0xc2cce0, tiltZ: 0.16 },
    { x: -0.24, y: 0.90, z: -5.41, w: 0.25, h: 0.38, wallHex: 0xc85e94, roofHex: 0xb8c4dc, tiltZ: 0.06 },
    { x: 0.18, y: 0.84, z: -5.31, w: 0.32, h: 0.45, wallHex: 0xd6689e, roofHex: 0xc0cae0, tiltZ: -0.14 },
    { x: 0.40, y: 0.80, z: -5.40, w: 0.26, h: 0.39, wallHex: 0xc0568c, roofHex: 0xb4c0d8, tiltZ: -0.24 },
    { x: 0.58, y: 0.64, z: -5.33, w: 0.30, h: 0.44, wallHex: 0xd2649a, roofHex: 0xbcc6dc, tiltZ: -0.36 },
  ];

  for (const cSpec of miniCottageSpecs) {
    const cottage = createMiniatureWhoCottage(
      cSpec.w,
      cSpec.h,
      cSpec.wallHex,
      cSpec.roofHex,
      cSpec.tiltZ,
      rockTex
    );
    cottage.position.set(cSpec.x, cSpec.y, cSpec.z);
    vistaGroup.add(cottage);
  }

  // Glowing Miniature Town Square Christmas Tree (`x = -0.13m, y = 0.90m, z = -5.29m`)
  // Built from sculpted Seussian bell-tiered pine whorls (`LatheGeometry`)
  const miniTreeGroup = new THREE.Group();
  miniTreeGroup.position.set(-0.13, 0.90, -5.29);

  const foliageMat = new THREE.MeshStandardMaterial({
    color: 0x1e7e38,
    emissive: 0x0b3616,
    emissiveIntensity: 0.35,
    roughness: 0.55,
  });

  for (let tier = 0; tier < 5; tier++) {
    const baseR = 0.21 - tier * 0.032;
    const tierH = 0.25 - tier * 0.018;
    const profilePts = [
      new THREE.Vector2(0.005, tierH),
      new THREE.Vector2(baseR * 0.42, tierH * 0.58),
      new THREE.Vector2(baseR * 0.86, tierH * 0.22),
      new THREE.Vector2(baseR, 0.04),
      new THREE.Vector2(baseR * 0.72, 0.0),
    ];
    const whorl = new THREE.Mesh(
      new THREE.LatheGeometry(profilePts, 14),
      foliageMat
    );
    whorl.position.y = 0.02 + tier * 0.15;
    whorl.rotation.z = (tier % 2 === 0 ? 1 : -1) * 0.08;
    whorl.scale.set(1.0, 1.0, 0.65);
    miniTreeGroup.add(whorl);
  }

  // Glowing Gold Star Topper on Miniature Tree
  const starMat = new THREE.MeshStandardMaterial({
    color: 0xffe048,
    emissive: 0xffb81c,
    emissiveIntensity: 1.4,
    roughness: 0.22,
  });
  const miniStar = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.065, 0),
    starMat
  );
  miniStar.position.y = 0.92;
  miniTreeGroup.add(miniStar);

  // Tiny glowing Christmas baubles on the miniature tree
  const baubleColors = [0xff3248, 0xffd428, 0x38d0ff, 0xff66c4];
  for (let b = 0; b < 10; b++) {
    const t = b / 10;
    const angle = b * 1.15 - 1.2;
    const r = (0.16 - t * 0.1) * 0.85;
    const bauble = new THREE.Mesh(
      new THREE.SphereGeometry(0.022, 8, 8),
      new THREE.MeshStandardMaterial({
        color: baubleColors[b % baubleColors.length] ?? 0xff3248,
        emissive: baubleColors[b % baubleColors.length] ?? 0xff3248,
        emissiveIntensity: 0.95,
        roughness: 0.25,
      })
    );
    bauble.position.set(
      Math.sin(angle) * r,
      0.14 + t * 0.62,
      Math.cos(angle) * r * 0.65 + 0.03
    );
    miniTreeGroup.add(bauble);
  }
  vistaGroup.add(miniTreeGroup);

  // Festive Miniature Gooseneck Streetlamps lining the Whoville hilltop & trail (`z = -5.27m`)
  const lampPostMat = new THREE.MeshStandardMaterial({
    color: 0x242838,
    roughness: 0.55,
    metalness: 0.4,
  });
  const lanternGlowMat = new THREE.MeshStandardMaterial({
    color: 0xffe680,
    emissive: 0xffad24,
    emissiveIntensity: 1.35,
    roughness: 0.2,
  });
  for (const [lx, ly, tilt] of [
    [-0.68, 0.76, 0.28],
    [-0.31, 0.92, 0.12],
    [0.04, 0.93, -0.08],
    [0.38, 0.86, -0.2],
    [-0.02, 0.52, 0.15],
  ] as const) {
    const lamp = new THREE.Group();
    lamp.position.set(lx, ly, -5.27);
    lamp.rotation.z = tilt;

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.009, 0.012, 0.22, 6),
      lampPostMat
    );
    pole.position.y = 0.11;
    lamp.add(pole);

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.026, 8, 8),
      lanternGlowMat
    );
    bulb.position.set(0.02, 0.22, 0.02);
    lamp.add(bulb);
    vistaGroup.add(lamp);
  }

  // 6. Foreground Left & Right Flanking Snow Hills inside the Vista (`z = -5.18m`)
  const fgLeftHillPts: ReadonlyArray<readonly [number, number]> = [
    [-2.55, 0.0],
    [-2.55, 1.18],
    [-1.85, 1.32],
    [-1.32, 1.15],
    [-0.95, 0.72],
    [-0.68, 0.0],
  ];
  vistaGroup.add(
    createExtrudedRockSlab(fgLeftHillPts, 0.045, snowHillFrontMat, -5.18, 0.012)
  );
  vistaGroup.add(
    createSeussianStrataLedge(
      [
        [-2.35, 1.24],
        [-1.82, 1.33],
        [-1.32, 1.16],
        [-0.95, 0.72],
        [-0.70, 0.08],
      ],
      0.028,
      0.02,
      -5.11,
      inkContourMat
    )
  );

  const fgRightHillPts: ReadonlyArray<readonly [number, number]> = [
    [0.52, 0.0],
    [0.78, 0.68],
    [1.18, 1.12],
    [1.68, 1.24],
    [2.45, 1.05],
    [2.45, 0.0],
  ];
  vistaGroup.add(
    createExtrudedRockSlab(
      fgRightHillPts,
      0.045,
      snowHillFrontMat,
      -5.18,
      0.012
    )
  );
  vistaGroup.add(
    createSeussianStrataLedge(
      [
        [0.54, 0.08],
        [0.78, 0.68],
        [1.18, 1.13],
        [1.68, 1.25],
        [2.32, 1.08],
      ],
      0.028,
      0.02,
      -5.11,
      inkContourMat
    )
  );

  // Signature Blue 3-Fingered Seussian Rock Claw Outcrop on the Right Foreground Hill (`z = -5.08m`)
  // Span: `z ∈ [-5.09m, -5.05m]` -> strictly within `z ∈ [-5.88m, -5.05m]`!
  const rightBlueClawPts: ReadonlyArray<readonly [number, number]> = [
    [1.18, 0.06],
    [1.02, 0.42],
    [1.04, 0.68],
    [1.16, 0.72],
    [1.26, 0.48],
    [1.34, 0.76],
    [1.46, 0.78],
    [1.52, 0.48],
    [1.64, 0.72],
    [1.76, 0.68],
    [1.82, 0.35],
    [1.75, 0.06],
  ];
  vistaGroup.add(
    createExtrudedRockSlab(rightBlueClawPts, 0.025, cragBlueMat, -5.08, 0.008)
  );

  return vistaGroup;
}

/**
 * Builds the Grinch's crooked Seussian spyglass/listening horn aimed down at
 * Whoville, the expressive 3D Grinch character peering through it (`x = -2.15m,
 * y = 0, z = -3.05m`), twisted scrap-metal cave pipes, and Max the dog sitting
 * cleanly atop his flat rocky perch (`x = +2.85m, z = -3.08m`).
 */
function buildGrinchCaveSideDetails(
  slateMat: THREE.Material,
  snowMat: THREE.Material
): THREE.Group {
  const detailsGroup = new THREE.Group();
  detailsGroup.name = 'GrinchCave_PropsAndCharacters';

  const ironMat = new THREE.MeshStandardMaterial({
    color: 0x364254,
    roughness: 0.48,
    metalness: 0.68,
  });

  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xc89e46,
    roughness: 0.36,
    metalness: 0.76,
  });

  const copperPipeMat = new THREE.MeshStandardMaterial({
    color: 0x8e5c42,
    roughness: 0.46,
    metalness: 0.62,
  });

  // -------------------------------------------------------------------------
  // A1. Expressive 3D Grinch Character (`x = -2.15m, y = 0, z = -3.05m`)
  //     Standing firmly on the stage deck (`y = 0`) right behind his crooked
  //     Whoville spyglass/listening horn, rotated toward center-right (`0.58 rad`)
  //     so he peers down at Whoville without clipping into the tripod or boulder.
  // -------------------------------------------------------------------------
  const grinch = createGrinchCharacter({
    heightM: 1.84,
    spyglassPose: true,
  });
  grinch.position.set(-2.05, 0.0, -3.08);
  grinch.rotation.y = 0.56;
  detailsGroup.add(grinch);

  // -------------------------------------------------------------------------
  // A2. Crooked Seussian Telescope / Whoville Listening Horn (`x = -1.35m, z = -2.62m`)
  //     Positioned directly in front of the Grinch along his sightline with full clearance
  // -------------------------------------------------------------------------
  const hornRig = new THREE.Group();
  hornRig.position.set(-1.35, 0.0, -2.62);
  hornRig.rotation.y = 0.54;

  // Tripod legs
  for (let leg = 0; leg < 3; leg++) {
    const a = (leg / 3) * Math.PI * 2 + 0.3;
    const strut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.03, 0.98, 8),
      ironMat
    );
    strut.position.set(Math.cos(a) * 0.16, 0.46, Math.sin(a) * 0.16);
    strut.rotation.z = -Math.cos(a) * 0.24;
    strut.rotation.x = Math.sin(a) * 0.24;
    hornRig.add(strut);
  }

  // Gear mount hub
  const gearWheel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.13, 0.048, 14),
    brassMat
  );
  gearWheel.rotation.x = Math.PI / 2;
  gearWheel.position.set(0, 0.94, 0);
  hornRig.add(gearWheel);

  // Segmented crooked Seussian spyglass / ear-trumpet tube
  const barrelGroup = new THREE.Group();
  barrelGroup.position.set(0, 0.98, 0);
  barrelGroup.rotation.z = -0.18;
  barrelGroup.rotation.y = -0.12;

  for (let segIdx = 0; segIdx < 4; segIdx++) {
    const r0 = 0.042 + segIdx * 0.024;
    const r1 = 0.062 + segIdx * 0.03;
    const tube = new THREE.Mesh(
      new THREE.CylinderGeometry(r1, r0, 0.24, 12),
      segIdx % 2 === 0 ? brassMat : ironMat
    );
    tube.rotation.x = Math.PI / 2;
    tube.position.set(
      0,
      Math.sin(segIdx * 0.6) * 0.035,
      segIdx * 0.21 - 0.14
    );
    tube.rotation.z = (segIdx % 2 === 0 ? 1 : -1) * 0.07;
    barrelGroup.add(tube);
  }

  // Sculpted flared Seussian listening horn bell at the front end (`LatheGeometry`)
  const bellPts = [
    new THREE.Vector2(0.08, 0.0),
    new THREE.Vector2(0.11, 0.12),
    new THREE.Vector2(0.17, 0.22),
    new THREE.Vector2(0.26, 0.32),
  ];
  const hornBell = new THREE.Mesh(
    new THREE.LatheGeometry(bellPts, 16),
    brassMat
  );
  hornBell.rotation.x = Math.PI / 2;
  hornBell.position.set(0, 0.03, 0.52);
  barrelGroup.add(hornBell);

  const bellRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.26, 0.022, 10, 18),
    ironMat
  );
  bellRim.position.set(0, 0.03, 0.84);
  barrelGroup.add(bellRim);

  hornRig.add(barrelGroup);
  detailsGroup.add(hornRig);

  // -------------------------------------------------------------------------
  // B. Twisted Scrap-Metal Cave Pipes (`x = -3.85m, z = -3.28m` & `x = +3.85m, z = -3.28m`)
  // -------------------------------------------------------------------------
  for (const side of [-1, 1] as const) {
    const pipeCluster = new THREE.Group();
    pipeCluster.position.set(side * 3.85, 0.0, -3.28);

    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.0, 0),
      new THREE.Vector3(side * 0.08, 0.55, 0.06),
      new THREE.Vector3(-side * 0.12, 1.15, -0.05),
      new THREE.Vector3(side * 0.14, 1.72, 0.04),
      new THREE.Vector3(side * 0.26, 2.08, 0.08),
    ]);
    const mainPipe = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 20, 0.065, 10, false),
      side < 0 ? copperPipeMat : ironMat
    );
    mainPipe.castShadow = true;
    pipeCluster.add(mainPipe);

    for (const t of [0.28, 0.58, 0.85]) {
      const pt = curve.getPoint(t);
      const collar = new THREE.Mesh(
        new THREE.TorusGeometry(0.082, 0.018, 8, 12),
        brassMat
      );
      collar.position.copy(pt);
      collar.rotation.x = Math.PI / 2 + side * 0.18;
      pipeCluster.add(collar);
    }

    // Domed exhaust cap at top of pipe
    const topPt = curve.getPoint(1.0);
    const pipeCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.14, 0.16, 12),
      ironMat
    );
    pipeCap.position.set(topPt.x, topPt.y + 0.09, topPt.z);
    pipeCap.rotation.z = -side * 0.22;
    pipeCluster.add(pipeCap);

    detailsGroup.add(pipeCluster);
  }

  // -------------------------------------------------------------------------
  // C. Max the Dog's Flat Rocky Perch, Cushion & Sitting Max Character
  //    (`x = +2.85m, z = -3.08m`)
  //    - `perchBase`: `y ∈ [0.00m, 0.42m]`
  //    - `perchSnowStep`: `y ∈ [0.42m, 0.54m]`
  //    - `cushion`: `y ∈ [0.54m, 0.62m]` (exact flat top surface at `y = 0.62m`)
  //    - `maxDog`: placed at `y = 0.62m` so Max sits flush on the cushion!
  // -------------------------------------------------------------------------
  const maxPerchGroup = new THREE.Group();
  maxPerchGroup.position.set(2.85, 0.0, -3.08);
  maxPerchGroup.rotation.y = -0.32;

  const perchBase = new THREE.Mesh(
    new RoundedBoxGeometry(0.92, 0.42, 0.66, 3, 0.08),
    slateMat
  );
  perchBase.position.set(0, 0.21, 0);
  perchBase.castShadow = true;
  perchBase.receiveShadow = true;
  maxPerchGroup.add(perchBase);

  const perchSnowStep = new THREE.Mesh(
    new RoundedBoxGeometry(0.80, 0.12, 0.56, 3, 0.04),
    snowMat
  );
  perchSnowStep.position.set(0, 0.48, 0);
  maxPerchGroup.add(perchSnowStep);

  // Flat red patchwork dog cushion (`y ∈ [0.54m, 0.62m]`, top surface = `0.62m`)
  const cushion = new THREE.Mesh(
    new RoundedBoxGeometry(0.54, 0.08, 0.44, 3, 0.025),
    new THREE.MeshStandardMaterial({
      color: 0xa82834,
      roughness: 0.72,
    })
  );
  cushion.position.set(0, 0.58, 0);
  maxPerchGroup.add(cushion);

  // Expressive 3D Max the Dog Character sitting cleanly on top of the cushion (`y = 0.62m`)
  const maxDog = createMaxDogCharacter({
    sitting: true,
    withAntler: false,
  });
  maxDog.position.set(0, 0.62, 0);
  maxPerchGroup.add(maxDog);

  // Max's crooked metal dog dish & bone beside the perch on the stage floor (`y = 0`)
  const dogBowl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.14, 0.08, 12),
    brassMat
  );
  dogBowl.position.set(-0.62, 0.04, 0.24);
  maxPerchGroup.add(dogBowl);

  const boneShaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.022, 0.18, 8),
    snowMat
  );
  boneShaft.rotation.z = Math.PI / 2 - 0.2;
  boneShaft.rotation.y = 0.35;
  boneShaft.position.set(-0.62, 0.09, 0.24);
  maxPerchGroup.add(boneShaft);

  detailsGroup.add(maxPerchGroup);

  return detailsGroup;
}

/**
 * Builds the Grinch's Cave Portal (`grinch-cave-portal`, Lineset #17 at `11'-10"`,
 * `z ∈ [-3.85m, -3.38m]`, spanning `x ∈ [-5.1m, +5.1m]`, `y ∈ [0, 6.2m]`) and the
 * Forced-Perspective Distant Whoville Vista (`z ∈ [-5.88m, -5.05m]`).
 */
export function buildGrinchCavePortal(rockTex: THREE.CanvasTexture): THREE.Group {
  const caveGroup = new THREE.Group();
  caveGroup.name = 'Element_grinch-cave-portal';

  const caveStriatedTex = createCaveStriatedRockTexture();
  const seussianRockNormalTex = createSeussianRockNormalTexture();
  const papierMacheNormalTex = createPapierMacheNormalTexture();

  // Multi-layered Seussian glacier-blue & slate materials with tangent-space normalMap
  const rearSlateBlueMat = new THREE.MeshStandardMaterial({
    map: caveStriatedTex,
    normalMap: seussianRockNormalTex,
    normalScale: new THREE.Vector2(0.88, 0.88),
    color: 0x5c88be,
    roughness: 0.62,
    metalness: 0.05,
  });

  const midGlacierBlueMat = new THREE.MeshStandardMaterial({
    map: caveStriatedTex,
    normalMap: seussianRockNormalTex,
    normalScale: new THREE.Vector2(0.84, 0.84),
    color: 0x82acd8,
    roughness: 0.58,
    metalness: 0.05,
  });

  const upperOverlapBlueMat = new THREE.MeshStandardMaterial({
    map: caveStriatedTex,
    normalMap: seussianRockNormalTex,
    normalScale: new THREE.Vector2(0.8, 0.8),
    color: 0x92b6d8,
    roughness: 0.57,
    metalness: 0.05,
  });

  const frontBaseRockMat = new THREE.MeshStandardMaterial({
    map: caveStriatedTex,
    normalMap: seussianRockNormalTex,
    normalScale: new THREE.Vector2(0.86, 0.86),
    color: 0x749ed0,
    roughness: 0.59,
    metalness: 0.05,
  });

  const icicleFangMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    normalMap: papierMacheNormalTex,
    normalScale: new THREE.Vector2(0.55, 0.55),
    color: 0xa4c4d8,
    roughness: 0.55,
    metalness: 0.08,
  });

  const icicleGlazeBackMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    normalMap: papierMacheNormalTex,
    normalScale: new THREE.Vector2(0.6, 0.6),
    color: 0x6290c8,
    roughness: 0.58,
    metalness: 0.06,
  });

  const snowBoulderMat = new THREE.MeshStandardMaterial({
    map: caveStriatedTex,
    normalMap: papierMacheNormalTex,
    normalScale: new THREE.Vector2(0.75, 0.75),
    color: 0xbacbe0,
    roughness: 0.6,
    metalness: 0.03,
  });

  const darkInkFissureMat = new THREE.MeshStandardMaterial({
    color: 0x182236,
    roughness: 0.72,
  });

  // =========================================================================
  // LAYER 1 (z = -3.83m, depth = 0.055m -> z ∈ [-3.845m, -3.76m]):
  // Outer Jagged Seussian Sawtooth Cavern Arch Silhouette (`x ∈ [-5.1m, +5.1m]`, `y ∈ [0, 6.2m]`)
  // =========================================================================
  const outerArchShape = new THREE.Shape();
  const outerPerimeter: ReadonlyArray<readonly [number, number]> = [
    [2.32, 0.0],
    [5.08, 0.0],
    [5.04, 1.58],
    [4.72, 1.42],
    [4.86, 2.48],
    [4.42, 2.22],
    [4.55, 3.35],
    [4.02, 3.05],
    [4.18, 4.18],
    [3.58, 3.85],
    [3.42, 5.38],
    [2.88, 4.52],
    [2.44, 5.78],
    [1.92, 4.88],
    [1.36, 6.08],
    [0.62, 6.20],
    [-0.12, 5.68],
    [-0.38, 6.14],
    [-0.85, 6.02],
    [-1.42, 5.25],
    [-1.78, 5.65],
    [-2.32, 4.78],
    [-2.68, 5.35],
    [-3.24, 4.42],
    [-3.52, 4.88],
    [-4.05, 3.78],
    [-4.28, 3.25],
    [-4.65, 2.85],
    [-4.88, 2.18],
    [-5.08, 1.62],
    [-5.08, 0.0],
    [-2.32, 0.0],
    // Inner cave mouth arch opening (`x ∈ [-2.32, +2.32]`, crown `y = 3.22m`)
    [-2.26, 0.95],
    [-1.98, 1.82],
    [-1.45, 2.52],
    [-0.78, 3.04],
    [-0.08, 3.22],
    [0.68, 3.06],
    [1.38, 2.56],
    [1.94, 1.84],
    [2.24, 0.95],
  ];
  outerPerimeter.forEach(([x, y], idx) => {
    if (idx === 0) outerArchShape.moveTo(x, y);
    else outerArchShape.lineTo(x, y);
  });
  outerArchShape.closePath();

  const outerArchGeo = new THREE.ExtrudeGeometry(outerArchShape, {
    depth: 0.055,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.015,
    bevelSegments: 2,
  });
  normalizeExtrudeUVs(outerArchGeo, 'world', 3.8);
  outerArchGeo.computeVertexNormals();

  const outerArchMesh = new THREE.Mesh(outerArchGeo, rearSlateBlueMat);
  outerArchMesh.position.z = -3.83;
  outerArchMesh.castShadow = true;
  outerArchMesh.receiveShadow = true;
  caveGroup.add(outerArchMesh);

  // =========================================================================
  // LAYER 2A (z = -3.71m, depth = 0.05m -> z ∈ [-3.725m, -3.645m]):
  // Mid-Stage Left & Right Striated Seussian Rock Wings (`x ∈ [-4.95m, +4.95m]`)
  // =========================================================================
  const leftMidWingPts: ReadonlyArray<readonly [number, number]> = [
    [-4.92, 0.0],
    [-4.88, 1.48],
    [-4.42, 2.45],
    [-4.02, 2.28],
    [-3.98, 3.68],
    [-3.28, 4.18],
    [-2.54, 4.72],
    [-1.58, 5.28],
    [-0.65, 5.88],
    [0.12, 5.45],
    [0.24, 3.16],
    [-0.68, 3.12],
    [-1.42, 2.58],
    [-1.98, 1.84],
    [-2.26, 0.92],
    [-2.32, 0.0],
  ];
  caveGroup.add(
    createExtrudedRockSlab(leftMidWingPts, 0.05, midGlacierBlueMat, -3.71, 0.015)
  );

  const rightMidWingPts: ReadonlyArray<readonly [number, number]> = [
    [2.32, 0.0],
    [2.24, 0.94],
    [1.92, 1.85],
    [1.36, 2.58],
    [1.76, 3.12],
    [3.62, 3.85],
    [4.05, 3.05],
    [4.48, 3.22],
    [4.38, 2.18],
    [4.78, 2.32],
    [4.92, 1.38],
    [4.95, 0.0],
  ];
  caveGroup.add(
    createExtrudedRockSlab(
      rightMidWingPts,
      0.05,
      midGlacierBlueMat,
      -3.71,
      0.015
    )
  );

  // =========================================================================
  // LAYER 2B (z = -3.60m, depth = 0.045m -> z ∈ [-3.612m, -3.543m]):
  // Overlapping Upper-Right Sweeping Glacier Rock Lobe (`model_1C_cave_closeup.jpg`)
  // =========================================================================
  const upperRightLobePts: ReadonlyArray<readonly [number, number]> = [
    [-0.32, 5.75],
    [0.58, 6.08],
    [1.34, 5.95],
    [1.88, 4.78],
    [2.42, 5.65],
    [2.86, 4.42],
    [3.38, 5.25],
    [3.68, 3.92],
    [2.68, 3.25],
    [1.62, 2.86],
    [0.72, 2.95],
    [0.12, 3.38],
    [-0.22, 4.35],
  ];
  caveGroup.add(
    createExtrudedRockSlab(
      upperRightLobePts,
      0.045,
      upperOverlapBlueMat,
      -3.60,
      0.012
    )
  );

  // =========================================================================
  // LAYER 3 (z = -3.50m, depth = 0.045m -> z ∈ [-3.512m, -3.443m]):
  // Front Lower Cave Base Mounds (`x ∈ [-5.08m, +5.08m]`)
  // =========================================================================
  const leftBaseMoundPts: ReadonlyArray<readonly [number, number]> = [
    [-5.08, 0.0],
    [-5.02, 1.32],
    [-4.18, 1.18],
    [-3.25, 0.82],
    [-2.32, 0.24],
    [-2.32, 0.0],
  ];
  caveGroup.add(
    createExtrudedRockSlab(leftBaseMoundPts, 0.045, frontBaseRockMat, -3.50, 0.012)
  );

  const rightBaseMoundPts: ReadonlyArray<readonly [number, number]> = [
    [2.32, 0.0],
    [2.32, 0.22],
    [3.08, 0.88],
    [3.98, 1.24],
    [4.68, 1.08],
    [5.08, 0.35],
    [5.08, 0.0],
  ];
  caveGroup.add(
    createExtrudedRockSlab(
      rightBaseMoundPts,
      0.045,
      frontBaseRockMat,
      -3.50,
      0.012
    )
  );

  // Bold 3D Seussian Charcoal-Black Ink Fissure Ribs across the Arch Face (`z = -3.40m`)
  const majorStrataFissures: ReadonlyArray<
    ReadonlyArray<readonly [number, number]>
  > = [
    [
      [-3.95, 3.65],
      [-3.22, 3.22],
      [-2.48, 2.52],
      [-1.85, 1.78],
    ],
    [
      [-0.32, 5.72],
      [-0.18, 4.35],
      [0.12, 3.38],
      [0.72, 2.95],
      [1.62, 2.86],
      [2.68, 3.25],
      [3.62, 3.88],
    ],
    [
      [-5.00, 1.32],
      [-4.16, 1.18],
      [-3.25, 0.82],
      [-2.35, 0.25],
    ],
    [
      [2.35, 0.22],
      [3.08, 0.88],
      [3.98, 1.24],
      [4.68, 1.08],
      [5.04, 0.38],
    ],
  ];
  for (const fissure of majorStrataFissures) {
    caveGroup.add(
      createSeussianStrataLedge(fissure, 0.05, 0.022, -3.40, darkInkFissureMat)
    );
  }

  // =========================================================================
  // SCULPTED SEUSSIAN ICICLE VALANCES & FLUTED STALACTITES BEHIND CAVE MOUTH
  // (`z ∈ [-3.98m, -3.86m]`, mounted BEHIND `outerArchMesh` at `z = -3.83m` with
  //  their top roots recessed up behind the solid rock rim so only the jagged
  //  icicle fingers poke down through the cave opening!)
  // =========================================================================
  // 1. Wavy Seussian Ice-Glaze Valance Curtains mounted behind the upper cavern arch (`z = -3.96m`)
  const archValanceSegments: ReadonlyArray<{
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly drop: number;
    readonly fingers: number;
    readonly rotZ: number;
    readonly seed: number;
  }> = [
    { x: -1.62, y: 2.50, width: 1.05, drop: 0.54, fingers: 5, rotZ: 0.62, seed: 1 },
    { x: -0.78, y: 3.16, width: 1.08, drop: 0.60, fingers: 6, rotZ: 0.26, seed: 2 },
    { x: 0.08, y: 3.32, width: 1.12, drop: 0.58, fingers: 6, rotZ: -0.08, seed: 3 },
    { x: 0.92, y: 3.06, width: 1.08, drop: 0.60, fingers: 6, rotZ: -0.34, seed: 4 },
    { x: 1.66, y: 2.44, width: 1.02, drop: 0.52, fingers: 5, rotZ: -0.66, seed: 5 },
  ];

  for (const vSeg of archValanceSegments) {
    const valance = createSeussianIcicleValance(
      vSeg.width,
      vSeg.drop,
      vSeg.fingers,
      icicleFangMat,
      icicleGlazeBackMat,
      0.032,
      vSeg.seed
    );
    valance.position.set(vSeg.x, vSeg.y, -3.96);
    valance.rotation.z = vSeg.rotZ;
    caveGroup.add(valance);
  }

  // 2. 20 Sculpted Fluted Seussian Stalactites (`createSculptedIcicleDrip`)
  //    Mounted behind the cave rock arch (`z = -3.89m`) with `topY` recessed up
  //    behind the solid rock rim so the roots are hidden behind the cave and
  //    only the pointed icicles poke down through the cave opening!
  const stalactiteSpecs: ReadonlyArray<{
    readonly x: number;
    readonly topY: number;
    readonly len: number;
    readonly topR: number;
    readonly bend: number;
    readonly tiltZ: number;
  }> = [
    { x: -2.06, topY: 1.92, len: 0.62, topR: 0.068, bend: 0.032, tiltZ: 0.12 },
    { x: -1.86, topY: 2.22, len: 0.82, topR: 0.082, bend: -0.038, tiltZ: 0.09 },
    { x: -1.64, topY: 2.52, len: 0.66, topR: 0.072, bend: 0.028, tiltZ: 0.06 },
    { x: -1.42, topY: 2.76, len: 1.22, topR: 0.112, bend: 0.055, tiltZ: 0.04 },
    { x: -1.18, topY: 2.96, len: 0.70, topR: 0.076, bend: -0.032, tiltZ: 0.03 },
    { x: -0.96, topY: 3.12, len: 0.88, topR: 0.088, bend: 0.042, tiltZ: 0.02 },
    { x: -0.74, topY: 3.24, len: 0.64, topR: 0.070, bend: -0.026, tiltZ: -0.02 },
    { x: -0.52, topY: 3.34, len: 1.08, topR: 0.115, bend: 0.048, tiltZ: 0.05 },
    { x: -0.28, topY: 3.38, len: 0.60, topR: 0.068, bend: -0.025, tiltZ: -0.03 },
    { x: -0.04, topY: 3.40, len: 1.02, topR: 0.108, bend: -0.045, tiltZ: -0.02 },
    { x: 0.20, topY: 3.37, len: 0.66, topR: 0.072, bend: 0.030, tiltZ: 0.03 },
    { x: 0.44, topY: 3.31, len: 0.90, topR: 0.092, bend: -0.038, tiltZ: -0.04 },
    { x: 0.68, topY: 3.23, len: 0.62, topR: 0.070, bend: 0.026, tiltZ: -0.02 },
    { x: 0.90, topY: 3.10, len: 1.26, topR: 0.108, bend: -0.052, tiltZ: -0.04 },
    { x: 1.12, topY: 2.94, len: 0.74, topR: 0.080, bend: 0.034, tiltZ: -0.05 },
    { x: 1.34, topY: 2.76, len: 1.04, topR: 0.095, bend: -0.044, tiltZ: -0.05 },
    { x: 1.56, topY: 2.56, len: 0.70, topR: 0.075, bend: 0.030, tiltZ: -0.07 },
    { x: 1.76, topY: 2.32, len: 0.94, topR: 0.088, bend: -0.040, tiltZ: -0.09 },
    { x: 1.94, topY: 2.06, len: 0.82, topR: 0.082, bend: 0.035, tiltZ: -0.11 },
    { x: 2.10, topY: 1.76, len: 0.64, topR: 0.068, bend: -0.028, tiltZ: -0.12 },
  ];

  for (const st of stalactiteSpecs) {
    const drip = createSculptedIcicleDrip(
      st.len,
      st.topR,
      icicleFangMat,
      st.bend
    );
    drip.position.set(st.x, st.topY, -3.89);
    drip.rotation.z = st.tiltZ;
    drip.scale.set(1.0, 1.0, 0.32);
    caveGroup.add(drip);
  }

  // =========================================================================
  // DSL & DSR SCULPTED SNOW BOULDERS & CRAGGY CAVE FLOOR OUTCROPS (`plan_1C_cave.jpg`)
  // Carefully spaced so the Grinch (`x = -2.15m, z = -3.05m`), spyglass tripod
  // (`x = -1.76m, z = -2.82m`), and Max's perch (`x = +2.85m, z = -3.08m`) have
  // 100% clear floor space with zero overlap!
  // =========================================================================
  const floorBoulderSpecs: ReadonlyArray<{
    readonly x: number;
    readonly z: number;
    readonly w: number;
    readonly h: number;
    readonly rotZ: number;
    readonly mat: THREE.Material;
  }> = [
    { x: -2.74, z: -3.14, w: 0.74, h: 0.56, rotZ: 0.05, mat: snowBoulderMat },
    { x: 2.08, z: -3.04, w: 0.68, h: 0.54, rotZ: -0.05, mat: snowBoulderMat },
    { x: -3.42, z: -3.22, w: 0.96, h: 0.66, rotZ: 0.09, mat: frontBaseRockMat },
    { x: 3.58, z: -3.22, w: 0.92, h: 0.62, rotZ: -0.08, mat: frontBaseRockMat },
  ];

  for (const bSpec of floorBoulderSpecs) {
    const hw = bSpec.w * 0.5;
    const tilt = bSpec.rotZ * 0.4;
    const boulderPts: ReadonlyArray<readonly [number, number]> = [
      [bSpec.x - hw, 0.0],
      [bSpec.x - hw * 0.82, bSpec.h * (0.78 - tilt)],
      [bSpec.x - hw * 0.28, bSpec.h * (1.0 - tilt * 0.5)],
      [bSpec.x + hw * 0.34, bSpec.h * (0.94 + tilt * 0.5)],
      [bSpec.x + hw * 0.84, bSpec.h * (0.72 + tilt)],
      [bSpec.x + hw, 0.0],
    ];
    const boulder = createExtrudedRockSlab(
      boulderPts,
      0.14,
      bSpec.mat,
      bSpec.z,
      0.025
    );
    caveGroup.add(boulder);

    caveGroup.add(
      createSeussianStrataLedge(
        [
          [bSpec.x - hw * 0.78, bSpec.h * 0.76],
          [bSpec.x - hw * 0.26, bSpec.h * 0.98],
          [bSpec.x + hw * 0.32, bSpec.h * 0.92],
          [bSpec.x + hw * 0.80, bSpec.h * 0.70],
        ],
        0.026,
        0.02,
        bSpec.z + 0.17,
        darkInkFissureMat
      )
    );
  }

  // Grinch Character, Spyglass/Listening Horn, Scrap Pipes, and Max on his Rocky Perch
  caveGroup.add(buildGrinchCaveSideDetails(frontBaseRockMat, snowBoulderMat));

  // Forced-Perspective Distant Whoville Vista (`z ∈ [-5.88m, -5.05m]`)
  caveGroup.add(buildDistantWhovilleVista(rockTex));

  caveGroup.visible = false;
  return caveGroup;
}

/**
 * Creates a single vertical undulating metallic Mylar streamer ribbon with
 * sine-wave twists along Y so stage lights catch realistic foil highlights
 * from top to bottom (`model_1C_cave_mylar.jpg`).
 */
function createUndulatingMylarStreamer(
  width: number,
  height: number,
  phaseOffset: number,
  freqY: number,
  ampZ: number,
  ampX: number,
  material: THREE.Material
): THREE.Mesh {
  const segY = 28;
  const geo = new THREE.PlaneGeometry(width, height, 2, segY);
  const pos = geo.attributes.position;

  if (pos) {
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const normY = 0.5 - vy / height;
      const waveZ =
        Math.sin(vy * freqY + phaseOffset) * ampZ +
        Math.cos(vy * (freqY * 2.1) - phaseOffset * 1.4) * (ampZ * 0.42);
      const swayX = Math.sin(vy * 1.6 + phaseOffset * 0.8) * ampX * normY;
      const twistAngle = Math.sin(vy * 2.4 + phaseOffset) * 0.36;
      const twistedX = vx * Math.cos(twistAngle) + swayX;
      const twistedZ = vx * Math.sin(twistAngle) + waveZ;

      pos.setXYZ(i, twistedX, vy, twistedZ);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  }

  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * Builds the Lineset #19 (`13'-2"`, `z ∈ [-4.26m, -4.10m]`) Metallic Mylar Streamer Curtain
 * (`grinch-mylar-curtain`, `width = 7.4m, height = 4.6m`) with a dark backing drape
 * at `z = -4.26m` and 80 individual undulating reflective gold, champagne,
 * silver-chrome, and icy-blue metallic streamer ribbons (`model_1C_cave_mylar.jpg`).
 */
export function buildGrinchMylarCurtain(): THREE.Group {
  const mylarGroup = new THREE.Group();
  mylarGroup.name = 'Element_grinch-mylar-curtain';

  const curtainWidth = 7.4;
  const curtainHeight = 4.6;
  const centerY = curtainHeight * 0.5;

  // 1. Dark Backing Drape (`z = -4.26m`) to completely block the distant Whoville
  //    vista when the Mylar curtain is flown in (`Scene 1C·2`).
  const backingDrapeMat = new THREE.MeshStandardMaterial({
    color: 0x0b0e18,
    roughness: 0.92,
    metalness: 0.04,
    side: THREE.DoubleSide,
  });
  const backingDrape = new THREE.Mesh(
    new THREE.PlaneGeometry(curtainWidth, curtainHeight),
    backingDrapeMat
  );
  backingDrape.position.set(0, centerY, -4.26);
  mylarGroup.add(backingDrape);

  // Top Batten Pipe & Black Webbing Header at `y = 4.58m, z = -4.16m`
  const battenPipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.032, curtainWidth + 0.2, 12),
    new THREE.MeshStandardMaterial({
      color: 0x222834,
      roughness: 0.45,
      metalness: 0.75,
    })
  );
  battenPipe.rotation.z = Math.PI / 2;
  battenPipe.position.set(0, curtainHeight - 0.02, -4.16);
  mylarGroup.add(battenPipe);

  // 2. Reflective Metallic Mylar Foil Materials (Gold, Champagne, Silver-Chrome, Icy-Blue, Bronze-Gold)
  const mylarPalette: ReadonlyArray<THREE.MeshStandardMaterial> = [
    new THREE.MeshStandardMaterial({
      color: 0xffd468,
      emissive: 0x7a5014,
      emissiveIntensity: 0.48,
      roughness: 0.14,
      metalness: 0.94,
      side: THREE.DoubleSide,
    }),
    new THREE.MeshStandardMaterial({
      color: 0xecd6b2,
      emissive: 0x5c4422,
      emissiveIntensity: 0.44,
      roughness: 0.15,
      metalness: 0.93,
      side: THREE.DoubleSide,
    }),
    new THREE.MeshStandardMaterial({
      color: 0xd6e0ec,
      emissive: 0x384658,
      emissiveIntensity: 0.42,
      roughness: 0.12,
      metalness: 0.96,
      side: THREE.DoubleSide,
    }),
    new THREE.MeshStandardMaterial({
      color: 0x9ac4ec,
      emissive: 0x224068,
      emissiveIntensity: 0.42,
      roughness: 0.16,
      metalness: 0.92,
      side: THREE.DoubleSide,
    }),
    new THREE.MeshStandardMaterial({
      color: 0xf2aa46,
      emissive: 0x6a380e,
      emissiveIntensity: 0.46,
      roughness: 0.16,
      metalness: 0.92,
      side: THREE.DoubleSide,
    }),
  ];

  // 3. 56 Primary Undulating Vertical Metallic Streamer Ribbons (`z = -4.20m` and `-4.16m`)
  //    Plus 24 Front Shimmer Accent Ribbons (`z = -4.12m`) — 80 ribbons total!
  const primaryRibbonCount = 56;
  const stepX = curtainWidth / primaryRibbonCount;

  for (let i = 0; i < primaryRibbonCount; i++) {
    const xPos = (i - (primaryRibbonCount - 1) * 0.5) * stepX;
    const zPos = i % 2 === 0 ? -4.20 : -4.16;
    const mat = mylarPalette[i % mylarPalette.length] ?? mylarPalette[0]!;
    const ribbonWidth = 0.125 + (i % 3) * 0.015;
    const phase = i * 0.93;
    const freqY = 2.4 + (i % 4) * 0.35;

    const streamer = createUndulatingMylarStreamer(
      ribbonWidth,
      curtainHeight - 0.06,
      phase,
      freqY,
      0.012,
      0.018,
      mat
    );
    streamer.position.set(xPos, centerY - 0.01, zPos);
    streamer.rotation.y = ((i * 5) % 7 - 3) * 0.08;
    streamer.rotation.z = ((i * 3) % 5 - 2) * 0.012;
    mylarGroup.add(streamer);
  }

  // Front layer of 24 narrower crinkled foil ribbons at `z = -4.12m` across the center cave mouth
  const frontRibbonCount = 24;
  for (let j = 0; j < frontRibbonCount; j++) {
    const fx = (j - (frontRibbonCount - 1) * 0.5) * 0.22;
    const mat =
      mylarPalette[(j * 2 + 1) % mylarPalette.length] ?? mylarPalette[0]!;
    const frontStreamer = createUndulatingMylarStreamer(
      0.095,
      curtainHeight - 0.08,
      j * 1.37 + 0.5,
      3.1 + (j % 3) * 0.4,
      0.012,
      0.022,
      mat
    );
    frontStreamer.position.set(fx, centerY - 0.02, -4.12);
    frontStreamer.rotation.y = ((j * 3) % 5 - 2) * 0.11;
    if (j >= 16 && j <= 21) {
      frontStreamer.rotation.z = (j % 2 === 0 ? 1 : -1) * 0.14;
    }
    mylarGroup.add(frontStreamer);
  }

  mylarGroup.visible = false;
  return mylarGroup;
}
