import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'ix-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  host: {
    'class': 'ix-list',
    '[class.ix-list--dense]': 'dense()',
    '[class.ix-list--disabled]': 'disabled()',
    'role': 'list'
  }
})
export class TnListComponent {
  dense = input<boolean>(false);
  disabled = input<boolean>(false);
}