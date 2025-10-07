import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';

import { IxTreeComponent, FlatTreeControl, IxTreeFlatDataSource, IxTreeFlattener, ArrayDataSource } from '../lib/ix-tree/ix-tree.component';
import { IxTreeNodeComponent } from '../lib/ix-tree/ix-tree-node.component';
import { IxNestedTreeNodeComponent } from '../lib/ix-tree/ix-nested-tree-node.component';
import { IxTreeNodeOutletDirective } from '../lib/ix-tree/ix-tree-node-outlet.directive';
import { CdkTreeModule } from '@angular/cdk/tree';
import { IxIconComponent } from '../lib/ix-icon/ix-icon.component';
import { IxIconRegistryService } from '../lib/ix-icon/ix-icon-registry.service';

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
    (story) => {
      // Register icons for this story
      if (typeof window !== 'undefined') {
        const mockSanitizer = {
          bypassSecurityTrustHtml: (html: string) => ({
            changingThisBreaksApplicationSecurity: html,
            getTypeName: () => 'HTML'
          }),
          sanitize: (context: any, value: any) => value
        };

        const iconRegistry = new IxIconRegistryService(mockSanitizer as any);

        // Register MDI library with TrueNAS icons
        iconRegistry.registerLibrary({
          name: 'mdi',
          resolver: (iconName: string, options: any = {}) => {
            // Mock MDI icons for Storybook demo
            const mdiIcons: Record<string, string> = {
              'harddisk': `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M2 6H22V18H2V6M4 8V16H20V8H4M6 10H18V14H6V10Z"/></svg>`,
              'server': `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 1H20C21.11 1 22 1.89 22 3V7C22 8.11 21.11 9 20 9H4C2.89 9 2 8.11 2 7V3C2 1.89 2.89 1 4 1M4 3V7H20V3H4M4 11H20C21.11 11 22 11.89 22 13V17C22 18.11 21.11 19 20 19H4C2.89 19 2 18.11 2 17V13C2 11.89 2.89 11 4 11M4 13V17H20V13H4M4 21H20C21.11 21 22 21.89 22 23V27C22 28.11 21.11 29 20 29H4C2.89 29 2 28.11 2 27V23C2 21.89 2.89 21 4 21M4 23V27H20V23H4Z"/></svg>`,
              'nas': `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 6H20C21.1 6 22 6.9 22 8V16C22 17.1 21.1 18 20 18H4C2.9 18 2 17.1 2 16V8C2 6.9 2.9 6 4 6M4 8V16H20V8H4M6 10H8V14H6V10M10 10H12V14H10V10M14 10H16V14H14V10M18 10H20V14H18V10Z"/></svg>`,
              'database': `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 3C16.42 3 20 4.79 20 7S16.42 11 12 11 4 9.21 4 7 7.58 3 12 3M4 7V10C4 12.21 7.58 14 12 14S20 12.21 20 10V7C20 9.21 16.42 11 12 11S4 9.21 4 7M4 14V17C4 19.21 7.58 21 12 21S20 19.21 20 17V14C20 16.21 16.42 18 12 18S4 16.21 4 14Z"/></svg>`,
              'storage': `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M22 8V16C22 17.1 21.1 18 20 18H16C14.9 18 14 17.1 14 16V8C14 6.9 14.9 6 16 6H20C21.1 6 22 6.9 22 8M20 8H16V16H20V8M12 8V16C12 17.1 11.1 18 10 18H6C4.9 18 4 17.1 4 16V8C4 6.9 4.9 6 6 6H10C11.1 6 12 6.9 12 8M10 8H6V16H10V8M2 8V16C2 17.1 2.9 18 4 18H20C21.1 18 22 17.1 22 16V8C22 6.9 21.1 6 20 6H4C2.9 6 2 6.9 2 8Z"/></svg>`,
              'folder': `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M10 4H4C2.89 4 2 4.89 2 6V18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V8C22 6.89 21.11 6 20 6H12L10 4Z"/></svg>`,
              'file': `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6C4.89 2 4 2.89 4 4V20C4 21.11 4.89 22 6 22H18C19.11 22 20 21.11 20 20V8L14 2M18 20H6V4H13V9H18V20Z"/></svg>`,
              'memory': `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M8 5V7H16V5H8M2 9V15H4V17H6V15H8V17H10V15H14V17H16V15H18V17H20V15H22V9H20V7H18V9H16V7H14V9H10V7H8V9H6V7H4V9H2M4 11H20V13H4V11Z"/></svg>`,
              'cpu': `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M6 4V6H4V8H2V10H4V14H2V16H4V18H6V20H8V18H10V20H12V18H14V20H16V18H18V16H20V14H18V10H20V8H18V6H16V4H14V6H12V4H10V6H8V4H6M8 8H16V16H8V8M10 10V14H14V10H10Z"/></svg>`,
              'network-share': `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 5V19H21V5H3M5 7H19V17H5V7M7 9V11H17V9H7M7 13V15H17V13H7Z"/></svg>`,
              'chevron-right': `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M8.59 16.58L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.58Z"/></svg>`,
              'chevron-down': `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7.41 8.58L12 13.17L16.59 8.58L18 10L12 16L6 10L7.41 8.58Z"/></svg>`
            };
            
            const svgContent = mdiIcons[iconName];
            return svgContent || null;
          }
        });

        // Make it available globally for the component
        (window as any).__storybookIconRegistry = iconRegistry;
      }

      return story();
    }
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
              type: 'storage',
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
              type: 'network-share',
              children: [
                { name: 'SMB Share', type: 'folder' },
                { name: 'NFS Export', type: 'folder' }
              ]
            },
            {
              name: 'System Resources',
              type: 'server',
              children: [
                { name: 'CPU Usage', type: 'cpu' },
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
