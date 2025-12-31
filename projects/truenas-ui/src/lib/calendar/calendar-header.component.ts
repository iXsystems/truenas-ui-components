import { CommonModule } from '@angular/common';
import { Component, input, output, computed } from '@angular/core';

@Component({
  selector: 'tn-calendar-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-header.component.html',
  styleUrls: ['./calendar-header.component.scss']
})
export class TnCalendarHeaderComponent {
  currentDate = input<Date>(new Date());
  currentView = input<'month' | 'year'>('month');

  monthSelected = output<number>();
  yearSelected = output<number>();
  viewChanged = output<'month' | 'year'>();
  previousClicked = output<void>();
  nextClicked = output<void>();

  private months = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
  ];

  periodLabelId = `tn-calendar-period-label-${Math.floor(Math.random() * 10000)}`;

  periodLabel = computed(() => {
    const date = this.currentDate();
    if (!date) {return '';}

    if (this.currentView() === 'month') {
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
    return this.currentView() === 'month' ? 'Previous month' : 'Previous 24 years';
  });

  nextLabel = computed(() => {
    return this.currentView() === 'month' ? 'Next month' : 'Next 24 years';
  });

  toggleView(): void {
    const newView = this.currentView() === 'month' ? 'year' : 'month';
    this.viewChanged.emit(newView);
  }

  onPreviousClick(): void {
    this.previousClicked.emit();
  }

  onNextClick(): void {
    this.nextClicked.emit();
  }
}