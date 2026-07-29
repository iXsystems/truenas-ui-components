
import { _IdGenerator } from '@angular/cdk/a11y';
import { Component, input, output, computed, inject, LOCALE_ID } from '@angular/core';
import { YEARS_PER_PAGE, yearPageStart } from './calendar-dates';
import { injectTnCalendarIntl } from './calendar-intl';

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

  /**
   * Locale for the month abbreviation. Falls back to the app's `LOCALE_ID`;
   * `tn-calendar` binds it from its own `locale` input.
   */
  locale = input<string | undefined>(undefined);

  viewChanged = output<'month' | 'year'>();
  previousClicked = output<void>();
  nextClicked = output<void>();

  private appLocale = inject(LOCALE_ID);
  private intl = injectTnCalendarIntl();

  private resolvedLocale = computed(() => this.locale() ?? this.appLocale);

  /**
   * Ties the period button to its live region through `aria-describedby`. Counted rather
   * than drawn at random: two calendars on one page — a start and an end picker, say —
   * had a real chance of minting the same id out of only 10,000, and a duplicate id
   * silently unhooks the association with nothing to show for it.
   */
  periodLabelId = inject(_IdGenerator).getId('tn-calendar-period-label-');

  periodLabel = computed(() => {
    const date = this.currentDate();
    if (!date) {return '';}

    const locale = this.resolvedLocale();

    if (this.currentView() === 'month') {
      // Formatted as one unit so the locale decides the order and the numerals, not a
      // template string. Upper-cased after the fact: no locale offers a short month name
      // already capitalised the way this header wants it.
      return date.toLocaleDateString(locale, { month: 'short', year: 'numeric' }).toUpperCase();
    } else {
      // The span the year grid is showing. Shared with the view so the two cannot
      // disagree about which page is on screen.
      const startYear = yearPageStart(date.getFullYear());
      const yearFormat = new Intl.NumberFormat(locale, { useGrouping: false });
      return `${yearFormat.format(startYear)} – ${yearFormat.format(startYear + YEARS_PER_PAGE - 1)}`;
    }
  });

  previousLabel = computed(() => {
    return this.currentView() === 'month' ? this.intl().previousMonth : this.intl().previousYears;
  });

  nextLabel = computed(() => {
    return this.currentView() === 'month' ? this.intl().nextMonth : this.intl().nextYears;
  });

  periodButtonLabel = computed(() => this.intl().chooseMonthAndYear);

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