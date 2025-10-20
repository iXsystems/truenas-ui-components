import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, TemplateRef, ViewChild, OnInit, ViewContainerRef } from '@angular/core';
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { IxIconComponent } from '../ix-icon/ix-icon.component';

export interface IxMenuItem {
  id: string;
  label: string;
  icon?: string;
  iconLibrary?: 'material' | 'mdi' | 'custom' | 'lucide';
  disabled?: boolean;
  separator?: boolean;
  action?: () => void;
  children?: IxMenuItem[];
  shortcut?: string;
}

@Component({
  selector: 'ix-menu',
  standalone: true,
  imports: [CommonModule, CdkMenu, CdkMenuItem, CdkMenuTrigger, IxIconComponent],
  templateUrl: './ix-menu.component.html',
  styleUrls: ['./ix-menu.component.scss'],
})
export class IxMenuComponent implements OnInit {
  @Input() items: IxMenuItem[] = [];
  @Input() contextMenu = false; // Enable context menu mode (right-click)

  @Output() menuItemClick = new EventEmitter<IxMenuItem>();
  @Output() menuOpen = new EventEmitter<void>();
  @Output() menuClose = new EventEmitter<void>();

  @ViewChild('menuTemplate', { read: TemplateRef }) menuTemplate!: TemplateRef<any>;
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

  /**
   * Get the menu template for use by the trigger directive
   */
  public getMenuTemplate(): TemplateRef<any> | null {
    if (this.contextMenu) {
      return this.contextMenuTemplate || null;
    }
    return this.menuTemplate || null;
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
    if (this.contextMenu) {
      event.preventDefault();
      event.stopPropagation();

      // Open at cursor position
      this.openContextMenuAt(event.clientX, event.clientY);
    }
  }

  trackByItemId(index: number, item: IxMenuItem): string {
    return item.id;
  }
}