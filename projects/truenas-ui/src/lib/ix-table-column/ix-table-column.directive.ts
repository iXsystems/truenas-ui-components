import { Directive, TemplateRef, input, contentChild } from '@angular/core';

@Directive({
  selector: '[ixHeaderCellDef]',
  standalone: true
})
export class IxHeaderCellDefDirective {
  constructor(public template: TemplateRef<any>) {}
}

@Directive({
  selector: '[ixCellDef]',
  standalone: true
})
export class IxCellDefDirective {
  constructor(public template: TemplateRef<any>) {}
}

@Directive({
  selector: '[ixColumnDef]',
  standalone: true,
  exportAs: 'ixColumnDef'
})
export class IxTableColumnDirective {
  name = input.required<string>({ alias: 'ixColumnDef' });

  headerTemplate = contentChild(IxHeaderCellDefDirective, { read: TemplateRef });

  cellTemplate = contentChild(IxCellDefDirective, { read: TemplateRef });
}