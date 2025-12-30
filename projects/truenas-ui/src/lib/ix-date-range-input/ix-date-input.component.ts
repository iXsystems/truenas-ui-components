import { A11yModule } from '@angular/cdk/a11y';
import type { OverlayRef, ConnectedPosition } from '@angular/cdk/overlay';
import { Overlay } from '@angular/cdk/overlay';
import { OverlayModule } from '@angular/cdk/overlay';
import { TemplatePortal, PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import type { ElementRef, OnInit, TemplateRef, OnDestroy } from '@angular/core';
import { ViewContainerRef } from '@angular/core';
import { Component, input, forwardRef, signal, computed, viewChild, inject } from '@angular/core';
import type { ControlValueAccessor} from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject } from 'rxjs';
import { IxCalendarComponent } from '../ix-calendar/ix-calendar.component';
import { IxInputDirective } from '../ix-input/ix-input.directive';

@Component({
  selector: 'ix-date-input',
  standalone: true,
  imports: [CommonModule, IxInputDirective, IxCalendarComponent, OverlayModule, PortalModule, A11yModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IxDateInputComponent),
      multi: true
    }
  ],
  template: `
    <div class="ix-date-input-container">
      <div #wrapper ixInput class="ix-date-input-wrapper" style="padding-right: 40px;">
        <!-- Date segments MM/DD/YYYY -->
        <div class="ix-date-segment-group">
          <input
            #monthInput
            type="text"
            class="ix-date-segment ix-date-segment-month"
            placeholder="MM"
            maxlength="2"
            [disabled]="isDisabled()"
            (focus)="onSegmentFocus('month')"
            (blur)="onSegmentBlur('month')"
            (keydown)="onSegmentKeydown($event, 'month')">
          <span class="ix-date-segment-separator">/</span>
          <input
            #dayInput
            type="text"
            class="ix-date-segment ix-date-segment-day"
            placeholder="DD"
            maxlength="2"
            [disabled]="isDisabled()"
            (focus)="onSegmentFocus('day')"
            (blur)="onSegmentBlur('day')"
            (keydown)="onSegmentKeydown($event, 'day')">
          <span class="ix-date-segment-separator">/</span>
          <input
            #yearInput
            type="text"
            class="ix-date-segment ix-date-segment-year"
            placeholder="YYYY"
            maxlength="4"
            [disabled]="isDisabled()"
            (focus)="onSegmentFocus('year')"
            (blur)="onSegmentBlur('year')"
            (keydown)="onSegmentKeydown($event, 'year')">
        </div>

        <button
          type="button"
          class="ix-date-input-toggle"
          aria-label="Open calendar"
          [disabled]="isDisabled()"
          (click)="openDatepicker()">
          <span aria-hidden="true">📅</span>
        </button>
      </div>
      
      <ng-template #calendarTemplate>
        <ix-calendar
          class="ix-calendar"
          [startView]="'month'"
          [rangeMode]="false"
          [selected]="value()"
          (selectedChange)="onDateSelected($event)" />
      </ng-template>
    </div>
  `,
  styleUrl: './ix-date-input.component.scss',
  host: {
    'class': 'ix-date-input'
  }
})
export class IxDateInputComponent implements ControlValueAccessor, OnInit, OnDestroy {
  overlay = inject(Overlay);
  viewContainerRef = inject(ViewContainerRef);

  disabled = input<boolean>(false);
  placeholder = input<string>('Select date');
  min = input<Date | undefined>(undefined);
  max = input<Date | undefined>(undefined);
  dateFilter = input<((date: Date) => boolean) | undefined>(undefined);

  private formDisabled = signal<boolean>(false);
  isDisabled = computed(() => this.disabled() || this.formDisabled());

  monthRef = viewChild.required<ElementRef<HTMLInputElement>>('monthInput');
  dayRef = viewChild.required<ElementRef<HTMLInputElement>>('dayInput');
  yearRef = viewChild.required<ElementRef<HTMLInputElement>>('yearInput');
  calendarTemplate = viewChild.required<TemplateRef<unknown>>('calendarTemplate');
  calendar = viewChild.required<IxCalendarComponent>(IxCalendarComponent);
  wrapperEl = viewChild.required<ElementRef<HTMLDivElement>>('wrapper');

  private destroy$ = new Subject<void>();
  private overlayRef?: OverlayRef;
  private portal?: TemplatePortal;
  isOpen = signal<boolean>(false);

  private onChange = (value: Date | null) => {};
  private onTouched = () => {};

  value = signal<Date | null>(null);
  
  // Individual segment signals
  month = signal<string>('');
  day = signal<string>('');
  year = signal<string>('');

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
  writeValue(value: Date | null): void {
    this.value.set(value);
    this.updateDisplayValues();
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn as (value: Date | null) => void;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn as () => void;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  // Segment event handlers
  onSegmentFocus(segment: 'month' | 'day' | 'year'): void {
    // Focus handling
  }

  onSegmentBlur(segment: 'month' | 'day' | 'year'): void {
    this.onTouched();
    // Only validate and update when we have complete values
    const month = this.monthRef()?.nativeElement?.value || '';
    const day = this.dayRef()?.nativeElement?.value || '';
    const year = this.yearRef()?.nativeElement?.value || '';

    // Only try to create a date if all segments have some value
    if (month && day && year && year.length === 4) {
      this.updateDateFromSegments();
    }
  }

  onSegmentKeydown(event: KeyboardEvent, segment: 'month' | 'day' | 'year'): void {
    const input = event.target as HTMLInputElement;
    
    // Handle navigation between segments
    if (event.key === 'ArrowRight') {
      if (input.selectionStart === input.value.length) {
        event.preventDefault();
        this.focusNextSegment(segment);
      }
    } else if (event.key === 'ArrowLeft') {
      if (input.selectionStart === 0) {
        event.preventDefault();
        this.focusPrevSegment(segment);
      }
    } else if (event.key === 'Backspace') {
      if (input.value === '' || input.selectionStart === 0) {
        event.preventDefault();
        this.focusPrevSegment(segment);
      }
    }
  }

  onDateSelected(date: Date): void {
    this.updateDate(date);
    // Close calendar after single date selection
    this.close();
  }

  private updateDate(date: Date | null): void {
    this.value.set(date);
    this.updateDisplayValues();
    this.onChange(date);
  }

  private updateDisplayValues(): void {
    const date = this.value();
    
    if (date) {
      const monthVal = (date.getMonth() + 1).toString().padStart(2, '0');
      const dayVal = date.getDate().toString().padStart(2, '0');
      const yearVal = date.getFullYear().toString();
      
      this.month.set(monthVal);
      this.day.set(dayVal);
      this.year.set(yearVal);
      
      // Update input elements
      if (this.monthRef()?.nativeElement) {this.monthRef().nativeElement.value = monthVal;}
      if (this.dayRef()?.nativeElement) {this.dayRef().nativeElement.value = dayVal;}
      if (this.yearRef()?.nativeElement) {this.yearRef().nativeElement.value = yearVal;}
    } else {
      // Clear all values
      this.month.set('');
      this.day.set('');
      this.year.set('');

      if (this.monthRef()?.nativeElement) {this.monthRef().nativeElement.value = '';}
      if (this.dayRef()?.nativeElement) {this.dayRef().nativeElement.value = '';}
      if (this.yearRef()?.nativeElement) {this.yearRef().nativeElement.value = '';}
    }
  }

  private updateDateFromSegments(): void {
    const month = this.monthRef()?.nativeElement?.value || '';
    const day = this.dayRef()?.nativeElement?.value || '';
    const year = this.yearRef()?.nativeElement?.value || '';
    
    let date: Date | null = null;
    if (month && day && year && year.length === 4) {
      const monthNum = parseInt(month, 10);
      const dayNum = parseInt(day, 10);
      const yearNum = parseInt(year, 10);
      
      if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
        date = new Date(yearNum, monthNum - 1, dayNum);
        // Validate the date is real
        if (date.getFullYear() !== yearNum || date.getMonth() !== monthNum - 1 || date.getDate() !== dayNum) {
          date = null;
        }
      }
    }
    
    this.updateDate(date);
  }
  
  private focusNextSegment(segment: 'month' | 'day' | 'year'): void {
    if (segment === 'month') {this.dayRef().nativeElement.focus();}
    else if (segment === 'day') {this.yearRef().nativeElement.focus();}
    // Year is the last field
  }

  private focusPrevSegment(segment: 'month' | 'day' | 'year'): void {
    if (segment === 'day') {this.monthRef().nativeElement.focus();}
    else if (segment === 'year') {this.dayRef().nativeElement.focus();}
    // Month is the first field
  }

  openDatepicker(): void {
    if (this.isOpen()) {return;}

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
    if (this.overlayRef) {return;}

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