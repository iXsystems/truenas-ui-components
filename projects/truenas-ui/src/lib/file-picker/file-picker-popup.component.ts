import { A11yModule } from '@angular/cdk/a11y';
import { ScrollingModule } from '@angular/cdk/scrolling';
import type { AfterViewChecked } from '@angular/core';
import { Component, computed, ElementRef, input, output, inject, signal } from '@angular/core';
import type {
  FileSystemItem, FileSystemItemType, FilePickerMode, FilePickerCreateAction, FilePickerCreateActionEvent
} from './file-picker.interfaces';
import { allowsCurrentDirectorySelection, getSelectableTypes } from './file-picker.utils';
import { TruncatePathPipe } from './truncate-path.pipe';
import { TnButtonComponent } from '../button/button.component';
import { TnCheckboxComponent } from '../checkbox/checkbox.component';
import { registerTruenasIcons } from '../custom-icons/generated-icons';
import { libIconMarker, tnIconMarker } from '../icon/icon-marker';
import { TnIconRegistryService } from '../icon/icon-registry.service';
import { TnIconComponent } from '../icon/icon.component';
import { FileSizePipe } from '../pipes/file-size/file-size.pipe';
import { TnTableComponent } from '../table/table.component';
import { TnTableColumnDirective, TnHeaderCellDefDirective, TnCellDefDirective } from '../table-column/table-column.directive';
import { TnTestIdDirective, scopeTestId, type TnTestIdValue } from '../test-id';

/** Uniquifies the inline-creation error id across popup instances. */
let nextInlineErrorId = 0;

/** State of an open inline creation row. */
interface InlineCreationState {
  action: FilePickerCreateAction;
  /** Name entered so far, mirrored from the input on every keystroke. */
  name: string;
  loading: boolean;
  error?: string;
}

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
    TnCheckboxComponent,
    TnTableComponent,
    TnTableColumnDirective,
    TnHeaderCellDefDirective,
    TnCellDefDirective,
    ScrollingModule,
    A11yModule,
    FileSizePipe,
    TruncatePathPipe,
    TnTestIdDirective
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
  /**
   * Test-id base the owning picker resolved (explicit `testId`, else the bound
   * control's name). Scopes every derived id inside the popup so ids stay
   * unique across pickers; with no base the ids fall back to their bare role
   * (`button-select`, `option-<name>`), which stays addressable because only
   * one popup can be open at a time.
   */
  testIdBase = input<TnTestIdValue>(undefined);

  private iconRegistry = inject(TnIconRegistryService);
  private elementRef = inject(ElementRef);

  constructor() {
    // Register TrueNAS custom icons
    registerTruenasIcons(this.iconRegistry);
  }

  /**
   * Requests a focus of the inline creation input on the next view check.
   * Set when the row opens and when a failed attempt re-enables the input —
   * the two moments the input either just entered the DOM or just lost focus
   * to the `disabled` attribute. Cleared once the focus is scheduled, so
   * focus is NOT permanently forced back: after an error the user can still
   * click elsewhere without being trapped in the input.
   */
  private pendingCreationFocus = false;

  /**
   * Focus runs here rather than at the call sites because the input may not
   * be in the DOM (or may still be disabled) until a later view check, and a
   * re-render can replace the element after focus() was scheduled — render
   * scheduling differs between hosts. So the request keeps retrying on each
   * check and is cleared only once the input actually holds focus.
   */
  ngAfterViewChecked(): void {
    if (!this.pendingCreationFocus) {return;}

    const creation = this.inlineCreation();
    if (!creation) {
      this.pendingCreationFocus = false;
      return;
    }
    if (creation.loading) {return;}

    const nameInput = (this.elementRef.nativeElement as HTMLElement)
      .querySelector<HTMLInputElement>('.inline-create-input');
    if (!nameInput) {return;}

    if (document.activeElement === nameInput) {
      this.pendingCreationFocus = false;
      return;
    }
    setTimeout(() => nameInput.focus());
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

  /**
   * The `testIdBase` normalized to a flat segment array for role-first ids.
   * Nothing is dropped here — `composeTestId` (via `[tnTestId]`) filters falsy
   * segments, so an unset base collapses to the bare role.
   */
  private readonly baseSegments = computed<(string | number | null | undefined)[]>(() => {
    const base = this.testIdBase();
    return Array.isArray(base) ? base : [base];
  });

  /**
   * Role-first segments for the footer chrome, mirroring tn-dialog-shell's
   * `button-close-<base>` convention: `button-select[-<base>]` and
   * `button-clear-selection[-<base>]`.
   */
  protected readonly selectTestId = computed(() => ['select', ...this.baseSegments()]);
  protected readonly clearSelectionTestId = computed(() => ['clear-selection', ...this.baseSegments()]);
  /** Role-first segments for the inline creation input: `input-create[-<base>]`. */
  protected readonly inlineCreateTestId = computed(() => ['create', ...this.baseSegments()]);

  /**
   * Base-first segments for a listed item's row (`option[-<base>]-<name>`) and
   * its multi-select checkbox (`checkbox[-<base>]-<name>`). The item NAME is
   * the discriminator (not the full path): it is unique within the listed
   * directory and keeps ids stable as the user browses.
   */
  itemTestId(item: FileSystemItem): TnTestIdValue {
    return scopeTestId(this.testIdBase(), item.name);
  }

  /** Role-first segments for an item's navigation chevron: `button-navigate[-<base>]-<name>`. */
  navigateTestId(item: FileSystemItem): TnTestIdValue {
    return ['navigate', ...this.baseSegments(), item.name];
  }

  /**
   * Role-first segments for a breadcrumb segment: `button-breadcrumb[-<base>]-<name>`.
   * The truncation ellipsis normalizes to nothing, leaving that segment at
   * `button-breadcrumb[-<base>]` — still unique, as at most one is rendered.
   */
  breadcrumbTestId(name: string): TnTestIdValue {
    return ['breadcrumb', ...this.baseSegments(), name];
  }

  /** Base-first segments for a consumer-defined create action: `button[-<base>]-<action id>`. */
  createActionTestId(action: FilePickerCreateAction): TnTestIdValue {
    return scopeTestId(this.testIdBase(), action.id);
  }

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
      this.inlineCreation.set({ action, name: '', loading: false });
      this.pendingCreationFocus = true;
      return;
    }
    this.createAction.emit({ actionId: action.id, parentPath: this.currentPath() });
  }

  /**
   * Inline creation state while a `create`-capable action's row is open.
   * The consumer's `create` callback does the real work; the row shows its
   * rejection message as the inline error. The entered name lives here (not
   * only in the DOM) so a listing re-render can't wipe it.
   */
  inlineCreation = signal<InlineCreationState | null>(null);

  /** Links the inline creation input to its error message for screen readers. */
  inlineErrorId = `tn-inline-create-error-${nextInlineErrorId++}`;

  async submitInlineCreation(): Promise<void> {
    const state = this.inlineCreation();
    if (!state || state.loading) {return;}

    const trimmed = state.name.trim();
    if (!trimmed) {
      // Submitting an empty name abandons the row
      this.inlineCreation.set(null);
      return;
    }

    const pending: InlineCreationState = { ...state, loading: true, error: undefined };
    this.inlineCreation.set(pending);
    try {
      const createdPath = await state.action.create!(this.currentPath(), trimmed);
      // Navigating away abandoned the row while the call was in flight —
      // don't select a result the user already walked away from
      if (this.inlineCreation() !== pending) {return;}
      this.inlineCreation.set(null);
      this.created.emit(createdPath);
    } catch (err: unknown) {
      // Same abandonment check: a late rejection must not resurrect the row
      // (in a different directory, no less)
      if (this.inlineCreation() !== pending) {return;}
      const message = err instanceof Error ? err.message : 'Creation failed';
      // The row stays editable for retry; ngAfterViewChecked refocuses it
      // once (the disabled attribute dropped focus during the attempt)
      this.inlineCreation.set({ ...pending, loading: false, error: message });
      this.pendingCreationFocus = true;
    }
  }

  onInlineCreationKeyDown(event: KeyboardEvent): void {
    // Keep keystrokes away from the table row, whose Enter/Space activation
    // would swallow typed spaces
    event.stopPropagation();

    if (event.key === 'Enter') {
      event.preventDefault();
      void this.submitInlineCreation();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.inlineCreation.set(null);
    }
  }

  /**
   * Mirrors the typed name into the creation state and clears a shown error
   * as soon as the name is edited, re-arming blur submit.
   */
  onInlineCreationInput(event: Event): void {
    const state = this.inlineCreation();
    if (!state) {return;}
    const name = (event.target as HTMLInputElement).value;
    this.inlineCreation.set({ ...state, name, error: undefined });
  }

  onInlineCreationBlur(): void {
    // A failed attempt already showed its error — repeating the create call
    // on every focus loss would loop (submit → error → refocus → blur → …).
    // The user retries with Enter or by editing the name, or abandons with
    // Escape / navigation.
    if (this.inlineCreation()?.error) {return;}

    // Auto-submit on blur, matching inline-rename conventions
    void this.submitInlineCreation();
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

  /**
   * Highlights selected rows through the table's supported active-row
   * styling (`activeWhen`) instead of reaching into its DOM.
   */
  isRowSelected = (row: FileSystemItem): boolean => this.isSelected(row);

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