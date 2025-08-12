import { Component, Input, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { NgIf } from '@angular/common';

export type SpinnerMode = 'determinate' | 'indeterminate';

@Component({
  selector: 'ix-spinner',
  standalone: true,
  imports: [NgIf],
  templateUrl: './ix-spinner.component.html',
  styleUrls: ['./ix-spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'ix-spinner',
    '[class.ix-spinner-indeterminate]': 'mode === "indeterminate"',
    '[class.ix-spinner-determinate]': 'mode === "determinate"',
    '[attr.aria-valuenow]': 'mode === "determinate" ? value : null',
    '[attr.aria-valuemin]': 'mode === "determinate" ? 0 : null',
    '[attr.aria-valuemax]': 'mode === "determinate" ? 100 : null',
    'role': 'progressbar',
    '[attr.aria-label]': 'ariaLabel || null',
    '[attr.aria-labelledby]': 'ariaLabelledby || null'
  }
})
export class IxSpinnerComponent {
  @Input() mode: SpinnerMode = 'indeterminate';
  @Input() value: number = 0;
  @Input() diameter: number = 40;
  @Input() strokeWidth: number = 4;
  @Input() ariaLabel: string | null = null;
  @Input() ariaLabelledby: string | null = null;

  get radius(): number {
    return (this.diameter - this.strokeWidth) / 2;
  }

  get circumference(): number {
    return 2 * Math.PI * this.radius;
  }

  get strokeDasharray(): string {
    return `${this.circumference} ${this.circumference}`;
  }

  get strokeDashoffset(): number {
    if (this.mode === 'indeterminate') {
      return 0;
    }
    const progress = Math.max(0, Math.min(100, this.value));
    return this.circumference - (progress / 100) * this.circumference;
  }

  get viewBox(): string {
    const size = this.diameter;
    return `0 0 ${size} ${size}`;
  }
}