import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TnDrawerContainerComponent } from './drawer-container.component';
import { TnDrawerContentComponent } from './drawer-content.component';
import { TN_DRAWER_DEFAULT_LABEL, TnDrawerComponent } from './drawer.component';
import { axeResult } from '../a11y/axe-testing';

/**
 * Guards the ARIA structure of the drawer family after #214.
 *
 * WHAT WAS REPORTED, AND WHAT WAS ACTUALLY THERE
 * ----------------------------------------------
 * The ticket reported axe evaluating ZERO rules against `tn-drawer-container`.
 * Measured against the unchanged component that is exactly right, and it is not
 * a defect in the container: it renders `<ng-content />` and a stylesheet, so a
 * container with nothing in it has nothing for a rule to match. The scan in the
 * report was the childless case — the same way #204's turned out to be a stepper
 * with no steps. `the reported scan` at the bottom keeps that measurement.
 *
 * The surface a user perceives is `tn-drawer`, and it already declared a model,
 * one per mode: `role="navigation"` in `side` mode, `role="dialog"` with
 * `aria-modal="true"` and a `cdkTrapFocus` in `over` mode. Escape, the backdrop
 * click and focus restoration were implemented for `over` before this ticket.
 *
 * WHY THE CONTAINER STILL GETS NO ROLE
 * ------------------------------------
 * Giving it one would put a second, unnamed thing in the accessibility tree
 * between a listener and the drawer, describing a flex row. `the container is a
 * layout box` asserts that from both sides: nothing is attributed to the
 * container, and the drawer inside it is what the rules do report on.
 *
 * WHAT WAS REALLY MISSING
 * -----------------------
 * - **A name in the default configuration.** `ariaLabel` defaults to
 *   `undefined`, so an `over` drawer was a modal dialog with no name at all —
 *   `aria-dialog-name`, measured. In `side` mode the same omission leaves a
 *   `navigation` landmark unnamed, which axe does not report while a page has
 *   only one.
 * - **Inertness when closed.** The panel keeps whatever was projected into it
 *   under `aria-hidden="true"`, so a keyboard user could Tab into a closed
 *   drawer. axe cannot decide `aria-hidden-focus` under jsdom, and `axeResult`
 *   throws on an undecided rule rather than counting it either way — so that
 *   half is asserted against the DOM.
 */

@Component({
  selector: 'tn-drawer-a11y-host',
  standalone: true,
  imports: [TnDrawerContainerComponent, TnDrawerComponent, TnDrawerContentComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <button type="button" id="trigger">Toggle</button>
    <h2 id="external-title">Datasets</h2>
    <tn-drawer-container>
      <tn-drawer
        [mode]="mode()"
        [ariaLabel]="ariaLabel()"
        [ariaLabelledby]="ariaLabelledby()"
        [(opened)]="opened">
        <button type="button" id="in-drawer">Pools</button>
      </tn-drawer>
      <tn-drawer-content>
        <p>Main content</p>
      </tn-drawer-content>
    </tn-drawer-container>
  `,
})
class DrawerA11yHostComponent {
  mode = signal<'side' | 'over'>('side');
  opened = signal(false);
  ariaLabel = signal<string | undefined>(undefined);
  ariaLabelledby = signal<string | null>(null);
}

@Component({
  selector: 'tn-bare-container-host',
  standalone: true,
  imports: [TnDrawerContainerComponent],
  template: '<tn-drawer-container><p>Nothing but content</p></tn-drawer-container>',
})
class BareContainerHostComponent {}

/**
 * The rules a drawer panel's structure can be wrong under.
 *
 * `aria-dialog-name` is the one the fix is about in `over` mode. `aria-roles`
 * and `aria-allowed-role` cover the mode-dependent role itself, and the three
 * attribute rules cover `aria-modal`, `aria-label` and `aria-labelledby` landing
 * on it.
 *
 * NOT `aria-hidden-focus` and NOT `color-contrast`: both come back `incomplete`
 * under jsdom, and `axeResult` throws on an undecided rule rather than letting
 * it satisfy an `evaluated` assertion while contributing nothing to `violated`.
 * `a closed drawer is inert` covers the first from the DOM side.
 *
 * NOT `landmark-unique` either, which is the one that would report an unnamed
 * `navigation` landmark — it needs two landmarks of the same role and name to
 * report anything, so a single drawer cannot exercise it. `two side drawers`
 * below is where it earns its place.
 */
const PANEL_RULES = [
  'aria-dialog-name',
  'aria-allowed-attr',
  'aria-required-attr',
  'aria-valid-attr-value',
  'aria-allowed-role',
  'aria-roles',
  'nested-interactive',
];

describe('drawer accessibility (#214)', () => {
  let fixture: ComponentFixture<DrawerA11yHostComponent>;
  let host: DrawerA11yHostComponent;
  let warn: jest.SpyInstance;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawerA11yHostComponent, BareContainerHostComponent],
    }).compileComponents();

    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    fixture = TestBed.createComponent(DrawerA11yHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // In `over` mode the panel is portaled to document.body and only removed on
    // destroy, so without this a later fixture scans the previous one's panel.
    fixture.destroy();
    warn.mockRestore();
  });

  /** Side mode renders inline; over mode is portaled to `document.body`. */
  function panel(): HTMLElement {
    return (host.mode() === 'over'
      ? document.body.querySelector('.tn-drawer__panel--over')
      : fixture.nativeElement.querySelector('.tn-drawer__panel')) as HTMLElement;
  }

  /** The tree a scan has to be rooted at for the panel to be inside it. */
  function root(): HTMLElement {
    return (host.mode() === 'over'
      ? panel().parentElement
      : fixture.nativeElement) as HTMLElement;
  }

  function container(): HTMLElement {
    return fixture.nativeElement.querySelector('tn-drawer-container') as HTMLElement;
  }

  function openOver(): void {
    host.mode.set('over');
    host.opened.set(true);
    fixture.detectChanges();
  }

  describe('the container is a layout box', () => {
    it('renders no role, no landmark and no name of its own', () => {
      expect(container().getAttribute('role')).toBeNull();
      expect(container().getAttribute('aria-label')).toBeNull();
      expect(container().getAttribute('aria-labelledby')).toBeNull();
    });

    /**
     * The reported measurement, kept as a test: a container with nothing in it
     * has nothing for a rule to match, so `violated` and `evaluated` are BOTH
     * empty. This is what made the report's clean scan meaningless, and it is
     * why every assertion below names `evaluated`.
     */
    it('evaluates no rule at all when it holds nothing, which is the reported scan', async () => {
      const bare = TestBed.createComponent(BareContainerHostComponent);
      bare.detectChanges();
      const bareContainer = bare.nativeElement.querySelector('tn-drawer-container') as HTMLElement;

      try {
        const { violated, evaluated } = await axeResult(
          bare.nativeElement, bareContainer, PANEL_RULES
        );

        expect(evaluated).toEqual([]);
        expect(violated).toEqual([]);
      } finally {
        bare.destroy();
      }
    });

    /**
     * The other side of the same claim: with a drawer inside, rules DO run —
     * and axe attributes them to the drawer's panel, never to the container.
     * A role added to the container would break this, which is the point.
     */
    it('holds a drawer that the rules are attributed to instead', async () => {
      host.opened.set(true);
      fixture.detectChanges();

      const onPanel = await axeResult(root(), panel(), PANEL_RULES);
      const onContainer = await axeResult(root(), container(), PANEL_RULES);

      expect(onPanel.evaluated.length).toBeGreaterThan(0);
      expect(onContainer.evaluated).toEqual([]);
    });
  });

  describe('the model each mode declares', () => {
    it('is a navigation landmark in side mode, which the page stays usable behind', () => {
      expect(panel().getAttribute('role')).toBe('navigation');
      expect(panel().getAttribute('aria-modal')).toBeNull();
    });

    it('is a modal dialog in over mode', () => {
      openOver();

      expect(panel().getAttribute('role')).toBe('dialog');
      expect(panel().getAttribute('aria-modal')).toBe('true');
    });

    // `aria-modal` is a claim about the rest of the page being unavailable, so
    // it must not outlive the focus trap that makes it true.
    it('drops aria-modal when the over drawer closes', () => {
      openOver();
      host.opened.set(false);
      fixture.detectChanges();

      expect(panel().getAttribute('aria-modal')).toBeNull();
    });
  });

  describe('the drawer has a name', () => {
    it('falls back to a generic name when the caller sets neither input', () => {
      expect(panel().getAttribute('aria-label')).toBe(TN_DRAWER_DEFAULT_LABEL);
    });

    it('warns in dev mode when it falls back', () => {
      expect(warn).toHaveBeenCalled();
      expect(warn.mock.calls[0][0]).toContain('[tn-drawer]');
    });

    it('takes an explicit ariaLabel', () => {
      host.ariaLabel.set('Storage navigation');
      fixture.detectChanges();

      expect(panel().getAttribute('aria-label')).toBe('Storage navigation');
    });

    it('takes an ariaLabelledby, and renders no fallback label beside it', () => {
      host.ariaLabelledby.set('external-title');
      fixture.detectChanges();

      expect(panel().getAttribute('aria-labelledby')).toBe('external-title');
      expect(panel().getAttribute('aria-label')).toBeNull();
    });

    it('names the over-mode dialog too, which is where axe reported it', async () => {
      openOver();

      expect(panel().getAttribute('aria-label')).toBe(TN_DRAWER_DEFAULT_LABEL);

      const { violated, evaluated } = await axeResult(root(), panel(), PANEL_RULES);
      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-dialog-name');
    });
  });

  describe('axe over the open panel', () => {
    // `evaluated` is asserted alongside every empty `violated`, because an empty
    // `violations` is also what axe returns when it evaluated nothing — which is
    // the defect this ticket reported, not a hypothetical.
    it('raises no violation in side mode, and does evaluate the rules', async () => {
      host.opened.set(true);
      fixture.detectChanges();

      const { violated, evaluated } = await axeResult(root(), panel(), PANEL_RULES);

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-allowed-attr');
      expect(evaluated).toContain('aria-roles');
    });

    it('raises no violation in over mode, labelled by the caller', async () => {
      host.ariaLabel.set('Storage navigation');
      openOver();

      const { violated, evaluated } = await axeResult(root(), panel(), PANEL_RULES);

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-dialog-name');
    });
  });

  describe('what a closed drawer exposes', () => {
    it('is inert as well as aria-hidden while closed, in side mode', () => {
      expect(panel().getAttribute('aria-hidden')).toBe('true');
      expect(panel().hasAttribute('inert')).toBe(true);
      // The inert subtree is around what the caller projected — which is what a
      // keyboard user could otherwise Tab into while it is clipped to nothing.
      expect(panel().querySelector('#in-drawer')).not.toBeNull();
    });

    it('is inert as well as aria-hidden while closed, in over mode', () => {
      host.mode.set('over');
      fixture.detectChanges();

      expect(panel().getAttribute('aria-hidden')).toBe('true');
      expect(panel().hasAttribute('inert')).toBe(true);
    });

    it('drops both when it opens', () => {
      host.opened.set(true);
      fixture.detectChanges();

      expect(panel().getAttribute('aria-hidden')).toBeNull();
      expect(panel().hasAttribute('inert')).toBe(false);
    });

    it('takes them back on close', () => {
      openOver();
      host.opened.set(false);
      fixture.detectChanges();

      expect(panel().getAttribute('aria-hidden')).toBe('true');
      expect(panel().hasAttribute('inert')).toBe(true);
    });
  });

  describe('the keyboard contract each model brings', () => {
    it('closes an over drawer on Escape, which the modal model implies', () => {
      openOver();
      panel().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      fixture.detectChanges();

      expect(host.opened()).toBe(false);
    });

    /**
     * Side mode is persistent navigation and declares no modal contract, so
     * Escape is not part of one — the toggle that opened it is the control. This
     * is asserted rather than left implicit because the ticket's rule cuts both
     * ways: a contract declared in ARIA has to be implemented, and one that is
     * not declared must not be half-implemented either.
     */
    it('leaves a side drawer open on Escape, having declared no modal contract', () => {
      host.opened.set(true);
      fixture.detectChanges();
      panel().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      fixture.detectChanges();

      expect(host.opened()).toBe(true);
    });

    /**
     * Restoration happens on close, and this test deliberately does NOT dispatch
     * a `transitionend` — because that is exactly what a user with
     * `prefers-reduced-motion` never gets. This component's stylesheet sets
     * `transition: none` on an initialized panel under that preference, so the
     * event never fires, and the panel is `inert` from the moment it closes:
     * waiting for the event would leave focus on `<body>`.
     */
    it('returns focus to the opener on close, without waiting for a transition', () => {
      const trigger = fixture.nativeElement.querySelector('#trigger') as HTMLElement;
      trigger.focus();
      expect(document.activeElement).toBe(trigger);

      openOver();
      (panel().querySelector('#in-drawer') as HTMLElement).focus();
      expect(document.activeElement).not.toBe(trigger);

      host.opened.set(false);
      fixture.detectChanges();

      expect(document.activeElement).toBe(trigger);
    });

    /**
     * A responsive layout crossing its breakpoint switches `mode` while the
     * drawer is open. That is not a close, so the component must not spend its
     * one saved focus on it — the drawer is still on screen, and the close that
     * follows later is what the saved element is for.
     *
     * Focus does still leave the drawer at the switch: `mode` decides which of
     * two panels the template renders, so the over-mode panel is DESTROYED and
     * the browser drops focus on `<body>`. It used to be `CdkTrapFocus` that
     * put it back, from a capture of its own — the component's saved element
     * was never spent on it, which is what let the close below still restore.
     * Both halves come out of the one saved element now (#227), and the
     * component focuses it at the switch without consuming it, so what this
     * test asserts is unchanged.
     *
     * What this asserts is the part the component owns: the saved element
     * survives the mode change, so the eventual close still restores it. Without
     * the `!opened` guard the mode change consumes it and the close below
     * restores nothing.
     */
    it('saves its restore for the close, not for a mode change while open', () => {
      const trigger = fixture.nativeElement.querySelector('#trigger') as HTMLElement;
      const other = fixture.nativeElement.querySelector('#external-title') as HTMLElement;
      other.tabIndex = -1;
      trigger.focus();

      openOver();
      (panel().querySelector('#in-drawer') as HTMLElement).focus();

      host.mode.set('side');
      fixture.detectChanges();
      expect(host.opened()).toBe(true);

      // Somewhere else entirely, so the close below has something to restore
      // FROM — otherwise focus sitting on the trigger would prove nothing.
      other.focus();

      host.opened.set(false);
      fixture.detectChanges();

      expect(document.activeElement).toBe(trigger);
    });

    it('does not pull focus back again when the close transition ends', () => {
      const trigger = fixture.nativeElement.querySelector('#trigger') as HTMLElement;
      const other = fixture.nativeElement.querySelector('#external-title') as HTMLElement;
      trigger.focus();

      openOver();
      (panel().querySelector('#in-drawer') as HTMLElement).focus();
      host.opened.set(false);
      fixture.detectChanges();
      expect(document.activeElement).toBe(trigger);

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
   * also returns when it looked at nothing.
   */
  describe('the structure this replaced', () => {
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
     * The pre-#214 over-mode panel: a modal dialog with no name, because
     * `ariaLabel` was optional and defaulted to nothing. This is the control for
     * `aria-dialog-name` reporting at all, and for `axeResult` attributing it.
     */
    it('still reports an over-mode drawer with no accessible name', async () => {
      const { violated } = await scan(
        '<div role="dialog" aria-modal="true" tabindex="-1" class="tn-drawer__panel">'
        + '<button type="button">Pools</button>'
        + '</div>',
        '[role="dialog"]',
        ['aria-dialog-name'],
      );

      expect(violated).toEqual(['aria-dialog-name']);
    });

    /**
     * Why `landmark-unique` is not in `PANEL_RULES`, measured rather than
     * asserted in a comment: two unnamed `navigation` landmarks are what it
     * takes to report, which one drawer on a page cannot produce. The generic
     * fallback name does not fix this either — two drawers both called "Drawer"
     * are still not unique — which is what the dev-mode warning is for, and what
     * the LOW left unfixed in the pull request describes.
     */
    it('reports two unnamed navigation landmarks, which one drawer cannot', async () => {
      const { violated } = await scan(
        '<div><nav class="a"><a href="#x">One</a></nav>'
        + '<nav class="b"><a href="#y">Two</a></nav></div>',
        'nav.a',
        ['landmark-unique'],
      );

      expect(violated).toEqual(['landmark-unique']);
    });
  });
});
