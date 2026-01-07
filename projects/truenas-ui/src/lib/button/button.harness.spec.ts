import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import { TestBed, fakeAsync, flush } from '@angular/core/testing';
import type { ComponentFixture} from '@angular/core/testing';
import { TnButtonComponent } from './button.component';
import { TnButtonHarness } from './button.harness';

// Test host component for harness testing
@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnButtonComponent],
  template: `<tn-button
    [label]="label()"
    [color]="color()"
    [variant]="variant()"
    [disabled]="disabled()"
  />`
})
class TestHostComponent {
  label = signal('Test Button');
  color = signal<'primary' | 'secondary' | 'warn' | 'default'>('default');
  variant = signal<'filled' | 'outline'>('filled');
  disabled = signal(false);
}

describe('TnButtonHarness', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();

    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should verify element exists in DOM', () => {
    const buttonElement = fixture.nativeElement.querySelector('tn-button');
    expect(buttonElement).toBeTruthy();
  });

  it('should load harness', fakeAsync(async () => {
    flush();
    const button = await loader.getHarness(TnButtonHarness);
    expect(button).toBeTruthy();
  }));

  describe('getText()', () => {
    it('should get button text', fakeAsync(async () => {
      hostComponent.label.set('Click Me');
      fixture.detectChanges();
      flush();

      const button = await loader.getHarness(TnButtonHarness);
      const text = await button.getText();
      expect(text).toBe('Click Me');
    }));

    it('should get text for different labels', fakeAsync(async () => {
      hostComponent.label.set('Submit Form');
      fixture.detectChanges();
      flush();

      const button = await loader.getHarness(TnButtonHarness);
      expect(await button.getText()).toBe('Submit Form');
    }));
  });

  describe('click()', () => {
    it('should click the button', fakeAsync(async () => {
      flush();
      const button = await loader.getHarness(TnButtonHarness);
      await button.click();
      // Click succeeds without error
      expect(button).toBeTruthy();
    }));
  });

  describe('isDisabled()', () => {
    it('should return false for enabled button', fakeAsync(async () => {
      hostComponent.disabled.set(false);
      fixture.detectChanges();
      flush();

      const button = await loader.getHarness(TnButtonHarness);
      expect(await button.isDisabled()).toBe(false);
    }));

    it('should return true for disabled button', fakeAsync(async () => {
      hostComponent.disabled.set(true);
      fixture.detectChanges();
      flush();

      const button = await loader.getHarness(TnButtonHarness);
      expect(await button.isDisabled()).toBe(true);
    }));
  });

  describe('getColor()', () => {
    it('should return default for default color', fakeAsync(async () => {
      hostComponent.color.set('default');
      fixture.detectChanges();
      flush();

      const button = await loader.getHarness(TnButtonHarness);
      expect(await button.getColor()).toBe('default');
    }));

    it('should return primary for primary color', fakeAsync(async () => {
      hostComponent.color.set('primary');
      fixture.detectChanges();
      flush();

      const button = await loader.getHarness(TnButtonHarness);
      expect(await button.getColor()).toBe('primary');
    }));

    it('should return warn for warn color', fakeAsync(async () => {
      hostComponent.color.set('warn');
      fixture.detectChanges();
      flush();

      const button = await loader.getHarness(TnButtonHarness);
      expect(await button.getColor()).toBe('warn');
    }));

    it('should detect color from outline primary variant', fakeAsync(async () => {
      hostComponent.color.set('primary');
      hostComponent.variant.set('outline');
      fixture.detectChanges();
      flush();

      const button = await loader.getHarness(TnButtonHarness);
      expect(await button.getColor()).toBe('primary');
    }));

    it('should detect color from outline warn variant', fakeAsync(async () => {
      hostComponent.color.set('warn');
      hostComponent.variant.set('outline');
      fixture.detectChanges();
      flush();

      const button = await loader.getHarness(TnButtonHarness);
      expect(await button.getColor()).toBe('warn');
    }));
  });

  describe('getVariant()', () => {
    it('should return filled for filled variant', fakeAsync(async () => {
      hostComponent.variant.set('filled');
      fixture.detectChanges();
      flush();

      const button = await loader.getHarness(TnButtonHarness);
      expect(await button.getVariant()).toBe('filled');
    }));

    it('should return outline for outline variant', fakeAsync(async () => {
      hostComponent.variant.set('outline');
      fixture.detectChanges();
      flush();

      const button = await loader.getHarness(TnButtonHarness);
      expect(await button.getVariant()).toBe('outline');
    }));
  });

  describe('with() filter', () => {
    it('should filter by text content (string)', fakeAsync(async () => {
      hostComponent.label.set('Submit');
      fixture.detectChanges();
      flush();

      const button = await loader.getHarness(
        TnButtonHarness.with({ text: 'Submit' })
      );
      expect(button).toBeTruthy();
    }));

    it('should filter by text content (regex)', fakeAsync(async () => {
      hostComponent.label.set('Save Changes');
      fixture.detectChanges();
      flush();

      const button = await loader.getHarness(
        TnButtonHarness.with({ text: /Save/ })
      );
      expect(button).toBeTruthy();
    }));

    it('should filter by text content (case-insensitive regex)', fakeAsync(async () => {
      hostComponent.label.set('Cancel');
      fixture.detectChanges();
      flush();

      const button = await loader.getHarness(
        TnButtonHarness.with({ text: /cancel/i })
      );
      expect(button).toBeTruthy();
    }));

    it('should filter by disabled state (false)', fakeAsync(async () => {
      hostComponent.disabled.set(false);
      fixture.detectChanges();
      flush();

      const button = await loader.getHarness(
        TnButtonHarness.with({ disabled: false })
      );
      expect(button).toBeTruthy();
    }));

    it('should filter by disabled state (true)', fakeAsync(async () => {
      hostComponent.disabled.set(true);
      fixture.detectChanges();
      flush();

      const button = await loader.getHarness(
        TnButtonHarness.with({ disabled: true })
      );
      expect(button).toBeTruthy();
    }));

    it('should combine multiple filters', fakeAsync(async () => {
      hostComponent.label.set('Delete');
      hostComponent.disabled.set(false);
      fixture.detectChanges();
      flush();

      const button = await loader.getHarness(
        TnButtonHarness.with({ text: 'Delete', disabled: false })
      );
      expect(button).toBeTruthy();
    }));
  });

  describe('existence checks', () => {
    it('should check if harness exists', fakeAsync(async () => {
      hostComponent.label.set('Test');
      fixture.detectChanges();
      flush();

      expect(await loader.hasHarness(TnButtonHarness)).toBe(true);
    }));

    it('should return false when filtered harness does not exist', fakeAsync(async () => {
      hostComponent.label.set('Test');
      fixture.detectChanges();
      flush();

      expect(await loader.hasHarness(TnButtonHarness)).toBe(true);
      expect(await loader.hasHarness(
        TnButtonHarness.with({ text: 'NonExistentText12345' })
      )).toBe(false);
    }));
  });
});
