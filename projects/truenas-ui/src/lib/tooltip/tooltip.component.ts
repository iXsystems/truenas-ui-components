
import type { ElementRef } from '@angular/core';
import { Component, input, output, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { TnIconComponent } from '../icon/icon.component';

@Component({
  selector: 'tn-tooltip',
  standalone: true,
  imports: [TnIconComponent],
  templateUrl: './tooltip.component.html',
  styleUrl: './tooltip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'tn-tooltip-component',
    '[class.tn-tooltip-component--sticky]': 'sticky()'
  }
})
export class TnTooltipComponent {
  message = input('');
  id = input('');

  /**
   * Pinned ("sticky") mode. The tooltip stops being click-through so its content can be
   * interacted with, and a dismiss button is rendered next to the message.
   */
  sticky = input(false);

  /** Accessible name for the dismiss button, so consumers can localize it. */
  closeAriaLabel = input('Close tooltip');

  /** Emitted when the user activates the dismiss button. */
  onDismiss = output<void>();

  private panel = viewChild.required<ElementRef<HTMLElement>>('panel');

  /**
   * Moves focus onto the tooltip panel. Used when sticky mode is entered from the keyboard, so
   * the tooltip's content is reachable without a pointer: from the panel, Tab walks the message
   * (links included) and then the dismiss button. The panel is only focusable in sticky mode,
   * so this is a no-op otherwise.
   */
  focusPanel(): void {
    this.panel().nativeElement.focus();
  }
}
