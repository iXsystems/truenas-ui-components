import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import type { ComponentFixture } from '@angular/core/testing';

/**
 * Test utilities for working with `TnTooltipHarness`.
 *
 * Tooltips are portaled into the CDK overlay outside the component tree, so a regular
 * `TestbedHarnessEnvironment.loader()` won't find them. Use `TnTooltipTesting.rootLoader()`
 * to get a loader that can.
 *
 * @example
 * ```typescript
 * import { TnTooltipTesting, TnTooltipHarness } from '@truenas/ui-components';
 *
 * const rootLoader = TnTooltipTesting.rootLoader(fixture);
 * const tooltip = await rootLoader.getHarness(TnTooltipHarness);
 * ```
 */
export class TnTooltipTesting {
  /**
   * Creates a `HarnessLoader` that searches the entire document, including the CDK overlays
   * that tooltips are rendered into.
   *
   * @param fixture The component fixture for the test.
   * @returns A `HarnessLoader` capable of finding tooltip harnesses.
   */
  static rootLoader(fixture: ComponentFixture<unknown>): HarnessLoader {
    return TestbedHarnessEnvironment.documentRootLoader(fixture);
  }
}
