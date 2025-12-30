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
  templateUrl: './ix-confirm-dialog.component.html',
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