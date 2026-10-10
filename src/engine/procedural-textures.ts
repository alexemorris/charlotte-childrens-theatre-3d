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

export interface SeussianTextOptions {
  readonly fontSize: number;
  readonly fillTopColor: string;
  readonly fillBottomColor?: string;
  readonly bevelHighlightColor?: string;
  readonly shadowColor?: string;
  readonly outlineColor?: string;
  readonly bounceAmp?: number;
  readonly tiltAmp?: number;
  readonly archCurvature?: number;
  readonly letterSpacing?: number;
}

/**
 * Custom hand-lettered Seussian wedge-block display typography renderer.
 * Renders each character with playful Seussian per-letter tilt, baseline bounce,
 * top/bottom wedge shear, 3D extruded drop shadow, crisp ink outline,
 * vertical gradient fill, and inner 3D bevel highlight — never relying on
 * Times New Roman or generic system serifs.
 */
export function drawSeussianDisplayText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number,
  options: SeussianTextOptions
): void {
  const fontSize = options.fontSize;
  const spacing = options.letterSpacing ?? fontSize * 0.66;
  const bounceAmp = options.bounceAmp ?? fontSize * 0.08;
  const tiltAmp = options.tiltAmp ?? 0.095;
  const arch = options.archCurvature ?? 0;

  ctx.save();
  ctx.font = `900 ${Math.round(fontSize)}px "Fredoka", "Luckiest Guy", "Arial Black", "Impact", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const chars = Array.from(text);
  const widths = chars.map((ch) =>
    ch === ' ' ? fontSize * 0.36 : Math.max(fontSize * 0.44, ctx.measureText(ch).width * 0.94)
  );
  const totalW =
    widths.reduce((acc, w) => acc + w, 0) +
    Math.max(0, chars.length - 1) * (spacing - fontSize * 0.58);

  let cursorX = centerX - totalW / 2;

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]!;
    const cw = widths[i]!;
    const charX = cursorX + cw / 2;
    cursorX += cw + (spacing - fontSize * 0.58);

    if (ch === ' ') continue;

    const normX = totalW > 1 ? (charX - centerX) / (totalW * 0.5) : 0;
    const archOffsetY = arch * (normX * normX - 0.35) * fontSize;
    const bounceY = Math.sin(i * 1.85 + 0.6) * bounceAmp;
    const angle = Math.cos(i * 2.15 + 0.4) * tiltAmp + normX * (arch * 0.14);
    const shearX = ((i % 2 === 0 ? 1 : -1) * 0.06);
    const scaleY = 1.0 + ((i * 7) % 3 - 1) * 0.05;

    ctx.save();
    ctx.translate(charX, centerY + archOffsetY + bounceY);
    ctx.rotate(angle);
    ctx.transform(1.04, 0, shearX, scaleY, 0, 0);

    // 1. Deep 3D extruded block drop shadow
    const shadowCol = options.shadowColor ?? '#121521';
    const extrudeSteps = Math.max(3, Math.round(fontSize * 0.09));
    ctx.fillStyle = shadowCol;
    for (let s = extrudeSteps; s >= 1; s--) {
      ctx.fillText(ch, s * 1.15, s * 1.35);
    }

    // 2. Crisp dark Seussian ink outline
    ctx.strokeStyle = options.outlineColor ?? '#141824';
    ctx.lineWidth = Math.max(3, fontSize * 0.13);
    ctx.strokeText(ch, 0, 0);

    // 3. Top-to-bottom Seussian gradient fill
    const grad = ctx.createLinearGradient(0, -fontSize * 0.55, 0, fontSize * 0.52);
    grad.addColorStop(0, options.fillTopColor);
    grad.addColorStop(1, options.fillBottomColor ?? options.fillTopColor);
    ctx.fillStyle = grad;
    ctx.fillText(ch, 0, 0);

    // 4. Inner 3D top-left bevel highlight
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.strokeStyle = options.bevelHighlightColor ?? 'rgba(255, 255, 230, 0.55)';
    ctx.lineWidth = Math.max(1.5, fontSize * 0.045);
    ctx.strokeText(ch, -fontSize * 0.025, -fontSize * 0.03);
    ctx.restore();

    ctx.restore();
  }

  ctx.restore();
}

/**
 * Draws the iconic "HOW THE GRINCH STOLE CHRISTMAS" multi-tiered Seussian logo
 * matching the official title artwork (tilted red "HOW", mint-green "THE",
 * giant stepping lime-to-emerald "GRINCH", and bold red "STOLE CHRISTMAS").
 */
export function drawGrinchLogoGraphic(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  scale = 1.0
): void {
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(scale, scale);

  // Subtle radial glow behind the logo on the scrim
  const glow = ctx.createRadialGradient(0, 0, 12, 0, 0, 210);
  glow.addColorStop(0, 'rgba(255, 248, 225, 0.34)');
  glow.addColorStop(0.65, 'rgba(210, 195, 255, 0.12)');
  glow.addColorStop(1, 'rgba(110, 88, 180, 0.0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(0, 0, 220, 145, 0, 0, Math.PI * 2);
  ctx.fill();

  // "Dr. Seuss'" whimsical script eyebrow
  drawSeussianDisplayText(ctx, "DR. SEUSS'", -82, -104, {
    fontSize: 21,
    fillTopColor: '#fff6d6',
    fillBottomColor: '#f0cf68',
    outlineColor: '#1e1636',
    shadowColor: '#120c24',
    bounceAmp: 1.5,
    tiltAmp: 0.06,
    letterSpacing: 14,
  });

  // Top-left "HOW" in tilted vibrant crimson-red
  ctx.save();
  ctx.rotate(-0.11);
  drawSeussianDisplayText(ctx, 'HOW', -108, -62, {
    fontSize: 34,
    fillTopColor: '#ff4848',
    fillBottomColor: '#c81922',
    bevelHighlightColor: 'rgba(255, 220, 200, 0.65)',
    outlineColor: '#1a0d12',
    shadowColor: '#12080c',
    bounceAmp: 3,
    tiltAmp: 0.11,
    letterSpacing: 24,
  });
  ctx.restore();

  // Top-center "THE" in mint-pistachio green
  ctx.save();
  ctx.rotate(-0.05);
  drawSeussianDisplayText(ctx, 'THE', -14, -68, {
    fontSize: 36,
    fillTopColor: '#c8f69e',
    fillBottomColor: '#76c84e',
    bevelHighlightColor: 'rgba(255, 255, 235, 0.75)',
    outlineColor: '#162814',
    shadowColor: '#0e1a0c',
    bounceAmp: 2.5,
    tiltAmp: 0.09,
    letterSpacing: 25,
  });
  ctx.restore();

  // Centerpiece "GRINCH" — giant stepping/arching lime-to-emerald wedge letters
  ctx.save();
  ctx.rotate(-0.09);
  drawSeussianDisplayText(ctx, 'GRINCH', 6, -4, {
    fontSize: 82,
    fillTopColor: '#98ea44',
    fillBottomColor: '#0e8c28',
    bevelHighlightColor: 'rgba(235, 255, 175, 0.8)',
    outlineColor: '#0a3212',
    shadowColor: '#071e0b',
    bounceAmp: 6,
    tiltAmp: 0.1,
    archCurvature: -0.08,
    letterSpacing: 54,
  });
  ctx.restore();

  // "STOLE" in bold bouncy red below GRINCH
  drawSeussianDisplayText(ctx, 'STOLE', 26, 56, {
    fontSize: 38,
    fillTopColor: '#ff4a44',
    fillBottomColor: '#c81820',
    bevelHighlightColor: 'rgba(255, 215, 195, 0.65)',
    outlineColor: '#1c0c10',
    shadowColor: '#120608',
    bounceAmp: 3,
    tiltAmp: 0.1,
    letterSpacing: 26,
  });

  // "CHRISTMAS!" in bold arching crimson-red at bottom
  drawSeussianDisplayText(ctx, 'CHRISTMAS!', 22, 98, {
    fontSize: 44,
    fillTopColor: '#ff4842',
    fillBottomColor: '#bd141c',
    bevelHighlightColor: 'rgba(255, 220, 200, 0.7)',
    outlineColor: '#1c0c10',
    shadowColor: '#120608',
    bounceAmp: 3.8,
    tiltAmp: 0.11,
    archCurvature: 0.06,
    letterSpacing: 29,
  });

  ctx.restore();
}

/**
 * Generates the Pre-Show Scrim texture (Lineset #1 at 0'-10") from Slide 3 of
 * the Grinch Scenic Design deck:
 * - Lavender/violet translucent scrim wash
 * - Left projection: "Charlotte's Web — Adapted by Joseph Robinette" (Wilbur pig & fence)
 * - Center projection: Authentic Seussian "HOW THE GRINCH STOLE CHRISTMAS!" graphic logo
 * - Right projection: "BENEATH THE BAOBAB TREE" poster art
 */
export function createGrinchPreShowScrimTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const bg = ctx.createLinearGradient(0, 0, 0, 512);
    bg.addColorStop(0, '#362664');
    bg.addColorStop(0.5, '#5e48a2');
    bg.addColorStop(1, '#725cb8');
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

    // 1. Left Poster Card: "Charlotte's Web" (x = 95..285, y = 105..368)
    ctx.save();
    ctx.translate(190, 236);
    ctx.rotate(-0.04);
    ctx.fillStyle = '#cfa97e';
    ctx.fillRect(-95, -130, 190, 260);
    ctx.strokeStyle = '#382418';
    ctx.lineWidth = 4;
    ctx.strokeRect(-95, -130, 190, 260);

    // Sky gradient inside Charlotte's Web poster
    const cwSky = ctx.createLinearGradient(0, -126, 0, 40);
    cwSky.addColorStop(0, '#e8d5b5');
    cwSky.addColorStop(1, '#c8a276');
    ctx.fillStyle = cwSky;
    ctx.fillRect(-91, -126, 182, 252);

    // White picket fence in Charlotte's Web poster
    ctx.fillStyle = '#f2ede4';
    ctx.fillRect(-88, 66, 176, 6);
    ctx.fillRect(-88, 92, 176, 6);
    for (let px = -84; px <= 78; px += 15) {
      ctx.beginPath();
      ctx.moveTo(px, 54);
      ctx.lineTo(px + 5, 44);
      ctx.lineTo(px + 10, 54);
      ctx.lineTo(px + 10, 114);
      ctx.lineTo(px, 114);
      ctx.closePath();
      ctx.fill();
    }

    // Wilbur the pink pig
    ctx.fillStyle = '#eb9da2';
    ctx.beginPath();
    ctx.ellipse(0, 62, 36, 42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4a2830';
    ctx.lineWidth = 2.2;
    ctx.stroke();
    // Pig ears
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(side * 24, 26, 10, 16, side * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    // Pig snout & eyes
    ctx.fillStyle = '#f6b8bc';
    ctx.beginPath();
    ctx.ellipse(0, 54, 14, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#26161a';
    ctx.beginPath();
    ctx.arc(-12, 40, 3, 0, Math.PI * 2);
    ctx.arc(12, 40, 3, 0, Math.PI * 2);
    ctx.fill();

    // Spiderweb in top-left corner of poster
    ctx.strokeStyle = 'rgba(42, 30, 24, 0.65)';
    ctx.lineWidth = 1.4;
    for (let r = 18; r <= 76; r += 18) {
      ctx.beginPath();
      ctx.arc(-95, -130, r, 0, Math.PI / 2);
      ctx.stroke();
    }
    for (let a = 0.15; a < 1.45; a += 0.32) {
      ctx.beginPath();
      ctx.moveTo(-95, -130);
      ctx.lineTo(-95 + Math.cos(a) * 82, -130 + Math.sin(a) * 82);
      ctx.stroke();
    }

    drawSeussianDisplayText(ctx, "CHARLOTTE'S", 4, -78, {
      fontSize: 21,
      fillTopColor: '#fff6e8',
      fillBottomColor: '#f0d4a8',
      outlineColor: '#2c1a12',
      shadowColor: '#1a0e08',
      bounceAmp: 1.5,
      tiltAmp: 0.05,
      letterSpacing: 13,
    });
    drawSeussianDisplayText(ctx, 'WEB', 4, -50, {
      fontSize: 26,
      fillTopColor: '#ffdf68',
      fillBottomColor: '#e09a28',
      outlineColor: '#2c1a12',
      shadowColor: '#1a0e08',
      bounceAmp: 1.5,
      tiltAmp: 0.06,
      letterSpacing: 18,
    });
    ctx.restore();

    // 2. Center Title Projection: Authentic "HOW THE GRINCH STOLE CHRISTMAS!" Logo
    drawGrinchLogoGraphic(ctx, 502, 255, 0.94);

    // 3. Right Poster Card: "BENEATH THE BAOBAB TREE" (x = 720..910, y = 140..395)
    ctx.save();
    ctx.translate(815, 268);
    ctx.rotate(0.035);
    const baoGrad = ctx.createLinearGradient(0, -128, 0, 128);
    baoGrad.addColorStop(0, '#e8dff8');
    baoGrad.addColorStop(0.6, '#d4c4ee');
    baoGrad.addColorStop(1, '#b8a0dc');
    ctx.fillStyle = baoGrad;
    ctx.fillRect(-92, -126, 184, 252);
    ctx.strokeStyle = '#3e2d68';
    ctx.lineWidth = 4;
    ctx.strokeRect(-92, -126, 184, 252);

    drawSeussianDisplayText(ctx, 'BENEATH THE', 0, -92, {
      fontSize: 18,
      fillTopColor: '#d4487e',
      fillBottomColor: '#982654',
      outlineColor: '#261020',
      shadowColor: '#180814',
      bounceAmp: 1.2,
      tiltAmp: 0.04,
      letterSpacing: 11,
    });
    drawSeussianDisplayText(ctx, 'BAOBAB', 0, -64, {
      fontSize: 26,
      fillTopColor: '#f6a838',
      fillBottomColor: '#c86418',
      outlineColor: '#281408',
      shadowColor: '#180a04',
      bounceAmp: 1.8,
      tiltAmp: 0.06,
      letterSpacing: 17,
    });
    drawSeussianDisplayText(ctx, 'TREE', 0, -34, {
      fontSize: 25,
      fillTopColor: '#56b886',
      fillBottomColor: '#287852',
      outlineColor: '#0e261a',
      shadowColor: '#081810',
      bounceAmp: 1.5,
      tiltAmp: 0.05,
      letterSpacing: 17,
    });

    // Sculpted Baobab tree trunk, roots, canopy & golden sun disc
    ctx.fillStyle = '#f8c848';
    ctx.beginPath();
    ctx.arc(18, 28, 34, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#7e563e';
    ctx.beginPath();
    ctx.moveTo(-58, 118);
    ctx.quadraticCurveTo(-42, 65, -44, 4);
    ctx.lineTo(-18, 4);
    ctx.quadraticCurveTo(-16, 65, -4, 118);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#3c8c5c';
    for (const [cx, cy, rx, ry] of [
      [-48, -4, 28, 16],
      [-18, -12, 32, 18],
      [12, -2, 26, 15],
    ] as const) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
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


