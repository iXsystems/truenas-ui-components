import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'ix-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ix-list.component.html',
  styleUrl: './ix-list.component.scss',
  host: {
    'class': 'ix-list',
    '[class.ix-list--dense]': 'dense()',
    '[class.ix-list--disabled]': 'disabled()',
    'role': 'list'
  }
})
export class IxListComponent {
  dense = input<boolean>(false);
  disabled = input<boolean>(false);
}