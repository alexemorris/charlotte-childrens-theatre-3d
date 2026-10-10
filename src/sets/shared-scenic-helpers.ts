import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
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
 * Builds an articulated, expressive 3D theatrical character figure with
 * sculpted boots, trousers, tailored coat/dress, collar, posed arms & hands,
 * facial features (eyes, nose, eyebrows, smile), hair, and costume headgear.
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

  const coatMat = new THREE.MeshStandardMaterial({
    color: coatColorHex,
    roughness: 0.54,
    metalness: 0.06,
  });
  const pantsMat = new THREE.MeshStandardMaterial({
    color: options.pantsColorHex ?? 0x262936,
    roughness: 0.62,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: options.trimColorHex ?? 0xf0ece2,
    roughness: 0.52,
  });
  const skinMat = new THREE.MeshStandardMaterial({
    color: options.skinColorHex ?? 0xeac09e,
    roughness: 0.56,
  });
  const hairMat = new THREE.MeshStandardMaterial({
    color: options.hairColorHex ?? 0x4a2e1b,
    roughness: 0.68,
  });
  const shoeMat = new THREE.MeshStandardMaterial({
    color: 0x1c1a1e,
    roughness: 0.42,
    metalness: 0.12,
  });
  const eyeDarkMat = new THREE.MeshStandardMaterial({
    color: 0x16161c,
    roughness: 0.25,
  });

  const scale = heightM / 1.7;
  const legH = heightM * 0.36;
  const torsoH = heightM * 0.42;
  const headR = heightM * 0.078;

  // Low-profile bevelled blocking stand disc
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18 * scale, 0.20 * scale, 0.024, 18),
    new THREE.MeshStandardMaterial({ color: 0x20242c, roughness: 0.48 })
  );
  base.position.y = 0.012;
  g.add(base);

  // Shoes & Articulated Legs (supports both standing and seated postures)
  const hipSpacing = 0.074 * scale;
  const seatDropY = options.isSeated ? legH * 0.38 : 0;
  for (const side of [-1, 1]) {
    const lx = side * hipSpacing;
    if (options.isSeated) {
      // Seated posture: thighs extend forward (+Z) at hip height, lower legs drop vertically at knees
      const hipY = 0.04 + legH * 0.62;
      const thighLen = legH * 0.48;
      const shinLen = legH * 0.54;
      const kneeZ = thighLen * 0.88;

      const upperLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.052 * scale, 0.045 * scale, thighLen, 10),
        pantsMat
      );
      upperLeg.rotation.x = Math.PI / 2 - 0.12;
      upperLeg.position.set(lx, hipY, kneeZ * 0.5);
      upperLeg.castShadow = true;
      g.add(upperLeg);

      const lowerLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.044 * scale, 0.036 * scale, shinLen, 10),
        pantsMat
      );
      lowerLeg.position.set(lx, 0.048 * scale + shinLen * 0.5, kneeZ);
      lowerLeg.castShadow = true;
      g.add(lowerLeg);

      const shoe = new THREE.Mesh(
        new RoundedBoxGeometry(0.072 * scale, 0.046 * scale, 0.132 * scale, 2, 0.018),
        shoeMat
      );
      shoe.position.set(lx, 0.024 + 0.022 * scale, kneeZ + 0.026 * scale);
      shoe.castShadow = true;
      g.add(shoe);
    } else {
      const shoe = new THREE.Mesh(
        new RoundedBoxGeometry(0.072 * scale, 0.048 * scale, 0.135 * scale, 2, 0.018),
        shoeMat
      );
      shoe.position.set(lx, 0.024 + 0.022 * scale, 0.025 * scale);
      shoe.castShadow = true;
      g.add(shoe);

      const lowerLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.044 * scale, 0.036 * scale, legH * 0.50, 10),
        pantsMat
      );
      lowerLeg.position.set(lx, 0.044 + legH * 0.25, 0);
      lowerLeg.castShadow = true;
      g.add(lowerLeg);

      const upperLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.054 * scale, 0.045 * scale, legH * 0.50, 10),
        pantsMat
      );
      upperLeg.position.set(lx, 0.044 + legH * 0.75, 0);
      upperLeg.castShadow = true;
      g.add(upperLeg);
    }
  }

  // Flared Coat Skirt / Peplum Hem
  const skirtHem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.115 * scale, 0.148 * scale, torsoH * 0.34, 16),
    coatMat
  );
  skirtHem.scale.set(1.0, 1.0, 0.74);
  skirtHem.position.y = 0.04 + legH - seatDropY + torsoH * 0.15;
  skirtHem.castShadow = true;
  g.add(skirtHem);

  // Sculpted Upper Torso & Chest
  const torso = new THREE.Mesh(
    new RoundedBoxGeometry(0.242 * scale, torsoH * 0.74, 0.146 * scale, 3, 0.042 * scale),
    coatMat
  );
  const torsoCenterY = 0.04 + legH - seatDropY + torsoH * 0.56;
  torso.position.y = torsoCenterY;
  torso.castShadow = true;
  g.add(torso);

  // Collar / Lapel V-Trim + 3 Coat Buttons (positioned cleanly on top/front of torso)
  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(0.064 * scale, 0.016 * scale, 8, 16),
    trimMat
  );
  collar.rotation.x = Math.PI / 2 + 0.18;
  collar.position.set(0, torsoCenterY + torsoH * 0.385, 0.008 * scale);
  g.add(collar);

  for (let b = 0; b < 3; b++) {
    const btn = new THREE.Mesh(
      new THREE.SphereGeometry(0.012 * scale, 8, 8),
      trimMat
    );
    btn.position.set(
      0,
      torsoCenterY + (1 - b) * 0.075 * scale,
      0.086 * scale
    );
    g.add(btn);
  }

  if (options.hasApron) {
    const apron = new THREE.Mesh(
      new RoundedBoxGeometry(0.178 * scale, torsoH * 0.80, 0.022 * scale, 2, 0.01),
      trimMat
    );
    apron.position.set(0, torsoCenterY - 0.04 * scale, 0.086 * scale);
    g.add(apron);
  }

  // Articulated Arms, Cuffs & Hands (shoulders placed cleanly outside torso/belly width)
  const shoulderY = torsoCenterY + torsoH * 0.28;
  const shoulderX = 0.158 * scale;
  const armLen = torsoH * 0.68;
  const armPose = options.armPose ?? 'relaxed';

  for (const side of [-1, 1]) {
    const armPivot = new THREE.Group();
    armPivot.position.set(side * shoulderX, shoulderY, 0);

    if (armPose === 'cheering') {
      armPivot.rotation.z = side * 2.62;
      armPivot.rotation.x = -0.24;
    } else if (armPose === 'presenting') {
      armPivot.rotation.z = side * -0.14;
      armPivot.rotation.x = -0.68;
    } else if (armPose === 'playing') {
      armPivot.rotation.z = side * 0.18;
      armPivot.rotation.x = -0.64;
    } else {
      armPivot.rotation.z = side * 0.20;
      armPivot.rotation.x = side > 0 ? -0.18 : -0.06;
    }

    const sleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035 * scale, 0.029 * scale, armLen, 10),
      coatMat
    );
    sleeve.position.y = -armLen / 2;
    sleeve.castShadow = true;
    armPivot.add(sleeve);

    const cuff = new THREE.Mesh(
      new THREE.CylinderGeometry(0.033 * scale, 0.033 * scale, 0.030 * scale, 10),
      trimMat
    );
    cuff.position.y = -armLen + 0.015 * scale;
    armPivot.add(cuff);

    const hand = new THREE.Mesh(
      new THREE.SphereGeometry(0.027 * scale, 10, 10),
      skinMat
    );
    hand.position.set(0, -armLen - 0.022 * scale, 0.008 * scale);
    armPivot.add(hand);

    g.add(armPivot);
  }

  // Optional Electric Guitar strapped cleanly across front of chest
  if (options.hasGuitarHex !== undefined) {
    const guitarGroup = new THREE.Group();
    guitarGroup.position.set(0.01 * scale, torsoCenterY - 0.03 * scale, 0.122 * scale);
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

  // Neck & Expressive Head
  const neckY = torsoCenterY + torsoH * 0.42;
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.034 * scale, 0.038 * scale, 0.055 * scale, 10),
    skinMat
  );
  neck.position.y = neckY;
  g.add(neck);

  const headY = neckY + headR + 0.022 * scale;
  const head = new THREE.Mesh(new THREE.SphereGeometry(headR, 16, 14), skinMat);
  head.scale.set(0.95, 1.05, 0.96);
  head.position.y = headY;
  head.castShadow = true;
  g.add(head);

  // Sculpted Nose, Eyes & Smile
  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(headR * 0.16, headR * 0.32, 8),
    skinMat
  );
  nose.rotation.x = Math.PI / 2 - 0.18;
  nose.position.set(0, headY, headR * 1.02);
  g.add(nose);

  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(headR * 0.11, 8, 8),
      eyeDarkMat
    );
    eye.position.set(side * headR * 0.34, headY + headR * 0.14, headR * 0.92);
    g.add(eye);

    const brow = new THREE.Mesh(
      new THREE.BoxGeometry(headR * 0.24, headR * 0.05, headR * 0.06),
      hairMat
    );
    brow.position.set(side * headR * 0.34, headY + headR * 0.32, headR * 0.92);
    brow.rotation.z = side * -0.14;
    g.add(brow);
  }

  // Sculpted Hair Cap
  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(headR * 1.03, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.58),
    hairMat
  );
  hairCap.position.set(0, headY + headR * 0.06, -headR * 0.04);
  hairCap.rotation.x = -0.18;
  g.add(hairCap);

  // Optional Top Hat / Headwear resting cleanly on top of hairCap
  if (hatHeightM > 0.01) {
    const hatMat = new THREE.MeshStandardMaterial({ color: hatColorHex, roughness: 0.45 });
    const brim = new THREE.Mesh(
      new THREE.CylinderGeometry(headR * 1.58, headR * 1.58, 0.024 * scale, 18),
      hatMat
    );
    brim.position.y = headY + headR * 0.96;
    g.add(brim);

    const crown = new THREE.Mesh(
      new THREE.CylinderGeometry(headR * 1.14, headR * 0.94, hatHeightM, 18),
      hatMat
    );
    crown.position.y = brim.position.y + 0.012 * scale + hatHeightM / 2;
    crown.rotation.z = -0.08;
    g.add(crown);

    const ribbon = new THREE.Mesh(
      new THREE.CylinderGeometry(headR * 0.99, headR * 0.97, Math.min(0.052, hatHeightM * 0.22), 18),
      trimMat
    );
    ribbon.position.y = brim.position.y + 0.032;
    ribbon.rotation.z = -0.08;
    g.add(ribbon);
  }

  // Optional Wonderland Hare / Rabbit Ears
  if (hasRabbitEars) {
    const earOuterMat = new THREE.MeshStandardMaterial({ color: 0xede6dc, roughness: 0.58 });
    const earInnerMat = new THREE.MeshStandardMaterial({ color: 0xf0a8bc, roughness: 0.55 });
    for (const side of [-1, 1]) {
      const earGroup = new THREE.Group();
      earGroup.position.set(side * headR * 0.52, headY + headR * 0.98, 0);
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

      g.add(earGroup);
    }
  }

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
 * pear-shaped furry green body, hunched shoulders, curved long fingers,
 * glowing yellow cat-like eyes, upturned snout, tuft of green hair, and
 * optional tailored red-and-white Santa disguise or stolen gift sack.
 */
export function createGrinchCharacter(
  options: GrinchCharacterOptions = {}
): THREE.Group {
  const heightM = options.heightM ?? 1.82;
  const scale = heightM / 1.82;
  const g = new THREE.Group();
  g.userData.isCharacterBlocking = true;

  const grinchFurMat = new THREE.MeshStandardMaterial({
    color: 0x48b632,
    roughness: 0.64,
    metalness: 0.04,
  });
  const darkGreenMat = new THREE.MeshStandardMaterial({
    color: 0x1e5c16,
    roughness: 0.68,
  });
  const santaRedMat = new THREE.MeshStandardMaterial({
    color: 0xc81e2e,
    roughness: 0.52,
  });
  const whiteFurMat = new THREE.MeshStandardMaterial({
    color: 0xd4d8de,
    roughness: 0.68,
  });
  const yellowEyeMat = new THREE.MeshStandardMaterial({
    color: 0xf4df38,
    emissive: 0xd8b818,
    emissiveIntensity: 0.35,
    roughness: 0.25,
  });
  const pupilMat = new THREE.MeshStandardMaterial({
    color: 0xb8141e,
    roughness: 0.2,
  });

  // Base stand disc
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.20 * scale, 0.22 * scale, 0.024, 18),
    new THREE.MeshStandardMaterial({ color: 0x1e222a, roughness: 0.5 })
  );
  base.position.y = 0.012;
  g.add(base);

  // Curled Seussian Grinch Shoes & Furry Legs
  for (const side of [-1, 1]) {
    const lx = side * 0.088 * scale;
    const shoe = new THREE.Mesh(
      new RoundedBoxGeometry(0.075 * scale, 0.052 * scale, 0.165 * scale, 2, 0.02),
      options.santaDisguise ? santaRedMat : darkGreenMat
    );
    shoe.position.set(lx, 0.036 * scale, 0.035 * scale);
    g.add(shoe);

    // Curled toe tip
    const toeTip = new THREE.Mesh(
      new THREE.SphereGeometry(0.032 * scale, 10, 10),
      options.santaDisguise ? santaRedMat : darkGreenMat
    );
    toeTip.position.set(lx, 0.068 * scale, 0.12 * scale);
    g.add(toeTip);

    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.048 * scale, 0.038 * scale, 0.58 * scale, 10),
      grinchFurMat
    );
    leg.position.set(lx, 0.33 * scale, 0);
    leg.rotation.z = side * -0.05;
    leg.castShadow = true;
    g.add(leg);
  }

  // Pear-Shaped Pot-Bellied Grinch Torso
  const belly = new THREE.Mesh(
    new THREE.SphereGeometry(0.21 * scale, 16, 14),
    options.santaDisguise ? santaRedMat : grinchFurMat
  );
  belly.scale.set(0.96, 1.18, 0.88);
  belly.position.set(0, 0.78 * scale, 0.03 * scale);
  belly.castShadow = true;
  g.add(belly);

  const chest = new THREE.Mesh(
    new THREE.CylinderGeometry(0.145 * scale, 0.195 * scale, 0.44 * scale, 14),
    options.santaDisguise ? santaRedMat : grinchFurMat
  );
  chest.scale.set(1.0, 1.0, 0.78);
  chest.position.set(0, 1.08 * scale, -0.01 * scale);
  chest.rotation.x = 0.12;
  chest.castShadow = true;
  g.add(chest);

  if (options.santaDisguise) {
    // White fur coat hem, vertical front placket, collar & black belt
    const furHem = new THREE.Mesh(
      new THREE.TorusGeometry(0.198 * scale, 0.036 * scale, 10, 20),
      whiteFurMat
    );
    furHem.rotation.x = Math.PI / 2;
    furHem.scale.set(1.0, 0.88, 1.0);
    furHem.position.set(0, 0.60 * scale, 0.025 * scale);
    g.add(furHem);

    const belt = new THREE.Mesh(
      new THREE.TorusGeometry(0.206 * scale, 0.024 * scale, 8, 20),
      new THREE.MeshStandardMaterial({ color: 0x18181e, roughness: 0.4 })
    );
    belt.rotation.x = Math.PI / 2;
    belt.scale.set(1.0, 0.88, 1.0);
    belt.position.set(0, 0.82 * scale, 0.03 * scale);
    g.add(belt);

    const buckle = new THREE.Mesh(
      new THREE.BoxGeometry(0.065 * scale, 0.058 * scale, 0.022 * scale),
      new THREE.MeshStandardMaterial({ color: 0xf0c438, roughness: 0.3, metalness: 0.7 })
    );
    buckle.position.set(0, 0.82 * scale, 0.222 * scale);
    g.add(buckle);

    const furCollar = new THREE.Mesh(
      new THREE.TorusGeometry(0.138 * scale, 0.034 * scale, 10, 18),
      whiteFurMat
    );
    furCollar.rotation.x = Math.PI / 2 + 0.18;
    furCollar.position.set(0, 1.30 * scale, 0.01 * scale);
    g.add(furCollar);
  }

  // Long Lanky Grinch Arms & Curved Green Fingers (placed cleanly outside chest radius)
  for (const side of [-1, 1]) {
    const armGroup = new THREE.Group();
    armGroup.position.set(side * 0.215 * scale, 1.24 * scale, 0);
    if (options.spyglassPose && side === 1) {
      armGroup.rotation.x = -0.92;
      armGroup.rotation.z = -0.18;
    } else if (options.carvingKnife && side === 1) {
      armGroup.rotation.x = -1.18;
      armGroup.rotation.z = 0.24;
    } else if (options.holdingSack && side === -1) {
      armGroup.rotation.x = 0.42;
      armGroup.rotation.z = -0.32;
    } else {
      armGroup.rotation.z = side * 0.24;
      armGroup.rotation.x = -0.32;
    }

    const sleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.040 * scale, 0.033 * scale, 0.46 * scale, 10),
      options.santaDisguise ? santaRedMat : grinchFurMat
    );
    sleeve.position.y = -0.23 * scale;
    armGroup.add(sleeve);

    if (options.santaDisguise) {
      const cuff = new THREE.Mesh(
        new THREE.TorusGeometry(0.037 * scale, 0.017 * scale, 8, 12),
        whiteFurMat
      );
      cuff.rotation.x = Math.PI / 2;
      cuff.position.y = -0.45 * scale;
      armGroup.add(cuff);
    }

    const hand = new THREE.Mesh(
      new THREE.SphereGeometry(0.035 * scale, 10, 10),
      grinchFurMat
    );
    hand.scale.set(0.85, 1.32, 0.75);
    hand.position.set(0, -0.50 * scale, 0.02 * scale);
    armGroup.add(hand);

    if (options.carvingKnife && side === 1) {
      const knifeHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012 * scale, 0.014 * scale, 0.09 * scale, 8),
        new THREE.MeshStandardMaterial({ color: 0x4e2e1a, roughness: 0.55 })
      );
      knifeHandle.rotation.x = Math.PI / 2;
      knifeHandle.position.set(0, -0.51 * scale, 0.05 * scale);
      armGroup.add(knifeHandle);

      const knifeBlade = new THREE.Mesh(
        new THREE.BoxGeometry(0.010 * scale, 0.032 * scale, 0.22 * scale),
        new THREE.MeshStandardMaterial({ color: 0xd8e0ec, roughness: 0.22, metalness: 0.85 })
      );
      knifeBlade.position.set(0, -0.51 * scale, 0.19 * scale);
      armGroup.add(knifeBlade);
    }

    g.add(armGroup);
  }

  // Sculpted Pear-Shaped Grinch Head, Cheek Jowls, Yellow Eyes & Furry Brow
  const headY = 1.48 * scale;
  const headGroup = new THREE.Group();
  headGroup.position.set(0, headY, 0.02 * scale);

  const cranium = new THREE.Mesh(
    new THREE.SphereGeometry(0.125 * scale, 16, 14),
    grinchFurMat
  );
  cranium.scale.set(0.92, 1.14, 0.95);
  headGroup.add(cranium);

  const jowls = new THREE.Mesh(
    new THREE.SphereGeometry(0.138 * scale, 16, 12),
    grinchFurMat
  );
  jowls.scale.set(1.18, 0.68, 0.96);
  jowls.position.set(0, -0.045 * scale, 0.025 * scale);
  headGroup.add(jowls);

  const snout = new THREE.Mesh(
    new THREE.ConeGeometry(0.028 * scale, 0.055 * scale, 8),
    darkGreenMat
  );
  snout.rotation.x = Math.PI / 2 - 0.25;
  snout.position.set(0, -0.01 * scale, 0.135 * scale);
  headGroup.add(snout);

  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.024 * scale, 10, 10),
      yellowEyeMat
    );
    eye.scale.set(1.15, 0.85, 0.65);
    eye.position.set(side * 0.048 * scale, 0.028 * scale, 0.112 * scale);
    headGroup.add(eye);

    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.011 * scale, 8, 8),
      pupilMat
    );
    pupil.position.set(side * 0.048 * scale, 0.028 * scale, 0.126 * scale);
    headGroup.add(pupil);

    const brow = new THREE.Mesh(
      new THREE.BoxGeometry(0.052 * scale, 0.016 * scale, 0.022 * scale),
      darkGreenMat
    );
    brow.position.set(side * 0.050 * scale, 0.062 * scale, 0.118 * scale);
    brow.rotation.z = side * 0.34;
    headGroup.add(brow);
  }

  if (options.santaDisguise) {
    const hatCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.128 * scale, 0.28 * scale, 14),
      santaRedMat
    );
    hatCone.position.set(-0.02 * scale, 0.22 * scale, -0.01 * scale);
    hatCone.rotation.z = 0.28;
    headGroup.add(hatCone);

    const hatBrim = new THREE.Mesh(
      new THREE.TorusGeometry(0.122 * scale, 0.028 * scale, 10, 18),
      whiteFurMat
    );
    hatBrim.rotation.x = Math.PI / 2 - 0.12;
    hatBrim.position.set(0, 0.105 * scale, 0);
    headGroup.add(hatBrim);

    const pom = new THREE.Mesh(
      new THREE.SphereGeometry(0.036 * scale, 10, 10),
      whiteFurMat
    );
    pom.position.set(-0.08 * scale, 0.34 * scale, -0.01 * scale);
    headGroup.add(pom);
  } else {
    // Wild Grinch Hair Tuft
    const tuft = new THREE.Mesh(
      new THREE.ConeGeometry(0.045 * scale, 0.14 * scale, 8),
      grinchFurMat
    );
    tuft.position.set(0, 0.18 * scale, 0);
    tuft.rotation.z = -0.22;
    headGroup.add(tuft);
  }

  g.add(headGroup);

  if (options.holdingSack) {
    // Slung cleanly beside/behind left hip at x = -0.36 * scale, z = -0.18 * scale (zero torso or mantel overlap)
    const sack = new THREE.Mesh(
      new THREE.SphereGeometry(0.175 * scale, 14, 12),
      santaRedMat
    );
    sack.scale.set(0.95, 1.18, 0.88);
    sack.position.set(-0.36 * scale, 0.82 * scale, -0.18 * scale);
    sack.castShadow = true;
    g.add(sack);
  }

  return g;
}

/**
 * Builds an expressive 3D model of Max the Dog with floppy brown ears,
 * wagging tail, red collar, and optional oversized single reindeer antler.
 */
export function createMaxDogCharacter(
  options: { readonly withAntler?: boolean; readonly sitting?: boolean } = {}
): THREE.Group {
  const g = new THREE.Group();
  g.userData.isCharacterBlocking = true;

  const coatMat = new THREE.MeshStandardMaterial({
    color: 0xc48244,
    roughness: 0.62,
  });
  const earMat = new THREE.MeshStandardMaterial({
    color: 0x683c1e,
    roughness: 0.68,
  });
  const chestMat = new THREE.MeshStandardMaterial({
    color: 0xdfc298,
    roughness: 0.65,
  });
  const redMat = new THREE.MeshStandardMaterial({
    color: 0xd42232,
    roughness: 0.45,
  });
  const antlerMat = new THREE.MeshStandardMaterial({
    color: 0xd8c49e,
    roughness: 0.55,
  });

  // Base disc
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.18, 0.02, 16),
    new THREE.MeshStandardMaterial({ color: 0x20242c, roughness: 0.5 })
  );
  base.position.y = 0.01;
  g.add(base);

  // Body & Chest
  const body = new THREE.Mesh(
    new RoundedBoxGeometry(0.19, 0.22, 0.36, 3, 0.06),
    coatMat
  );
  body.position.set(0, options.sitting ? 0.24 : 0.26, -0.02);
  body.rotation.x = options.sitting ? -0.42 : 0;
  body.castShadow = true;
  g.add(body);

  const chest = new THREE.Mesh(
    new THREE.SphereGeometry(0.105, 12, 10),
    chestMat
  );
  chest.position.set(0, 0.28, 0.12);
  g.add(chest);

  // 4 Legs & Paws
  for (const lx of [-0.065, 0.065]) {
    for (const lz of [-0.12, 0.11]) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.028, 0.024, 0.18, 8),
        coatMat
      );
      leg.position.set(lx, 0.10, lz);
      g.add(leg);
    }
  }

  // Red Collar
  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(0.088, 0.018, 8, 16),
    redMat
  );
  collar.rotation.x = Math.PI / 2 - 0.35;
  collar.position.set(0, 0.36, 0.12);
  g.add(collar);

  // Head, Snout, Nose & Floppy Ears
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.105, 14, 12), coatMat);
  head.position.set(0, 0.45, 0.14);
  head.castShadow = true;
  g.add(head);

  const snout = new THREE.Mesh(
    new RoundedBoxGeometry(0.082, 0.068, 0.11, 2, 0.025),
    chestMat
  );
  snout.position.set(0, 0.43, 0.22);
  g.add(snout);

  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(0.022, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0x161418, roughness: 0.25 })
  );
  nose.position.set(0, 0.45, 0.275);
  g.add(nose);

  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(
      new RoundedBoxGeometry(0.042, 0.18, 0.068, 2, 0.018),
      earMat
    );
    ear.position.set(side * 0.105, 0.39, 0.13);
    ear.rotation.z = side * 0.18;
    g.add(ear);
  }

  // Wagging Tail
  const tail = new THREE.Mesh(
    new THREE.ConeGeometry(0.024, 0.18, 8),
    coatMat
  );
  tail.position.set(0, 0.34, -0.22);
  tail.rotation.x = -0.68;
  g.add(tail);

  // Single Crooked Reindeer Antler with Red Ribbon Bow
  if (options.withAntler) {
    const ribbon = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), redMat);
    ribbon.position.set(0, 0.55, 0.14);
    g.add(ribbon);

    const mainBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.018, 0.28, 8),
      antlerMat
    );
    mainBeam.position.set(0.02, 0.68, 0.14);
    mainBeam.rotation.z = -0.18;
    g.add(mainBeam);

    for (const [ty, tz, rotZ] of [
      [0.64, 0.16, 0.65],
      [0.72, 0.14, -0.58],
      [0.78, 0.15, 0.48],
    ] as const) {
      const tine = new THREE.Mesh(
        new THREE.ConeGeometry(0.012, 0.11, 8),
        antlerMat
      );
      tine.position.set(rotZ > 0 ? -0.02 : 0.06, ty, tz);
      tine.rotation.z = rotZ;
      g.add(tine);
    }
  }

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
 * Builds a plump, whimsical Seussian Who character with a rounded belly coat,
 * fur collar/cuffs, upturned Who nose, beehive/looped hairdo, and winter boots.
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
  // Add signature round Seussian Who belly coat puff (cleanly inside arm clearance)
  const bellyPuff = new THREE.Mesh(
    new THREE.SphereGeometry(0.145 * scale, 14, 12),
    new THREE.MeshStandardMaterial({ color: options.coatColorHex, roughness: 0.54 })
  );
  bellyPuff.scale.set(1.0, 0.92, 0.86);
  bellyPuff.position.set(0, options.heightM * 0.48, 0.015 * scale);
  g.add(bellyPuff);

  if (options.hasBraids) {
    const hairMat = new THREE.MeshStandardMaterial({
      color: options.hairColorHex ?? 0xf0c248,
      roughness: 0.6,
    });
    for (const side of [-1, 1]) {
      const loopBraid = new THREE.Mesh(
        new THREE.TorusGeometry(0.052 * scale, 0.015 * scale, 8, 14),
        hairMat
      );
      loopBraid.position.set(side * 0.155 * scale, options.heightM * 0.88, 0);
      g.add(loopBraid);
    }
  }

  if (options.holdingGift) {
    // Held cleanly in front of bellyPuff (z = 0.22 * scale, depth = 0.14 * scale -> back face at 0.15 * scale)
    const gift = new THREE.Mesh(
      new RoundedBoxGeometry(0.15 * scale, 0.13 * scale, 0.14 * scale, 2, 0.02),
      new THREE.MeshStandardMaterial({ color: 0xe62e48, roughness: 0.45 })
    );
    gift.position.set(0, options.heightM * 0.55, 0.22 * scale);
    g.add(gift);

    const ribbonBow = new THREE.Mesh(
      new THREE.SphereGeometry(0.026 * scale, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xf4c838, roughness: 0.35, metalness: 0.3 })
    );
    ribbonBow.position.set(0, options.heightM * 0.55 + 0.075 * scale, 0.22 * scale);
    g.add(ribbonBow);
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


