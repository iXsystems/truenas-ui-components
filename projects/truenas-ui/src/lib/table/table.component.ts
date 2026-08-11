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
  model,
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
 *   first column and the actions column pinned in place *while it overflows*.
 *   Default — preserves the existing horizontal-scroll behavior, so card mode is
 *   strictly opt-in. Note that overflow is not automatic: `auto` layout (the
 *   default) sizes to content and overflows on its own, but a `fixedLayout` table
 *   fits its container exactly, so it only overflows — and only then pins — once
 *   `minColumnWidth` or `minWidth` gives it a floor.
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
    '[class.tn-table--fixed-layout]': 'fixedLayout()',
    '[class.tn-table--loading]': 'loading()',
    // `--cards` is a state hook only: card mode is styled through the
    // `__cards*` element classes, not from the host. It is kept as the
    // documented way for consumers and tests to detect the active layout
    // without reaching for internal element classes. `--scroll` is both a
    // hook and the selector the pinned-column rules key off.
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

  /**
   * Optional second line under `emptyMessage`, for empty states that carry both a headline and an
   * explanation (e.g. "No search results" plus what to try instead). Omitted when empty, so tables
   * with a single-line empty state are unaffected.
   */
  emptyDescription = input<string>('');

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
   * Optional predicate marking rows as active, in addition to `activeRow`.
   * Use when several rows can be active at once (e.g. multi-selection
   * highlighting) or when matching by key rather than by reference. Active
   * rows get the same `tn-table__row--active` styling and, when `clickable`,
   * `aria-selected`. Re-evaluated on each change detection, so it may depend
   * on signals — keep it cheap and pure.
   */
  activeWhen = input<((row: T) => boolean) | undefined>(undefined);

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
   *
   * Accessibility limitation in card mode: a card is `role="listitem"`, and the
   * roles that would announce it as activatable (`button`, `option`) have
   * presentational children, which would hide the card's own checkbox, row
   * actions and "Details" toggle from assistive tech. So a clickable card is
   * focusable and responds to Enter/Space, but is not announced as a control.
   * Active state is conveyed with `aria-current`, and expansion with
   * `aria-expanded` when `expandOnRowClick` is set. If an action must be
   * discoverable by screen-reader users, project an explicit control through
   * `[tnRowActionsDef]` rather than relying on card activation alone.
   */
  clickable = input<boolean>(false);

  /**
   * When true, activating a row (click or Enter/Space) toggles its expansion, in addition to the
   * chevron. Requires `clickable` — that is what makes rows activatable at all — and `expandable`;
   * rows the `isRowExpandable` predicate rejects are unaffected, since `toggleRowExpansion` gates
   * on it. `rowClick` still emits, so a consumer can both expand and react to the click.
   *
   * Applies in card mode too, where activating the card toggles its detail section — the card's
   * "Details" button keeps carrying the `aria-expanded` state, since the card element itself is a
   * `listitem` and cannot.
   */
  expandOnRowClick = input<boolean>(false);

  /**
   * When true, expanding a row collapses whichever row was expanded before, so at most one detail
   * row is open at a time. Default (false) allows any number.
   */
  singleExpand = input<boolean>(false);

  /**
   * Lays the table out `fixed` at full width, so every column without an explicit `[width]` gets
   * an equal share and none can grow to dominate the row.
   *
   * Cells wrap regardless of this (that is the table's default), so reach for it only when equal
   * columns are actually wanted: it gives up the `auto` layout's content-proportional sizing,
   * which a table with one long text column among short ones usually wants to keep.
   *
   * Changes the layout algorithm only — the table still shrinks with its container, with no floor
   * unless {@link minColumnWidth} or {@link minWidth} sets one.
   */
  fixedLayout = input<boolean>(false);

  /**
   * Smallest width a column is allowed to shrink to before the host scrolls horizontally instead.
   * Any CSS length. Empty (the default) applies no floor.
   *
   * `fixedLayout` makes the table fit its container exactly, so past a certain width the columns
   * keep shrinking and wrap every cell to a couple of characters per line: technically visible,
   * unreadable, and never scrollable. Set this to scroll instead once a column would go below it.
   * The floor is derived as this times the column count, so it scales with the table rather than
   * needing a hand-picked number per page.
   *
   * Opt-in rather than on by default, because a derived floor cannot know the table's container: a
   * full-width page table has room for one, while the same table in a dashboard card or beside a
   * details pane would just scroll at every ordinary window size. Only the consumer knows which it
   * is — reach for it when the table can actually get narrow enough to matter, typically a
   * full-width table on a phone.
   *
   * Only applies with `fixedLayout`. Without it the table lays out `auto`, sizing to its content
   * and overflowing the host — which scrolls on its own.
   */
  minColumnWidth = input<string>('');

  /**
   * Explicit width floor, overriding the {@link minColumnWidth} derivation. Any CSS length. Reach
   * for this only when a specific table needs a floor its column count doesn't imply.
   */
  minWidth = input<string>('');

  /** The floor actually applied to the table — explicit if given, else derived, else none. */
  protected readonly resolvedMinWidth = computed<string | null>(() => {
    const explicit = this.minWidth();
    if (explicit) {
      return explicit;
    }
    const perColumn = this.minColumnWidth();
    if (!perColumn || !this.fixedLayout()) {
      return null;
    }
    // The actions column adds its own fixed width rather than a `minColumnWidth` share, because
    // that is exactly what it claims under `fixedLayout` — and the cell is `border-box`, so the
    // value added here is its real outer width. (`--tn-table-select-width` and
    // `--tn-table-expand-width` are treated as ordinary shares instead: they over-reserve
    // slightly, which is the behavior this component has always had and has tests for. Unifying
    // all three belongs in its own change.)
    //
    // No `var()` fallback on purpose. A duplicated default here is a second source of truth for a
    // number the stylesheet owns, and it drifted the moment that default changed — leaving the
    // exact value whose shortfall clipped the actions column sitting in code labelled "the
    // default". `:host` always defines the property, so the only way to reach a fallback is to
    // unset it deliberately, and an invalid calc() (no floor) is a more debuggable outcome than a
    // floor computed from a stale constant.
    const columns = `${perColumn} * ${this.effectiveDisplayedColumns().length}`;
    return this.rowActionsDef()
      ? `calc(${columns} + var(--tn-table-actions-width))`
      : `calc(${columns})`;
  });

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

  /**
   * Emits the row when a clickable row is double-clicked. Double-click has no
   * keyboard equivalent (Enter/Space emit `rowClick`), so consumers must
   * provide an accessible alternative for the same action — e.g. a dedicated
   * button inside the row, as the file picker does for entering directories.
   */
  rowDoubleClick = output<T>();

  // --- Content queries ---
  columnDefs = contentChildren(TnTableColumnDirective);
  detailRowDef = contentChild(TnDetailRowDefDirective);
  rowActionsDef = contentChild(TnRowActionsDefDirective);

  // --- Responsive state ---
  /** Observed host width in px; drives the switch into card mode. */
  private containerWidth = signal<number>(Infinity);
  private resizeObserver?: ResizeObserver;

  // --- Sort state ---
  /**
   * Sorted column and direction. Two-way bindable (`[(sortColumn)]`), so a consumer that owns the
   * sort — a data provider, a table destroyed and rebuilt when its list empties out — can restore
   * the header's arrow instead of reaching in and setting the signal from an effect.
   */
  sortColumn = model<string>('');
  sortDirection = model<'asc' | 'desc' | ''>('');

  /**
   * Set of currently expanded row references.
   * Note: uses object identity. If the consumer replaces the data array
   * (e.g. after sorting), expanded state is lost. A future key-based
   * approach could address this.
   */
  expandedRows = signal<Set<unknown>>(new Set());

  // Per-instance prefix for generated DOM ids, so two tables on a page can't collide.
  private static instanceCount = 0;
  private readonly instanceId = `tn-table-${TnTableComponent.instanceCount++}`;

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

  /**
   * Every column the table actually renders, including the trailing actions column, which
   * `effectiveDisplayedColumns` does not track because it comes from a content template rather
   * than `displayedColumns`. Used for the detail row's `colspan`, so a detail row spans the full
   * width no matter which structural columns are on.
   */
  totalColumnCount = computed(
    () => this.effectiveDisplayedColumns().length + (this.rowActionsDef() ? 1 : 0)
  );

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

    // `&& this.sortDirection()` matters: a column set with an empty direction is *not* sorted, and
    // that state is reachable through the two-way `[(sortColumn)]` binding — a consumer restoring
    // only the column lands in it. Without the guard neither inner branch matched, so the click
    // mutated nothing and still emitted a "cleared" event, leaving a header the user could click
    // forever with no arrow to explain it. Folding it into the not-sorted branch starts a fresh
    // ascending sort, which is what clicking an unsorted header does everywhere else.
    if (this.sortColumn() === column && this.sortDirection()) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : '');
      if (!this.sortDirection()) {
        this.sortColumn.set('');
      }
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }

    // Emits the *resulting* sort state, so clearing a sort reports `{ column: '', direction: '' }`
    // rather than naming the column that was just cleared. Card mode's `setSortColumn('')` has
    // always emitted the empty column, and a consumer keying off `event.column` should not get a
    // different answer depending on which layout the container width happens to be showing.
    this.sortChange.emit({
      column: this.sortColumn(),
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
      if (this.singleExpand()) {
        expanded.clear();
      }
      expanded.add(row);
    }
    this.expandedRows.set(expanded);
  }

  isRowExpanded(row: T): boolean {
    return this.expandedRows().has(row);
  }

  /**
   * Whether the row element itself acts as the expand/collapse control, which is what makes an
   * `aria-expanded` on it meaningful: a screen-reader user who focuses the row and presses Enter
   * otherwise gets no announcement that anything expanded, since only the chevron carries the
   * state. Also requires `clickable` — without it the row isn't activatable and
   * {@link onRowClick} returns before toggling anything.
   */
  isRowExpandTrigger(row: T): boolean {
    return this.expandOnRowClick() && this.clickable() && this.canExpandRow(row);
  }

  /**
   * Card-mode counterpart of {@link isRowExpandTrigger}, additionally requiring a detail
   * template. Card mode renders no expansion affordance at all without one, so `aria-expanded`
   * on the card would advertise a state change that produces nothing.
   *
   * Table mode deliberately keeps the looser check: its rows are asserted to carry
   * `aria-expanded` from `expandOnRowClick` alone, and that predates this layout.
   */
  isCardExpandTrigger(row: T): boolean {
    return this.isRowExpandTrigger(row) && !!this.detailRowDef();
  }

  /** DOM id for a row's detail panel, so the expand trigger can point `aria-controls` at it. */
  detailPanelId(rowIndex: number): string {
    return `${this.instanceId}-detail-${rowIndex}`;
  }

  // --- Active row ---

  isRowActive(row: T): boolean {
    if (this.activeWhen()?.(row)) { return true; }
    const active = this.activeRow();
    return active !== null && active === row;
  }

  // --- Row click ---

  onRowClick(row: T): void {
    if (!this.clickable()) { return; }
    if (this.expandOnRowClick()) {
      this.toggleRowExpansion(row);
    }
    this.rowClick.emit(row);
  }

  onRowDoubleClick(row: T): void {
    if (!this.clickable()) { return; }
    this.rowDoubleClick.emit(row);
  }

  onRowKeydown(event: KeyboardEvent, row: T): void {
    if (!this.clickable()) { return; }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (this.expandOnRowClick()) {
        this.toggleRowExpansion(row);
      }
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
    if (this.expandOnRowClick()) {
      this.toggleRowExpansion(row);
    }
    this.rowClick.emit(row);
  }

  /** Card-mode counterpart of {@link onRowDoubleClick}, with the same guard. */
  onCardDoubleClick(event: Event, row: T): void {
    if (!this.clickable() || this.isCardControlTarget(event)) { return; }
    this.rowDoubleClick.emit(row);
  }

  onCardKeydown(event: KeyboardEvent, row: T): void {
    if (!this.clickable()) { return; }
    if (event.key !== 'Enter' && event.key !== ' ') { return; }
    if (this.isCardControlTarget(event)) { return; }
    event.preventDefault();
    if (this.expandOnRowClick()) {
      this.toggleRowExpansion(row);
    }
    this.rowClick.emit(row);
  }

  /**
   * Anything focusable or otherwise interactive, plus the card's own controls and
   * its projected detail panel.
   *
   * A class allowlist is not enough: the detail panel renders consumer content
   * inside the clickable card, so an allowlist lets a click on a projected button
   * bubble up and fire `rowClick` — and with `expandOnRowClick`, collapse the very
   * panel being used. Table mode never had that problem, because there the detail
   * row is a sibling `<tr>` outside the clickable row.
   *
   * The card's own field values are deliberately not interactive, so they still
   * activate the card whether primary or folded under "More fields".
   */
  private isCardControlTarget(event: Event): boolean {
    const target = event.target as HTMLElement | null;
    const match = target?.closest(
      'a[href], button, input, select, textarea, summary, [contenteditable]:not([contenteditable="false"]),' +
        '[tabindex]:not([tabindex="-1"]),' +
        '.tn-table__card-actions, .tn-table__card-select, .tn-table__card-more-summary,' +
        '.tn-table__card-detail-toggle, .tn-table__card-detail'
    );
    // The card itself is focusable when `clickable`, so it matches the selector's
    // focusable clause. It is the activation surface, not a control within it.
    return !!match && match !== event.currentTarget;
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
   * whose def sets `cardTitle`, else the first column not marked `cardHidden` —
   * a column the consumer asked to keep off the card must not be promoted to its
   * most prominent slot. Falls back to the first displayed column only when every
   * column is hidden, since a card still needs a title.
   */
  cardTitleColumn = computed<string>(() => {
    const cols = this.displayedColumns();
    const explicit = cols.find((c) => this.getColumnDef(c)?.cardTitle());
    const visible = cols.find((c) => !this.getColumnDef(c)?.cardHidden());
    return explicit ?? visible ?? cols[0] ?? '';
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

  /**
   * Sets (or clears, when passed `''`) the active sort column for card mode.
   * Switching columns resets to ascending, and clearing emits an empty `column` —
   * both matching {@link onSortClick}, since the same `sortChange` contract should
   * not depend on which layout the container width happens to be showing.
   */
  setSortColumn(column: string): void {
    if (!column) {
      this.sortColumn.set('');
      this.sortDirection.set('');
    } else {
      const changed = this.sortColumn() !== column;
      this.sortColumn.set(column);
      if (changed || this.sortDirection() === '') {
        this.sortDirection.set('asc');
      }
    }
    this.sortChange.emit({ column: this.sortColumn(), direction: this.sortDirection() });
  }

  /**
   * Flips the active sort direction between ascending and descending.
   *
   * Starts from ascending, so a column carrying an empty direction — reachable by restoring only
   * `sortColumn` through its two-way binding — sorts ascending rather than skipping straight to
   * descending. Same reading of "empty direction means not sorted" as {@link onSortClick}.
   */
  toggleSortDirection(): void {
    if (!this.sortColumn()) { return; }
    this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
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
