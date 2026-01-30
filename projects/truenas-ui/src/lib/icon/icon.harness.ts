import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Harness for interacting with tn-icon in tests.
 * Provides filtering by icon name and library for existence checks, as well as click interaction.
 *
 * @example
 * ```typescript
 * // Check for existence
 * const icon = await loader.getHarness(TnIconHarness);
 *
 * // Find icon by name
 * const folderIcon = await loader.getHarness(
 *   TnIconHarness.with({ name: 'folder' })
 * );
 *
 * // Find icon by name and library
 * const mdiIcon = await loader.getHarness(
 *   TnIconHarness.with({ name: 'account-circle', library: 'mdi' })
 * );
 *
 * // Check if icon exists
 * const hasIcon = await loader.hasHarness(
 *   TnIconHarness.with({ name: 'check' })
 * );
 *
 * // Click an icon
 * const closeIcon = await loader.getHarness(
 *   TnIconHarness.with({ name: 'close' })
 * );
 * await closeIcon.click();
 * ```
 */
export class TnIconHarness extends ComponentHarness {
  /**
   * The selector for the host element of a `TnIconComponent` instance.
   */
  static hostSelector = 'tn-icon';

  /**
   * Gets a `HarnessPredicate` that can be used to search for an icon
   * with specific attributes.
   *
   * @param options Options for filtering which icon instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   *
   * @example
   * ```typescript
   * // Find icon by name
   * const icon = await loader.getHarness(
   *   TnIconHarness.with({ name: 'home' })
   * );
   *
   * // Find icon by library
   * const customIcon = await loader.getHarness(
   *   TnIconHarness.with({ library: 'custom' })
   * );
   *
   * // Find icon with specific size
   * const largeIcon = await loader.getHarness(
   *   TnIconHarness.with({ size: 'lg' })
   * );
   * ```
   */
  static with(options: IconHarnessFilters = {}) {
    return new HarnessPredicate(TnIconHarness, options)
      .addOption('name', options.name, async (harness, name) => {
        return (await harness.getName()) === name;
      })
      .addOption('library', options.library, async (harness, library) => {
        return (await harness.getLibrary()) === library;
      })
      .addOption('size', options.size, async (harness, size) => {
        return (await harness.getSize()) === size;
      })
      .addOption('fullSize', options.fullSize, async (harness, fullSize) => {
        return (await harness.isFullSize()) === fullSize;
      });
  }

  /**
   * Gets the icon name.
   *
   * @returns Promise resolving to the icon name.
   *
   * @example
   * ```typescript
   * const icon = await loader.getHarness(TnIconHarness);
   * const name = await icon.getName();
   * expect(name).toBe('folder');
   * ```
   */
  async getName(): Promise<string | null> {
    const host = await this.host();
    return host.getAttribute('name');
  }

  /**
   * Gets the icon library.
   *
   * @returns Promise resolving to the icon library.
   *
   * @example
   * ```typescript
   * const icon = await loader.getHarness(TnIconHarness);
   * const library = await icon.getLibrary();
   * expect(library).toBe('mdi');
   * ```
   */
  async getLibrary(): Promise<string | null> {
    const host = await this.host();
    return host.getAttribute('library');
  }

  /**
   * Gets the icon size.
   *
   * @returns Promise resolving to the icon size.
   *
   * @example
   * ```typescript
   * const icon = await loader.getHarness(TnIconHarness);
   * const size = await icon.getSize();
   * expect(size).toBe('lg');
   * ```
   */
  async getSize(): Promise<string | null> {
    const host = await this.host();
    return host.getAttribute('size');
  }

  /**
   * Gets the icon color.
   *
   * @returns Promise resolving to the icon color.
   *
   * @example
   * ```typescript
   * const icon = await loader.getHarness(TnIconHarness);
   * const color = await icon.getColor();
   * expect(color).toBe('primary');
   * ```
   */
  async getColor(): Promise<string | null> {
    const host = await this.host();
    return host.getAttribute('color');
  }

  /**
   * Checks if the icon is in full-size mode.
   *
   * @returns Promise resolving to true if the icon is full-size, false otherwise.
   *
   * @example
   * ```typescript
   * const icon = await loader.getHarness(TnIconHarness);
   * const isFullSize = await icon.isFullSize();
   * expect(isFullSize).toBe(true);
   * ```
   */
  async isFullSize(): Promise<boolean> {
    const host = await this.host();
    const fullSizeAttr = await host.getAttribute('full-size');
    return fullSizeAttr === 'true';
  }

  /**
   * Clicks the icon.
   *
   * @returns Promise that resolves when the click action is complete.
   *
   * @example
   * ```typescript
   * const icon = await loader.getHarness(TnIconHarness.with({ name: 'close' }));
   * await icon.click();
   * ```
   */
  async click(): Promise<void> {
    const host = await this.host();
    return host.click();
  }
}

/**
 * A set of criteria that can be used to filter a list of `TnIconHarness` instances.
 */
export interface IconHarnessFilters extends BaseHarnessFilters {
  /** Filters by icon name. */
  name?: string;
  /** Filters by icon library (material, mdi, custom, lucide). */
  library?: string;
  /** Filters by icon size (xs, sm, md, lg, xl). */
  size?: string;
  /** Filters by full-size mode. */
  fullSize?: boolean;
}
