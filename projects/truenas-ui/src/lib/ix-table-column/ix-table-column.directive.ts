import { Directive, Input, TemplateRef, ContentChild } from '@angular/core';

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
  @Input('ixColumnDef') name!: string;

  @ContentChild(IxHeaderCellDefDirective, { read: TemplateRef })
  headerTemplate?: TemplateRef<any>;

  @ContentChild(IxCellDefDirective, { read: TemplateRef })
  cellTemplate?: TemplateRef<any>;
}