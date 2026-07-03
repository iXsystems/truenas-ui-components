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
 * Row counts for the default buffer sizes (how many extra rows of content the viewport
 * renders past the visible area) and for the distance the user must scroll before the
 * scroll-to-top button appears. Expressed in rows and multiplied by `itemSize()` at
 * runtime (see resolvedMin/MaxBufferPx) so the defaults scale with a custom row height.
 */
const defaultMinBufferRows = 4;
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
 * Keyboard: expandable rows are focusable and expand/collapse with Enter/Space (see
 * {@link onTreeKeydown}), so a keyboard/AT user can operate the `aria-expanded` that
 * each expandable `treeitem` advertises. Roving arrow-key / Home / End navigation
 * BETWEEN nodes is NOT supported here, though — because rows are materialised (and
 * recycled) by the virtual scroll viewport rather than registered with CdkTree's node
 * outlet, the CDK `TreeKeyManager` has no stable node set to drive. Use Tab to move
 * between rows, or the non-virtual `tn-tree` when full roving navigation is required.
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
    '(keydown)': 'onTreeKeydown($event)',
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
  /**
   * Viewport buffer sizes (px). Leave at 0 (the default) to derive them from `itemSize()`
   * — {@link defaultMinBufferRows} / {@link defaultBufferRows} rows — so the buffers scale
   * with a custom row height; pass an explicit px value to override. (A fixed px default
   * would under-buffer a tall `itemSize`, even failing to buffer a single row when
   * `itemSize > maxBufferPx`.)
   */
  readonly minBufferPx = input(0);
  readonly maxBufferPx = input(0);
  /** `minBufferPx` resolved to px, falling back to a row-count default that tracks `itemSize()`. */
  protected readonly resolvedMinBufferPx = computed(() => this.minBufferPx() || this.itemSize() * defaultMinBufferRows);
  /** `maxBufferPx` resolved to px, falling back to a row-count default that tracks `itemSize()`. */
  protected readonly resolvedMaxBufferPx = computed(() => this.maxBufferPx() || this.itemSize() * defaultBufferRows);
  /**
   * When true the viewport scrolls with the window instead of an internal scroll area.
   * `booleanAttribute` so the bare presence form (`<... scrollWindow>`) coerces to `true`
   * rather than the empty-string (falsy) an un-transformed input would receive.
   *
   * Set once at initialisation — NOT reactive. The scroll listener, presentational roles
   * and ResizeObserver are wired in `ngAfterViewInit` against the viewport that this input
   * selected; toggling it later re-renders the viewport but does not re-run that wiring.
   */
  readonly scrollWindow = input(false, { transform: booleanAttribute });
  /** Whether to show the floating "scroll to top" button once scrolled down. */
  readonly showScrollToTop = input(true, { transform: booleanAttribute });
  /** Accessible label / tooltip for the scroll-to-top button (i18n is the consumer's job). */
  readonly scrollToTopLabel = input('Scroll to top');

  /**
   * Per-row trackBy over the ORIGINAL data node (not the internal wrapper). Strongly
   * recommended: without it rows track by index, so the recycling viewport reuses a
   * detached view for whatever node lands at that index on data changes. Pass a stable
   * key (e.g. `(_, node) => node.id`) as the stories do.
   */
  readonly nodeTrackBy = input<TrackByFunction<T>>();

  /** Emits the viewport's horizontal `scrollLeft` (used to sync a sticky column header). */
  readonly viewportScrolled = output<number>();
  /**
   * Emits the observed content size whenever it changes (used to size a sticky header).
   * `width` is the full rendered content width — including horizontal overflow past the
   * viewport — which is what a horizontally-synced header needs. `height` is the observed
   * content wrapper's height: the visible viewport height in internal-scroll mode, but the
   * FULL content height (row count × `itemSize`) in `scrollWindow` mode, where the wrapper
   * grows with the document. Consumers wanting the visible viewport height should not rely
   * on this field in window mode.
   */
  readonly viewportResized = output<{ width: number; height: number }>();

  /** Last `scrollLeft` emitted via {@link viewportScrolled}; used to skip redundant emits. */
  private lastEmittedScrollLeft = 0;

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

  /**
   * Enter/Space on a focused expandable row toggles its expansion. The virtual viewport
   * recycles rows so CDK's `TreeKeyManager` can't drive them (see class docs); this keeps
   * the expand/collapse that each `aria-expanded` row advertises keyboard-operable, via
   * event delegation on the `role="tree"` host that reuses the row's `cdkTreeNodeToggle`
   * click handler. Ignored when focus is on an inner control (e.g. a `routerLink` anchor)
   * so that element keeps its own Enter/Space behaviour.
   */
  protected onTreeKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') {
      return;
    }
    const target = event.target as HTMLElement | null;
    const row = target?.closest?.('.tn-tree-node-wrapper[role="treeitem"]') as HTMLElement | null;
    if (!row || row !== target || !row.hasAttribute('aria-expanded')) {
      return;
    }
    const toggle = row.querySelector<HTMLElement>('[cdkTreeNodeToggle]');
    if (toggle) {
      // Prevent Space from scrolling the page; reuse the toggle's existing click handler.
      event.preventDefault();
      toggle.click();
    }
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
      // element does), so the viewport's own scrollLeft would always be 0. Only emit when
      // it actually changed — this fires on vertical scrolls too, where scrollLeft is
      // unchanged, and a consumer syncing a sticky header would otherwise re-apply the
      // same translateX on every vertical scroll frame of a large tree.
      const left = this.scrollViewportElement?.scrollLeft ?? 0;
      if (left !== this.lastEmittedScrollLeft) {
        this.lastEmittedScrollLeft = left;
        this.viewportScrolled.emit(left);
      }
      // Re-evaluate the scroll-to-top button on every scroll (the scroll source may be an
      // external, OnPush-detached container, so nothing else marks this view dirty).
      this.updateScrollTopButtonVisibility();
    });
  };
}
