import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { TnButtonHarness } from '../button/button.harness';

/**
 * Harness for interacting with `tn-dialog-shell` in tests.
 *
 * Dialogs are portaled into the CDK overlay outside the component tree.
 * Use `TnDialogTesting.rootLoader(fixture)` to get a loader that can find them.
 *
 * @example
 * ```typescript
 * const dialogLoader = TnDialogTesting.rootLoader(fixture);
 *
 * // Find dialog by title
 * const dialog = await dialogLoader.getHarness(
 *   TnDialogHarness.with({ title: 'Delete Dataset?' })
 * );
 *
 * // Click an action button and close
 * await dialog.clickActionButton('Delete');
 * ```
 */
export class TnDialogHarness extends ComponentHarness {
  /**
   * The selector for the host element of a dialog shell instance.
   */
  static hostSelector = 'tn-dialog-shell';

  private _title = this.locatorFor('.tn-dialog__title');
  private _closeButton = this.locatorFor('.tn-dialog__close');
  private _fullscreenButton = this.locatorForOptional('.tn-dialog__fullscreen');
  private _content = this.locatorFor('.tn-dialog__content');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a dialog
   * with specific attributes.
   *
   * @param options Options for filtering which dialog instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   *
   * @example
   * ```typescript
   * const dialog = await dialogLoader.getHarness(
   *   TnDialogHarness.with({ title: 'Edit User' })
   * );
   *
   * // With regex
   * const dialog = await dialogLoader.getHarness(
   *   TnDialogHarness.with({ title: /delete/i })
   * );
   * ```
   */
  static with(options: DialogHarnessFilters = {}) {
    return new HarnessPredicate(TnDialogHarness, options)
      .addOption('title', options.title, (harness, title) =>
        HarnessPredicate.stringMatches(harness.getTitle(), title),
      );
  }

  /**
   * Gets the dialog's title text.
   *
   * @returns Promise resolving to the dialog title.
   *
   * @example
   * ```typescript
   * const dialog = await dialogLoader.getHarness(TnDialogHarness);
   * expect(await dialog.getTitle()).toBe('Edit User');
   * ```
   */
  async getTitle(): Promise<string> {
    const title = await this._title();
    return (await title.text()).trim();
  }

  /**
   * Gets the text content of the dialog's scrollable content area.
   *
   * @returns Promise resolving to the content text.
   *
   * @example
   * ```typescript
   * const dialog = await dialogLoader.getHarness(TnDialogHarness);
   * expect(await dialog.getContentText()).toContain('Are you sure?');
   * ```
   */
  async getContentText(): Promise<string> {
    const content = await this._content();
    return (await content.text()).trim();
  }

  /**
   * Clicks the close button (X) in the dialog header.
   *
   * @returns Promise that resolves when the click action is complete.
   *
   * @example
   * ```typescript
   * const dialog = await dialogLoader.getHarness(TnDialogHarness);
   * await dialog.close();
   * ```
   */
  async close(): Promise<void> {
    const closeBtn = await this._closeButton();
    await closeBtn.click();
  }

  /**
   * Clicks an action button in the dialog footer by its label.
   * Only matches buttons inside the `tnDialogAction` footer area, not buttons in content.
   *
   * @param label The button label to match. Supports string or regex.
   * @throws Error if no matching button is found in the actions area.
   *
   * @example
   * ```typescript
   * const dialog = await dialogLoader.getHarness(TnDialogHarness);
   * await dialog.clickActionButton('Save');
   * await dialog.clickActionButton(/cancel/i);
   * ```
   */
  async clickActionButton(label: string | RegExp): Promise<void> {
    const buttons = await this.locatorForAll(
      TnButtonHarness.with({ label, ancestor: '.tn-dialog__actions' }),
    )();
    if (buttons.length === 0) {
      throw new Error(`No action button found with label matching: ${label}`);
    }
    await buttons[0].click();
  }

  /**
   * Gets all action button harnesses in the dialog footer.
   *
   * @returns Promise resolving to an array of `TnButtonHarness` instances.
   *
   * @example
   * ```typescript
   * const dialog = await dialogLoader.getHarness(TnDialogHarness);
   * const buttons = await dialog.getActionButtons();
   * expect(buttons).toHaveLength(2);
   * ```
   */
  async getActionButtons(): Promise<TnButtonHarness[]> {
    return this.locatorForAll(
      TnButtonHarness.with({ ancestor: '.tn-dialog__actions' }),
    )();
  }

  /**
   * Whether the dialog has a fullscreen toggle button.
   *
   * @returns Promise resolving to true if the fullscreen button is present.
   */
  async hasFullscreenButton(): Promise<boolean> {
    return (await this._fullscreenButton()) !== null;
  }

  /**
   * Clicks the fullscreen toggle button.
   *
   * @throws Error if the dialog does not have a fullscreen button.
   */
  async toggleFullscreen(): Promise<void> {
    const btn = await this._fullscreenButton();
    if (!btn) {
      throw new Error('Dialog does not have a fullscreen button');
    }
    await btn.click();
  }

  /**
   * Whether the dialog is currently in fullscreen mode.
   * Checks the aria-label of the fullscreen button.
   *
   * @returns Promise resolving to true if fullscreen, false if not or if no fullscreen button.
   */
  async isFullscreen(): Promise<boolean> {
    const btn = await this._fullscreenButton();
    if (!btn) {
      return false;
    }
    const ariaLabel = await btn.getAttribute('aria-label');
    return ariaLabel === 'Exit fullscreen';
  }
}

/**
 * A set of criteria that can be used to filter a list of `TnDialogHarness` instances.
 */
export interface DialogHarnessFilters extends BaseHarnessFilters {
  /** Filters by dialog title text. Supports string or regex matching. */
  title?: string | RegExp;
}
