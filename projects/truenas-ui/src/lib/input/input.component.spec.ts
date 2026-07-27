import { FocusMonitor } from '@angular/cdk/a11y';
import { Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TnInputComponent } from './input.component';
import { parseSize } from './size-conversion';
import { InputType } from '../enums/input-type.enum';
import { TnIconTesting } from '../icon/icon-testing';

describe('TnInputComponent', () => {
  let component: TnInputComponent;
  let fixture: ComponentFixture<TnInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnInputComponent],
      providers: [TnIconTesting.jest.providers()],
    }).compileComponents();

    fixture = TestBed.createComponent(TnInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should assign a unique id per instance', () => {
    const other = TestBed.createComponent(TnInputComponent).componentInstance;
    expect(component.id).toMatch(/^tn-input-\d+$/);
    expect(component.id).not.toBe(other.id);
  });

  describe('rendering', () => {
    it('should render an input element by default', () => {
      const input = fixture.nativeElement.querySelector('input.tn-input');
      expect(input).toBeTruthy();
      expect(fixture.nativeElement.querySelector('textarea')).toBeNull();
    });

    it('should render a textarea when multiline is true', () => {
      fixture.componentRef.setInput('multiline', true);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('textarea.tn-input')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('input.tn-input')).toBeNull();
    });

    it('should set rows on textarea', () => {
      fixture.componentRef.setInput('multiline', true);
      fixture.componentRef.setInput('rows', 6);
      fixture.detectChanges();

      const textarea = fixture.nativeElement.querySelector('textarea');
      expect(textarea.rows).toBe(6);
    });
  });

  describe('inputs', () => {
    it('should apply placeholder', () => {
      fixture.componentRef.setInput('placeholder', 'Type here');
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      expect(input.getAttribute('placeholder')).toBe('Type here');
    });

    it('should apply input type', () => {
      fixture.componentRef.setInput('inputType', InputType.Email);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      expect(input.type).toBe('email');
    });

    it('should apply data-testid with the library-owned "input-" prefix', () => {
      // testId is the semantic base; the library prepends the element type.
      fixture.componentRef.setInput('testId', 'my-input');
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      expect(input.getAttribute('data-testid')).toBe('input-my-input');
    });

    it('should disable the input', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      expect(input.disabled).toBe(true);
    });

    it('should not render aria-label by default', () => {
      const input = fixture.nativeElement.querySelector('input');
      expect(input.hasAttribute('aria-label')).toBe(false);
    });

    it('should apply aria-label when set', () => {
      fixture.componentRef.setInput('ariaLabel', 'Port number');
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      expect(input.getAttribute('aria-label')).toBe('Port number');
    });

    it('should apply aria-label to the textarea when multiline', () => {
      fixture.componentRef.setInput('multiline', true);
      fixture.componentRef.setInput('ariaLabel', 'Description');
      fixture.detectChanges();

      const textarea = fixture.nativeElement.querySelector('textarea');
      expect(textarea.getAttribute('aria-label')).toBe('Description');
    });

    it('should not render native attributes by default', () => {
      const input = fixture.nativeElement.querySelector('input');
      expect(input.hasAttribute('autocomplete')).toBe(false);
      expect(input.hasAttribute('name')).toBe(false);
      expect(input.readOnly).toBe(false);
      expect(input.required).toBe(false);
    });

    it('should apply autocomplete and name when set', () => {
      fixture.componentRef.setInput('autocomplete', 'current-password');
      fixture.componentRef.setInput('name', 'password');
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      expect(input.getAttribute('autocomplete')).toBe('current-password');
      expect(input.getAttribute('name')).toBe('password');
    });

    it('should apply readonly when set', () => {
      fixture.componentRef.setInput('readonly', true);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      expect(input.readOnly).toBe(true);
      // Readonly is not disabled: the field stays focusable and submittable.
      expect(input.disabled).toBe(false);
    });

    it('should apply required when set', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      expect(input.required).toBe(true);
    });

    it('should apply native attributes to the textarea when multiline', () => {
      fixture.componentRef.setInput('multiline', true);
      fixture.componentRef.setInput('autocomplete', 'off');
      fixture.componentRef.setInput('name', 'notes');
      fixture.componentRef.setInput('readonly', true);
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();

      const textarea = fixture.nativeElement.querySelector('textarea');
      expect(textarea.getAttribute('autocomplete')).toBe('off');
      expect(textarea.getAttribute('name')).toBe('notes');
      expect(textarea.readOnly).toBe(true);
      expect(textarea.required).toBe(true);
    });
  });

  describe('password visibility toggle', () => {
    const getToggle = (): HTMLButtonElement | null =>
      fixture.nativeElement.querySelector('.tn-input__visibility-toggle');

    beforeEach(() => {
      fixture.componentRef.setInput('inputType', InputType.Password);
      fixture.detectChanges();
    });

    it('should render the toggle on password fields', () => {
      expect(getToggle()).toBeTruthy();
    });

    it('should not render the toggle on non-password fields', () => {
      fixture.componentRef.setInput('inputType', InputType.PlainText);
      fixture.detectChanges();

      expect(getToggle()).toBeNull();
    });

    it('should not render the toggle when showPasswordToggle is false', () => {
      fixture.componentRef.setInput('showPasswordToggle', false);
      fixture.detectChanges();

      expect(getToggle()).toBeNull();
    });

    it('should yield to a consumer-provided suffix icon', () => {
      fixture.componentRef.setInput('suffixIcon', 'close-circle');
      fixture.detectChanges();

      expect(getToggle()).toBeNull();
      expect(fixture.nativeElement.querySelector('.tn-input__suffix-action')).toBeTruthy();
    });

    it('should come back masked when the field leaves and re-enters password mode', () => {
      const input = fixture.nativeElement.querySelector('input');
      getToggle()!.click();
      fixture.detectChanges();
      expect(input.type).toBe('text');

      fixture.componentRef.setInput('inputType', InputType.PlainText);
      fixture.detectChanges();
      fixture.componentRef.setInput('inputType', InputType.Password);
      fixture.detectChanges();

      expect(input.type).toBe('password');
      expect(getToggle()!.getAttribute('aria-label')).toBe('Show password');
    });

    it('should re-mask when showPasswordToggle is turned off while revealed', () => {
      const input = fixture.nativeElement.querySelector('input');
      getToggle()!.click();
      fixture.detectChanges();
      expect(input.type).toBe('text');

      fixture.componentRef.setInput('showPasswordToggle', false);
      fixture.detectChanges();

      expect(getToggle()).toBeNull();
      expect(input.type).toBe('password');
    });

    it('should re-mask when a suffix icon replaces the toggle while revealed', () => {
      const input = fixture.nativeElement.querySelector('input');
      getToggle()!.click();
      fixture.detectChanges();
      expect(input.type).toBe('text');

      fixture.componentRef.setInput('suffixIcon', 'close-circle');
      fixture.detectChanges();

      expect(getToggle()).toBeNull();
      expect(input.type).toBe('password');
    });

    it('should re-mask when the field is disabled while revealed', () => {
      const input = fixture.nativeElement.querySelector('input');
      getToggle()!.click();
      fixture.detectChanges();
      expect(input.type).toBe('text');

      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      expect(input.type).toBe('password');
    });

    it('should flip the input type between password and text on click', () => {
      const input = fixture.nativeElement.querySelector('input');
      expect(input.type).toBe('password');

      getToggle()!.click();
      fixture.detectChanges();
      expect(input.type).toBe('text');

      getToggle()!.click();
      fixture.detectChanges();
      expect(input.type).toBe('password');
    });

    it('should reflect the state in the aria-label, without aria-pressed', () => {
      const toggle = getToggle()!;
      expect(toggle.getAttribute('aria-label')).toBe('Show password');
      // No aria-pressed: it would contradict a label that names the action.
      expect(toggle.hasAttribute('aria-pressed')).toBe(false);

      toggle.click();
      fixture.detectChanges();
      expect(toggle.getAttribute('aria-label')).toBe('Hide password');
      expect(toggle.hasAttribute('aria-pressed')).toBe(false);
    });

    it('should emit a role-first test id scoped by the testId base', () => {
      fixture.componentRef.setInput('testId', 'login-password');
      fixture.detectChanges();

      expect(getToggle()!.getAttribute('data-testid')).toBe('button-toggle-password-login-password');
    });

    it('should emit the bare role test id when no testId is set', () => {
      expect(getToggle()!.getAttribute('data-testid')).toBe('button-toggle-password');
    });

    it('should disable the toggle with the input', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      expect(getToggle()!.disabled).toBe(true);
    });

    it('should preserve the value while toggling', () => {
      const input = fixture.nativeElement.querySelector('input');
      input.value = 'hunter2';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      getToggle()!.click();
      fixture.detectChanges();

      expect(input.value).toBe('hunter2');
      expect(input.type).toBe('text');
    });
  });

  describe('value changes', () => {
    it('should update value on input event', () => {
      const input = fixture.nativeElement.querySelector('input');
      input.value = 'new value';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component['value']()).toBe('new value');
    });

    it('should call onTouched on blur', () => {
      const touchedSpy = jest.fn();
      component.registerOnTouched(touchedSpy);

      const input = fixture.nativeElement.querySelector('input');
      input.dispatchEvent(new Event('blur'));

      expect(touchedSpy).toHaveBeenCalled();
    });
  });

  describe('number type', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('inputType', InputType.Number);
      fixture.detectChanges();
    });

    it('should render a text input (not native type=number) with decimal inputmode', () => {
      const input = fixture.nativeElement.querySelector('input');
      expect(input.type).toBe('text');
      expect(input.getAttribute('inputmode')).toBe('decimal');
    });

    it('should use numeric inputmode when decimals are disallowed', () => {
      fixture.componentRef.setInput('allowDecimals', false);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      expect(input.getAttribute('inputmode')).toBe('numeric');
    });

    it('should emit a number on input', () => {
      const changeSpy = jest.fn();
      component.registerOnChange(changeSpy);

      const input = fixture.nativeElement.querySelector('input');
      input.value = '42';
      input.dispatchEvent(new Event('input'));

      expect(changeSpy).toHaveBeenCalledWith(42);
      expect(typeof changeSpy.mock.calls[0][0]).toBe('number');
    });

    it('should emit a decimal number when decimals are allowed', () => {
      const changeSpy = jest.fn();
      component.registerOnChange(changeSpy);

      const input = fixture.nativeElement.querySelector('input');
      input.value = '3.5';
      input.dispatchEvent(new Event('input'));

      expect(changeSpy).toHaveBeenCalledWith(3.5);
    });

    it('should emit null for empty input (not 0)', () => {
      const changeSpy = jest.fn();
      component.registerOnChange(changeSpy);

      const input = fixture.nativeElement.querySelector('input');
      input.value = '';
      input.dispatchEvent(new Event('input'));

      expect(changeSpy).toHaveBeenCalledWith(null);
    });

    it('should strip non-numeric characters like e and +', () => {
      const changeSpy = jest.fn();
      component.registerOnChange(changeSpy);

      const input = fixture.nativeElement.querySelector('input');
      input.value = '1e+5';
      input.dispatchEvent(new Event('input'));

      expect(input.value).toBe('15');
      expect(changeSpy).toHaveBeenCalledWith(15);
    });

    it('should strip the decimal point in integer mode', () => {
      fixture.componentRef.setInput('allowDecimals', false);
      fixture.detectChanges();

      const changeSpy = jest.fn();
      component.registerOnChange(changeSpy);

      const input = fixture.nativeElement.querySelector('input');
      input.value = '3.5';
      input.dispatchEvent(new Event('input'));

      expect(input.value).toBe('35');
      expect(changeSpy).toHaveBeenCalledWith(35);
    });

    it('should keep a single leading minus sign', () => {
      const changeSpy = jest.fn();
      component.registerOnChange(changeSpy);

      const input = fixture.nativeElement.querySelector('input');
      input.value = '-1-2';
      input.dispatchEvent(new Event('input'));

      expect(input.value).toBe('-12');
      expect(changeSpy).toHaveBeenCalledWith(-12);
    });

    it('should emit null for a lone minus sign', () => {
      const changeSpy = jest.fn();
      component.registerOnChange(changeSpy);

      const input = fixture.nativeElement.querySelector('input');
      input.value = '-';
      input.dispatchEvent(new Event('input'));

      expect(changeSpy).toHaveBeenCalledWith(null);
    });

    it('should display a numeric value written from the form', () => {
      component.writeValue(8080);
      expect(component['value']()).toBe('8080');
    });

    it('should display empty string when null is written', () => {
      component.writeValue(null);
      expect(component['value']()).toBe('');
    });

    it('should display zero (not blank) when 0 is written', () => {
      component.writeValue(0);
      expect(component['value']()).toBe('0');
    });

    it('should display large numbers faithfully without corrupting exponential notation', () => {
      component.writeValue(1e21);
      expect(component['value']()).toBe('1e+21');
    });

    it('should not mangle a fractional value written in integer mode', () => {
      fixture.componentRef.setInput('allowDecimals', false);
      fixture.detectChanges();

      component.writeValue(3.5);
      // Display must mirror the model verbatim, not strip the dot to "35".
      expect(component['value']()).toBe('3.5');
    });

    it('should preserve the caret position when a stripped character is removed', () => {
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      input.value = '1234';
      input.dispatchEvent(new Event('input'));

      // Place the caret between '1' and '2', then insert a rejected character.
      input.value = '1e234';
      input.setSelectionRange(2, 2);
      input.dispatchEvent(new Event('input'));

      expect(input.value).toBe('1234');
      // Caret stays right after '1', not jumped to the end.
      expect(input.selectionStart).toBe(1);
    });

    it('should not render a textarea even when multiline is set', () => {
      fixture.componentRef.setInput('multiline', true);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('textarea')).toBeNull();
      expect(fixture.nativeElement.querySelector('input')).toBeTruthy();
    });
  });

  describe('size type', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('inputType', InputType.Size);
      fixture.detectChanges();
    });

    it('should render a text input (accepts unit letters) with no numeric inputmode', () => {
      const input = fixture.nativeElement.querySelector('input');
      expect(input.type).toBe('text');
      expect(input.hasAttribute('inputmode')).toBe(false);
    });

    it('should display a byte-count model as a human-readable string', () => {
      component.writeValue(2 * 1024 ** 3);
      expect(component['value']()).toBe('2 GiB');
    });

    it('should display empty string for null/undefined', () => {
      component.writeValue(null);
      expect(component['value']()).toBe('');
      component.writeValue(undefined);
      expect(component['value']()).toBe('');
    });

    it('should emit a byte count as the user types', () => {
      const changeSpy = jest.fn();
      component.registerOnChange(changeSpy);

      const input = fixture.nativeElement.querySelector('input');
      input.value = '2 GiB';
      input.dispatchEvent(new Event('input'));

      expect(changeSpy).toHaveBeenCalledWith(2 * 1024 ** 3);
    });

    it('should keep the raw text in the field while typing', () => {
      const input = fixture.nativeElement.querySelector('input');
      input.value = '2 gi';
      input.dispatchEvent(new Event('input'));

      expect(component['value']()).toBe('2 gi');
    });

    it('should emit null for unparseable input (not 0)', () => {
      const changeSpy = jest.fn();
      component.registerOnChange(changeSpy);

      const input = fixture.nativeElement.querySelector('input');
      input.value = 'abc';
      input.dispatchEvent(new Event('input'));

      expect(changeSpy).toHaveBeenCalledWith(null);
    });

    it('should assume the configured default unit for a bare number', () => {
      fixture.componentRef.setInput('sizeDefaultUnit', 'KiB');
      fixture.detectChanges();

      const changeSpy = jest.fn();
      component.registerOnChange(changeSpy);

      const input = fixture.nativeElement.querySelector('input');
      input.value = '200';
      input.dispatchEvent(new Event('input'));

      expect(changeSpy).toHaveBeenCalledWith(200 * 1024);
    });

    it('should canonicalize the display on blur', () => {
      const input = fixture.nativeElement.querySelector('input');
      input.value = '2048 KiB';
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('blur'));

      expect(component['value']()).toBe('2 MiB');
    });

    it('should re-sync the model to the canonicalized display on blur (lossy rounding)', () => {
      const changeSpy = jest.fn();
      component.registerOnChange(changeSpy);

      const input = fixture.nativeElement.querySelector('input');
      // 1.755 GiB does not round-trip through a 2-decimal display.
      input.value = '1.755 GiB';
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('blur'));

      const display = component['value']();
      const model = changeSpy.mock.calls.at(-1)![0];
      // The invariant that matters: re-parsing what the user sees yields the model.
      expect(parseSize(display, 'MiB', 'iec')).toBe(model);
      // ...and the display is itself the canonical render of that model (stable).
      expect(display).toBe(component['value']());
    });

    it('should not emit on blur when a pre-filled value is unchanged (no spurious dirty)', () => {
      const changeSpy = jest.fn();
      component.registerOnChange(changeSpy);
      // Pre-populate from the model (as a consumer form would), then tab in/out
      // with no edit. The canonical form equals the displayed text, so the control
      // must stay pristine — no onChange.
      component.writeValue(200 * 1024 ** 4);

      const input = fixture.nativeElement.querySelector('input');
      input.dispatchEvent(new Event('blur'));

      expect(changeSpy).not.toHaveBeenCalled();
      expect(component['value']()).toBe('200 TiB');
    });

    it('should leave unparseable text untouched on blur', () => {
      const input = fixture.nativeElement.querySelector('input');
      input.value = 'not a size';
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('blur'));

      expect(component['value']()).toBe('not a size');
    });

    it('should use the SI standard when configured', () => {
      fixture.componentRef.setInput('sizeStandard', 'si');
      fixture.detectChanges();

      component.writeValue(2_000_000_000);
      expect(component['value']()).toBe('2 GB');
    });

    it('should not render a textarea even when multiline is set', () => {
      fixture.componentRef.setInput('multiline', true);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('textarea')).toBeNull();
      expect(fixture.nativeElement.querySelector('input')).toBeTruthy();
    });
  });

  describe('prefix icon', () => {
    it('should not render prefix icon by default', () => {
      expect(fixture.nativeElement.querySelector('.tn-input__prefix-icon')).toBeNull();
    });

    it('should render prefix icon when set', () => {
      fixture.componentRef.setInput('prefixIcon', 'magnify');
      fixture.componentRef.setInput('prefixIconLibrary', 'mdi');
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('tn-icon.tn-input__prefix-icon');
      expect(icon).toBeTruthy();
      expect(icon.getAttribute('name')).toBe('magnify');
      expect(icon.getAttribute('library')).toBe('mdi');
    });

    it('should add has-prefix class to container', () => {
      fixture.componentRef.setInput('prefixIcon', 'magnify');
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.tn-input-container');
      expect(container.classList.contains('tn-input-container--has-prefix')).toBe(true);
    });

    it('should mark prefix icon as aria-hidden', () => {
      fixture.componentRef.setInput('prefixIcon', 'magnify');
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('tn-icon.tn-input__prefix-icon');
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('suffix action', () => {
    it('should not render suffix button by default', () => {
      expect(fixture.nativeElement.querySelector('.tn-input__suffix-action')).toBeNull();
    });

    it('should render suffix button when set', () => {
      fixture.componentRef.setInput('suffixIcon', 'close-circle');
      fixture.componentRef.setInput('suffixIconLibrary', 'mdi');
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('.tn-input__suffix-action');
      expect(button).toBeTruthy();

      const icon = button.querySelector('tn-icon');
      expect(icon.getAttribute('name')).toBe('close-circle');
      expect(icon.getAttribute('library')).toBe('mdi');
    });

    it('should not render a test id on the suffix button by default', () => {
      fixture.componentRef.setInput('suffixIcon', 'close-circle');
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('.tn-input__suffix-action');
      expect(button.hasAttribute('data-testid')).toBe(false);
    });

    it('should apply data-testid to the suffix button with the library-owned "button-" prefix', () => {
      fixture.componentRef.setInput('suffixIcon', 'eye');
      fixture.componentRef.setInput('suffixActionTestId', 'toggle-password');
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('.tn-input__suffix-action');
      expect(button.getAttribute('data-testid')).toBe('button-toggle-password');
    });

    it('should add has-suffix class to container', () => {
      fixture.componentRef.setInput('suffixIcon', 'close-circle');
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.tn-input-container');
      expect(container.classList.contains('tn-input-container--has-suffix')).toBe(true);
    });

    it('should apply aria-label to suffix button', () => {
      fixture.componentRef.setInput('suffixIcon', 'close-circle');
      fixture.componentRef.setInput('suffixIconAriaLabel', 'Clear input');
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('.tn-input__suffix-action');
      expect(button.getAttribute('aria-label')).toBe('Clear input');
    });

    it('should emit onSuffixAction when suffix button is clicked', () => {
      fixture.componentRef.setInput('suffixIcon', 'close-circle');
      fixture.detectChanges();

      const emitSpy = jest.fn();
      component.onSuffixAction.subscribe(emitSpy);

      const button = fixture.nativeElement.querySelector('.tn-input__suffix-action');
      button.click();

      expect(emitSpy).toHaveBeenCalled();
    });

    it('should disable suffix button when input is disabled', () => {
      fixture.componentRef.setInput('suffixIcon', 'close-circle');
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('.tn-input__suffix-action');
      expect(button.disabled).toBe(true);
    });
  });

  describe('ControlValueAccessor', () => {
    it('should write value', () => {
      component.writeValue('test');
      expect(component['value']()).toBe('test');
    });

    it('should write empty string for null', () => {
      component.writeValue(null);
      expect(component['value']()).toBe('');
    });

    it('should write empty string for undefined', () => {
      component.writeValue(undefined);
      expect(component['value']()).toBe('');
    });

    it('reflects a written value into the rendered input, not just the internal value', () => {
      component.writeValue('reflected');
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input.tn-input') as HTMLInputElement;
      expect(input.value).toBe('reflected');
    });

    it('reflects a written value into the rendered textarea when multiline', () => {
      fixture.componentRef.setInput('multiline', true);
      component.writeValue('reflected');
      fixture.detectChanges();

      const textarea = fixture.nativeElement.querySelector('textarea.tn-input') as HTMLTextAreaElement;
      expect(textarea.value).toBe('reflected');
    });

    it('should call onChange when value changes', () => {
      const changeSpy = jest.fn();
      component.registerOnChange(changeSpy);

      const input = fixture.nativeElement.querySelector('input');
      input.value = 'typed';
      input.dispatchEvent(new Event('input'));

      expect(changeSpy).toHaveBeenCalledWith('typed');
    });

    it('should set disabled state from form', () => {
      component.setDisabledState(true);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      expect(input.disabled).toBe(true);
    });
  });

  describe('lifecycle', () => {
    it('should stop monitoring focus on destroy', () => {
      const focusMonitor = TestBed.inject(FocusMonitor);
      const stopSpy = jest.spyOn(focusMonitor, 'stopMonitoring');

      fixture.destroy();

      expect(stopSpy).toHaveBeenCalledTimes(1);
    });
  });
});

 
@Component({
  selector: 'tn-test-cva-host',
  standalone: true,
  imports: [TnInputComponent, ReactiveFormsModule],
  template: `<tn-input [formControl]="control" />`
})
class TestCvaHostComponent {
  control = new FormControl('');
}
 

describe('TnInputComponent with FormControl', () => {
  let fixture: ComponentFixture<TestCvaHostComponent>;
  let hostComponent: TestCvaHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestCvaHostComponent],
      providers: [TnIconTesting.jest.providers()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestCvaHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should reflect FormControl value in the DOM', () => {
    hostComponent.control.setValue('from form');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.value).toBe('from form');
  });

  it('should update FormControl when user types', () => {
    const input = fixture.nativeElement.querySelector('input');
    input.value = 'typed value';
    input.dispatchEvent(new Event('input'));

    expect(hostComponent.control.value).toBe('typed value');
  });

  it('should disable input when FormControl is disabled', () => {
    hostComponent.control.disable();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.disabled).toBe(true);
  });

  it('should re-enable input when FormControl is enabled', () => {
    hostComponent.control.disable();
    fixture.detectChanges();

    hostComponent.control.enable();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.disabled).toBe(false);
  });
});


@Component({
  selector: 'tn-test-form-name-host',
  standalone: true,
  imports: [TnInputComponent, ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <tn-input formControlName="sshPort" />
    </form>
  `,
})
class TestFormNameHostComponent {
  form = new FormGroup({ sshPort: new FormControl('') });
}

describe('TnInputComponent test-id fallback', () => {
  function render(): HTMLElement {
    TestBed.configureTestingModule({
      imports: [TestFormNameHostComponent],
      providers: [TnIconTesting.jest.providers()],
    });
    const fixture = TestBed.createComponent(TestFormNameHostComponent);
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('input') as HTMLElement;
  }

  it('derives data-testid from formControlName when no testId is set', () => {
    // No explicit testId: the control name `sshPort` becomes `input-ssh-port`,
    // exactly what consumers hand-write today as testId="ssh-port".
    expect(render().getAttribute('data-testid')).toBe('input-ssh-port');
  });
});

@Component({
  selector: 'tn-test-number-cva-host',
  standalone: true,
  imports: [TnInputComponent, ReactiveFormsModule],
  template: `<tn-input [inputType]="numberType" [formControl]="control" />`
})
class TestNumberCvaHostComponent {
  numberType = InputType.Number;
  control = new FormControl<number | null>(null);
}


describe('TnInputComponent number type with FormControl', () => {
  let fixture: ComponentFixture<TestNumberCvaHostComponent>;
  let hostComponent: TestNumberCvaHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestNumberCvaHostComponent],
      providers: [TnIconTesting.jest.providers()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestNumberCvaHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should put a real number in the form model when the user types', () => {
    const input = fixture.nativeElement.querySelector('input');
    input.value = '443';
    input.dispatchEvent(new Event('input'));

    expect(hostComponent.control.value).toBe(443);
    expect(typeof hostComponent.control.value).toBe('number');
  });

  it('should set the form model to null when the field is cleared', () => {
    const input = fixture.nativeElement.querySelector('input');
    input.value = '443';
    input.dispatchEvent(new Event('input'));
    input.value = '';
    input.dispatchEvent(new Event('input'));

    expect(hostComponent.control.value).toBeNull();
  });

  it('should display a numeric value set on the FormControl', () => {
    hostComponent.control.setValue(22);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.value).toBe('22');
  });
});


@Component({
  selector: 'tn-test-number-validators-host',
  standalone: true,
  imports: [TnInputComponent, ReactiveFormsModule],
  template: `<tn-input [inputType]="numberType" [formControl]="control" />`
})
class TestNumberValidatorsHostComponent {
  numberType = InputType.Number;
  // Range enforcement lives with the consumer's FormControl, not the component.
  // These validators work precisely because the control emits real numbers.
  control = new FormControl<number | null>(null, [Validators.min(1), Validators.max(50)]);
}


describe('TnInputComponent number type with consumer validators', () => {
  let fixture: ComponentFixture<TestNumberValidatorsHostComponent>;
  let hostComponent: TestNumberValidatorsHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestNumberValidatorsHostComponent],
      providers: [TnIconTesting.jest.providers()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestNumberValidatorsHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be valid within range', () => {
    const input = fixture.nativeElement.querySelector('input');
    input.value = '25';
    input.dispatchEvent(new Event('input'));

    expect(hostComponent.control.valid).toBe(true);
  });

  it('should fail Validators.max because the emitted value is a real number', () => {
    const input = fixture.nativeElement.querySelector('input');
    input.value = '60';
    input.dispatchEvent(new Event('input'));

    expect(hostComponent.control.valid).toBe(false);
    expect(hostComponent.control.errors).toEqual({ max: { max: 50, actual: 60 } });
  });
});


@Component({
  selector: 'tn-test-size-cva-host',
  standalone: true,
  imports: [TnInputComponent, ReactiveFormsModule],
  template: `<tn-input [inputType]="sizeType" [formControl]="control" />`
})
class TestSizeCvaHostComponent {
  sizeType = InputType.Size;
  // The form model holds a byte count; the field shows a human-readable string.
  control = new FormControl<number | null>(null);
}


describe('TnInputComponent size type with FormControl', () => {
  let fixture: ComponentFixture<TestSizeCvaHostComponent>;
  let hostComponent: TestSizeCvaHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestSizeCvaHostComponent],
      providers: [TnIconTesting.jest.providers()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestSizeCvaHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should put a byte count in the form model when the user types a size', () => {
    const input = fixture.nativeElement.querySelector('input');
    input.value = '2 GiB';
    input.dispatchEvent(new Event('input'));

    expect(hostComponent.control.value).toBe(2 * 1024 ** 3);
    expect(typeof hostComponent.control.value).toBe('number');
  });

  it('should display a byte-count model as a human-readable string', () => {
    hostComponent.control.setValue(200 * 1024 ** 4);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.value).toBe('200 TiB');
  });

  it('should set the form model to null when the field is cleared', () => {
    const input = fixture.nativeElement.querySelector('input');
    input.value = '2 GiB';
    input.dispatchEvent(new Event('input'));
    input.value = '';
    input.dispatchEvent(new Event('input'));

    expect(hostComponent.control.value).toBeNull();
  });

  it('should keep the form model in lockstep with the canonicalized display on blur', () => {
    const input = fixture.nativeElement.querySelector('input');
    input.value = '1.755 GiB';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    // Flush the [value] binding so the DOM reflects the canonicalized display.
    fixture.detectChanges();

    // What the user sees parses back to exactly what's stored — no divergence.
    expect(parseSize(input.value, 'MiB', 'iec')).toBe(hostComponent.control.value);
  });
});
