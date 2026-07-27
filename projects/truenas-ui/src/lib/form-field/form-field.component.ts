
import { NgTemplateOutlet } from '@angular/common';
import type { AfterContentInit } from '@angular/core';
import { Component, input, computed, signal, contentChild, forwardRef, inject, isDevMode, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgControl, Validators } from '@angular/forms';
import type { ValidationErrors } from '@angular/forms';
import { TN_FORM_FIELD_CONTEXT } from './form-field-context';
import type { TnFormFieldContext } from './form-field-context';
import {
  TN_FORM_FIELD_ERRORS,
  activeErrorKey,
  defaultErrorMessage,
} from './form-field.errors';
import type { TnFormFieldErrorMessages } from './form-field.errors';
import { TnIconComponent } from '../icon/icon.component';
import { LabelMarkupPipe } from '../pipes/label-markup/label-markup.pipe';
import { TnTestIdDirective, type TnTestIdValue } from '../test-id';
import { TnTooltipDirective } from '../tooltip/tooltip.directive';
import type { TooltipPosition } from '../tooltip/tooltip.directive';

export type SubscriptSizing = 'fixed' | 'dynamic';

let nextId = 0;

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
  imports: [NgTemplateOutlet, TnTestIdDirective, TnIconComponent, TnTooltipDirective, LabelMarkupPipe],
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
   * Per-field overrides for validation messages, keyed by error key. Values may
   * be a string or a function that receives the error's detail value. Takes
   * precedence over the app-wide {@link TN_FORM_FIELD_ERRORS} resolver and the
   * built-in defaults.
   */
  errorMessages = input<TnFormFieldErrorMessages>({});

  control = contentChild(NgControl);

  private destroyRef = inject(DestroyRef);

  /**
   * App-wide message resolver, captured once at construction. Unlike the
   * `errorMessages` input it is not reactive — swapping the provided function at
   * runtime will not be picked up by an already-created field.
   */
  private errorResolver = inject(TN_FORM_FIELD_ERRORS, { optional: true });

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
   */
  private resolveErrorMessage(errors: ValidationErrors): string {
    const key = activeErrorKey(errors);
    if (!key) {return 'Invalid input';}

    const value = errors[key];

    // 1. Per-field override (string or factory). A throwing factory must not
    //    break change detection, so fall through to the next layer instead.
    const override = this.errorMessages()[key];
    if (override != null) {
      const message = this.runGuarded(
        () => (typeof override === 'function' ? override(value) : override),
        `errorMessages["${key}"]`
      );
      if (message != null) {return message;}
    }

    // 2. App-wide resolver (e.g. wired to a translation service).
    const resolved = this.runGuarded(
      () => this.errorResolver?.(key, value, this.control()?.control ?? null),
      'TN_FORM_FIELD_ERRORS resolver'
    );
    if (resolved != null) {return resolved;}

    // 3. Built-in default messages for standard validators.
    const builtIn = defaultErrorMessage(key, value);
    if (builtIn != null) {return builtIn;}

    // 4. A custom validator that returned its own message string.
    if (typeof value === 'string') {return value;}

    // 5. Last resort: the raw error key.
    return key;
  }

  /**
   * Runs a caller-supplied message provider, swallowing any throw so a buggy
   * override or resolver cannot break change detection. Logs in dev mode and
   * returns null so resolution falls through to the next layer.
   */
  private runGuarded(provider: () => string | null | undefined, context: string): string | null {
    try {
      // Treat a blank message as "no answer" so it falls through to the next
      // layer instead of hiding the error — e.g. a translation service that
      // returns '' for a missing key.
      const message = provider();
      return message != null && message.trim() !== '' ? message : null;
    } catch (error) {
      if (isDevMode()) {
        console.error(`[tn-form-field] ${context} threw while resolving a validation message`, error);
      }
      return null;
    }
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
