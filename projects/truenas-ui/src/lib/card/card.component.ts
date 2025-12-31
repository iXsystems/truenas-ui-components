import { CommonModule } from '@angular/common';
import { Component, input, computed, inject } from '@angular/core';
import { mdiDotsVertical } from '@mdi/js';
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

@Component({
  selector: 'tn-card',
  standalone: true,
  imports: [CommonModule, TnButtonComponent, TnIconComponent, TnIconButtonComponent, TnSlideToggleComponent, TnMenuComponent, TnMenuTriggerDirective],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class TnCardComponent {
  private iconRegistry = inject(TnIconRegistryService);

  constructor() {
    // Register MDI icons used by this component
    this.registerMdiIcons();
  }

  title = input<string | undefined>(undefined);
  titleLink = input<string | undefined>(undefined); // Makes title navigable
  elevation = input<'none' | 'low' | 'medium' | 'high'>('medium');
  padding = input<'small' | 'medium' | 'large'>('medium');
  padContent = input<boolean>(true);
  bordered = input<boolean>(false);
  background = input<boolean>(true);

  // Header elements (top-right) - Always render in header
  headerStatus = input<TnCardHeaderStatus | undefined>(undefined);
  headerControl = input<TnCardControl | undefined>(undefined); // Slide toggle - ALWAYS in header
  headerMenu = input<TnMenuItem[] | undefined>(undefined);

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
    const elevationClass = `ix-card--elevation-${this.elevation()}`;
    const paddingClass = `ix-card--padding-${this.padding()}`;
    const contentPaddingClass = this.padContent() ? `ix-card--content-padding-${this.padding()}` : 'ix-card--content-padding-none';
    const borderedClass = this.bordered() ? 'ix-card--bordered' : '';
    const backgroundClass = this.background() ? 'ix-card--background' : '';

    return ['ix-card', elevationClass, paddingClass, contentPaddingClass, borderedClass, backgroundClass].filter(Boolean);
  });

  hasHeader = computed(() => {
    return !!(this.title() || this.headerStatus() || this.headerControl() || this.headerMenu());
  });

  hasFooter = computed(() => {
    return !!(this.primaryAction() || this.secondaryAction() || this.footerLink());
  });

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
    return type ? `ix-card__status--${type}` : 'ix-card__status--neutral';
  }
}