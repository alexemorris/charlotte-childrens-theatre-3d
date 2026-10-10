import type {
  ChartColorMode,
  SeatRecord,
  SightlineGrade,
} from '../types/theatre.ts';

export interface SeatingChartCallbacks {
  onSelectSeat(seatId: string): void;
  onHoverSeat(seat: SeatRecord | null): void;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

export class InteractiveSeatingChart {
  private readonly container: HTMLElement;
  private readonly seats: ReadonlyArray<SeatRecord>;
  private readonly callbacks: SeatingChartCallbacks;
  private readonly seatCircles = new Map<string, SVGCircleElement>();
  private selectedSeatId: string | null = null;
  private colorMode: ChartColorMode = 'section';
  private sightlineGrades: ReadonlyArray<SightlineGrade> = [];

  constructor(
    container: HTMLElement,
    seats: ReadonlyArray<SeatRecord>,
    callbacks: SeatingChartCallbacks
  ) {
    this.container = container;
    this.seats = seats;
    this.callbacks = callbacks;
    this.renderSvg();
  }

  private renderSvg(): void {
    this.container.innerHTML = '';

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 340 430');
    svg.setAttribute('class', 'seating-chart-svg');

    // 1. STAGE Header Box at Top (matching seating_chart.png)
    const stageRect = document.createElementNS(SVG_NS, 'path');
    stageRect.setAttribute(
      'd',
      'M 54 10 L 286 10 L 286 34 Q 170 46 54 34 Z'
    );
    stageRect.setAttribute('fill', '#1f232b');
    stageRect.setAttribute('stroke', '#4a5262');
    stageRect.setAttribute('stroke-width', '1.2');
    svg.appendChild(stageRect);

    const stageLabel = document.createElementNS(SVG_NS, 'text');
    stageLabel.setAttribute('x', '170');
    stageLabel.setAttribute('y', '26');
    stageLabel.setAttribute('text-anchor', 'middle');
    stageLabel.setAttribute('fill', '#e4e6eb');
    stageLabel.setAttribute('font-size', '10');
    stageLabel.setAttribute('font-weight', '700');
    stageLabel.setAttribute('letter-spacing', '2.5');
    stageLabel.textContent = 'STAGE';
    svg.appendChild(stageLabel);

    // 2. Section Zone Background Outlines (matching seating_chart.png)
    const addZoneLabel = (
      x: number,
      y: number,
      text: string,
      color: string
    ): void => {
      const t = document.createElementNS(SVG_NS, 'text');
      t.setAttribute('x', String(x));
      t.setAttribute('y', String(y));
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('fill', color);
      t.setAttribute('font-size', '7.2');
      t.setAttribute('font-weight', '700');
      t.setAttribute('letter-spacing', '0.6');
      t.setAttribute('pointer-events', 'none');
      t.setAttribute('opacity', '0.78');
      t.textContent = text;
      svg.appendChild(t);
    };

    // Dashed Overhang Lines across Main Floor (Rows K/L and Rows N/O)
    const addOverhangLine = (y: number, label: string, color: string): void => {
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', '26');
      line.setAttribute('y1', String(y));
      line.setAttribute('x2', '314');
      line.setAttribute('y2', String(y));
      line.setAttribute('stroke', color);
      line.setAttribute('stroke-width', '1');
      line.setAttribute('stroke-dasharray', '3,3');
      svg.appendChild(line);

      const txt = document.createElementNS(SVG_NS, 'text');
      txt.setAttribute('x', '170');
      txt.setAttribute('y', String(y - 2.5));
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('fill', color);
      txt.setAttribute('font-size', '6.3');
      txt.setAttribute('font-weight', '700');
      txt.setAttribute('letter-spacing', '0.7');
      txt.textContent = label;
      svg.appendChild(txt);
    };

    addOverhangLine(187, 'LOWER BALCONY OVERHANG', '#e0a040');
    addOverhangLine(226, 'UPPER BALCONY OVERHANG', '#6ab4f2');

    // Divider labels between Main Floor, Lower Balcony, and Upper Balcony
    addZoneLabel(102, 50, 'MAIN FLOOR LEFT', '#5cd68d');
    addZoneLabel(238, 50, 'MAIN FLOOR RIGHT', '#5cd68d');
    addZoneLabel(102, 272, 'LOWER BALCONY LEFT', '#f28b66');
    addZoneLabel(238, 272, 'LOWER BALCONY RIGHT', '#f28b66');
    addZoneLabel(102, 360, 'UPPER BALCONY LEFT', '#6ab4f2');
    addZoneLabel(238, 360, 'UPPER BALCONY RIGHT', '#6ab4f2');

    // 3. Plot all 570 Seats in clean 2D architectural coordinates
    for (const seat of this.seats) {
      const { cx, cy } = this.projectSeatToSvg(seat);
      const circle = document.createElementNS(SVG_NS, 'circle');
      circle.setAttribute('cx', cx.toFixed(1));
      circle.setAttribute('cy', cy.toFixed(1));
      circle.setAttribute('r', '2.8');
      circle.setAttribute('class', 'chart-seat-dot');
      circle.dataset.seatId = seat.id;

      circle.addEventListener('click', (ev) => {
        ev.stopPropagation();
        this.callbacks.onSelectSeat(seat.id);
      });
      circle.addEventListener('pointerenter', () => {
        this.callbacks.onHoverSeat(seat);
      });
      circle.addEventListener('pointerleave', () => {
        this.callbacks.onHoverSeat(null);
      });

      svg.appendChild(circle);
      this.seatCircles.set(seat.id, circle);
    }

    // Row letter ticks along center aisle
    const mainRows = [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
    ];
    mainRows.forEach((lbl, idx) => {
      const y = 63 + idx * 12.6;
      const t = document.createElementNS(SVG_NS, 'text');
      t.setAttribute('x', '170');
      t.setAttribute('y', String(y + 2));
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('fill', '#7a8290');
      t.setAttribute('font-size', '6.2');
      t.setAttribute('font-weight', '600');
      t.setAttribute('pointer-events', 'none');
      t.textContent = lbl;
      svg.appendChild(t);
    });

    this.container.appendChild(svg);
    this.refreshColors();
  }

  private projectSeatToSvg(seat: SeatRecord): { cx: number; cy: number } {
    // Map 3D x (-9.6 .. +9.6) to SVG x (20 .. 320), with a slight center aisle gap at x=170
    const aisleShift = seat.position.x < 0 ? -4 : 4;
    const cx = 170 + seat.position.x * 15.2 + aisleShift;

    let cy = 60;
    if (seat.level === 'main') {
      cy = 62 + seat.rowIndex * 12.6 + Math.abs(seat.position.x) * 0.45;
    } else if (seat.level === 'lower-balcony') {
      const wingPullUp = Math.abs(seat.position.x) > 5.8 ? (Math.abs(seat.position.x) - 5.8) * 6.5 : 0;
      cy = 285 + seat.rowIndex * 14.5 - wingPullUp;
    } else {
      const wingPullUp = Math.abs(seat.position.x) > 5.2 ? (Math.abs(seat.position.x) - 5.2) * 5.5 : 0;
      cy = 374 + seat.rowIndex * 14.5 - wingPullUp;
    }

    return { cx, cy };
  }

  public setSelectedSeatId(seatId: string | null): void {
    this.selectedSeatId = seatId;
    this.refreshColors();
  }

  public updateModeAndGrades(
    mode: ChartColorMode,
    grades: ReadonlyArray<SightlineGrade>
  ): void {
    this.colorMode = mode;
    this.sightlineGrades = grades;
    this.refreshColors();
  }

  private refreshColors(): void {
    for (const seat of this.seats) {
      const circle = this.seatCircles.get(seat.id);
      if (!circle) continue;

      const isSelected = seat.id === this.selectedSeatId;
      if (isSelected) {
        circle.setAttribute('fill', '#38e2ff');
        circle.setAttribute('r', '4.6');
        circle.setAttribute('stroke', '#ffffff');
        circle.setAttribute('stroke-width', '1.3');
        continue;
      }

      circle.setAttribute('r', '2.8');
      circle.setAttribute('stroke', '#101216');
      circle.setAttribute('stroke-width', '0.5');

      if (this.colorMode === 'section') {
        if (seat.level === 'main') {
          circle.setAttribute('fill', '#46c67c');
        } else if (seat.level === 'lower-balcony') {
          circle.setAttribute('fill', '#ea7b54');
        } else {
          circle.setAttribute('fill', '#58a6ec');
        }
      } else {
        const grade = this.sightlineGrades[seat.instanceIndex] ?? 'optimal';
        const color =
          grade === 'optimal'
            ? '#38e298'
            : grade === 'good'
              ? '#58c4dc'
              : grade === 'partial-overhang'
                ? '#f5a638'
                : '#ee6055';
        circle.setAttribute('fill', color);
      }
    }
  }
}
