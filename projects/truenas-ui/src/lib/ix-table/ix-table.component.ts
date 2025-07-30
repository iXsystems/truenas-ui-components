import { Component, Input, ContentChildren, QueryList, AfterContentInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IxTableColumnDirective } from '../ix-table-column/ix-table-column.directive';

export interface IxTableDataSource<T = any> {
  data: T[];
  connect?(): T[];
  disconnect?(): void;
}

@Component({
  selector: 'ix-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ix-table.component.html',
  styleUrl: './ix-table.component.scss',
  host: {
    'class': 'ix-table'
  }
})
export class IxTableComponent implements AfterContentInit {
  @Input() dataSource: IxTableDataSource | any[] = [];
  @Input() displayedColumns: string[] = [];

  @ContentChildren(IxTableColumnDirective) columnDefs!: QueryList<IxTableColumnDirective>;

  private columnDefMap = new Map<string, IxTableColumnDirective>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterContentInit(): void {
    this.processColumnDefs();
    this.columnDefs.changes.subscribe(() => {
      this.processColumnDefs();
    });
  }

  private processColumnDefs(): void {
    this.columnDefMap.clear();
    this.columnDefs.forEach(columnDef => {
      if (columnDef.name) {
        this.columnDefMap.set(columnDef.name, columnDef);
      }
    });
    this.cdr.detectChanges();
  }

  get data(): any[] {
    if (Array.isArray(this.dataSource)) {
      return this.dataSource;
    }
    return this.dataSource?.data || this.dataSource?.connect?.() || [];
  }

  getColumnDef(columnName: string): IxTableColumnDirective | undefined {
    return this.columnDefMap.get(columnName);
  }

  trackByIndex(index: number): number {
    return index;
  }
}