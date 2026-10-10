import type * as THREE from 'three';

export type SeatLevel = 'main' | 'lower-balcony' | 'upper-balcony';

export type SeatSectionId =
  | 'main-left-wing'
  | 'main-center-left'
  | 'main-center-right'
  | 'main-right-wing'
  | 'lower-balcony-left'
  | 'lower-balcony-right'
  | 'upper-balcony-left'
  | 'upper-balcony-right';

export type ChartZoneId =
  | 'main-left'
  | 'main-right'
  | 'lower-balcony-left'
  | 'lower-balcony-right'
  | 'upper-balcony-left'
  | 'upper-balcony-right';

export type AudienceEyeMode = 'child' | 'adult';

export type SightlineGrade = 'optimal' | 'good' | 'partial-overhang' | 'extreme-side';

export interface SeatRecord {
  readonly id: string;
  readonly instanceIndex: number;
  readonly sectionId: SeatSectionId;
  readonly sectionTitle: string;
  readonly chartZoneId: ChartZoneId;
  readonly level: SeatLevel;
  readonly rowLabel: string;
  readonly rowIndex: number;
  readonly seatNumber: number;
  readonly position: { readonly x: number; readonly y: number; readonly z: number };
  readonly eyePositionAdult: { readonly x: number; readonly y: number; readonly z: number };
  readonly eyePositionChild: { readonly x: number; readonly y: number; readonly z: number };
  readonly yawRad: number;
  readonly underLowerBalconyOverhang: boolean;
  readonly underUpperBalconyOverhang: boolean;
  readonly distanceToStageCenterM: number;
  readonly horizontalAngleDeg: number;
  readonly verticalAngleDeg: number;
  readonly maxCeilingAngleDeg: number;
}

export interface SeatSightlineMetrics {
  readonly seat: SeatRecord;
  readonly eyeMode: AudienceEyeMode;
  readonly overallScore: number;
  readonly grade: SightlineGrade;
  readonly downstageVisibilityPct: number;
  readonly centerStageVisibilityPct: number;
  readonly upstageVisibilityPct: number;
  readonly flyGridVisibilityPct: number;
  readonly maxVisibleHeightAtBackdropM: number;
  readonly notes: ReadonlyArray<string>;
}

export type ProductionId =
  | 'alice-in-wonderland'
  | 'narnia-wardrobe'
  | 'charlottes-web'
  | 'mary-poppins'
  | 'matilda'
  | 'tech-grid-sandbox';

export interface ProductionElementSpec {
  readonly id: string;
  readonly name: string;
  readonly category:
    | 'backdrop'
    | 'portal'
    | 'wagon'
    | 'furniture'
    | 'props'
    | 'blocking'
    | 'masking'
    | 'fly-rig';
  readonly battenLine?: number;
  readonly defaultVisible: boolean;
  readonly dimensionsLabel: string;
}

export interface ProductionSpec {
  readonly id: ProductionId;
  readonly title: string;
  readonly subtitle: string;
  readonly playwrightOrComposer: string;
  readonly ageRecommendation: string;
  readonly description: string;
  readonly scenicNotes: string;
  readonly cycTopColor: number;
  readonly cycBottomColor: number;
  readonly stageWashColor: number;
  readonly stageSpotColor: number;
  readonly apronWashColor: number;
  readonly elements: ReadonlyArray<ProductionElementSpec>;
}

export interface RiggingBattenSpec {
  readonly id: string;
  readonly lineNumber: number;
  readonly name: string;
  readonly zPosM: number;
  readonly trimHeightM: number;
  readonly minHeightM: number;
  readonly maxHeightM: number;
  readonly category: 'drape' | 'electric' | 'scenic' | 'cyc';
}

export type CustomSetPieceKind =
  | 'platform-4x8'
  | 'flat-12ft'
  | 'arch-portal'
  | 'stairs-3step'
  | 'periaktos'
  | 'actor-child'
  | 'actor-adult'
  | 'prop-table';

export interface CustomSetPiece {
  readonly id: string;
  readonly kind: CustomSetPieceKind;
  readonly label: string;
  x: number;
  y: number;
  z: number;
  rotationYDeg: number;
  scale: number;
  colorHex: string;
  visible: boolean;
}

export type LightingPresetId = 'show-mode' | 'work-lights' | 'tech-rehearsal' | 'dramatic-cue';

export interface LightingState {
  preset: LightingPresetId;
  houseLevel: number;
  fohRailLevel: number;
  stageElectricsLevel: number;
  cycWashLevel: number;
  apronFootlightsLevel: number;
}

export type CameraPresetId =
  | 'house-overview'
  | 'stage-front'
  | 'from-stage-to-house'
  | 'directors-table'
  | 'lower-balcony-center'
  | 'upper-balcony-catwalk'
  | 'fly-loft-grid'
  | 'ortho-ground-plan'
  | 'ortho-section';

export interface CameraTweenState {
  readonly startPos: THREE.Vector3;
  readonly endPos: THREE.Vector3;
  readonly startTarget: THREE.Vector3;
  readonly endTarget: THREE.Vector3;
  elapsed: number;
  readonly duration: number;
}

export type ChartColorMode = 'section' | 'sightline-heatmap';
