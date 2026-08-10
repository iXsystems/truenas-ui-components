import { InjectionToken, computed, inject } from '@angular/core';
import type { Signal } from '@angular/core';

/**
 * Contract between `tn-form-field` and its projected form control, published
 * over DI so the control can wire its ARIA attributes to the field's chrome
 * without the consumer duplicating anything (e.g. re-passing the label as
 * `ariaLabel`).
 *
 * `tn-form-field` provides itself under {@link TN_FORM_FIELD_CONTEXT}; a
 * projected control injects it optionally (absent when used standalone) and
 * binds:
 *
 * - `aria-labelledby` ← {@link labelId} — the field's visible label names the control
 * - `aria-describedby` ← {@link describedBy} — the currently shown error or hint
 * - `aria-invalid` ← {@link errorState} — mirrors the field's visual error state
 * - `aria-required` ← {@link requiredState} — forced or inferred from validators
 *
 * Library controls consume this via {@link injectTnFormFieldAria} rather than
 * hand-rolling the bindings.
 */
export interface TnFormFieldContext {
  /** Id of the visible label text, or `null` when the field has no label. */
  labelId: Signal<string | null>;

  /** Id of the currently shown error or hint message, or `null` when neither renders. */
  describedBy: Signal<string | null>;

  /**
   * Whether the field currently shows its error state (invalid AND interacted —
   * the same gate as the visual error message, so `aria-invalid` never fires on
   * a pristine required field).
   */
  errorState: Signal<boolean>;

  /** Whether the field is required — forced via input or inferred from validators. */
  requiredState: Signal<boolean>;
}

/** DI token under which `tn-form-field` exposes its {@link TnFormFieldContext}. */
export const TN_FORM_FIELD_CONTEXT = new InjectionToken<TnFormFieldContext>('TN_FORM_FIELD_CONTEXT');

/** Ready-to-bind ARIA attribute values derived from an enclosing `tn-form-field`. */
export interface TnFormFieldAriaBindings {
  /** Value for `aria-labelledby`; `null` standalone, without a field label, or when `ariaLabel` overrides. */
  labelledby: Signal<string | null>;
  /** Value for `aria-describedby`; the shown error/hint id or `null`. */
  describedby: Signal<string | null>;
  /** Value for `aria-invalid`; `true` while the field shows an error, else `null` (attribute omitted). */
  invalid: Signal<true | null>;
  /** Value for `aria-required`; `true` when the field is required, else `null` (attribute omitted). */
  required: Signal<true | null>;
}

/**
 * Wires a form control to an enclosing `tn-form-field`'s accessibility context.
 * Must be called in an injection context (field initializer or constructor).
 *
 * Standalone usage (no enclosing field) yields all-`null` signals, so the
 * attribute bindings simply render nothing.
 *
 * @param ariaLabel The control's own explicit accessible-name input, when it has
 *   one. While set, it wins: `labelledby` goes `null` so the explicit
 *   `aria-label` is what assistive tech announces.
 */
export function injectTnFormFieldAria(ariaLabel?: Signal<string | undefined>): TnFormFieldAriaBindings {
  const field = inject(TN_FORM_FIELD_CONTEXT, { optional: true });
  return {
    labelledby: computed(() => (ariaLabel?.() ? null : field?.labelId() ?? null)),
    describedby: computed(() => field?.describedBy() ?? null),
    invalid: computed(() => (field?.errorState() ? true : null)),
    required: computed(() => (field?.requiredState() ? true : null)),
  };
}
