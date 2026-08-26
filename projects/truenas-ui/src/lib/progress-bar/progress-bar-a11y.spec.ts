import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TnProgressBarComponent } from './progress-bar.component';
import type { ProgressBarMode } from './progress-bar.component';
import { axeResult } from '../a11y/axe-testing';
import { TN_PROGRESS_BAR_DEFAULT_LABEL } from '../a11y/fallback-labels';

/**
 * Guards the naming fixed for #202: the host carried `role="progressbar"` with
 * `aria-label` and `aria-labelledby` bound to inputs that both default to
 * `null`, so the DEFAULT rendering was a progressbar assistive technology
 * announces with no name — "progress bar, 40%", with nothing to say what is
 * progressing. axe scores that serious (`aria-progressbar-name`, WCAG 4.1.2).
 *
 * Measured before the fix, under jsdom, with the rule reporting on the host:
 *
 *   default markup   aria-progressbar-name -> violations on [tn-progress-bar]
 *
 * So unlike `slide-toggle-a11y.spec.ts` — where the suggested rule never
 * matched and the DOM assertions are what hold the fix — the axe assertions
 * here are direct evidence, in the shape `chip-a11y.spec.ts` uses.
 *
 * WHY A DEFAULT NAME RATHER THAN DROPPING THE ROLE
 * ------------------------------------------------
 * The other way to satisfy the rule is to withhold `role="progressbar"` when
 * there is nothing to name it with. That trades a badly-named progressbar for
 * no progressbar at all: a screen reader then gets no indication that anything
 * is loading, and on a determinate bar it also loses the value. Silence scores
 * clean and helps nobody. So the role stays, an unnamed bar falls back to
 * `TN_PROGRESS_BAR_DEFAULT_LABEL`, and the dev-mode warning below is what stops
 * that fallback from being the silent default the ticket warns about.
 */

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnProgressBarComponent],
  template: `<span id="tn-external-label">Restoring pool</span>
    <tn-progress-bar [mode]="mode()" [value]="value()" [bufferValue]="bufferValue()"
      [ariaLabel]="ariaLabel()" [ariaLabelledby]="ariaLabelledby()" />`
})
class TestHostComponent {
  mode = signal<ProgressBarMode>('determinate');
  value = signal(40);
  bufferValue = signal(0);
  ariaLabel = signal<string | null>(null);
  ariaLabelledby = signal<string | null>(null);
}

describe('tn-progress-bar accessibility (#202)', () => {
  let host: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let warn: jest.SpyInstance;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    // Silenced rather than merely observed: the component warns on every
    // unnamed bar by design, and most fixtures in this file are unnamed.
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    // TestBed attaches the fixture to the document, which axe needs: it walks up
    // to the document root to decide visibility and treats a detached tree as
    // hidden, and therefore exempt from every rule below.
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    warn.mockRestore();
  });

  function bar(): HTMLElement {
    return fixture.nativeElement.querySelector('tn-progress-bar') as HTMLElement;
  }

  describe('aria-progressbar-name', () => {
    // `evaluated` is asserted alongside every empty `violated`, because an empty
    // `violations` is also what axe returns when it evaluated nothing at all.
    // It is non-vacuous here: the rule selects on `role="progressbar"`, which is
    // the host itself and the only such node in the fixture.
    it.each<ProgressBarMode>(['determinate', 'indeterminate', 'buffer'])(
      'names a %s bar that was given no label', async (mode) => {
        host.mode.set(mode);
        fixture.detectChanges();

        const { violated, evaluated } = await axeResult(
          fixture.nativeElement, bar(), ['aria-progressbar-name']
        );

        expect(violated).toEqual([]);
        expect(evaluated).toContain('aria-progressbar-name');
      });

    it('raises no violation when ariaLabel is set', async () => {
      host.ariaLabel.set('Copying files');
      fixture.detectChanges();

      const { violated, evaluated } = await axeResult(
        fixture.nativeElement, bar(), ['aria-progressbar-name']
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-progressbar-name');
    });

    it('raises no violation when ariaLabelledby is set', async () => {
      host.ariaLabelledby.set('tn-external-label');
      fixture.detectChanges();

      const { violated, evaluated } = await axeResult(
        fixture.nativeElement, bar(), ['aria-progressbar-name']
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-progressbar-name');
    });

    /**
     * Positive control, and the only assertion here that shows axe FAILING
     * rather than passing. Every expectation above is `toEqual([])`, which is
     * also what axe returns when it evaluates nothing — a version that narrows
     * which nodes the rule selects, a jsdom change that makes the tree
     * invisible to it. (A rule renamed or dropped outright is the case that does
     * not go quiet: axe rejects with "Could not find configured rule".)
     *
     * This rebuilds the markup `tn-progress-bar` shipped before #202 —
     * `role="progressbar"` with the value attributes and no name — and requires
     * axe to still object to it. It runs through the shared `axeResult` on
     * purpose, so it is equally the control for that wrapper: an attribution bug
     * there would empty `violated` in every spec using it.
     */
    it('still reports the violation for the markup the bar used to have', async () => {
      const previous = document.createElement('div');
      previous.innerHTML =
        '<div role="progressbar" class="tn-progress-bar tn-progress-bar-determinate" '
        + 'aria-valuenow="40" aria-valuemin="0" aria-valuemax="100"></div>';
      document.body.appendChild(previous);

      // try/finally, because `axeResult` throws rather than returning a vacuous
      // pass — and a fixture left in `document.body` by that throw would be
      // scanned by every later test in this file.
      let violated: string[];
      try {
        ({ violated } = await axeResult(
          previous, previous.querySelector('[role="progressbar"]'), ['aria-progressbar-name']
        ));
      } finally {
        previous.remove();
      }

      expect(violated).toEqual(['aria-progressbar-name']);
    });
  });

  describe('where the name comes from', () => {
    it('falls back to the default label when neither input is set', () => {
      expect(bar().getAttribute('aria-label')).toBe(TN_PROGRESS_BAR_DEFAULT_LABEL);
    });

    it('prefers an explicit ariaLabel over the fallback', () => {
      host.ariaLabel.set('Copying files');
      fixture.detectChanges();

      expect(bar().getAttribute('aria-label')).toBe('Copying files');
    });

    it('treats a blank ariaLabel as no label at all', () => {
      host.ariaLabel.set('   ');
      fixture.detectChanges();

      expect(bar().getAttribute('aria-label')).toBe(TN_PROGRESS_BAR_DEFAULT_LABEL);
    });

    /**
     * `aria-labelledby` wins over `aria-label` only while its IDREF RESOLVES, so
     * the generic fallback is withheld beside one — there it would mask a
     * dangling reference with a name that says nothing — while an explicit
     * `ariaLabel` is not, because it is the only name left when the reference
     * does not resolve. These two tests are that pair.
     */
    it('withholds the generic fallback when only ariaLabelledby is set', () => {
      host.ariaLabelledby.set('tn-external-label');
      fixture.detectChanges();

      expect(bar().getAttribute('aria-labelledby')).toBe('tn-external-label');
      expect(bar().hasAttribute('aria-label')).toBe(false);
    });

    it('keeps an explicit ariaLabel alongside ariaLabelledby', () => {
      host.ariaLabel.set('Copying files');
      host.ariaLabelledby.set('tn-external-label');
      fixture.detectChanges();

      expect(bar().getAttribute('aria-labelledby')).toBe('tn-external-label');
      expect(bar().getAttribute('aria-label')).toBe('Copying files');
    });

    /**
     * The regression the pair above exists to prevent, and the reason this is
     * an axe assertion rather than a DOM one: a dangling IDREF contributes
     * nothing to the accessible name, so `aria-label` is all that stands
     * between this bar and the very violation #202 is about.
     */
    it('still names the bar when ariaLabelledby points at nothing', async () => {
      host.ariaLabel.set('Copying files');
      host.ariaLabelledby.set('tn-no-such-element');
      fixture.detectChanges();

      const { violated, evaluated } = await axeResult(
        fixture.nativeElement, bar(), ['aria-progressbar-name']
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-progressbar-name');
    });

    /**
     * The other half of that pair, and the evidence for withholding the generic
     * fallback beside an `ariaLabelledby`: on its own, a dangling IDREF is still
     * a violation, so it is reported rather than quietly papered over by a name
     * that says nothing.
     *
     * It is also what stops the test above passing for free. Without it, that
     * one is equally satisfied by an axe that treats ANY `aria-labelledby` as a
     * name without resolving it — this is the assertion that shows it resolves.
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
      host.ariaLabel.set('Copying files');
      fixture.detectChanges();
      host.ariaLabel.set(null);
      fixture.detectChanges();

      expect(bar().getAttribute('aria-label')).toBe(TN_PROGRESS_BAR_DEFAULT_LABEL);
    });
  });

  /**
   * The fallback is what keeps a forgotten label from reaching assistive
   * technology as silence; this is what keeps it from reaching the DEVELOPER as
   * silence. Without it the fix would satisfy axe and remove the only signal
   * that the label was ever missing — which the ticket calls out as worse than
   * shipping the violation.
   */
  describe('the dev-mode warning', () => {
    function messages(): string[] {
      return warn.mock.calls.map((call) => String(call[0]));
    }

    it('warns, naming the component, when neither input is set', () => {
      expect(messages()).toHaveLength(1);
      expect(messages()[0]).toContain('tn-progress-bar');
      expect(messages()[0]).toContain('ariaLabel');
    });

    it('does not warn when ariaLabel is set from the start', () => {
      warn.mockClear();
      const named = TestBed.createComponent(TestHostComponent);
      named.componentInstance.ariaLabel.set('Copying files');
      named.detectChanges();

      expect(warn).not.toHaveBeenCalled();
    });

    it('does not warn when ariaLabelledby is set from the start', () => {
      warn.mockClear();
      const named = TestBed.createComponent(TestHostComponent);
      named.componentInstance.ariaLabelledby.set('tn-external-label');
      named.detectChanges();

      expect(warn).not.toHaveBeenCalled();
    });

    // One warning per bar that stays unnamed, not one per change detection:
    // a per-cycle warning on an animating progress bar floods the console and
    // trains developers to ignore it.
    it('warns once, however many times the bar is re-rendered', () => {
      host.value.set(70);
      fixture.detectChanges();
      host.value.set(90);
      fixture.detectChanges();

      expect(messages()).toHaveLength(1);
    });
  });

  /**
   * #202 is about the name only. These are the attributes it must not disturb,
   * asserted here rather than left to `progress-bar.component.spec.ts` because
   * the regression they guard would be introduced by this fix.
   */
  describe('the value attributes are unchanged', () => {
    it('keeps the role, and the value range, in determinate mode', () => {
      expect(bar().getAttribute('role')).toBe('progressbar');
      expect(bar().getAttribute('aria-valuenow')).toBe('40');
      expect(bar().getAttribute('aria-valuemin')).toBe('0');
      expect(bar().getAttribute('aria-valuemax')).toBe('100');
    });

    it.each<ProgressBarMode>(['indeterminate', 'buffer'])(
      'keeps the role and omits the value range in %s mode', (mode) => {
        host.mode.set(mode);
        fixture.detectChanges();

        expect(bar().getAttribute('role')).toBe('progressbar');
        expect(bar().hasAttribute('aria-valuenow')).toBe(false);
        expect(bar().hasAttribute('aria-valuemin')).toBe(false);
        expect(bar().hasAttribute('aria-valuemax')).toBe(false);
      });
  });
});
