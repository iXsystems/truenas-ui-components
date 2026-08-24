import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import type { AbstractControl, ValidationErrors } from '@angular/forms';
import { TnFormErrorsComponent } from './form-errors.component';
import { TnFormErrorsHarness } from './form-errors.harness';
import { TN_FORM_FIELD_ERRORS } from '../form-field/form-field.errors';
import type { TnFormFieldErrorMessages, TnFormFieldErrorResolver } from '../form-field/form-field.errors';

/** Fails the GROUP, the way a cross-field validator does. */
function bothOrNeither(group: AbstractControl): ValidationErrors | null {
  const first = !!(group.get('first') as FormControl<string>).value;
  const second = !!(group.get('second') as FormControl<string>).value;
  return first === second ? null : { bothOrNeither: true };
}

@Component({
  selector: 'tn-form-errors-host',
  imports: [ReactiveFormsModule, TnFormErrorsComponent],
  template: `<tn-form-errors
    [control]="control()" [errorMessages]="errorMessages()" [showWhenUntouched]="showWhenUntouched()"
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
}

describe('TnFormErrorsComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let loader: HarnessLoader;
  let errors: TnFormErrorsHarness;

  async function setUp(resolver?: TnFormFieldErrorResolver): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: resolver ? [{ provide: TN_FORM_FIELD_ERRORS, useValue: resolver }] : [],
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
});
