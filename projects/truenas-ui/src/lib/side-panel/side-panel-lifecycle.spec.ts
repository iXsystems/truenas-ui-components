import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NgZone } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
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
 * The fallback is a timer, so these tests need `fakeAsync` to see it — and a
 * timer is only reachable by `tick()` if it was scheduled inside that
 * `fakeAsync` zone. This one is armed with `runOutsideAngular`, so it lands in
 * the zone `NgZone` was CONSTRUCTED in — and `TestBed` constructs that once,
 * lazily, at the FIRST `TestBed.createComponent` of the suite. A `beforeEach`
 * that creates a fixture
 * therefore fixes the zone for every test after it, and the fallback then fires
 * on the real clock a third of a second after the test has already finished.
 *
 * That is why this is a separate file rather than another `describe` in
 * `side-panel.component.spec.ts`: sharing a suite means sharing that first
 * `createComponent`, and the fix is not local to the block that needs it.
 * Measured while writing these: with the shared fixture, three of the six below
 * failed and the other three passed on the `transitionend` path alone — which
 * is the failure mode worth naming, because a suite that half-passes reads as a
 * suite that works.
 */
describe('TnSidePanelComponent lifecycle outputs', () => {
  let panel: ComponentFixture<TnSidePanelComponent>;
  let opened: jest.Mock;
  let closed: jest.Mock;
  let warn: jest.SpyInstance;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnSidePanelComponent],
      // The panel's icon registry fetches the sprite config over HTTP, and
      // `fakeAsync` refuses a real XHR outright — "Cannot make XHRs from within
      // a fake async test". The testing backend answers nothing and is never
      // flushed here, which is the whole intent: no icon in this suite is
      // asserted on, and the request must simply not reach the network.
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    // Every fixture here is untitled and unlabelled, and #214 makes an unnamed
    // panel warn in dev mode — which Jest is. Silenced so this suite's output
    // stays readable; the warning itself is asserted in `side-panel-a11y.spec.ts`.
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // Destroys the portaled overlay this suite appended to `document.body`.
    panel.destroy();
    warn.mockRestore();
  });

  /** Build the fixture under test. Call first, from inside the `fakeAsync` body. */
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

  it('emits opened when no transitionend arrives', fakeAsync(() => {
    createPanel();
    setOpen(true);
    tick(TN_TRANSITION_FALLBACK_MS);

    expect(opened).toHaveBeenCalledTimes(1);
    expect(closed).not.toHaveBeenCalled();
  }));

  it('emits closed when no transitionend arrives', fakeAsync(() => {
    createPanel();
    setOpen(true);
    tick(TN_TRANSITION_FALLBACK_MS);
    setOpen(false);
    tick(TN_TRANSITION_FALLBACK_MS);

    expect(opened).toHaveBeenCalledTimes(1);
    expect(closed).toHaveBeenCalledTimes(1);
  }));

  it('emits once, not twice, when the transition does complete', fakeAsync(() => {
    createPanel();
    setOpen(true);
    finishTransition();

    expect(opened).toHaveBeenCalledTimes(1);

    tick(TN_TRANSITION_FALLBACK_MS);
    expect(opened).toHaveBeenCalledTimes(1);
  }));

  it('ignores a transitionend that arrives after the fallback already fired', fakeAsync(() => {
    createPanel();
    setOpen(true);
    tick(TN_TRANSITION_FALLBACK_MS);
    finishTransition();

    expect(opened).toHaveBeenCalledTimes(1);
  }));

  it('emits nothing while the panel stays closed', fakeAsync(() => {
    createPanel();
    tick(TN_TRANSITION_FALLBACK_MS);

    expect(opened).not.toHaveBeenCalled();
    expect(closed).not.toHaveBeenCalled();
  }));

  it('emits nothing for a panel that RENDERS open, which never opened', fakeAsync(() => {
    createPanel(true);
    tick(TN_TRANSITION_FALLBACK_MS);

    expect(opened).not.toHaveBeenCalled();
    expect(closed).not.toHaveBeenCalled();
  }));

  it('still emits closed for a panel that rendered open and is then closed', fakeAsync(() => {
    createPanel(true);
    setOpen(false);
    tick(TN_TRANSITION_FALLBACK_MS);

    expect(opened).not.toHaveBeenCalled();
    expect(closed).toHaveBeenCalledTimes(1);
  }));

  it('emits only the final state when a close interrupts an open', fakeAsync(() => {
    createPanel();
    setOpen(true);
    setOpen(false);
    tick(TN_TRANSITION_FALLBACK_MS);

    expect(opened).not.toHaveBeenCalled();
    expect(closed).toHaveBeenCalledTimes(1);
  }));

  it('does not hold NgZone unstable while the fallback is armed', fakeAsync(() => {
    createPanel();
    setOpen(true);

    // The timer is armed from an `effect`, which runs inside
    // `ApplicationRef.tick()` inside `NgZone.run(...)`, so scheduling it
    // without `runOutsideAngular` makes it an Angular-zone macrotask — and
    // `fixture.whenStable()` and CDK's `forceStabilize()` would then block for
    // the whole fallback window after every open and every close, in every
    // downstream suite that toggles one of these components.
    expect(TestBed.inject(NgZone).hasPendingMacrotasks).toBe(false);

    tick(TN_TRANSITION_FALLBACK_MS);
    expect(opened).toHaveBeenCalledTimes(1);
  }));

  it('emits nothing after the panel is destroyed mid-transition', fakeAsync(() => {
    createPanel();
    setOpen(true);
    panel.destroy();
    tick(TN_TRANSITION_FALLBACK_MS);

    expect(opened).not.toHaveBeenCalled();
  }));
});
