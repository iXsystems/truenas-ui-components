import { InjectionToken } from '@angular/core';
import type { Signal } from '@angular/core';

/**
 * The slice of `tn-radio-group` a child `tn-radio` needs, published over DI so the two components
 * can talk without importing each other (the group renders radios in its own template, so the
 * dependency has to be one-way).
 *
 * A radio that finds this token defers all selection state to the group: the group owns the value,
 * the native `name` that binds the options into one keyboard-navigable set, and the
 * disabled/required state. A radio that doesn't find it (used standalone) keeps its own
 * `ControlValueAccessor` behaviour.
 */
export interface TnRadioGroupApi {
  /** Native `name` shared by every option in the group. */
  resolvedName: Signal<string>;

  /** Whether the whole group is disabled — via its input or a disabled bound form control. */
  isDisabled: Signal<boolean>;

  /** Whether the group is required, propagated to each option's native `required`. */
  isRequired: Signal<boolean>;

  /**
   * Whether `value` is the group's current selection. Reactive: reads the group's value signal,
   * so a radio can call it from inside a `computed`.
   */
  isSelected(value: unknown): boolean;

  /** Records a user pick, notifying the bound form control. */
  select(value: unknown): void;
}

/** DI token under which `tn-radio-group` exposes its {@link TnRadioGroupApi} to child radios. */
export const TN_RADIO_GROUP = new InjectionToken<TnRadioGroupApi>('TN_RADIO_GROUP');
