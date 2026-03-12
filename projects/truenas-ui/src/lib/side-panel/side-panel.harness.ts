import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

export interface SidePanelHarnessFilters extends BaseHarnessFilters {
  /** Filter by title text. */
  title?: string | RegExp;
}

/**
 * Harness for interacting with `TnSidePanelComponent` in tests.
 *
 * @example
 * ```typescript
 * const panel = await loader.getHarness(TnSidePanelHarness);
 * expect(await panel.isOpen()).toBe(true);
 * expect(await panel.getTitle()).toBe('Edit User');
 * await panel.dismiss();
 * ```
 */
export class TnSidePanelHarness extends ComponentHarness {
  static hostSelector = 'tn-side-panel';

  static with(options: SidePanelHarnessFilters = {}) {
    return new HarnessPredicate(TnSidePanelHarness, options)
      .addOption('title', options.title, (harness, title) =>
        HarnessPredicate.stringMatches(harness.getTitle(), title),
      );
  }

  /**
   * Locate the overlay wrapper, which may be portaled to document.body.
   * Uses the data-tn-panel attribute to correlate the host with its overlay.
   */
  private async getOverlay() {
    const host = await this.host();
    const panelId = await host.getAttribute('data-tn-panel');
    return this.documentRootLocatorFactory().locatorFor(`[data-tn-panel="${panelId}"].tn-side-panel__overlay`)();
  }

  /** Get the panel title text. */
  async getTitle(): Promise<string> {
    const host = await this.host();
    const panelId = await host.getAttribute('data-tn-panel');
    const titleEl = await this.documentRootLocatorFactory().locatorFor(
      `[data-tn-panel="${panelId}"] .tn-side-panel__title`,
    )();
    return (await titleEl.text()).trim();
  }

  /** Whether the panel is currently open. */
  async isOpen(): Promise<boolean> {
    const overlay = await this.getOverlay();
    return overlay.hasClass('tn-side-panel__overlay--open');
  }

  /** Click the dismiss button to close the panel. */
  async dismiss(): Promise<void> {
    const host = await this.host();
    const panelId = await host.getAttribute('data-tn-panel');
    const button = await this.documentRootLocatorFactory().locatorFor(
      `[data-tn-panel="${panelId}"] .tn-side-panel__header-actions tn-icon-button`,
    )();
    await button.click();
  }

  /** Get the text content of the scrollable body area. */
  async getContentText(): Promise<string> {
    const host = await this.host();
    const panelId = await host.getAttribute('data-tn-panel');
    const content = await this.documentRootLocatorFactory().locatorFor(
      `[data-tn-panel="${panelId}"] .tn-side-panel__content`,
    )();
    return (await content.text()).trim();
  }
}
