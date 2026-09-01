import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TnCheckboxGroupComponent } from './checkbox-group.component';
import type { TnCheckboxOption } from './checkbox-group.component';
import { TnCheckboxGroupHarness } from './checkbox-group.harness';
import { TnCheckboxHarness } from './checkbox.harness';
import { TnFormFieldComponent } from '../form-field/form-field.component';

interface ObjectValue {
  id: number;
  name?: string;
}

@Component({
  selector: 'tn-checkbox-group-test',
  standalone: true,
  imports: [ReactiveFormsModule, TnCheckboxGroupComponent, TnFormFieldComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-checkbox-group
      ariaLabel="Letters"
      testId="letters"
      [formControl]="control"
      [options]="options"
      [inline]="inline()"
      [disabled]="disabled()"
      (change)="changes.push($event)" />

    <tn-checkbox-group
      testId="objects"
      ariaLabel="Objects"
      [formControl]="objectControl"
      [options]="objectOptions"
      [compareWith]="compareById" />

    <tn-form-field label="Required letters">
      <tn-checkbox-group testId="required" [formControl]="requiredControl" [options]="options" />
    </tn-form-field>

    <tn-checkbox-group testId="standalone-required" ariaLabel="Standalone" [required]="true" [options]="options" />
  `,
})
class TestHostComponent {
  readonly control = new FormControl<string[]>(['a']);
  readonly objectControl = new FormControl<ObjectValue[]>([]);
  readonly requiredControl = new FormControl<string[]>([], Validators.required);

  readonly inline = signal(false);
  readonly disabled = signal(false);
  readonly changes: string[][] = [];

  readonly options: TnCheckboxOption<string>[] = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' },
    { value: 'c', label: 'Gamma', disabled: true },
  ];

  readonly objectOptions: TnCheckboxOption<ObjectValue>[] = [
    { value: { id: 1 }, label: 'First' },
    { value: { id: 2 }, label: 'Second' },
  ];

  readonly compareById = (a: ObjectValue | null, b: ObjectValue | null): boolean => a?.id === b?.id;
}

@Component({
  selector: 'tn-checkbox-group-fallback-test',
  standalone: true,
  imports: [ReactiveFormsModule, TnCheckboxGroupComponent],
  template: `
    <form [formGroup]="form">
      <tn-checkbox-group formControlName="usbDevices" ariaLabel="USB" [options]="options" />
    </form>
  `,
})
class FallbackHostComponent {
  readonly form = new FormGroup({ usbDevices: new FormControl<string[]>([]) });

  readonly options: TnCheckboxOption<string>[] = [{ value: 'usb_1_1', label: 'Web Cam' }];
}

describe('TnCheckboxGroupComponent', () => {
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

  function letters(): Promise<TnCheckboxGroupHarness> {
    return loader.getHarness(TnCheckboxGroupHarness.with({ ariaLabel: 'Letters' }));
  }

  it('renders one checkbox per option', async () => {
    const group = await letters();
    expect(await group.getOptionLabels()).toEqual(['Alpha', 'Beta', 'Gamma']);
  });

  it('renders the bound array as the checked set', async () => {
    const group = await letters();
    expect(await group.getValue()).toEqual(['Alpha']);
  });

  it('adds a value to the control when an option is checked', async () => {
    const group = await letters();
    await group.toggle('Beta');

    expect(host.control.value).toEqual(['a', 'b']);
    expect(host.changes).toEqual([['a', 'b']]);
  });

  it('removes a value from the control when an option is unchecked', async () => {
    const group = await letters();
    await group.toggle('Alpha');

    expect(host.control.value).toEqual([]);
  });

  // The value is rebuilt in `options` order, so the same checked set always produces the same
  // array however the user got there — a payload diff (and a spec asserting one) stays stable.
  it('emits values in option order, not in click order', async () => {
    host.control.setValue([]);
    fixture.detectChanges();

    const group = await letters();
    await group.toggle('Beta');
    await group.toggle('Alpha');

    expect(host.control.value).toEqual(['a', 'b']);
  });

  it('keeps written values that no longer match an option', async () => {
    host.control.setValue(['a', 'gone']);
    fixture.detectChanges();

    const group = await letters();
    await group.toggle('Beta');

    expect(host.control.value).toEqual(['a', 'b', 'gone']);
  });

  it('replaces the checked set through the harness', async () => {
    const group = await letters();
    await group.setValue(['Beta']);

    expect(host.control.value).toEqual(['b']);
    expect(await group.getValue()).toEqual(['Beta']);
  });

  it('reflects a programmatic write without emitting a change', async () => {
    host.control.setValue(['a', 'b']);
    fixture.detectChanges();

    const group = await letters();
    expect(await group.getValue()).toEqual(['Alpha', 'Beta']);
    expect(host.changes).toEqual([]);
  });

  it('disables a single option without disabling the group', async () => {
    const group = await letters();
    const options = await group.getOptions();

    expect(await options[2].isDisabled()).toBe(true);
    expect(await group.isDisabled()).toBe(false);
  });

  it('disables every option when the group is disabled', async () => {
    host.disabled.set(true);
    fixture.detectChanges();

    const group = await letters();
    expect(await group.isDisabled()).toBe(true);
  });

  it('disables every option when the bound control is disabled', async () => {
    host.control.disable();
    fixture.detectChanges();

    const group = await letters();
    expect(await group.isDisabled()).toBe(true);
  });

  it('marks the control touched on toggle', async () => {
    expect(host.control.touched).toBe(false);

    const group = await letters();
    await group.toggle('Beta');

    expect(host.control.touched).toBe(true);
  });

  // Toggling touches the control on its own, so this has to blur the group for real to cover
  // `onFocusOut` — a harness toggle dispatches mousedown/mouseup/click and moves no focus.
  it('marks the control touched when focus leaves the group', () => {
    expect(host.control.touched).toBe(false);

    const root = fixture.nativeElement.querySelector('.tn-checkbox-group') as HTMLElement;
    root.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));

    expect(host.control.touched).toBe(true);
  });

  it('matches object values through compareWith', async () => {
    host.objectControl.setValue([{ id: 2 }]);
    fixture.detectChanges();

    const group = await loader.getHarness(TnCheckboxGroupHarness.with({ ariaLabel: 'Objects' }));
    expect(await group.getValue()).toEqual(['Second']);

    await group.toggle('First');
    expect(host.objectControl.value).toEqual([{ id: 1 }, { id: 2 }]);
  });

  // Only newly checked options contribute the option's own value; an already-selected one is
  // re-emitted as the object the consumer wrote, so properties outside `compareWith`'s reach
  // survive an unrelated toggle.
  it('keeps the selected value objects the consumer wrote', async () => {
    const loaded: ObjectValue = { id: 2, name: 'usb-cam' };
    host.objectControl.setValue([loaded]);
    fixture.detectChanges();

    const group = await loader.getHarness(TnCheckboxGroupHarness.with({ ariaLabel: 'Objects' }));
    await group.toggle('First');

    expect(host.objectControl.value).toEqual([{ id: 1 }, loaded]);
    expect(host.objectControl.value?.[1]).toBe(loaded);
  });

  it('lays the options out in a wrapping row when inline', async () => {
    host.inline.set(true);
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector('.tn-checkbox-group') as HTMLElement;
    expect(root.classList).toContain('tn-checkbox-group--inline');
  });

  describe('accessibility', () => {
    it('groups the options under role="group"', async () => {
      const root = fixture.nativeElement.querySelector('.tn-checkbox-group') as HTMLElement;
      expect(root.getAttribute('role')).toBe('group');
    });

    it('names the group from its own ariaLabel when standalone', async () => {
      const group = await letters();
      expect(await group.getAriaLabel()).toBe('Letters');
      expect(await group.getAriaLabelledBy()).toBeNull();
    });

    it('delegates the name to an enclosing tn-form-field label', async () => {
      const group = await loader.getHarness(
        TnCheckboxGroupHarness.with({ testId: 'checkbox-group-required' })
      );
      expect(await group.getAriaLabel()).toBeNull();
      expect(await group.getAriaLabelledBy()).toBeTruthy();
    });

    // `role="group"` supports only the globals plus aria-activedescendant/aria-disabled, so an
    // `aria-required` there would be dropped by assistive tech: the state rides in the name.
    it('folds the field-inferred required state into the accessible name', () => {
      const root = fixture.nativeElement.querySelector(
        '[data-testid="checkbox-group-required"]'
      ) as HTMLElement;

      expect(root.getAttribute('aria-required')).toBeNull();

      const ids = root.getAttribute('aria-labelledby')?.split(' ') ?? [];
      const name = ids.map((id) => document.getElementById(id)?.textContent?.trim()).join(' ');
      expect(name).toBe('Required letters required');
    });

    it('folds the required state into an explicit ariaLabel when standalone', () => {
      const root = fixture.nativeElement.querySelector(
        '[data-testid="checkbox-group-standalone-required"]'
      ) as HTMLElement;

      expect(root.getAttribute('aria-required')).toBeNull();
      expect(root.getAttribute('aria-labelledby')).toBeNull();
      expect(root.getAttribute('aria-label')).toBe('Standalone required');
    });

    // Native `required` on a checkbox demands that checkbox, not one of the set — see the
    // `required` input's docblock.
    it('does not propagate required to the options themselves', async () => {
      const checkboxes = await loader.getAllHarnesses(
        TnCheckboxHarness.with({ testId: 'checkbox-required-alpha' })
      );
      expect(await checkboxes[0].isRequired()).toBe(false);
    });

    it('announces the disabled state on the group', async () => {
      host.disabled.set(true);
      fixture.detectChanges();

      const root = fixture.nativeElement.querySelector('.tn-checkbox-group') as HTMLElement;
      expect(root.getAttribute('aria-disabled')).toBe('true');
    });
  });

  describe('test ids', () => {
    it('writes the group base under the checkbox-group prefix', async () => {
      const group = await letters();
      expect(await group.getTestId()).toBe('checkbox-group-letters');
    });

    it('scopes each option by its label under the checkbox prefix', async () => {
      const group = await letters();
      const options = await group.getOptions();

      expect(await Promise.all(options.map((option) => option.getTestId()))).toEqual([
        'checkbox-letters-alpha',
        'checkbox-letters-beta',
        'checkbox-letters-gamma',
      ]);
    });

    it('falls back to the bound control name when testId is unset', async () => {
      const fallback = TestBed.createComponent(FallbackHostComponent);
      fallback.detectChanges();
      const fallbackLoader = TestbedHarnessEnvironment.loader(fallback);

      const group = await fallbackLoader.getHarness(TnCheckboxGroupHarness);
      expect(await group.getTestId()).toBe('checkbox-group-usb-devices');

      const options = await group.getOptions();
      expect(await options[0].getTestId()).toBe('checkbox-usb-devices-web-cam');
    });
  });
});
