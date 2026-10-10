import * as THREE from 'three';
import {
  createGrinchPreShowScrimTexture,
  createSeussianRockHatchTexture,
} from '../engine/procedural-textures.ts';
import type {
  ProductionElementSpec,
  ProductionSceneCue,
  ProductionSpec,
} from '../types/theatre.ts';
import {
  buildGrinchCavePortal,
  buildGrinchMylarCurtain,
} from './grinch/grinch-cave.ts';
import { buildPapaWhosHouseUnit } from './grinch/papa-whos-house.ts';
import {
  buildGrinchPreShowScrim,
  buildGrinchSnowPortals,
  buildGrinchWhovilleHillsAndCrumpit,
} from './grinch/portals-and-hills.ts';
import {
  buildGrinchFinaleBanquet,
  buildGrinchMtCrumpitSleigh,
  buildGrinchOffstageStorage,
  buildGrinchShoppingCounters,
} from './grinch/shopping-crumpit-finale.ts';
import {
  buildGrinchChristmasSign,
  buildGrinchWhovilleHouses,
  buildGrinchWhovilleTree,
} from './grinch/whoville-town.ts';
import type { ProductionSetBuilderContext, ProductionSetModule } from './types.ts';

const GRINCH_ELEMENTS: ReadonlyArray<ProductionElementSpec> = [
  {
    id: 'grinch-snow-floor',
    name: 'Painted Seussian Snow Stage Floor Cloth',
    category: 'backdrop',
    defaultVisible: true,
    dimensionsLabel: '18.0m × 11.2m Deck',
  },
  {
    id: 'grinch-snow-portals',
    name: 'DS Left & Right Sculpted Snow-Cliff Portals & Ice Waves',
    category: 'portal',
    defaultVisible: true,
    dimensionsLabel: '5.4m H Tormentors',
  },
  {
    id: 'grinch-preshow-scrim',
    name: `Line #1 (0'-10") · Pre-Show Storybook Scrim`,
    category: 'backdrop',
    battenLine: 1,
    defaultVisible: false,
    dimensionsLabel: '12.6m × 7.0m Scrim',
  },
  {
    id: 'grinch-whoville-hills-cyc',
    name: 'Line #39/#45 · Whoville Snow Hills & Mt. Crumpit Peak',
    category: 'backdrop',
    defaultVisible: true,
    dimensionsLabel: '14.2m × 6.4m Groundrow',
  },
  {
    id: 'grinch-whoville-houses',
    name: '3 Pink Whoville Round Houses (DSR, USR & MSL Wagons)',
    category: 'wagon',
    defaultVisible: true,
    dimensionsLabel: '3 × 2.8m H Wagons',
  },
  {
    id: 'grinch-whoville-tree',
    name: 'Center Whoville Christmas Tree & Presents Turntable',
    category: 'wagon',
    defaultVisible: true,
    dimensionsLabel: '4.6m H Center Tree',
  },
  {
    id: 'grinch-christmas-sign',
    name: `Line #15 (10'-6") · "MERRY CHRISTMAS WHOVILLE" Banner`,
    category: 'fly-rig',
    battenLine: 3,
    defaultVisible: true,
    dimensionsLabel: '4.8m × 1.3m Banner',
  },
  {
    id: 'grinch-cave-portal',
    name: `Line #17 (11'-10") · Grinch's Cave Jagged Ice Arch & Vista`,
    category: 'portal',
    battenLine: 4,
    defaultVisible: false,
    dimensionsLabel: '11.4m × 5.8m Cave Drop',
  },
  {
    id: 'grinch-mylar-curtain',
    name: `Line #19 (13'-2") · Grinch's Cave Metallic Mylar Curtain`,
    category: 'backdrop',
    battenLine: 5,
    defaultVisible: false,
    dimensionsLabel: '6.2m × 3.8m Mylar',
  },
  {
    id: 'grinch-papa-whos-house',
    name: `Line #9 (6'-6") · Papa Who's House + Fridge, Tree & Daybed`,
    category: 'portal',
    battenLine: 2,
    defaultVisible: false,
    dimensionsLabel: '8.4m × 5.2m House Unit',
  },
  {
    id: 'grinch-papa-whos-scrim-mode',
    name: `Line #9 (6'-6") · Papa Who's House Scrim Reveal (Mean One)`,
    category: 'portal',
    battenLine: 2,
    defaultVisible: false,
    dimensionsLabel: 'Translucent Frame Reveal',
  },
  {
    id: 'grinch-shopping-counters',
    name: '3 Whoville Department Store Counters & Candy-Cane Signs',
    category: 'wagon',
    defaultVisible: false,
    dimensionsLabel: '3 × 2.4m Store Wagons',
  },
  {
    id: 'grinch-mt-crumpit-sleigh',
    name: 'Mt. Crumpit Cliff Wagon & Overstuffed Red Sleigh Sack',
    category: 'wagon',
    defaultVisible: false,
    dimensionsLabel: '3.6m H Cliff & Sleigh',
  },
  {
    id: 'grinch-finale-banquet',
    name: 'Finale Curved Blue & White Whoville Feast Banquet Table',
    category: 'furniture',
    defaultVisible: false,
    dimensionsLabel: '5.4m Curved Table',
  },
  {
    id: 'grinch-offstage-storage',
    name: 'CAD Offstage Prop & Wagon Storage Bays (USR & SL Wing)',
    category: 'wagon',
    defaultVisible: true,
    dimensionsLabel: 'Backstage CAD Layout',
  },
];

const GRINCH_SCENES: ReadonlyArray<ProductionSceneCue> = [
  {
    id: 'grinch-scene-1a-preshow',
    sceneNumber: '1A',
    title: 'Pre-Show (Storybook Scrim)',
    actLabel: 'Sheet 1A · Pre-Show',
    synopsis:
      'Downstage Scrim (Lineset #1 at 0\'-10") is flown in with projected posters for "Charlotte\'s Web", "Dr. Seuss\' How The Grinch Stole Christmas!", and "Beneath the Baobab Tree" flanked by the sculpted snow-cliff portals.',
    visibleElementIds: [
      'grinch-snow-floor',
      'grinch-snow-portals',
      'grinch-preshow-scrim',
      'grinch-whoville-hills-cyc',
      'grinch-whoville-houses',
      'grinch-offstage-storage',
    ],
    battenTrimHeightsM: { 1: 0.0, 2: 6.8, 3: 6.8, 4: 6.8, 5: 6.8 },
    grandDrapeOpenFraction: 1.0,
    stageWashColor: 0x9b88e6,
    stageSpotColor: 0xc2b0f0,
    cycTopColor: 0x261a54,
    cycBottomColor: 0x523e9c,
    houseLevel: 0.45,
    modelPhotoUrl: 'reference/grinch/model_1A_preshow.jpg',
    groundPlanUrl: 'reference/grinch/plan_1A_preshow.jpg',
  },
  {
    id: 'grinch-scene-1b-whoville',
    sceneNumber: '1B',
    title: 'Whoville Town Square',
    actLabel: 'Sheet 1B · Scene 1',
    synopsis:
      'Pre-Show Scrim flies out to reveal the 3 pink Whoville Round Houses (DSR, USR, MSL), the Center Whoville Christmas Tree surrounded by presents, and the "MERRY CHRISTMAS WHOVILLE" banner on Lineset #15 (10\'-6").',
    visibleElementIds: [
      'grinch-snow-floor',
      'grinch-snow-portals',
      'grinch-whoville-hills-cyc',
      'grinch-whoville-houses',
      'grinch-whoville-tree',
      'grinch-christmas-sign',
      'grinch-offstage-storage',
    ],
    battenTrimHeightsM: { 1: 6.8, 2: 6.8, 3: 0.0, 4: 6.8, 5: 6.8 },
    grandDrapeOpenFraction: 1.0,
    stageWashColor: 0xd8c6e8,
    stageSpotColor: 0xf4dec0,
    cycTopColor: 0x3b58a8,
    cycBottomColor: 0x6c88d4,
    houseLevel: 0.25,
    modelPhotoUrl: 'reference/grinch/model_1B_whoville.jpg',
    groundPlanUrl: 'reference/grinch/plan_1B_whoville.jpg',
  },
  {
    id: 'grinch-scene-1c-cave-vista',
    sceneNumber: '1C',
    title: "Grinch's Cave (Distant Whoville Vista)",
    actLabel: 'Sheet 1C · Scene 2A',
    synopsis:
      'Grinch\'s Cave jagged ice portal flies in on Lineset #17 (11\'-10"). Through the icicle cave mouth, forced-perspective miniature Whoville houses and tree glow on a snowy hill below Mt. Crumpit.',
    visibleElementIds: [
      'grinch-snow-floor',
      'grinch-snow-portals',
      'grinch-cave-portal',
      'grinch-offstage-storage',
    ],
    battenTrimHeightsM: { 1: 6.8, 2: 6.8, 3: 6.8, 4: 0.0, 5: 6.8 },
    grandDrapeOpenFraction: 1.0,
    stageWashColor: 0x6e9ce8,
    stageSpotColor: 0x9ec0f4,
    cycTopColor: 0x141d3b,
    cycBottomColor: 0x4c68ac,
    houseLevel: 0.15,
    modelPhotoUrl: 'reference/grinch/model_1C_cave_vista.jpg',
    groundPlanUrl: 'reference/grinch/plan_1C_cave.jpg',
  },
  {
    id: 'grinch-scene-1c-cave-mylar',
    sceneNumber: '1C·2',
    title: "Grinch's Cave (Mylar Streamer Curtain)",
    actLabel: 'Sheet 1C · Scene 2B',
    synopsis:
      'Lineset #19 (13\'-2") Mylar Curtain drops immediately behind the Grinch\'s Cave icicle arch, closing off the distant vista with shimmering metallic gold and silver streamers.',
    visibleElementIds: [
      'grinch-snow-floor',
      'grinch-snow-portals',
      'grinch-cave-portal',
      'grinch-mylar-curtain',
      'grinch-offstage-storage',
    ],
    battenTrimHeightsM: { 1: 6.8, 2: 6.8, 3: 6.8, 4: 0.0, 5: 0.0 },
    grandDrapeOpenFraction: 1.0,
    stageWashColor: 0x7aa4e8,
    stageSpotColor: 0xe8bc72,
    cycTopColor: 0x101426,
    cycBottomColor: 0x2a3660,
    houseLevel: 0.14,
    modelPhotoUrl: 'reference/grinch/model_1C_cave_mylar.jpg',
    groundPlanUrl: 'reference/grinch/plan_1C_cave.jpg',
  },
  {
    id: 'grinch-scene-1h-whos-house',
    sceneNumber: '1H',
    title: "Who's House — I Hate Christmas",
    actLabel: 'Sheet 1H · Scene 3',
    synopsis:
      'Papa Who\'s House flies in on Lineset #9 (6\'-6") with its olive-green Seussian timber frame, glowing fireplace & stockings, DSR Refrigerator & Table, Who Christmas Tree, and DSL blue Daybed.',
    visibleElementIds: [
      'grinch-snow-floor',
      'grinch-snow-portals',
      'grinch-whoville-hills-cyc',
      'grinch-papa-whos-house',
      'grinch-offstage-storage',
    ],
    battenTrimHeightsM: { 1: 6.8, 2: 0.0, 3: 6.8, 4: 6.8, 5: 6.8 },
    grandDrapeOpenFraction: 1.0,
    stageWashColor: 0xe6d2b8,
    stageSpotColor: 0xf2dfc0,
    cycTopColor: 0x425ca8,
    cycBottomColor: 0x8674b8,
    houseLevel: 0.22,
    modelPhotoUrl: 'reference/grinch/model_1H_whos_house_day.jpg',
    groundPlanUrl: 'reference/grinch/plan_1H_whos_house.jpg',
  },
  {
    id: 'grinch-scene-1d-shopping',
    sceneNumber: '1D',
    title: 'Shopping in Whoville',
    actLabel: 'Sheet 1D · Scene 4',
    synopsis:
      'Whoville Town Square bursts into holiday shopping frenzy as 3 blue arched Department Store Counters with crooked green candy-cane signs roll in front of the 3 pink Who houses.',
    visibleElementIds: [
      'grinch-snow-floor',
      'grinch-snow-portals',
      'grinch-whoville-hills-cyc',
      'grinch-whoville-houses',
      'grinch-whoville-tree',
      'grinch-christmas-sign',
      'grinch-shopping-counters',
      'grinch-offstage-storage',
    ],
    battenTrimHeightsM: { 1: 6.8, 2: 6.8, 3: 0.0, 4: 6.8, 5: 6.8 },
    grandDrapeOpenFraction: 1.0,
    stageWashColor: 0xd8c2e4,
    stageSpotColor: 0xf0dcba,
    cycTopColor: 0x3b58a8,
    cycBottomColor: 0x6c88d4,
    houseLevel: 0.25,
    modelPhotoUrl: 'reference/grinch/model_1D_shopping.jpg',
    groundPlanUrl: 'reference/grinch/plan_1D_shopping.jpg',
  },
  {
    id: 'grinch-scene-1e-mean-one',
    sceneNumber: '1E',
    title: "Who's House — He's a Mean One, Mr. Grinch",
    actLabel: 'Sheet 1E · Scene 5 (Scrim Reveal)',
    synopsis:
      'Papa Who\'s House walls turn translucent via backlit scrim panels, revealing the glowing pink Whoville houses behind the timber framing while the Grinch steals the family\'s Christmas feast and tree.',
    visibleElementIds: [
      'grinch-snow-floor',
      'grinch-snow-portals',
      'grinch-whoville-hills-cyc',
      'grinch-whoville-houses',
      'grinch-papa-whos-scrim-mode',
      'grinch-offstage-storage',
    ],
    battenTrimHeightsM: { 1: 6.8, 2: 0.0, 3: 6.8, 4: 6.8, 5: 6.8 },
    grandDrapeOpenFraction: 1.0,
    stageWashColor: 0x72d896,
    stageSpotColor: 0xb2e67c,
    cycTopColor: 0x382878,
    cycBottomColor: 0x6852ac,
    houseLevel: 0.16,
    modelPhotoUrl: 'reference/grinch/model_1E_mean_one_scrim.jpg',
    groundPlanUrl: 'reference/grinch/plan_1E_mean_one.jpg',
  },
  {
    id: 'grinch-scene-1f-mt-crumpit',
    sceneNumber: '1F',
    title: "Grinch's Cave 2 & Mt. Crumpit Sleigh Cliff",
    actLabel: 'Sheet 1F · Scene 6',
    synopsis:
      'The steep icy-blue Mt. Crumpit Cliff Wagon rolls out onto Downstage Left with the Grinch\'s sleigh and giant overstuffed crimson sack of stolen presents balanced on the snowy precipice.',
    visibleElementIds: [
      'grinch-snow-floor',
      'grinch-snow-portals',
      'grinch-whoville-hills-cyc',
      'grinch-mt-crumpit-sleigh',
      'grinch-offstage-storage',
    ],
    battenTrimHeightsM: { 1: 6.8, 2: 6.8, 3: 6.8, 4: 6.8, 5: 6.8 },
    grandDrapeOpenFraction: 1.0,
    stageWashColor: 0x82a8e8,
    stageSpotColor: 0xe69cb0,
    cycTopColor: 0x2c428c,
    cycBottomColor: 0x5c74bc,
    houseLevel: 0.18,
    modelPhotoUrl: 'reference/grinch/model_1F_mt_crumpit_sleigh.jpg',
    groundPlanUrl: 'reference/grinch/plan_1F_cave2_crumpit.jpg',
  },
  {
    id: 'grinch-scene-1g-finale',
    sceneNumber: '1G',
    title: 'Finale — Christmas Feast in Whoville',
    actLabel: 'Sheet 1G · Scene 7 (Finale)',
    synopsis:
      'Two pink Who houses (USR & MSL), the restored Center Whoville Christmas Tree, the "MERRY CHRISTMAS WHOVILLE" banner on Lineset #15, and the curved blue-and-white Feast Banquet Table at Center Stage.',
    visibleElementIds: [
      'grinch-snow-floor',
      'grinch-snow-portals',
      'grinch-whoville-hills-cyc',
      'grinch-whoville-houses',
      'grinch-whoville-tree',
      'grinch-christmas-sign',
      'grinch-finale-banquet',
      'grinch-offstage-storage',
    ],
    battenTrimHeightsM: { 1: 6.8, 2: 6.8, 3: 0.0, 4: 6.8, 5: 6.8 },
    grandDrapeOpenFraction: 1.0,
    stageWashColor: 0xe8d4b8,
    stageSpotColor: 0xf4e4c8,
    cycTopColor: 0x3b58a8,
    cycBottomColor: 0x8c78a8,
    houseLevel: 0.32,
    modelPhotoUrl: 'reference/grinch/model_1G_finale.jpg',
    groundPlanUrl: 'reference/grinch/plan_1G_finale.jpg',
  },
];

export const grinchSpec: ProductionSpec = {
  id: 'grinch',
  title: "Dr. Seuss's How The Grinch Stole Christmas!",
  subtitle: "Children's Theatre of Charlotte · Scenic Design by Andrew Gibbon",
  playwrightOrComposer: 'Book & Lyrics by Timothy Mason · Music by Mel Marvin',
  ageRecommendation: 'All Ages (4+)',
  description:
    'Recreated directly from Children\'s Theatre of Charlotte\'s 22-slide Scenic Design package (Director: Jenn Poarch, Scenic Designer: Andrew Gibbon, TD: Shane Burgett). Features all 9 scene configurations (Sheets 1A–1H) with the 52-lineset counterweight schedule, Pre-Show Storybook Scrim (#1), Papa Who\'s House with backlit scrim reveal (#9), "MERRY CHRISTMAS WHOVILLE" Banner (#15), Grinch\'s Cave (#17), Mylar Curtain (#19), Whoville Round Houses, Shopping Counters, Mt. Crumpit Sleigh Cliff, and Finale Banquet.',
  scenicNotes:
    'Step through all 9 scenes (Sheets 1A–1H) using the Scene Sequencer. Each scene updates onstage wagons, counterweight batten trims (#1, #9, #15, #17, #19), stage lighting cues, and displays the corresponding 1/4" CAD Ground Plan and Model Box reference photo.',
  cycTopColor: 0x3b58a8,
  cycBottomColor: 0x6c88d4,
  stageWashColor: 0xd8c6e8,
  stageSpotColor: 0xf4dec0,
  apronWashColor: 0x9ab4e8,
  elements: GRINCH_ELEMENTS,
  scenes: GRINCH_SCENES,
};

export function buildGrinchSet({
  registerElement: registerCtxElement,
}: ProductionSetBuilderContext): THREE.Group {
  const root = new THREE.Group();
  root.name = 'Prod_grinch';

  const registerElement = (
    id: string,
    obj: THREE.Object3D,
    battenLine?: number
  ): void => {
    root.add(obj);
    registerCtxElement(id, obj, battenLine);
  };

  const rockTex = createSeussianRockHatchTexture();
  const preshowScrimTex = createGrinchPreShowScrimTexture();

  // 1. Downstage Left & Right Sculpted Seussian Snow-Cliff Portals & Ice Waves
  const portalsGroup = buildGrinchSnowPortals(rockTex);
  registerElement('grinch-snow-portals', portalsGroup);

  // 2. Lineset #1 (0'-10") Pre-Show Storybook Scrim (Sheet 1A)
  const preshowScrimGroup = buildGrinchPreShowScrim(preshowScrimTex);
  registerElement('grinch-preshow-scrim', preshowScrimGroup, 1);

  // 3. Upstage Whoville Snow Hills & Mt. Crumpit Peak (Linesets #39 / #45)
  const hillsGroup = buildGrinchWhovilleHillsAndCrumpit(rockTex);
  registerElement('grinch-whoville-hills-cyc', hillsGroup);

  // 4. 3 Pink Whoville Round Houses (DSR, USR, MSL Wagons — Sheet 1B)
  const housesGroup = buildGrinchWhovilleHouses(rockTex);
  registerElement('grinch-whoville-houses', housesGroup);

  // 5. Center Whoville Christmas Tree & Presents Turntable (Sheets 1B, 1D, 1G)
  const treeWagonGroup = buildGrinchWhovilleTree(rockTex);
  registerElement('grinch-whoville-tree', treeWagonGroup);

  // 6. Lineset #15 (10'-6") "MERRY CHRISTMAS WHOVILLE" Banner (Sheets 1B, 1D, 1G)
  const signGroup = buildGrinchChristmasSign();
  registerElement('grinch-christmas-sign', signGroup, 3);

  // 7. Lineset #17 (11'-10") Grinch's Cave Jagged Ice Arch & Distant Vista (Sheets 1C & 1F)
  const caveGroup = buildGrinchCavePortal(rockTex);
  caveGroup.visible = false;
  registerElement('grinch-cave-portal', caveGroup, 4);

  // 8. Lineset #19 (13'-2") Grinch's Cave Metallic Mylar Streamer Curtain (Sheet 1C·2)
  const mylarGroup = buildGrinchMylarCurtain();
  mylarGroup.visible = false;
  registerElement('grinch-mylar-curtain', mylarGroup, 5);

  // 9. Lineset #9 (6'-6") Papa Who's House — Solid Mode (Sheet 1H)
  const papaWhosHouseSolid = buildPapaWhosHouseUnit(rockTex, false);
  papaWhosHouseSolid.name = 'Element_grinch-papa-whos-house';
  papaWhosHouseSolid.visible = false;
  registerElement('grinch-papa-whos-house', papaWhosHouseSolid, 2);

  // 10. Lineset #9 (6'-6") Papa Who's House — Scrim Reveal Mode (Sheet 1E)
  const papaWhosHouseScrim = buildPapaWhosHouseUnit(rockTex, true);
  papaWhosHouseScrim.name = 'Element_grinch-papa-whos-scrim-mode';
  papaWhosHouseScrim.visible = false;
  registerElement('grinch-papa-whos-scrim-mode', papaWhosHouseScrim, 2);

  // 11. 3 Whoville Department Store Counters & Candy-Cane Signs (Sheet 1D)
  const shoppingGroup = buildGrinchShoppingCounters(rockTex);
  shoppingGroup.visible = false;
  registerElement('grinch-shopping-counters', shoppingGroup);

  // 12. Mt. Crumpit Cliff Wagon & Overstuffed Red Sleigh Sack (Sheet 1F)
  const crumpitSleighGroup = buildGrinchMtCrumpitSleigh(rockTex);
  crumpitSleighGroup.visible = false;
  registerElement('grinch-mt-crumpit-sleigh', crumpitSleighGroup);

  // 13. Finale Curved Blue & White Whoville Feast Banquet Table (Sheet 1G)
  const finaleBanquetGroup = buildGrinchFinaleBanquet();
  finaleBanquetGroup.visible = false;
  registerElement('grinch-finale-banquet', finaleBanquetGroup);

  // 14. CAD Offstage Prop & Wagon Storage Bays (USR & SL Wing)
  const offstageStorageGroup = buildGrinchOffstageStorage(rockTex);
  registerElement('grinch-offstage-storage', offstageStorageGroup);

  return root;
}

export const grinchSet: ProductionSetModule = {
  spec: grinchSpec,
  build: buildGrinchSet,
};
