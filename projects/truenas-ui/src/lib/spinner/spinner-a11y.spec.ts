import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TnSpinnerComponent, TN_SPINNER_DEFAULT_LABEL } from './spinner.component';
import type { SpinnerMode } from './spinner.component';
import { axeResult } from '../a11y/axe-testing';

/**
 * The spinner half of #202. Same defect as `../progress-bar/progress-bar-a11y.spec.ts`
 * and same fix — `role="progressbar"` on the host with `aria-label` and
 * `aria-labelledby` bound to inputs that both default to `null` — so the
 * reasoning for a fallback name over dropping the role lives there and is not
 * repeated here.
 *
 * What differs is that the spinner's default mode is `indeterminate`, so its
 * unnamed default rendering carries no `aria-valuenow` either: assistive
 * technology reached a progressbar with neither a name nor a value.
 *
 * Measured before the fix, under jsdom, with the rule reporting on the host:
 *
 *   default markup   aria-progressbar-name -> violations on [tn-spinner]
 */

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnSpinnerComponent],
  template: `<span id="tn-external-label">Restoring pool</span>
    <tn-spinner [mode]="mode()" [value]="value()"
      [ariaLabel]="ariaLabel()" [ariaLabelledby]="ariaLabelledby()" />`
})
class TestHostComponent {
  mode = signal<SpinnerMode>('indeterminate');
  value = signal(0);
  ariaLabel = signal<string | null>(null);
  ariaLabelledby = signal<string | null>(null);
}

describe('tn-spinner accessibility (#202)', () => {
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
    warn.mockRestore();
  });

  function spinner(): HTMLElement {
    return fixture.nativeElement.querySelector('tn-spinner') as HTMLElement;
  }

  describe('aria-progressbar-name', () => {
    // `evaluated` is asserted alongside every empty `violated`, because an empty
    // `violations` is also what axe returns when it evaluated nothing at all.
    // It is non-vacuous here: the rule selects on `role="progressbar"`, which is
    // the host itself and the only such node in the fixture.
    it.each<SpinnerMode>(['indeterminate', 'determinate'])(
      'names a %s spinner that was given no label', async (mode) => {
        host.mode.set(mode);
        fixture.detectChanges();

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
     * Positive control, for the reason set out at length in
     * `../progress-bar/progress-bar-a11y.spec.ts`: every expectation above is
     * `toEqual([])`, which is also what axe returns when it evaluated nothing.
     * This rebuilds the markup `tn-spinner` shipped before #202 — an
     * indeterminate progressbar with neither a name nor a value — and requires
     * axe to still object to it.
     */
    it('still reports the violation for the markup the spinner used to have', async () => {
      const previous = document.createElement('div');
      previous.innerHTML =
        '<div role="progressbar" class="tn-spinner tn-spinner-indeterminate"></div>';
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
      expect(spinner().getAttribute('aria-label')).toBe(TN_SPINNER_DEFAULT_LABEL);
    });

    it('prefers an explicit ariaLabel over the fallback', () => {
      host.ariaLabel.set('Loading datasets');
      fixture.detectChanges();

      expect(spinner().getAttribute('aria-label')).toBe('Loading datasets');
    });

    it('treats a blank ariaLabel as no label at all', () => {
      host.ariaLabel.set('   ');
      fixture.detectChanges();

      expect(spinner().getAttribute('aria-label')).toBe(TN_SPINNER_DEFAULT_LABEL);
    });

    /**
     * `aria-labelledby` wins over `aria-label` in the ARIA name calculation, so
     * a fallback emitted alongside it would be dead weight that nothing
     * announces — and reads, to anyone inspecting the element, as a name that is
     * in force when it is not.
     */
    it('emits no aria-label at all when ariaLabelledby is set', () => {
      host.ariaLabelledby.set('tn-external-label');
      fixture.detectChanges();

      expect(spinner().getAttribute('aria-labelledby')).toBe('tn-external-label');
      expect(spinner().hasAttribute('aria-label')).toBe(false);
    });

    it('reinstates the fallback if the caller clears ariaLabel again', () => {
      host.ariaLabel.set('Loading datasets');
      fixture.detectChanges();
      host.ariaLabel.set(null);
      fixture.detectChanges();

      expect(spinner().getAttribute('aria-label')).toBe(TN_SPINNER_DEFAULT_LABEL);
    });
  });

  /**
   * The fallback is what keeps a forgotten label from reaching assistive
   * technology as silence; this is what keeps it from reaching the DEVELOPER as
   * silence. Without it the fix would satisfy axe and remove the only signal
   * that the label was ever missing.
   */
  describe('the dev-mode warning', () => {
    function messages(): string[] {
      return warn.mock.calls.map((call) => String(call[0]));
    }

    it('warns, naming the component, when neither input is set', () => {
      expect(messages()).toHaveLength(1);
      expect(messages()[0]).toContain('tn-spinner');
      expect(messages()[0]).toContain('ariaLabel');
    });

    it('does not warn when ariaLabel is set from the start', () => {
      warn.mockClear();
      const named = TestBed.createComponent(TestHostComponent);
      named.componentInstance.ariaLabel.set('Loading datasets');
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

    // One warning per spinner that stays unnamed, not one per change detection:
    // a per-cycle warning on a spinner that is animating by definition floods
    // the console and trains developers to ignore it.
    it('warns once, however many times the spinner is re-rendered', () => {
      host.mode.set('determinate');
      fixture.detectChanges();
      host.value.set(60);
      fixture.detectChanges();

      expect(messages()).toHaveLength(1);
    });
  });

  /**
   * #202 is about the name only. These are the attributes it must not disturb,
   * asserted here rather than left to `spinner.component.spec.ts` because the
   * regression they guard would be introduced by this fix.
   */
  describe('the value attributes are unchanged', () => {
    it('keeps the role, and the value range, in determinate mode', () => {
      host.mode.set('determinate');
      host.value.set(75);
      fixture.detectChanges();

      expect(spinner().getAttribute('role')).toBe('progressbar');
      expect(spinner().getAttribute('aria-valuenow')).toBe('75');
      expect(spinner().getAttribute('aria-valuemin')).toBe('0');
      expect(spinner().getAttribute('aria-valuemax')).toBe('100');
    });

    it('keeps the role and omits the value range in indeterminate mode', () => {
      expect(spinner().getAttribute('role')).toBe('progressbar');
      expect(spinner().hasAttribute('aria-valuenow')).toBe(false);
      expect(spinner().hasAttribute('aria-valuemin')).toBe(false);
      expect(spinner().hasAttribute('aria-valuemax')).toBe(false);
    });
  });
});
