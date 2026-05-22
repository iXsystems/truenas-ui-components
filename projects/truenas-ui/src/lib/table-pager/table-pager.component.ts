import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  InjectionToken,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import type { Observable } from 'rxjs';
import { skip } from 'rxjs/operators';
import { TnIconButtonComponent } from '../icon-button/icon-button.component';
import { TnSelectComponent, type TnSelectOption } from '../select/select.component';
import { TnTestIdDirective } from '../test-id';

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
}

/** English defaults used when no `TN_TABLE_PAGER_LABELS` provider is registered. */
export const TN_TABLE_PAGER_DEFAULT_LABELS: TnTablePagerLabels = {
  itemsPerPage: 'Items per page',
  of: 'of',
  firstPage: 'First page',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  lastPage: 'Last page',
};

/**
 * DI token for app-wide default labels. Provide it at the root injector to
 * supply translated strings — `tn-table-pager` reads from it once and uses each
 * value as the default for the corresponding label input.
 */
export const TN_TABLE_PAGER_LABELS = new InjectionToken<TnTablePagerLabels>(
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
   * Emits whenever the data layer's page (or related state) changes. The pager
   * uses this as a "something on the provider changed" notification —
   * the emitted value itself isn't read.
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
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'tn-table-pager',
  },
  hostDirectives: [{ directive: TnTestIdDirective, inputs: ['tnTestId: testId'] }],
})
export class TnTablePagerComponent {
  private destroyRef = inject(DestroyRef);
  private defaultLabels = inject(TN_TABLE_PAGER_LABELS);

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

  /** Localized label rendered next to the page-size dropdown. */
  itemsPerPageLabel = input<string>(this.defaultLabels.itemsPerPage);

  /** Localized "of" connector between the range and the total. */
  ofLabel = input<string>(this.defaultLabels.of);

  /** Localized aria-labels for the four nav buttons. */
  firstPageLabel = input<string>(this.defaultLabels.firstPage);
  previousPageLabel = input<string>(this.defaultLabels.previousPage);
  nextPageLabel = input<string>(this.defaultLabels.nextPage);
  lastPageLabel = input<string>(this.defaultLabels.lastPage);

  /** Emits the new 1-based page number whenever the user navigates. */
  pageChange = output<number>();

  /** Emits the new page-size value when the dropdown changes. */
  pageSizeChange = output<number>();

  /**
   * Total items reported by the data provider (when one is bound). Falls back
   * to `totalItems` input otherwise — see `effectiveTotalItems`.
   */
  private providerTotalItems = signal(0);
  /** Tracks whether the provider has been initialized yet (one-time). */
  private providerInitialized = false;
  /**
   * Guard against the feedback loop:
   * setPagination → provider emits → syncFromProvider → setPagination …
   */
  private syncingFromProvider = false;

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
    // When a dataProvider becomes available, push the current pagination to it
    // once and subscribe to its updates. `untracked` keeps the provider's
    // imperative reads out of the reactive graph so this effect only re-runs
    // when the provider reference itself changes.
    effect(() => {
      const provider = this.dataProvider();
      if (!provider || this.providerInitialized) { return; }
      this.providerInitialized = true;
      untracked(() => {
        provider.setPagination({
          pageNumber: this.currentPage(),
          pageSize: this.pageSize(),
        });
        this.providerTotalItems.set(provider.totalRows);
      });
      // Skip the BehaviorSubject's replay (which carries the value pushed by
      // setPagination above) — otherwise we'd immediately re-sync ourselves.
      provider.currentPage$
        .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.syncFromProvider());
    });
  }

  private syncFromProvider(): void {
    if (this.syncingFromProvider) { return; }
    const provider = this.dataProvider();
    if (!provider) { return; }

    this.providerTotalItems.set(provider.totalRows);

    const providerPage = provider.pagination.pageNumber;
    if (providerPage !== null && providerPage !== this.currentPage()) {
      this.currentPage.set(providerPage);
      return;
    }

    if (this.currentPage() > this.totalPages() && this.currentPage() !== 1) {
      // Total just dropped below the current page — reset to page 1 and push
      // that back to the provider, guarding against the resulting emission.
      this.syncingFromProvider = true;
      this.currentPage.set(1);
      provider.setPagination({ pageNumber: 1, pageSize: this.pageSize() });
      this.syncingFromProvider = false;
    }
  }

  goToPage(pageNumber: number): void {
    const total = this.totalPages();
    if (pageNumber < 1 || (total > 0 && pageNumber > total)) { return; }
    if (pageNumber === this.currentPage()) { return; }
    this.currentPage.set(pageNumber);
    this.pageChange.emit(pageNumber);
    this.pushToProvider();
  }

  previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  onPageSizeChange(value: number): void {
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
    // Use the syncing guard so the provider's resulting currentPage$ emission
    // doesn't bounce back through syncFromProvider().
    this.syncingFromProvider = true;
    provider.setPagination({
      pageNumber: this.currentPage(),
      pageSize: this.pageSize(),
    });
    this.syncingFromProvider = false;
  }
}
