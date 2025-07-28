import { Component, Input, Output, EventEmitter, ContentChildren, QueryList, AfterContentInit, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IxListOptionComponent } from '../ix-list-option/ix-list-option.component';

export interface IxSelectionChange {
  source: IxSelectionListComponent;
  options: IxListOptionComponent[];
}

@Component({
  selector: 'ix-selection-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ix-selection-list.component.html',
  styleUrl: './ix-selection-list.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IxSelectionListComponent),
      multi: true
    }
  ],
  host: {
    'class': 'ix-selection-list',
    '[class.ix-selection-list--dense]': 'dense',
    '[class.ix-selection-list--disabled]': 'disabled',
    'role': 'listbox',
    '[attr.aria-multiselectable]': 'multiple'
  }
})
export class IxSelectionListComponent implements AfterContentInit, ControlValueAccessor {
  @Input() dense = false;
  @Input() disabled = false;
  @Input() multiple = true;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';

  @Output() selectionChange = new EventEmitter<IxSelectionChange>();

  @ContentChildren(forwardRef(() => IxListOptionComponent), { descendants: true })
  options!: QueryList<IxListOptionComponent>;

  private onChange = (_: any) => {};
  private onTouched = () => {};

  ngAfterContentInit(): void {
    this.options.forEach(option => {
      option.selectionList = this;
      option.color = this.color;
    });

    this.options.changes.subscribe(() => {
      this.options.forEach(option => {
        option.selectionList = this;
        option.color = this.color;
      });
    });
  }

  // ControlValueAccessor implementation
  writeValue(value: any[]): void {
    if (value && this.options) {
      this.options.forEach(option => {
        option.selected = value.includes(option.value);
      });
    }
  }

  registerOnChange(fn: (value: any[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.options) {
      this.options.forEach(option => {
        option.disabled = isDisabled;
      });
    }
  }

  onOptionSelectionChange(): void {
    this.onTouched();
    const selectedValues = this.options
      .filter(option => option.selected)
      .map(option => option.value);
    
    this.onChange(selectedValues);
    
    this.selectionChange.emit({
      source: this,
      options: this.options.filter(option => option.selected)
    });
  }

  get selectedOptions(): IxListOptionComponent[] {
    return this.options ? this.options.filter(option => option.selected) : [];
  }
}