import type { Meta, StoryObj } from '@storybook/angular';
import { componentWrapperDecorator } from '@storybook/angular';
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';
import { TnButtonComponent } from '../lib/button/button.component';
import { tnIconMarker } from '../lib/icon/icon-marker';
import { TnSidePanelComponent, TnSidePanelActionDirective } from '../lib/side-panel/side-panel.component';

tnIconMarker('close', 'mdi');

const harnessDoc = loadHarnessDoc('side-panel');

// Shared inline styles to keep templates readable
const inputStyle = 'width: 100%; padding: 10px 12px; border: 1px solid var(--tn-lines); border-radius: 4px; background: var(--tn-bg1); color: var(--tn-fg1); box-sizing: border-box; font-size: 0.875rem;';
const labelStyle = 'display: block; font-weight: 600; margin-bottom: 6px; color: var(--tn-fg1); font-size: 0.875rem;';
const sectionStyle = 'padding: 16px; background: var(--tn-bg1); border-radius: 6px; border: 1px solid var(--tn-lines);';
const rowStyle = 'display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border: 1px solid var(--tn-lines); border-radius: 6px;';
const textareaStyle = 'width: 100%; padding: 10px 12px; border: 1px solid var(--tn-lines); border-radius: 4px; background: var(--tn-bg1); color: var(--tn-fg1); box-sizing: border-box; font-size: 0.875rem; font-family: inherit; resize: vertical; min-height: 80px;';

const tallCanvas = [
  componentWrapperDecorator((story) => `<div style="min-height: 80vh;">${story}</div>`),
];

const meta: Meta<TnSidePanelComponent> = {
  title: 'Components/Side Panel',
  component: TnSidePanelComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
A side panel (drawer) that slides in from the right edge of the viewport. Provides a title bar with dismiss button, a scrollable content area, and an optional fixed-position action footer.

## Basic Usage

\`\`\`html
<tn-side-panel [(open)]="isOpen" title="Panel Title">
  <p>Your content here</p>

  <tn-button tnSidePanelAction label="Save" color="primary" />
</tn-side-panel>
\`\`\`

## Contained Mode

Use \`[contained]="true"\` to scope the panel within a positioned ancestor instead of the full viewport. This is useful when the panel should appear below an app header:

\`\`\`html
<main style="position: relative; height: calc(100dvh - 64px);">
  <tn-side-panel [(open)]="isOpen" title="Details" [contained]="true">
    ...
  </tn-side-panel>
</main>
\`\`\`

## Nested Panels

Panels can be nested for drill-down workflows:

\`\`\`html
<tn-side-panel [(open)]="listOpen" title="Users">
  <button (click)="editOpen = true">Edit</button>

  <tn-side-panel [(open)]="editOpen" title="Edit User">
    ...form fields...
  </tn-side-panel>
</tn-side-panel>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Whether the panel is open. Supports two-way binding with `[(open)]`.',
    },
    title: {
      control: 'text',
      description: 'Title text displayed in the header.',
    },
    width: {
      control: 'text',
      description: 'Panel width as a CSS value.',
    },
    contained: {
      control: 'boolean',
      description: 'When true, uses `position: absolute` to fill the nearest positioned ancestor instead of the viewport.',
    },
    hasBackdrop: {
      control: 'boolean',
      description: 'Whether to show a semi-transparent backdrop overlay.',
    },
    closeOnBackdropClick: {
      control: 'boolean',
      description: 'Whether clicking the backdrop closes the panel.',
    },
    closeOnEscape: {
      control: 'boolean',
      description: 'Whether pressing Escape closes the panel.',
    },
  },
  args: {
    open: false,
    title: 'Side Panel',
    width: '480px',
    contained: false,
    hasBackdrop: true,
    closeOnBackdropClick: true,
    closeOnEscape: true,
  },
};

export default meta;
type Story = StoryObj<TnSidePanelComponent>;

export const Default: Story = {
  decorators: tallCanvas,
  render: (args) => ({
    props: {
      ...args,
      isOpen: false,
    },
    moduleMetadata: {
      imports: [TnSidePanelComponent, TnButtonComponent],
    },
    template: `
      <div style="padding: 32px; max-width: 800px;">
        <h2 style="margin: 0 0 8px 0; color: var(--tn-fg1);">Storage Dashboard</h2>
        <p style="color: var(--tn-fg2); margin: 0 0 24px 0;">Manage your pools, datasets, and snapshots.</p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
          <div style="${sectionStyle}">
            <div style="font-weight: 600; color: var(--tn-fg1); margin-bottom: 8px;">Pool: tank</div>
            <div style="font-size: 0.875rem; color: var(--tn-fg2);">Status: ONLINE</div>
            <div style="font-size: 0.875rem; color: var(--tn-fg2);">Used: 1.2 TB / 4 TB</div>
          </div>
          <div style="${sectionStyle}">
            <div style="font-weight: 600; color: var(--tn-fg1); margin-bottom: 8px;">Pool: backup</div>
            <div style="font-size: 0.875rem; color: var(--tn-fg2);">Status: ONLINE</div>
            <div style="font-size: 0.875rem; color: var(--tn-fg2);">Used: 800 GB / 2 TB</div>
          </div>
        </div>

        <tn-button label="View Dataset Details" color="primary" (onClick)="isOpen = true" />
      </div>

      <tn-side-panel
        [(open)]="isOpen"
        [title]="title"
        [width]="width"
        [hasBackdrop]="hasBackdrop"
        [closeOnBackdropClick]="closeOnBackdropClick"
        [closeOnEscape]="closeOnEscape">

        <div style="display: flex; flex-direction: column; gap: 24px;">
          <div>
            <h4 style="margin: 0 0 12px 0; color: var(--tn-fg1);">Dataset: tank/media</h4>
            <p style="color: var(--tn-fg2); font-size: 0.875rem; margin: 0;">
              This dataset stores media files including photos, videos, and music. It uses LZ4 compression and has snapshots enabled.
            </p>
          </div>

          <div style="${sectionStyle}">
            <div style="font-weight: 600; color: var(--tn-fg1); margin-bottom: 12px;">Properties</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div style="font-size: 0.875rem; color: var(--tn-fg2);">Type</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg1);">FILESYSTEM</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg2);">Compression</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg1);">LZ4</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg2);">Sync</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg1);">Standard</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg2);">Deduplication</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg1);">Off</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg2);">Record Size</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg1);">128 KiB</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg2);">Case Sensitivity</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg1);">Sensitive</div>
            </div>
          </div>

          <div style="${sectionStyle}">
            <div style="font-weight: 600; color: var(--tn-fg1); margin-bottom: 12px;">Space Usage</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div style="font-size: 0.875rem; color: var(--tn-fg2);">Used</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg1);">856 GiB</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg2);">Available</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg1);">2.14 TiB</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg2);">Referenced</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg1);">840 GiB</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg2);">Quota</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg1);">None</div>
            </div>
          </div>

          <div style="${sectionStyle}">
            <div style="font-weight: 600; color: var(--tn-fg1); margin-bottom: 12px;">Recent Snapshots</div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
                <span style="color: var(--tn-fg1);">auto-2024-01-15-00:00</span>
                <span style="color: var(--tn-fg2);">12 GiB</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
                <span style="color: var(--tn-fg1);">auto-2024-01-14-00:00</span>
                <span style="color: var(--tn-fg2);">11.8 GiB</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
                <span style="color: var(--tn-fg1);">auto-2024-01-13-00:00</span>
                <span style="color: var(--tn-fg2);">11.5 GiB</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
                <span style="color: var(--tn-fg1);">manual-pre-upgrade</span>
                <span style="color: var(--tn-fg2);">15.2 GiB</span>
              </div>
            </div>
          </div>

          <div style="${sectionStyle}">
            <div style="font-weight: 600; color: var(--tn-fg1); margin-bottom: 12px;">Permissions</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div style="font-size: 0.875rem; color: var(--tn-fg2);">Owner</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg1);">root</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg2);">Group</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg1);">wheel</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg2);">Mode</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg1);">755</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg2);">ACL Type</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg1);">POSIX</div>
            </div>
          </div>
        </div>
      </tn-side-panel>
    `,
  }),
};

export const WithActions: Story = {
  decorators: tallCanvas,
  render: (args) => ({
    props: {
      ...args,
      isOpen: false,
    },
    moduleMetadata: {
      imports: [TnSidePanelComponent, TnSidePanelActionDirective, TnButtonComponent],
    },
    template: `
      <div style="padding: 32px;">
        <h2 style="margin: 0 0 8px 0; color: var(--tn-fg1);">User Management</h2>
        <p style="color: var(--tn-fg2); margin: 0 0 24px 0;">Create and manage local user accounts.</p>
        <tn-button label="Add User" color="primary" (onClick)="isOpen = true" />
      </div>

      <tn-side-panel [(open)]="isOpen" title="Add User" [width]="width">
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div style="padding-bottom: 16px; border-bottom: 1px solid var(--tn-lines);">
            <div style="font-weight: 600; color: var(--tn-fg1); margin-bottom: 4px;">Identification</div>
            <div style="font-size: 0.8125rem; color: var(--tn-fg2);">Basic user account information.</div>
          </div>

          <div>
            <label style="${labelStyle}">Full Name</label>
            <input type="text" placeholder="e.g. John Doe" style="${inputStyle}" />
          </div>
          <div>
            <label style="${labelStyle}">Username</label>
            <input type="text" placeholder="e.g. jdoe" style="${inputStyle}" />
          </div>
          <div>
            <label style="${labelStyle}">Email</label>
            <input type="email" placeholder="e.g. john@example.com" style="${inputStyle}" />
          </div>
          <div>
            <label style="${labelStyle}">Password</label>
            <input type="password" placeholder="Enter password" style="${inputStyle}" />
          </div>
          <div>
            <label style="${labelStyle}">Confirm Password</label>
            <input type="password" placeholder="Confirm password" style="${inputStyle}" />
          </div>

          <div style="padding-bottom: 16px; border-bottom: 1px solid var(--tn-lines); padding-top: 8px;">
            <div style="font-weight: 600; color: var(--tn-fg1); margin-bottom: 4px;">User ID &amp; Groups</div>
            <div style="font-size: 0.8125rem; color: var(--tn-fg2);">System identification and group membership.</div>
          </div>

          <div>
            <label style="${labelStyle}">User ID</label>
            <input type="number" value="1001" style="${inputStyle}" />
          </div>
          <div>
            <label style="${labelStyle}">Primary Group</label>
            <input type="text" value="users" style="${inputStyle}" />
          </div>
          <div>
            <label style="${labelStyle}">Auxiliary Groups</label>
            <input type="text" placeholder="e.g. wheel, ftp, samba" style="${inputStyle}" />
          </div>

          <div style="padding-bottom: 16px; border-bottom: 1px solid var(--tn-lines); padding-top: 8px;">
            <div style="font-weight: 600; color: var(--tn-fg1); margin-bottom: 4px;">Directories</div>
            <div style="font-size: 0.8125rem; color: var(--tn-fg2);">Home directory and shell configuration.</div>
          </div>

          <div>
            <label style="${labelStyle}">Home Directory</label>
            <input type="text" value="/nonexistent" style="${inputStyle}" />
          </div>
          <div>
            <label style="${labelStyle}">Shell</label>
            <input type="text" value="/usr/bin/zsh" style="${inputStyle}" />
          </div>

          <div style="padding-bottom: 16px; border-bottom: 1px solid var(--tn-lines); padding-top: 8px;">
            <div style="font-weight: 600; color: var(--tn-fg1); margin-bottom: 4px;">Authentication</div>
            <div style="font-size: 0.8125rem; color: var(--tn-fg2);">SSH keys and authentication settings.</div>
          </div>

          <div>
            <label style="${labelStyle}">SSH Public Key</label>
            <textarea placeholder="Paste public key here..." style="${textareaStyle}"></textarea>
          </div>
        </div>

        <tn-button tnSidePanelAction variant="outline" label="Cancel" (onClick)="isOpen = false" />
        <tn-button tnSidePanelAction color="primary" label="Create User" />
      </tn-side-panel>
    `,
  }),
};

export const Contained: Story = {
  decorators: tallCanvas,
  render: (args) => ({
    props: {
      ...args,
      isOpen: false,
    },
    moduleMetadata: {
      imports: [TnSidePanelComponent, TnSidePanelActionDirective, TnButtonComponent],
    },
    template: `
      <header style="height: 64px; background: var(--tn-primary); color: var(--tn-primary-txt, #fff); display: flex; align-items: center; justify-content: space-between; padding: 0 24px; font-weight: 600; font-size: 1.1rem; z-index: 1001; position: relative;">
        <span>TrueNAS SCALE</span>
        <div style="display: flex; gap: 16px; align-items: center;">
          <span style="font-size: 0.8125rem; font-weight: 400; opacity: 0.85;">admin@truenas.local</span>
          <div style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 0.75rem;">A</div>
        </div>
      </header>

      <main style="position: relative; height: calc(100vh - 64px); overflow: hidden; display: flex;">
        <nav style="width: 220px; flex-shrink: 0; background: var(--tn-bg1); border-right: 1px solid var(--tn-lines); padding: 16px 0;">
          <div style="padding: 10px 20px; color: var(--tn-fg2); font-size: 0.8125rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Storage</div>
          <div style="padding: 10px 20px; color: var(--tn-primary); background: rgba(0,125,179,0.1); font-size: 0.875rem; font-weight: 500; border-left: 3px solid var(--tn-primary);">Pools</div>
          <div style="padding: 10px 20px; color: var(--tn-fg1); font-size: 0.875rem;">Datasets</div>
          <div style="padding: 10px 20px; color: var(--tn-fg1); font-size: 0.875rem;">Snapshots</div>
          <div style="padding: 10px 20px; color: var(--tn-fg1); font-size: 0.875rem;">Disks</div>
          <div style="padding: 10px 20px; color: var(--tn-fg2); font-size: 0.8125rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 16px;">Sharing</div>
          <div style="padding: 10px 20px; color: var(--tn-fg1); font-size: 0.875rem;">SMB</div>
          <div style="padding: 10px 20px; color: var(--tn-fg1); font-size: 0.875rem;">NFS</div>
          <div style="padding: 10px 20px; color: var(--tn-fg1); font-size: 0.875rem;">iSCSI</div>
        </nav>

        <div style="flex: 1; padding: 32px; overflow-y: auto;">
          <h2 style="margin: 0 0 8px 0; color: var(--tn-fg1);">Pools</h2>
          <p style="color: var(--tn-fg2); margin: 0 0 24px 0;">The panel opens below the app header. Try clicking the header while the panel is open.</p>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="${rowStyle}">
              <div>
                <div style="font-weight: 600; color: var(--tn-fg1);">tank</div>
                <div style="font-size: 0.8125rem; color: var(--tn-fg2);">RAIDZ2 &middot; 6 x 8TB &middot; 1.2 TB used of 4 TB</div>
              </div>
              <tn-button label="Details" variant="outline" (onClick)="isOpen = true" />
            </div>
            <div style="${rowStyle}">
              <div>
                <div style="font-weight: 600; color: var(--tn-fg1);">backup</div>
                <div style="font-size: 0.8125rem; color: var(--tn-fg2);">Mirror &middot; 2 x 4TB &middot; 800 GB used of 2 TB</div>
              </div>
              <tn-button label="Details" variant="outline" />
            </div>
            <div style="${rowStyle}">
              <div>
                <div style="font-weight: 600; color: var(--tn-fg1);">ssd-cache</div>
                <div style="font-size: 0.8125rem; color: var(--tn-fg2);">Stripe &middot; 2 x 1TB NVMe &middot; 450 GB used of 1 TB</div>
              </div>
              <tn-button label="Details" variant="outline" />
            </div>
          </div>
        </div>

        <tn-side-panel [(open)]="isOpen" title="Pool: tank" [contained]="true" [width]="width">
          <div style="display: flex; flex-direction: column; gap: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 40px; height: 40px; border-radius: 8px; background: var(--tn-green, #4caf50); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 1.1rem;">OK</div>
              <div>
                <div style="font-weight: 600; color: var(--tn-fg1);">Pool is healthy</div>
                <div style="font-size: 0.8125rem; color: var(--tn-fg2);">Last scrub: 2 days ago &middot; No errors found</div>
              </div>
            </div>

            <div style="${sectionStyle}">
              <div style="font-weight: 600; color: var(--tn-fg1); margin-bottom: 12px;">Configuration</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div style="font-size: 0.875rem; color: var(--tn-fg2);">Layout</div>
                <div style="font-size: 0.875rem; color: var(--tn-fg1);">RAIDZ2</div>
                <div style="font-size: 0.875rem; color: var(--tn-fg2);">Disks</div>
                <div style="font-size: 0.875rem; color: var(--tn-fg1);">6 x 8 TB</div>
                <div style="font-size: 0.875rem; color: var(--tn-fg2);">Raw Capacity</div>
                <div style="font-size: 0.875rem; color: var(--tn-fg1);">48 TB</div>
                <div style="font-size: 0.875rem; color: var(--tn-fg2);">Usable</div>
                <div style="font-size: 0.875rem; color: var(--tn-fg1);">32 TB</div>
                <div style="font-size: 0.875rem; color: var(--tn-fg2);">Ashift</div>
                <div style="font-size: 0.875rem; color: var(--tn-fg1);">12</div>
                <div style="font-size: 0.875rem; color: var(--tn-fg2);">Autoexpand</div>
                <div style="font-size: 0.875rem; color: var(--tn-fg1);">Off</div>
              </div>
            </div>

            <div style="${sectionStyle}">
              <div style="font-weight: 600; color: var(--tn-fg1); margin-bottom: 12px;">Space Usage</div>
              <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                  <span style="font-size: 0.875rem; color: var(--tn-fg2);">1.2 TB used</span>
                  <span style="font-size: 0.875rem; color: var(--tn-fg2);">4 TB total</span>
                </div>
                <div style="height: 8px; background: var(--tn-lines); border-radius: 4px; overflow: hidden;">
                  <div style="height: 100%; width: 30%; background: var(--tn-primary); border-radius: 4px;"></div>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div style="font-size: 0.875rem; color: var(--tn-fg2);">Allocated</div>
                <div style="font-size: 0.875rem; color: var(--tn-fg1);">1.2 TiB</div>
                <div style="font-size: 0.875rem; color: var(--tn-fg2);">Free</div>
                <div style="font-size: 0.875rem; color: var(--tn-fg1);">2.8 TiB</div>
                <div style="font-size: 0.875rem; color: var(--tn-fg2);">Fragmentation</div>
                <div style="font-size: 0.875rem; color: var(--tn-fg1);">3%</div>
              </div>
            </div>

            <div style="${sectionStyle}">
              <div style="font-weight: 600; color: var(--tn-fg1); margin-bottom: 12px;">Top-level Datasets</div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
                  <span style="color: var(--tn-fg1);">tank/media</span>
                  <span style="color: var(--tn-fg2);">856 GiB</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
                  <span style="color: var(--tn-fg1);">tank/documents</span>
                  <span style="color: var(--tn-fg2);">124 GiB</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
                  <span style="color: var(--tn-fg1);">tank/backups</span>
                  <span style="color: var(--tn-fg2);">220 GiB</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
                  <span style="color: var(--tn-fg1);">tank/vms</span>
                  <span style="color: var(--tn-fg2);">48 GiB</span>
                </div>
              </div>
            </div>
          </div>

          <tn-button tnSidePanelAction variant="outline" label="Export/Disconnect" />
          <tn-button tnSidePanelAction color="primary" label="Edit Pool" />
        </tn-side-panel>
      </main>
    `,
  }),
};

export const NestedPanels: Story = {
  decorators: tallCanvas,
  render: (args) => ({
    props: {
      ...args,
      outerOpen: false,
      innerOpen: false,
    },
    moduleMetadata: {
      imports: [TnSidePanelComponent, TnSidePanelActionDirective, TnButtonComponent],
    },
    template: `
      <div style="padding: 32px;">
        <h2 style="margin: 0 0 8px 0; color: var(--tn-fg1);">Sharing</h2>
        <p style="color: var(--tn-fg2); margin: 0 0 24px 0;">Nested panels for drill-down workflows. Open the share list, then click Edit on a share.</p>
        <tn-button label="Manage SMB Shares" color="primary" (onClick)="outerOpen = true" />
      </div>

      <tn-side-panel [(open)]="outerOpen" title="SMB Shares" width="560px">
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="${rowStyle}">
            <div style="flex: 1;">
              <div style="font-weight: 600; color: var(--tn-fg1);">media</div>
              <div style="font-size: 0.8125rem; color: var(--tn-fg2);">/mnt/tank/media &middot; Read/Write</div>
            </div>
            <div style="display: flex; gap: 8px;">
              <tn-button label="Edit" variant="outline" (onClick)="innerOpen = true" />
            </div>
          </div>
          <div style="${rowStyle}">
            <div style="flex: 1;">
              <div style="font-weight: 600; color: var(--tn-fg1);">documents</div>
              <div style="font-size: 0.8125rem; color: var(--tn-fg2);">/mnt/tank/documents &middot; Read/Write</div>
            </div>
            <div style="display: flex; gap: 8px;">
              <tn-button label="Edit" variant="outline" (onClick)="innerOpen = true" />
            </div>
          </div>
          <div style="${rowStyle}">
            <div style="flex: 1;">
              <div style="font-weight: 600; color: var(--tn-fg1);">public</div>
              <div style="font-size: 0.8125rem; color: var(--tn-fg2);">/mnt/tank/public &middot; Read Only</div>
            </div>
            <div style="display: flex; gap: 8px;">
              <tn-button label="Edit" variant="outline" (onClick)="innerOpen = true" />
            </div>
          </div>
          <div style="${rowStyle}">
            <div style="flex: 1;">
              <div style="font-weight: 600; color: var(--tn-fg1);">timemachine</div>
              <div style="font-size: 0.8125rem; color: var(--tn-fg2);">/mnt/backup/timemachine &middot; Time Machine</div>
            </div>
            <div style="display: flex; gap: 8px;">
              <tn-button label="Edit" variant="outline" (onClick)="innerOpen = true" />
            </div>
          </div>
          <div style="${rowStyle}">
            <div style="flex: 1;">
              <div style="font-weight: 600; color: var(--tn-fg1);">homes</div>
              <div style="font-size: 0.8125rem; color: var(--tn-fg2);">/mnt/tank/homes &middot; Home Directories</div>
            </div>
            <div style="display: flex; gap: 8px;">
              <tn-button label="Edit" variant="outline" (onClick)="innerOpen = true" />
            </div>
          </div>
        </div>

        <tn-side-panel [(open)]="innerOpen" title="Edit Share: media">
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="padding-bottom: 16px; border-bottom: 1px solid var(--tn-lines);">
              <div style="font-weight: 600; color: var(--tn-fg1); margin-bottom: 4px;">Basic Settings</div>
              <div style="font-size: 0.8125rem; color: var(--tn-fg2);">Configure the share name and path.</div>
            </div>

            <div>
              <label style="${labelStyle}">Share Name</label>
              <input type="text" value="media" style="${inputStyle}" />
            </div>
            <div>
              <label style="${labelStyle}">Path</label>
              <input type="text" value="/mnt/tank/media" style="${inputStyle}" />
            </div>
            <div>
              <label style="${labelStyle}">Description</label>
              <input type="text" value="Media files share" style="${inputStyle}" />
            </div>
            <div>
              <label style="${labelStyle}">Purpose</label>
              <input type="text" value="Default share parameters" style="${inputStyle}" />
            </div>

            <div style="padding-bottom: 16px; border-bottom: 1px solid var(--tn-lines); padding-top: 8px;">
              <div style="font-weight: 600; color: var(--tn-fg1); margin-bottom: 4px;">Access</div>
              <div style="font-size: 0.8125rem; color: var(--tn-fg2);">Control who can access this share.</div>
            </div>

            <div>
              <label style="${labelStyle}">Allowed Hosts</label>
              <textarea placeholder="One host per line..." style="${textareaStyle}"></textarea>
            </div>
            <div>
              <label style="${labelStyle}">Denied Hosts</label>
              <textarea placeholder="One host per line..." style="${textareaStyle}"></textarea>
            </div>

            <div style="padding-bottom: 16px; border-bottom: 1px solid var(--tn-lines); padding-top: 8px;">
              <div style="font-weight: 600; color: var(--tn-fg1); margin-bottom: 4px;">Advanced</div>
              <div style="font-size: 0.8125rem; color: var(--tn-fg2);">Advanced SMB options.</div>
            </div>

            <div>
              <label style="${labelStyle}">Auxiliary Parameters</label>
              <textarea placeholder="smb.conf parameters..." style="${textareaStyle}"></textarea>
            </div>
          </div>

          <tn-button tnSidePanelAction variant="outline" label="Cancel" (onClick)="innerOpen = false" />
          <tn-button tnSidePanelAction color="primary" label="Save" />
        </tn-side-panel>
      </tn-side-panel>
    `,
  }),
};

export const NoBackdrop: Story = {
  decorators: tallCanvas,
  render: (args) => ({
    props: {
      ...args,
      isOpen: false,
    },
    moduleMetadata: {
      imports: [TnSidePanelComponent, TnButtonComponent],
    },
    template: `
      <div style="padding: 32px; max-width: 700px;">
        <h2 style="margin: 0 0 8px 0; color: var(--tn-fg1);">Network Interfaces</h2>
        <p style="color: var(--tn-fg2); margin: 0 0 24px 0;">This panel has no backdrop overlay. The page behind stays visible.</p>

        <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
          <div style="${sectionStyle}">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: 600; color: var(--tn-fg1);">em0</div>
                <div style="font-size: 0.8125rem; color: var(--tn-fg2);">Intel Gigabit &middot; 192.168.1.100</div>
              </div>
              <div style="padding: 4px 10px; border-radius: 12px; background: rgba(76,175,80,0.15); color: var(--tn-green, #4caf50); font-size: 0.75rem; font-weight: 600;">ACTIVE</div>
            </div>
          </div>
          <div style="${sectionStyle}">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: 600; color: var(--tn-fg1);">em1</div>
                <div style="font-size: 0.8125rem; color: var(--tn-fg2);">Intel Gigabit &middot; Not configured</div>
              </div>
              <div style="padding: 4px 10px; border-radius: 12px; background: rgba(108,117,125,0.15); color: var(--tn-fg2); font-size: 0.75rem; font-weight: 600;">DOWN</div>
            </div>
          </div>
        </div>

        <tn-button label="Open Inspector" color="primary" (onClick)="isOpen = true" />
      </div>

      <tn-side-panel [(open)]="isOpen" title="Interface: em0" [hasBackdrop]="false" [width]="width">
        <div style="display: flex; flex-direction: column; gap: 24px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; border-radius: 8px; background: var(--tn-green, #4caf50); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 0.75rem;">UP</div>
            <div>
              <div style="font-weight: 600; color: var(--tn-fg1);">Link is active</div>
              <div style="font-size: 0.8125rem; color: var(--tn-fg2);">1000 Mbps Full Duplex</div>
            </div>
          </div>

          <div style="${sectionStyle}">
            <div style="font-weight: 600; color: var(--tn-fg1); margin-bottom: 12px;">General</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div style="font-size: 0.875rem; color: var(--tn-fg2);">Driver</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg1);">igb</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg2);">MAC Address</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg1);">00:1B:21:12:34:56</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg2);">MTU</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg1);">1500</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg2);">Media Type</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg1);">Ethernet</div>
            </div>
          </div>

          <div style="${sectionStyle}">
            <div style="font-weight: 600; color: var(--tn-fg1); margin-bottom: 12px;">IPv4 Configuration</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div style="font-size: 0.875rem; color: var(--tn-fg2);">Address</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg1);">192.168.1.100</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg2);">Netmask</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg1);">255.255.255.0</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg2);">Gateway</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg1);">192.168.1.1</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg2);">DHCP</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg1);">No (Static)</div>
            </div>
          </div>

          <div style="${sectionStyle}">
            <div style="font-weight: 600; color: var(--tn-fg1); margin-bottom: 12px;">DNS</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div style="font-size: 0.875rem; color: var(--tn-fg2);">Primary</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg1);">8.8.8.8</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg2);">Secondary</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg1);">8.8.4.4</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg2);">Domain</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg1);">local</div>
            </div>
          </div>

          <div style="${sectionStyle}">
            <div style="font-weight: 600; color: var(--tn-fg1); margin-bottom: 12px;">Traffic Statistics</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div style="font-size: 0.875rem; color: var(--tn-fg2);">RX Bytes</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg1);">142.3 GiB</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg2);">TX Bytes</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg1);">89.7 GiB</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg2);">RX Packets</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg1);">98,432,100</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg2);">TX Packets</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg1);">76,218,450</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg2);">Errors</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg1);">0</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg2);">Drops</div>
              <div style="font-size: 0.875rem; color: var(--tn-fg1);">12</div>
            </div>
          </div>
        </div>
      </tn-side-panel>
    `,
  }),
};

export const WidePanel: Story = {
  decorators: tallCanvas,
  render: (args) => ({
    props: {
      ...args,
      isOpen: false,
    },
    moduleMetadata: {
      imports: [TnSidePanelComponent, TnSidePanelActionDirective, TnButtonComponent],
    },
    template: `
      <div style="padding: 32px;">
        <h2 style="margin: 0 0 8px 0; color: var(--tn-fg1);">Services</h2>
        <p style="color: var(--tn-fg2); margin: 0 0 24px 0;">A wider panel (800px) suitable for complex layouts.</p>
        <tn-button label="View System Overview" color="primary" (onClick)="isOpen = true" />
      </div>

      <tn-side-panel [(open)]="isOpen" title="System Overview" width="800px">
        <div style="display: flex; flex-direction: column; gap: 24px;">

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
            <div style="${sectionStyle} text-align: center;">
              <div style="font-size: 2rem; font-weight: 700; color: var(--tn-primary);">24.10</div>
              <div style="font-size: 0.8125rem; color: var(--tn-fg2); margin-top: 4px;">TrueNAS Version</div>
            </div>
            <div style="${sectionStyle} text-align: center;">
              <div style="font-size: 2rem; font-weight: 700; color: var(--tn-green, #4caf50);">15d 4h</div>
              <div style="font-size: 0.8125rem; color: var(--tn-fg2); margin-top: 4px;">Uptime</div>
            </div>
            <div style="${sectionStyle} text-align: center;">
              <div style="font-size: 2rem; font-weight: 700; color: var(--tn-fg1);">45%</div>
              <div style="font-size: 0.8125rem; color: var(--tn-fg2); margin-top: 4px;">Memory Used</div>
            </div>
          </div>

          <div style="${sectionStyle}">
            <div style="font-weight: 600; color: var(--tn-fg1); margin-bottom: 16px;">Services</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-radius: 4px; background: var(--tn-bg2);">
                <span style="font-size: 0.875rem; color: var(--tn-fg1);">SMB</span>
                <span style="padding: 2px 8px; border-radius: 10px; background: rgba(76,175,80,0.15); color: var(--tn-green, #4caf50); font-size: 0.75rem; font-weight: 600;">Running</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-radius: 4px; background: var(--tn-bg2);">
                <span style="font-size: 0.875rem; color: var(--tn-fg1);">NFS</span>
                <span style="padding: 2px 8px; border-radius: 10px; background: rgba(76,175,80,0.15); color: var(--tn-green, #4caf50); font-size: 0.75rem; font-weight: 600;">Running</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-radius: 4px; background: var(--tn-bg2);">
                <span style="font-size: 0.875rem; color: var(--tn-fg1);">SSH</span>
                <span style="padding: 2px 8px; border-radius: 10px; background: rgba(76,175,80,0.15); color: var(--tn-green, #4caf50); font-size: 0.75rem; font-weight: 600;">Running</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-radius: 4px; background: var(--tn-bg2);">
                <span style="font-size: 0.875rem; color: var(--tn-fg1);">iSCSI</span>
                <span style="padding: 2px 8px; border-radius: 10px; background: rgba(108,117,125,0.15); color: var(--tn-fg2); font-size: 0.75rem; font-weight: 600;">Stopped</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-radius: 4px; background: var(--tn-bg2);">
                <span style="font-size: 0.875rem; color: var(--tn-fg1);">FTP</span>
                <span style="padding: 2px 8px; border-radius: 10px; background: rgba(108,117,125,0.15); color: var(--tn-fg2); font-size: 0.75rem; font-weight: 600;">Stopped</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-radius: 4px; background: var(--tn-bg2);">
                <span style="font-size: 0.875rem; color: var(--tn-fg1);">S3</span>
                <span style="padding: 2px 8px; border-radius: 10px; background: rgba(108,117,125,0.15); color: var(--tn-fg2); font-size: 0.75rem; font-weight: 600;">Stopped</span>
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div style="${sectionStyle}">
              <div style="font-weight: 600; color: var(--tn-fg1); margin-bottom: 12px;">Hardware</div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
                  <span style="color: var(--tn-fg2);">Platform</span>
                  <span style="color: var(--tn-fg1);">Supermicro X11</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
                  <span style="color: var(--tn-fg2);">CPU</span>
                  <span style="color: var(--tn-fg1);">Xeon E-2278G</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
                  <span style="color: var(--tn-fg2);">Cores</span>
                  <span style="color: var(--tn-fg1);">8C / 16T</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
                  <span style="color: var(--tn-fg2);">Memory</span>
                  <span style="color: var(--tn-fg1);">64 GB ECC</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
                  <span style="color: var(--tn-fg2);">Boot Device</span>
                  <span style="color: var(--tn-fg1);">NVMe 256 GB</span>
                </div>
              </div>
            </div>

            <div style="${sectionStyle}">
              <div style="font-weight: 600; color: var(--tn-fg1); margin-bottom: 12px;">Network</div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
                  <span style="color: var(--tn-fg2);">Hostname</span>
                  <span style="color: var(--tn-fg1);">truenas.local</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
                  <span style="color: var(--tn-fg2);">IPv4</span>
                  <span style="color: var(--tn-fg1);">192.168.1.100</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
                  <span style="color: var(--tn-fg2);">Gateway</span>
                  <span style="color: var(--tn-fg1);">192.168.1.1</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
                  <span style="color: var(--tn-fg2);">DNS</span>
                  <span style="color: var(--tn-fg1);">8.8.8.8</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
                  <span style="color: var(--tn-fg2);">Domain</span>
                  <span style="color: var(--tn-fg1);">local</span>
                </div>
              </div>
            </div>
          </div>

          <div style="${sectionStyle}">
            <div style="font-weight: 600; color: var(--tn-fg1); margin-bottom: 16px;">Recent Alerts</div>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div style="display: flex; gap: 12px; align-items: flex-start; padding: 10px; border-radius: 4px; background: var(--tn-bg2);">
                <span style="color: var(--tn-green, #4caf50); font-size: 1.1rem;">&#10003;</span>
                <div>
                  <div style="font-size: 0.875rem; color: var(--tn-fg1);">Scrub of pool "tank" completed</div>
                  <div style="font-size: 0.75rem; color: var(--tn-fg2);">2 days ago &middot; No errors found</div>
                </div>
              </div>
              <div style="display: flex; gap: 12px; align-items: flex-start; padding: 10px; border-radius: 4px; background: var(--tn-bg2);">
                <span style="color: var(--tn-yellow, #ffc107); font-size: 1.1rem;">&#9888;</span>
                <div>
                  <div style="font-size: 0.875rem; color: var(--tn-fg1);">Update available: TrueNAS 24.10.1</div>
                  <div style="font-size: 0.75rem; color: var(--tn-fg2);">5 days ago &middot; Security fixes included</div>
                </div>
              </div>
              <div style="display: flex; gap: 12px; align-items: flex-start; padding: 10px; border-radius: 4px; background: var(--tn-bg2);">
                <span style="color: var(--tn-green, #4caf50); font-size: 1.1rem;">&#10003;</span>
                <div>
                  <div style="font-size: 0.875rem; color: var(--tn-fg1);">Cloud sync to Backblaze B2 completed</div>
                  <div style="font-size: 0.75rem; color: var(--tn-fg2);">1 week ago &middot; 24.5 GiB transferred</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <tn-button tnSidePanelAction variant="outline" label="Close" (onClick)="isOpen = false" />
      </tn-side-panel>
    `,
  }),
};

export const ScrollableContent: Story = {
  decorators: tallCanvas,
  render: (args) => ({
    props: {
      ...args,
      isOpen: false,
    },
    moduleMetadata: {
      imports: [TnSidePanelComponent, TnSidePanelActionDirective, TnButtonComponent],
    },
    template: `
      <div style="padding: 32px;">
        <h2 style="margin: 0 0 8px 0; color: var(--tn-fg1);">Audit Log</h2>
        <p style="color: var(--tn-fg2); margin: 0 0 24px 0;">Demonstrates scroll behavior: the header and footer stay fixed while content scrolls.</p>
        <tn-button label="View Logs" color="primary" (onClick)="isOpen = true" />
      </div>

      <tn-side-panel [(open)]="isOpen" title="System Audit Log" [width]="width">
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${Array.from({ length: 30 }, (_, i) => {
            const actions = ['User login', 'Config changed', 'Service restarted', 'Share created', 'Snapshot taken', 'Pool scrub started', 'Disk replaced', 'Alert dismissed', 'Replication started', 'Permission updated'];
            const users = ['admin', 'root', 'system', 'jdoe', 'admin'];
            const severities = ['info', 'info', 'warning', 'info', 'info', 'info', 'warning', 'info', 'info', 'info'];
            const action = actions[i % actions.length];
            const user = users[i % users.length];
            const severity = severities[i % severities.length];
            const sevColor = severity === 'warning' ? 'var(--tn-yellow, #ffc107)' : 'var(--tn-fg2)';
            const hour = String(8 + (i % 14)).padStart(2, '0');
            const min = String((i * 7) % 60).padStart(2, '0');
            const day = String(15 - Math.floor(i / 3)).padStart(2, '0');
            return `
          <div style="padding: 12px 14px; border: 1px solid var(--tn-lines); border-radius: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <div style="font-weight: 600; color: var(--tn-fg1); font-size: 0.875rem;">${action}</div>
              <div style="font-size: 0.75rem; color: ${sevColor}; text-transform: uppercase; font-weight: 600;">${severity}</div>
            </div>
            <div style="font-size: 0.8125rem; color: var(--tn-fg2);">
              Performed by <strong style="color: var(--tn-fg1);">${user}</strong> &middot; 2024-01-${day} ${hour}:${min}:00
            </div>
          </div>`;
          }).join('')}
        </div>

        <tn-button tnSidePanelAction label="Export Logs" color="primary" />
        <tn-button tnSidePanelAction variant="outline" label="Close" (onClick)="isOpen = false" />
      </tn-side-panel>
    `,
  }),
};

export const ComponentHarness: Story = {
  tags: ['!dev'],
  parameters: {
    docs: {
      canvas: { hidden: true, sourceState: 'none' },
      description: { story: harnessDoc || '' },
    },
    controls: { disable: true },
  },
  render: () => ({ template: '' }),
};
