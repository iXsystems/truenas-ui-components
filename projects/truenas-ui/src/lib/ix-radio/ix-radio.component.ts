import { FocusMonitor, A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import type { ElementRef, AfterViewInit, OnDestroy} from '@angular/core';
import { Component, viewChild, inject, input, output, computed, signal, forwardRef } from '@angular/core';
import type { ControlValueAccessor} from '@angular/forms';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ix-radio',
  standalone: true,
  imports: [CommonModule, FormsModule, A11yModule],
  templateUrl: './ix-radio.component.html',
  styleUrl: './ix-radio.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IxRadioComponent),
      multi: true
    }
  ]
})
export class IxRadioComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  radioEl = viewChild.required<ElementRef<HTMLInputElement>>('radioEl');

  label = input<string>('Radio');
  value = input<unknown>('');
  name = input<string | undefined>(undefined);
  disabled = input<boolean>(false);
  required = input<boolean>(false);
  testId = input<string | undefined>(undefined);
  error = input<string | null>(null);

  change = output<unknown>();

  id = `ix-radio-${Math.random().toString(36).substr(2, 9)}`;
  checked = false;

  // CVA disabled state management
  private formDisabled = signal<boolean>(false);
  isDisabled = computed(() => this.disabled() || this.formDisabled());

  private focusMonitor = inject(FocusMonitor);
  private onChange = (_: unknown) => {};
  private onTouched = () => {};

  ngAfterViewInit() {
    const radioEl = this.radioEl();
    if (radioEl) {
      this.focusMonitor.monitor(radioEl)
        .subscribe(origin => {
          // Focus monitoring for accessibility
        });
    }
  }

  ngOnDestroy() {
    const radioEl = this.radioEl();
    if (radioEl) {
      this.focusMonitor.stopMonitoring(radioEl);
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: unknown): void {
    this.checked = value !== null && value !== undefined && value === this.value();
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  onRadioChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checked = target.checked;
    if (target.checked) {
      this.onChange(this.value());
      this.onTouched();
      this.change.emit(this.value());
    }
  }

  classes = computed(() => {
    const classes = ['ix-radio'];

    if (this.isDisabled()) {
      classes.push('ix-radio--disabled');
    }

    if (this.error()) {
      classes.push('ix-radio--error');
    }

    return classes;
  });
}