import { Directive, TemplateRef, input, contentChild, inject } from '@angular/core';

@Directive({
  selector: '[tnHeaderCellDef]',
  standalone: true,
})
export class TnHeaderCellDefDirective {
  template = inject(TemplateRef<unknown>);
}

@Directive({
  selector: '[tnCellDef]',
  standalone: true,
})
export class TnCellDefDirective {
  template = inject(TemplateRef<unknown>);
}

@Directive({
  selector: '[tnColumnDef]',
  standalone: true,
  exportAs: 'tnColumnDef',
})
export class TnTableColumnDirective {
  name = input.required<string>({ alias: 'tnColumnDef' });
  sortable = input<boolean>(false);
  width = input<string | undefined>(undefined);

  /**
   * Human-readable label for the column. Used as the default header text in the
   * regular table layout AND the default field label in card mode, so a single
   * annotation serves both — prefer this over a text-only `tnHeaderCellDef`.
   * A `tnHeaderCellDef` template still overrides the header; `cardLabel` still
   * overrides the card field label. Falls back to the column `name` when unset.
   */
  label = input<string | undefined>(undefined);

  /**
   * Relative importance of this column in card mode (see `mobileLayout` on
   * `tn-table`). Higher numbers render first; fields ranked beyond
   * `cardPrimaryCount` fold under a "More fields" disclosure. Defaults to `0`,
   * in which case columns fall back to their `displayedColumns` order. Has no
   * effect in the regular (wide) table layout.
   */
  cardPriority = input<number>(0);

  /**
   * Marks this column as the card's title in card mode — rendered prominently
   * in the card header alongside any row actions, never as a label/value field.
   * If no column sets this, the first displayed column that isn't `cardHidden` is
   * used, falling back to the first displayed column when every column is hidden —
   * a column deliberately kept off the card is not promoted to its most prominent
   * slot.
   */
  cardTitle = input<boolean>(false);

  /**
   * When true, this column is omitted entirely from the card layout (e.g. a
   * redundant id, or a column whose meaning is already conveyed by the title).
   * Ignored in the regular table layout.
   */
  cardHidden = input<boolean>(false);

  /**
   * Overrides the field label shown for this column in card mode. Defaults to the
   * column's `label`, then to the column name.
   *
   * A `tnHeaderCellDef` template is NOT used here — it is an `ng-template`, not
   * text, so there is nothing to read out. A column whose header comes only from
   * that template renders its bare column name as the card field label; set
   * `label` (or `cardLabel`) to give the card something readable.
   */
  cardLabel = input<string | undefined>(undefined);

  headerTemplate = contentChild(TnHeaderCellDefDirective, {
    read: TemplateRef,
  });
  cellTemplate = contentChild(TnCellDefDirective, { read: TemplateRef });
}

/**
 * Directive to define the expandable detail row template.
 * Place inside `tn-table` to provide expanded content for each row.
 *
 * @example
 * ```html
 * <tn-table [dataSource]="data" [displayedColumns]="columns" [expandable]="true">
 *   ...column defs...
 *   <ng-template tnDetailRowDef let-row>
 *     <p>Details for {{ row.name }}</p>
 *   </ng-template>
 * </tn-table>
 * ```
 */
@Directive({
  selector: '[tnDetailRowDef]',
  standalone: true,
})
export class TnDetailRowDefDirective {
  template = inject(TemplateRef<unknown>);
}

/**
 * Directive to define a row's action controls (e.g. edit/delete buttons).
 *
 * Place inside `tn-table` to render a trailing actions column, pinned to the right edge
 * in `scroll` mode (see `mobileLayout` on `tn-table`) and scrolling with the rest of the
 * table above `cardBreakpoint`. In card mode the same template is rendered inline beside
 * the card title, so row actions stay reachable at every viewport width. The template
 * receives the row as its implicit context.
 *
 * @example
 * ```html
 * <tn-table [dataSource]="data" [displayedColumns]="columns">
 *   ...column defs...
 *   <ng-template tnRowActionsDef let-row>
 *     <tn-icon-button [name]="editIcon" ariaLabel="Edit" (click)="edit(row)" />
 *     <tn-icon-button [name]="deleteIcon" ariaLabel="Delete" (click)="remove(row)" />
 *   </ng-template>
 * </tn-table>
 * ```
 */
@Directive({
  selector: '[tnRowActionsDef]',
  standalone: true,
})
export class TnRowActionsDefDirective {
  template = inject(TemplateRef<unknown>);
}
