import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { TnInputComponent } from './input.component';
import { TnIconTesting } from '../icon/icon-testing';
import { InputType } from '../enums/input-type.enum';

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

/* eslint-disable @angular-eslint/component-max-inline-declarations */
@Component({
  selector: 'tn-test-cva-host',
  standalone: true,
  imports: [TnInputComponent, ReactiveFormsModule],
  template: `<tn-input [formControl]="control" />`
})
class TestCvaHostComponent {
  control = new FormControl('');
}
/* eslint-enable @angular-eslint/component-max-inline-declarations */

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
