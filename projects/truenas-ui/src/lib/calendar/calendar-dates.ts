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
