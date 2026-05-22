import { Overlay, type OverlayRef, type ConnectedPosition } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ElementRef, ViewContainerRef, Directive, input, signal, inject, type OutputRefSubscription } from '@angular/core';
import type { TnMenuComponent } from './menu.component';

/**
 * Directive that attaches a menu to any element.
 * Usage: <button [tnMenuTriggerFor]="menu">Open Menu</button>
 */
@Directive({
  selector: '[tnMenuTriggerFor]',
  standalone: true,
  exportAs: 'tnMenuTrigger',
  host: {
    '(click)': 'onClick()',
    '(keydown.arrowDown)': 'onArrowDown($event)',
  },
})
export class TnMenuTriggerDirective {
  menu = input.required<TnMenuComponent>({ alias: 'tnMenuTriggerFor' });
  tnMenuPosition = input<'above' | 'below' | 'before' | 'after'>('below');

  private overlayRef?: OverlayRef;
  private isMenuOpen = signal<boolean>(false);
  private itemClickSub?: OutputRefSubscription;

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

  onArrowDown(event: Event): void {
    if (!this.isMenuOpen()) {
      event.preventDefault();
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

    // Escape and Tab both close the menu. CdkMenu has handlers for both, but
    // they only tell the menu stack to close — our overlay lifecycle isn't
    // wired to that stack, so we listen on the overlay's keydown events
    // directly.
    //
    // - Escape: preventDefault + close + restore focus (so the user lands
    //   somewhere sensible after dismissing).
    // - Tab / Shift+Tab: close + restore focus to the trigger, but do NOT
    //   preventDefault — the browser's default Tab action then advances focus
    //   from the trigger to the next/previous focusable element on the page,
    //   which is what the user wanted by pressing Tab.
    this.overlayRef.keydownEvents().subscribe((event: KeyboardEvent) => {
      const hasMod = event.altKey || event.ctrlKey || event.metaKey;
      if (event.key === 'Escape' && !hasMod) {
        event.preventDefault();
        this.closeMenu();
      } else if (event.key === 'Tab' && !event.altKey && !event.ctrlKey && !event.metaKey) {
        this.closeMenu();
      }
    });

    // Close menu when a leaf item is selected
    this.itemClickSub = menuComponent.menuItemClick.subscribe(() => {
      this.closeMenu();
    });

    // Notify menu component. TnMenuActivateHoverDirective (applied inside the
    // overlay template) will focus the first enabled item via
    // CdkMenu.focusFirstItem() once the embedded view is fully attached, so
    // there is no need to reach into the overlay from here.
    menuComponent.onMenuOpen();
  }

  closeMenu(): void {
    this.itemClickSub?.unsubscribe();
    this.itemClickSub = undefined;
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = undefined;
      this.isMenuOpen.set(false);
      this.menu().onMenuClose();
      this.restoreFocusToTrigger();
    }
  }

  /**
   * Return focus to the trigger element so keyboard users land somewhere
   * sensible after the menu closes (Escape, item click, or backdrop click).
   *
   * The host might be a custom-element wrapper like `<tn-button>` whose host
   * element isn't itself focusable — focus lives on the inner `<button>` or
   * `<a>`. We focus the host if it's focusable; otherwise we drill into the
   * first focusable descendant.
   */
  private restoreFocusToTrigger(): void {
    const host = this.elementRef.nativeElement as HTMLElement;
    const FOCUSABLE = 'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';
    const target = host.matches(FOCUSABLE) ? host : host.querySelector<HTMLElement>(FOCUSABLE);
    target?.focus({ preventScroll: true });
  }

  private getPositions(): ConnectedPosition[] {
    switch (this.tnMenuPosition()) {
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
