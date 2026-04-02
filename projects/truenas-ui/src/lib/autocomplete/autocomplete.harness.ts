import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Harness for interacting with tn-autocomplete in tests.
 * Provides methods for querying state, typing search text, and selecting options.
 *
 * @example
 * ```typescript
 * // Find and select an option
 * const ac = await loader.getHarness(TnAutocompleteHarness);
 * await ac.selectOption('United States');
 *
 * // Type to filter, then read options
 * await ac.setInputValue('Can');
 * const options = await ac.getOptions();
 * expect(options).toEqual(['Canada']);
 *
 * // Filter by placeholder
 * const countryAc = await loader.getHarness(
 *   TnAutocompleteHarness.with({ placeholder: 'Search countries...' })
 * );
 * ```
 */
export class TnAutocompleteHarness extends ComponentHarness {
  /**
   * The selector for the host element of a `TnAutocompleteComponent` instance.
   */
  static hostSelector = 'tn-autocomplete';

  private _input = this.locatorFor('.tn-autocomplete__input');

  /**
   * Gets a `HarnessPredicate` that can be used to search for an autocomplete
   * with specific attributes.
   *
   * @param options Options for filtering which autocomplete instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   *
   * @example
   * ```typescript
   * // Find by exact placeholder
   * const ac = await loader.getHarness(
   *   TnAutocompleteHarness.with({ placeholder: 'Search countries...' })
   * );
   * ```
   */
  static with(options: AutocompleteHarnessFilters = {}) {
    return new HarnessPredicate(TnAutocompleteHarness, options)
      .addOption('placeholder', options.placeholder, async (harness, placeholder) => {
        return (await harness.getPlaceholder()) === placeholder;
      });
  }

  /**
   * Gets the current value of the input field.
   *
   * @returns Promise resolving to the input value.
   *
   * @example
   * ```typescript
   * const ac = await loader.getHarness(TnAutocompleteHarness);
   * await ac.selectOption('Canada');
   * expect(await ac.getInputValue()).toBe('Canada');
   * ```
   */
  async getInputValue(): Promise<string> {
    const input = await this._input();
    return (await input.getProperty<string>('value')) ?? '';
  }

  /**
   * Sets the value of the input by clearing and typing.
   * This triggers filtering of the dropdown options.
   *
   * @param value The text to type into the input.
   *
   * @example
   * ```typescript
   * const ac = await loader.getHarness(TnAutocompleteHarness);
   * await ac.setInputValue('Can');
   * const options = await ac.getOptions();
   * expect(options).toEqual(['Canada']);
   * ```
   */
  async setInputValue(value: string): Promise<void> {
    const input = await this._input();
    await input.clear();
    await input.sendKeys(value);
  }

  /**
   * Gets the placeholder text of the input.
   *
   * @returns Promise resolving to the placeholder string, or null.
   *
   * @example
   * ```typescript
   * const ac = await loader.getHarness(TnAutocompleteHarness);
   * expect(await ac.getPlaceholder()).toBe('Type to search...');
   * ```
   */
  async getPlaceholder(): Promise<string | null> {
    const input = await this._input();
    return input.getAttribute('placeholder');
  }

  /**
   * Checks whether the dropdown is currently open.
   *
   * @returns Promise resolving to true if the dropdown is visible.
   *
   * @example
   * ```typescript
   * const ac = await loader.getHarness(TnAutocompleteHarness);
   * expect(await ac.isOpen()).toBe(false);
   * await ac.focus();
   * expect(await ac.isOpen()).toBe(true);
   * ```
   */
  async isOpen(): Promise<boolean> {
    const dropdown = await this.locatorForOptional('.tn-autocomplete__dropdown')();
    return dropdown !== null;
  }

  /**
   * Checks whether the autocomplete input is disabled.
   *
   * @returns Promise resolving to true if the input is disabled.
   *
   * @example
   * ```typescript
   * const ac = await loader.getHarness(TnAutocompleteHarness);
   * expect(await ac.isDisabled()).toBe(false);
   * ```
   */
  async isDisabled(): Promise<boolean> {
    const input = await this._input();
    return (await input.getProperty<boolean>('disabled')) ?? false;
  }

  /**
   * Gets the labels of all visible options in the dropdown.
   * Opens the dropdown via focus if not already open.
   *
   * @returns Promise resolving to an array of option label strings.
   *
   * @example
   * ```typescript
   * const ac = await loader.getHarness(TnAutocompleteHarness);
   * await ac.setInputValue('C');
   * const options = await ac.getOptions();
   * expect(options).toContain('Canada');
   * ```
   */
  async getOptions(): Promise<string[]> {
    const options = await this.locatorForAll('.tn-autocomplete__option')();
    const labels: string[] = [];
    for (const option of options) {
      labels.push((await option.text()).trim());
    }
    return labels;
  }

  /**
   * Selects an option by its label text. Opens the dropdown via focus if needed.
   *
   * @param filter The text to match against option labels. Supports string or RegExp.
   * @returns Promise that resolves when the option has been selected.
   * @throws Error if no matching option is found.
   *
   * @example
   * ```typescript
   * const ac = await loader.getHarness(TnAutocompleteHarness);
   *
   * // Select by exact text
   * await ac.selectOption('Canada');
   *
   * // Select by regex
   * await ac.selectOption(/united/i);
   * ```
   */
  async selectOption(filter: string | RegExp): Promise<void> {
    const input = await this._input();
    await input.focus();

    const options = await this.locatorForAll('.tn-autocomplete__option')();
    for (const option of options) {
      const text = (await option.text()).trim();
      const matches = filter instanceof RegExp ? filter.test(text) : text === filter;
      if (matches) {
        await option.click();
        return;
      }
    }

    throw new Error(`Could not find autocomplete option matching "${filter}"`);
  }

  /**
   * Focuses the autocomplete input, which opens the dropdown.
   *
   * @returns Promise that resolves when the input is focused.
   *
   * @example
   * ```typescript
   * const ac = await loader.getHarness(TnAutocompleteHarness);
   * await ac.focus();
   * expect(await ac.isOpen()).toBe(true);
   * ```
   */
  async focus(): Promise<void> {
    const input = await this._input();
    return input.focus();
  }

  /**
   * Blurs the autocomplete input, which closes the dropdown.
   *
   * @returns Promise that resolves when the input is blurred.
   *
   * @example
   * ```typescript
   * const ac = await loader.getHarness(TnAutocompleteHarness);
   * await ac.focus();
   * await ac.blur();
   * expect(await ac.isOpen()).toBe(false);
   * ```
   */
  async blur(): Promise<void> {
    const input = await this._input();
    return input.blur();
  }
}

/**
 * A set of criteria that can be used to filter a list of `TnAutocompleteHarness` instances.
 */
export interface AutocompleteHarnessFilters extends BaseHarnessFilters {
  /** Filters by placeholder text. */
  placeholder?: string;
}
