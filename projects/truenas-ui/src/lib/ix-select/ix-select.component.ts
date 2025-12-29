import { CommonModule } from '@angular/common';
import type { ElementRef, ChangeDetectorRef} from '@angular/core';
import { Component, input, output, forwardRef, signal, computed, effect } from '@angular/core';
import type { ControlValueAccessor} from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

export interface IxSelectOption {
  value: any;
  label: string;
  disabled?: boolean;
}

export interface IxSelectOptionGroup {
  label: string;
  options: IxSelectOption[];
  disabled?: boolean;
}

@Component({
  selector: 'ix-select',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IxSelectComponent),
      multi: true
    }
  ],
  templateUrl: './ix-select.component.html',
  styleUrls: ['./ix-select.component.scss']
})
export class IxSelectComponent implements ControlValueAccessor {
  options = input<IxSelectOption[]>([]);
  optionGroups = input<IxSelectOptionGroup[]>([]);
  placeholder = input<string>('Select an option');
  disabled = input<boolean>(false);
  testId = input<string>('');

  selectionChange = output<any>();

  // Internal state signals
  protected isOpen = signal<boolean>(false);
  protected selectedValue = signal<any>(null);
  private formDisabled = signal<boolean>(false);

  // Computed disabled state (combines input and form state)
  isDisabled = computed(() => this.disabled() || this.formDisabled());

  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor(
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef
  ) {
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
  writeValue(value: any): void {
    this.selectedValue.set(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
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

  onOptionClick(option: IxSelectOption): void {
    this.selectOption(option);
  }

  selectOption(option: IxSelectOption): void {
    if (option.disabled) {return;}

    this.selectedValue.set(option.value);
    this.onChange(option.value);
    this.selectionChange.emit(option.value);
    this.closeDropdown();
    this.cdr.markForCheck(); // Trigger change detection
  }

  // Computed properties
  isSelected = computed(() => (option: IxSelectOption): boolean => {
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

  private findOptionByValue(value: any): IxSelectOption | undefined {
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

  private compareValues(a: any, b: any): boolean {
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
