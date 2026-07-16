import { A11yModule } from '@angular/cdk/a11y';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Component, computed, input, output, inject } from '@angular/core';
import type {
  FileSystemItem, FileSystemItemType, FilePickerMode, FilePickerCreateAction, FilePickerCreateActionEvent
} from './file-picker.interfaces';
import { allowsCurrentDirectorySelection, getSelectableTypes } from './file-picker.utils';
import { TnButtonComponent } from '../button/button.component';
import { registerTruenasIcons } from '../custom-icons/generated-icons';
import { libIconMarker, tnIconMarker } from '../icon/icon-marker';
import { TnIconRegistryService } from '../icon/icon-registry.service';
import { TnIconComponent } from '../icon/icon.component';
import { FileSizePipe } from '../pipes/file-size/file-size.pipe';
import { TruncatePathPipe } from '../pipes/truncate-path/truncate-path.pipe';
import { TnTableComponent } from '../table/table.component';
import { TnTableColumnDirective, TnHeaderCellDefDirective, TnCellDefDirective } from '../table-column/table-column.directive';

@Component({
  selector: 'tn-file-picker-popup',
  standalone: true,
  imports: [
    TnIconComponent,
    TnButtonComponent,
    TnTableComponent,
    TnTableColumnDirective,
    TnHeaderCellDefDirective,
    TnCellDefDirective,
    ScrollingModule,
    A11yModule,
    FileSizePipe,
    TruncatePathPipe
],
  templateUrl: './file-picker-popup.component.html',
  styleUrl: './file-picker-popup.component.scss',
  host: {
    'class': 'tn-file-picker-popup'
  }
})
export class TnFilePickerPopupComponent {
  /**
   * What can be selected: a single mode, or an explicit list of selectable
   * item types, e.g. ['folder', 'dataset'].
   */
  mode = input<FilePickerMode | FileSystemItemType[]>('any');
  multiSelect = input<boolean>(false);
  /**
   * Consumer-defined creation flows rendered as buttons in the footer, next to the
   * Select button. Pressing one emits `createAction` with the action id and the
   * currently browsed path.
   */
  createActions = input<FilePickerCreateAction[]>([]);
  currentPath = input<string>('/mnt');
  /**
   * Topmost path the breadcrumb can navigate to. It is always the first
   * breadcrumb segment, rendered with its leading slash drawn as a separator
   * so the path reads "/ mnt / showcase".
   */
  rootPath = input<string>('/mnt');
  fileItems = input<FileSystemItem[]>([]);
  selectedItems = input<string[]>([]);
  loading = input<boolean>(false);
  fileExtensions = input<string[] | undefined>(undefined);

  private iconRegistry = inject(TnIconRegistryService);

  constructor() {
    // Register TrueNAS custom icons
    registerTruenasIcons(this.iconRegistry);
  }

  itemClick = output<FileSystemItem>();
  itemDoubleClick = output<FileSystemItem>();
  pathNavigate = output<string>();
  /** Emits when one of the `createActions` buttons is pressed. */
  createAction = output<FilePickerCreateActionEvent>();
  clearSelection = output<void>();
  close = output<void>();
  submit = output<void>();
  cancel = output<void>();

  // Table configuration
  displayedColumns = ['select', 'name', 'size', 'modified'];

  // Computed values

  /**
   * Whether an empty selection stands for the directory being browsed: true
   * whenever the selectable types include a directory-like type. The footer
   * then names the implicit selection and the Select button stays enabled; on
   * `submit` with no `selectedItems`, consumers treat `currentPath` as the
   * selection.
   */
  allowCurrentDirectorySelection = computed(() => allowsCurrentDirectorySelection(this.mode()));

  filteredFileItems = computed(() => {
    const items = this.fileItems();
    const extensions = this.fileExtensions();
    const selectableTypes = getSelectableTypes(this.mode());

    return items.map(item => {
      let selectable = true;

      // Check if the item's type is selectable
      if (selectableTypes) {
        selectable = selectableTypes.includes(item.type);
      }

      // Check file extension filter (only applies to files)
      if (extensions && extensions.length > 0 && item.type === 'file') {
        selectable = selectable && extensions.some(ext =>
          item.name.toLowerCase().endsWith(ext.toLowerCase())
        );
      }

      return {
        ...item,
        // Don't override existing disabled state from backend
        disabled: item.disabled || !selectable,
        // Dim only items with no interaction left: navigatable items can still
        // be entered by double-click even when they are not selectable
        dimmed: item.disabled || (!selectable && !this.isNavigatable(item))
      };
    });
  });

  onItemClick(item: FileSystemItem): void {
    this.itemClick.emit(item);
  }

  onItemDoubleClick(item: FileSystemItem): void {
    this.itemDoubleClick.emit(item);
  }

  onNavigateClick(event: Event, item: FileSystemItem): void {
    // Don't also toggle selection via the cell's click handler
    event.stopPropagation();
    this.itemDoubleClick.emit(item);
  }

  navigateToPath(path: string): void {
    this.pathNavigate.emit(path);
  }

  onCreateAction(action: FilePickerCreateAction): void {
    this.createAction.emit({ actionId: action.id, parentPath: this.currentPath() });
  }

  onClearSelection(): void {
    this.clearSelection.emit();
  }

  onSubmit(): void {
    this.submit.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  // Utility methods
  isNavigatable(item: FileSystemItem): boolean {
    return ['folder', 'dataset', 'mountpoint'].includes(item.type);
  }

  /**
   * Fully-qualified sprite icon name for an item. `tnIconMarker`/`libIconMarker`
   * calls double as build-time markers that pull these icons into the sprite.
   */
  getItemIcon(item: FileSystemItem): string {
    if (item.icon) {return item.icon;}

    switch (item.type) {
      case 'folder': return tnIconMarker('folder', 'mdi');
      case 'dataset': return libIconMarker('tn-dataset');
      case 'zvol': return tnIconMarker('database', 'mdi');
      case 'mountpoint': return tnIconMarker('server-network', 'mdi');
      case 'file': return this.getFileIcon(item.name);
      default: return tnIconMarker('file', 'mdi');
    }
  }

  getFileIcon(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'iso': case 'img': case 'dmg': return tnIconMarker('harddisk', 'mdi');
      default: return tnIconMarker('file', 'mdi');
    }
  }

  getZfsBadge(item: FileSystemItem): string {
    switch (item.type) {
      case 'dataset': return 'DS';
      case 'zvol': return 'ZV';
      case 'mountpoint': return 'MP';
      default: return '';
    }
  }

  isZfsObject(item: FileSystemItem): boolean {
    return ['dataset', 'zvol', 'mountpoint'].includes(item.type);
  }

  isSelected(item: FileSystemItem): boolean {
    return this.selectedItems().includes(item.path);
  }

  getRowClass = (row: FileSystemItem): string | string[] => {
    const classes: string[] = [];

    if (this.isSelected(row) && !row.disabled) {
      classes.push('selected');
    }

    if (row.disabled) {
      classes.push('disabled');
    }

    return classes;
  }

  getFileInfo(item: FileSystemItem): string {
    const parts: string[] = [];
    
    if (item.size !== undefined) {
      parts.push(this.formatFileSize(item.size));
    }
    
    if (item.modified) {
      parts.push(item.modified.toLocaleDateString());
    }
    
    return parts.join(' • ');
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) {return '0 B';}
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  getTypeDisplayName(type: string): string {
    switch (type) {
      case 'file': return 'File';
      case 'folder': return 'Folder';
      case 'dataset': return 'Dataset';
      case 'zvol': return 'Zvol';
      case 'mountpoint': return 'Mount Point';
      default: return type;
    }
  }

  formatDate(date: Date): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const timePart = date.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    // Check if it's today
    if (itemDate.getTime() === today.getTime()) {
      return `Today ${timePart}`;
    }
    
    // Check if it's yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (itemDate.getTime() === yesterday.getTime()) {
      return `Yesterday ${timePart}`;
    }
    
    // Check if it's this year
    if (date.getFullYear() === now.getFullYear()) {
      return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${timePart}`;
    }
    
    // Different year - include year
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()} ${timePart}`;
  }

}