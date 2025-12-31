import { CommonModule } from '@angular/common';
import { Component, input, output, contentChildren, signal, computed, forwardRef, effect } from '@angular/core';
import type { ControlValueAccessor} from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TnListOptionComponent } from '../list-option/list-option.component';

export interface TnSelectionChange {
  source: TnSelectionListComponent;
  options: TnListOptionComponent[];
}

@Component({
  selector: 'ix-selection-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selection-list.component.html',
  styleUrl: './selection-list.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TnSelectionListComponent),
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
export class TnSelectionListComponent implements ControlValueAccessor {
  dense = input<boolean>(false);
  disabled = input<boolean>(false);
  multiple = input<boolean>(true);
  color = input<'primary' | 'accent' | 'warn'>('primary');

  selectionChange = output<TnSelectionChange>();

  options = contentChildren(TnListOptionComponent, { descendants: true });

  private formDisabled = signal<boolean>(false);

  // Computed disabled state (combines input and form state)
  isDisabled = computed(() => this.disabled() || this.formDisabled());

  private onChange = (_: unknown[]) => {};
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
  writeValue(value: unknown[]): void {
    if (value) {
      const opts = this.options();
      opts.forEach(option => {
        option.internalSelected.set(value.includes(option.value()));
      });
    }
  }

  registerOnChange(fn: (value: unknown[]) => void): void {
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

  get selectedOptions(): TnListOptionComponent[] {
    const opts = this.options();
    return opts.filter(option => option.effectiveSelected());
  }
}