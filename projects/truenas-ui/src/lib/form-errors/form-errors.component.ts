import { Component, DestroyRef, computed, effect, inject, input, output, signal } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import type { AbstractControl, ValidationErrors } from '@angular/forms';
import {
  TN_FORM_FIELD_DISMISSIBLE_ERRORS,
  TN_FORM_FIELD_ERRORS,
  activeErrorKey,
  clearDismissibleErrors,
  resolveErrorMessage,
} from '../form-field/form-field.errors';
import type { TnFormFieldErrorMessages } from '../form-field/form-field.errors';
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
  /** The control whose errors are rendered. Usually a group or an array. */
  control = input.required<AbstractControl>();

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

  private destroyRef = inject(DestroyRef);
  private errorResolver = inject(TN_FORM_FIELD_ERRORS, { optional: true });

  /** App-wide dismissible keys, used when the instance names none of its own. */
  private defaultDismissibleErrors = inject(TN_FORM_FIELD_DISMISSIBLE_ERRORS, { optional: true });

  private state = signal<FormErrorsState>(EMPTY_STATE);

  protected errorMessage = computed(() => {
    const { errors } = this.state();
    if (!errors) {
      return '';
    }
    return resolveErrorMessage({
      errors,
      errorMessages: this.errorMessages(),
      resolver: this.errorResolver,
      control: this.control(),
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
   * The error key the shown message came from. Same pick `resolveErrorMessage`
   * makes, so the dismiss button can never belong to an error other than the one
   * being read.
   */
  protected activeError = computed(() => {
    const { errors } = this.state();
    return errors ? activeErrorKey(errors) : null;
  });

  /** The instance's own list when it has one, otherwise the app-wide default. */
  protected resolvedDismissibleErrors = computed(
    () => this.dismissibleErrors() ?? this.defaultDismissibleErrors ?? [],
  );

  protected showDismiss = computed(() => {
    const key = this.activeError();
    return this.show() && !!key && this.resolvedDismissibleErrors().includes(key);
  });

  protected readonly resolvedDismissAriaLabel = computed(
    () => this.dismissAriaLabel() ?? 'Dismiss this error',
  );

  protected readonly resolvedDismissTooltip = computed(
    () => this.dismissTooltip() ?? this.resolvedDismissAriaLabel(),
  );

  protected dismissError(): void {
    const key = this.activeError();
    if (!key) {
      return;
    }
    const control = this.control();
    clearDismissibleErrors(control, this.resolvedDismissibleErrors());
    this.sync(control);
    this.dismiss.emit(key);
  }

  constructor() {
    // `events` (not `statusChanges`) because a group also has to react to
    // touched-only transitions: `markAllAsTouched()` on submit is what reveals
    // a cross-field error the user never focused into.
    effect((onCleanup) => {
      const control = this.control();
      const subscription = control.events.subscribe(() => this.sync(control));
      onCleanup(() => subscription.unsubscribe());
      this.sync(control);
    });

    this.destroyRef.onDestroy(() => this.state.set(EMPTY_STATE));
  }

  private sync(control: AbstractControl): void {
    this.state.set({
      invalid: control.invalid,
      interacted: control.dirty || control.touched,
      errors: control.errors,
    });
  }
}
