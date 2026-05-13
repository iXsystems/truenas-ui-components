import { InjectionToken } from '@angular/core';

/**
 * Test-id attribute names supported by the library.
 *
 * - `'data-testid'` is the modern industry default and the library's out-of-the-box behavior.
 * - `'data-test'` exists for consumers that have an established convention they don't want to disrupt
 *   (notably webui, which has thousands of selectors targeting `data-test`).
 */
export type TnTestAttrName = 'data-test' | 'data-testid';

/**
 * Controls which attribute name the library renders `testId` values to.
 *
 * Defaults to `'data-testid'`. Consumers can override at the application root:
 *
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     { provide: TN_TEST_ATTR, useValue: 'data-test' },
 *   ],
 * });
 * ```
 *
 * Every component-level `testId` input and every `[tnTestId]` directive usage reads this token
 * so that a single override switches the entire library consistently.
 */
export const TN_TEST_ATTR = new InjectionToken<TnTestAttrName>('TN_TEST_ATTR', {
  providedIn: 'root',
  factory: () => 'data-testid',
});
