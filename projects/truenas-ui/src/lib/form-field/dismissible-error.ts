import { computed, inject } from '@angular/core';
import type { Signal } from '@angular/core';
import { TN_FORM_FIELD_DISMISSIBLE_ERRORS } from './form-field.errors';

/**
 * The inputs a host reads to decide whether the message it is showing carries a
 * close button, as plain accessors so a caller can pass `() => this.someInput()`
 * without depending on the order its own class fields initialize in.
 *
 * @internal
 */
export interface DismissibleErrorSources {
  /** Whether a message is on screen at all — there is nothing to dismiss otherwise. */
  showError: () => boolean;
  /** The error key the shown message came from, or `null`. */
  activeError: () => string | null;
  /** The host's own `dismissibleErrors` input; `undefined` defers to the app-wide token. */
  dismissibleErrors: () => readonly string[] | undefined;
  /** The host's own `dismissAriaLabel` input. */
  dismissAriaLabel: () => string | undefined;
  /** The host's own `dismissTooltip` input. */
  dismissTooltip: () => string | undefined;
}

/** What a host binds its template and its dismiss handler to. @internal */
export interface DismissibleErrorState {
  /** The host's own list when it has one, otherwise the app-wide default. */
  resolvedDismissibleErrors: Signal<readonly string[]>;
  /** Whether the shown message renders a close button beside it. */
  showDismiss: Signal<boolean>;
  /** Accessible name for that button. */
  resolvedDismissAriaLabel: Signal<string>;
  /** Hover hint for that button. */
  resolvedDismissTooltip: Signal<string>;
}

/**
 * The dismiss-button derivations `tn-form-field` and `tn-form-errors` share.
 *
 * Both render the same control against the same opt-in list, and both fall back
 * to {@link TN_FORM_FIELD_DISMISSIBLE_ERRORS} and to the same English default
 * name. Kept in one place so the two cannot answer differently — a field message
 * and the group message above it deciding dismissibility by different rules is a
 * bug a reader would have to diff two components to see.
 *
 * Only the derivation is shared: what dismissing *does* differs (the field hands
 * focus back to its control, the group has no control to hand it to), so each
 * host writes its own handler over `clearDismissibleErrors`.
 *
 * Must be called from an injection context — in practice a component field
 * initializer.
 *
 * @internal
 */
export function dismissibleErrorState(sources: DismissibleErrorSources): DismissibleErrorState {
  const appWide = inject(TN_FORM_FIELD_DISMISSIBLE_ERRORS, { optional: true });

  const resolvedDismissibleErrors = computed(
    () => sources.dismissibleErrors() ?? appWide ?? [],
  );

  // Only the error actually being shown gets a button, since that is the message
  // the button belongs to.
  const showDismiss = computed(() => {
    const key = sources.activeError();
    return sources.showError() && !!key && resolvedDismissibleErrors().includes(key);
  });

  const resolvedDismissAriaLabel = computed(
    () => sources.dismissAriaLabel() ?? 'Dismiss this error',
  );

  return {
    resolvedDismissibleErrors,
    showDismiss,
    resolvedDismissAriaLabel,
    resolvedDismissTooltip: computed(
      () => sources.dismissTooltip() ?? resolvedDismissAriaLabel(),
    ),
  };
}
