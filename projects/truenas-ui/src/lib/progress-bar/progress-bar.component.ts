
import { Component, input, ChangeDetectionStrategy, computed } from '@angular/core';
import { tnAccessibleName } from '../a11y/accessible-name';

export type ProgressBarMode = 'determinate' | 'indeterminate' | 'buffer';

/**
 * The accessible name a bar falls back to when the caller names neither
 * `ariaLabel` nor `ariaLabelledby` (#202).
 *
 * Deliberately generic, and deliberately not silent: the host carries
 * `role="progressbar"` unconditionally, so without a fallback the default
 * rendering is a progressbar assistive technology announces with no name at all
 * — "progress bar, 40%", with nothing to say what is progressing. The
 * alternative fix, withholding the role until there is a name for it, trades
 * that for no announcement whatever, which is worse: a screen reader would not
 * learn that anything is in progress, and on a determinate bar it would lose
 * the value too.
 *
 * A generic name is still a poor one, so it is paired with the dev-mode warning
 * `tnAccessibleName` raises. Exported so specs assert against it by name rather
 * than by a copied string literal.
 */
export const TN_PROGRESS_BAR_DEFAULT_LABEL = 'Progress';

@Component({
  selector: 'tn-progress-bar',
  standalone: true,
  imports: [],
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'tn-progress-bar',
    '[class.tn-progress-bar-determinate]': 'mode() === "determinate"',
    '[class.tn-progress-bar-indeterminate]': 'mode() === "indeterminate"',
    '[class.tn-progress-bar-buffer]': 'mode() === "buffer"',
    'role': 'progressbar',
    '[attr.aria-valuenow]': 'mode() === "determinate" ? value() : null',
    '[attr.aria-valuemin]': 'mode() === "determinate" ? 0 : null',
    '[attr.aria-valuemax]': 'mode() === "determinate" ? 100 : null',
    '[attr.aria-label]': 'resolvedAriaLabel()',
    '[attr.aria-labelledby]': 'ariaLabelledby() || null'
  }
})
export class TnProgressBarComponent {
  mode = input<ProgressBarMode>('determinate');
  value = input<number>(0);
  bufferValue = input<number>(0);
  ariaLabel = input<string | null>(null);
  ariaLabelledby = input<string | null>(null);

  /**
   * The name to render, or `null` to render no `aria-label` attribute — and the
   * dev-mode warning when the caller named neither input.
   *
   * Both halves live in `../a11y/accessible-name`, shared with `tn-spinner` and
   * `tn-branded-spinner` (#206), where the reasoning for each is set out: why an
   * explicit `ariaLabel` always survives, and why the generic fallback is
   * withheld beside an `ariaLabelledby`.
   *
   * A field initializer rather than the constructor, because it registers an
   * `effect` and so needs an injection context; this is one, and it keeps the
   * signal beside the inputs it reads.
   */
  resolvedAriaLabel = tnAccessibleName({
    selector: 'tn-progress-bar',
    fallback: TN_PROGRESS_BAR_DEFAULT_LABEL,
    activity: 'progressing',
    ariaLabel: this.ariaLabel,
    ariaLabelledby: this.ariaLabelledby
  });

  /**
   * Gets the transform value for the primary progress bar
   */
  primaryTransform = computed(() => {
    if (this.mode() === 'determinate' || this.mode() === 'buffer') {
      const clampedValue = Math.max(0, Math.min(100, this.value()));
      const scale = clampedValue / 100;
      return `scaleX(${scale})`;
    }
    // For indeterminate mode, don't apply inline transform - CSS animation handles it
    if (this.mode() === 'indeterminate') {
      return '';
    }
    return 'scaleX(0)';
  });

  /**
   * Gets the positioning and size for the buffer dots animation
   */
  bufferStyles = computed(() => {
    if (this.mode() === 'buffer') {
      const buffer = Math.max(0, Math.min(100, this.bufferValue()));

      // Buffer takes up bufferValue% of total width, positioned from right
      return {
        width: `${buffer}%`,
        right: '0px'
      };
    }
    return { width: '0%', right: '0px' };
  });

  /**
   * Gets the transform value for the buffer progress bar (deprecated - use bufferStyles)
   */
  bufferTransform = computed(() => {
    return 'scaleX(0)'; // Hide the old buffer bar
  });
}