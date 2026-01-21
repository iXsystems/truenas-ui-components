
import { Component, input } from '@angular/core';

@Component({
  selector: 'tn-list-subheader',
  standalone: true,
  imports: [],
  templateUrl: './list-subheader.component.html',
  styleUrl: './list-subheader.component.scss',
  host: {
    'class': 'tn-list-subheader',
    '[class.tn-list-subheader--inset]': 'inset()',
    'role': 'heading',
    'aria-level': '3'
  }
})
export class TnListSubheaderComponent {
  inset = input<boolean>(false);
}