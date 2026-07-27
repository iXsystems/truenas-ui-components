import { CommonModule } from '@angular/common';
import { Component, input, computed, inject, contentChild, TemplateRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { mdiDotsVertical, mdiHelpCircle, mdiOpenInNew } from '@mdi/js';
import { TnCardFooterActionsDirective, TnCardHeaderActionsDirective } from './card-action.directive';
import { TnCardHeaderDirective } from './card-header.directive';
import type {
  TnCardAction,
  TnCardControl,
  TnCardHeaderStatus,
  TnCardFooterLink
} from './card.interfaces';
import { TnButtonComponent } from '../button/button.component';
import { TnIconRegistryService } from '../icon/icon-registry.service';
import { TnIconComponent } from '../icon/icon.component';
import { TnIconButtonComponent } from '../icon-button/icon-button.component';
import { TnMenuTriggerDirective } from '../menu/menu-trigger.directive';
import type { TnMenuItem } from '../menu/menu.component';
import { TnMenuComponent } from '../menu/menu.component';
import { TnSlideToggleComponent } from '../slide-toggle/slide-toggle.component';
import { TnTestIdDirective } from '../test-id';
import { TnTooltipDirective } from '../tooltip/tooltip.directive';

@Component({
  selector: 'tn-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TnButtonComponent,
    TnIconComponent,
    TnIconButtonComponent,
    TnSlideToggleComponent,
    TnMenuComponent,
    TnMenuTriggerDirective,
    TnTestIdDirective,
    TnTooltipDirective,
  ],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class TnCardComponent {
  private iconRegistry = inject(TnIconRegistryService);

  constructor() {
    // Register MDI icons used by this component
    this.registerMdiIcons();
  }

  projectedHeader = contentChild(TnCardHeaderDirective);

  // Projected action templates (escape hatch for actions the declarative config can't
  // express, e.g. a permission-gated control wrapped in a structural directive). Rendered
  // via ngTemplateOutlet so the buttons inside become direct children of the header/footer
  // flex rows — same orientation as the declarative action buttons, no wrapper needed.
  protected headerActions = contentChild(TnCardHeaderActionsDirective, { read: TemplateRef });
  protected footerActions = contentChild(TnCardFooterActionsDirective, { read: TemplateRef });

  title = input<string | undefined>(undefined);
  titleLink = input<string | undefined>(undefined); // External href: navigates via window.location

  /**
   * Angular router commands for a title that navigates within the app. When set,
   * the title renders as an `<a [routerLink]>` so it participates in client-side
   * (SPA) routing — unlike `titleLink`, which performs a full-page
   * `window.location` navigation. Same accepted shapes as `[routerLink]`
   * (`string | unknown[]`). Takes precedence over `titleLink`.
   */
  titleRouterLink = input<string | unknown[] | undefined>(undefined);
  titleQueryParams = input<Record<string, unknown> | undefined>(undefined);

  /** Help/hover text shown on the title via the tooltip directive. */
  titleTooltip = input<string | undefined>(undefined);
  elevation = input<'none' | 'low' | 'medium' | 'high'>('medium');
  padding = input<'small' | 'medium' | 'large'>('medium');
  padContent = input<boolean>(true);
  bordered = input<boolean>(false);
  background = input<boolean>(true);

  // Header elements (top-right) - Always render in header
  headerStatus = input<TnCardHeaderStatus | undefined>(undefined);
  headerControl = input<TnCardControl | undefined>(undefined); // Slide toggle - ALWAYS in header
  headerMenu = input<TnMenuItem[] | undefined>(undefined);
  /**
   * Test-id applied to the kebab-menu trigger button rendered when `headerMenu` is set.
   * Rendered under whichever attribute name is configured via `TN_TEST_ATTR`
   * (default `data-testid`).
   */
  headerMenuTriggerTestId = input<string | undefined>(undefined);

  // Footer elements (bottom-right) - Always render in footer
  primaryAction = input<TnCardAction | undefined>(undefined);
  secondaryAction = input<TnCardAction | undefined>(undefined);
  footerLink = input<TnCardFooterLink | undefined>(undefined);

  /**
   * Register MDI icon library with all icons used by the card component
   * This makes the component self-contained with zero configuration required
   */
  private registerMdiIcons(): void {
    const mdiIcons: Record<string, string> = {
      'dots-vertical': mdiDotsVertical,
      'help-circle': mdiHelpCircle,
      'open-in-new': mdiOpenInNew,
    };

    // Register MDI library with resolver for card icons
    this.iconRegistry.registerLibrary({
      name: 'mdi',
      resolver: (iconName: string) => {
        const pathData = mdiIcons[iconName];
        if (!pathData) {
          return null;
        }
        return `<svg viewBox="0 0 24 24"><path fill="currentColor" d="${pathData}"/></svg>`;
      }
    });
  }

  classes = computed(() => {
    const elevationClass = `tn-card--elevation-${this.elevation()}`;
    const paddingClass = `tn-card--padding-${this.padding()}`;
    const contentPaddingClass = this.padContent() ? `tn-card--content-padding-${this.padding()}` : 'tn-card--content-padding-none';
    const borderedClass = this.bordered() ? 'tn-card--bordered' : '';
    const backgroundClass = this.background() ? 'tn-card--background' : '';

    return ['tn-card', elevationClass, paddingClass, contentPaddingClass, borderedClass, backgroundClass].filter(Boolean);
  });

  hasHeader = computed(() => {
    return !!(
      this.projectedHeader() || this.title() || this.headerStatus()
      || this.headerControl() || this.headerMenu() || this.headerActions()
    );
  });

  hasHeaderRight = computed(() => {
    return !!(
      this.headerStatus() || this.headerControl()
      || this.headerMenu()?.length || this.headerActions()
    );
  });

  hasFooter = computed(() => {
    return !!(
      this.primaryAction() || this.secondaryAction()
      || this.footerLink() || this.footerActions()
    );
  });

  isTitleRouterLink = computed(() => !!this.titleRouterLink());

  onTitleClick(): void {
    const link = this.titleLink();
    if (link) {
      window.location.href = link;
    }
  }

  onControlChange(checked: boolean): void {
    const control = this.headerControl();
    if (control) {
      control.handler(checked);
    }
  }

  onHeaderMenuItemClick(_item: TnMenuItem): void {
    // Handler is called automatically via TnMenuItem.action
  }

  getStatusClass(type?: string): string {
    return type ? `tn-card__status--${type}` : 'tn-card__status--neutral';
  }
}