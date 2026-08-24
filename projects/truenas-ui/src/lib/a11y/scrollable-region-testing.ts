/**
 * The two stand-ins every `scrollable-region-focusable` spec needs, so that no
 * copy of either can drift into being the lenient one.
 *
 * WHY A SPEC CANNOT SIMPLY MAKE SOMETHING OVERFLOW
 * -----------------------------------------------
 * jsdom has no layout engine, so `scrollHeight`, `clientHeight`, `scrollWidth`
 * and `clientWidth` are `0` on every element and no component in this library
 * can overflow under jest by itself. `scrollingTo` stubs the readings on a real
 * element and sets the matching `overflow` inline — which is what both axe's
 * `getScroll` and `tnScrollableRegion` read, and neither of them can tell the
 * stub from a browser.
 *
 * That makes these specs a reproduction of the RULE, not of the rendering: they
 * prove axe reports the defect on the unfixed markup and stops reporting it on
 * the fixed markup. Whether a given story's content actually overflows at its
 * rendered size is a question only `yarn test-sb` can answer.
 *
 * WHY THE INLINE `overflow` IS NOT OPTIONAL
 * -----------------------------------------
 * Both readers check it. `getScroll` returns nothing for an element whose
 * computed `overflow-x`/`overflow-y` on the overflowing axis is not `auto` or
 * `scroll`, because content that spills out of a `visible` box is on screen
 * rather than hidden below a fold. A spec that stubbed only the heights would
 * therefore assert against a rule that never matched — the vacuous green
 * `axe-testing.ts` exists to prevent, arriving through the fixture instead of
 * through the assertion. jest does not compile a component's SCSS, so the
 * inline declaration stands in for the stylesheet's.
 *
 * `side-panel-scrollable-content.spec.ts` keeps private copies of both of
 * these. That is deliberate: it is the guard #270 had to leave passing
 * unchanged while the measurement moved out from under it, and a spec that was
 * edited in the same commit as the thing it guards proves less.
 *
 * Not exported from `public-api.ts`, and must not be — the same rule as
 * `axe-testing.ts`.
 */

/** Which axis a region is being made to scroll on. */
export type TnScrollAxis = 'vertical' | 'horizontal';

/**
 * Make `el` read as a scrolling element whose content is `scrollSize` long on
 * `axis`, in a box of `clientSize`.
 *
 * The sizes are given rather than derived from a boolean because the threshold
 * is what several of these specs are about: axe matches through
 * `getScroll(node, 13)` and `tnScrollableRegion` measures against the same 13px,
 * so two sizes 14 apart and two sizes 13 apart are on opposite sides of a line a
 * true/false argument would hide.
 */
export function scrollingTo(
  el: HTMLElement,
  scrollSize: number,
  clientSize: number,
  axis: TnScrollAxis = 'vertical',
): void {
  const [scrollProp, clientProp] = axis === 'vertical'
    ? ['scrollHeight', 'clientHeight']
    : ['scrollWidth', 'clientWidth'];

  if (axis === 'vertical') {
    el.style.overflowY = 'auto';
  } else {
    el.style.overflowX = 'auto';
  }

  Object.defineProperty(el, scrollProp, { value: scrollSize, configurable: true });
  Object.defineProperty(el, clientProp, { value: clientSize, configurable: true });
}

/**
 * Stand-in for `ResizeObserver`, which jsdom does not implement — so the half
 * of the measurement that reacts to a BOX change has no callback path without
 * one.
 *
 * Declared here rather than reached for from `TnTableTesting`: that one is
 * public API shaped around `tn-table`'s container width
 * (`emitContainerWidth`), and none of these regions read either the entries or
 * a width.
 */
export class MockResizeObserver {
  static instances: MockResizeObserver[] = [];

  /**
   * What this observer is currently watching, which is the half of the fix a
   * callback cannot show: firing the callback proves the component re-measures,
   * not that a resize of a CHILD would ever have reached it.
   */
  observed: Element[] = [];

  constructor(private cb: ResizeObserverCallback) {
    MockResizeObserver.instances.push(this);
  }

  observe(target: Element): void {
    this.observed.push(target);
  }

  unobserve(target: Element): void {
    this.observed = this.observed.filter((element) => element !== target);
  }

  disconnect(): void {
    this.observed = [];
  }

  /** Everything every registered observer is watching. */
  static targets(): Element[] {
    return MockResizeObserver.instances.flatMap((observer) => observer.observed);
  }

  /**
   * Fire every registered observer, as a resize of something it watches.
   *
   * The entries are empty because nothing reads them: the helper re-measures
   * the region itself whatever resized, which is the only answer that is right
   * when what resized was a child.
   */
  static emit(): void {
    MockResizeObserver.instances.forEach(
      (observer) => observer.cb([], observer as unknown as ResizeObserver)
    );
  }

  /**
   * Install the mock and hand back the teardown, so a spec's `beforeEach` and
   * `afterEach` cannot disagree about which one they are restoring.
   *
   * Must run BEFORE the fixture is created: `tnScrollableRegion`
   * feature-detects `ResizeObserver` once, when it binds to the region.
   */
  static install(): () => void {
    const original = globalThis.ResizeObserver;
    MockResizeObserver.instances = [];
    globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
    return () => {
      globalThis.ResizeObserver = original;
      MockResizeObserver.instances = [];
    };
  }
}

/**
 * A detached-then-attached scroll container with content and no tab stop —
 * the shape axe reports, built from static markup.
 *
 * Every spec that asserts `violated).toEqual([])` on a fixed component needs
 * one of these beside it, or the assertion would also pass if the rule stopped
 * matching altogether. Returns the root to remove and the element to name as
 * the target.
 */
export function staticScroller(
  scrollSize: number,
  clientSize: number,
  axis: TnScrollAxis = 'vertical',
): { root: HTMLElement; region: HTMLElement } {
  const root = document.createElement('div');
  root.innerHTML = '<section class="scroller"><p>Region body</p></section>';
  document.body.appendChild(root);

  const region = root.querySelector('.scroller') as HTMLElement;
  scrollingTo(region, scrollSize, clientSize, axis);
  return { root, region };
}
