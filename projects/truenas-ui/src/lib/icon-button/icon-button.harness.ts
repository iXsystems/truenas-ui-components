import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Harness for interacting with tn-icon-button in tests.
 * Provides filtering by icon properties and methods for querying state and simulating interactions.
 *
 * @example
 * ```typescript
 * // Find icon button by name
 * const closeBtn = await loader.getHarness(
 *   TnIconButtonHarness.with({ name: 'close' })
 * );
 *
 * // Click an icon button
 * const settingsBtn = await loader.getHarness(
 *   TnIconButtonHarness.with({ name: 'settings' })
 * );
 * await settingsBtn.click();
 *
 * // Check if disabled
 * const deleteBtn = await loader.getHarness(
 *   TnIconButtonHarness.with({ name: 'delete' })
 * );
 * expect(await deleteBtn.isDisabled()).toBe(false);
 * ```
 */
export class TnIconButtonHarness extends ComponentHarness {
  /**
   * The selector for the host element of a `TnIconButtonComponent` instance.
   */
  static hostSelector = 'tn-icon-button';

  private button = this.locatorFor('button');

  /**
   * Gets a `HarnessPredicate` that can be used to search for an icon button
   * with specific attributes.
   *
   * @param options Options for filtering which icon button instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   *
   * @example
   * ```typescript
   * // Find icon button by name
   * const button = await loader.getHarness(
   *   TnIconButtonHarness.with({ name: 'menu' })
   * );
   *
   * // Find icon button by library
   * const customButton = await loader.getHarness(
   *   TnIconButtonHarness.with({ library: 'mdi' })
   * );
   *
   * // Find icon button with specific size
   * const largeButton = await loader.getHarness(
   *   TnIconButtonHarness.with({ size: 'lg' })
   * );
   * ```
   */
  static with(options: IconButtonHarnessFilters = {}) {
    return new HarnessPredicate(TnIconButtonHarness, options)
      .addOption('name', options.name, async (harness, name) => {
        return (await harness.getName()) === name;
      })
      .addOption('library', options.library, async (harness, library) => {
        return (await harness.getLibrary()) === library;
      })
      .addOption('size', options.size, async (harness, size) => {
        return (await harness.getSize()) === size;
      });
  }

  /**
   * Gets the icon name.
   *
   * @returns Promise resolving to the icon name.
   *
   * @example
   * ```typescript
   * const button = await loader.getHarness(TnIconButtonHarness);
   * const name = await button.getName();
   * expect(name).toBe('settings');
   * ```
   */
  async getName(): Promise<string | null> {
    const icon = await this.locatorFor('tn-icon')();
    return icon.getAttribute('name');
  }

  /**
   * Gets the icon library.
   *
   * @returns Promise resolving to the icon library.
   *
   * @example
   * ```typescript
   * const button = await loader.getHarness(TnIconButtonHarness);
   * const library = await button.getLibrary();
   * expect(library).toBe('mdi');
   * ```
   */
  async getLibrary(): Promise<string | null> {
    const icon = await this.locatorFor('tn-icon')();
    return icon.getAttribute('library');
  }

  /**
   * Gets the icon size.
   *
   * @returns Promise resolving to the icon size.
   *
   * @example
   * ```typescript
   * const button = await loader.getHarness(TnIconButtonHarness);
   * const size = await button.getSize();
   * expect(size).toBe('lg');
   * ```
   */
  async getSize(): Promise<string | null> {
    const icon = await this.locatorFor('tn-icon')();
    return icon.getAttribute('size');
  }

  /**
   * Gets the icon color.
   *
   * @returns Promise resolving to the icon color.
   *
   * @example
   * ```typescript
   * const button = await loader.getHarness(TnIconButtonHarness);
   * const color = await button.getColor();
   * expect(color).toBe('primary');
   * ```
   */
  async getColor(): Promise<string | null> {
    const icon = await this.locatorFor('tn-icon')();
    return icon.getAttribute('color');
  }

  /**
   * Checks whether the icon button is disabled.
   *
   * @returns Promise resolving to true if the button is disabled.
   *
   * @example
   * ```typescript
   * const button = await loader.getHarness(
   *   TnIconButtonHarness.with({ name: 'delete' })
   * );
   * expect(await button.isDisabled()).toBe(false);
   * ```
   */
  async isDisabled(): Promise<boolean> {
    const button = await this.button();
    return (await button.getProperty<boolean>('disabled')) ?? false;
  }

  /**
   * Clicks the icon button.
   *
   * @returns Promise that resolves when the click action is complete.
   *
   * @example
   * ```typescript
   * const button = await loader.getHarness(
   *   TnIconButtonHarness.with({ name: 'close' })
   * );
   * await button.click();
   * ```
   */
  async click(): Promise<void> {
    const button = await this.button();
    return button.click();
  }
}

/**
 * A set of criteria that can be used to filter a list of `TnIconButtonHarness` instances.
 */
export interface IconButtonHarnessFilters extends BaseHarnessFilters {
  /** Filters by icon name. */
  name?: string;
  /** Filters by icon library (material, mdi, custom, lucide). */
  library?: string;
  /** Filters by icon size (xs, sm, md, lg, xl). */
  size?: string;
}
