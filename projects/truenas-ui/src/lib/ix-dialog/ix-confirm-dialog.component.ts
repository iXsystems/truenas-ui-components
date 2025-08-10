import { Component, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { IxDialogShellComponent } from './ix-dialog-shell.component';
import { IxButtonComponent } from '../ix-button/ix-button.component';

@Component({
  selector: 'ix-confirm-dialog',
  template: `
    <ix-dialog-shell [title]="data.title">
      <p>{{ data.message }}</p>
      <div ixDialogAction>
        <ix-button 
          type="button"
          variant="outline"
          [label]="data.cancelText || 'Cancel'" 
          (click)="ref.close(false)">
        </ix-button>
        <ix-button 
          type="button" 
          [color]="data.destructive ? 'warn' : 'primary'"
          [label]="data.confirmText || 'OK'" 
          (click)="ref.close(true)">
        </ix-button>
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
  constructor(
    public ref: DialogRef<boolean>, 
    @Inject(DIALOG_DATA) public data: any
  ) {}
}