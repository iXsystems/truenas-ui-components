import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'tn-divider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './divider.component.html',
  styleUrl: './divider.component.scss',
  host: {
    'class': 'tn-divider',
    '[class.tn-divider--vertical]': 'vertical()',
    '[class.tn-divider--inset]': 'inset()',
    'role': 'separator',
    '[attr.aria-orientation]': 'vertical() ? "vertical" : "horizontal"'
  }
})
export class TnDividerComponent {
  vertical = input<boolean>(false);
  inset = input<boolean>(false);
}