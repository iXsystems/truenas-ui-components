import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  FormField, form, minLength, required, submit, validate,
} from '@angular/forms/signals';
import type { FieldTree, ValidationError } from '@angular/forms/signals';
import { TnFormFieldComponent } from './form-field.component';
import { TN_FORM_FIELD_DISMISSIBLE_ERRORS, TN_FORM_FIELD_ERRORS } from './form-field.errors';
import { TnFormFieldHarness } from './form-field.harness';
import { TnFormErrorsComponent } from '../form-errors/form-errors.component';
import { TnFormErrorsHarness } from '../form-errors/form-errors.harness';
import { TnFormListItemComponent } from '../form-list/form-list-item.component';
import { TnFormListComponent } from '../form-list/form-list.component';
import { TnIconTesting } from '../icon/icon-testing';
import { TnInputComponent } from '../input/input.component';

/**
 * NAS-145170: the tn-* form components with Angular signal forms' `[formField]`.
 *
 * The `NgControl` Angular provides for a `ControlValueAccessor` bound that way
 * has no `events`, `statusChanges`, `name` or `setErrors`, so before this change
 * `tn-form-field` never showed an error, the `input-<name>` test id fell away,
 * and nothing could be dismissed. Reactive Forms behaviour is covered by the
 * existing specs and pinned once more at the end of this file.
 */

const SERVER = 'server';

function serverError(message: string, field: FieldTree<unknown>): ValidationError.WithOptionalFieldTree {
  return { kind: SERVER, message, fieldTree: field };
}

@Component({
  selector: 'tn-signal-host',
  standalone: true,
  imports: [FormField, TnFormFieldComponent, TnInputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-form-field label="Name" [dismissibleErrors]="[SERVER]" (dismiss)="dismissed.push($event)">
      <tn-input [formField]="fields.name" />
    </tn-form-field>
    <tn-form-field label="SSH port">
      <tn-input [formField]="fields.sshPort" />
    </tn-form-field>
    <tn-form-field label="Alias">
      <tn-input testId="explicit" [formField]="fields.alias" />
    </tn-form-field>
    @for (row of fields.hosts; track row) {
      <tn-form-field label="Host">
        <tn-input [formField]="row.host" />
      </tn-form-field>
    }
  `,
})
class SignalHostComponent {
  protected readonly SERVER = SERVER;
  readonly nameRequired = signal(true);
  readonly dismissed: string[] = [];

  readonly model = signal({
    name: '',
    sshPort: '2222',
    alias: 'abc',
    hosts: [{ host: 'a.example' }],
  });

  readonly fields = form(this.model, (path) => {
    required(path.name, { when: () => this.nameRequired() });
    minLength(path.alias, 3, { message: 'Alias needs three characters' });
    minLength(path.sshPort, 3);
  });
}

describe('tn-form-field with signal forms [formField]', () => {
  let fixture: ComponentFixture<SignalHostComponent>;
  let host: SignalHostComponent;
  let loader: HarnessLoader;

  async function setUp(providers: unknown[] = []): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [SignalHostComponent],
      providers: [TnIconTesting.jest.providers(), ...providers as never[]],
    }).compileComponents();
    fixture = TestBed.createComponent(SignalHostComponent);
    host = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    await settle();
  }

  async function settle(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function field(label: string): Promise<TnFormFieldHarness> {
    return loader.getHarness(TnFormFieldHarness.with({ label }));
  }

  function nameInput(): HTMLInputElement {
    return fixture.nativeElement.querySelector('tn-form-field input') as HTMLInputElement;
  }

  describe('errors', () => {
    beforeEach(() => setUp());

    it('does not greet the user with an error before the field is touched', async () => {
      expect(await (await field('Name')).hasError()).toBe(false);
    });

    it('shows a validation error once the field is touched, and clears it when fixed', async () => {
      host.fields.name().markAsTouched();
      await settle();

      const name = await field('Name');
      expect(await name.getErrorMessage()).toBe('This field is required');
      expect(nameInput().getAttribute('aria-invalid')).toBe('true');

      host.model.update((value) => ({ ...value, name: 'tank' }));
      await settle();

      expect(await name.hasError()).toBe(false);
      expect(nameInput().getAttribute('aria-invalid')).toBeNull();
    });

    it('shows the error after the user types into the field and empties it', async () => {
      const name = await field('Name');
      const input = nameInput();
      input.value = 'x';
      input.dispatchEvent(new Event('input'));
      input.value = '';
      input.dispatchEvent(new Event('input'));
      await settle();

      expect(await name.getErrorMessage()).toBe('This field is required');
    });

    it('follows `required` both ways, so the asterisk goes when the field stops being required', async () => {
      const name = await field('Name');
      expect(await name.isRequired()).toBe(true);

      host.nameRequired.set(false);
      await settle();
      expect(await name.isRequired()).toBe(false);

      host.nameRequired.set(true);
      await settle();
      expect(await name.isRequired()).toBe(true);
    });

    it('gives signal forms\' minLength a readable default message', async () => {
      host.model.update((value) => ({ ...value, sshPort: '22' }));
      host.fields.sshPort().markAsTouched();
      await settle();

      expect(await (await field('SSH port')).getErrorMessage()).toBe('Minimum length is 3');
    });

    it('shows the message a rule was given', async () => {
      host.model.update((value) => ({ ...value, alias: 'ab' }));
      host.fields.alias().markAsTouched();
      await settle();

      expect(await (await field('Alias')).getErrorMessage()).toBe('Alias needs three characters');
    });

    it('shows an error a submit() action attached to the field', async () => {
      host.model.update((value) => ({ ...value, name: 'taken' }));
      await submit(host.fields, () => Promise.resolve([serverError('Name is taken', host.fields.name)]));
      await settle();

      expect(await (await field('Name')).getErrorMessage()).toBe('Name is taken');
    });
  });

  describe('message precedence', () => {
    it('lets a rule\'s own message outrank the app-wide resolver', async () => {
      await setUp([{ provide: TN_FORM_FIELD_ERRORS, useValue: () => 'From the resolver' }]);
      host.model.update((value) => ({ ...value, alias: 'ab' }));
      host.fields.alias().markAsTouched();
      host.fields.name().markAsTouched();
      await settle();

      expect(await (await field('Alias')).getErrorMessage()).toBe('Alias needs three characters');
      // A rule without a message still goes to the resolver.
      expect(await (await field('Name')).getErrorMessage()).toBe('From the resolver');
    });

    it('hands the resolver null, not the stand-in NgControl, for a [formField] control', async () => {
      const resolver = jest.fn(() => 'From the resolver');
      await setUp([{ provide: TN_FORM_FIELD_ERRORS, useValue: resolver }]);
      host.fields.name().markAsTouched();
      await settle();

      expect(await (await field('Name')).getErrorMessage()).toBe('From the resolver');
      expect(resolver).toHaveBeenCalledWith('required', expect.anything(), null);
    });
  });

  describe('dismissing', () => {
    beforeEach(() => setUp());

    async function attachServerError(message = 'The pool is offline', name = 'tank'): Promise<void> {
      // A submit() error stays until its field changes, and submit() skips an
      // invalid form, so each attempt submits a different value.
      host.model.update((value) => ({ ...value, name }));
      await submit(host.fields, () => Promise.resolve([serverError(message, host.fields.name)]));
      await settle();
    }

    it('leaves an ordinary validation error undismissable', async () => {
      host.fields.name().markAsTouched();
      await settle();

      expect(await (await field('Name')).isErrorDismissible()).toBe(false);
    });

    it('hides a dismissed server error, drops aria-invalid and reports the key', async () => {
      await attachServerError();
      const name = await field('Name');
      expect(await name.isErrorDismissible()).toBe(true);

      await name.dismissError();
      await settle();

      expect(await name.hasError()).toBe(false);
      expect(nameInput().getAttribute('aria-invalid')).toBeNull();
      expect(host.dismissed).toEqual([SERVER]);
    });

    it('shows a new server error after an earlier one was dismissed', async () => {
      await attachServerError('First');
      await (await field('Name')).dismissError();
      await settle();

      await attachServerError('Second', 'tank2');

      expect(await (await field('Name')).getErrorMessage()).toBe('Second');
    });

    it('still shows a validation error that appears after the dismissal', async () => {
      await attachServerError();
      await (await field('Name')).dismissError();
      await settle();

      host.model.update((value) => ({ ...value, name: '' }));
      await settle();

      expect(await (await field('Name')).getErrorMessage()).toBe('This field is required');
    });
  });

  describe('test ids', () => {
    beforeEach(() => setUp());

    function testIds(): (string | null)[] {
      return Array.from(fixture.nativeElement.querySelectorAll('tn-form-field input') as NodeListOf<HTMLElement>)
        .map((input) => input.getAttribute('data-testid'));
    }

    it('falls back to the field name, as formControlName does', () => {
      expect(testIds()).toEqual(['input-name', 'input-ssh-port', 'input-explicit', 'input-host']);
    });
  });
});

@Component({
  selector: 'tn-signal-group-host',
  standalone: true,
  imports: [TnFormErrorsComponent, TnFormListComponent, TnFormListItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-form-errors class="schedule" testId="schedule" [control]="fields.schedule" (dismiss)="dismissed.push($event)" />
    <tn-form-list label="Hosts" testId="hosts" [control]="fields.hosts">
      @for (row of fields.hosts; track row) {
        <tn-form-list-item label="Host" />
      }
    </tn-form-list>
  `,
})
class SignalGroupHostComponent {
  readonly dismissed: string[] = [];
  readonly model = signal({
    schedule: { begin: '10:00', end: '09:00' },
    hosts: [] as { host: string }[],
  });

  readonly fields = form(this.model, (path) => {
    validate(path.schedule, ({ value }) => (value().begin < value().end
      ? null
      : { kind: 'order', message: 'Begin must be before end' }));
    validate(path.hosts, ({ value }) => (value().length ? null : { kind: 'minItems', message: 'Add a host' }));
  });
}

describe('tn-form-errors and tn-form-list with a signal forms field', () => {
  let fixture: ComponentFixture<SignalGroupHostComponent>;
  let host: SignalGroupHostComponent;
  let loader: HarnessLoader;

  async function settle(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignalGroupHostComponent],
      providers: [
        TnIconTesting.jest.providers(),
        { provide: TN_FORM_FIELD_DISMISSIBLE_ERRORS, useValue: [SERVER] },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SignalGroupHostComponent);
    host = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    await settle();
  });

  function schedule(): Promise<TnFormErrorsHarness> {
    return loader.getHarness(TnFormErrorsHarness.with({ selector: '.schedule' }));
  }

  function hosts(): Promise<TnFormErrorsHarness> {
    return loader.getHarness(TnFormErrorsHarness.with({ ancestor: 'tn-form-list' }));
  }

  it('renders a group error once the group is touched, and clears it when fixed', async () => {
    expect(await (await schedule()).hasMessage()).toBe(false);

    host.fields.schedule().markAsTouched();
    await settle();
    expect(await (await schedule()).getMessage()).toBe('Begin must be before end');

    host.model.update((value) => ({ ...value, schedule: { begin: '08:00', end: '09:00' } }));
    await settle();
    expect(await (await schedule()).hasMessage()).toBe(false);
  });

  it('renders the array-level error of a tn-form-list', async () => {
    host.fields.hosts().markAsTouched();
    await settle();

    expect(await (await hosts()).getMessage()).toBe('Add a host');
  });

  it('hides a dismissed server error on the group and reports the key', async () => {
    // submit() only runs its action on a valid form.
    host.model.set({ schedule: { begin: '08:00', end: '09:00' }, hosts: [{ host: 'a.example' }] });
    await submit(host.fields, () => Promise.resolve([
      serverError('Overlaps another task', host.fields.schedule),
    ]));
    await settle();

    const errors = await schedule();
    expect(await errors.getMessage()).toBe('Overlaps another task');
    expect(await errors.isDismissible()).toBe(true);

    await errors.dismiss();
    await settle();

    expect(await (await schedule()).hasMessage()).toBe(false);
    expect(host.dismissed).toEqual([SERVER]);
  });
});

@Component({
  selector: 'tn-reactive-host',
  standalone: true,
  imports: [ReactiveFormsModule, TnFormFieldComponent, TnInputComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <tn-form-field label="Name" [dismissibleErrors]="[SERVER]">
      <tn-input [formControl]="control" />
    </tn-form-field>
  `,
})
class ReactiveHostComponent {
  protected readonly SERVER = SERVER;
  readonly control = new FormControl('', Validators.required);
}

describe('tn-form-field with Reactive Forms, unchanged', () => {
  it('still deletes a dismissed error from the control', async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveHostComponent],
      providers: [TnIconTesting.jest.providers()],
    }).compileComponents();
    const fixture = TestBed.createComponent(ReactiveHostComponent);
    fixture.detectChanges();
    const control = fixture.componentInstance.control;
    control.setValue('tank');
    control.setErrors({ [SERVER]: 'The pool is offline' });
    control.markAsTouched();
    fixture.detectChanges();

    const field = await TestbedHarnessEnvironment.loader(fixture).getHarness(TnFormFieldHarness);
    expect(await field.getErrorMessage()).toBe('The pool is offline');

    await field.dismissError();

    expect(control.errors).toBeNull();
    expect(await field.hasError()).toBe(false);
  });

  it('leaves a Reactive error shaped like a signal forms one to the resolver, with the control', async () => {
    const resolver = jest.fn(() => 'From the resolver');
    await TestBed.configureTestingModule({
      imports: [ReactiveHostComponent],
      providers: [TnIconTesting.jest.providers(), { provide: TN_FORM_FIELD_ERRORS, useValue: resolver }],
    }).compileComponents();
    const fixture = TestBed.createComponent(ReactiveHostComponent);
    fixture.detectChanges();
    const control = fixture.componentInstance.control;
    control.setValue('tank');
    control.setErrors({ conflict: { kind: 'conflict', message: 'Own message' } });
    control.markAsTouched();
    fixture.detectChanges();

    const field = await TestbedHarnessEnvironment.loader(fixture).getHarness(TnFormFieldHarness);
    expect(await field.getErrorMessage()).toBe('From the resolver');
    expect(resolver).toHaveBeenCalledWith('conflict', expect.anything(), control);
  });
});
