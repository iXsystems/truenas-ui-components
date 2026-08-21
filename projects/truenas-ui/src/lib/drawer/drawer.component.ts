import { A11yModule } from '@angular/cdk/a11y';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import type { ElementRef, OnDestroy } from '@angular/core';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
  afterNextRender,
} from '@angular/core';
import { tnAccessibleName } from '../a11y/accessible-name';
import { tnFocusOnOpen } from '../a11y/initial-focus';
import { TnTestIdDirective, type TnTestIdValue } from '../test-id';
import { tnTransitionLifecycle } from '../utils/transition-lifecycle';

export type TnDrawerMode = 'side' | 'over';
export type TnDrawerPosition = 'start' | 'end';

/**
 * The accessible name a drawer falls back to when the caller names neither
 * `ariaLabel` nor `ariaLabelledby` (#214).
 *
 * `ariaLabel` defaults to `undefined`, so the DEFAULT rendering in `over` mode
 * was a `role="dialog"` with `aria-modal="true"` and no name — measured as an
 * `aria-dialog-name` violation. In `side` mode the same omission leaves a
 * `role="navigation"` landmark unnamed, which axe does not report while there is
 * only one of them on the page, and which stops telling them apart the moment
 * there are two.
 *
 * One fallback for both modes rather than one per mode: the drawer is the same
 * surface either way, the name answers the same question ("what is this?"), and
 * a rule that changes with the mode is one more thing for a caller to be wrong
 * about. A generic name is still a poor one, so it is paired with the dev-mode
 * warning `tnAccessibleName` raises.
 *
 * Exported so specs assert against it by name rather than by a copied literal.
 */
export const TN_DRAWER_DEFAULT_LABEL = 'Drawer';

/**
 * A drawer, which is two different things by `mode`: in `side` it is
 * persistent navigation beside the page's content, and in `over` it is a modal
 * dialog with focus trapped in it.
 *
 * FOCUS ON OPEN, IN `over` MODE ONLY
 * ----------------------------------
 * An `over` drawer moves focus to the panel container when it opens, whatever
 * you projected into it, so that a screen reader announces the dialog it has
 * just entered before any control in it. A `side` drawer does not: navigation
 * that appears beside the content must not take focus from the page.
 *
 * **`[cdkFocusInitial]` is not honoured** (#227). It used to be, through the
 * CDK auto-capture this replaced, and `cdkTrapFocus` is still on the panel — so
 * the marker looks like it should work and does not. To focus a control of your
 * own, focus it yourself once the drawer is open; the component leaves focus
 * alone as soon as it is inside the panel. `lib/a11y/initial-focus.ts` holds
 * the reasoning for capturing the container rather than a control.
 */
@Component({
  selector: 'tn-drawer',
  standalone: true,
  imports: [A11yModule, NgTemplateOutlet, TnTestIdDirective],
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.scss',
  host: {
    'class': 'tn-drawer',
    '[class.tn-drawer--open]': 'opened()',
    '[class.tn-drawer--over]': 'mode() === "over"',
    '[class.tn-drawer--initialized]': 'initialized()',
    '[style.width]': 'mode() !== "over" && opened() ? width() : null',
  },
})
export class TnDrawerComponent implements OnDestroy {
  private readonly document = inject(DOCUMENT);

  /** Whether the drawer sits alongside content ('side') or overlays it ('over') */
  mode = input<TnDrawerMode>('side');

  /** Whether the drawer is open. Two-way bindable via [(opened)] */
  opened = model<boolean>(false);

  /** Prevent closing via backdrop click or Escape */
  disableClose = input<boolean>(false);

  /** Width of the drawer panel (must be a concrete CSS value for smooth transition) */
  width = input<string>('256px');

  /** Which side the drawer appears on */
  position = input<TnDrawerPosition>('start');

  /** Accessible label for the drawer panel */
  ariaLabel = input<string | undefined>(undefined);

  /** IDREF naming the drawer panel from visible text elsewhere on the page */
  ariaLabelledby = input<string | null>(null);

  /**
   * Test-id applied to the drawer panel. Rendered under whichever attribute name is
   * configured via `TN_TEST_ATTR` (default `data-testid`).
   */
  testId = input<TnTestIdValue>(undefined);

  /**
   * Fires once the drawer has finished opening.
   *
   * "Finished" means the open transition ended, OR that it was going to take
   * longer than `TN_TRANSITION_FALLBACK_MS` to say so — which is what a user
   * with `prefers-reduced-motion: reduce` gets, since this component's own
   * stylesheet removes the transition for them and one that does not run fires
   * no `transitionend` (#218). A consumer may assume the drawer has reached its
   * open state and that `opened()` is true; it may NOT assume the animation is
   * visually complete, because for that user there was none.
   */
  openedComplete = output<void>();

  /**
   * Fires once the drawer has finished closing. Same guarantee as
   * `openedComplete`, and the same caveat: it reports the state, not the
   * animation.
   *
   * Focus restoration does NOT hang off this — it happens as soon as the drawer
   * closes (#214). See the effect in the constructor.
   */
  closed = output<void>();

  /** Whether the component has rendered (prevents transition flash on load) */
  protected initialized = signal(false);

  /** Reference to the overlay element (portaled to body in over mode) */
  protected overlayRef = viewChild<ElementRef>('overlay');

  /**
   * The `over`-mode panel, which is what focus moves to when a modal drawer
   * opens. Optional rather than required: it lives inside an `@if` on the mode,
   * so a `side` drawer never renders it.
   */
  private overPanelRef = viewChild<ElementRef<HTMLElement>>('overPanel');

  /** Focus trap should be active only in 'over' mode when open */
  protected trapFocus = computed(() => this.mode() === 'over' && this.opened());

  /** Role depends on mode: navigation for side, dialog for over */
  protected panelRole = computed(() => this.mode() === 'over' ? 'dialog' : 'navigation');

  /**
   * The name to render as `aria-label`, or `null` to render none — and the
   * dev-mode warning when the caller named neither input.
   *
   * Both halves live in `../a11y/accessible-name`, shared with `tn-side-panel`
   * and the three progressbars, where the reasoning for each branch is set out:
   * why an explicit `ariaLabel` always survives, and why the generic fallback is
   * withheld beside an `ariaLabelledby`.
   *
   * A field initializer rather than the constructor, because it registers an
   * `effect` and so needs an injection context.
   */
  protected resolvedAriaLabel = tnAccessibleName({
    selector: 'tn-drawer',
    fallback: TN_DRAWER_DEFAULT_LABEL,
    activity: 'open',
    ariaLabel: computed(() => this.ariaLabel() ?? null),
    ariaLabelledby: this.ariaLabelledby,
  });

  /** Whether to show the backdrop */
  protected showBackdrop = computed(() => this.mode() === 'over');

  /** CSS classes for the drawer panel */
  protected drawerClasses = computed(() => {
    const classes = ['tn-drawer__panel'];
    if (this.opened()) {classes.push('tn-drawer__panel--open');}
    if (this.position() === 'end') {classes.push('tn-drawer__panel--end');}
    if (this.mode() === 'over') {classes.push('tn-drawer__panel--over');}
    if (this.initialized()) {classes.push('tn-drawer__panel--initialized');}
    return classes;
  });

  /** Previous focus element for restoration (only captured in over mode) */
  private previousFocus: HTMLElement | null = null;

  /**
   * Decides when an open or a close counts as finished, so that the outputs
   * above fire exactly once per change whether or not a transition ran. A field
   * initializer rather than the constructor, because it registers an `effect`
   * and so needs an injection context.
   */
  private lifecycle = tnTransitionLifecycle(
    this.opened,
    (opened) => (opened ? this.openedComplete.emit() : this.closed.emit())
  );

  constructor() {
    // Moves focus onto the panel when a MODAL drawer opens (#227) — `trapFocus`
    // rather than `opened`, because a `side` drawer is navigation the page keeps
    // beside its content and must not steal focus when it appears. This is the
    // half `[cdkTrapFocusAutoCapture]` only kept when the drawer happened to
    // hold a tabbable element; `../a11y/initial-focus.ts` holds the reasoning
    // and the timing, and `restoreFocus` below is the return leg.
    tnFocusOnOpen(this.trapFocus, () => this.overPanelRef()?.nativeElement);

    // Capture focus before opening in over mode, and restore it on close
    effect(() => {
      const opened = this.opened();

      if (opened && this.mode() === 'over') {
        this.previousFocus = this.document.activeElement as HTMLElement;
      } else if (!opened) {
        // Restored HERE rather than on `transitionend` (#214). The panel becomes
        // `inert` the moment it closes, so the browser blurs whatever inside it
        // had focus and moves it to `<body>` immediately — and `transitionend`
        // is not guaranteed to arrive to put it back. This component's own
        // stylesheet sets `transition: none` on an initialized panel under
        // `prefers-reduced-motion`, so for a user with that preference the event
        // never fires at all and focus would be left on `<body>` every time.
        //
        // A no-op in side mode, where `previousFocus` is never captured.
        //
        // Gated on `!opened` rather than on the negation of the branch above,
        // because those are not the same condition: a drawer that switches from
        // `over` to `side` WHILE OPEN — a responsive layout crossing its
        // breakpoint — fails the first test without having closed, and would
        // otherwise have focus yanked out of it and back to whatever opened it.
        this.restoreFocus();
      }
    });

    // Portal overlay to document.body in over mode to avoid clipping
    afterNextRender(() => {
      this.initialized.set(true);
      const overlay = this.overlayRef()?.nativeElement;
      if (overlay) {
        this.document.body.appendChild(overlay);
      }
    });
  }

  ngOnDestroy(): void {
    this.overlayRef()?.nativeElement?.remove();

    // A drawer destroyed WHILE OPEN never runs the close branch of the effect
    // above, so the restore has to happen here as well — and removing the
    // overlay has just dropped focus onto `<body>`. `CdkTrapFocus.ngOnDestroy`
    // used to cover this case, off the back of the auto-capture that #227
    // replaced; it is the component's now. A no-op unless an `over` open
    // captured a `previousFocus` that no close has spent — so an ordinary close
    // and a drawer that has only ever been `side` both reach here with nothing
    // to do, while one that opened in `over` and was switched to `side` at a
    // breakpoint still owes the restore, and does it.
    this.restoreFocus();
  }

  /** Open the drawer */
  open(): void {
    this.opened.set(true);
  }

  /** Close the drawer */
  close(): void {
    if (this.disableClose()) {
      return;
    }
    this.opened.set(false);
  }

  /** Toggle the drawer open/closed */
  toggle(): void {
    if (this.opened()) {
      this.close();
    } else {
      this.open();
    }
  }

  /** Handle backdrop click */
  protected onBackdropClick(): void {
    if (!this.disableClose()) {
      this.close();
    }
  }

  /**
   * Handle Escape key in over mode.
   * Side mode drawers are persistent navigation — Escape is not expected
   * to dismiss them. The header toggle button is the intended control.
   */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.mode() === 'over' && this.opened() && !this.disableClose()) {
      event.stopPropagation();
      this.close();
    }
  }

  /**
   * Handle transition end — report the open/close early, since the animation is
   * demonstrably over. Focus restoration is NOT here; it happens as soon as the
   * drawer closes, because this event does not fire under
   * `prefers-reduced-motion` — and neither, for the same reason, does the
   * emission depend on it any more (#218).
   *
   * Which output to emit is `lifecycle`'s to decide, from the state the change
   * it is tracking settled into — NOT from `opened()` read here. The two differ
   * exactly when this event is late: a drawer reopened while the close was still
   * animating reads `opened() === true` on the stale close's event.
   */
  protected onTransitionEnd(event: TransitionEvent): void {
    if (event.propertyName !== 'transform' || event.target !== event.currentTarget) {
      return;
    }
    this.lifecycle.transitionEnded();
  }

  private restoreFocus(): void {
    if (this.previousFocus?.focus) {
      this.previousFocus.focus();
      this.previousFocus = null;
    }
  }
}
