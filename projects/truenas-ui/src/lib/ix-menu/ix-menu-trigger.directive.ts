import { Overlay, type OverlayRef, type ConnectedPosition } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ElementRef, ViewContainerRef, Directive, input, signal, inject } from '@angular/core';
import type { IxMenuComponent } from './ix-menu.component';

/**
 * Directive that attaches a menu to any element.
 * Usage: <button [ixMenuTriggerFor]="menu">Open Menu</button>
 */
@Directive({
  selector: '[ixMenuTriggerFor]',
  standalone: true,
  exportAs: 'ixMenuTrigger',
  host: {
    '(click)': 'onClick()'
  }
})
export class IxMenuTriggerDirective {
  menu = input.required<IxMenuComponent>({ alias: 'ixMenuTriggerFor' });
  ixMenuPosition = input<'above' | 'below' | 'before' | 'after'>('below');

  private overlayRef?: OverlayRef;
  private isMenuOpen = signal<boolean>(false);

  private elementRef = inject(ElementRef);
  private overlay = inject(Overlay);
  private viewContainerRef = inject(ViewContainerRef);

  onClick(): void {
    if (this.isMenuOpen()) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu(): void {
    const menuComponent = this.menu();
    if (!menuComponent || this.isMenuOpen()) {
      return;
    }

    // Get menu template
    const menuTemplate = menuComponent.getMenuTemplate();
    if (!menuTemplate) {
      return;
    }

    // Create overlay
    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(this.elementRef)
      .withPositions(this.getPositions());

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      width: 'auto',
      height: 'auto',
      minWidth: '160px',
      maxWidth: '300px'
    });

    // Create portal and attach
    const portal = new TemplatePortal(menuTemplate, this.viewContainerRef);
    this.overlayRef.attach(portal);

    this.isMenuOpen.set(true);

    // Handle backdrop click
    this.overlayRef.backdropClick().subscribe(() => {
      this.closeMenu();
    });

    // Notify menu component
    menuComponent.onMenuOpen();
  }

  closeMenu(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = undefined;
      this.isMenuOpen.set(false);
      this.menu().onMenuClose();
    }
  }

  private getPositions(): ConnectedPosition[] {
    switch (this.ixMenuPosition()) {
      case 'above':
        return [
          { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' }
        ];
      case 'below':
        return [
          { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }
        ];
      case 'before':
        return [
          { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top' }
        ];
      case 'after':
        return [
          { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top' }
        ];
      default:
        return [
          { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }
        ];
    }
  }
}
