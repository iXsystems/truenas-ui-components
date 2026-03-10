import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import type { TabHarnessFilters } from '../tab/tab.harness';
import { TnTabHarness } from '../tab/tab.harness';
import { TnTabPanelHarness } from '../tab-panel/tab-panel.harness';

/**
 * Harness for interacting with tn-tabs in tests.
 * Provides methods for querying tab state, selecting tabs, and inspecting panels.
 *
 * @example
 * ```typescript
 * // Get the tabs harness
 * const tabs = await loader.getHarness(TnTabsHarness);
 *
 * // Select a tab by label
 * await tabs.selectTab({ label: 'Settings' });
 *
 * // Get the selected tab label
 * const selected = await tabs.getSelectedTab();
 * expect(await selected.getLabel()).toBe('Settings');
 *
 * // Get all tab labels
 * const labels = await tabs.getTabLabels();
 * expect(labels).toEqual(['Overview', 'Details', 'Settings']);
 * ```
 */
export class TnTabsHarness extends ComponentHarness {
  /**
   * The selector for the host element of a `TnTabsComponent` instance.
   */
  static hostSelector = 'tn-tabs';

  /**
   * Gets a `HarnessPredicate` that can be used to search for tabs
   * with specific attributes.
   *
   * @param options Options for filtering which tabs instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   *
   * @example
   * ```typescript
   * // Find by orientation
   * const tabs = await loader.getHarness(TnTabsHarness.with({ orientation: 'vertical' }));
   *
   * // Find the tab group containing a "Settings" tab
   * const tabs = await loader.getHarness(TnTabsHarness.with({ hasTab: 'Settings' }));
   *
   * // Find by regex
   * const tabs = await loader.getHarness(TnTabsHarness.with({ hasTab: /settings/i }));
   * ```
   */
  static with(options: TabsHarnessFilters = {}) {
    return new HarnessPredicate(TnTabsHarness, options)
      .addOption('orientation', options.orientation, async (harness, orientation) => {
        return (await harness.getOrientation()) === orientation;
      })
      .addOption('hasTab', options.hasTab, async (harness, label) => {
        const labels = await harness.getTabLabels();
        if (label instanceof RegExp) {
          return labels.some(l => label.test(l));
        }
        return labels.includes(label);
      });
  }

  /**
   * Gets all tab harnesses within this tab group.
   *
   * @returns Promise resolving to an array of `TnTabHarness` instances.
   *
   * @example
   * ```typescript
   * const tabs = await loader.getHarness(TnTabsHarness);
   * const allTabs = await tabs.getTabs();
   * expect(allTabs.length).toBe(3);
   * ```
   */
  async getTabs(): Promise<TnTabHarness[]> {
    return this.locatorForAll(TnTabHarness)();
  }

  /**
   * Gets a specific tab by filter criteria.
   *
   * @param filter Optional filter to match a specific tab.
   * @returns Promise resolving to the matching `TnTabHarness`.
   *
   * @example
   * ```typescript
   * const tabs = await loader.getHarness(TnTabsHarness);
   * const settingsTab = await tabs.getTab({ label: 'Settings' });
   * ```
   */
  async getTab(filter: TabHarnessFilters = {}): Promise<TnTabHarness> {
    return this.locatorFor(TnTabHarness.with(filter))();
  }

  /**
   * Gets all panel harnesses within this tab group.
   *
   * @returns Promise resolving to an array of `TnTabPanelHarness` instances.
   *
   * @example
   * ```typescript
   * const tabs = await loader.getHarness(TnTabsHarness);
   * const panels = await tabs.getPanels();
   * expect(panels.length).toBe(3);
   * ```
   */
  async getPanels(): Promise<TnTabPanelHarness[]> {
    return this.locatorForAll(TnTabPanelHarness)();
  }

  /**
   * Gets all tab labels as strings.
   *
   * @returns Promise resolving to an array of tab label strings.
   *
   * @example
   * ```typescript
   * const tabs = await loader.getHarness(TnTabsHarness);
   * const labels = await tabs.getTabLabels();
   * expect(labels).toEqual(['Overview', 'Details', 'Settings']);
   * ```
   */
  async getTabLabels(): Promise<string[]> {
    const tabs = await this.getTabs();
    return Promise.all(tabs.map(tab => tab.getLabel()));
  }

  /**
   * Gets the currently selected (active) tab.
   *
   * @returns Promise resolving to the active `TnTabHarness`.
   * @throws If no active tab is found.
   *
   * @example
   * ```typescript
   * const tabs = await loader.getHarness(TnTabsHarness);
   * const selected = await tabs.getSelectedTab();
   * expect(await selected.getLabel()).toBe('Overview');
   * ```
   */
  async getSelectedTab(): Promise<TnTabHarness> {
    const tabs = await this.getTabs();
    for (const tab of tabs) {
      if (await tab.isSelected()) {
        return tab;
      }
    }
    throw new Error('No selected tab found');
  }

  /**
   * Selects a tab by filter criteria. Clicks the matching tab button.
   *
   * @param filter Filter to identify which tab to select.
   * @returns Promise that resolves when the tab has been selected.
   *
   * @example
   * ```typescript
   * const tabs = await loader.getHarness(TnTabsHarness);
   *
   * // Select by label
   * await tabs.selectTab({ label: 'Settings' });
   *
   * // Select by regex
   * await tabs.selectTab({ label: /detail/i });
   * ```
   */
  async selectTab(filter: TabHarnessFilters): Promise<void> {
    const tab = await this.getTab(filter);
    await tab.select();
  }

  /**
   * Gets the orientation of the tab group.
   *
   * @returns Promise resolving to 'horizontal' or 'vertical'.
   *
   * @example
   * ```typescript
   * const tabs = await loader.getHarness(TnTabsHarness);
   * expect(await tabs.getOrientation()).toBe('horizontal');
   * ```
   */
  async getOrientation(): Promise<string> {
    const tablist = await this.locatorFor('[role="tablist"]')();
    return (await tablist.getAttribute('aria-orientation')) ?? 'horizontal';
  }

  /**
   * Gets the number of tabs.
   *
   * @returns Promise resolving to the tab count.
   *
   * @example
   * ```typescript
   * const tabs = await loader.getHarness(TnTabsHarness);
   * expect(await tabs.getTabCount()).toBe(3);
   * ```
   */
  async getTabCount(): Promise<number> {
    const tabs = await this.getTabs();
    return tabs.length;
  }
}

/**
 * A set of criteria that can be used to filter a list of `TnTabsHarness` instances.
 */
export interface TabsHarnessFilters extends BaseHarnessFilters {
  /** Filters by tab group orientation. */
  orientation?: 'horizontal' | 'vertical';
  /** Filters by the presence of a tab with a matching label. Supports string or regex. */
  hasTab?: string | RegExp;
}

/**
 * Re-export the tab-level filter interface for convenience.
 */
export type { TabHarnessFilters } from '../tab/tab.harness';
