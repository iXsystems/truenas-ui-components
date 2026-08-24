import { InjectionToken, isDevMode } from '@angular/core';
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
 * App-wide default for which error keys carry a dismiss button, for apps whose
 * server-side failures always land under the same keys. A field's
 * `dismissibleErrors` input overrides it — including with `[]`, to opt one field
 * out of the default.
 *
 * Listing a key here grants permission to delete it: dismissing removes it from
 * the control's errors, since a message the user can close but that will not go
 * away is worse than no button at all.
 *
 * @example
 * ```ts
 * providers: [
 *   {
 *     provide: TN_FORM_FIELD_DISMISSIBLE_ERRORS,
 *     useValue: ['manualValidateError', 'manualValidateErrorMsg'],
 *   },
 * ];
 * ```
 */
export const TN_FORM_FIELD_DISMISSIBLE_ERRORS = new InjectionToken<readonly string[]>(
  'TN_FORM_FIELD_DISMISSIBLE_ERRORS'
);

/**
 * Removes every dismissible key a control currently carries, leaving the rest.
 *
 * All of them, not just the one behind the message: an app may spread a single
 * failure across sibling keys — a flag, its message, a legacy alias — and a
 * sibling left behind would simply render the same message again with its own
 * close button. The opt-in list is what bounds this.
 *
 * `setErrors`, not a delete plus `updateValueAndValidity()`: re-running the
 * validators would recompute the whole map, and a manual error nothing validates
 * is exactly the kind that gets dismissed.
 *
 * @internal
 */
export function clearDismissibleErrors(
  control: AbstractControl,
  dismissible: readonly string[]
): void {
  const remaining = { ...control.errors };
  for (const key of dismissible) {
    delete remaining[key];
  }
  control.setErrors(Object.keys(remaining).length ? remaining : null);
}

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
      return detail['requiredLength'] == null
        ? 'Value is too short'
        : `Minimum length is ${detail['requiredLength']}`;
    case 'maxlength':
      return detail['requiredLength'] == null
        ? 'Value is too long'
        : `Maximum length is ${detail['requiredLength']}`;
    case 'pattern':
      return 'Please enter a valid format';
    case 'min':
      return detail['min'] == null
        ? 'Value is too small'
        : `Minimum value is ${detail['min']}`;
    case 'max':
      return detail['max'] == null
        ? 'Value is too large'
        : `Maximum value is ${detail['max']}`;
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

/**
 * Runs a caller-supplied message provider, swallowing any throw so a buggy
 * override or resolver cannot break change detection. Logs in dev mode and
 * returns null so resolution falls through to the next layer.
 *
 * A blank message counts as "no answer" and falls through too, so a
 * translation service that returns `''` for a missing key does not hide the
 * error behind an empty subscript.
 *
 * @internal
 */
function runGuarded(
  provider: () => string | null | undefined,
  selector: string,
  context: string
): string | null {
  try {
    const message = provider();
    return message != null && message.trim() !== '' ? message : null;
  } catch (error) {
    if (isDevMode()) {
      console.error(
        `[${selector}] ${context} threw while resolving a validation message`,
        error
      );
    }
    return null;
  }
}

/** What {@link resolveErrorMessage} needs to answer for one control. */
export interface ResolveErrorMessageOptions {
  /** The control's current errors — the caller has already checked it has some. */
  errors: ValidationErrors;
  /** Per-instance overrides, keyed by error key. Consulted first. */
  errorMessages?: TnFormFieldErrorMessages;
  /** The app-wide resolver from {@link TN_FORM_FIELD_ERRORS}, if one is provided. */
  resolver?: TnFormFieldErrorResolver | null;
  /** The failing control, passed through to the resolver. */
  control?: AbstractControl | null;
  /** Component selector, used only to attribute dev-mode error logs. */
  selector: string;
}

/**
 * Resolves a user-facing message for a control's active error, in the order
 * `tn-form-field` has always used:
 *
 * 1. a per-instance `errorMessages` override (string or factory),
 * 2. the app-wide {@link TN_FORM_FIELD_ERRORS} resolver,
 * 3. {@link defaultErrorMessage} for Angular's standard validators,
 * 4. the error value itself, when a custom validator returned its own string,
 * 5. the raw error key.
 *
 * Shared with `tn-form-errors` so a group-level message reads exactly like the
 * field-level one it sits beside.
 */
export function resolveErrorMessage(options: ResolveErrorMessageOptions): string {
  const { errors, errorMessages, resolver, control, selector } = options;

  const key = activeErrorKey(errors);
  if (!key) {return 'Invalid input';}

  const value = errors[key];

  const override = errorMessages?.[key];
  if (override != null) {
    const message = runGuarded(
      () => (typeof override === 'function' ? override(value) : override),
      selector,
      `errorMessages["${key}"]`
    );
    if (message != null) {return message;}
  }

  const resolved = runGuarded(
    () => resolver?.(key, value, control ?? null),
    selector,
    'TN_FORM_FIELD_ERRORS resolver'
  );
  if (resolved != null) {return resolved;}

  const builtIn = defaultErrorMessage(key, value);
  if (builtIn != null) {return builtIn;}

  if (typeof value === 'string') {return value;}

  return key;
}
