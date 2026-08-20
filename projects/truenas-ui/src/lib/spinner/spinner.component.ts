
import { Component, input, ChangeDetectionStrategy, ViewEncapsulation, computed, effect, isDevMode } from '@angular/core';

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
 * library had already settled on; what it lacked was the warning.
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

  private readonly hasLabelledby = computed(() => (this.ariaLabelledby() ?? '').trim() !== '');

  /** Whether the caller gave this spinner a name of its own. Blank is not a name. */
  private readonly named = computed(() => {
    return (this.ariaLabel() ?? '').trim() !== '' || this.hasLabelledby();
  });

  /**
   * The name to render, or `null` to render no `aria-label` attribute. Same two
   * branches as `TnProgressBarComponent.resolvedAriaLabel`, where the reasoning
   * is set out: an explicit `ariaLabel` always survives, because
   * `aria-labelledby` only wins the name calculation while its IDREF resolves;
   * the generic fallback is withheld beside one, because there it would mask a
   * dangling IDREF with a name that says nothing.
   */
  resolvedAriaLabel = computed(() => {
    const label = this.ariaLabel();
    if ((label ?? '').trim() !== '') {
      return label;
    }
    return this.hasLabelledby() ? null : TN_SPINNER_DEFAULT_LABEL;
  });

  constructor() {
    // The fallback keeps a forgotten label from reaching assistive technology
    // as silence; this keeps it from reaching the developer as silence. Without
    // it the fix would satisfy axe while removing the only remaining signal
    // that the label was missing.
    //
    // An effect rather than a lifecycle hook, so a spinner that is named later
    // stops warning — and, because it re-runs only when the two inputs change,
    // one that stays unnamed warns once rather than once per animation frame.
    if (isDevMode()) {
      effect(() => {
        if (!this.named()) {
          console.warn(
            `[tn-spinner] No ariaLabel or ariaLabelledby was set, so it falls back to `
            + `"${TN_SPINNER_DEFAULT_LABEL}". Assistive technology cannot say WHAT is `
            + `loading — pass ariaLabel, or ariaLabelledby pointing at visible text.`
          );
        }
      });
    }
  }

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