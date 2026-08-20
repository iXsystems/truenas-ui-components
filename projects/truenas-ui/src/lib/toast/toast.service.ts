import type { ComponentRef } from '@angular/core';
import {
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
} from '@angular/core';
import { Subject } from 'rxjs';
import { TnToastComponent } from './toast.component';
import type { TnToastConfig } from './toast.types';
import { TnToastPosition, TnToastType } from './toast.types';

export class TnToastRef {
  private readonly _onAction = new Subject<void>();
  private readonly _afterDismissed = new Subject<void>();
  private _dismissed = false;

  /** @internal */
  _componentRef?: ComponentRef<TnToastComponent>;

  /** Observable that emits when the action button is clicked. */
  onAction() {
    return this._onAction.asObservable();
  }

  /** Observable that emits when the toast is dismissed (by action, duration, or programmatically). */
  afterDismissed() {
    return this._afterDismissed.asObservable();
  }

  /** Programmatically dismiss the toast. */
  dismiss() {
    if (this._dismissed) { return; }
    this._dismissed = true;
    this._afterDismissed.next();
    this._afterDismissed.complete();
    this._onAction.complete();
  }

  /** @internal */
  _triggerAction() {
    this._onAction.next();
    this.dismiss();
  }
}

@Injectable({ providedIn: 'root' })
export class TnToastService {
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);
  private activeRef: TnToastRef | null = null;

  /**
   * Opens a toast notification.
   *
   * @param message The message to display.
   * @param actionOrConfig Optional action button text, or config object.
   * @param config Optional config when action is provided as second arg.
   * @returns A TnToastRef that can be used to dismiss the toast or listen for events.
   *
   * @example
   * ```typescript
   * // Simple notification
   * this.toast.open('Changes saved');
   *
   * // With action button
   * const ref = this.toast.open('Item deleted', 'Undo');
   * ref.onAction().subscribe(() => this.undoDelete());
   *
   * // With config
   * this.toast.open('Error occurred', { type: 'error', duration: 6000 });
   *
   * // Action + config
   * this.toast.open('Failed to save', 'Retry', { type: 'error' });
   * ```
   */
  open(message: string, actionOrConfig?: string | TnToastConfig, config?: TnToastConfig): TnToastRef {
    // Dismiss any existing toast
    if (this.activeRef) {
      this.activeRef.dismiss();
    }

    // Parse overloaded args
    let action: string | undefined;
    let resolvedConfig: TnToastConfig = {};

    if (typeof actionOrConfig === 'string') {
      action = actionOrConfig;
      resolvedConfig = config ?? {};
    } else if (actionOrConfig) {
      resolvedConfig = actionOrConfig;
    }

    const duration = resolvedConfig.duration ?? 4000;
    const type = resolvedConfig.type ?? TnToastType.Info;
    const position = resolvedConfig.position ?? TnToastPosition.Top;

    // Create ref
    const ref = new TnToastRef();
    this.activeRef = ref;

    // Create component
    const componentRef = createComponent(TnToastComponent, {
      environmentInjector: this.injector,
    });
    ref._componentRef = componentRef;

    const instance = componentRef.instance;
    instance.action.set(action ?? null);
    instance.type.set(type);
    instance.position.set(position);
    instance.onAction = () => ref._triggerAction();
    instance.onDismiss = () => ref.dismiss();

    // Attach to DOM. `message` is deliberately still empty here: what a screen
    // reader reports is a CHANGE to a live region's content, so the region has
    // to be present and empty before the text arrives. Inserting the region
    // already populated is special-cased for `role="alert"` and announced
    // reliably, but the `status` regions this component uses for info, success
    // and warning (#190) are announced unreliably that way, and on several
    // readers not at all.
    this.appRef.attachView(componentRef.hostView);
    document.body.appendChild(componentRef.location.nativeElement as HTMLElement);

    // Render the empty region now rather than waiting for the next scheduled
    // tick, so the message below is a second mutation whatever schedules it.
    componentRef.changeDetectorRef.detectChanges();

    // Announce, and animate in. The message rides the same frame as the enter
    // transition because that is the frame the toast becomes visible in: it is
    // `opacity: 0` until `visible`, so the empty region above is never seen.
    requestAnimationFrame(() => {
      instance.message.set(message);
      instance.visible.set(true);
    });

    // Auto-dismiss
    let timeout: ReturnType<typeof setTimeout> | null = null;
    if (duration > 0) {
      timeout = setTimeout(() => ref.dismiss(), duration);
    }

    // Cleanup on dismiss
    ref.afterDismissed().subscribe(() => {
      if (timeout) { clearTimeout(timeout); }
      instance.visible.set(false);

      // Wait for animation to complete before removing
      setTimeout(() => {
        this.appRef.detachView(componentRef.hostView);
        componentRef.destroy();
        if (this.activeRef === ref) {
          this.activeRef = null;
        }
      }, 200);
    });

    return ref;
  }
}
