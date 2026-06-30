import { animate, state, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  contentChild,
  contentChildren,
  DestroyRef,
  effect,
  ElementRef,
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
  TnRowActionsDefDirective,
  TnTableColumnDirective,
} from '../table-column/table-column.directive';
import { TnTestIdDirective } from '../test-id';

// NOTE: the sort/expand icon names (mat-arrow_upward, mat-keyboard_arrow_down,
// etc.) are written as string literals directly in the template's `[name]`
// ternaries, NOT computed here. The icon-sprite scanner only discovers icons
// from template literals or marker calls; a name returned from a component
// getter is invisible to it, so the icons would be dropped from the generated
// sprite and render as nothing. Keep the literals in the template.

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
 * How the table adapts when its container is narrower than `cardBreakpoint`:
 * - `scroll` — the table keeps its columns and scrolls horizontally, with the
 *   first column and the actions column pinned in place. Default — preserves the
 *   existing horizontal-scroll behavior, so card mode is strictly opt-in.
 * - `cards`  — each row collapses into a stacked card (title + actions header,
 *   priority-ranked label/value fields, optional detail content).
 * Above the breakpoint both modes render the regular table.
 */
export type TnTableMobileLayout = 'cards' | 'scroll';

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
    '[class.tn-table--cards]': 'isCardMode()',
    '[class.tn-table--scroll]': 'isScrollMode()',
    '[style.--tn-table-active-bg]': 'activeBg()',
    '[style.--tn-table-active-indicator]': 'activeIndicator()',
  },
})
export class TnTableComponent<T = unknown> implements OnInit {
  private destroyRef = inject(DestroyRef);
  private elementRef = inject(ElementRef<HTMLElement>);

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
   * expand control, cannot be toggled, and never render a detail row. Has no
   * effect unless `expandable` is true. Re-evaluated on each change detection,
   * so it may depend on signals — keep it cheap and pure.
   *
   * If the predicate stops allowing an already-expanded row (e.g. it is driven
   * by dynamic row state), that row is pruned from the expanded set, so it will
   * not silently reappear expanded should the predicate allow it again later.
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

  // --- Responsive (card) inputs ---

  /**
   * How the table adapts when its container is narrower than `cardBreakpoint`.
   * See {@link TnTableMobileLayout}. Defaults to `scroll`, which preserves the
   * existing horizontal-scroll behavior; set to `cards` to opt into the stacked
   * card layout.
   */
  mobileLayout = input<TnTableMobileLayout>('scroll');

  /**
   * Container width (px) below which `mobileLayout` takes effect. The component
   * observes its own host width (via `ResizeObserver`), so this responds to the
   * available container — a table in a narrow sidebar adapts on a wide screen.
   */
  cardBreakpoint = input<number>(640);

  /**
   * Number of fields shown directly on each card before the rest fold under a
   * "More fields" disclosure. The title column is not counted. Defaults to `3`.
   */
  cardPrimaryCount = input<number>(3);

  // --- Outputs ---
  sortChange = output<TnSortEvent>();
  selectionChange = output<T[]>();

  /** Emits the row when a clickable row is activated (click or Enter/Space). */
  rowClick = output<T>();

  // --- Content queries ---
  columnDefs = contentChildren(TnTableColumnDirective);
  detailRowDef = contentChild(TnDetailRowDefDirective);
  rowActionsDef = contentChild(TnRowActionsDefDirective);

  // --- Responsive state ---
  /** Observed host width in px; drives the switch into card mode. */
  private containerWidth = signal<number>(Infinity);
  private resizeObserver?: ResizeObserver;

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

    // Prune rows the predicate no longer allows from the expanded set, so a row
    // that flips expandable -> non-expandable -> expandable does not silently
    // reappear already expanded. While the set is non-empty the predicate runs,
    // so any signals it reads (e.g. (row) => allowedIds().includes(row.id)) are
    // tracked and re-prune as they change. When the set is empty we return early
    // before the predicate runs — there is nothing to prune, and the next toggle
    // re-runs this effect and re-tracks the predicate's signals. The
    // next.size !== expanded.size guard makes the self-write converge after one
    // extra run, so there is no infinite loop.
    effect(() => {
      const predicate = this.isRowExpandable();
      if (!predicate) { return; }
      const expanded = this.expandedRows();
      if (expanded.size === 0) { return; }
      const next = new Set<unknown>();
      for (const row of expanded) {
        if (predicate(row as T)) { next.add(row); }
      }
      if (next.size !== expanded.size) {
        this.expandedRows.set(next);
      }
    });

    // Measure the host width to drive card/scroll mode. The initial read is
    // taken in `afterNextRender` (guaranteed post-layout, so we get the real
    // width rather than a pre-layout 0), then a `ResizeObserver` keeps it in
    // sync as the container resizes. Both are browser-only — `afterNextRender`
    // does not run during SSR and `ResizeObserver` is feature-detected.
    afterNextRender(() => {
      const host = this.elementRef.nativeElement;
      this.measureContainer(host);
      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver((entries) => {
          const width = entries[0]?.contentRect.width;
          if (typeof width === 'number') {
            this.containerWidth.set(width);
          }
        });
        this.resizeObserver.observe(host);
      }
    });
  }

  /** Reads the host's current width into `containerWidth`. */
  private measureContainer(host: HTMLElement): void {
    this.containerWidth.set(host.getBoundingClientRect().width || Infinity);
  }

  ngOnInit(): void {
    this.initialized = true;

    this.destroyRef.onDestroy(() => {
      this.selection.clear();
      this.resizeObserver?.disconnect();
    });
  }

  // --- Responsive computeds ---

  /** True when the layout should collapse rows into cards. */
  isCardMode = computed(
    () => this.mobileLayout() === 'cards' && this.containerWidth() < this.cardBreakpoint()
  );

  /** True when the layout should keep the table but pin edge columns and scroll. */
  isScrollMode = computed(
    () => this.mobileLayout() === 'scroll' && this.containerWidth() < this.cardBreakpoint()
  );

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

  // --- Card activation ---
  // Cards reuse `rowClick`, but the card header embeds its own controls
  // (selection checkbox, row actions, "more"/detail toggles). Activating the
  // card must ignore clicks/keys that originate from those controls so a tap on
  // an action button doesn't also fire `rowClick`.

  onCardClick(event: Event, row: T): void {
    if (!this.clickable() || this.isCardControlTarget(event)) { return; }
    this.rowClick.emit(row);
  }

  onCardKeydown(event: KeyboardEvent, row: T): void {
    if (!this.clickable()) { return; }
    if (event.key !== 'Enter' && event.key !== ' ') { return; }
    if (this.isCardControlTarget(event)) { return; }
    event.preventDefault();
    this.rowClick.emit(row);
  }

  private isCardControlTarget(event: Event): boolean {
    const target = event.target as HTMLElement | null;
    return !!target?.closest(
      '.tn-table__card-actions, .tn-table__card-select, .tn-table__card-more, .tn-table__card-detail-toggle'
    );
  }

  /** Handles the card-mode sort `<select>` change. */
  onSortSelectChange(event: Event): void {
    this.setSortColumn((event.target as HTMLSelectElement).value);
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

  // --- Card-mode computeds ---

  /**
   * The column rendered as the card title. The first `displayedColumns` entry
   * whose def sets `cardTitle`, falling back to the first displayed column.
   */
  cardTitleColumn = computed<string>(() => {
    const cols = this.displayedColumns();
    const explicit = cols.find((c) => this.getColumnDef(c)?.cardTitle());
    return explicit ?? cols[0] ?? '';
  });

  /**
   * Columns rendered as label/value fields in a card, ordered by descending
   * `priority` (ties keep `displayedColumns` order). Excludes the title column
   * and any `cardHidden` columns.
   */
  cardFieldColumns = computed<string[]>(() => {
    const title = this.cardTitleColumn();
    const fields = this.displayedColumns()
      .map((name, index) => ({ name, index }))
      .filter(({ name }) => name !== title && !this.getColumnDef(name)?.cardHidden());
    fields.sort((a, b) => {
      const pa = this.getColumnDef(a.name)?.priority() ?? 0;
      const pb = this.getColumnDef(b.name)?.priority() ?? 0;
      return pb - pa || a.index - b.index;
    });
    return fields.map((f) => f.name);
  });

  /** Fields shown directly on the card (up to `cardPrimaryCount`). */
  cardPrimaryColumns = computed<string[]>(() =>
    this.cardFieldColumns().slice(0, this.cardPrimaryCount())
  );

  /** Fields tucked behind the "More fields" disclosure. */
  cardSecondaryColumns = computed<string[]>(() =>
    this.cardFieldColumns().slice(this.cardPrimaryCount())
  );

  /** Displayed columns that are sortable — populates the card-mode sort menu. */
  sortableColumns = computed<string[]>(() =>
    this.displayedColumns().filter((c) => this.getColumnDef(c)?.sortable())
  );

  // --- Card-mode sort ---

  /** Sets (or clears, when passed `''`) the active sort column for card mode. */
  setSortColumn(column: string): void {
    if (!column) {
      this.sortColumn.set('');
      this.sortDirection.set('');
    } else {
      this.sortColumn.set(column);
      if (this.sortDirection() === '') {
        this.sortDirection.set('asc');
      }
    }
    this.sortChange.emit({ column: this.sortColumn(), direction: this.sortDirection() });
  }

  /** Flips the active sort direction between ascending and descending. */
  toggleSortDirection(): void {
    if (!this.sortColumn()) { return; }
    this.sortDirection.set(this.sortDirection() === 'desc' ? 'asc' : 'desc');
    this.sortChange.emit({ column: this.sortColumn(), direction: this.sortDirection() });
  }

  // --- Column helpers ---

  getColumnDef(columnName: string): TnTableColumnDirective | undefined {
    return this.columnDefMap().get(columnName);
  }

  /**
   * Field label for a column in card mode. Precedence: `cardLabel` override →
   * shared `label` → the column name.
   */
  getCardLabel(column: string): string {
    const def = this.getColumnDef(column);
    return def?.cardLabel() ?? def?.label() ?? column;
  }

  getCellValue(row: T, column: string): unknown {
    return (row as Record<string, unknown>)[column];
  }
}
