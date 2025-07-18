import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, TemplateRef, ViewChild, OnInit, ElementRef } from '@angular/core';
import { CdkMenuTrigger, CdkMenu, CdkMenuItem } from '@angular/cdk/menu';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ViewContainerRef } from '@angular/core';

export interface IxMenuItem {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  separator?: boolean;
  action?: () => void;
  children?: IxMenuItem[];
  shortcut?: string;
}

@Component({
  selector: 'ix-menu',
  standalone: true,
  imports: [CommonModule, CdkMenuTrigger, CdkMenu, CdkMenuItem],
  providers: [Overlay],
  templateUrl: './ix-menu.component.html',
  styleUrls: ['./ix-menu.component.scss'],
})
export class IxMenuComponent implements OnInit {
  @Input() items: IxMenuItem[] = [];
  @Input() triggerText = 'Menu';
  @Input() disabled = false;
  @Input() position: 'above' | 'below' | 'before' | 'after' = 'below';
  @Input() contextMenu = false; // New input for context menu mode

  @Output() menuItemClick = new EventEmitter<IxMenuItem>();
  @Output() menuOpen = new EventEmitter<void>();
  @Output() menuClose = new EventEmitter<void>();

  @ViewChild(CdkMenuTrigger) trigger!: CdkMenuTrigger;
  @ViewChild('contextTrigger', { read: ElementRef }) contextTriggerRef!: ElementRef;
  @ViewChild('contextMenuTemplate', { read: TemplateRef }) contextMenuTemplate!: TemplateRef<any>;

  private contextOverlayRef?: OverlayRef;

  constructor(
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit(): void {
    // Component initialization
  }

  onMenuItemClick(item: IxMenuItem): void {
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

  hasChildren(item: IxMenuItem): boolean {
    return !!(item.children && item.children.length > 0);
  }

  onMenuOpen(): void {
    this.menuOpen.emit();
  }

  onMenuClose(): void {
    this.menuClose.emit();
  }

  public openMenu(): void {
    this.trigger?.open();
  }

  public closeMenu(): void {
    this.trigger?.close();
  }

  public openContextMenuAt(x: number, y: number): void {
    if (this.contextMenu && this.contextMenuTemplate) {
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
      const portal = new TemplatePortal(this.contextMenuTemplate, this.viewContainerRef);
      this.contextOverlayRef.attach(portal);

      // Handle backdrop click to close menu
      this.contextOverlayRef.backdropClick().subscribe(() => {
        this.closeContextMenu();
      });

      this.onMenuOpen();
    }
  }

  private closeContextMenu(): void {
    if (this.contextOverlayRef) {
      this.contextOverlayRef.dispose();
      this.contextOverlayRef = undefined;
      this.onMenuClose();
    }
  }

  onContextMenu(event: MouseEvent): void {
    if (this.contextMenu && !this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      
      // Open at cursor position
      this.openContextMenuAt(event.clientX, event.clientY);
    }
  }

  trackByItemId(index: number, item: IxMenuItem): string {
    return item.id;
  }

  getMenuPosition(): any {
    switch (this.position) {
      case 'above':
        return [{ originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' }];
      case 'below':
        return [{ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }];
      case 'before':
        return [{ originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top' }];
      case 'after':
        return [{ originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top' }];
      default:
        return [{ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }];
    }
  }
}