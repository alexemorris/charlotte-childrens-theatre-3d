import type { JSX } from 'preact';
import {
  activeCameraPreset,
  activeProduction,
  activeScene,
  eyeMode,
  helpOpen,
  inSeatView,
  lightingState,
  navigatorOpen,
  selectedSeatMetrics,
  showToast,
  stagePanelOpen,
  syncStoreFromSceneController,
  toggleNavigator,
  toggleStagePanel,
} from '../../state/shell-store.ts';
import type {
  CameraPresetId,
  LightingPresetId,
  ProductionId,
} from '../../types/theatre.ts';
import { Icon, type IconName } from './icons.tsx';
import { useShell } from './shell-context.ts';

interface ViewOption {
  readonly id: 'house-overview' | 'stage-front' | 'ortho-ground-plan' | 'sit-g108';
  readonly label: string;
  readonly icon: IconName;
  readonly hint: string;
  readonly cameraPreset?: CameraPresetId;
}

const VIEW_OPTIONS: readonly ViewOption[] = [
  {
    id: 'house-overview',
    label: '3D Stage',
    icon: 'cube',
    hint: 'Perspective 3D auditorium & stage overview',
    cameraPreset: 'house-overview',
  },
  {
    id: 'stage-front',
    label: 'Front',
    icon: 'stage',
    hint: 'Direct front proscenium elevation view',
    cameraPreset: 'stage-front',
  },
  {
    id: 'ortho-ground-plan',
    label: 'Top Plan',
    icon: 'plan',
    hint: 'Top-down architectural ground plan view',
    cameraPreset: 'ortho-ground-plan',
  },
  {
    id: 'sit-g108',
    label: 'Sit (G-108)',
    icon: 'seat',
    hint: "Enter 1st-person seated sightline at Director's Chair (Row G Seat 108)",
  },
];

interface LightingOption {
  readonly id: LightingPresetId;
  readonly label: string;
  readonly icon: IconName;
  readonly hint: string;
}

const LIGHTING_OPTIONS: readonly LightingOption[] = [
  {
    id: 'show-mode',
    label: 'Show',
    icon: 'sparkles',
    hint: 'Show Mode theatrical cue lighting',
  },
  {
    id: 'work-lights',
    label: 'Work',
    icon: 'sun',
    hint: 'Full house & stage work lights',
  },
  {
    id: 'tech-rehearsal',
    label: 'Tech',
    icon: 'light',
    hint: 'Tech rehearsal balanced lighting',
  },
  {
    id: 'dramatic-cue',
    label: 'Drama',
    icon: 'moon',
    hint: 'High-contrast dramatic spotlight cue',
  },
];

const PRODUCTION_IDS: readonly ProductionId[] = [
  'grinch',
  'school-of-rock',
  'alice-in-wonderland',
  'narnia-wardrobe',
  'charlottes-web',
  'mary-poppins',
  'matilda',
  'tech-grid-sandbox',
];

function isProductionId(value: string): value is ProductionId {
  return PRODUCTION_IDS.some((id) => id === value);
}

export function TopBar(): JSX.Element {
  const sceneCtrl = useShell();
  const catalog = sceneCtrl.getProductionCatalog();
  const prod = activeProduction.value;
  const scene = activeScene.value;
  const seated = inSeatView.value;
  const camPreset = activeCameraPreset.value;
  const lightPreset = lightingState.value.preset;
  const currentEye = eyeMode.value;

  const sceneCode = scene.sceneNumber ?? scene.sceneLabel ?? '1';
  const sceneBadgeText = `${sceneCode} · ${scene.title}`;

  const handleShare = async (): Promise<void> => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('prod', prod.id);
      url.searchParams.set('scene', scene.id);
      const seatId = selectedSeatMetrics.value?.seat.id ?? 'MF-C-G-108';
      url.searchParams.set('seat', seatId);
      if (!seated && camPreset) {
        url.searchParams.set('cam', camPreset);
      } else {
        url.searchParams.delete('cam');
      }
      const shareUrl = url.toString();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch {
      // Clipboard write may fail in restricted contexts; still notify user
    }
    showToast('Copied shareable view link to clipboard');
  };

  return (
    <header class="shell-topbar" role="banner">
      <div class="shell-topbar-left">
        <button
          type="button"
          class={`shell-icon-btn${navigatorOpen.value ? ' is-active' : ''}`}
          title="533-Seat Sightline Navigator"
          aria-label="Toggle 533-Seat Sightline Navigator"
          aria-pressed={navigatorOpen.value}
          onClick={() => toggleNavigator()}
        >
          <Icon name="seat" />
        </button>
        <div class="shell-brand">
          <Icon name="stage" size={18} />
          <span class="shell-brand-name">McColl Family Theatre</span>
          <span class="shell-badge">533 Seats</span>
        </div>
      </div>

      <div class="shell-topbar-center">
        <label class="shell-viewas" title="Select active stage production">
          <span class="shell-viewas-label">Production</span>
          <select
            class="shell-select"
            value={prod.id}
            aria-label="Production selector"
            onChange={(e) => {
              const next = e.currentTarget.value;
              if (isProductionId(next)) {
                sceneCtrl.setProduction(next);
                syncStoreFromSceneController(sceneCtrl);
              }
            }}
          >
            {catalog.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </label>

        <div class="shell-seg shell-scene-stepper" role="group" aria-label="Scene cue stepper">
          <button
            type="button"
            class="shell-seg-btn"
            title="Previous Scene Cue ([)"
            aria-label="Previous Scene Cue"
            onClick={() => {
              sceneCtrl.stepSceneCue(-1);
              syncStoreFromSceneController(sceneCtrl);
            }}
          >
            ◀
          </button>
          <span
            class="shell-scene-badge"
            title={`Scene ${sceneBadgeText} — ${scene.synopsis}`}
          >
            {sceneBadgeText}
          </span>
          <button
            type="button"
            class="shell-seg-btn"
            title="Next Scene Cue (])"
            aria-label="Next Scene Cue"
            onClick={() => {
              sceneCtrl.stepSceneCue(1);
              syncStoreFromSceneController(sceneCtrl);
            }}
          >
            ▶
          </button>
        </div>

        <div class="shell-seg" role="group" aria-label="View mode">
          {VIEW_OPTIONS.map((v) => {
            const isActive =
              v.id === 'sit-g108'
                ? seated
                : !seated && camPreset === v.cameraPreset;
            return (
              <button
                key={v.id}
                type="button"
                class={`shell-seg-btn${isActive ? ' is-active' : ''}`}
                aria-pressed={isActive}
                title={v.hint}
                onClick={() => {
                  if (v.id === 'sit-g108') {
                    sceneCtrl.selectSeatById('MF-C-G-108', true);
                  } else if (v.cameraPreset) {
                    sceneCtrl.setCameraPreset(v.cameraPreset);
                  }
                  syncStoreFromSceneController(sceneCtrl);
                }}
              >
                <Icon name={v.icon} size={15} />
                <span class="shell-seg-label">{v.label}</span>
              </button>
            );
          })}
        </div>

        <div
          class="shell-seg shell-topbar-tod"
          role="group"
          aria-label="Lighting preset"
        >
          {LIGHTING_OPTIONS.map((o) => {
            const isActive = lightPreset === o.id;
            return (
              <button
                key={o.id}
                type="button"
                class={`shell-seg-btn${isActive ? ' is-active' : ''}`}
                aria-pressed={isActive}
                title={o.hint}
                onClick={() => {
                  sceneCtrl.setLightingPreset(o.id);
                  syncStoreFromSceneController(sceneCtrl);
                }}
              >
                <Icon name={o.icon} size={14} />
                <span class="shell-seg-label">{o.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div class="shell-topbar-right">
        <button
          type="button"
          class={`shell-btn${currentEye === 'child' ? ' is-active' : ''}`}
          title="Toggle Audience Seated Eye Height between Child (0.96m) and Adult (1.18m) (Shortcut: C)"
          aria-label="Toggle audience eye height"
          onClick={() => {
            const next = currentEye === 'child' ? 'adult' : 'child';
            sceneCtrl.setEyeMode(next);
            syncStoreFromSceneController(sceneCtrl);
          }}
        >
          <Icon name="eye" size={15} />
          <span class="shell-btn-label">
            {currentEye === 'child' ? 'Child 0.96m' : 'Adult 1.18m'}
          </span>
        </button>

        <button
          type="button"
          class="shell-btn shell-btn-primary"
          title="Copy a deep-link to this exact production, scene, and seat"
          onClick={() => {
            void handleShare();
          }}
        >
          <Icon name="share" size={16} />
          <span class="shell-btn-label">Share</span>
        </button>

        <button
          type="button"
          class={`shell-icon-btn${helpOpen.value ? ' is-active' : ''}`}
          title="Help & Keyboard Shortcuts (?)"
          aria-label="Help"
          aria-pressed={helpOpen.value}
          onClick={() => {
            helpOpen.value = true;
          }}
        >
          <Icon name="help" />
        </button>

        <button
          type="button"
          class={`shell-icon-btn${stagePanelOpen.value ? ' is-active' : ''}`}
          title="Stage, Scenic & Workshop Controls"
          aria-label="Toggle Stage & Scenic Shop Panel"
          aria-pressed={stagePanelOpen.value}
          onClick={() => toggleStagePanel()}
        >
          <Icon name="panel" />
        </button>
      </div>
    </header>
  );
}
