import { computed, signal, type ReadonlySignal, type Signal } from '@preact/signals';
import type * as THREE from 'three';
import { PRODUCTION_CATALOG } from '../sets/index.ts';
import type { GraphicsQualityMode, TheatreSceneController } from '../theatre/theatre-scene.ts';
import type {
  AudienceEyeMode,
  CameraPresetId,
  ChartColorMode,
  LightingState,
  ProductionElementSpec,
  ProductionSceneCue,
  ProductionSpec,
  SeatRecord,
  SeatSightlineMetrics,
} from '../types/theatre.ts';

/**
 * UI-shell state (TopBar, Left 533-Seat Navigator, Right Stage & Workshop Panel,
 * ToolDock, SeatWalkOverlay, WorkshopModal, ReferenceLightboxModal, HelpOverlay, Toast).
 *
 * Modeled after Crox Farmhouse's Preact signals architecture so UI components
 * subscribe granularly without imperative DOM polling.
 */

export const MOBILE_BREAKPOINT_PX = 900;
export const WIDE_DESKTOP_BREAKPOINT_PX = 1180;

const LS_HELP_SEEN = 'mccoll.ui.helpSeen.v1';

const INITIAL_PRODUCTION: ProductionSpec = PRODUCTION_CATALOG[0]!;
const INITIAL_SCENE: ProductionSceneCue =
  INITIAL_PRODUCTION.scenes[1] ?? INITIAL_PRODUCTION.scenes[0]!;

function isMobileViewport(): boolean {
  return typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT_PX;
}

function isWideDesktopViewport(): boolean {
  return typeof window !== 'undefined' && window.innerWidth > WIDE_DESKTOP_BREAKPOINT_PX;
}

function readLocal(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocal(key: string, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Storage may be unavailable in private browsing
  }
}

export function hasSeenHelp(): boolean {
  return readLocal(LS_HELP_SEEN) === '1';
}

export function markHelpSeen(): void {
  writeLocal(LS_HELP_SEEN, '1');
}

// ---------------------------------------------------------------------------
// Layout & Drawer Signals
// ---------------------------------------------------------------------------

export const isMobile: Signal<boolean> = signal<boolean>(isMobileViewport());
export const navigatorOpen: Signal<boolean> = signal<boolean>(isWideDesktopViewport());
export const stagePanelOpen: Signal<boolean> = signal<boolean>(!isMobileViewport());

export function toggleNavigator(): void {
  const next = !navigatorOpen.value;
  navigatorOpen.value = next;
  if (next && isMobile.value) {
    stagePanelOpen.value = false;
  }
}

export function toggleStagePanel(): void {
  const next = !stagePanelOpen.value;
  stagePanelOpen.value = next;
  if (next && isMobile.value) {
    navigatorOpen.value = false;
  }
}

if (typeof window !== 'undefined') {
  const syncViewportFlags = (): void => {
    const mobile = isMobileViewport();
    if (mobile !== isMobile.value) {
      isMobile.value = mobile;
      if (mobile) {
        navigatorOpen.value = false;
        stagePanelOpen.value = false;
      } else {
        stagePanelOpen.value = true;
        navigatorOpen.value = isWideDesktopViewport();
      }
    } else if (mobile && navigatorOpen.value && stagePanelOpen.value) {
      navigatorOpen.value = false;
    }
  };
  window.addEventListener('resize', syncViewportFlags);
  window.addEventListener('orientationchange', syncViewportFlags);
}

// ---------------------------------------------------------------------------
// Theatre Scene & Production Signals
// ---------------------------------------------------------------------------

export interface HoveredSeatInfo {
  readonly seat: SeatRecord;
  readonly x: number;
  readonly y: number;
}

export interface HoveredScenicElementInfo {
  readonly element: ProductionElementSpec;
  readonly subUnitLabel?: string;
  readonly x: number;
  readonly y: number;
}

export interface WorkshopTargetInfo {
  readonly element: ProductionElementSpec;
  readonly objectGroup: THREE.Object3D;
  readonly subUnitId?: string;
}

export interface LightboxMediaInfo {
  readonly badge: string;
  readonly title: string;
  readonly imgUrl: string;
}

export interface ToastMessage {
  readonly id: number;
  readonly text: string;
}

export const activeProduction: Signal<ProductionSpec> =
  signal<ProductionSpec>(INITIAL_PRODUCTION);

export const activeScene: Signal<ProductionSceneCue> =
  signal<ProductionSceneCue>(INITIAL_SCENE);

/** Bumped whenever element visibility or rigging batten trims change. */
export const elementVisibilityRevision: Signal<number> = signal<number>(0);

export const selectedSeatMetrics: Signal<SeatSightlineMetrics | null> =
  signal<SeatSightlineMetrics | null>(null);

export const hoveredSeat: Signal<{ seat: SeatRecord; x: number; y: number } | null> =
  signal<{ seat: SeatRecord; x: number; y: number } | null>(null);

export const hoveredScenicElement: Signal<{
  element: ProductionElementSpec;
  subUnitLabel?: string;
  x: number;
  y: number;
} | null> = signal<{
  element: ProductionElementSpec;
  subUnitLabel?: string;
  x: number;
  y: number;
} | null>(null);

export const inSeatView: Signal<boolean> = signal<boolean>(false);

export const activeCameraPreset: Signal<CameraPresetId | null> =
  signal<CameraPresetId | null>('house-overview');

export const eyeMode: Signal<AudienceEyeMode> = signal<AudienceEyeMode>('child');

export const chartColorMode: Signal<ChartColorMode> =
  signal<ChartColorMode>('section');

export const sightlineLaserEnabled: Signal<boolean> = signal<boolean>(false);

export const cadGridEnabled: Signal<boolean> = signal<boolean>(false);

export const orchestraPitOpen: Signal<boolean> = signal<boolean>(false);

export const stageTrapsOpen: Signal<boolean> = signal<boolean>(false);

export const balconyOverhangGuidesVisible: Signal<boolean> = signal<boolean>(false);

export const grandDrapeOpenFraction: Signal<number> = signal<number>(1.0);

export const lightingState: Signal<LightingState> = signal<LightingState>({
  preset: 'show-mode',
  houseLevel: 0.25,
  fohRailLevel: 0.92,
  followSpotLevel: 0.96,
  stageElectricsLevel: 0.95,
  cycWashLevel: 0.9,
  apronFootlightsLevel: 0.72,
  practicalsLevel: 1.12,
  spotBeamsVisible: true,
  gelPresetId: 'cue-default',
  spotColorHex: '#f4dec0',
  washColorHex: '#d8c6e8',
  cycColorHex: '#6c88d4',
  apronColorHex: '#9ab4e8',
});

export const graphicsQuality: Signal<GraphicsQualityMode> =
  signal<GraphicsQualityMode>('ultra');

export const workshopTarget: Signal<{
  element: ProductionElementSpec;
  objectGroup: THREE.Object3D;
  subUnitId?: string;
} | null> = signal<{
  element: ProductionElementSpec;
  objectGroup: THREE.Object3D;
  subUnitId?: string;
} | null>(null);

export const lightboxMedia: Signal<{
  badge: string;
  title: string;
  imgUrl: string;
} | null> = signal<{ badge: string; title: string; imgUrl: string } | null>(null);

export const helpOpen: Signal<boolean> = signal<boolean>(false);
export const helpStep: Signal<number> = signal<number>(0);

export const toast: Signal<{ id: number; text: string } | null> =
  signal<{ id: number; text: string } | null>(null);

export const activeSceneIndex: ReadonlySignal<number> = computed(() => {
  const scenes = activeProduction.value.scenes;
  const idx = scenes.findIndex((s) => s.id === activeScene.value.id);
  return idx >= 0 ? idx : 0;
});

export const hasAnyModalOpen: ReadonlySignal<boolean> = computed(
  () =>
    workshopTarget.value !== null ||
    lightboxMedia.value !== null ||
    helpOpen.value
);

// ---------------------------------------------------------------------------
// Toast & Overlay Helpers
// ---------------------------------------------------------------------------

let toastSeq = 0;
let toastTimer: ReturnType<typeof setTimeout> | null = null;

export function showToast(text: string, durationMs = 2600): void {
  toastSeq += 1;
  const id = toastSeq;
  toast.value = { id, text };
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    if (toast.value?.id === id) {
      toast.value = null;
    }
  }, durationMs);
}

export function clearHoverTooltips(): void {
  hoveredSeat.value = null;
  hoveredScenicElement.value = null;
}

export function openHelp(step = 0): void {
  clearHoverTooltips();
  helpStep.value = step;
  helpOpen.value = true;
}

/** Closes the top-most modal or mobile drawer. Returns true if something was closed. */
export function closeTopOverlay(): boolean {
  if (lightboxMedia.value !== null) {
    lightboxMedia.value = null;
    return true;
  }
  if (workshopTarget.value !== null) {
    workshopTarget.value = null;
    return true;
  }
  if (helpOpen.value) {
    helpOpen.value = false;
    markHelpSeen();
    return true;
  }
  if (isMobile.value && (navigatorOpen.value || stagePanelOpen.value)) {
    navigatorOpen.value = false;
    stagePanelOpen.value = false;
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Scene Controller Bridge Helpers
// ---------------------------------------------------------------------------

export function openWorkshopForElementId(
  sceneCtrl: TheatreSceneController,
  elementId: string,
  subUnitId?: string
): void {
  clearHoverTooltips();
  const target = sceneCtrl.getScenicElementTarget(elementId);
  if (target) {
    workshopTarget.value = {
      element: target.element,
      objectGroup: target.objectGroup,
      subUnitId,
    };
  }
}

export function openWorkshopForActiveScene(sceneCtrl: TheatreSceneController): void {
  const spec = sceneCtrl.getActiveProduction();
  const scene = sceneCtrl.getActiveSceneCue();
  const visibleElements = spec.elements.filter((el) =>
    scene.visibleElementIds.includes(el.id)
  );
  const preferred =
    visibleElements.find(
      (el) =>
        el.category === 'wagon' ||
        el.category === 'portal' ||
        el.category === 'furniture' ||
        el.category === 'props'
    ) ??
    visibleElements[0] ??
    spec.elements[0];
  if (preferred) {
    openWorkshopForElementId(sceneCtrl, preferred.id);
  }
}

export function syncStoreFromSceneController(
  sceneCtrl: TheatreSceneController
): void {
  activeProduction.value = sceneCtrl.getActiveProduction();
  activeScene.value = sceneCtrl.getActiveSceneCue();
  elementVisibilityRevision.value += 1;
  selectedSeatMetrics.value = sceneCtrl.getSelectedSeatMetrics();
  inSeatView.value = sceneCtrl.isInSeatView();
  eyeMode.value = sceneCtrl.getEyeMode();
  chartColorMode.value = sceneCtrl.getChartColorMode();
  sightlineLaserEnabled.value = sceneCtrl.isSightlineLaserEnabled();
  cadGridEnabled.value = sceneCtrl.isCadGridEnabled();
  orchestraPitOpen.value = sceneCtrl.isOrchestraPitOpen();
  stageTrapsOpen.value = sceneCtrl.isStageTrapsOpen();
  balconyOverhangGuidesVisible.value = sceneCtrl.isBalconyOverhangGuidesVisible();
  grandDrapeOpenFraction.value = sceneCtrl.getGrandDrapeOpenFraction();
  lightingState.value = sceneCtrl.getLightingState();
  graphicsQuality.value = sceneCtrl.getGraphicsQuality();
}
