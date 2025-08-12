import { Injectable, inject, TemplateRef } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';

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

const DEFAULTS: IxDialogDefaults = {
  panelClass: ['ix-dialog-panel'],
  maxWidth: '90vw',
  maxHeight: '90vh',
  role: 'dialog',
};

@Injectable({ providedIn: 'root' })
export class IxDialog {
  private dialog = inject(Dialog);

  open<C, D = unknown, R = unknown>(
    target: IxDialogOpenTarget<C>,
    config: DialogConfig<D> & { fullscreen?: boolean } = {}
  ): DialogRef<R, C> {
    const baseClasses = [...(DEFAULTS.panelClass as string[]), ...(config.panelClass ?? [])];
    
    // Handle fullscreen mode
    if (config.fullscreen) {
      baseClasses.push('ix-dialog--fullscreen');
    }
    
    const merged = {
      ...DEFAULTS,
      ...config,
      panelClass: baseClasses,
      // Override size constraints for fullscreen
      ...(config.fullscreen && {
        maxWidth: '100vw',
        maxHeight: '100vh',
        width: '100vw',
        height: '100vh',
      }),
      // focus & scroll behavior (tweak as you prefer)
      autoFocus: config.autoFocus ?? true,
      restoreFocus: config.restoreFocus ?? true,
    };
    return this.dialog.open(target as any, merged as any) as any;
  }

  // Convenience helpers
  confirm(opts: {
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    destructive?: boolean;
    data?: any;
  }) {
    // Import the confirm dialog component dynamically to avoid circular dependencies
    return import('./ix-confirm-dialog.component').then(m => {
      return this.open(m.IxConfirmDialogComponent, {
        data: opts,
        role: 'alertdialog',
        disableClose: true,
        panelClass: ['ix-dialog-panel', opts.destructive ? 'ix-dialog--destructive' : ''],
      }).closed; // Observable<boolean>
    });
  }
}