import { Component, Input, Output, EventEmitter, signal, computed, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { A11yModule } from '@angular/cdk/a11y';

import { IxIconComponent } from '../ix-icon/ix-icon.component';
import { IxButtonComponent } from '../ix-button/ix-button.component';
import { IxTableComponent } from '../ix-table/ix-table.component';
import { IxTableColumnDirective, IxHeaderCellDefDirective, IxCellDefDirective } from '../ix-table-column/ix-table-column.directive';
import { FileSizePipe } from '../pipes/file-size/file-size.pipe';
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
    FileSizePipe
  ],
  templateUrl: './ix-file-picker-popup.component.html',
  styleUrl: './ix-file-picker-popup.component.scss',
  host: {
    'class': 'ix-file-picker-popup'
  }
})
export class IxFilePickerPopupComponent implements OnInit, AfterViewInit {
  @Input() mode: FilePickerMode = 'any';
  @Input() multiSelect = false;
  @Input() allowCreate = true;
  @Input() allowDatasetCreate = false;
  @Input() allowZvolCreate = false;
  @Input() currentPath = '/mnt';
  @Input() fileItems: FileSystemItem[] = [];
  @Input() selectedItems: string[] = [];
  @Input() loading = false;
  @Input() fileExtensions?: string[];

  constructor() {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  @Output() itemClick = new EventEmitter<FileSystemItem>();
  @Output() itemDoubleClick = new EventEmitter<FileSystemItem>();
  @Output() pathNavigate = new EventEmitter<string>();
  @Output() createFolder = new EventEmitter<CreateFolderEvent>();
  @Output() close = new EventEmitter<void>();

  // Table configuration
  displayedColumns = ['select', 'name', 'size', 'modified'];

  // Computed values
  pathSegments = computed(() => {
    const path = this.currentPath;
    if (!path || path === '/') return [{ name: 'Root', path: '/' }];
    
    const segments: PathSegment[] = [];
    const parts = path.split('/').filter(p => p);
    
    // Skip the first "mnt" part if it exists
    const relevantParts = parts[0] === 'mnt' ? parts.slice(1) : parts;
    
    segments.push({ name: 'Root', path: '/mnt' });
    
    let currentPath = '/mnt';
    for (const part of relevantParts) {
      currentPath += '/' + part;
      segments.push({ name: part, path: currentPath });
    }
    
    return segments;
  });

  filteredFileItems = computed(() => {
    const items = this.fileItems;
    const extensions = this.fileExtensions;
    const mode = this.mode;
    
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
    this.itemClick.emit(item);
  }

  onItemDoubleClick(item: FileSystemItem): void {
    this.itemDoubleClick.emit(item);
  }

  navigateToPath(path: string): void {
    this.pathNavigate.emit(path);
  }

  onCreateFolder(): void {
    this.createFolder.emit({
      parentPath: this.currentPath,
      folderName: 'New Folder'
    });
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
    return this.selectedItems.includes(item.path);
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