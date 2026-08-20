
import { Component, input, ChangeDetectionStrategy, computed, effect, isDevMode } from '@angular/core';

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
 * in the constructor. Exported so specs assert against it by name rather than
 * by a copied string literal.
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

  /** Whether the caller gave this bar a name of its own. Blank is not a name. */
  private readonly named = computed(() => {
    return (this.ariaLabel() ?? '').trim() !== '' || (this.ariaLabelledby() ?? '').trim() !== '';
  });

  /**
   * The name to render, or `null` to render no `aria-label` attribute.
   *
   * Null when `ariaLabelledby` is set, because `aria-labelledby` wins the ARIA
   * name calculation outright — a fallback emitted alongside it would be a name
   * that nothing announces, and reads to anyone inspecting the element as one
   * that is in force when it is not.
   */
  resolvedAriaLabel = computed(() => {
    if ((this.ariaLabelledby() ?? '').trim() !== '') {
      return null;
    }
    const label = (this.ariaLabel() ?? '').trim();
    return label !== '' ? this.ariaLabel() : TN_PROGRESS_BAR_DEFAULT_LABEL;
  });

  constructor() {
    // The fallback keeps a forgotten label from reaching assistive technology
    // as silence; this keeps it from reaching the developer as silence. Without
    // it the fix would satisfy axe while removing the only remaining signal
    // that the label was missing.
    //
    // An effect rather than a lifecycle hook, so a bar that is named later
    // stops warning — and, because it re-runs only when the two inputs change,
    // a bar that stays unnamed warns once rather than once per animation frame.
    if (isDevMode()) {
      effect(() => {
        if (!this.named()) {
          console.warn(
            `[tn-progress-bar] No ariaLabel or ariaLabelledby was set, so it falls back to `
            + `"${TN_PROGRESS_BAR_DEFAULT_LABEL}". Assistive technology cannot say WHAT is `
            + `progressing — pass ariaLabel, or ariaLabelledby pointing at visible text.`
          );
        }
      });
    }
  }

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