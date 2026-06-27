import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Harness for interacting with `tn-file-input` in tests.
 *
 * @example
 * ```typescript
 * const fileInput = await loader.getHarness(TnFileInputHarness.with({ testId: 'update' }));
 * expect(await fileInput.getButtonText()).toBe('Choose File');
 * expect(await fileInput.hasFile()).toBe(false);
 * expect(await fileInput.getFileName()).toBe('No file chosen');
 * ```
 */
export class TnFileInputHarness extends ComponentHarness {
  /** The selector for the host element of a `TnFileInputComponent` instance. */
  static hostSelector = 'tn-file-input';

  // The trigger is a `tn-button`; target its rendered `<button>` element.
  private _button = this.locatorFor('.tn-file-input__button .storybook-button');
  private _native = this.locatorFor('input[type="file"]');
  private _filename = this.locatorForOptional('.tn-file-input__filename');

  /**
   * Gets a `HarnessPredicate` to search for a file input with specific attributes.
   *
   * @param options Options for filtering which instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   *
   * @example
   * ```typescript
   * const fileInput = await loader.getHarness(TnFileInputHarness.with({ testId: 'update' }));
   * ```
   */
  static with(options: FileInputHarnessFilters = {}) {
    return new HarnessPredicate(TnFileInputHarness, options)
      .addOption('buttonText', options.buttonText, (harness, text) =>
        HarnessPredicate.stringMatches(harness.getButtonText(), text)
      )
      .addOption('testId', options.testId, async (harness, testId) =>
        (await harness.getTestId()) === testId
      );
  }

  /**
   * Gets the trigger button's text.
   *
   * @returns Promise resolving to the button label.
   *
   * @example
   * ```typescript
   * expect(await fileInput.getButtonText()).toBe('Choose File');
   * ```
   */
  async getButtonText(): Promise<string> {
    return (await (await this._button()).text()).trim();
  }

  /**
   * Gets the displayed file-name text (or the empty-state text).
   *
   * @returns Promise resolving to the text, or null when the name is hidden.
   *
   * @example
   * ```typescript
   * expect(await fileInput.getFileName()).toBe('No file chosen');
   * ```
   */
  async getFileName(): Promise<string | null> {
    const filename = await this._filename();
    return filename ? (await filename.text()).trim() : null;
  }

  /**
   * Whether a file is currently selected. A native file input reports an empty
   * `value` until the user picks a file, so this reflects real user selection.
   *
   * @returns Promise resolving to true when a file has been chosen.
   *
   * @example
   * ```typescript
   * expect(await fileInput.hasFile()).toBe(false);
   * ```
   */
  async hasFile(): Promise<boolean> {
    const native = await this._native();
    const value = (await native.getProperty<string>('value')) ?? '';
    return value !== '';
  }

  /**
   * Whether the control is disabled.
   *
   * @returns Promise resolving to true if the button is disabled.
   *
   * @example
   * ```typescript
   * expect(await fileInput.isDisabled()).toBe(true);
   * ```
   */
  async isDisabled(): Promise<boolean> {
    const button = await this._button();
    return (await button.getProperty<boolean>('disabled')) ?? false;
  }

  /**
   * Opens the native file dialog by clicking the trigger button. The browser
   * does not let tests pick a real file, so this is mainly useful for asserting
   * click handling and focus behaviour.
   *
   * @example
   * ```typescript
   * await fileInput.open();
   * ```
   */
  async open(): Promise<void> {
    await (await this._button()).click();
  }

  /**
   * Gets the test-id attribute value from the container.
   *
   * @returns Promise resolving to the test-id, or null when unset.
   *
   * @example
   * ```typescript
   * expect(await fileInput.getTestId()).toBe('file-input-update');
   * ```
   */
  async getTestId(): Promise<string | null> {
    const container = await this.locatorFor('.tn-file-input__container')();
    return (await container.getAttribute('data-testid')) ?? (await container.getAttribute('data-test'));
  }
}

/** A set of criteria for filtering a list of `TnFileInputHarness` instances. */
export interface FileInputHarnessFilters extends BaseHarnessFilters {
  /** Filters by the trigger button's text. Supports string or regex matching. */
  buttonText?: string | RegExp;
  /** Filters by data-testid attribute. */
  testId?: string;
}
