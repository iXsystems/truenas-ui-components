import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ix-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ix-button.component.html',
  styleUrls: ['./ix-button.component.scss'],
})
export class IxButtonComponent {
  size = 'large';

  @Input()
  primary = false;

  @Input()
  color: 'primary' | 'secondary' | 'warn' | 'default' = 'default';

  @Input()
  variant: 'filled' | 'outline' = 'filled';

  @Input()
  backgroundColor?: string;

  @Input()
  label = 'Button';

  @Input()
  disabled = false;

  @Output()
  onClick = new EventEmitter<MouseEvent>();


  public get classes(): string[] {
    // Support both primary boolean and color string approaches
    const isPrimary = this.primary || this.color === 'primary';
    const isWarn = this.color === 'warn';
    
    let mode = '';
    if (this.variant === 'outline') {
      if (isPrimary) {
        mode = 'button-outline-primary';
      } else if (isWarn) {
        mode = 'button-outline-warn';
      } else {
        mode = 'button-outline-default';
      }
    } else {
      if (isPrimary) {
        mode = 'button-primary';
      } else if (isWarn) {
        mode = 'button-warn';
      } else {
        mode = 'button-default';
      }
    }
    
    return ['storybook-button', `storybook-button--${this.size}`, mode];
  }
}
