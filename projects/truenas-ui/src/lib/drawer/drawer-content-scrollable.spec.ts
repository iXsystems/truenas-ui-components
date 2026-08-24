import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TN_DRAWER_CONTENT_LABEL, TnDrawerContentComponent } from './drawer-content.component';
import { axeResult } from '../a11y/axe-testing';
import { TN_SCROLLABLE_REGION_TOLERANCE_PX } from '../a11y/scrollable-region';
import {
  MockResizeObserver,
  scrollingTo,
  staticScroller,
} from '../a11y/scrollable-region-testing';

/**
 * Guards the keyboard reachability of the page content beside a drawer (#270).
 *
 * WHAT THE DEFECT IS
 * ------------------
 * `tn-drawer-content`'s host is `overflow: auto` and its whole template is
 * `<ng-content />`, so this is the element an application's page scrolls in.
 * It carried no `tabindex` and no role, and an application whose page holds no
 * tabbable control — a dashboard of read-only cards, a log view — matched axe's
 * `scrollable-region-focusable` exactly: an element that scrolls, is not in the
 * tab order, and contains nothing that is.
 *
 * The stakes are higher here than on the drawer's own panel, because the
 * content below this fold is most of a page rather than the rest of a menu.
 *
 * WHAT IT IS NOT ALLOWED TO BECOME
 * --------------------------------
 * A landmark. `drawer-container.component.ts` sets out why `role="main"`
 * belongs to the application and not to this library, and `names the region
 * without claiming the page's main landmark` below is what keeps the fix from
 * quietly taking it.
 */

@Component({
  selector: 'tn-drawer-content-scroll-host',
  standalone: true,
  imports: [TnDrawerContentComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <button type="button" id="trigger">Elsewhere</button>
    <tn-drawer-content [ariaLabel]="label()">
      <p>Page body</p>
      @if (extra()) {
        <p id="extra">More body than fits</p>
      }
    </tn-drawer-content>
  `,
})
class DrawerContentScrollHostComponent {
  extra = signal(false);
  label = signal(TN_DRAWER_CONTENT_LABEL);
}

describe('tn-drawer-content scrolling region (#270)', () => {
  let fixture: ComponentFixture<DrawerContentScrollHostComponent>;
  let host: DrawerContentScrollHostComponent;
  let restoreResizeObserver: () => void;

  /** The visible height every case here measures against. */
  const REGION_HEIGHT = 200;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawerContentScrollHostComponent],
    }).compileComponents();

    restoreResizeObserver = MockResizeObserver.install();

    fixture = TestBed.createComponent(DrawerContentScrollHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    restoreResizeObserver();
  });

  function region(): HTMLElement {
    return fixture.nativeElement.querySelector('tn-drawer-content') as HTMLElement;
  }

  async function mutateContent(mutate: () => void): Promise<void> {
    mutate();
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();
  }

  describe('what the reported defect looks like on this markup', () => {
    /**
     * The positive control. Built from static markup so it keeps saying what
     * axe does about an unfixed scroll container after this component stops
     * being one — without it, every `violated).toEqual([])` below would also
     * pass if the rule stopped matching altogether.
     */
    it('still reports a scroll container that nothing can focus', async () => {
      const { root, region: scroller } = staticScroller(400, REGION_HEIGHT);

      try {
        const { violated } = await axeResult(root, scroller, ['scrollable-region-focusable']);
        expect(violated).toEqual(['scrollable-region-focusable']);
      } finally {
        root.remove();
      }
    });
  });

  describe('a page whose content overflows', () => {
    beforeEach(async () => {
      scrollingTo(region(), 400, REGION_HEIGHT);
      await mutateContent(() => host.extra.set(true));
    });

    it('makes the region a tab stop', () => {
      expect(region().getAttribute('tabindex')).toBe('0');
    });

    it('names the region without claiming the page\'s main landmark', () => {
      expect(region().getAttribute('role')).toBe('group');
      expect(region().getAttribute('aria-label')).toBe(TN_DRAWER_CONTENT_LABEL);
    });

    it('lets a consumer say what the region holds', async () => {
      await mutateContent(() => host.label.set('Pool details'));
      expect(region().getAttribute('aria-label')).toBe('Pool details');
    });

    it('raises no scrollable-region-focusable violation, and does evaluate the rule', async () => {
      const { violated, evaluated } = await axeResult(
        fixture.nativeElement, region(), ['scrollable-region-focusable']
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('scrollable-region-focusable');
    });

    it('puts no disallowed ARIA on the region it just named', async () => {
      const { violated } = await axeResult(
        fixture.nativeElement,
        region(),
        ['aria-allowed-role', 'aria-allowed-attr', 'aria-valid-attr-value'],
      );

      expect(violated).toEqual([]);
    });

    it('gives the region back when the content shrinks to fit', async () => {
      scrollingTo(region(), REGION_HEIGHT, REGION_HEIGHT);
      await mutateContent(() => host.extra.set(false));

      expect(region().getAttribute('tabindex')).toBeNull();
      expect(region().getAttribute('role')).toBeNull();
      expect(region().getAttribute('aria-label')).toBeNull();
    });
  });

  describe('a page whose content fits', () => {
    /**
     * The over-fix guard. Every application that uses a drawer renders this
     * element, so an unconditional tab stop here is an extra stop on every page
     * in the product — and one that reports nothing to axe either way, because
     * the rule does not match an element that does not scroll.
     */
    it('leaves the region unmarked', async () => {
      scrollingTo(region(), REGION_HEIGHT, REGION_HEIGHT);
      await mutateContent(() => host.extra.set(true));

      expect(region().getAttribute('tabindex')).toBeNull();
      expect(region().getAttribute('role')).toBeNull();
      expect(region().getAttribute('aria-label')).toBeNull();
    });

    /** The tolerance, from both sides of the line axe draws. */
    it('starts marking exactly where axe starts reporting', async () => {
      scrollingTo(region(), REGION_HEIGHT + TN_SCROLLABLE_REGION_TOLERANCE_PX, REGION_HEIGHT);
      await mutateContent(() => host.extra.set(true));

      expect(region().getAttribute('tabindex')).toBeNull();

      scrollingTo(region(), REGION_HEIGHT + TN_SCROLLABLE_REGION_TOLERANCE_PX + 1, REGION_HEIGHT);
      await mutateContent(() => host.extra.set(false));

      expect(region().getAttribute('tabindex')).toBe('0');
    });
  });

  describe('when the content stops overflowing UNDER a keyboard user', () => {
    /**
     * Taking `tabindex` off an element that currently has focus makes the
     * browser blur it to `<body>`. On this element that means a keyboard user
     * reading a page is dropped to the top of the document because something
     * they were not interacting with got shorter. jsdom does not implement that
     * behaviour, so what is asserted is the CONDITION — the attributes are
     * never taken off while the region holds focus.
     */
    it('keeps the tab stop and the name while the region holds focus', async () => {
      scrollingTo(region(), 400, REGION_HEIGHT);
      await mutateContent(() => host.extra.set(true));

      region().focus();
      fixture.detectChanges();
      expect(document.activeElement).toBe(region());

      scrollingTo(region(), REGION_HEIGHT, REGION_HEIGHT);
      await mutateContent(() => host.extra.set(false));

      expect(region().getAttribute('tabindex')).toBe('0');
      expect(region().getAttribute('role')).toBe('group');
      expect(region().getAttribute('aria-label')).toBe(TN_DRAWER_CONTENT_LABEL);
    });

    it('gives it up once focus leaves of its own accord', async () => {
      scrollingTo(region(), 400, REGION_HEIGHT);
      await mutateContent(() => host.extra.set(true));

      region().focus();
      fixture.detectChanges();

      scrollingTo(region(), REGION_HEIGHT, REGION_HEIGHT);
      await mutateContent(() => host.extra.set(false));

      const trigger = fixture.nativeElement.querySelector('#trigger') as HTMLElement;
      trigger.focus();
      fixture.detectChanges();

      expect(document.activeElement).toBe(trigger);
      expect(region().getAttribute('tabindex')).toBeNull();
      expect(region().getAttribute('role')).toBeNull();
    });
  });

  describe('what the measurement follows', () => {
    /**
     * The box-changed direction: the drawer opens beside it, the same content
     * reflows taller, and NOTHING about the DOM changed. That is a
     * `ResizeObserver` callback and no mutation record at all — and on this
     * component it is the ORDINARY path, because opening a `side` drawer is
     * exactly what narrows this element.
     */
    it('re-measures when the region resizes, with no DOM mutation', () => {
      expect(MockResizeObserver.targets()).toContain(region());
      expect(region().getAttribute('tabindex')).toBeNull();

      scrollingTo(region(), 400, REGION_HEIGHT);
      MockResizeObserver.emit();
      fixture.detectChanges();

      expect(region().getAttribute('tabindex')).toBe('0');
    });

    /**
     * The child-resized direction, which a `MutationObserver` cannot see. The
     * registration is the assertion: the mock fires every observer it holds, so
     * a callback alone would look identical if only the region were watched.
     */
    it('watches the region\'s direct children too', async () => {
      await mutateContent(() => host.extra.set(true));

      const child = region().querySelector('#extra') as HTMLElement;
      expect(MockResizeObserver.targets()).toContain(child);
    });
  });
});
