import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { drawSeussianDisplayText } from '../engine/procedural-textures.ts';
import { createHumanScaleFigure } from './shared-scenic-helpers.ts';
import type { ProductionSetBuilderContext, ProductionSetModule } from './types.ts';

/**
 * Generates a high-detail procedural drumhead texture with the iconic
 * "SCHOOL OF ROCK" crest and stage-authentic "ROLAND" bottom logo using
 * bold custom display typography.
 */
function createDrumheadLogoTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#101218';
    ctx.fillRect(0, 0, 512, 512);

    // Outer silver tension rim & crimson pinstripe
    ctx.strokeStyle = '#d0d8e4';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(256, 256, 238, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#e01e32';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(256, 256, 214, 0, Math.PI * 2);
    ctx.stroke();

    // Heraldic rock shield emblem in center
    const shieldGrad = ctx.createLinearGradient(156, 118, 356, 365);
    shieldGrad.addColorStop(0, '#c81e2e');
    shieldGrad.addColorStop(0.5, '#8e1420');
    shieldGrad.addColorStop(1, '#580a12');
    ctx.fillStyle = shieldGrad;
    ctx.beginPath();
    ctx.moveTo(148, 122);
    ctx.lineTo(364, 122);
    ctx.lineTo(350, 262);
    ctx.quadraticCurveTo(256, 358, 256, 372);
    ctx.quadraticCurveTo(256, 358, 162, 262);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#f5c842';
    ctx.stroke();

    // Custom extruded 3D display typography
    drawSeussianDisplayText(ctx, 'SCHOOL', 256, 178, {
      fontSize: 44,
      fillTopColor: '#ffffff',
      fillBottomColor: '#dce6f5',
      outlineColor: '#12080c',
      shadowColor: '#080406',
      bounceAmp: 1.5,
      tiltAmp: 0.04,
      letterSpacing: 26,
    });
    drawSeussianDisplayText(ctx, 'OF', 256, 226, {
      fontSize: 30,
      fillTopColor: '#ffe568',
      fillBottomColor: '#e5a424',
      outlineColor: '#1a0c06',
      shadowColor: '#0c0602',
      bounceAmp: 1.0,
      tiltAmp: 0.03,
      letterSpacing: 20,
    });
    drawSeussianDisplayText(ctx, 'ROCK', 256, 276, {
      fontSize: 54,
      fillTopColor: '#ffffff',
      fillBottomColor: '#f8d048',
      outlineColor: '#12080c',
      shadowColor: '#080406',
      bounceAmp: 2.0,
      tiltAmp: 0.05,
      letterSpacing: 34,
    });

    ctx.fillStyle = '#d8e0ee';
    ctx.font = '900 28px "Space Grotesk", "Arial Black", Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ROLAND', 256, 412);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates an illuminated "BATTLE OF THE BANDS" rock concert marquee banner texture
 * with 3D extruded bevel typography, neon glow outlines, and rock lightning bolts.
 */
function createBattleOfTheBandsMarqueeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 1024, 256);
    grad.addColorStop(0, '#140624');
    grad.addColorStop(0.5, '#3d0c54');
    grad.addColorStop(1, '#140624');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 256);

    // Outer neon magenta & gold marquee border
    ctx.strokeStyle = '#ff2a85';
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, 1004, 236);

    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 4;
    ctx.strokeRect(24, 24, 976, 208);

    // Chaser bulbs around perimeter
    ctx.fillStyle = '#fff3c4';
    for (let x = 40; x <= 984; x += 36) {
      ctx.beginPath();
      ctx.arc(x, 24, 5, 0, Math.PI * 2);
      ctx.arc(x, 232, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Rock lightning bolts on left and right
    ctx.fillStyle = '#00e5ff';
    for (const sideX of [86, 938]) {
      ctx.beginPath();
      ctx.moveTo(sideX + 12, 48);
      ctx.lineTo(sideX - 24, 130);
      ctx.lineTo(sideX + 4, 130);
      ctx.lineTo(sideX - 16, 206);
      ctx.lineTo(sideX + 28, 114);
      ctx.lineTo(sideX + 2, 114);
      ctx.closePath();
      ctx.fill();
    }

    // 3D extruded bevel display headline
    drawSeussianDisplayText(ctx, 'BATTLE OF THE BANDS', 512, 106, {
      fontSize: 56,
      fillTopColor: '#fff278',
      fillBottomColor: '#ff8c24',
      bevelHighlightColor: 'rgba(255, 255, 240, 0.85)',
      outlineColor: '#28062e',
      shadowColor: '#120218',
      bounceAmp: 2.2,
      tiltAmp: 0.04,
      letterSpacing: 33,
    });

    ctx.fillStyle = '#70f0ff';
    ctx.font = '800 24px "Space Grotesk", "Fredoka", "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★ LIVE AT THE PALACE THEATRE · FINALS ★', 512, 190);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates an embossed brass & enamel Horace Green Prep School crest texture.
 */
function createHoraceGreenCrestTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#182b49';
    ctx.fillRect(0, 0, 256, 256);

    // Quadrant fills (crimson & navy)
    ctx.fillStyle = '#9e1b28';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillRect(128, 128, 128, 128);

    // Gold heraldic cross
    ctx.fillStyle = '#f2c444';
    ctx.fillRect(116, 0, 24, 256);
    ctx.fillRect(0, 116, 256, 24);

    drawSeussianDisplayText(ctx, 'H', 64, 68, {
      fontSize: 64,
      fillTopColor: '#fff6c8',
      fillBottomColor: '#d89e24',
      outlineColor: '#1a0c06',
      bounceAmp: 0,
      tiltAmp: 0,
    });
    drawSeussianDisplayText(ctx, 'G', 192, 188, {
      fontSize: 64,
      fillTopColor: '#fff6c8',
      fillBottomColor: '#d89e24',
      outlineColor: '#1a0c06',
      bounceAmp: 0,
      tiltAmp: 0,
    });
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Builds a vertical 4-chord box-truss tower with full 4-face diagonal web bracing,
 * heavy steel baseplate, and top mounting collar.
 */
function buildBoxTrussTower(heightM: number): THREE.Group {
  const tower = new THREE.Group();
  const aluMat = new THREE.MeshStandardMaterial({
    color: 0xc8d0dc,
    roughness: 0.26,
    metalness: 0.86,
  });
  const basePlateMat = new THREE.MeshStandardMaterial({
    color: 0x262b34,
    roughness: 0.5,
    metalness: 0.7,
  });

  // Heavy steel floor baseplate (non-coplanar with stage deck)
  const basePlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.58, 0.04, 0.58),
    basePlateMat
  );
  basePlate.position.set(0, 0.02, 0);
  tower.add(basePlate);

  const halfW = 0.21;
  // 4 vertical corner chords
  for (const cx of [-halfW, halfW]) {
    for (const cz of [-halfW, halfW]) {
      const chord = new THREE.Mesh(
        new THREE.CylinderGeometry(0.024, 0.024, heightM, 10),
        aluMat
      );
      chord.position.set(cx, heightM / 2 + 0.04, cz);
      chord.castShadow = true;
      tower.add(chord);
    }
  }

  // Horizontal rungs & diagonal web braces on all 4 faces every 0.55m
  const bays = Math.floor(heightM / 0.55);
  for (let b = 0; b <= bays; b++) {
    const y = b * 0.55 + 0.06;
    if (y > heightM) continue;

    for (const fz of [-halfW, halfW]) {
      const rungFrontBack = new THREE.Mesh(
        new THREE.BoxGeometry(halfW * 2, 0.022, 0.022),
        aluMat
      );
      rungFrontBack.position.set(0, y, fz);
      tower.add(rungFrontBack);
    }

    for (const fx of [-halfW, halfW]) {
      const rungLeftRight = new THREE.Mesh(
        new THREE.BoxGeometry(0.022, 0.022, halfW * 2),
        aluMat
      );
      rungLeftRight.position.set(fx, y, 0);
      tower.add(rungLeftRight);
    }

    if (b < bays) {
      const tilt = (b % 2 === 0 ? 1 : -1) * 0.72;
      // Front & Back diagonal braces
      for (const fz of [-halfW, halfW]) {
        const diagFB = new THREE.Mesh(
          new THREE.BoxGeometry(0.58, 0.016, 0.016),
          aluMat
        );
        diagFB.position.set(0, y + 0.275, fz);
        diagFB.rotation.z = fz > 0 ? tilt : -tilt;
        tower.add(diagFB);
      }
      // Left & Right diagonal braces
      for (const fx of [-halfW, halfW]) {
        const diagLR = new THREE.Mesh(
          new THREE.BoxGeometry(0.016, 0.016, 0.58),
          aluMat
        );
        diagLR.position.set(fx, y + 0.275, 0);
        diagLR.rotation.x = fx > 0 ? tilt : -tilt;
        tower.add(diagLR);
      }
    }
  }

  return tower;
}

/**
 * Builds a horizontal 4-chord box-truss span with diagonal webbing on front, back, top, and bottom.
 */
function buildHorizontalBoxTrussSpan(spanM: number): THREE.Group {
  const bridge = new THREE.Group();
  const aluMat = new THREE.MeshStandardMaterial({
    color: 0xb8c2d0,
    roughness: 0.28,
    metalness: 0.86,
  });

  const halfD = 0.18;
  for (const cy of [-halfD, halfD]) {
    for (const cz of [-halfD, halfD]) {
      const chord = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, spanM, 8),
        aluMat
      );
      chord.rotation.z = Math.PI / 2;
      chord.position.set(0, cy, cz);
      bridge.add(chord);
    }
  }

  const bays = Math.floor(spanM / 0.5);
  const startX = -spanM / 2;
  for (let b = 0; b <= bays; b++) {
    const x = startX + b * 0.5;
    for (const cz of [-halfD, halfD]) {
      const vert = new THREE.Mesh(
        new THREE.BoxGeometry(0.018, halfD * 2, 0.018),
        aluMat
      );
      vert.position.set(x, 0, cz);
      bridge.add(vert);
    }
    for (const cy of [-halfD, halfD]) {
      const horiz = new THREE.Mesh(
        new THREE.BoxGeometry(0.018, 0.018, halfD * 2),
        aluMat
      );
      horiz.position.set(x, cy, 0);
      bridge.add(horiz);
    }

    if (b < bays) {
      const diag = new THREE.Mesh(
        new THREE.BoxGeometry(0.56, 0.015, 0.015),
        aluMat
      );
      diag.position.set(x + 0.25, 0, halfD);
      diag.rotation.z = (b % 2 === 0 ? 1 : -1) * 0.62;
      bridge.add(diag);
    }
  }

  return bridge;
}

/**
 * Builds a detailed fluted walnut pilaster column with base plinth, 3D vertical flutes, and capital.
 */
function buildFlutedWalnutPilaster(
  heightM: number,
  walnutMat: THREE.Material,
  darkWalnutMat: THREE.Material,
  brassMat: THREE.Material
): THREE.Group {
  const pilaster = new THREE.Group();

  // Base plinth (stepped forward by +0.04m)
  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.26, 0.24),
    darkWalnutMat
  );
  plinth.position.set(0, 0.13, 0.02);
  pilaster.add(plinth);

  // Main pilaster shaft
  const shaftH = heightM - 0.48;
  const shaft = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, shaftH, 0.16),
    walnutMat
  );
  shaft.position.set(0, 0.26 + shaftH / 2, 0);
  shaft.castShadow = true;
  pilaster.add(shaft);

  // 3 raised vertical flute ribs stepped +0.035m proud of the shaft face
  for (const fx of [-0.065, 0, 0.065]) {
    const fluteRib = new THREE.Mesh(
      new THREE.BoxGeometry(0.026, shaftH - 0.16, 0.035),
      darkWalnutMat
    );
    fluteRib.position.set(fx, 0.26 + shaftH / 2, 0.098);
    pilaster.add(fluteRib);
  }

  // Capital molding & brass necking astragal
  const astragal = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, 0.035, 0.21),
    brassMat
  );
  astragal.position.set(0, heightM - 0.22, 0.025);
  pilaster.add(astragal);

  const capital = new THREE.Mesh(
    new THREE.BoxGeometry(0.30, 0.18, 0.25),
    darkWalnutMat
  );
  capital.position.set(0, heightM - 0.10, 0.035);
  pilaster.add(capital);

  return pilaster;
}

/**
 * Builds a warm milk-glass schoolhouse pendant chandelier suspended on a brass stem.
 */
function buildSchoolhousePendantChandelier(
  dropLengthM: number,
  brassMat: THREE.Material
): THREE.Group {
  const pendant = new THREE.Group();

  const canopy = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.14, 0.05, 14),
    brassMat
  );
  canopy.position.y = -0.025;
  pendant.add(canopy);

  const rod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.014, dropLengthM, 8),
    brassMat
  );
  rod.position.y = -dropLengthM / 2;
  pendant.add(rod);

  const fitter = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.12, 0.08, 14),
    brassMat
  );
  fitter.position.y = -dropLengthM - 0.03;
  pendant.add(fitter);

  const milkGlassMat = new THREE.MeshStandardMaterial({
    color: 0xfff8e7,
    emissive: 0xffd98e,
    emissiveIntensity: 0.85,
    roughness: 0.22,
  });

  // Classic tiered acorn schoolhouse globe
  const globeUpper = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.22, 0.14, 16),
    milkGlassMat
  );
  globeUpper.position.y = -dropLengthM - 0.13;
  pendant.add(globeUpper);

  const globeBelly = new THREE.Mesh(
    new THREE.SphereGeometry(0.21, 16, 12),
    milkGlassMat
  );
  globeBelly.scale.set(1, 0.72, 1);
  globeBelly.position.y = -dropLengthM - 0.21;
  pendant.add(globeBelly);

  const brassFinial = new THREE.Mesh(
    new THREE.SphereGeometry(0.035, 10, 8),
    brassMat
  );
  brassFinial.position.y = -dropLengthM - 0.38;
  pendant.add(brassFinial);

  return pendant;
}

/**
 * Builds a glass-front Horace Green trophy & encyclopedia cabinet filled with golden trophies and books.
 */
function buildTrophyAndBookCabinet(
  walnutMat: THREE.Material,
  darkWalnutMat: THREE.Material,
  brassMat: THREE.Material
): THREE.Group {
  const cabinet = new THREE.Group();

  // Outer walnut carcass
  const backPanel = new THREE.Mesh(
    new THREE.BoxGeometry(0.86, 2.15, 0.06),
    darkWalnutMat
  );
  backPanel.position.set(0, 1.08, -0.14);
  cabinet.add(backPanel);

  for (const sx of [-0.41, 0.41]) {
    const sideWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 2.15, 0.32),
      walnutMat
    );
    sideWall.position.set(sx, 1.08, 0);
    cabinet.add(sideWall);
  }

  // Crown & base plinth
  const crown = new THREE.Mesh(
    new THREE.BoxGeometry(0.94, 0.12, 0.38),
    darkWalnutMat
  );
  crown.position.set(0, 2.20, 0.02);
  cabinet.add(crown);

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(0.92, 0.16, 0.36),
    darkWalnutMat
  );
  base.position.set(0, 0.08, 0.01);
  cabinet.add(base);

  // 4 interior shelves
  const shelfHeights = [0.55, 1.02, 1.48, 1.92];
  for (const sy of shelfHeights) {
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(0.76, 0.035, 0.26),
      walnutMat
    );
    shelf.position.set(0, sy, -0.01);
    cabinet.add(shelf);
  }

  // Lower two shelves: row of leather-bound encyclopedias with gold spine bands
  const bookPalette = [0x7a1c24, 0x1b3b5c, 0x1e4d38, 0x5c3c1e, 0x3d2352];
  for (const shelfY of [0.57, 1.04]) {
    for (let b = 0; b < 11; b++) {
      const bx = -0.32 + b * 0.064;
      const bh = 0.28 + ((b * 7) % 3) * 0.03;
      const bookMat = new THREE.MeshStandardMaterial({
        color: bookPalette[(b + Math.round(shelfY * 10)) % bookPalette.length] ?? 0x7a1c24,
        roughness: 0.55,
      });
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(0.052, bh, 0.19),
        bookMat
      );
      book.position.set(bx, shelfY + bh / 2, -0.01);
      cabinet.add(book);
    }
  }

  // Upper two shelves: gleaming golden championship trophies on marble plinths
  for (const shelfY of [1.50, 1.94]) {
    for (const tx of [-0.22, 0, 0.22]) {
      const plinth = new THREE.Mesh(
        new THREE.BoxGeometry(0.09, 0.05, 0.09),
        darkWalnutMat
      );
      plinth.position.set(tx, shelfY + 0.025, 0);
      cabinet.add(plinth);

      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.03, 0.09, 10),
        brassMat
      );
      stem.position.set(tx, shelfY + 0.095, 0);
      cabinet.add(stem);

      const cup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.025, 0.12, 12),
        brassMat
      );
      cup.position.set(tx, shelfY + 0.19, 0);
      cabinet.add(cup);

      const handleRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.048, 0.008, 8, 14),
        brassMat
      );
      handleRing.position.set(tx, shelfY + 0.19, 0);
      cabinet.add(handleRing);
    }
  }

  // Translucent glass-front doors (stepped at z = +0.16m, clear of shelves at z <= 0.12m)
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xd8f0ff,
    transparent: true,
    opacity: 0.24,
    roughness: 0.12,
    metalness: 0.2,
    depthWrite: false,
  });
  for (const gx of [-0.19, 0.19]) {
    const glassPane = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 1.90, 0.015),
      glassMat
    );
    glassPane.position.set(gx, 1.12, 0.16);
    cabinet.add(glassPane);

    // Mullion center stiles (at z = +0.19m)
    const stile = new THREE.Mesh(
      new THREE.BoxGeometry(0.035, 1.96, 0.03),
      walnutMat
    );
    stile.position.set(gx < 0 ? -0.018 : 0.018, 1.12, 0.19);
    cabinet.add(stile);
  }

  return cabinet;
}

/**
 * Builds the brass Horace Green Prep School heraldic shield plaque with custom graphic crest face.
 */
function buildHoraceGreenCrestPlaque(
  brassMat: THREE.Material,
  crestFaceMat: THREE.Material
): THREE.Group {
  const crest = new THREE.Group();

  // Outer ornate brass shield backing
  const outerShield = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.24, 0.05, 6),
    brassMat
  );
  outerShield.rotation.x = Math.PI / 2;
  crest.add(outerShield);

  // Recessed crimson & navy heraldic face (stepped +0.04m forward)
  const innerFace = new THREE.Mesh(
    new THREE.CircleGeometry(0.24, 6),
    crestFaceMat
  );
  innerFace.position.z = 0.04;
  crest.add(innerFace);

  // Lower motto ribbon bar
  const ribbon = new THREE.Mesh(
    new THREE.BoxGeometry(0.58, 0.08, 0.04),
    brassMat
  );
  ribbon.position.set(0, -0.32, 0.05);
  crest.add(ribbon);

  return crest;
}

/**
 * Builds a single Horace Green student desk with tubular steel legs, under-desk book basket,
 * open notebook & pencil on top, and a molded wood school chair.
 */
function buildStudentDeskAndChair(
  oakMat: THREE.Material,
  tubularSteelMat: THREE.Material,
  bookColorHex: number
): THREE.Group {
  const unit = new THREE.Group();

  // Desktop surface (y = 0.68m)
  const desktop = new THREE.Mesh(
    new RoundedBoxGeometry(0.64, 0.036, 0.46, 1, 0.01),
    oakMat
  );
  desktop.position.set(0, 0.68, 0);
  desktop.castShadow = true;
  desktop.receiveShadow = true;
  unit.add(desktop);

  // 4 tubular steel legs
  for (const lx of [-0.27, 0.27]) {
    for (const lz of [-0.18, 0.18]) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.016, 0.016, 0.66, 8),
        tubularSteelMat
      );
      leg.position.set(lx, 0.33, lz);
      unit.add(leg);
    }
  }

  // Under-desk wire book basket (at y = 0.52m, strictly below desktop)
  const basketTray = new THREE.Mesh(
    new THREE.BoxGeometry(0.48, 0.02, 0.34),
    tubularSteelMat
  );
  basketTray.position.set(0, 0.52, 0);
  unit.add(basketTray);

  // Textbook stored inside the under-desk basket
  const stashedBook = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.04, 0.18),
    new THREE.MeshStandardMaterial({ color: bookColorHex, roughness: 0.55 })
  );
  stashedBook.position.set(-0.06, 0.555, 0.02);
  stashedBook.rotation.y = 0.18;
  unit.add(stashedBook);

  // Open spiral notebook on desktop (stepped cleanly at y = 0.72m)
  const notebookPages = new THREE.Mesh(
    new THREE.BoxGeometry(0.30, 0.016, 0.21),
    new THREE.MeshStandardMaterial({ color: 0xf7f5ee, roughness: 0.7 })
  );
  notebookPages.position.set(-0.05, 0.715, 0.02);
  notebookPages.rotation.y = 0.12;
  unit.add(notebookPages);

  // Yellow #2 pencil next to notebook
  const pencil = new THREE.Mesh(
    new THREE.CylinderGeometry(0.006, 0.006, 0.16, 6),
    new THREE.MeshStandardMaterial({ color: 0xf5c428, roughness: 0.4 })
  );
  pencil.rotation.z = Math.PI / 2;
  pencil.rotation.y = -0.35;
  pencil.position.set(0.18, 0.712, 0.04);
  unit.add(pencil);

  // Molded wood school chair positioned behind the desk (z = -0.38m)
  const chair = new THREE.Group();
  chair.position.set(0, 0, -0.38);

  const seat = new THREE.Mesh(
    new RoundedBoxGeometry(0.42, 0.032, 0.38, 1, 0.01),
    oakMat
  );
  seat.position.set(0, 0.42, 0);
  seat.castShadow = true;
  chair.add(seat);

  for (const cx of [-0.17, 0.17]) {
    for (const cz of [-0.15, 0.15]) {
      const cLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.014, 0.014, 0.41, 8),
        tubularSteelMat
      );
      cLeg.position.set(cx, 0.205, cz);
      chair.add(cLeg);
    }
  }

  // Vertical spindle-slat chair backrest (matching school_of_rock_classroom.jpg)
  for (const bx of [-0.18, 0.18]) {
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(0.032, 0.42, 0.032),
      oakMat
    );
    post.position.set(bx, 0.63, -0.17);
    chair.add(post);
  }
  const crestRail = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.06, 0.036),
    oakMat
  );
  crestRail.position.set(0, 0.82, -0.17);
  chair.add(crestRail);

  for (const sx of [-0.10, -0.035, 0.035, 0.10]) {
    const spindle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.009, 0.009, 0.35, 6),
      oakMat
    );
    spindle.position.set(sx, 0.61, -0.17);
    chair.add(spindle);
  }

  unit.add(chair);
  return unit;
}

/**
 * Builds Dewey Finn's iconic cherry-red Gibson SG double-cutaway electric guitar on an A-frame stand.
 */
function buildGibsonSgOnStand(
  tubularSteelMat: THREE.Material,
  chromeMat: THREE.Material
): THREE.Group {
  const sgGroup = new THREE.Group();

  // Tubular A-frame floor guitar stand
  for (const sx of [-0.16, 0.16]) {
    const baseTube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.36, 8),
      tubularSteelMat
    );
    baseTube.rotation.x = Math.PI / 2;
    baseTube.position.set(sx, 0.02, 0);
    sgGroup.add(baseTube);

    const upright = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.56, 8),
      tubularSteelMat
    );
    upright.position.set(sx * 0.6, 0.28, -0.06);
    upright.rotation.z = sx < 0 ? -0.16 : 0.16;
    sgGroup.add(upright);
  }

  const cherryRedMat = new THREE.MeshStandardMaterial({
    color: 0xb81422,
    roughness: 0.22,
    metalness: 0.25,
  });
  const blackGuardMat = new THREE.MeshStandardMaterial({
    color: 0x14161a,
    roughness: 0.35,
  });
  const fretboardMat = new THREE.MeshStandardMaterial({
    color: 0x3b2316,
    roughness: 0.5,
  });

  const guitar = new THREE.Group();
  guitar.position.set(0, 0.44, 0.02);
  guitar.rotation.x = -0.22;

  // Sculpted SG body with twin devil-horn bouts
  const bodyCore = new THREE.Mesh(
    new RoundedBoxGeometry(0.32, 0.38, 0.042, 2, 0.015),
    cherryRedMat
  );
  guitar.add(bodyCore);

  for (const hx of [-0.11, 0.11]) {
    const horn = new THREE.Mesh(
      new THREE.ConeGeometry(0.055, 0.16, 10),
      cherryRedMat
    );
    horn.position.set(hx, 0.22, 0);
    horn.rotation.z = hx < 0 ? 0.28 : -0.28;
    guitar.add(horn);
  }

  // Batwing black pickguard (stepped +0.032m forward)
  const pickguard = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.20, 0.012),
    blackGuardMat
  );
  pickguard.position.set(0.02, 0.02, 0.032);
  guitar.add(pickguard);

  // Dual chrome humbucker pickups & bridge (stepped +0.045m forward)
  for (const py of [0.09, -0.01, -0.09]) {
    const hardware = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.036, 0.016),
      chromeMat
    );
    hardware.position.set(0, py, 0.045);
    guitar.add(hardware);
  }

  // Neck & rosewood fretboard
  const neck = new THREE.Mesh(
    new THREE.BoxGeometry(0.052, 0.56, 0.026),
    fretboardMat
  );
  neck.position.set(0, 0.46, 0.01);
  guitar.add(neck);

  // Open-book Gibson headstock with 6 chrome tuning keys
  const headstock = new THREE.Mesh(
    new THREE.BoxGeometry(0.085, 0.15, 0.022),
    blackGuardMat
  );
  headstock.position.set(0, 0.80, -0.01);
  headstock.rotation.x = -0.18;
  guitar.add(headstock);

  sgGroup.add(guitar);
  return sgGroup;
}

/**
 * Builds a Marshall 4x12 speaker cabinet with woven grille baffle, 4 visible speaker cones,
 * white logo bar, and optional top tube amplifier head with gold control panel.
 */
function buildMarshallStackUnit(
  cabMat: THREE.Material,
  grilleMat: THREE.Material,
  coneMat: THREE.Material,
  goldMat: THREE.Material,
  whiteMat: THREE.Material,
  includeHead: boolean
): THREE.Group {
  const stack = new THREE.Group();

  // Outer 4x12 cabinet shell
  const cabBody = new THREE.Mesh(
    new RoundedBoxGeometry(0.78, 0.78, 0.42, 1, 0.025),
    cabMat
  );
  cabBody.position.set(0, 0.39, 0);
  cabBody.castShadow = true;
  stack.add(cabBody);

  // Recessed woven grille baffle (stepped +0.032m forward of front face)
  const baffle = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.68, 0.024),
    grilleMat
  );
  baffle.position.set(0, 0.39, 0.225);
  stack.add(baffle);

  // 4 speaker woofer cones inside the 4x12 cabinet (stepped +0.032m forward of baffle)
  for (const sx of [-0.16, 0.16]) {
    for (const sy of [0.23, 0.55]) {
      const cone = new THREE.Mesh(
        new THREE.RingGeometry(0.04, 0.135, 14),
        coneMat
      );
      cone.position.set(sx, sy, 0.258);
      stack.add(cone);
    }
  }

  // White cursive Marshall crest bar across center of grille (stepped +0.045m forward)
  const logoBar = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.042, 0.018),
    whiteMat
  );
  logoBar.position.set(0, 0.62, 0.268);
  stack.add(logoBar);

  if (includeHead) {
    // JCM800 Tube Amplifier Head on top of the cabinet
    const headShell = new THREE.Mesh(
      new RoundedBoxGeometry(0.74, 0.28, 0.32, 1, 0.02),
      cabMat
    );
    headShell.position.set(0, 0.92, -0.02);
    headShell.castShadow = true;
    stack.add(headShell);

    // Brushed gold control panel & rotary knobs (stepped +0.032m proud of head front)
    const goldPanel = new THREE.Mesh(
      new THREE.BoxGeometry(0.66, 0.075, 0.02),
      goldMat
    );
    goldPanel.position.set(0, 0.85, 0.155);
    stack.add(goldPanel);

    for (let k = 0; k < 8; k++) {
      const knob = new THREE.Mesh(
        new THREE.CylinderGeometry(0.014, 0.014, 0.024, 8),
        cabMat
      );
      knob.rotation.x = Math.PI / 2;
      knob.position.set(-0.24 + k * 0.068, 0.85, 0.178);
      stack.add(knob);
    }

    const headLogo = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.036, 0.018),
      whiteMat
    );
    headLogo.position.set(0, 0.96, 0.155);
    stack.add(headLogo);
  }

  return stack;
}

/**
 * Builds a concert moving-head beam fixture with yoke arms, projector housing, and glowing Fresnel lens.
 */
function buildMovingHeadFixture(
  bodyMat: THREE.Material,
  beamColorHex: number,
  tiltZ: number
): THREE.Group {
  const fixture = new THREE.Group();

  // Base clamp box
  const baseBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, 0.10, 0.22),
    bodyMat
  );
  fixture.add(baseBox);

  // U-Yoke arms
  for (const yx of [-0.11, 0.11]) {
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(0.035, 0.24, 0.06),
      bodyMat
    );
    arm.position.set(yx, -0.15, 0);
    fixture.add(arm);
  }

  // Rotating projector head
  const head = new THREE.Group();
  head.position.set(0, -0.22, 0);
  head.rotation.z = tiltZ;
  head.rotation.x = 0.32;

  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.085, 0.10, 0.26, 12),
    bodyMat
  );
  head.add(barrel);

  const lens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.075, 0.02, 12),
    new THREE.MeshBasicMaterial({ color: beamColorHex, toneMapped: false })
  );
  lens.position.y = -0.14;
  head.add(lens);

  fixture.add(head);
  return fixture;
}

export const schoolOfRockSet: ProductionSetModule = {
  spec: {
    id: 'school-of-rock',
    title: 'School of Rock',
    subtitle: 'Horace Green Prep Classroom & Battle of the Bands (Reference Photos)',
    playwrightOrComposer: 'Andrew Lloyd Webber, Glenn Slater & Julian Fellowes · CTC Mainstage',
    ageRecommendation: 'Ages 6+ · Rock Musical Mainstage',
    description:
      'Recreated directly from your two McColl Family Theatre production photos: 4 vertical silver box-truss concert towers, angled Horace Green chalkboard doorway walls with fluted walnut pilasters & trophy cabinets, painted tartan plaid & "H G" crest stage floor, stepped pyramid wall of 24 rock speaker cabinets, flyable center chalkboard with classroom desks, Marshall/Ampeg backline, and full multi-piece drum kit.',
    scenicNotes:
      'Use the Line 3 Batten slider (or toggle "Center Classroom Chalkboard") to fly out the Horace Green classroom wall and classroom desks, revealing the 5.4m Battle of the Bands speaker stack pyramid and open concert stage. Check House Left/Right Wing sightlines past the 4 vertical truss towers.',
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
        dimensionsLabel: '4 × (0.45mSq × 6.6m H) + Marquee',
      },
      {
        id: 'sor-classroom-wing-walls',
        name: 'Angled Horace Green Chalkboard & Doorway Walls (SL/SR)',
        category: 'portal',
        defaultVisible: true,
        dimensionsLabel: '2 × (3.4m W × 4.2m H) + Pilasters',
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
        name: 'Flyable Center Classroom Chalkboard & Desks (Line 3)',
        category: 'fly-rig',
        battenLine: 3,
        defaultVisible: false,
        dimensionsLabel: '4.9m W × 3.5m H + 6 Student Desks',
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
    scenes: [
      {
        id: 'sor-scene-1-classroom',
        sceneNumber: '1A',
        title: 'Horace Green Prep School Classroom',
        actLabel: 'Act I · Scene 2 (Classroom)',
        synopsis:
          'Center Classroom Chalkboard wall (Line 3) flies in with the 6 student desks and teacher pedestal desk to enclose the Horace Green Prep School classroom with cherry-wood wainscoting, fluted pilasters, trophy cabinets, and the "H G" school crest floor.',
        visibleElementIds: [
          'sor-classroom-wing-walls',
          'sor-center-chalkboard-fly',
          'sor-band-risers-and-cast',
          'sor-plaid-crest-floor',
          'black-velour-masking',
        ],
        battenTrimHeightsM: { 1: 0.0, 2: 6.8, 3: 0.0, 4: 0.0, 5: 0.0 },
        grandDrapeOpenFraction: 1.0,
        stageWashColor: 0xffe8cc,
        stageSpotColor: 0xfff4dc,
        cycTopColor: 0x1c2d42,
        cycBottomColor: 0x36526e,
        houseLevel: 0.32,
        modelPhotoUrl: 'reference/school_of_rock_classroom.jpg',
      },
      {
        id: 'sor-scene-2-youre-in-the-band',
        sceneNumber: '1B',
        title: 'Music Room — "You\'re in the Band"',
        actLabel: 'Act I · Scene 5 (Band Formation)',
        synopsis:
          'Dewey Finn hands out electric guitars, Ampeg bass, Hammond organ/synth keyboards, and rock drums to the Horace Green students as the concert truss towers descend into position.',
        visibleElementIds: [
          'sor-truss-towers',
          'sor-classroom-wing-walls',
          'sor-center-chalkboard-fly',
          'sor-band-risers-and-cast',
          'sor-plaid-crest-floor',
          'black-velour-masking',
        ],
        battenTrimHeightsM: { 1: 0.0, 2: 0.0, 3: 0.0, 4: 0.0, 5: 0.0 },
        grandDrapeOpenFraction: 1.0,
        stageWashColor: 0xffd2b8,
        stageSpotColor: 0xffe8a8,
        cycTopColor: 0x241638,
        cycBottomColor: 0x522464,
        houseLevel: 0.24,
        modelPhotoUrl: 'reference/school_of_rock_classroom.jpg',
      },
      {
        id: 'sor-scene-3-stick-it-to-the-man',
        sceneNumber: '2A',
        title: 'Rehearsal — "Stick It to the Man"',
        actLabel: 'Act II · Scene 1 (Transition)',
        synopsis:
          'The Center Classroom Chalkboard flies halfway out (+3.4m trim) as the 24-cabinet rock speaker pyramid is revealed upstage beneath electric blue and magenta moving-head rock lighting.',
        visibleElementIds: [
          'sor-truss-towers',
          'sor-classroom-wing-walls',
          'sor-speaker-stack-wall',
          'sor-center-chalkboard-fly',
          'sor-band-risers-and-cast',
          'sor-plaid-crest-floor',
          'black-velour-masking',
        ],
        battenTrimHeightsM: { 1: 0.0, 2: 0.0, 3: 3.4, 4: 0.0, 5: 0.0 },
        grandDrapeOpenFraction: 1.0,
        stageWashColor: 0xd8b8ff,
        stageSpotColor: 0x88e8ff,
        cycTopColor: 0x160a2c,
        cycBottomColor: 0x4c1268,
        houseLevel: 0.18,
        modelPhotoUrl: 'reference/school_of_rock_concert.jpg',
      },
      {
        id: 'sor-scene-4-battle-of-the-bands',
        sceneNumber: '2B',
        title: 'Battle of the Bands Concert Finale',
        actLabel: 'Act II · Finale ("Teacher\'s Pet")',
        synopsis:
          'Full concert rig active: Center chalkboard & classroom desks clear out completely to reveal the 24-cabinet speaker stack pyramid, 4 glowing aluminum box-truss towers, 8 moving-head beam fixtures, "BATTLE OF THE BANDS" marquee, road cases, and rolling band risers.',
        visibleElementIds: [
          'sor-truss-towers',
          'sor-classroom-wing-walls',
          'sor-speaker-stack-wall',
          'sor-band-risers-and-cast',
          'sor-plaid-crest-floor',
          'black-velour-masking',
        ],
        battenTrimHeightsM: { 1: 0.0, 2: 0.0, 3: 6.8, 4: 0.0, 5: 0.0 },
        grandDrapeOpenFraction: 1.0,
        stageWashColor: 0xffd8e8,
        stageSpotColor: 0xfff0d0,
        cycTopColor: 0x160a2c,
        cycBottomColor: 0x3b0f4c,
        houseLevel: 0.14,
        modelPhotoUrl: 'reference/school_of_rock_concert.jpg',
      },
    ],
  },

  build({ registerElement, textures }: ProductionSetBuilderContext): THREE.Group {
    const sorGroup = new THREE.Group();
    sorGroup.name = 'Prod_school-of-rock';

    // Shared materials
    const cherryTrimMat = new THREE.MeshStandardMaterial({
      color: 0x8e4224,
      roughness: 0.52,
      metalness: 0.08,
    });
    const darkWalnutMat = new THREE.MeshStandardMaterial({
      color: 0x562614,
      roughness: 0.56,
      metalness: 0.1,
    });
    const oakMat = new THREE.MeshStandardMaterial({
      color: 0xb87a44,
      roughness: 0.48,
      metalness: 0.06,
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xe6b84c,
      roughness: 0.25,
      metalness: 0.85,
    });
    const crestFaceMat = new THREE.MeshStandardMaterial({
      map: createHoraceGreenCrestTexture(),
      roughness: 0.35,
      metalness: 0.2,
    });
    const aluEdgeMat = new THREE.MeshStandardMaterial({
      color: 0xd0d6e0,
      roughness: 0.28,
      metalness: 0.86,
    });
    const tubularSteelMat = new THREE.MeshStandardMaterial({
      color: 0x707884,
      roughness: 0.35,
      metalness: 0.78,
    });
    const cabBodyMat = new THREE.MeshStandardMaterial({
      color: 0x15171c,
      roughness: 0.72,
      metalness: 0.15,
    });
    const grilleClothMat = new THREE.MeshStandardMaterial({
      color: 0x22262e,
      roughness: 0.82,
      metalness: 0.1,
    });
    const coneRingMat = new THREE.MeshStandardMaterial({
      color: 0x343e4e,
      roughness: 0.42,
      metalness: 0.38,
    });
    const whiteLogoMat = new THREE.MeshStandardMaterial({
      color: 0xf2f0ea,
      roughness: 0.35,
    });
    const chalkboardMat = new THREE.MeshStandardMaterial({
      map: textures.chalkboardTex,
      roughness: 0.72,
    });
    const darkDoorwayMat = new THREE.MeshStandardMaterial({
      color: 0x0b0c10,
      roughness: 0.95,
    });

    // ========================================================================
    // 1. BATTLE OF THE BANDS CONCERT TRUSS, 4 VERTICAL BOX-TRUSS TOWERS,
    //    8 MOVING-HEAD BEAMS & MARQUEE SIGN ('sor-truss-towers' / 'sor-concert-truss-sign')
    // ========================================================================
    const trussGroup = new THREE.Group();
    trussGroup.name = 'SchoolOfRockConcertTruss';
    sorGroup.add(trussGroup);
    registerElement('sor-truss-towers', trussGroup, 2);
    registerElement('sor-concert-truss-sign', trussGroup);

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

      // Vertical Concert Light Tower Bars & 2x2 Audience Blinders mounted to front of each tower
      const lightBarPipe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 3.2, 8),
        aluEdgeMat
      );
      lightBarPipe.position.set(tx, 4.4, tz + 0.27);
      trussGroup.add(lightBarPipe);

      for (const py of [3.2, 4.0, 4.8, 5.5, 6.1]) {
        const col = parColors[(idx + Math.round(py)) % parColors.length] ?? 0xff1e56;
        const canHousing = new THREE.Mesh(
          new THREE.CylinderGeometry(0.11, 0.09, 0.18, 10),
          cabBodyMat
        );
        canHousing.rotation.x = Math.PI / 2 + 0.22;
        canHousing.position.set(tx, py, tz + 0.33);
        trussGroup.add(canHousing);

        const lamp = new THREE.Mesh(
          new THREE.SphereGeometry(0.085, 10, 8),
          new THREE.MeshBasicMaterial({ color: col, toneMapped: false })
        );
        lamp.position.set(tx, py - 0.02, tz + 0.42);
        trussGroup.add(lamp);
      }

      // Inner towers carry the classical cherry-wood architrave capitals visible in Photo 2
      if (Math.abs(tx) < 3.5) {
        const towerCornice = new THREE.Mesh(
          new THREE.BoxGeometry(0.84, 0.34, 0.84),
          cherryTrimMat
        );
        towerCornice.position.set(tx, 6.45, tz);
        towerCornice.rotation.y = tx < 0 ? 0.35 : -0.35;
        trussGroup.add(towerCornice);
      }
    });

    // Overhead Upstage Concert Box-Truss Bridge with full 3D diagonal webbing
    const upstageBridge = buildHorizontalBoxTrussSpan(6.4);
    upstageBridge.position.set(0, 5.85, -4.45);
    trussGroup.add(upstageBridge);

    // 8 Moving-Head Concert Beam Fixtures along the overhead truss bridge
    const movingHeadColors = [
      0xff1e56, 0x00e5ff, 0xd500f9, 0x38e2ff,
      0x38e2ff, 0xd500f9, 0x00e5ff, 0xff1e56,
    ];
    for (let m = 0; m < 8; m++) {
      const mx = -2.625 + m * 0.75;
      const beamCol = movingHeadColors[m] ?? 0x38e2ff;
      const tilt = (m % 2 === 0 ? 1 : -1) * 0.24;
      const mh = buildMovingHeadFixture(cabBodyMat, beamCol, tilt);
      mh.position.set(mx, 5.66, -4.27);
      trussGroup.add(mh);
    }

    // High-Detail Illuminated "BATTLE OF THE BANDS" Marquee Sign suspended from the overhead bridge
    const marqueeTex = createBattleOfTheBandsMarqueeTexture();
    const marqueeGroup = new THREE.Group();
    marqueeGroup.position.set(0, 6.38, -4.12);

    const marqueeBacking = new THREE.Mesh(
      new RoundedBoxGeometry(3.85, 0.86, 0.14, 1, 0.03),
      cabBodyMat
    );
    marqueeGroup.add(marqueeBacking);

    const marqueeGoldRim = new THREE.Mesh(
      new THREE.BoxGeometry(3.94, 0.94, 0.08),
      brassMat
    );
    marqueeGoldRim.position.set(0, 0, -0.04);
    marqueeGroup.add(marqueeGoldRim);

    const marqueeFace = new THREE.Mesh(
      new THREE.PlaneGeometry(3.68, 0.74),
      new THREE.MeshBasicMaterial({ map: marqueeTex, toneMapped: false })
    );
    marqueeFace.position.set(0, 0, 0.085); // Cleanly +0.015m in front of marqueeBacking (+0.07m)
    marqueeGroup.add(marqueeFace);
    trussGroup.add(marqueeGroup);

    // Glowing Magenta & Cyan Rock Concert Haze Clouds & Volumetric Beam Cones
    const hazePalette = [
      { x: -2.4, y: 5.5, z: -2.8, r: 1.15, col: 0xff1e56 },
      { x: -0.9, y: 5.8, z: -3.4, r: 1.25, col: 0x2979ff },
      { x: 0.2, y: 5.4, z: -3.0, r: 1.1, col: 0xff1e68 },
      { x: 1.8, y: 5.6, z: -2.9, r: 1.2, col: 0xd500f9 },
      { x: 3.1, y: 5.2, z: -2.4, r: 1.05, col: 0xff1744 },
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

    for (const [bx, col, tilt] of [
      [-1.85, 0xff1e68, -0.18],
      [-0.65, 0x38e2ff, 0.28],
      [0.65, 0x38e2ff, -0.28],
      [1.85, 0xd500f9, 0.18],
    ] as const) {
      const beamCone = new THREE.Mesh(
        new THREE.ConeGeometry(0.48, 1.55, 14, 1, true),
        new THREE.MeshBasicMaterial({
          color: col,
          transparent: true,
          opacity: 0.38,
          side: THREE.DoubleSide,
          depthWrite: false,
          toneMapped: false,
        })
      );
      beamCone.position.set(bx, 4.95, -4.25);
      beamCone.rotation.z = tilt;
      trussGroup.add(beamCone);
    }

    // ========================================================================
    // 2. HORACE GREEN PREP ARCH, PORTALS & CLASSROOM WING WALLS (SL & SR)
    //    ('sor-classroom-wing-walls' / 'sor-prep-arch-portals')
    // ========================================================================
    const wingWallsGroup = new THREE.Group();
    wingWallsGroup.name = 'HoraceGreenPrepArchAndPortals';
    sorGroup.add(wingWallsGroup);
    registerElement('sor-classroom-wing-walls', wingWallsGroup);
    registerElement('sor-prep-arch-portals', wingWallsGroup);

    for (const side of [-1, 1]) {
      const wallUnit = new THREE.Group();
      wallUnit.position.set(side * 4.15, 0, -2.35);
      wallUnit.rotation.y = side * -0.58; // Raked between outer & inner truss towers

      // Slate-green chalkboard wall face (z ∈ [-0.07, +0.07])
      const boardPanel = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 3.35, 0.14),
        chalkboardMat
      );
      boardPanel.position.set(0, 2.60, 0);
      boardPanel.castShadow = true;
      boardPanel.receiveShadow = true;
      wallUnit.add(boardPanel);

      // Lower carved walnut wainscot base panel (y ∈ [0, 0.92], z ∈ [-0.08, +0.08])
      const wainscotBase = new THREE.Mesh(
        new THREE.BoxGeometry(3.26, 0.92, 0.16),
        cherryTrimMat
      );
      wainscotBase.position.set(0, 0.46, 0);
      wallUnit.add(wainscotBase);

      // Raised wainscot panels on left and right of doorway (stepped at z = +0.115m)
      for (const wx of [-1.12, 1.12]) {
        const raisedWainscot = new THREE.Mesh(
          new THREE.BoxGeometry(0.68, 0.56, 0.04),
          darkWalnutMat
        );
        raisedWainscot.position.set(wx, 0.46, 0.115);
        wallUnit.add(raisedWainscot);
      }

      // Top moulded walnut cornice & bottom chalk tray with erasers
      const topCornice = new THREE.Mesh(
        new THREE.BoxGeometry(3.52, 0.26, 0.28),
        cherryTrimMat
      );
      topCornice.position.set(0, 4.35, 0.04);
      wallUnit.add(topCornice);

      const chalkTray = new THREE.Mesh(
        new THREE.BoxGeometry(3.38, 0.12, 0.24),
        cherryTrimMat
      );
      chalkTray.position.set(0, 0.96, 0.06);
      wallUnit.add(chalkTray);

      // Fluted walnut pilasters at outer edges of the classroom portal walls
      for (const px of [-1.62, 1.62]) {
        const pilaster = buildFlutedWalnutPilaster(
          4.25,
          cherryTrimMat,
          darkWalnutMat,
          brassMat
        );
        pilaster.position.set(px, 0, 0.06);
        wallUnit.add(pilaster);
      }

      // Central Wood-Trimmed Classroom Doorway Opening (matching both photos)
      const doorVoid = new THREE.Mesh(
        new THREE.BoxGeometry(1.12, 2.35, 0.20),
        darkDoorwayMat
      );
      doorVoid.position.set(0, 1.18, 0.02); // Front face at +0.12, proud of boardPanel (+0.07)
      wallUnit.add(doorVoid);

      for (const dx of [-0.61, 0.61]) {
        const jamb = new THREE.Mesh(
          new THREE.BoxGeometry(0.14, 2.48, 0.26),
          cherryTrimMat
        );
        jamb.position.set(dx, 1.24, 0.05); // Front face at +0.18
        wallUnit.add(jamb);
      }
      const doorHeader = new THREE.Mesh(
        new THREE.BoxGeometry(1.46, 0.22, 0.30),
        darkWalnutMat
      );
      doorHeader.position.set(0, 2.52, 0.07); // Front face at +0.22
      wallUnit.add(doorHeader);

      // Brass Horace Green crest plaque mounted above the doorway pediment
      const doorCrest = buildHoraceGreenCrestPlaque(brassMat, crestFaceMat);
      doorCrest.scale.setScalar(0.68);
      doorCrest.position.set(0, 3.05, 0.14);
      wallUnit.add(doorCrest);

      // Warm milk-glass schoolhouse pendant chandelier hanging in front of each wing wall header
      const wingChandelier = buildSchoolhousePendantChandelier(0.62, brassMat);
      wingChandelier.position.set(0, 4.22, 0.45);
      wallUnit.add(wingChandelier);

      // Glass-front Horace Green Trophy & Encyclopedia Cabinet flanking the upstage side of each portal
      const trophyCabinet = buildTrophyAndBookCabinet(
        cherryTrimMat,
        darkWalnutMat,
        brassMat
      );
      trophyCabinet.position.set(side * -1.12, 0, 0.28);
      wallUnit.add(trophyCabinet);

      wingWallsGroup.add(wallUnit);
    }

    // Overhead Prep-School Walnut Arch Header & Twin Schoolhouse Chandeliers (framing the classroom portal)
    const prepArchHeader = new THREE.Group();
    prepArchHeader.position.set(0, 6.25, -3.25);

    const archBeam = new THREE.Mesh(
      new THREE.BoxGeometry(6.1, 0.36, 0.32),
      cherryTrimMat
    );
    prepArchHeader.add(archBeam);

    const centralArchCrest = buildHoraceGreenCrestPlaque(brassMat, crestFaceMat);
    centralArchCrest.position.set(0, -0.05, 0.20);
    prepArchHeader.add(centralArchCrest);

    for (const cx of [-1.75, 1.75]) {
      const chandelier = buildSchoolhousePendantChandelier(0.78, brassMat);
      chandelier.position.set(cx, -0.18, 0.12);
      prepArchHeader.add(chandelier);
    }
    wingWallsGroup.add(prepArchHeader);

    // ========================================================================
    // 3. UPSTAGE BATTLE OF THE BANDS 24-CABINET SPEAKER PYRAMID (Photo 1)
    // ========================================================================
    const speakerWallGroup = new THREE.Group();
    speakerWallGroup.position.set(0, 0, -5.35);
    sorGroup.add(speakerWallGroup);
    registerElement('sor-speaker-stack-wall', speakerWallGroup);

    // 6 columns of stacked 0.82m speaker cabinets forming the asymmetric pyramid in Photo 1
    const colHeights = [2, 3, 5, 6, 5, 3];
    colHeights.forEach((stackCount, cIdx) => {
      const cx = (cIdx - 2.5) * 0.86;
      for (let r = 0; r < stackCount; r++) {
        const cy = 0.44 + r * 0.84;
        const cab = new THREE.Mesh(
          new RoundedBoxGeometry(0.82, 0.80, 0.52, 1, 0.03),
          cabBodyMat
        );
        cab.position.set(cx, cy, 0);
        cab.castShadow = true;
        speakerWallGroup.add(cab);

        // Woven speaker grille frame (stepped +0.035m forward of cabinet front at z = 0.26)
        const grille = new THREE.Mesh(
          new THREE.BoxGeometry(0.72, 0.70, 0.02),
          grilleClothMat
        );
        grille.position.set(cx, cy, 0.285);
        speakerWallGroup.add(grille);

        // Speaker woofer cone ring & dust cap (stepped +0.032m forward of grille)
        const woofer = new THREE.Mesh(
          new THREE.RingGeometry(0.11, 0.28, 18),
          coneRingMat
        );
        woofer.position.set(cx, cy, 0.328);
        speakerWallGroup.add(woofer);

        const dustCap = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 12, 8),
          cabBodyMat
        );
        dustCap.scale.set(1, 1, 0.45);
        dustCap.position.set(cx, cy, 0.328);
        speakerWallGroup.add(dustCap);

        // Gold control strip on every second cabinet
        if (r % 2 === 1) {
          const goldStrip = new THREE.Mesh(
            new THREE.BoxGeometry(0.58, 0.045, 0.02),
            brassMat
          );
          goldStrip.position.set(cx, cy + 0.31, 0.325);
          speakerWallGroup.add(goldStrip);
        }
      }
    });

    // ========================================================================
    // 4. FLYABLE UPSTAGE CLASSROOM CHALKBOARD WALL, ROLLING CHALKBOARDS,
    //    TEACHER DESK & 6 STUDENT DESKS ('sor-center-chalkboard-fly')
    //    - Attached to centerChalkboardGroup so classroom desks & teacher desk
    //      appear in Classroom/Band Formation scenes and clear out completely
    //      for the Battle of the Bands Concert Finale!
    // ========================================================================
    const centerChalkboardGroup = new THREE.Group();
    centerChalkboardGroup.position.set(0, 0, 0);
    centerChalkboardGroup.visible = false;
    sorGroup.add(centerChalkboardGroup);
    registerElement('sor-center-chalkboard-fly', centerChalkboardGroup, 3);
    registerElement('sor-chalkboard-wagon', centerChalkboardGroup);

    const boardZ = -4.65;
    const centerBoard = new THREE.Mesh(
      new THREE.BoxGeometry(4.9, 3.2, 0.14),
      chalkboardMat
    );
    centerBoard.position.set(0, 2.55, boardZ);
    centerBoard.castShadow = true;
    centerChalkboardGroup.add(centerBoard);

    const centerTopFrame = new THREE.Mesh(
      new THREE.BoxGeometry(5.14, 0.24, 0.22),
      cherryTrimMat
    );
    centerTopFrame.position.set(0, 4.20, boardZ + 0.03);
    centerChalkboardGroup.add(centerTopFrame);

    // Side walnut frame stiles
    for (const sx of [-2.48, 2.48]) {
      const stile = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 3.36, 0.20),
        cherryTrimMat
      );
      stile.position.set(sx, 2.55, boardZ + 0.02);
      centerChalkboardGroup.add(stile);
    }

    const centerBottomTray = new THREE.Mesh(
      new THREE.BoxGeometry(5.14, 0.14, 0.26),
      cherryTrimMat
    );
    centerBottomTray.position.set(0, 0.92, boardZ + 0.05);
    centerChalkboardGroup.add(centerBottomTray);

    // Felt chalk erasers & sticks resting on the chalk tray
    const feltMat = new THREE.MeshStandardMaterial({ color: 0x2c3038, roughness: 0.9 });
    const whiteChalkMat = new THREE.MeshStandardMaterial({ color: 0xf7f7f2, roughness: 0.8 });
    const yellowChalkMat = new THREE.MeshStandardMaterial({ color: 0xffe066, roughness: 0.8 });
    for (const ex of [-1.45, 0.35, 1.65]) {
      const eraserFelt = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.035, 0.055),
        feltMat
      );
      eraserFelt.position.set(ex, 1.01, boardZ + 0.14);
      centerChalkboardGroup.add(eraserFelt);

      const eraserWood = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.022, 0.052),
        oakMat
      );
      eraserWood.position.set(ex, 1.04, boardZ + 0.14);
      centerChalkboardGroup.add(eraserWood);
    }
    for (let c = 0; c < 8; c++) {
      const cx = -1.8 + c * 0.48;
      const chalkStick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.085, 6),
        c % 3 === 0 ? yellowChalkMat : whiteChalkMat
      );
      chalkStick.rotation.z = Math.PI / 2;
      chalkStick.rotation.y = ((c * 13) % 5 - 2) * 0.14;
      chalkStick.position.set(cx, 1.005, boardZ + 0.15);
      centerChalkboardGroup.add(chalkStick);
    }

    // Pull-down Classroom Music Staff Roller Chart on left side of center chalkboard
    const chartSheet = new THREE.Mesh(
      new THREE.BoxGeometry(1.55, 1.18, 0.016),
      new THREE.MeshStandardMaterial({ color: 0xf5eedc, roughness: 0.65 })
    );
    chartSheet.position.set(-1.35, 3.38, boardZ + 0.11);
    centerChalkboardGroup.add(chartSheet);

    for (let s = 0; s < 5; s++) {
      const staffLine = new THREE.Mesh(
        new THREE.BoxGeometry(1.38, 0.008, 0.008),
        cabBodyMat
      );
      staffLine.position.set(-1.35, 3.62 - s * 0.08, boardZ + 0.145);
      centerChalkboardGroup.add(staffLine);
    }
    const chartDowel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 1.64, 8),
      oakMat
    );
    chartDowel.rotation.z = Math.PI / 2;
    chartDowel.position.set(-1.35, 2.78, boardZ + 0.12);
    centerChalkboardGroup.add(chartDowel);

    const pullRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.032, 0.006, 6, 12),
      brassMat
    );
    pullRing.position.set(-1.35, 2.62, boardZ + 0.12);
    centerChalkboardGroup.add(pullRing);

    // Two smaller rolling chalkboards on tubular steel caster frames flanking the center board
    for (const side of [-1, 1]) {
      const wagonGroup = new THREE.Group();
      wagonGroup.position.set(side * 2.35, 0, -4.15);

      const smallBoard = new THREE.Mesh(
        new THREE.BoxGeometry(1.45, 1.55, 0.09),
        chalkboardMat
      );
      smallBoard.position.set(0, 1.85, 0);
      smallBoard.castShadow = true;
      wagonGroup.add(smallBoard);

      const smallTopFrame = new THREE.Mesh(
        new THREE.BoxGeometry(1.56, 0.09, 0.14),
        cherryTrimMat
      );
      smallTopFrame.position.set(0, 2.65, 0.01);
      wagonGroup.add(smallTopFrame);

      const smallTray = new THREE.Mesh(
        new THREE.BoxGeometry(1.56, 0.08, 0.16),
        cherryTrimMat
      );
      smallTray.position.set(0, 1.06, 0.02);
      wagonGroup.add(smallTray);

      for (const lx of [-0.74, 0.74]) {
        const upright = new THREE.Mesh(
          new THREE.CylinderGeometry(0.018, 0.018, 1.95, 8),
          tubularSteelMat
        );
        upright.position.set(lx, 1.02, 0);
        wagonGroup.add(upright);

        const footBar = new THREE.Mesh(
          new THREE.BoxGeometry(0.05, 0.04, 0.68),
          tubularSteelMat
        );
        footBar.position.set(lx, 0.08, 0);
        wagonGroup.add(footBar);

        for (const wz of [-0.28, 0.28]) {
          const caster = new THREE.Mesh(
            new THREE.CylinderGeometry(0.035, 0.035, 0.025, 10),
            cabBodyMat
          );
          caster.rotation.z = Math.PI / 2;
          caster.position.set(lx, 0.035, wz);
          wagonGroup.add(caster);
        }
      }

      centerChalkboardGroup.add(wagonGroup);
    }

    // 4b. Teacher's Oak Pedestal Desk with Globe, Stack of Textbooks, Apple & Dewey's Red Gibson SG
    //     Attached to centerChalkboardGroup at clean Stage-Left classroom coordinates (x = 2.65, z = -2.35)
    const teacherDeskGroup = new THREE.Group();
    teacherDeskGroup.position.set(2.65, 0, -2.35);
    teacherDeskGroup.rotation.y = -0.36;
    centerChalkboardGroup.add(teacherDeskGroup);

    const teacherDesktop = new THREE.Mesh(
      new RoundedBoxGeometry(1.32, 0.05, 0.68, 1, 0.015),
      oakMat
    );
    teacherDesktop.position.set(0, 0.76, 0);
    teacherDesktop.castShadow = true;
    teacherDesktop.receiveShadow = true;
    teacherDeskGroup.add(teacherDesktop);

    for (const px of [-0.44, 0.44]) {
      const pedestal = new THREE.Mesh(
        new THREE.BoxGeometry(0.34, 0.70, 0.60),
        cherryTrimMat
      );
      pedestal.position.set(px, 0.37, 0);
      pedestal.castShadow = true;
      teacherDeskGroup.add(pedestal);

      for (const dy of [0.20, 0.39, 0.58]) {
        const drawerFront = new THREE.Mesh(
          new THREE.BoxGeometry(0.28, 0.15, 0.025),
          darkWalnutMat
        );
        drawerFront.position.set(px, dy, 0.315);
        teacherDeskGroup.add(drawerFront);

        const pull = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.018, 0.02),
          brassMat
        );
        pull.position.set(px, dy, 0.342);
        teacherDeskGroup.add(pull);
      }
    }

    const modestyPanel = new THREE.Mesh(
      new THREE.BoxGeometry(0.54, 0.52, 0.03),
      darkWalnutMat
    );
    modestyPanel.position.set(0, 0.44, 0.12);
    teacherDeskGroup.add(modestyPanel);

    const globeBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.09, 0.04, 12),
      darkWalnutMat
    );
    globeBase.position.set(-0.40, 0.805, 0.10);
    teacherDeskGroup.add(globeBase);

    const globeMeridian = new THREE.Mesh(
      new THREE.TorusGeometry(0.145, 0.012, 8, 18, Math.PI * 1.15),
      brassMat
    );
    globeMeridian.rotation.z = -Math.PI / 2 + 0.38;
    globeMeridian.position.set(-0.40, 0.97, 0.10);
    teacherDeskGroup.add(globeMeridian);

    const globeSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.125, 16, 12),
      new THREE.MeshStandardMaterial({
        color: 0x2e86ab,
        roughness: 0.35,
        metalness: 0.1,
      })
    );
    globeSphere.position.set(-0.40, 0.97, 0.10);
    teacherDeskGroup.add(globeSphere);

    const stackColors = [0x8e1b26, 0x1d3b5c, 0x24583c];
    stackColors.forEach((col, sIdx) => {
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(0.26, 0.042, 0.19),
        new THREE.MeshStandardMaterial({ color: col, roughness: 0.55 })
      );
      book.position.set(0.35, 0.806 + sIdx * 0.044, 0.10);
      book.rotation.y = (sIdx - 1) * 0.16;
      teacherDeskGroup.add(book);
    });

    const redApple = new THREE.Mesh(
      new THREE.SphereGeometry(0.042, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0xd81b28, roughness: 0.22, metalness: 0.1 })
    );
    redApple.scale.set(1, 0.88, 1);
    redApple.position.set(0.35, 0.955, 0.10);
    teacherDeskGroup.add(redApple);

    const appleLeaf = new THREE.Mesh(
      new THREE.BoxGeometry(0.028, 0.008, 0.014),
      new THREE.MeshStandardMaterial({ color: 0x2e8b44, roughness: 0.5 })
    );
    appleLeaf.position.set(0.365, 0.995, 0.10);
    appleLeaf.rotation.z = 0.35;
    teacherDeskGroup.add(appleLeaf);

    const gibsonSgStand = buildGibsonSgOnStand(tubularSteelMat, aluEdgeMat);
    gibsonSgStand.position.set(-0.88, 0, 0.12);
    gibsonSgStand.rotation.y = 0.38;
    teacherDeskGroup.add(gibsonSgStand);

    // 4c. 6 Horace Green Student Desks in Mid-Downstage Classroom Area (z = -1.25m and z = -2.25m)
    //     Attached to centerChalkboardGroup so they sit in clean open classroom floor in Scenes 1A/1B
    //     and clear out completely in Scene 2B (Battle of the Bands Finale).
    const classroomDesksGroup = new THREE.Group();
    classroomDesksGroup.name = 'HoraceGreenStudentDesks';
    centerChalkboardGroup.add(classroomDesksGroup);
    registerElement('sor-classroom-desks', classroomDesksGroup);

    const deskPlacements: ReadonlyArray<{
      readonly x: number;
      readonly z: number;
      readonly rotY: number;
      readonly bookCol: number;
    }> = [
      { x: -2.05, z: -1.25, rotY: 0.16, bookCol: 0x8e1b26 },
      { x: -0.78, z: -1.25, rotY: 0.08, bookCol: 0x1d446b },
      { x: 0.82, z: -1.25, rotY: -0.08, bookCol: 0x265c3e },
      { x: -2.05, z: -2.25, rotY: 0.16, bookCol: 0x6e2a54 },
      { x: -0.78, z: -2.25, rotY: 0.08, bookCol: 0xb87624 },
      { x: 0.82, z: -2.25, rotY: -0.08, bookCol: 0x8e1b26 },
    ];
    for (const dp of deskPlacements) {
      const deskUnit = buildStudentDeskAndChair(oakMat, tubularSteelMat, dp.bookCol);
      deskUnit.position.set(dp.x, 0, dp.z);
      deskUnit.rotation.y = dp.rotY;
      classroomDesksGroup.add(deskUnit);
    }

    // ========================================================================
    // 5. BAND RISERS (DRUM KIT, HAMMOND ORGAN/SYNTH, MARSHALL & AMPEG BACKLINE),
    //    ROAD CASES, WEDGE MONITORS & ARTICULATED BAND CAST at z = -3.55m
    //    ('sor-band-risers-and-cast' / 'sor-band-riser-amps')
    // ========================================================================
    const bandAndCastGroup = new THREE.Group();
    bandAndCastGroup.name = 'SchoolOfRockBandRisersAndCast';
    sorGroup.add(bandAndCastGroup);
    registerElement('sor-band-risers-and-cast', bandAndCastGroup);
    registerElement('sor-band-riser-amps', bandAndCastGroup);

    // 5a. Downstage Left & Right Black Concert Road Cases with Silver Trim (Photo 1)
    for (const side of [-1, 1]) {
      const roadCase = new THREE.Group();
      roadCase.position.set(side * 3.75, 0, -1.25);
      roadCase.rotation.y = side * -0.14;

      const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.45, 0.78, 0.72),
        cabBodyMat
      );
      body.position.y = 0.44;
      body.castShadow = true;
      roadCase.add(body);

      const topRim = new THREE.Mesh(
        new THREE.BoxGeometry(1.50, 0.045, 0.77),
        aluEdgeMat
      );
      topRim.position.y = 0.83;
      roadCase.add(topRim);

      const botRim = new THREE.Mesh(
        new THREE.BoxGeometry(1.50, 0.045, 0.77),
        aluEdgeMat
      );
      botRim.position.y = 0.06;
      roadCase.add(botRim);

      for (const lx of [-0.38, 0.38]) {
        const latch = new THREE.Mesh(
          new THREE.BoxGeometry(0.11, 0.14, 0.025),
          aluEdgeMat
        );
        latch.position.set(lx, 0.56, 0.38);
        roadCase.add(latch);
      }

      // Summer & Tomika cheering atop the road cases (feet cleanly on y = 0.85m top lid)
      const rockerOnCase = createHumanScaleFigure(
        1.42,
        side < 0 ? 0x22262e : 0x6e1d2a,
        0,
        0,
        false,
        {
          armPose: 'cheering',
          pantsColorHex: 0x323846,
          hairColorHex: side < 0 ? 0xd49a38 : 0x241814,
          trimColorHex: 0xf2ede2,
        }
      );
      rockerOnCase.position.set(0, 0.85, 0);
      roadCase.add(rockerOnCase);

      bandAndCastGroup.add(roadCase);
    }

    // 5b. Stage Right Rolling Keyboard Riser at z = -3.55m: Hammond B3 Organ + Yamaha S90 ES Synth Rig
    const keysRiser = new THREE.Group();
    keysRiser.position.set(-1.65, 0, -3.55);
    bandAndCastGroup.add(keysRiser);

    const keysDeck = new THREE.Mesh(
      new THREE.BoxGeometry(1.85, 0.36, 1.25),
      cabBodyMat
    );
    keysDeck.position.y = 0.18;
    keysDeck.castShadow = true;
    keysDeck.receiveShadow = true;
    keysRiser.add(keysDeck);

    // Vintage Walnut Hammond B3 Organ Cabinet & Dual Manuals (resting on y = 0.36m riser deck)
    const hammondBody = new THREE.Mesh(
      new RoundedBoxGeometry(1.26, 0.68, 0.48, 1, 0.02),
      cherryTrimMat
    );
    hammondBody.position.set(-0.08, 0.36 + 0.34, 0.18);
    hammondBody.castShadow = true;
    keysRiser.add(hammondBody);

    for (const [ky, kz] of [
      [1.00, 0.28],
      [1.16, 0.16],
    ] as const) {
      const synthChassis = new THREE.Mesh(
        new THREE.BoxGeometry(1.32, 0.08, 0.32),
        cabBodyMat
      );
      synthChassis.position.set(-0.08, ky, kz);
      keysRiser.add(synthChassis);

      const whiteKeys = new THREE.Mesh(
        new THREE.BoxGeometry(1.16, 0.025, 0.12),
        whiteLogoMat
      );
      whiteKeys.position.set(-0.08, ky + 0.052, kz + 0.08);
      keysRiser.add(whiteKeys);

      const blackKeys = new THREE.Mesh(
        new THREE.BoxGeometry(1.10, 0.022, 0.065),
        cabBodyMat
      );
      blackKeys.position.set(-0.08, ky + 0.075, kz + 0.05);
      keysRiser.add(blackKeys);
    }

    const leslieAmp = new THREE.Mesh(
      new RoundedBoxGeometry(0.46, 0.72, 0.42, 1, 0.02),
      darkWalnutMat
    );
    leslieAmp.position.set(0.66, 0.36 + 0.36, 0.08);
    leslieAmp.castShadow = true;
    keysRiser.add(leslieAmp);

    // Lawrence standing on the keyboard riser deck (y = 0.36m, z = -0.34m behind organ)
    const lawrenceFig = createHumanScaleFigure(1.44, 0x5c1a24, 0, 0, false, {
      armPose: 'playing',
      pantsColorHex: 0x262936,
      hairColorHex: 0x6e3b1e,
      trimColorHex: 0xf2ede2,
    });
    lawrenceFig.position.set(-0.08, 0.36, -0.34);
    keysRiser.add(lawrenceFig);

    // 5c. Stage Left-Center Rolling Drum Kit Riser at z = -3.55m: Full Multi-Piece Rock Drum Kit
    const drumRiser = new THREE.Group();
    drumRiser.position.set(1.05, 0, -3.55);
    bandAndCastGroup.add(drumRiser);

    const drumDeck = new THREE.Mesh(
      new THREE.BoxGeometry(1.95, 0.36, 1.45),
      cabBodyMat
    );
    drumDeck.position.y = 0.18;
    drumDeck.castShadow = true;
    drumDeck.receiveShadow = true;
    drumRiser.add(drumDeck);

    const drumShellMat = new THREE.MeshStandardMaterial({
      color: 0x8e1824,
      roughness: 0.25,
      metalness: 0.55,
    });
    const batterHeadMat = new THREE.MeshStandardMaterial({
      color: 0xf0eee6,
      roughness: 0.45,
    });
    const drumLogoTex = createDrumheadLogoTexture();

    // 22" Bass Drum with custom "SCHOOL OF ROCK" front resonant head (on y = 0.36m deck)
    const kickDrum = new THREE.Mesh(
      new THREE.CylinderGeometry(0.30, 0.30, 0.44, 20),
      drumShellMat
    );
    kickDrum.rotation.x = Math.PI / 2;
    kickDrum.position.set(0, 0.36 + 0.31, 0.22);
    kickDrum.castShadow = true;
    drumRiser.add(kickDrum);

    const kickFrontHead = new THREE.Mesh(
      new THREE.CircleGeometry(0.285, 20),
      new THREE.MeshStandardMaterial({ map: drumLogoTex, roughness: 0.35 })
    );
    kickFrontHead.position.set(0, 0.36 + 0.31, 0.475);
    drumRiser.add(kickFrontHead);

    // 2 Rack Toms (10" and 12") mounted above the bass drum
    for (const [tx, tr, rotZ] of [
      [-0.17, 0.14, 0.22],
      [0.17, 0.16, -0.22],
    ] as const) {
      const rackTom = new THREE.Mesh(
        new THREE.CylinderGeometry(tr, tr, 0.22, 16),
        [drumShellMat, batterHeadMat, batterHeadMat]
      );
      rackTom.position.set(tx, 0.36 + 0.72, 0.18);
      rackTom.rotation.x = 0.38;
      rackTom.rotation.z = rotZ;
      drumRiser.add(rackTom);
    }

    // 14" Snare Drum on chrome tripod stand
    const snareStand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.018, 0.52, 8),
      aluEdgeMat
    );
    snareStand.position.set(-0.38, 0.36 + 0.26, 0.02);
    drumRiser.add(snareStand);

    const snareDrum = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.14, 16),
      [aluEdgeMat, batterHeadMat, batterHeadMat]
    );
    snareDrum.position.set(-0.38, 0.36 + 0.56, 0.02);
    snareDrum.rotation.x = 0.15;
    drumRiser.add(snareDrum);

    // 16" Floor Tom on 3 legs
    const floorTom = new THREE.Mesh(
      new THREE.CylinderGeometry(0.21, 0.21, 0.38, 16),
      [drumShellMat, batterHeadMat, batterHeadMat]
    );
    floorTom.position.set(0.44, 0.36 + 0.40, 0.0);
    drumRiser.add(floorTom);

    // Hi-Hat Stand + 2 Crash Cymbals + 20" Ride Cymbal on Chrome Boom Stands
    const cymbalSpecs: ReadonlyArray<{
      readonly x: number;
      readonly y: number;
      readonly z: number;
      readonly r: number;
      readonly tiltX: number;
      readonly tiltZ: number;
      readonly isHiHat?: boolean;
    }> = [
      { x: -0.58, y: 1.10, z: 0.12, r: 0.17, tiltX: 0.06, tiltZ: 0.05, isHiHat: true },
      { x: -0.52, y: 1.38, z: 0.26, r: 0.23, tiltX: 0.26, tiltZ: 0.15 },
      { x: 0.52, y: 1.42, z: 0.24, r: 0.24, tiltX: 0.26, tiltZ: -0.15 },
      { x: 0.58, y: 1.22, z: 0.02, r: 0.26, tiltX: 0.20, tiltZ: -0.22 },
    ];
    for (const cSpec of cymbalSpecs) {
      const standPole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.014, cSpec.y - 0.36, 8),
        aluEdgeMat
      );
      standPole.position.set(cSpec.x, 0.36 + (cSpec.y - 0.36) / 2, cSpec.z);
      drumRiser.add(standPole);

      const cym = new THREE.Mesh(
        new THREE.CylinderGeometry(cSpec.r, cSpec.r, 0.014, 16),
        brassMat
      );
      cym.position.set(cSpec.x, cSpec.y, cSpec.z);
      cym.rotation.x = cSpec.tiltX;
      cym.rotation.z = cSpec.tiltZ;
      drumRiser.add(cym);

      if (cSpec.isHiHat) {
        const botHat = new THREE.Mesh(
          new THREE.CylinderGeometry(cSpec.r, cSpec.r, 0.014, 16),
          brassMat
        );
        botHat.position.set(cSpec.x, cSpec.y - 0.035, cSpec.z);
        drumRiser.add(botHat);
      }
    }

    // Freddy standing cleanly on the drum riser deck at y = 0.36m, z = -0.38m behind the kit
    const freddyFig = createHumanScaleFigure(1.44, 0x5c1a24, 0, 0, false, {
      armPose: 'playing',
      pantsColorHex: 0x262936,
      hairColorHex: 0x241a14,
      trimColorHex: 0xf2ede2,
    });
    freddyFig.position.set(0, 0.36, -0.38);
    drumRiser.add(freddyFig);

    // 5d. Marshall 4x12 Guitar Half-Stacks & Ampeg 8x10 Bass Stack Backline at z = -3.65m
    const marshallLeft = buildMarshallStackUnit(
      cabBodyMat,
      grilleClothMat,
      coneRingMat,
      brassMat,
      whiteLogoMat,
      true
    );
    marshallLeft.position.set(2.48, 0, -3.65);
    marshallLeft.rotation.y = -0.24;
    bandAndCastGroup.add(marshallLeft);

    const marshallRight = buildMarshallStackUnit(
      cabBodyMat,
      grilleClothMat,
      coneRingMat,
      brassMat,
      whiteLogoMat,
      true
    );
    marshallRight.position.set(-2.95, 0, -3.65);
    marshallRight.rotation.y = 0.28;
    bandAndCastGroup.add(marshallRight);

    // Ampeg SVT 8x10 Bass Stack between the keyboard & drum risers
    const ampegGroup = new THREE.Group();
    ampegGroup.position.set(-0.32, 0, -3.72);
    ampegGroup.rotation.y = 0.08;
    const ampegCab = new THREE.Mesh(
      new RoundedBoxGeometry(0.68, 1.24, 0.44, 1, 0.025),
      cabBodyMat
    );
    ampegCab.position.y = 0.62;
    ampegCab.castShadow = true;
    ampegGroup.add(ampegCab);

    const ampegGrille = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 1.14, 0.02),
      grilleClothMat
    );
    ampegGrille.position.set(0, 0.62, 0.24);
    ampegGroup.add(ampegGrille);

    for (let row = 0; row < 4; row++) {
      for (const colX of [-0.14, 0.14]) {
        const woofer10 = new THREE.Mesh(
          new THREE.RingGeometry(0.03, 0.105, 12),
          coneRingMat
        );
        woofer10.position.set(colX, 0.22 + row * 0.265, 0.272);
        ampegGroup.add(woofer10);
      }
    }
    const svtHead = new THREE.Mesh(
      new RoundedBoxGeometry(0.64, 0.26, 0.36, 1, 0.02),
      cabBodyMat
    );
    svtHead.position.set(0, 1.37, 0);
    ampegGroup.add(svtHead);
    bandAndCastGroup.add(ampegGroup);

    // 5e. Downstage Rock Frontline: Dewey Finn, Zack (Lead Guitar), Katie (Bass) & Boom Mic Stands
    //     Positioned cleanly downstage at z = -0.55m..-0.95m (zero overlap with classroom desks at z = -1.25m..-2.25m)
    const deweyFig = createHumanScaleFigure(1.76, 0x6e222e, 0, 0, false, {
      hasGuitarHex: 0xb81422,
      armPose: 'playing',
      pantsColorHex: 0x3b2c24,
      hairColorHex: 0x241810,
      trimColorHex: 0xf2ede2,
    });
    deweyFig.position.set(0.08, 0, -0.68);
    bandAndCastGroup.add(deweyFig);

    const zackFig = createHumanScaleFigure(1.48, 0x5c1a24, 0, 0, false, {
      hasGuitarHex: 0x2979ff,
      armPose: 'playing',
      pantsColorHex: 0x262936,
      hairColorHex: 0x3b2416,
      trimColorHex: 0xf2ede2,
    });
    zackFig.position.set(1.92, 0, -0.78);
    zackFig.rotation.y = -0.32;
    bandAndCastGroup.add(zackFig);

    const katieFig = createHumanScaleFigure(1.45, 0x5c1a24, 0, 0, false, {
      hasGuitarHex: 0xd48828,
      armPose: 'playing',
      pantsColorHex: 0x262936,
      hairColorHex: 0x8c3b24,
      trimColorHex: 0xf2ede2,
    });
    katieFig.position.set(-1.42, 0, -0.78);
    katieFig.rotation.y = 0.28;
    bandAndCastGroup.add(katieFig);

    // 3 Vocal Microphone Stands with Boom Arms in front of Dewey, Zack & Katie
    for (const [mx, mz, baseCol] of [
      [0.08, -0.35, 0xc82432],
      [1.78, -0.46, 0x22262e],
      [-1.28, -0.46, 0x22262e],
    ] as const) {
      const micStand = new THREE.Group();
      micStand.position.set(mx, 0, mz);

      const micBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.18, 0.04, 14),
        new THREE.MeshStandardMaterial({ color: baseCol, roughness: 0.4 })
      );
      micBase.position.y = 0.02;
      micStand.add(micBase);

      const micPole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 1.36, 8),
        aluEdgeMat
      );
      micPole.position.y = 0.70;
      micStand.add(micPole);

      const boomArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.009, 0.009, 0.56, 8),
        aluEdgeMat
      );
      boomArm.position.set(0, 1.38, -0.10);
      boomArm.rotation.x = 1.15;
      micStand.add(boomArm);

      const micCapsule = new THREE.Mesh(
        new THREE.SphereGeometry(0.026, 10, 8),
        aluEdgeMat
      );
      micCapsule.position.set(0, 1.48, -0.26);
      micStand.add(micCapsule);

      bandAndCastGroup.add(micStand);
    }

    // 5f. 4 Downstage Apron Wedge Stage Monitors with Dual Cones & grilles (both photos)
    for (const wx of [-3.85, -1.35, 1.35, 3.85]) {
      const wedgeGroup = new THREE.Group();
      wedgeGroup.position.set(wx, 0.18, 0.55);
      wedgeGroup.rotation.x = -0.38;

      const wedgeBody = new THREE.Mesh(
        new RoundedBoxGeometry(0.62, 0.34, 0.44, 1, 0.03),
        cabBodyMat
      );
      wedgeBody.castShadow = true;
      wedgeGroup.add(wedgeBody);

      const wedgeGrille = new THREE.Mesh(
        new THREE.BoxGeometry(0.54, 0.26, 0.02),
        grilleClothMat
      );
      wedgeGrille.position.set(0, 0, -0.24);
      wedgeGroup.add(wedgeGrille);

      for (const cx of [-0.14, 0.14]) {
        const cone = new THREE.Mesh(
          new THREE.RingGeometry(0.03, 0.095, 12),
          coneRingMat
        );
        cone.rotation.y = Math.PI;
        cone.position.set(cx, 0, -0.272);
        wedgeGroup.add(cone);
      }

      bandAndCastGroup.add(wedgeGroup);
    }

    return sorGroup;
  },
};
