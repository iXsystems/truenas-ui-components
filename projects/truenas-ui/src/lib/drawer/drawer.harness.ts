import { ComponentHarness } from '@angular/cdk/testing';

/**
 * Harness for interacting with tn-drawer in tests.
 *
 * @example
 * ```typescript
 * const drawer = await loader.getHarness(TnDrawerHarness);
 * expect(await drawer.isOpen()).toBe(false);
 *
 * // Check if backdrop is visible
 * expect(await drawer.hasBackdrop()).toBe(false);
 * ```
 */
export class TnDrawerHarness extends ComponentHarness {
  static hostSelector = 'tn-drawer';

  private _panel = this.locatorFor('.tn-drawer__panel');
  private _backdrop = this.locatorForOptional('.tn-drawer__backdrop');

  /**
   * Checks whether the drawer panel has the open class.
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
    const panel = await this._panel();
    return panel.hasClass('tn-drawer__panel--open');
  }

  /**
   * Checks whether the backdrop overlay is present.
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
    const backdrop = await this._backdrop();
    return backdrop !== null;
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
    const backdrop = await this._backdrop();
    if (!backdrop) {
      throw new Error('No backdrop found — drawer may not be in "over" mode or not open.');
    }
    await backdrop.click();
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
