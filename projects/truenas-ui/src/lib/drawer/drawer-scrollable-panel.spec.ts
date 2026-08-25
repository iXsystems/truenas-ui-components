import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TnDrawerComponent } from './drawer.component';
import type { TnDrawerMode } from './drawer.component';
import { axeResult } from '../a11y/axe-testing';
import { TN_SCROLLABLE_REGION_TOLERANCE_PX } from '../a11y/scrollable-region';
import {
  MockResizeObserver,
  scrollingTo,
  staticScroller,
} from '../a11y/scrollable-region-testing';

/**
 * Guards the keyboard reachability of the drawer's scrolling panel (#270).
 *
 * WHAT THE DEFECT IS
 * ------------------
 * `.tn-drawer__panel` is `overflow-y: auto`, so whatever a caller projects into
 * a drawer scrolls in that element. It carried `tabindex="-1"` — a focus TARGET
 * for `tnFocusOnOpen` (#227), not a tab stop — and nothing else, so a drawer
 * holding only static content matched axe's `scrollable-region-focusable`: an
 * element that scrolls, is not in the tab order, and contains nothing that is.
 * The part below the fold was then unreachable from a keyboard.
 *
 * This is the same defect #248 fixed on `tn-side-panel`, reached for the fourth
 * time by a component written from it — the pattern `initial-focus.ts` records
 * for #214, #218 and #227. The measurement is shared now
 * (`../a11y/scrollable-region.ts`); what this file guards is that THIS
 * component is wired to it and marks the right element.
 *
 * WHY ONLY `tabindex` MOVES
 * -------------------------
 * Unlike the side panel's bare `<section>`, this element already carries a role
 * and a name in both modes — a named `role="dialog"` or `role="navigation"`.
 * Adding `role="group"` would replace the model the drawer declares with a
 * description of its scrollbar, so the fix here is the tab stop and nothing
 * else, and `keeps the panel's own role and name` below is what holds that.
 */

@Component({
  selector: 'tn-drawer-scroll-host',
  standalone: true,
  imports: [TnDrawerComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <button type="button" id="trigger" (click)="opened.set(true)">Open</button>
    <tn-drawer ariaLabel="Navigation" [mode]="mode()" [(opened)]="opened">
      <p>Drawer body</p>
      @if (extra()) {
        <p id="extra">More body than fits</p>
      }
    </tn-drawer>
  `,
})
class DrawerScrollHostComponent {
  mode = signal<TnDrawerMode>('over');
  opened = signal(false);
  /** Projects another paragraph, which is a content mutation the panel re-measures on. */
  extra = signal(false);
}

describe('tn-drawer scrolling panel (#270)', () => {
  let fixture: ComponentFixture<DrawerScrollHostComponent>;
  let host: DrawerScrollHostComponent;
  let restoreResizeObserver: () => void;

  /** The visible height every case here measures against. */
  const PANEL_HEIGHT = 200;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawerScrollHostComponent],
    }).compileComponents();

    restoreResizeObserver = MockResizeObserver.install();

    fixture = TestBed.createComponent(DrawerScrollHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // The over-mode overlay is portaled to document.body and only removed on
    // destroy, so without this every later fixture scans the previous one's
    // panel too.
    fixture.destroy();
    restoreResizeObserver();
  });

  /**
   * The panel, wherever it currently lives: inline in the host in `side` mode,
   * portaled to `<body>` in `over` mode. Asked of the document for that reason.
   */
  function panel(): HTMLElement {
    return document.querySelector('.tn-drawer__panel') as HTMLElement;
  }

  /** The element axe is pointed at as the scan root — the panel's own parent. */
  function scanRoot(): HTMLElement {
    return panel().parentElement as HTMLElement;
  }

  async function openDrawer(): Promise<void> {
    host.opened.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  /**
   * Change the projected content and let the drawer notice.
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
     * The positive control, built from static markup rather than from the
     * component, so that it keeps saying what axe does about an unfixed scroll
     * container after the component stops being one. Without it, every
     * `violated).toEqual([])` below would also pass if the rule stopped
     * matching altogether.
     *
     * `tabindex="-1"` is on it deliberately: that is what the panel carried
     * before this fix, and the point of the control is that `-1` does not
     * answer the rule. `focusable-element` checks whether the element is in the
     * TAB ORDER, which `-1` is not.
     */
    it('still reports a scroll container whose only tabindex is -1', async () => {
      const { root, region } = staticScroller(400, PANEL_HEIGHT);
      region.setAttribute('tabindex', '-1');
      region.setAttribute('role', 'dialog');
      region.setAttribute('aria-label', 'Navigation');

      try {
        const { violated } = await axeResult(root, region, ['scrollable-region-focusable']);
        expect(violated).toEqual(['scrollable-region-focusable']);
      } finally {
        root.remove();
      }
    });
  });

  describe('an over-mode drawer whose content overflows', () => {
    beforeEach(async () => {
      await openDrawer();
      scrollingTo(panel(), 400, PANEL_HEIGHT);
      await mutateContent(() => host.extra.set(true));
    });

    it('makes the panel a tab stop', () => {
      expect(panel().getAttribute('tabindex')).toBe('0');
    });

    it('keeps the panel\'s own role and name, and adds no group', () => {
      expect(panel().getAttribute('role')).toBe('dialog');
      expect(panel().getAttribute('aria-label')).toBe('Navigation');
    });

    it('raises no scrollable-region-focusable violation, and does evaluate the rule', async () => {
      const { violated, evaluated } = await axeResult(
        scanRoot(), panel(), ['scrollable-region-focusable']
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('scrollable-region-focusable');
    });

    it('gives the tab stop back when the content shrinks to fit', async () => {
      // Focus first, and off the panel. An `over` drawer opens with focus ON
      // its panel (`tnFocusOnOpen`, #227), and the tab stop is deliberately
      // held while the focused region has it — see the focus cases below. This
      // one is about the measurement, so it asks the question with nobody
      // standing on the answer.
      const trigger = fixture.nativeElement.querySelector('#trigger') as HTMLElement;
      trigger.focus();
      fixture.detectChanges();

      scrollingTo(panel(), PANEL_HEIGHT, PANEL_HEIGHT);
      await mutateContent(() => host.extra.set(false));

      // Back to the resting `-1`, not to no attribute at all: the panel is
      // still what `tnFocusOnOpen` moves focus to when a modal drawer opens,
      // and an element with no `tabindex` cannot be focused programmatically.
      expect(panel().getAttribute('tabindex')).toBe('-1');
    });
  });

  describe('a side-mode drawer', () => {
    /**
     * The defect is not modal-only. A `side` drawer is persistent navigation
     * with the same `overflow-y: auto` panel, and a long nav list is exactly
     * the content that overflows it.
     */
    it('marks the panel too', async () => {
      host.mode.set('side');
      await openDrawer();
      scrollingTo(panel(), 400, PANEL_HEIGHT);
      await mutateContent(() => host.extra.set(true));

      expect(panel().getAttribute('tabindex')).toBe('0');
      expect(panel().getAttribute('role')).toBe('navigation');
    });

    /**
     * The measurement has to follow the panel across a mode change, and this is
     * the case a helper bound once to one element would fail: `@if (mode() !==
     * 'over')` destroys the element it measured and builds another. A
     * responsive layout crossing its breakpoint does exactly this.
     */
    it('follows the panel when the mode changes under it', async () => {
      await openDrawer();
      scrollingTo(panel(), 400, PANEL_HEIGHT);
      await mutateContent(() => host.extra.set(true));
      expect(panel().getAttribute('tabindex')).toBe('0');

      host.mode.set('side');
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      // A different element, which has not been measured yet — so it starts at
      // the resting value rather than inheriting the old one's answer.
      expect(panel().getAttribute('tabindex')).toBe('-1');

      scrollingTo(panel(), 400, PANEL_HEIGHT);
      MockResizeObserver.emit();
      fixture.detectChanges();

      expect(panel().getAttribute('tabindex')).toBe('0');
    });
  });

  describe('a drawer whose content fits', () => {
    /**
     * The over-fix guard. Every drawer in this library renders this panel, so
     * an unconditional tab stop here is an extra stop in every one of them —
     * and one that reports nothing to axe either way, because the rule does not
     * match an element that does not scroll.
     */
    it('leaves the panel at its resting tabindex', async () => {
      await openDrawer();
      scrollingTo(panel(), PANEL_HEIGHT, PANEL_HEIGHT);
      await mutateContent(() => host.extra.set(true));

      expect(panel().getAttribute('tabindex')).toBe('-1');
    });

    /**
     * The tolerance, from both sides of it. `scrollHeight` and `clientHeight`
     * are integers rounded from fractional layout, so a panel whose content
     * fits can read as overflowing by a pixel — and axe would not call that a
     * scroll container either, because its own matcher ignores an overflow
     * below 13px.
     */
    it('starts marking exactly where axe starts reporting', async () => {
      await openDrawer();
      scrollingTo(panel(), PANEL_HEIGHT + TN_SCROLLABLE_REGION_TOLERANCE_PX, PANEL_HEIGHT);
      await mutateContent(() => host.extra.set(true));

      expect(panel().getAttribute('tabindex')).toBe('-1');

      scrollingTo(panel(), PANEL_HEIGHT + TN_SCROLLABLE_REGION_TOLERANCE_PX + 1, PANEL_HEIGHT);
      await mutateContent(() => host.extra.set(false));

      expect(panel().getAttribute('tabindex')).toBe('0');
    });
  });

  describe('when the content stops overflowing UNDER a keyboard user', () => {
    /**
     * The failure the fix can cause, rather than the one it fixes — the same
     * one `side-panel-scrollable-content.spec.ts` guards, asserted here because
     * this component reaches it through a different attribute.
     *
     * On this element the browser consequence is milder than the side panel's:
     * `0` falls back to `-1` rather than to nothing, and `-1` is still
     * focusable, so focus is not dropped to `<body>`. What is asserted is the
     * condition either way, because the rule lives in the shared helper and a
     * caller that stopped honouring it would silently stop honouring it for the
     * side panel's `<section>` too.
     */
    beforeEach(async () => {
      await openDrawer();
      scrollingTo(panel(), 400, PANEL_HEIGHT);
      await mutateContent(() => host.extra.set(true));

      panel().focus();
      fixture.detectChanges();
      expect(document.activeElement).toBe(panel());
    });

    it('keeps the tab stop while the panel holds focus', async () => {
      scrollingTo(panel(), PANEL_HEIGHT, PANEL_HEIGHT);
      await mutateContent(() => host.extra.set(false));

      expect(panel().getAttribute('tabindex')).toBe('0');
      expect(document.activeElement).toBe(panel());
    });

    /**
     * The other direction, and the one this component is the reason for: focus
     * RETAINS a tab stop, it does not grant one.
     *
     * An `over` drawer opens with focus on its panel, so a helper reading
     * "overflowing OR focused" made every modal drawer a tab stop the moment it
     * opened, whether or not anything scrolled. `leaves the panel at its
     * resting tabindex` above is the same guard on the ordinary path; this one
     * says it about a panel that is demonstrably focused.
     */
    it('does not grant a tab stop to a fitting panel that has focus', async () => {
      scrollingTo(panel(), PANEL_HEIGHT, PANEL_HEIGHT);
      await mutateContent(() => host.extra.set(false));

      const trigger = fixture.nativeElement.querySelector('#trigger') as HTMLElement;
      trigger.focus();
      fixture.detectChanges();
      panel().focus();
      fixture.detectChanges();

      expect(document.activeElement).toBe(panel());
      expect(panel().getAttribute('tabindex')).toBe('-1');
    });

    it('gives it up once focus leaves of its own accord', async () => {
      scrollingTo(panel(), PANEL_HEIGHT, PANEL_HEIGHT);
      await mutateContent(() => host.extra.set(false));

      const trigger = fixture.nativeElement.querySelector('#trigger') as HTMLElement;
      trigger.focus();
      fixture.detectChanges();

      expect(document.activeElement).toBe(trigger);
      expect(panel().getAttribute('tabindex')).toBe('-1');
    });
  });

  describe('what the measurement follows', () => {
    /**
     * The box-changed direction: the drawer narrows, the same content reflows
     * taller, and NOTHING about the DOM changed. That is a `ResizeObserver`
     * callback and no mutation record at all.
     */
    it('re-measures when the panel resizes, with no DOM mutation', async () => {
      await openDrawer();
      expect(MockResizeObserver.targets()).toContain(panel());
      expect(panel().getAttribute('tabindex')).toBe('-1');

      scrollingTo(panel(), 400, PANEL_HEIGHT);
      MockResizeObserver.emit();
      fixture.detectChanges();

      expect(panel().getAttribute('tabindex')).toBe('0');
    });

    /**
     * The child-resized direction, which a `MutationObserver` cannot see: an
     * image finishing loading or a webfont swapping in changes how tall a child
     * is and produces no mutation record. The registration is the assertion —
     * the mock fires every observer it holds, so a callback alone would look
     * identical if only the panel were watched.
     */
    it('watches the panel\'s direct children too', async () => {
      await openDrawer();
      await mutateContent(() => host.extra.set(true));

      const child = panel().querySelector('#extra') as HTMLElement;
      expect(MockResizeObserver.targets()).toContain(child);
    });
  });
});
