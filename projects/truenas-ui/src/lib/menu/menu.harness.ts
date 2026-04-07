import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Harness for a single menu item (`button.tn-menu-item`).
 * @internal Used by TnMenuHarness to interact with individual items.
 */
class TnMenuItemHarness extends ComponentHarness {
  static hostSelector = '.tn-menu-item';

  private _label = this.locatorFor('.tn-menu-item-label');

  /** Gets the label text of this menu item. */
  async getLabel(): Promise<string> {
    const label = await this._label();
    return (await label.text()).trim();
  }

  /** Checks whether this menu item is disabled via the native `disabled` attribute. */
  async isDisabled(): Promise<boolean> {
    const host = await this.host();
    const disabled = await host.getProperty<boolean>('disabled');
    return !!disabled;
  }

  /** Clicks this menu item. */
  async click(): Promise<void> {
    const host = await this.host();
    await host.click();
  }
}

/**
 * Harness for interacting with `tn-menu` in tests.
 *
 * Menus render in a CDK overlay **outside** the component tree, so a regular
 * `TestbedHarnessEnvironment.loader(fixture)` won't find them. Use
 * `TnMenuTesting.rootLoader(fixture)` instead — it searches the entire document.
 *
 * ## Test Setup
 *
 * ```typescript
 * import {
 *   TnMenuHarness,
 *   TnMenuTesting,
 *   TnIconButtonHarness,
 * } from '@truenas/ui-components';
 *
 * let loader: HarnessLoader;   // for components
 * let rootLoader: HarnessLoader; // for overlays (menus, dialogs)
 *
 * beforeEach(() => {
 *   spectator = createComponent();
 *   loader = TestbedHarnessEnvironment.loader(spectator.fixture);
 *   rootLoader = TnMenuTesting.rootLoader(spectator.fixture);
 * });
 * ```
 *
 * ## Opening a Menu
 *
 * Click the trigger element to open the menu before querying it:
 *
 * ```typescript
 * // Via harness (if trigger is a tn-icon-button)
 * const trigger = await loader.getHarness(
 *   TnIconButtonHarness.with({ name: 'more_vert' })
 * );
 * await trigger.click();
 *
 * // Or via DOM
 * spectator.click('[tnMenuTriggerFor]');
 * ```
 *
 * ## Querying and Clicking Items
 *
 * ```typescript
 * const menu = await rootLoader.getHarness(TnMenuHarness);
 * expect(await menu.getItemLabels()).toEqual(['Edit', 'Delete']);
 * await menu.clickItem({ label: 'Edit' });
 * await menu.clickItem({ label: /del/i }); // regex match
 * expect(await menu.isItemDisabled({ label: 'Delete' })).toBe(false);
 * ```
 */
export class TnMenuHarness extends ComponentHarness {
  static hostSelector = '.tn-menu';

  private _items = this.locatorForAll(TnMenuItemHarness);

  /**
   * Gets a `HarnessPredicate` that can be used to search for a menu.
   */
  static with(options: MenuHarnessFilters = {}) {
    return new HarnessPredicate(TnMenuHarness, options);
  }

  /**
   * Gets the labels of all menu items.
   *
   * @example
   * ```typescript
   * const menu = await rootLoader.getHarness(TnMenuHarness);
   * expect(await menu.getItemLabels()).toEqual(['Edit', 'Delete']);
   * ```
   */
  async getItemLabels(): Promise<string[]> {
    const items = await this._items();
    return Promise.all(items.map(item => item.getLabel()));
  }

  /**
   * Clicks a menu item by its label text.
   *
   * @param filter Object with `label` to match (string or RegExp).
   *
   * @example
   * ```typescript
   * const menu = await rootLoader.getHarness(TnMenuHarness);
   * await menu.clickItem({ label: 'Delete' });
   * ```
   */
  async clickItem(filter: { label: string | RegExp }): Promise<void> {
    const items = await this._items();
    for (const item of items) {
      const text = await item.getLabel();
      const matches = filter.label instanceof RegExp
        ? filter.label.test(text)
        : text === filter.label;
      if (matches) {
        await item.click();
        return;
      }
    }
    throw new Error(`Could not find menu item matching label "${String(filter.label)}"`);
  }

  /**
   * Checks if a menu item is disabled.
   *
   * @param filter Object with `label` to match (string or RegExp).
   * @returns Promise resolving to true if the item is disabled.
   *
   * @example
   * ```typescript
   * const menu = await rootLoader.getHarness(TnMenuHarness);
   * expect(await menu.isItemDisabled({ label: 'Delete' })).toBe(true);
   * ```
   */
  async isItemDisabled(filter: { label: string | RegExp }): Promise<boolean> {
    const items = await this._items();
    for (const item of items) {
      const text = await item.getLabel();
      const matches = filter.label instanceof RegExp
        ? filter.label.test(text)
        : text === filter.label;
      if (matches) {
        return item.isDisabled();
      }
    }
    throw new Error(`Could not find menu item with label "${String(filter.label)}"`);
  }

  /**
   * Gets the number of menu items (excluding separators).
   */
  async getItemCount(): Promise<number> {
    return (await this._items()).length;
  }
}

/**
 * A set of criteria that can be used to filter `TnMenuHarness` instances.
 */
export interface MenuHarnessFilters extends BaseHarnessFilters {}
