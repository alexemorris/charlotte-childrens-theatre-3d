import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import type { TheatreSceneController } from '../../theatre/theatre-scene.ts';

export const ShellContext = createContext<TheatreSceneController | null>(null);

export function useShell(): TheatreSceneController {
  const sceneCtrl = useContext(ShellContext);
  if (!sceneCtrl) {
    throw new Error('useShell() must be used inside <ShellContext.Provider>');
  }
  return sceneCtrl;
}
