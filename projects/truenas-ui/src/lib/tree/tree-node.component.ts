import { CdkTree, CdkTreeNode, CDK_TREE_NODE_OUTLET_NODE, CdkTreeModule } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';
import { ElementRef, ChangeDetectorRef, Component, ChangeDetectionStrategy, ViewEncapsulation, inject } from '@angular/core';
import { TnIconComponent } from '../icon/icon.component';

@Component({
  selector: 'ix-tree-node',
  standalone: true,
  imports: [CommonModule, CdkTreeModule, TnIconComponent],
  exportAs: 'ixTreeNode',
  providers: [
    { provide: CdkTreeNode, useExisting: TnTreeNodeComponent }
  ],
  templateUrl: './tree-node.component.html',
  styleUrl: './tree-node.component.scss',
  host: {
    'class': 'ix-tree-node-wrapper',
    '[attr.aria-level]': 'level + 1',
    '[attr.aria-expanded]': 'isExpandable ? isExpanded : null',
    'role': 'treeitem'
  },
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TnTreeNodeComponent<T, K = T> extends CdkTreeNode<T, K> {
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