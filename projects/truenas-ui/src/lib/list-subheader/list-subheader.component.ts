import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'tn-list-subheader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-subheader.component.html',
  styleUrl: './list-subheader.component.scss',
  host: {
    'class': 'ix-list-subheader',
    '[class.ix-list-subheader--inset]': 'inset()',
    'role': 'heading',
    'aria-level': '3'
  }
})
export class TnListSubheaderComponent {
  inset = input<boolean>(false);
}