import { DialogRef} from '@angular/cdk/dialog';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { IxDialogShellComponent } from './ix-dialog-shell.component';
import { IxButtonComponent } from '../ix-button/ix-button.component';

export interface IxConfirmDialogData {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

@Component({
  selector: 'ix-confirm-dialog',
  template: `
    <ix-dialog-shell [title]="data.title">
      <p style="padding: var(--content-padding);">{{ data.message }}</p>
      <div ixDialogAction>
        <ix-button
          type="button"
          variant="outline"
          [label]="data.cancelText || 'Cancel'"
          (click)="ref.close(false)" />
        <ix-button
          type="button"
          [color]="data.destructive ? 'warn' : 'primary'"
          [label]="data.confirmText || 'OK'"
          (click)="ref.close(true)" />
      </div>
    </ix-dialog-shell>
  `,
  standalone: true,
  imports: [IxDialogShellComponent, IxButtonComponent],
  host: {
    'class': 'ix-dialog-shell',
    '[class.ix-dialog--destructive]': 'data.destructive'
  }
})
export class IxConfirmDialogComponent {
  ref = inject(DialogRef<boolean>);
  data = inject<IxConfirmDialogData>(DIALOG_DATA);
}