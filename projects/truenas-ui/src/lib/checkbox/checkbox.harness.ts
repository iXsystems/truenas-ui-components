import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Harness for interacting with tn-checkbox in tests.
 * Provides methods for checking, unchecking, and querying checkbox state.
 *
 * @example
 * ```typescript
 * // Find and check a checkbox
 * const checkbox = await loader.getHarness(TnCheckboxHarness.with({ label: 'Accept terms' }));
 * await checkbox.check();
 * expect(await checkbox.isChecked()).toBe(true);
 *
 * // Toggle a checkbox
 * await checkbox.toggle();
 * expect(await checkbox.isChecked()).toBe(false);
 *
 * // Find by testId
 * const terms = await loader.getHarness(TnCheckboxHarness.with({ testId: 'terms-checkbox' }));
 * ```
 */
export class TnCheckboxHarness extends ComponentHarness {
  /**
   * The selector for the host element of a `TnCheckboxComponent` instance.
   */
  static hostSelector = 'tn-checkbox';

  private _input = this.locatorFor('.tn-checkbox__input');
  private _label = this.locatorFor('.tn-checkbox__label');
  private _text = this.locatorForOptional('.tn-checkbox__text');
  private _error = this.locatorForOptional('.tn-checkbox__error');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a checkbox
   * with specific attributes.
   *
   * @param options Options for filtering which checkbox instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   *
   * @example
   * ```typescript
   * // Find by label text
   * const checkbox = await loader.getHarness(TnCheckboxHarness.with({ label: 'Accept' }));
   *
   * // Find by label regex
   * const checkbox = await loader.getHarness(TnCheckboxHarness.with({ label: /terms/i }));
   *
   * // Find by testId
   * const checkbox = await loader.getHarness(TnCheckboxHarness.with({ testId: 'my-checkbox' }));
   * ```
   */
  static with(options: CheckboxHarnessFilters = {}) {
    return new HarnessPredicate(TnCheckboxHarness, options)
      .addOption('label', options.label, (harness, label) =>
        HarnessPredicate.stringMatches(harness.getLabelText(), label)
      )
      .addOption('testId', options.testId, async (harness, testId) => {
        return (await harness.getTestId()) === testId;
      });
  }

  /**
   * Gets the checkbox label text content.
   *
   * @returns Promise resolving to the label text.
   *
   * @example
   * ```typescript
   * const checkbox = await loader.getHarness(TnCheckboxHarness);
   * expect(await checkbox.getLabelText()).toBe('Accept terms');
   * ```
   */
  async getLabelText(): Promise<string> {
    const text = await this._text();
    return text ? (await text.text()).trim() : '';
  }

  /**
   * Checks whether the checkbox is currently checked.
   *
   * @returns Promise resolving to true if the checkbox is checked.
   *
   * @example
   * ```typescript
   * const checkbox = await loader.getHarness(TnCheckboxHarness);
   * expect(await checkbox.isChecked()).toBe(false);
   * ```
   */
  async isChecked(): Promise<boolean> {
    const input = await this._input();
    return (await input.getProperty<boolean>('checked')) ?? false;
  }

  /**
   * Checks whether the checkbox is disabled.
   *
   * @returns Promise resolving to true if the checkbox is disabled.
   *
   * @example
   * ```typescript
   * const checkbox = await loader.getHarness(TnCheckboxHarness);
   * expect(await checkbox.isDisabled()).toBe(false);
   * ```
   */
  async isDisabled(): Promise<boolean> {
    const input = await this._input();
    return (await input.getProperty<boolean>('disabled')) ?? false;
  }

  /**
   * Checks whether the checkbox is required.
   *
   * @returns Promise resolving to true if the checkbox is required.
   *
   * @example
   * ```typescript
   * const checkbox = await loader.getHarness(TnCheckboxHarness);
   * expect(await checkbox.isRequired()).toBe(true);
   * ```
   */
  async isRequired(): Promise<boolean> {
    const input = await this._input();
    return (await input.getProperty<boolean>('required')) ?? false;
  }

  /**
   * Checks whether the checkbox is in the indeterminate state.
   *
   * @returns Promise resolving to true if the checkbox is indeterminate.
   *
   * @example
   * ```typescript
   * const checkbox = await loader.getHarness(TnCheckboxHarness);
   * expect(await checkbox.isIndeterminate()).toBe(false);
   * ```
   */
  async isIndeterminate(): Promise<boolean> {
    const input = await this._input();
    return (await input.getProperty<boolean>('indeterminate')) ?? false;
  }

  /**
   * Gets the test ID attribute value.
   *
   * @returns Promise resolving to the test ID string, or null.
   *
   * @example
   * ```typescript
   * const checkbox = await loader.getHarness(TnCheckboxHarness);
   * expect(await checkbox.getTestId()).toBe('terms-checkbox');
   * ```
   */
  async getTestId(): Promise<string | null> {
    const input = await this._input();
    return input.getAttribute('data-testid');
  }

  /**
   * Gets the error message text, if any.
   *
   * @returns Promise resolving to the error message, or null if none.
   *
   * @example
   * ```typescript
   * const checkbox = await loader.getHarness(TnCheckboxHarness);
   * expect(await checkbox.getErrorText()).toBe('You must accept the terms');
   * ```
   */
  async getErrorText(): Promise<string | null> {
    const error = await this._error();
    return error ? (await error.text()).trim() : null;
  }

  /**
   * Checks the checkbox. No-op if already checked.
   *
   * @example
   * ```typescript
   * const checkbox = await loader.getHarness(TnCheckboxHarness);
   * await checkbox.check();
   * expect(await checkbox.isChecked()).toBe(true);
   * ```
   */
  async check(): Promise<void> {
    if (!(await this.isChecked())) {
      await this.toggle();
    }
  }

  /**
   * Unchecks the checkbox. No-op if already unchecked.
   *
   * @example
   * ```typescript
   * const checkbox = await loader.getHarness(TnCheckboxHarness);
   * await checkbox.uncheck();
   * expect(await checkbox.isChecked()).toBe(false);
   * ```
   */
  async uncheck(): Promise<void> {
    if (await this.isChecked()) {
      await this.toggle();
    }
  }

  /**
   * Toggles the checkbox checked state by clicking the label.
   *
   * @example
   * ```typescript
   * const checkbox = await loader.getHarness(TnCheckboxHarness);
   * await checkbox.toggle();
   * ```
   */
  async toggle(): Promise<void> {
    const label = await this._label();
    await label.click();
  }
}

/**
 * A set of criteria that can be used to filter a list of `TnCheckboxHarness` instances.
 */
export interface CheckboxHarnessFilters extends BaseHarnessFilters {
  /** Filters by label text. Supports string or regex matching. */
  label?: string | RegExp;
  /** Filters by data-testid attribute. */
  testId?: string;
}
