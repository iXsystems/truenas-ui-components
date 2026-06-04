import { DialogRef} from '@angular/cdk/dialog';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { TnDialogShellComponent } from './dialog-shell.component';
import { TnButtonComponent } from '../button/button.component';

export interface TnConfirmDialogData {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  /**
   * Semantic test-id bases for the library-rendered action buttons. The buttons
   * emit `button-confirm` / `button-cancel` by default (the library adds the
   * `button-` prefix); override here when a page opens more than one dialog.
   */
  confirmTestId?: string;
  cancelTestId?: string;
}

@Component({
  selector: 'tn-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  standalone: true,
  imports: [TnDialogShellComponent, TnButtonComponent],
  host: {
    'class': 'tn-dialog-shell',
    '[class.tn-dialog--destructive]': 'data.destructive'
  }
})
export class TnConfirmDialogComponent {
  ref = inject(DialogRef<boolean>);
  data = inject<TnConfirmDialogData>(DIALOG_DATA);
}