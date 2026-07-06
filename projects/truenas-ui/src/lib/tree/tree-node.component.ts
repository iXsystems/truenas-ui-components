import { CdkTree, CdkTreeNode, CDK_TREE_NODE_OUTLET_NODE, CdkTreeModule } from '@angular/cdk/tree';
import { ElementRef, ChangeDetectorRef, Component, ChangeDetectionStrategy, ViewEncapsulation, inject } from '@angular/core';
import { TnIconComponent } from '../icon/icon.component';
import { TnTestIdDirective } from '../test-id';

@Component({
  selector: 'tn-tree-node',
  standalone: true,
  imports: [CdkTreeModule, TnIconComponent],
  exportAs: 'tnTreeNode',
  providers: [
    { provide: CdkTreeNode, useExisting: TnTreeNodeComponent }
  ],
  templateUrl: './tree-node.component.html',
  styleUrl: './tree-node.component.scss',
  hostDirectives: [{ directive: TnTestIdDirective, inputs: ['tnTestId: testId'] }],
  // The treeitem role and its aria state live here on the host wrapper (not the inner
  // `.tn-tree-node`) so AT sees a single treeitem per node. `aria-selected` is intentionally
  // omitted: neither tn-tree nor the virtual variant manages selection, and a blanket
  // `aria-selected="false"` would make AT announce every node as "not selected" as if
  // selection were a feature. A consumer that adds selection should set it explicitly.
  host: {
    'class': 'tn-tree-node-wrapper',
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