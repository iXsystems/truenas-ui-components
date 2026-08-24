import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import type { TemplateRef} from '@angular/core';
import { Component, input, viewChild, ElementRef, inject, computed, signal } from '@angular/core';
import { tnScrollableRegion } from '../a11y/scrollable-region';
import { tabDomId, tabPanelDomId } from '../tabs/tab-ids';
import { TnTestIdDirective, type TnTestIdValue } from '../test-id';

let nextUnownedGroupId = 0;

/**
 * The name the scrolling content region takes when it becomes focusable and the
 * panel has no `label` to name it from (#270).
 *
 * A focusable element with no accessible name is announced as a bare "group".
 * A panel rendered outside a `tn-tabs`, or one whose caller left `label` empty,
 * has no better name available — so this is the last resort rather than the
 * usual case, and `contentLabel` prefers the label every time there is one.
 *
 * Exported so specs assert against it by name rather than by a copied literal.
 */
export const TN_TAB_PANEL_CONTENT_LABEL = 'Tab panel content';

@Component({
  selector: 'tn-tab-panel',
  standalone: true,
  imports: [CommonModule, A11yModule, TnTestIdDirective],
  templateUrl: './tab-panel.component.html',
  styleUrl: './tab-panel.component.scss'
})
export class TnTabPanelComponent {
  label = input<string>('');
  lazyLoad = input<boolean>(false);
  testId = input<TnTestIdValue>(undefined);

  content = viewChild.required<TemplateRef<unknown>>('content');

  /**
   * The scrolling content region, which is `.tn-tab-panel__content` — the
   * element the stylesheet gives `overflow: auto`, not the `role="tabpanel"`
   * wrapper around it. Optional because it lives inside `@if (shouldRender())`,
   * so a lazy panel that has never been active does not render it.
   *
   * The template ref is `#contentRegion` and not `#content`, which is taken:
   * the `content` query above asks for a `TemplateRef` under that name, and
   * naming a real element `#content` would hand it an `ElementRef` instead.
   */
  private contentRef = viewChild<ElementRef<HTMLElement>>('contentRegion');

  /**
   * Whether the content region carries the tab stop, its role and its name —
   * and, conversely, whether the `role="tabpanel"` wrapper gives its own up.
   *
   * `.tn-tab-panel__content` is what scrolls, so it is what a keyboard user
   * has to be able to stand on to read past the fold (#270). The measurement,
   * the observers behind it and the rule that holds the answer true while the
   * region has focus are `tnScrollableRegion`'s; the template says why the two
   * elements trade one tab stop rather than carrying two.
   */
  protected contentKeyboardReachable = tnScrollableRegion(
    () => this.contentRef()?.nativeElement
  );

  // Internal properties set by parent TnTabsComponent (public signals for parent control)
  index = signal<number>(0);
  /**
   * Id namespace, set by the parent `tn-tabs` so that both ends of the tab↔panel wiring
   * agree. Unique per instance by default, for the same reason as on `tn-tab`: a panel
   * rendered outside a `tn-tabs` still renders an `id`, and one colliding with another
   * group's panel would be worse than one nothing points at.
   */
  groupId = signal<string>(`tn-tab-panel-unowned-${nextUnownedGroupId++}`);
  /**
   * Whether the parent has a tab at this panel's index, which is what decides whether
   * `aria-labelledby` is rendered. The mirror of `hasPanel` on `tn-tab`, and for the same
   * reason: more panels than tabs, or a panel outside a `tn-tabs`, would otherwise leave
   * this pointing at an id nothing carries — which is what `aria-labelledby="tab-0"` did
   * unconditionally before #232.
   */
  hasTab = signal<boolean>(false);
  isActive = signal<boolean>(false);
  hasBeenActive = signal<boolean>(false);

  elementRef = inject(ElementRef<HTMLElement>);

  /** This panel's own id, which its tab points at with `aria-controls`. */
  panelId = computed(() => tabPanelDomId(this.groupId(), this.index()));

  /** The id of the tab that labels this panel, for `aria-labelledby`. */
  tabId = computed(() => tabDomId(this.groupId(), this.index()));

  /**
   * What the scrolling content region is named while it carries the tab stop.
   *
   * The panel's own `label` where there is one, because that is what its tab
   * says and a listener arriving from the tab hears the same words for the
   * region it opened. `aria-labelledby` pointing at the tab would be the other
   * way to say it and is not used here: the tab lives in a sibling component,
   * so the IDREF resolves only inside a `tn-tabs`, and a panel rendered on its
   * own would be left unnamed by exactly the route that was supposed to name
   * it — the `--tn-error-text` hazard in another shape.
   *
   * Trimmed, because a whitespace-only label names the region with nothing,
   * which is the state `TN_TAB_PANEL_CONTENT_LABEL` exists to prevent.
   */
  protected contentLabel = computed(
    () => this.label().trim() || TN_TAB_PANEL_CONTENT_LABEL
  );

  classes = computed(() => {
    const classes = ['tn-tab-panel'];

    if (this.isActive()) {
      classes.push('tn-tab-panel--active');
    }

    if (!this.isActive()) {
      classes.push('tn-tab-panel--hidden');
    }

    return classes.join(' ');
  });

  shouldRender = computed(() => {
    if (!this.lazyLoad()) {
      return true;
    }

    // For lazy loading, only render if it's currently active or has been active before
    return this.isActive() || this.hasBeenActive();
  });

  onActivate() {
    this.hasBeenActive.set(true);
  }
}