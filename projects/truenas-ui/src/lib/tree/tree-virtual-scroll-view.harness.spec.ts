import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { CdkTreeModule, FlatTreeControl } from '@angular/cdk/tree';
import { Component, viewChild } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { TnTreeNodeComponent } from './tree-node.component';
import { TnTreeVirtualScrollViewComponent } from './tree-virtual-scroll-view.component';
import { TnTreeVirtualScrollViewHarness } from './tree-virtual-scroll-view.harness';
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
  selector: 'tn-tree-virtual-scroll-harness-host',
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

describe('TnTreeVirtualScrollViewHarness', () => {
  let fixture: ComponentFixture<HostComponent>;
  let loader: HarnessLoader;

  /** Flush the node stream (async `auditTime`) and let the DOM settle, as in the component spec. */
  async function settle(passes = 3): Promise<void> {
    for (let i = 0; i < passes; i++) {
      await fixture.whenStable();
      fixture.detectChanges();
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await settle();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('loads the harness', async () => {
    expect(await loader.getHarness(TnTreeVirtualScrollViewHarness)).toBeTruthy();
  });

  it('reads the materialised rows and their expandability/focusability', async () => {
    const tree = await loader.getHarness(TnTreeVirtualScrollViewHarness);
    expect(await tree.getRowCount()).toBe(2);
    expect(await tree.getRowTexts()).toEqual(['pool', 'other']);
    expect(await tree.getRowText(0)).toBe('pool');
    // "pool" is expandable (and therefore tab-focusable); "other" is a leaf.
    expect(await tree.isExpandable(0)).toBe(true);
    expect(await tree.isFocusable(0)).toBe(true);
    expect(await tree.isExpandable(1)).toBe(false);
    expect(await tree.isFocusable(1)).toBe(false);
  });

  it('expands and collapses a row, exposing sibling-scoped aria', async () => {
    const tree = await loader.getHarness(TnTreeVirtualScrollViewHarness);

    await tree.expand(0);
    await settle();
    expect(await tree.getRowTexts()).toEqual(['pool', 'pool/a', 'pool/b', 'other']);
    expect(await tree.isExpanded(0)).toBe(true);
    // pool/a: level 2, sibling 1 of 2.
    expect(await tree.getAriaLevel(1)).toBe(2);
    expect(await tree.getAriaPosInSet(1)).toBe(1);
    expect(await tree.getAriaSetSize(1)).toBe(2);

    await tree.collapse(0);
    await settle();
    expect(await tree.getRowTexts()).toEqual(['pool', 'other']);
    expect(await tree.isExpanded(0)).toBe(false);
  });

  it('toggles a row via keyboard through the harness', async () => {
    const tree = await loader.getHarness(TnTreeVirtualScrollViewHarness);
    await tree.pressKeyOnRow(0, 'enter');
    await settle();
    expect(await tree.getRowTexts()).toEqual(['pool', 'pool/a', 'pool/b', 'other']);
  });

  it('reports the scroll-to-top button as hidden initially', async () => {
    const tree = await loader.getHarness(TnTreeVirtualScrollViewHarness);
    expect(await tree.isScrollToTopVisible()).toBe(false);
  });
});
