import type { DialogConfig, DialogRef } from '@angular/cdk/dialog';
import { Dialog } from '@angular/cdk/dialog';
import type { ComponentType } from '@angular/cdk/portal';
import type { TemplateRef } from '@angular/core';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

export type IxDialogOpenTarget<C> = ComponentType<C> | TemplateRef<unknown>;

export interface IxDialogDefaults {
  panelClass?: string | string[];
  maxWidth?: string;
  maxHeight?: string;
  width?: string;
  height?: string;
  disableClose?: boolean;
  role?: 'dialog' | 'alertdialog';
  fullscreen?: boolean;
}

const defaults: IxDialogDefaults = {
  panelClass: ['ix-dialog-panel'],
  maxWidth: '90vw',
  maxHeight: '90vh',
  role: 'dialog',
};

@Injectable({ providedIn: 'root' })
export class IxDialog {
  private dialog = inject(Dialog);

  /**
   * Open a dialog with the given component or template.
   * Applies default configuration for panel class, max dimensions, and focus behavior.
   */
  open<C, D = unknown, R = unknown>(
    target: ComponentType<C> | TemplateRef<C>,
    config?: DialogConfig<D, DialogRef<R, C>>
  ): DialogRef<R, C> {
    const merged = {
      ...defaults,
      ...config,
      panelClass: [
        ...(defaults.panelClass as string[]),
        ...(Array.isArray(config?.panelClass) ? config.panelClass : config?.panelClass ? [config.panelClass] : [])
      ],
      autoFocus: config?.autoFocus ?? true,
      restoreFocus: config?.restoreFocus ?? true,
    };

    return this.dialog.open(target, merged);
  }

  /**
   * Open a fullscreen dialog that takes over the entire viewport.
   * Automatically applies fullscreen styling and dimensions.
   */
  openFullscreen<C, D = unknown, R = unknown>(
    target: ComponentType<C> | TemplateRef<C>,
    config?: DialogConfig<D, DialogRef<R, C>>
  ): DialogRef<R, C> {
    const merged = {
      ...defaults,
      ...config,
      maxWidth: '100vw',
      maxHeight: '100vh',
      width: '100vw',
      height: '100vh',
      panelClass: [
        ...(defaults.panelClass as string[]),
        ...(Array.isArray(config?.panelClass) ? config.panelClass : config?.panelClass ? [config.panelClass] : []),
        'ix-dialog--fullscreen'
      ],
      autoFocus: config?.autoFocus ?? true,
      restoreFocus: config?.restoreFocus ?? true,
    };

    return this.dialog.open(target, merged);
  }

  /**
   * Open a confirmation dialog with customizable title, message, and button labels.
   * Returns a promise that resolves to an Observable of the user's choice.
   */
  confirm(opts: {
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    destructive?: boolean;
  }): Promise<Observable<boolean | undefined>> {
    // Import the confirm dialog component dynamically to avoid circular dependencies
    return import('./confirm-dialog.component').then(m => {
      const dialogRef = this.open(
        m.IxConfirmDialogComponent,
        {
          data: opts,
          role: 'alertdialog',
          disableClose: true,
          panelClass: [opts.destructive ? 'ix-dialog--destructive' : ''].filter(Boolean),
        }
      );
      return dialogRef.closed as Observable<boolean | undefined>;
    });
  }
}