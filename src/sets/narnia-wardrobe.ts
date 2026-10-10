import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { ProductionSetBuilderContext, ProductionSetModule } from './types.ts';

export const narniaWardrobeSet: ProductionSetModule = {
  spec: {
    id: 'narnia-wardrobe',
    title: 'The Lion, the Witch and the Wardrobe',
    subtitle: '2005 McColl Family Theatre Inaugural Production',
    playwrightOrComposer: 'C.S. Lewis / Joseph Robinette · McColl Mainstage',
    ageRecommendation: 'Ages 6+ · Literary Fantasy',
    description:
      'Celebrates the October 2005 opening production of ImaginOn’s McColl Family Theatre: the carved oak Wardrobe downstage right, the glowing Lantern Waste lamppost, frozen Narnia ice portals, and Aslan’s Stone Table.',
    scenicNotes:
      'Verify Downstage Right Wardrobe door reveal angles from House Left Wing seats, and check Aslan’s upstage Stone Table elevation from Row A Child eye level.',
    cycTopColor: 0x0d2240,
    cycBottomColor: 0x4678a8,
    stageWashColor: 0xd8ecff,
    stageSpotColor: 0xffe2a8,
    apronWashColor: 0xc2def7,
    elements: [
      {
        id: 'narnia-stone-table',
        name: "Aslan's Stone Table & Raked Crag Deck",
        category: 'wagon',
        defaultVisible: true,
        dimensionsLabel: '5.4m W × 3.2m D × 1.35m H',
      },
      {
        id: 'narnia-ice-portals',
        name: 'Frozen Ice-Crystal Arch Portals (Batten 2 & 3)',
        category: 'portal',
        battenLine: 2,
        defaultVisible: true,
        dimensionsLabel: '11.2m W × 6.6m H',
      },
      {
        id: 'narnia-wardrobe-unit',
        name: 'Carved Oak Wardrobe Wagon (DSR)',
        category: 'furniture',
        defaultVisible: true,
        dimensionsLabel: '1.8m W × 1.1m D × 2.65m H',
      },
      {
        id: 'narnia-lamppost',
        name: 'Lantern Waste Glowing Gas Lamppost (DSL)',
        category: 'props',
        defaultVisible: true,
        dimensionsLabel: '0.45m W × 3.1m H',
      },
      {
        id: 'black-velour-masking',
        name: 'Black Velour Legs & Borders',
        category: 'masking',
        battenLine: 1,
        defaultVisible: true,
        dimensionsLabel: '3 Pairs Soft Legs',
      },
    ],
    scenes: [
      {
        id: 'narnia-scene-1-spare-room',
        sceneNumber: '1A',
        title: "Professor Kirke's Spare Room & The Wardrobe",
        actLabel: 'Scene 1 · The Wardrobe (DSR)',
        synopsis:
          'Lucy discovers the carved oak Wardrobe downstage right while the frozen Narnia ice portals remain flown out in the loft.',
        visibleElementIds: [
          'narnia-wardrobe-unit',
          'black-velour-masking',
        ],
        battenTrimHeightsM: { 1: 0.0, 2: 6.8, 3: 0.0, 4: 0.0, 5: 0.0 },
        grandDrapeOpenFraction: 0.85,
        stageWashColor: 0xffe0b8,
        stageSpotColor: 0xfff0d0,
        cycTopColor: 0x181422,
        cycBottomColor: 0x2e2438,
        houseLevel: 0.28,
      },
      {
        id: 'narnia-scene-2-lantern-waste',
        sceneNumber: '1B',
        title: 'Lantern Waste & The Glowing Lamppost',
        actLabel: 'Scene 2 · Entering Narnia',
        synopsis:
          'The frozen ice-crystal portals fly in on Batten 2 as the glowing Victorian gas lamppost illuminates Downstage Left.',
        visibleElementIds: [
          'narnia-wardrobe-unit',
          'narnia-ice-portals',
          'narnia-lamppost',
          'black-velour-masking',
        ],
        battenTrimHeightsM: { 1: 0.0, 2: 0.0, 3: 0.0, 4: 0.0, 5: 0.0 },
        grandDrapeOpenFraction: 1.0,
        stageWashColor: 0xc8e4ff,
        stageSpotColor: 0xffe4a8,
        cycTopColor: 0x0d2240,
        cycBottomColor: 0x4678a8,
        houseLevel: 0.2,
      },
      {
        id: 'narnia-scene-3-stone-table',
        sceneNumber: '1C',
        title: "Aslan's Stone Table & Great Thaw",
        actLabel: 'Scene 3 · Climax & Coronation',
        synopsis:
          'Full Narnia stage picture: Carved Wardrobe (DSR), Lantern Waste lamppost (DSL), frozen ice portals, and Aslan\'s Stone Table on the upstage crag.',
        visibleElementIds: [
          'narnia-stone-table',
          'narnia-ice-portals',
          'narnia-wardrobe-unit',
          'narnia-lamppost',
          'black-velour-masking',
        ],
        battenTrimHeightsM: { 1: 0.0, 2: 0.0, 3: 0.0, 4: 0.0, 5: 0.0 },
        grandDrapeOpenFraction: 1.0,
        stageWashColor: 0xd8ecff,
        stageSpotColor: 0xffe2a8,
        cycTopColor: 0x0d2240,
        cycBottomColor: 0x6498c8,
        houseLevel: 0.18,
      },
    ],
  },

  build({ registerElement }: ProductionSetBuilderContext): THREE.Group {
    const narniaGroup = new THREE.Group();
    narniaGroup.name = 'Prod_narnia-wardrobe';

    // 1. Aslan's Stone Table & Raked Crag Platform (Upstage Center)
    const stoneTableGroup = new THREE.Group();
    stoneTableGroup.position.set(0, 0, -5.2);
    narniaGroup.add(stoneTableGroup);
    registerElement('narnia-stone-table', stoneTableGroup);

    const cragMat = new THREE.MeshStandardMaterial({ color: 0x5c6470, roughness: 0.85 });
    const cragBase = new THREE.Mesh(
      new THREE.CylinderGeometry(2.6, 3.2, 0.95, 8),
      cragMat
    );
    cragBase.position.y = 0.48;
    cragBase.castShadow = true;
    cragBase.receiveShadow = true;
    stoneTableGroup.add(cragBase);

    const runeSlab = new THREE.Mesh(
      new RoundedBoxGeometry(2.8, 0.22, 1.45, 1, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x7c8594, roughness: 0.75 })
    );
    runeSlab.position.set(0, 1.32, 0);
    runeSlab.castShadow = true;
    stoneTableGroup.add(runeSlab);

    for (const sx of [-0.95, 0.95]) {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.38, 1.15), cragMat);
      pillar.position.set(sx, 1.05, 0);
      stoneTableGroup.add(pillar);
    }

    // 2. Frozen Ice-Crystal Arch Portals
    const icePortalsGroup = new THREE.Group();
    icePortalsGroup.position.set(0, 0, -2.5);
    narniaGroup.add(icePortalsGroup);
    registerElement('narnia-ice-portals', icePortalsGroup, 2);

    const iceMat = new THREE.MeshStandardMaterial({
      color: 0xaad8ff,
      emissive: 0x2a6699,
      emissiveIntensity: 0.45,
      roughness: 0.22,
      metalness: 0.2,
    });
    for (const side of [-1, 1]) {
      const spire = new THREE.Mesh(new THREE.ConeGeometry(0.95, 6.4, 6), iceMat);
      spire.position.set(side * 4.85, 3.2, 0);
      spire.castShadow = true;
      icePortalsGroup.add(spire);

      const innerSpire = new THREE.Mesh(new THREE.ConeGeometry(0.65, 5.2, 6), iceMat);
      innerSpire.position.set(side * 3.85, 2.6, -1.6);
      icePortalsGroup.add(innerSpire);
    }

    // 3. Carved Oak Wardrobe Wagon (Downstage Right)
    const wardrobeGroup = new THREE.Group();
    wardrobeGroup.position.set(-3.8, 0, -1.35);
    wardrobeGroup.rotation.y = 0.38;
    narniaGroup.add(wardrobeGroup);
    registerElement('narnia-wardrobe-unit', wardrobeGroup);

    const oakMat = new THREE.MeshStandardMaterial({ color: 0x5c3820, roughness: 0.58 });
    const wardrobeBody = new THREE.Mesh(
      new RoundedBoxGeometry(1.75, 2.65, 1.05, 1, 0.04),
      oakMat
    );
    wardrobeBody.position.y = 1.32;
    wardrobeBody.castShadow = true;
    wardrobeGroup.add(wardrobeBody);

    const wardrobeInnerGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.35, 2.15),
      new THREE.MeshBasicMaterial({ color: 0xd8f0ff })
    );
    wardrobeInnerGlow.position.set(0, 1.32, 0.54);
    wardrobeGroup.add(wardrobeInnerGlow);

    // 4. Lantern Waste Glowing Lamppost (Downstage Left)
    const lamppostGroup = new THREE.Group();
    lamppostGroup.position.set(3.65, 0, -1.25);
    narniaGroup.add(lamppostGroup);
    registerElement('narnia-lamppost', lamppostGroup);

    const postPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.1, 3.0, 12),
      new THREE.MeshStandardMaterial({ color: 0x1e2229, roughness: 0.4, metalness: 0.8 })
    );
    postPole.position.y = 1.5;
    postPole.castShadow = true;
    lamppostGroup.add(postPole);

    const lanternGlobe = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 14),
      new THREE.MeshStandardMaterial({
        color: 0xfff2cc,
        emissive: 0xffb84d,
        emissiveIntensity: 2.5,
        toneMapped: false,
      })
    );
    lanternGlobe.position.y = 3.12;
    lamppostGroup.add(lanternGlobe);

    return narniaGroup;
  },
};
