import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TnCheckboxComponent, TnCheckboxLabelDirective } from './checkbox.component';

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnCheckboxComponent, TnCheckboxLabelDirective, ReactiveFormsModule],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-checkbox
      testId="main"
      [label]="label()"
      [disabled]="disabled()"
      [required]="required()"
      [indeterminate]="indeterminate()"
      [error]="error()"
      [hideLabel]="hideLabel()"
      [formControl]="control" />

    <tn-checkbox testId="projected" [formControl]="projectedControl">
      <span tnCheckboxLabel>I agree to the <a href="/terms">Terms</a></span>
    </tn-checkbox>
  `
})
class TestHostComponent {
  label = signal('Accept');
  disabled = signal(false);
  required = signal(false);
  indeterminate = signal(false);
  hideLabel = signal(false);
  error = signal<string | null>(null);
  control = new FormControl(false);
  projectedControl = new FormControl(false);
}

describe('TnCheckboxComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  const getCheckbox = (testId = 'main'): HTMLElement =>
    fixture.nativeElement.querySelector(`[data-testid="${testId}"]`);

  const getWrapper = (testId = 'main'): HTMLElement => {
    const input = getCheckbox(testId);
    return input.closest('.tn-checkbox') as HTMLElement;
  };

  const getLabelText = (testId = 'main'): HTMLElement | null =>
    getWrapper(testId).querySelector('.tn-checkbox__text');

  const getError = (testId = 'main'): HTMLElement | null =>
    getWrapper(testId).querySelector('.tn-checkbox__error');

  const clickLabel = (testId = 'main') => {
    const label = getWrapper(testId).querySelector('.tn-checkbox__label') as HTMLElement;
    label.click();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('rendering', () => {
    it('should render with label text', () => {
      expect(getLabelText()?.textContent?.trim()).toBe('Accept');
    });

    it('should hide label when hideLabel is true', () => {
      host.hideLabel.set(true);
      fixture.detectChanges();

      expect(getLabelText()).toBeNull();
    });

    it('should render projected content via tnCheckboxLabel', () => {
      const text = getLabelText('projected');
      expect(text?.textContent).toContain('I agree to the');
      expect(text?.querySelector('a')).toBeTruthy();
    });
  });

  describe('CSS classes', () => {
    it('should have base class', () => {
      expect(getWrapper().classList.contains('tn-checkbox')).toBe(true);
    });

    it('should add disabled class', () => {
      host.disabled.set(true);
      fixture.detectChanges();

      expect(getWrapper().classList.contains('tn-checkbox--disabled')).toBe(true);
    });

    it('should add error class', () => {
      host.error.set('Required');
      fixture.detectChanges();

      expect(getWrapper().classList.contains('tn-checkbox--error')).toBe(true);
    });

    it('should add indeterminate class', () => {
      host.indeterminate.set(true);
      fixture.detectChanges();

      expect(getWrapper().classList.contains('tn-checkbox--indeterminate')).toBe(true);
    });

    it('should not add modifier classes by default', () => {
      const wrapper = getWrapper();
      expect(wrapper.classList.contains('tn-checkbox--disabled')).toBe(false);
      expect(wrapper.classList.contains('tn-checkbox--error')).toBe(false);
      expect(wrapper.classList.contains('tn-checkbox--indeterminate')).toBe(false);
    });
  });

  describe('error display', () => {
    it('should not show error by default', () => {
      expect(getError()).toBeNull();
    });

    it('should show error message', () => {
      host.error.set('You must accept');
      fixture.detectChanges();

      const error = getError();
      expect(error).toBeTruthy();
      expect(error?.textContent?.trim()).toBe('You must accept');
    });

    it('should have alert role for accessibility', () => {
      host.error.set('Error');
      fixture.detectChanges();

      expect(getError()?.getAttribute('role')).toBe('alert');
    });

    it('should set aria-invalid on the input when error is present', () => {
      host.error.set('Error');
      fixture.detectChanges();

      expect(getCheckbox().getAttribute('aria-invalid')).toBe('true');
    });

    it('should not set aria-invalid when no error', () => {
      expect(getCheckbox().getAttribute('aria-invalid')).toBeNull();
    });
  });

  describe('ControlValueAccessor', () => {
    it('should update checked state via form control', () => {
      host.control.setValue(true);
      fixture.detectChanges();

      expect((getCheckbox() as HTMLInputElement).checked).toBe(true);
    });

    it('should handle null writeValue gracefully', () => {
      host.control.setValue(null);
      fixture.detectChanges();

      expect((getCheckbox() as HTMLInputElement).checked).toBe(false);
    });

    it('should handle undefined writeValue gracefully', () => {
      host.control.setValue(undefined as unknown as boolean);
      fixture.detectChanges();

      expect((getCheckbox() as HTMLInputElement).checked).toBe(false);
    });

    it('should disable via form control', () => {
      host.control.disable();
      fixture.detectChanges();

      expect((getCheckbox() as HTMLInputElement).disabled).toBe(true);
      expect(getWrapper().classList.contains('tn-checkbox--disabled')).toBe(true);
    });

    it('should re-enable via form control', () => {
      host.control.disable();
      fixture.detectChanges();
      host.control.enable();
      fixture.detectChanges();

      expect((getCheckbox() as HTMLInputElement).disabled).toBe(false);
    });

    it('should update form control on click', () => {
      clickLabel();
      expect(host.control.value).toBe(true);

      clickLabel();
      expect(host.control.value).toBe(false);
    });
  });

  describe('input attributes', () => {
    it('should set required attribute', () => {
      host.required.set(true);
      fixture.detectChanges();

      expect((getCheckbox() as HTMLInputElement).required).toBe(true);
    });

    it('should set indeterminate property', () => {
      host.indeterminate.set(true);
      fixture.detectChanges();

      expect((getCheckbox() as HTMLInputElement).indeterminate).toBe(true);
    });

    it('should set data-testid attribute', () => {
      expect(getCheckbox().getAttribute('data-testid')).toBe('main');
    });
  });

  describe('content projection', () => {
    it('should update form control when projected-label checkbox is clicked', () => {
      clickLabel('projected');
      expect(host.projectedControl.value).toBe(true);
    });

    it('should render link inside projected label', () => {
      const link = getLabelText('projected')?.querySelector('a');
      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toBe('/terms');
    });
  });
});
