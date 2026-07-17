import { provideHttpClient } from '@angular/common/http';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TnFilePickerComponent } from './file-picker.component';

describe('TnFilePickerComponent', () => {
  let component: TnFilePickerComponent;
  let fixture: ComponentFixture<TnFilePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnFilePickerComponent, NoopAnimationsModule],
      providers: [provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(TnFilePickerComponent);
    component = fixture.componentInstance;
  });

  describe('Root Path Confinement', () => {
    it('should start at startPath when it is within the root', () => {
      fixture.componentRef.setInput('rootPath', '/mnt/backups');
      fixture.componentRef.setInput('startPath', '/mnt/backups/daily');
      fixture.detectChanges();

      expect(component.currentPath()).toBe('/mnt/backups/daily');
    });

    it('should clamp startPath to the root when it is outside', () => {
      fixture.componentRef.setInput('rootPath', '/mnt/backups');
      fixture.componentRef.setInput('startPath', '/home');
      fixture.detectChanges();

      expect(component.currentPath()).toBe('/mnt/backups');
    });

    it('should clamp navigation above the root back to the root', async () => {
      const getChildren = jest.fn().mockResolvedValue([]);
      fixture.componentRef.setInput('rootPath', '/mnt/backups');
      fixture.componentRef.setInput('callbacks', { getChildren });
      fixture.detectChanges();

      component.navigateToPath('/mnt');
      await fixture.whenStable();

      expect(getChildren).toHaveBeenCalledWith('/mnt/backups');
      expect(component.currentPath()).toBe('/mnt/backups');
    });
  });

  describe('Programmatic API', () => {
    it('should re-fetch the current listing on refresh()', async () => {
      const getChildren = jest.fn().mockResolvedValue([]);
      fixture.componentRef.setInput('callbacks', { getChildren });
      fixture.componentRef.setInput('startPath', '/mnt/tank');
      fixture.detectChanges();

      await component.refresh();

      expect(getChildren).toHaveBeenCalledWith('/mnt/tank');
    });

    it('should browse to the parent and apply the value on selectPath()', async () => {
      const getChildren = jest.fn().mockResolvedValue([]);
      fixture.componentRef.setInput('callbacks', { getChildren });
      const selectionSpy = jest.fn();
      component.selectionChange.subscribe(selectionSpy);
      fixture.detectChanges();

      await component.selectPath('/mnt/tank/new-dataset');

      expect(getChildren).toHaveBeenCalledWith('/mnt/tank');
      expect(component.currentPath()).toBe('/mnt/tank');
      expect(component.selectedItems()).toEqual(['/mnt/tank/new-dataset']);
      expect(component.selectedPath()).toBe('/mnt/tank/new-dataset');
      expect(selectionSpy).toHaveBeenCalledWith('/mnt/tank/new-dataset');
    });

    it('should clamp the browsed parent to the root on selectPath()', async () => {
      const getChildren = jest.fn().mockResolvedValue([]);
      fixture.componentRef.setInput('callbacks', { getChildren });
      fixture.componentRef.setInput('rootPath', '/mnt/backups');
      fixture.detectChanges();

      await component.selectPath('/home/stray');

      expect(getChildren).toHaveBeenCalledWith('/mnt/backups');
    });
  });

  describe('Current Directory Selection', () => {
    it('should submit the browsed directory on empty selection by default', () => {
      fixture.componentRef.setInput('startPath', '/mnt/tank/music');
      const selectionSpy = jest.fn();
      component.selectionChange.subscribe(selectionSpy);
      fixture.detectChanges();

      component.onSubmit();

      expect(selectionSpy).toHaveBeenCalledWith('/mnt/tank/music');
      expect(component.selectedPath()).toBe('/mnt/tank/music');
    });

    it('should ignore submit on empty selection when no directory-like type is selectable', () => {
      fixture.componentRef.setInput('mode', 'file');
      const selectionSpy = jest.fn();
      component.selectionChange.subscribe(selectionSpy);
      fixture.detectChanges();

      component.onSubmit();

      expect(selectionSpy).not.toHaveBeenCalled();
    });

    it('should submit the browsed directory when an array mode includes a directory-like type', () => {
      fixture.componentRef.setInput('mode', ['folder', 'dataset']);
      fixture.componentRef.setInput('startPath', '/mnt/tank/music');
      const selectionSpy = jest.fn();
      component.selectionChange.subscribe(selectionSpy);
      fixture.detectChanges();

      component.onSubmit();

      expect(selectionSpy).toHaveBeenCalledWith('/mnt/tank/music');
    });

    it('should submit the browsed directory as an array in multi-select mode', () => {
      fixture.componentRef.setInput('multiSelect', true);
      fixture.componentRef.setInput('startPath', '/mnt/tank/music');
      const selectionSpy = jest.fn();
      component.selectionChange.subscribe(selectionSpy);
      fixture.detectChanges();

      component.onSubmit();

      expect(selectionSpy).toHaveBeenCalledWith(['/mnt/tank/music']);
    });

    it('should prefer explicitly selected items over the browsed directory', () => {
      const selectionSpy = jest.fn();
      component.selectionChange.subscribe(selectionSpy);
      fixture.detectChanges();
      component.selectedItems.set(['/mnt/tank/file.txt']);

      component.onSubmit();

      expect(selectionSpy).toHaveBeenCalledWith('/mnt/tank/file.txt');
    });
  });

  describe('Manual Path Input', () => {
    function typePath(value: string): void {
      const inputEl = fixture.nativeElement.querySelector('.tn-file-picker-input') as HTMLInputElement;
      inputEl.value = value;
      inputEl.dispatchEvent(new Event('input'));
    }

    it('should apply a typed path within the root', () => {
      const selectionSpy = jest.fn();
      component.selectionChange.subscribe(selectionSpy);
      fixture.detectChanges();

      typePath('/mnt/tank/music');

      expect(selectionSpy).toHaveBeenCalledWith('/mnt/tank/music');
      expect(component.selectedPath()).toBe('/mnt/tank/music');
    });

    it('should reject a typed path outside the root', () => {
      fixture.componentRef.setInput('rootPath', '/mnt/backups');
      const selectionSpy = jest.fn();
      const errorSpy = jest.fn();
      component.selectionChange.subscribe(selectionSpy);
      component.error.subscribe(errorSpy);
      fixture.detectChanges();

      typePath('/etc/passwd');

      expect(selectionSpy).not.toHaveBeenCalled();
      expect(component.hasError()).toBe(true);
      expect(errorSpy).toHaveBeenCalledWith(expect.objectContaining({
        type: 'validation',
        path: '/etc/passwd',
      }));
    });

    it('should reject a typed path that escapes the root with relative segments', () => {
      const selectionSpy = jest.fn();
      const errorSpy = jest.fn();
      component.selectionChange.subscribe(selectionSpy);
      component.error.subscribe(errorSpy);
      fixture.detectChanges();

      // Starts with the root prefix, but resolves outside of it
      typePath('/mnt/../etc/passwd');

      expect(selectionSpy).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith(expect.objectContaining({
        type: 'validation',
        path: '/mnt/../etc/passwd',
      }));
    });

    it('should clear the selection when the input is cleared', () => {
      const selectionSpy = jest.fn();
      component.selectionChange.subscribe(selectionSpy);
      fixture.detectChanges();
      component.selectedItems.set(['/mnt/tank/file.txt']);

      typePath('');

      expect(selectionSpy).toHaveBeenCalledWith('');
      expect(component.selectedItems()).toEqual([]);
      expect(component.hasError()).toBe(false);
    });
  });

  describe('Pending Selection Across Navigation', () => {
    it('should drop a pending single-select selection when browsing to another directory', async () => {
      const getChildren = jest.fn().mockResolvedValue([]);
      fixture.componentRef.setInput('callbacks', { getChildren });
      fixture.detectChanges();
      component.selectedItems.set(['/mnt/tank/file.txt']);

      component.navigateToPath('/mnt/other');
      await fixture.whenStable();

      expect(component.selectedItems()).toEqual([]);
    });

    it('should keep a pending multi-select selection when browsing to another directory', async () => {
      const getChildren = jest.fn().mockResolvedValue([]);
      fixture.componentRef.setInput('callbacks', { getChildren });
      fixture.componentRef.setInput('multiSelect', true);
      fixture.detectChanges();
      component.selectedItems.set(['/mnt/tank/a.txt', '/mnt/tank/b.txt']);

      component.navigateToPath('/mnt/other');
      await fixture.whenStable();

      expect(component.selectedItems()).toEqual(['/mnt/tank/a.txt', '/mnt/tank/b.txt']);
    });

    it('should keep the pending selection on refresh()', async () => {
      const getChildren = jest.fn().mockResolvedValue([]);
      fixture.componentRef.setInput('callbacks', { getChildren });
      fixture.componentRef.setInput('startPath', '/mnt/tank');
      fixture.detectChanges();
      component.selectedItems.set(['/mnt/tank/file.txt']);

      await component.refresh();

      expect(component.selectedItems()).toEqual(['/mnt/tank/file.txt']);
    });
  });

  describe('Double-Click Submission', () => {
    it('should submit the double-clicked item in single-select', () => {
      const selectionSpy = jest.fn();
      component.selectionChange.subscribe(selectionSpy);
      fixture.detectChanges();

      component.onItemDoubleClick({ path: '/mnt/tank/c.txt', name: 'c.txt', type: 'file' });

      expect(selectionSpy).toHaveBeenCalledWith('/mnt/tank/c.txt');
    });

    it('should not submit or replace the selection on double-click in multi-select', () => {
      fixture.componentRef.setInput('multiSelect', true);
      const selectionSpy = jest.fn();
      component.selectionChange.subscribe(selectionSpy);
      fixture.detectChanges();
      component.selectedItems.set(['/mnt/tank/a.txt', '/mnt/tank/b.txt']);

      component.onItemDoubleClick({ path: '/mnt/tank/c.txt', name: 'c.txt', type: 'file' });

      expect(component.selectedItems()).toEqual(['/mnt/tank/a.txt', '/mnt/tank/b.txt']);
      expect(selectionSpy).not.toHaveBeenCalled();
    });
  });

  describe('Root Path Normalization', () => {
    it('should treat a rootPath with a trailing slash as its normalized form', async () => {
      const getChildren = jest.fn().mockResolvedValue([]);
      fixture.componentRef.setInput('rootPath', '/mnt/backups/');
      fixture.componentRef.setInput('startPath', '/mnt/backups/daily');
      fixture.componentRef.setInput('callbacks', { getChildren });
      fixture.detectChanges();

      // Without normalization the startPath would be clamped to the literal
      // '/mnt/backups/' root, which navigation can never produce
      expect(component.effectiveRootPath()).toBe('/mnt/backups');
      expect(component.currentPath()).toBe('/mnt/backups/daily');

      component.navigateToPath('/mnt');
      await fixture.whenStable();

      expect(getChildren).toHaveBeenCalledWith('/mnt/backups');
    });
  });
});
