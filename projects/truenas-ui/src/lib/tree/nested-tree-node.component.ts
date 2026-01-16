import { CdkTree } from '@angular/cdk/tree';
import { CdkNestedTreeNode, CdkTreeNode, CDK_TREE_NODE_OUTLET_NODE, CdkTreeModule } from '@angular/cdk/tree';

import { ElementRef, ChangeDetectorRef, Component, ChangeDetectionStrategy, ViewEncapsulation, inject } from '@angular/core';
import { TnTreeNodeOutletDirective } from './tree-node-outlet.directive';
import { TnIconComponent } from '../icon/icon.component';

@Component({
  selector: 'tn-nested-tree-node',
  standalone: true,
  imports: [CdkTreeModule, TnIconComponent, TnTreeNodeOutletDirective],
  exportAs: 'tnNestedTreeNode',
  providers: [
    { provide: CdkNestedTreeNode, useExisting: TnNestedTreeNodeComponent },
    { provide: CdkTreeNode, useExisting: TnNestedTreeNodeComponent }
  ],
  templateUrl: './nested-tree-node.component.html',
  styleUrl: './nested-tree-node.component.scss',
  host: {
    'class': 'tn-nested-tree-node-wrapper',
    '[attr.aria-level]': 'level + 1',
    '[attr.aria-expanded]': 'isExpandable ? isExpanded : null',
    'role': 'treeitem'
  },
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TnNestedTreeNodeComponent<T, K = T> extends CdkNestedTreeNode<T, K> {
  constructor() {
    super(
      inject(ElementRef<HTMLElement>),
      inject(CdkTree, { optional: true }),
      inject(CDK_TREE_NODE_OUTLET_NODE, { optional: true }),
      inject(ChangeDetectorRef, { optional: true })
    );
  }

  /** The tree node's level in the tree */
  override get level(): number {
    if (this._tree?.treeControl?.getLevel) {
      // Legacy treeControl approach
      return this._tree.treeControl.getLevel(this.data);
    } else if (this._tree && 'getLevel' in this._tree && typeof (this._tree as { getLevel?: (data: T) => number }).getLevel === 'function') {
      // Modern childrenAccessor approach - use tree's getLevel method
      return (this._tree as { getLevel: (data: T) => number }).getLevel(this.data);
    }
    return 0;
  }

  /** Whether the tree node is expandable */
  override get isExpandable(): boolean {
    if (this._tree?.treeControl?.isExpandable) {
      // Legacy treeControl approach
      return this._tree.treeControl.isExpandable(this.data);
    } else if (this._tree && 'childrenAccessor' in this._tree && (this._tree as { childrenAccessor?: (data: T) => T[] | undefined }).childrenAccessor) {
      // Modern childrenAccessor approach
      const childrenAccessor = (this._tree as { childrenAccessor: (data: T) => T[] | undefined }).childrenAccessor;
      const children = childrenAccessor(this.data);
      // Handle both array and observable results
      if (Array.isArray(children)) {
        return children.length > 0;
      }
      return false; // For now, don't handle Observable case
    }
    return false;
  }

  /** Whether the tree node is expanded */
  override get isExpanded(): boolean {
    if (this._tree?.treeControl) {
      // Legacy treeControl approach
      return this._tree.treeControl.isExpanded(this.data);
    } else if (this._tree && 'isExpanded' in this._tree && typeof (this._tree as { isExpanded?: (data: T) => boolean }).isExpanded === 'function') {
      // Modern childrenAccessor approach - use tree's isExpanded method
      return (this._tree as { isExpanded: (data: T) => boolean }).isExpanded(this.data);
    }
    return false;
  }
}
