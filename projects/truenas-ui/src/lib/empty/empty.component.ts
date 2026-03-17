import { Component, input, output, computed } from '@angular/core';
import { TnButtonComponent } from '../button/button.component';
import { TnIconComponent } from '../icon/icon.component';
import type { IconLibraryType } from '../icon/icon.component';

export type TnEmptySize = 'default' | 'compact';

@Component({
  selector: 'tn-empty',
  standalone: true,
  imports: [TnIconComponent, TnButtonComponent],
  templateUrl: './empty.component.html',
  styleUrls: ['./empty.component.scss'],
  host: {
    'class': 'tn-empty',
    '[class.tn-empty--compact]': 'size() === "compact"',
    'role': 'status',
  },
})
export class TnEmptyComponent {
  title = input.required<string>();
  description = input<string>();
  icon = input<string>();
  iconLibrary = input<IconLibraryType>('mdi');
  actionText = input<string>();
  size = input<TnEmptySize>('default');

  onAction = output<void>();

  protected hasAction = computed(() => !!this.actionText());

  iconSize = computed(() => {
    return this.size() === 'compact' ? 'lg' : 'xl';
  });
}
