import { Directive, inject } from '@angular/core';
import { TnStepperComponent } from './stepper.component';

/**
 * Moves the ancestor `<tn-stepper>` to the previous step when the host is clicked.
 *
 * Mirrors Angular Material's `matStepperPrevious`. Place it on a button (native
 * `<button>` or `<tn-button>`) rendered inside a `<tn-step>` — including step
 * content that lives in a projected child component. The directive resolves the
 * stepper through the element injector.
 *
 * @example
 * ```html
 * <tn-button [tnStepperPrevious] [label]="'Back' | translate" />
 * ```
 */
@Directive({
  selector: '[tnStepperPrevious]',
  standalone: true,
  host: {
    '(click)': 'stepper.previous()',
  },
})
export class TnStepperPreviousDirective {
  protected stepper = inject(TnStepperComponent);
}
