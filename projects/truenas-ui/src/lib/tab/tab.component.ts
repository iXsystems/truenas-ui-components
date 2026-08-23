import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import type { TemplateRef, AfterContentInit} from '@angular/core';
import { Component, input, output, ElementRef, inject, contentChild, computed, signal } from '@angular/core';
import { LabelMarkupPipe } from '../pipes/label-markup/label-markup.pipe';
import { tabDomId, tabPanelDomId } from '../tabs/tab-ids';
import { TnTestIdDirective, type TnTestIdValue } from '../test-id';

let nextUnownedGroupId = 0;

@Component({
  selector: 'tn-tab',
  standalone: true,
  imports: [CommonModule, A11yModule, TnTestIdDirective, LabelMarkupPipe],
  templateUrl: './tab.component.html',
  styleUrl: './tab.component.scss'
})
export class TnTabComponent implements AfterContentInit {
  label = input<string>('');
  disabled = input<boolean>(false);
  icon = input<string | undefined>(undefined);
  iconTemplate = input<TemplateRef<unknown> | undefined>(undefined);
  testId = input<TnTestIdValue>(undefined);

  selected = output<void>();

  iconContent = contentChild<TemplateRef<unknown>>('iconContent');

  // Internal properties set by parent TnTabsComponent (public signals for parent control)
  index = signal<number>(0);
  /**
   * Id namespace, set by the parent `tn-tabs` so that both ends of the tab↔panel wiring
   * agree. The default is unique per instance rather than a constant, so a `tn-tab`
   * rendered outside a `tn-tabs` mints an id that collides with nothing — it has no panel
   * to point at either way, and a duplicate id is worse than an unmatched one.
   */
  groupId = signal<string>(`tn-tab-unowned-${nextUnownedGroupId++}`);
  isActive = signal<boolean>(false);
  tabsComponent?: {
    onKeydown: (event: KeyboardEvent, index: number) => void;
    selectTab: (index: number) => void;
  };

  elementRef = inject(ElementRef<HTMLElement>);

  protected hasIconContent = signal<boolean>(false);

  ngAfterContentInit() {
    this.hasIconContent.set(!!this.iconContent());
  }

  onClick() {
    if (!this.disabled() && this.tabsComponent) {
      this.tabsComponent.selectTab(this.index());
    }
  }

  onKeydown(event: KeyboardEvent) {
    if (this.tabsComponent) {
      this.tabsComponent.onKeydown(event, this.index());
    }
  }

  classes = computed(() => {
    const classes = ['tn-tab'];

    if (this.isActive()) {
      classes.push('tn-tab--active');
    }

    if (this.disabled()) {
      classes.push('tn-tab--disabled');
    }

    return classes.join(' ');
  });

  tabIndex = computed(() => {
    return this.isActive() ? 0 : -1;
  });

  /** This tab's own id, which its panel points back at with `aria-labelledby`. */
  tabId = computed(() => tabDomId(this.groupId(), this.index()));

  /** The id of the panel this tab controls, for `aria-controls`. */
  panelId = computed(() => tabPanelDomId(this.groupId(), this.index()));

  hasIcon = computed(() => {
    return !!(this.hasIconContent() || this.iconTemplate() || this.icon());
  });
}