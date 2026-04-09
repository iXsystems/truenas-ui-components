import type { TestElement } from '@angular/cdk/testing';

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
