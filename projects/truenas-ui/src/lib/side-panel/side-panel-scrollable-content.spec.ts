import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TN_SIDE_PANEL_CONTENT_LABEL, TnSidePanelComponent } from './side-panel.component';
import { axeResult } from '../a11y/axe-testing';

/**
 * Guards the keyboard reachability of the panel's scrolling content region
 * (#248).
 *
 * WHAT WAS REPORTED
 * -----------------
 * `Components/Side Panel > Default` failed axe's `scrollable-region-focusable`
 * on `<section class="tn-side-panel__content">`: the element scrolls, is not
 * focusable, and is only guaranteed to contain something focusable if the
 * caller happened to project a control into it. A keyboard-only user opening a
 * panel whose content overflows cannot reach the part below the fold.
 *
 * The panel container's `tabindex="-1"` (#227) does not help. It is what focus
 * is MOVED to on open; `-1` is not a tab stop and, more to the point, the
 * element that scrolls is the `<section>` inside it, not the container.
 *
 * HOW THE OVERFLOW IS REPRODUCED HERE
 * -----------------------------------
 * jsdom has no layout engine, so `scrollHeight` and `clientHeight` are `0` on
 * every element and no component in this library can overflow under jest by
 * itself. `scrollingTo()` below stubs those two readings on the real element
 * and sets `overflow-y` inline — the two facts axe's `getScroll` reads, and the
 * two the component reads. The stylesheet already sets `overflow-y: auto` on
 * this class in a browser; jest does not compile the component's SCSS, so the
 * inline declaration stands in for it.
 *
 * That makes these tests a reproduction of the RULE, not of the rendering: they
 * prove axe reports the defect on this markup and stops reporting it on the
 * fixed markup. Whether the story's content overflows at 480px wide is a
 * question only `yarn test-sb` can answer, and it cannot run on the machine
 * these cycles work on — see the pull request.
 *
 * WHY THE FIX IS CONDITIONAL
 * --------------------------
 * A permanent `tabindex="0"` would clear the rule everywhere and put a tab stop
 * in every panel, including the ones that fit — a stop that announces a group
 * and does nothing, on the commonest shape of panel there is. So the attribute
 * follows the measurement, and `does not make a panel that fits keyboard
 * focusable` is the half of this file that guards against over-fixing.
 */

@Component({
  selector: 'tn-side-panel-scroll-host',
  standalone: true,
  imports: [TnSidePanelComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <button type="button" id="trigger" (click)="open.set(true)">Open</button>
    <tn-side-panel title="Edit dataset" [(open)]="open">
      <p>Panel body</p>
      @if (extra()) {
        <p id="extra">More body than fits</p>
      }
      @if (control()) {
        <button type="button" id="inside">Inside</button>
      }
    </tn-side-panel>
  `,
})
class SidePanelScrollHostComponent {
  open = signal(false);
  /** Projects another paragraph, which is a content mutation the panel re-measures on. */
  extra = signal(false);
  /** Projects a focusable control, which satisfies the rule by the other route. */
  control = signal(false);
}

/**
 * Stand-in for `ResizeObserver`, which jsdom does not implement — so the half
 * of the measurement that reacts to a BOX change has no callback path here
 * without one.
 *
 * Declared locally rather than reached for from `TnTableTesting`: that one is
 * public API shaped around `tn-table`'s container width (`emitContainerWidth`),
 * and this component reads neither the entries nor a width. The same choice
 * `tree-virtual-scroll-view.component.spec.ts` made, for the same reason.
 */
class MockResizeObserver {
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
   * The entries are empty because the component reads none: it re-measures the
   * region itself whatever resized, which is the only answer that is right when
   * what resized was a child.
   */
  static emit(): void {
    MockResizeObserver.instances.forEach(
      (observer) => observer.cb([], observer as unknown as ResizeObserver)
    );
  }
}

describe('tn-side-panel scrolling content region (#248)', () => {
  let fixture: ComponentFixture<SidePanelScrollHostComponent>;
  let host: SidePanelScrollHostComponent;
  let originalResizeObserver: typeof ResizeObserver;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidePanelScrollHostComponent],
    }).compileComponents();

    // Installed before the fixture, because the component feature-detects
    // `ResizeObserver` once, when it starts watching. Its `observe` is a no-op,
    // so the tests that drive the mutation path are unaffected by it being here.
    originalResizeObserver = globalThis.ResizeObserver;
    MockResizeObserver.instances = [];
    globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

    fixture = TestBed.createComponent(SidePanelScrollHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // The overlay is portaled to document.body and only removed on destroy, so
    // without this every later fixture scans the previous one's panel too.
    fixture.destroy();
    globalThis.ResizeObserver = originalResizeObserver;
  });

  /** The overlay is in `document.body`, not in the fixture — it is portaled there. */
  function overlay(): HTMLElement {
    return document.body.querySelector('.tn-side-panel__overlay') as HTMLElement;
  }

  function content(): HTMLElement {
    return overlay().querySelector('.tn-side-panel__content') as HTMLElement;
  }

  function panel(): HTMLElement {
    return overlay().querySelector('.tn-side-panel__panel') as HTMLElement;
  }

  /** The visible height every case here measures against. */
  const REGION_HEIGHT = 200;

  /**
   * Make `el` read as a scrolling element whose content is `scrollHeight` tall.
   *
   * The heights are given rather than derived from a boolean because the
   * threshold is what two of these tests are about: axe matches the rule
   * through `getScroll(node, 13)` and the component measures against the same
   * 13px, so `208` and `400` are on opposite sides of a line that a
   * true/false argument would hide.
   */
  function scrollingTo(el: HTMLElement, scrollHeight: number): void {
    el.style.overflowY = 'auto';
    Object.defineProperty(el, 'scrollHeight', { value: scrollHeight, configurable: true });
    Object.defineProperty(el, 'clientHeight', { value: REGION_HEIGHT, configurable: true });
  }

  /**
   * Open, then let the render settle, which is what runs the `afterNextRender`
   * the panel takes its first measurement in.
   */
  async function openPanel(): Promise<void> {
    host.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  /**
   * Change the projected content and let the panel notice.
   *
   * A `MutationObserver` callback is delivered on a microtask, so the wait is
   * what makes this the production path rather than a direct call into the
   * component: the spec mutates the DOM exactly as a caller's own template
   * would, and reads back what the component did about it.
   */
  async function mutateContent(mutate: () => void): Promise<void> {
    mutate();
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();
  }

  describe('what the reported defect looks like on this markup', () => {
    /**
     * The reproduction. `scrollable-region-focusable` matches an element that
     * scrolls and holds content, and fails it unless the element itself is
     * focusable or something inside it is — so the pre-fix `<section>`, with a
     * paragraph in it and no tab stop anywhere, is exactly the shape it reports.
     *
     * Built from static markup rather than from the component, so that it keeps
     * saying what axe does about an unfixed scroll container after the
     * component stops being one. Without it, every `violated).toEqual([])`
     * below would also pass if the rule stopped matching altogether.
     */
    it('still reports a scroll container that nothing can focus', async () => {
      const previous = document.createElement('div');
      previous.innerHTML = '<section class="scroller"><p>Panel body</p></section>';
      document.body.appendChild(previous);
      const section = previous.querySelector('.scroller') as HTMLElement;
      scrollingTo(section, 400);

      try {
        const { violated } = await axeResult(
          previous, section, ['scrollable-region-focusable']
        );
        expect(violated).toEqual(['scrollable-region-focusable']);
      } finally {
        previous.remove();
      }
    });
  });

  describe('a panel whose content overflows', () => {
    beforeEach(async () => {
      await openPanel();
      scrollingTo(content(), 400);
      await mutateContent(() => host.extra.set(true));
    });

    it('makes the scrolling region a tab stop', () => {
      expect(content().getAttribute('tabindex')).toBe('0');
    });

    it('names the region, so it is not announced as an unlabelled group', () => {
      expect(content().getAttribute('role')).toBe('group');
      expect(content().getAttribute('aria-label')).toBe(TN_SIDE_PANEL_CONTENT_LABEL);
    });

    it('raises no scrollable-region-focusable violation, and does evaluate the rule', async () => {
      const { violated, evaluated } = await axeResult(
        overlay(), content(), ['scrollable-region-focusable']
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('scrollable-region-focusable');
    });

    it('puts no disallowed ARIA on the region it just named', async () => {
      const { violated } = await axeResult(
        overlay(), content(), ['aria-allowed-role', 'aria-allowed-attr', 'aria-valid-attr-value']
      );

      expect(violated).toEqual([]);
    });

    it('gives the region back when the content shrinks to fit', async () => {
      scrollingTo(content(), REGION_HEIGHT);
      await mutateContent(() => host.extra.set(false));

      expect(content().getAttribute('tabindex')).toBeNull();
      expect(content().getAttribute('role')).toBeNull();
      expect(content().getAttribute('aria-label')).toBeNull();
    });
  });

  describe('a panel whose content fits', () => {
    /**
     * The over-fix guard. Every panel in this library renders this `<section>`,
     * so an unconditional attribute here is an extra tab stop on every panel
     * that has ever been opened — and one that reports nothing to axe either
     * way, because the rule does not match an element that does not scroll.
     */
    it('does not make the scrolling region a tab stop', async () => {
      await openPanel();
      scrollingTo(content(), REGION_HEIGHT);
      await mutateContent(() => host.extra.set(true));

      expect(content().getAttribute('tabindex')).toBeNull();
      expect(content().getAttribute('role')).toBeNull();
      expect(content().getAttribute('aria-label')).toBeNull();
    });

    /**
     * The tolerance, from both sides of it.
     *
     * `scrollHeight` and `clientHeight` are integers rounded from fractional
     * layout, so a region whose content fits can read as overflowing by a pixel
     * — and axe would not call that a scroll container either, because its own
     * matcher ignores an overflow below 13px. A tab stop the rule cannot see is
     * a tab stop nothing would ever have asked for.
     */
    it('ignores an overflow smaller than the one axe matches on', async () => {
      await openPanel();
      scrollingTo(content(), REGION_HEIGHT + 8);
      await mutateContent(() => host.extra.set(true));

      expect(content().getAttribute('tabindex')).toBeNull();

      // The same region, past the threshold, to show the assertion above is
      // about the size of the overflow and not about the wiring.
      scrollingTo(content(), REGION_HEIGHT + 40);
      await mutateContent(() => host.extra.set(false));

      expect(content().getAttribute('tabindex')).toBe('0');
    });
  });

  describe('what the measurement follows', () => {
    /**
     * The box-changed direction: the panel narrows, the same content reflows
     * taller, and NOTHING about the DOM changed. That is a `ResizeObserver`
     * callback and no mutation record at all, so this is the only path in the
     * file that does not go through `mutateContent`.
     */
    it('re-measures when the region resizes, with no DOM mutation', async () => {
      await openPanel();
      expect(MockResizeObserver.targets()).toContain(content());
      expect(content().getAttribute('tabindex')).toBeNull();

      scrollingTo(content(), 400);
      MockResizeObserver.emit();
      fixture.detectChanges();

      expect(content().getAttribute('tabindex')).toBe('0');
    });

    /**
     * The child-resized direction, which is the one a `MutationObserver` cannot
     * see: an image finishing loading or a webfont swapping in changes how tall
     * a child is and produces no mutation record. The component observes each
     * direct child for exactly this, so a resize reported against a child has
     * to re-measure the region — which is why the mock fires every observer it
     * holds rather than filtering by target.
     */
    it('re-measures when a child of the region resizes', async () => {
      await openPanel();
      await mutateContent(() => host.extra.set(true));
      expect(content().getAttribute('tabindex')).toBeNull();

      // The registration is the assertion. The mock fires every observer it
      // holds, so the callback alone would look identical if the component
      // watched only the region — and a child that grows would never have
      // produced one.
      const child = content().querySelector('#extra') as HTMLElement;
      expect(MockResizeObserver.targets()).toContain(child);

      scrollingTo(content(), 400);
      MockResizeObserver.emit();
      fixture.detectChanges();

      expect(content().getAttribute('tabindex')).toBe('0');
    });
  });

  describe('the focus contract #227 established', () => {
    /**
     * Opening still lands on the panel CONTAINER, not on the new tab stop.
     * `tnFocusOnOpen` targets `.tn-side-panel__panel` and this change adds a
     * focusable element inside it — which is precisely the shape that would
     * make a "first tabbable" capture pick something else, and the reason #227
     * stopped using one.
     */
    it('still moves focus to the panel container on open', async () => {
      const trigger = fixture.nativeElement.querySelector('#trigger') as HTMLElement;
      trigger.focus();

      await openPanel();
      scrollingTo(content(), 400);
      await mutateContent(() => host.extra.set(true));

      expect(content().getAttribute('tabindex')).toBe('0');
      expect(document.activeElement).toBe(panel());
    });
  });
});
