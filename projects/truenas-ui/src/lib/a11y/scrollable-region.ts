import { DestroyRef, NgZone, effect, inject, signal, untracked } from '@angular/core';
import type { Signal } from '@angular/core';

/**
 * The one place that decides whether a scrolling region needs a tab stop, and
 * when it may give one back.
 *
 * WHY THIS EXISTS AT ALL
 * ----------------------
 * axe's `scrollable-region-focusable` fires on any element that scrolls, is not
 * itself in the tab order, and contains nothing that is — because content below
 * the fold of such a region is content a keyboard cannot reach. #248 fixed one
 * instance of it, `.tn-side-panel__content`, and the fix was not one line: a
 * measurement against axe's own 13px buffer, kept current by a `ResizeObserver`
 * on the region AND on its direct children, plus a `MutationObserver`, plus a
 * focus rule that decides when the tab stop may be REMOVED again.
 *
 * The same shape exists on four more elements in this library (#270). Copying
 * that into each of them is how the lenient copy gets made — the argument
 * `axe-testing.ts` sets out for its own existence, and the one
 * `initial-focus.ts` makes with evidence: `tn-drawer` was written from
 * `tn-side-panel` and the two have reached identical bugs three times (#214,
 * #218, #227).
 *
 * WHY A FUNCTION AND NOT A DIRECTIVE
 * ----------------------------------
 * The ticket allows either. A directive would have to own `tabindex`, `role`
 * and `aria-label` through host bindings, and two of the five callers already
 * bind those attributes in their own templates for reasons that have nothing to
 * do with scrolling — `tn-drawer`'s panel is a `role="dialog"` or a
 * `role="navigation"` with a name of its own, and a directive host binding on
 * the same attribute wins over the template binding and would clobber it with
 * `null`.
 *
 * So what is shared is the MEASUREMENT and the focus rule, which is the subtle
 * part; each component keeps its own attribute policy, which is the part that
 * legitimately differs. That is also the shape of every other helper in this
 * folder — `tnAccessibleName`, `tnFocusOnOpen` — and callers read as they do.
 *
 * WHAT EACH CALLER STILL DECIDES
 * ------------------------------
 * - **What the resting `tabindex` is.** `tn-side-panel`'s region has none;
 *   `tn-drawer`'s panel is `-1`, because it is also the element `tnFocusOnOpen`
 *   moves focus to.
 * - **Whether a role and a name are needed.** A region that is already a named
 *   `role="dialog"` needs neither; a bare `<section>` or a host element needs
 *   `role="group"` and a name, or it is announced as nothing at all.
 *
 * Not exported from `public-api.ts`, and must not be: it is how this library's
 * own components agree with each other, not API.
 */

/**
 * How far the content has to exceed the region before the region counts as
 * scrolling.
 *
 * This is axe's own number: `scrollable-region-focusable` matches through
 * `getScroll(node, 13)`, so it ignores an overflow smaller than this and would
 * not report a region that has one. Measuring with a bare `>` instead would put
 * a tab stop on regions the rule considers fine — and `scrollHeight` and
 * `clientHeight` are integers rounded from fractional layout, so content that
 * fits to within a pixel reads as overflowing by one.
 *
 * Matching the rule keeps the components and the check that judges them saying
 * the same thing about the same element. It is a property of the rule rather
 * than a knob, so no component takes it as an input — but it is exported,
 * because `side-panel-scrollable-content.spec.ts` pins it against axe's own
 * buffer from both sides, and a spec that recopied the literal would pin the
 * copy to itself.
 */
export const TN_SCROLLABLE_REGION_TOLERANCE_PX = 13;

/**
 * Whether `region` currently overflows on an axis it can actually scroll —
 * `getScroll(elm, 13)` in axe-core 4.10.3, reimplemented rather than imported
 * because `axe-core` is a devDependency and this runs in shipped code.
 *
 * BOTH HALVES MATTER, AND #248 ONLY HAD THE FIRST
 * ----------------------------------------------
 * The side panel measured `scrollHeight > clientHeight + 13` and stopped there,
 * which was right for it and is wrong in general. An element whose content is
 * wider than its box under `overflow-x: visible` does not scroll — the content
 * spills out and is on screen — and axe does not report it. A measurement that
 * skipped the style check would put a tab stop on `.tn-side-panel__content`
 * whenever a caller projected a wide `<pre>` into it, which is the over-fix the
 * tolerance exists to avoid, arriving by the other axis.
 *
 * `getComputedStyle` is feature-detected because this file is imported by
 * components that render under SSR, where it does not exist. Reading as "does
 * not scroll" is the safe answer there: nothing is focusable on a server, and
 * the first measurement in the browser happens in `afterNextRender`.
 */
function overflows(region: HTMLElement): boolean {
  const buffer = TN_SCROLLABLE_REGION_TOLERANCE_PX;
  const overflowX = region.scrollWidth > region.clientWidth + buffer;
  const overflowY = region.scrollHeight > region.clientHeight + buffer;

  if (!overflowX && !overflowY) {
    return false;
  }
  if (typeof getComputedStyle !== 'function') {
    return false;
  }

  const style = getComputedStyle(region);
  const scrolls = (value: string): boolean => value === 'auto' || value === 'scroll';

  return (overflowX && scrolls(style.overflowX)) || (overflowY && scrolls(style.overflowY));
}

/**
 * Track whether a scrolling region needs to carry a tab stop, and keep the
 * answer current.
 *
 * **Must be called from an injection context** — a field initializer or the
 * constructor — because it registers an `afterNextRender` and an `onDestroy`.
 *
 * The caller binds the returned signal to whatever attributes its own markup
 * needs; see the note above on what each caller still decides. Everything the
 * caller has to get right beyond that binding is in here.
 *
 * WHAT THE SIGNAL IS, AND WHY IT IS NOT SIMPLY THE MEASUREMENT
 * -----------------------------------------------------------
 * It is the measurement, **latched on by focus**: true while the region
 * overflows, and still true afterwards for as long as focus stays on a region
 * that was already reachable when focus arrived. Focus retains a tab stop; it
 * does not grant one — see the note on `reachable` at the end of this file for
 * the caller that proved the difference matters.
 *
 * Content can stop overflowing while the region is focused: a validation
 * message clears, an expander collapses, the panel widens. Dropping `tabindex`
 * at that moment removes the tab stop from THE ELEMENT THAT HAS FOCUS, and a
 * focused element that stops being focusable is blurred to `<body>` — so a
 * keyboard user reading a panel would find themselves outside it, with the next
 * Tab starting from the top of the page, because content they were not
 * interacting with got shorter. That is a worse failure than the one this fixes,
 * and it is caused by the fix.
 *
 * So focus holds the answer true until it leaves of its own accord. The `blur`
 * that clears it has already happened by the time Angular writes the attribute
 * away, so nothing is focused when the tab stop goes.
 *
 * A caller that keeps `role` and `aria-label` on the same signal keeps them for
 * the same reason: a focused group that loses its name mid-read is announced as
 * a bare "group" by the next thing said about it, which is the state the name
 * exists to prevent.
 *
 * @param region The element that scrolls, read from inside an `effect` — so
 *   pass a closure over a `viewChild`, not a captured element. Angular resolves
 *   view queries before the effects that read them, and re-runs this one if the
 *   query's answer changes. That is not a detail: `tn-drawer` renders its panel
 *   from one of two `@if` branches on `mode`, so a responsive layout crossing
 *   its breakpoint destroys the observed element and builds another, and a
 *   helper that had bound to the first would silently stop measuring anything.
 *   `undefined` — a query with nothing to answer with — is the resting state and
 *   is not an error.
 */
export function tnScrollableRegion(
  region: () => HTMLElement | null | undefined
): Signal<boolean> {
  const zone = inject(NgZone);
  const destroyRef = inject(DestroyRef);

  /**
   * Whether the region currently overflows. Measured, not derived: nothing
   * about a component's inputs says whether what a caller projected fits, and
   * the answer changes with the viewport and with the content itself.
   */
  const overflowing = signal(false);

  /**
   * Whether the region itself holds focus.
   *
   * Listened for on the element rather than bound in each caller's template,
   * because `focus` and `blur` do not bubble — so these report the region and
   * not anything projected into it, and getting that wrong is exactly the kind
   * of divergence a shared helper exists to prevent.
   */
  const focused = signal(false);

  let resize: ResizeObserver | undefined;
  let mutations: MutationObserver | undefined;

  /**
   * Read whether the region overflows, and record it.
   *
   * A layout read and nothing else, so it is safe to call from either observer:
   * the only write it makes is to a signal, and the attributes that follow are
   * written by Angular in its own pass rather than here. Setting the signal to
   * the value it already holds is a no-op, which is what most calls are.
   */
  const measure = (element: HTMLElement): void => {
    overflowing.set(overflows(element));
  };

  /**
   * Point the `ResizeObserver` at the region and at each of its direct
   * children, replacing whatever it was watching before.
   *
   * The children are the half that catches content growth no DOM mutation
   * announces — see `watch` below. They are re-read rather than tracked
   * incrementally because the set changes only when `childList` does, which is
   * the callback this runs in, and a region's content is a handful of elements
   * rather than a list.
   *
   * `disconnect` first: `observe` on an element already observed is a no-op, so
   * without it a child that was removed would keep its registration and keep
   * the observer alive.
   */
  const observeBoxes = (element: HTMLElement): void => {
    if (!resize) {
      return;
    }
    resize.disconnect();
    resize.observe(element);
    Array.from(element.children).forEach((child) => resize?.observe(child));
  };

  /**
   * Keep the measurement current, from the two directions it can go stale.
   *
   * A scroll container overflows when its content is bigger than its box, and
   * either half can change on its own — so both are watched, by the instrument
   * that can see them:
   *
   * - **The box.** A viewport resize, a narrower panel or a re-laid-out parent
   *   reflows the content.
   * - **The content.** A caller's form revealing a validation message changes
   *   `scrollHeight` while the region's own size stays exactly the same, so a
   *   `ResizeObserver` on the region alone never fires for it.
   *
   * `MutationObserver` catches the second only when the growth IS a DOM change.
   * Plenty of it is not: an image finishing loading, a webfont swapping in, a
   * class toggle opening an expander. What all of those DO change is the size of
   * the child that holds them, which is why the `ResizeObserver` is pointed at
   * the region's direct children as well as at the region. Layout propagates, so
   * a grandchild growing grows the child that contains it.
   *
   * `attributes` is therefore deliberately NOT observed. The class toggle above
   * arrives as a resize instead, and watching attributes would mean watching the
   * ones the caller writes from this very measurement — the measurement called
   * from its own result.
   *
   * Both observers are feature-detected, because neither exists during SSR and
   * `ResizeObserver` does not exist under jsdom — where the fallback is the
   * single reading taken when the region is attached, and a region that reads
   * as fitting is the safe answer either way.
   *
   * Outside the Angular zone, for the reason `initial-focus.ts` gives for its
   * retries: a projected form mutates on every keystroke, and a zone-patched
   * callback would be a change detection pass for each one. The signal notifies
   * Angular by itself when the answer actually changes.
   */
  const watch = (element: HTMLElement): void => {
    zone.runOutsideAngular(() => {
      if (typeof ResizeObserver !== 'undefined') {
        resize = new ResizeObserver(() => measure(element));
      }

      if (typeof MutationObserver !== 'undefined') {
        mutations = new MutationObserver(() => {
          // Which elements exist has just changed, so what is observed has to
          // change with it before the region is measured again.
          observeBoxes(element);
          measure(element);
        });
        mutations.observe(element, { childList: true, subtree: true, characterData: true });
      }

      observeBoxes(element);
    });
  };

  const onFocus = (): void => focused.set(true);
  const onBlur = (): void => focused.set(false);

  /**
   * The element everything above is currently bound to, so that a re-render
   * that replaces it is a rebind rather than a second set of observers on a
   * detached node.
   */
  let attached: HTMLElement | undefined;

  const detach = (): void => {
    resize?.disconnect();
    mutations?.disconnect();
    resize = undefined;
    mutations = undefined;

    attached?.removeEventListener('focus', onFocus);
    attached?.removeEventListener('blur', onBlur);
    attached = undefined;

    // The element that held focus has gone, and no `blur` is owed for it —
    // leaving this true would keep the caller's attributes on an element that
    // no longer exists, and put them straight back onto its replacement.
    focused.set(false);
    overflowing.set(false);
  };

  /**
   * Bind to whatever the query answers with, and rebind when that changes.
   *
   * An `effect` rather than `afterNextRender`, because the element is not
   * necessarily the same one for the life of the component — see the note on
   * `region`. Angular resolves view queries before running the effects that
   * read them, so the element is rendered by the time this sees it, and the
   * first `measure` here is the reading a platform without a `ResizeObserver`
   * has to live on.
   */
  effect(() => {
    const element = region() ?? undefined;
    if (element === attached) {
      return;
    }

    detach();
    if (!element) {
      return;
    }

    attached = element;
    element.addEventListener('focus', onFocus);
    element.addEventListener('blur', onBlur);

    measure(element);
    watch(element);
  });

  destroyRef.onDestroy(detach);

  /**
   * The answer the caller binds to: the measurement, plus the one thing that
   * keeps it true after the measurement goes false.
   *
   * NOT `overflowing() || focused()`, which is what this was until a caller
   * that focuses its own region proved it wrong. `tn-drawer` moves focus to the
   * panel when a modal drawer opens (`tnFocusOnOpen`, #227), so under that
   * reading every `over` drawer became a tab stop the moment it opened, whether
   * or not anything scrolled — the over-fix the tolerance exists to prevent,
   * arriving through the focus half instead.
   *
   * Focus RETAINS a tab stop; it does not grant one. So the state carried
   * across is the previous answer, and focus only holds it: a region that was
   * reachable when focus arrived stays reachable until focus leaves, and one
   * that was not stays not.
   *
   * An `effect` rather than a `computed` with a captured variable, because a
   * computed is lazy — it re-derives only when something reads it, so a growth
   * and a shrink that both happened between two reads would collapse into "not
   * overflowing, focused" and drop the tab stop out from under a keyboard user.
   * The latch has to see every transition, which means being eager.
   */
  const reachable = signal(false);
  effect(() => {
    const isOverflowing = overflowing();
    const hasFocus = focused();
    reachable.set(isOverflowing || (hasFocus && untracked(reachable)));
  });

  return reachable.asReadonly();
}
