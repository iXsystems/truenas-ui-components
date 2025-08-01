import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, inject, Input, Output, EventEmitter, forwardRef } from '@angular/core';
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

  @Input() label = 'Checkbox';
  @Input() hideLabel = false;
  @Input() disabled = false;
  @Input() required = false;
  @Input() indeterminate = false;
  @Input() testId?: string;
  @Input() error: string | null = null;
  @Input() checked = false;

  @Output() change = new EventEmitter<boolean>();

  id = `ix-checkbox-${Math.random().toString(36).substr(2, 9)}`;

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

  // ControlValueAccessor implementation
  writeValue(value: boolean): void {
    this.checked = value !== null && value !== undefined ? value : false;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onCheckboxChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checked = target.checked;
    this.onChange(this.checked);
    this.onTouched();
    this.change.emit(this.checked);
  }

  get classes(): string[] {
    const classes = ['ix-checkbox'];
    
    if (this.disabled) {
      classes.push('ix-checkbox--disabled');
    }
    
    if (this.error) {
      classes.push('ix-checkbox--error');
    }
    
    if (this.indeterminate) {
      classes.push('ix-checkbox--indeterminate');
    }

    return classes;
  }
}