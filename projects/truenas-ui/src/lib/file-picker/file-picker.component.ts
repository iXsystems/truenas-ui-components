import { A11yModule } from '@angular/cdk/a11y';
import { type ConnectedPosition, Overlay, type OverlayRef } from '@angular/cdk/overlay';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule, TemplatePortal } from '@angular/cdk/portal';
import type { OnDestroy, OnInit} from '@angular/core';
import { ElementRef, type TemplateRef, ViewContainerRef, Component, computed, forwardRef, input, output, signal, viewChild, inject } from '@angular/core';
import type { ControlValueAccessor} from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject } from 'rxjs';
import { TnFilePickerPopupComponent } from './file-picker-popup.component';
import type {
  FilePickerCallbacks, FilePickerCreateAction, FilePickerCreateActionEvent,
  FilePickerError, FilePickerMode, FileSystemItem, FileSystemItemType
} from './file-picker.interfaces';
import { allowsCurrentDirectorySelection } from './file-picker.utils';
import { isPathWithinRoot, normalizeRootPath } from './path-utils';
import { TnIconComponent } from '../icon/icon.component';
import { TnInputDirective } from '../input/input.directive';
import { TnTestIdDirective, type TnTestIdValue } from '../test-id';

@Component({
  selector: 'tn-file-picker',
  standalone: true,
  imports: [
    TnInputDirective,
    TnIconComponent,
    TnFilePickerPopupComponent,
    OverlayModule,
    PortalModule,
    A11yModule,
    TnTestIdDirective
],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TnFilePickerComponent),
      multi: true
    }
  ],
  templateUrl: './file-picker.component.html',
  styleUrl: './file-picker.component.scss',
  host: {
    'class': 'tn-file-picker',
    '[class.error]': 'hasError()'
  }
})
export class TnFilePickerComponent implements ControlValueAccessor, OnInit, OnDestroy {
  /**
   * What can be selected: a single mode, or an explicit list of selectable
   * item types, e.g. ['folder', 'dataset']. Whenever a directory-like type
   * (folder, dataset, mountpoint) is selectable, an empty selection stands
   * for the directory being browsed and submitting it picks `currentPath` —
   * this keeps empty directories selectable.
   */
  mode = input<FilePickerMode | FileSystemItemType[]>('any');
  multiSelect = input<boolean>(false);
  /** Consumer-defined creation flows shown as buttons in the popup footer. */
  createActions = input<FilePickerCreateAction[]>([]);
  allowManualInput = input<boolean>(true);
  /**
   * Open the picker popup when the input is clicked while no path is selected
   * yet — an empty field means the user is about to pick something, so the
   * browser opens without the extra click on the folder button. A field that
   * already holds a path keeps plain click behavior (the user may just want to
   * edit the text). Deliberately pointer-only: opening on focus would pop the
   * overlay on keyboard users tabbing through a form and leave it open behind
   * them; tabbing never opens it, and the folder button stays the keyboard
   * path to the popup.
   */
  openOnClick = input<boolean>(false);
  placeholder = input<string>('Select file or folder');
  disabled = input<boolean>(false);
  /**
   * Test-id applied to the file-picker container. Rendered under whichever attribute name
   * is configured via `TN_TEST_ATTR` (default `data-testid`).
   */
  testId = input<TnTestIdValue>(undefined);
  startPath = input<string>('/mnt');
  /** Restricts navigation — users cannot navigate above this path. */
  rootPath = input<string | undefined>(undefined);
  /**
   * Root against which the picker's VALUE is expressed — the form value,
   * `selectionChange` payloads, and the text shown in the input. Browsing
   * (`rootPath`, `startPath`, `callbacks`, `selectPath`) keeps absolute paths;
   * the mapping applies only at the value boundary. E.g. with
   * `valueRoot="/mnt"`, selecting `/mnt/tank/child` shows and emits the
   * dataset name `tank/child` instead of the mountpoint path. Typed input is
   * interpreted in the same value space (absolute paths still pass through).
   */
  valueRoot = input<string | undefined>(undefined);
  fileExtensions = input<string[] | undefined>(undefined);
  callbacks = input<FilePickerCallbacks | undefined>(undefined);

  selectionChange = output<string | string[]>();
  pathChange = output<string>();
  /** Re-emitted from the popup when one of the `createActions` buttons is pressed. */
  createAction = output<FilePickerCreateActionEvent>();
  error = output<FilePickerError>();

  wrapperEl = viewChild.required<ElementRef<HTMLDivElement>>('wrapper');
  filePickerTemplate = viewChild.required<TemplateRef<unknown>>('filePickerTemplate');

  private destroy$ = new Subject<void>();
  private overlayRef?: OverlayRef;
  private portal?: TemplatePortal;

  // Component state
  isOpen = signal<boolean>(false);
  selectedPath = signal<string>('');
  currentPath = signal<string>('');
  fileItems = signal<FileSystemItem[]>([]);
  selectedItems = signal<string[]>([]);
  loading = signal<boolean>(false);
  hasError = signal<boolean>(false);
  private formDisabled = signal<boolean>(false);

  // Computed disabled state (combines input and form state)
  isDisabled = computed(() => this.disabled() || this.formDisabled());

  // Root the picker is confined to when rootPath is not provided, with
  // trailing slashes collapsed so confinement checks compare exact paths
  effectiveRootPath = computed(() => normalizeRootPath(this.rootPath() ?? '/mnt'));

  // ControlValueAccessor implementation
  private onChange = (_value: string | string[]) => {};
  private onTouched = () => {};

  private overlay = inject(Overlay);
  private elementRef = inject(ElementRef);
  private viewContainerRef = inject(ViewContainerRef);

  ngOnInit(): void {
    this.currentPath.set(this.clampToRoot(this.startPath()));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.close();
  }

  // ControlValueAccessor implementation
  writeValue(value: string | string[]): void {
    // The display is canonicalized into value space by round-tripping through
    // the mapping: a consumer may write an absolute path while valueRoot is
    // set (e.g. /mnt/tank with valueRoot="/mnt"), and echoing it verbatim
    // would make the field silently flip to the canonical form (tank) on the
    // next submit. Selection state keeps internal absolute paths either way;
    // paths outside the value root round-trip unchanged.
    if (this.multiSelect()) {
      const values = Array.isArray(value) ? value : value ? [value] : [];
      const items = values.map(entry => this.fromValueSpace(entry));
      this.selectedItems.set(items);
      // An entry equal to the value root maps to '' and leaves a stray comma
      // in the join — accepted, per the documented "the value root is not a
      // selectable value" caveat in toValueSpace.
      this.selectedPath.set(items.map(item => this.toValueSpace(item)).join(', '));
    } else {
      const single = typeof value === 'string' ? value : value ? value[0] : '';
      const item = single ? this.fromValueSpace(single) : '';
      this.selectedItems.set(item ? [item] : []);
      this.selectedPath.set(item ? this.toValueSpace(item) : '');
    }
  }

  registerOnChange(fn: (value: string | string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  // Event handlers

  /**
   * Commits a manually typed path. Bound to the input's `change` event
   * (Enter or blur), not `input`: validating per keystroke would emit an
   * error for every incomplete prefix of a valid path ('/m', '/mn', …)
   * and spam `validatePath` with paths the user never meant.
   */
  onPathCommit(event: Event): void {
    const target = event.target as HTMLInputElement;
    // Typed text is expressed in value space, like the text the input displays
    const path = this.fromValueSpace(target.value);

    if (this.allowManualInput()) {
      // Clearing the input clears the selection
      if (!path) {
        this.onClearSelection();
        this.onTouched();
        return;
      }

      // Manually typed paths honor the same confinement as navigation
      if (!isPathWithinRoot(path, this.effectiveRootPath())) {
        this.emitError('validation', `Path is outside of ${this.effectiveRootPath()}`, path);
        this.onTouched();
        return;
      }

      const cb = this.callbacks();
      if (cb?.validatePath) {
        cb.validatePath(path).then(isValid => {
          if (isValid) {
            this.updateSelection(path);
          } else {
            this.emitError('validation', `Invalid path: ${path}`, path);
          }
        }).catch(err => {
          this.emitError('validation', err.message || 'Path validation failed', path);
        });
      } else {
        this.updateSelection(path);
      }
    }

    this.onTouched();
  }

  /** `openOnClick` entry point. */
  onInputClick(): void {
    if (this.openOnClick() && !this.selectedPath()) {
      this.openFilePicker();
    }
  }

  openFilePicker(): void {
    if (this.isOpen() || this.isDisabled()) {return;}

    this.createOverlay();
    this.isOpen.set(true);
    void this.loadDirectory(this.currentPath());
  }

  close(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = undefined;
      this.portal = undefined;
    }
    this.isOpen.set(false);
  }

  // File browser methods
  onItemClick(item: FileSystemItem): void {
    if (item.disabled) {return;}

    if (this.multiSelect()) {
      const selected = this.selectedItems();
      this.selectedItems.set(
        selected.includes(item.path)
          ? selected.filter((path) => path !== item.path)
          : [...selected, item.path]
      );
    } else {
      // Single select - just update selection state, don't apply yet
      this.selectedItems.set([item.path]);
    }
  }

  onItemDoubleClick(item: FileSystemItem): void {
    // Define navigatable types
    const isNavigatable = ['folder', 'dataset', 'mountpoint'].includes(item.type);

    // Allow navigation even if disabled, as long as it's a navigatable type
    if (isNavigatable) {
      this.navigateToPath(item.path);
    } else if (!item.disabled && !this.multiSelect()) {
      // Double-click on a selectable item submits immediately. In
      // multi-select this shortcut would silently replace the selection the
      // user built up with the double-clicked item, so it is single-select
      // only (the two clicks already toggled the checkbox twice — a no-op).
      this.selectedItems.set([item.path]);
      this.onSubmit();
    }
  }

  onSubmit(): void {
    // Apply the selection and close the popup
    let selected = this.selectedItems();

    if (selected.length === 0) {
      if (!allowsCurrentDirectorySelection(this.mode())) {return;}
      // An empty selection stands for the directory being browsed
      selected = [this.currentPath()];
    }

    // Clear any existing error state
    this.hasError.set(false);

    if (this.multiSelect()) {
      const values = selected.map(path => this.toValueSpace(path));
      this.selectedPath.set(values.join(', '));
      this.onChange(values);
      this.selectionChange.emit(values);
    } else {
      const value = this.toValueSpace(selected[0]);
      this.selectedPath.set(value);
      this.onChange(value);
      this.selectionChange.emit(value);
    }

    this.close();
  }

  onCancel(): void {
    // Close without applying selection
    this.close();
  }

  navigateToPath(path: string): void {
    void this.loadDirectory(this.clampToRoot(path));
  }

  /** An inline `create` flow finished — show the new item selected and applied. */
  onCreated(path: string): void {
    void this.selectPath(path);
  }

  /**
   * Re-fetches the listing of the directory currently being browsed. Call it
   * when the directory changed outside the picker, e.g. after a
   * `createAction` flow created something in it.
   */
  async refresh(): Promise<void> {
    await this.loadDirectory(this.currentPath());
  }

  /**
   * Programmatically selects `path`, e.g. the mountpoint a `createAction`
   * flow just created: browses to its parent so the refreshed listing shows
   * the new item selected, and applies the path as the picker's value (form
   * value and `selectionChange`). The popup stays open so the user can
   * confirm with Select or keep browsing. Paths outside `rootPath` are
   * rejected with a `validation` error — the picker's value honors the same
   * confinement as navigation and manual input.
   *
   * This is a single-path operation: like a manually typed path, it
   * REPLACES any pending multi-selection rather than appending to it —
   * the intent is to focus the one path (e.g. a just-created item), not to
   * merge it into picks the user may have abandoned.
   */
  async selectPath(path: string): Promise<void> {
    if (!isPathWithinRoot(path, this.effectiveRootPath())) {
      this.emitError('validation', `Path is outside of ${this.effectiveRootPath()}`, path);
      return;
    }
    // The parent still needs clamping: the root's own parent is outside it
    const parent = path.substring(0, path.lastIndexOf('/'));
    await this.loadDirectory(this.clampToRoot(parent || this.effectiveRootPath()));
    this.updateSelection(path);
  }

  private clampToRoot(path: string): string {
    const root = this.effectiveRootPath();
    return isPathWithinRoot(path, root) ? path : root;
  }

  /**
   * Browsing to another directory drops a not-yet-applied single-select
   * selection: keeping it would leave the footer claiming an item from a
   * directory the user is no longer looking at, and would mask the implicit
   * current-directory selection. Multi-select keeps its selection so items
   * can be picked across directories. The applied value (`selectedPath`,
   * form value) is untouched either way.
   */
  private clearStalePendingSelection(directoryChanged: boolean): void {
    if (directoryChanged && !this.multiSelect()) {
      this.selectedItems.set([]);
    }
  }

  onClearSelection(): void {
    this.selectedItems.set([]);
    this.selectedPath.set('');
    this.onChange(this.multiSelect() ? [] : '');
    this.selectionChange.emit(this.multiSelect() ? [] : '');
  }

  private async loadDirectory(path: string): Promise<void> {
    const directoryChanged = path !== this.currentPath();
    const cb = this.callbacks();
    if (!cb?.getChildren) {
      // Default mock data for development
      this.fileItems.set(this.getMockFileItems(path));
      this.currentPath.set(path);
      this.clearStalePendingSelection(directoryChanged);
      this.pathChange.emit(path);
      return;
    }

    this.loading.set(true);

    try {
      const items = await cb.getChildren(path);
      this.fileItems.set(items || []);
      this.currentPath.set(path);
      this.clearStalePendingSelection(directoryChanged);
      this.pathChange.emit(path);
    } catch (err: unknown) {
      this.emitError('navigation', err instanceof Error ? err.message : 'Failed to load directory', path);
    } finally {
      this.loading.set(false);
    }
  }

  private getMockFileItems(path: string): FileSystemItem[] {
    // Mock data for development
    return [
      {
        path: `${path}/Documents`,
        name: 'Documents',
        type: 'folder',
        modified: new Date()
      },
      {
        path: `${path}/Downloads`,
        name: 'Downloads',
        type: 'folder',
        modified: new Date()
      },
      {
        path: `${path}/dataset1`,
        name: 'dataset1',
        type: 'dataset',
        modified: new Date()
      },
      {
        path: `${path}/example.txt`,
        name: 'example.txt',
        type: 'file',
        size: 1024,
        modified: new Date()
      }
    ];
  }

  /**
   * Applies `path` as the picker's whole value. In multi-select this
   * replaces the selection with the single path — both callers (typed
   * paths, `selectPath()`) express one deliberate choice, so appending
   * would be the surprising behavior.
   */
  private updateSelection(path: string): void {
    // Clear any existing error state since popup selections are valid
    this.hasError.set(false);

    const value = this.toValueSpace(path);
    if (this.multiSelect()) {
      this.selectedItems.set([path]);
      this.selectedPath.set(value);
      this.onChange([value]);
    } else {
      this.selectedPath.set(value);
      this.selectedItems.set([path]);
      this.onChange(value);
    }

    this.selectionChange.emit(this.multiSelect() ? [value] : value);
  }

  // Mirrors effectiveRootPath so both roots normalize trailing slashes once
  private normalizedValueRoot = computed(() => {
    const valueRoot = this.valueRoot();
    return valueRoot ? normalizeRootPath(valueRoot) : undefined;
  });

  /** Maps an internal absolute path into the `valueRoot`-relative value space. */
  private toValueSpace(path: string): string {
    const root = this.normalizedValueRoot();
    if (!root) {return path;}
    // The value root itself maps to '' — the same payload as a cleared
    // selection, and writeValue('') cannot restore it. Deliberate: a value
    // root is the container the values are named against (e.g. /mnt for
    // dataset names), not a selectable value itself. Revisit this mapping
    // before pairing valueRoot with a selectable root directory.
    if (path === root) {return '';}
    if (root === '/') {return path.startsWith('/') ? path.slice(1) : path;}
    // Paths outside the value root (e.g. typed absolute paths) pass through
    return path.startsWith(`${root}/`) ? path.slice(root.length + 1) : path;
  }

  /** Maps a `valueRoot`-relative value back into an internal absolute path. */
  private fromValueSpace(value: string): string {
    const root = this.normalizedValueRoot();
    if (!root || !value || value.startsWith('/')) {return value;}
    return root === '/' ? `/${value}` : `${root}/${value}`;
  }

  private emitError(type: FilePickerError['type'], message: string, path?: string): void {
    this.hasError.set(true);
    this.error.emit({ type, message, path });
    // Error persists until cleared by valid input or selection
  }

  private createOverlay(): void {
    if (this.overlayRef) {return;}

    const positions: ConnectedPosition[] = [
      {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
        offsetY: 8,
      },
      {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'bottom',
        offsetY: -8,
      },
      {
        originX: 'end',
        originY: 'bottom',
        overlayX: 'end',
        overlayY: 'top',
        offsetY: 8,
      },
      {
        originX: 'end',
        originY: 'top',
        overlayX: 'end',
        overlayY: 'bottom',
        offsetY: -8,
      },
    ];

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.wrapperEl())
      .withPositions(positions)
      .withFlexibleDimensions(false)
      .withPush(false);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      panelClass: 'tn-file-picker-overlay'
    });

    this.overlayRef.backdropClick().subscribe(() => {
      this.close();
    });

    this.portal = new TemplatePortal(this.filePickerTemplate(), this.viewContainerRef);
    this.overlayRef.attach(this.portal);
  }

}
