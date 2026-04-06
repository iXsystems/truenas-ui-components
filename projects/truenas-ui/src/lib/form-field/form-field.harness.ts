import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Harness for interacting with `tn-form-field` in tests.
 * Provides methods for querying label, hint, error state, and accessing
 * the projected form control.
 *
 * @example
 * ```typescript
 * // Find a form field by label
 * const field = await loader.getHarness(TnFormFieldHarness.with({ label: 'Email' }));
 * expect(await field.getLabel()).toBe('Email');
 *
 * // Check for validation errors
 * expect(await field.hasError()).toBe(true);
 * expect(await field.getErrorMessage()).toBe('This field is required');
 *
 * // Check hint text
 * const hinted = await loader.getHarness(TnFormFieldHarness.with({ label: 'Port' }));
 * expect(await hinted.getHint()).toBe('Default port is 443');
 *
 * // Find by testId
 * const field = await loader.getHarness(TnFormFieldHarness.with({ testId: 'email-field' }));
 * ```
 */
export class TnFormFieldHarness extends ComponentHarness {
  /**
   * The selector for the host element of a `TnFormFieldComponent` instance.
   */
  static hostSelector = 'tn-form-field';

  private _label = this.locatorForOptional('.tn-form-field-label');
  private _error = this.locatorForOptional('.tn-form-field-error');
  private _hint = this.locatorForOptional('.tn-form-field-hint');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a form field
   * with specific attributes.
   *
   * @param options Options for filtering which form field instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   *
   * @example
   * ```typescript
   * // Find by label text
   * const field = await loader.getHarness(TnFormFieldHarness.with({ label: 'Name' }));
   *
   * // Find by label regex
   * const field = await loader.getHarness(TnFormFieldHarness.with({ label: /email/i }));
   *
   * // Find by testId
   * const field = await loader.getHarness(TnFormFieldHarness.with({ testId: 'name-field' }));
   * ```
   */
  static with(options: FormFieldHarnessFilters = {}) {
    return new HarnessPredicate(TnFormFieldHarness, options)
      .addOption('label', options.label, (harness, label) =>
        HarnessPredicate.stringMatches(harness.getLabel(), label)
      )
      .addOption('testId', options.testId, async (harness, testId) => {
        return (await harness.getTestId()) === testId;
      });
  }

  /**
   * Gets the form field label text.
   *
   * @returns Promise resolving to the label text, or empty string if no label.
   *
   * @example
   * ```typescript
   * const field = await loader.getHarness(TnFormFieldHarness.with({ label: 'Name' }));
   * expect(await field.getLabel()).toBe('Name');
   * ```
   */
  async getLabel(): Promise<string> {
    const label = await this._label();
    if (!label) { return ''; }
    const text = await label.text();
    // Strip the required asterisk from the label text
    return text.replace(/\s*\*\s*$/, '').trim();
  }

  /**
   * Gets the error message text, if visible.
   *
   * @returns Promise resolving to the error message, or null if no error is shown.
   *
   * @example
   * ```typescript
   * const field = await loader.getHarness(TnFormFieldHarness.with({ label: 'Email' }));
   * expect(await field.getErrorMessage()).toBe('Please enter a valid email address');
   * ```
   */
  async getErrorMessage(): Promise<string | null> {
    const error = await this._error();
    return error ? (await error.text()).trim() : null;
  }

  /**
   * Checks whether the form field is currently showing an error.
   *
   * @returns Promise resolving to true if an error message is visible.
   *
   * @example
   * ```typescript
   * const field = await loader.getHarness(TnFormFieldHarness.with({ label: 'Email' }));
   * expect(await field.hasError()).toBe(true);
   * ```
   */
  async hasError(): Promise<boolean> {
    const error = await this._error();
    return error !== null;
  }

  /**
   * Gets the hint text, if visible.
   *
   * @returns Promise resolving to the hint text, or null if no hint is shown.
   *
   * @example
   * ```typescript
   * const field = await loader.getHarness(TnFormFieldHarness.with({ label: 'Port' }));
   * expect(await field.getHint()).toBe('Default port is 443');
   * ```
   */
  async getHint(): Promise<string | null> {
    const hint = await this._hint();
    return hint ? (await hint.text()).trim() : null;
  }

  /**
   * Checks whether the form field is marked as required.
   *
   * @returns Promise resolving to true if the required asterisk is present.
   *
   * @example
   * ```typescript
   * const field = await loader.getHarness(TnFormFieldHarness.with({ label: 'Name' }));
   * expect(await field.isRequired()).toBe(true);
   * ```
   */
  async isRequired(): Promise<boolean> {
    const label = await this._label();
    if (!label) { return false; }
    return label.hasClass('required');
  }

  /**
   * Gets the test ID attribute value.
   *
   * @returns Promise resolving to the data-testid string, or null.
   *
   * @example
   * ```typescript
   * const field = await loader.getHarness(TnFormFieldHarness);
   * expect(await field.getTestId()).toBe('email-field');
   * ```
   */
  async getTestId(): Promise<string | null> {
    const root = await this.locatorFor('.tn-form-field')();
    return root.getAttribute('data-testid');
  }
}

/**
 * A set of criteria that can be used to filter a list of `TnFormFieldHarness` instances.
 */
export interface FormFieldHarnessFilters extends BaseHarnessFilters {
  /** Filters by label text. Supports string or regex matching. */
  label?: string | RegExp;
  /** Filters by data-testid attribute. */
  testId?: string;
}
