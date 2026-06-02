import { Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TnInputComponent } from './input.component';
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

    it('should apply data-testid', () => {
      fixture.componentRef.setInput('testId', 'my-input');
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      expect(input.getAttribute('data-testid')).toBe('my-input');
    });

    it('should disable the input', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      expect(input.disabled).toBe(true);
    });
  });

  describe('value changes', () => {
    it('should update value on input event', () => {
      const input = fixture.nativeElement.querySelector('input');
      input.value = 'new value';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.value).toBe('new value');
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
      expect(component.value).toBe('8080');
    });

    it('should display empty string when null is written', () => {
      component.writeValue(null);
      expect(component.value).toBe('');
    });

    it('should display zero (not blank) when 0 is written', () => {
      component.writeValue(0);
      expect(component.value).toBe('0');
    });

    it('should display large numbers faithfully without corrupting exponential notation', () => {
      component.writeValue(1e21);
      expect(component.value).toBe('1e+21');
    });

    it('should not mangle a fractional value written in integer mode', () => {
      fixture.componentRef.setInput('allowDecimals', false);
      fixture.detectChanges();

      component.writeValue(3.5);
      // Display must mirror the model verbatim, not strip the dot to "35".
      expect(component.value).toBe('3.5');
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
      expect(component.value).toBe('test');
    });

    it('should write empty string for null', () => {
      component.writeValue(null as unknown as string);
      expect(component.value).toBe('');
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
