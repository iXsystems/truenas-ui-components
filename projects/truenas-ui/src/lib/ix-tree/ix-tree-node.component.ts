import type { CdkTree} from '@angular/cdk/tree';
import { CdkTreeNode, CDK_TREE_NODE_OUTLET_NODE, CdkTreeModule } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';
import type { ElementRef, ChangeDetectorRef} from '@angular/core';
import { Component, ChangeDetectionStrategy, ViewEncapsulation, Optional, Inject } from '@angular/core';
import { IxIconComponent } from '../ix-icon/ix-icon.component';

@Component({
  selector: 'ix-tree-node',
  standalone: true,
  imports: [CommonModule, CdkTreeModule, IxIconComponent],
  exportAs: 'ixTreeNode',
  providers: [
    { provide: CdkTreeNode, useExisting: IxTreeNodeComponent }
  ],
  templateUrl: './ix-tree-node.component.html',
  styleUrl: './ix-tree-node.component.scss',
  host: {
    'class': 'ix-tree-node-wrapper',
    '[attr.aria-level]': 'level + 1',
    '[attr.aria-expanded]': 'isExpandable ? isExpanded : null',
    'role': 'treeitem'
  },
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IxTreeNodeComponent<T, K = T> extends CdkTreeNode<T, K> {
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
    return this._tree?.treeControl?.getLevel ? this._tree.treeControl.getLevel(this.data) : 0;
  }

  /** Whether the tree node is expandable */
  override get isExpandable(): boolean {
    return this._tree?.treeControl?.isExpandable ? this._tree.treeControl.isExpandable(this.data) : false;
  }

  /** Whether the tree node is expanded */
  override get isExpanded(): boolean {
    return this._tree?.treeControl ? this._tree.treeControl.isExpanded(this.data) : false;
  }
}