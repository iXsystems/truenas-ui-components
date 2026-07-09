import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TnFormFieldComponent } from './form-field.component';
import { TnAutocompleteComponent } from '../autocomplete/autocomplete.component';
import { TnChipInputComponent } from '../chip-input/chip-input.component';
import { TnIconTesting } from '../icon/icon-testing';
import { TnInputComponent } from '../input/input.component';
import { TnSelectComponent } from '../select/select.component';

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [
    TnFormFieldComponent,
    TnInputComponent,
    TnChipInputComponent,
    TnAutocompleteComponent,
    TnSelectComponent,
    ReactiveFormsModule,
  ],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-form-field label="Name" hint="Your legal name" testId="name">
      <tn-input [formControl]="nameControl" />
    </tn-form-field>

    <tn-form-field label="Aliases" testId="aliases">
      <tn-chip-input [formControl]="aliasesControl" />
    </tn-form-field>

    <tn-form-field label="Owner" testId="owner">
      <tn-autocomplete [formControl]="ownerControl" />
    </tn-form-field>

    <tn-form-field label="Group" testId="group">
      <tn-select [formControl]="groupControl" [options]="[{ label: 'Admins', value: 'admins' }]" />
    </tn-form-field>

    <tn-form-field label="Overridden" testId="overridden">
      <tn-chip-input ariaLabel="Custom name" [formControl]="overriddenControl" />
    </tn-form-field>

    <tn-form-field testId="unlabeled">
      <tn-input [formControl]="unlabeledControl" />
    </tn-form-field>

    <tn-input class="standalone" ariaLabel="Standalone" [formControl]="standaloneControl" />
  `,
})
class TestHostComponent {
  nameControl = new FormControl('', Validators.required);
  aliasesControl = new FormControl<string[]>([]);
  ownerControl = new FormControl('');
  groupControl = new FormControl('');
  overriddenControl = new FormControl<string[]>([]);
  unlabeledControl = new FormControl('');
  standaloneControl = new FormControl('');
}

describe('TnFormFieldContext integration', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [TnIconTesting.jest.providers()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function field(testId: string): HTMLElement {
    const el = fixture.nativeElement.querySelector(`[data-testid="form-field-${testId}"]`) as HTMLElement | null;
    if (!el) {
      throw new Error(`form-field "${testId}" not found`);
    }
    return el;
  }

  function controlOf(testId: string, selector: string): HTMLElement {
    const el = field(testId).querySelector(selector) as HTMLElement | null;
    if (!el) {
      throw new Error(`control "${selector}" not found in form-field "${testId}"`);
    }
    return el;
  }

  /** Resolves an id-reference attribute to its element's trimmed text. */
  function referencedText(control: HTMLElement, attribute: string): string {
    const id = control.getAttribute(attribute);
    expect(id).toBeTruthy();
    const target = document.getElementById(id!);
    expect(target).toBeTruthy();
    return target!.textContent!.trim();
  }

  describe('label association', () => {
    it.each([
      ['tn-input', 'name', 'input.tn-input', 'Name'],
      ['tn-chip-input', 'aliases', 'input.tn-chip-input__field', 'Aliases'],
      ['tn-autocomplete', 'owner', 'input.tn-autocomplete__input', 'Owner'],
      ['tn-select', 'group', '.tn-select-trigger', 'Group'],
    ])('%s gets aria-labelledby resolving to the field label', (_name, testId, selector, labelText) => {
      const control = controlOf(testId, selector);
      expect(referencedText(control, 'aria-labelledby')).toBe(labelText);
    });

    it('lets an explicit ariaLabel win over the field label', () => {
      const control = controlOf('overridden', 'input.tn-chip-input__field');
      expect(control.getAttribute('aria-labelledby')).toBeNull();
      expect(control.getAttribute('aria-label')).toBe('Custom name');
    });

    it('omits aria-labelledby when the field has no label', () => {
      const control = controlOf('unlabeled', 'input.tn-input');
      expect(control.getAttribute('aria-labelledby')).toBeNull();
    });

    it('omits all field-derived attributes on a standalone control', () => {
      const control = fixture.nativeElement.querySelector('.standalone input') as HTMLElement;
      expect(control.getAttribute('aria-labelledby')).toBeNull();
      expect(control.getAttribute('aria-describedby')).toBeNull();
      expect(control.getAttribute('aria-invalid')).toBeNull();
      expect(control.getAttribute('aria-required')).toBeNull();
    });
  });

  describe('required and error state', () => {
    it('reflects a required validator as aria-required', () => {
      expect(controlOf('name', 'input').getAttribute('aria-required')).toBe('true');
      expect(controlOf('aliases', 'input').getAttribute('aria-required')).toBeNull();
    });

    it('points aria-describedby at the hint while there is no error', () => {
      const control = controlOf('name', 'input');
      expect(control.getAttribute('aria-invalid')).toBeNull();
      expect(referencedText(control, 'aria-describedby')).toBe('Your legal name');
    });

    it('switches aria-describedby to the error and sets aria-invalid once the error shows', () => {
      host.nameControl.markAsTouched();
      host.nameControl.updateValueAndValidity();
      fixture.detectChanges();

      const control = controlOf('name', 'input');
      expect(control.getAttribute('aria-invalid')).toBe('true');
      expect(referencedText(control, 'aria-describedby')).toBe('This field is required');

      // Recovery: fixing the value drops the error linkage again.
      host.nameControl.setValue('valid');
      fixture.detectChanges();
      expect(control.getAttribute('aria-invalid')).toBeNull();
      expect(referencedText(control, 'aria-describedby')).toBe('Your legal name');
    });
  });
});
