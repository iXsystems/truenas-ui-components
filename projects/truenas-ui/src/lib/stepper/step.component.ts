import type { TemplateRef} from '@angular/core';
import { Component, input, viewChild } from '@angular/core';

@Component({
  selector: 'tn-step',
  template: `
    <ng-template #content>
      <ng-content />
    </ng-template>
  `,
  standalone: true
})
export class TnStepComponent {
  label = input<string>('');
  icon = input<string | undefined>(undefined);
  optional = input<boolean>(false);
  completed = input<boolean>(false);
  hasError = input<boolean>(false);
  /** Message shown beneath the step label while the step is in an error state. */
  errorMessage = input<string | undefined>(undefined);
  data = input<unknown>(null);

  content = viewChild.required<TemplateRef<unknown>>('content');
}