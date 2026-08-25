import { InjectionToken } from '@angular/core';
import type { Signal } from '@angular/core';

/**
 * What a `tn-form-list-item` needs to know about the list it was projected
 * into. Published over DI rather than passed as an input, so that locking a
 * list is one binding on the list and not one on every entry the consumer
 * writes inside its `@for`.
 *
 * A projected entry's element injector chains through the `tn-form-list` it is
 * declared inside, the same way a control projected into `tn-form-field` reaches
 * {@link TN_FORM_FIELD_CONTEXT}. An entry used on its own injects nothing and
 * falls back to its own defaults.
 *
 * Its own file, and not `form-list.component.ts`, because the list already
 * imports the item to count its entries — a token declared beside either
 * component would make that import cycle.
 */
export interface TnFormListContext {
  /** Whether the enclosing list is locked, so an entry can disable its remove button. */
  disabled: Signal<boolean>;
}

/** DI token under which `tn-form-list` exposes its {@link TnFormListContext}. */
export const TN_FORM_LIST_CONTEXT = new InjectionToken<TnFormListContext>('TN_FORM_LIST_CONTEXT');
