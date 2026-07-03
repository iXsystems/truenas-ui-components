import { CdkTreeModule, FlatTreeControl } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { tnIconMarker } from '../lib/icon/icon-marker';
import { TnIconComponent } from '../lib/icon/icon.component';
import { TnTreeNodeComponent } from '../lib/tree/tree-node.component';
import {
  TnTreeVirtualScrollViewComponent,
} from '../lib/tree/tree-virtual-scroll-view.component';
import { TnTreeFlatDataSource, TnTreeFlattener } from '../lib/tree/tree.component';

// Ensure these icons are bundled into the sprite for the story.
tnIconMarker('folder', 'mdi');
tnIconMarker('file', 'mdi');

interface DemoNode {
  name: string;
  children?: DemoNode[];
}

interface DemoFlatNode {
  name: string;
  level: number;
  expandable: boolean;
}

// Build a large tree (thousands of nodes) to show that only visible rows render.
function buildLargeTree(rootCount: number, childrenPerRoot: number): DemoNode[] {
  return Array.from({ length: rootCount }, (_root, r) => ({
    name: `Pool ${r + 1}`,
    children: Array.from({ length: childrenPerRoot }, (_child, c) => ({ name: `dataset-${r + 1}-${c + 1}` })),
  }));
}

const LARGE_TREE = buildLargeTree(200, 25); // 200 roots × 25 children + 200 = ~5200 nodes

const meta: Meta<TnTreeVirtualScrollViewComponent<DemoNode, DemoFlatNode>> = {
  title: 'Components/Tree/VirtualScroll',
  component: TnTreeVirtualScrollViewComponent,
  decorators: [
    moduleMetadata({
      imports: [
        CommonModule,
        CdkTreeModule,
        TnTreeVirtualScrollViewComponent,
        TnTreeNodeComponent,
        TnIconComponent,
      ],
    }),
  ],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A `tn-tree` variant that renders through a `cdk-virtual-scroll-viewport`, so only the '
          + 'rows currently in view are created in the DOM. Use it for large trees (thousands of '
          + 'nodes) where the plain `tn-tree` would render every node. Rows are a fixed height '
          + '(`itemSize`); provide a `TnTreeFlatDataSource` + `FlatTreeControl` exactly as for `tn-tree`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<TnTreeVirtualScrollViewComponent<DemoNode, DemoFlatNode>>;

export const LargeTree: Story = {
  parameters: {
    docs: {
      description: {
        story: 'A ~5,200-node tree. Scroll the list — the DOM only ever holds the visible rows plus a small buffer.',
      },
    },
  },
  render: () => ({
    props: {
      hasChild: (_: number, node: DemoFlatNode) => node.expandable,
      trackByName: (_: number, node: DemoFlatNode) => node.name,
      treeControl: new FlatTreeControl<DemoFlatNode>(
        (node: DemoFlatNode) => node.level,
        (node: DemoFlatNode) => node.expandable,
      ),
      get treeFlattener() {
        return new TnTreeFlattener<DemoNode, DemoFlatNode>(
          (node: DemoNode, level: number) => ({
            name: node.name,
            level,
            expandable: !!node.children?.length,
          }),
          (node: DemoFlatNode) => node.level,
          (node: DemoFlatNode) => node.expandable,
          (node: DemoNode) => node.children,
        );
      },
      get dataSource() {
        const dataSource = new TnTreeFlatDataSource(this['treeControl'], this['treeFlattener']);
        dataSource.data = LARGE_TREE;
        return dataSource;
      },
    },
    template: `
      <div style="height: 420px; border: 1px solid var(--tn-lines); border-radius: 6px;">
        <tn-tree-virtual-scroll-view
          [dataSource]="dataSource"
          [treeControl]="treeControl"
          [itemSize]="48"
          [nodeTrackBy]="trackByName"
        >
          <tn-tree-node *cdkTreeNodeDef="let node" cdkTreeNodePadding>
            <tn-icon [name]="node.expandable ? 'folder' : 'file'" library="mdi" size="sm" style="margin-right: 8px;"></tn-icon>
            {{ node.name }}
          </tn-tree-node>
        </tn-tree-virtual-scroll-view>
      </div>
    `,
  }),
};
