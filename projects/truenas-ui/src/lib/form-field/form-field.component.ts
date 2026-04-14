
import type { AfterContentInit } from '@angular/core';
import { Component, input, computed, signal, contentChild } from '@angular/core';
import { NgControl } from '@angular/forms';

export type SubscriptSizing = 'fixed' | 'dynamic';

@Component({
  selector: 'tn-form-field',
  standalone: true,
  imports: [],
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss']
})
export class TnFormFieldComponent implements AfterContentInit {
  label = input<string>('');
  hint = input<string>('');
  required = input<boolean>(false);
  testId = input<string>('');
  subscriptSizing = input<SubscriptSizing>('dynamic');

  control = contentChild(NgControl);

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

    // Return the first error message found
    if (errors['required']) {return 'This field is required';}
    if (errors['email']) {return 'Please enter a valid email address';}
    if (errors['minlength']) {return `Minimum length is ${errors['minlength'].requiredLength}`;}
    if (errors['maxlength']) {return `Maximum length is ${errors['maxlength'].requiredLength}`;}
    if (errors['pattern']) {return 'Please enter a valid format';}
    if (errors['min']) {return `Minimum value is ${errors['min'].min}`;}
    if (errors['max']) {return `Maximum value is ${errors['max'].max}`;}

    // Return custom error message if the value is a string, otherwise use the key
    const firstKey = Object.keys(errors)[0];
    if (firstKey) {
      const value = errors[firstKey];
      return typeof value === 'string' ? value : firstKey;
    }
    return 'Invalid input';
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