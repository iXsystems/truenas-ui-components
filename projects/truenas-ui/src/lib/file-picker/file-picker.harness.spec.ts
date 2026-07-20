import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TnFilePickerComponent } from './file-picker.component';
import { TnFilePickerHarness } from './file-picker.harness';

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnFilePickerComponent, ReactiveFormsModule],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-file-picker
      [multiSelect]="multiSelect()"
      [allowManualInput]="allowManualInput()"
      [placeholder]="placeholder()"
      [disabled]="disabled()"
      [testId]="testId()"
      [formControl]="control" />
  `
})
class TestHostComponent {
  multiSelect = signal(false);
  allowManualInput = signal(true);
  placeholder = signal('Select file or folder');
  disabled = signal(false);
  testId = signal<string | undefined>('source-path');
  control = new FormControl<string | string[] | null>(null);
}

describe('TnFilePickerHarness', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load harness', async () => {
    const picker = await loader.getHarness(TnFilePickerHarness);
    expect(picker).toBeTruthy();
  });

  describe('with', () => {
    it('finds by placeholder', async () => {
      const picker = await loader.getHarness(
        TnFilePickerHarness.with({ placeholder: 'Select file or folder' })
      );
      expect(picker).toBeTruthy();
    });

    it('finds by rendered testId', async () => {
      const picker = await loader.getHarness(
        TnFilePickerHarness.with({ testId: 'file-picker-source-path' })
      );
      expect(await picker.getTestId()).toBe('file-picker-source-path');
    });

    it('does not match a wrong testId', async () => {
      const pickers = await loader.getAllHarnesses(
        TnFilePickerHarness.with({ testId: 'file-picker-other' })
      );
      expect(pickers).toHaveLength(0);
    });
  });

  describe('getValue / setValue', () => {
    it('returns empty string initially', async () => {
      const picker = await loader.getHarness(TnFilePickerHarness);
      expect(await picker.getValue()).toBe('');
    });

    it('reflects a form control value', async () => {
      hostComponent.control.setValue('/mnt/tank/media');
      const picker = await loader.getHarness(TnFilePickerHarness);
      expect(await picker.getValue()).toBe('/mnt/tank/media');
    });

    it('commits a typed path to the form control', async () => {
      const picker = await loader.getHarness(TnFilePickerHarness);
      await picker.setValue('/mnt/tank/media');
      expect(await picker.getValue()).toBe('/mnt/tank/media');
      expect(hostComponent.control.value).toBe('/mnt/tank/media');
    });

    it('clears the selection when set to an empty string', async () => {
      hostComponent.control.setValue('/mnt/tank/media');
      const picker = await loader.getHarness(TnFilePickerHarness);
      await picker.setValue('');
      expect(await picker.getValue()).toBe('');
      expect(hostComponent.control.value).toBe('');
    });

    it('rejects paths outside the root without changing the value', async () => {
      hostComponent.control.setValue('/mnt/tank');
      const picker = await loader.getHarness(TnFilePickerHarness);
      await picker.setValue('/etc/passwd');
      expect(hostComponent.control.value).toBe('/mnt/tank');
    });

    it('does not commit when manual input is disallowed', async () => {
      hostComponent.allowManualInput.set(false);
      const picker = await loader.getHarness(TnFilePickerHarness);
      await picker.setValue('/mnt/tank/media');
      expect(hostComponent.control.value).toBeNull();
    });
  });

  describe('getPlaceholder', () => {
    it('returns the placeholder', async () => {
      const picker = await loader.getHarness(TnFilePickerHarness);
      expect(await picker.getPlaceholder()).toBe('Select file or folder');
    });
  });

  describe('isDisabled', () => {
    it('returns false when enabled', async () => {
      const picker = await loader.getHarness(TnFilePickerHarness);
      expect(await picker.isDisabled()).toBe(false);
    });

    it('returns true when disabled via input', async () => {
      hostComponent.disabled.set(true);
      const picker = await loader.getHarness(TnFilePickerHarness);
      expect(await picker.isDisabled()).toBe(true);
    });

    it('returns true when the form control is disabled', async () => {
      hostComponent.control.disable();
      const picker = await loader.getHarness(TnFilePickerHarness);
      expect(await picker.isDisabled()).toBe(true);
    });
  });

  describe('isReadonly', () => {
    it('returns false when manual input is allowed', async () => {
      const picker = await loader.getHarness(TnFilePickerHarness);
      expect(await picker.isReadonly()).toBe(false);
    });

    it('returns true when manual input is disallowed', async () => {
      hostComponent.allowManualInput.set(false);
      const picker = await loader.getHarness(TnFilePickerHarness);
      expect(await picker.isReadonly()).toBe(true);
    });
  });

  describe('popup', () => {
    it('is closed initially and opens via open()', async () => {
      const picker = await loader.getHarness(TnFilePickerHarness);
      expect(await picker.isOpen()).toBe(false);
      await picker.open();
      expect(await picker.isOpen()).toBe(true);
    });

    it('does not open while disabled', async () => {
      hostComponent.disabled.set(true);
      const picker = await loader.getHarness(TnFilePickerHarness);
      await picker.open();
      expect(await picker.isOpen()).toBe(false);
    });

    it('close() dismisses the popup without applying the pending selection', async () => {
      const picker = await loader.getHarness(TnFilePickerHarness);
      await picker.open();
      await picker.clickItem('Documents');
      await picker.close();
      expect(await picker.isOpen()).toBe(false);
      expect(hostComponent.control.value).toBeNull();
    });

    it('lists the visible item names', async () => {
      const picker = await loader.getHarness(TnFilePickerHarness);
      await picker.open();
      // Names come from the component's built-in mock data (no callbacks configured)
      expect(await picker.getItemNames()).toEqual(['Documents', 'Downloads', 'dataset1', 'example.txt']);
    });

    it('shows the breadcrumb for the current path', async () => {
      const picker = await loader.getHarness(TnFilePickerHarness);
      await picker.open();
      expect(await picker.getBreadcrumbSegments()).toEqual(['mnt']);
    });

    it('selects an item and applies it with clickSelect()', async () => {
      const picker = await loader.getHarness(TnFilePickerHarness);
      await picker.open();
      await picker.clickItem('Documents');
      await picker.clickSelect();
      expect(await picker.isOpen()).toBe(false);
      expect(hostComponent.control.value).toBe('/mnt/Documents');
      expect(await picker.getValue()).toBe('/mnt/Documents');
    });

    it('applies multiple items in multi-select mode', async () => {
      hostComponent.multiSelect.set(true);
      const picker = await loader.getHarness(TnFilePickerHarness);
      await picker.open();
      await picker.clickItem('Documents');
      await picker.clickItem('example.txt');
      await picker.clickSelect();
      expect(hostComponent.control.value).toEqual(['/mnt/Documents', '/mnt/example.txt']);
      // Multi-select displays paths joined with comma-space
      expect(await picker.getValue()).toBe('/mnt/Documents, /mnt/example.txt');
    });

    it('throws when clicking a missing item', async () => {
      const picker = await loader.getHarness(TnFilePickerHarness);
      await picker.open();
      await expect(picker.clickItem('nope')).rejects.toThrow('No item named "nope"');
    });

    it('navigates into a folder', async () => {
      const picker = await loader.getHarness(TnFilePickerHarness);
      await picker.open();
      await picker.navigateToItem('Documents');
      expect(await picker.getBreadcrumbSegments()).toEqual(['mnt', 'Documents']);
    });

    it('throws when navigating to a non-navigatable item', async () => {
      const picker = await loader.getHarness(TnFilePickerHarness);
      await picker.open();
      await expect(picker.navigateToItem('example.txt')).rejects.toThrow('No navigatable item');
    });

    it('clears the pending selection with clickClearSelection()', async () => {
      hostComponent.multiSelect.set(true);
      const picker = await loader.getHarness(TnFilePickerHarness);
      await picker.open();
      await picker.clickItem('Documents');
      await picker.clickClearSelection();
      await expect(picker.clickClearSelection()).rejects.toThrow('No Clear Selection button');
    });
  });
});
