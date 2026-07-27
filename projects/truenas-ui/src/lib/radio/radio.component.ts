import { FocusMonitor, A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import type { ElementRef, AfterViewInit, OnDestroy} from '@angular/core';
import { Component, viewChild, inject, input, output, computed, signal, forwardRef } from '@angular/core';
import type { ControlValueAccessor} from '@angular/forms';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LabelMarkupPipe } from '../pipes/label-markup/label-markup.pipe';
import { TnTestIdDirective, controlTestId, type TnTestIdValue } from '../test-id';

@Component({
  selector: 'tn-radio',
  standalone: true,
  imports: [CommonModule, FormsModule, A11yModule, TnTestIdDirective, LabelMarkupPipe],
  templateUrl: './radio.component.html',
  styleUrl: './radio.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TnRadioComponent),
      multi: true
    }
  ]
})
export class TnRadioComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  radioEl = viewChild.required<ElementRef<HTMLInputElement>>('radioEl');

  label = input<string>('Radio');
  value = input<unknown>('');
  name = input<string | undefined>(undefined);
  disabled = input<boolean>(false);
  required = input<boolean>(false);
  testId = input<TnTestIdValue>(undefined);
  /** Test-id base, falling back to the bound control name when `testId` is unset. */
  protected resolvedTestId = controlTestId(this.testId);
  error = input<string | null>(null);

  change = output<unknown>();

  id = `tn-radio-${Math.random().toString(36).substr(2, 9)}`;
  checked = false;

  // CVA disabled state management
  private formDisabled = signal<boolean>(false);
  isDisabled = computed(() => this.disabled() || this.formDisabled());

  private focusMonitor = inject(FocusMonitor);
  private onChange = (_: unknown) => {};
  private onTouched = () => {};

  ngAfterViewInit() {
    const radioEl = this.radioEl();
    if (radioEl) {
      this.focusMonitor.monitor(radioEl)
        .subscribe(() => {
          // Focus monitoring for accessibility
        });
    }
  }

  ngOnDestroy() {
    const radioEl = this.radioEl();
    if (radioEl) {
      this.focusMonitor.stopMonitoring(radioEl);
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: unknown): void {
    this.checked = value !== null && value !== undefined && value === this.value();
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  onRadioChange(event: Event): void {
    // The bubbling native change would reach ancestor (change) bindings in
    // addition to the component's `change` output — Ivy invokes the binding for
    // both, firing every listener twice per toggle. The output is the single
    // public event, so the native event stops here.
    event.stopPropagation();
    const target = event.target as HTMLInputElement;
    this.checked = target.checked;
    if (target.checked) {
      this.onChange(this.value());
      this.onTouched();
      this.change.emit(this.value());
    }
  }

  classes = computed(() => {
    const classes = ['tn-radio'];

    if (this.isDisabled()) {
      classes.push('tn-radio--disabled');
    }

    if (this.error()) {
      classes.push('tn-radio--error');
    }

    return classes;
  });
}