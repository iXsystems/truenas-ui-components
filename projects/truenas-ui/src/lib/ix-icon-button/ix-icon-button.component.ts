import { CommonModule } from '@angular/common';
import { Component, input, output, computed } from '@angular/core';
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
  disabled = input<boolean>(false);
  ariaLabel = input<string | undefined>(undefined);

  // Icon-related inputs
  name = input<string>('');
  size = input<IconSize>('md');
  color = input<string | undefined>(undefined);
  tooltip = input<string | undefined>(undefined);
  library = input<IconLibraryType | undefined>(undefined);

  onClick = output<MouseEvent>();

  classes = computed(() => {
    return ['ix-icon-button'];
  });

  effectiveAriaLabel = computed(() => {
    return this.ariaLabel() || this.name() || 'Icon button';
  });
}
