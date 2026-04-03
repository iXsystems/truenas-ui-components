import type { Meta, StoryObj } from '@storybook/angular';
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';
import { TnButtonComponent } from '../lib/button/button.component';
import { TnDividerComponent } from '../lib/divider/divider.component';
import { TnDrawerContainerComponent } from '../lib/drawer/drawer-container.component';
import { TnDrawerContentComponent } from '../lib/drawer/drawer-content.component';
import { TnDrawerComponent } from '../lib/drawer/drawer.component';
import { tnIconMarker } from '../lib/icon/icon-marker';
import { TnIconComponent } from '../lib/icon/icon.component';

const harnessDoc = loadHarnessDoc('drawer');

const navIcons = {
  dashboard: tnIconMarker('view-dashboard', 'mdi'),
  inventory: tnIconMarker('server-network', 'mdi'),
  settings: tnIconMarker('cog', 'mdi'),
  replication: tnIconMarker('sync', 'mdi'),
};

const meta: Meta<TnDrawerComponent> = {
  title: 'Components/Drawer',
  component: TnDrawerComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: {
        height: '400px',
      },
    },
  },
  argTypes: {
    mode: {
      control: 'radio',
      options: ['side', 'over'],
      description: 'Drawer display mode',
    },
    opened: {
      control: 'boolean',
      description: 'Whether the drawer is open',
    },
    position: {
      control: 'radio',
      options: ['start', 'end'],
      description: 'Which side the drawer appears on',
    },
    disableClose: {
      control: 'boolean',
      description: 'Prevent closing via backdrop click',
    },
  },
};

export default meta;
type Story = StoryObj<TnDrawerComponent>;

const navTemplate = `
  <div style="padding: 16px; color: var(--tn-fg1);">
    <p style="font-weight: 600; margin-bottom: 12px;">Navigation</p>
    <tn-divider />
    <a style="display: flex; align-items: center; gap: 8px; padding: 8px 0; color: var(--tn-fg1); text-decoration: none; cursor: pointer;">
      <tn-icon [name]="icons.dashboard" size="sm" />
      <span>Dashboard</span>
    </a>
    <tn-divider />
    <a style="display: flex; align-items: center; gap: 8px; padding: 8px 0; color: var(--tn-fg1); text-decoration: none; cursor: pointer;">
      <tn-icon [name]="icons.inventory" size="sm" />
      <span>Inventory</span>
    </a>
    <tn-divider />
    <a style="display: flex; align-items: center; gap: 8px; padding: 8px 0; color: var(--tn-fg1); text-decoration: none; cursor: pointer;">
      <tn-icon [name]="icons.replication" size="sm" />
      <span>Replication</span>
    </a>
    <tn-divider />
    <a style="display: flex; align-items: center; gap: 8px; padding: 8px 0; color: var(--tn-fg1); text-decoration: none; cursor: pointer;">
      <tn-icon [name]="icons.settings" size="sm" />
      <span>Settings</span>
    </a>
  </div>
`;

const sharedImports = [
  TnDrawerContainerComponent,
  TnDrawerContentComponent,
  TnButtonComponent,
  TnDividerComponent,
  TnIconComponent,
];

export const SideMode: Story = {
  render: (args) => ({
    props: {
      ...args,
      opened: true,
      icons: navIcons,
    },
    template: `
      <tn-drawer-container style="height: 400px; border: 1px solid var(--tn-lines);">
        <tn-drawer [mode]="'side'" [(opened)]="opened" [position]="position" width="240px">
          ${navTemplate}
        </tn-drawer>
        <tn-drawer-content>
          <div style="padding: 24px; color: var(--tn-fg1);">
            <h2>Main Content</h2>
            <p style="margin-bottom: 16px;">The drawer sits alongside the content in side mode, pushing it over.</p>
            <tn-button label="Toggle Drawer" (onClick)="opened = !opened" />
          </div>
        </tn-drawer-content>
      </tn-drawer-container>
    `,
    moduleMetadata: {
      imports: sharedImports,
    },
  }),
  args: {
    position: 'start',
    disableClose: false,
  },
};

export const OverMode: Story = {
  render: (args) => ({
    props: {
      ...args,
      isOpen: false,
      icons: navIcons,
    },
    template: `
      <tn-drawer-container style="height: 400px; border: 1px solid var(--tn-lines);">
        <tn-drawer [mode]="'over'" [(opened)]="isOpen" width="280px">
          ${navTemplate}
        </tn-drawer>
        <tn-drawer-content>
          <div style="padding: 24px; color: var(--tn-fg1);">
            <h2>Main Content</h2>
            <p style="margin-bottom: 16px;">In over mode, the drawer overlays the content with a backdrop. Click the backdrop to close.</p>
            <tn-button label="Open Drawer" color="primary" (onClick)="isOpen = true" />
          </div>
        </tn-drawer-content>
      </tn-drawer-container>
    `,
    moduleMetadata: {
      imports: sharedImports,
    },
  }),
};

export const EndPosition: Story = {
  render: (args) => ({
    props: {
      ...args,
      opened: true,
    },
    template: `
      <tn-drawer-container style="height: 400px; border: 1px solid var(--tn-lines);">
        <tn-drawer-content>
          <div style="padding: 24px; color: var(--tn-fg1);">
            <h2>Main Content</h2>
            <p style="margin-bottom: 16px;">The drawer appears on the right side (end position).</p>
            <tn-button label="Toggle Drawer" (onClick)="opened = !opened" />
          </div>
        </tn-drawer-content>
        <tn-drawer [mode]="'side'" [position]="'end'" [(opened)]="opened" width="240px">
          <div style="padding: 16px; color: var(--tn-fg1);">
            <p style="font-weight: 600; margin-bottom: 12px;">Details Panel</p>
            <tn-divider />
            <p style="font-size: 14px; color: var(--tn-fg2);">Additional content on the right side.</p>
          </div>
        </tn-drawer>
      </tn-drawer-container>
    `,
    moduleMetadata: {
      imports: sharedImports,
    },
  }),
};

export const Responsive: Story = {
  render: () => ({
    props: {
      mode: 'side' as const,
      isOpen: true,
      icons: navIcons,
      toggleMode() {
        this['mode'] = this['mode'] === 'side' ? 'over' : 'side';
        this['isOpen'] = this['mode'] === 'side';
      },
    },
    template: `
      <div style="color: var(--tn-fg2); padding: 8px 16px; font-size: 12px; border-bottom: 1px solid var(--tn-lines);">
        Current mode: <strong style="color: var(--tn-fg1);">{{ mode }}</strong>
      </div>
      <tn-drawer-container style="height: 360px;">
        <tn-drawer [mode]="mode" [(opened)]="isOpen" width="240px">
          ${navTemplate}
        </tn-drawer>
        <tn-drawer-content>
          <div style="padding: 24px; color: var(--tn-fg1);">
            <h2>Responsive Demo</h2>
            <p style="margin-bottom: 16px;">Simulates switching between side and over modes (as BreakpointObserver would do).</p>
            <div style="display: flex; gap: 8px;">
              <tn-button
                [label]="'Switch to ' + (mode === 'side' ? 'Over' : 'Side') + ' Mode'"
                (onClick)="toggleMode()" />
              <tn-button
                label="Toggle Drawer"
                variant="outline"
                (onClick)="isOpen = !isOpen" />
            </div>
          </div>
        </tn-drawer-content>
      </tn-drawer-container>
    `,
    moduleMetadata: {
      imports: sharedImports,
    },
  }),
};

export const ComponentHarness: Story = {
  tags: ['!dev'],
  parameters: {
    docs: {
      story: { height: 'auto' },
      canvas: {
        hidden: true,
        sourceState: 'none',
      },
      description: {
        story: harnessDoc || '',
      },
    },
    controls: { disable: true },
    layout: 'fullscreen',
  },
  render: () => ({ template: '' }),
};
