import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TnTabsComponent } from './tabs.component';
import { axeResult } from '../a11y/axe-testing';
import { TnTabComponent } from '../tab/tab.component';
import { TnTabPanelComponent } from '../tab-panel/tab-panel.component';

/**
 * Guards the tablist structure given to `tn-tabs` in #232.
 *
 * WHAT WAS REPORTED
 * -----------------
 * `role="tablist"` sat on `.tn-tabs`, the outer wrapper, which holds the tab
 * header AND the panel content. Every rendered `role="tabpanel"` was therefore
 * an owned child of the tablist, and all ten Tabs stories failed axe
 * `aria-required-children` with "Element has children which are not allowed:
 * [role=tabpanel]". The role moved down one level, onto `.tn-tabs__header`,
 * whose only children are the tabs.
 *
 * WHY THE TAB/PANEL WIRING IS PART OF THE SAME FIX
 * ------------------------------------------------
 * Containment was the only thing tying a panel to its tab. Once the panels are
 * outside the tablist, the association has to be explicit, and it was not:
 * `tn-tab` carried no `aria-controls` at all, and `tn-tab-panel` carried
 * `aria-labelledby="tab-{index}"` pointing at an id no element in the library
 * ever rendered. Both directions are now real ids, namespaced per `tn-tabs`
 * instance so that two tab groups on one page — a Storybook docs page renders
 * ten — cannot collide on `tab-0`.
 *
 * WHY `evaluated` IS ASSERTED BESIDE EVERY EMPTY `violated`
 * ---------------------------------------------------------
 * An empty `violations` is also what axe returns when it looked at nothing, and
 * "looked at nothing" is a live risk here: `aria-required-children` only reports
 * on an element that HAS a role, so a regression that drops `role="tablist"`
 * entirely would empty `violated` rather than fill it. `the structure this
 * replaced` at the bottom is the other half of that guard — it rebuilds the
 * pre-#232 markup and asserts the rule does fire on it.
 */

@Component({
  selector: 'tn-tabs-a11y-host',
  standalone: true,
  imports: [TnTabsComponent, TnTabComponent, TnTabPanelComponent],
  templateUrl: './test-hosts/a11y-host.component.html',
})
class TabsA11yHostComponent {
  orientation = signal<'horizontal' | 'vertical'>('horizontal');
  detailsDisabled = signal(false);
}

@Component({
  selector: 'tn-tabs-a11y-multi-host',
  standalone: true,
  imports: [TnTabsComponent, TnTabComponent, TnTabPanelComponent],
  templateUrl: './test-hosts/multi-tabs-host.component.html',
})
class TabsA11yMultiHostComponent {}

/** Two groups, one with a tab too many and one with a panel too many. */
@Component({
  selector: 'tn-tabs-a11y-mismatched-host',
  standalone: true,
  imports: [TnTabsComponent, TnTabComponent, TnTabPanelComponent],
  templateUrl: './test-hosts/mismatched-host.component.html',
})
class TabsA11yMismatchedHostComponent {}

/**
 * The rules this structure can be wrong under.
 *
 * `aria-required-children` is the reported one — what the tablist is allowed to
 * own. `aria-required-parent` is its mirror and is what fails if the role lands
 * somewhere that leaves the tabs outside a tablist, which is the way this
 * particular fix is most likely to be got wrong.
 *
 * `aria-valid-attr-value` is here for the wiring: it is the rule that resolves
 * `aria-controls` and `aria-labelledby` against real ids. Measured on the
 * pre-#232 markup, a dangling `aria-labelledby` lands in `incomplete` rather
 * than `violations` — which `axeResult` throws on, so the rule still fails this
 * spec if a reference stops resolving, just not by way of `violated`. Note it
 * does NOT check an unselected tab's `aria-controls` at all — axe skips that
 * one when `aria-selected="false"` — so `every tab points at its own panel`
 * below reads the DOM as well rather than leaving it to axe.
 *
 * `aria-allowed-attr` covers `aria-orientation` moving with the role: it is
 * allowed on `tablist` and not on a roleless `div`.
 */
const TABLIST_RULES = [
  'aria-required-children',
  'aria-required-parent',
  'aria-valid-attr-value',
  'aria-allowed-attr',
  'aria-allowed-role',
];

describe('tn-tabs accessibility (#232)', () => {
  let host: TabsA11yHostComponent;
  let fixture: ComponentFixture<TabsA11yHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabsA11yHostComponent],
    }).compileComponents();

    // TestBed attaches the fixture to the document itself, which axe needs — it
    // walks up to the document root to decide visibility, and treats a detached
    // tree as hidden and therefore exempt from every rule below.
    fixture = TestBed.createComponent(TabsA11yHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function root(): HTMLElement {
    return fixture.nativeElement.querySelector('.tn-tabs') as HTMLElement;
  }

  function tablist(): HTMLElement {
    return fixture.nativeElement.querySelector('[role="tablist"]') as HTMLElement;
  }

  function tabs(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]'));
  }

  function panels(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('[role="tabpanel"]'));
  }

  describe('the tablist owns the tabs and nothing else', () => {
    it('puts the role on the header, not on the wrapper that holds the panels', () => {
      expect(tablist().classList.contains('tn-tabs__header')).toBe(true);
      expect(root().getAttribute('role')).toBeNull();
    });

    it('keeps every panel outside the tablist', () => {
      expect(panels().length).toBe(3);
      expect(panels().some((panel) => tablist().contains(panel))).toBe(false);
    });

    it('holds every tab directly inside the tablist', () => {
      expect(tabs().length).toBe(3);
      expect(tabs().every((tab) => tablist().contains(tab))).toBe(true);
    });

    /**
     * `aria-orientation` describes the tablist, so it has to travel with the
     * role rather than stay on the wrapper — where it would also be an
     * attribute a roleless element is not allowed to carry.
     */
    it.each(['horizontal', 'vertical'] as const)(
      'carries aria-orientation on the tablist (%s)',
      (orientation) => {
        host.orientation.set(orientation);
        fixture.detectChanges();

        expect(tablist().getAttribute('aria-orientation')).toBe(orientation);
        expect(root().hasAttribute('aria-orientation')).toBe(false);
      },
    );

    /**
     * The highlight bar is measured against the header element in
     * `updateHighlightBar`, so it stays inside it — and inside the tablist as a
     * result. It is a roleless `div`, which `aria-required-children` treats as
     * generic and lets through; the axe assertions below would not notice if it
     * ever gained a role, so its position is asserted here.
     */
    it('leaves the highlight bar inside the header it is measured against', async () => {
      // The bar renders only once `ngAfterViewInit`'s setTimeout(fn, 0) has run.
      await new Promise((resolve) => setTimeout(resolve, 0));
      fixture.detectChanges();

      const bar = fixture.nativeElement.querySelector('.tn-tabs__highlight-bar') as HTMLElement;

      expect(bar.parentElement).toBe(tablist());
      expect(bar.getAttribute('role')).toBeNull();
    });
  });

  describe('axe over the tablist', () => {
    function targets(): HTMLElement[] {
      return [tablist(), ...tabs(), ...panels()];
    }

    it('raises no violation, and does evaluate the tablist rules', async () => {
      const { violated, evaluated } = await axeResult(
        fixture.nativeElement, targets(), TABLIST_RULES
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-required-children');
      expect(evaluated).toContain('aria-required-parent');
    });

    it('raises no violation in vertical orientation', async () => {
      host.orientation.set('vertical');
      fixture.detectChanges();

      const { violated, evaluated } = await axeResult(
        fixture.nativeElement, targets(), TABLIST_RULES
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-required-children');
    });

    it('raises no violation with a disabled tab', async () => {
      host.detailsDisabled.set(true);
      fixture.detectChanges();

      const { violated, evaluated } = await axeResult(
        fixture.nativeElement, targets(), TABLIST_RULES
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-required-children');
    });
  });

  describe('each tab and its panel point at each other', () => {
    it('gives every tab and every panel an id', () => {
      expect(tabs().every((tab) => tab.id !== '')).toBe(true);
      expect(panels().every((panel) => panel.id !== '')).toBe(true);
    });

    /**
     * Read from the DOM rather than left to `aria-valid-attr-value`, which
     * skips `aria-controls` on an element carrying `aria-selected="false"` —
     * two of the three tabs here. It would also be satisfied by a tab pointing
     * at the WRONG panel, since any resolvable id passes it.
     */
    it('every tab points at its own panel, and every panel back at its own tab', () => {
      tabs().forEach((tab, i) => {
        expect(tab.getAttribute('aria-controls')).toBe(panels()[i].id);
        expect(panels()[i].getAttribute('aria-labelledby')).toBe(tab.id);
      });
    });

    it('resolves every reference to an element that is actually in the document', () => {
      tabs().forEach((tab, i) => {
        expect(document.getElementById(tab.getAttribute('aria-controls') as string))
          .toBe(panels()[i]);
        expect(document.getElementById(panels()[i].getAttribute('aria-labelledby') as string))
          .toBe(tab);
      });
    });
  });

  /**
   * Positive controls. Every `expect(violated).toEqual([])` above is also what
   * axe returns when it evaluated nothing, so these rebuild the markup the fix
   * replaced and assert the rules do fire on it.
   */
  describe('the structure this replaced', () => {
    async function scan(html: string, target: string, rules: string[]) {
      const previous = document.createElement('div');
      previous.innerHTML = html;
      document.body.appendChild(previous);

      // `await` inside the try, not `return axeResult(...)` — returning the
      // promise runs `finally` before axe has read anything, which detaches the
      // tree mid-scan and is precisely the vacuous pass this is guarding.
      try {
        return await axeResult(previous, previous.querySelector(target), rules);
      } finally {
        previous.remove();
      }
    }

    /** The reported defect itself: a tablist wrapping the panels it labels. */
    it('still reports a tabpanel owned by the tablist', async () => {
      const { violated } = await scan(
        '<div role="tablist" class="tn-tabs" aria-orientation="horizontal">'
        + '<div class="tn-tabs__header">'
        + '<button role="tab" type="button" aria-selected="true">Overview</button>'
        + '</div>'
        + '<div class="tn-tabs__content">'
        + '<div role="tabpanel" tabindex="0">Overview content</div>'
        + '</div>'
        + '</div>',
        '[role="tablist"]',
        ['aria-required-children'],
      );

      expect(violated).toEqual(['aria-required-children']);
    });

    /**
     * The control for the wiring half: `aria-labelledby="tab-0"` with no
     * element of that id anywhere, which is what every panel rendered before
     * #232.
     *
     * Asserted by resolving the reference rather than by asking axe for a
     * violation, because axe does not call this one: measured here, it puts a
     * dangling `aria-labelledby` in `incomplete`. That is not nothing — the
     * shared `axeResult` throws on `incomplete`, so the clean scans above would
     * still fail if a reference stopped resolving — but it is not a `violated`
     * entry, and writing this control as one would be asserting a verdict axe
     * never gives.
     */
    it('leaves the reference unresolvable, which axe reports as undecided, not as a violation',
      async () => {
        const previous = document.createElement('div');
        previous.innerHTML =
          '<div class="tn-tabs__content">'
          + '<div role="tabpanel" aria-labelledby="tab-0" tabindex="0">Overview content</div>'
          + '</div>';
        document.body.appendChild(previous);

        try {
          const panel = previous.querySelector('[role="tabpanel"]') as HTMLElement;

          expect(document.getElementById(panel.getAttribute('aria-labelledby') as string))
            .toBeNull();
          await expect(axeResult(previous, panel, ['aria-valid-attr-value']))
            .rejects.toThrow('could not decide aria-valid-attr-value');
        } finally {
          previous.remove();
        }
      });
  });
});

/**
 * The ids were `tab-{index}` before #232, which is unique within one tab group
 * and duplicated across every other one on the page. A Storybook docs page
 * renders all ten Tabs stories at once, so `tab-0` would have resolved to
 * whichever came first in the document and every panel after the first would
 * have been labelled by another group's tab.
 */
describe('tn-tabs accessibility (#232): two tab groups on one page', () => {
  let fixture: ComponentFixture<TabsA11yMultiHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabsA11yMultiHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TabsA11yMultiHostComponent);
    fixture.detectChanges();
  });

  it('gives every tab and panel an id unique across both groups', () => {
    const ids: string[] = Array.from(
      fixture.nativeElement.querySelectorAll('[role="tab"], [role="tabpanel"]') as
        NodeListOf<HTMLElement>
    ).map((el) => el.id);

    expect(ids.length).toBe(8);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps each panel labelled by a tab in its own group', () => {
    const groups: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.tn-tabs'));

    expect(groups.length).toBe(2);
    groups.forEach((group) => {
      const tabs: HTMLElement[] = Array.from(group.querySelectorAll('[role="tab"]'));
      const panels: HTMLElement[] = Array.from(group.querySelectorAll('[role="tabpanel"]'));

      panels.forEach((panel, i) => {
        expect(panel.getAttribute('aria-labelledby')).toBe(tabs[i].id);
        expect(group.contains(
          document.getElementById(panel.getAttribute('aria-labelledby') as string) as HTMLElement
        )).toBe(true);
      });
    });
  });
});

/**
 * Tabs and panels are separate content children paired only by position, so a
 * consumer can hand `tn-tabs` more of one than the other. Neither cross-
 * reference may be rendered without the element it names: an `aria-controls`
 * resolving to nothing is the defect this fix would otherwise have introduced,
 * on the way to removing the same defect from `aria-labelledby`.
 */
describe('tn-tabs accessibility (#232): more tabs than panels, and the reverse', () => {
  let fixture: ComponentFixture<TabsA11yMismatchedHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabsA11yMismatchedHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TabsA11yMismatchedHostComponent);
    fixture.detectChanges();
  });

  function groups(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.tn-tabs'));
  }

  function tabsIn(group: HTMLElement): HTMLElement[] {
    return Array.from(group.querySelectorAll('[role="tab"]'));
  }

  function panelsIn(group: HTMLElement): HTMLElement[] {
    return Array.from(group.querySelectorAll('[role="tabpanel"]'));
  }

  it('omits aria-controls on the tab that has no panel', () => {
    const tabs = tabsIn(groups()[0]);

    expect(tabs.length).toBe(2);
    expect(tabs[0].getAttribute('aria-controls')).toBe(panelsIn(groups()[0])[0].id);
    expect(tabs[1].hasAttribute('aria-controls')).toBe(false);
  });

  it('omits aria-labelledby on the panel that has no tab', () => {
    const panels = panelsIn(groups()[1]);

    expect(panels.length).toBe(2);
    expect(panels[0].getAttribute('aria-labelledby')).toBe(tabsIn(groups()[1])[0].id);
    expect(panels[1].hasAttribute('aria-labelledby')).toBe(false);
  });

  it('leaves no reference that resolves to nothing', () => {
    const referring: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('[aria-controls], [aria-labelledby]')
    );

    expect(referring.length).toBe(4);
    referring.forEach((el) => {
      const id = el.getAttribute('aria-controls') ?? el.getAttribute('aria-labelledby') as string;
      expect(document.getElementById(id)).not.toBeNull();
    });
  });

  it('raises no violation on either group', async () => {
    for (const group of groups()) {
      const { violated, evaluated } = await axeResult(
        fixture.nativeElement,
        [group.querySelector('[role="tablist"]') as HTMLElement,
          ...tabsIn(group), ...panelsIn(group)],
        TABLIST_RULES,
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-required-children');
    }
  });
});
