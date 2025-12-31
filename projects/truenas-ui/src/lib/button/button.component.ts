import { CommonModule } from '@angular/common';
import { Component, input, output, computed } from '@angular/core';

@Component({
  selector: 'ix-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class TnButtonComponent {
  size = 'large';

  primary = input<boolean>(false);
  color = input<'primary' | 'secondary' | 'warn' | 'default'>('default');
  variant = input<'filled' | 'outline'>('filled');
  backgroundColor = input<string | undefined>(undefined);
  label = input<string>('Button');
  disabled = input<boolean>(false);

  onClick = output<MouseEvent>();

  classes = computed(() => {
    // Support both primary boolean and color string approaches
    const isPrimary = this.primary() || this.color() === 'primary';
    const isWarn = this.color() === 'warn';

    let mode = '';
    if (this.variant() === 'outline') {
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
  });
}
