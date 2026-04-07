import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import type { ComponentFixture } from '@angular/core/testing';

/**
 * Test utilities for TnMenu.
 *
 * Provides a document-root `HarnessLoader` that can find menus rendered
 * in CDK overlays. Use this alongside `TnDialogTesting.rootLoader()` if
 * your tests also open dialogs.
 *
 * @example
 * ```typescript
 * import { TnMenuTesting, TnMenuHarness } from '@truenas/ui-components';
 *
 * const rootLoader = TnMenuTesting.rootLoader(spectator.fixture);
 *
 * // Open the menu trigger, then query the overlay
 * spectator.click('[tnMenuTriggerFor]');
 * const menu = await rootLoader.getHarness(TnMenuHarness);
 * await menu.clickItem({ label: 'Edit' });
 * ```
 */
export class TnMenuTesting {
  /**
   * Creates a `HarnessLoader` that searches the entire document,
   * including CDK overlays where menus are rendered.
   */
  static rootLoader(fixture: ComponentFixture<unknown>): HarnessLoader {
    return TestbedHarnessEnvironment.documentRootLoader(fixture);
  }
}
