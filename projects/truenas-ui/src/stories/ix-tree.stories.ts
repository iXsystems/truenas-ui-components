import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';

import { IxTreeComponent, FlatTreeControl, IxTreeFlatDataSource, IxTreeFlattener, ArrayDataSource } from '../lib/ix-tree/ix-tree.component';
import { IxTreeNodeComponent } from '../lib/ix-tree/ix-tree-node.component';
import { IxNestedTreeNodeComponent } from '../lib/ix-tree/ix-nested-tree-node.component';
import { IxTreeNodeOutletDirective } from '../lib/ix-tree/ix-tree-node-outlet.directive';
import { CdkTreeModule } from '@angular/cdk/tree';
import { IxIconComponent } from '../lib/ix-icon/ix-icon.component';
import { iconMarker } from '../lib/ix-icon/icon-marker';

// Ensure these icons are included in the library sprite
iconMarker('mdi-cpu-64-bit');
iconMarker('mdi-nas');
iconMarker('mdi-share-variant');

// Example data structure for CDK Tree integration
interface FileNode {
  name: string;
  type: 'folder' | 'file';
  children?: FileNode[];
}

// Flattened node for CDK Tree
interface FileFlatNode {
  expandable: boolean;
  name: string;
  type: 'folder' | 'file';
  level: number;
}

const meta: Meta<IxTreeComponent<any, any>> = {
  title: 'Components/Tree',
  component: IxTreeComponent,
  decorators: [
    moduleMetadata({
      imports: [
        CommonModule,
        CdkTreeModule,
        IxTreeComponent,
        IxTreeNodeComponent,
        IxNestedTreeNodeComponent,
        IxTreeNodeOutletDirective,
        IxIconComponent
      ],
    }),
  ],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'A hierarchical tree component that inherits from Angular CDK Tree, providing professional-grade tree functionality with TrueNAS styling. Supports flat and nested tree structures with proper accessibility, keyboard navigation, and expand/collapse functionality.'
      }
    }
  }
};

export default meta;
type Story = StoryObj<IxTreeComponent<any, any>>;

// Sample tree data
const TREE_DATA: FileNode[] = [
  {
    name: 'Documents',
    type: 'folder',
    children: [
      {
        name: 'Projects',
        type: 'folder',
        children: [
          {
            name: 'Angular App',
            type: 'folder',
            children: [
              { name: 'package.json', type: 'file' },
              { name: 'README.md', type: 'file' }
            ]
          },
          { name: 'Notes.txt', type: 'file' }
        ]
      }
    ]
  },
  {
    name: 'Downloads',
    type: 'folder',
    children: [
      { name: 'installer.dmg', type: 'file' },
      { name: 'archive.zip', type: 'file' }
    ]
  }
];

export const FlatTree: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Professional flat tree component powered by Angular CDK Tree. Features data-driven architecture, automatic expand/collapse, keyboard navigation, accessibility support, and row-level interaction. Click anywhere on a row to expand/collapse folders.'
      }
    }
  },
  render: () => ({
    props: {
      // Tree flattener - converts hierarchical data to flat structure
      transformer: (node: FileNode, level: number): FileFlatNode => ({
        expandable: !!node.children && node.children.length > 0,
        name: node.name,
        type: node.type,
        level: level,
      }),

      hasChild: (_: number, node: FileFlatNode) => node.expandable,

      getLevel: (node: FileFlatNode) => node.level,

      isExpandable: (node: FileFlatNode) => node.expandable,

      getChildren: (node: FileNode): FileNode[] => node.children || [],

      // Set up tree control and data source
      treeControl: new FlatTreeControl<FileFlatNode>(
        (node: FileFlatNode) => node.level,
        (node: FileFlatNode) => node.expandable
      ),

      get treeFlattener() {
        return new IxTreeFlattener<FileNode, FileFlatNode>(
          this['transformer'],
          this['getLevel'],
          this['isExpandable'],
          this['getChildren']
        );
      },

      get dataSource() {
        const dataSource = new IxTreeFlatDataSource(this['treeControl'], this['treeFlattener']);
        dataSource.data = TREE_DATA;
        return dataSource;
      }
    },
    template: `
      <ix-tree [dataSource]="dataSource" [treeControl]="treeControl">
        <!-- Node definition for leaf nodes -->
        <ix-tree-node *cdkTreeNodeDef="let node" cdkTreeNodePadding>
          <ix-icon [name]="node.type === 'folder' ? 'folder' : 'file'" library="mdi" size="sm" style="margin-right: 8px;"></ix-icon>
          {{ node.name }}
        </ix-tree-node>

        <!-- Node definition for expandable nodes -->
        <ix-tree-node *cdkTreeNodeDef="let node; when: hasChild" cdkTreeNodePadding>
          <ix-icon [name]="node.type === 'folder' ? 'folder' : 'file'" library="mdi" size="sm" style="margin-right: 8px;"></ix-icon>
          {{ node.name }}
        </ix-tree-node>
      </ix-tree>
    `
  }),
};

export const TrueNASStorageTree: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Tree component showcasing TrueNAS-specific MDI icons. Features hardware icons (server, harddisk, nas) alongside filesystem icons (folder, file) with proper MDI chevron arrows for expand/collapse.'
      }
    }
  },
  render: () => ({
    props: {
      // TrueNAS-specific tree data
      truenasData: [
        {
          name: 'TrueNAS Server',
          type: 'server',
          children: [
            {
              name: 'Storage Pools',
              type: 'nas',
              children: [
                {
                  name: 'Pool1',
                  type: 'harddisk',
                  children: [
                    { name: 'Documents', type: 'folder', children: [
                      { name: 'readme.txt', type: 'file' }
                    ] },
                    { name: 'Media', type: 'folder' }
                  ]
                }
              ]
            },
            {
              name: 'Network Shares',
              type: 'share-variant',
              children: [
                { name: 'SMB Share', type: 'folder' },
                { name: 'NFS Export', type: 'folder' }
              ]
            },
            {
              name: 'System Resources',
              type: 'server',
              children: [
                { name: 'CPU Usage', type: 'cpu-64-bit' },
                { name: 'Memory Usage', type: 'memory' },
                { name: 'Databases', type: 'database' }
              ]
            }
          ]
        }
      ],

      transformer: (node: any, level: number) => ({
        expandable: !!node.children && node.children.length > 0,
        name: node.name,
        type: node.type,
        level: level,
      }),

      hasChild: (_: number, node: any) => node.expandable,
      getLevel: (node: any) => node.level,
      isExpandable: (node: any) => node.expandable,
      getChildren: (node: any) => node.children || [],

      treeControl: new FlatTreeControl<any>(
        (node: any) => node.level,
        (node: any) => node.expandable
      ),

      get treeFlattener() {
        return new IxTreeFlattener<any, any>(
          this['transformer'],
          this['getLevel'],
          this['isExpandable'],
          this['getChildren']
        );
      },

      get dataSource() {
        const dataSource = new IxTreeFlatDataSource(this['treeControl'], this['treeFlattener']);
        dataSource.data = this['truenasData'];
        return dataSource;
      }
    },
    template: `
      <ix-tree [dataSource]="dataSource" [treeControl]="treeControl" style="max-width: 400px;">
        <!-- Node definition for leaf nodes -->
        <ix-tree-node *cdkTreeNodeDef="let node" cdkTreeNodePadding>
          <ix-icon [name]="node.type" library="mdi" size="sm" style="margin-right: 8px;"></ix-icon>
          {{ node.name }}
        </ix-tree-node>

        <!-- Node definition for expandable nodes -->
        <ix-tree-node *cdkTreeNodeDef="let node; when: hasChild" cdkTreeNodePadding>
          <ix-icon [name]="node.type" library="mdi" size="sm" style="margin-right: 8px;"></ix-icon>
          {{ node.name }}
        </ix-tree-node>
      </ix-tree>
    `
  }),
};

export const NestedTree: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Professional nested tree component powered by Angular CDK Tree. Uses the hierarchical data structure directly without flattening. Features nested DOM structure, automatic expand/collapse, keyboard navigation, and accessibility support. Perfect for complex tree structures that need to maintain parent-child relationships in the DOM.'
      }
    }
  },
  render: () => ({
    props: {
      hasChild: (_: number, node: FileNode) => {
        const hasChildren = !!node.children && node.children.length > 0;
        return hasChildren;
      },

      // Children accessor function for modern CDK tree
      childrenAccessor: (node: FileNode): FileNode[] => {
        return node.children || [];
      },

      // Use ArrayDataSource for nested tree with only root nodes
      dataSource: new ArrayDataSource(TREE_DATA)
    },
    template: `
      <style>
        .ix-tree-invisible {
          display: none;
        }
      </style>
      <ix-tree [dataSource]="dataSource" [childrenAccessor]="childrenAccessor" class="ix-tree">
        <!-- Node definition for leaf nodes -->
        <ix-nested-tree-node *cdkTreeNodeDef="let node">
          <ix-icon [name]="node.type === 'folder' ? 'folder' : 'file'" library="mdi" size="sm"></ix-icon>
          {{ node.name }}
        </ix-nested-tree-node>

        <!-- Node definition for expandable nodes (component provides toggle arrow) -->
        <ix-nested-tree-node *cdkTreeNodeDef="let node; when: hasChild" cdkTreeNodeToggle>
          <ix-icon [name]="node.type === 'folder' ? 'folder' : 'file'" library="mdi" size="sm"></ix-icon>
          {{ node.name }}
          <ng-container slot="children" ixTreeNodeOutlet></ng-container>
        </ix-nested-tree-node>
      </ix-tree>
    `
  }),
};
