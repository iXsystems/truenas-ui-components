import { CommonModule } from '@angular/common';
import { Component, input, computed, inject } from '@angular/core';
import { mdiDotsVertical } from '@mdi/js';
import type {
  IxCardAction,
  IxCardControl,
  IxCardHeaderStatus,
  IxCardFooterLink
} from './ix-card.interfaces';
import { IxButtonComponent } from '../ix-button/ix-button.component';
import { IxIconRegistryService } from '../ix-icon/ix-icon-registry.service';
import { IxIconComponent } from '../ix-icon/ix-icon.component';
import { IxIconButtonComponent } from '../ix-icon-button/ix-icon-button.component';
import { IxMenuTriggerDirective } from '../ix-menu/ix-menu-trigger.directive';
import type { IxMenuItem } from '../ix-menu/ix-menu.component';
import { IxMenuComponent } from '../ix-menu/ix-menu.component';
import { IxSlideToggleComponent } from '../ix-slide-toggle/ix-slide-toggle.component';

@Component({
  selector: 'ix-card',
  standalone: true,
  imports: [CommonModule, IxButtonComponent, IxIconComponent, IxIconButtonComponent, IxSlideToggleComponent, IxMenuComponent, IxMenuTriggerDirective],
  templateUrl: './ix-card.component.html',
  styleUrls: ['./ix-card.component.scss'],
})
export class IxCardComponent {
  private iconRegistry = inject(IxIconRegistryService);

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
  headerStatus = input<IxCardHeaderStatus | undefined>(undefined);
  headerControl = input<IxCardControl | undefined>(undefined); // Slide toggle - ALWAYS in header
  headerMenu = input<IxMenuItem[] | undefined>(undefined);

  // Footer elements (bottom-right) - Always render in footer
  primaryAction = input<IxCardAction | undefined>(undefined);
  secondaryAction = input<IxCardAction | undefined>(undefined);
  footerLink = input<IxCardFooterLink | undefined>(undefined);

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

  onHeaderMenuItemClick(_item: IxMenuItem): void {
    // Handler is called automatically via IxMenuItem.action
  }

  getStatusClass(type?: string): string {
    return type ? `ix-card__status--${type}` : 'ix-card__status--neutral';
  }
}