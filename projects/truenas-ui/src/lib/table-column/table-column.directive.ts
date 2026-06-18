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
  priority = input<number>(0);

  /**
   * Marks this column as the card's title in card mode — rendered prominently
   * in the card header alongside any row actions, never as a label/value field.
   * If no column sets this, the first displayed column is used as the title.
   */
  cardTitle = input<boolean>(false);

  /**
   * When true, this column is omitted entirely from the card layout (e.g. a
   * redundant id, or a column whose meaning is already conveyed by the title).
   * Ignored in the regular table layout.
   */
  cardHidden = input<boolean>(false);

  /**
   * Overrides the field label shown for this column in card mode. Defaults to
   * the column's header text (or the column name when no header template is
   * provided).
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
 * Place inside `tn-table` to render a trailing, sticky-right actions column in
 * the regular table layout. In card mode (see `mobileLayout` on `tn-table`) the
 * same template is rendered inline beside the card title, so row actions stay
 * reachable at every viewport width. The template receives the row as its
 * implicit context.
 *
 * @example
 * ```html
 * <tn-table [dataSource]="data" [displayedColumns]="columns">
 *   ...column defs...
 *   <ng-template tnRowActionsDef let-row>
 *     <tn-icon-button icon="edit" (click)="edit(row)" />
 *     <tn-icon-button icon="delete" (click)="remove(row)" />
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
