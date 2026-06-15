import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Harness for interacting with `tn-form-section` in tests.
 *
 * Scope note: this covers the section's own surface (heading text, tooltip
 * presence, projected text) only. Filling and reading the projected form
 * controls is the consuming app's concern — drive those through their own
 * control harnesses rather than this one.
 *
 * @example
 * ```typescript
 * const section = await loader.getHarness(
 *   TnFormSectionHarness.with({ heading: 'Network Settings' })
 * );
 * expect(await section.hasTooltip()).toBe(true);
 * ```
 */
export class TnFormSectionHarness extends ComponentHarness {
  /** The selector for the host element of a `TnFormSectionComponent` instance. */
  static hostSelector = 'tn-form-section';

  /**
   * Gets a `HarnessPredicate` to search for a form section by heading text.
   *
   * @param options Criteria for filtering which section instances match.
   * @returns A `HarnessPredicate` configured with the given options.
   */
  static with(options: FormSectionHarnessFilters = {}) {
    return new HarnessPredicate(TnFormSectionHarness, options)
      .addOption('heading', options.heading, (harness, heading) =>
        HarnessPredicate.stringMatches(harness.getHeadingText(), heading)
      );
  }

  private legend = this.locatorForOptional('.tn-form-section__legend');
  private tooltipButton = this.locatorForOptional('.tn-form-section__tooltip');

  /**
   * Heading text rendered in the legend (label markup rendered to plain text),
   * or '' when no heading is set.
   */
  async getHeadingText(): Promise<string> {
    const legend = await this.legend();
    return legend ? (await legend.text()).trim() : '';
  }

  /** Whether the help tooltip icon is rendered. */
  async hasTooltip(): Promise<boolean> {
    return (await this.tooltipButton()) !== null;
  }

  /** Full text content of the section (heading + projected content), trimmed. */
  async getText(): Promise<string> {
    return (await (await this.host()).text()).trim();
  }
}

/**
 * A set of criteria that can be used to filter a list of
 * `TnFormSectionHarness` instances.
 */
export interface FormSectionHarnessFilters extends BaseHarnessFilters {
  /** Filters by legend heading text. Supports string or regex matching. */
  heading?: string | RegExp;
}
