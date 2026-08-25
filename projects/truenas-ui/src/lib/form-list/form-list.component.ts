import {
  ChangeDetectionStrategy, Component, computed, contentChildren, forwardRef, input, output,
} from '@angular/core';
import type { AbstractControl } from '@angular/forms';
import { TN_FORM_LIST_CONTEXT } from './form-list-context';
import type { TnFormListContext } from './form-list-context';
import { TnFormListItemComponent } from './form-list-item.component';
import { TnButtonComponent } from '../button/button.component';
import { TnFormErrorsComponent } from '../form-errors/form-errors.component';
import type { TnFormFieldErrorMessages } from '../form-field/form-field.errors';
import { TnIconComponent } from '../icon/icon.component';
import { LabelMarkupPipe } from '../pipes/label-markup/label-markup.pipe';
import { TnTestIdDirective } from '../test-id';
import type { TnTestIdValue } from '../test-id';
import { plainTextMessage } from '../tooltip/interactive-content';
import { TnTooltipDirective } from '../tooltip/tooltip.directive';
import type { TooltipPosition } from '../tooltip/tooltip.directive';

let nextUniqueId = 0;

/**
 * The editor for a repeating group of fields — a `FormArray` the user grows
 * and shrinks, rendered as a labelled group of {@link TnFormListItemComponent}
 * cards with an Add control in the header.
 *
 * Not to be confused with `tn-list`, which DISPLAYS a list of items. This one
 * edits one, and owns none of the array: the consumer holds the `FormArray`,
 * renders an item per element, and does the pushing and splicing in response
 * to `(add)` and each item's `(delete)`. That keeps the item's shape — which
 * only the consumer knows — out of the library.
 *
 * @example
 * ```html
 * <tn-form-list label="ACL entries" [control]="form.controls.entries" (add)="addEntry()">
 *   @for (entry of form.controls.entries.controls; track entry; let i = $index) {
 *     <tn-form-list-item label="ACL entry" (delete)="removeEntry(i)">
 *       <!-- the entry's own fields -->
 *     </tn-form-list-item>
 *   }
 * </tn-form-list>
 * ```
 */
@Component({
  selector: 'tn-form-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TnButtonComponent,
    TnFormErrorsComponent,
    TnIconComponent,
    TnTooltipDirective,
    TnTestIdDirective,
    LabelMarkupPipe,
  ],
  providers: [
    // Published to the projected entries (their element injectors chain through
    // this host), so `disabled` reaches each remove button without the consumer
    // re-binding it inside its own @for. See TnFormListContext.
    {
      provide: TN_FORM_LIST_CONTEXT,
      useExisting: forwardRef(() => TnFormListComponent),
    },
  ],
  templateUrl: './form-list.component.html',
  styleUrls: ['./form-list.component.scss'],
})
export class TnFormListComponent implements TnFormListContext {
  /**
   * The `FormArray` being edited. Optional, and used only to render an error
   * that belongs to the array as a whole — a minimum or maximum length. The
   * component neither reads the elements nor writes to it.
   */
  control = input<AbstractControl | undefined>(undefined);

  /**
   * What the list is called, in the plural ('ACL entries'). Names the group,
   * so a screen reader announces which list a field is inside. Supports the
   * same lightweight markup as `tn-form-field` labels.
   */
  label = input<string>('');

  /** Optional help tooltip shown via an icon next to the label. */
  tooltip = input<string>('');

  /** Placement of the tooltip relative to its help icon. */
  tooltipPosition = input<TooltipPosition>('above');

  /** Marks the list as required — at least one entry. Renders the asterisk. */
  required = input<boolean>(false);

  /** Whether the Add control renders. Turn it off at a maximum length. */
  canAdd = input<boolean>(true);

  /**
   * Locks the list, for one the user may not edit yet: the group reports itself
   * `aria-disabled`, the entries are dimmed and stop taking pointer events, and
   * Add and every remove button are disabled.
   *
   * It does NOT disable the fields inside the entries — those are projected
   * content the consumer owns, so locking them is `entries.disable()` on the
   * `FormArray`, which is also what keeps their values out of `form.value`. This
   * input deliberately does not reach them by going `inert` instead: the entries
   * stay on screen, and `inert` would drop what a sighted user can still read out
   * of the accessibility tree entirely.
   */
  disabled = input<boolean>(false);

  /** Text of the Add control. English by default — pass a translated string. */
  addLabel = input<string>('Add');

  /** Shown in place of the entries while there are none. */
  emptyMessage = input<string>('No items have been added yet.');

  /**
   * Overrides the derived empty state. Set it to `false` while the entries are
   * still being fetched, so a list that is merely not loaded yet does not
   * announce itself as empty and then fill in.
   */
  empty = input<boolean | undefined>(undefined);

  /** Per-error overrides for the array-level message, as on `tn-form-field`. */
  errorMessages = input<TnFormFieldErrorMessages>({});

  /**
   * Show the array-level message before the user has touched the array — for a
   * list populated from an API, or one an error handler has just attached a
   * server-side failure to. Passed straight to `tn-form-errors`.
   */
  showErrorWhenUntouched = input<boolean>(false);

  /**
   * Error keys whose array-level message renders with a close button, and which
   * dismissing deletes. Unset takes the app-wide
   * `TN_FORM_FIELD_DISMISSIBLE_ERRORS` default; `[]` opts this list out. Passed
   * straight to `tn-form-errors`, which is where the reasoning lives.
   */
  dismissibleErrors = input<readonly string[] | undefined>(undefined);

  /** Accessible name for that close button. Pass it already translated. */
  dismissAriaLabel = input<string | undefined>(undefined);

  /** Hover hint for that close button. Defaults to `dismissAriaLabel`. */
  dismissTooltip = input<string | undefined>(undefined);

  /**
   * Test-id base for the group (`form-list-` prefixed). Also names the
   * array-level message, which gets it `error-` prefixed.
   */
  testId = input<TnTestIdValue>(undefined);

  /** Emitted when Add is pressed. Appending the element is the consumer's. */
  add = output<void>();

  /**
   * Emitted with the error key when the user closes the array-level message,
   * after it has been removed. `tn-form-errors` has no control to hand focus
   * back to, so a consumer who cares where focus lands moves it here.
   */
  dismiss = output<string>();

  /**
   * The projected entries. Counted rather than derived from the `FormArray`,
   * so the empty state follows what is actually on screen — a consumer may
   * filter or page the elements it renders, and `control` is optional anyway.
   */
  private items = contentChildren(TnFormListItemComponent);

  protected isEmpty = computed(() => this.empty() ?? this.items().length === 0);

  /**
   * Accessible name for the Add control, which reads as a bare 'Add' beside
   * every other list on a long form. Names the list it adds to.
   */
  protected addAriaLabel = computed(() => {
    const label = plainTextMessage(this.label()).trim();
    return label ? `${this.addLabel()} ${label}` : this.addLabel();
  });

  protected tooltipAriaLabel = computed(() => plainTextMessage(this.tooltip()));

  /**
   * Stable id naming the group from the label text alone. Without it the
   * group's accessible name would also absorb the tooltip button and the Add
   * control, announcing both on every field inside the list.
   */
  protected readonly labelId = `tn-form-list-${nextUniqueId++}`;
}
