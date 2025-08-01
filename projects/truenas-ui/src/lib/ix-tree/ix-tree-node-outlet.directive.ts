import { Directive } from '@angular/core';
import { CdkTreeNodeOutlet } from '@angular/cdk/tree';

@Directive({
  selector: '[ixTreeNodeOutlet]',
  standalone: true,
  hostDirectives: [{
    directive: CdkTreeNodeOutlet,
    inputs: [],
    outputs: []
  }]
})
export class IxTreeNodeOutletDirective {}