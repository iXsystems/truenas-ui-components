import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Harness for interacting with tn-empty in tests.
 * Provides text-based querying for verifying empty state content.
 *
 * @example
 * ```typescript
 * // Check for existence
 * const empty = await loader.getHarness(TnEmptyHarness);
 *
 * // Find empty state by title
 * const noItems = await loader.getHarness(
 *   TnEmptyHarness.with({ title: 'No items found' })
 * );
 *
 * // Check if empty state exists with specific text
 * const hasEmpty = await loader.hasHarness(
 *   TnEmptyHarness.with({ title: /no.*found/i })
 * );
 * ```
 */
export class TnEmptyHarness extends ComponentHarness {
  /**
   * The selector for the host element of a `TnEmptyComponent` instance.
   */
  static hostSelector = 'tn-empty';

  private _title = this.locatorFor('.tn-empty__title');
  private _description = this.locatorForOptional('.tn-empty__description');

  /**
   * Gets a `HarnessPredicate` that can be used to search for an empty state
   * with specific attributes.
   *
   * @param options Options for filtering which empty state instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   *
   * @example
   * ```typescript
   * // Find by title
   * const empty = await loader.getHarness(
   *   TnEmptyHarness.with({ title: 'No results' })
   * );
   *
   * // Find by title regex
   * const empty = await loader.getHarness(
   *   TnEmptyHarness.with({ title: /empty/i })
   * );
   * ```
   */
  static with(options: EmptyHarnessFilters = {}) {
    return new HarnessPredicate(TnEmptyHarness, options)
      .addOption('title', options.title, (harness, title) =>
        HarnessPredicate.stringMatches(harness.getTitle(), title)
      );
  }

  /**
   * Gets the title text.
   *
   * @returns Promise resolving to the empty state's title text.
   *
   * @example
   * ```typescript
   * const empty = await loader.getHarness(TnEmptyHarness);
   * const title = await empty.getTitle();
   * expect(title).toBe('No items found');
   * ```
   */
  async getTitle(): Promise<string> {
    const title = await this._title();
    return (await title.text()).trim();
  }

  /**
   * Gets the description text, or null if no description is rendered.
   *
   * @returns Promise resolving to the description text, or null.
   *
   * @example
   * ```typescript
   * const empty = await loader.getHarness(TnEmptyHarness);
   * const desc = await empty.getDescription();
   * expect(desc).toBe('Try adjusting your filters');
   * ```
   */
  async getDescription(): Promise<string | null> {
    const desc = await this._description();
    if (!desc) {
      return null;
    }
    return (await desc.text()).trim();
  }

  /**
   * Gets all text content from the empty state (title + description combined).
   *
   * @returns Promise resolving to the full text content, trimmed of whitespace.
   *
   * @example
   * ```typescript
   * const empty = await loader.getHarness(TnEmptyHarness);
   * const text = await empty.getText();
   * expect(text).toContain('No items');
   * ```
   */
  async getText(): Promise<string> {
    const host = await this.host();
    return (await host.text()).trim();
  }
}

/**
 * A set of criteria that can be used to filter a list of `TnEmptyHarness` instances.
 */
export interface EmptyHarnessFilters extends BaseHarnessFilters {
  /** Filters by title text. Supports string or regex matching. */
  title?: string | RegExp;
}
