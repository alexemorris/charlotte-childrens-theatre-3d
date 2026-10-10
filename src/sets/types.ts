import type * as THREE from 'three';
import type { ProductionSpec } from '../types/theatre.ts';

export type RegisterScenicElementFn = (
  elementId: string,
  object: THREE.Object3D,
  battenLine?: number
) => void;

export interface ScenicTexturesBundle {
  readonly aliceFloorTexture: THREE.CanvasTexture;
  readonly redVelourTex: THREE.CanvasTexture;
  readonly blackVelourTex: THREE.CanvasTexture;
  readonly barnWoodTex: THREE.CanvasTexture;
  readonly libraryBooksTex: THREE.CanvasTexture;
  readonly yellowBrickTex: THREE.CanvasTexture;
}

export interface ProductionSetBuilderContext {
  readonly registerElement: RegisterScenicElementFn;
  readonly textures: ScenicTexturesBundle;
}

export interface ProductionSetModule {
  readonly spec: ProductionSpec;
  build(ctx: ProductionSetBuilderContext): THREE.Group;
}
