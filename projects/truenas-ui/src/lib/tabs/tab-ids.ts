/**
 * The DOM ids that tie a tab to its panel, in one place because both ends have to agree:
 * `tn-tab` renders `aria-controls` pointing at the panel and `tn-tab-panel` renders
 * `aria-labelledby` pointing back at the tab. A second copy of either formula drifting
 * leaves both attributes resolving to nothing, which is the state #232 found
 * `aria-labelledby="tab-0"` in — an id no element in this library ever rendered.
 *
 * `group` is the namespace the owning `tn-tabs` hands down, so that two tab groups on one
 * page — a Storybook docs page renders all ten Tabs stories at once — cannot both mint
 * `tab-0` and cross-wire each other's panels.
 */

/** The id rendered on the `tn-tab` at `index` within `group`. */
export function tabDomId(group: string, index: number): string {
  return `${group}-tab-${index}`;
}

/** The id rendered on the `tn-tab-panel` at `index` within `group`. */
export function tabPanelDomId(group: string, index: number): string {
  return `${group}-panel-${index}`;
}
