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

  /** Prevent closing via backdrop click (useful for persistent side mode) */
  disableClose = input<boolean>(false);

  /** Which side the drawer appears on */
  position = input<TnDrawerPosition>('start');

  /** Fires when the close transition begins */
  closedStart = output<void>();

  /** Whether the drawer is currently animating */
  private animating = signal(false);

  /** Focus trap should be active only in 'over' mode when open */
  protected trapFocus = computed(() => this.mode() === 'over' && this.opened());

  /** CSS classes for the drawer panel */
  protected drawerClasses = computed(() => {
    const classes = ['tn-drawer__panel'];
    if (this.opened()) {classes.push('tn-drawer__panel--open');}
    if (this.position() === 'end') {classes.push('tn-drawer__panel--end');}
    if (this.mode() === 'over') {classes.push('tn-drawer__panel--over');}
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
    this.closedStart.emit();
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

  /** Handle transition end for animation tracking */
  protected onTransitionEnd(event: TransitionEvent): void {
    if (event.propertyName === 'transform') {
      this.animating.set(false);
    }
  }

  private restoreFocus(): void {
    if (this.previousFocus?.focus) {
      this.previousFocus.focus();
      this.previousFocus = null;
    }
  }
}
