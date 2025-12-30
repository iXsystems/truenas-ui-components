import { CommonModule } from '@angular/common';
import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ix-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ix-tooltip.component.html',
  styleUrl: './ix-tooltip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ix-tooltip-component'
  }
})
export class IxTooltipComponent {
  message = input('');
  id = input('');
}