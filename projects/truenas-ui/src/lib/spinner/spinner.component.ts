import { NgIf } from '@angular/common';
import { Component, input, ChangeDetectionStrategy, ViewEncapsulation, computed } from '@angular/core';

export type SpinnerMode = 'determinate' | 'indeterminate';

@Component({
  selector: 'tn-spinner',
  standalone: true,
  imports: [NgIf],
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'ix-spinner',
    '[class.ix-spinner-indeterminate]': 'mode() === "indeterminate"',
    '[class.ix-spinner-determinate]': 'mode() === "determinate"',
    '[attr.aria-valuenow]': 'mode() === "determinate" ? value() : null',
    '[attr.aria-valuemin]': 'mode() === "determinate" ? 0 : null',
    '[attr.aria-valuemax]': 'mode() === "determinate" ? 100 : null',
    'role': 'progressbar',
    '[attr.aria-label]': 'ariaLabel() || null',
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