import { Component, ChangeDetectionStrategy, ViewEncapsulation, ElementRef, ChangeDetectorRef, Optional, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkTreeNode, CdkTreeNodeDef, CdkTree, CDK_TREE_NODE_OUTLET_NODE, CdkTreeModule } from '@angular/cdk/tree';
import { IxIconComponent } from '../ix-icon/ix-icon.component';
import { IxMdiIconService } from '../ix-mdi-icon/ix-mdi-icon.service';

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
export class IxTreeNodeComponent<T, K = T> extends CdkTreeNode<T, K> implements OnInit {
  constructor(
    elementRef: ElementRef<HTMLElement>,
    @Optional() tree: CdkTree<T, K>,
    @Optional() @Inject(CDK_TREE_NODE_OUTLET_NODE) data?: T,
    @Optional() changeDetectorRef?: ChangeDetectorRef,
    @Optional() private mdiIconService?: IxMdiIconService
  ) {
    super(elementRef, tree, data, changeDetectorRef);
  }

  override async ngOnInit(): Promise<void> {
    // Pre-load tree navigation icons
    if (this.mdiIconService) {
      try {
        await Promise.all([
          this.mdiIconService.ensureIconLoaded('chevron-right'),
          this.mdiIconService.ensureIconLoaded('chevron-down')
        ]);
      } catch (error) {
        console.warn('Failed to load tree navigation icons:', error);
      }
    }
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