import { CommonModule } from '@angular/common';
import { Component, Input, ContentChild, AfterContentInit } from '@angular/core';
import { NgControl } from '@angular/forms';

@Component({
  selector: 'ix-form-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ix-form-field.component.html',
  styleUrls: ['./ix-form-field.component.scss']
})
export class IxFormFieldComponent implements AfterContentInit {
  @Input() label = '';
  @Input() hint = '';
  @Input() required = false;
  @Input() testId = '';

  @ContentChild(NgControl, { static: false }) control?: NgControl;

  protected hasError = false;
  protected errorMessage = '';

  ngAfterContentInit(): void {
    if (this.control) {
      // Listen for control status changes
      this.control.statusChanges?.subscribe(() => {
        this.updateErrorState();
      });
      
      // Initial error state check
      this.updateErrorState();
    }
  }

  private updateErrorState(): void {
    if (this.control) {
      this.hasError = !!(this.control.invalid && (this.control.dirty || this.control.touched));
      this.errorMessage = this.getErrorMessage();
    }
  }

  private getErrorMessage(): string {
    if (!this.control?.errors) return '';

    const errors = this.control.errors;
    
    // Return the first error message found
    if (errors['required']) return 'This field is required';
    if (errors['email']) return 'Please enter a valid email address';
    if (errors['minlength']) return `Minimum length is ${errors['minlength'].requiredLength}`;
    if (errors['maxlength']) return `Maximum length is ${errors['maxlength'].requiredLength}`;
    if (errors['pattern']) return 'Please enter a valid format';
    if (errors['min']) return `Minimum value is ${errors['min'].min}`;
    if (errors['max']) return `Maximum value is ${errors['max'].max}`;

    // Return custom error message if available
    return Object.keys(errors)[0] || 'Invalid input';
  }

  get showError(): boolean {
    return this.hasError && !!this.errorMessage;
  }

  get showHint(): boolean {
    return !!this.hint && !this.showError;
  }
}