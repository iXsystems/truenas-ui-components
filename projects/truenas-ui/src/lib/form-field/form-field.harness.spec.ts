import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TnFormFieldComponent } from './form-field.component';
import { TN_FORM_FIELD_ERRORS } from './form-field.errors';
import type { TnFormFieldErrorMessages, TnFormFieldErrorResolver } from './form-field.errors';
import { TnFormFieldHarness } from './form-field.harness';
import { TnInputComponent } from '../input/input.component';

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnFormFieldComponent, TnInputComponent, ReactiveFormsModule],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-form-field label="Name" testId="name" tooltip="Your full legal name" [required]="true">
      <tn-input [formControl]="nameControl" />
    </tn-form-field>

    <tn-form-field label="Email" testId="email" hint="We'll never share your email">
      <tn-input [formControl]="emailControl" />
    </tn-form-field>

    <tn-form-field label="Optional" testId="optional">
      <tn-input [formControl]="optionalControl" />
    </tn-form-field>

    <tn-form-field label="Custom" testId="custom">
      <tn-input [formControl]="customControl" />
    </tn-form-field>

    <tn-form-field label="Fixed" testId="fixed" subscriptSizing="fixed">
      <tn-input [formControl]="fixedControl" />
    </tn-form-field>

    <tn-form-field label="Dynamic" testId="dynamic" subscriptSizing="dynamic" hint="A dynamic hint">
      <tn-input [formControl]="dynamicControl" />
    </tn-form-field>
  `
})
class TestHostComponent {
  nameControl = new FormControl('', Validators.required);
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  optionalControl = new FormControl('');
  customControl = new FormControl('', customValidator());
  fixedControl = new FormControl('');
  dynamicControl = new FormControl('', Validators.required);
}

function customValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;
    if (value && !/\d/.test(value)) {
      return { customPolicy: 'Must contain at least one number' };
    }
    return null;
  };
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
        TnFormFieldHarness.with({ testId: 'form-field-email' })
      );
      expect(await field.getLabel()).toBe('Email');
    });

    it('should find all form fields', async () => {
      const fields = await loader.getAllHarnesses(TnFormFieldHarness);
      expect(fields.length).toBe(6);
    });
  });

  describe('getLabel', () => {
    it('should return the label text', async () => {
      const field = await loader.getHarness(
        TnFormFieldHarness.with({ testId: 'form-field-name' })
      );
      expect(await field.getLabel()).toBe('Name');
    });

    it('should strip required asterisk from label text', async () => {
      const field = await loader.getHarness(
        TnFormFieldHarness.with({ testId: 'form-field-name' })
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

  describe('tooltip', () => {
    it('should report a tooltip when provided', async () => {
      const field = await loader.getHarness(
        TnFormFieldHarness.with({ testId: 'form-field-name' })
      );
      expect(await field.hasTooltip()).toBe(true);
      expect(await field.getTooltip()).toBe('Your full legal name');
    });

    it('should report no tooltip when absent', async () => {
      const field = await loader.getHarness(
        TnFormFieldHarness.with({ label: 'Email' })
      );
      expect(await field.hasTooltip()).toBe(false);
      expect(await field.getTooltip()).toBeNull();
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

    it('should display custom validator error message string', async () => {
      const host = fixture.componentInstance;
      host.customControl.setValue('abc');
      host.customControl.markAsTouched();
      host.customControl.updateValueAndValidity();
      fixture.detectChanges();

      const field = await loader.getHarness(
        TnFormFieldHarness.with({ label: 'Custom' })
      );
      expect(await field.hasError()).toBe(true);
      expect(await field.getErrorMessage()).toBe('Must contain at least one number');
    });
  });

  describe('getTestId', () => {
    it('should return the data-testid value', async () => {
      const field = await loader.getHarness(
        TnFormFieldHarness.with({ label: 'Name' })
      );
      expect(await field.getTestId()).toBe('form-field-name');
    });
  });

  describe('subscriptSizing', () => {
    it('should default to dynamic mode with no subscript when empty', async () => {
      const field = await loader.getHarness(
        TnFormFieldHarness.with({ label: 'Optional' })
      );
      expect(await field.hasSubscript()).toBe(false);
      expect(await field.getSubscriptSizing()).toBe('dynamic');
    });

    it('should always render subscript in fixed mode', async () => {
      const field = await loader.getHarness(
        TnFormFieldHarness.with({ testId: 'form-field-fixed' })
      );
      expect(await field.hasSubscript()).toBe(true);
      expect(await field.getSubscriptSizing()).toBe('fixed');
    });

    it('should render subscript in dynamic mode when hint is present', async () => {
      const field = await loader.getHarness(
        TnFormFieldHarness.with({ testId: 'form-field-dynamic' })
      );
      expect(await field.hasSubscript()).toBe(true);
      expect(await field.getSubscriptSizing()).toBe('dynamic');
      expect(await field.getHint()).toBe('A dynamic hint');
    });

    it('should show error in dynamic mode', async () => {
      const host = fixture.componentInstance;
      host.dynamicControl.markAsTouched();
      host.dynamicControl.updateValueAndValidity();
      fixture.detectChanges();

      const field = await loader.getHarness(
        TnFormFieldHarness.with({ testId: 'form-field-dynamic' })
      );
      expect(await field.hasSubscript()).toBe(true);
      expect(await field.hasError()).toBe(true);
      expect(await field.getErrorMessage()).toBe('This field is required');
    });
  });
});

@Component({
  selector: 'tn-error-messages-host',
  standalone: true,
  imports: [TnFormFieldComponent, TnInputComponent, ReactiveFormsModule],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-form-field label="Name" testId="name-field" [errorMessages]="stringMessages">
      <tn-input [formControl]="nameControl" />
    </tn-form-field>

    <tn-form-field label="Password" testId="password-field" [errorMessages]="fnMessages">
      <tn-input [formControl]="passwordControl" />
    </tn-form-field>

    <tn-form-field label="Unrelated" testId="unrelated-field" [errorMessages]="unrelatedMessages">
      <tn-input [formControl]="unrelatedControl" />
    </tn-form-field>
  `
})
class ErrorMessagesHostComponent {
  nameControl = new FormControl('', Validators.required);
  passwordControl = new FormControl('', Validators.minLength(8));
  unrelatedControl = new FormControl('', Validators.required);

  stringMessages: TnFormFieldErrorMessages = {
    required: 'Please enter a name',
  };

  fnMessages: TnFormFieldErrorMessages = {
    minlength: (err) =>
      `Needs ${(err as { requiredLength: number }).requiredLength} characters`,
  };

  unrelatedMessages: TnFormFieldErrorMessages = {
    somethingElse: 'Never shown',
  };
}

describe('TnFormField per-field errorMessages', () => {
  let fixture: ComponentFixture<ErrorMessagesHostComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorMessagesHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorMessagesHostComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should use a per-field string override instead of the built-in default', async () => {
    const host = fixture.componentInstance;
    host.nameControl.markAsTouched();
    host.nameControl.updateValueAndValidity();
    fixture.detectChanges();

    const field = await loader.getHarness(
      TnFormFieldHarness.with({ testId: 'name-field' })
    );
    expect(await field.getErrorMessage()).toBe('Please enter a name');
  });

  it('should use a per-field function override with interpolated error detail', async () => {
    const host = fixture.componentInstance;
    host.passwordControl.setValue('short');
    host.passwordControl.markAsTouched();
    host.passwordControl.updateValueAndValidity();
    fixture.detectChanges();

    const field = await loader.getHarness(
      TnFormFieldHarness.with({ testId: 'password-field' })
    );
    expect(await field.getErrorMessage()).toBe('Needs 8 characters');
  });

  it('should fall back to the built-in default when errorMessages has no matching key', async () => {
    const host = fixture.componentInstance;
    host.unrelatedControl.markAsTouched();
    host.unrelatedControl.updateValueAndValidity();
    fixture.detectChanges();

    const field = await loader.getHarness(
      TnFormFieldHarness.with({ testId: 'unrelated-field' })
    );
    expect(await field.hasError()).toBe(true);
    expect(await field.getErrorMessage()).toBe('This field is required');
  });

  it('should re-resolve the message when errorMessages changes while the error is shown', async () => {
    const host = fixture.componentInstance;
    host.nameControl.markAsTouched();
    host.nameControl.updateValueAndValidity();
    fixture.detectChanges();

    const field = await loader.getHarness(
      TnFormFieldHarness.with({ testId: 'name-field' })
    );
    expect(await field.getErrorMessage()).toBe('Please enter a name');

    // Change only the overrides (e.g. a locale switch) — no control status change.
    host.stringMessages = { required: 'Updated message' };
    fixture.detectChanges();

    expect(await field.getErrorMessage()).toBe('Updated message');
  });
});

@Component({
  selector: 'tn-resolver-host',
  standalone: true,
  imports: [TnFormFieldComponent, TnInputComponent, ReactiveFormsModule],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-form-field label="Resolved" testId="resolved-field">
      <tn-input [formControl]="resolvedControl" />
    </tn-form-field>

    <tn-form-field label="Overridden" testId="overridden-field" [errorMessages]="overrides">
      <tn-input [formControl]="overriddenControl" />
    </tn-form-field>
  `
})
class ResolverHostComponent {
  resolvedControl = new FormControl('', Validators.required);
  overriddenControl = new FormControl('', Validators.required);

  overrides: TnFormFieldErrorMessages = {
    required: 'Field-level wins',
  };
}

describe('TnFormField global error resolver', () => {
  let fixture: ComponentFixture<ResolverHostComponent>;
  let loader: HarnessLoader;

  const resolver: TnFormFieldErrorResolver = (key) =>
    key === 'required' ? 'Resolved from token' : null;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResolverHostComponent],
      providers: [{ provide: TN_FORM_FIELD_ERRORS, useValue: resolver }],
    }).compileComponents();

    fixture = TestBed.createComponent(ResolverHostComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should use the resolver message instead of the built-in default', async () => {
    const host = fixture.componentInstance;
    host.resolvedControl.markAsTouched();
    host.resolvedControl.updateValueAndValidity();
    fixture.detectChanges();

    const field = await loader.getHarness(
      TnFormFieldHarness.with({ testId: 'resolved-field' })
    );
    expect(await field.getErrorMessage()).toBe('Resolved from token');
  });

  it('should let a per-field override take precedence over the resolver', async () => {
    const host = fixture.componentInstance;
    host.overriddenControl.markAsTouched();
    host.overriddenControl.updateValueAndValidity();
    fixture.detectChanges();

    const field = await loader.getHarness(
      TnFormFieldHarness.with({ testId: 'overridden-field' })
    );
    expect(await field.getErrorMessage()).toBe('Field-level wins');
  });
});
