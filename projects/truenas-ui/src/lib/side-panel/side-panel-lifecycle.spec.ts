import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TnSidePanelComponent } from './side-panel.component';
import { TN_TRANSITION_FALLBACK_MS } from '../utils/transition-lifecycle';

/**
 * `opened` and `closed` fire exactly once per open and per close, whether or
 * not a transition runs (#218).
 *
 * WHY THE REDUCED-MOTION CASE IS REACHED BY DOING NOTHING
 * ------------------------------------------------------
 * `prefers-reduced-motion: reduce` zeroes this component's transition durations
 * (`side-panel.component.scss`), and a zero-duration transition fires no
 * `transitionend`. jsdom applies no stylesheet and runs no transition, so the
 * way to reproduce that user's experience is to simply NOT dispatch the event —
 * which is also the ONLY way, since jsdom would not fire one for a working
 * transition either. `finishTransition()` below is the other half: it stands in
 * for the browser that does.
 *
 * WHY THE FIXTURE IS BUILT INSIDE EACH TEST, AND WHY THIS IS ITS OWN FILE
 * ----------------------------------------------------------------------
 * The fallback is a timer, so these tests have to advance a clock to see it,
 * and the fixture has to exist before the clock they advance is the one the
 * timer lands on. Under Zone that was sharper than it sounds: `runOutsideAngular`
 * put the timer in the zone `NgZone` was CONSTRUCTED in, which `TestBed` did
 * lazily at the suite's FIRST `TestBed.createComponent`, so a `beforeEach` that
 * built a fixture fixed the zone for every test after it and the fallback then
 * fired on the real clock a third of a second after the test had finished.
 * Measured while writing these: with a shared fixture, three of the six below
 * failed and the other three passed on the `transitionend` path alone — which
 * is the failure mode worth naming, because a suite that half-passes reads as a
 * suite that works.
 *
 * Zone is gone (#304) and the fallback is now a plain `setTimeout` on Jest's
 * fake clock, with no such lazily-fixed identity. The per-test fixture stays
 * anyway, because it is also what keeps one test's armed fallback from
 * reporting into the next one's spies — and this stays a separate file from
 * `side-panel.component.spec.ts` so a suite-wide `useFakeTimers` is not imposed
 * on specs that want a real clock.
 */
describe('TnSidePanelComponent lifecycle outputs', () => {
  let panel: ComponentFixture<TnSidePanelComponent>;
  let opened: jest.Mock;
  let closed: jest.Mock;
  let warn: jest.SpyInstance;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnSidePanelComponent],
      // The panel's icon registry fetches the sprite config over HTTP. The
      // testing backend answers nothing and is never flushed here, which is the
      // whole intent: no icon in this suite is asserted on, and the request
      // must simply not reach the network. `fakeAsync` used to enforce that on
      // its own by refusing a real XHR outright ("Cannot make XHRs from within
      // a fake async test"); Jest's fake timers do not, so the testing backend
      // is now the only thing standing between this suite and the network.
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    // Every fixture here is untitled and unlabelled, and #214 makes an unnamed
    // panel warn in dev mode — which Jest is. Silenced so this suite's output
    // stays readable; the warning itself is asserted in `side-panel-a11y.spec.ts`.
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    // After `compileComponents`, so the fake clock is never the thing an
    // awaited compile is waiting on.
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Destroys the portaled overlay this suite appended to `document.body`.
    panel.destroy();
    warn.mockRestore();
    jest.useRealTimers();
  });

  /** Build the fixture under test. Call first. */
  function createPanel(open = false): void {
    panel = TestBed.createComponent(TnSidePanelComponent);
    panel.componentRef.setInput('open', open);
    panel.detectChanges();

    opened = jest.fn();
    closed = jest.fn();
    panel.componentInstance.opened.subscribe(opened);
    panel.componentInstance.closed.subscribe(closed);
  }

  function setOpen(open: boolean): void {
    panel.componentRef.setInput('open', open);
    panel.detectChanges();
  }

  /**
   * The `transitionend` a browser fires when the panel finishes moving.
   *
   * Assembled from `Event`, because jsdom implements no `TransitionEvent`
   * constructor — `propertyName` is the only field of it the handler reads.
   */
  function finishTransition(): void {
    const event = Object.assign(new Event('transitionend'), { propertyName: 'transform' });
    document
      .querySelector(`[data-tn-panel="${panel.componentInstance.panelId}"] .tn-side-panel__panel`)!
      .dispatchEvent(event);
  }

  it('emits opened when no transitionend arrives', () => {
    createPanel();
    setOpen(true);
    jest.advanceTimersByTime(TN_TRANSITION_FALLBACK_MS);

    expect(opened).toHaveBeenCalledTimes(1);
    expect(closed).not.toHaveBeenCalled();
  });

  it('emits closed when no transitionend arrives', () => {
    createPanel();
    setOpen(true);
    jest.advanceTimersByTime(TN_TRANSITION_FALLBACK_MS);
    setOpen(false);
    jest.advanceTimersByTime(TN_TRANSITION_FALLBACK_MS);

    expect(opened).toHaveBeenCalledTimes(1);
    expect(closed).toHaveBeenCalledTimes(1);
  });

  it('emits once, not twice, when the transition does complete', () => {
    createPanel();
    setOpen(true);
    finishTransition();

    expect(opened).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(TN_TRANSITION_FALLBACK_MS);
    expect(opened).toHaveBeenCalledTimes(1);
  });

  it('ignores a transitionend that arrives after the fallback already fired', () => {
    createPanel();
    setOpen(true);
    jest.advanceTimersByTime(TN_TRANSITION_FALLBACK_MS);
    finishTransition();

    expect(opened).toHaveBeenCalledTimes(1);
  });

  it('emits nothing while the panel stays closed', () => {
    createPanel();
    jest.advanceTimersByTime(TN_TRANSITION_FALLBACK_MS);

    expect(opened).not.toHaveBeenCalled();
    expect(closed).not.toHaveBeenCalled();
  });

  it('emits nothing for a panel that RENDERS open, which never opened', () => {
    createPanel(true);
    jest.advanceTimersByTime(TN_TRANSITION_FALLBACK_MS);

    expect(opened).not.toHaveBeenCalled();
    expect(closed).not.toHaveBeenCalled();
  });

  it('still emits closed for a panel that rendered open and is then closed', () => {
    createPanel(true);
    setOpen(false);
    jest.advanceTimersByTime(TN_TRANSITION_FALLBACK_MS);

    expect(opened).not.toHaveBeenCalled();
    expect(closed).toHaveBeenCalledTimes(1);
  });

  it('emits only the final state when a close interrupts an open', () => {
    createPanel();
    setOpen(true);
    setOpen(false);
    jest.advanceTimersByTime(TN_TRANSITION_FALLBACK_MS);

    expect(opened).not.toHaveBeenCalled();
    expect(closed).toHaveBeenCalledTimes(1);
  });

  /*
   * WHERE 'does not hold NgZone unstable while the fallback is armed' WENT
   * ---------------------------------------------------------------------
   * This file used to assert
   * `expect(TestBed.inject(NgZone).hasPendingMacrotasks).toBe(false)` right
   * after an open, guarding the `runOutsideAngular` in
   * `../utils/transition-lifecycle.ts`. #304 made the test suite zoneless, and
   * with no Zone `NgZone` resolves to `NoopNgZone`, whose `hasPendingMacrotasks`
   * is a hard-coded `false`. The assertion would have kept passing — including
   * with the `runOutsideAngular` deleted — which is worse than not having it.
   *
   * It is DELETED HERE AND REPLACED, not dropped: `../utils/transition-lifecycle.spec.ts`
   * covers the same guard by asserting that the fallback timer is scheduled
   * inside a `runOutsideAngular` callback and that the report goes back through
   * `zone.run`, both of which fail if the calls are removed. That test is on
   * the shared helper rather than on each of its two callers, which is where
   * the behaviour lives.
   */

  it('emits nothing after the panel is destroyed mid-transition', () => {
    createPanel();
    setOpen(true);
    panel.destroy();
    jest.advanceTimersByTime(TN_TRANSITION_FALLBACK_MS);

    expect(opened).not.toHaveBeenCalled();
  });
});
