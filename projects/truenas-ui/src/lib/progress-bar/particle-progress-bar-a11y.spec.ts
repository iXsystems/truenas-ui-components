import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import {
  TnParticleProgressBarComponent,
  TN_PARTICLE_PROGRESS_BAR_DEFAULT_LABEL
} from './particle-progress-bar.component';
import { axeResult } from '../a11y/axe-testing';

/**
 * #209: the fourth component in this library shaped like a progress bar, and
 * the first that no check could have found.
 *
 * `tn-progress-bar` and `tn-spinner` were found by failing
 * `aria-progressbar-name` (#202/#205). `tn-branded-spinner` failed nothing and
 * was found by a human reading the folder (#206). This one is a step further
 * again: it never claimed `role="progressbar"`, and a rule that selects on the
 * role cannot report on an element that does not carry it. Measured on the
 * unchanged component under jsdom, over five rules a progressbar can fail:
 *
 *   host attributes   class="tn-particle-progress-bar"  — and nothing else
 *   role              null
 *   aria-*            none
 *   text content      ""
 *   axe               0 violations, 0 passes, 0 incomplete
 *
 * Zero passes is the part that matters, and it is why this file leads with a
 * test that keeps that measurement rather than merely describing it: an empty
 * `violations` reads as a clean bill of health, and here it meant axe had not
 * looked at anything at all. `axe-testing.ts` exists for exactly that
 * confusion, and `evaluated` is asserted beside every empty `violated` below.
 *
 * The reasoning for answering "progressbar" rather than "decoration" is on the
 * component, where a reader meets it before the attributes it produced.
 */

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnParticleProgressBarComponent],
  template: `<span id="tn-external-label">Restoring pool</span>
    <tn-particle-progress-bar [width]="width()" [fill]="fill()"
      [ariaLabel]="ariaLabel()" [ariaLabelledby]="ariaLabelledby()" />`
})
class TestHostComponent {
  width = signal(600);
  fill = signal(300);
  ariaLabel = signal<string | null>(null);
  ariaLabelledby = signal<string | null>(null);
}

/**
 * The rules a progressbar in this library can fail. Named as a list so that a
 * rule which stops matching shows up as a shrinking `evaluated` in one place,
 * rather than as a quietly narrower scan in whichever test happened to name it.
 *
 * Two fixtures below deliberately do NOT use it — the ones whose
 * `aria-labelledby` dangles, where `aria-valid-attr-value` is undecidable. The
 * reason is written beside them.
 */
const PROGRESSBAR_RULES = [
  'aria-progressbar-name',
  'aria-required-attr',
  'aria-valid-attr-value',
  'aria-allowed-attr'
];

describe('tn-particle-progress-bar accessibility (#209)', () => {
  let host: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let warn: jest.SpyInstance;

  beforeEach(async () => {
    // jsdom has no canvas implementation, so `getContext` returns null and the
    // component's `ngAfterViewInit` would throw on the first `clearRect`. Stubbed
    // on the prototype rather than by replacing `canvasRef` as
    // `particle-progress-bar.component.spec.ts` does: that spec is about the
    // drawing, this one is about the DOM, and it needs the real template rendered.
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      clearRect: jest.fn(), beginPath: jest.fn(), arc: jest.fn(), fill: jest.fn(), fillStyle: ''
    } as unknown as CanvasRenderingContext2D);
    // Returns a handle without ever invoking the callback, so `animate` runs the
    // one synchronous pass `ngAfterViewInit` triggers and does not schedule a
    // loop that would outlive the test.
    jest.spyOn(window, 'requestAnimationFrame').mockReturnValue(123);

    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    // Silenced rather than merely observed: the component warns on every unnamed
    // bar by design, and most fixtures in this file are unnamed.
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    // TestBed attaches the fixture to the document, which axe needs: it walks up
    // to the document root to decide visibility and treats a detached tree as
    // hidden, and therefore exempt from every rule below.
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Destroyed rather than left to the next test: the component drives a
    // requestAnimationFrame loop from `ngAfterViewInit` and cancels it only in
    // `ngOnDestroy`.
    fixture.destroy();
    jest.restoreAllMocks();
  });

  function bar(): HTMLElement {
    return fixture.nativeElement.querySelector('tn-particle-progress-bar') as HTMLElement;
  }

  /**
   * The reported defect, kept as a test rather than as a paragraph.
   *
   * This rebuilds the markup the component shipped before #209 — the host class,
   * the SVG, the canvas, and no role — and requires axe to still evaluate
   * NOTHING on it. It is the control for every `expect(violated).toEqual([])`
   * in this file: on this markup that same assertion passed, and meant nothing.
   *
   * If a future axe-core starts reporting on a roleless div like this one, this
   * test fails. That is the correct response, not a nuisance: it would mean the
   * library had gained a check that could have found this component on its own,
   * and the comment above about how it was found needs rewriting.
   */
  it('evaluated nothing at all on the markup this component used to have', async () => {
    const previous = document.createElement('div');
    previous.innerHTML =
      '<div class="tn-particle-progress-bar">'
      + '<svg width="600" height="40">'
      + '<rect x="50" width="500" height="20"></rect>'
      + '<rect x="50" width="300" height="20"></rect>'
      + '<foreignObject x="0" y="0" width="600" height="40">'
      + '<canvas width="600" height="40"></canvas>'
      + '</foreignObject>'
      + '</svg></div>';
    document.body.appendChild(previous);

    // try/finally, because `axeResult` throws rather than returning a vacuous
    // pass — and a fixture left in `document.body` by that throw would be
    // scanned by every later test in this file.
    let violated: string[];
    let evaluated: string[];
    try {
      ({ violated, evaluated } = await axeResult(
        previous, previous.querySelector('.tn-particle-progress-bar'), PROGRESSBAR_RULES
      ));
    } finally {
      previous.remove();
    }

    expect(violated).toEqual([]);
    expect(evaluated).toEqual([]);
  });

  describe('the rules a progressbar can fail', () => {
    // `evaluated` is asserted alongside every empty `violated`, because an empty
    // `violations` is also what axe returns when it evaluated nothing at all —
    // which is precisely what it returned on this component before #209.
    it('is clean, and is actually examined, in its default state', async () => {
      const { violated, evaluated } = await axeResult(
        fixture.nativeElement, bar(), PROGRESSBAR_RULES
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-progressbar-name');
    });

    it('raises no violation when ariaLabel is set', async () => {
      host.ariaLabel.set('Restoring pool');
      fixture.detectChanges();

      const { violated, evaluated } = await axeResult(
        fixture.nativeElement, bar(), PROGRESSBAR_RULES
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-progressbar-name');
    });

    it('raises no violation when ariaLabelledby is set', async () => {
      host.ariaLabelledby.set('tn-external-label');
      fixture.detectChanges();

      const { violated, evaluated } = await axeResult(
        fixture.nativeElement, bar(), PROGRESSBAR_RULES
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-progressbar-name');
    });

    it('raises no violation with no value range to report', async () => {
      host.width.set(100);
      fixture.detectChanges();

      const { violated, evaluated } = await axeResult(
        fixture.nativeElement, bar(), PROGRESSBAR_RULES
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-progressbar-name');
    });

    /**
     * Positive control, and the only assertion here that shows axe FAILING
     * rather than passing. It is equally the control for the shared `axeResult`
     * wrapper: an attribution bug there would empty `violated` in every spec
     * that uses it, and every expectation above would still be green.
     *
     * The shape is what this component would render if the fix kept the role
     * and lost the name — the regression the assertions above guard.
     */
    it('reports the violation for a particle bar with the role but no name', async () => {
      const unnamed = document.createElement('div');
      unnamed.innerHTML =
        '<div role="progressbar" class="tn-particle-progress-bar" '
        + 'aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"></div>';
      document.body.appendChild(unnamed);

      let violated: string[];
      try {
        ({ violated } = await axeResult(
          unnamed, unnamed.querySelector('[role="progressbar"]'), PROGRESSBAR_RULES
        ));
      } finally {
        unnamed.remove();
      }

      expect(violated).toEqual(['aria-progressbar-name']);
    });
  });

  /**
   * The answer to the ticket's question, asserted on the markup rather than
   * only argued in a comment: the host claims the role, and the drawing that
   * carries no information is hidden.
   */
  describe('the decision, as markup', () => {
    it('claims the progressbar role on the host', () => {
      expect(bar().getAttribute('role')).toBe('progressbar');
    });

    it('is not hidden from assistive technology', () => {
      expect(bar().hasAttribute('aria-hidden')).toBe(false);
    });

    /**
     * `role="progressbar"` is children-presentational in ARIA, so the subtree
     * would be pruned even without this — but support for that pruning varies,
     * and the canvas is opaque to a screen reader in every implementation. The
     * attribute is asserted here because it is the half of the decision that
     * says the DRAWING is decoration while the component is not.
     */
    it('hides the whole drawing, canvas included', () => {
      const svg = bar().querySelector('svg') as SVGElement;

      expect(svg.getAttribute('aria-hidden')).toBe('true');
      expect(svg.contains(bar().querySelector('canvas'))).toBe(true);
    });
  });

  /**
   * `fill` is a px length along the track and `aria-valuenow` is a percentage of
   * it, so these are the tests that the two agree — the announced value is the
   * one thing here a reader cannot check against the drawing by eye.
   */
  describe('the value range', () => {
    it('reports fill as a percentage of the track, on a 0-100 range', () => {
      // width 600 less the 50px inset at each end is a 500px track; fill 300 of
      // it is 60%. The px never reach the accessibility tree.
      expect(bar().getAttribute('aria-valuenow')).toBe('60');
      expect(bar().getAttribute('aria-valuemin')).toBe('0');
      expect(bar().getAttribute('aria-valuemax')).toBe('100');
    });

    it('reports 0 for an empty bar', () => {
      host.fill.set(0);
      fixture.detectChanges();

      expect(bar().getAttribute('aria-valuenow')).toBe('0');
    });

    it('tracks the track, not the SVG width, when width changes', () => {
      // Same fill, wider bar: 300 of a 700px track is less progress, and the
      // announced value has to fall with the drawing rather than stay at 60.
      host.width.set(800);
      fixture.detectChanges();

      expect(bar().getAttribute('aria-valuenow')).toBe(`${(300 / 700) * 100}`);
    });

    /**
     * `fill` is not clamped for drawing — the story alone drives it to 600
     * against a 500px track, where the rect simply overflows. `aria-valuenow`
     * may not exceed `aria-valuemax`, so the announcement is clamped even though
     * the drawing is not.
     */
    it('clamps an overflowing fill to 100 rather than exceeding valuemax', () => {
      host.fill.set(600);
      fixture.detectChanges();

      expect(bar().getAttribute('aria-valuenow')).toBe('100');
      expect(bar().getAttribute('aria-valuemax')).toBe('100');
    });

    it('clamps a negative fill to 0', () => {
      host.fill.set(-50);
      fixture.detectChanges();

      expect(bar().getAttribute('aria-valuenow')).toBe('0');
    });

    /**
     * A width at or below twice the inset leaves no track to measure against.
     * The role stays — "something is in progress" is still true — and the value
     * range is withheld, which is how ARIA spells an indeterminate progressbar.
     * The alternative is a value from a division by zero or a negative range.
     */
    it.each([100, 80, 0])('omits the value range when width %i leaves no track', (width) => {
      host.width.set(width);
      fixture.detectChanges();

      expect(bar().getAttribute('role')).toBe('progressbar');
      expect(bar().hasAttribute('aria-valuenow')).toBe(false);
      expect(bar().hasAttribute('aria-valuemin')).toBe(false);
      expect(bar().hasAttribute('aria-valuemax')).toBe(false);
    });

    it('reinstates the value range when the width grows back', () => {
      host.width.set(100);
      fixture.detectChanges();
      host.width.set(600);
      fixture.detectChanges();

      expect(bar().getAttribute('aria-valuenow')).toBe('60');
    });
  });

  /**
   * The naming rule is `tnAccessibleName`'s, shared with the other three
   * progressbars, which is what #209 asked for — "no fourth naming rule". These
   * assertions are that the routing is real, case for case with
   * `progress-bar-a11y.spec.ts`, rather than a fourth copy that happens to agree
   * today.
   */
  describe('where the name comes from', () => {
    it('falls back to the default label when neither input is set', () => {
      expect(bar().getAttribute('aria-label')).toBe(TN_PARTICLE_PROGRESS_BAR_DEFAULT_LABEL);
    });

    it('uses the same generic name as tn-progress-bar', () => {
      expect(TN_PARTICLE_PROGRESS_BAR_DEFAULT_LABEL).toBe('Progress');
    });

    it('prefers an explicit ariaLabel over the fallback', () => {
      host.ariaLabel.set('Restoring pool');
      fixture.detectChanges();

      expect(bar().getAttribute('aria-label')).toBe('Restoring pool');
    });

    it('treats a blank ariaLabel as no label at all', () => {
      host.ariaLabel.set('   ');
      fixture.detectChanges();

      expect(bar().getAttribute('aria-label')).toBe(TN_PARTICLE_PROGRESS_BAR_DEFAULT_LABEL);
    });

    /**
     * `aria-labelledby` wins the name calculation only while its IDREF RESOLVES,
     * so the generic fallback is withheld beside one — there it would mask a
     * dangling reference with a name that says nothing — while an explicit
     * `ariaLabel` is not, because it is the only name left when the reference
     * does not resolve. These are that pair.
     */
    it('withholds the generic fallback when only ariaLabelledby is set', () => {
      host.ariaLabelledby.set('tn-external-label');
      fixture.detectChanges();

      expect(bar().getAttribute('aria-labelledby')).toBe('tn-external-label');
      expect(bar().hasAttribute('aria-label')).toBe(false);
    });

    it('keeps an explicit ariaLabel alongside ariaLabelledby', () => {
      host.ariaLabel.set('Restoring pool');
      host.ariaLabelledby.set('tn-external-label');
      fixture.detectChanges();

      expect(bar().getAttribute('aria-labelledby')).toBe('tn-external-label');
      expect(bar().getAttribute('aria-label')).toBe('Restoring pool');
    });

    it('omits aria-labelledby when the input is not set', () => {
      expect(bar().hasAttribute('aria-labelledby')).toBe(false);
    });

    /**
     * The two fixtures with a dangling IDREF scan `aria-progressbar-name` alone,
     * not `PROGRESSBAR_RULES`. Measured: `aria-valid-attr-value` lands in
     * `incomplete` on an `aria-labelledby` that resolves to nothing — axe will
     * not say whether a reference it cannot follow is valid — and `axeResult`
     * throws on an incomplete result rather than counting it either way. The
     * name is what these two are about, and it is decidable.
     */
    it('still names the bar when ariaLabelledby points at nothing', async () => {
      host.ariaLabel.set('Restoring pool');
      host.ariaLabelledby.set('tn-no-such-element');
      fixture.detectChanges();

      const { violated, evaluated } = await axeResult(
        fixture.nativeElement, bar(), ['aria-progressbar-name']
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
    it('reports a bar whose only name is an ariaLabelledby pointing at nothing', async () => {
      host.ariaLabelledby.set('tn-no-such-element');
      fixture.detectChanges();

      const { violated } = await axeResult(
        fixture.nativeElement, bar(), ['aria-progressbar-name']
      );

      expect(violated).toEqual(['aria-progressbar-name']);
    });

    it('reinstates the fallback if the caller clears ariaLabel again', () => {
      host.ariaLabel.set('Restoring pool');
      fixture.detectChanges();
      host.ariaLabel.set(null);
      fixture.detectChanges();

      expect(bar().getAttribute('aria-label')).toBe(TN_PARTICLE_PROGRESS_BAR_DEFAULT_LABEL);
    });
  });

  /**
   * The fallback keeps a forgotten label from reaching assistive technology as
   * silence; this keeps it from reaching the DEVELOPER as silence. Without it,
   * giving this component a role would have satisfied axe while leaving an
   * unnamed bar looking correct to every check the library can run — which is
   * the state it was already in, one level up.
   */
  describe('the dev-mode warning', () => {
    function messages(): string[] {
      return warn.mock.calls.map((call) => String(call[0]));
    }

    it('warns, naming the component, when neither input is set', () => {
      expect(messages()).toHaveLength(1);
      expect(messages()[0]).toContain('tn-particle-progress-bar');
      expect(messages()[0]).toContain('ariaLabel');
    });

    it('does not warn when ariaLabel is set from the start', () => {
      warn.mockClear();
      const named = TestBed.createComponent(TestHostComponent);
      named.componentInstance.ariaLabel.set('Restoring pool');
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

    // One warning per bar that stays unnamed, not one per change detection: a
    // per-cycle warning on a component that animates by definition floods the
    // console and trains developers to ignore it.
    it('warns once, however many times the bar is re-rendered', () => {
      host.fill.set(400);
      fixture.detectChanges();
      host.fill.set(450);
      fixture.detectChanges();

      expect(messages()).toHaveLength(1);
    });

    it('stops warning once the bar is named', () => {
      host.ariaLabel.set('Restoring pool');
      fixture.detectChanges();
      warn.mockClear();
      fixture.detectChanges();

      expect(warn).not.toHaveBeenCalled();
    });
  });
});
