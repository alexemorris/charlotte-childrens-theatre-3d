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

  // Shoes & Articulated Legs
  const hipSpacing = 0.074 * scale;
  for (const side of [-1, 1]) {
    const lx = side * hipSpacing;
    const shoe = new THREE.Mesh(
      new RoundedBoxGeometry(0.072 * scale, 0.048 * scale, 0.135 * scale, 2, 0.018),
      shoeMat
    );
    shoe.position.set(lx, 0.024 + 0.022 * scale, 0.025 * scale);
    shoe.castShadow = true;
    g.add(shoe);

    const lowerLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.044 * scale, 0.036 * scale, legH * 0.52, 10),
      pantsMat
    );
    lowerLeg.position.set(lx, 0.04 + legH * 0.26, 0);
    lowerLeg.castShadow = true;
    g.add(lowerLeg);

    const upperLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.054 * scale, 0.045 * scale, legH * 0.52, 10),
      pantsMat
    );
    upperLeg.position.set(lx, 0.04 + legH * 0.74, 0);
    upperLeg.castShadow = true;
    g.add(upperLeg);
  }

  // Flared Coat Skirt / Peplum Hem
  const skirtHem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.115 * scale, 0.152 * scale, torsoH * 0.36, 16),
    coatMat
  );
  skirtHem.scale.set(1.0, 1.0, 0.74);
  skirtHem.position.y = 0.04 + legH + torsoH * 0.14;
  skirtHem.castShadow = true;
  g.add(skirtHem);

  // Sculpted Upper Torso & Chest
  const torso = new THREE.Mesh(
    new RoundedBoxGeometry(0.245 * scale, torsoH * 0.76, 0.148 * scale, 3, 0.045 * scale),
    coatMat
  );
  const torsoCenterY = 0.04 + legH + torsoH * 0.56;
  torso.position.y = torsoCenterY;
  torso.castShadow = true;
  g.add(torso);

  // Collar / Lapel V-Trim + 3 Coat Buttons (offset in +Z so zero coplanar faces)
  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(0.068 * scale, 0.018 * scale, 8, 16),
    trimMat
  );
  collar.rotation.x = Math.PI / 2 + 0.22;
  collar.position.set(0, torsoCenterY + torsoH * 0.34, 0.012 * scale);
  g.add(collar);

  for (let b = 0; b < 3; b++) {
    const btn = new THREE.Mesh(
      new THREE.SphereGeometry(0.012 * scale, 8, 8),
      trimMat
    );
    btn.position.set(
      0,
      torsoCenterY + (1 - b) * 0.075 * scale,
      0.082 * scale
    );
    g.add(btn);
  }

  if (options.hasApron) {
    const apron = new THREE.Mesh(
      new RoundedBoxGeometry(0.18 * scale, torsoH * 0.82, 0.025 * scale, 2, 0.01),
      trimMat
    );
    apron.position.set(0, torsoCenterY - 0.04 * scale, 0.078 * scale);
    g.add(apron);
  }

  // Articulated Arms, Cuffs & Hands
  const shoulderY = torsoCenterY + torsoH * 0.28;
  const shoulderX = 0.148 * scale;
  const armLen = torsoH * 0.72;
  const armPose = options.armPose ?? 'relaxed';

  for (const side of [-1, 1]) {
    const armPivot = new THREE.Group();
    armPivot.position.set(side * shoulderX, shoulderY, 0);

    if (armPose === 'cheering') {
      armPivot.rotation.z = side * 2.35;
      armPivot.rotation.x = 0.35;
    } else if (armPose === 'presenting') {
      armPivot.rotation.z = side * 0.48;
      armPivot.rotation.x = -0.62;
    } else if (armPose === 'playing') {
      armPivot.rotation.z = side * 0.26;
      armPivot.rotation.x = -0.78;
    } else {
      armPivot.rotation.z = side * 0.18;
      armPivot.rotation.x = side > 0 ? -0.22 : -0.08;
    }

    const sleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.036 * scale, 0.030 * scale, armLen, 10),
      coatMat
    );
    sleeve.position.y = -armLen / 2;
    sleeve.castShadow = true;
    armPivot.add(sleeve);

    const cuff = new THREE.Mesh(
      new THREE.CylinderGeometry(0.034 * scale, 0.034 * scale, 0.032 * scale, 10),
      trimMat
    );
    cuff.position.y = -armLen + 0.015 * scale;
    armPivot.add(cuff);

    const hand = new THREE.Mesh(
      new THREE.SphereGeometry(0.028 * scale, 10, 10),
      skinMat
    );
    hand.position.set(0, -armLen - 0.018 * scale, 0.008 * scale);
    armPivot.add(hand);

    g.add(armPivot);
  }

  // Optional Electric Guitar strapped across chest
  if (options.hasGuitarHex !== undefined) {
    const guitarGroup = new THREE.Group();
    guitarGroup.position.set(0.02 * scale, torsoCenterY - 0.04 * scale, 0.105 * scale);
    guitarGroup.rotation.z = -0.38;
    const gBody = new THREE.Mesh(
      new RoundedBoxGeometry(0.22 * scale, 0.16 * scale, 0.032 * scale, 2, 0.02),
      new THREE.MeshStandardMaterial({ color: options.hasGuitarHex, roughness: 0.32, metalness: 0.25 })
    );
    guitarGroup.add(gBody);
    const gNeck = new THREE.Mesh(
      new THREE.BoxGeometry(0.32 * scale, 0.028 * scale, 0.02 * scale),
      new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.55 })
    );
    gNeck.position.set(0.22 * scale, 0.02 * scale, 0.008 * scale);
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

  const headY = neckY + headR + 0.018 * scale;
  const head = new THREE.Mesh(new THREE.SphereGeometry(headR, 16, 14), skinMat);
  head.scale.set(0.95, 1.06, 0.96);
  head.position.y = headY;
  head.castShadow = true;
  g.add(head);

  // Sculpted Nose, Eyes & Smile
  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(headR * 0.16, headR * 0.34, 8),
    skinMat
  );
  nose.rotation.x = Math.PI / 2 - 0.18;
  nose.position.set(0, headY, headR * 0.98);
  g.add(nose);

  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(headR * 0.11, 8, 8),
      eyeDarkMat
    );
    eye.position.set(side * headR * 0.34, headY + headR * 0.14, headR * 0.88);
    g.add(eye);

    const brow = new THREE.Mesh(
      new THREE.BoxGeometry(headR * 0.24, headR * 0.05, headR * 0.06),
      hairMat
    );
    brow.position.set(side * headR * 0.34, headY + headR * 0.32, headR * 0.88);
    brow.rotation.z = side * -0.14;
    g.add(brow);
  }

  // Sculpted Hair Cap
  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(headR * 1.04, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.62),
    hairMat
  );
  hairCap.position.set(0, headY + headR * 0.06, -headR * 0.06);
  hairCap.rotation.x = -0.22;
  g.add(hairCap);

  // Optional Top Hat / Headwear
  if (hatHeightM > 0.01) {
    const hatMat = new THREE.MeshStandardMaterial({ color: hatColorHex, roughness: 0.45 });
    const brim = new THREE.Mesh(
      new THREE.CylinderGeometry(headR * 1.65, headR * 1.65, 0.026 * scale, 18),
      hatMat
    );
    brim.position.y = headY + headR * 0.72;
    g.add(brim);

    const crown = new THREE.Mesh(
      new THREE.CylinderGeometry(headR * 1.18, headR * 0.96, hatHeightM, 18),
      hatMat
    );
    crown.position.y = brim.position.y + hatHeightM / 2;
    crown.rotation.z = -0.1;
    g.add(crown);

    const ribbon = new THREE.Mesh(
      new THREE.CylinderGeometry(headR * 1.02, headR * 1.0, Math.min(0.055, hatHeightM * 0.22), 18),
      trimMat
    );
    ribbon.position.y = brim.position.y + 0.032;
    ribbon.rotation.z = -0.1;
    g.add(ribbon);
  }

  // Optional Wonderland Hare / Rabbit Ears
  if (hasRabbitEars) {
    const earOuterMat = new THREE.MeshStandardMaterial({ color: 0xede6dc, roughness: 0.58 });
    const earInnerMat = new THREE.MeshStandardMaterial({ color: 0xf0a8bc, roughness: 0.55 });
    for (const side of [-1, 1]) {
      const earGroup = new THREE.Group();
      earGroup.position.set(side * headR * 0.48, headY + headR * 0.85, 0);
      earGroup.rotation.z = side * -0.22;
      earGroup.rotation.x = 0.12;

      const outerEar = new THREE.Mesh(
        new RoundedBoxGeometry(0.052 * scale, 0.34 * scale, 0.028 * scale, 2, 0.014),
        earOuterMat
      );
      outerEar.position.y = 0.16 * scale;
      earGroup.add(outerEar);

      const innerEar = new THREE.Mesh(
        new THREE.BoxGeometry(0.028 * scale, 0.26 * scale, 0.016 * scale),
        earInnerMat
      );
      innerEar.position.set(0, 0.16 * scale, 0.014 * scale);
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
      new THREE.TorusGeometry(0.195 * scale, 0.038 * scale, 10, 20),
      whiteFurMat
    );
    furHem.rotation.x = Math.PI / 2;
    furHem.scale.set(1.0, 0.88, 1.0);
    furHem.position.set(0, 0.60 * scale, 0.02 * scale);
    g.add(furHem);

    const belt = new THREE.Mesh(
      new THREE.TorusGeometry(0.198 * scale, 0.024 * scale, 8, 20),
      new THREE.MeshStandardMaterial({ color: 0x18181e, roughness: 0.4 })
    );
    belt.rotation.x = Math.PI / 2;
    belt.scale.set(1.0, 0.88, 1.0);
    belt.position.set(0, 0.82 * scale, 0.025 * scale);
    g.add(belt);

    const buckle = new THREE.Mesh(
      new THREE.BoxGeometry(0.065 * scale, 0.058 * scale, 0.024 * scale),
      new THREE.MeshStandardMaterial({ color: 0xf0c438, roughness: 0.3, metalness: 0.7 })
    );
    buckle.position.set(0, 0.82 * scale, 0.205 * scale);
    g.add(buckle);

    const furCollar = new THREE.Mesh(
      new THREE.TorusGeometry(0.135 * scale, 0.035 * scale, 10, 18),
      whiteFurMat
    );
    furCollar.rotation.x = Math.PI / 2 + 0.18;
    furCollar.position.set(0, 1.29 * scale, 0.01 * scale);
    g.add(furCollar);
  }

  // Long Lanky Grinch Arms & Curved Green Fingers
  for (const side of [-1, 1]) {
    const armGroup = new THREE.Group();
    armGroup.position.set(side * 0.175 * scale, 1.24 * scale, 0);
    if (options.spyglassPose && side === 1) {
      armGroup.rotation.x = -1.15;
      armGroup.rotation.z = -0.25;
    } else if (options.holdingSack && side === -1) {
      armGroup.rotation.x = -0.85;
      armGroup.rotation.z = -0.35;
    } else {
      armGroup.rotation.z = side * 0.24;
      armGroup.rotation.x = -0.36;
    }

    const sleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042 * scale, 0.034 * scale, 0.48 * scale, 10),
      options.santaDisguise ? santaRedMat : grinchFurMat
    );
    sleeve.position.y = -0.24 * scale;
    armGroup.add(sleeve);

    if (options.santaDisguise) {
      const cuff = new THREE.Mesh(
        new THREE.TorusGeometry(0.038 * scale, 0.018 * scale, 8, 12),
        whiteFurMat
      );
      cuff.rotation.x = Math.PI / 2;
      cuff.position.y = -0.46 * scale;
      armGroup.add(cuff);
    }

    const hand = new THREE.Mesh(
      new THREE.SphereGeometry(0.036 * scale, 10, 10),
      grinchFurMat
    );
    hand.scale.set(0.85, 1.35, 0.75);
    hand.position.set(0, -0.52 * scale, 0.02 * scale);
    armGroup.add(hand);

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
    const sack = new THREE.Mesh(
      new THREE.SphereGeometry(0.24 * scale, 14, 12),
      santaRedMat
    );
    sack.scale.set(1.0, 1.22, 0.92);
    sack.position.set(-0.26 * scale, 1.02 * scale, -0.14 * scale);
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
  // Add signature round Seussian Who belly coat puff
  const bellyPuff = new THREE.Mesh(
    new THREE.SphereGeometry(0.155 * scale, 14, 12),
    new THREE.MeshStandardMaterial({ color: options.coatColorHex, roughness: 0.54 })
  );
  bellyPuff.scale.set(1.06, 0.95, 0.92);
  bellyPuff.position.set(0, options.heightM * 0.48, 0.02 * scale);
  g.add(bellyPuff);

  if (options.hasBraids) {
    const hairMat = new THREE.MeshStandardMaterial({
      color: options.hairColorHex ?? 0xf0c248,
      roughness: 0.6,
    });
    for (const side of [-1, 1]) {
      const loopBraid = new THREE.Mesh(
        new THREE.TorusGeometry(0.058 * scale, 0.016 * scale, 8, 14),
        hairMat
      );
      loopBraid.position.set(side * 0.11 * scale, options.heightM * 0.88, 0);
      g.add(loopBraid);
    }
  }

  if (options.holdingGift) {
    const gift = new THREE.Mesh(
      new RoundedBoxGeometry(0.18 * scale, 0.16 * scale, 0.18 * scale, 2, 0.02),
      new THREE.MeshStandardMaterial({ color: 0xe62e48, roughness: 0.45 })
    );
    gift.position.set(0, options.heightM * 0.54, 0.19 * scale);
    g.add(gift);
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

/**
 * Builds an organic, fluted Seussian melting icicle / snow-drip (`LatheGeometry`)
 * hanging downward from `y = 0` to `y = -lengthM`, with a flared root collar,
 * 3 frozen ring bulges along its shaft, a rounded droplet tip, and a gentle
 * Seussian S-curve bend — replacing primitive `ConeGeometry` cones.
 */
export function createSculptedIcicleDrip(
  lengthM: number,
  topRadiusM: number,
  material: THREE.Material,
  curveBendM = 0.035
): THREE.Mesh {
  const steps = 16;
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps; // 0 (top root at y=0) -> 1 (bottom tip at y=-lengthM)
    const y = -t * lengthM;
    // Flared root collar at t=0, 3 organic melt-ring ripples, rounded droplet tip at t=1
    const rootFlare = Math.exp(-t * 7.5) * 0.42;
    const taper = Math.pow(1 - t, 0.72);
    const ripple = 1.0 + 0.14 * Math.sin(t * Math.PI * 5.0);
    const tipRound = t > 0.92 ? Math.sqrt(Math.max(0, 1 - (t - 0.92) / 0.08)) : 1.0;
    const r = Math.max(0.002, topRadiusM * (taper * ripple + rootFlare) * tipRound);
    pts.push(new THREE.Vector2(r, y));
  }

  const geom = new THREE.LatheGeometry(pts, 14);
  const pos = geom.attributes.position;
  if (pos && Math.abs(curveBendM) > 1e-4) {
    for (let i = 0; i < pos.count; i++) {
      const py = pos.getY(i);
      const frac = Math.min(1, Math.max(0, -py / Math.max(0.05, lengthM)));
      const bendX = Math.sin(frac * Math.PI * 1.15) * frac * curveBendM;
      pos.setX(i, pos.getX(i) + bendX);
    }
    pos.needsUpdate = true;
    geom.computeVertexNormals();
  }

  const mesh = new THREE.Mesh(geom, material);
  mesh.castShadow = true;
  return mesh;
}

/**
 * Builds a continuous, sculpted Seussian wavy snow-drip & icicle valance curtain
 * (`ExtrudeGeometry`) spanning `[-widthM/2, +widthM/2]` and hanging from `y = 0`
 * down to `-maxDropM`, with smooth rounded drip fingers, a continuous top snow
 * header bolster, and a stepped blue-ice glaze backing layer (`-0.035m` Z offset).
 */
export function createSeussianIcicleValance(
  widthM: number,
  maxDropM: number,
  fingerCount: number,
  frontMaterial: THREE.Material,
  glazeBackMaterial?: THREE.Material,
  depthM = 0.055,
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
    const tipSkew = ((i % 2 === 0 ? 1 : -1) * stepW * 0.08);

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

  const extrudeGeom = new THREE.ExtrudeGeometry(shape, {
    depth: depthM,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.012,
    bevelSegments: 2,
    curveSegments: 10,
  });
  extrudeGeom.translate(0, 0, -depthM / 2);

  const frontMesh = new THREE.Mesh(extrudeGeom, frontMaterial);
  frontMesh.castShadow = true;
  group.add(frontMesh);

  if (glazeBackMaterial) {
    const backMesh = new THREE.Mesh(extrudeGeom, glazeBackMaterial);
    backMesh.scale.set(1.01, 1.05, 0.65);
    backMesh.position.set(0, -0.018, -0.036);
    group.add(backMesh);
  }

  return group;
}

