import { Component, input, output, contentChildren, signal, computed, forwardRef, effect } from '@angular/core';
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
    '[class.ix-selection-list--dense]': 'dense()',
    '[class.ix-selection-list--disabled]': 'isDisabled()',
    'role': 'listbox',
    '[attr.aria-multiselectable]': 'multiple()'
  }
})
export class IxSelectionListComponent implements ControlValueAccessor {
  dense = input<boolean>(false);
  disabled = input<boolean>(false);
  multiple = input<boolean>(true);
  color = input<'primary' | 'accent' | 'warn'>('primary');

  selectionChange = output<IxSelectionChange>();

  options = contentChildren(IxListOptionComponent, { descendants: true });

  private formDisabled = signal<boolean>(false);

  // Computed disabled state (combines input and form state)
  isDisabled = computed(() => this.disabled() || this.formDisabled());

  private onChange = (_: any) => {};
  private onTouched = () => {};

  constructor() {
    // Effect to update options when they change
    effect(() => {
      const opts = this.options();
      const currentColor = this.color();
      opts.forEach(option => {
        option.selectionList = this;
        option.internalColor.set(currentColor);
      });
    });
  }

  // ControlValueAccessor implementation
  writeValue(value: any[]): void {
    if (value) {
      const opts = this.options();
      opts.forEach(option => {
        option.internalSelected.set(value.includes(option.value()));
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
    this.formDisabled.set(isDisabled);
    const opts = this.options();
    opts.forEach(option => {
      option.internalDisabled.set(isDisabled);
    });
  }

  onOptionSelectionChange(): void {
    this.onTouched();
    const opts = this.options();
    const selectedValues = opts
      .filter(option => option.effectiveSelected())
      .map(option => option.value());

    this.onChange(selectedValues);

    this.selectionChange.emit({
      source: this,
      options: opts.filter(option => option.effectiveSelected())
    });
  }

  get selectedOptions(): IxListOptionComponent[] {
    const opts = this.options();
    return opts.filter(option => option.effectiveSelected());
  }
}