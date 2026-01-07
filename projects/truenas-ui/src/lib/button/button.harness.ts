import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Harness for interacting with tn-button in tests.
 * Provides methods for clicking, checking disabled state, and querying button properties.
 *
 * @example
 * ```typescript
 * // Get a button by text
 * const button = await loader.getHarness(
 *   TnButtonHarness.with({ text: 'Submit' })
 * );
 *
 * // Click the button
 * await button.click();
 *
 * // Check if button is disabled
 * const isDisabled = await button.isDisabled();
 *
 * // Get button color
 * const color = await button.getColor();
 * ```
 */
export class TnButtonHarness extends ComponentHarness {
  /**
   * The selector for the host element of a `TnButtonComponent` instance.
   */
  static hostSelector = 'tn-button';

  /**
   * Gets a `HarnessPredicate` that can be used to search for button instances.
   *
   * @param options Options for filtering which button instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   *
   * @example
   * ```typescript
   * // Find button with specific text
   * const button = await loader.getHarness(
   *   TnButtonHarness.with({ text: 'Submit' })
   * );
   *
   * // Find enabled buttons only
   * const enabledButton = await loader.getHarness(
   *   TnButtonHarness.with({ disabled: false })
   * );
   *
   * // Find button with regex pattern
   * const button = await loader.getHarness(
   *   TnButtonHarness.with({ text: /Save/ })
   * );
   * ```
   */
  static with(options: ButtonHarnessFilters = {}) {
    return new HarnessPredicate(TnButtonHarness, options)
      .addOption('text', options.text, (harness, text) =>
        HarnessPredicate.stringMatches(harness.getText(), text)
      )
      .addOption('disabled', options.disabled, async (harness, disabled) => {
        return (await harness.isDisabled()) === disabled;
      });
  }

  /**
   * Gets the text content of the button.
   *
   * @returns Promise resolving to the button's text content.
   *
   * @example
   * ```typescript
   * const button = await loader.getHarness(TnButtonHarness);
   * const text = await button.getText();
   * expect(text).toBe('Submit');
   * ```
   */
  async getText(): Promise<string> {
    const host = await this.host();
    return (await host.text()).trim();
  }

  /**
   * Clicks the button.
   *
   * @returns Promise that resolves when the click action is complete.
   *
   * @example
   * ```typescript
   * const button = await loader.getHarness(TnButtonHarness);
   * await button.click();
   * ```
   */
  async click(): Promise<void> {
    const host = await this.host();
    return await host.click();
  }

  /**
   * Gets whether the button is disabled.
   *
   * @returns Promise resolving to true if the button is disabled.
   *
   * @example
   * ```typescript
   * const button = await loader.getHarness(TnButtonHarness);
   * const isDisabled = await button.isDisabled();
   * expect(isDisabled).toBe(false);
   * ```
   */
  async isDisabled(): Promise<boolean> {
    const innerButton = await this.locatorFor('button')();
    return (await innerButton.getAttribute('disabled')) !== null;
  }

  /**
   * Gets the button's color variant.
   *
   * @returns Promise resolving to the button's color ('primary', 'secondary', 'warn', or 'default').
   *
   * @example
   * ```typescript
   * const button = await loader.getHarness(TnButtonHarness);
   * const color = await button.getColor();
   * expect(color).toBe('primary');
   * ```
   */
  async getColor(): Promise<'primary' | 'secondary' | 'warn' | 'default'> {
    const innerButton = await this.locatorFor('button')();
    const classList = await innerButton.getAttribute('class');

    if (classList?.includes('button-primary') || classList?.includes('button-outline-primary')) {
      return 'primary';
    }
    if (classList?.includes('button-warn') || classList?.includes('button-outline-warn')) {
      return 'warn';
    }
    if (classList?.includes('button-secondary') || classList?.includes('button-outline-secondary')) {
      return 'secondary';
    }
    return 'default';
  }

  /**
   * Gets the button's variant (filled or outline).
   *
   * @returns Promise resolving to the button's variant.
   *
   * @example
   * ```typescript
   * const button = await loader.getHarness(TnButtonHarness);
   * const variant = await button.getVariant();
   * expect(variant).toBe('filled');
   * ```
   */
  async getVariant(): Promise<'filled' | 'outline'> {
    const innerButton = await this.locatorFor('button')();
    const classList = await innerButton.getAttribute('class');

    return classList?.includes('button-outline') ? 'outline' : 'filled';
  }
}

/**
 * A set of criteria that can be used to filter a list of `TnButtonHarness` instances.
 */
export interface ButtonHarnessFilters extends BaseHarnessFilters {
  /** Filters by button text content. Supports string or regex matching. */
  text?: string | RegExp;

  /** Filters by disabled state. */
  disabled?: boolean;
}
