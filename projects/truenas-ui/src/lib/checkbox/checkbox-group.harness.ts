import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { TnCheckboxHarness } from './checkbox.harness';

/**
 * Harness for interacting with `tn-checkbox-group` in tests.
 * Drives the group as a whole — reading the checked set, replacing it wholesale, toggling one
 * option by label — rather than reaching for each `tn-checkbox` individually.
 *
 * @example
 * ```typescript
 * const group = await loader.getHarness(TnCheckboxGroupHarness.with({ testId: 'checkbox-group-trains' }));
 * await group.setValue(['stable', 'enterprise']);
 * expect(await group.getValue()).toEqual(['stable', 'enterprise']);
 * ```
 */
export class TnCheckboxGroupHarness extends ComponentHarness {
  /** The selector for the host element of a `TnCheckboxGroupComponent` instance. */
  static hostSelector = 'tn-checkbox-group';

  private _root = this.locatorFor('.tn-checkbox-group');
  private _checkboxes = this.locatorForAll(TnCheckboxHarness);

  /**
   * Gets a `HarnessPredicate` that can be used to search for a checkbox group with specific
   * attributes.
   *
   * @param options Options for filtering which checkbox group instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   *
   * @example
   * ```typescript
   * // Find by accessible name
   * const group = await loader.getHarness(TnCheckboxGroupHarness.with({ ariaLabel: 'USB Devices' }));
   *
   * // Find by testId
   * const group = await loader.getHarness(TnCheckboxGroupHarness.with({ testId: 'checkbox-group-usb-devices' }));
   * ```
   */
  static with(options: CheckboxGroupHarnessFilters = {}) {
    return new HarnessPredicate(TnCheckboxGroupHarness, options)
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
   * expect(options).toHaveLength(3);
   * ```
   */
  async getOptions(): Promise<TnCheckboxHarness[]> {
    return this._checkboxes();
  }

  /**
   * Gets the label text of every option, in DOM order.
   *
   * @example
   * ```typescript
   * expect(await group.getOptionLabels()).toEqual(['Stable', 'Enterprise']);
   * ```
   */
  async getOptionLabels(): Promise<string[]> {
    const checkboxes = await this._checkboxes();
    return Promise.all(checkboxes.map((checkbox) => checkbox.getLabelText()));
  }

  /**
   * Gets the labels of the currently checked options, in DOM order.
   *
   * Labels rather than values, because the values live in the bound control and the DOM only ever
   * carries what the user can read.
   *
   * @example
   * ```typescript
   * expect(await group.getValue()).toEqual(['Stable']);
   * ```
   */
  async getValue(): Promise<string[]> {
    const checkboxes = await this._checkboxes();
    const checked: string[] = [];
    for (const checkbox of checkboxes) {
      if (await checkbox.isChecked()) {
        checked.push(await checkbox.getLabelText());
      }
    }
    return checked;
  }

  /**
   * Makes the checked set exactly the options with the given labels — checking the ones listed and
   * unchecking every other.
   *
   * @param labels Label text of the options that should end up checked.
   *
   * @example
   * ```typescript
   * await group.setValue(['Stable']);
   * ```
   */
  async setValue(labels: string[]): Promise<void> {
    const checkboxes = await this._checkboxes();
    for (const checkbox of checkboxes) {
      const label = await checkbox.getLabelText();
      if (labels.includes(label)) {
        await checkbox.check();
      } else {
        await checkbox.uncheck();
      }
    }
  }

  /**
   * Toggles the option with the given label. Throws when the group has no such option, so a
   * renamed or missing option fails loudly instead of silently leaving the selection unchanged.
   *
   * @param label Label text of the option to toggle.
   *
   * @example
   * ```typescript
   * await group.toggle('Enterprise');
   * ```
   */
  async toggle(label: string): Promise<void> {
    const checkbox = await this.locatorForOptional(TnCheckboxHarness.with({ label }))();
    if (!checkbox) {
      const available = (await this.getOptionLabels()).join(', ');
      throw new Error(`No option labelled "${label}" in this tn-checkbox-group (available: ${available}).`);
    }
    await checkbox.toggle();
  }

  /**
   * Checks whether every option is disabled — the state a disabled group or a disabled bound form
   * control produces. Use {@link getOptions} to inspect a single per-option `disabled`.
   *
   * @example
   * ```typescript
   * expect(await group.isDisabled()).toBe(true);
   * ```
   */
  async isDisabled(): Promise<boolean> {
    const checkboxes = await this._checkboxes();
    if (!checkboxes.length) {
      return false;
    }
    const states = await Promise.all(checkboxes.map((checkbox) => checkbox.isDisabled()));
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
   * expect(await group.getTestId()).toBe('checkbox-group-trains');
   * ```
   */
  async getTestId(): Promise<string | null> {
    const root = await this._root();
    return (await root.getAttribute('data-testid')) ?? (await root.getAttribute('data-test'));
  }
}

/** A set of criteria that can be used to filter a list of `TnCheckboxGroupHarness` instances. */
export interface CheckboxGroupHarnessFilters extends BaseHarnessFilters {
  /** Filters by the group's `aria-label`. Supports string or regex matching. */
  ariaLabel?: string | RegExp;
  /** Filters by the resolved test-id attribute on the group root. */
  testId?: string;
}
