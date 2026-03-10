import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Harness for interacting with tn-tab in tests.
 * Provides methods for querying individual tab state and simulating selection.
 *
 * @example
 * ```typescript
 * // Find a tab by label
 * const tab = await loader.getHarness(TnTabHarness.with({ label: 'Settings' }));
 *
 * // Check if active
 * expect(await tab.isSelected()).toBe(false);
 *
 * // Select it
 * await tab.select();
 * expect(await tab.isSelected()).toBe(true);
 * ```
 */
export class TnTabHarness extends ComponentHarness {
  /**
   * The selector for the host element of a `TnTabComponent` instance.
   */
  static hostSelector = 'tn-tab';

  private _button = this.locatorFor('button[role="tab"]');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a tab
   * with specific attributes.
   *
   * @param options Options for filtering which tab instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   *
   * @example
   * ```typescript
   * // Find tab by exact label
   * const tab = await loader.getHarness(TnTabHarness.with({ label: 'Overview' }));
   *
   * // Find tab by regex
   * const tab = await loader.getHarness(TnTabHarness.with({ label: /settings/i }));
   * ```
   */
  static with(options: TabHarnessFilters = {}) {
    return new HarnessPredicate(TnTabHarness, options)
      .addOption('label', options.label, (harness, label) =>
        HarnessPredicate.stringMatches(harness.getLabel(), label)
      );
  }

  /**
   * Gets the tab's label text.
   *
   * @returns Promise resolving to the tab's label string.
   *
   * @example
   * ```typescript
   * const tab = await loader.getHarness(TnTabHarness);
   * expect(await tab.getLabel()).toBe('Overview');
   * ```
   */
  async getLabel(): Promise<string> {
    const labelEl = await this.locatorFor('.tn-tab__label')();
    return (await labelEl.text()).trim();
  }

  /**
   * Checks whether the tab is currently selected (active).
   *
   * @returns Promise resolving to true if the tab is selected.
   *
   * @example
   * ```typescript
   * const tab = await loader.getHarness(TnTabHarness.with({ label: 'Overview' }));
   * expect(await tab.isSelected()).toBe(true);
   * ```
   */
  async isSelected(): Promise<boolean> {
    const button = await this._button();
    return (await button.getAttribute('aria-selected')) === 'true';
  }

  /**
   * Checks whether the tab is disabled.
   *
   * @returns Promise resolving to true if the tab is disabled.
   *
   * @example
   * ```typescript
   * const tab = await loader.getHarness(TnTabHarness.with({ label: 'Disabled Tab' }));
   * expect(await tab.isDisabled()).toBe(true);
   * ```
   */
  async isDisabled(): Promise<boolean> {
    const button = await this._button();
    return (await button.getProperty<boolean>('disabled')) ?? false;
  }

  /**
   * Selects the tab by clicking it.
   *
   * @returns Promise that resolves when the tab has been clicked.
   *
   * @example
   * ```typescript
   * const tab = await loader.getHarness(TnTabHarness.with({ label: 'Settings' }));
   * await tab.select();
   * ```
   */
  async select(): Promise<void> {
    const button = await this._button();
    await button.click();
  }

  /**
   * Gets the tab's testId attribute value.
   *
   * @returns Promise resolving to the data-testid value, or null if not set.
   *
   * @example
   * ```typescript
   * const tab = await loader.getHarness(TnTabHarness);
   * expect(await tab.getTestId()).toBe('my-tab');
   * ```
   */
  async getTestId(): Promise<string | null> {
    const button = await this._button();
    return button.getAttribute('data-testid');
  }
}

/**
 * A set of criteria that can be used to filter a list of `TnTabHarness` instances.
 */
export interface TabHarnessFilters extends BaseHarnessFilters {
  /** Filters by tab label text. Supports string or regex matching. */
  label?: string | RegExp;
}
