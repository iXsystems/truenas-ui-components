import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TnIconTesting } from './icon-testing';
import { TnIconComponent } from './icon.component';
import type { IconLibraryType, IconSize } from './icon.component';
import { TnIconHarness } from './icon.harness';

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnIconComponent],
  template: `<tn-icon
    [name]="name()"
    [library]="library()"
    [size]="size()"
    [color]="color()"
    (click)="onIconClick()"
  />`
})
class TestHostComponent {
  name = signal('folder');
  library = signal<IconLibraryType | undefined>(undefined);
  size = signal<IconSize>('md');
  color = signal<string | undefined>(undefined);
  clickCount = 0;

  onIconClick(): void {
    this.clickCount++;
  }
}

describe('TnIconHarness', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        TnIconTesting.jest.providers()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should verify element exists in DOM', () => {
    const iconElement = fixture.nativeElement.querySelector('tn-icon');
    expect(iconElement).toBeTruthy();
  });

  it('should load harness', async () => {
    const icon = await loader.getHarness(TnIconHarness);
    expect(icon).toBeTruthy();
  });

  describe('getName', () => {
    it('should get icon name', async () => {
      hostComponent.name.set('settings');
      fixture.detectChanges();

      const icon = await loader.getHarness(TnIconHarness);
      const name = await icon.getName();
      expect(name).toBe('settings');
    });

    it('should get updated name after change', async () => {
      hostComponent.name.set('home');
      fixture.detectChanges();

      const icon = await loader.getHarness(TnIconHarness);
      expect(await icon.getName()).toBe('home');

      hostComponent.name.set('star');
      fixture.detectChanges();

      expect(await icon.getName()).toBe('star');
    });
  });

  describe('getLibrary', () => {
    it('should return null when library is not set', async () => {
      hostComponent.library.set(undefined);
      fixture.detectChanges();

      const icon = await loader.getHarness(TnIconHarness);
      expect(await icon.getLibrary()).toBeNull();
    });

    it('should get icon library when set', async () => {
      hostComponent.library.set('mdi');
      fixture.detectChanges();

      const icon = await loader.getHarness(TnIconHarness);
      const library = await icon.getLibrary();
      expect(library).toBe('mdi');
    });

    it('should get updated library after change', async () => {
      hostComponent.library.set('material');
      fixture.detectChanges();

      const icon = await loader.getHarness(TnIconHarness);
      expect(await icon.getLibrary()).toBe('material');

      hostComponent.library.set('lucide');
      fixture.detectChanges();

      expect(await icon.getLibrary()).toBe('lucide');
    });
  });

  describe('getSize', () => {
    it('should get icon size', async () => {
      hostComponent.size.set('lg');
      fixture.detectChanges();

      const icon = await loader.getHarness(TnIconHarness);
      const size = await icon.getSize();
      expect(size).toBe('lg');
    });

    it('should get default size', async () => {
      hostComponent.size.set('md');
      fixture.detectChanges();

      const icon = await loader.getHarness(TnIconHarness);
      expect(await icon.getSize()).toBe('md');
    });

    it('should get updated size after change', async () => {
      hostComponent.size.set('sm');
      fixture.detectChanges();

      const icon = await loader.getHarness(TnIconHarness);
      expect(await icon.getSize()).toBe('sm');

      hostComponent.size.set('xl');
      fixture.detectChanges();

      expect(await icon.getSize()).toBe('xl');
    });
  });

  describe('getColor', () => {
    it('should return null when color is not set', async () => {
      hostComponent.color.set(undefined);
      fixture.detectChanges();

      const icon = await loader.getHarness(TnIconHarness);
      expect(await icon.getColor()).toBeNull();
    });

    it('should get icon color when set', async () => {
      hostComponent.color.set('primary');
      fixture.detectChanges();

      const icon = await loader.getHarness(TnIconHarness);
      const color = await icon.getColor();
      expect(color).toBe('primary');
    });

    it('should get updated color after change', async () => {
      hostComponent.color.set('red');
      fixture.detectChanges();

      const icon = await loader.getHarness(TnIconHarness);
      expect(await icon.getColor()).toBe('red');

      hostComponent.color.set('blue');
      fixture.detectChanges();

      expect(await icon.getColor()).toBe('blue');
    });
  });

  describe('with() filter', () => {
    it('should filter by exact name', async () => {
      hostComponent.name.set('check');
      fixture.detectChanges();

      const icon = await loader.getHarness(TnIconHarness.with({ name: 'check' }));
      expect(icon).toBeTruthy();
    });

    it('should filter by library', async () => {
      hostComponent.library.set('mdi');
      fixture.detectChanges();

      const icon = await loader.getHarness(TnIconHarness.with({ library: 'mdi' }));
      expect(icon).toBeTruthy();
    });

    it('should filter by size', async () => {
      hostComponent.size.set('xl');
      fixture.detectChanges();

      const icon = await loader.getHarness(TnIconHarness.with({ size: 'xl' }));
      expect(icon).toBeTruthy();
    });

    it('should filter by multiple criteria', async () => {
      hostComponent.name.set('user');
      hostComponent.library.set('lucide');
      hostComponent.size.set('lg');
      fixture.detectChanges();

      const icon = await loader.getHarness(TnIconHarness.with({
        name: 'user',
        library: 'lucide',
        size: 'lg'
      }));
      expect(icon).toBeTruthy();
    });
  });

  describe('hasHarness', () => {
    it('should return true when icon exists', async () => {
      expect(await loader.hasHarness(TnIconHarness)).toBe(true);
    });

    it('should return false when icon with name does not exist', async () => {
      hostComponent.name.set('folder');
      fixture.detectChanges();

      expect(await loader.hasHarness(TnIconHarness.with({ name: 'nonexistent' }))).toBe(false);
    });

    it('should return false when icon with library does not exist', async () => {
      hostComponent.library.set('mdi');
      fixture.detectChanges();

      expect(await loader.hasHarness(TnIconHarness.with({ library: 'custom' }))).toBe(false);
    });
  });

  describe('click', () => {
    it('should trigger click event', async () => {
      const icon = await loader.getHarness(TnIconHarness);

      expect(hostComponent.clickCount).toBe(0);

      await icon.click();

      expect(hostComponent.clickCount).toBe(1);
    });

    it('should trigger multiple clicks', async () => {
      const icon = await loader.getHarness(TnIconHarness);

      expect(hostComponent.clickCount).toBe(0);

      await icon.click();
      await icon.click();
      await icon.click();

      expect(hostComponent.clickCount).toBe(3);
    });

    it('should click specific icon by name', async () => {
      hostComponent.name.set('settings');
      fixture.detectChanges();

      const icon = await loader.getHarness(TnIconHarness.with({ name: 'settings' }));

      expect(hostComponent.clickCount).toBe(0);

      await icon.click();

      expect(hostComponent.clickCount).toBe(1);
    });

    it('should click specific icon by library', async () => {
      hostComponent.library.set('mdi');
      fixture.detectChanges();

      const icon = await loader.getHarness(TnIconHarness.with({ library: 'mdi' }));

      expect(hostComponent.clickCount).toBe(0);

      await icon.click();

      expect(hostComponent.clickCount).toBe(1);
    });

    it('should click icon with multiple filter criteria', async () => {
      hostComponent.name.set('check');
      hostComponent.library.set('lucide');
      hostComponent.size.set('lg');
      fixture.detectChanges();

      const icon = await loader.getHarness(TnIconHarness.with({
        name: 'check',
        library: 'lucide',
        size: 'lg'
      }));

      expect(hostComponent.clickCount).toBe(0);

      await icon.click();

      expect(hostComponent.clickCount).toBe(1);
    });
  });
});
