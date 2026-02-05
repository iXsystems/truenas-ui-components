import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Harness for interacting with tn-select in tests.
 * Provides methods for querying select state, opening/closing the dropdown,
 * and selecting options.
 *
 * @example
 * ```typescript
 * // Find a select and choose an option
 * const select = await loader.getHarness(TnSelectHarness);
 * await select.selectOption('Option 2');
 *
 * // Check the displayed text
 * expect(await select.getDisplayText()).toBe('Option 2');
 *
 * // Filter by displayed text
 * const fruitSelect = await loader.getHarness(
 *   TnSelectHarness.with({ displayText: /Apple/i })
 * );
 *
 * // Check disabled state
 * const disabledSelect = await loader.getHarness(TnSelectHarness);
 * expect(await disabledSelect.isDisabled()).toBe(true);
 * ```
 */
export class TnSelectHarness extends ComponentHarness {
  /**
   * The selector for the host element of a `TnSelectComponent` instance.
   */
  static hostSelector = 'tn-select';

  private _trigger = this.locatorFor('.tn-select-trigger');
  private _text = this.locatorFor('.tn-select-text');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a select
   * with specific attributes.
   *
   * @param options Options for filtering which select instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   *
   * @example
   * ```typescript
   * // Find select by exact display text
   * const select = await loader.getHarness(TnSelectHarness.with({ displayText: 'Apple' }));
   *
   * // Find select by regex pattern
   * const select = await loader.getHarness(TnSelectHarness.with({ displayText: /Option/i }));
   * ```
   */
  static with(options: SelectHarnessFilters = {}) {
    return new HarnessPredicate(TnSelectHarness, options)
      .addOption('displayText', options.displayText, (harness, text) =>
        HarnessPredicate.stringMatches(harness.getDisplayText(), text)
      );
  }

  /**
   * Gets the currently displayed text (selected label or placeholder).
   *
   * @returns Promise resolving to the display text content.
   *
   * @example
   * ```typescript
   * const select = await loader.getHarness(TnSelectHarness);
   * const text = await select.getDisplayText();
   * expect(text).toBe('Select an option');
   * ```
   */
  async getDisplayText(): Promise<string> {
    const text = await this._text();
    return (await text.text()).trim();
  }

  /**
   * Checks whether the select is disabled.
   *
   * @returns Promise resolving to true if the select trigger has the disabled class.
   *
   * @example
   * ```typescript
   * const select = await loader.getHarness(TnSelectHarness);
   * expect(await select.isDisabled()).toBe(false);
   * ```
   */
  async isDisabled(): Promise<boolean> {
    const trigger = await this._trigger();
    return trigger.hasClass('disabled');
  }

  /**
   * Checks whether the dropdown is currently open.
   *
   * @returns Promise resolving to true if the dropdown is open.
   *
   * @example
   * ```typescript
   * const select = await loader.getHarness(TnSelectHarness);
   * expect(await select.isOpen()).toBe(false);
   * await select.open();
   * expect(await select.isOpen()).toBe(true);
   * ```
   */
  async isOpen(): Promise<boolean> {
    const trigger = await this._trigger();
    return trigger.hasClass('open');
  }

  /**
   * Opens the dropdown. No-op if already open.
   *
   * @returns Promise that resolves when the dropdown is open.
   *
   * @example
   * ```typescript
   * const select = await loader.getHarness(TnSelectHarness);
   * await select.open();
   * ```
   */
  async open(): Promise<void> {
    if (!(await this.isOpen())) {
      const trigger = await this._trigger();
      await trigger.click();
    }
  }

  /**
   * Closes the dropdown. No-op if already closed.
   *
   * @returns Promise that resolves when the dropdown is closed.
   *
   * @example
   * ```typescript
   * const select = await loader.getHarness(TnSelectHarness);
   * await select.open();
   * await select.close();
   * expect(await select.isOpen()).toBe(false);
   * ```
   */
  async close(): Promise<void> {
    if (await this.isOpen()) {
      const trigger = await this._trigger();
      await trigger.click();
    }
  }

  /**
   * Selects an option by its label text. Opens the dropdown if needed.
   *
   * @param filter The text to match against option labels. Supports string or RegExp.
   * @returns Promise that resolves when the option has been selected.
   *
   * @example
   * ```typescript
   * const select = await loader.getHarness(TnSelectHarness);
   *
   * // Select by exact text
   * await select.selectOption('Option 2');
   *
   * // Select by regex
   * await select.selectOption(/option 2/i);
   * ```
   */
  async selectOption(filter: string | RegExp): Promise<void> {
    await this.open();
    const options = await this.locatorForAll('.tn-select-option')();

    for (const option of options) {
      const text = (await option.text()).trim();
      const matches = filter instanceof RegExp
        ? filter.test(text)
        : text === filter;

      if (matches) {
        await option.click();
        return;
      }
    }

    throw new Error(`Could not find option matching "${filter}"`);
  }

  /**
   * Gets the labels of all available options. Opens the dropdown if needed.
   *
   * @returns Promise resolving to an array of option label strings.
   *
   * @example
   * ```typescript
   * const select = await loader.getHarness(TnSelectHarness);
   * const options = await select.getOptions();
   * expect(options).toEqual(['Option 1', 'Option 2', 'Option 3']);
   * ```
   */
  async getOptions(): Promise<string[]> {
    await this.open();
    const options = await this.locatorForAll('.tn-select-option')();
    const labels: string[] = [];

    for (const option of options) {
      labels.push((await option.text()).trim());
    }

    return labels;
  }
}

/**
 * A set of criteria that can be used to filter a list of `TnSelectHarness` instances.
 */
export interface SelectHarnessFilters extends BaseHarnessFilters {
  /** Filters by displayed text (selected label or placeholder). Supports string or regex matching. */
  displayText?: string | RegExp;
}
