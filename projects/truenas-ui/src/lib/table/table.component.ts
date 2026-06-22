import { animate, state, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  contentChild,
  contentChildren,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import type { OnInit } from '@angular/core';
import { TnCheckboxComponent } from '../checkbox/checkbox.component';
import { TnEmptyComponent } from '../empty/empty.component';
import { TnIconComponent } from '../icon/icon.component';
import { TnSpinnerComponent } from '../spinner/spinner.component';
import {
  TnDetailRowDefDirective,
  TnTableColumnDirective,
} from '../table-column/table-column.directive';
import { TnTestIdDirective } from '../test-id';

// Material icons render via the `material-icons` CSS font (see icon.component.ts),
// so they don't need sprite scanning — the literal `mat-` prefix matches what
// the runtime icon resolver would produce from a Material library name.
const SORT_ICON_ASC = 'mat-arrow_upward';
const SORT_ICON_DESC = 'mat-arrow_downward';
const SORT_ICON_NONE = 'mat-unfold_more';
const EXPAND_ICON_DOWN = 'mat-keyboard_arrow_down';
const EXPAND_ICON_UP = 'mat-keyboard_arrow_up';

export interface TnTableDataSource<T = unknown> {
  data?: T[];
  connect?(): T[];
  disconnect?(): void;
}

export interface TnSortEvent {
  column: string;
  direction: 'asc' | 'desc' | '';
}

/**
 * Animation duration for detail row expand/collapse.
 *
 * Evaluated once when the `@Component` decorator runs (at module load), so the
 * value is frozen for the lifetime of the app: if the user toggles their OS
 * "reduce motion" preference at runtime, this duration will NOT update for
 * already-loaded components. Angular animations don't expose a per-trigger
 * dynamic duration, so live updates would require switching from
 * `@detailExpand` to plain CSS transitions (already used elsewhere in the SCSS,
 * which respects the live preference via `@media (prefers-reduced-motion)`).
 * Acceptable tradeoff: the OS preference rarely flips mid-session, and the
 * surrounding CSS transitions continue to react live.
 */
function getExpandDuration(): string {
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    return '0ms';
  }
  return '225ms cubic-bezier(0.4, 0.0, 0.2, 1)';
}

@Component({
  selector: 'tn-table',
  standalone: true,
  imports: [CommonModule, TnCheckboxComponent, TnEmptyComponent, TnIconComponent, TnSpinnerComponent],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0', overflow: 'hidden' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate(getExpandDuration())),
    ]),
  ],
  hostDirectives: [{ directive: TnTestIdDirective, inputs: ['tnTestId: testId'] }],
  host: {
    class: 'tn-table',
    '[class.tn-table--bordered]': 'bordered()',
    '[class.tn-table--loading]': 'loading()',
    '[style.--tn-table-active-bg]': 'activeBg()',
    '[style.--tn-table-active-indicator]': 'activeIndicator()',
  },
})
export class TnTableComponent<T = unknown> implements OnInit {
  private destroyRef = inject(DestroyRef);

  // --- Core inputs ---
  dataSource = input<TnTableDataSource<T> | T[]>([]);
  displayedColumns = input<string[]>([]);
  trackBy = input<((index: number, item: T) => unknown) | undefined>(undefined);

  emptyMessage = input<string>('No data available');
  emptyIcon = input<string>('');

  // --- Feature inputs (all opt-in) ---
  selectable = input<boolean>(false);
  expandable = input<boolean>(false);
  bordered = input<boolean>(false);

  /**
   * Optional per-row predicate deciding whether an individual row can expand.
   * When omitted, every row is expandable (provided `expandable` is true and a
   * `tnDetailRowDef` is present). Rows for which it returns `false` render no
   * expand control and cannot be toggled by the chevron, a row click, or the
   * keyboard, and never render a detail row. Has no effect unless `expandable`
   * is true. Re-evaluated on each change detection, so it may depend on signals.
   */
  isRowExpandable = input<((row: T) => boolean) | undefined>(undefined);

  /**
   * Marks a single row as "active" — adds the `tn-table__row--active` class
   * and a left-side indicator bar. Set to `null` (default) to clear.
   *
   * **Matched by object identity (`===`)** against the row references in
   * `dataSource`. Pass the exact reference you got from the data source (e.g.
   * via the `rowClick` event or a lookup into `dataSource()`), not a
   * structurally-equal copy — `{ id: 1 } !== { id: 1 }` and the row will not
   * highlight. This differs from `tn-select`, which supports a `compareWith`
   * input for object values; the table intentionally does not, because the
   * common use case (clicking a row to mark it active) already gives the
   * caller the original reference. If you need structural equality, look up
   * the row by id in your data source before assigning here.
   */
  activeRow = input<T | null>(null);

  /**
   * Overrides the active-row background color. Accepts any CSS color value
   * (`#hex`, `rgb()`, `var(--token)`). Defaults to `--tn-bg3` when null.
   */
  activeBg = input<string | null>(null);

  /**
   * Overrides the left-side active-row indicator color. Defaults to
   * `--tn-primary` when null.
   */
  activeIndicator = input<string | null>(null);

  /**
   * When true, shows a spinner overlay over the table. Existing rows remain
   * visible (dimmed) so reloads don't cause layout jumps; if there are no rows
   * yet, the spinner replaces the empty state.
   */
  loading = input<boolean>(false);

  /** Accessible label announced while loading. */
  loadingMessage = input<string>('Loading...');

  /**
   * When true, rows become keyboard-focusable (tabindex=0) and clicking or
   * pressing Enter/Space emits `rowClick`. Use this for "click row to view
   * details" patterns. Independent of `selectable` (checkbox) and `expandable`.
   */
  clickable = input<boolean>(false);

  // --- Outputs ---
  sortChange = output<TnSortEvent>();
  selectionChange = output<T[]>();

  /** Emits the row when a clickable row is activated (click or Enter/Space). */
  rowClick = output<T>();

  // --- Content queries ---
  columnDefs = contentChildren(TnTableColumnDirective);
  detailRowDef = contentChild(TnDetailRowDefDirective);

  // --- Sort state ---
  sortColumn = signal<string>('');
  sortDirection = signal<'asc' | 'desc' | ''>('');

  /**
   * Set of currently expanded row references.
   * Note: uses object identity. If the consumer replaces the data array
   * (e.g. after sorting), expanded state is lost. A future key-based
   * approach could address this.
   */
  expandedRows = signal<Set<unknown>>(new Set());

  // --- Selection state ---
  selection = new SelectionModel<T>(true, []);
  private selectionCount = signal(0);
  private initialized = false;

  // Column def map as a computed signal
  private columnDefMap = computed(() => {
    const map = new Map<string, TnTableColumnDirective>();
    for (const colDef of this.columnDefs()) {
      const name = colDef.name();
      if (name) {
        map.set(name, colDef);
      }
    }
    return map;
  });

  constructor() {
    // Clear selection and expansion when data reference changes
    effect(() => {
      this.data();
      if (this.initialized) {
        this.selection.clear();
        this.selectionCount.set(0);
        this.expandedRows.set(new Set());
        this.selectionChange.emit([]);
      }
    });

    // Clear expanded rows when expandable is toggled off
    effect(() => {
      if (!this.expandable()) {
        this.expandedRows.set(new Set());
      }
    });
  }

  ngOnInit(): void {
    this.initialized = true;

    // Clean up SelectionModel on destroy
    this.destroyRef.onDestroy(() => {
      this.selection.clear();
    });
  }

  // --- Computed ---

  data = computed(() => {
    const source = this.dataSource();
    if (Array.isArray(source)) {
      return source;
    }
    return source?.data ?? source?.connect?.() ?? [];
  });

  effectiveDisplayedColumns = computed(() => {
    const cols = [...this.displayedColumns()];
    if (this.selectable()) {
      cols.unshift('__select');
    }
    if (this.expandable() && this.detailRowDef()) {
      cols.push('__expand');
    }
    return cols;
  });

  isAllSelected = computed(() => {
    const numSelected = this.selectionCount();
    const numRows = this.data().length;
    return numRows > 0 && numSelected === numRows;
  });

  isIndeterminate = computed(() => {
    const count = this.selectionCount();
    return count > 0 && !this.isAllSelected();
  });

  trackByFn = computed(() => {
    const custom = this.trackBy();
    if (custom) { return custom; }
    return (index: number) => index;
  });

  // --- Sort methods ---

  onSortClick(column: string): void {
    const colDef = this.getColumnDef(column);
    if (!colDef?.sortable()) { return; }

    if (this.sortColumn() === column) {
      const current = this.sortDirection();
      if (current === 'asc') {
        this.sortDirection.set('desc');
      } else if (current === 'desc') {
        this.sortDirection.set('');
        this.sortColumn.set('');
      }
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }

    this.sortChange.emit({
      column: this.sortColumn() || column,
      direction: this.sortDirection(),
    });
  }

  getSortIcon(column: string): string {
    if (this.sortColumn() !== column || this.sortDirection() === '') {
      return SORT_ICON_NONE;
    }
    return this.sortDirection() === 'asc' ? SORT_ICON_ASC : SORT_ICON_DESC;
  }

  getExpandIcon(row: T): string {
    return this.isRowExpanded(row) ? EXPAND_ICON_UP : EXPAND_ICON_DOWN;
  }

  isSorted(column: string): boolean {
    return this.sortColumn() === column && this.sortDirection() !== '';
  }

  // --- Expansion methods ---

  /**
   * Whether a specific row may currently be expanded. True when `expandable` is
   * set and — when an `isRowExpandable` predicate is provided — that predicate
   * returns true for the row. Drives the expand control's visibility and gates
   * every expansion entry point (chevron, row click, keyboard). The `__expand`
   * column and the detail row are additionally gated on `detailRowDef()`.
   */
  canExpandRow(row: T): boolean {
    if (!this.expandable()) { return false; }
    const predicate = this.isRowExpandable();
    return predicate ? predicate(row) : true;
  }

  toggleRowExpansion(row: T): void {
    if (!this.canExpandRow(row)) { return; }
    const expanded = new Set(this.expandedRows());
    if (expanded.has(row)) {
      expanded.delete(row);
    } else {
      expanded.add(row);
    }
    this.expandedRows.set(expanded);
  }

  isRowExpanded(row: T): boolean {
    return this.expandedRows().has(row);
  }

  // --- Active row ---

  isRowActive(row: T): boolean {
    const active = this.activeRow();
    return active !== null && active === row;
  }

  // --- Row click ---

  onRowClick(row: T): void {
    if (!this.clickable()) { return; }
    this.rowClick.emit(row);
  }

  onRowKeydown(event: KeyboardEvent, row: T): void {
    if (!this.clickable()) { return; }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.rowClick.emit(row);
    }
  }

  // --- Selection methods ---

  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.selection.select(...this.data());
    }
    this.selectionCount.set(this.selection.selected.length);
    this.selectionChange.emit(this.selection.selected);
  }

  toggleRowSelection(row: T): void {
    this.selection.toggle(row);
    this.selectionCount.set(this.selection.selected.length);
    this.selectionChange.emit(this.selection.selected);
  }

  isRowSelected(row: T): boolean {
    return this.selection.isSelected(row);
  }

  // --- Column helpers ---

  getColumnDef(columnName: string): TnTableColumnDirective | undefined {
    return this.columnDefMap().get(columnName);
  }

  getCellValue(row: T, column: string): unknown {
    return (row as Record<string, unknown>)[column];
  }
}
