import type { JSX } from 'preact';
import {
  activeCameraPreset,
  cadGridEnabled,
  inSeatView,
  isMobile,
  openWorkshopForActiveScene,
  sightlineLaserEnabled,
  syncStoreFromSceneController,
  workshopTarget,
} from '../../state/shell-store.ts';
import type { CameraPresetId } from '../../types/theatre.ts';
import { Icon, type IconName } from './icons.tsx';
import { useShell } from './shell-context.ts';

interface QuickCameraOption {
  readonly id: CameraPresetId;
  readonly label: string;
  readonly icon: IconName;
  readonly hint: string;
}

const QUICK_CAMERAS: readonly QuickCameraOption[] = [
  {
    id: 'house-overview',
    label: 'Overview',
    icon: 'cube',
    hint: '3D auditorium & proscenium overview',
  },
  {
    id: 'stage-front',
    label: 'Proscenium',
    icon: 'stage',
    hint: 'Center orchestra proscenium elevation',
  },
  {
    id: 'from-stage-to-house',
    label: 'Stage → House',
    icon: 'eye',
    hint: 'Performer perspective looking out into the 533-seat house',
  },
  {
    id: 'lower-balcony-center',
    label: 'Balcony',
    icon: 'seat',
    hint: 'Lower balcony center rail perspective',
  },
  {
    id: 'fly-loft-grid',
    label: 'Fly Grid',
    icon: 'up',
    hint: '52-lineset counterweight fly loft & rigging view',
  },
];

export function ToolDock(): JSX.Element | null {
  const sceneCtrl = useShell();

  if (inSeatView.value) {
    return null;
  }

  const camPreset = activeCameraPreset.value;
  const lasersOn = sightlineLaserEnabled.value;
  const gridOn = cadGridEnabled.value;
  const workshopOpen = workshopTarget.value !== null;

  const hintText = isMobile.value
    ? '1-finger orbit · Tap any seat to sit · Tap any scenic unit for Workshop & CNC files'
    : 'Drag to orbit · Click any of the 533 seats to sit · Click any scenic unit on stage for Workshop & CNC files';

  return (
    <div class="shell-dock-wrap">
      <div class="shell-dock-hint" aria-live="polite">
        {hintText}
      </div>
      <nav class="shell-dock" aria-label="Quick Camera & Stage Tools">
        {QUICK_CAMERAS.map((c) => {
          const isActive = camPreset === c.id;
          return (
            <button
              key={c.id}
              type="button"
              class={`shell-dock-btn${isActive ? ' is-active' : ''}`}
              aria-pressed={isActive}
              title={c.hint}
              onClick={() => {
                sceneCtrl.setCameraPreset(c.id);
                activeCameraPreset.value = c.id;
                syncStoreFromSceneController(sceneCtrl);
              }}
            >
              <Icon name={c.icon} size={18} />
              <span>{c.label}</span>
            </button>
          );
        })}

        <span class="shell-dock-sep" aria-hidden="true" />

        <button
          type="button"
          class={`shell-dock-btn${lasersOn ? ' is-active' : ''}`}
          aria-pressed={lasersOn}
          title="Toggle 3D sightline laser rays from selected seat to stage targets (L)"
          onClick={() => {
            sceneCtrl.setSightlineLaserEnabled(!lasersOn);
            syncStoreFromSceneController(sceneCtrl);
          }}
        >
          <Icon name="laser" size={18} />
          <span>3D Lasers</span>
        </button>

        <button
          type="button"
          class={`shell-dock-btn${gridOn ? ' is-active' : ''}`}
          aria-pressed={gridOn}
          title="Toggle 1m × 1m CAD coordinate grid on stage floor"
          onClick={() => {
            sceneCtrl.setCadGridEnabled(!gridOn);
            syncStoreFromSceneController(sceneCtrl);
          }}
        >
          <Icon name="grid" size={18} />
          <span>CAD Grid</span>
        </button>

        <button
          type="button"
          class={`shell-dock-btn is-cnc${workshopOpen ? ' is-active' : ''}`}
          aria-pressed={workshopOpen}
          title="Open Scenic Workshop & CNC Fabrication Plan for the primary scenic unit of the active scene"
          onClick={() => {
            openWorkshopForActiveScene(sceneCtrl);
          }}
        >
          <Icon name="cnc" size={18} />
          <span>Workshop / CNC</span>
        </button>
      </nav>
    </div>
  );
}
