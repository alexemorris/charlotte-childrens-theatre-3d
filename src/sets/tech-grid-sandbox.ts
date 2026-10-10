import * as THREE from 'three';
import { createHumanScaleFigure } from './shared-scenic-helpers.ts';
import type { ProductionSetBuilderContext, ProductionSetModule } from './types.ts';

export const techGridSandboxSet: ProductionSetModule = {
  spec: {
    id: 'tech-grid-sandbox',
    title: 'Technical Stage Grid & Sandbox',
    subtitle: '1m CAD Marley Grid, Scale Figures, Traps & Custom Set Builder',
    playwrightOrComposer: 'McColl Family Theatre Technical Rider Mode',
    ageRecommendation: 'Set Designer & Technical Director Mode',
    description:
      'Bare technical stage with 1-meter CAD grid markings, Centerline (CL) & Plaster Line (PL) spike lines, Child (1.35m) & Adult (1.75m) human scale figures, and full Custom Set Piece authoring.',
    scenicNotes:
      'Use the Set Piece Spawner in the right panel to add custom 4×8 risers, 12ft flats, arch portals, periaktoi, and stairs, or open the Stage Traps & 20-Player Orchestra Pit.',
    cycTopColor: 0x1c2838,
    cycBottomColor: 0x2c3e54,
    stageWashColor: 0xfff6e8,
    stageSpotColor: 0xffffff,
    apronWashColor: 0xfff2dc,
    elements: [
      {
        id: 'sandbox-scale-figures',
        name: 'Child (1.35m) & Adult (1.75m) Scale Reference Figures',
        category: 'blocking',
        defaultVisible: true,
        dimensionsLabel: 'DS, CS, USL, USR Reference Markers',
      },
      {
        id: 'sandbox-height-poles',
        name: '1m–7m Trim Height Calibration Poles',
        category: 'props',
        defaultVisible: true,
        dimensionsLabel: 'Stage Left & Right Calibration Rules',
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
  },

  build({ registerElement }: ProductionSetBuilderContext): THREE.Group {
    const sandboxGroup = new THREE.Group();
    sandboxGroup.name = 'Prod_tech-grid-sandbox';

    const scaleFiguresGroup = new THREE.Group();
    sandboxGroup.add(scaleFiguresGroup);
    registerElement('sandbox-scale-figures', scaleFiguresGroup);

    // Downstage Center Adult (1.75m) & Child (1.35m) Scale Reference Figures
    const adultDS = createHumanScaleFigure(1.75, 0x3898ff);
    adultDS.position.set(-0.65, 0, -0.8);
    scaleFiguresGroup.add(adultDS);

    const childDS = createHumanScaleFigure(1.35, 0x38e298);
    childDS.position.set(0.65, 0, -0.8);
    scaleFiguresGroup.add(childDS);

    // Upstage Left & Right Scale Figures
    const adultUSL = createHumanScaleFigure(1.75, 0xff9b38);
    adultUSL.position.set(4.2, 0, -5.5);
    scaleFiguresGroup.add(adultUSL);

    const adultUSR = createHumanScaleFigure(1.75, 0xff5c7c);
    adultUSR.position.set(-4.2, 0, -5.5);
    scaleFiguresGroup.add(adultUSR);

    // Calibration Trim Height Poles (1m–7m markings)
    const polesGroup = new THREE.Group();
    sandboxGroup.add(polesGroup);
    registerElement('sandbox-height-poles', polesGroup);

    for (const side of [-1, 1]) {
      for (let m = 1; m <= 7; m++) {
        const seg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.05, 0.96, 10),
          new THREE.MeshStandardMaterial({
            color: m % 2 === 0 ? 0xf5c438 : 0x22262e,
            roughness: 0.4,
          })
        );
        seg.position.set(side * 5.6, m - 0.5, -3.5);
        polesGroup.add(seg);
      }
    }

    return sandboxGroup;
  },
};
