import { Component, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef, IterableDiffers, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkTree, CdkTreeModule } from '@angular/cdk/tree';

// Re-export CDK Tree types for convenience
export { FlatTreeControl } from '@angular/cdk/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
export { ArrayDataSource } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';

/** Flat node with expandable and level information */
export interface IxFlatTreeNode<T = any> {
  data: T;
  expandable: boolean;
  level: number;
}

/**
 * Tree flattener to convert normal type of node to node with children & level information.
 */
export class IxTreeFlattener<T, F> {
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
 */
export class IxTreeFlatDataSource<T, F> extends DataSource<F> {
  private _flattenedData = new BehaviorSubject<F[]>([]);
  private _expandedData = new BehaviorSubject<F[]>([]);
  private _data = new BehaviorSubject<T[]>([]);

  constructor(
    private _treeControl: FlatTreeControl<F>,
    private _treeFlattener: IxTreeFlattener<T, F>
  ) {
    super();
  }

  get data() { return this._data.value; }
  set data(value: T[]) {
    this._data.next(value);
    this._flattenedData.next(this._treeFlattener.flattenNodes(this.data));
    this._treeControl.dataNodes = this._flattenedData.value;
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

  disconnect() {}

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
  selector: 'ix-tree',
  standalone: true,
  imports: [CommonModule, CdkTreeModule],
  exportAs: 'ixTree',
  providers: [
    { provide: CdkTree, useExisting: IxTreeComponent }
  ],
  templateUrl: './ix-tree.component.html',
  styleUrl: './ix-tree.component.scss',
  host: {
    'class': 'ix-tree',
    'role': 'tree'
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
})
export class IxTreeComponent<T, K = T> extends CdkTree<T, K> {
  constructor(
    differs: IterableDiffers,
    changeDetectorRef: ChangeDetectorRef,
    viewContainer: ViewContainerRef
  ) {
    super(differs, changeDetectorRef, viewContainer);
  }
}