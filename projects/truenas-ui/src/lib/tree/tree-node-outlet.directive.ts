import { CdkTreeNodeOutlet } from '@angular/cdk/tree';
import { Directive } from '@angular/core';

@Directive({
  selector: '[tnTreeNodeOutlet]',
  standalone: true,
  hostDirectives: [{
    directive: CdkTreeNodeOutlet,
    inputs: [],
    outputs: []
  }]
})
export class TnTreeNodeOutletDirective {}