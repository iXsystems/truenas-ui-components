import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import type { BaseHarnessFilters, ComponentHarnessConstructor } from '@angular/cdk/testing';
import { TnAutocompleteHarness } from '../autocomplete/autocomplete.harness';
import { TnChipInputHarness } from '../chip-input/chip-input.harness';

/**
 * Shared by the two single-valued field harnesses.
 *
 * Deliberately NOT in a `*.harness.ts` file: the harness-doc generator keys one
 * class per such file, so a base living beside its subclasses would take their
 * place in the Storybook registry and document an internal class instead of the
 * four public ones.
 */
export class TnDirectoryAutocompleteHarnessBase extends ComponentHarness {
  private inner = this.locatorFor(TnAutocompleteHarness);

  /**
   * Narrows to one field among several, by any base filter — most usefully
   * `selector`, so a form with four of these can address each by the control it
   * is bound to rather than by DOM order.
   *
   * @example
   * ```ts
   * loader.getHarness(
   *   TnUserAutocompleteHarness.with({ selector: '[formControlName="maproot_user"]' }),
   * );
   * ```
   */
  static with<T extends ComponentHarness>(
    this: ComponentHarnessConstructor<T>,
    options: BaseHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options);
  }

  /** The underlying `tn-autocomplete` harness, for anything not shortcut here. */
  async autocomplete(): Promise<TnAutocompleteHarness> {
    return this.inner();
  }

  /** Focuses the field, which opens the dropdown and loads the first page. */
  async focus(): Promise<void> {
    return (await this.inner()).focus();
  }

  /** Blurs the field, committing a typed value when custom values are allowed. */
  async blur(): Promise<void> {
    return (await this.inner()).blur();
  }

  /** Types into the field, which triggers a directory search. */
  async setInputValue(value: string): Promise<void> {
    return (await this.inner()).setInputValue(value);
  }

  /** The text currently in the field. */
  async getInputValue(): Promise<string> {
    return (await this.inner()).getInputValue();
  }

  /** Labels of the rows on offer, including any create row. */
  async getOptions(): Promise<string[]> {
    return (await this.inner()).getOptions();
  }

  /** Picks a row by its label. */
  async selectOption(filter: string | RegExp): Promise<void> {
    return (await this.inner()).selectOption(filter);
  }

  /** Whether a directory lookup is in flight. */
  async isLoading(): Promise<boolean> {
    return (await this.inner()).isLoading();
  }

  /** Whether the field is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await this.inner()).isDisabled();
  }
}

/** Shared by the two list-valued field harnesses. See the note above. */
export class TnDirectoryChipsHarnessBase extends ComponentHarness {
  private inner = this.locatorFor(TnChipInputHarness);

  /** Narrows to one field among several — see {@link TnDirectoryAutocompleteHarnessBase.with}. */
  static with<T extends ComponentHarness>(
    this: ComponentHarnessConstructor<T>,
    options: BaseHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options);
  }

  /** The underlying `tn-chip-input` harness, for anything not shortcut here. */
  async chipInput(): Promise<TnChipInputHarness> {
    return this.inner();
  }

  /** The committed chips, in order. */
  async getChips(): Promise<string[]> {
    return (await this.inner()).getChips();
  }

  /** Types a value and commits it as a chip. */
  async addChip(value: string): Promise<void> {
    return (await this.inner()).addChip(value);
  }

  /** Removes the chip with this text. */
  async removeChip(value: string): Promise<void> {
    return (await this.inner()).removeChip(value);
  }

  /** Types into the field without committing, which triggers a search. */
  async typeText(value: string): Promise<void> {
    return (await this.inner()).typeText(value);
  }

  /** Types `value`, then commits the matching suggestion from the dropdown. */
  async selectSuggestion(value: string): Promise<void> {
    return (await this.inner()).selectSuggestion(value);
  }

  /** Labels of the suggestions currently offered in the dropdown. */
  async getSuggestions(): Promise<string[]> {
    return (await this.inner()).getSuggestions();
  }

  /** Whether the field is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await this.inner()).isDisabled();
  }
}
