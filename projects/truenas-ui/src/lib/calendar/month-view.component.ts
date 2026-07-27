
import { Component, input, output, computed, inject, afterNextRender, ElementRef, Injector } from '@angular/core';
import { compareDays, dateKey, isSameDay } from './calendar-dates';
import type { DateRange } from '../date-range-input/date-range-input.component';

/**
 * Which background the day indicator paints. Resolved to a single value per cell so
 * the precedence is stated once, in one place, rather than emerging from the relative
 * specificity of a handful of CSS rules.
 */
export type CalendarCellFill = 'primary' | 'marked' | 'none';

export interface CalendarCell {
  value: number;
  date: Date;
  label: string;
  ariaLabel: string;
  enabled: boolean;
  selected: boolean;
  today: boolean;
  /** Whether the date was listed in `markedDates`. */
  marked: boolean;
  /** Background for the day indicator: selection and range caps outrank marking. */
  fill: CalendarCellFill;
  /**
   * Whether the indicator draws the today outline. Suppressed under a primary fill,
   * where a primary border and primary text would disappear into the fill.
   */
  todayOutline: boolean;
  compareStart?: boolean;
  compareEnd?: boolean;
  rangeStart?: boolean;
  rangeEnd?: boolean;
  inRange?: boolean;
}

@Component({
  selector: 'tn-month-view',
  standalone: true,
  imports: [],
  templateUrl: './month-view.component.html',
  styleUrls: ['./month-view.component.scss']
})
export class TnMonthViewComponent {
  activeDate = input<Date>(new Date());
  selected = input<Date | null | undefined>(undefined);
  minDate = input<Date | undefined>(undefined);
  maxDate = input<Date | undefined>(undefined);
  dateFilter = input<((date: Date) => boolean) | undefined>(undefined);

  /**
   * Dates to flag as noteworthy — days a task runs, days with events, and the like.
   * Order and time-of-day are ignored; only the calendar day is compared. The
   * calendar owns how a marked day looks, so callers pass dates rather than styles.
   */
  markedDates = input<Date[] | undefined>(undefined);

  // Range mode inputs
  rangeMode = input<boolean>(false);
  selectedRange = input<DateRange | undefined>(undefined);

  selectedChange = output<Date>();
  activeDateChange = output<Date>();

  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private injector = inject(Injector);

  readonly weekdays = [
    { long: 'Sunday', short: 'S' },
    { long: 'Monday', short: 'M' },
    { long: 'Tuesday', short: 'T' },
    { long: 'Wednesday', short: 'W' },
    { long: 'Thursday', short: 'T' },
    { long: 'Friday', short: 'F' },
    { long: 'Saturday', short: 'S' },
  ];

  // Cell sizing now controlled via CSS custom properties in the SCSS file

  private markedDateKeys = computed(() => {
    return new Set((this.markedDates() ?? []).map((date) => dateKey(date)));
  });

  /**
   * Names the grid after the month it shows. Without it a screen-reader user arrowing
   * around hears each day but never which month they are in — the period only appears in
   * the header, outside the grid.
   */
  gridLabel = computed(() => {
    return this.activeDate().toLocaleDateString('en', { month: 'long', year: 'numeric' });
  });

  /**
   * The day of the month that carries `tabindex="0"` — the grid's single keyboard entry
   * point, per the roving tabindex pattern.
   *
   * It follows `activeDate`, but falls back to the nearest enabled day when that day
   * can't take focus. Without the fallback a month whose active day is disabled (say,
   * anything before `minDate`) would have no tabbable cell at all, leaving the grid
   * unreachable by keyboard. `null` only when the whole month is disabled, where there
   * is nothing worth focusing anyway.
   *
   * Derived from the month rather than from `calendarRows()`, which would be circular.
   */
  activeDay = computed<number | null>(() => {
    const activeDate = this.activeDate();
    if (!activeDate) { return null; }

    const year = activeDate.getFullYear();
    const month = activeDate.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const isEnabled = (day: number): boolean => this.isDateEnabled(new Date(year, month, day));

    // Always within the rendered month: both come off the same Date, and `Date` has
    // already rolled over any overflow the caller handed us.
    const wanted = activeDate.getDate();
    if (isEnabled(wanted)) { return wanted; }

    // Spiral outwards from the day we wanted, forward first.
    for (let offset = 1; offset < lastDay; offset++) {
      if (wanted + offset <= lastDay && isEnabled(wanted + offset)) { return wanted + offset; }
      if (wanted - offset >= 1 && isEnabled(wanted - offset)) { return wanted - offset; }
    }

    return null;
  });

  private activeCellDate = computed<Date | null>(() => {
    const day = this.activeDay();
    if (day === null) { return null; }

    const activeDate = this.activeDate();
    return new Date(activeDate.getFullYear(), activeDate.getMonth(), day);
  });

  calendarRows = computed(() => {
    const activeDate = this.activeDate();
    // Track selectedRange signal so computed recalculates when range changes
    this.selectedRange();

    if (!activeDate) {return [];}
    
    const year = activeDate.getFullYear();
    const month = activeDate.getMonth();
    const firstDate = new Date(year, month, 1);
    const lastDate = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Read once for the whole grid rather than per cell, so every day is measured
    // against the same instant as well as allocating a fortieth as much.
    const today = new Date();

    const rows: CalendarCell[][] = [];
    let currentRow: CalendarCell[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      currentRow.push(this.createEmptyCell());
    }
    
    // Add all days of the month
    for (let day = 1; day <= lastDate.getDate(); day++) {
      const date = new Date(year, month, day);
      currentRow.push(this.createCell(date, day, today));
      
      // If we have 7 cells, complete the row
      if (currentRow.length === 7) {
        rows.push(currentRow);
        currentRow = [];
      }
    }
    
    // Fill remaining cells in last row if needed
    if (currentRow.length > 0) {
      while (currentRow.length < 7) {
        currentRow.push(this.createEmptyCell());
      }
      rows.push(currentRow);
    }
    
    return rows;
  });

  private createCell(date: Date, value: number, today: Date): CalendarCell {
    const isToday = isSameDay(date, today);
    const isSelected = this.selected() ? isSameDay(date, this.selected()!) : false;
    const isMarked = this.markedDateKeys().has(dateKey(date));
    const enabled = this.isDateEnabled(date);

    // Range mode calculations
    let rangeStart = false;
    let rangeEnd = false;
    let inRange = false;

    const currentRange = this.selectedRange();
    if (this.rangeMode() && currentRange) {
      const { start, end } = currentRange;
      
      if (start && isSameDay(date, start)) {
        rangeStart = true;
      }
      if (end && isSameDay(date, end)) {
        rangeEnd = true;
      }
      // Strictly between the ends. Compared by day so a start or end carrying a time of
      // day can't come out as both a cap and an in-between day.
      if (start && end && compareDays(date, start) > 0 && compareDays(date, end) < 0) {
        inRange = true;
      }
    }

    // Selection and the range caps share one solid fill; marking sits below them and
    // shows only where neither applies. A cap is a selection too, so `today` must not
    // paint its outline over it.
    const isPrimary = isSelected || rangeStart || rangeEnd;
    const fill: CalendarCellFill = isPrimary ? 'primary' : isMarked ? 'marked' : 'none';

    return {
      value,
      date: new Date(date),
      label: date.getDate().toString(),
      ariaLabel: this.formatAriaLabel(date, isSelected, isToday, isMarked, rangeStart, rangeEnd, inRange),
      enabled,
      selected: isSelected,
      today: isToday,
      marked: isMarked,
      fill,
      todayOutline: isToday && !isPrimary,
      rangeStart,
      rangeEnd,
      inRange,
    };
  }

  private createEmptyCell(): CalendarCell {
    return {
      value: 0,
      date: new Date(),
      label: '',
      ariaLabel: '',
      enabled: false,
      selected: false,
      today: false,
      marked: false,
      fill: 'none',
      todayOutline: false,
    };
  }

  private isDateEnabled(date: Date): boolean {
    const minDate = this.minDate();
    const maxDate = this.maxDate();
    const dateFilter = this.dateFilter();
    // Bounds are inclusive of their own day: a `minDate` of "today, 14:30" means today
    // is selectable, not that today is half past the deadline.
    if (minDate && compareDays(date, minDate) < 0) {return false;}
    if (maxDate && compareDays(date, maxDate) > 0) {return false;}
    if (dateFilter && !dateFilter(date)) {return false;}
    return true;
  }

  private formatAriaLabel(
    date: Date,
    isSelected: boolean,
    isToday: boolean,
    isMarked: boolean,
    rangeStart?: boolean,
    rangeEnd?: boolean,
    inRange?: boolean
  ): string {
    let label = date.toLocaleDateString('en', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    if (isSelected) {label += ' (selected)';}
    if (isToday) {label += ' (today)';}
    // Marked days are otherwise conveyed by background colour alone.
    if (isMarked) {label += ' (marked)';}
    if (rangeStart) {label += ' (range start)';}
    if (rangeEnd) {label += ' (range end)';}
    if (inRange) {label += ' (in range)';}
    
    return label;
  }

  trackByDate(index: number, cell: CalendarCell): string {
    if (cell.value === 0) { return `empty-${index}`; }
    return dateKey(cell.date);
  }

  trackByRow(index: number): number {
    return index;
  }

  onCellClicked(cell: CalendarCell): void {
    if (!cell.enabled || cell.value === 0) { return; }

    // The click already moved browser focus here, so the roving tabindex has to come
    // along or the two diverge: arrowing on from a clicked day would carry on from
    // wherever the active day happened to be, jumping the focus somewhere unrelated.
    this.activeDateChange.emit(cell.date);
    this.selectedChange.emit(cell.date);
  }

  /**
   * Moves the roving tabindex. Selection stays on click/Enter/Space, which the cells
   * are already buttons for, so this only ever changes which day is active.
   *
   * Moves that leave the displayed month emit an `activeDateChange` like any other
   * navigation; the grid re-renders on the new month with the target day active.
   */
  onKeydown(event: KeyboardEvent): void {
    const from = this.activeCellDate();
    if (!from) { return; }

    const target = this.targetForKey(event, from);
    if (!target) { return; }

    // Claim the key before the browser scrolls the page with it.
    event.preventDefault();

    const landing = this.nearestEnabled(target, target >= from ? 1 : -1);
    if (!landing || isSameDay(landing, from)) { return; }

    this.activeDateChange.emit(landing);
    this.focusActiveCellAfterRender();
  }

  private targetForKey(event: KeyboardEvent, from: Date): Date | null {
    const year = from.getFullYear();
    const month = from.getMonth();
    const day = from.getDate();
    // Overshooting a month's length is fine — the Date constructor rolls it over, which
    // is exactly what arrowing off the end of a month should do.
    switch (event.key) {
      case 'ArrowLeft': return new Date(year, month, day - 1);
      case 'ArrowRight': return new Date(year, month, day + 1);
      case 'ArrowUp': return new Date(year, month, day - 7);
      case 'ArrowDown': return new Date(year, month, day + 7);
      case 'Home': return new Date(year, month, 1);
      case 'End': return new Date(year, month + 1, 0);
      // Shift pages by a year, matching Material and the wider grid convention.
      case 'PageUp': return this.addMonths(from, event.shiftKey ? -12 : -1);
      case 'PageDown': return this.addMonths(from, event.shiftKey ? 12 : 1);
      default: return null;
    }
  }

  /** Adds whole months, clamping to the last day when the target month is shorter. */
  private addMonths(date: Date, delta: number): Date {
    const year = date.getFullYear();
    const month = date.getMonth() + delta;
    const lastDay = new Date(year, month + 1, 0).getDate();
    return new Date(year, month, Math.min(date.getDate(), lastDay));
  }

  /**
   * Steps past days the caller has disabled, so a gap in `dateFilter` or the far side of
   * `minDate`/`maxDate` doesn't park focus somewhere unusable.
   *
   * Carries on the way the move was already heading, then doubles back if that finds
   * nothing: Home onto a disabled 1st has to search *into* the month, not away from it.
   * Doubling back lands on the day we started from at the edges of the allowed range,
   * which the caller reads as "don't move".
   */
  private nearestEnabled(target: Date, preferred: 1 | -1): Date | null {
    return this.scanForEnabled(target, preferred)
      ?? this.scanForEnabled(target, preferred === 1 ? -1 : 1);
  }

  /** Bounded, so an everything-disabled filter stops the move instead of spinning. */
  private scanForEnabled(from: Date, direction: 1 | -1): Date | null {
    const maxSteps = 62;
    const candidate = new Date(from);

    for (let step = 0; step <= maxSteps; step++) {
      if (this.isDateEnabled(candidate)) { return new Date(candidate); }
      candidate.setDate(candidate.getDate() + direction);
    }

    return null;
  }

  /**
   * Follows the roving tabindex with real focus. The cell elements persist across the
   * re-render, so the browser keeps focus on the day we just left unless we move it.
   */
  private focusActiveCellAfterRender(): void {
    afterNextRender(() => {
      this.host.nativeElement
        .querySelector<HTMLButtonElement>('.tn-calendar-body-cell[tabindex="0"]')
        ?.focus();
    }, { injector: this.injector });
  }
}