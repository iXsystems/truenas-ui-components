import { DataSource } from '@angular/cdk/collections';
import { CdkTree, CdkTreeModule } from '@angular/cdk/tree';
import { ChangeDetectorRef, IterableDiffers, ViewContainerRef, Component, ChangeDetectionStrategy, ViewEncapsulation, inject } from '@angular/core';
import type { Observable} from 'rxjs';
import { BehaviorSubject, Subject, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators';
import { TnTestIdDirective } from '../test-id';
import type { TnTreeExpansion } from './tree-expansion.interface';

// Re-export CDK Tree types for convenience
export { FlatTreeControl } from '@angular/cdk/tree';
export { ArrayDataSource } from '@angular/cdk/collections';

/** Flat node with expandable and level information */
export interface TnFlatTreeNode<T = unknown> {
  data: T;
  expandable: boolean;
  level: number;
}

/**
 * Tree flattener to convert normal type of node to node with children & level information.
 */
export class TnTreeFlattener<T, F> {
  constructor(
    public transformFunction: (node: T, level: number) => F,
    public getLevel: (node: F) => number,
    public isExpandable: (node: F) => boolean,
    public getChildren: (node: T) => T[] | null | undefined
  ) {}

  flattenNodes(structuredData: T[]): F[] {
    const resultNodes: F[] = [];
    structuredData.forEach(node => this._flattenNode(node, 0, resultNodes));
    return resultNodes;
  }

  private _flattenNode(node: T, level: number, resultNodes: F[]): void {
    const flatNode = this.transformFunction(node, level);
    resultNodes.push(flatNode);

    if (this.isExpandable(flatNode)) {
      const childrenNodes = this.getChildren(node);
      if (childrenNodes) {
        childrenNodes.forEach(child => this._flattenNode(child, level + 1, resultNodes));
      }
    }
  }
}

/**
 * Data source for flat tree.
 *
 * Optionally supports client-side filtering and sorting: set `filterPredicate`
 * (and call `filter(query)`) and/or `sortComparer`. Both are opt-in; when unset
 * the datasource behaves exactly as before.
 */
export class TnTreeFlatDataSource<T, F> extends DataSource<F> {
  /** When set, `filter(query)` re-renders the tree from `filterPredicate(data, query)`. */
  filterPredicate?: (data: T[], query: string) => T[];

  /** When set, incoming `data` is sorted (top level) before flattening. */
  sortComparer?: (a: T, b: T) => number;

  private _flattenedData = new BehaviorSubject<F[]>([]);
  private _expandedData = new BehaviorSubject<F[]>([]);
  private _data = new BehaviorSubject<T[]>([]);
  private _filteredData = new BehaviorSubject<T[]>([]);
  private filterValue = '';
  private readonly filterChanged$ = new BehaviorSubject<string>('');
  private readonly disconnect$ = new Subject<void>();

  constructor(
    private _treeControl: TnTreeExpansion<F>,
    private _treeFlattener: TnTreeFlattener<T, F>
  ) {
    super();
    this.detectFilterChanges();
  }

  get data() { return this._data.value; }
  set data(value: T[]) {
    this._data.next(this.sortComparer ? [...value].sort(this.sortComparer) : value);
    if (this.filterValue && this.filterPredicate) {
      this._filteredData.next(this.filterPredicate(this.data, this.filterValue));
    }
    this.flattenData();
  }

  /** The currently filtered (unflattened) data; equals `data` until `filter()` is used. */
  get filteredData(): T[] {
    return this._filteredData.value;
  }

  connect(): Observable<F[]> {
    return merge(
      this._treeControl.expansionModel.changed,
      this._flattenedData
    ).pipe(map(() => {
      this._expandedData.next(this._getExpandedNodesWithLevel());
      return this._expandedData.value;
    }));
  }

  disconnect() {
    this.disconnect$.next();
    this.disconnect$.complete();
  }

  /** Filters the tree using `filterPredicate` (debounced). No-op until `filterPredicate` is set. */
  filter(query: string): void {
    this.filterChanged$.next(query);
  }

  private flattenData(): void {
    this._flattenedData.next(this._treeFlattener.flattenNodes(
      this.filterValue ? this._filteredData.value : this.data,
    ));
    this._treeControl.dataNodes = this._flattenedData.value;
  }

  private detectFilterChanges(): void {
    this.filterChanged$.pipe(
      filter(() => !!this.filterPredicate),
      debounceTime(200),
      distinctUntilChanged(),
      takeUntil(this.disconnect$),
    ).subscribe((changedValue) => {
      if (this.filterValue === changedValue || !this.filterPredicate) {
        return;
      }
      this.filterValue = changedValue;
      this._filteredData.next(this.filterPredicate(this.data, changedValue));
      this.flattenData();
    });
  }

  private _getExpandedNodesWithLevel(): F[] {
    const expandedNodes: F[] = [];
    const flatNodes = this._flattenedData.value;

    for (let i = 0; i < flatNodes.length; i++) {
      const node = flatNodes[i];
      expandedNodes.push(node);

      if (!this._treeControl.isExpanded(node)) {
        // Skip children if node is not expanded
        const currentLevel = this._treeFlattener.getLevel(node);
        let j = i + 1;
        while (j < flatNodes.length && this._treeFlattener.getLevel(flatNodes[j]) > currentLevel) {
          j++;
        }
        i = j - 1;
      }
    }

    return expandedNodes;
  }
}

@Component({
  selector: 'tn-tree',
  standalone: true,
  imports: [CdkTreeModule],
  exportAs: 'tnTree',
  providers: [
    { provide: CdkTree, useExisting: TnTreeComponent }
  ],
  templateUrl: './tree.component.html',
  styleUrl: './tree.component.scss',
  hostDirectives: [{ directive: TnTestIdDirective, inputs: ['tnTestId: testId'] }],
  host: {
    'class': 'tn-tree',
    'role': 'tree'
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TnTreeComponent<T, K = T> extends CdkTree<T, K> {
  constructor() {
    super(inject(IterableDiffers), inject(ChangeDetectorRef), inject(ViewContainerRef));
  }
}