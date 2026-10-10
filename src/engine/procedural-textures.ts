import * as THREE from 'three';

/**
 * Generates the signature McColl Family Theatre seat upholstery tapestry texture
 * seen in the auditorium photograph: rich crimson/burgundy woven jacquard with
 * subtle teal, gold, and russet geometric diamonds.
 */
export function createSeatTapestryTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#6d2329';
    ctx.fillRect(0, 0, 256, 256);

    // Subtle fabric warp/weft grain
    for (let y = 0; y < 256; y += 2) {
      for (let x = 0; x < 256; x += 2) {
        const n = ((x * 13 + y * 29) % 18) - 9;
        ctx.fillStyle = `rgb(${112 + n}, ${34 + Math.floor(n * 0.4)}, ${40 + Math.floor(n * 0.4)})`;
        ctx.fillRect(x, y, 2, 2);
      }
    }

    // Jacquard geometric diamond motif matching the Charlotte Children's Theatre seat fabric
    const step = 32;
    for (let gy = 0; gy < 256; gy += step) {
      for (let gx = 0; gx < 256; gx += step) {
        const cx = gx + step / 2;
        const cy = gy + step / 2;

        // Outer terracotta/gold diamond
        ctx.strokeStyle = 'rgba(196, 126, 74, 0.55)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, gy + 3);
        ctx.lineTo(gx + step - 3, cy);
        ctx.lineTo(cx, gy + step - 3);
        ctx.lineTo(gx + 3, cy);
        ctx.closePath();
        ctx.stroke();

        // Inner muted slate-teal accent diamond
        ctx.fillStyle = 'rgba(64, 118, 122, 0.58)';
        ctx.beginPath();
        ctx.moveTo(cx, cy - 6);
        ctx.lineTo(cx + 6, cy);
        ctx.lineTo(cx, cy + 6);
        ctx.lineTo(cx - 6, cy);
        ctx.closePath();
        ctx.fill();

        // Warm gold center fleck
        ctx.fillStyle = 'rgba(218, 168, 92, 0.7)';
        ctx.fillRect(cx - 1.5, cy - 1.5, 3, 3);
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates the architectural wood acoustic wall paneling seen in the McColl Family Theatre
 * house walls: vertical bays with alternating warm honey-maple and rich walnut/cherry panels,
 * divided by dark architectural reveal joints.
 */
export function createAcousticWoodWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#1b1411';
    ctx.fillRect(0, 0, 512, 512);

    const cols = 4;
    const rows = 4;
    const cw = 512 / cols;
    const rh = 512 / rows;

    const maple = [184, 138, 92];
    const walnut = [96, 56, 42];
    const cherry = [124, 68, 48];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isLight = (r + c * 2) % 5 === 0 || (r === 1 && c === 2) || (r === 3 && c === 0);
        const palette = isLight ? maple : (r + c) % 2 === 0 ? walnut : cherry;
        const x = c * cw + 4;
        const y = r * rh + 3;
        const w = cw - 8;
        const h = rh - 6;

        ctx.fillStyle = `rgb(${palette[0]}, ${palette[1]}, ${palette[2]})`;
        ctx.fillRect(x, y, w, h);

        // Fine vertical wood grain streaks
        for (let gx = x; gx < x + w; gx += 3) {
          const grainDelta = ((gx * 17 + r * 31 + c * 13) % 16) - 8;
          ctx.fillStyle = `rgba(${palette[0] + grainDelta}, ${palette[1] + grainDelta}, ${palette[2] + grainDelta}, 0.42)`;
          ctx.fillRect(gx, y, 2, h);
        }

        // Micro acoustic perforations
        ctx.fillStyle = 'rgba(20, 12, 10, 0.16)';
        for (let py = y + 8; py < y + h - 6; py += 12) {
          for (let px = x + 8; px < x + w - 6; px += 12) {
            ctx.fillRect(px, py, 2, 2);
          }
        }
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates the black-and-white checkerboard relief texture on the House-Left
 * Alice in Wonderland proscenium sculptural frieze in `da3a8cf7.jpg`.
 */
export function createProsceniumCheckerTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const cells = 4;
    const size = 512 / cells;
    for (let r = 0; r < cells; r++) {
      for (let c = 0; c < cells; c++) {
        const isWhite = (r + c) % 2 === 0;
        ctx.fillStyle = isWhite ? '#e6e1d6' : '#18191e';
        ctx.fillRect(c * size, r * size, size, size);
      }
    }
    ctx.strokeStyle = '#14151a';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, 504, 504);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates the white quilted diamond-grid square panel on the House-Right
 * Alice in Wonderland proscenium sculptural frieze in `da3a8cf7.jpg`.
 */
export function createQuiltedDiamondTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#eae5dc';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = '#b4aea2';
    ctx.lineWidth = 5;
    const step = 84;
    for (let i = -512; i <= 1024; i += step) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 512, 512);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(i + 512, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
    }

    ctx.strokeStyle = '#cac4b8';
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, 500, 500);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates the painted radiating perspective ray stage floor from the
 * Alice in Wonderland production photo (`da3a8cf7.jpg`).
 */
export function createAliceRayStageFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Deep matte black marley perimeter
    ctx.fillStyle = '#101115';
    ctx.fillRect(0, 0, 1024, 1024);

    // Radiating whimsical rays converging toward upstage-center-left
    const originX = 480;
    const originY = 260;
    const rays: ReadonlyArray<{ readonly a0: number; readonly a1: number; readonly color: string }> = [
      { a0: -2.8, a1: -2.3, color: '#6b141a' },
      { a0: -2.3, a1: -1.9, color: '#161820' },
      { a0: -1.9, a1: -1.45, color: '#9c1c26' },
      { a0: -1.45, a1: -1.1, color: '#1c2438' },
      { a0: -1.1, a1: -0.72, color: '#7a1720' },
      { a0: -0.72, a1: -0.35, color: '#14161d' },
      { a0: -0.35, a1: 0.08, color: '#b51f29' },
      { a0: 0.08, a1: 0.42, color: '#d49b1a' },
      { a0: 0.42, a1: 0.78, color: '#8f1b24' },
      { a0: 0.78, a1: 1.15, color: '#1a2744' },
      { a0: 1.15, a1: 1.52, color: '#c4242b' },
      { a0: 1.52, a1: 1.85, color: '#e0a820' },
      { a0: 1.85, a1: 2.25, color: '#6e161d' },
      { a0: 2.25, a1: 2.75, color: '#151821' },
      { a0: 2.75, a1: 3.48, color: '#821922' },
    ];

    for (const ray of rays) {
      ctx.fillStyle = ray.color;
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.arc(originX, originY, 950, ray.a0, ray.a1);
      ctx.closePath();
      ctx.fill();
    }

    // Concentric geometric fracture lines across the rays
    ctx.strokeStyle = 'rgba(15, 15, 20, 0.65)';
    ctx.lineWidth = 6;
    for (const r of [160, 290, 440, 610]) {
      ctx.beginPath();
      ctx.arc(originX, originY, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Vignette fade into dark stage wings
    const grad = ctx.createRadialGradient(512, 540, 180, 512, 540, 520);
    grad.addColorStop(0, 'rgba(16, 17, 21, 0)');
    grad.addColorStop(0.78, 'rgba(16, 17, 21, 0.35)');
    grad.addColorStop(1, 'rgba(16, 17, 21, 0.96)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates a black theatrical marley stage deck texture, optionally with
 * a 1m CAD designer grid, Centerline (CL), and Plaster Line (PL) markings.
 */
export function createMarleyStageDeckTexture(showDesignerGrid: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#181a1f';
    ctx.fillRect(0, 0, 1024, 1024);

    // Marley vinyl roll seams & subtle stage scuff variation
    for (let y = 0; y < 1024; y += 128) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    if (showDesignerGrid) {
      // 1-meter Minor Grid
      const step = 64;
      ctx.strokeStyle = 'rgba(92, 168, 224, 0.22)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i <= 1024; i += step) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 1024);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(1024, i);
        ctx.stroke();
      }

      // Centerline (CL) dashed cyan spike line
      ctx.strokeStyle = 'rgba(72, 212, 255, 0.72)';
      ctx.lineWidth = 3;
      ctx.setLineDash([16, 10]);
      ctx.beginPath();
      ctx.moveTo(512, 0);
      ctx.lineTo(512, 1024);
      ctx.stroke();

      // Plaster Line (PL) gold spike line near downstage
      ctx.strokeStyle = 'rgba(245, 190, 68, 0.78)';
      ctx.beginPath();
      ctx.moveTo(0, 740);
      ctx.lineTo(1024, 740);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates pleated theatrical velour drapery texture (crimson or black).
 */
export function createVelourCurtainTexture(
  baseRgb: readonly [number, number, number],
  pleats = 16
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    for (let x = 0; x < 512; x++) {
      const wave = Math.sin((x / 512) * Math.PI * 2 * pleats);
      const fold = 0.68 + 0.32 * wave;
      const r = Math.min(255, Math.max(0, Math.round(baseRgb[0] * fold)));
      const g = Math.min(255, Math.max(0, Math.round(baseRgb[1] * fold)));
      const b = Math.min(255, Math.max(0, Math.round(baseRgb[2] * fold)));
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(x, 0, 1, 512);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates weathered vertical barn wood planks for Charlotte's Web.
 */
export function createBarnWoodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const planks = 8;
    const pw = 512 / planks;
    for (let p = 0; p < planks; p++) {
      const x = p * pw;
      const delta = ((p * 19) % 24) - 12;
      ctx.fillStyle = `rgb(${128 + delta}, ${54 + Math.floor(delta * 0.5)}, ${38 + Math.floor(delta * 0.4)})`;
      ctx.fillRect(x, 0, pw - 3, 512);
      ctx.fillStyle = '#1f110d';
      ctx.fillRect(x + pw - 3, 0, 3, 512);

      for (let y = 0; y < 512; y += 8) {
        const g = ((p * 37 + y * 13) % 16) - 8;
        ctx.fillStyle = `rgba(${115 + g}, ${48 + g}, ${34 + g}, 0.35)`;
        ctx.fillRect(x + 2, y, pw - 6, 6);
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates stacked library bookshelf spines for Matilda The Musical.
 */
export function createLibraryBooksTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#1e1612';
    ctx.fillRect(0, 0, 512, 512);

    const shelves = 6;
    const sh = 512 / shelves;
    const colors = ['#8c262e', '#1f4e6b', '#2e6347', '#b57c24', '#523468', '#7a3e26', '#2b3a4a'];

    for (let s = 0; s < shelves; s++) {
      const sy = s * sh;
      // Wood shelf plank
      ctx.fillStyle = '#4a3020';
      ctx.fillRect(0, sy + sh - 10, 512, 10);

      let bx = 8;
      let idx = s * 17;
      while (bx < 498) {
        const bw = 12 + ((idx * 13) % 16);
        const bh = sh - 16 - ((idx * 7) % 18);
        ctx.fillStyle = colors[idx % colors.length] ?? '#8c262e';
        ctx.fillRect(bx, sy + (sh - 10 - bh), bw - 2, bh);

        // Gold spine band
        ctx.fillStyle = 'rgba(235, 195, 110, 0.65)';
        ctx.fillRect(bx + 2, sy + (sh - 10 - bh) + 8, bw - 6, 3);
        bx += bw;
        idx++;
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates coursed golden-yellow cobble bricks for The Wiz (Yellow Brick Road).
 */
export function createYellowBrickTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#785a18';
    ctx.fillRect(0, 0, 512, 512);

    const rows = 8;
    const cols = 4;
    const rh = 512 / rows;
    const cw = 512 / cols;

    for (let r = 0; r < rows; r++) {
      const offset = (r % 2) * (cw / 2);
      for (let c = -1; c <= cols; c++) {
        const bx = c * cw + offset + 3;
        const by = r * rh + 3;
        const delta = ((r * 17 + (c + 2) * 31) % 28) - 14;
        ctx.fillStyle = `rgb(${236 + delta}, ${188 + delta}, ${42 + Math.floor(delta * 0.5)})`;
        ctx.fillRect(bx, by, cw - 6, rh - 6);
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates the painted Horace Green Prep School tartan plaid stage floor cloth
 * with white dotted grid lines and the angled "H G" crimson-bordered crest downstage right
 * (matching reference photos media_1791644748140_320001e2.jpg & media_1791644779061_b9a0e65e.jpg).
 */
export function createSchoolOfRockFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Deep navy-teal base
    ctx.fillStyle = '#0e2836';
    ctx.fillRect(0, 0, 1024, 1024);

    // Angled tartan plaid blocks in emerald, sea-green, and slate-blue
    ctx.save();
    ctx.translate(512, 512);
    ctx.rotate(-0.14);
    ctx.translate(-640, -640);

    const cell = 84;
    for (let r = 0; r < 18; r++) {
      for (let c = 0; c < 18; c++) {
        const x = c * cell;
        const y = r * cell;
        const pat = (r * 3 + c * 5) % 7;
        if (pat === 0 || pat === 3) {
          ctx.fillStyle = 'rgba(54, 146, 104, 0.55)';
          ctx.fillRect(x + 4, y + 4, cell - 8, cell - 8);
        } else if (pat === 1 || pat === 5) {
          ctx.fillStyle = 'rgba(26, 86, 98, 0.65)';
          ctx.fillRect(x + 2, y + 2, cell - 4, cell - 4);
        } else if (pat === 2) {
          ctx.fillStyle = 'rgba(92, 178, 118, 0.48)';
          ctx.fillRect(x + 8, y + 8, cell - 16, cell - 16);
        }
      }
    }

    // Crisp white dotted grid lines across the plaid floor
    ctx.strokeStyle = 'rgba(235, 245, 255, 0.68)';
    ctx.lineWidth = 2.2;
    ctx.setLineDash([4, 7]);
    for (let i = 0; i <= 18; i++) {
      const p = i * cell;
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, 18 * cell);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, p);
      ctx.lineTo(18 * cell, p);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();

    // Downstage Right (House Left) Horace Green Prep School Shield Crest ("H G")
    ctx.save();
    ctx.translate(295, 795);
    ctx.rotate(-0.18);

    const drawShieldPath = (scale: number): void => {
      ctx.beginPath();
      ctx.moveTo(-115 * scale, -95 * scale);
      ctx.lineTo(115 * scale, -95 * scale);
      ctx.lineTo(110 * scale, 15 * scale);
      ctx.quadraticCurveTo(95 * scale, 88 * scale, 0, 120 * scale);
      ctx.quadraticCurveTo(-95 * scale, 88 * scale, -110 * scale, 15 * scale);
      ctx.closePath();
    };

    // Outer crimson red shield border
    drawShieldPath(1.0);
    ctx.fillStyle = '#c82432';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#e8e4dc';
    ctx.stroke();

    // Inner off-white shield face
    drawShieldPath(0.84);
    ctx.fillStyle = '#e6ecf2';
    ctx.fill();

    // Navy quadrant divider cross
    ctx.fillStyle = '#182b49';
    ctx.fillRect(-90, -8, 180, 14);
    ctx.fillRect(-7, -80, 14, 175);

    // Bold "H" and "G" letters in the crest quadrants
    ctx.fillStyle = '#182b49';
    ctx.font = 'bold 54px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('H', -46, -42);
    ctx.fillText('G', 46, 38);

    // Open book icon (upper right quadrant) & torch icon (lower left quadrant)
    ctx.fillStyle = '#243c64';
    ctx.fillRect(24, -56, 44, 28);
    ctx.fillStyle = '#e6ecf2';
    ctx.fillRect(44, -56, 4, 28);

    ctx.fillStyle = '#c82432';
    ctx.beginPath();
    ctx.arc(-46, 38, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates the Horace Green slate-green classroom chalkboard texture
 * with dusty chalk handwriting, music notation, and cursive script header.
 */
export function createChalkboardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#1d3c36');
    grad.addColorStop(0.5, '#264c44');
    grad.addColorStop(1, '#1b3631');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Dusty chalk eraser clouds
    for (let i = 0; i < 28; i++) {
      const cx = (i * 73) % 480;
      const cy = (i * 59) % 480;
      ctx.fillStyle = 'rgba(210, 230, 225, 0.045)';
      ctx.beginPath();
      ctx.arc(cx, cy, 28 + (i % 24), 0, Math.PI * 2);
      ctx.fill();
    }

    // Cursive alphabet / music theory lines near top of chalkboard
    ctx.strokeStyle = 'rgba(230, 242, 238, 0.25)';
    ctx.lineWidth = 1.2;
    for (let row = 0; row < 5; row++) {
      const y = 42 + row * 22;
      ctx.beginPath();
      ctx.moveTo(24, y);
      ctx.lineTo(488, y);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(235, 245, 240, 0.34)';
    ctx.font = 'italic 18px Georgia, serif';
    ctx.fillText('Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn', 32, 60);
    ctx.font = '14px monospace';
    ctx.fillText('HISTORY OF ROCK: LED ZEPPELIN -> AC/DC -> THE WHO', 32, 180);
    ctx.fillText('BAND ROLES: GUITAR · BASS · KEYS · DRUMS · VOCALS', 32, 220);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates the sparkling lavender-blue Seussian snow stage floor cloth
 * for Dr. Seuss's How The Grinch Stole Christmas! (Scenic Design by Andrew Gibbon).
 */
export function createGrinchSnowFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const grad = ctx.createRadialGradient(512, 560, 40, 512, 512, 720);
    grad.addColorStop(0, '#dce4f7');
    grad.addColorStop(0.55, '#b6c4e8');
    grad.addColorStop(1, '#8292bf');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Whimsical Seussian curved snow drift contour lines & ink cross-hatching
    ctx.strokeStyle = 'rgba(34, 42, 78, 0.28)';
    ctx.lineWidth = 2.4;
    for (let i = 0; i < 16; i++) {
      const y = 64 + i * 60;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(
        260,
        y + ((i % 2 === 0 ? 1 : -1) * 34),
        760,
        y - ((i % 2 === 0 ? 1 : -1) * 34),
        1024,
        y
      );
      ctx.stroke();
    }

    // Glittering snow crystal flecks across the stage deck
    for (let s = 0; s < 420; s++) {
      const sx = (s * 173) % 1020;
      const sy = (s * 257) % 1020;
      ctx.fillStyle = s % 3 === 0 ? 'rgba(255, 255, 255, 0.75)' : 'rgba(215, 232, 255, 0.45)';
      ctx.fillRect(sx, sy, 3, 3);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates the Pre-Show Scrim texture (Lineset #1 at 0'-10") from Slide 3 of
 * the Grinch Scenic Design deck:
 * - Lavender/violet translucent scrim wash
 * - Left projection: "Charlotte's Web — Adapted by Joseph Robinette" (Wilbur pig & fence)
 * - Center projection: `"Dr. Seuss' How The Grinch Stole Christmas!"`
 * - Right projection: "BENEATH THE BAOBAB TREE" poster art
 */
export function createGrinchPreShowScrimTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const bg = ctx.createLinearGradient(0, 0, 0, 512);
    bg.addColorStop(0, '#3e2d6e');
    bg.addColorStop(0.5, '#6852ad');
    bg.addColorStop(1, '#7c68c4');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1024, 512);

    // Subtle scrim gauze weave
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let y = 0; y < 512; y += 6) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    // 1. Left Poster Card: "Charlotte's Web" (x = 120..310, y = 105..365)
    ctx.fillStyle = '#c8a882';
    ctx.fillRect(125, 108, 185, 255);
    ctx.strokeStyle = '#38281e';
    ctx.lineWidth = 3;
    ctx.strokeRect(125, 108, 185, 255);

    // White picket fence in Charlotte's Web poster
    ctx.fillStyle = '#f2ede4';
    for (let px = 132; px < 302; px += 14) {
      ctx.fillRect(px, 285, 9, 48);
    }
    // Wilbur the pink pig
    ctx.fillStyle = '#e5989b';
    ctx.beginPath();
    ctx.ellipse(218, 285, 36, 42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4a2830';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Pig snout
    ctx.fillStyle = '#f4b4b8';
    ctx.beginPath();
    ctx.ellipse(218, 278, 14, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Spiderweb in top-left corner of poster
    ctx.strokeStyle = '#2a2220';
    ctx.lineWidth = 1.4;
    for (let r = 18; r <= 72; r += 18) {
      ctx.beginPath();
      ctx.arc(125, 108, r, 0, Math.PI / 2);
      ctx.stroke();
    }
    ctx.fillStyle = '#221a18';
    ctx.font = 'italic bold 20px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText("Charlotte's Web", 222, 152);
    ctx.font = '11px Georgia, serif';
    ctx.fillText('Adapted by Joseph Robinette', 222, 172);

    // 2. Center Title Projection: "Dr. Seuss' How The Grinch Stole Christmas!"
    ctx.save();
    ctx.fillStyle = '#e8e4f8';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.45)';
    ctx.shadowBlur = 8;
    ctx.textAlign = 'center';
    ctx.font = 'bold 26px Georgia, serif';
    ctx.fillText(`"Dr. Seuss'`, 495, 212);
    ctx.font = 'bold 34px Georgia, serif';
    ctx.fillText('HOW The GRINCH', 502, 254);
    ctx.font = 'bold 28px Georgia, serif';
    ctx.fillText('STOLE', 502, 288);
    ctx.font = 'bold 34px Georgia, serif';
    ctx.fillText(`CHRISTMAS!"`, 506, 326);
    ctx.restore();

    // 3. Right Poster Card: "BENEATH THE BAOBAB TREE" (x = 670..855, y = 170..420)
    ctx.fillStyle = '#dcd4f0';
    ctx.fillRect(670, 170, 185, 245);
    ctx.strokeStyle = '#4a3b78';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(670, 170, 185, 245);

    ctx.fillStyle = '#9a4c78';
    ctx.font = 'bold 17px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BENEATH THE', 762, 198);
    ctx.fillText('BAOBAB', 778, 220);
    ctx.fillStyle = '#487868';
    ctx.fillText('TREE', 785, 242);

    // Baobab tree trunk & figure holding glowing disc
    ctx.fillStyle = '#9c7a64';
    ctx.fillRect(692, 255, 22, 130);
    ctx.strokeStyle = '#d45b7a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(765, 292, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#4a7c59';
    ctx.fillRect(753, 325, 24, 48);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates the hand-painted Seussian icy-blue/white snow cliff & cave rock texture
 * with bold black Dr. Seuss pen-and-ink cross-hatching (matching Model Box slides 3–22).
 */
export function createSeussianRockHatchTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#c8dcf6');
    grad.addColorStop(0.5, '#8cb8ec');
    grad.addColorStop(1, '#6896d4');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Soft lavender/white snow highlights
    ctx.fillStyle = 'rgba(245, 248, 255, 0.48)';
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.ellipse(
        (i * 97) % 512,
        (i * 67) % 512,
        75,
        36,
        (i % 3) * 0.4,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Bold black Seussian ink contour strokes & cross-hatch clusters
    ctx.strokeStyle = '#151c2c';
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';

    for (let c = 0; c < 18; c++) {
      const bx = 32 + ((c * 83) % 440);
      const by = 32 + ((c * 61) % 440);
      for (let h = 0; h < 5; h++) {
        ctx.beginPath();
        ctx.moveTo(bx + h * 9, by);
        ctx.lineTo(bx + h * 9 - 14, by + 26);
        ctx.stroke();
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}


