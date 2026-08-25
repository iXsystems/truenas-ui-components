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
  Injector,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import type { OnInit } from '@angular/core';
import { tnScrollableRegion } from '../a11y/scrollable-region';
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

/**
 * The name the table's scroll region falls back to when the consumer has not
 * said what the table holds (#270).
 *
 * A focusable element with no accessible name is announced as a bare "group",
 * which tells a listener that something has been reached and nothing about what
 * it is. "Table" is a poor name and is deliberately the fallback rather than
 * the expectation — `scrollRegionAriaLabel` is how a consumer says something
 * useful, and it is the one input on this component whose default is worth
 * overriding on sight.
 *
 * No dev-mode warning goes with it, unlike `tnAccessibleName`'s fallbacks: this
 * name is rendered only on a table that is WIDER THAN ITS CONTAINER, which
 * depends on the consumer's layout rather than on their markup, so the warning
 * would fire on a viewport rather than on a mistake.
 *
 * Exported so specs assert against it by name rather than by a copied literal.
 */
export const TN_TABLE_SCROLL_REGION_LABEL = 'Table';

export interface TnTableDataSource<T = unknown> {
  data?: T[];
  connect?(): T[];
  disconnect?(): void;
}

/** Payload of the table's `sortChange` output. */
export interface TnSortEvent {
  /**
   * The column that is sorted *after* the change, or `''` when the sort was cleared — the
   * third click on a table header, or the "Unsorted" option in card mode. Both layouts
   * report the resulting state, so a cleared sort never names the column just cleared.
   */
  column: string;
  /** Direction after the change; `''` when no sort is active, which is always the case when `column` is `''`. */
  direction: 'asc' | 'desc' | '';
}

/**
 * How the table adapts when its container is narrower than `cardBreakpoint`:
 * - `scroll` — the table keeps its columns and scrolls horizontally, with the
 *   first column and the actions column pinned in place *while it overflows*.
 *   Default, and card mode is strictly opt-in — but note this is NOT a no-op for
 *   existing tables: because the default `cardBreakpoint` is 640, any table whose
 *   host content box measures under that (a phone, or a sidebar or dashboard card
 *   on a desktop) gets `tn-table--scroll` and therefore the pinning, where it
 *   previously scrolled all of its columns together. Raise `cardBreakpoint` if a
 *   table should never pin.
 *
 *   Overflow is not automatic either: `auto` layout (the default) sizes to content
 *   and overflows on its own, but a `fixedLayout` table fits its container exactly,
 *   so it only overflows — and only then pins — once `minColumnWidth` or `minWidth`
 *   gives it a floor.
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
    // The host is the element that scrolls (see `overflow-x` in the stylesheet
    // and `scrollKeyboardReachable` below), so it is the element that has to be
    // reachable when it does. All three arrive and leave together.
    '[attr.tabindex]': 'scrollKeyboardReachable() ? "0" : null',
    '[attr.role]': 'scrollKeyboardReachable() ? "group" : null',
    '[attr.aria-label]': 'scrollKeyboardReachable() ? resolvedScrollRegionLabel() : null',
  },
})
export class TnTableComponent<T = unknown> implements OnInit {
  private destroyRef = inject(DestroyRef);
  private elementRef = inject(ElementRef<HTMLElement>);
  private injector = inject(Injector);

  /**
   * Element that had focus when `loading` went true, so it can be restored afterwards.
   *
   * `inert` blurs whatever is focused inside it and refuses focus while set, so without this
   * a keyboard user who pressed Enter on a sortable header — the flow that *starts* most
   * loads — was dropped to `<body>` and had to tab back from the top of the document.
   */
  private focusBeforeLoading: HTMLElement | null = null;

  /**
   * Whether the host carries a tab stop, `role="group"` and a name because it
   * is currently scrolling (#270).
   *
   * `:host` is `overflow-x: auto` — the stylesheet says why the scrollport is
   * the host and not `.tn-table__table` — so a table wider than its container
   * scrolls HERE, and axe's `scrollable-region-focusable` reports a scroll
   * container that is neither in the tab order nor holds anything that is.
   *
   * Which this table is depends entirely on how it was configured: sortable
   * headers and clickable rows are `tabindex="0"`, so a table with either
   * satisfies the rule through its content, and a plain read-only one — the
   * default of every input on this component — satisfies nothing and leaves its
   * trailing columns unreachable from a keyboard.
   *
   * Gated on the measurement rather than on `isScrollMode()`: that class says
   * which LAYOUT the container's width selected, and this asks whether the
   * content actually exceeds the box, which is a different question and the one
   * axe asks. The measurement, the observers behind it and the rule that holds
   * the answer true while the host has focus are `tnScrollableRegion`'s.
   *
   * A field initializer rather than the constructor, because it registers an
   * `effect` and so needs an injection context.
   */
  protected scrollKeyboardReachable = tnScrollableRegion(
    () => this.elementRef.nativeElement as HTMLElement
  );

  /**
   * The scroll region's name, falling back when a consumer passes whitespace.
   *
   * Blank is not a name: an `aria-label=" "` names the group as emptily as no
   * label at all, and axe agrees — the same rule `tnAccessibleName` applies to
   * every other name in this library.
   */
  protected resolvedScrollRegionLabel = computed(
    () => this.scrollRegionAriaLabel().trim() || TN_TABLE_SCROLL_REGION_LABEL
  );

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

  /**
   * Accessible name for the table's own scroll region, used only while the host
   * actually scrolls — see `scrollKeyboardReachable` and
   * `TN_TABLE_SCROLL_REGION_LABEL`.
   *
   * Set it to say what the table holds ("Storage pools"). It names the SCROLL
   * REGION rather than the table: a table's own structure is announced from its
   * rows and headers, and this is the box around it that a keyboard user stands
   * on to scroll sideways.
   */
  scrollRegionAriaLabel = input<string>(TN_TABLE_SCROLL_REGION_LABEL);

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
   *
   * The rendered surfaces are `inert` while this is true, so they leave the tab order *and*
   * the accessibility tree — a screen-reader user hears the overlay's "Loading..." status
   * rather than the stale rows. That is deliberate: `pointer-events` alone left every row,
   * header and projected control activatable by keyboard against data being replaced.
   * Focus is captured on the way in and restored on the way out.
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
   * In table mode the expanded state is announced by the chevron, not by the row: `aria-expanded`
   * is a `treegrid`-row attribute and a plain `table` row cannot hold it (#246). The row points at
   * the open panel with `aria-controls`, which every role permits.
   *
   * Applies in card mode too, where activating the card toggles its detail section. Both controls
   * report the state: the card carries `aria-expanded` while it is the trigger (`listitem` does
   * permit it, unlike `aria-selected`), and the "Details" button carries it unconditionally,
   * because that button is what a screen-reader user reaches by tabbing. The redundancy is
   * deliberate — see the comment above the button in the template.
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
   *
   * Measured against the host's **content box** — its border and padding are excluded — so a
   * `[bordered]` table crosses the threshold at the same content width as an unbordered one.
   */
  cardBreakpoint = input<number>(640);

  /**
   * Number of fields shown directly on each card before the rest fold under a
   * "More fields" disclosure. The title column is not counted. Defaults to `3`.
   */
  cardPrimaryCount = input<number>(3);

  // --- Outputs ---
  /**
   * Emits the resulting sort state whenever the user changes it, from either layout.
   * Clearing a sort emits `{ column: '', direction: '' }` rather than naming the column
   * that was cleared — see {@link TnSortEvent}.
   */
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

    // Save focus on the way into `loading`, restore it on the way out. The restore is
    // deferred to after the next render because the surfaces only drop `inert` when the
    // template updates, and focusing an element still inside an inert subtree is a no-op.
    effect(() => {
      const host = this.elementRef.nativeElement;
      if (typeof document === 'undefined') { return; }

      if (this.loading()) {
        const active = document.activeElement as HTMLElement | null;
        // `<body>` is what `inert` leaves behind, not evidence the user moved on. Signals are
        // glitch-free, so a false -> true flip inside one task (a store that clears loading on
        // a cache hit and re-sets it for the network request) runs this effect once, seeing
        // only `true` — and overwriting a still-valid saved element with null there would lose
        // the focus permanently, which is the symptom this whole effect exists to prevent.
        if (active && active !== document.body) {
          this.focusBeforeLoading = host.contains(active) ? active : null;
        }
        return;
      }

      const previous = this.focusBeforeLoading;
      if (!previous) { return; }
      this.focusBeforeLoading = null;
      afterNextRender(
        () => {
          // Never steal focus back from wherever the user moved on to.
          if (document.activeElement !== document.body) { return; }

          if (previous.isConnected) {
            previous.focus();
            if (document.activeElement === previous) { return; }

            // Focus was refused. `loading()` discriminates why: true means a second load
            // re-applied `inert` before this hook ran, so keep the element for next time.
            // False means it is simply no longer focusable — a `<th>` reused for a
            // non-sortable column (the header `@for` tracks `$index`), a projected action
            // that came back `disabled` — and re-arming there would retry the same dead
            // element on every load, parking the user on `<body>` indefinitely. Reading the
            // signal here is untracked, so it costs nothing.
            if (this.loading()) {
              this.focusBeforeLoading = previous;
              return;
            }
          }

          // The remembered element is gone: a reload dropped the focused row under an
          // id-based `trackBy`, or the container flipped to cards mid-load. Keep focus in the
          // region rather than leaving the user at the top of the document.
          if (!host.hasAttribute('tabindex')) {
            host.setAttribute('tabindex', '-1');
          }
          host.focus();
        },
        { injector: this.injector }
      );
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
            // `|| Infinity` for the same reason `measureContainer` applies it: a 0 width
            // means unmeasurable, not narrow. An element inside a `display: none`
            // container reports 0x0, so without this a table in a tab that gets hidden
            // flips to card mode and tears down anything keyed off `isCardMode()` — the
            // open `<details>` state, for one — for a resize that never happened.
            this.containerWidth.set(width || Infinity);
          }
        });
        this.resizeObserver.observe(host);
      }
    });
  }

  /**
   * Reads the host's current **content-box** width into `containerWidth`.
   *
   * Content box specifically, to match the `ResizeObserver` callback's `contentRect`. The
   * initial read used `getBoundingClientRect()` — the border box — so the two paths measured
   * different quantities, and `[bordered]` puts a 1px border on each side: a bordered table
   * whose content box is 639px rendered as a table on first paint (641 is not < 640) and
   * flipped to cards on the observer's first callback, with no resize having happened. Host
   * padding widens the gap further.
   */
  private measureContainer(host: HTMLElement): void {
    // The computed `width` is the *used* content-box width — content box even under
    // `box-sizing: border-box`, already net of the border and of any vertical scrollbar
    // gutter, and untransformed. That matches `contentRect.width` down to the fraction,
    // which is the point: `:host` sets `overflow-x: auto` (which promotes `overflow-y` to
    // auto), so on a platform with classic scrollbars a border-box width measured ~15px
    // wider here than the observer did, and `getBoundingClientRect()` reports the
    // *transformed* size, so a table inside a scaled dialog mis-measured as well.
    //
    // `clientWidth` minus horizontal padding gets all of that right too, but it is
    // integer-rounded, and the rounding is not neutral at the boundary: a 639.6px content
    // box against the default 640 breakpoint reads as 640 here and 639.6 on the observer's
    // first callback, so the table renders for a frame and then flips to cards with no
    // resize having happened — the first-paint flip this measurement exists to remove.
    //
    // Only a `px` value is a used width, and the unit check is load-bearing rather than
    // defensive. `width` resolves to the *used* value only for an element that has a layout
    // box; without one it resolves to the computed value, and `:host` declares `width: 100%`
    // — so a table built inside a `display: none` container (an inactive tab body, a
    // collapsed panel) resolves to the string '100%'. Parsed bare that is the number 100,
    // which is under every sane `cardBreakpoint`: a container that was never measured would
    // render as cards. Rejecting the non-px value falls through to `clientWidth`, which is 0
    // there, and on to the 0 -> Infinity guard below — the same answer the `ResizeObserver`
    // callback gives a 0x0 contentRect. jsdom takes this path too: with no rule matching the
    // host it resolves `width` to the empty string rather than filling in an initial value
    // (checked against jsdom 26.1.0, the version jest-environment-jsdom resolves here).
    const hostStyle = getComputedStyle(host);
    const resolvedWidth = hostStyle.width;
    const usedWidth = resolvedWidth.endsWith('px') ? parseFloat(resolvedWidth) : NaN;
    let contentWidth: number;
    if (Number.isFinite(usedWidth)) {
      contentWidth = usedWidth;
    } else {
      const padding =
        parseFloat(hostStyle.paddingLeft || '0') + parseFloat(hostStyle.paddingRight || '0');
      contentWidth = host.clientWidth - (Number.isNaN(padding) ? 0 : padding);
    }
    this.containerWidth.set(contentWidth > 0 ? contentWidth : Infinity);
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

  /**
   * How many rows a select-all can actually select.
   *
   * `SelectionModel` stores selections in a `Set`, so `selection.selected.length`
   * counts DISTINCT rows while `data().length` counts array entries. A `dataSource`
   * holding the same row reference twice makes the two disagree, and every comparison
   * of a selection count against a row count has to use this one to stay honest —
   * see {@link isAllSelected}.
   */
  private distinctRowCount = computed(() => new Set(this.data()).size);

  isAllSelected = computed(() => {
    const numSelected = this.selectionCount();
    const numRows = this.distinctRowCount();
    return numRows > 0 && numSelected === numRows;
  });

  isIndeterminate = computed(() => {
    const count = this.selectionCount();
    return count > 0 && !this.isAllSelected();
  });

  /**
   * Whether the select-all control has anything to act on.
   *
   * Disabling it on an empty table is a correctness guard, not a nicety. Since #236
   * the checkbox is a real control the user can click, and its `checked` binding is
   * one-way: the DOM follows `isAllSelected()`, and Angular only writes the attribute
   * back when that value CHANGES. With no rows, `isAllSelected()` is pinned false —
   * selecting nothing leaves the count at zero — so a click would flip the input in
   * the DOM, change no bound value, and leave a checked-looking box over an empty
   * selection until something else re-rendered it.
   *
   * The hit area around the checkbox stands down for the same reason, so the two
   * cannot disagree about whether the control is live.
   *
   * An empty table is the only case that has to be disabled rather than fixed: a
   * repeated row reference produces the same DOM-versus-model divergence, and
   * {@link distinctRowCount} resolves that one by making the control work.
   */
  canSelectAll = computed(() => this.distinctRowCount() > 0);

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
   * Whether the row element itself acts as the expand/collapse control. Requires `clickable` —
   * without it the row isn't activatable and {@link onRowClick} returns before toggling anything.
   *
   * A table row does NOT get `aria-expanded` from this. That attribute is only supported on a
   * `treegrid` row; on a plain `table` it is ignored, so the state it seemed to publish reached
   * nobody (#246). The chevron in the `__expand` cell carries it instead, on a `button`, where it
   * is valid and where a screen-reader user lands by tabbing. What the row does take from this is
   * `aria-controls`, which is global rather than role-conditional.
   *
   * Card mode is the case where the trigger element CAN hold the state — see
   * {@link isCardExpandTrigger}.
   */
  isRowExpandTrigger(row: T): boolean {
    return this.expandOnRowClick() && this.clickable() && this.canExpandRow(row);
  }

  /**
   * Card-mode counterpart of {@link isRowExpandTrigger}, additionally requiring a detail
   * template. Card mode renders no expansion affordance at all without one, so `aria-expanded`
   * on the card would advertise a state change that produces nothing.
   *
   * `listitem` permits `aria-expanded`, which is what lets the card hold the state its table-row
   * equivalent cannot.
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

  /**
   * @param row The activated row.
   * @param event The originating DOM event, when there is one. Optional so a consumer (or a
   *   test) can still activate a row programmatically; the control-target guard only applies
   *   to real events, which is the only case where a projected control can be the source.
   */
  onRowClick(row: T, event?: Event): void {
    if (!this.clickable()) { return; }
    // Mirrors `onCardClick`. Only the select, expand and actions cells stop `click`
    // themselves, so a control projected into an ordinary `tnCellDef` — a checkbox, a
    // link — used to activate the row as well: `rowClick` fired and, under
    // `expandOnRowClick`, the detail panel toggled out from under the user. Card mode
    // never did that, so the same consumer template behaved differently either side of
    // `cardBreakpoint`.
    if (event && this.isRowControlTarget(event)) { return; }
    if (this.expandOnRowClick()) {
      this.toggleRowExpansion(row);
    }
    this.rowClick.emit(row);
  }

  /** @param event See {@link onRowClick} — same guard, same optionality. */
  onRowDoubleClick(row: T, event?: Event): void {
    if (!this.clickable()) { return; }
    if (event && this.isRowControlTarget(event)) { return; }
    this.rowDoubleClick.emit(row);
  }

  onRowKeydown(event: KeyboardEvent, row: T): void {
    if (!this.clickable()) { return; }
    if (this.isRowControlTarget(event)) { return; }
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

  /** Anything focusable or otherwise interactive, regardless of layout. */
  private static readonly INTERACTIVE_SELECTOR =
    'a[href], button, input, select, textarea, summary,'
    + ' [contenteditable]:not([contenteditable="false"]), [tabindex]:not([tabindex="-1"])';

  /**
   * Whether an event originated on a control *within* the activation surface rather than on
   * the surface itself.
   *
   * @param event The DOM event; its `currentTarget` is the activation surface.
   * @param containerSelectors Layout-specific wrappers that count as controls.
   */
  private isControlTarget(event: Event, containerSelectors: string): boolean {
    const target = event.target as HTMLElement | null;
    const selector = containerSelectors
      ? `${TnTableComponent.INTERACTIVE_SELECTOR}, ${containerSelectors}`
      : TnTableComponent.INTERACTIVE_SELECTOR;
    const match = target?.closest(selector);
    // The row/card itself is focusable when `clickable`, so it matches the focusable clause.
    // It is the activation surface, not a control within it.
    return !!match && match !== event.currentTarget;
  }

  /**
   * Interactive elements plus the card's own controls and its projected detail panel.
   *
   * A class allowlist is not enough: the detail panel renders consumer content inside the
   * clickable card, so an allowlist lets a click on a projected button bubble up and fire
   * `rowClick` — and with `expandOnRowClick`, collapse the very panel being used. Table mode
   * never had that problem, because there the detail row is a sibling `<tr>` outside the
   * clickable row.
   *
   * The card's own field values are deliberately not interactive, so they still activate the
   * card whether primary or folded under "More fields".
   */
  private isCardControlTarget(event: Event): boolean {
    return this.isControlTarget(
      event,
      '.tn-table__card-actions, .tn-table__card-select, .tn-table__card-more-summary,'
        + ' .tn-table__card-detail-toggle, .tn-table__card-detail'
    );
  }

  /**
   * Table-mode counterpart. The cells stop `click` themselves, but nothing stopped `keydown`,
   * so Enter on a projected action button bubbled to the row and got `preventDefault()`d —
   * which *is* how Enter activates a `<button>`, so the consumer's handler never ran and
   * `rowClick` fired for the row instead. Card mode has always guarded this; the two layouts
   * disagreed about what a projected control does under the keyboard.
   */
  private isRowControlTarget(event: Event): boolean {
    return this.isControlTarget(
      event,
      '.tn-table__select-cell, .tn-table__expand-cell, .tn-table__actions-cell'
    );
  }

  /**
   * Header-cell activation, guarded like the row and the card.
   *
   * A `<th>` is an activation surface too, and a control projected through
   * `tnHeaderCellDef` broke both ways without this: clicking a filter button re-sorted the
   * table as well as running the button's own handler, and Space on a checkbox in a
   * *non-sortable* header was swallowed entirely — `onSortClick` returned early on the
   * missing `sortable()`, but the template's `preventDefault()` ran regardless, so the
   * control was simply dead.
   *
   * @param column The column the header belongs to.
   * @param event The originating DOM event.
   */
  onSortHeaderClick(column: string, event: Event): void {
    if (this.isControlTarget(event, '')) { return; }
    if (!this.getColumnDef(column)?.sortable()) { return; }
    this.onSortClick(column);
  }

  /**
   * Keyboard counterpart of {@link onSortHeaderClick}.
   *
   * Takes `Event` rather than `KeyboardEvent` because Angular types `$event` as `Event` for
   * the `keydown.enter` / `keydown.space` pseudo-events; narrowing happens here.
   */
  onSortHeaderKeydown(column: string, event: Event): void {
    if (this.isControlTarget(event, '')) { return; }
    if (!this.getColumnDef(column)?.sortable()) { return; }
    // Only swallow the key once we know this header owns it, so Space on a projected
    // control still reaches that control.
    if ((event as KeyboardEvent).key === ' ') { event.preventDefault(); }
    this.onSortClick(column);
  }

  /** Handles the card-mode sort `<select>` change. */
  onSortSelectChange(event: Event): void {
    this.setSortColumn((event.target as HTMLSelectElement).value);
  }

  // --- Selection methods ---
  //
  // Every selection surface — the header cell, a row cell, and card mode's toolbar
  // and card wrappers — is a checkbox with a hit area around it. The checkbox is the
  // widget: it is the only tab stop, it activates itself, and it reports through
  // `(change)`. The wrapper exists so that clicking the cell's padding works too, and
  // it stands down for any click that started inside the checkbox.
  //
  // Before #236 it was the other way round: `.tn-table__checkbox` was
  // `pointer-events: none`, so the wrapper caught every click and the checkbox caught
  // none. That is why the header <th> had to be `role="checkbox" tabindex="0"` — the
  // only focusable, activatable thing in the cell was the cell — and why axe reported
  // a widget nested in a widget.

  /**
   * Whether an event started inside a selection checkbox rather than on the hit area
   * around it.
   *
   * Matched on the component's host class rather than through
   * {@link isControlTarget}, because the element clicked is usually neither the input
   * nor the host: `tn-checkbox` renders a `<label>` wrapping the input and its
   * checkmark, and a click on the checkmark activates the input as the label's default
   * action. `closest('input')` says no to that click, and the toggle would then happen
   * twice — once here, once from the label's own activation.
   *
   * @param event The DOM event; its `currentTarget` is the hit area.
   */
  private isSelectionCheckboxTarget(event: Event): boolean {
    const target = event.target as HTMLElement | null;
    return !!target?.closest('.tn-table__checkbox');
  }

  /**
   * Click on the hit area around a select-all checkbox, in either layout.
   *
   * @param event The originating click.
   */
  onSelectAllHitAreaClick(event: Event): void {
    if (!this.canSelectAll()) { return; }
    if (this.isSelectionCheckboxTarget(event)) { return; }
    this.toggleSelectAll();
  }

  /**
   * Enter on the select-all checkbox.
   *
   * A native checkbox answers to Space and not to Enter, and the `<th>` this replaced
   * handled both. Bound on the header's checkbox only, which is where that behaviour
   * existed — card mode's select-all never had it.
   *
   * @param event The originating keydown; typed as `Event` because Angular types
   *   `$event` that way for the `keydown.enter` pseudo-event.
   */
  onSelectAllEnter(event: Event): void {
    // Enter inside a form submits it, and this control is often inside one.
    event.preventDefault();
    if (!this.canSelectAll()) { return; }
    this.toggleSelectAll();
  }

  /**
   * Click on the hit area around a row's selection checkbox, in either layout.
   *
   * Propagation stops whichever path activates the checkbox: a row is clickable and a
   * card is activatable, and selecting is not activating.
   *
   * @param event The originating click.
   * @param row The row the cell or card belongs to.
   */
  onRowSelectHitAreaClick(event: Event, row: T): void {
    event.stopPropagation();
    if (this.isSelectionCheckboxTarget(event)) { return; }
    this.toggleRowSelection(row);
  }

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
   * `cardPriority` (ties keep `displayedColumns` order). Excludes the title column
   * and any `cardHidden` columns.
   */
  cardFieldColumns = computed<string[]>(() => {
    const title = this.cardTitleColumn();
    const fields = this.displayedColumns()
      .map((name, index) => ({ name, index }))
      .filter(({ name }) => name !== title && !this.getColumnDef(name)?.cardHidden());
    fields.sort((a, b) => {
      const pa = this.getColumnDef(a.name)?.cardPriority() ?? 0;
      const pb = this.getColumnDef(b.name)?.cardPriority() ?? 0;
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

  /**
   * Displayed columns that are sortable — populates the card-mode sort menu.
   *
   * `cardHidden` columns are excluded, because this menu *is* part of the card layout
   * and `cardHidden` promises the column is "omitted entirely" from it. Offering one
   * here would let a user reorder the cards by a value no card shows, with the
   * direction toggle giving no clue what changed — and such a column often has no
   * readable label either, since `getCardLabel()` falls back to the raw column name
   * when the header lives only in a `tnHeaderCellDef` template.
   *
   * The title column stays eligible: it is excluded from the *fields*, but it is
   * displayed, so sorting by it is meaningful.
   */
  sortableColumns = computed<string[]>(() => {
    const listed = this.displayedColumns().filter((c) => {
      const def = this.getColumnDef(c);
      return !!def?.sortable() && !def.cardHidden();
    });

    // Reconciled against the rendered option set, not against one reason for exclusion.
    // Whatever the active column is, it must have an `<option>`: with none matching, the
    // browser resets the picker to "Unsorted" while the direction toggle still renders an
    // arrow beside it, and picking "Unsorted" fires no `change` — it is already the
    // selected option — so the sort becomes unclearable from card mode. `cardHidden` was
    // only one way in; `sortColumn` is a two-way `model()`, and a dynamic
    // `displayedColumns` (a column-visibility toggle) can drop a sorted column or leave
    // one that was never `sortable()`.
    const active = this.sortColumn();
    return active && !listed.includes(active) ? [...listed, active] : listed;
  });

  /**
   * Whether the active sort column is one the table can actually sort by.
   *
   * `sortableColumns` rescues an active column into the menu so it stays clearable, even
   * when it is `cardHidden`, absent from `displayedColumns`, or never `sortable()`. That
   * escape hatch must not hand card mode a capability table mode refuses: clicking a
   * non-sortable header does nothing, so the direction toggle is hidden — and
   * {@link toggleSortDirection} refuses — for the same column.
   */
  protected readonly canSortActiveColumn = computed<boolean>(() => {
    const column = this.sortColumn();
    return !!column && !!this.getColumnDef(column)?.sortable();
  });

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
    // Guarded, not just hidden: the control is gone from the template for a non-sortable
    // active column, and the method refuses too, so the API can't reorder by a column the
    // table header would ignore.
    if (!this.canSortActiveColumn()) { return; }
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
