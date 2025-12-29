import { Component, input, contentChildren, computed, effect, ChangeDetectorRef } from '@angular/core';
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
export class IxTableComponent {
  dataSource = input<IxTableDataSource | any[]>([]);
  displayedColumns = input<string[]>([]);

  columnDefs = contentChildren(IxTableColumnDirective);

  private columnDefMap = new Map<string, IxTableColumnDirective>();

  constructor(private cdr: ChangeDetectorRef) {
    // Effect to process column defs whenever they change
    effect(() => {
      const columns = this.columnDefs();
      this.processColumnDefs(columns);
    });
  }

  private processColumnDefs(columns: readonly IxTableColumnDirective[]): void {
    this.columnDefMap.clear();
    columns.forEach(columnDef => {
      const name = columnDef.name();
      if (name) {
        this.columnDefMap.set(name, columnDef);
      }
    });
    this.cdr.detectChanges();
  }

  data = computed(() => {
    const source = this.dataSource();
    if (Array.isArray(source)) {
      return source;
    }
    return source?.data || source?.connect?.() || [];
  });

  getColumnDef(columnName: string): IxTableColumnDirective | undefined {
    return this.columnDefMap.get(columnName);
  }

  trackByIndex(index: number): number {
    return index;
  }
}