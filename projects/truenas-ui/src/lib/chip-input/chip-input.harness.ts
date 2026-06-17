import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate, TestKey } from '@angular/cdk/testing';
import { TnChipHarness } from '../chip/chip.harness';

/**
 * Harness for interacting with `tn-chip-input` in tests. Reads the committed
 * chips and drives the text field — adding values (optionally via the
 * suggestion dropdown) and removing them.
 *
 * @example
 * ```typescript
 * const tags = await loader.getHarness(TnChipInputHarness.with({ testId: 'chip-input-tags' }));
 * await tags.addChip('production');
 * expect(await tags.getChips()).toEqual(['production']);
 * await tags.removeChip('production');
 * ```
 */
export class TnChipInputHarness extends ComponentHarness {
  static hostSelector = 'tn-chip-input';

  private _input = this.locatorFor('.tn-chip-input__field');
  private getChipHarnesses = this.locatorForAll(TnChipHarness);

  /** Suggestion options live in a CDK overlay on the document root. */
  private documentRoot = this.documentRootLocatorFactory();

  static with(options: TnChipInputHarnessFilters = {}): HarnessPredicate<TnChipInputHarness> {
    return new HarnessPredicate(TnChipInputHarness, options)
      .addOption('testId', options.testId, async (harness, testId) =>
        (await (await harness._input()).getAttribute('data-testid')) === testId
        || (await (await harness._input()).getAttribute('data-test')) === testId,
      );
  }

  /** Labels of the currently committed chips, in order. */
  async getChips(): Promise<string[]> {
    const chips = await this.getChipHarnesses();
    const labels: string[] = [];
    for (const chip of chips) {
      labels.push(await chip.getLabel());
    }
    return labels;
  }

  /** Types `value` into the field and commits it with Enter. */
  async addChip(value: string): Promise<void> {
    const input = await this._input();
    await input.focus();
    await input.setInputValue(value);
    await input.dispatchEvent('input');
    await input.sendKeys(TestKey.ENTER);
  }

  /** Types `value` into the field without committing it. */
  async typeText(value: string): Promise<void> {
    const input = await this._input();
    await input.focus();
    await input.setInputValue(value);
    await input.dispatchEvent('input');
  }

  /** Whether the text field currently holds DOM focus. */
  async isInputFocused(): Promise<boolean> {
    return (await this._input()).isFocused();
  }

  /** Focuses the text field (opens the dropdown when there are suggestions). */
  async focus(): Promise<void> {
    await (await this._input()).focus();
  }

  /** Blurs the text field. */
  async blur(): Promise<void> {
    await (await this._input()).blur();
  }

  /** Sends a key (or `TestKey`) to the focused field — e.g. Backspace, arrows, a separator. */
  async pressKey(key: TestKey | string): Promise<void> {
    await (await this._input()).sendKeys(key);
  }

  /** Types `value`, then commits the matching suggestion from the dropdown. */
  async selectSuggestion(value: string): Promise<void> {
    const input = await this._input();
    await input.focus();
    await input.setInputValue(value);
    await input.dispatchEvent('input');
    const options = await this.documentRoot.locatorForAll('.tn-chip-input__option')();
    for (const option of options) {
      if ((await option.text()).trim() === value) {
        await option.click();
        return;
      }
    }
    throw new Error(`No suggestion matching "${value}" was found.`);
  }

  /** Removes the chip with the given label via its close button. */
  async removeChip(value: string): Promise<void> {
    const chip = await this.locatorFor(TnChipHarness.with({ label: value }))();
    await chip.close();
  }

  /** Visible suggestion option texts, or `[]` when the dropdown is closed. */
  async getSuggestions(): Promise<string[]> {
    const options = await this.documentRoot.locatorForAll('.tn-chip-input__option')();
    const texts: string[] = [];
    for (const option of options) {
      texts.push((await option.text()).trim());
    }
    return texts;
  }

  async isDisabled(): Promise<boolean> {
    const input = await this._input();
    return (await input.getProperty('disabled')) === true;
  }
}

export interface TnChipInputHarnessFilters extends BaseHarnessFilters {
  /** Filters by the resolved test-id attribute on the text field. */
  testId?: string;
}
