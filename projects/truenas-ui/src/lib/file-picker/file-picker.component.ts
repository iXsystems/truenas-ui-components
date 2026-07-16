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
import { isPathWithinRoot } from './path-utils';
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

  // Root the picker is confined to when rootPath is not provided
  effectiveRootPath = computed(() => this.rootPath() ?? '/mnt');

  // ControlValueAccessor implementation
  private onChange = (_value: string | string[]) => {};
  private onTouched = () => {};

  private overlay = inject(Overlay);
  private elementRef = inject(ElementRef);
  private viewContainerRef = inject(ViewContainerRef);

  ngOnInit(): void {
    this.currentPath.set(this.clampToRoot(this.startPath()));
    this.selectedPath.set(this.multiSelect() ? '' : '');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.close();
  }

  // ControlValueAccessor implementation
  writeValue(value: string | string[]): void {
    if (this.multiSelect()) {
      this.selectedItems.set(Array.isArray(value) ? value : value ? [value] : []);
      // For multi-select, show full paths separated by commas
      this.selectedPath.set(this.selectedItems().join(', '));
    } else {
      // Store the full path internally
      this.selectedPath.set(typeof value === 'string' ? value : '');
      this.selectedItems.set(value ? [typeof value === 'string' ? value : value[0]] : []);
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
  onPathInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const path = target.value;

    if (this.allowManualInput()) {
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
      const index = selected.indexOf(item.path);

      if (index >= 0) {
        selected.splice(index, 1);
      } else {
        selected.push(item.path);
      }

      this.selectedItems.set([...selected]);
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
    } else if (!item.disabled) {
      // Double-click on selectable item submits immediately
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
      this.selectedPath.set(selected.join(', '));
      this.onChange(selected);
      this.selectionChange.emit(selected);
    } else {
      const path = selected[0];
      this.selectedPath.set(path);
      this.onChange(path);
      this.selectionChange.emit(path);
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

  private clampToRoot(path: string): string {
    const root = this.effectiveRootPath();
    return isPathWithinRoot(path, root) ? path : root;
  }

  onClearSelection(): void {
    this.selectedItems.set([]);
    this.selectedPath.set('');
    this.onChange(this.multiSelect() ? [] : '');
    this.selectionChange.emit(this.multiSelect() ? [] : '');
  }

  private async loadDirectory(path: string): Promise<void> {
    const cb = this.callbacks();
    if (!cb?.getChildren) {
      // Default mock data for development
      this.fileItems.set(this.getMockFileItems(path));
      this.currentPath.set(path);
      this.pathChange.emit(path);
      return;
    }

    this.loading.set(true);

    try {
      const items = await cb.getChildren(path);
      this.fileItems.set(items || []);
      this.currentPath.set(path);
      this.pathChange.emit(path);
    } catch (err: unknown) {
      console.error('❌ Error loading directory:', err);
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

  private updateSelection(path: string): void {
    // Clear any existing error state since popup selections are valid
    this.hasError.set(false);

    if (this.multiSelect()) {
      const selected = [path];
      this.selectedItems.set(selected);
      this.selectedPath.set(selected.join(', '));
      this.onChange(selected);
    } else {
      this.selectedPath.set(path);
      this.selectedItems.set([path]);
      this.onChange(path);
    }

    this.selectionChange.emit(this.multiSelect() ? this.selectedItems() : path);
  }

  private updateSelectionFromItems(): void {
    // Clear any existing error state since popup selections are valid
    this.hasError.set(false);

    const selected = this.selectedItems();
    this.selectedPath.set(selected.join(', '));
    this.onChange(this.multiSelect() ? selected : selected[0] || '');
    this.selectionChange.emit(this.multiSelect() ? selected : selected[0] || '');
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
