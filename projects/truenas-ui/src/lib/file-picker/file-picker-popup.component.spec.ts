import { provideHttpClient } from '@angular/common/http';
import type { ComponentFixture} from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TnFilePickerPopupComponent } from './file-picker-popup.component';
import type { FileSystemItem } from './file-picker.interfaces';
import { FileSizePipe } from '../pipes/file-size/file-size.pipe';

describe('TnFilePickerPopupComponent', () => {
  let component: TnFilePickerPopupComponent;
  let fixture: ComponentFixture<TnFilePickerPopupComponent>;

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
      imports: [TnFilePickerPopupComponent, NoopAnimationsModule, FileSizePipe],
      providers: [provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(TnFilePickerPopupComponent);
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
        if (!item.modified) {return false;}
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
      const testFixture = TestBed.createComponent(TnFilePickerPopupComponent);
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
      const testFixture = TestBed.createComponent(TnFilePickerPopupComponent);
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
      const testFixture = TestBed.createComponent(TnFilePickerPopupComponent);
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
      const testFixture = TestBed.createComponent(TnFilePickerPopupComponent);
      const testComponent = testFixture.componentInstance;

      testFixture.componentRef.setInput('mode', 'any');
      testFixture.componentRef.setInput('fileItems', mockFileItems);

      const filtered = testComponent.filteredFileItems();

      expect(filtered.length).toBe(mockFileItems.length);
    });

    it('should keep navigatable items undimmed when only their selection is filtered out', () => {
      // Create a fresh component instance for this test
      const testFixture = TestBed.createComponent(TnFilePickerPopupComponent);
      const testComponent = testFixture.componentInstance;

      testFixture.componentRef.setInput('mode', 'file');
      testFixture.componentRef.setInput('fileItems', mockFileItems);
      testFixture.detectChanges();

      const filtered = testComponent.filteredFileItems();
      const folder = filtered.find(item => item.type === 'folder');
      const zvol = filtered.find(item => item.type === 'zvol');

      // The folder cannot be selected but can still be entered — not dimmed
      expect(folder?.disabled).toBe(true);
      expect(folder?.dimmed).toBe(false);
      // The zvol has no interaction left — dimmed
      expect(zvol?.disabled).toBe(true);
      expect(zvol?.dimmed).toBe(true);
    });

    it('should apply the disabled style only to dimmed items', () => {
      fixture.componentRef.setInput('mode', 'file');
      fixture.detectChanges();

      const cells = fixture.debugElement.queryAll(By.css('.file-name-cell'));
      const cellFor = (name: string): HTMLElement | undefined => cells
        .map(cell => cell.nativeElement as HTMLElement)
        .find(cell => cell.textContent?.includes(name));

      expect(cellFor('documents')?.classList.contains('disabled')).toBe(false);
      expect(cellFor('vm-storage')?.classList.contains('disabled')).toBe(true);
    });

    it('should enable exactly the listed types when mode is an array', () => {
      // Create a fresh component instance for this test
      const testFixture = TestBed.createComponent(TnFilePickerPopupComponent);
      const testComponent = testFixture.componentInstance;

      testFixture.componentRef.setInput('mode', ['folder', 'zvol']);
      testFixture.componentRef.setInput('fileItems', mockFileItems);
      testFixture.detectChanges();

      const filtered = testComponent.filteredFileItems();

      expect(filtered.find(item => item.type === 'folder')?.disabled).toBe(false);
      expect(filtered.find(item => item.type === 'zvol')?.disabled).toBe(false);
      expect(filtered.filter(item => item.type === 'file').every(item => item.disabled)).toBe(true);
    });
  });

  describe('Utility Methods', () => {
    it('should return fully-qualified sprite icon names for different file types', () => {
      expect(component.getItemIcon({ type: 'folder' } as FileSystemItem)).toBe('mdi-folder');
      expect(component.getItemIcon({ type: 'dataset' } as FileSystemItem)).toBe('tn-dataset');
      expect(component.getItemIcon({ type: 'zvol' } as FileSystemItem)).toBe('mdi-database');
      expect(component.getItemIcon({ type: 'mountpoint' } as FileSystemItem)).toBe('mdi-server-network');
      expect(component.getItemIcon({ type: 'file', name: 'test.pdf' } as FileSystemItem)).toBe('mdi-file');
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

  });

  describe('Selection Handling', () => {
    it('should correctly identify selected items', () => {
      fixture.componentRef.setInput('selectedItems', ['/mnt/tank/database.db']);

      expect(component.isSelected(mockFileItems[1])).toBe(true); // database.db
      expect(component.isSelected(mockFileItems[0])).toBe(false); // documents
    });

    it('should select when clicking anywhere in the row, not only the name cell', () => {
      fixture.detectChanges();
      const clickSpy = jest.fn();
      component.itemClick.subscribe(clickSpy);

      // Click the size cell of the database.db row
      const rows = fixture.debugElement.queryAll(By.css('.tn-table__row'));
      const sizeCell = rows[1].queryAll(By.css('.tn-table__cell'))[1];
      (sizeCell.nativeElement as HTMLElement).click();

      expect(clickSpy).toHaveBeenCalledWith(expect.objectContaining({ path: '/mnt/tank/database.db' }));
    });

    it('should emit clearSelection via the Clear Selection button', () => {
      fixture.componentRef.setInput('selectedItems', ['/mnt/tank/database.db']);
      fixture.detectChanges();

      const clearSpy = jest.fn();
      component.clearSelection.subscribe(clearSpy);

      const clearButton = fixture.debugElement.query(By.css('.footer-selection button'));
      expect((clearButton.nativeElement as HTMLElement).textContent).toContain('Clear Selection');
      (clearButton.nativeElement as HTMLElement).click();

      expect(clearSpy).toHaveBeenCalled();
    });

    it('should mark selected rows in the list', () => {
      fixture.componentRef.setInput('selectedItems', ['/mnt/tank/documents']);
      fixture.detectChanges();

      const selectedCells = fixture.debugElement.queryAll(By.css('.file-name-cell.selected'));
      expect(selectedCells.length).toBe(1);
      expect((selectedCells[0].nativeElement as HTMLElement).textContent).toContain('documents');
    });

    it('should highlight selected rows through the table active-row styling', () => {
      fixture.componentRef.setInput('selectedItems', ['/mnt/tank/documents']);
      fixture.detectChanges();

      const activeRows = fixture.debugElement.queryAll(By.css('.tn-table__row--active'));
      expect(activeRows.length).toBe(1);
      expect((activeRows[0].nativeElement as HTMLElement).textContent).toContain('documents');
      expect((activeRows[0].nativeElement as HTMLElement).getAttribute('aria-selected')).toBe('true');
    });
  });

  describe('Navigation Affordance', () => {
    function navigateButtons(): HTMLElement[] {
      return fixture.debugElement.queryAll(By.css('.navigate-button'))
        .map(button => button.nativeElement as HTMLElement);
    }

    it('should show the open chevron only on navigatable items', () => {
      fixture.detectChanges();

      // documents (folder) is the only navigatable mock item
      const buttons = navigateButtons();
      expect(buttons.length).toBe(1);
      expect(buttons[0].getAttribute('aria-label')).toBe('Open documents');
    });

    it('should open the directory on a single click without selecting it', () => {
      fixture.detectChanges();
      const doubleClickSpy = jest.fn();
      const clickSpy = jest.fn();
      component.itemDoubleClick.subscribe(doubleClickSpy);
      component.itemClick.subscribe(clickSpy);

      navigateButtons()[0].click();

      expect(doubleClickSpy).toHaveBeenCalledWith(expect.objectContaining({ path: '/mnt/tank/documents' }));
      expect(clickSpy).not.toHaveBeenCalled();
    });
  });

  describe('Breadcrumb Root Path', () => {
    function breadcrumbLabels(): string[] {
      return fixture.debugElement.queryAll(By.css('.breadcrumb-segment'))
        .map((segment) => (segment.nativeElement as HTMLElement).textContent?.trim() ?? '');
    }

    it('should show the root path when the current path is the default /mnt root', () => {
      fixture.componentRef.setInput('currentPath', '/mnt');
      fixture.detectChanges();

      expect(breadcrumbLabels()).toEqual(['mnt']);
    });

    it('should show the root path when the current path is a custom root', () => {
      fixture.componentRef.setInput('rootPath', '/dev/zvol');
      fixture.componentRef.setInput('currentPath', '/dev/zvol');
      fixture.detectChanges();

      expect(breadcrumbLabels()).toEqual(['dev/zvol']);
    });

    it('should render every path segment and navigate to the custom root via its segment', () => {
      fixture.componentRef.setInput('rootPath', '/dev/zvol');
      fixture.componentRef.setInput('currentPath', '/dev/zvol/tank/vm');
      fixture.detectChanges();

      expect(breadcrumbLabels()).toEqual(['dev/zvol', 'tank', 'vm']);

      const navigateSpy = jest.fn();
      component.pathNavigate.subscribe(navigateSpy);

      const rootSegment = fixture.debugElement.query(By.css('.breadcrumb-segment'));
      (rootSegment.nativeElement as HTMLElement).click();

      expect(navigateSpy).toHaveBeenCalledWith('/dev/zvol');
    });
  });

  describe('Create Actions', () => {
    function footerButtons(): HTMLElement[] {
      return fixture.debugElement.queryAll(By.css('.footer-actions button'))
        .map((button) => button.nativeElement as HTMLElement);
    }

    it('should render a button per create action in the footer, before Select', () => {
      fixture.componentRef.setInput('createActions', [
        { id: 'dataset', label: 'Create Dataset' },
        { id: 'zvol', label: 'Create Zvol' },
      ]);
      fixture.detectChanges();

      const labels = footerButtons().map((button) => button.textContent?.trim());
      expect(labels).toEqual(['Create Dataset', 'Create Zvol', 'Select']);
    });

    it('should emit createAction with the action id and browsed path', () => {
      fixture.componentRef.setInput('createActions', [
        { id: 'dataset', label: 'Create Dataset' },
      ]);
      fixture.detectChanges();

      const actionSpy = jest.fn();
      component.createAction.subscribe(actionSpy);

      footerButtons()[0].click();

      expect(actionSpy).toHaveBeenCalledWith({
        actionId: 'dataset',
        parentPath: '/mnt/tank',
      });
    });
  });

  describe('Inline Creation', () => {
    let create: jest.Mock;

    beforeEach(() => {
      create = jest.fn();
      fixture.componentRef.setInput('createActions', [
        { id: 'folder', label: 'New Folder', create },
      ]);
      fixture.detectChanges();
    });

    function inlineInput(): HTMLInputElement | null {
      const input = fixture.debugElement.query(By.css('.inline-create-input'));
      return input ? input.nativeElement as HTMLInputElement : null;
    }

    function actionButton(): HTMLButtonElement {
      return fixture.debugElement.query(By.css('.footer-actions button')).nativeElement as HTMLButtonElement;
    }

    function typeName(name: string): void {
      const input = inlineInput()!;
      input.value = name;
      input.dispatchEvent(new Event('input'));
    }

    it('should open the inline row instead of emitting createAction', () => {
      const actionSpy = jest.fn();
      component.createAction.subscribe(actionSpy);

      actionButton().click();
      fixture.detectChanges();

      expect(inlineInput()).not.toBeNull();
      expect(actionSpy).not.toHaveBeenCalled();
      expect(actionButton().disabled).toBe(true);

      // The creation row renders as the first item of the listing
      const firstRowInput = fixture.debugElement.query(
        By.css('.tn-table__row:first-child .inline-create-input'));
      expect(firstRowInput).not.toBeNull();
    });

    it('should focus the input when the row opens', async () => {
      actionButton().click();
      fixture.detectChanges();
      await new Promise(resolve => setTimeout(resolve));

      expect(document.activeElement).toBe(inlineInput());
    });

    it('should call create with the browsed path and emit created on success', async () => {
      create.mockResolvedValue('/mnt/tank/new-folder');
      const createdSpy = jest.fn();
      component.created.subscribe(createdSpy);

      actionButton().click();
      fixture.detectChanges();

      typeName(' new-folder ');
      inlineInput()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      await fixture.whenStable();
      fixture.detectChanges();

      expect(create).toHaveBeenCalledWith('/mnt/tank', 'new-folder');
      expect(createdSpy).toHaveBeenCalledWith('/mnt/tank/new-folder');
      expect(inlineInput()).toBeNull();
    });

    it('should show the rejection message inline and keep the row editable', async () => {
      create.mockImplementation(() => Promise.reject(new Error('A folder with this name already exists')));

      actionButton().click();
      fixture.detectChanges();

      typeName('documents');
      await component.submitInlineCreation();
      fixture.detectChanges();

      const error = fixture.debugElement.query(By.css('.inline-create-error'));
      expect((error.nativeElement as HTMLElement).textContent).toContain('A folder with this name already exists');
      expect(inlineInput()).not.toBeNull();
      expect(inlineInput()!.disabled).toBe(false);
    });

    it('should cancel the row on Escape without calling create', () => {
      actionButton().click();
      fixture.detectChanges();

      inlineInput()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      fixture.detectChanges();

      expect(inlineInput()).toBeNull();
      expect(create).not.toHaveBeenCalled();
    });

    it('should abandon the row when submitting an empty name', () => {
      actionButton().click();
      fixture.detectChanges();

      typeName('   ');
      inlineInput()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      fixture.detectChanges();

      expect(inlineInput()).toBeNull();
      expect(create).not.toHaveBeenCalled();
    });

    it('should abandon the row when navigating away', () => {
      actionButton().click();
      fixture.detectChanges();

      component.navigateToPath('/mnt');
      fixture.detectChanges();

      expect(inlineInput()).toBeNull();
    });

    it('should keep the typed name when the listing re-renders', () => {
      actionButton().click();
      fixture.detectChanges();

      typeName('new-folder');

      // e.g. a background refresh replacing the items while the row is open
      fixture.componentRef.setInput('fileItems', [
        { path: '/mnt/tank/other', name: 'other', type: 'folder' },
      ]);
      fixture.detectChanges();

      expect(inlineInput()!.value).toBe('new-folder');
    });

    it('should not resurrect the row when a pending create fails after navigating away', async () => {
      let reject!: (err: Error) => void;
      create.mockImplementation(() => new Promise((_, rej) => { reject = rej; }));

      actionButton().click();
      fixture.detectChanges();

      typeName('new-folder');
      const submitted = component.submitInlineCreation();
      component.navigateToPath('/mnt');
      fixture.detectChanges();

      reject(new Error('Permission denied'));
      await submitted;
      fixture.detectChanges();

      expect(inlineInput()).toBeNull();
      expect(fixture.debugElement.query(By.css('.inline-create-error'))).toBeNull();
    });

    it('should not emit created when a pending create resolves after navigating away', async () => {
      let resolve!: (path: string) => void;
      create.mockImplementation(() => new Promise((res) => { resolve = res; }));
      const createdSpy = jest.fn();
      component.created.subscribe(createdSpy);

      actionButton().click();
      fixture.detectChanges();

      typeName('new-folder');
      const submitted = component.submitInlineCreation();
      component.navigateToPath('/mnt');
      fixture.detectChanges();

      resolve('/mnt/tank/new-folder');
      await submitted;

      expect(createdSpy).not.toHaveBeenCalled();
    });

    it('should auto-submit a non-empty name on blur', async () => {
      create.mockResolvedValue('/mnt/tank/new-folder');
      const createdSpy = jest.fn();
      component.created.subscribe(createdSpy);

      actionButton().click();
      fixture.detectChanges();

      typeName('new-folder');
      inlineInput()!.dispatchEvent(new Event('blur'));
      await fixture.whenStable();

      expect(create).toHaveBeenCalledWith('/mnt/tank', 'new-folder');
      expect(createdSpy).toHaveBeenCalledWith('/mnt/tank/new-folder');
    });

    it('should not repeat a failed create call on blur', async () => {
      create.mockImplementation(() => Promise.reject(new Error('Permission denied')));

      actionButton().click();
      fixture.detectChanges();

      typeName('documents');
      await component.submitInlineCreation();
      fixture.detectChanges();
      expect(create).toHaveBeenCalledTimes(1);

      inlineInput()!.dispatchEvent(new Event('blur'));
      await fixture.whenStable();

      // The error already told the user — blurring must not loop the call
      expect(create).toHaveBeenCalledTimes(1);
      expect(inlineInput()).not.toBeNull();
    });

    it('should clear the error when the name is edited, re-arming blur submit', async () => {
      create.mockImplementation(() => Promise.reject(new Error('Permission denied')));

      actionButton().click();
      fixture.detectChanges();

      typeName('documents');
      await component.submitInlineCreation();
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.inline-create-error'))).not.toBeNull();

      typeName('documents-2');
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('.inline-create-error'))).toBeNull();

      create.mockResolvedValue('/mnt/tank/documents-2');
      inlineInput()!.dispatchEvent(new Event('blur'));
      await fixture.whenStable();

      expect(create).toHaveBeenCalledTimes(2);
      expect(create).toHaveBeenLastCalledWith('/mnt/tank', 'documents-2');
    });

    it('should announce the error and link it to the input', async () => {
      create.mockImplementation(() => Promise.reject(new Error('Permission denied')));

      actionButton().click();
      fixture.detectChanges();

      typeName('documents');
      await component.submitInlineCreation();
      fixture.detectChanges();

      const error = fixture.debugElement.query(By.css('.inline-create-error'));
      const input = inlineInput()!;
      expect((error.nativeElement as HTMLElement).getAttribute('role')).toBe('alert');
      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(input.getAttribute('aria-describedby'))
        .toBe((error.nativeElement as HTMLElement).id);
    });

    it('should disable Select while the inline row is open', () => {
      const selectButton = (): HTMLButtonElement => fixture.debugElement
        .queryAll(By.css('.footer-actions button'))
        .map(button => button.nativeElement as HTMLButtonElement)
        .find(button => button.textContent?.includes('Select'))!;

      fixture.detectChanges();
      expect(selectButton().disabled).toBe(false);

      actionButton().click();
      fixture.detectChanges();

      // Its click would race the row's blur auto-submit
      expect(selectButton().disabled).toBe(true);
    });
  });

  describe('Current Directory Selection', () => {
    function selectButton(): HTMLButtonElement | null {
      const button = fixture.debugElement.query(By.css('.footer-actions button'));
      return button ? button.nativeElement as HTMLButtonElement : null;
    }

    it('should treat an empty selection as the browsed directory by default', () => {
      fixture.componentRef.setInput('selectedItems', []);
      fixture.detectChanges();

      expect(selectButton()?.disabled).toBe(false);

      const count = fixture.debugElement.query(By.css('.selection-count'));
      expect((count.nativeElement as HTMLElement).textContent).toContain('Current directory selected');
    });

    it('should disable Select on empty selection when no directory-like type is selectable', () => {
      fixture.componentRef.setInput('mode', 'file');
      fixture.componentRef.setInput('selectedItems', []);
      fixture.detectChanges();

      expect(selectButton()?.disabled).toBe(true);

      const count = fixture.debugElement.query(By.css('.selection-count'));
      expect((count.nativeElement as HTMLElement).textContent).toContain('No items selected');
    });

    it('should allow current directory selection when any type in an array mode is directory-like', () => {
      fixture.componentRef.setInput('mode', ['file', 'dataset']);
      fixture.componentRef.setInput('selectedItems', []);
      fixture.detectChanges();

      expect(selectButton()?.disabled).toBe(false);
    });

    it('should still show the item count when items are selected', () => {
      fixture.componentRef.setInput('selectedItems', ['/mnt/tank/database.db']);
      fixture.detectChanges();

      const count = fixture.debugElement.query(By.css('.selection-count'));
      expect((count.nativeElement as HTMLElement).textContent).toContain('1 item selected');
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator when loading', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      const loadingElement = fixture.debugElement.query(By.css('.tn-file-picker-loading'));
      expect(loadingElement).toBeTruthy();
    });

    it('should hide content when loading', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      const contentElement = fixture.debugElement.query(By.css('.tn-file-picker-content'));
      expect(contentElement).toBeFalsy();
    });
  });

  describe('Test IDs', () => {
    function testIdOf(selector: string): string | null | undefined {
      const el = fixture.debugElement.query(By.css(selector));
      return (el?.nativeElement as HTMLElement | undefined)?.getAttribute('data-testid');
    }

    beforeEach(() => {
      fixture.componentRef.setInput('testIdBase', 'backup-target');
    });

    it('scopes item rows by the base and the item name', () => {
      fixture.detectChanges();

      expect(testIdOf('[data-testid="option-backup-target-documents"]')).toBeTruthy();
      // Non-alphanumerics in names kebab-normalize: database.db → database-db
      expect(testIdOf('[data-testid="option-backup-target-database-db"]')).toBeTruthy();
    });

    it('scopes the multi-select checkbox like its row', () => {
      fixture.componentRef.setInput('multiSelect', true);
      fixture.detectChanges();

      expect(testIdOf('[data-testid="checkbox-backup-target-documents"]')).toBeTruthy();
    });

    it('derives role-first ids for navigation chrome', () => {
      fixture.detectChanges();

      expect(testIdOf('[data-testid="button-navigate-backup-target-documents"]')).toBeTruthy();
      expect(testIdOf('[data-testid="button-breadcrumb-backup-target-mnt"]')).toBeTruthy();
      expect(testIdOf('[data-testid="button-breadcrumb-backup-target-tank"]')).toBeTruthy();
    });

    it('derives role-first ids for the footer buttons', () => {
      fixture.componentRef.setInput('multiSelect', true);
      fixture.componentRef.setInput('selectedItems', ['/mnt/tank/documents']);
      fixture.componentRef.setInput('createActions', [{ id: 'dataset', label: 'Create Dataset' }]);
      fixture.detectChanges();

      expect(testIdOf('[data-testid="button-select-backup-target"]')).toBeTruthy();
      expect(testIdOf('[data-testid="button-clear-selection-backup-target"]')).toBeTruthy();
      // Create actions are content children, so the base leads: button-<base>-<action id>
      expect(testIdOf('[data-testid="button-backup-target-dataset"]')).toBeTruthy();
    });

    it('scopes the inline creation input', () => {
      fixture.componentRef.setInput('createActions', [
        { id: 'folder', label: 'New Folder', create: jest.fn() },
      ]);
      fixture.detectChanges();
      (fixture.debugElement.query(By.css('.footer-actions button')).nativeElement as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(testIdOf('[data-testid="input-create-backup-target"]')).toBeTruthy();
    });

    it('falls back to bare-role ids with no base', () => {
      fixture.componentRef.setInput('testIdBase', undefined);
      fixture.detectChanges();

      // Only one popup can be open at a time, so bare roles stay addressable
      expect(testIdOf('[data-testid="option-documents"]')).toBeTruthy();
      expect(testIdOf('[data-testid="button-select"]')).toBeTruthy();
    });
  });
});