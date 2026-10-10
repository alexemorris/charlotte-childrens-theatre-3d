import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {
  createGrinchPreShowScrimTexture,
  createSeussianRockHatchTexture,
} from '../engine/procedural-textures.ts';
import type { ProductionElementSpec, ProductionSceneCue, ProductionSpec } from '../types/theatre.ts';
import { createHumanScaleFigure } from './shared-scenic-helpers.ts';
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
    stageWashColor: 0xbba8ff,
    stageSpotColor: 0xd8c8ff,
    cycTopColor: 0x3b2878,
    cycBottomColor: 0x7c64d4,
    houseLevel: 0.55,
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
    stageWashColor: 0xffe6f2,
    stageSpotColor: 0xfff2d6,
    cycTopColor: 0x8ea8f8,
    cycBottomColor: 0xd8e0ff,
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
    stageWashColor: 0x8ab8ff,
    stageSpotColor: 0xc4dcff,
    cycTopColor: 0x1a2448,
    cycBottomColor: 0x9cb4f0,
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
    stageWashColor: 0x98bfff,
    stageSpotColor: 0xffd088,
    cycTopColor: 0x14182e,
    cycBottomColor: 0x384678,
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
    stageWashColor: 0xffecd2,
    stageSpotColor: 0xfff4dc,
    cycTopColor: 0xa8bef8,
    cycBottomColor: 0xffe4f2,
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
    stageWashColor: 0xffdff0,
    stageSpotColor: 0xfff0cc,
    cycTopColor: 0x8ea8f8,
    cycBottomColor: 0xdce4ff,
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
    stageWashColor: 0x98ffb8,
    stageSpotColor: 0xd8ff98,
    cycTopColor: 0x6a58b8,
    cycBottomColor: 0xd8c8ff,
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
    stageWashColor: 0xa8c8ff,
    stageSpotColor: 0xffb8c8,
    cycTopColor: 0x7088e0,
    cycBottomColor: 0xd4dcff,
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
    stageWashColor: 0xfff0d8,
    stageSpotColor: 0xfff8e8,
    cycTopColor: 0x98b4ff,
    cycBottomColor: 0xffe2be,
    houseLevel: 0.35,
    modelPhotoUrl: 'reference/grinch/model_1G_finale.jpg',
    groundPlanUrl: 'reference/grinch/plan_1G_finale.jpg',
  },
];

export const grinchSpec: ProductionSpec = {
  id: 'grinch',
  title: "Dr. Seuss's How The Grinch Stole Christmas!",
  subtitle: 'Children\'s Theatre of Charlotte · Scenic Design by Andrew Gibbon',
  playwrightOrComposer: 'Book & Lyrics by Timothy Mason · Music by Mel Marvin',
  ageRecommendation: 'All Ages (4+)',
  description:
    'Recreated directly from Children\'s Theatre of Charlotte\'s 22-slide Scenic Design package (Director: Jenn Poarch, Scenic Designer: Andrew Gibbon, TD: Shane Burgett). Features all 9 scene configurations (Sheets 1A–1H) with the 52-lineset counterweight schedule, Pre-Show Storybook Scrim (#1), Papa Who\'s House with backlit scrim reveal (#9), "MERRY CHRISTMAS WHOVILLE" Banner (#15), Grinch\'s Cave (#17), Mylar Curtain (#19), Whoville Round Houses, Shopping Counters, Mt. Crumpit Sleigh Cliff, and Finale Banquet.',
  scenicNotes:
    'Step through all 9 scenes (Sheets 1A–1H) using the Scene Sequencer. Each scene updates onstage wagons, counterweight batten trims (#1, #9, #15, #17, #19), stage lighting cues, and displays the corresponding 1/4" CAD Ground Plan and Model Box reference photo.',
  cycTopColor: 0x8ea8f8,
  cycBottomColor: 0xd8e0ff,
  stageWashColor: 0xffe6f2,
  stageSpotColor: 0xfff2d6,
  apronWashColor: 0xd4dcff,
  elements: GRINCH_ELEMENTS,
  scenes: GRINCH_SCENES,
};

/**
 * Helper to build a curvy pink Seussian Whoville Round House wagon
 * with a scalloped snow roof, crooked chimney, arched door + wreath, and glowing windows.
 */
function createPinkWhovilleHouseWagon(
  widthM: number,
  heightM: number,
  rockTex: THREE.CanvasTexture,
  label: string
): THREE.Group {
  const g = new THREE.Group();
  g.name = `WhovillePinkHouse_${label}`;

  // Rolling caster wagon base (matching blue wagon rectangles on CAD ground plan)
  const wagonBase = new THREE.Mesh(
    new THREE.BoxGeometry(widthM + 0.35, 0.12, 1.05),
    new THREE.MeshStandardMaterial({ color: 0x262c3a, roughness: 0.65 })
  );
  wagonBase.position.y = 0.06;
  g.add(wagonBase);

  const pinkMat = new THREE.MeshStandardMaterial({
    color: 0xf45ca2,
    roughness: 0.52,
    metalness: 0.04,
  });
  const snowRoofMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    color: 0xeaf2ff,
    roughness: 0.55,
  });
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x181422 });
  const warmWindowMat = new THREE.MeshStandardMaterial({
    color: 0xffe878,
    emissive: 0xffb830,
    emissiveIntensity: 1.35,
    roughness: 0.25,
  });
  const wreathGreenMat = new THREE.MeshStandardMaterial({
    color: 0x1d8a42,
    roughness: 0.6,
  });
  const redBowMat = new THREE.MeshStandardMaterial({
    color: 0xd92638,
    roughness: 0.5,
  });

  // Bulbous Seussian pink house body
  const body = new THREE.Mesh(
    new RoundedBoxGeometry(widthM, heightM * 0.68, 0.68, 3, 0.26),
    pinkMat
  );
  body.position.y = (heightM * 0.68) / 2 + 0.1;
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  // Scalloped snow-draped dome roof cap
  const roof = new THREE.Mesh(
    new THREE.SphereGeometry(widthM * 0.54, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.56),
    snowRoofMat
  );
  roof.scale.set(1.04, 0.68, 0.58);
  roof.position.set(0, heightM * 0.62, 0);
  roof.castShadow = true;
  g.add(roof);

  // Snow icicle scallops along roof eaves
  const scallopCount = 7;
  for (let i = 0; i < scallopCount; i++) {
    const sx = ((i - (scallopCount - 1) / 2) / (scallopCount / 2)) * (widthM * 0.44);
    const drip = new THREE.Mesh(
      new THREE.ConeGeometry(0.14, 0.34, 8),
      snowRoofMat
    );
    drip.rotation.x = Math.PI;
    drip.position.set(sx, heightM * 0.58, 0.34);
    g.add(drip);
  }

  // Crooked snow-covered chimney pipe at the top peak
  const chimney = new THREE.Mesh(
    new RoundedBoxGeometry(0.28, 0.56, 0.22, 2, 0.06),
    snowRoofMat
  );
  chimney.position.set(0.08, heightM * 0.94, -0.02);
  chimney.rotation.z = -0.18;
  g.add(chimney);

  // Arched Seussian front door
  const doorX = widthM * 0.2;
  const doorFrame = new THREE.Mesh(
    new RoundedBoxGeometry(0.62, 1.32, 0.08, 2, 0.22),
    outlineMat
  );
  doorFrame.position.set(doorX, 0.76, 0.33);
  g.add(doorFrame);

  const doorPanel = new THREE.Mesh(
    new RoundedBoxGeometry(0.54, 1.24, 0.09, 2, 0.2),
    new THREE.MeshStandardMaterial({ color: 0xf878b4, roughness: 0.5 })
  );
  doorPanel.position.set(doorX, 0.75, 0.34);
  g.add(doorPanel);

  // Holiday wreath + red bow on door
  const doorWreath = new THREE.Mesh(
    new THREE.TorusGeometry(0.16, 0.055, 10, 18),
    wreathGreenMat
  );
  doorWreath.position.set(doorX, 0.96, 0.4);
  g.add(doorWreath);

  const doorBow = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 0.05), redBowMat);
  doorBow.position.set(doorX, 1.12, 0.42);
  g.add(doorBow);

  // Glowing yellow arched windows with mini wreaths
  for (const wx of [-widthM * 0.3, -widthM * 0.05]) {
    const win = new THREE.Mesh(
      new RoundedBoxGeometry(0.34, 0.46, 0.08, 2, 0.12),
      warmWindowMat
    );
    win.position.set(wx, 0.98, 0.34);
    g.add(win);

    const winWreath = new THREE.Mesh(
      new THREE.TorusGeometry(0.1, 0.035, 8, 14),
      wreathGreenMat
    );
    winWreath.position.set(wx, 0.98, 0.39);
    g.add(winWreath);
  }

  return g;
}

/**
 * Helper to build Papa Who's House (Lineset #9 at 6'-6") in either
 * solid painted wall mode (Sheet 1H) or translucent backlit scrim mode (Sheet 1E "Mean One").
 */
function buildPapaWhosHouseUnit(translucentScrimMode: boolean): THREE.Group {
  const group = new THREE.Group();
  group.name = translucentScrimMode
    ? 'Element_grinch-papa-whos-scrim-mode'
    : 'Element_grinch-papa-whos-house';

  const oliveTimberMat = new THREE.MeshStandardMaterial({
    color: 0x7b9a44,
    roughness: 0.56,
    metalness: 0.05,
  });
  const roofGreenMat = new THREE.MeshStandardMaterial({
    color: 0x5c7c32,
    roughness: 0.62,
  });
  const creamWallMat = new THREE.MeshStandardMaterial({
    color: translucentScrimMode ? 0xd8d0e8 : 0xece6d4,
    roughness: 0.65,
    transparent: translucentScrimMode,
    opacity: translucentScrimMode ? 0.22 : 1.0,
    depthWrite: !translucentScrimMode,
  });
  const hearthStoneMat = new THREE.MeshStandardMaterial({
    color: 0x7a8478,
    roughness: 0.72,
  });
  const crimsonMat = new THREE.MeshStandardMaterial({
    color: 0xd42438,
    roughness: 0.5,
  });
  const wreathGreenMat = new THREE.MeshStandardMaterial({
    color: 0x1d8a42,
    roughness: 0.55,
  });
  const royalBlueMat = new THREE.MeshStandardMaterial({
    color: 0x1a75e8,
    roughness: 0.45,
  });

  // 1. Main House Unit at Lineset #9 (z = -2.0m)
  const houseFrame = new THREE.Group();
  houseFrame.position.set(0, 0, -2.0);
  group.add(houseFrame);

  // Cream/Scrim Main Wall Backing (left & right of central chimney breast)
  for (const side of [-1, 1]) {
    const wallPanel = new THREE.Mesh(
      new RoundedBoxGeometry(2.65, 2.95, 0.14, 2, 0.18),
      creamWallMat
    );
    wallPanel.position.set(side * 1.85, 1.52, 0);
    wallPanel.castShadow = !translucentScrimMode;
    wallPanel.receiveShadow = true;
    houseFrame.add(wallPanel);
  }

  // Asymmetrical Curvy Olive-Green Seussian Roof Arch (matching Slides 11, 12, 16, 17!)
  const roofDome = new THREE.Mesh(
    new THREE.CylinderGeometry(3.6, 3.85, 0.28, 28, 1, false, 0, Math.PI),
    roofGreenMat
  );
  roofDome.rotation.x = Math.PI / 2;
  roofDome.rotation.z = -0.08;
  roofDome.scale.set(1.08, 0.48, 1.0);
  roofDome.position.set(-0.05, 2.85, 0.02);
  roofDome.castShadow = true;
  houseFrame.add(roofDome);

  // Exposed Olive-Green Seussian Timber Rib Framing (visible even in Scrim Reveal mode!)
  for (const rx of [-3.1, -1.9, -0.75, 0.75, 1.95, 3.05]) {
    const post = new THREE.Mesh(
      new RoundedBoxGeometry(0.14, 2.95, 0.22, 1, 0.04),
      oliveTimberMat
    );
    post.position.set(rx, 1.5, 0.04);
    post.rotation.z = rx * -0.025;
    post.castShadow = true;
    houseFrame.add(post);
  }
  for (const ry of [0.12, 1.05, 2.35, 2.95]) {
    const beam = new THREE.Mesh(
      new RoundedBoxGeometry(6.4, 0.14, 0.22, 1, 0.04),
      oliveTimberMat
    );
    beam.position.set(0, ry, 0.04);
    beam.rotation.z = ry > 2.0 ? -0.05 : 0;
    houseFrame.add(beam);
  }

  // Roof radial timber ribs
  for (let r = -2; r <= 2; r++) {
    const rib = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 1.45, 0.24),
      oliveTimberMat
    );
    rib.position.set(r * 1.15, 3.45 - Math.abs(r) * 0.16, 0.06);
    rib.rotation.z = r * -0.24;
    houseFrame.add(rib);
  }

  // Central Chimney Breast & Fireplace Hearth (x = 0, y = 0..2.9m)
  const chimneyBreast = new THREE.Mesh(
    new THREE.BoxGeometry(1.42, 2.95, 0.36),
    hearthStoneMat
  );
  chimneyBreast.position.set(-0.05, 1.48, 0.12);
  chimneyBreast.castShadow = true;
  houseFrame.add(chimneyBreast);

  // Fireplace Mantel Shelf
  const mantelShelf = new THREE.Mesh(
    new RoundedBoxGeometry(1.72, 0.14, 0.48, 2, 0.04),
    new THREE.MeshStandardMaterial({ color: 0xd8d4ec, roughness: 0.45 })
  );
  mantelShelf.position.set(-0.05, 1.28, 0.24);
  houseFrame.add(mantelShelf);

  // Glowing Firebox Inside Hearth
  const firebox = new THREE.Mesh(
    new THREE.BoxGeometry(0.92, 0.95, 0.28),
    new THREE.MeshStandardMaterial({
      color: 0x3a0c14,
      emissive: 0xff3818,
      emissiveIntensity: 0.85,
      roughness: 0.6,
    })
  );
  firebox.position.set(-0.05, 0.55, 0.22);
  houseFrame.add(firebox);

  // Hanging Christmas Stockings along Mantel + Over-Mantel Wreath & Red Banner
  const stockingColors = [0xff3858, 0x38d878, 0xffd238, 0x48a8ff];
  for (let s = 0; s < 4; s++) {
    const st = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.26, 0.05),
      new THREE.MeshStandardMaterial({ color: stockingColors[s] ?? 0xff3858 })
    );
    st.position.set(-0.52 + s * 0.32, 1.12, 0.44);
    st.rotation.z = (s % 2 === 0 ? 1 : -1) * 0.12;
    houseFrame.add(st);
  }

  const mantelBanner = new THREE.Mesh(
    new THREE.BoxGeometry(1.18, 0.32, 0.06),
    crimsonMat
  );
  mantelBanner.position.set(-0.05, 1.68, 0.32);
  houseFrame.add(mantelBanner);

  const mantelWreath = new THREE.Mesh(
    new THREE.TorusGeometry(0.24, 0.07, 10, 20),
    wreathGreenMat
  );
  mantelWreath.position.set(-0.05, 2.22, 0.34);
  houseFrame.add(mantelWreath);

  // Arched Window Cutouts (Left & Right) + Arched Green Door on Right
  for (const wx of [-1.75, 2.15]) {
    const archRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.46, 0.06, 10, 20),
      oliveTimberMat
    );
    archRing.scale.set(0.85, 1.35, 1.0);
    archRing.position.set(wx, 1.65, 0.12);
    houseFrame.add(archRing);

    const winWreath = new THREE.Mesh(
      new THREE.TorusGeometry(0.2, 0.055, 8, 16),
      wreathGreenMat
    );
    winWreath.position.set(wx, 1.62, 0.16);
    houseFrame.add(winWreath);
  }

  // 2. Downstage Right (DSR) Crooked Seussian Refrigerator & Table (from Slides 11, 16, 17)
  const fridgeGroup = new THREE.Group();
  fridgeGroup.position.set(-3.75, 0, -1.25);
  fridgeGroup.rotation.y = 0.28;
  const fridgeBody = new THREE.Mesh(
    new RoundedBoxGeometry(0.95, 1.85, 0.68, 3, 0.18),
    royalBlueMat
  );
  fridgeBody.position.y = 0.92;
  fridgeBody.castShadow = true;
  fridgeGroup.add(fridgeBody);

  const fridgeDoor = new THREE.Mesh(
    new RoundedBoxGeometry(0.76, 1.48, 0.08, 2, 0.14),
    new THREE.MeshStandardMaterial({ color: 0xf4a8c8, roughness: 0.45 })
  );
  fridgeDoor.position.set(0, 0.88, 0.34);
  fridgeGroup.add(fridgeDoor);
  group.add(fridgeGroup);

  // DSR Blue Stool / Small Table
  const tableGroup = new THREE.Group();
  tableGroup.position.set(-2.55, 0, -1.18);
  const tableTop = new THREE.Mesh(
    new RoundedBoxGeometry(0.76, 0.08, 0.58, 2, 0.03),
    new THREE.MeshStandardMaterial({ color: 0xeef4ff, roughness: 0.4 })
  );
  tableTop.position.y = 0.72;
  tableGroup.add(tableTop);
  for (const lx of [-0.28, 0.28]) {
    for (const lz of [-0.2, 0.2]) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.03, 0.72, 8),
        royalBlueMat
      );
      leg.position.set(lx, 0.36, lz);
      tableGroup.add(leg);
    }
  }
  group.add(tableGroup);

  // 3. Who Family Christmas Tree (Right of Fireplace, x = +1.05m, z = -1.35m)
  const whoTreeGroup = new THREE.Group();
  whoTreeGroup.position.set(1.08, 0, -1.32);
  for (let tier = 0; tier < 5; tier++) {
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.52 - tier * 0.08, 0.58, 12),
      wreathGreenMat
    );
    cone.position.y = 0.38 + tier * 0.36;
    cone.castShadow = true;
    whoTreeGroup.add(cone);
  }
  group.add(whoTreeGroup);

  // 4. Downstage Left (DSL) Royal-Blue Curvy Seussian Daybed (x = +3.35m, z = -1.22m)
  const daybedGroup = new THREE.Group();
  daybedGroup.position.set(3.35, 0, -1.22);
  daybedGroup.rotation.y = -0.24;
  const bedSeat = new THREE.Mesh(
    new RoundedBoxGeometry(1.55, 0.38, 0.72, 2, 0.08),
    royalBlueMat
  );
  bedSeat.position.y = 0.34;
  bedSeat.castShadow = true;
  daybedGroup.add(bedSeat);

  const bedBack = new THREE.Mesh(
    new RoundedBoxGeometry(1.58, 0.68, 0.18, 2, 0.12),
    royalBlueMat
  );
  bedBack.position.set(0, 0.68, -0.26);
  bedBack.rotation.z = 0.08;
  daybedGroup.add(bedBack);
  group.add(daybedGroup);

  // In Scrim Reveal ("Mean One Mr. Grinch") mode, add the Grinch in his red Santa disguise!
  if (translucentScrimMode) {
    const grinchFigure = createHumanScaleFigure(1.82, 0xd41e2e, 0.32, 0xd41e2e);
    grinchFigure.position.set(0.45, 0, -1.15);
    grinchFigure.rotation.y = -0.25;
    group.add(grinchFigure);
  }

  return group;
}

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

  const snowPortalMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    color: 0xeef5ff,
    roughness: 0.56,
    metalness: 0.04,
  });
  const iceCaveMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    color: 0x90bcf4,
    roughness: 0.52,
    metalness: 0.08,
  });

  // ==========================================================================
  // 1. DOWNSTAGE LEFT & RIGHT SCULPTED SEUSSIAN SNOW-CLIFF PORTALS
  //    (Permanent false proscenium tormentors visible in every slide 3–22)
  // ==========================================================================
  const portalsGroup = new THREE.Group();
  portalsGroup.name = 'Element_grinch-snow-portals';

  for (const side of [-1, 1]) {
    // Outer Downstage Snow Block Tower
    const outerTower = new THREE.Mesh(
      new RoundedBoxGeometry(2.35, 3.65, 0.95, 3, 0.16),
      snowPortalMat
    );
    outerTower.position.set(side * 5.65, 1.82, -0.15);
    outerTower.rotation.y = side * -0.18;
    outerTower.castShadow = true;
    outerTower.receiveShadow = true;
    portalsGroup.add(outerTower);

    // Overhanging Snow Cap on Outer Tower
    const snowCap = new THREE.Mesh(
      new RoundedBoxGeometry(2.52, 1.15, 1.08, 3, 0.22),
      new THREE.MeshStandardMaterial({ color: 0xf6f9ff, roughness: 0.48 })
    );
    snowCap.position.set(side * 5.62, 3.15, -0.1);
    snowCap.rotation.y = side * -0.18;
    snowCap.rotation.z = side * -0.05;
    portalsGroup.add(snowCap);

    // Mid-Wing Stepped Snow Flat
    const midFlat = new THREE.Mesh(
      new RoundedBoxGeometry(1.85, 3.15, 0.45, 2, 0.12),
      snowPortalMat
    );
    midFlat.position.set(side * 4.45, 1.56, -0.85);
    midFlat.rotation.y = side * -0.12;
    midFlat.castShadow = true;
    portalsGroup.add(midFlat);

    // Tall Curving Seussian Ice-Wave Wing Arch (seen behind the outer snow portals in Slides 5, 11, 14, 20, 22)
    const waveArch = new THREE.Mesh(
      new RoundedBoxGeometry(1.95, 4.75, 0.28, 3, 0.24),
      iceCaveMat
    );
    waveArch.position.set(side * 4.65, 2.38, -2.55);
    waveArch.rotation.z = side * -0.22;
    waveArch.castShadow = true;
    portalsGroup.add(waveArch);
  }
  registerElement('grinch-snow-portals', portalsGroup);

  // ==========================================================================
  // 2. LINESET #1 (0'-10") PRE-SHOW STORYBOOK SCRIM (Slide 3 / Sheet 1A)
  // ==========================================================================
  const preshowScrimGroup = new THREE.Group();
  preshowScrimGroup.name = 'Element_grinch-preshow-scrim';
  const scrimMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(11.8, 6.6),
    new THREE.MeshStandardMaterial({
      map: preshowScrimTex,
      transparent: true,
      opacity: 0.9,
      roughness: 0.65,
      emissive: 0x3b2c6e,
      emissiveIntensity: 0.35,
    })
  );
  scrimMesh.position.set(0, 3.3, -0.35);
  preshowScrimGroup.add(scrimMesh);
  preshowScrimGroup.visible = false;
  registerElement('grinch-preshow-scrim', preshowScrimGroup, 1);

  // ==========================================================================
  // 3. UPSTAGE WHOVILLE SNOW HILLS & MT. CRUMPIT PEAK (Lineset #39 / #45)
  // ==========================================================================
  const hillsGroup = new THREE.Group();
  hillsGroup.name = 'Element_grinch-whoville-hills-cyc';

  // Left & Right rolling snow hills groundrow
  for (const [hx, hy, hz, rx, ry, col] of [
    [-2.8, 1.25, -6.6, 2.6, 1.45, 0xd8e2f8],
    [2.6, 1.35, -6.5, 2.8, 1.55, 0xcad8f4],
    [0.2, 0.95, -5.9, 1.9, 1.15, 0xe4ecff],
  ] as const) {
    const hill = new THREE.Mesh(
      new THREE.SphereGeometry(1.0, 20, 14),
      new THREE.MeshStandardMaterial({
        map: rockTex,
        color: col,
        roughness: 0.6,
      })
    );
    hill.scale.set(rx, ry, 0.35);
    hill.position.set(hx, hy, hz);
    hillsGroup.add(hill);
  }

  // Towering Crooked Peak of Mt. Crumpit at Upstage Center (z = -7.2m)
  const crumpitPeakGroup = new THREE.Group();
  crumpitPeakGroup.position.set(-0.35, 0, -7.25);
  const crumpitBody = new THREE.Mesh(
    new THREE.ConeGeometry(2.65, 5.25, 12),
    new THREE.MeshStandardMaterial({
      map: rockTex,
      color: 0xa2b6dc,
      roughness: 0.58,
    })
  );
  crumpitBody.scale.set(1.15, 1.0, 0.28);
  crumpitBody.position.set(0, 2.55, 0);
  crumpitBody.rotation.z = -0.22;
  crumpitPeakGroup.add(crumpitBody);

  const crumpitTip = new THREE.Mesh(
    new RoundedBoxGeometry(1.45, 1.35, 0.42, 3, 0.25),
    snowPortalMat
  );
  crumpitTip.position.set(0.55, 4.45, 0.08);
  crumpitTip.rotation.z = -0.38;
  crumpitPeakGroup.add(crumpitTip);
  hillsGroup.add(crumpitPeakGroup);

  registerElement('grinch-whoville-hills-cyc', hillsGroup);

  // ==========================================================================
  // 4. 3 PINK WHOVILLE ROUND HOUSES (DSR, USR, MSL Wagons — Sheet 1B)
  // ==========================================================================
  const housesGroup = new THREE.Group();
  housesGroup.name = 'Element_grinch-whoville-houses';

  // DSR Pink House (x = -2.85m, z = -2.45m)
  const dsrHouse = createPinkWhovilleHouseWagon(2.35, 2.75, rockTex, 'DSR');
  dsrHouse.position.set(-2.85, 0, -2.45);
  dsrHouse.rotation.y = 0.14;
  housesGroup.add(dsrHouse);

  // USR Pink House (x = -1.45m, z = -4.55m)
  const usrHouse = createPinkWhovilleHouseWagon(2.05, 2.48, rockTex, 'USR');
  usrHouse.position.set(-1.45, 0, -4.55);
  usrHouse.rotation.y = 0.06;
  housesGroup.add(usrHouse);

  // MSL Pink House (x = +2.55m, z = -2.85m)
  const mslHouse = createPinkWhovilleHouseWagon(2.3, 2.7, rockTex, 'MSL');
  mslHouse.position.set(2.55, 0, -2.85);
  mslHouse.rotation.y = -0.14;
  housesGroup.add(mslHouse);

  registerElement('grinch-whoville-houses', housesGroup);

  // ==========================================================================
  // 5. CENTER WHOVILLE CHRISTMAS TREE & PRESENTS TURNTABLE (Sheet 1B / 1D / 1G)
  // ==========================================================================
  const treeWagonGroup = new THREE.Group();
  treeWagonGroup.name = 'Element_grinch-whoville-tree';
  treeWagonGroup.position.set(-0.1, 0, -3.35);

  // Round Snow Turntable Base (drawn at Center Stage on CAD Ground Plans 1A, 1B, 1D, 1G)
  const treePlinth = new THREE.Mesh(
    new THREE.CylinderGeometry(1.18, 1.28, 0.22, 24),
    snowPortalMat
  );
  treePlinth.position.y = 0.11;
  treeWagonGroup.add(treePlinth);

  const treeFoliageMat = new THREE.MeshStandardMaterial({
    color: 0x1b8c3e,
    roughness: 0.56,
  });
  for (let tier = 0; tier < 6; tier++) {
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(1.22 - tier * 0.17, 0.96, 14),
      treeFoliageMat
    );
    cone.position.y = 0.68 + tier * 0.58;
    cone.rotation.z = (tier % 2 === 0 ? 1 : -1) * 0.05;
    cone.castShadow = true;
    treeWagonGroup.add(cone);
  }

  // Gold Star Tree Topper
  const goldStarMat = new THREE.MeshStandardMaterial({
    color: 0xffd428,
    emissive: 0xffa818,
    emissiveIntensity: 0.9,
    roughness: 0.25,
  });
  const starTop = new THREE.Mesh(new THREE.OctahedronGeometry(0.26, 0), goldStarMat);
  starTop.position.y = 4.28;
  treeWagonGroup.add(starTop);

  // Colorful Wrapped Christmas Presents piled around the base of the tree
  const giftPalette = [0xff2e44, 0xff9224, 0xffd428, 0x8e44ef, 0x2898ff];
  for (let gIdx = 0; gIdx < 12; gIdx++) {
    const angle = (gIdx / 12) * Math.PI * 1.4 - Math.PI * 0.2;
    const rad = 0.65 + (gIdx % 2) * 0.24;
    const gift = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.26 + (gIdx % 3) * 0.08, 0.24),
      new THREE.MeshStandardMaterial({
        color: giftPalette[gIdx % giftPalette.length] ?? 0xff2e44,
        roughness: 0.42,
      })
    );
    gift.position.set(Math.cos(angle) * rad, 0.34, Math.sin(angle) * rad + 0.15);
    gift.rotation.y = gIdx * 0.4;
    treeWagonGroup.add(gift);
  }

  registerElement('grinch-whoville-tree', treeWagonGroup);

  // ==========================================================================
  // 6. LINESET #15 (10'-6") "MERRY CHRISTMAS WHOVILLE" BANNER (Slides 5, 14, 22)
  // ==========================================================================
  const signGroup = new THREE.Group();
  signGroup.name = 'Element_grinch-christmas-sign';

  const signCanvas = document.createElement('canvas');
  signCanvas.width = 512;
  signCanvas.height = 160;
  const sCtx = signCanvas.getContext('2d');
  if (sCtx) {
    sCtx.fillStyle = '#c81e38';
    sCtx.fillRect(0, 0, 512, 160);
    sCtx.strokeStyle = '#ffd238';
    sCtx.lineWidth = 5;
    sCtx.strokeRect(8, 8, 496, 144);
    sCtx.fillStyle = '#fff4e0';
    sCtx.font = 'bold 28px Georgia, serif';
    sCtx.textAlign = 'center';
    sCtx.textBaseline = 'middle';
    sCtx.fillText('MERRY CHRISTMAS WHOVILLE', 256, 82);
  }
  const signTex = new THREE.CanvasTexture(signCanvas);
  signTex.colorSpace = THREE.SRGBColorSpace;

  const bannerMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(4.4, 1.15, 16, 4),
    new THREE.MeshStandardMaterial({
      map: signTex,
      roughness: 0.55,
      side: THREE.DoubleSide,
    })
  );
  // Slight catenary curve in the hanging banner
  const posAttr = bannerMesh.geometry.attributes.position;
  if (posAttr) {
    for (let i = 0; i < posAttr.count; i++) {
      const bx = posAttr.getX(i);
      const by = posAttr.getY(i);
      const sag = -0.22 * (1 - (bx / 2.2) * (bx / 2.2));
      posAttr.setY(i, by + sag);
    }
    posAttr.needsUpdate = true;
  }
  bannerMesh.position.set(-0.05, 5.25, -3.2);
  signGroup.add(bannerMesh);

  registerElement('grinch-christmas-sign', signGroup, 3);

  // ==========================================================================
  // 7. LINESET #17 (11'-10") GRINCH'S CAVE JAGGED ICE ARCH & DISTANT VISTA
  //    (Slides 7, 8, 19 — Sheets 1C & 1F)
  // ==========================================================================
  const caveGroup = new THREE.Group();
  caveGroup.name = 'Element_grinch-cave-portal';

  // Outer jagged blue Seussian rock arch framing the cave mouth at z = -3.65m
  const archCount = 15;
  for (let i = 0; i < archCount; i++) {
    const t = i / (archCount - 1);
    const angle = Math.PI * (1 - t); // PI (left) to 0 (right)
    const rx = Math.cos(angle) * 4.45;
    const ry = Math.sin(angle) * 3.85 + 0.55;

    const rockLob = new THREE.Mesh(
      new RoundedBoxGeometry(1.55, 1.95, 0.34, 3, 0.22),
      iceCaveMat
    );
    rockLob.position.set(rx, ry, -3.65);
    rockLob.rotation.z = angle - Math.PI / 2;
    rockLob.castShadow = true;
    caveGroup.add(rockLob);

    // Jagged blue icicle spikes hanging inside the cave mouth arch
    if (i > 2 && i < archCount - 2) {
      const icicle = new THREE.Mesh(
        new THREE.ConeGeometry(0.14, 0.65 + (i % 3) * 0.22, 6),
        iceCaveMat
      );
      icicle.rotation.x = Math.PI;
      icicle.position.set(rx * 0.66, ry * 0.68 - 0.15, -3.55);
      caveGroup.add(icicle);
    }
  }

  // Two small snow boulders at DSL & DSR of cave entrance (seen in Slides 7 & 19)
  for (const bx of [-1.95, 1.85]) {
    const boulder = new THREE.Mesh(
      new RoundedBoxGeometry(0.68, 0.52, 0.42, 2, 0.14),
      snowPortalMat
    );
    boulder.position.set(bx, 0.26, -3.15);
    caveGroup.add(boulder);
  }

  // Forced-Perspective Miniature Distant Whoville Vista (seen through cave opening in Slide 8!)
  const miniVistaGroup = new THREE.Group();
  miniVistaGroup.position.set(0, 0.45, -5.35);
  for (const mx of [-0.68, -0.25, 0.28, 0.68]) {
    const miniHouse = createPinkWhovilleHouseWagon(0.42, 0.52, rockTex, `mini_${mx}`);
    miniHouse.position.set(mx, 0.35, 0);
    miniVistaGroup.add(miniHouse);
  }
  const miniTree = new THREE.Mesh(
    new THREE.ConeGeometry(0.22, 0.85, 10),
    treeFoliageMat
  );
  miniTree.position.set(0, 0.78, 0.08);
  miniVistaGroup.add(miniTree);
  caveGroup.add(miniVistaGroup);

  caveGroup.visible = false;
  registerElement('grinch-cave-portal', caveGroup, 4);

  // ==========================================================================
  // 8. LINESET #19 (13'-2") METALLIC MYLAR STREAMER CURTAIN (Slide 9)
  // ==========================================================================
  const mylarGroup = new THREE.Group();
  mylarGroup.name = 'Element_grinch-mylar-curtain';

  const mylarSilverMat = new THREE.MeshStandardMaterial({
    color: 0xe8d8b8,
    emissive: 0x5c4224,
    emissiveIntensity: 0.45,
    roughness: 0.16,
    metalness: 0.92,
  });
  const mylarGoldMat = new THREE.MeshStandardMaterial({
    color: 0xffd278,
    emissive: 0x7a4e18,
    emissiveIntensity: 0.5,
    roughness: 0.18,
    metalness: 0.9,
  });

  for (let s = 0; s < 34; s++) {
    const sx = (s - 16.5) * 0.16;
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 3.35, 0.03),
      s % 2 === 0 ? mylarSilverMat : mylarGoldMat
    );
    strip.position.set(sx, 1.68, -4.15 + (s % 3) * 0.02);
    strip.rotation.y = ((s * 7) % 5 - 2) * 0.12;
    strip.rotation.z = ((s * 3) % 5 - 2) * 0.02;
    mylarGroup.add(strip);
  }
  mylarGroup.visible = false;
  registerElement('grinch-mylar-curtain', mylarGroup, 5);

  // ==========================================================================
  // 9. LINESET #9 (6'-6") PAPA WHO'S HOUSE (Solid Mode [1H] & Scrim Mode [1E])
  // ==========================================================================
  const papaWhosSolid = buildPapaWhosHouseUnit(false);
  papaWhosSolid.visible = false;
  registerElement('grinch-papa-whos-house', papaWhosSolid, 2);

  const papaWhosScrim = buildPapaWhosHouseUnit(true);
  papaWhosScrim.visible = false;
  registerElement('grinch-papa-whos-scrim-mode', papaWhosScrim, 2);

  // ==========================================================================
  // 10. WHOVILLE DEPARTMENT STORE SHOPPING COUNTERS (Slide 14 / Sheet 1D)
  // ==========================================================================
  const shoppingGroup = new THREE.Group();
  shoppingGroup.name = 'Element_grinch-shopping-counters';

  const counterSpecs = [
    { x: -2.85, z: -1.65, rotY: 0.14, label: 'NEEDS A MAWOOZIS' },
    { x: -1.25, z: -2.55, rotY: 0.06, label: 'WHATCH A MA WHO' },
    { x: 2.45, z: -1.85, rotY: -0.14, label: 'FUZZ A MA WUMPUS' },
  ] as const;

  const counterBlueMat = new THREE.MeshStandardMaterial({
    color: 0x1e7ce8,
    roughness: 0.46,
  });
  const candyPostMat = new THREE.MeshStandardMaterial({
    color: 0x1d9848,
    roughness: 0.5,
  });
  const signRedMat = new THREE.MeshStandardMaterial({
    color: 0xd42238,
    roughness: 0.5,
  });

  for (const cSpec of counterSpecs) {
    const unit = new THREE.Group();
    unit.position.set(cSpec.x, 0, cSpec.z);
    unit.rotation.y = cSpec.rotY;

    // Blue arched store counter base
    const base = new THREE.Mesh(
      new RoundedBoxGeometry(1.75, 0.78, 0.52, 2, 0.08),
      counterBlueMat
    );
    base.position.y = 0.39;
    base.castShadow = true;
    unit.add(base);

    // White snow-capped counter top
    const top = new THREE.Mesh(
      new RoundedBoxGeometry(1.84, 0.09, 0.58, 2, 0.03),
      new THREE.MeshStandardMaterial({ color: 0xf4f8ff, roughness: 0.4 })
    );
    top.position.y = 0.82;
    unit.add(top);

    // Crooked green candy-cane posts & overhead red store sign
    for (const px of [-0.72, 0.72]) {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 1.35, 10),
        candyPostMat
      );
      post.position.set(px, 1.45, 0);
      post.rotation.z = px < 0 ? 0.12 : -0.12;
      unit.add(post);
    }

    const storeSign = new THREE.Mesh(
      new RoundedBoxGeometry(1.42, 0.42, 0.06, 2, 0.08),
      signRedMat
    );
    storeSign.position.set(0, 1.98, 0.04);
    unit.add(storeSign);

    // Merchandise gift packages on the counter
    for (let m = -2; m <= 2; m++) {
      const merch = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.22 + (Math.abs(m) % 2) * 0.08, 0.18),
        new THREE.MeshStandardMaterial({
          color: giftPalette[(m + 2) % giftPalette.length] ?? 0xffd428,
        })
      );
      merch.position.set(m * 0.3, 0.96, 0);
      unit.add(merch);
    }

    shoppingGroup.add(unit);
  }
  shoppingGroup.visible = false;
  registerElement('grinch-shopping-counters', shoppingGroup);

  // ==========================================================================
  // 11. MT. CRUMPIT CLIFF WAGON & OVERSTUFFED RED SLEIGH SACK (Slide 20 / Sheet 1F)
  // ==========================================================================
  const crumpitSleighGroup = new THREE.Group();
  crumpitSleighGroup.name = 'Element_grinch-mt-crumpit-sleigh';

  // DSR Pink House remains onstage in Slide 20
  const dsrHouse1F = createPinkWhovilleHouseWagon(2.35, 2.75, rockTex, 'DSR_1F');
  dsrHouse1F.position.set(-2.85, 0, -2.45);
  dsrHouse1F.rotation.y = 0.14;
  crumpitSleighGroup.add(dsrHouse1F);

  // Steep Rocky Mt. Crumpit Cliff Wedge at DSL (x = +2.15m, z = -2.1m)
  const cliffWagon = new THREE.Group();
  cliffWagon.position.set(2.15, 0, -2.1);

  const cliffRock = new THREE.Mesh(
    new RoundedBoxGeometry(2.45, 1.65, 0.85, 3, 0.2),
    iceCaveMat
  );
  cliffRock.position.set(0, 0.72, 0);
  cliffRock.rotation.z = 0.42;
  cliffRock.castShadow = true;
  cliffWagon.add(cliffRock);

  // Grinch's Sleigh & Giant Overstuffed Crimson Toy Sack perched on the cliff!
  const sleighGroup = new THREE.Group();
  sleighGroup.position.set(0.38, 1.52, 0.05);
  sleighGroup.rotation.z = -0.32;

  const runnerMat = new THREE.MeshStandardMaterial({
    color: 0x3b2416,
    roughness: 0.55,
  });
  for (const rz of [-0.22, 0.22]) {
    const runner = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.08, 0.06), runnerMat);
    runner.position.set(0, 0, rz);
    sleighGroup.add(runner);
  }

  // Huge Crimson Sack of Stolen Presents (matching Slide 20!)
  const sackMat = new THREE.MeshStandardMaterial({
    color: 0xd9182e,
    roughness: 0.48,
  });
  const sackBulb = new THREE.Mesh(new THREE.SphereGeometry(0.68, 20, 16), sackMat);
  sackBulb.scale.set(1.15, 1.05, 0.78);
  sackBulb.position.set(0.08, 0.65, 0);
  sackBulb.castShadow = true;
  sleighGroup.add(sackBulb);

  const sackNeck = new THREE.Mesh(
    new THREE.ConeGeometry(0.32, 0.42, 12),
    sackMat
  );
  sackNeck.rotation.x = Math.PI;
  sackNeck.position.set(0.14, 1.32, 0);
  sleighGroup.add(sackNeck);

  cliffWagon.add(sleighGroup);
  crumpitSleighGroup.add(cliffWagon);

  crumpitSleighGroup.visible = false;
  registerElement('grinch-mt-crumpit-sleigh', crumpitSleighGroup);

  // ==========================================================================
  // 12. FINALE CURVED BLUE & WHITE WHOVILLE FEAST BANQUET TABLE (Slide 22 / Sheet 1G)
  // ==========================================================================
  const finaleBanquetGroup = new THREE.Group();
  finaleBanquetGroup.name = 'Element_grinch-finale-banquet';
  finaleBanquetGroup.position.set(0, 0, -2.55);

  const tableArcCount = 9;
  for (let i = 0; i < tableArcCount; i++) {
    const angle = ((i - (tableArcCount - 1) / 2) / (tableArcCount / 2)) * 0.95;
    const rad = 2.05;
    const tx = Math.sin(angle) * rad;
    const tz = Math.cos(angle) * (rad * 0.55);

    const seg = new THREE.Group();
    seg.position.set(tx, 0, tz);
    seg.rotation.y = angle;

    const blueArchBase = new THREE.Mesh(
      new RoundedBoxGeometry(0.62, 0.68, 0.48, 2, 0.06),
      counterBlueMat
    );
    blueArchBase.position.y = 0.34;
    blueArchBase.castShadow = true;
    seg.add(blueArchBase);

    const whiteClothTop = new THREE.Mesh(
      new RoundedBoxGeometry(0.68, 0.08, 0.56, 2, 0.03),
      new THREE.MeshStandardMaterial({ color: 0xf8fbff, roughness: 0.38 })
    );
    whiteClothTop.position.y = 0.72;
    seg.add(whiteClothTop);

    finaleBanquetGroup.add(seg);
  }
  finaleBanquetGroup.visible = false;
  registerElement('grinch-finale-banquet', finaleBanquetGroup);

  // ==========================================================================
  // 13. CAD OFFSTAGE PROP & WAGON STORAGE BAYS (USR & Stage Left Wing)
  //     (Directly mirrors the offstage storage rectangles drawn on Sheets 1A–1H!)
  // ==========================================================================
  const offstageStorageGroup = new THREE.Group();
  offstageStorageGroup.name = 'Element_grinch-offstage-storage';

  const propCrateMat = new THREE.MeshStandardMaterial({
    color: 0x323c52,
    roughness: 0.65,
  });

  // USR Offstage Storage: Tree, Refrigerator & Curved Finale Bench sections
  const usrFridgeParked = new THREE.Mesh(
    new RoundedBoxGeometry(0.95, 1.75, 0.68, 2, 0.12),
    propCrateMat
  );
  usrFridgeParked.position.set(-5.85, 0.88, -7.85);
  offstageStorageGroup.add(usrFridgeParked);

  // Stage Left Wing Storage Bay: "Mt. Crumpit with sleigh" (x = +8.25m, z = -2.2m) & "Fireplace" (x = +8.1m, z = -8.6m)
  const slCrumpitParked = new THREE.Mesh(
    new RoundedBoxGeometry(1.15, 1.65, 2.45, 2, 0.14),
    iceCaveMat
  );
  slCrumpitParked.position.set(8.25, 0.82, -2.35);
  offstageStorageGroup.add(slCrumpitParked);

  const slFireplaceParked = new THREE.Mesh(
    new THREE.BoxGeometry(1.05, 2.2, 1.45),
    propCrateMat
  );
  slFireplaceParked.position.set(8.15, 1.1, -8.55);
  offstageStorageGroup.add(slFireplaceParked);

  registerElement('grinch-offstage-storage', offstageStorageGroup);

  return root;
}

export const grinchSet: ProductionSetModule = {
  spec: grinchSpec,
  build: buildGrinchSet,
};
