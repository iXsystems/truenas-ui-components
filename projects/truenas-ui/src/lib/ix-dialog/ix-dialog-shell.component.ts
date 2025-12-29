import { Component, input, signal, OnInit, Inject, Optional } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { DOCUMENT, CommonModule } from '@angular/common';

@Component({
  selector: 'ix-dialog-shell',
  template: `
    <header class="ix-dialog__header">
      <h2 class="ix-dialog__title">{{ title() }}</h2>
      <button type="button"
              class="ix-dialog__fullscreen"
              tabindex="-1"
              (click)="toggleFullscreen()"
              [attr.aria-label]="isFullscreen() ? 'Exit fullscreen' : 'Enter fullscreen'"
              *ngIf="showFullscreenButton()">
        <span class="ix-dialog__fullscreen-icon">{{ isFullscreen() ? '⤓' : '⤢' }}</span>
      </button>
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
  imports: [CommonModule],
  host: {
    'class': 'ix-dialog-shell'
  }
})
export class IxDialogShellComponent implements OnInit {
  title = input<string>('');
  showFullscreenButton = input<boolean>(false);

  isFullscreen = signal<boolean>(false);
  private originalStyles: { [key: string]: string } = {};

  constructor(
    private ref: DialogRef,
    @Inject(DOCUMENT) private document: Document,
    @Optional() @Inject(DIALOG_DATA) private data?: any
  ) {}

  ngOnInit() {
    // Check if dialog was opened in fullscreen mode by looking for existing fullscreen class
    setTimeout(() => {
      const dialogPanel = this.document.querySelector('.ix-dialog-panel');
      if (dialogPanel?.classList.contains('ix-dialog--fullscreen')) {
        this.isFullscreen.set(true);
      }
    });
  }
  
  close(result?: any) { 
    this.ref.close(result); 
  }
  
  toggleFullscreen() {
    if (this.isFullscreen()) {
      this.exitFullscreen();
    } else {
      this.enterFullscreen();
    }
  }

  private enterFullscreen() {
    const dialogPanel = this.document.querySelector('.ix-dialog-panel') as HTMLElement;

    if (dialogPanel) {
      // Store original styles
      this.originalStyles = {
        panelMaxWidth: dialogPanel.style.maxWidth,
        panelMaxHeight: dialogPanel.style.maxHeight,
        panelWidth: dialogPanel.style.width,
        panelHeight: dialogPanel.style.height,
        panelBorderRadius: dialogPanel.style.borderRadius
      };

      // Apply fullscreen styles
      dialogPanel.style.maxWidth = '100vw';
      dialogPanel.style.maxHeight = '100vh';
      dialogPanel.style.width = '100vw';
      dialogPanel.style.height = '100vh';
      dialogPanel.style.borderRadius = '0';

      // Add fullscreen class
      dialogPanel.classList.add('ix-dialog--fullscreen');

      this.isFullscreen.set(true);
    }
  }

  private exitFullscreen() {
    const dialogPanel = this.document.querySelector('.ix-dialog-panel') as HTMLElement;

    if (dialogPanel) {
      // Restore original styles
      dialogPanel.style.maxWidth = this.originalStyles['panelMaxWidth'] || '90vw';
      dialogPanel.style.maxHeight = this.originalStyles['panelMaxHeight'] || '90vh';
      dialogPanel.style.width = this.originalStyles['panelWidth'] || '';
      dialogPanel.style.height = this.originalStyles['panelHeight'] || '';
      dialogPanel.style.borderRadius = this.originalStyles['panelBorderRadius'] || '8px';

      // Remove fullscreen class
      dialogPanel.classList.remove('ix-dialog--fullscreen');

      this.isFullscreen.set(false);
    }
  }
}