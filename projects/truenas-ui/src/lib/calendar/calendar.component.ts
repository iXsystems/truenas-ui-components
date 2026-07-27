
import type { OnInit } from '@angular/core';
import { Component, input, output, signal, linkedSignal } from '@angular/core';
import { compareDays } from './calendar-dates';
import { TnCalendarHeaderComponent } from './calendar-header.component';
import { TnMonthViewComponent } from './month-view.component';
import { TnMultiYearViewComponent } from './multi-year-view.component';
import type { DateRange } from '../date-range-input/date-range-input.component';
import { TnTestIdDirective } from '../test-id';

@Component({
  selector: 'tn-calendar',
  standalone: true,
  imports: [TnCalendarHeaderComponent, TnMonthViewComponent, TnMultiYearViewComponent],
  hostDirectives: [{ directive: TnTestIdDirective, inputs: ['tnTestId: testId'] }],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class TnCalendarComponent implements OnInit {
  startView = input<'month' | 'year'>('month');
  selected = input<Date | null | undefined>(undefined);
  minDate = input<Date | undefined>(undefined);
  maxDate = input<Date | undefined>(undefined);
  dateFilter = input<((date: Date) => boolean) | undefined>(undefined);

  /**
   * Dates to flag as noteworthy — days a task runs, days with events, and the like.
   * Order and time-of-day are ignored; only the calendar day is compared. The
   * calendar owns how a marked day looks, so callers pass dates rather than styles.
   * Marking is independent of `selected`/`selectedRange`, which stay authoritative
   * where they overlap.
   */
  markedDates = input<Date[] | undefined>(undefined);

  /**
   * Which month — or which 24-year page, in the year view — is on screen.
   *
   * Optional. Left unbound, the calendar opens on the month the bound value lives in and
   * drives navigation itself. Bind it, alongside `activeDateChange`, to drive the view
   * from outside: useful for a calendar that stays mounted while its value jumps to
   * another month, which the open-on-init behaviour alone won't follow.
   *
   * Unlike `selected`, this isn't strictly controlled — the calendar still navigates on
   * its own when the user pages or arrows around, so binding a constant here won't
   * freeze the view. Changing what you bind always wins.
   */
  activeDate = input<Date | undefined>(undefined);

  // Range mode inputs
  rangeMode = input<boolean>(false);
  selectedRange = input<DateRange | undefined>(undefined);

  selectedChange = output<Date>();
  activeDateChange = output<Date>();
  viewChanged = output<'month' | 'year'>();

  // Range mode outputs
  selectedRangeChange = output<DateRange>();

  /**
   * Which month/year grid is on screen. Navigation state, not selection state.
   *
   * Follows the `activeDate` input whenever the caller changes it, but stays writable so
   * paging and arrow keys keep working with no echo back from the caller.
   */
  currentDate = linkedSignal<Date | undefined, Date>({
    source: () => this.activeDate(),
    computation: (activeDate, previous) => activeDate ?? previous?.value ?? new Date(),
  });
  currentView = signal<'month' | 'year'>('month');

  ngOnInit(): void {
    this.currentView.set(this.startView());

    // A bound activeDate already says what should be on screen.
    if (this.activeDate()) {
      return;
    }

    // Otherwise open on the month the caller's value lives in.
    const initialDate = this.rangeMode()
      ? (this.selectedRange()?.start ?? this.selectedRange()?.end ?? null)
      : (this.selected() ?? null);

    if (initialDate) {
      this.currentDate.set(new Date(initialDate));
    }
  }

  onViewChanged(view: 'month' | 'year'): void {
    this.currentView.set(view);
    this.viewChanged.emit(view);
  }

  onPreviousClicked(): void {
    const current = this.currentDate();
    let newDate: Date;
    
    if (this.currentView() === 'month') {
      newDate = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    } else {
      // For year view, navigate by 24-year ranges (like Material)
      newDate = new Date(current.getFullYear() - 24, current.getMonth(), 1);
    }
    
    this.currentDate.set(newDate);
    this.activeDateChange.emit(newDate);
  }

  onNextClicked(): void {
    const current = this.currentDate();
    let newDate: Date;
    
    if (this.currentView() === 'month') {
      newDate = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    } else {
      // For year view, navigate by 24-year ranges (like Material)
      newDate = new Date(current.getFullYear() + 24, current.getMonth(), 1);
    }
    
    this.currentDate.set(newDate);
    this.activeDateChange.emit(newDate);
  }

  onSelectedChange(date: Date): void {
    if (this.rangeMode()) {
      this.handleRangeSelection(date);
    } else {
      this.selectedChange.emit(date);
    }
  }
  
  /**
   * Works out the next range from the one the caller currently owns and emits it. The
   * calendar keeps no copy — what it renders next is whatever the caller binds back.
   */
  private handleRangeSelection(date: Date): void {
    const current = this.selectedRange();
    const start = current?.start ?? null;
    const end = current?.end ?? null;

    // Nothing pending, or the range is already complete: begin a new one.
    if (!start || end) {
      this.selectedRangeChange.emit({ start: date, end: null });
      return;
    }

    // A second pick before the first restarts the range rather than inverting it.
    // Compared by day: the clicked date is midnight, but the caller's start may carry a
    // time of day, which would otherwise make re-picking the same day restart the range.
    if (compareDays(date, start) < 0) {
      this.selectedRangeChange.emit({ start: date, end: null });
      return;
    }

    this.selectedRangeChange.emit({ start, end: date });
  }

  onActiveDateChange(date: Date): void {
    this.currentDate.set(date);
    this.activeDateChange.emit(date);
  }

  onYearSelectedFromView(date: Date): void {
    // When a year is selected from the multi-year view, update the current date
    // and switch back to month view
    this.currentDate.set(date);
    this.currentView.set('month');
    this.viewChanged.emit('month');
    this.activeDateChange.emit(date);
  }
}