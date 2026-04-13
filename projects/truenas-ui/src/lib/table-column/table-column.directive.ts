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
