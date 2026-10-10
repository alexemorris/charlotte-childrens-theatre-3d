import * as THREE from 'three';
import {
  createAliceRayStageFloorTexture,
  createBarnWoodTexture,
  createChalkboardTexture,
  createGrinchSnowFloorTexture,
  createLibraryBooksTexture,
  createSchoolOfRockFloorTexture,
  createVelourCurtainTexture,
  createYellowBrickTexture,
} from '../engine/procedural-textures.ts';
import type {
  CustomSetPiece,
  ProductionElementSpec,
  ProductionId,
  ProductionSceneCue,
  ProductionSpec,
} from '../types/theatre.ts';
import { aliceInWonderlandSet } from './alice-in-wonderland.ts';
import { charlottesWebSet } from './charlottes-web.ts';
import { rebuildCustomSetPiecesGroup } from './custom-set-pieces.ts';
import { grinchSet } from './grinch.ts';
import { maryPoppinsSet } from './mary-poppins.ts';
import { matildaSet } from './matilda.ts';
import { narniaWardrobeSet } from './narnia-wardrobe.ts';
import { schoolOfRockSet } from './school-of-rock.ts';
import {
  buildSoftMaskingLegsAndBorders,
  DEFAULT_RIGGING_BATTENS,
} from './shared-scenic-helpers.ts';
import { techGridSandboxSet } from './tech-grid-sandbox.ts';
import type { ProductionSetModule, ScenicTexturesBundle } from './types.ts';

export { DEFAULT_RIGGING_BATTENS, MCCOLL_52_LINESET_SCHEDULE } from './shared-scenic-helpers.ts';

export const PRODUCTION_SET_MODULES: ReadonlyArray<ProductionSetModule> = [
  grinchSet,
  schoolOfRockSet,
  aliceInWonderlandSet,
  narniaWardrobeSet,
  charlottesWebSet,
  maryPoppinsSet,
  matildaSet,
  techGridSandboxSet,
];

export const PRODUCTION_CATALOG: ReadonlyArray<ProductionSpec> =
  PRODUCTION_SET_MODULES.map((m) => m.spec);

export interface ProductionSetsController {
  readonly root: THREE.Group;
  readonly customPiecesGroup: THREE.Group;
  readonly cycMesh: THREE.Mesh;
  readonly grinchSnowFloorTexture: THREE.CanvasTexture;
  readonly aliceFloorTexture: THREE.CanvasTexture;
  readonly schoolOfRockFloorTexture: THREE.CanvasTexture;
  setActiveProduction(id: ProductionId): ProductionSpec;
  getActiveProduction(): ProductionSpec;
  setActiveScene(sceneId: string): ProductionSceneCue;
  getActiveScene(): ProductionSceneCue;
  stepScene(delta: -1 | 1): ProductionSceneCue;
  setElementVisibility(elementId: string, visible: boolean): void;
  isElementVisible(elementId: string): boolean;
  getElementNodes(elementId: string): ReadonlyArray<THREE.Object3D>;
  pickScenicElementAtRay(raycaster: THREE.Raycaster): ProductionElementSpec | null;
  pickScenicTargetAtRay(
    raycaster: THREE.Raycaster
  ): { readonly element: ProductionElementSpec; readonly hitObject: THREE.Object3D } | null;
  setBattenTrimHeight(lineNumber: number, trimHeightM: number): void;
  getBattenTrimHeight(lineNumber: number): number;
  rebuildCustomSetPieces(
    pieces: ReadonlyArray<CustomSetPiece>,
    selectedPieceId: string | null
  ): void;
}

export function buildProductionSetsController(): ProductionSetsController {
  const root = new THREE.Group();
  root.name = 'ProductionSetsRoot';

  const textures: ScenicTexturesBundle = {
    grinchSnowFloorTexture: createGrinchSnowFloorTexture(),
    aliceFloorTexture: createAliceRayStageFloorTexture(),
    schoolOfRockFloorTexture: createSchoolOfRockFloorTexture(),
    chalkboardTex: createChalkboardTexture(),
    redVelourTex: createVelourCurtainTexture([156, 20, 30], 14),
    blackVelourTex: createVelourCurtainTexture([22, 24, 30], 12),
    barnWoodTex: createBarnWoodTexture(),
    libraryBooksTex: createLibraryBooksTexture(),
    yellowBrickTex: createYellowBrickTexture(),
  };

  // Upstage Cyclorama Screen (z = -9.1m)
  const cycMat = new THREE.MeshStandardMaterial({
    color: 0xd8e0ff,
    emissive: 0x8ea8f8,
    emissiveIntensity: 0.85,
    roughness: 0.9,
  });
  const cycMesh = new THREE.Mesh(new THREE.PlaneGeometry(16.4, 8.6), cycMat);
  cycMesh.position.set(0, 4.3, -9.1);
  root.add(cycMesh);

  const productionGroups = new Map<ProductionId, THREE.Group>();
  const elementNodes = new Map<string, THREE.Object3D[]>();
  const elementVisibility = new Map<string, boolean>();
  const battenNodes = new Map<number, THREE.Object3D[]>();
  const battenTrims = new Map<number, number>(
    DEFAULT_RIGGING_BATTENS.map((b) => [b.lineNumber, b.trimHeightM])
  );

  const registerElement = (
    id: string,
    obj: THREE.Object3D,
    battenLine?: number
  ): void => {
    obj.userData.scenicElementId = id;
    const list = elementNodes.get(id) ?? [];
    list.push(obj);
    elementNodes.set(id, list);
    elementVisibility.set(id, obj.visible);

    if (battenLine !== undefined) {
      const bList = battenNodes.get(battenLine) ?? [];
      bList.push(obj);
      battenNodes.set(battenLine, bList);
    }
  };

  // Shared Black Velour Soft Masking Legs & Borders (Batten Line 1)
  const maskingGroup = buildSoftMaskingLegsAndBorders(textures.blackVelourTex);
  root.add(maskingGroup);
  registerElement('black-velour-masking', maskingGroup, 1);

  // Build each modular production set from its dedicated file in src/sets/
  for (const mod of PRODUCTION_SET_MODULES) {
    const group = mod.build({ registerElement, textures });
    group.visible = mod.spec.id === 'grinch';
    root.add(group);
    productionGroups.set(mod.spec.id, group);
  }

  // Custom Set Piece Authoring Layer
  const customPiecesGroup = new THREE.Group();
  customPiecesGroup.name = 'CustomDesignerSetPieces';
  root.add(customPiecesGroup);

  let activeProductionId: ProductionId = 'grinch';
  let activeSceneByProd = new Map<ProductionId, string>();
  for (const mod of PRODUCTION_SET_MODULES) {
    const defaultScene =
      mod.spec.id === 'grinch'
        ? (mod.spec.scenes[1] ?? mod.spec.scenes[0])
        : mod.spec.scenes[0];
    if (defaultScene) {
      activeSceneByProd.set(mod.spec.id, defaultScene.id);
    }
  }

  const setElementVisibilityInternal = (
    elementId: string,
    visible: boolean
  ): void => {
    elementVisibility.set(elementId, visible);
    const nodes = elementNodes.get(elementId) ?? [];
    for (const n of nodes) {
      n.visible = visible;
    }
  };

  const setBattenTrimHeightInternal = (
    lineNumber: number,
    trimHeightM: number
  ): void => {
    const clamped = Math.max(0, Math.min(7.2, trimHeightM));
    battenTrims.set(lineNumber, clamped);
    const nodes = battenNodes.get(lineNumber) ?? [];
    for (const n of nodes) {
      n.position.y = clamped;
    }
  };

  const getActiveSpec = (): ProductionSpec =>
    PRODUCTION_CATALOG.find((p) => p.id === activeProductionId) ??
    PRODUCTION_CATALOG[0]!;

  const applySceneToSpec = (
    spec: ProductionSpec,
    scene: ProductionSceneCue
  ): void => {
    activeSceneByProd.set(spec.id, scene.id);
    const visibleSet = new Set(scene.visibleElementIds);
    for (const el of spec.elements) {
      setElementVisibilityInternal(el.id, visibleSet.has(el.id));
    }
    // Also toggle shared masking if not explicitly in spec.elements
    setElementVisibilityInternal(
      'black-velour-masking',
      visibleSet.has('black-velour-masking')
    );

    for (const b of DEFAULT_RIGGING_BATTENS) {
      const targetTrim = scene.battenTrimHeightsM?.[b.lineNumber] ?? 0;
      setBattenTrimHeightInternal(b.lineNumber, targetTrim);
    }

    cycMat.color.setHex(scene.cycBottomColor ?? spec.cycBottomColor);
    cycMat.emissive.setHex(scene.cycTopColor ?? spec.cycTopColor);
  };

  // Initialize default production & scene
  const initialSpec = getActiveSpec();
  const initialSceneId = activeSceneByProd.get(initialSpec.id);
  const initialScene =
    initialSpec.scenes.find((s) => s.id === initialSceneId) ??
    initialSpec.scenes[0]!;
  if (initialScene) {
    applySceneToSpec(initialSpec, initialScene);
  }

  return {
    root,
    customPiecesGroup,
    cycMesh,
    grinchSnowFloorTexture: textures.grinchSnowFloorTexture,
    aliceFloorTexture: textures.aliceFloorTexture,
    schoolOfRockFloorTexture: textures.schoolOfRockFloorTexture,

    setActiveProduction(id: ProductionId): ProductionSpec {
      activeProductionId = id;
      for (const [pid, grp] of productionGroups.entries()) {
        grp.visible = pid === id;
      }
      const spec = getActiveSpec();
      const savedSceneId = activeSceneByProd.get(id);
      const scene =
        spec.scenes.find((s) => s.id === savedSceneId) ?? spec.scenes[0];
      if (scene) {
        applySceneToSpec(spec, scene);
      } else {
        cycMat.color.setHex(spec.cycBottomColor);
        cycMat.emissive.setHex(spec.cycTopColor);
      }
      return spec;
    },

    getActiveProduction(): ProductionSpec {
      return getActiveSpec();
    },

    setActiveScene(sceneId: string): ProductionSceneCue {
      const spec = getActiveSpec();
      const scene =
        spec.scenes.find((s) => s.id === sceneId) ?? spec.scenes[0]!;
      applySceneToSpec(spec, scene);
      return scene;
    },

    getActiveScene(): ProductionSceneCue {
      const spec = getActiveSpec();
      const activeId = activeSceneByProd.get(spec.id);
      return (
        spec.scenes.find((s) => s.id === activeId) ?? spec.scenes[0]!
      );
    },

    stepScene(delta: -1 | 1): ProductionSceneCue {
      const spec = getActiveSpec();
      const scenes = spec.scenes;
      if (scenes.length === 0) {
        throw new Error(`No scenes defined for production ${spec.id}`);
      }
      const activeId = activeSceneByProd.get(spec.id);
      const curIdx = Math.max(
        0,
        scenes.findIndex((s) => s.id === activeId)
      );
      const nextIdx = (curIdx + delta + scenes.length) % scenes.length;
      const nextScene = scenes[nextIdx]!;
      applySceneToSpec(spec, nextScene);
      return nextScene;
    },

    setElementVisibility(elementId: string, visible: boolean): void {
      setElementVisibilityInternal(elementId, visible);
    },

    isElementVisible(elementId: string): boolean {
      return elementVisibility.get(elementId) ?? true;
    },

    getElementNodes(elementId: string): ReadonlyArray<THREE.Object3D> {
      return elementNodes.get(elementId) ?? [];
    },

    pickScenicTargetAtRay(
      raycaster: THREE.Raycaster
    ): { readonly element: ProductionElementSpec; readonly hitObject: THREE.Object3D } | null {
      const activeGroup = productionGroups.get(activeProductionId);
      if (!activeGroup || !activeGroup.visible) return null;

      const hits = raycaster.intersectObjects([activeGroup, maskingGroup], true);
      const spec = getActiveSpec();

      let fallbackFloorOrMasking: {
        readonly element: ProductionElementSpec;
        readonly hitObject: THREE.Object3D;
      } | null = null;

      for (const hit of hits) {
        // Verify full ancestor chain is visible
        let visibleChain = true;
        let matchedElementId: string | null = null;
        let curr: THREE.Object3D | null = hit.object;

        while (curr) {
          if (!curr.visible) {
            visibleChain = false;
            break;
          }
          if (!matchedElementId && typeof curr.userData?.scenicElementId === 'string') {
            matchedElementId = curr.userData.scenicElementId;
          }
          if (curr === root) break;
          curr = curr.parent;
        }

        if (!visibleChain || !matchedElementId) continue;

        const foundSpec = spec.elements.find((e) => e.id === matchedElementId) ?? null;
        if (!foundSpec) continue;

        const isFloorOrMasking =
          foundSpec.id.endsWith('-floor') || foundSpec.category === 'masking';
        if (isFloorOrMasking) {
          if (!fallbackFloorOrMasking) {
            fallbackFloorOrMasking = { element: foundSpec, hitObject: hit.object };
          }
          continue;
        }

        return { element: foundSpec, hitObject: hit.object };
      }

      return fallbackFloorOrMasking;
    },

    pickScenicElementAtRay(raycaster: THREE.Raycaster): ProductionElementSpec | null {
      return this.pickScenicTargetAtRay(raycaster)?.element ?? null;
    },

    setBattenTrimHeight(lineNumber: number, trimHeightM: number): void {
      setBattenTrimHeightInternal(lineNumber, trimHeightM);
    },

    getBattenTrimHeight(lineNumber: number): number {
      return battenTrims.get(lineNumber) ?? 0;
    },

    rebuildCustomSetPieces(
      pieces: ReadonlyArray<CustomSetPiece>,
      selectedPieceId: string | null
    ): void {
      rebuildCustomSetPiecesGroup(customPiecesGroup, pieces, selectedPieceId);
    },
  };
}

