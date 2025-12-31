import { Directive } from '@angular/core';

@Directive({
  selector: 'input[ixInput], textarea[ixInput], div[ixInput]',
  standalone: true,
  host: {
    'class': 'ix-input-directive'
  }
})
export class IxInputDirective {
  constructor() {}
}