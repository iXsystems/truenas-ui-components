import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, input, output, signal, effect } from '@angular/core';
import { IxCalendarHeaderComponent } from './ix-calendar-header.component';
import { IxMonthViewComponent } from './ix-month-view.component';
import { IxMultiYearViewComponent } from './ix-multi-year-view.component';
import type { DateRange } from '../ix-date-range-input/ix-date-range-input.component';

@Component({
  selector: 'ix-calendar',
  standalone: true,
  imports: [CommonModule, IxCalendarHeaderComponent, IxMonthViewComponent, IxMultiYearViewComponent],
  template: `
    <ix-calendar-header 
      [currentDate]="currentDate()"
      [currentView]="currentView()"
      (monthSelected)="onMonthSelected($event)"
      (yearSelected)="onYearSelected($event)"
      (viewChanged)="onViewChanged($event)"
      (previousClicked)="onPreviousClicked()"
      (nextClicked)="onNextClicked()" />

    <div class="ix-calendar-content" cdkMonitorSubtreeFocus tabindex="-1">
      <ix-month-view
        *ngIf="currentView() === 'month'"
        [activeDate]="currentDate()"
        [selected]="selected()"
        [dateFilter]="dateFilter()"
        [minDate]="minDate()"
        [maxDate]="maxDate()"
        [rangeMode]="rangeMode()"
        [selectedRange]="rangeMode() ? rangeState() : undefined"
        (selectedChange)="onSelectedChange($event)"
        (activeDateChange)="onActiveDateChange($event)" />

      <!-- Multi-year view -->
      <ix-multi-year-view
        *ngIf="currentView() === 'year'"
        [activeDate]="currentDate()"
        [selected]="selected()"
        [dateFilter]="dateFilter()"
        [minDate]="minDate()"
        [maxDate]="maxDate()"
        (selectedChange)="onYearSelectedFromView($event)"
        (activeDateChange)="onActiveDateChange($event)" />
    </div>
  `,
  styleUrls: ['./ix-calendar.component.scss']
})
export class IxCalendarComponent implements OnInit {
  startView = input<'month' | 'year'>('month');
  selected = input<Date | null | undefined>(undefined);
  minDate = input<Date | undefined>(undefined);
  maxDate = input<Date | undefined>(undefined);
  dateFilter = input<((date: Date) => boolean) | undefined>(undefined);

  // Range mode inputs
  rangeMode = input<boolean>(false);
  selectedRange = input<DateRange | undefined>(undefined);

  selectedChange = output<Date>();
  activeDateChange = output<Date>();
  viewChanged = output<'month' | 'year'>();

  // Range mode outputs
  selectedRangeChange = output<DateRange>();

  currentDate = signal<Date>(new Date());
  currentView = signal<'month' | 'year'>('month');
  
  // Range selection state - this is the authoritative source for calendar display
  rangeState = signal<{
    start: Date | null;
    end: Date | null;
    selecting: 'start' | 'end';
  }>({
    start: null,
    end: null,
    selecting: 'start'
  });

  // Track if user has interacted with calendar - once true, ignore external selectedRange
  private userHasInteracted = false;

  constructor() {
    // Watch for changes to selectedRange input
    effect(() => {
      // Track signals to re-run effect when they change
      this.selectedRange();
      const rangeMode = this.rangeMode();
      // Only update range state from external selectedRange if user hasn't interacted yet
      if (!this.userHasInteracted && rangeMode) {
        this.initializeRangeState();
      }
    });
  }

  ngOnInit(): void {
    this.currentView.set(this.startView());

    // Initialize range state if in range mode (this also handles currentDate)
    if (this.rangeMode()) {
      this.initializeRangeState();
    } else {
      const selected = this.selected();
      if (selected) {
        // For single date mode, navigate to the selected date's month
        this.currentDate.set(new Date(selected));
      }
    }
  }

  private initializeRangeState(): void {
    if (this.rangeMode()) {
      const selectedRange = this.selectedRange();
      if (selectedRange) {
        this.rangeState.set({
          start: selectedRange.start,
          end: selectedRange.end,
          selecting: selectedRange.start && selectedRange.end ? 'start' :
                    selectedRange.start ? 'end' : 'start'
        });

        // Navigate to the month of the selected start date, or end date if no start date
        const dateToShow = selectedRange.start || selectedRange.end;
        if (dateToShow) {
          this.currentDate.set(new Date(dateToShow));
        }
      } else {
        // No selected range - initialize empty range state
        this.rangeState.set({
          start: null,
          end: null,
          selecting: 'start'
        });
      }
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
  
  private handleRangeSelection(date: Date): void {
    // Mark that user has interacted - calendar is now authoritative
    this.userHasInteracted = true;
    
    const currentRange = this.rangeState();
    
    // If we already have a complete range (both start and end), clear and start fresh
    if (currentRange.start && currentRange.end && currentRange.selecting === 'start') {
      const newRangeState = {
        start: date,
        end: null,
        selecting: 'end' as const
      };
      this.rangeState.set(newRangeState);
      this.selectedRangeChange.emit({ start: date, end: null });
      return;
    }
    
    if (currentRange.selecting === 'start' || !currentRange.start) {
      // First click or selecting start date - clear any previous range immediately
      const newRangeState = {
        start: date,
        end: null,
        selecting: 'end' as const
      };
      this.rangeState.set(newRangeState);
      this.selectedRangeChange.emit({ start: date, end: null });
    } else {
      // Setting end date
      const start = currentRange.start!;
      
      // If second date is earlier than first, treat it as new start date
      if (date < start) {
        const newRangeState = {
          start: date,
          end: null,
          selecting: 'end' as const
        };
        this.rangeState.set(newRangeState);
        this.selectedRangeChange.emit({ start: date, end: null });
      } else {
        // Valid end date - complete the range
        const newRangeState = {
          start: start,
          end: date,
          selecting: 'start' as const
        };
        this.rangeState.set(newRangeState);
        this.selectedRangeChange.emit({ start: start, end: date });
      }
    }
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

  /**
   * Reset the calendar to accept external range values - called when calendar reopens
   */
  resetInteractionState(): void {
    this.userHasInteracted = false;
    // Reinitialize range state from selectedRange if provided
    this.initializeRangeState();
  }
}