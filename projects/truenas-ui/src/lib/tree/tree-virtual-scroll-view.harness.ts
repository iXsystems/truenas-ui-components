import type { BaseHarnessFilters, TestElement } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate, TestKey } from '@angular/cdk/testing';

/**
 * Harness for interacting with `tn-tree-virtual-scroll-view` in tests.
 *
 * Because the component virtualises its rows, every query below operates over the
 * currently-MATERIALISED (visible + buffered) rows only — nodes scrolled far out of view
 * are not in the DOM. Indexes are positions within that visible set, not the full data.
 *
 * @example
 * ```typescript
 * const tree = await loader.getHarness(TnTreeVirtualScrollViewHarness);
 * expect(await tree.getRowTexts()).toEqual(['pool', 'other']);
 *
 * await tree.expand(0);
 * expect(await tree.isExpanded(0)).toBe(true);
 * expect(await tree.getAriaLevel(1)).toBe(2);
 * ```
 */
export class TnTreeVirtualScrollViewHarness extends ComponentHarness {
  static hostSelector = 'tn-tree-virtual-scroll-view';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a virtual-scroll tree
   * with specific attributes.
   *
   * @param options Options for filtering which instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   */
  static with(options: TnTreeVirtualScrollViewHarnessFilters = {}): HarnessPredicate<TnTreeVirtualScrollViewHarness> {
    return new HarnessPredicate(TnTreeVirtualScrollViewHarness, options);
  }

  private readonly rows = this.locatorForAll('.tn-tree-node-wrapper[role="treeitem"]');
  private readonly scrollTopButton = this.locatorForOptional('.tn-tree-virtual-scroll-view__scroll-top');

  // --- Row queries ---

  /**
   * Gets the number of currently-materialised tree rows.
   *
   * @returns Promise resolving to the visible row count.
   */
  async getRowCount(): Promise<number> {
    return (await this.rows()).length;
  }

  /**
   * Gets the text label of every materialised row (the node's text cell only, excluding
   * the expand chevron glyph).
   *
   * @returns Promise resolving to an array of row label strings.
   */
  async getRowTexts(): Promise<string[]> {
    const cells = await this.locatorForAll('.tn-tree-node-wrapper[role="treeitem"] .tn-tree-node__text')();
    const texts: string[] = [];
    for (const cell of cells) {
      texts.push((await cell.text()).trim());
    }
    return texts;
  }

  /**
   * Gets the text label of a single materialised row.
   *
   * @param index Zero-based index within the visible rows.
   * @returns Promise resolving to the row's label.
   */
  async getRowText(index: number): Promise<string> {
    const cell = await this.locatorFor(
      `.tn-tree-node-wrapper[role="treeitem"]:nth-of-type(${index + 1}) .tn-tree-node__text`,
    )();
    return (await cell.text()).trim();
  }

  /**
   * Gets the 1-based `aria-level` of a row (root nodes are 1).
   *
   * @param index Zero-based index within the visible rows.
   * @returns Promise resolving to the aria-level, or null if unset.
   */
  async getAriaLevel(index: number): Promise<number | null> {
    return this.getRowNumberAttribute(index, 'aria-level');
  }

  /**
   * Gets a row's `aria-posinset` — its 1-based position within its SIBLING set.
   *
   * @param index Zero-based index within the visible rows.
   * @returns Promise resolving to the aria-posinset, or null if unset.
   */
  async getAriaPosInSet(index: number): Promise<number | null> {
    return this.getRowNumberAttribute(index, 'aria-posinset');
  }

  /**
   * Gets a row's `aria-setsize` — the size of its SIBLING set.
   *
   * @param index Zero-based index within the visible rows.
   * @returns Promise resolving to the aria-setsize, or null if unset.
   */
  async getAriaSetSize(index: number): Promise<number | null> {
    return this.getRowNumberAttribute(index, 'aria-setsize');
  }

  /**
   * Whether a row is expandable (advertises `aria-expanded`).
   *
   * @param index Zero-based index within the visible rows.
   * @returns Promise resolving to true if the row is expandable.
   */
  async isExpandable(index: number): Promise<boolean> {
    const row = await this.getRow(index);
    return (await row.getAttribute('aria-expanded')) !== null;
  }

  /**
   * Whether an expandable row is currently expanded.
   *
   * @param index Zero-based index within the visible rows.
   * @returns Promise resolving to true if `aria-expanded="true"`.
   */
  async isExpanded(index: number): Promise<boolean> {
    const row = await this.getRow(index);
    return (await row.getAttribute('aria-expanded')) === 'true';
  }

  /**
   * Whether a row is keyboard tab-focusable (`tabindex="0"`). Only expandable rows are.
   *
   * @param index Zero-based index within the visible rows.
   * @returns Promise resolving to true if the row is tab-focusable.
   */
  async isFocusable(index: number): Promise<boolean> {
    const row = await this.getRow(index);
    return (await row.getAttribute('tabindex')) === '0';
  }

  // --- Expansion ---

  /**
   * Toggles a row's expansion by clicking its toggle. No-op semantics are the tree's
   * (clicking a leaf does nothing).
   *
   * @param index Zero-based index within the visible rows.
   */
  async toggle(index: number): Promise<void> {
    const toggle = await this.locatorFor(
      `.tn-tree-node-wrapper[role="treeitem"]:nth-of-type(${index + 1}) .tn-tree-node`,
    )();
    await toggle.click();
  }

  /**
   * Expands a row if it is expandable and currently collapsed.
   *
   * @param index Zero-based index within the visible rows.
   */
  async expand(index: number): Promise<void> {
    if ((await this.isExpandable(index)) && !(await this.isExpanded(index))) {
      await this.toggle(index);
    }
  }

  /**
   * Collapses a row if it is currently expanded.
   *
   * @param index Zero-based index within the visible rows.
   */
  async collapse(index: number): Promise<void> {
    if (await this.isExpanded(index)) {
      await this.toggle(index);
    }
  }

  /**
   * Focuses a row and presses a key on it (Enter/Space toggle an expandable row).
   *
   * @param index Zero-based index within the visible rows.
   * @param key Which key to press — Enter or Space.
   */
  async pressKeyOnRow(index: number, key: 'enter' | 'space'): Promise<void> {
    const row = await this.getRow(index);
    await row.focus();
    await row.sendKeys(key === 'enter' ? TestKey.ENTER : ' ');
  }

  // --- Scroll-to-top button ---

  /**
   * Whether the floating scroll-to-top button is currently visible.
   *
   * @returns Promise resolving to true if the button is rendered.
   */
  async isScrollToTopVisible(): Promise<boolean> {
    return (await this.scrollTopButton()) !== null;
  }

  /**
   * Clicks the scroll-to-top button. Throws if it is not currently visible.
   */
  async clickScrollToTop(): Promise<void> {
    const button = await this.scrollTopButton();
    if (!button) {
      throw new Error('Scroll-to-top button is not currently visible');
    }
    await button.click();
  }

  // --- Internal helpers ---

  private async getRow(index: number): Promise<TestElement> {
    const rows = await this.rows();
    if (index >= rows.length) {
      throw new Error(`Row index ${index} out of bounds (${rows.length} materialised rows)`);
    }
    return rows[index];
  }

  private async getRowNumberAttribute(index: number, attr: string): Promise<number | null> {
    const row = await this.getRow(index);
    const value = await row.getAttribute(attr);
    return value === null ? null : Number(value);
  }
}

/**
 * Filters for finding `TnTreeVirtualScrollViewHarness` instances.
 */
export type TnTreeVirtualScrollViewHarnessFilters = BaseHarnessFilters;
