
import { Component, input, ChangeDetectionStrategy } from '@angular/core';

/**
 * The visual half of `tnTooltip`, and only the visual half (#203).
 *
 * WHY THIS NODE IS `aria-hidden` AND CARRIES NO ROLE
 * -------------------------------------------------
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
 * `aria-hidden="true"` is static rather than bound to a visibility signal on
 * purpose. The node is exposed in no state, so there is no state for it to
 * reflect — the previous hard-coded `aria-hidden="false"` was the bug, because
 * that value DID depend on state it was not tracking.
 */
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
  /**
   * Optional DOM id for the rendered element. Omitted entirely when empty
   * rather than rendered as `id=""`, which no `aria-describedby` or selector can
   * reference — a silently dangling hook.
   */
  id = input('');
}
