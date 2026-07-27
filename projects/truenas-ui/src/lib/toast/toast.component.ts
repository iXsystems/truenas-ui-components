import { ChangeDetectionStrategy, Component, computed, signal, ViewEncapsulation } from '@angular/core';
import { TnToastPosition, TnToastType } from './toast.types';
import { TnIconComponent } from '../icon/icon.component';
import { TnTestIdDirective } from '../test-id';

// Material icons render via the `material-icons` CSS font (see icon.component.ts),
// so they don't need sprite scanning — the literal `mat-` prefix matches what
// the runtime icon resolver would produce from a Material library name.
const TOAST_ICONS = {
  [TnToastType.Info]: 'mat-info',
  [TnToastType.Success]: 'mat-check_circle',
  [TnToastType.Warning]: 'mat-warning',
  [TnToastType.Error]: 'mat-error',
};

@Component({
  selector: 'tn-toast',
  standalone: true,
  imports: [TnIconComponent, TnTestIdDirective],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.tn-toast--top]': 'position() === "top"',
    '[class.tn-toast--bottom]': 'position() === "bottom"',
  },
})
export class TnToastComponent {
  message = signal('');
  action = signal<string | null>(null);
  actionTestId = signal<string | undefined>(undefined);
  type = signal<TnToastType>(TnToastType.Info);
  position = signal<TnToastPosition>(TnToastPosition.Top);
  visible = signal(false);

  icon = computed(() => TOAST_ICONS[this.type()]);

  onAction: () => void = () => {};
  onDismiss: () => void = () => {};
}
