import { DestroyRef, effect, inject } from '@angular/core';
import type { Signal } from '@angular/core';

/**
 * The one place that decides WHEN a component whose open/close is animated by a
 * CSS transition may announce that the transition is over.
 *
 * WHY THIS EXISTS AT ALL
 * ----------------------
 * `transitionend` does not fire when no transition runs, and a transition that
 * is disabled still counts as "no transition". Every component here disables its
 * own under `@media (prefers-reduced-motion: reduce)` — `tn-side-panel` with
 * `transition-duration: 0ms`, `tn-drawer` with `transition: none` — so a
 * lifecycle output emitted from a `transitionend` handler alone never fires for
 * a user who asked for less motion. A consumer waiting on `(closed)` to release
 * a resource, refresh a list or return focus waits forever, and only for that
 * population (#218). Reduced motion is merely the reproducible cause: a panel
 * inside a `display: none` ancestor, or a caller's own stylesheet override, ends
 * up in the same place.
 *
 * So the event is treated as an OPTIMISATION rather than as the trigger. Every
 * state change arms a timer; a real `transitionend` disarms it and reports early.
 * Exactly one of the two reports, per change, whichever arrives first.
 *
 * WHY A SHARED FUNCTION AND NOT A COPY PER COMPONENT
 * -------------------------------------------------
 * The same reasoning as `../a11y/accessible-name.ts`, and the same evidence.
 * `tn-side-panel` and `tn-drawer` reached #218 with identical bugs because the
 * second was written from the first — and #214 then fixed focus restoration in
 * both, separately, in prose that had to be kept in step by hand. What is subtle
 * here is not the timer but the three cases around it: an interrupted change, a
 * late event after the fallback already reported, and the initial state, which
 * has not transitioned into anything and must stay silent. A second copy of
 * those is a second chance to get one of them wrong, and two copies cannot
 * disagree loudly.
 *
 * Not exported from `public-api.ts`, and must not be — it is how this library's
 * own components agree with each other, not API. A consumer wanting the same
 * guarantee has `(closed)`, which is the point.
 */

/**
 * How long to wait for `transitionend` before concluding it is not coming.
 *
 * COUPLED TO THE STYLESHEETS: it must outlast the longest transition either
 * component animates, which is `transform 0.3s` in `drawer.component.scss` and
 * `transform 300ms` in `side-panel.component.scss`. Lengthening one of those
 * past this value is what breaks the coupling, and the symptom is mild — the
 * fallback reports first and the real event is ignored as late, so the output
 * still fires exactly once, just before the animation is quite finished.
 *
 * The margin is for the ordinary case of a browser firing `transitionend` a
 * frame or two after the nominal duration, under load. It is not a budget for a
 * longer animation.
 *
 * Exported so specs advance the clock by name rather than by a copied literal.
 */
export const TN_TRANSITION_FALLBACK_MS = 400;

/** What `tnTransitionLifecycle` gives back to its caller. */
export interface TnTransitionLifecycle {
  /**
   * Call from the component's `(transitionend)` handler, once it has filtered
   * the event down to the one property whose end means the panel has arrived.
   *
   * A no-op unless a change is still awaiting its report, so a late event after
   * the fallback already fired — and any second `transitionend` for the same
   * change — is dropped rather than emitted twice.
   */
  transitionEnded(): void;
}

/**
 * Report each settled open/close exactly once, whether or not a transition runs.
 *
 * **Must be called from an injection context** — a field initializer or the
 * constructor — because it registers an `effect` and takes a `DestroyRef` to
 * cancel a timer that would otherwise emit from a destroyed component.
 *
 * @param state The animated state: the component's `open` / `opened` model.
 * @param settled Called once per settled change, with the state settled into.
 */
export function tnTransitionLifecycle(
  state: Signal<boolean>,
  settled: (state: boolean) => void
): TnTransitionLifecycle {
  const destroyRef = inject(DestroyRef);

  /**
   * The state a change is waiting to report, or `null` when nothing is pending.
   *
   * Both reporters clear it before calling `settled`, which is what makes the
   * fallback and a late `transitionend` mutually exclusive rather than additive.
   */
  let pending: boolean | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  function disarm(): void {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function report(): void {
    if (pending === null) {
      return;
    }
    const settledState = pending;
    pending = null;
    disarm();
    settled(settledState);
  }

  // The initial state is not a change: nothing transitioned into it, so a panel
  // that renders closed and stays closed must emit no `closed`. `previous`
  // starts at the state's own first value rather than at a sentinel so that
  // there is one rule here and not two.
  let previous = state();

  effect(() => {
    const current = state();
    if (current === previous) {
      return;
    }
    previous = current;

    // A change while one is already pending REPLACES it, and the superseded one
    // is never reported. That is what the browser does with the transition
    // itself: reversing mid-flight starts a new one and the interrupted one
    // fires no `transitionend`, so a panel closed before it finished opening
    // has not, at any point, finished opening.
    disarm();
    pending = current;
    timer = setTimeout(report, TN_TRANSITION_FALLBACK_MS);
  });

  destroyRef.onDestroy(disarm);

  return { transitionEnded: report };
}
