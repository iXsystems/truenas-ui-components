import { Overlay, type OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import type { OnDestroy, TemplateRef } from '@angular/core';
import { Component, contentChildren, input, output, viewChild, computed, inject, ViewContainerRef } from '@angular/core';
import type { Subscription } from 'rxjs';
import { TnMenuItemComponent } from './menu-item.component';
import { TnMenuPanelComponent } from './menu-panel.component';

// Re-exported from its own module so `<tn-menu>` consumers (and the public-api
// barrel) keep importing it from here, while `<tn-menu-panel>` can depend on it
// without a circular import through this file.
export { TnMenuActivateHoverDirective } from './menu-activate-hover.directive';

export interface TnMenuItem {
  id: string;
  label: string;
  testId?: string;
  icon?: string;
  iconLibrary?: 'material' | 'mdi' | 'custom' | 'lucide';
  disabled?: boolean;
  separator?: boolean;
  action?: () => void;
  children?: TnMenuItem[];
  shortcut?: string;
  /**
   * Marks this item as the currently-chosen option (e.g. the active sort key
   * or export format). Applies the `tn-menu-item--selected` class and an
   * `aria-current="true"` attribute. Visually distinct from focus/hover.
   */
  selected?: boolean;
}

@Component({
  selector: 'tn-menu',
  standalone: true,
  imports: [TnMenuPanelComponent],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class TnMenuComponent implements OnDestroy {
  items = input<TnMenuItem[]>([]);
  contextMenu = input<boolean>(false); // Enable context menu mode (right-click)

  menuItemClick = output<TnMenuItem>();
  menuOpen = output<void>();
  menuClose = output<void>();

  menuTemplate = viewChild.required<TemplateRef<unknown>>('menuTemplate');
  contextMenuTemplate = viewChild.required<TemplateRef<unknown>>('contextMenuTemplate');

  private contextOverlayRef?: OverlayRef;
  private contextBackdropSub?: Subscription;

  private overlay = inject(Overlay);
  private viewContainerRef = inject(ViewContainerRef);

  onMenuItemClick(item: TnMenuItem): void {
    if (!item.disabled && (!item.children || item.children.length === 0)) {
      this.menuItemClick.emit(item);
      if (item.action) {
        item.action();
      }
      // Close context menu if it's open
      if (this.contextOverlayRef) {
        this.closeContextMenu();
      }
    }
  }

  contentItems = contentChildren(TnMenuItemComponent);

  /**
   * Click handler for projected `<tn-menu-item>` entries. Emits the item's own
   * `itemClick` output, re-emits a synthetic entry on `menuItemClick` so
   * trigger-driven menus close uniformly, and closes any open context menu.
   */
  onProjectedItemClick(item: TnMenuItemComponent, event: MouseEvent): void {
    if (item.disabled()) {
      return;
    }
    item.itemClick.emit(event);
    this.menuItemClick.emit({ id: item.id() ?? '', label: item.label() ?? '' });
    if (this.contextOverlayRef) {
      this.closeContextMenu();
    }
  }

  hasChildren = computed(() => (item: TnMenuItem): boolean => {
    return !!(item.children && item.children.length > 0);
  });

  onMenuOpen(): void {
    this.menuOpen.emit();
  }

  onMenuClose(): void {
    this.menuClose.emit();
  }

  /**
   * Get the menu template for use by the trigger directive
   */
  getMenuTemplate(): TemplateRef<unknown> | null {
    if (this.contextMenu()) {
      return this.contextMenuTemplate() || null;
    }
    return this.menuTemplate() || null;
  }

  openContextMenuAt(x: number, y: number): void {
    const contextMenuTemplate = this.contextMenuTemplate();
    if (this.contextMenu() && contextMenuTemplate) {
      // Close any existing context menu
      this.closeContextMenu();

      // Create overlay at cursor position
      const positionStrategy = this.overlay.position()
        .flexibleConnectedTo({ x, y })
        .withPositions([
          { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top' },
          { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'bottom' },
          { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'top' },
          { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'bottom' }
        ]);

      this.contextOverlayRef = this.overlay.create({
        positionStrategy,
        scrollStrategy: this.overlay.scrollStrategies.close(),
        hasBackdrop: true,
        backdropClass: 'cdk-overlay-transparent-backdrop'
      });

      // Create portal and attach to overlay
      const portal = new TemplatePortal(contextMenuTemplate, this.viewContainerRef);
      this.contextOverlayRef.attach(portal);

      // Handle backdrop click to close menu — keep the subscription so we can
      // unsubscribe explicitly on close/destroy rather than leaving it dangling.
      this.contextBackdropSub = this.contextOverlayRef.backdropClick().subscribe(() => {
        this.closeContextMenu();
      });

      this.onMenuOpen();
    }
  }

  private closeContextMenu(): void {
    this.contextBackdropSub?.unsubscribe();
    this.contextBackdropSub = undefined;
    if (this.contextOverlayRef) {
      this.contextOverlayRef.dispose();
      this.contextOverlayRef = undefined;
      this.onMenuClose();
    }
  }

  ngOnDestroy(): void {
    // Component destroyed while context menu open → clean up without notifying.
    this.contextBackdropSub?.unsubscribe();
    this.contextBackdropSub = undefined;
    this.contextOverlayRef?.dispose();
    this.contextOverlayRef = undefined;
  }

  onContextMenu(event: MouseEvent): void {
    if (this.contextMenu()) {
      event.preventDefault();
      event.stopPropagation();

      // Open at cursor position
      this.openContextMenuAt(event.clientX, event.clientY);
    }
  }
}