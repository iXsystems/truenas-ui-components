import { Injector, NgZone, afterNextRender, effect, inject } from '@angular/core';
import type { Signal } from '@angular/core';

/**
 * The one place that decides WHERE focus goes when a modal surface opens.
 *
 * WHY THIS EXISTS AT ALL
 * ----------------------
 * `tn-side-panel` and `tn-drawer` both asked the CDK for it, with
 * `[cdkTrapFocusAutoCapture]="open()"`, and both could open with focus still on
 * the trigger BEHIND them (#227). Auto-capture calls
 * `FocusTrap.focusFirstTabbableElement()`, which walks the panel for the first
 * element the CDK's `InteractivityChecker` calls tabbable — a test that reads
 * layout (`offsetWidth`, `getClientRects()`, computed `visibility`) — and
 * returns `false`, silently, when it finds nothing. Nobody reads that `false`.
 * So the guarantee was: focus moves inside IF the panel happens to contain
 * something the browser considers tabbable at the moment capture runs.
 *
 * That is a guarantee about the caller's content, not about the component. A
 * panel whose only control is its own × button is one layout detail away from
 * having no tabbable at all, and a panel with no interactive content — a
 * details pane, a preview — has none by construction. `aria-modal="true"` has
 * meanwhile told assistive technology to ignore everything outside the dialog,
 * so the user is left on a control their screen reader has just been told does
 * not exist (WCAG 2.4.3).
 *
 * WHERE FOCUS GOES, AND WHY THERE
 * -------------------------------
 * **The panel container itself**, which both components already render with
 * `tabindex="-1"`. Not its first tabbable, and not an explicit `cdkFocusInitial`:
 *
 * - It is the only target that exists whatever the caller projected. That is
 *   the whole defect — a rule that depends on the content is a rule that has a
 *   content shape it fails for, and this one failed for the commonest shape
 *   there is.
 * - Focus arriving on it is focus arriving in the dialog with nothing else
 *   claimed: a screen reader announces the dialog it has just entered — its
 *   name and role — and reads on into the content. That is the announcement the
 *   ELEMENT CARRYING `role="dialog"` produces, which is this container in
 *   `tn-drawer` and its parent overlay in `tn-side-panel`; the container is
 *   inside it either way. Landing on the × button instead announces "Dismiss,
 *   button" first, which is the one control in the panel that says nothing
 *   about what just opened.
 * - Sequential navigation from a container proceeds INTO it, so the first Tab
 *   still reaches the close button: the same place auto-capture aimed at, one
 *   keystroke later, with the announcement first.
 *
 * A caller who needs a specific control focused instead — the first field of a
 * form — should focus it themselves; there is no input for it, because nothing
 * has asked for one and a per-component override is another way for the
 * guarantee above to be conditional.
 *
 * WHY A SHARED FUNCTION AND NOT A COPY PER COMPONENT
 * -------------------------------------------------
 * The same reasoning as `accessible-name.ts` and `../utils/transition-lifecycle.ts`,
 * and the same evidence: `tn-drawer` was written from `tn-side-panel`, and the
 * two have now reached identical bugs three times (#214, #218, and this). What
 * is subtle here is not the `focus()` call but WHEN it may run — see below — and
 * a second copy of that is a second chance to get it wrong.
 *
 * Not exported from `public-api.ts`, and must not be: it is how this library's
 * own components agree with each other, not API.
 */

/**
 * Move focus into a modal surface as it opens, and keep it out of the way
 * otherwise.
 *
 * **Must be called from an injection context** — a field initializer or the
 * constructor — because it registers an `effect` and needs an `Injector` to
 * schedule the focus for after the render.
 *
 * WHY `afterNextRender` AND NOT THE EFFECT ITSELF
 * ----------------------------------------------
 * A closed panel carries `inert`, and focusing an element inside an inert
 * subtree does nothing at all — the browser drops the call without an error.
 * The attribute is removed by the same change detection pass this effect runs
 * in, so a `focus()` from inside the effect would race the binding that makes
 * the element focusable in the first place. `afterNextRender` runs once that
 * pass has written the DOM, which is the earliest point the panel can be
 * focusable.
 *
 * WHY THE MOVE IS CHECKED RATHER THAN ASSUMED
 * -------------------------------------------
 * `HTMLElement.focus()` reports nothing. It is a request, and the browser
 * declines it silently whenever the element is not focusable AT THAT INSTANT —
 * which is the same silence that made the bug this file exists for invisible.
 * A single deferred call is therefore a guess about timing, and CI measured it
 * wrong: with the call in `afterNextRender` alone, `side-panel--default` and
 * `drawer--over-mode` both opened with focus still outside the dialog, while
 * `side-panel--with-actions` captured. Three shapes of the same component,
 * two outcomes, one code path — so the deciding factor was the state of the
 * panel when the call landed, not the call.
 *
 * **What that state is has not been established here**, and this comment will
 * not pretend otherwise: no browser can run in the environment these cycles
 * work in, so the evidence is the CI log and no more. The panel being mid
 * transition is the ticket's own hypothesis and remains one.
 *
 * What does not need establishing is the remedy. Focus is observable —
 * `document.activeElement` says where it went — so the move is READ BACK, and
 * re-attempted on animation frames until it takes or the open transition has
 * had time to finish. When the first call works, which is every jsdom spec and
 * was `--with-actions` in CI, nothing after it runs and this costs one
 * comparison. Reading back a write whose failure mode is silence is the same
 * rule `handoff.py` follows for the same reason.
 *
 * @param isOpen Whether the surface is open AND modal. `tn-drawer` is modal
 *   only in `over` mode, so it passes a computed condition rather than its
 *   `opened` model.
 * @param target The element to focus, read at focus time. A `viewChild` inside
 *   an `@if` returns `undefined` until it renders, which is exactly the case
 *   the deferral above handles.
 */
export function tnFocusOnOpen(
  isOpen: Signal<boolean>,
  target: () => HTMLElement | null | undefined
): void {
  const injector = inject(Injector);
  // The retries run outside Angular, because they touch no state it tracks: a
  // `focus()` per frame inside the zone is a change detection pass per frame,
  // for the whole length of an opening transition.
  const zone = inject(NgZone);

  /**
   * What the effect last saw, so that only a CHANGE into the open state moves
   * focus.
   *
   * Seeded `false` because that is what a surface renders as by default, which
   * makes a panel that renders already open — `[open]="true"` on first
   * render — an edge into open, and it captures. That matches what auto-capture
   * did: `CdkTrapFocus.ngAfterContentInit` captures when `autoCapture` is
   * already true.
   *
   * Re-running with the state unchanged must NOT re-focus: the effect also
   * re-runs when anything else it reads changes, and pulling focus back to the
   * container while the user is typing in the panel is worse than the bug.
   */
  let wasOpen = false;

  effect(() => {
    const open = isOpen();
    if (open === wasOpen) {
      return;
    }
    wasOpen = open;

    if (!open) {
      return;
    }

    afterNextRender(
      () => zone.runOutsideAngular(() => capture(isOpen, target, RETRY_FRAMES)),
      { injector }
    );
  });
}

/**
 * How many animation frames the capture may re-attempt over before giving up.
 *
 * Both components transition for 300ms, which is 18 frames at 60Hz; 24 covers
 * that with a margin and is still a fifth of a second. There is no value in
 * trying for longer — a panel that is still refusing focus a full transition
 * after it opened is not mid-anything, and holding a callback alive past the
 * point it can help only delays the give-up.
 *
 * Giving up is silent, deliberately. This is a11y behaviour on a component in
 * a library, so the failure the user experiences is the bug in #227 — nothing
 * is gained by also writing to their console, and the assertions that catch a
 * regression here are `side-panel-focus-capture.spec.ts` and the `play`
 * functions, which run where a maintainer is looking.
 */
const RETRY_FRAMES = 24;

/**
 * Focus `target`, read back whether it took, and try again next frame if it
 * did not.
 *
 * Recursive rather than a loop because each attempt has to wait for a frame,
 * and `framesLeft` is what makes it terminate.
 */
function capture(
  isOpen: Signal<boolean>,
  target: () => HTMLElement | null | undefined,
  framesLeft: number
): void {
  // Re-read rather than trusting the edge: a surface opened and closed again
  // must not be focused after it has gone inert, which would fight the closing
  // component's focus restoration. Checked on EVERY attempt, not only the
  // first, because the retries outlive the frame that scheduled them.
  if (!isOpen()) {
    return;
  }

  const element = target();
  if (!element) {
    return;
  }

  element.focus();

  // `contains` rather than `===` so that a caller who focuses a control of
  // their own inside the panel — the first field of a form — is left alone
  // instead of being pulled back to the container on the next frame.
  const active = element.ownerDocument.activeElement;
  if (element === active || element.contains(active)) {
    return;
  }

  // `requestAnimationFrame` is absent in a non-browser platform, and the
  // give-up below is the right behaviour there rather than a crash.
  if (framesLeft <= 0 || typeof requestAnimationFrame !== 'function') {
    return;
  }

  requestAnimationFrame(() => capture(isOpen, target, framesLeft - 1));
}
