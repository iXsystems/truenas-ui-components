import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Harness for interacting with `tn-expansion-panel` in tests.
 * Provides methods for expanding, collapsing, and querying panel state.
 *
 * @example
 * ```typescript
 * // Find and expand a panel
 * const panel = await loader.getHarness(TnExpansionPanelHarness.with({ title: 'Settings' }));
 * await panel.expand();
 * expect(await panel.isExpanded()).toBe(true);
 *
 * // Collapse a panel
 * await panel.collapse();
 * expect(await panel.isExpanded()).toBe(false);
 * ```
 */
export class TnExpansionPanelHarness extends ComponentHarness {
  /**
   * The selector for the host element of a `TnExpansionPanelComponent` instance.
   */
  static hostSelector = 'tn-expansion-panel';

  private _header = this.locatorFor('.tn-expansion-panel__header');
  private _title = this.locatorForOptional('.tn-expansion-panel__title');

  /**
   * Gets a `HarnessPredicate` that can be used to search for an expansion panel
   * with specific attributes.
   *
   * @param options Options for filtering which panel instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   *
   * @example
   * ```typescript
   * // Find by title text
   * const panel = await loader.getHarness(TnExpansionPanelHarness.with({ title: 'Settings' }));
   *
   * // Find by title regex
   * const panel = await loader.getHarness(TnExpansionPanelHarness.with({ title: /settings/i }));
   * ```
   */
  static with(options: ExpansionPanelHarnessFilters = {}) {
    return new HarnessPredicate(TnExpansionPanelHarness, options)
      .addOption('title', options.title, (harness, title) =>
        HarnessPredicate.stringMatches(harness.getTitle(), title)
      );
  }

  /**
   * Gets the expansion panel title text.
   *
   * @returns Promise resolving to the title text, or empty string if no title.
   *
   * @example
   * ```typescript
   * const panel = await loader.getHarness(TnExpansionPanelHarness);
   * expect(await panel.getTitle()).toBe('Settings');
   * ```
   */
  async getTitle(): Promise<string> {
    const title = await this._title();
    return title ? (await title.text()).trim() : '';
  }

  /**
   * Checks whether the expansion panel is currently expanded.
   *
   * @returns Promise resolving to true if the panel is expanded.
   *
   * @example
   * ```typescript
   * const panel = await loader.getHarness(TnExpansionPanelHarness);
   * expect(await panel.isExpanded()).toBe(false);
   * ```
   */
  async isExpanded(): Promise<boolean> {
    const header = await this._header();
    return (await header.getAttribute('aria-expanded')) === 'true';
  }

  /**
   * Checks whether the expansion panel is disabled.
   *
   * @returns Promise resolving to true if the panel is disabled.
   *
   * @example
   * ```typescript
   * const panel = await loader.getHarness(TnExpansionPanelHarness);
   * expect(await panel.isDisabled()).toBe(false);
   * ```
   */
  async isDisabled(): Promise<boolean> {
    const header = await this._header();
    return (await header.getProperty<boolean>('disabled')) ?? false;
  }

  /**
   * Toggles the expansion panel by clicking the header.
   *
   * @example
   * ```typescript
   * const panel = await loader.getHarness(TnExpansionPanelHarness);
   * await panel.toggle();
   * ```
   */
  async toggle(): Promise<void> {
    const header = await this._header();
    await header.click();
  }

  /**
   * Expands the panel. No-op if already expanded.
   *
   * @example
   * ```typescript
   * const panel = await loader.getHarness(TnExpansionPanelHarness);
   * await panel.expand();
   * expect(await panel.isExpanded()).toBe(true);
   * ```
   */
  async expand(): Promise<void> {
    if (!(await this.isExpanded())) {
      await this.toggle();
    }
  }

  /**
   * Collapses the panel. No-op if already collapsed.
   *
   * @example
   * ```typescript
   * const panel = await loader.getHarness(TnExpansionPanelHarness);
   * await panel.collapse();
   * expect(await panel.isExpanded()).toBe(false);
   * ```
   */
  async collapse(): Promise<void> {
    if (await this.isExpanded()) {
      await this.toggle();
    }
  }
}

/**
 * A set of criteria that can be used to filter a list of `TnExpansionPanelHarness` instances.
 */
export interface ExpansionPanelHarnessFilters extends BaseHarnessFilters {
  /** Filters by title text. Supports string or regex matching. */
  title?: string | RegExp;
}
