
import { ChangeDetectorRef, Component, computed, effect, ElementRef, forwardRef, inject, input, output, signal } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TnCheckboxComponent } from '../checkbox/checkbox.component';

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
  imports: [TnCheckboxComponent],
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
  multiple = input<boolean>(false);
  compareWith = input<(a: T | null, b: T | null) => boolean>();

  selectionChange = output<T>();
  /** Emits the full array of selected values after each toggle in multiple mode. */
  multiSelectionChange = output<T[]>();

  // Internal state signals
  protected isOpen = signal<boolean>(false);
  protected selectedValue = signal<T | null>(null);
  protected selectedValues = signal<T[]>([]);
  private formDisabled = signal<boolean>(false);

  // Computed disabled state (combines input and form state)
  isDisabled = computed(() => this.disabled() || this.formDisabled());

  private onChange = (_value: T | T[] | null) => {};
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
  writeValue(value: T | T[] | null): void {
    if (this.multiple()) {
      if (Array.isArray(value)) {
        this.selectedValues.set(value);
      } else {
        this.selectedValues.set(value != null ? [value] : []);
      }
    } else {
      this.selectedValue.set(Array.isArray(value) ? value[0] ?? null : value);
    }
  }

  registerOnChange(fn: (value: T | T[] | null) => void): void {
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

  onOptionClick(option: TnSelectOption<T>, groupDisabled = false): void {
    if (option.disabled || groupDisabled) {return;}

    if (this.multiple()) {
      this.toggleOption(option);
    } else {
      this.selectOption(option);
    }
  }

  selectOption(option: TnSelectOption<T>): void {
    if (option.disabled) {return;}

    this.selectedValue.set(option.value);
    this.onChange(option.value);
    this.selectionChange.emit(option.value);
    this.closeDropdown();
    this.cdr.markForCheck();
  }

  private toggleOption(option: TnSelectOption<T>): void {
    const current = this.selectedValues();
    const index = current.findIndex(v => this.compareValues(v, option.value));

    let updated: T[];
    if (index >= 0) {
      updated = current.filter((_, i) => i !== index);
    } else {
      updated = [...current, option.value];
    }

    this.selectedValues.set(updated);
    this.onChange(updated);
    this.multiSelectionChange.emit(updated);
    this.cdr.markForCheck();
  }

  isOptionSelected(option: TnSelectOption<T>): boolean {
    if (this.multiple()) {
      return this.selectedValues().some(v => this.compareValues(v, option.value));
    }
    return this.compareValues(this.selectedValue(), option.value);
  }

  getDisplayText = computed(() => {
    if (this.multiple()) {
      const values = this.selectedValues();
      if (values.length === 0) {
        return this.placeholder();
      }
      const labels = values
        .map(v => this.findOptionByValue(v)?.label ?? String(v))
        .filter(Boolean);
      return labels.join(', ');
    }

    const value = this.selectedValue();
    if (value === null || value === undefined) {
      return this.placeholder();
    }
    const option = this.findOptionByValue(value);
    return option ? option.label : String(value);
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
    const customCompare = this.compareWith();
    if (customCompare) {
      return customCompare(a, b);
    }
    if (a === b) {return true;}
    if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
      return JSON.stringify(a) === JSON.stringify(b);
    }
    return false;
  }

  // Keyboard navigation
  // TODO: Add ArrowUp/ArrowDown option navigation, Enter/Space toggle,
  // and aria-activedescendant tracking for full keyboard accessibility.
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
