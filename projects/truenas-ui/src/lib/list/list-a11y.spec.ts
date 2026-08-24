import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import type { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TnListComponent } from './list.component';
import { accessibleName } from '../a11y/accessible-name-testing';
import { axeResult, axeScan } from '../a11y/axe-testing';
import { TnDividerComponent } from '../divider/divider.component';
import { TnDividerDirective, TnListItemTitleDirective } from '../list-directives/list-directives';
import { TnListItemComponent } from '../list-item/list-item.component';
import { TnListOptionComponent } from '../list-option/list-option.component';
import { TnListSubheaderComponent } from '../list-subheader/list-subheader.component';
import { TnSelectionListComponent } from '../selection-list/selection-list.component';

/**
 * Guards the structure fixed for #237: `tn-list` declares `role="list"`, which
 * owns only `listitem`, while the subheader and the divider it ships alongside
 * declared `role="heading"` and `role="separator"` unconditionally — so every
 * list with a section in it failed axe's `aria-required-children`.
 *
 * `aria-required-children` is pure DOM structure, so axe evaluates it correctly
 * under jsdom: it reported the violation on this exact fixture before the fix,
 * and the positive control below keeps that fact from rotting. The Storybook run
 * the ticket reproduced on needs a real browser and cannot run here.
 *
 * The other half of the ticket is that neither role may simply be deleted — the
 * heading has to stay in the accessibility tree, and `tn-divider` outside a list
 * has to keep the separator role it is for. Both have their own case below.
 */

@Component({
  selector: 'tn-list-a11y-host',
  standalone: true,
  imports: [
    TnListComponent,
    TnListItemComponent,
    TnListSubheaderComponent,
    TnDividerComponent,
    TnDividerDirective,
    TnListItemTitleDirective,
  ],
  // The story the ticket reproduced on, in miniature: a list composed with the
  // subheader and the divider from the same library. `TnDividerDirective` is
  // imported because the story imports it, and it used to match `tn-divider` as
  // well — which is how a second `role="separator"` reached that element. It
  // matches only the attribute form now, and both forms are asserted below.
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-list>
      <tn-list-subheader>Pools</tn-list-subheader>
      <tn-list-item><span tnListItemTitle>tank</span></tn-list-item>
      <tn-divider />
      <tn-list-subheader>Archives</tn-list-subheader>
      <tn-list-item><span tnListItemTitle>backup</span></tn-list-item>
      <div tnDivider></div>
    </tn-list>
  `,
})
class TestHostComponent {}

/**
 * A divider one level further in, inside a row. The row owns it, and a
 * separator inside a `listitem` is legal — so this is the case a "is there a
 * list anywhere above me" check demotes for nothing.
 */
@Component({
  selector: 'tn-nested-divider-a11y-host',
  standalone: true,
  imports: [TnListComponent, TnListItemComponent, TnDividerComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-list>
      <tn-list-item>
        tank
        <tn-divider />
      </tn-list-item>
    </tn-list>
  `,
})
class NestedDividerHostComponent {}

/**
 * A divider one wrapper further in, where the wrapper is presentational. The
 * wrapper is not in the accessibility tree, so the list still owns the divider —
 * and a walk that stopped at the first `role` attribute it met would decide the
 * wrapper owns it.
 */
@Component({
  selector: 'tn-presentational-wrapper-a11y-host',
  standalone: true,
  imports: [TnListComponent, TnListItemComponent, TnDividerComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-list>
      <tn-list-item>tank</tn-list-item>
      <div role="presentation"><tn-divider /></div>
    </tn-list>
  `,
})
class PresentationalWrapperHostComponent {}

/**
 * A list that projects its rows, so that the divider is DECLARED outside the
 * list and RENDERED inside it. This is the case `ariaOwnerRole` reads the DOM
 * for — an element injector would answer "no list here" and leave the separator
 * role on, which is the bug.
 */
@Component({
  selector: 'tn-projecting-list',
  standalone: true,
  imports: [TnListComponent],
  template: '<tn-list><ng-content /></tn-list>',
})
class ProjectingListComponent {}

@Component({
  selector: 'tn-projected-a11y-host',
  standalone: true,
  imports: [ProjectingListComponent, TnListItemComponent, TnDividerComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-projecting-list>
      <tn-list-item>tank</tn-list-item>
      <tn-divider />
    </tn-projecting-list>
  `,
})
class ProjectedHostComponent {}

/**
 * The hardest projection, and the reason the owner is re-read rather than taken
 * once. The `<ng-content>` sits inside an `@if`, so the divider is projected
 * during the PANEL's view refresh — after the hooks of the consumer's view,
 * where the divider is declared and initialised.
 *
 * Both views are `OnPush`, which is what this library asks of a component and
 * what makes the case unrecoverable by hooks alone: the projection dirties
 * nothing here, so the view holding the divider is never checked again and
 * `ngDoCheck` never runs a second time.
 */
@Component({
  selector: 'tn-gated-panel',
  standalone: true,
  imports: [TnListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '@if (open()) { <tn-list><ng-content /></tn-list> }',
})
class GatedPanelComponent {
  open = signal(true);
}

@Component({
  selector: 'tn-gated-a11y-host',
  standalone: true,
  imports: [GatedPanelComponent, TnListItemComponent, TnDividerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-gated-panel>
      <tn-list-item>tank</tn-list-item>
      <tn-divider />
    </tn-gated-panel>
  `,
})
class GatedHostComponent {}

/** A container that is a `listbox` rather than a `list`, and forbids as much. */
@Component({
  selector: 'tn-listbox-a11y-host',
  standalone: true,
  imports: [TnSelectionListComponent, TnListOptionComponent, TnDividerComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-selection-list aria-label="Mailboxes">
      <tn-list-option [value]="'inbox'">Inbox</tn-list-option>
      <tn-divider />
    </tn-selection-list>
  `,
})
class ListboxHostComponent {}

/**
 * A SUBHEADER in that same listbox, which #237 deliberately left alone and #259
 * is (see the describe block below for what the answer is and why it differs
 * from the list's).
 */
@Component({
  selector: 'tn-listbox-subheader-a11y-host',
  standalone: true,
  imports: [TnSelectionListComponent, TnListOptionComponent, TnListSubheaderComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-selection-list aria-label="Mailboxes">
      <tn-list-subheader>Personal</tn-list-subheader>
      <tn-list-option [value]="'inbox'">Inbox</tn-list-option>
    </tn-selection-list>
  `,
})
class ListboxSubheaderHostComponent {}

/** The same three components, with nothing around them. */
@Component({
  selector: 'tn-standalone-a11y-host',
  standalone: true,
  imports: [TnDividerComponent, TnListSubheaderComponent],
  template: `
    <tn-list-subheader>Settings</tn-list-subheader>
    <tn-divider />
  `,
})
class StandaloneHostComponent {}

describe('tn-list section accessibility', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  const el = <T extends HTMLElement>(selector: string): T => {
    const found = fixture.nativeElement.querySelector(selector) as T | null;
    if (!found) { throw new Error(`no element matched ${selector}`); }
    return found;
  };

  /**
   * Configured per describe rather than once at the top, because the cases
   * below use different hosts and `configureTestingModule` may be called only
   * once per test. Angular resets the TestBed between tests on its own, so this
   * is the whole setup — a `resetTestingModule()` inside a test would leave
   * `el()` reading a fixture that had been torn down.
   */
  const createHost = async <T,>(type: Type<T>): Promise<ComponentFixture<T>> => {
    await TestBed.configureTestingModule({ imports: [type] }).compileComponents();
    const created = TestBed.createComponent(type);
    created.detectChanges();
    return created;
  };

  describe('the list as a whole', () => {
    beforeEach(async () => { fixture = await createHost(TestHostComponent); });

    it('reports no aria-required-children violation', async () => {
      const list = el('tn-list');

      const { violated, evaluated } = await axeResult(
        fixture.nativeElement,
        [list],
        ['aria-required-children', 'aria-required-parent', 'aria-allowed-attr']
      );

      expect(violated).toEqual([]);
      // Proof the rule looked at this list rather than passing vacuously: it is
      // the rule that failed here before the fix, on this element.
      expect(evaluated).toContain('aria-required-children');
    });

    it('positive control: the pre-#237 roles still fail the same rule', async () => {
      // The shape this ticket removed, rebuilt by hand. Without it, a `violated`
      // of `[]` above would also be what an axe upgrade that stopped matching
      // this markup looks like.
      const list = document.createElement('div');
      list.setAttribute('role', 'list');
      list.innerHTML =
        '<div role="heading" aria-level="3">Pools</div>'
        + '<div role="listitem">tank</div>'
        + '<div role="separator" aria-orientation="horizontal"></div>';
      document.body.appendChild(list);

      try {
        const { violated } = await axeResult(list, [list], ['aria-required-children']);

        expect(violated).toEqual(['aria-required-children']);
      } finally {
        list.remove();
      }
    });

    it('has nothing else to say about the composed list', async () => {
      // The named guards above cover the roles this ticket moved. This is the
      // whole-tree sweep for the next rule this markup breaks in either
      // direction — a fix that trades one violation for another lands here.
      const scan = await axeScan(el('tn-list'));

      expect(scan.violations).toEqual([]);
      // Not just violations: axe files a defect it cannot decide alone under
      // `incomplete`, and a dangling `aria-labelledby` reaches no other bucket.
      expect(scan.incomplete).toEqual([]);
      expect(scan.passed).toContain('aria-required-children');
    });
  });

  describe('a subheader inside a list', () => {
    beforeEach(async () => { fixture = await createHost(TestHostComponent); });

    it('is the listitem the list requires, with the heading one level in', () => {
      const subheader = el('tn-list-subheader');
      const heading = el('tn-list-subheader [role="heading"]');

      expect(subheader.getAttribute('role')).toBe('listitem');
      // Not both: two roles for one section is what a `listitem` host carrying
      // `aria-level` would announce.
      expect(subheader.getAttribute('aria-level')).toBeNull();
      expect(heading.getAttribute('aria-level')).toBe('3');
      expect(heading.textContent).toBe('Pools');
    });

    it('keeps the heading in the accessibility tree', async () => {
      const heading = el('tn-list-subheader [role="heading"]');

      const { violated, evaluated } = await axeResult(
        fixture.nativeElement,
        [heading],
        ['empty-heading', 'heading-order', 'aria-allowed-role']
      );

      expect(violated).toEqual([]);
      // The rule only matches an element axe reads AS a heading, so this is the
      // assertion that the heading survived the move rather than being dropped
      // to presentation — which is the failure mode the ticket names.
      expect(evaluated).toContain('empty-heading');
    });
  });

  describe('a divider inside a list', () => {
    beforeEach(async () => { fixture = await createHost(TestHostComponent); });

    it('is decorative, and drops the orientation that goes with the role', () => {
      const divider = el('tn-divider');

      expect(divider.getAttribute('role')).toBe('presentation');
      // `aria-orientation` is not global, so leaving it on a presentational
      // element trades aria-required-children for aria-allowed-attr.
      expect(divider.getAttribute('aria-orientation')).toBeNull();
    });

    it('is still drawn', () => {
      // Decorative means unannounced, not absent: the rule is a styled host, so
      // the class the stylesheet keys on is what "still there" means here.
      expect(el('tn-divider').classList.contains('tn-divider')).toBe(true);
    });

    it('is decorative in the attribute form too', () => {
      // The `[tnDivider]` form reaches the same answer through its own
      // directive. It used to declare `role="separator"` statically, and
      // matched `tn-divider` as well — a second, static source for the
      // component's own attribute.
      expect(el('div[tnDivider]').getAttribute('role')).toBe('presentation');
    });
  });

  describe('a divider inside a row of a list', () => {
    let nested: ComponentFixture<NestedDividerHostComponent>;

    beforeEach(async () => { nested = await createHost(NestedDividerHostComponent); });

    it('is still a separator, because the row owns it and not the list', async () => {
      const divider = nested.nativeElement.querySelector('tn-divider') as HTMLElement;
      expect(divider.getAttribute('role')).toBe('separator');
      expect(divider.getAttribute('aria-orientation')).toBe('horizontal');

      // And the list is still valid: what it owns is the row, which may hold
      // whatever it likes.
      const { violated } = await axeResult(
        nested.nativeElement,
        [nested.nativeElement.querySelector('tn-list') as HTMLElement],
        ['aria-required-children']
      );
      expect(violated).toEqual([]);
    });
  });

  describe('a divider under a presentational wrapper in a list', () => {
    let wrapped: ComponentFixture<PresentationalWrapperHostComponent>;

    beforeEach(async () => { wrapped = await createHost(PresentationalWrapperHostComponent); });

    it('is decorative, because presentation does not own anything', async () => {
      // `role="presentation"` takes the wrapper out of the accessibility tree
      // and leaves its children where they were, so the list still owns the
      // divider — a walk that stopped at the first role attribute would report
      // the wrapper as the owner and leave the separator role on.
      const divider = wrapped.nativeElement.querySelector('tn-divider') as HTMLElement;
      expect(divider.getAttribute('role')).toBe('presentation');

      const { violated } = await axeResult(
        wrapped.nativeElement,
        [wrapped.nativeElement.querySelector('tn-list') as HTMLElement],
        ['aria-required-children']
      );
      expect(violated).toEqual([]);
    });
  });

  describe('a divider projected into a list', () => {
    let projected: ComponentFixture<ProjectedHostComponent>;

    beforeEach(async () => { projected = await createHost(ProjectedHostComponent); });

    it('is decorative, though it was declared outside one', async () => {
      const divider = projected.nativeElement.querySelector('tn-divider') as HTMLElement;
      expect(divider.getAttribute('role')).toBe('presentation');

      const { violated } = await axeResult(
        projected.nativeElement,
        [projected.nativeElement.querySelector('tn-list') as HTMLElement],
        ['aria-required-children']
      );
      expect(violated).toEqual([]);
    });
  });

  describe('a divider projected into a list behind control flow', () => {
    let gated: ComponentFixture<GatedHostComponent>;

    /**
     * Attached to `ApplicationRef` and driven by the scheduler, which is how a
     * bootstrapped application runs and the only way this case can be asked
     * about honestly: the correction arrives after a render, and a fixture
     * driven by hand renders only when the test says so.
     */
    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [GatedHostComponent] })
        .compileComponents();
      gated = TestBed.createComponent(GatedHostComponent);
      gated.autoDetectChanges();
      await gated.whenStable();
    });

    it('is decorative once the application has settled', async () => {
      const divider = gated.nativeElement.querySelector('tn-divider') as HTMLElement;

      expect(divider.parentElement?.tagName).toBe('TN-LIST');
      expect(divider.getAttribute('role')).toBe('presentation');

      const { violated } = await axeResult(
        gated.nativeElement,
        [gated.nativeElement.querySelector('tn-list') as HTMLElement],
        ['aria-required-children']
      );
      expect(violated).toEqual([]);
    });
  });

  describe('a divider inside a listbox', () => {
    let listbox: ComponentFixture<ListboxHostComponent>;

    beforeEach(async () => { listbox = await createHost(ListboxHostComponent); });

    it('is decorative there too, because a listbox owns only option and group', async () => {
      const divider = listbox.nativeElement.querySelector('tn-divider') as HTMLElement;

      expect(divider.getAttribute('role')).toBe('presentation');

      const { violated, evaluated } = await axeResult(
        listbox.nativeElement,
        [listbox.nativeElement.querySelector('tn-selection-list') as HTMLElement],
        ['aria-required-children']
      );
      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-required-children');
    });
  });

  /**
   * #259. `listitem` is the LIST's answer to `aria-required-children` and is not
   * available here — a `listbox` owns `option` and `group` and no more — so the
   * subheader becomes the `group` and takes the section's text as its accessible
   * name.
   *
   * Moving the heading one level in, the way a list does, does NOT work here and
   * the case below proves it: axe reads THROUGH a `group` when it collects what
   * a listbox owns, so a group wrapping a `role="heading"` reports the same
   * violation with the heading named instead. The section is therefore announced
   * as a named group rather than as a heading, which is the route the ticket
   * asks for — what it rules out is `role="presentation"`, which would take the
   * text out of the tree altogether.
   *
   * The group holds the text and NOT the options that follow it. A subheader is
   * a sibling of the rows it introduces — it is projected content and has
   * nothing to wrap — so this names the section without enclosing it. A listbox
   * that wants its options genuinely grouped has to nest them, which is markup
   * for the consumer to write.
   */
  describe('a subheader inside a listbox', () => {
    let listbox: ComponentFixture<ListboxSubheaderHostComponent>;

    const find = <T extends HTMLElement>(selector: string): T => {
      const found = listbox.nativeElement.querySelector(selector) as T | null;
      if (!found) { throw new Error(`no element matched ${selector}`); }
      return found;
    };

    beforeEach(async () => { listbox = await createHost(ListboxSubheaderHostComponent); });

    it('reports no aria-required-children violation on the listbox', async () => {
      const { violated, evaluated } = await axeResult(
        listbox.nativeElement,
        [find('tn-selection-list')],
        ['aria-required-children'],
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-required-children');
    });

    it('is the group a listbox may own, and is not a heading anywhere', () => {
      const subheader = find('tn-list-subheader');

      expect(subheader.getAttribute('role')).toBe('group');
      // Neither on the host nor one level in. Both are the violation, in the
      // two shapes this component can produce them — see the docblock above.
      expect(subheader.getAttribute('aria-level')).toBeNull();
      expect(subheader.querySelectorAll('[role="heading"]')).toHaveLength(0);
    });

    it('keeps the section text in the accessibility tree, as the group name', () => {
      const subheader = find('tn-list-subheader');
      const text = find('tn-list-subheader span');

      // The assertion the ticket's criterion is about: dropping the role is
      // only correct while the text is still announced, and a `role="group"`
      // that resolved to no name would announce nothing at all.
      expect(subheader.getAttribute('aria-labelledby')).toBe(text.id);
      expect(text.id).not.toBe('');
      expect(accessibleName(subheader)).toBe('Personal');
    });

    it('positive control: the pre-#259 roles still fail the same rule', async () => {
      // The shape this ticket removed, rebuilt by hand — without it, the empty
      // `violated` above is also what an axe upgrade that stopped matching this
      // markup looks like.
      const panel = document.createElement('div');
      panel.setAttribute('role', 'listbox');
      panel.setAttribute('aria-label', 'Mailboxes');
      panel.innerHTML =
        '<div role="heading" aria-level="3">Personal</div>'
        + '<div role="option" aria-selected="false">Inbox</div>';
      document.body.appendChild(panel);

      try {
        const { violated } = await axeResult(panel, [panel], ['aria-required-children']);

        expect(violated).toEqual(['aria-required-children']);
      } finally {
        panel.remove();
      }
    });

    it('control: a group around the heading does not rescue it either', async () => {
      // The list's answer — move the heading one level in — applied to a
      // listbox, which is the obvious fix and the wrong one. axe reads through
      // a `group` when it collects what a listbox owns, so the heading is still
      // reported as a child of the listbox. This is why the heading role is
      // dropped inside a listbox rather than relocated, and it is asserted
      // rather than described because the reason is entirely in axe's
      // behaviour.
      const panel = document.createElement('div');
      panel.setAttribute('role', 'listbox');
      panel.setAttribute('aria-label', 'Mailboxes');
      panel.innerHTML =
        '<div role="group"><span role="heading" aria-level="3">Personal</span></div>'
        + '<div role="option" aria-selected="false">Inbox</div>';
      document.body.appendChild(panel);

      try {
        const { violated } = await axeResult(panel, [panel], ['aria-required-children']);

        expect(violated).toEqual(['aria-required-children']);
      } finally {
        panel.remove();
      }
    });
  });

  describe('outside a list', () => {
    let standalone: ComponentFixture<StandaloneHostComponent>;

    beforeEach(async () => { standalone = await createHost(StandaloneHostComponent); });

    it('tn-divider keeps role="separator" and its orientation', () => {
      const divider = standalone.nativeElement.querySelector('tn-divider') as HTMLElement;

      expect(divider.getAttribute('role')).toBe('separator');
      expect(divider.getAttribute('aria-orientation')).toBe('horizontal');
    });

    it('tn-list-subheader keeps the heading on its host', () => {
      const subheader = standalone.nativeElement.querySelector(
        'tn-list-subheader'
      ) as HTMLElement;

      expect(subheader.getAttribute('role')).toBe('heading');
      expect(subheader.getAttribute('aria-level')).toBe('3');
      // And exactly one heading: the inner span is unmarked here.
      expect(subheader.querySelectorAll('[role="heading"]').length).toBe(0);
    });
  });
});
