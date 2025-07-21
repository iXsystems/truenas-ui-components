import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, forwardRef, HostListener, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

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
  @Input() options: IxSelectOption[] = [];
  @Input() optionGroups: IxSelectOptionGroup[] = [];
  @Input() placeholder = 'Select an option';
  @Input() disabled = false;
  @Input() testId = '';

  @Output() selectionChange = new EventEmitter<any>();

  protected isOpen = false;
  public selectedValue: any = null;

  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor(
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef
  ) {}

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.selectedValue = value;
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
  toggleDropdown(): void {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.onTouched();
    }
  }

  closeDropdown(): void {
    this.isOpen = false;
    this.onTouched();
  }

  onOptionClick(option: IxSelectOption): void {
    this.selectOption(option);
  }

  selectOption(option: IxSelectOption): void {
    if (option.disabled) return;

    this.selectedValue = option.value;
    this.onChange(option.value);
    this.selectionChange.emit(option.value);
    this.closeDropdown();
    this.cdr.markForCheck(); // Trigger change detection
  }

  isSelected(option: IxSelectOption): boolean {
    return this.compareValues(this.selectedValue, option.value);
  }

  getDisplayText(): string {
    if (this.selectedValue === null || this.selectedValue === undefined) {
      return this.placeholder;
    }
    const option = this.findOptionByValue(this.selectedValue);
    return option ? option.label : this.selectedValue;
  }

  private findOptionByValue(value: any): IxSelectOption | undefined {
    // Search in regular options first
    const regularOption = this.options.find(opt => this.compareValues(opt.value, value));
    if (regularOption) return regularOption;

    // Search in option groups
    for (const group of this.optionGroups) {
      const groupOption = group.options.find(opt => this.compareValues(opt.value, value));
      if (groupOption) return groupOption;
    }

    return undefined;
  }

  hasAnyOptions(): boolean {
    return this.options.length > 0 || this.optionGroups.length > 0;
  }

  private compareValues(a: any, b: any): boolean {
    if (a === b) return true;
    if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
      return JSON.stringify(a) === JSON.stringify(b);
    }
    return false;
  }

  // Click outside to close
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.closeDropdown();
    }
  }

  // Keyboard navigation
  onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        if (!this.isOpen) {
          this.toggleDropdown();
          event.preventDefault();
        }
        break;
      case 'Escape':
        if (this.isOpen) {
          this.closeDropdown();
          event.preventDefault();
        }
        break;
      case 'ArrowDown':
        if (!this.isOpen) {
          this.toggleDropdown();
        }
        event.preventDefault();
        break;
    }
  }
}
