import { Component, input } from '@angular/core';
import type { TnIconForwardingComponent } from '../icon/icon-forwarding';
import type { IconLibraryType } from '../icon/icon.component';

@Component({
  selector: 'tn-input',
  standalone: true,
  templateUrl: './multi-icon.component.html',
})
export class TnInputComponent implements TnIconForwardingComponent, AfterViewInit {
  prefixIcon = input<string | undefined>(undefined);
  prefixIconLibrary = input<IconLibraryType | undefined>(undefined);
  suffixIcon = input<string | undefined>(undefined);
  suffixIconLibrary = input<IconLibraryType | undefined>(undefined);
}
