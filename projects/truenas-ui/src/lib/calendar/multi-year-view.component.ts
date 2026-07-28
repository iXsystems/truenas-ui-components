
import { Component, input, output, computed, inject, afterNextRender, ElementRef, Injector } from '@angular/core';
import { withYear } from './calendar-dates';

export interface YearCell {
  value: number;
  year: number;
  label: string;
  ariaLabel: string;
  enabled: boolean;
  selected: boolean;
  today: boolean;
}

@Component({
  selector: 'tn-multi-year-view',
  standalone: true,
  imports: [],
  templateUrl: './multi-year-view.component.html',
  styleUrls: ['./multi-year-view.component.scss']
})
export class TnMultiYearViewComponent {
  activeDate = input<Date>(new Date());
  selected = input<Date | null | undefined>(undefined);
  minDate = input<Date | undefined>(undefined);
  maxDate = input<Date | undefined>(undefined);
  dateFilter = input<((date: Date) => boolean) | undefined>(undefined);

  selectedChange = output<Date>();
  activeDateChange = output<Date>();

  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private injector = inject(Injector);

  readonly yearsPerRow = 4;
  readonly yearRowCount = 6; // Shows 24 years total (6 rows x 4 columns)

  // Calculate the year range to display
  yearRange = computed(() => {
    const activeDate = this.activeDate();
    const currentYear = activeDate.getFullYear();

    // Calculate the starting year for a 24-year range
    // We want the active year to be roughly in the middle
    const startYear = Math.floor(currentYear / 24) * 24;

    return { start: startYear, end: startYear + 23 };
  });

  /**
   * Names the grid after the span of years it shows, so a screen-reader user arrowing
   * around knows which page they are on rather than just hearing bare years.
   */
  gridLabel = computed(() => {
    const range = this.yearRange();
    return `Years ${range.start} to ${range.end}`;
  });

  yearRows = computed(() => {
    const range = this.yearRange();
    const rows: YearCell[][] = [];
    
    for (let row = 0; row < this.yearRowCount; row++) {
      const yearRow: YearCell[] = [];
      
      for (let col = 0; col < this.yearsPerRow; col++) {
        const year = range.start + (row * this.yearsPerRow) + col;
        yearRow.push(this.createYearCell(year));
      }
      
      rows.push(yearRow);
    }
    
    return rows;
  });

  /**
   * The year that carries `tabindex="0"` — the grid's single keyboard entry point, per
   * the roving tabindex pattern. Follows `activeDate`, falling back to the nearest
   * enabled year in the page so a range whose active year is disabled still has a
   * tabbable cell. `null` only when every year on the page is disabled.
   */
  activeYear = computed<number | null>(() => {
    const range = this.yearRange();
    // Always inside the page: the range is derived from this same year.
    const wanted = this.activeDate().getFullYear();
    if (this.isYearEnabled(wanted)) { return wanted; }

    // Spiral outwards from the year we wanted, forward first.
    const span = range.end - range.start;
    for (let offset = 1; offset <= span; offset++) {
      if (wanted + offset <= range.end && this.isYearEnabled(wanted + offset)) { return wanted + offset; }
      if (wanted - offset >= range.start && this.isYearEnabled(wanted - offset)) { return wanted - offset; }
    }

    return null;
  });

  private createYearCell(year: number): YearCell {
    const today = new Date();
    const currentYear = today.getFullYear();
    const selectedYear = this.selected()?.getFullYear();

    const isToday = year === currentYear;
    const isSelected = year === selectedYear;
    const enabled = this.isYearEnabled(year);

    return {
      value: year,
      year: year,
      label: year.toString(),
      ariaLabel: this.formatYearAriaLabel(year, isToday),
      enabled,
      selected: isSelected,
      today: isToday,
    };
  }

  private isYearEnabled(year: number): boolean {
    const minDate = this.minDate();
    const maxDate = this.maxDate();
    const dateFilter = this.dateFilter();
    if (minDate && year < minDate.getFullYear()) {return false;}
    if (maxDate && year > maxDate.getFullYear()) {return false;}

    // Deliberately coarse: a year is a single cell, so it gets a single verdict, and
    // January 1st stands in for the whole year. A filter that rules out January 1st
    // while allowing the rest of the year therefore disables the year outright. Material
    // approximates the same way; testing all 365 days per cell is not worth it, and the
    // month view applies the filter exactly once the user drills in.
    if (dateFilter) {
      const testDate = new Date(year, 0, 1);
      if (!dateFilter(testDate)) {return false;}
    }

    return true;
  }

  /**
   * Selection is carried by the cell's `aria-selected`, so it is deliberately not
   * repeated here. "Current year" stays: `aria-current="date"` on a year cell is vague
   * enough that spelling it out earns its place.
   */
  private formatYearAriaLabel(year: number, isToday: boolean): string {
    let label = year.toString();

    if (isToday) {label += ' (current year)';}

    return label;
  }

  trackByYear(index: number, cell: YearCell): number {
    return cell.year;
  }

  trackByRow(index: number, row: YearCell[]): string {
    return row.map(cell => cell.year).join(',');
  }

  onYearClicked(cell: YearCell): void {
    if (cell.enabled) {
      // Keeps the month and day, clamped: moving off 29 February into a non-leap year
      // would otherwise roll over into March and change the month too.
      this.selectedChange.emit(withYear(this.activeDate(), cell.year));
    }
  }

  /**
   * Moves the roving tabindex across the year grid. Picking a year stays on
   * click/Enter/Space, which the cells are already buttons for.
   *
   * Moves past either end of the 24-year page emit an `activeDateChange` like the
   * header's paging buttons do, and the grid re-renders on the neighbouring page.
   */
  onKeydown(event: KeyboardEvent): void {
    const from = this.activeYear();
    if (from === null) { return; }

    const move = this.targetForKey(event, from);
    if (move === null) { return; }

    // Claim the key before the browser scrolls the page with it.
    event.preventDefault();

    const landing = this.nearestEnabledYear(move.year, move.search);
    if (landing === null || landing === from) { return; }

    this.activeDateChange.emit(withYear(this.activeDate(), landing));
    this.focusActiveCellAfterRender();
  }

  /**
   * The year a key aims at, and which way to look from there when that year is disabled.
   *
   * The search direction belongs to the key, not to where the target happens to fall
   * relative to the current year. Home and End mean "the ends of *this* page", so they
   * search inward: looking outward would step onto the neighbouring 24-year page over a
   * single ruled-out boundary year and turn the page, which is not what either key
   * promises. The arrows and the paging keys keep travelling the way they were already
   * headed, and moving onto the next page is the point of those.
   */
  private targetForKey(event: KeyboardEvent, from: number): { year: number; search: 1 | -1 } | null {
    const range = this.yearRange();
    const yearsPerPage = range.end - range.start + 1;

    switch (event.key) {
      case 'ArrowLeft': return { year: from - 1, search: -1 };
      case 'ArrowRight': return { year: from + 1, search: 1 };
      case 'ArrowUp': return { year: from - this.yearsPerRow, search: -1 };
      case 'ArrowDown': return { year: from + this.yearsPerRow, search: 1 };
      case 'Home': return { year: range.start, search: 1 };
      case 'End': return { year: range.end, search: -1 };
      case 'PageUp': return { year: from - yearsPerPage, search: -1 };
      case 'PageDown': return { year: from + yearsPerPage, search: 1 };
      default: return null;
    }
  }

  /**
   * Steps past years the caller has disabled, so `minDate`/`maxDate` don't park focus
   * somewhere unusable.
   *
   * Searches the way the key asked for (see `targetForKey`), then doubles back if that
   * finds nothing. The fallback is for the ends of the allowed range: arrowing right at
   * `maxDate` finds nothing ahead, doubles back onto the year we started from, and the
   * caller reads that as "don't move".
   */
  private nearestEnabledYear(target: number, preferred: 1 | -1): number | null {
    return this.scanForEnabledYear(target, preferred)
      ?? this.scanForEnabledYear(target, preferred === 1 ? -1 : 1);
  }

  /** Bounded, so an everything-disabled range stops the move instead of spinning. */
  private scanForEnabledYear(from: number, direction: 1 | -1): number | null {
    const maxSteps = 48;

    for (let step = 0; step <= maxSteps; step++) {
      const candidate = from + (step * direction);
      if (this.isYearEnabled(candidate)) { return candidate; }
    }

    return null;
  }

  /**
   * Follows the roving tabindex with real focus. The cell elements persist across the
   * re-render, so the browser keeps focus on the year we just left unless we move it.
   */
  private focusActiveCellAfterRender(): void {
    afterNextRender(() => {
      this.host.nativeElement
        .querySelector<HTMLButtonElement>('.tn-calendar-body-cell[tabindex="0"]')
        ?.focus();
    }, { injector: this.injector });
  }
}