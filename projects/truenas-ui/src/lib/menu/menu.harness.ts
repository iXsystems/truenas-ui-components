import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/** Prefix of the ids CDK's `AriaDescriber` gives the description elements `tnTooltip` creates. */
const TOOLTIP_DESCRIPTION_ID_PREFIX = 'cdk-describedby-message';

/**
 * Harness for a single menu item: the `.tn-menu-item-row` holding its
 * `button.tn-menu-item`. The row is the host because it is what carries the
 * tooltip and takes the pointer on a disabled item.
 * @internal Used by TnMenuHarness to interact with individual items.
 */
class TnMenuItemHarness extends ComponentHarness {
  static hostSelector = '.tn-menu-item-row';

  private _button = this.locatorFor('.tn-menu-item');
  private _label = this.locatorForOptional('.tn-menu-item-label');
  private _suffixIcon = this.locatorForOptional('.tn-menu-item-suffix-icon');

  /**
   * Gets the label text of this menu item. Reads `.tn-menu-item-label` when
   * present (the default layout), otherwise falls back to the button's text so
   * fully-projected `<tn-menu-item>` content still resolves a label.
   */
  async getLabel(): Promise<string> {
    const label = await this._label();
    if (label) {
      return (await label.text()).trim();
    }
    const button = await this._button();
    return (await button.text()).trim();
  }

  /** Checks whether this menu item is disabled via the native `disabled` attribute. */
  async isDisabled(): Promise<boolean> {
    const button = await this._button();
    const disabled = await button.getProperty<boolean>('disabled');
    return !!disabled;
  }

  /** Checks whether this menu item is marked as the currently-selected option. */
  async isSelected(): Promise<boolean> {
    const button = await this._button();
    return (await button.getAttribute('aria-current')) === 'true';
  }

  /** Gets the name of the suffix icon, or null when the item has none. */
  async getSuffixIcon(): Promise<string | null> {
    const icon = await this._suffixIcon();
    return icon ? icon.getAttribute('name') : null;
  }

  /**
   * Gets the tooltip text, or null when the item has none. Read from the
   * description `tnTooltip` attaches to the button, so the tooltip does not
   * have to be on screen.
   */
  async getTooltip(): Promise<string | null> {
    const button = await this._button();
    const ids = ((await button.getAttribute('aria-describedby')) ?? '')
      .split(/\s+/)
      .filter((id) => id.startsWith(TOOLTIP_DESCRIPTION_ID_PREFIX));
    for (const id of ids) {
      const description = await this.documentRootLocatorFactory().locatorForOptional(`[id="${id}"]`)();
      if (description) {
        return (await description.text()).trim();
      }
    }
    return null;
  }

  /** Moves the pointer onto this item's row, which shows its tooltip. */
  async hover(): Promise<void> {
    const host = await this.host();
    await host.hover();
  }

  /** Clicks this menu item. */
  async click(): Promise<void> {
    const button = await this._button();
    await button.click();
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

  /**
   * Checks whether a menu item is marked as the currently-selected option
   * (i.e. has `aria-current="true"`).
   *
   * @example
   * ```typescript
   * const menu = await rootLoader.getHarness(TnMenuHarness);
   * expect(await menu.isItemSelected({ label: 'JSON' })).toBe(true);
   * ```
   */
  async isItemSelected(filter: { label: string | RegExp }): Promise<boolean> {
    const items = await this._items();
    for (const item of items) {
      const text = await item.getLabel();
      const matches = filter.label instanceof RegExp
        ? filter.label.test(text)
        : text === filter.label;
      if (matches) {
        return item.isSelected();
      }
    }
    throw new Error(`Could not find menu item with label "${String(filter.label)}"`);
  }

  /**
   * Gets the name of a menu item's suffix icon, or `null` when it has none.
   *
   * @param filter Object with `label` to match (string or RegExp).
   *
   * @example
   * ```typescript
   * const menu = await rootLoader.getHarness(TnMenuHarness);
   * expect(await menu.getItemSuffixIcon({ label: 'Delete' })).toBe('lock');
   * ```
   */
  async getItemSuffixIcon(filter: { label: string | RegExp }): Promise<string | null> {
    return (await this._findItem(filter)).getSuffixIcon();
  }

  /**
   * Gets a menu item's tooltip text, or `null` when it has none. Works on a
   * disabled item, and without the tooltip being shown.
   *
   * @param filter Object with `label` to match (string or RegExp).
   *
   * @example
   * ```typescript
   * const menu = await rootLoader.getHarness(TnMenuHarness);
   * expect(await menu.getItemTooltip({ label: 'Delete' }))
   *   .toBe('Missing permissions for this action');
   * ```
   */
  async getItemTooltip(filter: { label: string | RegExp }): Promise<string | null> {
    return (await this._findItem(filter)).getTooltip();
  }

  /**
   * Hovers a menu item, disabled or not, which shows its tooltip. The tooltip
   * opens on a timer, so let a macrotask pass before reading it with
   * `TnTooltipHarness`.
   *
   * @param filter Object with `label` to match (string or RegExp).
   *
   * @example
   * ```typescript
   * const menu = await rootLoader.getHarness(TnMenuHarness);
   * await menu.hoverItem({ label: 'Delete' });
   * await new Promise((resolve) => setTimeout(resolve));
   * const tooltip = await rootLoader.getHarness(TnTooltipHarness);
   * expect(await tooltip.getText()).toBe('Missing permissions for this action');
   * ```
   */
  async hoverItem(filter: { label: string | RegExp }): Promise<void> {
    return (await this._findItem(filter)).hover();
  }

  private async _findItem(filter: { label: string | RegExp }): Promise<TnMenuItemHarness> {
    const items = await this._items();
    for (const item of items) {
      const text = await item.getLabel();
      const matches = filter.label instanceof RegExp
        ? filter.label.test(text)
        : text === filter.label;
      if (matches) {
        return item;
      }
    }
    throw new Error(`Could not find menu item with label "${String(filter.label)}"`);
  }

  /**
   * Gets the label of the currently-selected item, or `null` when no item is
   * marked as selected.
   */
  async getSelectedItemLabel(): Promise<string | null> {
    const items = await this._items();
    for (const item of items) {
      if (await item.isSelected()) {
        return item.getLabel();
      }
    }
    return null;
  }
}

/**
 * A set of criteria that can be used to filter `TnMenuHarness` instances.
 */
export interface MenuHarnessFilters extends BaseHarnessFilters {}
