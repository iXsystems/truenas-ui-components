
import { Component, input, ChangeDetectionStrategy, ViewEncapsulation, computed } from '@angular/core';
import { tnAccessibleName } from '../a11y/accessible-name';

export type SpinnerMode = 'determinate' | 'indeterminate';

/**
 * The accessible name a spinner falls back to when the caller names neither
 * `ariaLabel` nor `ariaLabelledby` (#202). Same reasoning as
 * `TN_PROGRESS_BAR_DEFAULT_LABEL`, and the case is sharper here: the spinner
 * defaults to indeterminate mode, so its unnamed default rendering reached
 * assistive technology as a progressbar with neither a name nor a value.
 *
 * `branded-spinner.component.ts` in this folder already fell back this way —
 * `ariaLabel() || "Loading..."` inline — so a fallback is the shape this
 * library had already settled on; what it lacked was the warning. It has both
 * since #206, through the same `tnAccessibleName` this component uses, which is
 * why the two constants sit side by side and differ.
 */
export const TN_SPINNER_DEFAULT_LABEL = 'Loading';

@Component({
  selector: 'tn-spinner',
  standalone: true,
  imports: [],
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'tn-spinner',
    '[class.tn-spinner-indeterminate]': 'mode() === "indeterminate"',
    '[class.tn-spinner-determinate]': 'mode() === "determinate"',
    '[attr.aria-valuenow]': 'mode() === "determinate" ? value() : null',
    '[attr.aria-valuemin]': 'mode() === "determinate" ? 0 : null',
    '[attr.aria-valuemax]': 'mode() === "determinate" ? 100 : null',
    'role': 'progressbar',
    '[attr.aria-label]': 'resolvedAriaLabel()',
    '[attr.aria-labelledby]': 'ariaLabelledby() || null'
  }
})
export class TnSpinnerComponent {
  mode = input<SpinnerMode>('indeterminate');
  value = input<number>(0);
  diameter = input<number>(40);
  strokeWidth = input<number>(4);
  ariaLabel = input<string | null>(null);
  ariaLabelledby = input<string | null>(null);

  /**
   * The name to render, or `null` to render no `aria-label` attribute — and the
   * dev-mode warning when the caller named neither input.
   *
   * Both halves live in `../a11y/accessible-name`, shared with `tn-progress-bar`
   * and `tn-branded-spinner` (#206), where the reasoning for each is set out:
   * an explicit `ariaLabel` always survives, because `aria-labelledby` only wins
   * the name calculation while its IDREF resolves; the generic fallback is
   * withheld beside one, because there it would mask a dangling IDREF with a
   * name that says nothing.
   */
  resolvedAriaLabel = tnAccessibleName({
    selector: 'tn-spinner',
    fallback: TN_SPINNER_DEFAULT_LABEL,
    activity: 'loading',
    ariaLabel: this.ariaLabel,
    ariaLabelledby: this.ariaLabelledby
  });

  radius = computed(() => {
    return (this.diameter() - this.strokeWidth()) / 2;
  });

  circumference = computed(() => {
    return 2 * Math.PI * this.radius();
  });

  strokeDasharray = computed(() => {
    return `${this.circumference()} ${this.circumference()}`;
  });

  strokeDashoffset = computed(() => {
    if (this.mode() === 'indeterminate') {
      return 0;
    }
    const progress = Math.max(0, Math.min(100, this.value()));
    return this.circumference() - (progress / 100) * this.circumference();
  });

  viewBox = computed(() => {
    const size = this.diameter();
    return `0 0 ${size} ${size}`;
  });
}