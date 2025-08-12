import { Component, Input, TemplateRef, ViewChild } from '@angular/core';

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
  @Input() 
  label: string = '';
  
  @Input()
  icon?: string;
  
  @Input()
  optional = false;
  
  @Input()
  completed = false;
  
  @Input()
  hasError = false;
  
  @Input()
  data: any = null;
  
  @ViewChild('content', { static: true })
  content!: TemplateRef<any>;
}