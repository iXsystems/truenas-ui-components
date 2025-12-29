import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ix-list-subheader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ix-list-subheader.component.html',
  styleUrl: './ix-list-subheader.component.scss',
  host: {
    'class': 'ix-list-subheader',
    '[class.ix-list-subheader--inset]': 'inset()',
    'role': 'heading',
    'aria-level': '3'
  }
})
export class IxListSubheaderComponent {
  inset = input<boolean>(false);
}