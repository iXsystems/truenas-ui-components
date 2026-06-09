import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  InjectionToken,
  type Signal,
  computed,
  effect,
  inject,
  input,
  isSignal,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Observable, Subscription } from 'rxjs';
import { TnIconButtonComponent } from '../icon-button/icon-button.component';
import { TnSelectComponent, type TnSelectOption } from '../select/select.component';
import { TnTestIdDirective, scopeTestId } from '../test-id';

/**
 * Default labels rendered inside `tn-table-pager`. Consumers can override any
 * subset of these at the app root by providing a value for the
 * `TN_TABLE_PAGER_LABELS` token — typically wired up to an i18n service so the
 * pager picks up translated copy without each call site having to bind six
 * label inputs. Inputs on `<tn-table-pager>` still win when explicitly set.
 */
export interface TnTablePagerLabels {
  itemsPerPage: string;
  of: string;
  firstPage: string;
  previousPage: string;
  nextPage: string;
  lastPage: string;
  /** Accessible label applied to the pager's `navigation` landmark. */
  tablePagination: string;
}

/** English defaults used when no `TN_TABLE_PAGER_LABELS` provider is registered. */
export const TN_TABLE_PAGER_DEFAULT_LABELS: TnTablePagerLabels = {
  itemsPerPage: 'Items per page',
  of: 'of',
  firstPage: 'First page',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  lastPage: 'Last page',
  tablePagination: 'Table pagination',
};

/**
 * DI token for app-wide default labels. Provide either a static object or a
 * `Signal<TnTablePagerLabels>` — the latter lets the pager react to language
 * changes when the consumer wires it up to an i18n service.
 *
 * Explicit input bindings on `<tn-table-pager>` still win over these defaults.
 */
export const TN_TABLE_PAGER_LABELS = new InjectionToken<TnTablePagerLabels | Signal<TnTablePagerLabels>>(
  'TN_TABLE_PAGER_LABELS',
  { providedIn: 'root', factory: () => TN_TABLE_PAGER_DEFAULT_LABELS },
);

/** Pagination state shared between `tn-table-pager` and an arbitrary data layer. */
export interface TnTablePagination {
  pageNumber: number | null;
  pageSize: number | null;
}

/**
 * Minimal contract a data layer must implement to be driven by `tn-table-pager`
 * via the `dataProvider` input. Designed to match the shape of NAS's
 * `ix-table` `DataProvider<T>` so existing wrappers can be removed — but the
 * library itself only depends on this slim interface, not on any consumer code.
 */
export interface TnTableDataProvider {
  /** Total number of rows the data layer is aware of, across all pages. */
  totalRows: number;
  /** The data layer's current pagination state. */
  pagination: TnTablePagination;
  /**
   * Emits whenever the data layer's state changes in a way the pager should
   * react to. The emitted value itself isn't read — it's purely a "something
   * changed, re-read me" notification.
   *
   * **Implementations must emit on**:
   *   - page-number changes (the canonical case),
   *   - page-size changes the data layer applies on its own, and
   *   - **`totalRows` changes** (e.g. after a filter/refresh).
   *
   * The pager reads `totalRows` imperatively inside its sync handler, so a
   * provider that only emits on `pageNumber` won't surface row-count updates
   * to the displayed range.
   *
   * Any stream type (`Subject`, `BehaviorSubject`, `ReplaySubject`, …) works —
   * the pager guards against feedback loops by remembering the last pagination
   * it pushed and treating a matching emission as its own echo. Replay
   * semantics are therefore harmless but not required.
   */
  currentPage$: Observable<unknown>;
  /** Pushes new pagination to the data layer; typically triggers a data refresh. */
  setPagination(pagination: TnTablePagination): void;
}

/**
 * Pagination control for the `tn-table` (or any list view that paginates).
 *
 * Works in two modes:
 *
 * 1. **Dumb mode** — bind `[currentPage]`, `[pageSize]`, `[totalItems]` and listen
 *    to `pageChange` / `pageSizeChange`. The component owns no provider state.
 * 2. **Data-provider mode** — bind `[dataProvider]` and the component drives
 *    `setPagination()` on the provider, mirrors `totalRows`, and reacts to
 *    `currentPage$` changes (with an internal guard against feedback loops).
 *
 * @example Dumb mode
 * ```html
 * <tn-table-pager
 *   [(currentPage)]="page"
 *   [(pageSize)]="size"
 *   [totalItems]="total()"
 *   (pageChange)="loadPage($event)" />
 * ```
 *
 * @example Data-provider mode (replaces the typical ix-table-pager wrapper)
 * ```html
 * <tn-table-pager
 *   [dataProvider]="dataProvider()"
 *   [pageSize]="dataProvider().pagination.pageSize ?? 50"
 *   [currentPage]="dataProvider().pagination.pageNumber ?? 1"
 *   [itemsPerPageLabel]="'Items per page' | translate" />
 * ```
 */
@Component({
  selector: 'tn-table-pager',
  standalone: true,
  imports: [FormsModule, TnIconButtonComponent, TnSelectComponent, TnTestIdDirective],
  templateUrl: './table-pager.component.html',
  styleUrls: ['./table-pager.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'tn-table-pager',
    'role': 'navigation',
    '[attr.aria-label]': 'resolvedTablePaginationLabel()',
  },
  hostDirectives: [{ directive: TnTestIdDirective, inputs: ['tnTestId: testId'] }],
})
export class TnTablePagerComponent {
  private destroyRef = inject(DestroyRef);

  // The pager's `testId` (applied to the host via hostDirectives) also scopes
  // each child control, so multiple pagers on one page don't collide on
  // `select-page-size` / `button-first-page`. With a base of `storage` the
  // children become `select-storage-page-size`, `button-storage-first-page`,
  // etc.; with no base they stay `select-page-size` / `button-first-page`.
  private readonly testIdDirective = inject(TnTestIdDirective);

  /**
   * Build a child control's test-id base by joining the pager's `testId` with
   * `suffix` into a single string (kebab-joined). Returning a string keeps it
   * assignable to both `tn-select`'s `string` testId and `tn-icon-button`'s
   * `TnTestIdValue` testId.
   */
  protected childTestId(suffix: string): string {
    return scopeTestId(this.testIdDirective.testId(), suffix)
      .filter((part): part is string | number => part !== null && part !== undefined && part !== '')
      .join('-');
  }

  /**
   * Normalize the injected token into a Signal so consumers can supply either
   * a plain object or a reactive signal (e.g. derived from a TranslateService's
   * onLangChange) and the pager re-renders when labels change.
   */
  private readonly defaultLabels: Signal<TnTablePagerLabels>;

  /** 1-based index of the currently displayed page. */
  currentPage = model<number>(1);

  /** Number of items per page. */
  pageSize = model<number>(50);

  /** Selectable page-size values rendered in the dropdown. */
  pageSizeOptions = input<number[]>([10, 20, 50, 100]);

  /**
   * Total item count across all pages — drives `totalPages` and the range
   * labels. Ignored when `dataProvider` is set (the provider's `totalRows`
   * wins, so consumers don't have to keep both in sync).
   */
  totalItems = input<number>(0);

  /**
   * Optional data-provider integration. When supplied, the pager initializes
   * the provider's pagination on the first effect run, mirrors `totalRows`
   * into the displayed total, and listens to `currentPage$` to sync external
   * page changes. Page/size changes from user input are pushed back via
   * `setPagination()`.
   */
  dataProvider = input<TnTableDataProvider | undefined>(undefined);

  /**
   * Label inputs are nullable on purpose: the template reads the resolved
   * `*Label` computed signals below, which fall back to the DI-provided default
   * (a signal — so language changes propagate live). An explicit input binding
   * always wins.
   */
  itemsPerPageLabel = input<string | undefined>(undefined);
  ofLabel = input<string | undefined>(undefined);
  firstPageLabel = input<string | undefined>(undefined);
  previousPageLabel = input<string | undefined>(undefined);
  nextPageLabel = input<string | undefined>(undefined);
  lastPageLabel = input<string | undefined>(undefined);
  tablePaginationLabel = input<string | undefined>(undefined);

  /** Resolved labels: explicit input takes precedence over the DI default. */
  protected resolvedItemsPerPageLabel = computed(() => this.itemsPerPageLabel() ?? this.defaultLabels().itemsPerPage);
  protected resolvedOfLabel = computed(() => this.ofLabel() ?? this.defaultLabels().of);
  protected resolvedFirstPageLabel = computed(() => this.firstPageLabel() ?? this.defaultLabels().firstPage);
  protected resolvedPreviousPageLabel = computed(() => this.previousPageLabel() ?? this.defaultLabels().previousPage);
  protected resolvedNextPageLabel = computed(() => this.nextPageLabel() ?? this.defaultLabels().nextPage);
  protected resolvedLastPageLabel = computed(() => this.lastPageLabel() ?? this.defaultLabels().lastPage);
  protected resolvedTablePaginationLabel = computed(
    () => this.tablePaginationLabel() ?? this.defaultLabels().tablePagination,
  );

  /** Emits the new 1-based page number whenever the user navigates. */
  pageChange = output<number>();

  /** Emits the new page-size value when the dropdown changes. */
  pageSizeChange = output<number>();

  /**
   * Total items reported by the data provider (when one is bound). Falls back
   * to `totalItems` input otherwise — see `effectiveTotalItems`.
   */
  private providerTotalItems = signal(0);
  // The fields below are intentionally plain mutable state, not signals: they
  // back the provider binding's imperative lifecycle (current ref, current
  // subscription, last-pushed echo guard) and are only ever written from
  // inside the bind effect or the syncFromProvider/pushToProvider helpers.
  // Reading them never needs to participate in the reactive graph — exposing
  // them as signals would invite spurious re-evaluation without buying us
  // anything.
  /** The provider reference we're currently bound to (used to detect swaps). */
  private currentProvider: TnTableDataProvider | null = null;
  /** Subscription to the current provider's `currentPage$` — torn down on swap. */
  private providerSub: Subscription | null = null;
  /**
   * Last pagination value we pushed to the provider. Used to recognize the
   * provider's resulting emission as our own echo and break the feedback loop
   * (setPagination → provider emits → syncFromProvider → setPagination …)
   * regardless of whether the provider emits synchronously or asynchronously,
   * and regardless of whether its stream replays on subscribe.
   */
  private lastPushedPagination: TnTablePagination | null = null;

  protected effectiveTotalItems = computed(() =>
    this.dataProvider() ? this.providerTotalItems() : this.totalItems(),
  );

  protected totalPages = computed(() => {
    const size = this.pageSize();
    if (size <= 0) { return 0; }
    return Math.ceil(this.effectiveTotalItems() / size);
  });

  protected firstItemOnPage = computed(() => {
    if (this.effectiveTotalItems() === 0) { return 0; }
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  protected lastItemOnPage = computed(() => {
    const last = this.currentPage() * this.pageSize();
    return Math.min(last, this.effectiveTotalItems());
  });

  protected isFirstPageDisabled = computed(() => this.currentPage() <= 1);
  protected isLastPageDisabled = computed(() => {
    const total = this.totalPages();
    return total === 0 || this.currentPage() >= total;
  });

  protected pageSizeSelectOptions = computed<TnSelectOption<number>[]>(() =>
    this.pageSizeOptions().map((value) => ({ value, label: String(value) })),
  );

  constructor() {
    const provided = inject(TN_TABLE_PAGER_LABELS);
    this.defaultLabels = isSignal(provided) ? provided : signal(provided).asReadonly();

    // Re-bind when the dataProvider reference changes (including swap to a
    // different instance or clearing back to undefined). `untracked` keeps the
    // provider's imperative reads out of the reactive graph so this effect only
    // re-runs when the provider reference itself changes.
    this.destroyRef.onDestroy(() => this.providerSub?.unsubscribe());
    effect(() => {
      const provider = this.dataProvider() ?? null;
      if (provider === this.currentProvider) { return; }

      // Tear down any previous binding before attaching to the new provider so
      // a swap doesn't leave the old subscription running against destroyRef.
      this.providerSub?.unsubscribe();
      this.providerSub = null;
      this.lastPushedPagination = null;
      this.currentProvider = provider;

      if (!provider) {
        this.providerTotalItems.set(0);
        return;
      }

      untracked(() => {
        this.pushToProvider();
        this.providerTotalItems.set(provider.totalRows);
      });
      // No skip() here: if currentPage$ replays (BehaviorSubject), the replay
      // value matches what pushToProvider() just recorded in
      // lastPushedPagination, so syncFromProvider treats it as our own echo
      // and short-circuits. A plain Subject (no replay) still gets every real
      // emission — earlier we used skip(1), which silently dropped the first
      // real emission for non-replaying streams.
      this.providerSub = provider.currentPage$.subscribe(() => this.syncFromProvider());
    });
  }

  private syncFromProvider(): void {
    const provider = this.dataProvider();
    if (!provider) { return; }

    this.providerTotalItems.set(provider.totalRows);

    const p = provider.pagination;
    const isEcho = this.lastPushedPagination !== null
      && p.pageNumber === this.lastPushedPagination.pageNumber
      && p.pageSize === this.lastPushedPagination.pageSize;

    if (!isEcho) {
      const providerPage = p.pageNumber;
      if (providerPage !== null && providerPage !== this.currentPage()) {
        this.currentPage.set(providerPage);
        return;
      }
    }

    // Whether or not this was an echo, an updated totalRows can leave us on an
    // out-of-range page — reset, emit pageChange (so consumers see the auto-
    // correction symmetrically with user-initiated navigation), and push the
    // corrected pagination back.
    if (this.currentPage() > this.totalPages() && this.currentPage() !== 1) {
      this.currentPage.set(1);
      this.pageChange.emit(1);
      this.pushToProvider();
    }
  }

  /**
   * Public navigation API: jump to a specific 1-based page. Used both by the
   * template (first/last buttons) and by consumers who want to drive the pager
   * programmatically. Out-of-range values and no-op transitions are silently
   * ignored. Sibling helpers `previousPage` / `nextPage` are template-only and
   * therefore `protected` — `goToPage` is intentionally part of the public API.
   */
  goToPage(pageNumber: number): void {
    const total = this.totalPages();
    if (pageNumber < 1 || (total > 0 && pageNumber > total)) { return; }
    if (pageNumber === this.currentPage()) { return; }
    this.currentPage.set(pageNumber);
    this.pageChange.emit(pageNumber);
    this.pushToProvider();
  }

  protected previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  protected nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  protected onPageSizeChange(value: number): void {
    if (value === this.pageSize()) { return; }
    this.pageSize.set(value);
    this.pageSizeChange.emit(value);
    // Resetting to page 1 is a UX expectation when the page size changes —
    // otherwise the user might land on an out-of-range page.
    this.currentPage.set(1);
    this.pageChange.emit(1);
    this.pushToProvider();
  }

  /** Forwards the current page/size to the data provider, if one is bound. */
  private pushToProvider(): void {
    const provider = this.dataProvider();
    if (!provider) { return; }
    // Recording the value before pushing lets syncFromProvider recognize the
    // resulting emission as our own echo (independent of whether the provider
    // emits synchronously from setPagination).
    const pagination: TnTablePagination = {
      pageNumber: this.currentPage(),
      pageSize: this.pageSize(),
    };
    this.lastPushedPagination = pagination;
    provider.setPagination(pagination);
  }
}
