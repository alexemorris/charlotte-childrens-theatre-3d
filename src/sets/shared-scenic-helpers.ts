import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { RiggingBattenSpec } from '../types/theatre.ts';

export const DEFAULT_RIGGING_BATTENS: ReadonlyArray<RiggingBattenSpec> = [
  {
    id: 'batten-1',
    lineNumber: 1,
    name: 'Line 1 · Soft Masking Legs & Border #1',
    zPosM: -1.1,
    trimHeightM: 0.0,
    minHeightM: 0.0,
    maxHeightM: 6.8,
    category: 'drape',
  },
  {
    id: 'batten-2',
    lineNumber: 2,
    name: 'Line 2 · Downstage Portal / Flying Track',
    zPosM: -2.4,
    trimHeightM: 0.0,
    minHeightM: 0.0,
    maxHeightM: 6.8,
    category: 'scenic',
  },
  {
    id: 'batten-3',
    lineNumber: 3,
    name: 'Line 3 · Mid-Stage Scenic Backdrop / Barn / Window',
    zPosM: -4.8,
    trimHeightM: 0.0,
    minHeightM: 0.0,
    maxHeightM: 6.8,
    category: 'scenic',
  },
  {
    id: 'batten-4',
    lineNumber: 4,
    name: 'Line 4 · Upstage Scenic Towers / Drop',
    zPosM: -6.8,
    trimHeightM: 0.0,
    minHeightM: 0.0,
    maxHeightM: 6.8,
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
