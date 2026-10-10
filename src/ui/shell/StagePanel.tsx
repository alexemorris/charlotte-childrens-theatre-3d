import type { JSX } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import {
  analyzeElementForCncShop,
  type CncElementAnalysis,
  type FabricationMethod,
} from '../../engine/cnc-shop-exporter.ts';
import {
  activeProduction,
  activeScene,
  activeSceneIndex,
  balconyOverhangGuidesVisible,
  cadGridEnabled,
  clearHoverTooltips,
  elementVisibilityRevision,
  grandDrapeOpenFraction,
  graphicsQuality,
  isMobile,
  lightboxMedia,
  lightingState,
  openWorkshopForElementId,
  orchestraPitOpen,
  showToast,
  stagePanelOpen,
  stageTrapsOpen,
  syncStoreFromSceneController,
} from '../../state/shell-store.ts';
import {
  LIGHTING_GEL_PRESETS,
  type LightingNumericChannelKey,
} from '../../theatre/theatre-scene.ts';
import type {
  LightingGelPresetId,
  LightingPresetId,
  ProductionElementSpec,
} from '../../types/theatre.ts';
import { Icon, type IconName } from './icons.tsx';
import { useShell } from './shell-context.ts';

export type StagePanelTab = 'scenes' | 'workshop' | 'rigging';

const PANEL_TABS: ReadonlyArray<{
  readonly id: StagePanelTab;
  readonly label: string;
  readonly icon: IconName;
}> = [
  { id: 'scenes', label: 'Scenes & Sets', icon: 'stage' },
  { id: 'workshop', label: 'Workshop & CNC', icon: 'cnc' },
  { id: 'rigging', label: 'Rigging & Lights', icon: 'light' },
];

const LIGHTING_PRESETS: ReadonlyArray<{
  readonly id: LightingPresetId;
  readonly label: string;
}> = [
  { id: 'show-mode', label: 'Show' },
  { id: 'work-lights', label: 'Work Lights' },
  { id: 'tech-rehearsal', label: 'Tech' },
  { id: 'dramatic-cue', label: 'Dramatic' },
];

const LIGHTING_ZONE_FILTERS: ReadonlyArray<{
  readonly key: 'spotColorHex' | 'washColorHex' | 'cycColorHex' | 'apronColorHex';
  readonly label: string;
  readonly sub: string;
}> = [
  { key: 'spotColorHex', label: 'Spot / Specials', sub: 'Followspot & Key' },
  { key: 'washColorHex', label: 'Stage Wash', sub: 'FOH & Electrics' },
  { key: 'cycColorHex', label: 'Cyc Sky Gel', sub: 'Upstage Horizon' },
  { key: 'apronColorHex', label: 'Apron & Booms', sub: 'Footlights & Wings' },
];

const LIGHTING_CHANNELS: ReadonlyArray<{
  readonly key: LightingNumericChannelKey;
  readonly label: string;
  readonly subtitle: string;
  readonly maxPct: number;
  readonly defaultOnPct: number;
}> = [
  {
    key: 'followSpotLevel',
    label: 'Followspots & Specials',
    subtitle: 'Center showpiece followspot & downstage actor special',
    maxPct: 100,
    defaultOnPct: 96,
  },
  {
    key: 'practicalsLevel',
    label: 'Fairy Lights & Practicals',
    subtitle: 'Multi-colored Who-Land fairy light strands, tree & glowing windows',
    maxPct: 150,
    defaultOnPct: 112,
  },
  {
    key: 'stageElectricsLevel',
    label: 'Stage Electrics Key',
    subtitle: 'Overhead #1–#3 electrics & warm stage fill',
    maxPct: 100,
    defaultOnPct: 95,
  },
  {
    key: 'fohRailLevel',
    label: 'FOH Balcony Rail',
    subtitle: '14 front-of-house key ellipsoidal spots',
    maxPct: 100,
    defaultOnPct: 92,
  },
  {
    key: 'cycWashLevel',
    label: 'Upstage Cyclorama',
    subtitle: 'Sky cyc & groundrow LED color wash',
    maxPct: 100,
    defaultOnPct: 90,
  },
  {
    key: 'apronFootlightsLevel',
    label: 'Apron & Wing Booms',
    subtitle: 'Downstage apron footlights & SL/SR side wing cross-lights',
    maxPct: 100,
    defaultOnPct: 75,
  },
  {
    key: 'houseLevel',
    label: 'House Chandeliers',
    subtitle: 'Auditorium & proscenium frieze ambient',
    maxPct: 100,
    defaultOnPct: 35,
  },
];

function formatClassificationLabel(
  method: FabricationMethod,
  category: ProductionElementSpec['category']
): string {
  switch (method) {
    case 'cnc-primary':
      return '4\'×8\' CNC + Carpentry';
    case 'hybrid-cnc-carpentry':
      return 'Hybrid CNC + Carpentry';
    case 'soft-goods-paint':
      return 'Soft Goods / Paint Shop';
    case 'steel-rigging-carpentry':
      return 'Steel Rigging & Carpentry';
    case 'props-or-blocking':
      return category === 'blocking' ? 'Cast Blocking' : 'Props & Dressing Shop';
  }
}

function ScenesAndSetsTab(): JSX.Element {
  const sceneCtrl = useShell();
  const spec = activeProduction.value;
  const currentScene = activeScene.value;
  const sceneIdx = activeSceneIndex.value;
  // Subscribe to visibility/trim changes
  void elementVisibilityRevision.value;

  const scenes = spec.scenes;
  const sceneCode =
    currentScene.sceneNumber ?? currentScene.sceneLabel ?? `${sceneIdx + 1}`;

  const visibleCount = spec.elements.filter((el) =>
    sceneCtrl.isElementVisible(el.id)
  ).length;

  const handleStepScene = (delta: -1 | 1): void => {
    sceneCtrl.stepSceneCue(delta);
    syncStoreFromSceneController(sceneCtrl);
  };

  const handleSelectScene = (sceneId: string): void => {
    sceneCtrl.setSceneCue(sceneId);
    syncStoreFromSceneController(sceneCtrl);
  };

  const handleToggleElement = (elementId: string): void => {
    const nextVis = !sceneCtrl.isElementVisible(elementId);
    sceneCtrl.setElementVisibility(elementId, nextVis);
    syncStoreFromSceneController(sceneCtrl);
  };

  return (
    <>
      {/* 1. Scene Sequencer & Reference Plans */}
      <section class="shell-card" aria-label="Scene Sequencer">
        <div class="shell-card-head">
          <span class="shell-card-title">
            <Icon name="sparkles" size={15} />
            Scene Sequencer
          </span>
          <div class="shell-card-actions">
            <button
              type="button"
              class="shell-chip shell-chip-xs"
              title="Previous Scene Cue (Shortcut: [)"
              onClick={() => handleStepScene(-1)}
            >
              <Icon name="prev" size={12} />
              <span>Prev</span>
            </button>
            <span class="shell-badge shell-tabular">
              {sceneIdx + 1}/{scenes.length} · {sceneCode}
            </span>
            <button
              type="button"
              class="shell-chip shell-chip-xs"
              title="Next Scene Cue (Shortcut: ])"
              onClick={() => handleStepScene(1)}
            >
              <span>Next</span>
              <Icon name="next" size={12} />
            </button>
          </div>
        </div>

        {/* Scene Cue Pill Grid (1A, 1B, 1C, etc.) */}
        <div
          class="scene-pills-grid"
          role="group"
          aria-label="Scene Cue Selector"
        >
          {scenes.map((sc, idx) => {
            const code = sc.sceneNumber ?? sc.sceneLabel ?? `${idx + 1}`;
            const isActive = sc.id === currentScene.id;
            return (
              <button
                key={sc.id}
                type="button"
                class={`scene-pill-btn${isActive ? ' active is-active' : ''}`}
                aria-pressed={isActive}
                title={`Cue ${code}: ${sc.title}`}
                onClick={() => handleSelectScene(sc.id)}
              >
                <span class="scene-pill-code">{code}</span>
                <span class="scene-pill-name">{sc.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Scene Synopsis Card */}
        <div class="scene-synopsis-box">
          <div class="scene-synopsis-header">
            <span class="shell-badge">SCENE {sceneCode}</span>
            <strong class="scene-synopsis-title">{currentScene.title}</strong>
            {currentScene.actLabel && (
              <span class="scene-act-tag shell-muted">
                {currentScene.actLabel}
              </span>
            )}
          </div>
          <p class="scene-synopsis-text">{currentScene.synopsis}</p>

          {/* Compact Per-Scene Stage Gel & Practicals Strip */}
          <div class="scene-gel-strip" aria-label="Active Scene Gel Filters">
            <span class="scene-gel-strip-label">
              <Icon name="light" size={12} />
              <span>Scene Gels:</span>
            </span>
            <div class="scene-gel-swatches">
              {LIGHTING_ZONE_FILTERS.map((z) => (
                <label
                  key={z.key}
                  class="scene-gel-mini-swatch"
                  title={`${z.label} (${z.sub}): ${lightingState.value[z.key]} — Click to tweak gel color`}
                >
                  <input
                    type="color"
                    value={lightingState.value[z.key]}
                    aria-label={`${z.label} color picker`}
                    onInput={(e) => {
                      sceneCtrl.setLightingZoneColor(z.key, e.currentTarget.value);
                      syncStoreFromSceneController(sceneCtrl);
                    }}
                  />
                  <span
                    class="scene-gel-dot"
                    style={{ background: lightingState.value[z.key] }}
                  />
                  <span class="scene-gel-name">{z.label.split(' ')[0]}</span>
                </label>
              ))}
            </div>
            {lightingState.value.gelPresetId !== 'cue-default' && (
              <button
                type="button"
                class="shell-chip shell-chip-xs"
                title="Reset gel filters to this scene's designed cue colors"
                onClick={() => {
                  sceneCtrl.setLightingGelPreset('cue-default');
                  syncStoreFromSceneController(sceneCtrl);
                }}
              >
                Cue Default
              </button>
            )}
          </div>
        </div>

        {/* Reference Thumbnails (Model Box & 1/4" CAD Plan) */}
        {(currentScene.modelPhotoUrl || currentScene.groundPlanUrl) && (
          <div
            class={`scene-reference-media${
              currentScene.modelPhotoUrl && currentScene.groundPlanUrl
                ? ''
                : ' is-single'
            }`}
          >
            {currentScene.modelPhotoUrl && (
              <figure
                class="scene-ref-card"
                title='Click to enlarge physical 1/4" Model Box Photo'
                onClick={() => {
                  clearHoverTooltips();
                  lightboxMedia.value = {
                    badge: `SCENE ${sceneCode} · MODEL BOX`,
                    title: `${currentScene.title} — Scenic Designer Model Box (Andrew Gibbon)`,
                    imgUrl: currentScene.modelPhotoUrl!,
                  };
                }}
              >
                <img
                  src={currentScene.modelPhotoUrl}
                  alt={`Scene ${sceneCode} Model Box Photo`}
                  loading="lazy"
                />
                <figcaption>
                  <span>📷 Model Box</span>
                  <span class="ref-zoom-hint">Enlarge ⤢</span>
                </figcaption>
              </figure>
            )}

            {currentScene.groundPlanUrl && (
              <figure
                class="scene-ref-card"
                title='Click to enlarge 1/4" = 1&#39;-0" CAD Ground Plan'
                onClick={() => {
                  clearHoverTooltips();
                  lightboxMedia.value = {
                    badge: `SCENE ${sceneCode} · 1/4" = 1'-0" CAD`,
                    title: `${currentScene.title} — McColl Family Theatre CAD Ground Plan`,
                    imgUrl: currentScene.groundPlanUrl!,
                  };
                }}
              >
                <img
                  src={currentScene.groundPlanUrl}
                  alt={`Scene ${sceneCode} CAD Ground Plan`}
                  loading="lazy"
                />
                <figcaption>
                  <span>📐 1/4&quot; CAD Plan</span>
                  <span class="ref-zoom-hint">Enlarge ⤢</span>
                </figcaption>
              </figure>
            )}
          </div>
        )}
      </section>

      {/* 2. Scenic Elements in Production */}
      <section class="shell-card" aria-label="Scenic Elements in Production">
        <div class="shell-card-head">
          <span class="shell-card-title">
            <Icon name="cube" size={15} />
            Scenic Elements in Production
          </span>
          <span class="shell-pill">
            {visibleCount}/{spec.elements.length} visible
          </span>
        </div>

        <div class="scenic-elements-list" role="list">
          {spec.elements.map((el) => {
            const isVis = sceneCtrl.isElementVisible(el.id);
            return (
              <div
                key={el.id}
                role="listitem"
                class={`scenic-element-row${isVis ? ' is-visible' : ' is-hidden-el'}`}
              >
                <div class="scenic-element-left">
                  <button
                    type="button"
                    class={`shell-switch${isVis ? ' is-on' : ''}`}
                    role="switch"
                    aria-checked={isVis}
                    aria-label={`Toggle ${el.name} visibility`}
                    onClick={() => handleToggleElement(el.id)}
                  >
                    <span class="shell-switch-knob" />
                  </button>
                  <div
                    class="scenic-element-meta"
                    onClick={() => handleToggleElement(el.id)}
                  >
                    <span class="scenic-element-name">{el.name}</span>
                    <div class="scenic-element-subrow">
                      <span class="scenic-element-dim">
                        {el.dimensionsLabel}
                      </span>
                      {el.battenLine !== undefined && (
                        <span class="shell-pill shell-pill-xs">
                          Fly Channel #{el.battenLine}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  class="shell-chip scenic-shop-btn"
                  title={`Open Scenic Workshop & CNC Fabrication Plan for ${el.name}`}
                  onClick={() => openWorkshopForElementId(sceneCtrl, el.id)}
                >
                  <span>⚙ Shop / CNC</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Sightline / Scenic Designer Note */}
        <div class="scenic-sightline-callout">
          <strong>Sightline Focus:</strong> {spec.scenicNotes}
        </div>
      </section>
    </>
  );
}

function WorkshopAndCncTab(): JSX.Element {
  const sceneCtrl = useShell();
  const spec = activeProduction.value;

  const elementAnalyses = useMemo<ReadonlyArray<CncElementAnalysis>>(() => {
    return spec.elements.map((el) => {
      const target = sceneCtrl.getScenicElementTarget(el.id);
      const group = target?.objectGroup ?? sceneCtrl.productionSets.root;
      return analyzeElementForCncShop(el, spec, group, 'all');
    });
  }, [sceneCtrl, spec]);

  const totalCncSheets = elementAnalyses.reduce(
    (sum, a) => sum + (a.requiresCncRouting ? a.sheetCount4x8 : 0),
    0
  );
  const cncUnitCount = elementAnalyses.filter((a) => a.requiresCncRouting).length;

  return (
    <>
      {/* Workshop Explanation Card */}
      <section class="shell-card" aria-label="McColl Scenic Workshop Workflow">
        <div class="shell-card-head">
          <span class="shell-card-title">
            <Icon name="cnc" size={15} />
            McColl Scenic Workshop &amp; CNC
          </span>
          <span class="shell-badge">{totalCncSheets} × 4&apos;×8&apos; Sheets</span>
        </div>

        <p class="workshop-tab-lead">
          Click any individual piece on the 3D stage or choose a granular sub-unit below
          to inspect its Timber Carpentry, 3-Axis 4&apos;×8&apos; Plywood CNC, and Scenic Paint
          plan, and download AutoCAD (.DXF), Blueprint (.SVG), 3D Scale Mesh (.STL), and
          Cut-List (.CSV) files.
        </p>

        <div class="shell-chips">
          <span class="shell-pill">
            {cncUnitCount} CNC / Hybrid Groups
          </span>
          <span class="shell-pill">
            {spec.elements.length - cncUnitCount} Soft Goods / Shop Units
          </span>
        </div>
      </section>

      {/* Interactive Workshop Cards for Every Scenic Unit */}
      {elementAnalyses.map((analysis) => {
        const { element } = analysis;
        const classification = formatClassificationLabel(
          analysis.fabricationMethod,
          element.category
        );
        const granularUnits = analysis.subUnits.filter(
          (u) => !u.isCombinedMacroUnit
        );

        return (
          <section
            key={element.id}
            class="shell-card workshop-unit-card"
            aria-label={`${element.name} Workshop Fabrication Card`}
          >
            <div class="workshop-unit-head">
              <div class="workshop-unit-title-col">
                <div class="workshop-unit-title">{element.name}</div>
                <div class="scenic-element-dim">
                  {element.dimensionsLabel}
                  {element.battenLine !== undefined
                    ? ` · Fly Channel #${element.battenLine}`
                    : ''}
                </div>
              </div>

              <span
                class={`workshop-method-badge ref-lightbox-badge method-${analysis.fabricationMethod}`}
              >
                {classification}
              </span>
            </div>

            <p class="workshop-unit-note">{analysis.primaryConstructionNote}</p>

            {granularUnits.length > 1 && (
              <div class="workshop-subunits-inline">
                <span class="workshop-subunits-inline-title">
                  Inspect Individual Sub-Units ({granularUnits.length})
                </span>
                <div class="shell-chips">
                  {granularUnits.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      class="shell-chip shell-chip-xs"
                      title={sub.description}
                      onClick={() =>
                        openWorkshopForElementId(sceneCtrl, element.id, sub.id)
                      }
                    >
                      <span>{sub.shortLabel}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div class="workshop-unit-footer">
              <div class="shell-chips">
                {analysis.requiresCncRouting && analysis.sheetCount4x8 > 0 ? (
                  <>
                    <span class="shell-pill is-cnc-pill">
                      {analysis.sheetCount4x8} × 4&apos;×8&apos; CNC Sheets
                    </span>
                    <span class="shell-pill">
                      {analysis.cncParts.length} CNC Parts
                    </span>
                  </>
                ) : (
                  <span class="shell-pill">
                    0 CNC Sheets ·{' '}
                    {analysis.departmentBreakdown[0]?.department ?? 'Traditional Shop'}
                  </span>
                )}
              </div>

              <button
                type="button"
                class="shell-btn shell-btn-primary shell-btn-sm"
                onClick={() => openWorkshopForElementId(sceneCtrl, element.id)}
              >
                <Icon name="download" size={13} />
                <span>
                  {granularUnits.length > 1
                    ? `Inspect ${granularUnits[0]?.shortLabel ?? 'Unit'}`
                    : 'Inspect & Download Files'}
                </span>
              </button>
            </div>
          </section>
        );
      })}
    </>
  );
}

interface ProductionBattenChannel {
  readonly lineNumber: number;
  readonly label: string;
  readonly elements: ReadonlyArray<ProductionElementSpec>;
}

function RiggingAndLightsTab(): JSX.Element {
  const sceneCtrl = useShell();
  // Subscribe to reactive signals
  void elementVisibilityRevision.value;
  const spec = activeProduction.value;
  const currentScene = activeScene.value;
  const drapeFraction = grandDrapeOpenFraction.value;
  const drapePct = Math.round(drapeFraction * 100);
  const cadGrid = cadGridEnabled.value;
  const pitOpen = orchestraPitOpen.value;
  const trapsOpen = stageTrapsOpen.value;
  const overhangGuides = balconyOverhangGuidesVisible.value;
  const gfxMode = graphicsQuality.value;
  const lights = lightingState.value;

  // Derive active production's flown battens from spec.elements
  const productionBattens = useMemo<ReadonlyArray<ProductionBattenChannel>>(() => {
    const byLine = new Map<number, ProductionElementSpec[]>();
    for (const el of spec.elements) {
      if (el.battenLine !== undefined) {
        const list = byLine.get(el.battenLine) ?? [];
        list.push(el);
        byLine.set(el.battenLine, list);
      }
    }
    return Array.from(byLine.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([lineNumber, elements]) => ({
        lineNumber,
        label: elements[0]!.name,
        elements,
      }));
  }, [spec]);

  const handleGrandDrapeInput = (pct: number): void => {
    sceneCtrl.setGrandDrapeOpenFraction(pct / 100);
    syncStoreFromSceneController(sceneCtrl);
  };

  const handleBattenInput = (lineNumber: number, trimM: number): void => {
    sceneCtrl.setBattenTrimHeight(lineNumber, trimM);
    syncStoreFromSceneController(sceneCtrl);
  };

  const handleToggleBattenElements = (batten: ProductionBattenChannel): void => {
    const anyVis = batten.elements.some((el) => sceneCtrl.isElementVisible(el.id));
    if (anyVis) {
      for (const el of batten.elements) {
        sceneCtrl.setElementVisibility(el.id, false);
      }
    } else {
      const preferred =
        batten.elements.find((el) => currentScene.visibleElementIds.includes(el.id)) ??
        batten.elements[0];
      if (preferred) {
        sceneCtrl.setElementVisibility(preferred.id, true);
        if (sceneCtrl.getBattenTrimHeight(batten.lineNumber) >= 6.5) {
          sceneCtrl.setBattenTrimHeight(batten.lineNumber, 0);
        }
      }
    }
    syncStoreFromSceneController(sceneCtrl);
  };

  const handleResetToSceneCue = (): void => {
    sceneCtrl.setSceneCue(currentScene.id);
    syncStoreFromSceneController(sceneCtrl);
    showToast(`Restored fly trims & lighting for Scene ${currentScene.sceneNumber ?? currentScene.sceneLabel ?? '1'}`);
  };

  const handleLightingPreset = (preset: LightingPresetId): void => {
    sceneCtrl.setLightingPreset(preset);
    syncStoreFromSceneController(sceneCtrl);
  };

  const handleLightingChannel = (
    channel: LightingNumericChannelKey,
    pct: number
  ): void => {
    sceneCtrl.updateLightingChannel(channel, pct / 100);
    syncStoreFromSceneController(sceneCtrl);
  };

  const handleSelectGelPreset = (
    gelId: Exclude<LightingGelPresetId, 'custom'>
  ): void => {
    sceneCtrl.setLightingGelPreset(gelId);
    syncStoreFromSceneController(sceneCtrl);
  };

  const handleZoneColorInput = (
    zone: 'spotColorHex' | 'washColorHex' | 'cycColorHex' | 'apronColorHex',
    hex: string
  ): void => {
    sceneCtrl.setLightingZoneColor(zone, hex);
    syncStoreFromSceneController(sceneCtrl);
  };

  const handleToggleSpotBeams = (): void => {
    sceneCtrl.setSpotBeamsVisible(!lights.spotBeamsVisible);
    syncStoreFromSceneController(sceneCtrl);
  };

  const handleCycleGfx = (): void => {
    const next = sceneCtrl.cycleGraphicsQuality();
    syncStoreFromSceneController(sceneCtrl);
    showToast(
      `Graphics quality: ${
        next === 'ultra' ? 'Ultra' : next === 'balanced' ? 'Balanced' : 'Max FPS'
      }`
    );
  };

  return (
    <>
      {/* 1. Stage Spots, Gel Filters & Dimmer Faders */}
      <section class="shell-card" aria-label="Stage Spots, Gel Filters and Dimmer Faders">
        <div class="shell-card-head">
          <span class="shell-card-title">
            <Icon name="light" size={15} />
            Stage Spots, Gels &amp; Dimmers
          </span>
          <div class="shell-card-actions">
            <button
              type="button"
              class={`shell-chip shell-chip-xs${lights.spotBeamsVisible ? ' is-active' : ''}`}
              aria-pressed={lights.spotBeamsVisible}
              title="Toggle 3D Volumetric Spotlight Cones from Overhead Electrics"
              onClick={handleToggleSpotBeams}
            >
              <span>Spot Beams: {lights.spotBeamsVisible ? 'ON' : 'OFF'}</span>
            </button>
            <span class="shell-badge">
              {lights.preset.replace('-', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        <div
          class="shell-seg shell-seg-sm shell-seg-grid-4"
          role="group"
          aria-label="Lighting Cue Presets"
        >
          {LIGHTING_PRESETS.map((p) => {
            const active = lights.preset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                class={`shell-seg-btn${active ? ' is-active' : ''}`}
                aria-pressed={active}
                onClick={() => handleLightingPreset(p.id)}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Theatrical Rosco / Lee Gel Filter Palette */}
        <div class="shell-card-head shell-card-subhead">
          <span class="shell-panel-eyebrow">Theatrical Color Gel Filters (Rosco / Lee)</span>
          <span class="shell-muted shell-text-xs">
            {lights.gelPresetId === 'cue-default'
              ? `Scene ${currentScene.sceneNumber ?? currentScene.sceneLabel ?? '1'} Cue`
              : lights.gelPresetId === 'custom'
                ? 'Custom Gel Mix'
                : lights.gelPresetId.toUpperCase()}
          </span>
        </div>

        <div class="gel-preset-grid" role="group" aria-label="Theatrical Gel Filter Presets">
          {LIGHTING_GEL_PRESETS.map((gel) => {
            const isSelected = lights.gelPresetId === gel.id;
            const swatch =
              gel.id === 'cue-default'
                ? `#${(
                    currentScene.stageSpotColor ?? spec.stageSpotColor
                  )
                    .toString(16)
                    .padStart(6, '0')}`
                : gel.swatchHex;
            return (
              <button
                key={gel.id}
                type="button"
                class={`gel-preset-btn${isSelected ? ' is-active' : ''}`}
                aria-pressed={isSelected}
                title={`${gel.code} · ${gel.label}`}
                onClick={() => handleSelectGelPreset(gel.id)}
              >
                <span
                  class="gel-preset-swatch"
                  style={{ background: swatch }}
                />
                <span class="gel-preset-code">{gel.code}</span>
                <span class="gel-preset-label">{gel.label}</span>
              </button>
            );
          })}
        </div>

        {/* 4 Interactive Zone Gel Color Swatch Pickers */}
        <div class="gel-zone-pickers" role="group" aria-label="Per-Zone Gel Filter Color Pickers">
          {LIGHTING_ZONE_FILTERS.map((zone) => {
            const hexVal = lights[zone.key];
            return (
              <label
                key={zone.key}
                class="gel-zone-card"
                title={`Click to customize ${zone.label} (${zone.sub}) gel filter color`}
              >
                <input
                  type="color"
                  value={hexVal}
                  aria-label={`${zone.label} Gel Color`}
                  onInput={(e) =>
                    handleZoneColorInput(zone.key, e.currentTarget.value)
                  }
                />
                <span
                  class="gel-zone-color-chip"
                  style={{ background: hexVal }}
                />
                <span class="gel-zone-meta">
                  <strong class="gel-zone-title">{zone.label}</strong>
                  <span class="gel-zone-hex">{hexVal.toUpperCase()}</span>
                </span>
              </label>
            );
          })}
        </div>

        {/* 7 Dimmer Faders (including Followspots & Fairy Lights/Practicals) */}
        <ul class="shell-lights" role="list">
          {LIGHTING_CHANNELS.map((ch) => {
            const pct = Math.round(lights[ch.key] * 100);
            const isOn = pct > 0;
            const fillPct = Math.min(100, Math.round((pct / ch.maxPct) * 100));
            return (
              <li key={ch.key} class={`shell-light${isOn ? ' is-on' : ''}`}>
                <button
                  type="button"
                  class={`shell-switch${isOn ? ' is-on' : ''}`}
                  role="switch"
                  aria-checked={isOn}
                  aria-label={`Toggle ${ch.label}`}
                  onClick={() =>
                    handleLightingChannel(ch.key, isOn ? 0 : ch.defaultOnPct)
                  }
                >
                  <span class="shell-switch-knob" />
                </button>
                <div class="shell-light-body">
                  <div class="shell-light-label">
                    <span title={ch.subtitle}>{ch.label}</span>
                    <span class="shell-light-pct">{pct}%</span>
                  </div>
                  <input
                    class="shell-range"
                    type="range"
                    min={0}
                    max={ch.maxPct}
                    step={1}
                    value={pct}
                    aria-label={`${ch.label} dimmer level`}
                    style={{ '--fill': `${fillPct}%` }}
                    onInput={(e) =>
                      handleLightingChannel(ch.key, Number(e.currentTarget.value))
                    }
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 2. 52-Lineset Counterweight Fly Trim Sliders & Stage Mechanics */}
      <section class="shell-card" aria-label="52-Lineset Counterweight Fly Trim Sliders">
        <div class="shell-card-head">
          <span class="shell-card-title">
            <Icon name="stage" size={15} />
            Counterweight Fly Rigging
          </span>
          <button
            type="button"
            class="shell-chip shell-chip-xs"
            title="Restore batten trims, onstage elements, and lighting gels to the active scene cue"
            onClick={handleResetToSceneCue}
          >
            Reset to Cue
          </button>
        </div>

        {/* Grand Velour Drape Open/Close Slider */}
        <div class="shell-light is-on">
          <div class="shell-light-body">
            <div class="shell-light-label">
              <span class="shell-font-semibold">Grand Velour Curtain (Proscenium)</span>
              <span class="shell-light-pct">
                {drapePct === 0 ? 'Closed (0%)' : `${drapePct}% Open`}
              </span>
            </div>
            <input
              class="shell-range"
              type="range"
              min={0}
              max={100}
              step={1}
              value={drapePct}
              aria-label="Grand Drape Open Percentage"
              style={{ '--fill': `${drapePct}%` }}
              onInput={(e) =>
                handleGrandDrapeInput(Number(e.currentTarget.value))
              }
            />
          </div>
        </div>

        {/* Active Production's Counterweight Battens List */}
        <ul class="shell-lights" role="list">
          {productionBattens.map((b) => {
            const curTrim = sceneCtrl.getBattenTrimHeight(b.lineNumber);
            const anyVis = b.elements.some((el) => sceneCtrl.isElementVisible(el.id));
            const fillPct = Math.min(100, Math.max(0, (curTrim / 6.8) * 100));
            return (
              <li key={b.lineNumber} class={`shell-light${anyVis ? ' is-on' : ''}`}>
                <button
                  type="button"
                  class={`shell-switch${anyVis ? ' is-on' : ''}`}
                  role="switch"
                  aria-checked={anyVis}
                  aria-label={`Toggle ${b.label} visibility`}
                  title={anyVis ? 'Fly unit is active on stage (click to hide)' : 'Click to fly unit in on stage'}
                  onClick={() => handleToggleBattenElements(b)}
                >
                  <span class="shell-switch-knob" />
                </button>
                <div class="shell-light-body">
                  <div class="shell-light-label">
                    <span title={b.label}>{b.label}</span>
                    <span class="shell-light-pct">
                      {!anyVis
                        ? 'Stowed'
                        : curTrim === 0
                          ? 'In-Trim (0.0m)'
                          : `+${curTrim.toFixed(1)}m Out`}
                    </span>
                  </div>
                  <input
                    class="shell-range"
                    type="range"
                    min={0}
                    max={6.8}
                    step={0.1}
                    value={curTrim}
                    aria-label={`${b.label} trim height`}
                    style={{ '--fill': `${fillPct}%` }}
                    onInput={(e) =>
                      handleBattenInput(b.lineNumber, Number(e.currentTarget.value))
                    }
                  />
                </div>
              </li>
            );
          })}
        </ul>

        {/* Stage Mechanics Toggles */}
        <div class="shell-card-head shell-card-subhead">
          <span class="shell-panel-eyebrow">Stage Mechanics &amp; Viewport Overlays</span>
        </div>

        <div class="stage-mechanics-grid">
          <button
            type="button"
            class={`shell-action${cadGrid ? ' is-active' : ''}`}
            aria-pressed={cadGrid}
            onClick={() => {
              sceneCtrl.setCadGridEnabled(!cadGrid);
              syncStoreFromSceneController(sceneCtrl);
            }}
          >
            <Icon name="grid" size={16} />
            <span>CAD Grid: {cadGrid ? 'ON' : 'OFF'}</span>
          </button>

          <button
            type="button"
            class={`shell-action${pitOpen ? ' is-active' : ''}`}
            aria-pressed={pitOpen}
            onClick={() => {
              sceneCtrl.setOrchestraPitOpen(!pitOpen);
              syncStoreFromSceneController(sceneCtrl);
            }}
          >
            <Icon name="stage" size={16} />
            <span>Orchestra Pit: {pitOpen ? 'Open' : 'Covered'}</span>
          </button>

          <button
            type="button"
            class={`shell-action${trapsOpen ? ' is-active' : ''}`}
            aria-pressed={trapsOpen}
            onClick={() => {
              sceneCtrl.setStageTrapsOpen(!trapsOpen);
              syncStoreFromSceneController(sceneCtrl);
            }}
          >
            <Icon name="cube" size={16} />
            <span>Stage Traps: {trapsOpen ? 'Open' : 'Closed'}</span>
          </button>

          <button
            type="button"
            class={`shell-action${overhangGuides ? ' is-active' : ''}`}
            aria-pressed={overhangGuides}
            onClick={() => {
              sceneCtrl.setBalconyOverhangGuidesVisible(!overhangGuides);
              syncStoreFromSceneController(sceneCtrl);
            }}
          >
            <Icon name="eye" size={16} />
            <span>Balcony Guides: {overhangGuides ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        <div class="shell-row">
          <span class="shell-muted">Post-Processing &amp; Shadows</span>
          <button
            type="button"
            class="shell-chip"
            title="Cycle WebGL Graphics Quality Preset (Ultra / Balanced / Max FPS)"
            onClick={handleCycleGfx}
          >
            <Icon name="gear" size={13} />
            <span>
              GFX Quality:{' '}
              {gfxMode === 'ultra'
                ? 'Ultra'
                : gfxMode === 'balanced'
                  ? 'Balanced'
                  : 'Max FPS'}
            </span>
          </button>
        </div>
      </section>
    </>
  );
}

export function StagePanel(): JSX.Element {
  const [activeTab, setActiveTab] = useState<StagePanelTab>('scenes');
  const open = stagePanelOpen.value;
  const mobile = isMobile.value;
  const spec = activeProduction.value;

  return (
    <aside
      class={`shell-roompanel shell-panel shell-glass${open ? ' is-open' : ''}${
        mobile ? ' is-drawer' : ''
      }`}
      aria-label="Stage, Scenic & Workshop Controls"
      aria-hidden={!open}
    >
      {/* Panel Header */}
      <div class="shell-panel-head">
        <div class="shell-panel-heading">
          <span class="shell-panel-eyebrow">
            McColl Stage · {spec.scenes.length} Scenes · {spec.ageRecommendation}
          </span>
          <span class="shell-panel-title shell-panel-title-lg" title={spec.title}>
            {spec.title}
          </span>
        </div>
        <button
          type="button"
          class="shell-icon-btn shell-icon-btn-sm"
          aria-label="Hide stage & workshop controls"
          title="Hide stage & workshop controls"
          onClick={() => {
            stagePanelOpen.value = false;
          }}
        >
          <Icon name="close" size={16} />
        </button>
      </div>

      {/* 3-Tab Segmented Switcher (Scenes & Sets | Workshop & CNC | Rigging & Lights) */}
      <div class="shell-panel-tabs-wrap">
        <div
          class="shell-seg shell-seg-sm shell-seg-grid-3"
          role="tablist"
          aria-label="Stage Inspector Sections"
        >
          {PANEL_TABS.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                class={`shell-seg-btn${isSelected ? ' is-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon name={tab.icon} size={13} />
                <span class="shell-seg-label">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Tab Content */}
      <div class="shell-panel-scroll" key={`${spec.id}-${activeTab}`}>
        {activeTab === 'scenes' && <ScenesAndSetsTab />}
        {activeTab === 'workshop' && <WorkshopAndCncTab />}
        {activeTab === 'rigging' && <RiggingAndLightsTab />}
      </div>
    </aside>
  );
}
