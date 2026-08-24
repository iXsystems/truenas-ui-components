import { Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import type { AbstractControl, ValidationErrors } from '@angular/forms';
import {
  TN_FORM_FIELD_ERRORS,
  resolveErrorMessage,
} from '../form-field/form-field.errors';
import type { TnFormFieldErrorMessages } from '../form-field/form-field.errors';
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
  imports: [TnTestIdDirective],
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
   * Id of the message element, so a caller can point a control's
   * `aria-describedby` at a group message it is covered by.
   */
  readonly errorId = `tn-form-errors-${nextId++}`;

  private destroyRef = inject(DestroyRef);
  private errorResolver = inject(TN_FORM_FIELD_ERRORS, { optional: true });

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
