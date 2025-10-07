import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, TemplateRef, ViewContainerRef, forwardRef, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { OverlayModule, Overlay, OverlayRef, ConnectedPosition } from '@angular/cdk/overlay';
import { TemplatePortal, PortalModule } from '@angular/cdk/portal';
import { A11yModule } from '@angular/cdk/a11y';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IxInputDirective } from '../ix-input/ix-input.directive';
import { IxIconComponent } from '../ix-icon/ix-icon.component';
import { IxFilePickerPopupComponent } from './ix-file-picker-popup.component';
import { IxMdiIconService } from '../ix-mdi-icon/ix-mdi-icon.service';
import { FileSystemItem, FilePickerCallbacks, CreateFolderEvent, FilePickerError, PathSegment, FilePickerMode } from './ix-file-picker.interfaces';

@Component({
  selector: 'ix-file-picker',
  standalone: true,
  imports: [
    CommonModule,
    IxInputDirective,
    IxIconComponent,
    IxFilePickerPopupComponent,
    OverlayModule,
    PortalModule,
    A11yModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IxFilePickerComponent),
      multi: true
    }
  ],
  templateUrl: './ix-file-picker.component.html',
  styleUrl: './ix-file-picker.component.scss',
  host: {
    'class': 'ix-file-picker',
    '[class.error]': 'hasError'
  }
})
export class IxFilePickerComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() mode: FilePickerMode = 'any';
  @Input() multiSelect = false;
  @Input() allowCreate = true;
  @Input() allowDatasetCreate = false;
  @Input() allowZvolCreate = false;
  @Input() allowManualInput = true;
  @Input() placeholder = 'Select file or folder';
  @Input() disabled = false;
  @Input() startPath = '/mnt';
  @Input() rootPath?: string;
  @Input() fileExtensions?: string[];
  @Input() callbacks?: FilePickerCallbacks;

  @Output() selectionChange = new EventEmitter<string | string[]>();
  @Output() pathChange = new EventEmitter<string>();
  @Output() createFolder = new EventEmitter<CreateFolderEvent>();
  @Output() error = new EventEmitter<FilePickerError>();

  @ViewChild('wrapper') wrapperEl!: ElementRef<HTMLDivElement>;
  @ViewChild('filePickerTemplate', { static: true }) filePickerTemplate!: TemplateRef<any>;

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

  // Computed display path (omits /mnt)
  displayPath = computed(() => {
    const path = this.selectedPath();
    if (!path) return '';
    
    if (path.startsWith('/mnt/')) {
      return path.substring(4); // Remove "/mnt" prefix
    } else if (path === '/mnt') {
      return '/'; // Show root as just "/"
    }
    
    return path;
  });


  // ControlValueAccessor implementation
  private onChange = (value: string | string[]) => {};
  private onTouched = () => {};

  constructor(
    private overlay: Overlay,
    private elementRef: ElementRef,
    private viewContainerRef: ViewContainerRef,
    private mdiIconService: IxMdiIconService
  ) {}

  async ngOnInit(): Promise<void> {
    this.currentPath.set(this.startPath);
    this.selectedPath.set(this.multiSelect ? '' : '');
    
    // Ensure MDI icons are loaded for the file picker trigger and popup
    await this.initializeMdiIcons();
  }

  /**
   * Initialize MDI icons required for file picker functionality
   */
  private async initializeMdiIcons(): Promise<void> {
    try {
      // Pre-load essential icons for file picker
      const iconPromises = [
        this.mdiIconService.ensureIconLoaded('folder'),
        this.mdiIconService.ensureIconLoaded('file'),
        this.mdiIconService.ensureIconLoaded('database'),
        this.mdiIconService.ensureIconLoaded('harddisk'),
        this.mdiIconService.ensureIconLoaded('network-share'),
        this.mdiIconService.ensureIconLoaded('folder-plus'),
        this.mdiIconService.ensureIconLoaded('loading'),
        this.mdiIconService.ensureIconLoaded('lock'),
        this.mdiIconService.ensureIconLoaded('folder-open')
      ];
      
      await Promise.all(iconPromises);
    } catch (error) {
      console.warn('Failed to initialize some MDI icons for file picker:', error);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.close();
  }

  // ControlValueAccessor implementation
  writeValue(value: string | string[]): void {
    if (this.multiSelect) {
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
    this.disabled = isDisabled;
  }

  // Event handlers
  onPathInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const displayPath = target.value;
    
    if (this.allowManualInput && displayPath !== this.displayPath()) {
      // Convert display path back to full path with /mnt prefix
      const fullPath = this.displayPathToFullPath(displayPath);
      
      if (this.callbacks?.validatePath) {
        this.callbacks.validatePath(fullPath).then(isValid => {
          if (isValid) {
            this.updateSelection(fullPath);
          } else {
            this.emitError('validation', `Invalid path: ${displayPath}`, fullPath);
          }
        }).catch(err => {
          this.emitError('validation', err.message || 'Path validation failed', fullPath);
        });
      } else {
        this.updateSelection(fullPath);
      }
    }
    
    this.onTouched();
  }

  openFilePicker(): void {
    if (this.isOpen() || this.disabled) return;
    
    this.loadDirectory(this.currentPath()).then(() => {
      this.createOverlay();
      this.isOpen.set(true);
    });
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
    if (item.disabled) return;
    
    if (this.multiSelect) {
      const selected = this.selectedItems();
      const index = selected.indexOf(item.path);
      
      if (index >= 0) {
        selected.splice(index, 1);
      } else {
        selected.push(item.path);
      }
      
      this.selectedItems.set([...selected]);
      this.updateSelectionFromItems();
    } else {
      this.updateSelection(item.path);
    }
  }

  onItemDoubleClick(item: FileSystemItem): void {
    if (item.disabled) return;
    
    if (item.type === 'folder' || item.type === 'dataset' || item.type === 'mountpoint') {
      this.navigateToPath(item.path);
    } else if (!this.multiSelect) {
      this.updateSelection(item.path);
      this.close();
    }
  }

  navigateToPath(path: string): void {
    this.loadDirectory(path);
  }

  onCreateFolder(): void {
    // This would typically open a dialog for folder name input
    // For now, emit the event for the parent component to handle
    this.createFolder.emit({
      parentPath: this.currentPath(),
      folderName: 'New Folder'
    });
  }


  private async loadDirectory(path: string): Promise<void> {
    if (!this.callbacks?.getChildren) {
      // Default mock data for development
      this.fileItems.set(this.getMockFileItems(path));
      this.currentPath.set(path);
      this.pathChange.emit(path);
      return;
    }
    
    this.loading.set(true);
    
    try {
      const items = await this.callbacks.getChildren(path);
      this.fileItems.set(items);
      this.currentPath.set(path);
      this.pathChange.emit(path);
    } catch (err: any) {
      console.error('❌ Error loading directory:', err);
      this.emitError('navigation', err.message || 'Failed to load directory', path);
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
    if (this.multiSelect) {
      const selected = [path];
      this.selectedItems.set(selected);
      this.selectedPath.set(selected.join(', '));
      this.onChange(selected);
    } else {
      this.selectedPath.set(path);
      this.selectedItems.set([path]);
      this.onChange(path);
    }
    
    this.selectionChange.emit(this.multiSelect ? this.selectedItems() : path);
  }

  private updateSelectionFromItems(): void {
    const selected = this.selectedItems();
    this.selectedPath.set(selected.join(', '));
    this.onChange(this.multiSelect ? selected : selected[0] || '');
    this.selectionChange.emit(this.multiSelect ? selected : selected[0] || '');
  }

  private displayPathToFullPath(displayPath: string): string {
    if (!displayPath) return '/mnt';
    
    if (displayPath === '/') {
      return '/mnt';
    }
    
    if (displayPath.startsWith('/')) {
      return '/mnt' + displayPath;
    }
    
    return '/mnt/' + displayPath;
  }

  private emitError(type: FilePickerError['type'], message: string, path?: string): void {
    this.hasError.set(true);
    this.error.emit({ type, message, path });
    
    // Clear error after a delay
    setTimeout(() => this.hasError.set(false), 3000);
  }

  private createOverlay(): void {
    if (this.overlayRef) return;

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
      .flexibleConnectedTo(this.wrapperEl)
      .withPositions(positions)
      .withFlexibleDimensions(false)
      .withPush(false);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      panelClass: 'ix-file-picker-overlay',
      width: this.wrapperEl.nativeElement.offsetWidth
    });

    this.overlayRef.backdropClick().subscribe(() => {
      this.close();
    });

    this.portal = new TemplatePortal(this.filePickerTemplate, this.viewContainerRef);
    this.overlayRef.attach(this.portal);
  }

}