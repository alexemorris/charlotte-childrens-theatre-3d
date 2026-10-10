import type { JSX } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import {
  activeProduction,
  chartColorMode,
  eyeMode,
  inSeatView,
  isMobile,
  lightboxMedia,
  navigatorOpen,
  selectedSeatMetrics,
  sightlineLaserEnabled,
  syncStoreFromSceneController,
} from '../../state/shell-store.ts';
import type {
  AudienceEyeMode,
  ChartColorMode,
  SeatRecord,
  SightlineGrade,
} from '../../types/theatre.ts';
import { InteractiveSeatingChart } from '../seating-chart-svg.ts';
import { Icon } from './icons.tsx';
import { useShell } from './shell-context.ts';

interface QuickTestSeatPreset {
  readonly seatId: string;
  readonly label: string;
  readonly sublabel: string;
  readonly description: string;
}

const QUICK_TEST_SEATS: ReadonlyArray<QuickTestSeatPreset> = [
  {
    seatId: 'MF-C-A-101',
    label: 'Row A Front',
    sublabel: 'A-101',
    description: 'Row A Front Center — Steep upward angle & shallow floor grazing check',
  },
  {
    seatId: 'MF-C-G-108',
    label: "Director's G-108",
    sublabel: 'Center Orch',
    description: "Row G Center Orchestra — Director's Table reference sightline",
  },
  {
    seatId: 'MF-L-C-1',
    label: 'Left Wing C-1',
    sublabel: 'House Left',
    description: 'Extreme House Left Wing — Check Stage Right masking leg & portal reveal',
  },
  {
    seatId: 'MF-R-C-207',
    label: 'Right Wing C-207',
    sublabel: 'House Right',
    description: 'Extreme House Right Wing — Check Stage Left masking & portal sightline',
  },
  {
    seatId: 'MF-C-N-112',
    label: 'Under Balc N-112',
    sublabel: 'Row N Soffit',
    description: 'Row N Under Lower Balcony Overhang — Check vertical trim cutoff at upstage drop',
  },
  {
    seatId: 'UB-L-UB-14',
    label: 'Upper Balc UB-14',
    sublabel: 'Upper Tier',
    description: 'Upper Balcony Row UB — Steep downward rake onto painted stage floor cloth',
  },
];

interface VenueReferencePhoto {
  readonly badge: string;
  readonly label: string;
  readonly title: string;
  readonly imgUrl: string;
}

const VENUE_REFERENCE_PHOTOS: ReadonlyArray<VenueReferencePhoto> = [
  {
    badge: 'GRINCH · MODEL BOX 1B',
    label: 'Grinch (Whoville 1B)',
    title: 'How The Grinch Stole Christmas — Whoville Model Box (Scene 1B)',
    imgUrl: 'reference/grinch/model_1B_whoville.jpg',
  },
  {
    badge: 'CAD GROUND PLAN · 1/4" = 1\'-0"',
    label: 'McColl 1/4" CAD Plan',
    title: 'Hugh McColl Family Theatre — 1/4" = 1\'-0" CAD Ground Plan',
    imgUrl: 'reference/grinch/plan_1B_whoville.jpg',
  },
  {
    badge: 'PRODUCTION SET · SCHOOL OF ROCK',
    label: 'School of Rock Set',
    title: 'School of Rock — Battle of the Bands Concert Set at McColl Theatre',
    imgUrl: 'reference/school_of_rock_concert.jpg',
  },
  {
    badge: 'PROSCENIUM ARCH & FRIEZE',
    label: 'Proscenium & Alice',
    title: 'McColl Proscenium Storyboard Frieze & Alice in Wonderland Set',
    imgUrl: 'reference/stage_proscenium_alice.jpg',
  },
  {
    badge: 'AUDITORIUM HOUSE VIEW',
    label: '533-Seat House',
    title: 'McColl Family Theatre Auditorium & Twin Balconies from Stage',
    imgUrl: 'reference/house_from_stage.jpg',
  },
  {
    badge: 'OFFICIAL SEATING CHART',
    label: 'Seating Chart',
    title: 'Children\'s Theatre of Charlotte — McColl Family Theatre Seating Chart',
    imgUrl: 'reference/seating_chart.png',
  },
];

function formatSightlineGradeLabel(grade: SightlineGrade): string {
  switch (grade) {
    case 'optimal':
      return 'OPTIMAL';
    case 'good':
      return 'GOOD';
    case 'partial-overhang':
      return 'OVERHANG TRIM';
    case 'extreme-side':
      return 'SIDE ANGLE';
  }
}

export function SeatingNavigator(): JSX.Element {
  const sceneCtrl = useShell();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<InteractiveSeatingChart | null>(null);
  const [hoveredChartSeat, setHoveredChartSeat] = useState<SeatRecord | null>(null);
  const [venueSpecsOpen, setVenueSpecsOpen] = useState<boolean>(false);

  const open = navigatorOpen.value;
  const mobile = isMobile.value;
  const currentEyeMode = eyeMode.value;
  const currentColorMode = chartColorMode.value;
  const metrics = selectedSeatMetrics.value;
  const seated = inSeatView.value;
  const lasersOn = sightlineLaserEnabled.value;
  const currentProd = activeProduction.value;
  const selectedSeatId = metrics?.seat.id ?? null;

  // Mount InteractiveSeatingChart once into the container ref
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const chart = new InteractiveSeatingChart(container, sceneCtrl.seats, {
      onSelectSeat: (seatId: string) => {
        sceneCtrl.selectSeatById(seatId, true);
        syncStoreFromSceneController(sceneCtrl);
      },
      onHoverSeat: (seat: SeatRecord | null) => {
        setHoveredChartSeat(seat);
      },
    });

    chartInstanceRef.current = chart;
    chart.setSelectedSeatId(selectedSeatMetrics.value?.seat.id ?? null);
    chart.updateModeAndGrades(
      chartColorMode.value,
      sceneCtrl.getAllSeatSightlineGrades()
    );

    return () => {
      chartInstanceRef.current = null;
      container.innerHTML = '';
    };
  }, [sceneCtrl]);

  // Keep selected seat, color mode, and sightline heatmap grades reactive
  useEffect(() => {
    const chart = chartInstanceRef.current;
    if (!chart) return;
    chart.setSelectedSeatId(selectedSeatId);
    chart.updateModeAndGrades(
      currentColorMode,
      sceneCtrl.getAllSeatSightlineGrades()
    );
  }, [selectedSeatId, currentColorMode, currentEyeMode, currentProd.id, sceneCtrl]);

  const handleEyeModeChange = (mode: AudienceEyeMode): void => {
    sceneCtrl.setEyeMode(mode);
    syncStoreFromSceneController(sceneCtrl);
  };

  const handleColorModeChange = (mode: ChartColorMode): void => {
    sceneCtrl.setChartColorMode(mode);
    syncStoreFromSceneController(sceneCtrl);
  };

  const handleQuickSeatSelect = (seatId: string): void => {
    sceneCtrl.selectSeatById(seatId, true);
    syncStoreFromSceneController(sceneCtrl);
  };

  const handleToggleLasers = (): void => {
    sceneCtrl.setSightlineLaserEnabled(!lasersOn);
    syncStoreFromSceneController(sceneCtrl);
  };

  const VISIBILITY_BARS: ReadonlyArray<{
    readonly label: string;
    readonly pct: number;
  }> = metrics
    ? [
        { label: 'Downstage Apron', pct: metrics.downstageVisibilityPct },
        { label: 'Center Stage', pct: metrics.centerStageVisibilityPct },
        { label: 'Upstage / Wings', pct: metrics.upstageVisibilityPct },
        { label: 'Upper Fly Loft', pct: metrics.flyGridVisibilityPct },
      ]
    : [];

  return (
    <aside
      class={`shell-navigator shell-nav shell-glass${open ? ' is-open' : ''}${
        mobile ? ' is-drawer' : ''
      }`}
      aria-label="533-Seat Sightline Navigator"
      aria-hidden={!open}
    >
      {/* 1. Drawer Header */}
      <div class="shell-panel-head">
        <div class="shell-panel-heading">
          <span class="shell-panel-title">
            <Icon name="seat" size={15} />
            533-Seat Auditorium
          </span>
          <span class="shell-panel-eyebrow">
            {hoveredChartSeat
              ? `${hoveredChartSeat.sectionTitle} · Row ${hoveredChartSeat.rowLabel} · #${hoveredChartSeat.seatNumber}`
              : '398 Main · 68 Lower · 67 Upper'}
          </span>
        </div>
        <button
          type="button"
          class="shell-icon-btn shell-icon-btn-sm"
          aria-label="Close 533-Seat Sightline Navigator"
          title="Hide 533-Seat Sightline Navigator"
          onClick={() => {
            navigatorOpen.value = false;
          }}
        >
          <Icon name="close" size={16} />
        </button>
      </div>

      <div class="shell-nav-scroll shell-panel-scroll">
        {/* 2. Compact Sightline Profile & Color Mode Row */}
        <section class="shell-card">
          <div class="shell-card-head">
            <span class="shell-card-title">
              <Icon name="eye" size={14} />
              Sightline Profile
            </span>
            <span class="shell-badge">
              {currentEyeMode === 'child' ? '0.96m Child' : '1.18m Adult'}
            </span>
          </div>

          <div
            class="shell-seg shell-seg-sm"
            role="group"
            aria-label="Audience Seated Eye Height"
            style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr' }}
          >
            <button
              type="button"
              class={`shell-seg-btn${currentEyeMode === 'child' ? ' is-active' : ''}`}
              aria-pressed={currentEyeMode === 'child'}
              title="Child Seated Eye Height (0.96m above stadium riser — Ages 5–10)"
              onClick={() => handleEyeModeChange('child')}
              style={{ justifyContent: 'center' }}
            >
              Child Eye (0.96m)
            </button>
            <button
              type="button"
              class={`shell-seg-btn${currentEyeMode === 'adult' ? ' is-active' : ''}`}
              aria-pressed={currentEyeMode === 'adult'}
              title="Adult Seated Eye Height (1.18m above stadium riser)"
              onClick={() => handleEyeModeChange('adult')}
              style={{ justifyContent: 'center' }}
            >
              Adult Eye (1.18m)
            </button>
          </div>

          <div
            class="shell-seg shell-seg-sm"
            role="group"
            aria-label="Seating Chart Color Mode"
            style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr' }}
          >
            <button
              type="button"
              class={`shell-seg-btn${currentColorMode === 'section' ? ' is-active' : ''}`}
              aria-pressed={currentColorMode === 'section'}
              title="Color seats by Main Floor, Lower Balcony, and Upper Balcony sections"
              onClick={() => handleColorModeChange('section')}
              style={{ justifyContent: 'center' }}
            >
              Venue Sections
            </button>
            <button
              type="button"
              class={`shell-seg-btn${currentColorMode === 'sightline-heatmap' ? ' is-active' : ''}`}
              aria-pressed={currentColorMode === 'sightline-heatmap'}
              title="Color all seats in 2D and 3D by real-time Sightline Score & Balcony Overhang Clearance"
              onClick={() => handleColorModeChange('sightline-heatmap')}
              style={{ justifyContent: 'center' }}
            >
              Sightline Heatmap
            </button>
          </div>
        </section>

        {/* 3. Interactive 2D SVG Seating Chart */}
        <section class="shell-card">
          <div class="shell-card-head">
            <span class="shell-card-title">
              <Icon name="plan" size={14} />
              2D Seating Plan
            </span>
            <span class="shell-muted">Click any seat</span>
          </div>

          <div
            ref={chartContainerRef}
            class="seating-chart-mount"
            aria-label="Interactive 2D Auditorium Seating Map"
          />

          {/* 4. Quick Sightline Test Seats (2x3 chip grid) */}
          <div class="shell-card-head" style={{ marginTop: '4px' }}>
            <span class="shell-panel-eyebrow">Quick Sightline Test Seats</span>
          </div>
          <div
            class="quick-seat-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '6px',
            }}
          >
            {QUICK_TEST_SEATS.map((preset) => {
              const isSelected = selectedSeatId === preset.seatId;
              return (
                <button
                  key={preset.seatId}
                  type="button"
                  class={`shell-chip quick-seat-btn${isSelected ? ' is-active active' : ''}`}
                  title={preset.description}
                  onClick={() => handleQuickSeatSelect(preset.seatId)}
                  style={{
                    justifyContent: 'space-between',
                    width: '100%',
                    height: 'auto',
                    padding: '6px 9px',
                    borderRadius: '8px',
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '11.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 5. Selected Seat Sightline Report Card */}
        <section class="shell-card">
          <div class="shell-card-head">
            <span class="shell-card-title">
              <Icon name="target" size={14} />
              Sightline Report
            </span>
            <button
              type="button"
              class={`shell-chip${lasersOn ? ' is-active active' : ''}`}
              title="Toggle 3D Sightline Laser Rays from selected seat eye to stage targets (Shortcut: L)"
              onClick={handleToggleLasers}
            >
              <Icon name="laser" size={12} />
              <span>{lasersOn ? 'Lasers ON' : '3D Lasers'}</span>
            </button>
          </div>

          {!metrics ? (
            <div class="seat-telemetry-card telemetry-empty">
              <p style={{ marginBottom: '10px' }}>
                Select any seat in the <strong>3D auditorium</strong> or on the{' '}
                <strong>2D seating chart</strong> above to inspect its 1st-person stage view
                and vertical fly-loft clearance.
              </p>
              <button
                type="button"
                class="shell-btn shell-btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => handleQuickSeatSelect('MF-C-G-108')}
              >
                <Icon name="seat" size={14} />
                <span>Sit in Director&apos;s Seat (G-108)</span>
              </button>
            </div>
          ) : (
            <div class="seat-telemetry-card">
              <div class="telemetry-header">
                <span class="telemetry-seat-title">
                  {metrics.seat.sectionTitle} · Row {metrics.seat.rowLabel} · Seat{' '}
                  {metrics.seat.seatNumber}
                </span>
                <span class={`seat-score-badge grade-${metrics.grade}`}>
                  {metrics.overallScore}% {formatSightlineGradeLabel(metrics.grade)}
                </span>
              </div>

              <div class="telemetry-metrics-grid">
                <div class="telemetry-stat-box">
                  <div class="telemetry-stat-label">Distance to Stage</div>
                  <div class="telemetry-stat-val">
                    {metrics.seat.distanceToStageCenterM.toFixed(1)}m (
                    {Math.round(metrics.seat.distanceToStageCenterM * 3.28084)}ft)
                  </div>
                </div>
                <div class="telemetry-stat-box">
                  <div class="telemetry-stat-label">Horiz / Vert</div>
                  <div class="telemetry-stat-val">
                    {metrics.seat.horizontalAngleDeg.toFixed(0)}° /{' '}
                    {metrics.seat.verticalAngleDeg.toFixed(0)}°
                  </div>
                </div>
                <div class="telemetry-stat-box">
                  <div class="telemetry-stat-label">Max Fly Vis</div>
                  <div class="telemetry-stat-val">
                    {metrics.maxVisibleHeightAtBackdropM.toFixed(1)}m
                  </div>
                </div>
              </div>

              <div class="telemetry-bars-list">
                {VISIBILITY_BARS.map((bar) => (
                  <div key={bar.label} class="telemetry-bar-row">
                    <span>{bar.label}</span>
                    <div class="telemetry-bar-track">
                      <div
                        class="telemetry-bar-fill"
                        style={{
                          width: `${bar.pct}%`,
                          background:
                            bar.pct >= 90
                              ? '#38e298'
                              : bar.pct >= 75
                                ? '#58c4dc'
                                : '#f5a638',
                        }}
                      />
                    </div>
                    <span>{bar.pct}%</span>
                  </div>
                ))}
              </div>

              <div class="telemetry-notes">
                {metrics.notes.map((note, idx) => (
                  <div key={idx}>• {note}</div>
                ))}
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '6px',
                  marginTop: '10px',
                }}
              >
                {seated ? (
                  <button
                    type="button"
                    class="shell-btn"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => {
                      sceneCtrl.exitSeatViewToOrbit();
                      syncStoreFromSceneController(sceneCtrl);
                    }}
                  >
                    <Icon name="stage" size={14} />
                    <span>Exit Seat View</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    class="shell-btn shell-btn-primary"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => {
                      sceneCtrl.selectSeatById(metrics.seat.id, true);
                      syncStoreFromSceneController(sceneCtrl);
                    }}
                  >
                    <Icon name="eye" size={14} />
                    <span>Sit in This Seat</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Optional Collapsible Venue Reference Photos & Specs */}
        <section class="shell-card">
          <div class="shell-card-head">
            <span class="shell-card-title">
              <Icon name="photo" size={14} />
              Venue Reference &amp; Specs
            </span>
            <button
              type="button"
              class="shell-chip"
              onClick={() => setVenueSpecsOpen(!venueSpecsOpen)}
            >
              <span>{venueSpecsOpen ? 'Hide ▴' : 'Photos & Specs ▾'}</span>
            </button>
          </div>
          {venueSpecsOpen && (
            <div class="hud-drawer">
              <div class="venue-photo-grid">
                {VENUE_REFERENCE_PHOTOS.map((photo) => (
                  <figure
                    key={photo.imgUrl}
                    class="venue-photo-card"
                    style={{ cursor: 'pointer' }}
                    title={`Click to enlarge ${photo.title}`}
                    onClick={() => {
                      lightboxMedia.value = {
                        badge: photo.badge,
                        title: photo.title,
                        imgUrl: photo.imgUrl,
                      };
                    }}
                  >
                    <img src={photo.imgUrl} alt={photo.title} loading="lazy" />
                    <figcaption>{photo.label}</figcaption>
                  </figure>
                ))}
              </div>
              <div class="venue-research-summary">
                <p>
                  <strong>Venue:</strong> Hugh McColl Family Theatre at ImaginOn: The Joe &amp;
                  Joan Martin Center (300 E. 7th St, Charlotte, NC).
                </p>
                <p>
                  <strong>Architects &amp; Consultants:</strong> Holzman Moss Bottino
                  Architecture, Gantt Huberman Architects &amp; Theatre Projects Consultants.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </aside>
  );
}
