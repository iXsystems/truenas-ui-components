
import { Component, input, output, computed, inject, afterNextRender, ElementRef, Injector } from '@angular/core';

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
    const wanted = Math.min(Math.max(this.activeDate().getFullYear(), range.start), range.end);
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
      ariaLabel: this.formatYearAriaLabel(year, isSelected, isToday),
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

  private formatYearAriaLabel(year: number, isSelected: boolean, isToday: boolean): string {
    let label = year.toString();
    
    if (isSelected) {label += ' (selected)';}
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
      // Create a new date with the selected year, keeping current month and day
      const currentDate = this.activeDate();
      const newDate = new Date(cell.year, currentDate.getMonth(), currentDate.getDate());
      this.selectedChange.emit(newDate);
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

    const target = this.targetForKey(event, from);
    if (target === null) { return; }

    // Claim the key before the browser scrolls the page with it.
    event.preventDefault();

    const landing = this.nearestEnabledYear(target, target >= from ? 1 : -1);
    if (landing === null || landing === from) { return; }

    const activeDate = this.activeDate();
    this.activeDateChange.emit(new Date(landing, activeDate.getMonth(), activeDate.getDate()));
    this.focusActiveCellAfterRender();
  }

  private targetForKey(event: KeyboardEvent, from: number): number | null {
    const range = this.yearRange();
    const yearsPerPage = range.end - range.start + 1;

    switch (event.key) {
      case 'ArrowLeft': return from - 1;
      case 'ArrowRight': return from + 1;
      case 'ArrowUp': return from - this.yearsPerRow;
      case 'ArrowDown': return from + this.yearsPerRow;
      case 'Home': return range.start;
      case 'End': return range.end;
      case 'PageUp': return from - yearsPerPage;
      case 'PageDown': return from + yearsPerPage;
      default: return null;
    }
  }

  /**
   * Steps past years the caller has disabled, so `minDate`/`maxDate` don't park focus
   * somewhere unusable.
   *
   * Carries on the way the move was already heading, then doubles back if that finds
   * nothing: Home onto a disabled first year has to search *into* the page, not away
   * from it. Doubling back lands on the year we started from at the edges of the
   * allowed range, which the caller reads as "don't move".
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