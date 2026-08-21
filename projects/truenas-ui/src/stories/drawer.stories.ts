import type { Meta, StoryObj } from '@storybook/angular';
import { expectOpeningMovesFocusInside } from './focus-capture';
import { TestIdInspectorComponent } from './testid-inspector.component';
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
    ariaLabel: {
      control: 'text',
      description:
        'Accessible name for the drawer panel. In `over` mode the panel is a modal dialog and '
        + 'must have one; in `side` mode it is a navigation landmark, which wants one as soon as '
        + 'a page has more than one. Falls back to "Drawer" with a dev-mode warning (#214).',
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
        <tn-drawer ariaLabel="Navigation" [mode]="'side'" [(opened)]="opened" [position]="position" width="240px">
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
        <tn-drawer ariaLabel="Navigation" [mode]="'over'" [(opened)]="isOpen" width="280px">
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

  /**
   * An `over` drawer is a modal dialog, so opening one must put focus inside it
   * (#227) — and this is the shape with nothing tabbable in it at all: the nav
   * entries are `<a>` elements with no `href`. It failed in CI against the
   * first version of the fix. `focus-capture.ts` holds the assertion, shared
   * with `tn-side-panel`, whose bug this component has now repeated for the
   * third time.
   *
   * Unlike the side panel, `role="dialog"` and `aria-modal` sit on the PANEL
   * here rather than on a wrapping overlay, so the panel is the dialog.
   */
  play: async ({ canvasElement }) => {
    await expectOpeningMovesFocusInside(canvasElement, 'Open Drawer', '.tn-drawer__panel--over');
  },
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
        <tn-drawer ariaLabel="Details" [mode]="'side'" [position]="'end'" [(opened)]="opened" width="240px">
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
        <tn-drawer ariaLabel="Navigation" [mode]="mode" [(opened)]="isOpen" width="240px">
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

/**
 * **Test IDs (default).** `tn-drawer` emits `drawer-<base>` on its panel (shown
 * here in inline `side` mode), under `data-testid` (default) / `data-test`.
 * `testId="nav"` → `drawer-nav`. In `over` mode the panel is portaled to
 * `document.body`. Table read live.
 */
export const TestIds: Story = {
  render: () => ({
    template: `
      <tn-testid-inspector>
        <tn-drawer-container style="height: 200px; border: 1px solid var(--tn-lines);">
          <tn-drawer mode="side" ariaLabel="Navigation" [opened]="true" testId="nav" width="220px">
            <p style="padding:12px;">Drawer content</p>
          </tn-drawer>
          <tn-drawer-content><p style="padding:12px;">Main content</p></tn-drawer-content>
        </tn-drawer-container>
      </tn-testid-inspector>
    `,
    moduleMetadata: { imports: [TnDrawerContainerComponent, TnDrawerComponent, TnDrawerContentComponent, TestIdInspectorComponent] },
  }),
};

/**
 * **Scoped test id.** An array base namespaces the id —
 * `[testId]="['settings','nav']"` → `drawer-settings-nav`.
 */
export const ScopedTestIds: Story = {
  render: () => ({
    template: `
      <tn-testid-inspector>
        <tn-drawer-container style="height: 200px; border: 1px solid var(--tn-lines);">
          <tn-drawer mode="side" ariaLabel="Navigation" [opened]="true" [testId]="['settings','nav']" width="220px">
            <p style="padding:12px;">Drawer content</p>
          </tn-drawer>
          <tn-drawer-content><p style="padding:12px;">Main content</p></tn-drawer-content>
        </tn-drawer-container>
      </tn-testid-inspector>
    `,
    moduleMetadata: { imports: [TnDrawerContainerComponent, TnDrawerComponent, TnDrawerContentComponent, TestIdInspectorComponent] },
  }),
};
