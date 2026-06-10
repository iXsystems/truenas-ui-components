import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Harness for interacting with tn-button in tests.
 * Provides methods for querying button state and simulating user interactions.
 *
 * @example
 * ```typescript
 * // Find and click a button
 * const saveBtn = await loader.getHarness(TnButtonHarness.with({ label: 'Save' }));
 * await saveBtn.click();
 *
 * // Check if button is disabled
 * const submitBtn = await loader.getHarness(TnButtonHarness.with({ label: 'Submit' }));
 * expect(await submitBtn.isDisabled()).toBe(false);
 *
 * // Find button by regex
 * const cancelBtn = await loader.getHarness(TnButtonHarness.with({ label: /Cancel/i }));
 * ```
 */
export class TnButtonHarness extends ComponentHarness {
  /**
   * The selector for the host element of a `TnButtonComponent` instance.
   */
  static hostSelector = 'tn-button';

  private _button = this.locatorFor('button, a');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a button
   * with specific attributes.
   *
   * @param options Options for filtering which button instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   *
   * @example
   * ```typescript
   * // Find button by exact label
   * const button = await loader.getHarness(TnButtonHarness.with({ label: 'Save' }));
   *
   * // Find button with regex pattern
   * const button = await loader.getHarness(TnButtonHarness.with({ label: /Delete/i }));
   * ```
   */
  static with(options: ButtonHarnessFilters = {}) {
    return new HarnessPredicate(TnButtonHarness, options)
      .addOption('label', options.label, (harness, label) =>
        HarnessPredicate.stringMatches(harness.getLabel(), label)
      );
  }

  /**
   * Gets the button's label text.
   *
   * @returns Promise resolving to the button's text content.
   *
   * @example
   * ```typescript
   * const button = await loader.getHarness(TnButtonHarness);
   * const label = await button.getLabel();
   * expect(label).toBe('Submit');
   * ```
   */
  async getLabel(): Promise<string> {
    const button = await this._button();
    return (await button.text()).trim();
  }

  /**
   * Checks whether the button is disabled.
   *
   * @returns Promise resolving to true if the button is disabled.
   *
   * @example
   * ```typescript
   * const button = await loader.getHarness(TnButtonHarness.with({ label: 'Submit' }));
   * expect(await button.isDisabled()).toBe(false);
   * ```
   */
  async isDisabled(): Promise<boolean> {
    const button = await this._button();
    const tagName = (await button.getProperty<string>('tagName')).toLowerCase();
    if (tagName === 'a') {
      return (await button.getAttribute('aria-disabled')) === 'true';
    }
    return (await button.getProperty<boolean>('disabled')) ?? false;
  }

  /**
   * Gets the native `type` of the rendered `<button>` (`button`, `submit`, or
   * `reset`). Returns `null` for anchor-mode renders.
   *
   * @example
   * ```typescript
   * const saveBtn = await loader.getHarness(TnButtonHarness.with({ label: 'Save' }));
   * expect(await saveBtn.getType()).toBe('submit');
   * ```
   */
  async getType(): Promise<string | null> {
    const button = await this._button();
    const tagName = (await button.getProperty<string>('tagName')).toLowerCase();
    if (tagName !== 'button') {
      return null;
    }
    return button.getAttribute('type');
  }

  /**
   * Gets the resolved URL of the rendered element. Returns the `href` for
   * anchor-mode renders (both plain `href` and `routerLink`) and `null` for
   * button-mode renders.
   *
   * @example
   * ```typescript
   * const link = await loader.getHarness(TnButtonHarness.with({ label: 'Audit Settings' }));
   * expect(await link.getHref()).toContain('/audit/settings');
   * ```
   */
  async getHref(): Promise<string | null> {
    const button = await this._button();
    const tagName = (await button.getProperty<string>('tagName')).toLowerCase();
    if (tagName !== 'a') {
      return null;
    }
    return button.getAttribute('href');
  }

  /**
   * Clicks the button.
   *
   * @returns Promise that resolves when the click action is complete.
   *
   * @example
   * ```typescript
   * const button = await loader.getHarness(TnButtonHarness.with({ label: 'Save' }));
   * await button.click();
   * ```
   */
  async click(): Promise<void> {
    const button = await this._button();
    return button.click();
  }
}

/**
 * A set of criteria that can be used to filter a list of `TnButtonHarness` instances.
 */
export interface ButtonHarnessFilters extends BaseHarnessFilters {
  /** Filters by button label text. Supports string or regex matching. */
  label?: string | RegExp;
}
