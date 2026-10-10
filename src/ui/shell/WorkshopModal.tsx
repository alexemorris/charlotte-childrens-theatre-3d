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

/**
 * Children's Theatre of Charlotte — Scenic Workshop & CNC Fabrication Inspector Modal.
 *
 * Bound to `workshopTarget.value` in `shell-store.ts`.
 * Inspects any 3D scenic unit on stage, displays its multi-department fabrication
 * breakdown (distinguishing CNC Router & EPS Foam Mill parts from Carpentry/Welding,
 * Soft Goods/Paint Shop, Props, and Cast Blocking), renders an interactive 4'×8'
 * CNC Router sheet nesting preview canvas, and exports true-scale `.DXF`, `.SVG`,
 * `.STL`, and `.CSV` shop files.
 */
export function WorkshopModal(): JSX.Element | null {
  const target = workshopTarget.value;
  const prod = activeProduction.value;
  const [activeSheet, setActiveSheet] = useState<number>(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const analysis: CncElementAnalysis | null = useMemo(() => {
    if (!target) return null;
    return analyzeElementForCncShop(target.element, prod, target.objectGroup);
  }, [target, prod]);

  // Reset sheet index when a new scenic element is opened
  useEffect(() => {
    setActiveSheet(1);
  }, [target?.element.id, prod.id]);

  // Render the 2D Orthographic Elevation + 4'x8' CNC Sheet Nesting preview canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analysis) return;
    renderCncShopPreviewCanvas(canvas, analysis, activeSheet);
  }, [analysis, activeSheet]);

  if (!target || !analysis) return null;

  const close = (): void => {
    workshopTarget.value = null;
  };

  const handleDownloadDxf = (): void => {
    const dxf = generateCncDxfFileContent(analysis);
    const filename = `${analysis.element.id}_cnc_sheets_4x8.dxf`;
    triggerBrowserDownload(filename, dxf, 'application/dxf');
    showToast(`Downloaded ${filename}`);
  };

  const handleDownloadSvg = (): void => {
    const svg = generateCncSvgFileContent(analysis);
    const filename = `${analysis.element.id}_shop_blueprint.svg`;
    triggerBrowserDownload(filename, svg, 'image/svg+xml');
    showToast(`Downloaded ${filename}`);
  };

  const handleDownloadStl = (): void => {
    const stl = generateCncBinaryStlBuffer(target.objectGroup);
    const filename = `${analysis.element.id}_3d_foam_mesh.stl`;
    triggerBrowserDownload(filename, stl, 'model/stl');
    showToast(`Downloaded ${filename}`);
  };

  const handleDownloadCsv = (): void => {
    const csv = generateCncCutListCsvContent(analysis);
    const filename = `${analysis.element.id}_shop_cutlist_bom.csv`;
    triggerBrowserDownload(filename, csv, 'text/csv;charset=utf-8');
    showToast(`Downloaded ${filename}`);
  };

  const sheetNumbers: number[] = [];
  if (analysis.requiresCncRouting && analysis.sheetCount4x8 > 0) {
    for (let s = 1; s <= analysis.sheetCount4x8; s++) {
      sheetNumbers.push(s);
    }
  }

  return (
    <div class="shell-modal-backdrop workshop-modal-backdrop" onClick={close}>
      <div
        class="shell-modal shell-glass workshop-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="workshop-element-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header class="shell-modal-head workshop-modal-header">
          <div class="workshop-header-title-wrap">
            <span
              id="workshop-method-badge"
              class={`workshop-method-badge ref-lightbox-badge method-${analysis.fabricationMethod}`}
            >
              {analysis.fabricationBadgeLabel}
            </span>
            <h2 id="workshop-element-title" class="workshop-element-title">
              {analysis.element.name} <span class="workshop-prod-sub">({analysis.productionTitle})</span>
            </h2>
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

        <div class="shell-modal-body workshop-modal-body">
          {/* Top 2-Column Summary: Footprint & Multi-Department Breakdown */}
          <div class="workshop-summary-grid">
            <div class="workshop-spec-card">
              <div class="workshop-card-kicker">OVERALL STAGE FOOTPRINT &amp; CONSTRUCTION</div>
              <div id="workshop-overall-dims" class="workshop-dims-headline">
                {analysis.overallImperialLabel}
                <span class="workshop-dims-metric">
                  {' '}
                  · ({analysis.overallWidthM}m × {analysis.overallHeightM}m × {analysis.overallDepthM}m)
                </span>
              </div>
              <p id="workshop-construction-note" class="workshop-construction-note">
                {analysis.primaryConstructionNote}
              </p>
              <div id="workshop-metrics-pills" class="workshop-metrics-pills">
                {analysis.requiresCncRouting && analysis.sheetCount4x8 > 0 ? (
                  <>
                    <span class="workshop-pill is-cnc">
                      <strong>{analysis.sheetCount4x8}</strong> × 4&apos;×8&apos; CNC Sheets
                    </span>
                    <span class="workshop-pill is-cnc">
                      <strong>{analysis.cncParts.length}</strong> CNC-Routed Parts
                    </span>
                    <span class="workshop-pill">
                      <strong>{analysis.nonCncParts.length}</strong> Traditional Shop Parts
                    </span>
                    <span class="workshop-pill">
                      Est. CNC Cut:{' '}
                      <strong>
                        {analysis.estimatedCutLengthM}m (~{analysis.estimatedRouterMinutes} min)
                      </strong>
                    </span>
                    {analysis.excludedBlockingFiguresCount > 0 && (
                      <span class="workshop-pill is-muted">
                        <strong>{analysis.excludedBlockingFiguresCount}</strong> Excluded Cast Blocking Figure(s)
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span class="workshop-pill is-non-cnc">
                      <strong>0</strong> 4&apos;×8&apos; CNC Sheets Required
                    </span>
                    <span class="workshop-pill">
                      <strong>0</strong> CNC-Routed Parts
                    </span>
                    <span class="workshop-pill">
                      <strong>{analysis.nonCncParts.length}</strong> Traditional Shop Parts
                    </span>
                    {analysis.excludedBlockingFiguresCount > 0 && (
                      <span class="workshop-pill is-muted">
                        <strong>{analysis.excludedBlockingFiguresCount}</strong> Excluded Cast Blocking Figure(s)
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            <div class="workshop-spec-card">
              <div class="workshop-card-kicker">THEATRE WORKSHOP DEPARTMENT BREAKDOWN</div>
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
          </div>

          {/* Interactive 2D Orthographic Elevation + 4'x8' CNC Router Sheet Nesting Canvas */}
          <div class="workshop-canvas-section">
            <div class="workshop-canvas-toolbar">
              <span class="workshop-card-kicker">
                SHOP ELEVATION &amp; 4&apos;×8&apos; (1219×2438mm) CNC ROUTER SHEET NESTING
              </span>
              <div id="workshop-sheet-tabs" class="workshop-sheet-tabs">
                {sheetNumbers.length > 0 ? (
                  sheetNumbers.map((s) => (
                    <button
                      key={s}
                      type="button"
                      class={`workshop-sheet-btn${s === activeSheet ? ' active is-active' : ''}`}
                      onClick={() => setActiveSheet(s)}
                    >
                      4&apos;×8&apos; Sheet #{s}
                    </button>
                  ))
                ) : (
                  <span class="workshop-no-cnc-tag">
                    Non-CNC Department Workflow (No 4&apos;×8&apos; Router Nesting Required)
                  </span>
                )}
              </div>
            </div>
            <div class="workshop-canvas-wrap">
              <canvas
                ref={canvasRef}
                id="workshop-preview-canvas"
                width={980}
                height={340}
                class="workshop-preview-canvas"
              />
            </div>
          </div>

          {/* Download Fabrication & Shop Files Bar */}
          <div class="workshop-downloads-bar">
            <div class="workshop-downloads-label">
              <strong>DOWNLOAD WORKSHOP &amp; CNC FILES</strong>
              <span id="workshop-downloads-sub">
                True-scale metric (mm) &amp; imperial shop files generated directly from 3D stage geometry
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
                  {analysis.requiresCncRouting ? "CNC Router 4'×8' (.DXF)" : 'Ortho Elevation (.DXF)'}
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
                <span>Shop Vector (.SVG)</span>
              </button>
              <button
                id="workshop-dl-stl-btn"
                type="button"
                class="workshop-dl-btn"
                title="Download binary 3D .STL mesh for 3-axis/5-axis EPS foam carving or 1:24 model 3D printing"
                onClick={handleDownloadStl}
              >
                <Icon name="download" size={14} />
                <span>3D Foam / Model (.STL)</span>
              </button>
              <button
                id="workshop-dl-csv-btn"
                type="button"
                class="workshop-dl-btn"
                title="Download complete multi-department Cut-List & Bill of Materials (.CSV)"
                onClick={handleDownloadCsv}
              >
                <Icon name="download" size={14} />
                <span>Cut-List BOM (.CSV)</span>
              </button>
            </div>
          </div>

          {/* Scrollable Component Cut-List & Material Schedule Table */}
          <div class="workshop-cutlist-section">
            <div class="workshop-cutlist-head">
              <span class="workshop-card-kicker" id="workshop-cutlist-header">
                COMPONENT CUT-LIST &amp; MATERIAL SCHEDULE ({analysis.allParts.length} ITEMS)
              </span>
              <span class="workshop-cutlist-legend">
                <span class="part-code-badge is-cnc">CNC-xx</span> 4&apos;×8&apos; CNC Router / Foam Mill
                <span class="workshop-legend-sep">·</span>
                <span class="part-code-badge is-shp">SHP-xx</span> Carpentry / Soft Goods / Rigging / Props
              </span>
            </div>
            <div class="workshop-table-scroll">
              <table class="workshop-cutlist-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Component</th>
                    <th>Fabrication Process</th>
                    <th>4&apos;×8&apos; Sheet</th>
                    <th>Imperial Size</th>
                    <th>Metric (mm)</th>
                    <th>Material &amp; Shop Specification</th>
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
                          if (isCnc && part.sheetIndex !== activeSheet) {
                            setActiveSheet(part.sheetIndex);
                          }
                        }}
                      >
                        <td>
                          <span class={`part-code-badge ${isCnc ? 'is-cnc' : 'is-shp'}`}>{part.partCode}</span>
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
        </div>
      </div>
    </div>
  );
}
