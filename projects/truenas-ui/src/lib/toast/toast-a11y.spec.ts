import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import axe from 'axe-core';
import { TnToastComponent } from './toast.component';
import { TnToastType } from './toast.types';

/**
 * Guards the live-region contract fixed for #190: the toast carried
 * `role="alert"` and `aria-live="polite"` on the same element. `alert` implies
 * `aria-live="assertive"`, so the explicit attribute overrode it and the
 * element claimed to be an alert while asking not to interrupt — with which of
 * the two wins left to the screen reader. The cost landed on the `error` toast,
 * the one case that most needs to interrupt.
 *
 * WHY THE POLITENESS IS READ THROUGH THE ROLE, AND NOT ASSERTED DIRECTLY
 * ---------------------------------------------------------------------
 * The defect was two sources disagreeing, so a test naming one attribute would
 * pass just as happily on markup that reintroduced the other. `politeness()`
 * below therefore resolves what a screen reader would resolve — implicit from
 * the role, explicit from `aria-live` — and `liveSources()` counts how many
 * were on offer. One assertion for what it announces, one for there being a
 * single thing saying so.
 *
 * WHAT AXE DOES NOT CATCH, WHICH IS WHY THE DOM TESTS COME FIRST
 * -------------------------------------------------------------
 * `aria-live` is a global ARIA attribute, so it is *allowed* on `role="alert"`
 * — `aria-allowed-attr` passes on the broken markup and no other axe-core
 * 4.10.3 rule fires either. Measured against the pre-fix template, not assumed:
 * the conflict is a contradiction between two valid attributes, which is not a
 * shape a rule-per-attribute linter can see.
 *
 * So the assertions that hold this fix in place are the DOM ones. The axe block
 * is a forward guard, and it asserts `evaluated` for the reason
 * `slide-toggle-a11y.spec.ts` (#189) does: an empty `violations` is also what
 * axe returns when it ran nothing at all.
 */

/** Politeness each live-region role implies, per ARIA 1.2. */
const IMPLICIT_POLITENESS: Record<string, string> = {
  alert: 'assertive',
  status: 'polite',
  log: 'polite',
  marquee: 'off',
  timer: 'off',
};

describe('tn-toast accessibility (#190)', () => {
  let fixture: ComponentFixture<TnToastComponent>;
  let component: TnToastComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnToastComponent]
    }).compileComponents();

    // TestBed attaches the fixture to the document, which axe needs: it walks up
    // to the document root to decide visibility and treats a detached tree as
    // hidden, and therefore exempt from every rule below.
    fixture = TestBed.createComponent(TnToastComponent);
    component = fixture.componentInstance;
    component.message.set('Changes saved');
    fixture.detectChanges();
  });

  function region(type: TnToastType): HTMLElement {
    component.type.set(type);
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('.tn-toast') as HTMLElement;
  }

  /**
   * Every attribute on `el` that declares a politeness, as `attr=value` pairs.
   *
   * A live-region ROLE counts as one of them: that is the whole point of #190,
   * where the second source was implicit and so easy to leave in place. A role
   * that is not a live region (or none at all) contributes nothing.
   */
  function liveSources(el: HTMLElement): string[] {
    const sources: string[] = [];
    const role = el.getAttribute('role');
    if (role !== null && role in IMPLICIT_POLITENESS) {
      sources.push(`role=${role}`);
    }
    const live = el.getAttribute('aria-live');
    if (live !== null) {
      sources.push(`aria-live=${live}`);
    }
    return sources;
  }

  /**
   * What a screen reader resolves the politeness to.
   *
   * An explicit `aria-live` beats the role's implicit value, which is exactly
   * how the broken markup turned an alert into a polite one.
   */
  function politeness(el: HTMLElement): string {
    const live = el.getAttribute('aria-live');
    if (live !== null) {
      return live;
    }
    const role = el.getAttribute('role');
    return (role !== null && IMPLICIT_POLITENESS[role]) || 'off';
  }

  /**
   * `{violated, evaluated}` for `rules`, counting only what axe said about `el`
   * ITSELF.
   *
   * The per-element filter is the point. A rule lands in `passes` if it matched
   * anywhere in the tree, and `tn-icon` renders `aria-label` and `aria-hidden`
   * — so a tree-wide `evaluated` reports `aria-allowed-attr` as run whether or
   * not it ever looked at the toast. That is not a hypothetical: this spec
   * asserted exactly that, and the assertion was satisfied by the icon, because
   * removing `aria-live` left the toast with no `aria-*` attribute for the rule
   * to match. A guard on the wrong element is the vacuous guard the header note
   * warns about, wearing the costume of a fix.
   *
   * `elementRef` is what makes the filter identity-based; without it a node
   * result carries only a CSS selector, and comparing those compares strings.
   */
  async function axeResult(
    el: HTMLElement, rules: string[]
  ): Promise<{ violated: string[]; evaluated: string[] }> {
    const results = await axe.run(fixture.nativeElement as HTMLElement, {
      runOnly: { type: 'rule', values: rules },
      elementRef: true,
    });
    const touches = (rule: axe.Result): boolean =>
      rule.nodes.some((node) => (node as { element?: Element }).element === el);
    return {
      violated: results.violations.filter(touches).map((v) => v.id),
      evaluated: [...results.violations, ...results.passes, ...results.incomplete]
        .filter(touches).map((v) => v.id),
    };
  }

  describe('exactly one source of politeness', () => {
    // The pre-fix markup returned ['role=alert', 'aria-live=polite'] here, for
    // every type. This is the assertion that failed before the fix.
    it.each(Object.values(TnToastType))('declares politeness once on a %s toast', (type) => {
      expect(liveSources(region(type))).toHaveLength(1);
    });
  });

  describe('politeness follows the toast type', () => {
    it('interrupts for an error, which is the case that needs to', () => {
      expect(politeness(region(TnToastType.Error))).toBe('assertive');
    });

    it.each([TnToastType.Info, TnToastType.Success, TnToastType.Warning])(
      'does not interrupt for a %s toast',
      (type) => {
        expect(politeness(region(type))).toBe('polite');
      }
    );

    // Politeness is only honoured on something that IS a live region: drop the
    // role and `politeness()` above would still read an explicit `aria-live`
    // that no screen reader watches. Naming the two roles pins which mechanism
    // carries it, so a later edit cannot satisfy the assertions above with an
    // attribute alone.
    it('carries the politeness on a live-region role', () => {
      expect(region(TnToastType.Error).getAttribute('role')).toBe('alert');
      expect(region(TnToastType.Info).getAttribute('role')).toBe('status');
    });
  });

  describe('axe', () => {
    // `aria-roles` is the rule asserted as evaluated because it is the one that
    // still MATCHES the toast after the fix: it selects on the `role` attribute,
    // which is now the element's only ARIA marking. The attribute-value rules
    // are worth running — a typo'd role would be caught by neither of the DOM
    // suites above, which compare against the two expected spellings — but they
    // match no node here, so requiring them in `evaluated` would fail on
    // correct markup.
    it.each(Object.values(TnToastType))('raises no ARIA violation on a %s toast', async (type) => {
      const el = region(type);

      const { violated, evaluated } = await axeResult(el, [
        'aria-allowed-attr', 'aria-valid-attr-value', 'aria-roles'
      ]);

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-roles');
    });
  });
});
