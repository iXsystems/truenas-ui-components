import { Directive } from '@angular/core';

@Directive({
  selector: 'input[tnInput], textarea[tnInput], div[tnInput]',
  standalone: true,
  host: {
    'class': 'ix-input-directive'
  }
})
export class TnInputDirective {
  constructor() {}
}