import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import type { ChipColor } from './chip.component';

/**
 * Harness for interacting with tn-chip in tests.
 * Provides methods for reading chip state and simulating user interactions
 * (selecting the chip and dismissing a closable chip).
 *
 * @example
 * ```typescript
 * // Find a chip by label and click it
 * const chip = await loader.getHarness(TnChipHarness.with({ label: 'Active' }));
 * await chip.click();
 *
 * // Dismiss a closable chip
 * const filter = await loader.getHarness(TnChipHarness.with({ label: 'Has SSH Access' }));
 * if (await filter.isClosable()) {
 *   await filter.close();
 * }
 * ```
 */
export class TnChipHarness extends ComponentHarness {
  /**
   * The selector for the host element of a `TnChipComponent` instance.
   */
  static hostSelector = 'tn-chip';

  private _chip = this.locatorFor('.tn-chip');
  private _label = this.locatorFor('.tn-chip__label');
  private _icon = this.locatorForOptional('.tn-chip__icon');
  private _closeButton = this.locatorForOptional('.tn-chip__close');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a chip
   * with specific attributes.
   *
   * @param options Options for filtering which chip instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   *
   * @example
   * ```typescript
   * // Find chip by exact label
   * const chip = await loader.getHarness(TnChipHarness.with({ label: 'Production' }));
   *
   * // Find chip with regex pattern
   * const chip = await loader.getHarness(TnChipHarness.with({ label: /access/i }));
   * ```
   */
  static with(options: ChipHarnessFilters = {}) {
    return new HarnessPredicate(TnChipHarness, options)
      .addOption('label', options.label, (harness, label) =>
        HarnessPredicate.stringMatches(harness.getLabel(), label)
      );
  }

  /**
   * Gets the chip's label text.
   *
   * @returns Promise resolving to the chip's text content.
   *
   * @example
   * ```typescript
   * const chip = await loader.getHarness(TnChipHarness);
   * expect(await chip.getLabel()).toBe('Active');
   * ```
   */
  async getLabel(): Promise<string> {
    const label = await this._label();
    return (await label.text()).trim();
  }

  /**
   * Gets the chip's color variant (`primary`, `secondary`, or `accent`).
   *
   * @returns Promise resolving to the chip's color.
   *
   * @example
   * ```typescript
   * const chip = await loader.getHarness(TnChipHarness);
   * expect(await chip.getColor()).toBe('primary');
   * ```
   */
  async getColor(): Promise<ChipColor> {
    const chip = await this._chip();
    const classAttr = (await chip.getAttribute('class')) ?? '';
    const match = classAttr.match(/tn-chip--(primary|secondary|accent)/);
    return (match?.[1] as ChipColor) ?? 'primary';
  }

  /**
   * Checks whether the chip is disabled.
   *
   * @returns Promise resolving to true if the chip is disabled.
   *
   * @example
   * ```typescript
   * const chip = await loader.getHarness(TnChipHarness);
   * expect(await chip.isDisabled()).toBe(false);
   * ```
   */
  async isDisabled(): Promise<boolean> {
    const chip = await this._chip();
    return (await chip.getAttribute('aria-disabled')) === 'true';
  }

  /**
   * Checks whether the chip renders a close (dismiss) button.
   *
   * @returns Promise resolving to true if the chip is closable.
   *
   * @example
   * ```typescript
   * const chip = await loader.getHarness(TnChipHarness);
   * expect(await chip.isClosable()).toBe(true);
   * ```
   */
  async isClosable(): Promise<boolean> {
    return (await this._closeButton()) !== null;
  }

  /**
   * Checks whether the chip renders a leading icon.
   *
   * @returns Promise resolving to true if the chip has an icon.
   *
   * @example
   * ```typescript
   * const chip = await loader.getHarness(TnChipHarness);
   * expect(await chip.hasIcon()).toBe(true);
   * ```
   */
  async hasIcon(): Promise<boolean> {
    return (await this._icon()) !== null;
  }

  /**
   * Clicks the chip body, triggering its `onClick` output.
   *
   * @returns Promise that resolves when the click action is complete.
   *
   * @example
   * ```typescript
   * const chip = await loader.getHarness(TnChipHarness.with({ label: 'Active' }));
   * await chip.click();
   * ```
   */
  async click(): Promise<void> {
    const chip = await this._chip();
    return chip.click();
  }

  /**
   * Clicks the chip's close button, triggering its `onClose` output.
   * Throws if the chip is not closable.
   *
   * @returns Promise that resolves when the close action is complete.
   *
   * @example
   * ```typescript
   * const chip = await loader.getHarness(TnChipHarness.with({ label: 'Has SSH Access' }));
   * await chip.close();
   * ```
   */
  async close(): Promise<void> {
    const closeButton = await this._closeButton();
    if (!closeButton) {
      throw new Error('Cannot close a chip that is not closable (no close button rendered).');
    }
    return closeButton.click();
  }
}

/**
 * A set of criteria that can be used to filter a list of `TnChipHarness` instances.
 */
export interface ChipHarnessFilters extends BaseHarnessFilters {
  /** Filters by the chip's label text. Supports string or regex matching. */
  label?: string | RegExp;
}
