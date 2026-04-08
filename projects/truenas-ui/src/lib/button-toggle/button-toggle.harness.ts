import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Harness for interacting with `tn-button-toggle` in tests.
 * Provides methods for toggling, checking, unchecking, and querying toggle state.
 *
 * @example
 * ```typescript
 * // Find and check a button toggle
 * const toggle = await loader.getHarness(TnButtonToggleHarness.with({ label: 'Bold' }));
 * await toggle.check();
 * expect(await toggle.isChecked()).toBe(true);
 *
 * // Toggle state
 * await toggle.toggle();
 * expect(await toggle.isChecked()).toBe(false);
 * ```
 */
export class TnButtonToggleHarness extends ComponentHarness {
  /**
   * The selector for the host element of a `TnButtonToggleComponent` instance.
   */
  static hostSelector = 'tn-button-toggle';

  private _button = this.locatorFor('.tn-button-toggle__button');
  private _label = this.locatorFor('.tn-button-toggle__label');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a button toggle
   * with specific attributes.
   *
   * @param options Options for filtering which toggle instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   *
   * @example
   * ```typescript
   * // Find by label text
   * const toggle = await loader.getHarness(TnButtonToggleHarness.with({ label: 'Bold' }));
   *
   * // Find by label regex
   * const toggle = await loader.getHarness(TnButtonToggleHarness.with({ label: /bold/i }));
   * ```
   */
  static with(options: ButtonToggleHarnessFilters = {}) {
    return new HarnessPredicate(TnButtonToggleHarness, options)
      .addOption('label', options.label, (harness, label) =>
        HarnessPredicate.stringMatches(harness.getLabelText(), label)
      );
  }

  /**
   * Gets the button toggle label text content.
   *
   * @returns Promise resolving to the label text.
   *
   * @example
   * ```typescript
   * const toggle = await loader.getHarness(TnButtonToggleHarness);
   * expect(await toggle.getLabelText()).toBe('Bold');
   * ```
   */
  async getLabelText(): Promise<string> {
    const label = await this._label();
    return (await label.text()).trim();
  }

  /**
   * Checks whether the button toggle is currently checked.
   *
   * @returns Promise resolving to true if the toggle is checked.
   *
   * @example
   * ```typescript
   * const toggle = await loader.getHarness(TnButtonToggleHarness);
   * expect(await toggle.isChecked()).toBe(false);
   * ```
   */
  async isChecked(): Promise<boolean> {
    const button = await this._button();
    return (await button.getAttribute('aria-pressed')) === 'true';
  }

  /**
   * Checks whether the button toggle is disabled.
   *
   * @returns Promise resolving to true if the toggle is disabled.
   *
   * @example
   * ```typescript
   * const toggle = await loader.getHarness(TnButtonToggleHarness);
   * expect(await toggle.isDisabled()).toBe(false);
   * ```
   */
  async isDisabled(): Promise<boolean> {
    const button = await this._button();
    return (await button.getProperty<boolean>('disabled')) ?? false;
  }

  /**
   * Toggles the button toggle by clicking it.
   *
   * @example
   * ```typescript
   * const toggle = await loader.getHarness(TnButtonToggleHarness);
   * await toggle.toggle();
   * ```
   */
  async toggle(): Promise<void> {
    const button = await this._button();
    await button.click();
  }

  /**
   * Checks the button toggle. No-op if already checked.
   *
   * @example
   * ```typescript
   * const toggle = await loader.getHarness(TnButtonToggleHarness);
   * await toggle.check();
   * expect(await toggle.isChecked()).toBe(true);
   * ```
   */
  async check(): Promise<void> {
    if (!(await this.isChecked())) {
      await this.toggle();
    }
  }

  /**
   * Unchecks the button toggle. No-op if already unchecked.
   *
   * @example
   * ```typescript
   * const toggle = await loader.getHarness(TnButtonToggleHarness);
   * await toggle.uncheck();
   * expect(await toggle.isChecked()).toBe(false);
   * ```
   */
  async uncheck(): Promise<void> {
    if (await this.isChecked()) {
      await this.toggle();
    }
  }
}

/**
 * Harness for interacting with `tn-button-toggle-group` in tests.
 * Provides methods for querying the group's toggles and finding checked toggles.
 *
 * @example
 * ```typescript
 * const group = await loader.getHarness(TnButtonToggleGroupHarness);
 * const toggles = await group.getToggles();
 * expect(toggles.length).toBe(3);
 *
 * const checked = await group.getCheckedToggle();
 * expect(await checked?.getLabelText()).toBe('Option A');
 * ```
 */
export class TnButtonToggleGroupHarness extends ComponentHarness {
  /**
   * The selector for the host element of a `TnButtonToggleGroupComponent` instance.
   */
  static hostSelector = 'tn-button-toggle-group';

  /**
   * Gets all toggle harnesses within this group.
   *
   * @returns Promise resolving to an array of `TnButtonToggleHarness` instances.
   *
   * @example
   * ```typescript
   * const group = await loader.getHarness(TnButtonToggleGroupHarness);
   * const toggles = await group.getToggles();
   * expect(toggles.length).toBe(3);
   * ```
   */
  async getToggles(): Promise<TnButtonToggleHarness[]> {
    return this.locatorForAll(TnButtonToggleHarness)();
  }

  /**
   * Gets the currently checked toggle, or null if none is checked.
   *
   * @returns Promise resolving to the checked `TnButtonToggleHarness`, or null.
   *
   * @example
   * ```typescript
   * const group = await loader.getHarness(TnButtonToggleGroupHarness);
   * const checked = await group.getCheckedToggle();
   * expect(await checked?.getLabelText()).toBe('Option A');
   * ```
   */
  async getCheckedToggle(): Promise<TnButtonToggleHarness | null> {
    const toggles = await this.getToggles();
    for (const toggle of toggles) {
      if (await toggle.isChecked()) {
        return toggle;
      }
    }
    return null;
  }
}

/**
 * A set of criteria that can be used to filter a list of `TnButtonToggleHarness` instances.
 */
export interface ButtonToggleHarnessFilters extends BaseHarnessFilters {
  /** Filters by label text. Supports string or regex matching. */
  label?: string | RegExp;
}
