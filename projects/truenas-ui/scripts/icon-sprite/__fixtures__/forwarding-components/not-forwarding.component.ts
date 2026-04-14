import { Component, input } from '@angular/core';

@Component({
  selector: 'tn-button',
  standalone: true,
  templateUrl: './not-forwarding.component.html',
})
export class TnButtonComponent {
  label = input<string>('');
}
