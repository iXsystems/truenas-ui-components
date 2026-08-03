import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { TnRadioHarness } from './radio.harness';

/**
 * Harness for interacting with `tn-radio-group` in tests.
 * Drives the group as a whole — picking an option by label, reading the current selection —
 * rather than reaching for each `tn-radio` individually.
 *
 * @example
 * ```typescript
 * const group = await loader.getHarness(TnRadioGroupHarness.with({ testId: 'encryption' }));
 * await group.select('Passphrase');
 * expect(await group.getCheckedLabel()).toBe('Passphrase');
 * ```
 */
export class TnRadioGroupHarness extends ComponentHarness {
  /** The selector for the host element of a `TnRadioGroupComponent` instance. */
  static hostSelector = 'tn-radio-group';

  private _root = this.locatorFor('.tn-radio-group');
  private _radios = this.locatorForAll(TnRadioHarness);

  /**
   * Gets a `HarnessPredicate` that can be used to search for a radio group with specific
   * attributes.
   *
   * @param options Options for filtering which radio group instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   *
   * @example
   * ```typescript
   * // Find by accessible name
   * const group = await loader.getHarness(TnRadioGroupHarness.with({ ariaLabel: 'Encryption' }));
   *
   * // Find by testId
   * const group = await loader.getHarness(TnRadioGroupHarness.with({ testId: 'radio-group-encryption' }));
   * ```
   */
  static with(options: RadioGroupHarnessFilters = {}) {
    return new HarnessPredicate(TnRadioGroupHarness, options)
      .addOption('ariaLabel', options.ariaLabel, (harness, ariaLabel) =>
        HarnessPredicate.stringMatches(harness.getAriaLabel(), ariaLabel)
      )
      .addOption('testId', options.testId, async (harness, testId) => {
        return (await harness.getTestId()) === testId;
      });
  }

  /**
   * Gets the harnesses for the group's options, in DOM order.
   *
   * @example
   * ```typescript
   * const options = await group.getOptions();
   * expect(options).toHaveLength(2);
   * ```
   */
  async getOptions(): Promise<TnRadioHarness[]> {
    return this._radios();
  }

  /**
   * Gets the label text of every option, in DOM order.
   *
   * @example
   * ```typescript
   * expect(await group.getOptionLabels()).toEqual(['None', 'Passphrase']);
   * ```
   */
  async getOptionLabels(): Promise<string[]> {
    const radios = await this._radios();
    return Promise.all(radios.map((radio) => radio.getLabelText()));
  }

  /**
   * Gets the label of the currently checked option, or null when nothing is selected.
   *
   * @example
   * ```typescript
   * expect(await group.getCheckedLabel()).toBe('Passphrase');
   * ```
   */
  async getCheckedLabel(): Promise<string | null> {
    const radios = await this._radios();
    for (const radio of radios) {
      if (await radio.isChecked()) {
        return radio.getLabelText();
      }
    }
    return null;
  }

  /**
   * Selects the option with the given label. Throws when the group has no such option, so a
   * renamed or missing option fails loudly instead of silently leaving the selection unchanged.
   *
   * @param label Label text of the option to select.
   *
   * @example
   * ```typescript
   * await group.select('Passphrase');
   * ```
   */
  async select(label: string): Promise<void> {
    const radio = await this.locatorForOptional(TnRadioHarness.with({ label }))();
    if (!radio) {
      const available = (await this.getOptionLabels()).join(', ');
      throw new Error(`No option labelled "${label}" in this tn-radio-group (available: ${available}).`);
    }
    await radio.check();
  }

  /**
   * Checks whether every option is disabled — the state a disabled group or a disabled bound
   * form control produces. Use {@link getOptions} to inspect a single per-option `disabled`.
   *
   * @example
   * ```typescript
   * expect(await group.isDisabled()).toBe(true);
   * ```
   */
  async isDisabled(): Promise<boolean> {
    const radios = await this._radios();
    if (!radios.length) {
      return false;
    }
    const states = await Promise.all(radios.map((radio) => radio.isDisabled()));
    return states.every(Boolean);
  }

  /**
   * Gets the group's accessible name as written by the `ariaLabel` input, or null when the name
   * comes from an enclosing `tn-form-field` (see {@link getAriaLabelledBy}).
   */
  async getAriaLabel(): Promise<string | null> {
    return (await this._root()).getAttribute('aria-label');
  }

  /** Gets the id the group's accessible name is delegated to, or null. */
  async getAriaLabelledBy(): Promise<string | null> {
    return (await this._root()).getAttribute('aria-labelledby');
  }

  /**
   * Gets the test ID attribute value of the group root.
   *
   * @example
   * ```typescript
   * expect(await group.getTestId()).toBe('radio-group-encryption');
   * ```
   */
  async getTestId(): Promise<string | null> {
    const root = await this._root();
    return (await root.getAttribute('data-testid')) ?? (await root.getAttribute('data-test'));
  }
}

/** A set of criteria that can be used to filter a list of `TnRadioGroupHarness` instances. */
export interface RadioGroupHarnessFilters extends BaseHarnessFilters {
  /** Filters by the group's `aria-label`. Supports string or regex matching. */
  ariaLabel?: string | RegExp;
  /** Filters by the resolved test-id attribute on the group root. */
  testId?: string;
}
