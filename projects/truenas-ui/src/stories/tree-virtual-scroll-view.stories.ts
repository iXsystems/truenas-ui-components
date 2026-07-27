import { CdkTreeModule, FlatTreeControl } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';
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

const harnessDoc = loadHarnessDoc('tree-virtual-scroll-view');

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

// Shared props factory so every story wires up an identical data source / tree control.
function treeProps(data: DemoNode[]): Record<string, unknown> {
  const treeControl = new FlatTreeControl<DemoFlatNode>(
    (node: DemoFlatNode) => node.level,
    (node: DemoFlatNode) => node.expandable,
  );
  const treeFlattener = new TnTreeFlattener<DemoNode, DemoFlatNode>(
    (node: DemoNode, level: number) => ({ name: node.name, level, expandable: !!node.children?.length }),
    (node: DemoFlatNode) => node.level,
    (node: DemoFlatNode) => node.expandable,
    (node: DemoNode) => node.children,
  );
  const dataSource = new TnTreeFlatDataSource(treeControl, treeFlattener);
  dataSource.data = data;
  return {
    treeControl,
    dataSource,
    trackByName: (_: number, node: DemoFlatNode) => node.name,
  };
}

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
          + '(`itemSize`); provide a `TnTreeFlatDataSource` + `FlatTreeControl` exactly as for `tn-tree`.'
          + '\n\n### Accessibility / keyboard\n'
          + 'Because rows are materialised and recycled by the viewport (not registered with '
          + "CdkTree's node outlet), CDK's `TreeKeyManager` can't drive them, so **roving arrow-key / "
          + 'Home / End navigation between nodes is not supported** here. Expandable rows are made '
          + 'tab-focusable and expand/collapse with **Enter/Space**; move between rows with **Tab**. '
          + 'Note this means an expanded tree exposes one Tab stop per expandable row rather than the '
          + 'single-stop + arrow-roving of the WAI-ARIA tree pattern, and leaf rows are only reachable '
          + 'if the row template contains a focusable element. If full roving keyboard navigation is '
          + 'required, use the non-virtual `tn-tree` instead.',
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
        story: 'A ~5,200-node tree. Scroll the list — the DOM only ever holds the visible rows plus a small '
          + 'buffer. Scroll down far enough and the floating "scroll to top" button appears.',
      },
    },
  },
  render: () => ({
    props: treeProps(LARGE_TREE),
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

export const WindowScroll: Story = {
  parameters: {
    docs: {
      description: {
        story: 'With `scrollWindow`, the viewport scrolls with the page instead of an internal scroll area. '
          + 'Use this when the tree is the main content of a route and should grow with the document. The '
          + 'scroll-to-top button and `viewportScrolled` output react to the window scroll offset.',
      },
    },
  },
  render: () => ({
    props: treeProps(LARGE_TREE),
    template: `
      <div style="border: 1px solid var(--tn-lines); border-radius: 6px;">
        <tn-tree-virtual-scroll-view
          scrollWindow
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

export const StickyHeader: Story = {
  parameters: {
    docs: {
      description: {
        story: 'A sticky column header kept in horizontal sync with the rows via the `viewportScrolled` output. '
          + 'The rows are wider than the viewport, so scrolling right shifts both the rows and the header. '
          + '`viewportResized` reports the content size for sizing such a header.',
      },
    },
  },
  render: () => ({
    props: {
      ...treeProps(LARGE_TREE),
      headerScrollLeft: 0,
      onViewportScrolled(this: { headerScrollLeft: number }, left: number): void {
        this.headerScrollLeft = left;
      },
    },
    template: `
      <div style="height: 420px; border: 1px solid var(--tn-lines); border-radius: 6px; overflow: hidden; display: flex; flex-direction: column;">
        <div style="overflow: hidden; border-bottom: 1px solid var(--tn-lines); background: var(--tn-alt-bg);">
          <div
            style="display: flex; gap: 24px; padding: 8px 16px; width: 900px; font-weight: 600;"
            [style.transform]="'translateX(' + (-headerScrollLeft) + 'px)'"
          >
            <span style="width: 400px;">Name</span>
            <span style="width: 240px;">Type</span>
            <span style="width: 200px;">Path</span>
          </div>
        </div>
        <tn-tree-virtual-scroll-view
          style="flex: 1; min-height: 0;"
          [dataSource]="dataSource"
          [treeControl]="treeControl"
          [itemSize]="48"
          [nodeTrackBy]="trackByName"
          (viewportScrolled)="onViewportScrolled($event)"
        >
          <tn-tree-node *cdkTreeNodeDef="let node" cdkTreeNodePadding>
            <div style="display: flex; gap: 24px; width: 900px;">
              <span style="width: 400px; display: inline-flex; align-items: center;">
                <tn-icon [name]="node.expandable ? 'folder' : 'file'" library="mdi" size="sm" style="margin-right: 8px;"></tn-icon>
                {{ node.name }}
              </span>
              <span style="width: 240px;">{{ node.expandable ? 'Pool' : 'Dataset' }}</span>
              <span style="width: 200px;">/mnt/{{ node.name }}</span>
            </div>
          </tn-tree-node>
        </tn-tree-virtual-scroll-view>
      </div>
    `,
  }),
};

/**
 * Auto-generated API documentation for `TnTreeVirtualScrollViewHarness`, rendered in the
 * Docs tab. Use the harness to drive the tree in consumer tests (query rows, expand/collapse,
 * read sibling-scoped aria, operate the scroll-to-top button).
 */
export const ComponentHarness: Story = {
  tags: ['!dev'],
  parameters: {
    docs: {
      story: { height: 'auto' },
      canvas: { hidden: true, sourceState: 'none' },
      description: { story: harnessDoc || '' },
    },
    controls: { disable: true },
    layout: 'fullscreen',
  },
  render: () => ({ template: '' }),
};
