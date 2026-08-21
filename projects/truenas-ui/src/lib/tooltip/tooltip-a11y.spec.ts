import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TnTooltipComponent } from './tooltip.component';
import { TnTooltipDirective } from './tooltip.directive';
import { axeResult } from '../a11y/axe-testing';

/**
 * Guards the structure fixed for #203: the overlay used to render
 * `role="tooltip"` with `aria-hidden="false"` hard-coded, which put a second
 * tooltip in the accessibility tree alongside the one `AriaDescriber` already
 * maintains — and left it unnamed whenever the message was empty or contributed
 * no text, which axe scores `aria-tooltip-name` (serious, WCAG 4.1.2).
 *
 * The fix makes the overlay decorative. That is only correct if the accessible
 * description still reaches the user by the other route, so the two halves are
 * asserted together below rather than in separate files: hiding the overlay
 * without the describer working would be silence, not a fix.
 */

@Component({
  standalone: true,
  imports: [TnTooltipDirective],
  template: `<div class="wrapper" tnTooltip="Pool is degraded"><button>Details</button></div>`,
})
class WrapperHostComponent {}

describe('tn-tooltip accessibility (#203)', () => {
  describe('the overlay component on its own', () => {
    let fixture: ComponentFixture<TnTooltipComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({ imports: [TnTooltipComponent] });
      // TestBed attaches the fixture to the document itself, which axe needs —
      // it walks to the document root to decide visibility, and treats a
      // detached tree as hidden and therefore exempt from every rule.
      fixture = TestBed.createComponent(TnTooltipComponent);
    });

    function overlay(): HTMLElement {
      return fixture.nativeElement.querySelector('.tn-tooltip') as HTMLElement;
    }

    /**
     * The default inputs, which is the shape the ticket reproduced: `message`
     * defaults to `''`, so the old markup rendered a `role="tooltip"` with no
     * text to name it. A message-carrying overlay was named by its own content
     * and so did NOT violate — which is exactly why the rule went unnoticed.
     */
    it('raises no aria-tooltip-name violation with no message', async () => {
      fixture.detectChanges();

      const { violated } = await axeResult(
        fixture.nativeElement, overlay(), ['aria-tooltip-name']
      );

      expect(violated).toEqual([]);
    });

    it('raises no aria-tooltip-name violation with a message', async () => {
      fixture.componentRef.setInput('message', 'Pool is degraded');
      fixture.detectChanges();

      const { violated } = await axeResult(
        fixture.nativeElement, overlay(), ['aria-tooltip-name']
      );

      expect(violated).toEqual([]);
    });

    /**
     * `violated` above is `toEqual([])`, which is also what axe returns when it
     * evaluated nothing at all — and here that is not a hypothetical worry but
     * the literal mechanism of the fix: removing `role="tooltip"` is what stops
     * `aria-tooltip-name` selecting the node, so post-fix the rule is correctly
     * not evaluated on it and an `evaluated` assertion would fail on right
     * markup. This positive control is what keeps those two tests honest: it
     * rebuilds the exact markup the ticket reproduced and requires axe to still
     * object to it, so they cannot go vacuous for any OTHER reason — a rule
     * narrowed by an axe upgrade, a jsdom change that hides the tree — without
     * failing here first.
     *
     * It runs through the shared `axeResult` on purpose, so it is also the
     * control for that wrapper reporting a violation at all.
     */
    it('still reports the violation for the markup the overlay used to render', async () => {
      const previous = document.createElement('div');
      previous.innerHTML =
        '<div class="tn-tooltip" role="tooltip" id="" aria-hidden="false"></div>';
      document.body.appendChild(previous);

      // try/finally, because `axeResult` throws rather than returning a vacuous
      // pass — and a fixture left in `document.body` by that throw would be
      // scanned by every later test in this file.
      let violated: string[];
      try {
        ({ violated } = await axeResult(
          previous, previous.querySelector('.tn-tooltip'), ['aria-tooltip-name']
        ));
      } finally {
        previous.remove();
      }

      expect(violated).toEqual(['aria-tooltip-name']);
    });

    it('claims no tooltip role, so the describer is the only tooltip in the tree', () => {
      fixture.componentRef.setInput('message', 'Pool is degraded');
      fixture.detectChanges();

      expect(overlay().getAttribute('role')).toBeNull();
      expect(overlay().getAttribute('aria-hidden')).toBe('true');
    });

    it('omits the id attribute rather than rendering an empty one', () => {
      fixture.detectChanges();

      // `id=""` cannot be referenced by `aria-describedby` or any selector, so
      // anything reaching for it resolves to nothing, silently.
      expect(overlay().hasAttribute('id')).toBe(false);
    });

    it('still renders an id it is given', () => {
      fixture.componentRef.setInput('id', 'tn-tooltip-abc123');
      fixture.detectChanges();

      expect(overlay().getAttribute('id')).toBe('tn-tooltip-abc123');
    });
  });

  /**
   * The other half of the model, and the one that makes hiding the overlay a
   * fix rather than a regression: with the directive driving it, the message
   * must still reach assistive technology — via the describer, on the control.
   *
   * `tooltip.component.spec.ts` already covers the describer's targeting rules
   * on their own. What is asserted here is the pair holding at once, in the one
   * state where the overlay actually exists: shown.
   */
  describe('with the directive driving it', () => {
    let fixture: ComponentFixture<WrapperHostComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({ imports: [WrapperHostComponent] });
      fixture = TestBed.createComponent(WrapperHostComponent);
      fixture.detectChanges();
    });

    /** Lets the directive's show timeout run, then syncs the view. */
    async function settle(): Promise<void> {
      await new Promise((resolve) => setTimeout(resolve));
      fixture.detectChanges();
    }

    function trigger(): HTMLElement {
      return fixture.nativeElement.querySelector('.wrapper') as HTMLElement;
    }

    function control(): HTMLElement {
      return fixture.nativeElement.querySelector('button') as HTMLElement;
    }

    function shownOverlay(): HTMLElement | null {
      return document.querySelector('.tn-tooltip');
    }

    it('shows a decorative overlay while the control keeps the description', async () => {
      trigger().dispatchEvent(new MouseEvent('mouseenter'));
      await settle();

      const overlay = shownOverlay();
      expect(overlay).not.toBeNull();
      expect(overlay!.textContent?.trim()).toBe('Pool is degraded');
      expect(overlay!.getAttribute('role')).toBeNull();
      expect(overlay!.getAttribute('aria-hidden')).toBe('true');

      // The describer's element, not the overlay: it is what `aria-describedby`
      // points at, and it outlives the overlay so the reference never dangles.
      const describedBy = control().getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      const description = document.getElementById(describedBy!.split(/\s+/)[0]);
      expect(description).not.toBe(overlay);
      expect(description?.textContent).toBe('Pool is degraded');
    });

    it('raises no aria-tooltip-name violation on the shown overlay', async () => {
      trigger().dispatchEvent(new MouseEvent('mouseenter'));
      await settle();

      const overlay = shownOverlay();
      expect(overlay).not.toBeNull();

      // Scanned from the overlay's own container: the CDK attaches it outside
      // the fixture's element, so the fixture root does not contain it.
      const { violated } = await axeResult(
        document.body, overlay, ['aria-tooltip-name']
      );

      expect(violated).toEqual([]);
    });
  });
});
