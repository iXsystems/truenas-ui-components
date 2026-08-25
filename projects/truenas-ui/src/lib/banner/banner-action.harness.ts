import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Harness for a single action projected into a `tn-banner`'s action slot.
 *
 * Reach these through `TnBannerHarness.getActions()` / `clickAction()` rather
 * than loading them directly — on their own they would also match a
 * `[tnBannerAction]` element that some other component projects.
 *
 * `[tnBannerAction]` is an attribute directive with no element restriction, so
 * an action is whatever the caller projected: a `tn-button`, a plain `<a>`, a
 * native `<button>`. This harness covers all of them rather than assuming
 * `tn-button`, which is why `TnBannerHarness` does not simply locate
 * `TnButtonHarness` the way `TnDialogHarness` does — a dialog's footer takes
 * `tn-button`s, a banner's action slot takes anything.
 *
 * @example
 * ```typescript
 * const banner = await loader.getHarness(TnBannerHarness);
 * const actions = await banner.getActions();
 * expect(await actions[0].getLabel()).toBe('Retry');
 * await actions[0].click();
 * ```
 */
export class TnBannerActionHarness extends ComponentHarness {
  /**
   * The selector for the host element of a banner action.
   */
  static hostSelector = '[tnBannerAction]';

  // A `tn-button` renders its text into a dedicated label span and its click
  // target into an inner `button`/`a`. A plain projected element — `<a
  // tnBannerAction>`, `<button tnBannerAction>` — is both of those itself, and
  // matches neither locator. Both are optional so one harness covers either
  // shape, falling back to the host.
  private _buttonLabel = this.locatorForOptional('.storybook-button__label');
  private _innerControl = this.locatorForOptional('button, a');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a banner action
   * with a specific label.
   *
   * @param options Options for filtering which action instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   *
   * @example
   * ```typescript
   * const retry = await loader.getHarness(
   *   TnBannerActionHarness.with({ label: 'Retry' })
   * );
   * ```
   */
  static with(options: BannerActionHarnessFilters = {}) {
    return new HarnessPredicate(TnBannerActionHarness, options)
      .addOption('label', options.label, (harness, label) =>
        HarnessPredicate.stringMatches(harness.getLabel(), label)
      );
  }

  /**
   * Gets the action's label text.
   *
   * For a projected `tn-button` this is the button's own label, read from its
   * label span so a rendered icon's sprite-fallback glyphs never leak in — the
   * same rule `TnButtonHarness.getLabel()` follows. For anything else it is the
   * element's trimmed text content.
   *
   * @returns Promise resolving to the action's label, trimmed of whitespace.
   *
   * @example
   * ```typescript
   * const [action] = await banner.getActions();
   * expect(await action.getLabel()).toBe('Learn more');
   * ```
   */
  async getLabel(): Promise<string> {
    const buttonLabel = await this._buttonLabel();
    if (buttonLabel) {
      return (await buttonLabel.text()).trim();
    }
    const host = await this.host();
    return (await host.text()).trim();
  }

  /**
   * Clicks the action.
   *
   * Clicks the inner `button`/`a` when the action is a component that renders
   * one — a `tn-button` listens on that inner element, and a click dispatched
   * at the `tn-button` host would not reach it. Otherwise clicks the projected
   * element itself.
   *
   * @returns Promise that resolves when the click action is complete.
   *
   * @example
   * ```typescript
   * const [action] = await banner.getActions();
   * await action.click();
   * ```
   */
  async click(): Promise<void> {
    const inner = await this._innerControl();
    const target = inner ?? (await this.host());
    return target.click();
  }
}

/**
 * A set of criteria that can be used to filter a list of `TnBannerActionHarness` instances.
 */
export interface BannerActionHarnessFilters extends BaseHarnessFilters {
  /** Filters by the action's label text. Supports string or regex matching. */
  label?: string | RegExp;
}
