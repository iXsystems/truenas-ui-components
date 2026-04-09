import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { formatDateParts, getInputValue, setInputValue } from './date-harness-helpers';

/**
 * Harness for interacting with `tn-date-range-input` in tests.
 * Provides methods for getting/setting the date range, opening the calendar,
 * and querying disabled state.
 *
 * The calendar popup is portaled to the CDK overlay, so use
 * `TestbedHarnessEnvironment.documentRootLoader(fixture)` if you need to
 * interact with the calendar cells directly.
 *
 * @example
 * ```typescript
 * const rangeInput = await loader.getHarness(TnDateRangeInputHarness);
 * await rangeInput.setStartDate(new Date(2026, 0, 1));
 * await rangeInput.setEndDate(new Date(2026, 0, 31));
 * expect(await rangeInput.getStartText()).toBe('01/01/2026');
 * expect(await rangeInput.getEndText()).toBe('01/31/2026');
 * ```
 */
export class TnDateRangeInputHarness extends ComponentHarness {
  static hostSelector = 'tn-date-range-input';

  private _startMonth = this.locatorFor('.tn-date-segment-group:first-of-type .tn-date-segment-month');
  private _startDay = this.locatorFor('.tn-date-segment-group:first-of-type .tn-date-segment-day');
  private _startYear = this.locatorFor('.tn-date-segment-group:first-of-type .tn-date-segment-year');
  private _endMonth = this.locatorFor('.tn-date-segment-group:last-of-type .tn-date-segment-month');
  private _endDay = this.locatorFor('.tn-date-segment-group:last-of-type .tn-date-segment-day');
  private _endYear = this.locatorFor('.tn-date-segment-group:last-of-type .tn-date-segment-year');
  private _toggle = this.locatorFor('.tn-date-range-toggle');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a date range input
   * with specific attributes.
   *
   * @param options Options for filtering which instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   */
  static with(options: DateRangeInputHarnessFilters = {}) {
    return new HarnessPredicate(TnDateRangeInputHarness, options);
  }

  /**
   * Gets the start date display text as "MM/DD/YYYY".
   *
   * @returns Promise resolving to the formatted start date string.
   */
  async getStartText(): Promise<string> {
    const month = await getInputValue(await this._startMonth());
    const day = await getInputValue(await this._startDay());
    const year = await getInputValue(await this._startYear());
    return `${month || 'MM'}/${day || 'DD'}/${year || 'YYYY'}`;
  }

  /**
   * Gets the end date display text as "MM/DD/YYYY".
   *
   * @returns Promise resolving to the formatted end date string.
   */
  async getEndText(): Promise<string> {
    const month = await getInputValue(await this._endMonth());
    const day = await getInputValue(await this._endDay());
    const year = await getInputValue(await this._endYear());
    return `${month || 'MM'}/${day || 'DD'}/${year || 'YYYY'}`;
  }

  /**
   * Sets the start date by typing into the segment inputs.
   *
   * @param date The start date to set.
   */
  async setStartDate(date: Date): Promise<void> {
    const { month, day, year } = formatDateParts(date);
    await setInputValue(await this._startMonth(), month);
    await setInputValue(await this._startDay(), day);
    await setInputValue(await this._startYear(), year);
  }

  /**
   * Sets the end date by typing into the segment inputs.
   *
   * @param date The end date to set.
   */
  async setEndDate(date: Date): Promise<void> {
    const { month, day, year } = formatDateParts(date);
    await setInputValue(await this._endMonth(), month);
    await setInputValue(await this._endDay(), day);
    await setInputValue(await this._endYear(), year);
  }

  /**
   * Clears both start and end date segments.
   */
  async clear(): Promise<void> {
    await setInputValue(await this._startMonth(), '');
    await setInputValue(await this._startDay(), '');
    await setInputValue(await this._startYear(), '');
    await setInputValue(await this._endMonth(), '');
    await setInputValue(await this._endDay(), '');
    await setInputValue(await this._endYear(), '');
  }

  /**
   * Checks whether the input is disabled.
   *
   * @returns Promise resolving to true if the input is disabled.
   */
  async isDisabled(): Promise<boolean> {
    const month = await this._startMonth();
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
}

/**
 * Filters for finding `TnDateRangeInputHarness` instances.
 */
export interface DateRangeInputHarnessFilters extends BaseHarnessFilters {}
