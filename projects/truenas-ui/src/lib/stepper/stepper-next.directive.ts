import { Directive, inject } from '@angular/core';
import { TnStepperComponent } from './stepper.component';

/**
 * Advances the ancestor `<tn-stepper>` to the next step when the host is clicked.
 *
 * Mirrors Angular Material's `matStepperNext`. Place it on a button (native
 * `<button>` or `<tn-button>`) rendered inside a `<tn-step>` — including step
 * content that lives in a projected child component. The directive resolves the
 * stepper through the element injector, so a disabled host simply emits no click
 * and navigation is naturally gated.
 *
 * @example
 * ```html
 * <tn-button [tnStepperNext] [disabled]="form.invalid" [label]="'Next' | translate" />
 * ```
 */
@Directive({
  selector: '[tnStepperNext]',
  standalone: true,
  host: {
    '(click)': 'stepper.next()',
  },
})
export class TnStepperNextDirective {
  protected stepper = inject(TnStepperComponent);
}
