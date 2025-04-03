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
  backgroundColor?: string;

  @Input()
  label = 'Button';

  @Output()
  onClick = new EventEmitter<MouseEvent>();


  public get classes(): string[] {
    const mode = this.primary ? 'button-primary' : 'button-default';
    return ['storybook-button', `storybook-button--${this.size}`, mode];
  }
}
