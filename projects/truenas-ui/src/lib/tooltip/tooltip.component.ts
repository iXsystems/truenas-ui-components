
import type { ElementRef } from '@angular/core';
import { Component, input, output, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { TnIconComponent } from '../icon/icon.component';

/**
 * The visual half of `tnTooltip`, and — while it is only shown on hover — only the visual half
 * (#203).
 *
 * WHY THE HOVER PANEL IS `aria-hidden` AND CARRIES NO ROLE
 * --------------------------------------------------------
 * The accessible text is `TnTooltipDirective`'s job, and it routes it through
 * CDK's `AriaDescriber` — a persistent visually-hidden element referenced by
 * `aria-describedby` on the interactive control, so the reference never dangles
 * while this overlay comes and goes. That is one tooltip, described once.
 *
 * This node used to ALSO claim `role="tooltip"`, which put a second tooltip in
 * the accessibility tree for the same message: the describer's (named, and
 * referenced by the control) and this one (named by nothing when the message is
 * empty or markup-only). axe scores that `aria-tooltip-name`, WCAG 4.1.2.
 * Of the two models the ticket set out — make the overlay the accessible
 * tooltip, or make it decorative — decorative is the one the rest of the
 * directive is already built for, and it is what `pointer-events: none` on
 * `:host` already says: this element cannot be hovered, clicked or interacted
 * with. Hiding it removes the duplicate rather than moving the name onto it.
 *
 * `aria-hidden="true"` is bound to `sticky` rather than to a visibility signal.
 * The node is exposed in no state a hover tooltip can be in, so there is no
 * visibility for it to reflect — the old hard-coded `aria-hidden="false"` was
 * the bug, because that value DID depend on state it was not tracking.
 *
 * AND WHY A PINNED ONE IS THE OPPOSITE
 * ------------------------------------
 * `sticky` is the one state where the panel is more than decoration: it takes
 * pointer events, holds focusable content, and renders a dismiss button, so
 * hiding it would put focusable nodes inside an `aria-hidden` subtree and make
 * the very content pinning exists to reach unreachable. A pinned panel is
 * therefore an exposed, named `dialog` (see `sticky`), and the describer's
 * description on the host stands alongside it rather than in place of it.
 */
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
  /**
   * Optional DOM id for the rendered element. Omitted entirely when empty
   * rather than rendered as `id=""`, which no `aria-describedby` or selector can
   * reference — a silently dangling hook.
   */
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
