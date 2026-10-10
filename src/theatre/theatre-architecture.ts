import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {
  createAcousticWoodWallTexture,
  createMarleyStageDeckTexture,
  createProsceniumCheckerTexture,
  createQuiltedDiamondTexture,
  createSeatTapestryTexture,
  createVelourCurtainTexture,
} from '../engine/procedural-textures.ts';
import type { SeatRecord, SightlineGrade } from '../types/theatre.ts';
import {
  LOWER_BALCONY_LIP_Z_M,
  LOWER_BALCONY_SOFFIT_Y_M,
  PROSCENIUM_HEIGHT_M,
  PROSCENIUM_WIDTH_M,
  UPPER_BALCONY_LIP_Z_M,
  UPPER_BALCONY_SOFFIT_Y_M,
} from './seating-layout.ts';

export interface TheatreArchitectureHandles {
  readonly root: THREE.Group;
  readonly stageFloorMesh: THREE.Mesh;
  readonly marleyGridTexture: THREE.CanvasTexture;
  readonly marleyPlainTexture: THREE.CanvasTexture;
  readonly grandDrapeGroup: THREE.Group;
  readonly orchestraPitGroup: THREE.Group;
  readonly apronCoverMesh: THREE.Mesh;
  readonly trapDoorMeshes: ReadonlyArray<THREE.Mesh>;
  readonly balconyOverhangGuidesGroup: THREE.Group;
  readonly seatCushionInstanced: THREE.InstancedMesh;
  readonly seatBackInstanced: THREE.InstancedMesh;
  readonly seatFrameInstanced: THREE.InstancedMesh;
  readonly seatSelectionRing: THREE.Mesh;
  readonly seatHoverRing: THREE.Mesh;
  readonly fohLensMeshes: ReadonlyArray<THREE.Mesh>;
  updateSeatHighlight(
    selectedSeatIndex: number | null,
    hoveredSeatIndex: number | null,
    heatmapGrades: ReadonlyArray<SightlineGrade> | null
  ): void;
  setOrchestraPitOpen(open: boolean): void;
  setStageTrapsOpen(open: boolean): void;
  setGrandDrapeTrim(openFraction: number): void;
}

const BASE_SEAT_TINT = new THREE.Color(0xffffff);
const SELECTED_SEAT_TINT = new THREE.Color(0x48e5ff);
const HOVER_SEAT_TINT = new THREE.Color(0xffd25a);
const HEATMAP_OPTIMAL = new THREE.Color(0x3ad486);
const HEATMAP_GOOD = new THREE.Color(0xa6db58);
const HEATMAP_OVERHANG = new THREE.Color(0xf59e3d);
const HEATMAP_SIDE = new THREE.Color(0xe85656);

export function buildMcCollTheatreArchitecture(
  seats: ReadonlyArray<SeatRecord>
): TheatreArchitectureHandles {
  const root = new THREE.Group();
  root.name = 'McCollFamilyTheatre_Architecture';

  const woodWallTex = createAcousticWoodWallTexture();
  const checkerTex = createProsceniumCheckerTexture();
  const quiltedTex = createQuiltedDiamondTexture();
  const seatTapestryTex = createSeatTapestryTexture();
  const marleyPlainTexture = createMarleyStageDeckTexture(false);
  const marleyGridTexture = createMarleyStageDeckTexture(true);
  const redVelourTex = createVelourCurtainTexture([148, 22, 32], 18);

  const matteBlackMat = new THREE.MeshStandardMaterial({
    color: 0x15171c,
    roughness: 0.88,
    metalness: 0.08,
  });

  const darkSteelMat = new THREE.MeshStandardMaterial({
    color: 0x22262e,
    roughness: 0.42,
    metalness: 0.78,
  });

  const acousticWoodMat = new THREE.MeshStandardMaterial({
    map: woodWallTex,
    roughness: 0.64,
    metalness: 0.05,
  });

  const plumFasciaMat = new THREE.MeshStandardMaterial({
    color: 0x4d2230,
    roughness: 0.72,
    metalness: 0.08,
  });

  const carpetMat = new THREE.MeshStandardMaterial({
    color: 0x281d1b,
    roughness: 0.92,
    metalness: 0.0,
  });

  // ==========================================================================
  // 1. STAGE DECK, CURVED APRON, TRAPPED STAGE, 52-LINESET RAIL & ORCHESTRA PIT
  //    (Calibrated to the 1/4" = 1'-0" McColl Family Theatre CAD Ground Plans)
  // ==========================================================================
  const stageGroup = new THREE.Group();
  stageGroup.name = 'StageHouse';
  root.add(stageGroup);

  const stageFloorMat = new THREE.MeshStandardMaterial({
    map: marleyPlainTexture,
    roughness: 0.68,
    metalness: 0.06,
  });

  // Main upstage deck (extending to Lineset #52 at 34'-10" / -10.62m + Backstage Crossover)
  const stageFloorMesh = new THREE.Mesh(
    new THREE.BoxGeometry(19.6, 0.24, 12.2),
    stageFloorMat
  );
  stageFloorMesh.position.set(0.4, -0.12, -5.8);
  stageFloorMesh.receiveShadow = true;
  stageGroup.add(stageFloorMesh);

  // Stage Left Offstage Prop & Wagon Storage Wing Bay (seen on right of CAD Ground Plan)
  const slWingDeck = new THREE.Mesh(
    new THREE.BoxGeometry(3.8, 0.24, 9.6),
    new THREE.MeshStandardMaterial({ color: 0x1c1e25, roughness: 0.8 })
  );
  slWingDeck.position.set(11.2, -0.12, -5.2);
  slWingDeck.receiveShadow = true;
  stageGroup.add(slWingDeck);

  // Backstage Crossover Corridor behind Cyclorama / Star Drop (#46 at -9.50m)
  const crossoverPartition = new THREE.Mesh(
    new THREE.BoxGeometry(16.4, 5.2, 0.22),
    matteBlackMat
  );
  crossoverPartition.position.set(0, 2.6, -10.85);
  stageGroup.add(crossoverPartition);

  // Upstage Right (USR) Stairway & Gallery Landing (top-left of stage in CAD Ground Plan)
  const usrStairGroup = new THREE.Group();
  usrStairGroup.name = 'USR_StairUnit';
  usrStairGroup.position.set(-7.15, 0, -9.95);
  for (let s = 0; s < 8; s++) {
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.18 * (s + 1), 1.15),
      darkSteelMat
    );
    step.position.set(s * 0.24 - 0.85, (0.18 * (s + 1)) / 2, 0);
    usrStairGroup.add(step);
  }
  stageGroup.add(usrStairGroup);

  // Stage Right 52-Lineset Single-Purchase Counterweight Fly Locking Rail & Arbors
  // (Matches the 52 triangular counterweight arbors along the SR wall on the CAD Ground Plan)
  const lockingRailGroup = new THREE.Group();
  lockingRailGroup.name = 'StageRight52LinesetLockingRail';
  stageGroup.add(lockingRailGroup);

  const lockingRailBeam = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, 1.05, 10.6),
    darkSteelMat
  );
  lockingRailBeam.position.set(-8.65, 0.52, -5.45);
  lockingRailGroup.add(lockingRailBeam);

  const arborSteelMat = new THREE.MeshStandardMaterial({
    color: 0x3b4454,
    roughness: 0.45,
    metalness: 0.72,
  });
  const purchaseRopeMat = new THREE.MeshStandardMaterial({
    color: 0xc2b280,
    roughness: 0.85,
  });

  for (let line = 1; line <= 52; line++) {
    const lineZ = -0.25 - ((line - 1) / 51) * 10.37; // 0'-10" (-0.25m) to 34'-10" (-10.62m)
    // Counterweight arbor carriage & rope lock
    const arbor = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 2.2, 0.08),
      arborSteelMat
    );
    arbor.position.set(-8.76, 3.2 + (line % 3) * 0.85, lineZ);
    lockingRailGroup.add(arbor);

    if (line % 2 === 1) {
      const rope = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 12.6, 6),
        purchaseRopeMat
      );
      rope.position.set(-8.62, 6.4, lineZ);
      lockingRailGroup.add(rope);
    }
  }

  // 7 Overhead Stage Electrics (#3 1st Elec through #41 7th Elec from CAD Schedule)
  const stageElectricZCoords = [-0.76, -0.97, -1.57, -2.79, -4.83, -6.05, -8.48];
  for (const ez of stageElectricZCoords) {
    const elecPipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.032, 14.6, 10),
      darkSteelMat
    );
    elecPipe.rotation.z = Math.PI / 2;
    elecPipe.position.set(0, 7.85, ez);
    stageGroup.add(elecPipe);

    for (let lx = -5.4; lx <= 5.4; lx += 1.8) {
      const fixture = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.09, 0.24, 8),
        matteBlackMat
      );
      fixture.position.set(lx, 7.68, ez);
      fixture.rotation.x = 0.25;
      stageGroup.add(fixture);
    }
  }

  // 3 Modular Stage Trap Doors (Center Stage at z = -2.6m)
  const trapDoorMeshes: THREE.Mesh[] = [];
  const trapMat = new THREE.MeshStandardMaterial({
    color: 0x22252d,
    roughness: 0.62,
    metalness: 0.12,
  });
  for (let t = -1; t <= 1; t++) {
    const trap = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.08, 1.45), trapMat);
    trap.position.set(t * 1.95, 0.01, -2.6);
    trap.castShadow = true;
    trap.receiveShadow = true;
    stageGroup.add(trap);
    trapDoorMeshes.push(trap);
  }

  // Understage Trap Room pit glow & stairs (visible when traps are open)
  const trapRoomWell = new THREE.Mesh(
    new THREE.BoxGeometry(6.2, 2.2, 1.8),
    new THREE.MeshStandardMaterial({
      color: 0x10131a,
      roughness: 0.9,
      side: THREE.BackSide,
    })
  );
  trapRoomWell.position.set(0, -1.15, -2.6);
  stageGroup.add(trapRoomWell);

  // Curved Downstage Apron / Forestage Cover (over the 20-player Orchestra Pit)
  const apronShape = new THREE.Shape();
  apronShape.moveTo(-6.3, 0);
  apronShape.lineTo(6.3, 0);
  apronShape.lineTo(5.6, 1.35);
  apronShape.quadraticCurveTo(0, 2.85, -5.6, 1.35);
  apronShape.closePath();

  const apronGeo = new THREE.ExtrudeGeometry(apronShape, {
    depth: 0.24,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2,
  });
  apronGeo.rotateX(Math.PI / 2);

  const apronCoverMesh = new THREE.Mesh(apronGeo, stageFloorMat);
  apronCoverMesh.position.set(0, 0.0, 0);
  apronCoverMesh.receiveShadow = true;
  stageGroup.add(apronCoverMesh);

  // Cross-Hatched Orchestra Pit Lift Deck Overlay (matches diamond cross-hatch on CAD Ground Plan!)
  const pitHatchGroup = new THREE.Group();
  pitHatchGroup.name = 'OrchestraPitCrossHatchDeck';
  pitHatchGroup.position.set(0, 0.008, 1.25);
  const hatchLineMat = new THREE.MeshBasicMaterial({
    color: 0x2d3340,
    transparent: true,
    opacity: 0.55,
  });
  for (let hx = -3.0; hx <= 3.0; hx += 0.45) {
    const diagA = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.004, 1.65), hatchLineMat);
    diagA.position.set(hx * 0.85, 0, 0);
    diagA.rotation.y = 0.52;
    pitHatchGroup.add(diagA);

    const diagB = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.004, 1.65), hatchLineMat);
    diagB.position.set(hx * 0.85, 0, 0);
    diagB.rotation.y = -0.52;
    pitHatchGroup.add(diagB);
  }
  apronCoverMesh.add(pitHatchGroup);

  // Angled House-Left & House-Right Forestage Vomitory Stairways (from CAD Ground Plan)
  for (const side of [-1, 1]) {
    const vomStairGroup = new THREE.Group();
    vomStairGroup.name = side < 0 ? 'VomitoryStairs_HouseLeft' : 'VomitoryStairs_HouseRight';
    vomStairGroup.position.set(side * 5.85, -0.45, 1.45);
    vomStairGroup.rotation.y = side * -0.46;

    for (let st = 0; st < 7; st++) {
      const tread = new THREE.Mesh(
        new THREE.BoxGeometry(1.45, 0.12, 0.26),
        new THREE.MeshStandardMaterial({ color: 0x252830, roughness: 0.75 })
      );
      tread.position.set(0, 0.36 - st * 0.12, st * 0.25 - 0.75);
      tread.receiveShadow = true;
      vomStairGroup.add(tread);
    }

    // Vomitory Handrails
    for (const rx of [-0.72, 0.72]) {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.65, 1.85),
        darkSteelMat
      );
      rail.position.set(rx, 0.35, -0.05);
      rail.rotation.x = 0.42;
      vomStairGroup.add(rail);
    }
    stageGroup.add(vomStairGroup);
  }

  // Stage Left Forestage Apron "Fireman's Pole" (explicitly labeled on CAD Ground Plan!)
  const firemansPoleGroup = new THREE.Group();
  firemansPoleGroup.name = 'StageLeftApron_FiremansPole';
  firemansPoleGroup.position.set(4.55, 0, 1.12);
  const brassPoleMat = new THREE.MeshStandardMaterial({
    color: 0xd8a848,
    roughness: 0.25,
    metalness: 0.85,
  });
  const firemansPoleMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.042, 0.042, 7.6, 14),
    brassPoleMat
  );
  firemansPoleMesh.position.y = 3.8;
  firemansPoleMesh.castShadow = true;
  firemansPoleGroup.add(firemansPoleMesh);

  const poleBaseCollar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.16, 0.06, 16),
    darkSteelMat
  );
  poleBaseCollar.position.y = 0.03;
  firemansPoleGroup.add(poleBaseCollar);
  stageGroup.add(firemansPoleGroup);

  // Apron Front Fascia Wall & Footlight Trough / Stage Monitors (seen in photo 85e12e12.jpg)
  const apronWall = new THREE.Mesh(
    new THREE.CylinderGeometry(7.2, 7.2, 0.88, 36, 1, false, -Math.PI * 0.34, Math.PI * 0.68),
    matteBlackMat
  );
  apronWall.scale.set(1.0, 1.0, 0.34);
  apronWall.position.set(0, -0.44, 0.05);
  stageGroup.add(apronWall);

  for (const mx of [-1.45, 1.45]) {
    const monitorWedge = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.14, 0.32),
      darkSteelMat
    );
    monitorWedge.position.set(mx, 0.07, 1.85);
    monitorWedge.rotation.y = mx < 0 ? 0.14 : -0.14;
    monitorWedge.rotation.x = -0.25;
    stageGroup.add(monitorWedge);
  }

  // 20-Player Orchestra Pit Interior (visible when setOrchestraPitOpen(true) is active)
  const orchestraPitGroup = new THREE.Group();
  orchestraPitGroup.name = 'OrchestraPit20Player';
  orchestraPitGroup.visible = false;
  stageGroup.add(orchestraPitGroup);

  const pitFloor = new THREE.Mesh(
    new THREE.BoxGeometry(11.2, 0.12, 2.3),
    new THREE.MeshStandardMaterial({ color: 0x161210, roughness: 0.85 })
  );
  pitFloor.position.set(0, -1.65, 1.15);
  orchestraPitGroup.add(pitFloor);

  // Conductor podium + 12 illuminated music stands in the 20-player pit
  const standMat = new THREE.MeshStandardMaterial({
    color: 0x242830,
    roughness: 0.5,
    metalness: 0.6,
  });
  const sheetMusicMat = new THREE.MeshStandardMaterial({
    color: 0xfff6dc,
    emissive: 0xffd28a,
    emissiveIntensity: 0.65,
    roughness: 0.4,
  });
  for (let i = 0; i < 10; i++) {
    const sx = (i - 4.5) * 0.96;
    const sz = 0.75 + (i % 2) * 0.68;
    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.3, 0.03), sheetMusicMat);
    stand.position.set(sx, -0.72, sz);
    stand.rotation.x = -0.45;
    orchestraPitGroup.add(stand);

    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.85, 8), standMat);
    post.position.set(sx, -1.18, sz);
    orchestraPitGroup.add(post);
  }

  // Stage House Back Wall ( behind Crossover at z = -11.85m ) & Side Wing Walls
  const backStageWall = new THREE.Mesh(
    new THREE.BoxGeometry(22.4, 14.5, 0.35),
    matteBlackMat
  );
  backStageWall.position.set(1.2, 6.8, -11.85);
  stageGroup.add(backStageWall);

  // Stage Right Wall (with 52-lineset locking rail)
  const srWingWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 14.5, 12.0),
    matteBlackMat
  );
  srWingWall.position.set(-9.0, 6.8, -5.8);
  stageGroup.add(srWingWall);

  // Stage Left Outer Wing Bay Wall (recessed at x = +13.1m to house offstage wagons per CAD)
  const slOuterWingWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 14.5, 12.0),
    matteBlackMat
  );
  slOuterWingWall.position.set(13.1, 6.8, -5.8);
  stageGroup.add(slOuterWingWall);

  // Overhead Steel Rigging Gridiron (Single-Purchase Fly Tower at y = 13.2m)
  const gridGroup = new THREE.Group();
  gridGroup.position.set(0, 13.2, -5.5);
  stageGroup.add(gridGroup);
  for (let gx = -7.5; gx <= 7.5; gx += 2.5) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 11.4), darkSteelMat);
    beam.position.set(gx, 0, 0);
    gridGroup.add(beam);
  }

  // ==========================================================================
  // 2. PROSCENIUM ARCH & ICONIC GEOMETRIC SCULPTURAL FRIEZE (Photo da3a8cf7.jpg)
  // ==========================================================================
  const prosceniumGroup = new THREE.Group();
  prosceniumGroup.name = 'ProsceniumAndSculpturalFrieze';
  root.add(prosceniumGroup);

  const halfProscW = PROSCENIUM_WIDTH_M / 2; // 6.3m
  const proscH = PROSCENIUM_HEIGHT_M; // 7.2m

  // Left & Right Proscenium Piers
  for (const side of [-1, 1]) {
    const pier = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 12.2, 0.65),
      matteBlackMat
    );
    pier.position.set(side * (halfProscW + 1.3), 5.8, 0.0);
    pier.castShadow = true;
    pier.receiveShadow = true;
    prosceniumGroup.add(pier);
  }

  // Upper Proscenium Header Wall
  const proscHeader = new THREE.Mesh(
    new THREE.BoxGeometry(17.8, 4.8, 0.65),
    matteBlackMat
  );
  proscHeader.position.set(0, proscH + 2.4, 0.0);
  prosceniumGroup.add(proscHeader);

  // Iconic Postmodern Geometric Relief Sculpture across Proscenium Header (from photo da3a8cf7.jpg)
  const friezeGroup = new THREE.Group();
  friezeGroup.position.set(0, proscH + 0.35, 0.38);
  prosceniumGroup.add(friezeGroup);

  // 2a. Left Black-and-White Checkerboard Fan/Diamond Relief
  const checkerMat = new THREE.MeshStandardMaterial({
    map: checkerTex,
    roughness: 0.45,
    metalness: 0.08,
  });
  const checkerTop = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.45, 0.22), checkerMat);
  checkerTop.position.set(-5.35, 0.25, 0.12);
  checkerTop.rotation.z = 0.28;
  friezeGroup.add(checkerTop);

  const checkerBottom = new THREE.Mesh(new THREE.BoxGeometry(1.85, 1.35, 0.2), checkerMat);
  checkerBottom.position.set(-5.05, -0.95, 0.08);
  checkerBottom.rotation.z = -0.34;
  friezeGroup.add(checkerBottom);

  // 2b. Center Angled Color-Block Ribbon (Yellow, Crimson, Charcoal, Gold)
  const colorBlocks: ReadonlyArray<{
    readonly x: number;
    readonly y: number;
    readonly w: number;
    readonly h: number;
    readonly rotZ: number;
    readonly color: number;
  }> = [
    { x: -3.55, y: 0.15, w: 1.55, h: 0.88, rotZ: 0.12, color: 0xe6b81e }, // Bright yellow
    { x: -2.15, y: 0.28, w: 1.45, h: 0.92, rotZ: 0.14, color: 0x24262e }, // Charcoal
    { x: -0.85, y: 0.32, w: 1.4, h: 0.95, rotZ: 0.12, color: 0x7c1f28 }, // Deep burgundy/crimson
    { x: 0.45, y: 0.25, w: 1.55, h: 0.85, rotZ: 0.1, color: 0x1c1e24 }, // Black-slate
    { x: 1.65, y: 0.12, w: 1.5, h: 0.65, rotZ: 0.11, color: 0xe8bc22 }, // Yellow bar
    { x: 2.35, y: 0.68, w: 1.75, h: 0.58, rotZ: 0.09, color: 0x8f242e }, // Upper crimson accent
  ];

  for (const blk of colorBlocks) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(blk.w, blk.h, 0.2),
      new THREE.MeshStandardMaterial({ color: blk.color, roughness: 0.48, metalness: 0.08 })
    );
    mesh.position.set(blk.x, blk.y, 0.1);
    mesh.rotation.z = blk.rotZ;
    mesh.castShadow = true;
    friezeGroup.add(mesh);
  }

  // 2c. Right White Quilted Diamond Square & Slate Trapezoid Wings (from photo da3a8cf7.jpg)
  const quiltedSquare = new THREE.Mesh(
    new THREE.BoxGeometry(1.65, 1.55, 0.24),
    new THREE.MeshStandardMaterial({ map: quiltedTex, roughness: 0.5, metalness: 0.06 })
  );
  quiltedSquare.position.set(3.85, 0.38, 0.15);
  quiltedSquare.rotation.z = 0.08;
  friezeGroup.add(quiltedSquare);

  const rightGreyWing = new THREE.Mesh(
    new THREE.BoxGeometry(2.35, 1.38, 0.18),
    new THREE.MeshStandardMaterial({ color: 0x8d8c88, roughness: 0.56 })
  );
  rightGreyWing.position.set(5.65, 0.48, 0.08);
  rightGreyWing.rotation.z = -0.14;
  friezeGroup.add(rightGreyWing);

  // 2d. Right Vertical Proscenium Column Alternating Red & White Blocks
  for (let row = 0; row < 6; row++) {
    const isRed = row % 2 === 0;
    const colBlock = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 1.15, 0.22),
      new THREE.MeshStandardMaterial({
        color: isRed ? 0x9e1f28 : 0xeae6dc,
        roughness: 0.52,
      })
    );
    colBlock.position.set(halfProscW + 0.28, 1.2 + row * 1.18, 0.36);
    prosceniumGroup.add(colBlock);
  }

  // 2e. House-Left Stage Manager / Lighting Box Boom Gallery (visible in photo da3a8cf7.jpg)
  const leftTechBox = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 2.3, 1.6),
    matteBlackMat
  );
  leftTechBox.position.set(-7.65, 4.4, 2.2);
  prosceniumGroup.add(leftTechBox);

  // 2f. FOH #1 Overhead Box Truss & 9 Theatrical Spotlights + Side Box Booms
  //     (Visible across the top & sides of every Grinch Model Box photo!)
  const fohTrussGroup = new THREE.Group();
  fohTrussGroup.name = 'FOH_BoxTrussAndBooms';
  fohTrussGroup.position.set(0, proscH - 0.35, 0.95);
  prosceniumGroup.add(fohTrussGroup);

  for (const ty of [-0.16, 0.16]) {
    for (const tz of [-0.14, 0.14]) {
      const chord = new THREE.Mesh(
        new THREE.CylinderGeometry(0.022, 0.022, 11.8, 8),
        darkSteelMat
      );
      chord.rotation.z = Math.PI / 2;
      chord.position.set(0, ty, tz);
      fohTrussGroup.add(chord);
    }
  }
  for (let rx = -5.5; rx <= 5.5; rx += 0.55) {
    const strut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.014, 0.32, 6),
      darkSteelMat
    );
    strut.position.set(rx, 0, 0.14);
    fohTrussGroup.add(strut);
  }
  // 9 FOH #1 Truss Spotlights hanging below the box truss
  for (let i = -4; i <= 4; i++) {
    const fx = i * 1.18;
    const yoke = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.04), darkSteelMat);
    yoke.position.set(fx, -0.26, 0);
    fohTrussGroup.add(yoke);

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.11, 0.32, 10),
      matteBlackMat
    );
    body.position.set(fx, -0.38, -0.04);
    body.rotation.x = 0.45;
    fohTrussGroup.add(body);
  }

  // House Left & House Right Multi-Tier FOH Box Boom Ladders (seen flanking proscenium in Model Box photos)
  for (const side of [-1, 1]) {
    const boomLadder = new THREE.Group();
    boomLadder.position.set(side * 6.95, 4.5, 1.35);
    boomLadder.rotation.y = side * 0.26;
    for (const vx of [-0.42, 0.42]) {
      const pipe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.024, 0.024, 3.6, 8),
        darkSteelMat
      );
      pipe.position.x = vx;
      boomLadder.add(pipe);
    }
    for (const hy of [-1.2, -0.3, 0.6, 1.4]) {
      const rung = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 0.88, 8),
        darkSteelMat
      );
      rung.rotation.z = Math.PI / 2;
      rung.position.y = hy;
      boomLadder.add(rung);

      const leko = new THREE.Mesh(
        new THREE.CylinderGeometry(0.075, 0.095, 0.34, 10),
        matteBlackMat
      );
      leko.position.set(0, hy + 0.12, -0.1);
      leko.rotation.x = 0.38;
      leko.rotation.z = side * -0.22;
      boomLadder.add(leko);
    }
    prosceniumGroup.add(boomLadder);
  }

  // Grand Valance & Main Crimson Velour Curtain (Flown just behind Proscenium)
  const grandDrapeGroup = new THREE.Group();
  grandDrapeGroup.name = 'GrandDrapeCurtain';
  root.add(grandDrapeGroup);

  const drapeMat = new THREE.MeshStandardMaterial({
    map: redVelourTex,
    roughness: 0.82,
    metalness: 0.04,
  });

  // Top Valance Border
  const valance = new THREE.Mesh(new THREE.BoxGeometry(12.8, 1.35, 0.18), drapeMat);
  valance.position.set(0, PROSCENIUM_HEIGHT_M - 0.5, -0.25);
  grandDrapeGroup.add(valance);

  // Left & Right Draw Curtains
  const leftDrape = new THREE.Mesh(new THREE.BoxGeometry(2.2, 7.2, 0.16), drapeMat);
  leftDrape.position.set(-5.3, 3.6, -0.32);
  leftDrape.name = 'GrandDrapeLeft';
  grandDrapeGroup.add(leftDrape);

  const rightDrape = new THREE.Mesh(new THREE.BoxGeometry(2.2, 7.2, 0.16), drapeMat);
  rightDrape.position.set(5.3, 3.6, -0.32);
  rightDrape.name = 'GrandDrapeRight';
  grandDrapeGroup.add(rightDrape);

  // ==========================================================================
  // 3. AUDITORIUM BOWL: RAKED MAIN FLOOR, AISLE STEPS, BALCONIES & WALLS
  // ==========================================================================
  const houseGroup = new THREE.Group();
  houseGroup.name = 'AuditoriumHouse';
  root.add(houseGroup);

  // 3a. Raked Main Floor Stadium Risers (Rows A–P: Center Block + Angled Side Wings per CAD Ground Plan)
  const wingAngle = 0.31;
  for (let r = 0; r < 15; r++) {
    const rowZ = 3.45 + r * 0.92;
    const rowY = -0.82 + r * 0.175 + r * r * 0.0042;
    const centerCount = r === 0 ? 10 : r < 3 ? 12 : 14;
    const sideCount = r < 2 ? 6 : r === 2 || r === 12 ? 7 : r === 13 ? 6 : r === 14 ? 5 : 8;
    const halfCenterW = (centerCount / 2) * 0.55;

    // Center Orchestra Riser Tier
    const centerRiserSlab = new THREE.Mesh(
      new THREE.BoxGeometry(halfCenterW * 2 + 0.5, 0.36, 0.96),
      carpetMat
    );
    centerRiserSlab.position.set(0, rowY - 0.18, rowZ);
    centerRiserSlab.receiveShadow = true;
    houseGroup.add(centerRiserSlab);

    // Angled Left & Right Wing Riser Tiers + Warm Amber Aisle Step Marker Strips
    const wingSpan = (sideCount + 0.8) * 0.55;
    for (const side of [-1, 1]) {
      const midDist = ((sideCount + 1) * 0.55) / 2;
      const wx = side * (halfCenterW + 1.32 + Math.cos(wingAngle) * midDist);
      const wz = rowZ - Math.sin(wingAngle) * midDist;

      const wingRiserSlab = new THREE.Mesh(
        new THREE.BoxGeometry(wingSpan, 0.36, 0.96),
        carpetMat
      );
      wingRiserSlab.position.set(wx, rowY - 0.18, wz);
      wingRiserSlab.rotation.y = side * -wingAngle;
      wingRiserSlab.receiveShadow = true;
      houseGroup.add(wingRiserSlab);

      const aisleX = side * (halfCenterW + 0.65);
      const stepGlow = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 0.025, 0.05),
        new THREE.MeshBasicMaterial({ color: 0xffb347, toneMapped: false })
      );
      stepGlow.position.set(aisleX, rowY + 0.01, rowZ - 0.44);
      houseGroup.add(stepGlow);
    }
  }

  // Front Orchestra Pit / Row A Floor Apron Walk
  const frontWalkSlab = new THREE.Mesh(
    new THREE.BoxGeometry(18.0, 0.2, 2.6),
    carpetMat
  );
  frontWalkSlab.position.set(0, -0.92, 2.1);
  frontWalkSlab.receiveShadow = true;
  houseGroup.add(frontWalkSlab);

  // 3b. Lower Balcony Tier, Curved Plum Fascia & 14 FOH Balcony Rail Spotlights
  const lowerBalconyGroup = new THREE.Group();
  lowerBalconyGroup.name = 'LowerBalconyStructure';
  houseGroup.add(lowerBalconyGroup);

  const fohLensMeshes: THREE.Mesh[] = [];
  const fohLensMat = new THREE.MeshStandardMaterial({
    color: 0xfff0cc,
    emissive: 0xffcf70,
    emissiveIntensity: 2.2,
    roughness: 0.2,
    toneMapped: false,
  });

  // Center Lower Balcony Deck & Soffit (z = 11.85m to 16.5m)
  for (let r = 0; r < 4; r++) {
    const ry = 3.82 + r * 0.42;
    const rz = 12.35 + r * 0.88;
    const stepDeck = new THREE.Mesh(new THREE.BoxGeometry(16.6, 0.45, 0.95), carpetMat);
    stepDeck.position.set(0, ry - 0.22, rz);
    stepDeck.receiveShadow = true;
    stepDeck.castShadow = true;
    lowerBalconyGroup.add(stepDeck);
  }

  // Lower Balcony Curved Fascia (Center + Left/Right Angled Side Arms)
  const lbCenterFascia = new THREE.Mesh(
    new THREE.BoxGeometry(11.4, 0.72, 0.26),
    plumFasciaMat
  );
  lbCenterFascia.position.set(0, 3.85, LOWER_BALCONY_LIP_Z_M);
  lbCenterFascia.castShadow = true;
  lowerBalconyGroup.add(lbCenterFascia);

  // Brass handrail above Lower Balcony fascia
  const lbCenterRail = new THREE.Mesh(
    new THREE.BoxGeometry(11.4, 0.05, 0.06),
    darkSteelMat
  );
  lbCenterRail.position.set(0, 4.35, LOWER_BALCONY_LIP_Z_M);
  lowerBalconyGroup.add(lbCenterRail);

  for (const side of [-1, 1]) {
    const wingFascia = new THREE.Mesh(
      new THREE.BoxGeometry(5.6, 0.72, 0.26),
      plumFasciaMat
    );
    wingFascia.position.set(side * 7.6, 3.85, 9.65);
    wingFascia.rotation.y = side * -0.68;
    wingFascia.castShadow = true;
    lowerBalconyGroup.add(wingFascia);

    const wingDeck = new THREE.Mesh(
      new THREE.BoxGeometry(5.8, 0.38, 2.8),
      carpetMat
    );
    wingDeck.position.set(side * 8.4, 4.1, 10.1);
    wingDeck.rotation.y = side * -0.68;
    lowerBalconyGroup.add(wingDeck);
  }

  // 14 Front-of-House (FOH) Balcony Rail Spotlights (matching photo 85e12e12.jpg!)
  for (let i = 0; i < 14; i++) {
    const norm = (i - 6.5) / 6.5; // -1 .. +1
    const isWing = Math.abs(norm) > 0.65;
    const lx = norm * 7.8;
    const lz = isWing
      ? LOWER_BALCONY_LIP_Z_M - (Math.abs(norm) - 0.65) * 5.2
      : LOWER_BALCONY_LIP_Z_M - 0.22;

    const fixtureGroup = new THREE.Group();
    fixtureGroup.position.set(lx, 3.78, lz);
    fixtureGroup.lookAt(lx * 0.25, 1.5, -1.5);

    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.13, 0.34, 12),
      darkSteelMat
    );
    barrel.rotation.x = Math.PI / 2;
    fixtureGroup.add(barrel);

    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.095, 12), fohLensMat);
    lens.position.set(0, 0, 0.175);
    fixtureGroup.add(lens);
    fohLensMeshes.push(lens);

    lowerBalconyGroup.add(fixtureGroup);
  }

  // 3c. Upper Balcony Tier & Overhead FOH Lighting Catwalk Bridge (Photo 85e12e12.jpg)
  const upperBalconyGroup = new THREE.Group();
  upperBalconyGroup.name = 'UpperBalconyAndCatwalk';
  houseGroup.add(upperBalconyGroup);

  for (let r = 0; r < 3; r++) {
    const ry = 6.62 + r * 0.44;
    const rz = 14.15 + r * 0.86;
    const stepDeck = new THREE.Mesh(new THREE.BoxGeometry(15.6, 0.42, 0.92), carpetMat);
    stepDeck.position.set(0, ry - 0.2, rz);
    stepDeck.castShadow = true;
    stepDeck.receiveShadow = true;
    upperBalconyGroup.add(stepDeck);
  }

  const ubCenterFascia = new THREE.Mesh(
    new THREE.BoxGeometry(11.0, 0.68, 0.26),
    plumFasciaMat
  );
  ubCenterFascia.position.set(0, 6.65, UPPER_BALCONY_LIP_Z_M);
  upperBalconyGroup.add(ubCenterFascia);

  for (const side of [-1, 1]) {
    const ubWingFascia = new THREE.Mesh(
      new THREE.BoxGeometry(4.6, 0.68, 0.26),
      plumFasciaMat
    );
    ubWingFascia.position.set(side * 7.1, 6.65, 12.1);
    ubWingFascia.rotation.y = side * -0.64;
    upperBalconyGroup.add(ubWingFascia);
  }

  // Overhead FOH Lighting Catwalk Bridge across the top of the house (Photo 85e12e12.jpg)
  const catwalkGroup = new THREE.Group();
  catwalkGroup.position.set(0, 8.95, 7.6);
  houseGroup.add(catwalkGroup);

  const catwalkDeck = new THREE.Mesh(
    new THREE.BoxGeometry(15.2, 0.16, 1.35),
    darkSteelMat
  );
  catwalkGroup.add(catwalkDeck);

  const catwalkRailTop = new THREE.Mesh(
    new THREE.BoxGeometry(15.2, 0.05, 0.05),
    darkSteelMat
  );
  catwalkRailTop.position.set(0, 0.95, -0.62);
  catwalkGroup.add(catwalkRailTop);

  for (let i = -5; i <= 5; i++) {
    const spot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.11, 0.3, 10),
      darkSteelMat
    );
    spot.position.set(i * 1.25, -0.22, -0.58);
    spot.rotation.x = Math.PI * 0.32;
    catwalkGroup.add(spot);

    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.08, 10), fohLensMat);
    lens.position.set(i * 1.25, -0.32, -0.71);
    lens.rotation.x = -Math.PI * 0.18;
    catwalkGroup.add(lens);
    fohLensMeshes.push(lens);
  }

  // 3d. Architectural Wood Acoustic Side & Rear House Walls + Glowing Red EXIT Signs
  for (const side of [-1, 1]) {
    // Splayed front-mid house acoustic wall
    const frontWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 11.2, 9.8),
      acousticWoodMat
    );
    frontWall.position.set(side * 9.65, 4.6, 4.8);
    frontWall.rotation.y = side * 0.22;
    frontWall.receiveShadow = true;
    houseGroup.add(frontWall);

    // Mid-rear house acoustic wall
    const rearSideWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 11.2, 8.6),
      acousticWoodMat
    );
    rearSideWall.position.set(side * 10.65, 4.8, 13.4);
    rearSideWall.receiveShadow = true;
    houseGroup.add(rearSideWall);

    // Glowing Red EXIT Signs above Orchestra & Balcony doors (seen in both photos!)
    for (const [ey, ez] of [
      [2.25, 3.8],
      [6.15, 7.2],
    ] as const) {
      const exitSign = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.24, 0.44),
        new THREE.MeshBasicMaterial({ color: 0xff2a2a, toneMapped: false })
      );
      exitSign.position.set(side * 9.25, ey, ez);
      exitSign.rotation.y = side * 0.22;
      houseGroup.add(exitSign);
    }
  }

  // Rear House Acoustic Wall & Control/Projection Booth Window
  const rearWall = new THREE.Mesh(
    new THREE.BoxGeometry(21.6, 11.6, 0.4),
    acousticWoodMat
  );
  rearWall.position.set(0, 4.9, 17.35);
  rearWall.receiveShadow = true;
  houseGroup.add(rearWall);

  // Rear Projection & Lighting Control Booth Glass Window
  const boothGlass = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 1.15, 0.46),
    new THREE.MeshStandardMaterial({
      color: 0x0b121c,
      roughness: 0.15,
      metalness: 0.85,
    })
  );
  boothGlass.position.set(0, 2.75, 17.32);
  houseGroup.add(boothGlass);

  // Scalloped Upper Rear Acoustic Canopy (visible at top center of photo 85e12e12.jpg)
  const canopyArc = new THREE.Mesh(
    new THREE.CylinderGeometry(3.8, 4.4, 1.65, 24, 1, true, -Math.PI * 0.35, Math.PI * 0.7),
    new THREE.MeshStandardMaterial({
      color: 0x8a5e48,
      roughness: 0.55,
      side: THREE.DoubleSide,
    })
  );
  canopyArc.position.set(0, 8.2, 13.8);
  houseGroup.add(canopyArc);

  // ==========================================================================
  // 4. BALCONY OVERHANG 3D SIGHTLINE GUIDE PLANES (Toggleable Designer Overlay)
  // ==========================================================================
  const balconyOverhangGuidesGroup = new THREE.Group();
  balconyOverhangGuidesGroup.name = 'BalconyOverhangSightlineGuides';
  balconyOverhangGuidesGroup.visible = false;
  root.add(balconyOverhangGuidesGroup);

  const lowerOverhangLineMat = new THREE.MeshBasicMaterial({
    color: 0xf59e3d,
    transparent: true,
    opacity: 0.22,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const lowerOverhangPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(16.5, 4.8),
    lowerOverhangLineMat
  );
  lowerOverhangPlane.rotation.x = Math.PI / 2;
  lowerOverhangPlane.position.set(0, LOWER_BALCONY_SOFFIT_Y_M, LOWER_BALCONY_LIP_Z_M + 2.4);
  balconyOverhangGuidesGroup.add(lowerOverhangPlane);

  const upperOverhangPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(15.5, 3.2),
    new THREE.MeshBasicMaterial({
      color: 0x58b8ff,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  upperOverhangPlane.rotation.x = Math.PI / 2;
  upperOverhangPlane.position.set(0, UPPER_BALCONY_SOFFIT_Y_M, UPPER_BALCONY_LIP_Z_M + 1.6);
  balconyOverhangGuidesGroup.add(upperOverhangPlane);

  // ==========================================================================
  // 5. 570 INSTANCED THEATRE SEATS (Cushion + Backrest + Cast-Iron Frame)
  // ==========================================================================
  const seatCount = seats.length;
  const seatTapestryMat = new THREE.MeshStandardMaterial({
    map: seatTapestryTex,
    roughness: 0.76,
    metalness: 0.04,
  });

  const cushionGeo = new RoundedBoxGeometry(0.44, 0.11, 0.44, 1, 0.03);
  const backGeo = new RoundedBoxGeometry(0.45, 0.54, 0.1, 1, 0.035);
  const frameGeo = new THREE.BoxGeometry(0.5, 0.56, 0.42);

  const seatCushionInstanced = new THREE.InstancedMesh(cushionGeo, seatTapestryMat, seatCount);
  const seatBackInstanced = new THREE.InstancedMesh(backGeo, seatTapestryMat, seatCount);
  const seatFrameInstanced = new THREE.InstancedMesh(frameGeo, darkSteelMat, seatCount);

  seatCushionInstanced.name = 'InstancedSeats_Cushion';
  seatBackInstanced.name = 'InstancedSeats_Backrest';
  seatFrameInstanced.name = 'InstancedSeats_Frame';

  seatCushionInstanced.castShadow = true;
  seatCushionInstanced.receiveShadow = true;
  seatBackInstanced.castShadow = true;
  seatBackInstanced.receiveShadow = true;

  const tempTransformObj = new THREE.Object3D();
  tempTransformObj.rotation.order = 'YXZ';

  for (let i = 0; i < seatCount; i++) {
    const s = seats[i];
    if (!s) continue;

    // 1. Seat Cushion
    tempTransformObj.position.set(s.position.x, s.position.y + 0.42, s.position.z);
    tempTransformObj.rotation.set(0, s.yawRad, 0);
    tempTransformObj.updateMatrix();
    seatCushionInstanced.setMatrixAt(i, tempTransformObj.matrix);
    seatCushionInstanced.setColorAt(i, BASE_SEAT_TINT);

    // 2. Upholstered Backrest (slightly reclined 10 deg along the seat's local axis)
    const backOffsetZ = Math.cos(s.yawRad) * 0.18;
    const backOffsetX = Math.sin(s.yawRad) * 0.18;
    tempTransformObj.position.set(
      s.position.x + backOffsetX,
      s.position.y + 0.68,
      s.position.z + backOffsetZ
    );
    tempTransformObj.rotation.set(-0.16, s.yawRad, 0);
    tempTransformObj.updateMatrix();
    seatBackInstanced.setMatrixAt(i, tempTransformObj.matrix);
    seatBackInstanced.setColorAt(i, BASE_SEAT_TINT);

    // 3. Armrest / Cast-iron standard base
    tempTransformObj.position.set(s.position.x, s.position.y + 0.28, s.position.z);
    tempTransformObj.rotation.set(0, s.yawRad, 0);
    tempTransformObj.updateMatrix();
    seatFrameInstanced.setMatrixAt(i, tempTransformObj.matrix);
  }

  seatCushionInstanced.instanceMatrix.needsUpdate = true;
  seatBackInstanced.instanceMatrix.needsUpdate = true;
  seatFrameInstanced.instanceMatrix.needsUpdate = true;
  if (seatCushionInstanced.instanceColor) seatCushionInstanced.instanceColor.needsUpdate = true;
  if (seatBackInstanced.instanceColor) seatBackInstanced.instanceColor.needsUpdate = true;

  seatCushionInstanced.computeBoundingSphere();
  seatBackInstanced.computeBoundingSphere();
  seatFrameInstanced.computeBoundingSphere();

  root.add(seatFrameInstanced);
  root.add(seatCushionInstanced);
  root.add(seatBackInstanced);

  // Glowing 3D Selection & Hover Rings around active seats
  const ringGeo = new THREE.RingGeometry(0.32, 0.42, 28);
  ringGeo.rotateX(-Math.PI / 2);

  const seatSelectionRing = new THREE.Mesh(
    ringGeo,
    new THREE.MeshBasicMaterial({
      color: 0x38e2ff,
      side: THREE.DoubleSide,
      toneMapped: false,
    })
  );
  seatSelectionRing.visible = false;
  root.add(seatSelectionRing);

  const seatHoverRing = new THREE.Mesh(
    ringGeo,
    new THREE.MeshBasicMaterial({
      color: 0xffd15c,
      side: THREE.DoubleSide,
      toneMapped: false,
    })
  );
  seatHoverRing.visible = false;
  root.add(seatHoverRing);

  return {
    root,
    stageFloorMesh,
    marleyGridTexture,
    marleyPlainTexture,
    grandDrapeGroup,
    orchestraPitGroup,
    apronCoverMesh,
    trapDoorMeshes,
    balconyOverhangGuidesGroup,
    seatCushionInstanced,
    seatBackInstanced,
    seatFrameInstanced,
    seatSelectionRing,
    seatHoverRing,
    fohLensMeshes,

    updateSeatHighlight(selectedSeatIndex, hoveredSeatIndex, heatmapGrades) {
      for (let i = 0; i < seatCount; i++) {
        let col = BASE_SEAT_TINT;
        if (i === selectedSeatIndex) {
          col = SELECTED_SEAT_TINT;
        } else if (i === hoveredSeatIndex) {
          col = HOVER_SEAT_TINT;
        } else if (heatmapGrades && heatmapGrades[i]) {
          const g = heatmapGrades[i];
          col =
            g === 'optimal'
              ? HEATMAP_OPTIMAL
              : g === 'good'
                ? HEATMAP_GOOD
                : g === 'partial-overhang'
                  ? HEATMAP_OVERHANG
                  : HEATMAP_SIDE;
        }
        seatCushionInstanced.setColorAt(i, col);
        seatBackInstanced.setColorAt(i, col);
      }
      if (seatCushionInstanced.instanceColor) {
        seatCushionInstanced.instanceColor.needsUpdate = true;
      }
      if (seatBackInstanced.instanceColor) {
        seatBackInstanced.instanceColor.needsUpdate = true;
      }

      if (selectedSeatIndex !== null && seats[selectedSeatIndex]) {
        const s = seats[selectedSeatIndex];
        seatSelectionRing.position.set(s.position.x, s.position.y + 0.04, s.position.z);
        seatSelectionRing.visible = true;
      } else {
        seatSelectionRing.visible = false;
      }

      if (
        hoveredSeatIndex !== null &&
        hoveredSeatIndex !== selectedSeatIndex &&
        seats[hoveredSeatIndex]
      ) {
        const s = seats[hoveredSeatIndex];
        seatHoverRing.position.set(s.position.x, s.position.y + 0.04, s.position.z);
        seatHoverRing.visible = true;
      } else {
        seatHoverRing.visible = false;
      }
    },

    setOrchestraPitOpen(open: boolean) {
      orchestraPitGroup.visible = open;
      apronCoverMesh.visible = !open;
    },

    setStageTrapsOpen(open: boolean) {
      for (const trap of trapDoorMeshes) {
        trap.position.y = open ? -0.95 : 0.01;
      }
    },

    setGrandDrapeTrim(openFraction: number) {
      const clamped = Math.max(0, Math.min(1, openFraction));
      // Part curtains horizontally & fly valance slightly
      leftDrape.position.x = -3.2 - clamped * 2.5;
      rightDrape.position.x = 3.2 + clamped * 2.5;
    },
  };
}
