import { InjectionToken } from '@angular/core';
import type { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * A user-friendly message for a single validation error, or a function that
 * builds one from the error's detail value.
 *
 * The function form receives the error value Angular stored for that key, which
 * lets you interpolate validator metadata, e.g.
 * `minlength: (e) => \`At least ${e.requiredLength} characters\``.
 */
export type TnFormFieldErrorMessage =
  | string
  | ((errorValue: unknown) => string);

/**
 * A per-field map of validation error key -> message (or message factory).
 *
 * @example
 * ```html
 * <tn-form-field [errorMessages]="{
 *   required: 'Please enter a name',
 *   pattern: 'Letters only',
 *   minlength: messageFn
 * }">
 * ```
 */
export type TnFormFieldErrorMessages = Partial<Record<string, TnFormFieldErrorMessage>>;

/**
 * App-wide resolver for validation messages. Register one with the
 * {@link TN_FORM_FIELD_ERRORS} token to centralize wording and i18n.
 *
 * Return a string to provide a message, or `null`/`undefined` to defer to the
 * next layer (built-in defaults, then the raw error key).
 *
 * @param errorKey   The active validation error key (e.g. `'required'`).
 * @param errorValue The value Angular stored for that key.
 * @param control    The control that failed validation, if available.
 */
export type TnFormFieldErrorResolver = (
  errorKey: string,
  errorValue: unknown,
  control: AbstractControl | null
) => string | null | undefined;

/**
 * Injection token for an app-wide {@link TnFormFieldErrorResolver}.
 *
 * Because the library ships no localized strings, this is the recommended hook
 * for wiring a translation service so every `tn-form-field` resolves messages
 * consistently. Per-field `errorMessages` still take precedence over it.
 *
 * @example
 * ```ts
 * providers: [
 *   {
 *     provide: TN_FORM_FIELD_ERRORS,
 *     useFactory: (translate: TranslateService): TnFormFieldErrorResolver =>
 *       (key, value) => translate.instant(`errors.${key}`, value as object),
 *     deps: [TranslateService],
 *   },
 * ];
 * ```
 */
export const TN_FORM_FIELD_ERRORS = new InjectionToken<TnFormFieldErrorResolver>(
  'TN_FORM_FIELD_ERRORS'
);

/**
 * Built-in fallback messages for Angular's standard validators. Used only when
 * neither a per-field `errorMessages` entry nor a {@link TN_FORM_FIELD_ERRORS}
 * resolver supplies a message. English-only by design — override the others for
 * localization.
 *
 * @param errorKey   The active validation error key.
 * @param errorValue The detail Angular stored for that key (e.g.
 *                   `{ requiredLength: 8 }` for `minlength`). Tolerates malformed
 *                   shapes so a bad validator can't crash rendering.
 * @internal
 */
export function defaultErrorMessage(
  errorKey: string,
  errorValue: unknown
): string | null {
  const detail = (errorValue ?? {}) as Record<string, unknown>;
  switch (errorKey) {
    case 'required':
      return 'This field is required';
    case 'email':
      return 'Please enter a valid email address';
    case 'minlength':
      return `Minimum length is ${detail['requiredLength'] ?? ''}`.trim();
    case 'maxlength':
      return `Maximum length is ${detail['requiredLength'] ?? ''}`.trim();
    case 'pattern':
      return 'Please enter a valid format';
    case 'min':
      return `Minimum value is ${detail['min'] ?? ''}`.trim();
    case 'max':
      return `Maximum value is ${detail['max'] ?? ''}`.trim();
    default:
      return null;
  }
}

/**
 * Order in which built-in validator errors are surfaced when a control reports
 * more than one at once.
 */
const BUILT_IN_ERROR_PRIORITY = [
  'required', 'email', 'minlength', 'maxlength', 'pattern', 'min', 'max',
] as const;

/**
 * Picks which error to display when a control has more than one. Built-in keys
 * are preferred in {@link BUILT_IN_ERROR_PRIORITY} order; any remaining custom
 * key falls back to insertion order.
 *
 * @internal
 */
export function activeErrorKey(errors: ValidationErrors): string | null {
  for (const key of BUILT_IN_ERROR_PRIORITY) {
    if (errors[key] != null) {
      return key;
    }
  }
  return Object.keys(errors)[0] ?? null;
}
