
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
   *
   * It also changes what the panel *is* for assistive tech: ARIA's `tooltip` role is specified as
   * non-focusable, non-interactive content that something else is described by, so a screen
   * reader may flatten it to a text description and never expose the link or the dismiss button -
   * exactly what pinning exists to make reachable. A pinned panel is therefore a `dialog`, named
   * by `panelAriaLabel`.
   *
   * It is a *non-modal* dialog and deliberately traps nothing: Tab past the dismiss button leaves
   * the panel while it stays open. Where focus lands next is wherever the panel sits in the tab
   * order, which is the end of it - CDK appends its overlay container as the last child of
   * `<body>` - so in practice Tab leaves the document for the browser's own chrome rather than
   * continuing after the host. Not trapping is the right shape for a popup the user can also
   * leave by Escape or by clicking outside, and it keeps a tooltip from holding the keyboard
   * hostage.
   */
  sticky = input(false);

  /** Accessible name for the dismiss button, so consumers can localize it. */
  closeAriaLabel = input('Close tooltip');

  /**
   * Accessible name for the pinned panel (see `sticky`), so consumers can localize it.
   *
   * A short static name rather than the message: a screen reader reads a dialog's name on entry
   * and then its content, so naming it after the message would announce that message twice —
   * three times counting the host's own description.
   */
  panelAriaLabel = input('Tooltip');

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
