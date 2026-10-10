import type { JSX } from 'preact';
import {
  isMobile,
  navigatorOpen,
  stagePanelOpen,
  toast,
} from '../../state/shell-store.ts';
import type { TheatreSceneController } from '../../theatre/theatre-scene.ts';
import { HelpOverlay } from './HelpOverlay.tsx';
import { ReferenceLightboxModal } from './ReferenceLightboxModal.tsx';
import { SeatWalkOverlay } from './SeatWalkOverlay.tsx';
import { SeatingNavigator } from './SeatingNavigator.tsx';
import { StagePanel } from './StagePanel.tsx';
import { ToolDock } from './ToolDock.tsx';
import { TopBar } from './TopBar.tsx';
import { WorkshopModal } from './WorkshopModal.tsx';
import { ShellContext } from './shell-context.ts';

function Toast(): JSX.Element | null {
  const t = toast.value;
  if (!t) return null;
  return (
    <div class="shell-toast" role="status" aria-live="polite" key={t.id}>
      {t.text}
    </div>
  );
}

function MobileScrim(): JSX.Element | null {
  if (!isMobile.value || !(navigatorOpen.value || stagePanelOpen.value)) {
    return null;
  }
  return (
    <div
      class="shell-scrim"
      onClick={() => {
        navigatorOpen.value = false;
        stagePanelOpen.value = false;
      }}
    />
  );
}

export interface AppShellProps {
  readonly sceneCtrl: TheatreSceneController;
}

export function AppShell({ sceneCtrl }: AppShellProps): JSX.Element {
  return (
    <ShellContext.Provider value={sceneCtrl}>
      <TopBar />
      <MobileScrim />
      <SeatingNavigator />
      <StagePanel />
      <ToolDock />
      <SeatWalkOverlay />
      <Toast />
      <WorkshopModal />
      <ReferenceLightboxModal />
      <HelpOverlay />
    </ShellContext.Provider>
  );
}
