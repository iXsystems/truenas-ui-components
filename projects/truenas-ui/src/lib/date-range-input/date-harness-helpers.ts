import type { LocatorFactory, TestElement } from '@angular/cdk/testing';

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

const MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

/**
 * Navigates the calendar overlay to the target month/year, then clicks the day cell.
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

  const dayStr = date.getDate().toString();
  const cells = await rootLocator.locatorForAll(
    '.tn-calendar-body-cell:not([disabled])'
  )();

  for (const cell of cells) {
    if ((await cell.text()).trim() === dayStr) {
      await cell.click();
      return;
    }
  }

  throw new Error(
    `Could not find enabled calendar cell for day ${dayStr}`
  );
}

/**
 * Navigates the calendar to show the month/year of the target date by
 * clicking previous/next buttons as needed.
 */
async function navigateCalendarTo(
  rootLocator: LocatorFactory,
  date: Date
): Promise<void> {
  const targetLabel = `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;

  // Safety limit to prevent infinite loops
  for (let i = 0; i < 120; i++) {
    const periodButton = await rootLocator.locatorFor(
      '.tn-calendar-period-button'
    )();
    const currentLabel = (await periodButton.text()).trim();

    if (currentLabel === targetLabel) {
      return;
    }

    const currentDate = parseCalendarLabel(currentLabel);
    const targetTime = date.getFullYear() * 12 + date.getMonth();
    const currentTime = currentDate.year * 12 + currentDate.month;

    const navSelector = targetTime > currentTime
      ? '.tn-calendar-next-button'
      : '.tn-calendar-previous-button';

    const navButton = await rootLocator.locatorFor(navSelector)();
    await navButton.click();
  }

  throw new Error(`Could not navigate calendar to ${targetLabel}`);
}

function parseCalendarLabel(label: string): {
  year: number;
  month: number;
} {
  const parts = label.split(' ');
  const monthIndex = MONTHS.indexOf(parts[0]);
  const year = parseInt(parts[1], 10);
  return { year, month: monthIndex >= 0 ? monthIndex : 0 };
}
