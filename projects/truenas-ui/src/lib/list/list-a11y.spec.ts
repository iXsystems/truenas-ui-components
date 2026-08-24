import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TnListComponent } from './list.component';
import { axeResult, axeScan } from '../a11y/axe-testing';
import { TnDividerComponent } from '../divider/divider.component';
import { TnDividerDirective, TnListItemTitleDirective } from '../list-directives/list-directives';
import { TnListItemComponent } from '../list-item/list-item.component';
import { TnListSubheaderComponent } from '../list-subheader/list-subheader.component';

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
  // imported because the story imports it, and it matches `tn-divider` too —
  // which is how a second `role="separator"` used to reach the element.
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  describe('the list as a whole', () => {
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

    it('carries no separator role from the directive that also matches it', () => {
      // `TnDividerDirective` matches `tn-divider` as well as `[tnDivider]`, and
      // used to declare `role="separator"` statically — which no binding on the
      // component can be relied on to overwrite.
      expect(el('div[tnDivider]').getAttribute('role')).toBeNull();
    });
  });

  describe('a divider inside a row of a list', () => {
    it('is still a separator, because the row owns it and not the list', async () => {
      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({ imports: [NestedDividerHostComponent] })
        .compileComponents();
      const nested = TestBed.createComponent(NestedDividerHostComponent);
      nested.detectChanges();

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

  describe('a divider projected into a list', () => {
    it('is decorative, though it was declared outside one', async () => {
      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({ imports: [ProjectedHostComponent] })
        .compileComponents();
      const projected = TestBed.createComponent(ProjectedHostComponent);
      projected.detectChanges();

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

  describe('outside a list', () => {
    let standalone: ComponentFixture<StandaloneHostComponent>;

    beforeEach(async () => {
      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({ imports: [StandaloneHostComponent] })
        .compileComponents();
      standalone = TestBed.createComponent(StandaloneHostComponent);
      standalone.detectChanges();
    });

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
