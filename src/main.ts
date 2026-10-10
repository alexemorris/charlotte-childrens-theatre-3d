import { TheatreSceneController } from './theatre/theatre-scene.ts';
import type { CameraPresetId, ProductionId } from './types/theatre.ts';
import { TheatreHudController } from './ui/hud.ts';

declare global {
  interface Window {
    __mccollTheatre?: TheatreSceneController;
  }
}

function updateLoadingProgress(pct: number, stepText: string): void {
  const bar = document.getElementById('loading-progress-bar');
  const txt = document.getElementById('loading-step-text');
  const pctEl = document.getElementById('loading-pct-text');
  if (bar) bar.style.width = `${pct}%`;
  if (txt) txt.textContent = stepText;
  if (pctEl) pctEl.textContent = `${pct}%`;
}

function hideLoadingScreen(): void {
  const screen = document.getElementById('loading-screen');
  if (screen) {
    screen.classList.add('is-hidden');
  }
}

async function bootstrap(): Promise<void> {
  const canvas = document.getElementById(
    'three-canvas'
  ) as HTMLCanvasElement | null;
  if (!canvas) {
    throw new Error('Missing #three-canvas element');
  }

  const params = new URLSearchParams(window.location.search);
  const keepLoadingScreen = params.get('loading') === '1';

  updateLoadingProgress(
    28,
    'Constructing Hugh McColl Family Theatre Proscenium & 570 Seats...'
  );

  let hud: TheatreHudController | null = null;

  const sceneCtrl = new TheatreSceneController(canvas, {
    onSeatSelected: (metrics, inSeatView) => {
      hud?.handleSeatSelected(metrics, inSeatView);
    },
    onSeatHovered: (seat, clientX, clientY) => {
      hud?.handleSeatHovered(seat, clientX, clientY);
    },
    onProductionChanged: (spec) => {
      hud?.handleProductionChanged(spec);
    },
    onSceneChanged: (scene, spec) => {
      hud?.handleSceneChanged(scene, spec);
    },
    onCustomPiecesChanged: () => {
      hud?.handleCustomPieceSelected();
    },
    onCameraModeChanged: (inSeatView, presetId) => {
      hud?.handleCameraModeChanged(inSeatView, presetId);
    },
  });

  updateLoadingProgress(
    68,
    'Rigging 8 Modular Production Sets & 52-Lineset Counterweight Schedule...'
  );

  hud = new TheatreHudController(sceneCtrl);

  // Support optional URL query params (?prod=..., ?scene=..., ?cam=..., ?seat=..., ?heatmap=1)
  const prodParam = params.get('prod') as ProductionId | null;
  if (prodParam) {
    sceneCtrl.setProduction(prodParam);
  }

  const sceneParam = params.get('scene');
  if (sceneParam) {
    const spec = sceneCtrl.getActiveProduction();
    const matched = spec.scenes.find(
      (s) =>
        s.id === sceneParam ||
        s.sceneNumber?.toLowerCase() === sceneParam.toLowerCase() ||
        s.sceneLabel?.toLowerCase() === sceneParam.toLowerCase()
    );
    if (matched) {
      sceneCtrl.setSceneCue(matched.id);
    }
  }

  const heatmapParam = params.get('heatmap');
  if (heatmapParam === '1') {
    sceneCtrl.setChartColorMode('sightline-heatmap');
  }

  const seatParam = params.get('seat');
  const camParam = params.get('cam') as CameraPresetId | null;
  if (seatParam) {
    sceneCtrl.selectSeatById(seatParam, true);
  } else {
    sceneCtrl.selectSeatById('MF-C-G-108', false);
    if (camParam) {
      sceneCtrl.setCameraPreset(camParam);
    }
  }

  updateLoadingProgress(
    94,
    'Warming HDR Post-Processing & ACES Filmic Tone Mapping...'
  );
  sceneCtrl.startRenderLoop();

  window.__mccollTheatre = sceneCtrl;

  if (!keepLoadingScreen) {
    setTimeout(() => {
      updateLoadingProgress(
        100,
        'Ready · Entering Hugh McColl Family Theatre 3D Viewport'
      );
      setTimeout(() => {
        hideLoadingScreen();
      }, 140);
    }, 180);
  }
}

bootstrap().catch((err: unknown) => {
  console.error('Failed to bootstrap McColl Family Theatre 3D Modeler:', err);
});
