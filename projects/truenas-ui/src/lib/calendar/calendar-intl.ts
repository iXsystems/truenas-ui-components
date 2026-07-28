import { InjectionToken, inject } from '@angular/core';

/**
 * The calendar's user-facing wording.
 *
 * Dates, month and weekday names and the first day of the week all come from the
 * locale, so they need no translation here — `Intl` already knows them. What is left is
 * prose: the state suffixes screen readers read out, and the names of the header
 * buttons. Those are the strings this carries.
 */
export interface TnCalendarIntl {
  /** Appended to a day flagged through `markedDates`. */
  marked: string;
  /** Appended to the first day of the selected range. */
  rangeStart: string;
  /** Appended to the last day of the selected range. */
  rangeEnd: string;
  /** Appended to the days between the ends of the selected range. */
  inRange: string;
  /** Appended to the year cell for the current year. */
  currentYear: string;
  /** Accessible name for the day grid, given the month and year already formatted. */
  monthGridLabel: (period: string) => string;
  /** Accessible name for the year grid, given the span of years it shows. */
  yearGridLabel: (startYear: number, endYear: number) => string;
  /** Accessible name for the button that switches between the day and year grids. */
  chooseMonthAndYear: string;
  /** Accessible name for the back button in the day grid. */
  previousMonth: string;
  /** Accessible name for the forward button in the day grid. */
  nextMonth: string;
  /** Accessible name for the back button in the year grid. */
  previousYears: string;
  /** Accessible name for the forward button in the year grid. */
  nextYears: string;
}

/** The wording used when an app provides none of its own. */
export const TN_CALENDAR_INTL_DEFAULTS: TnCalendarIntl = {
  marked: '(marked)',
  rangeStart: '(range start)',
  rangeEnd: '(range end)',
  inRange: '(in range)',
  currentYear: '(current year)',
  monthGridLabel: (period) => period,
  yearGridLabel: (startYear, endYear) => `Years ${startYear} to ${endYear}`,
  chooseMonthAndYear: 'Choose month and year',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  previousYears: 'Previous 24 years',
  nextYears: 'Next 24 years',
};

/**
 * Injection token for the calendar's wording.
 *
 * Because the library ships no localized strings, this is the recommended hook for
 * wiring a translation service so every `tn-calendar` reads the same way. Anything left
 * out falls back to {@link TN_CALENDAR_INTL_DEFAULTS}, so an app can translate one
 * string without restating the rest.
 *
 * Dates themselves are not here — they follow `LOCALE_ID`, or the calendar's `locale`
 * input. See `TnCalendarComponent.locale`.
 *
 * @example
 * ```ts
 * providers: [
 *   {
 *     provide: TN_CALENDAR_INTL,
 *     useFactory: (translate: TranslateService): Partial<TnCalendarIntl> => ({
 *       marked: translate.instant('calendar.marked'),
 *       previousMonth: translate.instant('calendar.previousMonth'),
 *       yearGridLabel: (from, to) => translate.instant('calendar.years', { from, to }),
 *     }),
 *     deps: [TranslateService],
 *   },
 * ];
 * ```
 */
export const TN_CALENDAR_INTL = new InjectionToken<Partial<TnCalendarIntl>>('TN_CALENDAR_INTL');

/**
 * Resolves the wording for a calendar component: whatever the app provided, laid over
 * the built-in defaults.
 */
export function injectTnCalendarIntl(): TnCalendarIntl {
  return { ...TN_CALENDAR_INTL_DEFAULTS, ...(inject(TN_CALENDAR_INTL, { optional: true }) ?? {}) };
}
