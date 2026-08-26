import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TnSidePanelComponent } from './side-panel.component';
import { axeResult } from '../a11y/axe-testing';
import { TN_SIDE_PANEL_DEFAULT_LABEL } from '../a11y/fallback-labels';

/**
 * Guards the ARIA structure given to `tn-side-panel` in #214.
 *
 * WHAT WAS REPORTED, AND WHAT WAS ACTUALLY THERE
 * ----------------------------------------------
 * The ticket reported axe returning no violations AND zero rules passed. Run
 * against the unchanged component that is exactly what a scan of the component's
 * own element does — and it is an artefact of where the markup lives rather than
 * of what it says. `afterNextRender` moves `.tn-side-panel__overlay` to
 * `document.body`, so `<tn-side-panel>` itself is an empty element and a scan
 * rooted at it evaluates two rules about the host and nothing about the panel.
 * `the reported scan` at the bottom of this file keeps that measurement.
 *
 * Scanned where the overlay actually is, an OPEN panel WITH A TITLE already
 * passed 24 rules including `aria-dialog-name`: the role, the modal flag, the
 * focus trap, Escape and focus restoration were all there before this ticket.
 *
 * WHAT WAS REALLY MISSING
 * -----------------------
 * Two things, both measured rather than reasoned about:
 *
 * - **A name in the default configuration.** `title` defaults to `''`, so the
 *   default rendering was `role="dialog"` pointing `aria-labelledby` at an empty
 *   `<h2>` — `aria-dialog-name` and `empty-heading`, together.
 * - **Inertness when closed.** The overlay stays in the DOM with its close
 *   button and projected content, under `aria-hidden="true"`. axe cannot decide
 *   `aria-hidden-focus` under jsdom (no layout engine), and `axeResult` throws
 *   on an undecided rule rather than counting it either way — so that half is
 *   asserted against the DOM, which is what the wrapper's own documentation says
 *   to do.
 *
 * THE MODEL: MODAL
 * ----------------
 * The panel already trapped focus with `cdkTrapFocus`, asked the CDK to capture
 * it on open, closed on Escape and restored focus to the opener on close.
 * `role="dialog"` plus `aria-modal="true"` describes that, so this ticket
 * implements no new contract for it — it makes the existing one nameable and
 * stops it reaching the tab order while closed. Declaring a focus contract and
 * not implementing it is what the ticket calls worse than the current state;
 * this is the other case.
 *
 * The capture half of that turned out not to hold: `[cdkTrapFocusAutoCapture]`
 * did nothing at all for a panel with no tabbable content, and this file's
 * restoration tests could not see it because they moved focus by hand first.
 * #227 replaced it and `side-panel-focus-capture.spec.ts` owns it.
 */

@Component({
  selector: 'tn-side-panel-a11y-host',
  standalone: true,
  imports: [TnSidePanelComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <button type="button" id="trigger" (click)="open.set(true)">Open</button>
    <h2 id="external-title">Edit dataset</h2>
    <tn-side-panel
      [title]="title()"
      [hasBackdrop]="hasBackdrop()"
      [ariaLabel]="ariaLabel()"
      [ariaLabelledby]="ariaLabelledby()"
      [(open)]="open">
      <p>Panel body</p>
      <button type="button" id="inside">Inside</button>
    </tn-side-panel>
  `,
})
class SidePanelA11yHostComponent {
  open = signal(false);
  title = signal('Edit dataset');
  hasBackdrop = signal(true);
  ariaLabel = signal<string | null>(null);
  ariaLabelledby = signal<string | null>(null);
}

/**
 * The rules an open dialog's structure can be wrong under.
 *
 * `aria-dialog-name` is the one the fix is about. The rest are here because the
 * change moved what names the dialog and added an attribute to the same element:
 * the cheapest way for that to go wrong is an attribute landing on a role that
 * does not allow it, or an IDREF that resolves to nothing.
 *
 * NOT `aria-hidden-focus`, and not `color-contrast`: both come back
 * `incomplete` under jsdom, and `axeResult` throws on an undecided rule rather
 * than letting it satisfy an `evaluated` assertion while contributing nothing to
 * `violated`. `is inert as well as aria-hidden while closed` covers the first
 * from the DOM side.
 *
 * NOT `empty-heading` either, for a different reason: it reports on the `<h2>`,
 * not on the dialog, so it is asserted where its target is — in
 * `the heading the dialog is named by`.
 */
const DIALOG_RULES = [
  'aria-dialog-name',
  'aria-allowed-attr',
  'aria-required-attr',
  'aria-valid-attr-value',
  'aria-allowed-role',
  'aria-roles',
  'nested-interactive',
];

describe('tn-side-panel accessibility (#214)', () => {
  let fixture: ComponentFixture<SidePanelA11yHostComponent>;
  let host: SidePanelA11yHostComponent;
  let warn: jest.SpyInstance;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidePanelA11yHostComponent],
    }).compileComponents();

    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    fixture = TestBed.createComponent(SidePanelA11yHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // The overlay is portaled to document.body and only removed on destroy, so
    // without this every later fixture in this file scans the previous one's
    // panel as well as its own.
    fixture.destroy();
    warn.mockRestore();
  });

  /**
   * The overlay is in `document.body`, not in the fixture — see the header. Both
   * the scanned root and the targets have to be found there, which is the whole
   * point of the reported defect.
   */
  function overlay(): HTMLElement {
    return document.body.querySelector('.tn-side-panel__overlay') as HTMLElement;
  }

  function panel(): HTMLElement {
    return overlay().querySelector('.tn-side-panel__panel') as HTMLElement;
  }

  function heading(): HTMLElement | null {
    return overlay().querySelector('.tn-side-panel__title');
  }

  function openPanel(): void {
    host.open.set(true);
    fixture.detectChanges();
  }

  /**
   * Opens and lets the render settle, which is what runs the `afterNextRender`
   * the panel defers its focus capture to (#227). The plain `openPanel` above is
   * enough for the ARIA assertions, which read attributes written during change
   * detection; anything about focus needs this one.
   */
  async function openPanelAndSettle(): Promise<void> {
    openPanel();
    await fixture.whenStable();
  }

  /** The elements the dialog rules can report on. */
  function dialogTargets(): HTMLElement[] {
    return [overlay(), panel()];
  }

  describe('the dialog has a name', () => {
    it('is named by its visible heading when it has a title', () => {
      openPanel();

      expect(overlay().getAttribute('aria-labelledby')).toBe(heading()!.id);
      expect(heading()!.textContent!.trim()).toBe('Edit dataset');
      // No `aria-label` beside it: it would win the name calculation over the
      // heading and replace what the user can see with something they cannot.
      expect(overlay().getAttribute('aria-label')).toBeNull();
      expect(warn).not.toHaveBeenCalled();
    });

    it('falls back to a generic name when it has no title and no label', () => {
      host.title.set('');
      openPanel();

      expect(overlay().getAttribute('aria-labelledby')).toBeNull();
      expect(overlay().getAttribute('aria-label')).toBe(TN_SIDE_PANEL_DEFAULT_LABEL);
    });

    it('warns in dev mode when it falls back, and names the input to use', () => {
      host.title.set('');
      openPanel();

      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0][0]).toContain('[tn-side-panel]');
      expect(warn.mock.calls[0][0]).toContain('title');
    });

    it('takes an explicit ariaLabel for a panel that renders no heading', () => {
      host.title.set('');
      host.ariaLabel.set('Add dataset');
      openPanel();

      expect(overlay().getAttribute('aria-label')).toBe('Add dataset');
      expect(warn).not.toHaveBeenCalled();
    });

    it('takes an ariaLabelledby, and renders no aria-label beside it', () => {
      host.title.set('');
      host.ariaLabelledby.set('external-title');
      openPanel();

      expect(overlay().getAttribute('aria-labelledby')).toBe('external-title');
      expect(overlay().getAttribute('aria-label')).toBeNull();
      expect(warn).not.toHaveBeenCalled();
    });

    /**
     * `aria-labelledby` wins the ARIA name calculation when it resolves, so the
     * visible heading is what a listener hears — but the explicit `ariaLabel` is
     * still emitted beside it. That is `tnAccessibleName`'s rule and not this
     * component's: suppressing an explicit label would be safe only while the
     * IDREF resolves, and against a heading that has not rendered it would leave
     * the dialog unnamed in exactly the case where the caller supplied a name.
     */
    it('is named by the visible title, and keeps an explicit label beside it', () => {
      host.ariaLabel.set('Something else');
      host.ariaLabelledby.set('external-title');
      openPanel();

      expect(overlay().getAttribute('aria-labelledby')).toBe(heading()!.id);
      expect(overlay().getAttribute('aria-label')).toBe('Something else');
    });

    it('treats a whitespace-only title as no title', () => {
      host.title.set('   ');
      openPanel();

      expect(heading()).toBeNull();
      expect(overlay().getAttribute('aria-label')).toBe(TN_SIDE_PANEL_DEFAULT_LABEL);
    });
  });

  describe('the heading the dialog is named by', () => {
    it('renders no heading element at all when there is no title', () => {
      host.title.set('');
      openPanel();

      expect(heading()).toBeNull();

      // Said again without the class, because `heading()` depends on one:
      // renaming `.tn-side-panel__title` while still rendering an
      // unconditional empty `<h2>` would leave the assertion above passing
      // with an empty level-2 heading back in the header and back in the
      // document outline.
      //
      // Not an axe scan. `empty-heading` selects heading elements, so with
      // none rendered there is nothing for it to evaluate and it reports
      // clean whatever the header holds — the vacuous result this file's
      // header rules out. The rule's teeth are asserted where it does have a
      // target: `still reports the empty heading itself`, below, on the
      // markup this replaced.
      expect(overlay().querySelectorAll('h1, h2, h3, h4, h5, h6')).toHaveLength(0);
    });

    it('renders the heading, with the id the dialog points at, when there is one', async () => {
      openPanel();

      expect(heading()!.tagName).toBe('H2');
      const { violated, evaluated } = await axeResult(
        overlay(), heading(), ['empty-heading']
      );
      expect(violated).toEqual([]);
      expect(evaluated).toContain('empty-heading');
    });
  });

  describe('axe over the open dialog', () => {
    // `evaluated` is asserted alongside every empty `violated`, because an empty
    // `violations` is also what axe returns when it evaluated nothing — which is
    // the defect this ticket reported, not a hypothetical.
    it('raises no violation, and does evaluate the dialog rules', async () => {
      openPanel();

      const { violated, evaluated } = await axeResult(
        overlay(), dialogTargets(), DIALOG_RULES
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-dialog-name');
      expect(evaluated).toContain('aria-allowed-attr');
    });

    it('raises no violation on an untitled panel, which is the default', async () => {
      host.title.set('');
      openPanel();

      const { violated, evaluated } = await axeResult(
        overlay(), dialogTargets(), DIALOG_RULES
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-dialog-name');
    });

    it('raises no violation with no backdrop, which does not change the model', async () => {
      // A panel without a backdrop still traps focus — `cdkTrapFocus` is on the
      // panel unconditionally, and the component moves focus into it on open —
      // so `aria-modal="true"` still describes it, and the same rules have to
      // run over it.
      host.hasBackdrop.set(false);
      openPanel();

      expect(overlay().querySelector('.tn-side-panel__backdrop')).toBeNull();
      expect(overlay().getAttribute('aria-modal')).toBe('true');

      const { violated, evaluated } = await axeResult(
        overlay(), dialogTargets(), DIALOG_RULES
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-dialog-name');
    });
  });

  describe('what a closed panel exposes', () => {
    it('is inert as well as aria-hidden while closed', () => {
      expect(overlay().getAttribute('aria-hidden')).toBe('true');
      expect(overlay().hasAttribute('inert')).toBe(true);
    });

    it('drops both when it opens', () => {
      openPanel();

      expect(overlay().getAttribute('aria-hidden')).toBeNull();
      expect(overlay().hasAttribute('inert')).toBe(false);
      expect(overlay().getAttribute('aria-modal')).toBe('true');
    });

    it('takes them back on close', () => {
      openPanel();
      host.open.set(false);
      fixture.detectChanges();

      expect(overlay().getAttribute('aria-hidden')).toBe('true');
      expect(overlay().hasAttribute('inert')).toBe(true);
    });

    /**
     * `inert` is what keeps the close button and the projected content out of
     * the tab order while the panel is off-screen. jsdom implements neither
     * layout nor `inert`'s focus semantics, so this asserts the attribute is on
     * the ancestor of those controls rather than trying to Tab in — the same
     * limit `aria-hidden-focus` runs into, which is why it is not in
     * `DIALOG_RULES`.
     */
    it('puts the inert subtree around the controls a closed panel still holds', () => {
      const inside = overlay().querySelector('#inside') as HTMLElement;
      const close = overlay().querySelector('tn-icon-button') as HTMLElement;

      expect(overlay().hasAttribute('inert')).toBe(true);
      expect(overlay().contains(inside)).toBe(true);
      expect(overlay().contains(close)).toBe(true);
    });
  });

  describe('the keyboard contract the modal model brings', () => {
    it('closes on Escape', () => {
      openPanel();
      panel().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      fixture.detectChanges();

      expect(host.open()).toBe(false);
    });

    /**
     * Restoration happens on close, and this test deliberately does NOT dispatch
     * a `transitionend` — because that is exactly what a user with
     * `prefers-reduced-motion` never gets. This component's stylesheet sets
     * `transition-duration: 0ms` under that preference, a zero-duration
     * transition fires no event, and the overlay is `inert` from the moment it
     * closes, so waiting for the event would leave focus on `<body>`.
     */
    it('returns focus to the element that opened it, without waiting for a transition', async () => {
      const trigger = fixture.nativeElement.querySelector('#trigger') as HTMLElement;
      trigger.focus();
      expect(document.activeElement).toBe(trigger);

      // The open moves focus off the trigger by itself (#227), so this restores
      // something rather than asserting that focus never moved. It used to be a
      // `.focus()` call here, with a comment saying that is what a real open
      // does — and the panel it was standing in for was not doing it.
      // `side-panel-focus-capture.spec.ts` owns that half.
      await openPanelAndSettle();
      expect(document.activeElement).not.toBe(trigger);

      host.open.set(false);
      fixture.detectChanges();

      expect(document.activeElement).toBe(trigger);
    });

    it('does not restore focus a second time when the close transition ends', async () => {
      const trigger = fixture.nativeElement.querySelector('#trigger') as HTMLElement;
      const other = fixture.nativeElement.querySelector('#external-title') as HTMLElement;
      trigger.focus();

      await openPanelAndSettle();
      host.open.set(false);
      fixture.detectChanges();
      expect(document.activeElement).toBe(trigger);

      // Whatever the user focused after the close stays focused: the restore is
      // spent, so the late `transitionend` must not pull focus back again.
      other.tabIndex = -1;
      other.focus();
      endCloseTransition();

      expect(document.activeElement).toBe(other);
    });

    /**
     * `transitionend` is what emits `closed`, and jsdom never fires it — it has
     * no layout and runs no transitions. The event has to carry
     * `propertyName: 'transform'` and target the panel itself, because the
     * handler ignores every other transition and anything bubbling from a child.
     */
    function endCloseTransition(): void {
      const event = new Event('transitionend', { bubbles: false });
      Object.defineProperty(event, 'propertyName', { value: 'transform' });
      panel().dispatchEvent(event);
      fixture.detectChanges();
    }
  });

  /**
   * Positive controls. Everything above asserts an empty `violated`, which axe
   * also returns when it looked at nothing — and looking at nothing is what the
   * reported scan did, so these are the assertions that keep the rest honest.
   */
  describe('the reported scan, and the structure this replaced', () => {
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

    /**
     * The reported measurement itself, kept as a test: scanning the component's
     * own element evaluates NOTHING about the dialog, because the overlay is in
     * `document.body`. This is why every assertion above roots its scan at the
     * overlay, and it fails if the portal is ever removed — at which point the
     * scans above should be rooted at the fixture instead.
     */
    it('evaluates no dialog rule against the component element, which is empty', async () => {
      openPanel();
      const hostElement = fixture.nativeElement.querySelector('tn-side-panel') as HTMLElement;

      const { violated, evaluated } = await axeResult(
        fixture.nativeElement, hostElement, DIALOG_RULES
      );

      expect(evaluated).toEqual([]);
      expect(violated).toEqual([]);
      expect(hostElement.querySelector('.tn-side-panel__overlay')).toBeNull();
    });

    /**
     * The pre-#214 markup for an untitled panel: `aria-labelledby` pointing at
     * an `<h2>` with no text in it. Both rules report, which is what makes
     * `expect(violated).toEqual([])` above worth something.
     */
    it('still reports a dialog named by an empty heading', async () => {
      const { violated } = await scan(
        '<div role="dialog" aria-modal="true" aria-labelledby="t">'
        + '<header><h2 id="t"></h2></header>'
        + '<button type="button">Dismiss</button>'
        + '</div>',
        '[role="dialog"]',
        ['aria-dialog-name'],
      );

      expect(violated).toEqual(['aria-dialog-name']);
    });

    it('still reports the empty heading itself', async () => {
      const { violated } = await scan(
        '<div role="dialog" aria-modal="true" aria-labelledby="t">'
        + '<header><h2 id="t"></h2></header>'
        + '</div>',
        'h2',
        ['empty-heading'],
      );

      expect(violated).toEqual(['empty-heading']);
    });
  });
});
