import type { JSX } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import {
  analyzeElementForCncShop,
  type CncElementAnalysis,
  type FabricationMethod,
} from '../../engine/cnc-shop-exporter.ts';
import { DEFAULT_RIGGING_BATTENS, PRODUCTION_CATALOG } from '../../sets/index.ts';
import {
  activeProduction,
  activeScene,
  activeSceneIndex,
  balconyOverhangGuidesVisible,
  cadGridEnabled,
  customPieces,
  elementVisibilityRevision,
  grandDrapeOpenFraction,
  graphicsQuality,
  isMobile,
  lightboxMedia,
  lightingState,
  openWorkshopForElementId,
  orchestraPitOpen,
  selectedCustomPiece,
  showToast,
  stagePanelOpen,
  stageTrapsOpen,
  syncStoreFromSceneController,
} from '../../state/shell-store.ts';
import type {
  CustomSetPieceKind,
  LightingPresetId,
  ProductionElementSpec,
  ProductionId,
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

const LIGHTING_CHANNELS: ReadonlyArray<{
  readonly key: 'houseLevel' | 'fohRailLevel' | 'stageElectricsLevel' | 'cycWashLevel';
  readonly label: string;
  readonly subtitle: string;
}> = [
  {
    key: 'houseLevel',
    label: 'House Chandeliers',
    subtitle: 'Auditorium & proscenium frieze ambient',
  },
  {
    key: 'fohRailLevel',
    label: 'FOH Balcony Rail',
    subtitle: '14 front-of-house key ellipsoidal spots',
  },
  {
    key: 'stageElectricsLevel',
    label: 'Stage Electrics Key',
    subtitle: 'Overhead #1–#3 electrics & warm stage fill',
  },
  {
    key: 'cycWashLevel',
    label: 'Upstage Cyclorama',
    subtitle: 'Sky cyc & groundrow LED color wash',
  },
];

const CUSTOM_SPAWNER_ITEMS: ReadonlyArray<{
  readonly kind: CustomSetPieceKind;
  readonly label: string;
}> = [
  { kind: 'platform-4x8', label: '+ 4×8 Riser' },
  { kind: 'flat-12ft', label: '+ 12ft Flat' },
  { kind: 'arch-portal', label: '+ Arch Portal' },
  { kind: 'stairs-3step', label: '+ 3-Step Stair' },
  { kind: 'periaktos', label: '+ Periaktos' },
  { kind: 'prop-table', label: '+ Prop Table' },
  { kind: 'actor-child', label: '+ Child (1.35m)' },
  { kind: 'actor-adult', label: '+ Adult (1.75m)' },
];

function formatClassificationLabel(
  method: FabricationMethod,
  category: ProductionElementSpec['category']
): string {
  switch (method) {
    case 'cnc-primary':
      return 'CNC Router + Foam';
    case 'hybrid-cnc-carpentry':
      return 'Hybrid CNC + Carpentry';
    case 'soft-goods-paint':
      return 'Soft Goods / Paint Shop — No CNC';
    case 'steel-rigging-carpentry':
      return 'Steel Rigging & Carpentry — No CNC';
    case 'props-or-blocking':
      return category === 'blocking' ? 'Cast Blocking' : 'Props Shop — No CNC';
  }
}

function classificationAccentStyle(method: FabricationMethod): {
  readonly background: string;
  readonly color: string;
  readonly border: string;
} {
  switch (method) {
    case 'cnc-primary':
      return {
        background: 'rgba(56, 226, 152, 0.14)',
        color: '#5ce898',
        border: '1px solid rgba(56, 226, 152, 0.36)',
      };
    case 'hybrid-cnc-carpentry':
      return {
        background: 'rgba(242, 196, 109, 0.16)',
        color: '#f2c46d',
        border: '1px solid rgba(242, 196, 109, 0.38)',
      };
    case 'soft-goods-paint':
      return {
        background: 'rgba(98, 200, 255, 0.14)',
        color: '#7fd0ff',
        border: '1px solid rgba(98, 200, 255, 0.34)',
      };
    case 'steel-rigging-carpentry':
      return {
        background: 'rgba(180, 160, 255, 0.14)',
        color: '#c4b5fd',
        border: '1px solid rgba(180, 160, 255, 0.34)',
      };
    case 'props-or-blocking':
      return {
        background: 'rgba(255, 255, 255, 0.08)',
        color: '#b8c0cc',
        border: '1px solid rgba(255, 255, 255, 0.16)',
      };
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

  const handleSelectProduction = (prodId: ProductionId): void => {
    sceneCtrl.setProduction(prodId);
    syncStoreFromSceneController(sceneCtrl);
  };

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
      {/* 1. Active Production & Scene Sequencer */}
      <section class="shell-card" aria-label="Active Production and Scene Sequencer">
        <div class="shell-card-head">
          <span class="shell-card-title">
            <Icon name="sparkles" size={15} />
            Scene Sequencer
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              class="shell-chip"
              title="Previous Scene Cue (Shortcut: [)"
              onClick={() => handleStepScene(-1)}
              style={{ height: '24px', padding: '0 8px' }}
            >
              <Icon name="prev" size={12} />
              <span>Prev</span>
            </button>
            <span class="shell-badge" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {sceneIdx + 1}/{scenes.length} · {sceneCode}
            </span>
            <button
              type="button"
              class="shell-chip"
              title="Next Scene Cue (Shortcut: ])"
              onClick={() => handleStepScene(1)}
              style={{ height: '24px', padding: '0 8px' }}
            >
              <span>Next</span>
              <Icon name="next" size={12} />
            </button>
          </div>
        </div>

        {/* Production Selector & Quick Note */}
        <div class="shell-row" style={{ gap: '8px' }}>
          <label
            htmlFor="stage-panel-prod-select"
            class="shell-muted"
            style={{ whiteSpace: 'nowrap', fontSize: '12px' }}
          >
            Production
          </label>
          <select
            id="stage-panel-prod-select"
            class="shell-select shell-select-sm"
            style={{ flex: 1, minWidth: 0 }}
            value={spec.id}
            aria-label="Select Production Set"
            onChange={(e) =>
              handleSelectProduction(e.currentTarget.value as ProductionId)
            }
          >
            {PRODUCTION_CATALOG.map((prod) => (
              <option key={prod.id} value={prod.id}>
                {prod.title} ({prod.scenes.length} Scenes)
              </option>
            ))}
          </select>
        </div>

        {/* Scene Cue Pill Grid (1A, 1B, 1C·1, 1C·2, 1D, 1E, 1F, 1G, 1H, etc.) */}
        <div
          class="scene-pills-grid"
          role="group"
          aria-label="Scene Cue Selector"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '5px',
          }}
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
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '2px',
                  padding: '6px 7px',
                  borderRadius: '8px',
                  border: isActive
                    ? '1px solid rgba(242, 196, 109, 0.65)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isActive
                    ? 'rgba(242, 196, 109, 0.16)'
                    : 'rgba(255, 255, 255, 0.04)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  minWidth: 0,
                }}
              >
                <span
                  class="scene-pill-code"
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 700,
                    color: isActive ? '#f2c46d' : '#62c8ff',
                  }}
                >
                  {code}
                </span>
                <span
                  class="scene-pill-name"
                  style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    color: isActive ? '#ffffff' : '#d0d5df',
                    width: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {sc.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Scene Synopsis Card */}
        <div
          class="scene-synopsis-box"
          style={{
            padding: '10px 11px',
            borderRadius: '10px',
            background: 'rgba(0, 0, 0, 0.24)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
          }}
        >
          <div
            class="scene-synopsis-header"
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '6px',
            }}
          >
            <span class="shell-badge">SCENE {sceneCode}</span>
            <strong
              class="scene-synopsis-title"
              style={{ fontSize: '13px', color: '#f2f4f8' }}
            >
              {currentScene.title}
            </strong>
            {currentScene.actLabel && (
              <span
                class="scene-act-tag shell-muted"
                style={{ marginLeft: 'auto', fontSize: '11px' }}
              >
                {currentScene.actLabel}
              </span>
            )}
          </div>
          <p
            class="scene-synopsis-text"
            style={{
              fontSize: '12px',
              lineHeight: 1.45,
              color: '#b8c0cc',
              margin: 0,
            }}
          >
            {currentScene.synopsis}
          </p>
        </div>

        {/* Reference Thumbnails (Model Box & 1/4" CAD Plan) */}
        {(currentScene.modelPhotoUrl || currentScene.groundPlanUrl) && (
          <div
            class="scene-reference-media"
            style={{
              display: 'grid',
              gridTemplateColumns:
                currentScene.modelPhotoUrl && currentScene.groundPlanUrl
                  ? '1fr 1fr'
                  : '1fr',
              gap: '8px',
            }}
          >
            {currentScene.modelPhotoUrl && (
              <figure
                class="scene-ref-card"
                title="Click to enlarge physical 1/4&quot; Model Box Photo"
                style={{
                  margin: 0,
                  borderRadius: '9px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  background: 'rgba(0, 0, 0, 0.3)',
                  cursor: 'pointer',
                }}
                onClick={() => {
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
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '78px',
                    objectFit: 'cover',
                  }}
                />
                <figcaption
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '5px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  <span>📷 Model Box</span>
                  <span style={{ color: '#f2c46d', fontSize: '10.5px' }}>Enlarge ⤢</span>
                </figcaption>
              </figure>
            )}

            {currentScene.groundPlanUrl && (
              <figure
                class="scene-ref-card"
                title="Click to enlarge 1/4&quot; = 1'-0&quot; CAD Ground Plan"
                style={{
                  margin: 0,
                  borderRadius: '9px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  background: 'rgba(0, 0, 0, 0.3)',
                  cursor: 'pointer',
                }}
                onClick={() => {
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
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '78px',
                    objectFit: 'cover',
                  }}
                />
                <figcaption
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '5px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  <span>📐 1/4&quot; CAD Plan</span>
                  <span style={{ color: '#f2c46d', fontSize: '10.5px' }}>Enlarge ⤢</span>
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

        <div
          class="scenic-elements-list"
          role="list"
          style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}
        >
          {spec.elements.map((el) => {
            const isVis = sceneCtrl.isElementVisible(el.id);
            return (
              <div
                key={el.id}
                role="listitem"
                class="scenic-element-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '10px',
                  background: isVis
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    minWidth: 0,
                    flex: 1,
                  }}
                >
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
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      minWidth: 0,
                      flex: 1,
                      cursor: 'pointer',
                    }}
                    onClick={() => handleToggleElement(el.id)}
                  >
                    <span
                      style={{
                        fontSize: '12.5px',
                        fontWeight: 600,
                        color: isVis ? '#f0f2f6' : '#8d96a5',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {el.name}
                    </span>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginTop: '2px',
                      }}
                    >
                      <span
                        class="scenic-element-dim"
                        style={{
                          fontSize: '11px',
                          color: '#9aa3ae',
                          fontFamily:
                            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        }}
                      >
                        {el.dimensionsLabel}
                      </span>
                      {el.battenLine !== undefined && (
                        <span
                          class="shell-pill"
                          style={{
                            height: '16px',
                            fontSize: '10px',
                            padding: '0 5px',
                          }}
                        >
                          Lineset #{el.battenLine}
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
                  style={{
                    flexShrink: 0,
                    height: '28px',
                    padding: '0 10px',
                    borderRadius: '8px',
                    background: 'rgba(242, 196, 109, 0.14)',
                    borderColor: 'rgba(242, 196, 109, 0.38)',
                    color: '#f2c46d',
                    fontWeight: 600,
                    fontSize: '11.5px',
                  }}
                >
                  <span>⚙ Shop / CNC</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Sightline / Scenic Designer Note */}
        <div
          style={{
            padding: '8px 10px',
            borderRadius: '9px',
            background: 'rgba(242, 196, 109, 0.07)',
            border: '1px solid rgba(242, 196, 109, 0.2)',
            fontSize: '11.5px',
            color: '#d8dee8',
            lineHeight: 1.4,
          }}
        >
          <strong style={{ color: '#f2c46d' }}>Sightline Focus:</strong>{' '}
          {spec.scenicNotes}
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
      return analyzeElementForCncShop(el, spec, group);
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

        <p
          style={{
            margin: 0,
            fontSize: '12px',
            lineHeight: 1.48,
            color: '#c7cfd9',
          }}
        >
          Click any scenic item in the 3D stage or select a unit below to inspect its
          Multi-Department Fabrication Plan and download 4&apos;×8&apos; CNC Router (.DXF /
          .SVG), 3D Foam (.STL), and Cut-List (.CSV) files. Note: Main
          structural/sculpted units use CNC routing, while backdrops/scrims/curtains are
          built in the Soft Goods &amp; Paint Shop (no CNC required).
        </p>

        <div class="shell-chips">
          <span class="shell-pill">
            {cncUnitCount} CNC / Hybrid Units
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
        const badgeStyle = classificationAccentStyle(analysis.fabricationMethod);

        return (
          <section
            key={element.id}
            class="shell-card"
            aria-label={`${element.name} Workshop Fabrication Card`}
            style={{ gap: '8px' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '8px',
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 650,
                    color: '#f2f4f8',
                    marginBottom: '3px',
                  }}
                >
                  {element.name}
                </div>
                <div
                  style={{
                    fontSize: '11.5px',
                    color: '#9aa3ae',
                    fontFamily:
                      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  }}
                >
                  {element.dimensionsLabel}
                  {element.battenLine !== undefined
                    ? ` · Lineset #${element.battenLine}`
                    : ''}
                </div>
              </div>

              <span
                style={{
                  ...badgeStyle,
                  padding: '3px 8px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 650,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {classification}
              </span>
            </div>

            <p
              style={{
                margin: 0,
                fontSize: '12px',
                lineHeight: 1.42,
                color: '#b8c0cc',
              }}
            >
              {analysis.primaryConstructionNote}
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                marginTop: '2px',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {analysis.requiresCncRouting && analysis.sheetCount4x8 > 0 ? (
                  <>
                    <span class="shell-pill" style={{ color: '#5ce898' }}>
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
                class="shell-btn shell-btn-primary"
                style={{
                  height: '30px',
                  padding: '0 12px',
                  fontSize: '12px',
                }}
                onClick={() => openWorkshopForElementId(sceneCtrl, element.id)}
              >
                <Icon name="download" size={13} />
                <span>Inspect &amp; Download Files</span>
              </button>
            </div>
          </section>
        );
      })}
    </>
  );
}

function RiggingAndLightsTab(): JSX.Element {
  const sceneCtrl = useShell();
  // Subscribe to reactive signals
  void elementVisibilityRevision.value;
  const drapeFraction = grandDrapeOpenFraction.value;
  const drapePct = Math.round(drapeFraction * 100);
  const cadGrid = cadGridEnabled.value;
  const pitOpen = orchestraPitOpen.value;
  const trapsOpen = stageTrapsOpen.value;
  const overhangGuides = balconyOverhangGuidesVisible.value;
  const gfxMode = graphicsQuality.value;
  const lights = lightingState.value;
  const spawnedPieces = customPieces.value;
  const selectedPiece = selectedCustomPiece.value;

  const handleGrandDrapeInput = (pct: number): void => {
    sceneCtrl.setGrandDrapeOpenFraction(pct / 100);
    syncStoreFromSceneController(sceneCtrl);
  };

  const handleBattenInput = (lineNumber: number, trimM: number): void => {
    sceneCtrl.setBattenTrimHeight(lineNumber, trimM);
    syncStoreFromSceneController(sceneCtrl);
  };

  const handleResetAllBattens = (): void => {
    for (const b of DEFAULT_RIGGING_BATTENS) {
      sceneCtrl.setBattenTrimHeight(b.lineNumber, 0);
    }
    syncStoreFromSceneController(sceneCtrl);
    showToast('All counterweight fly battens reset to 0.0m Show In-Trim');
  };

  const handleLightingPreset = (preset: LightingPresetId): void => {
    sceneCtrl.setLightingPreset(preset);
    syncStoreFromSceneController(sceneCtrl);
  };

  const handleLightingChannel = (
    channel: 'houseLevel' | 'fohRailLevel' | 'stageElectricsLevel' | 'cycWashLevel',
    pct: number
  ): void => {
    sceneCtrl.updateLightingChannel(channel, pct / 100);
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
      {/* 1. 52-Lineset Counterweight Fly Trim Sliders & Stage Mechanics */}
      <section class="shell-card" aria-label="52-Lineset Counterweight Fly Trim Sliders">
        <div class="shell-card-head">
          <span class="shell-card-title">
            <Icon name="stage" size={15} />
            52-Lineset Counterweight Fly Rig
          </span>
          <button
            type="button"
            class="shell-chip"
            title="Reset all counterweight fly battens to 0.0m Show In-Trim"
            onClick={handleResetAllBattens}
          >
            Reset In-Trim
          </button>
        </div>

        {/* Grand Velour Drape Open/Close Slider */}
        <div class="shell-light is-on">
          <div class="shell-light-body">
            <div class="shell-light-label">
              <span style={{ fontWeight: 600 }}>Grand Velour Curtain (Proscenium)</span>
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

        {/* Counterweight Battens List */}
        <ul class="shell-lights" role="list">
          {DEFAULT_RIGGING_BATTENS.map((b) => {
            const curTrim = sceneCtrl.getBattenTrimHeight(b.lineNumber);
            const fillPct = Math.min(100, Math.max(0, (curTrim / 6.8) * 100));
            return (
              <li key={b.id} class="shell-light is-on">
                <div class="shell-light-body">
                  <div class="shell-light-label">
                    <span>{b.name}</span>
                    <span class="shell-light-pct">
                      {curTrim === 0
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
                    aria-label={`${b.name} trim height`}
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
        <div
          class="shell-card-head"
          style={{
            marginTop: '4px',
            paddingTop: '8px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <span class="shell-panel-eyebrow">Stage Mechanics &amp; Viewport Overlays</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '6px',
          }}
        >
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

        <div class="shell-row" style={{ marginTop: '2px' }}>
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

      {/* 2. Stage & House Lighting Faders */}
      <section class="shell-card" aria-label="Stage and House Lighting Faders">
        <div class="shell-card-head">
          <span class="shell-card-title">
            <Icon name="light" size={15} />
            Stage &amp; House Lighting Faders
          </span>
          <span class="shell-badge">
            {lights.preset.replace('-', ' ').toUpperCase()}
          </span>
        </div>

        <div
          class="shell-seg shell-seg-sm"
          role="group"
          aria-label="Lighting Cue Presets"
          style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          }}
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
                style={{ justifyContent: 'center', padding: '0 6px' }}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <ul class="shell-lights" role="list">
          {LIGHTING_CHANNELS.map((ch) => {
            const pct = Math.round(lights[ch.key] * 100);
            const isOn = pct > 0;
            return (
              <li key={ch.key} class={`shell-light${isOn ? ' is-on' : ''}`}>
                <button
                  type="button"
                  class={`shell-switch${isOn ? ' is-on' : ''}`}
                  role="switch"
                  aria-checked={isOn}
                  aria-label={`Toggle ${ch.label}`}
                  onClick={() =>
                    handleLightingChannel(ch.key, isOn ? 0 : 90)
                  }
                >
                  <span class="shell-switch-knob" />
                </button>
                <div class="shell-light-body">
                  <div class="shell-light-label">
                    <span>{ch.label}</span>
                    <span class="shell-light-pct">{pct}%</span>
                  </div>
                  <input
                    class="shell-range"
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={pct}
                    aria-label={`${ch.label} dimmer level`}
                    style={{ '--fill': `${pct}%` }}
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

      {/* 3. Custom Blocking & Set Piece Spawner */}
      <section class="shell-card" aria-label="Custom Blocking and Set Piece Spawner">
        <div class="shell-card-head">
          <span class="shell-card-title">
            <Icon name="cube" size={15} />
            Custom Blocking &amp; Set Piece Spawner
          </span>
          {spawnedPieces.length > 0 && (
            <button
              type="button"
              class="shell-chip"
              onClick={() => {
                sceneCtrl.clearCustomSetPieces();
                syncStoreFromSceneController(sceneCtrl);
              }}
            >
              Clear All ({spawnedPieces.length})
            </button>
          )}
        </div>

        <div
          class="spawner-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '6px',
          }}
        >
          {CUSTOM_SPAWNER_ITEMS.map((item) => (
            <button
              key={item.kind}
              type="button"
              class="shell-chip spawn-piece-btn"
              style={{
                justifyContent: 'center',
                height: '30px',
                borderRadius: '8px',
                fontWeight: 600,
              }}
              onClick={() => {
                sceneCtrl.addCustomSetPiece(item.kind);
                syncStoreFromSceneController(sceneCtrl);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {spawnedPieces.length > 0 && (
          <div class="shell-chips" style={{ marginTop: '2px' }}>
            {spawnedPieces.map((piece) => {
              const isSelected = selectedPiece?.id === piece.id;
              return (
                <button
                  key={piece.id}
                  type="button"
                  class={`shell-chip${isSelected ? ' is-active active' : ''}`}
                  onClick={() => {
                    sceneCtrl.selectCustomSetPiece(piece.id);
                    syncStoreFromSceneController(sceneCtrl);
                  }}
                >
                  {piece.label}
                </button>
              );
            })}
          </div>
        )}

        {selectedPiece && (
          <div
            class="custom-piece-inspector"
            style={{
              padding: '10px',
              borderRadius: '10px',
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div class="shell-row">
              <strong style={{ fontSize: '12.5px', color: '#62c8ff' }}>
                {selectedPiece.label}
              </strong>
              <button
                type="button"
                class="shell-chip btn-danger"
                onClick={() => {
                  sceneCtrl.deleteSelectedCustomPiece();
                  syncStoreFromSceneController(sceneCtrl);
                }}
              >
                <Icon name="trash" size={12} />
                <span>Delete</span>
              </button>
            </div>

            <div class="shell-light-body">
              <div class="shell-light-label">
                <span>Stage X (Stage Right / Left)</span>
                <span class="shell-light-pct">{selectedPiece.x.toFixed(1)}m</span>
              </div>
              <input
                class="shell-range"
                type="range"
                min={-6.0}
                max={6.0}
                step={0.1}
                value={selectedPiece.x}
                aria-label="Selected piece Stage X position"
                style={{
                  '--fill': `${((selectedPiece.x + 6) / 12) * 100}%`,
                }}
                onInput={(e) => {
                  sceneCtrl.updateSelectedCustomPiece({
                    x: Number(e.currentTarget.value),
                  });
                  syncStoreFromSceneController(sceneCtrl);
                }}
              />
            </div>

            <div class="shell-light-body">
              <div class="shell-light-label">
                <span>Stage Z (Upstage / Downstage)</span>
                <span class="shell-light-pct">{selectedPiece.z.toFixed(1)}m</span>
              </div>
              <input
                class="shell-range"
                type="range"
                min={-8.2}
                max={1.2}
                step={0.1}
                value={selectedPiece.z}
                aria-label="Selected piece Stage Z position"
                style={{
                  '--fill': `${((selectedPiece.z + 8.2) / 9.4) * 100}%`,
                }}
                onInput={(e) => {
                  sceneCtrl.updateSelectedCustomPiece({
                    z: Number(e.currentTarget.value),
                  });
                  syncStoreFromSceneController(sceneCtrl);
                }}
              />
            </div>

            <div class="shell-light-body">
              <div class="shell-light-label">
                <span>Rotation Y (°)</span>
                <span class="shell-light-pct">{selectedPiece.rotationYDeg}°</span>
              </div>
              <input
                class="shell-range"
                type="range"
                min={-180}
                max={180}
                step={5}
                value={selectedPiece.rotationYDeg}
                aria-label="Selected piece Y rotation degrees"
                style={{
                  '--fill': `${((selectedPiece.rotationYDeg + 180) / 360) * 100}%`,
                }}
                onInput={(e) => {
                  sceneCtrl.updateSelectedCustomPiece({
                    rotationYDeg: Number(e.currentTarget.value),
                  });
                  syncStoreFromSceneController(sceneCtrl);
                }}
              />
            </div>
          </div>
        )}
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
          <span class="shell-panel-title shell-panel-title-lg">
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
      <div style={{ padding: '0 12px 8px' }}>
        <div
          class="shell-seg shell-seg-sm"
          role="tablist"
          aria-label="Stage Inspector Sections"
          style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          }}
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
                style={{ justifyContent: 'center', padding: '0 6px' }}
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
