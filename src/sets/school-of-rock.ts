import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { createHumanScaleFigure } from './shared-scenic-helpers.ts';
import type { ProductionSetBuilderContext, ProductionSetModule } from './types.ts';

function buildBoxTrussTower(heightM: number): THREE.Group {
  const tower = new THREE.Group();
  const aluMat = new THREE.MeshStandardMaterial({
    color: 0xc8d0dc,
    roughness: 0.28,
    metalness: 0.85,
  });

  const halfW = 0.21;
  // 4 vertical corner chords
  for (const cx of [-halfW, halfW]) {
    for (const cz of [-halfW, halfW]) {
      const chord = new THREE.Mesh(
        new THREE.CylinderGeometry(0.022, 0.022, heightM, 8),
        aluMat
      );
      chord.position.set(cx, heightM / 2, cz);
      chord.castShadow = true;
      tower.add(chord);
    }
  }

  // Horizontal rungs & diagonal web braces every 0.55m
  const bays = Math.floor(heightM / 0.55);
  for (let b = 0; b <= bays; b++) {
    const y = b * 0.55 + 0.05;
    if (y > heightM) continue;
    const rungFront = new THREE.Mesh(
      new THREE.BoxGeometry(halfW * 2, 0.024, 0.024),
      aluMat
    );
    rungFront.position.set(0, y, halfW);
    tower.add(rungFront);

    const rungSide = new THREE.Mesh(
      new THREE.BoxGeometry(0.024, 0.024, halfW * 2),
      aluMat
    );
    rungSide.position.set(halfW, y, 0);
    tower.add(rungSide);

    if (b < bays) {
      const diag = new THREE.Mesh(
        new THREE.BoxGeometry(0.62, 0.018, 0.018),
        aluMat
      );
      diag.position.set(0, y + 0.275, halfW);
      diag.rotation.z = (b % 2 === 0 ? 1 : -1) * 0.72;
      tower.add(diag);
    }
  }

  return tower;
}

export const schoolOfRockSet: ProductionSetModule = {
  spec: {
    id: 'school-of-rock',
    title: 'School of Rock',
    subtitle: 'Horace Green Prep Classroom & Battle of the Bands (Reference Photos)',
    playwrightOrComposer: 'Andrew Lloyd Webber, Glenn Slater & Julian Fellowes · CTC Mainstage',
    ageRecommendation: 'Ages 6+ · Rock Musical Mainstage',
    description:
      'Recreated directly from your two McColl Family Theatre production photos: 4 vertical silver box-truss concert towers, angled Horace Green chalkboard doorway walls, painted tartan plaid & "H G" crest stage floor, stepped pyramid wall of 24 rock speaker cabinets, flyable center chalkboard, road cases, and student band risers.',
    scenicNotes:
      'Use the Line 3 Batten slider (or toggle "Center Classroom Chalkboard") to fly out the Horace Green classroom wall and reveal the 5.4m Battle of the Bands speaker stack pyramid. Check House Left/Right Wing sightlines past the 4 vertical truss towers.',
    cycTopColor: 0x160a2c,
    cycBottomColor: 0x3b0f4c,
    stageWashColor: 0xffd8e8,
    stageSpotColor: 0xfff0d0,
    apronWashColor: 0x5ce0ff,
    elements: [
      {
        id: 'sor-truss-towers',
        name: '4 Vertical Silver Box-Truss Towers & Concert Rig',
        category: 'portal',
        battenLine: 2,
        defaultVisible: true,
        dimensionsLabel: '4 × (0.45mSq × 6.6m H)',
      },
      {
        id: 'sor-classroom-wing-walls',
        name: 'Angled Horace Green Chalkboard & Doorway Walls (SL/SR)',
        category: 'portal',
        defaultVisible: true,
        dimensionsLabel: '2 × (3.4m W × 4.2m H)',
      },
      {
        id: 'sor-speaker-stack-wall',
        name: 'Battle of the Bands 24-Cabinet Speaker Pyramid (US)',
        category: 'backdrop',
        defaultVisible: true,
        dimensionsLabel: '5.2m W × 5.4m H Speaker Wall',
      },
      {
        id: 'sor-center-chalkboard-fly',
        name: 'Flyable Center Classroom Chalkboard (Fly Line 3)',
        category: 'fly-rig',
        battenLine: 3,
        defaultVisible: false,
        dimensionsLabel: '4.9m W × 3.5m H (Toggle for Classroom)',
      },
      {
        id: 'sor-band-risers-and-cast',
        name: 'Dewey Finn, Drum/Keys Risers, Road Cases & Monitors',
        category: 'blocking',
        defaultVisible: true,
        dimensionsLabel: 'Full Band + Road Cases + 4 Wedges',
      },
      {
        id: 'sor-plaid-crest-floor',
        name: 'Horace Green Tartan Plaid & "H G" Crest Floor Cloth',
        category: 'wagon',
        defaultVisible: true,
        dimensionsLabel: '11.6m × 8.4m Painted Deck',
      },
      {
        id: 'black-velour-masking',
        name: 'Black Velour Legs & Borders (Lines 1–4)',
        category: 'masking',
        battenLine: 1,
        defaultVisible: true,
        dimensionsLabel: '3 Pairs Soft Legs + 3 Borders',
      },
    ],
  },

  build({ registerElement, textures }: ProductionSetBuilderContext): THREE.Group {
    const sorGroup = new THREE.Group();
    sorGroup.name = 'Prod_school-of-rock';

    // ========================================================================
    // 1. FOUR VERTICAL SILVER BOX-TRUSS TOWERS & CONCERT LIGHTING RIG
    // ========================================================================
    const trussGroup = new THREE.Group();
    sorGroup.add(trussGroup);
    registerElement('sor-truss-towers', trussGroup, 2);

    const towerCoords: ReadonlyArray<readonly [number, number, number]> = [
      [-5.15, 0, -1.35], // Downstage Right Outer Tower
      [-2.85, 0, -3.25], // Midstage Right Inner Tower
      [2.85, 0, -3.25],  // Midstage Left Inner Tower
      [5.15, 0, -1.35],  // Downstage Left Outer Tower
    ];

    const parColors = [0xff1e56, 0x00e1d9, 0xff2a85, 0x3898ff];
    towerCoords.forEach(([tx, ty, tz], idx) => {
      const tower = buildBoxTrussTower(6.6);
      tower.position.set(tx, ty, tz);
      trussGroup.add(tower);

      // Glowing LED Concert PARs mounted near top of each truss tower
      for (const py of [4.6, 5.4, 6.1]) {
        const col = parColors[(idx + Math.round(py)) % parColors.length] ?? 0xff1e56;
        const lamp = new THREE.Mesh(
          new THREE.SphereGeometry(0.14, 12, 10),
          new THREE.MeshBasicMaterial({ color: col, toneMapped: false })
        );
        lamp.position.set(tx, py, tz + 0.25);
        trussGroup.add(lamp);
      }
    });

    // Overhead Upstage Concert Truss Bridge with Cyan & Magenta Rock Beams (Photo 1)
    const upstageBridge = new THREE.Mesh(
      new THREE.BoxGeometry(6.2, 0.35, 0.35),
      new THREE.MeshStandardMaterial({
        color: 0x9aa4b4,
        roughness: 0.3,
        metalness: 0.85,
      })
    );
    upstageBridge.position.set(0, 5.85, -4.2);
    trussGroup.add(upstageBridge);

    // Glowing Magenta & Cyan Rock Concert Haze Clouds & Beam Cones at top of stage
    const hazePalette = [
      { x: -2.4, y: 5.5, z: -2.6, r: 1.15, col: 0xff1e56 },
      { x: -0.9, y: 5.8, z: -3.2, r: 1.25, col: 0x2979ff },
      { x: 0.2, y: 5.4, z: -2.8, r: 1.1, col: 0xff1e68 },
      { x: 1.8, y: 5.6, z: -2.7, r: 1.2, col: 0xd500f9 },
      { x: 3.1, y: 5.2, z: -2.2, r: 1.05, col: 0xff1744 },
    ];
    for (const h of hazePalette) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(h.r, 14, 12),
        new THREE.MeshBasicMaterial({
          color: h.col,
          transparent: true,
          opacity: 0.22,
          depthWrite: false,
          toneMapped: false,
        })
      );
      puff.position.set(h.x, h.y, h.z);
      trussGroup.add(puff);
    }

    for (const bx of [-0.65, 0.65]) {
      const beamCone = new THREE.Mesh(
        new THREE.ConeGeometry(0.48, 1.45, 14, 1, true),
        new THREE.MeshBasicMaterial({
          color: 0x38e2ff,
          transparent: true,
          opacity: 0.42,
          side: THREE.DoubleSide,
          depthWrite: false,
          toneMapped: false,
        })
      );
      beamCone.position.set(bx, 5.1, -4.1);
      beamCone.rotation.z = bx < 0 ? 0.28 : -0.28;
      trussGroup.add(beamCone);
    }

    // ========================================================================
    // 2. ANGLED HORACE GREEN CLASSROOM CHALKBOARD & DOORWAY WALLS (SL & SR)
    // ========================================================================
    const wingWallsGroup = new THREE.Group();
    sorGroup.add(wingWallsGroup);
    registerElement('sor-classroom-wing-walls', wingWallsGroup);

    const cherryTrimMat = new THREE.MeshStandardMaterial({
      color: 0x8e4224,
      roughness: 0.55,
      metalness: 0.08,
    });
    const chalkboardMat = new THREE.MeshStandardMaterial({
      map: textures.chalkboardTex,
      roughness: 0.72,
    });
    const darkDoorwayMat = new THREE.MeshStandardMaterial({
      color: 0x0b0c10,
      roughness: 0.95,
    });

    for (const side of [-1, 1]) {
      const wallUnit = new THREE.Group();
      wallUnit.position.set(side * 4.0, 0, -2.3);
      wallUnit.rotation.y = side * -0.58; // Raked between outer & inner truss towers

      // Slate-green chalkboard wall face
      const boardPanel = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 3.85, 0.14),
        chalkboardMat
      );
      boardPanel.position.set(0, 2.35, 0);
      boardPanel.castShadow = true;
      boardPanel.receiveShadow = true;
      wallUnit.add(boardPanel);

      // Top & bottom warm wood rails
      const topCornice = new THREE.Mesh(
        new THREE.BoxGeometry(3.36, 0.24, 0.22),
        cherryTrimMat
      );
      topCornice.position.set(0, 4.3, 0.02);
      wallUnit.add(topCornice);

      const chalkTray = new THREE.Mesh(
        new THREE.BoxGeometry(3.32, 0.14, 0.2),
        cherryTrimMat
      );
      chalkTray.position.set(0, 0.95, 0.04);
      wallUnit.add(chalkTray);

      // Central Wood-Trimmed Classroom Doorway Opening (matching both photos)
      const doorVoid = new THREE.Mesh(
        new THREE.BoxGeometry(1.12, 2.35, 0.18),
        darkDoorwayMat
      );
      doorVoid.position.set(0, 1.18, 0.01);
      wallUnit.add(doorVoid);

      for (const dx of [-0.6, 0.6]) {
        const jamb = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 2.45, 0.22),
          cherryTrimMat
        );
        jamb.position.set(dx, 1.22, 0.03);
        wallUnit.add(jamb);
      }
      const doorHeader = new THREE.Mesh(
        new THREE.BoxGeometry(1.38, 0.18, 0.24),
        cherryTrimMat
      );
      doorHeader.position.set(0, 2.45, 0.04);
      wallUnit.add(doorHeader);

      wingWallsGroup.add(wallUnit);
    }

    // ========================================================================
    // 3. UPSTAGE BATTLE OF THE BANDS 24-CABINET SPEAKER PYRAMID (Photo 1)
    // ========================================================================
    const speakerWallGroup = new THREE.Group();
    speakerWallGroup.position.set(0, 0, -5.05);
    sorGroup.add(speakerWallGroup);
    registerElement('sor-speaker-stack-wall', speakerWallGroup);

    const cabBodyMat = new THREE.MeshStandardMaterial({
      color: 0x15171c,
      roughness: 0.72,
      metalness: 0.15,
    });
    const coneRingMat = new THREE.MeshStandardMaterial({
      color: 0x2e3846,
      roughness: 0.45,
      metalness: 0.35,
    });

    // 6 columns of stacked 0.82m speaker cabinets forming the asymmetric pyramid in Photo 1
    const colHeights = [2, 3, 5, 6, 5, 3];
    colHeights.forEach((stackCount, cIdx) => {
      const cx = (cIdx - 2.5) * 0.86;
      for (let r = 0; r < stackCount; r++) {
        const cy = 0.44 + r * 0.84;
        const cab = new THREE.Mesh(
          new RoundedBoxGeometry(0.82, 0.8, 0.52, 1, 0.03),
          cabBodyMat
        );
        cab.position.set(cx, cy, 0);
        cab.castShadow = true;
        speakerWallGroup.add(cab);

        // Speaker woofer cone ring on front baffle
        const woofer = new THREE.Mesh(
          new THREE.RingGeometry(0.11, 0.28, 16),
          coneRingMat
        );
        woofer.position.set(cx, cy, 0.27);
        speakerWallGroup.add(woofer);
      }
    });

    // ========================================================================
    // 4. FLYABLE UPSTAGE CLASSROOM CHALKBOARD WALL (Photo 2 · Batten Line 3)
    // ========================================================================
    const centerChalkboardGroup = new THREE.Group();
    centerChalkboardGroup.position.set(0, 0, -4.35);
    // Default hidden so Battle of the Bands speaker wall is visible immediately;
    // user can toggle it on in "Scenic Units" to switch to the Classroom scene!
    centerChalkboardGroup.visible = false;
    sorGroup.add(centerChalkboardGroup);
    registerElement('sor-center-chalkboard-fly', centerChalkboardGroup, 3);

    const centerBoard = new THREE.Mesh(
      new THREE.BoxGeometry(4.9, 3.2, 0.14),
      chalkboardMat
    );
    centerBoard.position.set(0, 2.55, 0);
    centerBoard.castShadow = true;
    centerChalkboardGroup.add(centerBoard);

    const centerTopFrame = new THREE.Mesh(
      new THREE.BoxGeometry(5.1, 0.22, 0.2),
      cherryTrimMat
    );
    centerTopFrame.position.set(0, 4.18, 0.02);
    centerChalkboardGroup.add(centerTopFrame);

    const centerBottomTray = new THREE.Mesh(
      new THREE.BoxGeometry(5.1, 0.16, 0.22),
      cherryTrimMat
    );
    centerBottomTray.position.set(0, 0.92, 0.03);
    centerChalkboardGroup.add(centerBottomTray);

    // Two smaller rolling chalkboards flanking the center board (Photo 2)
    for (const side of [-1, 1]) {
      const smallBoard = new THREE.Mesh(
        new THREE.BoxGeometry(1.45, 1.55, 0.1),
        chalkboardMat
      );
      smallBoard.position.set(side * 2.35, 1.85, 0.65);
      centerChalkboardGroup.add(smallBoard);

      const smallFrame = new THREE.Mesh(
        new THREE.BoxGeometry(1.55, 0.1, 0.14),
        cherryTrimMat
      );
      smallFrame.position.set(side * 2.35, 2.65, 0.65);
      centerChalkboardGroup.add(smallFrame);
    }

    // ========================================================================
    // 5. BAND RISERS (DRUMS & KEYS), ROAD CASES, WEDGE MONITORS & DEWEY FINN
    // ========================================================================
    const bandAndCastGroup = new THREE.Group();
    sorGroup.add(bandAndCastGroup);
    registerElement('sor-band-risers-and-cast', bandAndCastGroup);

    const aluEdgeMat = new THREE.MeshStandardMaterial({
      color: 0xd0d6e0,
      roughness: 0.3,
      metalness: 0.85,
    });

    // 5a. Downstage Left & Right Black Concert Road Cases with Silver Trim (Photo 1)
    for (const side of [-1, 1]) {
      const roadCase = new THREE.Group();
      roadCase.position.set(side * 3.45, 0, -1.55);
      roadCase.rotation.y = side * -0.12;

      const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.45, 0.78, 0.72),
        cabBodyMat
      );
      body.position.y = 0.44;
      body.castShadow = true;
      roadCase.add(body);

      // Silver aluminum road-case edge extrusions
      const topRim = new THREE.Mesh(
        new THREE.BoxGeometry(1.48, 0.04, 0.75),
        aluEdgeMat
      );
      topRim.position.y = 0.82;
      roadCase.add(topRim);

      const botRim = new THREE.Mesh(
        new THREE.BoxGeometry(1.48, 0.04, 0.75),
        aluEdgeMat
      );
      botRim.position.y = 0.07;
      roadCase.add(botRim);

      // Student performer standing atop each road case (matching Photo 1!)
      const rockerOnCase = createHumanScaleFigure(
        1.42,
        side < 0 ? 0x22262e : 0x6e1d2a
      );
      rockerOnCase.position.set(0, 0.84, 0);
      roadCase.add(rockerOnCase);

      bandAndCastGroup.add(roadCase);
    }

    // 5b. Stage Right Rolling Keyboard Riser ("YAMAHA S90 ES" in Photo 1 & 2)
    const keysRiser = new THREE.Group();
    keysRiser.position.set(-1.65, 0, -2.55);
    bandAndCastGroup.add(keysRiser);

    const keysDeck = new THREE.Mesh(
      new THREE.BoxGeometry(1.75, 0.18, 1.05),
      cabBodyMat
    );
    keysDeck.position.y = 0.09;
    keysRiser.add(keysDeck);

    const keyboardBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.32, 0.12, 0.36),
      cabBodyMat
    );
    keyboardBody.position.set(-0.1, 0.92, 0.15);
    keysRiser.add(keyboardBody);

    const lawrenceFig = createHumanScaleFigure(1.44, 0x5c1a24);
    lawrenceFig.position.set(-0.1, 0.18, -0.22);
    keysRiser.add(lawrenceFig);

    // 5c. Stage Left-Center Rolling Drum Kit Riser ("Roland" kit in Photo 1 & 2)
    const drumRiser = new THREE.Group();
    drumRiser.position.set(0.95, 0, -2.75);
    bandAndCastGroup.add(drumRiser);

    const drumDeck = new THREE.Mesh(
      new THREE.BoxGeometry(1.85, 0.22, 1.35),
      cabBodyMat
    );
    drumDeck.position.y = 0.11;
    drumRiser.add(drumDeck);

    const kickDrum = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.42, 16),
      new THREE.MeshStandardMaterial({ color: 0x20242c, roughness: 0.4, metalness: 0.5 })
    );
    kickDrum.rotation.x = Math.PI / 2;
    kickDrum.position.set(0, 0.52, 0.15);
    drumRiser.add(kickDrum);

    const cymbalMat = new THREE.MeshStandardMaterial({
      color: 0xe6b84c,
      roughness: 0.25,
      metalness: 0.85,
    });
    for (const [cx, cy, cz] of [
      [-0.45, 1.18, 0.1],
      [0.45, 1.22, 0.1],
      [-0.22, 1.05, 0.25],
    ] as const) {
      const cym = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.22, 0.015, 14),
        cymbalMat
      );
      cym.position.set(cx, cy, cz);
      cym.rotation.x = 0.22;
      drumRiser.add(cym);
    }

    const freddyFig = createHumanScaleFigure(1.42, 0x5c1a24);
    freddyFig.position.set(0, 0.22, -0.28);
    drumRiser.add(freddyFig);

    // 5d. Center Stage: Dewey Finn with Electric Guitar & Red Mic Stand + Bandmates
    const deweyFig = createHumanScaleFigure(1.76, 0x6e222e);
    deweyFig.position.set(0.08, 0, -1.25);
    bandAndCastGroup.add(deweyFig);

    // Dewey's white/sunburst electric guitar body
    const guitar = new THREE.Mesh(
      new RoundedBoxGeometry(0.58, 0.24, 0.06, 1, 0.02),
      new THREE.MeshStandardMaterial({ color: 0xe8e2d5, roughness: 0.3 })
    );
    guitar.position.set(0.12, 1.02, -1.08);
    guitar.rotation.z = 0.32;
    bandAndCastGroup.add(guitar);

    // Red-base center microphone stand
    const micBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.18, 0.04, 14),
      new THREE.MeshStandardMaterial({ color: 0xc82432, roughness: 0.4 })
    );
    micBase.position.set(0.08, 0.02, -0.92);
    bandAndCastGroup.add(micBase);

    const micPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 1.48, 8),
      aluEdgeMat
    );
    micPole.position.set(0.08, 0.76, -0.92);
    bandAndCastGroup.add(micPole);

    // Lead guitarist (Zach) & Bassist (Katie)
    const zachFig = createHumanScaleFigure(1.48, 0x5c1a24, 0.14, 0x1c1e24);
    zachFig.position.set(1.95, 0, -1.55);
    zachFig.rotation.y = -0.35;
    bandAndCastGroup.add(zachFig);

    const katieFig = createHumanScaleFigure(1.45, 0x5c1a24);
    katieFig.position.set(-1.15, 0, -1.85);
    katieFig.rotation.y = 0.25;
    bandAndCastGroup.add(katieFig);

    // 5e. 4 Downstage Apron Wedge Stage Monitors (visible along the bottom of both photos!)
    for (const wx of [-3.85, -1.35, 1.35, 3.85]) {
      const wedge = new THREE.Mesh(
        new RoundedBoxGeometry(0.58, 0.32, 0.42, 1, 0.03),
        cabBodyMat
      );
      wedge.position.set(wx, 0.16, 0.55);
      wedge.rotation.x = -0.35;
      wedge.castShadow = true;
      bandAndCastGroup.add(wedge);
    }

    return sorGroup;
  },
};
