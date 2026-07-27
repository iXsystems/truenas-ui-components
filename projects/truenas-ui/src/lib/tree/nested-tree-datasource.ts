import { DataSource } from '@angular/cdk/collections';
import type { CollectionViewer } from '@angular/cdk/collections';
import type { Observable } from 'rxjs';
import { BehaviorSubject, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';

/**
 * Data source for nested trees (`tn-nested-tree-node`).
 *
 * Optionally supports client-side filtering and sorting: set `filterPredicate`
 * (and call `filter(query)`) and/or `sortComparer` (applied recursively through
 * `children`). Both are opt-in.
 */
export class TnNestedTreeDataSource<T extends { children?: T[] }> extends DataSource<T> {
  /** When set, `filter(query)` re-renders the tree from `filterPredicate(data, query)`. */
  filterPredicate?: (data: T[], query: string) => T[];

  /**
   * When set, incoming `data` is sorted recursively before rendering.
   *
   * Note: sorting REWRITES `children` arrays on the caller's node objects
   * (a new sorted array is assigned per node). Node object identity is
   * preserved — deliberately, since tree controls track expansion state by
   * node identity — but don't pass an object graph that is shared with code
   * relying on the original child order.
   */
  sortComparer?: (a: T, b: T) => number;

  private filterValue = '';
  private readonly filterChanged$ = new BehaviorSubject<string>('');
  private readonly _data = new BehaviorSubject<T[]>([]);
  private readonly _filteredData = new BehaviorSubject<T[]>([]);

  get data(): T[] {
    return this._data.value;
  }

  set data(value: T[]) {
    this._data.next(this.sortComparer ? this.sort(value) : value);
  }

  constructor(initialData?: T[]) {
    super();

    if (initialData) {
      this.data = initialData;
    }

    this.detectFilterChanges();
  }

  override connect(collectionViewer: CollectionViewer): Observable<T[]> {
    return merge(
      collectionViewer.viewChange,
      this._data,
      this._filteredData,
    ).pipe(
      map(() => (this.filterValue ? this._filteredData.value : this.data)),
    );
  }

  disconnect(): void {}

  /** Filters the tree using `filterPredicate` (debounced). No-op until `filterPredicate` is set. */
  filter(query: string): void {
    this.filterChanged$.next(query);
  }

  /**
   * Deliberately NOT torn down in `disconnect()`: CdkTree disconnects the
   * datasource when the tree is destroyed, but the same instance may be
   * reconnected (e.g. a tree behind an `@if`), and filtering must survive that.
   * The pipeline only references the datasource's own subjects, so it holds no
   * external resources and is collected with the instance.
   */
  private detectFilterChanges(): void {
    this.filterChanged$.pipe(
      filter(() => !!this.filterPredicate),
      debounceTime(200),
      distinctUntilChanged(),
    ).subscribe((changedValue) => {
      if (this.filterValue === changedValue || !this.filterPredicate) {
        return;
      }
      this.filterValue = changedValue;
      this._filteredData.next(this.filterPredicate(this.data, changedValue));
    });
  }

  private sort(value: T[]): T[] {
    return [...value].sort(this.sortComparer).map((item) => {
      if (item.children?.length) {
        item.children = this.sort(item.children);
      }
      return item;
    });
  }
}
