import { CommonModule } from '@angular/common';
import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ix-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="ix-tooltip"
      role="tooltip"
      [id]="id()"
      [attr.aria-hidden]="false">
      {{ message() }}
    </div>
  `,
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