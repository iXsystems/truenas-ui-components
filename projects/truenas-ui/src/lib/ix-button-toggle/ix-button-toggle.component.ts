import { Component, input, output, signal, computed, forwardRef, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { A11yModule } from '@angular/cdk/a11y';
import { IxButtonToggleGroupComponent } from './ix-button-toggle-group.component';

@Component({
  selector: 'ix-button-toggle',
  standalone: true,
  imports: [CommonModule, A11yModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IxButtonToggleComponent),
      multi: true
    }
  ],
  template: `
    <button
      type="button"
      class="ix-button-toggle__button"
      [class.ix-button-toggle__button--checked]="checked()"
      [disabled]="isDisabled()"
      [attr.aria-pressed]="checked()"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-labelledby]="ariaLabelledby()"
      [attr.id]="buttonId()"
      (click)="toggle()">
      <span class="ix-button-toggle__label">
        <span class="ix-button-toggle__check" *ngIf="checked()">✓</span>
        <ng-content></ng-content>
      </span>
    </button>
  `,
  styleUrl: './ix-button-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'ix-button-toggle',
    '[attr.id]': 'id()',
    '[class.ix-button-toggle--checked]': 'checked()',
    '[class.ix-button-toggle--disabled]': 'isDisabled()',
    '[class.ix-button-toggle--standalone]': '!buttonToggleGroup',
    '(focus)': 'onFocus()'
  }
})
export class IxButtonToggleComponent implements ControlValueAccessor {
  private static _uniqueIdCounter = 0;

  id = input<string>(`ix-button-toggle-${IxButtonToggleComponent._uniqueIdCounter++}`);
  value = input<any>(undefined);
  disabled = input<boolean>(false);
  checked = signal<boolean>(false);
  ariaLabel = input<string>('');
  ariaLabelledby = input<string>('');

  change = output<{ source: IxButtonToggleComponent; value: any }>();

  buttonId = computed(() => this.id() + '-button');
  buttonToggleGroup?: IxButtonToggleGroupComponent;

  private formDisabled = signal<boolean>(false);

  // Computed disabled state (combines input and form state)
  isDisabled = computed(() => this.disabled() || this.formDisabled());

  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor(private cdr: ChangeDetectorRef) {}

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.checked.set(!!value);
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