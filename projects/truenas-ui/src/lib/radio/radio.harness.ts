import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Harness for interacting with `tn-radio` in tests.
 * Provides methods for selecting and querying radio button state.
 *
 * @example
 * ```typescript
 * // Find and select a radio button
 * const radio = await loader.getHarness(TnRadioHarness.with({ label: 'Option A' }));
 * await radio.check();
 * expect(await radio.isChecked()).toBe(true);
 *
 * // Find by testId
 * const option = await loader.getHarness(TnRadioHarness.with({ testId: 'color-red' }));
 * ```
 */
export class TnRadioHarness extends ComponentHarness {
  /**
   * The selector for the host element of a `TnRadioComponent` instance.
   */
  static hostSelector = 'tn-radio';

  private _input = this.locatorFor('.tn-radio__input');
  private _label = this.locatorFor('.tn-radio__label');
  private _text = this.locatorFor('.tn-radio__text');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a radio button
   * with specific attributes.
   *
   * @param options Options for filtering which radio instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   *
   * @example
   * ```typescript
   * // Find by label text
   * const radio = await loader.getHarness(TnRadioHarness.with({ label: 'Option A' }));
   *
   * // Find by label regex
   * const radio = await loader.getHarness(TnRadioHarness.with({ label: /option/i }));
   *
   * // Find by testId
   * const radio = await loader.getHarness(TnRadioHarness.with({ testId: 'my-radio' }));
   * ```
   */
  static with(options: RadioHarnessFilters = {}) {
    return new HarnessPredicate(TnRadioHarness, options)
      .addOption('label', options.label, (harness, label) =>
        HarnessPredicate.stringMatches(harness.getLabelText(), label)
      )
      .addOption('testId', options.testId, async (harness, testId) => {
        return (await harness.getTestId()) === testId;
      });
  }

  /**
   * Gets the radio button label text content.
   *
   * @returns Promise resolving to the label text.
   *
   * @example
   * ```typescript
   * const radio = await loader.getHarness(TnRadioHarness);
   * expect(await radio.getLabelText()).toBe('Option A');
   * ```
   */
  async getLabelText(): Promise<string> {
    const text = await this._text();
    return (await text.text()).trim();
  }

  /**
   * Checks whether the radio button is currently checked.
   *
   * @returns Promise resolving to true if the radio button is checked.
   *
   * @example
   * ```typescript
   * const radio = await loader.getHarness(TnRadioHarness);
   * expect(await radio.isChecked()).toBe(false);
   * ```
   */
  async isChecked(): Promise<boolean> {
    const input = await this._input();
    return (await input.getProperty<boolean>('checked')) ?? false;
  }

  /**
   * Checks whether the radio button is disabled.
   *
   * @returns Promise resolving to true if the radio button is disabled.
   *
   * @example
   * ```typescript
   * const radio = await loader.getHarness(TnRadioHarness);
   * expect(await radio.isDisabled()).toBe(false);
   * ```
   */
  async isDisabled(): Promise<boolean> {
    const input = await this._input();
    return (await input.getProperty<boolean>('disabled')) ?? false;
  }

  /**
   * Gets the test ID attribute value.
   *
   * @returns Promise resolving to the test ID string, or null.
   *
   * @example
   * ```typescript
   * const radio = await loader.getHarness(TnRadioHarness);
   * expect(await radio.getTestId()).toBe('color-red');
   * ```
   */
  async getTestId(): Promise<string | null> {
    const input = await this._input();
    return input.getAttribute('data-testid');
  }

  /**
   * Selects the radio button by clicking the label. No-op if already checked.
   *
   * @example
   * ```typescript
   * const radio = await loader.getHarness(TnRadioHarness);
   * await radio.check();
   * expect(await radio.isChecked()).toBe(true);
   * ```
   */
  async check(): Promise<void> {
    if (!(await this.isChecked())) {
      const label = await this._label();
      await label.click();
    }
  }
}

/**
 * A set of criteria that can be used to filter a list of `TnRadioHarness` instances.
 */
export interface RadioHarnessFilters extends BaseHarnessFilters {
  /** Filters by label text. Supports string or regex matching. */
  label?: string | RegExp;
  /** Filters by data-testid attribute. */
  testId?: string;
}
