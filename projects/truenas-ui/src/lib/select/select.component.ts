import { CommonModule } from '@angular/common';
import { ElementRef, ChangeDetectorRef, Component, input, output, forwardRef, signal, computed, effect, inject } from '@angular/core';
import type { ControlValueAccessor} from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

export interface TnSelectOption<T = unknown> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface TnSelectOptionGroup<T = unknown> {
  label: string;
  options: TnSelectOption<T>[];
  disabled?: boolean;
}

@Component({
  selector: 'tn-select',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TnSelectComponent),
      multi: true
    }
  ],
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class TnSelectComponent<T = unknown> implements ControlValueAccessor {
  options = input<TnSelectOption<T>[]>([]);
  optionGroups = input<TnSelectOptionGroup<T>[]>([]);
  placeholder = input<string>('Select an option');
  disabled = input<boolean>(false);
  testId = input<string>('');

  selectionChange = output<T>();

  // Internal state signals
  protected isOpen = signal<boolean>(false);
  protected selectedValue = signal<T | null>(null);
  private formDisabled = signal<boolean>(false);

  // Computed disabled state (combines input and form state)
  isDisabled = computed(() => this.disabled() || this.formDisabled());

  private onChange = (_value: T | null) => {};
  private onTouched = () => {};

  private elementRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    // Click-outside detection using effect
    effect(() => {
      if (this.isOpen()) {
        const clickListener = (event: Event) => {
          if (!this.elementRef.nativeElement.contains(event.target as Node)) {
            this.closeDropdown();
          }
        };

        // Add listener after a small delay to avoid immediate closure
        setTimeout(() => {
          document.addEventListener('click', clickListener);
        }, 0);

        // Cleanup function
        return () => {
          document.removeEventListener('click', clickListener);
        };
      }
      return undefined;
    });
  }

  // ControlValueAccessor implementation
  writeValue(value: T | null): void {
    this.selectedValue.set(value);
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  // Component methods
  toggleDropdown(): void {
    if (this.isDisabled()) {return;}
    this.isOpen.set(!this.isOpen());
    if (!this.isOpen()) {
      this.onTouched();
    }
  }

  closeDropdown(): void {
    this.isOpen.set(false);
    this.onTouched();
  }

  onOptionClick(option: TnSelectOption<T>): void {
    this.selectOption(option);
  }

  selectOption(option: TnSelectOption<T>): void {
    if (option.disabled) {return;}

    this.selectedValue.set(option.value);
    this.onChange(option.value);
    this.selectionChange.emit(option.value);
    this.closeDropdown();
    this.cdr.markForCheck(); // Trigger change detection
  }

  // Computed properties
  isSelected = computed(() => (option: TnSelectOption<T>): boolean => {
    return this.compareValues(this.selectedValue(), option.value);
  });

  getDisplayText = computed(() => {
    const value = this.selectedValue();
    if (value === null || value === undefined) {
      return this.placeholder();
    }
    const option = this.findOptionByValue(value);
    return option ? option.label : value;
  });

  private findOptionByValue(value: T | null): TnSelectOption<T> | undefined {
    // Search in regular options first
    const regularOption = this.options().find(opt => this.compareValues(opt.value, value));
    if (regularOption) {return regularOption;}

    // Search in option groups
    for (const group of this.optionGroups()) {
      const groupOption = group.options.find(opt => this.compareValues(opt.value, value));
      if (groupOption) {return groupOption;}
    }

    return undefined;
  }

  hasAnyOptions = computed(() => {
    return this.options().length > 0 || this.optionGroups().length > 0;
  });

  private compareValues(a: T | null, b: T | null): boolean {
    if (a === b) {return true;}
    if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
      return JSON.stringify(a) === JSON.stringify(b);
    }
    return false;
  }

  // Keyboard navigation
  onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        if (!this.isOpen()) {
          this.toggleDropdown();
          event.preventDefault();
        }
        break;
      case 'Escape':
        if (this.isOpen()) {
          this.closeDropdown();
          event.preventDefault();
        }
        break;
      case 'ArrowDown':
        if (!this.isOpen()) {
          this.toggleDropdown();
        }
        event.preventDefault();
        break;
    }
  }
}
