
import type { AfterContentInit } from '@angular/core';
import { Component, input, computed, signal, contentChild, inject, isDevMode, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgControl } from '@angular/forms';
import type { ValidationErrors } from '@angular/forms';
import {
  TN_FORM_FIELD_ERRORS,
  activeErrorKey,
  defaultErrorMessage,
} from './form-field.errors';
import type { TnFormFieldErrorMessages } from './form-field.errors';
import { TnIconComponent } from '../icon/icon.component';
import { TnTestIdDirective, type TnTestIdValue } from '../test-id';
import { TnTooltipDirective } from '../tooltip/tooltip.directive';
import type { TooltipPosition } from '../tooltip/tooltip.directive';

export type SubscriptSizing = 'fixed' | 'dynamic';

/** Snapshot of the projected control's validation state. */
interface ControlStateSnapshot {
  invalid: boolean;
  interacted: boolean;
  errors: ValidationErrors | null;
}

@Component({
  selector: 'tn-form-field',
  standalone: true,
  imports: [TnTestIdDirective, TnIconComponent, TnTooltipDirective],
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss']
})
export class TnFormFieldComponent implements AfterContentInit {
  label = input<string>('');
  hint = input<string>('');
  required = input<boolean>(false);
  testId = input<TnTestIdValue>('');
  subscriptSizing = input<SubscriptSizing>('dynamic');

  /** Optional tooltip shown via a help icon next to the label. */
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
  });

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
      // Listen for control status changes
      control.statusChanges
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
      return provider() ?? null;
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
}
