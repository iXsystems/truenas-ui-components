import type { LocatorFactory, TestElement } from '@angular/cdk/testing';
import { isoDateString } from '../calendar/calendar-dates';

/**
 * Formats a Date into zero-padded month, day, and year strings.
 *
 * @param date The date to format.
 * @returns An object with `month` (MM), `day` (DD), and `year` (YYYY) strings.
 */
export function formatDateParts(date: Date): {
  month: string;
  day: string;
  year: string;
} {
  return {
    month: (date.getMonth() + 1).toString().padStart(2, '0'),
    day: date.getDate().toString().padStart(2, '0'),
    year: date.getFullYear().toString(),
  };
}

/**
 * Reads the current value from an input element.
 *
 * @param el The test element to read from.
 * @returns The input's value, or an empty string if unset.
 */
export async function getInputValue(el: TestElement): Promise<string> {
  return (await el.getProperty<string>('value')) || '';
}

/**
 * Clears an input element and types a new value, then blurs to trigger validation.
 *
 * @param el The test element to write to.
 * @param value The value to type. Pass empty string to clear only.
 */
export async function setInputValue(
  el: TestElement,
  value: string
): Promise<void> {
  await el.clear();
  if (value) {
    await el.sendKeys(value);
  }
  await el.blur();
}

/**
 * Navigates the calendar overlay to the target month, then clicks that day.
 * Assumes the calendar popup is already open.
 *
 * @param rootLocator The document root locator factory (for finding overlay elements).
 * @param date The target date to select.
 */
export async function selectCalendarDate(
  rootLocator: LocatorFactory,
  date: Date
): Promise<void> {
  await navigateCalendarTo(rootLocator, date);

  // Matched on `data-tn-date` rather than the cell's text: the text is formatted for the
  // locale, right down to the numerals, so "15" finds nothing in an Arabic calendar.
  const target = isoDateString(date);
  const cell = await rootLocator.locatorForOptional(
    `.tn-calendar-body-cell[data-tn-date="${target}"]:not([disabled])`
  )();

  if (!cell) {
    throw new Error(`Could not find an enabled calendar cell for ${target}`);
  }

  await cell.click();
}

/**
 * Pages the calendar to the month the target date falls in.
 *
 * Reads where the calendar currently sits from the days it is rendering rather than from
 * the header, which is written in the app's language and numerals. Every day cell in the
 * grid belongs to the displayed month, so the first one answers the question.
 */
async function navigateCalendarTo(
  rootLocator: LocatorFactory,
  date: Date
): Promise<void> {
  const monthsFrom = (from: { year: number; month: number }): number => {
    return (date.getFullYear() * 12 + date.getMonth()) - (from.year * 12 + from.month);
  };

  // A generous bound on the paging loop: a decade either way, and far more than the
  // handful of clicks any real navigation needs.
  for (let step = 0; step < 240; step++) {
    const shown = await displayedMonth(rootLocator);
    const delta = monthsFrom(shown);
    if (delta === 0) { return; }

    const button = await rootLocator.locatorFor(
      delta > 0 ? '.tn-calendar-next-button' : '.tn-calendar-previous-button'
    )();
    await button.click();
  }

  throw new Error(`Could not navigate the calendar to ${isoDateString(date)}`);
}

/** The month on screen, read off the first day cell the grid rendered. */
async function displayedMonth(
  rootLocator: LocatorFactory
): Promise<{ year: number; month: number }> {
  const cell = await rootLocator.locatorForOptional('.tn-calendar-body-cell[data-tn-date]')();
  const stamp = await cell?.getAttribute('data-tn-date');

  if (!stamp) {
    throw new Error('Could not read the displayed month: the calendar rendered no day cells.');
  }

  const [year, month] = stamp.split('-').map(Number);
  return { year, month: month - 1 };
}
