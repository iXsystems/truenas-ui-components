import { Directive, TemplateRef, input, contentChild, inject } from '@angular/core';

@Directive({
  selector: '[ixHeaderCellDef]',
  standalone: true
})
export class TnHeaderCellDefDirective {
  template = inject(TemplateRef<unknown>);
}

@Directive({
  selector: '[ixCellDef]',
  standalone: true
})
export class TnCellDefDirective {
  template = inject(TemplateRef<unknown>);
}

@Directive({
  selector: '[ixColumnDef]',
  standalone: true,
  exportAs: 'ixColumnDef'
})
export class TnTableColumnDirective {
  name = input.required<string>({ alias: 'ixColumnDef' });

  headerTemplate = contentChild(TnHeaderCellDefDirective, { read: TemplateRef });

  cellTemplate = contentChild(TnCellDefDirective, { read: TemplateRef });
}