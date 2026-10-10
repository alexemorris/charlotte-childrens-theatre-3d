import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { CustomSetPiece } from '../types/theatre.ts';
import { createHumanScaleFigure } from './shared-scenic-helpers.ts';

function BoxOrRounded(w: number, h: number, d: number): THREE.BufferGeometry {
  return new RoundedBoxGeometry(w, h, d, 1, 0.025);
}

export function rebuildCustomSetPiecesGroup(
  customPiecesGroup: THREE.Group,
  pieces: ReadonlyArray<CustomSetPiece>,
  selectedPieceId: string | null
): void {
  while (customPiecesGroup.children.length > 0) {
    const child = customPiecesGroup.children[0];
    if (child) customPiecesGroup.remove(child);
  }

  for (const piece of pieces) {
    if (!piece.visible) continue;
    const wrapper = new THREE.Group();
    wrapper.position.set(piece.x, piece.y, piece.z);
    wrapper.rotation.y = (piece.rotationYDeg * Math.PI) / 180;
    wrapper.scale.setScalar(piece.scale);
    wrapper.userData = { customSetPieceId: piece.id };

    const isSelected = piece.id === selectedPieceId;
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(piece.colorHex),
      emissive: isSelected ? new THREE.Color(0x286688) : new THREE.Color(0x000000),
      emissiveIntensity: isSelected ? 0.45 : 0,
      roughness: 0.58,
      metalness: 0.1,
    });

    if (piece.kind === 'platform-4x8') {
      const mesh = new THREE.Mesh(
        new RoundedBoxGeometry(2.44, 0.6, 1.22, 1, 0.03),
        mat
      );
      mesh.position.y = 0.3;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { customSetPieceId: piece.id };
      wrapper.add(mesh);
    } else if (piece.kind === 'flat-12ft') {
      const mesh = new THREE.Mesh(
        new RoundedBoxGeometry(1.8, 3.66, 0.14, 1, 0.02),
        mat
      );
      mesh.position.y = 1.83;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { customSetPieceId: piece.id };
      wrapper.add(mesh);
    } else if (piece.kind === 'arch-portal') {
      for (const sx of [-1.4, 1.4]) {
        const col = new THREE.Mesh(BoxOrRounded(0.55, 4.2, 0.45), mat);
        col.position.set(sx, 2.1, 0);
        col.castShadow = true;
        col.userData = { customSetPieceId: piece.id };
        wrapper.add(col);
      }
      const header = new THREE.Mesh(BoxOrRounded(3.35, 0.75, 0.48), mat);
      header.position.set(0, 4.1, 0);
      header.castShadow = true;
      header.userData = { customSetPieceId: piece.id };
      wrapper.add(header);
    } else if (piece.kind === 'stairs-3step') {
      for (let s = 0; s < 3; s++) {
        const step = new THREE.Mesh(BoxOrRounded(1.2, 0.2 * (s + 1), 0.35), mat);
        step.position.set(0, 0.1 * (s + 1), -s * 0.35);
        step.castShadow = true;
        step.receiveShadow = true;
        step.userData = { customSetPieceId: piece.id };
        wrapper.add(step);
      }
    } else if (piece.kind === 'periaktos') {
      const prism = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 3.6, 3), mat);
      prism.position.y = 1.8;
      prism.castShadow = true;
      prism.receiveShadow = true;
      prism.userData = { customSetPieceId: piece.id };
      wrapper.add(prism);
    } else if (piece.kind === 'actor-child') {
      const fig = createHumanScaleFigure(
        1.35,
        new THREE.Color(piece.colorHex).getHex()
      );
      fig.traverse((obj) => {
        obj.userData = { customSetPieceId: piece.id };
      });
      wrapper.add(fig);
    } else if (piece.kind === 'actor-adult') {
      const fig = createHumanScaleFigure(
        1.75,
        new THREE.Color(piece.colorHex).getHex()
      );
      fig.traverse((obj) => {
        obj.userData = { customSetPieceId: piece.id };
      });
      wrapper.add(fig);
    } else if (piece.kind === 'prop-table') {
      const top = new THREE.Mesh(BoxOrRounded(1.5, 0.08, 0.85), mat);
      top.position.y = 0.76;
      top.castShadow = true;
      top.userData = { customSetPieceId: piece.id };
      wrapper.add(top);
      for (const [lx, lz] of [
        [-0.65, -0.35],
        [0.65, -0.35],
        [-0.65, 0.35],
        [0.65, 0.35],
      ] as const) {
        const leg = new THREE.Mesh(BoxOrRounded(0.08, 0.74, 0.08), mat);
        leg.position.set(lx, 0.37, lz);
        leg.userData = { customSetPieceId: piece.id };
        wrapper.add(leg);
      }
    }

    if (isSelected) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.85, 0.98, 28),
        new THREE.MeshBasicMaterial({
          color: 0x38e2ff,
          side: THREE.DoubleSide,
          toneMapped: false,
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.02;
      wrapper.add(ring);
    }

    customPiecesGroup.add(wrapper);
  }
}
