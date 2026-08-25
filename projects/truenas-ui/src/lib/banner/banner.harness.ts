import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate, parallel } from '@angular/cdk/testing';
import { TnBannerActionHarness } from './banner-action.harness';

/**
 * Harness for interacting with tn-banner in tests.
 * Provides text-based querying for existence checks, and access to the actions
 * the banner projects into its action slot.
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
 *
 * // Press one of the banner's actions
 * await errorBanner.clickAction('Retry');
 * ```
 */
export class TnBannerHarness extends ComponentHarness {
  /**
   * The selector for the host element of an `TnBannerComponent` instance.
   */
  static hostSelector = 'tn-banner';

  // Scoped to `.tn-banner__action` so a control the caller projected into the
  // default content slot is never mistaken for an action.
  private _actions = this.locatorForAll(
    TnBannerActionHarness.with({ ancestor: '.tn-banner__action' })
  );

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
        HarnessPredicate.stringMatches(
          harness.getText(),
          // strings trigger exact matching in `stringMatches`, but since we call the option
          // `textContains`, this would be misleading. here, we convert strings to a Regex
          // to trigger partial matching behavior on `stringMatches`.
          typeof text === 'string' ? new RegExp(helperEscapeRegex(text)) : text
        )
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

  /**
   * Gets every action the banner projects into its action slot, in DOM order.
   *
   * Actions are not necessarily `tn-button`s — `[tnBannerAction]` is an
   * attribute directive that takes any element — so these come back as
   * `TnBannerActionHarness`, which reads a label and clicks whatever was
   * projected. Nothing is filtered out by element type.
   *
   * @returns Promise resolving to an array of `TnBannerActionHarness` instances.
   *
   * @example
   * ```typescript
   * const banner = await loader.getHarness(TnBannerHarness);
   * const actions = await banner.getActions();
   * expect(actions).toHaveLength(2);
   * expect(await actions[0].getLabel()).toBe('Retry');
   * ```
   */
  async getActions(): Promise<TnBannerActionHarness[]> {
    return this._actions();
  }

  /**
   * Clicks one of the banner's actions by its label, matching the first in DOM
   * order. Only matches inside the `.tn-banner__action` slot, not controls in
   * the banner's default content.
   *
   * Named `clickAction` rather than `TnDialogHarness`'s `clickActionButton`
   * because a banner action need not be a button: a projected `<a
   * tnBannerAction>` is reached by this method exactly as a `tn-button` is.
   *
   * @param label The action label to match. Supports string or regex.
   * @throws Error naming the label, and the labels actually present, if nothing matches.
   *
   * @example
   * ```typescript
   * const banner = await loader.getHarness(
   *   TnBannerHarness.with({ textContains: 'network error' })
   * );
   * await banner.clickAction('Retry');
   * await banner.clickAction(/learn more/i);
   * ```
   */
  async clickAction(label: string | RegExp): Promise<void> {
    const matches = await this.locatorForAll(
      TnBannerActionHarness.with({ label, ancestor: '.tn-banner__action' })
    )();
    if (matches.length === 0) {
      // Naming what IS there turns the common miss — a label that reads
      // differently once rendered — from a hunt through the DOM into a diff.
      const actions = await this._actions();
      const labels = await parallel(() => actions.map((action) => action.getLabel()));
      const present = labels.length
        ? labels.map((found) => JSON.stringify(found)).join(', ')
        : '(none)';
      throw new Error(
        `No banner action found with label matching: ${label}. Actions present: ${present}`
      );
    }
    await matches[0].click();
  }
}

/**
 * A set of criteria that can be used to filter a list of `TnBannerHarness` instances.
 */
export interface BannerHarnessFilters extends BaseHarnessFilters {
  /** Filters by text content within banner. Supports string or regex matching. */
  textContains?: string | RegExp;
}

/**
 * helper function to stand-in for `RegExp.escape`, since that doesn't
 * exist in our deployment target of ES2023.
 * @param text a string to escape.
 * @returns an escaped string, safe for using in the `RegExp` constructor.
 */
function helperEscapeRegex(text: string): string {
  return text.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}
