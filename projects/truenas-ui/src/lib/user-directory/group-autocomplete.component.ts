import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { TnDirectoryAutocompleteBase } from './directory-field.base';
import { TnAutocompleteComponent } from '../autocomplete/autocomplete.component';

/**
 * Single-group selection, searched against the app's {@link TnUserDirectory}.
 * The group-side twin of `tn-user-autocomplete`, minus the create row.
 *
 * @example
 * ```html
 * <tn-form-field [label]="'Group' | translate">
 *   <tn-group-autocomplete formControlName="group" [directoryOptions]="{ localOnly: true }" />
 * </tn-form-field>
 * ```
 */
@Component({
  selector: 'tn-group-autocomplete',
  standalone: true,
  imports: [TnAutocompleteComponent],
  templateUrl: './directory-autocomplete.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TnGroupAutocompleteComponent extends TnDirectoryAutocompleteBase {
  /**
   * Declared here rather than on the shared base: a view query on an
   * abstract `@Directive()` never resolves, so the base takes it as an
   * abstract member instead.
   */
  protected readonly innerControl = viewChild(TnAutocompleteComponent);

  protected readonly kind = 'group' as const;
}
