import { ChangeDetectionStrategy, Component, computed, signal, ViewEncapsulation } from '@angular/core';
import { TnToastPosition, TnToastType } from './toast.types';
import { tnIconMarker } from '../icon/icon-marker';
import { TnIconComponent } from '../icon/icon.component';
import { TnTestIdDirective } from '../test-id';

// The sprite generator only sees icon names in templates and in `tnIconMarker()` calls.
// These live in a map, so without the marker they'd be dropped from the sprite on the
// next regeneration — and there is no `material-icons` font in this library to fall
// back to, so the toast would render an empty icon.
const TOAST_ICONS = {
  [TnToastType.Info]: tnIconMarker('info', 'material'),
  [TnToastType.Success]: tnIconMarker('check_circle', 'material'),
  [TnToastType.Warning]: tnIconMarker('warning', 'material'),
  [TnToastType.Error]: tnIconMarker('error', 'material'),
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

  /**
   * The live-region role, which is also the only thing declaring how urgently the
   * toast is announced: `alert` implies `aria-live="assertive"` and `status`
   * implies `polite`.
   *
   * The template carried `role="alert"` and `aria-live="polite"` together (#190).
   * An explicit `aria-live` overrides the role's implicit one, so every toast was
   * announced politely — including `error`, the one type that needs to interrupt.
   * Deriving the role from the type and leaving `aria-live` off keeps a single
   * source: there is no second attribute left to disagree with this one.
   */
  role = computed(() => (this.type() === TnToastType.Error ? 'alert' : 'status'));

  onAction: () => void = () => {};
  onDismiss: () => void = () => {};
}
