import { Component, Input, Output, EventEmitter, forwardRef, ChangeDetectionStrategy, ViewEncapsulation, HostBinding, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { A11yModule } from '@angular/cdk/a11y';
import { IxButtonToggleGroupComponent } from './ix-button-toggle-group.component';

let nextId = 0;

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
      [class.ix-button-toggle__button--checked]="checked"
      [disabled]="disabled"
      [attr.aria-pressed]="checked"
      [attr.aria-label]="ariaLabel || null"
      [attr.aria-labelledby]="ariaLabelledby"
      [attr.id]="buttonId"
      (click)="toggle()">
      <span class="ix-button-toggle__label">
        <span class="ix-button-toggle__check" *ngIf="checked">✓</span>
        <ng-content></ng-content>
      </span>
    </button>
  `,
  styleUrl: './ix-button-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'ix-button-toggle',
    '[attr.id]': 'id',
    '[class.ix-button-toggle--checked]': 'checked',
    '[class.ix-button-toggle--disabled]': 'disabled',
    '[class.ix-button-toggle--standalone]': '!buttonToggleGroup'
  }
})
export class IxButtonToggleComponent implements ControlValueAccessor {
  private static _uniqueIdCounter = 0;

  @Input() id: string = `ix-button-toggle-${IxButtonToggleComponent._uniqueIdCounter++}`;
  @Input() value: any;
  @Input() disabled = false;
  @Input() checked = false;
  @Input() ariaLabel: string = '';
  @Input() ariaLabelledby: string = '';

  @Output() change = new EventEmitter<{ source: IxButtonToggleComponent; value: any }>();

  buttonId: string;
  buttonToggleGroup?: IxButtonToggleGroupComponent;

  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor(private cdr: ChangeDetectorRef) {
    this.buttonId = this.id + '-button';
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.checked = !!value;
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

  toggle(): void {
    if (this.disabled) {
      return;
    }

    // If part of a group, let the group handle the state
    if (this.buttonToggleGroup) {
      this.buttonToggleGroup._onButtonToggleClick(this);
    } else {
      // Standalone toggle - handle its own state
      this.checked = !this.checked;
      this.onChange(this.checked);
      this.onTouched();
      
      this.change.emit({
        source: this,
        value: this.value || this.checked
      });
    }
  }

  @HostListener('focus')
  focus(): void {
    this.onTouched();
  }

  // Method for group to mark this toggle as checked
  _markForCheck(): void {
    this.checked = true;
    this.cdr.markForCheck();
  }

  // Method for group to mark this toggle as unchecked
  _markForUncheck(): void {
    this.checked = false;
    this.cdr.markForCheck();
  }
}