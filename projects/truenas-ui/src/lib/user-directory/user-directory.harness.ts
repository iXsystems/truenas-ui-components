import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import type { BaseHarnessFilters, ComponentHarnessConstructor } from '@angular/cdk/testing';
import { TnAutocompleteHarness } from '../autocomplete/autocomplete.harness';
import { TnChipInputHarness } from '../chip-input/chip-input.harness';

/**
 * Harness for `tn-user-autocomplete` / `tn-group-autocomplete`.
 *
 * The field is a thin shell over `tn-autocomplete`, so this exposes the inner
 * harness rather than re-implementing it — `await field.autocomplete()` gives
 * the full API (`getOptions`, `selectOption`, `isLoading`, …). The shortcuts
 * below cover what a form spec actually reaches for.
 *
 * @example
 * ```ts
 * const owner = await loader.getHarness(TnUserAutocompleteHarness);
 * await owner.focus();
 * expect(await owner.getOptions()).toEqual(['root', 'operator']);
 * await owner.selectOption('operator');
 * ```
 */
class TnDirectoryAutocompleteHarnessBase extends ComponentHarness {
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

  /** Blurs the field. */
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

/** Harness for `tn-user-autocomplete`. */
export class TnUserAutocompleteHarness extends TnDirectoryAutocompleteHarnessBase {
  static hostSelector = 'tn-user-autocomplete';
}

/** Harness for `tn-group-autocomplete`. */
export class TnGroupAutocompleteHarness extends TnDirectoryAutocompleteHarnessBase {
  static hostSelector = 'tn-group-autocomplete';
}

/**
 * Harness for `tn-user-chips` / `tn-group-chips`, a thin shell over
 * `tn-chip-input`.
 *
 * @example
 * ```ts
 * const groups = await loader.getHarness(TnGroupChipsHarness);
 * await groups.addChip('builtin_administrators');
 * expect(await groups.getChips()).toEqual(['builtin_administrators']);
 * ```
 */
class TnDirectoryChipsHarnessBase extends ComponentHarness {
  private inner = this.locatorFor(TnChipInputHarness);

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

/** Harness for `tn-user-chips`. */
export class TnUserChipsHarness extends TnDirectoryChipsHarnessBase {
  static hostSelector = 'tn-user-chips';
}

/** Harness for `tn-group-chips`. */
export class TnGroupChipsHarness extends TnDirectoryChipsHarnessBase {
  static hostSelector = 'tn-group-chips';
}
