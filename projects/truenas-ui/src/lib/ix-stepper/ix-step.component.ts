import { Component, input, TemplateRef, ViewChild } from '@angular/core';

@Component({
  selector: 'ix-step',
  template: `
    <ng-template #content>
      <ng-content></ng-content>
    </ng-template>
  `,
  standalone: true
})
export class IxStepComponent {
  label = input<string>('');
  icon = input<string | undefined>(undefined);
  optional = input<boolean>(false);
  completed = input<boolean>(false);
  hasError = input<boolean>(false);
  data = input<any>(null);

  @ViewChild('content', { static: true })
  content!: TemplateRef<any>;
}