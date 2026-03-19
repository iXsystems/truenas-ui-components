import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import type { ComponentFixture } from '@angular/core/testing';

/**
 * Test utilities for working with `TnDialogHarness`.
 *
 * Dialogs are portaled into the CDK overlay outside the component tree,
 * so a regular `TestbedHarnessEnvironment.loader()` won't find them.
 * Use `TnDialogTesting.rootLoader()` to get a loader that can.
 *
 * @example
 * ```typescript
 * import { TnDialogTesting, TnDialogHarness } from '@truenas/ui-components';
 *
 * let dialogLoader: HarnessLoader;
 *
 * beforeEach(() => {
 *   fixture = TestBed.createComponent(TestHostComponent);
 *   dialogLoader = TnDialogTesting.rootLoader(fixture);
 * });
 *
 * it('should open a confirm dialog', async () => {
 *   const dialog = await dialogLoader.getHarness(
 *     TnDialogHarness.with({ title: 'Delete?' })
 *   );
 *   await dialog.clickActionButton('Delete');
 * });
 * ```
 */
export class TnDialogTesting {
  /**
   * Creates a `HarnessLoader` that searches the entire document,
   * including the CDK overlay where dialogs are rendered.
   *
   * @param fixture The component fixture for the test.
   * @returns A `HarnessLoader` capable of finding dialog harnesses.
   */
  static rootLoader(fixture: ComponentFixture<unknown>): HarnessLoader {
    return TestbedHarnessEnvironment.documentRootLoader(fixture);
  }
}
