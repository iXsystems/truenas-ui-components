import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ix-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="ix-tooltip" 
      [id]="id"
      role="tooltip"
      [attr.aria-hidden]="false">
      {{ message }}
    </div>
  `,
  styleUrl: './ix-tooltip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ix-tooltip-component'
  }
})
export class IxTooltipComponent {
  @Input() message = '';
  @Input() id = '';
}