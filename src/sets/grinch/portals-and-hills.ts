import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {
  createSculptedIcicleDrip,
  createSeussianIcicleValance,
} from '../shared-scenic-helpers.ts';

/**
 * Helper to build a scalloped overhanging Seussian snow-drift cap with a
 * continuous wavy `createSeussianIcicleValance` curtain, organic fluted
 * `createSculptedIcicleDrip` icicles, and a dark Seussian contour shadow lip
 * tucked cleanly underneath.
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
  seed = 1
): THREE.Group {
  const group = new THREE.Group();

  // Main rounded snow-drift cap body
  const capShape = new THREE.Shape();
  const halfW = width * 0.5;
  capShape.moveTo(-halfW, 0.18);
  capShape.quadraticCurveTo(
    -halfW - 0.08,
    height * 0.65,
    -halfW * 0.82,
    height * 0.92
  );
  capShape.bezierCurveTo(
    -halfW * 0.35,
    height * 1.06,
    halfW * 0.35,
    height * 1.04,
    halfW * 0.84,
    height * 0.9
  );
  capShape.quadraticCurveTo(halfW + 0.08, height * 0.62, halfW, 0.16);

  // Scalloped bottom drift edge (right to left)
  const stepW = width / scallopCount;
  for (let i = 0; i < scallopCount; i++) {
    const xRight = halfW - i * stepW;
    const xLeft = xRight - stepW;
    const xMid = (xRight + xLeft) * 0.5;
    const dipY = -0.06 - (i % 3) * 0.05;
    capShape.quadraticCurveTo(xMid, dipY, xLeft, 0.14 + (i % 2) * 0.04);
  }
  capShape.closePath();

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.055,
    bevelThickness: 0.055,
  };

  const capGeo = new THREE.ExtrudeGeometry(capShape, extrudeSettings);
  capGeo.center();
  const capMesh = new THREE.Mesh(capGeo, snowCapMat);
  capMesh.castShadow = true;
  capMesh.receiveShadow = true;
  group.add(capMesh);

  // Dark Seussian blue-charcoal shadow contour band tucked just below & behind the cap front lip
  const underLipGeo = new RoundedBoxGeometry(
    width * 0.95,
    0.2,
    depth * 0.84,
    2,
    0.05
  );
  const underLip = new THREE.Mesh(underLipGeo, underShadowMat);
  underLip.position.set(0, -height * 0.44, -0.035);
  group.add(underLip);

  // Continuous wavy Seussian icicle valance curtain tucked cleanly behind the front overhang lip
  const valance = createSeussianIcicleValance(
    width * 0.92,
    Math.min(0.42, height * 0.46),
    scallopCount * 2 + 2,
    icicleMat,
    glazeBackMat,
    0.045,
    seed
  );
  valance.position.set(0, -height * 0.32, -depth * 0.12);
  group.add(valance);

  // Organic fluted LatheGeometry icicle drips hanging from behind the scalloped lip
  const dripCount = scallopCount + 2;
  for (let i = 0; i < dripCount; i++) {
    const t = (i + 0.5) / dripCount;
    const xPos = THREE.MathUtils.lerp(-halfW * 0.84, halfW * 0.84, t);
    const dripLen = 0.24 + ((i * 5 + seed) % 4) * 0.075;
    const topRadius = 0.036 + ((i * 3) % 3) * 0.008;
    const bendM = (i % 2 === 0 ? 1 : -1) * (0.02 + (i % 3) * 0.008);
    const zOffset = -depth * 0.04 + (i % 2 === 0 ? 0.025 : -0.025);

    const drip = createSculptedIcicleDrip(
      dripLen,
      topRadius,
      icicleMat,
      bendM
    );
    // Root at y = 0 is tucked up behind the front snow cap lip (-height * 0.30)
    drip.position.set(xPos, -height * 0.30, zOffset);
    group.add(drip);
  }

  return group;
}

/**
 * Helper to create a curved Seussian ice-wave wing portal matching the
 * dramatic S-curved ice-wave flats behind the downstage snow towers in
 * `model_1B_whoville.jpg`.
 */
function createSeussianIceWaveWing(
  side: -1 | 1,
  height: number,
  width: number,
  iceFaceMat: THREE.Material,
  iceRibUndersideMat: THREE.Material,
  snowCrestMat: THREE.Material,
  contourInkMat: THREE.Material
): THREE.Group {
  const wingGroup = new THREE.Group();

  // Build in positive-X local coordinates (outer edge around x=0, curving stage-inward toward +width)
  // and mirror via scale.x = -side so Stage Right (-1) curves toward +X and Stage Left (+1) curves toward -X.
  const waveShape = new THREE.Shape();
  waveShape.moveTo(0, 0);
  waveShape.bezierCurveTo(
    -0.12,
    height * 0.35,
    -0.08,
    height * 0.72,
    0.15,
    height * 0.93
  );
  // Sweeping rounded crest at the top of the wave
  waveShape.bezierCurveTo(
    0.55,
    height * 1.04,
    width * 0.85,
    height * 1.02,
    width * 1.06,
    height * 0.84
  );
  // Overhanging lip curling inward toward stage center
  waveShape.bezierCurveTo(
    width * 1.14,
    height * 0.74,
    width * 0.92,
    height * 0.66,
    width * 0.68,
    height * 0.56
  );
  // Concave inner S-curve descending to the stage floor
  waveShape.bezierCurveTo(
    width * 0.44,
    height * 0.42,
    width * 0.48,
    height * 0.2,
    width * 0.54,
    0
  );
  waveShape.closePath();

  const waveGeo = new THREE.ExtrudeGeometry(waveShape, {
    depth: 0.22,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.035,
    bevelThickness: 0.035,
  });
  const waveMesh = new THREE.Mesh(waveGeo, iceFaceMat);
  waveMesh.castShadow = true;
  waveMesh.receiveShadow = true;
  wingGroup.add(waveMesh);

  // Darker blue ribbed Seussian underside along the inner overhang curve (staggered in Z by +0.06m)
  const ribBandShape = new THREE.Shape();
  ribBandShape.moveTo(width * 0.36, height * 0.32);
  ribBandShape.bezierCurveTo(
    width * 0.42,
    height * 0.52,
    width * 0.62,
    height * 0.66,
    width * 0.98,
    height * 0.78
  );
  ribBandShape.lineTo(width * 1.05, height * 0.73);
  ribBandShape.bezierCurveTo(
    width * 0.74,
    height * 0.6,
    width * 0.52,
    height * 0.44,
    width * 0.48,
    height * 0.24
  );
  ribBandShape.closePath();

  const ribBandGeo = new THREE.ExtrudeGeometry(ribBandShape, {
    depth: 0.16,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.02,
    bevelThickness: 0.02,
  });
  const ribBandMesh = new THREE.Mesh(ribBandGeo, iceRibUndersideMat);
  ribBandMesh.position.set(0, 0, 0.06);
  ribBandMesh.castShadow = true;
  wingGroup.add(ribBandMesh);

  // Raised Seussian cross-hatch ribs along the underside band (staggered in Z so no coplanar faces)
  const ribCount = 9;
  for (let i = 0; i < ribCount; i++) {
    const t = i / (ribCount - 1);
    const rx = THREE.MathUtils.lerp(width * 0.44, width * 0.95, t);
    const ry =
      THREE.MathUtils.lerp(height * 0.3, height * 0.76, t) +
      Math.sin(t * Math.PI) * 0.14;
    const ribGeo = new RoundedBoxGeometry(0.22, 0.045, 0.18, 2, 0.015);
    const rib = new THREE.Mesh(ribGeo, contourInkMat);
    rib.position.set(rx, ry, 0.16);
    rib.rotation.z = -0.55 - t * 0.35;
    wingGroup.add(rib);
  }

  // Snowy crest cap crowning the upper curve of the ice wave (staggered at z = +0.08m)
  const crestShape = new THREE.Shape();
  crestShape.moveTo(0.08, height * 0.88);
  crestShape.bezierCurveTo(
    0.48,
    height * 1.05,
    width * 0.84,
    height * 1.04,
    width * 1.08,
    height * 0.84
  );
  crestShape.bezierCurveTo(
    width * 0.86,
    height * 0.92,
    0.52,
    height * 0.94,
    0.12,
    height * 0.8
  );
  crestShape.closePath();

  const crestGeo = new THREE.ExtrudeGeometry(crestShape, {
    depth: 0.2,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.03,
    bevelThickness: 0.03,
  });
  const crestMesh = new THREE.Mesh(crestGeo, snowCrestMat);
  crestMesh.position.set(0, 0, 0.08);
  wingGroup.add(crestMesh);

  // Flip X so side = -1 (Stage Right) leans inward toward +X, and side = +1 (Stage Left) leans inward toward -X
  wingGroup.scale.x = -side;

  return wingGroup;
}

/**
 * 1. DOWNSTAGE LEFT & RIGHT SCULPTED SEUSSIAN SNOW-CLIFF PORTALS
 *    (`'grinch-snow-portals'`)
 *    Permanent false-proscenium tormentors (`z = +0.18m`, completely downstage
 *    of the Line #1 scrim at `z = -0.35m`), Mid-Wing Stepped Snow Flats
 *    (`z = -0.92m`, cleanly upstage of the scrim), Upper Snow-Border Teaser
 *    Arch (`y = 6.65m, z = +0.12m`), and S-curved Seussian ice-wave wing portals.
 */
export function buildGrinchSnowPortals(
  rockTex: THREE.CanvasTexture
): THREE.Group {
  const portalsGroup = new THREE.Group();
  portalsGroup.name = 'Element_grinch-snow-portals';

  // Toned-down snow & ice materials (all RGB channels <= 0xd8, roughness >= 0.55)
  const snowCliffMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    color: 0xb4c8d8,
    roughness: 0.62,
    metalness: 0.04,
  });
  const snowCapMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    color: 0xc4d2d8,
    roughness: 0.57,
    metalness: 0.03,
  });
  const midSnowFlatMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    color: 0xa8bed6,
    roughness: 0.6,
    metalness: 0.04,
  });
  const iceWaveFaceMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    color: 0x98b6d6,
    roughness: 0.58,
    metalness: 0.05,
  });
  const iceWaveRibMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    color: 0x6892c2,
    roughness: 0.58,
    metalness: 0.06,
  });
  const underShadowMat = new THREE.MeshStandardMaterial({
    color: 0x3b587e,
    roughness: 0.68,
    metalness: 0.04,
  });
  const contourInkMat = new THREE.MeshStandardMaterial({
    color: 0x25364e,
    roughness: 0.72,
    metalness: 0.02,
  });
  const icicleMat = new THREE.MeshStandardMaterial({
    color: 0xbcd0d8,
    roughness: 0.55,
    metalness: 0.08,
    transparent: true,
    opacity: 0.94,
  });

  for (const side of [-1, 1] as const) {
    const sideGroup = new THREE.Group();
    sideGroup.name = side === -1 ? 'SnowPortal_DSR' : 'SnowPortal_DSL';

    // ------------------------------------------------------------------------
    // A. Outer Downstage Sculpted Snow-Cliff Tower
    //    Positioned at x = ±5.65m, z = +0.18m with depth 0.76m (z ∈ [-0.20m, +0.56m])
    //    so it sits 100% downstage of the Line #1 Pre-Show Scrim at z = -0.35m!
    // ------------------------------------------------------------------------
    const outerTowerGroup = new THREE.Group();
    outerTowerGroup.position.set(side * 5.65, 0, 0.18);
    outerTowerGroup.rotation.y = side * -0.16;

    // Lower & upper stacked snow rock strata (depth = 0.76m)
    const lowerStratum = new THREE.Mesh(
      new RoundedBoxGeometry(2.38, 2.35, 0.76, 3, 0.15),
      snowCliffMat
    );
    lowerStratum.position.set(0, 1.18, 0);
    lowerStratum.castShadow = true;
    lowerStratum.receiveShadow = true;
    outerTowerGroup.add(lowerStratum);

    const upperStratum = new THREE.Mesh(
      new RoundedBoxGeometry(2.32, 1.75, 0.72, 3, 0.15),
      snowCliffMat
    );
    upperStratum.position.set(side * -0.05, 2.82, 0.03);
    upperStratum.rotation.z = side * -0.03;
    upperStratum.castShadow = true;
    upperStratum.receiveShadow = true;
    outerTowerGroup.add(upperStratum);

    // Overhanging sculpted snow-drift cap with continuous valance & fluted icicles
    const outerDriftCap = createSculptedSnowDriftCap(
      2.56,
      1.16,
      0.78,
      6,
      snowCapMat,
      underShadowMat,
      icicleMat,
      iceWaveRibMat,
      side === -1 ? 1 : 2
    );
    outerDriftCap.position.set(side * -0.04, 3.22, 0.05);
    outerDriftCap.rotation.z = side * -0.06;
    outerTowerGroup.add(outerDriftCap);

    // Secondary lower snow ledge shelf + sculpted icicle valance at y = 2.02m
    const midShelfCap = createSculptedSnowDriftCap(
      2.44,
      0.56,
      0.74,
      5,
      snowCapMat,
      underShadowMat,
      icicleMat,
      iceWaveRibMat,
      side === -1 ? 3 : 4
    );
    midShelfCap.position.set(side * 0.03, 2.02, 0.04);
    midShelfCap.rotation.z = side * -0.04;
    outerTowerGroup.add(midShelfCap);

    // Carved Seussian horizontal contour ledges across the front face (staggered at z = +0.42m)
    for (const [ly, lw, lzRot] of [
      [0.75, 1.65, -0.04],
      [1.35, 1.85, 0.03],
      [2.55, 1.55, -0.05],
      [3.38, 1.72, 0.04],
    ] as const) {
      const contourStroke = new THREE.Mesh(
        new RoundedBoxGeometry(lw, 0.045, 0.05, 2, 0.015),
        contourInkMat
      );
      contourStroke.position.set(side * -0.1, ly, 0.42);
      contourStroke.rotation.z = side * lzRot;
      outerTowerGroup.add(contourStroke);
    }

    // Sculpted snow boulder outcrops resting on the downstage deck at the tower base
    for (const [bx, by, bz, sx, sy, sz] of [
      [side * -0.92, 0.34, 0.32, 0.76, 0.68, 0.52],
      [side * -0.32, 0.26, 0.38, 0.62, 0.52, 0.48],
      [side * 0.52, 0.3, 0.34, 0.7, 0.58, 0.5],
    ] as const) {
      const boulder = new THREE.Mesh(
        new RoundedBoxGeometry(sx, sy, sz, 3, 0.16),
        snowCapMat
      );
      boulder.position.set(bx, by, bz);
      boulder.rotation.z = side * -0.08;
      boulder.castShadow = true;
      boulder.receiveShadow = true;
      outerTowerGroup.add(boulder);
    }

    sideGroup.add(outerTowerGroup);

    // ------------------------------------------------------------------------
    // B. Mid-Wing Stepped Seussian Snow-Cliff Flat
    //    Positioned at x = ±4.65m, z = -0.92m, depth = 0.42m (z ∈ [-1.13m, -0.71m]),
    //    cleanly upstage of the Line #1 Pre-Show Scrim at z = -0.35m!
    // ------------------------------------------------------------------------
    const midFlatGroup = new THREE.Group();
    midFlatGroup.position.set(side * 4.95, 0, -0.92);
    midFlatGroup.rotation.y = side * -0.11;

    const midFlatBody = new THREE.Mesh(
      new RoundedBoxGeometry(1.92, 3.12, 0.42, 3, 0.14),
      midSnowFlatMat
    );
    midFlatBody.position.set(0, 1.56, 0);
    midFlatBody.rotation.z = side * 0.08;
    midFlatBody.castShadow = true;
    midFlatBody.receiveShadow = true;
    midFlatGroup.add(midFlatBody);

    // Sloping snow-drift crest on top of the mid-wing flat (staggered at z = +0.04m)
    const midFlatCap = createSculptedSnowDriftCap(
      2.02,
      0.62,
      0.46,
      4,
      snowCapMat,
      underShadowMat,
      icicleMat,
      iceWaveRibMat,
      side === -1 ? 5 : 6
    );
    midFlatCap.position.set(side * -0.06, 2.98, 0.04);
    midFlatCap.rotation.z = side * -0.14;
    midFlatGroup.add(midFlatCap);

    // Seussian Z-zig contour hatch lines on the mid-wing snow flat (visible in model_1A_preshow.jpg)
    for (const [cy, cw, cAngle] of [
      [1.05, 0.95, -0.12],
      [1.22, 0.78, 0.18],
      [1.38, 0.88, -0.08],
      [2.15, 1.05, -0.14],
    ] as const) {
      const hatchBar = new THREE.Mesh(
        new RoundedBoxGeometry(cw, 0.04, 0.05, 2, 0.012),
        contourInkMat
      );
      hatchBar.position.set(side * -0.18, cy, 0.24);
      hatchBar.rotation.z = side * cAngle;
      midFlatGroup.add(hatchBar);
    }

    sideGroup.add(midFlatGroup);

    // ------------------------------------------------------------------------
    // C. Secondary Mid-Stage Ice-Wave Wing Arch (z = -1.68m)
    // ------------------------------------------------------------------------
    const midIceWave = createSeussianIceWaveWing(
      side,
      4.15,
      1.18,
      midSnowFlatMat,
      iceWaveRibMat,
      snowCapMat,
      contourInkMat
    );
    midIceWave.position.set(side * 5.75, 0, -1.68);
    midIceWave.rotation.y = side * -0.06;
    sideGroup.add(midIceWave);

    // ------------------------------------------------------------------------
    // D. Tall S-Curved Seussian Ice-Wave Wing Portal (z = -2.62m)
    //    (Prominent curving blue ice arches framing Whoville in model_1B)
    // ------------------------------------------------------------------------
    const tallIceWave = createSeussianIceWaveWing(
      side,
      4.85,
      1.22,
      iceWaveFaceMat,
      iceWaveRibMat,
      snowCapMat,
      contourInkMat
    );
    tallIceWave.position.set(side * 6.32, 0, -2.62);
    tallIceWave.rotation.y = side * -0.04;
    sideGroup.add(tallIceWave);

    portalsGroup.add(sideGroup);
  }

  // --------------------------------------------------------------------------
  // E. Sculpted Upper Snow-Border / Teaser Arch (y = 6.65m, z = +0.12m)
  //    Sits cleanly downstage of the Line #1 scrim batten pipe (z = -0.35m)
  //    and frames the top of the portal opening with sculpted valance icicles.
  // --------------------------------------------------------------------------
  const teaserArchGroup = new THREE.Group();
  teaserArchGroup.name = 'SnowPortal_UpperTeaserArch';
  teaserArchGroup.position.set(0, 6.65, 0.12);

  const teaserSpan = createSculptedSnowDriftCap(
    13.2,
    1.02,
    0.42,
    14,
    snowCapMat,
    underShadowMat,
    icicleMat,
    iceWaveRibMat,
    7
  );
  teaserArchGroup.add(teaserSpan);

  // Left and right sculpted corner haunches tying the teaser arch into the outer towers
  for (const side of [-1, 1] as const) {
    const cornerHaunch = new THREE.Mesh(
      new RoundedBoxGeometry(2.35, 1.45, 0.48, 3, 0.18),
      snowCliffMat
    );
    cornerHaunch.position.set(side * 5.35, -0.58, 0.05);
    cornerHaunch.rotation.z = side * 0.24;
    cornerHaunch.castShadow = true;
    teaserArchGroup.add(cornerHaunch);
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
 * Helper to build a miniature forced-perspective Seussian pine tree for the
 * distant Whoville hill ridges.
 */
function createForcedPerspectiveWhovillePine(
  scale: number,
  pineMat: THREE.Material,
  snowMat: THREE.Material,
  trunkMat: THREE.Material
): THREE.Group {
  const tree = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.028 * scale, 0.042 * scale, 0.18 * scale, 7),
    trunkMat
  );
  trunk.position.y = 0.09 * scale;
  tree.add(trunk);

  for (let tier = 0; tier < 3; tier++) {
    const tierRadius = (0.18 - tier * 0.04) * scale;
    const tierHeight = (0.26 - tier * 0.03) * scale;
    const tierY = (0.2 + tier * 0.15) * scale;

    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(tierRadius, tierHeight, 9),
      pineMat
    );
    cone.position.set(tier * 0.02 * scale, tierY, 0);
    cone.rotation.z = (tier % 2 === 0 ? -1 : 1) * 0.14;
    cone.castShadow = true;
    tree.add(cone);

    const snowCap = new THREE.Mesh(
      new THREE.ConeGeometry(tierRadius * 0.85, tierHeight * 0.42, 9),
      snowMat
    );
    snowCap.position.set(
      tier * 0.02 * scale,
      tierY + tierHeight * 0.24,
      0.015 * scale
    );
    snowCap.rotation.z = cone.rotation.z;
    tree.add(snowCap);
  }

  return tree;
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
    new THREE.SphereGeometry(0.048 * scale, 10, 8),
    lanternGlowMat
  );
  lantern.position.set(leanDir * 0.08 * scale, 0.55 * scale, 0.01 * scale);
  lamp.add(lantern);

  return lamp;
}

/**
 * Helper to build a sculpted Seussian hill flat at a dedicated Z plane with
 * a snow-drift crest and contour stroke (all staggered in Z).
 */
function createSeussianHillLayer(
  points: ReadonlyArray<readonly [number, number]>,
  depth: number,
  zPlane: number,
  hillMat: THREE.Material,
  snowCrestMat: THREE.Material,
  contourInkMat: THREE.Material
): THREE.Group {
  const layerGroup = new THREE.Group();
  layerGroup.position.z = zPlane;

  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], 0);
  shape.lineTo(points[0][0], points[0][1]);

  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const midX = (x0 + x1) * 0.5;
    const ctrlY = Math.max(y0, y1) + 0.22;
    shape.quadraticCurveTo(midX, ctrlY, x1, y1);
  }
  shape.lineTo(points[points.length - 1][0], 0);
  shape.closePath();

  const hillGeo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.03,
    bevelThickness: 0.03,
  });
  const hillMesh = new THREE.Mesh(hillGeo, hillMat);
  hillMesh.castShadow = true;
  hillMesh.receiveShadow = true;
  layerGroup.add(hillMesh);

  // Snow-drift ribbon along the upper ridge (staggered forward by +0.045m)
  const crestShape = new THREE.Shape();
  crestShape.moveTo(points[0][0], points[0][1] - 0.14);
  crestShape.lineTo(points[0][0], points[0][1] + 0.04);
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const midX = (x0 + x1) * 0.5;
    const ctrlY = Math.max(y0, y1) + 0.25;
    crestShape.quadraticCurveTo(midX, ctrlY, x1, y1 + 0.04);
  }
  for (let i = points.length - 1; i > 0; i--) {
    const [x1, y1] = points[i];
    const [x0, y0] = points[i - 1];
    const midX = (x0 + x1) * 0.5;
    const ctrlY = Math.max(y0, y1) + 0.04;
    crestShape.quadraticCurveTo(midX, ctrlY, x0, y0 - 0.14);
  }
  crestShape.closePath();

  const crestGeo = new THREE.ExtrudeGeometry(crestShape, {
    depth: depth * 0.75,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.02,
    bevelThickness: 0.02,
  });
  const crestMesh = new THREE.Mesh(crestGeo, snowCrestMat);
  crestMesh.position.z = 0.045;
  layerGroup.add(crestMesh);

  // Dark Seussian ink outline rim tucked just behind the hill profile (staggered at z = -0.045m)
  const outlineMesh = new THREE.Mesh(hillGeo, contourInkMat);
  outlineMesh.scale.set(1.012, 1.022, 0.6);
  outlineMesh.position.set(0, 0.02, -0.045);
  layerGroup.add(outlineMesh);

  return layerGroup;
}

/**
 * 3. UPSTAGE WHOVILLE SNOW HILLS & MT. CRUMPIT PEAK (Lineset #39 / #45)
 *    (`'grinch-whoville-hills-cyc'`)
 *    Multi-layered rolling Seussian snow hills at staggered Z planes
 *    (`z = -5.9m`, `-6.4m`, `-6.9m`), winding snowy path ribbons with
 *    miniature crooked lamp-posts & forced-perspective pine trees, and
 *    the towering crooked S-curved peak of Mt. Crumpit (`z = -7.25m`).
 */
export function buildGrinchWhovilleHillsAndCrumpit(
  rockTex: THREE.CanvasTexture
): THREE.Group {
  const hillsGroup = new THREE.Group();
  hillsGroup.name = 'Element_grinch-whoville-hills-cyc';

  // Toned-down Seussian snow & lavender-blue hill palette (all channels <= 0xd8, roughness >= 0.55)
  const fgHillMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    color: 0xaabed8,
    roughness: 0.6,
    metalness: 0.03,
  });
  const midHillMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    color: 0x9ab0d2,
    roughness: 0.62,
    metalness: 0.03,
  });
  const bgHillMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    color: 0x8ca2c8,
    roughness: 0.64,
    metalness: 0.04,
  });
  const snowCrestMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    color: 0xc2d0d8,
    roughness: 0.56,
    metalness: 0.03,
  });
  const pathRibbonMat = new THREE.MeshStandardMaterial({
    color: 0xb8cad8,
    roughness: 0.58,
    metalness: 0.03,
  });
  const iceArcadeMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    color: 0x749ac8,
    roughness: 0.58,
    metalness: 0.05,
  });
  const crumpitBodyMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    color: 0x94a8cc,
    roughness: 0.59,
    metalness: 0.04,
  });
  const crumpitShadowCliffMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    color: 0x6a86b4,
    roughness: 0.62,
    metalness: 0.05,
  });
  const contourInkMat = new THREE.MeshStandardMaterial({
    color: 0x26364e,
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
    emissiveIntensity: 0.65,
    roughness: 0.55,
  });

  // --------------------------------------------------------------------------
  // A. Foreground Groundrow Layer (z = -5.9m)
  //    Includes the central-left rounded snow hill with scalloped blue ice
  //    arches seen right behind the Christmas tree in `model_1B_whoville.jpg`.
  // --------------------------------------------------------------------------
  const fgLayer = createSeussianHillLayer(
    [
      [-5.6, 0.65],
      [-3.8, 1.18],
      [-1.9, 0.78],
      [-0.2, 1.08],
      [1.45, 1.32],
      [3.2, 0.86],
      [5.6, 1.12],
    ],
    0.18,
    -5.9,
    fgHillMat,
    snowCrestMat,
    contourInkMat
  );

  // Scalloped blue ice-cave arches along the center-left foreground hill (matching model_1B_whoville.jpg)
  for (let i = 0; i < 5; i++) {
    const archX = 0.15 + i * 0.34;
    const archHeight = 0.28 + (i === 2 ? 0.06 : 0);
    const archMesh = new THREE.Mesh(
      new RoundedBoxGeometry(0.18, archHeight, 0.08, 2, 0.06),
      iceArcadeMat
    );
    archMesh.position.set(archX, 0.58 + Math.sin(i * 0.7) * 0.05, 0.19);
    fgLayer.add(archMesh);
  }

  // Winding snowy path ribbon across the foreground hill (staggered at local z = +0.21m)
  const fgPathCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.6, 0.18, 0.21),
    new THREE.Vector3(-1.4, 0.52, 0.21),
    new THREE.Vector3(-0.1, 0.82, 0.21),
    new THREE.Vector3(1.1, 1.06, 0.21),
  ]);
  const fgPathMesh = new THREE.Mesh(
    new THREE.TubeGeometry(fgPathCurve, 24, 0.075, 6, false),
    pathRibbonMat
  );
  fgPathMesh.scale.set(1, 0.45, 0.35);
  fgLayer.add(fgPathMesh);

  // Miniature crooked lamp-posts and forced-perspective pines on the foreground ridge
  for (const [px, py, scale, lean] of [
    [-3.55, 1.22, 1.0, 1],
    [1.15, 1.36, 0.95, -1],
    [1.68, 1.28, 0.88, 1],
  ] as const) {
    const pine = createForcedPerspectiveWhovillePine(
      scale,
      pineGreenMat,
      snowCrestMat,
      trunkMat
    );
    pine.position.set(px, py, 0.12);
    fgLayer.add(pine);

    const lamp = createMiniatureCrookedLampPost(
      scale * 0.85,
      lean,
      contourInkMat,
      lanternGlowMat
    );
    lamp.position.set(px + 0.24 * lean, py - 0.03, 0.16);
    fgLayer.add(lamp);
  }

  hillsGroup.add(fgLayer);

  // --------------------------------------------------------------------------
  // B. Midground Rolling Seussian Hills Layer (z = -6.4m)
  // --------------------------------------------------------------------------
  const midLayer = createSeussianHillLayer(
    [
      [-5.9, 1.35],
      [-4.1, 1.88],
      [-2.1, 1.32],
      [0.45, 1.78],
      [2.65, 2.04],
      [4.45, 1.48],
      [5.9, 1.72],
    ],
    0.18,
    -6.4,
    midHillMat,
    snowCrestMat,
    contourInkMat
  );

  // Winding snowy path ribbon climbing the midground hill (staggered at local z = +0.21m)
  const midPathCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.3, 0.95, 0.21),
    new THREE.Vector3(1.25, 1.38, 0.21),
    new THREE.Vector3(2.15, 1.76, 0.21),
    new THREE.Vector3(2.85, 1.98, 0.21),
  ]);
  const midPathMesh = new THREE.Mesh(
    new THREE.TubeGeometry(midPathCurve, 20, 0.065, 6, false),
    pathRibbonMat
  );
  midPathMesh.scale.set(1, 0.45, 0.35);
  midLayer.add(midPathMesh);

  for (const [px, py, scale, lean] of [
    [-4.05, 1.92, 0.82, -1],
    [0.58, 1.82, 0.78, 1],
    [2.52, 2.08, 0.75, -1],
  ] as const) {
    const pine = createForcedPerspectiveWhovillePine(
      scale,
      pineGreenMat,
      snowCrestMat,
      trunkMat
    );
    pine.position.set(px, py, 0.11);
    midLayer.add(pine);

    const lamp = createMiniatureCrookedLampPost(
      scale * 0.8,
      lean,
      contourInkMat,
      lanternGlowMat
    );
    lamp.position.set(px - 0.2 * lean, py - 0.02, 0.15);
    midLayer.add(lamp);
  }

  hillsGroup.add(midLayer);

  // --------------------------------------------------------------------------
  // C. Upstage Distant Seussian Foothills Layer (z = -6.9m)
  // --------------------------------------------------------------------------
  const bgLayer = createSeussianHillLayer(
    [
      [-6.2, 1.95],
      [-3.5, 2.65],
      [-1.1, 2.38],
      [1.35, 2.25],
      [3.65, 2.52],
      [6.2, 2.05],
    ],
    0.18,
    -6.9,
    bgHillMat,
    snowCrestMat,
    contourInkMat
  );

  for (const [px, py, scale] of [
    [-3.45, 2.68, 0.64],
    [-2.95, 2.56, 0.58],
    [3.55, 2.55, 0.62],
  ] as const) {
    const pine = createForcedPerspectiveWhovillePine(
      scale,
      pineGreenMat,
      snowCrestMat,
      trunkMat
    );
    pine.position.set(px, py, 0.11);
    bgLayer.add(pine);
  }

  hillsGroup.add(bgLayer);

  // --------------------------------------------------------------------------
  // D. Towering Crooked S-Curved Peak of Mt. Crumpit (z = -7.25m)
  //    Matches the dramatic sweeping mountain silhouette in `model_1B_whoville.jpg`:
  //    rising from the left/stage-right foothills up to an overhanging hooked
  //    summit with sculpted hanging icicles on the right cliff wall, a glowing
  //    cave mouth, and the winding "dump-it-to-Crumpit" trail.
  // --------------------------------------------------------------------------
  const crumpitGroup = new THREE.Group();
  crumpitGroup.name = 'MtCrumpit_PeakUnit';
  crumpitGroup.position.set(0, 0, -7.25);

  const crumpitShape = new THREE.Shape();
  crumpitShape.moveTo(-3.65, 0);
  // Long sweeping left ridge climbing up from Stage Right toward Center
  crumpitShape.bezierCurveTo(-3.35, 1.85, -2.55, 2.62, -1.65, 2.95);
  // Stepped mid-mountain shoulder and steep S-curved upper ascent
  crumpitShape.bezierCurveTo(-0.85, 3.25, -0.45, 4.35, 0.08, 4.98);
  // Rounded crooked summit dome at y ≈ 5.22m
  crumpitShape.bezierCurveTo(0.38, 5.28, 0.78, 5.18, 0.92, 4.82);
  // Overhanging upper right cliff nose & jagged crags (matching model_1B)
  crumpitShape.bezierCurveTo(1.04, 4.48, 0.82, 4.18, 0.64, 3.92);
  crumpitShape.bezierCurveTo(0.76, 3.68, 0.58, 3.32, 0.42, 2.95);
  // Steep lower right cliff descending behind the tree
  crumpitShape.bezierCurveTo(0.55, 2.15, 0.85, 1.15, 1.05, 0);
  crumpitShape.closePath();

  const crumpitGeo = new THREE.ExtrudeGeometry(crumpitShape, {
    depth: 0.24,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.04,
    bevelThickness: 0.04,
  });
  const crumpitMesh = new THREE.Mesh(crumpitGeo, crumpitBodyMat);
  crumpitMesh.castShadow = true;
  crumpitMesh.receiveShadow = true;
  crumpitGroup.add(crumpitMesh);

  // Dark Seussian ink outline backing Mt. Crumpit (staggered at z = -0.05m)
  const crumpitOutline = new THREE.Mesh(crumpitGeo, contourInkMat);
  crumpitOutline.scale.set(1.018, 1.018, 0.55);
  crumpitOutline.position.set(0, 0.02, -0.05);
  crumpitGroup.add(crumpitOutline);

  // Sculpted 3D S-curved spine ridge along Mt. Crumpit's crest (staggered at z = +0.16m)
  const spineCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.65, 2.15, 0.16),
    new THREE.Vector3(-1.55, 2.9, 0.18),
    new THREE.Vector3(-0.55, 3.78, 0.2),
    new THREE.Vector3(0.15, 4.88, 0.22),
    new THREE.Vector3(0.68, 4.92, 0.22),
  ]);
  const spineTube = new THREE.Mesh(
    new THREE.TubeGeometry(spineCurve, 28, 0.19, 8, false),
    snowCrestMat
  );
  spineTube.scale.set(1, 0.72, 0.48);
  crumpitGroup.add(spineTube);

  // Overhanging summit snow cap crowning the peak at (x = 0.38, y = 4.92, z = +0.26m)
  const summitSnowCap = createSculptedSnowDriftCap(
    1.18,
    0.58,
    0.26,
    4,
    snowCrestMat,
    crumpitShadowCliffMat,
    snowCrestMat,
    crumpitShadowCliffMat,
    9
  );
  summitSnowCap.position.set(0.38, 4.92, 0.26);
  summitSnowCap.rotation.z = -0.24;
  crumpitGroup.add(summitSnowCap);

  // Sculpted Seussian icicle valance + fluted icicle drips mounted BEHIND the right overhang of Mt. Crumpit
  // so only their pointed icicle tips poke out from behind the cliff nose (`model_1B_whoville.jpg`)
  const cliffValance = createSeussianIcicleValance(
    0.68,
    0.46,
    6,
    snowCrestMat,
    crumpitShadowCliffMat,
    0.04,
    11
  );
  cliffValance.position.set(0.7, 4.18, -0.11);
  cliffValance.rotation.z = 0.32;
  crumpitGroup.add(cliffValance);

  for (const [ix, iy, len, rad, bend] of [
    [0.56, 3.78, 0.56, 0.044, -0.032],
    [0.68, 3.96, 0.82, 0.054, 0.038],
    [0.78, 4.12, 0.68, 0.046, -0.028],
    [0.86, 4.3, 0.48, 0.038, 0.024],
  ] as const) {
    const cliffIcicle = createSculptedIcicleDrip(len, rad, snowCrestMat, bend);
    cliffIcicle.position.set(ix, iy, -0.08);
    cliffIcicle.rotation.z = -0.06;
    cliffIcicle.scale.set(1.0, 1.0, 0.45);
    crumpitGroup.add(cliffIcicle);
  }

  // Craggy ice ledges & Seussian contour strata on the mountain face (staggered at z = +0.28m)
  for (const [lx, ly, lw, lRot] of [
    [-1.45, 2.65, 0.92, 0.34],
    [-0.55, 3.35, 0.78, 0.52],
    [-0.05, 4.18, 0.68, 0.44],
    [0.25, 3.55, 0.56, -0.28],
  ] as const) {
    const cragLedge = new THREE.Mesh(
      new RoundedBoxGeometry(lw, 0.09, 0.12, 2, 0.03),
      crumpitShadowCliffMat
    );
    cragLedge.position.set(lx, ly, 0.28);
    cragLedge.rotation.z = lRot;
    crumpitGroup.add(cragLedge);
  }

  // Winding "Dump-It-To-Crumpit" sleigh trail ribbon spiraling up toward the summit (z = +0.31m)
  const crumpitTrailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.15, 2.25, 0.31),
    new THREE.Vector3(-1.15, 2.75, 0.31),
    new THREE.Vector3(-0.35, 3.45, 0.31),
    new THREE.Vector3(0.18, 4.25, 0.31),
    new THREE.Vector3(0.42, 4.68, 0.31),
  ]);
  const crumpitTrail = new THREE.Mesh(
    new THREE.TubeGeometry(crumpitTrailCurve, 28, 0.052, 6, false),
    pathRibbonMat
  );
  crumpitTrail.scale.set(1, 0.55, 0.38);
  crumpitGroup.add(crumpitTrail);

  // Miniature glowing Grinch cave mouth tucked near the upper cliff of Mt. Crumpit
  const caveFrame = new THREE.Mesh(
    new RoundedBoxGeometry(0.34, 0.38, 0.09, 3, 0.08),
    contourInkMat
  );
  caveFrame.position.set(0.32, 4.38, 0.3);
  caveFrame.rotation.z = -0.18;
  crumpitGroup.add(caveFrame);

  const caveGlow = new THREE.Mesh(
    new RoundedBoxGeometry(0.22, 0.26, 0.06, 2, 0.06),
    new THREE.MeshStandardMaterial({
      color: 0x8cc864,
      emissive: 0x52a432,
      emissiveIntensity: 0.72,
      roughness: 0.55,
    })
  );
  caveGlow.position.set(0.33, 4.36, 0.35);
  caveGlow.rotation.z = -0.18;
  crumpitGroup.add(caveGlow);

  hillsGroup.add(crumpitGroup);

  return hillsGroup;
}
