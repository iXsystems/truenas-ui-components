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
});
