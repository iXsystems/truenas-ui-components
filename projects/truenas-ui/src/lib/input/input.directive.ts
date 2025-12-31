import { Directive } from '@angular/core';

@Directive({
  selector: 'input[tnInput], textarea[tnInput], div[tnInput]',
  standalone: true,
  host: {
    'class': 'tn-input-directive'
  }
})
export class TnInputDirective {
  constructor() {}
}