import type { TheatreSceneController } from '../theatre/theatre-scene.ts';
import type {
  CameraPresetId,
  CustomSetPieceKind,
  LightingPresetId,
  ProductionSpec,
  SeatRecord,
  SeatSightlineMetrics,
} from '../types/theatre.ts';
import { InteractiveSeatingChart } from './seating-chart-svg.ts';

export class TheatreHudController {
  private readonly sceneCtrl: TheatreSceneController;
  private readonly seatingChart: InteractiveSeatingChart;

  constructor(sceneCtrl: TheatreSceneController) {
    this.sceneCtrl = sceneCtrl;

    const chartMount = document.getElementById('seating-chart-mount');
    if (!chartMount) {
      throw new Error('Missing #seating-chart-mount');
    }

    this.seatingChart = new InteractiveSeatingChart(
      chartMount,
      this.sceneCtrl.seats,
      {
        onSelectSeat: (seatId: string) => {
          this.sceneCtrl.selectSeatById(seatId, true);
        },
        onHoverSeat: (seat: SeatRecord | null) => {
          const badge = document.getElementById('seating-active-badge');
          if (badge) {
            badge.textContent = seat
              ? `Row ${seat.rowLabel} · #${seat.seatNumber}`
              : '420 Main · 150 Balc';
          }
        },
      }
    );

    this.initDraggableAndCollapsibleWindows();
    this.initMobileNavigationDock();
    this.renderProductionSwitcher();
    this.renderScenicElementsAndBattens(this.sceneCtrl.getActiveProduction());
    this.bindControls();
  }

  private setMobileTab(tab: 'viewport' | 'seats' | 'sets' | 'cams'): void {
    const seatingWin = document.getElementById('seating-window');
    const stageWin = document.getElementById('stage-console-window');
    const quickCams = document.getElementById('mobile-quick-cams');

    seatingWin?.classList.toggle('mobile-sheet-open', tab === 'seats');
    stageWin?.classList.toggle('mobile-sheet-open', tab === 'sets');
    if (quickCams) {
      quickCams.hidden = tab !== 'cams';
    }

    document
      .querySelectorAll<HTMLButtonElement>('.mobile-dock-btn')
      .forEach((btn) => {
        btn.classList.toggle('is-active', btn.dataset.mobTab === tab);
      });
  }

  private initMobileNavigationDock(): void {
    document
      .querySelectorAll<HTMLButtonElement>('.mobile-dock-btn')
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          const tab = btn.dataset.mobTab as
            | 'viewport'
            | 'seats'
            | 'sets'
            | 'cams'
            | undefined;
          if (!tab) return;
          // Tapping an already-open sheet tab returns to the full 3D viewport
          const isAlreadyActive =
            btn.classList.contains('is-active') && tab !== 'viewport';
          this.setMobileTab(isAlreadyActive ? 'viewport' : tab);
        });
      });

    document
      .getElementById('seating-mobile-close-btn')
      ?.addEventListener('click', () => {
        this.setMobileTab('viewport');
      });
    document
      .getElementById('stage-mobile-close-btn')
      ?.addEventListener('click', () => {
        this.setMobileTab('viewport');
      });
  }

  private initDraggableAndCollapsibleWindows(): void {
    const setupWindow = (
      winId: string,
      titlebarId: string,
      collapseBtnId: string
    ): void => {
      const win = document.getElementById(winId);
      const bar = document.getElementById(titlebarId);
      const btn = document.getElementById(collapseBtnId);
      if (!win || !bar || !btn) return;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        win.classList.toggle('is-collapsed');
      });

      let dragging = false;
      let startX = 0;
      let startY = 0;
      let origLeft = 0;
      let origTop = 0;

      bar.addEventListener('pointerdown', (e: PointerEvent) => {
        if (window.innerWidth <= 860) return;
        if ((e.target as HTMLElement).tagName === 'BUTTON') return;
        dragging = true;
        const rect = win.getBoundingClientRect();
        startX = e.clientX;
        startY = e.clientY;
        origLeft = rect.left;
        origTop = rect.top;
        win.style.left = `${origLeft}px`;
        win.style.top = `${origTop}px`;
        win.style.right = 'auto';
      });

      window.addEventListener('pointermove', (e: PointerEvent) => {
        if (!dragging || window.innerWidth <= 860) return;
        const nx = Math.max(
          6,
          Math.min(window.innerWidth - 220, origLeft + (e.clientX - startX))
        );
        const ny = Math.max(
          6,
          Math.min(window.innerHeight - 40, origTop + (e.clientY - startY))
        );
        win.style.left = `${nx}px`;
        win.style.top = `${ny}px`;
      });

      window.addEventListener('pointerup', () => {
        dragging = false;
      });
    };

    setupWindow('seating-window', 'seating-titlebar', 'seating-collapse-btn');
    setupWindow(
      'stage-console-window',
      'stage-console-titlebar',
      'stage-console-collapse-btn'
    );
  }

  private renderProductionSwitcher(): void {
    const grid = document.getElementById('production-switcher-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const catalog = this.sceneCtrl.getProductionCatalog();
    const activeId = this.sceneCtrl.getActiveProduction().id;

    for (const prod of catalog) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `prod-card-btn${prod.id === activeId ? ' active' : ''}`;
      btn.dataset.prodId = prod.id;
      btn.innerHTML = `
        <span class="prod-card-title">${prod.title}</span>
        <span class="prod-card-sub">${prod.subtitle}</span>
      `;
      btn.addEventListener('click', () => {
        this.sceneCtrl.setProduction(prod.id);
      });
      grid.appendChild(btn);
    }

    this.updateProductionInfoBox(this.sceneCtrl.getActiveProduction());
  }

  private updateProductionInfoBox(spec: ProductionSpec): void {
    const infoBox = document.getElementById('production-info-box');
    const badge = document.getElementById('active-prod-badge');
    const statusSummary = document.getElementById('statusbar-summary');

    if (badge) {
      badge.textContent = spec.title.split(' ')[0] ?? spec.title;
    }
    if (statusSummary) {
      statusSummary.textContent = `570 Seats · ${spec.title}`;
    }
    if (infoBox) {
      infoBox.innerHTML = `
        <div><strong>${spec.title}</strong> (${spec.ageRecommendation}) — ${spec.description}</div>
        <div class="production-info-note"><strong>Sightline Focus:</strong> ${spec.scenicNotes}</div>
      `;
    }

    document.querySelectorAll<HTMLButtonElement>('.prod-card-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.prodId === spec.id);
    });
  }

  private renderScenicElementsAndBattens(spec: ProductionSpec): void {
    const elList = document.getElementById('scenic-elements-list');
    if (elList) {
      elList.innerHTML = '';
      for (const el of spec.elements) {
        const isVis = this.sceneCtrl.isElementVisible(el.id);
        const row = document.createElement('label');
        row.className = 'scenic-element-row';
        row.innerHTML = `
          <span class="scenic-element-left">
            <input type="checkbox" ${isVis ? 'checked' : ''} data-el-id="${el.id}" />
            <span class="scenic-element-name">${el.name}</span>
          </span>
          <span class="scenic-element-dim">${el.dimensionsLabel}</span>
        `;
        const checkbox = row.querySelector('input');
        checkbox?.addEventListener('change', () => {
          this.sceneCtrl.setElementVisibility(el.id, Boolean(checkbox.checked));
        });
        elList.appendChild(row);
      }
    }

    const battenList = document.getElementById('batten-sliders-list');
    if (battenList && battenList.children.length === 0) {
      for (const b of this.sceneCtrl.getRiggingBattens()) {
        const wrap = document.createElement('div');
        wrap.className = 'hud-slider-row';
        const valId = `batten-val-${b.lineNumber}`;
        wrap.innerHTML = `
          <div class="hud-slider-label">
            <span>${b.name}</span>
            <span id="${valId}">+${b.trimHeightM.toFixed(1)}m</span>
          </div>
          <input type="range" min="0" max="6.8" step="0.1" value="${b.trimHeightM}" data-batten-line="${b.lineNumber}" />
        `;
        const slider = wrap.querySelector('input');
        const valSpan = wrap.querySelector(`#${valId}`);
        slider?.addEventListener('input', () => {
          const v = Number(slider.value);
          this.sceneCtrl.setBattenTrimHeight(b.lineNumber, v);
          if (valSpan) {
            valSpan.textContent = v === 0 ? 'In-Trim (0.0m)' : `+${v.toFixed(1)}m Out`;
          }
        });
        battenList.appendChild(wrap);
      }
    }
  }

  private bindControls(): void {
    // Top-center Orbit Quick Seat pills
    document
      .getElementById('quick-seat-director-btn')
      ?.addEventListener('click', () => {
        this.sceneCtrl.selectSeatById('main-center-left-G-108', true);
      });
    document
      .getElementById('quick-seat-balcony-btn')
      ?.addEventListener('click', () => {
        this.sceneCtrl.selectSeatById('lower-balcony-left-AA-105', true);
      });

    // Top-center 1st-Person Seat View HUD buttons
    document.getElementById('seat-hud-eye-btn')?.addEventListener('click', () => {
      const next = this.sceneCtrl.getEyeMode() === 'child' ? 'adult' : 'child';
      this.sceneCtrl.setEyeMode(next);
      this.syncEyeModeButtons();
    });
    document
      .getElementById('seat-hud-laser-btn')
      ?.addEventListener('click', () => {
        this.sceneCtrl.setSightlineLaserEnabled(
          !this.sceneCtrl.isSightlineLaserEnabled()
        );
        this.syncLaserButtons();
      });
    document.getElementById('seat-hud-prev-btn')?.addEventListener('click', () => {
      this.sceneCtrl.stepSelectedSeatInRow(-1);
    });
    document.getElementById('seat-hud-next-btn')?.addEventListener('click', () => {
      this.sceneCtrl.stepSelectedSeatInRow(1);
    });
    document
      .getElementById('seat-hud-row-up-btn')
      ?.addEventListener('click', () => {
        this.sceneCtrl.stepSelectedSeatRow(-1);
      });
    document
      .getElementById('seat-hud-row-down-btn')
      ?.addEventListener('click', () => {
        this.sceneCtrl.stepSelectedSeatRow(1);
      });
    document.getElementById('seat-hud-exit-btn')?.addEventListener('click', () => {
      this.sceneCtrl.exitSeatViewToOrbit();
    });

    // Left Window: Child vs Adult Eye Mode
    document
      .getElementById('eye-mode-child-btn')
      ?.addEventListener('click', () => {
        this.sceneCtrl.setEyeMode('child');
        this.syncEyeModeButtons();
      });
    document
      .getElementById('eye-mode-adult-btn')
      ?.addEventListener('click', () => {
        this.sceneCtrl.setEyeMode('adult');
        this.syncEyeModeButtons();
      });

    // Left Window: Chart Color Mode (Sections vs Sightline Heatmap)
    document
      .getElementById('chart-mode-section-btn')
      ?.addEventListener('click', () => {
        this.sceneCtrl.setChartColorMode('section');
        this.syncChartModeButtons();
      });
    document
      .getElementById('chart-mode-heatmap-btn')
      ?.addEventListener('click', () => {
        this.sceneCtrl.setChartColorMode('sightline-heatmap');
        this.syncChartModeButtons();
      });

    // Quick Sightline Test Seat buttons
    document
      .querySelectorAll<HTMLButtonElement>('.quick-seat-btn')
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          const seatId = btn.dataset.seatId;
          if (seatId) {
            this.sceneCtrl.selectSeatById(seatId, true);
          }
        });
      });

    document
      .getElementById('toggle-sightline-laser-btn')
      ?.addEventListener('click', () => {
        this.sceneCtrl.setSightlineLaserEnabled(
          !this.sceneCtrl.isSightlineLaserEnabled()
        );
        this.syncLaserButtons();
      });

    // Venue Photos & Specs Drawer toggle
    const venueBtn = document.getElementById('toggle-venue-drawer-btn');
    const venueDrawer = document.getElementById('venue-info-drawer');
    venueBtn?.addEventListener('click', () => {
      if (!venueDrawer) return;
      venueDrawer.hidden = !venueDrawer.hidden;
      venueBtn.textContent = venueDrawer.hidden
        ? 'Photos & Specs ▾'
        : 'Hide Specs ▴';
    });

    // Reset Fly Battens In-Trim button
    document
      .getElementById('reset-battens-btn')
      ?.addEventListener('click', () => {
        document
          .querySelectorAll<HTMLInputElement>('input[data-batten-line]')
          .forEach((inp) => {
            const line = Number(inp.dataset.battenLine);
            inp.value = '0';
            this.sceneCtrl.setBattenTrimHeight(line, 0);
            const span = document.getElementById(`batten-val-${line}`);
            if (span) span.textContent = 'In-Trim (0.0m)';
          });
      });

    // Grand Drape Slider
    const grandSlider = document.getElementById(
      'grand-drape-slider'
    ) as HTMLInputElement | null;
    const grandVal = document.getElementById('grand-drape-val');
    grandSlider?.addEventListener('input', () => {
      const pct = Number(grandSlider.value);
      this.sceneCtrl.setGrandDrapeOpenFraction(pct / 100);
      if (grandVal) {
        grandVal.textContent = pct === 0 ? 'Closed' : `${pct}% Open`;
      }
    });

    // Stage Mechanics Rockers
    const syncRocker = (
      btnId: string,
      dotId: string,
      active: boolean
    ): void => {
      document.getElementById(btnId)?.classList.toggle('pressed', active);
      document.getElementById(dotId)?.classList.toggle('off-state', !active);
    };

    document
      .getElementById('toggle-cad-grid-btn')
      ?.addEventListener('click', () => {
        const next = !this.sceneCtrl.isCadGridEnabled();
        this.sceneCtrl.setCadGridEnabled(next);
        syncRocker('toggle-cad-grid-btn', 'dot-cad-grid', next);
      });

    document
      .getElementById('toggle-traps-btn')
      ?.addEventListener('click', () => {
        const next = !this.sceneCtrl.isStageTrapsOpen();
        this.sceneCtrl.setStageTrapsOpen(next);
        syncRocker('toggle-traps-btn', 'dot-stage-traps', next);
      });

    document.getElementById('toggle-pit-btn')?.addEventListener('click', () => {
      const next = !this.sceneCtrl.isOrchestraPitOpen();
      this.sceneCtrl.setOrchestraPitOpen(next);
      syncRocker('toggle-pit-btn', 'dot-orch-pit', next);
    });

    document
      .getElementById('toggle-overhang-guides-btn')
      ?.addEventListener('click', () => {
        const next = !this.sceneCtrl.isBalconyOverhangGuidesVisible();
        this.sceneCtrl.setBalconyOverhangGuidesVisible(next);
        syncRocker('toggle-overhang-guides-btn', 'dot-overhang-guides', next);
      });

    // Custom Set Piece Spawner buttons
    document
      .querySelectorAll<HTMLButtonElement>('.spawn-piece-btn')
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          const kind = btn.dataset.pieceKind as CustomSetPieceKind | undefined;
          if (kind) {
            this.sceneCtrl.addCustomSetPiece(kind);
          }
        });
      });

    document
      .getElementById('clear-custom-pieces-btn')
      ?.addEventListener('click', () => {
        this.sceneCtrl.clearCustomSetPieces();
      });

    document
      .getElementById('delete-custom-piece-btn')
      ?.addEventListener('click', () => {
        this.sceneCtrl.deleteSelectedCustomPiece();
      });

    const cpX = document.getElementById('cp-x-slider') as HTMLInputElement | null;
    const cpZ = document.getElementById('cp-z-slider') as HTMLInputElement | null;
    const cpRot = document.getElementById(
      'cp-rot-slider'
    ) as HTMLInputElement | null;

    cpX?.addEventListener('input', () => {
      const x = Number(cpX.value);
      this.sceneCtrl.updateSelectedCustomPiece({ x });
      const lbl = document.getElementById('cp-x-val');
      if (lbl) lbl.textContent = `${x.toFixed(1)}m`;
    });

    cpZ?.addEventListener('input', () => {
      const z = Number(cpZ.value);
      this.sceneCtrl.updateSelectedCustomPiece({ z });
      const lbl = document.getElementById('cp-z-val');
      if (lbl) lbl.textContent = `${z.toFixed(1)}m`;
    });

    cpRot?.addEventListener('input', () => {
      const rotationYDeg = Number(cpRot.value);
      this.sceneCtrl.updateSelectedCustomPiece({ rotationYDeg });
      const lbl = document.getElementById('cp-rot-val');
      if (lbl) lbl.textContent = `${rotationYDeg}°`;
    });

    // Lighting Console Presets & Sliders
    document
      .querySelectorAll<HTMLButtonElement>('.light-preset-btn')
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          const preset = btn.dataset.lightPreset as LightingPresetId | undefined;
          if (!preset) return;
          const state = this.sceneCtrl.setLightingPreset(preset);
          document
            .querySelectorAll<HTMLButtonElement>('.light-preset-btn')
            .forEach((b) =>
              b.classList.toggle('active', b.dataset.lightPreset === preset)
            );
          const meta = document.getElementById('lighting-preset-meta');
          if (meta) meta.textContent = preset.replace('-', ' ').toUpperCase();
          this.syncLightingSliders(
            state.houseLevel,
            state.fohRailLevel,
            state.stageElectricsLevel,
            state.cycWashLevel
          );
        });
      });

    const bindLightSlider = (
      sliderId: string,
      valId: string,
      channel: 'houseLevel' | 'fohRailLevel' | 'stageElectricsLevel' | 'cycWashLevel'
    ): void => {
      const sl = document.getElementById(sliderId) as HTMLInputElement | null;
      const vl = document.getElementById(valId);
      sl?.addEventListener('input', () => {
        const pct = Number(sl.value);
        this.sceneCtrl.updateLightingChannel(channel, pct / 100);
        if (vl) vl.textContent = `${pct}%`;
      });
    };

    bindLightSlider('light-house-slider', 'light-house-val', 'houseLevel');
    bindLightSlider('light-foh-slider', 'light-foh-val', 'fohRailLevel');
    bindLightSlider(
      'light-stage-slider',
      'light-stage-val',
      'stageElectricsLevel'
    );
    bindLightSlider('light-cyc-slider', 'light-cyc-val', 'cycWashLevel');

    // Camera Presets & Graphics Quality
    document
      .querySelectorAll<HTMLButtonElement>('.cam-preset-btn')
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          const cam = btn.dataset.cam as CameraPresetId | undefined;
          if (cam) {
            this.sceneCtrl.setCameraPreset(cam);
          }
        });
      });

    const gfxBtn = document.getElementById('gfx-quality-btn');
    gfxBtn?.addEventListener('click', () => {
      const mode = this.sceneCtrl.cycleGraphicsQuality();
      gfxBtn.textContent = `GFX: ${
        mode === 'ultra' ? 'Ultra' : mode === 'balanced' ? 'Balanced' : 'Max FPS'
      }`;
    });
  }

  private syncLightingSliders(
    house: number,
    foh: number,
    stage: number,
    cyc: number
  ): void {
    const setSl = (sId: string, vId: string, frac: number): void => {
      const pct = Math.round(frac * 100);
      const sl = document.getElementById(sId) as HTMLInputElement | null;
      const vl = document.getElementById(vId);
      if (sl) sl.value = String(pct);
      if (vl) vl.textContent = `${pct}%`;
    };
    setSl('light-house-slider', 'light-house-val', house);
    setSl('light-foh-slider', 'light-foh-val', foh);
    setSl('light-stage-slider', 'light-stage-val', stage);
    setSl('light-cyc-slider', 'light-cyc-val', cyc);
  }

  private syncEyeModeButtons(): void {
    const mode = this.sceneCtrl.getEyeMode();
    document
      .getElementById('eye-mode-child-btn')
      ?.classList.toggle('active', mode === 'child');
    document
      .getElementById('eye-mode-adult-btn')
      ?.classList.toggle('active', mode === 'adult');

    const meta = document.getElementById('eye-height-meta');
    if (meta) {
      meta.textContent =
        mode === 'child' ? '0.96m CHILD EYE' : '1.18m ADULT EYE';
    }

    const hudEyeBtn = document.getElementById('seat-hud-eye-btn');
    if (hudEyeBtn) {
      hudEyeBtn.textContent =
        mode === 'child' ? 'Eye: Child 0.96m (C)' : 'Eye: Adult 1.18m (C)';
    }

    this.seatingChart.updateModeAndGrades(
      this.sceneCtrl.getChartColorMode(),
      this.sceneCtrl.getAllSeatSightlineGrades()
    );
  }

  private syncChartModeButtons(): void {
    const mode = this.sceneCtrl.getChartColorMode();
    document
      .getElementById('chart-mode-section-btn')
      ?.classList.toggle('active', mode === 'section');
    document
      .getElementById('chart-mode-heatmap-btn')
      ?.classList.toggle('active', mode === 'sightline-heatmap');

    this.seatingChart.updateModeAndGrades(
      mode,
      this.sceneCtrl.getAllSeatSightlineGrades()
    );
  }

  private syncLaserButtons(): void {
    const on = this.sceneCtrl.isSightlineLaserEnabled();
    const b1 = document.getElementById('toggle-sightline-laser-btn');
    const b2 = document.getElementById('seat-hud-laser-btn');
    if (b1) {
      b1.textContent = on ? '3D Lasers: ON' : '3D Lasers: OFF';
      b1.classList.toggle('is-active', on);
    }
    if (b2) {
      b2.textContent = on ? '3D Lasers: ON (L)' : '3D Lasers: OFF (L)';
      b2.classList.toggle('is-active', on);
    }
  }

  public handleSeatSelected(
    metrics: SeatSightlineMetrics | null,
    inSeatView: boolean
  ): void {
    this.seatingChart.setSelectedSeatId(metrics?.seat.id ?? null);

    const orbitPill = document.getElementById('orbit-top-pill');
    const seatHud = document.getElementById('seat-view-hud');
    if (orbitPill) orbitPill.hidden = inSeatView;
    if (seatHud) seatHud.hidden = !inSeatView;

    const card = document.getElementById('seat-telemetry-card');
    if (!card) return;

    if (!metrics) {
      card.innerHTML = `
        <div class="telemetry-empty">
          Click any of the <strong>570 seats</strong> in the 3D auditorium or on the 2D chart above to inspect its exact 1st-person stage view and sightline clearance.
        </div>
      `;
      return;
    }

    const { seat } = metrics;
    const gradeLabel =
      metrics.grade === 'optimal'
        ? 'OPTIMAL'
        : metrics.grade === 'good'
          ? 'GOOD'
          : metrics.grade === 'partial-overhang'
            ? 'OVERHANG TRIM'
            : 'SIDE ANGLE';

    const readout = document.getElementById('seat-hud-readout');
    if (readout) {
      readout.textContent = `${seat.sectionTitle.toUpperCase()} · ROW ${seat.rowLabel} · SEAT ${seat.seatNumber}`;
    }

    const scoreBadge = document.getElementById('seat-hud-score-badge');
    if (scoreBadge) {
      scoreBadge.className = `seat-score-badge grade-${metrics.grade}`;
      scoreBadge.textContent = `${metrics.overallScore}% ${gradeLabel}`;
    }

    card.innerHTML = `
      <div class="telemetry-header">
        <span class="telemetry-seat-title">${seat.sectionTitle} · Row ${seat.rowLabel} · Seat ${seat.seatNumber}</span>
        <span class="seat-score-badge grade-${metrics.grade}">${metrics.overallScore}% ${gradeLabel}</span>
      </div>
      <div class="telemetry-metrics-grid">
        <div class="telemetry-stat-box">
          <div class="telemetry-stat-label">Dist to Stage</div>
          <div class="telemetry-stat-val">${seat.distanceToStageCenterM.toFixed(1)}m (${Math.round(seat.distanceToStageCenterM * 3.28084)}ft)</div>
        </div>
        <div class="telemetry-stat-box">
          <div class="telemetry-stat-label">Horiz / Vert</div>
          <div class="telemetry-stat-val">${seat.horizontalAngleDeg.toFixed(0)}° / ${seat.verticalAngleDeg.toFixed(0)}°</div>
        </div>
        <div class="telemetry-stat-box">
          <div class="telemetry-stat-label">Max Fly Vis</div>
          <div class="telemetry-stat-val">${metrics.maxVisibleHeightAtBackdropM.toFixed(1)}m</div>
        </div>
      </div>
      <div class="telemetry-bars-list">
        <div class="telemetry-bar-row">
          <span>Downstage Apron</span>
          <div class="telemetry-bar-track"><div class="telemetry-bar-fill" style="width:${metrics.downstageVisibilityPct}%"></div></div>
          <span>${metrics.downstageVisibilityPct}%</span>
        </div>
        <div class="telemetry-bar-row">
          <span>Center Stage</span>
          <div class="telemetry-bar-track"><div class="telemetry-bar-fill" style="width:${metrics.centerStageVisibilityPct}%"></div></div>
          <span>${metrics.centerStageVisibilityPct}%</span>
        </div>
        <div class="telemetry-bar-row">
          <span>Upstage / Wings</span>
          <div class="telemetry-bar-track"><div class="telemetry-bar-fill" style="width:${metrics.upstageVisibilityPct}%"></div></div>
          <span>${metrics.upstageVisibilityPct}%</span>
        </div>
        <div class="telemetry-bar-row">
          <span>Upper Fly Loft</span>
          <div class="telemetry-bar-track"><div class="telemetry-bar-fill" style="width:${metrics.flyGridVisibilityPct}%"></div></div>
          <span>${metrics.flyGridVisibilityPct}%</span>
        </div>
      </div>
      <div class="telemetry-notes">
        ${metrics.notes.map((n) => `<div>• ${n}</div>`).join('')}
      </div>
    `;
  }

  public handleSeatHovered(
    seat: SeatRecord | null,
    clientX: number,
    clientY: number
  ): void {
    const tooltip = document.getElementById('seat-hover-tooltip');
    if (!tooltip) return;
    if (!seat) {
      tooltip.hidden = true;
      return;
    }
    tooltip.hidden = false;
    tooltip.style.left = `${clientX + 14}px`;
    tooltip.style.top = `${clientY + 14}px`;
    tooltip.innerHTML = `<strong>${seat.sectionTitle}</strong> · Row ${seat.rowLabel} · Seat ${seat.seatNumber} <span style="color:#38e2ff">(Click to Sit)</span>`;
  }

  public handleProductionChanged(spec: ProductionSpec): void {
    this.updateProductionInfoBox(spec);
    this.renderScenicElementsAndBattens(spec);
    this.seatingChart.updateModeAndGrades(
      this.sceneCtrl.getChartColorMode(),
      this.sceneCtrl.getAllSeatSightlineGrades()
    );
  }

  public handleCustomPieceSelected(): void {
    const inspector = document.getElementById('custom-piece-inspector');
    const piece = this.sceneCtrl.getSelectedCustomPiece();
    if (!inspector) return;
    if (!piece) {
      inspector.hidden = true;
      return;
    }
    inspector.hidden = false;
    const title = document.getElementById('custom-piece-title');
    if (title) title.textContent = piece.label;

    const cpX = document.getElementById('cp-x-slider') as HTMLInputElement | null;
    const cpZ = document.getElementById('cp-z-slider') as HTMLInputElement | null;
    const cpRot = document.getElementById(
      'cp-rot-slider'
    ) as HTMLInputElement | null;

    if (cpX) cpX.value = String(piece.x);
    if (cpZ) cpZ.value = String(piece.z);
    if (cpRot) cpRot.value = String(piece.rotationYDeg);

    const xVal = document.getElementById('cp-x-val');
    const zVal = document.getElementById('cp-z-val');
    const rotVal = document.getElementById('cp-rot-val');
    if (xVal) xVal.textContent = `${piece.x.toFixed(1)}m`;
    if (zVal) zVal.textContent = `${piece.z.toFixed(1)}m`;
    if (rotVal) rotVal.textContent = `${piece.rotationYDeg}°`;
  }

  public handleCameraModeChanged(
    inSeatView: boolean,
    presetId: CameraPresetId | null
  ): void {
    const orbitPill = document.getElementById('orbit-top-pill');
    const seatHud = document.getElementById('seat-view-hud');
    if (orbitPill) orbitPill.hidden = inSeatView;
    if (seatHud) seatHud.hidden = !inSeatView;

    document
      .querySelectorAll<HTMLButtonElement>('.cam-preset-btn')
      .forEach((btn) => {
        btn.classList.toggle(
          'active',
          !inSeatView && btn.dataset.cam === presetId
        );
      });
  }
}
