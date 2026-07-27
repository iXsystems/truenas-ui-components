
import type { OnInit } from '@angular/core';
import { Component, input, output, signal } from '@angular/core';
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

  // Range mode inputs
  rangeMode = input<boolean>(false);
  selectedRange = input<DateRange | undefined>(undefined);

  selectedChange = output<Date>();
  activeDateChange = output<Date>();
  viewChanged = output<'month' | 'year'>();

  // Range mode outputs
  selectedRangeChange = output<DateRange>();

  // Which month/year grid is on screen. Navigation state, not selection state.
  currentDate = signal<Date>(new Date());
  currentView = signal<'month' | 'year'>('month');

  ngOnInit(): void {
    this.currentView.set(this.startView());

    // Open on the month the caller's value lives in.
    const initialDate = this.rangeMode()
      ? (this.selectedRange()?.start ?? this.selectedRange()?.end ?? null)
      : (this.selected() ?? null);

    if (initialDate) {
      this.currentDate.set(new Date(initialDate));
    }
  }

  onMonthSelected(month: number): void {
    const newDate = new Date(this.currentDate());
    newDate.setMonth(month);
    this.currentDate.set(newDate);
    this.currentView.set('month');
    this.viewChanged.emit('month');
  }

  onYearSelected(year: number): void {
    const newDate = new Date(this.currentDate());
    newDate.setFullYear(year);
    this.currentDate.set(newDate);
    this.activeDateChange.emit(newDate);
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
    if (date < start) {
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