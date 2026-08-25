import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Harness for interacting with a tooltip rendered by `tnTooltip` in tests.
 *
 * Tooltips render in a CDK overlay **outside** the component tree, so the regular
 * `TestbedHarnessEnvironment.loader(fixture)` won't find them. Use
 * `TnTooltipTesting.rootLoader(fixture)` instead — it searches the whole document.
 *
 * @example
 * ```typescript
 * import { TnTooltipHarness, TnTooltipTesting } from '@truenas/ui-components';
 *
 * const rootLoader = TnTooltipTesting.rootLoader(fixture);
 *
 * // Hover tooltip: show it, then read it
 * host.dispatchEvent(new MouseEvent('mouseenter'));
 * const tooltip = await rootLoader.getHarness(TnTooltipHarness);
 * expect(await tooltip.getText()).toBe('Pool is online');
 *
 * // Sticky tooltip: click the host to pin it, then dismiss it
 * host.click();
 * const pinned = await rootLoader.getHarness(TnTooltipHarness);
 * expect(await pinned.isSticky()).toBe(true);
 * await pinned.dismiss();
 * ```
 */
export class TnTooltipHarness extends ComponentHarness {
  /**
   * The selector for the host element of a `TnTooltipComponent` instance.
   */
  static hostSelector = 'tn-tooltip';

  private _panel = this.locatorFor('.tn-tooltip');
  private _message = this.locatorFor('.tn-tooltip__message');
  private _closeButton = this.locatorForOptional('.tn-tooltip__close');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a tooltip with specific
   * attributes. Useful when more than one tooltip is on screen — a pinned one plus a hover
   * one, for instance.
   *
   * @param options Options for filtering which tooltip instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   *
   * @example
   * ```typescript
   * // Find a tooltip by its text
   * const tooltip = await rootLoader.getHarness(TnTooltipHarness.with({ text: 'Pool is online' }));
   *
   * // Find only the pinned one
   * const pinned = await rootLoader.getHarness(TnTooltipHarness.with({ sticky: true }));
   * ```
   */
  static with(options: TooltipHarnessFilters = {}) {
    return new HarnessPredicate(TnTooltipHarness, options)
      .addOption('text', options.text, (harness, text) =>
        HarnessPredicate.stringMatches(harness.getText(), text)
      )
      .addOption('sticky', options.sticky, async (harness, sticky) =>
        (await harness.isSticky()) === sticky
      );
  }

  /**
   * Gets the tooltip's text content, with any markup in the message stripped.
   *
   * @returns Promise resolving to the tooltip's text.
   *
   * @example
   * ```typescript
   * const tooltip = await rootLoader.getHarness(TnTooltipHarness);
   * expect(await tooltip.getText()).toBe('Pool is online');
   * ```
   */
  async getText(): Promise<string> {
    const message = await this._message();
    return (await message.text()).trim();
  }

  /**
   * Checks whether the tooltip is pinned open (sticky mode), i.e. interactive and dismissible
   * rather than tied to the pointer.
   *
   * @returns Promise resolving to true if the tooltip is pinned.
   *
   * @example
   * ```typescript
   * host.click();
   * const tooltip = await rootLoader.getHarness(TnTooltipHarness);
   * expect(await tooltip.isSticky()).toBe(true);
   * ```
   */
  async isSticky(): Promise<boolean> {
    const panel = await this._panel();
    return panel.hasClass('tn-tooltip--sticky');
  }

  /**
   * Gets the accessible name of the dismiss button, or null when the tooltip isn't pinned.
   *
   * @returns Promise resolving to the dismiss button's aria-label.
   *
   * @example
   * ```typescript
   * const tooltip = await rootLoader.getHarness(TnTooltipHarness);
   * expect(await tooltip.getDismissLabel()).toBe('Close tooltip');
   * ```
   */
  async getDismissLabel(): Promise<string | null> {
    const closeButton = await this._closeButton();
    return closeButton ? closeButton.getAttribute('aria-label') : null;
  }

  /**
   * Clicks the tooltip's dismiss button. Throws if the tooltip isn't pinned, since the button
   * only exists in sticky mode.
   *
   * @returns Promise that resolves when the tooltip has been dismissed.
   *
   * @example
   * ```typescript
   * const tooltip = await rootLoader.getHarness(TnTooltipHarness);
   * await tooltip.dismiss();
   * ```
   */
  async dismiss(): Promise<void> {
    const closeButton = await this._closeButton();
    if (!closeButton) {
      throw new Error('Cannot dismiss a tooltip that is not sticky (no dismiss button rendered).');
    }
    return closeButton.click();
  }

  /**
   * Clicks an element inside the tooltip's message — a link, typically. Only meaningful in
   * sticky mode, where the tooltip stops being click-through.
   *
   * @param selector CSS selector of the element to click, relative to the message.
   * @returns Promise that resolves when the click action is complete.
   *
   * @example
   * ```typescript
   * const tooltip = await rootLoader.getHarness(TnTooltipHarness);
   * await tooltip.clickContent('a');
   * ```
   */
  async clickContent(selector: string): Promise<void> {
    const element = await this.locatorFor(`.tn-tooltip__message ${selector}`)();
    return element.click();
  }
}

/**
 * A set of criteria that can be used to filter a list of `TnTooltipHarness` instances.
 */
export interface TooltipHarnessFilters extends BaseHarnessFilters {
  /** Filters by the tooltip's text. Supports string or regex matching. */
  text?: string | RegExp;
  /** Filters by whether the tooltip is pinned open (sticky mode). */
  sticky?: boolean;
}
