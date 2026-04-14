import { Component, input } from '@angular/core';
import type { TnIconForwardingComponent } from '../icon/icon-forwarding';

@Component({
  selector: 'tn-chip',
  standalone: true,
  templateUrl: './no-library.component.html',
})
export class TnChipComponent implements TnIconForwardingComponent {
  icon = input<string | undefined>(undefined);
}
