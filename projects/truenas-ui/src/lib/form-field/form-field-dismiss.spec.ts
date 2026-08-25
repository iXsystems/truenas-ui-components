import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TnFormFieldComponent } from './form-field.component';
import { TN_FORM_FIELD_DISMISSIBLE_ERRORS } from './form-field.errors';
import { TnFormFieldHarness } from './form-field.harness';
import { TnIconTesting } from '../icon/icon-testing';
import { TnInputComponent } from '../input/input.component';

/**
 * Stands in for a server-side rejection: an error handler attaches it to a
 * control the user has already filled in correctly as far as any validator can
 * tell, so nothing they type will clear it.
 */
const SERVER_ERROR = 'manualValidateError';

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnFormFieldComponent, TnInputComponent, ReactiveFormsModule],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-form-field
      label="Image"
      [dismissibleErrors]="dismissibleErrors()"
      [dismissAriaLabel]="dismissAriaLabel()"
      (dismiss)="dismissed.push($event)"
    >
      <tn-input [formControl]="control" />
    </tn-form-field>
  `,
})
class TestHostComponent {
  readonly control = new FormControl('logo.png', Validators.required);
  readonly dismissibleErrors = signal<readonly string[] | undefined>([SERVER_ERROR]);
  readonly dismissAriaLabel = signal<string | undefined>(undefined);
  readonly dismissed: string[] = [];
}

describe('TnFormFieldComponent dismissible errors', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let loader: HarnessLoader;
  let field: TnFormFieldHarness;

  async function setUp(appWideDismissible?: readonly string[]): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        TnIconTesting.jest.providers(),
        ...(appWideDismissible
          ? [{ provide: TN_FORM_FIELD_DISMISSIBLE_ERRORS, useValue: appWideDismissible }]
          : []),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
    field = await loader.getHarness(TnFormFieldHarness);
  }

  beforeEach(async () => {
    await setUp();
  });

  /** Puts the control in the state an error handler leaves it in. */
  function attachServerError(message = 'The pool is offline'): void {
    host.control.setErrors({ [SERVER_ERROR]: message });
    host.control.markAsTouched();
    fixture.detectChanges();
  }

  function dismissButton(): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector('.tn-form-field-error-dismiss button');
  }

  it('leaves an ordinary validation error undismissable', async () => {
    host.control.setValue('');
    host.control.markAsTouched();
    fixture.detectChanges();

    expect(await field.getErrorMessage()).toBe('This field is required');
    expect(await field.isErrorDismissible()).toBe(false);
  });

  it('offers a dismiss button for a listed error key', async () => {
    attachServerError();

    expect(await field.getErrorMessage()).toBe('The pool is offline');
    expect(await field.isErrorDismissible()).toBe(true);
  });

  it('emits the key of the message that was on screen', async () => {
    attachServerError();

    await field.dismissError();

    expect(host.dismissed).toEqual([SERVER_ERROR]);
  });

  it('drops the dismissed key, so the message goes with it', async () => {
    attachServerError();

    await field.dismissError();
    fixture.detectChanges();

    expect(host.control.errors).toBeNull();
    expect(await field.hasError()).toBe(false);
  });

  it('takes sibling dismissible keys with it, so the message cannot come back', async () => {
    // An error handler that spreads one failure across a flag, its message and a
    // legacy alias: leave any of them and the same text renders again.
    host.dismissibleErrors.set([SERVER_ERROR, 'manualValidateErrorMsg', 'ixManualValidateError']);
    host.control.setErrors({
      [SERVER_ERROR]: true,
      manualValidateErrorMsg: 'The pool is offline',
      ixManualValidateError: 'The pool is offline',
    });
    host.control.markAsTouched();
    fixture.detectChanges();

    await field.dismissError();
    fixture.detectChanges();

    expect(host.control.errors).toBeNull();
    expect(await field.hasError()).toBe(false);
  });

  it('leaves the control\'s other errors alone', async () => {
    // Only the key behind the message on screen is the user's to close; a second
    // failure alongside it still has to be dealt with. Both keys are custom, so
    // insertion order decides which is active — the dismissible one.
    host.control.setErrors({ [SERVER_ERROR]: 'The pool is offline', quotaExceeded: 'Out of space' });
    host.control.markAsTouched();
    fixture.detectChanges();

    expect(await field.getErrorMessage()).toBe('The pool is offline');

    await field.dismissError();
    fixture.detectChanges();

    expect(host.control.errors).toEqual({ quotaExceeded: 'Out of space' });
    expect(await field.getErrorMessage()).toBe('Out of space');
  });

  it('withholds the button when a listed key is not the error being shown', async () => {
    // `required` outranks the custom key, so the required message is what is on
    // screen — and the button would then belong to a message nobody can see.
    host.control.setErrors({ required: true, [SERVER_ERROR]: 'Nope' });
    host.control.markAsTouched();
    fixture.detectChanges();

    expect(await field.getErrorMessage()).toBe('This field is required');
    expect(await field.isErrorDismissible()).toBe(false);
  });

  it('shows no button at all until a key is listed', async () => {
    host.dismissibleErrors.set([]);
    attachServerError();

    expect(await field.hasError()).toBe(true);
    expect(await field.isErrorDismissible()).toBe(false);
  });

  describe('the app-wide default', () => {
    it('applies to a field that names no keys of its own', async () => {
      // An app whose server failures always land under the same key wires it
      // once, rather than on each of hundreds of fields.
      TestBed.resetTestingModule();
      await setUp([SERVER_ERROR]);
      host.dismissibleErrors.set(undefined);
      attachServerError();

      expect(await field.isErrorDismissible()).toBe(true);
    });

    it('gives way to a field that names its own', async () => {
      TestBed.resetTestingModule();
      await setUp([SERVER_ERROR]);
      host.dismissibleErrors.set(['somethingElse']);
      attachServerError();

      expect(await field.isErrorDismissible()).toBe(false);
    });

    it('is opted out of with an empty list, which is not the same as unset', async () => {
      TestBed.resetTestingModule();
      await setUp([SERVER_ERROR]);
      host.dismissibleErrors.set([]);
      attachServerError();

      expect(await field.isErrorDismissible()).toBe(false);
    });
  });

  it('names the button in English by default', () => {
    attachServerError();

    expect(dismissButton()?.getAttribute('aria-label')).toBe('Dismiss this error');
  });

  it('lets a consumer supply a translated name for the button', () => {
    // The library ships no localized strings, so an app with an i18n layer has
    // to be able to name the button itself.
    host.dismissAriaLabel.set('Diese Fehlermeldung entfernen');
    attachServerError();

    expect(dismissButton()?.getAttribute('aria-label')).toBe('Diese Fehlermeldung entfernen');
  });

  it('keeps the button out of the alert, so its name is not announced as part of the error', () => {
    attachServerError();

    const alert = fixture.nativeElement.querySelector('.tn-form-field-error');

    expect(alert.getAttribute('role')).toBe('alert');
    expect(alert.querySelector('button')).toBeNull();
  });

  it('hands focus back to the control, rather than losing it with the button', async () => {
    attachServerError();
    const button = dismissButton();
    button?.focus();

    await field.dismissError();
    fixture.detectChanges();

    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('input'));
  });

  it('does not steal focus from elsewhere when the click never focused the button', async () => {
    // Safari leaves a clicked button unfocused; there is no focus to rescue then,
    // and moving it would yank the user out of wherever they actually are.
    attachServerError();
    const elsewhere: HTMLInputElement = document.createElement('input');
    document.body.appendChild(elsewhere);
    elsewhere.focus();

    await field.dismissError();
    fixture.detectChanges();

    expect(document.activeElement).toBe(elsewhere);
    elsewhere.remove();
  });
});
