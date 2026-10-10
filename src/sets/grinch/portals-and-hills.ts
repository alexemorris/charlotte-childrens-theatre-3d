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
    bgGrad.addColorStop(0.0, '#adc4dc');
    bgGrad.addColorStop(0.22, '#c4d4e2');
    bgGrad.addColorStop(0.5, '#98b6d6');
    bgGrad.addColorStop(0.78, '#7c9ec8');
    bgGrad.addColorStop(1.0, '#adc4dc');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Toroidally wrapped translucent papier-mâché strip glazes
    for (let i = 0; i < 140; i++) {
      const cx = (i * 173 + 47) % W;
      const cy = (i * 251 + 83) % H;
      const w = 95 + ((i * 29) % 120);
      const h = 34 + ((i * 19) % 48);
      const angle = (((i * 37) % 100) / 100 - 0.5) * 1.1;

      for (const ox of [-W, 0, W]) {
        for (const oy of [-H, 0, H]) {
          const px = cx + ox;
          const py = cy + oy;
          if (px + w < 0 || px - w > W || py + h < 0 || py - h > H) continue;
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(angle);
          if (i % 3 === 0) {
            ctx.fillStyle = 'rgba(214, 224, 238, 0.20)';
          } else if (i % 3 === 1) {
            ctx.fillStyle = 'rgba(116, 156, 206, 0.18)';
          } else {
            ctx.fillStyle = 'rgba(188, 198, 228, 0.18)';
          }
          ctx.fillRect(-w * 0.5, -h * 0.5, w, h);

          ctx.strokeStyle = 'rgba(226, 234, 244, 0.22)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-w * 0.5, -h * 0.5, w, h);
          ctx.restore();
        }
      }
    }

    // 3. Horizontally periodic Seussian rock strata bands (integer harmonics of W)
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let row = 0; row < 16; row++) {
      const baseY = 32 + row * 64;
      const waveY = (x: number): number => {
        const u = (x / W) * Math.PI * 2;
        return (
          baseY +
          Math.sin(u * 2 + row * 0.9) * 14 +
          Math.cos(u * 5 - row * 1.2) * 7
        );
      };

      // Deep glacier-cobalt shadow wash underneath each stratum shelf
      ctx.strokeStyle = 'rgba(54, 92, 152, 0.42)';
      ctx.lineWidth = 18;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 16) {
        const wy = waveY(x) + 8;
        if (x === 0) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.stroke();

      // Warm ivory-lavender dry-brushed snow highlight along the top ridge of each shelf
      ctx.strokeStyle = 'rgba(218, 228, 240, 0.56)';
      ctx.lineWidth = 10;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 16) {
        const wy = waveY(x) - 5;
        if (x === 0) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.stroke();

      // Bold Dr. Seuss charcoal-navy ink contour fissure line
      ctx.strokeStyle = 'rgba(22, 34, 56, 0.72)';
      ctx.lineWidth = row % 2 === 0 ? 3.8 : 2.5;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 16) {
        const wy = waveY(x);
        if (x === 0) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.stroke();

      // Perpendicular Seussian tick-hatches hanging from the fissure line
      if (row % 2 === 0) {
        ctx.lineWidth = 2.1;
        ctx.strokeStyle = 'rgba(24, 38, 62, 0.56)';
        for (let x = 16; x < W - 16; x += 32) {
          const wy = waveY(x);
          const tickLen = 11 + ((x * 5 + row * 7) % 16);
          const tilt = ((x % 5) - 2) * 0.15;
          ctx.beginPath();
          ctx.moveTo(x, wy);
          ctx.lineTo(x + Math.sin(tilt) * tickLen, wy + tickLen);
          ctx.stroke();
        }
      }
    }

    // 4. Signature Tim Parati / Dr. Seuss Z-zigzag crag cross-hatching (interior of tile)
    ctx.strokeStyle = 'rgba(20, 32, 52, 0.68)';
    ctx.lineWidth = 3.2;
    for (let z = 0; z < 36; z++) {
      const sx = ((z * 149) % 880) + 56;
      const sy = ((z * 211) % 880) + 56;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + 38, sy - 9);
      ctx.lineTo(sx + 10, sy + 11);
      ctx.lineTo(sx + 52, sy + 3);
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
    bgGrad.addColorStop(0.25, '#c2d4e4');
    bgGrad.addColorStop(0.55, '#86b0da');
    bgGrad.addColorStop(0.8, '#6692c4');
    bgGrad.addColorStop(1.0, '#96badc');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Horizontally periodic sweeping curved glacial flow ribbons (integer harmonics of W)
    ctx.lineCap = 'round';
    for (let i = 0; i < 24; i++) {
      const baseY = 20 + i * 42;
      ctx.strokeStyle =
        i % 2 === 0
          ? 'rgba(216, 228, 242, 0.34)'
          : 'rgba(64, 108, 168, 0.28)';
      ctx.lineWidth = 18 + (i % 4) * 5;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 16) {
        const u = (x / W) * Math.PI * 2;
        const wy =
          baseY +
          Math.sin(u + i * 0.45) * 28 +
          Math.cos(u * 2 - i * 0.3) * 12;
        if (x === 0) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.stroke();
    }

    // Fine Seussian charcoal ink contour & rib cross-hatching (baked into texture instead of 3D tubes)
    ctx.strokeStyle = 'rgba(20, 34, 58, 0.65)';
    ctx.lineWidth = 2.6;
    for (let i = 0; i < 56; i++) {
      const hx = ((i * 163) % 900) + 48;
      const hy = ((i * 199) % 900) + 48;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.quadraticCurveTo(hx + 22, hy - 12, hx + 46, hy - 4);
      ctx.moveTo(hx + 8, hy + 10);
      ctx.quadraticCurveTo(hx + 28, hy + 2, hx + 42, hy + 12);
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
 * joints, sharp vertical rock fracture clefts, and thin frost ridges caught on
 * the horizontal rock strata ledges.
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
    bgGrad.addColorStop(0.0, '#4c5664');
    bgGrad.addColorStop(0.25, '#5a6472');
    bgGrad.addColorStop(0.5, '#444e5c');
    bgGrad.addColorStop(0.75, '#545e6c');
    bgGrad.addColorStop(1.0, '#4c5664');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Angular fractured limestone/dolomite ochre-tan & cold slate rock blocks
    for (let i = 0; i < 180; i++) {
      const bx = (i * 197 + 31) % W;
      const by = (i * 139 + 53) % H;
      const bw = 64 + ((i * 43) % 130);
      const bh = 28 + ((i * 23) % 52);

      for (const ox of [-W, 0, W]) {
        for (const oy of [-H, 0, H]) {
          const px = bx + ox;
          const py = by + oy;
          if (px + bw < 0 || px > W || py + bh < 0 || py > H) continue;

          if (i % 4 === 0) {
            // Warm weathered ochre-tan limestone block (matching reference cliff photo)
            ctx.fillStyle = 'rgba(164, 136, 98, 0.34)';
          } else if (i % 4 === 1) {
            // Deep charcoal-slate shadow facet
            ctx.fillStyle = 'rgba(42, 50, 62, 0.38)';
          } else if (i % 4 === 2) {
            // Cool weathered dolomite grey facet
            ctx.fillStyle = 'rgba(116, 128, 144, 0.28)';
          } else {
            // Warm taupe-sandstone mineral vein
            ctx.fillStyle = 'rgba(146, 124, 96, 0.26)';
          }
          ctx.fillRect(px, py, bw, bh);

          // Crisp chiseled block joint outline
          ctx.strokeStyle = 'rgba(24, 28, 36, 0.48)';
          ctx.lineWidth = 1.6;
          ctx.strokeRect(px, py, bw, bh);
        }
      }
    }

    // 3. Sharp, stepped horizontal rock strata bedding joints & overhang crevices
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'miter';
    for (let row = 0; row < 18; row++) {
      const baseY = 28 + row * 56;
      const stepY = (x: number): number => {
        const seg = Math.floor(x / 64);
        const nextSeg = (seg + 1) % 16;
        const frac = (x % 64) / 64;
        const h0 = Math.sin(seg * 1.9 + row * 1.3) * 10 + ((seg * 7 + row) % 3) * 4;
        const h1 =
          Math.sin(nextSeg * 1.9 + row * 1.3) * 10 + ((nextSeg * 7 + row) % 3) * 4;
        // Sharp angular rock step transitions
        const t = frac < 0.8 ? 0 : (frac - 0.8) / 0.2;
        return baseY + h0 * (1 - t) + h1 * t;
      };

      // Deep dark crevice shadow directly beneath each rock stratum shelf
      ctx.strokeStyle = 'rgba(18, 22, 30, 0.78)';
      ctx.lineWidth = 9;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 16) {
        const sy = stepY(x) + 4;
        if (x === 0) ctx.moveTo(x, sy);
        else ctx.lineTo(x, sy);
      }
      ctx.stroke();

      // Crisp frost/snow dusting caught on top of the horizontal rock ledge
      if (row % 2 === 0) {
        ctx.strokeStyle = 'rgba(214, 226, 238, 0.62)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 16) {
          const sy = stepY(x) - 3;
          if (x === 0) ctx.moveTo(x, sy);
          else ctx.lineTo(x, sy);
        }
        ctx.stroke();
      }

      // Razor-sharp black fracture seam
      ctx.strokeStyle = 'rgba(14, 18, 26, 0.88)';
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 16) {
        const sy = stepY(x);
        if (x === 0) ctx.moveTo(x, sy);
        else ctx.lineTo(x, sy);
      }
      ctx.stroke();
    }

    // 4. Steep vertical & diagonal angular rock fracture cracks
    ctx.strokeStyle = 'rgba(16, 20, 28, 0.76)';
    ctx.lineWidth = 2.8;
    for (let v = 0; v < 42; v++) {
      const vx = ((v * 157) % 900) + 52;
      const vy = ((v * 223) % 820) + 48;
      ctx.beginPath();
      ctx.moveTo(vx, vy);
      ctx.lineTo(vx + ((v % 3) - 1) * 14, vy + 38);
      ctx.lineTo(vx - ((v % 2) * 16 - 8), vy + 76);
      ctx.lineTo(vx + ((v % 3) - 1) * 12, vy + 118);
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
 * Builds a sharp, pointed, multi-faceted alpine mountain peak / spire
 * (matching the jagged Dolomite rock spires in the user's reference photo)
 * with a crisp central rock arrête ridge and angled snow couloir streaks clinging
 * to the rock gullies.
 */
function createJaggedAlpineSpirePeak(
  baseWidth: number,
  height: number,
  depth: number,
  rockMat: THREE.Material,
  snowMat: THREE.Material,
  leanX = 0,
  seed = 1
): THREE.Group {
  const spireGroup = new THREE.Group();
  const hw = baseWidth * 0.5;

  const spireShape = new THREE.Shape();
  spireShape.moveTo(-hw, 0);
  spireShape.lineTo(-hw * 0.88, height * 0.28);
  spireShape.lineTo(-hw * 0.72, height * 0.32);
  spireShape.lineTo(-hw * 0.56 + leanX * 0.4, height * 0.64);
  spireShape.lineTo(-hw * 0.38 + leanX * 0.6, height * 0.68);
  // Sharp jagged summit horn peak
  spireShape.lineTo(leanX, height);
  // Steep stepped inner cliff face
  spireShape.lineTo(hw * 0.36 + leanX * 0.65, height * 0.74);
  spireShape.lineTo(hw * 0.24 + leanX * 0.55, height * 0.68);
  spireShape.lineTo(hw * 0.64 + leanX * 0.3, height * 0.38);
  spireShape.lineTo(hw * 0.52 + leanX * 0.25, height * 0.33);
  spireShape.lineTo(hw, 0);
  spireShape.closePath();

  const spireGeo = new THREE.ExtrudeGeometry(spireShape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 1,
    bevelSize: 0.015,
    bevelThickness: 0.015,
  });
  spireGeo.translate(0, 0, -depth * 0.5);

  // Pull the central arrête spine forward in Z so the peak has two distinct angled planar faces
  const pos = spireGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    if (vz > 0) {
      const yFrac = Math.max(0, Math.min(1, vy / height));
      const spineX = leanX * yFrac;
      const distFromSpine = Math.abs(vx - spineX);
      const maxHalfSpan = Math.max(0.12, hw * (1.0 - yFrac * 0.75));
      const arreteOut =
        Math.max(0, 1.0 - distFromSpine / maxHalfSpan) * depth * 0.42;
      pos.setZ(i, vz + arreteOut);
    }
  }

  normalizeExtrudeUVs(spireGeo, 'fit');
  spireGeo.computeVertexNormals();

  const spireMesh = new THREE.Mesh(spireGeo, rockMat);
  spireMesh.castShadow = true;
  spireMesh.receiveShadow = true;
  spireGroup.add(spireMesh);

  // Angled snow couloir / wind-packed snow slope clinging to the windward shoulder of the spire
  const snowSlopeShape = new THREE.Shape();
  snowSlopeShape.moveTo(-hw * 0.78, height * 0.24);
  snowSlopeShape.lineTo(-hw * 0.46 + leanX * 0.45, height * 0.66);
  snowSlopeShape.lineTo(leanX * 0.88, height * 0.92);
  snowSlopeShape.lineTo(leanX * 0.55 + hw * 0.08, height * 0.62);
  snowSlopeShape.lineTo(-hw * 0.22, height * 0.22);
  snowSlopeShape.closePath();

  const snowSlopeGeo = new THREE.ExtrudeGeometry(snowSlopeShape, {
    depth: depth * 0.48,
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 1,
    bevelSize: 0.012,
    bevelThickness: 0.012,
  });
  normalizeExtrudeUVs(snowSlopeGeo, 'fit');
  snowSlopeGeo.computeVertexNormals();

  const snowSlopeMesh = new THREE.Mesh(snowSlopeGeo, snowMat);
  snowSlopeMesh.position.set(0, 0, depth * 0.18 + (seed % 2) * 0.01);
  snowSlopeMesh.castShadow = true;
  spireGroup.add(snowSlopeMesh);

  return spireGroup;
}

/**
 * Builds a sleek, wind-planed cliff-top snowpack blanket & overhanging icicle rim
 * (`createCliffTopSnowPackCornice`) that sits cleanly on top of a flat or angled
 * rock cliff plateau (zero `SphereGeometry` cloud balls!) with the sculpted
 * icicle valance and icicle drips hanging directly down the sheer rock cliff face.
 */
function createCliffTopSnowPackCornice(
  width: number,
  snowThickness: number,
  depth: number,
  scallopCount: number,
  snowCapMat: THREE.Material,
  underShadowMat: THREE.Material,
  icicleMat: THREE.Material,
  glazeBackMat: THREE.Material,
  contourInkMat: THREE.Material,
  seed = 1,
  slopeRiseLeftToRight = 0.0
): THREE.Group {
  const group = new THREE.Group();
  const halfW = width * 0.5;
  const h = Math.min(0.46, Math.max(0.24, snowThickness));

  // 1. Sleek, wind-swept sloping snowpack slab resting on the cliff plateau
  const leftTopY = h - slopeRiseLeftToRight * 0.5;
  const rightTopY = h + slopeRiseLeftToRight * 0.5;

  const capShape = new THREE.Shape();
  capShape.moveTo(-halfW, 0.02);
  // Crisp angled snow cornice edge on the left
  capShape.lineTo(-halfW - 0.04, leftTopY * 0.65);
  capShape.lineTo(-halfW * 0.88, leftTopY);
  // Clean wind-planed upper snow slope across the cliff top (not a puffy cloud dome!)
  capShape.lineTo(-halfW * 0.25, (leftTopY + rightTopY) * 0.52 + 0.04);
  capShape.lineTo(halfW * 0.35, rightTopY + 0.03);
  capShape.lineTo(halfW * 0.92, rightTopY * 0.92);
  capShape.lineTo(halfW + 0.05, rightTopY * 0.48);
  capShape.lineTo(halfW, 0.02);

  // Crisp stepped/undercut bottom snow lip where the snowpack meets the sheer rock cliff face
  const stepW = width / scallopCount;
  for (let i = 0; i < scallopCount; i++) {
    const xRight = halfW - i * stepW;
    const xLeft = xRight - stepW;
    const xMid = (xRight + xLeft) * 0.5;
    const dipY = -0.045 - ((i + seed) % 3) * 0.022;
    const crestY = 0.025 + ((i + seed) % 2) * 0.018;
    capShape.lineTo(xMid, dipY);
    capShape.lineTo(xLeft, crestY);
  }
  capShape.closePath();

  const capGeo = new THREE.ExtrudeGeometry(capShape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 1,
    bevelSize: 0.022,
    bevelThickness: 0.022,
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
    width * 0.94,
    0.12,
    depth * 0.78
  );
  const underLip = new THREE.Mesh(underLipGeo, underShadowMat);
  underLip.position.set(0, -h * 0.38, -0.02);
  underLip.castShadow = true;
  underLip.receiveShadow = true;
  group.add(underLip);

  // 3. Continuous sculpted Seussian icicle valance hanging from the cliff lip
  const valance = createSeussianIcicleValance(
    width * 0.94,
    Math.min(0.54, snowThickness * 0.48 + 0.16),
    scallopCount * 2 + 3,
    icicleMat,
    glazeBackMat,
    0.046,
    seed
  );
  valance.position.set(0, -h * 0.32, depth * 0.22);
  group.add(valance);

  // Secondary recessed shadow icicle fringe for layered 3D depth against the dark rock wall
  const backValance = createSeussianIcicleValance(
    width * 0.9,
    Math.min(0.62, snowThickness * 0.52 + 0.2),
    scallopCount * 2 + 1,
    glazeBackMat,
    contourInkMat,
    0.036,
    seed + 13
  );
  backValance.position.set(0, -h * 0.36, depth * 0.12);
  group.add(backValance);

  // 4. Staggered sculpted icicle drips hanging down the sheer rock cliff face
  const dripCount = scallopCount + 4;
  for (let i = 0; i < dripCount; i++) {
    const t = (i + 0.5) / dripCount;
    const xPos = THREE.MathUtils.lerp(-halfW * 0.88, halfW * 0.88, t);
    const dripLen = 0.28 + ((i * 5 + seed) % 5) * 0.09;
    const topRadius = 0.036 + ((i * 3) % 3) * 0.009;
    const bendM = (i % 2 === 0 ? 1 : -1) * (0.02 + (i % 3) * 0.008);
    const zOffset = depth * 0.28 + (i % 2 === 0 ? 0.032 : -0.022);

    const drip = createSculptedIcicleDrip(
      dripLen,
      topRadius,
      icicleMat,
      bendM
    );
    drip.position.set(xPos, -h * 0.3, zOffset);
    group.add(drip);
  }

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
    new THREE.TubeGeometry(trunkCurve, 8, 0.032 * scale, 7, false),
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
      new THREE.ConeGeometry(tierRadius, tierHeight, 10),
      pineMat
    );
    cone.position.set(offsetX, tierY, 0);
    cone.rotation.z = leanDir * (tier % 2 === 0 ? -0.16 : 0.18);
    cone.castShadow = true;
    tree.add(cone);

    const snowCap = new THREE.Mesh(
      new THREE.ConeGeometry(tierRadius * 0.88, tierHeight * 0.46, 10),
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

/**
 * Helper to create a sharp, undercut, overhanging rock & glacier cliff wing
 * portal (`createSeussianIceWaveWing`) matching the overhanging cliff prows in
 * the user's reference cliff photo (`media_1791674030094_e7bdb4e4.png`) with
 * faceted dark rock walls, a sleek sloping white snowpack on the upper plateau,
 * and icicles hanging from the jutting rock lip.
 */
function createSeussianIceWaveWing(
  side: -1 | 1,
  height: number,
  width: number,
  rockFaceMat: THREE.Material,
  rockShadowUndersideMat: THREE.Material,
  snowCrestMat: THREE.Material,
  contourInkMat: THREE.Material,
  icicleMat: THREE.Material,
  seed = 1
): THREE.Group {
  const wingGroup = new THREE.Group();

  // Sharp, angular, undercut overhanging rock cliff profile (like media_1791674030094_e7bdb4e4.png)
  const cliffWingShape = new THREE.Shape();
  cliffWingShape.moveTo(-0.12, 0);
  cliffWingShape.lineTo(-0.16, height * 0.42);
  cliffWingShape.lineTo(-0.08, height * 0.78);
  cliffWingShape.lineTo(0.08, height * 0.98);
  // Sloping cliff-top plateau
  cliffWingShape.lineTo(width * 0.62, height * 0.94);
  cliffWingShape.lineTo(width * 1.14, height * 0.84);
  // Sharp jutting overhanging rock prow & undercut vertical cliff drop
  cliffWingShape.lineTo(width * 1.18, height * 0.74);
  cliffWingShape.lineTo(width * 0.96, height * 0.66);
  cliffWingShape.lineTo(width * 1.02, height * 0.56);
  cliffWingShape.lineTo(width * 0.76, height * 0.46);
  cliffWingShape.lineTo(width * 0.82, height * 0.34);
  cliffWingShape.lineTo(width * 0.62, height * 0.18);
  cliffWingShape.lineTo(width * 0.66, 0);
  cliffWingShape.closePath();

  const wingGeo = new THREE.ExtrudeGeometry(cliffWingShape, {
    depth: 0.32,
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 1,
    bevelSize: 0.018,
    bevelThickness: 0.018,
  });

  // Chisel planar rock facets onto the front wall
  const pos = wingGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    if (vz > 0.15) {
      const facetOffset =
        Math.sin(vy * 5.2 + seed) * 0.035 + Math.cos(vx * 6.4 - seed) * 0.028;
      pos.setZ(i, vz + facetOffset);
    }
  }
  normalizeExtrudeUVs(wingGeo, 'fit');
  wingGeo.computeVertexNormals();

  const wingMesh = new THREE.Mesh(wingGeo, rockFaceMat);
  wingMesh.castShadow = true;
  wingMesh.receiveShadow = true;
  wingGroup.add(wingMesh);

  // Recessed dark undercut rock shadow band beneath the overhanging prow
  const undercutShape = new THREE.Shape();
  undercutShape.moveTo(width * 0.52, height * 0.16);
  undercutShape.lineTo(width * 0.48, height * 0.48);
  undercutShape.lineTo(width * 0.68, height * 0.66);
  undercutShape.lineTo(width * 1.08, height * 0.78);
  undercutShape.lineTo(width * 1.16, height * 0.73);
  undercutShape.lineTo(width * 0.94, height * 0.64);
  undercutShape.lineTo(width * 0.74, height * 0.44);
  undercutShape.lineTo(width * 0.62, height * 0.14);
  undercutShape.closePath();

  const undercutGeo = new THREE.ExtrudeGeometry(undercutShape, {
    depth: 0.24,
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 1,
    bevelSize: 0.014,
    bevelThickness: 0.014,
  });
  normalizeExtrudeUVs(undercutGeo, 'fit');
  undercutGeo.computeVertexNormals();

  const undercutMesh = new THREE.Mesh(undercutGeo, rockShadowUndersideMat);
  undercutMesh.position.set(0, 0, 0.11);
  undercutMesh.castShadow = true;
  undercutMesh.receiveShadow = true;
  wingGroup.add(undercutMesh);

  // Sleek white snowpack blanket resting on the upper plateau of the wing cliff
  const wingSnowPack = createCliffTopSnowPackCornice(
    width * 1.18,
    0.34,
    0.38,
    5,
    snowCrestMat,
    rockShadowUndersideMat,
    icicleMat,
    rockShadowUndersideMat,
    contourInkMat,
    seed + 20,
    -0.12
  );
  wingSnowPack.position.set(width * 0.52, height * 0.9, 0.18);
  wingSnowPack.rotation.z = -0.11;
  wingGroup.add(wingSnowPack);

  // Extra hanging icicle drips under the overhanging rock prow nose
  for (let d = 0; d < 5; d++) {
    const dt = d / 4;
    const dx = THREE.MathUtils.lerp(width * 0.72, width * 1.12, dt);
    const dy = THREE.MathUtils.lerp(height * 0.56, height * 0.74, dt);
    const drip = createSculptedIcicleDrip(
      0.26 + ((d + seed) % 3) * 0.08,
      0.034,
      icicleMat,
      (d % 2 === 0 ? 1 : -1) * 0.022
    );
    drip.position.set(dx, dy, 0.22);
    wingGroup.add(drip);
  }

  wingGroup.scale.x = -side;

  return wingGroup;
}

/**
 * Builds the Jagged, Stepped, Stratified Alpine Rock Cliff Complex with White
 * Snowpacks on Top, Snow-Filled Couloir Gullies, and Hanging Icicle Curtains for
 * Stage Right (`side = -1`) or Stage Left (`side = 1`), directly inspired by
 * the user's three alpine cliff reference photographs:
 * - Stepped vertical & undercut stratified rock cliff buttresses (dark slate &
 *   warm limestone ochre facets, sharp horizontal rock joints)
 * - Clean, sloping white snow blankets sitting on top of each cliff plateau and
 *   spilling down the angled rock gullies between pillars
 * - Towering jagged, pointed Dolomite-style alpine rock spires rising above
 * - Awesome sculpted icicle valances & icicle drips hanging off the sheer cliff lips
 */
function createSideSnowMountainCliffComplex(
  side: -1 | 1,
  rockCliffMat: THREE.Material,
  snowCapMat: THREE.Material,
  rockOchreFacetMat: THREE.Material,
  rockShadowCreviceMat: THREE.Material,
  underShadowMat: THREE.Material,
  contourInkMat: THREE.Material,
  icicleMat: THREE.Material,
  pineGreenMat: THREE.Material,
  trunkMat: THREE.Material
): THREE.Group {
  const cliffComplex = new THREE.Group();
  cliffComplex.name = side === -1 ? 'SnowPortal_DSR' : 'SnowPortal_DSL';
  cliffComplex.userData.subUnitId =
    side === -1 ? 'grinch-portal-dsr-cliff' : 'grinch-portal-dsl-cliff';

  // ==========================================================================
  // PLANE 1 (z = +0.26m): DOWNSTAGE STEPPED JAGGED ROCK CLIFF BUTTRESSES +
  //                       SNOWPACK PLATEAUS + COULOIR SNOW CHUTE + ALPINE SPIRES
  // ==========================================================================
  const outerTowerGroup = new THREE.Group();
  outerTowerGroup.position.set(side * 5.78, 0, 0.26);
  outerTowerGroup.rotation.y = side * -0.18;

  const towerMirrored = new THREE.Group();
  towerMirrored.scale.x = -side;

  // 1A. Outer Tall Undercut/Overhanging Sheer Rock Buttress Pillar (x = -1.42m .. -0.05m, y = 0 .. 3.58m)
  //     (Matches the tall overhanging dark rock cliff pillar in media_1791674030094_e7bdb4e4.png
  //      and the left sheer limestone cliff wall in media_1791674016996_ec819d4f.png!)
  const tallPillarShape = new THREE.Shape();
  tallPillarShape.moveTo(-1.42, 0);
  tallPillarShape.lineTo(-1.48, 1.18);
  tallPillarShape.lineTo(-1.38, 1.26);
  tallPillarShape.lineTo(-1.46, 2.42);
  tallPillarShape.lineTo(-1.54, 3.36); // Overhanging upper rock prow
  tallPillarShape.lineTo(-1.42, 3.62);
  tallPillarShape.lineTo(-0.08, 3.48); // Slanted flat rock plateau top
  tallPillarShape.lineTo(0.02, 2.75);  // Steep vertical fracture cleft wall
  tallPillarShape.lineTo(-0.12, 2.66);
  tallPillarShape.lineTo(-0.04, 1.54);
  tallPillarShape.lineTo(-0.16, 1.44);
  tallPillarShape.lineTo(-0.02, 0);
  tallPillarShape.closePath();

  const tallPillarGeo = new THREE.ExtrudeGeometry(tallPillarShape, {
    depth: 0.62,
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 1,
    bevelSize: 0.018,
    bevelThickness: 0.018,
  });
  tallPillarGeo.translate(0, 0, -0.31);

  // Chisel sharp vertical ridge arrête and stepped horizontal rock facets onto the front wall
  const tallPos = tallPillarGeo.attributes.position;
  for (let i = 0; i < tallPos.count; i++) {
    const vx = tallPos.getX(i);
    const vy = tallPos.getY(i);
    const vz = tallPos.getZ(i);
    if (vz > 0) {
      const arrete = (1.0 - Math.min(1.0, Math.abs(vx + 0.68) / 0.82)) * 0.14;
      const stratumStep = Math.floor(vy * 2.2) * 0.018;
      tallPos.setZ(i, vz + arrete - ( strMod(Math.floor(vy * 3.5), 2) * 0.032 ) + stratumStep * 0.2);
    }
  }
  normalizeExtrudeUVs(tallPillarGeo, 'fit');
  tallPillarGeo.computeVertexNormals();

  const tallPillarMesh = new THREE.Mesh(tallPillarGeo, rockCliffMat);
  tallPillarMesh.castShadow = true;
  tallPillarMesh.receiveShadow = true;
  towerMirrored.add(tallPillarMesh);

  // 1B. Inner Stepped Lower Sheer Rock Buttress Pillar (x = -0.02m .. +1.26m, y = 0 .. 2.88m)
  //     (Matches the stepped right-hand vertical rock cliff face in media_1791674016996_ec819d4f.png!)
  const steppedPillarShape = new THREE.Shape();
  steppedPillarShape.moveTo(-0.06, 0);
  steppedPillarShape.lineTo(-0.08, 2.86);
  steppedPillarShape.lineTo(1.12, 2.74); // Flat/slanted rock shelf top
  steppedPillarShape.lineTo(1.26, 2.52); // Sharp jutting rock lip
  steppedPillarShape.lineTo(1.14, 2.42);
  steppedPillarShape.lineTo(1.22, 1.76);
  steppedPillarShape.lineTo(1.08, 1.66);
  steppedPillarShape.lineTo(1.19, 0.92);
  steppedPillarShape.lineTo(1.28, 0);
  steppedPillarShape.closePath();

  const steppedPillarGeo = new THREE.ExtrudeGeometry(steppedPillarShape, {
    depth: 0.54,
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 1,
    bevelSize: 0.018,
    bevelThickness: 0.018,
  });
  steppedPillarGeo.translate(0, 0, -0.22);

  const stepPos = steppedPillarGeo.attributes.position;
  for (let i = 0; i < stepPos.count; i++) {
    const vx = stepPos.getX(i);
    const vy = stepPos.getY(i);
    const vz = stepPos.getZ(i);
    if (vz > 0) {
      const arrete = (1.0 - Math.min(1.0, Math.abs(vx - 0.58) / 0.74)) * 0.12;
      const blockStep = strMod(Math.floor(vy * 3.2 + vx * 2.1), 3) * 0.026;
      stepPos.setZ(i, vz + arrete - blockStep);
    }
  }
  normalizeExtrudeUVs(steppedPillarGeo, 'fit');
  steppedPillarGeo.computeVertexNormals();

  const steppedPillarMesh = new THREE.Mesh(steppedPillarGeo, rockOchreFacetMat);
  steppedPillarMesh.castShadow = true;
  steppedPillarMesh.receiveShadow = true;
  towerMirrored.add(steppedPillarMesh);

  // 1C. Sharp Horizontal Protruding Stratified Rock Ledges & Narrow Snow/Icicle Seams
  //     across the vertical rock cliff walls (matching media_1791674016996_ec819d4f.png!)
  for (const [lx, ly, lz, lw, lh, ld, tiltZ, hasMiniSnow] of [
    [-0.78, 1.18, 0.28, 1.24, 0.14, 0.26, -0.04, true],
    [-0.74, 2.22, 0.3, 1.18, 0.16, 0.28, 0.03, true],
    [0.58, 0.96, 0.26, 1.12, 0.14, 0.24, -0.05, false],
    [0.56, 1.78, 0.28, 1.08, 0.15, 0.26, -0.03, true],
  ] as const) {
    const rockShelf = createJaggedRockShardBlock(
      lw,
      lh,
      ld,
      rockCliffMat,
      side === -1 ? 10 : 20,
      0
    );
    rockShelf.position.set(lx, ly, lz);
    rockShelf.rotation.z = tiltZ;
    towerMirrored.add(rockShelf);

    if (hasMiniSnow) {
      // Thin white snow seam & mini icicles clinging to the horizontal rock joint
      const seamSnow = new THREE.Mesh(
        new RoundedBoxGeometry(lw * 0.92, 0.065, ld * 0.88, 1, 0.012),
        snowCapMat
      );
      seamSnow.position.set(lx, ly + lh * 0.5 + 0.025, lz + 0.02);
      seamSnow.rotation.z = tiltZ;
      towerMirrored.add(seamSnow);

      for (let m = -2; m <= 2; m++) {
        const miniDrip = createSculptedIcicleDrip(
          0.16 + (Math.abs(m) % 2) * 0.06,
          0.022,
          icicleMat,
          m * 0.01
        );
        miniDrip.position.set(
          lx + m * (lw * 0.18),
          ly + lh * 0.35,
          lz + ld * 0.44
        );
        towerMirrored.add(miniDrip);
      }
    }
  }

  // 1D. Steep White Snow Couloir / Gully Chute Wedged Between the Two Rock Pillars
  //     (Directly matching the diagonal snow chute between the two rock faces in media_1791674016996_ec819d4f.png!)
  const couloirShape = new THREE.Shape();
  couloirShape.moveTo(-0.34, 3.48);
  couloirShape.lineTo(0.28, 2.82);
  couloirShape.lineTo(0.46, 0.85);
  couloirShape.lineTo(-0.18, 0.85);
  couloirShape.lineTo(-0.06, 2.45);
  couloirShape.closePath();

  const couloirGeo = new THREE.ExtrudeGeometry(couloirShape, {
    depth: 0.36,
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 1,
    bevelSize: 0.02,
    bevelThickness: 0.02,
  });
  normalizeExtrudeUVs(couloirGeo, 'fit');
  couloirGeo.computeVertexNormals();

  const couloirSnowMesh = new THREE.Mesh(couloirGeo, snowCapMat);
  couloirSnowMesh.position.set(0, 0, -0.02);
  couloirSnowMesh.castShadow = true;
  couloirSnowMesh.receiveShadow = true;
  towerMirrored.add(couloirSnowMesh);

  // 1E. Sleek Cliff-Top White Snowpack Blankets + Hanging Icicles on Both Stepped Rock Buttresses!
  const upperPlateauSnowPack = createCliffTopSnowPackCornice(
    1.52,
    0.42,
    0.68,
    5,
    snowCapMat,
    underShadowMat,
    icicleMat,
    rockShadowCreviceMat,
    contourInkMat,
    side === -1 ? 1 : 2,
    -0.14
  );
  upperPlateauSnowPack.position.set(-0.76, 3.56, 0.04);
  upperPlateauSnowPack.rotation.z = -0.08;
  towerMirrored.add(upperPlateauSnowPack);

  const lowerStepSnowPack = createCliffTopSnowPackCornice(
    1.36,
    0.38,
    0.6,
    5,
    snowCapMat,
    underShadowMat,
    icicleMat,
    rockShadowCreviceMat,
    contourInkMat,
    side === -1 ? 3 : 4,
    -0.12
  );
  lowerStepSnowPack.position.set(0.56, 2.84, 0.08);
  lowerStepSnowPack.rotation.z = -0.09;
  towerMirrored.add(lowerStepSnowPack);

  // 1F. Towering Jagged, Pointed Alpine Rock Spires Rising Above the Cliff Plateau
  //     (Directly matching the sharp Dolomite rock peaks in media_1791674009718_5788e74e.png!)
  for (const [sx, sy, sz, bw, sh, sd, lean, seedOff] of [
    [-0.92, 3.42, -0.14, 1.18, 2.28, 0.42, 0.14, 31],
    [-0.22, 3.35, -0.18, 1.04, 1.88, 0.38, 0.18, 32],
    [0.36, 2.72, -0.16, 0.92, 1.62, 0.35, 0.12, 33],
  ] as const) {
    const alpineSpire = createJaggedAlpineSpirePeak(
      bw,
      sh,
      sd,
      seedOff === 32 ? rockOchreFacetMat : rockCliffMat,
      snowCapMat,
      lean,
      (side === -1 ? 100 : 200) + seedOff
    );
    alpineSpire.position.set(sx, sy, sz);
    towerMirrored.add(alpineSpire);
  }

  // Snow-laden alpine spruce trees perched on the upper snow slope (matching media_1791674016996_ec819d4f.png!)
  const cliffPineUpper = createForcedPerspectiveWhovillePine(
    1.12,
    pineGreenMat,
    snowCapMat,
    trunkMat,
    1
  );
  cliffPineUpper.position.set(-0.28, 3.58, 0.12);
  cliffPineUpper.rotation.z = -0.08;
  towerMirrored.add(cliffPineUpper);

  const cliffPineLower = createForcedPerspectiveWhovillePine(
    0.92,
    pineGreenMat,
    snowCapMat,
    trunkMat,
    -1
  );
  cliffPineLower.position.set(0.32, 2.92, 0.14);
  cliffPineLower.rotation.z = -0.1;
  towerMirrored.add(cliffPineLower);

  // 1G. Sloping Windswept Snowbank & Angular Talus Rock Shards at the Stage-Floor Base
  //     (Matching the foreground snowbank at the foot of the cliff in media_1791674030094_e7bdb4e4.png!)
  const baseSnowBankShape = new THREE.Shape();
  baseSnowBankShape.moveTo(-1.48, 0);
  baseSnowBankShape.lineTo(-1.48, 0.58);
  baseSnowBankShape.lineTo(-0.55, 0.44);
  baseSnowBankShape.lineTo(0.35, 0.52);
  baseSnowBankShape.lineTo(1.36, 0.22);
  baseSnowBankShape.lineTo(1.42, 0);
  baseSnowBankShape.closePath();

  const baseSnowBankGeo = new THREE.ExtrudeGeometry(baseSnowBankShape, {
    depth: 0.42,
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 1,
    bevelSize: 0.024,
    bevelThickness: 0.024,
  });
  normalizeExtrudeUVs(baseSnowBankGeo, 'fit');
  baseSnowBankGeo.computeVertexNormals();

  const baseSnowBankMesh = new THREE.Mesh(baseSnowBankGeo, snowCapMat);
  baseSnowBankMesh.position.set(0, 0, 0.18);
  baseSnowBankMesh.castShadow = true;
  baseSnowBankMesh.receiveShadow = true;
  towerMirrored.add(baseSnowBankMesh);

  for (const [bx, by, bz, wx, hy, dz, seedOff] of [
    [-0.94, 0.26, 0.42, 0.54, 0.46, 0.32, 41],
    [0.08, 0.22, 0.44, 0.48, 0.38, 0.28, 42],
    [0.82, 0.24, 0.38, 0.52, 0.42, 0.3, 43],
  ] as const) {
    const talusShard = createJaggedRockShardBlock(
      wx,
      hy,
      dz,
      rockCliffMat,
      (side === -1 ? 50 : 60) + seedOff,
      0.08
    );
    talusShard.position.set(bx, by, bz);
    towerMirrored.add(talusShard);
  }

  outerTowerGroup.add(towerMirrored);
  cliffComplex.add(outerTowerGroup);

  // ==========================================================================
  // PLANE 2 (z = -0.10m): INNER STEPPED ROCK CLIFF WALL WITH SLOPING SNOW RAMP
  // ==========================================================================
  const dsInnerCragGroup = new THREE.Group();
  dsInnerCragGroup.position.set(side * 5.05, 0, -0.10);
  dsInnerCragGroup.rotation.y = side * -0.11;
  dsInnerCragGroup.scale.x = -side;

  const innerCragShape = new THREE.Shape();
  innerCragShape.moveTo(-0.98, 0);
  innerCragShape.lineTo(-0.98, 3.24);
  innerCragShape.lineTo(-0.32, 3.08);
  innerCragShape.lineTo(0.28, 2.62); // Angular cliff rim
  innerCragShape.lineTo(0.38, 2.44);
  innerCragShape.lineTo(0.26, 2.34);
  innerCragShape.lineTo(0.46, 1.56);
  innerCragShape.lineTo(0.36, 1.46);
  innerCragShape.lineTo(0.56, 0.68);
  innerCragShape.lineTo(0.62, 0);
  innerCragShape.closePath();

  const innerCragGeo = new THREE.ExtrudeGeometry(innerCragShape, {
    depth: 0.24,
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 1,
    bevelSize: 0.016,
    bevelThickness: 0.016,
  });
  innerCragGeo.translate(0, 0, -0.12);
  normalizeExtrudeUVs(innerCragGeo, 'fit');
  innerCragGeo.computeVertexNormals();

  const innerCragMesh = new THREE.Mesh(innerCragGeo, rockCliffMat);
  innerCragMesh.castShadow = true;
  innerCragMesh.receiveShadow = true;
  dsInnerCragGroup.add(innerCragMesh);

  // Sloping white snowpack blanket resting on the upper ramp of Plane 2 + hanging icicles
  const plane2SnowRamp = createCliffTopSnowPackCornice(
    1.34,
    0.34,
    0.3,
    4,
    snowCapMat,
    underShadowMat,
    icicleMat,
    rockShadowCreviceMat,
    contourInkMat,
    side === -1 ? 14 : 15,
    -0.22
  );
  plane2SnowRamp.position.set(-0.34, 2.96, 0.04);
  plane2SnowRamp.rotation.z = -0.34;
  dsInnerCragGroup.add(plane2SnowRamp);

  cliffComplex.add(dsInnerCragGroup);

  // ==========================================================================
  // PLANE 3 (z = -0.82m): UPSTAGE-OF-SCRIM JAGGED ALPINE ROCK BUTTRESS
  // ==========================================================================
  const midAlpineButtress = new THREE.Group();
  midAlpineButtress.position.set(side * 5.38, 0, -0.82);
  midAlpineButtress.rotation.y = side * -0.09;
  midAlpineButtress.scale.x = -side;

  const buttressShape = new THREE.Shape();
  buttressShape.moveTo(-1.14, 0);
  buttressShape.lineTo(-1.14, 4.18);
  buttressShape.lineTo(-0.38, 4.02);
  buttressShape.lineTo(0.46, 3.58);
  buttressShape.lineTo(0.58, 3.36); // Overhanging rock prow
  buttressShape.lineTo(0.42, 3.22);
  buttressShape.lineTo(0.68, 2.32);
  buttressShape.lineTo(0.54, 2.18);
  buttressShape.lineTo(0.78, 1.18);
  buttressShape.lineTo(0.86, 0);
  buttressShape.closePath();

  const buttressGeo = new THREE.ExtrudeGeometry(buttressShape, {
    depth: 0.36,
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 1,
    bevelSize: 0.018,
    bevelThickness: 0.018,
  });
  buttressGeo.translate(0, 0, -0.18);
  normalizeExtrudeUVs(buttressGeo, 'fit');
  buttressGeo.computeVertexNormals();

  const buttressMesh = new THREE.Mesh(buttressGeo, rockOchreFacetMat);
  buttressMesh.castShadow = true;
  buttressMesh.receiveShadow = true;
  midAlpineButtress.add(buttressMesh);

  // Sleek white snowpack cornice on the Plane 3 buttress crest (y = 3.85m)
  const buttressSnowCap = createCliffTopSnowPackCornice(
    1.72,
    0.38,
    0.44,
    5,
    snowCapMat,
    underShadowMat,
    icicleMat,
    rockShadowCreviceMat,
    contourInkMat,
    side === -1 ? 5 : 6,
    -0.18
  );
  buttressSnowCap.position.set(-0.28, 3.88, 0.06);
  buttressSnowCap.rotation.z = -0.22;
  midAlpineButtress.add(buttressSnowCap);

  // Stepped mid-wall rock ledge + snow shelf at y = 2.28m on Plane 3
  const midOutcropCrag = createJaggedRockShardBlock(
    1.16,
    0.48,
    0.32,
    rockCliffMat,
    side === -1 ? 71 : 72,
    0.1
  );
  midOutcropCrag.position.set(0.14, 2.08, 0.12);
  midAlpineButtress.add(midOutcropCrag);

  const midOutcropSnow = createCliffTopSnowPackCornice(
    1.22,
    0.32,
    0.36,
    4,
    snowCapMat,
    underShadowMat,
    icicleMat,
    rockShadowCreviceMat,
    contourInkMat,
    side === -1 ? 7 : 8,
    -0.1
  );
  midOutcropSnow.position.set(0.14, 2.38, 0.14);
  midOutcropSnow.rotation.z = -0.12;
  midAlpineButtress.add(midOutcropSnow);

  // Miniature crooked Seussian pine perched on the Plane 3 snow ledge
  const buttressPine = createForcedPerspectiveWhovillePine(
    0.95,
    pineGreenMat,
    snowCapMat,
    trunkMat,
    -1
  );
  buttressPine.position.set(0.26, 2.52, 0.16);
  buttressPine.rotation.z = -0.14;
  midAlpineButtress.add(buttressPine);

  cliffComplex.add(midAlpineButtress);

  return cliffComplex;
}

function strMod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/**
 * 1. DOWNSTAGE LEFT & RIGHT JAGGED ALPINE ROCK & SNOW CLIFF PORTALS
 *    (`'grinch-snow-portals'`)
 *    Features high-contrast stratified dark slate & limestone-ochre faceted rock
 *    cliff faces (`flatShading: true` + `createSeussianRockNormalTexture`),
 *    sleek white snowpack blankets sitting on top of the cliff plateaus and
 *    filling the rock couloirs, jagged Dolomite-style alpine rock spires, and
 *    hanging icicle valances & drips (`createSeussianIcicleValance` &
 *    `createSculptedIcicleDrip`).
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

  // Exposed stratified dark slate & granite rock cliff face material
  const rockCliffMat = new THREE.MeshStandardMaterial({
    map: jaggedRockTex,
    normalMap: seussianRockNormalTex,
    normalScale: new THREE.Vector2(1.15, 1.15),
    color: 0x6e7888,
    roughness: 0.76,
    metalness: 0.05,
    flatShading: true,
  });

  // Secondary weathered limestone-ochre / slate-grey rock facet material
  const rockOchreFacetMat = new THREE.MeshStandardMaterial({
    map: jaggedRockTex,
    normalMap: seussianRockNormalTex,
    normalScale: new THREE.Vector2(1.1, 1.1),
    color: 0x827c74,
    roughness: 0.74,
    metalness: 0.05,
    flatShading: true,
  });

  // Clean white-frost snowpack material for the snow blankets sitting ON TOP of the cliffs
  const snowCapMat = new THREE.MeshStandardMaterial({
    map: mountainCliffTex,
    normalMap: papierMacheNormalTex,
    normalScale: new THREE.Vector2(0.55, 0.55),
    color: 0xcad4dc,
    roughness: 0.56,
    metalness: 0.03,
  });

  // Deep slate-cobalt rock crevice & undercut overhang shadow material
  const rockShadowCreviceMat = new THREE.MeshStandardMaterial({
    map: jaggedRockTex,
    normalMap: seussianRockNormalTex,
    normalScale: new THREE.Vector2(0.95, 0.95),
    color: 0x3e4c62,
    roughness: 0.78,
    metalness: 0.05,
    flatShading: true,
  });

  const underShadowMat = new THREE.MeshStandardMaterial({
    normalMap: seussianRockNormalTex,
    normalScale: new THREE.Vector2(0.8, 0.8),
    color: 0x263244,
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

  for (const side of [-1, 1] as const) {
    const sideCliffComplex = createSideSnowMountainCliffComplex(
      side,
      rockCliffMat,
      snowCapMat,
      rockOchreFacetMat,
      rockShadowCreviceMat,
      underShadowMat,
      contourInkMat,
      icicleMat,
      pineGreenMat,
      trunkMat
    );
    portalsGroup.add(sideCliffComplex);
  }

  const wingWavesGroup = new THREE.Group();
  wingWavesGroup.name = 'SnowPortal_WingWaves';
  wingWavesGroup.userData.subUnitId = 'grinch-portal-wing-waves';

  for (const side of [-1, 1] as const) {
    const midCliffWing = createSeussianIceWaveWing(
      side,
      4.35,
      1.26,
      rockCliffMat,
      rockShadowCreviceMat,
      snowCapMat,
      contourInkMat,
      icicleMat,
      side === -1 ? 11 : 12
    );
    midCliffWing.position.set(side * 5.82, 0, -1.55);
    midCliffWing.rotation.y = side * -0.07;
    wingWavesGroup.add(midCliffWing);

    const tallCliffWing = createSeussianIceWaveWing(
      side,
      5.05,
      1.52,
      rockOchreFacetMat,
      rockShadowCreviceMat,
      snowCapMat,
      contourInkMat,
      icicleMat,
      side === -1 ? 15 : 16
    );
    tallCliffWing.position.set(side * 6.08, 0, -2.55);
    tallCliffWing.rotation.y = side * -0.04;
    wingWavesGroup.add(tallCliffWing);
  }

  portalsGroup.add(wingWavesGroup);

  // Upper corner jagged cliff returns (`grinch-portal-upper-header`) —
  // NO floating cloud arch across the center sky! Only sharp side cliff crag returns at |x| > 5.0m.
  const teaserArchGroup = new THREE.Group();
  teaserArchGroup.name = 'SnowPortal_UpperTeaserArch';
  teaserArchGroup.userData.subUnitId = 'grinch-portal-upper-header';
  teaserArchGroup.position.set(0, 5.85, 0.14);

  for (const side of [-1, 1] as const) {
    const cornerCrag = createJaggedAlpineSpirePeak(
      1.55,
      1.45,
      0.42,
      rockCliffMat,
      snowCapMat,
      side * -0.22,
      side === -1 ? 81 : 82
    );
    cornerCrag.position.set(side * 5.55, -0.35, 0.04);
    teaserArchGroup.add(cornerCrag);
  }

  portalsGroup.add(teaserArchGroup);

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
    normalScale: new THREE.Vector2(0.75, 0.75),
    color: 0xaabed8,
    roughness: 0.6,
    metalness: 0.03,
  });
  const midHillMat = new THREE.MeshStandardMaterial({
    map: mountainCliffTex,
    normalMap: papierMacheNormalTex,
    normalScale: new THREE.Vector2(0.72, 0.72),
    color: 0x9ab2d4,
    roughness: 0.62,
    metalness: 0.03,
  });
  const bgHillMat = new THREE.MeshStandardMaterial({
    map: mountainCliffTex,
    normalMap: papierMacheNormalTex,
    normalScale: new THREE.Vector2(0.68, 0.68),
    color: 0x8ca4ca,
    roughness: 0.64,
    metalness: 0.04,
  });
  const snowCrestMat = new THREE.MeshStandardMaterial({
    map: mountainCliffTex,
    normalMap: papierMacheNormalTex,
    normalScale: new THREE.Vector2(0.7, 0.7),
    color: 0xc4d2d8,
    roughness: 0.56,
    metalness: 0.03,
  });
  const pathRibbonMat = new THREE.MeshStandardMaterial({
    normalMap: papierMacheNormalTex,
    normalScale: new THREE.Vector2(0.55, 0.55),
    color: 0xbaccd8,
    roughness: 0.58,
    metalness: 0.03,
  });
  const iceArcadeMat = new THREE.MeshStandardMaterial({
    map: glacierWaveTex,
    normalMap: seussianRockNormalTex,
    normalScale: new THREE.Vector2(0.78, 0.78),
    color: 0x6c96c8,
    roughness: 0.58,
    metalness: 0.05,
  });
  const jaggedRockTex = createJaggedRockCliffFaceTexture();
  const crumpitBodyMat = new THREE.MeshStandardMaterial({
    map: jaggedRockTex,
    normalMap: seussianRockNormalTex,
    normalScale: new THREE.Vector2(1.05, 1.05),
    color: 0x6a7688,
    roughness: 0.72,
    metalness: 0.05,
    flatShading: true,
  });
  const crumpitShadowCliffMat = new THREE.MeshStandardMaterial({
    map: jaggedRockTex,
    normalMap: seussianRockNormalTex,
    normalScale: new THREE.Vector2(0.95, 0.95),
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

  // Iconic dripping blue-and-white Seussian icicle fingers along the right cliff overhang
  // of Mt. Crumpit (`model_1B_whoville.jpg` & `model_1F_mt_crumpit_sleigh.jpg`)
  const cliffValance = createSeussianIcicleValance(
    0.76,
    0.54,
    7,
    snowCrestMat,
    crumpitShadowCliffMat,
    0.044,
    11
  );
  cliffValance.position.set(0.68, 4.22, 0.14);
  cliffValance.rotation.z = 0.34;
  crumpitGroup.add(cliffValance);

  for (const [ix, iy, len, rad, bend] of [
    [0.32, 3.38, 0.62, 0.048, -0.03],
    [0.46, 3.62, 0.72, 0.052, 0.028],
    [0.58, 3.84, 0.64, 0.046, -0.032],
    [0.7, 4.02, 0.88, 0.056, 0.038],
    [0.82, 4.2, 0.72, 0.048, -0.028],
    [0.9, 4.42, 0.52, 0.04, 0.024],
  ] as const) {
    const cliffIcicle = createSculptedIcicleDrip(len, rad, snowCrestMat, bend);
    cliffIcicle.position.set(ix, iy, 0.18);
    cliffIcicle.rotation.z = -0.05;
    cliffIcicle.scale.set(1.0, 1.0, 0.55);
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

