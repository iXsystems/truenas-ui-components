import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { TnIconButtonHarness } from '../icon-button/icon-button.harness';
import { TnSelectHarness } from '../select/select.harness';

/**
 * Harness for interacting with `tn-table-pager` in tests.
 *
 * @example
 * ```ts
 * const pager = await loader.getHarness(TnTablePagerHarness);
 * await pager.nextPage();
 * expect(await pager.getRangeText()).toBe('21 – 40 of 47');
 * ```
 */
export class TnTablePagerHarness extends ComponentHarness {
  static hostSelector = 'tn-table-pager';

  static with(options: TnTablePagerHarnessFilters = {}): HarnessPredicate<TnTablePagerHarness> {
    return new HarnessPredicate(TnTablePagerHarness, options);
  }

  private firstButton = this.locatorFor(
    TnIconButtonHarness.with({ name: 'page-first' }),
  );
  private previousButton = this.locatorFor(
    TnIconButtonHarness.with({ name: 'chevron-left' }),
  );
  private nextButton = this.locatorFor(
    TnIconButtonHarness.with({ name: 'chevron-right' }),
  );
  private lastButton = this.locatorFor(
    TnIconButtonHarness.with({ name: 'page-last' }),
  );
  private pageSizeSelect = this.locatorFor(TnSelectHarness);
  private rangeEl = this.locatorFor('.tn-table-pager__range');

  /**
   * Returns the rendered range text (e.g. `"1 – 20 of 47"`).
   */
  async getRangeText(): Promise<string> {
    const el = await this.rangeEl();
    return (await el.text()).replace(/\s+/g, ' ').trim();
  }

  /** Clicks the "first page" button. */
  async goToFirstPage(): Promise<void> {
    const btn = await this.firstButton();
    await btn.click();
  }

  /** Clicks the "previous page" button. */
  async previousPage(): Promise<void> {
    const btn = await this.previousButton();
    await btn.click();
  }

  /** Clicks the "next page" button. */
  async nextPage(): Promise<void> {
    const btn = await this.nextButton();
    await btn.click();
  }

  /** Clicks the "last page" button. */
  async goToLastPage(): Promise<void> {
    const btn = await this.lastButton();
    await btn.click();
  }

  async isFirstButtonDisabled(): Promise<boolean> {
    const btn = await this.firstButton();
    return btn.isDisabled();
  }

  async isPreviousButtonDisabled(): Promise<boolean> {
    const btn = await this.previousButton();
    return btn.isDisabled();
  }

  async isNextButtonDisabled(): Promise<boolean> {
    const btn = await this.nextButton();
    return btn.isDisabled();
  }

  async isLastButtonDisabled(): Promise<boolean> {
    const btn = await this.lastButton();
    return btn.isDisabled();
  }

  /** Returns the harness for the underlying page-size `tn-select`. */
  async getPageSizeSelect(): Promise<TnSelectHarness> {
    return this.pageSizeSelect();
  }
}

export interface TnTablePagerHarnessFilters extends BaseHarnessFilters {}
