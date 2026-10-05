import { Dialog } from '@angular/cdk/dialog';
import type { DialogRef } from '@angular/cdk/dialog';
import { Component, afterNextRender, signal, ChangeDetectionStrategy } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TnSidePanelComponent } from './side-panel.component';

/**
 * Guards what `tn-side-panel` stacks against, and how, after #322 moved it onto
 * CDK `Overlay`.
 *
 * WHAT WAS WRONG
 * --------------
 * The panel appended its overlay to `<body>` itself, with `z-index: 1000` — the
 * same `z-index` the CDK overlay container carries, on a sibling element. Which
 * of the two won was decided by which `<body>` received last, and nothing about
 * that follows the order things were opened in: a panel opened FROM a dialog
 * rendered under that dialog's backdrop, click-blocked and invisible, while a
 * dialog raised during the panel's first render came out underneath the panel.
 * Consumers worked around it by re-homing the element into
 * `.cdk-overlay-container` and overriding the rule's `z-index` and
 * `pointer-events` in their own global stylesheet.
 *
 * WHAT DECIDES THE ORDER NOW, AND WHY THIS FILE CAN MEASURE IT
 * ------------------------------------------------------------
 * The order overlays ATTACH, in both of CDK's two implementations of it:
 *
 * - On a browser with the popover API, each overlay host is a
 *   `popover="manual"` element and attaching calls `showPopover()`, which puts
 *   it at the top of the browser's top layer. `z-index` does not enter into it,
 *   which is also why no `z-index` on a `<body>` child could ever have beaten a
 *   CDK overlay there.
 * - Without it — which is jsdom, so it is what these tests exercise — CDK's
 *   `OverlayRef._updateStackingOrder()` moves the host to the END of the
 *   overlay container on every attach, and equal `z-index` siblings paint in
 *   DOM order.
 *
 * So the DOM order asserted below is the same property the top layer enforces
 * elsewhere, read through the implementation this environment has.
 */

@Component({
  selector: 'tn-side-panel-stacking-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  template: '<p>Dialog body</p>',
})
class StackingDialogComponent {}

@Component({
  selector: 'tn-side-panel-stacking-host',
  standalone: true,
  imports: [TnSidePanelComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <tn-side-panel title="Edit dataset" [(open)]="open">
      <p>Panel body</p>
    </tn-side-panel>
  `,
})
class StackingHostComponent {
  open = signal(false);
}

describe('tn-side-panel overlay stacking (#322)', () => {
  let fixture: ComponentFixture<StackingHostComponent>;
  let host: StackingHostComponent;
  let dialog: Dialog;
  let openDialogs: DialogRef<unknown, unknown>[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StackingHostComponent],
    }).compileComponents();

    dialog = TestBed.inject(Dialog);
    openDialogs = [];

    fixture = TestBed.createComponent(StackingHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    openDialogs.forEach((ref) => ref.close());
    fixture.destroy();
  });

  function openDialog(): DialogRef<unknown, unknown> {
    const ref = dialog.open(StackingDialogComponent) as DialogRef<unknown, unknown>;
    openDialogs.push(ref);
    return ref;
  }

  function container(): HTMLElement {
    return document.querySelector('.cdk-overlay-container') as HTMLElement;
  }

  function panelOverlay(): HTMLElement | null {
    return document.querySelector('.tn-side-panel__overlay');
  }

  function dialogContainer(): HTMLElement {
    const containers = container().querySelectorAll('cdk-dialog-container');
    return containers[containers.length - 1] as HTMLElement;
  }

  /**
   * End the close transition, which is what releases the CDK overlay.
   *
   * The overlay outlives the close itself so the slide-out can run. Assembled
   * from `Event` because jsdom implements no `TransitionEvent` constructor —
   * the same stand-in `side-panel-lifecycle.spec.ts` uses, for the same
   * reason.
   */
  function settleClose(): void {
    const transitionend = Object.assign(new Event('transitionend'), { propertyName: 'transform' });
    panelOverlay()!.querySelector('.tn-side-panel__panel')!.dispatchEvent(transitionend);
    fixture.detectChanges();
  }

  /**
   * Which of the overlay container's children `element` is inside, which is the
   * paint order — see the header. `-1` for an element that is not in the
   * container at all, which is what a closed panel is.
   */
  function stackPosition(element: Element | null): number {
    if (!element) {
      return -1;
    }
    return Array.from(container().children).findIndex((child) => child.contains(element));
  }

  describe('attaching through CDK', () => {
    it('hosts the overlay in the CDK overlay container while open', () => {
      host.open.set(true);
      fixture.detectChanges();

      expect(stackPosition(panelOverlay())).toBeGreaterThanOrEqual(0);
    });

    it('gives the overlay back once the close has settled', () => {
      host.open.set(true);
      fixture.detectChanges();

      host.open.set(false);
      fixture.detectChanges();
      settleClose();

      expect(stackPosition(panelOverlay())).toBe(-1);
    });
  });

  describe('open order decides which is on top', () => {
    it('puts a panel opened from a dialog above that dialog', () => {
      openDialog();
      fixture.detectChanges();

      host.open.set(true);
      fixture.detectChanges();

      expect(stackPosition(panelOverlay())).toBeGreaterThan(stackPosition(dialogContainer()));
    });

    /**
     * The webui S3 case: the panel is asked to open and a call made while it
     * renders fails, so an error dialog opens inside the same render pass. The
     * old implementation had not portaled its overlay anywhere by that point —
     * it did that a render later — so the panel landed in the container AFTER
     * the dialog and covered the dialog's Close button.
     *
     * `afterNextRender` is that moment: it runs at the end of the render the
     * `open` below starts, which is after the panel's own effect has attached
     * and before anything a consumer would call a completed render.
     */
    it('puts a dialog raised during the panel\'s first render above the panel', () => {
      TestBed.runInInjectionContext(() => {
        afterNextRender(() => openDialog());
      });

      host.open.set(true);
      fixture.detectChanges();
      fixture.detectChanges();

      // Both halves, because "the dialog is above the panel" is also true of a
      // panel that is not in the container at all, which is what the old
      // implementation produced and what this test would otherwise pass on.
      expect(stackPosition(panelOverlay())).toBeGreaterThanOrEqual(0);
      expect(stackPosition(dialogContainer())).toBeGreaterThan(stackPosition(panelOverlay()));
    });
  });

  describe('Escape reaches the topmost overlay only', () => {
    it('closes the panel and leaves a dialog underneath it open', () => {
      const dialogRef = openDialog();
      fixture.detectChanges();
      host.open.set(true);
      fixture.detectChanges();

      let dialogClosed = false;
      dialogRef.closed.subscribe(() => {
        dialogClosed = true;
      });

      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      fixture.detectChanges();

      expect(host.open()).toBe(false);
      expect(dialogClosed).toBe(false);
    });
  });

  describe('a dialog over the panel hides it from assistive technology', () => {
    it('marks the panel aria-hidden while the dialog is open, and restores it', () => {
      host.open.set(true);
      fixture.detectChanges();
      expect(panelOverlay()!.getAttribute('aria-hidden')).toBeNull();

      const dialogRef = openDialog();
      fixture.detectChanges();
      expect(panelOverlay()!.getAttribute('aria-hidden')).toBe('true');

      dialogRef.close();
      fixture.detectChanges();
      expect(panelOverlay()!.getAttribute('aria-hidden')).toBeNull();
    });

    /**
     * A dialog that was already open when the panel opened is UNDERNEATH it, so
     * it is the dialog that is covered rather than the panel. Counting it would
     * hide the panel the user has just opened.
     */
    it('leaves the panel in the accessibility tree over a dialog it was opened from', () => {
      openDialog();
      fixture.detectChanges();

      host.open.set(true);
      fixture.detectChanges();

      expect(panelOverlay()!.getAttribute('aria-hidden')).toBeNull();
    });

    /**
     * The other half of that, and the one the old implementation got wrong.
     *
     * CDK's `Dialog` hides the overlay container's siblings on the first open
     * and puts back whatever each of them had when the last one closes. A
     * closed panel living on `<body>` was one of those siblings, and what it
     * had was `aria-hidden="true"` — so opening the panel from inside the
     * dialog cleared the attribute, and closing the dialog wrote the recorded
     * "true" straight back onto a panel the user was now looking at.
     */
    it('does not re-hide a panel opened from a dialog when that dialog closes', () => {
      const dialogRef = openDialog();
      fixture.detectChanges();
      host.open.set(true);
      fixture.detectChanges();

      dialogRef.close();
      fixture.detectChanges();

      expect(panelOverlay()!.getAttribute('aria-hidden')).toBeNull();
    });

    /**
     * A dialog that was above the panel during a PREVIOUS open must not
     * un-hide it when it closes during this one.
     *
     * Nothing unsubscribes a dialog's `closed` when the panel closes
     * underneath it — the panel is gone from the stack and cannot reach into
     * dialogs it no longer covers — so the state this keys off has to be
     * insensitive to a late arrival from a previous generation. It is a set,
     * and removing a member that is not in it is a no-op; a tally decremented
     * instead, and the panel came back into the accessibility tree with a live
     * modal still over it.
     */
    it('is not un-hidden by a dialog left over from an earlier open', () => {
      host.open.set(true);
      fixture.detectChanges();
      const earlier = openDialog();
      fixture.detectChanges();

      host.open.set(false);
      fixture.detectChanges();
      settleClose();

      host.open.set(true);
      fixture.detectChanges();
      openDialog();
      fixture.detectChanges();

      earlier.close();
      fixture.detectChanges();

      expect(panelOverlay()!.getAttribute('aria-hidden')).toBe('true');
    });

    it('keeps the panel hidden until the last dialog above it closes', () => {
      host.open.set(true);
      fixture.detectChanges();

      const first = openDialog();
      openDialog();
      fixture.detectChanges();

      first.close();
      fixture.detectChanges();

      expect(panelOverlay()!.getAttribute('aria-hidden')).toBe('true');
    });
  });
});
