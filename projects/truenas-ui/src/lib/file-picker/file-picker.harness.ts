import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { TnButtonHarness } from '../button/button.harness';

/**
 * Harness for interacting with tn-file-picker in tests.
 *
 * The core API (`getValue` / `setValue` / `isDisabled`) mirrors webui's
 * `IxExplorerHarness` so tests migrate with minimal changes: `setValue`
 * accepts a string or string array (joined with commas) and commits it the
 * way a user would — by typing into the path input and triggering its
 * `change` event. Unlike ix-explorer the component renders no label of its
 * own (labels come from a wrapping `tn-form-field`), so instances are
 * filtered by `testId` or `placeholder` instead.
 *
 * Popup helpers (`open`, `getItemNames`, `clickItem`, …) drive the browse
 * flow. The popup renders in a CDK overlay outside the component, so these
 * find it at the document root — with several pickers on a page they address
 * whichever popup is open (only one can be, thanks to the overlay backdrop).
 *
 * @example
 * ```typescript
 * // Type a path, ix-explorer style
 * const picker = await loader.getHarness(TnFilePickerHarness.with({ testId: 'file-picker-source-path' }));
 * await picker.setValue('/mnt/tank/media');
 * expect(await picker.getValue()).toBe('/mnt/tank/media');
 *
 * // Browse and pick an item through the popup
 * await picker.open();
 * await picker.clickItem('Documents');
 * await picker.clickSelect();
 * ```
 */
export class TnFilePickerHarness extends ComponentHarness {
  /**
   * The selector for the host element of a `TnFilePickerComponent` instance.
   */
  static hostSelector = 'tn-file-picker';

  private _container = this.locatorFor('.tn-file-picker-container');
  private _input = this.locatorFor('input.tn-file-picker-input');
  private _toggle = this.locatorFor('button.tn-file-picker-toggle');

  // The popup renders in a CDK overlay (outside the host), so it is located
  // from the document root rather than the host subtree.
  private _popup = this.documentRootLocatorFactory().locatorForOptional('tn-file-picker-popup');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a file picker
   * with specific attributes.
   *
   * @param options Options for filtering which file picker instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   *
   * @example
   * ```typescript
   * // Find by testId (the rendered attribute, i.e. including the 'file-picker-' prefix)
   * const picker = await loader.getHarness(TnFilePickerHarness.with({ testId: 'file-picker-source-path' }));
   *
   * // Find by placeholder
   * const picker = await loader.getHarness(TnFilePickerHarness.with({ placeholder: 'Select folder' }));
   * ```
   */
  static with(options: FilePickerHarnessFilters = {}) {
    return new HarnessPredicate(TnFilePickerHarness, options)
      .addOption('placeholder', options.placeholder, async (harness, placeholder) =>
        (await harness.getPlaceholder()) === placeholder
      )
      .addOption('testId', options.testId, async (harness, testId) =>
        (await harness.getTestId()) === testId
      );
  }

  /**
   * Gets the current value shown in the path input.
   *
   * Note: with `multiSelect`, the component displays the selected paths
   * joined with `', '` (comma-space), so that is what this resolves to.
   *
   * @returns Promise resolving to the input's value.
   *
   * @example
   * ```typescript
   * expect(await picker.getValue()).toBe('/mnt/tank/media');
   * ```
   */
  async getValue(): Promise<string> {
    const input = await this._input();
    return (await input.getProperty<string>('value')) ?? '';
  }

  /**
   * Sets the picker's value by typing into the path input and committing it
   * via the input's `change` event, exactly as a user pressing Enter would.
   * Arrays are joined with commas, matching `IxExplorerHarness.setValue`.
   *
   * Commits go through the component's normal validation: paths outside
   * `rootPath` are rejected (the value stays unchanged and an `error` is
   * emitted), and `callbacks.validatePath` is consulted when provided.
   * Setting an empty string clears the selection. Has no effect when
   * `allowManualInput` is false (the input is readonly).
   *
   * @param value The path (or paths) to set.
   *
   * @example
   * ```typescript
   * await picker.setValue('/mnt/tank/media');
   * await picker.setValue(['/mnt/a', '/mnt/b']);
   * ```
   */
  async setValue(value: string | string[]): Promise<void> {
    if (Array.isArray(value)) {
      value = value.join(',');
    }
    const input = await this._input();
    await input.clear();
    if (value) {
      await input.sendKeys(value);
    }
    return input.dispatchEvent('change');
  }

  /**
   * Gets the path input's placeholder text.
   *
   * @returns Promise resolving to the placeholder string, or null if unset.
   *
   * @example
   * ```typescript
   * expect(await picker.getPlaceholder()).toBe('Select file or folder');
   * ```
   */
  async getPlaceholder(): Promise<string | null> {
    const input = await this._input();
    return input.getAttribute('placeholder');
  }

  /**
   * Checks whether the picker is disabled (via the `disabled` input or a
   * disabled form control).
   *
   * @returns Promise resolving to true if the picker is disabled.
   *
   * @example
   * ```typescript
   * expect(await picker.isDisabled()).toBe(false);
   * ```
   */
  async isDisabled(): Promise<boolean> {
    const input = await this._input();
    return (await input.getProperty<boolean>('disabled')) ?? false;
  }

  /**
   * Checks whether manual path entry is disallowed (`allowManualInput` is
   * false), rendering the path input readonly.
   *
   * @returns Promise resolving to true if the input is readonly.
   *
   * @example
   * ```typescript
   * expect(await picker.isReadonly()).toBe(false);
   * ```
   */
  async isReadonly(): Promise<boolean> {
    const input = await this._input();
    return (await input.getProperty<boolean>('readOnly')) ?? false;
  }

  /**
   * Gets the test-id attribute value from the container.
   *
   * @returns Promise resolving to the test-id, or null when unset.
   *
   * @example
   * ```typescript
   * expect(await picker.getTestId()).toBe('file-picker-source-path');
   * ```
   */
  async getTestId(): Promise<string | null> {
    const container = await this._container();
    return (await container.getAttribute('data-testid')) ?? (await container.getAttribute('data-test'));
  }

  /**
   * Opens the browse popup by clicking the folder toggle button. No-op if
   * the popup is already open.
   *
   * @example
   * ```typescript
   * await picker.open();
   * expect(await picker.isOpen()).toBe(true);
   * ```
   */
  async open(): Promise<void> {
    if (await this.isOpen()) {
      return;
    }
    await (await this._toggle()).click();
  }

  /**
   * Closes the browse popup without applying the pending selection, by
   * clicking the overlay backdrop (the same dismissal a user clicking
   * outside performs). No-op if the popup is not open.
   *
   * @example
   * ```typescript
   * await picker.close();
   * expect(await picker.isOpen()).toBe(false);
   * ```
   */
  async close(): Promise<void> {
    const backdrop = await this.documentRootLocatorFactory()
      .locatorForOptional('.cdk-overlay-backdrop')();
    if (backdrop) {
      await backdrop.click();
    }
  }

  /**
   * Checks whether the browse popup is currently open.
   *
   * @returns Promise resolving to true if the popup is open.
   *
   * @example
   * ```typescript
   * expect(await picker.isOpen()).toBe(false);
   * ```
   */
  async isOpen(): Promise<boolean> {
    return (await this._popup()) !== null;
  }

  /**
   * Gets the labels of the breadcrumb segments in the popup header. Long
   * paths are truncated by the component, so a segment may be `'…'`.
   *
   * @returns Promise resolving to the breadcrumb segment labels.
   *
   * @example
   * ```typescript
   * await picker.open();
   * expect(await picker.getBreadcrumbSegments()).toEqual(['mnt']);
   * ```
   */
  async getBreadcrumbSegments(): Promise<string[]> {
    const segments = await this.documentRootLocatorFactory()
      .locatorForAll('tn-file-picker-popup .breadcrumb-segment')();
    return Promise.all(segments.map(async (segment) => (await segment.text()).trim()));
  }

  /**
   * Gets the names of the items listed in the open popup.
   *
   * @returns Promise resolving to the visible item names.
   *
   * @example
   * ```typescript
   * await picker.open();
   * expect(await picker.getItemNames()).toContain('Documents');
   * ```
   */
  async getItemNames(): Promise<string[]> {
    const names = await this.documentRootLocatorFactory()
      .locatorForAll('tn-file-picker-popup .file-name')();
    return Promise.all(names.map(async (name) => (await name.text()).trim()));
  }

  /**
   * Clicks the popup row with the given item name, toggling its selection
   * (single-select replaces the pending selection; multi-select toggles the
   * item in and out). The selection is applied with {@link clickSelect}.
   *
   * @param name The item name as displayed in the list.
   *
   * @example
   * ```typescript
   * await picker.open();
   * await picker.clickItem('Documents');
   * await picker.clickSelect();
   * ```
   */
  async clickItem(name: string): Promise<void> {
    const names = await this.documentRootLocatorFactory()
      .locatorForAll('tn-file-picker-popup .file-name')();
    for (const nameEl of names) {
      if ((await nameEl.text()).trim() === name) {
        return nameEl.click();
      }
    }
    throw new Error(`No item named "${name}" found in the file picker popup.`);
  }

  /**
   * Navigates into a directory-like item (folder, dataset, or mountpoint)
   * by clicking its navigation chevron.
   *
   * @param name The item name as displayed in the list.
   *
   * @example
   * ```typescript
   * await picker.open();
   * await picker.navigateToItem('Documents');
   * ```
   */
  async navigateToItem(name: string): Promise<void> {
    const button = await this.documentRootLocatorFactory()
      .locatorForOptional(`tn-file-picker-popup .navigate-button[aria-label="Open ${name}"]`)();
    if (!button) {
      throw new Error(`No navigatable item named "${name}" found in the file picker popup.`);
    }
    return button.click();
  }

  /**
   * Clicks the popup's Select button, applying the pending selection as the
   * picker's value and closing the popup.
   *
   * @example
   * ```typescript
   * await picker.clickItem('Documents');
   * await picker.clickSelect();
   * expect(await picker.getValue()).toBe('/mnt/Documents');
   * ```
   */
  async clickSelect(): Promise<void> {
    const button = await this.documentRootLocatorFactory()
      .locatorFor(TnButtonHarness.with({ label: 'Select', ancestor: '.tn-file-picker-footer' }))();
    return button.click();
  }

  /**
   * Clicks the popup's Clear Selection button. Only rendered while items are
   * selected; throws otherwise.
   *
   * @example
   * ```typescript
   * await picker.clickItem('Documents');
   * await picker.clickClearSelection();
   * ```
   */
  async clickClearSelection(): Promise<void> {
    const button = await this.documentRootLocatorFactory()
      .locatorForOptional(TnButtonHarness.with({ label: 'Clear Selection', ancestor: '.tn-file-picker-footer' }))();
    if (!button) {
      throw new Error('No Clear Selection button found — nothing is selected in the file picker popup.');
    }
    return button.click();
  }
}

/**
 * A set of criteria that can be used to filter a list of `TnFilePickerHarness` instances.
 */
export interface FilePickerHarnessFilters extends BaseHarnessFilters {
  /** Filters by the path input's placeholder text. */
  placeholder?: string;
  /** Filters by the rendered data-testid attribute (includes the `file-picker-` prefix). */
  testId?: string;
}
