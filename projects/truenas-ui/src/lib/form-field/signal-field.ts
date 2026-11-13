import type { NgControl, ValidationErrors } from '@angular/forms';

/**
 * One error as Angular signal forms report it: a `kind` naming it (the
 * equivalent of a Reactive Forms error key), an optional author-written
 * `message`, and whatever detail the validator adds (`minLength: 3`).
 */
export interface TnSignalValidationError {
  readonly kind: string;
  readonly message?: string;
}

/**
 * The part of a signal forms `FieldState` the library reads. Structural on
 * purpose: importing the real type would pull `@angular/forms/signals` into
 * every consumer's bundle, including the ones still on Reactive Forms only.
 */
export interface TnSignalFieldState {
  errors(): readonly TnSignalValidationError[];
  invalid(): boolean;
  touched(): boolean;
  dirty(): boolean;
}

/**
 * A signal forms field — what `form(model)` and its properties hand out
 * (`fields.schedule`). Calling it returns the field's state. Any `FieldTree`
 * satisfies it, so it can be bound wherever an `AbstractControl` is accepted.
 */
export type TnSignalField = () => TnSignalFieldState;

/**
 * Converts signal forms errors to the `ValidationErrors` map the message ladder
 * reads, keyed by `kind`, exactly as Angular's own interop control does. The
 * value is the error object itself, so its detail (`minLength`) and `message`
 * reach the resolver, and so it keeps its identity across reads — which is what
 * dismissal keys on.
 *
 * @internal
 */
export function signalErrorsToValidationErrors(
  errors: readonly TnSignalValidationError[],
): ValidationErrors | null {
  if (!errors.length) {
    return null;
  }
  const map: ValidationErrors = {};
  for (const error of errors) {
    map[error.kind] = error;
  }
  return map;
}

/**
 * The `NgControl` Angular provides for a `ControlValueAccessor` bound with
 * `[formField]` keeps the field's state behind a `field` signal. That member is
 * not part of Angular's typed API, so it is read defensively: anything that does
 * not look like a field state is treated as absent.
 */
function fieldStateOf(control: NgControl | null | undefined): { name?: () => unknown } | null {
  const field = (control as { field?: unknown } | null | undefined)?.field;
  if (typeof field !== 'function') {
    return null;
  }
  const state = (field as () => unknown)();
  return state && typeof state === 'object' ? state as { name?: () => unknown } : null;
}

/**
 * The name a `[formField]` binding would have under Reactive Forms: the last
 * segment of the field's path (`form0.aliases.0.host` → `host`), matching what
 * `formControlName="host"` reports, and the row index for a primitive row.
 *
 * Returns `null` when the control is not a signal forms one.
 *
 * @internal
 */
export function signalFieldName(control: NgControl | null | undefined): string | null {
  const name = fieldStateOf(control)?.name?.();
  if (typeof name !== 'string' || !name) {
    return null;
  }
  return name.split('.').pop() || null;
}

/**
 * Whether a bound control can have errors deleted from it. Reactive controls
 * can; signal forms errors are derived from the model and its rules, so a
 * component can only hide them until they change.
 *
 * @internal
 */
export function canSetErrors(control: unknown): control is { setErrors: (errors: ValidationErrors | null) => void } {
  return typeof (control as { setErrors?: unknown } | null)?.setErrors === 'function';
}

/**
 * Drops the errors a user has dismissed from a signal forms field. Dismissal is
 * remembered by the identity of the error object, so the message stays hidden
 * for as long as that same failure is reported and comes back for a new one:
 * an error attached by `submit()` keeps its object until it is cleared, while a
 * validator that fails again produces a fresh object.
 *
 * @internal
 */
export function withoutDismissed(
  errors: ValidationErrors | null,
  dismissed: readonly unknown[],
): ValidationErrors | null {
  if (!errors || !dismissed.length) {
    return errors;
  }
  const visible: ValidationErrors = {};
  for (const [key, value] of Object.entries(errors)) {
    if (!dismissed.includes(value)) {
      visible[key] = value;
    }
  }
  return Object.keys(visible).length ? visible : null;
}

/**
 * Forgets dismissals whose error is no longer reported, so the list cannot grow
 * and an identical object reported again later is not hidden by an old
 * dismissal. Returns the same array when nothing changed, so a signal holding it
 * does not notify.
 *
 * @internal
 */
export function pruneDismissed(
  dismissed: readonly unknown[],
  errors: ValidationErrors | null,
): readonly unknown[] {
  if (!dismissed.length) {
    return dismissed;
  }
  const current = errors ? Object.values(errors) : [];
  const kept = dismissed.filter((value) => current.includes(value));
  return kept.length === dismissed.length ? dismissed : kept;
}

/**
 * The error values to remember as dismissed: every listed key the field reports
 * right now, not only the one on screen, for the same reason a reactive control
 * loses all of them at once (see `clearDismissibleErrors`).
 *
 * @internal
 */
export function dismissedValues(
  errors: ValidationErrors | null,
  dismissible: readonly string[],
): unknown[] {
  if (!errors) {
    return [];
  }
  return dismissible.filter((key) => errors[key] != null).map((key) => errors[key]);
}
