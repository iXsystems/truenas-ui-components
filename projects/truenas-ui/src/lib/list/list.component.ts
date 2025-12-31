import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'tn-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  host: {
    'class': 'tn-list',
    '[class.tn-list--dense]': 'dense()',
    '[class.tn-list--disabled]': 'disabled()',
    'role': 'list'
  }
})
export class TnListComponent {
  dense = input<boolean>(false);
  disabled = input<boolean>(false);
}