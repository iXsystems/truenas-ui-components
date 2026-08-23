import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import type { TemplateRef} from '@angular/core';
import { Component, input, viewChild, ElementRef, inject, computed, signal } from '@angular/core';
import { tabDomId, tabPanelDomId } from '../tabs/tab-ids';
import { TnTestIdDirective, type TnTestIdValue } from '../test-id';

let nextUnownedGroupId = 0;

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