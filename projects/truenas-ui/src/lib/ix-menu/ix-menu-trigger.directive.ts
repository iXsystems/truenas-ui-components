import { Directive, Input, ElementRef, ViewContainerRef, HostListener } from '@angular/core';
import { Overlay, OverlayRef, ConnectedPosition } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { IxMenuComponent } from './ix-menu.component';

/**
 * Directive that attaches a menu to any element.
 * Usage: <button [ixMenuTriggerFor]="menu">Open Menu</button>
 */
@Directive({
  selector: '[ixMenuTriggerFor]',
  standalone: true,
  exportAs: 'ixMenuTrigger'
})
export class IxMenuTriggerDirective {
  @Input('ixMenuTriggerFor') menu!: IxMenuComponent;
  @Input() ixMenuPosition: 'above' | 'below' | 'before' | 'after' = 'below';

  private overlayRef?: OverlayRef;
  private isMenuOpen = false;

  constructor(
    private elementRef: ElementRef,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef
  ) {}

  @HostListener('click')
  onClick(): void {
    if (this.isMenuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu(): void {
    if (!this.menu || this.isMenuOpen) {
      return;
    }

    // Get menu template
    const menuTemplate = this.menu.getMenuTemplate();
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

    this.isMenuOpen = true;

    // Handle backdrop click
    this.overlayRef.backdropClick().subscribe(() => {
      this.closeMenu();
    });

    // Notify menu component
    this.menu.onMenuOpen();
  }

  closeMenu(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = undefined;
      this.isMenuOpen = false;
      this.menu.onMenuClose();
    }
  }

  private getPositions(): ConnectedPosition[] {
    switch (this.ixMenuPosition) {
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
