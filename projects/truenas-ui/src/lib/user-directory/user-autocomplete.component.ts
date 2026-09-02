import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { TnDirectoryAutocompleteBase } from './directory-field.base';
import { TnAutocompleteComponent } from '../autocomplete/autocomplete.component';

/**
 * Single-user selection, searched against the app's {@link TnUserDirectory}.
 *
 * Everything a user field needs is here: the server-side search with its
 * debounce and paging, the "does this name exist" validation for a typed value,
 * and — with `allowCreate` — a row that opens the app's create-user flow and
 * selects whoever comes back. Drop it into a `tn-form-field` and bind a control.
 *
 * @example
 * ```html
 * <tn-form-field [label]="'Owner' | translate">
 *   <tn-user-autocomplete formControlName="owner" />
 * </tn-form-field>
 * ```
 *
 * @example Restricted to privileged users, with a create row
 * ```html
 * <tn-user-autocomplete
 *   formControlName="username"
 *   [requireSelection]="true"
 *   [allowCustomValue]="false"
 *   [allowCreate]="true"
 *   [directoryOptions]="{ withRoles: true }" />
 * ```
 */
@Component({
  selector: 'tn-user-autocomplete',
  standalone: true,
  imports: [TnAutocompleteComponent],
  templateUrl: './directory-autocomplete.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TnUserAutocompleteComponent extends TnDirectoryAutocompleteBase {
  /**
   * Declared here rather than on the shared base: a view query on an
   * abstract `@Directive()` never resolves, so the base takes it as an
   * abstract member instead.
   */
  protected readonly innerControl = viewChild(TnAutocompleteComponent);

  protected readonly kind = 'user' as const;

  /** Only the user field can create — there is no create-group flow. */
  protected override readonly supportsCreate = true;
}
