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

export type TnDrawerMode = 'side' | 'over';
export type TnDrawerPosition = 'start' | 'end';

@Component({
  selector: 'tn-drawer',
  standalone: true,
  imports: [A11yModule, NgTemplateOutlet],
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
    // Capture focus before opening in over mode for later restoration
    effect(() => {
      if (this.mode() === 'over' && this.opened()) {
        this.previousFocus = this.document.activeElement as HTMLElement;
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

  /** Handle transition end — emit events and restore focus after animation completes */
  protected onTransitionEnd(event: TransitionEvent): void {
    if (event.propertyName !== 'transform' || event.target !== event.currentTarget) {
      return;
    }
    if (this.opened()) {
      this.openedComplete.emit();
    } else {
      this.closed.emit();
      this.restoreFocus();
    }
  }

  private restoreFocus(): void {
    if (this.previousFocus?.focus) {
      this.previousFocus.focus();
      this.previousFocus = null;
    }
  }
}
