import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TnCheckboxComponent, TnCheckboxLabelDirective } from './checkbox.component';
import { TnCheckboxHarness } from './checkbox.harness';

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnCheckboxComponent, TnCheckboxLabelDirective, ReactiveFormsModule],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-checkbox
      testId="test-checkbox"
      [label]="label()"
      [disabled]="disabled()"
      [required]="required()"
      [indeterminate]="indeterminate()"
      [error]="error()"
      [hideLabel]="hideLabel()"
      [formControl]="control"
      (change)="lastChange = $event" />

    <tn-checkbox
      label="Second checkbox"
      testId="second-checkbox"
      [formControl]="secondControl" />

    <tn-checkbox testId="terms-checkbox" [formControl]="termsControl">
      <span tnCheckboxLabel>I agree to the <a href="/terms">Terms</a></span>
    </tn-checkbox>
  `
})
class TestHostComponent {
  label = signal('Accept terms');
  disabled = signal(false);
  required = signal(false);
  indeterminate = signal(false);
  hideLabel = signal(false);
  error = signal<string | null>(null);
  control = new FormControl(false);
  secondControl = new FormControl(false);
  termsControl = new FormControl(false);
  lastChange: boolean | null = null;
}

describe('TnCheckboxHarness', () => {
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
    const checkbox = await loader.getHarness(TnCheckboxHarness);
    expect(checkbox).toBeTruthy();
  });

  describe('with() filter', () => {
    it('should filter by exact label text', async () => {
      const checkbox = await loader.getHarness(
        TnCheckboxHarness.with({ label: 'Accept terms' })
      );
      expect(checkbox).toBeTruthy();
    });

    it('should filter by label regex', async () => {
      const checkbox = await loader.getHarness(
        TnCheckboxHarness.with({ label: /accept/i })
      );
      expect(checkbox).toBeTruthy();
    });

    it('should filter by testId', async () => {
      const checkbox = await loader.getHarness(
        TnCheckboxHarness.with({ testId: 'second-checkbox' })
      );
      expect(await checkbox.getLabelText()).toBe('Second checkbox');
    });
  });

  describe('getLabelText', () => {
    it('should return the label text', async () => {
      const checkbox = await loader.getHarness(
        TnCheckboxHarness.with({ testId: 'test-checkbox' })
      );
      expect(await checkbox.getLabelText()).toBe('Accept terms');
    });

    it('should return projected label content', async () => {
      const checkbox = await loader.getHarness(
        TnCheckboxHarness.with({ testId: 'terms-checkbox' })
      );
      const text = await checkbox.getLabelText();
      expect(text).toContain('I agree to the');
      expect(text).toContain('Terms');
    });

    it('should reflect updated label', async () => {
      hostComponent.label.set('New label');
      const checkbox = await loader.getHarness(
        TnCheckboxHarness.with({ testId: 'test-checkbox' })
      );
      expect(await checkbox.getLabelText()).toBe('New label');
    });
  });

  describe('isChecked / check / uncheck / toggle', () => {
    it('should be unchecked initially', async () => {
      const checkbox = await loader.getHarness(
        TnCheckboxHarness.with({ testId: 'test-checkbox' })
      );
      expect(await checkbox.isChecked()).toBe(false);
    });

    it('should check the checkbox', async () => {
      const checkbox = await loader.getHarness(
        TnCheckboxHarness.with({ testId: 'test-checkbox' })
      );
      await checkbox.check();
      expect(await checkbox.isChecked()).toBe(true);
    });

    it('should uncheck the checkbox', async () => {
      const checkbox = await loader.getHarness(
        TnCheckboxHarness.with({ testId: 'test-checkbox' })
      );
      await checkbox.check();
      await checkbox.uncheck();
      expect(await checkbox.isChecked()).toBe(false);
    });

    it('should toggle the checkbox', async () => {
      const checkbox = await loader.getHarness(
        TnCheckboxHarness.with({ testId: 'test-checkbox' })
      );
      await checkbox.toggle();
      expect(await checkbox.isChecked()).toBe(true);
      await checkbox.toggle();
      expect(await checkbox.isChecked()).toBe(false);
    });

    it('should be a no-op when checking an already checked checkbox', async () => {
      const checkbox = await loader.getHarness(
        TnCheckboxHarness.with({ testId: 'test-checkbox' })
      );
      await checkbox.check();
      await checkbox.check();
      expect(await checkbox.isChecked()).toBe(true);
    });

    it('should be a no-op when unchecking an already unchecked checkbox', async () => {
      const checkbox = await loader.getHarness(
        TnCheckboxHarness.with({ testId: 'test-checkbox' })
      );
      await checkbox.uncheck();
      expect(await checkbox.isChecked()).toBe(false);
    });

    it('should update form control value', async () => {
      const checkbox = await loader.getHarness(
        TnCheckboxHarness.with({ testId: 'test-checkbox' })
      );
      await checkbox.check();
      expect(hostComponent.control.value).toBe(true);

      await checkbox.uncheck();
      expect(hostComponent.control.value).toBe(false);
    });

  });

  describe('isDisabled', () => {
    it('should return false when enabled', async () => {
      const checkbox = await loader.getHarness(
        TnCheckboxHarness.with({ testId: 'test-checkbox' })
      );
      expect(await checkbox.isDisabled()).toBe(false);
    });

    it('should return true when disabled via input', async () => {
      hostComponent.disabled.set(true);
      const checkbox = await loader.getHarness(
        TnCheckboxHarness.with({ testId: 'test-checkbox' })
      );
      expect(await checkbox.isDisabled()).toBe(true);
    });

    it('should return true when disabled via form control', async () => {
      hostComponent.control.disable();
      const checkbox = await loader.getHarness(
        TnCheckboxHarness.with({ testId: 'test-checkbox' })
      );
      expect(await checkbox.isDisabled()).toBe(true);
    });
  });

  describe('isRequired', () => {
    it('should return false by default', async () => {
      const checkbox = await loader.getHarness(
        TnCheckboxHarness.with({ testId: 'test-checkbox' })
      );
      expect(await checkbox.isRequired()).toBe(false);
    });

    it('should return true when required', async () => {
      hostComponent.required.set(true);
      const checkbox = await loader.getHarness(
        TnCheckboxHarness.with({ testId: 'test-checkbox' })
      );
      expect(await checkbox.isRequired()).toBe(true);
    });
  });

  describe('isIndeterminate', () => {
    it('should return false by default', async () => {
      const checkbox = await loader.getHarness(
        TnCheckboxHarness.with({ testId: 'test-checkbox' })
      );
      expect(await checkbox.isIndeterminate()).toBe(false);
    });

    it('should return true when indeterminate', async () => {
      hostComponent.indeterminate.set(true);
      const checkbox = await loader.getHarness(
        TnCheckboxHarness.with({ testId: 'test-checkbox' })
      );
      expect(await checkbox.isIndeterminate()).toBe(true);
    });
  });

  describe('getTestId', () => {
    it('should return the test ID', async () => {
      const checkbox = await loader.getHarness(
        TnCheckboxHarness.with({ label: 'Accept terms' })
      );
      expect(await checkbox.getTestId()).toBe('test-checkbox');
    });
  });

  describe('getErrorText', () => {
    it('should return null when no error', async () => {
      const checkbox = await loader.getHarness(
        TnCheckboxHarness.with({ testId: 'test-checkbox' })
      );
      expect(await checkbox.getErrorText()).toBeNull();
    });

    it('should return error message when error is set', async () => {
      hostComponent.error.set('You must accept the terms');
      const checkbox = await loader.getHarness(
        TnCheckboxHarness.with({ testId: 'test-checkbox' })
      );
      expect(await checkbox.getErrorText()).toBe('You must accept the terms');
    });
  });

  describe('content projection', () => {
    it('should render projected label content with tnCheckboxLabel', async () => {
      const checkbox = await loader.getHarness(
        TnCheckboxHarness.with({ testId: 'terms-checkbox' })
      );
      const text = await checkbox.getLabelText();
      expect(text).toContain('Terms');
    });

    it('should update form control when checkbox with projected label is toggled', async () => {
      const checkbox = await loader.getHarness(
        TnCheckboxHarness.with({ testId: 'terms-checkbox' })
      );
      await checkbox.check();
      expect(hostComponent.termsControl.value).toBe(true);
    });
  });
});
