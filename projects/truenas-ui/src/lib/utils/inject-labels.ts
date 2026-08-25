import { inject, isSignal, signal } from '@angular/core';
import type { InjectionToken, Signal } from '@angular/core';

/**
 * Reads a label token and hands back a Signal, whichever of the two shapes the app provided.
 *
 * Every `TN_*_LABELS` token in this library is declared as `T | Signal<T>` so a consumer can
 * pass a plain object (the common case — one static bundle for a single-language app) or a
 * Signal derived from an i18n service, in which case a language switch re-renders the chrome
 * live instead of needing a reload. Components only ever want the Signal, so normalizing at
 * the injection point keeps that union from leaking into every read site.
 *
 * @param token The label token to inject.
 * @returns A Signal of the provided labels; a plain object is wrapped in a constant Signal.
 *
 * @example
 * ```typescript
 * private readonly labels = injectTnLabels(TN_TABLE_LABELS);
 * // template: {{ labels().sortBy }}
 * ```
 */
export function injectTnLabels<T>(token: InjectionToken<T | Signal<T>>): Signal<T> {
  const provided = inject(token);
  return isSignal(provided) ? provided : signal(provided).asReadonly();
}
