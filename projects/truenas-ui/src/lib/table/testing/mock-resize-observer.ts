/**
 * Stand-in for `ResizeObserver`, which jsdom does not implement — so a `tn-table` under
 * test can never measure its own container and never leaves the table layout on its own.
 * Installing this lets a spec push a width through the component's real callback path
 * rather than reaching for its private state.
 *
 * Shared deliberately: two specs had byte-for-byte copies of it, and the first one to
 * need `contentBoxSize` or a `disconnect()` assertion would have drifted, leaving the
 * other silently no longer exercising the resize path.
 *
 * @example
 * ```typescript
 * let restoreResizeObserver: () => void;
 *
 * beforeEach(() => { restoreResizeObserver = installMockResizeObserver(); });
 * afterEach(() => { restoreResizeObserver(); });
 *
 * // ...then, inside a test:
 * emitContainerWidth(320);
 * fixture.detectChanges();
 * ```
 */
export class MockResizeObserver {
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
 * Swaps `globalThis.ResizeObserver` for {@link MockResizeObserver} and clears any
 * instances left by a previous test.
 *
 * @returns A function that restores the original global — call it in `afterEach`.
 */
export function installMockResizeObserver(): () => void {
  const original = globalThis.ResizeObserver;
  MockResizeObserver.instances = [];
  globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
  return () => {
    globalThis.ResizeObserver = original;
  };
}

/** Pushes `width` through every observer the component under test registered. */
export function emitContainerWidth(width: number): void {
  MockResizeObserver.instances.forEach((observer) => observer.emitWidth(width));
}
