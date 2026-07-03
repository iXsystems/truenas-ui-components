import type { CdkTreeNodeOutletContext, CdkTreeNodeDef } from '@angular/cdk/tree';

/**
 * A single flattened tree node prepared for virtual-scroll rendering.
 *
 * `TnTreeVirtualScrollViewComponent` intercepts CDK's `renderNodeChanges` and,
 * instead of letting the CDK tree insert every visible node into its outlet,
 * wraps each node in this shape so the node can be materialised on demand by the
 * `cdk-virtual-scroll-viewport` (only rows in view are created in the DOM).
 */
export interface TnTreeVirtualNodeData<T> {
  /** The raw data node. */
  data: T;
  /** The outlet context (carries `$implicit`, `level`, etc.) for the node template. */
  context: CdkTreeNodeOutletContext<T>;
  /** The matched node definition whose template renders this row. */
  nodeDef: CdkTreeNodeDef<T>;
  /** 1-based position within the currently-visible node set, for `aria-posinset`. */
  posInSet: number;
  /** Size of the currently-visible node set, for `aria-setsize`. */
  setSize: number;
}
