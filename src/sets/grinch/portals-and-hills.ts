import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {
  createPapierMacheNormalTexture,
  createSeussianRockNormalTexture,
  normalizeExtrudeUVs,
} from '../../engine/procedural-textures.ts';
import {
  createSculptedIcicleDrip,
  createSeussianIcicleValance,
} from '../shared-scenic-helpers.ts';

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


let cachedCrystallineIceFrontMat: THREE.MeshStandardMaterial | null = null;
let cachedCrystallineIceBackMat: THREE.MeshStandardMaterial | null = null;

function getCrystallineIceMaterials(): {
  readonly front: THREE.MeshStandardMaterial;
  readonly back: THREE.MeshStandardMaterial;
} {
  if (!cachedCrystallineIceFrontMat) {
    cachedCrystallineIceFrontMat = new THREE.MeshStandardMaterial({
      color: 0xa4c4d8,
      roughness: 0.45,
      metalness: 0.16,
      flatShading: true,
    });
  }
  if (!cachedCrystallineIceBackMat) {
    cachedCrystallineIceBackMat = new THREE.MeshStandardMaterial({
      color: 0x6290c8,
      roughness: 0.48,
      metalness: 0.14,
      flatShading: true,
    });
  }
  return {
    front: cachedCrystallineIceFrontMat,
    back: cachedCrystallineIceBackMat,
  };
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
 * Builds a sleek, wind-planed cliff-top snowpack blanket & overhanging icicle rim
 * (`createCliffTopSnowPackCornice`) that sits cleanly on top of a flat or angled
 * rock cliff plateau with a single crisp jagged icicle valance.
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
  _contourInkMat: THREE.Material,
  seed = 1,
  slopeRiseLeftToRight = 0.0
): THREE.Group {
  const group = new THREE.Group();
  const rng = createCliffRng(seed * 97 + 13);
  const halfW = width * 0.5;
  const h = Math.min(0.42, Math.max(0.22, snowThickness));

  // 1. Sleek, wind-swept sloping snowpack slab resting on the cliff plateau
  const leftTopY = h - slopeRiseLeftToRight * 0.5;
  const rightTopY = h + slopeRiseLeftToRight * 0.5;

  const capShape = new THREE.Shape();
  capShape.moveTo(-halfW, 0.02);
  capShape.lineTo(-halfW - (0.02 + rng() * 0.03), leftTopY * (0.58 + rng() * 0.14));
  capShape.lineTo(-halfW * (0.82 + rng() * 0.1), leftTopY);
  capShape.lineTo(
    -halfW * (0.15 + rng() * 0.2),
    (leftTopY + rightTopY) * 0.5 + (rng() - 0.3) * 0.06
  );
  capShape.lineTo(
    halfW * (0.28 + rng() * 0.2),
    rightTopY + (rng() - 0.4) * 0.05
  );
  capShape.lineTo(halfW * (0.86 + rng() * 0.08), rightTopY * 0.9);
  capShape.lineTo(halfW + (0.02 + rng() * 0.03), rightTopY * 0.46);
  capShape.lineTo(halfW, 0.02);

  // Crisp stepped/undercut bottom snow lip where the snowpack meets the sheer rock cliff face
  const stepW = width / scallopCount;
  for (let i = 0; i < scallopCount; i++) {
    const xRight = halfW - i * stepW;
    const xLeft = xRight - stepW;
    const xMid = (xRight + xLeft) * 0.5 + (rng() - 0.5) * stepW * 0.22;
    const dipY = -0.035 - rng() * 0.045;
    const crestY = 0.015 + rng() * 0.03;
    capShape.lineTo(xMid, dipY);
    capShape.lineTo(xLeft, crestY);
  }
  capShape.closePath();

  const capGeo = new THREE.ExtrudeGeometry(capShape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 1,
    bevelSize: 0.02,
    bevelThickness: 0.02,
  });
  capGeo.translate(0, -h * 0.35, -depth * 0.5);
  normalizeExtrudeUVs(capGeo, 'fit');
  capGeo.computeVertexNormals();

  const capMesh = new THREE.Mesh(capGeo, snowCapMat);
  capMesh.castShadow = true;
  capMesh.receiveShadow = true;
  group.add(capMesh);

  // 2. Dark rock overhang shadow ledge directly under the snow cornice lip
  const underLipGeo = new THREE.BoxGeometry(
    width * 0.92,
    0.1,
    depth * 0.74
  );
  const underLip = new THREE.Mesh(underLipGeo, underShadowMat);
  underLip.position.set(0, -h * 0.38, -0.02);
  group.add(underLip);

  // 3. Single crisp jagged cavemouth-style crystalline icicle valance tucked under the snow lip
  const { front: crystallineIceFrontMat, back: crystallineIceBackMat } =
    getCrystallineIceMaterials();

  const valance = createSeussianIcicleValance(
    width * (0.86 + rng() * 0.08),
    Math.min(0.46, snowThickness * 0.42 + 0.12 + rng() * 0.08),
    scallopCount * 2 + 1 + Math.floor(rng() * 3),
    crystallineIceFrontMat,
    crystallineIceBackMat,
    0.038,
    seed
  );
  valance.position.set(0, -h * 0.28, depth * 0.22);
  group.add(valance);

  return group;
}

/**
 * Helper to create a miniature crooked Seussian spruce/pine tree clinging to a
 * mountain cliff ledge or distant Whoville hill ridge.
 */
function createForcedPerspectiveWhovillePine(
  scale: number,
  pineMat: THREE.Material,
  snowMat: THREE.Material,
  trunkMat: THREE.Material,
  leanDir: -1 | 1 = 1
): THREE.Group {
  const tree = new THREE.Group();

  const trunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(leanDir * 0.03 * scale, 0.1 * scale, 0),
    new THREE.Vector3(leanDir * -0.02 * scale, 0.2 * scale, 0),
  ]);
  const trunk = new THREE.Mesh(
    new THREE.TubeGeometry(trunkCurve, 6, 0.032 * scale, 6, false),
    trunkMat
  );
  tree.add(trunk);

  for (let tier = 0; tier < 4; tier++) {
    const tierRadius = (0.2 - tier * 0.036) * scale;
    const tierHeight = (0.28 - tier * 0.032) * scale;
    const tierY = (0.18 + tier * 0.14) * scale;
    const offsetX =
      leanDir * (tier % 2 === 0 ? 0.025 : -0.02) * (tier + 1) * 0.6 * scale;

    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(tierRadius, tierHeight, 8),
      pineMat
    );
    cone.position.set(offsetX, tierY, 0);
    cone.rotation.z = leanDir * (tier % 2 === 0 ? -0.16 : 0.18);
    tree.add(cone);

    const snowCap = new THREE.Mesh(
      new THREE.ConeGeometry(tierRadius * 0.88, tierHeight * 0.46, 8),
      snowMat
    );
    snowCap.position.set(
      offsetX,
      tierY + tierHeight * 0.23,
      0.014 * scale
    );
    snowCap.rotation.z = cone.rotation.z;
    tree.add(snowCap);
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
}

/**
 * Generates a single clean, non-OTT, procedurally varied stratified rock & snow
 * cliff wing flat (`createProceduralStratifiedCliffWing`) directly in world X
 * coordinates (never simply mirroring Stage Left and Stage Right).
 *
 * Every call uses its own deterministic `seed` and `archetype` to vary:
 * - Number of inner cliff steps (`3` to `5` steps)
 * - Individual step heights, horizontal terrace widths, and rock overhang angles
 * - Summit plateau slope and natural crag ridge humps
 * - 3D planar rock facet vertex displacement
 * - Snowpack cornice width, slope, and icicle tooth rhythm
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
    secondaryRockMat,
    underShadowMat,
    snowCapMat,
    contourInkMat,
    icicleMat,
    pineGreenMat,
    trunkMat,
    includePine = false,
    includeBaseSnow = false,
  } = spec;

  const rng = createCliffRng(seed);
  const group = new THREE.Group();
  group.position.set(side * outerEdgeAbsX, 0, zPos);
  group.rotation.y = yawRad;

  // Local X grows from 0 (offstage outer edge) toward center stage in direction `inwardSign = -side`
  const inwardSign: -1 | 1 = side === -1 ? 1 : -1;
  const totalSpanW = Math.max(1.2, outerEdgeAbsX - innerEdgeAbsX);

  // 1. Construct a unique 2D rock cliff silhouette in local coordinates
  const outerTopY = height * (0.93 + rng() * 0.09);
  const innerShoulderY =
    archetype === 'overhanging-bluff'
      ? height * (0.82 + rng() * 0.08)
      : archetype === 'canyon-ridge'
        ? height * (0.76 + rng() * 0.1)
        : height * (0.72 + rng() * 0.12);

  const topReachW =
    archetype === 'overhanging-bluff'
      ? totalSpanW * (0.92 + rng() * 0.08)
      : archetype === 'stepped-terrace'
        ? totalSpanW * (0.64 + rng() * 0.12)
        : totalSpanW * (0.74 + rng() * 0.14);

  // Trace points in stage-right-canonical space (u >= 0 means inward toward center stage),
  // then multiply X by `inwardSign` so SL and SR are built natively with their own RNG stream!
  const pts: Array<readonly [number, number]> = [];
  pts.push([-0.14 * (0.8 + rng() * 0.4), 0]);
  pts.push([-0.22 * (0.7 + rng() * 0.5), height * (0.36 + rng() * 0.14)]);
  pts.push([-0.12 * (0.6 + rng() * 0.6), height * (0.72 + rng() * 0.12)]);
  pts.push([0.04 + rng() * 0.12, outerTopY]);

  // Upper summit ridge with 1 or 2 natural crag undulations (no OTT spiky Dolomite horns!)
  const midRidgeU1 = topReachW * (0.32 + rng() * 0.16);
  const midRidgeY1 =
    THREE.MathUtils.lerp(outerTopY, innerShoulderY, 0.36) +
    (rng() - 0.32) * 0.28;
  pts.push([midRidgeU1, midRidgeY1]);

  if (rng() > 0.35) {
    const midRidgeU2 = topReachW * (0.66 + rng() * 0.14);
    const midRidgeY2 =
      THREE.MathUtils.lerp(outerTopY, innerShoulderY, 0.7) +
      (rng() - 0.4) * 0.22;
    pts.push([midRidgeU2, midRidgeY2]);
  }

  pts.push([topReachW, innerShoulderY]);

  // Inner onstage cliff profile descending from (topReachW, innerShoulderY) to (baseReachW, 0)
  // with randomized step count, terrace ledges, and undercut rock angles
  const stepCount =
    archetype === 'stepped-terrace'
      ? 3
      : archetype === 'fractured-buttress'
        ? 4
        : 3 + Math.floor(rng() * 2);

  let curU = topReachW;
  let curY = innerShoulderY;
  let midLedgeU = totalSpanW * 0.55;
  let midLedgeY = height * 0.48;
  let midLedgeW = 0.75;

  for (let s = 0; s < stepCount; s++) {
    const tNext = (s + 1) / stepCount;
    const nextY =
      s === stepCount - 1
        ? 0
        : innerShoulderY *
          Math.max(0.08, 1 - tNext + (rng() - 0.5) * (0.14 / stepCount));

    // Rock face segment descending to nextY
    let faceBottomU = curU;
    if (archetype === 'overhanging-bluff' && s === 0) {
      // Upper prow juts slightly inward, then undercuts back
      const prowU = Math.min(totalSpanW * 1.03, curU + 0.14 + rng() * 0.16);
      const prowY = curY - (curY - nextY) * (0.32 + rng() * 0.18);
      pts.push([prowU, prowY]);
      faceBottomU = prowU - (0.22 + rng() * 0.18);
    } else if (archetype === 'stepped-terrace' && s === 0) {
      // Steep drop to a wide mid-height terrace that steps inward toward stage
      faceBottomU = curU + (0.04 + rng() * 0.08);
    } else {
      // Natural craggy rock face slant (either slight undercut or outward batter)
      faceBottomU = curU + (rng() - 0.52) * 0.26;
    }

    faceBottomU = THREE.MathUtils.clamp(
      faceBottomU,
      totalSpanW * 0.48,
      totalSpanW * 1.02
    );
    pts.push([faceBottomU, nextY]);

    // Horizontal/slanted rock stratum step between vertical drops
    if (s < stepCount - 1) {
      let stepOutU = faceBottomU;
      if (archetype === 'stepped-terrace' && s === 0) {
        stepOutU = Math.min(
          totalSpanW,
          faceBottomU + totalSpanW * (0.22 + rng() * 0.14)
        );
      } else if (archetype === 'overhanging-bluff') {
        stepOutU = Math.max(
          totalSpanW * 0.54,
          faceBottomU - (0.08 + rng() * 0.16)
        );
      } else {
        stepOutU = THREE.MathUtils.clamp(
          faceBottomU + (rng() - 0.38) * 0.34,
          totalSpanW * 0.56,
          totalSpanW * 1.0
        );
      }

      const stepLedgeY = nextY - (0.04 + rng() * 0.08);
      pts.push([stepOutU, Math.max(0.12, stepLedgeY)]);

      if (s === 0) {
        midLedgeU = (faceBottomU + stepOutU) * 0.5;
        midLedgeY = nextY;
        midLedgeW = Math.max(0.55, Math.abs(stepOutU - faceBottomU) + 0.45);
      }
      curU = stepOutU;
      curY = Math.max(0.12, stepLedgeY);
    }
  }

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
    bevelSegments: 1,
    steps: 1,
    bevelSize: 0.016,
    bevelThickness: 0.016,
  });
  cliffGeo.translate(0, 0, -extrudeDepth * 0.5);

  // Chisel seed-randomized planar rock facets onto the front wall
  const freqX = 3.2 + rng() * 2.8;
  const freqY = 2.6 + rng() * 2.4;
  const phaseX = rng() * Math.PI * 2;
  const phaseY = rng() * Math.PI * 2;
  const ridgeCenterU = totalSpanW * (0.28 + rng() * 0.38);

  const pos = cliffGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    if (vz > 0) {
      const u = vx * inwardSign;
      const ridgeDist = Math.abs(u - ridgeCenterU);
      const ridgeRelief =
        Math.max(0, 1 - ridgeDist / (totalSpanW * 0.65)) *
        extrudeDepth *
        0.22;
      const stratumStep =
        Math.floor((vy / Math.max(1, height)) * (4 + (seed % 3))) * 0.014;
      const waveFacet =
        Math.sin(vy * freqY + phaseY) * 0.028 +
        Math.cos(vx * freqX + phaseX) * 0.024;
      pos.setZ(i, vz + ridgeRelief + waveFacet - stratumStep);
    }
  }
  normalizeExtrudeUVs(cliffGeo, 'fit');
  cliffGeo.computeVertexNormals();

  const cliffMesh = new THREE.Mesh(cliffGeo, primaryRockMat);
  cliffMesh.castShadow = true;
  cliffMesh.receiveShadow = true;
  group.add(cliffMesh);

  // 2. Single secondary lower rock buttress facet for clean 3D relief (varied per seed)
  const subSpanW = totalSpanW * (0.48 + rng() * 0.22);
  const subHeight = height * (0.36 + rng() * 0.18);
  const subShard = createJaggedRockShardBlock(
    subSpanW,
    subHeight,
    extrudeDepth * 0.68,
    secondaryRockMat,
    seed + 31,
    inwardSign * (0.06 + rng() * 0.08)
  );
  subShard.position.set(
    inwardSign * (subSpanW * 0.46 + rng() * 0.18),
    subHeight * 0.48,
    extrudeDepth * 0.34
  );
  group.add(subShard);

  // 3. Clean wind-swept snowpack cap along the top plateau of the cliff
  const topCorniceWidth = Math.max(1.05, topReachW * (0.94 + rng() * 0.08));
  const topSlopeDelta = (innerShoulderY - outerTopY) * inwardSign * 0.55;
  const topCornice = createCliffTopSnowPackCornice(
    topCorniceWidth,
    0.28 + rng() * 0.1,
    extrudeDepth * 1.06,
    4 + (seed % 2),
    snowCapMat,
    underShadowMat,
    icicleMat,
    underShadowMat,
    contourInkMat,
    seed + 10,
    topSlopeDelta
  );
  const topCenterU = topReachW * 0.48;
  const topCenterY = (outerTopY + innerShoulderY) * 0.5;
  topCornice.position.set(
    inwardSign * topCenterU,
    topCenterY,
    extrudeDepth * 0.12
  );
  topCornice.rotation.z =
    Math.atan2(innerShoulderY - outerTopY, topReachW) * inwardSign * 0.65;
  group.add(topCornice);

  // 4. Optional smaller mid-terrace snow shelf on stepped-terrace / fractured-buttress layers
  if (
    archetype === 'stepped-terrace' ||
    (archetype === 'fractured-buttress' && rng() > 0.3)
  ) {
    const ledgeSnow = createCliffTopSnowPackCornice(
      Math.min(1.15, midLedgeW * 0.95),
      0.24,
      extrudeDepth * 0.88,
      3 + (seed % 2),
      snowCapMat,
      underShadowMat,
      icicleMat,
      underShadowMat,
      contourInkMat,
      seed + 47,
      inwardSign * -0.08
    );
    ledgeSnow.position.set(
      inwardSign * midLedgeU,
      midLedgeY,
      extrudeDepth * 0.24
    );
    ledgeSnow.rotation.z = inwardSign * -0.08;
    group.add(ledgeSnow);
  }

  // 5. Optional crooked alpine spruce tree perched on the cliff shoulder
  if (includePine) {
    const pineScale = 0.82 + rng() * 0.26;
    const pine = createForcedPerspectiveWhovillePine(
      pineScale,
      pineGreenMat,
      snowCapMat,
      trunkMat,
      inwardSign
    );
    pine.position.set(
      inwardSign * (topReachW * (0.28 + rng() * 0.24)),
      topCenterY + 0.08,
      extrudeDepth * 0.16
    );
    pine.rotation.z = inwardSign * (-0.06 - rng() * 0.08);
    group.add(pine);
  }

  // 6. Optional low stage-floor snowbank at the downstage base
  if (includeBaseSnow) {
    const bankW = totalSpanW * (0.88 + rng() * 0.12);
    const bankShape = new THREE.Shape();
    bankShape.moveTo(0, 0);
    bankShape.lineTo(0, 0.42 + rng() * 0.14);
    bankShape.lineTo(inwardSign * bankW * 0.52, 0.32 + rng() * 0.12);
    bankShape.lineTo(inwardSign * bankW, 0.14 + rng() * 0.08);
    bankShape.lineTo(inwardSign * (bankW + 0.08), 0);
    bankShape.closePath();

    const bankGeo = new THREE.ExtrudeGeometry(bankShape, {
      depth: 0.32,
      bevelEnabled: true,
      bevelSegments: 1,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    });
    normalizeExtrudeUVs(bankGeo, 'fit');
    bankGeo.computeVertexNormals();

    const bankMesh = new THREE.Mesh(bankGeo, snowCapMat);
    bankMesh.position.set(0, 0, extrudeDepth * 0.42);
    bankMesh.receiveShadow = true;
    group.add(bankMesh);
  }

  return group;
}

/**
 * 1. DOWNSTAGE LEFT & RIGHT STRATIFIED ROCK & SNOW CLIFF PORTALS
 *    (`'grinch-snow-portals'`)
 *    Features 4 clean, non-OTT, procedurally varied Z-depth cliff layers per side
 *    (`z ≈ +0.24m`, `-0.66m`, `-1.72m`, `-2.80m`) where every single layer on Stage
 *    Right and Stage Left has its own seeded rock silhouette, step count, terrace
 *    heights, and snowpack profile, framing the stage (`|x| ≈ 3.60m–4.12m`) with
 *    natural depth and parallax without overwhelming the scene.
 */
export function buildGrinchSnowPortals(
  _rockTex: THREE.CanvasTexture
): THREE.Group {
  const portalsGroup = new THREE.Group();
  portalsGroup.name = 'Element_grinch-snow-portals';

  const papierMacheNormalTex = createPapierMacheNormalTexture();
  const seussianRockNormalTex = createSeussianRockNormalTexture();
  const mountainCliffTex = createSnowMountainCliffTexture();
  const jaggedRockTex = createJaggedRockCliffFaceTexture();

  // Foreground exposed stratified dark slate & granite rock cliff face material
  const rockCliffMat = new THREE.MeshStandardMaterial({
    map: jaggedRockTex,
    normalMap: seussianRockNormalTex,
    normalScale: new THREE.Vector2(0.42, 0.42),
    color: 0x6e7888,
    roughness: 0.76,
    metalness: 0.05,
    flatShading: true,
  });

  // Secondary weathered limestone-ochre / slate-grey rock facet material
  const rockOchreFacetMat = new THREE.MeshStandardMaterial({
    map: jaggedRockTex,
    normalMap: seussianRockNormalTex,
    normalScale: new THREE.Vector2(0.4, 0.4),
    color: 0x847c72,
    roughness: 0.74,
    metalness: 0.05,
    flatShading: true,
  });

  // Upstage atmospheric cool canyon slate-blue rock material (aerial perspective)
  const rockDeepCanyonMat = new THREE.MeshStandardMaterial({
    map: jaggedRockTex,
    normalMap: seussianRockNormalTex,
    normalScale: new THREE.Vector2(0.36, 0.36),
    color: 0x52647c,
    roughness: 0.78,
    metalness: 0.05,
    flatShading: true,
  });

  // Clean white-frost snowpack material for the snow blankets sitting ON TOP of the cliffs
  const snowCapMat = new THREE.MeshStandardMaterial({
    map: mountainCliffTex,
    normalMap: papierMacheNormalTex,
    normalScale: new THREE.Vector2(0.24, 0.24),
    color: 0xcad4dc,
    roughness: 0.56,
    metalness: 0.03,
  });

  // Deep slate-cobalt rock crevice & undercut overhang shadow material
  const rockShadowCreviceMat = new THREE.MeshStandardMaterial({
    map: jaggedRockTex,
    normalMap: seussianRockNormalTex,
    normalScale: new THREE.Vector2(0.35, 0.35),
    color: 0x3a485e,
    roughness: 0.78,
    metalness: 0.05,
    flatShading: true,
  });

  const underShadowMat = new THREE.MeshStandardMaterial({
    normalMap: seussianRockNormalTex,
    normalScale: new THREE.Vector2(0.28, 0.28),
    color: 0x243042,
    roughness: 0.8,
    metalness: 0.04,
  });

  const contourInkMat = new THREE.MeshStandardMaterial({
    color: 0x1a2434,
    roughness: 0.78,
    metalness: 0.02,
  });

  const icicleMat = new THREE.MeshStandardMaterial({
    color: 0xc0d2dc,
    roughness: 0.52,
    metalness: 0.08,
    transparent: true,
    opacity: 0.95,
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
  // FOREGROUND CLIFF COMPLEXES (Layers 1 & 2 on DSR and DSL)
  // Every layer has its own unique seed, archetype, height, and stage reach!
  // ==========================================================================
  for (const side of [-1, 1] as const) {
    const cliffComplex = new THREE.Group();
    cliffComplex.name = side === -1 ? 'SnowPortal_DSR' : 'SnowPortal_DSL';
    cliffComplex.userData.subUnitId =
      side === -1 ? 'grinch-portal-dsr-cliff' : 'grinch-portal-dsl-cliff';

    // Layer 1: Downstage Proscenium Cliff Frame (in front of Pre-Show Scrim)
    const layer1 = createProceduralStratifiedCliffWing({
      side,
      archetype: side === -1 ? 'stepped-terrace' : 'fractured-buttress',
      seed: side === -1 ? 109 : 227,
      outerEdgeAbsX: side === -1 ? 5.82 : 5.76,
      innerEdgeAbsX: side === -1 ? 3.86 : 3.94,
      height: side === -1 ? 4.22 : 4.38,
      zPos: side === -1 ? 0.26 : 0.21,
      extrudeDepth: 0.42,
      yawRad: side * -0.11,
      primaryRockMat: rockCliffMat,
      secondaryRockMat: rockOchreFacetMat,
      underShadowMat,
      snowCapMat,
      contourInkMat,
      icicleMat,
      pineGreenMat,
      trunkMat,
      includePine: side === -1,
      includeBaseSnow: true,
    });
    cliffComplex.add(layer1);

    // Layer 2: Downstage-Mid Bluff (just upstage of the Pre-Show Scrim at z = -0.35m)
    const layer2 = createProceduralStratifiedCliffWing({
      side,
      archetype: side === -1 ? 'overhanging-bluff' : 'stepped-terrace',
      seed: side === -1 ? 347 : 463,
      outerEdgeAbsX: side === -1 ? 5.66 : 5.72,
      innerEdgeAbsX: side === -1 ? 3.62 : 3.56,
      height: side === -1 ? 4.58 : 4.46,
      zPos: side === -1 ? -0.64 : -0.71,
      extrudeDepth: 0.36,
      yawRad: side * -0.08,
      primaryRockMat: rockOchreFacetMat,
      secondaryRockMat: rockShadowCreviceMat,
      underShadowMat,
      snowCapMat,
      contourInkMat,
      icicleMat,
      pineGreenMat,
      trunkMat,
      includePine: side === 1,
      includeBaseSnow: false,
    });
    cliffComplex.add(layer2);

    portalsGroup.add(cliffComplex);
  }

  // ==========================================================================
  // MIDSTAGE & UPSTAGE CANYON WING LAYERS (Layers 3 & 4 on DSR and DSL)
  // ==========================================================================
  const wingWavesGroup = new THREE.Group();
  wingWavesGroup.name = 'SnowPortal_WingWaves';
  wingWavesGroup.userData.subUnitId = 'grinch-portal-wing-waves';

  for (const side of [-1, 1] as const) {
    // Layer 3: Midstage Crag Wing (z = -1.68m SR / -1.76m SL)
    const layer3 = createProceduralStratifiedCliffWing({
      side,
      archetype: side === -1 ? 'fractured-buttress' : 'overhanging-bluff',
      seed: side === -1 ? 587 : 691,
      outerEdgeAbsX: side === -1 ? 5.84 : 5.88,
      innerEdgeAbsX: side === -1 ? 3.76 : 3.84,
      height: side === -1 ? 4.88 : 5.04,
      zPos: side === -1 ? -1.68 : -1.76,
      extrudeDepth: 0.34,
      yawRad: side * -0.06,
      primaryRockMat: side === -1 ? rockCliffMat : rockOchreFacetMat,
      secondaryRockMat: rockDeepCanyonMat,
      underShadowMat,
      snowCapMat,
      contourInkMat,
      icicleMat,
      pineGreenMat,
      trunkMat,
      includePine: false,
      includeBaseSnow: false,
    });
    wingWavesGroup.add(layer3);

    // Layer 4: Upstage Canyon Sentinel Wing (z = -2.74m SR / -2.84m SL)
    const layer4 = createProceduralStratifiedCliffWing({
      side,
      archetype: 'canyon-ridge',
      seed: side === -1 ? 811 : 937,
      outerEdgeAbsX: side === -1 ? 5.96 : 6.02,
      innerEdgeAbsX: side === -1 ? 3.98 : 4.08,
      height: side === -1 ? 5.26 : 5.14,
      zPos: side === -1 ? -2.74 : -2.84,
      extrudeDepth: 0.32,
      yawRad: side * -0.04,
      primaryRockMat: rockDeepCanyonMat,
      secondaryRockMat: rockShadowCreviceMat,
      underShadowMat,
      snowCapMat,
      contourInkMat,
      icicleMat,
      pineGreenMat,
      trunkMat,
      includePine: false,
      includeBaseSnow: false,
    });
    wingWavesGroup.add(layer4);
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

  // Iconic jagged crystalline icicle fangs along the right cliff overhang
  // of Mt. Crumpit (`model_1B_whoville.jpg` & `model_1F_mt_crumpit_sleigh.jpg`)
  const crumpitIceFrontMat = new THREE.MeshStandardMaterial({
    color: 0xa4c4d8,
    roughness: 0.45,
    metalness: 0.16,
    flatShading: true,
  });
  const crumpitIceBackMat = new THREE.MeshStandardMaterial({
    color: 0x6290c8,
    roughness: 0.48,
    metalness: 0.14,
    flatShading: true,
  });

  const cliffValance = createSeussianIcicleValance(
    0.76,
    0.54,
    7,
    crumpitIceFrontMat,
    crumpitIceBackMat,
    0.044,
    11
  );
  cliffValance.position.set(0.68, 4.22, 0.14);
  cliffValance.rotation.z = 0.34;
  crumpitGroup.add(cliffValance);

  for (const [ix, iy, len, rad, bend] of [
    [0.32, 3.38, 0.62, 0.048, -0.024],
    [0.46, 3.62, 0.72, 0.052, 0.022],
    [0.58, 3.84, 0.64, 0.046, -0.025],
    [0.7, 4.02, 0.88, 0.056, 0.028],
    [0.82, 4.2, 0.72, 0.048, -0.022],
    [0.9, 4.42, 0.52, 0.04, 0.018],
  ] as const) {
    const cliffIcicle = createSculptedIcicleDrip(
      len,
      rad,
      crumpitIceFrontMat,
      bend
    );
    cliffIcicle.position.set(ix, iy, 0.18);
    cliffIcicle.rotation.z = -0.05;
    cliffIcicle.scale.set(1.0, 1.0, 0.65);
    crumpitGroup.add(cliffIcicle);
  }

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

