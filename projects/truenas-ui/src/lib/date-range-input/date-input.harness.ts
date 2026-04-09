import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { formatDateParts, getInputValue, selectCalendarDate, setInputValue } from './date-harness-helpers';

/**
 * Harness for interacting with `tn-date-input` in tests.
 * Provides methods for getting/setting the date value, opening the calendar,
 * and querying disabled state.
 *
 * The calendar popup is portaled to the CDK overlay, so use
 * `TestbedHarnessEnvironment.documentRootLoader(fixture)` if you need to
 * interact with the calendar cells directly.
 *
 * @example
 * ```typescript
 * const dateInput = await loader.getHarness(TnDateInputHarness);
 * await dateInput.setValue(new Date(2026, 3, 15));
 * expect(await dateInput.getDisplayText()).toBe('04/15/2026');
 *
 * await dateInput.openCalendar();
 * expect(await dateInput.isCalendarOpen()).toBe(true);
 * ```
 */
export class TnDateInputHarness extends ComponentHarness {
  static hostSelector = 'tn-date-input';

  private _monthInput = this.locatorFor('.tn-date-segment-month');
  private _dayInput = this.locatorFor('.tn-date-segment-day');
  private _yearInput = this.locatorFor('.tn-date-segment-year');
  private _toggle = this.locatorFor('.tn-date-input-toggle');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a date input
   * with specific attributes.
   *
   * @param options Options for filtering which instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   */
  static with(options: DateInputHarnessFilters = {}) {
    return new HarnessPredicate(TnDateInputHarness, options);
  }

  /**
   * Gets the displayed date text as "MM/DD/YYYY".
   * Returns placeholder segments if no date is set.
   *
   * @returns Promise resolving to the formatted display string.
   */
  async getDisplayText(): Promise<string> {
    const month = await getInputValue(await this._monthInput());
    const day = await getInputValue(await this._dayInput());
    const year = await getInputValue(await this._yearInput());
    return `${month || 'MM'}/${day || 'DD'}/${year || 'YYYY'}`;
  }

  /**
   * Sets the date by typing into the segment inputs.
   *
   * @param date The date to set.
   */
  async setValue(date: Date): Promise<void> {
    const { month, day, year } = formatDateParts(date);
    await setInputValue(await this._monthInput(), month);
    await setInputValue(await this._dayInput(), day);
    await setInputValue(await this._yearInput(), year);
  }

  /**
   * Clears all date segments.
   */
  async clear(): Promise<void> {
    await setInputValue(await this._monthInput(), '');
    await setInputValue(await this._dayInput(), '');
    await setInputValue(await this._yearInput(), '');
  }

  /**
   * Checks whether the input is disabled.
   *
   * @returns Promise resolving to true if the input is disabled.
   */
  async isDisabled(): Promise<boolean> {
    const month = await this._monthInput();
    return (await month.getProperty<boolean>('disabled')) ?? false;
  }

  /**
   * Opens the calendar popup by clicking the toggle button.
   */
  async openCalendar(): Promise<void> {
    const toggle = await this._toggle();
    await toggle.click();
  }

  /**
   * Whether the calendar popup is currently open.
   *
   * @returns Promise resolving to true if the calendar overlay is visible.
   */
  async isCalendarOpen(): Promise<boolean> {
    const overlay = await this.documentRootLocatorFactory().locatorForOptional('.tn-datepicker-overlay')();
    return overlay !== null;
  }

  /**
   * Selects a date via the calendar popup. Opens the calendar if not already
   * open, navigates to the target month, and clicks the day cell.
   *
   * @param date The date to select.
   *
   * @example
   * ```typescript
   * const dateInput = await loader.getHarness(TnDateInputHarness);
   * await dateInput.selectDate(new Date(2026, 3, 15));
   * expect(await dateInput.getDisplayText()).toBe('04/15/2026');
   * ```
   */
  async selectDate(date: Date): Promise<void> {
    if (!(await this.isCalendarOpen())) {
      await this.openCalendar();
    }
    await selectCalendarDate(this.documentRootLocatorFactory(), date);
  }
}

/**
 * Filters for finding `TnDateInputHarness` instances.
 */
export interface DateInputHarnessFilters extends BaseHarnessFilters {}
