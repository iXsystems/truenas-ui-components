import { FocusMonitor, A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import type { ElementRef, AfterViewInit, OnDestroy} from '@angular/core';
import { Component, viewChild, inject, input, output, computed, signal, forwardRef, contentChildren, Directive } from '@angular/core';
import type { ControlValueAccessor} from '@angular/forms';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Directive to mark content for projection into the checkbox label area.
 * Use when the label needs rich content (links, icons, etc.) instead of plain text.
 *
 * @example
 * ```html
 * <tn-checkbox formControlName="terms">
 *   <span tnCheckboxLabel>I agree to the <a href="/terms">Terms</a></span>
 * </tn-checkbox>
 * ```
 */
@Directive({
  selector: '[tnCheckboxLabel]',
  standalone: true,
})
export class TnCheckboxLabelDirective {}

@Component({
  selector: 'tn-checkbox',
  standalone: true,
  imports: [CommonModule, FormsModule, A11yModule],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TnCheckboxComponent),
      multi: true
    }
  ]
})
export class TnCheckboxComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  checkboxEl = viewChild.required<ElementRef<HTMLInputElement>>('checkboxEl');

  label = input<string>('Checkbox');
  hideLabel = input<boolean>(false);
  disabled = input<boolean>(false);
  required = input<boolean>(false);
  indeterminate = input<boolean>(false);
  testId = input<string | undefined>(undefined);
  error = input<string | null>(null);
  checked = input<boolean>(false);

  change = output<boolean>();

  private labelContent = contentChildren(TnCheckboxLabelDirective);
  protected hasProjectedLabel = computed(() => this.labelContent().length > 0);

  id = `tn-checkbox-${Math.random().toString(36).substr(2, 9)}`;

  // Internal state for CVA
  private internalChecked = signal<boolean>(false);
  private cvaControlled = signal(false);

  // CVA disabled state management
  private formDisabled = signal<boolean>(false);
  isDisabled = computed(() => this.disabled() || this.formDisabled());

  private focusMonitor = inject(FocusMonitor);
  private onChange = (_: boolean) => {};
  private onTouched = () => {};

  ngAfterViewInit() {
    const checkboxEl = this.checkboxEl();
    if (checkboxEl) {
      this.focusMonitor.monitor(checkboxEl)
        .subscribe(() => {
          // Focus monitoring for accessibility
        });
    }
  }

  ngOnDestroy() {
    const checkboxEl = this.checkboxEl();
    if (checkboxEl) {
      this.focusMonitor.stopMonitoring(checkboxEl);
    }
  }

  // CVA takes precedence once a form control has written a value
  effectiveChecked = computed(() =>
    this.cvaControlled() ? this.internalChecked() : this.checked()
  );

  // ControlValueAccessor implementation
  writeValue(value: boolean): void {
    this.cvaControlled.set(true);
    this.internalChecked.set(value !== null && value !== undefined ? value : false);
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

  onCheckboxChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;
    this.internalChecked.set(checked);
    this.onChange(checked);
    this.onTouched();
    this.change.emit(checked);
  }

  classes = computed(() => {
    const classes = ['tn-checkbox'];

    if (this.isDisabled()) {
      classes.push('tn-checkbox--disabled');
    }

    if (this.error()) {
      classes.push('tn-checkbox--error');
    }

    if (this.indeterminate()) {
      classes.push('tn-checkbox--indeterminate');
    }

    return classes;
  });
}