import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TnInputComponent } from './input.component';
import { TnInputHarness } from './input.harness';
import { InputType } from '../enums/input-type.enum';
import { TnIconTesting } from '../icon/icon-testing';
import type { IconLibraryType } from '../icon/icon.component';

/* eslint-disable @angular-eslint/component-max-inline-declarations */
@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnInputComponent],
  template: `<tn-input
    [inputType]="inputType()"
    [placeholder]="placeholder()"
    [disabled]="disabled()"
    [multiline]="multiline()"
    [rows]="rows()"
    [prefixIcon]="prefixIcon()"
    [prefixIconLibrary]="prefixIconLibrary()"
    [suffixIcon]="suffixIcon()"
    [suffixIconLibrary]="suffixIconLibrary()"
    [suffixIconAriaLabel]="suffixIconAriaLabel()"
    (onSuffixAction)="onSuffixAction()"
  />`
})
class TestHostComponent {
  inputType = signal<InputType>(InputType.PlainText);
  placeholder = signal('Enter your name');
  disabled = signal(false);
  multiline = signal(false);
  rows = signal(3);
  prefixIcon = signal<string | undefined>(undefined);
  prefixIconLibrary = signal<IconLibraryType | undefined>(undefined);
  suffixIcon = signal<string | undefined>(undefined);
  suffixIconLibrary = signal<IconLibraryType | undefined>(undefined);
  suffixIconAriaLabel = signal<string | undefined>(undefined);
  suffixActionCount = 0;

  onSuffixAction(): void {
    this.suffixActionCount++;
  }
}
/* eslint-enable @angular-eslint/component-max-inline-declarations */

describe('TnInputHarness', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [TnIconTesting.jest.providers()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should load harness', async () => {
    const input = await loader.getHarness(TnInputHarness);
    expect(input).toBeTruthy();
  });

  describe('with() filter', () => {
    it('should filter by placeholder', async () => {
      hostComponent.placeholder.set('Search...');
      fixture.detectChanges();

      const input = await loader.getHarness(TnInputHarness.with({ placeholder: 'Search...' }));
      expect(input).toBeTruthy();
    });

    it('should not match wrong placeholder', async () => {
      hostComponent.placeholder.set('Search...');
      fixture.detectChanges();

      const found = await loader.hasHarness(TnInputHarness.with({ placeholder: 'wrong' }));
      expect(found).toBe(false);
    });
  });

  describe('getValue / setValue', () => {
    it('should return empty string by default', async () => {
      const input = await loader.getHarness(TnInputHarness);
      expect(await input.getValue()).toBe('');
    });

    it('should set and read a value', async () => {
      const input = await loader.getHarness(TnInputHarness);
      await input.setValue('hello world');
      expect(await input.getValue()).toBe('hello world');
    });

    it('should overwrite existing value', async () => {
      const input = await loader.getHarness(TnInputHarness);
      await input.setValue('first');
      await input.setValue('second');
      expect(await input.getValue()).toBe('second');
    });
  });

  describe('getPlaceholder', () => {
    it('should return the placeholder text', async () => {
      const input = await loader.getHarness(TnInputHarness);
      expect(await input.getPlaceholder()).toBe('Enter your name');
    });

    it('should reflect updated placeholder', async () => {
      hostComponent.placeholder.set('New placeholder');
      fixture.detectChanges();

      const input = await loader.getHarness(TnInputHarness);
      expect(await input.getPlaceholder()).toBe('New placeholder');
    });
  });

  describe('isDisabled', () => {
    it('should return false when not disabled', async () => {
      const input = await loader.getHarness(TnInputHarness);
      expect(await input.isDisabled()).toBe(false);
    });

    it('should return true when disabled', async () => {
      hostComponent.disabled.set(true);
      fixture.detectChanges();

      const input = await loader.getHarness(TnInputHarness);
      expect(await input.isDisabled()).toBe(true);
    });

    it('should reflect updated disabled state', async () => {
      const input = await loader.getHarness(TnInputHarness);
      expect(await input.isDisabled()).toBe(false);

      hostComponent.disabled.set(true);
      fixture.detectChanges();

      expect(await input.isDisabled()).toBe(true);
    });
  });

  describe('isMultiline', () => {
    it('should return false for regular input', async () => {
      const input = await loader.getHarness(TnInputHarness);
      expect(await input.isMultiline()).toBe(false);
    });

    it('should return true for textarea', async () => {
      hostComponent.multiline.set(true);
      fixture.detectChanges();

      const input = await loader.getHarness(TnInputHarness);
      expect(await input.isMultiline()).toBe(true);
    });
  });

  describe('multiline getValue / setValue', () => {
    it('should set and read a value on textarea', async () => {
      hostComponent.multiline.set(true);
      fixture.detectChanges();

      const input = await loader.getHarness(TnInputHarness);
      await input.setValue('multiline text');
      expect(await input.getValue()).toBe('multiline text');
    });

    it('should return placeholder on textarea', async () => {
      hostComponent.multiline.set(true);
      hostComponent.placeholder.set('Enter comments');
      fixture.detectChanges();

      const input = await loader.getHarness(TnInputHarness);
      expect(await input.getPlaceholder()).toBe('Enter comments');
    });

    it('should reflect disabled state on textarea', async () => {
      hostComponent.multiline.set(true);
      hostComponent.disabled.set(true);
      fixture.detectChanges();

      const input = await loader.getHarness(TnInputHarness);
      expect(await input.isDisabled()).toBe(true);
    });
  });

  describe('prefix icon', () => {
    it('should not have prefix icon by default', async () => {
      const input = await loader.getHarness(TnInputHarness);
      expect(await input.hasPrefixIcon()).toBe(false);
    });

    it('should return null from getPrefixIcon when not set', async () => {
      const input = await loader.getHarness(TnInputHarness);
      expect(await input.getPrefixIcon()).toBeNull();
    });

    it('should have prefix icon when set', async () => {
      hostComponent.prefixIcon.set('magnify');
      hostComponent.prefixIconLibrary.set('mdi');
      fixture.detectChanges();

      const input = await loader.getHarness(TnInputHarness);
      expect(await input.hasPrefixIcon()).toBe(true);
    });

    it('should expose prefix icon harness with correct name', async () => {
      hostComponent.prefixIcon.set('magnify');
      hostComponent.prefixIconLibrary.set('mdi');
      fixture.detectChanges();

      const input = await loader.getHarness(TnInputHarness);
      const icon = await input.getPrefixIcon();
      expect(icon).toBeTruthy();
      expect(await icon!.getName()).toBe('magnify');
      expect(await icon!.getLibrary()).toBe('mdi');
    });

    it('should remove prefix icon when cleared', async () => {
      hostComponent.prefixIcon.set('magnify');
      fixture.detectChanges();

      const input = await loader.getHarness(TnInputHarness);
      expect(await input.hasPrefixIcon()).toBe(true);

      hostComponent.prefixIcon.set(undefined);
      fixture.detectChanges();

      expect(await input.hasPrefixIcon()).toBe(false);
    });
  });

  describe('suffix action', () => {
    it('should not have suffix action by default', async () => {
      const input = await loader.getHarness(TnInputHarness);
      expect(await input.hasSuffixAction()).toBe(false);
    });

    it('should return null from getSuffixIcon when not set', async () => {
      const input = await loader.getHarness(TnInputHarness);
      expect(await input.getSuffixIcon()).toBeNull();
    });

    it('should have suffix action when set', async () => {
      hostComponent.suffixIcon.set('close-circle');
      fixture.detectChanges();

      const input = await loader.getHarness(TnInputHarness);
      expect(await input.hasSuffixAction()).toBe(true);
    });

    it('should expose suffix icon harness with correct name', async () => {
      hostComponent.suffixIcon.set('close-circle');
      hostComponent.suffixIconLibrary.set('mdi');
      fixture.detectChanges();

      const input = await loader.getHarness(TnInputHarness);
      const icon = await input.getSuffixIcon();
      expect(icon).toBeTruthy();
      expect(await icon!.getName()).toBe('close-circle');
      expect(await icon!.getLibrary()).toBe('mdi');
    });

    it('should emit onSuffixAction when clicked', async () => {
      hostComponent.suffixIcon.set('close-circle');
      fixture.detectChanges();

      const input = await loader.getHarness(TnInputHarness);
      expect(hostComponent.suffixActionCount).toBe(0);

      await input.clickSuffixAction();
      expect(hostComponent.suffixActionCount).toBe(1);
    });

    it('should emit multiple clicks', async () => {
      hostComponent.suffixIcon.set('close-circle');
      fixture.detectChanges();

      const input = await loader.getHarness(TnInputHarness);
      await input.clickSuffixAction();
      await input.clickSuffixAction();
      await input.clickSuffixAction();
      expect(hostComponent.suffixActionCount).toBe(3);
    });

    it('should throw when clicking suffix action that does not exist', async () => {
      const input = await loader.getHarness(TnInputHarness);
      await expect(input.clickSuffixAction()).rejects.toThrow('No suffix action button found on this input.');
    });

    it('should remove suffix action when cleared', async () => {
      hostComponent.suffixIcon.set('close-circle');
      fixture.detectChanges();

      const input = await loader.getHarness(TnInputHarness);
      expect(await input.hasSuffixAction()).toBe(true);

      hostComponent.suffixIcon.set(undefined);
      fixture.detectChanges();

      expect(await input.hasSuffixAction()).toBe(false);
    });
  });

  describe('focus / blur', () => {
    it('should focus the input', async () => {
      const input = await loader.getHarness(TnInputHarness);
      await input.focus();

      const activeEl = fixture.nativeElement.querySelector(':focus');
      expect(activeEl?.tagName).toBe('INPUT');
    });

    it('should blur the input', async () => {
      const input = await loader.getHarness(TnInputHarness);
      await input.focus();
      await input.blur();

      const activeEl = fixture.nativeElement.querySelector(':focus');
      expect(activeEl).toBeNull();
    });

    it('should focus textarea when multiline', async () => {
      hostComponent.multiline.set(true);
      fixture.detectChanges();

      const input = await loader.getHarness(TnInputHarness);
      await input.focus();

      const activeEl = fixture.nativeElement.querySelector(':focus');
      expect(activeEl?.tagName).toBe('TEXTAREA');
    });
  });
});
