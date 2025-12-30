import { Directive, TemplateRef, input, contentChild, inject } from '@angular/core';

@Directive({
  selector: '[ixHeaderCellDef]',
  standalone: true
})
export class IxHeaderCellDefDirective {
  template = inject(TemplateRef<unknown>);
}

@Directive({
  selector: '[ixCellDef]',
  standalone: true
})
export class IxCellDefDirective {
  template = inject(TemplateRef<unknown>);
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