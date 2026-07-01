import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Harness for interacting with `tn-stepper` in tests.
 *
 * @example
 * ```typescript
 * const stepper = await loader.getHarness(TnStepperHarness);
 * expect(await stepper.getStepLabels()).toEqual(['Provider', 'What and When']);
 * expect(await stepper.getSelectedIndex()).toBe(0);
 * await stepper.selectStep(1);
 * ```
 */
export class TnStepperHarness extends ComponentHarness {
  /** The selector for the host element of a `TnStepperComponent` instance. */
  static hostSelector = 'tn-stepper';

  /**
   * Gets a `HarnessPredicate` used to search for a stepper with specific attributes.
   *
   * @param options Options for filtering which stepper instances are considered a match.
   */
  static with(options: StepperHarnessFilters = {}) {
    return new HarnessPredicate(TnStepperHarness, options)
      .addOption('orientation', options.orientation, async (harness, orientation) => {
        return (await harness.getOrientation()) === orientation;
      });
  }

  private headers = this.locatorForAll('.tn-stepper__step-header');

  /** Gets the number of steps. */
  async getStepCount(): Promise<number> {
    return (await this.headers()).length;
  }

  /** Gets all step labels as strings, in order. */
  async getStepLabels(): Promise<string[]> {
    const titles = await this.locatorForAll('.tn-stepper__step-title')();
    return Promise.all(titles.map(title => title.text()));
  }

  /** Gets the zero-based index of the currently selected step, or -1 if none. */
  async getSelectedIndex(): Promise<number> {
    const headers = await this.headers();
    for (let i = 0; i < headers.length; i++) {
      if (await headers[i].hasClass('tn-stepper__step-header--active')) {
        return i;
      }
    }
    return -1;
  }

  /** Whether the step at `index` is marked completed. */
  async isStepCompleted(index: number): Promise<boolean> {
    const header = (await this.headers())[index];
    return header ? header.hasClass('tn-stepper__step-header--completed') : false;
  }

  /** Whether the step at `index` is marked as having an error. */
  async isStepError(index: number): Promise<boolean> {
    const header = (await this.headers())[index];
    return header ? header.hasClass('tn-stepper__step-header--error') : false;
  }

  /** Selects the step at `index` by clicking its header. Respects linear gating. */
  async selectStep(index: number): Promise<void> {
    const header = (await this.headers())[index];
    if (!header) {
      throw new Error(`No step at index ${index}`);
    }
    await header.click();
  }

  /** Gets the orientation of the stepper. */
  async getOrientation(): Promise<'horizontal' | 'vertical'> {
    const root = await this.locatorFor('.tn-stepper')();
    return (await root.hasClass('tn-stepper--vertical')) ? 'vertical' : 'horizontal';
  }
}

/** A set of criteria for filtering a list of `TnStepperHarness` instances. */
export interface StepperHarnessFilters extends BaseHarnessFilters {
  /** Filters by stepper orientation. */
  orientation?: 'horizontal' | 'vertical';
}
