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
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, IterableDiffers, ViewContainerRef, ViewEncapsulation, computed, inject, input, output, viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { animationFrameScheduler, asapScheduler, BehaviorSubject } from 'rxjs';
import { auditTime, map } from 'rxjs/operators';
import { TnIconButtonComponent } from '../icon-button/icon-button.component';
import { TnTestIdDirective } from '../test-id';
import type { TnTreeVirtualNodeData } from './tree-virtual-node-data.interface';
import { TnTreeVirtualScrollNodeOutletDirective } from './tree-virtual-scroll-node-outlet.directive';

/** Default fixed row height (px) used by the virtual scroll viewport. */
export const defaultTreeItemSize = 48;

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
  readonly maxBufferPx = input(defaultTreeItemSize * 8);
  /** When true the viewport scrolls with the window instead of an internal scroll area. */
  readonly scrollWindow = input(false);
  /** Whether to show the floating "scroll to top" button once scrolled down. */
  readonly showScrollToTop = input(true);
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

  constructor() {
    super(inject(IterableDiffers), inject(ChangeDetectorRef), inject(ViewContainerRef));
    this.listenForNodeChanges();
  }

  override ngAfterViewInit(): void {
    super.ngAfterViewInit?.();

    const element = this.virtualScrollViewport().elementRef.nativeElement;
    // Listen on the ACTUAL scroll source, which may be an external scrollable
    // (CdkVirtualScrollableElement/Window) rather than the viewport element itself. In
    // external mode the viewport does not scroll, so a listener on `element` would never
    // fire and the scroll-to-top button could not react. `scrollable.getElementRef()`
    // resolves to the viewport in the self-scrolling case and to the external element
    // otherwise.
    const scrollSource = this.virtualScrollViewport().scrollable.getElementRef().nativeElement;
    this.scrollViewportElement = scrollSource;
    scrollSource.addEventListener('scroll', this.onViewportScroll);

    // Observe the rendered CONTENT wrapper rather than the viewport itself, so
    // `viewportResized` reports the full (possibly horizontally-overflowing) content
    // width — that is what a sticky column header needs to stay aligned with the rows.
    // Falls back to the viewport element if the wrapper is not present.
    const contentWrapper = element.querySelector('.cdk-virtual-scroll-content-wrapper');
    const observed = (contentWrapper as HTMLElement | null) ?? element;

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
    this.scrollViewportElement?.removeEventListener('scroll', this.onViewportScroll);
    this.scrollViewportElement = null;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  }

  get isScrollTopButtonVisible(): boolean {
    if (!this.showScrollToTop()) {
      return false;
    }
    return this.virtualScrollViewport().measureScrollOffset('top') > this.itemSize() * 8;
  }

  scrollToTop(): void {
    // Use scrollToOffset (which delegates to the viewport's scrollable) rather than
    // scrollTo (which scrolls the viewport element directly) so this also scrolls an
    // external scroll container back to the top.
    this.virtualScrollViewport().scrollToOffset(0, 'smooth');
    this.cdr.markForCheck();
  }

  // CdkTree calls this with the full set of currently-visible nodes. Instead of
  // rendering them into the outlet, feed them to the virtual scroll pipeline.
  override renderNodeChanges(data: readonly T[]): void {
    this.renderNodeChanges$.next(data);
  }

  private createNode(nodeData: T, index: number): TnTreeVirtualNodeData<T> {
    const nodeDef = this._getNodeDef(nodeData, index);
    const context = new CdkTreeNodeOutletContext<T>(nodeData);
    context.level = this.treeControl?.getLevel ? this.treeControl.getLevel(nodeData) : 0;
    return { data: nodeData, context, nodeDef };
  }

  private listenForNodeChanges(): void {
    this.renderNodeChanges$.pipe(
      auditTime(0, scrollFrameScheduler),
      map((data) => [...data].map((node, index) => this.createNode(node, index))),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((nodes) => {
      this.nodes$.next(nodes);
      this.cdr.markForCheck();
    });
  }

  private readonly onViewportScroll = (): void => {
    this.viewportScrolled.emit(this.virtualScrollViewport().elementRef.nativeElement.scrollLeft);
    // Re-evaluate isScrollTopButtonVisible on every scroll (the scroll source may be an
    // external, OnPush-detached container, so nothing else marks this view dirty).
    this.cdr.markForCheck();
  };
}
