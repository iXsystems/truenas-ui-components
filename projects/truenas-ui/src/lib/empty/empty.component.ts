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
    '[class.tn-empty--bordered]': 'bordered()',
    'role': 'status',
  },
})
export class TnEmptyComponent {
  title = input.required<string>();
  description = input<string>();
  icon = input<string>();
  iconLibrary = input<IconLibraryType>('mdi');
  actionText = input<string>();
  bordered = input<boolean>(false);
  size = input<TnEmptySize>('compact');

  onAction = output<void>();

  protected hasAction = computed(() => !!this.actionText());

  iconSize = computed(() => {
    return this.size() === 'compact' ? 'lg' : 'xl';
  });
}
