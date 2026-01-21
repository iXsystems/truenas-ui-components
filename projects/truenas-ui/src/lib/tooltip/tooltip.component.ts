
import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'tn-tooltip',
  standalone: true,
  imports: [],
  templateUrl: './tooltip.component.html',
  styleUrl: './tooltip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'tn-tooltip-component'
  }
})
export class TnTooltipComponent {
  message = input('');
  id = input('');
}