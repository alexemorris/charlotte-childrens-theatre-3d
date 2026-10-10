import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { PostProcessingPipeline } from '../engine/post-processing-pipeline.ts';
import { installShaderLightCulling } from '../engine/shader-light-culling.ts';
import {
  buildProductionSetsController,
  DEFAULT_RIGGING_BATTENS,
  PRODUCTION_CATALOG,
  type ProductionSetsController,
} from '../sets/index.ts';
import type {
  AudienceEyeMode,
  CameraPresetId,
  CameraTweenState,
  ChartColorMode,
  CustomSetPiece,
  CustomSetPieceKind,
  LightingPresetId,
  LightingState,
  ProductionId,
  ProductionSceneCue,
  ProductionSpec,
  RiggingBattenSpec,
  SeatRecord,
  SeatSightlineMetrics,
  SightlineGrade,
} from '../types/theatre.ts';
import {
  buildTheatreSeatingLayout,
  computeSeatSightlineMetrics,
} from './seating-layout.ts';
import {
  buildMcCollTheatreArchitecture,
  type TheatreArchitectureHandles,
} from './theatre-architecture.ts';

export type GraphicsQualityMode = 'ultra' | 'balanced' | 'performance';

export interface TheatreSceneCallbacks {
  onSeatSelected?: (metrics: SeatSightlineMetrics | null, inSeatView: boolean) => void;
  onSeatHovered?: (seat: SeatRecord | null, clientX: number, clientY: number) => void;
  onProductionChanged?: (spec: ProductionSpec) => void;
  onSceneChanged?: (scene: ProductionSceneCue, spec: ProductionSpec) => void;
  onCustomPiecesChanged?: (
    pieces: ReadonlyArray<CustomSetPiece>,
    selectedId: string | null
  ) => void;
  onCameraModeChanged?: (inSeatView: boolean, presetId: CameraPresetId | null) => void;
}

export class TheatreSceneController {
  public readonly canvas: HTMLCanvasElement;
  public readonly renderer: THREE.WebGLRenderer;
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly controls: OrbitControls;
  public readonly postPipeline: PostProcessingPipeline;

  public readonly seats: ReadonlyArray<SeatRecord>;
  public readonly seatById: ReadonlyMap<string, SeatRecord>;
  public readonly architecture: TheatreArchitectureHandles;
  public readonly productionSets: ProductionSetsController;

  private callbacks: TheatreSceneCallbacks;

  private selectedSeatIndex: number | null = null;
  private hoveredSeatIndex: number | null = null;
  private eyeMode: AudienceEyeMode = 'child';
  private chartColorMode: ChartColorMode = 'section';
  private inSeatView = false;
  private activeCameraPreset: CameraPresetId | null = 'house-overview';

  // Free-look yaw/pitch offsets while seated in a seat
  private seatLookYawOffset = 0;
  private seatLookPitchOffset = 0;
  private seatBaseYaw = 0;
  private seatBasePitch = 0;
  private isDraggingSeatLook = false;
  private dragStartClientX = 0;
  private dragStartClientY = 0;
  private pointerDownClientX = 0;
  private pointerDownClientY = 0;

  private cameraTween: CameraTweenState | null = null;
  private sightlineLaserEnabled = false;
  private sightlineLaserGroup: THREE.Group;

  // Stage technical toggles
  private cadGridEnabled = false;
  private orchestraPitOpen = false;
  private stageTrapsOpen = false;
  private balconyOverhangGuidesVisible = false;
  private grandDrapeOpenFraction = 1.0;

  // Custom set pieces state
  private customPieces: CustomSetPiece[] = [];
  private selectedCustomPieceId: string | null = null;
  private customPieceSeq = 1;

  // Lighting circuits
  private lightingState: LightingState = {
    preset: 'show-mode',
    houseLevel: 0.42,
    fohRailLevel: 0.92,
    stageElectricsLevel: 0.95,
    cycWashLevel: 0.88,
    apronFootlightsLevel: 0.72,
  };

  private ambientLight!: THREE.HemisphereLight;
  private houseSpotLights: THREE.PointLight[] = [];
  private fohStageKeyLeft!: THREE.SpotLight;
  private fohStageKeyRight!: THREE.SpotLight;
  private stageOverheadKey!: THREE.SpotLight;
  private stageWarmFill!: THREE.PointLight;
  private cycWashLight!: THREE.PointLight;
  private apronFootlights: THREE.PointLight[] = [];

  private graphicsQuality: GraphicsQualityMode = 'ultra';
  private raycaster = new THREE.Raycaster();
  private pointerNdc = new THREE.Vector2();
  private clock = new THREE.Clock();
  private animationFrameId = 0;

  constructor(canvas: HTMLCanvasElement, callbacks: TheatreSceneCallbacks = {}) {
    this.canvas = canvas;
    this.callbacks = callbacks;

    installShaderLightCulling();

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0d0e13);
    this.scene.fog = new THREE.FogExp2(0x0d0e13, 0.011);

    // Subtle warm interior IBL environment map
    const pmremGen = new THREE.PMREMGenerator(this.renderer);
    const roomEnv = new RoomEnvironment();
    this.scene.environment = pmremGen.fromScene(roomEnv, 0.04).texture;
    this.scene.environmentIntensity = 0.28;
    roomEnv.dispose();
    pmremGen.dispose();

    this.camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / Math.max(1, window.innerHeight),
      0.15,
      90
    );
    this.camera.position.set(8.6, 5.4, 14.2);

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.065;
    this.controls.maxDistance = 36;
    this.controls.minDistance = 0.5;
    this.controls.maxPolarAngle = Math.PI * 0.495;
    this.controls.target.set(0, 2.2, -1.2);
    this.controls.update();

    this.postPipeline = new PostProcessingPipeline(
      this.renderer,
      window.innerWidth,
      window.innerHeight
    );

    // 1. Build 570 seats
    this.seats = buildTheatreSeatingLayout();
    const map = new Map<string, SeatRecord>();
    for (const s of this.seats) {
      map.set(s.id, s);
    }
    this.seatById = map;

    // 2. Build McColl Family Theatre Architecture
    this.architecture = buildMcCollTheatreArchitecture(this.seats);
    this.scene.add(this.architecture.root);

    // 3. Build 6 Switchable Production Sets
    this.productionSets = buildProductionSetsController();
    this.scene.add(this.productionSets.root);

    // Apply Alice in Wonderland's painted ray stage floor texture by default
    this.syncStageFloorTexture();

    // 4. Sightline 3D Laser Frustum Group
    this.sightlineLaserGroup = new THREE.Group();
    this.sightlineLaserGroup.name = 'SightlineLasers';
    this.scene.add(this.sightlineLaserGroup);

    // 5. Theatrical Lighting System
    this.buildLightingRig();
    this.applyLightingState();

    // 6. Bind viewport pointer & keyboard interactions
    this.bindEvents();
  }

  private buildLightingRig(): void {
    this.ambientLight = new THREE.HemisphereLight(0xffe6c8, 0x1b1624, 0.55);
    this.scene.add(this.ambientLight);

    // Warm architectural house lights over the auditorium & proscenium frieze
    const houseCoords: ReadonlyArray< readonly [number, number, number] > = [
      [-4.8, 7.6, 4.2],
      [4.8, 7.6, 4.2],
      [-5.2, 8.2, 9.8],
      [5.2, 8.2, 9.8],
      [0, 5.6, 13.8],
      [0, 8.5, 14.5],
    ];
    for (const [hx, hy, hz] of houseCoords) {
      const pt = new THREE.PointLight(0xffcb8c, 16, 19, 1.5);
      pt.position.set(hx, hy, hz);
      this.scene.add(pt);
      this.houseSpotLights.push(pt);
    }

    // FOH Balcony Rail Spotlights (Key lights onto proscenium frieze & stage)
    this.fohStageKeyLeft = new THREE.SpotLight(
      0xffe4bc,
      95,
      32,
      Math.PI * 0.26,
      0.45,
      1.35
    );
    this.fohStageKeyLeft.position.set(-4.6, 4.6, 10.5);
    this.fohStageKeyLeft.target.position.set(-1.2, 1.8, -2.4);
    this.fohStageKeyLeft.castShadow = true;
    this.fohStageKeyLeft.shadow.mapSize.set(1024, 1024);
    this.fohStageKeyLeft.shadow.bias = -0.0004;
    this.scene.add(this.fohStageKeyLeft);
    this.scene.add(this.fohStageKeyLeft.target);

    this.fohStageKeyRight = new THREE.SpotLight(
      0xffd8a8,
      95,
      32,
      Math.PI * 0.26,
      0.45,
      1.35
    );
    this.fohStageKeyRight.position.set(4.6, 4.6, 10.5);
    this.fohStageKeyRight.target.position.set(1.2, 1.8, -2.4);
    this.fohStageKeyRight.castShadow = true;
    this.fohStageKeyRight.shadow.mapSize.set(1024, 1024);
    this.fohStageKeyRight.shadow.bias = -0.0004;
    this.scene.add(this.fohStageKeyRight);
    this.scene.add(this.fohStageKeyRight.target);

    // Overhead Stage 1st Electric Key Spotlight (casts crisp scenic shadows on stage floor)
    this.stageOverheadKey = new THREE.SpotLight(
      0xffdf9e,
      125,
      24,
      Math.PI * 0.34,
      0.5,
      1.3
    );
    this.stageOverheadKey.position.set(0.2, 7.6, -0.6);
    this.stageOverheadKey.target.position.set(0, 0.8, -3.2);
    this.stageOverheadKey.castShadow = true;
    this.stageOverheadKey.shadow.mapSize.set(2048, 2048);
    this.stageOverheadKey.shadow.bias = -0.0003;
    this.scene.add(this.stageOverheadKey);
    this.scene.add(this.stageOverheadKey.target);

    // Mid-stage warm fill
    this.stageWarmFill = new THREE.PointLight(0xffcf94, 34, 18, 1.4);
    this.stageWarmFill.position.set(0, 5.2, -3.5);
    this.scene.add(this.stageWarmFill);

    // Upstage Cyclorama Wash Light
    this.cycWashLight = new THREE.PointLight(0x7c3e9c, 42, 18, 1.3);
    this.cycWashLight.position.set(0, 4.5, -7.6);
    this.scene.add(this.cycWashLight);

    // Downstage Apron Footlights
    for (const fx of [-3.4, 0, 3.4]) {
      const foot = new THREE.PointLight(0xffd296, 12, 9, 1.5);
      foot.position.set(fx, 0.45, 1.35);
      this.scene.add(foot);
      this.apronFootlights.push(foot);
    }
  }

  public applyLightingState(): void {
    const prod = this.productionSets.getActiveProduction();
    const scene = this.productionSets.getActiveScene();
    const s = this.lightingState;

    const stageWashColor = scene?.stageWashColor ?? prod.stageWashColor;
    const stageSpotColor = scene?.stageSpotColor ?? prod.stageSpotColor;
    const cycBottomColor = scene?.cycBottomColor ?? prod.cycBottomColor;

    this.ambientLight.intensity = 0.28 + s.houseLevel * 0.85;
    for (const pt of this.houseSpotLights) {
      pt.intensity = s.houseLevel * 28;
    }

    this.fohStageKeyLeft.intensity = s.fohRailLevel * 110;
    this.fohStageKeyRight.intensity = s.fohRailLevel * 110;
    this.fohStageKeyLeft.color.setHex(stageWashColor);
    this.fohStageKeyRight.color.setHex(stageWashColor);

    // Emissive FOH lenses on the Lower Balcony Rail
    for (const lens of this.architecture.fohLensMeshes) {
      const mat = lens.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.3 + s.fohRailLevel * 2.2;
    }

    this.stageOverheadKey.intensity = s.stageElectricsLevel * 135;
    this.stageOverheadKey.color.setHex(stageSpotColor);
    this.stageWarmFill.intensity = s.stageElectricsLevel * 38;
    this.stageWarmFill.color.setHex(stageWashColor);

    this.cycWashLight.intensity = s.cycWashLevel * 52;
    this.cycWashLight.color.setHex(cycBottomColor);

    const cycMat = this.productionSets.cycMesh.material as THREE.MeshStandardMaterial;
    cycMat.emissiveIntensity = 0.25 + s.cycWashLevel * 0.95;

    for (const foot of this.apronFootlights) {
      foot.intensity = s.apronFootlightsLevel * 16;
      foot.color.setHex(prod.apronWashColor);
    }
  }

  public setLightingPreset(preset: LightingPresetId): LightingState {
    this.lightingState.preset = preset;
    if (preset === 'show-mode') {
      this.lightingState.houseLevel = 0.38;
      this.lightingState.fohRailLevel = 0.94;
      this.lightingState.stageElectricsLevel = 0.96;
      this.lightingState.cycWashLevel = 0.9;
      this.lightingState.apronFootlightsLevel = 0.72;
    } else if (preset === 'work-lights') {
      this.lightingState.houseLevel = 1.0;
      this.lightingState.fohRailLevel = 0.65;
      this.lightingState.stageElectricsLevel = 0.85;
      this.lightingState.cycWashLevel = 0.35;
      this.lightingState.apronFootlightsLevel = 0.5;
    } else if (preset === 'tech-rehearsal') {
      this.lightingState.houseLevel = 0.62;
      this.lightingState.fohRailLevel = 0.88;
      this.lightingState.stageElectricsLevel = 0.92;
      this.lightingState.cycWashLevel = 0.75;
      this.lightingState.apronFootlightsLevel = 0.65;
    } else if (preset === 'dramatic-cue') {
      this.lightingState.houseLevel = 0.14;
      this.lightingState.fohRailLevel = 0.78;
      this.lightingState.stageElectricsLevel = 1.0;
      this.lightingState.cycWashLevel = 1.0;
      this.lightingState.apronFootlightsLevel = 0.45;
    }
    this.applyLightingState();
    return { ...this.lightingState };
  }

  public updateLightingChannel(
    channel: keyof Omit<LightingState, 'preset'>,
    value: number
  ): LightingState {
    this.lightingState[channel] = Math.max(0, Math.min(1, value));
    this.applyLightingState();
    return { ...this.lightingState };
  }

  public getLightingState(): LightingState {
    return { ...this.lightingState };
  }

  public setProduction(id: ProductionId): ProductionSpec {
    const spec = this.productionSets.setActiveProduction(id);
    if (id === 'tech-grid-sandbox') {
      this.cadGridEnabled = true;
    }
    const activeScene = this.productionSets.getActiveScene();
    if (activeScene?.grandDrapeOpenFraction !== undefined) {
      this.setGrandDrapeOpenFraction(activeScene.grandDrapeOpenFraction);
    }
    if (activeScene?.houseLevel !== undefined) {
      this.lightingState.houseLevel = activeScene.houseLevel;
    }
    this.syncStageFloorTexture();
    this.applyLightingState();
    this.refreshSeatColorsAndMetrics();
    this.callbacks.onProductionChanged?.(spec);
    if (activeScene) {
      this.callbacks.onSceneChanged?.(activeScene, spec);
    }
    return spec;
  }

  public getActiveProduction(): ProductionSpec {
    return this.productionSets.getActiveProduction();
  }

  public setSceneCue(sceneId: string): ProductionSceneCue {
    const scene = this.productionSets.setActiveScene(sceneId);
    const spec = this.productionSets.getActiveProduction();
    if (scene.grandDrapeOpenFraction !== undefined) {
      this.setGrandDrapeOpenFraction(scene.grandDrapeOpenFraction);
    }
    if (scene.houseLevel !== undefined) {
      this.lightingState.houseLevel = scene.houseLevel;
    }
    this.syncStageFloorTexture();
    this.applyLightingState();
    this.callbacks.onSceneChanged?.(scene, spec);
    return scene;
  }

  public stepSceneCue(delta: -1 | 1): ProductionSceneCue {
    const scene = this.productionSets.stepScene(delta);
    const spec = this.productionSets.getActiveProduction();
    if (scene.grandDrapeOpenFraction !== undefined) {
      this.setGrandDrapeOpenFraction(scene.grandDrapeOpenFraction);
    }
    if (scene.houseLevel !== undefined) {
      this.lightingState.houseLevel = scene.houseLevel;
    }
    this.syncStageFloorTexture();
    this.applyLightingState();
    this.callbacks.onSceneChanged?.(scene, spec);
    return scene;
  }

  public getActiveSceneCue(): ProductionSceneCue {
    return this.productionSets.getActiveScene();
  }

  public getProductionCatalog(): ReadonlyArray<ProductionSpec> {
    return PRODUCTION_CATALOG;
  }

  public getRiggingBattens(): ReadonlyArray<RiggingBattenSpec> {
    return DEFAULT_RIGGING_BATTENS;
  }

  private syncStageFloorTexture(): void {
    const floorMat = this.architecture.stageFloorMesh
      .material as THREE.MeshStandardMaterial;
    const activeProd = this.productionSets.getActiveProduction().id;
    const grinchFloorVisible =
      activeProd === 'grinch' &&
      this.productionSets.isElementVisible('grinch-snow-floor') &&
      !this.cadGridEnabled;
    const schoolOfRockFloorVisible =
      activeProd === 'school-of-rock' &&
      this.productionSets.isElementVisible('sor-plaid-crest-floor') &&
      !this.cadGridEnabled;
    const aliceFloorVisible =
      activeProd === 'alice-in-wonderland' &&
      this.productionSets.isElementVisible('alice-ray-floor') &&
      !this.cadGridEnabled;

    if (grinchFloorVisible) {
      floorMat.map = this.productionSets.grinchSnowFloorTexture;
      floorMat.color.setHex(0xffffff);
    } else if (schoolOfRockFloorVisible) {
      floorMat.map = this.productionSets.schoolOfRockFloorTexture;
      floorMat.color.setHex(0xffffff);
    } else if (aliceFloorVisible) {
      floorMat.map = this.productionSets.aliceFloorTexture;
      floorMat.color.setHex(0xffffff);
    } else if (this.cadGridEnabled || activeProd === 'tech-grid-sandbox') {
      floorMat.map = this.architecture.marleyGridTexture;
      floorMat.color.setHex(0xffffff);
    } else {
      floorMat.map = this.architecture.marleyPlainTexture;
      floorMat.color.setHex(0xd8d4cc);
    }
    floorMat.needsUpdate = true;
  }

  public setElementVisibility(elementId: string, visible: boolean): void {
    this.productionSets.setElementVisibility(elementId, visible);
    if (
      elementId === 'grinch-snow-floor' ||
      elementId === 'alice-ray-floor' ||
      elementId === 'sor-plaid-crest-floor'
    ) {
      this.syncStageFloorTexture();
    }
  }

  public isElementVisible(elementId: string): boolean {
    return this.productionSets.isElementVisible(elementId);
  }

  public setBattenTrimHeight(lineNumber: number, heightM: number): void {
    this.productionSets.setBattenTrimHeight(lineNumber, heightM);
  }

  public getBattenTrimHeight(lineNumber: number): number {
    return this.productionSets.getBattenTrimHeight(lineNumber);
  }

  // Stage technical controls
  public setCadGridEnabled(enabled: boolean): void {
    this.cadGridEnabled = enabled;
    this.syncStageFloorTexture();
  }

  public isCadGridEnabled(): boolean {
    return this.cadGridEnabled;
  }

  public setOrchestraPitOpen(open: boolean): void {
    this.orchestraPitOpen = open;
    this.architecture.setOrchestraPitOpen(open);
  }

  public isOrchestraPitOpen(): boolean {
    return this.orchestraPitOpen;
  }

  public setStageTrapsOpen(open: boolean): void {
    this.stageTrapsOpen = open;
    this.architecture.setStageTrapsOpen(open);
  }

  public isStageTrapsOpen(): boolean {
    return this.stageTrapsOpen;
  }

  public setBalconyOverhangGuidesVisible(visible: boolean): void {
    this.balconyOverhangGuidesVisible = visible;
    this.architecture.balconyOverhangGuidesGroup.visible = visible;
  }

  public isBalconyOverhangGuidesVisible(): boolean {
    return this.balconyOverhangGuidesVisible;
  }

  public setGrandDrapeOpenFraction(fraction: number): void {
    this.grandDrapeOpenFraction = Math.max(0, Math.min(1, fraction));
    this.architecture.setGrandDrapeTrim(this.grandDrapeOpenFraction);
  }

  public getGrandDrapeOpenFraction(): number {
    return this.grandDrapeOpenFraction;
  }

  public setSightlineLaserEnabled(enabled: boolean): void {
    this.sightlineLaserEnabled = enabled;
    this.rebuildSightlineLasers();
  }

  public isSightlineLaserEnabled(): boolean {
    return this.sightlineLaserEnabled;
  }

  // Seat selection & 1st-person sightline camera
  public selectSeatByIndex(index: number | null, enterSeatView = true): void {
    if (index === null || index < 0 || index >= this.seats.length) {
      this.selectedSeatIndex = null;
      this.inSeatView = false;
      this.controls.enabled = true;
      this.refreshSeatColorsAndMetrics();
      this.rebuildSightlineLasers();
      this.callbacks.onSeatSelected?.(null, false);
      this.callbacks.onCameraModeChanged?.(false, this.activeCameraPreset);
      return;
    }

    this.selectedSeatIndex = index;
    const seat = this.seats[index]!;
    const metrics = computeSeatSightlineMetrics(
      seat,
      this.eyeMode,
      this.productionSets.getActiveProduction().id
    );

    if (enterSeatView) {
      this.inSeatView = true;
      this.activeCameraPreset = null;
      this.seatLookYawOffset = 0;
      this.seatLookPitchOffset = 0;
      this.flyToSeatEye(seat);
      this.callbacks.onCameraModeChanged?.(true, null);
    }

    this.refreshSeatColorsAndMetrics();
    this.rebuildSightlineLasers();
    this.callbacks.onSeatSelected?.(metrics, this.inSeatView);
  }

  public selectSeatById(seatId: string, enterSeatView = true): void {
    const seat = this.seatById.get(seatId);
    if (!seat) return;
    this.selectSeatByIndex(seat.instanceIndex, enterSeatView);
  }

  public getSelectedSeatMetrics(): SeatSightlineMetrics | null {
    if (this.selectedSeatIndex === null) return null;
    const seat = this.seats[this.selectedSeatIndex];
    if (!seat) return null;
    return computeSeatSightlineMetrics(
      seat,
      this.eyeMode,
      this.productionSets.getActiveProduction().id
    );
  }

  public isInSeatView(): boolean {
    return this.inSeatView;
  }

  public exitSeatViewToOrbit(): void {
    if (!this.inSeatView) return;
    this.inSeatView = false;
    this.controls.enabled = true;
    this.setCameraPreset('house-overview');
    const metrics = this.getSelectedSeatMetrics();
    this.callbacks.onSeatSelected?.(metrics, false);
    this.callbacks.onCameraModeChanged?.(false, 'house-overview');
  }

  public setEyeMode(mode: AudienceEyeMode): void {
    this.eyeMode = mode;
    if (this.selectedSeatIndex !== null && this.inSeatView) {
      const seat = this.seats[this.selectedSeatIndex];
      if (seat) {
        this.flyToSeatEye(seat, 0.35);
      }
    }
    this.refreshSeatColorsAndMetrics();
    this.rebuildSightlineLasers();
    const metrics = this.getSelectedSeatMetrics();
    if (metrics) {
      this.callbacks.onSeatSelected?.(metrics, this.inSeatView);
    }
  }

  public getEyeMode(): AudienceEyeMode {
    return this.eyeMode;
  }

  public setChartColorMode(mode: ChartColorMode): void {
    this.chartColorMode = mode;
    this.refreshSeatColorsAndMetrics();
  }

  public getChartColorMode(): ChartColorMode {
    return this.chartColorMode;
  }

  public getAllSeatSightlineGrades(): ReadonlyArray<SightlineGrade> {
    const prodId = this.productionSets.getActiveProduction().id;
    return this.seats.map(
      (s) => computeSeatSightlineMetrics(s, this.eyeMode, prodId).grade
    );
  }

  public stepSelectedSeatInRow(delta: -1 | 1): void {
    if (this.selectedSeatIndex === null) {
      this.selectSeatByIndex(125, true);
      return;
    }
    const cur = this.seats[this.selectedSeatIndex];
    if (!cur) return;
    const sameRow = this.seats
      .filter((s) => s.level === cur.level && s.rowLabel === cur.rowLabel)
      .sort((a, b) => a.position.x - b.position.x);
    const idx = sameRow.findIndex((s) => s.id === cur.id);
    if (idx === -1) return;
    const next = sameRow[idx + delta];
    if (next) {
      this.selectSeatByIndex(next.instanceIndex, true);
    }
  }

  public stepSelectedSeatRow(delta: -1 | 1): void {
    if (this.selectedSeatIndex === null) {
      this.selectSeatByIndex(125, true);
      return;
    }
    const cur = this.seats[this.selectedSeatIndex];
    if (!cur) return;
    const targetRowIndex = cur.rowIndex + delta;
    const candidates = this.seats.filter(
      (s) => s.level === cur.level && s.rowIndex === targetRowIndex
    );
    if (candidates.length === 0) return;
    let closest = candidates[0]!;
    let bestDx = Math.abs(closest.position.x - cur.position.x);
    for (const c of candidates) {
      const dx = Math.abs(c.position.x - cur.position.x);
      if (dx < bestDx) {
        bestDx = dx;
        closest = c;
      }
    }
    this.selectSeatByIndex(closest.instanceIndex, true);
  }

  private computeAdaptiveFov(baseFov: number): number {
    const aspect = window.innerWidth / Math.max(1, window.innerHeight);
    if (aspect < 0.75) {
      return Math.min(72, baseFov + 14);
    }
    if (aspect < 1.0) {
      return Math.min(68, baseFov + 8);
    }
    return baseFov;
  }

  private flyToSeatEye(seat: SeatRecord, duration = 0.65): void {
    const eye =
      this.eyeMode === 'child' ? seat.eyePositionChild : seat.eyePositionAdult;
    const endPos = new THREE.Vector3(eye.x, eye.y, eye.z);
    // Aim toward Center Stage focal point (0, 1.75, -2.5)
    const stageFocal = new THREE.Vector3(0, 1.75, -2.5);
    const dir = stageFocal.clone().sub(endPos).normalize();

    this.seatBaseYaw = Math.atan2(dir.x, dir.z);
    this.seatBasePitch = Math.asin(Math.max(-0.95, Math.min(0.95, dir.y)));

    const lookTarget = endPos.clone().add(dir.multiplyScalar(8.0));
    this.controls.enabled = false;
    this.camera.fov = this.computeAdaptiveFov(54);
    this.camera.updateProjectionMatrix();

    this.cameraTween = {
      startPos: this.camera.position.clone(),
      endPos,
      startTarget: this.controls.target.clone(),
      endTarget: lookTarget,
      elapsed: 0,
      duration,
    };
  }

  private applySeatedFreeLook(): void {
    if (!this.inSeatView || this.selectedSeatIndex === null || this.cameraTween) {
      return;
    }
    const seat = this.seats[this.selectedSeatIndex];
    if (!seat) return;
    const eye =
      this.eyeMode === 'child' ? seat.eyePositionChild : seat.eyePositionAdult;
    this.camera.position.set(eye.x, eye.y, eye.z);

    const yaw = this.seatBaseYaw + this.seatLookYawOffset;
    const pitch = Math.max(
      -0.65,
      Math.min(0.72, this.seatBasePitch + this.seatLookPitchOffset)
    );

    const cosP = Math.cos(pitch);
    const dx = Math.sin(yaw) * cosP;
    const dy = Math.sin(pitch);
    const dz = Math.cos(yaw) * cosP;

    this.controls.target.set(eye.x + dx * 8, eye.y + dy * 8, eye.z + dz * 8);
    this.camera.lookAt(this.controls.target);
  }

  private refreshSeatColorsAndMetrics(): void {
    const grades =
      this.chartColorMode === 'sightline-heatmap'
        ? this.getAllSeatSightlineGrades()
        : null;
    this.architecture.updateSeatHighlight(
      this.selectedSeatIndex,
      this.hoveredSeatIndex,
      grades
    );
  }

  private rebuildSightlineLasers(): void {
    while (this.sightlineLaserGroup.children.length > 0) {
      const c = this.sightlineLaserGroup.children[0];
      if (c) this.sightlineLaserGroup.remove(c);
    }

    if (!this.sightlineLaserEnabled || this.selectedSeatIndex === null) {
      return;
    }
    const seat = this.seats[this.selectedSeatIndex];
    if (!seat) return;
    const metrics = this.getSelectedSeatMetrics();
    const eye =
      this.eyeMode === 'child' ? seat.eyePositionChild : seat.eyePositionAdult;
    const origin = new THREE.Vector3(eye.x, eye.y, eye.z);

    const targets: ReadonlyArray<{
      pos: THREE.Vector3;
      color: number;
    }> = [
      { pos: new THREE.Vector3(0, 1.45, -2.2), color: 0x38e298 }, // Center stage table
      { pos: new THREE.Vector3(0, 0.25, 1.1), color: 0x38e2ff }, // Downstage apron
      {
        pos: new THREE.Vector3(-4.8, 1.6, -2.5),
        color: seat.horizontalAngleDeg > 24 ? 0xffa838 : 0x38e298,
      }, // Stage right wing
      {
        pos: new THREE.Vector3(4.8, 1.6, -2.5),
        color: seat.horizontalAngleDeg > 24 ? 0xffa838 : 0x38e298,
      }, // Stage left wing
      {
        pos: new THREE.Vector3(
          0,
          metrics ? Math.min(6.1, metrics.maxVisibleHeightAtBackdropM) : 6.0,
          -4.8
        ),
        color:
          metrics && metrics.maxVisibleHeightAtBackdropM < 6.0 ? 0xff6b5c : 0x62b4ff,
      }, // Upper fly trim limit
    ];

    for (const t of targets) {
      const geo = new THREE.BufferGeometry().setFromPoints([origin, t.pos]);
      const line = new THREE.Line(
        geo,
        new THREE.LineBasicMaterial({
          color: t.color,
          transparent: true,
          opacity: 0.78,
        })
      );
      this.sightlineLaserGroup.add(line);

      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 10, 10),
        new THREE.MeshBasicMaterial({ color: t.color })
      );
      dot.position.copy(t.pos);
      this.sightlineLaserGroup.add(dot);
    }
  }

  public setCameraPreset(preset: CameraPresetId): void {
    this.inSeatView = false;
    this.activeCameraPreset = preset;
    this.controls.enabled = true;
    this.camera.fov = this.computeAdaptiveFov(52);
    this.camera.updateProjectionMatrix();

    let endPos = new THREE.Vector3(8.6, 5.4, 14.2);
    let endTarget = new THREE.Vector3(0, 2.2, -1.2);

    switch (preset) {
      case 'house-overview':
        endPos = new THREE.Vector3(8.6, 5.4, 14.2);
        endTarget = new THREE.Vector3(0, 2.2, -1.2);
        break;
      case 'stage-front':
        endPos = new THREE.Vector3(0, 2.55, 8.4);
        endTarget = new THREE.Vector3(0, 2.15, -3.2);
        break;
      case 'from-stage-to-house':
        // Matches reference photo 85e12e12.jpg (looking from Stage out into the 570-seat Auditorium!)
        endPos = new THREE.Vector3(0.4, 2.1, -2.4);
        endTarget = new THREE.Vector3(0, 3.2, 11.5);
        break;
      case 'directors-table':
        endPos = new THREE.Vector3(0, 2.48, 8.85);
        endTarget = new THREE.Vector3(0, 1.95, -2.6);
        break;
      case 'lower-balcony-center':
        endPos = new THREE.Vector3(0, 4.92, 12.15);
        endTarget = new THREE.Vector3(0, 1.85, -2.8);
        break;
      case 'upper-balcony-catwalk':
        endPos = new THREE.Vector3(-2.4, 7.75, 14.1);
        endTarget = new THREE.Vector3(0, 1.9, -2.6);
        break;
      case 'fly-loft-grid':
        endPos = new THREE.Vector3(7.4, 7.6, 2.6);
        endTarget = new THREE.Vector3(0, 3.2, -3.8);
        break;
      case 'ortho-ground-plan':
        endPos = new THREE.Vector3(0, 24.5, 2.5);
        endTarget = new THREE.Vector3(0, 0, 2.4);
        break;
      case 'ortho-section':
        endPos = new THREE.Vector3(21.5, 4.2, 3.0);
        endTarget = new THREE.Vector3(0, 3.2, 3.0);
        break;
    }

    this.cameraTween = {
      startPos: this.camera.position.clone(),
      endPos,
      startTarget: this.controls.target.clone(),
      endTarget,
      elapsed: 0,
      duration: 0.65,
    };

    const metrics = this.getSelectedSeatMetrics();
    this.callbacks.onSeatSelected?.(metrics, false);
    this.callbacks.onCameraModeChanged?.(false, preset);
  }

  // Custom Set Piece Spawner & Transform Controls
  public addCustomSetPiece(kind: CustomSetPieceKind): CustomSetPiece {
    const labelMap: Record<CustomSetPieceKind, string> = {
      'platform-4x8': '4×8ft Stage Deck Riser',
      'flat-12ft': '12ft Scenic Wall Flat',
      'arch-portal': 'Scenic Arch Portal',
      'stairs-3step': '3-Step Stage Unit',
      periaktos: 'Revolving Periaktos Prism',
      'actor-child': 'Child Performer (1.35m)',
      'actor-adult': 'Adult Performer (1.75m)',
      'prop-table': 'Rehearsal Prop Table',
    };
    const palette = ['#4b7bec', '#e69b38', '#26de81', '#a55eea', '#eb3b5a', '#45aaf2'];
    const seq = this.customPieceSeq++;
    const offset = ((seq - 1) % 5 - 2) * 0.85;

    const piece: CustomSetPiece = {
      id: `custom-${seq}`,
      kind,
      label: `${labelMap[kind]} #${seq}`,
      x: Number(offset.toFixed(2)),
      y: 0,
      z: -2.2,
      rotationYDeg: 0,
      scale: 1,
      colorHex: palette[(seq - 1) % palette.length] ?? '#4b7bec',
      visible: true,
    };

    this.customPieces.push(piece);
    this.selectedCustomPieceId = piece.id;
    this.productionSets.rebuildCustomSetPieces(
      this.customPieces,
      this.selectedCustomPieceId
    );
    this.callbacks.onCustomPiecesChanged?.(
      this.customPieces,
      this.selectedCustomPieceId
    );
    return piece;
  }

  public selectCustomSetPiece(id: string | null): void {
    this.selectedCustomPieceId = id;
    this.productionSets.rebuildCustomSetPieces(
      this.customPieces,
      this.selectedCustomPieceId
    );
    this.callbacks.onCustomPiecesChanged?.(
      this.customPieces,
      this.selectedCustomPieceId
    );
  }

  public updateSelectedCustomPiece(
    patch: Partial<Pick<CustomSetPiece, 'x' | 'y' | 'z' | 'rotationYDeg' | 'scale' | 'colorHex'>>
  ): void {
    if (!this.selectedCustomPieceId) return;
    const piece = this.customPieces.find((p) => p.id === this.selectedCustomPieceId);
    if (!piece) return;
    if (patch.x !== undefined) piece.x = patch.x;
    if (patch.y !== undefined) piece.y = patch.y;
    if (patch.z !== undefined) piece.z = patch.z;
    if (patch.rotationYDeg !== undefined) piece.rotationYDeg = patch.rotationYDeg;
    if (patch.scale !== undefined) piece.scale = patch.scale;
    if (patch.colorHex !== undefined) piece.colorHex = patch.colorHex;

    this.productionSets.rebuildCustomSetPieces(
      this.customPieces,
      this.selectedCustomPieceId
    );
    this.callbacks.onCustomPiecesChanged?.(
      this.customPieces,
      this.selectedCustomPieceId
    );
  }

  public deleteSelectedCustomPiece(): void {
    if (!this.selectedCustomPieceId) return;
    this.customPieces = this.customPieces.filter(
      (p) => p.id !== this.selectedCustomPieceId
    );
    this.selectedCustomPieceId =
      this.customPieces[this.customPieces.length - 1]?.id ?? null;
    this.productionSets.rebuildCustomSetPieces(
      this.customPieces,
      this.selectedCustomPieceId
    );
    this.callbacks.onCustomPiecesChanged?.(
      this.customPieces,
      this.selectedCustomPieceId
    );
  }

  public clearCustomSetPieces(): void {
    this.customPieces = [];
    this.selectedCustomPieceId = null;
    this.productionSets.rebuildCustomSetPieces([], null);
    this.callbacks.onCustomPiecesChanged?.([], null);
  }

  public getCustomSetPieces(): ReadonlyArray<CustomSetPiece> {
    return this.customPieces;
  }

  public getSelectedCustomPiece(): CustomSetPiece | null {
    if (!this.selectedCustomPieceId) return null;
    return this.customPieces.find((p) => p.id === this.selectedCustomPieceId) ?? null;
  }

  public cycleGraphicsQuality(): GraphicsQualityMode {
    this.graphicsQuality = this.postPipeline.cycleQualityPreset();
    return this.graphicsQuality;
  }

  public getGraphicsQuality(): GraphicsQualityMode {
    return this.graphicsQuality;
  }

  private bindEvents(): void {
    window.addEventListener('resize', () => this.handleResize());

    this.canvas.addEventListener('pointerdown', (e: PointerEvent) => {
      this.pointerDownClientX = e.clientX;
      this.pointerDownClientY = e.clientY;
      if (this.inSeatView && e.isPrimary && (e.button === 0 || e.pointerType === 'touch')) {
        this.isDraggingSeatLook = true;
        this.dragStartClientX = e.clientX;
        this.dragStartClientY = e.clientY;
      }
    });

    window.addEventListener('pointermove', (e: PointerEvent) => {
      if (this.inSeatView && this.isDraggingSeatLook && e.isPrimary) {
        const dx = e.clientX - this.dragStartClientX;
        const dy = e.clientY - this.dragStartClientY;
        this.dragStartClientX = e.clientX;
        this.dragStartClientY = e.clientY;
        this.seatLookYawOffset -= dx * 0.0038;
        this.seatLookPitchOffset -= dy * 0.0032;
        this.seatLookYawOffset = Math.max(-1.35, Math.min(1.35, this.seatLookYawOffset));
        this.seatLookPitchOffset = Math.max(
          -0.65,
          Math.min(0.65, this.seatLookPitchOffset)
        );
        return;
      }

      if (e.target === this.canvas && e.pointerType !== 'touch') {
        this.handlePointerHover(e);
      }
    });

    window.addEventListener('pointercancel', () => {
      this.isDraggingSeatLook = false;
    });

    window.addEventListener('pointerup', (e: PointerEvent) => {
      this.isDraggingSeatLook = false;
      if (e.target !== this.canvas) return;
      const dist = Math.hypot(
        e.clientX - this.pointerDownClientX,
        e.clientY - this.pointerDownClientY
      );
      const maxTapSlop = e.pointerType === 'touch' ? 14 : 6;
      if (dist < maxTapSlop) {
        this.handleViewportClick(e);
      }
    });

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'Escape' && this.inSeatView) {
        this.exitSeatViewToOrbit();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.stepSelectedSeatInRow(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.stepSelectedSeatInRow(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.stepSelectedSeatRow(-1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.stepSelectedSeatRow(1);
      } else if (e.key === 'c' || e.key === 'C') {
        this.setEyeMode(this.eyeMode === 'child' ? 'adult' : 'child');
      } else if (e.key === 'l' || e.key === 'L') {
        this.setSightlineLaserEnabled(!this.sightlineLaserEnabled);
      } else if (e.key === '[') {
        e.preventDefault();
        this.stepSceneCue(-1);
      } else if (e.key === ']') {
        e.preventDefault();
        this.stepSceneCue(1);
      }
    });
  }

  private updateRaycasterFromEvent(e: PointerEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
  }

  private handlePointerHover(e: PointerEvent): void {
    this.updateRaycasterFromEvent(e);
    const hits = this.raycaster.intersectObjects(
      [
        this.architecture.seatCushionInstanced,
        this.architecture.seatBackInstanced,
      ],
      false
    );
    const hit = hits[0];
    const instanceId = hit?.instanceId ?? null;

    if (instanceId !== null && instanceId !== undefined && this.seats[instanceId]) {
      if (this.hoveredSeatIndex !== instanceId) {
        this.hoveredSeatIndex = instanceId;
        this.refreshSeatColorsAndMetrics();
      }
      this.canvas.style.cursor = 'pointer';
      this.callbacks.onSeatHovered?.(this.seats[instanceId]!, e.clientX, e.clientY);
    } else {
      if (this.hoveredSeatIndex !== null) {
        this.hoveredSeatIndex = null;
        this.refreshSeatColorsAndMetrics();
      }
      this.canvas.style.cursor = this.inSeatView ? 'grab' : 'grab';
      this.callbacks.onSeatHovered?.(null, e.clientX, e.clientY);
    }
  }

  private handleViewportClick(e: PointerEvent): void {
    this.updateRaycasterFromEvent(e);

    // 1. Check if user clicked a Custom Set Piece on stage
    if (this.productionSets.customPiecesGroup.children.length > 0) {
      const customHits = this.raycaster.intersectObjects(
        this.productionSets.customPiecesGroup.children,
        true
      );
      if (customHits.length > 0) {
        const pieceId = customHits[0]?.object.userData?.customSetPieceId as
          | string
          | undefined;
        if (pieceId) {
          this.selectCustomSetPiece(pieceId);
          return;
        }
      }
    }

    // 2. Check if user clicked one of the 570 auditorium seats
    const seatHits = this.raycaster.intersectObjects(
      [
        this.architecture.seatCushionInstanced,
        this.architecture.seatBackInstanced,
        this.architecture.seatFrameInstanced,
      ],
      false
    );
    if (seatHits.length > 0) {
      const idx = seatHits[0]?.instanceId;
      if (idx !== undefined && this.seats[idx]) {
        this.selectSeatByIndex(idx, true);
      }
    }
  }

  public handleResize(): void {
    const w = window.innerWidth;
    const h = Math.max(1, window.innerHeight);
    this.camera.aspect = w / h;
    this.camera.fov = this.computeAdaptiveFov(this.inSeatView ? 54 : 52);
    this.camera.updateProjectionMatrix();
    this.postPipeline.resize(w, h);
  }

  public startRenderLoop(): void {
    const tick = (): void => {
      this.animationFrameId = requestAnimationFrame(tick);
      const dt = Math.min(0.1, this.clock.getDelta());

      if (this.cameraTween) {
        this.cameraTween.elapsed += dt;
        const rawT = Math.min(
          1,
          this.cameraTween.elapsed / Math.max(0.01, this.cameraTween.duration)
        );
        // Smooth cubic ease-out
        const ease = 1 - Math.pow(1 - rawT, 3);
        this.camera.position.lerpVectors(
          this.cameraTween.startPos,
          this.cameraTween.endPos,
          ease
        );
        this.controls.target.lerpVectors(
          this.cameraTween.startTarget,
          this.cameraTween.endTarget,
          ease
        );
        this.camera.lookAt(this.controls.target);

        if (rawT >= 1) {
          this.cameraTween = null;
          if (!this.inSeatView) {
            this.controls.update();
          }
        }
      } else if (this.inSeatView) {
        this.applySeatedFreeLook();
      } else {
        this.controls.update();
      }

      this.postPipeline.render(this.scene, this.camera, dt);
    };

    tick();
  }

  public dispose(): void {
    cancelAnimationFrame(this.animationFrameId);
    this.renderer.dispose();
  }
}
