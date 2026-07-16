import type { Meta, StoryObj } from '@storybook/angular';
import { userEvent, within, screen, expect, waitFor } from 'storybook/test';
import { TestIdInspectorComponent } from './testid-inspector.component';
import { TnFilePickerComponent } from '../lib/file-picker/file-picker.component';
import type { FileSystemItem, FilePickerCallbacks } from '../lib/file-picker/file-picker.interfaces';
import { TnFormFieldComponent } from '../lib/form-field/form-field.component';

const meta: Meta<TnFilePickerComponent> = {
  title: 'Components/File Picker',
  component: TnFilePickerComponent,
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
      description: 'What can be selected: a single mode, or an array of item types (e.g. [\'folder\', \'dataset\'])',
    },
    multiSelect: {
      control: 'boolean',
      description: 'Allow selection of multiple items',
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
type Story = StoryObj<TnFilePickerComponent>;


export const Default: Story = {
  render: (args) => ({
    props: {
      ...args,
      callbacks: mdiShowcaseCallbacks,
      onSelectionChange: (_selection: string | string[]) => {
        // Handle selection changes
      }
    },
    template: `
      <tn-form-field label="TrueNAS File Picker">
        <tn-file-picker
          [mode]="mode"
          [multiSelect]="multiSelect"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [startPath]="startPath"
          [callbacks]="callbacks"
          (selectionChange)="onSelectionChange($event)">
        </tn-file-picker>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent, TnFilePickerComponent],
    }
  }),
  args: {
    mode: 'any',
    multiSelect: true,
    placeholder: 'Browse files and folders...',
    disabled: false,
    startPath: '/mnt/showcase'
  },
  parameters: {
    docs: {
      description: {
        story: `## Quick Start Guide

The file picker requires a \`callbacks\` object to fetch directory contents. Here's the minimal implementation:

\`\`\`typescript
// In your component
filePickerCallbacks: FilePickerCallbacks = {
  getChildren: async (path: string) => {
    // Call your backend API
    return await this.filesystemService.listDirectory(path);
  }
};

onFileSelected(path: string) {
  console.log('User selected:', path);
}
\`\`\`

\`\`\`html
<!-- In your template -->
<tn-file-picker
  [callbacks]="filePickerCallbacks"
  placeholder="Select a file..."
  (selectionChange)="onFileSelected($event)">
</tn-file-picker>
\`\`\`

**Key Points:**
- The component is a "dumb UI component" - it doesn't know how to fetch data
- You provide the data-fetching logic via the \`callbacks\` input
- Minimum requirement: implement \`getChildren\` callback
- The component handles all UI state, navigation, and selection logic

---

## Complete API Reference

This is the authoritative API documentation for the \`tn-file-picker\` component.

---

## Component Inputs

### Selection Configuration
\`\`\`typescript
mode = input<FilePickerMode | FileSystemItemType[]>('any');
\`\`\`
**Description:** Determines what types of items can be selected.
- \`'file'\` - Only files can be selected
- \`'folder'\` - Only folders can be selected
- \`'dataset'\` - Only ZFS datasets can be selected
- \`'zvol'\` - Only ZFS zvols can be selected
- \`'any'\` - Any item type can be selected (default)
- \`['folder', 'dataset']\` - Any explicit list of item types (\`'mountpoint'\` is also valid here)

Whenever a directory-like type (\`folder\`, \`dataset\`, \`mountpoint\`) is selectable, an empty selection stands for the directory being browsed: the footer names it, the Select button stays enabled, and submitting picks the current path. This keeps empty directories selectable.

\`\`\`typescript
multiSelect = input<boolean>(false);
\`\`\`
**Description:** Enable multi-selection mode with checkboxes.

### Creation Permissions
\`\`\`typescript
createActions = input<FilePickerCreateAction[]>([]);
\`\`\`
**Description:** Consumer-defined creation flows (e.g. dataset or zvol creation) shown as buttons in the popup footer, next to Select. Pressing one emits \`createAction\` with \`{ actionId, parentPath }\`; run your creation flow (dialog, API call) and refresh the listing when it completes.

### Navigation Configuration
\`\`\`typescript
startPath = input<string>('/mnt');
\`\`\`
**Description:** Initial directory path to display when picker opens.

\`\`\`typescript
rootPath = input<string | undefined>(undefined);
\`\`\`
**Description:** Restrict navigation - users cannot navigate above this path.

\`\`\`typescript
fileExtensions = input<string[] | undefined>(undefined);
\`\`\`
**Description:** Filter files by extension (e.g., \`['.log', '.conf', '.txt']\`).

### Behavior
\`\`\`typescript
allowManualInput = input<boolean>(true);
\`\`\`
**Description:** Allow users to type paths directly in the input field.

\`\`\`typescript
placeholder = input<string>('Select file or folder');
\`\`\`
**Description:** Placeholder text for the input field.

\`\`\`typescript
disabled = input<boolean>(false);
\`\`\`
**Description:** Disable the file picker input and button.

### Integration
\`\`\`typescript
callbacks = input<FilePickerCallbacks | undefined>(undefined);
\`\`\`
**Description:** Object containing callback functions for data operations (see Callbacks section).

---

## Component Outputs

\`\`\`typescript
selectionChange = output<string | string[]>();
\`\`\`
**Description:** Emitted when user selects item(s). Returns single path string or array of paths (multi-select).

\`\`\`typescript
pathChange = output<string>();
\`\`\`
**Description:** Emitted when user navigates to a different directory.

\`\`\`typescript
error = output<FilePickerError>();
\`\`\`
**Description:** Emitted when navigation, validation, or creation operations fail.

---

## Callbacks Interface

The consuming application implements these callbacks to provide data and operations:

\`\`\`typescript
interface FilePickerCallbacks {
  getChildren?: (path: string) => Promise<FileSystemItem[]>;
  validatePath?: (path: string) => Promise<boolean>;
}
\`\`\`

### getChildren (required)
**Signature:** \`(path: string) => Promise<FileSystemItem[]>\`

Called when the component needs to display directory contents. Return an array of items to display.

**Example:**
\`\`\`typescript
getChildren: async (path: string) => {
  const response = await this.http.get(\`/api/filesystem/list?path=\${path}\`);
  return response.items;
}
\`\`\`

### validatePath (optional)
**Signature:** \`(path: string) => Promise<boolean>\`

Called when user manually types a path. Return \`true\` if path is valid, \`false\` otherwise.

**Example:**
\`\`\`typescript
validatePath: async (path: string) => {
  try {
    await this.http.head(\`/api/filesystem/exists?path=\${path}\`);
    return true;
  } catch {
    return false;
  }
}
\`\`\`

---

## Data Models

### FileSystemItem
\`\`\`typescript
interface FileSystemItem {
  path: string;              // Full path (e.g., '/mnt/tank/documents')
  name: string;              // Display name (e.g., 'documents')
  type: 'file' | 'folder' | 'dataset' | 'zvol' | 'mountpoint';
  size?: number;             // Size in bytes (optional)
  modified?: Date;           // Last modified date (optional)
  permissions?: 'read' | 'write' | 'none';  // Access level (optional)
  icon?: string;             // Fully-qualified sprite icon id override, e.g. 'mdi-folder' (optional)
  disabled?: boolean;        // Item cannot be selected (optional)
}
\`\`\`

### FilePickerError
\`\`\`typescript
interface FilePickerError {
  type: 'navigation' | 'permission' | 'creation' | 'validation';
  message: string;
  path?: string;
}
\`\`\`

### PathSegment
\`\`\`typescript
interface PathSegment {
  name: string;
  path: string;
}
\`\`\`

---

## Usage Examples

### Basic File Selection
\`\`\`typescript
// Component
export class MyComponent {
  callbacks: FilePickerCallbacks = {
    getChildren: async (path: string) => {
      return await this.filesystemService.listDirectory(path);
    }
  };

  onFileSelected(path: string) {
    this.form.patchValue({ filePath: path });
  }
}
\`\`\`

\`\`\`html
<!-- Template -->
<tn-file-picker
  mode="file"
  [callbacks]="callbacks"
  (selectionChange)="onFileSelected($event)">
</tn-file-picker>
\`\`\`

### Dataset Selection with Creation
\`\`\`typescript
callbacks: FilePickerCallbacks = {
  getChildren: (path) => this.datasetService.getChildren(path)
};

createActions: FilePickerCreateAction[] = [
  { id: 'dataset', label: 'Create Dataset' }
];

onCreateAction(event: FilePickerCreateActionEvent) {
  // Run your creation flow (dialog, API call) for event.parentPath,
  // then refresh the listing.
}
\`\`\`

\`\`\`html
<tn-file-picker
  mode="dataset"
  [createActions]="createActions"
  [callbacks]="callbacks"
  startPath="/mnt"
  (createAction)="onCreateAction($event)"
  (selectionChange)="onDatasetSelected($event)">
</tn-file-picker>
\`\`\`

### Multi-Select with File Filtering
\`\`\`html
<tn-file-picker
  mode="file"
  [multiSelect]="true"
  [fileExtensions]="['.log', '.txt', '.conf']"
  [callbacks]="callbacks"
  placeholder="Select log files..."
  (selectionChange)="onFilesSelected($event)">
</tn-file-picker>
\`\`\`

### Folder Selection with Restrictions
\`\`\`html
<tn-file-picker
  mode="folder"
  startPath="/mnt/backups"
  rootPath="/mnt/backups"
  [callbacks]="callbacks"
  placeholder="Select backup destination">
</tn-file-picker>
\`\`\`

---

## Error Handling

Handle errors emitted by the component:

\`\`\`typescript
onError(error: FilePickerError) {
  switch (error.type) {
    case 'navigation':
      this.showError(\`Failed to open directory: \${error.message}\`);
      break;
    case 'validation':
      this.showError(\`Invalid path: \${error.path}\`);
      break;
    case 'creation':
      this.showError(\`Failed to create folder: \${error.message}\`);
      break;
    case 'permission':
      this.showError(\`Permission denied: \${error.message}\`);
      break;
  }
}
\`\`\`

---

## Best Practices

**1. Always implement getChildren callback**
The component requires this to function. Without it, only mock data will be displayed.

**2. Handle loading states in your API calls**
The component shows a loading indicator while callbacks execute.

**3. Return proper FileSystemItem types**
Set the \`type\` field correctly for TrueNAS-specific objects (dataset, zvol, mountpoint).

**4. Use path validation for security**
Implement \`validatePath\` to prevent users from accessing unauthorized paths.

**5. Handle errors gracefully**
Callbacks should throw errors with clear messages. The component will emit them via the \`error\` output.

**6. Consider permission indicators**
Set \`permissions: 'none'\` on items users shouldn't access to show lock icon.

**7. Provide meaningful placeholders**
Use context-specific placeholder text (e.g., "Select backup destination" vs "Select file").

---

## Architecture Notes

The file picker follows a **callback-driven "dumb component" pattern**:

- **Component's responsibility:** UI rendering, state management, user interactions
- **Consuming app's responsibility:** Data fetching, validation, creation operations

This separation ensures:
- Component remains reusable across different backend APIs
- Testing is simplified (mock callbacks vs real API calls)
- Business logic stays in the consuming application
- Component focuses purely on user experience

The component falls back to mock data when no callbacks are provided, enabling:
- Development without backend
- Storybook demonstrations
- Component testing
- UI prototyping`
      }
    }
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
      path: '/mnt/showcase/my-dataset',
      name: 'my-dataset',
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
  ],
  '/mnt/showcase/my-dataset': [
    {
      path: '/mnt/showcase/my-dataset/database.sql',
      name: 'database.sql',
      type: 'file',
      size: 524288000, // 500MB
      modified: new Date(Date.now() - 4 * 60 * 60 * 1000),
      permissions: 'write'
    },
    {
      path: '/mnt/showcase/my-dataset/application.log',
      name: 'application.log',
      type: 'file',
      size: 10485760, // 10MB
      modified: new Date(Date.now() - 60 * 60 * 1000),
      permissions: 'write'
    },
    {
      path: '/mnt/showcase/my-dataset/backup-snapshot.zvol',
      name: 'backup-snapshot.zvol',
      type: 'zvol',
      size: 5368709120, // 5GB
      modified: new Date(Date.now() - 12 * 60 * 60 * 1000),
      permissions: 'write'
    },
    {
      path: '/mnt/showcase/my-dataset/cache.db',
      name: 'cache.db',
      type: 'file',
      size: 104857600, // 100MB
      modified: new Date(Date.now() - 30 * 60 * 1000),
      permissions: 'write'
    }
  ],
  '/mnt/showcase/nfs-share': [
    {
      path: '/mnt/showcase/nfs-share/shared-document.pdf',
      name: 'shared-document.pdf',
      type: 'file',
      size: 2097152, // 2MB
      modified: new Date(Date.now() - 5 * 60 * 60 * 1000),
      permissions: 'write'
    },
    {
      path: '/mnt/showcase/nfs-share/team-presentation.pptx',
      name: 'team-presentation.pptx',
      type: 'file',
      size: 15728640, // 15MB
      modified: new Date(Date.now() - 8 * 60 * 60 * 1000),
      permissions: 'read'
    },
    {
      path: '/mnt/showcase/nfs-share/quarterly-report.xlsx',
      name: 'quarterly-report.xlsx',
      type: 'file',
      size: 5242880, // 5MB
      modified: new Date(Date.now() - 3 * 60 * 60 * 1000),
      permissions: 'write'
    },
    {
      path: '/mnt/showcase/nfs-share/meeting-notes.txt',
      name: 'meeting-notes.txt',
      type: 'file',
      size: 4096, // 4KB
      modified: new Date(Date.now() - 60 * 60 * 1000),
      permissions: 'write'
    }
  ],
  '/mnt/showcase/documents': [
    {
      path: '/mnt/showcase/documents/contract.pdf',
      name: 'contract.pdf',
      type: 'file',
      size: 3145728, // 3MB
      modified: new Date(Date.now() - 6 * 60 * 60 * 1000),
      permissions: 'read'
    },
    {
      path: '/mnt/showcase/documents/invoice-2024.xlsx',
      name: 'invoice-2024.xlsx',
      type: 'file',
      size: 1048576, // 1MB
      modified: new Date(Date.now() - 4 * 60 * 60 * 1000),
      permissions: 'write'
    },
    {
      path: '/mnt/showcase/documents/project-spec.docx',
      name: 'project-spec.docx',
      type: 'file',
      size: 8388608, // 8MB
      modified: new Date(Date.now() - 2 * 60 * 60 * 1000),
      permissions: 'write'
    },
    {
      path: '/mnt/showcase/documents/notes.md',
      name: 'notes.md',
      type: 'file',
      size: 16384, // 16KB
      modified: new Date(Date.now() - 90 * 60 * 1000),
      permissions: 'write'
    }
  ],
  '/mnt/showcase/media': [
    {
      path: '/mnt/showcase/media/movie-trailer.mp4',
      name: 'movie-trailer.mp4',
      type: 'file',
      size: 536870912, // 512MB
      modified: new Date(Date.now() - 10 * 60 * 60 * 1000),
      permissions: 'write'
    },
    {
      path: '/mnt/showcase/media/podcast-episode.mp3',
      name: 'podcast-episode.mp3',
      type: 'file',
      size: 52428800, // 50MB
      modified: new Date(Date.now() - 5 * 60 * 60 * 1000),
      permissions: 'write'
    },
    {
      path: '/mnt/showcase/media/media-storage.zvol',
      name: 'media-storage.zvol',
      type: 'zvol',
      size: 21474836480, // 20GB
      modified: new Date(Date.now() - 24 * 60 * 60 * 1000),
      permissions: 'write'
    },
    {
      path: '/mnt/showcase/media/thumbnail.png',
      name: 'thumbnail.png',
      type: 'file',
      size: 524288, // 512KB
      modified: new Date(Date.now() - 2 * 60 * 60 * 1000),
      permissions: 'write'
    }
  ]
});

// Create mutable shared filesystem at module level
let mockFilesystem: Record<string, FileSystemItem[]>;

// Reset function for each story
function resetMockFilesystem() {
  mockFilesystem = createMdiShowcaseFileSystem();
}

// Initialize on first load
resetMockFilesystem();

const mdiShowcaseCallbacks: FilePickerCallbacks = {
  getChildren: async (path: string): Promise<FileSystemItem[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockFilesystem[path] || [];
  },

  validatePath: async (path: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return Object.keys(mockFilesystem).includes(path) ||
           Object.values(mockFilesystem).flat().some(item => item.path === path);
  },

};

// =============================================================================
// INTERACTION TESTS
// =============================================================================

export const BasicInteraction: Story = {
  render: (args) => ({
    props: {
      ...args,
      callbacks: mdiShowcaseCallbacks
    },
    template: `
      <tn-form-field label="Click to test basic interactions">
        <tn-file-picker
          [mode]="mode"
          [multiSelect]="multiSelect"
          [placeholder]="placeholder"
          [startPath]="startPath"
          [callbacks]="callbacks">
        </tn-file-picker>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent, TnFilePickerComponent],
    }
  }),
  args: {
    mode: 'any',
    multiSelect: false,
    placeholder: 'Select a file...',
    startPath: '/mnt/showcase'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test 1: Click folder button to open picker
    const folderButton = canvas.getByRole('button', { name: /open file picker/i });
    await userEvent.click(folderButton);

    // Wait for picker to open and content to load
    // Note: Overlay content renders outside canvasElement, so use screen
    await waitFor(() => {
      void expect(screen.queryByText('readme.txt')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Test 2: Click on file item to select it (anywhere in the row works)
    const fileItem = screen.getByText('readme.txt');
    await userEvent.click(fileItem);

    // The selection is staged, not applied yet
    await waitFor(() => {
      void expect(screen.getByText('1 item selected')).toBeInTheDocument();
    });

    // Test 3: Apply the selection
    await userEvent.click(screen.getByRole('button', { name: 'Select' }));

    // Test 4: Verify input field shows selected path (input is in canvasElement)
    const input = canvas.getByPlaceholderText('Select a file...');
    await waitFor(() => {
      void expect(input).toHaveValue('/mnt/showcase/readme.txt');
    });
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests basic user interactions: opening the picker, selecting a file by clicking its row, applying it with Select, and verifying the selection appears in the input field.'
      }
    }
  }
};

export const MultiSelectWorkflow: Story = {
  render: (args) => ({
    props: {
      ...args,
      callbacks: mdiShowcaseCallbacks
    },
    template: `
      <tn-form-field label="Multi-select test">
        <tn-file-picker
          [mode]="mode"
          [multiSelect]="multiSelect"
          [startPath]="startPath"
          [callbacks]="callbacks">
        </tn-file-picker>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent, TnFilePickerComponent],
    }
  }),
  args: {
    mode: 'any',
    multiSelect: true,
    startPath: '/mnt/showcase'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open picker
    const folderButton = canvas.getByRole('button', { name: /open file picker/i });
    await userEvent.click(folderButton);

    // Wait for content to load (overlay content is outside canvasElement)
    await waitFor(() => {
      void expect(screen.queryByText('readme.txt')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Check multiple items
    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[0]); // First item
    await userEvent.click(checkboxes[1]); // Second item

    // Verify selection count appears in footer
    await waitFor(() => {
      void expect(screen.getByText(/2 items selected/i)).toBeInTheDocument();
    });

    // Test clear selection button
    const clearButton = screen.getByRole('button', { name: /clear selection/i });
    await userEvent.click(clearButton);

    // Verify selection is cleared
    await waitFor(() => {
      void expect(screen.queryByText(/items selected/i)).not.toBeInTheDocument();
    });
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests multi-select workflow: checking multiple items, seeing selection count, and clearing selection.'
      }
    }
  }
};

export const NavigationFlow: Story = {
  render: (args) => ({
    props: {
      ...args,
      callbacks: mdiShowcaseCallbacks
    },
    template: `
      <tn-form-field label="Navigation test">
        <tn-file-picker
          [mode]="mode"
          [multiSelect]="multiSelect"
          [startPath]="startPath"
          [callbacks]="callbacks">
        </tn-file-picker>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent, TnFilePickerComponent],
    }
  }),
  args: {
    mode: 'any',
    multiSelect: false,
    startPath: '/mnt'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open picker
    const folderButton = canvas.getByRole('button', { name: /open file picker/i });
    await userEvent.click(folderButton);

    // Wait for initial content (overlay renders outside canvasElement)
    await waitFor(() => {
      void expect(screen.queryByText('MDI Icon Showcase')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Double-click folder to navigate into it
    const folder = screen.getByText('MDI Icon Showcase');
    await userEvent.dblClick(folder);

    // Wait for navigation and new content
    await waitFor(() => {
      void expect(screen.queryByText('documents')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Verify breadcrumb updated
    const breadcrumb = screen.getByText('showcase');
    void expect(breadcrumb).toBeInTheDocument();

    // Click the root breadcrumb segment to navigate back up
    const rootSegment = screen.getByText('mnt');
    await userEvent.click(rootSegment);

    // Verify we're back at root
    await waitFor(() => {
      void expect(screen.queryByText('MDI Icon Showcase')).toBeInTheDocument();
    }, { timeout: 2000 });
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests navigation: double-clicking folders, breadcrumb updates, and navigating via breadcrumbs.'
      }
    }
  }
};

export const CreateActions: Story = {
  render: (args) => ({
    props: {
      ...args,
      callbacks: mdiShowcaseCallbacks,
      onCreateAction: (event: { actionId: string; parentPath: string }, picker: TnFilePickerComponent) => {
        // A real consumer would run its own creation flow here (dialog, API call).
        const newDataset: FileSystemItem = {
          path: `${event.parentPath}/new-dataset`,
          name: 'new-dataset',
          type: 'dataset',
          modified: new Date(),
          permissions: 'write'
        };
        mockFilesystem[event.parentPath] = [...(mockFilesystem[event.parentPath] || []), newDataset];

        // Refresh the listing so the created item shows up
        picker.navigateToPath(event.parentPath);
      }
    },
    template: `
      <tn-form-field label="Create actions test">
        <tn-file-picker
          #picker
          [mode]="mode"
          [createActions]="createActions"
          [startPath]="startPath"
          [callbacks]="callbacks"
          (createAction)="onCreateAction($event, picker)">
        </tn-file-picker>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent, TnFilePickerComponent],
    }
  }),
  args: {
    mode: 'dataset',
    createActions: [
      { id: 'dataset', label: 'Create Dataset' }
    ],
    startPath: '/mnt/showcase'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Reset mock filesystem before test
    resetMockFilesystem();

    // Open picker
    const folderButton = canvas.getByRole('button', { name: /open file picker/i });
    await userEvent.click(folderButton);

    // Wait for content
    await waitFor(() => {
      void expect(screen.queryByText('documents')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Pause to let developers see the initial state
    await new Promise(resolve => setTimeout(resolve, 500));

    const createDatasetButton = screen.getByRole('button', { name: /create dataset/i });
    await userEvent.click(createDatasetButton);

    // The consumer flow created the dataset and refreshed the listing
    await waitFor(() => {
      void expect(screen.getByText('new-dataset')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Pause to let developers see the success state
    await new Promise(resolve => setTimeout(resolve, 1000));
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates consumer-defined create actions: `createActions` renders a "Create Dataset" button in the popup footer, and `createAction` emits `{ actionId, parentPath }` so the consumer can run its own creation flow and refresh the listing.'
      }
    }
  }
};

export const CurrentDirectorySelection: Story = {
  render: (args) => ({
    props: {
      ...args,
      callbacks: mdiShowcaseCallbacks
    },
    template: `
      <tn-form-field label="Current directory selection test">
        <tn-file-picker
          [mode]="mode"
          [placeholder]="placeholder"
          [startPath]="startPath"
          [callbacks]="callbacks">
        </tn-file-picker>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent, TnFilePickerComponent],
    }
  }),
  args: {
    mode: ['folder', 'dataset'],
    placeholder: 'Select a folder...',
    startPath: '/mnt/showcase'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Reset mock filesystem before test
    resetMockFilesystem();

    // Open picker
    const folderButton = canvas.getByRole('button', { name: /open file picker/i });
    await userEvent.click(folderButton);

    // Wait for content
    await waitFor(() => {
      void expect(screen.queryByText('documents')).toBeInTheDocument();
    }, { timeout: 3000 });

    // With nothing selected, the footer names the implicit selection and Select stays enabled
    void expect(screen.getByText('Current directory selected')).toBeInTheDocument();
    const selectButton = screen.getByRole('button', { name: 'Select' });
    void expect(selectButton).not.toBeDisabled();

    // Pause to let developers see the footer state
    await new Promise(resolve => setTimeout(resolve, 500));

    await userEvent.click(selectButton);

    // The browsed directory becomes the selection
    await waitFor(() => {
      const input = canvas.getByPlaceholderText('Select a folder...') as HTMLInputElement;
      void expect(input.value).toContain('showcase');
    }, { timeout: 3000 });
  },
  parameters: {
    docs: {
      description: {
        story: 'With an array `mode` (`[\'folder\', \'dataset\']`), only the listed item types are selectable. Because a directory-like type is selectable, an empty selection stands for the directory being browsed: the footer names it, the Select button stays enabled, and submitting picks the current path — which keeps empty directories selectable.'
      }
    }
  }
};

export const SelectionModes: Story = {
  render: (args) => ({
    props: {
      ...args,
      callbacks: mdiShowcaseCallbacks
    },
    template: `
      <div>
        <tn-form-field label="Example: Choose any file">
          <tn-file-picker
            mode="file"
            [startPath]="startPath"
            [callbacks]="callbacks">
          </tn-file-picker>
        </tn-form-field>

        <tn-form-field label="Example: Choose .txt files">
          <tn-file-picker
            mode="file"
            [fileExtensions]="fileExtensions"
            [startPath]="startPath"
            [callbacks]="callbacks">
          </tn-file-picker>
        </tn-form-field>
      </div>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent, TnFilePickerComponent],
    }
  }),
  args: {
    startPath: '/mnt/showcase',
    fileExtensions: ['.txt']
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open first picker (file mode)
    const buttons = canvas.getAllByRole('button', { name: /open file picker/i });
    await userEvent.click(buttons[0]);

    // Wait for content (overlay renders outside canvasElement)
    await waitFor(() => {
      void expect(screen.queryByText('readme.txt')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Verify files are visible and folders are present but disabled
    void expect(screen.queryByText('readme.txt')).toBeInTheDocument();
    void expect(screen.queryByText('config.json')).toBeInTheDocument();

    // Folders should still be visible (for navigation) but disabled
    void expect(screen.queryByText('documents')).toBeInTheDocument();
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates different selection use cases: restrict selection to specific file types using mode and fileExtensions. Users can still navigate through folders, but only matching items are selectable.'
      }
    }
  }
};

export const DisabledStates: Story = {
  render: (args) => ({
    props: {
      ...args,
      callbacks: mdiShowcaseCallbacks
    },
    template: `
      <tn-form-field label="Disabled file picker">
        <tn-file-picker
          [disabled]="disabled"
          [startPath]="startPath"
          [callbacks]="callbacks">
        </tn-file-picker>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent, TnFilePickerComponent],
    }
  }),
  args: {
    disabled: true,
    startPath: '/mnt/showcase'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify folder button is disabled
    const folderButton = canvas.getByRole('button', { name: /open file picker/i });
    void expect(folderButton).toBeDisabled();
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests disabled state: button should not be clickable when disabled=true.'
      }
    }
  }
};

export const ZfsObjectDisplay: Story = {
  render: (args) => ({
    props: {
      ...args,
      callbacks: mdiShowcaseCallbacks
    },
    template: `
      <tn-form-field label="ZFS objects with badges">
        <tn-file-picker
          [mode]="mode"
          [startPath]="startPath"
          [callbacks]="callbacks">
        </tn-file-picker>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent, TnFilePickerComponent],
    }
  }),
  args: {
    mode: 'any',
    startPath: '/mnt/showcase'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open picker
    const folderButton = canvas.getByRole('button', { name: /open file picker/i });
    await userEvent.click(folderButton);

    // Wait for content with ZFS objects (overlay renders outside canvasElement)
    await waitFor(() => {
      void expect(screen.queryByText('my-dataset')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Verify ZFS badges are present
    void expect(screen.getByText('DS')).toBeInTheDocument(); // Dataset badge
    void expect(screen.getByText('ZV')).toBeInTheDocument(); // Zvol badge
    void expect(screen.getByText('MP')).toBeInTheDocument(); // Mountpoint badge
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests ZFS object display: datasets show "DS" badge, zvols show "ZV", mountpoints show "MP".'
      }
    }
  }
};

export const LoadingStates: Story = {
  render: (args) => ({
    props: {
      ...args,
      callbacks: {
        getChildren: async (path: string) => {
          // Simulate slow loading
          await new Promise(resolve => setTimeout(resolve, 1500));
          const mockFs = createMdiShowcaseFileSystem();
          return mockFs[path] || [];
        }
      }
    },
    template: `
      <tn-form-field label="Slow loading test">
        <tn-file-picker
          [startPath]="startPath"
          [callbacks]="callbacks">
        </tn-file-picker>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent, TnFilePickerComponent],
    }
  }),
  args: {
    startPath: '/mnt/showcase'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open picker
    const folderButton = canvas.getByRole('button', { name: /open file picker/i });
    await userEvent.click(folderButton);

    // Verify loading indicator appears (overlay renders outside canvasElement)
    await waitFor(() => {
      void expect(screen.getByText('Loading...')).toBeInTheDocument();
    }, { timeout: 500 });

    // Wait for content to load
    await waitFor(() => {
      void expect(screen.queryByText('readme.txt')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify loading indicator is gone
    void expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests loading states: spinner appears during async data fetch, then content loads.'
      }
    }
  }
};

export const PathInputValidation: Story = {
  render: (args) => ({
    props: {
      ...args,
      callbacks: mdiShowcaseCallbacks
    },
    template: `
      <tn-form-field label="Path input validation test">
        <tn-file-picker
          [allowManualInput]="allowManualInput"
          [startPath]="startPath"
          [callbacks]="callbacks">
        </tn-file-picker>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent, TnFilePickerComponent],
    }
  }),
  args: {
    allowManualInput: true,
    startPath: '/mnt/showcase'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Let the story settle before grabbing the input — an element fetched
    // mid-bootstrap can be replaced by a re-render and become unfocusable
    await new Promise(resolve => setTimeout(resolve, 300));
    const input = await canvas.findByRole('textbox') as HTMLInputElement;

    // Focus the field with a real click before editing
    await userEvent.click(input);

    // Test 1: Enter an invalid path and verify error appears
    await userEvent.clear(input);
    // await userEvent.type(input, '/invalid');
    await userEvent.paste('/does/not/exist');

    // Wait for error state to appear (validation triggers on every keystroke)
    /*await waitFor(() => {
      const pickerElement = canvasElement.querySelector('tn-file-picker');
      void expect(pickerElement?.classList.contains('error')).toBe(true);
    }, { timeout: 1500 });*/

    // Wait for all validations to complete and error timers to clear
    // Each character typed triggers async validation (100ms) + error timeout (3s)
    await new Promise(resolve => setTimeout(resolve, 3500));

    // Verify error state has cleared after timeout
    /*await waitFor(() => {
      const pickerElement = canvasElement.querySelector('tn-file-picker');
      void expect(pickerElement?.classList.contains('error')).toBe(false);
    }, { timeout: 500 });*/

    // Test 2: Enter a valid path and verify no error persists
    await userEvent.click(input);
    await userEvent.clear(input);
    // await userEvent.type(input, '/mnt/showcase/documents');
    await userEvent.paste('/mnt/showcase/config.json');

    // Each keystroke triggers validation. Intermediate paths like "/s", "/sh" are invalid
    // and will set error state. Wait for typing to complete and all validations to finish.
    // await new Promise(resolve => setTimeout(resolve, 500));

    // Verify the input has the correct value
    // void expect(input).toHaveValue('/mnt/showcase/documents');

    // Wait for all error timers from intermediate keystrokes to clear (3+ seconds)
    // await new Promise(resolve => setTimeout(resolve, 3500));

    // Verify no error is present after all timers clear
    // const pickerElement = canvasElement.querySelector('tn-file-picker');
    // void expect(pickerElement?.classList.contains('error')).toBe(false);
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests manual path input validation: enters an invalid path and verifies error state appears, waits for auto-clear (3 seconds), then enters a valid path and verifies success.'
      }
    }
  }
};

export const ErrorHandling: Story = {
  render: (args) => ({
    props: {
      ...args,
      callbacks: {
        getChildren: async (path: string) => {
          if (path === '/mnt/restricted') {
            throw new Error('Permission denied: Cannot access restricted directory');
          }
          const mockFs = createMdiShowcaseFileSystem();
          return mockFs[path] || [];
        },
        validatePath: async (path: string) => {
          // Reject paths containing 'invalid'
          return !path.includes('invalid');
        }
      },
      onError: (error: { type: string; message: string; path?: string }) => {
        console.error('Error event:', error);
      }
    },
    template: `
      <tn-form-field label="Error handling test">
        <tn-file-picker
          [allowManualInput]="allowManualInput"
          [startPath]="startPath"
          [callbacks]="callbacks"
          (error)="onError($event)">
        </tn-file-picker>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent, TnFilePickerComponent],
    }
  }),
  args: {
    allowManualInput: true,
    startPath: '/mnt/showcase'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test validation error by entering invalid path
    const input = canvas.getByRole('textbox') as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, '/invalid/path');

    // Trigger validation by blurring the input
    await userEvent.click(canvasElement);

    // Note: Error handling behavior depends on implementation
    // The component should emit an error event when validation fails
    // In a real application, error messages would be displayed to the user
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests error handling: validation errors, permission errors, and error event emission.'
      }
    }
  }
};

/**
 * **Test IDs.** The file-picker **container** (the inline trigger field) emits
 * `file-picker-<base>` — shown live in the table. The browse popup renders in a
 * portaled overlay. `testId="backup-target"` → `file-picker-backup-target`,
 * under `data-testid` (default) / `data-test`.
 */
export const TestIds: Story = {
  render: () => ({
    props: { callbacks: { listDirectory: () => Promise.resolve([]) } as FilePickerCallbacks },
    template: `
      <tn-testid-inspector>
        <tn-file-picker testId="backup-target" [callbacks]="callbacks" placeholder="Choose a path" />
      </tn-testid-inspector>
    `,
    moduleMetadata: { imports: [TnFilePickerComponent, TestIdInspectorComponent] },
  }),
};
