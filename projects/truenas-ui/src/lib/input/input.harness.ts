import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { TnIconHarness } from '../icon/icon.harness';

/**
 * Harness for interacting with tn-input in tests.
 * Provides methods for querying state, setting values, and interacting with prefix/suffix icons.
 *
 * @example
 * ```typescript
 * // Get the input harness
 * const input = await loader.getHarness(TnInputHarness);
 *
 * // Set and read a value
 * await input.setValue('hello');
 * expect(await input.getValue()).toBe('hello');
 *
 * // Check for prefix icon
 * expect(await input.hasPrefixIcon()).toBe(true);
 *
 * // Click suffix action
 * await input.clickSuffixAction();
 * ```
 */
export class TnInputHarness extends ComponentHarness {
  /**
   * The selector for the host element of a `TnInputComponent` instance.
   */
  static hostSelector = 'tn-input';

  private inputEl = this.locatorFor('input.tn-input');
  private textareaEl = this.locatorFor('textarea.tn-input');
  private prefixIconEl = this.locatorForOptional('tn-icon.tn-input__prefix-icon');
  private suffixButton = this.locatorForOptional('.tn-input__suffix-action');
  private suffixIconEl = this.locatorForOptional(TnIconHarness.with({ ancestor: '.tn-input__suffix-action' }));

  /**
   * Gets a `HarnessPredicate` that can be used to search for an input
   * with specific attributes.
   *
   * @param options Options for filtering which input instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   */
  static with(options: InputHarnessFilters = {}) {
    return new HarnessPredicate(TnInputHarness, options)
      .addOption('placeholder', options.placeholder, async (harness, placeholder) => {
        return (await harness.getPlaceholder()) === placeholder;
      });
  }

  /**
   * Gets the current value of the input.
   *
   * @returns Promise resolving to the input value.
   */
  async getValue(): Promise<string> {
    if (await this.isMultiline()) {
      const textarea = await this.textareaEl();
      return (await textarea.getProperty<string>('value')) ?? '';
    }
    const input = await this.inputEl();
    return (await input.getProperty<string>('value')) ?? '';
  }

  /**
   * Sets the value of the input by clearing and typing.
   *
   * @param value The value to set.
   */
  async setValue(value: string): Promise<void> {
    if (await this.isMultiline()) {
      const textarea = await this.textareaEl();
      await textarea.clear();
      await textarea.sendKeys(value);
      return;
    }
    const input = await this.inputEl();
    await input.clear();
    await input.sendKeys(value);
  }

  /**
   * Gets the placeholder text.
   *
   * @returns Promise resolving to the placeholder string.
   */
  async getPlaceholder(): Promise<string | null> {
    if (await this.isMultiline()) {
      const textarea = await this.textareaEl();
      return textarea.getAttribute('placeholder');
    }
    const input = await this.inputEl();
    return input.getAttribute('placeholder');
  }

  /**
   * Checks whether the input is disabled.
   *
   * @returns Promise resolving to true if the input is disabled.
   */
  async isDisabled(): Promise<boolean> {
    if (await this.isMultiline()) {
      const textarea = await this.textareaEl();
      return (await textarea.getProperty<boolean>('disabled')) ?? false;
    }
    const input = await this.inputEl();
    return (await input.getProperty<boolean>('disabled')) ?? false;
  }

  /**
   * Checks whether the input renders as a textarea.
   *
   * @returns Promise resolving to true if multiline.
   */
  async isMultiline(): Promise<boolean> {
    const textareas = await this.locatorForAll('textarea.tn-input')();
    return textareas.length > 0;
  }

  /**
   * Checks whether a prefix icon is present.
   *
   * @returns Promise resolving to true if a prefix icon exists.
   */
  async hasPrefixIcon(): Promise<boolean> {
    const icon = await this.prefixIconEl();
    return icon !== null;
  }

  /**
   * Gets the prefix icon harness for further inspection.
   *
   * @returns Promise resolving to the prefix TnIconHarness, or null if not present.
   */
  async getPrefixIcon(): Promise<TnIconHarness | null> {
    const el = await this.prefixIconEl();
    if (!el) return null;
    const allIcons = await this.locatorForAll(TnIconHarness)();
    for (const icon of allIcons) {
      const host = await icon.host();
      if (await host.hasClass('tn-input__prefix-icon')) {
        return icon;
      }
    }
    return null;
  }

  /**
   * Checks whether a suffix action button is present.
   *
   * @returns Promise resolving to true if a suffix action exists.
   */
  async hasSuffixAction(): Promise<boolean> {
    const button = await this.suffixButton();
    return button !== null;
  }

  /**
   * Gets the suffix icon harness for further inspection.
   *
   * @returns Promise resolving to the suffix TnIconHarness, or null if not present.
   */
  async getSuffixIcon(): Promise<TnIconHarness | null> {
    return this.suffixIconEl();
  }

  /**
   * Clicks the suffix action button.
   *
   * @returns Promise that resolves when the click action is complete.
   */
  async clickSuffixAction(): Promise<void> {
    const button = await this.suffixButton();
    if (!button) {
      throw new Error('No suffix action button found on this input.');
    }
    return button.click();
  }

  /**
   * Focuses the input element.
   *
   * @returns Promise that resolves when the input is focused.
   */
  async focus(): Promise<void> {
    if (await this.isMultiline()) {
      const textarea = await this.textareaEl();
      return textarea.focus();
    }
    const input = await this.inputEl();
    return input.focus();
  }

  /**
   * Blurs the input element.
   *
   * @returns Promise that resolves when the input is blurred.
   */
  async blur(): Promise<void> {
    if (await this.isMultiline()) {
      const textarea = await this.textareaEl();
      return textarea.blur();
    }
    const input = await this.inputEl();
    return input.blur();
  }
}

/**
 * A set of criteria that can be used to filter a list of `TnInputHarness` instances.
 */
export interface InputHarnessFilters extends BaseHarnessFilters {
  /** Filters by placeholder text. */
  placeholder?: string;
}
