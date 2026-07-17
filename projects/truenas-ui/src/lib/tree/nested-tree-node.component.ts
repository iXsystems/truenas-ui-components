import { CdkTree } from '@angular/cdk/tree';
import { CdkNestedTreeNode, CdkTreeNode, CDK_TREE_NODE_OUTLET_NODE } from '@angular/cdk/tree';
import { ElementRef, ChangeDetectorRef, Component, ChangeDetectionStrategy, DestroyRef, ViewEncapsulation, inject, input, booleanAttribute } from '@angular/core';
import { TnIconComponent } from '../icon/icon.component';
import { TnTestIdDirective } from '../test-id';
import type { TnTestIdValue } from '../test-id';

@Component({
  selector: 'tn-nested-tree-node',
  standalone: true,
  imports: [TnIconComponent, TnTestIdDirective],
  exportAs: 'tnNestedTreeNode',
  providers: [
    { provide: CdkNestedTreeNode, useExisting: TnNestedTreeNodeComponent },
    { provide: CdkTreeNode, useExisting: TnNestedTreeNodeComponent }
  ],
  templateUrl: './nested-tree-node.component.html',
  styleUrl: './nested-tree-node.component.scss',
  hostDirectives: [{ directive: TnTestIdDirective, inputs: ['tnTestId: testId'] }],
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
  /**
   * Accessible label for the built-in toggle button. Pass a translated string;
   * defaults to the previous hardcoded value.
   */
  readonly toggleAriaLabel = input('Toggle node');

  /** Semantic test-id base applied to the built-in toggle button (`button-` prefixed). */
  readonly toggleTestId = input<TnTestIdValue>();

  /**
   * Suppresses the built-in toggle button (and its alignment spacer) so the
   * consumer can render a fully custom toggle in the projected content.
   */
  readonly hideToggle = input(false, { transform: booleanAttribute });

  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private destroyed = false;

  constructor() {
    super(
      inject(ElementRef<HTMLElement>),
      inject(CdkTree, { optional: true }),
      inject(CDK_TREE_NODE_OUTLET_NODE, { optional: true }),
      inject(ChangeDetectorRef, { optional: true })
    );
    inject(DestroyRef).onDestroy(() => this.destroyed = true);
  }

  /** The tree node's level in the tree */
  override get level(): number {
    if (this._tree?.treeControl?.getLevel) {
      // Legacy treeControl approach
      return this._tree.treeControl.getLevel(this.data);
    }
    // CdkTreeNode's own getter: levelAccessor when available, else the parent
    // node's aria-level from the DOM — which is what makes nested trees (whose
    // NestedTreeControl has no getLevel) report correct levels.
    return this._tree ? super.level : 0;
  }

  /** Whether the tree node is expandable */
  override get isExpandable(): boolean {
    if (this._tree?.treeControl?.isExpandable) {
      // Legacy treeControl approach
      return this._tree.treeControl.isExpandable(this.data);
    } else if (this._tree?.treeControl) {
      // NestedTreeControl leaves `isExpandable` undefined unless configured —
      // fall back to its getChildren (synchronous arrays only).
      const children = this._tree.treeControl.getChildren?.(this.data);
      return Array.isArray(children) && children.length > 0;
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

  /**
   * CDK inserts child node views synchronously from `ngAfterContentInit`, i.e.
   * mid-change-detection. Because the outlet here lives in PROJECTED content
   * whose view container has already been traversed for the current pass, the
   * new views would miss their first check and trip dev-mode NG0100. Defer the
   * insertion to a microtask so the views are created outside change detection
   * and get a normal first check on the pass that `markForCheck` schedules.
   */
  protected override updateChildrenNodes(children?: T[]): void {
    queueMicrotask(() => {
      if (this.destroyed) {
        return;
      }
      super.updateChildrenNodes(children);
      this.changeDetectorRef.markForCheck();
    });
  }

  /**
   * Toggles the node; with the Alt key held, toggles the node together with all
   * of its descendants. Replaces `cdkTreeNodeToggle` on the built-in button so
   * the Alt behavior is deterministic (a stacked template listener would run in
   * an unspecified order relative to the CDK toggle's own click handler).
   */
  protected toggleNode(event: Event): void {
    if (!this._tree) {
      return;
    }
    if ('altKey' in event && (event as MouseEvent | KeyboardEvent).altKey) {
      this._tree.toggleDescendants(this.data);
    } else {
      this._tree.toggle(this.data);
    }
    this._tree._keyManager?.focusItem(this);
  }
}
