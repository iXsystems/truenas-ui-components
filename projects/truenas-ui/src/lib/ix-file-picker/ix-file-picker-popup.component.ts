import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, AfterViewChecked, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { A11yModule } from '@angular/cdk/a11y';

import { IxIconComponent } from '../ix-icon/ix-icon.component';
import { IxButtonComponent } from '../ix-button/ix-button.component';
import { IxTableComponent } from '../ix-table/ix-table.component';
import { IxTableColumnDirective, IxHeaderCellDefDirective, IxCellDefDirective } from '../ix-table-column/ix-table-column.directive';
import { FileSizePipe } from '../pipes/file-size/file-size.pipe';
import { TruncatePathPipe } from '../pipes/truncate-path/truncate-path.pipe';
import { FileSystemItem, FilePickerCallbacks, CreateFolderEvent, FilePickerError, PathSegment, FilePickerMode } from './ix-file-picker.interfaces';

@Component({
  selector: 'ix-file-picker-popup',
  standalone: true,
  imports: [
    CommonModule,
    IxIconComponent,
    IxButtonComponent,
    IxTableComponent,
    IxTableColumnDirective,
    IxHeaderCellDefDirective,
    IxCellDefDirective,
    ScrollingModule,
    A11yModule,
    FileSizePipe,
    TruncatePathPipe
  ],
  templateUrl: './ix-file-picker-popup.component.html',
  styleUrl: './ix-file-picker-popup.component.scss',
  host: {
    'class': 'ix-file-picker-popup'
  }
})
export class IxFilePickerPopupComponent implements OnInit, AfterViewInit, AfterViewChecked {
  mode = input<FilePickerMode>('any');
  multiSelect = input<boolean>(false);
  allowCreate = input<boolean>(true);
  allowDatasetCreate = input<boolean>(false);
  allowZvolCreate = input<boolean>(false);
  currentPath = input<string>('/mnt');
  fileItems = input<FileSystemItem[]>([]);
  selectedItems = input<string[]>([]);
  loading = input<boolean>(false);
  creationLoading = input<boolean>(false);
  fileExtensions = input<string[] | undefined>(undefined);

  constructor() {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  ngAfterViewChecked(): void {
    // Auto-focus and select text in input when it appears
    const input = document.querySelector('[data-autofocus="true"]') as HTMLInputElement;
    if (input && input !== document.activeElement) {
      setTimeout(() => {
        input.focus();
        input.select();
      }, 0);
    }
  }

  @Output() itemClick = new EventEmitter<FileSystemItem>();
  @Output() itemDoubleClick = new EventEmitter<FileSystemItem>();
  @Output() pathNavigate = new EventEmitter<string>();
  @Output() createFolder = new EventEmitter<CreateFolderEvent>();
  @Output() clearSelection = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  @Output() submitFolderName = new EventEmitter<{ name: string; tempId: string }>();
  @Output() cancelFolderCreation = new EventEmitter<string>();

  // Table configuration
  displayedColumns = ['select', 'name', 'size', 'modified'];

  // Computed values
  filteredFileItems = computed(() => {
    const items = this.fileItems();
    const extensions = this.fileExtensions();
    const mode = this.mode();

    return items.filter(item => {
      // Filter by mode
      if (mode !== 'any') {
        if (mode === 'file' && item.type !== 'file') return false;
        if (mode === 'folder' && item.type !== 'folder') return false;
        if (mode === 'dataset' && item.type !== 'dataset') return false;
        if (mode === 'zvol' && item.type !== 'zvol') return false;
      }

      // Filter by file extensions
      if (extensions && extensions.length > 0 && item.type === 'file') {
        return extensions.some(ext => item.name.toLowerCase().endsWith(ext.toLowerCase()));
      }

      return true;
    });
  });

  onItemClick(item: FileSystemItem): void {
    if (item.isCreating) return; // Don't allow selection during creation
    this.itemClick.emit(item);
  }

  onItemDoubleClick(item: FileSystemItem): void {
    if (item.isCreating) return; // Don't allow navigation during creation
    this.itemDoubleClick.emit(item);
  }

  navigateToPath(path: string): void {
    // Check if any item is in creation mode
    const hasCreatingItem = this.fileItems().some(item => item.isCreating);
    if (hasCreatingItem) {
      console.warn('Cannot navigate while creating a folder');
      return;
    }
    this.pathNavigate.emit(path);
  }

  onCreateFolder(): void {
    console.log('Popup onCreateFolder called');
    this.createFolder.emit({
      parentPath: this.currentPath(),
      folderName: 'New Folder'
    });
  }

  onClearSelection(): void {
    this.clearSelection.emit();
  }

  onFolderNameSubmit(event: Event, item: FileSystemItem): void {
    const input = event.target as HTMLInputElement;
    const name = input.value.trim();

    if (item.tempId) {
      // Even if empty, let parent component handle validation
      this.submitFolderName.emit({ name, tempId: item.tempId });
    }
  }

  onFolderNameCancel(item: FileSystemItem): void {
    if (item.tempId) {
      this.cancelFolderCreation.emit(item.tempId);
    }
  }

  onFolderNameInputBlur(event: Event, item: FileSystemItem): void {
    // Auto-submit on blur (don't close picker, parent handles submission)
    const input = event.target as HTMLInputElement;
    if (item.tempId) {
      this.submitFolderName.emit({
        name: input.value.trim(),
        tempId: item.tempId
      });
    }
  }

  onFolderNameKeyDown(event: KeyboardEvent, item: FileSystemItem): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onFolderNameSubmit(event, item);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.onFolderNameCancel(item);
    }
  }

  isCreateDisabled(): boolean {
    return this.fileItems().some(item => item.isCreating) || this.creationLoading();
  }

  // Utility methods
  getItemIcon(item: FileSystemItem): string {
    if (item.icon) return item.icon;
    
    switch (item.type) {
      case 'folder': return 'folder';
      case 'dataset': return 'database';
      case 'zvol': return 'harddisk';
      case 'mountpoint': return 'network-share';
      case 'file': return this.getFileIcon(item.name);
      default: return 'file';
    }
  }

  getFileIcon(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'txt': case 'log': case 'md': case 'readme': return 'file';
      case 'pdf': return 'file';
      case 'jpg': case 'jpeg': case 'png': case 'gif': case 'svg': case 'webp': return 'file';
      case 'mp4': case 'avi': case 'mov': case 'mkv': case 'webm': return 'file';
      case 'mp3': case 'wav': case 'flac': case 'ogg': case 'aac': return 'file';
      case 'zip': case 'tar': case 'gz': case 'rar': case '7z': return 'file';
      case 'js': case 'ts': case 'html': case 'css': case 'py': case 'java': case 'cpp': case 'c': return 'file';
      case 'json': case 'xml': case 'yaml': case 'yml': case 'toml': return 'file';
      case 'iso': case 'img': case 'dmg': return 'harddisk';
      default: return 'file';
    }
  }

  /**
   * Get the library type for the icon
   * @param item FileSystemItem
   * @returns 'mdi' for all icons to use Material Design Icons
   */
  getItemIconLibrary(item: FileSystemItem): 'mdi' {
    return 'mdi';
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
    if (bytes === 0) return '0 B';
    
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