import { Component, Input, forwardRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { IxSelectComponent, IxSelectOption } from '../ix-select/ix-select.component';

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
      [placeholder]="placeholder"
      [disabled]="disabled"
      [testId]="testId"
      [ngModel]="_value"
      (selectionChange)="onSelectionChange($event)">
    </ix-select>
  `,
  styleUrl: './ix-time-input.component.scss',
  host: {
    'class': 'ix-time-input'
  }
})
export class IxTimeInputComponent implements ControlValueAccessor {
  @Input() disabled = false;
  @Input() format: '12h' | '24h' = '12h';
  @Input() granularity: '15m' | '30m' | '1h' = '15m';
  @Input() placeholder = 'Pick a time';
  @Input() testId = '';

  private get step(): number {
    switch (this.granularity) {
      case '15m': return 15;
      case '30m': return 30;
      case '1h': return 60;
      default: return 15;
    }
  }

  private onChange = (value: string) => {};
  private onTouched = () => {};

  public _value: string | null = null;
  
  // Generate time options for ix-select
  timeSelectOptions = computed((): IxSelectOption[] => {
    const options: IxSelectOption[] = [];
    const totalMinutes = 24 * 60; // Total minutes in a day
    
    for (let minutes = 0; minutes < totalMinutes; minutes += this.step) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      
      if (this.format === '24h') {
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
    this.disabled = isDisabled;
  }

  // Event handlers
  onSelectionChange(value: string): void {
    this._value = value;
    this.onChange(value);
    this.onTouched();
  }
}