import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { TnButtonHarness } from '../button/button.harness';
import { TnIconButtonHarness } from '../icon-button/icon-button.harness';

/** Criteria for filtering `TnFormListHarness` instances. */
export interface TnFormListHarnessFilters extends BaseHarnessFilters {
  /** Filters by the list's label. Supports string or regex matching. */
  label?: string | RegExp;
}

/** Criteria for filtering `TnFormListItemHarness` instances. */
export type TnFormListItemHarnessFilters = BaseHarnessFilters;

/**
 * Harness for one entry of a `tn-form-list`.
 *
 * @example
 * ```typescript
 * const [first] = await list.getItems();
 * await first.remove();
 * ```
 */
export class TnFormListItemHarness extends ComponentHarness {
  static hostSelector = 'tn-form-list-item';

  static with(options: TnFormListItemHarnessFilters = {}) {
    return new HarnessPredicate(TnFormListItemHarness, options);
  }

  // Scoped to the component's own control: an unscoped `TnIconButtonHarness` matches whatever the
  // consumer projected into the entry too, so with `canDelete="false"` the first projected icon
  // button would stand in for a remove button that is not there.
  private removeButton = this.locatorForOptional(
    TnIconButtonHarness.with({ selector: '.tn-form-list-item__remove' })
  );

  /** Whether this entry offers a remove control. */
  async canRemove(): Promise<boolean> {
    return (await this.removeButton()) !== null;
  }

  /**
   * Whether the remove control is disabled — true for an entry inside a
   * `disabled` list, or one given its own `disabled`. `false` when the entry
   * offers no remove control at all; ask `canRemove()` to tell the two apart.
   */
  async isRemoveDisabled(): Promise<boolean> {
    const button = await this.removeButton();
    return button ? button.isDisabled() : false;
  }

  /** Presses the remove control. Throws when the entry has none. */
  async remove(): Promise<void> {
    const button = await this.removeButton();
    if (!button) {
      throw new Error('This tn-form-list-item has no remove button (canDelete is false).');
    }
    await button.click();
  }
}

/**
 * Harness for `tn-form-list`, the editor for a repeating group of fields.
 *
 * @example
 * ```typescript
 * const list = await loader.getHarness(TnFormListHarness.with({ label: 'ACL entries' }));
 * expect(await list.getItemCount()).toBe(0);
 * expect(await list.isEmpty()).toBe(true);
 *
 * await list.add();
 * expect(await list.getItemCount()).toBe(1);
 * ```
 */
export class TnFormListHarness extends ComponentHarness {
  static hostSelector = 'tn-form-list';

  static with(options: TnFormListHarnessFilters = {}) {
    return new HarnessPredicate(TnFormListHarness, options)
      .addOption('label', options.label, (harness, label) =>
        HarnessPredicate.stringMatches(harness.getLabel(), label)
      );
  }

  private labelEl = this.locatorForOptional('.tn-form-list__label');
  // Scoped for the same reason as `removeButton` above — a `tn-button` projected into an entry
  // must not answer for the header's Add.
  private addButton = this.locatorForOptional(
    TnButtonHarness.with({ selector: '.tn-form-list__add' })
  );
  private emptyEl = this.locatorForOptional('.tn-form-list__empty');

  /** The list's label, or `''` when it has none. */
  async getLabel(): Promise<string> {
    const label = await this.labelEl();
    // The asterisk is decoration, not part of the name.
    return label ? (await label.text()).replace(/\*$/, '').trim() : '';
  }

  /** Whether the Add control renders. */
  async canAdd(): Promise<boolean> {
    return (await this.addButton()) !== null;
  }

  /** Whether the Add control is disabled. */
  async isAddDisabled(): Promise<boolean> {
    const button = await this.addButton();
    return button ? button.isDisabled() : false;
  }

  /** Presses Add. Throws when the list offers no Add control. */
  async add(): Promise<void> {
    const button = await this.addButton();
    if (!button) {
      throw new Error('This tn-form-list has no add button (canAdd is false).');
    }
    await button.click();
  }

  /** The entries currently rendered. */
  async getItems(): Promise<TnFormListItemHarness[]> {
    return this.locatorForAll(TnFormListItemHarness)();
  }

  /** How many entries are rendered. */
  async getItemCount(): Promise<number> {
    return (await this.getItems()).length;
  }

  /** Whether the empty message is showing. */
  async isEmpty(): Promise<boolean> {
    return (await this.emptyEl()) !== null;
  }

  /** The empty message, or `''` when the list has entries. */
  async getEmptyMessage(): Promise<string> {
    const empty = await this.emptyEl();
    return empty ? (await empty.text()).trim() : '';
  }
}
