import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Harness for interacting with tn-tab-panel in tests.
 * Provides methods for querying panel visibility and content.
 *
 * @example
 * ```typescript
 * // Get all panels
 * const panels = await loader.getAllHarnesses(TnTabPanelHarness);
 *
 * // Check which panel is active
 * for (const panel of panels) {
 *   if (await panel.isActive()) {
 *     const text = await panel.getTextContent();
 *     expect(text).toContain('Overview');
 *   }
 * }
 * ```
 */
export class TnTabPanelHarness extends ComponentHarness {
  /**
   * The selector for the host element of a `TnTabPanelComponent` instance.
   */
  static hostSelector = 'tn-tab-panel';

  private _panel = this.locatorFor('[role="tabpanel"]');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a tab panel
   * with specific attributes.
   *
   * @param options Options for filtering which panel instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   *
   * @example
   * ```typescript
   * const panel = await loader.getHarness(
   *   TnTabPanelHarness.with({ textContains: 'Overview' })
   * );
   * ```
   */
  static with(options: TabPanelHarnessFilters = {}) {
    return new HarnessPredicate(TnTabPanelHarness, options)
      .addOption('textContains', options.textContains, (harness, text) =>
        HarnessPredicate.stringMatches(harness.getTextContent(), text)
      );
  }

  /**
   * Checks whether the panel is currently active (visible).
   *
   * @returns Promise resolving to true if the panel is active.
   *
   * @example
   * ```typescript
   * const panel = await loader.getHarness(TnTabPanelHarness);
   * expect(await panel.isActive()).toBe(true);
   * ```
   */
  async isActive(): Promise<boolean> {
    const panel = await this._panel();
    return (await panel.getAttribute('aria-hidden')) === 'false';
  }

  /**
   * Gets the text content of the panel.
   *
   * @returns Promise resolving to the panel's text content.
   *
   * @example
   * ```typescript
   * const panel = await loader.getHarness(TnTabPanelHarness);
   * expect(await panel.getTextContent()).toContain('Overview');
   * ```
   */
  async getTextContent(): Promise<string> {
    const panel = await this._panel();
    return (await panel.text()).trim();
  }

  /**
   * Gets the panel's testId attribute value.
   *
   * @returns Promise resolving to the data-testid value, or null if not set.
   *
   * @example
   * ```typescript
   * const panel = await loader.getHarness(TnTabPanelHarness);
   * expect(await panel.getTestId()).toBe('my-panel');
   * ```
   */
  async getTestId(): Promise<string | null> {
    const panel = await this._panel();
    return panel.getAttribute('data-testid');
  }
}

/**
 * A set of criteria that can be used to filter a list of `TnTabPanelHarness` instances.
 */
export interface TabPanelHarnessFilters extends BaseHarnessFilters {
  /** Filters by text content within panel. Supports string or regex matching. */
  textContains?: string | RegExp;
}
