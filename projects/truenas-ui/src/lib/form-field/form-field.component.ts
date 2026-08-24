
import { NgTemplateOutlet } from '@angular/common';
import type { AfterContentInit } from '@angular/core';
import {
  Component, ElementRef, input, output, computed, signal, contentChild, forwardRef, inject,
  viewChild, DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgControl, Validators } from '@angular/forms';
import type { ValidationErrors } from '@angular/forms';
import { TN_FORM_FIELD_CONTEXT } from './form-field-context';
import type { TnFormFieldContext } from './form-field-context';
import {
  TN_FORM_FIELD_DISMISSIBLE_ERRORS,
  TN_FORM_FIELD_ERRORS,
  activeErrorKey,
  clearDismissibleErrors,
  resolveErrorMessage,
} from './form-field.errors';
import type { TnFormFieldErrorMessages } from './form-field.errors';
import { TnIconComponent } from '../icon/icon.component';
import { TnIconButtonComponent } from '../icon-button/icon-button.component';
import { LabelMarkupPipe } from '../pipes/label-markup/label-markup.pipe';
import { TnTestIdDirective, type TnTestIdValue } from '../test-id';
import { plainTextMessage } from '../tooltip/interactive-content';
import { TnTooltipDirective } from '../tooltip/tooltip.directive';
import type { TooltipPosition } from '../tooltip/tooltip.directive';

export type SubscriptSizing = 'fixed' | 'dynamic';

let nextId = 0;

/**
 * What counts as the control to hand focus back to once the dismiss button the
 * user just activated has been removed from the DOM. First match inside the
 * field's wrapper wins — for every control the library projects that is the
 * control itself.
 */
const FOCUSABLE_SELECTOR = [
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/** Snapshot of the projected control's validation state. */
interface ControlStateSnapshot {
  invalid: boolean;
  interacted: boolean;
  errors: ValidationErrors | null;
  required: boolean;
}

@Component({
  selector: 'tn-form-field',
  standalone: true,
  imports: [
    NgTemplateOutlet, TnTestIdDirective, TnIconComponent, TnIconButtonComponent, TnTooltipDirective,
    LabelMarkupPipe,
  ],
  providers: [
    // Published to projected controls (their element injector chains through
    // this host), which bind aria-labelledby/-describedby/-invalid/-required
    // to the field's label and messages. See TnFormFieldContext.
    {
      provide: TN_FORM_FIELD_CONTEXT,
      useExisting: forwardRef(() => TnFormFieldComponent),
    },
  ],
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss']
})
export class TnFormFieldComponent implements AfterContentInit, TnFormFieldContext {
  /** Unique instance id namespacing the label/error/hint ids for ARIA linkage. */
  private readonly uid = `tn-form-field-${nextId++}`;

  /** Id carried by the error message element (only meaningful while it renders). */
  protected readonly errorId = `${this.uid}-error`;

  /** Id carried by the hint element (only meaningful while it renders). */
  protected readonly hintId = `${this.uid}-hint`;

  label = input<string>('');
  hint = input<string>('');
  /**
   * Forces the visual `*` required indicator next to the label. Usually
   * unnecessary: the indicator is inferred automatically when the projected
   * control carries `Validators.required`. Set this only when inference can't
   * see the requirement — e.g. a validator wrapped in `Validators.compose(...)`
   * or a custom validator that emits a `required`-style error.
   *
   * Library form controls surface this state as `aria-required` automatically
   * (via {@link TnFormFieldContext}); pairing it with the projected control's
   * own `required` input (e.g. `tn-input`'s, which renders the native
   * attribute) additionally blocks native form submission.
   */
  required = input<boolean>(false);
  testId = input<TnTestIdValue>(undefined);
  subscriptSizing = input<SubscriptSizing>('dynamic');

  /**
   * Optional tooltip shown via a help icon.
   *
   * With a `label`, the icon renders next to the label in the label row. Without
   * one, the icon renders inline after the projected control instead — for
   * controls that carry their own label (e.g. `tn-checkbox`), where a detached
   * icon row above the control would look orphaned.
   *
   * Inline mode targets compact, self-labeled controls: the wrapper becomes a
   * flex row, so a full-width control (e.g. a label-less `tn-input`) would
   * shrink toward its content width. Give such fields a `label` instead.
   */
  tooltip = input<string>('');
  /** Placement of the tooltip relative to its help icon. */
  tooltipPosition = input<TooltipPosition>('above');
  /**
   * Whether a tooltip message holding a link may be pinned open by clicking the help button (see
   * `tnTooltipSticky`). On by default, like the directive.
   *
   * It does not make plain tooltips pinnable — field help is nearly always plain text, and that
   * keeps hovering. Set it to false only to force a message that does hold a link back to hover
   * behaviour, accepting that the link is then unreachable.
   */
  tooltipSticky = input<boolean>(true);

  /**
   * Accessible name for the help button, which is icon-only and so has nothing else to be named
   * by. The message is what the button is for, but it may hold markup — a link is the whole point
   * of `tooltipSticky` — and `aria-label` takes plain text, so the tags come off first.
   */
  protected readonly tooltipAriaLabel = computed(() => plainTextMessage(this.tooltip()));

  /**
   * Per-field overrides for validation messages, keyed by error key. Values may
   * be a string or a function that receives the error's detail value. Takes
   * precedence over the app-wide {@link TN_FORM_FIELD_ERRORS} resolver and the
   * built-in defaults.
   */
  errorMessages = input<TnFormFieldErrorMessages>({});

  /**
   * Error keys whose message renders with a dismiss button beside it — in
   * practice a failure the user cannot fix by editing the value, so the message
   * would otherwise stick until the control changes: a server-side rejection an
   * error handler attached to the control, or an async validator that judged the
   * value the user already picked.
   *
   * Only the error actually being shown gets the button. A control carrying both
   * a dismissible key and `required` shows the `required` message, undismissable,
   * because that is the message on screen.
   *
   * Dismissing deletes these keys from the control's errors — listing them here
   * is what grants that, since a message the user can close but that does not go
   * away would be worse than no button. Every listed key the control carries goes
   * at once, not just the one behind the message: an app that spreads one failure
   * across sibling keys (a flag, its message, a legacy alias) would otherwise see
   * the message reappear from a sibling. Unlisted errors are left alone, and
   * {@link dismiss} reports which message went.
   *
   * Left unset, the app-wide {@link TN_FORM_FIELD_DISMISSIBLE_ERRORS} default
   * applies; pass `[]` to opt this field out of it.
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

  /**
   * Emits the error key the user dismissed, after it has been removed — the key
   * of the message that was on screen, so a consumer listing several dismissible
   * keys knows which one went.
   */
  dismiss = output<string>();

  control = contentChild(NgControl);

  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * `read: ElementRef` because the ref sits on `tn-icon-button`, and a component
   * ref resolves to the instance by default — the element is what the focus
   * check needs.
   */
  private dismissButton = viewChild('dismissButton', { read: ElementRef<HTMLElement> });

  private destroyRef = inject(DestroyRef);

  /**
   * App-wide message resolver, captured once at construction. Unlike the
   * `errorMessages` input it is not reactive — swapping the provided function at
   * runtime will not be picked up by an already-created field.
   */
  private errorResolver = inject(TN_FORM_FIELD_ERRORS, { optional: true });

  /** App-wide dismissible keys, used when the field names none of its own. */
  private defaultDismissibleErrors = inject(TN_FORM_FIELD_DISMISSIBLE_ERRORS, { optional: true });

  /**
   * Snapshot of the relevant control state. Updated from the control's status
   * stream because `NgControl` itself is not signal-based; downstream `computed`s
   * read this so the derived state stays reactive.
   */
  private controlState = signal<ControlStateSnapshot>({
    invalid: false,
    interacted: false,
    errors: null,
    required: false,
  });

  /**
   * Whether the required indicator renders: forced via the `required` input, or
   * inferred from the projected control's validators (mirrors Angular Material's
   * `hasValidator(Validators.required)` approach, extended to `requiredTrue` for
   * boolean controls — reference equality, so composed or custom required-like
   * validators need the explicit input).
   */
  protected showRequired = computed(() => this.required() || this.controlState().required);

  /**
   * Whether the tooltip icon renders inline after the projected control rather
   * than in the label row — true when a tooltip is set but no label is.
   */
  protected showInlineTooltip = computed(() => !!this.tooltip() && !this.label());

  /**
   * Whether the required indicator renders inline after the projected control —
   * with no label there is no label row to host the asterisk, so a required
   * self-labeled control (e.g. a consent `tn-checkbox`) still gets one.
   */
  protected showInlineRequired = computed(() => !this.label() && this.showRequired());

  /** Whether the wrapper hosts any inline extras and lays out as a flex row. */
  protected showInlineExtras = computed(() => this.showInlineTooltip() || this.showInlineRequired());

  protected hasError = computed(() => {
    const state = this.controlState();
    return state.invalid && state.interacted;
  });

  protected errorMessage = computed(() => {
    const { errors } = this.controlState();
    return errors ? this.resolveErrorMessage(errors) : '';
  });

  /**
   * The error key the shown message came from. Same pick `resolveErrorMessage`
   * makes, so the dismiss button can never belong to an error other than the one
   * being read.
   */
  protected activeError = computed(() => {
    const { errors } = this.controlState();
    return errors ? activeErrorKey(errors) : null;
  });

  /** The field's own list when it has one, otherwise the app-wide default. */
  protected resolvedDismissibleErrors = computed(
    () => this.dismissibleErrors() ?? this.defaultDismissibleErrors ?? [],
  );

  protected showDismiss = computed(() => {
    const key = this.activeError();
    return this.showError() && !!key && this.resolvedDismissibleErrors().includes(key);
  });

  protected readonly resolvedDismissAriaLabel = computed(
    () => this.dismissAriaLabel() ?? 'Dismiss this error',
  );

  protected readonly resolvedDismissTooltip = computed(
    () => this.dismissTooltip() ?? this.resolvedDismissAriaLabel(),
  );

  /**
   * Drops the dismissed error, then puts focus back on the control rather than
   * letting it fall to `<body>` with the button — dismissing a server-side error
   * means "let me try again", and the control is where trying again happens.
   *
   * Focus only moves if it was on the button to begin with: a dismiss triggered
   * from anywhere else (a Safari mouse click, which leaves the button unfocused)
   * has no focus to lose and should not steal any.
   */
  protected dismissError(): void {
    const key = this.activeError();
    const control = this.control()?.control;
    if (!key || !control) {
      return;
    }
    // `contains`, not identity: tn-icon-button delegates focus to the native
    // button it renders, so the active element is that child, not the host.
    const button = this.dismissButton()?.nativeElement;
    const hadFocus = !!button && button.contains(button.ownerDocument.activeElement);

    clearDismissibleErrors(control, this.resolvedDismissibleErrors());
    this.syncControlState();
    this.dismiss.emit(key);

    if (hadFocus) {
      this.host.nativeElement
        .querySelector('.tn-form-field-wrapper')
        ?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
        ?.focus();
    }
  }

  ngAfterContentInit(): void {
    const control = this.control();
    if (control) {
      // Prefer the unified `events` stream: unlike `statusChanges`, it also
      // emits on touched/pristine-only transitions (`markAsTouched()` on blur,
      // `markAllAsTouched()` on submit), so the error — visual and ARIA —
      // surfaces the moment the user leaves a required field empty. Fall back
      // to `statusChanges` for NgControl implementations whose underlying
      // AbstractControl isn't reachable yet.
      const changes = control.control?.events ?? control.statusChanges;
      changes
        ?.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.syncControlState();
        });

      // Initial error state check
      this.syncControlState();
    }
  }

  private syncControlState(): void {
    const control = this.control();
    if (control) {
      this.controlState.set({
        invalid: !!control.invalid,
        interacted: !!(control.dirty || control.touched),
        errors: control.errors ?? null,
        required: !!(control.control?.hasValidator(Validators.required)
          || control.control?.hasValidator(Validators.requiredTrue)),
      });
    }
  }

  /**
   * Resolves a user-facing message for the active error. Reads the
   * `errorMessages` input (and the injected resolver), so it is reactive: the
   * displayed message updates when either the control errors or the overrides
   * change — e.g. a runtime locale switch.
   *
   * The ladder itself lives in `./form-field.errors`, shared with
   * `tn-form-errors` so a group-level message reads exactly like the
   * field-level one it sits beside.
   */
  private resolveErrorMessage(errors: ValidationErrors): string {
    return resolveErrorMessage({
      errors,
      errorMessages: this.errorMessages(),
      resolver: this.errorResolver,
      control: this.control()?.control ?? null,
      selector: 'tn-form-field',
    });
  }

  showError = computed(() => {
    return this.hasError() && !!this.errorMessage();
  });

  showHint = computed(() => {
    return !!this.hint() && !this.showError();
  });

  protected showSubscript = computed(() => {
    return this.subscriptSizing() === 'fixed' || this.showError() || this.showHint();
  });

  // ── TnFormFieldContext (consumed by the projected control via DI) ──

  /**
   * Id of the label *text* span — deliberately not the whole `<label>`, so an
   * `aria-labelledby` pointing here never picks up the required asterisk's
   * "required" into the accessible name (that state travels as `aria-required`).
   */
  labelId = computed(() => (this.label() ? `${this.uid}-label` : null));

  /** Id of the currently shown error or hint (they are mutually exclusive), or null. */
  describedBy = computed(() => {
    if (this.showError()) {
      return this.errorId;
    }
    if (this.showHint()) {
      return this.hintId;
    }
    return null;
  });

  /** Mirrors the visual error state (invalid AND interacted) for `aria-invalid`. */
  errorState = computed(() => this.hasError());

  /** Forced or validator-inferred required state, for `aria-required`. */
  requiredState = computed(() => this.showRequired());
}
