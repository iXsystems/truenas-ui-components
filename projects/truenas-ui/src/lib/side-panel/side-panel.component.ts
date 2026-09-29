import { A11yModule } from '@angular/cdk/a11y';
import { Dialog } from '@angular/cdk/dialog';
import type { DialogRef } from '@angular/cdk/dialog';
import {
  createGlobalPositionStrategy, createNoopScrollStrategy, createOverlayRef,
} from '@angular/cdk/overlay';
import type { OverlayRef } from '@angular/cdk/overlay';
import { DomPortal } from '@angular/cdk/portal';
import { CommonModule, DOCUMENT } from '@angular/common';
import {
  Component, Directive, Injector, input, output, model, computed, effect, inject, signal,
  contentChildren, viewChild, afterNextRender, DestroyRef,
} from '@angular/core';
import type { ElementRef, OnDestroy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { mdiClose } from '@mdi/js';
import { take } from 'rxjs';
import type { Observable, Subscription } from 'rxjs';
import { tnAccessibleName } from '../a11y/accessible-name';
import { injectTnFallbackName } from '../a11y/fallback-labels';
import { tnFocusOnOpen } from '../a11y/initial-focus';
import { TN_SCROLLABLE_REGION_TOLERANCE_PX, tnScrollableRegion } from '../a11y/scrollable-region';
import { TnIconRegistryService } from '../icon/icon-registry.service';
import { TnIconButtonComponent } from '../icon-button/icon-button.component';
import { TnTestIdDirective, type TnTestIdValue } from '../test-id';
import { tnTransitionLifecycle } from '../utils/transition-lifecycle';

/**
 * The name given to the scrolling content region once it becomes focusable
 * (#248).
 *
 * A focusable element with no accessible name is announced as a bare "group",
 * which tells a listener that something has been reached and nothing about what
 * it is. It names the region rather than repeating the panel's own title: the
 * dialog announces that on entry, so a second copy of it here would say the
 * same words twice and still not distinguish the part that scrolls.
 *
 * Overridable through `contentAriaLabel`, on the same reasoning as
 * `closeButtonAriaLabel` — a string this library renders into a consumer's UI
 * has to be translatable. Exported so specs assert against it by name rather
 * than by a copied literal.
 */
export const TN_SIDE_PANEL_CONTENT_LABEL = 'Panel content';

/**
 * How far the content has to exceed the region before the region counts as
 * scrolling (#248).
 *
 * **This is now `TN_SCROLLABLE_REGION_TOLERANCE_PX`**, which is axe's own 13px
 * buffer and lives with the measurement it belongs to (#270). The alias stays
 * because it is what `side-panel-scrollable-content.spec.ts` pins against axe
 * from both sides, and that spec is a guard on this component rather than on
 * the helper — see `../a11y/scrollable-region.ts` for what the number is and
 * why it is copied from the rule at all.
 */
export const TN_SIDE_PANEL_OVERFLOW_TOLERANCE_PX = TN_SCROLLABLE_REGION_TOLERANCE_PX;

/**
 * Marks the overlay as currently hosted in a CDK overlay (#322).
 *
 * It is what makes the overlay render at all — `.tn-side-panel__overlay` is
 * `display: none` without it. A detached overlay is back inside
 * `<tn-side-panel>`, whose ancestors the consumer owns, and one of them having a
 * `transform` would make `position: fixed` resolve against that box instead of
 * the viewport and paint the closed panel next to it. On `<body>`, where the
 * overlay used to live unconditionally, that could not happen.
 *
 * Applied imperatively rather than bound, for the reason
 * `TN_SIDE_PANEL_OPEN_CLASS` gives — the two have to land in that order and in
 * that relationship to the attach.
 */
const TN_SIDE_PANEL_ATTACHED_CLASS = 'tn-side-panel__overlay--attached';

/**
 * Puts the panel in its open position, and is the class the open/close
 * transition runs on.
 *
 * WHY THIS IS NOT A TEMPLATE BINDING (#322)
 * -----------------------------------------
 * Angular refreshes a component's template BEFORE it runs that component's
 * effects, so a `[class.…--open]="open()"` binding is written while the overlay
 * is still detached and `display: none`. The effect below then attaches it, and
 * the browser's first look at the element has it already open — a transition
 * needs a previous computed style to run from, and there is none. The panel
 * appears instead of sliding in.
 *
 * So the order is owned here instead: attach, force a layout read so the closed
 * position is what the browser has computed, then add this. It is still applied
 * inside the same change detection pass the `open` change arrives in, so a spec
 * that calls `detectChanges()` and asserts on the class sees it.
 */
const TN_SIDE_PANEL_OPEN_CLASS = 'tn-side-panel__overlay--open';

/**
 * Directive to mark an element as a side-panel footer action.
 *
 * @example
 * ```html
 * <tn-side-panel [(open)]="isOpen" title="Edit">
 *   <tn-button tnSidePanelAction label="Save" />
 * </tn-side-panel>
 * ```
 */
@Directive({
  selector: '[tnSidePanelAction]',
  standalone: true,
})
export class TnSidePanelActionDirective {}

/**
 * Directive to mark an element as a side-panel header action.
 *
 * @example
 * ```html
 * <tn-side-panel [(open)]="isOpen" title="Edit">
 *   <tn-icon-button tnSidePanelHeaderAction name="fullscreen" />
 *   Content here
 * </tn-side-panel>
 * ```
 */
@Directive({
  selector: '[tnSidePanelHeaderAction]',
  standalone: true,
})
export class TnSidePanelHeaderActionDirective {}

/**
 * A modal side panel: `role="dialog"` with `aria-modal="true"`, focus trapped
 * while it is open and restored to the opener when it closes.
 *
 * FOCUS ON OPEN
 * -------------
 * Opening moves focus to the panel container, whatever you projected into it,
 * so that a screen reader announces the dialog it has just entered before any
 * control in it. The first Tab then reaches the close button.
 *
 * **`[cdkFocusInitial]` is not honoured** (#227). It used to be, through the
 * CDK auto-capture this replaced, and `cdkTrapFocus` is still on the panel — so
 * the marker looks like it should work and does not. To focus a control of your
 * own, focus it yourself once the panel is open; the component leaves focus
 * alone as soon as it is inside the panel. `lib/a11y/initial-focus.ts` holds
 * the reasoning for capturing the container rather than a control.
 *
 * WHERE IT RENDERS, AND WHY THAT DECIDES WHAT IT STACKS AGAINST
 * ------------------------------------------------------------
 * The panel renders through a CDK `OverlayRef` created WHEN IT OPENS (#322),
 * which is what makes it stack with `TnDialog`, `tn-menu` and tooltips by open
 * order: whatever attached last paints on top, in both directions. It used to
 * append its overlay to `<body>` at construction time with a fixed `z-index`,
 * and the CDK overlay container is a `<body>` child with the same one — so the
 * winner was whichever element `<body>` happened to receive last, which follows
 * nothing a caller can see. A panel opened FROM a dialog landed under that
 * dialog's backdrop; on a browser with the popover API, where CDK puts its
 * overlays in the top layer, no `z-index` on a `<body>` child could have won at
 * all.
 *
 * Three things follow from being a CDK overlay, and each replaces something
 * this component used to do for itself:
 *
 * - **Escape reaches the topmost overlay only**, through CDK's
 *   `OverlayKeyboardDispatcher`, rather than through a `keydown` handler on the
 *   panel that stopped propagation to keep a dialog underneath from closing too.
 *   The panel therefore also closes on Escape pressed outside it, which is what
 *   every other modal in this library does.
 * - **A CDK dialog opened over an open panel hides the panel from assistive
 *   technology.** CDK does this by sweeping the overlay container's SIBLINGS,
 *   which no longer includes the panel, so the component tracks it — see
 *   `dialogsAbove`.
 * - **A consumer no longer re-homes the overlay or overrides its `z-index` and
 *   `pointer-events`.** There is no `z-index` on it any more; the CDK pane it
 *   lives in carries the stacking.
 */
@Component({
  selector: 'tn-side-panel',
  standalone: true,
  imports: [CommonModule, A11yModule, TnIconButtonComponent, TnTestIdDirective],
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.scss'],
  host: {
    'class': 'tn-side-panel',
    '[attr.data-tn-panel]': 'panelId',
  },
})
export class TnSidePanelComponent implements OnDestroy {
  private iconRegistry = inject(TnIconRegistryService);
  private document = inject(DOCUMENT);
  private destroyRef = inject(DestroyRef);
  private injector = inject(Injector);
  private dialog = inject(Dialog);

  private overlayRef = viewChild.required<ElementRef<HTMLElement>>('overlay');
  private panelRef = viewChild.required<ElementRef<HTMLElement>>('panel');
  private contentRef = viewChild.required<ElementRef<HTMLElement>>('content');
  protected initialized = signal(false);

  /**
   * The CDK overlay currently hosting `overlayRef`'s element, or `null` while
   * the panel is closed (#322).
   *
   * **Created on open and disposed once the close has settled**, not once for
   * the component's lifetime. That is the whole mechanism: CDK decides stacking
   * by the order overlays ATTACH — `showPopover()` order in the top layer, and
   * `_updateStackingOrder()`'s move to the end of the container where the
   * popover API is missing — so an overlay created when the component was built
   * would stack by construction order, which for a panel rendered inside a
   * dialog is exactly backwards.
   *
   * Non-null is therefore also the answer to "is this panel currently one of
   * the overlays on screen", which is what `dialogsAbove` keys off.
   */
  private cdkOverlay: OverlayRef | null = null;

  /** Escape handling for the overlay above, dropped with it. */
  private keydowns: Subscription | null = null;

  /**
   * The CDK dialogs currently covering this panel (#322).
   *
   * The panel is hidden from assistive technology while this is non-empty,
   * which is what CDK's own `Dialog` does for everything outside the overlay
   * container — it sweeps the container's SIBLINGS, and a panel that now lives
   * INSIDE the container is not one. A dialog already open when the panel opens
   * is underneath it and never joins this; only dialogs that arrive afterwards
   * are above.
   *
   * A SET RATHER THAN A COUNT, and each dialog removes ITSELF. Nothing
   * unsubscribes a dialog's `closed` when the panel closes underneath it — the
   * panel cannot outlive its own release to do that — so with a count, a
   * dialog opened during one open and closed during the NEXT one decremented a
   * tally it had never contributed to, and put the panel back in the
   * accessibility tree with a live modal still stacked over it. Removing a
   * member that is not there is a no-op, which is the property a count does
   * not have.
   *
   * Emptied only when the last one goes, on the same reasoning as CDK's
   * `_removeOpenDialog`: two stacked dialogs closing one at a time must not
   * un-hide the panel while one is still covering it.
   */
  private dialogsAbove = signal<ReadonlySet<DialogRef<unknown, unknown>>>(new Set());

  /**
   * Whether the content region carries the tab stop, its role and its name
   * (#248) — which is NOT the same question as whether it currently overflows.
   *
   * The measurement, the two observers that keep it current and the focus rule
   * that decides when the attributes may be taken off again are all
   * `tnScrollableRegion`'s (#270); this component decides only what to put on
   * the element, which is the part that differs between the five regions in
   * this library that scroll. `../a11y/scrollable-region.ts` sets out why the
   * answer is held true while the region has focus, and why `role` and
   * `aria-label` are gated on the same signal as `tabindex` rather than left on.
   *
   * The helper's FIRST measurement reads a closed panel, which is
   * `display: none` since #322 and so reads as not overflowing. That is the
   * right answer for a panel nobody can reach yet, and it does not stick: the
   * helper's `ResizeObserver` fires when the overlay attaches and the region
   * gets a box, which is the same instrument that already answered a viewport
   * resize. Once open, `.tn-side-panel__overlay` is `position: fixed;
   * inset: 0`, so the region's size comes from the viewport rather than from
   * whichever CDK pane is hosting it.
   */
  protected contentKeyboardReachable = tnScrollableRegion(
    () => this.contentRef().nativeElement
  );

  // Two-way bindable via [(open)]
  open = model<boolean>(false);

  // Inputs
  title = input<string>('');
  width = input<string>('480px');
  hasBackdrop = input<boolean>(true);
  closeOnBackdropClick = input<boolean>(true);
  closeOnEscape = input<boolean>(true);
  /**
   * Optional gate evaluated before a user-initiated close (× button, backdrop click,
   * or Escape). Return an observable resolving to `false` to veto the close — e.g. to
   * prompt about unsaved changes and keep the panel open if the user cancels. The
   * observable is expected to emit once. Programmatic `open` changes made by the host
   * bypass this guard; when unset, the panel closes immediately.
   */
  closeGuard = input<(() => Observable<boolean>) | undefined>(undefined);
  /**
   * Test-id applied to the panel's root overlay element. Rendered under whichever attribute
   * name is configured via `TN_TEST_ATTR` (default `data-testid`).
   */
  testId = input<TnTestIdValue>(undefined);
  /**
   * Test-id applied to the panel's close (×) button.
   */
  closeButtonTestId = input<string | undefined>(undefined);

  /**
   * Accessible name for the close button. Defaults to "Dismiss"; override to translate it, or to
   * name what is being closed ("Close Add Dataset form") — a screen-reader user tabbing to it out
   * of context otherwise hears only "Dismiss".
   */
  closeButtonAriaLabel = input<string>('Dismiss');

  /**
   * Accessible name for the scrolling content region, which is named only while
   * it is focusable — see `TN_SIDE_PANEL_CONTENT_LABEL`. Override it to
   * translate it, or to say what the region holds ("Dataset properties").
   */
  contentAriaLabel = input<string>(TN_SIDE_PANEL_CONTENT_LABEL);

  /**
   * Accessible name for the panel itself, for a panel that renders no `title`.
   *
   * A `title` outranks it: the heading is what the user can see, and
   * `aria-labelledby` wins the ARIA name calculation while it resolves. The
   * attribute is still rendered beside the heading rather than suppressed — see
   * `tnAccessibleName`, which owns that rule for every component in this
   * library, and the reason it is safer than the alternative.
   */
  ariaLabel = input<string | null>(null);

  /**
   * IDREF naming the panel from text elsewhere on the page, for a panel that
   * renders no `title`. Same precedence: a `title` wins, because it is the
   * visible heading.
   */
  ariaLabelledby = input<string | null>(null);

  /**
   * Fires once the panel has finished opening.
   *
   * "Finished" means the open transition ended, OR that it was going to take
   * longer than `TN_TRANSITION_FALLBACK_MS` to say so — which is what a user
   * with `prefers-reduced-motion: reduce` gets, since this component's own
   * stylesheet zeroes the duration for them and a transition that does not run
   * fires no `transitionend` (#218). A consumer may assume the panel has
   * reached its open state and that `open()` is true; it may NOT assume the
   * animation is visually complete, because for that user there was none.
   */
  opened = output<void>();

  /**
   * Fires once the panel has finished closing. Same guarantee as `opened`, and
   * the same caveat: it reports the state, not the animation.
   *
   * Focus restoration does NOT hang off this — it happens as soon as the panel
   * closes (#214). See the effect in the constructor.
   */
  closed = output<void>();

  // Content projection queries
  private actionContent = contentChildren(TnSidePanelActionDirective);
  protected hasActions = computed(() => this.actionContent().length > 0);

  // Unique IDs for aria-labelledby and portal correlation
  readonly panelId = `tn-side-panel-${Math.random().toString(36).substring(2, 9)}`;
  readonly titleId = `${this.panelId}-title`;

  /**
   * Whether there is a heading to render, and to name the dialog from.
   *
   * Trimmed, because a whitespace-only title renders a heading that looks empty
   * to a sighted user and names the dialog with nothing — which is the state
   * that failed `aria-dialog-name` before #214, arriving by a second route.
   */
  protected hasTitle = computed(() => this.title().trim() !== '');

  /**
   * What the dialog is named by, in the order ARIA resolves: the visible heading
   * when there is one, the caller's IDREF otherwise.
   */
  protected resolvedAriaLabelledby = computed(
    () => (this.hasTitle() ? this.titleId : this.ariaLabelledby())
  );

  private readonly fallbackName = injectTnFallbackName('sidePanel');

  /**
   * The name to render as `aria-label`, or `null` to render none — and the
   * dev-mode warning when the panel has no name from any route.
   *
   * Both halves live in `../a11y/accessible-name`, shared with the three
   * progressbars, where the reasoning for each branch is set out. `title` reaches
   * it as the `ariaLabelledby` above, so a titled panel is named, takes no
   * fallback and raises no warning.
   */
  protected resolvedAriaLabel = tnAccessibleName({
    selector: 'tn-side-panel',
    fallback: this.fallbackName.label,
    fallbackIsConfigured: this.fallbackName.configured,
    activity: 'open',
    hint: 'On this component the usual route is title, which is also the visible heading.',
    ariaLabel: this.ariaLabel,
    ariaLabelledby: this.resolvedAriaLabelledby,
  });

  /**
   * Whether the overlay is out of the accessibility tree: closed, or covered by
   * a CDK dialog that opened over it (#322).
   *
   * The two are one attribute because they are one question, and rendering them
   * from separate bindings would mean the second could clear the first.
   */
  protected hiddenFromAssistiveTech = computed(
    () => !this.open() || this.dialogsAbove().size > 0
  );

  // Focus restoration
  private previouslyFocusedElement: HTMLElement | null = null;

  /**
   * Decides when an open or a close counts as finished, so that the outputs
   * above fire exactly once per change whether or not a transition ran. A field
   * initializer rather than the constructor, because it registers an `effect`
   * and so needs an injection context.
   *
   * It is also what times the overlay's release (#322). The CDK overlay has to
   * outlive the CLOSE — disposing it puts the element back in this component's
   * view, where it is `display: none`, so doing that the moment `open` goes
   * false replaces the slide-out with a disappearance. "The close has settled"
   * is exactly the question this helper already answers, for a transition that
   * may never fire.
   */
  private lifecycle = tnTransitionLifecycle(this.open, (open) => {
    if (open) {
      this.opened.emit();
      return;
    }
    this.releaseOverlay();
    this.closed.emit();
  });

  constructor() {
    this.registerMdiIcons();

    // Moves focus onto the panel when it opens (#227) — the other half of the
    // focus contract `aria-modal="true"` declares, and the half
    // `[cdkTrapFocusAutoCapture]` only kept when the panel happened to contain a
    // tabbable element, which the default panel, whose only control is its own ×
    // button, did not. `../a11y/initial-focus.ts` holds the reasoning and the
    // timing; `restoreFocus` below is the return leg.
    tnFocusOnOpen(this.open, () => this.panelRef().nativeElement);

    effect(() => {
      if (this.open()) {
        this.previouslyFocusedElement = this.document.activeElement as HTMLElement;
      } else {
        // Restored HERE rather than on `transitionend` (#214). The overlay
        // becomes `inert` the moment it closes, so the browser blurs whatever
        // inside it had focus and moves it to `<body>` immediately — and
        // `transitionend` is not guaranteed to arrive to put it back. This
        // component's own stylesheet sets `transition-duration: 0ms` under
        // `prefers-reduced-motion`, and a zero-duration transition runs no
        // transition and fires no event, so a user with that preference would
        // have been left on `<body>` every time a panel closed.
        this.restoreFocus();
      }
    });

    // Hosts the overlay in a CDK overlay while the panel is open (#322). The
    // element it moves is the one this component renders, so the projected
    // content, the view queries and the bindings on it all survive the move —
    // which a `TemplatePortal` would not give, since detaching one destroys the
    // view and takes the caller's content with it.
    effect(() => {
      if (this.open()) {
        this.showOverlay();
      } else {
        this.overlayRef().nativeElement.classList.remove(TN_SIDE_PANEL_OPEN_CLASS);
      }
    });

    // A dialog opened while this panel is on screen is above it, because CDK
    // stacks by attach order — so it covers the panel, and the panel leaves the
    // accessibility tree for as long as it does. Dialogs already open when the
    // panel opens are underneath it and are not counted: `cdkOverlay` is null
    // until the panel attaches.
    this.dialog.afterOpened.pipe(takeUntilDestroyed()).subscribe((ref) => {
      if (!this.cdkOverlay) {
        return;
      }
      this.dialogsAbove.update((above) => new Set(above).add(ref));
      ref.closed.pipe(take(1), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.dialogsAbove.update((above) => {
          const remaining = new Set(above);
          remaining.delete(ref);
          return remaining;
        });
      });
    });

    afterNextRender(() => this.initialized.set(true));
  }

  /**
   * Put the overlay on screen, in a CDK overlay created now (#322).
   *
   * The three steps are ordered, and the order is the reason this is not two
   * bindings:
   *
   * 1. **Attach**, which is what fixes where the panel sits in the stack.
   * 2. **Read layout**, which forces the browser to compute the panel's closed
   *    position in its new home. Without it the attach and the open class land
   *    in one style update, the browser has no "before" to transition from, and
   *    the panel appears rather than slides. A deliberate synchronous reflow,
   *    and the only one: it happens once per open.
   * 3. **Open**, which is the change the transition runs on.
   *
   * Re-entrant on purpose. A panel reopened while its close is still animating
   * keeps the overlay it already has — the stack has not changed under it, and
   * `tnTransitionLifecycle` has already cancelled the close that would have
   * released it.
   */
  private showOverlay(): void {
    const element = this.overlayRef().nativeElement;

    if (!this.cdkOverlay) {
      this.cdkOverlay = createOverlayRef(this.injector, {
        positionStrategy: createGlobalPositionStrategy(this.injector),
        // The panel is `position: fixed` and fills the viewport, so there is
        // nothing to reposition or block when the page scrolls.
        scrollStrategy: createNoopScrollStrategy(),
        // The panel draws its own backdrop inside the overlay, because it is
        // the thing that fades with the panel.
        hasBackdrop: false,
        // Names the pane, the same way `TnDialog` names its own
        // `tn-dialog-panel` — it is how anything looking at the overlay
        // container tells one of these apart from a dialog or a menu.
        panelClass: 'tn-side-panel-pane',
      });
      this.cdkOverlay.attach(new DomPortal(element));
      element.classList.add(TN_SIDE_PANEL_ATTACHED_CLASS);

      // Escape, from CDK's keyboard dispatcher, which delivers it to the
      // TOPMOST attached overlay and nothing else. That is what keeps a dialog
      // underneath this panel from closing on the same keystroke, and it works
      // in the other direction too — a dialog raised from the panel takes the
      // key instead, which a handler on this element could not have known.
      this.keydowns = this.cdkOverlay
        .keydownEvents()
        .subscribe((event) => this.onOverlayKeydown(event));
    }

    element.getBoundingClientRect();
    element.classList.add(TN_SIDE_PANEL_OPEN_CLASS);
  }

  /**
   * Give the CDK overlay back, once the close has finished animating.
   *
   * Disposing rather than detaching, so that the next open builds a new overlay
   * and takes a new place in the stack — see `cdkOverlay`. It restores the
   * element to this component's own view, where `display: none` keeps it out of
   * the way until then.
   */
  private releaseOverlay(): void {
    this.keydowns?.unsubscribe();
    this.keydowns = null;
    this.cdkOverlay?.dispose();
    this.cdkOverlay = null;
    this.dialogsAbove.set(new Set());
    this.overlayRef().nativeElement.classList.remove(TN_SIDE_PANEL_ATTACHED_CLASS);
  }

  ngOnDestroy(): void {
    const overlay = this.overlayRef().nativeElement as HTMLElement;

    // A panel destroyed WHILE OPEN never runs the close branch of the effect
    // above, so the restore has to happen here as well — removing the overlay
    // drops focus onto `<body>`, and `CdkTrapFocus.ngOnDestroy` used to cover
    // that off the back of the auto-capture #227 replaced.
    //
    // Only when this panel is what focus is being taken FROM, and read before
    // the removal, which is the thing that takes it. Restoring unconditionally
    // moves focus for a user who is somewhere else entirely: a panel with
    // `hasBackdrop=false` does not stop them clicking into the page behind it,
    // and destroying it would then yank them out of whatever they were typing
    // in and back to a trigger they left minutes ago. A no-op after an
    // ordinary close either way, which clears `previouslyFocusedElement`.
    const heldFocus = overlay.contains(this.document.activeElement);
    // Released BEFORE the removal, and unconditionally: a panel destroyed while
    // open still holds a CDK overlay, and disposing it is what takes the pane
    // out of the overlay container. The element itself comes back here first,
    // which is what `remove()` below then takes out of the document.
    this.releaseOverlay();
    overlay.remove();

    if (heldFocus) {
      this.restoreFocus();
    }
  }

  protected dismiss(): void {
    const guard = this.closeGuard();
    if (!guard) {
      this.open.set(false);
      return;
    }

    guard()
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((canClose) => {
        if (canClose) {
          this.open.set(false);
        }
      });
  }

  protected onBackdropClick(): void {
    if (this.closeOnBackdropClick()) {
      this.dismiss();
    }
  }

  /**
   * Escape, delivered by CDK's `OverlayKeyboardDispatcher` (#322).
   *
   * It arrives only while this panel is the topmost attached overlay, so
   * nothing here has to decide whether the key was meant for something above or
   * below — which is what the `stopPropagation` this replaced was standing in
   * for, and it could only ever guard the direction it knew about.
   *
   * `preventDefault` rather than `stopPropagation`, matching CDK's own
   * `DialogRef`: the key has already been routed, and swallowing it would hide
   * it from a consumer listening at the document for their own reasons.
   */
  private onOverlayKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.closeOnEscape() && this.open()) {
      event.preventDefault();
      this.dismiss();
    }
  }

  protected onTransitionEnd(event: TransitionEvent): void {
    if (event.propertyName !== 'transform' || event.target !== event.currentTarget) {
      return;
    }

    // Which output to emit is `lifecycle`'s to decide, from the state the change
    // it is tracking settled into — NOT from `open()` read here. The two differ
    // exactly when this event is late: a panel reopened while the close was
    // still animating reads `open() === true` on the stale close's event.
    this.lifecycle.transitionEnded();
  }

  private restoreFocus(): void {
    if (this.previouslyFocusedElement && typeof this.previouslyFocusedElement.focus === 'function') {
      this.previouslyFocusedElement.focus();
      this.previouslyFocusedElement = null;
    }
  }

  private registerMdiIcons(): void {
    const mdiIcons: Record<string, string> = {
      'close': mdiClose,
    };

    this.iconRegistry.registerLibrary({
      name: 'mdi',
      resolver: (iconName: string) => {
        const pathData = mdiIcons[iconName];
        if (!pathData) {
          return null;
        }
        return `<svg viewBox="0 0 24 24"><path fill="currentColor" d="${pathData}"/></svg>`;
      },
    });
  }
}
