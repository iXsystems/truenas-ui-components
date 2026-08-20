import { ApplicationRef } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import axe from 'axe-core';
import { TnToastComponent } from './toast.component';
import { TN_TOAST_ANNOUNCE_DELAY_MS, TnToastService } from './toast.service';
import { TnToastType } from './toast.types';
import { TnIconTesting } from '../icon/icon-testing';

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

/**
 * Guards the live-region TIMING fixed for #195, which is the other half of
 * making a toast announce: #190 settled WHAT the region says it is, this
 * settles WHEN its content arrives.
 *
 * A screen reader reports a *change* to a live region's content. The service
 * set `message` on the component instance and only then appended the host, so
 * the region and its text entered the DOM in one mutation and there was no
 * change to report. `role="alert"` survives that — readers special-case an
 * alert appearing already populated — but `role="status"`, which info, success
 * and warning toasts carry, is announced unreliably that way and on several
 * readers not at all.
 *
 * WHY THESE ASSERTIONS ARE PAIRED, AND READ THE SAME ELEMENT TWICE
 * ---------------------------------------------------------------
 * Neither sample means anything alone. "Empty at insertion" is satisfied by a
 * toast that never populates, and "populated afterwards" by the pre-fix code.
 * The contract is the transition between them, so each test asserts both ends
 * and that `region()` returns the SAME node at each — a service that replaced
 * the element instead of mutating it would satisfy both samples while giving a
 * reader a fresh region it was never watching.
 *
 * WHY THIS SUITE DRIVES THE SERVICE AND NOT A FIXTURE
 * --------------------------------------------------
 * The defect is in the order of the service's own steps — set, attach, render
 * — and a component fixture is attached before a test can observe anything.
 * There is nothing here a `TnToastComponent` fixture could fail on.
 */
describe('tn-toast live-region timing (#195)', () => {
  let service: TnToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TnIconTesting.jest.providers()],
    });
    service = TestBed.inject(TnToastService);
  });

  afterEach(() => {
    document.querySelectorAll('tn-toast').forEach((el) => el.remove());
  });

  /**
   * The live region in the document, asserted to be RENDERED — its bindings
   * applied, not merely created.
   *
   * That distinction is the difference between these tests and vacuous ones.
   * `createComponent` runs the template's create pass, so `.tn-toast` is in the
   * DOM before any change detection has applied a binding: no `role`, and
   * `{{ message() }}` still empty. A region carrying no role is not one a
   * screen reader watches, and "empty at insertion" is satisfied by it — so
   * three of the tests below passed against the pre-fix service until this
   * helper read `role`. Measured, not assumed.
   *
   * Read from `document` rather than a fixture because when the element gets
   * there, and in what state, is the whole subject.
   */
  function renderedRegion(): HTMLElement {
    const el = document.querySelector('.tn-toast');
    expect(el).not.toBeNull();
    expect((el as HTMLElement).getAttribute('role')).not.toBeNull();
    return el as HTMLElement;
  }

  /** The message text a screen reader would announce out of `el`. */
  function messageOf(el: HTMLElement): string {
    return (el.querySelector('.tn-toast__message')?.textContent ?? '').trim();
  }

  /**
   * Reach the step the service defers the message to, then render it.
   *
   * The explicit `ApplicationRef.tick()` is because setting a signal only marks
   * the view dirty — nothing in a TestBed zone test renders it on its own.
   */
  function announceStep(): void {
    tick(TN_TOAST_ANNOUNCE_DELAY_MS);
    TestBed.inject(ApplicationRef).tick();
  }

  describe('the region is inserted empty and populated afterwards', () => {
    it.each([TnToastType.Info, TnToastType.Success, TnToastType.Warning])(
      'gives a polite %s toast a content change to announce',
      fakeAsync((type: TnToastType) => {
        service.open('Changes saved', { type, duration: 0 });

        const el = renderedRegion();
        // In the document — an unattached region is one no reader is watching,
        // so populating it later would announce nothing either.
        expect(document.body.contains(el)).toBe(true);
        expect(el.getAttribute('role')).toBe('status');
        expect(messageOf(el)).toBe('');

        announceStep();

        expect(renderedRegion()).toBe(el);
        expect(messageOf(el)).toBe('Changes saved');
      })
    );

    // Error toasts were never the broken case, and the deferral does not cost
    // them anything: a change to an `alert` region is announced just as its
    // populated insertion was. Asserted because it is what #195 must not break.
    it('keeps an error toast announcing, on the role that interrupts', fakeAsync(() => {
      service.open('Save failed', { type: TnToastType.Error, duration: 0 });

      const el = renderedRegion();
      expect(el.getAttribute('role')).toBe('alert');
      expect(messageOf(el)).toBe('');

      announceStep();

      expect(renderedRegion()).toBe(el);
      expect(messageOf(el)).toBe('Save failed');
    }));

    // An action label is set before the host is attached, so this region is
    // NOT empty at insertion — and it does not need to be. What a reader
    // reports is the mutation, and the message still arrives as one.
    it('announces a toast whose region already carries an action label', fakeAsync(() => {
      service.open('Item deleted', 'Undo', { duration: 0 });

      const el = renderedRegion();
      expect(el.querySelector('.tn-toast__action')?.textContent?.trim()).toBe('Undo');
      expect(messageOf(el)).toBe('');

      announceStep();

      expect(renderedRegion()).toBe(el);
      expect(messageOf(el)).toBe('Item deleted');
    }));
  });

  describe('a toast dismissed before its frame never announces', () => {
    it('leaves a superseded toast silent, and announces the one that replaced it', fakeAsync(() => {
      service.open('First', { duration: 0 });
      const first = renderedRegion();

      // Dismisses the first synchronously, while its frame is still pending.
      service.open('Second', { duration: 0 });

      announceStep();

      const regions = document.querySelectorAll('.tn-toast');
      expect(regions).toHaveLength(2);
      // The first is still attached — it is removed 200ms later — so a reader
      // is still watching it. Populating it now would announce a message the
      // user was never shown.
      expect(messageOf(first)).toBe('');
      expect(messageOf(regions[1] as HTMLElement)).toBe('Second');

      tick(200);
    }));
  });

  describe('the visible behaviour is unchanged', () => {
    it('never shows the empty region, and still runs the enter transition', fakeAsync(() => {
      service.open('Changes saved', { duration: 0 });

      const el = renderedRegion();
      // `.tn-toast` is `opacity: 0` until `--visible`, so this is the empty
      // region being invisible rather than merely off-screen.
      expect(messageOf(el)).toBe('');
      expect(el.classList.contains('tn-toast--visible')).toBe(false);

      announceStep();

      // Both land in the one frame: the toast becomes visible in the same
      // render that gives it something to say, so there is no empty flash.
      expect(messageOf(el)).toBe('Changes saved');
      expect(el.classList.contains('tn-toast--visible')).toBe(true);
    }));
  });
});
