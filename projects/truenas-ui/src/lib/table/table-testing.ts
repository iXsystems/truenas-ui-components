/**
 * Stand-in for `ResizeObserver`, which jsdom does not implement — so a `tn-table` under
 * test can never measure its own container and never leaves the table layout on its own.
 * Installing this lets a spec push a width through the component's real callback path
 * rather than reaching for its private state.
 *
 * Module-private on purpose. `MockResizeObserver` is a name a consumer's own test helpers
 * plausibly already define — this repo's own `tree-virtual-scroll-view.component.spec.ts`
 * declares one — and a wildcard import of the library would collide with it. Everything a
 * caller needs is reachable through {@link TnTableTesting}.
 */
class MockResizeObserver {
  static instances: MockResizeObserver[] = [];

  constructor(private cb: ResizeObserverCallback) {
    MockResizeObserver.instances.push(this);
  }

  observe(): void { /* no-op */ }
  unobserve(): void { /* no-op */ }
  disconnect(): void { /* no-op */ }

  /** Fires the observed callback with `width` as the element's content-box width. */
  emitWidth(width: number): void {
    this.cb(
      [{ contentRect: { width } } as ResizeObserverEntry],
      this as unknown as ResizeObserver
    );
  }
}

/**
 * Testing utilities for `tn-table`'s container-driven responsive layout.
 *
 * Part of the public API because `TnTableHarness`'s layout-mismatch messages tell the caller
 * to widen or narrow the container past `cardBreakpoint`, and jsdom implements no
 * `ResizeObserver` — so without a stand-in a consumer's own spec has no supported way to
 * follow that advice.
 *
 * Namespaced rather than exported as loose functions, matching `TnIconTesting` and
 * `TnToastTesting`: these names live at the top level of the package, and `installObserver`
 * or `emitContainerWidth` on their own give no hint that they concern tables.
 *
 * @example
 * ```typescript
 * let restoreResizeObserver: () => void;
 *
 * beforeEach(() => { restoreResizeObserver = TnTableTesting.installResizeObserver(); });
 * afterEach(() => { restoreResizeObserver(); });
 *
 * // ...then, inside a test:
 * TnTableTesting.emitContainerWidth(320);
 * fixture.detectChanges();
 * ```
 */
export const TnTableTesting = {
  /**
   * Swaps `globalThis.ResizeObserver` for a stand-in and clears any instances left by a
   * previous test.
   *
   * @returns A function that restores the original global — call it in `afterEach`.
   */
  installResizeObserver(): () => void {
    const original = globalThis.ResizeObserver;
    MockResizeObserver.instances = [];
    globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
    return () => {
      globalThis.ResizeObserver = original;
    };
  },

  /**
   * Pushes `width` through every observer the component under test registered, as its
   * content-box width — the same quantity `measureContainer` reads on the initial pass.
   *
   * @param width Content-box width in px. A 0 reads as unmeasurable, not narrow.
   */
  emitContainerWidth(width: number): void {
    MockResizeObserver.instances.forEach((observer) => observer.emitWidth(width));
  },
};
