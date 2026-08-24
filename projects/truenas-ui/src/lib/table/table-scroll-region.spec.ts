import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TnTableTesting } from './table-testing';
import { TN_TABLE_SCROLL_REGION_LABEL, TnTableComponent } from './table.component';
import { axeResult } from '../a11y/axe-testing';
import { TN_SCROLLABLE_REGION_TOLERANCE_PX } from '../a11y/scrollable-region';
import { scrollingTo, staticScroller } from '../a11y/scrollable-region-testing';

/**
 * Guards the keyboard reachability of the table's own horizontal scroll region
 * (#270).
 *
 * WHAT THE DEFECT IS
 * ------------------
 * `:host` is `overflow-x: auto` — the stylesheet explains why the scrollport is
 * the host and not `.tn-table__table` — so a table wider than its container
 * scrolls on the host element. Whether anything in it is reachable from a
 * keyboard depends entirely on how the consumer configured it: sortable headers
 * and clickable rows render `tabindex="0"`, and a table with neither renders
 * none. Every feature input on this component is opt-in and defaults off, so
 * the DEFAULT table is the one that matched axe's
 * `scrollable-region-focusable` — a scroll container that is not in the tab
 * order and holds nothing that is, with its trailing columns unreachable.
 *
 * WHY THE MEASUREMENT AND NOT `isScrollMode()`
 * --------------------------------------------
 * They answer different questions. `--scroll` says which LAYOUT the container's
 * width selected; this asks whether the content actually exceeds the box, which
 * is what axe asks and what decides whether there is anything to scroll to. A
 * narrow table in scroll mode has no overflow and needs no tab stop.
 *
 * HOW THE OVERFLOW IS REPRODUCED HERE
 * -----------------------------------
 * jsdom has no layout engine, so `scrollWidth` and `clientWidth` are `0` on
 * every element. `scrollingTo` stubs both and sets `overflow-x` inline, which
 * is what axe's `getScroll` and `tnScrollableRegion` each read. These tests are
 * therefore a reproduction of the RULE rather than of the rendering: whether a
 * given table overflows at a given width is a question only `yarn test-sb` can
 * answer.
 */

interface Row { id: number; name: string }

const ROWS: Row[] = [
  { id: 1, name: 'alpha' },
  { id: 2, name: 'beta' },
];

@Component({
  selector: 'tn-table-scroll-region-host',
  standalone: true,
  imports: [TnTableComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <button type="button" id="trigger">Elsewhere</button>
    <tn-table
      mobileLayout="scroll"
      [dataSource]="rows()"
      [displayedColumns]="['id', 'name']"
      [clickable]="clickable()"
      [scrollRegionAriaLabel]="label()" />
  `,
})
class TableScrollRegionHostComponent {
  rows = signal<Row[]>(ROWS);
  /** The other route to satisfying the rule: rows that are themselves tab stops. */
  clickable = signal(false);
  label = signal(TN_TABLE_SCROLL_REGION_LABEL);
}

describe('tn-table horizontal scroll region (#270)', () => {
  let fixture: ComponentFixture<TableScrollRegionHostComponent>;
  let host: TableScrollRegionHostComponent;
  let restoreResizeObserver: () => void;

  /** The visible width every case here measures against. */
  const HOST_WIDTH = 400;

  beforeEach(async () => {
    // The table's own stand-in rather than the one in
    // `../a11y/scrollable-region-testing`: `tn-table` reads
    // `entries[0].contentRect.width` to choose its layout, and this is the
    // supported way to push a width through it. `tnScrollableRegion` ignores
    // the entries and re-measures the host, so one observer serves both.
    restoreResizeObserver = TnTableTesting.installResizeObserver();

    await TestBed.configureTestingModule({
      imports: [TableScrollRegionHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableScrollRegionHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    restoreResizeObserver();
  });

  function table(): HTMLElement {
    return fixture.nativeElement.querySelector('tn-table') as HTMLElement;
  }

  /** Re-measure through the observer, which is the path a real resize takes. */
  function reflow(): void {
    TnTableTesting.emitContainerWidth(HOST_WIDTH);
    fixture.detectChanges();
  }

  describe('what the reported defect looks like on this markup', () => {
    /**
     * The positive control, on the horizontal axis, built from static markup so
     * that it keeps saying what axe does about an unfixed scroll container
     * after this component stops being one.
     */
    it('still reports a horizontally scrolling container that nothing can focus', async () => {
      const { root, region } = staticScroller(900, HOST_WIDTH, 'horizontal');

      try {
        const { violated } = await axeResult(root, region, ['scrollable-region-focusable']);
        expect(violated).toEqual(['scrollable-region-focusable']);
      } finally {
        root.remove();
      }
    });
  });

  describe('a table wider than its container', () => {
    beforeEach(() => {
      scrollingTo(table(), 900, HOST_WIDTH, 'horizontal');
      reflow();
    });

    it('makes the host a tab stop', () => {
      expect(table().getAttribute('tabindex')).toBe('0');
    });

    it('names the region, so it is not announced as an unlabelled group', () => {
      expect(table().getAttribute('role')).toBe('group');
      expect(table().getAttribute('aria-label')).toBe(TN_TABLE_SCROLL_REGION_LABEL);
    });

    it('lets a consumer say what the table holds', () => {
      host.label.set('Storage pools');
      fixture.detectChanges();
      expect(table().getAttribute('aria-label')).toBe('Storage pools');
    });

    it('falls back when the consumer passes whitespace', () => {
      host.label.set('   ');
      fixture.detectChanges();
      expect(table().getAttribute('aria-label')).toBe(TN_TABLE_SCROLL_REGION_LABEL);
    });

    it('raises no scrollable-region-focusable violation, and does evaluate the rule', async () => {
      const { violated, evaluated } = await axeResult(
        fixture.nativeElement, table(), ['scrollable-region-focusable']
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('scrollable-region-focusable');
    });

    it('puts no disallowed ARIA on the host it just named', async () => {
      const { violated } = await axeResult(
        fixture.nativeElement,
        table(),
        ['aria-allowed-role', 'aria-allowed-attr', 'aria-valid-attr-value'],
      );

      expect(violated).toEqual([]);
    });

    it('gives the tab stop back when the table stops overflowing', () => {
      scrollingTo(table(), HOST_WIDTH, HOST_WIDTH, 'horizontal');
      reflow();

      expect(table().getAttribute('tabindex')).toBeNull();
      expect(table().getAttribute('role')).toBeNull();
      expect(table().getAttribute('aria-label')).toBeNull();
    });
  });

  describe('a table that fits its container', () => {
    /**
     * The over-fix guard. Every `tn-table` in the product renders this host, so
     * an unconditional tab stop here is an extra stop on every table — and one
     * that reports nothing to axe either way, because the rule does not match
     * an element that does not scroll.
     */
    it('leaves the host unmarked', () => {
      scrollingTo(table(), HOST_WIDTH, HOST_WIDTH, 'horizontal');
      reflow();

      expect(table().getAttribute('tabindex')).toBeNull();
      expect(table().getAttribute('role')).toBeNull();
      expect(table().getAttribute('aria-label')).toBeNull();
    });

    /** The tolerance, from both sides of the line axe draws. */
    it('starts marking exactly where axe starts reporting', () => {
      scrollingTo(
        table(), HOST_WIDTH + TN_SCROLLABLE_REGION_TOLERANCE_PX, HOST_WIDTH, 'horizontal'
      );
      reflow();

      expect(table().getAttribute('tabindex')).toBeNull();

      scrollingTo(
        table(), HOST_WIDTH + TN_SCROLLABLE_REGION_TOLERANCE_PX + 1, HOST_WIDTH, 'horizontal'
      );
      reflow();

      expect(table().getAttribute('tabindex')).toBe('0');
    });
  });

  describe('a table that already holds tab stops', () => {
    /**
     * The rule is satisfied either way for a clickable table — its rows are
     * `tabindex="0"`, so `focusable-content` answers it — and the host is
     * marked anyway.
     *
     * That is deliberate and is not the same claim as "the rule needs it". A
     * row's tab stop lets a keyboard user reach a ROW; it does not let them
     * scroll the columns sideways, and a table can have twelve columns and two
     * rows. Marking on the measurement rather than on whether some descendant
     * happens to be tabbable also means the answer does not change when a
     * consumer toggles `clickable`.
     */
    it('marks the host regardless, because a row stop is not a scroll stop', async () => {
      host.clickable.set(true);
      fixture.detectChanges();
      scrollingTo(table(), 900, HOST_WIDTH, 'horizontal');
      reflow();

      expect(table().getAttribute('tabindex')).toBe('0');

      const { violated } = await axeResult(
        fixture.nativeElement, table(), ['scrollable-region-focusable']
      );
      expect(violated).toEqual([]);
    });
  });

  describe('when the table stops overflowing UNDER a keyboard user', () => {
    /**
     * Taking `tabindex` off a focused element blurs it to `<body>`, so a
     * keyboard user who has tabbed to a table to scroll it would be dropped to
     * the top of the document because a column got narrower. jsdom does not
     * implement the blur, so the CONDITION is what is asserted: the attributes
     * are not taken off while the host holds focus.
     */
    it('keeps the tab stop and the name while the host holds focus', () => {
      scrollingTo(table(), 900, HOST_WIDTH, 'horizontal');
      reflow();

      table().focus();
      fixture.detectChanges();
      expect(document.activeElement).toBe(table());

      scrollingTo(table(), HOST_WIDTH, HOST_WIDTH, 'horizontal');
      reflow();

      expect(table().getAttribute('tabindex')).toBe('0');
      expect(table().getAttribute('role')).toBe('group');
      expect(table().getAttribute('aria-label')).toBe(TN_TABLE_SCROLL_REGION_LABEL);
    });

    it('gives it up once focus leaves of its own accord', () => {
      scrollingTo(table(), 900, HOST_WIDTH, 'horizontal');
      reflow();

      table().focus();
      fixture.detectChanges();

      scrollingTo(table(), HOST_WIDTH, HOST_WIDTH, 'horizontal');
      reflow();

      const trigger = fixture.nativeElement.querySelector('#trigger') as HTMLElement;
      trigger.focus();
      fixture.detectChanges();

      expect(document.activeElement).toBe(trigger);
      expect(table().getAttribute('tabindex')).toBeNull();
      expect(table().getAttribute('role')).toBeNull();
    });
  });
});
