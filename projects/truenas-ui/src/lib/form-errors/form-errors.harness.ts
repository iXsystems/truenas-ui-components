import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * A set of criteria that can be used to filter a list of
 * `TnFormErrorsHarness` instances.
 */
export interface TnFormErrorsHarnessFilters extends BaseHarnessFilters {
  /** Filters by the rendered message. Supports string or regex matching. */
  textContains?: string | RegExp;
}

/**
 * Harness for `tn-form-errors`.
 *
 * The host renders nothing while the control is valid, untouched, or has no
 * message to show, so `hasMessage()` — not the presence of the harness — is
 * what tells you whether an error is visible.
 *
 * @example
 * ```typescript
 * const errors = await loader.getHarness(TnFormErrorsHarness);
 * expect(await errors.getMessage()).toBe('Select at least one day');
 * ```
 */
export class TnFormErrorsHarness extends ComponentHarness {
  static hostSelector = 'tn-form-errors';

  /**
   * Gets a `HarnessPredicate` for finding a `tn-form-errors` by its message.
   *
   * @param options Options for filtering which instances are considered a match.
   */
  static with(options: TnFormErrorsHarnessFilters = {}) {
    return new HarnessPredicate(TnFormErrorsHarness, options)
      .addOption('textContains', options.textContains, (harness, text) =>
        HarnessPredicate.stringMatches(
          harness.getMessage(),
          typeof text === 'string' ? new RegExp(escapeRegex(text)) : text
        )
      );
  }

  private message = this.locatorForOptional('.tn-form-errors');

  /** Whether a message is currently rendered. */
  async hasMessage(): Promise<boolean> {
    return (await this.message()) !== null;
  }

  /** The rendered message, or `''` when none is shown. */
  async getMessage(): Promise<string> {
    const message = await this.message();
    return message ? (await message.text()).trim() : '';
  }
}

/**
 * Stands in for `RegExp.escape`, which the ES2023 deployment target predates.
 */
function escapeRegex(text: string): string {
  return text.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}
