import { A11yModule } from '@angular/cdk/a11y';
import {
  Component,
  computed,
  effect,
  input,
  model,
  output,
  signal,
} from '@angular/core';

export type TnDrawerMode = 'side' | 'over';
export type TnDrawerPosition = 'start' | 'end';

let nextId = 0;

@Component({
  selector: 'tn-drawer',
  standalone: true,
  imports: [A11yModule],
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.scss',
})
export class TnDrawerComponent {
  /** Whether the drawer sits alongside content ('side') or overlays it ('over') */
  mode = input<TnDrawerMode>('side');

  /** Whether the drawer is open. Two-way bindable via [(opened)] */
  opened = model<boolean>(false);

  /** Prevent closing via backdrop click or Escape */
  disableClose = input<boolean>(false);

  /** Which side the drawer appears on */
  position = input<TnDrawerPosition>('start');

  /** Accessible label for the drawer panel */
  ariaLabel = input<string | undefined>(undefined);

  /** Fires after the open transition completes */
  openedEvent = output<void>();

  /** Fires after the close transition completes */
  closed = output<void>();

  /** Unique instance ID for ARIA linkage */
  protected readonly uid = `tn-drawer-${nextId++}`;

  /** Whether the component has rendered (prevents transition flash on load) */
  protected initialized = signal(false);

  /** Focus trap should be active only in 'over' mode when open */
  protected trapFocus = computed(() => this.mode() === 'over' && this.opened());

  /** Role depends on mode: navigation for side, dialog for over */
  protected panelRole = computed(() => this.mode() === 'over' ? 'dialog' : 'navigation');

  /** CSS classes for the drawer panel */
  protected drawerClasses = computed(() => {
    const classes = ['tn-drawer__panel'];
    if (this.opened()) {classes.push('tn-drawer__panel--open');}
    if (this.position() === 'end') {classes.push('tn-drawer__panel--end');}
    if (this.mode() === 'over') {classes.push('tn-drawer__panel--over');}
    if (this.initialized()) {classes.push('tn-drawer__panel--initialized');}
    return classes;
  });

  /** Whether to show the backdrop */
  protected showBackdrop = computed(() => this.mode() === 'over' && this.opened());

  /** Previous focus element for restoration */
  private previousFocus: HTMLElement | null = null;

  constructor() {
    effect(() => {
      if (this.mode() === 'over' && this.opened()) {
        this.previousFocus = document.activeElement as HTMLElement;
      }
    });

    // Delay initialization to prevent transition flash on first render
    setTimeout(() => this.initialized.set(true), 0);
  }

  /** Open the drawer */
  open(): Promise<void> {
    this.opened.set(true);
    return Promise.resolve();
  }

  /** Close the drawer */
  close(): Promise<void> {
    if (this.disableClose()) {
      return Promise.resolve();
    }
    this.opened.set(false);
    this.restoreFocus();
    return Promise.resolve();
  }

  /** Toggle the drawer open/closed */
  toggle(): Promise<void> {
    return this.opened() ? this.close() : this.open();
  }

  /** Handle backdrop click */
  protected onBackdropClick(): void {
    if (!this.disableClose()) {
      void this.close();
    }
  }

  /** Handle Escape key in over mode */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.mode() === 'over' && this.opened() && !this.disableClose()) {
      event.stopPropagation();
      void this.close();
    }
  }

  /** Handle transition end — emit opened/closed after animation completes */
  protected onTransitionEnd(event: TransitionEvent): void {
    if (event.propertyName !== 'transform' || event.target !== event.currentTarget) {
      return;
    }
    if (this.opened()) {
      this.openedEvent.emit();
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
