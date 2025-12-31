import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Harness for interacting with tn-banner in tests.
 * Provides simple text-based querying for existence checks.
 *
 * @example
 * ```typescript
 * // Check for existence
 * const banner = await loader.getHarness(TnBannerHarness);
 *
 * // Find banner containing specific text
 * const errorBanner = await loader.getHarness(
 *   TnBannerHarness.with({ textContains: 'network error' })
 * );
 *
 * // Check if banner exists with text
 * const hasBanner = await loader.hasHarness(
 *   TnBannerHarness.with({ textContains: /success/i })
 * );
 * ```
 */
export class TnBannerHarness extends ComponentHarness {
  /**
   * The selector for the host element of an `TnBannerComponent` instance.
   */
  static hostSelector = 'tn-banner';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a banner
   * with specific text content.
   *
   * @param options Options for filtering which banner instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   *
   * @example
   * ```typescript
   * // Find banner containing specific text
   * const banner = await loader.getHarness(
   *   TnBannerHarness.with({ textContains: 'error occurred' })
   * );
   *
   * // Find banner with regex pattern
   * const banner = await loader.getHarness(
   *   TnBannerHarness.with({ textContains: /Error:/ })
   * );
   * ```
   */
  static with(options: BannerHarnessFilters = {}) {
    return new HarnessPredicate(TnBannerHarness, options)
      .addOption('textContains', options.textContains, (harness, text) =>
        HarnessPredicate.stringMatches(harness.getText(), text)
      );
  }

  /**
   * Gets all text content from the banner (heading + message combined).
   *
   * @returns Promise resolving to the banner's text content, trimmed of whitespace.
   *
   * @example
   * ```typescript
   * const banner = await loader.getHarness(TnBannerHarness);
   * const text = await banner.getText();
   * expect(text).toContain('Success');
   * ```
   */
  async getText(): Promise<string> {
    const host = await this.host();
    return (await host.text()).trim();
  }
}

/**
 * A set of criteria that can be used to filter a list of `TnBannerHarness` instances.
 */
export interface BannerHarnessFilters extends BaseHarnessFilters {
  /** Filters by text content within banner. Supports string or regex matching. */
  textContains?: string | RegExp;
}
