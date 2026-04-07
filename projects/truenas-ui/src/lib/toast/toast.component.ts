import { ChangeDetectionStrategy, Component, computed, signal, ViewEncapsulation } from '@angular/core';
import { TnToastPosition, TnToastType } from './toast.types';
import { tnIconMarker } from '../icon/icon-marker';
import { TnIconComponent } from '../icon/icon.component';

// Mark icons for sprite inclusion (dynamic names aren't detected by the scanner)
const TOAST_ICONS = {
  [TnToastType.Info]: tnIconMarker('info', 'material'),
  [TnToastType.Success]: tnIconMarker('check_circle', 'material'),
  [TnToastType.Warning]: tnIconMarker('warning', 'material'),
  [TnToastType.Error]: tnIconMarker('error', 'material'),
};

@Component({
  selector: 'tn-toast',
  standalone: true,
  imports: [TnIconComponent],
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
  type = signal<TnToastType>(TnToastType.Info);
  position = signal<TnToastPosition>(TnToastPosition.Bottom);
  visible = signal(false);

  icon = computed(() => TOAST_ICONS[this.type()]);

  onAction: () => void = () => {};
  onDismiss: () => void = () => {};
}
