import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { Component, input, output, signal, computed, forwardRef, ChangeDetectionStrategy, ViewEncapsulation, inject } from '@angular/core';
import type { ControlValueAccessor} from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { TnButtonToggleGroupComponent } from './button-toggle-group.component';

@Component({
  selector: 'tn-button-toggle',
  standalone: true,
  imports: [CommonModule, A11yModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TnButtonToggleComponent),
      multi: true
    }
  ],
  templateUrl: './button-toggle.component.html',
  styleUrl: './button-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'tn-button-toggle',
    '[attr.id]': 'id()',
    '[class.tn-button-toggle--checked]': 'checked()',
    '[class.tn-button-toggle--disabled]': 'isDisabled()',
    '[class.tn-button-toggle--standalone]': '!buttonToggleGroup',
    '(focus)': 'onFocus()'
  }
})
export class TnButtonToggleComponent implements ControlValueAccessor {
  cdr = inject(ChangeDetectorRef);

  private static _uniqueIdCounter = 0;

  id = input<string>(`tn-button-toggle-${TnButtonToggleComponent._uniqueIdCounter++}`);
  value = input<unknown>(undefined);
  disabled = input<boolean>(false);
  checked = signal<boolean>(false);
  ariaLabel = input<string>('');
  ariaLabelledby = input<string>('');

  change = output<{ source: TnButtonToggleComponent; value: unknown }>();

  buttonId = computed(() => this.id() + '-button');
  buttonToggleGroup?: TnButtonToggleGroupComponent;

  private formDisabled = signal<boolean>(false);

  // Computed disabled state (combines input and form state)
  isDisabled = computed(() => this.disabled() || this.formDisabled());

  private onChange = (_value: boolean) => {};
  private onTouched = () => {};

  // ControlValueAccessor implementation
  writeValue(value: boolean): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  toggle(): void {
    if (this.isDisabled()) {
      return;
    }

    // If part of a group, let the group handle the state
    if (this.buttonToggleGroup) {
      this.buttonToggleGroup._onButtonToggleClick(this);
    } else {
      // Standalone toggle - handle its own state
      const newValue = !this.checked();
      this.checked.set(newValue);
      this.onChange(newValue);
      this.onTouched();

      this.change.emit({
        source: this,
        value: this.value() || newValue
      });
    }
  }

  onFocus(): void {
    this.onTouched();
  }

  // Method for group to mark this toggle as checked
  _markForCheck(): void {
    this.checked.set(true);
    this.cdr.markForCheck();
  }

  // Method for group to mark this toggle as unchecked
  _markForUncheck(): void {
    this.checked.set(false);
    this.cdr.markForCheck();
  }
}