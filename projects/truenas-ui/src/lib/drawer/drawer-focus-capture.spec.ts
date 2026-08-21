import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TnDrawerContainerComponent } from './drawer-container.component';
import { TnDrawerContentComponent } from './drawer-content.component';
import { TnDrawerComponent } from './drawer.component';

/**
 * The drawer's half of #227: an `over` drawer is a modal dialog, so opening one
 * must put focus inside it.
 *
 * The defect was reported against `tn-side-panel`, and the ticket asked for this
 * component to be checked for the same thing rather than assumed clear —
 * `tn-drawer` was written from the side panel and the two have now reached
 * identical bugs three times (#214, #218, #227). It was NOT unaffected: it asked
 * for the capture the same way, with `[cdkTrapFocusAutoCapture]="trapFocus()"`,
 * and so had the same silent failure available to it — a drawer holding no
 * tabbable element opens with focus left behind it, under `aria-modal="true"`.
 * Both now go through `../a11y/initial-focus.ts`.
 *
 * What `side` mode must do is the opposite, and is asserted below: it is
 * persistent navigation beside the page's content, not a dialog, and a
 * navigation region that grabs focus when it appears is its own defect.
 */

@Component({
  selector: 'tn-drawer-focus-host',
  standalone: true,
  imports: [TnDrawerContainerComponent, TnDrawerComponent, TnDrawerContentComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <button type="button" id="trigger" (click)="opened.set(true)">Toggle</button>
    <!--
      Somewhere else on the page to be. A side-mode drawer is beside the
      content rather than over it, so the user is free to work here while it is
      open, and where focus is when the drawer goes away decides whether it
      owes them a restore. No backticks in here: this is an inline template,
      and one would end the template literal.
    -->
    <button type="button" id="elsewhere">Elsewhere</button>
    <tn-drawer-container>
      <tn-drawer ariaLabel="Datasets" [mode]="mode()" [(opened)]="opened">
        @if (withContent()) {
          <button type="button" id="in-drawer">Pools</button>
        } @else {
          <p>Nothing to focus in here</p>
        }
      </tn-drawer>
      <tn-drawer-content>
        <p>Main content</p>
      </tn-drawer-content>
    </tn-drawer-container>
  `,
})
class DrawerFocusHostComponent {
  mode = signal<'side' | 'over'>('over');
  opened = signal(false);
  withContent = signal(true);
}

describe('tn-drawer focus capture (#227)', () => {
  let fixture: ComponentFixture<DrawerFocusHostComponent>;
  let host: DrawerFocusHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawerFocusHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DrawerFocusHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // The over-mode overlay is portaled to document.body and only removed on
    // destroy, so without this the next fixture finds the previous one's panel.
    fixture.destroy();
  });

  /** In `over` mode the panel lives in the portaled overlay, in `side` mode inline. */
  function panel(): HTMLElement {
    return document.querySelector('.tn-drawer__panel') as HTMLElement;
  }

  function trigger(): HTMLElement {
    return fixture.nativeElement.querySelector('#trigger') as HTMLElement;
  }

  /**
   * Opens through the trigger and settles the render, which is what runs the
   * `afterNextRender` the focus is deferred to — a closed drawer is `inert`, and
   * focusing into an inert subtree does nothing. Nothing here touches focus
   * itself; the component moving it is the assertion.
   */
  async function openByClick(): Promise<void> {
    trigger().click();
    fixture.detectChanges();
    await fixture.whenStable();
  }

  describe('over mode, which is a modal dialog', () => {
    it('moves focus onto the panel when it opens', async () => {
      trigger().focus();
      expect(document.activeElement).toBe(trigger());

      await openByClick();

      expect(document.activeElement).toBe(panel());
      expect(panel().getAttribute('aria-modal')).toBe('true');
    });

    it('moves focus in even when the drawer holds nothing tabbable', async () => {
      host.withContent.set(false);
      fixture.detectChanges();
      trigger().focus();

      await openByClick();

      expect(panel().contains(document.activeElement)).toBe(true);
    });

    it('returns focus to the trigger on close, having really taken it away', async () => {
      trigger().focus();
      await openByClick();
      expect(document.activeElement).not.toBe(trigger());

      host.opened.set(false);
      fixture.detectChanges();

      expect(document.activeElement).toBe(trigger());
    });

    /**
     * Destroying a drawer that is still open — a route change, a `@if` around
     * the container — is the other way focus leaves it, and it runs no close.
     * The removal drops focus on `<body>`, and until #227 it was
     * `CdkTrapFocus.ngOnDestroy` that put it back, off the back of the
     * auto-capture that replaced.
     */
    it('returns focus to the trigger when a drawer is destroyed while open', async () => {
      trigger().focus();
      const opener = trigger();
      await openByClick();
      expect(document.activeElement).not.toBe(opener);

      fixture.destroy();

      expect(document.activeElement).toBe(opener);
    });

    /**
     * `@if (mode() === 'over')` destroys the panel focus is on, and the browser
     * falls back to `<body>` when a focused element goes away. Nothing else in
     * the component covers it: the drawer has not closed, so the close branch
     * does not run, and `tnFocusOnOpen` only acts on an edge INTO modality.
     * Until #227 `CdkTrapFocus.ngOnDestroy` restored here, off the back of the
     * auto-capture that replaced — so this is a regression the removal opened
     * rather than a case that never worked.
     */
    it('returns focus to the trigger when a switch to side destroys the panel holding it', async () => {
      trigger().focus();
      const opener = trigger();
      await openByClick();
      expect(document.activeElement).not.toBe(opener);

      host.mode.set('side');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(document.activeElement).toBe(opener);
    });

    /**
     * The other half, and the one an unconditional restore-on-destroy gets
     * wrong. This component has a standing route to it, which is why the case
     * is asserted here rather than only on `tn-side-panel`: an `over` open
     * records the opener, a breakpoint switches the drawer to `side` WITHOUT
     * closing it — so nothing spends that record — and the user carries on
     * using the page beside it. Destroying the drawer then, minutes later,
     * must not throw them back to a button they pressed before the resize.
     */
    it('leaves focus alone on destroy when a switch to side left the opener unspent', async () => {
      trigger().focus();
      await openByClick();

      host.mode.set('side');
      fixture.detectChanges();
      await fixture.whenStable();

      const elsewhere = fixture.nativeElement.querySelector('#elsewhere') as HTMLElement;
      elsewhere.focus();
      expect(document.activeElement).toBe(elsewhere);

      fixture.destroy();

      expect(document.activeElement).toBe(elsewhere);
    });
  });

  describe('side mode, which is navigation', () => {
    it('leaves focus where the user put it when it opens', async () => {
      host.mode.set('side');
      fixture.detectChanges();
      trigger().focus();

      await openByClick();

      expect(document.activeElement).toBe(trigger());
    });

    /**
     * A responsive drawer crossing its breakpoint while open: `side` to `over`
     * makes it modal, and a modal surface the user is now inside owes them the
     * same focus contract as one that just opened.
     */
    it('captures when a drawer already open switches from side to over', async () => {
      host.mode.set('side');
      fixture.detectChanges();
      trigger().focus();
      await openByClick();
      expect(document.activeElement).toBe(trigger());

      host.mode.set('over');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(document.activeElement).toBe(panel());
    });
  });
});
