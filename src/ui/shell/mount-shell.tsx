import { effect } from '@preact/signals';
import { render } from 'preact';
import {
  closeTopOverlay,
  hasAnyModalOpen,
  helpOpen,
  helpStep,
  inSeatView,
  isMobile,
  markHelpSeen,
  navigatorOpen,
  openHelp,
  stagePanelOpen,
  syncStoreFromSceneController,
} from '../../state/shell-store.ts';
import type { TheatreSceneController } from '../../theatre/theatre-scene.ts';
import { AppShell } from './AppShell.tsx';

function isTypingTarget(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return el instanceof HTMLElement && el.isContentEditable;
}

/** Reflects Preact shell state onto document.body classes for responsive layout. */
function bindBodyClasses(): void {
  const body = document.body;
  effect(() => {
    body.classList.toggle('is-mobile', isMobile.value);
  });
  effect(() => {
    body.classList.toggle('has-nav', navigatorOpen.value && !isMobile.value);
  });
  effect(() => {
    body.classList.toggle('has-panel', stagePanelOpen.value && !isMobile.value);
  });
  effect(() => {
    body.classList.toggle('is-seated', inSeatView.value);
  });
}

/**
 * Global keyboard shortcuts for the Preact shell:
 * - `?`: Open/toggle Help & Keyboard Shortcuts overlay
 * - `Escape`: Close top modal (Lightbox, Workshop/CNC, Help, Mobile drawer) or exit Seat View
 * - `G`: Toggle 1m × 1m CAD stage floor grid
 * - Syncs store signals whenever scene keyboard shortcuts (`[`, `]`, `C`, `L`, Arrows) run
 */
function bindShellKeyboard(sceneCtrl: TheatreSceneController): void {
  window.addEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(document.activeElement)) {
        if (e.key === 'Escape' && document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        return;
      }

      if (e.key === 'Escape') {
        if (closeTopOverlay()) {
          e.preventDefault();
          e.stopImmediatePropagation();
          return;
        }
        if (sceneCtrl.isInSeatView()) {
          e.preventDefault();
          e.stopImmediatePropagation();
          sceneCtrl.exitSeatViewToOrbit();
          syncStoreFromSceneController(sceneCtrl);
          return;
        }
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (helpOpen.value) {
          closeTopOverlay();
        } else {
          openHelp(0);
        }
        return;
      }

      if (helpOpen.value && !e.repeat) {
        if (e.key === 'ArrowRight' || e.key === 'Enter') {
          e.preventDefault();
          e.stopImmediatePropagation();
          if (helpStep.value < 3) {
            helpStep.value += 1;
          } else {
            helpOpen.value = false;
            markHelpSeen();
          }
          return;
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          e.stopImmediatePropagation();
          if (helpStep.value > 0) {
            helpStep.value -= 1;
          }
          return;
        }
      }

      // Prevent background 3D scene shortcuts while any modal is open
      if (hasAnyModalOpen.value) {
        e.stopImmediatePropagation();
        return;
      }

      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        sceneCtrl.setCadGridEnabled(!sceneCtrl.isCadGridEnabled());
        syncStoreFromSceneController(sceneCtrl);
        return;
      }

      // Synchronize Preact store after TheatreSceneController handles C, L, [, ], or Arrows
      queueMicrotask(() => {
        syncStoreFromSceneController(sceneCtrl);
      });
    },
    { capture: true }
  );
}

/**
 * Mounts the Preact AppShell into `#shell-root` and synchronizes initial state
 * from `TheatreSceneController`.
 */
export function mountShell(
  sceneCtrl: TheatreSceneController,
  root?: HTMLElement | null
): void {
  const targetRoot = root ?? document.getElementById('shell-root');
  if (!targetRoot) {
    throw new Error('Missing #shell-root mount container');
  }

  syncStoreFromSceneController(sceneCtrl);
  bindBodyClasses();
  bindShellKeyboard(sceneCtrl);
  render(<AppShell sceneCtrl={sceneCtrl} />, targetRoot);
}
