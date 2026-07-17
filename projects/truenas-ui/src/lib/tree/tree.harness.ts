import type { BaseHarnessFilters, TestElement } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/** Filters for finding `TnTreeNodeHarness` instances. */
export interface TnTreeNodeHarnessFilters extends BaseHarnessFilters {
  /** Only find nodes whose text matches the given value. */
  text?: string | RegExp;
  /** Only find nodes whose expansion state matches. */
  expanded?: boolean;
  /** Only find nodes at the given 0-based level (root nodes are 0). */
  level?: number;
}

/** Filters for finding `TnTreeHarness` instances. */
export type TnTreeHarnessFilters = BaseHarnessFilters;

/**
 * Harness for interacting with a single `tn-tree-node` or `tn-nested-tree-node`.
 *
 * Levels are 0-based (root nodes are level 0), matching the values consumers pass
 * to tree controls — the DOM's 1-based `aria-level` is converted internally.
 */
export class TnTreeNodeHarness extends ComponentHarness {
  static hostSelector = '.tn-tree-node-wrapper, .tn-nested-tree-node-wrapper';

  /** The built-in nested-node toggle button (absent on flat nodes, leaves, and `hideToggle` nodes). */
  private readonly nestedToggle = this.locatorForOptional('.tn-nested-tree-node__toggle');

  /** The flat node's row, which acts as its toggle surface. */
  private readonly flatRow = this.locatorForOptional('.tn-tree-node');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a tree node with
   * specific attributes.
   *
   * @param options Options for filtering which instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   */
  static with(options: TnTreeNodeHarnessFilters = {}): HarnessPredicate<TnTreeNodeHarness> {
    return new HarnessPredicate(TnTreeNodeHarness, options)
      .addOption('text', options.text,
        (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text))
      .addOption('expanded', options.expanded,
        async (harness, expanded) => (await harness.isExpanded()) === expanded)
      .addOption('level', options.level,
        async (harness, level) => (await harness.getLevel()) === level);
  }

  /**
   * Gets the node's own text, excluding any descendant tree nodes and the
   * built-in toggle button.
   *
   * @returns Promise resolving to the node's text.
   */
  async getText(): Promise<string> {
    return (await this.host()).text({
      exclude: '.tn-tree-node-wrapper, .tn-nested-tree-node-wrapper, button',
    });
  }

  /**
   * Gets the node's 0-based level (root nodes are 0).
   *
   * @returns Promise resolving to the level.
   */
  async getLevel(): Promise<number> {
    const ariaLevel = await (await this.host()).getAttribute('aria-level');
    return Number(ariaLevel) - 1;
  }

  /**
   * Whether the node is expandable (advertises `aria-expanded`).
   *
   * @returns Promise resolving to true if the node is expandable.
   */
  async isExpandable(): Promise<boolean> {
    return (await (await this.host()).getAttribute('aria-expanded')) !== null;
  }

  /**
   * Whether an expandable node is currently expanded.
   *
   * @returns Promise resolving to true if `aria-expanded="true"`.
   */
  async isExpanded(): Promise<boolean> {
    return (await (await this.host()).getAttribute('aria-expanded')) === 'true';
  }

  /**
   * Toggles the node's expansion by clicking its toggle surface — the built-in
   * toggle button on a nested node, or the row itself on a flat node. Throws for
   * nested nodes rendered with `hideToggle` (interact with the custom toggle
   * directly in that case).
   */
  async toggle(): Promise<void> {
    await (await this.getToggle()).click();
  }

  /**
   * Toggles the node together with all of its descendants (Alt+click on the
   * built-in nested-node toggle).
   */
  async toggleWithDescendants(): Promise<void> {
    await (await this.getToggle()).click({ alt: true });
  }

  /**
   * Expands the node if it is expandable and currently collapsed.
   */
  async expand(): Promise<void> {
    if ((await this.isExpandable()) && !(await this.isExpanded())) {
      await this.toggle();
    }
  }

  /**
   * Collapses the node if it is currently expanded.
   */
  async collapse(): Promise<void> {
    if (await this.isExpanded()) {
      await this.toggle();
    }
  }

  private async getToggle(): Promise<TestElement> {
    const toggle = (await this.nestedToggle()) ?? (await this.flatRow());
    if (!toggle) {
      throw new Error('Node has no toggle surface (nested node with hideToggle?)');
    }
    return toggle;
  }
}

/**
 * Harness for interacting with `tn-tree` in tests.
 *
 * @example
 * ```typescript
 * const tree = await loader.getHarness(TnTreeHarness);
 * const roots = await tree.getNodes({ level: 0 });
 * await roots[0].expand();
 * expect(await tree.getNodeTexts()).toContain('child');
 * ```
 */
export class TnTreeHarness extends ComponentHarness {
  static hostSelector = 'tn-tree';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a tree with
   * specific attributes.
   *
   * @param options Options for filtering which instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   */
  static with(options: TnTreeHarnessFilters = {}): HarnessPredicate<TnTreeHarness> {
    return new HarnessPredicate(TnTreeHarness, options);
  }

  /**
   * Gets the harnesses for the tree's nodes (all levels, in document order).
   *
   * Note: nested trees render collapsed subtrees into the DOM (hidden via CSS),
   * so nodes under a collapsed parent are still returned — filter by `level` or
   * check the parent's `isExpanded()` when visibility matters.
   *
   * @param filter Optional filter to narrow the nodes.
   * @returns Promise resolving to the matching node harnesses.
   */
  async getNodes(filter: TnTreeNodeHarnessFilters = {}): Promise<TnTreeNodeHarness[]> {
    return this.locatorForAll(TnTreeNodeHarness.with(filter))();
  }

  /**
   * Gets the text of every node currently rendered, in document order.
   *
   * @returns Promise resolving to an array of node texts.
   */
  async getNodeTexts(): Promise<string[]> {
    const nodes = await this.getNodes();
    return Promise.all(nodes.map((node) => node.getText()));
  }
}
