import { Component, ElementRef, inject, input } from '@angular/core';
import { tnScrollableRegion } from '../a11y/scrollable-region';

/**
 * The name this region takes when it becomes focusable (#270).
 *
 * A focusable element with no accessible name is announced as a bare "group",
 * which tells a listener that something has been reached and nothing about what
 * it is.
 *
 * "Content" rather than "Main content", and `role="group"` rather than
 * `role="main"`: the landmark belongs to the application, not to this library —
 * `drawer-container.component.ts` sets out why, and a component that claimed it
 * would give a page two `main`s the moment the page declared its own. A group
 * is not summarised in a landmarks list, so this names the scroll region
 * without competing with the page's own structure.
 *
 * Overridable through `ariaLabel`, on the same reasoning as
 * `TN_SIDE_PANEL_CONTENT_LABEL`: a string this library renders into a
 * consumer's UI has to be translatable, and a consumer who knows what the
 * region holds can say so. Exported so specs assert against it by name rather
 * than by a copied literal.
 */
export const TN_DRAWER_CONTENT_LABEL = 'Content';

/**
 * The page content that sits beside a `tn-drawer` inside a
 * `tn-drawer-container`.
 *
 * WHY IT CARRIES A TAB STOP SOMETIMES AND NO LANDMARK EVER (#270)
 * --------------------------------------------------------------
 * The host is `overflow: auto`, so everything an application puts beside its
 * drawer scrolls in this element — and axe's `scrollable-region-focusable`
 * reports a scroll container that is neither in the tab order nor holds
 * anything that is. That is not a technicality here: this is the element that
 * holds a page, so content below its fold is most of the page, and a keyboard
 * user with no pointer could not reach it.
 *
 * The tab stop follows the measurement rather than being permanent, because
 * this component wraps every page that uses a drawer and a stop that announces
 * a group and does nothing would land on all of them. `tnScrollableRegion`
 * holds the measurement, the observers that keep it current, and the rule that
 * decides when it may be taken away again; see `../a11y/scrollable-region.ts`.
 *
 * The role is still not a landmark. `drawer-container.component.ts` explains
 * why `role="main"` belongs to the application rather than to this library, and
 * nothing about needing a tab stop changes that — see
 * `TN_DRAWER_CONTENT_LABEL`.
 */
@Component({
  selector: 'tn-drawer-content',
  standalone: true,
  template: '<ng-content />',
  styleUrl: './drawer-content.component.scss',
  host: {
    '[attr.tabindex]': 'keyboardReachable() ? "0" : null',
    '[attr.role]': 'keyboardReachable() ? "group" : null',
    '[attr.aria-label]': 'keyboardReachable() ? ariaLabel() : null',
  },
})
export class TnDrawerContentComponent {
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Accessible name for the scrolling region, which is named only while it is
   * focusable — see `TN_DRAWER_CONTENT_LABEL`. Override it to translate it, or
   * to say what the region holds ("Pool details").
   */
  ariaLabel = input<string>(TN_DRAWER_CONTENT_LABEL);

  /**
   * Whether the region carries the tab stop, its role and its name — which is
   * NOT the same question as whether it currently overflows. All three are
   * gated together, and held on while the region has focus; the reasoning for
   * both is in `../a11y/scrollable-region.ts`.
   */
  protected keyboardReachable = tnScrollableRegion(() => this.hostRef.nativeElement);
}
