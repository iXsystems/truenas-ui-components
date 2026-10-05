import { Overlay, type OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import type { OnDestroy, TemplateRef } from '@angular/core';
import { Component, contentChildren, input, output, viewChild, computed, inject, ViewContainerRef, ChangeDetectionStrategy } from '@angular/core';
import type { Subscription } from 'rxjs';
import type { TnTestIdValue } from '../test-id';
import { TnMenuItemComponent } from './menu-item.component';
import { TnMenuPanelComponent } from './menu-panel.component';

// Re-exported from its own module so `<tn-menu>` consumers (and the public-api
// barrel) keep importing it from here, while `<tn-menu-panel>` can depend on it
// without a circular import through this file.
export { TnMenuActivateHoverDirective } from './menu-activate-hover.directive';

export interface TnMenuItem {
  id: string;
  label: string;
  testId?: TnTestIdValue;
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
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./menu.component.scss'],
})
export class TnMenuComponent implements OnDestroy {
  items = input<TnMenuItem[]>([]);
  contextMenu = input<boolean>(false); // Enable context menu mode (right-click)

  /**
   * Semantic base that scopes the test ids of this menu's items. Each item
   * resolves to `button-${testId}-${item.id}` (e.g. menu `testId="actions"`
   * + item `id="edit"` → `button-actions-edit`), which keeps ids unique when
   * several menus render on one page. Omit it and items fall back to the
   * unscoped `button-${item.id}`. A per-item `testId` overrides the base and is
   * composed with the same `button-` prefix (idempotently, so an already
   * `button-`-prefixed value is not doubled).
   */
  testId = input<TnTestIdValue>(undefined);

  menuItemClick = output<TnMenuItem>();
  menuOpen = output<void>();
  menuClose = output<void>();

  menuTemplate = viewChild.required<TemplateRef<unknown>>('menuTemplate');
  contextMenuTemplate = viewChild.required<TemplateRef<unknown>>('contextMenuTemplate');

  private contextOverlayRef?: OverlayRef;
  private contextBackdropSub?: Subscription;
  private contextKeydownSub?: Subscription;

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

      // Escape, which this menu had no handling for at all. CDK's keyboard
      // dispatcher hands the key to the top-most attached overlay that HAS
      // subscribers and stops there, so subscribing is both what dismisses this
      // menu and what keeps the key from reaching a `tn-side-panel` or dialog
      // underneath it (#324).
      //
      // Focus is NOT restored here, unlike `TnMenuTriggerDirective`: a context
      // menu is opened by pointer at a cursor position with no trigger element
      // to go back to, which is also why the backdrop-click path above does not
      // restore it either.
      //
      // The dispatcher is the ONLY route here, where the form controls fixed
      // under #324 also consume Escape on their own host element. They can:
      // opening one leaves focus on a trigger inside that host, so a host
      // listener sees the key even when an ancestor would stop it before the
      // dispatcher's listener on `<body>` runs. A context menu has no such
      // element — a right-click moves focus nowhere, so Escape starts wherever
      // focus already was, which need not be inside this `tn-menu` at all.
      // Consequence, and it is a real gap: inside a `tn-drawer` in `over` mode,
      // whose panel calls `stopPropagation()` on Escape, the drawer closes and
      // this menu stays up. Closing it there needs focus management this menu
      // has never had (see the note on restoration above), not another
      // listener.

      this.contextKeydownSub = this.contextOverlayRef.keydownEvents().subscribe((event: KeyboardEvent) => {
        if (event.key === 'Escape' && !event.altKey && !event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          this.closeContextMenu();
        }
      });

      this.onMenuOpen();
    }
  }

  private closeContextMenu(): void {
    this.contextBackdropSub?.unsubscribe();
    this.contextBackdropSub = undefined;
    this.contextKeydownSub?.unsubscribe();
    this.contextKeydownSub = undefined;
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
    this.contextKeydownSub?.unsubscribe();
    this.contextKeydownSub = undefined;
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