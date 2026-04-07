import type { Provider } from '@angular/core';
import { TnToastRef, TnToastService } from './toast.service';
import type { TnToastConfig } from './toast.types';

/**
 * A recorded toast call for test assertions.
 */
export interface TnToastCall {
  message: string;
  action?: string;
  config: TnToastConfig;
  ref: TnToastRef;
}

/**
 * A mock implementation of TnToastService for unit testing.
 *
 * Records all `open()` calls so tests can assert on toast messages,
 * types, and actions without rendering actual toast components.
 *
 * @example
 * ```typescript
 * import { TnToastTesting } from '@truenas/ui-components';
 *
 * let toastMock: TnToastMock;
 *
 * beforeEach(() => {
 *   toastMock = new TnToastMock();
 *   TestBed.configureTestingModule({
 *     providers: [TnToastTesting.providers(toastMock)],
 *   });
 * });
 *
 * it('should show success toast', () => {
 *   // ... trigger action that opens a toast
 *   expect(toastMock.calls.length).toBe(1);
 *   expect(toastMock.lastCall?.message).toBe('Saved successfully');
 *   expect(toastMock.lastCall?.config.type).toBe(TnToastType.Success);
 * });
 *
 * it('should handle action click', () => {
 *   // ... trigger action that opens a toast with action
 *   toastMock.lastCall?.ref._triggerAction();
 *   // ... assert retry behavior
 * });
 * ```
 */
export class TnToastMock {
  /** All recorded toast open() calls. */
  calls: TnToastCall[] = [];

  /** The most recent toast call, or undefined if none. */
  get lastCall(): TnToastCall | undefined {
    return this.calls[this.calls.length - 1];
  }

  /** Clears all recorded calls. */
  reset(): void {
    this.calls = [];
  }

  open(message: string, actionOrConfig?: string | TnToastConfig, config?: TnToastConfig): TnToastRef {
    let action: string | undefined;
    let resolvedConfig: TnToastConfig = {};

    if (typeof actionOrConfig === 'string') {
      action = actionOrConfig;
      resolvedConfig = config ?? {};
    } else if (actionOrConfig) {
      resolvedConfig = actionOrConfig;
    }

    const ref = new TnToastRef();
    this.calls.push({ message, action, config: resolvedConfig, ref });
    return ref;
  }
}

/**
 * Test utilities for TnToastService.
 *
 * Provides a mock that records toast calls without rendering components,
 * making tests fast and deterministic.
 *
 * @example
 * ```typescript
 * const toastMock = new TnToastMock();
 *
 * TestBed.configureTestingModule({
 *   providers: [TnToastTesting.providers(toastMock)],
 * });
 * ```
 */
export class TnToastTesting {
  /**
   * Returns providers that replace TnToastService with the given mock.
   */
  static providers(mock: TnToastMock): Provider[] {
    return [{ provide: TnToastService, useValue: mock }];
  }
}
