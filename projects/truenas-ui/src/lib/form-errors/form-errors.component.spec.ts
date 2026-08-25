import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import type { AbstractControl, ValidationErrors } from '@angular/forms';
import { TnFormErrorsComponent } from './form-errors.component';
import { TnFormErrorsHarness } from './form-errors.harness';
import { TN_FORM_FIELD_DISMISSIBLE_ERRORS, TN_FORM_FIELD_ERRORS } from '../form-field/form-field.errors';
import type { TnFormFieldErrorMessages, TnFormFieldErrorResolver } from '../form-field/form-field.errors';
import { TnIconTesting } from '../icon/icon-testing';

/** Fails the GROUP, the way a cross-field validator does. */
function bothOrNeither(group: AbstractControl): ValidationErrors | null {
  const first = !!(group.get('first') as FormControl<string>).value;
  const second = !!(group.get('second') as FormControl<string>).value;
  return first === second ? null : { bothOrNeither: true };
}

@Component({
  selector: 'tn-form-errors-host',
  imports: [ReactiveFormsModule, TnFormErrorsComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `<tn-form-errors
    [control]="control()" [errorMessages]="errorMessages()" [showWhenUntouched]="showWhenUntouched()"
    [dismissibleErrors]="dismissibleErrors()" [dismissAriaLabel]="dismissAriaLabel()"
    (dismiss)="dismissed.push($event)"
  />`,
})
class HostComponent {
  readonly group = new FormGroup(
    { first: new FormControl(''), second: new FormControl('') },
    bothOrNeither
  );
  /** A second group, failing on a DIFFERENT key, to switch the input to. */
  readonly other = new FormGroup(
    { only: new FormControl('') },
    (group) => ((group.get('only') as FormControl<string>).value ? null : { required: true })
  );

  /** Invalid only in its CHILD — the group itself reports no error. */
  readonly childOnly = new FormGroup({ only: new FormControl('', Validators.required) });

  readonly control = signal<AbstractControl>(this.group);
  readonly errorMessages = signal<TnFormFieldErrorMessages>({});
  readonly showWhenUntouched = signal(false);
  readonly dismissibleErrors = signal<readonly string[] | undefined>([]);
  readonly dismissAriaLabel = signal<string | undefined>(undefined);
  readonly dismissed: string[] = [];
}

describe('TnFormErrorsComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let loader: HarnessLoader;
  let errors: TnFormErrorsHarness;

  async function setUp(
    resolver?: TnFormFieldErrorResolver,
    appWideDismissible?: readonly string[]
  ): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        TnIconTesting.jest.providers(),
        ...(resolver ? [{ provide: TN_FORM_FIELD_ERRORS, useValue: resolver }] : []),
        ...(appWideDismissible
          ? [{ provide: TN_FORM_FIELD_DISMISSIBLE_ERRORS, useValue: appWideDismissible }]
          : []),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
    errors = await loader.getHarness(TnFormErrorsHarness);
  }

  /** Puts the group in the failing state without touching it. */
  function invalidate(): void {
    host.group.controls.first.setValue('a');
  }

  describe('when to show', () => {
    beforeEach(async () => {
      await setUp();
    });

    it('shows nothing while the group is valid', async () => {
      host.group.markAllAsTouched();
      fixture.detectChanges();

      expect(await errors.hasMessage()).toBe(false);
    });

    it('shows nothing for an invalid group the user has not reached yet', async () => {
      invalidate();
      fixture.detectChanges();

      expect(await errors.hasMessage()).toBe(false);
    });

    it('shows once the group is touched, which is what submitting does', async () => {
      invalidate();
      host.group.markAllAsTouched();
      fixture.detectChanges();

      expect(await errors.getMessage()).toBe('bothOrNeither');
    });

    it('shows once the group is dirty', async () => {
      invalidate();
      host.group.markAsDirty();
      fixture.detectChanges();

      expect(await errors.hasMessage()).toBe(true);
    });

    it('shows an untouched group when asked to, for a form filled in from an API', async () => {
      host.showWhenUntouched.set(true);
      invalidate();
      fixture.detectChanges();

      expect(await errors.hasMessage()).toBe(true);
    });

    it('stops showing when the group becomes valid again', async () => {
      invalidate();
      host.group.markAllAsTouched();
      fixture.detectChanges();
      expect(await errors.hasMessage()).toBe(true);

      host.group.controls.second.setValue('b');
      fixture.detectChanges();

      expect(await errors.hasMessage()).toBe(false);
    });

    it('ignores an error that belongs to a child rather than to the group', async () => {
      host.childOnly.markAllAsTouched();
      host.control.set(host.childOnly);
      fixture.detectChanges();

      // The group is invalid, but `errors` is null — the failure is the
      // child's, and `tn-form-field` is already showing it under that field.
      expect(host.childOnly.invalid).toBe(true);
      expect(await errors.hasMessage()).toBe(false);
    });

    it('follows the control it is pointed at when that changes', async () => {
      invalidate();
      host.group.markAllAsTouched();
      fixture.detectChanges();
      expect(await errors.getMessage()).toBe('bothOrNeither');

      host.other.markAllAsTouched();
      host.control.set(host.other);
      fixture.detectChanges();

      expect(await errors.getMessage()).toBe('This field is required');
    });
  });

  describe('which message', () => {
    it('takes a per-instance override first', async () => {
      await setUp(() => 'from the resolver');
      host.errorMessages.set({ bothOrNeither: 'Fill in both, or neither' });
      invalidate();
      host.group.markAllAsTouched();
      fixture.detectChanges();

      expect(await errors.getMessage()).toBe('Fill in both, or neither');
    });

    it('falls through to the app-wide resolver', async () => {
      await setUp((key) => `resolved:${key}`);
      invalidate();
      host.group.markAllAsTouched();
      fixture.detectChanges();

      expect(await errors.getMessage()).toBe('resolved:bothOrNeither');
    });

    it('falls through to the built-in defaults, so it reads like a field message', async () => {
      await setUp();
      host.other.markAllAsTouched();
      host.control.set(host.other);
      fixture.detectChanges();

      expect(await errors.getMessage()).toBe('This field is required');
    });

    it('renders nothing when every layer declines to name the error', async () => {
      await setUp(() => '   ');
      invalidate();
      host.group.markAllAsTouched();
      fixture.detectChanges();

      // The raw key is the last resort, so there is always something — the
      // point of the case is that a blank resolver answer does not win.
      expect(await errors.getMessage()).toBe('bothOrNeither');
    });
  });

  describe('the message element', () => {
    beforeEach(async () => {
      await setUp();
      invalidate();
      host.group.markAllAsTouched();
      fixture.detectChanges();
    });

    it('is an alert, so assistive technology announces it when it appears', () => {
      expect(fixture.nativeElement.querySelector('.tn-form-errors')?.getAttribute('role'))
        .toBe('alert');
    });

    it('carries an id a control can be described by', () => {
      const id = fixture.nativeElement.querySelector('.tn-form-errors')?.getAttribute('id');

      expect(id).toMatch(/^tn-form-errors-\d+$/);
    });
  });

  describe('dismissing an error', () => {
    /**
     * Attaches a server-side style failure the user cannot edit their way out of.
     * The value is the message itself, which the resolution ladder renders as-is.
     */
    function attachServerError(): void {
      host.group.setErrors({ manualValidateError: 'The pool is offline' });
      host.group.markAllAsTouched();
      fixture.detectChanges();
    }

    beforeEach(async () => {
      await setUp();
    });

    it('leaves an ordinary error undismissable', async () => {
      invalidate();
      host.group.markAllAsTouched();
      fixture.detectChanges();

      expect(await errors.isDismissible()).toBe(false);
    });

    it('offers a dismiss button for a listed error key', async () => {
      host.dismissibleErrors.set(['manualValidateError']);
      attachServerError();

      expect(await errors.isDismissible()).toBe(true);
    });

    it('emits the key of the message that was on screen', async () => {
      host.dismissibleErrors.set(['manualValidateError']);
      attachServerError();

      await errors.dismiss();

      expect(host.dismissed).toEqual(['manualValidateError']);
    });

    it('drops the dismissed key, so the message goes with it', async () => {
      host.dismissibleErrors.set(['manualValidateError']);
      attachServerError();

      await errors.dismiss();
      fixture.detectChanges();

      expect(host.group.errors).toBeNull();
      expect(await errors.hasMessage()).toBe(false);
    });

    it('leaves the group\'s other errors alone', async () => {
      host.dismissibleErrors.set(['manualValidateError']);
      host.group.setErrors({ manualValidateError: 'The pool is offline', bothOrNeither: true });
      host.group.markAllAsTouched();
      fixture.detectChanges();

      await errors.dismiss();
      fixture.detectChanges();

      expect(host.group.errors).toEqual({ bothOrNeither: true });
      expect(await errors.getMessage()).toBe('bothOrNeither');
    });

    it('honours an app-wide default when the instance names no keys', async () => {
      TestBed.resetTestingModule();
      await setUp(undefined, ['manualValidateError']);
      host.dismissibleErrors.set(undefined);
      attachServerError();

      expect(await errors.isDismissible()).toBe(true);
    });

    it('withholds the button when a listed key is not the error being shown', async () => {
      // `required` outranks the custom key, so the message on screen is the
      // required one — and the button would then belong to a message nobody sees.
      host.dismissibleErrors.set(['manualValidateError']);
      host.group.setErrors({ required: true, manualValidateError: 'Nope' });
      host.group.markAllAsTouched();
      fixture.detectChanges();

      expect(await errors.hasMessage()).toBe(true);
      expect(await errors.isDismissible()).toBe(false);
    });

    it('names the button in English by default', async () => {
      host.dismissibleErrors.set(['manualValidateError']);
      attachServerError();

      const button = fixture.nativeElement.querySelector('.tn-form-errors-dismiss button');

      expect(button?.getAttribute('aria-label')).toBe('Dismiss this error');
    });

    it('lets a consumer supply a translated name for the button', async () => {
      // The library ships no localized strings, so an app with an i18n layer has
      // to be able to name the button itself.
      host.dismissibleErrors.set(['manualValidateError']);
      host.dismissAriaLabel.set('Diese Fehlermeldung entfernen');
      attachServerError();

      const button = fixture.nativeElement.querySelector('.tn-form-errors-dismiss button');

      expect(button?.getAttribute('aria-label')).toBe('Diese Fehlermeldung entfernen');
    });

    it('keeps the button out of the alert, so its name is not announced as part of the error', async () => {
      host.dismissibleErrors.set(['manualValidateError']);
      attachServerError();

      const alert = fixture.nativeElement.querySelector('.tn-form-errors');

      expect(alert.querySelector('button')).toBeNull();
      expect(await errors.getMessage()).toBe('The pool is offline');
    });
  });
});
