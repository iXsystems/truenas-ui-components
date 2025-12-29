import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, inject, input, output, computed, signal, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FocusMonitor, A11yModule } from '@angular/cdk/a11y';

@Component({
  selector: 'ix-checkbox',
  standalone: true,
  imports: [CommonModule, FormsModule, A11yModule],
  templateUrl: './ix-checkbox.component.html',
  styleUrl: './ix-checkbox.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IxCheckboxComponent),
      multi: true
    }
  ]
})
export class IxCheckboxComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  @ViewChild('checkboxEl') checkboxEl!: ElementRef<HTMLInputElement>;

  label = input<string>('Checkbox');
  hideLabel = input<boolean>(false);
  disabled = input<boolean>(false);
  required = input<boolean>(false);
  indeterminate = input<boolean>(false);
  testId = input<string | undefined>(undefined);
  error = input<string | null>(null);
  checked = input<boolean>(false);

  change = output<boolean>();

  id = `ix-checkbox-${Math.random().toString(36).substr(2, 9)}`;

  // Internal state for CVA
  private internalChecked = signal<boolean>(false);

  // CVA disabled state management
  private formDisabled = signal<boolean>(false);
  isDisabled = computed(() => this.disabled() || this.formDisabled());

  private focusMonitor = inject(FocusMonitor);
  private onChange = (_: boolean) => {};
  private onTouched = () => {};

  ngAfterViewInit() {
    if (this.checkboxEl) {
      this.focusMonitor.monitor(this.checkboxEl)
        .subscribe(origin => {
          // Focus monitoring for accessibility
        });
    }
  }

  ngOnDestroy() {
    if (this.checkboxEl) {
      this.focusMonitor.stopMonitoring(this.checkboxEl);
    }
  }

  // Computed for effective checked state (input or CVA-controlled)
  effectiveChecked = computed(() => this.internalChecked() || this.checked());

  // ControlValueAccessor implementation
  writeValue(value: boolean): void {
    this.internalChecked.set(value !== null && value !== undefined ? value : false);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  onCheckboxChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;
    this.internalChecked.set(checked);
    this.onChange(checked);
    this.onTouched();
    this.change.emit(checked);
  }

  classes = computed(() => {
    const classes = ['ix-checkbox'];

    if (this.isDisabled()) {
      classes.push('ix-checkbox--disabled');
    }

    if (this.error()) {
      classes.push('ix-checkbox--error');
    }

    if (this.indeterminate()) {
      classes.push('ix-checkbox--indeterminate');
    }

    return classes;
  });
}