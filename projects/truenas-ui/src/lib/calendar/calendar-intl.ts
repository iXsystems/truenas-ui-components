import type { Signal } from '@angular/core';
import { InjectionToken, computed, inject } from '@angular/core';

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
 * What an app may provide for {@link TN_CALENDAR_INTL}: the wording itself, or a signal
 * carrying it. Provide the signal form when the language can change while the app is
 * running — a plain object is read once and never again, so every open calendar would
 * keep the wording it was built with.
 */
export type TnCalendarIntlInput = Partial<TnCalendarIntl> | Signal<Partial<TnCalendarIntl>>;

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
 * // Fixed for the lifetime of the app — the language is chosen at build or bootstrap.
 * providers: [
 *   {
 *     provide: TN_CALENDAR_INTL,
 *     useFactory: (translate: TranslateService): TnCalendarIntlInput => ({
 *       marked: translate.instant('calendar.marked'),
 *       previousMonth: translate.instant('calendar.previousMonth'),
 *       yearGridLabel: (from, to) => translate.instant('calendar.years', { from, to }),
 *     }),
 *     deps: [TranslateService],
 *   },
 * ];
 * ```
 *
 * @example
 * ```ts
 * // Switchable at runtime: a signal, so calendars already on screen follow along.
 * providers: [
 *   {
 *     provide: TN_CALENDAR_INTL,
 *     useFactory: (): TnCalendarIntlInput => {
 *       const translate = inject(TranslateService);
 *       const lang = toSignal(translate.onLangChange, { initialValue: null });
 *       return computed(() => {
 *         lang(); // Re-read every string when the language changes.
 *         return { marked: translate.instant('calendar.marked') };
 *       });
 *     },
 *   },
 * ];
 * ```
 */
export const TN_CALENDAR_INTL = new InjectionToken<TnCalendarIntlInput>('TN_CALENDAR_INTL');

/**
 * Resolves the wording for a calendar component: whatever the app provided, laid over
 * the built-in defaults.
 *
 * Returns a signal rather than a plain object so a language switch reaches calendars that
 * are already on screen. Read it inside a `computed` — as every caller here does — and
 * the labels recompute on their own.
 */
export function injectTnCalendarIntl(): Signal<TnCalendarIntl> {
  const provided = inject(TN_CALENDAR_INTL, { optional: true });

  return computed(() => {
    // Signals are functions; a plain object of wording is not.
    const wording = typeof provided === 'function' ? provided() : provided;
    return { ...TN_CALENDAR_INTL_DEFAULTS, ...(wording ?? {}) };
  });
}
