import * as THREE from 'three';
import {
  createAliceRayStageFloorTexture,
  createBarnWoodTexture,
  createChalkboardTexture,
  createLibraryBooksTexture,
  createSchoolOfRockFloorTexture,
  createVelourCurtainTexture,
  createYellowBrickTexture,
} from '../engine/procedural-textures.ts';
import type {
  CustomSetPiece,
  ProductionId,
  ProductionSpec,
} from '../types/theatre.ts';
import { aliceInWonderlandSet } from './alice-in-wonderland.ts';
import { charlottesWebSet } from './charlottes-web.ts';
import { rebuildCustomSetPiecesGroup } from './custom-set-pieces.ts';
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

export { DEFAULT_RIGGING_BATTENS } from './shared-scenic-helpers.ts';

export const PRODUCTION_SET_MODULES: ReadonlyArray<ProductionSetModule> = [
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
  readonly aliceFloorTexture: THREE.CanvasTexture;
  readonly schoolOfRockFloorTexture: THREE.CanvasTexture;
  setActiveProduction(id: ProductionId): ProductionSpec;
  getActiveProduction(): ProductionSpec;
  setElementVisibility(elementId: string, visible: boolean): void;
  isElementVisible(elementId: string): boolean;
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
    color: 0x3b0f4c,
    emissive: 0x160a2c,
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
    group.visible = mod.spec.id === 'school-of-rock';
    root.add(group);
    productionGroups.set(mod.spec.id, group);
  }

  // Custom Set Piece Authoring Layer
  const customPiecesGroup = new THREE.Group();
  customPiecesGroup.name = 'CustomDesignerSetPieces';
  root.add(customPiecesGroup);

  let activeProductionId: ProductionId = 'school-of-rock';

  return {
    root,
    customPiecesGroup,
    cycMesh,
    aliceFloorTexture: textures.aliceFloorTexture,
    schoolOfRockFloorTexture: textures.schoolOfRockFloorTexture,

    setActiveProduction(id: ProductionId): ProductionSpec {
      activeProductionId = id;
      for (const [pid, grp] of productionGroups.entries()) {
        grp.visible = pid === id;
      }
      const spec =
        PRODUCTION_CATALOG.find((p) => p.id === id) ?? PRODUCTION_CATALOG[0]!;
      cycMat.color.setHex(spec.cycBottomColor);
      cycMat.emissive.setHex(spec.cycTopColor);
      return spec;
    },

    getActiveProduction(): ProductionSpec {
      return (
        PRODUCTION_CATALOG.find((p) => p.id === activeProductionId) ??
        PRODUCTION_CATALOG[0]!
      );
    },

    setElementVisibility(elementId: string, visible: boolean): void {
      elementVisibility.set(elementId, visible);
      const nodes = elementNodes.get(elementId) ?? [];
      for (const n of nodes) {
        n.visible = visible;
      }
    },

    isElementVisible(elementId: string): boolean {
      return elementVisibility.get(elementId) ?? true;
    },

    setBattenTrimHeight(lineNumber: number, trimHeightM: number): void {
      const clamped = Math.max(0, Math.min(6.8, trimHeightM));
      battenTrims.set(lineNumber, clamped);
      const nodes = battenNodes.get(lineNumber) ?? [];
      for (const n of nodes) {
        n.position.y = clamped;
      }
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
