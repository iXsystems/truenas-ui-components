import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TN_TAB_PANEL_CONTENT_LABEL, TnTabPanelComponent } from './tab-panel.component';
import { axeResult } from '../a11y/axe-testing';
import { TN_SCROLLABLE_REGION_TOLERANCE_PX } from '../a11y/scrollable-region';
import {
  MockResizeObserver,
  scrollingTo,
  staticScroller,
} from '../a11y/scrollable-region-testing';

/**
 * Guards the keyboard reachability of a tab panel's scrolling content (#270).
 *
 * WHAT THE DEFECT IS, AND WHY THE PANEL'S OWN TAB STOP DID NOT COVER IT
 * ---------------------------------------------------------------------
 * `.tn-tab-panel__content` is `overflow: auto` and is a CHILD of the
 * `role="tabpanel"` wrapper. The wrapper was already `tabindex="0"` while
 * active, which is the ARIA tabs pattern's answer to a panel holding no control
 * of its own — but it is the wrong element for scrolling twice over. axe's
 * `scrollable-region-focusable` looks at whether the SCROLL CONTAINER is
 * focusable or holds something focusable, and an ancestor's tab stop is
 * neither; and a browser scrolls the nearest scrollable ANCESTOR of what has
 * focus, so standing on the wrapper scrolled the page instead of the panel.
 *
 * WHAT THE FIX DOES INSTEAD OF MARKING BOTH
 * -----------------------------------------
 * The tab stop MOVES rather than multiplying. Marking the region as well as the
 * wrapper would satisfy the rule and put two stops in a row — "tab panel", then
 * "group" — on every scrolling panel, for one region. So the wrapper keeps
 * `tabindex="0"` while the content fits and drops to `-1` when the region takes
 * it, which leaves exactly one stop either way and puts it on the element that
 * scrolls. `-1` rather than nothing: the wrapper is still what a tab's
 * `aria-controls` points at and still has to be focusable programmatically.
 */

@Component({
  selector: 'tn-tab-panel-scroll-host',
  standalone: true,
  imports: [TnTabPanelComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <button type="button" id="trigger">Elsewhere</button>
    <tn-tab-panel [label]="label()">
      <p>Panel body</p>
      @if (extra()) {
        <p id="extra">More body than fits</p>
      }
    </tn-tab-panel>
  `,
})
class TabPanelScrollHostComponent {
  extra = signal(false);
  label = signal('');
}

describe('tn-tab-panel scrolling content region (#270)', () => {
  let fixture: ComponentFixture<TabPanelScrollHostComponent>;
  let host: TabPanelScrollHostComponent;
  let restoreResizeObserver: () => void;

  /** The visible height every case here measures against. */
  const REGION_HEIGHT = 200;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabPanelScrollHostComponent],
    }).compileComponents();

    restoreResizeObserver = MockResizeObserver.install();

    fixture = TestBed.createComponent(TabPanelScrollHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();

    // A panel is inactive until its parent `tn-tabs` says otherwise, and an
    // inactive one is `display: none` — which axe exempts and no user can
    // scroll. Every case here is about the active panel, so this is setup
    // rather than a case of its own.
    const panelDebugEl = fixture.debugElement.children
      .find((child) => child.componentInstance instanceof TnTabPanelComponent);
    (panelDebugEl?.componentInstance as TnTabPanelComponent).isActive.set(true);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    restoreResizeObserver();
  });

  /** The `role="tabpanel"` wrapper. */
  function panel(): HTMLElement {
    return fixture.nativeElement.querySelector('[role="tabpanel"]') as HTMLElement;
  }

  /** The element that actually scrolls. */
  function region(): HTMLElement {
    return fixture.nativeElement.querySelector('.tn-tab-panel__content') as HTMLElement;
  }

  async function mutateContent(mutate: () => void): Promise<void> {
    mutate();
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();
  }

  describe('what the reported defect looks like on this markup', () => {
    /**
     * The positive control, and it is specifically the shape this component
     * had: a scroll container with no tab stop, inside a focusable wrapper. The
     * wrapper's `tabindex="0"` is on the control deliberately — the point is
     * that it does not answer the rule, because the rule asks about the scroll
     * container and its DESCENDANTS.
     */
    it('still reports a scroll container inside a focusable wrapper', async () => {
      const root = document.createElement('div');
      root.innerHTML = '<div role="tabpanel" tabindex="0">'
        + '<div class="scroller"><p>Panel body</p></div>'
        + '</div>';
      document.body.appendChild(root);

      const scroller = root.querySelector('.scroller') as HTMLElement;
      scrollingTo(scroller, 400, REGION_HEIGHT);

      try {
        const { violated } = await axeResult(root, scroller, ['scrollable-region-focusable']);
        expect(violated).toEqual(['scrollable-region-focusable']);
      } finally {
        root.remove();
      }
    });

    /**
     * And the same rule on a bare scroll container, so that the control above
     * is read as "the wrapper did not help" rather than as "the rule fires on
     * anything".
     */
    it('reports a bare one too', async () => {
      const { root, region: scroller } = staticScroller(400, REGION_HEIGHT);

      try {
        const { violated } = await axeResult(root, scroller, ['scrollable-region-focusable']);
        expect(violated).toEqual(['scrollable-region-focusable']);
      } finally {
        root.remove();
      }
    });
  });

  describe('a panel whose content overflows', () => {
    beforeEach(async () => {
      scrollingTo(region(), 400, REGION_HEIGHT);
      await mutateContent(() => host.extra.set(true));
    });

    it('moves the tab stop onto the region that scrolls', () => {
      expect(region().getAttribute('tabindex')).toBe('0');
      expect(panel().getAttribute('tabindex')).toBe('-1');
    });

    it('names the region, so it is not announced as an unlabelled group', () => {
      expect(region().getAttribute('role')).toBe('group');
      expect(region().getAttribute('aria-label')).toBe(TN_TAB_PANEL_CONTENT_LABEL);
    });

    it('prefers the panel\'s own label, which is what its tab says', async () => {
      await mutateContent(() => host.label.set('Datasets'));
      expect(region().getAttribute('aria-label')).toBe('Datasets');
    });

    it('falls back when the label is only whitespace', async () => {
      await mutateContent(() => host.label.set('   '));
      expect(region().getAttribute('aria-label')).toBe(TN_TAB_PANEL_CONTENT_LABEL);
    });

    it('raises no scrollable-region-focusable violation, and does evaluate the rule', async () => {
      const { violated, evaluated } = await axeResult(
        fixture.nativeElement, region(), ['scrollable-region-focusable']
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('scrollable-region-focusable');
    });

    it('puts no disallowed ARIA on the region or the panel', async () => {
      const { violated } = await axeResult(
        fixture.nativeElement,
        [region(), panel()],
        ['aria-allowed-role', 'aria-allowed-attr', 'aria-valid-attr-value'],
      );

      expect(violated).toEqual([]);
    });

    it('hands the tab stop back to the panel when the content shrinks to fit', async () => {
      scrollingTo(region(), REGION_HEIGHT, REGION_HEIGHT);
      await mutateContent(() => host.extra.set(false));

      expect(region().getAttribute('tabindex')).toBeNull();
      expect(region().getAttribute('role')).toBeNull();
      expect(panel().getAttribute('tabindex')).toBe('0');
    });
  });

  describe('a panel whose content fits', () => {
    /**
     * The over-fix guard, and the half that says the ARIA tabs pattern still
     * holds: an active panel is reachable whether or not it scrolls, because a
     * panel with no control of its own has to be.
     */
    it('leaves the tab stop on the panel and the region unmarked', async () => {
      scrollingTo(region(), REGION_HEIGHT, REGION_HEIGHT);
      await mutateContent(() => host.extra.set(true));

      expect(panel().getAttribute('tabindex')).toBe('0');
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
     * The failure the fix can cause rather than the one it fixes: taking
     * `tabindex` off a focused element blurs it to `<body>`, and here that
     * would drop a keyboard user out of the tab panel entirely — the wrapper
     * takes its own stop back at the same moment, so there is nothing beside it
     * to catch them. jsdom does not implement the blur, so the CONDITION is
     * what is asserted.
     */
    it('keeps both the region\'s stop and the panel\'s -1 while the region has focus', async () => {
      scrollingTo(region(), 400, REGION_HEIGHT);
      await mutateContent(() => host.extra.set(true));

      region().focus();
      fixture.detectChanges();
      expect(document.activeElement).toBe(region());

      scrollingTo(region(), REGION_HEIGHT, REGION_HEIGHT);
      await mutateContent(() => host.extra.set(false));

      expect(region().getAttribute('tabindex')).toBe('0');
      expect(region().getAttribute('aria-label')).toBe(TN_TAB_PANEL_CONTENT_LABEL);
      expect(panel().getAttribute('tabindex')).toBe('-1');
    });

    it('hands it back once focus leaves of its own accord', async () => {
      scrollingTo(region(), 400, REGION_HEIGHT);
      await mutateContent(() => host.extra.set(true));

      region().focus();
      fixture.detectChanges();

      scrollingTo(region(), REGION_HEIGHT, REGION_HEIGHT);
      await mutateContent(() => host.extra.set(false));

      const trigger = fixture.nativeElement.querySelector('#trigger') as HTMLElement;
      trigger.focus();
      fixture.detectChanges();

      expect(region().getAttribute('tabindex')).toBeNull();
      expect(panel().getAttribute('tabindex')).toBe('0');
    });
  });

  describe('what the measurement follows', () => {
    /**
     * The box-changed direction: the window narrows, the same content reflows
     * taller, and NOTHING about the DOM changed.
     */
    it('re-measures when the region resizes, with no DOM mutation', () => {
      expect(MockResizeObserver.targets()).toContain(region());
      expect(region().getAttribute('tabindex')).toBeNull();

      scrollingTo(region(), 400, REGION_HEIGHT);
      MockResizeObserver.emit();
      fixture.detectChanges();

      expect(region().getAttribute('tabindex')).toBe('0');
    });

    /** The child-resized direction, which a `MutationObserver` cannot see. */
    it('watches the region\'s direct children too', async () => {
      await mutateContent(() => host.extra.set(true));

      const child = region().querySelector('#extra') as HTMLElement;
      expect(MockResizeObserver.targets()).toContain(child);
    });
  });
});
