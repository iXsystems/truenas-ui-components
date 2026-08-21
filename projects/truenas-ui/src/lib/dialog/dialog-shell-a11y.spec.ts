import { Dialog, DIALOG_DATA } from '@angular/cdk/dialog';
import type { DialogConfig } from '@angular/cdk/dialog';
import { Component, inject, signal } from '@angular/core';
import type { WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TN_DIALOG_SHELL_DEFAULT_LABEL, TnDialogShellComponent } from './dialog-shell.component';
import { TnDialog } from './dialog.service';
import { axeResult } from '../a11y/axe-testing';

/**
 * Guards the accessible name of `tn-dialog-shell` (#219).
 *
 * WHAT WAS REPORTED, AND WHAT WAS MEASURED
 * ----------------------------------------
 * The ticket read the defect off the template rather than from a scan, and
 * described the untitled dialog as being NAMED BY the empty `<h2>`. Measured
 * against the unchanged component, it was worse than that: the effect that
 * points `aria-labelledby` at the heading returned early when `title` was
 * empty, so the CDK container carried no naming attribute at all —
 *
 *     {ariaLabelledby: null, ariaLabel: null, role: 'dialog'}
 *     axe: violated ['aria-dialog-name'] on the dialog, ['empty-heading'] on the h2
 *
 * — and the dialog had no name from any route. `aria-dialog-name` reports
 * either way, which is why the distinction did not change the fix. Both shapes
 * are kept as positive controls in `the structure this replaced`, because they
 * are different markups and only one of them was ever in this repository.
 *
 * A TITLED dialog was already clean before this ticket, and the same scan says
 * so above: `aria-dialog-name` evaluated and did not report. So the change here
 * is only about the untitled case, and `is named by its visible heading` is a
 * regression guard rather than a fix.
 *
 * WHERE THE MARKUP IS
 * -------------------
 * The dialog is portaled into `.cdk-overlay-container` on `document.body`, and
 * `role="dialog"` is on the CDK's `<cdk-dialog-container>` — an ancestor of
 * this component, not part of its own template. So the scans are rooted in the
 * overlay and target the CDK element, and the component reaches it with
 * `closest()`. `evaluates no dialog rule against the host element` keeps that
 * measurement, and fails if the portal is ever removed.
 */

/** Inputs the tests vary, in signals so a case sets them before opening. */
interface DialogShellA11yState {
  title: WritableSignal<string>;
  ariaLabel: WritableSignal<string | null>;
  ariaLabelledby: WritableSignal<string | null>;
}

/* eslint-disable @angular-eslint/component-max-inline-declarations */

@Component({
  selector: 'tn-dialog-shell-a11y-content',
  standalone: true,
  imports: [TnDialogShellComponent],
  template: `
    <tn-dialog-shell
      [title]="state.title()"
      [ariaLabel]="state.ariaLabel()"
      [ariaLabelledby]="state.ariaLabelledby()">
      <p>Dialog body</p>
    </tn-dialog-shell>
  `,
})
class DialogShellA11yContentComponent {
  protected state = inject<DialogShellA11yState>(DIALOG_DATA);
}

/** Holds the element the `ariaLabelledby` cases point at. */
@Component({
  selector: 'tn-dialog-shell-a11y-host',
  standalone: true,
  template: '<h2 id="external-dialog-title">Delete dataset</h2>',
})
class DialogShellA11yHostComponent {}

/* eslint-enable @angular-eslint/component-max-inline-declarations */

/**
 * The rules an open dialog's structure can be wrong under.
 *
 * `aria-dialog-name` is the one the fix is about. The rest are here because the
 * change moved what names the dialog and writes two attributes onto the same
 * element: the cheapest way for that to go wrong is an attribute landing on a
 * role that does not allow it, or an IDREF that resolves to nothing.
 *
 * NOT `empty-heading`: it reports on the `<h2>`, not on the dialog, so it is
 * asserted where its target is — in `the heading the dialog is named by`.
 */
const DIALOG_RULES = [
  'aria-dialog-name',
  'aria-allowed-attr',
  'aria-required-attr',
  'aria-valid-attr-value',
  'aria-allowed-role',
  'aria-roles',
];

describe('tn-dialog-shell accessibility (#219)', () => {
  let fixture: ComponentFixture<DialogShellA11yHostComponent>;
  let state: DialogShellA11yState;
  let dialog: TnDialog;
  let cdkDialog: Dialog;
  let warn: jest.SpyInstance;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogShellA11yHostComponent, DialogShellA11yContentComponent],
    }).compileComponents();

    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    fixture = TestBed.createComponent(DialogShellA11yHostComponent);
    fixture.detectChanges();

    state = {
      title: signal('Delete dataset'),
      ariaLabel: signal<string | null>(null),
      ariaLabelledby: signal<string | null>(null),
    };
    dialog = TestBed.inject(TnDialog);
    cdkDialog = TestBed.inject(Dialog);
  });

  afterEach(() => {
    // An open dialog lives in `document.body` rather than in the fixture, so a
    // test that left one there would be scanned by the next one as well as its
    // own. `mockRestore` last, so a throw from either close cannot leak the
    // `console.warn` mock into the following test.
    cdkDialog.closeAll();
    fixture.destroy();
    warn.mockRestore();
  });

  function openDialog(config: Partial<DialogConfig> = {}): void {
    dialog.open(DialogShellA11yContentComponent, { ...config, data: state });
    fixture.detectChanges();
  }

  /** The CDK element that carries `role="dialog"` — what has to be named. */
  function container(): HTMLElement {
    return document.body.querySelector('cdk-dialog-container') as HTMLElement;
  }

  /** The scanned root: the dialog is portaled here, not into the fixture. */
  function overlayContainer(): HTMLElement {
    return document.body.querySelector('.cdk-overlay-container') as HTMLElement;
  }

  function heading(): HTMLElement | null {
    return container().querySelector('.tn-dialog__title');
  }

  describe('the dialog has a name', () => {
    it('is named by its visible heading when it has a title', () => {
      openDialog();

      expect(container().getAttribute('aria-labelledby')).toBe(heading()!.id);
      expect(heading()!.textContent!.trim()).toBe('Delete dataset');
      // No `aria-label` beside it: it would win the name calculation over the
      // heading and replace what the user can see with something they cannot.
      expect(container().getAttribute('aria-label')).toBeNull();
      expect(warn).not.toHaveBeenCalled();
    });

    it('falls back to a generic name when it has no title and no label', () => {
      state.title.set('');
      openDialog();

      expect(container().getAttribute('aria-labelledby')).toBeNull();
      expect(container().getAttribute('aria-label')).toBe(TN_DIALOG_SHELL_DEFAULT_LABEL);
    });

    it('warns in dev mode when it falls back, and names the input to use', () => {
      state.title.set('');
      openDialog();

      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0][0]).toContain('[tn-dialog-shell]');
      expect(warn.mock.calls[0][0]).toContain('title');
    });

    it('takes an explicit ariaLabel for a dialog that renders no heading', () => {
      state.title.set('');
      state.ariaLabel.set('Add dataset');
      openDialog();

      expect(container().getAttribute('aria-label')).toBe('Add dataset');
      expect(container().getAttribute('aria-labelledby')).toBeNull();
      expect(warn).not.toHaveBeenCalled();
    });

    it('takes an ariaLabelledby, and renders no aria-label beside it', () => {
      state.title.set('');
      state.ariaLabelledby.set('external-dialog-title');
      openDialog();

      expect(container().getAttribute('aria-labelledby')).toBe('external-dialog-title');
      expect(container().getAttribute('aria-label')).toBeNull();
      expect(warn).not.toHaveBeenCalled();
    });

    /**
     * `aria-labelledby` wins the ARIA name calculation when it resolves, so the
     * visible heading is what a listener hears — but an explicit `ariaLabel` is
     * still emitted beside it. That is `tnAccessibleName`'s rule and not this
     * component's: suppressing an explicit label would be safe only while the
     * IDREF resolves, and against a heading that has not rendered it would
     * leave the dialog unnamed in exactly the case where the caller named it.
     */
    it('is named by the visible title, and keeps an explicit label beside it', () => {
      state.ariaLabel.set('Something else');
      state.ariaLabelledby.set('external-dialog-title');
      openDialog();

      expect(container().getAttribute('aria-labelledby')).toBe(heading()!.id);
      expect(container().getAttribute('aria-label')).toBe('Something else');
    });

    it('treats a whitespace-only title as no title', () => {
      state.title.set('   ');
      openDialog();

      expect(heading()).toBeNull();
      expect(container().getAttribute('aria-label')).toBe(TN_DIALOG_SHELL_DEFAULT_LABEL);
    });
  });

  /**
   * A dialog can also be named through CDK's own route, `DialogConfig`. This
   * component writes both naming attributes onto the container the config would
   * have rendered them on, so without consulting the config it would clear a
   * name the opener had supplied — and replace it with the generic fallback,
   * which is the one case where the fallback would be actively worse than
   * nothing.
   */
  describe('a name passed to TnDialog.open rather than to the shell', () => {
    it('keeps a DialogConfig ariaLabel, and raises no fallback warning', () => {
      state.title.set('');
      openDialog({ ariaLabel: 'Add dataset' });

      expect(container().getAttribute('aria-label')).toBe('Add dataset');
      expect(warn).not.toHaveBeenCalled();
    });

    it('keeps a DialogConfig ariaLabelledBy', () => {
      state.title.set('');
      openDialog({ ariaLabelledBy: 'external-dialog-title' });

      expect(container().getAttribute('aria-labelledby')).toBe('external-dialog-title');
      expect(container().getAttribute('aria-label')).toBeNull();
      expect(warn).not.toHaveBeenCalled();
    });

    it('is still named by its own title, which is the visible one', () => {
      openDialog({ ariaLabelledBy: 'external-dialog-title' });

      expect(container().getAttribute('aria-labelledby')).toBe(heading()!.id);
    });

    /**
     * A BLANK input is not a name, and must not count as one while the routes
     * are being chosen between. Coalescing with `??` would stop at the empty
     * string — "provided" — never reach the config, and hand the dialog the
     * generic fallback while a real name sat one route further down. That is
     * the single case where the fallback is worse than doing nothing, so both
     * routes are pinned here rather than left to the helper.
     */
    it('does not let a blank ariaLabel input shadow a DialogConfig ariaLabel', () => {
      state.title.set('');
      state.ariaLabel.set('');
      openDialog({ ariaLabel: 'Add dataset' });

      expect(container().getAttribute('aria-label')).toBe('Add dataset');
      expect(warn).not.toHaveBeenCalled();
    });

    it('does not let a blank ariaLabelledby input clear a DialogConfig ariaLabelledBy', () => {
      state.title.set('');
      state.ariaLabelledby.set('   ');
      openDialog({ ariaLabelledBy: 'external-dialog-title' });

      expect(container().getAttribute('aria-labelledby')).toBe('external-dialog-title');
      expect(container().getAttribute('aria-label')).toBeNull();
      expect(warn).not.toHaveBeenCalled();
    });

    /**
     * With nothing to fall through TO, a blank input still ends at the fallback
     * and still warns — the same state as passing nothing at all. This is what
     * says the fix above changed which route is consulted rather than making a
     * blank string into a name.
     */
    it('still falls back, and warns, when the only names offered are blank', () => {
      state.title.set('');
      state.ariaLabel.set('');
      state.ariaLabelledby.set('   ');
      openDialog();

      expect(container().getAttribute('aria-labelledby')).toBeNull();
      expect(container().getAttribute('aria-label')).toBe(TN_DIALOG_SHELL_DEFAULT_LABEL);
      expect(warn).toHaveBeenCalledTimes(1);
    });
  });

  describe('the heading the dialog is named by', () => {
    it('renders no heading element at all when there is no title', () => {
      state.title.set('');
      openDialog();

      expect(heading()).toBeNull();

      // Said again without the class, because `heading()` depends on one:
      // renaming `.tn-dialog__title` while still rendering an unconditional
      // empty `<h2>` would leave the assertion above passing with an empty
      // level-2 heading back in the header and back in the document outline.
      //
      // Not an axe scan. `empty-heading` selects heading elements, so with none
      // rendered there is nothing for it to evaluate and it reports clean
      // whatever the header holds — a vacuous result. The rule's teeth are
      // asserted where it does have a target: `still reports the empty heading
      // itself`, below.
      expect(container().querySelectorAll('h1, h2, h3, h4, h5, h6')).toHaveLength(0);
    });

    it('renders the heading, with the id the dialog points at, when there is one', async () => {
      openDialog();

      expect(heading()!.tagName).toBe('H2');
      const { violated, evaluated } = await axeResult(
        container(), heading(), ['empty-heading']
      );
      expect(violated).toEqual([]);
      expect(evaluated).toContain('empty-heading');
    });
  });

  describe('axe over the open dialog', () => {
    // `evaluated` is asserted alongside every empty `violated`, because an empty
    // `violations` is also what axe returns when it evaluated nothing.
    it('raises no violation on a titled dialog, and does evaluate the dialog rules', async () => {
      openDialog();

      const { violated, evaluated } = await axeResult(
        overlayContainer(), container(), DIALOG_RULES
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-dialog-name');
    });

    it('raises no violation on an untitled dialog, which is the default', async () => {
      state.title.set('');
      openDialog();

      const { violated, evaluated } = await axeResult(
        overlayContainer(), container(), DIALOG_RULES
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-dialog-name');
    });

    it('raises no violation on a dialog named by an IDREF outside it', async () => {
      state.title.set('');
      state.ariaLabelledby.set('external-dialog-title');
      openDialog();

      const { violated, evaluated } = await axeResult(
        overlayContainer(), container(), DIALOG_RULES
      );

      // `aria-valid-attr-value` is the one that would report if the IDREF did
      // not resolve — the target is in the fixture, outside the scanned root,
      // and axe resolves IDREFs against the document.
      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-valid-attr-value');
    });
  });

  /**
   * Positive controls. Everything above asserts an empty `violated`, which axe
   * also returns when it looked at nothing — so these are the assertions that
   * keep the rest honest.
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
     * Why every scan above is rooted in the overlay container: the dialog is
     * portaled out of the component tree, so a scan rooted at the fixture
     * evaluates nothing about it. If the portal is ever removed, this fails and
     * those scans should be rooted at the fixture instead.
     */
    it('evaluates no dialog rule against the host element, which holds no dialog', async () => {
      openDialog();

      const { violated, evaluated } = await axeResult(
        fixture.nativeElement, fixture.nativeElement, DIALOG_RULES
      );

      expect(evaluated).toEqual([]);
      expect(violated).toEqual([]);
      expect(fixture.nativeElement.querySelector('cdk-dialog-container')).toBeNull();
    });

    /**
     * What this component actually did before the fix: the naming effect
     * returned early on an empty title, so the container carried no naming
     * attribute at all.
     */
    it('still reports a dialog with no naming attribute', async () => {
      const { violated } = await scan(
        '<div role="dialog" aria-modal="true">'
        + '<header><h2 id="t"></h2></header>'
        + '<button type="button">Close dialog</button>'
        + '</div>',
        '[role="dialog"]',
        ['aria-dialog-name'],
      );

      expect(violated).toEqual(['aria-dialog-name']);
    });

    /**
     * And the shape the ticket described — named by the empty heading. Not what
     * was in this repository, but it is what pointing the existing effect at the
     * heading unconditionally would have produced, so it is worth pinning that
     * doing so would have cleared nothing.
     */
    it('still reports a dialog named by an empty heading', async () => {
      const { violated } = await scan(
        '<div role="dialog" aria-modal="true" aria-labelledby="t">'
        + '<header><h2 id="t"></h2></header>'
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
