import { Component, input, forwardRef, signal, computed, viewChild, ElementRef, OnInit, ViewContainerRef, TemplateRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { OverlayModule, Overlay, OverlayRef, ConnectedPosition } from '@angular/cdk/overlay';
import { TemplatePortal, PortalModule } from '@angular/cdk/portal';
import { A11yModule } from '@angular/cdk/a11y';
import { IxInputDirective } from '../ix-input/ix-input.directive';
import { IxCalendarComponent } from '../ix-calendar/ix-calendar.component';
import { Subject } from 'rxjs';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

@Component({
  selector: 'ix-date-range-input',
  standalone: true,
  imports: [CommonModule, IxInputDirective, IxCalendarComponent, OverlayModule, PortalModule, A11yModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IxDateRangeInputComponent),
      multi: true
    }
  ],
  template: `
    <div class="ix-date-range-container">
      <div #wrapper ixInput class="ix-date-range-wrapper" style="padding-right: 40px;">
        <!-- Start date segments -->
        <div class="ix-date-segment-group">
          <input 
            #startMonthInput
            type="text"
            class="ix-date-segment ix-date-segment-month"
            placeholder="MM"
            maxlength="2"
            [disabled]="isDisabled()"
            (focus)="onSegmentFocus('start', 'month')"
            (blur)="onSegmentBlur('start', 'month')"
            (keydown)="onSegmentKeydown($event, 'start', 'month')">
          <span class="ix-date-segment-separator">/</span>
          <input 
            #startDayInput
            type="text"
            class="ix-date-segment ix-date-segment-day"
            placeholder="DD"
            maxlength="2"
            [disabled]="isDisabled()"
            (focus)="onSegmentFocus('start', 'day')"
            (blur)="onSegmentBlur('start', 'day')"
            (keydown)="onSegmentKeydown($event, 'start', 'day')">
          <span class="ix-date-segment-separator">/</span>
          <input 
            #startYearInput
            type="text"
            class="ix-date-segment ix-date-segment-year"
            placeholder="YYYY"
            maxlength="4"
            [disabled]="isDisabled()"
            (focus)="onSegmentFocus('start', 'year')"
            (blur)="onSegmentBlur('start', 'year')"
            (keydown)="onSegmentKeydown($event, 'start', 'year')">
        </div>
        
        <span class="ix-date-range-separator">–</span>
        
        <!-- End date segments -->
        <div class="ix-date-segment-group">
          <input 
            #endMonthInput
            type="text"
            class="ix-date-segment ix-date-segment-month"
            placeholder="MM"
            maxlength="2"
            [disabled]="isDisabled()"
            (focus)="onSegmentFocus('end', 'month')"
            (blur)="onSegmentBlur('end', 'month')"
            (keydown)="onSegmentKeydown($event, 'end', 'month')">
          <span class="ix-date-segment-separator">/</span>
          <input 
            #endDayInput
            type="text"
            class="ix-date-segment ix-date-segment-day"
            placeholder="DD"
            maxlength="2"
            [disabled]="isDisabled()"
            (focus)="onSegmentFocus('end', 'day')"
            (blur)="onSegmentBlur('end', 'day')"
            (keydown)="onSegmentKeydown($event, 'end', 'day')">
          <span class="ix-date-segment-separator">/</span>
          <input 
            #endYearInput
            type="text"
            class="ix-date-segment ix-date-segment-year"
            placeholder="YYYY"
            maxlength="4"
            [disabled]="isDisabled()"
            (focus)="onSegmentFocus('end', 'year')"
            (blur)="onSegmentBlur('end', 'year')"
            (keydown)="onSegmentKeydown($event, 'end', 'year')">
        </div>
        
        <button 
          type="button"
          class="ix-date-range-toggle"
          (click)="openDatepicker()"
          [disabled]="isDisabled()"
          aria-label="Open calendar">
          <span aria-hidden="true">📅</span>
        </button>
      </div>
      
      <ng-template #calendarTemplate>
        <ix-calendar
          class="ix-calendar"
          [startView]="'month'"
          [rangeMode]="true"
          [selectedRange]="initialRange()"
          (selectedRangeChange)="onRangeSelected($event)">
        </ix-calendar>
      </ng-template>
    </div>
  `,
  styleUrl: './ix-date-range-input.component.scss',
  host: {
    'class': 'ix-date-range-input'
  }
})
export class IxDateRangeInputComponent implements ControlValueAccessor, OnInit, OnDestroy {
  disabled = input<boolean>(false);
  placeholder = input<string>('Select date range');

  private formDisabled = signal<boolean>(false);
  isDisabled = computed(() => this.disabled() || this.formDisabled());

  startMonthRef = viewChild.required<ElementRef<HTMLInputElement>>('startMonthInput');
  startDayRef = viewChild.required<ElementRef<HTMLInputElement>>('startDayInput');
  startYearRef = viewChild.required<ElementRef<HTMLInputElement>>('startYearInput');
  endMonthRef = viewChild.required<ElementRef<HTMLInputElement>>('endMonthInput');
  endDayRef = viewChild.required<ElementRef<HTMLInputElement>>('endDayInput');
  endYearRef = viewChild.required<ElementRef<HTMLInputElement>>('endYearInput');
  calendarTemplate = viewChild.required<TemplateRef<any>>('calendarTemplate');
  calendar = viewChild.required<IxCalendarComponent>(IxCalendarComponent);
  wrapperEl = viewChild.required<ElementRef<HTMLDivElement>>('wrapper');

  private destroy$ = new Subject<void>();
  private overlayRef?: OverlayRef;
  private portal?: TemplatePortal;
  isOpen = signal<boolean>(false);

  private onChange = (value: DateRange) => {};
  private onTouched = () => {};

  value = signal<DateRange>({ start: null, end: null });
  
  // Individual segment signals
  startMonth = signal<string>('');
  startDay = signal<string>('');
  startYear = signal<string>('');
  endMonth = signal<string>('');
  endDay = signal<string>('');
  endYear = signal<string>('');
  
  private currentFocus: 'start' | 'end' = 'start';
  // Always provide current range to calendar for initial display
  initialRange = computed(() => {
    return this.value();
  });

  constructor(
    private overlay: Overlay, 
    private elementRef: ElementRef,
    private viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit() {
    // Initialize display values
    this.updateDisplayValues();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.close();
  }

  // ControlValueAccessor implementation
  writeValue(value: DateRange): void {
    this.value.set(value || { start: null, end: null });
    this.updateDisplayValues();
  }

  registerOnChange(fn: (value: DateRange) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  // Segment event handlers
  onSegmentFocus(range: 'start' | 'end', segment: 'month' | 'day' | 'year'): void {
    this.currentFocus = range;
  }

  onSegmentBlur(range: 'start' | 'end', segment: 'month' | 'day' | 'year'): void {
    this.onTouched();
    // Only validate and update when we have complete values, don't clear partial entries
    const month = range === 'start' ? (this.startMonthRef()?.nativeElement?.value || '') : (this.endMonthRef()?.nativeElement?.value || '');
    const day = range === 'start' ? (this.startDayRef()?.nativeElement?.value || '') : (this.endDayRef()?.nativeElement?.value || '');
    const year = range === 'start' ? (this.startYearRef()?.nativeElement?.value || '') : (this.endYearRef()?.nativeElement?.value || '');
    
    // Only try to create a date if all segments have some value
    if (month && day && year && year.length === 4) {
      this.updateDateFromSegments(range);
    }
  }


  onSegmentKeydown(event: KeyboardEvent, range: 'start' | 'end', segment: 'month' | 'day' | 'year'): void {
    const input = event.target as HTMLInputElement;
    
    // Only handle navigation - don't interfere with typing
    if (event.key === 'ArrowRight') {
      if (input.selectionStart === input.value.length) {
        event.preventDefault();
        this.focusNextSegment(range, segment);
      }
    } else if (event.key === 'ArrowLeft') {
      if (input.selectionStart === 0) {
        event.preventDefault();
        this.focusPrevSegment(range, segment);
      }
    } else if (event.key === 'Backspace') {
      if (input.value === '' || input.selectionStart === 0) {
        event.preventDefault();
        this.focusPrevSegment(range, segment);
      }
    }
  }

  onRangeSelected(range: DateRange): void {
    this.updateRange(range);
    
    // Handle input field updates and clearing
    if (range.start && !range.end) {
      // Start date selected - clear end date input fields immediately
      if (this.endMonthRef()?.nativeElement) this.endMonthRef().nativeElement.value = '';
      if (this.endDayRef()?.nativeElement) this.endDayRef().nativeElement.value = '';
      if (this.endYearRef()?.nativeElement) this.endYearRef().nativeElement.value = '';
      
      // Focus end month for next selection
      setTimeout(() => this.endMonthRef()?.nativeElement?.focus(), 0);
    } else if (range.start && range.end) {
      // Both dates selected - close calendar
      this.close();
    }
  }

  private updateRange(range: DateRange): void {
    this.value.set(range);
    this.updateDisplayValues();
    this.onChange(range);
  }

  private updateDisplayValues(): void {
    const range = this.value();
    
    // Update start date segments - only when we have valid dates from calendar
    if (range.start) {
      const monthVal = (range.start.getMonth() + 1).toString().padStart(2, '0');
      const dayVal = range.start.getDate().toString().padStart(2, '0');
      const yearVal = range.start.getFullYear().toString();
      
      this.startMonth.set(monthVal);
      this.startDay.set(dayVal);
      this.startYear.set(yearVal);
      
      // Only update input elements if they're empty or this is from calendar selection
      if (this.startMonthRef()?.nativeElement) this.startMonthRef().nativeElement.value = monthVal;
      if (this.startDayRef()?.nativeElement) this.startDayRef().nativeElement.value = dayVal;
      if (this.startYearRef()?.nativeElement) this.startYearRef().nativeElement.value = yearVal;
    }
    
    // Update end date segments - only when we have valid dates from calendar  
    if (range.end) {
      const monthVal = (range.end.getMonth() + 1).toString().padStart(2, '0');
      const dayVal = range.end.getDate().toString().padStart(2, '0');
      const yearVal = range.end.getFullYear().toString();
      
      this.endMonth.set(monthVal);
      this.endDay.set(dayVal);
      this.endYear.set(yearVal);
      
      // Only update input elements if they're empty or this is from calendar selection
      if (this.endMonthRef()?.nativeElement) this.endMonthRef().nativeElement.value = monthVal;
      if (this.endDayRef()?.nativeElement) this.endDayRef().nativeElement.value = dayVal;
      if (this.endYearRef()?.nativeElement) this.endYearRef().nativeElement.value = yearVal;
    }
  }
  
  private setSegmentValue(range: 'start' | 'end', segment: 'month' | 'day' | 'year', value: string): void {
    if (range === 'start') {
      if (segment === 'month') this.startMonth.set(value);
      else if (segment === 'day') this.startDay.set(value);
      else if (segment === 'year') this.startYear.set(value);
    } else {
      if (segment === 'month') this.endMonth.set(value);
      else if (segment === 'day') this.endDay.set(value);
      else if (segment === 'year') this.endYear.set(value);
    }
  }
  
  private updateDateFromSegments(range: 'start' | 'end'): void {
    let month: string, day: string, year: string;
    
    if (range === 'start') {
      month = this.startMonthRef()?.nativeElement?.value || '';
      day = this.startDayRef()?.nativeElement?.value || '';
      year = this.startYearRef()?.nativeElement?.value || '';
    } else {
      month = this.endMonthRef()?.nativeElement?.value || '';
      day = this.endDayRef()?.nativeElement?.value || '';
      year = this.endYearRef()?.nativeElement?.value || '';
    }
    
    let date: Date | null = null;
    if (month && day && year && year.length === 4) {
      const monthNum = parseInt(month, 10);
      const dayNum = parseInt(day, 10);
      const yearNum = parseInt(year, 10);
      
      if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
        date = new Date(yearNum, monthNum - 1, dayNum);
        // Validate the date is real (handles Feb 30, etc.)
        if (date.getFullYear() !== yearNum || date.getMonth() !== monthNum - 1 || date.getDate() !== dayNum) {
          date = null;
        }
      }
    }
    
    const currentValue = this.value();
    if (range === 'start') {
      this.updateRange({ start: date, end: currentValue.end });
    } else {
      this.updateRange({ start: currentValue.start, end: date });
    }
  }
  
  private focusNextSegment(range: 'start' | 'end', segment: 'month' | 'day' | 'year'): void {
    if (range === 'start') {
      if (segment === 'month') this.startDayRef().nativeElement.focus();
      else if (segment === 'day') this.startYearRef().nativeElement.focus();
      else if (segment === 'year') this.endMonthRef().nativeElement.focus();
    } else {
      if (segment === 'month') this.endDayRef().nativeElement.focus();
      else if (segment === 'day') this.endYearRef().nativeElement.focus();
      // End year is the last field - could focus calendar button or just stay
    }
  }
  
  private focusPrevSegment(range: 'start' | 'end', segment: 'month' | 'day' | 'year'): void {
    if (range === 'start') {
      // Start month is the first field - nowhere to go back
      if (segment === 'day') this.startMonthRef().nativeElement.focus();
      else if (segment === 'year') this.startDayRef().nativeElement.focus();
    } else {
      if (segment === 'month') this.startYearRef().nativeElement.focus();
      else if (segment === 'day') this.endMonthRef().nativeElement.focus();
      else if (segment === 'year') this.endDayRef().nativeElement.focus();
    }
  }

  private formatDate(date: Date): string {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${month}/${day}/${year}`;
  }

  private parseDate(dateStr: string): Date | null {
    if (!dateStr || dateStr.trim() === '') {
      return null;
    }

    // Try parsing common date formats
    const formats = [
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // MM/DD/YYYY
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/,   // MM-DD-YYYY
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/    // YYYY-MM-DD
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        let month: number, day: number, year: number;
        
        if (format === formats[2]) { // YYYY-MM-DD
          year = parseInt(match[1], 10);
          month = parseInt(match[2], 10) - 1;
          day = parseInt(match[3], 10);
        } else { // MM/DD/YYYY or MM-DD-YYYY
          month = parseInt(match[1], 10) - 1;
          day = parseInt(match[2], 10);
          year = parseInt(match[3], 10);
        }

        const date = new Date(year, month, day);
        
        // Validate the date
        if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
          return date;
        }
      }
    }

    return null;
  }

  openDatepicker(): void {
    if (this.isOpen()) return;

    this.createOverlay();
    this.isOpen.set(true);

    // Reset calendar interaction state when opening
    const cal = this.calendar();
    if (cal) {
      setTimeout(() => cal.resetInteractionState(), 0);
    }
  }

  close(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = undefined;
      this.portal = undefined;
    }
    this.isOpen.set(false);
  }

  private createOverlay(): void {
    if (this.overlayRef) return;

    const positions: ConnectedPosition[] = [
      {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
        offsetY: 8,
      },
      {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'bottom',
        offsetY: -8,
      },
      {
        originX: 'end',
        originY: 'bottom',
        overlayX: 'end',
        overlayY: 'top',
        offsetY: 8,
      },
      {
        originX: 'end',
        originY: 'top',
        overlayX: 'end',
        overlayY: 'bottom',
        offsetY: -8,
      },
    ];

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.wrapperEl())
      .withPositions(positions)
      .withPush(false);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      panelClass: 'ix-datepicker-overlay'
    });

    // Close datepicker when backdrop is clicked
    this.overlayRef.backdropClick().subscribe(() => {
      this.close();
    });

    this.portal = new TemplatePortal(this.calendarTemplate(), this.viewContainerRef);
    this.overlayRef.attach(this.portal);
  }
}