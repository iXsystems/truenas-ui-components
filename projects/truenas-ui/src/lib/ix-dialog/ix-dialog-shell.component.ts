import { Component, Input } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'ix-dialog-shell',
  template: `
    <header class="ix-dialog__header">
      <h2 class="ix-dialog__title">{{ title }}</h2>
      <button type="button" class="ix-dialog__close" tabindex="-1" (click)="close()" aria-label="Close dialog">✕</button>
    </header>

    <section class="ix-dialog__content" cdkDialogContent>
      <ng-content></ng-content>
    </section>

    <footer class="ix-dialog__actions" cdkDialogActions>
      <ng-content select="[ixDialogAction]"></ng-content>
    </footer>
  `,
  standalone: true,
  host: {
    'class': 'ix-dialog-shell'
  }
})
export class IxDialogShellComponent {
  @Input() title = '';
  
  constructor(private ref: DialogRef) {}
  
  close(result?: any) { 
    this.ref.close(result); 
  }
}