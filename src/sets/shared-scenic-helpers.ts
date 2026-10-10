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

export function createHumanScaleFigure(
  heightM: number,
  coatColorHex: number,
  hatHeightM = 0,
  hatColorHex = 0xd4a024,
  hasRabbitEars = false
): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: coatColorHex,
    roughness: 0.55,
    metalness: 0.08,
  });
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xeac09e,
    roughness: 0.6,
  });

  const torsoH = heightM * 0.52;
  const legH = heightM * 0.34;
  const headR = heightM * 0.075;

  // Base pedestal disc
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.24, 0.04, 16),
    new THREE.MeshStandardMaterial({ color: 0x22262e, roughness: 0.4 })
  );
  base.position.y = 0.02;
  g.add(base);

  // Legs
  for (const lx of [-0.08, 0.08]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, legH, 10), mat);
    leg.position.set(lx, legH / 2 + 0.04, 0);
    leg.castShadow = true;
    g.add(leg);
  }

  // Torso
  const torso = new THREE.Mesh(
    new RoundedBoxGeometry(heightM * 0.24, torsoH, heightM * 0.14, 1, 0.04),
    mat
  );
  torso.position.y = legH + torsoH / 2 + 0.04;
  torso.castShadow = true;
  g.add(torso);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(headR, 14, 12), skinMat);
  head.position.y = legH + torsoH + headR + 0.06;
  head.castShadow = true;
  g.add(head);

  if (hatHeightM > 0.01) {
    const hatMat = new THREE.MeshStandardMaterial({ color: hatColorHex, roughness: 0.45 });
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.03, 16), hatMat);
    brim.position.y = head.position.y + headR * 0.7;
    g.add(brim);

    const crown = new THREE.Mesh(
      new THREE.CylinderGeometry(0.17, 0.14, hatHeightM, 16),
      hatMat
    );
    crown.position.y = brim.position.y + hatHeightM / 2;
    crown.rotation.z = -0.12;
    g.add(crown);
  }

  if (hasRabbitEars) {
    const earMat = new THREE.MeshStandardMaterial({ color: 0xf2d6dc, roughness: 0.6 });
    for (const ex of [-0.07, 0.07]) {
      const ear = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.34, 0.03), earMat);
      ear.position.set(ex, head.position.y + headR + 0.16, 0);
      ear.rotation.z = ex < 0 ? 0.18 : -0.18;
      g.add(ear);
    }
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
      leg.position.set(side * 6.55, 3.8, zPos);
      leg.rotation.y = side * 0.08;
      leg.castShadow = true;
      maskingGroup.add(leg);
    }
    const border = new THREE.Mesh(new THREE.BoxGeometry(14.6, 1.15, 0.12), blackLegMat);
    border.position.set(0, 7.1, zPos + 0.06);
    maskingGroup.add(border);
  }

  return maskingGroup;
}
