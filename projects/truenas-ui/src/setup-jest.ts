import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';

/**
 * The test environment for every spec in this project, zoneless (#304).
 *
 * WHY THERE IS NO `import 'zone.js'` HERE
 * ---------------------------------------
 * Nothing this library ships needs Zone. `@angular/core` 21 marks `zone.js`
 * `optional: true`, the published manifest declares no peer for it, and no file
 * under `src/lib/` touches the `Zone` global — so `bootstrapApplication` in a
 * consumer and `@storybook/angular`'s preview are both already zoneless. The
 * test suite was the last environment still patching `setTimeout`, `Promise`
 * and `addEventListener`, which meant every spec exercised a runtime no
 * consumer runs.
 *
 * WHAT THAT COSTS A SPEC, since it is not free
 * --------------------------------------------
 * `fakeAsync`/`tick` are Zone APIs and are gone with it. Timer-driven specs use
 * Jest's own fake timers instead — `jest.useFakeTimers()` and
 * `jest.advanceTimersByTime(ms)`. The one behavioural difference that matters:
 * `tick()` drained the microtask queue as well as the timer queue, and
 * `advanceTimersByTime()` does not. A spec waiting on a promise (a
 * `MutationObserver` callback, a `whenStable()`) has to `await` it explicitly.
 * The seven specs converted in #304 each carry a note where that applied.
 */
setupZonelessTestEnv();

// Suppress expected console errors in test environment
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  const message = args[0]?.toString() || '';

  // Suppress expected icon/sprite loader errors in test environment
  if (
    message.includes('[TnSpriteLoader] Failed to load sprite config') ||
    message.includes('[TnIcon] Resolution failed') ||
    message.includes('Cannot log after tests are done')
  ) {
    return;
  }

  originalConsoleError.apply(console, args);
};
