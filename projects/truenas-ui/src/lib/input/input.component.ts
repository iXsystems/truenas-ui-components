import { FocusMonitor, A11yModule } from '@angular/cdk/a11y';
import type { ElementRef, AfterViewInit, OnDestroy} from '@angular/core';
import { Component, viewChild, inject, input, output, computed, signal, forwardRef } from '@angular/core';
import type { ControlValueAccessor} from '@angular/forms';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputType } from '../enums/input-type.enum';
import type { IconLibraryType } from '../icon/icon.component';
import { TnIconComponent } from '../icon/icon.component';
import { TnTestIdDirective, type TnTestIdValue } from '../test-id';
import { formatSize, parseSize, type SizeStandard } from './size-conversion';

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
   * Native `autocomplete` hint rendered on the input/textarea. Pass the standard
   * autofill tokens (`'username'`, `'current-password'`, `'new-password'`,
   * `'one-time-code'`, ...) so browsers and password managers can identify and
   * fill the field.
   */
  autocomplete = input<string | undefined>(undefined);

  /**
   * Native `name` attribute rendered on the input/textarea. Browsers and password
   * managers use it to identify the field; typically mirrors the form control name.
   */
  name = input<string | undefined>(undefined);

  /**
   * Renders the native `readonly` attribute: the value is visible, focusable and
   * selectable but not editable. Unlike `disabled`, a readonly field stays in the
   * tab order and its form control stays enabled.
   */
  readonly = input<boolean>(false);

  /**
   * Renders the native `required` attribute so browsers and assistive technology
   * expose the field as required. Validation itself stays with the consumer's form
   * validators (e.g. `Validators.required`); forms that fully own validation UX
   * should also set `novalidate` to suppress native submit blocking.
   */
  required = input<boolean>(false);

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

  /**
   * Unit standard for the `Size` input type — `iec` (base-2, `KiB`/`MiB`) or
   * `si` (base-10, `kB`/`MB`). Drives both the formatted display and how bare
   * numbers are scaled when parsing. Ignored unless `inputType` is `Size`.
   */
  sizeStandard = input<SizeStandard>('iec');

  /**
   * Unit assumed when a user types a bare number (no unit) into a `Size` field —
   * e.g. with the default `MiB`, typing `200` yields 200 MiB. Accepts IEC
   * (`KiB`), short (`KB`), or human (`K`) spellings. Ignored unless `inputType`
   * is `Size`.
   */
  sizeDefaultUnit = input<string>('MiB');

  /**
   * Decimal places used when formatting a `Size` field's value for display
   * (e.g. `1.5 GiB`). Ignored unless `inputType` is `Size`.
   */
  sizeRound = input<number>(2);

  // Icon inputs
  prefixIcon = input<string | undefined>(undefined);
  prefixIconLibrary = input<IconLibraryType | undefined>(undefined);
  suffixIcon = input<string | undefined>(undefined);
  suffixIconLibrary = input<IconLibraryType | undefined>(undefined);
  suffixIconAriaLabel = input<string | undefined>(undefined);

  /**
   * Semantic test-id base for the suffix-action button. The library prepends the
   * element type (`button`) and renders the result under whichever attribute name
   * is configured via `TN_TEST_ATTR` (default `data-testid`) — e.g.
   * `suffixActionTestId="toggle-password"` → `button-toggle-password`.
   */
  suffixActionTestId = input<TnTestIdValue>(undefined);

  onSuffixAction = output<MouseEvent>();

  hasPrefixIcon = computed(() => !!this.prefixIcon());
  hasSuffixIcon = computed(() => !!this.suffixIcon());

  // Numeric mode state
  isNumeric = computed(() => this.inputType() === InputType.Number);
  /** True when the field is in data-size mode (human-readable string ⇄ byte-count model). */
  isSize = computed(() => this.inputType() === InputType.Size);
  /** True when the field only accepts whole numbers (i.e. `allowDecimals` is false). */
  integerOnly = computed(() => !this.allowDecimals());
  /** The `type` attribute actually rendered. Number and size modes use a text input: number avoids the native type="number" footguns, size must accept unit letters. */
  resolvedType = computed(() => (this.isNumeric() || this.isSize() ? InputType.PlainText : this.inputType()));
  /** `inputmode` hint: numeric keypad for integers, decimal keypad otherwise. Null (omitted) outside number mode — size fields accept unit letters, so they keep the full keyboard. */
  numericInputMode = computed<'numeric' | 'decimal' | null>(() => {
    if (!this.isNumeric()) {return null;}
    return this.integerOnly() ? 'numeric' : 'decimal';
  });
  /** Number and size modes are always single-line; they win over `multiline` if both are set. */
  showTextarea = computed(() => this.multiline() && !this.isNumeric() && !this.isSize());

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
    if (this.isSize()) {
      // The model is a byte count; show it as a human-readable string. Empty/null
      // stays blank, and a non-numeric model maps to blank (formatSize returns '').
      this.value = formatSize(value, this.sizeStandard(), this.sizeRound());
      return;
    }
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

    if (this.isSize()) {
      // Keep the raw text in the field as the user types (unit letters and all);
      // emit the parsed byte count, mapping invalid/partial input to null (never 0).
      this.value = target.value;
      this.onChange(parseSize(this.value, this.sizeDefaultUnit(), this.sizeStandard()));
      return;
    }

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
    if (this.isSize() && this.value !== '') {
      // Canonicalize the display on blur: "2048 KiB" -> "2 MiB", "200tib" -> "200 TiB".
      // Leave unparseable text in place so the consumer's validators can flag it.
      const bytes = parseSize(this.value, this.sizeDefaultUnit(), this.sizeStandard());
      if (bytes !== null) {
        const canonical = formatSize(bytes, this.sizeStandard(), this.sizeRound());
        // Only rewrite + re-emit when the canonical form actually differs from what
        // the user left in the field. This both:
        //  (a) skips a no-op onChange that would mark an untouched, pre-filled
        //      control dirty (falsely tripping "unsaved changes" guards), and
        //  (b) still re-syncs the model when rounding is lossy — e.g. an edited
        //      "1.755 GiB" canonicalizes to a different string, so it emits the
        //      byte count parsed back from the rounded display, keeping
        //      parseSize(display) === model.
        if (canonical !== this.value) {
          this.value = canonical;
          this.onChange(parseSize(canonical, this.sizeDefaultUnit(), this.sizeStandard()));
        }
      }
    }
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
