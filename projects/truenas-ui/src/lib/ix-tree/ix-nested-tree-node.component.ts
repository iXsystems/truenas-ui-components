import type { CdkTree} from '@angular/cdk/tree';
import { CdkNestedTreeNode, CdkTreeNode, CDK_TREE_NODE_OUTLET_NODE, CdkTreeModule } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';
import type { ElementRef, ChangeDetectorRef} from '@angular/core';
import { Component, ChangeDetectionStrategy, ViewEncapsulation, Optional, Inject } from '@angular/core';
import { IxTreeNodeOutletDirective } from './ix-tree-node-outlet.directive';
import { IxIconComponent } from '../ix-icon/ix-icon.component';

@Component({
  selector: 'ix-nested-tree-node',
  standalone: true,
  imports: [CommonModule, CdkTreeModule, IxIconComponent, IxTreeNodeOutletDirective],
  exportAs: 'ixNestedTreeNode',
  providers: [
    { provide: CdkNestedTreeNode, useExisting: IxNestedTreeNodeComponent },
    { provide: CdkTreeNode, useExisting: IxNestedTreeNodeComponent }
  ],
  templateUrl: './ix-nested-tree-node.component.html',
  styleUrl: './ix-nested-tree-node.component.scss',
  host: {
    'class': 'ix-nested-tree-node-wrapper',
    '[attr.aria-level]': 'level + 1',
    '[attr.aria-expanded]': 'isExpandable ? isExpanded : null',
    'role': 'treeitem'
  },
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IxNestedTreeNodeComponent<T, K = T> extends CdkNestedTreeNode<T, K> {
  constructor(
    elementRef: ElementRef<HTMLElement>,
    @Optional() tree: CdkTree<T, K>,
    @Optional() @Inject(CDK_TREE_NODE_OUTLET_NODE) data?: T,
    @Optional() changeDetectorRef?: ChangeDetectorRef
  ) {
    super(elementRef, tree, data, changeDetectorRef);
  }

  /** The tree node's level in the tree */
  override get level(): number {
    if (this._tree?.treeControl?.getLevel) {
      // Legacy treeControl approach
      return this._tree.treeControl.getLevel(this.data);
    } else if (this._tree && 'getLevel' in this._tree && typeof (this._tree as any).getLevel === 'function') {
      // Modern childrenAccessor approach - use tree's getLevel method
      return (this._tree as any).getLevel(this.data);
    }
    return 0;
  }

  /** Whether the tree node is expandable */
  override get isExpandable(): boolean {
    if (this._tree?.treeControl?.isExpandable) {
      // Legacy treeControl approach
      return this._tree.treeControl.isExpandable(this.data);
    } else if (this._tree && 'childrenAccessor' in this._tree && (this._tree as any).childrenAccessor) {
      // Modern childrenAccessor approach
      const childrenAccessor = (this._tree as any).childrenAccessor;
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
    } else if (this._tree && 'isExpanded' in this._tree && typeof (this._tree as any).isExpanded === 'function') {
      // Modern childrenAccessor approach - use tree's isExpanded method
      return (this._tree as any).isExpanded(this.data);
    }
    return false;
  }
}
