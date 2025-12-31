import { CdkTreeNodeOutlet } from '@angular/cdk/tree';
import { Directive } from '@angular/core';

@Directive({
  selector: '[ixTreeNodeOutlet]',
  standalone: true,
  hostDirectives: [{
    directive: CdkTreeNodeOutlet,
    inputs: [],
    outputs: []
  }]
})
export class TnTreeNodeOutletDirective {}