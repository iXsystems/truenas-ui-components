import {
  CdkVirtualScrollViewport, CdkVirtualScrollableWindow, CdkFixedSizeVirtualScroll, CdkVirtualForOf,
} from '@angular/cdk/scrolling';
import {
  CdkTree, CdkTreeModule, CdkTreeNodeOutletContext,
} from '@angular/cdk/tree';
import { AsyncPipe } from '@angular/common';
import type {
  AfterViewInit,
  TrackByFunction} from '@angular/core';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, IterableDiffers, ViewContainerRef, ViewEncapsulation, booleanAttribute, computed, inject, input, output, viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { animationFrameScheduler, asapScheduler, BehaviorSubject } from 'rxjs';
import type { Subscription } from 'rxjs';
import { auditTime, map } from 'rxjs/operators';
import { TnIconButtonComponent } from '../icon-button/icon-button.component';
import { TnTestIdDirective } from '../test-id';
import type { TnTreeVirtualNodeData } from './tree-virtual-node-data.interface';
import { TnTreeVirtualScrollNodeOutletDirective } from './tree-virtual-scroll-node-outlet.directive';

/** Default fixed row height (px) used by the virtual scroll viewport. */
export const defaultTreeItemSize = 48;

/**
 * Row-count multiplier for the default `maxBufferPx` (how many extra rows of
 * content the viewport renders past the visible area) and for the distance the
 * user must scroll before the scroll-to-top button appears. Expressed in rows so
 * both scale with `itemSize`.
 */
const defaultBufferRows = 8;
const scrollToTopThresholdRows = 8;

const scrollFrameScheduler = typeof requestAnimationFrame !== 'undefined' ? animationFrameScheduler : asapScheduler;

/**
 * A `tn-tree` that renders through a `cdk-virtual-scroll-viewport`, so only the
 * rows currently in view are materialised in the DOM. Drop-in for large trees
 * (thousands of nodes) where the plain `tn-tree` would render every node.
 *
 * Usage mirrors `tn-tree`: provide a `TnTreeFlatDataSource` + `FlatTreeControl`
 * and one `*cdkTreeNodeDef` template. Rows are a fixed height (`itemSize`).
 *
 * ```html
 * <tn-tree-virtual-scroll-view [dataSource]="dataSource" [treeControl]="treeControl" [itemSize]="52">
 *   <tn-tree-node *cdkTreeNodeDef="let node" cdkTreeNodePadding [routerLink]="...">
 *     {{ node.name }}
 *   </tn-tree-node>
 * </tn-tree-virtual-scroll-view>
 * ```
 *
 * Accessibility: rows are exposed with `role="treeitem"` plus `aria-level`,
 * `aria-posinset` and `aria-setsize` (the latter two relative to the node's
 * siblings — nodes sharing the same parent/level — per the WAI-ARIA tree
 * pattern, not the flattened list of all visible rows), and the virtual-scroll
 * wrappers are marked `role="presentation"` so assistive tech still sees the
 * items as children of the `role="tree"` host.
 *
 * Known limitation: because rows are materialised (and recycled) by the virtual
 * scroll viewport rather than registered with CdkTree's node outlet, the CDK
 * `TreeKeyManager` has no stable node set to drive. Roving arrow-key / Home / End
 * keyboard navigation is therefore NOT supported here — unlike the plain
 * `tn-tree`. Use the non-virtual `tn-tree` when full keyboard navigation is
 * required, or drive selection/expansion from the consumer.
 */
@Component({
  selector: 'tn-tree-virtual-scroll-view',
  standalone: true,
  exportAs: 'tnTreeVirtualScrollView',
  templateUrl: './tree-virtual-scroll-view.component.html',
  styleUrl: './tree-virtual-scroll-view.component.scss',
  providers: [
    { provide: CdkTree, useExisting: TnTreeVirtualScrollViewComponent },
  ],
  imports: [
    CdkTreeModule,
    CdkVirtualScrollViewport,
    CdkVirtualScrollableWindow,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    TnTreeVirtualScrollNodeOutletDirective,
    TnIconButtonComponent,
    AsyncPipe,
  ],
  hostDirectives: [{ directive: TnTestIdDirective, inputs: ['tnTestId: testId'] }],
  host: {
    'class': 'tn-tree tn-tree-virtual-scroll-view',
    'role': 'tree',
    // Expose itemSize to CSS so each row can be pinned to exactly this height
    // (see the .scss) — virtual scrolling needs the painted row height to match
    // the height the viewport assumes per item, otherwise hover/selection
    // backgrounds bleed across neighbouring rows.
    '[style.--tn-tree-item-size.px]': 'itemSize()',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TnTreeVirtualScrollViewComponent<T, K = T> extends CdkTree<T, K>
  implements AfterViewInit {
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  readonly virtualScrollViewport = viewChild.required(CdkVirtualScrollViewport);

  /** Fixed row height in px. Must match the actual rendered node height. */
  readonly itemSize = input(defaultTreeItemSize);
  readonly minBufferPx = input(defaultTreeItemSize * 4);
  readonly maxBufferPx = input(defaultTreeItemSize * defaultBufferRows);
  /**
   * When true the viewport scrolls with the window instead of an internal scroll area.
   * `booleanAttribute` so the bare presence form (`<... scrollWindow>`) coerces to `true`
   * rather than the empty-string (falsy) an un-transformed input would receive.
   */
  readonly scrollWindow = input(false, { transform: booleanAttribute });
  /** Whether to show the floating "scroll to top" button once scrolled down. */
  readonly showScrollToTop = input(true, { transform: booleanAttribute });
  /** Accessible label / tooltip for the scroll-to-top button (i18n is the consumer's job). */
  readonly scrollToTopLabel = input('Scroll to top');

  /** Per-row trackBy over the ORIGINAL data node (not the internal wrapper). */
  readonly nodeTrackBy = input<TrackByFunction<T>>();

  /** Emits the viewport's horizontal `scrollLeft` (used to sync a sticky column header). */
  readonly viewportScrolled = output<number>();
  /** Emits the viewport content size whenever it changes (used to size a sticky header). */
  readonly viewportResized = output<{ width: number; height: number }>();

  protected nodes$ = new BehaviorSubject<TnTreeVirtualNodeData<T>[]>([]);
  protected readonly innerTrackBy = computed<TrackByFunction<TnTreeVirtualNodeData<T>>>(() => {
    const fn = this.nodeTrackBy();
    return fn
      ? (index: number, node: TnTreeVirtualNodeData<T>) => fn(index, node.data)
      : (index: number) => index;
  });

  private renderNodeChanges$ = new BehaviorSubject<readonly T[]>([]);
  private resizeObserver: ResizeObserver | null = null;
  private scrollViewportElement: HTMLElement | null = null;
  private scrollFrameSubscription: Subscription | null = null;

  constructor() {
    super(inject(IterableDiffers), inject(ChangeDetectorRef), inject(ViewContainerRef));
    this.listenForNodeChanges();
  }

  override ngAfterViewInit(): void {
    super.ngAfterViewInit?.();

    const element = this.virtualScrollViewport().elementRef.nativeElement;
    const scrollable = this.virtualScrollViewport().scrollable;
    // `getElementRef()` resolves to the viewport in the self-scrolling case and to the
    // external scroll element otherwise — in scrollWindow mode that is
    // `document.documentElement`, which is what we read `scrollLeft` from below.
    this.scrollViewportElement = scrollable.getElementRef().nativeElement;
    // React to scrolls via the scrollable's own stream rather than addEventListener on
    // that element ref. In scrollWindow mode the scroll EVENTS fire on `document` while
    // the element ref is `document.documentElement`, so a raw listener on the element
    // would never fire and the scroll-to-top button / `viewportScrolled` could not react.
    // `elementScrolled()` is wired to the correct target for both internal and window modes.
    scrollable.elementScrolled()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(this.onViewportScroll);

    // Observe the rendered CONTENT wrapper rather than the viewport itself, so
    // `viewportResized` reports the full (possibly horizontally-overflowing) content
    // width — that is what a sticky column header needs to stay aligned with the rows.
    // Falls back to the viewport element if the wrapper is not present.
    const contentWrapper = element.querySelector('.cdk-virtual-scroll-content-wrapper');
    const observed = (contentWrapper as HTMLElement | null) ?? element;

    // The CDK viewport + content wrapper sit between the host `role="tree"` and the
    // `role="treeitem"` rows. Mark them presentational so assistive tech collapses
    // them and still sees the rows as direct tree items (ARIA requires treeitems to
    // be children of the tree, optionally through a presentational container).
    element.setAttribute('role', 'presentation');
    (contentWrapper as HTMLElement | null)?.setAttribute('role', 'presentation');

    // Guarded for non-browser environments (SSR, jsdom-based unit tests) where
    // ResizeObserver is absent; the resize output simply does not emit there.
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver((entries) => {
        const rect = entries[0]?.contentRect;
        if (rect) {
          this.viewportResized.emit({ width: rect.width, height: rect.height });
        }
      });
      this.resizeObserver.observe(observed);
    }
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    // The scroll subscription is torn down by takeUntilDestroyed; just drop refs here.
    this.scrollViewportElement = null;
    this.scrollFrameSubscription?.unsubscribe();
    this.scrollFrameSubscription = null;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  }

  /**
   * Cached visibility of the scroll-to-top button. Recomputed only on scroll (see
   * {@link onViewportScroll}) rather than read as a getter every change-detection
   * pass, so `measureScrollOffset` — a layout-forcing read — is not called each cycle.
   */
  protected isScrollTopButtonVisible = false;

  scrollToTop(): void {
    // Use scrollToOffset (which delegates to the viewport's scrollable) rather than
    // scrollTo (which scrolls the viewport element directly) so this also scrolls an
    // external scroll container back to the top.
    this.virtualScrollViewport().scrollToOffset(0, 'smooth');
    this.cdr.markForCheck();
  }

  private updateScrollTopButtonVisibility(): void {
    const visible = this.showScrollToTop()
      && this.virtualScrollViewport().measureScrollOffset('top') > this.itemSize() * scrollToTopThresholdRows;
    if (visible !== this.isScrollTopButtonVisible) {
      this.isScrollTopButtonVisible = visible;
      this.cdr.markForCheck();
    }
  }

  // CdkTree calls this with the full set of currently-visible nodes. Instead of
  // rendering them into the outlet, feed them to the virtual scroll pipeline.
  override renderNodeChanges(data: readonly T[]): void {
    this.renderNodeChanges$.next(data);
  }

  private getNodeLevel(nodeData: T): number {
    return this.treeControl?.getLevel ? this.treeControl.getLevel(nodeData) : 0;
  }

  /**
   * Compute per-row `aria-posinset` / `aria-setsize` scoped to each node's SIBLINGS
   * (same parent / same level), as the WAI-ARIA tree pattern requires — not the flat
   * list of all visible rows. The flat node set is depth-first ordered and each node
   * carries a level, so siblings at level L are the consecutive level-L nodes bounded
   * by any shallower node (level < L = a parent boundary); deeper nodes in between are
   * descendants of an earlier sibling and don't split the group. One pass, tracking the
   * open sibling group at each level.
   */
  private computeAriaPositions(levels: readonly number[]): { posInSet: number; setSize: number }[] {
    const posInSet = new Array<number>(levels.length);
    const setSize = new Array<number>(levels.length);
    // groups[level] = indices of the currently-open sibling group at that depth.
    const groups: number[][] = [];

    // Close (and stamp setSize on) every group deeper than `level`, because reaching a
    // node at `level` ends any sibling groups nested under the previous sibling.
    const finalizeDeeperThan = (level: number): void => {
      for (let l = groups.length - 1; l > level; l--) {
        const group = groups[l];
        if (group?.length) {
          for (const idx of group) {
            setSize[idx] = group.length;
          }
        }
      }
      groups.length = level + 1;
    };

    for (let i = 0; i < levels.length; i++) {
      const level = levels[i];
      finalizeDeeperThan(level);
      (groups[level] ??= []).push(i);
      posInSet[i] = groups[level].length;
    }
    // Close the groups still open at the end of the list.
    finalizeDeeperThan(-1);

    return levels.map((_, i) => ({ posInSet: posInSet[i], setSize: setSize[i] }));
  }

  private createNode(
    nodeData: T, index: number, level: number, posInSet: number, setSize: number,
  ): TnTreeVirtualNodeData<T> {
    // `_getNodeDef` is a private CdkTree API (verified against @angular/cdk 21.x). Assert
    // it resolves so a CDK upgrade that renames/removes it fails loudly here rather than
    // silently rendering a blank tree at runtime.
    const nodeDef = this._getNodeDef(nodeData, index);
    if (!nodeDef) {
      throw new Error(
        'TnTreeVirtualScrollView: CdkTree._getNodeDef returned no node definition. '
        + 'This private @angular/cdk API (expected ^21.1.0) may have changed — verify tree compatibility.',
      );
    }
    const context = new CdkTreeNodeOutletContext<T>(nodeData);
    context.level = level;
    // posInSet/setSize let a screen reader announce "item N of M" even though only a
    // slice of rows exists in the DOM at any time. They are scoped to this node's
    // siblings (see computeAriaPositions), per the WAI-ARIA tree pattern.
    return {
      data: nodeData, context, nodeDef, posInSet, setSize,
    };
  }

  private buildVirtualNodes(data: readonly T[]): TnTreeVirtualNodeData<T>[] {
    const levels = data.map((node) => this.getNodeLevel(node));
    const positions = this.computeAriaPositions(levels);
    return data.map(
      (node, index) => this.createNode(node, index, levels[index], positions[index].posInSet, positions[index].setSize),
    );
  }

  private listenForNodeChanges(): void {
    this.renderNodeChanges$.pipe(
      auditTime(0, scrollFrameScheduler),
      map((data) => this.buildVirtualNodes(data)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((nodes) => {
      this.nodes$.next(nodes);
      this.cdr.markForCheck();
      // The viewport's recycling repeater may swap a row's DOM view during the render
      // triggered above, leaving the outlet's aria-posinset/aria-setsize written to a
      // now-detached element. Schedule one more check so the outlet's ngDoCheck
      // reconciles the aria attributes onto the settled elements.
      queueMicrotask(() => this.cdr.markForCheck());
      // The visible node set just changed (e.g. a large branch was collapsed), which can
      // shrink the scrollable content and clamp the scroll offset without firing a scroll
      // event. Re-evaluate the scroll-to-top button after layout settles so it can't linger
      // over content that is no longer scrollable. Guarded by the live element ref so a
      // frame scheduled just before destroy doesn't measure a torn-down viewport.
      scrollFrameScheduler.schedule(() => {
        if (this.scrollViewportElement) {
          this.updateScrollTopButtonVisibility();
        }
      });
    });
  }

  private readonly onViewportScroll = (): void => {
    // Scroll events can fire several times per frame. Coalesce the work — a
    // horizontal-offset emit and `measureScrollOffset` (a layout-forcing read) — into a
    // single animation frame so fast scrolls don't trigger repeated forced reflows.
    if (this.scrollFrameSubscription) {
      return;
    }
    this.scrollFrameSubscription = scrollFrameScheduler.schedule(() => {
      this.scrollFrameSubscription = null;
      // Read scrollLeft from the actual scroll source, not the viewport element: in
      // scrollWindow mode the viewport itself does not scroll (the window/external
      // element does), so the viewport's own scrollLeft would always be 0.
      this.viewportScrolled.emit(this.scrollViewportElement?.scrollLeft ?? 0);
      // Re-evaluate the scroll-to-top button on every scroll (the scroll source may be an
      // external, OnPush-detached container, so nothing else marks this view dirty).
      this.updateScrollTopButtonVisibility();
    });
  };
}
