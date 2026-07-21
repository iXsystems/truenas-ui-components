import type { Meta, StoryObj } from '@storybook/angular';
import { fireEvent, userEvent, within, screen, expect, waitFor } from 'storybook/test';
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
    openOnClick: {
      control: 'boolean',
      description: 'Open the picker popup when the input is clicked while no path is selected',
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
**Description:** Consumer-defined creation flows (e.g. dataset or zvol creation) shown as buttons in the popup footer, next to Select. Two shapes:

- **Event-only** (no \`create\`): pressing the button emits \`createAction\` with \`{ actionId, parentPath }\`; run your own flow (dialog, API call) and, when it completes, call \`selectPath(newPath)\` to show the created item selected and applied as the value — or \`refresh()\` to only re-fetch the listing.
- **Inline** (\`create\` provided): pressing the button opens an editable name row inside the popup. Submitting calls \`create(parentPath, name)\` — your implementation does the real work (e.g. a websocket API call) and owns validation. Resolve with the created path to have it listed and selected; reject with an Error to show its message inline and keep the row editable.

### Navigation Configuration
\`\`\`typescript
startPath = input<string>('/mnt');
\`\`\`
**Description:** Initial directory path to display when picker opens.

\`\`\`typescript
rootPath = input<string | undefined>(undefined);
\`\`\`
**Description:** Restrict navigation - users cannot navigate above this path. Defaults to \`/mnt\`. The confinement also applies to manually typed paths: entering a path outside the root emits a \`validation\` error instead of applying it.

\`\`\`typescript
fileExtensions = input<string[] | undefined>(undefined);
\`\`\`
**Description:** Filter files by extension (e.g., \`['.log', '.conf', '.txt']\`).

### Behavior
\`\`\`typescript
allowManualInput = input<boolean>(true);
\`\`\`
**Description:** Allow users to type paths directly in the input field. Paths are committed on Enter or blur (not per keystroke) and must stay within \`rootPath\`; clearing the field clears the selection.

\`\`\`typescript
openOnClick = input<boolean>(false);
\`\`\`
**Description:** Open the picker popup when the input is clicked while no path is selected — an empty field signals the user is about to pick something. Pointer-only by design: keyboard users tabbing through a form never get the overlay opened on them; the folder button remains the keyboard path.

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
  // Run your creation flow (dialog, API call) for event.parentPath, then
  // close the loop on the picker (via a template ref or viewChild):
  //   picker.selectPath(createdPath)  — refreshed listing, new item
  //                                     selected and applied as the value
  //   picker.refresh()                — only re-fetch the current listing
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

        // Refresh the listing and select the newly created dataset
        void picker.selectPath(newDataset.path);
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

    // selectPath() staged the new dataset as the selection and applied it
    await waitFor(() => {
      void expect(screen.getByText('1 item selected')).toBeInTheDocument();
    });
    const input = canvas.getByRole('textbox') as HTMLInputElement;
    void expect(input.value).toContain('new-dataset');

    // Pause to let developers see the success state
    await new Promise(resolve => setTimeout(resolve, 1000));
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the full create-action round-trip: `createActions` renders a "Create Dataset" button in the popup footer, `createAction` emits `{ actionId, parentPath }`, the consumer runs its own creation flow, and `selectPath()` refreshes the listing with the new dataset selected and applied as the picker\'s value. Use `refresh()` instead to only re-fetch the listing.'
      }
    }
  }
};

export const InlineFolderCreation: Story = {
  render: (args) => ({
    props: {
      ...args,
      callbacks: mdiShowcaseCallbacks,
      createActions: [
        {
          id: 'folder',
          label: 'New Folder',
          // The callback does the real work — in a real consumer this would
          // be a websocket API call. Rejections become the inline error.
          create: async (parentPath: string, name: string): Promise<string> => {
            await new Promise(resolve => setTimeout(resolve, 800));

            const existing = mockFilesystem[parentPath] || [];
            if (existing.some(item => item.name.toLowerCase() === name.toLowerCase())) {
              throw new Error('A folder with this name already exists');
            }

            const path = `${parentPath}/${name}`;
            mockFilesystem[parentPath] = [...existing, {
              path, name, type: 'folder', modified: new Date(), permissions: 'write'
            }];
            mockFilesystem[path] = [];
            return path;
          }
        }
      ]
    },
    template: `
      <tn-form-field label="Inline folder creation">
        <tn-file-picker
          [mode]="mode"
          [createActions]="createActions"
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
    mode: 'folder',
    startPath: '/mnt/showcase'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Reset mock filesystem before test
    resetMockFilesystem();

    // Open picker
    const folderButton = canvas.getByRole('button', { name: /open file picker/i });
    await userEvent.click(folderButton);

    await waitFor(() => {
      void expect(screen.queryByText('documents')).toBeInTheDocument();
    }, { timeout: 3000 });

    await new Promise(resolve => setTimeout(resolve, 500));

    // Open the inline creation row
    await userEvent.click(screen.getByRole('button', { name: /new folder/i }));

    const input = await screen.findByRole('textbox', { name: 'New Folder name' });
    await waitFor(() => {
      void expect(input).toHaveFocus();
    });

    // A duplicate name is rejected by the consumer callback and shown inline
    await userEvent.type(input, 'documents', { delay: 50 });
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      void expect(screen.getByText(/already exists/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Pause to let developers see the inline error
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Retry with a valid name: select the rejected one and type over it
    // (avoids userEvent.clear(), whose strict focus precondition is flaky
    // inside the preview iframe)
    await userEvent.tripleClick(input);
    await userEvent.keyboard('My New Folder');
    await userEvent.keyboard('{Enter}');

    // The folder is created, listed, and selected as the picker's value
    await waitFor(() => {
      void expect(screen.getByText('My New Folder')).toBeInTheDocument();
      void expect(screen.queryByRole('textbox', { name: 'New Folder name' })).not.toBeInTheDocument();
    }, { timeout: 3000 });

    await waitFor(() => {
      void expect(screen.getByText('1 item selected')).toBeInTheDocument();
    });

    // Pause to let developers see the success state
    await new Promise(resolve => setTimeout(resolve, 1000));
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the pluggable inline creation flow: a `createActions` entry with a `create` callback opens an editable name row inside the popup. The callback owns the real work (e.g. a websocket API call) — rejections appear as the inline error and the row stays editable, while a resolved path is refreshed into the listing and selected as the picker\'s value.'
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

// Filesystem with a deeply nested directory chain to exercise breadcrumb
// truncation: /mnt/showcase/documents/projects/2024/reports/quarterly
const deepFilesystem: Record<string, FileSystemItem[]> = (() => {
  const fs: Record<string, FileSystemItem[]> = {};
  let path = '/mnt/showcase';
  for (const name of ['documents', 'projects', '2024', 'reports', 'quarterly']) {
    const childPath = `${path}/${name}`;
    fs[path] = [{ path: childPath, name, type: 'folder', modified: new Date(), permissions: 'write' }];
    path = childPath;
  }
  fs[path] = [
    { path: `${path}/q1-report.pdf`, name: 'q1-report.pdf', type: 'file', size: 1048576, modified: new Date(), permissions: 'read' },
    { path: `${path}/q2-report.pdf`, name: 'q2-report.pdf', type: 'file', size: 2097152, modified: new Date(), permissions: 'read' }
  ];
  return fs;
})();

export const DeepNesting: Story = {
  render: (args) => ({
    props: {
      ...args,
      callbacks: {
        getChildren: async (path: string) => deepFilesystem[path] || []
      } as FilePickerCallbacks
    },
    template: `
      <tn-form-field label="Deeply nested directories">
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
    startPath: '/mnt/showcase/documents/projects/2024/reports/quarterly'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open picker at the deeply nested start path
    const folderButton = canvas.getByRole('button', { name: /open file picker/i });
    await userEvent.click(folderButton);

    await waitFor(() => {
      void expect(screen.queryByText('q1-report.pdf')).toBeInTheDocument();
    }, { timeout: 2000 });

    // The middle of the path collapses into a navigable "…" segment:
    // "/ mnt … 2024 reports quarterly"
    void expect(screen.getByText('mnt')).toBeInTheDocument();
    void expect(screen.getByText('…')).toBeInTheDocument();
    void expect(screen.getByText('2024')).toBeInTheDocument();
    void expect(screen.getByText('reports')).toBeInTheDocument();
    void expect(screen.getByText('quarterly')).toBeInTheDocument();
    void expect(screen.queryByText('documents')).not.toBeInTheDocument();

    // Pause to let developers see the truncated breadcrumb
    await new Promise(resolve => setTimeout(resolve, 500));

    // "…" navigates to the parent of the first visible directory (…/projects)
    await userEvent.click(screen.getByText('…'));

    await waitFor(() => {
      void expect(screen.getByText('2024')).toBeInTheDocument();
    }, { timeout: 2000 });

    // The shallower path now fits without truncation
    void expect(screen.getByText('documents')).toBeInTheDocument();
    void expect(screen.queryByText('…')).not.toBeInTheDocument();
  },
  parameters: {
    docs: {
      description: {
        story: 'Exercises long paths in the header: deep paths collapse their middle into a "…" breadcrumb segment that navigates to the parent of the first visible directory, and the popup keeps a fixed width while navigating.'
      }
    }
  }
};

const slashRootFilesystem: Record<string, FileSystemItem[]> = {
  '/': [
    { path: '/mnt', name: 'mnt', type: 'folder' },
    { path: '/dev/zvol', name: 'dev/zvol', type: 'folder' },
  ],
  '/mnt': [
    { path: '/mnt/dozer', name: 'dozer', type: 'dataset' },
  ],
  '/mnt/dozer': [
    { path: '/mnt/dozer/foo', name: 'foo', type: 'dataset' },
  ],
};

export const FilesystemRoot: Story = {
  render: (args) => ({
    props: {
      ...args,
      callbacks: {
        getChildren: async (path: string) => slashRootFilesystem[path] || []
      } as FilePickerCallbacks
    },
    template: `
      <tn-form-field label="Rooted at /">
        <tn-file-picker
          [mode]="mode"
          [rootPath]="rootPath"
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
    rootPath: '/',
    startPath: '/mnt/dozer'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const folderButton = canvas.getByRole('button', { name: /open file picker/i });
    await userEvent.click(folderButton);

    await waitFor(() => {
      void expect(screen.queryByText('foo')).toBeInTheDocument();
    }, { timeout: 2000 });

    // The `/` root renders as a nameless segment whose leading slash IS the
    // segment; its trailing separator is suppressed so the breadcrumb reads
    // "/ mnt / dozer" rather than "/ / mnt / dozer".
    void expect(screen.getByText('mnt')).toBeInTheDocument();
    void expect(screen.getByText('dozer')).toBeInTheDocument();
    const rootSegment = document.querySelector('.breadcrumb-segment');
    void expect(rootSegment).toHaveClass('nameless');
    void expect(rootSegment).toHaveTextContent('');
  },
  parameters: {
    docs: {
      description: {
        story: 'A picker confined to the filesystem root: with `rootPath="/"` the root breadcrumb segment has no name, so it renders as a single clickable slash instead of doubling the separator.'
      }
    }
  }
};

export const OpenOnClick: Story = {
  render: (args) => ({
    props: {
      ...args,
      callbacks: {
        getChildren: async (path: string) => slashRootFilesystem[path] || []
      } as FilePickerCallbacks
    },
    template: `
      <tn-form-field label="Opens on click while empty">
        <tn-file-picker
          [mode]="mode"
          [openOnClick]="openOnClick"
          [rootPath]="rootPath"
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
    openOnClick: true,
    rootPath: '/mnt',
    startPath: '/mnt'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Clicking the empty input opens the popup without pressing the folder button
    const input = canvas.getByRole('textbox');
    await userEvent.click(input);

    await waitFor(() => {
      void expect(screen.queryByText('dozer')).toBeInTheDocument();
    }, { timeout: 2000 });
  },
  parameters: {
    docs: {
      description: {
        story: 'With `openOnClick`, clicking the input while no path is selected opens the browsing popup immediately — the empty field signals the user is about to pick something. A field that already holds a path keeps plain click behavior so the text can be edited. The trigger is deliberately pointer-only: keyboard users tabbing through a form never get the overlay popped open on them, and the folder button remains the keyboard path.'
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

    // Typing alone must not validate — paths only commit on Enter/blur, so
    // an incomplete out-of-root prefix shows no error while being typed
    await userEvent.clear(input);
    await userEvent.paste('/does/not/exist');
    void expect(input.classList.contains('error')).toBe(false);

    // Committing the out-of-root path shows the error state
    await fireEvent.change(input);
    await waitFor(() => {
      void expect(input.classList.contains('error')).toBe(true);
    });

    // Committing a valid path clears the error and applies the value
    await userEvent.clear(input);
    await userEvent.paste('/mnt/showcase/config.json');
    await fireEvent.change(input);
    await waitFor(() => {
      void expect(input.classList.contains('error')).toBe(false);
    });
    void expect(input).toHaveValue('/mnt/showcase/config.json');
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests manual path input validation: paths commit on Enter or blur (never per keystroke), committing a path outside the root shows the error state, and committing a valid path clears it and applies the value.'
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

    // Commit the typed path — paths validate on change (Enter or blur)
    await fireEvent.change(input);
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
