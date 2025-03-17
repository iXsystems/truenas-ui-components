import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ix-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ix-button.component.html',
  styleUrls: ['./ix-button.component.scss'],
})
export class ButtonComponent {
  size = 'large';
  /** Is this the principal call to action on the page? */
  @Input()
  primary = false;

  /** What background color to use */
  @Input()
  backgroundColor?: string;

  /** How large should the button be? */
  // @Input()
  // size: 'small' | 'medium' | 'large' = 'medium';

  /**
   * Button contents
   *
   * @required
   */
  @Input()
  label = 'Button';

  /** Optional click handler */
  @Output()
  onClick = new EventEmitter<Event>();

  public get classes(): string[] {
    const mode = this.primary ? 'storybook-button--primary' : 'storybook-button--secondary';

    // return ['storybook-button', `storybook-button--${this.size}`, mode];
    return ['storybook-button', `storybook-button--${this.size}`, mode];
    return ['storybook-button', mode]; // Messes up the size
  }
}
