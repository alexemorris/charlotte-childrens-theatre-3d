import type { JSX } from 'preact';
import { helpOpen, helpStep, markHelpSeen } from '../../state/shell-store.ts';
import { Icon, type IconName } from './icons.tsx';

interface HelpStepSpec {
  readonly icon: IconName;
  readonly title: string;
  readonly body: string;
  readonly tips: readonly string[];
}

const STEPS: readonly HelpStepSpec[] = [
  {
    icon: 'stage',
    title: '3D Stage & House Navigation',
    body: 'Drag to orbit around the Hugh McColl Family Theatre proscenium, right-drag to pan, and scroll or pinch to zoom.',
    tips: [
      'Use the bottom Tool Dock to switch between Overview, Proscenium, Top Plan, Stage → House, Balcony, Fly Grid, and Sit (Seat)',
      'Toggle the Left 533-Seat Navigator and Right Stage & Workshop Panel anytime from the Top Bar',
    ],
  },
  {
    icon: 'seat',
    title: '533-Seat Sightlines & Child Eye Height',
    body: 'Click any of the 533 seats in the 3D auditorium—or on the Left 2D Seating Chart—to sit in 1st-person audience view.',
    tips: [
      'Press C (or click the Top Bar eye toggle) to compare Child (0.96m) vs. Adult (1.18m) seated eye height',
      'Press L to project 3D Sightline Laser Rays and press R while seated to recenter your gaze to Center Stage',
    ],
  },
  {
    icon: 'sparkles',
    title: 'Scene Cues ([ / ]) & 52-Lineset Fly Rigging',
    body: 'Step scene-by-scene through all 7 productions with [ and ] or the Top Bar & Right Panel cue sequencers.',
    tips: [
      'Inspect physical Model Box photos and 1/4" = 1\'-0" CAD Ground Plans from the Scene card',
      'Adjust production counterweight batten trims, Grand Drape, and 5 stage lighting channels in the Rigging & Lights tab',
    ],
  },
  {
    icon: 'cnc',
    title: 'Scenic Workshop & 4\'×8\' CNC Fabrication',
    body: 'Click any scenic unit directly on the 3D stage (or in the Right Panel) to inspect its granular sub-units and fabrication plan.',
    tips: [
      'Separates 3-axis 4\'×8\' Plywood CNC router profiles from Timber Carpentry framing, Soft Goods/Scenic Paint drops, and Props',
      'Download true-scale AutoCAD .DXF, Vector .SVG, 1:24 3D Model .STL, and Cut-List BOM .CSV files directly in the browser',
    ],
  },
];

export const KEYBOARD_SHORTCUTS: readonly { readonly keys: string; readonly action: string }[] = [
  { keys: 'Drag / Right-drag / Scroll', action: 'Orbit / Pan / Zoom 3D stage & auditorium' },
  { keys: 'Click any seat', action: 'Enter 1st-person seated sightline view (533 seats)' },
  { keys: 'Click any scenic unit', action: 'Open Scenic Workshop & 4\'×8\' CNC Fabrication Modal' },
  { keys: '[ / ]', action: 'Previous / Next production scene cue' },
  { keys: 'C', action: 'Toggle Child (0.96m) vs. Adult (1.18m) seated eye height' },
  { keys: 'L', action: 'Toggle 3D sightline laser rays from active seat' },
  { keys: 'G', action: 'Toggle 1m × 1m CAD stage floor grid & centerline' },
  { keys: 'R', action: 'Recenter 1st-person seated gaze to Center Stage' },
  { keys: '← / → / ↑ / ↓', action: 'Step seat left/right or row closer/further while seated' },
  { keys: '?', action: 'Open this interactive guide & keyboard shortcuts' },
  { keys: 'Esc', action: 'Close modal or return from Seat View to 3D Orbit' },
];

export function HelpOverlay(): JSX.Element | null {
  if (!helpOpen.value) return null;

  const step = Math.min(STEPS.length - 1, Math.max(0, helpStep.value));
  const s = STEPS[step]!;
  const isLast = step === STEPS.length - 1;

  const close = (): void => {
    helpOpen.value = false;
    markHelpSeen();
  };

  return (
    <div class="shell-modal-backdrop shell-help-backdrop" onClick={close}>
      <div
        class="shell-help shell-glass"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shell-help-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          class="shell-icon-btn shell-help-close"
          aria-label="Close help"
          title="Close (Esc)"
          onClick={close}
        >
          <Icon name="close" />
        </button>

        <div class="shell-help-icon">
          <Icon name={s.icon} size={30} />
        </div>

        <p class="shell-help-step">
          Step {step + 1} of {STEPS.length}
        </p>

        <h2 id="shell-help-title">{s.title}</h2>
        <p class="shell-help-body">{s.body}</p>

        <ul class="shell-help-tips">
          {s.tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>

        <div class="shell-help-shortcuts">
          <div class="shell-help-shortcuts-title">QUICK KEYBOARD SHORTCUTS</div>
          <dl class="shell-shortcuts">
            {KEYBOARD_SHORTCUTS.map((sc) => (
              <div key={sc.keys} class="shell-shortcut">
                <dt>
                  <kbd>{sc.keys}</kbd>
                </dt>
                <dd>{sc.action}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div class="shell-help-dots" role="tablist" aria-label="Tutorial steps">
          {STEPS.map((x, i) => (
            <button
              key={x.title}
              type="button"
              role="tab"
              aria-selected={i === step}
              aria-label={`Step ${i + 1}: ${x.title}`}
              class={`shell-help-dot${i === step ? ' is-active' : ''}`}
              onClick={() => {
                helpStep.value = i;
              }}
            />
          ))}
        </div>

        <div class="shell-help-actions">
          <button type="button" class="shell-btn" onClick={close}>
            Close
          </button>
          <div class="shell-help-nav">
            {step > 0 && (
              <button
                type="button"
                class="shell-btn"
                onClick={() => {
                  helpStep.value = step - 1;
                }}
              >
                Back
              </button>
            )}
            <button
              type="button"
              class="shell-btn shell-btn-primary"
              onClick={() => {
                if (isLast) close();
                else helpStep.value = step + 1;
              }}
            >
              {isLast ? 'Start exploring' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
