import type { JSX } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import {
  analyzeElementForCncShop,
  type CncElementAnalysis,
  generateCncBinaryStlBuffer,
  generateCncCutListCsvContent,
  generateCncDxfFileContent,
  generateCncSvgFileContent,
  renderCncShopPreviewCanvas,
  triggerBrowserDownload,
} from '../../engine/cnc-shop-exporter.ts';
import { activeProduction, showToast, workshopTarget } from '../../state/shell-store.ts';
import { Icon } from './icons.tsx';

type WorkshopModalSectionTab = 'blueprint' | 'cutlist' | 'departments';

/**
 * Children's Theatre of Charlotte — Granular Scenic Workshop & CNC Fabrication Inspector Modal.
 *
 * Decomposes multi-piece scenic elements into individual physical stage sub-units
 * (e.g. DSR Pink House #1, USR Coral House #2, MSL Rose House #3; or Line #9 Gable Wall
 * vs DSR Kitchen Wagon vs DSL Daybed) and presents a clean, tabbed inspector with
 * single-focus 4'×8' CNC sheet nesting, orthographic elevation, cut-list, and shop departments.
 */
export function WorkshopModal(): JSX.Element | null {
  const target = workshopTarget.value;
  const prod = activeProduction.value;

  const [selectedSubUnitId, setSelectedSubUnitId] = useState<string | null>(
    target?.subUnitId ?? null
  );
  const [activeTab, setActiveTab] = useState<WorkshopModalSectionTab>('blueprint');
  const [canvasMode, setCanvasMode] = useState<'sheet' | 'elevation'>('sheet');
  const [activeSheet, setActiveSheet] = useState<number>(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sync sub-unit selection when a new scenic target is clicked on stage or in the sidebar
  useEffect(() => {
    setSelectedSubUnitId(target?.subUnitId ?? null);
    setActiveTab('blueprint');
    setActiveSheet(1);
    setCanvasMode('sheet');
  }, [target?.element.id, target?.subUnitId, prod.id]);

  const analysis: CncElementAnalysis | null = useMemo(() => {
    if (!target) return null;
    return analyzeElementForCncShop(
      target.element,
      prod,
      target.objectGroup,
      selectedSubUnitId
    );
  }, [target, prod, selectedSubUnitId]);

  // Reset active sheet when switching sub-units
  useEffect(() => {
    setActiveSheet(1);
    if (analysis && (!analysis.requiresCncRouting || analysis.sheetCount4x8 === 0)) {
      setCanvasMode('elevation');
    } else {
      setCanvasMode('sheet');
    }
  }, [analysis?.activeSubUnit?.id, analysis?.requiresCncRouting, analysis?.sheetCount4x8]);

  // Render the single-focus 4'x8' CNC Sheet OR Front Orthographic Elevation canvas
  useEffect(() => {
    if (activeTab !== 'blueprint') return;
    const canvas = canvasRef.current;
    if (!canvas || !analysis) return;
    renderCncShopPreviewCanvas(canvas, analysis, activeSheet, canvasMode);
  }, [analysis, activeSheet, canvasMode, activeTab]);

  if (!target || !analysis) return null;

  const close = (): void => {
    workshopTarget.value = null;
  };

  const handleDownloadDxf = (): void => {
    const dxf = generateCncDxfFileContent(analysis);
    const filename = `${analysis.exportSlug}_cnc_sheets_4x8.dxf`;
    triggerBrowserDownload(filename, dxf, 'application/dxf');
    showToast(`Downloaded ${filename}`);
  };

  const handleDownloadSvg = (): void => {
    const svg = generateCncSvgFileContent(analysis);
    const filename = `${analysis.exportSlug}_shop_blueprint.svg`;
    triggerBrowserDownload(filename, svg, 'image/svg+xml');
    showToast(`Downloaded ${filename}`);
  };

  const handleDownloadStl = (): void => {
    const stl = generateCncBinaryStlBuffer(target.objectGroup, analysis.activeSubUnit);
    const filename = `${analysis.exportSlug}_3d_foam_mesh.stl`;
    triggerBrowserDownload(filename, stl, 'model/stl');
    showToast(`Downloaded ${filename}`);
  };

  const handleDownloadCsv = (): void => {
    const csv = generateCncCutListCsvContent(analysis);
    const filename = `${analysis.exportSlug}_shop_cutlist_bom.csv`;
    triggerBrowserDownload(filename, csv, 'text/csv;charset=utf-8');
    showToast(`Downloaded ${filename}`);
  };

  const sheetNumbers: number[] = [];
  if (analysis.requiresCncRouting && analysis.sheetCount4x8 > 0) {
    for (let s = 1; s <= analysis.sheetCount4x8; s++) {
      sheetNumbers.push(s);
    }
  }

  const activeSubId = analysis.activeSubUnit?.id ?? null;

  return (
    <div class="shell-modal-backdrop workshop-modal-backdrop" onClick={close}>
      <div
        class="shell-modal shell-glass workshop-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="workshop-element-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Compact Header */}
        <header class="shell-modal-head workshop-modal-header">
          <div class="workshop-header-title-wrap">
            <span
              id="workshop-method-badge"
              class={`workshop-method-badge ref-lightbox-badge method-${analysis.fabricationMethod}`}
            >
              {analysis.fabricationBadgeLabel}
            </span>
            <div class="workshop-title-stack">
              <h2 id="workshop-element-title" class="workshop-element-title">
                {analysis.displayTitle}
              </h2>
              <span class="workshop-prod-sub">
                {analysis.activeSubUnit && !analysis.activeSubUnit.isCombinedMacroUnit
                  ? `${analysis.element.name} · ${analysis.productionTitle}`
                  : analysis.productionTitle}
              </span>
            </div>
          </div>
          <div class="workshop-header-actions">
            <button
              id="workshop-close-btn"
              type="button"
              class="shell-icon-btn"
              aria-label="Close Scenic Workshop modal"
              title="Close (Esc)"
              onClick={close}
            >
              <Icon name="close" size={18} />
            </button>
          </div>
        </header>

        {/* 2. Granular Sub-Unit Pill Selector Bar (when element has multiple physical sub-units) */}
        {analysis.subUnits.length > 0 && (
          <div class="workshop-subunits-bar" role="tablist" aria-label="Scenic Sub-Units">
            <span class="workshop-subunits-label">SELECT PIECE:</span>
            <div class="workshop-subunits-pills">
              {analysis.subUnits.map((unit) => {
                const isSelected = unit.id === activeSubId;
                return (
                  <button
                    key={unit.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    class={`workshop-subunit-pill${isSelected ? ' is-active' : ''}${
                      unit.isCombinedMacroUnit ? ' is-macro' : ''
                    }`}
                    title={unit.description}
                    onClick={() => setSelectedSubUnitId(unit.id)}
                  >
                    {unit.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div class="shell-modal-body workshop-modal-body">
          {/* 3. Compact 4-Stat Metric Strip */}
          <div class="workshop-stat-strip" id="workshop-metrics-pills">
            <div class="workshop-stat-box">
              <span class="workshop-stat-kicker">UNIT FOOTPRINT</span>
              <strong id="workshop-overall-dims" class="workshop-stat-val is-accent">
                {analysis.overallImperialLabel}
              </strong>
              <span class="workshop-stat-sub">
                {analysis.overallWidthM}m W × {analysis.overallHeightM}m H × {analysis.overallDepthM}m D
              </span>
            </div>

            <div class="workshop-stat-box">
              <span class="workshop-stat-kicker">4&apos;×8&apos; CNC SHEETS</span>
              <strong
                class={`workshop-stat-val ${
                  analysis.requiresCncRouting && analysis.sheetCount4x8 > 0
                    ? 'is-cnc'
                    : 'is-muted'
                }`}
              >
                {analysis.requiresCncRouting && analysis.sheetCount4x8 > 0
                  ? `${analysis.sheetCount4x8} × 4'×8' Sheet${analysis.sheetCount4x8 === 1 ? '' : 's'}`
                  : '0 Sheets (Non-CNC)'}
              </strong>
              <span class="workshop-stat-sub">
                {analysis.requiresCncRouting
                  ? '1219 × 2438 mm Baltic Birch / Foam'
                  : 'Built in Traditional Shop'}
              </span>
            </div>

            <div class="workshop-stat-box">
              <span class="workshop-stat-kicker">PARTS BREAKDOWN</span>
              <strong class="workshop-stat-val">
                {analysis.cncParts.length} CNC · {analysis.nonCncParts.length} Shop
              </strong>
              <span class="workshop-stat-sub">
                {analysis.allParts.length} total component{analysis.allParts.length === 1 ? '' : 's'} in unit
              </span>
            </div>

            <div class="workshop-stat-box">
              <span class="workshop-stat-kicker">EST. ROUTER TIME</span>
              <strong class="workshop-stat-val">
                {analysis.requiresCncRouting && analysis.sheetCount4x8 > 0
                  ? `~${analysis.estimatedRouterMinutes} min`
                  : 'No Router Time'}
              </strong>
              <span class="workshop-stat-sub">
                {analysis.requiresCncRouting && analysis.sheetCount4x8 > 0
                  ? `${analysis.estimatedCutLengthM}m toolpath perimeter`
                  : analysis.departmentBreakdown[0]?.department ?? 'Traditional Shop'}
              </span>
            </div>
          </div>

          {/* 4. Clean 3-Tab View Switcher */}
          <div class="workshop-view-tabs-row">
            <div class="shell-seg" role="tablist" aria-label="Workshop Inspector Sections">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'blueprint'}
                class={`shell-seg-btn${activeTab === 'blueprint' ? ' is-active' : ''}`}
                onClick={() => setActiveTab('blueprint')}
              >
                <Icon name="cnc" size={13} />
                <span>
                  {analysis.requiresCncRouting && analysis.sheetCount4x8 > 0
                    ? 'CNC Sheet & Blueprint'
                    : 'Ortho Blueprint'}
                </span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'cutlist'}
                class={`shell-seg-btn${activeTab === 'cutlist' ? ' is-active' : ''}`}
                onClick={() => setActiveTab('cutlist')}
              >
                <span>Parts Cut-List ({analysis.allParts.length})</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'departments'}
                class={`shell-seg-btn${activeTab === 'departments' ? ' is-active' : ''}`}
                onClick={() => setActiveTab('departments')}
              >
                <span>Shop Notes &amp; Depts ({analysis.departmentBreakdown.length})</span>
              </button>
            </div>

            {activeTab === 'blueprint' && (
              <div id="workshop-sheet-tabs" class="workshop-sheet-tabs">
                {sheetNumbers.map((s) => (
                  <button
                    key={s}
                    type="button"
                    class={`workshop-sheet-btn${
                      canvasMode === 'sheet' && s === activeSheet ? ' active is-active' : ''
                    }`}
                    onClick={() => {
                      setCanvasMode('sheet');
                      setActiveSheet(s);
                    }}
                  >
                    4&apos;×8&apos; Sheet #{s}
                  </button>
                ))}
                <button
                  type="button"
                  class={`workshop-sheet-btn${
                    canvasMode === 'elevation' ? ' active is-active' : ''
                  }`}
                  onClick={() => setCanvasMode('elevation')}
                >
                  Ortho Elevation
                </button>
              </div>
            )}
          </div>

          {/* TAB 1: Single-Focus CNC Sheet / Blueprint Canvas */}
          {activeTab === 'blueprint' && (
            <div class="workshop-canvas-section">
              <div class="workshop-canvas-wrap">
                <canvas
                  ref={canvasRef}
                  id="workshop-preview-canvas"
                  width={940}
                  height={330}
                  class="workshop-preview-canvas"
                />
              </div>
              <p id="workshop-construction-note" class="workshop-construction-note-compact">
                <strong>Shop Spec:</strong> {analysis.primaryConstructionNote}
              </p>
            </div>
          )}

          {/* TAB 2: Focused Component Cut-List & Material Schedule */}
          {activeTab === 'cutlist' && (
            <div class="workshop-cutlist-section">
              <div class="workshop-cutlist-head">
                <span class="workshop-card-kicker" id="workshop-cutlist-header">
                  {analysis.displayTitle.toUpperCase()} · CUT-LIST ({analysis.allParts.length} ITEMS)
                </span>
                <span class="workshop-cutlist-legend">
                  <span class="part-code-badge is-cnc">CNC-xx</span> Click row to view 4&apos;×8&apos; Sheet
                  <span class="workshop-legend-sep">·</span>
                  <span class="part-code-badge is-shp">SHP-xx</span> Traditional Shop
                </span>
              </div>
              <div class="workshop-table-scroll is-expanded">
                <table class="workshop-cutlist-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Component</th>
                      <th>Process</th>
                      <th>4&apos;×8&apos; Sheet</th>
                      <th>Imperial Size</th>
                      <th>Metric (mm)</th>
                      <th>Material Specification</th>
                    </tr>
                  </thead>
                  <tbody id="workshop-cutlist-tbody">
                    {analysis.allParts.map((part) => {
                      const isCnc = part.sheetIndex > 0;
                      const cleanLabel = part.label.replace(/^[^·]+·\s*/, '');
                      return (
                        <tr
                          key={part.partCode}
                          class={isCnc ? 'row-is-cnc' : 'row-is-traditional'}
                          onClick={() => {
                            if (isCnc) {
                              setActiveSheet(part.sheetIndex);
                              setCanvasMode('sheet');
                              setActiveTab('blueprint');
                            }
                          }}
                        >
                          <td>
                            <span class={`part-code-badge ${isCnc ? 'is-cnc' : 'is-shp'}`}>
                              {part.partCode}
                            </span>
                          </td>
                          <td class="cell-component-name">{cleanLabel}</td>
                          <td>{part.fabricationProcess}</td>
                          <td>
                            {isCnc ? (
                              <span class="sheet-ref-pill">Sheet #{part.sheetIndex}</span>
                            ) : (
                              <span class="muted-cell">Non-CNC</span>
                            )}
                          </td>
                          <td class="cell-mono">
                            {part.widthInches}&quot; × {part.heightInches}&quot; × {part.thicknessInches}&quot;
                          </td>
                          <td class="cell-mono">
                            {part.widthMm} × {part.heightMm} × {part.thicknessMm} mm
                          </td>
                          <td>{part.materialSpec}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Construction Notes & Theatre Workshop Department Breakdown */}
          {activeTab === 'departments' && (
            <div class="workshop-spec-card">
              <div class="workshop-card-kicker">
                CONSTRUCTION SPECIFICATION &amp; SHOP DEPARTMENTS
              </div>
              <p class="workshop-construction-note">{analysis.primaryConstructionNote}</p>
              <div id="workshop-departments-list" class="workshop-departments-list">
                {analysis.departmentBreakdown.map((dept) => {
                  const roleSlug = dept.roleBadge.toLowerCase().replace(/[^a-z]+/g, '-');
                  return (
                    <div key={dept.department} class="workshop-dept-row">
                      <div class="workshop-dept-head">
                        <span class="workshop-dept-name">{dept.department}</span>
                        <span class={`workshop-dept-badge role-${roleSlug}`}>{dept.roleBadge}</span>
                      </div>
                      <div class="workshop-dept-scope">{dept.scopeSummary}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. Scoped Download Fabrication & Shop Files Bar */}
          <div class="workshop-downloads-bar">
            <div class="workshop-downloads-label">
              <strong>
                EXPORT FILES ·{' '}
                {(analysis.activeSubUnit?.shortLabel ?? analysis.element.name).toUpperCase()}
              </strong>
              <span id="workshop-downloads-sub">
                True-scale metric (mm) &amp; imperial CAD/CAM files for this unit
              </span>
            </div>
            <div class="workshop-download-btns">
              <button
                id="workshop-dl-dxf-btn"
                type="button"
                class="workshop-dl-btn is-primary"
                title="Download AutoCAD R12/2000 .DXF with 4'x8' CNC router sheets and front orthographic elevation"
                onClick={handleDownloadDxf}
              >
                <Icon name="download" size={14} />
                <span>
                  {analysis.requiresCncRouting ? "CNC 4'×8' (.DXF)" : 'Elevation (.DXF)'}
                </span>
              </button>
              <button
                id="workshop-dl-svg-btn"
                type="button"
                class="workshop-dl-btn"
                title="Download true-scale vector .SVG nesting layout & shop blueprint"
                onClick={handleDownloadSvg}
              >
                <Icon name="download" size={14} />
                <span>Blueprint (.SVG)</span>
              </button>
              <button
                id="workshop-dl-stl-btn"
                type="button"
                class="workshop-dl-btn"
                title="Download binary 3D .STL mesh for 3-axis/5-axis EPS foam carving or 1:24 model 3D printing"
                onClick={handleDownloadStl}
              >
                <Icon name="download" size={14} />
                <span>3D Mesh (.STL)</span>
              </button>
              <button
                id="workshop-dl-csv-btn"
                type="button"
                class="workshop-dl-btn"
                title="Download multi-department Cut-List & Bill of Materials (.CSV)"
                onClick={handleDownloadCsv}
              >
                <Icon name="download" size={14} />
                <span>Cut-List (.CSV)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
