import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TnRadioGroupComponent } from './radio-group.component';
import type { TnRadioOption } from './radio-group.component';
import { TnRadioGroupHarness } from './radio-group.harness';
import { TnRadioComponent } from './radio.component';
import { TnRadioHarness } from './radio.harness';
import { TnFormFieldComponent } from '../form-field/form-field.component';

interface ObjectValue {
  id: number;
}

@Component({
  selector: 'tn-radio-group-test',
  standalone: true,
  imports: [ReactiveFormsModule, TnRadioGroupComponent, TnRadioComponent, TnFormFieldComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-radio-group
      ariaLabel="Letter"
      testId="letter"
      [formControl]="control"
      [options]="options"
      [inline]="inline()"
      [required]="required()"
      (change)="changes.push($event)" />

    <tn-radio-group
      testId="object"
      [formControl]="objectControl"
      [options]="objectOptions"
      [compareWith]="compareById" />

    <tn-radio-group
      testId="projected"
      ariaLabel="Projected"
      [formControl]="projectedControl"
      (change)="projectedChanges.push($event)">
      <tn-radio label="Gamma" value="c" (change)="projectedOptionChanges.push($event)" />
      <tn-radio label="Delta" value="d" (change)="projectedOptionChanges.push($event)" />
    </tn-radio-group>

    <tn-form-field label="Required letter">
      <tn-radio-group testId="required" [formControl]="requiredControl" [options]="options" />
    </tn-form-field>
  `,
})
class TestHostComponent {
  readonly control = new FormControl<string | null>('a');
  readonly objectControl = new FormControl<ObjectValue | null>(null);
  readonly projectedControl = new FormControl<string | null>('c');
  readonly requiredControl = new FormControl<string | null>(null, Validators.required);

  readonly inline = signal(false);
  readonly required = signal(false);
  readonly changes: (string | null)[] = [];
  readonly projectedChanges: unknown[] = [];
  readonly projectedOptionChanges: unknown[] = [];

  readonly options: TnRadioOption<string>[] = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' },
  ];

  readonly objectOptions: TnRadioOption<ObjectValue>[] = [
    { value: { id: 1 }, label: 'First' },
    { value: { id: 2 }, label: 'Second' },
  ];

  readonly compareById = (a: ObjectValue | null, b: ObjectValue | null): boolean => a?.id === b?.id;
}

describe('TnRadioGroupComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  function letterGroup(): Promise<TnRadioGroupHarness> {
    return loader.getHarness(TnRadioGroupHarness.with({ ariaLabel: 'Letter' }));
  }

  describe('rendering', () => {
    it('renders one radio per option inside a named radiogroup', async () => {
      const group = await letterGroup();

      expect(await group.getOptionLabels()).toEqual(['Alpha', 'Beta']);
      expect(await group.getAriaLabel()).toBe('Letter');
    });

    it('shows the bound control value as the checked option', async () => {
      const group = await letterGroup();

      expect(await group.getCheckedLabel()).toBe('Alpha');
    });

    it('lays the options out in a row only when inline', async () => {
      const root = fixture.nativeElement.querySelector('.tn-radio-group') as HTMLElement;
      expect(root.classList).not.toContain('tn-radio-group--inline');

      host.inline.set(true);
      fixture.detectChanges();

      expect(root.classList).toContain('tn-radio-group--inline');
    });

    it('gives each group its own native name so two never fuse into one', () => {
      const inputs = fixture.nativeElement.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>;
      const letterNames = Array.from(inputs).slice(0, 2).map((input) => input.name);
      const objectNames = Array.from(inputs).slice(2, 4).map((input) => input.name);

      expect(new Set(letterNames).size).toBe(1);
      expect(letterNames[0]).not.toBe(objectNames[0]);
    });
  });

  describe('selection', () => {
    it('writes the picked option back to the bound control and emits it', async () => {
      const group = await letterGroup();
      await group.select('Beta');

      expect(host.control.value).toBe('b');
      expect(host.changes).toEqual(['b']);
    });

    it('re-renders the checked option after the control is reset to a previously picked value', async () => {
      // The bug a per-option accessor has: Angular suppresses the model->view write on whichever
      // accessor originated the change, so Alpha used to stay rendered as checked forever.
      const group = await letterGroup();
      await group.select('Beta');

      host.control.setValue('a');
      fixture.detectChanges();

      expect(await group.getCheckedLabel()).toBe('Alpha');
    });

    it('does not emit a transient value to the control on a programmatic write', () => {
      const emitted: (string | null)[] = [];
      host.control.valueChanges.subscribe((value) => emitted.push(value));

      host.control.setValue('b');
      fixture.detectChanges();

      expect(emitted).toEqual(['b']);
    });

    it('marks the control touched on a pick', async () => {
      expect(host.control.touched).toBe(false);

      await (await letterGroup()).select('Beta');

      expect(host.control.touched).toBe(true);
    });

    it('matches object values through compareWith', async () => {
      // A structurally equal but distinct object — identity alone would render nothing as checked.
      host.objectControl.setValue({ id: 2 });
      fixture.detectChanges();

      const group = await loader.getHarness(TnRadioGroupHarness.with({ testId: 'radio-group-object' }));

      expect(await group.getCheckedLabel()).toBe('Second');
    });
  });

  describe('projected options', () => {
    it('drives projected tn-radio children the same as rendered ones', async () => {
      const group = await loader.getHarness(TnRadioGroupHarness.with({ ariaLabel: 'Projected' }));

      expect(await group.getCheckedLabel()).toBe('Gamma');

      await group.select('Delta');

      expect(host.projectedControl.value).toBe('d');
      expect(await group.getCheckedLabel()).toBe('Delta');
    });

    it('emits the pick once, from the group rather than the option', async () => {
      // A projected radio carries its own (change) output; inside a group the group's output is
      // the single public event, so binding both must not deliver the pick twice.
      const group = await loader.getHarness(TnRadioGroupHarness.with({ ariaLabel: 'Projected' }));
      await group.select('Delta');

      expect(host.projectedChanges).toEqual(['d']);
      expect(host.projectedOptionChanges).toEqual([]);
    });
  });

  describe('disabled state', () => {
    it('disables every option when the bound control is disabled', async () => {
      host.control.disable();
      fixture.detectChanges();

      expect(await (await letterGroup()).isDisabled()).toBe(true);
    });

    it('ignores picks while disabled', async () => {
      host.control.disable();
      fixture.detectChanges();

      const beta = await loader.getHarness(TnRadioHarness.with({ label: 'Beta' }));
      await beta.check();

      expect(host.control.value).toBe('a');
      expect(await beta.isChecked()).toBe(false);
    });
  });

  describe('test ids', () => {
    it('scopes each option id with the group base', () => {
      expect(fixture.nativeElement.querySelector('[data-testid="radio-letter-alpha"]')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('[data-testid="radio-letter-beta"]')).toBeTruthy();
    });

    it('puts the base on the group root too', () => {
      expect(fixture.nativeElement.querySelector('[data-testid="radio-group-letter"]')).toBeTruthy();
    });
  });

  describe('inside a tn-form-field', () => {
    it('takes its accessible name from the field label rather than repeating it', async () => {
      const group = await loader.getHarness(TnRadioGroupHarness.with({ testId: 'radio-group-required' }));

      expect(await group.getAriaLabel()).toBeNull();

      const labelledBy = await group.getAriaLabelledBy();
      const label = fixture.nativeElement.querySelector(`#${labelledBy}`) as HTMLElement;

      expect(label.textContent).toContain('Required letter');
    });

    it('announces the required state inferred from the control', async () => {
      const group = await loader.getHarness(TnRadioGroupHarness.with({ testId: 'radio-group-required' }));
      const root = fixture.nativeElement.querySelector('tn-form-field .tn-radio-group') as HTMLElement;

      expect(root.getAttribute('aria-required')).toBe('true');
      expect(await group.getCheckedLabel()).toBeNull();
    });

    it('renders the native required attribute only for the explicit input', () => {
      const letterInputs = () => Array.from(
        fixture.nativeElement.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>
      ).slice(0, 2);

      expect(letterInputs().some((input) => input.required)).toBe(false);

      host.required.set(true);
      fixture.detectChanges();

      expect(letterInputs().every((input) => input.required)).toBe(true);
    });

    it('leaves the options free of the native required attribute', () => {
      // Native constraint validation on a radio blocks submission with a browser popup, which is
      // not what attaching Validators.required asks for — only the explicit `required` input opts
      // into it.
      const field = fixture.nativeElement.querySelector('tn-form-field') as HTMLElement;
      const inputs = field.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>;

      expect(inputs.length).toBe(2);
      expect(Array.from(inputs).some((input) => input.required)).toBe(false);
    });

    it('renders the field validation message once the group is touched', () => {
      const field = fixture.nativeElement.querySelector('tn-form-field') as HTMLElement;
      expect(field.querySelector('.tn-form-field-error')).toBeNull();

      host.requiredControl.markAsTouched();
      host.requiredControl.updateValueAndValidity();
      fixture.detectChanges();

      // The trap a hand-rolled group has: a required group blocks submission with nothing on
      // screen to explain it, because the field never sees an NgControl to read errors from.
      expect(field.querySelector('.tn-form-field-error')?.textContent?.trim()).toBeTruthy();
    });
  });
});
