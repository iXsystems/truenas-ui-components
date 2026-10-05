
import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'tn-list',
  standalone: true,
  imports: [],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
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