import { CommonModule } from '@angular/common';
import { Component, input, signal, forwardRef, computed } from '@angular/core';
import type { ControlValueAccessor} from '@angular/forms';
import { NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import type { IxSelectOption } from '../ix-select/ix-select.component';
import { IxSelectComponent } from '../ix-select/ix-select.component';

@Component({
  selector: 'ix-time-input',
  standalone: true,
  imports: [CommonModule, FormsModule, IxSelectComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IxTimeInputComponent),
      multi: true
    }
  ],
  template: `
    <ix-select
      [options]="timeSelectOptions()"
      [placeholder]="placeholder()"
      [disabled]="isDisabled()"
      [testId]="testId()"
      [ngModel]="_value"
      (selectionChange)="onSelectionChange($event)" />
  `,
  styleUrl: './ix-time-input.component.scss',
  host: {
    'class': 'ix-time-input'
  }
})
export class IxTimeInputComponent implements ControlValueAccessor {
  disabled = input<boolean>(false);
  format = input<'12h' | '24h'>('12h');
  granularity = input<'15m' | '30m' | '1h'>('15m');
  placeholder = input<string>('Pick a time');
  testId = input<string>('');

  private formDisabled = signal<boolean>(false);
  isDisabled = computed(() => this.disabled() || this.formDisabled());

  private step = computed((): number => {
    switch (this.granularity()) {
      case '15m': return 15;
      case '30m': return 30;
      case '1h': return 60;
      default: return 15;
    }
  });

  private onChange = (_value: string) => {};
  private onTouched = () => {};

  _value: string | null = null;
  
  // Generate time options for ix-select
  timeSelectOptions = computed((): IxSelectOption<string>[] => {
    const options: IxSelectOption<string>[] = [];
    const totalMinutes = 24 * 60; // Total minutes in a day

    for (let minutes = 0; minutes < totalMinutes; minutes += this.step()) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;

      if (this.format() === '24h') {
        const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        options.push({ value: timeStr, label: timeStr });
      } else {
        const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        const ampm = hours < 12 ? 'AM' : 'PM';
        const timeStr = `${displayHour}:${mins.toString().padStart(2, '0')} ${ampm}`;
        options.push({ value: timeStr, label: timeStr });
      }
    }

    return options;
  });


  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this._value = value || null;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  // Event handlers
  onSelectionChange(value: string): void {
    this._value = value;
    this.onChange(value);
    this.onTouched();
  }
}