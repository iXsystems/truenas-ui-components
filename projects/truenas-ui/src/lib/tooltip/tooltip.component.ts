import { CommonModule } from '@angular/common';
import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'tn-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tooltip.component.html',
  styleUrl: './tooltip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ix-tooltip-component'
  }
})
export class TnTooltipComponent {
  message = input('');
  id = input('');
}