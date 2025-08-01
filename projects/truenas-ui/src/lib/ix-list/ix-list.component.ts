import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ix-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ix-list.component.html',
  styleUrl: './ix-list.component.scss',
  host: {
    'class': 'ix-list',
    '[class.ix-list--dense]': 'dense',
    '[class.ix-list--disabled]': 'disabled',
    'role': 'list'
  }
})
export class IxListComponent {
  @Input() dense = false;
  @Input() disabled = false;
}