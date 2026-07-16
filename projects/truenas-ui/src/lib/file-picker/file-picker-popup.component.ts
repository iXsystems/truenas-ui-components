import { A11yModule } from '@angular/cdk/a11y';
import { ScrollingModule } from '@angular/cdk/scrolling';
import type { AfterViewChecked } from '@angular/core';
import { Component, computed, ElementRef, input, output, inject, signal } from '@angular/core';
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

/** FileSystemItem decorated for display, plus the synthetic inline-create row. */
interface DisplayedFileItem extends FileSystemItem {
  /** Dim only items with no interaction left. */
  dimmed: boolean;
  /** Marks the synthetic first row hosting the inline creation input. */
  inlineCreate?: boolean;
}

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
export class TnFilePickerPopupComponent implements AfterViewChecked {
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
  private elementRef = inject(ElementRef);

  constructor() {
    // Register TrueNAS custom icons
    registerTruenasIcons(this.iconRegistry);
  }

  /**
   * Auto-focus the inline creation input whenever it is shown and idle.
   * Runs after every view check on purpose: one-shot focus is fragile here —
   * render scheduling differs between hosts, and browsers drop focus when a
   * focused element (the trigger button, or the input while loading) becomes
   * disabled. Retrying on each check self-heals; it settles as soon as the
   * input holds focus and stops when the row closes.
   */
  ngAfterViewChecked(): void {
    const creation = this.inlineCreation();
    if (!creation || creation.loading) {return;}

    const nameInput = (this.elementRef.nativeElement as HTMLElement)
      .querySelector<HTMLInputElement>('.inline-create-input');
    if (nameInput && document.activeElement !== nameInput) {
      setTimeout(() => nameInput.focus());
    }
  }

  itemClick = output<FileSystemItem>();
  itemDoubleClick = output<FileSystemItem>();
  pathNavigate = output<string>();
  /** Emits when a `createActions` button without a `create` callback is pressed. */
  createAction = output<FilePickerCreateActionEvent>();
  /** Emits the created path when an inline `create` flow succeeds. */
  created = output<string>();
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

  filteredFileItems = computed<DisplayedFileItem[]>(() => {
    const items = this.fileItems();
    const extensions = this.fileExtensions();
    const selectableTypes = getSelectableTypes(this.mode());

    const displayed: DisplayedFileItem[] = items.map(item => {
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

    // The inline creation row renders as the first item of the listing
    if (this.inlineCreation()) {
      displayed.unshift({
        path: '',
        name: '',
        type: 'folder',
        disabled: true,
        dimmed: false,
        inlineCreate: true
      });
    }

    return displayed;
  });

  onItemClick(item: FileSystemItem): void {
    if ((item as DisplayedFileItem).inlineCreate) {return;}
    this.itemClick.emit(item);
  }

  onItemDoubleClick(item: FileSystemItem): void {
    if ((item as DisplayedFileItem).inlineCreate) {return;}
    this.itemDoubleClick.emit(item);
  }

  onNavigateClick(event: Event, item: FileSystemItem): void {
    // Don't also toggle selection via the cell's click handler
    event.stopPropagation();
    this.itemDoubleClick.emit(item);
  }

  navigateToPath(path: string): void {
    // Leaving the directory abandons a pending inline creation row
    this.inlineCreation.set(null);
    this.pathNavigate.emit(path);
  }

  onCreateAction(action: FilePickerCreateAction): void {
    if (action.create) {
      // The clicked footer button is about to become disabled while focused;
      // blur it now so the browser's focus fixup doesn't fight the input
      // focus from ngAfterViewChecked
      (document.activeElement as HTMLElement | null)?.blur?.();
      this.inlineCreation.set({ action, loading: false });
      return;
    }
    this.createAction.emit({ actionId: action.id, parentPath: this.currentPath() });
  }

  /**
   * Inline creation state while a `create`-capable action's row is open.
   * The consumer's `create` callback does the real work; the row shows its
   * rejection message as the inline error.
   */
  inlineCreation = signal<{ action: FilePickerCreateAction; loading: boolean; error?: string } | null>(null);

  async submitInlineCreation(name: string): Promise<void> {
    const state = this.inlineCreation();
    if (!state || state.loading) {return;}

    const trimmed = name.trim();
    if (!trimmed) {
      // Submitting an empty name abandons the row
      this.inlineCreation.set(null);
      return;
    }

    this.inlineCreation.set({ ...state, loading: true, error: undefined });
    try {
      const createdPath = await state.action.create!(this.currentPath(), trimmed);
      this.inlineCreation.set(null);
      this.created.emit(createdPath);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Creation failed';
      // The row stays editable for retry; ngAfterViewChecked refocuses it
      this.inlineCreation.set({ ...state, loading: false, error: message });
    }
  }

  onInlineCreationKeyDown(event: KeyboardEvent): void {
    // Keep keystrokes away from the table row, whose Enter/Space activation
    // would swallow typed spaces
    event.stopPropagation();

    const inp = event.target as HTMLInputElement;
    if (event.key === 'Enter') {
      event.preventDefault();
      void this.submitInlineCreation(inp.value);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.inlineCreation.set(null);
    }
  }

  onInlineCreationBlur(event: Event): void {
    // Auto-submit on blur, matching inline-rename conventions
    const inp = event.target as HTMLInputElement;
    void this.submitInlineCreation(inp.value);
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