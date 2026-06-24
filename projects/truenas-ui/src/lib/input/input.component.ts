import { FocusMonitor, A11yModule } from '@angular/cdk/a11y';
import type { ElementRef, AfterViewInit, OnDestroy} from '@angular/core';
import { Component, viewChild, inject, input, output, computed, signal, linkedSignal, forwardRef } from '@angular/core';
import type { ControlValueAccessor} from '@angular/forms';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputType } from '../enums/input-type.enum';
import { tnIconMarker } from '../icon/icon-marker';
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
   *
   * Note: this drives only the native/a11y semantics. When wrapped in a
   * `tn-form-field`, the visual `*` indicator is inferred automatically from the
   * control's `Validators.required`; only validator-less setups need the form
   * field's own `required` input alongside this one.
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

  /**
   * Optional model→display transform, applied on the standard text path (it is
   * ignored in `Size`/`Number` modes, which own their own formatting). Mirrors
   * ix-input's `format`: the form model is rendered through this function — e.g.
   * a byte count shown as `2 GiB`. Only truthy models are formatted; null/empty
   * render blank. On blur the display is re-derived through this function so it
   * shows the canonical form.
   *
   * Intended to be paired with `parse` (the inverse transform). On its own,
   * `format` only canonicalizes the display on blur while the model keeps the
   * raw typed text, so display and model diverge (`"2 MiB"` shown, `"2"` stored);
   * supply `parse` whenever the formatted display isn't already a valid model.
   */
  format = input<((value: string | number | null) => string) | undefined>(undefined);

  /**
   * Optional display→model transform, applied on the standard text path (it is
   * ignored in `Size`/`Number` modes). Mirrors ix-input's `parse`: the typed
   * text is emitted to the form model through this function — e.g. `2 GiB` → a
   * byte count, or a bare host → a full URL. The field keeps showing what the
   * user typed until blur, when the display is canonicalized via `format` (if
   * set) or replaced by the parsed model. An empty field emits `''` without
   * calling `parse`.
   */
  parse = input<((value: string) => string | number | null) | undefined>(undefined);

  /**
   * Whether a `Password` field renders the built-in visibility toggle — the eye
   * button that switches the field between masked and plain-text display.
   * Defaults to true; set false for secrets that must never be revealed.
   * Setting `suffixIcon` suppresses the toggle automatically (a custom suffix
   * control replaces it). Ignored unless `inputType` is `Password`.
   */
  showPasswordToggle = input<boolean>(true);

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
  /** True when the field is a password field. */
  isPassword = computed(() => this.inputType() === InputType.Password);
  /** True when either custom transform is provided — i.e. the value-transform text path is active. */
  hasValueTransform = computed(() => !!this.format() || !!this.parse());
  /**
   * Whether the password is currently revealed. Not exposed as an input so a
   * reveal is always an explicit user gesture, and linked to the toggle's own
   * availability so a revealed value never outlives the control that revealed
   * it: whenever the toggle goes away (the field leaves password mode,
   * `showPasswordToggle` flips off, a `suffixIcon` replaces it) or the field
   * is disabled, the field snaps back to masked.
   */
  protected passwordVisible = linkedSignal({
    source: () => this.hasPasswordToggle() && !this.isDisabled(),
    computation: () => false,
  });
  /** The `type` attribute actually rendered. Number and size modes use a text input: number avoids the native type="number" footguns, size must accept unit letters. A revealed password renders as text — flipping the type attribute is the standard reveal mechanism and preserves value and caret. */
  resolvedType = computed(() => {
    if (this.isNumeric() || this.isSize()) {return InputType.PlainText;}
    if (this.isPassword() && this.passwordVisible()) {return InputType.PlainText;}
    return this.inputType();
  });
  /** `inputmode` hint: numeric keypad for integers, decimal keypad otherwise. Null (omitted) outside number mode — size fields accept unit letters, so they keep the full keyboard. */
  numericInputMode = computed<'numeric' | 'decimal' | null>(() => {
    if (!this.isNumeric()) {return null;}
    return this.integerOnly() ? 'numeric' : 'decimal';
  });
  /** Number and size modes are always single-line; they win over `multiline` if both are set. */
  showTextarea = computed(() => this.multiline() && !this.isNumeric() && !this.isSize());
  /**
   * The visibility toggle renders only on single-line password fields (a
   * password+multiline combo renders a textarea, which has no `type` to flip),
   * and yields to a consumer-provided `suffixIcon` — a custom suffix control
   * replaces the built-in toggle rather than stacking a second button.
   */
  protected hasPasswordToggle = computed(() =>
    this.isPassword() && this.showPasswordToggle() && !this.showTextarea() && !this.hasSuffixIcon()
  );
  /**
   * Icon for the visibility toggle, mirroring the field's current state: a
   * slashed eye while masked, an open eye while revealed. The literal
   * `tnIconMarker` calls double as build-time markers that pull both icons
   * into the sprite.
   */
  protected passwordToggleIcon = computed(() =>
    this.passwordVisible() ? tnIconMarker('eye', 'mdi') : tnIconMarker('eye-off', 'mdi')
  );
  /**
   * Role-first test-id segments for the visibility toggle:
   * `button-toggle-password[-<testId>]`. The toggle is fixed field chrome, so
   * the role leads (matching the dialog-shell close/fullscreen convention) and
   * automation can target every password toggle with one prefix selector.
   */
  protected passwordToggleTestId = computed<(string | number | null | undefined)[]>(() => {
    const base = this.testId();
    return ['toggle-password', ...(Array.isArray(base) ? base : [base])];
  });

  // Unique per instance: a hard-coded id produced duplicate ids when multiple
  // tn-inputs share a page (invalid HTML, and it breaks any future label `for=`,
  // aria-describedby, or getElementById targeting this input).
  id = `tn-input-${nextId++}`;
  // Protected: the display string is owned by the component and driven through the
  // CVA flow (writeValue / onValueChange). External writes would bypass that flow.
  // A signal so the `[value]` binding reflects writeValue reactively — a plain field
  // doesn't repaint when the model is written after (re)creation (e.g. a control that
  // mounts with a pre-set value), since writeValue runs outside the binding's CD pass.
  protected value = signal('');

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
      this.value.set(formatSize(value, this.sizeStandard(), this.sizeRound()));
      return;
    }
    // Custom value transform (mirrors ix-input's `format`): render the model
    // through the consumer's formatter, e.g. a byte count shown as "2 GiB".
    // Guarded on a truthy value to match the formatters' own contract (they
    // return '' for falsy) and avoid format(0)/format('') surprises; null/empty
    // fall through to the blank display below. Skipped in Number mode, which
    // owns its own display.
    const format = this.format();
    if (format && value && !this.isNumeric()) {
      this.value.set(format(value));
      return;
    }
    // Display the model verbatim via String(); do NOT sanitize here. Sanitizing a
    // canonical number string would corrupt fractions in integer mode (3.5 -> "35"),
    // silently diverging the display from the form model.
    //
    // Scientific notation is out of scope: users can't type 'e' (it's stripped), and
    // exponential-range values aren't meaningful for the fields this control targets.
    this.value.set(value === null || value === undefined ? '' : String(value));
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
      this.value.set(target.value);
      this.onChange(parseSize(this.value(), this.sizeDefaultUnit(), this.sizeStandard()));
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
      this.value.set(sanitized);
      this.onChange(this.parseNumeric(sanitized));
      return;
    }

    // Standard text path. With a custom `parse` (mirrors ix-input): keep the
    // typed text visible and emit the parsed model. An empty field emits '' as
    // is — never parse('') — so clearing the field clears the model. Without a
    // transform this collapses to emitting the raw text.
    const raw = target.value;
    this.value.set(raw);
    const parse = this.parse();
    this.onChange(parse && raw ? parse(raw) : raw);
  }

  protected onBlur(): void {
    if (this.isSize() && this.value() !== '') {
      // Canonicalize the display on blur: "2048 KiB" -> "2 MiB", "200tib" -> "200 TiB".
      // Leave unparseable text in place so the consumer's validators can flag it.
      const bytes = parseSize(this.value(), this.sizeDefaultUnit(), this.sizeStandard());
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
        if (canonical !== this.value()) {
          this.value.set(canonical);
          this.onChange(parseSize(canonical, this.sizeDefaultUnit(), this.sizeStandard()));
        }
      }
    } else if (this.hasValueTransform() && this.value() !== '' && !this.isNumeric()) {
      // Canonicalize the display on blur, mirroring both the Size branch and
      // ix-input's blur: re-derive the model from the shown text (via `parse`,
      // if any) then re-render it — through `format` when set, otherwise show
      // the parsed model verbatim (e.g. stringAsUrlParsing surfacing the
      // protocol it prepended). Only rewrite + re-emit when the canonical form
      // actually differs, so an untouched pre-filled control isn't falsely
      // marked dirty (the same guard the Size branch uses).
      const parse = this.parse();
      const format = this.format();
      const model = parse ? parse(this.value()) : this.value();
      // Only canonicalize a truthy model. A falsy model means the typed text didn't
      // parse (parse legitimately returns null/'' for unparseable input), so — like
      // the Size branch leaving text untouched when parseSize returns null — keep the
      // text the user typed so their input isn't silently wiped and the consumer's
      // validators can flag it. The model was already emitted while typing, so there's
      // nothing to re-emit here. This truthy guard also matches the one writeValue and
      // `format` apply, so a formatter written to the ''-for-falsy contract is never
      // handed null/0/''.
      if (model) {
        // Render the model back to display through `format` when set; otherwise show
        // it verbatim (e.g. stringAsUrlParsing surfacing the protocol it prepended).
        const canonical = format ? format(model) : String(model);
        if (canonical !== this.value()) {
          this.value.set(canonical);
          // Re-emit the model directly rather than re-parsing the canonical display:
          // parse is assumed idempotent over its own formatted output
          // (parse(format(x)) === x, matching the Size branch), so parse(canonical)
          // would just reproduce `model` — and emitting it avoids a second parse call.
          this.onChange(model);
        }
      }
    }
    this.onTouched();
  }

  protected togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
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
