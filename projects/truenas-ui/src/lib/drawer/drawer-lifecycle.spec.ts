import { Component, signal, viewChild } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
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
      #drawer
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
  drawer = viewChild.required<TnDrawerComponent>('drawer');
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
 * The fallback is a timer, so these tests need `fakeAsync` to see it — and a
 * timer is only reachable by `tick()` if it was scheduled inside that
 * `fakeAsync` zone. Angular arms this one from an `effect`, which runs in the
 * `NgZone`, which `TestBed` creates once, lazily, at the FIRST
 * `TestBed.createComponent` of the suite. A `beforeEach` that creates a fixture
 * therefore fixes the zone for every test after it, and the fallback then fires
 * on the real clock a third of a second after the test has already finished.
 *
 * That is why this is a separate file rather than another `describe` in
 * `drawer.component.spec.ts`: sharing a suite means sharing that first
 * `createComponent`, and the fix is not local to the block that needs it.
 */
describe('TnDrawerComponent lifecycle outputs', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();
  });

  afterEach(() => {
    fixture.destroy();
    // The over-mode panel and backdrop are portaled to `document.body`, and
    // `destroy()` only takes the overlay wrapper the component holds a
    // reference to.
    document.body.querySelectorAll('.tn-drawer__panel--over').forEach((el) => el.remove());
    document.body.querySelectorAll('.tn-drawer__backdrop').forEach((el) => el.remove());
  });

  /** Build the fixture under test. Call first, from inside the `fakeAsync` body. */
  function createDrawer(mode: TnDrawerMode = 'side'): void {
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    host.mode.set(mode);
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

  it('emits openedComplete when no transitionend arrives', fakeAsync(() => {
    createDrawer();
    setOpened(true);
    tick(TN_TRANSITION_FALLBACK_MS);

    expect(host.openedComplete).toHaveBeenCalledTimes(1);
    expect(host.closed).not.toHaveBeenCalled();
  }));

  it('emits closed when no transitionend arrives', fakeAsync(() => {
    createDrawer();
    setOpened(true);
    tick(TN_TRANSITION_FALLBACK_MS);
    setOpened(false);
    tick(TN_TRANSITION_FALLBACK_MS);

    expect(host.openedComplete).toHaveBeenCalledTimes(1);
    expect(host.closed).toHaveBeenCalledTimes(1);
  }));

  it('emits in over mode too, where the panel is portaled', fakeAsync(() => {
    createDrawer('over');
    setOpened(true);
    tick(TN_TRANSITION_FALLBACK_MS);
    setOpened(false);
    tick(TN_TRANSITION_FALLBACK_MS);

    expect(host.openedComplete).toHaveBeenCalledTimes(1);
    expect(host.closed).toHaveBeenCalledTimes(1);
  }));

  it('emits once, not twice, when the transition does complete', fakeAsync(() => {
    createDrawer();
    setOpened(true);
    finishTransition();

    expect(host.openedComplete).toHaveBeenCalledTimes(1);

    tick(TN_TRANSITION_FALLBACK_MS);
    expect(host.openedComplete).toHaveBeenCalledTimes(1);
  }));

  it('ignores a transitionend that arrives after the fallback already fired', fakeAsync(() => {
    createDrawer();
    setOpened(true);
    tick(TN_TRANSITION_FALLBACK_MS);
    finishTransition();

    expect(host.openedComplete).toHaveBeenCalledTimes(1);
  }));

  it('emits nothing while the drawer stays closed', fakeAsync(() => {
    createDrawer();
    tick(TN_TRANSITION_FALLBACK_MS);

    expect(host.openedComplete).not.toHaveBeenCalled();
    expect(host.closed).not.toHaveBeenCalled();
  }));

  it('emits only the final state when a close interrupts an open', fakeAsync(() => {
    createDrawer();
    setOpened(true);
    setOpened(false);
    tick(TN_TRANSITION_FALLBACK_MS);

    expect(host.openedComplete).not.toHaveBeenCalled();
    expect(host.closed).toHaveBeenCalledTimes(1);
  }));

  it('emits nothing after the drawer is destroyed mid-transition', fakeAsync(() => {
    createDrawer();
    setOpened(true);
    fixture.destroy();
    tick(TN_TRANSITION_FALLBACK_MS);

    expect(host.openedComplete).not.toHaveBeenCalled();
  }));
});
