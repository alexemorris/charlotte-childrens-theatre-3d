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

/**
 * Builds a 3D papier-mâché mountain crag or bulbous snow boulder (`SphereGeometry`
 * with smooth Seussian S-curve lean; surface micro-relief is driven by the
 * tangent-space normal map rather than high-frequency vertex displacement).
 */
function createSculptedPapierMacheCrag(
  radiusX: number,
  radiusY: number,
  radiusZ: number,
  material: THREE.Material,
  seed = 1,
  leanX = 0,
  cragAmplitude = 0.08
): THREE.Mesh {
  const geo = new THREE.SphereGeometry(1, 20, 16);
  const pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);

    // Flatten bottom slightly so boulders/crags sit solidly on ledges or stage floor
    const yNorm = vy < -0.65 ? -0.65 + (vy + 0.65) * 0.35 : vy;

    // Smooth low-frequency organic Seussian lobe shape (fine relief is in normalMap)
    const lobeWave =
      Math.sin(vx * 2.4 + vz * 2.1 + seed * 1.7) *
      Math.cos(yNorm * 2.8 - seed * 0.9) *
      (cragAmplitude * 0.55);

    const radialScale = 1.0 + lobeWave;
    const bendOffset = Math.pow(Math.max(0, (yNorm + 1) * 0.5), 1.45) * leanX;

    pos.setXYZ(
      i,
      vx * radiusX * radialScale + bendOffset,
      yNorm * radiusY,
      vz * radiusZ * radialScale
    );
  }

  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * Builds a 3D Seussian charcoal-ink silhouette border stroke (`TubeGeometry`)
 * along the outer edge of a scenic flat or snow cornice lip.
 */
function createSeussianInkStrokeTube(
  points: ReadonlyArray<THREE.Vector3>,
  radius: number,
  inkMat: THREE.Material
): THREE.Mesh {
  const curve = new THREE.CatmullRomCurve3([...points]);
  const geo = new THREE.TubeGeometry(
    curve,
    Math.max(12, points.length * 5),
    radius,
    6,
    false
  );
  const mesh = new THREE.Mesh(geo, inkMat);
  mesh.scale.set(1, 1, 0.45);
  return mesh;
}

/**
 * Helper to build a voluptuous, 3D papier-mâché overhanging Seussian snow-drift
 * cornice & pillowy snow mantle (`createSculptedSnowDriftCap`) matching the thick,
 * domed snow caps on the DSL/DSR mountain portals in `model_1A_preshow.jpg` and
 * `model_1B_whoville.jpg`. Uses normalized `[0..1]` UVs + tangent-space normal
 * maps for smooth, artifact-free surface relief.
 */
function createSculptedSnowDriftCap(
  width: number,
  height: number,
  depth: number,
  scallopCount: number,
  snowCapMat: THREE.Material,
  underShadowMat: THREE.Material,
  icicleMat: THREE.Material,
  glazeBackMat: THREE.Material,
  contourInkMat: THREE.Material,
  seed = 1
): THREE.Group {
  const group = new THREE.Group();
  const halfW = width * 0.5;

  // 1. Main voluptuous domed snow-drift mantle body
  const capShape = new THREE.Shape();
  capShape.moveTo(-halfW, 0.12);
  capShape.bezierCurveTo(
    -halfW - 0.14,
    height * 0.48,
    -halfW * 0.96,
    height * 0.88,
    -halfW * 0.72,
    height * 0.98
  );
  capShape.bezierCurveTo(
    -halfW * 0.28,
    height * 1.12,
    halfW * 0.28,
    height * 1.1,
    halfW * 0.74,
    height * 0.96
  );
  capShape.bezierCurveTo(
    halfW * 0.96,
    height * 0.86,
    halfW + 0.14,
    height * 0.46,
    halfW,
    0.1
  );

  // Scalloped bottom overhanging snow lip (right to left)
  const stepW = width / scallopCount;
  const scallopWavePts: THREE.Vector3[] = [];
  scallopWavePts.push(new THREE.Vector3(halfW, 0.1, depth * 0.48));

  for (let i = 0; i < scallopCount; i++) {
    const xRight = halfW - i * stepW;
    const xLeft = xRight - stepW;
    const xMid = (xRight + xLeft) * 0.5;
    const dipY = -0.09 - ((i + seed) % 3) * 0.055;
    const crestY = 0.12 + ((i + seed) % 2) * 0.045;
    capShape.quadraticCurveTo(xMid, dipY, xLeft, crestY);

    scallopWavePts.push(
      new THREE.Vector3(xMid, dipY - height * 0.46, depth * 0.5)
    );
    scallopWavePts.push(
      new THREE.Vector3(xLeft, crestY - height * 0.46, depth * 0.47)
    );
  }
  capShape.closePath();

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.075,
    bevelThickness: 0.075,
  };

  const capGeo = new THREE.ExtrudeGeometry(capShape, extrudeSettings);
  capGeo.center();
  normalizeExtrudeUVs(capGeo, 'fit');
  capGeo.computeVertexNormals();

  const capMesh = new THREE.Mesh(capGeo, snowCapMat);
  capMesh.castShadow = true;
  capMesh.receiveShadow = true;
  group.add(capMesh);

  // 2. Sculpted 3D pillowy snow mounds crowning the top ridge of the cornice
  const pillowCount = Math.max(3, Math.floor(scallopCount * 0.65));
  for (let i = 0; i < pillowCount; i++) {
    const t = pillowCount === 1 ? 0.5 : i / (pillowCount - 1);
    const px = THREE.MathUtils.lerp(-halfW * 0.68, halfW * 0.68, t);
    const archY =
      height * (0.36 + Math.sin(t * Math.PI) * 0.14) + ((i + seed) % 2) * 0.03;
    const pillow = createSculptedPapierMacheCrag(
      (width / pillowCount) * 0.66,
      height * 0.34,
      depth * 0.54,
      snowCapMat,
      seed * 11 + i,
      0,
      0.06
    );
    pillow.position.set(px, archY, 0.03);
    group.add(pillow);
  }

  // 3. Plump 3D TubeGeometry overhanging snow lip + dark Seussian ink contour under-rim
  if (scallopWavePts.length >= 3) {
    const lipCurve = new THREE.CatmullRomCurve3(scallopWavePts);
    const snowLipTube = new THREE.Mesh(
      new THREE.TubeGeometry(lipCurve, scallopCount * 8, 0.068, 8, false),
      snowCapMat
    );
    snowLipTube.scale.set(1, 0.85, 0.72);
    snowLipTube.castShadow = true;
    group.add(snowLipTube);

    const inkRimTube = new THREE.Mesh(
      new THREE.TubeGeometry(lipCurve, scallopCount * 8, 0.034, 7, false),
      contourInkMat
    );
    inkRimTube.position.set(0, -0.042, 0.025);
    group.add(inkRimTube);
  }

  // 4. Recessed dark glacier-blue shadow cavity tucked underneath the snow overhang
  const underLipGeo = new RoundedBoxGeometry(
    width * 0.94,
    Math.min(0.34, height * 0.36),
    depth * 0.82,
    3,
    0.06
  );
  const underLip = new THREE.Mesh(underLipGeo, underShadowMat);
  underLip.position.set(0, -height * 0.48, -0.03);
  underLip.castShadow = true;
  underLip.receiveShadow = true;
  group.add(underLip);

  // 5. Continuous wavy Seussian icicle valance curtain hanging from the shadow cavity
  const valance = createSeussianIcicleValance(
    width * 0.92,
    Math.min(0.56, height * 0.54),
    scallopCount * 2 + 3,
    icicleMat,
    glazeBackMat,
    0.048,
    seed
  );
  valance.position.set(0, -height * 0.36, depth * 0.18);
  group.add(valance);

  // Secondary deeper cobalt shadow icicle fringe for layered 3D depth
  const backValance = createSeussianIcicleValance(
    width * 0.9,
    Math.min(0.64, height * 0.62),
    scallopCount * 2 + 1,
    glazeBackMat,
    contourInkMat,
    0.038,
    seed + 13
  );
  backValance.position.set(0, -height * 0.4, depth * 0.08);
  group.add(backValance);

  // 6. Organic sculpted icicle drips hanging in staggered Z rows beneath the scalloped lip
  const dripCount = scallopCount + 3;
  for (let i = 0; i < dripCount; i++) {
    const t = (i + 0.5) / dripCount;
    const xPos = THREE.MathUtils.lerp(-halfW * 0.86, halfW * 0.86, t);
    const dripLen = 0.28 + ((i * 5 + seed) % 5) * 0.085;
    const topRadius = 0.038 + ((i * 3) % 3) * 0.009;
    const bendM = (i % 2 === 0 ? 1 : -1) * (0.024 + (i % 3) * 0.009);
    const zOffset = depth * 0.24 + (i % 2 === 0 ? 0.035 : -0.025);

    const drip = createSculptedIcicleDrip(
      dripLen,
      topRadius,
      icicleMat,
      bendM
    );
    drip.position.set(xPos, -height * 0.34, zOffset);
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
 * Helper to create a sculpted 3D papier-mâché Seussian glacial ice-wave wing
 * portal matching the dramatic S-curved blue ice-wave flats framing Whoville in
 * `model_1B_whoville.jpg`, `model_1D_shopping.jpg`, `model_1F_mt_crumpit_sleigh.jpg`,
 * and `model_1G_finale.jpg`.
 */
function createSeussianIceWaveWing(
  side: -1 | 1,
  height: number,
  width: number,
  iceFaceMat: THREE.Material,
  iceRibUndersideMat: THREE.Material,
  snowCrestMat: THREE.Material,
  contourInkMat: THREE.Material,
  icicleMat: THREE.Material,
  seed = 1
): THREE.Group {
  const wingGroup = new THREE.Group();

  const waveShape = new THREE.Shape();
  waveShape.moveTo(-0.08, 0);
  waveShape.bezierCurveTo(
    -0.18,
    height * 0.34,
    -0.12,
    height * 0.72,
    0.14,
    height * 0.94
  );
  // Sweeping bulbous crest at the top of the glacial wave
  waveShape.bezierCurveTo(
    0.52,
    height * 1.06,
    width * 0.88,
    height * 1.04,
    width * 1.12,
    height * 0.85
  );
  // Overhanging hooked glacial nose curling inward toward stage center
  waveShape.bezierCurveTo(
    width * 1.22,
    height * 0.73,
    width * 0.96,
    height * 0.65,
    width * 0.68,
    height * 0.54
  );
  // Concave inner S-curve descending to the stage floor
  waveShape.bezierCurveTo(
    width * 0.42,
    height * 0.4,
    width * 0.46,
    height * 0.18,
    width * 0.54,
    0
  );
  waveShape.closePath();

  const waveGeo = new THREE.ExtrudeGeometry(waveShape, {
    depth: 0.28,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.055,
    bevelThickness: 0.055,
  });
  normalizeExtrudeUVs(waveGeo, 'fit');
  waveGeo.computeVertexNormals();

  const waveMesh = new THREE.Mesh(waveGeo, iceFaceMat);
  waveMesh.castShadow = true;
  waveMesh.receiveShadow = true;
  wingGroup.add(waveMesh);

  // Dark Seussian charcoal-ink silhouette backing outline
  const backOutlineMesh = new THREE.Mesh(waveGeo, contourInkMat);
  backOutlineMesh.scale.set(1.022, 1.015, 0.55);
  backOutlineMesh.position.set(0.015, 0.015, -0.045);
  wingGroup.add(backOutlineMesh);

  // Darker glacier-cobalt ribbed Seussian underside along the inner overhang curve
  // (cross-hatch ribbing is now provided by the normal map + painted texture!)
  const ribBandShape = new THREE.Shape();
  ribBandShape.moveTo(width * 0.36, height * 0.22);
  ribBandShape.bezierCurveTo(
    width * 0.38,
    height * 0.46,
    width * 0.58,
    height * 0.64,
    width * 1.04,
    height * 0.78
  );
  ribBandShape.lineTo(width * 1.14, height * 0.73);
  ribBandShape.bezierCurveTo(
    width * 0.76,
    height * 0.58,
    width * 0.5,
    height * 0.42,
    width * 0.5,
    0.08
  );
  ribBandShape.closePath();

  const ribBandGeo = new THREE.ExtrudeGeometry(ribBandShape, {
    depth: 0.22,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.032,
    bevelThickness: 0.032,
  });
  normalizeExtrudeUVs(ribBandGeo, 'fit');
  ribBandGeo.computeVertexNormals();

  const ribBandMesh = new THREE.Mesh(ribBandGeo, iceRibUndersideMat);
  ribBandMesh.position.set(0, 0, 0.09);
  ribBandMesh.castShadow = true;
  ribBandMesh.receiveShadow = true;
  wingGroup.add(ribBandMesh);

  // Bold 3D charcoal ink contour border along the inner S-curve seam
  const innerSeamCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(width * 0.38, height * 0.16, 0.35),
    new THREE.Vector3(width * 0.42, height * 0.42, 0.36),
    new THREE.Vector3(width * 0.66, height * 0.62, 0.36),
    new THREE.Vector3(width * 1.06, height * 0.78, 0.35),
  ]);
  const innerSeamTube = new THREE.Mesh(
    new THREE.TubeGeometry(innerSeamCurve, 24, 0.022, 7, false),
    contourInkMat
  );
  wingGroup.add(innerSeamTube);

  // Plump 3D papier-mâché snowy crest crowning the upper curve of the ice wave
  const crestCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.06, height * 0.86, 0.24),
    new THREE.Vector3(width * 0.34, height * 0.99, 0.28),
    new THREE.Vector3(width * 0.74, height * 0.98, 0.28),
    new THREE.Vector3(width * 1.1, height * 0.82, 0.25),
  ]);
  const crestTube = new THREE.Mesh(
    new THREE.TubeGeometry(crestCurve, 28, 0.16, 10, false),
    snowCrestMat
  );
  crestTube.scale.set(1, 0.92, 0.78);
  crestTube.castShadow = true;
  wingGroup.add(crestTube);

  // Hanging sculpted icicle drips tucked under the overhanging hooked nose of the wave
  for (let d = 0; d < 5; d++) {
    const dt = d / 4;
    const dx = THREE.MathUtils.lerp(width * 0.72, width * 1.08, dt);
    const dy = THREE.MathUtils.lerp(height * 0.58, height * 0.74, dt);
    const drip = createSculptedIcicleDrip(
      0.22 + ((d + seed) % 3) * 0.08,
      0.032,
      icicleMat,
      (d % 2 === 0 ? 1 : -1) * 0.025
    );
    drip.position.set(dx, dy, 0.18);
    wingGroup.add(drip);
  }

  wingGroup.scale.x = -side;

  return wingGroup;
}

/**
 * Helper to build the Sculpted Multi-Faceted Downstage Papier-Mâché Snow-Cliff
 * Mountain Tower + Inner Sloping Z-Hatched Crag + Upstage Alpine Buttress for
 * either Stage Right (`side = -1`) or Stage Left (`side = 1`), faithfully matching
 * `model_1A_preshow.jpg`, `model_1B_whoville.jpg`, and `model_1C_cave_vista.jpg`.
 */
function createSideSnowMountainCliffComplex(
  side: -1 | 1,
  snowCliffMat: THREE.Material,
  snowCapMat: THREE.Material,
  midSnowFlatMat: THREE.Material,
  glacierCreviceMat: THREE.Material,
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
  // PLANE 1 (z = +0.26m): OUTER MULTI-FACETED PAPIER-MÂCHÉ SNOW-CLIFF TOWER
  // ==========================================================================
  const outerTowerGroup = new THREE.Group();
  outerTowerGroup.position.set(side * 5.78, 0, 0.26);
  outerTowerGroup.rotation.y = side * -0.18;

  const towerMirrored = new THREE.Group();
  towerMirrored.scale.x = -side;

  // 1A. Sculpted organic lower & full-height rock cliff silhouette
  const cliffFaceShape = new THREE.Shape();
  cliffFaceShape.moveTo(-1.35, 0);
  cliffFaceShape.bezierCurveTo(-1.42, 1.25, -1.32, 2.55, -1.18, 3.55);
  cliffFaceShape.bezierCurveTo(-0.55, 3.72, 0.45, 3.68, 1.06, 3.38);
  cliffFaceShape.bezierCurveTo(1.16, 2.35, 1.18, 1.18, 1.24, 0);
  cliffFaceShape.closePath();

  const cliffFaceGeo = new THREE.ExtrudeGeometry(cliffFaceShape, {
    depth: 0.56,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.08,
    bevelThickness: 0.08,
  });
  cliffFaceGeo.translate(0, 0, -0.28);
  normalizeExtrudeUVs(cliffFaceGeo, 'fit');
  cliffFaceGeo.computeVertexNormals();

  const cliffBaseMesh = new THREE.Mesh(cliffFaceGeo, snowCliffMat);
  cliffBaseMesh.castShadow = true;
  cliffBaseMesh.receiveShadow = true;
  towerMirrored.add(cliffBaseMesh);

  // Dark Seussian charcoal ink border outline along the inner stage-facing edge of the cliff tower
  const outerTowerEdgeStroke = createSeussianInkStrokeTube(
    [
      new THREE.Vector3(1.24, 0.05, 0.28),
      new THREE.Vector3(1.19, 1.15, 0.3),
      new THREE.Vector3(1.14, 2.25, 0.31),
      new THREE.Vector3(1.06, 3.35, 0.29),
    ],
    0.024,
    contourInkMat
  );
  towerMirrored.add(outerTowerEdgeStroke);

  // Sculpted 3D papier-mâché rock strata ledges & crevices across the lower cliff face (y = 0.4m to 1.8m)
  for (const [lx, ly, lz, rx, ry, rz, lean] of [
    [-0.65, 0.72, 0.26, 0.58, 0.34, 0.22, 0.08],
    [0.52, 0.64, 0.25, 0.62, 0.32, 0.22, -0.06],
    [-0.48, 1.38, 0.26, 0.54, 0.28, 0.2, 0.05],
    [0.46, 1.28, 0.25, 0.56, 0.3, 0.2, -0.08],
  ] as const) {
    const rockStratumLobe = createSculptedPapierMacheCrag(
      rx,
      ry,
      rz,
      snowCliffMat,
      side === -1 ? 10 : 20,
      lean,
      0.08
    );
    rockStratumLobe.position.set(lx, ly, lz);
    towerMirrored.add(rockStratumLobe);
  }

  // 1B. Massive, Voluptuous Overhanging Papier-Mâché Snow-Drift Mantle (y = 2.05m to 3.68m)
  const giantSnowMantle = createSculptedSnowDriftCap(
    2.68,
    1.48,
    0.72,
    7,
    snowCapMat,
    underShadowMat,
    icicleMat,
    glacierCreviceMat,
    contourInkMat,
    side === -1 ? 1 : 2
  );
  giantSnowMantle.position.set(-0.06, 2.86, 0.14);
  giantSnowMantle.rotation.z = -0.05;
  towerMirrored.add(giantSnowMantle);

  // 1C. Upper Sculpted Alpine Papier-Mâché Crag Spires rising from behind the snow mantle
  for (const [cx, cy, cz, rx, ry, rz, lean, seedOffset] of [
    [-0.78, 4.25, -0.06, 0.78, 0.98, 0.36, 0.18, 31],
    [0.12, 4.02, -0.08, 0.68, 0.78, 0.34, 0.22, 32],
    [-0.52, 5.18, -0.08, 0.82, 0.88, 0.35, 0.26, 33],
  ] as const) {
    const upperCrag = createSculptedPapierMacheCrag(
      rx,
      ry,
      rz,
      midSnowFlatMat,
      (side === -1 ? 100 : 200) + seedOffset,
      lean,
      0.09
    );
    upperCrag.position.set(cx, cy, cz);
    towerMirrored.add(upperCrag);

    // Snow-pillow cap on each upper alpine crag ledge
    const cragSnowPillow = createSculptedPapierMacheCrag(
      rx * 0.92,
      ry * 0.38,
      rz * 0.95,
      snowCapMat,
      (side === -1 ? 300 : 400) + seedOffset,
      lean * 0.5,
      0.06
    );
    cragSnowPillow.position.set(cx + 0.04, cy + ry * 0.68, cz + 0.04);
    towerMirrored.add(cragSnowPillow);
  }

  // Miniature crooked Seussian spruce tree clinging to the upper alpine cliff ledge (y = 3.58m)
  const cliffPine = createForcedPerspectiveWhovillePine(
    1.15,
    pineGreenMat,
    snowCapMat,
    trunkMat,
    1
  );
  cliffPine.position.set(0.42, 3.52, 0.16);
  cliffPine.rotation.z = -0.14;
  towerMirrored.add(cliffPine);

  // 1D. Clustered 3D Papier-Mâché Snow Boulders & Rock Outcrops at the stage-floor base
  for (const [bx, by, bz, rx, ry, rz, seedOff] of [
    [-0.88, 0.32, 0.36, 0.48, 0.38, 0.32, 41],
    [-0.12, 0.26, 0.42, 0.42, 0.32, 0.28, 42],
    [0.64, 0.28, 0.38, 0.46, 0.34, 0.3, 43],
  ] as const) {
    const baseBoulder = createSculptedPapierMacheCrag(
      rx,
      ry,
      rz,
      snowCapMat,
      (side === -1 ? 50 : 60) + seedOff,
      0.05,
      0.08
    );
    baseBoulder.position.set(bx, by, bz);
    towerMirrored.add(baseBoulder);
  }

  outerTowerGroup.add(towerMirrored);
  cliffComplex.add(outerTowerGroup);

  // ==========================================================================
  // PLANE 2 (z = -0.10m): INNER DOWNSTAGE SLOPING SEUSSIAN SNOW-CLIFF CRAG
  // ==========================================================================
  const dsInnerCragGroup = new THREE.Group();
  dsInnerCragGroup.position.set(side * 5.05, 0, -0.10);
  dsInnerCragGroup.rotation.y = side * -0.11;
  dsInnerCragGroup.scale.x = -side;

  const innerCragShape = new THREE.Shape();
  innerCragShape.moveTo(-0.95, 0);
  innerCragShape.lineTo(-0.95, 3.28);
  innerCragShape.bezierCurveTo(-0.52, 3.36, -0.08, 3.16, 0.22, 2.78);
  innerCragShape.bezierCurveTo(0.42, 2.15, 0.48, 1.08, 0.58, 0);
  innerCragShape.closePath();

  const innerCragGeo = new THREE.ExtrudeGeometry(innerCragShape, {
    depth: 0.18,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.04,
    bevelThickness: 0.04,
  });
  innerCragGeo.translate(0, 0, -0.09);
  normalizeExtrudeUVs(innerCragGeo, 'fit');
  innerCragGeo.computeVertexNormals();

  const innerCragMesh = new THREE.Mesh(innerCragGeo, snowCapMat);
  innerCragMesh.castShadow = true;
  innerCragMesh.receiveShadow = true;
  dsInnerCragGroup.add(innerCragMesh);

  // Pillowy 3D snow-drift roll crowning the sloping upper ridge of Plane 2
  const slopingCrestCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.88, 3.24, 0.08),
    new THREE.Vector3(-0.42, 3.22, 0.11),
    new THREE.Vector3(-0.02, 3.02, 0.11),
    new THREE.Vector3(0.24, 2.74, 0.09),
  ]);
  const slopingCrestTube = new THREE.Mesh(
    new THREE.TubeGeometry(slopingCrestCurve, 20, 0.12, 8, false),
    snowCapMat
  );
  slopingCrestTube.scale.set(1, 0.85, 0.68);
  dsInnerCragGroup.add(slopingCrestTube);

  // Bold 3D Seussian charcoal-black ink border tracing the sloping crest & inner cliff edge
  const innerCragBorderTube = createSeussianInkStrokeTube(
    [
      new THREE.Vector3(-0.85, 3.3, 0.12),
      new THREE.Vector3(-0.28, 3.18, 0.13),
      new THREE.Vector3(0.22, 2.78, 0.13),
      new THREE.Vector3(0.39, 2.05, 0.13),
      new THREE.Vector3(0.48, 1.05, 0.12),
      new THREE.Vector3(0.57, 0.04, 0.11),
    ],
    0.022,
    contourInkMat
  );
  dsInnerCragGroup.add(innerCragBorderTube);

  cliffComplex.add(dsInnerCragGroup);

  // ==========================================================================
  // PLANE 3 (z = -0.82m): UPSTAGE-OF-SCRIM SCULPTED PAPIER-MÂCHÉ ALPINE BUTTRESS
  // ==========================================================================
  const midAlpineButtress = new THREE.Group();
  midAlpineButtress.position.set(side * 5.38, 0, -0.82);
  midAlpineButtress.rotation.y = side * -0.09;
  midAlpineButtress.scale.x = -side;

  const buttressShape = new THREE.Shape();
  buttressShape.moveTo(-1.1, 0);
  buttressShape.lineTo(-1.1, 4.15);
  buttressShape.bezierCurveTo(-0.55, 4.38, 0.15, 4.12, 0.48, 3.62);
  buttressShape.bezierCurveTo(0.68, 3.05, 0.52, 2.28, 0.66, 1.55);
  buttressShape.bezierCurveTo(0.76, 0.95, 0.78, 0.42, 0.82, 0);
  buttressShape.closePath();

  const buttressGeo = new THREE.ExtrudeGeometry(buttressShape, {
    depth: 0.34,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.055,
    bevelThickness: 0.055,
  });
  buttressGeo.translate(0, 0, -0.17);
  normalizeExtrudeUVs(buttressGeo, 'fit');
  buttressGeo.computeVertexNormals();

  const buttressMesh = new THREE.Mesh(buttressGeo, midSnowFlatMat);
  buttressMesh.castShadow = true;
  buttressMesh.receiveShadow = true;
  midAlpineButtress.add(buttressMesh);

  // Overhanging sculpted snow-drift cornice on the Plane 3 buttress crest (y = 3.85m)
  const buttressSnowCap = createSculptedSnowDriftCap(
    1.76,
    0.78,
    0.44,
    5,
    snowCapMat,
    underShadowMat,
    icicleMat,
    glacierCreviceMat,
    contourInkMat,
    side === -1 ? 5 : 6
  );
  buttressSnowCap.position.set(-0.22, 3.82, 0.08);
  buttressSnowCap.rotation.z = -0.18;
  midAlpineButtress.add(buttressSnowCap);

  // Secondary lower rocky crag outcrop + snow shelf at y = 2.15m on Plane 3
  const midOutcropCrag = createSculptedPapierMacheCrag(
    0.68,
    0.58,
    0.28,
    snowCliffMat,
    side === -1 ? 71 : 72,
    0.12,
    0.09
  );
  midOutcropCrag.position.set(0.18, 2.05, 0.14);
  midAlpineButtress.add(midOutcropCrag);

  const midOutcropSnow = createSculptedSnowDriftCap(
    1.28,
    0.52,
    0.36,
    4,
    snowCapMat,
    underShadowMat,
    icicleMat,
    glacierCreviceMat,
    contourInkMat,
    side === -1 ? 7 : 8
  );
  midOutcropSnow.position.set(0.14, 2.42, 0.16);
  midOutcropSnow.rotation.z = -0.12;
  midAlpineButtress.add(midOutcropSnow);

  // Miniature crooked Seussian pine perched on the Plane 3 ledge
  const buttressPine = createForcedPerspectiveWhovillePine(
    0.95,
    pineGreenMat,
    snowCapMat,
    trunkMat,
    -1
  );
  buttressPine.position.set(0.28, 2.62, 0.18);
  buttressPine.rotation.z = -0.18;
  midAlpineButtress.add(buttressPine);

  cliffComplex.add(midAlpineButtress);

  return cliffComplex;
}

/**
 * 1. DOWNSTAGE LEFT & RIGHT SCULPTED SEUSSIAN SNOW-CLIFF PORTALS
 *    (`'grinch-snow-portals'`)
 *    Uses tangent-space normal maps (`createPapierMacheNormalTexture` and
 *    `createSeussianRockNormalTexture`) and normalized UVs for high-definition
 *    papier-mâché surface relief with zero tiling seams.
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

  // Toned-down papier-mâché snow & glacier materials with tangent-space normalMap
  const snowCliffMat = new THREE.MeshStandardMaterial({
    map: mountainCliffTex,
    normalMap: seussianRockNormalTex,
    normalScale: new THREE.Vector2(0.85, 0.85),
    color: 0xb4c8d8,
    roughness: 0.64,
    metalness: 0.03,
  });

  const snowCapMat = new THREE.MeshStandardMaterial({
    map: mountainCliffTex,
    normalMap: papierMacheNormalTex,
    normalScale: new THREE.Vector2(0.75, 0.75),
    color: 0xc6d2d8,
    roughness: 0.58,
    metalness: 0.03,
  });

  const midSnowFlatMat = new THREE.MeshStandardMaterial({
    map: mountainCliffTex,
    normalMap: seussianRockNormalTex,
    normalScale: new THREE.Vector2(0.82, 0.82),
    color: 0xa6bed6,
    roughness: 0.62,
    metalness: 0.04,
  });

  const iceWaveFaceMat = new THREE.MeshStandardMaterial({
    map: glacierWaveTex,
    normalMap: papierMacheNormalTex,
    normalScale: new THREE.Vector2(0.78, 0.78),
    color: 0x98b8d8,
    roughness: 0.58,
    metalness: 0.05,
  });

  const iceWaveRibMat = new THREE.MeshStandardMaterial({
    map: glacierWaveTex,
    normalMap: seussianRockNormalTex,
    normalScale: new THREE.Vector2(0.92, 0.92),
    color: 0x5c88be,
    roughness: 0.6,
    metalness: 0.06,
  });

  const underShadowMat = new THREE.MeshStandardMaterial({
    normalMap: papierMacheNormalTex,
    normalScale: new THREE.Vector2(0.7, 0.7),
    color: 0x36547c,
    roughness: 0.68,
    metalness: 0.04,
  });

  const contourInkMat = new THREE.MeshStandardMaterial({
    color: 0x203048,
    roughness: 0.74,
    metalness: 0.02,
  });

  const icicleMat = new THREE.MeshStandardMaterial({
    color: 0xbcd0d8,
    roughness: 0.55,
    metalness: 0.07,
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
      snowCliffMat,
      snowCapMat,
      midSnowFlatMat,
      iceWaveRibMat,
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
    const midIceWave = createSeussianIceWaveWing(
      side,
      4.35,
      1.26,
      midSnowFlatMat,
      iceWaveRibMat,
      snowCapMat,
      contourInkMat,
      icicleMat,
      side === -1 ? 11 : 12
    );
    midIceWave.position.set(side * 5.82, 0, -1.55);
    midIceWave.rotation.y = side * -0.07;
    wingWavesGroup.add(midIceWave);

    const tallIceWave = createSeussianIceWaveWing(
      side,
      5.05,
      1.52,
      iceWaveFaceMat,
      iceWaveRibMat,
      snowCapMat,
      contourInkMat,
      icicleMat,
      side === -1 ? 15 : 16
    );
    tallIceWave.position.set(side * 6.08, 0, -2.55);
    tallIceWave.rotation.y = side * -0.04;
    wingWavesGroup.add(tallIceWave);
  }

  portalsGroup.add(wingWavesGroup);

  const teaserArchGroup = new THREE.Group();
  teaserArchGroup.name = 'SnowPortal_UpperTeaserArch';
  teaserArchGroup.userData.subUnitId = 'grinch-portal-upper-header';
  teaserArchGroup.position.set(0, 6.58, 0.14);

  const teaserSpan = createSculptedSnowDriftCap(
    13.6,
    1.12,
    0.48,
    14,
    snowCapMat,
    underShadowMat,
    icicleMat,
    iceWaveRibMat,
    contourInkMat,
    9
  );
  teaserArchGroup.add(teaserSpan);

  // Sculpted 3D papier-mâché corner mountain haunches & hanging icicles bridging
  // the upper arch into the left and right mountain cliff complexes (y = 5.6m–6.6m)
  for (const side of [-1, 1] as const) {
    const cornerHaunchCrag = createSculptedPapierMacheCrag(
      1.35,
      0.86,
      0.38,
      snowCliffMat,
      side === -1 ? 81 : 82,
      side * -0.18,
      0.14
    );
    cornerHaunchCrag.position.set(side * 5.25, -0.56, 0.06);
    teaserArchGroup.add(cornerHaunchCrag);

    const cornerSnowCornice = createSculptedSnowDriftCap(
      2.45,
      0.68,
      0.46,
      5,
      snowCapMat,
      underShadowMat,
      icicleMat,
      iceWaveRibMat,
      contourInkMat,
      side === -1 ? 17 : 18
    );
    cornerSnowCornice.position.set(side * 5.15, -0.42, 0.1);
    cornerSnowCornice.rotation.z = side * 0.22;
    teaserArchGroup.add(cornerSnowCornice);
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
  const crumpitBodyMat = new THREE.MeshStandardMaterial({
    map: mountainCliffTex,
    normalMap: seussianRockNormalTex,
    normalScale: new THREE.Vector2(0.88, 0.88),
    color: 0x96acd0,
    roughness: 0.59,
    metalness: 0.04,
  });
  const crumpitShadowCliffMat = new THREE.MeshStandardMaterial({
    map: glacierWaveTex,
    normalMap: seussianRockNormalTex,
    normalScale: new THREE.Vector2(0.85, 0.85),
    color: 0x6284b6,
    roughness: 0.62,
    metalness: 0.05,
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
  // D. Towering Crooked S-Curved Papier-Mâché Horn of Mt. Crumpit (z = -7.25m)
  // --------------------------------------------------------------------------
  const crumpitGroup = new THREE.Group();
  crumpitGroup.name = 'MtCrumpit_PeakUnit';
  crumpitGroup.position.set(0, 0, -7.25);

  const crumpitShape = new THREE.Shape();
  crumpitShape.moveTo(-3.75, 0);
  crumpitShape.bezierCurveTo(-3.4, 1.88, -2.55, 2.66, -1.62, 2.98);
  crumpitShape.bezierCurveTo(-0.82, 3.28, -0.42, 4.38, 0.1, 5.02);
  crumpitShape.bezierCurveTo(0.4, 5.32, 0.8, 5.22, 0.95, 4.86);
  crumpitShape.bezierCurveTo(1.08, 4.5, 0.84, 4.18, 0.66, 3.92);
  crumpitShape.bezierCurveTo(0.78, 3.68, 0.58, 3.32, 0.44, 2.95);
  crumpitShape.bezierCurveTo(0.56, 2.15, 0.86, 1.15, 1.08, 0);
  crumpitShape.closePath();

  const crumpitGeo = new THREE.ExtrudeGeometry(crumpitShape, {
    depth: 0.28,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.05,
    bevelThickness: 0.05,
  });
  normalizeExtrudeUVs(crumpitGeo, 'fit');
  crumpitGeo.computeVertexNormals();

  const crumpitMesh = new THREE.Mesh(crumpitGeo, crumpitBodyMat);
  crumpitMesh.castShadow = true;
  crumpitMesh.receiveShadow = true;
  crumpitGroup.add(crumpitMesh);

  // Dark Seussian ink outline backing Mt. Crumpit (staggered at z = -0.05m)
  const crumpitOutline = new THREE.Mesh(crumpitGeo, contourInkMat);
  crumpitOutline.scale.set(1.018, 1.018, 0.55);
  crumpitOutline.position.set(0, 0.022, -0.05);
  crumpitGroup.add(crumpitOutline);

  // Sculpted 3D S-curved snow-cap spine ridge along Mt. Crumpit's crest (staggered at z = +0.18m)
  const spineCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.7, 2.18, 0.18),
    new THREE.Vector3(-1.58, 2.94, 0.21),
    new THREE.Vector3(-0.55, 3.82, 0.24),
    new THREE.Vector3(0.15, 4.92, 0.26),
    new THREE.Vector3(0.7, 4.96, 0.26),
  ]);
  const spineTube = new THREE.Mesh(
    new THREE.TubeGeometry(spineCurve, 32, 0.21, 9, false),
    snowCrestMat
  );
  spineTube.scale.set(1, 0.76, 0.52);
  crumpitGroup.add(spineTube);

  // Overhanging summit papier-mâché snow cap crowning the peak at (x = 0.38, y = 4.94, z = +0.28m)
  const summitSnowCap = createSculptedSnowDriftCap(
    1.24,
    0.62,
    0.28,
    4,
    snowCrestMat,
    crumpitShadowCliffMat,
    snowCrestMat,
    crumpitShadowCliffMat,
    contourInkMat,
    9
  );
  summitSnowCap.position.set(0.38, 4.94, 0.28);
  summitSnowCap.rotation.z = -0.24;
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

  // Sculpted 3D papier-mâché crag outcrops & Seussian contour ledges on Mt. Crumpit's face
  for (const [lx, ly, rx, ry, rz, lean, seedOff] of [
    [-1.48, 2.62, 0.52, 0.24, 0.18, 0.34, 91],
    [-0.58, 3.35, 0.44, 0.22, 0.18, 0.5, 92],
    [-0.06, 4.18, 0.38, 0.2, 0.16, 0.42, 93],
    [0.24, 3.52, 0.34, 0.18, 0.16, -0.28, 94],
  ] as const) {
    const cragLobe = createSculptedPapierMacheCrag(
      rx,
      ry,
      rz,
      crumpitShadowCliffMat,
      seedOff,
      lean,
      0.13
    );
    cragLobe.position.set(lx, ly, 0.26);
    crumpitGroup.add(cragLobe);
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
    new RoundedBoxGeometry(0.36, 0.4, 0.1, 3, 0.08),
    contourInkMat
  );
  caveFrame.position.set(0.32, 4.38, 0.32);
  caveFrame.rotation.z = -0.18;
  crumpitGroup.add(caveFrame);

  const caveGlow = new THREE.Mesh(
    new RoundedBoxGeometry(0.24, 0.28, 0.06, 2, 0.06),
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
