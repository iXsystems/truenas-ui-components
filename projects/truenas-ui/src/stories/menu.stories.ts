import type { Meta, StoryObj } from '@storybook/angular';
import { expect } from '@storybook/jest';
import { userEvent, within } from '@storybook/testing-library';
import { IxButtonComponent } from '../lib/button/button.component';
import { IxMenuTriggerDirective } from '../lib/menu/menu-trigger.directive';
import type { IxMenuItem } from '../lib/menu/menu.component';
import { IxMenuComponent } from '../lib/menu/menu.component';

const meta: Meta<IxMenuComponent> = {
  title: 'Components/Menu',
  component: IxMenuComponent,
  tags: ['autodocs'],
  argTypes: {
    contextMenu: {
      control: 'boolean',
      description: 'Enable context menu mode (right-click to open)',
    },
    menuItemClick: { action: 'menuItemClick' },
    menuOpen: { action: 'menuOpen' },
    menuClose: { action: 'menuClose' },
  },
};

export default meta;
type Story = StoryObj<IxMenuComponent>;

const defaultItems: IxMenuItem[] = [
  { id: '1', label: 'New File' },
  { id: '2', label: 'Open' },
  { id: '3', label: 'Save' },
  { id: 'separator1', label: '', separator: true },
  { id: '4', label: 'Cut' },
  { id: '5', label: 'Copy' },
  { id: '6', label: 'Paste', disabled: true },
];

export const Default: Story = {
  args: {
    items: defaultItems,
  },
  render: (args) => ({
    props: args,
    template: `
      <ix-button [ixMenuTriggerFor]="menu">Menu</ix-button>
      <ix-menu
        #menu
        [items]="items"
        (menuItemClick)="menuItemClick($event)"
        (menuOpen)="menuOpen($event)"
        (menuClose)="menuClose($event)">
      </ix-menu>
    `,
    moduleMetadata: {
      imports: [IxMenuTriggerDirective, IxButtonComponent],
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const menuTrigger = canvas.getByRole('button', { name: /menu/i });

    await expect(menuTrigger).toBeInTheDocument();
    await userEvent.click(menuTrigger);
  },
};

export const WithIcons: Story = {
  args: {
    items: [
      { id: '1', label: 'Home (Unicode Character)', icon: '⌂' },
      { id: '2', label: 'Settings (MDI)', icon: 'cog', iconLibrary: 'mdi' },
      { id: '3', label: 'Server (MDI)', icon: 'server', iconLibrary: 'mdi' },
      { id: '4', label: 'Database (MDI)', icon: 'database', iconLibrary: 'mdi' },
    ],
  },
  argTypes: {
    items: {
      control: 'object',
      description: 'Array of menu items with icons',
    },
  },
  render: (args) => ({
    props: {
      items: args.items,
      menuItemClick: args.menuItemClick,
    },
    template: `
      <div style="padding: 20px;">
        <ix-button [ixMenuTriggerFor]="menu">Icon Methods Demo</ix-button>
        <ix-menu #menu [items]="items" (menuItemClick)="menuItemClick($event)"></ix-menu>

        <div style="margin-top: 24px; padding: 16px; border: 1px solid var(--lines, #ddd); border-radius: 4px; font-size: 14px; color: var(--fg2, #666666);">
          <strong>Recommended Icon Usage:</strong>
          <ul style="margin: 8px 0; padding-left: 20px;">
            <li><strong>Unicode Character:</strong> <code>icon: '⌂'</code> - For simple symbols and emojis</li>
            <li><strong>MDI with iconLibrary:</strong> <code>icon: 'cog', iconLibrary: 'mdi'</code> - Clean, semantic names</li>
            <li><strong>Try changing:</strong> <code>icon</code> values in Controls → cog, home, folder, harddisk, nas, server, database, network, memory</li>
          </ul>
          <div style="margin-top: 12px; padding: 8px; background: var(--bg2, #f0f0f0); border-radius: 4px;">
            <strong>💡 Tip:</strong> The <code>iconLibrary</code> property keeps icon names clean and semantic. Available: home, cog, server, database, folder, harddisk, nas, network, memory, file, star, heart, bell, delete, edit, and more.
          </div>
        </div>
      </div>
    `,
    moduleMetadata: {
      imports: [IxMenuTriggerDirective, IxButtonComponent],
    },
  }),
  parameters: {
    docs: {
      description: {
        story: `
This story demonstrates the recommended approach for adding icons to menu items using the \`iconLibrary\` property.

**Unicode Character (For Simple Symbols)**
\`\`\`typescript
{ id: '1', label: 'Home', icon: '⌂' }
\`\`\`
Use Unicode characters directly for simple symbols and emojis.

**MDI Icons with iconLibrary (Recommended)**
\`\`\`typescript
{ id: '2', label: 'Settings', icon: 'cog', iconLibrary: 'mdi' }
{ id: '3', label: 'Server', icon: 'server', iconLibrary: 'mdi' }
{ id: '4', label: 'Database', icon: 'database', iconLibrary: 'mdi' }
\`\`\`

The \`iconLibrary\` property provides a clean, semantic API for icon specification:
- **No prefixes needed**: Use \`icon: 'cog'\` instead of \`icon: 'mdi-cog'\`
- **More maintainable**: Library is specified separately from the icon name
- **Type-safe**: The property is typed as \`'material' | 'mdi' | 'custom'\`

**Available MDI Icons**
home, cog, server, database, folder, harddisk, nas, network, memory, file, star, heart, bell, delete, edit, close, information, lock, magnify, menu, pencil, refresh, share-variant, and many more.

**Alternative Methods**
- **Library prefix syntax**: \`icon: 'lucide:home'\` (requires library registration via \`IxIconRegistryService\`)
- **Unicode fallback names**: \`icon: 'star'\` (maps to ★ if not in sprite)
        `,
      },
    },
  },
};

export const WithSeparators: Story = {
  args: {
    items: [
      { id: '1', label: 'Account Settings', icon: '⚙', shortcut: '⌘,' },
      { id: '2', label: 'Privacy', icon: '🔒' },
      { id: 'sep1', label: '', separator: true },
      { id: '3', label: 'Help', icon: '?' },
      { id: '4', label: 'About', icon: 'ℹ' },
      { id: 'sep2', label: '', separator: true },
      { id: '5', label: 'Logout', icon: '⎋', shortcut: '⇧⌘Q' },
    ],
  },
  render: (args) => ({
    props: args,
    template: `
      <ix-button [ixMenuTriggerFor]="menu">User Menu</ix-button>
      <ix-menu #menu [items]="items" (menuItemClick)="menuItemClick($event)"></ix-menu>
    `,
    moduleMetadata: {
      imports: [IxMenuTriggerDirective, IxButtonComponent],
    },
  }),
};

export const WithDisabledItems: Story = {
  args: {
    items: [
      { id: '1', label: 'Available Action', icon: '✓' },
      { id: '2', label: 'Disabled Action', icon: '⊘', disabled: true },
      { id: '3', label: 'Another Action', icon: '⚙' },
      { id: '4', label: 'Unavailable', icon: '✗', disabled: true },
    ],
  },
  render: (args) => ({
    props: args,
    template: `
      <ix-button [ixMenuTriggerFor]="menu">Actions</ix-button>
      <ix-menu #menu [items]="items" (menuItemClick)="menuItemClick($event)"></ix-menu>
    `,
    moduleMetadata: {
      imports: [IxMenuTriggerDirective, IxButtonComponent],
    },
  }),
};

export const DisabledButton: Story = {
  args: {
    items: defaultItems,
  },
  render: (args) => ({
    props: args,
    template: `
      <ix-button [ixMenuTriggerFor]="menu" [disabled]="true">Disabled Menu</ix-button>
      <ix-menu #menu [items]="items" (menuItemClick)="menuItemClick($event)"></ix-menu>
    `,
    moduleMetadata: {
      imports: [IxMenuTriggerDirective, IxButtonComponent],
    },
  }),
};

export const PositionAbove: Story = {
  args: {
    items: [
      { id: '1', label: 'Option 1' },
      { id: '2', label: 'Option 2' },
      { id: '3', label: 'Option 3' },
    ],
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="margin-top: 200px; padding: 20px;">
        <ix-button [ixMenuTriggerFor]="menu" ixMenuPosition="above">Menu Above</ix-button>
        <ix-menu
          #menu
          [items]="items"
          (menuItemClick)="menuItemClick($event)"
          (menuOpen)="menuOpen($event)"
          (menuClose)="menuClose($event)">
        </ix-menu>
      </div>
    `,
    moduleMetadata: {
      imports: [IxMenuTriggerDirective, IxButtonComponent],
    },
  }),
};

export const NestedMenus: Story = {
  args: {
    items: [
      { id: '1', label: 'New', children: [
        { id: '1-1', label: 'File' },
        { id: '1-2', label: 'Folder' },
        { id: '1-3', label: 'Project', children: [
          { id: '1-3-1', label: 'Angular App' },
          { id: '1-3-2', label: 'React App' },
          { id: '1-3-3', label: 'Vue App' },
        ]},
      ]},
      { id: '2', label: 'Edit', children: [
        { id: '2-1', label: 'Cut' },
        { id: '2-2', label: 'Copy' },
        { id: '2-3', label: 'Paste', disabled: true },
        { id: 'sep1', label: '', separator: true },
        { id: '2-4', label: 'Find' },
        { id: '2-5', label: 'Replace' },
      ]},
      { id: '3', label: 'View', children: [
        { id: '3-1', label: 'Zoom In' },
        { id: '3-2', label: 'Zoom Out' },
        { id: 'sep2', label: '', separator: true },
        { id: '3-3', label: 'Layout', children: [
          { id: '3-3-1', label: 'Single Column' },
          { id: '3-3-2', label: 'Two Columns' },
          { id: '3-3-3', label: 'Three Columns' },
          { id: 'sep3', label: '', separator: true },
          { id: '3-3-4', label: 'Custom' },
        ]},
        { id: '3-4', label: 'Full Screen' },
      ]},
      { id: 'sep4', label: '', separator: true },
      { id: '4', label: 'Help', children: [
        { id: '4-1', label: 'Documentation' },
        { id: '4-2', label: 'Keyboard Shortcuts' },
        { id: '4-3', label: 'Support', children: [
          { id: '4-3-1', label: 'Contact Us' },
          { id: '4-3-2', label: 'Community Forum' },
          { id: '4-3-3', label: 'Bug Reports' },
        ]},
        { id: '4-4', label: 'About' },
      ]},
    ],
  },
  render: (args) => ({
    props: args,
    template: `
      <ix-button [ixMenuTriggerFor]="menu">Menu with Submenus</ix-button>
      <ix-menu #menu [items]="items" (menuItemClick)="menuItemClick($event)"></ix-menu>
    `,
    moduleMetadata: {
      imports: [IxMenuTriggerDirective, IxButtonComponent],
    },
  }),
};

export const WithKeyboardShortcuts: Story = {
  args: {
    items: [
      { id: '1', label: 'New File', shortcut: '⌘N' },
      { id: '2', label: 'Open', shortcut: '⌘O' },
      { id: '3', label: 'Save', shortcut: '⌘S' },
      { id: '4', label: 'Save As...', shortcut: '⇧⌘S' },
      { id: 'sep1', label: '', separator: true },
      { id: '5', label: 'Cut', shortcut: '⌘X' },
      { id: '6', label: 'Copy', shortcut: '⌘C' },
      { id: '7', label: 'Paste', shortcut: '⌘V' },
      { id: 'sep2', label: '', separator: true },
      { id: '8', label: 'Find', shortcut: '⌘F' },
      { id: '9', label: 'Find and Replace', shortcut: '⌥⌘F' },
      { id: 'sep3', label: '', separator: true },
      { id: '10', label: 'Preferences', shortcut: '⌘,' },
    ],
  },
  render: (args) => ({
    props: args,
    template: `
      <div>
        <ix-button [ixMenuTriggerFor]="menu">File Menu</ix-button>
        <ix-menu
          #menu
          [items]="items"
          (menuItemClick)="menuItemClick($event)"
          (menuOpen)="menuOpen($event)"
          (menuClose)="menuClose($event)">
        </ix-menu>
        <div style="margin-top: 24px; padding: 16px; border: 1px solid var(--lines, #ddd); border-radius: 4px; font-size: 14px; color: var(--fg2, #666666);">
          <strong>⚠️ Accessibility Warning</strong><br>
          Always use modifier keys (⌘, Ctrl, Alt, Shift) for keyboard shortcuts.
          Avoid single letters like H, K, T, F, B, L as they conflict with screen reader navigation.
          <br><br>
          <strong>Learn more:</strong>&nbsp;&nbsp;
          <a href="https://www.w3.org/WAI/WCAG21/Understanding/character-key-shortcuts.html" target="_blank" rel="noopener" style="color: var(--primary, #007bff);">WCAG 2.1.4 Character Key Shortcuts</a> •
          <a href="https://webaim.org/techniques/keyboard/" target="_blank" rel="noopener" style="color: var(--primary, #007bff);">WebAIM Keyboard Accessibility</a>
        </div>
      </div>
    `,
    moduleMetadata: {
      imports: [IxMenuTriggerDirective, IxButtonComponent],
    },
  }),
};

export const ContextMenu: Story = {
  args: {
    items: [
      { id: '1', label: 'Copy', icon: '📋', shortcut: '⌘C' },
      { id: '2', label: 'Cut', icon: '✂️', shortcut: '⌘X' },
      { id: '3', label: 'Paste', icon: '📄', shortcut: '⌘V' },
      { id: 'sep1', label: '', separator: true },
      { id: '4', label: 'Select All', icon: '🔘', shortcut: '⌘A' },
      { id: 'sep2', label: '', separator: true },
      { id: '5', label: 'Properties', icon: '⚙️' },
    ],
    contextMenu: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="padding: 20px;">
        <h3>Context Menu Demo</h3>
        <p>Right-click anywhere in the area below to open the context menu:</p>
        <div style="margin-top: 20px; padding: 40px; border: 2px dashed var(--lines, #ccc); border-radius: 8px; min-height: 200px; background: var(--bg1, #f9f9f9);">
          <ix-menu
            [items]="items"
            [contextMenu]="contextMenu"
            [disabled]="disabled"
            (menuItemClick)="menuItemClick($event)"
            (menuOpen)="menuOpen($event)"
            (menuClose)="menuClose($event)">
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; font-size: 16px; color: var(--fg2, #666);">
              <div style="text-align: center;">
                <div style="font-size: 32px; margin-bottom: 8px;">🖱️</div>
                <div>Right-click me!</div>
                <div style="font-size: 14px; margin-top: 4px;">Context menu will appear at cursor position</div>
              </div>
            </div>
          </ix-menu>
        </div>
        <p style="margin-top: 20px; font-size: 14px; color: var(--fg2, #666);">
          <strong>Note:</strong> The context menu will appear at the exact position where you right-clicked and will stay open until you click elsewhere or select an item.
        </p>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Context menu mode allows the menu to be triggered by right-clicking anywhere within the component area. The menu will appear at the exact cursor position.',
      },
    },
  },
};

