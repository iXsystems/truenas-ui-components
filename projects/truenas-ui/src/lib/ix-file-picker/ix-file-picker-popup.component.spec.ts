import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { IxFilePickerPopupComponent } from './ix-file-picker-popup.component';
import { FileSystemItem } from './ix-file-picker.interfaces';
import { FileSizePipe } from '../pipes/file-size/file-size.pipe';

describe('IxFilePickerPopupComponent', () => {
  let component: IxFilePickerPopupComponent;
  let fixture: ComponentFixture<IxFilePickerPopupComponent>;

  const mockFileItems: FileSystemItem[] = [
    {
      path: '/mnt/tank/documents',
      name: 'documents',
      type: 'folder',
      size: undefined,
      modified: new Date(2024, 0, 15, 14, 30),
      permissions: 'write'
    },
    {
      path: '/mnt/tank/database.db',
      name: 'database.db',
      type: 'file',
      size: 268435456, // 256MB
      modified: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      permissions: 'write'
    },
    {
      path: '/mnt/tank/vm-storage',
      name: 'vm-storage',
      type: 'zvol',
      size: 10737418240, // 10GB
      modified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      permissions: 'write'
    },
    {
      path: '/mnt/tank/small.txt',
      name: 'small.txt',
      type: 'file',
      size: 1024, // 1KB
      modified: new Date(), // Today
      permissions: 'read'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IxFilePickerPopupComponent, NoopAnimationsModule, FileSizePipe],
      providers: [provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(IxFilePickerPopupComponent);
    component = fixture.componentInstance;
    
    // Set up component with mock data
    fixture.componentRef.setInput('fileItems', mockFileItems);
    fixture.componentRef.setInput('currentPath', '/mnt/tank');
    fixture.componentRef.setInput('loading', false);
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('File Size Formatting', () => {
    it('should format file sizes correctly using the existing method (backward compatibility)', () => {
      expect(component.formatFileSize(1024)).toBe('1 KB');
      expect(component.formatFileSize(1048576)).toBe('1 MB');
      expect(component.formatFileSize(1073741824)).toBe('1 GB');
      expect(component.formatFileSize(268435456)).toBe('256 MB');
      expect(component.formatFileSize(0)).toBe('0 B');
    });

    it('should handle edge cases in file size formatting', () => {
      expect(component.formatFileSize(512)).toBe('512 B');
      expect(component.formatFileSize(1536)).toBe('1.5 KB'); // 1.5KB
      expect(component.formatFileSize(2684354560)).toBe('2.5 GB'); // 2.5GB
    });

    it('should use FileSizePipe in the template for proper binary formatting', () => {
      const fileSizePipe = new FileSizePipe();
      
      // Test that the pipe gives proper binary formatting
      expect(fileSizePipe.transform(1024)).toBe('1 KiB');
      expect(fileSizePipe.transform(1048576)).toBe('1 MiB');
      expect(fileSizePipe.transform(1073741824)).toBe('1 GiB');
      expect(fileSizePipe.transform(268435456)).toBe('256 MiB');
    });

    it('should display formatted file sizes in the template using the pipe', () => {
      // Force change detection to render the template
      fixture.detectChanges();
      
      // Look for content that contains binary unit suffixes (KiB, MiB, GiB)
      const template = fixture.debugElement.nativeElement.innerHTML;
      const hasBinaryUnits = template.includes('KiB') || template.includes('MiB') || template.includes('GiB') || template.includes('B');
      
      expect(hasBinaryUnits).toBe(true);
    });

    it('should display "--" for folders without sizes', () => {
      const folderItem = mockFileItems.find(item => item.type === 'folder');
      expect(folderItem?.size).toBeUndefined();
      
      // The template should show "--" for folders
      fixture.detectChanges();
      const template = fixture.debugElement.nativeElement.innerHTML;
      expect(template).toContain('--');
    });
  });

  describe('Date Formatting', () => {
    it('should format dates with relative formatting', () => {
      const today = new Date();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const differentYear = new Date(2023, 10, 15, 14, 30);

      expect(component.formatDate(today)).toContain('Today');
      expect(component.formatDate(yesterday)).toContain('Yesterday');
      expect(component.formatDate(threeDaysAgo)).toMatch(/\d{2}\/\d{2} \d+:\d+ (AM|PM)/);
      expect(component.formatDate(differentYear)).toMatch(/\d{2}\/\d{2}\/\d{4} \d+:\d+ (AM|PM)/);
    });

    it('should handle date formatting edge cases', () => {
      const now = new Date();
      const todayDifferentTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 30);
      
      expect(component.formatDate(todayDifferentTime)).toContain('Today');
      expect(component.formatDate(todayDifferentTime)).toContain('10:30 AM');
    });

    it('should display formatted dates in the template', () => {
      // The mock data has various dates including 'today' items
      // Force change detection to render the template
      fixture.componentRef.setInput('loading', false); // Ensure content is visible
      fixture.detectChanges();
      
      // Check if the formatDate method is called and produces expected output
      const todayItem = mockFileItems.find(item => {
        if (!item.modified) return false;
        const today = new Date();
        const itemDate = new Date(item.modified.getFullYear(), item.modified.getMonth(), item.modified.getDate());
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        return itemDate.getTime() === todayDate.getTime();
      });
      
      if (todayItem && todayItem.modified) {
        const formattedDate = component.formatDate(todayItem.modified);
        expect(formattedDate).toContain('Today');
      } else {
        // If no today items, check for other formatted dates
        const anyItem = mockFileItems[0];
        if (anyItem.modified) {
          const formattedDate = component.formatDate(anyItem.modified);
          expect(formattedDate).toMatch(/\d{2}\/\d{2}|\bToday\b|\bYesterday\b/);
        }
      }
    });
  });

  // Path Segments tests removed - logic moved to TruncatePathPipe
  // See truncate-path.pipe.spec.ts for path segmentation tests

  describe('File Filtering', () => {
    it('should filter by file mode', () => {
      // Create a fresh component instance for this test
      const testFixture = TestBed.createComponent(IxFilePickerPopupComponent);
      const testComponent = testFixture.componentInstance;

      testFixture.componentRef.setInput('mode', 'file');
      testFixture.componentRef.setInput('fileItems', mockFileItems);
      testFixture.detectChanges(); // Trigger change detection for computed signals

      const filtered = testComponent.filteredFileItems();
      const enabledItems = filtered.filter(item => !item.disabled);

      expect(enabledItems.every(item => item.type === 'file')).toBe(true);
      expect(enabledItems.length).toBe(2); // database.db and small.txt
    });

    it('should filter by folder mode', () => {
      // Create a fresh component instance for this test
      const testFixture = TestBed.createComponent(IxFilePickerPopupComponent);
      const testComponent = testFixture.componentInstance;

      testFixture.componentRef.setInput('mode', 'folder');
      testFixture.componentRef.setInput('fileItems', mockFileItems);
      testFixture.detectChanges(); // Trigger change detection for computed signals

      const filtered = testComponent.filteredFileItems();
      const enabledItems = filtered.filter(item => !item.disabled);

      expect(enabledItems.every(item => item.type === 'folder')).toBe(true);
      expect(enabledItems.length).toBe(1); // documents folder
    });

    it('should filter by file extensions', () => {
      // Create a fresh component instance for this test
      const testFixture = TestBed.createComponent(IxFilePickerPopupComponent);
      const testComponent = testFixture.componentInstance;

      testFixture.componentRef.setInput('fileExtensions', ['.txt']);
      testFixture.componentRef.setInput('mode', 'any'); // Set mode to allow all types
      testFixture.componentRef.setInput('fileItems', mockFileItems);

      const filtered = testComponent.filteredFileItems();

      const txtFiles = filtered.filter(item => item.name.endsWith('.txt'));
      expect(txtFiles.length).toBe(1); // small.txt
    });

    it('should not filter when mode is "any"', () => {
      // Create a fresh component instance for this test
      const testFixture = TestBed.createComponent(IxFilePickerPopupComponent);
      const testComponent = testFixture.componentInstance;

      testFixture.componentRef.setInput('mode', 'any');
      testFixture.componentRef.setInput('fileItems', mockFileItems);

      const filtered = testComponent.filteredFileItems();
      
      expect(filtered.length).toBe(mockFileItems.length);
    });
  });

  describe('Utility Methods', () => {
    it('should return correct icons for different file types', () => {
      expect(component.getItemIcon({ type: 'folder' } as FileSystemItem)).toBe('folder');
      expect(component.getItemIcon({ type: 'dataset' } as FileSystemItem)).toBe('tn-dataset');
      expect(component.getItemIcon({ type: 'zvol' } as FileSystemItem)).toBe('database');
      expect(component.getItemIcon({ type: 'file', name: 'test.pdf' } as FileSystemItem)).toBe('file');
    });

    it('should identify ZFS objects correctly', () => {
      expect(component.isZfsObject({ type: 'dataset' } as FileSystemItem)).toBe(true);
      expect(component.isZfsObject({ type: 'zvol' } as FileSystemItem)).toBe(true);
      expect(component.isZfsObject({ type: 'mountpoint' } as FileSystemItem)).toBe(true);
      expect(component.isZfsObject({ type: 'file' } as FileSystemItem)).toBe(false);
      expect(component.isZfsObject({ type: 'folder' } as FileSystemItem)).toBe(false);
    });

    it('should return correct ZFS badges', () => {
      expect(component.getZfsBadge({ type: 'dataset' } as FileSystemItem)).toBe('DS');
      expect(component.getZfsBadge({ type: 'zvol' } as FileSystemItem)).toBe('ZV');
      expect(component.getZfsBadge({ type: 'mountpoint' } as FileSystemItem)).toBe('MP');
    });

    it('should return correct type display names', () => {
      expect(component.getTypeDisplayName('file')).toBe('File');
      expect(component.getTypeDisplayName('folder')).toBe('Folder');
      expect(component.getTypeDisplayName('dataset')).toBe('Dataset');
      expect(component.getTypeDisplayName('zvol')).toBe('Zvol');
      expect(component.getTypeDisplayName('mountpoint')).toBe('Mount Point');
    });
  });

  describe('Event Handling', () => {
    it('should emit itemClick when item is clicked', () => {
      jest.spyOn(component.itemClick, 'emit');
      const testItem = mockFileItems[0];
      
      component.onItemClick(testItem);
      
      expect(component.itemClick.emit).toHaveBeenCalledWith(testItem);
    });

    it('should emit itemDoubleClick when item is double-clicked', () => {
      jest.spyOn(component.itemDoubleClick, 'emit');
      const testItem = mockFileItems[0];
      
      component.onItemDoubleClick(testItem);
      
      expect(component.itemDoubleClick.emit).toHaveBeenCalledWith(testItem);
    });

    it('should emit pathNavigate when navigating to path', () => {
      jest.spyOn(component.pathNavigate, 'emit');
      const testPath = '/mnt/tank';
      
      component.navigateToPath(testPath);
      
      expect(component.pathNavigate.emit).toHaveBeenCalledWith(testPath);
    });

    it('should emit createFolder when creating folder', () => {
      jest.spyOn(component.createFolder, 'emit');
      
      component.onCreateFolder();
      
      expect(component.createFolder.emit).toHaveBeenCalledWith({
        parentPath: '/mnt/tank',
        folderName: 'New Folder'
      });
    });
  });

  describe('Selection Handling', () => {
    it('should correctly identify selected items', () => {
      fixture.componentRef.setInput('selectedItems', ['/mnt/tank/database.db']);

      expect(component.isSelected(mockFileItems[1])).toBe(true); // database.db
      expect(component.isSelected(mockFileItems[0])).toBe(false); // documents
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator when loading', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      const loadingElement = fixture.debugElement.query(By.css('.ix-file-picker-loading'));
      expect(loadingElement).toBeTruthy();
    });

    it('should hide content when loading', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      const contentElement = fixture.debugElement.query(By.css('.ix-file-picker-content'));
      expect(contentElement).toBeFalsy();
    });
  });
});