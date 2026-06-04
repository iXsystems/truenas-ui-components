import { FocusMonitor, A11yModule } from '@angular/cdk/a11y';
import type { ElementRef, AfterViewInit, OnDestroy} from '@angular/core';
import { Component, viewChild, inject, input, output, computed, signal, forwardRef } from '@angular/core';
import type { ControlValueAccessor} from '@angular/forms';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputType } from '../enums/input-type.enum';
import type { IconLibraryType } from '../icon/icon.component';
import { TnIconComponent } from '../icon/icon.component';
import { TnTestIdDirective, type TnTestIdValue } from '../test-id';

// Module-level counter for deterministic, unique instance ids (matches the
// tn-autocomplete convention). Deterministic ids are SSR/hydration-safe and
// stable across snapshots, unlike a Math.random() seed.
let nextId = 0;

@Component({
  selector: 'tn-input',
  standalone: true,
  imports: [FormsModule, A11yModule, TnIconComponent, TnTestIdDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TnInputComponent),
      multi: true
    }
  ],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
})
export class TnInputComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  inputEl = viewChild.required<ElementRef<HTMLInputElement | HTMLTextAreaElement>>('inputEl');

  inputType = input<InputType>(InputType.PlainText);
  placeholder = input<string>('');
  testId = input<TnTestIdValue>(undefined);
  disabled = input<boolean>(false);
  multiline = input<boolean>(false);
  rows = input<number>(3);

  /**
   * Accessible name for the control. Rendered as `aria-label` on the input/textarea.
   *
   * Leave unset when the input is wrapped in a `tn-form-field` (or otherwise has a
   * visible `<label>`); set it for standalone usage so the control isn't unnamed in
   * the a11y tree.
   */
  ariaLabel = input<string | undefined>(undefined);

  /**
   * Integer/decimal switch — only meaningful when `inputType` is `InputType.Number`.
   *
   * - **`true` (default) → decimal mode**: accepts a single `.` and emits via
   *   `parseFloat`, so a `Number` field accepts `"3.5"` out of the box.
   * - **`false` → integer mode**: strips `.` and emits via `parseInt`.
   *
   * Range enforcement is intentionally left to the consumer's form validators
   * (e.g. `Validators.min`/`max`), which work because the control emits real numbers.
   */
  allowDecimals = input<boolean>(true);

  // Icon inputs
  prefixIcon = input<string | undefined>(undefined);
  prefixIconLibrary = input<IconLibraryType | undefined>(undefined);
  suffixIcon = input<string | undefined>(undefined);
  suffixIconLibrary = input<IconLibraryType | undefined>(undefined);
  suffixIconAriaLabel = input<string | undefined>(undefined);

  onSuffixAction = output<MouseEvent>();

  hasPrefixIcon = computed(() => !!this.prefixIcon());
  hasSuffixIcon = computed(() => !!this.suffixIcon());

  // Numeric mode state
  isNumeric = computed(() => this.inputType() === InputType.Number);
  /** True when the field only accepts whole numbers (i.e. `allowDecimals` is false). */
  integerOnly = computed(() => !this.allowDecimals());
  /** The `type` attribute actually rendered. Number mode uses a text input + inputmode to avoid the native type="number" footguns. */
  resolvedType = computed(() => (this.isNumeric() ? InputType.PlainText : this.inputType()));
  /** `inputmode` hint: numeric keypad for integers, decimal keypad otherwise. Null (omitted) when not in number mode. */
  numericInputMode = computed<'numeric' | 'decimal' | null>(() => {
    if (!this.isNumeric()) {return null;}
    return this.integerOnly() ? 'numeric' : 'decimal';
  });
  /** Number mode is always single-line; it wins over `multiline` if both are set. */
  showTextarea = computed(() => this.multiline() && !this.isNumeric());

  // Unique per instance: a hard-coded id produced duplicate ids when multiple
  // tn-inputs share a page (invalid HTML, and it breaks any future label `for=`,
  // aria-describedby, or getElementById targeting this input).
  id = `tn-input-${nextId++}`;
  // Protected: the display string is owned by the component and driven through the
  // CVA flow (writeValue / onValueChange). External writes would bypass that flow.
  protected value = '';

  // CVA disabled state management
  private formDisabled = signal<boolean>(false);
  isDisabled = computed(() => this.disabled() || this.formDisabled());

  private onChange: (value: string | number | null) => void = () => {};
  private onTouched = () => {};
  private focusMonitor = inject(FocusMonitor);
  // The element handed to FocusMonitor, captured so ngOnDestroy can stop monitoring
  // exactly what it started — without re-reading the required viewChild on a
  // component that may be destroyed before its view ever initialized.
  private monitoredEl?: ElementRef<HTMLInputElement | HTMLTextAreaElement>;

  ngAfterViewInit() {
    this.monitoredEl = this.inputEl();
    this.focusMonitor.monitor(this.monitoredEl);
  }

  ngOnDestroy() {
    // Stop the FocusMonitor we started in ngAfterViewInit; otherwise it keeps a
    // DOM observer alive on a detached element.
    if (this.monitoredEl) {
      this.focusMonitor.stopMonitoring(this.monitoredEl);
    }
  }

  // ControlValueAccessor implementation
  // Accepts undefined as well as the declared types: Angular may hand writeValue an
  // undefined model at init, and it maps to the empty display like null.
  writeValue(value: string | number | null | undefined): void {
    // Display the model verbatim via String(); do NOT sanitize here. Sanitizing a
    // canonical number string would corrupt fractions in integer mode (3.5 -> "35"),
    // silently diverging the display from the form model.
    //
    // Scientific notation is out of scope: users can't type 'e' (it's stripped), and
    // exponential-range values aren't meaningful for the fields this control targets.
    this.value = value === null || value === undefined ? '' : String(value);
  }

  registerOnChange(fn: (value: string | number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  // Component methods (template-bound; protected — not part of the public API)
  protected onValueChange(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;

    if (this.isNumeric()) {
      const el = target as HTMLInputElement;
      const sanitized = this.sanitizeNumeric(el.value);
      // Reflect the cleaned string back into the DOM when we stripped something
      // (e.g. the user typed "e", "+" or a second "."), keeping the field honest.
      if (sanitized !== el.value) {
        // Preserve the caret: its new position is however many characters survive
        // sanitization up to the old caret (sanitizeNumeric is a left-to-right filter).
        const caret = this.sanitizeNumeric(
          el.value.slice(0, el.selectionStart ?? el.value.length)
        ).length;
        el.value = sanitized;
        el.setSelectionRange(caret, caret);
      }
      this.value = sanitized;
      this.onChange(this.parseNumeric(sanitized));
      return;
    }

    this.value = target.value;
    this.onChange(this.value);
  }

  protected onBlur(): void {
    this.onTouched();
  }

  /** Strips any character that can't appear in the current numeric mode (single leading '-', single '.' for decimals). */
  private sanitizeNumeric(raw: string): string {
    const allowDecimal = !this.integerOnly();
    let result = '';
    let hasDot = false;

    for (const char of raw) {
      if (char >= '0' && char <= '9') {
        result += char;
      } else if (char === '-' && result.length === 0) {
        result += char;
      } else if (char === '.' && allowDecimal && !hasDot) {
        hasDot = true;
        result += char;
      }
    }

    return result;
  }

  /** Parses a sanitized string to a number, mapping empty/partial input to null (never 0). */
  private parseNumeric(value: string): number | null {
    if (value === '' || value === '-' || value === '.' || value === '-.') {
      return null;
    }
    const parsed = this.integerOnly() ? parseInt(value, 10) : parseFloat(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
}
