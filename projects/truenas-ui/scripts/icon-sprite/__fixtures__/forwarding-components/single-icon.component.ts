import { Component, input } from '@angular/core';
import type { TnIconForwardingComponent } from '../icon/icon-forwarding';
import type { IconLibraryType } from '../icon/icon.component';

@Component({
  selector: 'tn-empty',
  standalone: true,
  templateUrl: './single-icon.component.html',
})
export class TnEmptyComponent implements TnIconForwardingComponent {
  icon = input<string>();
  iconLibrary = input<IconLibraryType>('mdi');
}
