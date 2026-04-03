import { ComponentHarness } from '@angular/cdk/testing';

/**
 * Harness for interacting with tn-drawer in tests.
 *
 * @example
 * ```typescript
 * const drawer = await loader.getHarness(TnDrawerHarness);
 * expect(await drawer.isOpen()).toBe(false);
 * ```
 */
export class TnDrawerHarness extends ComponentHarness {
  static hostSelector = 'tn-drawer';

  private _inlinePanel = this.locatorForOptional('.tn-drawer__panel');

  /**
   * Checks whether the drawer panel has the open class.
   * Checks both inline (side mode) and portaled (over mode) panels.
   *
   * @returns Promise resolving to true if the drawer is open.
   *
   * @example
   * ```typescript
   * const drawer = await loader.getHarness(TnDrawerHarness);
   * expect(await drawer.isOpen()).toBe(true);
   * ```
   */
  async isOpen(): Promise<boolean> {
    // Check inline panel first (side mode)
    const inlinePanel = await this._inlinePanel();
    if (inlinePanel) {
      return inlinePanel.hasClass('tn-drawer__panel--open');
    }
    // Check portaled panel (over mode)
    const portaledPanel = document.body.querySelector('.tn-drawer__panel--over');
    return portaledPanel?.classList.contains('tn-drawer__panel--open') ?? false;
  }

  /**
   * Checks whether the backdrop overlay is visible.
   *
   * @returns Promise resolving to true if the backdrop is visible.
   *
   * @example
   * ```typescript
   * const drawer = await loader.getHarness(TnDrawerHarness);
   * expect(await drawer.hasBackdrop()).toBe(true);
   * ```
   */
  async hasBackdrop(): Promise<boolean> {
    const backdrop = document.body.querySelector('.tn-drawer__backdrop');
    return backdrop?.classList.contains('tn-drawer__backdrop--visible') ?? false;
  }

  /**
   * Clicks the backdrop to close the drawer (only available in 'over' mode).
   *
   * @example
   * ```typescript
   * const drawer = await loader.getHarness(TnDrawerHarness);
   * await drawer.clickBackdrop();
   * expect(await drawer.isOpen()).toBe(false);
   * ```
   */
  async clickBackdrop(): Promise<void> {
    const backdrop = document.body.querySelector('.tn-drawer__backdrop--visible') as HTMLElement | null;
    if (!backdrop) {
      throw new Error('No visible backdrop found — drawer may not be in "over" mode or not open.');
    }
    backdrop.click();
  }
}

/**
 * Harness for interacting with tn-drawer-container in tests.
 *
 * @example
 * ```typescript
 * const container = await loader.getHarness(TnDrawerContainerHarness);
 * const drawer = await container.getDrawer();
 * ```
 */
export class TnDrawerContainerHarness extends ComponentHarness {
  static hostSelector = 'tn-drawer-container';

  /**
   * Gets the drawer harness within this container.
   */
  async getDrawer(): Promise<TnDrawerHarness> {
    return this.locatorFor(TnDrawerHarness)();
  }
}
