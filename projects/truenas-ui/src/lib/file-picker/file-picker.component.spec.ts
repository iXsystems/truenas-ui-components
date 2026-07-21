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

  describe('Open On Click', () => {
    function getInput(): HTMLInputElement {
      return fixture.nativeElement.querySelector('.tn-file-picker-input') as HTMLInputElement;
    }

    function clickInput(): void {
      getInput().dispatchEvent(new MouseEvent('click'));
      fixture.detectChanges();
    }

    it('should open the popup when the input is clicked while empty', () => {
      fixture.componentRef.setInput('openOnClick', true);
      fixture.detectChanges();

      clickInput();

      expect(component.isOpen()).toBe(true);
    });

    it('should not open the popup on click when a path is already selected', () => {
      fixture.componentRef.setInput('openOnClick', true);
      fixture.detectChanges();
      component.writeValue('/mnt/tank');

      clickInput();

      expect(component.isOpen()).toBe(false);
    });

    it('should not open the popup on click by default', () => {
      fixture.detectChanges();

      clickInput();

      expect(component.isOpen()).toBe(false);
    });

    it('should not open the popup on keyboard focus, only on click', () => {
      fixture.componentRef.setInput('openOnClick', true);
      fixture.detectChanges();

      // A keyboard user tabbing through a form must not trigger the overlay —
      // the popup does not trap focus, so it would be left open behind them.
      getInput().dispatchEvent(new FocusEvent('focus'));
      fixture.detectChanges();

      expect(component.isOpen()).toBe(false);
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

    it('should reject selectPath() outside the root without browsing or applying', async () => {
      const getChildren = jest.fn().mockResolvedValue([]);
      fixture.componentRef.setInput('callbacks', { getChildren });
      fixture.componentRef.setInput('rootPath', '/mnt/backups');
      const selectionSpy = jest.fn();
      const errorSpy = jest.fn();
      component.selectionChange.subscribe(selectionSpy);
      component.error.subscribe(errorSpy);
      fixture.detectChanges();

      await component.selectPath('/home/stray');

      expect(getChildren).not.toHaveBeenCalled();
      expect(selectionSpy).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith(expect.objectContaining({
        type: 'validation',
        path: '/home/stray',
      }));
    });

    it('should clamp the browsed parent to the root on selectPath() of the root itself', async () => {
      const getChildren = jest.fn().mockResolvedValue([]);
      fixture.componentRef.setInput('callbacks', { getChildren });
      fixture.componentRef.setInput('rootPath', '/mnt/backups');
      fixture.detectChanges();

      // The root's own parent (/mnt) is outside the root — browsing clamps back
      await component.selectPath('/mnt/backups');

      expect(getChildren).toHaveBeenCalledWith('/mnt/backups');
      expect(component.selectedPath()).toBe('/mnt/backups');
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
    function getInput(): HTMLInputElement {
      return fixture.nativeElement.querySelector('.tn-file-picker-input') as HTMLInputElement;
    }

    /** Types a path and commits it, as Enter or blur does via `change`. */
    function commitPath(value: string): void {
      const inputEl = getInput();
      inputEl.value = value;
      inputEl.dispatchEvent(new Event('change'));
    }

    it('should not validate a path that is still being typed', () => {
      const errorSpy = jest.fn();
      component.error.subscribe(errorSpy);
      fixture.detectChanges();

      // Incomplete prefix of a valid path — outside the root until finished
      const inputEl = getInput();
      inputEl.value = '/m';
      inputEl.dispatchEvent(new Event('input'));

      expect(errorSpy).not.toHaveBeenCalled();
      expect(component.hasError()).toBe(false);
    });

    it('should apply a typed path within the root', () => {
      const selectionSpy = jest.fn();
      component.selectionChange.subscribe(selectionSpy);
      fixture.detectChanges();

      commitPath('/mnt/tank/music');

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

      commitPath('/etc/passwd');

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
      commitPath('/mnt/../etc/passwd');

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

      commitPath('');

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
