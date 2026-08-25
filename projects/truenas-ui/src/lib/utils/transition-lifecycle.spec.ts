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
 * These assert the same guard WITHOUT needing a real Zone, by watching WHERE
 * the calls happen rather than what a no-op zone reports afterwards:
 *
 *  - the fallback timer is scheduled while inside a `runOutsideAngular`
 *    callback, read from a depth counter the spy maintains. Moving the
 *    `setTimeout` out from inside the callback drops the depth to zero.
 *  - the report runs while inside a `zone.run` callback, read the same way.
 *    That is what makes a consumer's `(closed)` handler visible to change
 *    detection under a zone-based application.
 *
 * Neither counts CALLS: `ComponentFixture`'s constructor and Angular's own
 * render hooks use both methods, so a count measures framework internals. Depth
 * at the moment of the thing under test does not.
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
    // Mocks first. One of the tests below spies on `globalThis.setTimeout`
    // while the fake clock is installed, so what `restoreAllMocks` puts back is
    // the FAKE function — running it after `useRealTimers` would write the fake
    // timer onto `globalThis` again and leave it there for the next test.
    jest.restoreAllMocks();
    jest.useRealTimers();
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

    // Depth again, not a call count, and for the same reason. `zone.run` in
    // particular is called all over Angular's own testing infrastructure, so
    // `toHaveBeenCalled()` here would be true no matter what this function did.
    let depth = 0;
    jest.spyOn(zone, 'run').mockImplementation(<T, >(fn: () => T): T => {
      depth += 1;
      try {
        return fn();
      } finally {
        depth -= 1;
      }
    });

    let reportedInside: boolean | null = null;
    host.settled.mockImplementation(() => {
      reportedInside = depth > 0;
    });

    host.open.set(true);
    fixture.detectChanges();
    expect(host.settled).not.toHaveBeenCalled();

    jest.advanceTimersByTime(TN_TRANSITION_FALLBACK_MS);

    expect(host.settled).toHaveBeenCalledWith(true);
    // `null` would mean `settled` never ran; `false` that it ran outside the
    // zone, which is the shape that leaves a consumer's `(closed)` handler
    // invisible to zone-based change detection.
    expect(reportedInside).toBe(true);
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
