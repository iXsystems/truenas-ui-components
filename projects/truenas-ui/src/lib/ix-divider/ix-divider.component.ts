import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ix-divider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ix-divider.component.html',
  styleUrl: './ix-divider.component.scss',
  host: {
    'class': 'ix-divider',
    '[class.ix-divider--vertical]': 'vertical',
    '[class.ix-divider--inset]': 'inset',
    'role': 'separator',
    '[attr.aria-orientation]': 'vertical ? "vertical" : "horizontal"'
  }
})
export class IxDividerComponent {
  @Input() vertical = false;
  @Input() inset = false;
}