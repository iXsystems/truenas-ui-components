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

  private panelLocator = this.locatorFor('.tn-side-panel__panel');
  private titleLocator = this.locatorFor('.tn-side-panel__title');
  private dismissLocator = this.locatorFor('.tn-side-panel__header-actions tn-icon-button');
  private contentLocator = this.locatorFor('.tn-side-panel__content');

  /** Get the panel title text. */
  async getTitle(): Promise<string> {
    const title = await this.titleLocator();
    return (await title.text()).trim();
  }

  /** Whether the panel host has the open class. */
  async isOpen(): Promise<boolean> {
    const host = await this.host();
    return host.hasClass('tn-side-panel--open');
  }

  /** Click the dismiss button to close the panel. */
  async dismiss(): Promise<void> {
    const button = await this.dismissLocator();
    await button.click();
  }

  /** Get the text content of the scrollable body area. */
  async getContentText(): Promise<string> {
    const content = await this.contentLocator();
    return (await content.text()).trim();
  }
}
