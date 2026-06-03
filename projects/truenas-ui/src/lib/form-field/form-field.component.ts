
import type { AfterContentInit } from '@angular/core';
import { Component, input, computed, signal, contentChild, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import {
  TN_FORM_FIELD_ERRORS,
  activeErrorKey,
  defaultErrorMessage,
} from './form-field.errors';
import type { TnFormFieldErrorMessages } from './form-field.errors';
import { TnIconComponent } from '../icon/icon.component';
import { TnTestIdDirective, type TnTestIdValue } from '../test-id';
import { TnTooltipDirective } from '../tooltip/tooltip.directive';
import type { TooltipPosition } from '../tooltip/tooltip.directive';

export type SubscriptSizing = 'fixed' | 'dynamic';

@Component({
  selector: 'tn-form-field',
  standalone: true,
  imports: [TnTestIdDirective, TnIconComponent, TnTooltipDirective],
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss']
})
export class TnFormFieldComponent implements AfterContentInit {
  label = input<string>('');
  hint = input<string>('');
  required = input<boolean>(false);
  testId = input<TnTestIdValue>('');
  subscriptSizing = input<SubscriptSizing>('dynamic');

  /** Optional tooltip shown via a help icon next to the label. */
  tooltip = input<string>('');
  /** Placement of the tooltip relative to its help icon. */
  tooltipPosition = input<TooltipPosition>('above');

  /**
   * Per-field overrides for validation messages, keyed by error key. Values may
   * be a string or a function that receives the error's detail value. Takes
   * precedence over the app-wide {@link TN_FORM_FIELD_ERRORS} resolver and the
   * built-in defaults.
   */
  errorMessages = input<TnFormFieldErrorMessages>({});

  control = contentChild(NgControl);

  private errorResolver = inject(TN_FORM_FIELD_ERRORS, { optional: true });

  protected hasError = signal<boolean>(false);
  protected errorMessage = signal<string>('');

  ngAfterContentInit(): void {
    const control = this.control();
    if (control) {
      // Listen for control status changes
      control.statusChanges?.subscribe(() => {
        this.updateErrorState();
      });

      // Initial error state check
      this.updateErrorState();
    }
  }

  private updateErrorState(): void {
    const control = this.control();
    if (control) {
      this.hasError.set(!!(control.invalid && (control.dirty || control.touched)));
      this.errorMessage.set(this.getErrorMessage());
    }
  }

  private getErrorMessage(): string {
    const control = this.control();
    if (!control?.errors) {return '';}

    const errors = control.errors;
    const key = activeErrorKey(errors);
    if (!key) {return 'Invalid input';}

    const value = errors[key];

    // 1. Per-field override (string or factory).
    const override = this.errorMessages()[key];
    if (override != null) {
      return typeof override === 'function' ? override(value) : override;
    }

    // 2. App-wide resolver (e.g. wired to a translation service).
    const resolved = this.errorResolver?.(key, value, control.control ?? null);
    if (resolved != null) {return resolved;}

    // 3. Built-in default messages for standard validators.
    const builtIn = defaultErrorMessage(key, errors);
    if (builtIn != null) {return builtIn;}

    // 4. A custom validator that returned its own message string.
    if (typeof value === 'string') {return value;}

    // 5. Last resort: the raw error key.
    return key;
  }

  showError = computed(() => {
    return this.hasError() && !!this.errorMessage();
  });

  showHint = computed(() => {
    return !!this.hint() && !this.showError();
  });

  protected showSubscript = computed(() => {
    return this.subscriptSizing() === 'fixed' || this.showError() || this.showHint();
  });
}
