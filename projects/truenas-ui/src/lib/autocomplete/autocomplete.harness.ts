import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

export class TnAutocompleteHarness extends ComponentHarness {
  static hostSelector = 'tn-autocomplete';

  private _input = this.locatorFor('.tn-autocomplete__input');

  static with(options: AutocompleteHarnessFilters = {}) {
    return new HarnessPredicate(TnAutocompleteHarness, options)
      .addOption('placeholder', options.placeholder, async (harness, placeholder) => {
        return (await harness.getPlaceholder()) === placeholder;
      });
  }

  async getInputValue(): Promise<string> {
    const input = await this._input();
    return (await input.getProperty<string>('value')) ?? '';
  }

  async setInputValue(value: string): Promise<void> {
    const input = await this._input();
    await input.clear();
    await input.sendKeys(value);
  }

  async getPlaceholder(): Promise<string | null> {
    const input = await this._input();
    return input.getAttribute('placeholder');
  }

  async isOpen(): Promise<boolean> {
    const dropdown = await this.locatorForOptional('.tn-autocomplete__dropdown')();
    return dropdown !== null;
  }

  async isDisabled(): Promise<boolean> {
    const input = await this._input();
    return (await input.getProperty<boolean>('disabled')) ?? false;
  }

  async getOptions(): Promise<string[]> {
    const options = await this.locatorForAll('.tn-autocomplete__option')();
    const labels: string[] = [];
    for (const option of options) {
      labels.push((await option.text()).trim());
    }
    return labels;
  }

  async selectOption(filter: string | RegExp): Promise<void> {
    // Focus to open dropdown
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

  async focus(): Promise<void> {
    const input = await this._input();
    return input.focus();
  }

  async blur(): Promise<void> {
    const input = await this._input();
    return input.blur();
  }
}

export interface AutocompleteHarnessFilters extends BaseHarnessFilters {
  placeholder?: string;
}
