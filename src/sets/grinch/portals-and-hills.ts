import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {
  createPapierMacheNormalTexture,
  createSeussianRockNormalTexture,
  normalizeExtrudeUVs,
} from '../../engine/procedural-textures.ts';

let cachedSnowMountainCliffTex: THREE.CanvasTexture | null = null;
let cachedGlacierWavePortalTex: THREE.CanvasTexture | null = null;

/**
 * Generates a 1024×1024 seamlessly tileable scenic artist texture
 * (`createSnowMountainCliffTexture`) for the side-of-stage Seussian snow-cliff
 * mountains and Mt. Crumpit, combining layered papier-mâché plaster washes,
 * periodic horizontal Seussian rock strata, deep cobalt/glacier-blue shadow
 * fissures, warm lavender/ivory snow highlights, and expressive Tim Parati /
 * Dr. Seuss charcoal cross-hatching.
 */
export function createSnowMountainCliffTexture(): THREE.CanvasTexture {
  if (cachedSnowMountainCliffTex) {
    return cachedSnowMountainCliffTex;
  }

  const W = 1024;
  const H = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. Seamlessly periodic vertical Seussian alpine snow & glacier-rock wash (stop 0 === stop 1)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0.0, '#b0c6dc');
    bgGrad.addColorStop(0.25, '#c4d4e2');
    bgGrad.addColorStop(0.52, '#a2bdd9');
    bgGrad.addColorStop(0.78, '#8eaed0');
    bgGrad.addColorStop(1.0, '#b0c6dc');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Soft, subtle translucent snow-glaze washes (no hard rectangle outlines)
    for (let i = 0; i < 48; i++) {
      const cx = (i * 173 + 47) % W;
      const cy = (i * 251 + 83) % H;
      const w = 110 + ((i * 29) % 130);
      const h = 42 + ((i * 19) % 54);
      const angle = (((i * 37) % 100) / 100 - 0.5) * 0.65;

      for (const ox of [-W, 0, W]) {
        for (const oy of [-H, 0, H]) {
          const px = cx + ox;
          const py = cy + oy;
          if (px + w < 0 || px - w > W || py + h < 0 || py - h > H) continue;
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(angle);
          if (i % 3 === 0) {
            ctx.fillStyle = 'rgba(214, 224, 236, 0.11)';
          } else if (i % 3 === 1) {
            ctx.fillStyle = 'rgba(124, 160, 206, 0.09)';
          } else {
            ctx.fillStyle = 'rgba(188, 198, 224, 0.09)';
          }
          ctx.beginPath();
          ctx.ellipse(0, 0, w * 0.5, h * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
    }

    // 3. Gentle, spaced-out horizontal Seussian snow-drift contour bands
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let row = 0; row < 8; row++) {
      const baseY = 64 + row * 128;
      const waveY = (x: number): number => {
        const u = (x / W) * Math.PI * 2;
        return (
          baseY +
          Math.sin(u * 2 + row * 0.9) * 14 +
          Math.cos(u * 4 - row * 1.2) * 6
        );
      };

      // Soft glacier-cobalt shadow wash underneath each drift shelf
      ctx.strokeStyle = 'rgba(64, 102, 158, 0.20)';
      ctx.lineWidth = 18;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 16) {
        const wy = waveY(x) + 8;
        if (x === 0) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.stroke();

      // Warm ivory-lavender highlight along the top ridge of each shelf
      ctx.strokeStyle = 'rgba(216, 226, 236, 0.30)';
      ctx.lineWidth = 10;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 16) {
        const wy = waveY(x) - 5;
        if (x === 0) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.stroke();

      // Subtle Dr. Seuss charcoal-navy contour line
      ctx.strokeStyle = 'rgba(34, 48, 74, 0.28)';
      ctx.lineWidth = row % 2 === 0 ? 2.4 : 1.8;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 16) {
        const wy = waveY(x);
        if (x === 0) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.stroke();
    }

    // 4. Light, occasional Seussian contour accents
    ctx.strokeStyle = 'rgba(32, 46, 72, 0.22)';
    ctx.lineWidth = 2.0;
    for (let z = 0; z < 10; z++) {
      const sx = ((z * 149) % 880) + 56;
      const sy = ((z * 211) % 880) + 56;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + 34, sy - 7);
      ctx.lineTo(sx + 12, sy + 9);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  cachedSnowMountainCliffTex = tex;
  return tex;
}

/**
 * Generates a 1024×1024 seamlessly periodic scenic artist texture
 * (`createGlacierWavePortalTexture`) for the sweeping S-curved glacial ice-wave
 * wing portals and snowdrifts in `model_1B_whoville.jpg`.
 */
export function createGlacierWavePortalTexture(): THREE.CanvasTexture {
  if (cachedGlacierWavePortalTex) {
    return cachedGlacierWavePortalTex;
  }

  const W = 1024;
  const H = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Seamlessly periodic glacial blue to snowy lavender-frost wash
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0.0, '#96badc');
    bgGrad.addColorStop(0.25, '#bed2e2');
    bgGrad.addColorStop(0.55, '#8ab2da');
    bgGrad.addColorStop(0.8, '#6e98c8');
    bgGrad.addColorStop(1.0, '#96badc');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Horizontally periodic sweeping curved glacial flow ribbons
    ctx.lineCap = 'round';
    for (let i = 0; i < 12; i++) {
      const baseY = 40 + i * 84;
      ctx.strokeStyle =
        i % 2 === 0
          ? 'rgba(214, 226, 238, 0.20)'
          : 'rgba(64, 108, 168, 0.16)';
      ctx.lineWidth = 20 + (i % 3) * 6;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 16) {
        const u = (x / W) * Math.PI * 2;
        const wy =
          baseY +
          Math.sin(u + i * 0.45) * 24 +
          Math.cos(u * 2 - i * 0.3) * 10;
        if (x === 0) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.stroke();
    }

    // Subtle Seussian contour accents
    ctx.strokeStyle = 'rgba(28, 44, 72, 0.22)';
    ctx.lineWidth = 1.8;
    for (let i = 0; i < 16; i++) {
      const hx = ((i * 163) % 900) + 48;
      const hy = ((i * 199) % 900) + 48;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.quadraticCurveTo(hx + 22, hy - 10, hx + 44, hy - 3);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  cachedGlacierWavePortalTex = tex;
  return tex;
}

let cachedJaggedRockCliffTex: THREE.CanvasTexture | null = null;

/**
 * Generates a 1024×1024 seamlessly periodic stratified alpine rock cliff texture
 * (`createJaggedRockCliffFaceTexture`) with weathered dark slate-grey granite,
 * warm dolomite/limestone ochre-tan mineral blocks, horizontal sedimentary bedding
 * joints, and subtle frost highlights on the rock ledges.
 */
export function createJaggedRockCliffFaceTexture(): THREE.CanvasTexture {
  if (cachedJaggedRockCliffTex) {
    return cachedJaggedRockCliffTex;
  }

  const W = 1024;
  const H = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. Weathered dark alpine slate & granite rock base
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0.0, '#525c6a');
    bgGrad.addColorStop(0.25, '#5e6876');
    bgGrad.addColorStop(0.5, '#4b5563');
    bgGrad.addColorStop(0.75, '#586270');
    bgGrad.addColorStop(1.0, '#525c6a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Broad, soft weathered limestone/dolomite ochre-tan & cool slate rock color washes (no hard brick outlines)
    for (let i = 0; i < 64; i++) {
      const bx = (i * 197 + 31) % W;
      const by = (i * 139 + 53) % H;
      const bw = 90 + ((i * 43) % 150);
      const bh = 38 + ((i * 23) % 64);

      for (const ox of [-W, 0, W]) {
        for (const oy of [-H, 0, H]) {
          const px = bx + ox;
          const py = by + oy;
          if (px + bw < 0 || px > W || py + bh < 0 || py > H) continue;

          if (i % 4 === 0) {
            ctx.fillStyle = 'rgba(154, 132, 102, 0.16)';
          } else if (i % 4 === 1) {
            ctx.fillStyle = 'rgba(44, 52, 64, 0.18)';
          } else if (i % 4 === 2) {
            ctx.fillStyle = 'rgba(116, 128, 144, 0.15)';
          } else {
            ctx.fillStyle = 'rgba(138, 120, 98, 0.14)';
          }
          ctx.fillRect(px, py, bw, bh);
        }
      }
    }

    // 3. Clean, restrained horizontal rock strata bedding joints
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let row = 0; row < 9; row++) {
      const baseY = 56 + row * 112;
      const stepY = (x: number): number => {
        const seg = Math.floor(x / 64);
        const nextSeg = (seg + 1) % 16;
        const frac = (x % 64) / 64;
        const h0 = Math.sin(seg * 1.9 + row * 1.3) * 8 + ((seg * 7 + row) % 3) * 3;
        const h1 =
          Math.sin(nextSeg * 1.9 + row * 1.3) * 8 + ((nextSeg * 7 + row) % 3) * 3;
        const t = frac < 0.75 ? 0 : (frac - 0.75) / 0.25;
        return baseY + h0 * (1 - t) + h1 * t;
      };

      // Subtle crevice shadow directly beneath each rock stratum shelf
      ctx.strokeStyle = 'rgba(22, 28, 38, 0.36)';
      ctx.lineWidth = 7;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 16) {
        const sy = stepY(x) + 4;
        if (x === 0) ctx.moveTo(x, sy);
        else ctx.lineTo(x, sy);
      }
      ctx.stroke();

      // Soft frost highlight caught on top of alternating horizontal rock ledges
      if (row % 2 === 0) {
        ctx.strokeStyle = 'rgba(206, 218, 230, 0.28)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 16) {
          const sy = stepY(x) - 3;
          if (x === 0) ctx.moveTo(x, sy);
          else ctx.lineTo(x, sy);
        }
        ctx.stroke();
      }

      // Clean dark slate bedding seam
      ctx.strokeStyle = 'rgba(20, 26, 36, 0.42)';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 16) {
        const sy = stepY(x);
        if (x === 0) ctx.moveTo(x, sy);
        else ctx.lineTo(x, sy);
      }
      ctx.stroke();
    }

    // 4. Sparse, subtle vertical rock fracture seams
    ctx.strokeStyle = 'rgba(22, 28, 38, 0.28)';
    ctx.lineWidth = 1.8;
    for (let v = 0; v < 12; v++) {
      const vx = ((v * 157) % 900) + 52;
      const vy = ((v * 223) % 820) + 48;
      ctx.beginPath();
      ctx.moveTo(vx, vy);
      ctx.lineTo(vx + ((v % 3) - 1) * 10, vy + 36);
      ctx.lineTo(vx - ((v % 2) * 12 - 6), vy + 72);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  cachedJaggedRockCliffTex = tex;
  return tex;
}

/**
 * Builds an angular, chiseled, multi-faceted 3D rock shard / talus crag block
 * (`ExtrudeGeometry` with sharp 1-segment rock chamfers and planar facets —
 * zero `SphereGeometry`!).
 */
function createJaggedRockShardBlock(
  widthX: number,
  heightY: number,
  depthZ: number,
  material: THREE.Material,
  seed = 1,
  leanX = 0
): THREE.Mesh {
  const hw = widthX * 0.5;
  const hh = heightY * 0.5;
  const shape = new THREE.Shape();

  const j1 = ((seed * 7) % 5) * 0.025;
  const j2 = ((seed * 11) % 5) * 0.025;

  shape.moveTo(-hw * (0.96 + j1), -hh);
  shape.lineTo(-hw * (1.06 - j2), -hh + heightY * 0.34);
  shape.lineTo(-hw * (0.88 + j1) + leanX * 0.35, -hh + heightY * 0.68);
  shape.lineTo(-hw * 0.58 + leanX, hh * (0.94 + j2));
  shape.lineTo(hw * 0.12 + leanX, hh * (1.04 - j1));
  shape.lineTo(hw * 0.76 + leanX * 0.6, hh * (0.86 + j1));
  shape.lineTo(hw * (1.04 - j2), -hh + heightY * 0.52);
  shape.lineTo(hw * (0.92 + j1), -hh + heightY * 0.22);
  shape.lineTo(hw * 0.98, -hh);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: depthZ,
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 1,
    bevelSize: 0.016,
    bevelThickness: 0.016,
  });
  geo.translate(0, 0, -depthZ * 0.5);

  // Chisel front and back vertices to create sharp planar rock facets
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    if (vz > 0) {
      const ridgeFacet =
        (1.0 - Math.min(1.0, Math.abs(vx - leanX * 0.3) / (hw + 0.05))) *
        depthZ *
        0.24;
      const stepFacet =
        Math.floor(((vy + hh) / Math.max(0.1, heightY)) * 4) * 0.015;
      pos.setZ(i, vz + ridgeFacet - stepFacet);
    }
  }

  normalizeExtrudeUVs(geo, 'fit');
  geo.computeVertexNormals();

  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * Deterministic seeded PRNG (`mulberry32`) so every cliff layer and side
 * generates a genuinely distinct, non-repeating geological silhouette.
 */
function createCliffRng(seed: number): () => number {
  let state = (seed ^ 0x6d2b79f5) >>> 0;
  return (): number => {
    state = Math.imul(state ^ (state >>> 15), state | 1);
    state ^= state + Math.imul(state ^ (state >>> 7), state | 61);
    return ((state ^ (state >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Builds a thick, heavy, "wet" dripping snow-pack blanket (`createCliffTopSnowPackCornice`)
 * that sits cleanly on top of a snow cliff and melts/drips down the front cliff face
 * in plump, rounded, uneven snow-drip fingers with a deep Seussian shadow contour
 * directly underneath (matching `model_1B_whoville.jpg` — no spiky icicle triangles!).
 */
function createCliffTopSnowPackCornice(
  width: number,
  snowThickness: number,
  depth: number,
  scallopCount: number,
  snowCapMat: THREE.Material,
  underShadowMat: THREE.Material,
  _icicleMat: THREE.Material,
  _glazeBackMat: THREE.Material,
  contourInkMat: THREE.Material,
  seed = 1,
  slopeRiseLeftToRight = 0.0
): THREE.Group {
  const group = new THREE.Group();
  const rng = createCliffRng(seed * 97 + 13);
  const halfW = width * 0.5;
  const h = Math.min(0.68, Math.max(0.32, snowThickness));

  const leftTopY = h - slopeRiseLeftToRight * 0.5;
  const rightTopY = h + slopeRiseLeftToRight * 0.5;

  const buildWetSnowDripShape = (yOffset: number, radiusExpand: number): THREE.Shape => {
    const sRng = createCliffRng(seed * 97 + 13);
    const shape = new THREE.Shape();
    shape.moveTo(-halfW - radiusExpand, 0.04 + yOffset);
    shape.quadraticCurveTo(
      -halfW - 0.04 - radiusExpand,
      leftTopY * 0.55 + yOffset,
      -halfW * 0.86,
      leftTopY + yOffset + radiusExpand * 0.4
    );
    shape.bezierCurveTo(
      -halfW * 0.28,
      (leftTopY + rightTopY) * 0.5 + 0.08 + yOffset,
      halfW * 0.28,
      rightTopY + 0.06 + yOffset,
      halfW * 0.86,
      rightTopY * 0.92 + yOffset + radiusExpand * 0.4
    );
    shape.quadraticCurveTo(
      halfW + 0.04 + radiusExpand,
      rightTopY * 0.48 + yOffset,
      halfW + radiusExpand,
      0.02 + yOffset
    );

    // Bottom edge: heavy, rounded "wet" snow-melt drips & wavy lobes hanging down the cliff face
    const dripCount = Math.max(4, scallopCount + 2);
    const stepW = (width + radiusExpand * 2) / dripCount;
    for (let i = 0; i < dripCount; i++) {
      const xRight = halfW + radiusExpand - i * stepW;
      const xLeft = xRight - stepW;
      const xMid = (xRight + xLeft) * 0.5 + (sRng() - 0.5) * stepW * 0.16;
      // Alternating long heavy wet snow-melt fingers and shorter plump snow scallops
      const isLongDrip = (i + (seed % 2)) % 2 === 0;
      const dripLen = isLongDrip
        ? h * (0.68 + sRng() * 0.42)
        : h * (0.24 + sRng() * 0.22);
      const dipY = -dripLen + yOffset - radiusExpand * 0.8;
      const notchY = -h * (0.06 + sRng() * 0.1) + yOffset;

      // Smooth bezier curve down to rounded wet drip tip and back up to the next snow fold
      shape.bezierCurveTo(
        xRight - stepW * 0.22,
        dipY * 0.65,
        xMid + stepW * 0.16,
        dipY,
        xMid,
        dipY
      );
      shape.bezierCurveTo(
        xMid - stepW * 0.16,
        dipY,
        xLeft + stepW * 0.22,
        dipY * 0.65,
        xLeft,
        notchY
      );
    }
    shape.closePath();
    return shape;
  };

  // 1. Deep cobalt-charcoal undercut shadow contour directly beneath the wet dripping snow
  const shadowShape = buildWetSnowDripShape(-0.055, 0.015);
  const shadowGeo = new THREE.ExtrudeGeometry(shadowShape, {
    depth: depth * 0.92,
    bevelEnabled: false,
  });
  shadowGeo.translate(0, -h * 0.28, -depth * 0.44);
  normalizeExtrudeUVs(shadowGeo, 'fit');
  const shadowMesh = new THREE.Mesh(shadowGeo, underShadowMat);
  group.add(shadowMesh);

  // Thin dark Seussian ink shadow lip just behind the wet snow drips
  const inkShape = buildWetSnowDripShape(-0.028, 0.008);
  const inkGeo = new THREE.ExtrudeGeometry(inkShape, {
    depth: depth * 0.96,
    bevelEnabled: false,
  });
  inkGeo.translate(0, -h * 0.28, -depth * 0.46);
  const inkMesh = new THREE.Mesh(inkGeo, contourInkMat);
  group.add(inkMesh);

  // 2. Plump, rounded, wet-looking snowpack blanket & dripping snow fingers in front
  const capShape = buildWetSnowDripShape(0, 0);
  const capGeo = new THREE.ExtrudeGeometry(capShape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.036,
    bevelThickness: 0.036,
  });
  capGeo.translate(0, -h * 0.28, -depth * 0.5);
  normalizeExtrudeUVs(capGeo, 'fit');
  capGeo.computeVertexNormals();

  const capMesh = new THREE.Mesh(capGeo, snowCapMat);
  capMesh.castShadow = true;
  capMesh.receiveShadow = true;
  group.add(capMesh);

  // Keep rng referenced so deterministic seed signature is preserved
  void rng;

  return group;
}

let cachedPineFlutedTierGeo: THREE.LatheGeometry | null = null;
let cachedPineSnowSkirtGeo: THREE.LatheGeometry | null = null;
let cachedPineBranchLobeGeo: THREE.ConeGeometry | null = null;

function getSharedShowpiecePineGeometries(): {
  readonly flutedTierGeo: THREE.LatheGeometry;
  readonly snowSkirtGeo: THREE.LatheGeometry;
  readonly branchLobeGeo: THREE.ConeGeometry;
} {
  if (!cachedPineFlutedTierGeo) {
    // Unit-radius, unit-height fluted concave-skirt LatheGeometry matching the Showpiece Tree
    const conePts: THREE.Vector2[] = [];
    for (let s = 0; s <= 10; s++) {
      const u = s / 10;
      const flare = Math.pow(1 - u, 1.18);
      const py = u - 0.35;
      conePts.push(new THREE.Vector2(Math.max(0.02, flare), py));
    }
    cachedPineFlutedTierGeo = new THREE.LatheGeometry(conePts, 14);
  }
  if (!cachedPineSnowSkirtGeo) {
    const snowPts: THREE.Vector2[] = [];
    for (let s = 0; s <= 8; s++) {
      const u = s / 8;
      const flare = Math.pow(1 - u, 1.12) * 0.92;
      const py = u * 0.58 - 0.02;
      snowPts.push(new THREE.Vector2(Math.max(0.02, flare), py));
    }
    cachedPineSnowSkirtGeo = new THREE.LatheGeometry(snowPts, 12);
  }
  if (!cachedPineBranchLobeGeo) {
    cachedPineBranchLobeGeo = new THREE.ConeGeometry(1, 1, 6);
  }
  return {
    flutedTierGeo: cachedPineFlutedTierGeo,
    snowSkirtGeo: cachedPineSnowSkirtGeo,
    branchLobeGeo: cachedPineBranchLobeGeo,
  };
}

/**
 * Helper to create a miniature crooked Seussian spruce/pine tree clinging to a
 * mountain cliff ledge or distant Whoville hill ridge, using the exact same
 * S-curved spine, fluted concave-skirt `LatheGeometry` tiers, and ring of
 * drooping `ConeGeometry` branch-tip lobes as the Center Showpiece Tree.
 */
function createForcedPerspectiveWhovillePine(
  scale: number,
  pineMat: THREE.Material,
  snowMat: THREE.Material,
  trunkMat: THREE.Material,
  leanDir: -1 | 1 = 1
): THREE.Group {
  const tree = new THREE.Group();
  const { flutedTierGeo, snowSkirtGeo, branchLobeGeo } =
    getSharedShowpiecePineGeometries();

  const getSpineOffset = (
    tierFrac: number
  ): { x: number; z: number; tiltZ: number } => {
    const sx =
      leanDir *
      Math.sin(tierFrac * Math.PI * 1.65) *
      0.045 *
      (0.4 + tierFrac * 0.85) *
      scale;
    const sz = Math.cos(tierFrac * Math.PI * 1.3) * 0.015 * scale;
    const tiltZ = -leanDir * Math.cos(tierFrac * Math.PI * 1.65) * 0.14;
    return { x: sx, z: sz, tiltZ };
  };

  const trunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(leanDir * 0.028 * scale, 0.22 * scale, 0.008 * scale),
    new THREE.Vector3(leanDir * -0.022 * scale, 0.48 * scale, -0.008 * scale),
    new THREE.Vector3(leanDir * 0.032 * scale, 0.72 * scale, 0.005 * scale),
  ]);
  const trunk = new THREE.Mesh(
    new THREE.TubeGeometry(trunkCurve, 10, 0.032 * scale, 7, false),
    trunkMat
  );
  tree.add(trunk);

  const tierCount = 5;
  for (let tier = 0; tier < tierCount; tier++) {
    const tierFrac = tier / (tierCount - 1);
    const baseRadius = (0.23 - tier * 0.035) * scale;
    const tierHeight = (0.24 - tier * 0.022) * scale;
    const tierY = (0.18 + tier * 0.135) * scale;
    const spine = getSpineOffset(tierFrac);

    const tierGroup = new THREE.Group();
    tierGroup.position.set(spine.x, tierY, spine.z);
    tierGroup.rotation.z =
      spine.tiltZ +
      leanDir * (tier % 2 === 0 ? 1 : -1) * (0.05 + tierFrac * 0.04);

    // Fluted concave-skirt LatheGeometry foliage tier
    const tierCone = new THREE.Mesh(flutedTierGeo, pineMat);
    tierCone.scale.set(baseRadius, tierHeight, baseRadius);
    tierCone.castShadow = true;
    tierGroup.add(tierCone);

    // Ring of sculpted drooping branch-tip lobes around the lower hem of each tier
    const lobeCount = Math.max(6, 9 - tier);
    const lobeRadius = (0.042 - tier * 0.004) * scale;
    const lobeHeight = (0.095 - tier * 0.008) * scale;
    for (let l = 0; l < lobeCount; l++) {
      const lAngle = (l / lobeCount) * Math.PI * 2 + tier * 0.4;
      const radialDist = baseRadius * 0.92;
      const branchLobe = new THREE.Mesh(branchLobeGeo, pineMat);
      branchLobe.scale.set(lobeRadius, lobeHeight, lobeRadius);
      branchLobe.position.set(
        Math.cos(lAngle) * radialDist,
        -tierHeight * 0.28,
        Math.sin(lAngle) * radialDist
      );
      branchLobe.rotation.z = -Math.cos(lAngle) * 0.65;
      branchLobe.rotation.x = Math.sin(lAngle) * 0.65;
      tierGroup.add(branchLobe);
    }

    // Fluted snow mantle sitting cleanly on top of the tier (+0.015m above foliage)
    const snowCap = new THREE.Mesh(snowSkirtGeo, snowMat);
    snowCap.scale.set(baseRadius * 0.96, tierHeight * 0.85, baseRadius * 0.96);
    snowCap.position.set(0, tierHeight * 0.14, 0.008 * scale);
    tierGroup.add(snowCap);

    tree.add(tierGroup);
  }

  return tree;
}

type CliffLayerArchetype =
  | 'stepped-terrace'
  | 'overhanging-bluff'
  | 'fractured-buttress'
  | 'canyon-ridge';

interface ProceduralCliffLayerSpec {
  readonly side: -1 | 1;
  readonly archetype: CliffLayerArchetype;
  readonly seed: number;
  readonly outerEdgeAbsX: number;
  readonly innerEdgeAbsX: number;
  readonly height: number;
  readonly zPos: number;
  readonly extrudeDepth: number;
  readonly yawRad: number;
  readonly primaryRockMat: THREE.Material;
  readonly secondaryRockMat: THREE.Material;
  readonly underShadowMat: THREE.Material;
  readonly snowCapMat: THREE.Material;
  readonly contourInkMat: THREE.Material;
  readonly icicleMat: THREE.Material;
  readonly pineGreenMat: THREE.Material;
  readonly trunkMat: THREE.Material;
  readonly includePine?: boolean;
  readonly includeBaseSnow?: boolean;
  readonly includeMidSnowDripBand?: boolean;
}

/**
 * Generates a clean, non-clipping Seussian snow-cliff wing flat (`createProceduralStratifiedCliffWing`)
 * with heavy, wet dripping snow caps matching `model_1B_whoville.jpg`.
 */
function createProceduralStratifiedCliffWing(
  spec: ProceduralCliffLayerSpec
): THREE.Group {
  const {
    side,
    archetype,
    seed,
    outerEdgeAbsX,
    innerEdgeAbsX,
    height,
    zPos,
    extrudeDepth,
    yawRad,
    primaryRockMat,
    underShadowMat,
    snowCapMat,
    contourInkMat,
    icicleMat,
    pineGreenMat,
    trunkMat,
    includePine = false,
    includeBaseSnow = false,
    includeMidSnowDripBand = false,
  } = spec;

  const rng = createCliffRng(seed);
  const group = new THREE.Group();
  group.position.set(side * outerEdgeAbsX, 0, zPos);
  group.rotation.y = yawRad;

  const inwardSign: -1 | 1 = side === -1 ? 1 : -1;
  const totalSpanW = Math.max(0.85, outerEdgeAbsX - innerEdgeAbsX);

  const outerTopY = height * (0.95 + rng() * 0.05);
  const innerShoulderY =
    archetype === 'overhanging-bluff'
      ? height * (0.84 + rng() * 0.05)
      : archetype === 'canyon-ridge'
        ? height * (0.76 + rng() * 0.06)
        : height * (0.78 + rng() * 0.06);

  const topReachW =
    archetype === 'overhanging-bluff'
      ? totalSpanW * (0.94 + rng() * 0.04)
      : archetype === 'stepped-terrace'
        ? totalSpanW * (0.88 + rng() * 0.06)
        : totalSpanW * (0.9 + rng() * 0.06);

  const pts: Array<readonly [number, number]> = [];
  pts.push([-0.1 * (0.8 + rng() * 0.3), 0]);
  pts.push([-0.14 * (0.75 + rng() * 0.3), height * 0.45]);
  pts.push([-0.08 * (0.7 + rng() * 0.3), height * 0.78]);
  pts.push([0.04, outerTopY]);
  pts.push([topReachW, innerShoulderY]);

  // Smoothly tapered/stepped inner snow-cliff profile descending to the stage floor
  const midY = innerShoulderY * 0.56;
  const midU = Math.min(totalSpanW, topReachW + 0.08 + rng() * 0.08);
  const baseU = Math.min(totalSpanW, midU + 0.06 + rng() * 0.06);
  pts.push([midU, midY]);
  pts.push([baseU, 0]);

  const shape = new THREE.Shape();
  for (let i = 0; i < pts.length; i++) {
    const [u, y] = pts[i]!;
    const lx = u * inwardSign;
    if (i === 0) shape.moveTo(lx, y);
    else shape.lineTo(lx, y);
  }
  shape.closePath();

  const cliffGeo = new THREE.ExtrudeGeometry(shape, {
    depth: extrudeDepth,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.022,
    bevelThickness: 0.022,
  });
  cliffGeo.translate(0, 0, -extrudeDepth * 0.5);
  normalizeExtrudeUVs(cliffGeo, 'fit');
  cliffGeo.computeVertexNormals();

  const cliffMesh = new THREE.Mesh(cliffGeo, primaryRockMat);
  cliffMesh.castShadow = true;
  cliffMesh.receiveShadow = true;
  group.add(cliffMesh);

  // 2. Heavy, wet dripping snowpack blanket along the top plateau of the cliff
  const plateauWidth = Math.max(0.85, topReachW - 0.02);
  const topSlopeDelta = (innerShoulderY - outerTopY) * inwardSign;
  const topCornice = createCliffTopSnowPackCornice(
    plateauWidth * 1.03,
    0.52 + rng() * 0.12,
    extrudeDepth + 0.09,
    5 + (seed % 2),
    snowCapMat,
    underShadowMat,
    icicleMat,
    underShadowMat,
    contourInkMat,
    seed + 10,
    topSlopeDelta * 0.48
  );
  const topCenterU = (0.04 + topReachW) * 0.5;
  const topCenterY = (outerTopY + innerShoulderY) * 0.5 + 0.06;
  topCornice.position.set(inwardSign * topCenterU, topCenterY, 0.025);
  topCornice.rotation.z =
    Math.atan2(innerShoulderY - outerTopY, plateauWidth) * inwardSign * 0.52;
  group.add(topCornice);

  // 3. Optional second lower wet snow-drip band across the mid-upper cliff face (matching the double-drip front cliffs in `model_1B_whoville.jpg`!)
  if (includeMidSnowDripBand) {
    const midBandW = plateauWidth * 0.96;
    const midBand = createCliffTopSnowPackCornice(
      midBandW,
      0.56,
      extrudeDepth + 0.14,
      6,
      snowCapMat,
      underShadowMat,
      icicleMat,
      underShadowMat,
      contourInkMat,
      seed + 41,
      topSlopeDelta * 0.35
    );
    midBand.position.set(
      inwardSign * (topCenterU * 1.02),
      topCenterY - 0.86,
      0.045
    );
    midBand.rotation.z =
      Math.atan2(innerShoulderY - outerTopY, plateauWidth) * inwardSign * 0.4;
    group.add(midBand);
  }

  // 4. Optional crooked alpine spruce tree perched cleanly atop the snowpack shoulder
  if (includePine) {
    const pineScale = 0.84 + rng() * 0.2;
    const pine = createForcedPerspectiveWhovillePine(
      pineScale,
      pineGreenMat,
      snowCapMat,
      trunkMat,
      inwardSign
    );
    pine.position.set(
      inwardSign * (topReachW * (0.32 + rng() * 0.2)),
      topCenterY + 0.28,
      0.04
    );
    pine.rotation.z = inwardSign * (-0.05 - rng() * 0.06);
    group.add(pine);
  }

  // 5. Optional low stage-floor snowbank placed cleanly in front of the downstage cliff base
  if (includeBaseSnow) {
    const bankW = totalSpanW * (0.88 + rng() * 0.08);
    const bankShape = new THREE.Shape();
    bankShape.moveTo(0, 0);
    bankShape.lineTo(0, 0.36 + rng() * 0.08);
    bankShape.quadraticCurveTo(
      inwardSign * bankW * 0.5,
      0.32,
      inwardSign * bankW,
      0.12
    );
    bankShape.lineTo(inwardSign * (bankW + 0.06), 0);
    bankShape.closePath();

    const bankGeo = new THREE.ExtrudeGeometry(bankShape, {
      depth: 0.2,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    });
    normalizeExtrudeUVs(bankGeo, 'fit');
    bankGeo.computeVertexNormals();

    const bankMesh = new THREE.Mesh(bankGeo, snowCapMat);
    bankMesh.position.set(0, 0, extrudeDepth * 0.5 + 0.03);
    bankMesh.receiveShadow = true;
    group.add(bankMesh);
  }

  return group;
}

/**
 * Builds the iconic tall, inward-arching Overhanging Snow-Cliff Prows at the back
 * of the wings (`z = -3.38m` SR / `-3.42m` SL, directly behind the DSR & MSL Whoville
 * Houses, matching `model_1B_whoville.jpg`), complete with a rounded snowy hood,
 * wet dripping snow rim under the overhang, and striated glacier-blue shadow ribs.
 */
function createBackOverhangingSnowCliffProw(spec: {
  readonly side: -1 | 1;
  readonly seed: number;
  readonly outerEdgeAbsX: number;
  readonly baseInnerAbsX: number;
  readonly prowInnerAbsX: number;
  readonly height: number;
  readonly zPos: number;
  readonly extrudeDepth: number;
  readonly snowCliffMat: THREE.Material;
  readonly glacierUnderMat: THREE.Material;
  readonly snowCapMat: THREE.Material;
  readonly contourInkMat: THREE.Material;
}): THREE.Group {
  const {
    side,
    seed,
    outerEdgeAbsX,
    baseInnerAbsX,
    prowInnerAbsX,
    height,
    zPos,
    extrudeDepth,
    snowCliffMat,
    glacierUnderMat,
    snowCapMat,
    contourInkMat,
  } = spec;

  const rng = createCliffRng(seed);
  const group = new THREE.Group();
  group.position.set(side * outerEdgeAbsX, 0, zPos);

  const inwardSign: -1 | 1 = side === -1 ? 1 : -1;
  const baseSpanW = outerEdgeAbsX - baseInnerAbsX; // ~1.45m at floor
  const prowReachW = outerEdgeAbsX - prowInnerAbsX; // ~2.75m at overhanging top hood!

  // 1. Main sweeping cantilevered snow-cliff hood body (`snowCliffMat`)
  const hoodShape = new THREE.Shape();
  hoodShape.moveTo(0, 0);
  hoodShape.lineTo(0, height * (0.94 + rng() * 0.04));
  // Rounded upper snow-cliff crown sweeping inward to the overhanging prow tip
  hoodShape.bezierCurveTo(
    inwardSign * (prowReachW * 0.38),
    height * 1.02,
    inwardSign * (prowReachW * 0.82),
    height * 0.98,
    inwardSign * prowReachW,
    height * 0.87
  );
  // Rounded overhanging prow nose
  hoodShape.bezierCurveTo(
    inwardSign * (prowReachW * 1.04),
    height * 0.8,
    inwardSign * (prowReachW * 0.94),
    height * 0.72,
    inwardSign * (prowReachW * 0.76),
    height * 0.66
  );
  // Sweeping concave undercut curving back down to the offstage base behind the houses
  hoodShape.bezierCurveTo(
    inwardSign * (baseSpanW * 1.18),
    height * 0.52,
    inwardSign * (baseSpanW * 0.92),
    height * 0.28,
    inwardSign * baseSpanW,
    0
  );
  hoodShape.closePath();

  const hoodGeo = new THREE.ExtrudeGeometry(hoodShape, {
    depth: extrudeDepth,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.024,
    bevelThickness: 0.024,
  });
  hoodGeo.translate(0, 0, -extrudeDepth * 0.5);
  normalizeExtrudeUVs(hoodGeo, 'fit');
  hoodGeo.computeVertexNormals();

  const hoodMesh = new THREE.Mesh(hoodGeo, snowCliffMat);
  hoodMesh.castShadow = true;
  hoodMesh.receiveShadow = true;
  group.add(hoodMesh);

  // 2. Recessed glacier-blue striated shadow belly underneath the overhanging prow
  //    (matching the blue cross-hatched under-arch in `model_1B_whoville.jpg`!)
  const underBellShape = new THREE.Shape();
  underBellShape.moveTo(inwardSign * (prowReachW * 0.95), height * 0.79);
  underBellShape.bezierCurveTo(
    inwardSign * (prowReachW * 0.78),
    height * 0.72,
    inwardSign * (baseSpanW * 1.14),
    height * 0.54,
    inwardSign * (baseSpanW * 0.94),
    height * 0.24
  );
  underBellShape.lineTo(inwardSign * (baseSpanW * 0.74), height * 0.28);
  underBellShape.bezierCurveTo(
    inwardSign * (baseSpanW * 0.98),
    height * 0.56,
    inwardSign * (prowReachW * 0.62),
    height * 0.76,
    inwardSign * (prowReachW * 0.86),
    height * 0.83
  );
  underBellShape.closePath();

  const underBellGeo = new THREE.ExtrudeGeometry(underBellShape, {
    depth: extrudeDepth + 0.04,
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 1,
    bevelSize: 0.014,
    bevelThickness: 0.014,
  });
  underBellGeo.translate(0, 0, -extrudeDepth * 0.5 + 0.015);
  normalizeExtrudeUVs(underBellGeo, 'fit');
  underBellGeo.computeVertexNormals();

  const underBellMesh = new THREE.Mesh(underBellGeo, glacierUnderMat);
  group.add(underBellMesh);

  // 3. Wet scalloped dripping snow rim curving along the overhanging lip of the prow
  const dripRimPts: THREE.Vector3[] = [
    new THREE.Vector3(
      inwardSign * (prowReachW * 0.96),
      height * 0.82,
      extrudeDepth * 0.5 + 0.035
    ),
    new THREE.Vector3(
      inwardSign * (prowReachW * 0.72),
      height * 0.73,
      extrudeDepth * 0.5 + 0.035
    ),
    new THREE.Vector3(
      inwardSign * (baseSpanW * 1.15),
      height * 0.56,
      extrudeDepth * 0.5 + 0.035
    ),
    new THREE.Vector3(
      inwardSign * (baseSpanW * 0.96),
      height * 0.34,
      extrudeDepth * 0.5 + 0.035
    ),
  ];
  const dripRimCurve = new THREE.CatmullRomCurve3(dripRimPts);
  const dripRimTube = new THREE.Mesh(
    new THREE.TubeGeometry(dripRimCurve, 24, 0.068, 8, false),
    snowCapMat
  );
  dripRimTube.scale.set(1.0, 1.15, 0.55);
  group.add(dripRimTube);

  // Rounded wet snow-melt drops & Seussian ink striation ribs along the underside of the overhang
  const dripLobeCount = 9;
  for (let i = 0; i < dripLobeCount; i++) {
    const t = (i + 0.5) / dripLobeCount;
    const pt = dripRimCurve.getPoint(t);
    const dripH = 0.16 + ((i * 3 + seed) % 3) * 0.07;

    const wetDrop = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 10, 8),
      snowCapMat
    );
    wetDrop.scale.set(0.85, dripH / 0.065, 0.45);
    wetDrop.position.set(pt.x, pt.y - dripH * 0.45, pt.z);
    wetDrop.rotation.z = inwardSign * 0.22;
    group.add(wetDrop);

    const hatchRib = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.01, 0.26, 6),
      contourInkMat
    );
    hatchRib.position.set(
      pt.x + inwardSign * 0.08,
      pt.y - 0.14,
      extrudeDepth * 0.5 + 0.045
    );
    hatchRib.rotation.z = inwardSign * -0.58;
    group.add(hatchRib);
  }

  return group;
}

/**
 * 1. DOWNSTAGE LEFT & RIGHT SNOW CLIFF PORTALS & BACK OVERHANGING CLIFF PROWS
 *    (`'grinch-snow-portals'`, matching `model_1B_whoville.jpg`):
 *    - **Layer 1 (Front Proscenium Snow Cliffs at `z = +0.26m` SR / `+0.21m` SL)**:
 *      Tall snow cliffs framing the front of the stage with heavy, rounded "wet"
 *      snow-melt drips cascading down the cliff face.
 *    - **Layer 2 (Stepped-Down Mid-Downstage Snow-Cliff Shoulder at `z = -0.92m` / `-0.98m`)**:
 *      Steps down lower (`height ≈ 3.15m–3.25m`) and stays wide (`|x| >= 4.28m`) so
 *      when the stage opens it never crowds the scene or clips any wagons.
 *    - **Layer 3 (Back Overhanging Cantilevered Snow-Cliff Prows at `z = -3.38m` / `-3.42m`)**:
 *      Seated cleanly behind the DSR & MSL Whoville Houses, sweeping upward and
 *      curving inward at the top (`height ≈ 4.65m`) with a rounded snowy hood and
 *      wet dripping snow underside just like `model_1B_whoville.jpg`!
 */
export function buildGrinchSnowPortals(
  _rockTex: THREE.CanvasTexture
): THREE.Group {
  const portalsGroup = new THREE.Group();
  portalsGroup.name = 'Element_grinch-snow-portals';

  const papierMacheNormalTex = createPapierMacheNormalTexture();
  const seussianRockNormalTex = createSeussianRockNormalTexture();
  const mountainCliffTex = createSnowMountainCliffTexture();
  const glacierWaveTex = createGlacierWavePortalTexture();

  // Snowy pale blue-lavender cliff wall material matching `model_1B_whoville.jpg`
  const rockCliffMat = new THREE.MeshStandardMaterial({
    map: mountainCliffTex,
    normalMap: papierMacheNormalTex,
    normalScale: new THREE.Vector2(0.24, 0.24),
    color: 0xb6c6d8,
    roughness: 0.62,
    metalness: 0.03,
  });

  // Midstage cool periwinkle-snow cliff material
  const rockOchreFacetMat = new THREE.MeshStandardMaterial({
    map: mountainCliffTex,
    normalMap: papierMacheNormalTex,
    normalScale: new THREE.Vector2(0.22, 0.22),
    color: 0xa6bbd4,
    roughness: 0.64,
    metalness: 0.03,
  });

  // Back overhanging snow-cliff hood material
  const rockDeepCanyonMat = new THREE.MeshStandardMaterial({
    map: mountainCliffTex,
    normalMap: papierMacheNormalTex,
    normalScale: new THREE.Vector2(0.22, 0.22),
    color: 0x9cb4d0,
    roughness: 0.64,
    metalness: 0.03,
  });

  // Recessed glacier-blue striated underside material for the back overhanging cliff prows
  const glacierUnderMat = new THREE.MeshStandardMaterial({
    map: glacierWaveTex,
    normalMap: seussianRockNormalTex,
    normalScale: new THREE.Vector2(0.28, 0.28),
    color: 0x6894c8,
    roughness: 0.62,
    metalness: 0.04,
  });

  // Clean frost-white snowpack material for the wet dripping snow caps (channel <= 0xd8)
  const snowCapMat = new THREE.MeshStandardMaterial({
    map: mountainCliffTex,
    normalMap: papierMacheNormalTex,
    normalScale: new THREE.Vector2(0.2, 0.2),
    color: 0xcfd6dc,
    roughness: 0.54,
    metalness: 0.03,
  });

  const rockShadowCreviceMat = new THREE.MeshStandardMaterial({
    map: glacierWaveTex,
    normalMap: seussianRockNormalTex,
    normalScale: new THREE.Vector2(0.28, 0.28),
    color: 0x4c6e9c,
    roughness: 0.7,
    metalness: 0.04,
  });

  const underShadowMat = new THREE.MeshStandardMaterial({
    normalMap: seussianRockNormalTex,
    normalScale: new THREE.Vector2(0.24, 0.24),
    color: 0x283a56,
    roughness: 0.76,
    metalness: 0.04,
  });

  const contourInkMat = new THREE.MeshStandardMaterial({
    color: 0x182232,
    roughness: 0.78,
    metalness: 0.02,
  });

  const icicleMat = new THREE.MeshStandardMaterial({
    color: 0xc0d2dc,
    roughness: 0.52,
    metalness: 0.08,
  });

  const pineGreenMat = new THREE.MeshStandardMaterial({
    color: 0x2c6c4a,
    roughness: 0.65,
    metalness: 0.03,
  });

  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x4a382b,
    roughness: 0.75,
  });

  // ==========================================================================
  // 1. FRONT PROSCENIUM SNOW CLIFFS WITH DOUBLE-TIERED WET DRIPPING SNOW
  //    (Layer 1 on DSR & DSL, in front of Pre-Show Scrim at z = +0.26m / +0.21m)
  // ==========================================================================
  for (const side of [-1, 1] as const) {
    const cliffComplex = new THREE.Group();
    cliffComplex.name = side === -1 ? 'SnowPortal_DSR' : 'SnowPortal_DSL';
    cliffComplex.userData.subUnitId =
      side === -1 ? 'grinch-portal-dsr-cliff' : 'grinch-portal-dsl-cliff';

    const layer1 = createProceduralStratifiedCliffWing({
      side,
      archetype: side === -1 ? 'stepped-terrace' : 'fractured-buttress',
      seed: side === -1 ? 109 : 227,
      outerEdgeAbsX: side === -1 ? 5.82 : 5.76,
      innerEdgeAbsX: side === -1 ? 3.88 : 3.94,
      height: side === -1 ? 3.98 : 4.08,
      zPos: side === -1 ? 0.26 : 0.21,
      extrudeDepth: 0.34,
      yawRad: side * -0.05,
      primaryRockMat: rockCliffMat,
      secondaryRockMat: rockOchreFacetMat,
      underShadowMat,
      snowCapMat,
      contourInkMat,
      icicleMat,
      pineGreenMat,
      trunkMat,
      includePine: false,
      includeBaseSnow: true,
      includeMidSnowDripBand: true,
    });
    cliffComplex.add(layer1);

    portalsGroup.add(cliffComplex);
  }

  // ==========================================================================
  // 2. STEPPED-DOWN MIDSTAGE SNOW SHOULDER (Layer 2) & BACK OVERHANGING
  //    SNOW-CLIFF PROWS (Layer 3 at z = -3.38m / -3.42m behind the Whoville Houses)
  // ==========================================================================
  const wingWavesGroup = new THREE.Group();
  wingWavesGroup.name = 'SnowPortal_WingWaves';
  wingWavesGroup.userData.subUnitId = 'grinch-portal-wing-waves';

  for (const side of [-1, 1] as const) {
    // Layer 2: Shorter, stepped-down snow-cliff shoulder (z = -0.92m SR / -0.98m SL)
    // Steps down from Layer 1 (`height ≈ 3.16m / 3.24m`) and stays wide (`|x| >= 4.28m`)
    const layer2 = createProceduralStratifiedCliffWing({
      side,
      archetype: 'canyon-ridge',
      seed: side === -1 ? 347 : 463,
      outerEdgeAbsX: side === -1 ? 5.84 : 5.86,
      innerEdgeAbsX: side === -1 ? 4.28 : 4.34,
      height: side === -1 ? 3.16 : 3.24,
      zPos: side === -1 ? -0.92 : -0.98,
      extrudeDepth: 0.26,
      yawRad: side * -0.03,
      primaryRockMat: rockOchreFacetMat,
      secondaryRockMat: rockShadowCreviceMat,
      underShadowMat,
      snowCapMat,
      contourInkMat,
      icicleMat,
      pineGreenMat,
      trunkMat,
      includePine: false,
      includeBaseSnow: false,
      includeMidSnowDripBand: false,
    });
    wingWavesGroup.add(layer2);

    // Layer 3: Iconic Back Overhanging Cantilevered Snow-Cliff Prows (z = -3.38m SR / -3.42m SL)
    // Seated cleanly behind the DSR & MSL Whoville Houses just like `model_1B_whoville.jpg`!
    const layer3BackProw = createBackOverhangingSnowCliffProw({
      side,
      seed: side === -1 ? 587 : 691,
      outerEdgeAbsX: side === -1 ? 5.88 : 5.9,
      baseInnerAbsX: side === -1 ? 4.38 : 4.42,
      prowInnerAbsX: side === -1 ? 3.08 : 3.14,
      height: side === -1 ? 4.62 : 4.72,
      zPos: side === -1 ? -3.38 : -3.42,
      extrudeDepth: 0.22,
      snowCliffMat: rockDeepCanyonMat,
      glacierUnderMat,
      snowCapMat,
      contourInkMat,
    });
    wingWavesGroup.add(layer3BackProw);
  }

  portalsGroup.add(wingWavesGroup);

  return portalsGroup;
}


/**
 * 2. LINESET #1 (0'-10") PRE-SHOW STORYBOOK SCRIM
 *    (`'grinch-preshow-scrim'`)
 *    9.4m × 6.6m translucent storybook scrim plane (`x ∈ [-4.7m, +4.7m]` at
 *    `z = -0.35m`, with dark velour masking wing borders extending to `±6.0m`
 *    behind the downstage snow towers), top batten pipe, rigging hanger clamps,
 *    bottom weighted pocket pipe, and vertical side hems.
 */
export function buildGrinchPreShowScrim(
  preshowScrimTex: THREE.CanvasTexture
): THREE.Group {
  const preshowScrimGroup = new THREE.Group();
  preshowScrimGroup.name = 'Element_grinch-preshow-scrim';

  const scrimWidth = 9.4;
  const fullBattenWidth = 11.8;
  const scrimHeight = 6.6;
  const scrimZ = -0.35;

  // Main translucent storybook scrim plane (x ∈ [-4.7m, +4.7m], y = 3.3m, z = -0.35m)
  const scrimMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(scrimWidth, scrimHeight),
    new THREE.MeshStandardMaterial({
      map: preshowScrimTex,
      transparent: true,
      opacity: 0.9,
      roughness: 0.68,
      emissive: 0x241a46,
      emissiveIntensity: 0.18,
    })
  );
  scrimMesh.position.set(0, scrimHeight * 0.5, scrimZ);
  preshowScrimGroup.add(scrimMesh);

  // Shared hardware & fabric border materials (max RGB channel <= 0xd8)
  const steelPipeMat = new THREE.MeshStandardMaterial({
    color: 0x2b3038,
    roughness: 0.55,
    metalness: 0.65,
  });
  const clampMat = new THREE.MeshStandardMaterial({
    color: 0x464e5a,
    roughness: 0.55,
    metalness: 0.72,
  });
  const hemFabricMat = new THREE.MeshStandardMaterial({
    color: 0x242038,
    roughness: 0.78,
    metalness: 0.04,
  });
  const wingMaskingMat = new THREE.MeshStandardMaterial({
    color: 0x161422,
    roughness: 0.88,
    metalness: 0.02,
  });

  // Black velour side masking borders behind the downstage snow-cliff towers (z = scrimZ - 0.035m)
  for (const side of [-1, 1] as const) {
    const maskingWing = new THREE.Mesh(
      new THREE.PlaneGeometry(1.3, scrimHeight),
      wingMaskingMat
    );
    maskingWing.position.set(
      side * (scrimWidth * 0.5 + 0.62),
      scrimHeight * 0.5,
      scrimZ - 0.035
    );
    preshowScrimGroup.add(maskingWing);
  }

  // Top schedule-40 steel batten pipe at y = 6.62m
  const topBattenPipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.032, fullBattenWidth + 0.4, 14),
    steelPipeMat
  );
  topBattenPipe.rotation.z = Math.PI * 0.5;
  topBattenPipe.position.set(0, scrimHeight + 0.02, scrimZ - 0.04);
  topBattenPipe.castShadow = true;
  preshowScrimGroup.add(topBattenPipe);

  // Top grommet tie-line header sleeve (staggered at z = scrimZ + 0.03m)
  const topHeaderHem = new THREE.Mesh(
    new THREE.BoxGeometry(scrimWidth, 0.09, 0.018),
    hemFabricMat
  );
  topHeaderHem.position.set(0, scrimHeight - 0.045, scrimZ + 0.03);
  preshowScrimGroup.add(topHeaderHem);

  // Rigging hanger clamps & wire rope drops spaced across Lineset #1 batten
  for (const clampX of [-5.4, -3.6, -1.8, 0, 1.8, 3.6, 5.4]) {
    const clampBracket = new THREE.Mesh(
      new RoundedBoxGeometry(0.09, 0.14, 0.09, 2, 0.015),
      clampMat
    );
    clampBracket.position.set(clampX, scrimHeight + 0.05, scrimZ - 0.04);
    preshowScrimGroup.add(clampBracket);

    const wireDrop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.006, 0.006, 1.8, 6),
      clampMat
    );
    wireDrop.position.set(clampX, scrimHeight + 0.95, scrimZ - 0.04);
    preshowScrimGroup.add(wireDrop);
  }

  // Bottom weighted chain/pipe pocket at y = 0.035m (staggered at z = scrimZ - 0.04m)
  const bottomPocketPipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.026, 0.026, scrimWidth + 0.12, 12),
    steelPipeMat
  );
  bottomPocketPipe.rotation.z = Math.PI * 0.5;
  bottomPocketPipe.position.set(0, 0.035, scrimZ - 0.04);
  preshowScrimGroup.add(bottomPocketPipe);

  const bottomPocketSleeve = new THREE.Mesh(
    new RoundedBoxGeometry(scrimWidth, 0.11, 0.024, 2, 0.01),
    hemFabricMat
  );
  bottomPocketSleeve.position.set(0, 0.055, scrimZ + 0.03);
  preshowScrimGroup.add(bottomPocketSleeve);

  // Subtle vertical reinforced fabric side hems framing the 9.4m scrim opening (z = scrimZ + 0.032m)
  for (const side of [-1, 1] as const) {
    const sideHem = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, scrimHeight, 0.016),
      hemFabricMat
    );
    sideHem.position.set(
      side * (scrimWidth * 0.5 - 0.055),
      scrimHeight * 0.5,
      scrimZ + 0.032
    );
    preshowScrimGroup.add(sideHem);
  }

  // Scene cue 1A toggles the pre-show scrim on; hidden by default
  preshowScrimGroup.visible = false;

  return preshowScrimGroup;
}

/**
 * Helper to build a miniature crooked Seussian lamp-post along the distant
 * hill path ribbons.
 */
function createMiniatureCrookedLampPost(
  scale: number,
  leanDir: -1 | 1,
  postMat: THREE.Material,
  lanternGlowMat: THREE.Material
): THREE.Group {
  const lamp = new THREE.Group();

  const curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(leanDir * 0.05 * scale, 0.18 * scale, 0),
    new THREE.Vector3(leanDir * -0.07 * scale, 0.36 * scale, 0),
    new THREE.Vector3(leanDir * 0.08 * scale, 0.52 * scale, 0)
  );
  const poleGeo = new THREE.TubeGeometry(curve, 12, 0.018 * scale, 7, false);
  const pole = new THREE.Mesh(poleGeo, postMat);
  lamp.add(pole);

  const lantern = new THREE.Mesh(
    new THREE.SphereGeometry(0.05 * scale, 10, 8),
    lanternGlowMat
  );
  lantern.position.set(leanDir * 0.08 * scale, 0.55 * scale, 0.01 * scale);
  lamp.add(lantern);

  return lamp;
}

/**
 * Helper to build a sculpted 3D papier-mâché Seussian hill layer at a dedicated
 * Z plane with vertex-displaced snow-pillow relief, a 3D `TubeGeometry` snow-drift
 * ridge crest, and a dark Seussian charcoal contour outline.
 */
function createSeussianHillLayer(
  points: ReadonlyArray<readonly [number, number]>,
  depth: number,
  zPlane: number,
  hillMat: THREE.Material,
  snowCrestMat: THREE.Material,
  contourInkMat: THREE.Material,
  _seed = 1
): THREE.Group {
  const layerGroup = new THREE.Group();
  layerGroup.position.z = zPlane;

  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], 0);
  shape.lineTo(points[0][0], points[0][1]);

  const ridgeCurvePts: THREE.Vector3[] = [
    new THREE.Vector3(points[0][0], points[0][1], depth * 0.65),
  ];

  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const midX = (x0 + x1) * 0.5;
    const ctrlY = Math.max(y0, y1) + 0.24;
    shape.quadraticCurveTo(midX, ctrlY, x1, y1);

    ridgeCurvePts.push(new THREE.Vector3(midX, ctrlY - 0.06, depth * 0.72));
    ridgeCurvePts.push(new THREE.Vector3(x1, y1, depth * 0.65));
  }
  shape.lineTo(points[points.length - 1][0], 0);
  shape.closePath();

  const hillGeo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.04,
    bevelThickness: 0.04,
  });
  normalizeExtrudeUVs(hillGeo, 'world', 4.5);
  hillGeo.computeVertexNormals();

  const hillMesh = new THREE.Mesh(hillGeo, hillMat);
  hillMesh.castShadow = true;
  hillMesh.receiveShadow = true;
  layerGroup.add(hillMesh);

  // 3D TubeGeometry snow-cap ridge along the upper hill silhouette
  if (ridgeCurvePts.length >= 3) {
    const ridgeCurve = new THREE.CatmullRomCurve3(ridgeCurvePts);
    const snowRidgeTube = new THREE.Mesh(
      new THREE.TubeGeometry(ridgeCurve, 44, 0.11, 8, false),
      snowCrestMat
    );
    snowRidgeTube.scale.set(1, 0.85, 0.65);
    snowRidgeTube.castShadow = true;
    layerGroup.add(snowRidgeTube);

    // Crisp 3D Seussian charcoal ink border tracing the hill crest
    const inkRidgeTube = new THREE.Mesh(
      new THREE.TubeGeometry(ridgeCurve, 44, 0.026, 6, false),
      contourInkMat
    );
    inkRidgeTube.position.set(0, 0.075, -0.04);
    layerGroup.add(inkRidgeTube);
  }

  // Dark Seussian ink outline rim tucked just behind the hill profile (staggered at z = -0.045m)
  const outlineMesh = new THREE.Mesh(hillGeo, contourInkMat);
  outlineMesh.scale.set(1.012, 1.024, 0.55);
  outlineMesh.position.set(0, 0.022, -0.045);
  layerGroup.add(outlineMesh);

  return layerGroup;
}

/**
 * 3. UPSTAGE WHOVILLE SNOW HILLS & MT. CRUMPIT PEAK (Lineset #39 / #45)
 *    (`'grinch-whoville-hills-cyc'`)
 */
export function buildGrinchWhovilleHillsAndCrumpit(
  _rockTex: THREE.CanvasTexture
): THREE.Group {
  const hillsGroup = new THREE.Group();
  hillsGroup.name = 'Element_grinch-whoville-hills-cyc';

  const papierMacheNormalTex = createPapierMacheNormalTexture();
  const seussianRockNormalTex = createSeussianRockNormalTexture();
  const mountainCliffTex = createSnowMountainCliffTexture();
  const glacierWaveTex = createGlacierWavePortalTexture();

  // Toned-down Seussian papier-mâché snow & lavender-blue hill palette with tangent-space normalMap
  const fgHillMat = new THREE.MeshStandardMaterial({
    map: mountainCliffTex,
    normalMap: papierMacheNormalTex,
    normalScale: new THREE.Vector2(0.28, 0.28),
    color: 0xaabed8,
    roughness: 0.6,
    metalness: 0.03,
  });
  const midHillMat = new THREE.MeshStandardMaterial({
    map: mountainCliffTex,
    normalMap: papierMacheNormalTex,
    normalScale: new THREE.Vector2(0.26, 0.26),
    color: 0x9ab2d4,
    roughness: 0.62,
    metalness: 0.03,
  });
  const bgHillMat = new THREE.MeshStandardMaterial({
    map: mountainCliffTex,
    normalMap: papierMacheNormalTex,
    normalScale: new THREE.Vector2(0.24, 0.24),
    color: 0x8ca4ca,
    roughness: 0.64,
    metalness: 0.04,
  });
  const snowCrestMat = new THREE.MeshStandardMaterial({
    map: mountainCliffTex,
    normalMap: papierMacheNormalTex,
    normalScale: new THREE.Vector2(0.25, 0.25),
    color: 0xc4d2d8,
    roughness: 0.56,
    metalness: 0.03,
  });
  const pathRibbonMat = new THREE.MeshStandardMaterial({
    normalMap: papierMacheNormalTex,
    normalScale: new THREE.Vector2(0.22, 0.22),
    color: 0xbaccd8,
    roughness: 0.58,
    metalness: 0.03,
  });
  const iceArcadeMat = new THREE.MeshStandardMaterial({
    map: glacierWaveTex,
    normalMap: seussianRockNormalTex,
    normalScale: new THREE.Vector2(0.3, 0.3),
    color: 0x6c96c8,
    roughness: 0.58,
    metalness: 0.05,
  });
  const jaggedRockTex = createJaggedRockCliffFaceTexture();
  const crumpitBodyMat = new THREE.MeshStandardMaterial({
    map: jaggedRockTex,
    normalMap: seussianRockNormalTex,
    normalScale: new THREE.Vector2(0.4, 0.4),
    color: 0x6a7688,
    roughness: 0.72,
    metalness: 0.05,
    flatShading: true,
  });
  const crumpitShadowCliffMat = new THREE.MeshStandardMaterial({
    map: jaggedRockTex,
    normalMap: seussianRockNormalTex,
    normalScale: new THREE.Vector2(0.36, 0.36),
    color: 0x48566c,
    roughness: 0.76,
    metalness: 0.05,
    flatShading: true,
  });
  const contourInkMat = new THREE.MeshStandardMaterial({
    color: 0x24344c,
    roughness: 0.72,
    metalness: 0.02,
  });
  const pineGreenMat = new THREE.MeshStandardMaterial({
    color: 0x2e6e4c,
    roughness: 0.65,
    metalness: 0.03,
  });
  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x4a382b,
    roughness: 0.75,
  });
  const lanternGlowMat = new THREE.MeshStandardMaterial({
    color: 0xd8c278,
    emissive: 0xc89632,
    emissiveIntensity: 0.68,
    roughness: 0.55,
  });

  // --------------------------------------------------------------------------
  // A. Foreground Groundrow Layer (z = -5.9m)
  // --------------------------------------------------------------------------
  const fgLayer = createSeussianHillLayer(
    [
      [-5.8, 0.68],
      [-3.85, 1.22],
      [-1.95, 0.82],
      [-0.25, 1.12],
      [1.45, 1.36],
      [3.25, 0.88],
      [5.8, 1.15],
    ],
    0.2,
    -5.9,
    fgHillMat,
    snowCrestMat,
    contourInkMat,
    1
  );

  // Scalloped blue ice-cave arches along the center-right foreground hill (matching model_1B & 1F)
  for (let i = 0; i < 6; i++) {
    const archX = -0.05 + i * 0.31;
    const archHeight = 0.28 + (i === 2 || i === 3 ? 0.07 : 0);
    const archMesh = new THREE.Mesh(
      new RoundedBoxGeometry(0.19, archHeight, 0.09, 3, 0.06),
      iceArcadeMat
    );
    archMesh.position.set(archX, 0.56 + Math.sin(i * 0.65) * 0.05, 0.21);
    fgLayer.add(archMesh);
  }

  // Winding snowy path ribbon across the foreground hill (staggered at local z = +0.23m)
  const fgPathCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.6, 0.18, 0.23),
    new THREE.Vector3(-1.4, 0.54, 0.23),
    new THREE.Vector3(-0.1, 0.85, 0.23),
    new THREE.Vector3(1.15, 1.1, 0.23),
  ]);
  const fgPathMesh = new THREE.Mesh(
    new THREE.TubeGeometry(fgPathCurve, 28, 0.08, 6, false),
    pathRibbonMat
  );
  fgPathMesh.scale.set(1, 0.45, 0.35);
  fgLayer.add(fgPathMesh);

  // Miniature crooked lamp-posts and forced-perspective pines on the foreground ridge
  for (const [px, py, scale, lean] of [
    [-3.6, 1.24, 1.02, 1],
    [-2.45, 0.96, 0.9, -1],
    [1.15, 1.38, 0.96, -1],
    [1.68, 1.3, 0.88, 1],
  ] as const) {
    const pine = createForcedPerspectiveWhovillePine(
      scale,
      pineGreenMat,
      snowCrestMat,
      trunkMat,
      lean
    );
    pine.position.set(px, py, 0.12);
    fgLayer.add(pine);

    const lamp = createMiniatureCrookedLampPost(
      scale * 0.86,
      lean,
      contourInkMat,
      lanternGlowMat
    );
    lamp.position.set(px + 0.22 * lean, py - 0.03, 0.16);
    fgLayer.add(lamp);
  }

  hillsGroup.add(fgLayer);

  // --------------------------------------------------------------------------
  // B. Midground Rolling Seussian Hills Layer (z = -6.4m)
  // --------------------------------------------------------------------------
  const midLayer = createSeussianHillLayer(
    [
      [-6.0, 1.38],
      [-4.1, 1.92],
      [-2.1, 1.36],
      [0.45, 1.82],
      [2.65, 2.08],
      [4.45, 1.52],
      [6.0, 1.76],
    ],
    0.2,
    -6.4,
    midHillMat,
    snowCrestMat,
    contourInkMat,
    2
  );

  // Winding snowy path ribbon climbing the midground hill (staggered at local z = +0.23m)
  const midPathCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.3, 0.96, 0.23),
    new THREE.Vector3(1.25, 1.4, 0.23),
    new THREE.Vector3(2.15, 1.8, 0.23),
    new THREE.Vector3(2.85, 2.02, 0.23),
  ]);
  const midPathMesh = new THREE.Mesh(
    new THREE.TubeGeometry(midPathCurve, 24, 0.068, 6, false),
    pathRibbonMat
  );
  midPathMesh.scale.set(1, 0.45, 0.35);
  midLayer.add(midPathMesh);

  for (const [px, py, scale, lean] of [
    [-4.05, 1.94, 0.84, -1],
    [0.58, 1.84, 0.8, 1],
    [1.65, 1.92, 0.72, -1],
    [2.52, 2.1, 0.76, -1],
  ] as const) {
    const pine = createForcedPerspectiveWhovillePine(
      scale,
      pineGreenMat,
      snowCrestMat,
      trunkMat,
      lean
    );
    pine.position.set(px, py, 0.11);
    midLayer.add(pine);

    const lamp = createMiniatureCrookedLampPost(
      scale * 0.82,
      lean,
      contourInkMat,
      lanternGlowMat
    );
    lamp.position.set(px - 0.19 * lean, py - 0.02, 0.15);
    midLayer.add(lamp);
  }

  hillsGroup.add(midLayer);

  // --------------------------------------------------------------------------
  // C. Upstage Distant Seussian Foothills Layer (z = -6.9m)
  // --------------------------------------------------------------------------
  const bgLayer = createSeussianHillLayer(
    [
      [-6.3, 1.98],
      [-3.5, 2.68],
      [-1.1, 2.42],
      [1.35, 2.28],
      [3.65, 2.56],
      [6.3, 2.08],
    ],
    0.2,
    -6.9,
    bgHillMat,
    snowCrestMat,
    contourInkMat,
    3
  );

  for (const [px, py, scale, lean] of [
    [-3.45, 2.7, 0.66, 1],
    [-2.95, 2.58, 0.58, -1],
    [3.15, 2.48, 0.56, 1],
    [3.55, 2.58, 0.64, -1],
  ] as const) {
    const pine = createForcedPerspectiveWhovillePine(
      scale,
      pineGreenMat,
      snowCrestMat,
      trunkMat,
      lean
    );
    pine.position.set(px, py, 0.11);
    bgLayer.add(pine);
  }

  hillsGroup.add(bgLayer);

  // --------------------------------------------------------------------------
  // D. Towering Jagged Faceted Rock Horn of Mt. Crumpit with Snowpack Spine (z = -7.25m)
  // --------------------------------------------------------------------------
  const crumpitGroup = new THREE.Group();
  crumpitGroup.name = 'MtCrumpit_PeakUnit';
  crumpitGroup.position.set(0, 0, -7.25);

  const crumpitShape = new THREE.Shape();
  crumpitShape.moveTo(-3.75, 0);
  crumpitShape.lineTo(-3.12, 1.58);
  crumpitShape.lineTo(-2.38, 2.42);
  crumpitShape.lineTo(-1.58, 2.94);
  crumpitShape.lineTo(-0.88, 3.52);
  crumpitShape.lineTo(-0.34, 4.38);
  crumpitShape.lineTo(0.18, 5.06);
  crumpitShape.lineTo(0.74, 5.14); // Sharp overhanging summit crag
  crumpitShape.lineTo(0.98, 4.86);
  crumpitShape.lineTo(0.68, 4.38); // Undercut sheer cliff notch
  crumpitShape.lineTo(0.84, 4.18);
  crumpitShape.lineTo(0.56, 3.68);
  crumpitShape.lineTo(0.72, 3.48);
  crumpitShape.lineTo(0.46, 2.88);
  crumpitShape.lineTo(0.84, 1.48);
  crumpitShape.lineTo(1.08, 0);
  crumpitShape.closePath();

  const crumpitGeo = new THREE.ExtrudeGeometry(crumpitShape, {
    depth: 0.3,
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 1,
    bevelSize: 0.02,
    bevelThickness: 0.02,
  });

  // Pull central arrête ridge forward in Z for sharp planar rock facets
  const cPos = crumpitGeo.attributes.position;
  for (let i = 0; i < cPos.count; i++) {
    const vx = cPos.getX(i);
    const vy = cPos.getY(i);
    const vz = cPos.getZ(i);
    if (vz > 0.14) {
      const ridgeX = -1.6 + (vy / 5.14) * 2.1;
      const dist = Math.abs(vx - ridgeX);
      const arrete = Math.max(0, 1.0 - dist / 1.4) * 0.12;
      cPos.setZ(i, vz + arrete);
    }
  }
  normalizeExtrudeUVs(crumpitGeo, 'fit');
  crumpitGeo.computeVertexNormals();

  const crumpitMesh = new THREE.Mesh(crumpitGeo, crumpitBodyMat);
  crumpitMesh.castShadow = true;
  crumpitMesh.receiveShadow = true;
  crumpitGroup.add(crumpitMesh);

  // Wind-swept white snowpack slope along Mt. Crumpit's left windward ridge
  const snowSpineShape = new THREE.Shape();
  snowSpineShape.moveTo(-2.95, 1.72);
  snowSpineShape.lineTo(-2.34, 2.46);
  snowSpineShape.lineTo(-1.54, 2.98);
  snowSpineShape.lineTo(-0.84, 3.56);
  snowSpineShape.lineTo(-0.3, 4.42);
  snowSpineShape.lineTo(0.2, 5.08);
  snowSpineShape.lineTo(0.45, 4.78);
  snowSpineShape.lineTo(-0.12, 4.12);
  snowSpineShape.lineTo(-0.68, 3.28);
  snowSpineShape.lineTo(-1.42, 2.68);
  snowSpineShape.lineTo(-2.22, 2.18);
  snowSpineShape.closePath();

  const snowSpineGeo = new THREE.ExtrudeGeometry(snowSpineShape, {
    depth: 0.16,
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 1,
    bevelSize: 0.014,
    bevelThickness: 0.014,
  });
  normalizeExtrudeUVs(snowSpineGeo, 'fit');
  snowSpineGeo.computeVertexNormals();

  const snowSpineMesh = new THREE.Mesh(snowSpineGeo, snowCrestMat);
  snowSpineMesh.position.set(0, 0, 0.22);
  snowSpineMesh.castShadow = true;
  crumpitGroup.add(snowSpineMesh);

  // Sleek overhanging summit snowpack cornice crowning the peak at (x = 0.44, y = 4.96, z = +0.26m)
  const summitSnowCap = createCliffTopSnowPackCornice(
    1.18,
    0.34,
    0.28,
    4,
    snowCrestMat,
    crumpitShadowCliffMat,
    snowCrestMat,
    crumpitShadowCliffMat,
    contourInkMat,
    9,
    -0.12
  );
  summitSnowCap.position.set(0.44, 4.96, 0.26);
  summitSnowCap.rotation.z = -0.22;
  crumpitGroup.add(summitSnowCap);

  // Secondary wet dripping snow ledge along the right cliff overhang of Mt. Crumpit
  const crumpitOverhangSnow = createCliffTopSnowPackCornice(
    0.84,
    0.32,
    0.24,
    4,
    snowCrestMat,
    crumpitShadowCliffMat,
    snowCrestMat,
    crumpitShadowCliffMat,
    contourInkMat,
    17,
    0.16
  );
  crumpitOverhangSnow.position.set(0.68, 4.22, 0.22);
  crumpitOverhangSnow.rotation.z = 0.28;
  crumpitGroup.add(crumpitOverhangSnow);

  // Angular faceted rock strata ledges jutting from Mt. Crumpit's cliff face
  for (const [lx, ly, wx, hy, dz, lean, seedOff] of [
    [-1.48, 2.62, 0.84, 0.24, 0.18, 0.12, 91],
    [-0.58, 3.35, 0.72, 0.22, 0.18, 0.16, 92],
    [-0.06, 4.18, 0.62, 0.2, 0.16, 0.14, 93],
    [0.24, 3.52, 0.56, 0.18, 0.16, -0.1, 94],
  ] as const) {
    const cragLedge = createJaggedRockShardBlock(
      wx,
      hy,
      dz,
      crumpitShadowCliffMat,
      seedOff,
      lean
    );
    cragLedge.position.set(lx, ly, 0.26);
    crumpitGroup.add(cragLedge);
  }

  // Winding "Dump-It-To-Crumpit" sleigh trail ribbon spiraling up toward the summit (z = +0.34m)
  const crumpitTrailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.18, 2.25, 0.34),
    new THREE.Vector3(-1.18, 2.78, 0.35),
    new THREE.Vector3(-0.36, 3.48, 0.36),
    new THREE.Vector3(0.18, 4.28, 0.35),
    new THREE.Vector3(0.42, 4.7, 0.34),
  ]);
  const crumpitTrail = new THREE.Mesh(
    new THREE.TubeGeometry(crumpitTrailCurve, 32, 0.056, 6, false),
    pathRibbonMat
  );
  crumpitTrail.scale.set(1, 0.55, 0.4);
  crumpitGroup.add(crumpitTrail);

  // Miniature glowing trail lanterns & crooked pines along the Mt. Crumpit ascent
  for (const [tx, ty, tScale, tLean] of [
    [-1.85, 2.48, 0.54, 1],
    [-0.92, 3.04, 0.48, -1],
    [-0.18, 3.78, 0.42, 1],
  ] as const) {
    const trailLamp = createMiniatureCrookedLampPost(
      tScale,
      tLean,
      contourInkMat,
      lanternGlowMat
    );
    trailLamp.position.set(tx, ty, 0.32);
    crumpitGroup.add(trailLamp);
  }

  // Miniature glowing Grinch cave mouth tucked near the upper cliff of Mt. Crumpit
  const caveFrame = new THREE.Mesh(
    new RoundedBoxGeometry(0.36, 0.4, 0.1, 2, 0.04),
    contourInkMat
  );
  caveFrame.position.set(0.32, 4.38, 0.32);
  caveFrame.rotation.z = -0.18;
  crumpitGroup.add(caveFrame);

  const caveGlow = new THREE.Mesh(
    new RoundedBoxGeometry(0.24, 0.28, 0.06, 1, 0.03),
    new THREE.MeshStandardMaterial({
      color: 0x8cc864,
      emissive: 0x52a432,
      emissiveIntensity: 0.72,
      roughness: 0.55,
    })
  );
  caveGlow.position.set(0.33, 4.36, 0.37);
  caveGlow.rotation.z = -0.18;
  crumpitGroup.add(caveGlow);

  hillsGroup.add(crumpitGroup);

  return hillsGroup;
}

