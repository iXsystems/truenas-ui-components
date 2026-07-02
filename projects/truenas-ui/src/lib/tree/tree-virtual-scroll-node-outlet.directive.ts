import type { CdkTreeNodeOutletContext } from '@angular/cdk/tree';
import { CdkTreeNode } from '@angular/cdk/tree';
import type { OnChanges, SimpleChange, SimpleChanges, EmbeddedViewRef} from '@angular/core';
import {
  Directive, ViewContainerRef, input, inject,
} from '@angular/core';
import type { TnTreeVirtualNodeData } from './tree-virtual-node-data.interface';

/**
 * Renders a single virtual tree row.
 *
 * `cdk-virtual-scroll-viewport` materialises this outlet for each row that scrolls
 * into view; the outlet instantiates the node's template with its context and
 * (re)binds `CdkTreeNode.mostRecentTreeNode.data`, so the row behaves exactly as a
 * node rendered directly by the CDK tree. When the same DOM view is recycled for a
 * different node (virtual scrolling reuses views), only the context is patched.
 */
@Directive({
  selector: '[tnTreeVirtualScrollNodeOutlet]',
  standalone: true,
})
export class TnTreeVirtualScrollNodeOutletDirective<T> implements OnChanges {
  private _viewContainerRef = inject(ViewContainerRef);

  private _viewRef: EmbeddedViewRef<unknown> | null = null;
  readonly data = input.required<TnTreeVirtualNodeData<T>>();

  ngOnChanges(changes: SimpleChanges): void {
    const ctxChange = changes['data'];
    const recreateView = ctxChange ? this.hasContextShapeChanged(ctxChange) : false;

    if (recreateView) {
      const viewContainerRef = this._viewContainerRef;

      if (this._viewRef) {
        viewContainerRef.remove(viewContainerRef.indexOf(this._viewRef));
      }

      this._viewRef = this.data()
        ? viewContainerRef.createEmbeddedView(this.data().nodeDef.template, this.data().context)
        : null;

      if (CdkTreeNode.mostRecentTreeNode && this._viewRef) {
        CdkTreeNode.mostRecentTreeNode.data = this.data().data;
      }
    } else if (this._viewRef && this.data().context) {
      this.updateExistingContext(this.data().context);
    }
  }

  private hasContextShapeChanged(ctxChange: SimpleChange): boolean {
    const prevValue = ctxChange.previousValue as TnTreeVirtualNodeData<T> | undefined;
    const currValue = ctxChange.currentValue as TnTreeVirtualNodeData<T> | undefined;
    const prevCtxKeys = Object.keys(prevValue || {});
    const currCtxKeys = Object.keys(currValue || {});

    if (prevCtxKeys.length === currCtxKeys.length) {
      for (const propName of currCtxKeys) {
        if (!prevCtxKeys.includes(propName)) {
          return true;
        }
      }
      return prevValue?.data !== currValue?.data;
    }
    return true;
  }

  private updateExistingContext(ctx: CdkTreeNodeOutletContext<T>): void {
    if (!this._viewRef) {
      return;
    }

    for (const propName of Object.keys(ctx)) {
      (this._viewRef.context as Record<string, unknown>)[propName]
        = (this.data().context as unknown as Record<string, unknown>)[propName];
    }
  }
}
