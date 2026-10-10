import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { createFabricWeaveNormalTexture } from '../engine/procedural-textures.ts';
import type { RiggingBattenSpec } from '../types/theatre.ts';

export interface McCollLinesetRecord {
  readonly lineNumber: number;
  readonly distanceFeetInches: string;
  readonly zPosM: number;
  readonly assignment: string;
}

/**
 * Official 52-Lineset Single-Purchase Counterweight Schedule from the
 * Children's Theatre of Charlotte (McColl Family Theatre) 1/4" CAD Ground Plan.
 */
export const MCCOLL_52_LINESET_SCHEDULE: ReadonlyArray<McCollLinesetRecord> = [
  { lineNumber: 1, distanceFeetInches: `0'-10"`, zPosM: -0.25, assignment: 'Scrim (Downstage Pre-Show Scrim)' },
  { lineNumber: 2, distanceFeetInches: `1'-6"`, zPosM: -0.46, assignment: 'Full Stage Black / Main Curtain' },
  { lineNumber: 3, distanceFeetInches: `2'-6"`, zPosM: -0.76, assignment: '1st Electric (Wings Only)' },
  { lineNumber: 4, distanceFeetInches: `3'-2"`, zPosM: -0.97, assignment: '2nd Electric' },
  { lineNumber: 5, distanceFeetInches: `3'-10"`, zPosM: -1.17, assignment: 'Legs #1' },
  { lineNumber: 7, distanceFeetInches: `5'-2"`, zPosM: -1.57, assignment: '3rd Electric' },
  { lineNumber: 9, distanceFeetInches: `6'-6"`, zPosM: -1.98, assignment: "Papa Who's House / Downstage Portal" },
  { lineNumber: 11, distanceFeetInches: `7'-10"`, zPosM: -2.39, assignment: 'Border / Legs #2' },
  { lineNumber: 13, distanceFeetInches: `9'-2"`, zPosM: -2.79, assignment: '4th Electric' },
  { lineNumber: 15, distanceFeetInches: `10'-6"`, zPosM: -3.20, assignment: 'Christmas Sign / Mid-Stage Banner' },
  { lineNumber: 17, distanceFeetInches: `11'-10"`, zPosM: -3.61, assignment: "Grinch's Cave / Mid-Stage Drop" },
  { lineNumber: 19, distanceFeetInches: `13'-2"`, zPosM: -4.01, assignment: 'Mylar Curtain / Interior Scrim' },
  { lineNumber: 21, distanceFeetInches: `14'-6"`, zPosM: -4.42, assignment: 'Border / Legs #3' },
  { lineNumber: 23, distanceFeetInches: `15'-10"`, zPosM: -4.83, assignment: '5th Electric' },
  { lineNumber: 29, distanceFeetInches: `19'-10"`, zPosM: -6.05, assignment: '6th Electric' },
  { lineNumber: 31, distanceFeetInches: `21'-2"`, zPosM: -6.45, assignment: 'Border #4' },
  { lineNumber: 33, distanceFeetInches: `22'-6"`, zPosM: -6.86, assignment: 'Legs #4' },
  { lineNumber: 36, distanceFeetInches: `24'-6"`, zPosM: -7.47, assignment: 'Border #5' },
  { lineNumber: 37, distanceFeetInches: `25'-2"`, zPosM: -7.67, assignment: 'Legs #5' },
  { lineNumber: 39, distanceFeetInches: `26'-6"`, zPosM: -8.08, assignment: 'Upstage Scrim' },
  { lineNumber: 41, distanceFeetInches: `27'-10"`, zPosM: -8.48, assignment: '7th Electric' },
  { lineNumber: 45, distanceFeetInches: `30'-6"`, zPosM: -9.30, assignment: 'CYC (Sky Cyclorama)' },
  { lineNumber: 46, distanceFeetInches: `31'-2"`, zPosM: -9.50, assignment: 'Star Drop' },
  { lineNumber: 48, distanceFeetInches: `32'-6"`, zPosM: -9.91, assignment: 'Upstage Storage Batten' },
  { lineNumber: 50, distanceFeetInches: `33'-10"`, zPosM: -10.31, assignment: 'Upstage Storage Batten' },
  { lineNumber: 52, distanceFeetInches: `34'-10"`, zPosM: -10.62, assignment: 'Upstage Limit (#52)' },
];

export const DEFAULT_RIGGING_BATTENS: ReadonlyArray<RiggingBattenSpec> = [
  {
    id: 'batten-1',
    lineNumber: 1,
    name: `Line #1 (0'-10") · Pre-Show Scrim & #5 Masking`,
    zPosM: -0.35,
    trimHeightM: 0.0,
    minHeightM: 0.0,
    maxHeightM: 7.2,
    category: 'drape',
  },
  {
    id: 'batten-2',
    lineNumber: 2,
    name: `Line #9 (6'-6") · Papa Who's House / DS Portal`,
    zPosM: -2.0,
    trimHeightM: 0.0,
    minHeightM: 0.0,
    maxHeightM: 7.2,
    category: 'scenic',
  },
  {
    id: 'batten-3',
    lineNumber: 3,
    name: `Line #15 (10'-6") · Christmas Sign / Fly Rig`,
    zPosM: -3.2,
    trimHeightM: 0.0,
    minHeightM: 0.0,
    maxHeightM: 7.2,
    category: 'scenic',
  },
  {
    id: 'batten-4',
    lineNumber: 4,
    name: `Line #17 (11'-10") · Grinch's Cave / Mid Drop`,
    zPosM: -3.65,
    trimHeightM: 0.0,
    minHeightM: 0.0,
    maxHeightM: 7.2,
    category: 'scenic',
  },
  {
    id: 'batten-5',
    lineNumber: 5,
    name: `Line #19 (13'-2") · Mylar Curtain / US Towers`,
    zPosM: -4.15,
    trimHeightM: 0.0,
    minHeightM: 0.0,
    maxHeightM: 7.2,
    category: 'scenic',
  },
];

export interface HumanScaleFigureOptions {
  readonly pantsColorHex?: number;
  readonly hairColorHex?: number;
  readonly skinColorHex?: number;
  readonly trimColorHex?: number;
  readonly hasApron?: boolean;
  readonly hasGuitarHex?: number;
  readonly armPose?: 'relaxed' | 'cheering' | 'playing' | 'presenting';
  readonly isSeated?: boolean;
}

/**
 * Helper to build a sculpted theatrical boot/shoe with distinct heel, arch,
 * sole welt, and rounded toe box.
 */
function createSculptedBoot(
  scale: number,
  bootMat: THREE.Material,
  soleMat: THREE.Material,
  cuffMat?: THREE.Material
): THREE.Group {
  const bootGroup = new THREE.Group();

  // Sole & heel block
  const sole = new THREE.Mesh(
    new RoundedBoxGeometry(0.068 * scale, 0.016 * scale, 0.142 * scale, 2, 0.006 * scale),
    soleMat
  );
  sole.position.set(0, 0.008 * scale, 0.022 * scale);
  bootGroup.add(sole);

  const heel = new THREE.Mesh(
    new RoundedBoxGeometry(0.064 * scale, 0.022 * scale, 0.048 * scale, 2, 0.005 * scale),
    soleMat
  );
  heel.position.set(0, 0.011 * scale, -0.022 * scale);
  bootGroup.add(heel);

  // Boot ankle shaft
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.036 * scale, 0.033 * scale, 0.056 * scale, 12),
    bootMat
  );
  shaft.position.set(0, 0.042 * scale, -0.006 * scale);
  shaft.castShadow = true;
  bootGroup.add(shaft);

  // Rounded vamp & toe box
  const toeBox = new THREE.Mesh(
    new THREE.SphereGeometry(0.036 * scale, 12, 10),
    bootMat
  );
  toeBox.scale.set(0.96, 0.72, 1.55);
  toeBox.position.set(0, 0.026 * scale, 0.034 * scale);
  toeBox.castShadow = true;
  bootGroup.add(toeBox);

  if (cuffMat) {
    const cuff = new THREE.Mesh(
      new THREE.TorusGeometry(0.036 * scale, 0.012 * scale, 8, 14),
      cuffMat
    );
    cuff.rotation.x = Math.PI / 2;
    cuff.position.set(0, 0.068 * scale, -0.006 * scale);
    bootGroup.add(cuff);
  }

  return bootGroup;
}

/**
 * Builds an articulated, expressive 3D theatrical character figure with
 * sculpted `LatheGeometry` tailored coat/dress, waist belt, lapels, 2-segment
 * articulated arms with elbows & hands/thumbs, contoured legs & heeled boots,
 * and a detailed sculpted face (eye whites, colored irises, pupils, specular
 * catchlights, cheeks, ears, nose, lips, and layered hair).
 */
export function createHumanScaleFigure(
  heightM: number,
  coatColorHex: number,
  hatHeightM = 0,
  hatColorHex = 0xd4a024,
  hasRabbitEars = false,
  options: HumanScaleFigureOptions = {}
): THREE.Group {
  const g = new THREE.Group();
  g.userData.isCharacterBlocking = true;

  const fabricNormal = createFabricWeaveNormalTexture();

  const coatMat = new THREE.MeshStandardMaterial({
    color: coatColorHex,
    normalMap: fabricNormal,
    normalScale: new THREE.Vector2(0.35, 0.35),
    roughness: 0.56,
    metalness: 0.05,
  });
  const pantsMat = new THREE.MeshStandardMaterial({
    color: options.pantsColorHex ?? 0x262936,
    normalMap: fabricNormal,
    normalScale: new THREE.Vector2(0.28, 0.28),
    roughness: 0.64,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: options.trimColorHex ?? 0xe8e2d6,
    normalMap: fabricNormal,
    normalScale: new THREE.Vector2(0.3, 0.3),
    roughness: 0.54,
  });
  const skinMat = new THREE.MeshStandardMaterial({
    color: options.skinColorHex ?? 0xeac09e,
    roughness: 0.48,
    metalness: 0.02,
  });
  const cheekBlushMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(options.skinColorHex ?? 0xeac09e).lerp(
      new THREE.Color(0xe46c7c),
      0.38
    ),
    roughness: 0.5,
  });
  const hairMat = new THREE.MeshStandardMaterial({
    color: options.hairColorHex ?? 0x4a2e1b,
    normalMap: fabricNormal,
    normalScale: new THREE.Vector2(0.4, 0.4),
    roughness: 0.62,
  });
  const shoeMat = new THREE.MeshStandardMaterial({
    color: 0x221d20,
    roughness: 0.38,
    metalness: 0.14,
  });
  const soleMat = new THREE.MeshStandardMaterial({
    color: 0x121014,
    roughness: 0.65,
  });
  const beltMat = new THREE.MeshStandardMaterial({
    color: 0x241c18,
    roughness: 0.42,
    metalness: 0.18,
  });
  const buckleMat = new THREE.MeshStandardMaterial({
    color: 0xd4a638,
    roughness: 0.28,
    metalness: 0.72,
  });
  const scleraMat = new THREE.MeshStandardMaterial({
    color: 0xd8dce0,
    roughness: 0.22,
  });
  const irisMat = new THREE.MeshStandardMaterial({
    color: 0x34628c,
    roughness: 0.2,
  });
  const eyeDarkMat = new THREE.MeshStandardMaterial({
    color: 0x121318,
    roughness: 0.15,
  });
  const catchlightMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
  });
  const lipMat = new THREE.MeshStandardMaterial({
    color: 0xb8525c,
    roughness: 0.45,
  });

  const scale = heightM / 1.7;
  const legH = heightM * 0.37;
  const torsoH = heightM * 0.41;
  const headR = heightM * 0.078;

  // Low-profile bevelled blocking stand disc
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.175 * scale, 0.195 * scale, 0.022, 24),
    new THREE.MeshStandardMaterial({ color: 0x1e222a, roughness: 0.48 })
  );
  base.position.y = 0.011;
  g.add(base);

  // Articulated Legs (Thigh + Knee Joint + Contoured Calf + Sculpted Boot)
  const hipSpacing = 0.072 * scale;
  const seatDropY = options.isSeated ? legH * 0.38 : 0;
  for (const side of [-1, 1]) {
    const lx = side * hipSpacing;
    if (options.isSeated) {
      const hipY = 0.04 + legH * 0.62;
      const thighLen = legH * 0.48;
      const shinLen = legH * 0.52;
      const kneeZ = thighLen * 0.88;

      const upperLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.052 * scale, 0.044 * scale, thighLen, 12),
        pantsMat
      );
      upperLeg.rotation.x = Math.PI / 2 - 0.12;
      upperLeg.position.set(lx, hipY, kneeZ * 0.5);
      upperLeg.castShadow = true;
      g.add(upperLeg);

      const kneeJoint = new THREE.Mesh(
        new THREE.SphereGeometry(0.043 * scale, 10, 10),
        pantsMat
      );
      kneeJoint.position.set(lx, hipY - 0.02 * scale, kneeZ * 0.95);
      g.add(kneeJoint);

      const lowerLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.042 * scale, 0.032 * scale, shinLen, 12),
        pantsMat
      );
      lowerLeg.position.set(lx, 0.052 * scale + shinLen * 0.5, kneeZ);
      lowerLeg.castShadow = true;
      g.add(lowerLeg);

      const boot = createSculptedBoot(scale, shoeMat, soleMat);
      boot.position.set(lx, 0.022, kneeZ);
      g.add(boot);
    } else {
      const boot = createSculptedBoot(scale, shoeMat, soleMat);
      boot.position.set(lx, 0.022, 0);
      boot.rotation.y = side * -0.08;
      g.add(boot);

      const lowerLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.043 * scale, 0.032 * scale, legH * 0.48, 12),
        pantsMat
      );
      lowerLeg.position.set(lx, 0.065 * scale + legH * 0.24, 0);
      lowerLeg.castShadow = true;
      g.add(lowerLeg);

      const kneeJoint = new THREE.Mesh(
        new THREE.SphereGeometry(0.042 * scale, 10, 10),
        pantsMat
      );
      kneeJoint.position.set(lx, 0.065 * scale + legH * 0.48, 0.006 * scale);
      g.add(kneeJoint);

      const upperLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.054 * scale, 0.043 * scale, legH * 0.50, 12),
        pantsMat
      );
      upperLeg.position.set(lx, 0.065 * scale + legH * 0.73, 0);
      upperLeg.castShadow = true;
      g.add(upperLeg);
    }
  }

  // Sculpted Anatomical Coat / Tunic using LatheGeometry (flared hem -> cinched waist -> broad chest -> tapered shoulders)
  const torsoBaseY = 0.04 + legH - seatDropY;
  const torsoLathePts = [
    new THREE.Vector2(0.001, 0),
    new THREE.Vector2(0.146 * scale, 0.01 * torsoH),
    new THREE.Vector2(0.136 * scale, 0.14 * torsoH),
    new THREE.Vector2(0.104 * scale, 0.36 * torsoH), // Cinched waist
    new THREE.Vector2(0.118 * scale, 0.58 * torsoH), // Ribcage
    new THREE.Vector2(0.132 * scale, 0.78 * torsoH), // Chest
    new THREE.Vector2(0.116 * scale, 0.92 * torsoH), // Shoulder slope
    new THREE.Vector2(0.052 * scale, 1.0 * torsoH),  // Neck base
  ];
  const torsoGeo = new THREE.LatheGeometry(torsoLathePts, 20);
  torsoGeo.scale(1.0, 1.0, 0.72); // Anatomical oval chest/waist cross-section
  const torsoMesh = new THREE.Mesh(torsoGeo, coatMat);
  torsoMesh.position.y = torsoBaseY;
  torsoMesh.castShadow = true;
  torsoMesh.receiveShadow = true;
  g.add(torsoMesh);

  const torsoCenterY = torsoBaseY + torsoH * 0.54;

  // Tailored Coat Belt & Brass Buckle at Cinched Waist
  const beltY = torsoBaseY + torsoH * 0.36;
  const belt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.108 * scale, 0.110 * scale, 0.034 * scale, 20),
    beltMat
  );
  belt.scale.set(1.0, 1.0, 0.74);
  belt.position.y = beltY;
  g.add(belt);

  const buckle = new THREE.Mesh(
    new RoundedBoxGeometry(0.042 * scale, 0.044 * scale, 0.016 * scale, 2, 0.005 * scale),
    buckleMat
  );
  buckle.position.set(0, beltY, 0.082 * scale);
  g.add(buckle);

  // Coat Hem Trim Ring
  const hemTrim = new THREE.Mesh(
    new THREE.TorusGeometry(0.144 * scale, 0.012 * scale, 8, 22),
    trimMat
  );
  hemTrim.rotation.x = Math.PI / 2;
  hemTrim.scale.set(1.0, 0.72, 1.0);
  hemTrim.position.y = torsoBaseY + 0.015 * torsoH;
  g.add(hemTrim);

  // Turnover Collar, Lapels & Brass Coat Buttons
  const collarY = torsoBaseY + torsoH * 0.94;
  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(0.058 * scale, 0.016 * scale, 10, 18),
    trimMat
  );
  collar.rotation.x = Math.PI / 2 + 0.16;
  collar.scale.set(1.0, 0.85, 1.0);
  collar.position.set(0, collarY, 0.008 * scale);
  g.add(collar);

  for (const side of [-1, 1]) {
    const lapel = new THREE.Mesh(
      new RoundedBoxGeometry(0.036 * scale, 0.12 * scale, 0.014 * scale, 2, 0.004 * scale),
      trimMat
    );
    lapel.position.set(side * 0.034 * scale, collarY - 0.058 * scale, 0.084 * scale);
    lapel.rotation.z = side * 0.24;
    lapel.rotation.x = -0.12;
    g.add(lapel);
  }

  for (let b = 0; b < 3; b++) {
    const btnY = beltY + (1.4 - b * 0.65) * 0.068 * scale;
    const btn = new THREE.Mesh(
      new THREE.SphereGeometry(0.011 * scale, 10, 8),
      buckleMat
    );
    btn.scale.set(1, 1, 0.6);
    btn.position.set(0, btnY, 0.092 * scale);
    g.add(btn);
  }

  if (options.hasApron) {
    const apron = new THREE.Mesh(
      new RoundedBoxGeometry(0.168 * scale, torsoH * 0.76, 0.020 * scale, 2, 0.008 * scale),
      trimMat
    );
    apron.position.set(0, torsoCenterY - 0.04 * scale, 0.088 * scale);
    g.add(apron);
  }

  // 2-Segment Articulated Arms (Shoulder Cap + Upper Arm + Elbow + Forearm + Cuff + Sculpted Hand & Thumb)
  const shoulderY = torsoBaseY + torsoH * 0.86;
  const shoulderX = 0.132 * scale;
  const upperArmLen = torsoH * 0.36;
  const forearmLen = torsoH * 0.34;
  const armPose = options.armPose ?? 'relaxed';

  for (const side of [-1, 1]) {
    const shoulderPivot = new THREE.Group();
    shoulderPivot.position.set(side * shoulderX, shoulderY, 0);

    // Shoulder puff cap
    const shoulderCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.038 * scale, 10, 10),
      coatMat
    );
    shoulderPivot.add(shoulderCap);

    let elbowPitch = -0.28;
    let elbowYaw = side * -0.12;

    if (armPose === 'cheering') {
      shoulderPivot.rotation.z = side * 2.48;
      shoulderPivot.rotation.x = -0.22;
      elbowPitch = -0.42;
    } else if (armPose === 'presenting') {
      shoulderPivot.rotation.z = side * 0.22;
      shoulderPivot.rotation.x = -0.45;
      elbowPitch = -0.78;
      elbowYaw = side * -0.32;
    } else if (armPose === 'playing') {
      shoulderPivot.rotation.z = side * 0.24;
      shoulderPivot.rotation.x = -0.38;
      elbowPitch = -0.88;
      elbowYaw = side * -0.38;
    } else {
      shoulderPivot.rotation.z = side * 0.18;
      shoulderPivot.rotation.x = side > 0 ? -0.12 : -0.04;
      elbowPitch = side > 0 ? -0.36 : -0.22;
    }

    const upperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.034 * scale, 0.029 * scale, upperArmLen, 10),
      coatMat
    );
    upperArm.position.y = -upperArmLen * 0.5;
    upperArm.castShadow = true;
    shoulderPivot.add(upperArm);

    const elbowPivot = new THREE.Group();
    elbowPivot.position.set(0, -upperArmLen, 0);
    elbowPivot.rotation.x = elbowPitch;
    elbowPivot.rotation.z = elbowYaw;

    const elbowSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.029 * scale, 10, 8),
      coatMat
    );
    elbowPivot.add(elbowSphere);

    const forearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.029 * scale, 0.025 * scale, forearmLen, 10),
      coatMat
    );
    forearm.position.y = -forearmLen * 0.5;
    forearm.castShadow = true;
    elbowPivot.add(forearm);

    const cuff = new THREE.Mesh(
      new THREE.TorusGeometry(0.027 * scale, 0.010 * scale, 8, 14),
      trimMat
    );
    cuff.rotation.x = Math.PI / 2;
    cuff.position.y = -forearmLen + 0.008 * scale;
    elbowPivot.add(cuff);

    // Sculpted palm/mitten + distinct thumb
    const palm = new THREE.Mesh(
      new THREE.SphereGeometry(0.025 * scale, 10, 10),
      skinMat
    );
    palm.scale.set(0.85, 1.25, 0.68);
    palm.position.set(0, -forearmLen - 0.022 * scale, 0.004 * scale);
    elbowPivot.add(palm);

    const thumb = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.008 * scale, 0.016 * scale, 4, 6),
      skinMat
    );
    thumb.position.set(side * -0.018 * scale, -forearmLen - 0.016 * scale, 0.014 * scale);
    thumb.rotation.z = side * 0.55;
    thumb.rotation.x = 0.35;
    elbowPivot.add(thumb);

    shoulderPivot.add(elbowPivot);
    g.add(shoulderPivot);
  }

  // Optional Electric Guitar strapped cleanly across front of chest
  if (options.hasGuitarHex !== undefined) {
    const guitarGroup = new THREE.Group();
    guitarGroup.position.set(0.01 * scale, torsoCenterY - 0.02 * scale, 0.118 * scale);
    guitarGroup.rotation.z = -0.46;
    const gBody = new THREE.Mesh(
      new RoundedBoxGeometry(0.20 * scale, 0.15 * scale, 0.030 * scale, 2, 0.02),
      new THREE.MeshStandardMaterial({ color: options.hasGuitarHex, roughness: 0.32, metalness: 0.25 })
    );
    guitarGroup.add(gBody);
    const gNeck = new THREE.Mesh(
      new THREE.BoxGeometry(0.24 * scale, 0.026 * scale, 0.018 * scale),
      new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.55 })
    );
    gNeck.position.set(0.19 * scale, 0.015 * scale, 0.008 * scale);
    guitarGroup.add(gNeck);
    g.add(guitarGroup);
  }

  // Neck & Sculpted Expressive Head
  const neckY = torsoBaseY + torsoH * 1.02;
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.033 * scale, 0.038 * scale, 0.056 * scale, 12),
    skinMat
  );
  neck.position.y = neckY;
  g.add(neck);

  const headY = neckY + headR * 0.98 + 0.018 * scale;
  const headGroup = new THREE.Group();
  headGroup.position.y = headY;

  // Cranium + softly tapered lower cheek/jaw contour
  const cranium = new THREE.Mesh(new THREE.SphereGeometry(headR, 20, 16), skinMat);
  cranium.scale.set(0.94, 1.06, 0.96);
  cranium.castShadow = true;
  headGroup.add(cranium);

  // Rosy sculpted cheek puffs & ears
  for (const side of [-1, 1]) {
    const cheek = new THREE.Mesh(
      new THREE.SphereGeometry(headR * 0.28, 10, 10),
      cheekBlushMat
    );
    cheek.scale.set(1.05, 0.82, 0.72);
    cheek.position.set(side * headR * 0.52, -headR * 0.12, headR * 0.76);
    headGroup.add(cheek);

    const ear = new THREE.Mesh(
      new THREE.SphereGeometry(headR * 0.22, 10, 8),
      skinMat
    );
    ear.scale.set(0.45, 1.15, 0.75);
    ear.position.set(side * headR * 0.92, -headR * 0.02, -headR * 0.04);
    headGroup.add(ear);
  }

  // Sculpted Nose with rounded bridge & tip
  const noseBridge = new THREE.Mesh(
    new THREE.ConeGeometry(headR * 0.14, headR * 0.30, 10),
    skinMat
  );
  noseBridge.rotation.x = Math.PI / 2 - 0.22;
  noseBridge.position.set(0, -headR * 0.02, headR * 0.98);
  headGroup.add(noseBridge);

  const noseTip = new THREE.Mesh(
    new THREE.SphereGeometry(headR * 0.12, 10, 8),
    cheekBlushMat
  );
  noseTip.position.set(0, -headR * 0.01, headR * 1.11);
  headGroup.add(noseTip);

  // Expressive Eyes (Sclera + Colored Iris + Dark Pupil + White Specular Catchlight + Upper Eyelid + Curved Brow)
  for (const side of [-1, 1]) {
    const ex = side * headR * 0.34;
    const ey = headR * 0.13;
    const ez = headR * 0.86;

    const sclera = new THREE.Mesh(
      new THREE.SphereGeometry(headR * 0.15, 12, 10),
      scleraMat
    );
    sclera.scale.set(1.0, 1.08, 0.65);
    sclera.position.set(ex, ey, ez);
    headGroup.add(sclera);

    const iris = new THREE.Mesh(
      new THREE.SphereGeometry(headR * 0.095, 10, 8),
      irisMat
    );
    iris.scale.set(1.0, 1.05, 0.55);
    iris.position.set(ex, ey, ez + headR * 0.065);
    headGroup.add(iris);

    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(headR * 0.058, 8, 8),
      eyeDarkMat
    );
    pupil.scale.set(1.0, 1.05, 0.5);
    pupil.position.set(ex, ey, ez + headR * 0.095);
    headGroup.add(pupil);

    const catchlight = new THREE.Mesh(
      new THREE.SphereGeometry(headR * 0.026, 6, 6),
      catchlightMat
    );
    catchlight.position.set(ex + headR * 0.032, ey + headR * 0.038, ez + headR * 0.118);
    headGroup.add(catchlight);

    // Sculpted upper eyelid & curved eyebrow
    const eyelid = new THREE.Mesh(
      new THREE.TorusGeometry(headR * 0.14, headR * 0.028, 6, 12, Math.PI),
      hairMat
    );
    eyelid.position.set(ex, ey + headR * 0.02, ez + headR * 0.04);
    eyelid.rotation.z = side * -0.08;
    headGroup.add(eyelid);

    const brow = new THREE.Mesh(
      new THREE.TorusGeometry(headR * 0.18, headR * 0.028, 6, 12, Math.PI * 0.72),
      hairMat
    );
    brow.position.set(ex - side * headR * 0.02, ey + headR * 0.14, ez + headR * 0.03);
    brow.rotation.z = Math.PI * 0.14 + side * -0.14;
    headGroup.add(brow);
  }

  // Sculpted Smiling Mouth Arc
  const smileArc = new THREE.Mesh(
    new THREE.TorusGeometry(headR * 0.20, headR * 0.026, 8, 14, Math.PI * 0.78),
    lipMat
  );
  smileArc.rotation.z = Math.PI * 1.11;
  smileArc.rotation.x = 0.15;
  smileArc.position.set(0, -headR * 0.18, headR * 0.88);
  headGroup.add(smileArc);

  // Layered Sculpted Hair Cap, Sideburns & Back Hair Volume
  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(headR * 1.04, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.62),
    hairMat
  );
  hairCap.position.set(0, headR * 0.06, -headR * 0.04);
  hairCap.rotation.x = -0.22;
  headGroup.add(hairCap);

  // Swept front hair bangs
  for (const side of [-1, 1]) {
    const bang = new THREE.Mesh(
      new THREE.SphereGeometry(headR * 0.36, 12, 10),
      hairMat
    );
    bang.scale.set(1.25, 0.58, 0.72);
    bang.position.set(side * headR * 0.38, headR * 0.56, headR * 0.68);
    bang.rotation.z = side * -0.28;
    bang.rotation.x = 0.32;
    headGroup.add(bang);
  }

  // Optional Top Hat / Headwear resting cleanly on top of hairCap
  if (hatHeightM > 0.01) {
    const hatMat = new THREE.MeshStandardMaterial({
      color: hatColorHex,
      normalMap: fabricNormal,
      normalScale: new THREE.Vector2(0.3, 0.3),
      roughness: 0.48,
    });
    const brim = new THREE.Mesh(
      new THREE.CylinderGeometry(headR * 1.56, headR * 1.56, 0.024 * scale, 22),
      hatMat
    );
    brim.position.y = headR * 0.92;
    headGroup.add(brim);

    const crown = new THREE.Mesh(
      new THREE.CylinderGeometry(headR * 1.14, headR * 0.94, hatHeightM, 20),
      hatMat
    );
    crown.position.y = brim.position.y + 0.012 * scale + hatHeightM / 2;
    crown.rotation.z = -0.08;
    headGroup.add(crown);

    const ribbon = new THREE.Mesh(
      new THREE.CylinderGeometry(headR * 0.99, headR * 0.97, Math.min(0.052, hatHeightM * 0.22), 20),
      trimMat
    );
    ribbon.position.y = brim.position.y + 0.032;
    ribbon.rotation.z = -0.08;
    headGroup.add(ribbon);
  }

  // Optional Wonderland Hare / Rabbit Ears
  if (hasRabbitEars) {
    const earOuterMat = new THREE.MeshStandardMaterial({ color: 0xd8d2c8, roughness: 0.58 });
    const earInnerMat = new THREE.MeshStandardMaterial({ color: 0xe69cb0, roughness: 0.55 });
    for (const side of [-1, 1]) {
      const earGroup = new THREE.Group();
      earGroup.position.set(side * headR * 0.52, headR * 0.94, 0);
      earGroup.rotation.z = side * -0.22;
      earGroup.rotation.x = 0.12;

      const outerEar = new THREE.Mesh(
        new RoundedBoxGeometry(0.052 * scale, 0.34 * scale, 0.028 * scale, 2, 0.014),
        earOuterMat
      );
      outerEar.position.y = 0.17 * scale;
      earGroup.add(outerEar);

      const innerEar = new THREE.Mesh(
        new THREE.BoxGeometry(0.028 * scale, 0.26 * scale, 0.016 * scale),
        earInnerMat
      );
      innerEar.position.set(0, 0.17 * scale, 0.016 * scale);
      earGroup.add(innerEar);

      headGroup.add(earGroup);
    }
  }

  g.add(headGroup);
  return g;
}

export interface GrinchCharacterOptions {
  readonly heightM?: number;
  readonly santaDisguise?: boolean;
  readonly holdingSack?: boolean;
  readonly carvingKnife?: boolean;
  readonly spyglassPose?: boolean;
}

/**
 * Builds an expressive, bespoke 3D model of the Grinch with his signature
 * pear-shaped furry green body (`LatheGeometry`), slumped S-curved posture,
 * shaggy fur ruffs around neck/jowls/wrists, articulated arms with long curved
 * green fingers, glowing yellow-amber cat-like eyes with crimson pupils &
 * furrowed chartreuse brow ridges, wide mischievous Grinch smirk, and optional
 * tailored red velvet Santa disguise with white fur trim & stolen gift sack.
 */
export function createGrinchCharacter(
  options: GrinchCharacterOptions = {}
): THREE.Group {
  const heightM = options.heightM ?? 1.82;
  const scale = heightM / 1.82;
  const g = new THREE.Group();
  g.userData.isCharacterBlocking = true;

  const fabricNormal = createFabricWeaveNormalTexture();

  const grinchFurMat = new THREE.MeshStandardMaterial({
    color: 0x4cb834,
    normalMap: fabricNormal,
    normalScale: new THREE.Vector2(0.55, 0.55),
    roughness: 0.62,
    metalness: 0.03,
  });
  const bellyFurMat = new THREE.MeshStandardMaterial({
    color: 0x62cc44,
    normalMap: fabricNormal,
    normalScale: new THREE.Vector2(0.45, 0.45),
    roughness: 0.64,
  });
  const darkGreenMat = new THREE.MeshStandardMaterial({
    color: 0x1c5614,
    normalMap: fabricNormal,
    normalScale: new THREE.Vector2(0.4, 0.4),
    roughness: 0.68,
  });
  const santaRedMat = new THREE.MeshStandardMaterial({
    color: 0xc41c2c,
    normalMap: fabricNormal,
    normalScale: new THREE.Vector2(0.38, 0.38),
    roughness: 0.52,
  });
  const whiteFurMat = new THREE.MeshStandardMaterial({
    color: 0xd0d6dc,
    normalMap: fabricNormal,
    normalScale: new THREE.Vector2(0.6, 0.6),
    roughness: 0.64,
  });
  const beltMat = new THREE.MeshStandardMaterial({
    color: 0x18161a,
    roughness: 0.38,
    metalness: 0.22,
  });
  const buckleMat = new THREE.MeshStandardMaterial({
    color: 0xd8a832,
    roughness: 0.25,
    metalness: 0.78,
  });
  const yellowEyeMat = new THREE.MeshStandardMaterial({
    color: 0xf0dc34,
    emissive: 0xd8b818,
    emissiveIntensity: 0.42,
    roughness: 0.2,
  });
  const pupilMat = new THREE.MeshStandardMaterial({
    color: 0xb8121c,
    roughness: 0.15,
  });
  const catchlightMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
  });

  // Base stand disc
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.20 * scale, 0.22 * scale, 0.024, 22),
    new THREE.MeshStandardMaterial({ color: 0x1e222a, roughness: 0.5 })
  );
  base.position.y = 0.012;
  g.add(base);

  // Curled Seussian Grinch Shoes & Articulated Furry Legs (Thigh + Knee + Calf + Ankle Ruff)
  for (const side of [-1, 1]) {
    const lx = side * 0.092 * scale;
    const shoeMat = options.santaDisguise ? santaRedMat : darkGreenMat;

    // Long Seussian curled-toe Grinch shoe built from a smooth TubeGeometry
    const shoeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(lx, 0.038 * scale, -0.035 * scale),
      new THREE.Vector3(lx, 0.034 * scale, 0.055 * scale),
      new THREE.Vector3(lx + side * 0.012 * scale, 0.042 * scale, 0.135 * scale),
      new THREE.Vector3(lx + side * 0.022 * scale, 0.095 * scale, 0.175 * scale),
      new THREE.Vector3(lx + side * 0.016 * scale, 0.118 * scale, 0.145 * scale),
    ]);
    const shoeTube = new THREE.Mesh(
      new THREE.TubeGeometry(shoeCurve, 16, 0.032 * scale, 10, false),
      shoeMat
    );
    shoeTube.scale.set(1.05, 0.82, 1.0);
    shoeTube.castShadow = true;
    g.add(shoeTube);

    // Spindly S-curved Grinch leg (slightly bowed knees)
    const legCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(lx, 0.05 * scale, -0.01 * scale),
      new THREE.Vector3(lx + side * 0.018 * scale, 0.28 * scale, 0.025 * scale),
      new THREE.Vector3(lx, 0.56 * scale, -0.01 * scale),
    ]);
    const legMesh = new THREE.Mesh(
      new THREE.TubeGeometry(legCurve, 14, 0.038 * scale, 10, false),
      grinchFurMat
    );
    legMesh.castShadow = true;
    g.add(legMesh);

    // Shaggy ankle fur tufts
    const ankleRuff = new THREE.Mesh(
      new THREE.ConeGeometry(0.048 * scale, 0.065 * scale, 8),
      grinchFurMat
    );
    ankleRuff.position.set(lx, 0.09 * scale, 0.005 * scale);
    ankleRuff.rotation.x = Math.PI;
    g.add(ankleRuff);
  }

  // Signature Pear-Shaped Pot-Bellied Grinch Torso (`LatheGeometry` profile)
  const torsoBaseY = 0.52 * scale;
  const torsoH = 0.72 * scale;
  const bodyMat = options.santaDisguise ? santaRedMat : grinchFurMat;

  const grinchTorsoPts = [
    new THREE.Vector2(0.001, 0),
    new THREE.Vector2(0.165 * scale, 0.04 * torsoH),
    new THREE.Vector2(0.205 * scale, 0.24 * torsoH), // Wide pear-shaped pot belly!
    new THREE.Vector2(0.188 * scale, 0.44 * torsoH),
    new THREE.Vector2(0.132 * scale, 0.68 * torsoH), // Narrow ribcage
    new THREE.Vector2(0.145 * scale, 0.88 * torsoH), // Hunched shoulders
    new THREE.Vector2(0.058 * scale, 1.0 * torsoH),  // Neck base
  ];
  const grinchTorsoGeo = new THREE.LatheGeometry(grinchTorsoPts, 22);
  grinchTorsoGeo.scale(1.0, 1.0, 0.86);
  const grinchTorso = new THREE.Mesh(grinchTorsoGeo, bodyMat);
  grinchTorso.position.set(0, torsoBaseY, 0.018 * scale);
  grinchTorso.rotation.x = 0.08; // Slumped forward Grinch posture
  grinchTorso.castShadow = true;
  g.add(grinchTorso);

  // Prominent protruding round belly puff
  const bellyPatch = new THREE.Mesh(
    new THREE.SphereGeometry(0.162 * scale, 16, 14),
    options.santaDisguise ? santaRedMat : bellyFurMat
  );
  bellyPatch.scale.set(0.95, 1.08, 0.88);
  bellyPatch.position.set(0, 0.73 * scale, 0.068 * scale);
  g.add(bellyPatch);

  if (options.santaDisguise) {
    // Plush White Fur Coat Hem, Center Placket, Belt & Collar Ruff
    const bottomFurRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.172 * scale, 0.034 * scale, 10, 22),
      whiteFurMat
    );
    bottomFurRim.rotation.x = Math.PI / 2 + 0.06;
    bottomFurRim.scale.set(1.04, 0.88, 1.0);
    bottomFurRim.position.set(0, 0.55 * scale, 0.022 * scale);
    g.add(bottomFurRim);

    const centerFurPlacket = new THREE.Mesh(
      new RoundedBoxGeometry(0.058 * scale, 0.64 * scale, 0.036 * scale, 3, 0.015 * scale),
      whiteFurMat
    );
    centerFurPlacket.position.set(0, 0.88 * scale, 0.165 * scale);
    centerFurPlacket.rotation.x = -0.06;
    g.add(centerFurPlacket);

    // Santa Black Belt & Gold Buckle cinching the Grinch's pot belly
    const belt = new THREE.Mesh(
      new THREE.TorusGeometry(0.188 * scale, 0.022 * scale, 8, 22),
      beltMat
    );
    belt.rotation.x = Math.PI / 2 + 0.08;
    belt.scale.set(1.0, 0.88, 1.0);
    belt.position.set(0, 0.76 * scale, 0.042 * scale);
    g.add(belt);

    const buckle = new THREE.Mesh(
      new RoundedBoxGeometry(0.058 * scale, 0.054 * scale, 0.022 * scale, 2, 0.006 * scale),
      buckleMat
    );
    buckle.position.set(0, 0.76 * scale, 0.215 * scale);
    g.add(buckle);

    const collarFur = new THREE.Mesh(
      new THREE.TorusGeometry(0.088 * scale, 0.028 * scale, 10, 18),
      whiteFurMat
    );
    collarFur.rotation.x = Math.PI / 2 + 0.18;
    collarFur.position.set(0, 1.21 * scale, 0.045 * scale);
    g.add(collarFur);
  } else {
    // Shaggy Green Neck & Chest Fur Ruff
    for (let f = 0; f < 9; f++) {
      const a = (f / 9) * Math.PI * 2;
      const tuft = new THREE.Mesh(
        new THREE.ConeGeometry(0.034 * scale, 0.095 * scale, 6),
        grinchFurMat
      );
      tuft.position.set(
        Math.cos(a) * 0.095 * scale,
        1.18 * scale,
        0.04 * scale + Math.sin(a) * 0.085 * scale
      );
      tuft.rotation.x = Math.PI * 0.75 + Math.sin(a) * 0.35;
      tuft.rotation.z = -Math.cos(a) * 0.35;
      g.add(tuft);
    }
  }

  // Articulated 2-Segment Grinch Arms + Long Spindly Curved Grinch Fingers
  const shoulderY = 1.15 * scale;
  const shoulderX = 0.155 * scale;
  for (const side of [-1, 1]) {
    const armGroup = new THREE.Group();
    armGroup.position.set(side * shoulderX, shoulderY, 0.035 * scale);

    let elbowBendX = -0.42;
    let elbowBendZ = side * -0.18;
    if (options.spyglassPose && side === 1) {
      armGroup.rotation.x = -1.28;
      armGroup.rotation.z = -0.26;
      elbowBendX = -0.85;
    } else if (options.holdingSack && side === -1) {
      armGroup.rotation.x = -0.68;
      armGroup.rotation.z = 0.36;
      elbowBendX = -0.72;
    } else if (options.carvingKnife && side === 1) {
      armGroup.rotation.x = -0.82;
      armGroup.rotation.z = 0.24;
      elbowBendX = -0.58;
    } else {
      armGroup.rotation.z = side * 0.24;
      armGroup.rotation.x = -0.22;
    }

    const upperSleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.036 * scale, 0.030 * scale, 0.24 * scale, 10),
      bodyMat
    );
    upperSleeve.position.y = -0.12 * scale;
    upperSleeve.castShadow = true;
    armGroup.add(upperSleeve);

    const elbowGroup = new THREE.Group();
    elbowGroup.position.set(0, -0.24 * scale, 0);
    elbowGroup.rotation.x = elbowBendX;
    elbowGroup.rotation.z = elbowBendZ;

    const forearmSleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.030 * scale, 0.026 * scale, 0.22 * scale, 10),
      bodyMat
    );
    forearmSleeve.position.y = -0.11 * scale;
    forearmSleeve.castShadow = true;
    elbowGroup.add(forearmSleeve);

    if (options.santaDisguise) {
      const cuff = new THREE.Mesh(
        new THREE.TorusGeometry(0.030 * scale, 0.015 * scale, 8, 14),
        whiteFurMat
      );
      cuff.rotation.x = Math.PI / 2;
      cuff.position.y = -0.21 * scale;
      elbowGroup.add(cuff);
    }

    // Long furry Grinch palm + 3 spindly curved fingers
    const handGroup = new THREE.Group();
    handGroup.position.set(0, -0.24 * scale, 0);
    const palm = new THREE.Mesh(
      new THREE.SphereGeometry(0.026 * scale, 10, 8),
      grinchFurMat
    );
    palm.scale.set(0.85, 1.35, 0.65);
    handGroup.add(palm);

    for (let f = -1; f <= 1; f++) {
      const fingerCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(f * 0.010 * scale, -0.018 * scale, 0),
        new THREE.Vector3(f * 0.014 * scale, -0.052 * scale, 0.016 * scale),
        new THREE.Vector3(f * 0.012 * scale, -0.078 * scale, 0.004 * scale),
      ]);
      const finger = new THREE.Mesh(
        new THREE.TubeGeometry(fingerCurve, 8, 0.0055 * scale, 6, false),
        grinchFurMat
      );
      handGroup.add(finger);
    }

    if (options.carvingKnife && side === 1) {
      const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012 * scale, 0.012 * scale, 0.11 * scale, 8),
        new THREE.MeshStandardMaterial({ color: 0x4a2c18, roughness: 0.6 })
      );
      handle.rotation.x = Math.PI / 2;
      handle.position.set(0, -0.04 * scale, 0.04 * scale);
      handGroup.add(handle);

      const blade = new THREE.Mesh(
        new THREE.ConeGeometry(0.026 * scale, 0.24 * scale, 4),
        new THREE.MeshStandardMaterial({ color: 0xd0d6dc, roughness: 0.2, metalness: 0.85 })
      );
      blade.rotation.x = Math.PI / 2;
      blade.scale.set(0.25, 1.0, 1.0);
      blade.position.set(0, -0.04 * scale, 0.18 * scale);
      handGroup.add(blade);
    }

    elbowGroup.add(handGroup);
    armGroup.add(elbowGroup);
    g.add(armGroup);
  }

  // Forward-Slung Neck & Signature Pear-Shaped Grinch Head (wide furry jowls, narrow forehead)
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.036 * scale, 0.046 * scale, 0.09 * scale, 10),
    grinchFurMat
  );
  neck.position.set(0, 1.26 * scale, 0.048 * scale);
  neck.rotation.x = 0.22;
  g.add(neck);

  const headY = 1.40 * scale;
  const headZ = 0.068 * scale;
  const headGroup = new THREE.Group();
  headGroup.position.set(0, headY, headZ);

  // Pear-shaped head profile using LatheGeometry
  const headLathePts = [
    new THREE.Vector2(0.001, -0.11 * scale),
    new THREE.Vector2(0.085 * scale, -0.09 * scale), // Chin
    new THREE.Vector2(0.142 * scale, -0.02 * scale), // Wide furry Grinch jowls!
    new THREE.Vector2(0.125 * scale, 0.04 * scale),  // Cheekbones
    new THREE.Vector2(0.088 * scale, 0.11 * scale),  // Narrow temples
    new THREE.Vector2(0.072 * scale, 0.17 * scale),  // Forehead
    new THREE.Vector2(0.001, 0.20 * scale),          // Crown
  ];
  const headLatheGeo = new THREE.LatheGeometry(headLathePts, 20);
  headLatheGeo.scale(1.0, 1.0, 0.92);
  const grinchHeadMesh = new THREE.Mesh(headLatheGeo, grinchFurMat);
  grinchHeadMesh.castShadow = true;
  headGroup.add(grinchHeadMesh);

  // Shaggy side-cheek fur tufts flaring outward from the jowls
  for (const side of [-1, 1]) {
    for (let t = 0; t < 3; t++) {
      const cheekTuft = new THREE.Mesh(
        new THREE.ConeGeometry(0.028 * scale, 0.085 * scale, 6),
        grinchFurMat
      );
      cheekTuft.position.set(
        side * (0.145 + t * 0.012) * scale,
        (-0.03 + t * 0.022) * scale,
        0.01 * scale
      );
      cheekTuft.rotation.z = side * -(Math.PI * 0.42 + t * 0.12);
      headGroup.add(cheekTuft);
    }
  }

  // Prominent Muzzle Snout, Dark Green Cat-Nose & Philtrum
  const muzzle = new THREE.Mesh(
    new THREE.SphereGeometry(0.072 * scale, 14, 12),
    bellyFurMat
  );
  muzzle.scale.set(1.15, 0.78, 0.95);
  muzzle.position.set(0, -0.022 * scale, 0.095 * scale);
  headGroup.add(muzzle);

  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(0.022 * scale, 10, 8),
    darkGreenMat
  );
  nose.scale.set(1.2, 0.85, 1.1);
  nose.position.set(0, 0.012 * scale, 0.158 * scale);
  headGroup.add(nose);

  // Signature Wide Mischievous Curved Grinch Smirk (`TubeGeometry`)
  const smirkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.088 * scale, -0.008 * scale, 0.105 * scale),
    new THREE.Vector3(-0.045 * scale, -0.048 * scale, 0.142 * scale),
    new THREE.Vector3(0, -0.056 * scale, 0.156 * scale),
    new THREE.Vector3(0.045 * scale, -0.048 * scale, 0.142 * scale),
    new THREE.Vector3(0.088 * scale, -0.008 * scale, 0.105 * scale),
  ]);
  const smirkTube = new THREE.Mesh(
    new THREE.TubeGeometry(smirkCurve, 18, 0.0075 * scale, 6, false),
    darkGreenMat
  );
  headGroup.add(smirkTube);

  // Smirk corner dimples
  for (const side of [-1, 1]) {
    const dimple = new THREE.Mesh(
      new THREE.TorusGeometry(0.018 * scale, 0.005 * scale, 6, 10, Math.PI * 0.8),
      darkGreenMat
    );
    dimple.position.set(side * 0.090 * scale, -0.005 * scale, 0.102 * scale);
    dimple.rotation.z = side === 1 ? -0.4 : Math.PI + 0.4;
    headGroup.add(dimple);
  }

  // Glowing Yellow-Amber Eyes, Crimson Pupils, Specular Catchlights & Furrowed Brow Ridges
  for (const side of [-1, 1]) {
    const ex = side * 0.044 * scale;
    const ey = 0.052 * scale;
    const ez = 0.098 * scale;

    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.025 * scale, 12, 10),
      yellowEyeMat
    );
    eye.scale.set(1.15, 0.88, 0.72);
    eye.position.set(ex, ey, ez);
    eye.rotation.z = side * -0.18;
    headGroup.add(eye);

    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.011 * scale, 8, 8),
      pupilMat
    );
    pupil.scale.set(0.75, 1.15, 0.6);
    pupil.position.set(ex, ey, ez + 0.018 * scale);
    headGroup.add(pupil);

    const catchlight = new THREE.Mesh(
      new THREE.SphereGeometry(0.005 * scale, 6, 6),
      catchlightMat
    );
    catchlight.position.set(ex + 0.006 * scale, ey + 0.006 * scale, ez + 0.024 * scale);
    headGroup.add(catchlight);

    // Heavy furrowed V-angled Grinch brow ridge
    const browCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.010 * scale, ey + 0.015 * scale, ez + 0.022 * scale),
      new THREE.Vector3(side * 0.045 * scale, ey + 0.032 * scale, ez + 0.018 * scale),
      new THREE.Vector3(side * 0.078 * scale, ey + 0.048 * scale, ez - 0.005 * scale),
    ]);
    const browTube = new THREE.Mesh(
      new THREE.TubeGeometry(browCurve, 10, 0.011 * scale, 6, false),
      darkGreenMat
    );
    headGroup.add(browTube);
  }

  // Wild Sprouting Green Hair Tufts on Crown + Optional Slouching Santa Hat
  for (let t = -1; t <= 1; t++) {
    const tuftCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(t * 0.018 * scale, 0.18 * scale, 0),
      new THREE.Vector3(t * 0.035 * scale, 0.25 * scale, 0.015 * scale),
      new THREE.Vector3(t * 0.052 * scale, 0.29 * scale, -0.02 * scale),
    ]);
    const hairTuft = new THREE.Mesh(
      new THREE.TubeGeometry(tuftCurve, 8, 0.012 * scale, 6, false),
      grinchFurMat
    );
    headGroup.add(hairTuft);
  }

  if (options.santaDisguise) {
    const hatBrim = new THREE.Mesh(
      new THREE.TorusGeometry(0.088 * scale, 0.026 * scale, 10, 18),
      whiteFurMat
    );
    hatBrim.rotation.x = Math.PI / 2 - 0.14;
    hatBrim.position.set(0, 0.175 * scale, -0.005 * scale);
    headGroup.add(hatBrim);

    // Curved drooping Santa cap (`TubeGeometry`)
    const hatCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.18 * scale, -0.005 * scale),
      new THREE.Vector3(0.03 * scale, 0.30 * scale, -0.02 * scale),
      new THREE.Vector3(0.09 * scale, 0.35 * scale, -0.05 * scale),
      new THREE.Vector3(0.15 * scale, 0.28 * scale, -0.08 * scale),
    ]);
    const hatCone = new THREE.Mesh(
      new THREE.TubeGeometry(hatCurve, 16, 0.055 * scale, 10, false),
      santaRedMat
    );
    headGroup.add(hatCone);

    const pom = new THREE.Mesh(
      new THREE.SphereGeometry(0.036 * scale, 10, 10),
      whiteFurMat
    );
    pom.position.set(0.155 * scale, 0.265 * scale, -0.085 * scale);
    headGroup.add(pom);
  }

  g.add(headGroup);

  // Optional Overstuffed Stolen Christmas Sack slung beside/behind left hip —
  // built from randomly sized tilted square/rectangular box volumes pressing out
  // the crimson sack cloth, plus wrapped square presents of varied sizes poking out the top!
  if (options.holdingSack) {
    const sackGroup = new THREE.Group();
    sackGroup.position.set(-0.34 * scale, 0.78 * scale, -0.16 * scale);

    // Core faceted cloth hull stretched taut over internal square/rectangular boxes
    const stuffedBoxBulges = [
      { x: 0.0, y: -0.02, z: 0.0, w: 0.24, h: 0.26, d: 0.22, rx: 0.12, ry: 0.18, rz: -0.08 },
      { x: -0.06, y: -0.08, z: 0.05, w: 0.17, h: 0.16, d: 0.18, rx: -0.22, ry: 0.35, rz: 0.18 },
      { x: 0.07, y: -0.06, z: -0.04, w: 0.19, h: 0.18, d: 0.16, rx: 0.28, ry: -0.24, rz: -0.22 },
      { x: -0.05, y: 0.06, z: -0.05, w: 0.16, h: 0.19, d: 0.15, rx: -0.16, ry: -0.32, rz: 0.24 },
      { x: 0.06, y: 0.05, z: 0.06, w: 0.15, h: 0.15, d: 0.17, rx: 0.19, ry: 0.42, rz: -0.15 },
      { x: 0.0, y: 0.12, z: 0.01, w: 0.18, h: 0.14, d: 0.16, rx: -0.14, ry: 0.12, rz: 0.16 },
    ] as const;

    for (const b of stuffedBoxBulges) {
      const boxBulge = new THREE.Mesh(
        new RoundedBoxGeometry(
          b.w * scale,
          b.h * scale,
          b.d * scale,
          2,
          0.018 * scale
        ),
        santaRedMat
      );
      boxBulge.position.set(b.x * scale, b.y * scale, b.z * scale);
      boxBulge.rotation.set(b.rx, b.ry, b.rz);
      boxBulge.castShadow = true;
      sackGroup.add(boxBulge);
    }

    const sackNeck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085 * scale, 0.065 * scale, 0.08 * scale, 8),
      santaRedMat
    );
    sackNeck.position.y = 0.21 * scale;
    sackGroup.add(sackNeck);

    // Protruding wrapped square & rectangular gift boxes of random sizes bursting from the sack mouth
    const topGiftSpecs = [
      { x: -0.025, y: 0.26, z: 0.015, w: 0.085, h: 0.085, d: 0.085, rx: 0.28, ry: 0.35, rz: -0.22, col: 0x2484d8 },
      { x: 0.032, y: 0.25, z: -0.018, w: 0.062, h: 0.095, d: 0.062, rx: -0.24, ry: -0.3, rz: 0.26, col: 0xd4a828 },
      { x: 0.005, y: 0.30, z: 0.005, w: 0.054, h: 0.054, d: 0.068, rx: 0.18, ry: 0.52, rz: 0.15, col: 0x2ca448 },
    ] as const;
    for (const tg of topGiftSpecs) {
      const giftBox = new THREE.Mesh(
        new RoundedBoxGeometry(
          tg.w * scale,
          tg.h * scale,
          tg.d * scale,
          1,
          0.005 * scale
        ),
        new THREE.MeshStandardMaterial({ color: tg.col, roughness: 0.45 })
      );
      giftBox.position.set(tg.x * scale, tg.y * scale, tg.z * scale);
      giftBox.rotation.set(tg.rx, tg.ry, tg.rz);
      sackGroup.add(giftBox);
    }

    g.add(sackGroup);
  }


  return g;
}

export interface MaxDogOptions {
  readonly scale?: number;
  readonly withAntler?: boolean;
  readonly sitting?: boolean;
}

/**
 * Builds an expressive, organic 3D model of Max the Dog with a sculpted canine
 * chest/ribcage/waist (`LatheGeometry`), muscular haunches, 4-toed paws, long
 * floppy hound ears, wet black nose, soulful eyes with catchlights, happy pink
 * tongue, red collar with gold tag, and his signature oversized crooked reindeer
 * antler tied on with a red ribbon bow.
 */
export function createMaxDogCharacter(options: MaxDogOptions = {}): THREE.Group {
  const scale = options.scale ?? 1.0;
  const g = new THREE.Group();
  g.userData.isCharacterBlocking = true;
  g.scale.setScalar(scale);

  const fabricNormal = createFabricWeaveNormalTexture();

  const coatMat = new THREE.MeshStandardMaterial({
    color: 0xc28042,
    normalMap: fabricNormal,
    normalScale: new THREE.Vector2(0.38, 0.38),
    roughness: 0.62,
  });
  const earMat = new THREE.MeshStandardMaterial({
    color: 0x683c1c,
    normalMap: fabricNormal,
    normalScale: new THREE.Vector2(0.42, 0.42),
    roughness: 0.66,
  });
  const chestMat = new THREE.MeshStandardMaterial({
    color: 0xd8c4a6,
    normalMap: fabricNormal,
    normalScale: new THREE.Vector2(0.32, 0.32),
    roughness: 0.62,
  });
  const redMat = new THREE.MeshStandardMaterial({
    color: 0xc81e2c,
    roughness: 0.45,
  });
  const goldTagMat = new THREE.MeshStandardMaterial({
    color: 0xd8a832,
    roughness: 0.25,
    metalness: 0.78,
  });
  const antlerMat = new THREE.MeshStandardMaterial({
    color: 0xc8aa78,
    roughness: 0.56,
  });
  const noseMat = new THREE.MeshStandardMaterial({
    color: 0x161418,
    roughness: 0.18,
    metalness: 0.1,
  });
  const scleraMat = new THREE.MeshStandardMaterial({
    color: 0xd8dce0,
    roughness: 0.2,
  });
  const pupilMat = new THREE.MeshStandardMaterial({
    color: 0x181210,
    roughness: 0.15,
  });
  const catchlightMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
  });
  const tongueMat = new THREE.MeshStandardMaterial({
    color: 0xe06878,
    roughness: 0.42,
  });

  // Base disc
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.18, 0.02, 18),
    new THREE.MeshStandardMaterial({ color: 0x20242c, roughness: 0.5 })
  );
  base.position.y = 0.01;
  g.add(base);

  // Sculpted Organic Canine Torso (`LatheGeometry`: broad chest -> tucked waist -> round rump)
  const bodyLathePts = [
    new THREE.Vector2(0.001, 0),
    new THREE.Vector2(0.078, 0.04),  // Rump
    new THREE.Vector2(0.082, 0.12),  // Haunches
    new THREE.Vector2(0.068, 0.22),  // Tucked waist
    new THREE.Vector2(0.092, 0.32),  // Deep ribcage / chest
    new THREE.Vector2(0.072, 0.40),  // Shoulders
    new THREE.Vector2(0.001, 0.43),
  ];
  const bodyGeo = new THREE.LatheGeometry(bodyLathePts, 18);
  bodyGeo.scale(0.88, 1.0, 1.05);
  const bodyMesh = new THREE.Mesh(bodyGeo, coatMat);
  if (options.sitting) {
    bodyMesh.rotation.x = Math.PI / 2 - 0.52;
    bodyMesh.position.set(0, 0.15, -0.14);
  } else {
    bodyMesh.rotation.x = Math.PI / 2 - 0.08;
    bodyMesh.position.set(0, 0.24, -0.18);
  }
  bodyMesh.castShadow = true;
  g.add(bodyMesh);

  // Fluffy Cream Chest Patch
  const chest = new THREE.Mesh(
    new THREE.SphereGeometry(0.078, 14, 12),
    chestMat
  );
  chest.scale.set(0.88, 1.12, 0.92);
  chest.position.set(0, options.sitting ? 0.30 : 0.27, 0.11);
  g.add(chest);

  // Articulated Front Legs, Muscular Hind Haunches & Sculpted Paws
  for (const side of [-1, 1]) {
    // Front leg + paw
    const fX = side * 0.064;
    const fZ = 0.10;
    const frontLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.020, 0.22, 10),
      coatMat
    );
    frontLeg.position.set(fX, 0.13, fZ);
    frontLeg.castShadow = true;
    g.add(frontLeg);

    const frontPaw = new THREE.Mesh(
      new THREE.SphereGeometry(0.026, 10, 8),
      chestMat
    );
    frontPaw.scale.set(0.95, 0.62, 1.35);
    frontPaw.position.set(fX, 0.028, fZ + 0.018);
    g.add(frontPaw);

    // Hind haunch + lower hock + paw
    const bX = side * 0.072;
    const bZ = -0.12;
    const haunch = new THREE.Mesh(
      new THREE.SphereGeometry(0.052, 12, 10),
      coatMat
    );
    haunch.scale.set(0.68, 1.25, 1.05);
    haunch.position.set(bX, options.sitting ? 0.12 : 0.21, bZ);
    haunch.rotation.x = options.sitting ? 0.65 : 0.18;
    g.add(haunch);

    const hindShank = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.019, options.sitting ? 0.12 : 0.20, 10),
      coatMat
    );
    hindShank.position.set(bX, options.sitting ? 0.06 : 0.11, options.sitting ? bZ + 0.04 : bZ - 0.01);
    hindShank.rotation.x = options.sitting ? -0.45 : -0.12;
    g.add(hindShank);

    const hindPaw = new THREE.Mesh(
      new THREE.SphereGeometry(0.026, 10, 8),
      chestMat
    );
    hindPaw.scale.set(0.95, 0.62, 1.35);
    hindPaw.position.set(bX, 0.028, options.sitting ? bZ + 0.07 : bZ + 0.012);
    g.add(hindPaw);
  }

  // Neck, Red Collar & Gold Dog Tag
  const neckY = options.sitting ? 0.38 : 0.35;
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.046, 0.058, 0.10, 12),
    coatMat
  );
  neck.position.set(0, neckY, 0.12);
  neck.rotation.x = 0.28;
  g.add(neck);

  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(0.054, 0.013, 8, 16),
    redMat
  );
  collar.rotation.x = Math.PI / 2 - 0.28;
  collar.position.set(0, neckY - 0.01, 0.125);
  g.add(collar);

  const dogTag = new THREE.Mesh(
    new THREE.CylinderGeometry(0.016, 0.016, 0.006, 12),
    goldTagMat
  );
  dogTag.rotation.x = Math.PI / 2;
  dogTag.position.set(0, neckY - 0.032, 0.182);
  g.add(dogTag);

  // Expressive Hound Head, Snout, Happy Open Mouth & Pink Tongue, Soulful Eyes & Floppy Ears
  const headY = options.sitting ? 0.46 : 0.43;
  const headZ = 0.15;
  const headGroup = new THREE.Group();
  headGroup.position.set(0, headY, headZ);

  const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.088, 16, 14), coatMat);
  cranium.scale.set(0.96, 1.02, 1.06);
  cranium.castShadow = true;
  headGroup.add(cranium);

  // Sculpted snout & muzzle puffs
  const snout = new THREE.Mesh(
    new THREE.SphereGeometry(0.052, 14, 12),
    chestMat
  );
  snout.scale.set(0.96, 0.78, 1.38);
  snout.position.set(0, -0.018, 0.082);
  headGroup.add(snout);

  // Happy open lower jaw & pink tongue lolling out
  const lowerJaw = new THREE.Mesh(
    new THREE.SphereGeometry(0.036, 10, 8),
    coatMat
  );
  lowerJaw.scale.set(0.88, 0.52, 1.25);
  lowerJaw.position.set(0, -0.052, 0.068);
  lowerJaw.rotation.x = 0.24;
  headGroup.add(lowerJaw);

  const tongue = new THREE.Mesh(
    new THREE.SphereGeometry(0.022, 10, 8),
    tongueMat
  );
  tongue.scale.set(0.85, 0.35, 1.45);
  tongue.position.set(0.008, -0.046, 0.105);
  tongue.rotation.x = 0.38;
  tongue.rotation.z = 0.18;
  headGroup.add(tongue);

  // Shiny wet black nose
  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(0.022, 10, 8),
    noseMat
  );
  nose.scale.set(1.15, 0.88, 0.95);
  nose.position.set(0, 0.004, 0.148);
  headGroup.add(nose);

  // Soulful Hound Eyes + Catchlights + Expressive Brows
  for (const side of [-1, 1]) {
    const ex = side * 0.034;
    const ey = 0.024;
    const ez = 0.076;

    const sclera = new THREE.Mesh(
      new THREE.SphereGeometry(0.020, 10, 10),
      scleraMat
    );
    sclera.scale.set(0.95, 1.15, 0.65);
    sclera.position.set(ex, ey, ez);
    headGroup.add(sclera);

    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.013, 8, 8),
      pupilMat
    );
    pupil.scale.set(0.95, 1.15, 0.55);
    pupil.position.set(ex, ey - 0.002, ez + 0.011);
    headGroup.add(pupil);

    const catchlight = new THREE.Mesh(
      new THREE.SphereGeometry(0.005, 6, 6),
      catchlightMat
    );
    catchlight.position.set(ex + 0.004, ey + 0.005, ez + 0.018);
    headGroup.add(catchlight);

    const brow = new THREE.Mesh(
      new THREE.TorusGeometry(0.022, 0.005, 6, 10, Math.PI * 0.7),
      earMat
    );
    brow.position.set(ex, ey + 0.022, ez + 0.006);
    brow.rotation.z = Math.PI * 0.15 + side * 0.22;
    headGroup.add(brow);

    // Long curved floppy hound ears (`TubeGeometry` with flared tip)
    const earCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.072, 0.035, -0.01),
      new THREE.Vector3(side * 0.105, -0.025, 0.005),
      new THREE.Vector3(side * 0.112, -0.105, 0.020),
      new THREE.Vector3(side * 0.095, -0.165, 0.032),
    ]);
    const earTube = new THREE.Mesh(
      new THREE.TubeGeometry(earCurve, 12, 0.024, 8, false),
      earMat
    );
    earTube.scale.set(0.55, 1.0, 1.35);
    earTube.castShadow = true;
    headGroup.add(earTube);
  }

  // Single Crooked Reindeer Antler with Red Ribbon Bow & String
  if (options.withAntler) {
    for (const side of [-1, 1]) {
      const bowLoop = new THREE.Mesh(
        new THREE.TorusGeometry(0.022, 0.007, 6, 12),
        redMat
      );
      bowLoop.position.set(side * 0.022, 0.092, 0.005);
      bowLoop.rotation.y = side * 0.35;
      headGroup.add(bowLoop);
    }
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), redMat);
    knot.position.set(0, 0.090, 0.010);
    headGroup.add(knot);

    // S-curved organic reindeer antler beam (`TubeGeometry`)
    const antlerBeamCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.092, 0.0),
      new THREE.Vector3(0.025, 0.18, -0.01),
      new THREE.Vector3(-0.015, 0.28, 0.01),
      new THREE.Vector3(0.035, 0.38, 0.02),
    ]);
    const mainBeam = new THREE.Mesh(
      new THREE.TubeGeometry(antlerBeamCurve, 16, 0.013, 8, false),
      antlerMat
    );
    headGroup.add(mainBeam);

    // Branched antler tines
    for (const [p0, p1] of [
      [new THREE.Vector3(0.018, 0.16, -0.008), new THREE.Vector3(-0.048, 0.22, 0.035)],
      [new THREE.Vector3(-0.008, 0.25, 0.005), new THREE.Vector3(0.068, 0.31, 0.028)],
      [new THREE.Vector3(0.012, 0.32, 0.012), new THREE.Vector3(-0.045, 0.39, 0.035)],
    ] as const) {
      const tineCurve = new THREE.CatmullRomCurve3([p0, p1]);
      const tine = new THREE.Mesh(
        new THREE.TubeGeometry(tineCurve, 8, 0.009, 6, false),
        antlerMat
      );
      headGroup.add(tine);
    }
  }

  g.add(headGroup);

  // Curved Wagging Tail (`TubeGeometry`)
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, options.sitting ? 0.14 : 0.27, -0.17),
    new THREE.Vector3(0.015, options.sitting ? 0.22 : 0.35, -0.24),
    new THREE.Vector3(-0.012, options.sitting ? 0.31 : 0.43, -0.27),
  ]);
  const tail = new THREE.Mesh(
    new THREE.TubeGeometry(tailCurve, 12, 0.016, 8, false),
    coatMat
  );
  g.add(tail);

  return g;
}

export interface WhoCharacterOptions {
  readonly heightM: number;
  readonly coatColorHex: number;
  readonly trimColorHex?: number;
  readonly hairColorHex?: number;
  readonly hatColorHex?: number;
  readonly hasBraids?: boolean;
  readonly holdingGift?: boolean;
}

/**
 * Builds a plump, whimsical Seussian Who character with a sculpted pear/bell-shaped
 * winter coat (`LatheGeometry`), plush white/cream fur collar & cuffs, knitted winter
 * muffler scarf, upturned Seussian Who button-snout nose, rosy Who cheeks, and
 * elaborate Seussian beehive / looped braid hairstyles (`TubeGeometry` curls & bows).
 */
export function createWhoCharacter(options: WhoCharacterOptions): THREE.Group {
  const g = createHumanScaleFigure(
    options.heightM,
    options.coatColorHex,
    options.hatColorHex !== undefined ? options.heightM * 0.14 : 0,
    options.hatColorHex ?? 0xe84888,
    false,
    {
      trimColorHex: options.trimColorHex ?? 0xd8dce4,
      hairColorHex: options.hairColorHex ?? 0xd89e38,
      armPose: options.holdingGift ? 'presenting' : 'relaxed',
    }
  );

  const scale = options.heightM / 1.7;
  const fabricNormal = createFabricWeaveNormalTexture();
  const coatMat = new THREE.MeshStandardMaterial({
    color: options.coatColorHex,
    normalMap: fabricNormal,
    normalScale: new THREE.Vector2(0.38, 0.38),
    roughness: 0.54,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: options.trimColorHex ?? 0xd8dce4,
    normalMap: fabricNormal,
    normalScale: new THREE.Vector2(0.45, 0.45),
    roughness: 0.58,
  });
  const hairMat = new THREE.MeshStandardMaterial({
    color: options.hairColorHex ?? 0xe8b43c,
    normalMap: fabricNormal,
    normalScale: new THREE.Vector2(0.4, 0.4),
    roughness: 0.58,
  });
  const ribbonMat = new THREE.MeshStandardMaterial({
    color: options.hatColorHex ?? 0xe62e5c,
    roughness: 0.42,
  });

  // Signature Plump Seussian Bell-Shaped Who Winter Coat (`LatheGeometry`)
  const bellBaseY = options.heightM * 0.28;
  const bellH = options.heightM * 0.44;
  const whoBellPts = [
    new THREE.Vector2(0.001, 0),
    new THREE.Vector2(0.172 * scale, 0.04 * bellH), // Flared scalloped winter coat skirt
    new THREE.Vector2(0.165 * scale, 0.28 * bellH), // Plump Seussian Who belly!
    new THREE.Vector2(0.148 * scale, 0.56 * bellH),
    new THREE.Vector2(0.122 * scale, 0.84 * bellH),
    new THREE.Vector2(0.062 * scale, 1.0 * bellH),
  ];
  const whoBellGeo = new THREE.LatheGeometry(whoBellPts, 20);
  whoBellGeo.scale(1.0, 1.0, 0.88);
  const whoBellCoat = new THREE.Mesh(whoBellGeo, coatMat);
  whoBellCoat.position.set(0, bellBaseY, 0.012 * scale);
  whoBellCoat.castShadow = true;
  g.add(whoBellCoat);

  // Plush Fur Hem Roll at bottom of Who bell coat
  const furHem = new THREE.Mesh(
    new THREE.TorusGeometry(0.168 * scale, 0.024 * scale, 10, 22),
    trimMat
  );
  furHem.rotation.x = Math.PI / 2;
  furHem.scale.set(1.0, 0.88, 1.0);
  furHem.position.set(0, bellBaseY + 0.02 * bellH, 0.012 * scale);
  g.add(furHem);

  // Cozy Knitted Winter Scarf / Muffler with hanging tail
  const scarfRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.072 * scale, 0.022 * scale, 10, 18),
    ribbonMat
  );
  scarfRing.rotation.x = Math.PI / 2 + 0.14;
  scarfRing.position.set(0, options.heightM * 0.75, 0.018 * scale);
  g.add(scarfRing);

  const scarfTail = new THREE.Mesh(
    new RoundedBoxGeometry(0.036 * scale, 0.14 * scale, 0.018 * scale, 2, 0.006 * scale),
    ribbonMat
  );
  scarfTail.position.set(0.042 * scale, options.heightM * 0.69, 0.095 * scale);
  scarfTail.rotation.z = 0.16;
  scarfTail.rotation.x = -0.12;
  g.add(scarfTail);

  // Signature Upturned Seussian Who Snout & Button Nose Tip
  const headY = options.heightM * 0.885;
  const whoSnout = new THREE.Mesh(
    new THREE.ConeGeometry(0.026 * scale, 0.052 * scale, 10),
    new THREE.MeshStandardMaterial({ color: 0xeac09e, roughness: 0.48 })
  );
  whoSnout.rotation.x = Math.PI / 2 - 0.38;
  whoSnout.position.set(0, headY - 0.005 * scale, 0.142 * scale);
  g.add(whoSnout);

  // Whimsical Seussian Beehive / Looped Braid Hairdo
  if (options.hasBraids) {
    for (const side of [-1, 1]) {
      const loopBraid = new THREE.Mesh(
        new THREE.TorusGeometry(0.056 * scale, 0.017 * scale, 10, 18),
        hairMat
      );
      loopBraid.position.set(side * 0.148 * scale, headY + 0.01 * scale, -0.01 * scale);
      loopBraid.rotation.z = side * 0.25;
      g.add(loopBraid);

      const braidBow = new THREE.Mesh(
        new THREE.SphereGeometry(0.022 * scale, 8, 8),
        ribbonMat
      );
      braidBow.scale.set(1.4, 0.85, 0.75);
      braidBow.position.set(side * 0.105 * scale, headY + 0.035 * scale, 0.01 * scale);
      g.add(braidBow);
    }

    // Tall central Cindy-Lou / Mama Who top-knot curl with bow
    if (options.hatColorHex === undefined) {
      const topCurl = new THREE.Mesh(
        new THREE.TorusGeometry(0.042 * scale, 0.015 * scale, 8, 16),
        hairMat
      );
      topCurl.position.set(0, headY + 0.155 * scale, -0.01 * scale);
      g.add(topCurl);

      const topBow = new THREE.Mesh(
        new THREE.SphereGeometry(0.026 * scale, 8, 8),
        ribbonMat
      );
      topBow.scale.set(1.5, 0.9, 0.8);
      topBow.position.set(0, headY + 0.115 * scale, 0.02 * scale);
      g.add(topBow);
    }
  } else if (options.hatColorHex === undefined) {
    // Tiered Seussian beehive curl stack
    for (let tier = 0; tier < 3; tier++) {
      const r = (0.068 - tier * 0.016) * scale;
      const hiveTier = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.018 * scale, 8, 16),
        hairMat
      );
      hiveTier.rotation.x = Math.PI / 2 - 0.12;
      hiveTier.position.set(
        (tier % 2 === 0 ? 1 : -1) * 0.008 * scale,
        headY + (0.095 + tier * 0.032) * scale,
        -0.01 * scale
      );
      g.add(hiveTier);
    }
  }

  if (options.holdingGift) {
    const giftGroup = new THREE.Group();
    giftGroup.position.set(0, options.heightM * 0.56, 0.215 * scale);
    giftGroup.rotation.x = 0.08;

    const giftBox = new THREE.Mesh(
      new RoundedBoxGeometry(0.145 * scale, 0.125 * scale, 0.135 * scale, 2, 0.018 * scale),
      new THREE.MeshStandardMaterial({ color: 0xd82842, roughness: 0.45 })
    );
    giftBox.castShadow = true;
    giftGroup.add(giftBox);

    const goldRibbonMat = new THREE.MeshStandardMaterial({
      color: 0xe8bd34,
      roughness: 0.32,
      metalness: 0.35,
    });
    const vWrap = new THREE.Mesh(
      new THREE.BoxGeometry(0.028 * scale, 0.130 * scale, 0.140 * scale),
      goldRibbonMat
    );
    giftGroup.add(vWrap);

    const hWrap = new THREE.Mesh(
      new THREE.BoxGeometry(0.150 * scale, 0.130 * scale, 0.028 * scale),
      goldRibbonMat
    );
    giftGroup.add(hWrap);

    for (const side of [-1, 1]) {
      const bowLoop = new THREE.Mesh(
        new THREE.TorusGeometry(0.026 * scale, 0.008 * scale, 8, 14),
        goldRibbonMat
      );
      bowLoop.position.set(side * 0.024 * scale, 0.078 * scale, 0);
      bowLoop.rotation.z = side * -0.35;
      giftGroup.add(bowLoop);
    }

    g.add(giftGroup);
  }

  return g;
}

export function buildSoftMaskingLegsAndBorders(
  blackVelourTex: THREE.CanvasTexture
): THREE.Group {
  const maskingGroup = new THREE.Group();
  maskingGroup.name = 'Element_black-velour-masking';

  const blackLegMat = new THREE.MeshStandardMaterial({
    map: blackVelourTex,
    roughness: 0.9,
  });

  for (const zPos of [-1.2, -3.6, -6.2]) {
    for (const side of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(1.65, 7.6, 0.12), blackLegMat);
      leg.position.set(side * 6.75, 3.8, zPos);
      leg.rotation.y = side * 0.08;
      leg.castShadow = true;
      maskingGroup.add(leg);
    }
    const border = new THREE.Mesh(new THREE.BoxGeometry(14.6, 1.15, 0.12), blackLegMat);
    border.position.set(0, 7.15, zPos + 0.06);
    maskingGroup.add(border);
  }

  return maskingGroup;
}

let cachedPaintedIcicleTex: THREE.CanvasTexture | null = null;

/**
 * Generates a cached Scenic Artist Trompe-l'oeil Painted Ice & Snow-Drip Texture
 * for 3-axis CNC-routed 15mm–18mm plywood icicle cutouts: painted glacier-blue
 * bevel facets, crisp central specular white highlights, and Seussian charcoal
 * ink cross-hatching that gives flat timber cutouts convincing 3D depth.
 */
export function getPaintedIcicleCutoutTexture(): THREE.CanvasTexture {
  if (cachedPaintedIcicleTex) {
    return cachedPaintedIcicleTex;
  }
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Vertical glacier-blue to frost-white scenic paint wash
    const vGrad = ctx.createLinearGradient(0, 0, 0, 512);
    vGrad.addColorStop(0, '#8cb4d8');
    vGrad.addColorStop(0.38, '#b8d2e6');
    vGrad.addColorStop(0.78, '#cde0ee');
    vGrad.addColorStop(1, '#98bfe0');
    ctx.fillStyle = vGrad;
    ctx.fillRect(0, 0, 512, 512);

    // Trompe-l'oeil vertical painted ice facets & specular highlight ribbons
    for (let x = 24; x < 512; x += 48) {
      const facetGrad = ctx.createLinearGradient(x - 18, 0, x + 22, 0);
      facetGrad.addColorStop(0, 'rgba(72, 112, 164, 0.36)');
      facetGrad.addColorStop(0.45, 'rgba(232, 245, 255, 0.52)');
      facetGrad.addColorStop(1, 'rgba(84, 128, 178, 0.34)');
      ctx.fillStyle = facetGrad;
      ctx.fillRect(x - 18, 0, 40, 512);
    }

    // Horizontal painted melt-ring glazes
    ctx.strokeStyle = 'rgba(236, 248, 255, 0.45)';
    ctx.lineWidth = 5;
    for (let y = 52; y < 480; y += 68) {
      ctx.beginPath();
      for (let x = 0; x <= 512; x += 32) {
        const wave = Math.sin((x / 512) * Math.PI * 6 + y * 0.04) * 7;
        if (x === 0) ctx.moveTo(x, y + wave);
        else ctx.lineTo(x, y + wave);
      }
      ctx.stroke();
    }

    // Scenic artist Seussian charcoal-blue ink cross-hatching
    ctx.strokeStyle = 'rgba(26, 44, 72, 0.34)';
    ctx.lineWidth = 2.2;
    for (let i = 0; i < 84; i++) {
      const hx = (i * 59) % 496;
      const hy = (i * 43) % 496;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx + 22, hy - 9);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1.2, 1.2);
  tex.colorSpace = THREE.SRGBColorSpace;
  cachedPaintedIcicleTex = tex;
  return tex;
}

/**
 * Builds a 3-axis CNC-routed 15mm (5/8") painted plywood icicle profile cutout
 * (`ExtrudeGeometry`) hanging downward from `y = 0` to `y = -lengthM`, with
 * Seussian wavy side scallops, a gentle S-curve bend, and scenic-artist painted
 * trompe-l'oeil ice shading — avoiding expensive 4-axis foam turning.
 */
export function createSculptedIcicleDrip(
  lengthM: number,
  topRadiusM: number,
  material: THREE.Material,
  curveBendM = 0.035
): THREE.Mesh {
  const steps = 12;
  const shape = new THREE.Shape();

  // Top mounting tab (tucked behind the rock/snow eave)
  shape.moveTo(-topRadiusM * 1.15, 0.015);
  shape.lineTo(topRadiusM * 1.15, 0.015);

  // Right scalloped profile descending from y = 0 down to y = -lengthM
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = -t * lengthM;
    const taper = Math.pow(1 - t, 0.76);
    const ripple = 1.0 + 0.14 * Math.sin(t * Math.PI * 4.0);
    const bendX = Math.sin(t * Math.PI * 1.1) * t * curveBendM;
    const halfWidth = Math.max(0.005, topRadiusM * taper * ripple);
    shape.lineTo(bendX + halfWidth, y);
  }

  // Left scalloped profile ascending from y = -lengthM back to y = 0
  for (let i = steps; i >= 0; i--) {
    const t = i / steps;
    const y = -t * lengthM;
    const taper = Math.pow(1 - t, 0.76);
    const ripple = 1.0 + 0.14 * Math.cos(t * Math.PI * 4.0);
    const bendX = Math.sin(t * Math.PI * 1.1) * t * curveBendM;
    const halfWidth = Math.max(0.005, topRadiusM * taper * ripple);
    shape.lineTo(bendX - halfWidth, y);
  }
  shape.closePath();

  const plyThicknessM = 0.015; // Standard 5/8" (15mm) CNC-routed scenic plywood
  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: plyThicknessM,
    bevelEnabled: true,
    bevelThickness: 0.003,
    bevelSize: 0.003,
    bevelSegments: 1,
    curveSegments: 8,
  });
  geom.translate(0, 0, -plyThicknessM * 0.5);

  const paintedMat =
    material instanceof THREE.MeshStandardMaterial
      ? new THREE.MeshStandardMaterial({
          map: getPaintedIcicleCutoutTexture(),
          color: material.color,
          roughness: Math.max(0.55, material.roughness),
          metalness: material.metalness,
        })
      : material;

  const mesh = new THREE.Mesh(geom, paintedMat);
  mesh.castShadow = true;
  return mesh;
}

/**
 * Builds a continuous 3-axis CNC-routed 18mm (3/4") plywood Seussian wavy
 * snow-drip & icicle valance flat (`ExtrudeGeometry`) spanning `[-widthM/2, +widthM/2]`
 * and hanging from `y = 0` down to `-maxDropM`, painted by scenic artists with
 * trompe-l'oeil ice facets and a dark Seussian ink shadow backing outline.
 */
export function createSeussianIcicleValance(
  widthM: number,
  maxDropM: number,
  fingerCount: number,
  frontMaterial: THREE.Material,
  glazeBackMaterial?: THREE.Material,
  depthM = 0.018,
  seed = 1
): THREE.Group {
  const group = new THREE.Group();
  const halfW = widthM / 2;
  const count = Math.max(3, fingerCount);
  const stepW = widthM / count;

  const shape = new THREE.Shape();
  shape.moveTo(-halfW, 0.04);
  shape.lineTo(halfW, 0.04);
  shape.lineTo(halfW, -maxDropM * 0.22);

  for (let i = count - 1; i >= 0; i--) {
    const rightX = -halfW + (i + 1) * stepW;
    const leftX = -halfW + i * stepW;
    const midX = (leftX + rightX) * 0.5;
    const hash = Math.abs(Math.sin((i + 1) * 12.9898 + seed * 78.233));
    const fingerLen = maxDropM * (0.48 + 0.52 * hash);
    const valleyY = -maxDropM * (0.16 + 0.12 * ((i + seed) % 2));
    const tipSkew = (i % 2 === 0 ? 1 : -1) * stepW * 0.08;

    // Smooth curve from right valley down to rounded icicle tip and back up to left valley
    shape.quadraticCurveTo(
      rightX - stepW * 0.18,
      -fingerLen * 0.55,
      midX + tipSkew,
      -fingerLen
    );
    shape.quadraticCurveTo(
      leftX + stepW * 0.18,
      -fingerLen * 0.55,
      leftX,
      valleyY
    );
  }

  shape.closePath();

  const plyDepth = Math.min(0.022, Math.max(0.012, depthM));
  const extrudeGeom = new THREE.ExtrudeGeometry(shape, {
    depth: plyDepth,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 1,
    curveSegments: 10,
  });
  extrudeGeom.translate(0, 0, -plyDepth / 2);

  const paintedFrontMat =
    frontMaterial instanceof THREE.MeshStandardMaterial
      ? new THREE.MeshStandardMaterial({
          map: getPaintedIcicleCutoutTexture(),
          color: frontMaterial.color,
          roughness: Math.max(0.55, frontMaterial.roughness),
          metalness: frontMaterial.metalness,
        })
      : frontMaterial;

  const frontMesh = new THREE.Mesh(extrudeGeom, paintedFrontMat);
  frontMesh.castShadow = true;
  group.add(frontMesh);

  if (glazeBackMaterial) {
    const backMesh = new THREE.Mesh(extrudeGeom, glazeBackMaterial);
    backMesh.scale.set(1.012, 1.04, 0.75);
    backMesh.position.set(0, -0.016, -0.024);
    group.add(backMesh);
  }

  return group;
}

export interface WhoFairyLightOptions {
  readonly bulbCount?: number;
  readonly bulbRadiusM?: number;
  readonly cordRadiusM?: number;
  readonly cordColor?: number;
  readonly sagM?: number;
  readonly colors?: ReadonlyArray<number>;
  readonly palette?: ReadonlyArray<number>;
  readonly emissiveIntensity?: number;
  readonly includePointLight?: boolean;
  readonly pointLightCount?: number;
  readonly pointLightColor?: number;
  readonly pointLightIntensity?: number;
  readonly pointLightDistance?: number;
}

const DEFAULT_WHO_FAIRY_PALETTE: ReadonlyArray<number> = [
  0xff1438, // Vivid Ruby Red
  0x00f050, // Brilliant Emerald Green
  0x00b8ff, // Electric Sapphire Blue
  0xffcf00, // Warm Golden Amber-Yellow
  0xff1cc4, // Whoville Festive Magenta
  0xff6a00, // Bright Tangerine Orange
  0x9a2eff, // Radiant Amethyst Purple
];

let cachedFairyGlowSpriteTex: THREE.CanvasTexture | null = null;

/**
 * Generates a cached soft radial glow & subtle 4-point twinkle sprite texture
 * used with `THREE.AdditiveBlending` so every fairy light bulb radiates an
 * unmistakable, tasteful multi-colored halo from any camera distance.
 */
function getFairyLightGlowSpriteTexture(): THREE.CanvasTexture {
  if (cachedFairyGlowSpriteTex) {
    return cachedFairyGlowSpriteTex;
  }
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const cx = 64;
    const cy = 64;
    const rad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 62);
    rad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    rad.addColorStop(0.18, 'rgba(255, 255, 255, 0.86)');
    rad.addColorStop(0.42, 'rgba(255, 255, 255, 0.38)');
    rad.addColorStop(0.72, 'rgba(255, 255, 255, 0.10)');
    rad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, 128, 128);

    // Delicate 4-point theatrical lens star-glint
    ctx.save();
    ctx.translate(cx, cy);
    for (const rot of [0, Math.PI * 0.5]) {
      ctx.save();
      ctx.rotate(rot);
      const spikeGrad = ctx.createLinearGradient(-56, 0, 56, 0);
      spikeGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.0)');
      spikeGrad.addColorStop(0.42, 'rgba(255, 255, 255, 0.32)');
      spikeGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.75)');
      spikeGrad.addColorStop(0.58, 'rgba(255, 255, 255, 0.32)');
      spikeGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
      ctx.fillStyle = spikeGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 56, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  cachedFairyGlowSpriteTex = tex;
  return tex;
}

const noopRaycast = (): void => {
  // Glow sprites are purely visual; ignore during pointer raycasting
};

/**
 * Builds a Multi-Colored Emissive Who-Land Fairy Light Strand (`createWhoLandFairyLightStrand`)
 * draped along `waypoints` with optional catenary sag between points, a dark
 * forest-green festoon wire, brass bulb sockets, bright multi-colored emissive
 * C9 glass bulbs, additive radial star-glow halos, and practical `THREE.PointLight`s.
 */
export function createWhoLandFairyLightStrand(
  waypoints: ReadonlyArray<THREE.Vector3>,
  options: WhoFairyLightOptions = {}
): THREE.Group {
  const strandGroup = new THREE.Group();
  strandGroup.name = 'WhoLandFairyLightStrand';
  strandGroup.userData.isFairyLightStrand = true;
  if (waypoints.length < 2) {
    return strandGroup;
  }

  const bulbCount = options.bulbCount ?? 14;
  // Slightly larger C9 theatrical festoon bulb radius so bulbs read clearly from the house
  const bulbRadiusM = (options.bulbRadiusM ?? 0.034) * 1.18;
  const cordRadiusM = options.cordRadiusM ?? 0.009;
  const sagM = options.sagM ?? 0.0;
  const customColors = options.colors ?? options.palette;
  const palette =
    customColors && customColors.length > 0
      ? customColors
      : DEFAULT_WHO_FAIRY_PALETTE;
  const baseEmissive = Math.max(1.55, Math.min(2.4, options.emissiveIntensity ?? 1.85));

  // Subdivide between waypoints if sagM > 0 so each span forms a natural catenary swag
  const curvePts: THREE.Vector3[] = [];
  if (Math.abs(sagM) > 1e-4 && waypoints.length >= 2) {
    for (let i = 0; i < waypoints.length - 1; i++) {
      const p0 = waypoints[i]!;
      const p1 = waypoints[i + 1]!;
      if (i === 0) curvePts.push(p0.clone());
      const mid = new THREE.Vector3().lerpVectors(p0, p1, 0.5);
      mid.y -= sagM;
      curvePts.push(mid);
      curvePts.push(p1.clone());
    }
  } else {
    for (const wp of waypoints) {
      curvePts.push(wp.clone());
    }
  }

  const curve = new THREE.CatmullRomCurve3(curvePts);
  const cordMat = new THREE.MeshStandardMaterial({
    color: options.cordColor ?? 0x163022,
    roughness: 0.65,
    metalness: 0.2,
  });
  const socketMat = new THREE.MeshStandardMaterial({
    color: 0xd4a638,
    roughness: 0.35,
    metalness: 0.72,
  });

  const cordSegments = Math.max(24, bulbCount * 2);
  const cordMesh = new THREE.Mesh(
    new THREE.TubeGeometry(curve, cordSegments, cordRadiusM, 6, false),
    cordMat
  );
  strandGroup.add(cordMesh);

  const bulbGeo = new THREE.SphereGeometry(bulbRadiusM, 10, 8);
  const socketGeo = new THREE.CylinderGeometry(
    bulbRadiusM * 0.42,
    bulbRadiusM * 0.5,
    bulbRadiusM * 0.72,
    6
  );

  const glowTex = getFairyLightGlowSpriteTexture();
  const bulbMatCache = new Map<number, THREE.MeshStandardMaterial>();
  const spriteMatCache = new Map<number, THREE.SpriteMaterial>();

  for (let i = 0; i < bulbCount; i++) {
    const t = bulbCount === 1 ? 0.5 : (i + 0.5) / bulbCount;
    const pt = curve.getPoint(t);
    const col = palette[i % palette.length] ?? 0xff1438;

    let bulbMat = bulbMatCache.get(col);
    if (!bulbMat) {
      // Blend 25% white into the base albedo so the bulb center looks hot and luminous,
      // while keeping the emissive color 100% pure saturated hue
      const coreTint = new THREE.Color(col).lerp(new THREE.Color(0xffffff), 0.28);
      bulbMat = new THREE.MeshStandardMaterial({
        color: coreTint,
        emissive: new THREE.Color(col),
        emissiveIntensity: baseEmissive,
        roughness: 0.1,
        metalness: 0.02,
        toneMapped: false,
      });
      bulbMat.userData.isFairyLightMaterial = true;
      bulbMat.userData.baseEmissiveIntensity = baseEmissive;
      bulbMatCache.set(col, bulbMat);
    }

    let spriteMat = spriteMatCache.get(col);
    if (!spriteMat) {
      spriteMat = new THREE.SpriteMaterial({
        map: glowTex,
        color: col,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      });
      spriteMat.userData.isFairyHaloMaterial = true;
      spriteMat.userData.baseOpacity = 0.85;
      spriteMatCache.set(col, spriteMat);
    }

    const socket = new THREE.Mesh(socketGeo, socketMat);
    socket.position.set(pt.x, pt.y - bulbRadiusM * 0.28, pt.z);
    strandGroup.add(socket);

    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.scale.set(0.86, 1.34, 0.86);
    bulb.position.set(
      pt.x,
      pt.y - bulbRadiusM * 1.1,
      pt.z + bulbRadiusM * 0.18
    );
    bulb.rotation.z = ((i % 3) - 1) * 0.16;
    bulb.userData.isFairyLightBulb = true;
    bulb.userData.baseEmissiveIntensity = baseEmissive;
    strandGroup.add(bulb);

    // Camera-facing additive radial glow & star-twinkle halo
    const haloSprite = new THREE.Sprite(spriteMat);
    haloSprite.position.copy(bulb.position);
    const haloDiameter = bulbRadiusM * 5.8;
    haloSprite.scale.set(haloDiameter, haloDiameter, 1);
    haloSprite.raycast = noopRaycast;
    haloSprite.userData.isFairyLightHalo = true;
    haloSprite.userData.baseOpacity = 0.85;
    strandGroup.add(haloSprite);
  }

  const lightCount =
    options.pointLightCount ?? (options.includePointLight ? 1 : 0);
  if (lightCount > 0) {
    const lightIntensity = (options.pointLightIntensity ?? 0.85) * 1.35;
    const lightDist = options.pointLightDistance ?? 3.2;
    for (let l = 0; l < lightCount; l++) {
      const lt = (l + 0.5) / lightCount;
      const lPt = curve.getPoint(lt);
      const multiColor =
        options.pointLightColor ??
        palette[(l * 2) % palette.length] ??
        0xff1438;
      const ptLight = new THREE.PointLight(
        multiColor,
        lightIntensity,
        lightDist,
        1.7
      );
      ptLight.position.set(lPt.x, lPt.y - bulbRadiusM * 1.2, lPt.z + 0.14);
      ptLight.userData.isFairyPointLight = true;
      ptLight.userData.baseIntensity = lightIntensity;
      strandGroup.add(ptLight);
    }
  }

  return strandGroup;
}


