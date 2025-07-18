import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'ix-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ix-card.component.html',
  styleUrls: ['./ix-card.component.scss'],
})
export class IxCardComponent {
  @Input()
  title?: string;

  @Input()
  elevation: 'low' | 'medium' | 'high' = 'medium';

  @Input()
  padding: 'small' | 'medium' | 'large' = 'medium';

  @Input()
  bordered = false;

  public get classes(): string[] {
    const elevationClass = `ix-card--elevation-${this.elevation}`;
    const paddingClass = `ix-card--padding-${this.padding}`;
    const borderedClass = this.bordered ? 'ix-card--bordered' : '';
    
    return ['ix-card', elevationClass, paddingClass, borderedClass].filter(Boolean);
  }
}