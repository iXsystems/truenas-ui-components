import type { CdkTreeNodeOutletContext } from '@angular/cdk/tree';
import { CdkTreeNode } from '@angular/cdk/tree';
import type { DoCheck, OnChanges, SimpleChange, SimpleChanges, EmbeddedViewRef} from '@angular/core';
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
export class TnTreeVirtualScrollNodeOutletDirective<T> implements OnChanges, DoCheck {
  private _viewContainerRef = inject(ViewContainerRef);

  private _viewRef: EmbeddedViewRef<unknown> | null = null;
  readonly data = input.required<TnTreeVirtualNodeData<T>>();

  /**
   * Re-assert the row's aria position every check. The viewport's recycling view
   * repeater can swap the underlying DOM view for a different row without our
   * `ngOnChanges` writing the new `aria-setsize`/`aria-posinset` in a way that
   * survives the swap, so we reconcile the current element against the current data
   * on each change-detection pass (two cheap attribute writes) — self-healing.
   */
  ngDoCheck(): void {
    this.applyAriaPosition();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const dataChange = changes['data'];
    const recreateView = dataChange ? this.shouldRecreateView(dataChange) : false;

    if (recreateView) {
      const viewContainerRef = this._viewContainerRef;

      if (this._viewRef) {
        viewContainerRef.remove(viewContainerRef.indexOf(this._viewRef));
      }

      this._viewRef = this.data()
        ? viewContainerRef.createEmbeddedView(this.data().nodeDef.template, this.data().context)
        : null;

      // Bind the freshly-created CdkTreeNode to this row's data. `mostRecentTreeNode`
      // is a global CDK static set synchronously while `createEmbeddedView` above
      // instantiates the node template. This mirrors CDK's own internal wiring and
      // assumes the node def's template contains exactly one CdkTreeNode; it is
      // fragile under view recycling, hence the shape check that gates recreation.
      if (CdkTreeNode.mostRecentTreeNode && this._viewRef) {
        CdkTreeNode.mostRecentTreeNode.data = this.data().data;
      }
    } else if (this._viewRef && this.data().context) {
      this.updateExistingContext(this.data().context);
    }
  }

  /**
   * Whether the row must be re-instantiated (vs. patched in place). Every wrapper
   * carries the same fixed key set (`data`/`context`/`nodeDef`/`posInSet`/`setSize`),
   * so recreation comes down to whether the raw data node is a different reference —
   * that is what marks a genuinely different row (a missing wrapper also recreates).
   */
  private shouldRecreateView(dataChange: SimpleChange): boolean {
    const prevValue = dataChange.previousValue as TnTreeVirtualNodeData<T> | undefined;
    const currValue = dataChange.currentValue as TnTreeVirtualNodeData<T> | undefined;
    return prevValue?.data !== currValue?.data;
  }

  /** Reflect posinset/setsize onto the row element so screen readers can announce "item N of total". */
  private applyAriaPosition(): void {
    const root = this._viewRef?.rootNodes?.[0] as HTMLElement | undefined;
    const data = this.data();
    if (root?.setAttribute && data) {
      root.setAttribute('aria-setsize', String(data.setSize));
      root.setAttribute('aria-posinset', String(data.posInSet));
    }
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
