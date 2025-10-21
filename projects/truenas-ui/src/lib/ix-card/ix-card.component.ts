import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IxButtonComponent } from '../ix-button/ix-button.component';
import { IxIconComponent } from '../ix-icon/ix-icon.component';
import { IxIconButtonComponent } from '../ix-icon-button/ix-icon-button.component';
import { IxSlideToggleComponent } from '../ix-slide-toggle/ix-slide-toggle.component';
import { IxMenuComponent, IxMenuItem } from '../ix-menu/ix-menu.component';
import { IxMenuTriggerDirective } from '../ix-menu/ix-menu-trigger.directive';
import { IxIconRegistryService } from '../ix-icon/ix-icon-registry.service';
import {
  IxCardAction,
  IxCardControl,
  IxCardHeaderStatus,
  IxCardFooterLink
} from './ix-card.interfaces';
import { mdiDotsVertical } from '@mdi/js';

@Component({
  selector: 'ix-card',
  standalone: true,
  imports: [CommonModule, IxButtonComponent, IxIconComponent, IxIconButtonComponent, IxSlideToggleComponent, IxMenuComponent, IxMenuTriggerDirective],
  templateUrl: './ix-card.component.html',
  styleUrls: ['./ix-card.component.scss'],
})
export class IxCardComponent {
  constructor(private iconRegistry: IxIconRegistryService) {
    // Register MDI icons used by this component
    this.registerMdiIcons();
  }
  @Input()
  title?: string;

  @Input()
  titleLink?: string; // Makes title navigable

  @Input()
  elevation: 'none' | 'low' | 'medium' | 'high' = 'medium';

  @Input()
  padding: 'small' | 'medium' | 'large' = 'medium';

  @Input()
  padContent = true;

  @Input()
  bordered = false;

  @Input()
  background = true;

  // Header elements (top-right) - Always render in header
  @Input()
  headerStatus?: IxCardHeaderStatus;

  @Input()
  headerControl?: IxCardControl; // Slide toggle - ALWAYS in header

  @Input()
  headerMenu?: IxMenuItem[];

  // Footer elements (bottom-right) - Always render in footer
  @Input()
  primaryAction?: IxCardAction;

  @Input()
  secondaryAction?: IxCardAction;

  @Input()
  footerLink?: IxCardFooterLink;

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

  public get classes(): string[] {
    const elevationClass = `ix-card--elevation-${this.elevation}`;
    const paddingClass = `ix-card--padding-${this.padding}`;
    const contentPaddingClass = this.padContent ? `ix-card--content-padding-${this.padding}` : 'ix-card--content-padding-none';
    const borderedClass = this.bordered ? 'ix-card--bordered' : '';
    const backgroundClass = this.background ? 'ix-card--background' : '';

    return ['ix-card', elevationClass, paddingClass, contentPaddingClass, borderedClass, backgroundClass].filter(Boolean);
  }

  public get hasHeader(): boolean {
    return !!(this.title || this.headerStatus || this.headerControl || this.headerMenu);
  }

  public get hasFooter(): boolean {
    return !!(this.primaryAction || this.secondaryAction || this.footerLink);
  }

  onTitleClick(): void {
    if (this.titleLink) {
      window.location.href = this.titleLink;
    }
  }

  onControlChange(checked: boolean): void {
    if (this.headerControl) {
      this.headerControl.handler(checked);
    }
  }

  onHeaderMenuItemClick(item: IxMenuItem): void {
    // Handler is called automatically via IxMenuItem.action
  }

  getStatusClass(type?: string): string {
    return type ? `ix-card__status--${type}` : 'ix-card__status--neutral';
  }
}