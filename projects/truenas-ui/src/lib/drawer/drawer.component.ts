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
import { TnTestIdDirective, type TnTestIdValue } from '../test-id';

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

  /** Fires after the open transition completes */
  openedComplete = output<void>();

  /** Fires after the close transition completes */
  closed = output<void>();

  /** Whether the component has rendered (prevents transition flash on load) */
  protected initialized = signal(false);

  /** Reference to the overlay element (portaled to body in over mode) */
  protected overlayRef = viewChild<ElementRef>('overlay');

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

  constructor() {
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
   * Handle transition end — emit the open/close events once the animation is
   * over. Focus restoration is NOT here; it happens as soon as the drawer
   * closes, because this event does not fire under `prefers-reduced-motion`.
   */
  protected onTransitionEnd(event: TransitionEvent): void {
    if (event.propertyName !== 'transform' || event.target !== event.currentTarget) {
      return;
    }
    if (this.opened()) {
      this.openedComplete.emit();
    } else {
      this.closed.emit();
    }
  }

  private restoreFocus(): void {
    if (this.previousFocus?.focus) {
      this.previousFocus.focus();
      this.previousFocus = null;
    }
  }
}
