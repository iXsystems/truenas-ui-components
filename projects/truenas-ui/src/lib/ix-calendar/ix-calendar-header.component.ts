import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ix-calendar-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ix-calendar-header">
      <div class="ix-calendar-controls">
        <!-- Period label (visually hidden for screen readers) -->
        <span aria-live="polite" class="cdk-visually-hidden" [id]="periodLabelId">
          {{ periodLabel() }}
        </span>

        <!-- Period button (month/year selector) -->
        <button 
          type="button"
          class="ix-calendar-period-button"
          [attr.aria-label]="'Choose month and year'"
          [attr.aria-describedby]="periodLabelId"
          (click)="toggleView()">
          <span [attr.aria-hidden]="true">{{ periodLabel() }}</span>
          <svg viewBox="0 0 10 5" focusable="false" aria-hidden="true" class="ix-calendar-arrow">
            <polygon points="0,0 5,5 10,0"></polygon>
          </svg>
        </button>

        <!-- Spacer -->
        <div class="ix-calendar-spacer"></div>

        <!-- Previous button -->
        <button 
          type="button"
          class="ix-calendar-previous-button"
          [attr.aria-label]="previousLabel()"
          (click)="onPreviousClick()">
          <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
          </svg>
        </button>

        <!-- Next button -->
        <button 
          type="button"
          class="ix-calendar-next-button"
          [attr.aria-label]="nextLabel()"
          (click)="onNextClick()">
          <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
          </svg>
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./ix-calendar-header.component.scss']
})
export class IxCalendarHeaderComponent {
  @Input() set currentDate(date: Date) {
    this._currentDate.set(date);
  }
  get currentDate(): Date {
    return this._currentDate();
  }
  
  private _currentDate = signal<Date>(new Date());
  @Input() currentView: 'month' | 'year' = 'month';

  @Output() monthSelected = new EventEmitter<number>();
  @Output() yearSelected = new EventEmitter<number>();
  @Output() viewChanged = new EventEmitter<'month' | 'year'>();
  @Output() previousClicked = new EventEmitter<void>();
  @Output() nextClicked = new EventEmitter<void>();

  private months = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
  ];

  periodLabelId = `ix-calendar-period-label-${Math.floor(Math.random() * 10000)}`;

  periodLabel = computed(() => {
    const date = this._currentDate();
    if (!date) return '';
    
    if (this.currentView === 'month') {
      const month = this.months[date.getMonth()];
      const year = date.getFullYear();
      return `${month} ${year}`;
    } else {
      // For year view, show the year range (24 years like Material)
      const currentYear = date.getFullYear();
      const startYear = Math.floor(currentYear / 24) * 24;
      const endYear = startYear + 23;
      return `${startYear} – ${endYear}`;
    }
  });

  previousLabel = computed(() => {
    return this.currentView === 'month' ? 'Previous month' : 'Previous 24 years';
  });

  nextLabel = computed(() => {
    return this.currentView === 'month' ? 'Next month' : 'Next 24 years';
  });

  toggleView(): void {
    const newView = this.currentView === 'month' ? 'year' : 'month';
    this.viewChanged.emit(newView);
  }

  onPreviousClick(): void {
    this.previousClicked.emit();
  }

  onNextClick(): void {
    this.nextClicked.emit();
  }
}