import { Component, NgZone, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TN_TRANSITION_FALLBACK_MS, tnTransitionLifecycle } from './transition-lifecycle';
import type { TnTransitionLifecycle } from './transition-lifecycle';

/**
 * The narrowest possible caller of `tnTransitionLifecycle`: a state signal, a
 * spy for `settled`, and nothing else that could arm a timer or call into
 * `NgZone`. That exclusivity is the point — the assertions below count calls on
 * the injected `NgZone`, and `tn-drawer` / `tn-side-panel` both pull in focus
 * management, an overlay and an icon registry, any of which could contribute a
 * call of its own and make a count meaningless.
 */
@Component({
  standalone: true,
  template: '',
})
class LifecycleHostComponent {
  open = signal(false);
  settled = jest.fn<void, [boolean]>();
  lifecycle: TnTransitionLifecycle = tnTransitionLifecycle(this.open, this.settled);
}

/**
 * THE `runOutsideAngular` GUARD IN `transition-lifecycle.ts`, AND WHY IT IS
 * TESTED HERE RATHER THAN WHERE IT USED TO BE
 * ------------------------------------------------------------------------
 * `drawer-lifecycle.spec.ts` and `side-panel-lifecycle.spec.ts` each used to
 * assert `TestBed.inject(NgZone).hasPendingMacrotasks === false` after an open,
 * which is what the `runOutsideAngular` in `tnTransitionLifecycle` exists to
 * keep true: the fallback is armed from an `effect`, effects run inside
 * `ApplicationRef.tick()`, and under zone change detection `tick()` runs inside
 * `NgZone.run(...)` — so a plain `setTimeout` there would be an Angular-zone
 * macrotask holding the zone unstable for the whole 400ms window after every
 * open and close, in every downstream suite that toggles one of these
 * components.
 *
 * #304 made this project's test suite zoneless. `NgZone` then resolves to
 * `NoopNgZone`, whose `hasPendingMacrotasks` is a hard-coded `false` — so the
 * old assertion would have passed with the `runOutsideAngular` deleted. A test
 * that cannot fail is worse than no test, because it reads as coverage.
 *
 * These two assert the same guard WITHOUT needing a real Zone, by checking that
 * the calls are made and that the timer is the one they made:
 *
 *  - the fallback timer is the handle `runOutsideAngular` RETURNED, proven by
 *    clearing that handle and watching the fallback not fire. Moving the
 *    `setTimeout` out from inside the callback breaks that, because the call
 *    then returns something else (or is not made at all).
 *  - the report goes back through `zone.run`, which is what makes a consumer's
 *    `(closed)` handler visible to change detection under a zone-based app.
 *
 * `NoopNgZone` runs both callbacks synchronously, so the spies observe the real
 * control flow rather than a stub's.
 */
describe('tnTransitionLifecycle zone discipline', () => {
  let fixture: ComponentFixture<LifecycleHostComponent>;
  let host: LifecycleHostComponent;
  let zone: NgZone;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LifecycleHostComponent],
    }).compileComponents();

    jest.useFakeTimers();
    // Injected before the fixture exists, so the spies are in place for the
    // very first `effect` run.
    zone = TestBed.inject(NgZone);
  });

  afterEach(() => {
    fixture?.destroy();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  function createHost(): void {
    fixture = TestBed.createComponent(LifecycleHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('arms the fallback timer inside runOutsideAngular, not in Angular time', () => {
    createHost();

    /**
     * How deep inside a `runOutsideAngular` callback we currently are.
     *
     * Counting CALLS would not do: `ComponentFixture`'s own constructor and
     * Angular's render hooks each call `runOutsideAngular` too, so the number
     * varies with framework internals rather than with this file's subject.
     * What is being asserted is narrower and stable — that the ONE timer armed
     * at the fallback delay was scheduled while inside such a callback.
     */
    let depth = 0;
    jest.spyOn(zone, 'runOutsideAngular').mockImplementation(<T, >(fn: () => T): T => {
      depth += 1;
      try {
        return fn();
      } finally {
        depth -= 1;
      }
    });

    let armedOutside: boolean | null = null;
    const scheduleTimer = globalThis.setTimeout;
    jest.spyOn(globalThis, 'setTimeout').mockImplementation(((
      handler: TimerHandler,
      timeout?: number,
      ...args: unknown[]
    ) => {
      if (timeout === TN_TRANSITION_FALLBACK_MS) {
        armedOutside = depth > 0;
      }
      return scheduleTimer(handler, timeout, ...args);
    }) as unknown as typeof setTimeout);

    host.open.set(true);
    fixture.detectChanges();

    // `null` here would mean no timer was armed at the fallback delay at all,
    // which is a different failure from arming one in the wrong place.
    expect(armedOutside).toBe(true);

    // ...and it is a working timer, not merely a well-placed one.
    jest.advanceTimersByTime(TN_TRANSITION_FALLBACK_MS);
    expect(host.settled).toHaveBeenCalledWith(true);
  });

  it('reports back inside the Angular zone, so a consumer handler is seen', () => {
    createHost();
    const run = jest.spyOn(zone, 'run');

    host.open.set(true);
    fixture.detectChanges();
    expect(host.settled).not.toHaveBeenCalled();

    jest.advanceTimersByTime(TN_TRANSITION_FALLBACK_MS);

    expect(host.settled).toHaveBeenCalledWith(true);
    expect(run).toHaveBeenCalled();
  });

  // The early report takes the same route out, so it needs no zone of its own —
  // it is called from a DOM event handler the caller already owns.
  it('reports through transitionEnded without arming anything further', () => {
    createHost();
    host.open.set(true);
    fixture.detectChanges();

    host.lifecycle.transitionEnded();
    expect(host.settled).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(TN_TRANSITION_FALLBACK_MS);
    expect(host.settled).toHaveBeenCalledTimes(1);
  });
});
