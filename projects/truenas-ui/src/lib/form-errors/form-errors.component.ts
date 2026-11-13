import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import type { AbstractControl, ValidationErrors } from '@angular/forms';
import { dismissibleErrorState } from '../form-field/dismissible-error';
import {
  TN_FORM_FIELD_ERRORS,
  activeErrorKey,
  clearDismissibleErrors,
  resolveErrorMessage,
} from '../form-field/form-field.errors';
import type { TnFormFieldErrorMessages } from '../form-field/form-field.errors';
import {
  dismissedValues, pruneDismissed, signalErrorsToValidationErrors, withoutDismissed,
} from '../form-field/signal-field';
import type { TnSignalField } from '../form-field/signal-field';
import { TnIconButtonComponent } from '../icon-button/icon-button.component';
import { TnTestIdDirective } from '../test-id';
import type { TnTestIdValue } from '../test-id';

let nextId = 0;

/** Snapshot of the bound control's validation state. */
interface FormErrorsState {
  invalid: boolean;
  interacted: boolean;
  errors: ValidationErrors | null;
}

const EMPTY_STATE: FormErrorsState = { invalid: false, interacted: false, errors: null };

/**
 * Renders the validation message for a control that is NOT projected into a
 * `tn-form-field` — in practice a `FormGroup` or `FormArray`, whose errors
 * belong to the group as a whole and so have no single field to sit under.
 *
 * `tn-form-field` covers the ordinary case and should still be preferred: it
 * owns the label, the `aria-describedby` wiring and the subscript slot. Reach
 * for this component only where there is no field to own the message —
 * a cross-field validator on a group, a `minArrayLength` on a form array, a
 * server-side error attached to a group by an error handler.
 *
 * The message comes from the same ladder `tn-form-field` uses (per-instance
 * `errorMessages`, then the app-wide {@link TN_FORM_FIELD_ERRORS} resolver,
 * then the built-in defaults), so a group message reads exactly like the field
 * messages around it. Like `tn-form-field`, it shows ONE message — the active
 * error, chosen by the same priority — rather than every error at once.
 *
 * `control` also takes a signal forms field (`fields.schedule`), whose own
 * errors — not its children's — are rendered the same way.
 *
 * @example
 * ```html
 * <tn-form-errors [control]="form.controls.schedule" />
 * ```
 */
@Component({
  selector: 'tn-form-errors',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TnTestIdDirective, TnIconButtonComponent],
  templateUrl: './form-errors.component.html',
  styleUrls: ['./form-errors.component.scss'],
})
export class TnFormErrorsComponent {
  /**
   * The control whose errors are rendered. Usually a group or an array — a
   * Reactive Forms `AbstractControl`, or a signal forms field.
   */
  control = input.required<AbstractControl | TnSignalField>();

  /**
   * Per-instance overrides, keyed by error key. Take precedence over the
   * app-wide resolver, exactly as on `tn-form-field`.
   */
  errorMessages = input<TnFormFieldErrorMessages>({});

  /**
   * Show the message before the user has touched or dirtied the control.
   *
   * Off by default, so a freshly opened form does not greet the user with
   * errors. Turn it on where the invalid value did not come from the user —
   * an edit form populated from an API, or a group an error handler has just
   * attached a server-side failure to.
   */
  showWhenUntouched = input<boolean>(false);

  /**
   * Test-id base for the message element (`error-` prefixed). There is no
   * fallback: an `AbstractControl` does not know its own name, so a message
   * that needs to be addressable in a test has to be named here.
   */
  testId = input<TnTestIdValue>(undefined);

  /**
   * Error keys whose message renders with a dismiss button beside it — in
   * practice a failure the user cannot fix by editing a field, so the message
   * would otherwise stick: a server-side rejection an error handler attached to
   * the group.
   *
   * Only the error actually being shown gets the button, since that is the
   * message the button belongs to.
   *
   * Dismissing deletes these keys from the group's errors — listing them here is
   * what grants that. Every listed key the group carries goes at once, not just
   * the one behind the message, so a failure spread across sibling keys cannot
   * reappear from a sibling. Unlike `tn-form-field` there is no control to hand
   * focus back to once the button goes away, so a consumer who cares where focus
   * lands should move it in the {@link dismiss} handler.
   *
   * Left unset, the app-wide {@link TN_FORM_FIELD_DISMISSIBLE_ERRORS} default
   * applies; pass `[]` to opt this message out of it.
   */
  dismissibleErrors = input<readonly string[] | undefined>(undefined);

  /**
   * Accessible name for the dismiss button, which is icon-only and so has
   * nothing else to be named by. The library cannot translate its own
   * `'Dismiss this error'` default, so a consumer with an i18n layer passes an
   * already-translated string here.
   */
  dismissAriaLabel = input<string | undefined>(undefined);

  /**
   * Hover tooltip for the dismiss button. Defaults to the resolved
   * `dismissAriaLabel`, so one translated string covers both the accessible name
   * and the visible hint.
   */
  dismissTooltip = input<string | undefined>(undefined);

  /** Emits the error key whose message the user dismissed, after it is removed. */
  dismiss = output<string>();

  /**
   * Id of the message element, so a caller can point a control's
   * `aria-describedby` at a group message it is covered by.
   */
  readonly errorId = `tn-form-errors-${nextId++}`;

  private errorResolver = inject(TN_FORM_FIELD_ERRORS, { optional: true });

  private state = signal<FormErrorsState>(EMPTY_STATE);

  /**
   * Error objects the user dismissed on a signal forms field, hidden while that
   * same object is reported (see `withoutDismissed`). Always empty for an
   * `AbstractControl`, whose dismissed errors are deleted from it.
   */
  private dismissedErrors = signal<readonly unknown[]>([]);

  private visibleErrors = computed(() => withoutDismissed(this.state().errors, this.dismissedErrors()));

  protected errorMessage = computed(() => {
    const errors = this.visibleErrors();
    if (!errors) {
      return '';
    }
    const control = this.control();
    return resolveErrorMessage({
      errors,
      errorMessages: this.errorMessages(),
      resolver: this.errorResolver,
      control: isSignalField(control) ? null : control,
      signalForms: isSignalField(control),
      selector: 'tn-form-errors',
    });
  });

  /**
   * Whether to render. A control can be invalid with no message to show — a
   * group whose only error resolves to blank — so the message is part of the
   * condition rather than something the template renders empty.
   */
  protected show = computed(() => {
    const { invalid, interacted } = this.state();
    return invalid && (interacted || this.showWhenUntouched()) && !!this.errorMessage();
  });

  /**
   * The id when there is a message to point at, and null when there is not — so
   * a caller can bind this straight to `aria-describedby` without ever naming
   * an element that is not on screen.
   */
  readonly describedBy = computed(() => (this.show() ? this.errorId : null));

  /**
   * The error key the shown message came from. Same pick `resolveErrorMessage`
   * makes, so the dismiss button can never belong to an error other than the one
   * being read.
   */
  protected activeError = computed(() => {
    const errors = this.visibleErrors();
    return errors ? activeErrorKey(errors) : null;
  });

  /**
   * Which list applies, whether the button shows, and what it is called — shared
   * with `tn-form-field` so a group message and the field messages beside it can
   * never decide dismissibility by different rules.
   */
  protected dismissible = dismissibleErrorState({
    showError: () => this.show(),
    activeError: () => this.activeError(),
    dismissibleErrors: () => this.dismissibleErrors(),
    dismissAriaLabel: () => this.dismissAriaLabel(),
    dismissTooltip: () => this.dismissTooltip(),
  });

  protected dismissError(): void {
    const key = this.activeError();
    if (!key) {
      return;
    }
    const control = this.control();
    const dismissible = this.dismissible.resolvedDismissibleErrors();
    if (isSignalField(control)) {
      const closed = dismissedValues(this.visibleErrors(), dismissible);
      this.dismissedErrors.update((dismissed) => [...dismissed, ...closed]);
    } else {
      clearDismissibleErrors(control, dismissible);
      this.sync(control);
    }
    this.dismiss.emit(key);
  }

  constructor() {
    // `events` (not `statusChanges`) because a group also has to react to
    // touched-only transitions: `markAllAsTouched()` on submit is what reveals
    // a cross-field error the user never focused into.
    effect((onCleanup) => {
      const control = this.control();
      if (isSignalField(control)) {
        // A signal forms field is its own change source: reading its state here
        // makes this effect re-run whenever the errors, status or interaction
        // state change.
        this.syncSignalField(control);
        return;
      }
      const subscription = control.events.subscribe(() => this.sync(control));
      onCleanup(() => subscription.unsubscribe());
      this.sync(control);
    });
  }

  private sync(control: AbstractControl): void {
    this.setState({
      invalid: control.invalid,
      interacted: control.dirty || control.touched,
      errors: control.errors,
    });
  }

  private syncSignalField(field: TnSignalField): void {
    const state = field();
    this.setState({
      invalid: state.invalid(),
      interacted: state.dirty() || state.touched(),
      errors: signalErrorsToValidationErrors(state.errors()),
    });
  }

  private setState(state: FormErrorsState): void {
    this.dismissedErrors.update((dismissed) => pruneDismissed(dismissed, state.errors));
    this.state.set(state);
  }
}

/** An `AbstractControl` is an object; a signal forms field is a function. */
function isSignalField(control: AbstractControl | TnSignalField): control is TnSignalField {
  return typeof control === 'function';
}
