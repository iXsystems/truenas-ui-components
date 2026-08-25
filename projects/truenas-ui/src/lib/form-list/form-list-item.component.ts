import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { TN_FORM_LIST_CONTEXT } from './form-list-context';
import { TnIconButtonComponent } from '../icon-button/icon-button.component';
import { TnTestIdDirective } from '../test-id';
import type { TnTestIdValue } from '../test-id';

/**
 * One entry of a {@link TnFormListComponent} — a bordered card holding the
 * controls for a single element of the form array, with the control that
 * removes it.
 *
 * The item owns only the frame and the remove button; the controls inside are
 * the consumer's, bound to that element's `FormGroup`.
 */
@Component({
  selector: 'tn-form-list-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TnIconButtonComponent, TnTestIdDirective],
  templateUrl: './form-list-item.component.html',
  styleUrls: ['./form-list-item.component.scss'],
})
export class TnFormListItemComponent {
  /**
   * Whether this entry can be removed. Turn it off for an entry the form
   * requires — the button disappears rather than being disabled, since a
   * permanently disabled control tells the user nothing about why.
   */
  canDelete = input<boolean>(true);

  /**
   * What one entry is called, in the singular ('ACL entry', 'Portal'). Used to
   * name the remove button, which is icon-only and has nothing else to be
   * named by. Pass it already translated.
   */
  label = input<string>('');

  /**
   * Accessible name for the remove button. Defaults to `Remove <label>`, or
   * plain `Remove` when there is no label. Set it to translate the wording —
   * the library ships English only.
   */
  removeAriaLabel = input<string>('');

  /**
   * Disables the remove button — the entry stays readable, the control just
   * stops working, the way a native disabled control does.
   *
   * Left unset it follows the enclosing `tn-form-list`'s own `disabled`, so
   * locking a list is one binding on the list rather than one per entry. Set it
   * explicitly to lock a single entry inside an otherwise editable list.
   */
  disabled = input<boolean | undefined>(undefined);

  /** Test-id base for the remove button (`icon-button-` prefixed). */
  testId = input<TnTestIdValue>(undefined);

  /** Emitted when the remove button is pressed. Removing is the consumer's. */
  delete = output<void>();

  /** Absent when the entry is used outside a `tn-form-list`. */
  private list = inject(TN_FORM_LIST_CONTEXT, { optional: true });

  protected resolvedDisabled = computed(
    () => this.disabled() ?? this.list?.disabled() ?? false,
  );

  protected resolvedRemoveAriaLabel = computed(() => {
    const explicit = this.removeAriaLabel().trim();
    if (explicit) {
      return explicit;
    }
    const label = this.label().trim();
    return label ? `Remove ${label}` : 'Remove';
  });

  protected resolvedTestId = computed(() => this.testId() ?? ['remove-from-list', this.label()]);
}
