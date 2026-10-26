import { Component, ChangeDetectionStrategy } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TnFilePickerComponent } from './file-picker.component';
import type { FileSystemItem } from './file-picker.interfaces';

describe('TnFilePickerComponent', () => {
  let component: TnFilePickerComponent;
  let fixture: ComponentFixture<TnFilePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnFilePickerComponent, NoopAnimationsModule]
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

  describe('Value Root', () => {
    function getInput(): HTMLInputElement {
      return fixture.nativeElement.querySelector('.tn-file-picker-input') as HTMLInputElement;
    }

    it('shows and emits value-space paths while selection state stays absolute', () => {
      fixture.componentRef.setInput('valueRoot', '/mnt');
      fixture.componentRef.setInput('multiSelect', true);
      fixture.detectChanges();

      component.writeValue(['tank/foo', 'tank/bar']);
      fixture.detectChanges();

      expect(component.selectedItems()).toEqual(['/mnt/tank/foo', '/mnt/tank/bar']);
      expect(getInput().value).toBe('tank/foo, tank/bar');

      const changeSpy = jest.fn();
      component.registerOnChange(changeSpy);
      component.onSubmit();

      expect(changeSpy).toHaveBeenCalledWith(['tank/foo', 'tank/bar']);
    });

    it('interprets typed paths in value space', () => {
      fixture.componentRef.setInput('valueRoot', '/mnt');
      fixture.detectChanges();
      const changeSpy = jest.fn();
      component.registerOnChange(changeSpy);

      const input = getInput();
      input.value = 'tank/child';
      input.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      expect(component.selectedItems()).toEqual(['/mnt/tank/child']);
      expect(getInput().value).toBe('tank/child');
      expect(changeSpy).toHaveBeenCalledWith('tank/child');
    });

    it('maps a / value root by stripping the leading slash', () => {
      fixture.componentRef.setInput('valueRoot', '/');
      fixture.componentRef.setInput('rootPath', '/');
      fixture.detectChanges();

      component.writeValue('dozer/foo');
      fixture.detectChanges();

      expect(component.selectedItems()).toEqual(['/dozer/foo']);
      expect(getInput().value).toBe('dozer/foo');
    });

    it('passes paths outside the value root through untouched', () => {
      fixture.componentRef.setInput('valueRoot', '/mnt');
      fixture.componentRef.setInput('rootPath', '/');
      fixture.detectChanges();
      const changeSpy = jest.fn();
      component.registerOnChange(changeSpy);

      const input = getInput();
      input.value = '/dev/zvol/tank';
      input.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      expect(component.selectedItems()).toEqual(['/dev/zvol/tank']);
      expect(getInput().value).toBe('/dev/zvol/tank');
      expect(changeSpy).toHaveBeenCalledWith('/dev/zvol/tank');
    });

    it('submits the value root itself as an empty value, same as a cleared selection', () => {
      // Documented collision: the value root is the container values are named
      // against, not a selectable value — submitting it is indistinguishable
      // from clearing, and writeValue('') cannot restore it.
      fixture.componentRef.setInput('valueRoot', '/mnt');
      fixture.componentRef.setInput('startPath', '/mnt');
      fixture.detectChanges();
      const selectionSpy = jest.fn();
      component.selectionChange.subscribe(selectionSpy);

      component.onSubmit();

      expect(selectionSpy).toHaveBeenCalledWith('');
      expect(getInput().value).toBe('');
    });

    it('canonicalizes an absolute written value into value space, keeping the display stable across submit', () => {
      fixture.componentRef.setInput('valueRoot', '/mnt');
      fixture.detectChanges();

      component.writeValue('/mnt/tank');
      fixture.detectChanges();

      expect(component.selectedItems()).toEqual(['/mnt/tank']);
      expect(getInput().value).toBe('tank');

      const changeSpy = jest.fn();
      component.registerOnChange(changeSpy);
      component.onSubmit();
      fixture.detectChanges();

      // The field shows the same text before and after submitting
      expect(changeSpy).toHaveBeenCalledWith('tank');
      expect(getInput().value).toBe('tank');
    });

    it('canonicalizes mixed written values in multi-select, passing outside-root paths through', () => {
      fixture.componentRef.setInput('valueRoot', '/mnt');
      fixture.componentRef.setInput('multiSelect', true);
      fixture.detectChanges();

      component.writeValue(['/mnt/tank/foo', 'tank/bar', '/dev/zvol/vol1']);
      fixture.detectChanges();

      expect(component.selectedItems()).toEqual(['/mnt/tank/foo', '/mnt/tank/bar', '/dev/zvol/vol1']);
      expect(getInput().value).toBe('tank/foo, tank/bar, /dev/zvol/vol1');
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

  describe('Free Text Input', () => {
    function getInput(): HTMLInputElement {
      return fixture.nativeElement.querySelector('.tn-file-picker-input') as HTMLInputElement;
    }

    function commitText(value: string): void {
      const inputEl = getInput();
      inputEl.value = value;
      inputEl.dispatchEvent(new Event('change'));
    }

    beforeEach(() => {
      fixture.componentRef.setInput('allowFreeText', true);
    });

    it('commits a non-path value verbatim, skipping root and validatePath checks', () => {
      const validatePath = jest.fn().mockResolvedValue(false);
      fixture.componentRef.setInput('rootPath', '/mnt/backups');
      fixture.componentRef.setInput('callbacks', { validatePath });
      const changeSpy = jest.fn();
      const errorSpy = jest.fn();
      component.registerOnChange(changeSpy);
      component.error.subscribe(errorSpy);
      fixture.detectChanges();

      commitText('EXTERNAL:192.168.0.200\\SHARE');

      expect(changeSpy).toHaveBeenCalledWith('EXTERNAL:192.168.0.200\\SHARE');
      expect(component.selectedPath()).toBe('EXTERNAL:192.168.0.200\\SHARE');
      expect(validatePath).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();
      expect(component.hasError()).toBe(false);
    });

    it('does not map typed values through valueRoot', () => {
      fixture.componentRef.setInput('valueRoot', '/mnt');
      const changeSpy = jest.fn();
      component.registerOnChange(changeSpy);
      fixture.detectChanges();

      commitText('/mnt/tank/apps');
      expect(changeSpy).toHaveBeenLastCalledWith('/mnt/tank/apps');

      commitText('tank/apps');
      expect(changeSpy).toHaveBeenLastCalledWith('tank/apps');
    });

    it('splits multi-select text on commas, trimming and dropping empty entries', () => {
      fixture.componentRef.setInput('multiSelect', true);
      const selectionSpy = jest.fn();
      component.selectionChange.subscribe(selectionSpy);
      fixture.detectChanges();

      commitText(' /mnt/tank/a ,, pool/dataset,  ');

      expect(selectionSpy).toHaveBeenCalledWith(['/mnt/tank/a', 'pool/dataset']);
      expect(component.selectedPath()).toBe('/mnt/tank/a, pool/dataset');
    });

    it('closes the popup on commit', () => {
      fixture.detectChanges();
      component.openFilePicker();
      expect(component.isOpen()).toBe(true);

      commitText('/mnt/tank');

      expect(component.isOpen()).toBe(false);
    });

    it('clears the value when the text is cleared', () => {
      fixture.componentRef.setInput('multiSelect', true);
      const changeSpy = jest.fn();
      component.registerOnChange(changeSpy);
      fixture.detectChanges();
      component.writeValue(['/mnt/a']);

      commitText('');

      expect(changeSpy).toHaveBeenCalledWith([]);
      expect(component.selectedItems()).toEqual([]);
    });

    it('clears the value when a single-mode field holds only whitespace', () => {
      const changeSpy = jest.fn();
      component.registerOnChange(changeSpy);
      fixture.detectChanges();
      component.writeValue('/mnt/a');

      commitText('   ');

      expect(changeSpy).toHaveBeenCalledWith('');
      expect(component.selectedItems()).toEqual([]);
      expect(component.selectedPath()).toBe('');
    });

    it('keeps single-mode surrounding whitespace in the value but not in the selection state', () => {
      const changeSpy = jest.fn();
      component.registerOnChange(changeSpy);
      fixture.detectChanges();

      commitText('/mnt/tank/a ');

      expect(changeSpy).toHaveBeenCalledWith('/mnt/tank/a ');
      expect(component.selectedItems()).toEqual(['/mnt/tank/a']);
    });

    it('has no effect when manual input is disallowed', () => {
      fixture.componentRef.setInput('allowManualInput', false);
      const changeSpy = jest.fn();
      component.registerOnChange(changeSpy);
      fixture.detectChanges();

      commitText('anything');

      expect(changeSpy).not.toHaveBeenCalled();
    });
  });

  describe('Item Selection', () => {
    const items: FileSystemItem[] = [
      { path: '/mnt/tank/notes.txt', name: 'notes.txt', type: 'file' },
      { path: '/mnt/tank/media', name: 'media', type: 'dataset' },
    ];

    async function listTank(): Promise<void> {
      fixture.componentRef.setInput('callbacks', { getChildren: jest.fn().mockResolvedValue(items) });
      fixture.detectChanges();
      component.navigateToPath('/mnt/tank');
      await fixture.whenStable();
    }

    it('emits the listed item behind a popup selection', async () => {
      const spy = jest.fn();
      component.itemSelectionChange.subscribe(spy);
      await listTank();

      component.onItemClick(items[0]);
      component.onSubmit();

      expect(spy).toHaveBeenCalledWith({ value: '/mnt/tank/notes.txt', items: [items[0]] });
    });

    it('keeps items picked in another directory in multi-select', async () => {
      fixture.componentRef.setInput('multiSelect', true);
      const spy = jest.fn();
      component.itemSelectionChange.subscribe(spy);
      await listTank();
      component.onItemClick(items[0]);
      component.onItemClick(items[1]);

      component.navigateToPath('/mnt');
      await fixture.whenStable();
      component.onSubmit();

      expect(spy).toHaveBeenCalledWith({
        value: ['/mnt/tank/notes.txt', '/mnt/tank/media'],
        items: [items[0], items[1]],
      });
    });

    it('resolves a typed value to its item when listed, null otherwise', async () => {
      fixture.componentRef.setInput('allowFreeText', true);
      fixture.componentRef.setInput('multiSelect', true);
      const spy = jest.fn();
      component.itemSelectionChange.subscribe(spy);
      await listTank();

      const inputEl = fixture.nativeElement.querySelector('.tn-file-picker-input') as HTMLInputElement;
      inputEl.value = '/mnt/tank/notes.txt, /mnt/tank/unknown';
      inputEl.dispatchEvent(new Event('change'));

      expect(spy).toHaveBeenCalledWith({
        value: ['/mnt/tank/notes.txt', '/mnt/tank/unknown'],
        items: [items[0], null],
      });
    });

    it('resolves a typed value with surrounding whitespace to its listed item', async () => {
      fixture.componentRef.setInput('allowFreeText', true);
      const spy = jest.fn();
      component.itemSelectionChange.subscribe(spy);
      await listTank();

      const inputEl = fixture.nativeElement.querySelector('.tn-file-picker-input') as HTMLInputElement;
      inputEl.value = '/mnt/tank/notes.txt ';
      inputEl.dispatchEvent(new Event('change'));

      expect(spy).toHaveBeenCalledWith({ value: '/mnt/tank/notes.txt ', items: [items[0]] });
    });

    it('resolves value-space entries against absolute listings', async () => {
      fixture.componentRef.setInput('valueRoot', '/mnt');
      const spy = jest.fn();
      component.itemSelectionChange.subscribe(spy);
      await listTank();

      component.onItemClick(items[1]);
      component.onSubmit();

      expect(spy).toHaveBeenCalledWith({ value: 'tank/media', items: [items[1]] });
    });

    it('emits no items for a cleared selection', () => {
      const spy = jest.fn();
      component.itemSelectionChange.subscribe(spy);
      fixture.detectChanges();

      component.onClearSelection();

      expect(spy).toHaveBeenCalledWith({ value: '', items: [] });
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

  describe('Test IDs', () => {
    it('derives the container, input, and toggle ids from an explicit testId', () => {
      fixture.componentRef.setInput('testId', 'backup-target');
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.tn-file-picker-container')?.getAttribute('data-testid')).toBe('file-picker-backup-target');
      expect(el.querySelector('input')?.getAttribute('data-testid')).toBe('input-backup-target');
      expect(el.querySelector('.tn-file-picker-toggle')?.getAttribute('data-testid')).toBe('button-toggle-backup-target');
    });

    it('emits no attributes with no testId and no bound control', () => {
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.tn-file-picker-container')?.hasAttribute('data-testid')).toBe(false);
      expect(el.querySelector('input')?.hasAttribute('data-testid')).toBe(false);
      expect(el.querySelector('.tn-file-picker-toggle')?.hasAttribute('data-testid')).toBe(false);
    });

    it('scopes the portaled popup with the resolved base', () => {
      fixture.componentRef.setInput('testId', 'backup-target');
      fixture.detectChanges();

      component.openFilePicker();
      fixture.detectChanges();

      const popup = document.querySelector('tn-file-picker-popup');
      expect(popup?.getAttribute('data-testid')).toBe('file-picker-popup-backup-target');

      component.close();
    });
  });
});

@Component({
  selector: 'tn-test-form-name-host',
  standalone: true,
  imports: [TnFilePickerComponent, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <form [formGroup]="form">
      <tn-file-picker formControlName="backupPath" />
    </form>
  `
})
class TestFormNameHostComponent {
  form = new FormGroup({ backupPath: new FormControl<string | null>(null) });
}

describe('TnFilePickerComponent test-id fallback', () => {
  it('derives data-testid from formControlName when no testId is set', async () => {
    await TestBed.configureTestingModule({
      imports: [TestFormNameHostComponent, NoopAnimationsModule]
    }).compileComponents();
    const fixture = TestBed.createComponent(TestFormNameHostComponent);
    fixture.detectChanges();

    // No explicit testId: the control name `backupPath` becomes the base,
    // exactly what consumers hand-write today as testId="backup-path".
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.tn-file-picker-container')?.getAttribute('data-testid')).toBe('file-picker-backup-path');
    expect(el.querySelector('input')?.getAttribute('data-testid')).toBe('input-backup-path');
    expect(el.querySelector('.tn-file-picker-toggle')?.getAttribute('data-testid')).toBe('button-toggle-backup-path');
  });
});

describe('TnFilePickerComponent source, errors and create actions', () => {
  let component: TnFilePickerComponent;
  let fixture: ComponentFixture<TnFilePickerComponent>;

  const dataset: FileSystemItem = { path: '/mnt/tank', name: 'tank', type: 'dataset' };
  const folder: FileSystemItem = { path: '/mnt/plain', name: 'plain', type: 'folder' };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnFilePickerComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TnFilePickerComponent);
    component = fixture.componentInstance;
  });

  function popupText(): string {
    return document.querySelector('.tn-file-picker-error .error-text')?.textContent?.trim() ?? '';
  }

  afterEach(() => component.close());

  describe('source', () => {
    it('browses and maps values through the bundled source', async () => {
      const getChildren = jest.fn().mockResolvedValue([dataset]);
      fixture.componentRef.setInput('source', {
        callbacks: { getChildren },
        rootPath: '/mnt',
        startPath: '/mnt',
        valueRoot: '/mnt',
      });
      fixture.detectChanges();
      const emitted: (string | string[])[] = [];
      component.selectionChange.subscribe((value) => emitted.push(value));

      component.openFilePicker();
      await fixture.whenStable();
      component.onItemClick(dataset);
      component.onSubmit();

      expect(getChildren).toHaveBeenCalledWith('/mnt');
      expect(emitted).toEqual(['tank']);
    });

    it('lets explicitly bound inputs win over source fields', () => {
      fixture.componentRef.setInput('source', { rootPath: '/mnt', startPath: '/mnt/a' });
      fixture.componentRef.setInput('startPath', '/mnt/b');
      fixture.detectChanges();

      expect(component.currentPath()).toBe('/mnt/b');
    });
  });

  describe('touched', () => {
    it('marks the control touched when a popup selection is applied or cleared', () => {
      const onTouched = jest.fn();
      component.registerOnTouched(onTouched);
      fixture.detectChanges();

      component.onItemClick({ path: '/mnt/tank', name: 'tank', type: 'dataset' });
      component.onSubmit();
      expect(onTouched).toHaveBeenCalledTimes(1);

      component.onClearSelection();
      expect(onTouched).toHaveBeenCalledTimes(2);
    });
  });

  describe('readonly', () => {
    it('shows the value but neither edits it nor opens the popup', () => {
      fixture.componentRef.setInput('readonly', true);
      fixture.componentRef.setInput('openOnClick', true);
      fixture.detectChanges();
      component.writeValue('/mnt/tank');
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('.tn-file-picker-input') as HTMLInputElement;
      const toggle = fixture.nativeElement.querySelector('.tn-file-picker-toggle') as HTMLButtonElement;

      component.openFilePicker();
      input.value = '/mnt/other';
      input.dispatchEvent(new Event('change'));

      expect(input.readOnly).toBe(true);
      expect(input.disabled).toBe(false);
      expect(toggle.disabled).toBe(true);
      expect(component.isOpen()).toBe(false);
      expect(component.selectedPath()).toBe('/mnt/tank');
    });
  });

  describe('popup errors', () => {
    it('shows a failed listing in the popup and clears it once a listing succeeds', async () => {
      const getChildren = jest.fn()
        .mockRejectedValueOnce(new Error('Pool is offline'))
        .mockResolvedValue([dataset]);
      fixture.componentRef.setInput('callbacks', { getChildren });
      fixture.detectChanges();

      component.openFilePicker();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(popupText()).toBe('Pool is offline');

      await component.refresh();
      fixture.detectChanges();
      expect(popupText()).toBe('');
    });

    it('clears a creation error on the next listing without callbacks, too', async () => {
      fixture.componentRef.setInput('createActions', [{
        id: 'zvol', label: 'Create Zvol', run: () => Promise.reject(new Error('No space left')),
      }]);
      fixture.detectChanges();
      await component.runCreateAction({ actionId: 'zvol', parentPath: '/mnt' });
      expect(component.popupError()).toBe('No space left');

      component.navigateToPath('/mnt/Documents');
      await fixture.whenStable();

      expect(component.popupError()).toBeNull();
    });

    it('drops the message when the popup closes', async () => {
      fixture.componentRef.setInput('callbacks', { getChildren: jest.fn().mockRejectedValue(new Error('Nope')) });
      fixture.detectChanges();
      component.openFilePicker();
      await fixture.whenStable();

      component.close();

      expect(component.popupError()).toBeNull();
    });
  });

  describe('create actions', () => {
    it('awaits run() and selects the path it resolves with', async () => {
      const getChildren = jest.fn().mockResolvedValue([dataset]);
      const run = jest.fn().mockResolvedValue('/mnt/tank');
      fixture.componentRef.setInput('callbacks', { getChildren });
      fixture.componentRef.setInput('createActions', [{ id: 'zvol', label: 'Create Zvol', run }]);
      fixture.detectChanges();
      const createAction = jest.fn();
      component.createAction.subscribe(createAction);

      await component.runCreateAction({ actionId: 'zvol', parentPath: '/mnt' });

      expect(run).toHaveBeenCalledWith('/mnt');
      expect(createAction).not.toHaveBeenCalled();
      expect(component.selectedPath()).toBe('/mnt/tank');
    });

    it('leaves the value alone when run() resolves with null', async () => {
      fixture.componentRef.setInput('createActions', [{ id: 'zvol', label: 'Create Zvol', run: () => Promise.resolve(null) }]);
      fixture.detectChanges();

      await component.runCreateAction({ actionId: 'zvol', parentPath: '/mnt' });

      expect(component.selectedPath()).toBe('');
    });

    it('shows a rejected run() in the popup as a creation error', async () => {
      fixture.componentRef.setInput('createActions', [{
        id: 'zvol', label: 'Create Zvol', run: () => Promise.reject(new Error('No space left')),
      }]);
      fixture.detectChanges();
      const errors: unknown[] = [];
      component.error.subscribe((error) => errors.push(error));

      await component.runCreateAction({ actionId: 'zvol', parentPath: '/mnt' });

      expect(component.popupError()).toBe('No space left');
      expect(errors).toEqual([{ type: 'creation', message: 'No space left', path: '/mnt' }]);
    });

    it('shows a run() path outside the root as a creation error in the popup', async () => {
      fixture.componentRef.setInput('rootPath', '/mnt');
      fixture.componentRef.setInput('createActions', [{
        id: 'zvol', label: 'Create Zvol', run: () => Promise.resolve('/dev/zvol/tank/vol'),
      }]);
      fixture.detectChanges();
      const errors: unknown[] = [];
      component.error.subscribe((error) => errors.push(error));

      await component.runCreateAction({ actionId: 'zvol', parentPath: '/mnt' });

      expect(component.popupError()).toBe('Created item is outside of /mnt');
      expect(errors).toEqual([{ type: 'creation', message: 'Created item is outside of /mnt', path: '/dev/zvol/tank/vol' }]);
      expect(component.selectedPath()).toBe('');
    });

    it('emits createAction for an action with neither create nor run', async () => {
      fixture.componentRef.setInput('createActions', [{ id: 'custom', label: 'Custom' }]);
      fixture.detectChanges();
      const createAction = jest.fn();
      component.createAction.subscribe(createAction);

      await component.runCreateAction({ actionId: 'custom', parentPath: '/mnt' });

      expect(createAction).toHaveBeenCalledWith({ actionId: 'custom', parentPath: '/mnt' });
    });

    it('shows only the actions whose canCreateAt accepts the browsed directory and its item', async () => {
      const getChildren = jest.fn().mockResolvedValue([dataset, folder]);
      const canCreateAt = jest.fn((_path: string, directory: FileSystemItem | null) => directory?.type === 'dataset');
      fixture.componentRef.setInput('callbacks', { getChildren });
      fixture.componentRef.setInput('createActions', [
        { id: 'dataset', label: 'Create Dataset', canCreateAt },
        { id: 'always', label: 'Always' },
      ]);
      fixture.detectChanges();
      component.openFilePicker();
      await fixture.whenStable();

      const labels = (): string[] => Array.from(document.querySelectorAll('.footer-actions tn-button'))
        .map((button) => button.textContent?.trim() ?? '');

      fixture.detectChanges();
      expect(labels()).toEqual(['Always', 'Select']);
      expect(canCreateAt).toHaveBeenLastCalledWith('/mnt', null);

      component.navigateToPath('/mnt/tank');
      await fixture.whenStable();
      fixture.detectChanges();
      expect(labels()).toEqual(['Create Dataset', 'Always', 'Select']);
      expect(canCreateAt).toHaveBeenLastCalledWith('/mnt/tank', dataset);

      component.navigateToPath('/mnt/plain');
      await fixture.whenStable();
      fixture.detectChanges();
      expect(labels()).toEqual(['Always', 'Select']);
    });
  });
});
