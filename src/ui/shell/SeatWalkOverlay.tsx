import type { JSX } from 'preact';
import {
  activeScene,
  eyeMode,
  hasAnyModalOpen,
  hoveredScenicElement,
  hoveredSeat,
  inSeatView,
  isMobile,
  selectedSeatMetrics,
  sightlineLaserEnabled,
  syncStoreFromSceneController,
} from '../../state/shell-store.ts';
import type { SightlineGrade } from '../../types/theatre.ts';
import { Icon } from './icons.tsx';
import { useShell } from './shell-context.ts';

function formatSightlineGrade(grade: SightlineGrade): string {
  switch (grade) {
    case 'optimal':
      return 'OPTIMAL';
    case 'good':
      return 'GOOD';
    case 'partial-overhang':
      return 'OVERHANG TRIM';
    case 'extreme-side':
      return 'SIDE ANGLE';
  }
}

function PointerHoverTooltip(): JSX.Element | null {
  if (hasAnyModalOpen.value) {
    return null;
  }

  const seatHover = hoveredSeat.value;
  const scenicHover = hoveredScenicElement.value;

  if (!seatHover && !scenicHover) {
    return null;
  }

  const rawX = seatHover ? seatHover.x : (scenicHover?.x ?? 0);
  const rawY = seatHover ? seatHover.y : (scenicHover?.y ?? 0);
  const maxX = typeof window !== 'undefined' ? window.innerWidth - 280 : rawX + 14;
  const maxY = typeof window !== 'undefined' ? window.innerHeight - 54 : rawY + 14;
  const left = Math.max(8, Math.min(maxX, rawX + 14));
  const top = Math.max(8, Math.min(maxY, rawY + 14));

  return (
    <div
      class="seat-hover-tooltip shell-hover-tooltip"
      role="status"
      aria-live="polite"
      style={{
        left: `${left}px`,
        top: `${top}px`,
      }}
    >
      {seatHover ? (
        <>
          <strong>{seatHover.seat.sectionTitle}</strong> · Row{' '}
          {seatHover.seat.rowLabel} · Seat {seatHover.seat.seatNumber}{' '}
          <span class="hover-tooltip-cta-seat">(Click to Sit)</span>
        </>
      ) : scenicHover ? (
        <>
          <strong>{scenicHover.subUnitLabel ?? scenicHover.element.name}</strong> ·{' '}
          {scenicHover.subUnitLabel
            ? scenicHover.element.name
            : scenicHover.element.dimensionsLabel}{' '}
          <span class="hover-tooltip-cta-scenic">
            (Click to Inspect Unit &amp; CNC)
          </span>
        </>
      ) : null}
    </div>
  );
}

export function SeatWalkOverlay(): JSX.Element | null {
  const sceneCtrl = useShell();
  const seated = inSeatView.value;
  const metrics = selectedSeatMetrics.value;
  const currentEye = eyeMode.value;
  const lasersOn = sightlineLaserEnabled.value;
  const scene = activeScene.value;

  if (!seated) {
    return <PointerHoverTooltip />;
  }

  const seatLabel = metrics
    ? `${metrics.seat.sectionTitle} · Row ${metrics.seat.rowLabel} · Seat ${metrics.seat.seatNumber}`
    : 'Main Floor · Row G · Seat 108';
  const grade = metrics?.grade ?? 'optimal';
  const scoreText = metrics
    ? `${metrics.overallScore}% ${formatSightlineGrade(metrics.grade)}`
    : '99% OPTIMAL';

  const sceneCode = scene.sceneNumber ?? scene.sceneLabel ?? '1';

  return (
    <>
      <PointerHoverTooltip />
      <div
        class="shell-seat-overlay shell-glass"
        role="region"
        aria-label="1st-Person Seated Sightline Controls"
      >
        <div class="shell-seat-bar">
          <div class="shell-seat-brand">
            <Icon name="seat" size={16} />
            <span class="shell-seat-readout">{seatLabel}</span>
            <span class={`seat-score-badge grade-${grade}`}>{scoreText}</span>
          </div>

          <div class="shell-seat-actions">
            <div
              class="shell-seg shell-seg-sm"
              role="group"
              aria-label="Scene cue stepper"
            >
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
                title={`${sceneCode} · ${scene.title}`}
              >
                {sceneCode} · {scene.title}
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

            <button
              type="button"
              class={`shell-btn shell-btn-sm${currentEye === 'child' ? ' is-active' : ''}`}
              aria-pressed={currentEye === 'child'}
              title="Toggle Seated Eye Height between Child (0.96m) and Adult (1.18m) (Shortcut: C)"
              onClick={() => {
                const next = currentEye === 'child' ? 'adult' : 'child';
                sceneCtrl.setEyeMode(next);
                syncStoreFromSceneController(sceneCtrl);
              }}
            >
              <Icon name="eye" size={14} />
              <span>
                {currentEye === 'child' ? 'Child 0.96m' : 'Adult 1.18m'}
              </span>
            </button>

            <div
              class="shell-seg shell-seg-sm"
              role="group"
              aria-label="Step seat in row"
            >
              <button
                type="button"
                class="shell-seg-btn"
                title="Previous Seat in Row (Left Arrow)"
                onClick={() => {
                  sceneCtrl.stepSelectedSeatInRow(-1);
                  syncStoreFromSceneController(sceneCtrl);
                }}
              >
                ← Seat
              </button>
              <button
                type="button"
                class="shell-seg-btn"
                title="Next Seat in Row (Right Arrow)"
                onClick={() => {
                  sceneCtrl.stepSelectedSeatInRow(1);
                  syncStoreFromSceneController(sceneCtrl);
                }}
              >
                Seat →
              </button>
            </div>

            <div
              class="shell-seg shell-seg-sm"
              role="group"
              aria-label="Step row"
            >
              <button
                type="button"
                class="shell-seg-btn"
                title="Step 1 Row Closer to Stage (Up Arrow)"
                onClick={() => {
                  sceneCtrl.stepSelectedSeatRow(-1);
                  syncStoreFromSceneController(sceneCtrl);
                }}
              >
                ↑ Row
              </button>
              <button
                type="button"
                class="shell-seg-btn"
                title="Step 1 Row Further Back (Down Arrow)"
                onClick={() => {
                  sceneCtrl.stepSelectedSeatRow(1);
                  syncStoreFromSceneController(sceneCtrl);
                }}
              >
                ↓ Row
              </button>
            </div>

            <button
              type="button"
              class="shell-btn shell-btn-sm"
              title="Recenter 1st-Person Seated Gaze to Center Stage (Shortcut: R)"
              onClick={() => {
                sceneCtrl.resetSeatedLook();
              }}
            >
              <Icon name="target" size={14} />
              <span>Recenter</span>
            </button>

            <button
              type="button"
              class={`shell-btn shell-btn-sm${lasersOn ? ' is-active' : ''}`}
              aria-pressed={lasersOn}
              title="Toggle 3D Sightline Laser Rays to Stage Targets (Shortcut: L)"
              onClick={() => {
                sceneCtrl.setSightlineLaserEnabled(!lasersOn);
                syncStoreFromSceneController(sceneCtrl);
              }}
            >
              <Icon name="laser" size={14} />
              <span>3D Lasers</span>
            </button>

            <button
              type="button"
              class="shell-btn shell-btn-sm shell-walk-exit"
              title="Exit 1st-Person Seat View back to 3D Orbit Camera (Esc)"
              onClick={() => {
                sceneCtrl.exitSeatViewToOrbit();
                syncStoreFromSceneController(sceneCtrl);
              }}
            >
              <Icon name="close" size={14} />
              <span>Exit Seat (Esc)</span>
            </button>
          </div>
        </div>

        <div class="shell-seat-hints">
          <span>
            <strong>{isMobile.value ? 'Swipe' : 'Drag'}</strong> to look around
            stage &amp; proscenium
          </span>
          {!isMobile.value && (
            <span>
              · <kbd>R</kbd> Recenter · <kbd>[</kbd> <kbd>]</kbd> Scene ·{' '}
              <kbd>←</kbd> <kbd>→</kbd> Seat · <kbd>↑</kbd> <kbd>↓</kbd> Row ·{' '}
              <kbd>C</kbd> Child/Adult Eye · <kbd>L</kbd> Lasers ·{' '}
              <kbd>Esc</kbd> Orbit
            </span>
          )}
        </div>
      </div>
    </>
  );
}
