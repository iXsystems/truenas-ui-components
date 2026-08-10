import { Injector, computed, inject, type Signal } from '@angular/core';
import { NgControl } from '@angular/forms';
import { composeTestId, type TnTestIdValue } from './compose-test-id';

/**
 * Resolve a form control's test-id base, falling back to the bound control's
 * name (`formControlName`, a named `[formControl]`, or `ngModel`) when the
 * consumer provides no explicit `testId`.
 *
 * Call from a form control's field initializer and bind the result on the
 * element that represents the control:
 *
 * ```ts
 * protected resolvedTestId = controlTestId(this.testId);
 * ```
 * ```html
 * <input tnTestIdType="input" [tnTestId]="resolvedTestId()" />
 * ```
 *
 * The element-type prefix (`tnTestIdType`) still applies, so a
 * `<tn-input formControlName="sshPort">` with no `testId` emits
 * `input-ssh-port` — exactly what a consumer would otherwise hand-write as
 * `testId="ssh-port"`. An explicit `testId` always wins.
 *
 * Two deliberate constraints make this safe inside a `ControlValueAccessor`:
 *
 * - **`self`-scoped**: the lookup reads only the `NgControl` on the component's
 *   OWN host element, never an ancestor's. A composite control whose template
 *   embeds child controls therefore can't leak its own name onto those children
 *   (which would make their ids collide).
 * - **lazy**: the `NgControl` is resolved on first read, not in the injection
 *   context. Eagerly injecting `NgControl` into a component that provides
 *   `NG_VALUE_ACCESSOR` is circular (the control needs the value accessor, the
 *   accessor would need the control); reading it after construction is not.
 *
 * Must be called within an injection context (a field initializer or
 * constructor).
 */
export function controlTestId(testId: Signal<TnTestIdValue>): Signal<TnTestIdValue> {
  const injector = inject(Injector);
  // `undefined` = not yet resolved; `null` = resolved, no bound control.
  let ngControl: NgControl | null | undefined;
  return computed(() => {
    const explicit = testId();
    // An explicit base (anything that survives normalization) always wins.
    if (composeTestId(undefined, explicit) !== '') {
      return explicit;
    }
    if (ngControl === undefined) {
      ngControl = injector.get(NgControl, null, { self: true, optional: true });
    }
    // `?? explicit` preserves the falsy passthrough — with no control name the
    // base stays empty and the directive writes no attribute.
    return ngControl?.name ?? explicit;
  });
}
