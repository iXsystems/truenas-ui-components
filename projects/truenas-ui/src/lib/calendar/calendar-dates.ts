/**
 * Day-granularity date helpers shared by the calendar views.
 *
 * The calendar deals in calendar days, but the dates a caller binds are ordinary
 * `Date`s and routinely carry a time of day — `new Date()` for a default, or a value
 * round-tripped through an API. Comparing those against the midnight dates the grid
 * builds gives answers that are off by up to a day, so every comparison the calendar
 * makes goes through here.
 */

/**
 * Orders two dates by calendar day: negative when `a` falls on an earlier day than `b`,
 * zero on the same day, positive when later. Time of day is ignored on both sides.
 */
export function compareDays(a: Date, b: Date): number {
  return (
    a.getFullYear() - b.getFullYear()
    || a.getMonth() - b.getMonth()
    || a.getDate() - b.getDate()
  );
}

/** Whether two dates fall on the same calendar day, ignoring time of day. */
export function isSameDay(a: Date, b: Date): boolean {
  return compareDays(a, b) === 0;
}

/** Stable per-day key, for lookups and change tracking. */
export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/**
 * `YYYY-MM-DD` for the day this date falls on, built from its local parts.
 *
 * Rendered onto each day cell as `data-tn-date`, which gives tests a handle on a day
 * that survives translation — cell text is formatted for the locale, right down to the
 * numerals, so matching on it only works in English.
 *
 * Deliberately not `toISOString()`: that converts to UTC first, so anywhere east or west
 * of Greenwich it can name the day before or after the one shown.
 */
export function isoDateString(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Adds whole months, clamping to the last day when the target month is shorter, so
 * navigating never silently lands in the month after the one asked for. `new Date` rolls
 * 31 January + 1 month over into early March; this returns 28 (or 29) February.
 */
export function addMonths(date: Date, delta: number): Date {
  return atMonthAndDay(date, date.getFullYear(), date.getMonth() + delta);
}

/**
 * The same month and day in another year, clamped the same way — 29 February in a
 * non-leap year is 28 February, not 1 March. Without the clamp, paging the year grid off
 * a leap day quietly changes the month as well as the year.
 */
export function withYear(date: Date, year: number): Date {
  return atMonthAndDay(date, year, date.getMonth());
}

/** Keeps `date`'s day-of-month where the target month is long enough to hold it. */
function atMonthAndDay(date: Date, year: number, month: number): Date {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(date.getDate(), lastDay));
}

/**
 * The day a week starts on in the given locale, as a `Date.getDay()` index — 0 for
 * Sunday through 6 for Saturday. Sunday in the US, Monday across most of Europe,
 * Saturday in much of the Middle East.
 *
 * Read from `Intl`, which reports it ISO-style (1 Monday … 7 Sunday). Not every engine
 * exposes it — Firefox notably lagged — so anything that cannot answer falls back to
 * Sunday, which is what the grid did for every locale before.
 */
export function firstDayOfWeek(locale: string): number {
  try {
    const info = new Intl.Locale(locale) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number };
      weekInfo?: { firstDay: number };
    };
    const firstDay = info.getWeekInfo?.().firstDay ?? info.weekInfo?.firstDay;

    // ISO counts Sunday as 7; `Date.getDay()` counts it as 0.
    return firstDay === undefined ? 0 : firstDay % 7;
  } catch {
    // A malformed locale tag shouldn't take the calendar down with it.
    return 0;
  }
}
