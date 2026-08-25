import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TnDrawerComponent } from './drawer.component';
import type { TnDrawerMode } from './drawer.component';
import { TN_TRANSITION_FALLBACK_MS } from '../utils/transition-lifecycle';

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnDrawerComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-drawer
      ariaLabel="Navigation"
      [mode]="mode()"
      [(opened)]="opened"
      (openedComplete)="openedComplete()"
      (closed)="closed()">
      <p>Side menu content</p>
    </tn-drawer>
  `,
})
class TestHostComponent {
  mode = signal<TnDrawerMode>('side');
  opened = signal(false);
  openedComplete = jest.fn();
  closed = jest.fn();
}

/**
 * `openedComplete` and `closed` fire exactly once per open and per close,
 * whether or not a transition runs (#218).
 *
 * WHY THE REDUCED-MOTION CASE IS REACHED BY DOING NOTHING
 * ------------------------------------------------------
 * `prefers-reduced-motion: reduce` removes this component's transitions
 * (`drawer.component.scss`), and a transition that does not run fires no
 * `transitionend`. jsdom applies no stylesheet and runs no transition, so the
 * way to reproduce that user's experience is to simply NOT dispatch the event —
 * which is also the ONLY way, since jsdom would not fire one for a working
 * transition either. `finishTransition()` below is the other half: it stands in
 * for the browser that does.
 *
 * WHY THE FIXTURE IS BUILT INSIDE EACH TEST, AND WHY THIS IS ITS OWN FILE
 * ----------------------------------------------------------------------
 * The fallback is a timer, so these tests have to be able to advance a clock to
 * see it, and the fixture has to exist before the clock they advance is the one
 * the timer lands on. Both of those held under Zone for a subtler reason —
 * `runOutsideAngular` put the timer in the zone `NgZone` was CONSTRUCTED in,
 * which `TestBed` did lazily at the suite's FIRST `createComponent`, so a
 * `beforeEach` that built a fixture fixed the zone for every test after it and
 * the fallback then fired on the real clock a third of a second after the test
 * had finished.
 *
 * Zone is gone (#304) and the timer is now a plain `setTimeout` on Jest's fake
 * clock, which has no such lazily-fixed identity. The shape is kept anyway: a
 * per-test fixture is what keeps one test's armed fallback from reporting into
 * the next one's spies, and this stays a separate file from
 * `drawer.component.spec.ts` so a suite-wide `useFakeTimers` does not have to be
 * imposed on specs that want a real clock.
 */
describe('TnDrawerComponent lifecycle outputs', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    // After `compileComponents`, so the fake clock is never the thing an
    // awaited compile is waiting on.
    jest.useFakeTimers();
  });

  afterEach(() => {
    fixture.destroy();
    // The over-mode panel and backdrop are portaled to `document.body`, and
    // `destroy()` only takes the overlay wrapper the component holds a
    // reference to.
    document.body.querySelectorAll('.tn-drawer__panel--over').forEach((el) => el.remove());
    document.body.querySelectorAll('.tn-drawer__backdrop').forEach((el) => el.remove());
    jest.useRealTimers();
  });

  /** Build the fixture under test. Call first. */
  function createDrawer(mode: TnDrawerMode = 'side', opened = false): void {
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    host.mode.set(mode);
    host.opened.set(opened);
    fixture.detectChanges();
  }

  function setOpened(opened: boolean): void {
    host.opened.set(opened);
    fixture.detectChanges();
  }

  /**
   * The `transitionend` a browser fires when the panel finishes moving.
   *
   * Assembled from `Event`, because jsdom implements no `TransitionEvent`
   * constructor — `propertyName` is the only field of it the handler reads.
   * Dispatched on whichever panel the current mode rendered: side mode keeps it
   * inline, over mode portals it to `document.body`.
   */
  function finishTransition(): void {
    const panel = host.mode() === 'over'
      ? document.body.querySelector('.tn-drawer__panel--over')!
      : fixture.nativeElement.querySelector('.tn-drawer__panel');
    panel.dispatchEvent(Object.assign(new Event('transitionend'), { propertyName: 'transform' }));
  }

  it('emits openedComplete when no transitionend arrives', () => {
    createDrawer();
    setOpened(true);
    jest.advanceTimersByTime(TN_TRANSITION_FALLBACK_MS);

    expect(host.openedComplete).toHaveBeenCalledTimes(1);
    expect(host.closed).not.toHaveBeenCalled();
  });

  it('emits closed when no transitionend arrives', () => {
    createDrawer();
    setOpened(true);
    jest.advanceTimersByTime(TN_TRANSITION_FALLBACK_MS);
    setOpened(false);
    jest.advanceTimersByTime(TN_TRANSITION_FALLBACK_MS);

    expect(host.openedComplete).toHaveBeenCalledTimes(1);
    expect(host.closed).toHaveBeenCalledTimes(1);
  });

  it('emits in over mode too, where the panel is portaled', () => {
    createDrawer('over');
    setOpened(true);
    jest.advanceTimersByTime(TN_TRANSITION_FALLBACK_MS);
    setOpened(false);
    jest.advanceTimersByTime(TN_TRANSITION_FALLBACK_MS);

    expect(host.openedComplete).toHaveBeenCalledTimes(1);
    expect(host.closed).toHaveBeenCalledTimes(1);
  });

  it('emits once, not twice, when the transition does complete', () => {
    createDrawer();
    setOpened(true);
    finishTransition();

    expect(host.openedComplete).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(TN_TRANSITION_FALLBACK_MS);
    expect(host.openedComplete).toHaveBeenCalledTimes(1);
  });

  it('ignores a transitionend that arrives after the fallback already fired', () => {
    createDrawer();
    setOpened(true);
    jest.advanceTimersByTime(TN_TRANSITION_FALLBACK_MS);
    finishTransition();

    expect(host.openedComplete).toHaveBeenCalledTimes(1);
  });

  it('emits nothing while the drawer stays closed', () => {
    createDrawer();
    jest.advanceTimersByTime(TN_TRANSITION_FALLBACK_MS);

    expect(host.openedComplete).not.toHaveBeenCalled();
    expect(host.closed).not.toHaveBeenCalled();
  });

  it('emits nothing for a drawer that RENDERS open, which never opened', () => {
    createDrawer('side', true);
    jest.advanceTimersByTime(TN_TRANSITION_FALLBACK_MS);

    expect(host.openedComplete).not.toHaveBeenCalled();
    expect(host.closed).not.toHaveBeenCalled();
  });

  it('still emits closed for a drawer that rendered open and is then closed', () => {
    createDrawer('side', true);
    setOpened(false);
    jest.advanceTimersByTime(TN_TRANSITION_FALLBACK_MS);

    expect(host.openedComplete).not.toHaveBeenCalled();
    expect(host.closed).toHaveBeenCalledTimes(1);
  });

  it('emits only the final state when a close interrupts an open', () => {
    createDrawer();
    setOpened(true);
    setOpened(false);
    jest.advanceTimersByTime(TN_TRANSITION_FALLBACK_MS);

    expect(host.openedComplete).not.toHaveBeenCalled();
    expect(host.closed).toHaveBeenCalledTimes(1);
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
   * covers the same guard by asserting that the fallback timer is the one armed
   * inside `runOutsideAngular` and that the report goes back through
   * `zone.run`, both of which fail if the calls are removed. That test is on the
   * shared helper rather than on each of its two callers, which is where the
   * behaviour lives.
   */

  it('emits nothing after the drawer is destroyed mid-transition', () => {
    createDrawer();
    setOpened(true);
    fixture.destroy();
    jest.advanceTimersByTime(TN_TRANSITION_FALLBACK_MS);

    expect(host.openedComplete).not.toHaveBeenCalled();
  });
});
