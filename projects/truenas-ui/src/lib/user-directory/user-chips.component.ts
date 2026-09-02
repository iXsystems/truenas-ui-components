import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { TnDirectoryChipsBase } from './directory-field.base';
import { TnChipInputComponent } from '../chip-input/chip-input.component';

/**
 * Multi-user selection as chips, searched against the app's
 * {@link TnUserDirectory}. Every typed name is checked for existence, and the
 * ones that do not resolve are named in a single validation message.
 *
 * @example
 * ```html
 * <tn-form-field [label]="'Users' | translate">
 *   <tn-user-chips formControlName="users" />
 * </tn-form-field>
 * ```
 */
@Component({
  selector: 'tn-user-chips',
  standalone: true,
  imports: [TnChipInputComponent],
  templateUrl: './directory-chips.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TnUserChipsComponent extends TnDirectoryChipsBase {
  /**
   * Declared here rather than on the shared base: a view query on an
   * abstract `@Directive()` never resolves, so the base takes it as an
   * abstract member instead.
   */
  protected readonly innerControl = viewChild(TnChipInputComponent);

  protected readonly kind = 'user' as const;
}
