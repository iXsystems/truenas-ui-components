import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TnFormFieldComponent } from './form-field.component';
import { TnFormFieldHarness } from './form-field.harness';
import { TnInputComponent } from '../input/input.component';

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnFormFieldComponent, TnInputComponent, ReactiveFormsModule],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-form-field label="Name" testId="name-field" [required]="true">
      <tn-input [formControl]="nameControl" />
    </tn-form-field>

    <tn-form-field label="Email" testId="email-field" hint="We'll never share your email">
      <tn-input [formControl]="emailControl" />
    </tn-form-field>

    <tn-form-field label="Optional" testId="optional-field">
      <tn-input [formControl]="optionalControl" />
    </tn-form-field>
  `
})
class TestHostComponent {
  nameControl = new FormControl('', Validators.required);
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  optionalControl = new FormControl('');
}

describe('TnFormFieldHarness', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load harness', async () => {
    const field = await loader.getHarness(TnFormFieldHarness);
    expect(field).toBeTruthy();
  });

  describe('with() filter', () => {
    it('should filter by exact label text', async () => {
      const field = await loader.getHarness(
        TnFormFieldHarness.with({ label: 'Name' })
      );
      expect(field).toBeTruthy();
      expect(await field.getLabel()).toBe('Name');
    });

    it('should filter by label regex', async () => {
      const field = await loader.getHarness(
        TnFormFieldHarness.with({ label: /email/i })
      );
      expect(await field.getLabel()).toBe('Email');
    });

    it('should filter by testId', async () => {
      const field = await loader.getHarness(
        TnFormFieldHarness.with({ testId: 'email-field' })
      );
      expect(await field.getLabel()).toBe('Email');
    });

    it('should find all form fields', async () => {
      const fields = await loader.getAllHarnesses(TnFormFieldHarness);
      expect(fields.length).toBe(3);
    });
  });

  describe('getLabel', () => {
    it('should return the label text', async () => {
      const field = await loader.getHarness(
        TnFormFieldHarness.with({ testId: 'name-field' })
      );
      expect(await field.getLabel()).toBe('Name');
    });

    it('should strip required asterisk from label text', async () => {
      const field = await loader.getHarness(
        TnFormFieldHarness.with({ testId: 'name-field' })
      );
      const label = await field.getLabel();
      expect(label).not.toContain('*');
      expect(label).toBe('Name');
    });
  });

  describe('isRequired', () => {
    it('should return true for required fields', async () => {
      const field = await loader.getHarness(
        TnFormFieldHarness.with({ label: 'Name' })
      );
      expect(await field.isRequired()).toBe(true);
    });

    it('should return false for optional fields', async () => {
      const field = await loader.getHarness(
        TnFormFieldHarness.with({ label: 'Optional' })
      );
      expect(await field.isRequired()).toBe(false);
    });
  });

  describe('getHint', () => {
    it('should return hint text when visible', async () => {
      const field = await loader.getHarness(
        TnFormFieldHarness.with({ label: 'Email' })
      );
      expect(await field.getHint()).toBe("We'll never share your email");
    });

    it('should return null when no hint', async () => {
      const field = await loader.getHarness(
        TnFormFieldHarness.with({ label: 'Name' })
      );
      expect(await field.getHint()).toBeNull();
    });
  });

  describe('error state', () => {
    it('should not show error on pristine control', async () => {
      const field = await loader.getHarness(
        TnFormFieldHarness.with({ label: 'Name' })
      );
      expect(await field.hasError()).toBe(false);
      expect(await field.getErrorMessage()).toBeNull();
    });

    it('should show error after control is touched', async () => {
      const host = fixture.componentInstance;
      host.nameControl.markAsTouched();
      host.nameControl.updateValueAndValidity();
      fixture.detectChanges();

      const field = await loader.getHarness(
        TnFormFieldHarness.with({ label: 'Name' })
      );
      expect(await field.hasError()).toBe(true);
      expect(await field.getErrorMessage()).toBe('This field is required');
    });

    it('should show email error for invalid email', async () => {
      const host = fixture.componentInstance;
      host.emailControl.setValue('not-an-email');
      host.emailControl.markAsTouched();
      host.emailControl.updateValueAndValidity();
      fixture.detectChanges();

      const field = await loader.getHarness(
        TnFormFieldHarness.with({ label: 'Email' })
      );
      expect(await field.hasError()).toBe(true);
      expect(await field.getErrorMessage()).toBe('Please enter a valid email address');
    });

    it('should hide hint when error is showing', async () => {
      const host = fixture.componentInstance;
      host.emailControl.markAsTouched();
      host.emailControl.updateValueAndValidity();
      fixture.detectChanges();

      const field = await loader.getHarness(
        TnFormFieldHarness.with({ label: 'Email' })
      );
      expect(await field.hasError()).toBe(true);
      expect(await field.getHint()).toBeNull();
    });

    it('should clear error when value becomes valid', async () => {
      const host = fixture.componentInstance;
      host.nameControl.markAsTouched();
      host.nameControl.updateValueAndValidity();
      fixture.detectChanges();

      let field = await loader.getHarness(
        TnFormFieldHarness.with({ label: 'Name' })
      );
      expect(await field.hasError()).toBe(true);

      host.nameControl.setValue('John');
      fixture.detectChanges();

      field = await loader.getHarness(
        TnFormFieldHarness.with({ label: 'Name' })
      );
      expect(await field.hasError()).toBe(false);
    });
  });

  describe('getTestId', () => {
    it('should return the data-testid value', async () => {
      const field = await loader.getHarness(
        TnFormFieldHarness.with({ label: 'Name' })
      );
      expect(await field.getTestId()).toBe('name-field');
    });
  });
});
