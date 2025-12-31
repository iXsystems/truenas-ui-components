import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'ix-list-subheader',
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
export class IxListSubheaderComponent {
  inset = input<boolean>(false);
}