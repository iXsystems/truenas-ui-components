import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TnSidePanelComponent } from './side-panel.component';

/**
 * Guards the half of the modal focus contract that opening a panel owes (#227):
 * focus must be INSIDE the panel once it is open.
 *
 * WHAT WAS REPORTED
 * -----------------
 * Driving Storybook in a real browser, `side-panel--default` opened with
 * `document.activeElement` still on the trigger behind it — 800ms after the
 * click, well past the transition. `side-panel--with-actions`, which has a form
 * in it, captured focus normally. `aria-modal="true"` had meanwhile told
 * assistive technology to ignore everything outside the dialog, so the listener
 * was left on a control their screen reader had just been told does not exist
 * (WCAG 2.4.3, Focus Order).
 *
 * WHY NO SPEC CAUGHT IT
 * ---------------------
 * `side-panel-a11y.spec.ts` asserted focus RESTORATION, and to have something to
 * restore it moved focus into the panel by hand — `(overlay().querySelector(
 * '#inside')).focus()` — with a comment saying that is what a real open does.
 * Nothing asserted it. Every focus assertion in that file sat downstream of that
 * call, so the suite stayed green while `--default` captured nothing at all.
 * Those two tests no longer call `.focus()`; they open the panel and let the
 * component move focus, which is what makes them able to fail.
 *
 * WHAT JSDOM CAN AND CANNOT SHOW HERE
 * -----------------------------------
 * These assertions are meaningful under jsdom only because the fix does not
 * depend on layout. The OLD path, `[cdkTrapFocusAutoCapture]`, searched the
 * panel for the first element the CDK's `InteractivityChecker` calls tabbable,
 * and that test reads `offsetWidth` / `getClientRects()` — which jsdom reports
 * as zero and empty for everything. Measured on the unfixed component: focus
 * stayed on the trigger under plain jsdom, and moved to the × button as soon as
 * `getClientRects` was stubbed to return a rect. So jsdom failed that path
 * unconditionally and passed it with a one-line stub, which is why it could
 * neither reproduce the browser's behaviour nor be trusted about it.
 *
 * What is asserted below is the component's own guarantee: on open it focuses
 * the panel container, which exists whatever the caller projected. The
 * browser-level statement — that a real user clicking a real trigger ends up
 * inside the dialog — is asserted where a browser runs it, in the `play`
 * functions on `Default` and `WithActions` in `side-panel.stories.ts`, which CI
 * runs under Playwright.
 */

@Component({
  selector: 'tn-side-panel-focus-host',
  standalone: true,
  imports: [TnSidePanelComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <button type="button" id="trigger" (click)="open.set(true)">Open</button>
    <tn-side-panel title="Edit dataset" [(open)]="open">
      <p>Panel body</p>
      @if (withForm()) {
        <input id="name" type="text" />
      }
    </tn-side-panel>
  `,
})
class SidePanelFocusHostComponent {
  open = signal(false);
  /**
   * The two shapes the report distinguished: a panel whose only tabbable is its
   * own × button, and one with a form in it. Both must end with focus inside.
   */
  withForm = signal(false);
}

describe('tn-side-panel focus capture (#227)', () => {
  let fixture: ComponentFixture<SidePanelFocusHostComponent>;
  let host: SidePanelFocusHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidePanelFocusHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SidePanelFocusHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // The overlay is portaled to document.body and only removed on destroy, so
    // without this the next fixture in this file finds the previous one's panel.
    fixture.destroy();
  });

  function overlay(): HTMLElement {
    return document.body.querySelector('.tn-side-panel__overlay') as HTMLElement;
  }

  function panel(): HTMLElement {
    return overlay().querySelector('.tn-side-panel__panel') as HTMLElement;
  }

  function trigger(): HTMLElement {
    return fixture.nativeElement.querySelector('#trigger') as HTMLElement;
  }

  /**
   * Opens the panel the way the user does — through the trigger's click handler
   * — and settles the render. NOTHING here touches focus: the component moving
   * it is the whole assertion.
   *
   * `whenStable()` is what runs the `afterNextRender` the focus is deferred to.
   * That deferral is not an implementation detail to work around: a closed panel
   * is `inert`, and focusing into an inert subtree does nothing, so the focus
   * has to wait for the pass that removes the attribute to have written it.
   */
  async function openByClick(): Promise<void> {
    trigger().click();
    fixture.detectChanges();
    await fixture.whenStable();
  }

  /**
   * Lets one animation frame pass, which is what the capture's retry waits for.
   * Our own callback is queued after it, so by the time this resolves the
   * re-attempt has already run.
   */
  function nextFrame(): Promise<void> {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }

  it('moves focus into the panel, for a panel whose only control is its × button', async () => {
    trigger().focus();
    expect(document.activeElement).toBe(trigger());

    await openByClick();

    expect(panel().contains(document.activeElement)).toBe(true);
    expect(document.activeElement).not.toBe(trigger());
  });

  it('moves focus into the panel when it contains a form', async () => {
    host.withForm.set(true);
    fixture.detectChanges();
    trigger().focus();

    await openByClick();

    expect(panel().contains(document.activeElement)).toBe(true);
  });

  /**
   * WHICH element, said out loud: the panel container, not its first tabbable.
   * `../a11y/initial-focus.ts` holds the reasoning — it is the only target that
   * exists whatever the caller projected, and a screen reader announces the
   * dialog's name and role from it. A future change that moves focus to the
   * close button instead would still satisfy the two tests above; this is the
   * one that says which was chosen.
   */
  it('focuses the panel container itself, inside the element that names the dialog', async () => {
    await openByClick();

    expect(document.activeElement).toBe(panel());
    expect(panel().getAttribute('tabindex')).toBe('-1');
    // The role, the modal flag and the name are on the OVERLAY here — the panel
    // is a child of it, so focus landing on the panel is focus landing in the
    // dialog, with no control of its own claiming the announcement.
    expect(overlay().getAttribute('aria-modal')).toBe('true');
    expect(overlay().contains(panel())).toBe(true);
  });

  it('leaves focus alone while the panel stays closed', async () => {
    trigger().focus();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(document.activeElement).toBe(trigger());
  });

  /**
   * The panel with nothing tabbable in it at all — no projected control, and the
   * × button reduced to a non-tabbable element. This is the case the old path
   * could not serve even in a browser: `focusFirstTabbableElement()` finds
   * nothing, returns `false`, and nobody reads the `false`.
   */
  it('still moves focus in when the panel holds no tabbable element', async () => {
    trigger().focus();
    const closeButton = overlay().querySelector('.tn-icon-button') as HTMLElement;
    closeButton.tabIndex = -1;

    await openByClick();

    expect(document.activeElement).toBe(panel());
  });

  /**
   * `focus()` is a request the browser may decline in silence, and CI measured
   * it declining one: with the capture as a single deferred call, this panel
   * opened with focus still on the trigger in Chromium while the panel
   * containing a form captured normally. `../a11y/initial-focus.ts` therefore
   * reads the move back and re-attempts it on animation frames.
   *
   * The decline is staged here rather than reproduced, because jsdom has no
   * notion of an element being unfocusable for a moment — what is asserted is
   * that a dropped first call is noticed and followed, which is the part that
   * was missing.
   */
  it('tries again after a first focus that is silently dropped', async () => {
    trigger().focus();
    const target = panel();
    const reallyFocus = HTMLElement.prototype.focus.bind(target);
    let attempts = 0;
    jest.spyOn(target, 'focus').mockImplementation(() => {
      attempts++;
      // Exactly the first call goes nowhere, the way the browser declines one.
      if (attempts > 1) {
        reallyFocus();
      }
    });

    await openByClick();
    await nextFrame();

    // Both halves matter, and neither on its own would fail against a single
    // undeferred call: the count says a second attempt was made, and the
    // active element says it was the attempt that worked. Which frame the
    // retry lands on is not asserted — jsdom is free to serve one during
    // `whenStable`, and it does, intermittently.
    expect(attempts).toBeGreaterThan(1);
    expect(document.activeElement).toBe(target);
  });

  /**
   * The retry re-attempts until the move takes — and "focus is inside the
   * panel" is the move having taken, whoever put it there. A caller focusing
   * the first field of their form, or a user who has started typing in one,
   * must not be pulled back to the container on the next frame.
   *
   * Staged like the test above: the component's own call goes nowhere, so a
   * retry is pending when focus arrives inside by another route.
   */
  it('leaves focus alone when it is already inside the panel', async () => {
    trigger().focus();
    const target = panel();
    let dropped = false;
    jest.spyOn(target, 'focus').mockImplementation(() => {
      dropped = true;
    });

    await openByClick();
    expect(dropped).toBe(true);

    (overlay().querySelector('.tn-icon-button') as HTMLElement).focus();
    const landed = document.activeElement;
    expect(target.contains(landed)).toBe(true);
    expect(landed).not.toBe(target);

    await nextFrame();
    await nextFrame();

    expect(document.activeElement).toBe(landed);
  });

  /**
   * The retry has to stop. A panel still refusing focus a full transition after
   * it opened is not mid-anything, and a callback that re-arms itself forever
   * is a leak on every open.
   *
   * Asserted as "the attempts plateau" rather than against the frame budget
   * itself, so that tuning the budget does not rewrite the test that says it
   * terminates.
   */
  it('gives up rather than re-attempting forever', async () => {
    trigger().focus();
    const target = panel();
    const focusSpy = jest.spyOn(target, 'focus').mockImplementation(() => undefined);

    await openByClick();

    // Run frames until a frame passes with no new attempt. Capped so that a
    // capture which never gives up fails this test rather than hanging it, and
    // counted in frames rather than assumed, because how long the window is
    // worth in frames depends on how fast jsdom serves them.
    const cap = 200;
    let frames = 0;
    let previous = -1;
    while (focusSpy.mock.calls.length !== previous && frames < cap) {
      previous = focusSpy.mock.calls.length;
      await nextFrame();
      frames++;
    }
    expect(frames).toBeLessThan(cap);

    const settled = focusSpy.mock.calls.length;
    await nextFrame();
    await nextFrame();

    expect(focusSpy.mock.calls.length).toBe(settled);
  });

  /**
   * Reopening after a close, because the effect that drives this only acts on a
   * change INTO the open state — a second open is a second change, and a panel
   * that captures once and never again is the same defect with a longer path to
   * it.
   */
  it('captures again on a second open', async () => {
    trigger().focus();
    await openByClick();
    expect(document.activeElement).toBe(panel());

    host.open.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement).toBe(trigger());

    await openByClick();

    expect(document.activeElement).toBe(panel());
  });

  /**
   * Capture and restoration are one contract read in two directions, and this is
   * the version of the restoration test that does not stage its own precondition
   * — the panel captures focus, the close puts it back, and neither step is the
   * spec's doing.
   */
  it('returns focus to the trigger on close, having really taken it away', async () => {
    trigger().focus();
    await openByClick();
    expect(document.activeElement).not.toBe(trigger());

    host.open.set(false);
    fixture.detectChanges();

    expect(document.activeElement).toBe(trigger());
  });

  /**
   * Destroying a panel that is still open — a `@if` around it, a route change —
   * is the other way focus leaves it, and it runs no close. The removal drops
   * focus on `<body>`, and until #227 it was `CdkTrapFocus.ngOnDestroy` that
   * put it back, off the back of the auto-capture that replaced.
   */
  it('returns focus to the trigger when a panel is destroyed while open', async () => {
    trigger().focus();
    const opener = trigger();
    await openByClick();
    expect(document.activeElement).not.toBe(opener);

    fixture.destroy();

    expect(document.activeElement).toBe(opener);
  });
});
