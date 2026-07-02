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
      [nodeTrackBy]="trackByName"
    >
      <tn-tree-node *cdkTreeNodeDef="let node">{{ node.name }}</tn-tree-node>
    </tn-tree-virtual-scroll-view>
  `,
})
class HostComponent {
  readonly tree = viewChild.required(TnTreeVirtualScrollViewComponent);

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('instantiates and applies the fixed row height', () => {
    expect(host.tree()).toBeTruthy();
    expect(host.tree().itemSize()).toBe(52);
  });

  it('exposes sensible defaults', () => {
    const spec = TestBed.createComponent(TnTreeVirtualScrollViewComponent);
    expect(spec.componentInstance.itemSize()).toBe(defaultTreeItemSize);
    expect(spec.componentInstance.scrollToTopLabel()).toBe('Scroll to top');
    expect(spec.componentInstance.showScrollToTop()).toBe(true);
  });

  it('wraps a rendered node into virtual node data, matching the node def and level', () => {
    const tree = host.tree() as unknown as {
      createNode(data: ExampleFlatNode, index: number): {
        data: ExampleFlatNode;
        context: { level: number };
        nodeDef: unknown;
      };
    };

    const child = tree.createNode({ name: 'pool/a', level: 1, expandable: false }, 0);
    expect(child.data.name).toBe('pool/a');
    // Level is taken from the tree control's getLevel.
    expect(child.context.level).toBe(1);
    // The default *cdkTreeNodeDef template is resolved for the row.
    expect(child.nodeDef).toBeTruthy();

    const root = tree.createNode({ name: 'pool', level: 0, expandable: true }, 1);
    expect(root.context.level).toBe(0);
  });

  it('emits the viewport scrollLeft when the viewport scrolls', () => {
    const spy = jest.fn();
    host.tree().viewportScrolled.subscribe(spy);

    const viewport = host.tree().virtualScrollViewport().elementRef.nativeElement;
    Object.defineProperty(viewport, 'scrollLeft', { value: 42, configurable: true });
    viewport.dispatchEvent(new Event('scroll'));

    expect(spy).toHaveBeenCalledWith(42);
  });
});
