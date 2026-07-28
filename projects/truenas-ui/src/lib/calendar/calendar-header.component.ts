
import { Component, input, output, computed, inject, LOCALE_ID } from '@angular/core';

@Component({
  selector: 'tn-calendar-header',
  standalone: true,
  imports: [],
  templateUrl: './calendar-header.component.html',
  styleUrls: ['./calendar-header.component.scss']
})
export class TnCalendarHeaderComponent {
  currentDate = input<Date>(new Date());
  currentView = input<'month' | 'year'>('month');

  viewChanged = output<'month' | 'year'>();
  previousClicked = output<void>();
  nextClicked = output<void>();

  /**
   * Dates are formatted for the app's locale rather than a fixed one. Angular's
   * `LOCALE_ID` is the standard place to set that, and defaults to `en-US`.
   */
  private locale = inject(LOCALE_ID);

  periodLabelId = `tn-calendar-period-label-${Math.floor(Math.random() * 10000)}`;

  periodLabel = computed(() => {
    const date = this.currentDate();
    if (!date) {return '';}

    if (this.currentView() === 'month') {
      // Upper-cased rather than asked for in caps: no locale offers a short month name
      // that is already capitalised the way this header wants it.
      const month = date.toLocaleDateString(this.locale, { month: 'short' }).toUpperCase();
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