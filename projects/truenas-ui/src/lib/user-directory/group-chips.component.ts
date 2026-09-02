import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { TnDirectoryChipsBase } from './directory-field.base';
import { TnChipInputComponent } from '../chip-input/chip-input.component';

/**
 * Multi-group selection as chips, searched against the app's
 * {@link TnUserDirectory}. The group-side twin of `tn-user-chips`.
 *
 * @example
 * ```html
 * <tn-form-field [label]="'Groups' | translate">
 *   <tn-group-chips formControlName="groups" />
 * </tn-form-field>
 * ```
 */
@Component({
  selector: 'tn-group-chips',
  standalone: true,
  imports: [TnChipInputComponent],
  templateUrl: './directory-chips.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TnGroupChipsComponent extends TnDirectoryChipsBase {
  /**
   * Declared here rather than on the shared base: a view query on an
   * abstract `@Directive()` never resolves, so the base takes it as an
   * abstract member instead.
   */
  protected readonly innerControl = viewChild(TnChipInputComponent);

  protected readonly kind = 'group' as const;
}
