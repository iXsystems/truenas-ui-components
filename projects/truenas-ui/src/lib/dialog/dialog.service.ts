import type { DialogConfig, DialogRef } from '@angular/cdk/dialog';
import { Dialog } from '@angular/cdk/dialog';
import type { ComponentType } from '@angular/cdk/portal';
import type { TemplateRef } from '@angular/core';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TnConfirmDialogComponent } from './confirm-dialog.component';

export type TnDialogOpenTarget<C> = ComponentType<C> | TemplateRef<unknown>;

export interface TnDialogDefaults {
  panelClass?: string | string[];
  maxWidth?: string;
  maxHeight?: string;
  width?: string;
  height?: string;
  disableClose?: boolean;
  role?: 'dialog' | 'alertdialog';
  fullscreen?: boolean;
}

const defaults: TnDialogDefaults = {
  panelClass: ['tn-dialog-panel'],
  maxWidth: '90vw',
  maxHeight: '90vh',
  role: 'dialog',
};

@Injectable({ providedIn: 'root' })
export class TnDialog {
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
        'tn-dialog--fullscreen'
      ],
      autoFocus: config?.autoFocus ?? true,
      restoreFocus: config?.restoreFocus ?? true,
    };

    return this.dialog.open(target, merged);
  }

  /**
   * Open a confirmation dialog. Resolves to true if confirmed, false otherwise.
   */
  async confirm(opts: {
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    destructive?: boolean;
  }): Promise<boolean> {
    const dialogRef = this.open(
      TnConfirmDialogComponent,
      {
        data: opts,
        width: '488px',
        role: 'alertdialog',
        disableClose: true,
        panelClass: [opts.destructive ? 'tn-dialog--destructive' : ''].filter(Boolean),
      }
    );
    const result = await firstValueFrom(dialogRef.closed);
    return !!result;
  }
}