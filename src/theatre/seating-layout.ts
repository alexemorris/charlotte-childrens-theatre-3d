import type {
  AudienceEyeMode,
  ChartZoneId,
  ProductionId,
  SeatLevel,
  SeatRecord,
  SeatSectionId,
  SeatSightlineMetrics,
  SightlineGrade,
} from '../types/theatre.ts';

export const MAIN_FLOOR_ROW_LABELS: readonly string[] = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
];

export const LOWER_BALCONY_ROW_LABELS: readonly string[] = ['AA', 'BB', 'CC', 'DD'];
export const UPPER_BALCONY_ROW_LABELS: readonly string[] = ['UA', 'UB', 'UC'];

// Architectural constants (meters) relative to Stage Center at Plaster Line (0, 0, 0)
export const PROSCENIUM_WIDTH_M = 12.6;
export const PROSCENIUM_HEIGHT_M = 7.2;
export const STAGE_APRON_DEPTH_M = 2.45;
export const STAGE_UPSTAGE_DEPTH_M = 9.6;
export const LOWER_BALCONY_LIP_Z_M = 11.85;
export const LOWER_BALCONY_SOFFIT_Y_M = 3.38;
export const UPPER_BALCONY_LIP_Z_M = 13.75;
export const UPPER_BALCONY_SOFFIT_Y_M = 6.28;

const ADULT_SEATED_EYE_OFFSET_Y = 1.18;
const CHILD_SEATED_EYE_OFFSET_Y = 0.96;

/**
 * Generates the exact 570-seat architectural layout for the Hugh McColl Family Theatre
 * at ImaginOn (Children's Theatre of Charlotte):
 * - 420 Main Floor (Orchestra) seats across Rows A–P (Left Wing, Center-Left, Center-Right, Right Wing)
 * - 150 Balcony seats across Lower Balcony (96 seats, Rows AA–DD) and Upper Balcony (54 seats, Rows UA–UC)
 */
export function buildTheatreSeatingLayout(): ReadonlyArray<SeatRecord> {
  const seats: SeatRecord[] = [];
  let instanceIndex = 0;

  const pushSeat = (params: {
    id: string;
    sectionId: SeatSectionId;
    sectionTitle: string;
    chartZoneId: ChartZoneId;
    level: SeatLevel;
    rowLabel: string;
    rowIndex: number;
    seatNumber: number;
    x: number;
    y: number;
    z: number;
    yawRad: number;
  }): void => {
    const { x, y, z } = params;
    const eyeAdultY = y + ADULT_SEATED_EYE_OFFSET_Y;
    const eyeChildY = y + CHILD_SEATED_EYE_OFFSET_Y;

    const targetZ = -1.8;
    const targetY = 1.25;
    const dx = x;
    const dz = z - targetZ;
    const horizDist = Math.hypot(dx, dz);
    const dist3D = Math.hypot(dx, eyeAdultY - targetY, dz);

    const horizontalAngleDeg = (Math.atan2(Math.abs(dx), dz) * 180) / Math.PI;
    const verticalAngleDeg = (Math.atan2(targetY - eyeAdultY, horizDist) * 180) / Math.PI;

    const sideShift = Math.abs(x) * 0.16;
    const underLowerBalconyOverhang =
      params.level === 'main' && z + sideShift >= LOWER_BALCONY_LIP_Z_M;
    const underUpperBalconyOverhang =
      (params.level === 'main' && z + sideShift >= UPPER_BALCONY_LIP_Z_M) ||
      (params.level === 'lower-balcony' && z + sideShift >= UPPER_BALCONY_LIP_Z_M);

    let maxCeilingAngleDeg = 45.0;
    if (underLowerBalconyOverhang && z > LOWER_BALCONY_LIP_Z_M + 0.15) {
      const dzToLip = z - LOWER_BALCONY_LIP_Z_M;
      const dyToLip = LOWER_BALCONY_SOFFIT_Y_M - eyeAdultY;
      maxCeilingAngleDeg = (Math.atan2(dyToLip, dzToLip) * 180) / Math.PI;
    } else if (
      params.level === 'lower-balcony' &&
      underUpperBalconyOverhang &&
      z > UPPER_BALCONY_LIP_Z_M + 0.15
    ) {
      const dzToLip = z - UPPER_BALCONY_LIP_Z_M;
      const dyToLip = UPPER_BALCONY_SOFFIT_Y_M - eyeAdultY;
      maxCeilingAngleDeg = (Math.atan2(dyToLip, dzToLip) * 180) / Math.PI;
    }

    seats.push({
      id: params.id,
      instanceIndex: instanceIndex++,
      sectionId: params.sectionId,
      sectionTitle: params.sectionTitle,
      chartZoneId: params.chartZoneId,
      level: params.level,
      rowLabel: params.rowLabel,
      rowIndex: params.rowIndex,
      seatNumber: params.seatNumber,
      position: { x, y, z },
      eyePositionAdult: { x, y: eyeAdultY, z },
      eyePositionChild: { x, y: eyeChildY, z },
      yawRad: params.yawRad,
      underLowerBalconyOverhang,
      underUpperBalconyOverhang,
      distanceToStageCenterM: Number(dist3D.toFixed(2)),
      horizontalAngleDeg: Number(horizontalAngleDeg.toFixed(1)),
      verticalAngleDeg: Number(verticalAngleDeg.toFixed(1)),
      maxCeilingAngleDeg: Number(maxCeilingAngleDeg.toFixed(1)),
    });
  };

  // ==========================================================================
  // 1. MAIN FLOOR (ORCHESTRA) — Exactly 420 seats across 15 rows (A–P)
  // ==========================================================================
  const mainRowSpec: ReadonlyArray<{ readonly side: number; readonly center: number }> = [
    { side: 6, center: 10 }, // A: 22
    { side: 6, center: 12 }, // B: 24
    { side: 7, center: 12 }, // C: 26
    { side: 8, center: 14 }, // D: 30
    { side: 8, center: 14 }, // E: 30
    { side: 8, center: 14 }, // F: 30
    { side: 8, center: 14 }, // G: 30
    { side: 8, center: 14 }, // H: 30
    { side: 8, center: 14 }, // J: 30
    { side: 8, center: 14 }, // K: 30
    { side: 8, center: 14 }, // L: 30
    { side: 8, center: 14 }, // M: 30
    { side: 7, center: 14 }, // N: 28
    { side: 6, center: 14 }, // O: 26
    { side: 5, center: 14 }, // P: 24 -> Total = 420 Main Floor seats!
  ];

  const seatSpacing = 0.55;
  for (let r = 0; r < MAIN_FLOOR_ROW_LABELS.length; r++) {
    const rowLabel = MAIN_FLOOR_ROW_LABELS[r] ?? 'A';
    const spec = mainRowSpec[r] ?? { side: 7, center: 12 };
    const rowZ = 3.45 + r * 0.92;
    const rowY = -0.82 + r * 0.175 + r * r * 0.0042;

    const centerCount = spec.center;
    const sideCount = spec.side;
    const halfCenter = centerCount / 2;
    const aisleGap = 1.32;
    const centerHalfWidth = halfCenter * seatSpacing;
    const wingAngle = 0.31;

    // A. House Left Wing (Seats 1 .. sideCount)
    for (let s = 0; s < sideCount; s++) {
      const distFromAisle = (sideCount - s) * seatSpacing;
      const x = -(centerHalfWidth + aisleGap + Math.cos(wingAngle) * distFromAisle);
      const z = rowZ - Math.sin(wingAngle) * distFromAisle;
      const seatNumber = s + 1;
      const yawRad = Math.atan2(-x, z + 2.2);

      pushSeat({
        id: `MF-L-${rowLabel}-${seatNumber}`,
        sectionId: 'main-left-wing',
        sectionTitle: 'Main Floor · Left Wing',
        chartZoneId: 'main-left',
        level: 'main',
        rowLabel,
        rowIndex: r,
        seatNumber,
        x,
        y: rowY,
        z,
        yawRad,
      });
    }

    // B. Center Orchestra Block (Seats 101 .. 100 + centerCount)
    for (let c = 0; c < centerCount; c++) {
      const offsetFromCenter = (c - (centerCount - 1) / 2) * seatSpacing;
      const x = offsetFromCenter;
      const z = rowZ - Math.cos((offsetFromCenter / 5.5) * 0.6) * 0.18 + 0.18;
      const seatNumber = 101 + c;
      const isLeftHalf = x < 0;
      const yawRad = Math.atan2(-x * 0.65, z + 2.5);

      pushSeat({
        id: `MF-C-${rowLabel}-${seatNumber}`,
        sectionId: isLeftHalf ? 'main-center-left' : 'main-center-right',
        sectionTitle: isLeftHalf ? 'Main Floor · Center Left' : 'Main Floor · Center Right',
        chartZoneId: isLeftHalf ? 'main-left' : 'main-right',
        level: 'main',
        rowLabel,
        rowIndex: r,
        seatNumber,
        x,
        y: rowY,
        z,
        yawRad,
      });
    }

    // C. House Right Wing (Seats 201 .. 200 + sideCount)
    for (let s = 0; s < sideCount; s++) {
      const distFromAisle = (s + 1) * seatSpacing;
      const x = centerHalfWidth + aisleGap + Math.cos(wingAngle) * distFromAisle;
      const z = rowZ - Math.sin(wingAngle) * distFromAisle;
      const seatNumber = 201 + s;
      const yawRad = Math.atan2(-x, z + 2.2);

      pushSeat({
        id: `MF-R-${rowLabel}-${seatNumber}`,
        sectionId: 'main-right-wing',
        sectionTitle: 'Main Floor · Right Wing',
        chartZoneId: 'main-right',
        level: 'main',
        rowLabel,
        rowIndex: r,
        seatNumber,
        x,
        y: rowY,
        z,
        yawRad,
      });
    }
  }

  // ==========================================================================
  // 2. LOWER BALCONY — 96 seats across Rows AA, BB, CC, DD
  // ==========================================================================
  const lowerBalconySpec: ReadonlyArray<{ readonly wing: number; readonly center: number }> = [
    { wing: 6, center: 14 }, // AA: 26
    { wing: 6, center: 14 }, // BB: 26
    { wing: 5, center: 12 }, // CC: 22
    { wing: 5, center: 12 }, // DD: 22 -> Total = 96 Lower Balcony seats
  ];

  for (let r = 0; r < LOWER_BALCONY_ROW_LABELS.length; r++) {
    const rowLabel = LOWER_BALCONY_ROW_LABELS[r] ?? 'AA';
    const spec = lowerBalconySpec[r] ?? { wing: 5, center: 12 };
    const rowY = 3.82 + r * 0.42;
    const baseZ = 12.35 + r * 0.88;

    const centerBalconySeats = spec.center;
    for (let c = 0; c < centerBalconySeats; c++) {
      const norm = c - (centerBalconySeats - 1) / 2;
      const aisleShift = norm < 0 ? -0.22 : 0.22;
      const x = norm * 0.58 + aisleShift;
      const z = baseZ - Math.abs(norm) * 0.08;
      const isLeft = x < 0;
      const seatNumber = isLeft ? c + 10 : c + 101;
      const yawRad = Math.atan2(-x * 0.8, z + 1.8);

      pushSeat({
        id: `LB-${isLeft ? 'L' : 'R'}-${rowLabel}-${seatNumber}`,
        sectionId: isLeft ? 'lower-balcony-left' : 'lower-balcony-right',
        sectionTitle: isLeft ? 'Lower Balcony · Left' : 'Lower Balcony · Right',
        chartZoneId: isLeft ? 'lower-balcony-left' : 'lower-balcony-right',
        level: 'lower-balcony',
        rowLabel,
        rowIndex: r,
        seatNumber,
        x,
        y: rowY,
        z,
        yawRad,
      });
    }

    const wingSeats = spec.wing;
    const wingAngle = 0.48;
    for (let s = 0; s < wingSeats; s++) {
      const d = (s + 1) * 0.62;
      const lx = -(5.55 + Math.cos(wingAngle) * d);
      const lz = baseZ - 0.65 - Math.sin(wingAngle) * d * 1.45;
      pushSeat({
        id: `LB-L-${rowLabel}-${wingSeats - s}`,
        sectionId: 'lower-balcony-left',
        sectionTitle: 'Lower Balcony · Left Box Wing',
        chartZoneId: 'lower-balcony-left',
        level: 'lower-balcony',
        rowLabel,
        rowIndex: r,
        seatNumber: wingSeats - s,
        x: lx,
        y: rowY,
        z: lz,
        yawRad: Math.atan2(-lx, lz + 1.2),
      });

      const rx = -lx;
      const rz = lz;
      pushSeat({
        id: `LB-R-${rowLabel}-${201 + s}`,
        sectionId: 'lower-balcony-right',
        sectionTitle: 'Lower Balcony · Right Box Wing',
        chartZoneId: 'lower-balcony-right',
        level: 'lower-balcony',
        rowLabel,
        rowIndex: r,
        seatNumber: 201 + s,
        x: rx,
        y: rowY,
        z: rz,
        yawRad: Math.atan2(-rx, rz + 1.2),
      });
    }
  }

  // ==========================================================================
  // 3. UPPER BALCONY — 54 seats across Rows UA, UB, UC (96 + 54 = 150 Balcony)
  // ==========================================================================
  const upperBalconySpec: ReadonlyArray<{ readonly wing: number; readonly center: number }> = [
    { wing: 4, center: 12 }, // UA: 20
    { wing: 3, center: 12 }, // UB: 18
    { wing: 3, center: 10 }, // UC: 16 -> Total = 54 Upper Balcony seats
  ];

  for (let r = 0; r < UPPER_BALCONY_ROW_LABELS.length; r++) {
    const rowLabel = UPPER_BALCONY_ROW_LABELS[r] ?? 'UA';
    const spec = upperBalconySpec[r] ?? { wing: 3, center: 10 };
    const rowY = 6.62 + r * 0.44;
    const baseZ = 14.15 + r * 0.86;

    const centerUpperSeats = spec.center;
    for (let c = 0; c < centerUpperSeats; c++) {
      const norm = c - (centerUpperSeats - 1) / 2;
      const aisleShift = norm < 0 ? -0.22 : 0.22;
      const x = norm * 0.6 + aisleShift;
      const z = baseZ - Math.abs(norm) * 0.09;
      const isLeft = x < 0;
      const seatNumber = isLeft ? c + 10 : c + 101;

      pushSeat({
        id: `UB-${isLeft ? 'L' : 'R'}-${rowLabel}-${seatNumber}`,
        sectionId: isLeft ? 'upper-balcony-left' : 'upper-balcony-right',
        sectionTitle: isLeft ? 'Upper Balcony · Left' : 'Upper Balcony · Right',
        chartZoneId: isLeft ? 'upper-balcony-left' : 'upper-balcony-right',
        level: 'upper-balcony',
        rowLabel,
        rowIndex: r,
        seatNumber,
        x,
        y: rowY,
        z,
        yawRad: Math.atan2(-x * 0.85, z + 1.6),
      });
    }

    const wingSeats = spec.wing;
    const wingAngle = 0.46;
    for (let s = 0; s < wingSeats; s++) {
      const d = (s + 1) * 0.62;
      const lx = -(5.15 + Math.cos(wingAngle) * d);
      const lz = baseZ - 0.55 - Math.sin(wingAngle) * d * 1.4;
      pushSeat({
        id: `UB-L-${rowLabel}-${wingSeats - s}`,
        sectionId: 'upper-balcony-left',
        sectionTitle: 'Upper Balcony · Left Wing',
        chartZoneId: 'upper-balcony-left',
        level: 'upper-balcony',
        rowLabel,
        rowIndex: r,
        seatNumber: wingSeats - s,
        x: lx,
        y: rowY,
        z: lz,
        yawRad: Math.atan2(-lx, lz + 1.2),
      });

      const rx = -lx;
      const rz = lz;
      pushSeat({
        id: `UB-R-${rowLabel}-${201 + s}`,
        sectionId: 'upper-balcony-right',
        sectionTitle: 'Upper Balcony · Right Wing',
        chartZoneId: 'upper-balcony-right',
        level: 'upper-balcony',
        rowLabel,
        rowIndex: r,
        seatNumber: 201 + s,
        x: rx,
        y: rowY,
        z: rz,
        yawRad: Math.atan2(-rx, rz + 1.2),
      });
    }
  }

  return seats;
}

/**
 * Evaluates full 3D sightline metrics from a specific seat and audience eye mode
 * (Child 0.96m vs Adult 1.18m) against the proscenium arch, balcony overhang soffits,
 * and the active production's scenic envelope.
 */
export function computeSeatSightlineMetrics(
  seat: SeatRecord,
  eyeMode: AudienceEyeMode,
  productionId: ProductionId
): SeatSightlineMetrics {
  const eye = eyeMode === 'child' ? seat.eyePositionChild : seat.eyePositionAdult;
  const notes: string[] = [];

  let downstageVis = 100;
  if (seat.level === 'main' && seat.rowIndex === 0 && eyeMode === 'child') {
    downstageVis = 88;
    notes.push(
      'Row A Child Eye Level (0.96m): Upstage deck floor plane is at a shallow 8° grazing angle.'
    );
  } else if (seat.level === 'upper-balcony' && seat.rowIndex >= 1) {
    downstageVis = 92;
  }

  const absX = Math.abs(seat.position.x);
  const horizDeg = seat.horizontalAngleDeg;
  let centerVis = 100;
  let upstageVis = 100;

  if (horizDeg > 24) {
    const excess = horizDeg - 24;
    upstageVis = Math.max(54, Math.round(100 - excess * 1.9));
    centerVis = Math.max(78, Math.round(100 - excess * 0.8));
    const sideName = seat.position.x < 0 ? 'Stage Right (House Left)' : 'Stage Left (House Right)';
    notes.push(
      `Lateral angle ${horizDeg.toFixed(1)}° off CL: Proscenium pier crops ${100 - upstageVis}% of upstage ${sideName} corner.`
    );
  } else if (horizDeg > 16) {
    const excess = horizDeg - 16;
    upstageVis = Math.max(82, Math.round(100 - excess * 1.1));
  }

  if (productionId === 'alice-in-wonderland' && seat.position.x > 5.5) {
    upstageVis = Math.max(60, upstageVis - 6);
  } else if (productionId === 'charlottes-web' && absX > 6.2) {
    upstageVis = Math.max(58, upstageVis - 8);
  }

  let flyGridVis = 100;
  let maxVisibleHeightAtBackdropM = 7.2;

  if (seat.underLowerBalconyOverhang && seat.position.z > LOWER_BALCONY_LIP_Z_M + 0.1) {
    const dzToLip = seat.position.z - LOWER_BALCONY_LIP_Z_M;
    const dyToLip = LOWER_BALCONY_SOFFIT_Y_M - eye.y;
    const slope = dyToLip / dzToLip;
    const distToBackdrop = seat.position.z + 7.2;
    const maxHeight = eye.y + slope * distToBackdrop;
    maxVisibleHeightAtBackdropM = Number(Math.min(7.2, Math.max(2.6, maxHeight)).toFixed(2));
    flyGridVis = Math.max(38, Math.min(100, Math.round((maxVisibleHeightAtBackdropM / 7.2) * 100)));

    if (maxVisibleHeightAtBackdropM < 6.4) {
      notes.push(
        `Lower Balcony Overhang clips flown scenery above ${maxVisibleHeightAtBackdropM.toFixed(2)}m (${(maxVisibleHeightAtBackdropM * 3.28084).toFixed(1)} ft) at upstage backdrop.`
      );
      if (productionId === 'mary-poppins' && maxVisibleHeightAtBackdropM < 5.4) {
        notes.push(
          'Mary Poppins high-fly cue above 5.2m is partially occluded by Lower Balcony soffit from this row.'
        );
      }
    }
  } else if (
    seat.level === 'lower-balcony' &&
    seat.underUpperBalconyOverhang &&
    seat.position.z > UPPER_BALCONY_LIP_Z_M + 0.1
  ) {
    const dzToLip = seat.position.z - UPPER_BALCONY_LIP_Z_M;
    const dyToLip = UPPER_BALCONY_SOFFIT_Y_M - eye.y;
    const slope = dyToLip / dzToLip;
    const distToBackdrop = seat.position.z + 7.2;
    const maxHeight = eye.y + slope * distToBackdrop;
    maxVisibleHeightAtBackdropM = Number(Math.min(7.2, Math.max(3.8, maxHeight)).toFixed(2));
    flyGridVis = Math.max(55, Math.min(100, Math.round((maxVisibleHeightAtBackdropM / 7.2) * 100)));

    if (maxVisibleHeightAtBackdropM < 6.5) {
      notes.push(
        `Upper Balcony Overhang limits upper proscenium header visibility above ${maxVisibleHeightAtBackdropM.toFixed(2)}m.`
      );
    }
  } else if (seat.level === 'upper-balcony') {
    maxVisibleHeightAtBackdropM = 6.6;
    flyGridVis = 88;
    notes.push(
      `Steep downward rake (${Math.abs(seat.verticalAngleDeg).toFixed(1)}°): Full view of painted floor cloth; top border trims below 6.6m.`
    );
  }

  if (eyeMode === 'child' && seat.rowIndex > 0) {
    notes.push(
      `Child Eye Height (${eye.y.toFixed(2)}m): Stadium riser step (+18–22cm/row) provides clear sightline over seated row ahead.`
    );
  }

  if (notes.length === 0) {
    notes.push('Unobstructed full-stage sightline to apron, center stage, wings, and fly loft.');
  }

  const overallScore = Math.round(
    downstageVis * 0.22 + centerVis * 0.36 + upstageVis * 0.24 + flyGridVis * 0.18
  );

  let grade: SightlineGrade = 'optimal';
  if (seat.underLowerBalconyOverhang && flyGridVis < 78) {
    grade = 'partial-overhang';
  } else if (horizDeg > 25) {
    grade = 'extreme-side';
  } else if (overallScore < 91) {
    grade = 'good';
  }

  return {
    seat,
    eyeMode,
    overallScore,
    grade,
    downstageVisibilityPct: downstageVis,
    centerStageVisibilityPct: centerVis,
    upstageVisibilityPct: upstageVis,
    flyGridVisibilityPct: flyGridVis,
    maxVisibleHeightAtBackdropM,
    notes,
  };
}
