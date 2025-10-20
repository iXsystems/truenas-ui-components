import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IxIconComponent, IconSize, IconLibraryType } from '../ix-icon/ix-icon.component';

@Component({
  selector: 'ix-icon-button',
  standalone: true,
  imports: [CommonModule, IxIconComponent],
  templateUrl: './ix-icon-button.component.html',
  styleUrls: ['./ix-icon-button.component.scss'],
})
export class IxIconButtonComponent {
  // Button-related inputs
  @Input()
  disabled = false;

  @Input()
  ariaLabel?: string;

  // Icon-related inputs
  @Input()
  name: string = '';

  @Input()
  size: IconSize = 'md';

  @Input()
  color?: string;

  @Input()
  tooltip?: string;

  @Input()
  library?: IconLibraryType;

  @Output()
  onClick = new EventEmitter<MouseEvent>();

  public get classes(): string[] {
    return ['ix-icon-button'];
  }

  public get effectiveAriaLabel(): string {
    return this.ariaLabel || this.name || 'Icon button';
  }
}
