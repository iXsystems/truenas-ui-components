import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import type { TnTreeNodeHarnessFilters } from './tree-node.harness';
import { TnTreeNodeHarness } from './tree-node.harness';

export * from './tree-node.harness';

/** Filters for finding `TnTreeHarness` instances. */
export type TnTreeHarnessFilters = BaseHarnessFilters;

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
