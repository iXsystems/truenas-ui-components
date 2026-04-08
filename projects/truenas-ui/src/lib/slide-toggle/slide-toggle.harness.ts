import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Harness for interacting with `tn-slide-toggle` in tests.
 *
 * @example
 * ```typescript
 * const toggle = await loader.getHarness(
 *   TnSlideToggleHarness.with({ label: 'Enable notifications' })
 * );
 * await toggle.toggle();
 * expect(await toggle.isChecked()).toBe(true);
 * ```
 */
export class TnSlideToggleHarness extends ComponentHarness {
  static hostSelector = 'tn-slide-toggle';

  private _input = this.locatorFor('.tn-slide-toggle__input');
  private _label = this.locatorForOptional('.tn-slide-toggle__label-text');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a slide toggle
   * with specific attributes.
   */
  static with(options: SlideToggleHarnessFilters = {}) {
    return new HarnessPredicate(TnSlideToggleHarness, options)
      .addOption('label', options.label, (harness, label) =>
        HarnessPredicate.stringMatches(harness.getLabelText(), label)
      )
      .addOption('testId', options.testId, async (harness, testId) => {
        return (await harness.getTestId()) === testId;
      });
  }

  /**
   * Gets the label text of the slide toggle.
   *
   * @example
   * ```typescript
   * expect(await toggle.getLabelText()).toBe('Enable notifications');
   * ```
   */
  async getLabelText(): Promise<string> {
    const label = await this._label();
    return label ? (await label.text()).trim() : '';
  }

  /**
   * Checks whether the slide toggle is currently checked.
   *
   * @example
   * ```typescript
   * expect(await toggle.isChecked()).toBe(false);
   * ```
   */
  async isChecked(): Promise<boolean> {
    const input = await this._input();
    return (await input.getProperty<boolean>('checked')) ?? false;
  }

  /**
   * Checks whether the slide toggle is disabled.
   */
  async isDisabled(): Promise<boolean> {
    const input = await this._input();
    return (await input.getProperty<boolean>('disabled')) ?? false;
  }

  /**
   * Checks whether the slide toggle is required.
   */
  async isRequired(): Promise<boolean> {
    const input = await this._input();
    return (await input.getProperty<boolean>('required')) ?? false;
  }

  /**
   * Gets the test ID attribute value.
   */
  async getTestId(): Promise<string | null> {
    const root = await this.locatorFor('.tn-slide-toggle')();
    return root.getAttribute('data-testid');
  }

  /**
   * Toggles the slide toggle by clicking the input element.
   *
   * @example
   * ```typescript
   * await toggle.toggle();
   * ```
   */
  async toggle(): Promise<void> {
    const input = await this._input();
    await input.click();
  }

  /**
   * Checks the slide toggle. No-op if already checked.
   */
  async check(): Promise<void> {
    if (!(await this.isChecked())) {
      await this.toggle();
    }
  }

  /**
   * Unchecks the slide toggle. No-op if already unchecked.
   */
  async uncheck(): Promise<void> {
    if (await this.isChecked()) {
      await this.toggle();
    }
  }
}

/**
 * Filters for finding `TnSlideToggleHarness` instances.
 */
export interface SlideToggleHarnessFilters extends BaseHarnessFilters {
  /** Filters by label text. Supports string or regex matching. */
  label?: string | RegExp;
  /** Filters by data-testid attribute. */
  testId?: string;
}
