import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ProgressBarMode = 'determinate' | 'indeterminate' | 'buffer';

@Component({
  selector: 'ix-progress-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ix-progress-bar.component.html',
  styleUrls: ['./ix-progress-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ix-progress-bar',
    '[class.ix-progress-bar-determinate]': 'mode === "determinate"',
    '[class.ix-progress-bar-indeterminate]': 'mode === "indeterminate"',
    '[class.ix-progress-bar-buffer]': 'mode === "buffer"',
    'role': 'progressbar',
    '[attr.aria-valuenow]': 'mode === "determinate" ? value : null',
    '[attr.aria-valuemin]': 'mode === "determinate" ? 0 : null',
    '[attr.aria-valuemax]': 'mode === "determinate" ? 100 : null',
    '[attr.aria-label]': 'ariaLabel || null',
    '[attr.aria-labelledby]': 'ariaLabelledby || null'
  }
})
export class IxProgressBarComponent {
  @Input() mode: ProgressBarMode = 'determinate';
  @Input() value: number = 0;
  @Input() bufferValue: number = 0;
  @Input() ariaLabel: string | null = null;
  @Input() ariaLabelledby: string | null = null;

  /**
   * Gets the transform value for the primary progress bar
   */
  get primaryTransform(): string {
    if (this.mode === 'determinate' || this.mode === 'buffer') {
      const clampedValue = Math.max(0, Math.min(100, this.value));
      const scale = clampedValue / 100;
      return `scaleX(${scale})`;
    }
    // For indeterminate mode, don't apply inline transform - CSS animation handles it
    if (this.mode === 'indeterminate') {
      return '';
    }
    return 'scaleX(0)';
  }

  /**
   * Gets the positioning and size for the buffer dots animation
   */
  get bufferStyles(): { width: string; right: string } {
    if (this.mode === 'buffer') {
      const buffer = Math.max(0, Math.min(100, this.bufferValue));
      
      // Buffer takes up bufferValue% of total width, positioned from right
      return {
        width: `${buffer}%`,
        right: '0px'
      };
    }
    return { width: '0%', right: '0px' };
  }

  /**
   * Gets the transform value for the buffer progress bar (deprecated - use bufferStyles)
   */
  get bufferTransform(): string {
    return 'scaleX(0)'; // Hide the old buffer bar
  }
}