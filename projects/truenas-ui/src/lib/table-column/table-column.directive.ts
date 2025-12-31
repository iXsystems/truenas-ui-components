import { Directive, TemplateRef, input, contentChild, inject } from '@angular/core';

@Directive({
  selector: '[tnHeaderCellDef]',
  standalone: true
})
export class TnHeaderCellDefDirective {
  template = inject(TemplateRef<unknown>);
}

@Directive({
  selector: '[tnCellDef]',
  standalone: true
})
export class TnCellDefDirective {
  template = inject(TemplateRef<unknown>);
}

@Directive({
  selector: '[tnColumnDef]',
  standalone: true,
  exportAs: 'tnColumnDef'
})
export class TnTableColumnDirective {
  name = input.required<string>({ alias: 'tnColumnDef' });

  headerTemplate = contentChild(TnHeaderCellDefDirective, { read: TemplateRef });

  cellTemplate = contentChild(TnCellDefDirective, { read: TemplateRef });
}