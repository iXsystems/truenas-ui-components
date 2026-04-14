import { FocusMonitor, A11yModule } from '@angular/cdk/a11y';
import type { ElementRef, AfterViewInit} from '@angular/core';
import { Component, viewChild, inject, input, output, computed, signal, forwardRef } from '@angular/core';
import type { ControlValueAccessor} from '@angular/forms';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputType } from '../enums/input-type.enum';
import type { IconLibraryType } from '../icon/icon.component';
import { TnIconComponent } from '../icon/icon.component';

@Component({
  selector: 'tn-input',
  standalone: true,
  imports: [FormsModule, A11yModule, TnIconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TnInputComponent),
      multi: true
    }
  ],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
})
export class TnInputComponent implements AfterViewInit, ControlValueAccessor {
  inputEl = viewChild.required<ElementRef<HTMLInputElement | HTMLTextAreaElement>>('inputEl');

  inputType = input<InputType>(InputType.PlainText);
  placeholder = input<string>('Enter your name');
  testId = input<string | undefined>(undefined);
  disabled = input<boolean>(false);
  multiline = input<boolean>(false);
  rows = input<number>(3);

  // Icon inputs
  prefixIcon = input<string | undefined>(undefined);
  prefixIconLibrary = input<IconLibraryType | undefined>(undefined);
  suffixIcon = input<string | undefined>(undefined);
  suffixIconLibrary = input<IconLibraryType | undefined>(undefined);
  suffixIconAriaLabel = input<string | undefined>(undefined);

  onSuffixAction = output<MouseEvent>();

  hasPrefixIcon = computed(() => !!this.prefixIcon());
  hasSuffixIcon = computed(() => !!this.suffixIcon());

  id = 'tn-input';
  value = '';

  // CVA disabled state management
  private formDisabled = signal<boolean>(false);
  isDisabled = computed(() => this.disabled() || this.formDisabled());

  private onChange = (_value: string) => {};
  private onTouched = () => {};
  private focusMonitor = inject(FocusMonitor);

  ngAfterViewInit() {
    this.focusMonitor.monitor(this.inputEl());
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
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
