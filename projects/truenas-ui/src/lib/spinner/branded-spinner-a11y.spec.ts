import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TnBrandedSpinnerComponent } from './branded-spinner.component';
import { axeResult } from '../a11y/axe-testing';
import { TN_BRANDED_SPINNER_DEFAULT_LABEL } from '../a11y/fallback-labels';

/**
 * The third progressbar (#206). `tn-progress-bar` and `tn-spinner` were fixed by
 * #202/#205; this one was missed because it never failed `aria-progressbar-name`
 * — it had a fallback name inline in its host binding all along.
 *
 * So what is asserted here is NOT that a violation went away. It is that this
 * component now names itself by the same rule as the other two: an
 * `ariaLabelledby` input it did not have, and a dev-mode warning it did not
 * raise. Measured before the change, under jsdom:
 *
 *   default markup   aria-progressbar-name -> no violation on [tn-branded-spinner]
 *   ariaLabelledby   not an input; binding it is a template error
 *   unnamed          console.warn not called
 *
 * The axe assertions below therefore guard against a regression rather than
 * record a fix — extracting the shared helper is the change, and silently
 * dropping the fallback while doing it is what they exist to catch.
 */

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnBrandedSpinnerComponent],
  template: `<span id="tn-external-label">Restoring pool</span>
    <tn-branded-spinner [ariaLabel]="ariaLabel()" [ariaLabelledby]="ariaLabelledby()" />`
})
class TestHostComponent {
  ariaLabel = signal<string | null>(null);
  ariaLabelledby = signal<string | null>(null);
}

describe('tn-branded-spinner accessibility (#206)', () => {
  let host: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let warn: jest.SpyInstance;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    // Silenced rather than merely observed: the component warns on every
    // unnamed spinner by design, and most fixtures in this file are unnamed.
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    // TestBed attaches the fixture to the document, which axe needs: it walks up
    // to the document root to decide visibility and treats a detached tree as
    // hidden, and therefore exempt from every rule below.
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Destroyed rather than left to the next test: this component drives a
    // requestAnimationFrame loop from ngAfterViewInit and only cancels it in
    // ngOnDestroy, so a fixture that is never destroyed keeps animating for the
    // rest of the run.
    fixture.destroy();
    warn.mockRestore();
  });

  function spinner(): HTMLElement {
    return fixture.nativeElement.querySelector('tn-branded-spinner') as HTMLElement;
  }

  describe('aria-progressbar-name', () => {
    // `evaluated` is asserted alongside every empty `violated`, because an empty
    // `violations` is also what axe returns when it evaluated nothing at all.
    // It is non-vacuous here: the rule selects on `role="progressbar"`, which is
    // the host itself and the only such node in the fixture.
    it('names a spinner that was given no label', async () => {
      const { violated, evaluated } = await axeResult(
        fixture.nativeElement, spinner(), ['aria-progressbar-name']
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-progressbar-name');
    });

    it('raises no violation when ariaLabel is set', async () => {
      host.ariaLabel.set('Loading datasets');
      fixture.detectChanges();

      const { violated, evaluated } = await axeResult(
        fixture.nativeElement, spinner(), ['aria-progressbar-name']
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-progressbar-name');
    });

    it('raises no violation when ariaLabelledby is set', async () => {
      host.ariaLabelledby.set('tn-external-label');
      fixture.detectChanges();

      const { violated, evaluated } = await axeResult(
        fixture.nativeElement, spinner(), ['aria-progressbar-name']
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-progressbar-name');
    });

    /**
     * Positive control. Every expectation above is `toEqual([])`, which is also
     * what axe returns when it evaluated nothing — so one fixture has to prove
     * the rule still objects to the shape it is meant to object to.
     *
     * Unlike the controls in `spinner-a11y.spec.ts` and
     * `progress-bar-a11y.spec.ts`, this is NOT the markup the component used to
     * ship: `tn-branded-spinner` has always carried a fallback name, which is
     * exactly why #202 did not find it. It is the markup this component would
     * render if the extraction in #206 dropped that fallback — the regression
     * the assertions above are guarding.
     */
    it('reports the violation for a branded spinner with the fallback dropped', async () => {
      const unnamed = document.createElement('div');
      unnamed.innerHTML = '<div role="progressbar" class="tn-branded-spinner"></div>';
      document.body.appendChild(unnamed);

      // try/finally, because `axeResult` throws rather than returning a vacuous
      // pass — and a fixture left in `document.body` by that throw would be
      // scanned by every later test in this file.
      let violated: string[];
      try {
        ({ violated } = await axeResult(
          unnamed, unnamed.querySelector('[role="progressbar"]'), ['aria-progressbar-name']
        ));
      } finally {
        unnamed.remove();
      }

      expect(violated).toEqual(['aria-progressbar-name']);
    });
  });

  describe('where the name comes from', () => {
    it('falls back to the default label when neither input is set', () => {
      expect(spinner().getAttribute('aria-label')).toBe(TN_BRANDED_SPINNER_DEFAULT_LABEL);
    });

    // The name this component already rendered, pinned by literal rather than by
    // the constant, so that moving the fallback into the shared helper cannot
    // quietly change what a caller hears.
    it('keeps the "Loading..." default this component already shipped', () => {
      expect(spinner().getAttribute('aria-label')).toBe('Loading...');
    });

    it('prefers an explicit ariaLabel over the fallback', () => {
      host.ariaLabel.set('Loading datasets');
      fixture.detectChanges();

      expect(spinner().getAttribute('aria-label')).toBe('Loading datasets');
    });

    it('treats a blank ariaLabel as no label at all', () => {
      host.ariaLabel.set('   ');
      fixture.detectChanges();

      expect(spinner().getAttribute('aria-label')).toBe(TN_BRANDED_SPINNER_DEFAULT_LABEL);
    });

    /**
     * `aria-labelledby` wins over `aria-label` only while its IDREF RESOLVES, so
     * the generic fallback is withheld beside one — there it would mask a
     * dangling reference with a name that says nothing — while an explicit
     * `ariaLabel` is not, because it is the only name left when the reference
     * does not resolve. These are that pair and its regression, matching
     * `spinner-a11y.spec.ts` case for case, which is the point of the ticket.
     */
    it('withholds the generic fallback when only ariaLabelledby is set', () => {
      host.ariaLabelledby.set('tn-external-label');
      fixture.detectChanges();

      expect(spinner().getAttribute('aria-labelledby')).toBe('tn-external-label');
      expect(spinner().hasAttribute('aria-label')).toBe(false);
    });

    it('keeps an explicit ariaLabel alongside ariaLabelledby', () => {
      host.ariaLabel.set('Loading datasets');
      host.ariaLabelledby.set('tn-external-label');
      fixture.detectChanges();

      expect(spinner().getAttribute('aria-labelledby')).toBe('tn-external-label');
      expect(spinner().getAttribute('aria-label')).toBe('Loading datasets');
    });

    it('omits aria-labelledby when the input is not set', () => {
      expect(spinner().hasAttribute('aria-labelledby')).toBe(false);
    });

    it('still names the spinner when ariaLabelledby points at nothing', async () => {
      host.ariaLabel.set('Loading datasets');
      host.ariaLabelledby.set('tn-no-such-element');
      fixture.detectChanges();

      const { violated, evaluated } = await axeResult(
        fixture.nativeElement, spinner(), ['aria-progressbar-name']
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-progressbar-name');
    });

    /**
     * The evidence for withholding the generic fallback beside an
     * `ariaLabelledby` — a dangling IDREF alone is still a violation, so it is
     * reported rather than papered over — and equally what stops the test above
     * passing for free, by showing that axe resolves the IDREF rather than
     * treating any `aria-labelledby` as a name.
     */
    it('reports a spinner whose only name is an ariaLabelledby pointing at nothing', async () => {
      host.ariaLabelledby.set('tn-no-such-element');
      fixture.detectChanges();

      const { violated } = await axeResult(
        fixture.nativeElement, spinner(), ['aria-progressbar-name']
      );

      expect(violated).toEqual(['aria-progressbar-name']);
    });

    it('reinstates the fallback if the caller clears ariaLabel again', () => {
      host.ariaLabel.set('Loading datasets');
      fixture.detectChanges();
      host.ariaLabel.set(null);
      fixture.detectChanges();

      expect(spinner().getAttribute('aria-label')).toBe(TN_BRANDED_SPINNER_DEFAULT_LABEL);
    });
  });

  /**
   * The half this component was missing outright. Its inline fallback already
   * kept a forgotten label from reaching assistive technology as silence; what
   * it had no answer for was the same label reaching the DEVELOPER as silence,
   * which is why a spinner nobody named looked correct by every check the
   * library could run.
   */
  describe('the dev-mode warning', () => {
    function messages(): string[] {
      return warn.mock.calls.map((call) => String(call[0]));
    }

    it('warns, naming the component, when neither input is set', () => {
      expect(messages()).toHaveLength(1);
      expect(messages()[0]).toContain('tn-branded-spinner');
      expect(messages()[0]).toContain('ariaLabel');
    });

    it('does not warn when ariaLabel is set from the start', () => {
      warn.mockClear();
      const named = TestBed.createComponent(TestHostComponent);
      named.componentInstance.ariaLabel.set('Loading datasets');
      named.detectChanges();
      named.destroy();

      expect(warn).not.toHaveBeenCalled();
    });

    it('does not warn when ariaLabelledby is set from the start', () => {
      warn.mockClear();
      const named = TestBed.createComponent(TestHostComponent);
      named.componentInstance.ariaLabelledby.set('tn-external-label');
      named.detectChanges();
      named.destroy();

      expect(warn).not.toHaveBeenCalled();
    });

    // One warning per spinner that stays unnamed, not one per change detection:
    // a per-cycle warning on a spinner that is animating by definition floods
    // the console and trains developers to ignore it.
    it('warns once, however many times the spinner is re-rendered', () => {
      fixture.detectChanges();
      fixture.detectChanges();

      expect(messages()).toHaveLength(1);
    });

    it('stops warning once the spinner is named', () => {
      host.ariaLabel.set('Loading datasets');
      fixture.detectChanges();
      warn.mockClear();
      fixture.detectChanges();

      expect(warn).not.toHaveBeenCalled();
    });
  });

  /**
   * #206 is about the name only. This is what it must not disturb — the branded
   * spinner is indeterminate by construction and carries no value range, so the
   * role is the whole of the rest of its ARIA surface.
   */
  it('keeps the progressbar role', () => {
    expect(spinner().getAttribute('role')).toBe('progressbar');
  });
});
