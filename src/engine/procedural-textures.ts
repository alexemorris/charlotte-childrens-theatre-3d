import * as THREE from 'three';

const grinchLogoUrl = new URL('../assets/grinch_logo.png', import.meta.url).href;

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
 * Alice in Wonderland production photo (`stage_proscenium_alice.jpg`), complete
 * with hand-painted scenic woodgrain dry-brushing, marley roll sheen variation,
 * chessboard perspective fracture lines, and subtle Wonderland suit motifs.
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

    // Radiating whimsical rays converging toward upstage-center-left (under the crooked window)
    const originX = 472;
    const originY = 248;
    const rays: ReadonlyArray<{
      readonly a0: number;
      readonly a1: number;
      readonly colorInner: string;
      readonly colorOuter: string;
    }> = [
      { a0: -2.85, a1: -2.32, colorInner: '#8a1820', colorOuter: '#4c0c12' },
      { a0: -2.32, a1: -1.92, colorInner: '#1c202c', colorOuter: '#101218' },
      { a0: -1.92, a1: -1.46, colorInner: '#b81e28', colorOuter: '#6e1018' },
      { a0: -1.46, a1: -1.10, colorInner: '#222c46', colorOuter: '#121828' },
      { a0: -1.10, a1: -0.72, colorInner: '#921a22', colorOuter: '#540e14' },
      { a0: -0.72, a1: -0.35, colorInner: '#1a1c26', colorOuter: '#0e1016' },
      { a0: -0.35, a1: 0.08, colorInner: '#cc222c', colorOuter: '#7c121a' },
      { a0: 0.08, a1: 0.42, colorInner: '#e6ac22', colorOuter: '#9e6c10' },
      { a0: 0.42, a1: 0.78, colorInner: '#a81c26', colorOuter: '#621016' },
      { a0: 0.78, a1: 1.15, colorInner: '#223258', colorOuter: '#121c34' },
      { a0: 1.15, a1: 1.52, colorInner: '#d4262e', colorOuter: '#84141c' },
      { a0: 1.52, a1: 1.86, colorInner: '#edb424', colorOuter: '#a67612' },
      { a0: 1.86, a1: 2.26, colorInner: '#861820', colorOuter: '#4a0c12' },
      { a0: 2.26, a1: 2.75, colorInner: '#1c202c', colorOuter: '#101218' },
      { a0: 2.75, a1: 3.44, colorInner: '#9a1b24', colorOuter: '#580e14' },
    ];

    for (const ray of rays) {
      const rGrad = ctx.createRadialGradient(originX, originY, 30, originX, originY, 880);
      rGrad.addColorStop(0, ray.colorInner);
      rGrad.addColorStop(0.7, ray.colorInner);
      rGrad.addColorStop(1, ray.colorOuter);
      ctx.fillStyle = rGrad;
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.arc(originX, originY, 960, ray.a0, ray.a1);
      ctx.closePath();
      ctx.fill();

      // Scenic artist radial dry-brush woodgrain & bristle streaks along each wedge
      const midA = (ray.a0 + ray.a1) * 0.5;
      const spanA = ray.a1 - ray.a0;
      for (let s = 0; s < 14; s++) {
        const frac = (s + 0.5) / 14 - 0.5;
        const a = midA + frac * spanA * 0.9;
        const r0 = 50 + ((s * 37) % 140);
        const r1 = r0 + 180 + ((s * 53) % 280);
        ctx.strokeStyle =
          s % 2 === 0 ? 'rgba(255, 232, 185, 0.08)' : 'rgba(10, 10, 14, 0.22)';
        ctx.lineWidth = 1.5 + (s % 3);
        ctx.beginPath();
        ctx.moveTo(originX + Math.cos(a) * r0, originY + Math.sin(a) * r0);
        ctx.lineTo(originX + Math.cos(a) * r1, originY + Math.sin(a) * r1);
        ctx.stroke();
      }

      // Crisp dark bevel line separating each painted wedge
      ctx.strokeStyle = 'rgba(12, 12, 18, 0.72)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(originX + Math.cos(ray.a0) * 960, originY + Math.sin(ray.a0) * 960);
      ctx.stroke();
    }

    // Concentric warped chessboard fracture rings across the perspective rays
    for (const r of [145, 265, 405, 565, 735]) {
      ctx.strokeStyle = 'rgba(12, 13, 18, 0.76)';
      ctx.lineWidth = 6.5;
      ctx.beginPath();
      ctx.arc(originX, originY, r, 0, Math.PI * 2);
      ctx.stroke();

      // Subtle painted highlight lip on outer edge of each concentric fracture
      ctx.strokeStyle = 'rgba(255, 220, 160, 0.14)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(originX, originY, r + 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Horizontal marley roll seams & subtle stage scuff spatter
    for (let y = 128; y < 1024; y += 128) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    for (let sp = 0; sp < 260; sp++) {
      const sx = (sp * 197) % 1024;
      const sy = (sp * 311) % 1024;
      ctx.fillStyle =
        sp % 3 === 0 ? 'rgba(255, 215, 140, 0.06)' : 'rgba(10, 12, 18, 0.14)';
      ctx.fillRect(sx, sy, 2 + (sp % 3), 2 + (sp % 2));
    }

    // Vignette fade into dark stage wings matching the proscenium photo
    const grad = ctx.createRadialGradient(512, 548, 175, 512, 548, 528);
    grad.addColorStop(0, 'rgba(16, 17, 21, 0)');
    grad.addColorStop(0.76, 'rgba(16, 17, 21, 0.34)');
    grad.addColorStop(1, 'rgba(16, 17, 21, 0.96)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
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
 * with white dotted grid lines, scenic dry-brushed twill weave, and the angled
 * "H G" crimson-bordered heraldic crest downstage right (matching `school_of_rock_classroom.jpg`).
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

    // Angled tartan plaid blocks in emerald, apple-mint green, sea-green, and slate-blue
    ctx.save();
    ctx.translate(512, 512);
    ctx.rotate(-0.14);
    ctx.translate(-640, -640);

    const cell = 84;
    // Woven horizontal & vertical tartan broad bands
    for (let i = 0; i < 18; i++) {
      const p = i * cell;
      if (i % 3 === 0) {
        ctx.fillStyle = 'rgba(38, 122, 92, 0.36)';
        ctx.fillRect(0, p + 6, 18 * cell, cell - 12);
        ctx.fillRect(p + 6, 0, cell - 12, 18 * cell);
      } else if (i % 3 === 1) {
        ctx.fillStyle = 'rgba(22, 74, 96, 0.42)';
        ctx.fillRect(0, p + 4, 18 * cell, cell - 8);
        ctx.fillRect(p + 4, 0, cell - 8, 18 * cell);
      }
    }

    for (let r = 0; r < 18; r++) {
      for (let c = 0; c < 18; c++) {
        const x = c * cell;
        const y = r * cell;
        const pat = (r * 3 + c * 5) % 7;
        if (pat === 0 || pat === 3) {
          ctx.fillStyle = 'rgba(62, 158, 108, 0.62)';
          ctx.fillRect(x + 4, y + 4, cell - 8, cell - 8);
        } else if (pat === 1 || pat === 5) {
          ctx.fillStyle = 'rgba(26, 88, 104, 0.68)';
          ctx.fillRect(x + 2, y + 2, cell - 4, cell - 4);
        } else if (pat === 2 || pat === 6) {
          ctx.fillStyle = 'rgba(116, 194, 126, 0.56)';
          ctx.fillRect(x + 8, y + 8, cell - 16, cell - 16);
        }

        // Scenic dry-brushed twill weave lines inside each plaid block
        ctx.strokeStyle =
          (r + c) % 2 === 0
            ? 'rgba(175, 235, 185, 0.14)'
            : 'rgba(12, 34, 48, 0.22)';
        ctx.lineWidth = 1.5;
        for (let t = 10; t < cell - 8; t += 10) {
          ctx.beginPath();
          ctx.moveTo(x + t, y + 4);
          ctx.lineTo(x + t, y + cell - 4);
          ctx.stroke();
        }
      }
    }

    // Subtle crimson & gold tartan sett accent threads
    ctx.strokeStyle = 'rgba(198, 42, 56, 0.28)';
    ctx.lineWidth = 2;
    for (let i = 1; i < 18; i += 3) {
      const p = i * cell + cell * 0.5;
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, 18 * cell);
      ctx.moveTo(0, p);
      ctx.lineTo(18 * cell, p);
      ctx.stroke();
    }

    // Crisp white dotted grid lines across the plaid floor (matching photo)
    ctx.strokeStyle = 'rgba(225, 240, 250, 0.74)';
    ctx.lineWidth = 2.4;
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
      ctx.moveTo(-118 * scale, -96 * scale);
      ctx.lineTo(118 * scale, -96 * scale);
      ctx.lineTo(112 * scale, 16 * scale);
      ctx.quadraticCurveTo(96 * scale, 90 * scale, 0, 124 * scale);
      ctx.quadraticCurveTo(-96 * scale, 90 * scale, -112 * scale, 16 * scale);
      ctx.closePath();
    };

    // Subtle drop shadow under painted crest
    ctx.save();
    ctx.translate(4, 6);
    drawShieldPath(1.03);
    ctx.fillStyle = 'rgba(8, 18, 28, 0.45)';
    ctx.fill();
    ctx.restore();

    // Outer cream/white heraldic outline lip
    drawShieldPath(1.02);
    ctx.fillStyle = '#dfe5ec';
    ctx.fill();

    // Crimson red shield border
    drawShieldPath(0.97);
    ctx.fillStyle = '#c82432';
    ctx.fill();

    // Inner off-white/parchment shield face with subtle navy outline
    drawShieldPath(0.81);
    ctx.fillStyle = '#dce4ec';
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#182b49';
    ctx.stroke();

    // Navy quadrant divider cross
    ctx.fillStyle = '#182b49';
    ctx.fillRect(-92, -7, 184, 14);
    ctx.fillRect(-7, -78, 14, 174);

    // Bold serif "H" (upper-left) and "G" (lower-right) letters in the crest quadrants
    ctx.fillStyle = '#182b49';
    ctx.font = 'bold 54px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('H', -46, -42);
    ctx.fillText('G', 46, 38);

    // Detailed Open Book of Knowledge icon (upper right quadrant)
    ctx.fillStyle = '#182b49';
    ctx.fillRect(21, -60, 50, 32);
    ctx.fillStyle = '#dce4ec';
    ctx.fillRect(25, -56, 19, 24);
    ctx.fillRect(48, -56, 19, 24);
    // Page text lines
    ctx.strokeStyle = '#243c64';
    ctx.lineWidth = 1.5;
    for (let py = -50; py <= -38; py += 6) {
      ctx.beginPath();
      ctx.moveTo(28, py);
      ctx.lineTo(41, py);
      ctx.moveTo(51, py);
      ctx.lineTo(64, py);
      ctx.stroke();
    }

    // Detailed Heraldic Torch of Learning icon (lower left quadrant)
    // Torch handle & cup
    ctx.fillStyle = '#182b49';
    ctx.beginPath();
    ctx.moveTo(-52, 28);
    ctx.lineTo(-40, 28);
    ctx.lineTo(-43, 62);
    ctx.lineTo(-49, 62);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(-56, 23, 20, 5);
    // Sculpted crimson & gold torch flame
    ctx.fillStyle = '#c82432';
    ctx.beginPath();
    ctx.moveTo(-46, 4);
    ctx.quadraticCurveTo(-32, 12, -38, 23);
    ctx.lineTo(-54, 23);
    ctx.quadraticCurveTo(-60, 12, -46, 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e0a828';
    ctx.beginPath();
    ctx.arc(-46, 16, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates the Horace Green slate-green classroom chalkboard texture
 * with dusty chalk handwriting, music notation, geometric diagrams, and cursive script header
 * matching `school_of_rock_classroom.jpg`.
 */
export function createChalkboardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#1c3e36');
    grad.addColorStop(0.5, '#285248');
    grad.addColorStop(1, '#193630');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Sweeping dusty chalk eraser clouds & vertical slate grain
    for (let i = 0; i < 38; i++) {
      const cx = (i * 73) % 480;
      const cy = (i * 59) % 480;
      ctx.fillStyle =
        i % 2 === 0 ? 'rgba(210, 232, 224, 0.055)' : 'rgba(18, 38, 32, 0.08)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 38 + (i % 26), 18 + (i % 16), (i % 5) * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cursive alphabet / music theory staff lines near top of chalkboard
    ctx.strokeStyle = 'rgba(230, 242, 238, 0.28)';
    ctx.lineWidth = 1.2;
    for (let row = 0; row < 5; row++) {
      const y = 38 + row * 20;
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(492, y);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(235, 245, 240, 0.38)';
    ctx.font = 'italic 19px Georgia, serif';
    ctx.fillText('Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn', 28, 55);
    ctx.fillText('Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz', 28, 95);

    // Chalk music staff & eighth notes in middle
    for (let s = 0; s < 5; s++) {
      const sy = 142 + s * 6;
      ctx.beginPath();
      ctx.moveTo(28, sy);
      ctx.lineTo(484, sy);
      ctx.stroke();
    }
    for (let nx = 54; nx < 460; nx += 42) {
      const ny = 148 + ((nx * 7) % 18);
      ctx.beginPath();
      ctx.ellipse(nx, ny, 5, 3.5, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(nx + 4, ny);
      ctx.lineTo(nx + 4, ny - 18);
      ctx.stroke();
    }

    ctx.font = '14px monospace';
    ctx.fillText('HISTORY OF ROCK: LED ZEPPELIN -> AC/DC -> THE WHO', 28, 210);
    ctx.fillText('BAND ROLES: GUITAR · BASS · KEYS · DRUMS · VOCALS', 28, 244);

    // Faint chalk geometric prism/triangle diagrams (seen on SL/SR boards in reference photo)
    ctx.strokeStyle = 'rgba(225, 240, 235, 0.22)';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(36, 280, 96, 68);
    ctx.beginPath();
    ctx.moveTo(180, 348);
    ctx.lineTo(230, 276);
    ctx.lineTo(280, 348);
    ctx.closePath();
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates the hand-painted lavender-periwinkle Seussian snow stage floor cloth
 * for Dr. Seuss's How The Grinch Stole Christmas! (Scenic Design by Andrew Gibbon).
 * Features sweeping Seussian snow-path brushstrokes, cobalt/periwinkle shadow troughs,
 * warm rosy-lavender bounce highlights, multi-pass scenic spatter, and curving Dr. Seuss
 * pen-and-ink contour feathering (strictly toned <= 0xd8 so spotlights never overexpose).
 */
export function createGrinchSnowFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. Toned-down lavender-blue & glacier-periwinkle radial stage wash (all channels <= 0xd8)
    const grad = ctx.createRadialGradient(512, 540, 48, 512, 512, 720);
    grad.addColorStop(0, '#c6d0d8');
    grad.addColorStop(0.45, '#aebed8');
    grad.addColorStop(0.78, '#92a6cc');
    grad.addColorStop(1, '#7286b4');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // 2. Warm rosy-lavender bounce-light glazes (where the pink Whoville houses & cyc bounce onto snow)
    for (const [bx, by, rx, ry, col] of [
      [250, 420, 240, 160, 'rgba(208, 178, 212, 0.26)'],
      [780, 430, 240, 160, 'rgba(208, 178, 212, 0.26)'],
      [512, 340, 310, 180, 'rgba(198, 208, 216, 0.24)'],
      [512, 740, 380, 190, 'rgba(176, 194, 216, 0.22)'],
    ] as const) {
      const bGrad = ctx.createRadialGradient(bx, by, 16, bx, by, rx);
      bGrad.addColorStop(0, col);
      bGrad.addColorStop(1, 'rgba(160, 180, 212, 0)');
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.ellipse(bx, by, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Sweeping, swirling Seussian snow-path brushstrokes & cobalt shadow troughs
    ctx.lineCap = 'round';
    for (let i = 0; i < 22; i++) {
      const y = 44 + i * 44;
      const sway = (i % 2 === 0 ? 1 : -1) * (32 + (i % 3) * 12);

      // Broad soft cobalt-periwinkle drift shadow trough
      ctx.strokeStyle = 'rgba(78, 98, 148, 0.22)';
      ctx.lineWidth = 22 + (i % 4) * 6;
      ctx.beginPath();
      ctx.moveTo(-20, y + 8);
      ctx.bezierCurveTo(260, y + sway + 8, 764, y - sway + 8, 1044, y + 8);
      ctx.stroke();

      // Broad toned-snow crest dry-brush highlight (<= 0xd8)
      ctx.strokeStyle = 'rgba(204, 212, 216, 0.28)';
      ctx.lineWidth = 14 + (i % 3) * 4;
      ctx.beginPath();
      ctx.moveTo(-20, y - 5);
      ctx.bezierCurveTo(260, y + sway - 5, 764, y - sway - 5, 1044, y - 5);
      ctx.stroke();

      // Curving Dr. Seuss pen-and-ink contour line
      ctx.strokeStyle = 'rgba(26, 34, 68, 0.34)';
      ctx.lineWidth = i % 3 === 0 ? 3.0 : 2.0;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(260, y + sway, 764, y - sway, 1024, y);
      ctx.stroke();

      // Short rhythmic Seussian cross-hatch feather ticks along the snow drift ridge
      if (i % 2 === 0) {
        ctx.strokeStyle = 'rgba(24, 32, 64, 0.26)';
        ctx.lineWidth = 1.8;
        for (let tx = 48 + (i % 3) * 24; tx < 980; tx += 56) {
          const u = tx / 1024;
          const ty =
            y +
            Math.sin(u * Math.PI * 2) * (sway * 0.42) +
            ((tx % 7) - 3) * 1.5;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(tx - 8, ty + 14);
          ctx.moveTo(tx + 9, ty + 1);
          ctx.lineTo(tx + 2, ty + 13);
          ctx.stroke();
        }
      }
    }

    // 4. Multi-pass scenic shop paint spatter (cobalt shadow flecks, lavender mid-tones, frost highlights)
    for (let s = 0; s < 950; s++) {
      const sx = (s * 173 + (s % 7) * 29) % 1020;
      const sy = (s * 257 + (s % 11) * 19) % 1020;
      const r = 1.2 + (s % 3) * 1.1;
      if (s % 3 === 0) {
        ctx.fillStyle = 'rgba(208, 214, 216, 0.52)';
      } else if (s % 3 === 1) {
        ctx.fillStyle = 'rgba(64, 82, 134, 0.34)';
      } else {
        ctx.fillStyle = 'rgba(186, 172, 208, 0.38)';
      }
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
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
  const glow = ctx.createRadialGradient(0, 0, 12, 0, 0, 220);
  glow.addColorStop(0, 'rgba(235, 228, 255, 0.36)');
  glow.addColorStop(0.65, 'rgba(185, 168, 245, 0.14)');
  glow.addColorStop(1, 'rgba(110, 88, 180, 0.0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(0, 0, 225, 150, 0, 0, Math.PI * 2);
  ctx.fill();

  // Subtle painted 6-branch Seussian snowflake watermark behind the title (visible in model_1A_preshow.jpg)
  ctx.save();
  ctx.strokeStyle = 'rgba(165, 205, 255, 0.18)';
  ctx.lineWidth = 4.5;
  ctx.lineCap = 'round';
  for (let arm = 0; arm < 6; arm++) {
    const a = (arm * Math.PI) / 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * 128, Math.sin(a) * 128);
    ctx.stroke();
    for (const r of [48, 86]) {
      const bx = Math.cos(a) * r;
      const by = Math.sin(a) * r;
      for (const side of [-1, 1]) {
        const ba = a + side * 0.58;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(ba) * 26, by + Math.sin(ba) * 26);
        ctx.stroke();
      }
    }
  }
  ctx.restore();

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
 * Generates the Pre-Show Scrim texture (Lineset #1 at 0'-10") featuring the
 * clean violet-periwinkle sharkstooth scrim wash and the official
 * "Dr. Seuss' HOW THE GRINCH STOLE CHRISTMAS" logo asset centered on the scrim.
 */
export function createGrinchPreShowScrimTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const drawScrimBackdrop = (c: CanvasRenderingContext2D): void => {
    // 1. Rich violet-periwinkle sharkstooth scrim wash
    const bg = c.createLinearGradient(0, 0, 0, 512);
    bg.addColorStop(0, '#3e2d74');
    bg.addColorStop(0.28, '#58449c');
    bg.addColorStop(0.68, '#725ec0');
    bg.addColorStop(1, '#8472d0');
    c.fillStyle = bg;
    c.fillRect(0, 0, 1024, 512);

    // Authentic sharkstooth scrim gauze warp & weft weave
    c.strokeStyle = 'rgba(230, 224, 255, 0.045)';
    c.lineWidth = 1;
    for (let y = 0; y < 512; y += 5) {
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(1024, y);
      c.stroke();
    }
    c.strokeStyle = 'rgba(30, 18, 64, 0.05)';
    for (let x = 0; x < 1024; x += 8) {
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x, 512);
      c.stroke();
    }

    // Soft center gobo spotlight halo behind the Grinch logo
    const glow = c.createRadialGradient(512, 256, 20, 512, 256, 310);
    glow.addColorStop(0, 'rgba(240, 234, 255, 0.34)');
    glow.addColorStop(0.6, 'rgba(190, 174, 248, 0.14)');
    glow.addColorStop(1, 'rgba(110, 88, 180, 0.0)');
    c.fillStyle = glow;
    c.beginPath();
    c.ellipse(512, 256, 320, 210, 0, 0, Math.PI * 2);
    c.fill();
  };

  if (ctx) {
    drawScrimBackdrop(ctx);
    // Initial fallback while the PNG image decodes
    drawGrinchLogoGraphic(ctx, 512, 256, 1.0);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;

  // Load and draw the actual official Grinch logo PNG asset centered on the scrim
  if (typeof Image !== 'undefined' && ctx) {
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    logoImg.onload = () => {
      drawScrimBackdrop(ctx);
      const targetW = 580;
      const aspect =
        logoImg.naturalWidth > 0
          ? logoImg.naturalHeight / logoImg.naturalWidth
          : 576 / 881;
      const targetH = targetW * aspect;
      const dx = (1024 - targetW) * 0.5;
      const dy = (512 - targetH) * 0.5;
      ctx.drawImage(logoImg, dx, dy, targetW, targetH);
      tex.needsUpdate = true;
    };
    logoImg.src = grinchLogoUrl;
  }

  return tex;
}


/**
 * Converts a grayscale heightmap canvas (`R` channel = height `0..255`) into a
 * true tangent-space RGB normal map (`THREE.CanvasTexture` in `NoColorSpace`)
 * using toroidal (wrapped) 3×3 Sobel derivatives so tile boundaries are 100% seamless.
 */
export function createNormalMapFromHeightCanvas(
  heightCanvas: HTMLCanvasElement,
  strength = 3.2,
  repeatX = 1,
  repeatY = 1
): THREE.CanvasTexture {
  const w = heightCanvas.width;
  const h = heightCanvas.height;
  const srcCtx = heightCanvas.getContext('2d');

  const outCanvas = document.createElement('canvas');
  outCanvas.width = w;
  outCanvas.height = h;
  const outCtx = outCanvas.getContext('2d');

  if (srcCtx && outCtx) {
    const srcData = srcCtx.getImageData(0, 0, w, h).data;
    const outImg = outCtx.createImageData(w, h);
    const dstData = outImg.data;

    const sampleH = (x: number, y: number): number => {
      const wx = ((x % w) + w) % w;
      const wy = ((y % h) + h) % h;
      return srcData[(wy * w + wx) * 4]! / 255;
    };

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        // 3x3 Sobel filter with toroidal wrap
        const tl = sampleH(x - 1, y - 1);
        const tc = sampleH(x, y - 1);
        const tr = sampleH(x + 1, y - 1);
        const ml = sampleH(x - 1, y);
        const mr = sampleH(x + 1, y);
        const bl = sampleH(x - 1, y + 1);
        const bc = sampleH(x, y + 1);
        const br = sampleH(x + 1, y + 1);

        const dX = (tr + 2 * mr + br - (tl + 2 * ml + bl)) * strength;
        // In Canvas Y-down vs OpenGL tangent Y-up, invert dY
        const dY = (tl + 2 * tc + tr - (bl + 2 * bc + br)) * strength;

        let nx = -dX;
        let ny = dY;
        let nz = 1.0;
        const invLen = 1.0 / Math.hypot(nx, ny, nz);
        nx *= invLen;
        ny *= invLen;
        nz *= invLen;

        const idx = (y * w + x) * 4;
        dstData[idx] = Math.min(255, Math.max(0, Math.round((nx * 0.5 + 0.5) * 255)));
        dstData[idx + 1] = Math.min(255, Math.max(0, Math.round((ny * 0.5 + 0.5) * 255)));
        dstData[idx + 2] = Math.min(255, Math.max(0, Math.round((nz * 0.5 + 0.5) * 255)));
        dstData[idx + 3] = 255;
      }
    }
    outCtx.putImageData(outImg, 0, 0);
  }

  const normalTex = new THREE.CanvasTexture(outCanvas);
  normalTex.wrapS = THREE.RepeatWrapping;
  normalTex.wrapT = THREE.RepeatWrapping;
  normalTex.repeat.set(repeatX, repeatY);
  normalTex.anisotropy = 8;
  normalTex.colorSpace = THREE.NoColorSpace;
  return normalTex;
}

/**
 * Re-maps `THREE.ExtrudeGeometry` raw world-meter UV coordinates so that textures
 * map cleanly across the mesh bounding box (`mode = 'fit'`) or at a controlled,
 * large scenic scale (`mode = 'world'`, e.g. 4.5m per tile) instead of repeating
 * every 1.0 meter and creating visible grid tiling seams.
 */
export function normalizeExtrudeUVs(
  geometry: THREE.BufferGeometry,
  mode: 'fit' | 'world' = 'fit',
  worldTileMeters = 4.2
): void {
  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox;
  const pos = geometry.attributes.position;
  const norm = geometry.attributes.normal;
  const uv = geometry.attributes.uv;
  if (!bbox || !pos || !uv) return;

  const spanX = Math.max(0.25, bbox.max.x - bbox.min.x);
  const spanY = Math.max(0.25, bbox.max.y - bbox.min.y);
  const spanZ = Math.max(0.1, bbox.max.z - bbox.min.z);

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);

    const nx = norm ? Math.abs(norm.getX(i)) : 0;
    const ny = norm ? Math.abs(norm.getY(i)) : 0;
    const nz = norm ? Math.abs(norm.getZ(i)) : 1;

    if (mode === 'fit') {
      // Tri-planar / box projection normalized to [0..1] across the mesh's bounding box
      if (nz >= nx && nz >= ny) {
        uv.setXY(i, (vx - bbox.min.x) / spanX, (vy - bbox.min.y) / spanY);
      } else if (nx >= ny) {
        uv.setXY(i, (vz - bbox.min.z) / spanZ, (vy - bbox.min.y) / spanY);
      } else {
        uv.setXY(i, (vx - bbox.min.x) / spanX, (vz - bbox.min.z) / spanZ);
      }
    } else {
      // Controlled multi-meter scenic world projection with vertical [0..1] fit
      const uCoord =
        nz >= nx
          ? (vx - bbox.min.x) / worldTileMeters
          : (vz - bbox.min.z) / worldTileMeters;
      const vCoord = (vy - bbox.min.y) / spanY;
      uv.setXY(i, uCoord, vCoord);
    }
  }
  uv.needsUpdate = true;
}

let cachedPapierMacheNormalTex: THREE.CanvasTexture | null = null;
/**
 * Generates a 100% seamless tangent-space RGB normal map representing hand-sculpted
 * theatrical papier-mâché & plaster-gauze relief (overlapping torn-paper strips,
 * organic pillowy wrinkles, and carved Seussian contour ridges).
 */
export function createPapierMacheNormalTexture(): THREE.CanvasTexture {
  if (cachedPapierMacheNormalTex) {
    return cachedPapierMacheNormalTex;
  }

  const W = 512;
  const H = 512;
  const heightCanvas = document.createElement('canvas');
  heightCanvas.width = W;
  heightCanvas.height = H;
  const ctx = heightCanvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, W, H);

    // 1. Toroidally wrapped organic papier-mâché pillow mounds & plaster troughs
    for (let i = 0; i < 140; i++) {
      const cx = (i * 137) % W;
      const cy = (i * 193) % H;
      const rx = 28 + (i % 7) * 9;
      const ry = 18 + (i % 5) * 7;
      const angle = ((i * 29) % 100) * 0.0314;
      const isPeak = i % 2 === 0;

      for (const ox of [-W, 0, W]) {
        for (const oy of [-H, 0, H]) {
          const px = cx + ox;
          const py = cy + oy;
          if (px + rx < 0 || px - rx > W || py + ry < 0 || py - ry > H) continue;
          const g = ctx.createRadialGradient(px, py, 2, px, py, rx);
          g.addColorStop(0, isPeak ? 'rgba(235,235,235,0.22)' : 'rgba(25,25,25,0.20)');
          g.addColorStop(1, 'rgba(128,128,128,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.ellipse(px, py, rx, ry, angle, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 2. Overlapping torn-paper mache strips with subtle raised edges (toroidally wrapped)
    for (let s = 0; s < 220; s++) {
      const sx = (s * 97) % W;
      const sy = (s * 151) % H;
      const sw = 34 + (s % 5) * 10;
      const sh = 11 + (s % 4) * 4;
      const rot = ((s * 43) % 314) * 0.02 - 1.57;
      const lum = s % 2 === 0 ? 182 : 76;

      for (const ox of [-W, 0, W]) {
        for (const oy of [-H, 0, H]) {
          const px = sx + ox;
          const py = sy + oy;
          if (px + sw < 0 || px - sw > W || py + sw < 0 || py - sw > H) continue;
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(rot);
          ctx.fillStyle = `rgba(${lum},${lum},${lum},0.14)`;
          ctx.fillRect(-sw * 0.5, -sh * 0.5, sw, sh);
          ctx.strokeStyle = 'rgba(225,225,225,0.16)';
          ctx.lineWidth = 1.4;
          ctx.strokeRect(-sw * 0.5, -sh * 0.5, sw, sh);
          ctx.restore();
        }
      }
    }

    // 3. Periodic horizontal Seussian rock/snow strata grooves (integer harmonics of W & H)
    ctx.lineCap = 'round';
    for (let row = 0; row < 8; row++) {
      const baseY = (row + 0.5) * (H / 8);
      for (const oy of [-H, 0, H]) {
        ctx.strokeStyle = 'rgba(32,32,32,0.28)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 16) {
          const u = (x / W) * Math.PI * 2;
          const wave = Math.sin(u * 2 + row * 0.9) * 10 + Math.cos(u * 4 - row * 0.6) * 4;
          if (x === 0) ctx.moveTo(x, baseY + oy + wave);
          else ctx.lineTo(x, baseY + oy + wave);
        }
        ctx.stroke();

        ctx.strokeStyle = 'rgba(228,228,228,0.26)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 16) {
          const u = (x / W) * Math.PI * 2;
          const wave = Math.sin(u * 2 + row * 0.9) * 10 + Math.cos(u * 4 - row * 0.6) * 4;
          if (x === 0) ctx.moveTo(x, baseY + oy + wave - 3);
          else ctx.lineTo(x, baseY + oy + wave - 3);
        }
        ctx.stroke();
      }
    }
  }

  cachedPapierMacheNormalTex = createNormalMapFromHeightCanvas(heightCanvas, 3.6, 2, 2);
  return cachedPapierMacheNormalTex;
}

let cachedSeussianRockNormalTex: THREE.CanvasTexture | null = null;
/**
 * Generates a 100% seamless tangent-space RGB normal map for carved Seussian rock
 * cliffs, cave portals, and striated ledges.
 */
export function createSeussianRockNormalTexture(): THREE.CanvasTexture {
  if (cachedSeussianRockNormalTex) {
    return cachedSeussianRockNormalTex;
  }

  const W = 512;
  const H = 512;
  const heightCanvas = document.createElement('canvas');
  heightCanvas.width = W;
  heightCanvas.height = H;
  const ctx = heightCanvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, W, H);

    // 1. Toroidal rock boulder bulges and hollows
    for (let i = 0; i < 96; i++) {
      const cx = (i * 163) % W;
      const cy = (i * 229) % H;
      const rx = 34 + (i % 6) * 12;
      const ry = 20 + (i % 5) * 8;
      const isBulge = i % 3 !== 0;

      for (const ox of [-W, 0, W]) {
        for (const oy of [-H, 0, H]) {
          const px = cx + ox;
          const py = cy + oy;
          if (px + rx < 0 || px - rx > W || py + ry < 0 || py - ry > H) continue;
          const g = ctx.createRadialGradient(px, py, 4, px, py, rx);
          g.addColorStop(0, isBulge ? 'rgba(230,230,230,0.28)' : 'rgba(25,25,25,0.26)');
          g.addColorStop(1, 'rgba(128,128,128,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.ellipse(px, py, rx, ry, ((i % 7) - 3) * 0.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 2. Periodic horizontal rock strata ledges & crevices (exact integer harmonics of W)
    for (let row = 0; row < 12; row++) {
      const baseY = (row + 0.5) * (H / 12);
      for (const oy of [-H, 0, H]) {
        // Deep rock fissure groove
        ctx.strokeStyle = 'rgba(18,18,18,0.45)';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 16) {
          const u = (x / W) * Math.PI * 2;
          const wave = Math.sin(u * 2 + row * 1.1) * 9 + Math.cos(u * 3 - row * 0.7) * 5;
          if (x === 0) ctx.moveTo(x, baseY + oy + wave);
          else ctx.lineTo(x, baseY + oy + wave);
        }
        ctx.stroke();

        // Raised upper rock lip
        ctx.strokeStyle = 'rgba(240,240,240,0.38)';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 16) {
          const u = (x / W) * Math.PI * 2;
          const wave = Math.sin(u * 2 + row * 1.1) * 9 + Math.cos(u * 3 - row * 0.7) * 5;
          if (x === 0) ctx.moveTo(x, baseY + oy + wave - 3.5);
          else ctx.lineTo(x, baseY + oy + wave - 3.5);
        }
        ctx.stroke();
      }
    }
  }

  cachedSeussianRockNormalTex = createNormalMapFromHeightCanvas(heightCanvas, 4.2, 1, 1);
  return cachedSeussianRockNormalTex;
}

let cachedStuccoPlasterNormalTex: THREE.CanvasTexture | null = null;
/**
 * Generates a 100% seamless tangent-space RGB normal map for troweled Whoville
 * stucco plaster, clapboard courses, and carved timber ribs.
 */
export function createStuccoPlasterNormalTexture(): THREE.CanvasTexture {
  if (cachedStuccoPlasterNormalTex) {
    return cachedStuccoPlasterNormalTex;
  }

  const W = 512;
  const H = 512;
  const heightCanvas = document.createElement('canvas');
  heightCanvas.width = W;
  heightCanvas.height = H;
  const ctx = heightCanvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, W, H);

    // Troweled stucco swirls (toroidally wrapped)
    for (let i = 0; i < 180; i++) {
      const cx = (i * 149) % W;
      const cy = (i * 211) % H;
      const r = 16 + (i % 6) * 6;
      const lum = i % 2 === 0 ? 195 : 62;
      for (const ox of [-W, 0, W]) {
        for (const oy of [-H, 0, H]) {
          const px = cx + ox;
          const py = cy + oy;
          if (px + r < 0 || px - r > W || py + r < 0 || py - r > H) continue;
          ctx.strokeStyle = `rgba(${lum},${lum},${lum},0.18)`;
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.arc(px, py, r, (i % 4) * 0.6, (i % 4) * 0.6 + Math.PI * 1.1);
          ctx.stroke();
        }
      }
    }

    // Periodic wavy horizontal clapboard courses
    for (let row = 0; row < 8; row++) {
      const y = (row + 0.5) * (H / 8);
      ctx.strokeStyle = 'rgba(35,35,35,0.32)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 16) {
        const wave = Math.sin((x / W) * Math.PI * 4 + row * 0.8) * 5;
        if (x === 0) ctx.moveTo(x, y + wave);
        else ctx.lineTo(x, y + wave);
      }
      ctx.stroke();

      ctx.strokeStyle = 'rgba(225,225,225,0.28)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 16) {
        const wave = Math.sin((x / W) * Math.PI * 4 + row * 0.8) * 5;
        if (x === 0) ctx.moveTo(x, y + wave - 3);
        else ctx.lineTo(x, y + wave - 3);
      }
      ctx.stroke();
    }
  }

  cachedStuccoPlasterNormalTex = createNormalMapFromHeightCanvas(heightCanvas, 2.8, 1, 1);
  return cachedStuccoPlasterNormalTex;
}

let cachedFabricWeaveNormalTex: THREE.CanvasTexture | null = null;
/**
 * Generates a seamless tangent-space RGB normal map for theatrical costumes,
 * wool coats, velvet upholstery, and brushed fur/felt on character models.
 */
export function createFabricWeaveNormalTexture(): THREE.CanvasTexture {
  if (cachedFabricWeaveNormalTex) {
    return cachedFabricWeaveNormalTex;
  }

  const W = 256;
  const H = 256;
  const heightCanvas = document.createElement('canvas');
  heightCanvas.width = W;
  heightCanvas.height = H;
  const ctx = heightCanvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, W, H);

    // Fine twill / knitted wool weave + soft fur tufts
    const step = 4;
    for (let y = 0; y < H; y += step) {
      for (let x = 0; x < W; x += step) {
        const diag = ((x + y) / step) % 2 === 0;
        ctx.fillStyle = diag ? 'rgba(205,205,205,0.28)' : 'rgba(55,55,55,0.28)';
        ctx.fillRect(x, y, step - 1, step - 1);
      }
    }

    // Soft organic drapery/fur ripple lines
    for (let i = 0; i < 64; i++) {
      const cx = (i * 73) % W;
      const cy = (i * 109) % H;
      for (const ox of [-W, 0, W]) {
        for (const oy of [-H, 0, H]) {
          ctx.strokeStyle = i % 2 === 0 ? 'rgba(225,225,225,0.22)' : 'rgba(40,40,40,0.22)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx + ox, cy + oy);
          ctx.quadraticCurveTo(cx + ox + 6, cy + oy + 10, cx + ox - 2, cy + oy + 20);
          ctx.stroke();
        }
      }
    }
  }

  cachedFabricWeaveNormalTex = createNormalMapFromHeightCanvas(heightCanvas, 2.4, 4, 4);
  return cachedFabricWeaveNormalTex;
}

/**
 * Generates the 1024×1024 hand-painted Seussian icy-blue/lavender snow cliff & cave rock texture
 * with 100% periodic toroidal wrapping (`top == bottom`, `left == right`), multi-layered scenic
 * glazing (glacier blue, slate indigo, frost lavender, creamy snow highlights <= 0xd8),
 * trompe-l'oeil rock fissures, scenic paint spatter dots, and authentic curved Dr. Seuss
 * cross-hatch pen strokes (matching Model Box slides 1A–1H) with zero tiling seams.
 */
export function createSeussianRockHatchTexture(): THREE.CanvasTexture {
  const W = 1024;
  const H = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. 100% Periodic Toroidal Base Glaze (stop 0 === stop 1 so RepeatWrapping has ZERO seam!)
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0.0, '#96b4d8');
    grad.addColorStop(0.25, '#bccee0');
    grad.addColorStop(0.5, '#88aad4');
    grad.addColorStop(0.75, '#6a90c4');
    grad.addColorStop(1.0, '#96b4d8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Periodic horizontal modulation so left & right edges match identically
    const hGrad = ctx.createLinearGradient(0, 0, W, 0);
    hGrad.addColorStop(0.0, 'rgba(180, 204, 224, 0.16)');
    hGrad.addColorStop(0.5, 'rgba(72, 102, 156, 0.16)');
    hGrad.addColorStop(1.0, 'rgba(180, 204, 224, 0.16)');
    ctx.fillStyle = hGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Toroidally wrapped painterly scumble & sponge-glaze washes
    for (let i = 0; i < 48; i++) {
      const cx = (i * 193) % W;
      const cy = (i * 139) % H;
      const rx = 110 + (i % 5) * 38;
      const ry = 54 + (i % 4) * 26;
      const angle = ((i % 7) - 3) * 0.24;

      for (const ox of [-W, 0, W]) {
        for (const oy of [-H, 0, H]) {
          const px = cx + ox;
          const py = cy + oy;
          if (px + rx < 0 || px - rx > W || py + rx < 0 || py - rx > H) continue;
          const wash = ctx.createRadialGradient(px, py, 12, px, py, rx);
          if (i % 4 === 0) {
            wash.addColorStop(0, 'rgba(208, 214, 216, 0.34)');
          } else if (i % 4 === 1) {
            wash.addColorStop(0, 'rgba(198, 178, 212, 0.24)');
          } else if (i % 4 === 2) {
            wash.addColorStop(0, 'rgba(68, 96, 152, 0.24)');
          } else {
            wash.addColorStop(0, 'rgba(136, 184, 216, 0.28)');
          }
          wash.addColorStop(1, 'rgba(140, 172, 212, 0)');
          ctx.fillStyle = wash;
          ctx.beginPath();
          ctx.ellipse(px, py, rx, ry, angle, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 3. Periodic trompe-l'oeil rock strata fissures (integer harmonics of W so x=0 matches x=W!)
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let row = 0; row < 12; row++) {
      const baseY = (row + 0.5) * (H / 12);
      const waveAt = (x: number): number => {
        const u = (x / W) * Math.PI * 2;
        return Math.sin(u * 2 + row * 1.1) * 18 + Math.cos(u * 3 - row * 0.7) * 8;
      };

      // Soft cobalt-slate shadow band below fissure
      ctx.strokeStyle = 'rgba(54, 78, 128, 0.26)';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(0, baseY + waveAt(0) + 6);
      for (let x = 32; x <= W; x += 32) {
        ctx.lineTo(x, baseY + waveAt(x) + 6);
      }
      ctx.stroke();

      // Toned frost highlight lip above fissure (<= 0xd8)
      ctx.strokeStyle = 'rgba(206, 214, 216, 0.34)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, baseY + waveAt(0) - 4);
      for (let x = 32; x <= W; x += 32) {
        ctx.lineTo(x, baseY + waveAt(x) - 4);
      }
      ctx.stroke();
    }

    // 4. Fine scenic shop spatter dots
    for (let s = 0; s < 680; s++) {
      const sx = (s * 179 + (s % 9) * 31) % W;
      const sy = (s * 263 + (s % 7) * 23) % H;
      const sr = 1.2 + (s % 3);
      ctx.fillStyle =
        s % 2 === 0 ? 'rgba(34, 48, 86, 0.28)' : 'rgba(208, 214, 216, 0.42)';
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Toroidally wrapped curved Dr. Seuss pen-and-ink cross-hatch clusters
    ctx.strokeStyle = '#151c2c';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let c = 0; c < 36; c++) {
      const cx = (c * 167) % W;
      const cy = (c * 127) % H;
      const tilt = ((c % 5) - 2) * 0.14;

      for (const ox of [-W, 0, W]) {
        for (const oy of [-H, 0, H]) {
          const bx = cx + ox;
          const by = cy + oy;
          if (bx + 100 < 0 || bx - 40 > W || by + 60 < 0 || by - 30 > H) continue;

          ctx.lineWidth = 4.2;
          ctx.beginPath();
          ctx.moveTo(bx - 16, by);
          ctx.quadraticCurveTo(bx + 28, by - 12, bx + 78, by + 4);
          ctx.stroke();

          ctx.lineWidth = 3.0;
          for (let h = 0; h < 6; h++) {
            const hx = bx + h * 13;
            const hy = by + Math.sin(h * 0.5) * 4;
            ctx.beginPath();
            ctx.moveTo(hx, hy);
            ctx.quadraticCurveTo(
              hx - 8 + tilt * 12,
              hy + 18,
              hx - 18 + tilt * 20,
              hy + 38 + (h % 2) * 8
            );
            ctx.stroke();
          }

          if (c % 2 === 0) {
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.moveTo(bx - 8, by + 16);
            ctx.lineTo(bx + 68, by + 24);
            ctx.moveTo(bx - 4, by + 28);
            ctx.lineTo(bx + 54, by + 34);
            ctx.stroke();
          }
        }
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
