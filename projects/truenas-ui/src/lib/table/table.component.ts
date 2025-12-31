import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, input, contentChildren, computed, effect, inject } from '@angular/core';
import { TnTableColumnDirective } from '../table-column/table-column.directive';

export interface TnTableDataSource<T = unknown> {
  data?: T[];
  connect?(): T[];
  disconnect?(): void;
}

@Component({
  selector: 'tn-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  host: {
    'class': 'tn-table'
  }
})
export class TnTableComponent<T = unknown> {
  dataSource = input<TnTableDataSource<T> | T[]>([]);
  displayedColumns = input<string[]>([]);

  columnDefs = contentChildren(TnTableColumnDirective);

  private columnDefMap = new Map<string, TnTableColumnDirective>();

  private cdr = inject(ChangeDetectorRef);

  constructor() {
    // Effect to process column defs whenever they change
    effect(() => {
      const columns = this.columnDefs();
      this.processColumnDefs(columns);
    });
  }

  private processColumnDefs(columns: readonly TnTableColumnDirective[]): void {
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

  getColumnDef(columnName: string): TnTableColumnDirective | undefined {
    return this.columnDefMap.get(columnName);
  }

  trackByIndex(index: number): number {
    return index;
  }

  getCellValue(row: T, column: string): unknown {
    return (row as Record<string, unknown>)[column];
  }
}