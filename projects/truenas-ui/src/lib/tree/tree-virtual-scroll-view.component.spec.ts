import { CdkTreeModule, FlatTreeControl } from '@angular/cdk/tree';
import { Component, viewChild } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { TnTreeNodeComponent } from './tree-node.component';
import {
  TnTreeVirtualScrollViewComponent, defaultTreeItemSize,
} from './tree-virtual-scroll-view.component';
import { TnTreeFlatDataSource, TnTreeFlattener } from './tree.component';

interface ExampleNode {
  name: string;
  children?: ExampleNode[];
}

interface ExampleFlatNode {
  name: string;
  level: number;
  expandable: boolean;
}

const dataset: ExampleNode[] = [
  { name: 'pool', children: [{ name: 'pool/a' }, { name: 'pool/b' }] },
  { name: 'other' },
];

@Component({
  selector: 'tn-tree-virtual-scroll-harness-test',
  standalone: true,
  imports: [CdkTreeModule, TnTreeVirtualScrollViewComponent, TnTreeNodeComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-tree-virtual-scroll-view
      [dataSource]="dataSource"
      [treeControl]="treeControl"
      [itemSize]="52"
      [scrollWindow]="scrollWindow"
      [nodeTrackBy]="trackByName"
    >
      <tn-tree-node *cdkTreeNodeDef="let node">{{ node.name }}</tn-tree-node>
    </tn-tree-virtual-scroll-view>
  `,
})
class HostComponent {
  readonly tree = viewChild.required(TnTreeVirtualScrollViewComponent);

  scrollWindow = false;

  readonly treeControl = new FlatTreeControl<ExampleFlatNode>(
    (node) => node.level,
    (node) => node.expandable,
  );

  private readonly flattener = new TnTreeFlattener<ExampleNode, ExampleFlatNode>(
    (node, level) => ({ name: node.name, level, expandable: !!node.children?.length }),
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children,
  );

  readonly dataSource = new TnTreeFlatDataSource(this.treeControl, this.flattener);

  readonly trackByName = (_: number, node: ExampleFlatNode): string => node.name;

  constructor() {
    this.dataSource.data = dataset;
  }
}

describe('TnTreeVirtualScrollViewComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  /** Distinct visible rows (the row template renders a `role="treeitem"` element per node). */
  function rowElements(): HTMLElement[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll<HTMLElement>('.tn-tree-node-wrapper[role="treeitem"]'),
    );
  }

  function rowLabels(): string[] {
    // Read the node's text cell only (the wrapper's textContent also picks up the
    // expand-chevron icon glyph).
    return rowElements().map((el) => el.querySelector('.tn-tree-node__text')?.textContent?.trim() ?? '');
  }

  /**
   * Drive several change-detection passes to let the node stream (async `auditTime`)
   * emit and the DOM settle. The viewport's recycling repeater can reshuffle rows, so
   * the outlet's self-healing `ngDoCheck` reconciles aria attributes over the next
   * pass or two — mirroring how zone-driven CD settles in the browser.
   */
  async function settle(passes = 3): Promise<void> {
    for (let i = 0; i < passes; i++) {
      await fixture.whenStable();
      fixture.detectChanges();
    }
  }

  /**
   * Render the tree. `expandRoot` expands the first root BEFORE the initial render so
   * the expanded rows are present from the first paint — expanding mid-test races the
   * viewport's async row stream and is needlessly flaky.
   */
  async function render({ expandRoot = false, scrollWindow = false } = {}): Promise<void> {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    host.scrollWindow = scrollWindow;
    if (expandRoot) {
      host.treeControl.expand(host.treeControl.dataNodes[0]);
    }
    fixture.detectChanges();
    await settle();
  }

  /** The floating scroll-to-top button, if currently rendered. */
  function scrollTopButton(): HTMLElement | null {
    return fixture.nativeElement.querySelector<HTMLElement>('.tn-tree-virtual-scroll-view__scroll-top');
  }

  /** Flush one animation frame — the scroll handler coalesces its work into a rAF. */
  function flushFrame(): Promise<void> {
    return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();
  });

  it('instantiates and applies the fixed row height', async () => {
    await render();
    expect(host.tree()).toBeTruthy();
    expect(host.tree().itemSize()).toBe(52);
    const treeEl = fixture.nativeElement.querySelector<HTMLElement>('.tn-tree-virtual-scroll-view');
    expect(treeEl?.style.getPropertyValue('--tn-tree-item-size')).toBe('52px');
  });

  it('exposes sensible defaults', () => {
    const spec = TestBed.createComponent(TnTreeVirtualScrollViewComponent);
    expect(spec.componentInstance.itemSize()).toBe(defaultTreeItemSize);
    expect(spec.componentInstance.scrollToTopLabel()).toBe('Scroll to top');
    expect(spec.componentInstance.showScrollToTop()).toBe(true);
  });

  it('renders only the collapsed top-level nodes as tree items initially', async () => {
    await render();
    // Only roots are visible while collapsed: the expandable "pool" and the leaf "other".
    expect(rowLabels()).toEqual(['pool', 'other']);
  });

  it('renders children with the correct aria-level when a node is expanded', async () => {
    await render({ expandRoot: true });

    expect(rowLabels()).toEqual(['pool', 'pool/a', 'pool/b', 'other']);

    const levels = rowElements().map((el) => el.getAttribute('aria-level'));
    // aria-level is 1-based: root nodes at 1, the two expanded children at 2.
    expect(levels).toEqual(['1', '2', '2', '1']);
  });

  it('scopes aria-posinset / aria-setsize to each node\'s siblings, not the flat list', async () => {
    await render({ expandRoot: true });

    // Visible rows: pool, pool/a, pool/b, other.
    // Roots (pool, other) form a sibling set of 2; the expanded children (pool/a, pool/b)
    // form their own sibling set of 2 — NOT a flat "1..4 of 4".
    const rows = rowElements();
    expect(rowLabels()).toEqual(['pool', 'pool/a', 'pool/b', 'other']);
    expect(rows.map((el) => el.getAttribute('aria-setsize'))).toEqual(['2', '2', '2', '2']);
    expect(rows.map((el) => el.getAttribute('aria-posinset'))).toEqual(['1', '1', '2', '2']);
  });

  it('marks the virtual-scroll wrappers as presentational so rows stay tree children', async () => {
    await render();
    const viewport = fixture.nativeElement.querySelector('cdk-virtual-scroll-viewport');
    const wrapper = fixture.nativeElement.querySelector('.cdk-virtual-scroll-content-wrapper');
    expect(viewport?.getAttribute('role')).toBe('presentation');
    expect(wrapper?.getAttribute('role')).toBe('presentation');
  });

  it('emits the scroll source scrollLeft when the viewport scrolls', async () => {
    await render();
    const spy = jest.fn();
    host.tree().viewportScrolled.subscribe(spy);

    const viewport = host.tree().virtualScrollViewport().elementRef.nativeElement;
    Object.defineProperty(viewport, 'scrollLeft', { value: 42, configurable: true });
    viewport.dispatchEvent(new Event('scroll'));

    // The handler coalesces its work into an animation frame, so flush one before asserting.
    await flushFrame();

    expect(spy).toHaveBeenCalledWith(42);
  });

  it('shows the scroll-to-top button only once scrolled past the row threshold', async () => {
    await render();
    const tree = host.tree();
    const viewport = tree.virtualScrollViewport();
    const scrollSource = viewport.scrollable.getElementRef().nativeElement;
    // Threshold is itemSize (52) * 8 rows; start above it, then drop back to the top.
    const measure = jest.spyOn(viewport, 'measureScrollOffset');

    expect(scrollTopButton()).toBeFalsy();

    measure.mockReturnValue(52 * 8 + 1);
    scrollSource.dispatchEvent(new Event('scroll'));
    await flushFrame();
    fixture.detectChanges();
    expect(scrollTopButton()).toBeTruthy();

    measure.mockReturnValue(0);
    scrollSource.dispatchEvent(new Event('scroll'));
    await flushFrame();
    fixture.detectChanges();
    expect(scrollTopButton()).toBeFalsy();
  });

  it('emits viewportResized when the observed content resizes', async () => {
    const callbacks: ResizeObserverCallback[] = [];
    class MockResizeObserver {
      constructor(cb: ResizeObserverCallback) { callbacks.push(cb); }
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    }
    const globals = globalThis as { ResizeObserver?: unknown };
    const original = globals.ResizeObserver;
    globals.ResizeObserver = MockResizeObserver;

    try {
      await render();
      const spy = jest.fn();
      host.tree().viewportResized.subscribe(spy);

      const cb = callbacks[callbacks.length - 1];
      cb([{ contentRect: { width: 300, height: 400 } } as ResizeObserverEntry], {} as ResizeObserver);

      expect(spy).toHaveBeenCalledWith({ width: 300, height: 400 });
    } finally {
      globals.ResizeObserver = original;
    }
  });

  it('renders through the window scroll strategy in scrollWindow mode', async () => {
    await render({ scrollWindow: true });

    // Alternate template branch renders the same collapsed roots...
    expect(rowLabels()).toEqual(['pool', 'other']);
    // ...and the scroll source resolves to an external scrollable (the window), not the
    // viewport element itself (which does not scroll in this mode).
    const viewport = host.tree().virtualScrollViewport();
    expect(viewport.scrollable).not.toBe(viewport);
  });
});
