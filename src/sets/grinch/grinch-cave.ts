import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/**
 * Creates a custom high-contrast Seussian pen-and-ink striated ice/rock canvas
 * texture for the Grinch's Cave portal wings and boulders, matching the painted
 * model box plates (`model_1C_cave_vista.jpg` & `model_1C_cave_closeup.jpg`).
 */
function createCaveStriatedRockTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Base glacial slate-blue gradient with subtle vertical ice streaks
    const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1024);
    bgGrad.addColorStop(0.0, '#96bce0');
    bgGrad.addColorStop(0.35, '#adcbe6');
    bgGrad.addColorStop(0.7, '#82add8');
    bgGrad.addColorStop(1.0, '#6a96c8');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Soft lavender-ice and cerulean painterly wash patches
    for (let i = 0; i < 42; i++) {
      const px = ((i * 173) % 980) + 20;
      const py = ((i * 251) % 980) + 20;
      const rx = 90 + (i % 5) * 35;
      const ry = 45 + (i % 4) * 28;
      const wash = ctx.createRadialGradient(px, py, 8, px, py, rx);
      if (i % 3 === 0) {
        wash.addColorStop(0, 'rgba(196, 214, 236, 0.34)');
      } else if (i % 3 === 1) {
        wash.addColorStop(0, 'rgba(82, 134, 198, 0.28)');
      } else {
        wash.addColorStop(0, 'rgba(170, 188, 228, 0.26)');
      }
      wash.addColorStop(1, 'rgba(130, 170, 216, 0)');
      ctx.fillStyle = wash;
      ctx.beginPath();
      ctx.ellipse(px, py, rx, ry, ((i % 7) - 3) * 0.22, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bold Seussian charcoal-black ink contour strata & craggy cross-hatching
    ctx.strokeStyle = 'rgba(18, 26, 42, 0.78)';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let row = 0; row < 18; row++) {
      const baseY = 48 + row * 54;
      ctx.lineWidth = row % 3 === 0 ? 4.2 : 2.6;
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      for (let x = 32; x <= 1024; x += 32) {
        const wave =
          Math.sin(x * 0.012 + row * 0.85) * 14 +
          Math.cos(x * 0.028 - row * 1.1) * 7;
        ctx.lineTo(x, baseY + wave);
      }
      ctx.stroke();

      // Short perpendicular Seussian shadow tick-hatches along major strata ledges
      if (row % 2 === 0) {
        ctx.lineWidth = 2.1;
        for (let x = 24; x < 1000; x += 22 + ((row + x) % 14)) {
          const wave =
            Math.sin(x * 0.012 + row * 0.85) * 14 +
            Math.cos(x * 0.028 - row * 1.1) * 7;
          const tickLen = 10 + ((x * 3 + row * 7) % 16);
          const tilt = ((x % 5) - 2) * 0.14;
          ctx.beginPath();
          ctx.moveTo(x, baseY + wave);
          ctx.lineTo(x + Math.sin(tilt) * tickLen, baseY + wave + tickLen);
          ctx.stroke();
        }
      }
    }

    // Zig-zag Seussian crag lightning-hatch scribbles
    ctx.lineWidth = 3.0;
    for (let z = 0; z < 28; z++) {
      const sx = ((z * 137) % 900) + 60;
      const sy = ((z * 193) % 900) + 60;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + 26, sy - 14);
      ctx.lineTo(sx + 12, sy + 8);
      ctx.lineTo(sx + 42, sy - 6);
      ctx.lineTo(sx + 24, sy + 18);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(0.28, 0.28);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Helper to extrude a 2D polygon path into a beveled 3D scenic flat or rock slab
 * with subtle Seussian dark-slate edge outlining.
 */
function createExtrudedRockSlab(
  points: ReadonlyArray<readonly [number, number]>,
  depth: number,
  material: THREE.Material,
  zPos: number,
  bevelSize = 0.025
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
      new RoundedBoxGeometry(len + thickness * 0.4, thickness, depth, 2, thickness * 0.3),
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
    map: rockTex,
    color: wallColorHex,
    roughness: 0.58,
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
    const t = (e / (eaveCount - 1)) - 0.5;
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
    new THREE.SphereGeometry(width * 0.54, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.62),
    snowRoofMat
  );
  dome.scale.set(1.02, 0.88, 0.6);
  dome.position.set(0, bodyH * 0.88, 0);
  cottage.add(dome);

  // Crooked Seussian roof spire & round ball finial with dark ink outline ring
  const spire = new THREE.Mesh(
    new THREE.ConeGeometry(width * 0.11, height * 0.26, 10),
    snowRoofMat
  );
  spire.position.set(width * 0.04, bodyH + height * 0.36, 0.02);
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
 * Builds the forced-perspective distant Whoville Vista (`z = -5.4m`) seen through
 * the Grinch's Cave mouth in `model_1C_cave_vista.jpg` and `model_1C_cave_closeup.jpg`.
 */
function buildDistantWhovilleVista(rockTex: THREE.CanvasTexture): THREE.Group {
  const vistaGroup = new THREE.Group();
  vistaGroup.name = 'GrinchCave_DistantWhovilleVista';

  const snowHillFrontMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    color: 0xbec6dc,
    roughness: 0.62,
    metalness: 0.03,
  });

  const snowHillMidMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    color: 0xb2bed8,
    roughness: 0.6,
    metalness: 0.03,
  });

  const snowMountainFarMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    color: 0xc4cce0,
    roughness: 0.58,
    metalness: 0.03,
  });

  const cragBlueMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    color: 0x6c9ad4,
    roughness: 0.56,
    metalness: 0.06,
  });

  const inkContourMat = new THREE.MeshStandardMaterial({
    color: 0x1c2236,
    roughness: 0.72,
  });

  // 1. Illuminated Winter Vista Sky Backing Plate (`z = -5.88m`)
  // Provides the bright periwinkle/ice-white horizon glow seen behind the blue crag in `model_1C_cave_closeup.jpg`
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
  // Left high snow peak sweeping down toward center (`model_1C_cave_closeup.jpg` upper-left)
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
    0.06,
    snowMountainFarMat,
    -5.76,
    0.015
  );
  vistaGroup.add(farLeftMountain);

  // Right sweeping snow hill behind the village (`model_1C_cave_closeup.jpg` mid-right)
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
    0.06,
    snowHillMidMat,
    -5.66,
    0.015
  );
  vistaGroup.add(farRightMountain);

  // Dark Seussian ink ridge contour along far right snow slope (`z = -5.58m`)
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
      0.03,
      -5.58,
      inkContourMat
    )
  );

  // 3. Signature Blue 3-Fingered Seussian Rock Crag Spire (`z = -5.54m`)
  // Seen directly behind the miniature Christmas tree in `model_1C_cave_closeup.jpg`!
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
    0.055,
    cragBlueMat,
    -5.54,
    0.015
  );
  vistaGroup.add(blueCragSpire);

  // Vertical black Seussian hatch strokes on the blue crag spire (`z = -5.46m`)
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
        0.025,
        -5.46,
        inkContourMat
      )
    );
  }

  // 4. Mid-Left Snow Shoulder Hill (`z = -5.45m`)
  const midLeftSlopePts: ReadonlyArray<readonly [number, number]> = [
    [-2.55, 0.0],
    [-2.55, 1.68],
    [-1.85, 1.82],
    [-1.18, 1.56],
    [-0.52, 1.02],
    [-0.52, 0.0],
  ];
  vistaGroup.add(
    createExtrudedRockSlab(midLeftSlopePts, 0.04, snowHillMidMat, -5.45, 0.012)
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
      0.025,
      -5.39,
      inkContourMat
    )
  );

  // 5. Central Whoville Village Snow Hill (`x ≈ -0.15m`, `z = -5.36m`)
  // And the 7 Miniature Pink/Lavender Onion-Domed Who Cottages + Glowing Tree!
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
    0.08,
    snowHillFrontMat,
    -5.36,
    0.02
  );
  vistaGroup.add(centralHill);

  // Dark Seussian contour arc crowning the central Whoville hill (`z = -5.25m`)
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
      0.025,
      -5.25,
      inkContourMat
    )
  );

  // Winding Snowy Trail curling from Whoville up toward Mt. Crumpit (`z = -5.22m`)
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
    createSeussianStrataLedge(trailPts, 0.065, 0.025, -5.22, trailMat)
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
    // Far-left outer tilted cottage
    { x: -0.82, y: 0.64, z: -5.33, w: 0.28, h: 0.42, wallHex: 0xd06298, roofHex: 0xbcc6dc, tiltZ: 0.38 },
    // Mid-left background cottage (peeking slightly higher)
    { x: -0.62, y: 0.82, z: -5.40, w: 0.26, h: 0.40, wallHex: 0xc2588e, roofHex: 0xb4c0d8, tiltZ: 0.26 },
    // Inner-left foreground cottage
    { x: -0.44, y: 0.82, z: -5.31, w: 0.32, h: 0.46, wallHex: 0xd86aa2, roofHex: 0xc2cce0, tiltZ: 0.16 },
    // Center-left behind the tree
    { x: -0.24, y: 0.90, z: -5.42, w: 0.25, h: 0.38, wallHex: 0xc85e94, roofHex: 0xb8c4dc, tiltZ: 0.06 },
    // Inner-right foreground cottage
    { x: 0.18, y: 0.84, z: -5.31, w: 0.32, h: 0.45, wallHex: 0xd6689e, roofHex: 0xc0cae0, tiltZ: -0.14 },
    // Mid-right background cottage
    { x: 0.40, y: 0.80, z: -5.40, w: 0.26, h: 0.39, wallHex: 0xc0568c, roofHex: 0xb4c0d8, tiltZ: -0.24 },
    // Far-right outer tilted cottage
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
  const miniTreeGroup = new THREE.Group();
  miniTreeGroup.position.set(-0.13, 0.90, -5.29);

  const foliageMat = new THREE.MeshStandardMaterial({
    color: 0x1e7e38,
    emissive: 0x0b3616,
    emissiveIntensity: 0.35,
    roughness: 0.55,
  });

  for (let tier = 0; tier < 5; tier++) {
    const coneR = 0.21 - tier * 0.032;
    const coneH = 0.26 - tier * 0.02;
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(coneR, coneH, 12),
      foliageMat
    );
    cone.position.y = 0.12 + tier * 0.15;
    cone.rotation.z = (tier % 2 === 0 ? 1 : -1) * 0.08;
    cone.scale.set(1.0, 1.0, 0.65);
    miniTreeGroup.add(cone);
  }

  // Glowing Gold Star Topper on Miniature Tree
  const starMat = new THREE.MeshStandardMaterial({
    color: 0xffe048,
    emissive: 0xffb81c,
    emissiveIntensity: 1.4,
    roughness: 0.22,
  });
  const miniStar = new THREE.Mesh(new THREE.OctahedronGeometry(0.065, 0), starMat);
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

  // 6. Foreground Left & Right Flanking Snow Hills inside the Vista (`z = -5.18m` and `z = -5.12m`)
  // Left foreground snow mound (`model_1C_cave_closeup.jpg` lower-left)
  const fgLeftHillPts: ReadonlyArray<readonly [number, number]> = [
    [-2.55, 0.0],
    [-2.55, 1.18],
    [-1.85, 1.32],
    [-1.32, 1.15],
    [-0.95, 0.72],
    [-0.68, 0.0],
  ];
  vistaGroup.add(
    createExtrudedRockSlab(fgLeftHillPts, 0.06, snowHillFrontMat, -5.18, 0.015)
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
      0.025,
      -5.10,
      inkContourMat
    )
  );

  // Right foreground snow mound (`model_1C_cave_closeup.jpg` lower-right)
  const fgRightHillPts: ReadonlyArray<readonly [number, number]> = [
    [0.52, 0.0],
    [0.78, 0.68],
    [1.18, 1.12],
    [1.68, 1.24],
    [2.45, 1.05],
    [2.45, 0.0],
  ];
  vistaGroup.add(
    createExtrudedRockSlab(fgRightHillPts, 0.06, snowHillFrontMat, -5.18, 0.015)
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
      0.025,
      -5.10,
      inkContourMat
    )
  );

  // Signature Blue 3-Fingered Seussian Rock Claw Outcrop on the Right Foreground Hill (`z = -5.06m`)
  // Visible in the lower-right corner of the cave opening in `model_1C_cave_closeup.jpg`!
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
    createExtrudedRockSlab(rightBlueClawPts, 0.045, cragBlueMat, -5.06, 0.012)
  );

  return vistaGroup;
}

/**
 * Builds the Grinch's crooked Seussian spyglass/listening horn aimed down at
 * Whoville, twisted scrap-metal cave pipes, and Max the dog's rocky perch.
 */
function buildGrinchCaveSideDetails(
  slateMat: THREE.Material,
  snowMat: THREE.Material
): THREE.Group {
  const detailsGroup = new THREE.Group();
  detailsGroup.name = 'GrinchCave_PropsAndOutcrops';

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
  // A. Crooked Seussian Telescope / Whoville Listening Horn (`x = -2.62m, z = -2.96m`)
  //    Tucked beside the DSR cave boulder, aimed down toward Whoville!
  // -------------------------------------------------------------------------
  const hornRig = new THREE.Group();
  hornRig.position.set(-2.62, 0.0, -2.96);
  hornRig.rotation.y = 0.42;

  // Tripod legs
  for (let leg = 0; leg < 3; leg++) {
    const a = (leg / 3) * Math.PI * 2 + 0.3;
    const strut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.03, 0.92, 8),
      ironMat
    );
    strut.position.set(Math.cos(a) * 0.18, 0.42, Math.sin(a) * 0.18);
    strut.rotation.z = -Math.cos(a) * 0.28;
    strut.rotation.x = Math.sin(a) * 0.28;
    hornRig.add(strut);
  }

  // Gear mount hub
  const gearWheel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, 0.05, 14),
    brassMat
  );
  gearWheel.rotation.x = Math.PI / 2;
  gearWheel.position.set(0, 0.86, 0);
  hornRig.add(gearWheel);

  // Segmented crooked Seussian spyglass / ear-trumpet tube
  const barrelGroup = new THREE.Group();
  barrelGroup.position.set(0, 0.90, 0);
  barrelGroup.rotation.z = -0.22;
  barrelGroup.rotation.y = -0.18;

  for (let segIdx = 0; segIdx < 4; segIdx++) {
    const r0 = 0.045 + segIdx * 0.026;
    const r1 = 0.065 + segIdx * 0.032;
    const tube = new THREE.Mesh(
      new THREE.CylinderGeometry(r1, r0, 0.28, 12),
      segIdx % 2 === 0 ? brassMat : ironMat
    );
    tube.rotation.x = Math.PI / 2;
    tube.position.set(
      0,
      Math.sin(segIdx * 0.6) * 0.04,
      segIdx * 0.24 - 0.18
    );
    tube.rotation.z = (segIdx % 2 === 0 ? 1 : -1) * 0.08;
    barrelGroup.add(tube);
  }

  // Wide flared Seussian listening horn bell at the front end
  const hornBell = new THREE.Mesh(
    new THREE.ConeGeometry(0.28, 0.34, 16, 1, true),
    brassMat
  );
  hornBell.rotation.x = -Math.PI / 2;
  hornBell.position.set(0, 0.03, 0.72);
  barrelGroup.add(hornBell);

  const bellRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.28, 0.024, 10, 18),
    ironMat
  );
  bellRim.position.set(0, 0.03, 0.88);
  barrelGroup.add(bellRim);

  hornRig.add(barrelGroup);
  detailsGroup.add(hornRig);

  // -------------------------------------------------------------------------
  // B. Twisted Scrap-Metal Cave Pipes (`x = -3.28m, z = -3.28m` & `x = +3.28m, z = -3.28m`)
  // -------------------------------------------------------------------------
  for (const side of [-1, 1] as const) {
    const pipeCluster = new THREE.Group();
    pipeCluster.position.set(side * 3.28, 0.0, -3.28);

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

    // Flanged pipe collars along the crooked pipe
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

    // Crooked conical exhaust cap at top of pipe
    const topPt = curve.getPoint(1.0);
    const pipeCap = new THREE.Mesh(
      new THREE.ConeGeometry(0.14, 0.18, 10),
      ironMat
    );
    pipeCap.position.set(topPt.x, topPt.y + 0.1, topPt.z);
    pipeCap.rotation.z = -side * 0.25;
    pipeCluster.add(pipeCap);

    detailsGroup.add(pipeCluster);
  }

  // -------------------------------------------------------------------------
  // C. Max the Dog's Rocky Perch & Dish (`x = +2.85m, z = -3.08m`)
  // -------------------------------------------------------------------------
  const maxPerchGroup = new THREE.Group();
  maxPerchGroup.position.set(2.85, 0.0, -3.08);
  maxPerchGroup.rotation.y = -0.22;

  const perchBase = new THREE.Mesh(
    new RoundedBoxGeometry(0.96, 0.44, 0.68, 3, 0.12),
    slateMat
  );
  perchBase.position.set(0, 0.22, 0);
  perchBase.castShadow = true;
  maxPerchGroup.add(perchBase);

  const perchSnowStep = new THREE.Mesh(
    new RoundedBoxGeometry(0.84, 0.16, 0.58, 3, 0.06),
    snowMat
  );
  perchSnowStep.position.set(-0.04, 0.48, 0.02);
  perchSnowStep.rotation.z = 0.05;
  maxPerchGroup.add(perchSnowStep);

  // Frayed red patchwork dog cushion on top of the rocky perch
  const cushion = new THREE.Mesh(
    new RoundedBoxGeometry(0.54, 0.11, 0.42, 3, 0.05),
    new THREE.MeshStandardMaterial({
      color: 0xa82834,
      roughness: 0.72,
    })
  );
  cushion.position.set(-0.02, 0.59, 0.02);
  cushion.rotation.z = 0.05;
  maxPerchGroup.add(cushion);

  // Max's crooked metal dog dish & bone beside the perch
  const dogBowl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.14, 0.08, 12),
    brassMat
  );
  dogBowl.position.set(-0.56, 0.04, 0.28);
  maxPerchGroup.add(dogBowl);

  const boneShaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.022, 0.18, 8),
    snowMat
  );
  boneShaft.rotation.z = Math.PI / 2 - 0.2;
  boneShaft.rotation.y = 0.35;
  boneShaft.position.set(-0.56, 0.09, 0.28);
  maxPerchGroup.add(boneShaft);

  detailsGroup.add(maxPerchGroup);

  return detailsGroup;
}

/**
 * Builds the Grinch's Cave Portal (`grinch-cave-portal`, Lineset #17 at `11'-10"`,
 * `z = -3.65m`, spanning `x ∈ [-5.8m, +5.8m]`, `y ∈ [0, 6.2m]`) and the
 * Forced-Perspective Distant Whoville Vista (`z = -5.4m`).
 */
export function buildGrinchCavePortal(rockTex: THREE.CanvasTexture): THREE.Group {
  const caveGroup = new THREE.Group();
  caveGroup.name = 'Element_grinch-cave-portal';

  const caveStriatedTex = createCaveStriatedRockTexture();

  // Multi-layered Seussian glacier-blue & slate materials (toned down: max hex <= 0xd8, roughness >= 0.55)
  const rearSlateBlueMat = new THREE.MeshStandardMaterial({
    map: caveStriatedTex,
    color: 0x5c88be,
    roughness: 0.62,
    metalness: 0.05,
  });

  const midGlacierBlueMat = new THREE.MeshStandardMaterial({
    map: caveStriatedTex,
    color: 0x82acd8,
    roughness: 0.58,
    metalness: 0.05,
  });

  const upperOverlapBlueMat = new THREE.MeshStandardMaterial({
    map: caveStriatedTex,
    color: 0x92b6d8,
    roughness: 0.57,
    metalness: 0.05,
  });

  const frontBaseRockMat = new THREE.MeshStandardMaterial({
    map: caveStriatedTex,
    color: 0x749ed0,
    roughness: 0.59,
    metalness: 0.05,
  });

  const icicleFangMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    color: 0x9ec0d8,
    roughness: 0.55,
    metalness: 0.08,
  });

  const snowBoulderMat = new THREE.MeshStandardMaterial({
    map: caveStriatedTex,
    color: 0xbacbe0,
    roughness: 0.6,
    metalness: 0.03,
  });

  const darkInkFissureMat = new THREE.MeshStandardMaterial({
    color: 0x182236,
    roughness: 0.72,
  });

  // =========================================================================
  // LAYER 1 (z = -3.82m, depth = 0.08m):
  // Outer Jagged Seussian Sawtooth Cavern Arch Silhouette (`x ∈ [-5.8m, +5.8m]`, `y ∈ [0, 6.2m]`)
  // =========================================================================
  const outerArchShape = new THREE.Shape();
  const outerPerimeter: ReadonlyArray<readonly [number, number]> = [
    // Inner right cave mouth edge going clockwise around the outer jagged crest
    [2.32, 0.0],
    [5.80, 0.0],
    [5.74, 1.58],
    [5.35, 1.42],
    [5.48, 2.48],
    [4.95, 2.22],
    [5.08, 3.35],
    [4.42, 3.05],
    [4.62, 4.18],
    [3.88, 3.85],
    [3.65, 5.38],
    [3.08, 4.52],
    [2.58, 5.78],
    [2.05, 4.88],
    [1.42, 6.08],
    [0.65, 6.20],
    [-0.12, 5.68],
    [-0.38, 6.14],
    [-0.85, 6.02],
    [-1.45, 5.25],
    [-1.82, 5.65],
    [-2.42, 4.78],
    [-2.78, 5.35],
    [-3.42, 4.42],
    [-3.72, 4.88],
    [-4.35, 3.78],
    [-4.58, 3.25],
    [-5.02, 2.85],
    [-5.38, 2.18],
    [-5.80, 1.62],
    [-5.80, 0.0],
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
    depth: 0.08,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2,
  });
  const outerArchMesh = new THREE.Mesh(outerArchGeo, rearSlateBlueMat);
  outerArchMesh.position.z = -3.82;
  outerArchMesh.castShadow = true;
  outerArchMesh.receiveShadow = true;
  caveGroup.add(outerArchMesh);

  // =========================================================================
  // LAYER 2A (z = -3.68m, depth = 0.07m):
  // Mid-Stage Left & Right Striated Seussian Rock Wings (`model_1C_cave_vista.jpg`)
  // =========================================================================
  // Stage-Right (viewer left) sweeping striated wing slab
  const leftMidWingPts: ReadonlyArray<readonly [number, number]> = [
    [-5.55, 0.0],
    [-5.52, 1.48],
    [-4.85, 2.45],
    [-4.38, 2.28],
    [-4.35, 3.68],
    [-3.52, 4.18],
    [-2.68, 4.72],
    [-1.65, 5.28],
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
    createExtrudedRockSlab(leftMidWingPts, 0.07, midGlacierBlueMat, -3.68, 0.02)
  );

  // Stage-Left (viewer right) lower-mid striated wing slab
  const rightMidWingPts: ReadonlyArray<readonly [number, number]> = [
    [2.32, 0.0],
    [2.24, 0.94],
    [1.92, 1.85],
    [1.36, 2.58],
    [1.82, 3.12],
    [3.92, 3.85],
    [4.48, 3.05],
    [4.96, 3.22],
    [4.88, 2.18],
    [5.38, 2.32],
    [5.58, 1.38],
    [5.62, 0.0],
  ];
  caveGroup.add(
    createExtrudedRockSlab(rightMidWingPts, 0.07, midGlacierBlueMat, -3.68, 0.02)
  );

  // =========================================================================
  // LAYER 2B (z = -3.58m, depth = 0.06m):
  // Overlapping Upper-Right Sweeping Glacier Rock Lobe (`model_1C_cave_closeup.jpg`)
  // Notice in `model_1C_cave_closeup.jpg` how the upper-right rock lobe sweeps from
  // top-center (`x = -0.32m`) across to the upper-right teeth (`x = +3.95m`)!
  // =========================================================================
  const upperRightLobePts: ReadonlyArray<readonly [number, number]> = [
    [-0.32, 5.75],
    [0.58, 6.08],
    [1.38, 5.95],
    [1.98, 4.78],
    [2.52, 5.65],
    [3.02, 4.42],
    [3.58, 5.25],
    [3.98, 3.92],
    [2.85, 3.25],
    [1.68, 2.86],
    [0.72, 2.95],
    [0.12, 3.38],
    [-0.22, 4.35],
  ];
  caveGroup.add(
    createExtrudedRockSlab(
      upperRightLobePts,
      0.06,
      upperOverlapBlueMat,
      -3.58,
      0.02
    )
  );

  // =========================================================================
  // LAYER 3 (z = -3.49m, depth = 0.06m):
  // Front Lower Cave Base Mounds & Upper Dripping Glacier Stalactite Fingers
  // =========================================================================
  // Left base mound (`x ∈ [-5.8m, -2.28m]`, `y ∈ [0, 1.35m]`)
  const leftBaseMoundPts: ReadonlyArray<readonly [number, number]> = [
    [-5.80, 0.0],
    [-5.75, 1.32],
    [-4.65, 1.18],
    [-3.45, 0.82],
    [-2.32, 0.24],
    [-2.32, 0.0],
  ];
  caveGroup.add(
    createExtrudedRockSlab(leftBaseMoundPts, 0.06, frontBaseRockMat, -3.49, 0.02)
  );

  // Right base mound (`x ∈ [2.28m, 5.8m]`, `y ∈ [0, 1.38m]`)
  const rightBaseMoundPts: ReadonlyArray<readonly [number, number]> = [
    [2.32, 0.0],
    [2.32, 0.22],
    [3.18, 0.88],
    [4.28, 1.24],
    [5.18, 1.08],
    [5.80, 0.35],
    [5.80, 0.0],
  ];
  caveGroup.add(
    createExtrudedRockSlab(rightBaseMoundPts, 0.06, frontBaseRockMat, -3.49, 0.02)
  );

  // Two long vertical blue-ice stalactite fingers dripping down the upper arch face
  // (Clearly visible at `x ≈ -0.82m` and `x ≈ +1.08m` in `model_1C_cave_closeup.jpg`)
  const leftUpperIceFingerPts: ReadonlyArray<readonly [number, number]> = [
    [-1.08, 5.85],
    [-0.58, 5.98],
    [-0.64, 4.45],
    [-0.78, 3.68],
    [-0.92, 4.35],
  ];
  caveGroup.add(
    createExtrudedRockSlab(leftUpperIceFingerPts, 0.04, icicleFangMat, -3.49, 0.015)
  );

  const rightUpperIceFingerPts: ReadonlyArray<readonly [number, number]> = [
    [0.82, 6.02],
    [1.36, 5.92],
    [1.26, 4.38],
    [1.08, 3.45],
    [0.92, 4.22],
  ];
  caveGroup.add(
    createExtrudedRockSlab(rightUpperIceFingerPts, 0.04, icicleFangMat, -3.49, 0.015)
  );

  // Bold 3D Seussian Charcoal-Black Ink Fissure Ribs across the Arch Face (`z = -3.41m`)
  const majorStrataFissures: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
    // Left sweeping diagonal fissure from outer wing into cave mouth
    [
      [-4.28, 3.65],
      [-3.42, 3.22],
      [-2.58, 2.52],
      [-1.85, 1.78],
    ],
    // Center-top overlapping lobe crease
    [
      [-0.32, 5.72],
      [-0.18, 4.35],
      [0.12, 3.38],
      [0.72, 2.95],
      [1.68, 2.86],
      [2.85, 3.25],
      [3.92, 3.88],
    ],
    // Left base mound contour
    [
      [-5.68, 1.32],
      [-4.62, 1.18],
      [-3.45, 0.82],
      [-2.35, 0.25],
    ],
    // Right base mound contour
    [
      [2.35, 0.22],
      [3.18, 0.88],
      [4.28, 1.24],
      [5.18, 1.08],
      [5.72, 0.38],
    ],
  ];
  for (const fissure of majorStrataFissures) {
    caveGroup.add(
      createSeussianStrataLedge(fissure, 0.055, 0.03, -3.41, darkInkFissureMat)
    );
  }

  // =========================================================================
  // 20 JAGGED TRANSLUCENT/ICE-BLUE STALACTITE & ICICLE TEETH (`z = -3.44m` & `-3.38m`)
  // Hanging along the upper cave mouth rim (`model_1C_cave_closeup.jpg`)
  // =========================================================================
  const icicleSpecs: ReadonlyArray<{
    readonly x: number;
    readonly topY: number;
    readonly len: number;
    readonly halfW: number;
    readonly tiltZ: number;
    readonly zPos: number;
  }> = [
    { x: -2.06, topY: 1.74, len: 0.44, halfW: 0.09, tiltZ: 0.14, zPos: -3.44 },
    { x: -1.86, topY: 2.04, len: 0.62, halfW: 0.11, tiltZ: 0.10, zPos: -3.38 },
    { x: -1.64, topY: 2.34, len: 0.48, halfW: 0.09, tiltZ: 0.08, zPos: -3.44 },
    { x: -1.42, topY: 2.58, len: 1.04, halfW: 0.15, tiltZ: 0.05, zPos: -3.38 },
    { x: -1.18, topY: 2.78, len: 0.52, halfW: 0.10, tiltZ: 0.04, zPos: -3.44 },
    { x: -0.96, topY: 2.94, len: 0.68, halfW: 0.12, tiltZ: 0.02, zPos: -3.38 },
    { x: -0.74, topY: 3.06, len: 0.46, halfW: 0.09, tiltZ: -0.02, zPos: -3.44 },
    { x: -0.52, topY: 3.16, len: 0.88, halfW: 0.16, tiltZ: 0.06, zPos: -3.38 },
    { x: -0.28, topY: 3.21, len: 0.42, halfW: 0.09, tiltZ: -0.04, zPos: -3.44 },
    { x: -0.04, topY: 3.23, len: 0.82, halfW: 0.15, tiltZ: -0.03, zPos: -3.38 },
    { x: 0.20, topY: 3.20, len: 0.48, halfW: 0.09, tiltZ: 0.04, zPos: -3.44 },
    { x: 0.44, topY: 3.14, len: 0.72, halfW: 0.13, tiltZ: -0.05, zPos: -3.38 },
    { x: 0.68, topY: 3.06, len: 0.44, halfW: 0.09, tiltZ: -0.02, zPos: -3.44 },
    { x: 0.90, topY: 2.92, len: 1.08, halfW: 0.14, tiltZ: -0.04, zPos: -3.38 },
    { x: 1.12, topY: 2.76, len: 0.56, halfW: 0.11, tiltZ: -0.06, zPos: -3.44 },
    { x: 1.34, topY: 2.58, len: 0.86, halfW: 0.12, tiltZ: -0.05, zPos: -3.38 },
    { x: 1.56, topY: 2.38, len: 0.52, halfW: 0.10, tiltZ: -0.08, zPos: -3.44 },
    { x: 1.76, topY: 2.14, len: 0.76, halfW: 0.12, tiltZ: -0.10, zPos: -3.38 },
    { x: 1.94, topY: 1.88, len: 0.64, halfW: 0.11, tiltZ: -0.12, zPos: -3.44 },
    { x: 2.10, topY: 1.58, len: 0.46, halfW: 0.09, tiltZ: -0.14, zPos: -3.38 },
  ];

  for (const ic of icicleSpecs) {
    const fangPts: ReadonlyArray<readonly [number, number]> = [
      [ic.x - ic.halfW, ic.topY + 0.08],
      [ic.x + ic.halfW, ic.topY + 0.08],
      [ic.x + ic.halfW * 0.42 + ic.tiltZ * 0.2, ic.topY - ic.len * 0.52],
      [ic.x + ic.tiltZ * 0.4, ic.topY - ic.len],
      [ic.x - ic.halfW * 0.38 + ic.tiltZ * 0.2, ic.topY - ic.len * 0.48],
    ];
    const fangMesh = createExtrudedRockSlab(
      fangPts,
      0.032,
      icicleFangMat,
      ic.zPos,
      0.01
    );
    caveGroup.add(fangMesh);
  }

  // =========================================================================
  // DSL & DSR SCULPTED SNOW BOULDERS & CRAGGY CAVE FLOOR OUTCROPS (`plan_1C_cave.jpg`)
  // =========================================================================
  // Inner cave mouth snow boulders seen in `model_1C_cave_vista.jpg` (`x = -2.18m`, `x = +2.12m`)
  // Plus outer craggy floor outcrops at `x = ±2.9m, z = -3.1m` (`plan_1C_cave.jpg`)
  const floorBoulderSpecs: ReadonlyArray<{
    readonly x: number;
    readonly z: number;
    readonly w: number;
    readonly h: number;
    readonly rotZ: number;
    readonly mat: THREE.Material;
  }> = [
    { x: -2.18, z: -3.02, w: 0.76, h: 0.56, rotZ: 0.06, mat: snowBoulderMat },
    { x: 2.12, z: -3.02, w: 0.74, h: 0.54, rotZ: -0.06, mat: snowBoulderMat },
    { x: -2.92, z: -3.14, w: 1.12, h: 0.68, rotZ: 0.11, mat: frontBaseRockMat },
    { x: 2.92, z: -3.14, w: 1.08, h: 0.64, rotZ: -0.10, mat: frontBaseRockMat },
    { x: -3.55, z: -3.24, w: 0.88, h: 0.48, rotZ: 0.08, mat: snowBoulderMat },
    { x: 3.52, z: -3.24, w: 0.86, h: 0.46, rotZ: -0.08, mat: snowBoulderMat },
  ];

  for (const bSpec of floorBoulderSpecs) {
    const hw = bSpec.w * 0.5;
    const boulderPts: ReadonlyArray<readonly [number, number]> = [
      [bSpec.x - hw, 0.0],
      [bSpec.x - hw * 0.82, bSpec.h * 0.78],
      [bSpec.x - hw * 0.28, bSpec.h],
      [bSpec.x + hw * 0.34, bSpec.h * 0.94],
      [bSpec.x + hw * 0.84, bSpec.h * 0.72],
      [bSpec.x + hw, 0.0],
    ];
    const boulder = createExtrudedRockSlab(
      boulderPts,
      0.18,
      bSpec.mat,
      bSpec.z,
      0.035
    );
    boulder.rotation.z = bSpec.rotZ;
    caveGroup.add(boulder);

    // Dark Seussian outline crest on each floor boulder (`bSpec.z + 0.22m`)
    caveGroup.add(
      createSeussianStrataLedge(
        [
          [bSpec.x - hw * 0.78, bSpec.h * 0.76],
          [bSpec.x - hw * 0.26, bSpec.h * 0.98],
          [bSpec.x + hw * 0.32, bSpec.h * 0.92],
          [bSpec.x + hw * 0.80, bSpec.h * 0.70],
        ],
        0.026,
        0.025,
        bSpec.z + 0.22,
        darkInkFissureMat
      )
    );
  }

  // Grinch Cave Props & Outcrop Details (Spyglass/Listening Horn, Scrap Pipes, Max's Perch)
  caveGroup.add(buildGrinchCaveSideDetails(frontBaseRockMat, snowBoulderMat));

  // Forced-Perspective Distant Whoville Vista (`z = -5.4m`)
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
      // Normalized vertical coordinate from 0 (top batten) to 1 (stage floor)
      const normY = 0.5 - vy / height;
      const waveZ =
        Math.sin(vy * freqY + phaseOffset) * ampZ +
        Math.cos(vy * (freqY * 2.1) - phaseOffset * 1.4) * (ampZ * 0.42);
      const swayX = Math.sin(vy * 1.6 + phaseOffset * 0.8) * ampX * normY;
      // Slight ribbon twist around its vertical axis so left and right edges catch different light angles
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
 * Builds the Lineset #19 (`13'-2"`, `z = -4.15m`) Metallic Mylar Streamer Curtain
 * (`grinch-mylar-curtain`, `width = 7.4m, height = 4.6m`) with a dark backing drape
 * at `z = -4.26m` and 56+ individual undulating reflective gold, champagne,
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
    // Bright Metallic Gold
    new THREE.MeshStandardMaterial({
      color: 0xffd468,
      emissive: 0x7a5014,
      emissiveIntensity: 0.48,
      roughness: 0.14,
      metalness: 0.94,
      side: THREE.DoubleSide,
    }),
    // Warm Champagne Foil
    new THREE.MeshStandardMaterial({
      color: 0xecd6b2,
      emissive: 0x5c4422,
      emissiveIntensity: 0.44,
      roughness: 0.15,
      metalness: 0.93,
      side: THREE.DoubleSide,
    }),
    // Mirror Silver-Chrome
    new THREE.MeshStandardMaterial({
      color: 0xd6e0ec,
      emissive: 0x384658,
      emissiveIntensity: 0.42,
      roughness: 0.12,
      metalness: 0.96,
      side: THREE.DoubleSide,
    }),
    // Icy-Blue Metallic
    new THREE.MeshStandardMaterial({
      color: 0x9ac4ec,
      emissive: 0x224068,
      emissiveIntensity: 0.42,
      roughness: 0.16,
      metalness: 0.92,
      side: THREE.DoubleSide,
    }),
    // Rich Amber-Bronze Gold
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
    // Alternate between z = -4.20m and z = -4.16m (0.04m stagger so neighboring ribbons never z-fight)
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
      0.014,
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
    const mat = mylarPalette[(j * 2 + 1) % mylarPalette.length] ?? mylarPalette[0]!;
    const frontStreamer = createUndulatingMylarStreamer(
      0.095,
      curtainHeight - 0.08,
      j * 1.37 + 0.5,
      3.1 + (j % 3) * 0.4,
      0.016,
      0.022,
      mat
    );
    frontStreamer.position.set(fx, centerY - 0.02, -4.12);
    frontStreamer.rotation.y = ((j * 3) % 5 - 2) * 0.11;
    // Slight diagonal splay on a few right-side ribbons matching `model_1C_cave_mylar.jpg`
    if (j >= 16 && j <= 21) {
      frontStreamer.rotation.z = (j % 2 === 0 ? 1 : -1) * 0.14;
    }
    mylarGroup.add(frontStreamer);
  }

  mylarGroup.visible = false;
  return mylarGroup;
}
