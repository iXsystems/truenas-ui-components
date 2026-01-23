import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TnIconTesting } from '../icon/icon-testing';
import type { IconLibraryType, IconSize } from '../icon/icon.component';
import { TnIconButtonComponent } from './icon-button.component';
import { TnIconButtonHarness } from './icon-button.harness';

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnIconButtonComponent],
  template: `<tn-icon-button
    [name]="name()"
    [library]="library()"
    [size]="size()"
    [color]="color()"
    [disabled]="disabled()"
    (onClick)="onButtonClick()"
  />`
})
class TestHostComponent {
  name = signal('close');
  library = signal<IconLibraryType | undefined>(undefined);
  size = signal<IconSize>('md');
  color = signal<string | undefined>(undefined);
  disabled = signal(false);
  clickCount = 0;

  onButtonClick(): void {
    this.clickCount++;
  }
}

describe('TnIconButtonHarness', () => {
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
    const buttonElement = fixture.nativeElement.querySelector('tn-icon-button');
    expect(buttonElement).toBeTruthy();
  });

  it('should load harness', async () => {
    const button = await loader.getHarness(TnIconButtonHarness);
    expect(button).toBeTruthy();
  });

  describe('getName', () => {
    it('should get icon name', async () => {
      hostComponent.name.set('settings');
      fixture.detectChanges();

      const button = await loader.getHarness(TnIconButtonHarness);
      const name = await button.getName();
      expect(name).toBe('settings');
    });

    it('should get updated name after change', async () => {
      hostComponent.name.set('home');
      fixture.detectChanges();

      const button = await loader.getHarness(TnIconButtonHarness);
      expect(await button.getName()).toBe('home');

      hostComponent.name.set('menu');
      fixture.detectChanges();

      expect(await button.getName()).toBe('menu');
    });
  });

  describe('getLibrary', () => {
    it('should return null when library is not set', async () => {
      hostComponent.library.set(undefined);
      fixture.detectChanges();

      const button = await loader.getHarness(TnIconButtonHarness);
      expect(await button.getLibrary()).toBeNull();
    });

    it('should get icon library when set', async () => {
      hostComponent.library.set('mdi');
      fixture.detectChanges();

      const button = await loader.getHarness(TnIconButtonHarness);
      const library = await button.getLibrary();
      expect(library).toBe('mdi');
    });

    it('should get updated library after change', async () => {
      hostComponent.library.set('material');
      fixture.detectChanges();

      const button = await loader.getHarness(TnIconButtonHarness);
      expect(await button.getLibrary()).toBe('material');

      hostComponent.library.set('lucide');
      fixture.detectChanges();

      expect(await button.getLibrary()).toBe('lucide');
    });
  });

  describe('getSize', () => {
    it('should get icon size', async () => {
      hostComponent.size.set('lg');
      fixture.detectChanges();

      const button = await loader.getHarness(TnIconButtonHarness);
      const size = await button.getSize();
      expect(size).toBe('lg');
    });

    it('should get default size', async () => {
      hostComponent.size.set('md');
      fixture.detectChanges();

      const button = await loader.getHarness(TnIconButtonHarness);
      expect(await button.getSize()).toBe('md');
    });

    it('should get updated size after change', async () => {
      hostComponent.size.set('sm');
      fixture.detectChanges();

      const button = await loader.getHarness(TnIconButtonHarness);
      expect(await button.getSize()).toBe('sm');

      hostComponent.size.set('xl');
      fixture.detectChanges();

      expect(await button.getSize()).toBe('xl');
    });
  });

  describe('getColor', () => {
    it('should return null when color is not set', async () => {
      hostComponent.color.set(undefined);
      fixture.detectChanges();

      const button = await loader.getHarness(TnIconButtonHarness);
      expect(await button.getColor()).toBeNull();
    });

    it('should get icon color when set', async () => {
      hostComponent.color.set('primary');
      fixture.detectChanges();

      const button = await loader.getHarness(TnIconButtonHarness);
      const color = await button.getColor();
      expect(color).toBe('primary');
    });

    it('should get updated color after change', async () => {
      hostComponent.color.set('red');
      fixture.detectChanges();

      const button = await loader.getHarness(TnIconButtonHarness);
      expect(await button.getColor()).toBe('red');

      hostComponent.color.set('blue');
      fixture.detectChanges();

      expect(await button.getColor()).toBe('blue');
    });
  });

  describe('isDisabled', () => {
    it('should return false when not disabled', async () => {
      hostComponent.disabled.set(false);
      fixture.detectChanges();

      const button = await loader.getHarness(TnIconButtonHarness);
      expect(await button.isDisabled()).toBe(false);
    });

    it('should return true when disabled', async () => {
      hostComponent.disabled.set(true);
      fixture.detectChanges();

      const button = await loader.getHarness(TnIconButtonHarness);
      expect(await button.isDisabled()).toBe(true);
    });

    it('should reflect updated disabled state', async () => {
      hostComponent.disabled.set(false);
      fixture.detectChanges();

      const button = await loader.getHarness(TnIconButtonHarness);
      expect(await button.isDisabled()).toBe(false);

      hostComponent.disabled.set(true);
      fixture.detectChanges();

      expect(await button.isDisabled()).toBe(true);
    });
  });

  describe('with() filter', () => {
    it('should filter by exact name', async () => {
      hostComponent.name.set('delete');
      fixture.detectChanges();

      const button = await loader.getHarness(TnIconButtonHarness.with({ name: 'delete' }));
      expect(button).toBeTruthy();
    });

    it('should filter by library', async () => {
      hostComponent.library.set('mdi');
      fixture.detectChanges();

      const button = await loader.getHarness(TnIconButtonHarness.with({ library: 'mdi' }));
      expect(button).toBeTruthy();
    });

    it('should filter by size', async () => {
      hostComponent.size.set('xl');
      fixture.detectChanges();

      const button = await loader.getHarness(TnIconButtonHarness.with({ size: 'xl' }));
      expect(button).toBeTruthy();
    });

    it('should filter by multiple criteria', async () => {
      hostComponent.name.set('settings');
      hostComponent.library.set('lucide');
      hostComponent.size.set('lg');
      fixture.detectChanges();

      const button = await loader.getHarness(TnIconButtonHarness.with({
        name: 'settings',
        library: 'lucide',
        size: 'lg'
      }));
      expect(button).toBeTruthy();
    });
  });

  describe('hasHarness', () => {
    it('should return true when icon button exists', async () => {
      expect(await loader.hasHarness(TnIconButtonHarness)).toBe(true);
    });

    it('should return false when icon button with name does not exist', async () => {
      hostComponent.name.set('close');
      fixture.detectChanges();

      expect(await loader.hasHarness(TnIconButtonHarness.with({ name: 'nonexistent' }))).toBe(false);
    });

    it('should return false when icon button with library does not exist', async () => {
      hostComponent.library.set('mdi');
      fixture.detectChanges();

      expect(await loader.hasHarness(TnIconButtonHarness.with({ library: 'custom' }))).toBe(false);
    });
  });

  describe('click', () => {
    it('should trigger click event', async () => {
      const button = await loader.getHarness(TnIconButtonHarness);

      expect(hostComponent.clickCount).toBe(0);

      await button.click();

      expect(hostComponent.clickCount).toBe(1);
    });

    it('should trigger multiple clicks', async () => {
      const button = await loader.getHarness(TnIconButtonHarness);

      expect(hostComponent.clickCount).toBe(0);

      await button.click();
      await button.click();
      await button.click();

      expect(hostComponent.clickCount).toBe(3);
    });

    it('should click specific button by name', async () => {
      hostComponent.name.set('save');
      fixture.detectChanges();

      const button = await loader.getHarness(TnIconButtonHarness.with({ name: 'save' }));

      expect(hostComponent.clickCount).toBe(0);

      await button.click();

      expect(hostComponent.clickCount).toBe(1);
    });

    it('should click specific button by library', async () => {
      hostComponent.library.set('mdi');
      fixture.detectChanges();

      const button = await loader.getHarness(TnIconButtonHarness.with({ library: 'mdi' }));

      expect(hostComponent.clickCount).toBe(0);

      await button.click();

      expect(hostComponent.clickCount).toBe(1);
    });

    it('should click button with multiple filter criteria', async () => {
      hostComponent.name.set('edit');
      hostComponent.library.set('lucide');
      hostComponent.size.set('lg');
      fixture.detectChanges();

      const button = await loader.getHarness(TnIconButtonHarness.with({
        name: 'edit',
        library: 'lucide',
        size: 'lg'
      }));

      expect(hostComponent.clickCount).toBe(0);

      await button.click();

      expect(hostComponent.clickCount).toBe(1);
    });

    it('should not trigger click when disabled', async () => {
      hostComponent.disabled.set(true);
      fixture.detectChanges();

      const button = await loader.getHarness(TnIconButtonHarness);

      expect(hostComponent.clickCount).toBe(0);

      await button.click();

      // Angular's disabled button prevents click events
      expect(hostComponent.clickCount).toBe(0);
    });
  });
});
