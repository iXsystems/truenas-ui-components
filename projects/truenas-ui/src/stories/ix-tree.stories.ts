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

// Import Lucide icons we need
import { Folder, File } from 'lucide';

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
      // Register Lucide icons for this story
      if (typeof window !== 'undefined') {
        const mockSanitizer = {
          bypassSecurityTrustHtml: (html: string) => ({
            changingThisBreaksApplicationSecurity: html,
            getTypeName: () => 'HTML'
          }),
          sanitize: (context: any, value: any) => value
        };

        const iconRegistry = new IxIconRegistryService(mockSanitizer as any);

        // Register Lucide library with folder and file icons
        iconRegistry.registerLibrary({
          name: 'lucide',
          resolver: (iconName: string, options: any = {}) => {
            const iconMap: Record<string, any> = {
              'folder': Folder,
              'file': File
            };

            const iconData = iconMap[iconName];

            if (iconData && Array.isArray(iconData)) {
              try {
                // Lucide icons are arrays of path elements
                const pathElements = iconData.map((path: any) => {
                  if (Array.isArray(path) && path[0] === 'path') {
                    const attrs = path[1];
                    let pathString = `<path`;
                    Object.entries(attrs).forEach(([key, value]) => {
                      pathString += ` ${key}="${value}"`;
                    });
                    pathString += `/>`;
                    return pathString;
                  }
                  return '';
                }).join('');

                const svgString = `
                  <svg xmlns="http://www.w3.org/2000/svg"
                       width="${options.size || 24}"
                       height="${options.size || 24}"
                       viewBox="0 0 24 24"
                       fill="none"
                       stroke="${options.color || 'currentColor'}"
                       stroke-width="${options.strokeWidth || 2}"
                       stroke-linecap="round"
                       stroke-linejoin="round">
                    ${pathElements}
                  </svg>
                `;

                return svgString;
              } catch (error) {
                console.warn('Failed to render Lucide icon:', iconName, error);
              }
            }
            return null;
          },
          defaultOptions: { size: 20, strokeWidth: 2 }
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
          <ix-icon [name]="node.type === 'folder' ? 'lucide:folder' : 'lucide:file'" size="20" style="margin-right: 8px;"></ix-icon>
          {{ node.name }}
        </ix-tree-node>

        <!-- Node definition for expandable nodes -->
        <ix-tree-node *cdkTreeNodeDef="let node; when: hasChild" cdkTreeNodePadding>
          <ix-icon [name]="node.type === 'folder' ? 'lucide:folder' : 'lucide:file'" size="20" style="margin-right: 8px;"></ix-icon>
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
          <ix-icon [name]="node.type === 'folder' ? 'lucide:folder' : 'lucide:file'" size="20"></ix-icon>
          {{ node.name }}
        </ix-nested-tree-node>

        <!-- Node definition for expandable nodes (component provides toggle arrow) -->
        <ix-nested-tree-node *cdkTreeNodeDef="let node; when: hasChild" cdkTreeNodeToggle>
          <ix-icon [name]="node.type === 'folder' ? 'lucide:folder' : 'lucide:file'" size="20"></ix-icon>
          {{ node.name }}
          <ng-container slot="children" ixTreeNodeOutlet></ng-container>
        </ix-nested-tree-node>
      </ix-tree>
    `
  }),
};
