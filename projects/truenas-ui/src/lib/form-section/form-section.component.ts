import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TnIconComponent } from '../icon/icon.component';
import { LabelMarkupPipe } from '../pipes/label-markup/label-markup.pipe';
import { TnTestIdDirective, type TnTestIdValue } from '../test-id';
import { TnTooltipDirective } from '../tooltip/tooltip.directive';
import type { TooltipPosition } from '../tooltip/tooltip.directive';

/** Per-instance counter for generating unique heading ids. */
let nextUniqueId = 0;

/**
 * Semantic grouping for a related set of form fields. Renders a native
 * `<fieldset>` with an optional `<legend>` heading and help tooltip, and
 * projects its content unchanged — it adds structure and a11y semantics, not
 * layout for the fields themselves (compose `tn-form-field` inside it for that).
 */
@Component({
  selector: 'tn-form-section',
  standalone: true,
  imports: [TnIconComponent, TnTooltipDirective, TnTestIdDirective, LabelMarkupPipe],
  templateUrl: './form-section.component.html',
  styleUrls: ['./form-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TnFormSectionComponent {
  /**
   * Heading rendered in the `<legend>`. Supports lightweight label markup
   * (**bold**, *italic*, `code`); leave empty to omit the legend entirely.
   */
  heading = input<string>('');

  /** Optional help tooltip shown via an icon next to the heading. */
  tooltip = input<string>('');

  /** Placement of the tooltip relative to its help icon. */
  tooltipPosition = input<TooltipPosition>('above');

  /** Test id applied to the host for harness/e2e selection. */
  testId = input<TnTestIdValue>(undefined);

  /**
   * Stable id linking the fieldset to its heading via `aria-labelledby`. This
   * names the group from the heading text alone — without it the legend's
   * accessible name would also absorb the tooltip button's `aria-label`,
   * announcing the whole tooltip sentence on every control in the group.
   */
  protected readonly headingId = `tn-form-section-${nextUniqueId++}`;
}
