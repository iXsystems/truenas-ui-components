import { CommonModule } from '@angular/common';
import { Component, input, output, computed } from '@angular/core';
import type { IconSize, IconLibraryType } from '../icon/icon.component';
import { TnIconComponent } from '../icon/icon.component';
import { TnTestIdDirective } from '../test-id';

@Component({
  selector: 'tn-icon-button',
  standalone: true,
  imports: [CommonModule, TnIconComponent, TnTestIdDirective],
  templateUrl: './icon-button.component.html',
  styleUrls: ['./icon-button.component.scss'],
})
export class TnIconButtonComponent {
  // Button-related inputs
  disabled = input<boolean>(false);
  ariaLabel = input<string | undefined>(undefined);
  /**
   * Test-id applied to the rendered `<button>` element. Rendered under whichever attribute
   * name is configured via `TN_TEST_ATTR` (default `data-testid`).
   */
  testId = input<string | undefined>(undefined);

  // Icon-related inputs
  name = input<string>('');
  size = input<IconSize>('md');
  color = input<string | undefined>(undefined);
  tooltip = input<string | undefined>(undefined);
  library = input<IconLibraryType | undefined>(undefined);

  onClick = output<MouseEvent>();

  classes = computed(() => {
    const result = ['tn-icon-button'];
    if (this.color()) {result.push('tn-icon-button--custom-color');}
    return result;
  });

  effectiveAriaLabel = computed(() => {
    return this.ariaLabel() || this.name() || 'Icon button';
  });
}
