import { FocusMonitor, A11yModule } from '@angular/cdk/a11y';
import type { ElementRef, AfterViewInit} from '@angular/core';
import { Component, viewChild, inject, input, output, computed, signal, forwardRef } from '@angular/core';
import type { ControlValueAccessor} from '@angular/forms';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputType } from '../enums/input-type.enum';
import type { IconLibraryType } from '../icon/icon.component';
import { TnIconComponent } from '../icon/icon.component';
import { TnTestIdDirective } from '../test-id';

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
export class TnInputComponent implements AfterViewInit, ControlValueAccessor {
  inputEl = viewChild.required<ElementRef<HTMLInputElement | HTMLTextAreaElement>>('inputEl');

  inputType = input<InputType>(InputType.PlainText);
  placeholder = input<string>('');
  testId = input<string | undefined>(undefined);
  disabled = input<boolean>(false);
  multiline = input<boolean>(false);
  rows = input<number>(3);

  /**
   * Numeric step — only meaningful when `inputType` is `InputType.Number`.
   *
   * `step` doubles as the integer/decimal switch:
   * - **unset (default) or a fractional step → decimal mode**: accepts a single
   *   `.` and emits via `parseFloat`. A `Number` field therefore accepts `"3.5"`
   *   out of the box; opt into integers by passing a whole-number step.
   * - **a whole-number step (e.g. `1`, `2`) → integer mode**: strips `.` and
   *   emits via `parseInt`.
   *
   * Range enforcement is intentionally left to the consumer's form validators
   * (e.g. `Validators.min`/`max`), which work because the control emits real numbers.
   */
  step = input<number | undefined>(undefined);

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
  /** True when the field only accepts whole numbers (driven by a whole-number `step`). */
  integerOnly = computed(() => {
    const s = this.step();
    return s !== undefined && Number.isInteger(s);
  });
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
  value = '';

  // CVA disabled state management
  private formDisabled = signal<boolean>(false);
  isDisabled = computed(() => this.disabled() || this.formDisabled());

  private onChange: (value: string | number | null) => void = () => {};
  private onTouched = () => {};
  private focusMonitor = inject(FocusMonitor);

  ngAfterViewInit() {
    this.focusMonitor.monitor(this.inputEl());
  }

  // ControlValueAccessor implementation
  writeValue(value: string | number | null): void {
    // Display the model verbatim via String(); do NOT sanitize here. Sanitizing a
    // canonical number string corrupts values JS renders in exponential notation
    // (1e21 -> "1e+21" -> "121") or fractions in integer mode (3.5 -> "35"), which
    // would silently diverge the displayed value from the form model.
    //
    // Caveat: a value JS stringifies with an exponent (|x| >= 1e21 or < 1e-6) is
    // shown in exponential form, which this field can't represent — the first edit
    // sanitizes the 'e'/'+' away and collapses it (1e+21 -> 121), changing the
    // model. Avoid programmatically setting values outside the plain-decimal range.
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

  // Component methods
  onValueChange(event: Event): void {
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

  onBlur(): void {
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
