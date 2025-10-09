import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { IxFilePickerComponent } from '../lib/ix-file-picker/ix-file-picker.component';
import { IxFormFieldComponent } from '../lib/ix-form-field/ix-form-field.component';
import { IxIconRegistryService } from '../lib/ix-icon/ix-icon-registry.service';
import { FileSystemItem, FilePickerCallbacks } from '../lib/ix-file-picker/ix-file-picker.interfaces';

const meta: Meta<IxFilePickerComponent> = {
  title: 'Components/File Picker',
  component: IxFilePickerComponent,
  decorators: [
    (story) => {
      // Register MDI icons for Storybook
      if (typeof window !== 'undefined') {
        const mockSanitizer = {
          bypassSecurityTrustHtml: (html: string) => ({
            changingThisBreaksApplicationSecurity: html,
            getTypeName: () => 'HTML'
          }),
          sanitize: (context: any, value: any) => value
        };

        const iconRegistry = new IxIconRegistryService(mockSanitizer as any);

        // Register MDI library with file picker icons
        iconRegistry.registerLibrary({
          name: 'mdi',
          resolver: (iconName: string, options: any = {}) => {
            const mdiIcons: Record<string, string> = {
              'folder': `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M10 4H4C2.89 4 2 4.89 2 6V18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V8C22 6.89 21.11 6 20 6H12L10 4Z"/></svg>`,
              'file': `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6C4.89 2 4 2.89 4 4V20C4 21.11 4.89 22 6 22H18C19.11 22 20 21.11 20 20V8L14 2M18 20H6V4H13V9H18V20Z"/></svg>`,
              'database': `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 3C16.42 3 20 4.79 20 7S16.42 11 12 11 4 9.21 4 7 7.58 3 12 3M4 7V10C4 12.21 7.58 14 12 14S20 12.21 20 10V7C20 9.21 16.42 11 12 11S4 9.21 4 7M4 14V17C4 19.21 7.58 21 12 21S20 19.21 20 17V14C20 16.21 16.42 18 12 18S4 16.21 4 14Z"/></svg>`,
              'harddisk': `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M2 6H22V18H2V6M4 8V16H20V8H4M6 10H18V14H6V10Z"/></svg>`,
              'network-share': `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 5V19H21V5H3M5 7H19V17H5V7M7 9V11H17V9H7M7 13V15H17V13H7Z"/></svg>`,
              'folder-plus': `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M10 4H4C2.89 4 2 4.89 2 6V18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V8C22 6.89 21.11 6 20 6H12L10 4M14 13V11H12V13H10V15H12V17H14V15H16V13H14Z"/></svg>`,
              'loading': `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 4V2A10 10 0 0 0 2 12H4A8 8 0 0 1 12 4Z"/></svg>`,
              'lock': `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 1C8.1 1 5 4.1 5 8V10H4C2.9 10 2 10.9 2 12V22C2 23.1 2.9 24 4 24H20C21.1 24 22 23.1 22 22V12C22 10.9 21.1 10 20 10H19V8C19 4.1 15.9 1 12 1M12 3C14.8 3 17 5.2 17 8V10H7V8C7 5.2 9.2 3 12 3Z"/></svg>`,
              'folder-open': `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 20H4C2.89 20 2 19.11 2 18V6C2 4.89 2.89 4 4 4H10L12 6H19A2 2 0 0 1 2 2V18L19 20Z"/></svg>`
            };
            
            const svgContent = mdiIcons[iconName];
            return svgContent || null;
          }
        });

        (window as any).__storybookIconRegistry = iconRegistry;
      }

      return story();
    }
  ],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'A file picker component that allows users to browse and select files or folders from a file system.'
      }
    }
  },
  argTypes: {
    mode: {
      control: { type: 'select' },
      options: ['file', 'folder', 'dataset', 'zvol', 'any'],
      description: 'Selection mode for the file picker',
    },
    multiSelect: {
      control: 'boolean',
      description: 'Allow selection of multiple items',
    },
    allowCreate: {
      control: 'boolean',
      description: 'Show "New Folder" button',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the file picker is disabled',
    },
    startPath: {
      control: 'text',
      description: 'Initial directory path',
    }
  }
};

export default meta;
type Story = StoryObj<IxFilePickerComponent>;

// Mock file system with varied file sizes and dates for testing formatting
const createMockFileSystem = (): Record<string, FileSystemItem[]> => ({
  '/mnt': [
    {
      path: '/mnt/tank',
      name: 'tank',
      type: 'dataset',
      size: undefined,
      modified: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      permissions: 'write'
    },
    {
      path: '/mnt/backup',
      name: 'backup',
      type: 'dataset',
      size: undefined,
      modified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last week
      permissions: 'write'
    }
  ],
  '/mnt/tank': [
    {
      path: '/mnt/tank/documents',
      name: 'documents',
      type: 'folder',
      size: undefined,
      modified: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      permissions: 'write'
    },
    {
      path: '/mnt/tank/large-file.iso',
      name: 'large-file.iso',
      type: 'file',
      size: 4294967296, // 4GB
      modified: new Date(), // Today
      permissions: 'write'
    },
    {
      path: '/mnt/tank/medium-video.mp4',
      name: 'medium-video.mp4',
      type: 'file',
      size: 268435456, // 256MB
      modified: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      permissions: 'write'
    },
    {
      path: '/mnt/tank/small-doc.txt',
      name: 'small-doc.txt',
      type: 'file',
      size: 1024, // 1KB
      modified: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      permissions: 'read'
    },
    {
      path: '/mnt/tank/vm-storage',
      name: 'vm-storage',
      type: 'zvol',
      size: 10737418240, // 10GB
      modified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      permissions: 'write'
    }
  ],
  '/mnt/tank/documents': [
    {
      path: '/mnt/tank/documents/config.json',
      name: 'config.json',
      type: 'file',
      size: 2048, // 2KB
      modified: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      permissions: 'write'
    },
    {
      path: '/mnt/tank/documents/backup.tar.gz',
      name: 'backup.tar.gz',
      type: 'file',
      size: 52428800, // 50MB
      modified: new Date(2024, 0, 15), // Different date
      permissions: 'read'
    }
  ]
});

const mockCallbacks: FilePickerCallbacks = {
  getChildren: async (path: string): Promise<FileSystemItem[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockFs = createMockFileSystem();
    const items = mockFs[path] || [];
    return items;
  },
  
  validatePath: async (path: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const mockFs = createMockFileSystem();
    return Object.keys(mockFs).includes(path) || 
           Object.values(mockFs).flat().some(item => item.path === path);
  },
  
  createFolder: async (parentPath: string, name: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return `${parentPath}/${name}`;
  }
};

export const Default: Story = {
  render: (args) => ({
    props: {
      ...args,
      callbacks: mockCallbacks,
      onSelectionChange: (selection: string | string[]) => {
        // Handle selection changes
      }
    },
    template: `
      <ix-form-field label="Select a file or folder">
        <ix-file-picker
          [mode]="mode"
          [multiSelect]="multiSelect"
          [allowCreate]="allowCreate"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [startPath]="startPath"
          [callbacks]="callbacks"
          (selectionChange)="onSelectionChange($event)">
        </ix-file-picker>
      </ix-form-field>
    `,
    moduleMetadata: {
      imports: [IxFormFieldComponent, IxFilePickerComponent],
    }
  }),
  args: {
    mode: 'any',
    multiSelect: false,
    allowCreate: true,
    placeholder: 'Choose a file or folder...',
    disabled: false,
    startPath: '/mnt/tank'
  }
};

const createMdiShowcaseFileSystem = (): Record<string, FileSystemItem[]> => ({
  '/mnt': [
    {
      path: '/mnt/showcase',
      name: 'MDI Icon Showcase',
      type: 'folder',
      size: undefined,
      modified: new Date(),
      permissions: 'write'
    }
  ],
  '/mnt/showcase': [
    // TrueNAS-specific items with MDI icons
    {
      path: '/mnt/showcase/tank-pool',
      name: 'tank-pool',
      type: 'dataset',
      size: undefined,
      modified: new Date(Date.now() - 60 * 60 * 1000),
      permissions: 'write'
    },
    {
      path: '/mnt/showcase/vm-storage.zvol',
      name: 'vm-storage.zvol',
      type: 'zvol',
      size: 21474836480, // 20GB
      modified: new Date(Date.now() - 2 * 60 * 60 * 1000),
      permissions: 'write'
    },
    {
      path: '/mnt/showcase/nfs-share',
      name: 'nfs-share',
      type: 'mountpoint',
      size: undefined,
      modified: new Date(Date.now() - 30 * 60 * 1000),
      permissions: 'write'
    },
    // Regular folders and files
    {
      path: '/mnt/showcase/documents',
      name: 'documents',
      type: 'folder',
      size: undefined,
      modified: new Date(Date.now() - 60 * 60 * 1000),
      permissions: 'write'
    },
    {
      path: '/mnt/showcase/media',
      name: 'media',
      type: 'folder',
      size: undefined,
      modified: new Date(Date.now() - 2 * 60 * 60 * 1000),
      permissions: 'write'
    },
    // Various file types
    {
      path: '/mnt/showcase/readme.txt',
      name: 'readme.txt',
      type: 'file',
      size: 1536,
      modified: new Date(),
      permissions: 'write'
    },
    {
      path: '/mnt/showcase/config.json',
      name: 'config.json',
      type: 'file',
      size: 2048,
      modified: new Date(Date.now() - 30 * 60 * 1000),
      permissions: 'write'
    },
    {
      path: '/mnt/showcase/backup.tar.gz',
      name: 'backup.tar.gz',
      type: 'file',
      size: 104857600, // 100MB
      modified: new Date(Date.now() - 60 * 60 * 1000),
      permissions: 'read'
    },
    {
      path: '/mnt/showcase/photo.jpg',
      name: 'photo.jpg',
      type: 'file',
      size: 5242880, // 5MB
      modified: new Date(Date.now() - 90 * 60 * 1000),
      permissions: 'write'
    },
    {
      path: '/mnt/showcase/video.mp4',
      name: 'video.mp4',
      type: 'file',
      size: 1073741824, // 1GB
      modified: new Date(Date.now() - 2 * 60 * 60 * 1000),
      permissions: 'write'
    },
    {
      path: '/mnt/showcase/system.iso',
      name: 'system.iso',
      type: 'file',
      size: 4294967296, // 4GB
      modified: new Date(Date.now() - 24 * 60 * 60 * 1000),
      permissions: 'read'
    },
    // Locked item to show permission icon
    {
      path: '/mnt/showcase/restricted.log',
      name: 'restricted.log',
      type: 'file',
      size: 512,
      modified: new Date(Date.now() - 3 * 60 * 60 * 1000),
      permissions: 'none'
    }
  ]
});

const mdiShowcaseCallbacks: FilePickerCallbacks = {
  getChildren: async (path: string): Promise<FileSystemItem[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const mockFs = createMdiShowcaseFileSystem();
    return mockFs[path] || [];
  },
  
  validatePath: async (path: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const mockFs = createMdiShowcaseFileSystem();
    return Object.keys(mockFs).includes(path) || 
           Object.values(mockFs).flat().some(item => item.path === path);
  },
  
  createFolder: async (parentPath: string, name: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return `${parentPath}/${name}`;
  }
};

export const MdiIconShowcase: Story = {
  render: (args) => ({
    props: {
      ...args,
      callbacks: mdiShowcaseCallbacks,
      onSelectionChange: (selection: string | string[]) => {
        // Handle selection changes
      }
    },
    template: `
      <ix-form-field label="TrueNAS File Picker with MDI Icons">
        <ix-file-picker
          [mode]="mode"
          [multiSelect]="multiSelect"
          [allowCreate]="allowCreate"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [startPath]="startPath"
          [callbacks]="callbacks"
          (selectionChange)="onSelectionChange($event)">
        </ix-file-picker>
      </ix-form-field>
    `,
    moduleMetadata: {
      imports: [IxFormFieldComponent, IxFilePickerComponent],
    }
  }),
  args: {
    mode: 'any',
    multiSelect: true,
    allowCreate: true,
    placeholder: 'Browse files with MDI icons...',
    disabled: false,
    startPath: '/mnt/showcase'
  },
  parameters: {
    docs: {
      description: {
        story: `File picker showcase demonstrating Material Design Icons (MDI) integration. Features:
        
**TrueNAS-specific Icons:**
- Dataset: Database icon
- Zvol: Hard disk icon  
- Mount point: Network share icon
- Folders and files: Appropriate MDI icons
        
**UI Enhancements:**
- Folder plus icon for "New Folder" button
- Loading spinner for async operations
- Lock icon for restricted files
- Open folder icon for empty states
        
Click the input field to open the file picker and explore the various icon types in the showcase directory.`
      }
    }
  }
};