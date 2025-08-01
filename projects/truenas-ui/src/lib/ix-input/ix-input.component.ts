import { Component, ViewChild, ElementRef, AfterViewInit, inject, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FocusMonitor, A11yModule } from '@angular/cdk/a11y';
import { InputType } from '../enums/input-type.enum';

@Component({
  selector: 'ix-input',
  standalone: true,
  imports: [CommonModule, FormsModule, A11yModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IxInputComponent),
      multi: true
    }
  ],
  templateUrl: './ix-input.component.html',
  styleUrl: './ix-input.component.scss',
})
export class IxInputComponent implements AfterViewInit, ControlValueAccessor {
  @ViewChild('inputEl') inputEl!: ElementRef<HTMLInputElement | HTMLTextAreaElement>;

  @Input() inputType: InputType = InputType.PlainText;
  @Input() placeholder = 'Enter your name';
  @Input() testId?: string;
  @Input() disabled = false;
  @Input() multiline: boolean = false;
  @Input() rows: number = 3;

  id = 'ix-input';
  value = '';

  private onChange = (value: any) => {};
  private onTouched = () => {};
  private focusMonitor = inject(FocusMonitor);

  ngAfterViewInit() {
    this.focusMonitor.monitor(this.inputEl);
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Component methods
  onValueChange(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }
}
